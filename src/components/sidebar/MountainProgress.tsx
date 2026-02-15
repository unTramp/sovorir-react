import { lessons } from '../../data/lessons';
import type { SectionStatus } from '../../types/lesson';

type CheckpointState = 'completed' | 'in-progress' | 'pending' | 'locked';

function getCheckpointState(status?: SectionStatus): CheckpointState {
  if (!status) return 'locked';
  if (status === 'completed') return 'completed';
  if (status === 'current' || status === 'in-progress') return 'in-progress';
  if (status === 'pending') return 'pending';
  return 'locked';
}

export function MountainProgress() {
  const currentLesson = lessons.find((l) => l.status === 'current') || lessons[0];
  const sections = currentLesson.sections.filter((s) => s.type !== 'video');

  const checkpointStates: CheckpointState[] = sections.map((s) =>
    getCheckpointState(s.status),
  );

  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {checkpointStates.map((state, i) => (
        <div key={i} className="flex flex-col items-center">
          {/* Connector line above (not for first) */}
          {i > 0 && (
            <div
              className="w-[3px] h-5 rounded-full"
              style={{
                backgroundColor:
                  state === 'completed' || checkpointStates[i - 1] === 'completed'
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
                opacity:
                  state === 'completed' || checkpointStates[i - 1] === 'completed'
                    ? 0.7
                    : 0.25,
              }}
            />
          )}

          {/* Checkpoint circle */}
          <div
            className={`relative flex items-center justify-center rounded-full ${
              state === 'in-progress' ? 'checkpoint-active' : ''
            }`}
            style={{
              width: state === 'pending' || state === 'locked' ? 28 : 32,
              height: state === 'pending' || state === 'locked' ? 28 : 32,
              backgroundColor:
                state === 'completed'
                  ? '#4CAF50'
                  : state === 'in-progress'
                    ? 'var(--color-primary)'
                    : 'transparent',
              border:
                state === 'pending' || state === 'locked'
                  ? '2px solid var(--color-text-muted)'
                  : 'none',
              opacity: state === 'locked' ? 0.3 : state === 'pending' ? 0.5 : 1,
            }}
          >
            {state === 'completed' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7 L5.5 10 L11.5 4"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
