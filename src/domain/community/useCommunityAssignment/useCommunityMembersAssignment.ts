import { useMemo } from 'react';
import { has, keyBy } from 'lodash';
import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import { useApolloErrorHandler } from '../../../hooks';
import { Identifiable } from '../../shared/types/Identifiable';

interface QueryResult<MemberEntity> extends PossiblyUndefinedMembers<CommunityIdHolder> {
  existingMembers: MemberEntity[] | undefined;
}

type PossiblyUndefinedMembers<T> = {
  [Key in keyof T]: T[Key] | undefined;
};

interface CommunityIdHolder {
  communityId: string;
}

interface MutationVariables {
  memberId: string;
  communityId: string;
}

export interface UseOrganizationAssignmentOptions<
  ExistingMembersQueryVariables extends {},
  MemberEntity extends Identifiable,
  AssignMemberMutation,
  RemoveMemberMutation
> {
  variables: PossiblyUndefinedMembers<ExistingMembersQueryVariables>;
  useExistingMembersQuery: (options: {
    variables: ExistingMembersQueryVariables;
    skip: boolean;
  }) => QueryResult<MemberEntity>;
  allPossibleMembers: MemberEntity[] | undefined;
  refetchMembersQuery: (variables: ExistingMembersQueryVariables) => {
    query: DocumentNode;
    variables: ExistingMembersQueryVariables;
  };
  useAssignMemberMutation: (
    options: Apollo.MutationHookOptions<AssignMemberMutation, MutationVariables>
  ) => MutationTuple<AssignMemberMutation, MutationVariables>;
  useRemoveMemberMutation: (
    options: Apollo.MutationHookOptions<RemoveMemberMutation, MutationVariables>
  ) => MutationTuple<RemoveMemberMutation, MutationVariables>;
}

interface Provided<MemberEntity> {
  existingMembers: MemberEntity[];
  availableMembers: MemberEntity[];
  updating: boolean;
  onRemove: (organizationID: string) => void;
  onAdd: (organizationID: string) => void;
}

const someVariablesNotDefined = <Variables extends {}>(variables: Variables): variables is Required<Variables> =>
  Object.keys(variables).some(variableName => !variables[variableName]);

const readCommunityIdOrFail = (variables: PossiblyUndefinedMembers<CommunityIdHolder>): string | never => {
  if (!variables.communityId) {
    throw new TypeError("Community isn't yet loaded.");
  }
  return variables.communityId;
};

const EMPTY_LIST = [];

const useCommunityMembersAssignment = <
  ExistingMembersQueryVariables extends {},
  MemberEntity extends Identifiable,
  AssignMemberMutation,
  RemoveMemberMutation
>(
  options: UseOrganizationAssignmentOptions<
    ExistingMembersQueryVariables,
    MemberEntity,
    AssignMemberMutation,
    RemoveMemberMutation
  >
): Provided<MemberEntity> => {
  const {
    variables,
    useExistingMembersQuery,
    allPossibleMembers = EMPTY_LIST,
    useAssignMemberMutation,
    useRemoveMemberMutation,
    refetchMembersQuery,
  } = options;

  const handleError = useApolloErrorHandler();

  const queryResult = useExistingMembersQuery({
    variables: variables as ExistingMembersQueryVariables,
    skip: someVariablesNotDefined(variables),
  });

  const existingMembers = queryResult.existingMembers ?? EMPTY_LIST;

  const existingOrganizationsIndexed = useMemo(() => keyBy(existingMembers, member => member.id), [existingMembers]);

  const availableMembers = useMemo(
    () => allPossibleMembers.filter(org => !has(existingOrganizationsIndexed, org.id)),
    [allPossibleMembers, existingMembers]
  );

  const [assign, { loading: isAddingMember }] = useAssignMemberMutation({
    onError: handleError,
    refetchQueries: [refetchMembersQuery(variables as ExistingMembersQueryVariables)],
    awaitRefetchQueries: true,
  });

  const [remove, { loading: isRemovingMember }] = useRemoveMemberMutation({
    onError: handleError,
    refetchQueries: [refetchMembersQuery(variables as ExistingMembersQueryVariables)],
    awaitRefetchQueries: true,
  });

  const isUpdating = isAddingMember || isRemovingMember;

  const onAdd = (memberId: string) =>
    assign({
      variables: {
        communityId: readCommunityIdOrFail(queryResult),
        memberId,
      },
    });

  const onRemove = (memberId: string) =>
    remove({
      variables: {
        communityId: readCommunityIdOrFail(queryResult),
        memberId,
      },
    });

  return {
    existingMembers,
    availableMembers,
    updating: isUpdating,
    onAdd,
    onRemove,
  };
};

export default useCommunityMembersAssignment;
