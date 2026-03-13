import { audioMessages } from '../../data/audioMessages';
import { VoiceBubble } from './VoiceBubble';
import { VideoBubble } from './VideoBubble';

export function VoiceBubbleList() {
  return (
    <div className="flex flex-col gap-4" style={{ paddingTop: 8 }}>
      {audioMessages.map((msg) =>
        msg.type === 'video' ? (
          <VideoBubble key={msg.id} message={msg} />
        ) : (
          <VoiceBubble key={msg.id} message={msg} />
        )
      )}
    </div>
  );
}
