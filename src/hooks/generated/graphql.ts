import * as SchemaTypes from '../../models/graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {};
export const AdminEcoverseFragmentDoc = gql`
  fragment AdminEcoverse on Ecoverse {
    id
    nameID
    displayName
    authorization {
      id
      myPrivileges
    }
  }
`;
export const ApplicationInfoFragmentDoc = gql`
  fragment ApplicationInfo on Application {
    id
    createdDate
    updatedDate
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
export const ChallengeCardFragmentDoc = gql`
  fragment ChallengeCard on Challenge {
    id
    displayName
    nameID
    activity {
      id
      name
      value
    }
    context {
      id
      tagline
      visual {
        id
        background
      }
    }
    tagset {
      id
      name
      tags
    }
  }
`;
export const ContextVisualFragmentDoc = gql`
  fragment ContextVisual on Visual {
    id
    avatar
    background
    banner
  }
`;
export const ChallengeInfoFragmentDoc = gql`
  fragment ChallengeInfo on Challenge {
    id
    displayName
    nameID
    community {
      id
    }
    authorization {
      id
      myPrivileges
    }
    context {
      id
      tagline
      references {
        id
        name
        uri
      }
      visual {
        ...ContextVisual
      }
    }
  }
  ${ContextVisualFragmentDoc}
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
    communication {
      id
      authorization {
        id
        myPrivileges
      }
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
  fragment MessageDetails on Message {
    id
    sender
    message
    timestamp
  }
`;
export const CommunityMessagesFragmentDoc = gql`
  fragment CommunityMessages on Community {
    id
    communication {
      id
      updates {
        id
        messages {
          ...MessageDetails
        }
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export const CommunityPageMembersFragmentDoc = gql`
  fragment CommunityPageMembers on User {
    id
    nameID
    displayName
    country
    city
    email
    agent {
      id
      credentials {
        id
        type
        resourceID
      }
    }
    profile {
      id
      avatar
      description
      tagsets {
        id
        tags
      }
    }
  }
`;
export const ConfigurationFragmentDoc = gql`
  fragment Configuration on Config {
    authentication {
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
    platform {
      about
      feedback
      privacy
      security
      support
      terms
      featureFlags {
        enabled
        name
      }
    }
    sentry {
      enabled
      endpoint
      submitPII
    }
  }
`;
export const EcoverseNameFragmentDoc = gql`
  fragment EcoverseName on Ecoverse {
    id
    nameID
    displayName
  }
`;
export const ContextDetailsProviderFragmentDoc = gql`
  fragment ContextDetailsProvider on Context {
    id
    tagline
    background
    vision
    impact
    who
    visual {
      ...ContextVisual
    }
  }
  ${ContextVisualFragmentDoc}
`;
export const EcoverseDetailsProviderFragmentDoc = gql`
  fragment EcoverseDetailsProvider on Ecoverse {
    id
    nameID
    displayName
    authorization {
      id
      anonymousReadAccess
    }
    activity {
      name
      value
    }
    community {
      id
    }
    tagset {
      id
      name
      tags
    }
    context {
      ...ContextDetailsProvider
    }
  }
  ${ContextDetailsProviderFragmentDoc}
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
export const ProjectDetailsFragmentDoc = gql`
  fragment ProjectDetails on Project {
    id
    nameID
    displayName
    description
    lifecycle {
      id
      state
    }
    tagset {
      id
      name
      tags
    }
  }
`;
export const OpportunityInfoFragmentDoc = gql`
  fragment OpportunityInfo on Opportunity {
    id
    nameID
    displayName
    lifecycle {
      id
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
      id
      members {
        id
        displayName
      }
    }
    tagset {
      id
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
    authorization {
      id
      myPrivileges
    }
  }
  ${ContextDetailsFragmentDoc}
  ${ProjectDetailsFragmentDoc}
`;
export const OrganizationInfoFragmentDoc = gql`
  fragment OrganizationInfo on Organization {
    id
    nameID
    displayName
    contactEmail
    domain
    verification {
      id
      status
    }
    website
    profile {
      id
      avatar
      description
      tagsets {
        id
        name
        tags
      }
      references {
        id
        name
        uri
      }
    }
    members {
      id
      nameID
      displayName
      city
      country
      agent {
        id
        credentials {
          id
          type
          resourceID
        }
      }
      profile {
        id
        avatar
        tagsets {
          id
          tags
        }
      }
    }
  }
`;
export const OrganizationProfileInfoFragmentDoc = gql`
  fragment OrganizationProfileInfo on Organization {
    id
    nameID
    displayName
    contactEmail
    domain
    legalEntityName
    website
    verification {
      id
      status
    }
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
export const ReferenceDetailsFragmentDoc = gql`
  fragment ReferenceDetails on Reference {
    id
    name
    uri
    description
  }
`;
export const ChallengeSearchResultFragmentDoc = gql`
  fragment ChallengeSearchResult on Challenge {
    id
    displayName
    nameID
    ecoverseID
    activity {
      name
      value
    }
    context {
      id
      tagline
      visual {
        id
        avatar
        background
      }
    }
    tagset {
      id
      tags
    }
  }
`;
export const OpportunitySearchResultFragmentDoc = gql`
  fragment OpportunitySearchResult on Opportunity {
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
        id
        avatar
        background
      }
    }
    tagset {
      id
      tags
    }
    challenge {
      id
      nameID
      displayName
      ecoverseID
    }
  }
`;
export const OrganizationSearchResultFragmentDoc = gql`
  fragment OrganizationSearchResult on Organization {
    id
    displayName
    profile {
      id
      avatar
      tagsets {
        id
        name
        tags
      }
    }
  }
`;
export const UserSearchResultFragmentDoc = gql`
  fragment UserSearchResult on UserGroup {
    name
    id
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
    nameID
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
export const UserDisplayNameFragmentDoc = gql`
  fragment UserDisplayName on User {
    id
    displayName
  }
`;
export const UserMembershipDetailsFragmentDoc = gql`
  fragment UserMembershipDetails on UserMembership {
    ecoverses {
      id
      nameID
      ecoverseID
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
    organizations {
      id
      nameID
      displayName
      userGroups {
        id
        nameID
        displayName
      }
    }
    communities {
      id
      displayName
    }
    applications {
      id
      communityID
      displayName
      state
      ecoverseID
      challengeID
      opportunityID
    }
  }
`;
export const OrganizationDetailsFragmentDoc = gql`
  fragment OrganizationDetails on Organization {
    id
    displayName
    nameID
    profile {
      id
      avatar
      description
      tagsets {
        id
        tags
      }
    }
  }
`;
export const ChallengeProfileFragmentDoc = gql`
  fragment ChallengeProfile on Challenge {
    id
    nameID
    displayName
    activity {
      id
      name
      value
    }
    leadOrganizations {
      ...OrganizationDetails
    }
    lifecycle {
      id
      machineDef
      state
      nextEvents
      stateIsFinal
    }
    context {
      ...ContextDetails
    }
    community {
      id
      authorization {
        id
        myPrivileges
      }
      members {
        id
        displayName
      }
    }
    tagset {
      id
      name
      tags
    }
    opportunities {
      id
      nameID
      displayName
      activity {
        id
        name
        value
      }
      lifecycle {
        id
        state
      }
      context {
        ...ContextDetails
      }
      projects {
        id
        nameID
        displayName
        description
        lifecycle {
          id
          state
        }
      }
      tagset {
        id
        name
        tags
      }
    }
  }
  ${OrganizationDetailsFragmentDoc}
  ${ContextDetailsFragmentDoc}
`;
export const AllCommunityDetailsFragmentDoc = gql`
  fragment AllCommunityDetails on Community {
    id
    displayName
  }
`;
export const CanvasSummaryFragmentDoc = gql`
  fragment CanvasSummary on Canvas {
    id
    name
    isTemplate
  }
`;
export const ChechkoutDetailsFragmentDoc = gql`
  fragment ChechkoutDetails on CanvasCheckout {
    id
    lockedBy
    status
    lifecycle {
      id
      nextEvents
    }
    authorization {
      id
      myPrivileges
    }
  }
`;
export const CanvasDetailsFragmentDoc = gql`
  fragment CanvasDetails on Canvas {
    ...CanvasSummary
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
    checkout {
      ...ChechkoutDetails
    }
  }
  ${CanvasSummaryFragmentDoc}
  ${ChechkoutDetailsFragmentDoc}
`;
export const CanvasValueFragmentDoc = gql`
  fragment CanvasValue on Canvas {
    id
    value
  }
`;
export const ChallengeExplorerSearchResultFragmentDoc = gql`
  fragment ChallengeExplorerSearchResult on Challenge {
    id
    displayName
    nameID
    ecoverseID
    activity {
      id
      name
      value
    }
    context {
      id
      visual {
        id
        background
      }
    }
    tagset {
      id
      name
      tags
    }
  }
`;
export const SimpleEcoverseFragmentDoc = gql`
  fragment SimpleEcoverse on Ecoverse {
    id
    nameID
    displayName
  }
`;
export const SimpleEcoverseResultEntryFragmentDoc = gql`
  fragment SimpleEcoverseResultEntry on MembershipUserResultEntryEcoverse {
    ecoverseID
    nameID
    displayName
  }
`;
export const DiscussionDetailsFragmentDoc = gql`
  fragment DiscussionDetails on Discussion {
    id
    title
    description
    createdBy
    timestamp
    category
    commentsCount
    authorization {
      myPrivileges
    }
  }
`;
export const DiscussionDetailsNoAuthFragmentDoc = gql`
  fragment DiscussionDetailsNoAuth on Discussion {
    id
    title
    description
    createdBy
    timestamp
    category
    commentsCount
  }
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
      nameID
    }
    context {
      ...ContextDetails
    }
  }
  ${ContextDetailsFragmentDoc}
`;
export const EcoverseInfoFragmentDoc = gql`
  fragment EcoverseInfo on Ecoverse {
    ...EcoverseDetails
    authorization {
      id
      myPrivileges
    }
    community {
      id
      displayName
      members {
        id
      }
      authorization {
        id
        myPrivileges
      }
    }
  }
  ${EcoverseDetailsFragmentDoc}
`;
export const EcoversePageFragmentDoc = gql`
  fragment EcoversePage on Ecoverse {
    ...EcoverseInfo
    activity {
      id
      name
      value
    }
  }
  ${EcoverseInfoFragmentDoc}
`;
export const ProjectInfoFragmentDoc = gql`
  fragment ProjectInfo on Project {
    id
    nameID
    displayName
    description
    lifecycle {
      state
    }
  }
`;
export const OpportunityPageFragmentDoc = gql`
  fragment OpportunityPage on Opportunity {
    id
    nameID
    displayName
    tagset {
      id
      name
      tags
    }
    activity {
      id
      name
      value
    }
    lifecycle {
      id
      machineDef
      state
      nextEvents
      stateIsFinal
    }
    relations {
      id
      type
      actorRole
      actorName
      actorType
      description
    }
    context {
      id
      background
      tagline
      who
      impact
      vision
      references {
        id
        name
        uri
      }
      aspects {
        id
        title
        explanation
        framing
      }
      visual {
        id
        banner
      }
      ecosystemModel {
        id
        actorGroups {
          id
          name
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
    projects {
      id
      nameID
      displayName
      description
    }
    community {
      id
      authorization {
        id
        myPrivileges
      }
      members {
        id
        nameID
      }
    }
  }
`;
export const AssociatedOrganizationDetailsFragmentDoc = gql`
  fragment AssociatedOrganizationDetails on Organization {
    id
    displayName
    nameID
    profile {
      id
      description
      avatar
    }
    verification {
      id
      status
    }
    activity {
      id
      name
      value
    }
  }
`;
export const UpdateUserPreferencesDocument = gql`
  mutation updateUserPreferences($input: UpdateUserPreferenceInput!) {
    updateUserPreference(userPreferenceData: $input) {
      id
      value
    }
  }
`;
export type UpdateUserPreferencesMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateUserPreferencesMutation,
  SchemaTypes.UpdateUserPreferencesMutationVariables
>;

/**
 * __useUpdateUserPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateUserPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPreferencesMutation, { data, loading, error }] = useUpdateUserPreferencesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserPreferencesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateUserPreferencesMutation,
    SchemaTypes.UpdateUserPreferencesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateUserPreferencesMutation,
    SchemaTypes.UpdateUserPreferencesMutationVariables
  >(UpdateUserPreferencesDocument, options);
}
export type UpdateUserPreferencesMutationHookResult = ReturnType<typeof useUpdateUserPreferencesMutation>;
export type UpdateUserPreferencesMutationResult = Apollo.MutationResult<SchemaTypes.UpdateUserPreferencesMutation>;
export type UpdateUserPreferencesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateUserPreferencesMutation,
  SchemaTypes.UpdateUserPreferencesMutationVariables
>;
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserToCommunityMutation,
    SchemaTypes.AssignUserToCommunityMutationVariables
  >(AssignUserToCommunityDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.AssignUserToGroupMutation, SchemaTypes.AssignUserToGroupMutationVariables>(
    AssignUserToGroupDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateActorMutation, SchemaTypes.CreateActorMutationVariables>(
    CreateActorDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateActorGroupMutation, SchemaTypes.CreateActorGroupMutationVariables>(
    CreateActorGroupDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateApplicationMutation, SchemaTypes.CreateApplicationMutationVariables>(
    CreateApplicationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateAspectMutation, SchemaTypes.CreateAspectMutationVariables>(
    CreateAspectDocument,
    options
  );
}
export type CreateAspectMutationHookResult = ReturnType<typeof useCreateAspectMutation>;
export type CreateAspectMutationResult = Apollo.MutationResult<SchemaTypes.CreateAspectMutation>;
export type CreateAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateAspectMutation,
  SchemaTypes.CreateAspectMutationVariables
>;
export const CreateChallengeDocument = gql`
  mutation createChallenge($input: CreateChallengeOnEcoverseInput!) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateChallengeMutation, SchemaTypes.CreateChallengeMutationVariables>(
    CreateChallengeDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateEcoverseMutation, SchemaTypes.CreateEcoverseMutationVariables>(
    CreateEcoverseDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateGroupOnCommunityMutation,
    SchemaTypes.CreateGroupOnCommunityMutationVariables
  >(CreateGroupOnCommunityDocument, options);
}
export type CreateGroupOnCommunityMutationHookResult = ReturnType<typeof useCreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationResult = Apollo.MutationResult<SchemaTypes.CreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateGroupOnCommunityMutation,
  SchemaTypes.CreateGroupOnCommunityMutationVariables
>;
export const CreateGroupOnOrganizationDocument = gql`
  mutation createGroupOnOrganization($input: CreateUserGroupInput!) {
    createGroupOnOrganization(groupData: $input) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateGroupOnOrganizationMutation,
    SchemaTypes.CreateGroupOnOrganizationMutationVariables
  >(CreateGroupOnOrganizationDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateOpportunityMutation, SchemaTypes.CreateOpportunityMutationVariables>(
    CreateOpportunityDocument,
    options
  );
}
export type CreateOpportunityMutationHookResult = ReturnType<typeof useCreateOpportunityMutation>;
export type CreateOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.CreateOpportunityMutation>;
export type CreateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateOpportunityMutation,
  SchemaTypes.CreateOpportunityMutationVariables
>;
export const CreateOrganizationDocument = gql`
  mutation createOrganization($input: CreateOrganizationInput!) {
    createOrganization(organizationData: $input) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateOrganizationMutation, SchemaTypes.CreateOrganizationMutationVariables>(
    CreateOrganizationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateProjectMutation, SchemaTypes.CreateProjectMutationVariables>(
    CreateProjectDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateReferenceOnContextMutation,
    SchemaTypes.CreateReferenceOnContextMutationVariables
  >(CreateReferenceOnContextDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateReferenceOnProfileMutation,
    SchemaTypes.CreateReferenceOnProfileMutationVariables
  >(CreateReferenceOnProfileDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateRelationMutation, SchemaTypes.CreateRelationMutationVariables>(
    CreateRelationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateTagsetOnProfileMutation,
    SchemaTypes.CreateTagsetOnProfileMutationVariables
  >(CreateTagsetOnProfileDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateUserMutation, SchemaTypes.CreateUserMutationVariables>(
    CreateUserDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateUserNewRegistrationMutation,
    SchemaTypes.CreateUserNewRegistrationMutationVariables
  >(CreateUserNewRegistrationDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteActorMutation, SchemaTypes.DeleteActorMutationVariables>(
    DeleteActorDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteAspectMutation, SchemaTypes.DeleteAspectMutationVariables>(
    DeleteAspectDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteChallengeMutation, SchemaTypes.DeleteChallengeMutationVariables>(
    DeleteChallengeDocument,
    options
  );
}
export type DeleteChallengeMutationHookResult = ReturnType<typeof useDeleteChallengeMutation>;
export type DeleteChallengeMutationResult = Apollo.MutationResult<SchemaTypes.DeleteChallengeMutation>;
export type DeleteChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteChallengeMutation,
  SchemaTypes.DeleteChallengeMutationVariables
>;
export const DeleteDiscussionDocument = gql`
  mutation deleteDiscussion($deleteData: DeleteDiscussionInput!) {
    deleteDiscussion(deleteData: $deleteData) {
      id
      title
    }
  }
`;
export type DeleteDiscussionMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteDiscussionMutation,
  SchemaTypes.DeleteDiscussionMutationVariables
>;

/**
 * __useDeleteDiscussionMutation__
 *
 * To run a mutation, you first call `useDeleteDiscussionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDiscussionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDiscussionMutation, { data, loading, error }] = useDeleteDiscussionMutation({
 *   variables: {
 *      deleteData: // value for 'deleteData'
 *   },
 * });
 */
export function useDeleteDiscussionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteDiscussionMutation,
    SchemaTypes.DeleteDiscussionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteDiscussionMutation, SchemaTypes.DeleteDiscussionMutationVariables>(
    DeleteDiscussionDocument,
    options
  );
}
export type DeleteDiscussionMutationHookResult = ReturnType<typeof useDeleteDiscussionMutation>;
export type DeleteDiscussionMutationResult = Apollo.MutationResult<SchemaTypes.DeleteDiscussionMutation>;
export type DeleteDiscussionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteDiscussionMutation,
  SchemaTypes.DeleteDiscussionMutationVariables
>;
export const DeleteEcoverseDocument = gql`
  mutation deleteEcoverse($input: DeleteEcoverseInput!) {
    deleteEcoverse(deleteData: $input) {
      id
      nameID
      displayName
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteEcoverseMutation, SchemaTypes.DeleteEcoverseMutationVariables>(
    DeleteEcoverseDocument,
    options
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
      name
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteGroupMutation, SchemaTypes.DeleteGroupMutationVariables>(
    DeleteGroupDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteOpportunityMutation, SchemaTypes.DeleteOpportunityMutationVariables>(
    DeleteOpportunityDocument,
    options
  );
}
export type DeleteOpportunityMutationHookResult = ReturnType<typeof useDeleteOpportunityMutation>;
export type DeleteOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.DeleteOpportunityMutation>;
export type DeleteOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteOpportunityMutation,
  SchemaTypes.DeleteOpportunityMutationVariables
>;
export const DeleteOrganizationDocument = gql`
  mutation deleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(deleteData: $input) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteOrganizationMutation, SchemaTypes.DeleteOrganizationMutationVariables>(
    DeleteOrganizationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteReferenceMutation, SchemaTypes.DeleteReferenceMutationVariables>(
    DeleteReferenceDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteRelationMutation, SchemaTypes.DeleteRelationMutationVariables>(
    DeleteRelationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteUserMutation, SchemaTypes.DeleteUserMutationVariables>(
    DeleteUserDocument,
    options
  );
}
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<SchemaTypes.DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteUserMutation,
  SchemaTypes.DeleteUserMutationVariables
>;
export const DeleteUserApplicationDocument = gql`
  mutation deleteUserApplication($input: DeleteApplicationInput!) {
    deleteUserApplication(deleteData: $input) {
      id
    }
  }
`;
export type DeleteUserApplicationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteUserApplicationMutation,
  SchemaTypes.DeleteUserApplicationMutationVariables
>;

/**
 * __useDeleteUserApplicationMutation__
 *
 * To run a mutation, you first call `useDeleteUserApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserApplicationMutation, { data, loading, error }] = useDeleteUserApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteUserApplicationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteUserApplicationMutation,
    SchemaTypes.DeleteUserApplicationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteUserApplicationMutation,
    SchemaTypes.DeleteUserApplicationMutationVariables
  >(DeleteUserApplicationDocument, options);
}
export type DeleteUserApplicationMutationHookResult = ReturnType<typeof useDeleteUserApplicationMutation>;
export type DeleteUserApplicationMutationResult = Apollo.MutationResult<SchemaTypes.DeleteUserApplicationMutation>;
export type DeleteUserApplicationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteUserApplicationMutation,
  SchemaTypes.DeleteUserApplicationMutationVariables
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.EventOnApplicationMutation, SchemaTypes.EventOnApplicationMutationVariables>(
    EventOnApplicationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.EventOnChallengeMutation, SchemaTypes.EventOnChallengeMutationVariables>(
    EventOnChallengeDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.EventOnOpportunityMutation, SchemaTypes.EventOnOpportunityMutationVariables>(
    EventOnOpportunityDocument,
    options
  );
}
export type EventOnOpportunityMutationHookResult = ReturnType<typeof useEventOnOpportunityMutation>;
export type EventOnOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.EventOnOpportunityMutation>;
export type EventOnOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.EventOnOpportunityMutation,
  SchemaTypes.EventOnOpportunityMutationVariables
>;
export const AssignUserAsChallengeAdminDocument = gql`
  mutation assignUserAsChallengeAdmin($input: AssignChallengeAdminInput!) {
    assignUserAsChallengeAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsChallengeAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsChallengeAdminMutation,
  SchemaTypes.AssignUserAsChallengeAdminMutationVariables
>;

/**
 * __useAssignUserAsChallengeAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsChallengeAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsChallengeAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsChallengeAdminMutation, { data, loading, error }] = useAssignUserAsChallengeAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsChallengeAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsChallengeAdminMutation,
    SchemaTypes.AssignUserAsChallengeAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsChallengeAdminMutation,
    SchemaTypes.AssignUserAsChallengeAdminMutationVariables
  >(AssignUserAsChallengeAdminDocument, options);
}
export type AssignUserAsChallengeAdminMutationHookResult = ReturnType<typeof useAssignUserAsChallengeAdminMutation>;
export type AssignUserAsChallengeAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsChallengeAdminMutation>;
export type AssignUserAsChallengeAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsChallengeAdminMutation,
  SchemaTypes.AssignUserAsChallengeAdminMutationVariables
>;
export const AssignUserAsEcoverseAdminDocument = gql`
  mutation assignUserAsEcoverseAdmin($input: AssignEcoverseAdminInput!) {
    assignUserAsEcoverseAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsEcoverseAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsEcoverseAdminMutation,
  SchemaTypes.AssignUserAsEcoverseAdminMutationVariables
>;

/**
 * __useAssignUserAsEcoverseAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsEcoverseAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsEcoverseAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsEcoverseAdminMutation, { data, loading, error }] = useAssignUserAsEcoverseAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsEcoverseAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsEcoverseAdminMutation,
    SchemaTypes.AssignUserAsEcoverseAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsEcoverseAdminMutation,
    SchemaTypes.AssignUserAsEcoverseAdminMutationVariables
  >(AssignUserAsEcoverseAdminDocument, options);
}
export type AssignUserAsEcoverseAdminMutationHookResult = ReturnType<typeof useAssignUserAsEcoverseAdminMutation>;
export type AssignUserAsEcoverseAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsEcoverseAdminMutation>;
export type AssignUserAsEcoverseAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsEcoverseAdminMutation,
  SchemaTypes.AssignUserAsEcoverseAdminMutationVariables
>;
export const AssignUserAsGlobalAdminDocument = gql`
  mutation assignUserAsGlobalAdmin($input: AssignGlobalAdminInput!) {
    assignUserAsGlobalAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsGlobalAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsGlobalAdminMutation,
  SchemaTypes.AssignUserAsGlobalAdminMutationVariables
>;

/**
 * __useAssignUserAsGlobalAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsGlobalAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsGlobalAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsGlobalAdminMutation, { data, loading, error }] = useAssignUserAsGlobalAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsGlobalAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsGlobalAdminMutation,
    SchemaTypes.AssignUserAsGlobalAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsGlobalAdminMutation,
    SchemaTypes.AssignUserAsGlobalAdminMutationVariables
  >(AssignUserAsGlobalAdminDocument, options);
}
export type AssignUserAsGlobalAdminMutationHookResult = ReturnType<typeof useAssignUserAsGlobalAdminMutation>;
export type AssignUserAsGlobalAdminMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserAsGlobalAdminMutation>;
export type AssignUserAsGlobalAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsGlobalAdminMutation,
  SchemaTypes.AssignUserAsGlobalAdminMutationVariables
>;
export const AssignUserAsGlobalCommunityAdminDocument = gql`
  mutation assignUserAsGlobalCommunityAdmin($input: AssignGlobalCommunityAdminInput!) {
    assignUserAsGlobalCommunityAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsGlobalCommunityAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsGlobalCommunityAdminMutation,
  SchemaTypes.AssignUserAsGlobalCommunityAdminMutationVariables
>;

/**
 * __useAssignUserAsGlobalCommunityAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsGlobalCommunityAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsGlobalCommunityAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsGlobalCommunityAdminMutation, { data, loading, error }] = useAssignUserAsGlobalCommunityAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsGlobalCommunityAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsGlobalCommunityAdminMutation,
    SchemaTypes.AssignUserAsGlobalCommunityAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsGlobalCommunityAdminMutation,
    SchemaTypes.AssignUserAsGlobalCommunityAdminMutationVariables
  >(AssignUserAsGlobalCommunityAdminDocument, options);
}
export type AssignUserAsGlobalCommunityAdminMutationHookResult = ReturnType<
  typeof useAssignUserAsGlobalCommunityAdminMutation
>;
export type AssignUserAsGlobalCommunityAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsGlobalCommunityAdminMutation>;
export type AssignUserAsGlobalCommunityAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsGlobalCommunityAdminMutation,
  SchemaTypes.AssignUserAsGlobalCommunityAdminMutationVariables
>;
export const AssignUserAsOrganizationOwnerDocument = gql`
  mutation assignUserAsOrganizationOwner($input: AssignOrganizationOwnerInput!) {
    assignUserAsOrganizationOwner(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsOrganizationOwnerMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsOrganizationOwnerMutation,
  SchemaTypes.AssignUserAsOrganizationOwnerMutationVariables
>;

/**
 * __useAssignUserAsOrganizationOwnerMutation__
 *
 * To run a mutation, you first call `useAssignUserAsOrganizationOwnerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsOrganizationOwnerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsOrganizationOwnerMutation, { data, loading, error }] = useAssignUserAsOrganizationOwnerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsOrganizationOwnerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsOrganizationOwnerMutation,
    SchemaTypes.AssignUserAsOrganizationOwnerMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsOrganizationOwnerMutation,
    SchemaTypes.AssignUserAsOrganizationOwnerMutationVariables
  >(AssignUserAsOrganizationOwnerDocument, options);
}
export type AssignUserAsOrganizationOwnerMutationHookResult = ReturnType<
  typeof useAssignUserAsOrganizationOwnerMutation
>;
export type AssignUserAsOrganizationOwnerMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsOrganizationOwnerMutation>;
export type AssignUserAsOrganizationOwnerMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsOrganizationOwnerMutation,
  SchemaTypes.AssignUserAsOrganizationOwnerMutationVariables
>;
export const RemoveUserAsChallengeAdminDocument = gql`
  mutation removeUserAsChallengeAdmin($input: RemoveChallengeAdminInput!) {
    removeUserAsChallengeAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsChallengeAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsChallengeAdminMutation,
  SchemaTypes.RemoveUserAsChallengeAdminMutationVariables
>;

/**
 * __useRemoveUserAsChallengeAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsChallengeAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsChallengeAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsChallengeAdminMutation, { data, loading, error }] = useRemoveUserAsChallengeAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsChallengeAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsChallengeAdminMutation,
    SchemaTypes.RemoveUserAsChallengeAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsChallengeAdminMutation,
    SchemaTypes.RemoveUserAsChallengeAdminMutationVariables
  >(RemoveUserAsChallengeAdminDocument, options);
}
export type RemoveUserAsChallengeAdminMutationHookResult = ReturnType<typeof useRemoveUserAsChallengeAdminMutation>;
export type RemoveUserAsChallengeAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsChallengeAdminMutation>;
export type RemoveUserAsChallengeAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsChallengeAdminMutation,
  SchemaTypes.RemoveUserAsChallengeAdminMutationVariables
>;
export const RemoveUserAsEcoverseAdminDocument = gql`
  mutation removeUserAsEcoverseAdmin($input: RemoveEcoverseAdminInput!) {
    removeUserAsEcoverseAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsEcoverseAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsEcoverseAdminMutation,
  SchemaTypes.RemoveUserAsEcoverseAdminMutationVariables
>;

/**
 * __useRemoveUserAsEcoverseAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsEcoverseAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsEcoverseAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsEcoverseAdminMutation, { data, loading, error }] = useRemoveUserAsEcoverseAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsEcoverseAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsEcoverseAdminMutation,
    SchemaTypes.RemoveUserAsEcoverseAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsEcoverseAdminMutation,
    SchemaTypes.RemoveUserAsEcoverseAdminMutationVariables
  >(RemoveUserAsEcoverseAdminDocument, options);
}
export type RemoveUserAsEcoverseAdminMutationHookResult = ReturnType<typeof useRemoveUserAsEcoverseAdminMutation>;
export type RemoveUserAsEcoverseAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsEcoverseAdminMutation>;
export type RemoveUserAsEcoverseAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsEcoverseAdminMutation,
  SchemaTypes.RemoveUserAsEcoverseAdminMutationVariables
>;
export const RemoveUserAsGlobalAdminDocument = gql`
  mutation removeUserAsGlobalAdmin($input: RemoveGlobalAdminInput!) {
    removeUserAsGlobalAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsGlobalAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsGlobalAdminMutation,
  SchemaTypes.RemoveUserAsGlobalAdminMutationVariables
>;

/**
 * __useRemoveUserAsGlobalAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsGlobalAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsGlobalAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsGlobalAdminMutation, { data, loading, error }] = useRemoveUserAsGlobalAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsGlobalAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsGlobalAdminMutation,
    SchemaTypes.RemoveUserAsGlobalAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsGlobalAdminMutation,
    SchemaTypes.RemoveUserAsGlobalAdminMutationVariables
  >(RemoveUserAsGlobalAdminDocument, options);
}
export type RemoveUserAsGlobalAdminMutationHookResult = ReturnType<typeof useRemoveUserAsGlobalAdminMutation>;
export type RemoveUserAsGlobalAdminMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserAsGlobalAdminMutation>;
export type RemoveUserAsGlobalAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsGlobalAdminMutation,
  SchemaTypes.RemoveUserAsGlobalAdminMutationVariables
>;
export const RemoveUserAsGlobalCommunityAdminDocument = gql`
  mutation removeUserAsGlobalCommunityAdmin($input: RemoveGlobalCommunityAdminInput!) {
    removeUserAsGlobalCommunityAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsGlobalCommunityAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsGlobalCommunityAdminMutation,
  SchemaTypes.RemoveUserAsGlobalCommunityAdminMutationVariables
>;

/**
 * __useRemoveUserAsGlobalCommunityAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsGlobalCommunityAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsGlobalCommunityAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsGlobalCommunityAdminMutation, { data, loading, error }] = useRemoveUserAsGlobalCommunityAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsGlobalCommunityAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsGlobalCommunityAdminMutation,
    SchemaTypes.RemoveUserAsGlobalCommunityAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsGlobalCommunityAdminMutation,
    SchemaTypes.RemoveUserAsGlobalCommunityAdminMutationVariables
  >(RemoveUserAsGlobalCommunityAdminDocument, options);
}
export type RemoveUserAsGlobalCommunityAdminMutationHookResult = ReturnType<
  typeof useRemoveUserAsGlobalCommunityAdminMutation
>;
export type RemoveUserAsGlobalCommunityAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsGlobalCommunityAdminMutation>;
export type RemoveUserAsGlobalCommunityAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsGlobalCommunityAdminMutation,
  SchemaTypes.RemoveUserAsGlobalCommunityAdminMutationVariables
>;
export const RemoveUserAsOrganizationOwnerDocument = gql`
  mutation removeUserAsOrganizationOwner($input: RemoveOrganizationOwnerInput!) {
    removeUserAsOrganizationOwner(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsOrganizationOwnerMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsOrganizationOwnerMutation,
  SchemaTypes.RemoveUserAsOrganizationOwnerMutationVariables
>;

/**
 * __useRemoveUserAsOrganizationOwnerMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsOrganizationOwnerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsOrganizationOwnerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsOrganizationOwnerMutation, { data, loading, error }] = useRemoveUserAsOrganizationOwnerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsOrganizationOwnerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsOrganizationOwnerMutation,
    SchemaTypes.RemoveUserAsOrganizationOwnerMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsOrganizationOwnerMutation,
    SchemaTypes.RemoveUserAsOrganizationOwnerMutationVariables
  >(RemoveUserAsOrganizationOwnerDocument, options);
}
export type RemoveUserAsOrganizationOwnerMutationHookResult = ReturnType<
  typeof useRemoveUserAsOrganizationOwnerMutation
>;
export type RemoveUserAsOrganizationOwnerMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsOrganizationOwnerMutation>;
export type RemoveUserAsOrganizationOwnerMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsOrganizationOwnerMutation,
  SchemaTypes.RemoveUserAsOrganizationOwnerMutationVariables
>;
export const RemoveMessageFromDiscussionDocument = gql`
  mutation removeMessageFromDiscussion($messageData: DiscussionRemoveMessageInput!) {
    removeMessageFromDiscussion(messageData: $messageData)
  }
`;
export type RemoveMessageFromDiscussionMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveMessageFromDiscussionMutation,
  SchemaTypes.RemoveMessageFromDiscussionMutationVariables
>;

/**
 * __useRemoveMessageFromDiscussionMutation__
 *
 * To run a mutation, you first call `useRemoveMessageFromDiscussionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMessageFromDiscussionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMessageFromDiscussionMutation, { data, loading, error }] = useRemoveMessageFromDiscussionMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useRemoveMessageFromDiscussionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveMessageFromDiscussionMutation,
    SchemaTypes.RemoveMessageFromDiscussionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveMessageFromDiscussionMutation,
    SchemaTypes.RemoveMessageFromDiscussionMutationVariables
  >(RemoveMessageFromDiscussionDocument, options);
}
export type RemoveMessageFromDiscussionMutationHookResult = ReturnType<typeof useRemoveMessageFromDiscussionMutation>;
export type RemoveMessageFromDiscussionMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveMessageFromDiscussionMutation>;
export type RemoveMessageFromDiscussionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveMessageFromDiscussionMutation,
  SchemaTypes.RemoveMessageFromDiscussionMutationVariables
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserFromCommunityMutation,
    SchemaTypes.RemoveUserFromCommunityMutationVariables
  >(RemoveUserFromCommunityDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RemoveUserFromGroupMutation, SchemaTypes.RemoveUserFromGroupMutationVariables>(
    RemoveUserFromGroupDocument,
    options
  );
}
export type RemoveUserFromGroupMutationHookResult = ReturnType<typeof useRemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserFromGroupMutation,
  SchemaTypes.RemoveUserFromGroupMutationVariables
>;
export const UpdateActorDocument = gql`
  mutation updateActor($input: UpdateActorInput!) {
    updateActor(actorData: $input) {
      id
      name
      description
      impact
      value
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateActorMutation, SchemaTypes.UpdateActorMutationVariables>(
    UpdateActorDocument,
    options
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
      explanation
      framing
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateAspectMutation, SchemaTypes.UpdateAspectMutationVariables>(
    UpdateAspectDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateChallengeMutation, SchemaTypes.UpdateChallengeMutationVariables>(
    UpdateChallengeDocument,
    options
  );
}
export type UpdateChallengeMutationHookResult = ReturnType<typeof useUpdateChallengeMutation>;
export type UpdateChallengeMutationResult = Apollo.MutationResult<SchemaTypes.UpdateChallengeMutation>;
export type UpdateChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateChallengeMutation,
  SchemaTypes.UpdateChallengeMutationVariables
>;
export const UpdateEcosystemModelDocument = gql`
  mutation updateEcosystemModel($ecosystemModelData: UpdateEcosystemModelInput!) {
    updateEcosystemModel(ecosystemModelData: $ecosystemModelData) {
      id
      canvas {
        value
      }
    }
  }
`;
export type UpdateEcosystemModelMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateEcosystemModelMutation,
  SchemaTypes.UpdateEcosystemModelMutationVariables
>;

/**
 * __useUpdateEcosystemModelMutation__
 *
 * To run a mutation, you first call `useUpdateEcosystemModelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEcosystemModelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEcosystemModelMutation, { data, loading, error }] = useUpdateEcosystemModelMutation({
 *   variables: {
 *      ecosystemModelData: // value for 'ecosystemModelData'
 *   },
 * });
 */
export function useUpdateEcosystemModelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateEcosystemModelMutation,
    SchemaTypes.UpdateEcosystemModelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateEcosystemModelMutation,
    SchemaTypes.UpdateEcosystemModelMutationVariables
  >(UpdateEcosystemModelDocument, options);
}
export type UpdateEcosystemModelMutationHookResult = ReturnType<typeof useUpdateEcosystemModelMutation>;
export type UpdateEcosystemModelMutationResult = Apollo.MutationResult<SchemaTypes.UpdateEcosystemModelMutation>;
export type UpdateEcosystemModelMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateEcosystemModelMutation,
  SchemaTypes.UpdateEcosystemModelMutationVariables
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateEcoverseMutation, SchemaTypes.UpdateEcoverseMutationVariables>(
    UpdateEcoverseDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateGroupMutation, SchemaTypes.UpdateGroupMutationVariables>(
    UpdateGroupDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateOpportunityMutation, SchemaTypes.UpdateOpportunityMutationVariables>(
    UpdateOpportunityDocument,
    options
  );
}
export type UpdateOpportunityMutationHookResult = ReturnType<typeof useUpdateOpportunityMutation>;
export type UpdateOpportunityMutationResult = Apollo.MutationResult<SchemaTypes.UpdateOpportunityMutation>;
export type UpdateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateOpportunityMutation,
  SchemaTypes.UpdateOpportunityMutationVariables
>;
export const UpdateOrganizationDocument = gql`
  mutation updateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(organizationData: $input) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateOrganizationMutation, SchemaTypes.UpdateOrganizationMutationVariables>(
    UpdateOrganizationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateUserMutation, SchemaTypes.UpdateUserMutationVariables>(
    UpdateUserDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UploadAvatarMutation, SchemaTypes.UploadAvatarMutationVariables>(
    UploadAvatarDocument,
    options
  );
}
export type UploadAvatarMutationHookResult = ReturnType<typeof useUploadAvatarMutation>;
export type UploadAvatarMutationResult = Apollo.MutationResult<SchemaTypes.UploadAvatarMutation>;
export type UploadAvatarMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadAvatarMutation,
  SchemaTypes.UploadAvatarMutationVariables
>;
export const AdminEcoversesListDocument = gql`
  query adminEcoversesList {
    ecoverses {
      ...AdminEcoverse
    }
  }
  ${AdminEcoverseFragmentDoc}
`;

/**
 * __useAdminEcoversesListQuery__
 *
 * To run a query within a React component, call `useAdminEcoversesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminEcoversesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminEcoversesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminEcoversesListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AdminEcoversesListQuery,
    SchemaTypes.AdminEcoversesListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminEcoversesListQuery, SchemaTypes.AdminEcoversesListQueryVariables>(
    AdminEcoversesListDocument,
    options
  );
}
export function useAdminEcoversesListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminEcoversesListQuery,
    SchemaTypes.AdminEcoversesListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminEcoversesListQuery, SchemaTypes.AdminEcoversesListQueryVariables>(
    AdminEcoversesListDocument,
    options
  );
}
export type AdminEcoversesListQueryHookResult = ReturnType<typeof useAdminEcoversesListQuery>;
export type AdminEcoversesListLazyQueryHookResult = ReturnType<typeof useAdminEcoversesListLazyQuery>;
export type AdminEcoversesListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminEcoversesListQuery,
  SchemaTypes.AdminEcoversesListQueryVariables
>;
export function refetchAdminEcoversesListQuery(variables?: SchemaTypes.AdminEcoversesListQueryVariables) {
  return { query: AdminEcoversesListDocument, variables: variables };
}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AllOpportunitiesQuery, SchemaTypes.AllOpportunitiesQueryVariables>(
    AllOpportunitiesDocument,
    options
  );
}
export function useAllOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AllOpportunitiesQuery,
    SchemaTypes.AllOpportunitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AllOpportunitiesQuery, SchemaTypes.AllOpportunitiesQueryVariables>(
    AllOpportunitiesDocument,
    options
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
export const ApplicationByEcoverseDocument = gql`
  query applicationByEcoverse($ecoverseId: UUID_NAMEID!, $appId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      application(ID: $appId) {
        id
        createdDate
        updatedDate
        questions {
          id
          name
          value
        }
      }
    }
  }
`;

/**
 * __useApplicationByEcoverseQuery__
 *
 * To run a query within a React component, call `useApplicationByEcoverseQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationByEcoverseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationByEcoverseQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      appId: // value for 'appId'
 *   },
 * });
 */
export function useApplicationByEcoverseQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ApplicationByEcoverseQuery,
    SchemaTypes.ApplicationByEcoverseQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ApplicationByEcoverseQuery, SchemaTypes.ApplicationByEcoverseQueryVariables>(
    ApplicationByEcoverseDocument,
    options
  );
}
export function useApplicationByEcoverseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ApplicationByEcoverseQuery,
    SchemaTypes.ApplicationByEcoverseQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ApplicationByEcoverseQuery, SchemaTypes.ApplicationByEcoverseQueryVariables>(
    ApplicationByEcoverseDocument,
    options
  );
}
export type ApplicationByEcoverseQueryHookResult = ReturnType<typeof useApplicationByEcoverseQuery>;
export type ApplicationByEcoverseLazyQueryHookResult = ReturnType<typeof useApplicationByEcoverseLazyQuery>;
export type ApplicationByEcoverseQueryResult = Apollo.QueryResult<
  SchemaTypes.ApplicationByEcoverseQuery,
  SchemaTypes.ApplicationByEcoverseQueryVariables
>;
export function refetchApplicationByEcoverseQuery(variables?: SchemaTypes.ApplicationByEcoverseQueryVariables) {
  return { query: ApplicationByEcoverseDocument, variables: variables };
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
          id
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeApplicationQuery, SchemaTypes.ChallengeApplicationQueryVariables>(
    ChallengeApplicationDocument,
    options
  );
}
export function useChallengeApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationQuery,
    SchemaTypes.ChallengeApplicationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeApplicationQuery, SchemaTypes.ChallengeApplicationQueryVariables>(
    ChallengeApplicationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeApplicationsQuery, SchemaTypes.ChallengeApplicationsQueryVariables>(
    ChallengeApplicationsDocument,
    options
  );
}
export function useChallengeApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationsQuery,
    SchemaTypes.ChallengeApplicationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeApplicationsQuery, SchemaTypes.ChallengeApplicationsQueryVariables>(
    ChallengeApplicationsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseApplicationQuery, SchemaTypes.EcoverseApplicationQueryVariables>(
    EcoverseApplicationDocument,
    options
  );
}
export function useEcoverseApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationQuery,
    SchemaTypes.EcoverseApplicationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseApplicationQuery, SchemaTypes.EcoverseApplicationQueryVariables>(
    EcoverseApplicationDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseApplicationsQuery, SchemaTypes.EcoverseApplicationsQueryVariables>(
    EcoverseApplicationsDocument,
    options
  );
}
export function useEcoverseApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationsQuery,
    SchemaTypes.EcoverseApplicationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseApplicationsQuery, SchemaTypes.EcoverseApplicationsQueryVariables>(
    EcoverseApplicationsDocument,
    options
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
export const EcoverseNameIdDocument = gql`
  query ecoverseNameId($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
    }
  }
`;

/**
 * __useEcoverseNameIdQuery__
 *
 * To run a query within a React component, call `useEcoverseNameIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseNameIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseNameIdQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseNameIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseNameIdQuery, SchemaTypes.EcoverseNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseNameIdQuery, SchemaTypes.EcoverseNameIdQueryVariables>(
    EcoverseNameIdDocument,
    options
  );
}
export function useEcoverseNameIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseNameIdQuery, SchemaTypes.EcoverseNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseNameIdQuery, SchemaTypes.EcoverseNameIdQueryVariables>(
    EcoverseNameIdDocument,
    options
  );
}
export type EcoverseNameIdQueryHookResult = ReturnType<typeof useEcoverseNameIdQuery>;
export type EcoverseNameIdLazyQueryHookResult = ReturnType<typeof useEcoverseNameIdLazyQuery>;
export type EcoverseNameIdQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseNameIdQuery,
  SchemaTypes.EcoverseNameIdQueryVariables
>;
export function refetchEcoverseNameIdQuery(variables?: SchemaTypes.EcoverseNameIdQueryVariables) {
  return { query: EcoverseNameIdDocument, variables: variables };
}
export const ChallengeNameIdDocument = gql`
  query challengeNameId($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      challenge(ID: $challengeId) {
        id
        nameID
      }
    }
  }
`;

/**
 * __useChallengeNameIdQuery__
 *
 * To run a query within a React component, call `useChallengeNameIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeNameIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeNameIdQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeNameIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeNameIdQuery, SchemaTypes.ChallengeNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeNameIdQuery, SchemaTypes.ChallengeNameIdQueryVariables>(
    ChallengeNameIdDocument,
    options
  );
}
export function useChallengeNameIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeNameIdQuery, SchemaTypes.ChallengeNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeNameIdQuery, SchemaTypes.ChallengeNameIdQueryVariables>(
    ChallengeNameIdDocument,
    options
  );
}
export type ChallengeNameIdQueryHookResult = ReturnType<typeof useChallengeNameIdQuery>;
export type ChallengeNameIdLazyQueryHookResult = ReturnType<typeof useChallengeNameIdLazyQuery>;
export type ChallengeNameIdQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeNameIdQuery,
  SchemaTypes.ChallengeNameIdQueryVariables
>;
export function refetchChallengeNameIdQuery(variables?: SchemaTypes.ChallengeNameIdQueryVariables) {
  return { query: ChallengeNameIdDocument, variables: variables };
}
export const OpportunityNameIdDocument = gql`
  query opportunityNameId($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        id
        nameID
        challenge {
          id
          nameID
        }
      }
    }
  }
`;

/**
 * __useOpportunityNameIdQuery__
 *
 * To run a query within a React component, call `useOpportunityNameIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityNameIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityNameIdQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityNameIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityNameIdQuery, SchemaTypes.OpportunityNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityNameIdQuery, SchemaTypes.OpportunityNameIdQueryVariables>(
    OpportunityNameIdDocument,
    options
  );
}
export function useOpportunityNameIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityNameIdQuery,
    SchemaTypes.OpportunityNameIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityNameIdQuery, SchemaTypes.OpportunityNameIdQueryVariables>(
    OpportunityNameIdDocument,
    options
  );
}
export type OpportunityNameIdQueryHookResult = ReturnType<typeof useOpportunityNameIdQuery>;
export type OpportunityNameIdLazyQueryHookResult = ReturnType<typeof useOpportunityNameIdLazyQuery>;
export type OpportunityNameIdQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityNameIdQuery,
  SchemaTypes.OpportunityNameIdQueryVariables
>;
export function refetchOpportunityNameIdQuery(variables?: SchemaTypes.OpportunityNameIdQueryVariables) {
  return { query: OpportunityNameIdDocument, variables: variables };
}
export const ChallengeCardDocument = gql`
  query challengeCard($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      challenge(ID: $challengeId) {
        ...ChallengeCard
      }
    }
  }
  ${ChallengeCardFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>(
    ChallengeCardDocument,
    options
  );
}
export function useChallengeCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCardQuery, SchemaTypes.ChallengeCardQueryVariables>(
    ChallengeCardDocument,
    options
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
export const ChallengeCardsDocument = gql`
  query challengeCards($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        ...ChallengeCard
      }
    }
  }
  ${ChallengeCardFragmentDoc}
`;

/**
 * __useChallengeCardsQuery__
 *
 * To run a query within a React component, call `useChallengeCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCardsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useChallengeCardsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeCardsQuery, SchemaTypes.ChallengeCardsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCardsQuery, SchemaTypes.ChallengeCardsQueryVariables>(
    ChallengeCardsDocument,
    options
  );
}
export function useChallengeCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeCardsQuery, SchemaTypes.ChallengeCardsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCardsQuery, SchemaTypes.ChallengeCardsQueryVariables>(
    ChallengeCardsDocument,
    options
  );
}
export type ChallengeCardsQueryHookResult = ReturnType<typeof useChallengeCardsQuery>;
export type ChallengeCardsLazyQueryHookResult = ReturnType<typeof useChallengeCardsLazyQuery>;
export type ChallengeCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCardsQuery,
  SchemaTypes.ChallengeCardsQueryVariables
>;
export function refetchChallengeCardsQuery(variables?: SchemaTypes.ChallengeCardsQueryVariables) {
  return { query: ChallengeCardsDocument, variables: variables };
}
export const EcoverseCardDocument = gql`
  query ecoverseCard($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      ...EcoverseDetailsProvider
    }
  }
  ${EcoverseDetailsProviderFragmentDoc}
`;

/**
 * __useEcoverseCardQuery__
 *
 * To run a query within a React component, call `useEcoverseCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCardQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseCardQuery, SchemaTypes.EcoverseCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseCardQuery, SchemaTypes.EcoverseCardQueryVariables>(
    EcoverseCardDocument,
    options
  );
}
export function useEcoverseCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseCardQuery, SchemaTypes.EcoverseCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseCardQuery, SchemaTypes.EcoverseCardQueryVariables>(
    EcoverseCardDocument,
    options
  );
}
export type EcoverseCardQueryHookResult = ReturnType<typeof useEcoverseCardQuery>;
export type EcoverseCardLazyQueryHookResult = ReturnType<typeof useEcoverseCardLazyQuery>;
export type EcoverseCardQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseCardQuery,
  SchemaTypes.EcoverseCardQueryVariables
>;
export function refetchEcoverseCardQuery(variables?: SchemaTypes.EcoverseCardQueryVariables) {
  return { query: EcoverseCardDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>(UserCardDocument, options);
}
export function useUserCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>(UserCardDocument, options);
}
export type UserCardQueryHookResult = ReturnType<typeof useUserCardQuery>;
export type UserCardLazyQueryHookResult = ReturnType<typeof useUserCardLazyQuery>;
export type UserCardQueryResult = Apollo.QueryResult<SchemaTypes.UserCardQuery, SchemaTypes.UserCardQueryVariables>;
export function refetchUserCardQuery(variables?: SchemaTypes.UserCardQueryVariables) {
  return { query: UserCardDocument, variables: variables };
}
export const ChallengeInfoDocument = gql`
  query challengeInfo($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      challenge(ID: $challengeId) {
        ...ChallengeInfo
      }
    }
  }
  ${ChallengeInfoFragmentDoc}
`;

/**
 * __useChallengeInfoQuery__
 *
 * To run a query within a React component, call `useChallengeInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeInfoQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeInfoQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeInfoQuery, SchemaTypes.ChallengeInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeInfoQuery, SchemaTypes.ChallengeInfoQueryVariables>(
    ChallengeInfoDocument,
    options
  );
}
export function useChallengeInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeInfoQuery, SchemaTypes.ChallengeInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeInfoQuery, SchemaTypes.ChallengeInfoQueryVariables>(
    ChallengeInfoDocument,
    options
  );
}
export type ChallengeInfoQueryHookResult = ReturnType<typeof useChallengeInfoQuery>;
export type ChallengeInfoLazyQueryHookResult = ReturnType<typeof useChallengeInfoLazyQuery>;
export type ChallengeInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeInfoQuery,
  SchemaTypes.ChallengeInfoQueryVariables
>;
export function refetchChallengeInfoQuery(variables?: SchemaTypes.ChallengeInfoQueryVariables) {
  return { query: ChallengeInfoDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeActivityQuery, SchemaTypes.ChallengeActivityQueryVariables>(
    ChallengeActivityDocument,
    options
  );
}
export function useChallengeActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeActivityQuery,
    SchemaTypes.ChallengeActivityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeActivityQuery, SchemaTypes.ChallengeActivityQueryVariables>(
    ChallengeActivityDocument,
    options
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
              sortOrder
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >(ChallengeApplicationTemplateDocument, options);
}
export function useChallengeApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeApplicationTemplateQuery,
    SchemaTypes.ChallengeApplicationTemplateQueryVariables
  >(ChallengeApplicationTemplateDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>(
    ChallengeGroupsDocument,
    options
  );
}
export function useChallengeGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeGroupsQuery, SchemaTypes.ChallengeGroupsQueryVariables>(
    ChallengeGroupsDocument,
    options
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
export const ChallengeLeadOrganizationsDocument = gql`
  query challengeLeadOrganizations($ecoverseId: UUID_NAMEID!, $challengeID: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeID) {
        id
        leadOrganizations {
          ...OrganizationDetails
        }
      }
    }
    organizations {
      ...OrganizationDetails
    }
  }
  ${OrganizationDetailsFragmentDoc}
`;

/**
 * __useChallengeLeadOrganizationsQuery__
 *
 * To run a query within a React component, call `useChallengeLeadOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeLeadOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeLeadOrganizationsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useChallengeLeadOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeLeadOrganizationsQuery,
    SchemaTypes.ChallengeLeadOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeLeadOrganizationsQuery,
    SchemaTypes.ChallengeLeadOrganizationsQueryVariables
  >(ChallengeLeadOrganizationsDocument, options);
}
export function useChallengeLeadOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeLeadOrganizationsQuery,
    SchemaTypes.ChallengeLeadOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeLeadOrganizationsQuery,
    SchemaTypes.ChallengeLeadOrganizationsQueryVariables
  >(ChallengeLeadOrganizationsDocument, options);
}
export type ChallengeLeadOrganizationsQueryHookResult = ReturnType<typeof useChallengeLeadOrganizationsQuery>;
export type ChallengeLeadOrganizationsLazyQueryHookResult = ReturnType<typeof useChallengeLeadOrganizationsLazyQuery>;
export type ChallengeLeadOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeLeadOrganizationsQuery,
  SchemaTypes.ChallengeLeadOrganizationsQueryVariables
>;
export function refetchChallengeLeadOrganizationsQuery(
  variables?: SchemaTypes.ChallengeLeadOrganizationsQueryVariables
) {
  return { query: ChallengeLeadOrganizationsDocument, variables: variables };
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
          stateIsFinal
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeLifecycleQuery, SchemaTypes.ChallengeLifecycleQueryVariables>(
    ChallengeLifecycleDocument,
    options
  );
}
export function useChallengeLifecycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeLifecycleQuery,
    SchemaTypes.ChallengeLifecycleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeLifecycleQuery, SchemaTypes.ChallengeLifecycleQueryVariables>(
    ChallengeLifecycleDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeMembersQuery, SchemaTypes.ChallengeMembersQueryVariables>(
    ChallengeMembersDocument,
    options
  );
}
export function useChallengeMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeMembersQuery,
    SchemaTypes.ChallengeMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeMembersQuery, SchemaTypes.ChallengeMembersQueryVariables>(
    ChallengeMembersDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>(
    ChallengeNameDocument,
    options
  );
}
export function useChallengeNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeNameQuery, SchemaTypes.ChallengeNameQueryVariables>(
    ChallengeNameDocument,
    options
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
        ...ChallengeProfile
      }
    }
  }
  ${ChallengeProfileFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeProfileQuery, SchemaTypes.ChallengeProfileQueryVariables>(
    ChallengeProfileDocument,
    options
  );
}
export function useChallengeProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeProfileQuery,
    SchemaTypes.ChallengeProfileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeProfileQuery, SchemaTypes.ChallengeProfileQueryVariables>(
    ChallengeProfileDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeProfileInfoQuery, SchemaTypes.ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    options
  );
}
export function useChallengeProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeProfileInfoQuery,
    SchemaTypes.ChallengeProfileInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeProfileInfoQuery, SchemaTypes.ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeUserIdsQuery, SchemaTypes.ChallengeUserIdsQueryVariables>(
    ChallengeUserIdsDocument,
    options
  );
}
export function useChallengeUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeUserIdsQuery,
    SchemaTypes.ChallengeUserIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeUserIdsQuery, SchemaTypes.ChallengeUserIdsQueryVariables>(
    ChallengeUserIdsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>(
    ChallengesDocument,
    options
  );
}
export function useChallengesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengesQuery, SchemaTypes.ChallengesQueryVariables>(
    ChallengesDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>(
    AllCommunitiesDocument,
    options
  );
}
export function useAllCommunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AllCommunitiesQuery, SchemaTypes.AllCommunitiesQueryVariables>(
    AllCommunitiesDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCommunityQuery, SchemaTypes.ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    options
  );
}
export function useChallengeCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityQuery,
    SchemaTypes.ChallengeCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCommunityQuery, SchemaTypes.ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengesWithCommunityQuery, SchemaTypes.ChallengesWithCommunityQueryVariables>(
    ChallengesWithCommunityDocument,
    options
  );
}
export function useChallengesWithCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengesWithCommunityQuery,
    SchemaTypes.ChallengesWithCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengesWithCommunityQuery,
    SchemaTypes.ChallengesWithCommunityQueryVariables
  >(ChallengesWithCommunityDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseCommunityQuery, SchemaTypes.EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    options
  );
}
export function useEcoverseCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseCommunityQuery,
    SchemaTypes.EcoverseCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseCommunityQuery, SchemaTypes.EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >(ChallengeCommunityMessagesDocument, options);
}
export function useChallengeCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCommunityMessagesQuery,
    SchemaTypes.ChallengeCommunityMessagesQueryVariables
  >(ChallengeCommunityMessagesDocument, options);
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
export const EcoverseCommunityMessagesDocument = gql`
  query ecoverseCommunityMessages($ecoverseId: UUID_NAMEID!) {
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
 * __useEcoverseCommunityMessagesQuery__
 *
 * To run a query within a React component, call `useEcoverseCommunityMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCommunityMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCommunityMessagesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseCommunityMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseCommunityMessagesQuery,
    SchemaTypes.EcoverseCommunityMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.EcoverseCommunityMessagesQuery,
    SchemaTypes.EcoverseCommunityMessagesQueryVariables
  >(EcoverseCommunityMessagesDocument, options);
}
export function useEcoverseCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseCommunityMessagesQuery,
    SchemaTypes.EcoverseCommunityMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.EcoverseCommunityMessagesQuery,
    SchemaTypes.EcoverseCommunityMessagesQueryVariables
  >(EcoverseCommunityMessagesDocument, options);
}
export type EcoverseCommunityMessagesQueryHookResult = ReturnType<typeof useEcoverseCommunityMessagesQuery>;
export type EcoverseCommunityMessagesLazyQueryHookResult = ReturnType<typeof useEcoverseCommunityMessagesLazyQuery>;
export type EcoverseCommunityMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseCommunityMessagesQuery,
  SchemaTypes.EcoverseCommunityMessagesQueryVariables
>;
export function refetchEcoverseCommunityMessagesQuery(variables?: SchemaTypes.EcoverseCommunityMessagesQueryVariables) {
  return { query: EcoverseCommunityMessagesDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >(OpportunityCommunityMessagesDocument, options);
}
export function useOpportunityCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCommunityMessagesQuery,
    SchemaTypes.OpportunityCommunityMessagesQueryVariables
  >(OpportunityCommunityMessagesDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityCommunityQuery, SchemaTypes.OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    options
  );
}
export function useOpportunityCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityQuery,
    SchemaTypes.OpportunityCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityCommunityQuery, SchemaTypes.OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    options
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
export const CommunityGroupsDocument = gql`
  query communityGroups($ecoverseId: UUID_NAMEID!, $communityId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        displayName
        groups {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useCommunityGroupsQuery__
 *
 * To run a query within a React component, call `useCommunityGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityGroupsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityGroupsQuery, SchemaTypes.CommunityGroupsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityGroupsQuery, SchemaTypes.CommunityGroupsQueryVariables>(
    CommunityGroupsDocument,
    options
  );
}
export function useCommunityGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CommunityGroupsQuery, SchemaTypes.CommunityGroupsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityGroupsQuery, SchemaTypes.CommunityGroupsQueryVariables>(
    CommunityGroupsDocument,
    options
  );
}
export type CommunityGroupsQueryHookResult = ReturnType<typeof useCommunityGroupsQuery>;
export type CommunityGroupsLazyQueryHookResult = ReturnType<typeof useCommunityGroupsLazyQuery>;
export type CommunityGroupsQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityGroupsQuery,
  SchemaTypes.CommunityGroupsQueryVariables
>;
export function refetchCommunityGroupsQuery(variables?: SchemaTypes.CommunityGroupsQueryVariables) {
  return { query: CommunityGroupsDocument, variables: variables };
}
export const CommunityMembersDocument = gql`
  query communityMembers($ecoverseId: UUID_NAMEID!, $communityId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        members {
          ...UserDisplayName
        }
      }
    }
  }
  ${UserDisplayNameFragmentDoc}
`;

/**
 * __useCommunityMembersQuery__
 *
 * To run a query within a React component, call `useCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityMembersQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityMembersQuery, SchemaTypes.CommunityMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityMembersQuery, SchemaTypes.CommunityMembersQueryVariables>(
    CommunityMembersDocument,
    options
  );
}
export function useCommunityMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityMembersQuery,
    SchemaTypes.CommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityMembersQuery, SchemaTypes.CommunityMembersQueryVariables>(
    CommunityMembersDocument,
    options
  );
}
export type CommunityMembersQueryHookResult = ReturnType<typeof useCommunityMembersQuery>;
export type CommunityMembersLazyQueryHookResult = ReturnType<typeof useCommunityMembersLazyQuery>;
export type CommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityMembersQuery,
  SchemaTypes.CommunityMembersQueryVariables
>;
export function refetchCommunityMembersQuery(variables?: SchemaTypes.CommunityMembersQueryVariables) {
  return { query: CommunityMembersDocument, variables: variables };
}
export const CommunityPageDocument = gql`
  query communityPage($ecoverseId: UUID_NAMEID!, $communityId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        displayName
        groups {
          id
          name
          profile {
            id
            avatar
            description
            tagsets {
              id
              name
              tags
            }
          }
        }
        members {
          ...CommunityPageMembers
        }
        communication {
          id
          updates {
            id
            messages {
              id
              message
              sender
              timestamp
            }
          }
        }
      }
    }
  }
  ${CommunityPageMembersFragmentDoc}
`;

/**
 * __useCommunityPageQuery__
 *
 * To run a query within a React component, call `useCommunityPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityPageQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityPageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityPageQuery, SchemaTypes.CommunityPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityPageQuery, SchemaTypes.CommunityPageQueryVariables>(
    CommunityPageDocument,
    options
  );
}
export function useCommunityPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CommunityPageQuery, SchemaTypes.CommunityPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityPageQuery, SchemaTypes.CommunityPageQueryVariables>(
    CommunityPageDocument,
    options
  );
}
export type CommunityPageQueryHookResult = ReturnType<typeof useCommunityPageQuery>;
export type CommunityPageLazyQueryHookResult = ReturnType<typeof useCommunityPageLazyQuery>;
export type CommunityPageQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityPageQuery,
  SchemaTypes.CommunityPageQueryVariables
>;
export function refetchCommunityPageQuery(variables?: SchemaTypes.CommunityPageQueryVariables) {
  return { query: CommunityPageDocument, variables: variables };
}
export const ConfigurationDocument = gql`
  query configuration {
    configuration {
      ...Configuration
    }
  }
  ${ConfigurationFragmentDoc}
`;

/**
 * __useConfigurationQuery__
 *
 * To run a query within a React component, call `useConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useConfigurationQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>(
    ConfigurationDocument,
    options
  );
}
export function useConfigurationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>(
    ConfigurationDocument,
    options
  );
}
export type ConfigurationQueryHookResult = ReturnType<typeof useConfigurationQuery>;
export type ConfigurationLazyQueryHookResult = ReturnType<typeof useConfigurationLazyQuery>;
export type ConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.ConfigurationQuery,
  SchemaTypes.ConfigurationQueryVariables
>;
export function refetchConfigurationQuery(variables?: SchemaTypes.ConfigurationQueryVariables) {
  return { query: ConfigurationDocument, variables: variables };
}
export const EcoverseInfoDocument = gql`
  query ecoverseInfo($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      ...EcoverseInfo
    }
  }
  ${EcoverseInfoFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>(
    EcoverseInfoDocument,
    options
  );
}
export function useEcoverseInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseInfoQuery, SchemaTypes.EcoverseInfoQueryVariables>(
    EcoverseInfoDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseActivityQuery, SchemaTypes.EcoverseActivityQueryVariables>(
    EcoverseActivityDocument,
    options
  );
}
export function useEcoverseActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseActivityQuery,
    SchemaTypes.EcoverseActivityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseActivityQuery, SchemaTypes.EcoverseActivityQueryVariables>(
    EcoverseActivityDocument,
    options
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
              sortOrder
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >(EcoverseApplicationTemplateDocument, options);
}
export function useEcoverseApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.EcoverseApplicationTemplateQuery,
    SchemaTypes.EcoverseApplicationTemplateQueryVariables
  >(EcoverseApplicationTemplateDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>(
    EcoverseGroupDocument,
    options
  );
}
export function useEcoverseGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseGroupQuery, SchemaTypes.EcoverseGroupQueryVariables>(
    EcoverseGroupDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseGroupsListQuery, SchemaTypes.EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    options
  );
}
export function useEcoverseGroupsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseGroupsListQuery,
    SchemaTypes.EcoverseGroupsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseGroupsListQuery, SchemaTypes.EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseHostReferencesQuery, SchemaTypes.EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    options
  );
}
export function useEcoverseHostReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseHostReferencesQuery,
    SchemaTypes.EcoverseHostReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseHostReferencesQuery, SchemaTypes.EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    options
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
export const EcoverseMembersDocument = gql`
  query ecoverseMembers($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community {
        id
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
`;

/**
 * __useEcoverseMembersQuery__
 *
 * To run a query within a React component, call `useEcoverseMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseMembersQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseMembersQuery, SchemaTypes.EcoverseMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseMembersQuery, SchemaTypes.EcoverseMembersQueryVariables>(
    EcoverseMembersDocument,
    options
  );
}
export function useEcoverseMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseMembersQuery, SchemaTypes.EcoverseMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseMembersQuery, SchemaTypes.EcoverseMembersQueryVariables>(
    EcoverseMembersDocument,
    options
  );
}
export type EcoverseMembersQueryHookResult = ReturnType<typeof useEcoverseMembersQuery>;
export type EcoverseMembersLazyQueryHookResult = ReturnType<typeof useEcoverseMembersLazyQuery>;
export type EcoverseMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseMembersQuery,
  SchemaTypes.EcoverseMembersQueryVariables
>;
export function refetchEcoverseMembersQuery(variables?: SchemaTypes.EcoverseMembersQueryVariables) {
  return { query: EcoverseMembersDocument, variables: variables };
}
export const EcoverseNameDocument = gql`
  query ecoverseName($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      ...EcoverseName
    }
  }
  ${EcoverseNameFragmentDoc}
`;

/**
 * __useEcoverseNameQuery__
 *
 * To run a query within a React component, call `useEcoverseNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseNameQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseNameQuery, SchemaTypes.EcoverseNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseNameQuery, SchemaTypes.EcoverseNameQueryVariables>(
    EcoverseNameDocument,
    options
  );
}
export function useEcoverseNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseNameQuery, SchemaTypes.EcoverseNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseNameQuery, SchemaTypes.EcoverseNameQueryVariables>(
    EcoverseNameDocument,
    options
  );
}
export type EcoverseNameQueryHookResult = ReturnType<typeof useEcoverseNameQuery>;
export type EcoverseNameLazyQueryHookResult = ReturnType<typeof useEcoverseNameLazyQuery>;
export type EcoverseNameQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseNameQuery,
  SchemaTypes.EcoverseNameQueryVariables
>;
export function refetchEcoverseNameQuery(variables?: SchemaTypes.EcoverseNameQueryVariables) {
  return { query: EcoverseNameDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>(
    EcoverseUserIdsDocument,
    options
  );
}
export function useEcoverseUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseUserIdsQuery, SchemaTypes.EcoverseUserIdsQueryVariables>(
    EcoverseUserIdsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>(
    EcoverseVisualDocument,
    options
  );
}
export function useEcoverseVisualLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseVisualQuery, SchemaTypes.EcoverseVisualQueryVariables>(
    EcoverseVisualDocument,
    options
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
      ...EcoverseDetailsProvider
    }
  }
  ${EcoverseDetailsProviderFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>(EcoversesDocument, options);
}
export function useEcoversesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>(
    EcoversesDocument,
    options
  );
}
export type EcoversesQueryHookResult = ReturnType<typeof useEcoversesQuery>;
export type EcoversesLazyQueryHookResult = ReturnType<typeof useEcoversesLazyQuery>;
export type EcoversesQueryResult = Apollo.QueryResult<SchemaTypes.EcoversesQuery, SchemaTypes.EcoversesQueryVariables>;
export function refetchEcoversesQuery(variables?: SchemaTypes.EcoversesQueryVariables) {
  return { query: EcoversesDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>(
    GlobalActivityDocument,
    options
  );
}
export function useGlobalActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.GlobalActivityQuery, SchemaTypes.GlobalActivityQueryVariables>(
    GlobalActivityDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>(
    GroupMembersDocument,
    options
  );
}
export function useGroupMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.GroupMembersQuery, SchemaTypes.GroupMembersQueryVariables>(
    GroupMembersDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MeQuery, SchemaTypes.MeQueryVariables>(MeDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>(
    MeHasProfileDocument,
    options
  );
}
export function useMeHasProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MeHasProfileQuery, SchemaTypes.MeHasProfileQueryVariables>(
    MeHasProfileDocument,
    options
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
export const MembershipOrganizationDocument = gql`
  query membershipOrganization($input: MembershipOrganizationInput!) {
    membershipOrganization(membershipData: $input) {
      id
      ecoversesHosting {
        id
        nameID
        displayName
      }
      challengesLeading {
        id
        nameID
        displayName
        ecoverseID
      }
    }
  }
`;

/**
 * __useMembershipOrganizationQuery__
 *
 * To run a query within a React component, call `useMembershipOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipOrganizationQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMembershipOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MembershipOrganizationQuery,
    SchemaTypes.MembershipOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MembershipOrganizationQuery, SchemaTypes.MembershipOrganizationQueryVariables>(
    MembershipOrganizationDocument,
    options
  );
}
export function useMembershipOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MembershipOrganizationQuery,
    SchemaTypes.MembershipOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MembershipOrganizationQuery, SchemaTypes.MembershipOrganizationQueryVariables>(
    MembershipOrganizationDocument,
    options
  );
}
export type MembershipOrganizationQueryHookResult = ReturnType<typeof useMembershipOrganizationQuery>;
export type MembershipOrganizationLazyQueryHookResult = ReturnType<typeof useMembershipOrganizationLazyQuery>;
export type MembershipOrganizationQueryResult = Apollo.QueryResult<
  SchemaTypes.MembershipOrganizationQuery,
  SchemaTypes.MembershipOrganizationQueryVariables
>;
export function refetchMembershipOrganizationQuery(variables?: SchemaTypes.MembershipOrganizationQueryVariables) {
  return { query: MembershipOrganizationDocument, variables: variables };
}
export const MembershipUserDocument = gql`
  query membershipUser($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      id
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>(
    MembershipUserDocument,
    options
  );
}
export function useMembershipUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MembershipUserQuery, SchemaTypes.MembershipUserQueryVariables>(
    MembershipUserDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>(
    OpportunitiesDocument,
    options
  );
}
export function useOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunitiesQuery, SchemaTypes.OpportunitiesQueryVariables>(
    OpportunitiesDocument,
    options
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
export const OpportunityInfoDocument = gql`
  query opportunityInfo($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        ...OpportunityInfo
      }
    }
  }
  ${OpportunityInfoFragmentDoc}
`;

/**
 * __useOpportunityInfoQuery__
 *
 * To run a query within a React component, call `useOpportunityInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityInfoQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityInfoQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityInfoQuery, SchemaTypes.OpportunityInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityInfoQuery, SchemaTypes.OpportunityInfoQueryVariables>(
    OpportunityInfoDocument,
    options
  );
}
export function useOpportunityInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunityInfoQuery, SchemaTypes.OpportunityInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityInfoQuery, SchemaTypes.OpportunityInfoQueryVariables>(
    OpportunityInfoDocument,
    options
  );
}
export type OpportunityInfoQueryHookResult = ReturnType<typeof useOpportunityInfoQuery>;
export type OpportunityInfoLazyQueryHookResult = ReturnType<typeof useOpportunityInfoLazyQuery>;
export type OpportunityInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityInfoQuery,
  SchemaTypes.OpportunityInfoQueryVariables
>;
export function refetchOpportunityInfoQuery(variables?: SchemaTypes.OpportunityInfoQueryVariables) {
  return { query: OpportunityInfoDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityActivityQuery, SchemaTypes.OpportunityActivityQueryVariables>(
    OpportunityActivityDocument,
    options
  );
}
export function useOpportunityActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityActivityQuery,
    SchemaTypes.OpportunityActivityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityActivityQuery, SchemaTypes.OpportunityActivityQueryVariables>(
    OpportunityActivityDocument,
    options
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
        id
        context {
          id
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityActorGroupsQuery, SchemaTypes.OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    options
  );
}
export function useOpportunityActorGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityActorGroupsQuery,
    SchemaTypes.OpportunityActorGroupsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityActorGroupsQuery, SchemaTypes.OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    options
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
        id
        context {
          id
          aspects {
            id
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityAspectsQuery, SchemaTypes.OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    options
  );
}
export function useOpportunityAspectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectsQuery,
    SchemaTypes.OpportunityAspectsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityAspectsQuery, SchemaTypes.OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    options
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
export const OpportunityEcosystemDetailsDocument = gql`
  query opportunityEcosystemDetails($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
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
            canvas {
              id
              name
              value
            }
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityEcosystemDetailsQuery__
 *
 * To run a query within a React component, call `useOpportunityEcosystemDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityEcosystemDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityEcosystemDetailsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityEcosystemDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityEcosystemDetailsQuery,
    SchemaTypes.OpportunityEcosystemDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityEcosystemDetailsQuery,
    SchemaTypes.OpportunityEcosystemDetailsQueryVariables
  >(OpportunityEcosystemDetailsDocument, options);
}
export function useOpportunityEcosystemDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityEcosystemDetailsQuery,
    SchemaTypes.OpportunityEcosystemDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityEcosystemDetailsQuery,
    SchemaTypes.OpportunityEcosystemDetailsQueryVariables
  >(OpportunityEcosystemDetailsDocument, options);
}
export type OpportunityEcosystemDetailsQueryHookResult = ReturnType<typeof useOpportunityEcosystemDetailsQuery>;
export type OpportunityEcosystemDetailsLazyQueryHookResult = ReturnType<typeof useOpportunityEcosystemDetailsLazyQuery>;
export type OpportunityEcosystemDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityEcosystemDetailsQuery,
  SchemaTypes.OpportunityEcosystemDetailsQueryVariables
>;
export function refetchOpportunityEcosystemDetailsQuery(
  variables?: SchemaTypes.OpportunityEcosystemDetailsQueryVariables
) {
  return { query: OpportunityEcosystemDetailsDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityGroupsQuery, SchemaTypes.OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    options
  );
}
export function useOpportunityGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityGroupsQuery,
    SchemaTypes.OpportunityGroupsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityGroupsQuery, SchemaTypes.OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    options
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
          stateIsFinal
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityLifecycleQuery, SchemaTypes.OpportunityLifecycleQueryVariables>(
    OpportunityLifecycleDocument,
    options
  );
}
export function useOpportunityLifecycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityLifecycleQuery,
    SchemaTypes.OpportunityLifecycleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityLifecycleQuery, SchemaTypes.OpportunityLifecycleQueryVariables>(
    OpportunityLifecycleDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>(
    OpportunityNameDocument,
    options
  );
}
export function useOpportunityNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityNameQuery, SchemaTypes.OpportunityNameQueryVariables>(
    OpportunityNameDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityProfileInfoQuery, SchemaTypes.OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    options
  );
}
export function useOpportunityProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityProfileInfoQuery,
    SchemaTypes.OpportunityProfileInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityProfileInfoQuery, SchemaTypes.OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityRelationsQuery, SchemaTypes.OpportunityRelationsQueryVariables>(
    OpportunityRelationsDocument,
    options
  );
}
export function useOpportunityRelationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityRelationsQuery,
    SchemaTypes.OpportunityRelationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityRelationsQuery, SchemaTypes.OpportunityRelationsQueryVariables>(
    OpportunityRelationsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityUserIdsQuery, SchemaTypes.OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    options
  );
}
export function useOpportunityUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityUserIdsQuery,
    SchemaTypes.OpportunityUserIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityUserIdsQuery, SchemaTypes.OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityWithActivityQuery, SchemaTypes.OpportunityWithActivityQueryVariables>(
    OpportunityWithActivityDocument,
    options
  );
}
export function useOpportunityWithActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityWithActivityQuery,
    SchemaTypes.OpportunityWithActivityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityWithActivityQuery,
    SchemaTypes.OpportunityWithActivityQueryVariables
  >(OpportunityWithActivityDocument, options);
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
export const OrganizationGroupDocument = gql`
  query organizationGroup($organizationId: UUID_NAMEID!, $groupId: UUID!) {
    organization(ID: $organizationId) {
      id
      members {
        ...GroupMembers
      }
      group(ID: $groupId) {
        ...GroupInfo
      }
    }
  }
  ${GroupMembersFragmentDoc}
  ${GroupInfoFragmentDoc}
`;

/**
 * __useOrganizationGroupQuery__
 *
 * To run a query within a React component, call `useOrganizationGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationGroupQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useOrganizationGroupQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganizationGroupQuery, SchemaTypes.OrganizationGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationGroupQuery, SchemaTypes.OrganizationGroupQueryVariables>(
    OrganizationGroupDocument,
    options
  );
}
export function useOrganizationGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationGroupQuery,
    SchemaTypes.OrganizationGroupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationGroupQuery, SchemaTypes.OrganizationGroupQueryVariables>(
    OrganizationGroupDocument,
    options
  );
}
export type OrganizationGroupQueryHookResult = ReturnType<typeof useOrganizationGroupQuery>;
export type OrganizationGroupLazyQueryHookResult = ReturnType<typeof useOrganizationGroupLazyQuery>;
export type OrganizationGroupQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationGroupQuery,
  SchemaTypes.OrganizationGroupQueryVariables
>;
export function refetchOrganizationGroupQuery(variables?: SchemaTypes.OrganizationGroupQueryVariables) {
  return { query: OrganizationGroupDocument, variables: variables };
}
export const OrganizationInfoDocument = gql`
  query organizationInfo($organizationId: UUID_NAMEID!) {
    organization(ID: $organizationId) {
      ...OrganizationInfo
    }
  }
  ${OrganizationInfoFragmentDoc}
`;

/**
 * __useOrganizationInfoQuery__
 *
 * To run a query within a React component, call `useOrganizationInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationInfoQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useOrganizationInfoQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables>(
    OrganizationInfoDocument,
    options
  );
}
export function useOrganizationInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationInfoQuery,
    SchemaTypes.OrganizationInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables>(
    OrganizationInfoDocument,
    options
  );
}
export type OrganizationInfoQueryHookResult = ReturnType<typeof useOrganizationInfoQuery>;
export type OrganizationInfoLazyQueryHookResult = ReturnType<typeof useOrganizationInfoLazyQuery>;
export type OrganizationInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationInfoQuery,
  SchemaTypes.OrganizationInfoQueryVariables
>;
export function refetchOrganizationInfoQuery(variables?: SchemaTypes.OrganizationInfoQueryVariables) {
  return { query: OrganizationInfoDocument, variables: variables };
}
export const OrganizationDetailsDocument = gql`
  query organizationDetails($id: UUID_NAMEID!) {
    organization(ID: $id) {
      id
      displayName
      nameID
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationDetailsQuery, SchemaTypes.OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    options
  );
}
export function useOrganizationDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationDetailsQuery,
    SchemaTypes.OrganizationDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationDetailsQuery, SchemaTypes.OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    options
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
    organization(ID: $id) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationGroupsQuery, SchemaTypes.OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    options
  );
}
export function useOrganizationGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationGroupsQuery,
    SchemaTypes.OrganizationGroupsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationGroupsQuery, SchemaTypes.OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    options
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
    organization(ID: $id) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationNameQuery, SchemaTypes.OrganizationNameQueryVariables>(
    OrganizationNameDocument,
    options
  );
}
export function useOrganizationNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationNameQuery,
    SchemaTypes.OrganizationNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationNameQuery, SchemaTypes.OrganizationNameQueryVariables>(
    OrganizationNameDocument,
    options
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
    organization(ID: $id) {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationProfileInfoQuery, SchemaTypes.OrganizationProfileInfoQueryVariables>(
    OrganizationProfileInfoDocument,
    options
  );
}
export function useOrganizationProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >(OrganizationProfileInfoDocument, options);
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
    organizations {
      id
      nameID
      displayName
      profile {
        id
        avatar
      }
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationsListQuery, SchemaTypes.OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    options
  );
}
export function useOrganizationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationsListQuery,
    SchemaTypes.OrganizationsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationsListQuery, SchemaTypes.OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>(
    ProjectProfileDocument,
    options
  );
}
export function useProjectProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ProjectProfileQuery, SchemaTypes.ProjectProfileQueryVariables>(
    ProjectProfileDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>(ProjectsDocument, options);
}
export function useProjectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ProjectsQuery, SchemaTypes.ProjectsQueryVariables>(ProjectsDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ProjectsChainHistoryQuery, SchemaTypes.ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    options
  );
}
export function useProjectsChainHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ProjectsChainHistoryQuery,
    SchemaTypes.ProjectsChainHistoryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ProjectsChainHistoryQuery, SchemaTypes.ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>(RelationsDocument, options);
}
export function useRelationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RelationsQuery, SchemaTypes.RelationsQueryVariables>(
    RelationsDocument,
    options
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
        ...UserSearchResult
        ...OrganizationSearchResult
        ...ChallengeSearchResult
        ...OpportunitySearchResult
      }
    }
  }
  ${UserSearchResultFragmentDoc}
  ${OrganizationSearchResultFragmentDoc}
  ${ChallengeSearchResultFragmentDoc}
  ${OpportunitySearchResultFragmentDoc}
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>(SearchDocument, options);
}
export function useSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>(SearchDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>(
    ServerMetadataDocument,
    options
  );
}
export function useServerMetadataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ServerMetadataQuery, SchemaTypes.ServerMetadataQueryVariables>(
    ServerMetadataDocument,
    options
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
        organizations {
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>(
    TagsetsTemplateDocument,
    options
  );
}
export function useTagsetsTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.TagsetsTemplateQuery, SchemaTypes.TagsetsTemplateQueryVariables>(
    TagsetsTemplateDocument,
    options
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
export const UserApplicationDetailsDocument = gql`
  query userApplicationDetails($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      applications {
        id
        state
        displayName
        ecoverseID
        challengeID
        opportunityID
      }
    }
  }
`;

/**
 * __useUserApplicationDetailsQuery__
 *
 * To run a query within a React component, call `useUserApplicationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserApplicationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserApplicationDetailsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserApplicationDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserApplicationDetailsQuery,
    SchemaTypes.UserApplicationDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserApplicationDetailsQuery, SchemaTypes.UserApplicationDetailsQueryVariables>(
    UserApplicationDetailsDocument,
    options
  );
}
export function useUserApplicationDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserApplicationDetailsQuery,
    SchemaTypes.UserApplicationDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserApplicationDetailsQuery, SchemaTypes.UserApplicationDetailsQueryVariables>(
    UserApplicationDetailsDocument,
    options
  );
}
export type UserApplicationDetailsQueryHookResult = ReturnType<typeof useUserApplicationDetailsQuery>;
export type UserApplicationDetailsLazyQueryHookResult = ReturnType<typeof useUserApplicationDetailsLazyQuery>;
export type UserApplicationDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserApplicationDetailsQuery,
  SchemaTypes.UserApplicationDetailsQueryVariables
>;
export function refetchUserApplicationDetailsQuery(variables?: SchemaTypes.UserApplicationDetailsQueryVariables) {
  return { query: UserApplicationDetailsDocument, variables: variables };
}
export const UserProfileApplicationsDocument = gql`
  query userProfileApplications($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      applications {
        id
        state
        displayName
        ecoverseID
        challengeID
        opportunityID
      }
    }
  }
`;

/**
 * __useUserProfileApplicationsQuery__
 *
 * To run a query within a React component, call `useUserProfileApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileApplicationsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserProfileApplicationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserProfileApplicationsQuery,
    SchemaTypes.UserProfileApplicationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserProfileApplicationsQuery, SchemaTypes.UserProfileApplicationsQueryVariables>(
    UserProfileApplicationsDocument,
    options
  );
}
export function useUserProfileApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserProfileApplicationsQuery,
    SchemaTypes.UserProfileApplicationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.UserProfileApplicationsQuery,
    SchemaTypes.UserProfileApplicationsQueryVariables
  >(UserProfileApplicationsDocument, options);
}
export type UserProfileApplicationsQueryHookResult = ReturnType<typeof useUserProfileApplicationsQuery>;
export type UserProfileApplicationsLazyQueryHookResult = ReturnType<typeof useUserProfileApplicationsLazyQuery>;
export type UserProfileApplicationsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserProfileApplicationsQuery,
  SchemaTypes.UserProfileApplicationsQueryVariables
>;
export function refetchUserProfileApplicationsQuery(variables?: SchemaTypes.UserProfileApplicationsQueryVariables) {
  return { query: UserProfileApplicationsDocument, variables: variables };
}
export const UserNotificationsPreferencesDocument = gql`
  query userNotificationsPreferences($userId: UUID_NAMEID_EMAIL!) {
    user(ID: $userId) {
      id
      preferences {
        id
        definition {
          id
          description
          displayName
          group
          type
          valueType
        }
        value
      }
    }
  }
`;

/**
 * __useUserNotificationsPreferencesQuery__
 *
 * To run a query within a React component, call `useUserNotificationsPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserNotificationsPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserNotificationsPreferencesQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserNotificationsPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserNotificationsPreferencesQuery,
    SchemaTypes.UserNotificationsPreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.UserNotificationsPreferencesQuery,
    SchemaTypes.UserNotificationsPreferencesQueryVariables
  >(UserNotificationsPreferencesDocument, options);
}
export function useUserNotificationsPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserNotificationsPreferencesQuery,
    SchemaTypes.UserNotificationsPreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.UserNotificationsPreferencesQuery,
    SchemaTypes.UserNotificationsPreferencesQueryVariables
  >(UserNotificationsPreferencesDocument, options);
}
export type UserNotificationsPreferencesQueryHookResult = ReturnType<typeof useUserNotificationsPreferencesQuery>;
export type UserNotificationsPreferencesLazyQueryHookResult = ReturnType<
  typeof useUserNotificationsPreferencesLazyQuery
>;
export type UserNotificationsPreferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.UserNotificationsPreferencesQuery,
  SchemaTypes.UserNotificationsPreferencesQueryVariables
>;
export function refetchUserNotificationsPreferencesQuery(
  variables?: SchemaTypes.UserNotificationsPreferencesQueryVariables
) {
  return { query: UserNotificationsPreferencesDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>(UserDocument, options);
}
export function useUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>(UserDocument, options);
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
        displayName
        createdDate
        ecoverseID
        challengeID
        opportunityID
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserApplicationsQuery, SchemaTypes.UserApplicationsQueryVariables>(
    UserApplicationsDocument,
    options
  );
}
export function useUserApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserApplicationsQuery,
    SchemaTypes.UserApplicationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserApplicationsQuery, SchemaTypes.UserApplicationsQueryVariables>(
    UserApplicationsDocument,
    options
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
      nameID
      displayName
      city
      country
      profile {
        id
        avatar
        tagsets {
          id
          name
          tags
        }
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>(
    UserAvatarsDocument,
    options
  );
}
export function useUserAvatarsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserAvatarsQuery, SchemaTypes.UserAvatarsQueryVariables>(
    UserAvatarsDocument,
    options
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
export const UserProfileDocument = gql`
  query userProfile($input: UUID_NAMEID_EMAIL!) {
    user(ID: $input) {
      ...UserDetails
      ...UserAgent
    }
    membershipUser(membershipData: { userID: $input }) {
      id
      ...UserMembershipDetails
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
  ${UserMembershipDetailsFragmentDoc}
`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserProfileQuery, SchemaTypes.UserProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserProfileQuery, SchemaTypes.UserProfileQueryVariables>(
    UserProfileDocument,
    options
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserProfileQuery, SchemaTypes.UserProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserProfileQuery, SchemaTypes.UserProfileQueryVariables>(
    UserProfileDocument,
    options
  );
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<typeof useUserProfileLazyQuery>;
export type UserProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.UserProfileQuery,
  SchemaTypes.UserProfileQueryVariables
>;
export function refetchUserProfileQuery(variables?: SchemaTypes.UserProfileQueryVariables) {
  return { query: UserProfileDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>(UsersDocument, options);
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>(UsersDocument, options);
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<SchemaTypes.UsersQuery, SchemaTypes.UsersQueryVariables>;
export function refetchUsersQuery(variables?: SchemaTypes.UsersQueryVariables) {
  return { query: UsersDocument, variables: variables };
}
export const UsersDisplayNameDocument = gql`
  query usersDisplayName {
    users {
      ...UserDisplayName
    }
  }
  ${UserDisplayNameFragmentDoc}
`;

/**
 * __useUsersDisplayNameQuery__
 *
 * To run a query within a React component, call `useUsersDisplayNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersDisplayNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersDisplayNameQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersDisplayNameQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.UsersDisplayNameQuery, SchemaTypes.UsersDisplayNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UsersDisplayNameQuery, SchemaTypes.UsersDisplayNameQueryVariables>(
    UsersDisplayNameDocument,
    options
  );
}
export function useUsersDisplayNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UsersDisplayNameQuery,
    SchemaTypes.UsersDisplayNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UsersDisplayNameQuery, SchemaTypes.UsersDisplayNameQueryVariables>(
    UsersDisplayNameDocument,
    options
  );
}
export type UsersDisplayNameQueryHookResult = ReturnType<typeof useUsersDisplayNameQuery>;
export type UsersDisplayNameLazyQueryHookResult = ReturnType<typeof useUsersDisplayNameLazyQuery>;
export type UsersDisplayNameQueryResult = Apollo.QueryResult<
  SchemaTypes.UsersDisplayNameQuery,
  SchemaTypes.UsersDisplayNameQueryVariables
>;
export function refetchUsersDisplayNameQuery(variables?: SchemaTypes.UsersDisplayNameQueryVariables) {
  return { query: UsersDisplayNameDocument, variables: variables };
}
export const UsersWithCredentialsDocument = gql`
  query usersWithCredentials($input: UsersWithAuthorizationCredentialInput!) {
    usersWithAuthorizationCredential(credentialsCriteriaData: $input) {
      id
      displayName
      firstName
      lastName
      email
      profile {
        id
        avatar
      }
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UsersWithCredentialsQuery, SchemaTypes.UsersWithCredentialsQueryVariables>(
    UsersWithCredentialsDocument,
    options
  );
}
export function useUsersWithCredentialsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UsersWithCredentialsQuery,
    SchemaTypes.UsersWithCredentialsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UsersWithCredentialsQuery, SchemaTypes.UsersWithCredentialsQueryVariables>(
    UsersWithCredentialsDocument,
    options
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
export const UsersWithCredentialsSimpleListDocument = gql`
  query usersWithCredentialsSimpleList($input: UsersWithAuthorizationCredentialInput!) {
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
 * __useUsersWithCredentialsSimpleListQuery__
 *
 * To run a query within a React component, call `useUsersWithCredentialsSimpleListQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersWithCredentialsSimpleListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersWithCredentialsSimpleListQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUsersWithCredentialsSimpleListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UsersWithCredentialsSimpleListQuery,
    SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.UsersWithCredentialsSimpleListQuery,
    SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
  >(UsersWithCredentialsSimpleListDocument, options);
}
export function useUsersWithCredentialsSimpleListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UsersWithCredentialsSimpleListQuery,
    SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.UsersWithCredentialsSimpleListQuery,
    SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
  >(UsersWithCredentialsSimpleListDocument, options);
}
export type UsersWithCredentialsSimpleListQueryHookResult = ReturnType<typeof useUsersWithCredentialsSimpleListQuery>;
export type UsersWithCredentialsSimpleListLazyQueryHookResult = ReturnType<
  typeof useUsersWithCredentialsSimpleListLazyQuery
>;
export type UsersWithCredentialsSimpleListQueryResult = Apollo.QueryResult<
  SchemaTypes.UsersWithCredentialsSimpleListQuery,
  SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
>;
export function refetchUsersWithCredentialsSimpleListQuery(
  variables?: SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
) {
  return { query: UsersWithCredentialsSimpleListDocument, variables: variables };
}
export const EcoverseContributionDetailsDocument = gql`
  query ecoverseContributionDetails($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      displayName
      tagset {
        id
        name
        tags
      }
      context {
        id
        visual {
          id
          avatar
          background
          banner
        }
      }
    }
  }
`;

/**
 * __useEcoverseContributionDetailsQuery__
 *
 * To run a query within a React component, call `useEcoverseContributionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseContributionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseContributionDetailsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseContributionDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseContributionDetailsQuery,
    SchemaTypes.EcoverseContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.EcoverseContributionDetailsQuery,
    SchemaTypes.EcoverseContributionDetailsQueryVariables
  >(EcoverseContributionDetailsDocument, options);
}
export function useEcoverseContributionDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseContributionDetailsQuery,
    SchemaTypes.EcoverseContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.EcoverseContributionDetailsQuery,
    SchemaTypes.EcoverseContributionDetailsQueryVariables
  >(EcoverseContributionDetailsDocument, options);
}
export type EcoverseContributionDetailsQueryHookResult = ReturnType<typeof useEcoverseContributionDetailsQuery>;
export type EcoverseContributionDetailsLazyQueryHookResult = ReturnType<typeof useEcoverseContributionDetailsLazyQuery>;
export type EcoverseContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseContributionDetailsQuery,
  SchemaTypes.EcoverseContributionDetailsQueryVariables
>;
export function refetchEcoverseContributionDetailsQuery(
  variables?: SchemaTypes.EcoverseContributionDetailsQueryVariables
) {
  return { query: EcoverseContributionDetailsDocument, variables: variables };
}
export const ChallengeContributionDetailsDocument = gql`
  query challengeContributionDetails($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      challenge(ID: $challengeId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        context {
          id
          visual {
            id
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
 * __useChallengeContributionDetailsQuery__
 *
 * To run a query within a React component, call `useChallengeContributionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeContributionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeContributionDetailsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeContributionDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeContributionDetailsQuery,
    SchemaTypes.ChallengeContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeContributionDetailsQuery,
    SchemaTypes.ChallengeContributionDetailsQueryVariables
  >(ChallengeContributionDetailsDocument, options);
}
export function useChallengeContributionDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeContributionDetailsQuery,
    SchemaTypes.ChallengeContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeContributionDetailsQuery,
    SchemaTypes.ChallengeContributionDetailsQueryVariables
  >(ChallengeContributionDetailsDocument, options);
}
export type ChallengeContributionDetailsQueryHookResult = ReturnType<typeof useChallengeContributionDetailsQuery>;
export type ChallengeContributionDetailsLazyQueryHookResult = ReturnType<
  typeof useChallengeContributionDetailsLazyQuery
>;
export type ChallengeContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeContributionDetailsQuery,
  SchemaTypes.ChallengeContributionDetailsQueryVariables
>;
export function refetchChallengeContributionDetailsQuery(
  variables?: SchemaTypes.ChallengeContributionDetailsQueryVariables
) {
  return { query: ChallengeContributionDetailsDocument, variables: variables };
}
export const OpportunityContributionDetailsDocument = gql`
  query opportunityContributionDetails($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        id
        nameID
        displayName
        parentId
        parentNameID
        tagset {
          id
          name
          tags
        }
        context {
          id
          visual {
            id
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
 * __useOpportunityContributionDetailsQuery__
 *
 * To run a query within a React component, call `useOpportunityContributionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityContributionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityContributionDetailsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityContributionDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityContributionDetailsQuery,
    SchemaTypes.OpportunityContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityContributionDetailsQuery,
    SchemaTypes.OpportunityContributionDetailsQueryVariables
  >(OpportunityContributionDetailsDocument, options);
}
export function useOpportunityContributionDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityContributionDetailsQuery,
    SchemaTypes.OpportunityContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityContributionDetailsQuery,
    SchemaTypes.OpportunityContributionDetailsQueryVariables
  >(OpportunityContributionDetailsDocument, options);
}
export type OpportunityContributionDetailsQueryHookResult = ReturnType<typeof useOpportunityContributionDetailsQuery>;
export type OpportunityContributionDetailsLazyQueryHookResult = ReturnType<
  typeof useOpportunityContributionDetailsLazyQuery
>;
export type OpportunityContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityContributionDetailsQuery,
  SchemaTypes.OpportunityContributionDetailsQueryVariables
>;
export function refetchOpportunityContributionDetailsQuery(
  variables?: SchemaTypes.OpportunityContributionDetailsQueryVariables
) {
  return { query: OpportunityContributionDetailsDocument, variables: variables };
}
export const EcoverseCanvasesDocument = gql`
  query ecoverseCanvases($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      context {
        id
        canvases {
          ...CanvasDetails
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
`;

/**
 * __useEcoverseCanvasesQuery__
 *
 * To run a query within a React component, call `useEcoverseCanvasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCanvasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCanvasesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoverseCanvasesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoverseCanvasesQuery, SchemaTypes.EcoverseCanvasesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseCanvasesQuery, SchemaTypes.EcoverseCanvasesQueryVariables>(
    EcoverseCanvasesDocument,
    options
  );
}
export function useEcoverseCanvasesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseCanvasesQuery,
    SchemaTypes.EcoverseCanvasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseCanvasesQuery, SchemaTypes.EcoverseCanvasesQueryVariables>(
    EcoverseCanvasesDocument,
    options
  );
}
export type EcoverseCanvasesQueryHookResult = ReturnType<typeof useEcoverseCanvasesQuery>;
export type EcoverseCanvasesLazyQueryHookResult = ReturnType<typeof useEcoverseCanvasesLazyQuery>;
export type EcoverseCanvasesQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseCanvasesQuery,
  SchemaTypes.EcoverseCanvasesQueryVariables
>;
export function refetchEcoverseCanvasesQuery(variables?: SchemaTypes.EcoverseCanvasesQueryVariables) {
  return { query: EcoverseCanvasesDocument, variables: variables };
}
export const EcoverseCanvasValuesDocument = gql`
  query ecoverseCanvasValues($ecoverseId: UUID_NAMEID!, $canvasId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      context {
        id
        canvases(IDs: [$canvasId]) {
          ...CanvasDetails
          ...CanvasValue
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
  ${CanvasValueFragmentDoc}
`;

/**
 * __useEcoverseCanvasValuesQuery__
 *
 * To run a query within a React component, call `useEcoverseCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCanvasValuesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useEcoverseCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoverseCanvasValuesQuery,
    SchemaTypes.EcoverseCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoverseCanvasValuesQuery, SchemaTypes.EcoverseCanvasValuesQueryVariables>(
    EcoverseCanvasValuesDocument,
    options
  );
}
export function useEcoverseCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoverseCanvasValuesQuery,
    SchemaTypes.EcoverseCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoverseCanvasValuesQuery, SchemaTypes.EcoverseCanvasValuesQueryVariables>(
    EcoverseCanvasValuesDocument,
    options
  );
}
export type EcoverseCanvasValuesQueryHookResult = ReturnType<typeof useEcoverseCanvasValuesQuery>;
export type EcoverseCanvasValuesLazyQueryHookResult = ReturnType<typeof useEcoverseCanvasValuesLazyQuery>;
export type EcoverseCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoverseCanvasValuesQuery,
  SchemaTypes.EcoverseCanvasValuesQueryVariables
>;
export function refetchEcoverseCanvasValuesQuery(variables?: SchemaTypes.EcoverseCanvasValuesQueryVariables) {
  return { query: EcoverseCanvasValuesDocument, variables: variables };
}
export const ChallengeCanvasesDocument = gql`
  query challengeCanvases($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        context {
          id
          canvases {
            ...CanvasDetails
          }
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
`;

/**
 * __useChallengeCanvasesQuery__
 *
 * To run a query within a React component, call `useChallengeCanvasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCanvasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCanvasesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCanvasesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeCanvasesQuery, SchemaTypes.ChallengeCanvasesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCanvasesQuery, SchemaTypes.ChallengeCanvasesQueryVariables>(
    ChallengeCanvasesDocument,
    options
  );
}
export function useChallengeCanvasesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCanvasesQuery,
    SchemaTypes.ChallengeCanvasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCanvasesQuery, SchemaTypes.ChallengeCanvasesQueryVariables>(
    ChallengeCanvasesDocument,
    options
  );
}
export type ChallengeCanvasesQueryHookResult = ReturnType<typeof useChallengeCanvasesQuery>;
export type ChallengeCanvasesLazyQueryHookResult = ReturnType<typeof useChallengeCanvasesLazyQuery>;
export type ChallengeCanvasesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCanvasesQuery,
  SchemaTypes.ChallengeCanvasesQueryVariables
>;
export function refetchChallengeCanvasesQuery(variables?: SchemaTypes.ChallengeCanvasesQueryVariables) {
  return { query: ChallengeCanvasesDocument, variables: variables };
}
export const ChallengeCanvasValuesDocument = gql`
  query challengeCanvasValues($ecoverseId: UUID_NAMEID!, $challengeId: UUID_NAMEID!, $canvasId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenge(ID: $challengeId) {
        id
        context {
          id
          canvases(IDs: [$canvasId]) {
            ...CanvasDetails
            ...CanvasValue
          }
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
  ${CanvasValueFragmentDoc}
`;

/**
 * __useChallengeCanvasValuesQuery__
 *
 * To run a query within a React component, call `useChallengeCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCanvasValuesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      challengeId: // value for 'challengeId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useChallengeCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCanvasValuesQuery,
    SchemaTypes.ChallengeCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCanvasValuesQuery, SchemaTypes.ChallengeCanvasValuesQueryVariables>(
    ChallengeCanvasValuesDocument,
    options
  );
}
export function useChallengeCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCanvasValuesQuery,
    SchemaTypes.ChallengeCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeCanvasValuesQuery, SchemaTypes.ChallengeCanvasValuesQueryVariables>(
    ChallengeCanvasValuesDocument,
    options
  );
}
export type ChallengeCanvasValuesQueryHookResult = ReturnType<typeof useChallengeCanvasValuesQuery>;
export type ChallengeCanvasValuesLazyQueryHookResult = ReturnType<typeof useChallengeCanvasValuesLazyQuery>;
export type ChallengeCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCanvasValuesQuery,
  SchemaTypes.ChallengeCanvasValuesQueryVariables
>;
export function refetchChallengeCanvasValuesQuery(variables?: SchemaTypes.ChallengeCanvasValuesQueryVariables) {
  return { query: ChallengeCanvasValuesDocument, variables: variables };
}
export const OpportunityCanvasesDocument = gql`
  query opportunityCanvases($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        context {
          id
          canvases {
            ...CanvasDetails
          }
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
`;

/**
 * __useOpportunityCanvasesQuery__
 *
 * To run a query within a React component, call `useOpportunityCanvasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCanvasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCanvasesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCanvasesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCanvasesQuery,
    SchemaTypes.OpportunityCanvasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityCanvasesQuery, SchemaTypes.OpportunityCanvasesQueryVariables>(
    OpportunityCanvasesDocument,
    options
  );
}
export function useOpportunityCanvasesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCanvasesQuery,
    SchemaTypes.OpportunityCanvasesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityCanvasesQuery, SchemaTypes.OpportunityCanvasesQueryVariables>(
    OpportunityCanvasesDocument,
    options
  );
}
export type OpportunityCanvasesQueryHookResult = ReturnType<typeof useOpportunityCanvasesQuery>;
export type OpportunityCanvasesLazyQueryHookResult = ReturnType<typeof useOpportunityCanvasesLazyQuery>;
export type OpportunityCanvasesQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCanvasesQuery,
  SchemaTypes.OpportunityCanvasesQueryVariables
>;
export function refetchOpportunityCanvasesQuery(variables?: SchemaTypes.OpportunityCanvasesQueryVariables) {
  return { query: OpportunityCanvasesDocument, variables: variables };
}
export const OpportunityCanvasValuesDocument = gql`
  query opportunityCanvasValues($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!, $canvasId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        id
        context {
          id
          canvases(IDs: [$canvasId]) {
            ...CanvasDetails
            ...CanvasValue
          }
        }
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
  ${CanvasValueFragmentDoc}
`;

/**
 * __useOpportunityCanvasValuesQuery__
 *
 * To run a query within a React component, call `useOpportunityCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCanvasValuesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useOpportunityCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCanvasValuesQuery,
    SchemaTypes.OpportunityCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityCanvasValuesQuery, SchemaTypes.OpportunityCanvasValuesQueryVariables>(
    OpportunityCanvasValuesDocument,
    options
  );
}
export function useOpportunityCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCanvasValuesQuery,
    SchemaTypes.OpportunityCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCanvasValuesQuery,
    SchemaTypes.OpportunityCanvasValuesQueryVariables
  >(OpportunityCanvasValuesDocument, options);
}
export type OpportunityCanvasValuesQueryHookResult = ReturnType<typeof useOpportunityCanvasValuesQuery>;
export type OpportunityCanvasValuesLazyQueryHookResult = ReturnType<typeof useOpportunityCanvasValuesLazyQuery>;
export type OpportunityCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCanvasValuesQuery,
  SchemaTypes.OpportunityCanvasValuesQueryVariables
>;
export function refetchOpportunityCanvasValuesQuery(variables?: SchemaTypes.OpportunityCanvasValuesQueryVariables) {
  return { query: OpportunityCanvasValuesDocument, variables: variables };
}
export const CreateCanvasOnContextDocument = gql`
  mutation createCanvasOnContext($input: CreateCanvasOnContextInput!) {
    createCanvasOnContext(canvasData: $input) {
      ...CanvasDetails
    }
  }
  ${CanvasDetailsFragmentDoc}
`;
export type CreateCanvasOnContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateCanvasOnContextMutation,
  SchemaTypes.CreateCanvasOnContextMutationVariables
>;

/**
 * __useCreateCanvasOnContextMutation__
 *
 * To run a mutation, you first call `useCreateCanvasOnContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCanvasOnContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCanvasOnContextMutation, { data, loading, error }] = useCreateCanvasOnContextMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCanvasOnContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateCanvasOnContextMutation,
    SchemaTypes.CreateCanvasOnContextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateCanvasOnContextMutation,
    SchemaTypes.CreateCanvasOnContextMutationVariables
  >(CreateCanvasOnContextDocument, options);
}
export type CreateCanvasOnContextMutationHookResult = ReturnType<typeof useCreateCanvasOnContextMutation>;
export type CreateCanvasOnContextMutationResult = Apollo.MutationResult<SchemaTypes.CreateCanvasOnContextMutation>;
export type CreateCanvasOnContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateCanvasOnContextMutation,
  SchemaTypes.CreateCanvasOnContextMutationVariables
>;
export const DeleteCanvasOnContextDocument = gql`
  mutation deleteCanvasOnContext($input: DeleteCanvasOnContextInput!) {
    deleteCanvasOnContext(deleteData: $input) {
      ...CanvasSummary
    }
  }
  ${CanvasSummaryFragmentDoc}
`;
export type DeleteCanvasOnContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCanvasOnContextMutation,
  SchemaTypes.DeleteCanvasOnContextMutationVariables
>;

/**
 * __useDeleteCanvasOnContextMutation__
 *
 * To run a mutation, you first call `useDeleteCanvasOnContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCanvasOnContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCanvasOnContextMutation, { data, loading, error }] = useDeleteCanvasOnContextMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCanvasOnContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteCanvasOnContextMutation,
    SchemaTypes.DeleteCanvasOnContextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteCanvasOnContextMutation,
    SchemaTypes.DeleteCanvasOnContextMutationVariables
  >(DeleteCanvasOnContextDocument, options);
}
export type DeleteCanvasOnContextMutationHookResult = ReturnType<typeof useDeleteCanvasOnContextMutation>;
export type DeleteCanvasOnContextMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCanvasOnContextMutation>;
export type DeleteCanvasOnContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCanvasOnContextMutation,
  SchemaTypes.DeleteCanvasOnContextMutationVariables
>;
export const UpdateCanvasOnContextDocument = gql`
  mutation updateCanvasOnContext($input: UpdateCanvasDirectInput!) {
    updateCanvas(canvasData: $input) {
      id
      value
      name
      isTemplate
    }
  }
`;
export type UpdateCanvasOnContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCanvasOnContextMutation,
  SchemaTypes.UpdateCanvasOnContextMutationVariables
>;

/**
 * __useUpdateCanvasOnContextMutation__
 *
 * To run a mutation, you first call `useUpdateCanvasOnContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCanvasOnContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCanvasOnContextMutation, { data, loading, error }] = useUpdateCanvasOnContextMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCanvasOnContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCanvasOnContextMutation,
    SchemaTypes.UpdateCanvasOnContextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCanvasOnContextMutation,
    SchemaTypes.UpdateCanvasOnContextMutationVariables
  >(UpdateCanvasOnContextDocument, options);
}
export type UpdateCanvasOnContextMutationHookResult = ReturnType<typeof useUpdateCanvasOnContextMutation>;
export type UpdateCanvasOnContextMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCanvasOnContextMutation>;
export type UpdateCanvasOnContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCanvasOnContextMutation,
  SchemaTypes.UpdateCanvasOnContextMutationVariables
>;
export const CheckoutCanvasOnContextDocument = gql`
  mutation checkoutCanvasOnContext($input: CanvasCheckoutEventInput!) {
    eventOnCanvasCheckout(canvasCheckoutEventData: $input) {
      ...ChechkoutDetails
    }
  }
  ${ChechkoutDetailsFragmentDoc}
`;
export type CheckoutCanvasOnContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.CheckoutCanvasOnContextMutation,
  SchemaTypes.CheckoutCanvasOnContextMutationVariables
>;

/**
 * __useCheckoutCanvasOnContextMutation__
 *
 * To run a mutation, you first call `useCheckoutCanvasOnContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutCanvasOnContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutCanvasOnContextMutation, { data, loading, error }] = useCheckoutCanvasOnContextMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCheckoutCanvasOnContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CheckoutCanvasOnContextMutation,
    SchemaTypes.CheckoutCanvasOnContextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CheckoutCanvasOnContextMutation,
    SchemaTypes.CheckoutCanvasOnContextMutationVariables
  >(CheckoutCanvasOnContextDocument, options);
}
export type CheckoutCanvasOnContextMutationHookResult = ReturnType<typeof useCheckoutCanvasOnContextMutation>;
export type CheckoutCanvasOnContextMutationResult = Apollo.MutationResult<SchemaTypes.CheckoutCanvasOnContextMutation>;
export type CheckoutCanvasOnContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CheckoutCanvasOnContextMutation,
  SchemaTypes.CheckoutCanvasOnContextMutationVariables
>;
export const ChallengeExplorerSearchDocument = gql`
  query ChallengeExplorerSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      result {
        ...ChallengeExplorerSearchResult
      }
    }
  }
  ${ChallengeExplorerSearchResultFragmentDoc}
`;

/**
 * __useChallengeExplorerSearchQuery__
 *
 * To run a query within a React component, call `useChallengeExplorerSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeExplorerSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeExplorerSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useChallengeExplorerSearchQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeExplorerSearchQuery,
    SchemaTypes.ChallengeExplorerSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeExplorerSearchQuery, SchemaTypes.ChallengeExplorerSearchQueryVariables>(
    ChallengeExplorerSearchDocument,
    options
  );
}
export function useChallengeExplorerSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeExplorerSearchQuery,
    SchemaTypes.ChallengeExplorerSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeExplorerSearchQuery,
    SchemaTypes.ChallengeExplorerSearchQueryVariables
  >(ChallengeExplorerSearchDocument, options);
}
export type ChallengeExplorerSearchQueryHookResult = ReturnType<typeof useChallengeExplorerSearchQuery>;
export type ChallengeExplorerSearchLazyQueryHookResult = ReturnType<typeof useChallengeExplorerSearchLazyQuery>;
export type ChallengeExplorerSearchQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeExplorerSearchQuery,
  SchemaTypes.ChallengeExplorerSearchQueryVariables
>;
export function refetchChallengeExplorerSearchQuery(variables?: SchemaTypes.ChallengeExplorerSearchQueryVariables) {
  return { query: ChallengeExplorerSearchDocument, variables: variables };
}
export const SimpleEcoverseDocument = gql`
  query SimpleEcoverse($ID: UUID_NAMEID!) {
    ecoverse(ID: $ID) {
      ...SimpleEcoverse
    }
  }
  ${SimpleEcoverseFragmentDoc}
`;

/**
 * __useSimpleEcoverseQuery__
 *
 * To run a query within a React component, call `useSimpleEcoverseQuery` and pass it any options that fit your needs.
 * When your component renders, `useSimpleEcoverseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimpleEcoverseQuery({
 *   variables: {
 *      ID: // value for 'ID'
 *   },
 * });
 */
export function useSimpleEcoverseQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SimpleEcoverseQuery, SchemaTypes.SimpleEcoverseQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SimpleEcoverseQuery, SchemaTypes.SimpleEcoverseQueryVariables>(
    SimpleEcoverseDocument,
    options
  );
}
export function useSimpleEcoverseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SimpleEcoverseQuery, SchemaTypes.SimpleEcoverseQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SimpleEcoverseQuery, SchemaTypes.SimpleEcoverseQueryVariables>(
    SimpleEcoverseDocument,
    options
  );
}
export type SimpleEcoverseQueryHookResult = ReturnType<typeof useSimpleEcoverseQuery>;
export type SimpleEcoverseLazyQueryHookResult = ReturnType<typeof useSimpleEcoverseLazyQuery>;
export type SimpleEcoverseQueryResult = Apollo.QueryResult<
  SchemaTypes.SimpleEcoverseQuery,
  SchemaTypes.SimpleEcoverseQueryVariables
>;
export function refetchSimpleEcoverseQuery(variables?: SchemaTypes.SimpleEcoverseQueryVariables) {
  return { query: SimpleEcoverseDocument, variables: variables };
}
export const ChallengeExplorerSearchEnricherDocument = gql`
  query ChallengeExplorerSearchEnricher($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      nameID
      displayName
    }
  }
`;

/**
 * __useChallengeExplorerSearchEnricherQuery__
 *
 * To run a query within a React component, call `useChallengeExplorerSearchEnricherQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeExplorerSearchEnricherQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeExplorerSearchEnricherQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useChallengeExplorerSearchEnricherQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeExplorerSearchEnricherQuery,
    SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeExplorerSearchEnricherQuery,
    SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
  >(ChallengeExplorerSearchEnricherDocument, options);
}
export function useChallengeExplorerSearchEnricherLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeExplorerSearchEnricherQuery,
    SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeExplorerSearchEnricherQuery,
    SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
  >(ChallengeExplorerSearchEnricherDocument, options);
}
export type ChallengeExplorerSearchEnricherQueryHookResult = ReturnType<typeof useChallengeExplorerSearchEnricherQuery>;
export type ChallengeExplorerSearchEnricherLazyQueryHookResult = ReturnType<
  typeof useChallengeExplorerSearchEnricherLazyQuery
>;
export type ChallengeExplorerSearchEnricherQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeExplorerSearchEnricherQuery,
  SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
>;
export function refetchChallengeExplorerSearchEnricherQuery(
  variables?: SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
) {
  return { query: ChallengeExplorerSearchEnricherDocument, variables: variables };
}
export const ChallengesOverviewPageDocument = gql`
  query ChallengesOverviewPage($membershipData: MembershipUserInput!) {
    membershipUser(membershipData: $membershipData) {
      ecoverses {
        id
        ...SimpleEcoverseResultEntry
        challenges {
          id
        }
      }
    }
  }
  ${SimpleEcoverseResultEntryFragmentDoc}
`;

/**
 * __useChallengesOverviewPageQuery__
 *
 * To run a query within a React component, call `useChallengesOverviewPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengesOverviewPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengesOverviewPageQuery({
 *   variables: {
 *      membershipData: // value for 'membershipData'
 *   },
 * });
 */
export function useChallengesOverviewPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengesOverviewPageQuery,
    SchemaTypes.ChallengesOverviewPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengesOverviewPageQuery, SchemaTypes.ChallengesOverviewPageQueryVariables>(
    ChallengesOverviewPageDocument,
    options
  );
}
export function useChallengesOverviewPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengesOverviewPageQuery,
    SchemaTypes.ChallengesOverviewPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengesOverviewPageQuery, SchemaTypes.ChallengesOverviewPageQueryVariables>(
    ChallengesOverviewPageDocument,
    options
  );
}
export type ChallengesOverviewPageQueryHookResult = ReturnType<typeof useChallengesOverviewPageQuery>;
export type ChallengesOverviewPageLazyQueryHookResult = ReturnType<typeof useChallengesOverviewPageLazyQuery>;
export type ChallengesOverviewPageQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengesOverviewPageQuery,
  SchemaTypes.ChallengesOverviewPageQueryVariables
>;
export function refetchChallengesOverviewPageQuery(variables?: SchemaTypes.ChallengesOverviewPageQueryVariables) {
  return { query: ChallengesOverviewPageDocument, variables: variables };
}
export const CommunityUpdatesDocument = gql`
  query communityUpdates($ecoverseId: UUID_NAMEID!, $communityId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        displayName
        communication {
          id
          updates {
            id
            messages {
              ...MessageDetails
            }
          }
        }
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCommunityUpdatesQuery__
 *
 * To run a query within a React component, call `useCommunityUpdatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityUpdatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityUpdatesQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityUpdatesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables>(
    CommunityUpdatesDocument,
    options
  );
}
export function useCommunityUpdatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityUpdatesQuery,
    SchemaTypes.CommunityUpdatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables>(
    CommunityUpdatesDocument,
    options
  );
}
export type CommunityUpdatesQueryHookResult = ReturnType<typeof useCommunityUpdatesQuery>;
export type CommunityUpdatesLazyQueryHookResult = ReturnType<typeof useCommunityUpdatesLazyQuery>;
export type CommunityUpdatesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityUpdatesQuery,
  SchemaTypes.CommunityUpdatesQueryVariables
>;
export function refetchCommunityUpdatesQuery(variables?: SchemaTypes.CommunityUpdatesQueryVariables) {
  return { query: CommunityUpdatesDocument, variables: variables };
}
export const SendUpdateDocument = gql`
  mutation sendUpdate($msgData: UpdatesSendMessageInput!) {
    sendUpdate(messageData: $msgData) {
      ...MessageDetails
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export type SendUpdateMutationFn = Apollo.MutationFunction<
  SchemaTypes.SendUpdateMutation,
  SchemaTypes.SendUpdateMutationVariables
>;

/**
 * __useSendUpdateMutation__
 *
 * To run a mutation, you first call `useSendUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendUpdateMutation, { data, loading, error }] = useSendUpdateMutation({
 *   variables: {
 *      msgData: // value for 'msgData'
 *   },
 * });
 */
export function useSendUpdateMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.SendUpdateMutation, SchemaTypes.SendUpdateMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.SendUpdateMutation, SchemaTypes.SendUpdateMutationVariables>(
    SendUpdateDocument,
    options
  );
}
export type SendUpdateMutationHookResult = ReturnType<typeof useSendUpdateMutation>;
export type SendUpdateMutationResult = Apollo.MutationResult<SchemaTypes.SendUpdateMutation>;
export type SendUpdateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SendUpdateMutation,
  SchemaTypes.SendUpdateMutationVariables
>;
export const RemoveUpdateCommunityDocument = gql`
  mutation removeUpdateCommunity($msgData: UpdatesRemoveMessageInput!) {
    removeUpdate(messageData: $msgData)
  }
`;
export type RemoveUpdateCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUpdateCommunityMutation,
  SchemaTypes.RemoveUpdateCommunityMutationVariables
>;

/**
 * __useRemoveUpdateCommunityMutation__
 *
 * To run a mutation, you first call `useRemoveUpdateCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUpdateCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUpdateCommunityMutation, { data, loading, error }] = useRemoveUpdateCommunityMutation({
 *   variables: {
 *      msgData: // value for 'msgData'
 *   },
 * });
 */
export function useRemoveUpdateCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUpdateCommunityMutation,
    SchemaTypes.RemoveUpdateCommunityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUpdateCommunityMutation,
    SchemaTypes.RemoveUpdateCommunityMutationVariables
  >(RemoveUpdateCommunityDocument, options);
}
export type RemoveUpdateCommunityMutationHookResult = ReturnType<typeof useRemoveUpdateCommunityMutation>;
export type RemoveUpdateCommunityMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUpdateCommunityMutation>;
export type RemoveUpdateCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUpdateCommunityMutation,
  SchemaTypes.RemoveUpdateCommunityMutationVariables
>;
export const OnMessageReceivedDocument = gql`
  subscription onMessageReceived {
    messageReceived {
      roomId
      roomName
      communityId
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useOnMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useOnMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnMessageReceivedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnMessageReceivedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.OnMessageReceivedSubscription,
    SchemaTypes.OnMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.OnMessageReceivedSubscription,
    SchemaTypes.OnMessageReceivedSubscriptionVariables
  >(OnMessageReceivedDocument, options);
}
export type OnMessageReceivedSubscriptionHookResult = ReturnType<typeof useOnMessageReceivedSubscription>;
export type OnMessageReceivedSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.OnMessageReceivedSubscription>;
export const CommunityDiscussionDocument = gql`
  query communityDiscussion($ecoverseId: UUID_NAMEID!, $communityId: UUID!, $discussionId: String!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        communication {
          id
          authorization {
            myPrivileges
          }
          discussion(ID: $discussionId) {
            ...DiscussionDetails
            messages {
              ...MessageDetails
            }
          }
        }
      }
    }
  }
  ${DiscussionDetailsFragmentDoc}
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCommunityDiscussionQuery__
 *
 * To run a query within a React component, call `useCommunityDiscussionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityDiscussionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityDiscussionQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *      discussionId: // value for 'discussionId'
 *   },
 * });
 */
export function useCommunityDiscussionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityDiscussionQuery,
    SchemaTypes.CommunityDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityDiscussionQuery, SchemaTypes.CommunityDiscussionQueryVariables>(
    CommunityDiscussionDocument,
    options
  );
}
export function useCommunityDiscussionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityDiscussionQuery,
    SchemaTypes.CommunityDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityDiscussionQuery, SchemaTypes.CommunityDiscussionQueryVariables>(
    CommunityDiscussionDocument,
    options
  );
}
export type CommunityDiscussionQueryHookResult = ReturnType<typeof useCommunityDiscussionQuery>;
export type CommunityDiscussionLazyQueryHookResult = ReturnType<typeof useCommunityDiscussionLazyQuery>;
export type CommunityDiscussionQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityDiscussionQuery,
  SchemaTypes.CommunityDiscussionQueryVariables
>;
export function refetchCommunityDiscussionQuery(variables?: SchemaTypes.CommunityDiscussionQueryVariables) {
  return { query: CommunityDiscussionDocument, variables: variables };
}
export const CommunityDiscussionListDocument = gql`
  query communityDiscussionList($ecoverseId: UUID_NAMEID!, $communityId: UUID!) {
    ecoverse(ID: $ecoverseId) {
      id
      community(ID: $communityId) {
        id
        communication {
          id
          authorization {
            myPrivileges
          }
          discussions {
            ...DiscussionDetailsNoAuth
          }
        }
      }
    }
  }
  ${DiscussionDetailsNoAuthFragmentDoc}
`;

/**
 * __useCommunityDiscussionListQuery__
 *
 * To run a query within a React component, call `useCommunityDiscussionListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityDiscussionListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityDiscussionListQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityDiscussionListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityDiscussionListQuery,
    SchemaTypes.CommunityDiscussionListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityDiscussionListQuery, SchemaTypes.CommunityDiscussionListQueryVariables>(
    CommunityDiscussionListDocument,
    options
  );
}
export function useCommunityDiscussionListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityDiscussionListQuery,
    SchemaTypes.CommunityDiscussionListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityDiscussionListQuery,
    SchemaTypes.CommunityDiscussionListQueryVariables
  >(CommunityDiscussionListDocument, options);
}
export type CommunityDiscussionListQueryHookResult = ReturnType<typeof useCommunityDiscussionListQuery>;
export type CommunityDiscussionListLazyQueryHookResult = ReturnType<typeof useCommunityDiscussionListLazyQuery>;
export type CommunityDiscussionListQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityDiscussionListQuery,
  SchemaTypes.CommunityDiscussionListQueryVariables
>;
export function refetchCommunityDiscussionListQuery(variables?: SchemaTypes.CommunityDiscussionListQueryVariables) {
  return { query: CommunityDiscussionListDocument, variables: variables };
}
export const PostDiscussionCommentDocument = gql`
  mutation postDiscussionComment($input: DiscussionSendMessageInput!) {
    sendMessageToDiscussion(messageData: $input) {
      ...MessageDetails
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export type PostDiscussionCommentMutationFn = Apollo.MutationFunction<
  SchemaTypes.PostDiscussionCommentMutation,
  SchemaTypes.PostDiscussionCommentMutationVariables
>;

/**
 * __usePostDiscussionCommentMutation__
 *
 * To run a mutation, you first call `usePostDiscussionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostDiscussionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postDiscussionCommentMutation, { data, loading, error }] = usePostDiscussionCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePostDiscussionCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.PostDiscussionCommentMutation,
    SchemaTypes.PostDiscussionCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.PostDiscussionCommentMutation,
    SchemaTypes.PostDiscussionCommentMutationVariables
  >(PostDiscussionCommentDocument, options);
}
export type PostDiscussionCommentMutationHookResult = ReturnType<typeof usePostDiscussionCommentMutation>;
export type PostDiscussionCommentMutationResult = Apollo.MutationResult<SchemaTypes.PostDiscussionCommentMutation>;
export type PostDiscussionCommentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.PostDiscussionCommentMutation,
  SchemaTypes.PostDiscussionCommentMutationVariables
>;
export const CreateDiscussionDocument = gql`
  mutation createDiscussion($input: CommunicationCreateDiscussionInput!) {
    createDiscussion(createData: $input) {
      ...DiscussionDetails
    }
  }
  ${DiscussionDetailsFragmentDoc}
`;
export type CreateDiscussionMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateDiscussionMutation,
  SchemaTypes.CreateDiscussionMutationVariables
>;

/**
 * __useCreateDiscussionMutation__
 *
 * To run a mutation, you first call `useCreateDiscussionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDiscussionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDiscussionMutation, { data, loading, error }] = useCreateDiscussionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDiscussionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateDiscussionMutation,
    SchemaTypes.CreateDiscussionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateDiscussionMutation, SchemaTypes.CreateDiscussionMutationVariables>(
    CreateDiscussionDocument,
    options
  );
}
export type CreateDiscussionMutationHookResult = ReturnType<typeof useCreateDiscussionMutation>;
export type CreateDiscussionMutationResult = Apollo.MutationResult<SchemaTypes.CreateDiscussionMutation>;
export type CreateDiscussionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateDiscussionMutation,
  SchemaTypes.CreateDiscussionMutationVariables
>;
export const AuthorDetailsDocument = gql`
  query authorDetails($ids: [UUID_NAMEID_EMAIL!]!) {
    usersById(IDs: $ids) {
      id
      nameID
      displayName
      firstName
      lastName
      profile {
        id
        avatar
      }
    }
  }
`;

/**
 * __useAuthorDetailsQuery__
 *
 * To run a query within a React component, call `useAuthorDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthorDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthorDetailsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useAuthorDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AuthorDetailsQuery, SchemaTypes.AuthorDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AuthorDetailsQuery, SchemaTypes.AuthorDetailsQueryVariables>(
    AuthorDetailsDocument,
    options
  );
}
export function useAuthorDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AuthorDetailsQuery, SchemaTypes.AuthorDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AuthorDetailsQuery, SchemaTypes.AuthorDetailsQueryVariables>(
    AuthorDetailsDocument,
    options
  );
}
export type AuthorDetailsQueryHookResult = ReturnType<typeof useAuthorDetailsQuery>;
export type AuthorDetailsLazyQueryHookResult = ReturnType<typeof useAuthorDetailsLazyQuery>;
export type AuthorDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.AuthorDetailsQuery,
  SchemaTypes.AuthorDetailsQueryVariables
>;
export function refetchAuthorDetailsQuery(variables?: SchemaTypes.AuthorDetailsQueryVariables) {
  return { query: AuthorDetailsDocument, variables: variables };
}
export const EcoversePageDocument = gql`
  query ecoversePage($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      ...EcoversePage
    }
  }
  ${EcoversePageFragmentDoc}
`;

/**
 * __useEcoversePageQuery__
 *
 * To run a query within a React component, call `useEcoversePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoversePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoversePageQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoversePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.EcoversePageQuery, SchemaTypes.EcoversePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoversePageQuery, SchemaTypes.EcoversePageQueryVariables>(
    EcoversePageDocument,
    options
  );
}
export function useEcoversePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.EcoversePageQuery, SchemaTypes.EcoversePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoversePageQuery, SchemaTypes.EcoversePageQueryVariables>(
    EcoversePageDocument,
    options
  );
}
export type EcoversePageQueryHookResult = ReturnType<typeof useEcoversePageQuery>;
export type EcoversePageLazyQueryHookResult = ReturnType<typeof useEcoversePageLazyQuery>;
export type EcoversePageQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoversePageQuery,
  SchemaTypes.EcoversePageQueryVariables
>;
export function refetchEcoversePageQuery(variables?: SchemaTypes.EcoversePageQueryVariables) {
  return { query: EcoversePageDocument, variables: variables };
}
export const EcoversePageProjectsDocument = gql`
  query EcoversePageProjects($ecoverseId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      challenges {
        id
        displayName
        nameID
        opportunities {
          id
          nameID
          projects {
            ...ProjectInfo
          }
        }
      }
    }
  }
  ${ProjectInfoFragmentDoc}
`;

/**
 * __useEcoversePageProjectsQuery__
 *
 * To run a query within a React component, call `useEcoversePageProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoversePageProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoversePageProjectsQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *   },
 * });
 */
export function useEcoversePageProjectsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.EcoversePageProjectsQuery,
    SchemaTypes.EcoversePageProjectsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.EcoversePageProjectsQuery, SchemaTypes.EcoversePageProjectsQueryVariables>(
    EcoversePageProjectsDocument,
    options
  );
}
export function useEcoversePageProjectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.EcoversePageProjectsQuery,
    SchemaTypes.EcoversePageProjectsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.EcoversePageProjectsQuery, SchemaTypes.EcoversePageProjectsQueryVariables>(
    EcoversePageProjectsDocument,
    options
  );
}
export type EcoversePageProjectsQueryHookResult = ReturnType<typeof useEcoversePageProjectsQuery>;
export type EcoversePageProjectsLazyQueryHookResult = ReturnType<typeof useEcoversePageProjectsLazyQuery>;
export type EcoversePageProjectsQueryResult = Apollo.QueryResult<
  SchemaTypes.EcoversePageProjectsQuery,
  SchemaTypes.EcoversePageProjectsQueryVariables
