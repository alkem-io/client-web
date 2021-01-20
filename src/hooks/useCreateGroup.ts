import {
  useCreateGroupOnChallengeMutation,
  useCreateGroupOnEcoverseMutation,
  useCreateGroupOnOpportunityMutation,
  useCreateGroupOnOrganizationMutation,
} from '../generated/graphql';
import {
  QUERY_ECOVERSE_GROUPS_LIST,
  QUERY_CHALLENGE_GROUPS,
  QUERY_OPPORTUNITY_GROUPS,
  QUERY_ORGANIZATION_GROUPS,
} from '../graphql/admin';
import { useHistory } from 'react-router-dom';
import { ApolloError } from '@apollo/client';

export const useCreateGroup = (name: string, id?: string) => {
  const history = useHistory();

  const redirectToCreatedGroup = groupId => {
    const groupsPath = history.location.pathname.split('/').slice(0, -1).join('/');
    history.replace(`${groupsPath}/${groupId}`);
  };

  const handleError = (e: ApolloError) => {
    console.error(e.message);
  };

  const [createGroupOnEcoverse] = useCreateGroupOnEcoverseMutation({
    variables: {
      groupName: name,
    },
    refetchQueries: [{ query: QUERY_ECOVERSE_GROUPS_LIST }],
    awaitRefetchQueries: true,
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnEcoverse.id),
    onError: handleError,
  });
  const [createGroupOnChallenge] = useCreateGroupOnChallengeMutation({
    variables: {
      groupName: name,
      challengeID: Number(id),
    },
    refetchQueries: [{ query: QUERY_CHALLENGE_GROUPS, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnChallenge.id),
    onError: handleError,
  });
  const [createGroupOnOpportunity] = useCreateGroupOnOpportunityMutation({
    variables: {
      groupName: name,
      opportunityID: Number(id),
    },
    refetchQueries: [{ query: QUERY_OPPORTUNITY_GROUPS, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnOpportunity.id),
    onError: handleError,
  });
  const [createGroupOnOrganisation] = useCreateGroupOnOrganizationMutation({
    variables: {
      groupName: name,
      orgID: Number(id),
    },
    refetchQueries: [{ query: QUERY_ORGANIZATION_GROUPS, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnOrganisation.id),
    onError: handleError,
  });

  return {
    createEcoverseGroup: createGroupOnEcoverse,
    createChallengeGroup: createGroupOnChallenge,
    createOpportunityGroup: createGroupOnOpportunity,
    createOrganizationGroup: createGroupOnOrganisation,
  };
};
