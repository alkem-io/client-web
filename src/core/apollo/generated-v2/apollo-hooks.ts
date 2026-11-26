import * as Apollo from '@apollo/client';

import { gql } from '@apollo/client';
import type * as SchemaTypes from './graphql-schema';

const defaultOptions = {} as const;
export const MembershipRequestRowFragmentDoc = gql`
    fragment MembershipRequestRow on MembershipRequest {
  id
  direction
  state
  roles
  email
  message
  answers
  createdAt
  decidedAt
  availableEvents
  actor {
    id
    actorType
    url
    about {
      displayName
      location
      avatar {
        file {
          url
        }
      }
    }
  }
}
    `;
export const V2FileRefFragmentDoc = gql`
    fragment V2FileRef on FileRef {
  file {
    id
    url
  }
}
    `;
export const V2PendingMembershipRequestFragmentDoc = gql`
    fragment V2PendingMembershipRequest on MembershipRequest {
  id
  state
  createdAt
  message
  roles
  availableEvents
  wouldJoin {
    displayName
    url
  }
  resource {
    id
    entityType
    ... on Organization {
      url
      about {
        displayName
        avatar {
          ...V2FileRef
        }
      }
    }
  }
  space {
    id
    url
    depth
    tags
    about {
      displayName
      tagline
      avatar {
        ...V2FileRef
      }
      card {
        ...V2FileRef
      }
    }
  }
  actor {
    id
    actorType
    about {
      displayName
    }
  }
  createdBy {
    id
    about {
      displayName
    }
  }
}
    ${V2FileRefFragmentDoc}`;
export const CreateSpaceAccountFragmentDoc = gql`
    fragment CreateSpaceAccount on AccountSummary {
  id
  canCreate {
    kind
    allowed
    reason
    byEntitlement {
      name
      allowed
    }
  }
}
    `;
export const NativeSubspaceCardFragmentDoc = gql`
    fragment NativeSubspaceCard on Space {
  id
  url
  status
  isContentPublic
  pinned
  tags
  about {
    displayName
    tagline
    avatar {
      file {
        url
      }
    }
    card {
      file {
        url
      }
    }
  }
  membership {
    roles
  }
  can {
    read
  }
  leads {
    id
    actorType
    about {
      displayName
      avatar {
        file {
          url
        }
      }
    }
  }
}
    `;
export const ActorIdentityFragmentDoc = gql`
    fragment ActorIdentity on Actor {
  id
  actorType
  url
  about {
    displayName
    avatar {
      alt
      file {
        url
      }
    }
  }
}
    `;
export const LeadFaceFragmentDoc = gql`
    fragment LeadFace on Actor {
  ...ActorIdentity
  about {
    location
  }
}
    ${ActorIdentityFragmentDoc}`;
export const SpaceDocumentFragmentDoc = gql`
    fragment SpaceDocument on Space {
  id
  handle
  url
  depth
  status
  createdAt
  tags
  isContentPublic
  settings
  videoCallUrl
  memberCount
  about {
    displayName
    tagline
    description
    location
    facets {
      namespace
      name
      value
    }
    avatar {
      alt
      file {
        id
        url
      }
    }
    banner {
      alt
      aspectRatio
      file {
        id
        url
      }
    }
    card {
      alt
      file {
        id
        url
      }
    }
  }
  guidelines
  applicationForm
  host {
    ...LeadFace
    account {
      id
    }
  }
  leads {
    ...LeadFace
  }
  stages {
    id
    name
    description
    sortOrder
  }
  membership {
    roles
    status
    request {
      id
      state
      direction
      message
      createdAt
      createdBy {
        ...ActorIdentity
      }
    }
  }
  parent {
    id
    url
    can {
      join
      apply
    }
    membership {
      status
    }
  }
  entitlements {
    name
  }
  can {
    read
    update
    delete
    archive
    createPost
    createSubspace
    createDocument
    invite
    manageMembers
    manageTemplates
    upload
    readActivity
    saveAsTemplate
    join
    apply
  }
}
    ${LeadFaceFragmentDoc}
${ActorIdentityFragmentDoc}`;
export const SpacePageRootsFragmentDoc = gql`
    fragment SpacePageRoots on Query {
  node(id: $space) @include(if: $withSpace) {
    id
    entityType
    ...SpaceDocument
  }
}
    ${SpaceDocumentFragmentDoc}`;
export const ContributorCardFragmentDoc = gql`
    fragment ContributorCard on Actor {
  ...ActorIdentity
  about {
    tagline
    location
  }
  ... on User {
    skills
    keywords
  }
  ... on Organization {
    tags
    associateCount
    website
  }
}
    ${ActorIdentityFragmentDoc}`;
export const ResponseCardFragmentDoc = gql`
    fragment ResponseCard on Post {
  id
  url
  contentKind
  createdAt
  tags
  sortOrder
  stage {
    id
  }
  about {
    displayName
    description
  }
  links {
    id
    title
    description
    uri
    file {
      id
      url
    }
    sortOrder
  }
  author {
    ...ActorIdentity
  }
  room {
    id
    messageCount
  }
  can {
    update
    delete
    moveTask
  }
  content {
    __typename
    ... on DocumentContent {
      document {
        id
        docType
        textSnapshot
        preview {
          url
        }
        about {
          displayName
        }
      }
    }
    ... on LinkContent {
      link {
        id
        uri
        title
        description
        file {
          id
          url
        }
      }
    }
  }
}
    ${ActorIdentityFragmentDoc}`;
export const PostBodyFragmentDoc = gql`
    fragment PostBody on Post {
  id
  url
  handle
  sortOrder
  postStatus: status
  contentKind
  createdAt
  publishedAt
  tags
  commentsEnabled
  responseKind
  responsePolicy
  responseDefaults
  responseCount
  stage {
    id
  }
  about {
    displayName
    description
  }
  links {
    id
    title
    description
    uri
    file {
      id
      url
    }
    sortOrder
  }
  author {
    ...ActorIdentity
  }
  publishedBy {
    ...ActorIdentity
  }
  room {
    id
    messageCount
  }
  can {
    read
    update
    delete
    respond
    comment
    move
    moveTask
    manageColumns
  }
  content {
    __typename
    ... on DocumentContent {
      document {
        id
        docType
        url
        textSnapshot
        preview {
          url
        }
        about {
          displayName
        }
        can {
          read
          edit
        }
      }
    }
    ... on LinkContent {
      link {
        id
        uri
        title
        description
        file {
          id
          url
        }
      }
    }
    ... on GalleryContent {
      images {
        alt
        file {
          id
          url
          mime
        }
      }
    }
    ... on PollContent {
      question
      status
      deadline
      settings
      totalVotes
      myVotes
      options {
        id
        value
        sortOrder
        votes
        percentage
        mine
        voters {
          ...ActorIdentity
        }
      }
    }
    ... on EventContent {
      startsAt
      endsAt
      startsOn
      endsOn
      allDay
      timezone
      location
      type
      rollUp
      calendarLinks {
        provider
        url
      }
    }
    ... on ContributorsContent {
      settings
      counts {
        type
        count
      }
      contributors {
        ...ContributorCard
      }
    }
    ... on SpacesContent {
      settings
      hasHiddenSpaces
      spaces {
        id
        url
        pinned
        status
        isContentPublic
        tags
        membership {
          status
        }
        about {
          displayName
          tagline
          description
          card {
            file {
              url
            }
          }
          avatar {
            file {
              url
            }
          }
        }
        leads {
          ...ActorIdentity
        }
      }
    }
    ... on FormContent {
      questions
      responseCount
      myResponseCount
    }
    ... on FormResponseContent {
      answers
    }
    ... on TaskBoardContent {
      columns {
        id
        name
        sortOrder
      }
      tasks {
        ...ResponseCard
      }
    }
  }
}
    ${ActorIdentityFragmentDoc}
${ContributorCardFragmentDoc}
${ResponseCardFragmentDoc}`;
export const PostCardFragmentDoc = gql`
    fragment PostCard on Post {
  ...PostBody
  parentPost {
    id
  }
}
    ${PostBodyFragmentDoc}`;
export const PostDetailFragmentDoc = gql`
    fragment PostDetail on Post {
  ...PostBody
  parentPost {
    id
    url
  }
}
    ${PostBodyFragmentDoc}`;
export const SpaceCommunityActorFragmentDoc = gql`
    fragment SpaceCommunityActor on Actor {
  id
  actorType
  url
  about {
    displayName
    avatar {
      file {
        url
      }
    }
  }
  ... on User {
    firstName
    email
  }
}
    `;
export const V2DashboardSpaceCardFragmentDoc = gql`
    fragment V2DashboardSpaceCard on Space {
  id
  url
  depth
  isContentPublic
  about {
    displayName
    tagline
    avatar {
      ...V2FileRef
    }
    card {
      ...V2FileRef
    }
  }
}
    ${V2FileRefFragmentDoc}`;
export const SettingsPostTemplateCardFragmentDoc = gql`
    fragment SettingsPostTemplateCard on Template {
  id
  kind
  url
  tags
  about {
    displayName
    description
    card {
      file {
        url
      }
    }
  }
}
    `;
export const CreateSpacePickerCardFragmentDoc = gql`
    fragment CreateSpacePickerCard on Template {
  id
  kind
  url
  tags
  about {
    displayName
    description
    card {
      file {
        url
      }
    }
  }
  body {
    id
    ... on Space {
      about {
        card {
          file {
            url
          }
        }
      }
    }
  }
}
    `;
export const SpaceSettingsAboutVisualFragmentDoc = gql`
    fragment SpaceSettingsAboutVisual on FileRef {
  alt
  aspectRatio
  file {
    id
    url
  }
}
    `;
export const SpaceInputsFragmentDoc = gql`
    fragment SpaceInputs on Space {
  depth
  url
  settings
  stages {
    id
    sortOrder
  }
}
    `;
export const V2FoundationDocument = gql`
    query V2Foundation($origin: String!, $resolveHomepage: Boolean!) {
  resolve(url: $origin) @include(if: $resolveHomepage) {
    homepage {
      id
    }
  }
  viewer {
    id
    actor {
      id
      actorType
      url
      about {
        displayName
        tagline
        avatar {
          file {
            url
          }
        }
      }
      settings
      notificationPrefs
      ... on User {
        firstName
        lastName
      }
    }
    session {
      authenticated
      issuedAt
      fresh
      authMethods
    }
    matrix {
      userId
      sessionBaseUrl
      expiresAt
    }
    language
    homeSpace {
      id
      url
    }
    account {
      id
      canCreate {
        kind
        allowed
        reason
      }
      entitlements {
        name
        limit
        usage
      }
    }
    platformRoles
    platformPrivileges
  }
}
    `;

/**
 * __useV2FoundationQuery__
 *
 * To run a query within a React component, call `useV2FoundationQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2FoundationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2FoundationQuery({
 *   variables: {
 *      origin: // value for 'origin'
 *      resolveHomepage: // value for 'resolveHomepage'
 *   },
 * });
 */
export function useV2FoundationQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables> &
    ({ variables: SchemaTypes.V2FoundationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables>(
    V2FoundationDocument,
    options
  );
}
export function useV2FoundationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables>(
    V2FoundationDocument,
    options
  );
}
export function useV2FoundationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2FoundationQuery, SchemaTypes.V2FoundationQueryVariables>(
    V2FoundationDocument,
    options
  );
}
export type V2FoundationQueryHookResult = ReturnType<typeof useV2FoundationQuery>;
export type V2FoundationLazyQueryHookResult = ReturnType<typeof useV2FoundationLazyQuery>;
export type V2FoundationSuspenseQueryHookResult = ReturnType<typeof useV2FoundationSuspenseQuery>;
export type V2FoundationQueryResult = Apollo.QueryResult<
  SchemaTypes.V2FoundationQuery,
  SchemaTypes.V2FoundationQueryVariables
>;
export function refetchV2FoundationQuery(variables: SchemaTypes.V2FoundationQueryVariables) {
  return { query: V2FoundationDocument, variables: variables };
}
export const MembershipRequestsDocument = gql`
    query MembershipRequests($resource: UUID!, $first: Int!, $after: String) {
  requests(resource: $resource, first: $first, after: $after) {
    edges {
      node {
        ...MembershipRequestRow
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${MembershipRequestRowFragmentDoc}`;

/**
 * __useMembershipRequestsQuery__
 *
 * To run a query within a React component, call `useMembershipRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipRequestsQuery({
 *   variables: {
 *      resource: // value for 'resource'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMembershipRequestsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MembershipRequestsQuery,
    SchemaTypes.MembershipRequestsQueryVariables
  > &
    ({ variables: SchemaTypes.MembershipRequestsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MembershipRequestsQuery, SchemaTypes.MembershipRequestsQueryVariables>(
    MembershipRequestsDocument,
    options
  );
}
export function useMembershipRequestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MembershipRequestsQuery,
    SchemaTypes.MembershipRequestsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MembershipRequestsQuery, SchemaTypes.MembershipRequestsQueryVariables>(
    MembershipRequestsDocument,
    options
  );
}
export function useMembershipRequestsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.MembershipRequestsQuery, SchemaTypes.MembershipRequestsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MembershipRequestsQuery, SchemaTypes.MembershipRequestsQueryVariables>(
    MembershipRequestsDocument,
    options
  );
}
export type MembershipRequestsQueryHookResult = ReturnType<typeof useMembershipRequestsQuery>;
export type MembershipRequestsLazyQueryHookResult = ReturnType<typeof useMembershipRequestsLazyQuery>;
export type MembershipRequestsSuspenseQueryHookResult = ReturnType<typeof useMembershipRequestsSuspenseQuery>;
export type MembershipRequestsQueryResult = Apollo.QueryResult<
  SchemaTypes.MembershipRequestsQuery,
  SchemaTypes.MembershipRequestsQueryVariables
>;
export function refetchMembershipRequestsQuery(variables: SchemaTypes.MembershipRequestsQueryVariables) {
  return { query: MembershipRequestsDocument, variables: variables };
}
export const RespondToMembershipRequestDocument = gql`
    mutation RespondToMembershipRequest($id: UUID!, $event: String!) {
  respondToRequest(id: $id, event: $event) {
    request {
      id
      state
      availableEvents
    }
  }
}
    `;
export type RespondToMembershipRequestMutationFn = Apollo.MutationFunction<
  SchemaTypes.RespondToMembershipRequestMutation,
  SchemaTypes.RespondToMembershipRequestMutationVariables
>;

/**
 * __useRespondToMembershipRequestMutation__
 *
 * To run a mutation, you first call `useRespondToMembershipRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRespondToMembershipRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [respondToMembershipRequestMutation, { data, loading, error }] = useRespondToMembershipRequestMutation({
 *   variables: {
 *      id: // value for 'id'
 *      event: // value for 'event'
 *   },
 * });
 */
export function useRespondToMembershipRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RespondToMembershipRequestMutation,
    SchemaTypes.RespondToMembershipRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RespondToMembershipRequestMutation,
    SchemaTypes.RespondToMembershipRequestMutationVariables
  >(RespondToMembershipRequestDocument, options);
}
export type RespondToMembershipRequestMutationHookResult = ReturnType<typeof useRespondToMembershipRequestMutation>;
export type RespondToMembershipRequestMutationResult =
  Apollo.MutationResult<SchemaTypes.RespondToMembershipRequestMutation>;
export type RespondToMembershipRequestMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RespondToMembershipRequestMutation,
  SchemaTypes.RespondToMembershipRequestMutationVariables
>;
export const ResendMembershipInvitationDocument = gql`
    mutation ResendMembershipInvitation($id: UUID!) {
  resendInvitation(id: $id) {
    id
  }
}
    `;
export type ResendMembershipInvitationMutationFn = Apollo.MutationFunction<
  SchemaTypes.ResendMembershipInvitationMutation,
  SchemaTypes.ResendMembershipInvitationMutationVariables
>;

/**
 * __useResendMembershipInvitationMutation__
 *
 * To run a mutation, you first call `useResendMembershipInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendMembershipInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendMembershipInvitationMutation, { data, loading, error }] = useResendMembershipInvitationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResendMembershipInvitationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ResendMembershipInvitationMutation,
    SchemaTypes.ResendMembershipInvitationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.ResendMembershipInvitationMutation,
    SchemaTypes.ResendMembershipInvitationMutationVariables
  >(ResendMembershipInvitationDocument, options);
}
export type ResendMembershipInvitationMutationHookResult = ReturnType<typeof useResendMembershipInvitationMutation>;
export type ResendMembershipInvitationMutationResult =
  Apollo.MutationResult<SchemaTypes.ResendMembershipInvitationMutation>;
export type ResendMembershipInvitationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ResendMembershipInvitationMutation,
  SchemaTypes.ResendMembershipInvitationMutationVariables
>;
export const PostDetailDocument = gql`
    query PostDetail($id: UUID!) {
  post: node(id: $id) {
    id
    entityType
    ...PostDetail
  }
}
    ${PostDetailFragmentDoc}`;

/**
 * __usePostDetailQuery__
 *
 * To run a query within a React component, call `usePostDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePostDetailQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables> &
    ({ variables: SchemaTypes.PostDetailQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables>(
    PostDetailDocument,
    options
  );
}
export function usePostDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables>(
    PostDetailDocument,
    options
  );
}
export function usePostDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PostDetailQuery, SchemaTypes.PostDetailQueryVariables>(
    PostDetailDocument,
    options
  );
}
export type PostDetailQueryHookResult = ReturnType<typeof usePostDetailQuery>;
export type PostDetailLazyQueryHookResult = ReturnType<typeof usePostDetailLazyQuery>;
export type PostDetailSuspenseQueryHookResult = ReturnType<typeof usePostDetailSuspenseQuery>;
export type PostDetailQueryResult = Apollo.QueryResult<
  SchemaTypes.PostDetailQuery,
  SchemaTypes.PostDetailQueryVariables
>;
export function refetchPostDetailQuery(variables: SchemaTypes.PostDetailQueryVariables) {
  return { query: PostDetailDocument, variables: variables };
}
export const V2RespondToRequestDocument = gql`
    mutation V2RespondToRequest($id: UUID!, $event: String!) {
  respondToRequest(id: $id, event: $event) {
    request {
      id
      state
      availableEvents
      withheldRoles {
        role
        reason
      }
    }
  }
}
    `;
export type V2RespondToRequestMutationFn = Apollo.MutationFunction<
  SchemaTypes.V2RespondToRequestMutation,
  SchemaTypes.V2RespondToRequestMutationVariables
>;

/**
 * __useV2RespondToRequestMutation__
 *
 * To run a mutation, you first call `useV2RespondToRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useV2RespondToRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [v2RespondToRequestMutation, { data, loading, error }] = useV2RespondToRequestMutation({
 *   variables: {
 *      id: // value for 'id'
 *      event: // value for 'event'
 *   },
 * });
 */
export function useV2RespondToRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.V2RespondToRequestMutation,
    SchemaTypes.V2RespondToRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.V2RespondToRequestMutation, SchemaTypes.V2RespondToRequestMutationVariables>(
    V2RespondToRequestDocument,
    options
  );
}
export type V2RespondToRequestMutationHookResult = ReturnType<typeof useV2RespondToRequestMutation>;
export type V2RespondToRequestMutationResult = Apollo.MutationResult<SchemaTypes.V2RespondToRequestMutation>;
export type V2RespondToRequestMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.V2RespondToRequestMutation,
  SchemaTypes.V2RespondToRequestMutationVariables
>;
export const V2PendingMembershipsDocument = gql`
    query V2PendingMemberships {
  viewer {
    id
    pendingInvitations {
      ...V2PendingMembershipRequest
    }
    pendingApplications {
      ...V2PendingMembershipRequest
    }
  }
}
    ${V2PendingMembershipRequestFragmentDoc}`;

