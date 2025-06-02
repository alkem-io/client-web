import { ElementType } from 'react';
import { Box } from '@mui/material';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

interface ReactMarkdownProps {
  node?: {
    tagName?: ElementType;
  };
}

const MarkdownMedia = ({ node, ...props }: ReactMarkdownProps) => {
  const { multiline } = useMarkdownOptions();

  return (
    <Box
      component={node?.tagName as ElementType}
      maxWidth="100%"
      maxHeight={multiline ? undefined : '1em'}
      borderRadius={theme => theme.spacing(0.6)}
      {...props}
    />
  );
};

export default MarkdownMedia;
