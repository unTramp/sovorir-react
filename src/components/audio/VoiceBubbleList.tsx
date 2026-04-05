import { audioMessages } from '../../data/audioMessages';
import { useLessonStore } from '../../stores/useLessonStore';
import { VoiceBubble } from './VoiceBubble';
import { VideoBubble } from './VideoBubble';

export function VoiceBubbleList() {
  const currentSection = useLessonStore((s) => s.currentSection);
  const filtered = audioMessages.filter((msg) => msg.page === currentSection);

  return (
    <div className="flex flex-col gap-5" style={{ paddingTop: 8 }}>
      {filtered.map((msg) =>
        msg.type === 'video' ? (
          <VideoBubble key={msg.id} message={msg} />
        ) : (
          <VoiceBubble key={msg.id} message={msg} />
        )
      )}
    </div>
  );
}