/**
 * __useV2PendingMembershipsQuery__
 *
 * To run a query within a React component, call `useV2PendingMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2PendingMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2PendingMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2PendingMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.V2PendingMembershipsQuery,
    SchemaTypes.V2PendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2PendingMembershipsQuery, SchemaTypes.V2PendingMembershipsQueryVariables>(
    V2PendingMembershipsDocument,
    options
  );
}
export function useV2PendingMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2PendingMembershipsQuery,
    SchemaTypes.V2PendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2PendingMembershipsQuery, SchemaTypes.V2PendingMembershipsQueryVariables>(
    V2PendingMembershipsDocument,
    options
  );
}
export function useV2PendingMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2PendingMembershipsQuery,
        SchemaTypes.V2PendingMembershipsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2PendingMembershipsQuery, SchemaTypes.V2PendingMembershipsQueryVariables>(
    V2PendingMembershipsDocument,
    options
  );
}
export type V2PendingMembershipsQueryHookResult = ReturnType<typeof useV2PendingMembershipsQuery>;
export type V2PendingMembershipsLazyQueryHookResult = ReturnType<typeof useV2PendingMembershipsLazyQuery>;
export type V2PendingMembershipsSuspenseQueryHookResult = ReturnType<typeof useV2PendingMembershipsSuspenseQuery>;
export type V2PendingMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.V2PendingMembershipsQuery,
  SchemaTypes.V2PendingMembershipsQueryVariables
>;
export function refetchV2PendingMembershipsQuery(variables?: SchemaTypes.V2PendingMembershipsQueryVariables) {
  return { query: V2PendingMembershipsDocument, variables: variables };
}
export const NativeConfigurationDocument = gql`
    query NativeConfiguration {
  config {
    platformId
    matrix {
      sessionBaseUrl
    }
    languages
    defaultLanguage
    features
    authProviders
    authentication {
      kratosPublicUrl
    }
    links {
      key
      url
    }
    iframeAllowlist
    telemetry {
      environment
      sentry {
        enabled
        endpoint
        submitPII
        environment
      }
      apm {
        rumEnabled
        endpoint
      }
    }
    geo {
      enabled
      endpoint
    }
    versions {
      server
    }
  }
}
    `;

/**
 * __useNativeConfigurationQuery__
 *
 * To run a query within a React component, call `useNativeConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useNativeConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNativeConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useNativeConfigurationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.NativeConfigurationQuery,
    SchemaTypes.NativeConfigurationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.NativeConfigurationQuery, SchemaTypes.NativeConfigurationQueryVariables>(
    NativeConfigurationDocument,
    options
  );
}
export function useNativeConfigurationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.NativeConfigurationQuery,
    SchemaTypes.NativeConfigurationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.NativeConfigurationQuery, SchemaTypes.NativeConfigurationQueryVariables>(
    NativeConfigurationDocument,
    options
  );
}
export function useNativeConfigurationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.NativeConfigurationQuery,
        SchemaTypes.NativeConfigurationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.NativeConfigurationQuery, SchemaTypes.NativeConfigurationQueryVariables>(
    NativeConfigurationDocument,
    options
  );
}
export type NativeConfigurationQueryHookResult = ReturnType<typeof useNativeConfigurationQuery>;
export type NativeConfigurationLazyQueryHookResult = ReturnType<typeof useNativeConfigurationLazyQuery>;
export type NativeConfigurationSuspenseQueryHookResult = ReturnType<typeof useNativeConfigurationSuspenseQuery>;
export type NativeConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.NativeConfigurationQuery,
  SchemaTypes.NativeConfigurationQueryVariables
>;
export function refetchNativeConfigurationQuery(variables?: SchemaTypes.NativeConfigurationQueryVariables) {
  return { query: NativeConfigurationDocument, variables: variables };
}
export const NativeGuidancePointerDocument = gql`
    query NativeGuidancePointer {
  config {
    pointers {
      guidanceVirtualContributor
    }
  }
}
    `;

/**
 * __useNativeGuidancePointerQuery__
 *
 * To run a query within a React component, call `useNativeGuidancePointerQuery` and pass it any options that fit your needs.
 * When your component renders, `useNativeGuidancePointerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNativeGuidancePointerQuery({
 *   variables: {
 *   },
 * });
 */
export function useNativeGuidancePointerQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.NativeGuidancePointerQuery,
    SchemaTypes.NativeGuidancePointerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.NativeGuidancePointerQuery, SchemaTypes.NativeGuidancePointerQueryVariables>(
    NativeGuidancePointerDocument,
    options
  );
}
export function useNativeGuidancePointerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.NativeGuidancePointerQuery,
    SchemaTypes.NativeGuidancePointerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.NativeGuidancePointerQuery, SchemaTypes.NativeGuidancePointerQueryVariables>(
    NativeGuidancePointerDocument,
    options
  );
}
export function useNativeGuidancePointerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.NativeGuidancePointerQuery,
        SchemaTypes.NativeGuidancePointerQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.NativeGuidancePointerQuery,
    SchemaTypes.NativeGuidancePointerQueryVariables
  >(NativeGuidancePointerDocument, options);
}
export type NativeGuidancePointerQueryHookResult = ReturnType<typeof useNativeGuidancePointerQuery>;
export type NativeGuidancePointerLazyQueryHookResult = ReturnType<typeof useNativeGuidancePointerLazyQuery>;
export type NativeGuidancePointerSuspenseQueryHookResult = ReturnType<typeof useNativeGuidancePointerSuspenseQuery>;
export type NativeGuidancePointerQueryResult = Apollo.QueryResult<
  SchemaTypes.NativeGuidancePointerQuery,
  SchemaTypes.NativeGuidancePointerQueryVariables
>;
export function refetchNativeGuidancePointerQuery(variables?: SchemaTypes.NativeGuidancePointerQueryVariables) {
  return { query: NativeGuidancePointerDocument, variables: variables };
}
export const V2ConfigurationDocument = gql`
    query V2Configuration {
  config {
    platformId
    languages
    defaultLanguage
    features
    authentication {
      kratosPublicUrl
    }
    matrix {
      homeserverUrl
      sessionBaseUrl
      serverName
    }
    links {
      key
      url
    }
    iframeAllowlist
    telemetry {
      environment
      sentry {
        enabled
        endpoint
        submitPII
        environment
      }
      apm {
        rumEnabled
        endpoint
      }
    }
    geo {
      enabled
      endpoint
    }
    vapidPublicKey
    versions {
      server
    }
    storage {
      maxFileSize
      allowedMime
    }
  }
}
    `;

/**
 * __useV2ConfigurationQuery__
 *
 * To run a query within a React component, call `useV2ConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2ConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2ConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2ConfigurationQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>(
    V2ConfigurationDocument,
    options
  );
}
export function useV2ConfigurationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>(
    V2ConfigurationDocument,
    options
  );
}
export function useV2ConfigurationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2ConfigurationQuery, SchemaTypes.V2ConfigurationQueryVariables>(
    V2ConfigurationDocument,
    options
  );
}
export type V2ConfigurationQueryHookResult = ReturnType<typeof useV2ConfigurationQuery>;
export type V2ConfigurationLazyQueryHookResult = ReturnType<typeof useV2ConfigurationLazyQuery>;
export type V2ConfigurationSuspenseQueryHookResult = ReturnType<typeof useV2ConfigurationSuspenseQuery>;
export type V2ConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.V2ConfigurationQuery,
  SchemaTypes.V2ConfigurationQueryVariables
>;
export function refetchV2ConfigurationQuery(variables?: SchemaTypes.V2ConfigurationQueryVariables) {
  return { query: V2ConfigurationDocument, variables: variables };
}
export const HomeRedirectMembershipsDocument = gql`
    query HomeRedirectMemberships {
  viewer {
    id
    actor {
      id
      ... on User {
        memberships {
          space {
            id
            depth
            url
          }
        }
      }
    }
  }
}
    `;

/**
 * __useHomeRedirectMembershipsQuery__
 *
 * To run a query within a React component, call `useHomeRedirectMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeRedirectMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeRedirectMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomeRedirectMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.HomeRedirectMembershipsQuery,
    SchemaTypes.HomeRedirectMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HomeRedirectMembershipsQuery, SchemaTypes.HomeRedirectMembershipsQueryVariables>(
    HomeRedirectMembershipsDocument,
    options
  );
}
export function useHomeRedirectMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HomeRedirectMembershipsQuery,
    SchemaTypes.HomeRedirectMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HomeRedirectMembershipsQuery,
    SchemaTypes.HomeRedirectMembershipsQueryVariables
  >(HomeRedirectMembershipsDocument, options);
}
export function useHomeRedirectMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.HomeRedirectMembershipsQuery,
        SchemaTypes.HomeRedirectMembershipsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.HomeRedirectMembershipsQuery,
    SchemaTypes.HomeRedirectMembershipsQueryVariables
  >(HomeRedirectMembershipsDocument, options);
}
export type HomeRedirectMembershipsQueryHookResult = ReturnType<typeof useHomeRedirectMembershipsQuery>;
export type HomeRedirectMembershipsLazyQueryHookResult = ReturnType<typeof useHomeRedirectMembershipsLazyQuery>;
export type HomeRedirectMembershipsSuspenseQueryHookResult = ReturnType<typeof useHomeRedirectMembershipsSuspenseQuery>;
export type HomeRedirectMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.HomeRedirectMembershipsQuery,
  SchemaTypes.HomeRedirectMembershipsQueryVariables
>;
export function refetchHomeRedirectMembershipsQuery(variables?: SchemaTypes.HomeRedirectMembershipsQueryVariables) {
  return { query: HomeRedirectMembershipsDocument, variables: variables };
}
export const CreateSpaceVisualConstraintsDocument = gql`
    query CreateSpaceVisualConstraints {
  config {
    visualConstraints {
      name
      minWidth
      maxWidth
      minHeight
      maxHeight
      aspectRatio
      minAspectRatio
      maxAspectRatio
      allowedTypes
    }
  }
}
    `;

/**
 * __useCreateSpaceVisualConstraintsQuery__
 *
 * To run a query within a React component, call `useCreateSpaceVisualConstraintsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceVisualConstraintsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpaceVisualConstraintsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCreateSpaceVisualConstraintsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpaceVisualConstraintsQuery,
    SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateSpaceVisualConstraintsQuery,
    SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
  >(CreateSpaceVisualConstraintsDocument, options);
}
export function useCreateSpaceVisualConstraintsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpaceVisualConstraintsQuery,
    SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpaceVisualConstraintsQuery,
    SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
  >(CreateSpaceVisualConstraintsDocument, options);
}
export function useCreateSpaceVisualConstraintsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpaceVisualConstraintsQuery,
        SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpaceVisualConstraintsQuery,
    SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
  >(CreateSpaceVisualConstraintsDocument, options);
}
export type CreateSpaceVisualConstraintsQueryHookResult = ReturnType<typeof useCreateSpaceVisualConstraintsQuery>;
export type CreateSpaceVisualConstraintsLazyQueryHookResult = ReturnType<
  typeof useCreateSpaceVisualConstraintsLazyQuery
>;
export type CreateSpaceVisualConstraintsSuspenseQueryHookResult = ReturnType<
  typeof useCreateSpaceVisualConstraintsSuspenseQuery
>;
export type CreateSpaceVisualConstraintsQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpaceVisualConstraintsQuery,
  SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
>;
export function refetchCreateSpaceVisualConstraintsQuery(
  variables?: SchemaTypes.CreateSpaceVisualConstraintsQueryVariables
) {
  return { query: CreateSpaceVisualConstraintsDocument, variables: variables };
}
export const CreateSpaceViewerAccountDocument = gql`
    query CreateSpaceViewerAccount {
  viewer {
    id
    account {
      ...CreateSpaceAccount
    }
  }
}
    ${CreateSpaceAccountFragmentDoc}`;

/**
 * __useCreateSpaceViewerAccountQuery__
 *
 * To run a query within a React component, call `useCreateSpaceViewerAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceViewerAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpaceViewerAccountQuery({
 *   variables: {
 *   },
 * });
 */
export function useCreateSpaceViewerAccountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpaceViewerAccountQuery,
    SchemaTypes.CreateSpaceViewerAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateSpaceViewerAccountQuery, SchemaTypes.CreateSpaceViewerAccountQueryVariables>(
    CreateSpaceViewerAccountDocument,
    options
  );
}
export function useCreateSpaceViewerAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpaceViewerAccountQuery,
    SchemaTypes.CreateSpaceViewerAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpaceViewerAccountQuery,
    SchemaTypes.CreateSpaceViewerAccountQueryVariables
  >(CreateSpaceViewerAccountDocument, options);
}
export function useCreateSpaceViewerAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpaceViewerAccountQuery,
        SchemaTypes.CreateSpaceViewerAccountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpaceViewerAccountQuery,
    SchemaTypes.CreateSpaceViewerAccountQueryVariables
  >(CreateSpaceViewerAccountDocument, options);
}
export type CreateSpaceViewerAccountQueryHookResult = ReturnType<typeof useCreateSpaceViewerAccountQuery>;
export type CreateSpaceViewerAccountLazyQueryHookResult = ReturnType<typeof useCreateSpaceViewerAccountLazyQuery>;
export type CreateSpaceViewerAccountSuspenseQueryHookResult = ReturnType<
  typeof useCreateSpaceViewerAccountSuspenseQuery
>;
export type CreateSpaceViewerAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpaceViewerAccountQuery,
  SchemaTypes.CreateSpaceViewerAccountQueryVariables
>;
export function refetchCreateSpaceViewerAccountQuery(variables?: SchemaTypes.CreateSpaceViewerAccountQueryVariables) {
  return { query: CreateSpaceViewerAccountDocument, variables: variables };
}
export const CreateSpaceOrganizationAccountDocument = gql`
    query CreateSpaceOrganizationAccount($organization: UUID!) {
  node(id: $organization) {
    id
    ... on Organization {
      account {
        ...CreateSpaceAccount
      }
    }
  }
}
    ${CreateSpaceAccountFragmentDoc}`;

/**
 * __useCreateSpaceOrganizationAccountQuery__
 *
 * To run a query within a React component, call `useCreateSpaceOrganizationAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceOrganizationAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpaceOrganizationAccountQuery({
 *   variables: {
 *      organization: // value for 'organization'
 *   },
 * });
 */
export function useCreateSpaceOrganizationAccountQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpaceOrganizationAccountQuery,
    SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
  > &
    ({ variables: SchemaTypes.CreateSpaceOrganizationAccountQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateSpaceOrganizationAccountQuery,
    SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
  >(CreateSpaceOrganizationAccountDocument, options);
}
export function useCreateSpaceOrganizationAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpaceOrganizationAccountQuery,
    SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpaceOrganizationAccountQuery,
    SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
  >(CreateSpaceOrganizationAccountDocument, options);
}
export function useCreateSpaceOrganizationAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpaceOrganizationAccountQuery,
        SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpaceOrganizationAccountQuery,
    SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
  >(CreateSpaceOrganizationAccountDocument, options);
}
export type CreateSpaceOrganizationAccountQueryHookResult = ReturnType<typeof useCreateSpaceOrganizationAccountQuery>;
export type CreateSpaceOrganizationAccountLazyQueryHookResult = ReturnType<
  typeof useCreateSpaceOrganizationAccountLazyQuery
>;
export type CreateSpaceOrganizationAccountSuspenseQueryHookResult = ReturnType<
  typeof useCreateSpaceOrganizationAccountSuspenseQuery
>;
export type CreateSpaceOrganizationAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpaceOrganizationAccountQuery,
  SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
>;
export function refetchCreateSpaceOrganizationAccountQuery(
  variables: SchemaTypes.CreateSpaceOrganizationAccountQueryVariables
) {
  return { query: CreateSpaceOrganizationAccountDocument, variables: variables };
}
export const CreateSpacePlansDocument = gql`
    query CreateSpacePlans {
  plans(scope: SPACE) {
    id
    name
    sortOrder
    enabled
    entitlements {
      name
    }
  }
  config {
    entitlementCatalog {
      name
      effectiveEntitlement
      creationKinds {
        entityType
        kind
      }
    }
  }
}
    `;

/**
 * __useCreateSpacePlansQuery__
 *
 * To run a query within a React component, call `useCreateSpacePlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpacePlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpacePlansQuery({
 *   variables: {
 *   },
 * });
 */
export function useCreateSpacePlansQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.CreateSpacePlansQuery, SchemaTypes.CreateSpacePlansQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateSpacePlansQuery, SchemaTypes.CreateSpacePlansQueryVariables>(
    CreateSpacePlansDocument,
    options
  );
}
export function useCreateSpacePlansLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpacePlansQuery,
    SchemaTypes.CreateSpacePlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreateSpacePlansQuery, SchemaTypes.CreateSpacePlansQueryVariables>(
    CreateSpacePlansDocument,
    options
  );
}
export function useCreateSpacePlansSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CreateSpacePlansQuery, SchemaTypes.CreateSpacePlansQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CreateSpacePlansQuery, SchemaTypes.CreateSpacePlansQueryVariables>(
    CreateSpacePlansDocument,
    options
  );
}
export type CreateSpacePlansQueryHookResult = ReturnType<typeof useCreateSpacePlansQuery>;
export type CreateSpacePlansLazyQueryHookResult = ReturnType<typeof useCreateSpacePlansLazyQuery>;
export type CreateSpacePlansSuspenseQueryHookResult = ReturnType<typeof useCreateSpacePlansSuspenseQuery>;
export type CreateSpacePlansQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpacePlansQuery,
  SchemaTypes.CreateSpacePlansQueryVariables
>;
export function refetchCreateSpacePlansQuery(variables?: SchemaTypes.CreateSpacePlansQueryVariables) {
  return { query: CreateSpacePlansDocument, variables: variables };
}
export const CreateSpaceDocument = gql`
    mutation CreateSpace($input: CreateSpaceInput!) {
  createSpace(input: $input) {
    node {
      id
      ... on Space {
        url
      }
    }
    omissions {
      path
      code
    }
  }
}
    `;
export type CreateSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateSpaceMutation,
  SchemaTypes.CreateSpaceMutationVariables
>;

/**
 * __useCreateSpaceMutation__
 *
 * To run a mutation, you first call `useCreateSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSpaceMutation, { data, loading, error }] = useCreateSpaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreateSpaceMutation, SchemaTypes.CreateSpaceMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateSpaceMutation, SchemaTypes.CreateSpaceMutationVariables>(
    CreateSpaceDocument,
    options
  );
}
export type CreateSpaceMutationHookResult = ReturnType<typeof useCreateSpaceMutation>;
export type CreateSpaceMutationResult = Apollo.MutationResult<SchemaTypes.CreateSpaceMutation>;
export type CreateSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateSpaceMutation,
  SchemaTypes.CreateSpaceMutationVariables
>;
export const CreateSubspaceDocument = gql`
    mutation CreateSubspace($input: CreateSpaceInput!) {
  createSpace(input: $input) {
    node {
      id
      ... on Space {
        url
      }
    }
    omissions {
      path
      code
    }
  }
}
    `;
export type CreateSubspaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateSubspaceMutation,
  SchemaTypes.CreateSubspaceMutationVariables
>;

/**
 * __useCreateSubspaceMutation__
 *
 * To run a mutation, you first call `useCreateSubspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSubspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSubspaceMutation, { data, loading, error }] = useCreateSubspaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSubspaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateSubspaceMutation,
    SchemaTypes.CreateSubspaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateSubspaceMutation, SchemaTypes.CreateSubspaceMutationVariables>(
    CreateSubspaceDocument,
    options
  );
}
export type CreateSubspaceMutationHookResult = ReturnType<typeof useCreateSubspaceMutation>;
export type CreateSubspaceMutationResult = Apollo.MutationResult<SchemaTypes.CreateSubspaceMutation>;
export type CreateSubspaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateSubspaceMutation,
  SchemaTypes.CreateSubspaceMutationVariables
>;
export const RequestVisualUploadDocument = gql`
    mutation RequestVisualUpload($owner: UUID!, $mime: String!, $size: Long!, $role: String!) {
  requestUpload(owner: $owner, mime: $mime, size: $size, role: $role) {
    token
    url
  }
}
    `;
export type RequestVisualUploadMutationFn = Apollo.MutationFunction<
  SchemaTypes.RequestVisualUploadMutation,
  SchemaTypes.RequestVisualUploadMutationVariables
>;

/**
 * __useRequestVisualUploadMutation__
 *
 * To run a mutation, you first call `useRequestVisualUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestVisualUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestVisualUploadMutation, { data, loading, error }] = useRequestVisualUploadMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      mime: // value for 'mime'
 *      size: // value for 'size'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useRequestVisualUploadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RequestVisualUploadMutation,
    SchemaTypes.RequestVisualUploadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RequestVisualUploadMutation, SchemaTypes.RequestVisualUploadMutationVariables>(
    RequestVisualUploadDocument,
    options
  );
}
export type RequestVisualUploadMutationHookResult = ReturnType<typeof useRequestVisualUploadMutation>;
export type RequestVisualUploadMutationResult = Apollo.MutationResult<SchemaTypes.RequestVisualUploadMutation>;
export type RequestVisualUploadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RequestVisualUploadMutation,
  SchemaTypes.RequestVisualUploadMutationVariables
>;
export const AttachVisualDocument = gql`
    mutation AttachVisual($owner: UUID!, $file: UUID!, $role: String!, $displayName: String!, $alt: String) {
  attachFile(
    owner: $owner
    file: $file
    role: $role
    displayName: $displayName
    alt: $alt
  ) {
    id
  }
}
    `;
export type AttachVisualMutationFn = Apollo.MutationFunction<
  SchemaTypes.AttachVisualMutation,
  SchemaTypes.AttachVisualMutationVariables
>;

/**
 * __useAttachVisualMutation__
 *
 * To run a mutation, you first call `useAttachVisualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAttachVisualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [attachVisualMutation, { data, loading, error }] = useAttachVisualMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      file: // value for 'file'
 *      role: // value for 'role'
 *      displayName: // value for 'displayName'
 *      alt: // value for 'alt'
 *   },
 * });
 */
export function useAttachVisualMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.AttachVisualMutation, SchemaTypes.AttachVisualMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.AttachVisualMutation, SchemaTypes.AttachVisualMutationVariables>(
    AttachVisualDocument,
    options
  );
}
export type AttachVisualMutationHookResult = ReturnType<typeof useAttachVisualMutation>;
export type AttachVisualMutationResult = Apollo.MutationResult<SchemaTypes.AttachVisualMutation>;
export type AttachVisualMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AttachVisualMutation,
  SchemaTypes.AttachVisualMutationVariables
>;
export const SpacePageShellDocument = gql`
    query SpacePageShell($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      handle
      url
      depth
      status
      isContentPublic
      tags
      settings
      videoCallUrl
      about {
        displayName
        tagline
        description
        avatar {
          file {
            url
          }
          alt
        }
        banner {
          file {
            url
          }
          alt
          aspectRatio
        }
        card {
          file {
            url
          }
          alt
        }
      }
      can {
        read
        update
        createSubspace
        manageTemplates
        saveAsTemplate
      }
      membership {
        status
      }
      entitlements {
        name
      }
      host {
        id
        account {
          id
        }
      }
    }
  }
}
    `;

