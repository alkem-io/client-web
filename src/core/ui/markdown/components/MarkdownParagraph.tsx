import type { SxProps } from '@mui/material';
import type { Element } from 'hast';
import { useMarkdownOptions } from '../MarkdownOptionsContext';
import createMarkdownComponent from './MarkdownComponent';

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
