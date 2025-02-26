import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';
import { PageTitle, Tagline } from '@/core/ui/typography';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import Loading from '@/core/ui/loading/Loading';
import { SpaceAboutDetailsModel } from '../model/spaceAboutFull.model';

export interface AboutHeaderProps {
  about?: SpaceAboutDetailsModel | undefined;
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

const AboutHeader = ({ about, loading = false, endButton, startIcon }: AboutHeaderProps) => {
  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

  const aboutProfile = about?.profile;

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
          <PageTitle paddingY={gutters(0.5)}>{aboutProfile?.displayName}</PageTitle>
        </DialogHeaderItem>
        <DialogHeaderItem minWidth="30%" align="end">
          {endButton}
        </DialogHeaderItem>
      </Box>
      <Tagline textAlign="center">{about?.profile.tagline}</Tagline>
    </Box>
  );
};

export default AboutHeader;
