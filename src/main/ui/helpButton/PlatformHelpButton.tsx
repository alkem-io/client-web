import { useState, Suspense } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import { IconButton } from '@mui/material';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { AuthorizationPrivilege, PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const ChatWidget = lazyWithGlobalErrorHandler(() => import('@/main/guidance/chatWidget/ChatWidget'));

const PlatformHelpButton = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  const { fullscreen } = useFullscreen();
  const { isFeatureEnabled } = useConfig();
  const isGuidanceEnabled = isFeatureEnabled(PlatformFeatureFlagName.GuidenceEngine);
  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();
  const shouldDisplayChatWidget =
    !fullscreen && // Never show the widget when there's something in fullscreen
    userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.AccessInteractiveGuidance) &&
    isGuidanceEnabled;

  return (
    <>
      {shouldDisplayChatWidget ? (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      ) : (
        <IconButton onClick={openHelpDialog} aria-label={t('common.help')}>
          <HelpIcon color="primary" fontSize="large" sx={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));' }} />
        </IconButton>
      )}
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformHelpButton;
