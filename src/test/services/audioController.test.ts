import { beforeEach, describe, expect, it, vi } from 'vitest';

const audioMocks = vi.hoisted(() => ({
  instances: [] as Array<{
    source: string;
    playing: boolean;
    stopCalls: number;
    unloadCalls: number;
  }>,
}));

vi.mock('howler', () => ({
  Howl: class {
    private readonly state: (typeof audioMocks.instances)[number];
    private readonly options: Record<string, (() => void) | string[] | boolean | number>;

    constructor(options: Record<string, (() => void) | string[] | boolean | number>) {
      this.options = options;
      this.state = { source: (options.src as string[])[0], playing: false, stopCalls: 0, unloadCalls: 0 };
      audioMocks.instances.push(this.state);
    }

    play() { this.state.playing = true; (this.options.onplay as (() => void) | undefined)?.(); return 1; }
    pause() { this.state.playing = false; }
    stop() { this.state.playing = false; this.state.stopCalls += 1; (this.options.onstop as (() => void) | undefined)?.(); }
    unload() { this.state.unloadCalls += 1; }
    playing() { return this.state.playing; }
    duration() { return 10; }
    seek() { return 0; }
    rate() { return this; }
    loop() { return this; }
  },
}));

import { AudioController } from '../../services/audioController';
import { useAudioStore } from '../../stores/useAudioStore';

beforeEach(() => {
  audioMocks.instances.length = 0;
  useAudioStore.setState({ playingId: null, loadingId: null, errorId: null, progress: {} });
});

describe('AudioController', () => {
  it('stops the previous source before playing another source', () => {
    const controller = new AudioController();
    controller.play('mentor', '/audio/mentor.mp3', 10);
    controller.play('student-recording', 'blob:student-recording', 4);

    expect(audioMocks.instances).toHaveLength(2);
    expect(audioMocks.instances[0]).toMatchObject({ source: '/audio/mentor.mp3', playing: false, stopCalls: 1 });
    expect(audioMocks.instances[1]).toMatchObject({ source: 'blob:student-recording', playing: true });
    expect(useAudioStore.getState().playingId).toBe('student-recording');
    controller.stopAll();
  });

  it('releases temporary recording sources from the cache', () => {
    const controller = new AudioController();
    controller.play('recording', 'blob:recording', 3);
    controller.release('recording');

    expect(audioMocks.instances[0].unloadCalls).toBe(1);
    expect(useAudioStore.getState().playingId).toBeNull();
  });
});
