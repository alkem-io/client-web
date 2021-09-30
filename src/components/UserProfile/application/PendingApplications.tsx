import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Card from '../../core/Card';
import {
  refetchUserApplicationsQuery,
  useDeleteUserApplicationMutation,
  useUserApplicationsQuery,
} from '../../../hooks/generated/graphql';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../../../models/constants';
import Tag from '../../core/Tag';
import { createStyles, useApolloErrorHandler, useNotification } from '../../../hooks';
import Icon from '../../core/Icon';
import IconButton from '../../core/IconButton';
import { ApplicationResultEntry, User } from '../../../models/graphql-schema';
import getApplicationWithType, { ApplicationWithType } from '../../../utils/application/getApplicationWithType';
import { Typography } from '@material-ui/core';

const useStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    display: 'flex',
    justifyContent: 'end',
    gap: theme.spacing(0.5),
  },
  noPadding: {
    padding: 0,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
}));

interface Props {
  user?: User;
  canEdit?: boolean;
}

const PendingApplications: FC<Props> = ({ user, canEdit = true }) => {
  const userId = user?.id || '';

  const { t } = useTranslation();
  const styles = useStyles();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { data: memberShip } = useUserApplicationsQuery({ variables: { input: { userID: userId } } });
  const applications = (memberShip?.membershipUser?.applications || []) as ApplicationResultEntry[];
  const appsWithType = applications
    .filter(x => x.state === APPLICATION_STATE_NEW || x.state === APPLICATION_STATE_REJECTED)
    .map(getApplicationWithType);

  const [deleteApplication] = useDeleteUserApplicationMutation({
    onCompleted: () => notify('Successfully deleted', 'success'),
    onError: handleError,
    refetchQueries: [refetchUserApplicationsQuery({ input: { userID: userId } })],
    awaitRefetchQueries: true,
  });

  const handleDelete = (id: string) => {
    deleteApplication({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  return (
    <Box marginY={1}>
      <Card primaryTextProps={{ text: t('pages.user-profile.applications.title') }}>
        {appsWithType.map((x, i) => (
          <Grid container key={i} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
            <Grid item xs={6}>
              <Link component={RouterLink} to={buildApplicationLink(x)} aria-label="Link to entity">
                <Typography className={styles.noPadding} noWrap={true} aria-label="Application display name">
                  {x.displayName}
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} className={styles.row}>
              <Tag text={x.type} color="neutralMedium" aria-label="Application type" />
              <Box display="flex" alignItems={'center'}>
                <Tag
                  className={styles.capitalize}
                  text={x.state}
                  color={x.state === APPLICATION_STATE_NEW ? 'positive' : 'negative'}
                  aria-label="Application state"
                />
                {canEdit && (
                  <IconButton onClick={() => handleDelete(x.id)} aria-label="Delete">
                    <Icon component={Trash} color="negative" size={'md'} />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
        ))}
      </Card>
    </Box>
  );
};
export default PendingApplications;

const buildApplicationLink = (application: ApplicationWithType): string => {
  return application.displayName; // todo build app link
};
