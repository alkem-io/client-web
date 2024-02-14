import { Button as MuiButton, CircularProgress } from '@mui/material';
import React, { forwardRef, Ref, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import PreApplicationDialog from './PreApplicationDialog';
import isApplicationPending from './isApplicationPending';
import PreJoinDialog from './PreJoinDialog';
import PreJoinParentDialog from './PreJoinParentDialog';
import { AddOutlined, PersonOutlined } from '@mui/icons-material';
import RootThemeProvider from '../../../../core/ui/themes/RootThemeProvider';
import { InvitationItem } from '../../user/providers/UserProvider/InvitationItem';
import InvitationActionsContainer from '../../invitations/InvitationActionsContainer';
import InvitationDialog from '../../invitations/InvitationDialog';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export interface ApplicationButtonProps {
  isAuthenticated?: boolean;
  isMember: boolean;
  isParentMember?: boolean;
  applicationState?: string;
  userInvitation?: InvitationItem;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
  joinParentUrl?: string;
  spaceName?: string;
  challengeName?: string;
  canJoinCommunity?: boolean;
  canAcceptInvitation?: boolean;
  canApplyToCommunity?: boolean;
  canJoinParentCommunity?: boolean;
  canApplyToParentCommunity?: boolean;
  onJoin: () => void;
  loading: boolean;
  component?: typeof MuiButton;
  extended?: boolean;
  journeyTypeName: JourneyTypeName;
}

export const ApplicationButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ApplicationButtonProps>(
  (
    {
      isAuthenticated,
      applicationState,
      userInvitation,
      parentApplicationState,
      applyUrl,
      parentApplyUrl,
      joinParentUrl,
      isMember = false,
      isParentMember = false,
      spaceName,
      challengeName,
      canJoinCommunity,
      canAcceptInvitation,
      canApplyToCommunity,
      canJoinParentCommunity,
      canApplyToParentCommunity,
      onJoin,
      journeyTypeName,
      loading = false,
      component: Button = MuiButton,
      extended = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [isJoinParentDialogOpen, setIsJoinParentDialogOpen] = useState(false);
    const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);

    const handleClickApplyParent = () => setIsApplyDialogOpen(true);
    const handleClickJoin = () => setIsJoinDialogOpen(true);
    const handleClickJoinParent = () => setIsJoinParentDialogOpen(true);
    const handleClickAcceptInvitation = () => setIsInvitationDialogOpen(true);

    const handleClose = () => {
      setIsApplyDialogOpen(false);
      setIsJoinDialogOpen(false);
      setIsJoinParentDialogOpen(false);
      setIsInvitationDialogOpen(false);
    };

    const handleJoin = () => {
      setIsJoinDialogOpen(false);
      onJoin();
    };

    const handleJoinParent = () => {
      if (joinParentUrl) {
        navigate(joinParentUrl);
      }
    };

    const handleAcceptInvitation = () => {
      handleClose();
    };

    /***
   * {@link https://github.com/alkem-io/alkemio/blob/develop/docs/community-membership.md#client-logic Client logic @alkem-io/alkemio/docs/community-membership.md}
   ### Space Logic
   <p>
     <ol>
       <li>Authenticated = n ==> "Login to Continue"</li>
       <li>isMember = y ==> "Member"</li>
       <li>applicationPending = y ==> "Application pending</li>
       <li>joinPrivilege ==> "Join"</li>
       <li>applyPrivilege ==> "Apply"</li>
       <li>"Membership not available"</li>
     </ol>
     <br/>
     The client currently has some fairly complex logic that determines when users can apply, what message is shown to them. That needs to be adapted / extended to deal with the above.
   </p>
   ### Challenge Logic
     <ol>
       <li>Authenticated = n ==> "Login to Continue"</li>
       <li>isMember =y ==> "Member"</li>
       <li>applicationPending = y ==> "Application pending"</li>
       <li>joinPrivilege ==> "Join"</li>
       <li>applyPrivilege ==> "Apply"</li>
       <li>parentCommunityMember = Y "==> "Membership not available"</li>
       <li>parent app is pending = Y "==> "Pending parent app"</li>
       <li>parentCommunityJoinPrivilege ==> "Join parent" + Popup + inform user to first join the parent + advise user to then come back</li>
       <li>parentCommunityApplyPrivilege ==> "Apply to parent" + Popup + apply on parent (existing)</li>
       <li>"Membership not available"</li>
     </ol>
   */

    const getApplyJoinButtonLabel = (verb: string) =>
      extended
        ? t('components.application-button.extendedMessage', {
            join: verb,
            journey: journeyTypeName === 'challenge' ? t('common.challenge') : t('common.community'),
          })
        : verb;

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
            to={buildLoginUrl(applyUrl?.replace('/apply', ''))}
          >
            {t('components.application-button.apply-not-signed')}
          </Button>
        );
      }

      if (isMember) {
        return (
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            variant="outlined"
            startIcon={<PersonOutlined />}
            disabled
            sx={{
              '&.Mui-disabled': {
                color: 'primary.main',
                borderColor: 'primary.main',
              },
            }}
          >
            {t('buttons.member')}
          </Button>
        );
      }

      if (isApplicationPending(applicationState)) {
        return (
          <Button ref={ref as Ref<HTMLButtonElement>} disabled>
            {t('components.application-button.apply-pending')}
          </Button>
        );
      }

      if (canAcceptInvitation) {
        if (journeyTypeName === 'challenge' && !isMember && !isParentMember) {
          return (
            joinParentUrl && (
              <Button
                ref={ref as Ref<HTMLAnchorElement>}
                component={RouterLink}
                startIcon={<AddOutlined />}
                to={joinParentUrl}
                variant="contained"
                sx={{ textTransform: 'none' }}
              >
                {t(`components.application-button.challenge.joinParentFirst.${extended ? 'full' : 'short'}` as const)}
              </Button>
            )
          );
        } else {
          return (
            <Button
              ref={ref as Ref<HTMLButtonElement>}
              startIcon={extended ? <AddOutlined /> : undefined}
              onClick={handleClickAcceptInvitation}
              variant="contained"
              sx={extended ? { textTransform: 'none' } : undefined}
            >
              {t(`components.application-button.acceptInvitation.${extended ? 'full' : 'short'}` as const)}
            </Button>
          );
        }
      }

      if (canJoinCommunity) {
        return (
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            startIcon={extended ? <AddOutlined /> : undefined}
            onClick={handleClickJoin}
            variant="contained"
            sx={extended ? { textTransform: 'none' } : undefined}
          >
            {getApplyJoinButtonLabel(t('components.application-button.join'))}
          </Button>
        );
      }

      if (canApplyToCommunity && applyUrl) {
        const verb = extended ? t('components.application-button.applyTo') : t('buttons.apply');

        return (
          <Button
            ref={ref as Ref<HTMLAnchorElement>}
            component={RouterLink}
            startIcon={extended ? <AddOutlined /> : undefined}
            variant="contained"
            to={applyUrl}
            sx={extended ? { textTransform: 'none' } : undefined}
          >
            {getApplyJoinButtonLabel(verb)}
          </Button>
        );
      }

      // is parent member but has no privileges for joining the current community
      if (isParentMember) {
        return (
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            disabled
            variant="outlined"
            sx={{
              '&.Mui-disabled': {
                color: 'primary.main',
                borderColor: 'primary.main',
              },
            }}
          >
            {t('components.application-button.apply-disabled')}
          </Button>
        );
      }

      if (isApplicationPending(parentApplicationState)) {
        return (
          <Button ref={ref as Ref<HTMLButtonElement>} disabled>
            {t('components.application-button.parent-pending')}
          </Button>
        );
      }

      if (canJoinParentCommunity) {
        return (
          <Button ref={ref as Ref<HTMLButtonElement>} onClick={handleClickJoinParent} variant={'contained'}>
            {t('components.application-button.join')}
          </Button>
        );
      }

      if (canApplyToParentCommunity) {
        return (
          <Button ref={ref as Ref<HTMLButtonElement>} onClick={handleClickApplyParent} variant={'contained'}>
            {t('buttons.apply')}
          </Button>
        );
      }

      return (
        <Button ref={ref as Ref<HTMLButtonElement>} disabled variant={'contained'}>
          {t('components.application-button.apply-disabled')}
        </Button>
      );
    };

    const dialogVariant = useMemo(
      () => (isApplicationPending(parentApplicationState) ? 'dialog-parent-app-pending' : 'dialog-apply-parent'),
      [parentApplicationState]
    );

    return (
      <>
        {renderApplicationButton()}
        <RootThemeProvider>
          <PreApplicationDialog
            open={isApplyDialogOpen}
            onClose={handleClose}
            dialogVariant={dialogVariant}
            spaceName={spaceName}
            challengeName={challengeName}
            parentApplicationState={parentApplicationState}
            applyUrl={applyUrl}
            parentApplyUrl={parentApplyUrl}
          />
          <PreJoinDialog open={isJoinDialogOpen} onClose={handleClose} onJoin={handleJoin} />
          <PreJoinParentDialog open={isJoinParentDialogOpen} onClose={handleClose} onJoin={handleJoinParent} />
          <InvitationActionsContainer onUpdate={handleAcceptInvitation}>
            {props => (
              <InvitationDialog
                open={isInvitationDialogOpen}
                onClose={handleClose}
                invitation={userInvitation}
                {...props}
              />
            )}
          </InvitationActionsContainer>
        </RootThemeProvider>
      </>
    );
  }
);

export default ApplicationButton;
