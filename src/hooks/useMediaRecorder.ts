import { useState, useRef, useCallback, useEffect } from 'react';
import { audioController } from '../services/audioController';

export const RECORDING_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
  'audio/ogg;codecs=opus',
] as const;

const MAX_RECORDING_DURATION_MS = 60_000;
const MAX_RECORDING_BYTES = 5 * 1024 * 1024;

export function getSupportedRecordingMimeType(
  Recorder: Pick<typeof MediaRecorder, 'isTypeSupported'> | undefined = typeof MediaRecorder === 'undefined' ? undefined : MediaRecorder,
): string | undefined {
  if (!Recorder || typeof Recorder.isTypeSupported !== 'function') return undefined;
  return RECORDING_MIME_CANDIDATES.find((mimeType) => Recorder.isTypeSupported(mimeType));
}

interface UseMediaRecorderResult {
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  isRecording: boolean;
  audioBlob: Blob | null;
  audioLevel: number;
  error: string | null;
  duration: number;
}

export function useMediaRecorder(): UseMediaRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const durationRafRef = useRef(0);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bytesRef = useRef(0);

  const updateLevel = useCallback(function updateLevel() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setAudioLevel(Math.min(1, rms * 3));
    rafRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const updateDuration = useCallback(function updateDuration() {
    if (startTimeRef.current) {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
    durationRafRef.current = requestAnimationFrame(updateDuration);
  }, []);

  const cleanupCapture = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(durationRafRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
    maxDurationTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    cleanupCapture();
  }, [cleanupCapture]);

  const start = useCallback(async () => {
    try {
      if (mediaRecorderRef.current?.state === 'recording') return;
      audioController.stopAll();
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];
      bytesRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextConstructor = window.AudioContext
        || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) throw new Error('Запись аудио не поддерживается этим браузером.');
      const audioCtx = new AudioContextConstructor();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 128_000 } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size <= 0) return;
        bytesRef.current += e.data.size;
        if (bytesRef.current > MAX_RECORDING_BYTES) {
          setError('Запись слишком длинная. Попробуйте ещё раз и скажите фразу короче.');
          stop();
          return;
        }
        chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioBlob(blob);
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      };

      recorder.onerror = () => {
        setError('Не удалось записать голос. Попробуйте ещё раз.');
        cleanupCapture();
      };

      recorder.start(250);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      rafRef.current = requestAnimationFrame(updateLevel);
      durationRafRef.current = requestAnimationFrame(updateDuration);
      maxDurationTimerRef.current = setTimeout(stop, MAX_RECORDING_DURATION_MS);
    } catch (err) {
      cleanupCapture();
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Разрешите доступ к микрофону в настройках браузера.');
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось получить доступ к микрофону.');
      }
    }
  }, [cleanupCapture, stop, updateLevel, updateDuration]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(durationRafRef.current);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void audioContextRef.current?.close();
    };
  }, []);

  return { start, stop, reset, isRecording, audioBlob, audioLevel, error, duration };
}
