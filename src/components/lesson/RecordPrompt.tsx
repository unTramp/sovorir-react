import { useState, useEffect, forwardRef } from 'react';
import type { RecordBlock } from '../../types/lessonContent';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { RecordingPlayback } from '../audio/RecordingPlayback';

interface Props {
  block: RecordBlock;
  onSkip?: () => void;
  completed?: boolean;
  pageId?: number;
  recordIndex?: number;
}

export const RecordPrompt = forwardRef<HTMLDivElement, Props>(
  ({ block, onSkip, completed, pageId, recordIndex }, ref) => {
    const colonIdx = block.prompt.indexOf(':');
    const label = colonIdx !== -1 ? block.prompt.slice(0, colonIdx).trim() : 'Произнесите';
    const phrase = colonIdx !== -1 ? block.prompt.slice(colonIdx + 1).trim() : block.prompt;

    const getRecordingForPrompt = useRecordingStore((s) => s.getRecordingForPrompt);
    const getRecordingUrl = useRecordingStore((s) => s.getRecordingUrl);
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    useEffect(() => {
      if (!completed || pageId == null || recordIndex == null) return;
      const rec = getRecordingForPrompt(pageId, recordIndex);
      if (!rec) return;
      setPlaybackDuration(rec.duration);
      getRecordingUrl(rec.id).then((url) => {
        if (url) setPlaybackUrl(url);
      });
      return () => { if (playbackUrl) URL.revokeObjectURL(playbackUrl); };
    }, [completed, pageId, recordIndex]);

    return (
      <div ref={ref} className={`lesson-record-prompt ${completed ? 'lesson-record-prompt--done' : ''}`}>
        <div className="lesson-record-prompt__body">
          <div className="lesson-record-prompt__label">{completed ? '✓' : '🎤'} {label}</div>
          <div className="lesson-record-prompt__phrase" lang="hy">{phrase}</div>
          {completed && playbackUrl && (
            <div className="mt-2">
              <RecordingPlayback audioUrl={playbackUrl} duration={playbackDuration} />
            </div>
          )}
        </div>
        {onSkip && (
          <button className="lesson-record-prompt__skip" onClick={onSkip}>
            Пропустить
          </button>
        )}
      </div>
    );
  },
);
