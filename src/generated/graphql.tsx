import * as SchemaTypes from '../types/graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export const ApplicationInfoFragmentDoc = gql`
  fragment ApplicationInfo on Application {
    id
    lifecycle {
      id
      state
      nextEvents
    }
    user {
      id
      displayName
      email
      profile {
        id
        avatar
      }
    }
    questions {
      id
      name
      value
    }
  }
`;
export const GroupMembersFragmentDoc = gql`
  fragment GroupMembers on User {
    id
    displayName
    firstName
    lastName
    email
  }
`;
export const CommunityDetailsFragmentDoc = gql`
  fragment CommunityDetails on Community {
    id
    displayName
    applications {
      id
    }
    members {
      ...GroupMembers
    }
    groups {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export const MessageDetailsFragmentDoc = gql`
  fragment MessageDetails on CommunicationMessageResult {
    id
    sender
    message
    timestamp
  }
`;
export const CommunityMessagesFragmentDoc = gql`
  fragment CommunityMessages on Community {
    id
    updatesRoom {
      id
      messages {
        ...MessageDetails
      }
    }
    discussionRoom {
      id
      messages {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export const ContextVisualFragmentDoc = gql`
  fragment ContextVisual on Visual {
    id
    avatar
    background
    banner
  }
`;
export const ContextDetailsFragmentDoc = gql`
  fragment ContextDetails on Context {
    id
    tagline
    background
    vision
    impact
    who
    references {
      id
      name
      uri
      description
    }
    visual {
      ...ContextVisual
    }
  }
  ${ContextVisualFragmentDoc}
`;
export const EcoverseDetailsFragmentDoc = gql`
  fragment EcoverseDetails on Ecoverse {
    id
    nameID
    displayName
    tagset {
      id
      name
      tags
    }
    authorization {
      id
      anonymousReadAccess
    }
    host {
      id
      displayName
    }
    context {
      ...ContextDetails
    }
  }
  ${ContextDetailsFragmentDoc}
`;
export const GroupDetailsFragmentDoc = gql`
  fragment GroupDetails on UserGroup {
    id
    name
  }
`;
export const GroupInfoFragmentDoc = gql`
  fragment GroupInfo on UserGroup {
    id
    name
    profile {
      id
      avatar
      description
      references {
        id
        uri
        name
        description
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
`;
export const NewChallengeFragmentDoc = gql`
  fragment NewChallenge on Challenge {
    id
    nameID
    displayName
  }
`;
export const NewOpportunityFragmentDoc = gql`
  fragment NewOpportunity on Opportunity {
    id
    nameID
    displayName
  }
`;
export const OrganisationDetailsFragmentDoc = gql`
  fragment OrganisationDetails on Organisation {
    id
    displayName
    profile {
      id
      avatar
      tagsets {
        tags
      }
    }
  }
`;
export const OrganizationProfileInfoFragmentDoc = gql`
  fragment OrganizationProfileInfo on Organisation {
    id
    nameID
    displayName
    profile {
      id
      avatar
      description
      references {
        id
        name
        uri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
`;
export const ProjectDetailsFragmentDoc = gql`
  fragment ProjectDetails on Project {
    id
    nameID
    displayName
    description
    lifecycle {
      state
    }
    tagset {
      name
      tags
    }
  }
`;
export const ReferenceDetailsFragmentDoc = gql`
  fragment ReferenceDetails on Reference {
    id
    name
    uri
    description
  }
`;
export const UserAgentFragmentDoc = gql`
  fragment UserAgent on User {
    agent {
      id
      did
      credentials {
        id
        resourceID
        type
      }
    }
  }
`;
export const UserDetailsFragmentDoc = gql`
  fragment UserDetails on User {
    id
    displayName
    firstName
    lastName
    email
    gender
    country
    city
    phone
    accountUpn
    agent {
      credentials {
        type
        resourceID
      }
    }
    profile {
      id
      description
      avatar
      references {
        id
        name
        uri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
`;
export const UserMembershipDetailsFragmentDoc = gql`
  fragment UserMembershipDetails on UserMembership {
    ecoverses {
      id
      nameID
      displayName
      challenges {
        id
        nameID
        displayName
      }
      opportunities {
        id
        nameID
        displayName
      }
      userGroups {
        id
        nameID
        displayName
      }
    }
    organisations {
      id
      nameID
      displayName
      userGroups {
        id
        nameID
        displayName
      }
    }
  }
`;
export const AllCommunityDetailsFragmentDoc = gql`
  fragment AllCommunityDetails on Community {
    id
    displayName
  }
`;
export const AssignUserToCommunityDocument = gql`
  mutation assignUserToCommunity($input: AssignCommunityMemberInput!) {
    assignUserToCommunity(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserToCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserToCommunityMutation,
  SchemaTypes.AssignUserToCommunityMutationVariables
>;

/**
 * __useAssignUserToCommunityMutation__
 *
 * To run a mutation, you first call `useAssignUserToCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserToCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserToCommunityMutation, { data, loading, error }] = useAssignUserToCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserToCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserToCommunityMutation,
    SchemaTypes.AssignUserToCommunityMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.AssignUserToCommunityMutation,
    SchemaTypes.AssignUserToCommunityMutationVariables
  >(AssignUserToCommunityDocument, baseOptions);
}
export type AssignUserToCommunityMutationHookResult = ReturnType<typeof useAssignUserToCommunityMutation>;
export type AssignUserToCommunityMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserToCommunityMutation>;
export type AssignUserToCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserToCommunityMutation,
  SchemaTypes.AssignUserToCommunityMutationVariables
>;
export const AssignUserToGroupDocument = gql`
  mutation assignUserToGroup($input: AssignUserGroupMemberInput!) {
    assignUserToGroup(membershipData: $input) {
      id
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export type AssignUserToGroupMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserToGroupMutation,
  SchemaTypes.AssignUserToGroupMutationVariables
>;

/**
 * __useAssignUserToGroupMutation__
 *
 * To run a mutation, you first call `useAssignUserToGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserToGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserToGroupMutation, { data, loading, error }] = useAssignUserToGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserToGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserToGroupMutation,
    SchemaTypes.AssignUserToGroupMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.AssignUserToGroupMutation, SchemaTypes.AssignUserToGroupMutationVariables>(
    AssignUserToGroupDocument,
    baseOptions
  );
}
export type AssignUserToGroupMutationHookResult = ReturnType<typeof useAssignUserToGroupMutation>;
export type AssignUserToGroupMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserToGroupMutation>;
export type AssignUserToGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserToGroupMutation,
  SchemaTypes.AssignUserToGroupMutationVariables
>;
export const CreateActorDocument = gql`
  mutation createActor($input: CreateActorInput!) {
    createActor(actorData: $input) {
      id
      name
    }
  }
`;
export type CreateActorMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateActorMutation,
  SchemaTypes.CreateActorMutationVariables
>;

/**
 * __useCreateActorMutation__
 *
 * To run a mutation, you first call `useCreateActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createActorMutation, { data, loading, error }] = useCreateActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateActorMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreateActorMutation, SchemaTypes.CreateActorMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.CreateActorMutation, SchemaTypes.CreateActorMutationVariables>(
    CreateActorDocument,
    baseOptions
  );
}
export type CreateActorMutationHookResult = ReturnType<typeof useCreateActorMutation>;
export type CreateActorMutationResult = Apollo.MutationResult<SchemaTypes.CreateActorMutation>;
export type CreateActorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateActorMutation,
  SchemaTypes.CreateActorMutationVariables
>;
export const CreateActorGroupDocument = gql`
  mutation createActorGroup($input: CreateActorGroupInput!) {
    createActorGroup(actorGroupData: $input) {
      id
      name
    }
  }
`;
export type CreateActorGroupMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateActorGroupMutation,
  SchemaTypes.CreateActorGroupMutationVariables
>;

/**
 * __useCreateActorGroupMutation__
 *
 * To run a mutation, you first call `useCreateActorGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateActorGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createActorGroupMutation, { data, loading, error }] = useCreateActorGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateActorGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateActorGroupMutation,
    SchemaTypes.CreateActorGroupMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateActorGroupMutation, SchemaTypes.CreateActorGroupMutationVariables>(
    CreateActorGroupDocument,
    baseOptions
  );
}
export type CreateActorGroupMutationHookResult = ReturnType<typeof useCreateActorGroupMutation>;
export type CreateActorGroupMutationResult = Apollo.MutationResult<SchemaTypes.CreateActorGroupMutation>;
export type CreateActorGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateActorGroupMutation,
  SchemaTypes.CreateActorGroupMutationVariables
>;
export const CreateApplicationDocument = gql`
  mutation createApplication($input: CreateApplicationInput!) {
    createApplication(applicationData: $input) {
      id
    }
  }
`;
export type CreateApplicationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateApplicationMutation,
  SchemaTypes.CreateApplicationMutationVariables
>;

/**
 * __useCreateApplicationMutation__
 *
 * To run a mutation, you first call `useCreateApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationMutation, { data, loading, error }] = useCreateApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApplicationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateApplicationMutation,
    SchemaTypes.CreateApplicationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateApplicationMutation, SchemaTypes.CreateApplicationMutationVariables>(
    CreateApplicationDocument,
    baseOptions
  );
}
export type CreateApplicationMutationHookResult = ReturnType<typeof useCreateApplicationMutation>;
export type CreateApplicationMutationResult = Apollo.MutationResult<SchemaTypes.CreateApplicationMutation>;
export type CreateApplicationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateApplicationMutation,
  SchemaTypes.CreateApplicationMutationVariables
>;
export const CreateAspectDocument = gql`
  mutation createAspect($input: CreateAspectInput!) {
    createAspect(aspectData: $input) {
      id
      title
    }
  }
`;
export type CreateAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateAspectMutation,
  SchemaTypes.CreateAspectMutationVariables
>;

/**
 * __useCreateAspectMutation__
 *
 * To run a mutation, you first call `useCreateAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAspectMutation, { data, loading, error }] = useCreateAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreateAspectMutation, SchemaTypes.CreateAspectMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.CreateAspectMutation, SchemaTypes.CreateAspectMutationVariables>(
    CreateAspectDocument,
    baseOptions
  );
}
export type CreateAspectMutationHookResult = ReturnType<typeof useCreateAspectMutation>;
export type CreateAspectMutationResult = Apollo.MutationResult<SchemaTypes.CreateAspectMutation>;
export type CreateAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateAspectMutation,
  SchemaTypes.CreateAspectMutationVariables
>;
export const CreateChallengeDocument = gql`
  mutation createChallenge($input: CreateChallengeInput!) {
    createChallenge(challengeData: $input) {
      ...NewChallenge
    }
  }
  ${NewChallengeFragmentDoc}
`;
export type CreateChallengeMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateChallengeMutation,
  SchemaTypes.CreateChallengeMutationVariables
>;

/**
 * __useCreateChallengeMutation__
 *
 * To run a mutation, you first call `useCreateChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChallengeMutation, { data, loading, error }] = useCreateChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateChallengeMutation,
    SchemaTypes.CreateChallengeMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateChallengeMutation, SchemaTypes.CreateChallengeMutationVariables>(
    CreateChallengeDocument,
    baseOptions
  );
}
export type CreateChallengeMutationHookResult = ReturnType<typeof useCreateChallengeMutation>;
export type CreateChallengeMutationResult = Apollo.MutationResult<SchemaTypes.CreateChallengeMutation>;
export type CreateChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateChallengeMutation,
  SchemaTypes.CreateChallengeMutationVariables
>;
export const CreateEcoverseDocument = gql`
  mutation createEcoverse($input: CreateEcoverseInput!) {
    createEcoverse(ecoverseData: $input) {
      ...EcoverseDetails
    }
  }
  ${EcoverseDetailsFragmentDoc}
`;
export type CreateEcoverseMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateEcoverseMutation,
  SchemaTypes.CreateEcoverseMutationVariables
>;

/**
 * __useCreateEcoverseMutation__
 *
 * To run a mutation, you first call `useCreateEcoverseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEcoverseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEcoverseMutation, { data, loading, error }] = useCreateEcoverseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEcoverseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateEcoverseMutation,
    SchemaTypes.CreateEcoverseMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateEcoverseMutation, SchemaTypes.CreateEcoverseMutationVariables>(
    CreateEcoverseDocument,
    baseOptions
  );
}
export type CreateEcoverseMutationHookResult = ReturnType<typeof useCreateEcoverseMutation>;
export type CreateEcoverseMutationResult = Apollo.MutationResult<SchemaTypes.CreateEcoverseMutation>;
export type CreateEcoverseMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateEcoverseMutation,
  SchemaTypes.CreateEcoverseMutationVariables
>;
export const CreateGroupOnCommunityDocument = gql`
  mutation createGroupOnCommunity($input: CreateUserGroupInput!) {
    createGroupOnCommunity(groupData: $input) {
      ...GroupDetails
    }
  }
  ${GroupDetailsFragmentDoc}
`;
export type CreateGroupOnCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateGroupOnCommunityMutation,
  SchemaTypes.CreateGroupOnCommunityMutationVariables
>;

/**
 * __useCreateGroupOnCommunityMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnCommunityMutation, { data, loading, error }] = useCreateGroupOnCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupOnCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateGroupOnCommunityMutation,
    SchemaTypes.CreateGroupOnCommunityMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateGroupOnCommunityMutation,
    SchemaTypes.CreateGroupOnCommunityMutationVariables
  >(CreateGroupOnCommunityDocument, baseOptions);
}
export type CreateGroupOnCommunityMutationHookResult = ReturnType<typeof useCreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationResult = Apollo.MutationResult<SchemaTypes.CreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateGroupOnCommunityMutation,
  SchemaTypes.CreateGroupOnCommunityMutationVariables
>;
export const CreateGroupOnOrganizationDocument = gql`
  mutation createGroupOnOrganization($input: CreateUserGroupInput!) {
    createGroupOnOrganisation(groupData: $input) {
      id
      name
    }
  }
`;
export type CreateGroupOnOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateGroupOnOrganizationMutation,
  SchemaTypes.CreateGroupOnOrganizationMutationVariables
>;

/**
 * __useCreateGroupOnOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnOrganizationMutation, { data, loading, error }] = useCreateGroupOnOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupOnOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateGroupOnOrganizationMutation,
    SchemaTypes.CreateGroupOnOrganizationMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateGroupOnOrganizationMutation,
    SchemaTypes.CreateGroupOnOrganizationMutationVariables
  >(CreateGroupOnOrganizationDocument, baseOptions);
}
export type CreateGroupOnOrganizationMutationHookResult = ReturnType<typeof useCreateGroupOnOrganizationMutation>;
export type CreateGroupOnOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateGroupOnOrganizationMutation>;
export type CreateGroupOnOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateGroupOnOrganizationMutation,
  SchemaTypes.CreateGroupOnOrganizationMutationVariables
>;
export const CreateOpportunityDocument = gql`
  mutation createOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(opportunityData: $input) {
      ...NewOpportunity
    }
  }
  ${NewOpportunityFragmentDoc}
`;
export type CreateOpportunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateOpportunityMutation,
  SchemaTypes.CreateOpportunityMutationVariables
>;

/**
 * __useCreateOpportunityMutation__
 *
 * To run a mutation, you first call `useCreateOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOpportunityMutation, { data, loading, error }] = useCreateOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateOpportunityMutation,
    SchemaTypes.CreateOpportunityMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateOpportunityMutation, SchemaTypes.CreateOpportunityMutationVariables>(
    CreateOpportunityDocument,
    baseOptions
  );
}
export type CreateOpportunityMutationHookResult = ReturnType<typeof useCreateOpportunityMutation>;
export type CreateOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.CreateOpportunityMutation>;
export type CreateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateOpportunityMutation,
  SchemaTypes.CreateOpportunityMutationVariables
>;
export const CreateOrganizationDocument = gql`
  mutation createOrganization($input: CreateOrganisationInput!) {
    createOrganisation(organisationData: $input) {
      id
      nameID
      displayName
    }
  }
`;
export type CreateOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateOrganizationMutation,
  SchemaTypes.CreateOrganizationMutationVariables
>;

/**
 * __useCreateOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationMutation, { data, loading, error }] = useCreateOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateOrganizationMutation,
    SchemaTypes.CreateOrganizationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateOrganizationMutation, SchemaTypes.CreateOrganizationMutationVariables>(
    CreateOrganizationDocument,
    baseOptions
  );
}
export type CreateOrganizationMutationHookResult = ReturnType<typeof useCreateOrganizationMutation>;
export type CreateOrganizationMutationResult = Apollo.MutationResult<SchemaTypes.CreateOrganizationMutation>;
export type CreateOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateOrganizationMutation,
  SchemaTypes.CreateOrganizationMutationVariables
>;
export const CreateProjectDocument = gql`
  mutation createProject($input: CreateProjectInput!) {
    createProject(projectData: $input) {
      ...ProjectDetails
    }
  }
  ${ProjectDetailsFragmentDoc}
`;
export type CreateProjectMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateProjectMutation,
  SchemaTypes.CreateProjectMutationVariables
>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateProjectMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateProjectMutation,
    SchemaTypes.CreateProjectMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateProjectMutation, SchemaTypes.CreateProjectMutationVariables>(
    CreateProjectDocument,
    baseOptions
  );
}
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<SchemaTypes.CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateProjectMutation,
  SchemaTypes.CreateProjectMutationVariables
>;
export const CreateReferenceOnContextDocument = gql`
  mutation createReferenceOnContext($input: CreateReferenceOnContextInput!) {
    createReferenceOnContext(referenceInput: $input) {
      ...ReferenceDetails
    }
  }
  ${ReferenceDetailsFragmentDoc}
`;
export type CreateReferenceOnContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateReferenceOnContextMutation,
  SchemaTypes.CreateReferenceOnContextMutationVariables
>;

/**
 * __useCreateReferenceOnContextMutation__
 *
 * To run a mutation, you first call `useCreateReferenceOnContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReferenceOnContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReferenceOnContextMutation, { data, loading, error }] = useCreateReferenceOnContextMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReferenceOnContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateReferenceOnContextMutation,
    SchemaTypes.CreateReferenceOnContextMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateReferenceOnContextMutation,
    SchemaTypes.CreateReferenceOnContextMutationVariables
  >(CreateReferenceOnContextDocument, baseOptions);
}
export type CreateReferenceOnContextMutationHookResult = ReturnType<typeof useCreateReferenceOnContextMutation>;
export type CreateReferenceOnContextMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateReferenceOnContextMutation>;
export type CreateReferenceOnContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateReferenceOnContextMutation,
  SchemaTypes.CreateReferenceOnContextMutationVariables
>;
export const CreateReferenceOnProfileDocument = gql`
  mutation createReferenceOnProfile($input: CreateReferenceOnProfileInput!) {
    createReferenceOnProfile(referenceInput: $input) {
      id
      name
      description
      uri
    }
  }
`;
export type CreateReferenceOnProfileMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateReferenceOnProfileMutation,
  SchemaTypes.CreateReferenceOnProfileMutationVariables
>;

/**
 * __useCreateReferenceOnProfileMutation__
 *
 * To run a mutation, you first call `useCreateReferenceOnProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReferenceOnProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReferenceOnProfileMutation, { data, loading, error }] = useCreateReferenceOnProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReferenceOnProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateReferenceOnProfileMutation,
    SchemaTypes.CreateReferenceOnProfileMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateReferenceOnProfileMutation,
    SchemaTypes.CreateReferenceOnProfileMutationVariables
  >(CreateReferenceOnProfileDocument, baseOptions);
}
export type CreateReferenceOnProfileMutationHookResult = ReturnType<typeof useCreateReferenceOnProfileMutation>;
export type CreateReferenceOnProfileMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateReferenceOnProfileMutation>;
export type CreateReferenceOnProfileMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateReferenceOnProfileMutation,
  SchemaTypes.CreateReferenceOnProfileMutationVariables
>;
export const CreateRelationDocument = gql`
  mutation createRelation($input: CreateRelationInput!) {
    createRelation(relationData: $input) {
      id
    }
  }
`;
export type CreateRelationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateRelationMutation,
  SchemaTypes.CreateRelationMutationVariables
>;

/**
 * __useCreateRelationMutation__
 *
 * To run a mutation, you first call `useCreateRelationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRelationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRelationMutation, { data, loading, error }] = useCreateRelationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRelationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateRelationMutation,
    SchemaTypes.CreateRelationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.CreateRelationMutation, SchemaTypes.CreateRelationMutationVariables>(
    CreateRelationDocument,
    baseOptions
  );
}
export type CreateRelationMutationHookResult = ReturnType<typeof useCreateRelationMutation>;
export type CreateRelationMutationResult = Apollo.MutationResult<SchemaTypes.CreateRelationMutation>;
export type CreateRelationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateRelationMutation,
  SchemaTypes.CreateRelationMutationVariables
>;
export const CreateTagsetOnProfileDocument = gql`
  mutation createTagsetOnProfile($input: CreateTagsetOnProfileInput!) {
    createTagsetOnProfile(tagsetData: $input) {
      id
      name
      tags
    }
  }
`;
export type CreateTagsetOnProfileMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateTagsetOnProfileMutation,
  SchemaTypes.CreateTagsetOnProfileMutationVariables
>;

/**
 * __useCreateTagsetOnProfileMutation__
 *
 * To run a mutation, you first call `useCreateTagsetOnProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagsetOnProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagsetOnProfileMutation, { data, loading, error }] = useCreateTagsetOnProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTagsetOnProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateTagsetOnProfileMutation,
    SchemaTypes.CreateTagsetOnProfileMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateTagsetOnProfileMutation,
    SchemaTypes.CreateTagsetOnProfileMutationVariables
  >(CreateTagsetOnProfileDocument, baseOptions);
}
export type CreateTagsetOnProfileMutationHookResult = ReturnType<typeof useCreateTagsetOnProfileMutation>;
export type CreateTagsetOnProfileMutationResult = Apollo.MutationResult<SchemaTypes.CreateTagsetOnProfileMutation>;
export type CreateTagsetOnProfileMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateTagsetOnProfileMutation,
  SchemaTypes.CreateTagsetOnProfileMutationVariables
>;
export const CreateUserDocument = gql`
  mutation createUser($input: CreateUserInput!) {
    createUser(userData: $input) {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type CreateUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateUserMutation,
  SchemaTypes.CreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreateUserMutation, SchemaTypes.CreateUserMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.CreateUserMutation, SchemaTypes.CreateUserMutationVariables>(
    CreateUserDocument,
    baseOptions
  );
}
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<SchemaTypes.CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateUserMutation,
  SchemaTypes.CreateUserMutationVariables
>;
export const CreateUserNewRegistrationDocument = gql`
  mutation createUserNewRegistration {
    createUserNewRegistration {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type CreateUserNewRegistrationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateUserNewRegistrationMutation,
  SchemaTypes.CreateUserNewRegistrationMutationVariables
>;

/**
 * __useCreateUserNewRegistrationMutation__
 *
 * To run a mutation, you first call `useCreateUserNewRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserNewRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserNewRegistrationMutation, { data, loading, error }] = useCreateUserNewRegistrationMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateUserNewRegistrationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateUserNewRegistrationMutation,
    SchemaTypes.CreateUserNewRegistrationMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.CreateUserNewRegistrationMutation,
    SchemaTypes.CreateUserNewRegistrationMutationVariables
  >(CreateUserNewRegistrationDocument, baseOptions);
}
export type CreateUserNewRegistrationMutationHookResult = ReturnType<typeof useCreateUserNewRegistrationMutation>;
export type CreateUserNewRegistrationMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateUserNewRegistrationMutation>;
export type CreateUserNewRegistrationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateUserNewRegistrationMutation,
  SchemaTypes.CreateUserNewRegistrationMutationVariables
>;
export const DeleteActorDocument = gql`
  mutation deleteActor($input: DeleteActorInput!) {
    deleteActor(deleteData: $input) {
      id
    }
  }
`;
export type DeleteActorMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteActorMutation,
  SchemaTypes.DeleteActorMutationVariables
>;

/**
 * __useDeleteActorMutation__
 *
 * To run a mutation, you first call `useDeleteActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteActorMutation, { data, loading, error }] = useDeleteActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteActorMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteActorMutation, SchemaTypes.DeleteActorMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.DeleteActorMutation, SchemaTypes.DeleteActorMutationVariables>(
    DeleteActorDocument,
    baseOptions
  );
}
export type DeleteActorMutationHookResult = ReturnType<typeof useDeleteActorMutation>;
export type DeleteActorMutationResult = Apollo.MutationResult<SchemaTypes.DeleteActorMutation>;
export type DeleteActorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteActorMutation,
  SchemaTypes.DeleteActorMutationVariables
>;
export const DeleteAspectDocument = gql`
  mutation deleteAspect($input: DeleteAspectInput!) {
    deleteAspect(deleteData: $input) {
      id
    }
  }
`;
export type DeleteAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteAspectMutation,
  SchemaTypes.DeleteAspectMutationVariables
>;

/**
 * __useDeleteAspectMutation__
 *
 * To run a mutation, you first call `useDeleteAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAspectMutation, { data, loading, error }] = useDeleteAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteAspectMutation, SchemaTypes.DeleteAspectMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.DeleteAspectMutation, SchemaTypes.DeleteAspectMutationVariables>(
    DeleteAspectDocument,
    baseOptions
  );
}
export type DeleteAspectMutationHookResult = ReturnType<typeof useDeleteAspectMutation>;
export type DeleteAspectMutationResult = Apollo.MutationResult<SchemaTypes.DeleteAspectMutation>;
export type DeleteAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteAspectMutation,
  SchemaTypes.DeleteAspectMutationVariables
>;
export const DeleteChallengeDocument = gql`
  mutation deleteChallenge($input: DeleteChallengeInput!) {
    deleteChallenge(deleteData: $input) {
      id
      nameID
    }
  }
`;
export type DeleteChallengeMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteChallengeMutation,
  SchemaTypes.DeleteChallengeMutationVariables
>;

/**
 * __useDeleteChallengeMutation__
 *
 * To run a mutation, you first call `useDeleteChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChallengeMutation, { data, loading, error }] = useDeleteChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteChallengeMutation,
    SchemaTypes.DeleteChallengeMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteChallengeMutation, SchemaTypes.DeleteChallengeMutationVariables>(
    DeleteChallengeDocument,
    baseOptions
  );
}
export type DeleteChallengeMutationHookResult = ReturnType<typeof useDeleteChallengeMutation>;
export type DeleteChallengeMutationResult = Apollo.MutationResult<SchemaTypes.DeleteChallengeMutation>;
export type DeleteChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteChallengeMutation,
  SchemaTypes.DeleteChallengeMutationVariables
>;
export const DeleteEcoverseDocument = gql`
  mutation deleteEcoverse($input: DeleteEcoverseInput!) {
    deleteEcoverse(deleteData: $input) {
      id
      nameID
    }
  }
`;
export type DeleteEcoverseMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteEcoverseMutation,
  SchemaTypes.DeleteEcoverseMutationVariables
>;

/**
 * __useDeleteEcoverseMutation__
 *
 * To run a mutation, you first call `useDeleteEcoverseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEcoverseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEcoverseMutation, { data, loading, error }] = useDeleteEcoverseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteEcoverseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteEcoverseMutation,
    SchemaTypes.DeleteEcoverseMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteEcoverseMutation, SchemaTypes.DeleteEcoverseMutationVariables>(
    DeleteEcoverseDocument,
    baseOptions
  );
}
export type DeleteEcoverseMutationHookResult = ReturnType<typeof useDeleteEcoverseMutation>;
export type DeleteEcoverseMutationResult = Apollo.MutationResult<SchemaTypes.DeleteEcoverseMutation>;
export type DeleteEcoverseMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteEcoverseMutation,
  SchemaTypes.DeleteEcoverseMutationVariables
>;
export const DeleteGroupDocument = gql`
  mutation deleteGroup($input: DeleteUserGroupInput!) {
    deleteUserGroup(deleteData: $input) {
      id
    }
  }
`;
export type DeleteGroupMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteGroupMutation,
  SchemaTypes.DeleteGroupMutationVariables
>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteGroupMutation, SchemaTypes.DeleteGroupMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.DeleteGroupMutation, SchemaTypes.DeleteGroupMutationVariables>(
    DeleteGroupDocument,
    baseOptions
  );
}
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<SchemaTypes.DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteGroupMutation,
  SchemaTypes.DeleteGroupMutationVariables
>;
export const DeleteOpportunityDocument = gql`
  mutation deleteOpportunity($input: DeleteOpportunityInput!) {
    deleteOpportunity(deleteData: $input) {
      id
      nameID
    }
  }
`;
export type DeleteOpportunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteOpportunityMutation,
  SchemaTypes.DeleteOpportunityMutationVariables
>;

/**
 * __useDeleteOpportunityMutation__
 *
 * To run a mutation, you first call `useDeleteOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOpportunityMutation, { data, loading, error }] = useDeleteOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteOpportunityMutation,
    SchemaTypes.DeleteOpportunityMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteOpportunityMutation, SchemaTypes.DeleteOpportunityMutationVariables>(
    DeleteOpportunityDocument,
    baseOptions
  );
}
export type DeleteOpportunityMutationHookResult = ReturnType<typeof useDeleteOpportunityMutation>;
export type DeleteOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.DeleteOpportunityMutation>;
export type DeleteOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteOpportunityMutation,
  SchemaTypes.DeleteOpportunityMutationVariables
>;
export const DeleteOrganizationDocument = gql`
  mutation deleteOrganization($input: DeleteOrganisationInput!) {
    deleteOrganisation(deleteData: $input) {
      id
    }
  }
`;
export type DeleteOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteOrganizationMutation,
  SchemaTypes.DeleteOrganizationMutationVariables
>;

/**
 * __useDeleteOrganizationMutation__
 *
 * To run a mutation, you first call `useDeleteOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganizationMutation, { data, loading, error }] = useDeleteOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteOrganizationMutation,
    SchemaTypes.DeleteOrganizationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteOrganizationMutation, SchemaTypes.DeleteOrganizationMutationVariables>(
    DeleteOrganizationDocument,
    baseOptions
  );
}
export type DeleteOrganizationMutationHookResult = ReturnType<typeof useDeleteOrganizationMutation>;
export type DeleteOrganizationMutationResult = Apollo.MutationResult<SchemaTypes.DeleteOrganizationMutation>;
export type DeleteOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteOrganizationMutation,
  SchemaTypes.DeleteOrganizationMutationVariables
>;
export const DeleteReferenceDocument = gql`
  mutation deleteReference($input: DeleteReferenceInput!) {
    deleteReference(deleteData: $input) {
      id
    }
  }
`;
export type DeleteReferenceMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteReferenceMutation,
  SchemaTypes.DeleteReferenceMutationVariables
>;

/**
 * __useDeleteReferenceMutation__
 *
 * To run a mutation, you first call `useDeleteReferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteReferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteReferenceMutation, { data, loading, error }] = useDeleteReferenceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteReferenceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteReferenceMutation,
    SchemaTypes.DeleteReferenceMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteReferenceMutation, SchemaTypes.DeleteReferenceMutationVariables>(
    DeleteReferenceDocument,
    baseOptions
  );
}
export type DeleteReferenceMutationHookResult = ReturnType<typeof useDeleteReferenceMutation>;
export type DeleteReferenceMutationResult = Apollo.MutationResult<SchemaTypes.DeleteReferenceMutation>;
export type DeleteReferenceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteReferenceMutation,
  SchemaTypes.DeleteReferenceMutationVariables
>;
export const DeleteRelationDocument = gql`
  mutation deleteRelation($input: DeleteRelationInput!) {
    deleteRelation(deleteData: $input) {
      id
    }
  }
`;
export type DeleteRelationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteRelationMutation,
  SchemaTypes.DeleteRelationMutationVariables
>;

/**
 * __useDeleteRelationMutation__
 *
 * To run a mutation, you first call `useDeleteRelationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRelationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRelationMutation, { data, loading, error }] = useDeleteRelationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteRelationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteRelationMutation,
    SchemaTypes.DeleteRelationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.DeleteRelationMutation, SchemaTypes.DeleteRelationMutationVariables>(
    DeleteRelationDocument,
    baseOptions
  );
}
export type DeleteRelationMutationHookResult = ReturnType<typeof useDeleteRelationMutation>;
export type DeleteRelationMutationResult = Apollo.MutationResult<SchemaTypes.DeleteRelationMutation>;
export type DeleteRelationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteRelationMutation,
  SchemaTypes.DeleteRelationMutationVariables
>;
export const DeleteUserDocument = gql`
  mutation deleteUser($input: DeleteUserInput!) {
    deleteUser(deleteData: $input) {
      id
    }
  }
`;
export type DeleteUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteUserMutation,
  SchemaTypes.DeleteUserMutationVariables
>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteUserMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteUserMutation, SchemaTypes.DeleteUserMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.DeleteUserMutation, SchemaTypes.DeleteUserMutationVariables>(
    DeleteUserDocument,
    baseOptions
  );
}
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<SchemaTypes.DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteUserMutation,
  SchemaTypes.DeleteUserMutationVariables
>;
export const EventOnApplicationDocument = gql`
  mutation eventOnApplication($input: ApplicationEventInput!) {
    eventOnApplication(applicationEventData: $input) {
      id
      lifecycle {
        id
        nextEvents
        state
      }
    }
  }
`;
export type EventOnApplicationMutationFn = Apollo.MutationFunction<
  SchemaTypes.EventOnApplicationMutation,
  SchemaTypes.EventOnApplicationMutationVariables
>;

/**
 * __useEventOnApplicationMutation__
 *
 * To run a mutation, you first call `useEventOnApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEventOnApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [eventOnApplicationMutation, { data, loading, error }] = useEventOnApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEventOnApplicationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.EventOnApplicationMutation,
    SchemaTypes.EventOnApplicationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.EventOnApplicationMutation, SchemaTypes.EventOnApplicationMutationVariables>(
    EventOnApplicationDocument,
    baseOptions
  );
}
export type EventOnApplicationMutationHookResult = ReturnType<typeof useEventOnApplicationMutation>;
export type EventOnApplicationMutationResult = Apollo.MutationResult<SchemaTypes.EventOnApplicationMutation>;
export type EventOnApplicationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.EventOnApplicationMutation,
  SchemaTypes.EventOnApplicationMutationVariables
>;
export const EventOnChallengeDocument = gql`
  mutation eventOnChallenge($input: ChallengeEventInput!) {
    eventOnChallenge(challengeEventData: $input) {
      id
      lifecycle {
        id
        nextEvents
        state
      }
    }
  }
`;
export type EventOnChallengeMutationFn = Apollo.MutationFunction<
  SchemaTypes.EventOnChallengeMutation,
  SchemaTypes.EventOnChallengeMutationVariables
>;

/**
 * __useEventOnChallengeMutation__
 *
 * To run a mutation, you first call `useEventOnChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEventOnChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [eventOnChallengeMutation, { data, loading, error }] = useEventOnChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEventOnChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.EventOnChallengeMutation,
    SchemaTypes.EventOnChallengeMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.EventOnChallengeMutation, SchemaTypes.EventOnChallengeMutationVariables>(
    EventOnChallengeDocument,
    baseOptions
  );
}
export type EventOnChallengeMutationHookResult = ReturnType<typeof useEventOnChallengeMutation>;
export type EventOnChallengeMutationResult = Apollo.MutationResult<SchemaTypes.EventOnChallengeMutation>;
export type EventOnChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.EventOnChallengeMutation,
  SchemaTypes.EventOnChallengeMutationVariables
>;
export const EventOnOpportunityDocument = gql`
  mutation eventOnOpportunity($input: OpportunityEventInput!) {
    eventOnOpportunity(opportunityEventData: $input) {
      id
      lifecycle {
        id
        nextEvents
        state
      }
    }
  }
`;
export type EventOnOpportunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.EventOnOpportunityMutation,
  SchemaTypes.EventOnOpportunityMutationVariables
>;

/**
 * __useEventOnOpportunityMutation__
 *
 * To run a mutation, you first call `useEventOnOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEventOnOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [eventOnOpportunityMutation, { data, loading, error }] = useEventOnOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEventOnOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.EventOnOpportunityMutation,
    SchemaTypes.EventOnOpportunityMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.EventOnOpportunityMutation, SchemaTypes.EventOnOpportunityMutationVariables>(
    EventOnOpportunityDocument,
    baseOptions
  );
}
export type EventOnOpportunityMutationHookResult = ReturnType<typeof useEventOnOpportunityMutation>;
export type EventOnOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.EventOnOpportunityMutation>;
export type EventOnOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.EventOnOpportunityMutation,
  SchemaTypes.EventOnOpportunityMutationVariables
>;
export const GrantCredentialsDocument = gql`
  mutation grantCredentials($input: GrantAuthorizationCredentialInput!) {
    grantCredentialToUser(grantCredentialData: $input) {
      id
      displayName
      ...UserAgent
    }
  }
  ${UserAgentFragmentDoc}
`;
export type GrantCredentialsMutationFn = Apollo.MutationFunction<
  SchemaTypes.GrantCredentialsMutation,
  SchemaTypes.GrantCredentialsMutationVariables
>;

/**
 * __useGrantCredentialsMutation__
 *
 * To run a mutation, you first call `useGrantCredentialsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGrantCredentialsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [grantCredentialsMutation, { data, loading, error }] = useGrantCredentialsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGrantCredentialsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.GrantCredentialsMutation,
    SchemaTypes.GrantCredentialsMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.GrantCredentialsMutation, SchemaTypes.GrantCredentialsMutationVariables>(
    GrantCredentialsDocument,
    baseOptions
  );
}
export type GrantCredentialsMutationHookResult = ReturnType<typeof useGrantCredentialsMutation>;
export type GrantCredentialsMutationResult = Apollo.MutationResult<SchemaTypes.GrantCredentialsMutation>;
export type GrantCredentialsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.GrantCredentialsMutation,
  SchemaTypes.GrantCredentialsMutationVariables
>;
export const RemoveUserFromCommunityDocument = gql`
  mutation removeUserFromCommunity($input: RemoveCommunityMemberInput!) {
    removeUserFromCommunity(membershipData: $input) {
      id
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export type RemoveUserFromCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserFromCommunityMutation,
  SchemaTypes.RemoveUserFromCommunityMutationVariables
>;

/**
 * __useRemoveUserFromCommunityMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromCommunityMutation, { data, loading, error }] = useRemoveUserFromCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserFromCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserFromCommunityMutation,
    SchemaTypes.RemoveUserFromCommunityMutationVariables
  >
) {
  return Apollo.useMutation<
    SchemaTypes.RemoveUserFromCommunityMutation,
    SchemaTypes.RemoveUserFromCommunityMutationVariables
  >(RemoveUserFromCommunityDocument, baseOptions);
}
export type RemoveUserFromCommunityMutationHookResult = ReturnType<typeof useRemoveUserFromCommunityMutation>;
export type RemoveUserFromCommunityMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserFromCommunityMutation>;
export type RemoveUserFromCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserFromCommunityMutation,
  SchemaTypes.RemoveUserFromCommunityMutationVariables
>;
export const RemoveUserFromGroupDocument = gql`
  mutation removeUserFromGroup($input: RemoveUserGroupMemberInput!) {
    removeUserFromGroup(membershipData: $input) {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export type RemoveUserFromGroupMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserFromGroupMutation,
  SchemaTypes.RemoveUserFromGroupMutationVariables
>;

/**
 * __useRemoveUserFromGroupMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromGroupMutation, { data, loading, error }] = useRemoveUserFromGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserFromGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserFromGroupMutation,
    SchemaTypes.RemoveUserFromGroupMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.RemoveUserFromGroupMutation, SchemaTypes.RemoveUserFromGroupMutationVariables>(
    RemoveUserFromGroupDocument,
    baseOptions
  );
}
export type RemoveUserFromGroupMutationHookResult = ReturnType<typeof useRemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserFromGroupMutation,
  SchemaTypes.RemoveUserFromGroupMutationVariables
>;
export const RevokeCredentialsDocument = gql`
  mutation revokeCredentials($input: RevokeAuthorizationCredentialInput!) {
    revokeCredentialFromUser(revokeCredentialData: $input) {
      id
      displayName
      ...UserAgent
    }
  }
  ${UserAgentFragmentDoc}
`;
export type RevokeCredentialsMutationFn = Apollo.MutationFunction<
  SchemaTypes.RevokeCredentialsMutation,
  SchemaTypes.RevokeCredentialsMutationVariables
>;

/**
 * __useRevokeCredentialsMutation__
 *
 * To run a mutation, you first call `useRevokeCredentialsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeCredentialsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeCredentialsMutation, { data, loading, error }] = useRevokeCredentialsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRevokeCredentialsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RevokeCredentialsMutation,
    SchemaTypes.RevokeCredentialsMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.RevokeCredentialsMutation, SchemaTypes.RevokeCredentialsMutationVariables>(
    RevokeCredentialsDocument,
    baseOptions
  );
}
export type RevokeCredentialsMutationHookResult = ReturnType<typeof useRevokeCredentialsMutation>;
export type RevokeCredentialsMutationResult = Apollo.MutationResult<SchemaTypes.RevokeCredentialsMutation>;
export type RevokeCredentialsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RevokeCredentialsMutation,
  SchemaTypes.RevokeCredentialsMutationVariables
>;
export const UpdateActorDocument = gql`
  mutation updateActor($input: UpdateActorInput!) {
    updateActor(actorData: $input) {
      id
      name
    }
  }
`;
export type UpdateActorMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateActorMutation,
  SchemaTypes.UpdateActorMutationVariables
>;

/**
 * __useUpdateActorMutation__
 *
 * To run a mutation, you first call `useUpdateActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateActorMutation, { data, loading, error }] = useUpdateActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateActorMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateActorMutation, SchemaTypes.UpdateActorMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.UpdateActorMutation, SchemaTypes.UpdateActorMutationVariables>(
    UpdateActorDocument,
    baseOptions
  );
}
export type UpdateActorMutationHookResult = ReturnType<typeof useUpdateActorMutation>;
export type UpdateActorMutationResult = Apollo.MutationResult<SchemaTypes.UpdateActorMutation>;
export type UpdateActorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateActorMutation,
  SchemaTypes.UpdateActorMutationVariables
>;
export const UpdateAspectDocument = gql`
  mutation updateAspect($input: UpdateAspectInput!) {
    updateAspect(aspectData: $input) {
      id
      title
    }
  }
`;
export type UpdateAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateAspectMutation,
  SchemaTypes.UpdateAspectMutationVariables
>;

/**
 * __useUpdateAspectMutation__
 *
 * To run a mutation, you first call `useUpdateAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAspectMutation, { data, loading, error }] = useUpdateAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateAspectMutation, SchemaTypes.UpdateAspectMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.UpdateAspectMutation, SchemaTypes.UpdateAspectMutationVariables>(
    UpdateAspectDocument,
    baseOptions
  );
}
export type UpdateAspectMutationHookResult = ReturnType<typeof useUpdateAspectMutation>;
export type UpdateAspectMutationResult = Apollo.MutationResult<SchemaTypes.UpdateAspectMutation>;
export type UpdateAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateAspectMutation,
  SchemaTypes.UpdateAspectMutationVariables
>;
export const UpdateChallengeDocument = gql`
  mutation updateChallenge($input: UpdateChallengeInput!) {
    updateChallenge(challengeData: $input) {
      id
      nameID
      displayName
    }
  }
`;
export type UpdateChallengeMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateChallengeMutation,
  SchemaTypes.UpdateChallengeMutationVariables
>;

/**
 * __useUpdateChallengeMutation__
 *
 * To run a mutation, you first call `useUpdateChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChallengeMutation, { data, loading, error }] = useUpdateChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateChallengeMutation,
    SchemaTypes.UpdateChallengeMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.UpdateChallengeMutation, SchemaTypes.UpdateChallengeMutationVariables>(
    UpdateChallengeDocument,
    baseOptions
  );
}
export type UpdateChallengeMutationHookResult = ReturnType<typeof useUpdateChallengeMutation>;
export type UpdateChallengeMutationResult = Apollo.MutationResult<SchemaTypes.UpdateChallengeMutation>;
export type UpdateChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateChallengeMutation,
  SchemaTypes.UpdateChallengeMutationVariables
>;
export const UpdateEcoverseDocument = gql`
  mutation updateEcoverse($input: UpdateEcoverseInput!) {
    updateEcoverse(ecoverseData: $input) {
      ...EcoverseDetails
    }
  }
  ${EcoverseDetailsFragmentDoc}
`;
export type UpdateEcoverseMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateEcoverseMutation,
  SchemaTypes.UpdateEcoverseMutationVariables
>;

/**
 * __useUpdateEcoverseMutation__
 *
 * To run a mutation, you first call `useUpdateEcoverseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEcoverseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEcoverseMutation, { data, loading, error }] = useUpdateEcoverseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateEcoverseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateEcoverseMutation,
    SchemaTypes.UpdateEcoverseMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.UpdateEcoverseMutation, SchemaTypes.UpdateEcoverseMutationVariables>(
    UpdateEcoverseDocument,
    baseOptions
  );
}
export type UpdateEcoverseMutationHookResult = ReturnType<typeof useUpdateEcoverseMutation>;
export type UpdateEcoverseMutationResult = Apollo.MutationResult<SchemaTypes.UpdateEcoverseMutation>;
export type UpdateEcoverseMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateEcoverseMutation,
  SchemaTypes.UpdateEcoverseMutationVariables
>;
export const UpdateGroupDocument = gql`
  mutation updateGroup($input: UpdateUserGroupInput!) {
    updateUserGroup(userGroupData: $input) {
      id
      name
      profile {
        id
        avatar
        description
        references {
          uri
          name
          description
        }
        tagsets {
          name
          tags
        }
      }
    }
  }
`;
export type UpdateGroupMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateGroupMutation,
  SchemaTypes.UpdateGroupMutationVariables
>;

/**
 * __useUpdateGroupMutation__
 *
 * To run a mutation, you first call `useUpdateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupMutation, { data, loading, error }] = useUpdateGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateGroupMutation, SchemaTypes.UpdateGroupMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.UpdateGroupMutation, SchemaTypes.UpdateGroupMutationVariables>(
    UpdateGroupDocument,
    baseOptions
  );
}
export type UpdateGroupMutationHookResult = ReturnType<typeof useUpdateGroupMutation>;
export type UpdateGroupMutationResult = Apollo.MutationResult<SchemaTypes.UpdateGroupMutation>;
export type UpdateGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateGroupMutation,
  SchemaTypes.UpdateGroupMutationVariables
>;
export const UpdateOpportunityDocument = gql`
  mutation updateOpportunity($input: UpdateOpportunityInput!) {
    updateOpportunity(opportunityData: $input) {
      id
      displayName
    }
  }
`;
export type UpdateOpportunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateOpportunityMutation,
  SchemaTypes.UpdateOpportunityMutationVariables
>;

/**
 * __useUpdateOpportunityMutation__
 *
 * To run a mutation, you first call `useUpdateOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOpportunityMutation, { data, loading, error }] = useUpdateOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateOpportunityMutation,
    SchemaTypes.UpdateOpportunityMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.UpdateOpportunityMutation, SchemaTypes.UpdateOpportunityMutationVariables>(
    UpdateOpportunityDocument,
    baseOptions
  );
}
export type UpdateOpportunityMutationHookResult = ReturnType<typeof useUpdateOpportunityMutation>;
export type UpdateOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.UpdateOpportunityMutation>;
export type UpdateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateOpportunityMutation,
  SchemaTypes.UpdateOpportunityMutationVariables
>;
export const UpdateOrganizationDocument = gql`
  mutation updateOrganization($input: UpdateOrganisationInput!) {
    updateOrganisation(organisationData: $input) {
      ...OrganizationProfileInfo
    }
  }
  ${OrganizationProfileInfoFragmentDoc}
`;
export type UpdateOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateOrganizationMutation,
  SchemaTypes.UpdateOrganizationMutationVariables
>;

/**
 * __useUpdateOrganizationMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationMutation, { data, loading, error }] = useUpdateOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateOrganizationMutation,
    SchemaTypes.UpdateOrganizationMutationVariables
  >
) {
  return Apollo.useMutation<SchemaTypes.UpdateOrganizationMutation, SchemaTypes.UpdateOrganizationMutationVariables>(
    UpdateOrganizationDocument,
    baseOptions
  );
}
export type UpdateOrganizationMutationHookResult = ReturnType<typeof useUpdateOrganizationMutation>;
export type UpdateOrganizationMutationResult = Apollo.MutationResult<SchemaTypes.UpdateOrganizationMutation>;
export type UpdateOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateOrganizationMutation,
  SchemaTypes.UpdateOrganizationMutationVariables
>;
export const UpdateUserDocument = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(userData: $input) {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateUserMutation,
  SchemaTypes.UpdateUserMutationVariables
>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateUserMutation, SchemaTypes.UpdateUserMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.UpdateUserMutation, SchemaTypes.UpdateUserMutationVariables>(
    UpdateUserDocument,
    baseOptions
  );
}
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<SchemaTypes.UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateUserMutation,
  SchemaTypes.UpdateUserMutationVariables
>;
export const UploadAvatarDocument = gql`
  mutation uploadAvatar($file: Upload!, $input: UploadProfileAvatarInput!) {
    uploadAvatar(file: $file, uploadData: $input) {
      id
      avatar
    }
  }
`;
export type UploadAvatarMutationFn = Apollo.MutationFunction<
  SchemaTypes.UploadAvatarMutation,
  SchemaTypes.UploadAvatarMutationVariables
>;

/**
 * __useUploadAvatarMutation__
 *
 * To run a mutation, you first call `useUploadAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadAvatarMutation, { data, loading, error }] = useUploadAvatarMutation({
 *   variables: {
 *      file: // value for 'file'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUploadAvatarMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UploadAvatarMutation, SchemaTypes.UploadAvatarMutationVariables>
) {
  return Apollo.useMutation<SchemaTypes.UploadAvatarMutation, SchemaTypes.UploadAvatarMutationVariables>(
    UploadAvatarDocument,
    baseOptions
  );
}
export type UploadAvatarMutationHookResult = ReturnType<typeof useUploadAvatarMutation>;
export type UploadAvatarMutationResult = Apollo.MutationResult<SchemaTypes.UploadAvatarMutation>;
export type UploadAvatarMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadAvatarMutation,
  SchemaTypes.UploadAvatarMutationVariables
>;
export const AllOpportunitiesDocument = gql`
  query allOpportunities($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunities {
        id
        nameID
      }
    }
  }
`;

/**
 * __useAllOpportunitiesQuery__
 *
 * To run a query within a React component, call `useAllOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllOpportunitiesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useAllOpportunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AllOpportunitiesQuery, SchemaTypes.AllOpportunitiesQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.AllOpportunitiesQuery, SchemaTypes.AllOpportunitiesQueryVariables>(
    AllOpportunitiesDocument,
    baseOptions
  );
}
export function useAllOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AllOpportunitiesQuery,
    SchemaTypes.AllOpportunitiesQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.AllOpportunitiesQuery, SchemaTypes.AllOpportunitiesQueryVariables>(
    AllOpportunitiesDocument,
    baseOptions
  );
}
export type AllOpportunitiesQueryHookResult = ReturnType<typeof useAllOpportunitiesQuery>;
export type AllOpportunitiesLazyQueryHookResult = ReturnType<typeof useAllOpportunitiesLazyQuery>;
export type AllOpportunitiesQueryResult = Apollo.QueryResult<
  SchemaTypes.AllOpportunitiesQuery,
  SchemaTypes.AllOpportunitiesQueryVariables
>;
export function refetchAllOpportunitiesQuery(variables?: SchemaTypes.AllOpportunitiesQueryVariables) {
  return { query: AllOpportunitiesDocument, variables: variables };
}
export const ChallengeApplicationDocument = gql`
  query challengeApplication($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        displayName
        context {
          ...ContextDetails
        }
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useChallengeApplicationQuery__
 *
 * To run a query within a React component, call `useChallengeApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeApplicationQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeApplicationQuery,
    SchemaTypes.ChallengeApplicationQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengeApplicationQuery, SchemaTypes.ChallengeApplicationQueryVariables>(
    ChallengeApplicationDocument,
    baseOptions
  );
}
export function useChallengeApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationQuery,
    SchemaTypes.ChallengeApplicationQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeApplicationQuery, SchemaTypes.ChallengeApplicationQueryVariables>(
    ChallengeApplicationDocument,
    baseOptions
  );
}
export type ChallengeApplicationQueryHookResult = ReturnType<typeof useChallengeApplicationQuery>;
export type ChallengeApplicationLazyQueryHookResult = ReturnType<typeof useChallengeApplicationLazyQuery>;
export type ChallengeApplicationQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeApplicationQuery,
  SchemaTypes.ChallengeApplicationQueryVariables
>;
export function refetchChallengeApplicationQuery(variables?: SchemaTypes.ChallengeApplicationQueryVariables) {
  return { query: ChallengeApplicationDocument, variables: variables };
}
export const ChallengeApplicationsDocument = gql`
  query challengeApplications($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        community {
          id
          applications {
            ...ApplicationInfo
          }
        }
      }
    }
  }
  ${ApplicationInfoFragmentDoc}
`;

/**
 * __useChallengeApplicationsQuery__
 *
 * To run a query within a React component, call `useChallengeApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeApplicationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeApplicationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeApplicationsQuery,
    SchemaTypes.ChallengeApplicationsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengeApplicationsQuery, SchemaTypes.ChallengeApplicationsQueryVariables>(
    ChallengeApplicationsDocument,
    baseOptions
  );
}
export function useChallengeApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationsQuery,
    SchemaTypes.ChallengeApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeApplicationsQuery, SchemaTypes.ChallengeApplicationsQueryVariables>(
    ChallengeApplicationsDocument,
    baseOptions
  );
}
export type ChallengeApplicationsQueryHookResult = ReturnType<typeof useChallengeApplicationsQuery>;
export type ChallengeApplicationsLazyQueryHookResult = ReturnType<typeof useChallengeApplicationsLazyQuery>;
export type ChallengeApplicationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeApplicationsQuery,
  SchemaTypes.ChallengeApplicationsQueryVariables
>;
export function refetchChallengeApplicationsQuery(variables?: SchemaTypes.ChallengeApplicationsQueryVariables) {
  return { query: ChallengeApplicationsDocument, variables: variables };
}
export const EcoverseApplicationDocument = gql`
  query ecoverseApplication($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      displayName
      context {
        ...ContextDetails
      }
      community {
        id
        displayName
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useEcoverseApplicationQuery__
 *
 * To run a query within a React component, call `useEcoverseApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseApplicationQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseApplicationQuery,
    SchemaTypes.EcoverseApplicationQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoverseApplicationQuery, SchemaTypes.EcoverseApplicationQueryVariables>(
    EcoverseApplicationDocument,
    baseOptions
  );
}
export function useEcoverseApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationQuery,
    SchemaTypes.EcoverseApplicationQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseApplicationQuery, SchemaTypes.EcoverseApplicationQueryVariables>(
    EcoverseApplicationDocument,
    baseOptions
  );
}
export type EcoverseApplicationQueryHookResult = ReturnType<typeof useEcoverseApplicationQuery>;
export type EcoverseApplicationLazyQueryHookResult = ReturnType<typeof useEcoverseApplicationLazyQuery>;
export type EcoverseApplicationQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseApplicationQuery,
  SchemaTypes.EcoverseApplicationQueryVariables
>;
export function refetchEcoverseApplicationQuery(variables?: SchemaTypes.EcoverseApplicationQueryVariables) {
  return { query: EcoverseApplicationDocument, variables: variables };
}
export const EcoverseApplicationsDocument = gql`
  query ecoverseApplications($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community {
        id
        applications {
          ...ApplicationInfo
        }
      }
    }
  }
  ${ApplicationInfoFragmentDoc}
`;

/**
 * __useEcoverseApplicationsQuery__
 *
 * To run a query within a React component, call `useEcoverseApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseApplicationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseApplicationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseApplicationsQuery,
    SchemaTypes.EcoverseApplicationsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoverseApplicationsQuery, SchemaTypes.EcoverseApplicationsQueryVariables>(
    EcoverseApplicationsDocument,
    baseOptions
  );
}
export function useEcoverseApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationsQuery,
    SchemaTypes.EcoverseApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseApplicationsQuery, SchemaTypes.EcoverseApplicationsQueryVariables>(
    EcoverseApplicationsDocument,
    baseOptions
  );
}
export type EcoverseApplicationsQueryHookResult = ReturnType<typeof useEcoverseApplicationsQuery>;
export type EcoverseApplicationsLazyQueryHookResult = ReturnType<typeof useEcoverseApplicationsLazyQuery>;
export type EcoverseApplicationsQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseApplicationsQuery,
  SchemaTypes.EcoverseApplicationsQueryVariables
>;
export function refetchEcoverseApplicationsQuery(variables?: SchemaTypes.EcoverseApplicationsQueryVariables) {
  return { query: EcoverseApplicationsDocument, variables: variables };
}
export const AuthenticationConfigurationDocument = gql`
  query authenticationConfiguration {
    configuration {
      authentication {
        enabled
        providers {
          name
          label
          icon
          enabled
          config {
            __typename
            ... on OryConfig {
              kratosPublicBaseURL
              issuer
            }
          }
        }
      }
    }
  }
`;

/**
 * __useAuthenticationConfigurationQuery__
 *
 * To run a query within a React component, call `useAuthenticationConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthenticationConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthenticationConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuthenticationConfigurationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AuthenticationConfigurationQuery,
    SchemaTypes.AuthenticationConfigurationQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.AuthenticationConfigurationQuery,
    SchemaTypes.AuthenticationConfigurationQueryVariables
  >(AuthenticationConfigurationDocument, baseOptions);
}
export function useAuthenticationConfigurationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AuthenticationConfigurationQuery,
    SchemaTypes.AuthenticationConfigurationQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.AuthenticationConfigurationQuery,
    SchemaTypes.AuthenticationConfigurationQueryVariables
  >(AuthenticationConfigurationDocument, baseOptions);
}
export type AuthenticationConfigurationQueryHookResult = ReturnType<typeof useAuthenticationConfigurationQuery>;
export type AuthenticationConfigurationLazyQueryHookResult = ReturnType<typeof useAuthenticationConfigurationLazyQuery>;
export type AuthenticationConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.AuthenticationConfigurationQuery,
  SchemaTypes.AuthenticationConfigurationQueryVariables
>;
export function refetchAuthenticationConfigurationQuery(
  variables?: SchemaTypes.AuthenticationConfigurationQueryVariables
) {
  return { query: AuthenticationConfigurationDocument, variables: variables };
}
export const ChallengeCardDocument = gql`
  query challengeCard($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      displayName
      nameID
      challenge(ID: $challengeId) {
        id
        displayName
        nameID
        ecoverseID
        activity {
          name
          value
        }
        tagset {
          tags
        }
        context {
          tagline
          visual {
            avatar
            background
            banner
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeCardQuery__
 *
 * To run a query within a React component, call `useChallengeCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCardQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>(
    ChallengeCardDocument,
    baseOptions
  );
}
export function useChallengeCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>(
    ChallengeCardDocument,
    baseOptions
  );
}
export type ChallengeCardQueryHookResult = ReturnType<typeof useChallengeCardQuery>;
export type ChallengeCardLazyQueryHookResult = ReturnType<typeof useChallengeCardLazyQuery>;
export type ChallengeCardQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCardQuery,
  SchemaTypes.ChallengeCardQueryVariables
>;
export function refetchChallengeCardQuery(variables?: SchemaTypes.ChallengeCardQueryVariables) {
  return { query: ChallengeCardDocument, variables: variables };
}
export const GroupCardDocument = gql`
  query groupCard($ecoverseId: UUID_NAMEID!, $groupId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      group(ID: $groupId) {
        __typename
        name
        parent {
          __typename
          ... on Community {
            displayName
          }
          ... on Organisation {
            displayName
          }
        }
        members {
          id
          displayName
        }
        profile {
          id
          avatar
          description
          references {
            name
            description
          }
          tagsets {
            name
            tags
          }
        }
      }
    }
  }
`;

/**
 * __useGroupCardQuery__
 *
 * To run a query within a React component, call `useGroupCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupCardQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.GroupCardQuery, SchemaTypes.GroupCardQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.GroupCardQuery, SchemaTypes.GroupCardQueryVariables>(
    GroupCardDocument,
    baseOptions
  );
}
export function useGroupCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GroupCardQuery, SchemaTypes.GroupCardQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.GroupCardQuery, SchemaTypes.GroupCardQueryVariables>(
    GroupCardDocument,
    baseOptions
  );
}
export type GroupCardQueryHookResult = ReturnType<typeof useGroupCardQuery>;
export type GroupCardLazyQueryHookResult = ReturnType<typeof useGroupCardLazyQuery>;
export type GroupCardQueryResult = Apollo.QueryResult<SchemaTypes.GroupCardQuery, SchemaTypes.GroupCardQueryVariables>;
export function refetchGroupCardQuery(variables?: SchemaTypes.GroupCardQueryVariables) {
  return { query: GroupCardDocument, variables: variables };
}
export const OrganizationCardDocument = gql`
  query organizationCard($id: UUID_NAMEID!) {
    organisation(ID: $id) {
      id
      displayName
      nameID
      profile {
        id
        description
        avatar
        tagsets {
          name
          tags
        }
        references {
          name
          uri
        }
      }
    }
  }
`;

/**
 * __useOrganizationCardQuery__
 *
 * To run a query within a React component, call `useOrganizationCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganizationCardQuery, SchemaTypes.OrganizationCardQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OrganizationCardQuery, SchemaTypes.OrganizationCardQueryVariables>(
    OrganizationCardDocument,
    baseOptions
  );
}
export function useOrganizationCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationCardQuery,
    SchemaTypes.OrganizationCardQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganizationCardQuery, SchemaTypes.OrganizationCardQueryVariables>(
    OrganizationCardDocument,
    baseOptions
  );
}
export type OrganizationCardQueryHookResult = ReturnType<typeof useOrganizationCardQuery>;
export type OrganizationCardLazyQueryHookResult = ReturnType<typeof useOrganizationCardLazyQuery>;
export type OrganizationCardQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationCardQuery,
  SchemaTypes.OrganizationCardQueryVariables
>;
export function refetchOrganizationCardQuery(variables?: SchemaTypes.OrganizationCardQueryVariables) {
  return { query: OrganizationCardDocument, variables: variables };
}
export const UserCardDocument = gql`
  query userCard($id: UUID_NAMEID_EMAIL!) {
    user(ID: $id) {
      __typename
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUserCardQuery__
 *
 * To run a query within a React component, call `useUserCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>(UserCardDocument, baseOptions);
}
export function useUserCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>(
    UserCardDocument,
    baseOptions
  );
}
export type UserCardQueryHookResult = ReturnType<typeof useUserCardQuery>;
export type UserCardLazyQueryHookResult = ReturnType<typeof useUserCardLazyQuery>;
export type UserCardQueryResult = Apollo.QueryResult<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>;
export function refetchUserCardQuery(variables?: SchemaTypes.UserCardQueryVariables) {
  return { query: UserCardDocument, variables: variables };
}
export const ChallengeActivityDocument = gql`
  query challengeActivity($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        activity {
          name
          value
        }
      }
    }
  }
`;

/**
 * __useChallengeActivityQuery__
 *
 * To run a query within a React component, call `useChallengeActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeActivityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeActivityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeActivityQuery, SchemaTypes.ChallengeActivityQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeActivityQuery, SchemaTypes.ChallengeActivityQueryVariables>(
    ChallengeActivityDocument,
    baseOptions
  );
}
export function useChallengeActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeActivityQuery,
    SchemaTypes.ChallengeActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeActivityQuery, SchemaTypes.ChallengeActivityQueryVariables>(
    ChallengeActivityDocument,
    baseOptions
  );
}
export type ChallengeActivityQueryHookResult = ReturnType<typeof useChallengeActivityQuery>;
export type ChallengeActivityLazyQueryHookResult = ReturnType<typeof useChallengeActivityLazyQuery>;
export type ChallengeActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeActivityQuery,
  SchemaTypes.ChallengeActivityQueryVariables
>;
export function refetchChallengeActivityQuery(variables?: SchemaTypes.ChallengeActivityQueryVariables) {
  return { query: ChallengeActivityDocument, variables: variables };
}
export const ChallengeApplicationTemplateDocument = gql`
  query challengeApplicationTemplate {
    configuration {
      template {
        challenges {
          name
          applications {
            name
            questions {
              required
              question
            }
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeApplicationTemplateQuery__
 *
 * To run a query within a React component, call `useChallengeApplicationTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeApplicationTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeApplicationTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useChallengeApplicationTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >(ChallengeApplicationTemplateDocument, baseOptions);
}
export function useChallengeApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >(ChallengeApplicationTemplateDocument, baseOptions);
}
export type ChallengeApplicationTemplateQueryHookResult = ReturnType<typeof useChallengeApplicationTemplateQuery>;
export type ChallengeApplicationTemplateLazyQueryHookResult = ReturnType<
  typeof useChallengeApplicationTemplateLazyQuery
>;
export type ChallengeApplicationTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeApplicationTemplateQuery,
  SchemaTypes.ChallengeApplicationTemplateQueryVariables
>;
export function refetchChallengeApplicationTemplateQuery(
  variables?: SchemaTypes.ChallengeApplicationTemplateQueryVariables
) {
  return { query: ChallengeApplicationTemplateDocument, variables: variables };
}
export const ChallengeGroupsDocument = gql`
  query challengeGroups($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeGroupsQuery__
 *
 * To run a query within a React component, call `useChallengeGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeGroupsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>(
    ChallengeGroupsDocument,
    baseOptions
  );
}
export function useChallengeGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>(
    ChallengeGroupsDocument,
    baseOptions
  );
}
export type ChallengeGroupsQueryHookResult = ReturnType<typeof useChallengeGroupsQuery>;
export type ChallengeGroupsLazyQueryHookResult = ReturnType<typeof useChallengeGroupsLazyQuery>;
export type ChallengeGroupsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeGroupsQuery,
  SchemaTypes.ChallengeGroupsQueryVariables
>;
export function refetchChallengeGroupsQuery(variables?: SchemaTypes.ChallengeGroupsQueryVariables) {
  return { query: ChallengeGroupsDocument, variables: variables };
}
export const ChallengeLeadOrganisationsDocument = gql`
  query challengeLeadOrganisations($ecoverseId: UUID_NAMEID!, $challengeID: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeID) {
        id
        leadOrganisations {
          ...OrganisationDetails
        }
      }
    }
    organisations {
      ...OrganisationDetails
    }
  }
  ${OrganisationDetailsFragmentDoc}
`;

/**
 * __useChallengeLeadOrganisationsQuery__
 *
 * To run a query within a React component, call `useChallengeLeadOrganisationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeLeadOrganisationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeLeadOrganisationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useChallengeLeadOrganisationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeLeadOrganisationsQuery,
    SchemaTypes.ChallengeLeadOrganisationsQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.ChallengeLeadOrganisationsQuery,
    SchemaTypes.ChallengeLeadOrganisationsQueryVariables
  >(ChallengeLeadOrganisationsDocument, baseOptions);
}
export function useChallengeLeadOrganisationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeLeadOrganisationsQuery,
    SchemaTypes.ChallengeLeadOrganisationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeLeadOrganisationsQuery,
    SchemaTypes.ChallengeLeadOrganisationsQueryVariables
  >(ChallengeLeadOrganisationsDocument, baseOptions);
}
export type ChallengeLeadOrganisationsQueryHookResult = ReturnType<typeof useChallengeLeadOrganisationsQuery>;
export type ChallengeLeadOrganisationsLazyQueryHookResult = ReturnType<typeof useChallengeLeadOrganisationsLazyQuery>;
export type ChallengeLeadOrganisationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeLeadOrganisationsQuery,
  SchemaTypes.ChallengeLeadOrganisationsQueryVariables
>;
export function refetchChallengeLeadOrganisationsQuery(
  variables?: SchemaTypes.ChallengeLeadOrganisationsQueryVariables
) {
  return { query: ChallengeLeadOrganisationsDocument, variables: variables };
}
export const ChallengeLifecycleDocument = gql`
  query challengeLifecycle($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        lifecycle {
          id
          machineDef
          state
          nextEvents
        }
      }
    }
  }
`;

/**
 * __useChallengeLifecycleQuery__
 *
 * To run a query within a React component, call `useChallengeLifecycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeLifecycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeLifecycleQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeLifecycleQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeLifecycleQuery,
    SchemaTypes.ChallengeLifecycleQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengeLifecycleQuery, SchemaTypes.ChallengeLifecycleQueryVariables>(
    ChallengeLifecycleDocument,
    baseOptions
  );
}
export function useChallengeLifecycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeLifecycleQuery,
    SchemaTypes.ChallengeLifecycleQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeLifecycleQuery, SchemaTypes.ChallengeLifecycleQueryVariables>(
    ChallengeLifecycleDocument,
    baseOptions
  );
}
export type ChallengeLifecycleQueryHookResult = ReturnType<typeof useChallengeLifecycleQuery>;
export type ChallengeLifecycleLazyQueryHookResult = ReturnType<typeof useChallengeLifecycleLazyQuery>;
export type ChallengeLifecycleQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeLifecycleQuery,
  SchemaTypes.ChallengeLifecycleQueryVariables
>;
export function refetchChallengeLifecycleQuery(variables?: SchemaTypes.ChallengeLifecycleQueryVariables) {
  return { query: ChallengeLifecycleDocument, variables: variables };
}
export const ChallengeMembersDocument = gql`
  query challengeMembers($ecoverseId: UUID_NAMEID!, $challengeID: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeID) {
        community {
          members {
            id
            displayName
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeMembersQuery__
 *
 * To run a query within a React component, call `useChallengeMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeMembersQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useChallengeMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeMembersQuery, SchemaTypes.ChallengeMembersQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeMembersQuery, SchemaTypes.ChallengeMembersQueryVariables>(
    ChallengeMembersDocument,
    baseOptions
  );
}
export function useChallengeMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeMembersQuery,
    SchemaTypes.ChallengeMembersQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeMembersQuery, SchemaTypes.ChallengeMembersQueryVariables>(
    ChallengeMembersDocument,
    baseOptions
  );
}
export type ChallengeMembersQueryHookResult = ReturnType<typeof useChallengeMembersQuery>;
export type ChallengeMembersLazyQueryHookResult = ReturnType<typeof useChallengeMembersLazyQuery>;
export type ChallengeMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeMembersQuery,
  SchemaTypes.ChallengeMembersQueryVariables
>;
export function refetchChallengeMembersQuery(variables?: SchemaTypes.ChallengeMembersQueryVariables) {
  return { query: ChallengeMembersDocument, variables: variables };
}
export const ChallengeNameDocument = gql`
  query challengeName($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        displayName
        community {
          id
          displayName
        }
      }
    }
  }
`;

/**
 * __useChallengeNameQuery__
 *
 * To run a query within a React component, call `useChallengeNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeNameQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>(
    ChallengeNameDocument,
    baseOptions
  );
}
export function useChallengeNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>(
    ChallengeNameDocument,
    baseOptions
  );
}
export type ChallengeNameQueryHookResult = ReturnType<typeof useChallengeNameQuery>;
export type ChallengeNameLazyQueryHookResult = ReturnType<typeof useChallengeNameLazyQuery>;
export type ChallengeNameQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeNameQuery,
  SchemaTypes.ChallengeNameQueryVariables
>;
export function refetchChallengeNameQuery(variables?: SchemaTypes.ChallengeNameQueryVariables) {
  return { query: ChallengeNameDocument, variables: variables };
}
export const ChallengeProfileDocument = gql`
  query challengeProfile($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        nameID
        displayName
        lifecycle {
          state
        }
        context {
          ...ContextDetails
        }
        community {
          members {
            displayName
          }
        }
        tagset {
          name
          tags
        }
        opportunities {
          id
          displayName
          lifecycle {
            state
          }
          nameID
          context {
            ...ContextDetails
          }
          projects {
            id
            nameID
            displayName
            description
            lifecycle {
              state
            }
          }
        }
        leadOrganisations {
          id
          displayName
          profile {
            id
            avatar
          }
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useChallengeProfileQuery__
 *
 * To run a query within a React component, call `useChallengeProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeProfileQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeProfileQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeProfileQuery, SchemaTypes.ChallengeProfileQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeProfileQuery, SchemaTypes.ChallengeProfileQueryVariables>(
    ChallengeProfileDocument,
    baseOptions
  );
}
export function useChallengeProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeProfileQuery,
    SchemaTypes.ChallengeProfileQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeProfileQuery, SchemaTypes.ChallengeProfileQueryVariables>(
    ChallengeProfileDocument,
    baseOptions
  );
}
export type ChallengeProfileQueryHookResult = ReturnType<typeof useChallengeProfileQuery>;
export type ChallengeProfileLazyQueryHookResult = ReturnType<typeof useChallengeProfileLazyQuery>;
export type ChallengeProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeProfileQuery,
  SchemaTypes.ChallengeProfileQueryVariables
>;
export function refetchChallengeProfileQuery(variables?: SchemaTypes.ChallengeProfileQueryVariables) {
  return { query: ChallengeProfileDocument, variables: variables };
}
export const ChallengeProfileInfoDocument = gql`
  query challengeProfileInfo($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        lifecycle {
          state
        }
        context {
          ...ContextDetails
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useChallengeProfileInfoQuery__
 *
 * To run a query within a React component, call `useChallengeProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeProfileInfoQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeProfileInfoQuery,
    SchemaTypes.ChallengeProfileInfoQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengeProfileInfoQuery, SchemaTypes.ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    baseOptions
  );
}
export function useChallengeProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeProfileInfoQuery,
    SchemaTypes.ChallengeProfileInfoQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeProfileInfoQuery, SchemaTypes.ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    baseOptions
  );
}
export type ChallengeProfileInfoQueryHookResult = ReturnType<typeof useChallengeProfileInfoQuery>;
export type ChallengeProfileInfoLazyQueryHookResult = ReturnType<typeof useChallengeProfileInfoLazyQuery>;
export type ChallengeProfileInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeProfileInfoQuery,
  SchemaTypes.ChallengeProfileInfoQueryVariables
>;
export function refetchChallengeProfileInfoQuery(variables?: SchemaTypes.ChallengeProfileInfoQueryVariables) {
  return { query: ChallengeProfileInfoDocument, variables: variables };
}
export const ChallengeUserIdsDocument = gql`
  query challengeUserIds($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        community {
          members {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeUserIdsQuery__
 *
 * To run a query within a React component, call `useChallengeUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeUserIdsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeUserIdsQuery, SchemaTypes.ChallengeUserIdsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengeUserIdsQuery, SchemaTypes.ChallengeUserIdsQueryVariables>(
    ChallengeUserIdsDocument,
    baseOptions
  );
}
export function useChallengeUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeUserIdsQuery,
    SchemaTypes.ChallengeUserIdsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeUserIdsQuery, SchemaTypes.ChallengeUserIdsQueryVariables>(
    ChallengeUserIdsDocument,
    baseOptions
  );
}
export type ChallengeUserIdsQueryHookResult = ReturnType<typeof useChallengeUserIdsQuery>;
export type ChallengeUserIdsLazyQueryHookResult = ReturnType<typeof useChallengeUserIdsLazyQuery>;
export type ChallengeUserIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeUserIdsQuery,
  SchemaTypes.ChallengeUserIdsQueryVariables
>;
export function refetchChallengeUserIdsQuery(variables?: SchemaTypes.ChallengeUserIdsQueryVariables) {
  return { query: ChallengeUserIdsDocument, variables: variables };
}
export const ChallengesDocument = gql`
  query challenges($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        id
        displayName
        nameID
        context {
          id
          tagline
          references {
            name
            uri
          }
          visual {
            ...ContextVisual
          }
        }
      }
    }
  }
  ${ContextVisualFragmentDoc}
`;

/**
 * __useChallengesQuery__
 *
 * To run a query within a React component, call `useChallengesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useChallengesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>(
    ChallengesDocument,
    baseOptions
  );
}
export function useChallengesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>(
    ChallengesDocument,
    baseOptions
  );
}
export type ChallengesQueryHookResult = ReturnType<typeof useChallengesQuery>;
export type ChallengesLazyQueryHookResult = ReturnType<typeof useChallengesLazyQuery>;
export type ChallengesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengesQuery,
  SchemaTypes.ChallengesQueryVariables
>;
export function refetchChallengesQuery(variables?: SchemaTypes.ChallengesQueryVariables) {
  return { query: ChallengesDocument, variables: variables };
}
export const ChallengesWithActivityDocument = gql`
  query challengesWithActivity($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        id
        displayName
        nameID
        activity {
          name
          value
        }
        context {
          id
          tagline
          visual {
            background
          }
        }
        tagset {
          name
          tags
        }
      }
    }
  }
`;

/**
 * __useChallengesWithActivityQuery__
 *
 * To run a query within a React component, call `useChallengesWithActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengesWithActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengesWithActivityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useChallengesWithActivityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengesWithActivityQuery,
    SchemaTypes.ChallengesWithActivityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengesWithActivityQuery, SchemaTypes.ChallengesWithActivityQueryVariables>(
    ChallengesWithActivityDocument,
    baseOptions
  );
}
export function useChallengesWithActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengesWithActivityQuery,
    SchemaTypes.ChallengesWithActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengesWithActivityQuery, SchemaTypes.ChallengesWithActivityQueryVariables>(
    ChallengesWithActivityDocument,
    baseOptions
  );
}
export type ChallengesWithActivityQueryHookResult = ReturnType<typeof useChallengesWithActivityQuery>;
export type ChallengesWithActivityLazyQueryHookResult = ReturnType<typeof useChallengesWithActivityLazyQuery>;
export type ChallengesWithActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengesWithActivityQuery,
  SchemaTypes.ChallengesWithActivityQueryVariables
>;
export function refetchChallengesWithActivityQuery(variables?: SchemaTypes.ChallengesWithActivityQueryVariables) {
  return { query: ChallengesWithActivityDocument, variables: variables };
}
export const AllCommunitiesDocument = gql`
  query allCommunities($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      community {
        ...AllCommunityDetails
      }
      challenges {
        community {
          ...AllCommunityDetails
        }
      }
      opportunities {
        community {
          ...AllCommunityDetails
        }
      }
    }
  }
  ${AllCommunityDetailsFragmentDoc}
`;

/**
 * __useAllCommunitiesQuery__
 *
 * To run a query within a React component, call `useAllCommunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCommunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCommunitiesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useAllCommunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>(
    AllCommunitiesDocument,
    baseOptions
  );
}
export function useAllCommunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>(
    AllCommunitiesDocument,
    baseOptions
  );
}
export type AllCommunitiesQueryHookResult = ReturnType<typeof useAllCommunitiesQuery>;
export type AllCommunitiesLazyQueryHookResult = ReturnType<typeof useAllCommunitiesLazyQuery>;
export type AllCommunitiesQueryResult = Apollo.QueryResult<
  SchemaTypes.AllCommunitiesQuery,
  SchemaTypes.AllCommunitiesQueryVariables
>;
export function refetchAllCommunitiesQuery(variables?: SchemaTypes.AllCommunitiesQueryVariables) {
  return { query: AllCommunitiesDocument, variables: variables };
}
export const ChallengeCommunityDocument = gql`
  query challengeCommunity($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        displayName
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useChallengeCommunityQuery__
 *
 * To run a query within a React component, call `useChallengeCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCommunityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCommunityQuery,
    SchemaTypes.ChallengeCommunityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengeCommunityQuery, SchemaTypes.ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    baseOptions
  );
}
export function useChallengeCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityQuery,
    SchemaTypes.ChallengeCommunityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCommunityQuery, SchemaTypes.ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    baseOptions
  );
}
export type ChallengeCommunityQueryHookResult = ReturnType<typeof useChallengeCommunityQuery>;
export type ChallengeCommunityLazyQueryHookResult = ReturnType<typeof useChallengeCommunityLazyQuery>;
export type ChallengeCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCommunityQuery,
  SchemaTypes.ChallengeCommunityQueryVariables
>;
export function refetchChallengeCommunityQuery(variables?: SchemaTypes.ChallengeCommunityQueryVariables) {
  return { query: ChallengeCommunityDocument, variables: variables };
}
export const ChallengesWithCommunityDocument = gql`
  query challengesWithCommunity($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        id
        nameID
        displayName
        community {
          id
          displayName
        }
      }
    }
  }
`;

/**
 * __useChallengesWithCommunityQuery__
 *
 * To run a query within a React component, call `useChallengesWithCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengesWithCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengesWithCommunityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useChallengesWithCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengesWithCommunityQuery,
    SchemaTypes.ChallengesWithCommunityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ChallengesWithCommunityQuery, SchemaTypes.ChallengesWithCommunityQueryVariables>(
    ChallengesWithCommunityDocument,
    baseOptions
  );
}
export function useChallengesWithCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengesWithCommunityQuery,
    SchemaTypes.ChallengesWithCommunityQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengesWithCommunityQuery,
    SchemaTypes.ChallengesWithCommunityQueryVariables
  >(ChallengesWithCommunityDocument, baseOptions);
}
export type ChallengesWithCommunityQueryHookResult = ReturnType<typeof useChallengesWithCommunityQuery>;
export type ChallengesWithCommunityLazyQueryHookResult = ReturnType<typeof useChallengesWithCommunityLazyQuery>;
export type ChallengesWithCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengesWithCommunityQuery,
  SchemaTypes.ChallengesWithCommunityQueryVariables
>;
export function refetchChallengesWithCommunityQuery(variables?: SchemaTypes.ChallengesWithCommunityQueryVariables) {
  return { query: ChallengesWithCommunityDocument, variables: variables };
}
export const EcoverseCommunityDocument = gql`
  query ecoverseCommunity($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community {
        ...CommunityDetails
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useEcoverseCommunityQuery__
 *
 * To run a query within a React component, call `useEcoverseCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCommunityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseCommunityQuery, SchemaTypes.EcoverseCommunityQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseCommunityQuery, SchemaTypes.EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    baseOptions
  );
}
export function useEcoverseCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseCommunityQuery,
    SchemaTypes.EcoverseCommunityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseCommunityQuery, SchemaTypes.EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    baseOptions
  );
}
export type EcoverseCommunityQueryHookResult = ReturnType<typeof useEcoverseCommunityQuery>;
export type EcoverseCommunityLazyQueryHookResult = ReturnType<typeof useEcoverseCommunityLazyQuery>;
export type EcoverseCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseCommunityQuery,
  SchemaTypes.EcoverseCommunityQueryVariables
>;
export function refetchEcoverseCommunityQuery(variables?: SchemaTypes.EcoverseCommunityQueryVariables) {
  return { query: EcoverseCommunityDocument, variables: variables };
}
export const ChallengeCommunityMessagesDocument = gql`
  query challengeCommunityMessages($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        community {
          ...CommunityMessages
        }
      }
    }
  }
  ${CommunityMessagesFragmentDoc}
`;

/**
 * __useChallengeCommunityMessagesQuery__
 *
 * To run a query within a React component, call `useChallengeCommunityMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCommunityMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCommunityMessagesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCommunityMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >(ChallengeCommunityMessagesDocument, baseOptions);
}
export function useChallengeCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >(ChallengeCommunityMessagesDocument, baseOptions);
}
export type ChallengeCommunityMessagesQueryHookResult = ReturnType<typeof useChallengeCommunityMessagesQuery>;
export type ChallengeCommunityMessagesLazyQueryHookResult = ReturnType<typeof useChallengeCommunityMessagesLazyQuery>;
export type ChallengeCommunityMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCommunityMessagesQuery,
  SchemaTypes.ChallengeCommunityMessagesQueryVariables
>;
export function refetchChallengeCommunityMessagesQuery(
  variables?: SchemaTypes.ChallengeCommunityMessagesQueryVariables
) {
  return { query: ChallengeCommunityMessagesDocument, variables: variables };
}
export const EcoversCommunityMessagesDocument = gql`
  query ecoversCommunityMessages($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      community {
        ...CommunityMessages
      }
    }
  }
  ${CommunityMessagesFragmentDoc}
`;

/**
 * __useEcoversCommunityMessagesQuery__
 *
 * To run a query within a React component, call `useEcoversCommunityMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoversCommunityMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoversCommunityMessagesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoversCommunityMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoversCommunityMessagesQuery,
    SchemaTypes.EcoversCommunityMessagesQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoversCommunityMessagesQuery, SchemaTypes.EcoversCommunityMessagesQueryVariables>(
    EcoversCommunityMessagesDocument,
    baseOptions
  );
}
export function useEcoversCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoversCommunityMessagesQuery,
    SchemaTypes.EcoversCommunityMessagesQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.EcoversCommunityMessagesQuery,
    SchemaTypes.EcoversCommunityMessagesQueryVariables
  >(EcoversCommunityMessagesDocument, baseOptions);
}
export type EcoversCommunityMessagesQueryHookResult = ReturnType<typeof useEcoversCommunityMessagesQuery>;
export type EcoversCommunityMessagesLazyQueryHookResult = ReturnType<typeof useEcoversCommunityMessagesLazyQuery>;
export type EcoversCommunityMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoversCommunityMessagesQuery,
  SchemaTypes.EcoversCommunityMessagesQueryVariables
>;
export function refetchEcoversCommunityMessagesQuery(variables?: SchemaTypes.EcoversCommunityMessagesQueryVariables) {
  return { query: EcoversCommunityMessagesDocument, variables: variables };
}
export const OpportunityCommunityMessagesDocument = gql`
  query opportunityCommunityMessages($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        community {
          ...CommunityMessages
        }
      }
    }
  }
  ${CommunityMessagesFragmentDoc}
`;

/**
 * __useOpportunityCommunityMessagesQuery__
 *
 * To run a query within a React component, call `useOpportunityCommunityMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCommunityMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCommunityMessagesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCommunityMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >(OpportunityCommunityMessagesDocument, baseOptions);
}
export function useOpportunityCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >(OpportunityCommunityMessagesDocument, baseOptions);
}
export type OpportunityCommunityMessagesQueryHookResult = ReturnType<typeof useOpportunityCommunityMessagesQuery>;
export type OpportunityCommunityMessagesLazyQueryHookResult = ReturnType<
  typeof useOpportunityCommunityMessagesLazyQuery
>;
export type OpportunityCommunityMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCommunityMessagesQuery,
  SchemaTypes.OpportunityCommunityMessagesQueryVariables
>;
export function refetchOpportunityCommunityMessagesQuery(
  variables?: SchemaTypes.OpportunityCommunityMessagesQueryVariables
) {
  return { query: OpportunityCommunityMessagesDocument, variables: variables };
}
export const OpportunityCommunityDocument = gql`
  query opportunityCommunity($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        displayName
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useOpportunityCommunityQuery__
 *
 * To run a query within a React component, call `useOpportunityCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCommunityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCommunityQuery,
    SchemaTypes.OpportunityCommunityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityCommunityQuery, SchemaTypes.OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    baseOptions
  );
}
export function useOpportunityCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityQuery,
    SchemaTypes.OpportunityCommunityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityCommunityQuery, SchemaTypes.OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    baseOptions
  );
}
export type OpportunityCommunityQueryHookResult = ReturnType<typeof useOpportunityCommunityQuery>;
export type OpportunityCommunityLazyQueryHookResult = ReturnType<typeof useOpportunityCommunityLazyQuery>;
export type OpportunityCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCommunityQuery,
  SchemaTypes.OpportunityCommunityQueryVariables
>;
export function refetchOpportunityCommunityQuery(variables?: SchemaTypes.OpportunityCommunityQueryVariables) {
  return { query: OpportunityCommunityDocument, variables: variables };
}
export const EcoverseActivityDocument = gql`
  query ecoverseActivity($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      activity {
        name
        value
      }
    }
  }
`;

/**
 * __useEcoverseActivityQuery__
 *
 * To run a query within a React component, call `useEcoverseActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseActivityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseActivityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseActivityQuery, SchemaTypes.EcoverseActivityQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseActivityQuery, SchemaTypes.EcoverseActivityQueryVariables>(
    EcoverseActivityDocument,
    baseOptions
  );
}
export function useEcoverseActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseActivityQuery,
    SchemaTypes.EcoverseActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseActivityQuery, SchemaTypes.EcoverseActivityQueryVariables>(
    EcoverseActivityDocument,
    baseOptions
  );
}
export type EcoverseActivityQueryHookResult = ReturnType<typeof useEcoverseActivityQuery>;
export type EcoverseActivityLazyQueryHookResult = ReturnType<typeof useEcoverseActivityLazyQuery>;
export type EcoverseActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseActivityQuery,
  SchemaTypes.EcoverseActivityQueryVariables
>;
export function refetchEcoverseActivityQuery(variables?: SchemaTypes.EcoverseActivityQueryVariables) {
  return { query: EcoverseActivityDocument, variables: variables };
}
export const EcoverseApplicationTemplateDocument = gql`
  query ecoverseApplicationTemplate {
    configuration {
      template {
        ecoverses {
          name
          applications {
            name
            questions {
              required
              question
            }
          }
        }
      }
    }
  }
`;

/**
 * __useEcoverseApplicationTemplateQuery__
 *
 * To run a query within a React component, call `useEcoverseApplicationTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseApplicationTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseApplicationTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseApplicationTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >
) {
  return Apollo.useQuery<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >(EcoverseApplicationTemplateDocument, baseOptions);
}
export function useEcoverseApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >(EcoverseApplicationTemplateDocument, baseOptions);
}
export type EcoverseApplicationTemplateQueryHookResult = ReturnType<typeof useEcoverseApplicationTemplateQuery>;
export type EcoverseApplicationTemplateLazyQueryHookResult = ReturnType<typeof useEcoverseApplicationTemplateLazyQuery>;
export type EcoverseApplicationTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseApplicationTemplateQuery,
  SchemaTypes.EcoverseApplicationTemplateQueryVariables
>;
export function refetchEcoverseApplicationTemplateQuery(
  variables?: SchemaTypes.EcoverseApplicationTemplateQueryVariables
) {
  return { query: EcoverseApplicationTemplateDocument, variables: variables };
}
export const EcoverseGroupDocument = gql`
  query ecoverseGroup($ecoverseId: UUID_NAMEID!, $groupId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      group(ID: $groupId) {
        ...GroupInfo
      }
    }
  }
  ${GroupInfoFragmentDoc}
`;

/**
 * __useEcoverseGroupQuery__
 *
 * To run a query within a React component, call `useEcoverseGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseGroupQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useEcoverseGroupQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>(
    EcoverseGroupDocument,
    baseOptions
  );
}
export function useEcoverseGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>(
    EcoverseGroupDocument,
    baseOptions
  );
}
export type EcoverseGroupQueryHookResult = ReturnType<typeof useEcoverseGroupQuery>;
export type EcoverseGroupLazyQueryHookResult = ReturnType<typeof useEcoverseGroupLazyQuery>;
export type EcoverseGroupQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseGroupQuery,
  SchemaTypes.EcoverseGroupQueryVariables
>;
export function refetchEcoverseGroupQuery(variables?: SchemaTypes.EcoverseGroupQueryVariables) {
  return { query: EcoverseGroupDocument, variables: variables };
}
export const EcoverseGroupsListDocument = gql`
  query ecoverseGroupsList($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useEcoverseGroupsListQuery__
 *
 * To run a query within a React component, call `useEcoverseGroupsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseGroupsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseGroupsListQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseGroupsListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseGroupsListQuery,
    SchemaTypes.EcoverseGroupsListQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoverseGroupsListQuery, SchemaTypes.EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    baseOptions
  );
}
export function useEcoverseGroupsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseGroupsListQuery,
    SchemaTypes.EcoverseGroupsListQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseGroupsListQuery, SchemaTypes.EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    baseOptions
  );
}
export type EcoverseGroupsListQueryHookResult = ReturnType<typeof useEcoverseGroupsListQuery>;
export type EcoverseGroupsListLazyQueryHookResult = ReturnType<typeof useEcoverseGroupsListLazyQuery>;
export type EcoverseGroupsListQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseGroupsListQuery,
  SchemaTypes.EcoverseGroupsListQueryVariables
>;
export function refetchEcoverseGroupsListQuery(variables?: SchemaTypes.EcoverseGroupsListQueryVariables) {
  return { query: EcoverseGroupsListDocument, variables: variables };
}
export const EcoverseHostReferencesDocument = gql`
  query ecoverseHostReferences($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      host {
        profile {
          id
          references {
            name
            uri
          }
        }
      }
    }
  }
`;

/**
 * __useEcoverseHostReferencesQuery__
 *
 * To run a query within a React component, call `useEcoverseHostReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseHostReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseHostReferencesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseHostReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseHostReferencesQuery,
    SchemaTypes.EcoverseHostReferencesQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoverseHostReferencesQuery, SchemaTypes.EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    baseOptions
  );
}
export function useEcoverseHostReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseHostReferencesQuery,
    SchemaTypes.EcoverseHostReferencesQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseHostReferencesQuery, SchemaTypes.EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    baseOptions
  );
}
export type EcoverseHostReferencesQueryHookResult = ReturnType<typeof useEcoverseHostReferencesQuery>;
export type EcoverseHostReferencesLazyQueryHookResult = ReturnType<typeof useEcoverseHostReferencesLazyQuery>;
export type EcoverseHostReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseHostReferencesQuery,
  SchemaTypes.EcoverseHostReferencesQueryVariables
>;
export function refetchEcoverseHostReferencesQuery(variables?: SchemaTypes.EcoverseHostReferencesQueryVariables) {
  return { query: EcoverseHostReferencesDocument, variables: variables };
}
export const EcoverseInfoDocument = gql`
  query ecoverseInfo($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      ...EcoverseDetails
      community {
        id
        displayName
      }
    }
  }
  ${EcoverseDetailsFragmentDoc}
`;

/**
 * __useEcoverseInfoQuery__
 *
 * To run a query within a React component, call `useEcoverseInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseInfoQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseInfoQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>(
    EcoverseInfoDocument,
    baseOptions
  );
}
export function useEcoverseInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>(
    EcoverseInfoDocument,
    baseOptions
  );
}
export type EcoverseInfoQueryHookResult = ReturnType<typeof useEcoverseInfoQuery>;
export type EcoverseInfoLazyQueryHookResult = ReturnType<typeof useEcoverseInfoLazyQuery>;
export type EcoverseInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseInfoQuery,
  SchemaTypes.EcoverseInfoQueryVariables
>;
export function refetchEcoverseInfoQuery(variables?: SchemaTypes.EcoverseInfoQueryVariables) {
  return { query: EcoverseInfoDocument, variables: variables };
}
export const EcoverseUserIdsDocument = gql`
  query ecoverseUserIds($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community {
        id
        members {
          id
        }
      }
    }
  }
`;

/**
 * __useEcoverseUserIdsQuery__
 *
 * To run a query within a React component, call `useEcoverseUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseUserIdsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>(
    EcoverseUserIdsDocument,
    baseOptions
  );
}
export function useEcoverseUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>(
    EcoverseUserIdsDocument,
    baseOptions
  );
}
export type EcoverseUserIdsQueryHookResult = ReturnType<typeof useEcoverseUserIdsQuery>;
export type EcoverseUserIdsLazyQueryHookResult = ReturnType<typeof useEcoverseUserIdsLazyQuery>;
export type EcoverseUserIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseUserIdsQuery,
  SchemaTypes.EcoverseUserIdsQueryVariables
>;
export function refetchEcoverseUserIdsQuery(variables?: SchemaTypes.EcoverseUserIdsQueryVariables) {
  return { query: EcoverseUserIdsDocument, variables: variables };
}
export const EcoverseVisualDocument = gql`
  query ecoverseVisual($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      context {
        visual {
          ...ContextVisual
        }
      }
    }
  }
  ${ContextVisualFragmentDoc}
`;

/**
 * __useEcoverseVisualQuery__
 *
 * To run a query within a React component, call `useEcoverseVisualQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseVisualQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseVisualQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseVisualQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>(
    EcoverseVisualDocument,
    baseOptions
  );
}
export function useEcoverseVisualLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>(
    EcoverseVisualDocument,
    baseOptions
  );
}
export type EcoverseVisualQueryHookResult = ReturnType<typeof useEcoverseVisualQuery>;
export type EcoverseVisualLazyQueryHookResult = ReturnType<typeof useEcoverseVisualLazyQuery>;
export type EcoverseVisualQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseVisualQuery,
  SchemaTypes.EcoverseVisualQueryVariables
>;
export function refetchEcoverseVisualQuery(variables?: SchemaTypes.EcoverseVisualQueryVariables) {
  return { query: EcoverseVisualDocument, variables: variables };
}
export const EcoversesDocument = gql`
  query ecoverses {
    ecoverses {
      ...EcoverseDetails
    }
  }
  ${EcoverseDetailsFragmentDoc}
`;

/**
 * __useEcoversesQuery__
 *
 * To run a query within a React component, call `useEcoversesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoversesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoversesQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoversesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>(
    EcoversesDocument,
    baseOptions
  );
}
export function useEcoversesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>(
    EcoversesDocument,
    baseOptions
  );
}
export type EcoversesQueryHookResult = ReturnType<typeof useEcoversesQuery>;
export type EcoversesLazyQueryHookResult = ReturnType<typeof useEcoversesLazyQuery>;
export type EcoversesQueryResult = Apollo.QueryResult<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>;
export function refetchEcoversesQuery(variables?: SchemaTypes.EcoversesQueryVariables) {
  return { query: EcoversesDocument, variables: variables };
}
export const EcoversesWithActivityDocument = gql`
  query ecoversesWithActivity {
    ecoverses {
      id
      displayName
      nameID
      authorization {
        anonymousReadAccess
      }
      activity {
        name
        value
      }
      context {
        visual {
          background
        }
        tagline
      }
      tagset {
        name
        tags
      }
    }
  }
`;

/**
 * __useEcoversesWithActivityQuery__
 *
 * To run a query within a React component, call `useEcoversesWithActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoversesWithActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoversesWithActivityQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoversesWithActivityQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.EcoversesWithActivityQuery,
    SchemaTypes.EcoversesWithActivityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.EcoversesWithActivityQuery, SchemaTypes.EcoversesWithActivityQueryVariables>(
    EcoversesWithActivityDocument,
    baseOptions
  );
}
export function useEcoversesWithActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoversesWithActivityQuery,
    SchemaTypes.EcoversesWithActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.EcoversesWithActivityQuery, SchemaTypes.EcoversesWithActivityQueryVariables>(
    EcoversesWithActivityDocument,
    baseOptions
  );
}
export type EcoversesWithActivityQueryHookResult = ReturnType<typeof useEcoversesWithActivityQuery>;
export type EcoversesWithActivityLazyQueryHookResult = ReturnType<typeof useEcoversesWithActivityLazyQuery>;
export type EcoversesWithActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoversesWithActivityQuery,
  SchemaTypes.EcoversesWithActivityQueryVariables
>;
export function refetchEcoversesWithActivityQuery(variables?: SchemaTypes.EcoversesWithActivityQueryVariables) {
  return { query: EcoversesWithActivityDocument, variables: variables };
}
export const GlobalActivityDocument = gql`
  query globalActivity {
    metadata {
      activity {
        name
        value
      }
    }
  }
`;

/**
 * __useGlobalActivityQuery__
 *
 * To run a query within a React component, call `useGlobalActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGlobalActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGlobalActivityQuery({
 *   variables: {
 *   },
 * });
 */
export function useGlobalActivityQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>(
    GlobalActivityDocument,
    baseOptions
  );
}
export function useGlobalActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>(
    GlobalActivityDocument,
    baseOptions
  );
}
export type GlobalActivityQueryHookResult = ReturnType<typeof useGlobalActivityQuery>;
export type GlobalActivityLazyQueryHookResult = ReturnType<typeof useGlobalActivityLazyQuery>;
export type GlobalActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.GlobalActivityQuery,
  SchemaTypes.GlobalActivityQueryVariables
>;
export function refetchGlobalActivityQuery(variables?: SchemaTypes.GlobalActivityQueryVariables) {
  return { query: GlobalActivityDocument, variables: variables };
}
export const GroupMembersDocument = gql`
  query groupMembers($ecoverseId: UUID_NAMEID!, $groupId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      group(ID: $groupId) {
        id
        name
        members {
          ...GroupMembers
        }
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;

/**
 * __useGroupMembersQuery__
 *
 * To run a query within a React component, call `useGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>(
    GroupMembersDocument,
    baseOptions
  );
}
export function useGroupMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>(
    GroupMembersDocument,
    baseOptions
  );
}
export type GroupMembersQueryHookResult = ReturnType<typeof useGroupMembersQuery>;
export type GroupMembersLazyQueryHookResult = ReturnType<typeof useGroupMembersLazyQuery>;
export type GroupMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.GroupMembersQuery,
  SchemaTypes.GroupMembersQueryVariables
>;
export function refetchGroupMembersQuery(variables?: SchemaTypes.GroupMembersQueryVariables) {
  return { query: GroupMembersDocument, variables: variables };
}
export const MeDocument = gql`
  query me {
    me {
      ...UserDetails
      ...UserAgent
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>) {
  return Apollo.useQuery<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>(MeDocument, baseOptions);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>(MeDocument, baseOptions);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>;
export function refetchMeQuery(variables?: SchemaTypes.MeQueryVariables) {
  return { query: MeDocument, variables: variables };
}
export const MeHasProfileDocument = gql`
  query meHasProfile {
    meHasProfile
  }
`;

/**
 * __useMeHasProfileQuery__
 *
 * To run a query within a React component, call `useMeHasProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeHasProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeHasProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeHasProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>(
    MeHasProfileDocument,
    baseOptions
  );
}
export function useMeHasProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>(
    MeHasProfileDocument,
    baseOptions
  );
}
export type MeHasProfileQueryHookResult = ReturnType<typeof useMeHasProfileQuery>;
export type MeHasProfileLazyQueryHookResult = ReturnType<typeof useMeHasProfileLazyQuery>;
export type MeHasProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.MeHasProfileQuery,
  SchemaTypes.MeHasProfileQueryVariables
>;
export function refetchMeHasProfileQuery(variables?: SchemaTypes.MeHasProfileQueryVariables) {
  return { query: MeHasProfileDocument, variables: variables };
}
export const MembershipOrganisationDocument = gql`
  query membershipOrganisation($input: MembershipOrganisationInput!) {
    membershipOrganisation(membershipData: $input) {
      ecoversesHosting {
        id
        nameID
        displayName
      }
      challengesLeading {
        id
        nameID
        displayName
      }
    }
  }
`;

/**
 * __useMembershipOrganisationQuery__
 *
 * To run a query within a React component, call `useMembershipOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipOrganisationQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMembershipOrganisationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MembershipOrganisationQuery,
    SchemaTypes.MembershipOrganisationQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.MembershipOrganisationQuery, SchemaTypes.MembershipOrganisationQueryVariables>(
    MembershipOrganisationDocument,
    baseOptions
  );
}
export function useMembershipOrganisationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MembershipOrganisationQuery,
    SchemaTypes.MembershipOrganisationQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.MembershipOrganisationQuery, SchemaTypes.MembershipOrganisationQueryVariables>(
    MembershipOrganisationDocument,
    baseOptions
  );
}
export type MembershipOrganisationQueryHookResult = ReturnType<typeof useMembershipOrganisationQuery>;
export type MembershipOrganisationLazyQueryHookResult = ReturnType<typeof useMembershipOrganisationLazyQuery>;
export type MembershipOrganisationQueryResult = Apollo.QueryResult<
  SchemaTypes.MembershipOrganisationQuery,
  SchemaTypes.MembershipOrganisationQueryVariables
>;
export function refetchMembershipOrganisationQuery(variables?: SchemaTypes.MembershipOrganisationQueryVariables) {
  return { query: MembershipOrganisationDocument, variables: variables };
}
export const MembershipUserDocument = gql`
  query membershipUser($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      ...UserMembershipDetails
    }
  }
  ${UserMembershipDetailsFragmentDoc}
`;

/**
 * __useMembershipUserQuery__
 *
 * To run a query within a React component, call `useMembershipUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipUserQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMembershipUserQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>(
    MembershipUserDocument,
    baseOptions
  );
}
export function useMembershipUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>(
    MembershipUserDocument,
    baseOptions
  );
}
export type MembershipUserQueryHookResult = ReturnType<typeof useMembershipUserQuery>;
export type MembershipUserLazyQueryHookResult = ReturnType<typeof useMembershipUserLazyQuery>;
export type MembershipUserQueryResult = Apollo.QueryResult<
  SchemaTypes.MembershipUserQuery,
  SchemaTypes.MembershipUserQueryVariables
>;
export function refetchMembershipUserQuery(variables?: SchemaTypes.MembershipUserQueryVariables) {
  return { query: MembershipUserDocument, variables: variables };
}
export const OpportunitiesDocument = gql`
  query opportunities($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        opportunities {
          id
          nameID
          displayName
        }
      }
    }
  }
`;

/**
 * __useOpportunitiesQuery__
 *
 * To run a query within a React component, call `useOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunitiesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useOpportunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>(
    OpportunitiesDocument,
    baseOptions
  );
}
export function useOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>(
    OpportunitiesDocument,
    baseOptions
  );
}
export type OpportunitiesQueryHookResult = ReturnType<typeof useOpportunitiesQuery>;
export type OpportunitiesLazyQueryHookResult = ReturnType<typeof useOpportunitiesLazyQuery>;
export type OpportunitiesQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunitiesQuery,
  SchemaTypes.OpportunitiesQueryVariables
>;
export function refetchOpportunitiesQuery(variables?: SchemaTypes.OpportunitiesQueryVariables) {
  return { query: OpportunitiesDocument, variables: variables };
}
export const OpportunityActivityDocument = gql`
  query opportunityActivity($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        activity {
          name
          value
        }
      }
    }
  }
`;

/**
 * __useOpportunityActivityQuery__
 *
 * To run a query within a React component, call `useOpportunityActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityActivityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityActivityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityActivityQuery,
    SchemaTypes.OpportunityActivityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityActivityQuery, SchemaTypes.OpportunityActivityQueryVariables>(
    OpportunityActivityDocument,
    baseOptions
  );
}
export function useOpportunityActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityActivityQuery,
    SchemaTypes.OpportunityActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityActivityQuery, SchemaTypes.OpportunityActivityQueryVariables>(
    OpportunityActivityDocument,
    baseOptions
  );
}
export type OpportunityActivityQueryHookResult = ReturnType<typeof useOpportunityActivityQuery>;
export type OpportunityActivityLazyQueryHookResult = ReturnType<typeof useOpportunityActivityLazyQuery>;
export type OpportunityActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityActivityQuery,
  SchemaTypes.OpportunityActivityQueryVariables
>;
export function refetchOpportunityActivityQuery(variables?: SchemaTypes.OpportunityActivityQueryVariables) {
  return { query: OpportunityActivityDocument, variables: variables };
}
export const OpportunityActorGroupsDocument = gql`
  query opportunityActorGroups($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        context {
          ecosystemModel {
            id
            actorGroups {
              id
              name
              description
              actors {
                id
                name
                description
                value
                impact
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityActorGroupsQuery__
 *
 * To run a query within a React component, call `useOpportunityActorGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityActorGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityActorGroupsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityActorGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityActorGroupsQuery,
    SchemaTypes.OpportunityActorGroupsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityActorGroupsQuery, SchemaTypes.OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    baseOptions
  );
}
export function useOpportunityActorGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityActorGroupsQuery,
    SchemaTypes.OpportunityActorGroupsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityActorGroupsQuery, SchemaTypes.OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    baseOptions
  );
}
export type OpportunityActorGroupsQueryHookResult = ReturnType<typeof useOpportunityActorGroupsQuery>;
export type OpportunityActorGroupsLazyQueryHookResult = ReturnType<typeof useOpportunityActorGroupsLazyQuery>;
export type OpportunityActorGroupsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityActorGroupsQuery,
  SchemaTypes.OpportunityActorGroupsQueryVariables
>;
export function refetchOpportunityActorGroupsQuery(variables?: SchemaTypes.OpportunityActorGroupsQueryVariables) {
  return { query: OpportunityActorGroupsDocument, variables: variables };
}
export const OpportunityAspectsDocument = gql`
  query opportunityAspects($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        context {
          aspects {
            title
            framing
            explanation
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityAspectsQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityAspectsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAspectsQuery,
    SchemaTypes.OpportunityAspectsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityAspectsQuery, SchemaTypes.OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    baseOptions
  );
}
export function useOpportunityAspectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectsQuery,
    SchemaTypes.OpportunityAspectsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityAspectsQuery, SchemaTypes.OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    baseOptions
  );
}
export type OpportunityAspectsQueryHookResult = ReturnType<typeof useOpportunityAspectsQuery>;
export type OpportunityAspectsLazyQueryHookResult = ReturnType<typeof useOpportunityAspectsLazyQuery>;
export type OpportunityAspectsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAspectsQuery,
  SchemaTypes.OpportunityAspectsQueryVariables
>;
export function refetchOpportunityAspectsQuery(variables?: SchemaTypes.OpportunityAspectsQueryVariables) {
  return { query: OpportunityAspectsDocument, variables: variables };
}
export const OpportunityGroupsDocument = gql`
  query opportunityGroups($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityGroupsQuery__
 *
 * To run a query within a React component, call `useOpportunityGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityGroupsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityGroupsQuery, SchemaTypes.OpportunityGroupsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OpportunityGroupsQuery, SchemaTypes.OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    baseOptions
  );
}
export function useOpportunityGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityGroupsQuery,
    SchemaTypes.OpportunityGroupsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityGroupsQuery, SchemaTypes.OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    baseOptions
  );
}
export type OpportunityGroupsQueryHookResult = ReturnType<typeof useOpportunityGroupsQuery>;
export type OpportunityGroupsLazyQueryHookResult = ReturnType<typeof useOpportunityGroupsLazyQuery>;
export type OpportunityGroupsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityGroupsQuery,
  SchemaTypes.OpportunityGroupsQueryVariables
>;
export function refetchOpportunityGroupsQuery(variables?: SchemaTypes.OpportunityGroupsQueryVariables) {
  return { query: OpportunityGroupsDocument, variables: variables };
}
export const OpportunityLifecycleDocument = gql`
  query opportunityLifecycle($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        lifecycle {
          id
          machineDef
          state
          nextEvents
        }
      }
    }
  }
`;

/**
 * __useOpportunityLifecycleQuery__
 *
 * To run a query within a React component, call `useOpportunityLifecycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityLifecycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityLifecycleQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityLifecycleQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityLifecycleQuery,
    SchemaTypes.OpportunityLifecycleQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityLifecycleQuery, SchemaTypes.OpportunityLifecycleQueryVariables>(
    OpportunityLifecycleDocument,
    baseOptions
  );
}
export function useOpportunityLifecycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityLifecycleQuery,
    SchemaTypes.OpportunityLifecycleQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityLifecycleQuery, SchemaTypes.OpportunityLifecycleQueryVariables>(
    OpportunityLifecycleDocument,
    baseOptions
  );
}
export type OpportunityLifecycleQueryHookResult = ReturnType<typeof useOpportunityLifecycleQuery>;
export type OpportunityLifecycleLazyQueryHookResult = ReturnType<typeof useOpportunityLifecycleLazyQuery>;
export type OpportunityLifecycleQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityLifecycleQuery,
  SchemaTypes.OpportunityLifecycleQueryVariables
>;
export function refetchOpportunityLifecycleQuery(variables?: SchemaTypes.OpportunityLifecycleQueryVariables) {
  return { query: OpportunityLifecycleDocument, variables: variables };
}
export const OpportunityNameDocument = gql`
  query opportunityName($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        displayName
      }
    }
  }
`;

/**
 * __useOpportunityNameQuery__
 *
 * To run a query within a React component, call `useOpportunityNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityNameQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>(
    OpportunityNameDocument,
    baseOptions
  );
}
export function useOpportunityNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>(
    OpportunityNameDocument,
    baseOptions
  );
}
export type OpportunityNameQueryHookResult = ReturnType<typeof useOpportunityNameQuery>;
export type OpportunityNameLazyQueryHookResult = ReturnType<typeof useOpportunityNameLazyQuery>;
export type OpportunityNameQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityNameQuery,
  SchemaTypes.OpportunityNameQueryVariables
>;
export function refetchOpportunityNameQuery(variables?: SchemaTypes.OpportunityNameQueryVariables) {
  return { query: OpportunityNameDocument, variables: variables };
}
export const OpportunityProfileDocument = gql`
  query opportunityProfile($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        nameID
        displayName
        lifecycle {
          state
        }
        context {
          ...ContextDetails
          aspects {
            id
            title
            framing
            explanation
          }
          ecosystemModel {
            id
            actorGroups {
              id
              name
              description
              actors {
                id
                name
                description
                value
                impact
              }
            }
          }
        }
        community {
          members {
            displayName
          }
        }
        tagset {
          name
          tags
        }
        projects {
          ...ProjectDetails
        }
        relations {
          id
          type
          actorRole
          actorName
          actorType
          description
        }
        activity {
          name
          value
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
  ${ProjectDetailsFragmentDoc}
`;

/**
 * __useOpportunityProfileQuery__
 *
 * To run a query within a React component, call `useOpportunityProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityProfileQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityProfileQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityProfileQuery,
    SchemaTypes.OpportunityProfileQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityProfileQuery, SchemaTypes.OpportunityProfileQueryVariables>(
    OpportunityProfileDocument,
    baseOptions
  );
}
export function useOpportunityProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityProfileQuery,
    SchemaTypes.OpportunityProfileQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityProfileQuery, SchemaTypes.OpportunityProfileQueryVariables>(
    OpportunityProfileDocument,
    baseOptions
  );
}
export type OpportunityProfileQueryHookResult = ReturnType<typeof useOpportunityProfileQuery>;
export type OpportunityProfileLazyQueryHookResult = ReturnType<typeof useOpportunityProfileLazyQuery>;
export type OpportunityProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityProfileQuery,
  SchemaTypes.OpportunityProfileQueryVariables
>;
export function refetchOpportunityProfileQuery(variables?: SchemaTypes.OpportunityProfileQueryVariables) {
  return { query: OpportunityProfileDocument, variables: variables };
}
export const OpportunityProfileInfoDocument = gql`
  query opportunityProfileInfo($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        context {
          ...ContextDetails
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useOpportunityProfileInfoQuery__
 *
 * To run a query within a React component, call `useOpportunityProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityProfileInfoQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityProfileInfoQuery,
    SchemaTypes.OpportunityProfileInfoQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityProfileInfoQuery, SchemaTypes.OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    baseOptions
  );
}
export function useOpportunityProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityProfileInfoQuery,
    SchemaTypes.OpportunityProfileInfoQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityProfileInfoQuery, SchemaTypes.OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    baseOptions
  );
}
export type OpportunityProfileInfoQueryHookResult = ReturnType<typeof useOpportunityProfileInfoQuery>;
export type OpportunityProfileInfoLazyQueryHookResult = ReturnType<typeof useOpportunityProfileInfoLazyQuery>;
export type OpportunityProfileInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityProfileInfoQuery,
  SchemaTypes.OpportunityProfileInfoQueryVariables
>;
export function refetchOpportunityProfileInfoQuery(variables?: SchemaTypes.OpportunityProfileInfoQueryVariables) {
  return { query: OpportunityProfileInfoDocument, variables: variables };
}
export const OpportunityRelationsDocument = gql`
  query opportunityRelations($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        relations {
          actorRole
          actorName
          actorType
          description
          type
        }
      }
    }
  }
`;

/**
 * __useOpportunityRelationsQuery__
 *
 * To run a query within a React component, call `useOpportunityRelationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityRelationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityRelationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityRelationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityRelationsQuery,
    SchemaTypes.OpportunityRelationsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityRelationsQuery, SchemaTypes.OpportunityRelationsQueryVariables>(
    OpportunityRelationsDocument,
    baseOptions
  );
}
export function useOpportunityRelationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityRelationsQuery,
    SchemaTypes.OpportunityRelationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityRelationsQuery, SchemaTypes.OpportunityRelationsQueryVariables>(
    OpportunityRelationsDocument,
    baseOptions
  );
}
export type OpportunityRelationsQueryHookResult = ReturnType<typeof useOpportunityRelationsQuery>;
export type OpportunityRelationsLazyQueryHookResult = ReturnType<typeof useOpportunityRelationsLazyQuery>;
export type OpportunityRelationsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityRelationsQuery,
  SchemaTypes.OpportunityRelationsQueryVariables
>;
export function refetchOpportunityRelationsQuery(variables?: SchemaTypes.OpportunityRelationsQueryVariables) {
  return { query: OpportunityRelationsDocument, variables: variables };
}
export const OpportunityTemplateDocument = gql`
  query opportunityTemplate {
    configuration {
      template {
        opportunities {
          aspects
          actorGroups
        }
      }
    }
  }
`;

/**
 * __useOpportunityTemplateQuery__
 *
 * To run a query within a React component, call `useOpportunityTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useOpportunityTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityTemplateQuery,
    SchemaTypes.OpportunityTemplateQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityTemplateQuery, SchemaTypes.OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    baseOptions
  );
}
export function useOpportunityTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityTemplateQuery,
    SchemaTypes.OpportunityTemplateQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityTemplateQuery, SchemaTypes.OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    baseOptions
  );
}
export type OpportunityTemplateQueryHookResult = ReturnType<typeof useOpportunityTemplateQuery>;
export type OpportunityTemplateLazyQueryHookResult = ReturnType<typeof useOpportunityTemplateLazyQuery>;
export type OpportunityTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityTemplateQuery,
  SchemaTypes.OpportunityTemplateQueryVariables
>;
export function refetchOpportunityTemplateQuery(variables?: SchemaTypes.OpportunityTemplateQueryVariables) {
  return { query: OpportunityTemplateDocument, variables: variables };
}
export const OpportunityUserIdsDocument = gql`
  query opportunityUserIds($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        community {
          members {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityUserIdsQuery__
 *
 * To run a query within a React component, call `useOpportunityUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityUserIdsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityUserIdsQuery,
    SchemaTypes.OpportunityUserIdsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityUserIdsQuery, SchemaTypes.OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    baseOptions
  );
}
export function useOpportunityUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityUserIdsQuery,
    SchemaTypes.OpportunityUserIdsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OpportunityUserIdsQuery, SchemaTypes.OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    baseOptions
  );
}
export type OpportunityUserIdsQueryHookResult = ReturnType<typeof useOpportunityUserIdsQuery>;
export type OpportunityUserIdsLazyQueryHookResult = ReturnType<typeof useOpportunityUserIdsLazyQuery>;
export type OpportunityUserIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityUserIdsQuery,
  SchemaTypes.OpportunityUserIdsQueryVariables
>;
export function refetchOpportunityUserIdsQuery(variables?: SchemaTypes.OpportunityUserIdsQueryVariables) {
  return { query: OpportunityUserIdsDocument, variables: variables };
}
export const OpportunityWithActivityDocument = gql`
  query opportunityWithActivity($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunities {
        id
        displayName
        nameID
        activity {
          name
          value
        }
        context {
          tagline
          visual {
            background
          }
        }
        tagset {
          name
          tags
        }
      }
    }
  }
`;

/**
 * __useOpportunityWithActivityQuery__
 *
 * To run a query within a React component, call `useOpportunityWithActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityWithActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityWithActivityQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useOpportunityWithActivityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityWithActivityQuery,
    SchemaTypes.OpportunityWithActivityQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OpportunityWithActivityQuery, SchemaTypes.OpportunityWithActivityQueryVariables>(
    OpportunityWithActivityDocument,
    baseOptions
  );
}
export function useOpportunityWithActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityWithActivityQuery,
    SchemaTypes.OpportunityWithActivityQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityWithActivityQuery,
    SchemaTypes.OpportunityWithActivityQueryVariables
  >(OpportunityWithActivityDocument, baseOptions);
}
export type OpportunityWithActivityQueryHookResult = ReturnType<typeof useOpportunityWithActivityQuery>;
export type OpportunityWithActivityLazyQueryHookResult = ReturnType<typeof useOpportunityWithActivityLazyQuery>;
export type OpportunityWithActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityWithActivityQuery,
  SchemaTypes.OpportunityWithActivityQueryVariables
>;
export function refetchOpportunityWithActivityQuery(variables?: SchemaTypes.OpportunityWithActivityQueryVariables) {
  return { query: OpportunityWithActivityDocument, variables: variables };
}
export const OrganisationGroupDocument = gql`
  query organisationGroup($organisationId: UUID_NAMEID!, $groupId: UUID!) {
    organisation(ID: $organisationId) {
      id
      group(ID: $groupId) {
        ...GroupInfo
      }
    }
  }
  ${GroupInfoFragmentDoc}
`;

/**
 * __useOrganisationGroupQuery__
 *
 * To run a query within a React component, call `useOrganisationGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganisationGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganisationGroupQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useOrganisationGroupQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganisationGroupQuery, SchemaTypes.OrganisationGroupQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OrganisationGroupQuery, SchemaTypes.OrganisationGroupQueryVariables>(
    OrganisationGroupDocument,
    baseOptions
  );
}
export function useOrganisationGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganisationGroupQuery,
    SchemaTypes.OrganisationGroupQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganisationGroupQuery, SchemaTypes.OrganisationGroupQueryVariables>(
    OrganisationGroupDocument,
    baseOptions
  );
}
export type OrganisationGroupQueryHookResult = ReturnType<typeof useOrganisationGroupQuery>;
export type OrganisationGroupLazyQueryHookResult = ReturnType<typeof useOrganisationGroupLazyQuery>;
export type OrganisationGroupQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganisationGroupQuery,
  SchemaTypes.OrganisationGroupQueryVariables
>;
export function refetchOrganisationGroupQuery(variables?: SchemaTypes.OrganisationGroupQueryVariables) {
  return { query: OrganisationGroupDocument, variables: variables };
}
export const OrganizationDetailsDocument = gql`
  query organizationDetails($id: UUID_NAMEID!) {
    organisation(ID: $id) {
      id
      displayName
      profile {
        id
        avatar
        description
        references {
          name
          uri
        }
        tagsets {
          id
          name
          tags
        }
      }
      groups {
        id
        name
        members {
          id
          displayName
        }
      }
    }
  }
`;

/**
 * __useOrganizationDetailsQuery__
 *
 * To run a query within a React component, call `useOrganizationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationDetailsQuery,
    SchemaTypes.OrganizationDetailsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OrganizationDetailsQuery, SchemaTypes.OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    baseOptions
  );
}
export function useOrganizationDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationDetailsQuery,
    SchemaTypes.OrganizationDetailsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganizationDetailsQuery, SchemaTypes.OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    baseOptions
  );
}
export type OrganizationDetailsQueryHookResult = ReturnType<typeof useOrganizationDetailsQuery>;
export type OrganizationDetailsLazyQueryHookResult = ReturnType<typeof useOrganizationDetailsLazyQuery>;
export type OrganizationDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationDetailsQuery,
  SchemaTypes.OrganizationDetailsQueryVariables
>;
export function refetchOrganizationDetailsQuery(variables?: SchemaTypes.OrganizationDetailsQueryVariables) {
  return { query: OrganizationDetailsDocument, variables: variables };
}
export const OrganizationGroupsDocument = gql`
  query organizationGroups($id: UUID_NAMEID!) {
    organisation(ID: $id) {
      id
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useOrganizationGroupsQuery__
 *
 * To run a query within a React component, call `useOrganizationGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationGroupsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationGroupsQuery,
    SchemaTypes.OrganizationGroupsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OrganizationGroupsQuery, SchemaTypes.OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    baseOptions
  );
}
export function useOrganizationGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationGroupsQuery,
    SchemaTypes.OrganizationGroupsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganizationGroupsQuery, SchemaTypes.OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    baseOptions
  );
}
export type OrganizationGroupsQueryHookResult = ReturnType<typeof useOrganizationGroupsQuery>;
export type OrganizationGroupsLazyQueryHookResult = ReturnType<typeof useOrganizationGroupsLazyQuery>;
export type OrganizationGroupsQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationGroupsQuery,
  SchemaTypes.OrganizationGroupsQueryVariables
>;
export function refetchOrganizationGroupsQuery(variables?: SchemaTypes.OrganizationGroupsQueryVariables) {
  return { query: OrganizationGroupsDocument, variables: variables };
}
export const OrganizationNameDocument = gql`
  query organizationName($id: UUID_NAMEID!) {
    organisation(ID: $id) {
      id
      displayName
    }
  }
`;

/**
 * __useOrganizationNameQuery__
 *
 * To run a query within a React component, call `useOrganizationNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationNameQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganizationNameQuery, SchemaTypes.OrganizationNameQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OrganizationNameQuery, SchemaTypes.OrganizationNameQueryVariables>(
    OrganizationNameDocument,
    baseOptions
  );
}
export function useOrganizationNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationNameQuery,
    SchemaTypes.OrganizationNameQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganizationNameQuery, SchemaTypes.OrganizationNameQueryVariables>(
    OrganizationNameDocument,
    baseOptions
  );
}
export type OrganizationNameQueryHookResult = ReturnType<typeof useOrganizationNameQuery>;
export type OrganizationNameLazyQueryHookResult = ReturnType<typeof useOrganizationNameLazyQuery>;
export type OrganizationNameQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationNameQuery,
  SchemaTypes.OrganizationNameQueryVariables
>;
export function refetchOrganizationNameQuery(variables?: SchemaTypes.OrganizationNameQueryVariables) {
  return { query: OrganizationNameDocument, variables: variables };
}
export const OrganizationProfileInfoDocument = gql`
  query organizationProfileInfo($id: UUID_NAMEID!) {
    organisation(ID: $id) {
      ...OrganizationProfileInfo
    }
  }
  ${OrganizationProfileInfoFragmentDoc}
`;

/**
 * __useOrganizationProfileInfoQuery__
 *
 * To run a query within a React component, call `useOrganizationProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationProfileInfoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.OrganizationProfileInfoQuery, SchemaTypes.OrganizationProfileInfoQueryVariables>(
    OrganizationProfileInfoDocument,
    baseOptions
  );
}
export function useOrganizationProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >(OrganizationProfileInfoDocument, baseOptions);
}
export type OrganizationProfileInfoQueryHookResult = ReturnType<typeof useOrganizationProfileInfoQuery>;
export type OrganizationProfileInfoLazyQueryHookResult = ReturnType<typeof useOrganizationProfileInfoLazyQuery>;
export type OrganizationProfileInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationProfileInfoQuery,
  SchemaTypes.OrganizationProfileInfoQueryVariables
>;
export function refetchOrganizationProfileInfoQuery(variables?: SchemaTypes.OrganizationProfileInfoQueryVariables) {
  return { query: OrganizationProfileInfoDocument, variables: variables };
}
export const OrganizationsListDocument = gql`
  query organizationsList {
    organisations {
      id
      displayName
    }
  }
`;

/**
 * __useOrganizationsListQuery__
 *
 * To run a query within a React component, call `useOrganizationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useOrganizationsListQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.OrganizationsListQuery, SchemaTypes.OrganizationsListQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.OrganizationsListQuery, SchemaTypes.OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    baseOptions
  );
}
export function useOrganizationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationsListQuery,
    SchemaTypes.OrganizationsListQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.OrganizationsListQuery, SchemaTypes.OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    baseOptions
  );
}
export type OrganizationsListQueryHookResult = ReturnType<typeof useOrganizationsListQuery>;
export type OrganizationsListLazyQueryHookResult = ReturnType<typeof useOrganizationsListLazyQuery>;
export type OrganizationsListQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationsListQuery,
  SchemaTypes.OrganizationsListQueryVariables
>;
export function refetchOrganizationsListQuery(variables?: SchemaTypes.OrganizationsListQueryVariables) {
  return { query: OrganizationsListDocument, variables: variables };
}
export const PlatformConfigurationDocument = gql`
  query platformConfiguration {
    configuration {
      platform {
        about
        feedback
        privacy
        security
        support
        terms
      }
    }
  }
`;

/**
 * __usePlatformConfigurationQuery__
 *
 * To run a query within a React component, call `usePlatformConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformConfigurationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformConfigurationQuery,
    SchemaTypes.PlatformConfigurationQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.PlatformConfigurationQuery, SchemaTypes.PlatformConfigurationQueryVariables>(
    PlatformConfigurationDocument,
    baseOptions
  );
}
export function usePlatformConfigurationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformConfigurationQuery,
    SchemaTypes.PlatformConfigurationQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.PlatformConfigurationQuery, SchemaTypes.PlatformConfigurationQueryVariables>(
    PlatformConfigurationDocument,
    baseOptions
  );
}
export type PlatformConfigurationQueryHookResult = ReturnType<typeof usePlatformConfigurationQuery>;
export type PlatformConfigurationLazyQueryHookResult = ReturnType<typeof usePlatformConfigurationLazyQuery>;
export type PlatformConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformConfigurationQuery,
  SchemaTypes.PlatformConfigurationQueryVariables
>;
export function refetchPlatformConfigurationQuery(variables?: SchemaTypes.PlatformConfigurationQueryVariables) {
  return { query: PlatformConfigurationDocument, variables: variables };
}
export const ProjectProfileDocument = gql`
  query projectProfile($ecoverseId: UUID_NAMEID!, $projectId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      project(ID: $projectId) {
        ...ProjectDetails
      }
    }
  }
  ${ProjectDetailsFragmentDoc}
`;

/**
 * __useProjectProfileQuery__
 *
 * To run a query within a React component, call `useProjectProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectProfileQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectProfileQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>(
    ProjectProfileDocument,
    baseOptions
  );
}
export function useProjectProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>(
    ProjectProfileDocument,
    baseOptions
  );
}
export type ProjectProfileQueryHookResult = ReturnType<typeof useProjectProfileQuery>;
export type ProjectProfileLazyQueryHookResult = ReturnType<typeof useProjectProfileLazyQuery>;
export type ProjectProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.ProjectProfileQuery,
  SchemaTypes.ProjectProfileQueryVariables
>;
export function refetchProjectProfileQuery(variables?: SchemaTypes.ProjectProfileQueryVariables) {
  return { query: ProjectProfileDocument, variables: variables };
}
export const ProjectsDocument = gql`
  query projects($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      projects {
        id
        nameID
        displayName
        description
        lifecycle {
          state
        }
      }
    }
  }
`;

/**
 * __useProjectsQuery__
 *
 * To run a query within a React component, call `useProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useProjectsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>(ProjectsDocument, baseOptions);
}
export function useProjectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>(
    ProjectsDocument,
    baseOptions
  );
}
export type ProjectsQueryHookResult = ReturnType<typeof useProjectsQuery>;
export type ProjectsLazyQueryHookResult = ReturnType<typeof useProjectsLazyQuery>;
export type ProjectsQueryResult = Apollo.QueryResult<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>;
export function refetchProjectsQuery(variables?: SchemaTypes.ProjectsQueryVariables) {
  return { query: ProjectsDocument, variables: variables };
}
export const ProjectsChainHistoryDocument = gql`
  query projectsChainHistory($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        displayName
        nameID
        opportunities {
          nameID
          projects {
            nameID
          }
        }
      }
    }
  }
`;

/**
 * __useProjectsChainHistoryQuery__
 *
 * To run a query within a React component, call `useProjectsChainHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsChainHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsChainHistoryQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useProjectsChainHistoryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ProjectsChainHistoryQuery,
    SchemaTypes.ProjectsChainHistoryQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.ProjectsChainHistoryQuery, SchemaTypes.ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    baseOptions
  );
}
export function useProjectsChainHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ProjectsChainHistoryQuery,
    SchemaTypes.ProjectsChainHistoryQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.ProjectsChainHistoryQuery, SchemaTypes.ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    baseOptions
  );
}
export type ProjectsChainHistoryQueryHookResult = ReturnType<typeof useProjectsChainHistoryQuery>;
export type ProjectsChainHistoryLazyQueryHookResult = ReturnType<typeof useProjectsChainHistoryLazyQuery>;
export type ProjectsChainHistoryQueryResult = Apollo.QueryResult<
  SchemaTypes.ProjectsChainHistoryQuery,
  SchemaTypes.ProjectsChainHistoryQueryVariables
>;
export function refetchProjectsChainHistoryQuery(variables?: SchemaTypes.ProjectsChainHistoryQueryVariables) {
  return { query: ProjectsChainHistoryDocument, variables: variables };
}
export const RelationsDocument = gql`
  query relations($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        relations {
          id
          type
          actorName
          actorType
          actorRole
          description
        }
      }
    }
  }
`;

/**
 * __useRelationsQuery__
 *
 * To run a query within a React component, call `useRelationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRelationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRelationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useRelationsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>(
    RelationsDocument,
    baseOptions
  );
}
export function useRelationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>(
    RelationsDocument,
    baseOptions
  );
}
export type RelationsQueryHookResult = ReturnType<typeof useRelationsQuery>;
export type RelationsLazyQueryHookResult = ReturnType<typeof useRelationsLazyQuery>;
export type RelationsQueryResult = Apollo.QueryResult<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>;
export function refetchRelationsQuery(variables?: SchemaTypes.RelationsQueryVariables) {
  return { query: RelationsDocument, variables: variables };
}
export const SearchDocument = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      terms
      result {
        ... on User {
          displayName
          id
        }
        ... on UserGroup {
          name
          id
        }
        ... on Organisation {
          displayName
          id
        }
        ... on Challenge {
          displayName
          id
          ecoverseID
          context {
            tagline
            visual {
              avatar
            }
          }
        }
      }
    }
  }
`;

/**
 * __useSearchQuery__
 *
 * To run a query within a React component, call `useSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useSearchQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>(SearchDocument, baseOptions);
}
export function useSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>(SearchDocument, baseOptions);
}
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchQueryResult = Apollo.QueryResult<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>;
export function refetchSearchQuery(variables?: SchemaTypes.SearchQueryVariables) {
  return { query: SearchDocument, variables: variables };
}
export const ServerMetadataDocument = gql`
  query serverMetadata {
    metadata {
      services {
        name
        version
      }
    }
  }
`;

/**
 * __useServerMetadataQuery__
 *
 * To run a query within a React component, call `useServerMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerMetadataQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerMetadataQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>(
    ServerMetadataDocument,
    baseOptions
  );
}
export function useServerMetadataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>(
    ServerMetadataDocument,
    baseOptions
  );
}
export type ServerMetadataQueryHookResult = ReturnType<typeof useServerMetadataQuery>;
export type ServerMetadataLazyQueryHookResult = ReturnType<typeof useServerMetadataLazyQuery>;
export type ServerMetadataQueryResult = Apollo.QueryResult<
  SchemaTypes.ServerMetadataQuery,
  SchemaTypes.ServerMetadataQueryVariables
>;
export function refetchServerMetadataQuery(variables?: SchemaTypes.ServerMetadataQueryVariables) {
  return { query: ServerMetadataDocument, variables: variables };
}
export const TagsetsTemplateDocument = gql`
  query tagsetsTemplate {
    configuration {
      template {
        users {
          tagsets {
            name
            placeholder
          }
        }
      }
    }
  }
`;

/**
 * __useTagsetsTemplateQuery__
 *
 * To run a query within a React component, call `useTagsetsTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagsetsTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagsetsTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useTagsetsTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>(
    TagsetsTemplateDocument,
    baseOptions
  );
}
export function useTagsetsTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>(
    TagsetsTemplateDocument,
    baseOptions
  );
}
export type TagsetsTemplateQueryHookResult = ReturnType<typeof useTagsetsTemplateQuery>;
export type TagsetsTemplateLazyQueryHookResult = ReturnType<typeof useTagsetsTemplateLazyQuery>;
export type TagsetsTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.TagsetsTemplateQuery,
  SchemaTypes.TagsetsTemplateQueryVariables
>;
export function refetchTagsetsTemplateQuery(variables?: SchemaTypes.TagsetsTemplateQueryVariables) {
  return { query: TagsetsTemplateDocument, variables: variables };
}
export const UserDocument = gql`
  query user($id: UUID_NAMEID_EMAIL!) {
    user(ID: $id) {
      ...UserDetails
      ...UserAgent
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
`;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>(UserDocument, baseOptions);
}
export function useUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>(UserDocument, baseOptions);
}
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>;
export function refetchUserQuery(variables?: SchemaTypes.UserQueryVariables) {
  return { query: UserDocument, variables: variables };
}
export const UserApplicationsDocument = gql`
  query userApplications($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      applications {
        id
        state
        communityID
      }
    }
  }
`;

/**
 * __useUserApplicationsQuery__
 *
 * To run a query within a React component, call `useUserApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserApplicationsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserApplicationsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserApplicationsQuery, SchemaTypes.UserApplicationsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.UserApplicationsQuery, SchemaTypes.UserApplicationsQueryVariables>(
    UserApplicationsDocument,
    baseOptions
  );
}
export function useUserApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserApplicationsQuery,
    SchemaTypes.UserApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.UserApplicationsQuery, SchemaTypes.UserApplicationsQueryVariables>(
    UserApplicationsDocument,
    baseOptions
  );
}
export type UserApplicationsQueryHookResult = ReturnType<typeof useUserApplicationsQuery>;
export type UserApplicationsLazyQueryHookResult = ReturnType<typeof useUserApplicationsLazyQuery>;
export type UserApplicationsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserApplicationsQuery,
  SchemaTypes.UserApplicationsQueryVariables
>;
export function refetchUserApplicationsQuery(variables?: SchemaTypes.UserApplicationsQueryVariables) {
  return { query: UserApplicationsDocument, variables: variables };
}
export const UserAvatarsDocument = gql`
  query userAvatars($ids: [UUID_NAMEID_EMAIL!]!) {
    usersById(IDs: $ids) {
      id
      displayName
      profile {
        id
        avatar
      }
    }
  }
`;

/**
 * __useUserAvatarsQuery__
 *
 * To run a query within a React component, call `useUserAvatarsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAvatarsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAvatarsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useUserAvatarsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>(
    UserAvatarsDocument,
    baseOptions
  );
}
export function useUserAvatarsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>(
    UserAvatarsDocument,
    baseOptions
  );
}
export type UserAvatarsQueryHookResult = ReturnType<typeof useUserAvatarsQuery>;
export type UserAvatarsLazyQueryHookResult = ReturnType<typeof useUserAvatarsLazyQuery>;
export type UserAvatarsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserAvatarsQuery,
  SchemaTypes.UserAvatarsQueryVariables
>;
export function refetchUserAvatarsQuery(variables?: SchemaTypes.UserAvatarsQueryVariables) {
  return { query: UserAvatarsDocument, variables: variables };
}
export const UsersDocument = gql`
  query users {
    users {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>
) {
  return Apollo.useQuery<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>(UsersDocument, baseOptions);
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>
) {
  return Apollo.useLazyQuery<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>(UsersDocument, baseOptions);
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>;
export function refetchUsersQuery(variables?: SchemaTypes.UsersQueryVariables) {
  return { query: UsersDocument, variables: variables };
}
export const UsersWithCredentialsDocument = gql`
  query usersWithCredentials($input: UsersWithAuthorizationCredentialInput!) {
    usersWithAuthorizationCredential(credentialsCriteriaData: $input) {
      id
      displayName
      firstName
      lastName
      email
    }
  }
`;

/**
 * __useUsersWithCredentialsQuery__
 *
 * To run a query within a React component, call `useUsersWithCredentialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersWithCredentialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersWithCredentialsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUsersWithCredentialsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UsersWithCredentialsQuery,
    SchemaTypes.UsersWithCredentialsQueryVariables
  >
) {
  return Apollo.useQuery<SchemaTypes.UsersWithCredentialsQuery, SchemaTypes.UsersWithCredentialsQueryVariables>(
    UsersWithCredentialsDocument,
    baseOptions
  );
}
export function useUsersWithCredentialsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UsersWithCredentialsQuery,
    SchemaTypes.UsersWithCredentialsQueryVariables
  >
) {
  return Apollo.useLazyQuery<SchemaTypes.UsersWithCredentialsQuery, SchemaTypes.UsersWithCredentialsQueryVariables>(
    UsersWithCredentialsDocument,
    baseOptions
  );
}
export type UsersWithCredentialsQueryHookResult = ReturnType<typeof useUsersWithCredentialsQuery>;
export type UsersWithCredentialsLazyQueryHookResult = ReturnType<typeof useUsersWithCredentialsLazyQuery>;
export type UsersWithCredentialsQueryResult = Apollo.QueryResult<
  SchemaTypes.UsersWithCredentialsQuery,
  SchemaTypes.UsersWithCredentialsQueryVariables
>;
export function refetchUsersWithCredentialsQuery(variables?: SchemaTypes.UsersWithCredentialsQueryVariables) {
  return { query: UsersWithCredentialsDocument, variables: variables };
}
