import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import MarkdownParagraph from './MarkdownParagraph';

const MarkdownListItem = ({ node, children, ...props }: ReactMarkdownProps) => {
  if (children && children.length === 1 && typeof children[0] === 'string') {
    return (
      <li {...props}>
        <MarkdownParagraph node={node} overrideDisableParagraphPadding>
          {children}
        </MarkdownParagraph>
      </li>
    );
  } else {
    return <li {...props}>{children}</li>;
  }
};

export default MarkdownListItem;
