import React, { useMemo } from 'react';
import NotificationView from '@/core/ui/notifications/NotificationView';
import { Box, Link, SnackbarContent, useTheme } from '@mui/material';
import { rem } from '@/core/ui/typography/utils';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useSpace } from '@/domain/space/context/useSpace';
import { useTranslation } from 'react-i18next';

type SpaceVisibilityNoticeProps = {
  spaceLevel?: SpaceLevel;
};

export const SpaceVisibilityNotice = ({ spaceLevel }: SpaceVisibilityNoticeProps) => {
  const { locations } = useConfig();
  const { isSmallScreen } = useScreenSize();
  const theme = useTheme();
  const { t } = useTranslation();
  const origin = usePlatformOrigin();
  const { visibility } = useSpace();

  const tLinks = TranslateWithElements(
    <Link
      underline="always"
      target="_self"
      rel="noopener noreferrer"
      sx={{ color: theme.palette.background.default, ':hover': { color: theme.palette.background.default } }}
    />
  );

  const message = useMemo(() => {
    if (spaceLevel === SpaceLevel.L0) {
      if (visibility === SpaceVisibility.Archived) {
        return tLinks('pages.generic.archivedNotice.archivedSpace', {
          contact: { href: locations?.feedback },
        });
      }
      if (visibility === SpaceVisibility.Demo) {
        return tLinks('pages.generic.demoNotice.demoSpace', {
          alkemio: { href: origin },
        });
      }
    }

    if (visibility === SpaceVisibility.Archived) {
      return tLinks(
        'pages.generic.archivedNotice.archivedSubspace',
        {
          contact: { href: locations?.feedback },
        },
        { space: t(`common.space-level.${spaceLevel || SpaceLevel.L0}`) }
      );
    }
    if (visibility === SpaceVisibility.Demo) {
      return tLinks(
        'pages.generic.demoNotice.demoSubspace',
        {
          alkemio: { href: origin },
        },
        { space: t(`common.space-level.${spaceLevel || SpaceLevel.L0}`) }
      );
    }

    return null;
  }, [visibility, spaceLevel, tLinks, locations?.feedback, origin]);

  if (!visibility || visibility === SpaceVisibility.Active) return null;
  if (!message || !spaceLevel) return null;

  return (
    <NotificationView
      open
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
      }}
      autoHideDuration={null}
      anchorOrigin={{ vertical: isSmallScreen ? 'bottom' : 'top', horizontal: 'center' }}
      sx={{ marginBottom: isSmallScreen ? '80px' : 0 }}
    >
      <SnackbarContent
        message={<Box>{message}</Box>}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontSize: rem(15),
        }}
      />
    </NotificationView>
  );
};
