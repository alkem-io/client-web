import React, { FC } from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
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

    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('sm')]: {
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
    justifyContent: 'center',
    gap: theme.spacing(2),
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
      {loading && <Loading />}
      {!loading && (
        <>
          <DialogTitle id="dialog-title" onClose={onHide}>
            {user && (
              <div className={styles.title}>
                <div className={styles.header}>
                  <div className={styles.profile}>
                    <Avatar src={avatarSrc} size={'lg'} />
                    <div className={styles.userName}>
                      <Typography variant={'h3'}>{username}</Typography>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.date}>
              <Typography variant="caption" color="neutralMedium">
                Created on {createdDate}
              </Typography>
              <Typography variant="caption" color="neutralMedium">
                Last updated on {updatedDate}
              </Typography>
            </div>
          </DialogTitle>
          <DialogContent dividers>
            <div className={styles.body}>
              <div className={styles.questions}>
                {questions.map(x => (
                  <div key={x.id} className={styles.question}>
                    <label>{x.name}</label>
                    <Typography weight={'boldLight'}>{x.value}</Typography>
                  </div>
                ))}
              </div>
            </div>
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
