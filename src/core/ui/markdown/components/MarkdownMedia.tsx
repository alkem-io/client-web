import { ElementType } from 'react';
import { Box, SxProps } from '@mui/material';
import { useMarkdownOptions } from '../MarkdownOptionsContext';

interface ReactMarkdownProps {
  sx?: SxProps;
  node?: {
    tagName?: ElementType;
  }
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
