import type { ReactNode } from 'react';

interface Props {
  name?: string;
  text?: ReactNode;
  children?: ReactNode;
}

export function TeacherBubble({ name = 'Лусине', text, children }: Props) {
  return (
    <div className="flex justify-start">
      <div className="voice-bubble voice-bubble--teacher">
        <img
          src="/assets/teacher-avatar.png"
          className="voice-bubble__teacher-img"
          alt="Лусине"
        />
        <div className="voice-bubble__name">{name}</div>
        {text != null && <div className="voice-bubble__text">{text}</div>}
        {children}
      </div>
    </div>
  );
}
