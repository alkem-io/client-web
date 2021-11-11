import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { createStyles } from '../../../../hooks';
import { ApplicationInfoFragment } from '../../../../models/graphql-schema';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import Avatar from '../../../core/Avatar';
import Typography from '../../../core/Typography';
import LifecycleButton from '../../../core/LifecycleButton';
import { Optional } from '../../../../types/util';
import { Loading } from '../../../core';

const appStyles = createStyles(theme => ({
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

    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('md')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('md')]: {
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

export type ApplicationDialogDataType = Optional<ApplicationInfoFragment, 'lifecycle' | 'user'>;

export interface ApplicationDialogProps {
  app?: ApplicationDialogDataType;
  onHide: () => void;
  onSetNewState?: (appId: string, newState: string) => void;
  loading?: boolean;
}

const ApplicationDialog: FC<ApplicationDialogProps> = ({ app, onHide, onSetNewState, loading }) => {
  const { t } = useTranslation();
  const styles = appStyles();

  const appId = app?.id || '';
  const user = app?.user;
  const questions = app?.questions || [];

  const nextEvents = app?.lifecycle?.nextEvents || [];

  const username = user?.displayName || '';
  const avatarSrc = user?.profile?.avatar || '';

  const createdDate = app?.createdDate ? new Date(app?.createdDate).toLocaleString() : '';
  const updatedDate = app?.updatedDate ? new Date(app?.updatedDate).toLocaleString() : '';

  return (
    <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="dialog-title">
      {loading && (
        <DialogTitle id="dialog-title" onClose={onHide}>
          <Loading />
        </DialogTitle>
      )}
      {!loading && (
        <>
          <DialogTitle id="dialog-title" onClose={onHide}>
            <div className={styles.title}>
              <div className={styles.header}>
                {!user && t('components.application-dialog.title')}
                {user && (
                  <div className={styles.profile}>
                    <Avatar src={avatarSrc} size={'lg'} aria-label="User avatar" />
                    <div className={styles.userName}>
                      <Typography variant={'h3'} aria-label="Username">
                        {username}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogContent dividers>
            <div className={styles.body}>
              <div className={styles.questions}>
                {questions.map(x => (
                  <div key={x.id} className={styles.question}>
                    <label aria-label="Questions">{x.name}</label>
                    <Typography weight={'boldLight'} aria-label="Answer">
                      {x.value}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
            {(createdDate || updatedDate) && (
              <div className={styles.date}>
                {createdDate && (
                  <Typography variant="caption" color="neutralMedium" aria-label="Date created">
                    {t('components.application-dialog.created', { date: createdDate })}
                  </Typography>
                )}
                {updatedDate && (
                  <Typography variant="caption" color="neutralMedium" aria-label="Date updated">
                    {t('components.application-dialog.updated', { date: updatedDate })}
                  </Typography>
                )}
              </div>
            )}
          </DialogContent>
          {nextEvents.length > 0 && (
            <DialogActions>
              {nextEvents.map((x, i) => (
                <LifecycleButton
                  key={i}
                  stateName={x}
                  onClick={() => {
                    onSetNewState && onSetNewState(appId, x);
                    onHide();
                  }}
                />
              ))}
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
};
export default ApplicationDialog;