/**
 * __useSpacePageShellQuery__
 *
 * To run a query within a React component, call `useSpacePageShellQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePageShellQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePageShellQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpacePageShellQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables> &
    ({ variables: SchemaTypes.SpacePageShellQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables>(
    SpacePageShellDocument,
    options
  );
}
export function useSpacePageShellLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables>(
    SpacePageShellDocument,
    options
  );
}
export function useSpacePageShellSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpacePageShellQuery, SchemaTypes.SpacePageShellQueryVariables>(
    SpacePageShellDocument,
    options
  );
}
export type SpacePageShellQueryHookResult = ReturnType<typeof useSpacePageShellQuery>;
export type SpacePageShellLazyQueryHookResult = ReturnType<typeof useSpacePageShellLazyQuery>;
export type SpacePageShellSuspenseQueryHookResult = ReturnType<typeof useSpacePageShellSuspenseQuery>;
export type SpacePageShellQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePageShellQuery,
  SchemaTypes.SpacePageShellQueryVariables
>;
export function refetchSpacePageShellQuery(variables: SchemaTypes.SpacePageShellQueryVariables) {
  return { query: SpacePageShellDocument, variables: variables };
}
export const NativeSubspacesDocument = gql`
    query NativeSubspaces($root: UUID!, $first: Int!, $after: String) {
  node(id: $root) {
    id
    entityType
    ... on Space {
      settings
    }
  }
  spaces: subtree(
    root: $root
    maxDepth: 1
    types: ["space"]
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        id
        entityType
        ...NativeSubspaceCard
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${NativeSubspaceCardFragmentDoc}`;

/**
 * __useNativeSubspacesQuery__
 *
 * To run a query within a React component, call `useNativeSubspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useNativeSubspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNativeSubspacesQuery({
 *   variables: {
 *      root: // value for 'root'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useNativeSubspacesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables> &
    ({ variables: SchemaTypes.NativeSubspacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables>(
    NativeSubspacesDocument,
    options
  );
}
export function useNativeSubspacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables>(
    NativeSubspacesDocument,
    options
  );
}
export function useNativeSubspacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.NativeSubspacesQuery, SchemaTypes.NativeSubspacesQueryVariables>(
    NativeSubspacesDocument,
    options
  );
}
export type NativeSubspacesQueryHookResult = ReturnType<typeof useNativeSubspacesQuery>;
export type NativeSubspacesLazyQueryHookResult = ReturnType<typeof useNativeSubspacesLazyQuery>;
export type NativeSubspacesSuspenseQueryHookResult = ReturnType<typeof useNativeSubspacesSuspenseQuery>;
export type NativeSubspacesQueryResult = Apollo.QueryResult<
  SchemaTypes.NativeSubspacesQuery,
  SchemaTypes.NativeSubspacesQueryVariables
>;
export function refetchNativeSubspacesQuery(variables: SchemaTypes.NativeSubspacesQueryVariables) {
  return { query: NativeSubspacesDocument, variables: variables };
}
export const SpaceCommunityDocument = gql`
    query SpaceCommunity($space: UUID!, $first: Int!, $after: String) {
  members(resource: $space, first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        roles
        joinedAt
        actor {
          ...ActorIdentity
          about {
            location
            description
          }
          ... on User {
            skills
            keywords
          }
          ... on Organization {
            tags
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${ActorIdentityFragmentDoc}`;

/**
 * __useSpaceCommunityQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityQuery({
 *   variables: {
 *      space: // value for 'space'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSpaceCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables> &
    ({ variables: SchemaTypes.SpaceCommunityQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>(
    SpaceCommunityDocument,
    options
  );
}
export function useSpaceCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>(
    SpaceCommunityDocument,
    options
  );
}
export function useSpaceCommunitySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>(
    SpaceCommunityDocument,
    options
  );
}
export type SpaceCommunityQueryHookResult = ReturnType<typeof useSpaceCommunityQuery>;
export type SpaceCommunityLazyQueryHookResult = ReturnType<typeof useSpaceCommunityLazyQuery>;
export type SpaceCommunitySuspenseQueryHookResult = ReturnType<typeof useSpaceCommunitySuspenseQuery>;
export type SpaceCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityQuery,
  SchemaTypes.SpaceCommunityQueryVariables
>;
export function refetchSpaceCommunityQuery(variables: SchemaTypes.SpaceCommunityQueryVariables) {
  return { query: SpaceCommunityDocument, variables: variables };
}
export const SpacePageDocument = gql`
    query SpacePage($space: UUID!, $withSpace: Boolean!) {
  ...SpacePageRoots
}
    ${SpacePageRootsFragmentDoc}`;

/**
 * __useSpacePageQuery__
 *
 * To run a query within a React component, call `useSpacePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePageQuery({
 *   variables: {
 *      space: // value for 'space'
 *      withSpace: // value for 'withSpace'
 *   },
 * });
 */
export function useSpacePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables> &
    ({ variables: SchemaTypes.SpacePageQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>(SpacePageDocument, options);
}
export function useSpacePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>(
    SpacePageDocument,
    options
  );
}
export function useSpacePageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>(
    SpacePageDocument,
    options
  );
}
export type SpacePageQueryHookResult = ReturnType<typeof useSpacePageQuery>;
export type SpacePageLazyQueryHookResult = ReturnType<typeof useSpacePageLazyQuery>;
export type SpacePageSuspenseQueryHookResult = ReturnType<typeof useSpacePageSuspenseQuery>;
export type SpacePageQueryResult = Apollo.QueryResult<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>;
export function refetchSpacePageQuery(variables: SchemaTypes.SpacePageQueryVariables) {
  return { query: SpacePageDocument, variables: variables };
}
export const SpacePageWithPostDocument = gql`
    query SpacePageWithPost($space: UUID!, $withSpace: Boolean!, $post: UUID!) {
  ...SpacePageRoots
  post: node(id: $post) {
    id
    entityType
    ...PostDetail
  }
}
    ${SpacePageRootsFragmentDoc}
${PostDetailFragmentDoc}`;

/**
 * __useSpacePageWithPostQuery__
 *
 * To run a query within a React component, call `useSpacePageWithPostQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePageWithPostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePageWithPostQuery({
 *   variables: {
 *      space: // value for 'space'
 *      withSpace: // value for 'withSpace'
 *      post: // value for 'post'
 *   },
 * });
 */
export function useSpacePageWithPostQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpacePageWithPostQuery,
    SchemaTypes.SpacePageWithPostQueryVariables
  > &
    ({ variables: SchemaTypes.SpacePageWithPostQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePageWithPostQuery, SchemaTypes.SpacePageWithPostQueryVariables>(
    SpacePageWithPostDocument,
    options
  );
}
export function useSpacePageWithPostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePageWithPostQuery,
    SchemaTypes.SpacePageWithPostQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePageWithPostQuery, SchemaTypes.SpacePageWithPostQueryVariables>(
    SpacePageWithPostDocument,
    options
  );
}
export function useSpacePageWithPostSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpacePageWithPostQuery, SchemaTypes.SpacePageWithPostQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpacePageWithPostQuery, SchemaTypes.SpacePageWithPostQueryVariables>(
    SpacePageWithPostDocument,
    options
  );
}
export type SpacePageWithPostQueryHookResult = ReturnType<typeof useSpacePageWithPostQuery>;
export type SpacePageWithPostLazyQueryHookResult = ReturnType<typeof useSpacePageWithPostLazyQuery>;
export type SpacePageWithPostSuspenseQueryHookResult = ReturnType<typeof useSpacePageWithPostSuspenseQuery>;
export type SpacePageWithPostQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePageWithPostQuery,
  SchemaTypes.SpacePageWithPostQueryVariables
>;
export function refetchSpacePageWithPostQuery(variables: SchemaTypes.SpacePageWithPostQueryVariables) {
  return { query: SpacePageWithPostDocument, variables: variables };
}
export const SpaceTreeDocument = gql`
    query SpaceTree($space: UUID!, $treeFirst: Int!, $after: String) {
  tree: subtree(
    root: $space
    maxDepth: 2
    types: ["post", "space"]
    stopAt: ["space"]
    first: $treeFirst
    after: $after
  ) {
    edges {
      cursor
      node {
        id
        entityType
        ...PostCard
        ...NativeSubspaceCard
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${PostCardFragmentDoc}
${NativeSubspaceCardFragmentDoc}`;

/**
 * __useSpaceTreeQuery__
 *
 * To run a query within a React component, call `useSpaceTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTreeQuery({
 *   variables: {
 *      space: // value for 'space'
 *      treeFirst: // value for 'treeFirst'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSpaceTreeQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables> &
    ({ variables: SchemaTypes.SpaceTreeQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>(SpaceTreeDocument, options);
}
export function useSpaceTreeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>(
    SpaceTreeDocument,
    options
  );
}
export function useSpaceTreeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>(
    SpaceTreeDocument,
    options
  );
}
export type SpaceTreeQueryHookResult = ReturnType<typeof useSpaceTreeQuery>;
export type SpaceTreeLazyQueryHookResult = ReturnType<typeof useSpaceTreeLazyQuery>;
export type SpaceTreeSuspenseQueryHookResult = ReturnType<typeof useSpaceTreeSuspenseQuery>;
export type SpaceTreeQueryResult = Apollo.QueryResult<SchemaTypes.SpaceTreeQuery, SchemaTypes.SpaceTreeQueryVariables>;
export function refetchSpaceTreeQuery(variables: SchemaTypes.SpaceTreeQueryVariables) {
  return { query: SpaceTreeDocument, variables: variables };
}
export const SpaceVirtualContributorsDocument = gql`
    query SpaceVirtualContributors($space: UUID!, $membersFirst: Int!, $after: String) {
  members(
    resource: $space
    actorType: "virtual_contributor"
    first: $membersFirst
    after: $after
  ) {
    edges {
      cursor
      node {
        id
        actor {
          ...ActorIdentity
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${ActorIdentityFragmentDoc}`;

/**
 * __useSpaceVirtualContributorsQuery__
 *
 * To run a query within a React component, call `useSpaceVirtualContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceVirtualContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceVirtualContributorsQuery({
 *   variables: {
 *      space: // value for 'space'
 *      membersFirst: // value for 'membersFirst'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSpaceVirtualContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceVirtualContributorsQuery,
    SchemaTypes.SpaceVirtualContributorsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceVirtualContributorsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceVirtualContributorsQuery, SchemaTypes.SpaceVirtualContributorsQueryVariables>(
    SpaceVirtualContributorsDocument,
    options
  );
}
export function useSpaceVirtualContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceVirtualContributorsQuery,
    SchemaTypes.SpaceVirtualContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceVirtualContributorsQuery,
    SchemaTypes.SpaceVirtualContributorsQueryVariables
  >(SpaceVirtualContributorsDocument, options);
}
export function useSpaceVirtualContributorsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceVirtualContributorsQuery,
        SchemaTypes.SpaceVirtualContributorsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceVirtualContributorsQuery,
    SchemaTypes.SpaceVirtualContributorsQueryVariables
  >(SpaceVirtualContributorsDocument, options);
}
export type SpaceVirtualContributorsQueryHookResult = ReturnType<typeof useSpaceVirtualContributorsQuery>;
export type SpaceVirtualContributorsLazyQueryHookResult = ReturnType<typeof useSpaceVirtualContributorsLazyQuery>;
export type SpaceVirtualContributorsSuspenseQueryHookResult = ReturnType<
  typeof useSpaceVirtualContributorsSuspenseQuery
>;
export type SpaceVirtualContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceVirtualContributorsQuery,
  SchemaTypes.SpaceVirtualContributorsQueryVariables
>;
export function refetchSpaceVirtualContributorsQuery(variables: SchemaTypes.SpaceVirtualContributorsQueryVariables) {
  return { query: SpaceVirtualContributorsDocument, variables: variables };
}
export const SpaceCommunityAdminDocument = gql`
    query SpaceCommunityAdmin($space: UUID!) {
  node(id: $space) {
    id
    entityType
    ... on Space {
      can {
        invite
        manageMembers
      }
    }
  }
  rolePolicies(resource: $space) {
    role
    actorType
    minHolders
    maxHolders
    holders
  }
}
    `;

/**
 * __useSpaceCommunityAdminQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityAdminQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useSpaceCommunityAdminQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityAdminQuery,
    SchemaTypes.SpaceCommunityAdminQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCommunityAdminQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityAdminQuery, SchemaTypes.SpaceCommunityAdminQueryVariables>(
    SpaceCommunityAdminDocument,
    options
  );
}
export function useSpaceCommunityAdminLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityAdminQuery,
    SchemaTypes.SpaceCommunityAdminQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCommunityAdminQuery, SchemaTypes.SpaceCommunityAdminQueryVariables>(
    SpaceCommunityAdminDocument,
    options
  );
}
export function useSpaceCommunityAdminSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCommunityAdminQuery,
        SchemaTypes.SpaceCommunityAdminQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceCommunityAdminQuery, SchemaTypes.SpaceCommunityAdminQueryVariables>(
    SpaceCommunityAdminDocument,
    options
  );
}
export type SpaceCommunityAdminQueryHookResult = ReturnType<typeof useSpaceCommunityAdminQuery>;
export type SpaceCommunityAdminLazyQueryHookResult = ReturnType<typeof useSpaceCommunityAdminLazyQuery>;
export type SpaceCommunityAdminSuspenseQueryHookResult = ReturnType<typeof useSpaceCommunityAdminSuspenseQuery>;
export type SpaceCommunityAdminQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityAdminQuery,
  SchemaTypes.SpaceCommunityAdminQueryVariables
>;
export function refetchSpaceCommunityAdminQuery(variables: SchemaTypes.SpaceCommunityAdminQueryVariables) {
  return { query: SpaceCommunityAdminDocument, variables: variables };
}
export const SpaceCommunityMembersDocument = gql`
    query SpaceCommunityMembers($space: UUID!, $first: Int!, $after: String) {
  members(resource: $space, first: $first, after: $after) {
    edges {
      node {
        roles
        actor {
          ...SpaceCommunityActor
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${SpaceCommunityActorFragmentDoc}`;

/**
 * __useSpaceCommunityMembersQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityMembersQuery({
 *   variables: {
 *      space: // value for 'space'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSpaceCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityMembersQuery,
    SchemaTypes.SpaceCommunityMembersQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCommunityMembersQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityMembersQuery, SchemaTypes.SpaceCommunityMembersQueryVariables>(
    SpaceCommunityMembersDocument,
    options
  );
}
export function useSpaceCommunityMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityMembersQuery,
    SchemaTypes.SpaceCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCommunityMembersQuery, SchemaTypes.SpaceCommunityMembersQueryVariables>(
    SpaceCommunityMembersDocument,
    options
  );
}
export function useSpaceCommunityMembersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCommunityMembersQuery,
        SchemaTypes.SpaceCommunityMembersQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceCommunityMembersQuery,
    SchemaTypes.SpaceCommunityMembersQueryVariables
  >(SpaceCommunityMembersDocument, options);
}
export type SpaceCommunityMembersQueryHookResult = ReturnType<typeof useSpaceCommunityMembersQuery>;
export type SpaceCommunityMembersLazyQueryHookResult = ReturnType<typeof useSpaceCommunityMembersLazyQuery>;
export type SpaceCommunityMembersSuspenseQueryHookResult = ReturnType<typeof useSpaceCommunityMembersSuspenseQuery>;
export type SpaceCommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityMembersQuery,
  SchemaTypes.SpaceCommunityMembersQueryVariables
>;
export function refetchSpaceCommunityMembersQuery(variables: SchemaTypes.SpaceCommunityMembersQueryVariables) {
  return { query: SpaceCommunityMembersDocument, variables: variables };
}
export const SpaceCommunityInviteTargetDocument = gql`
    query SpaceCommunityInviteTarget($space: UUID!) {
  node(id: $space) {
    id
    entityType
    ... on Space {
      about {
        displayName
      }
    }
  }
}
    `;

/**
 * __useSpaceCommunityInviteTargetQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityInviteTargetQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityInviteTargetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityInviteTargetQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useSpaceCommunityInviteTargetQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityInviteTargetQuery,
    SchemaTypes.SpaceCommunityInviteTargetQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCommunityInviteTargetQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCommunityInviteTargetQuery,
    SchemaTypes.SpaceCommunityInviteTargetQueryVariables
  >(SpaceCommunityInviteTargetDocument, options);
}
export function useSpaceCommunityInviteTargetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityInviteTargetQuery,
    SchemaTypes.SpaceCommunityInviteTargetQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCommunityInviteTargetQuery,
    SchemaTypes.SpaceCommunityInviteTargetQueryVariables
  >(SpaceCommunityInviteTargetDocument, options);
}
export function useSpaceCommunityInviteTargetSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCommunityInviteTargetQuery,
        SchemaTypes.SpaceCommunityInviteTargetQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceCommunityInviteTargetQuery,
    SchemaTypes.SpaceCommunityInviteTargetQueryVariables
  >(SpaceCommunityInviteTargetDocument, options);
}
export type SpaceCommunityInviteTargetQueryHookResult = ReturnType<typeof useSpaceCommunityInviteTargetQuery>;
export type SpaceCommunityInviteTargetLazyQueryHookResult = ReturnType<typeof useSpaceCommunityInviteTargetLazyQuery>;
export type SpaceCommunityInviteTargetSuspenseQueryHookResult = ReturnType<
  typeof useSpaceCommunityInviteTargetSuspenseQuery
>;
export type SpaceCommunityInviteTargetQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityInviteTargetQuery,
  SchemaTypes.SpaceCommunityInviteTargetQueryVariables
>;
export function refetchSpaceCommunityInviteTargetQuery(
  variables: SchemaTypes.SpaceCommunityInviteTargetQueryVariables
) {
  return { query: SpaceCommunityInviteTargetDocument, variables: variables };
}
export const SpaceCommunityCandidatesDocument = gql`
    query SpaceCommunityCandidates($space: UUID!, $role: String!, $entry: CandidateEntry!, $actorType: String, $terms: String, $first: Int!, $after: String) {
  candidates(
    resource: $space
    role: $role
    entry: $entry
    actorType: $actorType
    terms: $terms
    first: $first
    after: $after
  ) {
    edges {
      node {
        id
        actorType
        url
        about {
          displayName
          description
          location
          avatar {
            file {
              url
            }
          }
        }
        ... on Agent {
          keywords
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useSpaceCommunityCandidatesQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityCandidatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityCandidatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityCandidatesQuery({
 *   variables: {
 *      space: // value for 'space'
 *      role: // value for 'role'
 *      entry: // value for 'entry'
 *      actorType: // value for 'actorType'
 *      terms: // value for 'terms'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSpaceCommunityCandidatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityCandidatesQuery,
    SchemaTypes.SpaceCommunityCandidatesQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCommunityCandidatesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityCandidatesQuery, SchemaTypes.SpaceCommunityCandidatesQueryVariables>(
    SpaceCommunityCandidatesDocument,
    options
  );
}
export function useSpaceCommunityCandidatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityCandidatesQuery,
    SchemaTypes.SpaceCommunityCandidatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCommunityCandidatesQuery,
    SchemaTypes.SpaceCommunityCandidatesQueryVariables
  >(SpaceCommunityCandidatesDocument, options);
}
export function useSpaceCommunityCandidatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCommunityCandidatesQuery,
        SchemaTypes.SpaceCommunityCandidatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceCommunityCandidatesQuery,
    SchemaTypes.SpaceCommunityCandidatesQueryVariables
  >(SpaceCommunityCandidatesDocument, options);
}
export type SpaceCommunityCandidatesQueryHookResult = ReturnType<typeof useSpaceCommunityCandidatesQuery>;
export type SpaceCommunityCandidatesLazyQueryHookResult = ReturnType<typeof useSpaceCommunityCandidatesLazyQuery>;
export type SpaceCommunityCandidatesSuspenseQueryHookResult = ReturnType<
  typeof useSpaceCommunityCandidatesSuspenseQuery
>;
export type SpaceCommunityCandidatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityCandidatesQuery,
  SchemaTypes.SpaceCommunityCandidatesQueryVariables
>;
export function refetchSpaceCommunityCandidatesQuery(variables: SchemaTypes.SpaceCommunityCandidatesQueryVariables) {
  return { query: SpaceCommunityCandidatesDocument, variables: variables };
}
export const SpaceCommunityVirtualContributorPickerDocument = gql`
    query SpaceCommunityVirtualContributorPicker($space: UUID!) {
  candidates(
    resource: $space
    role: "member"
    entry: DIRECT
    actorType: "virtual_contributor"
    first: 1
  ) {
    edges {
      node {
        id
      }
    }
  }
}
    `;

/**
 * __useSpaceCommunityVirtualContributorPickerQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityVirtualContributorPickerQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityVirtualContributorPickerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityVirtualContributorPickerQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useSpaceCommunityVirtualContributorPickerQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
    SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
  > &
    (
      | { variables: SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
    SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
  >(SpaceCommunityVirtualContributorPickerDocument, options);
}
export function useSpaceCommunityVirtualContributorPickerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
    SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
    SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
  >(SpaceCommunityVirtualContributorPickerDocument, options);
}
export function useSpaceCommunityVirtualContributorPickerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
        SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
    SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
  >(SpaceCommunityVirtualContributorPickerDocument, options);
}
export type SpaceCommunityVirtualContributorPickerQueryHookResult = ReturnType<
  typeof useSpaceCommunityVirtualContributorPickerQuery
>;
export type SpaceCommunityVirtualContributorPickerLazyQueryHookResult = ReturnType<
  typeof useSpaceCommunityVirtualContributorPickerLazyQuery
>;
export type SpaceCommunityVirtualContributorPickerSuspenseQueryHookResult = ReturnType<
  typeof useSpaceCommunityVirtualContributorPickerSuspenseQuery
>;
export type SpaceCommunityVirtualContributorPickerQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityVirtualContributorPickerQuery,
  SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
>;
export function refetchSpaceCommunityVirtualContributorPickerQuery(
  variables: SchemaTypes.SpaceCommunityVirtualContributorPickerQueryVariables
) {
  return { query: SpaceCommunityVirtualContributorPickerDocument, variables: variables };
}
export const SetSpaceCommunityRolesDocument = gql`
    mutation SetSpaceCommunityRoles($space: UUID!, $actor: UUID!, $roles: [String!]!) {
  setRoles(resource: $space, actor: $actor, roles: $roles) {
    node {
      id
    }
  }
}
    `;
export type SetSpaceCommunityRolesMutationFn = Apollo.MutationFunction<
  SchemaTypes.SetSpaceCommunityRolesMutation,
  SchemaTypes.SetSpaceCommunityRolesMutationVariables
>;

/**
 * __useSetSpaceCommunityRolesMutation__
 *
 * To run a mutation, you first call `useSetSpaceCommunityRolesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetSpaceCommunityRolesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setSpaceCommunityRolesMutation, { data, loading, error }] = useSetSpaceCommunityRolesMutation({
 *   variables: {
 *      space: // value for 'space'
 *      actor: // value for 'actor'
 *      roles: // value for 'roles'
 *   },
 * });
 */
export function useSetSpaceCommunityRolesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SetSpaceCommunityRolesMutation,
    SchemaTypes.SetSpaceCommunityRolesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SetSpaceCommunityRolesMutation,
    SchemaTypes.SetSpaceCommunityRolesMutationVariables
  >(SetSpaceCommunityRolesDocument, options);
}
export type SetSpaceCommunityRolesMutationHookResult = ReturnType<typeof useSetSpaceCommunityRolesMutation>;
export type SetSpaceCommunityRolesMutationResult = Apollo.MutationResult<SchemaTypes.SetSpaceCommunityRolesMutation>;
export type SetSpaceCommunityRolesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SetSpaceCommunityRolesMutation,
  SchemaTypes.SetSpaceCommunityRolesMutationVariables
>;
export const InviteToSpaceCommunityDocument = gql`
    mutation InviteToSpaceCommunity($space: UUID!, $input: InviteInput!) {
  invite(resource: $space, input: $input) {
    actor
    email
    outcome
    noOrganizationAdmin
    request {
      id
    }
  }
}
    `;
export type InviteToSpaceCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteToSpaceCommunityMutation,
  SchemaTypes.InviteToSpaceCommunityMutationVariables
>;

/**
 * __useInviteToSpaceCommunityMutation__
 *
 * To run a mutation, you first call `useInviteToSpaceCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteToSpaceCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteToSpaceCommunityMutation, { data, loading, error }] = useInviteToSpaceCommunityMutation({
 *   variables: {
 *      space: // value for 'space'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInviteToSpaceCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteToSpaceCommunityMutation,
    SchemaTypes.InviteToSpaceCommunityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.InviteToSpaceCommunityMutation,
    SchemaTypes.InviteToSpaceCommunityMutationVariables
  >(InviteToSpaceCommunityDocument, options);
}
export type InviteToSpaceCommunityMutationHookResult = ReturnType<typeof useInviteToSpaceCommunityMutation>;
export type InviteToSpaceCommunityMutationResult = Apollo.MutationResult<SchemaTypes.InviteToSpaceCommunityMutation>;
export type InviteToSpaceCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteToSpaceCommunityMutation,
  SchemaTypes.InviteToSpaceCommunityMutationVariables
>;
export const V2DashboardMembershipProbeDocument = gql`
    query V2DashboardMembershipProbe {
  spaces(filter: {membership: true}, first: 1) {
    edges {
      node {
        id
      }
    }
  }
}
    `;

/**
 * __useV2DashboardMembershipProbeQuery__
 *
 * To run a query within a React component, call `useV2DashboardMembershipProbeQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardMembershipProbeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardMembershipProbeQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2DashboardMembershipProbeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardMembershipProbeQuery,
    SchemaTypes.V2DashboardMembershipProbeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.V2DashboardMembershipProbeQuery,
    SchemaTypes.V2DashboardMembershipProbeQueryVariables
  >(V2DashboardMembershipProbeDocument, options);
}
export function useV2DashboardMembershipProbeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardMembershipProbeQuery,
    SchemaTypes.V2DashboardMembershipProbeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.V2DashboardMembershipProbeQuery,
    SchemaTypes.V2DashboardMembershipProbeQueryVariables
  >(V2DashboardMembershipProbeDocument, options);
}
export function useV2DashboardMembershipProbeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardMembershipProbeQuery,
        SchemaTypes.V2DashboardMembershipProbeQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardMembershipProbeQuery,
    SchemaTypes.V2DashboardMembershipProbeQueryVariables
  >(V2DashboardMembershipProbeDocument, options);
}
export type V2DashboardMembershipProbeQueryHookResult = ReturnType<typeof useV2DashboardMembershipProbeQuery>;
export type V2DashboardMembershipProbeLazyQueryHookResult = ReturnType<typeof useV2DashboardMembershipProbeLazyQuery>;
export type V2DashboardMembershipProbeSuspenseQueryHookResult = ReturnType<
  typeof useV2DashboardMembershipProbeSuspenseQuery
>;
export type V2DashboardMembershipProbeQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardMembershipProbeQuery,
  SchemaTypes.V2DashboardMembershipProbeQueryVariables
>;
export function refetchV2DashboardMembershipProbeQuery(
  variables?: SchemaTypes.V2DashboardMembershipProbeQueryVariables
) {
  return { query: V2DashboardMembershipProbeDocument, variables: variables };
}
export const V2DashboardRecentSpacesDocument = gql`
    query V2DashboardRecentSpaces($first: Int!) {
  viewer {
    id
    recentSpaces(first: $first) {
      lastParticipatedAt
      space {
        ...V2DashboardSpaceCard
      }
    }
    homeSpace {
      ...V2DashboardSpaceCard
    }
  }
}
    ${V2DashboardSpaceCardFragmentDoc}`;

/**
 * __useV2DashboardRecentSpacesQuery__
 *
 * To run a query within a React component, call `useV2DashboardRecentSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardRecentSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardRecentSpacesQuery({
 *   variables: {
 *      first: // value for 'first'
 *   },
 * });
 */
export function useV2DashboardRecentSpacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardRecentSpacesQuery,
    SchemaTypes.V2DashboardRecentSpacesQueryVariables
  > &
    ({ variables: SchemaTypes.V2DashboardRecentSpacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2DashboardRecentSpacesQuery, SchemaTypes.V2DashboardRecentSpacesQueryVariables>(
    V2DashboardRecentSpacesDocument,
    options
  );
}
export function useV2DashboardRecentSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardRecentSpacesQuery,
    SchemaTypes.V2DashboardRecentSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.V2DashboardRecentSpacesQuery,
    SchemaTypes.V2DashboardRecentSpacesQueryVariables
  >(V2DashboardRecentSpacesDocument, options);
}
export function useV2DashboardRecentSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardRecentSpacesQuery,
        SchemaTypes.V2DashboardRecentSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardRecentSpacesQuery,
    SchemaTypes.V2DashboardRecentSpacesQueryVariables
  >(V2DashboardRecentSpacesDocument, options);
}
export type V2DashboardRecentSpacesQueryHookResult = ReturnType<typeof useV2DashboardRecentSpacesQuery>;
export type V2DashboardRecentSpacesLazyQueryHookResult = ReturnType<typeof useV2DashboardRecentSpacesLazyQuery>;
export type V2DashboardRecentSpacesSuspenseQueryHookResult = ReturnType<typeof useV2DashboardRecentSpacesSuspenseQuery>;
export type V2DashboardRecentSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardRecentSpacesQuery,
  SchemaTypes.V2DashboardRecentSpacesQueryVariables
>;
export function refetchV2DashboardRecentSpacesQuery(variables: SchemaTypes.V2DashboardRecentSpacesQueryVariables) {
  return { query: V2DashboardRecentSpacesDocument, variables: variables };
}
export const V2DashboardMembershipsDocument = gql`
    query V2DashboardMemberships {
  viewer {
    id
    actor {
      id
      ... on User {
        memberships {
          roles
          space {
            ...V2DashboardSpaceCard
            activityScore
            parent {
              id
            }
          }
        }
      }
    }
  }
}
    ${V2DashboardSpaceCardFragmentDoc}`;

