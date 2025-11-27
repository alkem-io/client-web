import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export interface FooterProps {
  copyright: string;
}

export const Footer: React.FC<FooterProps> = ({ copyright }) => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: theme => theme.palette.grey[200] }}>
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          {copyright}
        </Typography>
      </Container>
    </Box>
  );
};
