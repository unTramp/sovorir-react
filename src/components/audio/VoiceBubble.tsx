import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { WaveformBars } from './WaveformBars';
import { PlayIcon, PauseIcon } from '../../icons';
import { formatDuration } from '../../lib/formatDuration';
import type { AudioMessage } from '../../types/audio';

interface Props {
  message: AudioMessage;
}

export function VoiceBubble({ message }: Props) {
  const { togglePlay, playingId } = useAudioPlayer();
  const progress = useAudioStore((s) => s.progress[message.id] || 0);
  const isPlaying = playingId === message.id;
  const isTeacher = message.sender === 'teacher';

  const remaining = isPlaying
    ? Math.max(0, Math.ceil(message.duration * (1 - progress)))
    : message.duration;

  return (
    <div className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`voice-bubble ${
          isTeacher ? 'voice-bubble--teacher' : 'voice-bubble--student'
        }`}
      >
        {isTeacher && (
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt="Лусине"
          />
        )}
        <div className="voice-bubble__name">{message.senderName}</div>
        {isTeacher && <div className="voice-bubble__text">{message.text}</div>}
        <div className="voice-bubble__player">
          <button
            className="voice-bubble__play"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            onClick={() => togglePlay(message.id, message.src)}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <WaveformBars
            messageId={message.id}
            progress={progress}
            isTeacher={isTeacher}
          />
          <span className="voice-bubble__duration">
            {formatDuration(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
