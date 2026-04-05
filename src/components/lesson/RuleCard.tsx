import type { RuleBlock } from '../../types/lessonContent';

interface Props {
  block: RuleBlock;
}

export function RuleCard({ block }: Props) {
  return (
    <div className="lesson-rule">
      <div className="lesson-rule__title">{block.title}</div>
      <ul className="lesson-rule__list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
