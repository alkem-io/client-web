import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton, Typography, Link } from '@mui/material';
import {
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
} from '../../../common/utils/urlBuilders';
import { EntityNameIds } from '../../../types/EntityNameIds';

interface VisualProps {
  displayName: string;
  loading?: boolean;
}

export type EntityLinkComponentProps = VisualProps & EntityNameIds;

export const EntityLinkComponent: FC<EntityLinkComponentProps> = ({ displayName, loading, ...entityNameIds }) => {
  const url = buildUrl(entityNameIds);

  return (
    <Typography variant="h2">
      {loading ? (
        <Skeleton width="40%" />
      ) : (
        <Link component={RouterLink} to={url}>
          {displayName}
        </Link>
      )}
    </Typography>
  );
};

const buildUrl = (ids: EntityNameIds) => {
  if ('opportunityNameId' in ids) {
    return buildOpportunityUrl(ids.hubNameId, ids.challengeNameId, ids.opportunityNameId);
  } else if ('challengeNameId' in ids) {
    return buildChallengeUrl(ids.hubNameId, ids.challengeNameId);
  } else if ('organizationNameId' in ids) {
    return buildOrganizationUrl(ids.organizationNameId);
  }
  return buildHubUrl(ids.hubNameId);
};
