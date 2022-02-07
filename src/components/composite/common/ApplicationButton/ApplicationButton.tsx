import { Button, CircularProgress, Dialog, DialogContent } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../../../../models/constants';
import { buildLoginUrl } from '../../../../utils/urlBuilders';
import { DialogActions, DialogTitle } from '../../../core/dialog';

export interface ApplicationButtonProps {
  isAuthenticated: boolean;
  isMember?: boolean;
  isNotParentMember?: boolean;
  applicationState?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
  ecoverseName?: string;
  challengeName?: string;
  loading?: boolean;
}

export const ApplicationButton: FC<ApplicationButtonProps> = ({
  isAuthenticated,
  applicationState,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
  isMember = false,
  isNotParentMember = false,
  ecoverseName,
  challengeName,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const isApplicationPending = (applicationState?: string) =>
    applicationState === APPLICATION_STATE_NEW || applicationState === APPLICATION_STATE_REJECTED;

  const applicationButtonState = useMemo(() => {
    if (loading) {
      return <Button disabled startIcon={<CircularProgress size={24} />} />;
    }
    if (!isAuthenticated) {
      return (
        <Button variant="contained" component={RouterLink} to={buildLoginUrl(applyUrl?.replace('/apply', ''))}>
          {t('buttons.apply-not-signed')}
        </Button>
      );
    } else if (isMember) {
      return <Button disabled>{t('buttons.member')}</Button>;
    } else if (applicationState) {
      if (isApplicationPending(applicationState)) {
        return <Button disabled>{t('buttons.apply-pending')}</Button>;
      }
    } else if (isNotParentMember) {
      return (
        <Button onClick={handleClick} variant={'contained'}>
          {t('buttons.apply')}
        </Button>
      );
    }
    return (
      <Button component={RouterLink} variant={'contained'} to={applyUrl || ''}>
        {t('buttons.apply')}
      </Button>
    );
  }, [isAuthenticated, applicationState, applyUrl, parentApplicationState, loading]);

  const dialogVariant = useMemo(
    () => (isApplicationPending(parentApplicationState) ? 'dialog-parent-app-pending' : 'dialog-join-parent'),
    [parentApplicationState, parentApplyUrl, applyUrl]
  );

  return (
    <>
      {applicationButtonState}
      <Dialog open={isDialogOpen}>
        <DialogTitle onClose={handleClose}>
          {t(`components.application-button.${dialogVariant}.title` as const)}
        </DialogTitle>
        <DialogContent dividers>
          <Trans
            i18nKey={`components.application-button.${dialogVariant}.body` as const}
            values={{ ecoverseName, challengeName }}
            components={{
              strong: <strong />,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            component={RouterLink}
            to={(isApplicationPending(parentApplicationState) ? applyUrl : parentApplyUrl) || ''}
            variant="contained"
          >
            {t('buttons.apply')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationButton;
