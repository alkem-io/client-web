import { gutters } from '../../../../core/ui/grid/utils';
import { Box } from '@mui/material';
import React, { useRef } from 'react';
import BackButton from '../../../../core/ui/actions/BackButton';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import ApplicationButtonContainer, {
  ApplicationButtonContainerProps,
} from '../../../community/application/containers/ApplicationButtonContainer';
import PageContentRibbon from '../../../../core/ui/content/PageContentRibbon';
import { LockOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import JourneyAboutDialog, { JourneyAboutDialogProps } from '../JourneyAboutDialog/JourneyAboutDialog';
import useCanGoBack from '../../../../core/routing/useCanGoBack';

interface JourneyUnauthorizedDialogProps
  extends Omit<JourneyAboutDialogProps, 'open' | 'startButton' | 'endButton'>,
    Omit<ApplicationButtonContainerProps, 'children'> {
  privilegesLoading: boolean;
  authorized: boolean | undefined;
  disabled?: boolean;
}

const JourneyUnauthorizedDialog = ({
  authorized,
  privilegesLoading,
  disabled = false,
  challengeId,
  challengeNameId,
  challengeName,
  journeyTypeName,
  ...aboutDialogProps
}: JourneyUnauthorizedDialogProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const canGoBack = useCanGoBack();

  const applicationButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  return (
    <JourneyAboutDialog
      open={!disabled && !privilegesLoading && !authorized}
      startButton={canGoBack && <BackButton onClick={() => navigate(-1)} />}
      endButton={
        <ApplicationButtonContainer {...{ challengeId, challengeNameId, challengeName }}>
          {(e, s) => (
            <ApplicationButton
              ref={applicationButtonRef}
              {...e?.applicationButtonProps}
              loading={s.loading}
              journeyTypeName={journeyTypeName}
            />
          )}
        </ApplicationButtonContainer>
      }
      ribbon={
        <PageContentRibbon onClick={() => applicationButtonRef.current?.click()} sx={{ cursor: 'pointer' }}>
          <Box display="flex" gap={gutters(0.5)} alignItems="center" justifyContent="center">
            <LockOutlined fontSize="small" />
            {t('components.journeyUnauthorizedDialog.message')}
          </Box>
        </PageContentRibbon>
      }
      journeyTypeName={journeyTypeName}
      {...aboutDialogProps}
    />
  );
};

export default JourneyUnauthorizedDialog;
