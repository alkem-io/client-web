import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';

const MarkdownList = ({ node, ...props }: ReactMarkdownProps) => {
  return <ul {...props} />;
};

export default MarkdownList;
