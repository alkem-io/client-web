import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { makeStyles } from '@mui/styles';
import { ApplicationInfoFragment } from '../../../../../models/graphql-schema';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import Avatar from '../../../../../common/components/core/Avatar';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import LifecycleButton from '../../../../platform/admin/templates/InnovationTemplates/LifecycleButton';
import { Optional } from '../../../../../types/util';
import { Loading } from '../../../../../common/components/core';

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

export type ApplicationDialogDataType = Optional<ApplicationInfoFragment, 'lifecycle' | 'user'>;

export interface ApplicationDialogProps {
  app?: ApplicationDialogDataType;
  onHide: () => void;
  onSetNewState?: (appId: string, newState: string) => void;
  loading?: boolean;
}

export const ApplicationDialog: FC<ApplicationDialogProps> = ({ app, onHide, onSetNewState, loading }) => {
  const { t } = useTranslation();
  const styles = appStyles();

  const appId = app?.id || '';
  const user = app?.user;
  const questions = app?.questions || [];

  const nextEvents = app?.lifecycle?.nextEvents || [];

  const username = user?.displayName || '';
  const avatarSrc = user?.profile?.avatar?.uri || '';

  const createdDate = app?.createdDate ? new Date(app?.createdDate).toLocaleString() : '';
  const updatedDate = app?.updatedDate ? new Date(app?.updatedDate).toLocaleString() : '';

  return (
    <Dialog open maxWidth="md" fullWidth aria-labelledby="dialog-title">
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
                      <WrapperTypography variant={'h3'} aria-label="Username">
                        {username}
                      </WrapperTypography>
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
                    <WrapperTypography weight={'boldLight'} aria-label="Answer">
                      {x.value}
                    </WrapperTypography>
                  </div>
                ))}
              </div>
            </div>
            {(createdDate || updatedDate) && (
              <div className={styles.date}>
                {createdDate && (
                  <WrapperTypography variant="caption" color="neutralMedium" aria-label="Date created">
                    {t('components.application-dialog.created', { date: createdDate })}
                  </WrapperTypography>
                )}
                {updatedDate && (
                  <WrapperTypography variant="caption" color="neutralMedium" aria-label="Date updated">
                    {t('components.application-dialog.updated', { date: updatedDate })}
                  </WrapperTypography>
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
