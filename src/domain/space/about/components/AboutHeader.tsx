import { gutters } from '@/core/ui/grid/utils';
import { Box, IconButton, Theme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import { PageTitle, Tagline } from '@/core/ui/typography';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

export interface AboutHeaderProps {
  title?: string;
  tagline?: string;
  startIcon?: ReactNode;
  loading?: boolean;
  onClose?: () => void;
}

const AboutHeader = ({ title, tagline, loading = false, startIcon, onClose }: AboutHeaderProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const onCloseClick = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(`/${TopLevelRoutePath.Home}`);
    }
  };

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
            <Box sx={{ position: 'absolute', top: gutters(0.5), right: gutters(0.5) }}>
              <IconButton onClick={onCloseClick} aria-label={t('buttons.close')}>
                <Close />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AboutHeader;
