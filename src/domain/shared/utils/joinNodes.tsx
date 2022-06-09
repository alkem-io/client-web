import { ComponentType, ReactNode } from 'react';

const joinNodes = (nodes: ReactNode[], Separator: ComponentType) => {
  if (nodes.length < 2) {
    return nodes;
  }

  return nodes.reduce<ReactNode[]>(
    (joined, node, i) => {
      joined.push(<Separator key={`__separator_${i}`} />, node);
      return joined;
    },
    [nodes[0]]
  );
};

const mapWithSeparator = <Item,>(
  items: Item[],
  Separator: ComponentType,
  callback: (item: Item, i: number) => ReactNode
) => joinNodes(items.map(callback), Separator);

export { joinNodes, mapWithSeparator };
