import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { OrganizationCardFragment, Scalars, UserCardFragment } from '../../models/graphql-schema';
import {
  useChallengeLeadingOrganizationsQuery,
  useCommunityPageQuery,
  useCommunityPageWithHostQuery,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';

export interface CommunityContainerEntities {
  communityName?: string;
  hostOrganization?: OrganizationCardFragment;
  leadingOrganizations: OrganizationCardFragment[];
  members: UserCardFragment[];
}

export interface CommunityContainerActions {}

export interface CommunityContainerState {
  loading: boolean;
  organizationsLoading: boolean;
  membersLoading: boolean;
  error?: ApolloError;
  organizationsError?: ApolloError;
  membersError?: ApolloError;
}

export interface CommunityContainerProps
  extends ContainerProps<CommunityContainerEntities, CommunityContainerActions, CommunityContainerState> {
  ecoverseId?: Scalars['UUID_NAMEID'];
  challengeId?: Scalars['UUID_NAMEID'];
  communityId?: Scalars['UUID'];
  opportunityId?: Scalars['UUID'];
}

const CommunityPageContainer: FC<CommunityContainerProps> = ({
  children,
  ecoverseId = '',
  communityId = '',
  challengeId = '',
  opportunityId = '',
}) => {
  const handleError = useApolloErrorHandler();
  const isMissingData = !ecoverseId || !communityId;
  // use this
  // if you have an opportunity
  // if you have a challenge
  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
  } = useCommunityPageQuery({
    onError: handleError,
    errorPolicy: 'all',
    variables: {
      ecoverseId,
      communityId,
    },
    skip: (!opportunityId && !challengeId) || isMissingData,
  });
  // use this
  // if you DO NOT have an opportunity
  // if you DO NOT have a challenge
  const {
    data: communityWithHostData,
    loading: communityWithHostLoading,
    error: communityWithHostError,
  } = useCommunityPageWithHostQuery({
    onError: handleError,
    errorPolicy: 'all',
    variables: {
      ecoverseId,
      communityId,
    },
    skip: !!opportunityId || !!challengeId || isMissingData,
  });
  // use this
  // if you DO NOT have an opportunity
  // if you HAVE a challenge
  const {
    data: leadingOrganizationData,
    loading: leadingOrganizationLoading,
    error: leadingOrganizationError,
  } = useChallengeLeadingOrganizationsQuery({
    onError: handleError,
    errorPolicy: 'all',
    variables: {
      ecoverseId,
      challengeId,
    },
    skip: !!opportunityId || !challengeId || !ecoverseId,
  });

  const loading = communityLoading;
  const organizationsLoading = communityWithHostLoading || leadingOrganizationLoading;
  const membersLoading = communityLoading;

  const error = communityError || communityWithHostError;
  const organizationsError = communityWithHostError || leadingOrganizationError;
  const membersError = communityError || communityWithHostError;

  const communityName = (communityData || communityWithHostData)?.ecoverse?.community?.displayName;
  const hostOrganization = communityWithHostData?.ecoverse?.host;
  const leadingOrganizations = leadingOrganizationData?.ecoverse?.challenge?.leadOrganizations ?? [];
  const members = (communityData || communityWithHostData)?.ecoverse?.community?.members ?? [];

  return (
    <>
      {children(
        { communityName, hostOrganization, leadingOrganizations, members },
        { loading, organizationsLoading, membersLoading, error, organizationsError, membersError },
        {}
      )}
    </>
  );
};
export default CommunityPageContainer;