/**
 * __useV2DashboardMembershipsQuery__
 *
 * To run a query within a React component, call `useV2DashboardMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2DashboardMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardMembershipsQuery,
    SchemaTypes.V2DashboardMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2DashboardMembershipsQuery, SchemaTypes.V2DashboardMembershipsQueryVariables>(
    V2DashboardMembershipsDocument,
    options
  );
}
export function useV2DashboardMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardMembershipsQuery,
    SchemaTypes.V2DashboardMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2DashboardMembershipsQuery, SchemaTypes.V2DashboardMembershipsQueryVariables>(
    V2DashboardMembershipsDocument,
    options
  );
}
export function useV2DashboardMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardMembershipsQuery,
        SchemaTypes.V2DashboardMembershipsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardMembershipsQuery,
    SchemaTypes.V2DashboardMembershipsQueryVariables
  >(V2DashboardMembershipsDocument, options);
}
export type V2DashboardMembershipsQueryHookResult = ReturnType<typeof useV2DashboardMembershipsQuery>;
export type V2DashboardMembershipsLazyQueryHookResult = ReturnType<typeof useV2DashboardMembershipsLazyQuery>;
export type V2DashboardMembershipsSuspenseQueryHookResult = ReturnType<typeof useV2DashboardMembershipsSuspenseQuery>;
export type V2DashboardMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardMembershipsQuery,
  SchemaTypes.V2DashboardMembershipsQueryVariables
>;
export function refetchV2DashboardMembershipsQuery(variables?: SchemaTypes.V2DashboardMembershipsQueryVariables) {
  return { query: V2DashboardMembershipsDocument, variables: variables };
}
export const V2DashboardMostActiveSpacesDocument = gql`
    query V2DashboardMostActiveSpaces($days: Int!, $first: Int!) {
  spaces(
    filter: {mostActiveDays: $days, depths: [0, 1], status: [ACTIVE]}
    first: $first
  ) {
    edges {
      node {
        ...V2DashboardSpaceCard
      }
    }
  }
}
    ${V2DashboardSpaceCardFragmentDoc}`;

/**
 * __useV2DashboardMostActiveSpacesQuery__
 *
 * To run a query within a React component, call `useV2DashboardMostActiveSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardMostActiveSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardMostActiveSpacesQuery({
 *   variables: {
 *      days: // value for 'days'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useV2DashboardMostActiveSpacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardMostActiveSpacesQuery,
    SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
  > &
    ({ variables: SchemaTypes.V2DashboardMostActiveSpacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.V2DashboardMostActiveSpacesQuery,
    SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
  >(V2DashboardMostActiveSpacesDocument, options);
}
export function useV2DashboardMostActiveSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardMostActiveSpacesQuery,
    SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.V2DashboardMostActiveSpacesQuery,
    SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
  >(V2DashboardMostActiveSpacesDocument, options);
}
export function useV2DashboardMostActiveSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardMostActiveSpacesQuery,
        SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardMostActiveSpacesQuery,
    SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
  >(V2DashboardMostActiveSpacesDocument, options);
}
export type V2DashboardMostActiveSpacesQueryHookResult = ReturnType<typeof useV2DashboardMostActiveSpacesQuery>;
export type V2DashboardMostActiveSpacesLazyQueryHookResult = ReturnType<typeof useV2DashboardMostActiveSpacesLazyQuery>;
export type V2DashboardMostActiveSpacesSuspenseQueryHookResult = ReturnType<
  typeof useV2DashboardMostActiveSpacesSuspenseQuery
>;
export type V2DashboardMostActiveSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardMostActiveSpacesQuery,
  SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
>;
export function refetchV2DashboardMostActiveSpacesQuery(
  variables: SchemaTypes.V2DashboardMostActiveSpacesQueryVariables
) {
  return { query: V2DashboardMostActiveSpacesDocument, variables: variables };
}
export const V2DashboardHostedResourcesDocument = gql`
    query V2DashboardHostedResources {
  viewer {
    id
    account {
      id
      canCreate {
        kind
        allowed
        reason
        byEntitlement {
          name
          allowed
        }
      }
      hosted {
        spaces {
          ...V2DashboardSpaceCard
          activityScore
        }
        agents {
          id
          url
          about {
            displayName
            avatar {
              ...V2FileRef
            }
          }
        }
        packs {
          id
          url
          about {
            displayName
            avatar {
              ...V2FileRef
            }
          }
        }
        homepages {
          id
          url
          about {
            displayName
            avatar {
              ...V2FileRef
            }
          }
        }
      }
    }
  }
}
    ${V2DashboardSpaceCardFragmentDoc}
${V2FileRefFragmentDoc}`;

/**
 * __useV2DashboardHostedResourcesQuery__
 *
 * To run a query within a React component, call `useV2DashboardHostedResourcesQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardHostedResourcesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardHostedResourcesQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2DashboardHostedResourcesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardHostedResourcesQuery,
    SchemaTypes.V2DashboardHostedResourcesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.V2DashboardHostedResourcesQuery,
    SchemaTypes.V2DashboardHostedResourcesQueryVariables
  >(V2DashboardHostedResourcesDocument, options);
}
export function useV2DashboardHostedResourcesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardHostedResourcesQuery,
    SchemaTypes.V2DashboardHostedResourcesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.V2DashboardHostedResourcesQuery,
    SchemaTypes.V2DashboardHostedResourcesQueryVariables
  >(V2DashboardHostedResourcesDocument, options);
}
export function useV2DashboardHostedResourcesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardHostedResourcesQuery,
        SchemaTypes.V2DashboardHostedResourcesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardHostedResourcesQuery,
    SchemaTypes.V2DashboardHostedResourcesQueryVariables
  >(V2DashboardHostedResourcesDocument, options);
}
export type V2DashboardHostedResourcesQueryHookResult = ReturnType<typeof useV2DashboardHostedResourcesQuery>;
export type V2DashboardHostedResourcesLazyQueryHookResult = ReturnType<typeof useV2DashboardHostedResourcesLazyQuery>;
export type V2DashboardHostedResourcesSuspenseQueryHookResult = ReturnType<
  typeof useV2DashboardHostedResourcesSuspenseQuery
>;
export type V2DashboardHostedResourcesQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardHostedResourcesQuery,
  SchemaTypes.V2DashboardHostedResourcesQueryVariables
>;
export function refetchV2DashboardHostedResourcesQuery(
  variables?: SchemaTypes.V2DashboardHostedResourcesQueryVariables
) {
  return { query: V2DashboardHostedResourcesDocument, variables: variables };
}
export const V2DashboardFeedSpacesDocument = gql`
    query V2DashboardFeedSpaces {
  spaces(filter: {membership: true}) {
    edges {
      node {
        id
        about {
          displayName
        }
      }
    }
  }
}
    `;

/**
 * __useV2DashboardFeedSpacesQuery__
 *
 * To run a query within a React component, call `useV2DashboardFeedSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardFeedSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardFeedSpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useV2DashboardFeedSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardFeedSpacesQuery,
    SchemaTypes.V2DashboardFeedSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2DashboardFeedSpacesQuery, SchemaTypes.V2DashboardFeedSpacesQueryVariables>(
    V2DashboardFeedSpacesDocument,
    options
  );
}
export function useV2DashboardFeedSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardFeedSpacesQuery,
    SchemaTypes.V2DashboardFeedSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2DashboardFeedSpacesQuery, SchemaTypes.V2DashboardFeedSpacesQueryVariables>(
    V2DashboardFeedSpacesDocument,
    options
  );
}
export function useV2DashboardFeedSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardFeedSpacesQuery,
        SchemaTypes.V2DashboardFeedSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardFeedSpacesQuery,
    SchemaTypes.V2DashboardFeedSpacesQueryVariables
  >(V2DashboardFeedSpacesDocument, options);
}
export type V2DashboardFeedSpacesQueryHookResult = ReturnType<typeof useV2DashboardFeedSpacesQuery>;
export type V2DashboardFeedSpacesLazyQueryHookResult = ReturnType<typeof useV2DashboardFeedSpacesLazyQuery>;
export type V2DashboardFeedSpacesSuspenseQueryHookResult = ReturnType<typeof useV2DashboardFeedSpacesSuspenseQuery>;
export type V2DashboardFeedSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardFeedSpacesQuery,
  SchemaTypes.V2DashboardFeedSpacesQueryVariables
>;
export function refetchV2DashboardFeedSpacesQuery(variables?: SchemaTypes.V2DashboardFeedSpacesQueryVariables) {
  return { query: V2DashboardFeedSpacesDocument, variables: variables };
}
export const V2DashboardActivityDocument = gql`
    query V2DashboardActivity($space: UUID, $mine: Boolean!, $roles: [String!], $excludeTypes: [String!], $first: Int!, $after: String) {
  activity(
    space: $space
    mine: $mine
    roles: $roles
    excludeTypes: $excludeTypes
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        id
        type
        createdAt
        actor {
          id
          about {
            displayName
            avatar {
              ...V2FileRef
            }
          }
        }
        space {
          id
          url
          about {
            displayName
          }
        }
        subject {
          id
          entityType
          ... on Post {
            url
            about {
              displayName
            }
            parentPost {
              id
              url
              about {
                displayName
              }
            }
          }
          ... on Document {
            url
            documentAbout: about {
              displayName
            }
          }
          ... on Space {
            url
            about {
              displayName
            }
          }
          ... on Actor {
            url
            actorAbout: about {
              displayName
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${V2FileRefFragmentDoc}`;

/**
 * __useV2DashboardActivityQuery__
 *
 * To run a query within a React component, call `useV2DashboardActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardActivityQuery({
 *   variables: {
 *      space: // value for 'space'
 *      mine: // value for 'mine'
 *      roles: // value for 'roles'
 *      excludeTypes: // value for 'excludeTypes'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useV2DashboardActivityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardActivityQuery,
    SchemaTypes.V2DashboardActivityQueryVariables
  > &
    ({ variables: SchemaTypes.V2DashboardActivityQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2DashboardActivityQuery, SchemaTypes.V2DashboardActivityQueryVariables>(
    V2DashboardActivityDocument,
    options
  );
}
export function useV2DashboardActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardActivityQuery,
    SchemaTypes.V2DashboardActivityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2DashboardActivityQuery, SchemaTypes.V2DashboardActivityQueryVariables>(
    V2DashboardActivityDocument,
    options
  );
}
export function useV2DashboardActivitySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardActivityQuery,
        SchemaTypes.V2DashboardActivityQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2DashboardActivityQuery, SchemaTypes.V2DashboardActivityQueryVariables>(
    V2DashboardActivityDocument,
    options
  );
}
export type V2DashboardActivityQueryHookResult = ReturnType<typeof useV2DashboardActivityQuery>;
export type V2DashboardActivityLazyQueryHookResult = ReturnType<typeof useV2DashboardActivityLazyQuery>;
export type V2DashboardActivitySuspenseQueryHookResult = ReturnType<typeof useV2DashboardActivitySuspenseQuery>;
export type V2DashboardActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardActivityQuery,
  SchemaTypes.V2DashboardActivityQueryVariables
>;
export function refetchV2DashboardActivityQuery(variables: SchemaTypes.V2DashboardActivityQueryVariables) {
  return { query: V2DashboardActivityDocument, variables: variables };
}
export const V2DashboardSaveUserSettingsDocument = gql`
    mutation V2DashboardSaveUserSettings($id: UUID!, $value: JSON!) {
  setSettings(id: $id, namespace: "core", name: "user_settings", value: $value) {
    id
    settings
  }
}
    `;
export type V2DashboardSaveUserSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.V2DashboardSaveUserSettingsMutation,
  SchemaTypes.V2DashboardSaveUserSettingsMutationVariables
>;

/**
 * __useV2DashboardSaveUserSettingsMutation__
 *
 * To run a mutation, you first call `useV2DashboardSaveUserSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardSaveUserSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [v2DashboardSaveUserSettingsMutation, { data, loading, error }] = useV2DashboardSaveUserSettingsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useV2DashboardSaveUserSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.V2DashboardSaveUserSettingsMutation,
    SchemaTypes.V2DashboardSaveUserSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.V2DashboardSaveUserSettingsMutation,
    SchemaTypes.V2DashboardSaveUserSettingsMutationVariables
  >(V2DashboardSaveUserSettingsDocument, options);
}
export type V2DashboardSaveUserSettingsMutationHookResult = ReturnType<typeof useV2DashboardSaveUserSettingsMutation>;
export type V2DashboardSaveUserSettingsMutationResult =
  Apollo.MutationResult<SchemaTypes.V2DashboardSaveUserSettingsMutation>;
export type V2DashboardSaveUserSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.V2DashboardSaveUserSettingsMutation,
  SchemaTypes.V2DashboardSaveUserSettingsMutationVariables
>;
export const V2DashboardWelcomeSpaceDocument = gql`
    query V2DashboardWelcomeSpace($url: String!) {
  resolve(url: $url) {
    state
    remainder
    node {
      id
      entityType
      ... on Space {
        ...V2DashboardSpaceCard
      }
    }
  }
}
    ${V2DashboardSpaceCardFragmentDoc}`;

/**
 * __useV2DashboardWelcomeSpaceQuery__
 *
 * To run a query within a React component, call `useV2DashboardWelcomeSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2DashboardWelcomeSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2DashboardWelcomeSpaceQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useV2DashboardWelcomeSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.V2DashboardWelcomeSpaceQuery,
    SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.V2DashboardWelcomeSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2DashboardWelcomeSpaceQuery, SchemaTypes.V2DashboardWelcomeSpaceQueryVariables>(
    V2DashboardWelcomeSpaceDocument,
    options
  );
}
export function useV2DashboardWelcomeSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.V2DashboardWelcomeSpaceQuery,
    SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.V2DashboardWelcomeSpaceQuery,
    SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
  >(V2DashboardWelcomeSpaceDocument, options);
}
export function useV2DashboardWelcomeSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.V2DashboardWelcomeSpaceQuery,
        SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.V2DashboardWelcomeSpaceQuery,
    SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
  >(V2DashboardWelcomeSpaceDocument, options);
}
export type V2DashboardWelcomeSpaceQueryHookResult = ReturnType<typeof useV2DashboardWelcomeSpaceQuery>;
export type V2DashboardWelcomeSpaceLazyQueryHookResult = ReturnType<typeof useV2DashboardWelcomeSpaceLazyQuery>;
export type V2DashboardWelcomeSpaceSuspenseQueryHookResult = ReturnType<typeof useV2DashboardWelcomeSpaceSuspenseQuery>;
export type V2DashboardWelcomeSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.V2DashboardWelcomeSpaceQuery,
  SchemaTypes.V2DashboardWelcomeSpaceQueryVariables
>;
export function refetchV2DashboardWelcomeSpaceQuery(variables: SchemaTypes.V2DashboardWelcomeSpaceQueryVariables) {
  return { query: V2DashboardWelcomeSpaceDocument, variables: variables };
}
export const V2HomepageDocument = gql`
    query V2Homepage($id: UUID!) {
  node(id: $id) {
    id
    ... on Space {
      kind
      url
      settings
      subdomain
      can {
        update
      }
      about {
        displayName
        tagline
        description
        banner {
          alt
          ...V2FileRef
        }
      }
      curated {
        role
        sortOrder
        node {
          id
          entityType
          ... on Space {
            kind
            url
            tags
            templateCount
            about {
              displayName
              description
              avatar {
                ...V2FileRef
              }
            }
            host {
              about {
                displayName
                avatar {
                  ...V2FileRef
                }
              }
              url
            }
          }
          ... on Agent {
            actorType
            url
            about {
              displayName
              tagline
              avatar {
                ...V2FileRef
              }
            }
          }
        }
      }
    }
  }
}
    ${V2FileRefFragmentDoc}`;

/**
 * __useV2HomepageQuery__
 *
 * To run a query within a React component, call `useV2HomepageQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2HomepageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2HomepageQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useV2HomepageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables> &
    ({ variables: SchemaTypes.V2HomepageQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables>(
    V2HomepageDocument,
    options
  );
}
export function useV2HomepageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables>(
    V2HomepageDocument,
    options
  );
}
export function useV2HomepageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2HomepageQuery, SchemaTypes.V2HomepageQueryVariables>(
    V2HomepageDocument,
    options
  );
}
export type V2HomepageQueryHookResult = ReturnType<typeof useV2HomepageQuery>;
export type V2HomepageLazyQueryHookResult = ReturnType<typeof useV2HomepageLazyQuery>;
export type V2HomepageSuspenseQueryHookResult = ReturnType<typeof useV2HomepageSuspenseQuery>;
export type V2HomepageQueryResult = Apollo.QueryResult<
  SchemaTypes.V2HomepageQuery,
  SchemaTypes.V2HomepageQueryVariables
>;
export function refetchV2HomepageQuery(variables: SchemaTypes.V2HomepageQueryVariables) {
  return { query: V2HomepageDocument, variables: variables };
}
export const ExplorerRootSpacesDocument = gql`
    query ExplorerRootSpaces($first: Int!, $after: String) {
  spaces(
    filter: {kind: SPACE, depths: [0], status: [ACTIVE]}
    first: $first
    after: $after
  ) {
    edges {
      node {
        id
        depth
        status
        url
        about {
          displayName
          tagline
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useExplorerRootSpacesQuery__
 *
 * To run a query within a React component, call `useExplorerRootSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerRootSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerRootSpacesQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useExplorerRootSpacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ExplorerRootSpacesQuery,
    SchemaTypes.ExplorerRootSpacesQueryVariables
  > &
    ({ variables: SchemaTypes.ExplorerRootSpacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ExplorerRootSpacesQuery, SchemaTypes.ExplorerRootSpacesQueryVariables>(
    ExplorerRootSpacesDocument,
    options
  );
}
export function useExplorerRootSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ExplorerRootSpacesQuery,
    SchemaTypes.ExplorerRootSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ExplorerRootSpacesQuery, SchemaTypes.ExplorerRootSpacesQueryVariables>(
    ExplorerRootSpacesDocument,
    options
  );
}
export function useExplorerRootSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ExplorerRootSpacesQuery, SchemaTypes.ExplorerRootSpacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ExplorerRootSpacesQuery, SchemaTypes.ExplorerRootSpacesQueryVariables>(
    ExplorerRootSpacesDocument,
    options
  );
}
export type ExplorerRootSpacesQueryHookResult = ReturnType<typeof useExplorerRootSpacesQuery>;
export type ExplorerRootSpacesLazyQueryHookResult = ReturnType<typeof useExplorerRootSpacesLazyQuery>;
export type ExplorerRootSpacesSuspenseQueryHookResult = ReturnType<typeof useExplorerRootSpacesSuspenseQuery>;
export type ExplorerRootSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.ExplorerRootSpacesQuery,
  SchemaTypes.ExplorerRootSpacesQueryVariables
>;
export function refetchExplorerRootSpacesQuery(variables: SchemaTypes.ExplorerRootSpacesQueryVariables) {
  return { query: ExplorerRootSpacesDocument, variables: variables };
}
export const ExplorerSpaceTreeDocument = gql`
    query ExplorerSpaceTree($platform: UUID!, $after: String) {
  subtree(
    root: $platform
    maxDepth: 2
    types: ["space"]
    first: 500
    after: $after
  ) {
    edges {
      node {
        id
        ... on Space {
          ...NativeSubspaceCard
          depth
          parent {
            id
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${NativeSubspaceCardFragmentDoc}`;

/**
 * __useExplorerSpaceTreeQuery__
 *
 * To run a query within a React component, call `useExplorerSpaceTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerSpaceTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerSpaceTreeQuery({
 *   variables: {
 *      platform: // value for 'platform'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useExplorerSpaceTreeQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ExplorerSpaceTreeQuery,
    SchemaTypes.ExplorerSpaceTreeQueryVariables
  > &
    ({ variables: SchemaTypes.ExplorerSpaceTreeQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ExplorerSpaceTreeQuery, SchemaTypes.ExplorerSpaceTreeQueryVariables>(
    ExplorerSpaceTreeDocument,
    options
  );
}
export function useExplorerSpaceTreeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ExplorerSpaceTreeQuery,
    SchemaTypes.ExplorerSpaceTreeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ExplorerSpaceTreeQuery, SchemaTypes.ExplorerSpaceTreeQueryVariables>(
    ExplorerSpaceTreeDocument,
    options
  );
}
export function useExplorerSpaceTreeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ExplorerSpaceTreeQuery, SchemaTypes.ExplorerSpaceTreeQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ExplorerSpaceTreeQuery, SchemaTypes.ExplorerSpaceTreeQueryVariables>(
    ExplorerSpaceTreeDocument,
    options
  );
}
export type ExplorerSpaceTreeQueryHookResult = ReturnType<typeof useExplorerSpaceTreeQuery>;
export type ExplorerSpaceTreeLazyQueryHookResult = ReturnType<typeof useExplorerSpaceTreeLazyQuery>;
export type ExplorerSpaceTreeSuspenseQueryHookResult = ReturnType<typeof useExplorerSpaceTreeSuspenseQuery>;
export type ExplorerSpaceTreeQueryResult = Apollo.QueryResult<
  SchemaTypes.ExplorerSpaceTreeQuery,
  SchemaTypes.ExplorerSpaceTreeQueryVariables
>;
export function refetchExplorerSpaceTreeQuery(variables: SchemaTypes.ExplorerSpaceTreeQueryVariables) {
  return { query: ExplorerSpaceTreeDocument, variables: variables };
}
export const SettingsPostTemplatesDocument = gql`
    query SettingsPostTemplates($space: UUID!) {
  templates(scope: $space, kind: POST) {
    ...SettingsPostTemplateCard
  }
}
    ${SettingsPostTemplateCardFragmentDoc}`;

/**
 * __useSettingsPostTemplatesQuery__
 *
 * To run a query within a React component, call `useSettingsPostTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsPostTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsPostTemplatesQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useSettingsPostTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SettingsPostTemplatesQuery,
    SchemaTypes.SettingsPostTemplatesQueryVariables
  > &
    ({ variables: SchemaTypes.SettingsPostTemplatesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SettingsPostTemplatesQuery, SchemaTypes.SettingsPostTemplatesQueryVariables>(
    SettingsPostTemplatesDocument,
    options
  );
}
export function useSettingsPostTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SettingsPostTemplatesQuery,
    SchemaTypes.SettingsPostTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SettingsPostTemplatesQuery, SchemaTypes.SettingsPostTemplatesQueryVariables>(
    SettingsPostTemplatesDocument,
    options
  );
}
export function useSettingsPostTemplatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SettingsPostTemplatesQuery,
        SchemaTypes.SettingsPostTemplatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SettingsPostTemplatesQuery,
    SchemaTypes.SettingsPostTemplatesQueryVariables
  >(SettingsPostTemplatesDocument, options);
}
export type SettingsPostTemplatesQueryHookResult = ReturnType<typeof useSettingsPostTemplatesQuery>;
export type SettingsPostTemplatesLazyQueryHookResult = ReturnType<typeof useSettingsPostTemplatesLazyQuery>;
export type SettingsPostTemplatesSuspenseQueryHookResult = ReturnType<typeof useSettingsPostTemplatesSuspenseQuery>;
export type SettingsPostTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SettingsPostTemplatesQuery,
  SchemaTypes.SettingsPostTemplatesQueryVariables
>;
export function refetchSettingsPostTemplatesQuery(variables: SchemaTypes.SettingsPostTemplatesQueryVariables) {
  return { query: SettingsPostTemplatesDocument, variables: variables };
}
export const SettingsPostTemplateLibraryDocument = gql`
    query SettingsPostTemplateLibrary($scope: UUID, $after: String) {
  library(
    filter: {itemType: TEMPLATE, kinds: [POST], scope: $scope}
    first: 20
    after: $after
  ) {
    edges {
      node {
        ... on Template {
          ...SettingsPostTemplateCard
          scope {
            id
            ... on InnovationPack {
              about {
                displayName
              }
            }
          }
          provider {
            id
            about {
              displayName
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${SettingsPostTemplateCardFragmentDoc}`;

/**
 * __useSettingsPostTemplateLibraryQuery__
 *
 * To run a query within a React component, call `useSettingsPostTemplateLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsPostTemplateLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsPostTemplateLibraryQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSettingsPostTemplateLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.SettingsPostTemplateLibraryQuery,
    SchemaTypes.SettingsPostTemplateLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SettingsPostTemplateLibraryQuery,
    SchemaTypes.SettingsPostTemplateLibraryQueryVariables
  >(SettingsPostTemplateLibraryDocument, options);
}
export function useSettingsPostTemplateLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SettingsPostTemplateLibraryQuery,
    SchemaTypes.SettingsPostTemplateLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SettingsPostTemplateLibraryQuery,
    SchemaTypes.SettingsPostTemplateLibraryQueryVariables
  >(SettingsPostTemplateLibraryDocument, options);
}
export function useSettingsPostTemplateLibrarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SettingsPostTemplateLibraryQuery,
        SchemaTypes.SettingsPostTemplateLibraryQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SettingsPostTemplateLibraryQuery,
    SchemaTypes.SettingsPostTemplateLibraryQueryVariables
  >(SettingsPostTemplateLibraryDocument, options);
}
export type SettingsPostTemplateLibraryQueryHookResult = ReturnType<typeof useSettingsPostTemplateLibraryQuery>;
export type SettingsPostTemplateLibraryLazyQueryHookResult = ReturnType<typeof useSettingsPostTemplateLibraryLazyQuery>;
export type SettingsPostTemplateLibrarySuspenseQueryHookResult = ReturnType<
  typeof useSettingsPostTemplateLibrarySuspenseQuery
>;
export type SettingsPostTemplateLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.SettingsPostTemplateLibraryQuery,
  SchemaTypes.SettingsPostTemplateLibraryQueryVariables
>;
export function refetchSettingsPostTemplateLibraryQuery(
  variables?: SchemaTypes.SettingsPostTemplateLibraryQueryVariables
) {
  return { query: SettingsPostTemplateLibraryDocument, variables: variables };
}
export const SettingsPostTemplateContentDocument = gql`
    query SettingsPostTemplateContent($template: UUID!, $after: String) {
  node(id: $template) {
    id
    ... on Template {
      kind
      body {
        id
        ... on Post {
          about {
            displayName
            description
          }
          contentKind
          links {
            id
            uri
            title
            description
            sortOrder
          }
          responseKind
          responsePolicy
          responseDefaults
          commentsEnabled
          content {
            ... on DocumentContent {
              document {
                id
                docType
                about {
                  displayName
                }
                textSnapshot
                preview {
                  url
                }
              }
            }
            ... on LinkContent {
              link {
                id
                uri
                title
              }
            }
            ... on GalleryContent {
              images {
                alt
                file {
                  url
                }
              }
            }
            ... on PollContent {
              question
              options {
                id
                value
                sortOrder
              }
            }
          }
        }
      }
    }
  }
  subtree(
    root: $template
    maxDepth: 2
    types: ["document"]
    first: 500
    after: $after
  ) {
    edges {
      node {
        id
        entityType
        ... on Document {
          role
          docType
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useSettingsPostTemplateContentQuery__
 *
 * To run a query within a React component, call `useSettingsPostTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsPostTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsPostTemplateContentQuery({
 *   variables: {
 *      template: // value for 'template'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSettingsPostTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SettingsPostTemplateContentQuery,
    SchemaTypes.SettingsPostTemplateContentQueryVariables
  > &
    ({ variables: SchemaTypes.SettingsPostTemplateContentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SettingsPostTemplateContentQuery,
    SchemaTypes.SettingsPostTemplateContentQueryVariables
  >(SettingsPostTemplateContentDocument, options);
}
export function useSettingsPostTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SettingsPostTemplateContentQuery,
    SchemaTypes.SettingsPostTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SettingsPostTemplateContentQuery,
    SchemaTypes.SettingsPostTemplateContentQueryVariables
  >(SettingsPostTemplateContentDocument, options);
}
export function useSettingsPostTemplateContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SettingsPostTemplateContentQuery,
        SchemaTypes.SettingsPostTemplateContentQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SettingsPostTemplateContentQuery,
    SchemaTypes.SettingsPostTemplateContentQueryVariables
  >(SettingsPostTemplateContentDocument, options);
}
export type SettingsPostTemplateContentQueryHookResult = ReturnType<typeof useSettingsPostTemplateContentQuery>;
export type SettingsPostTemplateContentLazyQueryHookResult = ReturnType<typeof useSettingsPostTemplateContentLazyQuery>;
export type SettingsPostTemplateContentSuspenseQueryHookResult = ReturnType<
  typeof useSettingsPostTemplateContentSuspenseQuery
>;
export type SettingsPostTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.SettingsPostTemplateContentQuery,
  SchemaTypes.SettingsPostTemplateContentQueryVariables
>;
export function refetchSettingsPostTemplateContentQuery(
  variables: SchemaTypes.SettingsPostTemplateContentQueryVariables
) {
  return { query: SettingsPostTemplateContentDocument, variables: variables };
}
export const SettingsSetStageTemplateDefaultDocument = gql`
    mutation SettingsSetStageTemplateDefault($scope: UUID!, $stage: UUID!, $template: UUID) {
  setTemplateDefault(
    scope: $scope
    slot: "stage"
    stage: $stage
    template: $template
  ) {
    slot
    stage {
      id
      defaultTemplate {
        id
        about {
          displayName
        }
      }
    }
    template {
      id
      about {
        displayName
      }
    }
  }
}
    `;
export type SettingsSetStageTemplateDefaultMutationFn = Apollo.MutationFunction<
  SchemaTypes.SettingsSetStageTemplateDefaultMutation,
  SchemaTypes.SettingsSetStageTemplateDefaultMutationVariables
>;

/**
 * __useSettingsSetStageTemplateDefaultMutation__
 *
 * To run a mutation, you first call `useSettingsSetStageTemplateDefaultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSettingsSetStageTemplateDefaultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [settingsSetStageTemplateDefaultMutation, { data, loading, error }] = useSettingsSetStageTemplateDefaultMutation({
 *   variables: {
 *      scope: // value for 'scope'
 *      stage: // value for 'stage'
 *      template: // value for 'template'
 *   },
 * });
 */
export function useSettingsSetStageTemplateDefaultMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SettingsSetStageTemplateDefaultMutation,
    SchemaTypes.SettingsSetStageTemplateDefaultMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SettingsSetStageTemplateDefaultMutation,
    SchemaTypes.SettingsSetStageTemplateDefaultMutationVariables
  >(SettingsSetStageTemplateDefaultDocument, options);
}
export type SettingsSetStageTemplateDefaultMutationHookResult = ReturnType<
  typeof useSettingsSetStageTemplateDefaultMutation
>;
export type SettingsSetStageTemplateDefaultMutationResult =
  Apollo.MutationResult<SchemaTypes.SettingsSetStageTemplateDefaultMutation>;
export type SettingsSetStageTemplateDefaultMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SettingsSetStageTemplateDefaultMutation,
  SchemaTypes.SettingsSetStageTemplateDefaultMutationVariables
>;
export const SettingsSaveAsResolveSourceDocument = gql`
    query SettingsSaveAsResolveSource($url: String!) {
  resolve(url: $url) {
    state
    remainder
    node {
      id
      entityType
    }
  }
}
    `;

