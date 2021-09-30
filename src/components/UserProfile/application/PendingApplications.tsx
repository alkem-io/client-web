import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { Typography } from '@material-ui/core';
import {
  refetchUserApplicationsQuery,
  useChallengeNameIdQuery,
  useDeleteUserApplicationMutation,
  useEcoverseNameIdQuery,
  useOpportunityNameIdQuery,
  useUserProfileApplicationsQuery,
} from '../../../hooks/generated/graphql';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../../../models/constants';
import { ApplicationResultEntry, User } from '../../../models/graphql-schema';
import { createStyles, useApolloErrorHandler, useNotification } from '../../../hooks';
import Tag from '../../core/Tag';
import Icon from '../../core/Icon';
import IconButton from '../../core/IconButton';
import Card from '../../core/Card';
import getApplicationWithType, {
  ApplicationType,
  ApplicationWithType,
} from '../../../utils/application/getApplicationWithType';
import { buildChallengeUrl, buildEcoverseUrl, buildOpportunityUrl } from '../../../utils/urlBuilders';

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
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { data: memberShip } = useUserProfileApplicationsQuery({ variables: { input: { userID: userId } } });
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
          <PendingApplication key={i} application={x} edit={canEdit} handleDelete={handleDelete} />
        ))}
      </Card>
    </Box>
  );
};
export default PendingApplications;

type NameIds = {
  ecoverseNameId: string;
  challengeNameId: string;
  opportunityNameId: string;
};

interface PendingApplicationProps {
  application: ApplicationWithType;
  edit: boolean;
  handleDelete: (id: string) => void;
}

const PendingApplication: FC<PendingApplicationProps> = ({ application, edit, handleDelete }) => {
  const styles = useStyles();
  const { id, displayName, type, state, ecoverseID, challengeID = '', opportunityID = '' } = application;

  const nameIds: NameIds = {
    ecoverseNameId: '',
    challengeNameId: '',
    opportunityNameId: '',
  };

  const { data: _opportunityNameId } = useOpportunityNameIdQuery({
    variables: { ecoverseId: ecoverseID, opportunityId: opportunityID },
    skip: !opportunityID,
  });
  if (opportunityID) {
    nameIds.ecoverseNameId = _opportunityNameId?.ecoverse.nameID || '';
    nameIds.challengeNameId = _opportunityNameId?.ecoverse.opportunity.challenge?.nameID || '';
    nameIds.opportunityNameId = _opportunityNameId?.ecoverse.opportunity.nameID || '';
  }

  const { data: _challengeNameId } = useChallengeNameIdQuery({
    variables: { ecoverseId: ecoverseID, challengeId: challengeID },
    skip: !challengeID,
  });
  if (challengeID && !opportunityID) {
    nameIds.ecoverseNameId = _challengeNameId?.ecoverse.nameID || '';
    nameIds.challengeNameId = _challengeNameId?.ecoverse.challenge.nameID || '';
  }

  const { data: _ecoverseNameId } = useEcoverseNameIdQuery({
    variables: { ecoverseId: ecoverseID },
    skip: !!(ecoverseID && (challengeID || opportunityID)),
  });
  if (ecoverseID && !challengeID && !opportunityID) {
    nameIds.ecoverseNameId = _ecoverseNameId?.ecoverse.nameID || '';
  }

  return (
    <Grid container spacing={1} justifyContent={'space-between'} alignItems={'center'} className={styles.row}>
      <Grid item xs={6}>
        <Link component={RouterLink} to={buildApplicationLink(nameIds, type)} aria-label="Link to entity">
          <Typography className={styles.noPadding} noWrap={true} aria-label="Application display name">
            {displayName}
          </Typography>
        </Link>
      </Grid>
      <Grid item xs={6} className={styles.labels}>
        <Tag text={type} color="neutralMedium" aria-label="Application type" />
        <Box display="flex" alignItems={'center'}>
          <Tag
            className={styles.capitalize}
            text={state}
            color={state === APPLICATION_STATE_NEW ? 'positive' : 'negative'}
            aria-label="Application state"
          />
          {edit && (
            <IconButton onClick={() => handleDelete(id)} aria-label="Delete">
              <Icon component={Trash} color="negative" size={'md'} />
            </IconButton>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

const buildApplicationLink = (nameIds: NameIds, type: ApplicationType): string => {
  switch (type) {
    case ApplicationType.HUB:
      return buildEcoverseUrl(nameIds.ecoverseNameId);
    case ApplicationType.CHALLENGE:
      return buildChallengeUrl(nameIds.ecoverseNameId, nameIds.challengeNameId);
    case ApplicationType.OPPORTUNITY:
      return buildOpportunityUrl(nameIds.ecoverseNameId, nameIds.challengeNameId, nameIds.opportunityNameId);
  }
};
