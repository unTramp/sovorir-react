interface CharacterMessageProps {
  name: string;
  role?: string;
  text: string;
}

export function CharacterMessage({ name, role, text }: CharacterMessageProps) {
  const initial = (role || name).trim().charAt(0).toLocaleUpperCase('ru-RU');

  return (
    <div className="character-message-row">
      <div className="character-message">
        <span className="character-message__avatar" aria-hidden="true">{initial}</span>
        <span className="character-message__speaker">
          {name}{role ? ` · ${role}` : ''}
        </span>
        <span className="character-message__text" lang="hy">{text}</span>
      </div>
    </div>
  );
}

export function CharacterTyping({ name }: { name: string }) {
  return (
    <div className="character-typing-row">
      <div className="character-typing" aria-label={`${name} печатает`}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
