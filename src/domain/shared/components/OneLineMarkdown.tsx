import { Box } from '@mui/material';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import React from 'react';

interface OneLineMarkdownProps {
  children: string;
}

/**
 * A Markdown renderer that sets <p> margins to 0.
 * Suitable for replacing plain text fragments with Markdown without breaking the visual structure.
 * @param children
 * @constructor
 */
const OneLineMarkdown = ({ children }: OneLineMarkdownProps) => {
  return (
    <Box sx={{ '& p': { my: 0 } }}>
      <WrapperMarkdown>{children}</WrapperMarkdown>
    </Box>
  );
};

export default OneLineMarkdown;
