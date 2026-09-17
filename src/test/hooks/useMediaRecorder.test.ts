import { describe, expect, it } from 'vitest';
import { getSupportedRecordingMimeType } from '../../hooks/useMediaRecorder';

describe('getSupportedRecordingMimeType', () => {
  it('chooses the first codec supported by the current browser', () => {
    const Recorder = {
      isTypeSupported: (mimeType: string) => mimeType === 'audio/mp4',
    } as Pick<typeof MediaRecorder, 'isTypeSupported'>;
    expect(getSupportedRecordingMimeType(Recorder)).toBe('audio/mp4');
  });

  it('allows the browser to select a default when capability detection is unavailable', () => {
    expect(getSupportedRecordingMimeType(undefined)).toBeUndefined();
  });
});
