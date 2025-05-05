import { useMarkdownOptions } from '../MarkdownOptionsContext';
import createMarkdownComponent from './MarkdownComponent';
import { SxProps } from '@mui/material';
import { ReactNode } from 'react';

const Base = createMarkdownComponent('p');

interface ReactMarkdownProps {
  sx?: SxProps;
  node?: ReactNode;
}

const MarkdownParagraph = (props: ReactMarkdownProps) => {
  const { plain } = useMarkdownOptions();

  return <Base {...props} sx={{ display: plain ? 'inline' : undefined }} />;
};

export default MarkdownParagraph;
