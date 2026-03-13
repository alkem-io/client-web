import { Box } from '@mui/material';
import type { Element } from 'hast';
import type { ElementType } from 'react';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

interface ReactMarkdownProps {
  node?: Element;
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
