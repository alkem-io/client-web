import { Dialog, DialogContent } from '@material-ui/core';
import React, { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../../../../models/constants';
import { buildLoginUrl } from '../../../../utils/urlBuilders';
import Button from '../../../core/Button';
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
    if (!isAuthenticated) {
      return (
        <Button
          text={t('buttons.apply-not-signed')}
          as={RouterLink}
          to={buildLoginUrl(applyUrl?.replace('/apply', ''))}
        />
      );
    } else if (isMember) {
      return <Button text={t('buttons.member')} disabled />;
    } else if (applicationState) {
      if (isApplicationPending(applicationState)) {
        return <Button text={t('buttons.apply-pending')} disabled />;
      }
    } else if (isNotParentMember) {
      return <Button text={t('buttons.apply')} onClick={handleClick} />;
    }
    return <Button text={t('buttons.apply')} as={RouterLink} to={applyUrl} />;
  }, [isAuthenticated, applicationState, applyUrl, parentApplicationState]);

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
            text={t('buttons.apply')}
            as={RouterLink}
            to={isApplicationPending(parentApplicationState) ? applyUrl : parentApplyUrl}
            variant="primary"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationButton;
