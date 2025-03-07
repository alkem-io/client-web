import { Box, Typography } from '@mui/material';
import { FC, PropsWithChildren, ReactNode } from 'react';

interface SectionHeaderProps extends PropsWithChildren {
  text: ReactNode;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, children }) => {
  return (
    <Box
      display="flex"
      alignItems="start"
      flexWrap={{ xs: 'wrap', sm: 'wrap', md: 'nowrap' }}
      gap={2}
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center" flexGrow={1} flexShrink={1} flexBasis={{ xl: 0 }}>
        <Typography variant="h4" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
          {text}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

export default SectionHeader;
