import { useMemo } from 'react';
import { has, keyBy } from 'lodash';
import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import { useApolloErrorHandler } from '../../../hooks';
import { Identifiable } from '../../shared/types/Identifiable';
import { PossiblyUndefinedProps } from '../../shared/types/PossiblyUndefinedProps';
import somePropsNotDefined from '../../shared/utils/somePropsNotDefined';

interface ExistingMembersQueryResult<MemberEntity> extends PossiblyUndefinedProps<CommunityIdHolder> {
  existingMembers: MemberEntity[] | undefined;
}

interface CommunityIdHolder {
  communityId: string;
}

interface MutationVariables {
  memberId: string;
  communityId: string;
}

export interface MemberMutationHook<Mutation = unknown> {
  (options: Apollo.MutationHookOptions<Mutation, MutationVariables>): MutationTuple<Mutation, MutationVariables>;
}

export interface RefetchQuery<ExistingMembersQueryVariables extends {}> {
  (variables: ExistingMembersQueryVariables): {
    query: DocumentNode;
    variables: ExistingMembersQueryVariables;
  };
}

export interface UseCommunityMembersAssignmentOptions<
  ExistingMembersQueryVariables extends {},
  MemberEntity extends Identifiable,
  AssignMemberMutation,
  RemoveMemberMutation
> {
  variables: PossiblyUndefinedProps<ExistingMembersQueryVariables>;
  useExistingMembersQuery: (options: {
    variables: ExistingMembersQueryVariables;
    skip: boolean;
  }) => ExistingMembersQueryResult<MemberEntity>;
  allPossibleMembers: MemberEntity[] | undefined;
  useAssignMemberMutation: MemberMutationHook<AssignMemberMutation>;
  useRemoveMemberMutation: MemberMutationHook<RemoveMemberMutation>;
  refetchQueries: RefetchQuery<ExistingMembersQueryVariables>[];
}

export interface Provided<MemberEntity> {
  existingMembers: MemberEntity[];
  availableMembers: MemberEntity[];
  updating: boolean;
  onRemove: (organizationID: string) => void;
  onAdd: (organizationID: string) => void;
}

const readCommunityIdOrFail = (variables: PossiblyUndefinedProps<CommunityIdHolder>): string | never => {
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
  options: UseCommunityMembersAssignmentOptions<
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
    refetchQueries,
  } = options;

  const handleError = useApolloErrorHandler();

  const queryResult = useExistingMembersQuery({
    variables: variables as ExistingMembersQueryVariables,
    skip: somePropsNotDefined(variables),
  });

  const existingMembers = queryResult.existingMembers ?? EMPTY_LIST;

  const existingOrganizationsIndexed = useMemo(() => keyBy(existingMembers, member => member.id), [existingMembers]);

  const availableMembers = useMemo(
    () => allPossibleMembers.filter(org => !has(existingOrganizationsIndexed, org.id)),
    [allPossibleMembers, existingMembers]
  );

  const [assign, { loading: isAddingMember }] = useAssignMemberMutation({
    onError: handleError,
    refetchQueries: refetchQueries.map(refetchQuery => refetchQuery(variables as ExistingMembersQueryVariables)),
    awaitRefetchQueries: true,
  });

  const [remove, { loading: isRemovingMember }] = useRemoveMemberMutation({
    onError: handleError,
    refetchQueries: refetchQueries.map(refetchQuery => refetchQuery(variables as ExistingMembersQueryVariables)),
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
