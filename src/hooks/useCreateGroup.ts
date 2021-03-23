import { ApolloError } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { useCreateGroupOnCommunityMutation, useCreateGroupOnOrganizationMutation } from '../generated/graphql';
import { QUERY_ECOVERSE_GROUPS_LIST, QUERY_ORGANIZATION_GROUPS } from '../graphql/admin';

export const useCreateGroup = (name: string, id: string) => {
  const history = useHistory();

  const redirectToCreatedGroup = groupId => {
    const groupsPath = history.location.pathname.split('/').slice(0, -1).join('/');
    history.replace(`${groupsPath}/${groupId}`);
  };

  const handleError = (e: ApolloError) => {
    console.error(e.message);
  };

  const [createGroupOnCommunity] = useCreateGroupOnCommunityMutation({
    variables: {
      communityID: Number(id),
      groupName: name,
    },
    refetchQueries: [{ query: QUERY_ECOVERSE_GROUPS_LIST }],
    awaitRefetchQueries: true,
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnCommunity.id),
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
    createCommunityGroup: createGroupOnCommunity,
    createOrganizationGroup: createGroupOnOrganisation,
  };
};
