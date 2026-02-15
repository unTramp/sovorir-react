import { VoiceBubbleList } from '../audio/VoiceBubbleList';
import { SpeedToggle } from '../audio/SpeedToggle';

export function AudioMobileView() {
  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-rightpanel border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Аудио сообщения</span>
        <SpeedToggle />
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-rightpanel no-scrollbar">
        <VoiceBubbleList />
      </div>
    </div>
  );
}
