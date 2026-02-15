import { audioMessages } from '../../data/audioMessages';
import { VoiceBubble } from './VoiceBubble';

export function VoiceBubbleList() {
  return (
    <div className="flex flex-col gap-4" style={{ paddingTop: 8 }}>
      {audioMessages.map((msg) => (
        <VoiceBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