>;
export function refetchEcoversePageProjectsQuery(variables?: SchemaTypes.EcoversePageProjectsQueryVariables) {
  return { query: EcoversePageProjectsDocument, variables: variables };
}
export const AssignUserAsOpportunityAdminDocument = gql`
  mutation assignUserAsOpportunityAdmin($input: AssignOpportunityAdminInput!) {
    assignUserAsOpportunityAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsOpportunityAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsOpportunityAdminMutation,
  SchemaTypes.AssignUserAsOpportunityAdminMutationVariables
>;

/**
 * __useAssignUserAsOpportunityAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsOpportunityAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsOpportunityAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsOpportunityAdminMutation, { data, loading, error }] = useAssignUserAsOpportunityAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsOpportunityAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsOpportunityAdminMutation,
    SchemaTypes.AssignUserAsOpportunityAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsOpportunityAdminMutation,
    SchemaTypes.AssignUserAsOpportunityAdminMutationVariables
  >(AssignUserAsOpportunityAdminDocument, options);
}
export type AssignUserAsOpportunityAdminMutationHookResult = ReturnType<typeof useAssignUserAsOpportunityAdminMutation>;
export type AssignUserAsOpportunityAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsOpportunityAdminMutation>;
export type AssignUserAsOpportunityAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsOpportunityAdminMutation,
  SchemaTypes.AssignUserAsOpportunityAdminMutationVariables
>;
export const RemoveUserAsOpportunityAdminDocument = gql`
  mutation removeUserAsOpportunityAdmin($input: RemoveOpportunityAdminInput!) {
    removeUserAsOpportunityAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsOpportunityAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsOpportunityAdminMutation,
  SchemaTypes.RemoveUserAsOpportunityAdminMutationVariables
>;

/**
 * __useRemoveUserAsOpportunityAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsOpportunityAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsOpportunityAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsOpportunityAdminMutation, { data, loading, error }] = useRemoveUserAsOpportunityAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsOpportunityAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsOpportunityAdminMutation,
    SchemaTypes.RemoveUserAsOpportunityAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsOpportunityAdminMutation,
    SchemaTypes.RemoveUserAsOpportunityAdminMutationVariables
  >(RemoveUserAsOpportunityAdminDocument, options);
}
export type RemoveUserAsOpportunityAdminMutationHookResult = ReturnType<typeof useRemoveUserAsOpportunityAdminMutation>;
export type RemoveUserAsOpportunityAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsOpportunityAdminMutation>;
export type RemoveUserAsOpportunityAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsOpportunityAdminMutation,
  SchemaTypes.RemoveUserAsOpportunityAdminMutationVariables
>;
export const OpportunityPageDocument = gql`
  query opportunityPage($ecoverseId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    ecoverse(ID: $ecoverseId) {
      id
      opportunity(ID: $opportunityId) {
        ...OpportunityPage
      }
    }
  }
  ${OpportunityPageFragmentDoc}
`;

/**
 * __useOpportunityPageQuery__
 *
 * To run a query within a React component, call `useOpportunityPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityPageQuery({
 *   variables: {
 *      ecoverseId: // value for 'ecoverseId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityPageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityPageQuery, SchemaTypes.OpportunityPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityPageQuery, SchemaTypes.OpportunityPageQueryVariables>(
    OpportunityPageDocument,
    options
  );
}
export function useOpportunityPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunityPageQuery, SchemaTypes.OpportunityPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityPageQuery, SchemaTypes.OpportunityPageQueryVariables>(
    OpportunityPageDocument,
    options
  );
}
export type OpportunityPageQueryHookResult = ReturnType<typeof useOpportunityPageQuery>;
export type OpportunityPageLazyQueryHookResult = ReturnType<typeof useOpportunityPageLazyQuery>;
export type OpportunityPageQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityPageQuery,
  SchemaTypes.OpportunityPageQueryVariables
>;
export function refetchOpportunityPageQuery(variables?: SchemaTypes.OpportunityPageQueryVariables) {
  return { query: OpportunityPageDocument, variables: variables };
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityTemplateQuery, SchemaTypes.OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    options
  );
}
export function useOpportunityTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityTemplateQuery,
    SchemaTypes.OpportunityTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityTemplateQuery, SchemaTypes.OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    options
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
export const AssociatedOrganizationDocument = gql`
  query associatedOrganization($organizationId: UUID_NAMEID!) {
    organization(ID: $organizationId) {
      ...AssociatedOrganizationDetails
    }
  }
  ${AssociatedOrganizationDetailsFragmentDoc}
`;

/**
 * __useAssociatedOrganizationQuery__
 *
 * To run a query within a React component, call `useAssociatedOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssociatedOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssociatedOrganizationQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useAssociatedOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AssociatedOrganizationQuery,
    SchemaTypes.AssociatedOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AssociatedOrganizationQuery, SchemaTypes.AssociatedOrganizationQueryVariables>(
    AssociatedOrganizationDocument,
    options
  );
}
export function useAssociatedOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AssociatedOrganizationQuery,
    SchemaTypes.AssociatedOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AssociatedOrganizationQuery, SchemaTypes.AssociatedOrganizationQueryVariables>(
    AssociatedOrganizationDocument,
    options
  );
}
export type AssociatedOrganizationQueryHookResult = ReturnType<typeof useAssociatedOrganizationQuery>;
export type AssociatedOrganizationLazyQueryHookResult = ReturnType<typeof useAssociatedOrganizationLazyQuery>;
export type AssociatedOrganizationQueryResult = Apollo.QueryResult<
  SchemaTypes.AssociatedOrganizationQuery,
  SchemaTypes.AssociatedOrganizationQueryVariables
>;
export function refetchAssociatedOrganizationQuery(variables?: SchemaTypes.AssociatedOrganizationQueryVariables) {
  return { query: AssociatedOrganizationDocument, variables: variables };
}
export const AssignUserToOrganizationDocument = gql`
  mutation assignUserToOrganization($input: AssignOrganizationMemberInput!) {
    assignUserToOrganization(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserToOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserToOrganizationMutation,
  SchemaTypes.AssignUserToOrganizationMutationVariables
>;

/**
 * __useAssignUserToOrganizationMutation__
 *
 * To run a mutation, you first call `useAssignUserToOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserToOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserToOrganizationMutation, { data, loading, error }] = useAssignUserToOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserToOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserToOrganizationMutation,
    SchemaTypes.AssignUserToOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserToOrganizationMutation,
    SchemaTypes.AssignUserToOrganizationMutationVariables
  >(AssignUserToOrganizationDocument, options);
}
export type AssignUserToOrganizationMutationHookResult = ReturnType<typeof useAssignUserToOrganizationMutation>;
export type AssignUserToOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserToOrganizationMutation>;
export type AssignUserToOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserToOrganizationMutation,
  SchemaTypes.AssignUserToOrganizationMutationVariables
>;
export const RemoveUserFromOrganizationDocument = gql`
  mutation removeUserFromOrganization($input: RemoveOrganizationMemberInput!) {
    removeUserFromOrganization(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserFromOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserFromOrganizationMutation,
  SchemaTypes.RemoveUserFromOrganizationMutationVariables
>;

/**
 * __useRemoveUserFromOrganizationMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromOrganizationMutation, { data, loading, error }] = useRemoveUserFromOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserFromOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserFromOrganizationMutation,
    SchemaTypes.RemoveUserFromOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserFromOrganizationMutation,
    SchemaTypes.RemoveUserFromOrganizationMutationVariables
  >(RemoveUserFromOrganizationDocument, options);
}
export type RemoveUserFromOrganizationMutationHookResult = ReturnType<typeof useRemoveUserFromOrganizationMutation>;
export type RemoveUserFromOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserFromOrganizationMutation>;
export type RemoveUserFromOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserFromOrganizationMutation,
  SchemaTypes.RemoveUserFromOrganizationMutationVariables
>;
export const AssignUserAsOrganizationAdminDocument = gql`
  mutation assignUserAsOrganizationAdmin($input: AssignOrganizationAdminInput!) {
    assignUserAsOrganizationAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsOrganizationAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsOrganizationAdminMutation,
  SchemaTypes.AssignUserAsOrganizationAdminMutationVariables
>;

/**
 * __useAssignUserAsOrganizationAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsOrganizationAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsOrganizationAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsOrganizationAdminMutation, { data, loading, error }] = useAssignUserAsOrganizationAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsOrganizationAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsOrganizationAdminMutation,
    SchemaTypes.AssignUserAsOrganizationAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsOrganizationAdminMutation,
    SchemaTypes.AssignUserAsOrganizationAdminMutationVariables
  >(AssignUserAsOrganizationAdminDocument, options);
}
export type AssignUserAsOrganizationAdminMutationHookResult = ReturnType<
  typeof useAssignUserAsOrganizationAdminMutation
>;
export type AssignUserAsOrganizationAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsOrganizationAdminMutation>;
export type AssignUserAsOrganizationAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsOrganizationAdminMutation,
  SchemaTypes.AssignUserAsOrganizationAdminMutationVariables
>;
export const RemoveUserAsOrganizationAdminDocument = gql`
  mutation removeUserAsOrganizationAdmin($input: RemoveOrganizationAdminInput!) {
    removeUserAsOrganizationAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsOrganizationAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsOrganizationAdminMutation,
  SchemaTypes.RemoveUserAsOrganizationAdminMutationVariables
>;

/**
 * __useRemoveUserAsOrganizationAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsOrganizationAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsOrganizationAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsOrganizationAdminMutation, { data, loading, error }] = useRemoveUserAsOrganizationAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsOrganizationAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsOrganizationAdminMutation,
    SchemaTypes.RemoveUserAsOrganizationAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsOrganizationAdminMutation,
    SchemaTypes.RemoveUserAsOrganizationAdminMutationVariables
  >(RemoveUserAsOrganizationAdminDocument, options);
}
export type RemoveUserAsOrganizationAdminMutationHookResult = ReturnType<
  typeof useRemoveUserAsOrganizationAdminMutation
>;
export type RemoveUserAsOrganizationAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsOrganizationAdminMutation>;
export type RemoveUserAsOrganizationAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsOrganizationAdminMutation,
  SchemaTypes.RemoveUserAsOrganizationAdminMutationVariables
>;
export const OrganizationMembersDocument = gql`
  query organizationMembers($id: UUID_NAMEID!) {
    organization(ID: $id) {
      id
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;

/**
 * __useOrganizationMembersQuery__
 *
 * To run a query within a React component, call `useOrganizationMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationMembersQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationMembersQuery,
    SchemaTypes.OrganizationMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationMembersQuery, SchemaTypes.OrganizationMembersQueryVariables>(
    OrganizationMembersDocument,
    options
  );
}
export function useOrganizationMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationMembersQuery,
    SchemaTypes.OrganizationMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationMembersQuery, SchemaTypes.OrganizationMembersQueryVariables>(
    OrganizationMembersDocument,
    options
  );
}
export type OrganizationMembersQueryHookResult = ReturnType<typeof useOrganizationMembersQuery>;
export type OrganizationMembersLazyQueryHookResult = ReturnType<typeof useOrganizationMembersLazyQuery>;
export type OrganizationMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationMembersQuery,
  SchemaTypes.OrganizationMembersQueryVariables
>;
export function refetchOrganizationMembersQuery(variables?: SchemaTypes.OrganizationMembersQueryVariables) {
  return { query: OrganizationMembersDocument, variables: variables };
}
export const UserCardsContainerDocument = gql`
  query userCardsContainer($ids: [UUID_NAMEID_EMAIL!]!) {
    usersById(IDs: $ids) {
      id
      nameID
      displayName
      city
      country
      profile {
        id
        avatar
        tagsets {
          id
          name
          tags
        }
      }
      agent {
        id
        credentials {
          id
          resourceID
          type
        }
      }
    }
  }
`;

/**
 * __useUserCardsContainerQuery__
 *
 * To run a query within a React component, call `useUserCardsContainerQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserCardsContainerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserCardsContainerQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useUserCardsContainerQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserCardsContainerQuery,
    SchemaTypes.UserCardsContainerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserCardsContainerQuery, SchemaTypes.UserCardsContainerQueryVariables>(
    UserCardsContainerDocument,
    options
  );
}
export function useUserCardsContainerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserCardsContainerQuery,
    SchemaTypes.UserCardsContainerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserCardsContainerQuery, SchemaTypes.UserCardsContainerQueryVariables>(
    UserCardsContainerDocument,
    options
  );
}
export type UserCardsContainerQueryHookResult = ReturnType<typeof useUserCardsContainerQuery>;
export type UserCardsContainerLazyQueryHookResult = ReturnType<typeof useUserCardsContainerLazyQuery>;
export type UserCardsContainerQueryResult = Apollo.QueryResult<
  SchemaTypes.UserCardsContainerQuery,
  SchemaTypes.UserCardsContainerQueryVariables
>;
export function refetchUserCardsContainerQuery(variables?: SchemaTypes.UserCardsContainerQueryVariables) {
  return { query: UserCardsContainerDocument, variables: variables };
}
