import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { makeStyles } from '@mui/styles';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import { ProfileChip } from '../../contributor/ProfileChip/ProfileChip';
import { Actions } from '@core/ui/actions/Actions';
import Gutters from '@core/ui/grid/Gutters';
import { CommunityContributorType } from '@core/apollo/generated/graphql-schema';
import { Button } from '@mui/material';
import { Caption, CaptionSmall } from '@core/ui/typography';

const appStyles = makeStyles(theme => ({
  minHeight: {
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',
    justifyContent: 'center',

    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('lg')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('lg')]: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 400,
    overflowY: 'auto',
  },
  questions: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    margin: theme.spacing(1),
  },
  question: {
    display: 'flex',
    flexDirection: 'column',
  },
  date: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
}));

export type ApplicationDialogDataType = {
  id: string;
  contributorType: CommunityContributorType;
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
    nameID: string;
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
export const ApplicationDialog: FC<ApplicationDialogProps> = ({ app, onClose, onSetNewState, loading }) => {
  const { t } = useTranslation();
  const styles = appStyles();

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
          <div className={styles.body}>
            <div className={styles.questions}>
              {questions.map(x => (
                <div key={x.id} className={styles.question}>
                  <label aria-label="Questions">{x.name}</label>
                  <CaptionSmall aria-label="Answer">{x.value}</CaptionSmall>
                </div>
              ))}
            </div>
          </div>
          {(createdDate || updatedDate) && (
            <div className={styles.date}>
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
            </div>
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
