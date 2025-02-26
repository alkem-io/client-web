import useCanGoBack from '@/core/routing/useCanGoBack';
import useNavigate from '@/core/routing/useNavigate';
import BackButton from '@/core/ui/actions/BackButton';
import PageContentRibbon from '@/core/ui/content/PageContentRibbon';
import { gutters } from '@/core/ui/grid/utils';
import ApplicationButtonContainer, {
  ApplicationButtonContainerProps,
} from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import SpaceAboutDialog, { JourneyAboutDialogProps } from '@/domain/space/about/SpaceAboutDialog';
import { LockOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface JourneyUnauthorizedDialogProps
  extends Omit<JourneyAboutDialogProps, 'open' | 'startButton' | 'endButton'>,
    Omit<ApplicationButtonContainerProps, 'children'> {
  authorized: boolean | undefined;
  disabled?: boolean;
  loading?: boolean;
}

const JourneyUnauthorizedDialog = ({
  authorized,
  loading = false,
  disabled = false,
  journeyId,
  parentSpaceId,
  spaceLevel,
  ...aboutDialogProps
}: JourneyUnauthorizedDialogProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const canGoBack = useCanGoBack();

  const applicationButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  // applicationButtonRef.current.disabled needs to be defined and false
  // or just an anchor
  const showRibbon = () =>
    applicationButtonRef.current != null &&
    (applicationButtonRef.current instanceof HTMLAnchorElement ||
      (applicationButtonRef.current instanceof HTMLButtonElement && !applicationButtonRef.current.disabled));

  return (
    <SpaceAboutDialog
      open={!disabled && !loading && !authorized}
      startButton={canGoBack && <BackButton onClick={() => navigate(-1)} />}
      endButton={
        <ApplicationButtonContainer parentSpaceId={parentSpaceId} journeyId={journeyId} loading={loading}>
          {(applicationButtonProps, applicationButtonLoading) => (
            <ApplicationButton
              ref={applicationButtonRef}
              {...applicationButtonProps}
              loading={applicationButtonLoading}
              journeyId={journeyId}
              spaceLevel={spaceLevel}
            />
          )}
        </ApplicationButtonContainer>
      }
      ribbon={
        showRibbon() && (
          <PageContentRibbon onClick={() => applicationButtonRef.current?.click()} sx={{ cursor: 'pointer' }}>
            <Box display="flex" gap={gutters(0.5)} alignItems="center" justifyContent="center">
              <LockOutlined fontSize="small" />
              {t('components.journeyUnauthorizedDialog.message')}
            </Box>
          </PageContentRibbon>
        )
      }
      spaceLevel={spaceLevel}
      {...aboutDialogProps}
    />
  );
};

export default JourneyUnauthorizedDialog;
