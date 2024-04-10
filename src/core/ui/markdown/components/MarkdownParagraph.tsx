import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import createMarkdownComponent from './MarkdownComponent';

const Base = createMarkdownComponent('p');

const MarkdownParagraph = (props: ReactMarkdownProps) => {
  return <Base {...props} />;
};

export default MarkdownParagraph;
