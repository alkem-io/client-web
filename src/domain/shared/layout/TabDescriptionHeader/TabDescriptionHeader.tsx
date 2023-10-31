import React, { FC, ReactNode } from 'react';
import { Caption } from '../../../../core/ui/typography';

const splitIntoLines = (text: ReactNode, namespace?: string) => {
  if (Array.isArray(text)) {
    return text.map((item, i) => splitIntoLines(item, namespace ? `${namespace}.${i}` : `${i}`));
  }
  const lines = typeof text === 'string' ? text.split('\n') : [text];
  if (lines.length > 1) {
    return splitIntoLines(lines, namespace);
  }
  return <Caption key={namespace}>{lines[0]}</Caption>;
};

const TabDescriptionHeader: FC = ({ children }) => {
  return <>{splitIntoLines(children)}</>;
};

export default TabDescriptionHeader;
