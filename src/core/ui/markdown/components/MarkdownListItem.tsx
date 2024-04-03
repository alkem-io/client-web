import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import createMarkdownComponent from './MarkdownComponent';

const Base = createMarkdownComponent('li');

const MarkdownListItem = (props: ReactMarkdownProps) => {
  return <Base sx={{ display: 'list-item' }} {...props} />;
};

export default MarkdownListItem;
