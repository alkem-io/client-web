import { Box } from '@mui/material';
import type { FC, ReactNode } from 'react';

export interface PublicWhiteboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for public whiteboard page
 * Provides zero application chrome - just the content
 */
const PublicWhiteboardLayout: FC<PublicWhiteboardLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {children}
    </Box>
  );
};

export default PublicWhiteboardLayout;
