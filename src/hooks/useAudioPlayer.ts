import { useCallback, useEffect } from 'react';
import { audioController } from '../services/audioController';
import { useAudioStore } from '../stores/useAudioStore';

export function useAudioPlayer() {
  const playingId = useAudioStore((state) => state.playingId);
  const loadingId = useAudioStore((state) => state.loadingId);
  const errorId = useAudioStore((state) => state.errorId);
  const playbackRate = useAudioStore((state) => state.playbackRate);
  const isLooping = useAudioStore((state) => state.isLooping);

  useEffect(() => audioController.setPlaybackRate(playbackRate), [playbackRate]);
  useEffect(() => audioController.setLoop(isLooping), [isLooping]);

  const togglePlay = useCallback((id: string, src: string, duration?: number) => {
    audioController.toggle(id, src, duration);
  }, []);
  const stopAll = useCallback(() => audioController.stopAll(), []);
  const release = useCallback((id: string) => audioController.release(id), []);

  return { togglePlay, stopAll, release, playingId, loadingId, errorId };
}
