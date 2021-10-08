import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import { ApplicationWithType } from '../../utils/application/getApplicationWithType';
import { ApplicationDialog, ApplicationDialogDataType } from '../../components/composite';
import Tag from '../../components/core/Tag';
import { APPLICATION_STATE_NEW } from '../../models/constants';
import { createStyles } from '../../hooks';
import { ApplicationDialogDetails } from '../../containers/application/PendingApplicationContainer';
import IconButton from '@material-ui/core/IconButton';

const useStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labels: {
    display: 'flex',
    justifyContent: 'end',
    gap: theme.spacing(0.5),
  },
  row: {
    padding: `${theme.spacing(0.5)}px 0`,
  },
  noPadding: {
    padding: 0,
  },
  statusRow: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  capitalize: {
    textTransform: 'capitalize',
  },
}));

export interface PendingApplicationViewEntities {
  application: ApplicationWithType;
  applicationDetails?: ApplicationDialogDetails;
  typeName: string;
  url: string;
}

export interface PendingApplicationViewActions {
  handleDelete: (application: ApplicationWithType) => void;
  handleDialogOpen: (application: ApplicationWithType) => void;
  handleDialogClose: () => void;
}

export interface PendingApplicationViewState {
  isDeleting: boolean;
  loading: boolean;
  loadingDialog: boolean;
  isDialogOpened: boolean;
}

export interface PendingApplicationViewOptions {
  canEdit: boolean;
}

export interface PendingApplicationViewProps {
  entities: PendingApplicationViewEntities;
  actions: PendingApplicationViewActions;
  state: PendingApplicationViewState;
  options: PendingApplicationViewOptions;
}

const PendingApplicationView: FC<PendingApplicationViewProps> = ({ entities, actions, state, options }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { displayName, state: applicationState } = entities.application;

  const applicationForDialog = {
    ...entities.application,
    ...entities.applicationDetails,
  } as ApplicationDialogDataType;

  return (
    <>
      <Grid container spacing={1} justifyContent={'space-between'} alignItems={'center'} className={styles.row}>
        <Grid item xs={6}>
          <Link component={RouterLink} to={entities.url} aria-label="Link to entity">
            <Typography className={styles.noPadding} noWrap={true} aria-label="Application display name">
              {displayName}
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={6} className={styles.labels}>
          <Tag text={entities.typeName} color="neutralMedium" aria-label="Application type" />
          <Box display="flex" alignItems={'center'} className={styles.statusRow}>
            <Tag
              aria-label="Application state"
              className={styles.capitalize}
              text={applicationState}
              color={applicationState === APPLICATION_STATE_NEW ? 'positive' : 'negative'}
            />
            <Tooltip title={t('tooltips.click-more-info')} placement="top">
              <IconButton
                aria-label="Info dialog"
                className={styles.noPadding}
                color={'primary'}
                onClick={() => actions.handleDialogOpen(entities.application)}
                disabled={state.isDeleting}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            {options.canEdit && (
              <Tooltip title={t('tooltips.click-delete')} placement="top">
                <IconButton
                  aria-label="Delete"
                  className={styles.noPadding}
                  onClick={() => actions.handleDelete(entities.application)}
                  disabled={state.isDeleting}
                >
                  <DeleteIcon color={'error'} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>
      {state.isDialogOpened && (
        <ApplicationDialog
          app={applicationForDialog}
          onHide={actions.handleDialogClose}
          loading={state.loadingDialog}
        />
      )}
    </>
  );
};
export default PendingApplicationView;