/**
 * __useSettingsSaveAsResolveSourceQuery__
 *
 * To run a query within a React component, call `useSettingsSaveAsResolveSourceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsSaveAsResolveSourceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsSaveAsResolveSourceQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useSettingsSaveAsResolveSourceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SettingsSaveAsResolveSourceQuery,
    SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
  > &
    ({ variables: SchemaTypes.SettingsSaveAsResolveSourceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SettingsSaveAsResolveSourceQuery,
    SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
  >(SettingsSaveAsResolveSourceDocument, options);
}
export function useSettingsSaveAsResolveSourceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SettingsSaveAsResolveSourceQuery,
    SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SettingsSaveAsResolveSourceQuery,
    SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
  >(SettingsSaveAsResolveSourceDocument, options);
}
export function useSettingsSaveAsResolveSourceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SettingsSaveAsResolveSourceQuery,
        SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SettingsSaveAsResolveSourceQuery,
    SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
  >(SettingsSaveAsResolveSourceDocument, options);
}
export type SettingsSaveAsResolveSourceQueryHookResult = ReturnType<typeof useSettingsSaveAsResolveSourceQuery>;
export type SettingsSaveAsResolveSourceLazyQueryHookResult = ReturnType<typeof useSettingsSaveAsResolveSourceLazyQuery>;
export type SettingsSaveAsResolveSourceSuspenseQueryHookResult = ReturnType<
  typeof useSettingsSaveAsResolveSourceSuspenseQuery
>;
export type SettingsSaveAsResolveSourceQueryResult = Apollo.QueryResult<
  SchemaTypes.SettingsSaveAsResolveSourceQuery,
  SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
>;
export function refetchSettingsSaveAsResolveSourceQuery(
  variables: SchemaTypes.SettingsSaveAsResolveSourceQueryVariables
) {
  return { query: SettingsSaveAsResolveSourceDocument, variables: variables };
}
export const SettingsSaveAsSourceDocument = gql`
    query SettingsSaveAsSource($space: UUID!, $after: String) {
  node(id: $space) {
    id
    ... on Space {
      about {
        displayName
        avatar {
          file {
            url
          }
        }
      }
      can {
        saveAsTemplate
      }
    }
  }
  subtree(
    root: $space
    includeRoot: true
    maxDepth: 1
    types: ["space", "post"]
    first: 500
    after: $after
  ) {
    edges {
      node {
        id
        entityType
        ... on Space {
          about {
            displayName
            card {
              file {
                url
              }
            }
          }
          isContentPublic
          stages {
            name
            description
            sortOrder
          }
        }
        ... on Post {
          about {
            displayName
            description
          }
          contentKind
          sortOrder
          stage {
            name
          }
          content {
            ... on DocumentContent {
              document {
                id
                docType
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useSettingsSaveAsSourceQuery__
 *
 * To run a query within a React component, call `useSettingsSaveAsSourceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsSaveAsSourceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsSaveAsSourceQuery({
 *   variables: {
 *      space: // value for 'space'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSettingsSaveAsSourceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SettingsSaveAsSourceQuery,
    SchemaTypes.SettingsSaveAsSourceQueryVariables
  > &
    ({ variables: SchemaTypes.SettingsSaveAsSourceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SettingsSaveAsSourceQuery, SchemaTypes.SettingsSaveAsSourceQueryVariables>(
    SettingsSaveAsSourceDocument,
    options
  );
}
export function useSettingsSaveAsSourceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SettingsSaveAsSourceQuery,
    SchemaTypes.SettingsSaveAsSourceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SettingsSaveAsSourceQuery, SchemaTypes.SettingsSaveAsSourceQueryVariables>(
    SettingsSaveAsSourceDocument,
    options
  );
}
export function useSettingsSaveAsSourceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SettingsSaveAsSourceQuery,
        SchemaTypes.SettingsSaveAsSourceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SettingsSaveAsSourceQuery, SchemaTypes.SettingsSaveAsSourceQueryVariables>(
    SettingsSaveAsSourceDocument,
    options
  );
}
export type SettingsSaveAsSourceQueryHookResult = ReturnType<typeof useSettingsSaveAsSourceQuery>;
export type SettingsSaveAsSourceLazyQueryHookResult = ReturnType<typeof useSettingsSaveAsSourceLazyQuery>;
export type SettingsSaveAsSourceSuspenseQueryHookResult = ReturnType<typeof useSettingsSaveAsSourceSuspenseQuery>;
export type SettingsSaveAsSourceQueryResult = Apollo.QueryResult<
  SchemaTypes.SettingsSaveAsSourceQuery,
  SchemaTypes.SettingsSaveAsSourceQueryVariables
>;
export function refetchSettingsSaveAsSourceQuery(variables: SchemaTypes.SettingsSaveAsSourceQueryVariables) {
  return { query: SettingsSaveAsSourceDocument, variables: variables };
}
export const SettingsCreateSpaceTemplateDocument = gql`
    mutation SettingsCreateSpaceTemplate($scope: UUID!, $source: UUID!, $recursive: Boolean!, $about: UpdateAboutInput!) {
  createTemplate(
    scope: $scope
    kind: SPACE
    source: $source
    recursive: $recursive
    about: $about
  ) {
    node {
      id
    }
    omissions {
      path
      code
    }
  }
}
    `;
export type SettingsCreateSpaceTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.SettingsCreateSpaceTemplateMutation,
  SchemaTypes.SettingsCreateSpaceTemplateMutationVariables
>;

/**
 * __useSettingsCreateSpaceTemplateMutation__
 *
 * To run a mutation, you first call `useSettingsCreateSpaceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSettingsCreateSpaceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [settingsCreateSpaceTemplateMutation, { data, loading, error }] = useSettingsCreateSpaceTemplateMutation({
 *   variables: {
 *      scope: // value for 'scope'
 *      source: // value for 'source'
 *      recursive: // value for 'recursive'
 *      about: // value for 'about'
 *   },
 * });
 */
export function useSettingsCreateSpaceTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SettingsCreateSpaceTemplateMutation,
    SchemaTypes.SettingsCreateSpaceTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SettingsCreateSpaceTemplateMutation,
    SchemaTypes.SettingsCreateSpaceTemplateMutationVariables
  >(SettingsCreateSpaceTemplateDocument, options);
}
export type SettingsCreateSpaceTemplateMutationHookResult = ReturnType<typeof useSettingsCreateSpaceTemplateMutation>;
export type SettingsCreateSpaceTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.SettingsCreateSpaceTemplateMutation>;
export type SettingsCreateSpaceTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SettingsCreateSpaceTemplateMutation,
  SchemaTypes.SettingsCreateSpaceTemplateMutationVariables
>;
export const SettingsUpdateSpaceTemplateDocument = gql`
    mutation SettingsUpdateSpaceTemplate($id: UUID!, $source: UUID, $recursive: Boolean, $about: UpdateAboutInput, $tags: [String!]) {
  updateTemplate(
    id: $id
    source: $source
    recursive: $recursive
    about: $about
    tags: $tags
  ) {
    node {
      id
    }
    omissions {
      path
      code
    }
  }
}
    `;
export type SettingsUpdateSpaceTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.SettingsUpdateSpaceTemplateMutation,
  SchemaTypes.SettingsUpdateSpaceTemplateMutationVariables
>;

/**
 * __useSettingsUpdateSpaceTemplateMutation__
 *
 * To run a mutation, you first call `useSettingsUpdateSpaceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSettingsUpdateSpaceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [settingsUpdateSpaceTemplateMutation, { data, loading, error }] = useSettingsUpdateSpaceTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      source: // value for 'source'
 *      recursive: // value for 'recursive'
 *      about: // value for 'about'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useSettingsUpdateSpaceTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SettingsUpdateSpaceTemplateMutation,
    SchemaTypes.SettingsUpdateSpaceTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SettingsUpdateSpaceTemplateMutation,
    SchemaTypes.SettingsUpdateSpaceTemplateMutationVariables
  >(SettingsUpdateSpaceTemplateDocument, options);
}
export type SettingsUpdateSpaceTemplateMutationHookResult = ReturnType<typeof useSettingsUpdateSpaceTemplateMutation>;
export type SettingsUpdateSpaceTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.SettingsUpdateSpaceTemplateMutation>;
export type SettingsUpdateSpaceTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SettingsUpdateSpaceTemplateMutation,
  SchemaTypes.SettingsUpdateSpaceTemplateMutationVariables
>;
export const CreateSubspaceTemplateDefaultDocument = gql`
    query CreateSubspaceTemplateDefault($root: UUID!) {
  templateDefaults(scope: $root) {
    slot
    template {
      id
      about {
        displayName
      }
    }
  }
}
    `;

/**
 * __useCreateSubspaceTemplateDefaultQuery__
 *
 * To run a query within a React component, call `useCreateSubspaceTemplateDefaultQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSubspaceTemplateDefaultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSubspaceTemplateDefaultQuery({
 *   variables: {
 *      root: // value for 'root'
 *   },
 * });
 */
export function useCreateSubspaceTemplateDefaultQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateSubspaceTemplateDefaultQuery,
    SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
  > &
    ({ variables: SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateSubspaceTemplateDefaultQuery,
    SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
  >(CreateSubspaceTemplateDefaultDocument, options);
}
export function useCreateSubspaceTemplateDefaultLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSubspaceTemplateDefaultQuery,
    SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSubspaceTemplateDefaultQuery,
    SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
  >(CreateSubspaceTemplateDefaultDocument, options);
}
export function useCreateSubspaceTemplateDefaultSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSubspaceTemplateDefaultQuery,
        SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSubspaceTemplateDefaultQuery,
    SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
  >(CreateSubspaceTemplateDefaultDocument, options);
}
export type CreateSubspaceTemplateDefaultQueryHookResult = ReturnType<typeof useCreateSubspaceTemplateDefaultQuery>;
export type CreateSubspaceTemplateDefaultLazyQueryHookResult = ReturnType<
  typeof useCreateSubspaceTemplateDefaultLazyQuery
>;
export type CreateSubspaceTemplateDefaultSuspenseQueryHookResult = ReturnType<
  typeof useCreateSubspaceTemplateDefaultSuspenseQuery
>;
export type CreateSubspaceTemplateDefaultQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSubspaceTemplateDefaultQuery,
  SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
>;
export function refetchCreateSubspaceTemplateDefaultQuery(
  variables: SchemaTypes.CreateSubspaceTemplateDefaultQueryVariables
) {
  return { query: CreateSubspaceTemplateDefaultDocument, variables: variables };
}
export const CreateSpacePickerSpaceTemplatesDocument = gql`
    query CreateSpacePickerSpaceTemplates($space: UUID!) {
  templates(scope: $space, kind: SPACE) {
    ...CreateSpacePickerCard
  }
}
    ${CreateSpacePickerCardFragmentDoc}`;

/**
 * __useCreateSpacePickerSpaceTemplatesQuery__
 *
 * To run a query within a React component, call `useCreateSpacePickerSpaceTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpacePickerSpaceTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpacePickerSpaceTemplatesQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useCreateSpacePickerSpaceTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
    SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
  > &
    ({ variables: SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
    SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
  >(CreateSpacePickerSpaceTemplatesDocument, options);
}
export function useCreateSpacePickerSpaceTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
    SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
    SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
  >(CreateSpacePickerSpaceTemplatesDocument, options);
}
export function useCreateSpacePickerSpaceTemplatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
        SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
    SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
  >(CreateSpacePickerSpaceTemplatesDocument, options);
}
export type CreateSpacePickerSpaceTemplatesQueryHookResult = ReturnType<typeof useCreateSpacePickerSpaceTemplatesQuery>;
export type CreateSpacePickerSpaceTemplatesLazyQueryHookResult = ReturnType<
  typeof useCreateSpacePickerSpaceTemplatesLazyQuery
>;
export type CreateSpacePickerSpaceTemplatesSuspenseQueryHookResult = ReturnType<
  typeof useCreateSpacePickerSpaceTemplatesSuspenseQuery
>;
export type CreateSpacePickerSpaceTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpacePickerSpaceTemplatesQuery,
  SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
>;
export function refetchCreateSpacePickerSpaceTemplatesQuery(
  variables: SchemaTypes.CreateSpacePickerSpaceTemplatesQueryVariables
) {
  return { query: CreateSpacePickerSpaceTemplatesDocument, variables: variables };
}
export const CreateSpacePickerLibraryDocument = gql`
    query CreateSpacePickerLibrary($scope: UUID, $after: String) {
  library(
    filter: {itemType: TEMPLATE, kinds: [SPACE], scope: $scope}
    first: 20
    after: $after
  ) {
    edges {
      node {
        ... on Template {
          ...CreateSpacePickerCard
          scope {
            id
            ... on InnovationPack {
              about {
                displayName
              }
            }
          }
          provider {
            id
            about {
              displayName
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${CreateSpacePickerCardFragmentDoc}`;

/**
 * __useCreateSpacePickerLibraryQuery__
 *
 * To run a query within a React component, call `useCreateSpacePickerLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpacePickerLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpacePickerLibraryQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useCreateSpacePickerLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpacePickerLibraryQuery,
    SchemaTypes.CreateSpacePickerLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateSpacePickerLibraryQuery, SchemaTypes.CreateSpacePickerLibraryQueryVariables>(
    CreateSpacePickerLibraryDocument,
    options
  );
}
export function useCreateSpacePickerLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpacePickerLibraryQuery,
    SchemaTypes.CreateSpacePickerLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpacePickerLibraryQuery,
    SchemaTypes.CreateSpacePickerLibraryQueryVariables
  >(CreateSpacePickerLibraryDocument, options);
}
export function useCreateSpacePickerLibrarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpacePickerLibraryQuery,
        SchemaTypes.CreateSpacePickerLibraryQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpacePickerLibraryQuery,
    SchemaTypes.CreateSpacePickerLibraryQueryVariables
  >(CreateSpacePickerLibraryDocument, options);
}
export type CreateSpacePickerLibraryQueryHookResult = ReturnType<typeof useCreateSpacePickerLibraryQuery>;
export type CreateSpacePickerLibraryLazyQueryHookResult = ReturnType<typeof useCreateSpacePickerLibraryLazyQuery>;
export type CreateSpacePickerLibrarySuspenseQueryHookResult = ReturnType<
  typeof useCreateSpacePickerLibrarySuspenseQuery
>;
export type CreateSpacePickerLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpacePickerLibraryQuery,
  SchemaTypes.CreateSpacePickerLibraryQueryVariables
>;
export function refetchCreateSpacePickerLibraryQuery(variables?: SchemaTypes.CreateSpacePickerLibraryQueryVariables) {
  return { query: CreateSpacePickerLibraryDocument, variables: variables };
}
export const CreateSpaceTemplateContentDocument = gql`
    query CreateSpaceTemplateContent($template: UUID!, $after: String) {
  node(id: $template) {
    id
    ... on Template {
      about {
        displayName
        description
      }
      tags
      body {
        id
      }
    }
  }
  subtree(
    root: $template
    maxDepth: 2
    types: ["space", "post"]
    first: 500
    after: $after
  ) {
    edges {
      node {
        id
        entityType
        ... on Space {
          about {
            displayName
            tagline
            description
            card {
              file {
                url
              }
            }
          }
          tags
          isContentPublic
          stages {
            name
            description
            sortOrder
          }
        }
        ... on Post {
          about {
            displayName
            description
          }
          contentKind
          sortOrder
          stage {
            name
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useCreateSpaceTemplateContentQuery__
 *
 * To run a query within a React component, call `useCreateSpaceTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSpaceTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSpaceTemplateContentQuery({
 *   variables: {
 *      template: // value for 'template'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useCreateSpaceTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateSpaceTemplateContentQuery,
    SchemaTypes.CreateSpaceTemplateContentQueryVariables
  > &
    ({ variables: SchemaTypes.CreateSpaceTemplateContentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateSpaceTemplateContentQuery,
    SchemaTypes.CreateSpaceTemplateContentQueryVariables
  >(CreateSpaceTemplateContentDocument, options);
}
export function useCreateSpaceTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSpaceTemplateContentQuery,
    SchemaTypes.CreateSpaceTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateSpaceTemplateContentQuery,
    SchemaTypes.CreateSpaceTemplateContentQueryVariables
  >(CreateSpaceTemplateContentDocument, options);
}
export function useCreateSpaceTemplateContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CreateSpaceTemplateContentQuery,
        SchemaTypes.CreateSpaceTemplateContentQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CreateSpaceTemplateContentQuery,
    SchemaTypes.CreateSpaceTemplateContentQueryVariables
  >(CreateSpaceTemplateContentDocument, options);
}
export type CreateSpaceTemplateContentQueryHookResult = ReturnType<typeof useCreateSpaceTemplateContentQuery>;
export type CreateSpaceTemplateContentLazyQueryHookResult = ReturnType<typeof useCreateSpaceTemplateContentLazyQuery>;
export type CreateSpaceTemplateContentSuspenseQueryHookResult = ReturnType<
  typeof useCreateSpaceTemplateContentSuspenseQuery
>;
export type CreateSpaceTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSpaceTemplateContentQuery,
  SchemaTypes.CreateSpaceTemplateContentQueryVariables
>;
export function refetchCreateSpaceTemplateContentQuery(
  variables: SchemaTypes.CreateSpaceTemplateContentQueryVariables
) {
  return { query: CreateSpaceTemplateContentDocument, variables: variables };
}
export const SpaceSettingsAboutDocument = gql`
    query SpaceSettingsAbout($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      tags
      about {
        displayName
        tagline
        description
        location
        facets {
          namespace
          name
          value
        }
        avatar {
          ...SpaceSettingsAboutVisual
        }
        banner {
          ...SpaceSettingsAboutVisual
        }
        card {
          ...SpaceSettingsAboutVisual
        }
      }
      links {
        id
        role
        uri
        title
        description
        sortOrder
      }
      classifications {
        id
        label
        settings
        values {
          id
          value
          sortOrder
        }
        selected {
          id
        }
      }
    }
  }
  config {
    visualConstraints {
      name
      minWidth
      maxWidth
      minHeight
      maxHeight
      aspectRatio
      minAspectRatio
      maxAspectRatio
    }
  }
}
    ${SpaceSettingsAboutVisualFragmentDoc}`;

/**
 * __useSpaceSettingsAboutQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsAboutQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsAboutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsAboutQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsAboutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsAboutQuery,
    SchemaTypes.SpaceSettingsAboutQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsAboutQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSettingsAboutQuery, SchemaTypes.SpaceSettingsAboutQueryVariables>(
    SpaceSettingsAboutDocument,
    options
  );
}
export function useSpaceSettingsAboutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsAboutQuery,
    SchemaTypes.SpaceSettingsAboutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSettingsAboutQuery, SchemaTypes.SpaceSettingsAboutQueryVariables>(
    SpaceSettingsAboutDocument,
    options
  );
}
export function useSpaceSettingsAboutSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceSettingsAboutQuery, SchemaTypes.SpaceSettingsAboutQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceSettingsAboutQuery, SchemaTypes.SpaceSettingsAboutQueryVariables>(
    SpaceSettingsAboutDocument,
    options
  );
}
export type SpaceSettingsAboutQueryHookResult = ReturnType<typeof useSpaceSettingsAboutQuery>;
export type SpaceSettingsAboutLazyQueryHookResult = ReturnType<typeof useSpaceSettingsAboutLazyQuery>;
export type SpaceSettingsAboutSuspenseQueryHookResult = ReturnType<typeof useSpaceSettingsAboutSuspenseQuery>;
export type SpaceSettingsAboutQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsAboutQuery,
  SchemaTypes.SpaceSettingsAboutQueryVariables
>;
export function refetchSpaceSettingsAboutQuery(variables: SchemaTypes.SpaceSettingsAboutQueryVariables) {
  return { query: SpaceSettingsAboutDocument, variables: variables };
}
export const SpaceSettingsUpdateAboutDocument = gql`
    mutation SpaceSettingsUpdateAbout($id: UUID!, $about: UpdateAboutInput, $tags: [String!]) {
  updateSpace(id: $id, about: $about, tags: $tags) {
    id
  }
}
    `;
export type SpaceSettingsUpdateAboutMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsUpdateAboutMutation,
  SchemaTypes.SpaceSettingsUpdateAboutMutationVariables
>;

/**
 * __useSpaceSettingsUpdateAboutMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsUpdateAboutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsUpdateAboutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsUpdateAboutMutation, { data, loading, error }] = useSpaceSettingsUpdateAboutMutation({
 *   variables: {
 *      id: // value for 'id'
 *      about: // value for 'about'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useSpaceSettingsUpdateAboutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsUpdateAboutMutation,
    SchemaTypes.SpaceSettingsUpdateAboutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsUpdateAboutMutation,
    SchemaTypes.SpaceSettingsUpdateAboutMutationVariables
  >(SpaceSettingsUpdateAboutDocument, options);
}
export type SpaceSettingsUpdateAboutMutationHookResult = ReturnType<typeof useSpaceSettingsUpdateAboutMutation>;
export type SpaceSettingsUpdateAboutMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsUpdateAboutMutation>;
export type SpaceSettingsUpdateAboutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsUpdateAboutMutation,
  SchemaTypes.SpaceSettingsUpdateAboutMutationVariables
>;
export const SpaceSettingsUpsertLinkDocument = gql`
    mutation SpaceSettingsUpsertLink($owner: UUID!, $id: UUID, $role: String!, $uri: String!, $title: String, $description: String) {
  upsertLink(
    owner: $owner
    id: $id
    role: $role
    uri: $uri
    title: $title
    description: $description
  ) {
    id
    entityType
  }
}
    `;
export type SpaceSettingsUpsertLinkMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsUpsertLinkMutation,
  SchemaTypes.SpaceSettingsUpsertLinkMutationVariables
>;

/**
 * __useSpaceSettingsUpsertLinkMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsUpsertLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsUpsertLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsUpsertLinkMutation, { data, loading, error }] = useSpaceSettingsUpsertLinkMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      id: // value for 'id'
 *      role: // value for 'role'
 *      uri: // value for 'uri'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useSpaceSettingsUpsertLinkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsUpsertLinkMutation,
    SchemaTypes.SpaceSettingsUpsertLinkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsUpsertLinkMutation,
    SchemaTypes.SpaceSettingsUpsertLinkMutationVariables
  >(SpaceSettingsUpsertLinkDocument, options);
}
export type SpaceSettingsUpsertLinkMutationHookResult = ReturnType<typeof useSpaceSettingsUpsertLinkMutation>;
export type SpaceSettingsUpsertLinkMutationResult = Apollo.MutationResult<SchemaTypes.SpaceSettingsUpsertLinkMutation>;
export type SpaceSettingsUpsertLinkMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsUpsertLinkMutation,
  SchemaTypes.SpaceSettingsUpsertLinkMutationVariables
>;
export const SpaceSettingsDeleteLinkDocument = gql`
    mutation SpaceSettingsDeleteLink($id: UUID!) {
  deleteLink(id: $id) {
    id
    entityType
  }
}
    `;
export type SpaceSettingsDeleteLinkMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsDeleteLinkMutation,
  SchemaTypes.SpaceSettingsDeleteLinkMutationVariables
>;

/**
 * __useSpaceSettingsDeleteLinkMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsDeleteLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsDeleteLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsDeleteLinkMutation, { data, loading, error }] = useSpaceSettingsDeleteLinkMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsDeleteLinkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsDeleteLinkMutation,
    SchemaTypes.SpaceSettingsDeleteLinkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsDeleteLinkMutation,
    SchemaTypes.SpaceSettingsDeleteLinkMutationVariables
  >(SpaceSettingsDeleteLinkDocument, options);
}
export type SpaceSettingsDeleteLinkMutationHookResult = ReturnType<typeof useSpaceSettingsDeleteLinkMutation>;
export type SpaceSettingsDeleteLinkMutationResult = Apollo.MutationResult<SchemaTypes.SpaceSettingsDeleteLinkMutation>;
export type SpaceSettingsDeleteLinkMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsDeleteLinkMutation,
  SchemaTypes.SpaceSettingsDeleteLinkMutationVariables
>;
export const SpaceSettingsAddClassificationDocument = gql`
    mutation SpaceSettingsAddClassification($space: UUID!, $template: UUID!, $label: String) {
  addClassification(space: $space, template: $template, label: $label) {
    node {
      id
      entityType
    }
  }
}
    `;
export type SpaceSettingsAddClassificationMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsAddClassificationMutation,
  SchemaTypes.SpaceSettingsAddClassificationMutationVariables
>;

/**
 * __useSpaceSettingsAddClassificationMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsAddClassificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsAddClassificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsAddClassificationMutation, { data, loading, error }] = useSpaceSettingsAddClassificationMutation({
 *   variables: {
 *      space: // value for 'space'
 *      template: // value for 'template'
 *      label: // value for 'label'
 *   },
 * });
 */
export function useSpaceSettingsAddClassificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsAddClassificationMutation,
    SchemaTypes.SpaceSettingsAddClassificationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsAddClassificationMutation,
    SchemaTypes.SpaceSettingsAddClassificationMutationVariables
  >(SpaceSettingsAddClassificationDocument, options);
}
export type SpaceSettingsAddClassificationMutationHookResult = ReturnType<
  typeof useSpaceSettingsAddClassificationMutation
>;
export type SpaceSettingsAddClassificationMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsAddClassificationMutation>;
export type SpaceSettingsAddClassificationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsAddClassificationMutation,
  SchemaTypes.SpaceSettingsAddClassificationMutationVariables
>;
export const SpaceSettingsUpdateClassificationDocument = gql`
    mutation SpaceSettingsUpdateClassification($id: UUID!, $settings: JSON, $selected: [UUID!]) {
  updateClassification(id: $id, settings: $settings, selected: $selected) {
    id
  }
}
    `;
export type SpaceSettingsUpdateClassificationMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsUpdateClassificationMutation,
  SchemaTypes.SpaceSettingsUpdateClassificationMutationVariables
>;

/**
 * __useSpaceSettingsUpdateClassificationMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsUpdateClassificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsUpdateClassificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsUpdateClassificationMutation, { data, loading, error }] = useSpaceSettingsUpdateClassificationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      settings: // value for 'settings'
 *      selected: // value for 'selected'
 *   },
 * });
 */
export function useSpaceSettingsUpdateClassificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsUpdateClassificationMutation,
    SchemaTypes.SpaceSettingsUpdateClassificationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsUpdateClassificationMutation,
    SchemaTypes.SpaceSettingsUpdateClassificationMutationVariables
  >(SpaceSettingsUpdateClassificationDocument, options);
}
export type SpaceSettingsUpdateClassificationMutationHookResult = ReturnType<
  typeof useSpaceSettingsUpdateClassificationMutation
>;
export type SpaceSettingsUpdateClassificationMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsUpdateClassificationMutation>;
export type SpaceSettingsUpdateClassificationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsUpdateClassificationMutation,
  SchemaTypes.SpaceSettingsUpdateClassificationMutationVariables
>;
export const SpaceSettingsRemoveClassificationDocument = gql`
    mutation SpaceSettingsRemoveClassification($id: UUID!) {
  removeClassification(id: $id) {
    id
  }
}
    `;
export type SpaceSettingsRemoveClassificationMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsRemoveClassificationMutation,
  SchemaTypes.SpaceSettingsRemoveClassificationMutationVariables
>;

/**
 * __useSpaceSettingsRemoveClassificationMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsRemoveClassificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsRemoveClassificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsRemoveClassificationMutation, { data, loading, error }] = useSpaceSettingsRemoveClassificationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsRemoveClassificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsRemoveClassificationMutation,
    SchemaTypes.SpaceSettingsRemoveClassificationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsRemoveClassificationMutation,
    SchemaTypes.SpaceSettingsRemoveClassificationMutationVariables
  >(SpaceSettingsRemoveClassificationDocument, options);
}
export type SpaceSettingsRemoveClassificationMutationHookResult = ReturnType<
  typeof useSpaceSettingsRemoveClassificationMutation
>;
export type SpaceSettingsRemoveClassificationMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsRemoveClassificationMutation>;
export type SpaceSettingsRemoveClassificationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsRemoveClassificationMutation,
  SchemaTypes.SpaceSettingsRemoveClassificationMutationVariables
>;
export const SpaceSettingsRequestVisualUploadDocument = gql`
    mutation SpaceSettingsRequestVisualUpload($owner: UUID!, $mime: String!, $size: Long!, $role: String!) {
  requestUpload(owner: $owner, mime: $mime, size: $size, role: $role) {
    token
    url
  }
}
    `;
export type SpaceSettingsRequestVisualUploadMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsRequestVisualUploadMutation,
  SchemaTypes.SpaceSettingsRequestVisualUploadMutationVariables
>;

/**
 * __useSpaceSettingsRequestVisualUploadMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsRequestVisualUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsRequestVisualUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsRequestVisualUploadMutation, { data, loading, error }] = useSpaceSettingsRequestVisualUploadMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      mime: // value for 'mime'
 *      size: // value for 'size'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useSpaceSettingsRequestVisualUploadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsRequestVisualUploadMutation,
    SchemaTypes.SpaceSettingsRequestVisualUploadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsRequestVisualUploadMutation,
    SchemaTypes.SpaceSettingsRequestVisualUploadMutationVariables
  >(SpaceSettingsRequestVisualUploadDocument, options);
}
export type SpaceSettingsRequestVisualUploadMutationHookResult = ReturnType<
  typeof useSpaceSettingsRequestVisualUploadMutation
>;
export type SpaceSettingsRequestVisualUploadMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsRequestVisualUploadMutation>;
export type SpaceSettingsRequestVisualUploadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsRequestVisualUploadMutation,
  SchemaTypes.SpaceSettingsRequestVisualUploadMutationVariables
>;
export const SpaceSettingsAttachVisualDocument = gql`
    mutation SpaceSettingsAttachVisual($owner: UUID!, $file: UUID!, $role: String!, $displayName: String!, $alt: String) {
  attachFile(
    owner: $owner
    file: $file
    role: $role
    displayName: $displayName
    alt: $alt
  ) {
    id
    entityType
    ... on Space {
      about {
        avatar {
          ...SpaceSettingsAboutVisual
        }
        banner {
          ...SpaceSettingsAboutVisual
        }
        card {
          ...SpaceSettingsAboutVisual
        }
      }
    }
  }
}
    ${SpaceSettingsAboutVisualFragmentDoc}`;
export type SpaceSettingsAttachVisualMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsAttachVisualMutation,
  SchemaTypes.SpaceSettingsAttachVisualMutationVariables
>;

/**
 * __useSpaceSettingsAttachVisualMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsAttachVisualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsAttachVisualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsAttachVisualMutation, { data, loading, error }] = useSpaceSettingsAttachVisualMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      file: // value for 'file'
 *      role: // value for 'role'
 *      displayName: // value for 'displayName'
 *      alt: // value for 'alt'
 *   },
 * });
 */
export function useSpaceSettingsAttachVisualMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsAttachVisualMutation,
    SchemaTypes.SpaceSettingsAttachVisualMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsAttachVisualMutation,
    SchemaTypes.SpaceSettingsAttachVisualMutationVariables
  >(SpaceSettingsAttachVisualDocument, options);
}
export type SpaceSettingsAttachVisualMutationHookResult = ReturnType<typeof useSpaceSettingsAttachVisualMutation>;
export type SpaceSettingsAttachVisualMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsAttachVisualMutation>;
export type SpaceSettingsAttachVisualMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsAttachVisualMutation,
  SchemaTypes.SpaceSettingsAttachVisualMutationVariables
>;
export const SpaceSettingsAccountDocument = gql`
    query SpaceSettingsAccount($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      url
      status
      host {
        id
        actorType
        about {
          displayName
          avatar {
            file {
              url
            }
          }
        }
      }
      planAssignments {
        id
        expiresAt
        plan {
          id
          name
          scope
          sortOrder
        }
      }
      can {
        delete
      }
    }
  }
}
    `;

/**
 * __useSpaceSettingsAccountQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsAccountQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsAccountQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsAccountQuery,
    SchemaTypes.SpaceSettingsAccountQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsAccountQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSettingsAccountQuery, SchemaTypes.SpaceSettingsAccountQueryVariables>(
    SpaceSettingsAccountDocument,
    options
  );
}
export function useSpaceSettingsAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsAccountQuery,
    SchemaTypes.SpaceSettingsAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSettingsAccountQuery, SchemaTypes.SpaceSettingsAccountQueryVariables>(
    SpaceSettingsAccountDocument,
    options
  );
}
export function useSpaceSettingsAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceSettingsAccountQuery,
        SchemaTypes.SpaceSettingsAccountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceSettingsAccountQuery, SchemaTypes.SpaceSettingsAccountQueryVariables>(
    SpaceSettingsAccountDocument,
    options
  );
}
export type SpaceSettingsAccountQueryHookResult = ReturnType<typeof useSpaceSettingsAccountQuery>;
export type SpaceSettingsAccountLazyQueryHookResult = ReturnType<typeof useSpaceSettingsAccountLazyQuery>;
export type SpaceSettingsAccountSuspenseQueryHookResult = ReturnType<typeof useSpaceSettingsAccountSuspenseQuery>;
export type SpaceSettingsAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsAccountQuery,
  SchemaTypes.SpaceSettingsAccountQueryVariables
>;
export function refetchSpaceSettingsAccountQuery(variables: SchemaTypes.SpaceSettingsAccountQueryVariables) {
  return { query: SpaceSettingsAccountDocument, variables: variables };
}
export const SpaceSettingsApplicationFormDocument = gql`
    query SpaceSettingsApplicationForm($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      applicationForm
    }
  }
}
    `;

/**
 * __useSpaceSettingsApplicationFormQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsApplicationFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsApplicationFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsApplicationFormQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsApplicationFormQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsApplicationFormQuery,
    SchemaTypes.SpaceSettingsApplicationFormQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsApplicationFormQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceSettingsApplicationFormQuery,
    SchemaTypes.SpaceSettingsApplicationFormQueryVariables
  >(SpaceSettingsApplicationFormDocument, options);
}
export function useSpaceSettingsApplicationFormLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsApplicationFormQuery,
    SchemaTypes.SpaceSettingsApplicationFormQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceSettingsApplicationFormQuery,
    SchemaTypes.SpaceSettingsApplicationFormQueryVariables
  >(SpaceSettingsApplicationFormDocument, options);
}
export function useSpaceSettingsApplicationFormSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceSettingsApplicationFormQuery,
        SchemaTypes.SpaceSettingsApplicationFormQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceSettingsApplicationFormQuery,
    SchemaTypes.SpaceSettingsApplicationFormQueryVariables
  >(SpaceSettingsApplicationFormDocument, options);
}
export type SpaceSettingsApplicationFormQueryHookResult = ReturnType<typeof useSpaceSettingsApplicationFormQuery>;
export type SpaceSettingsApplicationFormLazyQueryHookResult = ReturnType<
  typeof useSpaceSettingsApplicationFormLazyQuery
>;
export type SpaceSettingsApplicationFormSuspenseQueryHookResult = ReturnType<
  typeof useSpaceSettingsApplicationFormSuspenseQuery
>;
export type SpaceSettingsApplicationFormQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsApplicationFormQuery,
  SchemaTypes.SpaceSettingsApplicationFormQueryVariables
>;
export function refetchSpaceSettingsApplicationFormQuery(
  variables: SchemaTypes.SpaceSettingsApplicationFormQueryVariables
) {
  return { query: SpaceSettingsApplicationFormDocument, variables: variables };
}
export const SpaceSettingsUpdateApplicationFormDocument = gql`
    mutation SpaceSettingsUpdateApplicationForm($id: UUID!, $applicationForm: JSON!) {
  updateSpace(id: $id, applicationForm: $applicationForm) {
    id
    applicationForm
  }
}
    `;
export type SpaceSettingsUpdateApplicationFormMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsUpdateApplicationFormMutation,
  SchemaTypes.SpaceSettingsUpdateApplicationFormMutationVariables
>;

/**
 * __useSpaceSettingsUpdateApplicationFormMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsUpdateApplicationFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsUpdateApplicationFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsUpdateApplicationFormMutation, { data, loading, error }] = useSpaceSettingsUpdateApplicationFormMutation({
 *   variables: {
 *      id: // value for 'id'
 *      applicationForm: // value for 'applicationForm'
 *   },
 * });
 */
export function useSpaceSettingsUpdateApplicationFormMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsUpdateApplicationFormMutation,
    SchemaTypes.SpaceSettingsUpdateApplicationFormMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsUpdateApplicationFormMutation,
    SchemaTypes.SpaceSettingsUpdateApplicationFormMutationVariables
  >(SpaceSettingsUpdateApplicationFormDocument, options);
}
export type SpaceSettingsUpdateApplicationFormMutationHookResult = ReturnType<
  typeof useSpaceSettingsUpdateApplicationFormMutation
>;
export type SpaceSettingsUpdateApplicationFormMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsUpdateApplicationFormMutation>;
export type SpaceSettingsUpdateApplicationFormMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsUpdateApplicationFormMutation,
  SchemaTypes.SpaceSettingsUpdateApplicationFormMutationVariables
>;
export const SpaceSettingsDeleteGateDocument = gql`
    query SpaceSettingsDeleteGate($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      can {
        delete
      }
    }
  }
}
    `;

/**
 * __useSpaceSettingsDeleteGateQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsDeleteGateQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsDeleteGateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsDeleteGateQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsDeleteGateQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsDeleteGateQuery,
    SchemaTypes.SpaceSettingsDeleteGateQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsDeleteGateQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSettingsDeleteGateQuery, SchemaTypes.SpaceSettingsDeleteGateQueryVariables>(
    SpaceSettingsDeleteGateDocument,
    options
  );
}
export function useSpaceSettingsDeleteGateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsDeleteGateQuery,
    SchemaTypes.SpaceSettingsDeleteGateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceSettingsDeleteGateQuery,
    SchemaTypes.SpaceSettingsDeleteGateQueryVariables
  >(SpaceSettingsDeleteGateDocument, options);
}
export function useSpaceSettingsDeleteGateSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceSettingsDeleteGateQuery,
        SchemaTypes.SpaceSettingsDeleteGateQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceSettingsDeleteGateQuery,
    SchemaTypes.SpaceSettingsDeleteGateQueryVariables
  >(SpaceSettingsDeleteGateDocument, options);
}
export type SpaceSettingsDeleteGateQueryHookResult = ReturnType<typeof useSpaceSettingsDeleteGateQuery>;
export type SpaceSettingsDeleteGateLazyQueryHookResult = ReturnType<typeof useSpaceSettingsDeleteGateLazyQuery>;
export type SpaceSettingsDeleteGateSuspenseQueryHookResult = ReturnType<typeof useSpaceSettingsDeleteGateSuspenseQuery>;
export type SpaceSettingsDeleteGateQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsDeleteGateQuery,
  SchemaTypes.SpaceSettingsDeleteGateQueryVariables
>;
export function refetchSpaceSettingsDeleteGateQuery(variables: SchemaTypes.SpaceSettingsDeleteGateQueryVariables) {
  return { query: SpaceSettingsDeleteGateDocument, variables: variables };
}
export const SpaceSettingsDeleteSpaceDocument = gql`
    mutation SpaceSettingsDeleteSpace($id: UUID!) {
  deleteSpace(id: $id) {
    deletedId
  }
}
    `;
export type SpaceSettingsDeleteSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsDeleteSpaceMutation,
  SchemaTypes.SpaceSettingsDeleteSpaceMutationVariables
>;

/**
 * __useSpaceSettingsDeleteSpaceMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsDeleteSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsDeleteSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsDeleteSpaceMutation, { data, loading, error }] = useSpaceSettingsDeleteSpaceMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsDeleteSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsDeleteSpaceMutation,
    SchemaTypes.SpaceSettingsDeleteSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsDeleteSpaceMutation,
    SchemaTypes.SpaceSettingsDeleteSpaceMutationVariables
  >(SpaceSettingsDeleteSpaceDocument, options);
}
export type SpaceSettingsDeleteSpaceMutationHookResult = ReturnType<typeof useSpaceSettingsDeleteSpaceMutation>;
export type SpaceSettingsDeleteSpaceMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsDeleteSpaceMutation>;
export type SpaceSettingsDeleteSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsDeleteSpaceMutation,
  SchemaTypes.SpaceSettingsDeleteSpaceMutationVariables
>;
export const SpaceSettingsSettingsDocument = gql`
    query SpaceSettingsSettings($id: UUID!) {
  node(id: $id) {
    id
    entityType
    ... on Space {
      settings
      audience
      host {
        id
        actorType
        about {
          displayName
        }
      }
      curated {
        role
        sortOrder
        node {
          id
          entityType
        }
      }
    }
  }
}
    `;

/**
 * __useSpaceSettingsSettingsQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsSettingsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpaceSettingsSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsSettingsQuery,
    SchemaTypes.SpaceSettingsSettingsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSettingsSettingsQuery, SchemaTypes.SpaceSettingsSettingsQueryVariables>(
    SpaceSettingsSettingsDocument,
    options
  );
}
export function useSpaceSettingsSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsSettingsQuery,
    SchemaTypes.SpaceSettingsSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSettingsSettingsQuery, SchemaTypes.SpaceSettingsSettingsQueryVariables>(
    SpaceSettingsSettingsDocument,
    options
  );
}
export function useSpaceSettingsSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceSettingsSettingsQuery,
        SchemaTypes.SpaceSettingsSettingsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceSettingsSettingsQuery,
    SchemaTypes.SpaceSettingsSettingsQueryVariables
  >(SpaceSettingsSettingsDocument, options);
}
export type SpaceSettingsSettingsQueryHookResult = ReturnType<typeof useSpaceSettingsSettingsQuery>;
export type SpaceSettingsSettingsLazyQueryHookResult = ReturnType<typeof useSpaceSettingsSettingsLazyQuery>;
export type SpaceSettingsSettingsSuspenseQueryHookResult = ReturnType<typeof useSpaceSettingsSettingsSuspenseQuery>;
export type SpaceSettingsSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsSettingsQuery,
  SchemaTypes.SpaceSettingsSettingsQueryVariables
>;
export function refetchSpaceSettingsSettingsQuery(variables: SchemaTypes.SpaceSettingsSettingsQueryVariables) {
  return { query: SpaceSettingsSettingsDocument, variables: variables };
}
export const SpaceSettingsUpdateSettingsDocument = gql`
    mutation SpaceSettingsUpdateSettings($id: UUID!, $settings: JSON!) {
  updateSpace(id: $id, settings: $settings) {
    id
    settings
  }
}
    `;
export type SpaceSettingsUpdateSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsUpdateSettingsMutation,
  SchemaTypes.SpaceSettingsUpdateSettingsMutationVariables
>;

/**
 * __useSpaceSettingsUpdateSettingsMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsUpdateSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsUpdateSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsUpdateSettingsMutation, { data, loading, error }] = useSpaceSettingsUpdateSettingsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useSpaceSettingsUpdateSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsUpdateSettingsMutation,
    SchemaTypes.SpaceSettingsUpdateSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsUpdateSettingsMutation,
    SchemaTypes.SpaceSettingsUpdateSettingsMutationVariables
  >(SpaceSettingsUpdateSettingsDocument, options);
}
export type SpaceSettingsUpdateSettingsMutationHookResult = ReturnType<typeof useSpaceSettingsUpdateSettingsMutation>;
export type SpaceSettingsUpdateSettingsMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsUpdateSettingsMutation>;
export type SpaceSettingsUpdateSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsUpdateSettingsMutation,
  SchemaTypes.SpaceSettingsUpdateSettingsMutationVariables
>;
export const SpaceSettingsSetAudienceDocument = gql`
    mutation SpaceSettingsSetAudience($id: UUID!, $audience: Audience!) {
  setSpaceAudience(id: $id, audience: $audience) {
    id
    audience
  }
}
    `;
export type SpaceSettingsSetAudienceMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsSetAudienceMutation,
  SchemaTypes.SpaceSettingsSetAudienceMutationVariables
>;

/**
 * __useSpaceSettingsSetAudienceMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsSetAudienceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsSetAudienceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsSetAudienceMutation, { data, loading, error }] = useSpaceSettingsSetAudienceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      audience: // value for 'audience'
 *   },
 * });
 */
export function useSpaceSettingsSetAudienceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsSetAudienceMutation,
    SchemaTypes.SpaceSettingsSetAudienceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsSetAudienceMutation,
    SchemaTypes.SpaceSettingsSetAudienceMutationVariables
  >(SpaceSettingsSetAudienceDocument, options);
}
export type SpaceSettingsSetAudienceMutationHookResult = ReturnType<typeof useSpaceSettingsSetAudienceMutation>;
export type SpaceSettingsSetAudienceMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsSetAudienceMutation>;
export type SpaceSettingsSetAudienceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsSetAudienceMutation,
  SchemaTypes.SpaceSettingsSetAudienceMutationVariables
