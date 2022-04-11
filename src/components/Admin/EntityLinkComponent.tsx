import React, { FC, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton, Typography, Link } from '@mui/material';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../../utils/urlBuilders';

export interface EntityLinkComponentProps {
  hubNameId: string;
  displayName: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  loading?: boolean;
}

export const EntityLinkComponent: FC<EntityLinkComponentProps> = ({
  hubNameId,
  displayName,
  challengeNameId,
  opportunityNameId,
  loading,
}) => {
  const url = useMemo(
    () => buildUrl(hubNameId, challengeNameId, opportunityNameId),
    [hubNameId, challengeNameId, opportunityNameId]
  );

  return useMemo(
    () => (
      <Typography variant="h2">
        {loading ? (
          <Skeleton width="40%" />
        ) : (
          <Link component={RouterLink} to={url}>
            {displayName}
          </Link>
        )}
      </Typography>
    ),
    [url, displayName, loading]
  );
};

const buildUrl = (hubNameId: string, challengeNameId?: string, opportunityNameId?: string) => {
  if (opportunityNameId && challengeNameId) {
    return buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  } else if (challengeNameId) {
    return buildChallengeUrl(hubNameId, challengeNameId);
  }
  return buildHubUrl(hubNameId);
};
