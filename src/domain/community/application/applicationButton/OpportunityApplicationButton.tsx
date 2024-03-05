import { Button as MuiButton, CircularProgress } from '@mui/material';
import React, { forwardRef, Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import { AddOutlined } from '@mui/icons-material';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';

export interface OpportunityApplicationButtonProps {
  isAuthenticated?: boolean;
  isMember: boolean;
  isParentMember?: boolean;
  parentUrl?: string;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  leadUsers: {
    id: string;
    displayName?: string;
    city?: string;
    country?: string;
    avatarUri?: string;
  }[];
  loading: boolean;
  component?: typeof MuiButton;
  extended?: boolean;
}

export const OpportunityApplicationButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  OpportunityApplicationButtonProps
>(
  (
    {
      isAuthenticated,
      isMember = false,
      isParentMember = false,
      parentUrl,
      sendMessageToCommunityLeads,
      leadUsers,
      loading = false,
      component: Button = MuiButton,
      extended = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);
    const openContactLeadsDialog = () => {
      setIsContactLeadUsersDialogOpen(true);
    };
    const closeContactLeadsDialog = () => {
      setIsContactLeadUsersDialogOpen(false);
    };

    const renderApplicationButton = () => {
      if (loading) {
        return <Button ref={ref as Ref<HTMLButtonElement>} disabled startIcon={<CircularProgress size={24} />} />;
      }

      if (!isAuthenticated) {
        return (
          <Button
            ref={ref as Ref<HTMLAnchorElement>}
            variant="contained"
            component={RouterLink}
            to={buildLoginUrl(parentUrl)}
          >
            {t('components.application-button.apply-not-signed')}
          </Button>
        );
      }

      if (isMember) {
        return null;
      }

      if (!isParentMember) {
        return (
          parentUrl && (
            <Button
              ref={ref as Ref<HTMLAnchorElement>}
              component={RouterLink}
              startIcon={<AddOutlined />}
              to={parentUrl}
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              {t(`components.application-button.joinChallengeFirst.${extended ? 'full' : 'short'}` as const)}
            </Button>
          )
        );
      }

      if (leadUsers.length === 0) {
        return null;
      }

      return (
        <>
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            startIcon={extended ? <AddOutlined /> : undefined}
            onClick={openContactLeadsDialog}
            variant="contained"
            sx={extended ? { textTransform: 'none' } : undefined}
          >
            {t(`components.application-button.contactOpportunityLeads.${extended ? 'full' : 'short'}` as const)}
          </Button>
          <DirectMessageDialog
            title={t('send-message-dialog.community-message-title', { contact: t('community.leads') })}
            open={isContactLeadUsersDialogOpen}
            onClose={closeContactLeadsDialog}
            onSendMessage={sendMessageToCommunityLeads}
            messageReceivers={leadUsers}
          />
        </>
      );
    };

    return <>{renderApplicationButton()}</>;
  }
);

export default OpportunityApplicationButton;
