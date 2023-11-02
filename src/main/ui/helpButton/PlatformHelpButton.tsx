import React, { useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import HelpDialog from '../../../core/help/dialog/HelpDialog';
import { IconButton } from '@mui/material';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { useUserContext } from '../../../domain/community/user';
import { AuthorizationPrivilege, PlatformFeatureFlagName } from '../../../core/apollo/generated/graphql-schema';
import { useFullscreen } from '../../../core/ui/fullscreen/useFullscreen';
import ChatWidget from '../../guidance/chatWidget/ChatWidget';

const PlatformHelpButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  const { fullscreen } = useFullscreen();
  const { isFeatureEnabled } = useConfig();
  const isGuidanceEnabled = isFeatureEnabled(PlatformFeatureFlagName.GuidenceEngine);
  const { user: currentUser } = useUserContext();
  const shouldDisplayChatWidget =
    !fullscreen && // Never show the widget when there's something in fullscreen
    currentUser?.hasPlatformPrivilege(AuthorizationPrivilege.AccessInteractiveGuidance) &&
    isGuidanceEnabled;

  return (
    <>
      {shouldDisplayChatWidget ? (
        <ChatWidget />
      ) : (
        <IconButton onClick={openHelpDialog}>
          <HelpIcon color="primary" fontSize="large" sx={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));' }} />
        </IconButton>
      )}
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformHelpButton;
