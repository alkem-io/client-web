import { useCommunityApplicationQuery } from '@/core/apollo/generated/apollo-hooks';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import { formatDateTime } from '@/core/utils/time/utils';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';
import { Box, Button, Dialog } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ApplicationDialogProps {
  application: Identifiable;
  onClose: () => void;
  onSetNewState?: (appId: string, newState: string) => void;
}

export const CommunityApplicationDialog = ({
  application: { id: applicationId },
  onClose,
  onSetNewState,
}: ApplicationDialogProps) => {
  const { t } = useTranslation();
  const { data, loading } = useCommunityApplicationQuery({
    variables: { applicationId },
    skip: !applicationId,
  });

  const application = data?.lookup.application;
  const contributor = application?.contributor;
  const questions = application?.questions ?? [];
  const nextEvents = application?.nextEvents ?? [];

  return (
    <Dialog open maxWidth="md" fullWidth aria-labelledby="dialog-title">
      <DialogHeader onClose={onClose}>
        <ProfileChip
          displayName={contributor?.profile.displayName}
          avatarUrl={contributor?.profile.avatar?.uri}
          city={contributor?.profile.location?.city}
          country={contributor?.profile.location?.country}
        />
      </DialogHeader>
      {!loading && (
        <Gutters>
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 400, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, m: 1 }}>
              {questions.map(x => (
                <Box key={x.id} display="flex" flexDirection="column">
                  <label aria-label="Questions">{x.name}</label>
                  <CaptionSmall aria-label="Answer">{x.value}</CaptionSmall>
                </Box>
              ))}
            </Box>
          </Box>
          {application && (
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {application.createdDate && (
                <Caption color="neutralMedium" aria-label="Date created">
                  {t('components.application-dialog.created', { date: formatDateTime(application.createdDate) })}
                </Caption>
              )}
              {application.updatedDate && (
                <Caption color="neutralMedium" aria-label="Date updated">
                  {t('components.application-dialog.updated', { date: formatDateTime(application.updatedDate) })}
                </Caption>
              )}
            </Box>
          )}
          {nextEvents.length > 0 && (
            <Actions justifyContent="end" flexDirection="row-reverse">
              {nextEvents.map(stateName => (
                <Button
                  key={stateName}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    onSetNewState && onSetNewState(applicationId, stateName);
                    onClose();
                  }}
                >
                  {stateName}
                </Button>
              ))}
            </Actions>
          )}
        </Gutters>
      )}
    </Dialog>
  );
};
