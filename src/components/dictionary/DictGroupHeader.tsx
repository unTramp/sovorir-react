interface Props {
  category: string;
}

export function DictGroupHeader({ category }: Props) {
  return <div className="dict-group-header">{category}</div>;
}
