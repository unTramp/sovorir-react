import { StudentProfile } from './StudentProfile';
import { VoiceBubbleList } from './VoiceBubbleList';
import { RecordButton } from './RecordButton';

export function AudioPanel() {
  return (
    <aside
      className="hidden lg:flex bg-content border-l border-border flex-col flex-shrink-0 h-full min-h-0"
      style={{ width: 300 }}
    >
      <StudentProfile />
      <div className="flex-1 overflow-y-auto p-3 bg-content min-h-0">
        <VoiceBubbleList />
      </div>
      <RecordButton />
    </aside>
  );
}
