import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { useMarkdownOptions } from '../MarkdownOptionsContext';
import createMarkdownComponent from './MarkdownComponent';

const Base = createMarkdownComponent('p');

const MarkdownParagraph = (props: ReactMarkdownProps) => {
  const { plain } = useMarkdownOptions();

  return <Base {...props} sx={{ display: plain ? 'inline' : undefined }} />;
};

export default MarkdownParagraph;
