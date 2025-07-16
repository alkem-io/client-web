import { useMarkdownOptions } from '../MarkdownOptionsContext';
import createMarkdownComponent from './MarkdownComponent';
import { SxProps } from '@mui/material';
import type { Element } from 'hast';

const Base = createMarkdownComponent('p');

interface ReactMarkdownProps {
  sx?: SxProps;
  node?: Element;
}

const MarkdownParagraph = (props: ReactMarkdownProps) => {
  const { plain } = useMarkdownOptions();

  return <Base {...props} sx={{ display: plain ? 'inline' : undefined }} />;
};

export default MarkdownParagraph;
