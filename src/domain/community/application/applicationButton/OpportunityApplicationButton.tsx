import { Button as MuiButton, CircularProgress } from '@mui/material';
import React, { forwardRef, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import { AddOutlined } from '@mui/icons-material';
import RootThemeProvider from '../../../../core/ui/themes/RootThemeProvider';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';

export interface ApplicationButtonProps {
  isAuthenticated?: boolean;
  isMember: boolean;
  isParentMember?: boolean;
  parentUrl?: string;
  parentLeadUsers: {
    id: string;
    displayName?: string;
    city?: string;
    country?: string;
    avatarUri?: string;
  }[];
  loading: boolean;
  component?: typeof MuiButton;
  extended?: boolean;
  journeyTypeName: JourneyTypeName;
}

export const ApplicationButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ApplicationButtonProps>(
  (
    {
      isAuthenticated,
      isMember = false,
      isParentMember = false,
      parentUrl,
      journeyTypeName,
      parentLeadUsers: leadUsers,
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

    const handleSendMessageToParentLeads = () => {
      sendMessage('user', ...leadUsers);
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

      if (journeyTypeName === 'opportunity' && !isParentMember) {
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
              {t(`components.application-button.opportunity.joinParentFirst.${extended ? 'full' : 'short'}` as const)}
            </Button>
          )
        );
      }

      if (journeyTypeName === 'opportunity' && isParentMember) {
        return (
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            startIcon={extended ? <AddOutlined /> : undefined}
            onClick={handleSendMessageToParentLeads}
            variant="contained"
            sx={extended ? { textTransform: 'none' } : undefined}
          >
            {t(`components.application-button.opportunity.contactParentLeads.${extended ? 'full' : 'short'}` as const)}
          </Button>
        );
      }

      return (
        <Button ref={ref as Ref<HTMLButtonElement>} disabled variant={'contained'}>
          {t('components.application-button.apply-disabled')}
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

export default ApplicationButton;
