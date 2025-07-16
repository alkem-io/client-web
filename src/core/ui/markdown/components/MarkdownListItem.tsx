import createMarkdownComponent from './MarkdownComponent';
import { SxProps } from '@mui/material';
import type { Element } from 'hast';

const Base = createMarkdownComponent('li');

interface ReactMarkdownProps {
  sx?: SxProps;
  node?: Element;
}

const MarkdownListItem = (props: ReactMarkdownProps) => {
  // not sure when and what adds the `ordered` property but it results in
  //
  // hook.js:608 Warning: Received `true` for a non-boolean attribute `ordered`.
  // If you want to write it to the DOM, pass a string instead: ordered="true" or ordered={value.toString()}. Error Component Stack

  const newProps = { ...props };
  if (Object.hasOwn(newProps, 'ordered')) {
    delete newProps['ordered'];
  }

  return <Base sx={{ display: 'list-item' }} {...newProps} />;
};

export default MarkdownListItem;
