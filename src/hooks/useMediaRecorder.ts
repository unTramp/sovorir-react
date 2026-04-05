import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMediaRecorderResult {
  start: () => Promise<void>;
  stop: () => void;
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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const durationRafRef = useRef(0);

  const updateLevel = useCallback(() => {
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

  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
    durationRafRef.current = requestAnimationFrame(updateDuration);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioBlob(blob);
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      rafRef.current = requestAnimationFrame(updateLevel);
      durationRafRef.current = requestAnimationFrame(updateDuration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, [updateLevel, updateDuration]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(durationRafRef.current);

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(durationRafRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { start, stop, isRecording, audioBlob, audioLevel, error, duration };
}
