import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps, Theme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import { PageTitle, Tagline } from '@/core/ui/typography';
import Loading from '@/core/ui/loading/Loading';

export interface AboutHeaderProps {
  title?: string;
  tagline?: string;
  startIcon?: ReactNode;
  endButton?: ReactNode;
  loading?: boolean;
}

interface DialogHeaderItemProps extends BoxProps {
  align?: 'start' | 'end' | 'center';
}

const DialogHeaderItem = ({ align = 'center', ...props }: DialogHeaderItemProps) => {
  return <Box {...props} flexGrow={1} display="flex" justifyContent={align} alignItems="center" gap={gutters()} />;
};

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
        {loading && (
          <Box position="absolute">
            <Loading text="" />
          </Box>
        )}
        <DialogHeaderItem minWidth="30%" align="start">
          {startIcon}
        </DialogHeaderItem>
        <DialogHeaderItem order={isMobile ? 1 : 0}>
          <PageTitle paddingY={gutters(0.5)}>{title}</PageTitle>
        </DialogHeaderItem>
        <DialogHeaderItem minWidth="30%" align="end">
          {endButton}
        </DialogHeaderItem>
      </Box>
      <Tagline textAlign="center">{tagline}</Tagline>
    </Box>
  );
};

export default AboutHeader;
