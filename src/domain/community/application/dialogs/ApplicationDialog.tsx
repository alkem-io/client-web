import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';
import { Box, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog/Dialog';
import { useTranslation } from 'react-i18next';

export type ApplicationDialogDataType = {
  id: string;
  contributorType: RoleSetContributorType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextEvents: string[];
  email?: string;
  createdDate: Date | undefined;
  updatedDate?: Date;
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
  contributor?: {
    id: string;
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
      };
      url: string;
    };
  };
};

export interface ApplicationDialogProps {
  app?: ApplicationDialogDataType;
  onClose: () => void;
  onSetNewState?: (appId: string, newState: string) => void;
  loading?: boolean;
}
/**
 * // TODO:
 * @deprecated Rewrite this with new components and put it somewhere else
 */
export const ApplicationDialog = ({ app, onClose, onSetNewState, loading }: ApplicationDialogProps) => {
  const { t } = useTranslation();

  const appId = app?.id || '';
  const user = app?.contributor;
  const questions = app?.questions ?? [];

  const nextEvents = app?.nextEvents ?? [];

  const username = user?.profile.displayName ?? '';
  const avatarSrc = user?.profile.avatar?.uri ?? '';

  const createdDate = app?.createdDate ? new Date(app?.createdDate).toLocaleString() : '';
  const updatedDate = app?.updatedDate ? new Date(app?.updatedDate).toLocaleString() : '';

  return (
    <Dialog open maxWidth="md" fullWidth aria-labelledby="dialog-title">
      <DialogHeader onClose={onClose}>
        <ProfileChip
          displayName={username}
          avatarUrl={avatarSrc}
          city={user?.profile.location?.city}
          country={user?.profile.location?.country}
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
          {(createdDate || updatedDate) && (
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {createdDate && (
                <Caption color="neutralMedium" aria-label="Date created">
                  {t('components.application-dialog.created', { date: createdDate })}
                </Caption>
              )}
              {updatedDate && (
                <Caption color="neutralMedium" aria-label="Date updated">
                  {t('components.application-dialog.updated', { date: updatedDate })}
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
                    onSetNewState && onSetNewState(appId, stateName);
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
