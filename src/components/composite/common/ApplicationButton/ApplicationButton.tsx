import { Button, CircularProgress } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { buildLoginUrl } from '../../../../utils/urlBuilders';
import PreApplicationDialog from './PreApplicationDialog';
import isApplicationPending from './is-application-pending';
import PreJoinDialog from './PreJoinDialog';
import PreJoinParentDialog from './PreJoinParentDialog';

export interface ApplicationButtonProps {
  isAuthenticated?: boolean;
  isMember?: boolean;
  isParentMember?: boolean;
  applicationState?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
  joinParentUrl?: string;
  hubName?: string;
  challengeName?: string;
  canJoinCommunity?: boolean;
  canApplyToCommunity?: boolean;
  canJoinParentCommunity?: boolean;
  canApplyToParentCommunity?: boolean;
  onJoin: () => void;
  loading: boolean;
}

export const ApplicationButton: FC<ApplicationButtonProps> = ({
  isAuthenticated,
  applicationState,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
  joinParentUrl,
  isMember = false,
  isParentMember = false,
  hubName,
  challengeName,
  canJoinCommunity,
  canApplyToCommunity,
  canJoinParentCommunity,
  canApplyToParentCommunity,
  onJoin,
  loading = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isJoinParentDialogOpen, setIsJoinParentDialogOpen] = useState(false);

  const handleClickApplyParent = () => setIsApplyDialogOpen(true);
  const handleClickJoin = () => setIsJoinDialogOpen(true);
  const handleClickJoinParent = () => setIsJoinParentDialogOpen(true);

  const handleClose = () => {
    setIsApplyDialogOpen(false);
    setIsJoinDialogOpen(false);
    setIsJoinParentDialogOpen(false);
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

  /***
   * {@link https://github.com/alkem-io/alkemio/blob/develop/docs/community-membership.md#client-logic Client logic @alkem-io/alkemio/docs/community-membership.md}
   ### Hub Logic
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
  const applicationButtonState = useMemo(() => {
    if (loading) {
      return <Button disabled startIcon={<CircularProgress size={24} />} />;
    }

    if (!isAuthenticated) {
      return (
        <Button variant="contained" component={RouterLink} to={buildLoginUrl(applyUrl?.replace('/apply', ''))}>
          {t('components.application-button.apply-not-signed')}
        </Button>
      );
    }

    if (isMember) {
      return (
        <Button
          disabled
          sx={{
            '&.Mui-disabled': {
              color: '#00A88F',
            },
          }}
        >
          {t('buttons.member')}
        </Button>
      );
    }

    if (isApplicationPending(applicationState)) {
      return <Button disabled>{t('components.application-button.apply-pending')}</Button>;
    }

    if (canJoinCommunity) {
      return (
        <Button onClick={handleClickJoin} variant={'contained'}>
          {t('components.application-button.join')}
        </Button>
      );
    }

    if (canApplyToCommunity) {
      return (
        <Button component={RouterLink} variant={'contained'} to={applyUrl || ''}>
          {t('buttons.apply')}
        </Button>
      );
    }

    // is parent member but has no privileges for joining the current community
    if (isParentMember) {
      return (
        <Button disabled variant={'contained'}>
          {t('components.application-button.apply-disabled')}
        </Button>
      );
    }

    if (isApplicationPending(parentApplicationState)) {
      return <Button disabled>{t('components.application-button.parent-pending')}</Button>;
    }

    if (canJoinParentCommunity) {
      return (
        <Button onClick={handleClickJoinParent} variant={'contained'}>
          {t('components.application-button.join-parent')}
        </Button>
      );
    }

    if (canApplyToParentCommunity) {
      return (
        <Button onClick={handleClickApplyParent} variant={'contained'}>
          {t('components.application-button.apply-parent')}
        </Button>
      );
    }

    return (
      <Button disabled variant={'contained'}>
        {t('components.application-button.apply-disabled')}
      </Button>
    );
  }, [loading, isAuthenticated, isMember, applicationState, canJoinCommunity, canApplyToCommunity, isParentMember]);

  const dialogVariant = useMemo(
    () => (isApplicationPending(parentApplicationState) ? 'dialog-parent-app-pending' : 'dialog-apply-parent'),
    [parentApplicationState]
  );

  return (
    <>
      {applicationButtonState}
      <PreApplicationDialog
        open={isApplyDialogOpen}
        onClose={handleClose}
        dialogVariant={dialogVariant}
        hubName={hubName}
        challengeName={challengeName}
        parentApplicationState={parentApplicationState}
        applyUrl={applyUrl}
        parentApplyUrl={parentApplyUrl}
      />
      <PreJoinDialog open={isJoinDialogOpen} onClose={handleClose} onJoin={handleJoin} />
      <PreJoinParentDialog open={isJoinParentDialogOpen} onClose={handleClose} onJoin={handleJoinParent} />
    </>
  );
};

export default ApplicationButton;