>;
export const SpaceSettingsSetTrustedOrganizationsDocument = gql`
    mutation SpaceSettingsSetTrustedOrganizations($owner: UUID!, $targets: [UUID!]!) {
  setReferences(owner: $owner, role: "trusted_org", targets: $targets) {
    id
    entityType
    ... on Space {
      curated {
        role
        sortOrder
        node {
          id
          entityType
        }
      }
    }
  }
}
    `;
export type SpaceSettingsSetTrustedOrganizationsMutationFn = Apollo.MutationFunction<
  SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutation,
  SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutationVariables
>;

/**
 * __useSpaceSettingsSetTrustedOrganizationsMutation__
 *
 * To run a mutation, you first call `useSpaceSettingsSetTrustedOrganizationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsSetTrustedOrganizationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [spaceSettingsSetTrustedOrganizationsMutation, { data, loading, error }] = useSpaceSettingsSetTrustedOrganizationsMutation({
 *   variables: {
 *      owner: // value for 'owner'
 *      targets: // value for 'targets'
 *   },
 * });
 */
export function useSpaceSettingsSetTrustedOrganizationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutation,
    SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutation,
    SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutationVariables
  >(SpaceSettingsSetTrustedOrganizationsDocument, options);
}
export type SpaceSettingsSetTrustedOrganizationsMutationHookResult = ReturnType<
  typeof useSpaceSettingsSetTrustedOrganizationsMutation
>;
export type SpaceSettingsSetTrustedOrganizationsMutationResult =
  Apollo.MutationResult<SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutation>;
export type SpaceSettingsSetTrustedOrganizationsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutation,
  SchemaTypes.SpaceSettingsSetTrustedOrganizationsMutationVariables
>;
export const CreateSubspaceRootDocument = gql`
    query CreateSubspaceRoot($root: UUID!) {
  node(id: $root) {
    id
    ... on Space {
      host {
        id
        account {
          id
        }
      }
    }
  }
}
    `;

/**
 * __useCreateSubspaceRootQuery__
 *
 * To run a query within a React component, call `useCreateSubspaceRootQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateSubspaceRootQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateSubspaceRootQuery({
 *   variables: {
 *      root: // value for 'root'
 *   },
 * });
 */
export function useCreateSubspaceRootQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateSubspaceRootQuery,
    SchemaTypes.CreateSubspaceRootQueryVariables
  > &
    ({ variables: SchemaTypes.CreateSubspaceRootQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateSubspaceRootQuery, SchemaTypes.CreateSubspaceRootQueryVariables>(
    CreateSubspaceRootDocument,
    options
  );
}
export function useCreateSubspaceRootLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateSubspaceRootQuery,
    SchemaTypes.CreateSubspaceRootQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreateSubspaceRootQuery, SchemaTypes.CreateSubspaceRootQueryVariables>(
    CreateSubspaceRootDocument,
    options
  );
}
export function useCreateSubspaceRootSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CreateSubspaceRootQuery, SchemaTypes.CreateSubspaceRootQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CreateSubspaceRootQuery, SchemaTypes.CreateSubspaceRootQueryVariables>(
    CreateSubspaceRootDocument,
    options
  );
}
export type CreateSubspaceRootQueryHookResult = ReturnType<typeof useCreateSubspaceRootQuery>;
export type CreateSubspaceRootLazyQueryHookResult = ReturnType<typeof useCreateSubspaceRootLazyQuery>;
export type CreateSubspaceRootSuspenseQueryHookResult = ReturnType<typeof useCreateSubspaceRootSuspenseQuery>;
export type CreateSubspaceRootQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateSubspaceRootQuery,
  SchemaTypes.CreateSubspaceRootQueryVariables
>;
export function refetchCreateSubspaceRootQuery(variables: SchemaTypes.CreateSubspaceRootQueryVariables) {
  return { query: CreateSubspaceRootDocument, variables: variables };
}
export const PinSpaceSettingsSubspaceDocument = gql`
    mutation PinSpaceSettingsSubspace($id: UUID!, $pinned: Boolean!) {
  pinSubspace(id: $id, pinned: $pinned) {
    id
    pinned
    sortOrder
  }
}
    `;
export type PinSpaceSettingsSubspaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.PinSpaceSettingsSubspaceMutation,
  SchemaTypes.PinSpaceSettingsSubspaceMutationVariables
>;

/**
 * __usePinSpaceSettingsSubspaceMutation__
 *
 * To run a mutation, you first call `usePinSpaceSettingsSubspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePinSpaceSettingsSubspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pinSpaceSettingsSubspaceMutation, { data, loading, error }] = usePinSpaceSettingsSubspaceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      pinned: // value for 'pinned'
 *   },
 * });
 */
export function usePinSpaceSettingsSubspaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.PinSpaceSettingsSubspaceMutation,
    SchemaTypes.PinSpaceSettingsSubspaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.PinSpaceSettingsSubspaceMutation,
    SchemaTypes.PinSpaceSettingsSubspaceMutationVariables
  >(PinSpaceSettingsSubspaceDocument, options);
}
export type PinSpaceSettingsSubspaceMutationHookResult = ReturnType<typeof usePinSpaceSettingsSubspaceMutation>;
export type PinSpaceSettingsSubspaceMutationResult =
  Apollo.MutationResult<SchemaTypes.PinSpaceSettingsSubspaceMutation>;
export type PinSpaceSettingsSubspaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.PinSpaceSettingsSubspaceMutation,
  SchemaTypes.PinSpaceSettingsSubspaceMutationVariables
>;
export const ReorderSpaceSettingsSubspacesDocument = gql`
    mutation ReorderSpaceSettingsSubspaces($parent: UUID!, $ids: [UUID!]!) {
  reorderSubspaces(input: {parent: $parent, ids: $ids}) {
    id
  }
}
    `;
export type ReorderSpaceSettingsSubspacesMutationFn = Apollo.MutationFunction<
  SchemaTypes.ReorderSpaceSettingsSubspacesMutation,
  SchemaTypes.ReorderSpaceSettingsSubspacesMutationVariables
>;

/**
 * __useReorderSpaceSettingsSubspacesMutation__
 *
 * To run a mutation, you first call `useReorderSpaceSettingsSubspacesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReorderSpaceSettingsSubspacesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reorderSpaceSettingsSubspacesMutation, { data, loading, error }] = useReorderSpaceSettingsSubspacesMutation({
 *   variables: {
 *      parent: // value for 'parent'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useReorderSpaceSettingsSubspacesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ReorderSpaceSettingsSubspacesMutation,
    SchemaTypes.ReorderSpaceSettingsSubspacesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.ReorderSpaceSettingsSubspacesMutation,
    SchemaTypes.ReorderSpaceSettingsSubspacesMutationVariables
  >(ReorderSpaceSettingsSubspacesDocument, options);
}
export type ReorderSpaceSettingsSubspacesMutationHookResult = ReturnType<
  typeof useReorderSpaceSettingsSubspacesMutation
>;
export type ReorderSpaceSettingsSubspacesMutationResult =
  Apollo.MutationResult<SchemaTypes.ReorderSpaceSettingsSubspacesMutation>;
export type ReorderSpaceSettingsSubspacesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ReorderSpaceSettingsSubspacesMutation,
  SchemaTypes.ReorderSpaceSettingsSubspacesMutationVariables
>;
export const DeleteSpaceSettingsSubspaceDocument = gql`
    mutation DeleteSpaceSettingsSubspace($id: UUID!) {
  deleteSpace(id: $id) {
    deletedId
  }
}
    `;
export type DeleteSpaceSettingsSubspaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteSpaceSettingsSubspaceMutation,
  SchemaTypes.DeleteSpaceSettingsSubspaceMutationVariables
>;

/**
 * __useDeleteSpaceSettingsSubspaceMutation__
 *
 * To run a mutation, you first call `useDeleteSpaceSettingsSubspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSpaceSettingsSubspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSpaceSettingsSubspaceMutation, { data, loading, error }] = useDeleteSpaceSettingsSubspaceMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSpaceSettingsSubspaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteSpaceSettingsSubspaceMutation,
    SchemaTypes.DeleteSpaceSettingsSubspaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteSpaceSettingsSubspaceMutation,
    SchemaTypes.DeleteSpaceSettingsSubspaceMutationVariables
  >(DeleteSpaceSettingsSubspaceDocument, options);
}
export type DeleteSpaceSettingsSubspaceMutationHookResult = ReturnType<typeof useDeleteSpaceSettingsSubspaceMutation>;
export type DeleteSpaceSettingsSubspaceMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteSpaceSettingsSubspaceMutation>;
export type DeleteSpaceSettingsSubspaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteSpaceSettingsSubspaceMutation,
  SchemaTypes.DeleteSpaceSettingsSubspaceMutationVariables
>;
export const UpdateSpaceSettingsSubspacesSortModeDocument = gql`
    mutation UpdateSpaceSettingsSubspacesSortMode($id: UUID!, $settings: JSON!) {
  updateSpace(id: $id, settings: $settings) {
    id
    settings
  }
}
    `;
export type UpdateSpaceSettingsSubspacesSortModeMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutation,
  SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutationVariables
>;

/**
 * __useUpdateSpaceSettingsSubspacesSortModeMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceSettingsSubspacesSortModeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceSettingsSubspacesSortModeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceSettingsSubspacesSortModeMutation, { data, loading, error }] = useUpdateSpaceSettingsSubspacesSortModeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useUpdateSpaceSettingsSubspacesSortModeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutation,
    SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutation,
    SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutationVariables
  >(UpdateSpaceSettingsSubspacesSortModeDocument, options);
}
export type UpdateSpaceSettingsSubspacesSortModeMutationHookResult = ReturnType<
  typeof useUpdateSpaceSettingsSubspacesSortModeMutation
>;
export type UpdateSpaceSettingsSubspacesSortModeMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutation>;
export type UpdateSpaceSettingsSubspacesSortModeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutation,
  SchemaTypes.UpdateSpaceSettingsSubspacesSortModeMutationVariables
>;
export const SpaceSettingsSubspaceTemplatesDocument = gql`
    query SpaceSettingsSubspaceTemplates($space: UUID!) {
  templates(scope: $space, kind: SPACE) {
    id
    about {
      displayName
    }
  }
}
    `;

/**
 * __useSpaceSettingsSubspaceTemplatesQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsSubspaceTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsSubspaceTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsSubspaceTemplatesQuery({
 *   variables: {
 *      space: // value for 'space'
 *   },
 * });
 */
export function useSpaceSettingsSubspaceTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
    SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
    SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
  >(SpaceSettingsSubspaceTemplatesDocument, options);
}
export function useSpaceSettingsSubspaceTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
    SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
    SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
  >(SpaceSettingsSubspaceTemplatesDocument, options);
}
export function useSpaceSettingsSubspaceTemplatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
        SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
    SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
  >(SpaceSettingsSubspaceTemplatesDocument, options);
}
export type SpaceSettingsSubspaceTemplatesQueryHookResult = ReturnType<typeof useSpaceSettingsSubspaceTemplatesQuery>;
export type SpaceSettingsSubspaceTemplatesLazyQueryHookResult = ReturnType<
  typeof useSpaceSettingsSubspaceTemplatesLazyQuery
>;
export type SpaceSettingsSubspaceTemplatesSuspenseQueryHookResult = ReturnType<
  typeof useSpaceSettingsSubspaceTemplatesSuspenseQuery
>;
export type SpaceSettingsSubspaceTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsSubspaceTemplatesQuery,
  SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
>;
export function refetchSpaceSettingsSubspaceTemplatesQuery(
  variables: SchemaTypes.SpaceSettingsSubspaceTemplatesQueryVariables
) {
  return { query: SpaceSettingsSubspaceTemplatesDocument, variables: variables };
}
export const SetSpaceSettingsSubspaceDefaultTemplateDocument = gql`
    mutation SetSpaceSettingsSubspaceDefaultTemplate($scope: UUID!, $template: UUID!) {
  setTemplateDefault(scope: $scope, slot: "subspace_default", template: $template) {
    slot
    template {
      id
      about {
        displayName
      }
    }
  }
}
    `;
export type SetSpaceSettingsSubspaceDefaultTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutation,
  SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutationVariables
>;

/**
 * __useSetSpaceSettingsSubspaceDefaultTemplateMutation__
 *
 * To run a mutation, you first call `useSetSpaceSettingsSubspaceDefaultTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetSpaceSettingsSubspaceDefaultTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setSpaceSettingsSubspaceDefaultTemplateMutation, { data, loading, error }] = useSetSpaceSettingsSubspaceDefaultTemplateMutation({
 *   variables: {
 *      scope: // value for 'scope'
 *      template: // value for 'template'
 *   },
 * });
 */
export function useSetSpaceSettingsSubspaceDefaultTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutation,
    SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutation,
    SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutationVariables
  >(SetSpaceSettingsSubspaceDefaultTemplateDocument, options);
}
export type SetSpaceSettingsSubspaceDefaultTemplateMutationHookResult = ReturnType<
  typeof useSetSpaceSettingsSubspaceDefaultTemplateMutation
>;
export type SetSpaceSettingsSubspaceDefaultTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutation>;
export type SetSpaceSettingsSubspaceDefaultTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutation,
  SchemaTypes.SetSpaceSettingsSubspaceDefaultTemplateMutationVariables
>;
export const V2SavePersonalSettingsDocument = gql`
    mutation V2SavePersonalSettings($id: UUID!, $value: JSON!) {
  setSettings(id: $id, namespace: "core", name: "user_settings", value: $value) {
    id
  }
}
    `;
export type V2SavePersonalSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.V2SavePersonalSettingsMutation,
  SchemaTypes.V2SavePersonalSettingsMutationVariables
>;

/**
 * __useV2SavePersonalSettingsMutation__
 *
 * To run a mutation, you first call `useV2SavePersonalSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useV2SavePersonalSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [v2SavePersonalSettingsMutation, { data, loading, error }] = useV2SavePersonalSettingsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useV2SavePersonalSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.V2SavePersonalSettingsMutation,
    SchemaTypes.V2SavePersonalSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.V2SavePersonalSettingsMutation,
    SchemaTypes.V2SavePersonalSettingsMutationVariables
  >(V2SavePersonalSettingsDocument, options);
}
export type V2SavePersonalSettingsMutationHookResult = ReturnType<typeof useV2SavePersonalSettingsMutation>;
export type V2SavePersonalSettingsMutationResult = Apollo.MutationResult<SchemaTypes.V2SavePersonalSettingsMutation>;
export type V2SavePersonalSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.V2SavePersonalSettingsMutation,
  SchemaTypes.V2SavePersonalSettingsMutationVariables
>;
export const ChatRecipientDirectoryDocument = gql`
    query ChatRecipientDirectory($terms: String!) {
  actors(filter: {types: ["user"], terms: $terms}, first: 20) {
    edges {
      node {
        id
        about {
          displayName
          location
          avatar {
            file {
              url
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useChatRecipientDirectoryQuery__
 *
 * To run a query within a React component, call `useChatRecipientDirectoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatRecipientDirectoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatRecipientDirectoryQuery({
 *   variables: {
 *      terms: // value for 'terms'
 *   },
 * });
 */
export function useChatRecipientDirectoryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChatRecipientDirectoryQuery,
    SchemaTypes.ChatRecipientDirectoryQueryVariables
  > &
    ({ variables: SchemaTypes.ChatRecipientDirectoryQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChatRecipientDirectoryQuery, SchemaTypes.ChatRecipientDirectoryQueryVariables>(
    ChatRecipientDirectoryDocument,
    options
  );
}
export function useChatRecipientDirectoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChatRecipientDirectoryQuery,
    SchemaTypes.ChatRecipientDirectoryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChatRecipientDirectoryQuery, SchemaTypes.ChatRecipientDirectoryQueryVariables>(
    ChatRecipientDirectoryDocument,
    options
  );
}
export function useChatRecipientDirectorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ChatRecipientDirectoryQuery,
        SchemaTypes.ChatRecipientDirectoryQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ChatRecipientDirectoryQuery,
    SchemaTypes.ChatRecipientDirectoryQueryVariables
  >(ChatRecipientDirectoryDocument, options);
}
export type ChatRecipientDirectoryQueryHookResult = ReturnType<typeof useChatRecipientDirectoryQuery>;
export type ChatRecipientDirectoryLazyQueryHookResult = ReturnType<typeof useChatRecipientDirectoryLazyQuery>;
export type ChatRecipientDirectorySuspenseQueryHookResult = ReturnType<typeof useChatRecipientDirectorySuspenseQuery>;
export type ChatRecipientDirectoryQueryResult = Apollo.QueryResult<
  SchemaTypes.ChatRecipientDirectoryQuery,
  SchemaTypes.ChatRecipientDirectoryQueryVariables
>;
export function refetchChatRecipientDirectoryQuery(variables: SchemaTypes.ChatRecipientDirectoryQueryVariables) {
  return { query: ChatRecipientDirectoryDocument, variables: variables };
}
export const NativeRouteResolutionDocument = gql`
    query NativeRouteResolution($url: String!) {
  resolve(url: $url) {
    matchedPrefix
    remainder
    state
    node {
      id
      entityType
      __typename
      ... on Space {
        kind
        ...SpaceInputs
      }
      ... on Post {
        url
        contentKind
        parentPost {
          id
        }
      }
    }
    ancestors {
      id
      entityType
      __typename
      ... on Space {
        kind
        depth
        url
        about {
          displayName
          tagline
          avatar {
            alt
            file {
              id
              url
            }
          }
          card {
            alt
            file {
              id
              url
            }
          }
          banner {
            alt
            aspectRatio
            file {
              id
              url
            }
          }
        }
      }
    }
    closestReadable {
      id
      entityType
      __typename
      ... on Space {
        url
      }
    }
    space {
      id
      entityType
      kind
      ...SpaceInputs
    }
    homepage {
      id
    }
  }
}
    ${SpaceInputsFragmentDoc}`;

/**
 * __useNativeRouteResolutionQuery__
 *
 * To run a query within a React component, call `useNativeRouteResolutionQuery` and pass it any options that fit your needs.
 * When your component renders, `useNativeRouteResolutionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNativeRouteResolutionQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useNativeRouteResolutionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.NativeRouteResolutionQuery,
    SchemaTypes.NativeRouteResolutionQueryVariables
  > &
    ({ variables: SchemaTypes.NativeRouteResolutionQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.NativeRouteResolutionQuery, SchemaTypes.NativeRouteResolutionQueryVariables>(
    NativeRouteResolutionDocument,
    options
  );
}
export function useNativeRouteResolutionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.NativeRouteResolutionQuery,
    SchemaTypes.NativeRouteResolutionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.NativeRouteResolutionQuery, SchemaTypes.NativeRouteResolutionQueryVariables>(
    NativeRouteResolutionDocument,
    options
  );
}
export function useNativeRouteResolutionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.NativeRouteResolutionQuery,
        SchemaTypes.NativeRouteResolutionQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.NativeRouteResolutionQuery,
    SchemaTypes.NativeRouteResolutionQueryVariables
  >(NativeRouteResolutionDocument, options);
}
export type NativeRouteResolutionQueryHookResult = ReturnType<typeof useNativeRouteResolutionQuery>;
export type NativeRouteResolutionLazyQueryHookResult = ReturnType<typeof useNativeRouteResolutionLazyQuery>;
export type NativeRouteResolutionSuspenseQueryHookResult = ReturnType<typeof useNativeRouteResolutionSuspenseQuery>;
export type NativeRouteResolutionQueryResult = Apollo.QueryResult<
  SchemaTypes.NativeRouteResolutionQuery,
  SchemaTypes.NativeRouteResolutionQueryVariables
>;
export function refetchNativeRouteResolutionQuery(variables: SchemaTypes.NativeRouteResolutionQueryVariables) {
  return { query: NativeRouteResolutionDocument, variables: variables };
}
export const V2ResolveDocument = gql`
    query V2Resolve($url: String!) {
  resolve(url: $url) {
    homepage {
      id
    }
  }
}
    `;

/**
 * __useV2ResolveQuery__
 *
 * To run a query within a React component, call `useV2ResolveQuery` and pass it any options that fit your needs.
 * When your component renders, `useV2ResolveQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useV2ResolveQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useV2ResolveQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables> &
    ({ variables: SchemaTypes.V2ResolveQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>(V2ResolveDocument, options);
}
export function useV2ResolveLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>(
    V2ResolveDocument,
    options
  );
}
export function useV2ResolveSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>(
    V2ResolveDocument,
    options
  );
}
export type V2ResolveQueryHookResult = ReturnType<typeof useV2ResolveQuery>;
export type V2ResolveLazyQueryHookResult = ReturnType<typeof useV2ResolveLazyQuery>;
export type V2ResolveSuspenseQueryHookResult = ReturnType<typeof useV2ResolveSuspenseQuery>;
export type V2ResolveQueryResult = Apollo.QueryResult<SchemaTypes.V2ResolveQuery, SchemaTypes.V2ResolveQueryVariables>;
export function refetchV2ResolveQuery(variables: SchemaTypes.V2ResolveQueryVariables) {
  return { query: V2ResolveDocument, variables: variables };
}
