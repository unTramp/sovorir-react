import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
  state?: 'default' | 'error';
  className?: string;
}

export function StudentBubble({
  children,
  label = 'Вы',
  state = 'default',
  className = '',
}: Props) {
  const classes = [
    'student-bubble',
    state === 'error' ? 'student-bubble--error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="student-bubble-wrap">
      <div className={classes}>
        <div className="student-bubble__name">{label}</div>
        <div className="student-bubble__content">{children}</div>
      </div>
    </div>
  );
}
