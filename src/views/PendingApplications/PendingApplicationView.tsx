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
import { Question } from '../../models/graphql-schema';
import { ApplicationDialog, ApplicationDialogDataType } from '../../components/composite';
import Tag from '../../components/core/Tag';
import { APPLICATION_STATE_NEW } from '../../models/constants';
import IconButton from '../../components/core/IconButton';
import { createStyles } from '../../hooks';

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

interface PendingApplicationProps {
  application: ApplicationWithType;
  questions: Question[];
  edit: boolean;
  isDeleting: boolean;
  loading: boolean;
  loadingDialog: boolean;
  typeName: string;
  url: string;
  handleDelete: (application: ApplicationWithType) => void;
  handleDialogOpen: (application: ApplicationWithType) => void;
  handleDialogClose: () => void;
}

const PendingApplicationView: FC<PendingApplicationProps> = ({
  application,
  questions,
  edit,
  typeName,
  url,
  loadingDialog,
  handleDelete,
  handleDialogOpen,
  handleDialogClose,
  isDeleting,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { displayName, state } = application;

  const applicationForDialog = {
    ...application,
    questions,
  } as ApplicationDialogDataType;

  return (
    <>
      <Grid container spacing={1} justifyContent={'space-between'} alignItems={'center'} className={styles.row}>
        <Grid item xs={6}>
          <Link component={RouterLink} to={url} aria-label="Link to entity">
            <Typography className={styles.noPadding} noWrap={true} aria-label="Application display name">
              {displayName}
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={6} className={styles.labels}>
          <Tag text={typeName} color="neutralMedium" aria-label="Application type" />
          <Box display="flex" alignItems={'center'} className={styles.statusRow}>
            <Tag
              className={styles.capitalize}
              text={state}
              color={state === APPLICATION_STATE_NEW ? 'positive' : 'negative'}
              aria-label="Application state"
            />
            <Tooltip title={t('tooltips.click-more-info')} placement="top">
              <IconButton
                className={styles.noPadding}
                onClick={() => handleDialogOpen(application)}
                disabled={isDeleting}
                aria-label="Info dialog"
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            {edit && (
              <Tooltip title={t('tooltips.click-delete')} placement="top">
                <IconButton
                  className={styles.noPadding}
                  onClick={() => handleDelete(application)}
                  disabled={isDeleting}
                  aria-label="Delete"
                >
                  <DeleteIcon color={'error'} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>
      {questions.length > 0 && (
        <ApplicationDialog app={applicationForDialog} onHide={handleDialogClose} loading={loadingDialog} />
      )}
    </>
  );
};
export default PendingApplicationView;
