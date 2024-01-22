import WrapperMarkdown from './WrapperMarkdown';
import React from 'react';

interface OneLineMarkdownProps {
  children: string;
}

/**
 * A Markdown renderer that sets <p> margins to 0.
 * Suitable for replacing plain text fragments with Markdown without breaking the visual structure.
 * @param children
 * @constructor
 */
const OneLineMarkdown = ({ children }: OneLineMarkdownProps) => {
  return (
    <WrapperMarkdown plain card>
      {children}
    </WrapperMarkdown>
  );
};

export default OneLineMarkdown;
