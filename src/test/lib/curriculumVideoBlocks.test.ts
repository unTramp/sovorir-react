import { describe, expect, it } from 'vitest';
import { ContentBlockSchema } from '../../lib/curriculumApiSchemas';

describe('curriculum video blocks', () => {
  it('accepts circle, lesson and scene presentation variants', () => {
    for (const presentation of ['circle', 'lesson', 'scene'] as const) {
      const parsed = ContentBlockSchema.parse({
        type: 'video',
        presentation,
        senderName: 'Ани',
        text: 'Послушайте живую реплику.',
        videoSrc: 'https://example.com/mentor.mp4',
        thumbnail: 'https://example.com/poster.jpg',
        duration: 9,
        posterMode: 'image',
      });

      expect(parsed.type).toBe('video');
      if (parsed.type === 'video') expect(parsed.presentation).toBe(presentation);
    }
  });

  it('keeps legacy video blocks valid', () => {
    expect(() => ContentBlockSchema.parse({
      type: 'video',
      senderName: 'Ани',
      text: 'Старый блок',
      videoSrc: 'https://example.com/video.mp4',
      thumbnail: 'https://example.com/poster.jpg',
    })).not.toThrow();
  });

  it('requires an image when posterMode is image', () => {
    expect(() => ContentBlockSchema.parse({
      type: 'video',
      presentation: 'scene',
      videoSrc: 'https://example.com/scene.mp4',
      posterMode: 'image',
    })).toThrow();
  });

  it('rejects invalid caption timing', () => {
    expect(() => ContentBlockSchema.parse({
      type: 'video',
      presentation: 'lesson',
      videoSrc: 'https://example.com/video.mp4',
      captions: [{ startMs: 2000, endMs: 1000, text: 'Բարև' }],
    })).toThrow();
  });
});
