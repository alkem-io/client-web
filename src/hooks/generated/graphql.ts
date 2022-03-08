import * as SchemaTypes from '../../models/graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const AdminHubFragmentDoc = gql`
  fragment AdminHub on Hub {
    id
    nameID
    displayName
    authorization {
      id
      myPrivileges
    }
  }
`;
export const VisualUriFragmentDoc = gql`
  fragment VisualUri on Visual {
    id
    uri
    name
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
        avatar {
          ...VisualUri
        }
      }
    }
    questions {
      id
      name
      value
    }
  }
  ${VisualUriFragmentDoc}
`;
export const OrganizationCardFragmentDoc = gql`
  fragment OrganizationCard on Organization {
    id
    nameID
    displayName
    activity {
      id
      name
      value
    }
    profile {
      id
      avatar {
        ...VisualUri
      }
      description
    }
    verification {
      id
      status
    }
  }
  ${VisualUriFragmentDoc}
`;
export const UserCardFragmentDoc = gql`
  fragment UserCard on User {
    id
    nameID
    displayName
    country
    city
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
      avatar {
        ...VisualUri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const VisualFullFragmentDoc = gql`
  fragment VisualFull on Visual {
    id
    uri
    name
    allowedTypes
    aspectRatio
    maxHeight
    maxWidth
    minHeight
    minWidth
  }
`;
export const ChallengeInfoFragmentDoc = gql`
  fragment ChallengeInfo on Challenge {
    id
    displayName
    nameID
    community {
      id
      authorization {
        id
        myPrivileges
      }
    }
    authorization {
      id
      myPrivileges
    }
    context {
      id
      tagline
      authorization {
        id
        myPrivileges
      }
      references {
        id
        name
        uri
      }
      visuals {
        ...VisualFull
      }
    }
  }
  ${VisualFullFragmentDoc}
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
      avatar {
        ...VisualUri
      }
      description
      tagsets {
        id
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
    template {
      opportunities {
        aspects
      }
    }
  }
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
      avatar {
        ...VisualFull
      }
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
  ${VisualFullFragmentDoc}
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
    visuals {
      ...VisualFull
    }
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
  }
  ${VisualFullFragmentDoc}
`;
export const HubDetailsFragmentDoc = gql`
  fragment HubDetails on Hub {
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
export const HubInfoFragmentDoc = gql`
  fragment HubInfo on Hub {
    ...HubDetails
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
    context {
      id
      authorization {
        id
        myPrivileges
      }
    }
    template {
      aspectTemplates {
        description
        type
      }
    }
  }
  ${HubDetailsFragmentDoc}
`;
export const HubNameFragmentDoc = gql`
  fragment HubName on Hub {
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
    visuals {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const HubDetailsProviderFragmentDoc = gql`
  fragment HubDetailsProvider on Hub {
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
export const MyPrivilegesFragmentDoc = gql`
  fragment MyPrivileges on Authorization {
    myPrivileges
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
      avatar {
        ...VisualUri
      }
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
        avatar {
          ...VisualUri
        }
        tagsets {
          id
          tags
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
      avatar {
        ...VisualFull
      }
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
  ${VisualFullFragmentDoc}
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
    hubID
    activity {
      name
      value
    }
    context {
      id
      tagline
      visuals {
        ...VisualUri
      }
    }
    tagset {
      id
      tags
    }
  }
  ${VisualUriFragmentDoc}
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
      visuals {
        ...VisualUri
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
      hubID
    }
  }
  ${VisualUriFragmentDoc}
`;
export const OrganizationSearchResultFragmentDoc = gql`
  fragment OrganizationSearchResult on Organization {
    id
    displayName
    profile {
      id
      avatar {
        ...VisualUri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
      avatar {
        ...VisualFull
      }
      references {
        id
        name
        uri
        description
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
  ${VisualFullFragmentDoc}
`;
export const UserDisplayNameFragmentDoc = gql`
  fragment UserDisplayName on User {
    id
    displayName
  }
`;
export const UserMembershipDetailsFragmentDoc = gql`
  fragment UserMembershipDetails on UserMembership {
    hubs {
      id
      nameID
      hubID
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
      hubID
      challengeID
      opportunityID
    }
  }
`;
export const AllCommunityDetailsFragmentDoc = gql`
  fragment AllCommunityDetails on Community {
    id
    displayName
  }
`;
export const OrganizationContributorFragmentDoc = gql`
  fragment OrganizationContributor on Organization {
    id
    displayName
    nameID
    activity {
      id
      name
      value
    }
    orgProfile: profile {
      id
      avatar {
        ...VisualUri
      }
      description
    }
    verification {
      id
      status
    }
  }
  ${VisualUriFragmentDoc}
`;
export const UserContributorFragmentDoc = gql`
  fragment UserContributor on User {
    id
    nameID
    displayName
    country
    city
    agent {
      id
      credentials {
        id
        type
        resourceID
      }
    }
    userProfile: profile {
      id
      avatar {
        ...VisualUri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const AspectMessageFragmentDoc = gql`
  fragment AspectMessage on Message {
    id
    message
    sender
    timestamp
  }
`;
export const AspectDashboardFragmentDoc = gql`
  fragment AspectDashboard on Aspect {
    id
    type
    displayName
    description
    banner {
      ...VisualUri
    }
    tagset {
      id
      name
      tags
    }
    references {
      id
      name
      uri
    }
    comments {
      id
      authorization {
        id
        myPrivileges
      }
      messages {
        ...AspectMessage
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${AspectMessageFragmentDoc}
`;
export const AspectDashboardDataFragmentDoc = gql`
  fragment AspectDashboardData on Context {
    id
    authorization {
      id
      myPrivileges
    }
    aspects(IDs: [$aspectNameId]) {
      ...AspectDashboard
    }
  }
  ${AspectDashboardFragmentDoc}
`;
export const AspectSettingsFragmentDoc = gql`
  fragment AspectSettings on Aspect {
    id
    nameID
    displayName
    description
    type
    authorization {
      id
      myPrivileges
    }
    banner {
      ...VisualFull
    }
    bannerNarrow {
      ...VisualFull
    }
    tagset {
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
  ${VisualFullFragmentDoc}
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
    hubID
    activity {
      id
      name
      value
    }
    context {
      id
      visuals {
        ...VisualUri
      }
    }
    tagset {
      id
      name
      tags
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SimpleHubFragmentDoc = gql`
  fragment SimpleHub on Hub {
    id
    nameID
    displayName
  }
`;
export const OrganizationDetailsFragmentDoc = gql`
  fragment OrganizationDetails on Organization {
    id
    displayName
    nameID
    profile {
      id
      avatar {
        ...VisualUri
      }
      description
      tagsets {
        id
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
      id
      tagline
      vision
      authorization {
        id
        myPrivileges
        anonymousReadAccess
      }
      visuals {
        ...VisualFull
      }
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
  ${VisualFullFragmentDoc}
  ${ContextDetailsFragmentDoc}
`;
export const SimpleHubResultEntryFragmentDoc = gql`
  fragment SimpleHubResultEntry on MembershipUserResultEntryHub {
    hubID
    nameID
    displayName
  }
`;
export const ContextTabFragmentDoc = gql`
  fragment ContextTab on Context {
    id
    tagline
    background
    vision
    impact
    who
    authorization {
      id
      myPrivileges
    }
    visuals {
      ...VisualFull
    }
  }
  ${VisualFullFragmentDoc}
`;
export const AspectCardFragmentDoc = gql`
  fragment AspectCard on Aspect {
    id
    nameID
    displayName
    type
    description
    banner {
      ...VisualUri
    }
    bannerNarrow {
      ...VisualUri
    }
    tagset {
      id
      name
      tags
    }
  }
  ${VisualUriFragmentDoc}
`;
export const ReferenceContextTabFragmentDoc = gql`
  fragment ReferenceContextTab on Reference {
    id
    name
    uri
    description
  }
`;
export const ContextTabExtraFragmentDoc = gql`
  fragment ContextTabExtra on Context {
    id
    aspects {
      ...AspectCard
    }
    references {
      ...ReferenceContextTab
    }
  }
  ${AspectCardFragmentDoc}
  ${ReferenceContextTabFragmentDoc}
`;
export const LifecycleContextTabFragmentDoc = gql`
  fragment LifecycleContextTab on Lifecycle {
    id
    state
    machineDef
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
      visuals {
        ...VisualUri
      }
    }
    tagset {
      id
      name
      tags
    }
  }
  ${VisualUriFragmentDoc}
`;
export const HubPageFragmentDoc = gql`
  fragment HubPage on Hub {
    id
    nameID
    displayName
    activity {
      id
      name
      value
    }
    authorization {
      id
      anonymousReadAccess
      myPrivileges
    }
    host {
      id
      displayName
      nameID
    }
    context {
      id
      tagline
      vision
      visuals {
        ...VisualUri
      }
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
    }
    community {
      id
      members {
        id
      }
      authorization {
        id
        myPrivileges
      }
    }
    challenges(limit: 2, shuffle: true) {
      ...ChallengeCard
    }
    tagset {
      id
      name
      tags
    }
  }
  ${VisualUriFragmentDoc}
  ${ChallengeCardFragmentDoc}
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
      tagline
      vision
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
      references {
        id
        name
        uri
      }
      aspects {
        ...AspectCard
      }
      visuals {
        ...VisualUri
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
  ${AspectCardFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const AssociatedOrganizationDetailsFragmentDoc = gql`
  fragment AssociatedOrganizationDetails on Organization {
    id
    displayName
    nameID
    profile {
      id
      description
      avatar {
        ...VisualUri
      }
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
  ${VisualUriFragmentDoc}
`;
export const UserAgentSsiFragmentDoc = gql`
  fragment UserAgentSsi on User {
    id
    nameID
    agent {
      id
      did
      credentials {
        id
        resourceID
        type
      }
      verifiedCredentials {
        claim
        context
        issued
        expires
        issuer
        name
        type
      }
    }
  }
`;
export const OpportunityProviderFragmentDoc = gql`
  fragment OpportunityProvider on Opportunity {
    id
    nameID
    displayName
    authorization {
      id
      myPrivileges
    }
    context {
      id
      authorization {
        id
        myPrivileges
        anonymousReadAccess
      }
      visuals {
        ...VisualFull
      }
    }
    community {
      id
      authorization {
        id
        myPrivileges
      }
    }
  }
  ${VisualFullFragmentDoc}
`;
export const AspectProvidedFragmentDoc = gql`
  fragment AspectProvided on Aspect {
    id
    nameID
    displayName
    authorization {
      id
      myPrivileges
    }
  }
`;
export const AspectProviderDataFragmentDoc = gql`
  fragment AspectProviderData on Context {
    id
    aspects(IDs: [$aspectNameId]) {
      ...AspectProvided
    }
  }
  ${AspectProvidedFragmentDoc}
`;
export const UpdatePreferencesDocument = gql`
  mutation updatePreferences($input: UpdatePreferenceInput!) {
    updatePreference(preferenceData: $input) {
      id
      value
    }
  }
`;
export type UpdatePreferencesMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferencesMutation,
  SchemaTypes.UpdatePreferencesMutationVariables
>;

/**
 * __useUpdatePreferencesMutation__
 *
 * To run a mutation, you first call `useUpdatePreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferencesMutation, { data, loading, error }] = useUpdatePreferencesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePreferencesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferencesMutation,
    SchemaTypes.UpdatePreferencesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdatePreferencesMutation, SchemaTypes.UpdatePreferencesMutationVariables>(
    UpdatePreferencesDocument,
    options
  );
}
export type UpdatePreferencesMutationHookResult = ReturnType<typeof useUpdatePreferencesMutation>;
export type UpdatePreferencesMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePreferencesMutation>;
export type UpdatePreferencesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferencesMutation,
  SchemaTypes.UpdatePreferencesMutationVariables
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
  mutation CreateAspect($aspectData: CreateAspectOnContextInput!) {
    createAspectOnContext(aspectData: $aspectData) {
      id
      nameID
      displayName
      description
      type
      tagset {
        id
        name
        tags
      }
      banner {
        ...VisualUri
      }
      bannerNarrow {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      aspectData: // value for 'aspectData'
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
  mutation createChallenge($input: CreateChallengeOnHubInput!) {
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
export const CreateHubDocument = gql`
  mutation createHub($input: CreateHubInput!) {
    createHub(hubData: $input) {
      ...HubDetails
    }
  }
  ${HubDetailsFragmentDoc}
`;
export type CreateHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateHubMutation,
  SchemaTypes.CreateHubMutationVariables
>;

/**
 * __useCreateHubMutation__
 *
 * To run a mutation, you first call `useCreateHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createHubMutation, { data, loading, error }] = useCreateHubMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateHubMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreateHubMutation, SchemaTypes.CreateHubMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateHubMutation, SchemaTypes.CreateHubMutationVariables>(
    CreateHubDocument,
    options
  );
}
export type CreateHubMutationHookResult = ReturnType<typeof useCreateHubMutation>;
export type CreateHubMutationResult = Apollo.MutationResult<SchemaTypes.CreateHubMutation>;
export type CreateHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateHubMutation,
  SchemaTypes.CreateHubMutationVariables
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
export const CreateReferenceOnAspectDocument = gql`
  mutation createReferenceOnAspect($referenceInput: CreateReferenceOnAspectInput!) {
    createReferenceOnAspect(referenceData: $referenceInput) {
      id
      name
      uri
      description
    }
  }
`;
export type CreateReferenceOnAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateReferenceOnAspectMutation,
  SchemaTypes.CreateReferenceOnAspectMutationVariables
>;

/**
 * __useCreateReferenceOnAspectMutation__
 *
 * To run a mutation, you first call `useCreateReferenceOnAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReferenceOnAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReferenceOnAspectMutation, { data, loading, error }] = useCreateReferenceOnAspectMutation({
 *   variables: {
 *      referenceInput: // value for 'referenceInput'
 *   },
 * });
 */
export function useCreateReferenceOnAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateReferenceOnAspectMutation,
    SchemaTypes.CreateReferenceOnAspectMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateReferenceOnAspectMutation,
    SchemaTypes.CreateReferenceOnAspectMutationVariables
  >(CreateReferenceOnAspectDocument, options);
}
export type CreateReferenceOnAspectMutationHookResult = ReturnType<typeof useCreateReferenceOnAspectMutation>;
export type CreateReferenceOnAspectMutationResult = Apollo.MutationResult<SchemaTypes.CreateReferenceOnAspectMutation>;
export type CreateReferenceOnAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateReferenceOnAspectMutation,
  SchemaTypes.CreateReferenceOnAspectMutationVariables
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
export const DeleteHubDocument = gql`
  mutation deleteHub($input: DeleteHubInput!) {
    deleteHub(deleteData: $input) {
      id
      nameID
      displayName
    }
  }
`;
export type DeleteHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteHubMutation,
  SchemaTypes.DeleteHubMutationVariables
>;

/**
 * __useDeleteHubMutation__
 *
 * To run a mutation, you first call `useDeleteHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteHubMutation, { data, loading, error }] = useDeleteHubMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteHubMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteHubMutation, SchemaTypes.DeleteHubMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteHubMutation, SchemaTypes.DeleteHubMutationVariables>(
    DeleteHubDocument,
    options
  );
}
export type DeleteHubMutationHookResult = ReturnType<typeof useDeleteHubMutation>;
export type DeleteHubMutationResult = Apollo.MutationResult<SchemaTypes.DeleteHubMutation>;
export type DeleteHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteHubMutation,
  SchemaTypes.DeleteHubMutationVariables
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
export const AssignUserAsHubAdminDocument = gql`
  mutation assignUserAsHubAdmin($input: AssignHubAdminInput!) {
    assignUserAsHubAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type AssignUserAsHubAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsHubAdminMutation,
  SchemaTypes.AssignUserAsHubAdminMutationVariables
>;

/**
 * __useAssignUserAsHubAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsHubAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsHubAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsHubAdminMutation, { data, loading, error }] = useAssignUserAsHubAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsHubAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsHubAdminMutation,
    SchemaTypes.AssignUserAsHubAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsHubAdminMutation,
    SchemaTypes.AssignUserAsHubAdminMutationVariables
  >(AssignUserAsHubAdminDocument, options);
}
export type AssignUserAsHubAdminMutationHookResult = ReturnType<typeof useAssignUserAsHubAdminMutation>;
export type AssignUserAsHubAdminMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserAsHubAdminMutation>;
export type AssignUserAsHubAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsHubAdminMutation,
  SchemaTypes.AssignUserAsHubAdminMutationVariables
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
export const RemoveUserAsHubAdminDocument = gql`
  mutation removeUserAsHubAdmin($input: RemoveHubAdminInput!) {
    removeUserAsHubAdmin(membershipData: $input) {
      id
      displayName
    }
  }
`;
export type RemoveUserAsHubAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsHubAdminMutation,
  SchemaTypes.RemoveUserAsHubAdminMutationVariables
>;

/**
 * __useRemoveUserAsHubAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsHubAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsHubAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsHubAdminMutation, { data, loading, error }] = useRemoveUserAsHubAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsHubAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsHubAdminMutation,
    SchemaTypes.RemoveUserAsHubAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsHubAdminMutation,
    SchemaTypes.RemoveUserAsHubAdminMutationVariables
  >(RemoveUserAsHubAdminDocument, options);
}
export type RemoveUserAsHubAdminMutationHookResult = ReturnType<typeof useRemoveUserAsHubAdminMutation>;
export type RemoveUserAsHubAdminMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserAsHubAdminMutation>;
export type RemoveUserAsHubAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsHubAdminMutation,
  SchemaTypes.RemoveUserAsHubAdminMutationVariables
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
        id
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
export const UpdateGroupDocument = gql`
  mutation updateGroup($input: UpdateUserGroupInput!) {
    updateUserGroup(userGroupData: $input) {
      id
      name
      profile {
        id
        avatar {
          ...VisualUri
        }
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
  ${VisualUriFragmentDoc}
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
export const UpdateHubDocument = gql`
  mutation updateHub($input: UpdateHubInput!) {
    updateHub(hubData: $input) {
      ...HubDetails
    }
  }
  ${HubDetailsFragmentDoc}
`;
export type UpdateHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateHubMutation,
  SchemaTypes.UpdateHubMutationVariables
>;

/**
 * __useUpdateHubMutation__
 *
 * To run a mutation, you first call `useUpdateHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHubMutation, { data, loading, error }] = useUpdateHubMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateHubMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateHubMutation, SchemaTypes.UpdateHubMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateHubMutation, SchemaTypes.UpdateHubMutationVariables>(
    UpdateHubDocument,
    options
  );
}
export type UpdateHubMutationHookResult = ReturnType<typeof useUpdateHubMutation>;
export type UpdateHubMutationResult = Apollo.MutationResult<SchemaTypes.UpdateHubMutation>;
export type UpdateHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateHubMutation,
  SchemaTypes.UpdateHubMutationVariables
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
export const UploadVisualDocument = gql`
  mutation uploadVisual($file: Upload!, $uploadData: VisualUploadImageInput!) {
    uploadImageOnVisual(file: $file, uploadData: $uploadData) {
      id
      uri
    }
  }
`;
export type UploadVisualMutationFn = Apollo.MutationFunction<
  SchemaTypes.UploadVisualMutation,
  SchemaTypes.UploadVisualMutationVariables
>;

/**
 * __useUploadVisualMutation__
 *
 * To run a mutation, you first call `useUploadVisualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadVisualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadVisualMutation, { data, loading, error }] = useUploadVisualMutation({
 *   variables: {
 *      file: // value for 'file'
 *      uploadData: // value for 'uploadData'
 *   },
 * });
 */
export function useUploadVisualMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UploadVisualMutation, SchemaTypes.UploadVisualMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UploadVisualMutation, SchemaTypes.UploadVisualMutationVariables>(
    UploadVisualDocument,
    options
  );
}
export type UploadVisualMutationHookResult = ReturnType<typeof useUploadVisualMutation>;
export type UploadVisualMutationResult = Apollo.MutationResult<SchemaTypes.UploadVisualMutation>;
export type UploadVisualMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadVisualMutation,
  SchemaTypes.UploadVisualMutationVariables
>;
export const AdminHubsListDocument = gql`
  query adminHubsList {
    hubs {
      ...AdminHub
    }
  }
  ${AdminHubFragmentDoc}
`;

/**
 * __useAdminHubsListQuery__
 *
 * To run a query within a React component, call `useAdminHubsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminHubsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminHubsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminHubsListQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.AdminHubsListQuery, SchemaTypes.AdminHubsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminHubsListQuery, SchemaTypes.AdminHubsListQueryVariables>(
    AdminHubsListDocument,
    options
  );
}
export function useAdminHubsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AdminHubsListQuery, SchemaTypes.AdminHubsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminHubsListQuery, SchemaTypes.AdminHubsListQueryVariables>(
    AdminHubsListDocument,
    options
  );
}
export type AdminHubsListQueryHookResult = ReturnType<typeof useAdminHubsListQuery>;
export type AdminHubsListLazyQueryHookResult = ReturnType<typeof useAdminHubsListLazyQuery>;
export type AdminHubsListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminHubsListQuery,
  SchemaTypes.AdminHubsListQueryVariables
>;
export function refetchAdminHubsListQuery(variables?: SchemaTypes.AdminHubsListQueryVariables) {
  return { query: AdminHubsListDocument, variables: variables };
}
export const AllOpportunitiesDocument = gql`
  query allOpportunities($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchAllOpportunitiesQuery(variables: SchemaTypes.AllOpportunitiesQueryVariables) {
  return { query: AllOpportunitiesDocument, variables: variables };
}
export const ApplicationByHubDocument = gql`
  query applicationByHub($hubId: UUID_NAMEID!, $appId: UUID!) {
    hub(ID: $hubId) {
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
 * __useApplicationByHubQuery__
 *
 * To run a query within a React component, call `useApplicationByHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationByHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationByHubQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      appId: // value for 'appId'
 *   },
 * });
 */
export function useApplicationByHubQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ApplicationByHubQuery, SchemaTypes.ApplicationByHubQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ApplicationByHubQuery, SchemaTypes.ApplicationByHubQueryVariables>(
    ApplicationByHubDocument,
    options
  );
}
export function useApplicationByHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ApplicationByHubQuery,
    SchemaTypes.ApplicationByHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ApplicationByHubQuery, SchemaTypes.ApplicationByHubQueryVariables>(
    ApplicationByHubDocument,
    options
  );
}
export type ApplicationByHubQueryHookResult = ReturnType<typeof useApplicationByHubQuery>;
export type ApplicationByHubLazyQueryHookResult = ReturnType<typeof useApplicationByHubLazyQuery>;
export type ApplicationByHubQueryResult = Apollo.QueryResult<
  SchemaTypes.ApplicationByHubQuery,
  SchemaTypes.ApplicationByHubQueryVariables
>;
export function refetchApplicationByHubQuery(variables: SchemaTypes.ApplicationByHubQueryVariables) {
  return { query: ApplicationByHubDocument, variables: variables };
}
export const ChallengeApplicationDocument = gql`
  query challengeApplication($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeApplicationQuery(variables: SchemaTypes.ChallengeApplicationQueryVariables) {
  return { query: ChallengeApplicationDocument, variables: variables };
}
export const ChallengeApplicationsDocument = gql`
  query challengeApplications($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeApplicationsQuery(variables: SchemaTypes.ChallengeApplicationsQueryVariables) {
  return { query: ChallengeApplicationsDocument, variables: variables };
}
export const HubApplicationDocument = gql`
  query hubApplication($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      displayName
      context {
        tagline
        visuals {
          ...VisualUri
        }
      }
      community {
        id
        displayName
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useHubApplicationQuery__
 *
 * To run a query within a React component, call `useHubApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubApplicationQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubApplicationQuery, SchemaTypes.HubApplicationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubApplicationQuery, SchemaTypes.HubApplicationQueryVariables>(
    HubApplicationDocument,
    options
  );
}
export function useHubApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubApplicationQuery, SchemaTypes.HubApplicationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubApplicationQuery, SchemaTypes.HubApplicationQueryVariables>(
    HubApplicationDocument,
    options
  );
}
export type HubApplicationQueryHookResult = ReturnType<typeof useHubApplicationQuery>;
export type HubApplicationLazyQueryHookResult = ReturnType<typeof useHubApplicationLazyQuery>;
export type HubApplicationQueryResult = Apollo.QueryResult<
  SchemaTypes.HubApplicationQuery,
  SchemaTypes.HubApplicationQueryVariables
>;
export function refetchHubApplicationQuery(variables: SchemaTypes.HubApplicationQueryVariables) {
  return { query: HubApplicationDocument, variables: variables };
}
export const HubApplicationsDocument = gql`
  query hubApplications($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubApplicationsQuery__
 *
 * To run a query within a React component, call `useHubApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubApplicationsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubApplicationsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubApplicationsQuery, SchemaTypes.HubApplicationsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubApplicationsQuery, SchemaTypes.HubApplicationsQueryVariables>(
    HubApplicationsDocument,
    options
  );
}
export function useHubApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubApplicationsQuery, SchemaTypes.HubApplicationsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubApplicationsQuery, SchemaTypes.HubApplicationsQueryVariables>(
    HubApplicationsDocument,
    options
  );
}
export type HubApplicationsQueryHookResult = ReturnType<typeof useHubApplicationsQuery>;
export type HubApplicationsLazyQueryHookResult = ReturnType<typeof useHubApplicationsLazyQuery>;
export type HubApplicationsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubApplicationsQuery,
  SchemaTypes.HubApplicationsQueryVariables
>;
export function refetchHubApplicationsQuery(variables: SchemaTypes.HubApplicationsQueryVariables) {
  return { query: HubApplicationsDocument, variables: variables };
}
export const HubNameIdDocument = gql`
  query hubNameId($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      nameID
    }
  }
`;

/**
 * __useHubNameIdQuery__
 *
 * To run a query within a React component, call `useHubNameIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubNameIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubNameIdQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubNameIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubNameIdQuery, SchemaTypes.HubNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubNameIdQuery, SchemaTypes.HubNameIdQueryVariables>(HubNameIdDocument, options);
}
export function useHubNameIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubNameIdQuery, SchemaTypes.HubNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubNameIdQuery, SchemaTypes.HubNameIdQueryVariables>(
    HubNameIdDocument,
    options
  );
}
export type HubNameIdQueryHookResult = ReturnType<typeof useHubNameIdQuery>;
export type HubNameIdLazyQueryHookResult = ReturnType<typeof useHubNameIdLazyQuery>;
export type HubNameIdQueryResult = Apollo.QueryResult<SchemaTypes.HubNameIdQuery, SchemaTypes.HubNameIdQueryVariables>;
export function refetchHubNameIdQuery(variables: SchemaTypes.HubNameIdQueryVariables) {
  return { query: HubNameIdDocument, variables: variables };
}
export const ChallengeNameIdDocument = gql`
  query challengeNameId($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeNameIdQuery(variables: SchemaTypes.ChallengeNameIdQueryVariables) {
  return { query: ChallengeNameIdDocument, variables: variables };
}
export const OpportunityNameIdDocument = gql`
  query opportunityNameId($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityNameIdQuery(variables: SchemaTypes.OpportunityNameIdQueryVariables) {
  return { query: OpportunityNameIdDocument, variables: variables };
}
export const ChallengeCardDocument = gql`
  query challengeCard($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeCardQuery(variables: SchemaTypes.ChallengeCardQueryVariables) {
  return { query: ChallengeCardDocument, variables: variables };
}
export const ChallengeCardsDocument = gql`
  query challengeCards($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeCardsQuery(variables: SchemaTypes.ChallengeCardsQueryVariables) {
  return { query: ChallengeCardsDocument, variables: variables };
}
export const HubCardDocument = gql`
  query hubCard($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      ...HubDetailsProvider
    }
  }
  ${HubDetailsProviderFragmentDoc}
`;

/**
 * __useHubCardQuery__
 *
 * To run a query within a React component, call `useHubCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCardQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCardQuery, SchemaTypes.HubCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCardQuery, SchemaTypes.HubCardQueryVariables>(HubCardDocument, options);
}
export function useHubCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubCardQuery, SchemaTypes.HubCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCardQuery, SchemaTypes.HubCardQueryVariables>(HubCardDocument, options);
}
export type HubCardQueryHookResult = ReturnType<typeof useHubCardQuery>;
export type HubCardLazyQueryHookResult = ReturnType<typeof useHubCardLazyQuery>;
export type HubCardQueryResult = Apollo.QueryResult<SchemaTypes.HubCardQuery, SchemaTypes.HubCardQueryVariables>;
export function refetchHubCardQuery(variables: SchemaTypes.HubCardQueryVariables) {
  return { query: HubCardDocument, variables: variables };
}
export const UserCardDocument = gql`
  query userCard($id: UUID_NAMEID_EMAIL!) {
    user(ID: $id) {
      ...UserCard
    }
  }
  ${UserCardFragmentDoc}
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
export function refetchUserCardQuery(variables: SchemaTypes.UserCardQueryVariables) {
  return { query: UserCardDocument, variables: variables };
}
export const ChallengeInfoDocument = gql`
  query challengeInfo($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeInfoQuery(variables: SchemaTypes.ChallengeInfoQueryVariables) {
  return { query: ChallengeInfoDocument, variables: variables };
}
export const ChallengeActivityDocument = gql`
  query challengeActivity($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeActivityQuery(variables: SchemaTypes.ChallengeActivityQueryVariables) {
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
  query challengeGroups($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeGroupsQuery(variables: SchemaTypes.ChallengeGroupsQueryVariables) {
  return { query: ChallengeGroupsDocument, variables: variables };
}
export const ChallengeLeadOrganizationsDocument = gql`
  query challengeLeadOrganizations($hubId: UUID_NAMEID!, $challengeID: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  variables: SchemaTypes.ChallengeLeadOrganizationsQueryVariables
) {
  return { query: ChallengeLeadOrganizationsDocument, variables: variables };
}
export const ChallengeLifecycleDocument = gql`
  query challengeLifecycle($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeLifecycleQuery(variables: SchemaTypes.ChallengeLifecycleQueryVariables) {
  return { query: ChallengeLifecycleDocument, variables: variables };
}
export const ChallengeMembersDocument = gql`
  query challengeMembers($hubId: UUID_NAMEID!, $challengeID: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeMembersQuery(variables: SchemaTypes.ChallengeMembersQueryVariables) {
  return { query: ChallengeMembersDocument, variables: variables };
}
export const ChallengeNameDocument = gql`
  query challengeName($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeNameQuery(variables: SchemaTypes.ChallengeNameQueryVariables) {
  return { query: ChallengeNameDocument, variables: variables };
}
export const ChallengeProfileInfoDocument = gql`
  query challengeProfileInfo($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          visuals {
            ...VisualFull
          }
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeProfileInfoQuery(variables: SchemaTypes.ChallengeProfileInfoQueryVariables) {
  return { query: ChallengeProfileInfoDocument, variables: variables };
}
export const ChallengeUserIdsDocument = gql`
  query challengeUserIds($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeUserIdsQuery(variables: SchemaTypes.ChallengeUserIdsQueryVariables) {
  return { query: ChallengeUserIdsDocument, variables: variables };
}
export const ChallengesDocument = gql`
  query challenges($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          visuals {
            ...VisualUri
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengesQuery(variables: SchemaTypes.ChallengesQueryVariables) {
  return { query: ChallengesDocument, variables: variables };
}
export const AllCommunitiesDocument = gql`
  query allCommunities($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchAllCommunitiesQuery(variables: SchemaTypes.AllCommunitiesQueryVariables) {
  return { query: AllCommunitiesDocument, variables: variables };
}
export const ChallengeCommunityDocument = gql`
  query challengeCommunity($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeCommunityQuery(variables: SchemaTypes.ChallengeCommunityQueryVariables) {
  return { query: ChallengeCommunityDocument, variables: variables };
}
export const ChallengesWithCommunityDocument = gql`
  query challengesWithCommunity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengesWithCommunityQuery(variables: SchemaTypes.ChallengesWithCommunityQueryVariables) {
  return { query: ChallengesWithCommunityDocument, variables: variables };
}
export const HubCommunityDocument = gql`
  query hubCommunity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      community {
        ...CommunityDetails
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useHubCommunityQuery__
 *
 * To run a query within a React component, call `useHubCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCommunityQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCommunityQuery, SchemaTypes.HubCommunityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCommunityQuery, SchemaTypes.HubCommunityQueryVariables>(
    HubCommunityDocument,
    options
  );
}
export function useHubCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubCommunityQuery, SchemaTypes.HubCommunityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCommunityQuery, SchemaTypes.HubCommunityQueryVariables>(
    HubCommunityDocument,
    options
  );
}
export type HubCommunityQueryHookResult = ReturnType<typeof useHubCommunityQuery>;
export type HubCommunityLazyQueryHookResult = ReturnType<typeof useHubCommunityLazyQuery>;
export type HubCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCommunityQuery,
  SchemaTypes.HubCommunityQueryVariables
>;
export function refetchHubCommunityQuery(variables: SchemaTypes.HubCommunityQueryVariables) {
  return { query: HubCommunityDocument, variables: variables };
}
export const CommunityMessagesDocument = gql`
  query communityMessages($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
      id
      community(ID: $communityId) {
        ...CommunityMessages
      }
    }
  }
  ${CommunityMessagesFragmentDoc}
`;

/**
 * __useCommunityMessagesQuery__
 *
 * To run a query within a React component, call `useCommunityMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityMessagesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityMessagesQuery, SchemaTypes.CommunityMessagesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityMessagesQuery, SchemaTypes.CommunityMessagesQueryVariables>(
    CommunityMessagesDocument,
    options
  );
}
export function useCommunityMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityMessagesQuery,
    SchemaTypes.CommunityMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityMessagesQuery, SchemaTypes.CommunityMessagesQueryVariables>(
    CommunityMessagesDocument,
    options
  );
}
export type CommunityMessagesQueryHookResult = ReturnType<typeof useCommunityMessagesQuery>;
export type CommunityMessagesLazyQueryHookResult = ReturnType<typeof useCommunityMessagesLazyQuery>;
export type CommunityMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityMessagesQuery,
  SchemaTypes.CommunityMessagesQueryVariables
>;
export function refetchCommunityMessagesQuery(variables: SchemaTypes.CommunityMessagesQueryVariables) {
  return { query: CommunityMessagesDocument, variables: variables };
}
export const OpportunityCommunityDocument = gql`
  query opportunityCommunity($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityCommunityQuery(variables: SchemaTypes.OpportunityCommunityQueryVariables) {
  return { query: OpportunityCommunityDocument, variables: variables };
}
export const CommunityGroupsDocument = gql`
  query communityGroups($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityGroupsQuery(variables: SchemaTypes.CommunityGroupsQueryVariables) {
  return { query: CommunityGroupsDocument, variables: variables };
}
export const CommunityMembersDocument = gql`
  query communityMembers($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityMembersQuery(variables: SchemaTypes.CommunityMembersQueryVariables) {
  return { query: CommunityMembersDocument, variables: variables };
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
  query groupMembers($hubId: UUID_NAMEID!, $groupId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchGroupMembersQuery(variables: SchemaTypes.GroupMembersQueryVariables) {
  return { query: GroupMembersDocument, variables: variables };
}
export const HubProviderDocument = gql`
  query hubProvider($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      ...HubInfo
    }
  }
  ${HubInfoFragmentDoc}
`;

/**
 * __useHubProviderQuery__
 *
 * To run a query within a React component, call `useHubProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubProviderQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubProviderQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubProviderQuery, SchemaTypes.HubProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubProviderQuery, SchemaTypes.HubProviderQueryVariables>(
    HubProviderDocument,
    options
  );
}
export function useHubProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubProviderQuery, SchemaTypes.HubProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubProviderQuery, SchemaTypes.HubProviderQueryVariables>(
    HubProviderDocument,
    options
  );
}
export type HubProviderQueryHookResult = ReturnType<typeof useHubProviderQuery>;
export type HubProviderLazyQueryHookResult = ReturnType<typeof useHubProviderLazyQuery>;
export type HubProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.HubProviderQuery,
  SchemaTypes.HubProviderQueryVariables
>;
export function refetchHubProviderQuery(variables: SchemaTypes.HubProviderQueryVariables) {
  return { query: HubProviderDocument, variables: variables };
}
export const HubActivityDocument = gql`
  query hubActivity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      activity {
        name
        value
      }
    }
  }
`;

/**
 * __useHubActivityQuery__
 *
 * To run a query within a React component, call `useHubActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubActivityQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubActivityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubActivityQuery, SchemaTypes.HubActivityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubActivityQuery, SchemaTypes.HubActivityQueryVariables>(
    HubActivityDocument,
    options
  );
}
export function useHubActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubActivityQuery, SchemaTypes.HubActivityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubActivityQuery, SchemaTypes.HubActivityQueryVariables>(
    HubActivityDocument,
    options
  );
}
export type HubActivityQueryHookResult = ReturnType<typeof useHubActivityQuery>;
export type HubActivityLazyQueryHookResult = ReturnType<typeof useHubActivityLazyQuery>;
export type HubActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.HubActivityQuery,
  SchemaTypes.HubActivityQueryVariables
>;
export function refetchHubActivityQuery(variables: SchemaTypes.HubActivityQueryVariables) {
  return { query: HubActivityDocument, variables: variables };
}
export const HubApplicationTemplateDocument = gql`
  query hubApplicationTemplate {
    configuration {
      template {
        hubs {
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
 * __useHubApplicationTemplateQuery__
 *
 * To run a query within a React component, call `useHubApplicationTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubApplicationTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubApplicationTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useHubApplicationTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.HubApplicationTemplateQuery,
    SchemaTypes.HubApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubApplicationTemplateQuery, SchemaTypes.HubApplicationTemplateQueryVariables>(
    HubApplicationTemplateDocument,
    options
  );
}
export function useHubApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubApplicationTemplateQuery,
    SchemaTypes.HubApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubApplicationTemplateQuery, SchemaTypes.HubApplicationTemplateQueryVariables>(
    HubApplicationTemplateDocument,
    options
  );
}
export type HubApplicationTemplateQueryHookResult = ReturnType<typeof useHubApplicationTemplateQuery>;
export type HubApplicationTemplateLazyQueryHookResult = ReturnType<typeof useHubApplicationTemplateLazyQuery>;
export type HubApplicationTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.HubApplicationTemplateQuery,
  SchemaTypes.HubApplicationTemplateQueryVariables
>;
export function refetchHubApplicationTemplateQuery(variables?: SchemaTypes.HubApplicationTemplateQueryVariables) {
  return { query: HubApplicationTemplateDocument, variables: variables };
}
export const HubGroupDocument = gql`
  query hubGroup($hubId: UUID_NAMEID!, $groupId: UUID!) {
    hub(ID: $hubId) {
      id
      group(ID: $groupId) {
        ...GroupInfo
      }
    }
  }
  ${GroupInfoFragmentDoc}
`;

/**
 * __useHubGroupQuery__
 *
 * To run a query within a React component, call `useHubGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubGroupQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useHubGroupQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubGroupQuery, SchemaTypes.HubGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubGroupQuery, SchemaTypes.HubGroupQueryVariables>(HubGroupDocument, options);
}
export function useHubGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubGroupQuery, SchemaTypes.HubGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubGroupQuery, SchemaTypes.HubGroupQueryVariables>(HubGroupDocument, options);
}
export type HubGroupQueryHookResult = ReturnType<typeof useHubGroupQuery>;
export type HubGroupLazyQueryHookResult = ReturnType<typeof useHubGroupLazyQuery>;
export type HubGroupQueryResult = Apollo.QueryResult<SchemaTypes.HubGroupQuery, SchemaTypes.HubGroupQueryVariables>;
export function refetchHubGroupQuery(variables: SchemaTypes.HubGroupQueryVariables) {
  return { query: HubGroupDocument, variables: variables };
}
export const HubGroupsListDocument = gql`
  query hubGroupsList($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useHubGroupsListQuery__
 *
 * To run a query within a React component, call `useHubGroupsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubGroupsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubGroupsListQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubGroupsListQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubGroupsListQuery, SchemaTypes.HubGroupsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubGroupsListQuery, SchemaTypes.HubGroupsListQueryVariables>(
    HubGroupsListDocument,
    options
  );
}
export function useHubGroupsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubGroupsListQuery, SchemaTypes.HubGroupsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubGroupsListQuery, SchemaTypes.HubGroupsListQueryVariables>(
    HubGroupsListDocument,
    options
  );
}
export type HubGroupsListQueryHookResult = ReturnType<typeof useHubGroupsListQuery>;
export type HubGroupsListLazyQueryHookResult = ReturnType<typeof useHubGroupsListLazyQuery>;
export type HubGroupsListQueryResult = Apollo.QueryResult<
  SchemaTypes.HubGroupsListQuery,
  SchemaTypes.HubGroupsListQueryVariables
>;
export function refetchHubGroupsListQuery(variables: SchemaTypes.HubGroupsListQueryVariables) {
  return { query: HubGroupsListDocument, variables: variables };
}
export const HubHostReferencesDocument = gql`
  query hubHostReferences($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubHostReferencesQuery__
 *
 * To run a query within a React component, call `useHubHostReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubHostReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubHostReferencesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubHostReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubHostReferencesQuery, SchemaTypes.HubHostReferencesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubHostReferencesQuery, SchemaTypes.HubHostReferencesQueryVariables>(
    HubHostReferencesDocument,
    options
  );
}
export function useHubHostReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubHostReferencesQuery,
    SchemaTypes.HubHostReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubHostReferencesQuery, SchemaTypes.HubHostReferencesQueryVariables>(
    HubHostReferencesDocument,
    options
  );
}
export type HubHostReferencesQueryHookResult = ReturnType<typeof useHubHostReferencesQuery>;
export type HubHostReferencesLazyQueryHookResult = ReturnType<typeof useHubHostReferencesLazyQuery>;
export type HubHostReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubHostReferencesQuery,
  SchemaTypes.HubHostReferencesQueryVariables
>;
export function refetchHubHostReferencesQuery(variables: SchemaTypes.HubHostReferencesQueryVariables) {
  return { query: HubHostReferencesDocument, variables: variables };
}
export const HubMembersDocument = gql`
  query hubMembers($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubMembersQuery__
 *
 * To run a query within a React component, call `useHubMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubMembersQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubMembersQuery, SchemaTypes.HubMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubMembersQuery, SchemaTypes.HubMembersQueryVariables>(
    HubMembersDocument,
    options
  );
}
export function useHubMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubMembersQuery, SchemaTypes.HubMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubMembersQuery, SchemaTypes.HubMembersQueryVariables>(
    HubMembersDocument,
    options
  );
}
export type HubMembersQueryHookResult = ReturnType<typeof useHubMembersQuery>;
export type HubMembersLazyQueryHookResult = ReturnType<typeof useHubMembersLazyQuery>;
export type HubMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.HubMembersQuery,
  SchemaTypes.HubMembersQueryVariables
>;
export function refetchHubMembersQuery(variables: SchemaTypes.HubMembersQueryVariables) {
  return { query: HubMembersDocument, variables: variables };
}
export const HubNameDocument = gql`
  query hubName($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      ...HubName
    }
  }
  ${HubNameFragmentDoc}
`;

/**
 * __useHubNameQuery__
 *
 * To run a query within a React component, call `useHubNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubNameQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubNameQuery, SchemaTypes.HubNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubNameQuery, SchemaTypes.HubNameQueryVariables>(HubNameDocument, options);
}
export function useHubNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubNameQuery, SchemaTypes.HubNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubNameQuery, SchemaTypes.HubNameQueryVariables>(HubNameDocument, options);
}
export type HubNameQueryHookResult = ReturnType<typeof useHubNameQuery>;
export type HubNameLazyQueryHookResult = ReturnType<typeof useHubNameLazyQuery>;
export type HubNameQueryResult = Apollo.QueryResult<SchemaTypes.HubNameQuery, SchemaTypes.HubNameQueryVariables>;
export function refetchHubNameQuery(variables: SchemaTypes.HubNameQueryVariables) {
  return { query: HubNameDocument, variables: variables };
}
export const HubUserIdsDocument = gql`
  query hubUserIds($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubUserIdsQuery__
 *
 * To run a query within a React component, call `useHubUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubUserIdsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubUserIdsQuery, SchemaTypes.HubUserIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubUserIdsQuery, SchemaTypes.HubUserIdsQueryVariables>(
    HubUserIdsDocument,
    options
  );
}
export function useHubUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubUserIdsQuery, SchemaTypes.HubUserIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubUserIdsQuery, SchemaTypes.HubUserIdsQueryVariables>(
    HubUserIdsDocument,
    options
  );
}
export type HubUserIdsQueryHookResult = ReturnType<typeof useHubUserIdsQuery>;
export type HubUserIdsLazyQueryHookResult = ReturnType<typeof useHubUserIdsLazyQuery>;
export type HubUserIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubUserIdsQuery,
  SchemaTypes.HubUserIdsQueryVariables
>;
export function refetchHubUserIdsQuery(variables: SchemaTypes.HubUserIdsQueryVariables) {
  return { query: HubUserIdsDocument, variables: variables };
}
export const HubVisualDocument = gql`
  query hubVisual($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      context {
        visuals {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useHubVisualQuery__
 *
 * To run a query within a React component, call `useHubVisualQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubVisualQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubVisualQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubVisualQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubVisualQuery, SchemaTypes.HubVisualQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubVisualQuery, SchemaTypes.HubVisualQueryVariables>(HubVisualDocument, options);
}
export function useHubVisualLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubVisualQuery, SchemaTypes.HubVisualQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubVisualQuery, SchemaTypes.HubVisualQueryVariables>(
    HubVisualDocument,
    options
  );
}
export type HubVisualQueryHookResult = ReturnType<typeof useHubVisualQuery>;
export type HubVisualLazyQueryHookResult = ReturnType<typeof useHubVisualLazyQuery>;
export type HubVisualQueryResult = Apollo.QueryResult<SchemaTypes.HubVisualQuery, SchemaTypes.HubVisualQueryVariables>;
export function refetchHubVisualQuery(variables: SchemaTypes.HubVisualQueryVariables) {
  return { query: HubVisualDocument, variables: variables };
}
export const HubsDocument = gql`
  query hubs {
    hubs {
      ...HubDetailsProvider
    }
  }
  ${HubDetailsProviderFragmentDoc}
`;

/**
 * __useHubsQuery__
 *
 * To run a query within a React component, call `useHubsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubsQuery({
 *   variables: {
 *   },
 * });
 */
export function useHubsQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.HubsQuery, SchemaTypes.HubsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubsQuery, SchemaTypes.HubsQueryVariables>(HubsDocument, options);
}
export function useHubsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubsQuery, SchemaTypes.HubsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubsQuery, SchemaTypes.HubsQueryVariables>(HubsDocument, options);
}
export type HubsQueryHookResult = ReturnType<typeof useHubsQuery>;
export type HubsLazyQueryHookResult = ReturnType<typeof useHubsLazyQuery>;
export type HubsQueryResult = Apollo.QueryResult<SchemaTypes.HubsQuery, SchemaTypes.HubsQueryVariables>;
export function refetchHubsQuery(variables?: SchemaTypes.HubsQueryVariables) {
  return { query: HubsDocument, variables: variables };
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
      hubsHosting {
        id
        nameID
        displayName
      }
      challengesLeading {
        id
        nameID
        displayName
        hubID
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
export function refetchMembershipOrganizationQuery(variables: SchemaTypes.MembershipOrganizationQueryVariables) {
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
export function refetchMembershipUserQuery(variables: SchemaTypes.MembershipUserQueryVariables) {
  return { query: MembershipUserDocument, variables: variables };
}
export const OpportunitiesDocument = gql`
  query opportunities($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunitiesQuery(variables: SchemaTypes.OpportunitiesQueryVariables) {
  return { query: OpportunitiesDocument, variables: variables };
}
export const OpportunityActivityDocument = gql`
  query opportunityActivity($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityActivityQuery(variables: SchemaTypes.OpportunityActivityQueryVariables) {
  return { query: OpportunityActivityDocument, variables: variables };
}
export const OpportunityActorGroupsDocument = gql`
  query opportunityActorGroups($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityActorGroupsQuery(variables: SchemaTypes.OpportunityActorGroupsQueryVariables) {
  return { query: OpportunityActorGroupsDocument, variables: variables };
}
export const OpportunityAspectsOldDocument = gql`
  query opportunityAspectsOld($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      opportunity(ID: $opportunityId) {
        id
        context {
          id
          aspects {
            id
            displayName
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityAspectsOldQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectsOldQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectsOldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectsOldQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityAspectsOldQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAspectsOldQuery,
    SchemaTypes.OpportunityAspectsOldQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityAspectsOldQuery, SchemaTypes.OpportunityAspectsOldQueryVariables>(
    OpportunityAspectsOldDocument,
    options
  );
}
export function useOpportunityAspectsOldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectsOldQuery,
    SchemaTypes.OpportunityAspectsOldQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityAspectsOldQuery, SchemaTypes.OpportunityAspectsOldQueryVariables>(
    OpportunityAspectsOldDocument,
    options
  );
}
export type OpportunityAspectsOldQueryHookResult = ReturnType<typeof useOpportunityAspectsOldQuery>;
export type OpportunityAspectsOldLazyQueryHookResult = ReturnType<typeof useOpportunityAspectsOldLazyQuery>;
export type OpportunityAspectsOldQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAspectsOldQuery,
  SchemaTypes.OpportunityAspectsOldQueryVariables
>;
export function refetchOpportunityAspectsOldQuery(variables: SchemaTypes.OpportunityAspectsOldQueryVariables) {
  return { query: OpportunityAspectsOldDocument, variables: variables };
}
export const OpportunityEcosystemDetailsDocument = gql`
  query opportunityEcosystemDetails($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  variables: SchemaTypes.OpportunityEcosystemDetailsQueryVariables
) {
  return { query: OpportunityEcosystemDetailsDocument, variables: variables };
}
export const OpportunityGroupsDocument = gql`
  query opportunityGroups($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityGroupsQuery(variables: SchemaTypes.OpportunityGroupsQueryVariables) {
  return { query: OpportunityGroupsDocument, variables: variables };
}
export const OpportunityLifecycleDocument = gql`
  query opportunityLifecycle($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityLifecycleQuery(variables: SchemaTypes.OpportunityLifecycleQueryVariables) {
  return { query: OpportunityLifecycleDocument, variables: variables };
}
export const OpportunityNameDocument = gql`
  query opportunityName($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityNameQuery(variables: SchemaTypes.OpportunityNameQueryVariables) {
  return { query: OpportunityNameDocument, variables: variables };
}
export const OpportunityProfileInfoDocument = gql`
  query opportunityProfileInfo($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityProfileInfoQuery(variables: SchemaTypes.OpportunityProfileInfoQueryVariables) {
  return { query: OpportunityProfileInfoDocument, variables: variables };
}
export const OpportunityRelationsDocument = gql`
  query opportunityRelations($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityRelationsQuery(variables: SchemaTypes.OpportunityRelationsQueryVariables) {
  return { query: OpportunityRelationsDocument, variables: variables };
}
export const OpportunityUserIdsDocument = gql`
  query opportunityUserIds($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityUserIdsQuery(variables: SchemaTypes.OpportunityUserIdsQueryVariables) {
  return { query: OpportunityUserIdsDocument, variables: variables };
}
export const OpportunityWithActivityDocument = gql`
  query opportunityWithActivity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          visuals {
            ...VisualUri
          }
        }
        tagset {
          name
          tags
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityWithActivityQuery(variables: SchemaTypes.OpportunityWithActivityQueryVariables) {
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
export function refetchOrganizationGroupQuery(variables: SchemaTypes.OrganizationGroupQueryVariables) {
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
export function refetchOrganizationInfoQuery(variables: SchemaTypes.OrganizationInfoQueryVariables) {
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
        avatar {
          ...VisualUri
        }
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
  ${VisualUriFragmentDoc}
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
export function refetchOrganizationDetailsQuery(variables: SchemaTypes.OrganizationDetailsQueryVariables) {
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
export function refetchOrganizationGroupsQuery(variables: SchemaTypes.OrganizationGroupsQueryVariables) {
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
export function refetchOrganizationNameQuery(variables: SchemaTypes.OrganizationNameQueryVariables) {
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
export function refetchOrganizationProfileInfoQuery(variables: SchemaTypes.OrganizationProfileInfoQueryVariables) {
  return { query: OrganizationProfileInfoDocument, variables: variables };
}
export const OrganizationsListDocument = gql`
  query organizationsList($limit: Float, $shuffle: Boolean) {
    organizations(limit: $limit, shuffle: $shuffle) {
      id
      nameID
      displayName
      profile {
        id
        avatar {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      limit: // value for 'limit'
 *      shuffle: // value for 'shuffle'
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
  query projectProfile($hubId: UUID_NAMEID!, $projectId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchProjectProfileQuery(variables: SchemaTypes.ProjectProfileQueryVariables) {
  return { query: ProjectProfileDocument, variables: variables };
}
export const ProjectsDocument = gql`
  query projects($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchProjectsQuery(variables: SchemaTypes.ProjectsQueryVariables) {
  return { query: ProjectsDocument, variables: variables };
}
export const ProjectsChainHistoryDocument = gql`
  query projectsChainHistory($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchProjectsChainHistoryQuery(variables: SchemaTypes.ProjectsChainHistoryQueryVariables) {
  return { query: ProjectsChainHistoryDocument, variables: variables };
}
export const RelationsDocument = gql`
  query relations($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchRelationsQuery(variables: SchemaTypes.RelationsQueryVariables) {
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
export function refetchSearchQuery(variables: SchemaTypes.SearchQueryVariables) {
  return { query: SearchDocument, variables: variables };
}
export const ServerMetadataDocument = gql`
  query serverMetadata {
    metadata {
      activity {
        id
        name
        value
      }
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
        hubID
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
export function refetchUserApplicationDetailsQuery(variables: SchemaTypes.UserApplicationDetailsQueryVariables) {
  return { query: UserApplicationDetailsDocument, variables: variables };
}
export const UserProfileApplicationsDocument = gql`
  query userProfileApplications($input: MembershipUserInput!) {
    membershipUser(membershipData: $input) {
      applications {
        id
        state
        displayName
        hubID
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
export function refetchUserProfileApplicationsQuery(variables: SchemaTypes.UserProfileApplicationsQueryVariables) {
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
  variables: SchemaTypes.UserNotificationsPreferencesQueryVariables
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
export function refetchUserQuery(variables: SchemaTypes.UserQueryVariables) {
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
        hubID
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
export function refetchUserApplicationsQuery(variables: SchemaTypes.UserApplicationsQueryVariables) {
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
        avatar {
          ...VisualUri
        }
        tagsets {
          id
          name
          tags
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
export function refetchUserAvatarsQuery(variables: SchemaTypes.UserAvatarsQueryVariables) {
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
    authorization {
      ...MyPrivileges
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
  ${UserMembershipDetailsFragmentDoc}
  ${MyPrivilegesFragmentDoc}
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
export function refetchUserProfileQuery(variables: SchemaTypes.UserProfileQueryVariables) {
  return { query: UserProfileDocument, variables: variables };
}
export const UsersDocument = gql`
  query users($limit: Float, $shuffle: Boolean) {
    users(limit: $limit, shuffle: $shuffle) {
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
 *      limit: // value for 'limit'
 *      shuffle: // value for 'shuffle'
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
        avatar {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
export function refetchUsersWithCredentialsQuery(variables: SchemaTypes.UsersWithCredentialsQueryVariables) {
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
  variables: SchemaTypes.UsersWithCredentialsSimpleListQueryVariables
) {
  return { query: UsersWithCredentialsSimpleListDocument, variables: variables };
}
export const HubContributionDetailsDocument = gql`
  query hubContributionDetails($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
        visuals {
          ...VisualUri
        }
      }
      community {
        id
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useHubContributionDetailsQuery__
 *
 * To run a query within a React component, call `useHubContributionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubContributionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubContributionDetailsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubContributionDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubContributionDetailsQuery,
    SchemaTypes.HubContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubContributionDetailsQuery, SchemaTypes.HubContributionDetailsQueryVariables>(
    HubContributionDetailsDocument,
    options
  );
}
export function useHubContributionDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubContributionDetailsQuery,
    SchemaTypes.HubContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubContributionDetailsQuery, SchemaTypes.HubContributionDetailsQueryVariables>(
    HubContributionDetailsDocument,
    options
  );
}
export type HubContributionDetailsQueryHookResult = ReturnType<typeof useHubContributionDetailsQuery>;
export type HubContributionDetailsLazyQueryHookResult = ReturnType<typeof useHubContributionDetailsLazyQuery>;
export type HubContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubContributionDetailsQuery,
  SchemaTypes.HubContributionDetailsQueryVariables
>;
export function refetchHubContributionDetailsQuery(variables: SchemaTypes.HubContributionDetailsQueryVariables) {
  return { query: HubContributionDetailsDocument, variables: variables };
}
export const ChallengeContributionDetailsDocument = gql`
  query challengeContributionDetails($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          visuals {
            ...VisualUri
          }
        }
        community {
          id
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
  variables: SchemaTypes.ChallengeContributionDetailsQueryVariables
) {
  return { query: ChallengeContributionDetailsDocument, variables: variables };
}
export const OpportunityContributionDetailsDocument = gql`
  query opportunityContributionDetails($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          visuals {
            ...VisualUri
          }
        }
        community {
          id
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
  variables: SchemaTypes.OpportunityContributionDetailsQueryVariables
) {
  return { query: OpportunityContributionDetailsDocument, variables: variables };
}
export const ContributorsSearchDocument = gql`
  query ContributorsSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      result {
        ...UserContributor
        ...OrganizationContributor
      }
    }
  }
  ${UserContributorFragmentDoc}
  ${OrganizationContributorFragmentDoc}
`;

/**
 * __useContributorsSearchQuery__
 *
 * To run a query within a React component, call `useContributorsSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorsSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorsSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useContributorsSearchQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsSearchQuery,
    SchemaTypes.ContributorsSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContributorsSearchQuery, SchemaTypes.ContributorsSearchQueryVariables>(
    ContributorsSearchDocument,
    options
  );
}
export function useContributorsSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributorsSearchQuery,
    SchemaTypes.ContributorsSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContributorsSearchQuery, SchemaTypes.ContributorsSearchQueryVariables>(
    ContributorsSearchDocument,
    options
  );
}
export type ContributorsSearchQueryHookResult = ReturnType<typeof useContributorsSearchQuery>;
export type ContributorsSearchLazyQueryHookResult = ReturnType<typeof useContributorsSearchLazyQuery>;
export type ContributorsSearchQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorsSearchQuery,
  SchemaTypes.ContributorsSearchQueryVariables
>;
export function refetchContributorsSearchQuery(variables: SchemaTypes.ContributorsSearchQueryVariables) {
  return { query: ContributorsSearchDocument, variables: variables };
}
export const HubAspectDocument = gql`
  query HubAspect($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      context {
        ...AspectDashboardData
      }
    }
  }
  ${AspectDashboardDataFragmentDoc}
`;

/**
 * __useHubAspectQuery__
 *
 * To run a query within a React component, call `useHubAspectQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubAspectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubAspectQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useHubAspectQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubAspectQuery, SchemaTypes.HubAspectQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubAspectQuery, SchemaTypes.HubAspectQueryVariables>(HubAspectDocument, options);
}
export function useHubAspectLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubAspectQuery, SchemaTypes.HubAspectQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubAspectQuery, SchemaTypes.HubAspectQueryVariables>(
    HubAspectDocument,
    options
  );
}
export type HubAspectQueryHookResult = ReturnType<typeof useHubAspectQuery>;
export type HubAspectLazyQueryHookResult = ReturnType<typeof useHubAspectLazyQuery>;
export type HubAspectQueryResult = Apollo.QueryResult<SchemaTypes.HubAspectQuery, SchemaTypes.HubAspectQueryVariables>;
export function refetchHubAspectQuery(variables: SchemaTypes.HubAspectQueryVariables) {
  return { query: HubAspectDocument, variables: variables };
}
export const ChallengeAspectDocument = gql`
  query ChallengeAspect($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        context {
          ...AspectDashboardData
        }
      }
    }
  }
  ${AspectDashboardDataFragmentDoc}
`;

/**
 * __useChallengeAspectQuery__
 *
 * To run a query within a React component, call `useChallengeAspectQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeAspectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeAspectQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useChallengeAspectQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeAspectQuery, SchemaTypes.ChallengeAspectQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeAspectQuery, SchemaTypes.ChallengeAspectQueryVariables>(
    ChallengeAspectDocument,
    options
  );
}
export function useChallengeAspectLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengeAspectQuery, SchemaTypes.ChallengeAspectQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeAspectQuery, SchemaTypes.ChallengeAspectQueryVariables>(
    ChallengeAspectDocument,
    options
  );
}
export type ChallengeAspectQueryHookResult = ReturnType<typeof useChallengeAspectQuery>;
export type ChallengeAspectLazyQueryHookResult = ReturnType<typeof useChallengeAspectLazyQuery>;
export type ChallengeAspectQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeAspectQuery,
  SchemaTypes.ChallengeAspectQueryVariables
>;
export function refetchChallengeAspectQuery(variables: SchemaTypes.ChallengeAspectQueryVariables) {
  return { query: ChallengeAspectDocument, variables: variables };
}
export const OpportunityAspectDocument = gql`
  query OpportunityAspect($hubNameId: UUID_NAMEID!, $opportunityNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        context {
          ...AspectDashboardData
        }
      }
    }
  }
  ${AspectDashboardDataFragmentDoc}
`;

/**
 * __useOpportunityAspectQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useOpportunityAspectQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityAspectQuery, SchemaTypes.OpportunityAspectQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityAspectQuery, SchemaTypes.OpportunityAspectQueryVariables>(
    OpportunityAspectDocument,
    options
  );
}
export function useOpportunityAspectLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectQuery,
    SchemaTypes.OpportunityAspectQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityAspectQuery, SchemaTypes.OpportunityAspectQueryVariables>(
    OpportunityAspectDocument,
    options
  );
}
export type OpportunityAspectQueryHookResult = ReturnType<typeof useOpportunityAspectQuery>;
export type OpportunityAspectLazyQueryHookResult = ReturnType<typeof useOpportunityAspectLazyQuery>;
export type OpportunityAspectQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAspectQuery,
  SchemaTypes.OpportunityAspectQueryVariables
>;
export function refetchOpportunityAspectQuery(variables: SchemaTypes.OpportunityAspectQueryVariables) {
  return { query: OpportunityAspectDocument, variables: variables };
}
export const UpdateAspectDocument = gql`
  mutation updateAspect($input: UpdateAspectInput!) {
    updateAspect(aspectData: $input) {
      id
      description
      displayName
      tagset {
        id
        name
        tags
      }
      references {
        id
        name
        description
        name
        uri
      }
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
export const HubAspectSettingsDocument = gql`
  query HubAspectSettings($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      context {
        id
        aspects(IDs: [$aspectNameId]) {
          ...AspectSettings
        }
      }
    }
  }
  ${AspectSettingsFragmentDoc}
`;

/**
 * __useHubAspectSettingsQuery__
 *
 * To run a query within a React component, call `useHubAspectSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubAspectSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubAspectSettingsQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useHubAspectSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubAspectSettingsQuery, SchemaTypes.HubAspectSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubAspectSettingsQuery, SchemaTypes.HubAspectSettingsQueryVariables>(
    HubAspectSettingsDocument,
    options
  );
}
export function useHubAspectSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubAspectSettingsQuery,
    SchemaTypes.HubAspectSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubAspectSettingsQuery, SchemaTypes.HubAspectSettingsQueryVariables>(
    HubAspectSettingsDocument,
    options
  );
}
export type HubAspectSettingsQueryHookResult = ReturnType<typeof useHubAspectSettingsQuery>;
export type HubAspectSettingsLazyQueryHookResult = ReturnType<typeof useHubAspectSettingsLazyQuery>;
export type HubAspectSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubAspectSettingsQuery,
  SchemaTypes.HubAspectSettingsQueryVariables
>;
export function refetchHubAspectSettingsQuery(variables: SchemaTypes.HubAspectSettingsQueryVariables) {
  return { query: HubAspectSettingsDocument, variables: variables };
}
export const ChallengeAspectSettingsDocument = gql`
  query ChallengeAspectSettings($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        context {
          id
          aspects(IDs: [$aspectNameId]) {
            ...AspectSettings
          }
        }
      }
    }
  }
  ${AspectSettingsFragmentDoc}
`;

/**
 * __useChallengeAspectSettingsQuery__
 *
 * To run a query within a React component, call `useChallengeAspectSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeAspectSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeAspectSettingsQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useChallengeAspectSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeAspectSettingsQuery,
    SchemaTypes.ChallengeAspectSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeAspectSettingsQuery, SchemaTypes.ChallengeAspectSettingsQueryVariables>(
    ChallengeAspectSettingsDocument,
    options
  );
}
export function useChallengeAspectSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeAspectSettingsQuery,
    SchemaTypes.ChallengeAspectSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeAspectSettingsQuery,
    SchemaTypes.ChallengeAspectSettingsQueryVariables
  >(ChallengeAspectSettingsDocument, options);
}
export type ChallengeAspectSettingsQueryHookResult = ReturnType<typeof useChallengeAspectSettingsQuery>;
export type ChallengeAspectSettingsLazyQueryHookResult = ReturnType<typeof useChallengeAspectSettingsLazyQuery>;
export type ChallengeAspectSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeAspectSettingsQuery,
  SchemaTypes.ChallengeAspectSettingsQueryVariables
>;
export function refetchChallengeAspectSettingsQuery(variables: SchemaTypes.ChallengeAspectSettingsQueryVariables) {
  return { query: ChallengeAspectSettingsDocument, variables: variables };
}
export const OpportunityAspectSettingsDocument = gql`
  query OpportunityAspectSettings(
    $hubNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        context {
          id
          aspects(IDs: [$aspectNameId]) {
            ...AspectSettings
          }
        }
      }
    }
  }
  ${AspectSettingsFragmentDoc}
`;

/**
 * __useOpportunityAspectSettingsQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectSettingsQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useOpportunityAspectSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAspectSettingsQuery,
    SchemaTypes.OpportunityAspectSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityAspectSettingsQuery,
    SchemaTypes.OpportunityAspectSettingsQueryVariables
  >(OpportunityAspectSettingsDocument, options);
}
export function useOpportunityAspectSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectSettingsQuery,
    SchemaTypes.OpportunityAspectSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityAspectSettingsQuery,
    SchemaTypes.OpportunityAspectSettingsQueryVariables
  >(OpportunityAspectSettingsDocument, options);
}
export type OpportunityAspectSettingsQueryHookResult = ReturnType<typeof useOpportunityAspectSettingsQuery>;
export type OpportunityAspectSettingsLazyQueryHookResult = ReturnType<typeof useOpportunityAspectSettingsLazyQuery>;
export type OpportunityAspectSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAspectSettingsQuery,
  SchemaTypes.OpportunityAspectSettingsQueryVariables
>;
export function refetchOpportunityAspectSettingsQuery(variables: SchemaTypes.OpportunityAspectSettingsQueryVariables) {
  return { query: OpportunityAspectSettingsDocument, variables: variables };
}
export const HubCanvasesDocument = gql`
  query hubCanvases($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubCanvasesQuery__
 *
 * To run a query within a React component, call `useHubCanvasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCanvasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCanvasesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCanvasesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCanvasesQuery, SchemaTypes.HubCanvasesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCanvasesQuery, SchemaTypes.HubCanvasesQueryVariables>(
    HubCanvasesDocument,
    options
  );
}
export function useHubCanvasesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubCanvasesQuery, SchemaTypes.HubCanvasesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCanvasesQuery, SchemaTypes.HubCanvasesQueryVariables>(
    HubCanvasesDocument,
    options
  );
}
export type HubCanvasesQueryHookResult = ReturnType<typeof useHubCanvasesQuery>;
export type HubCanvasesLazyQueryHookResult = ReturnType<typeof useHubCanvasesLazyQuery>;
export type HubCanvasesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCanvasesQuery,
  SchemaTypes.HubCanvasesQueryVariables
>;
export function refetchHubCanvasesQuery(variables: SchemaTypes.HubCanvasesQueryVariables) {
  return { query: HubCanvasesDocument, variables: variables };
}
export const HubCanvasValuesDocument = gql`
  query hubCanvasValues($hubId: UUID_NAMEID!, $canvasId: UUID!) {
    hub(ID: $hubId) {
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
 * __useHubCanvasValuesQuery__
 *
 * To run a query within a React component, call `useHubCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCanvasValuesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useHubCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCanvasValuesQuery, SchemaTypes.HubCanvasValuesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCanvasValuesQuery, SchemaTypes.HubCanvasValuesQueryVariables>(
    HubCanvasValuesDocument,
    options
  );
}
export function useHubCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubCanvasValuesQuery, SchemaTypes.HubCanvasValuesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCanvasValuesQuery, SchemaTypes.HubCanvasValuesQueryVariables>(
    HubCanvasValuesDocument,
    options
  );
}
export type HubCanvasValuesQueryHookResult = ReturnType<typeof useHubCanvasValuesQuery>;
export type HubCanvasValuesLazyQueryHookResult = ReturnType<typeof useHubCanvasValuesLazyQuery>;
export type HubCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCanvasValuesQuery,
  SchemaTypes.HubCanvasValuesQueryVariables
>;
export function refetchHubCanvasValuesQuery(variables: SchemaTypes.HubCanvasValuesQueryVariables) {
  return { query: HubCanvasValuesDocument, variables: variables };
}
export const ChallengeCanvasesDocument = gql`
  query challengeCanvases($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeCanvasesQuery(variables: SchemaTypes.ChallengeCanvasesQueryVariables) {
  return { query: ChallengeCanvasesDocument, variables: variables };
}
export const ChallengeCanvasValuesDocument = gql`
  query challengeCanvasValues($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!, $canvasId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchChallengeCanvasValuesQuery(variables: SchemaTypes.ChallengeCanvasValuesQueryVariables) {
  return { query: ChallengeCanvasValuesDocument, variables: variables };
}
export const OpportunityCanvasesDocument = gql`
  query opportunityCanvases($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityCanvasesQuery(variables: SchemaTypes.OpportunityCanvasesQueryVariables) {
  return { query: OpportunityCanvasesDocument, variables: variables };
}
export const OpportunityCanvasValuesDocument = gql`
  query opportunityCanvasValues($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!, $canvasId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityCanvasValuesQuery(variables: SchemaTypes.OpportunityCanvasValuesQueryVariables) {
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
export const CanvasContentUpdatedDocument = gql`
  subscription canvasContentUpdated {
    canvasContentUpdated {
      canvasID
      value
    }
  }
`;

/**
 * __useCanvasContentUpdatedSubscription__
 *
 * To run a query within a React component, call `useCanvasContentUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCanvasContentUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanvasContentUpdatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useCanvasContentUpdatedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.CanvasContentUpdatedSubscription,
    SchemaTypes.CanvasContentUpdatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CanvasContentUpdatedSubscription,
    SchemaTypes.CanvasContentUpdatedSubscriptionVariables
  >(CanvasContentUpdatedDocument, options);
}
export type CanvasContentUpdatedSubscriptionHookResult = ReturnType<typeof useCanvasContentUpdatedSubscription>;
export type CanvasContentUpdatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CanvasContentUpdatedSubscription>;
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
export function refetchChallengeExplorerSearchQuery(variables: SchemaTypes.ChallengeExplorerSearchQueryVariables) {
  return { query: ChallengeExplorerSearchDocument, variables: variables };
}
export const SimpleHubDocument = gql`
  query SimpleHub($ID: UUID_NAMEID!) {
    hub(ID: $ID) {
      ...SimpleHub
    }
  }
  ${SimpleHubFragmentDoc}
`;

/**
 * __useSimpleHubQuery__
 *
 * To run a query within a React component, call `useSimpleHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useSimpleHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimpleHubQuery({
 *   variables: {
 *      ID: // value for 'ID'
 *   },
 * });
 */
export function useSimpleHubQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SimpleHubQuery, SchemaTypes.SimpleHubQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SimpleHubQuery, SchemaTypes.SimpleHubQueryVariables>(SimpleHubDocument, options);
}
export function useSimpleHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SimpleHubQuery, SchemaTypes.SimpleHubQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SimpleHubQuery, SchemaTypes.SimpleHubQueryVariables>(
    SimpleHubDocument,
    options
  );
}
export type SimpleHubQueryHookResult = ReturnType<typeof useSimpleHubQuery>;
export type SimpleHubLazyQueryHookResult = ReturnType<typeof useSimpleHubLazyQuery>;
export type SimpleHubQueryResult = Apollo.QueryResult<SchemaTypes.SimpleHubQuery, SchemaTypes.SimpleHubQueryVariables>;
export function refetchSimpleHubQuery(variables: SchemaTypes.SimpleHubQueryVariables) {
  return { query: SimpleHubDocument, variables: variables };
}
export const ChallengeExplorerSearchEnricherDocument = gql`
  query ChallengeExplorerSearchEnricher($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  variables: SchemaTypes.ChallengeExplorerSearchEnricherQueryVariables
) {
  return { query: ChallengeExplorerSearchEnricherDocument, variables: variables };
}
export const ChallengePageDocument = gql`
  query challengePage($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      challenge(ID: $challengeId) {
        ...ChallengeProfile
      }
    }
  }
  ${ChallengeProfileFragmentDoc}
`;

/**
 * __useChallengePageQuery__
 *
 * To run a query within a React component, call `useChallengePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengePageQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengePageQuery, SchemaTypes.ChallengePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengePageQuery, SchemaTypes.ChallengePageQueryVariables>(
    ChallengePageDocument,
    options
  );
}
export function useChallengePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengePageQuery, SchemaTypes.ChallengePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengePageQuery, SchemaTypes.ChallengePageQueryVariables>(
    ChallengePageDocument,
    options
  );
}
export type ChallengePageQueryHookResult = ReturnType<typeof useChallengePageQuery>;
export type ChallengePageLazyQueryHookResult = ReturnType<typeof useChallengePageLazyQuery>;
export type ChallengePageQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengePageQuery,
  SchemaTypes.ChallengePageQueryVariables
>;
export function refetchChallengePageQuery(variables: SchemaTypes.ChallengePageQueryVariables) {
  return { query: ChallengePageDocument, variables: variables };
}
export const ChallengesOverviewPageDocument = gql`
  query ChallengesOverviewPage($membershipData: MembershipUserInput!) {
    membershipUser(membershipData: $membershipData) {
      hubs {
        id
        ...SimpleHubResultEntry
        challenges {
          id
        }
      }
    }
  }
  ${SimpleHubResultEntryFragmentDoc}
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
export function refetchChallengesOverviewPageQuery(variables: SchemaTypes.ChallengesOverviewPageQueryVariables) {
  return { query: ChallengesOverviewPageDocument, variables: variables };
}
export const CommunityUpdatesDocument = gql`
  query communityUpdates($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityUpdatesQuery(variables: SchemaTypes.CommunityUpdatesQueryVariables) {
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
export const CommunicationUpdateMessageReceivedDocument = gql`
  subscription communicationUpdateMessageReceived {
    communicationUpdateMessageReceived {
      updatesID
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCommunicationUpdateMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useCommunicationUpdateMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCommunicationUpdateMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunicationUpdateMessageReceivedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useCommunicationUpdateMessageReceivedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.CommunicationUpdateMessageReceivedSubscription,
    SchemaTypes.CommunicationUpdateMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CommunicationUpdateMessageReceivedSubscription,
    SchemaTypes.CommunicationUpdateMessageReceivedSubscriptionVariables
  >(CommunicationUpdateMessageReceivedDocument, options);
}
export type CommunicationUpdateMessageReceivedSubscriptionHookResult = ReturnType<
  typeof useCommunicationUpdateMessageReceivedSubscription
>;
export type CommunicationUpdateMessageReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CommunicationUpdateMessageReceivedSubscription>;
export const CommunityPageDocument = gql`
  query CommunityPage($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
      id
      community(ID: $communityId) {
        id
        displayName
        members {
          ...UserCard
        }
      }
    }
  }
  ${UserCardFragmentDoc}
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityPageQuery(variables: SchemaTypes.CommunityPageQueryVariables) {
  return { query: CommunityPageDocument, variables: variables };
}
export const CommunityPageWithHostDocument = gql`
  query CommunityPageWithHost($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
      id
      host {
        ...OrganizationCard
      }
      community(ID: $communityId) {
        id
        displayName
        members {
          ...UserCard
        }
      }
    }
  }
  ${OrganizationCardFragmentDoc}
  ${UserCardFragmentDoc}
`;

/**
 * __useCommunityPageWithHostQuery__
 *
 * To run a query within a React component, call `useCommunityPageWithHostQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityPageWithHostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityPageWithHostQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityPageWithHostQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityPageWithHostQuery,
    SchemaTypes.CommunityPageWithHostQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityPageWithHostQuery, SchemaTypes.CommunityPageWithHostQueryVariables>(
    CommunityPageWithHostDocument,
    options
  );
}
export function useCommunityPageWithHostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityPageWithHostQuery,
    SchemaTypes.CommunityPageWithHostQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityPageWithHostQuery, SchemaTypes.CommunityPageWithHostQueryVariables>(
    CommunityPageWithHostDocument,
    options
  );
}
export type CommunityPageWithHostQueryHookResult = ReturnType<typeof useCommunityPageWithHostQuery>;
export type CommunityPageWithHostLazyQueryHookResult = ReturnType<typeof useCommunityPageWithHostLazyQuery>;
export type CommunityPageWithHostQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityPageWithHostQuery,
  SchemaTypes.CommunityPageWithHostQueryVariables
>;
export function refetchCommunityPageWithHostQuery(variables: SchemaTypes.CommunityPageWithHostQueryVariables) {
  return { query: CommunityPageWithHostDocument, variables: variables };
}
export const ChallengeLeadingOrganizationsDocument = gql`
  query ChallengeLeadingOrganizations($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      challenge(ID: $challengeId) {
        id
        leadOrganizations {
          ...OrganizationCard
        }
      }
    }
  }
  ${OrganizationCardFragmentDoc}
`;

/**
 * __useChallengeLeadingOrganizationsQuery__
 *
 * To run a query within a React component, call `useChallengeLeadingOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeLeadingOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeLeadingOrganizationsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeLeadingOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeLeadingOrganizationsQuery,
    SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeLeadingOrganizationsQuery,
    SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
  >(ChallengeLeadingOrganizationsDocument, options);
}
export function useChallengeLeadingOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeLeadingOrganizationsQuery,
    SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeLeadingOrganizationsQuery,
    SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
  >(ChallengeLeadingOrganizationsDocument, options);
}
export type ChallengeLeadingOrganizationsQueryHookResult = ReturnType<typeof useChallengeLeadingOrganizationsQuery>;
export type ChallengeLeadingOrganizationsLazyQueryHookResult = ReturnType<
  typeof useChallengeLeadingOrganizationsLazyQuery
>;
export type ChallengeLeadingOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeLeadingOrganizationsQuery,
  SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
>;
export function refetchChallengeLeadingOrganizationsQuery(
  variables: SchemaTypes.ChallengeLeadingOrganizationsQueryVariables
) {
  return { query: ChallengeLeadingOrganizationsDocument, variables: variables };
}
export const HubContextDocument = gql`
  query HubContext($hubNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      displayName
      tagset {
        id
        name
        tags
      }
      context {
        ...ContextTab
      }
    }
  }
  ${ContextTabFragmentDoc}
`;

/**
 * __useHubContextQuery__
 *
 * To run a query within a React component, call `useHubContextQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubContextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubContextQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *   },
 * });
 */
export function useHubContextQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubContextQuery, SchemaTypes.HubContextQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubContextQuery, SchemaTypes.HubContextQueryVariables>(
    HubContextDocument,
    options
  );
}
export function useHubContextLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubContextQuery, SchemaTypes.HubContextQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubContextQuery, SchemaTypes.HubContextQueryVariables>(
    HubContextDocument,
    options
  );
}
export type HubContextQueryHookResult = ReturnType<typeof useHubContextQuery>;
export type HubContextLazyQueryHookResult = ReturnType<typeof useHubContextLazyQuery>;
export type HubContextQueryResult = Apollo.QueryResult<
  SchemaTypes.HubContextQuery,
  SchemaTypes.HubContextQueryVariables
>;
export function refetchHubContextQuery(variables: SchemaTypes.HubContextQueryVariables) {
  return { query: HubContextDocument, variables: variables };
}
export const HubContextExtraDocument = gql`
  query HubContextExtra($hubNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      displayName
      tagset {
        id
        name
        tags
      }
      context {
        ...ContextTabExtra
      }
    }
  }
  ${ContextTabExtraFragmentDoc}
`;

/**
 * __useHubContextExtraQuery__
 *
 * To run a query within a React component, call `useHubContextExtraQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubContextExtraQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubContextExtraQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *   },
 * });
 */
export function useHubContextExtraQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubContextExtraQuery, SchemaTypes.HubContextExtraQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubContextExtraQuery, SchemaTypes.HubContextExtraQueryVariables>(
    HubContextExtraDocument,
    options
  );
}
export function useHubContextExtraLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubContextExtraQuery, SchemaTypes.HubContextExtraQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubContextExtraQuery, SchemaTypes.HubContextExtraQueryVariables>(
    HubContextExtraDocument,
    options
  );
}
export type HubContextExtraQueryHookResult = ReturnType<typeof useHubContextExtraQuery>;
export type HubContextExtraLazyQueryHookResult = ReturnType<typeof useHubContextExtraLazyQuery>;
export type HubContextExtraQueryResult = Apollo.QueryResult<
  SchemaTypes.HubContextExtraQuery,
  SchemaTypes.HubContextExtraQueryVariables
>;
export function refetchHubContextExtraQuery(variables: SchemaTypes.HubContextExtraQueryVariables) {
  return { query: HubContextExtraDocument, variables: variables };
}
export const ChallengeContextDocument = gql`
  query ChallengeContext($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      displayName
      challenge(ID: $challengeNameId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        lifecycle {
          ...LifecycleContextTab
        }
        context {
          ...ContextTab
        }
      }
    }
  }
  ${LifecycleContextTabFragmentDoc}
  ${ContextTabFragmentDoc}
`;

/**
 * __useChallengeContextQuery__
 *
 * To run a query within a React component, call `useChallengeContextQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeContextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeContextQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *   },
 * });
 */
export function useChallengeContextQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengeContextQuery, SchemaTypes.ChallengeContextQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeContextQuery, SchemaTypes.ChallengeContextQueryVariables>(
    ChallengeContextDocument,
    options
  );
}
export function useChallengeContextLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeContextQuery,
    SchemaTypes.ChallengeContextQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeContextQuery, SchemaTypes.ChallengeContextQueryVariables>(
    ChallengeContextDocument,
    options
  );
}
export type ChallengeContextQueryHookResult = ReturnType<typeof useChallengeContextQuery>;
export type ChallengeContextLazyQueryHookResult = ReturnType<typeof useChallengeContextLazyQuery>;
export type ChallengeContextQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeContextQuery,
  SchemaTypes.ChallengeContextQueryVariables
>;
export function refetchChallengeContextQuery(variables: SchemaTypes.ChallengeContextQueryVariables) {
  return { query: ChallengeContextDocument, variables: variables };
}
export const ChallengeContextExtraDocument = gql`
  query ChallengeContextExtra($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      displayName
      challenge(ID: $challengeNameId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        lifecycle {
          ...LifecycleContextTab
        }
        context {
          ...ContextTabExtra
        }
      }
    }
  }
  ${LifecycleContextTabFragmentDoc}
  ${ContextTabExtraFragmentDoc}
`;

/**
 * __useChallengeContextExtraQuery__
 *
 * To run a query within a React component, call `useChallengeContextExtraQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeContextExtraQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeContextExtraQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *   },
 * });
 */
export function useChallengeContextExtraQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeContextExtraQuery,
    SchemaTypes.ChallengeContextExtraQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeContextExtraQuery, SchemaTypes.ChallengeContextExtraQueryVariables>(
    ChallengeContextExtraDocument,
    options
  );
}
export function useChallengeContextExtraLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeContextExtraQuery,
    SchemaTypes.ChallengeContextExtraQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeContextExtraQuery, SchemaTypes.ChallengeContextExtraQueryVariables>(
    ChallengeContextExtraDocument,
    options
  );
}
export type ChallengeContextExtraQueryHookResult = ReturnType<typeof useChallengeContextExtraQuery>;
export type ChallengeContextExtraLazyQueryHookResult = ReturnType<typeof useChallengeContextExtraLazyQuery>;
export type ChallengeContextExtraQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeContextExtraQuery,
  SchemaTypes.ChallengeContextExtraQueryVariables
>;
export function refetchChallengeContextExtraQuery(variables: SchemaTypes.ChallengeContextExtraQueryVariables) {
  return { query: ChallengeContextExtraDocument, variables: variables };
}
export const OpportunityContextDocument = gql`
  query OpportunityContext($hubNameId: UUID_NAMEID!, $opportunityNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      opportunity(ID: $opportunityNameId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        lifecycle {
          ...LifecycleContextTab
        }
        context {
          ...ContextTab
        }
      }
    }
  }
  ${LifecycleContextTabFragmentDoc}
  ${ContextTabFragmentDoc}
`;

/**
 * __useOpportunityContextQuery__
 *
 * To run a query within a React component, call `useOpportunityContextQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityContextQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityContextQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *   },
 * });
 */
export function useOpportunityContextQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityContextQuery,
    SchemaTypes.OpportunityContextQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityContextQuery, SchemaTypes.OpportunityContextQueryVariables>(
    OpportunityContextDocument,
    options
  );
}
export function useOpportunityContextLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityContextQuery,
    SchemaTypes.OpportunityContextQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityContextQuery, SchemaTypes.OpportunityContextQueryVariables>(
    OpportunityContextDocument,
    options
  );
}
export type OpportunityContextQueryHookResult = ReturnType<typeof useOpportunityContextQuery>;
export type OpportunityContextLazyQueryHookResult = ReturnType<typeof useOpportunityContextLazyQuery>;
export type OpportunityContextQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityContextQuery,
  SchemaTypes.OpportunityContextQueryVariables
>;
export function refetchOpportunityContextQuery(variables: SchemaTypes.OpportunityContextQueryVariables) {
  return { query: OpportunityContextDocument, variables: variables };
}
export const OpportunityContextExtraDocument = gql`
  query OpportunityContextExtra($hubNameId: UUID_NAMEID!, $opportunityNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      nameID
      opportunity(ID: $opportunityNameId) {
        id
        nameID
        displayName
        tagset {
          id
          name
          tags
        }
        lifecycle {
          ...LifecycleContextTab
        }
        context {
          ...ContextTabExtra
        }
      }
    }
  }
  ${LifecycleContextTabFragmentDoc}
  ${ContextTabExtraFragmentDoc}
`;

/**
 * __useOpportunityContextExtraQuery__
 *
 * To run a query within a React component, call `useOpportunityContextExtraQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityContextExtraQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityContextExtraQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *   },
 * });
 */
export function useOpportunityContextExtraQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityContextExtraQuery,
    SchemaTypes.OpportunityContextExtraQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityContextExtraQuery, SchemaTypes.OpportunityContextExtraQueryVariables>(
    OpportunityContextExtraDocument,
    options
  );
}
export function useOpportunityContextExtraLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityContextExtraQuery,
    SchemaTypes.OpportunityContextExtraQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityContextExtraQuery,
    SchemaTypes.OpportunityContextExtraQueryVariables
  >(OpportunityContextExtraDocument, options);
}
export type OpportunityContextExtraQueryHookResult = ReturnType<typeof useOpportunityContextExtraQuery>;
export type OpportunityContextExtraLazyQueryHookResult = ReturnType<typeof useOpportunityContextExtraLazyQuery>;
export type OpportunityContextExtraQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityContextExtraQuery,
  SchemaTypes.OpportunityContextExtraQueryVariables
>;
export function refetchOpportunityContextExtraQuery(variables: SchemaTypes.OpportunityContextExtraQueryVariables) {
  return { query: OpportunityContextExtraDocument, variables: variables };
}
export const CommunityDiscussionDocument = gql`
  query communityDiscussion($hubId: UUID_NAMEID!, $communityId: UUID!, $discussionId: String!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityDiscussionQuery(variables: SchemaTypes.CommunityDiscussionQueryVariables) {
  return { query: CommunityDiscussionDocument, variables: variables };
}
export const CommunityDiscussionListDocument = gql`
  query communityDiscussionList($hubId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchCommunityDiscussionListQuery(variables: SchemaTypes.CommunityDiscussionListQueryVariables) {
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
        avatar {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
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
export function refetchAuthorDetailsQuery(variables: SchemaTypes.AuthorDetailsQueryVariables) {
  return { query: AuthorDetailsDocument, variables: variables };
}
export const CommunicationDiscussionMessageReceivedDocument = gql`
  subscription communicationDiscussionMessageReceived($discussionID: UUID!) {
    communicationDiscussionMessageReceived(discussionID: $discussionID) {
      discussionID
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCommunicationDiscussionMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useCommunicationDiscussionMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCommunicationDiscussionMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunicationDiscussionMessageReceivedSubscription({
 *   variables: {
 *      discussionID: // value for 'discussionID'
 *   },
 * });
 */
export function useCommunicationDiscussionMessageReceivedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CommunicationDiscussionMessageReceivedSubscription,
    SchemaTypes.CommunicationDiscussionMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CommunicationDiscussionMessageReceivedSubscription,
    SchemaTypes.CommunicationDiscussionMessageReceivedSubscriptionVariables
  >(CommunicationDiscussionMessageReceivedDocument, options);
}
export type CommunicationDiscussionMessageReceivedSubscriptionHookResult = ReturnType<
  typeof useCommunicationDiscussionMessageReceivedSubscription
>;
export type CommunicationDiscussionMessageReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CommunicationDiscussionMessageReceivedSubscription>;
export const CommunicationDiscussionUpdatedDocument = gql`
  subscription communicationDiscussionUpdated($communicationID: UUID!) {
    communicationDiscussionUpdated(communicationID: $communicationID) {
      id
      title
      description
      createdBy
      timestamp
      category
      commentsCount
    }
  }
`;

/**
 * __useCommunicationDiscussionUpdatedSubscription__
 *
 * To run a query within a React component, call `useCommunicationDiscussionUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCommunicationDiscussionUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunicationDiscussionUpdatedSubscription({
 *   variables: {
 *      communicationID: // value for 'communicationID'
 *   },
 * });
 */
export function useCommunicationDiscussionUpdatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CommunicationDiscussionUpdatedSubscription,
    SchemaTypes.CommunicationDiscussionUpdatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CommunicationDiscussionUpdatedSubscription,
    SchemaTypes.CommunicationDiscussionUpdatedSubscriptionVariables
  >(CommunicationDiscussionUpdatedDocument, options);
}
export type CommunicationDiscussionUpdatedSubscriptionHookResult = ReturnType<
  typeof useCommunicationDiscussionUpdatedSubscription
>;
export type CommunicationDiscussionUpdatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CommunicationDiscussionUpdatedSubscription>;
export const HubPageDocument = gql`
  query hubPage($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      ...HubPage
    }
  }
  ${HubPageFragmentDoc}
`;

/**
 * __useHubPageQuery__
 *
 * To run a query within a React component, call `useHubPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubPageQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubPageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubPageQuery, SchemaTypes.HubPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubPageQuery, SchemaTypes.HubPageQueryVariables>(HubPageDocument, options);
}
export function useHubPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubPageQuery, SchemaTypes.HubPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubPageQuery, SchemaTypes.HubPageQueryVariables>(HubPageDocument, options);
}
export type HubPageQueryHookResult = ReturnType<typeof useHubPageQuery>;
export type HubPageLazyQueryHookResult = ReturnType<typeof useHubPageLazyQuery>;
export type HubPageQueryResult = Apollo.QueryResult<SchemaTypes.HubPageQuery, SchemaTypes.HubPageQueryVariables>;
export function refetchHubPageQuery(variables: SchemaTypes.HubPageQueryVariables) {
  return { query: HubPageDocument, variables: variables };
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
  query opportunityPage($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export function refetchOpportunityPageQuery(variables: SchemaTypes.OpportunityPageQueryVariables) {
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
export function refetchAssociatedOrganizationQuery(variables: SchemaTypes.AssociatedOrganizationQueryVariables) {
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
export function refetchOrganizationMembersQuery(variables: SchemaTypes.OrganizationMembersQueryVariables) {
  return { query: OrganizationMembersDocument, variables: variables };
}
export const GetSupportedCredentialMetadataDocument = gql`
  query getSupportedCredentialMetadata {
    getSupportedCredentialMetadata {
      name
      description
      schema
      types
      uniqueType
      context
    }
  }
`;

/**
 * __useGetSupportedCredentialMetadataQuery__
 *
 * To run a query within a React component, call `useGetSupportedCredentialMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupportedCredentialMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupportedCredentialMetadataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSupportedCredentialMetadataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.GetSupportedCredentialMetadataQuery,
    SchemaTypes.GetSupportedCredentialMetadataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.GetSupportedCredentialMetadataQuery,
    SchemaTypes.GetSupportedCredentialMetadataQueryVariables
  >(GetSupportedCredentialMetadataDocument, options);
}
export function useGetSupportedCredentialMetadataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.GetSupportedCredentialMetadataQuery,
    SchemaTypes.GetSupportedCredentialMetadataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.GetSupportedCredentialMetadataQuery,
    SchemaTypes.GetSupportedCredentialMetadataQueryVariables
  >(GetSupportedCredentialMetadataDocument, options);
}
export type GetSupportedCredentialMetadataQueryHookResult = ReturnType<typeof useGetSupportedCredentialMetadataQuery>;
export type GetSupportedCredentialMetadataLazyQueryHookResult = ReturnType<
  typeof useGetSupportedCredentialMetadataLazyQuery
>;
export type GetSupportedCredentialMetadataQueryResult = Apollo.QueryResult<
  SchemaTypes.GetSupportedCredentialMetadataQuery,
  SchemaTypes.GetSupportedCredentialMetadataQueryVariables
>;
export function refetchGetSupportedCredentialMetadataQuery(
  variables?: SchemaTypes.GetSupportedCredentialMetadataQueryVariables
) {
  return { query: GetSupportedCredentialMetadataDocument, variables: variables };
}
export const BeginCredentialRequestInteractionDocument = gql`
  mutation beginCredentialRequestInteraction($types: [String!]!) {
    beginCredentialRequestInteraction(types: $types) {
      interactionId
      jwt
      expiresOn
    }
  }
`;
export type BeginCredentialRequestInteractionMutationFn = Apollo.MutationFunction<
  SchemaTypes.BeginCredentialRequestInteractionMutation,
  SchemaTypes.BeginCredentialRequestInteractionMutationVariables
>;

/**
 * __useBeginCredentialRequestInteractionMutation__
 *
 * To run a mutation, you first call `useBeginCredentialRequestInteractionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginCredentialRequestInteractionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginCredentialRequestInteractionMutation, { data, loading, error }] = useBeginCredentialRequestInteractionMutation({
 *   variables: {
 *      types: // value for 'types'
 *   },
 * });
 */
export function useBeginCredentialRequestInteractionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.BeginCredentialRequestInteractionMutation,
    SchemaTypes.BeginCredentialRequestInteractionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.BeginCredentialRequestInteractionMutation,
    SchemaTypes.BeginCredentialRequestInteractionMutationVariables
  >(BeginCredentialRequestInteractionDocument, options);
}
export type BeginCredentialRequestInteractionMutationHookResult = ReturnType<
  typeof useBeginCredentialRequestInteractionMutation
>;
export type BeginCredentialRequestInteractionMutationResult =
  Apollo.MutationResult<SchemaTypes.BeginCredentialRequestInteractionMutation>;
export type BeginCredentialRequestInteractionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.BeginCredentialRequestInteractionMutation,
  SchemaTypes.BeginCredentialRequestInteractionMutationVariables
>;
export const BeginAlkemioUserCredentialOfferInteractionDocument = gql`
  mutation beginAlkemioUserCredentialOfferInteraction {
    beginAlkemioUserCredentialOfferInteraction {
      interactionId
      jwt
      expiresOn
    }
  }
`;
export type BeginAlkemioUserCredentialOfferInteractionMutationFn = Apollo.MutationFunction<
  SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutation,
  SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutationVariables
>;

/**
 * __useBeginAlkemioUserCredentialOfferInteractionMutation__
 *
 * To run a mutation, you first call `useBeginAlkemioUserCredentialOfferInteractionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginAlkemioUserCredentialOfferInteractionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginAlkemioUserCredentialOfferInteractionMutation, { data, loading, error }] = useBeginAlkemioUserCredentialOfferInteractionMutation({
 *   variables: {
 *   },
 * });
 */
export function useBeginAlkemioUserCredentialOfferInteractionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutation,
    SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutation,
    SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutationVariables
  >(BeginAlkemioUserCredentialOfferInteractionDocument, options);
}
export type BeginAlkemioUserCredentialOfferInteractionMutationHookResult = ReturnType<
  typeof useBeginAlkemioUserCredentialOfferInteractionMutation
>;
export type BeginAlkemioUserCredentialOfferInteractionMutationResult =
  Apollo.MutationResult<SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutation>;
export type BeginAlkemioUserCredentialOfferInteractionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutation,
  SchemaTypes.BeginAlkemioUserCredentialOfferInteractionMutationVariables
>;
export const BeginCommunityMemberCredentialOfferInteractionDocument = gql`
  mutation beginCommunityMemberCredentialOfferInteraction($communityID: String!) {
    beginCommunityMemberCredentialOfferInteraction(communityID: $communityID) {
      interactionId
      jwt
      expiresOn
    }
  }
`;
export type BeginCommunityMemberCredentialOfferInteractionMutationFn = Apollo.MutationFunction<
  SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutation,
  SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutationVariables
>;

/**
 * __useBeginCommunityMemberCredentialOfferInteractionMutation__
 *
 * To run a mutation, you first call `useBeginCommunityMemberCredentialOfferInteractionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginCommunityMemberCredentialOfferInteractionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginCommunityMemberCredentialOfferInteractionMutation, { data, loading, error }] = useBeginCommunityMemberCredentialOfferInteractionMutation({
 *   variables: {
 *      communityID: // value for 'communityID'
 *   },
 * });
 */
export function useBeginCommunityMemberCredentialOfferInteractionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutation,
    SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutation,
    SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutationVariables
  >(BeginCommunityMemberCredentialOfferInteractionDocument, options);
}
export type BeginCommunityMemberCredentialOfferInteractionMutationHookResult = ReturnType<
  typeof useBeginCommunityMemberCredentialOfferInteractionMutation
>;
export type BeginCommunityMemberCredentialOfferInteractionMutationResult =
  Apollo.MutationResult<SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutation>;
export type BeginCommunityMemberCredentialOfferInteractionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutation,
  SchemaTypes.BeginCommunityMemberCredentialOfferInteractionMutationVariables
>;
export const UserSsiDocument = gql`
  query userSsi {
    me {
      ...UserAgentSsi
    }
  }
  ${UserAgentSsiFragmentDoc}
`;

/**
 * __useUserSsiQuery__
 *
 * To run a query within a React component, call `useUserSsiQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSsiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSsiQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserSsiQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.UserSsiQuery, SchemaTypes.UserSsiQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserSsiQuery, SchemaTypes.UserSsiQueryVariables>(UserSsiDocument, options);
}
export function useUserSsiLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserSsiQuery, SchemaTypes.UserSsiQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserSsiQuery, SchemaTypes.UserSsiQueryVariables>(UserSsiDocument, options);
}
export type UserSsiQueryHookResult = ReturnType<typeof useUserSsiQuery>;
export type UserSsiLazyQueryHookResult = ReturnType<typeof useUserSsiLazyQuery>;
export type UserSsiQueryResult = Apollo.QueryResult<SchemaTypes.UserSsiQuery, SchemaTypes.UserSsiQueryVariables>;
export function refetchUserSsiQuery(variables?: SchemaTypes.UserSsiQueryVariables) {
  return { query: UserSsiDocument, variables: variables };
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
        avatar {
          ...VisualUri
        }
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
  ${VisualUriFragmentDoc}
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
export function refetchUserCardsContainerQuery(variables: SchemaTypes.UserCardsContainerQueryVariables) {
  return { query: UserCardsContainerDocument, variables: variables };
}
export const OpportunityProviderDocument = gql`
  query opportunityProvider($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        ...OpportunityProvider
      }
    }
  }
  ${OpportunityProviderFragmentDoc}
`;

/**
 * __useOpportunityProviderQuery__
 *
 * To run a query within a React component, call `useOpportunityProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityProviderQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityProviderQuery,
    SchemaTypes.OpportunityProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityProviderQuery, SchemaTypes.OpportunityProviderQueryVariables>(
    OpportunityProviderDocument,
    options
  );
}
export function useOpportunityProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityProviderQuery,
    SchemaTypes.OpportunityProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityProviderQuery, SchemaTypes.OpportunityProviderQueryVariables>(
    OpportunityProviderDocument,
    options
  );
}
export type OpportunityProviderQueryHookResult = ReturnType<typeof useOpportunityProviderQuery>;
export type OpportunityProviderLazyQueryHookResult = ReturnType<typeof useOpportunityProviderLazyQuery>;
export type OpportunityProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityProviderQuery,
  SchemaTypes.OpportunityProviderQueryVariables
>;
export function refetchOpportunityProviderQuery(variables: SchemaTypes.OpportunityProviderQueryVariables) {
  return { query: OpportunityProviderDocument, variables: variables };
}
export const HubAspectProviderDocument = gql`
  query HubAspectProvider($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      context {
        ...AspectProviderData
      }
    }
  }
  ${AspectProviderDataFragmentDoc}
`;

/**
 * __useHubAspectProviderQuery__
 *
 * To run a query within a React component, call `useHubAspectProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubAspectProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubAspectProviderQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useHubAspectProviderQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubAspectProviderQuery, SchemaTypes.HubAspectProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubAspectProviderQuery, SchemaTypes.HubAspectProviderQueryVariables>(
    HubAspectProviderDocument,
    options
  );
}
export function useHubAspectProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubAspectProviderQuery,
    SchemaTypes.HubAspectProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubAspectProviderQuery, SchemaTypes.HubAspectProviderQueryVariables>(
    HubAspectProviderDocument,
    options
  );
}
export type HubAspectProviderQueryHookResult = ReturnType<typeof useHubAspectProviderQuery>;
export type HubAspectProviderLazyQueryHookResult = ReturnType<typeof useHubAspectProviderLazyQuery>;
export type HubAspectProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.HubAspectProviderQuery,
  SchemaTypes.HubAspectProviderQueryVariables
>;
export function refetchHubAspectProviderQuery(variables: SchemaTypes.HubAspectProviderQueryVariables) {
  return { query: HubAspectProviderDocument, variables: variables };
}
export const ChallengeAspectProviderDocument = gql`
  query ChallengeAspectProvider($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        context {
          ...AspectProviderData
        }
      }
    }
  }
  ${AspectProviderDataFragmentDoc}
`;

/**
 * __useChallengeAspectProviderQuery__
 *
 * To run a query within a React component, call `useChallengeAspectProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeAspectProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeAspectProviderQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useChallengeAspectProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeAspectProviderQuery,
    SchemaTypes.ChallengeAspectProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeAspectProviderQuery, SchemaTypes.ChallengeAspectProviderQueryVariables>(
    ChallengeAspectProviderDocument,
    options
  );
}
export function useChallengeAspectProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeAspectProviderQuery,
    SchemaTypes.ChallengeAspectProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeAspectProviderQuery,
    SchemaTypes.ChallengeAspectProviderQueryVariables
  >(ChallengeAspectProviderDocument, options);
}
export type ChallengeAspectProviderQueryHookResult = ReturnType<typeof useChallengeAspectProviderQuery>;
export type ChallengeAspectProviderLazyQueryHookResult = ReturnType<typeof useChallengeAspectProviderLazyQuery>;
export type ChallengeAspectProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeAspectProviderQuery,
  SchemaTypes.ChallengeAspectProviderQueryVariables
>;
export function refetchChallengeAspectProviderQuery(variables: SchemaTypes.ChallengeAspectProviderQueryVariables) {
  return { query: ChallengeAspectProviderDocument, variables: variables };
}
export const OpportunityAspectProviderDocument = gql`
  query OpportunityAspectProvider(
    $hubNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        context {
          ...AspectProviderData
        }
      }
    }
  }
  ${AspectProviderDataFragmentDoc}
`;

/**
 * __useOpportunityAspectProviderQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectProviderQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      aspectNameId: // value for 'aspectNameId'
 *   },
 * });
 */
export function useOpportunityAspectProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAspectProviderQuery,
    SchemaTypes.OpportunityAspectProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityAspectProviderQuery,
    SchemaTypes.OpportunityAspectProviderQueryVariables
  >(OpportunityAspectProviderDocument, options);
}
export function useOpportunityAspectProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAspectProviderQuery,
    SchemaTypes.OpportunityAspectProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityAspectProviderQuery,
    SchemaTypes.OpportunityAspectProviderQueryVariables
  >(OpportunityAspectProviderDocument, options);
}
export type OpportunityAspectProviderQueryHookResult = ReturnType<typeof useOpportunityAspectProviderQuery>;
export type OpportunityAspectProviderLazyQueryHookResult = ReturnType<typeof useOpportunityAspectProviderLazyQuery>;
export type OpportunityAspectProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAspectProviderQuery,
  SchemaTypes.OpportunityAspectProviderQueryVariables
>;
export function refetchOpportunityAspectProviderQuery(variables: SchemaTypes.OpportunityAspectProviderQueryVariables) {
  return { query: OpportunityAspectProviderDocument, variables: variables };
}
export const PostCommentInAspectDocument = gql`
  mutation PostCommentInAspect($messageData: CommentsSendMessageInput!) {
    sendComment(messageData: $messageData) {
      id
      message
      sender
      timestamp
    }
  }
`;
export type PostCommentInAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.PostCommentInAspectMutation,
  SchemaTypes.PostCommentInAspectMutationVariables
>;

/**
 * __usePostCommentInAspectMutation__
 *
 * To run a mutation, you first call `usePostCommentInAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostCommentInAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postCommentInAspectMutation, { data, loading, error }] = usePostCommentInAspectMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function usePostCommentInAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.PostCommentInAspectMutation,
    SchemaTypes.PostCommentInAspectMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.PostCommentInAspectMutation, SchemaTypes.PostCommentInAspectMutationVariables>(
    PostCommentInAspectDocument,
    options
  );
}
export type PostCommentInAspectMutationHookResult = ReturnType<typeof usePostCommentInAspectMutation>;
export type PostCommentInAspectMutationResult = Apollo.MutationResult<SchemaTypes.PostCommentInAspectMutation>;
export type PostCommentInAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.PostCommentInAspectMutation,
  SchemaTypes.PostCommentInAspectMutationVariables
>;
export const RemoveCommentFromAspectDocument = gql`
  mutation RemoveCommentFromAspect($messageData: CommentsRemoveMessageInput!) {
    removeComment(messageData: $messageData)
  }
`;
export type RemoveCommentFromAspectMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveCommentFromAspectMutation,
  SchemaTypes.RemoveCommentFromAspectMutationVariables
>;

/**
 * __useRemoveCommentFromAspectMutation__
 *
 * To run a mutation, you first call `useRemoveCommentFromAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommentFromAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommentFromAspectMutation, { data, loading, error }] = useRemoveCommentFromAspectMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useRemoveCommentFromAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveCommentFromAspectMutation,
    SchemaTypes.RemoveCommentFromAspectMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveCommentFromAspectMutation,
    SchemaTypes.RemoveCommentFromAspectMutationVariables
  >(RemoveCommentFromAspectDocument, options);
}
export type RemoveCommentFromAspectMutationHookResult = ReturnType<typeof useRemoveCommentFromAspectMutation>;
export type RemoveCommentFromAspectMutationResult = Apollo.MutationResult<SchemaTypes.RemoveCommentFromAspectMutation>;
export type RemoveCommentFromAspectMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveCommentFromAspectMutation,
  SchemaTypes.RemoveCommentFromAspectMutationVariables
>;
