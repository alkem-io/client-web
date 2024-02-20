import { Button as MuiButton, CircularProgress } from '@mui/material';
import React, { forwardRef, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import { AddOutlined } from '@mui/icons-material';
import RootThemeProvider from '../../../../core/ui/themes/RootThemeProvider';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';

export interface OpportunityApplicationButtonProps {
  isAuthenticated?: boolean;
  isMember: boolean;
  isParentMember?: boolean;
  parentUrl?: string;
  leadUsers: {
    id: string;
    displayName?: string;
    city?: string;
    country?: string;
    avatarUri?: string;
  }[];
  adminUsers: {
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
      leadUsers,
      adminUsers,
      loading = false,
      component: Button = MuiButton,
      extended = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { sendMessage, directMessageDialog } = useDirectMessageDialog({
      dialogTitle: t('send-message-dialog.direct-message-title'),
    });

    const contactUsers = leadUsers.length > 0 ? leadUsers : adminUsers;

    const handleSendMessageToParentLeads = () => {
      sendMessage('user', ...contactUsers);
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

      if (contactUsers.length === 0) {
        return null;
      }

      return (
        <Button
          ref={ref as Ref<HTMLButtonElement>}
          startIcon={extended ? <AddOutlined /> : undefined}
          onClick={handleSendMessageToParentLeads}
          variant="contained"
          sx={extended ? { textTransform: 'none' } : undefined}
        >
          {t(`components.application-button.contactChallengeLeads.${extended ? 'full' : 'short'}` as const)}
        </Button>
      );
    };

    return (
      <>
        {renderApplicationButton()}
        <RootThemeProvider>{directMessageDialog}</RootThemeProvider>
      </>
    );
  }
);

export default OpportunityApplicationButton;
