import { gutters } from '@/core/ui/grid/utils';
import { Box, Theme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import { PageTitle, Tagline } from '@/core/ui/typography';

export interface AboutHeaderProps {
  title?: string;
  tagline?: string;
  startIcon?: ReactNode;
  endButton?: ReactNode;
  loading?: boolean;
}

const AboutHeader = ({ title, tagline, endButton, loading = false, startIcon }: AboutHeaderProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <Box padding={gutters()}>
      <Box
        display="flex"
        gap={gutters()}
        rowGap={gutters(0.5)}
        alignItems="start"
        flexWrap={isMobile ? 'wrap' : 'nowrap'}
      >
        {!loading && (
          <>
            <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
              <Box display="flex" alignItems="center" sx={{ gap: startIcon ? gutters(0.5) : 0 }}>
                <Box>{startIcon}</Box>
                <PageTitle paddingY={gutters(0.5)}>{title}</PageTitle>
              </Box>
              <Tagline textAlign="center">{tagline}</Tagline>
            </Box>
            <Box sx={{ position: 'absolute', top: gutters(0.5), right: gutters(0.5) }}>{endButton}</Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AboutHeader;
