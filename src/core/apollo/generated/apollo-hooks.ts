import * as SchemaTypes from './graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const MyPrivilegesFragmentDoc = gql`
  fragment MyPrivileges on Authorization {
    myPrivileges
  }
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
        claims {
          name
          value
        }
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
export const TagsetDetailsFragmentDoc = gql`
  fragment TagsetDetails on Tagset {
    id
    name
    tags
    allowedValues
    type
  }
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
    alternativeText
  }
`;
export const InnovationFlowProfileFragmentDoc = gql`
  fragment InnovationFlowProfile on Profile {
    id
    displayName
    description
    tagsets {
      ...TagsetDetails
    }
    references {
      id
      name
      description
      uri
    }
    bannerNarrow: visual(type: CARD) {
      ...VisualFull
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const InnovationFlowDetailsFragmentDoc = gql`
  fragment InnovationFlowDetails on InnovationFlow {
    id
    profile {
      ...InnovationFlowProfile
    }
    states {
      displayName
      description
    }
    currentState {
      displayName
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${InnovationFlowProfileFragmentDoc}
`;
export const InnovationFlowCollaborationFragmentDoc = gql`
  fragment InnovationFlowCollaboration on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    callouts(groups: ["CONTRIBUTE_1", "CONTRIBUTE_2"]) {
      id
      nameID
      type
      activity
      sortOrder
      framing {
        id
        profile {
          id
          displayName
          calloutGroupName: tagset(tagsetName: CALLOUT_GROUP) {
            ...TagsetDetails
          }
          flowState: tagset(tagsetName: FLOW_STATE) {
            ...TagsetDetails
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const ActivityLogMemberJoinedFragmentDoc = gql`
  fragment ActivityLogMemberJoined on ActivityLogEntryMemberJoined {
    user {
      id
      firstName
      lastName
      profile {
        id
        url
        displayName
        visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
`;
export const ActivityCalloutContextFragmentDoc = gql`
  fragment ActivityCalloutContext on Callout {
    id
    framing {
      id
      profile {
        id
        displayName
        url
      }
    }
  }
`;
export const ActivityLogCalloutPublishedFragmentDoc = gql`
  fragment ActivityLogCalloutPublished on ActivityLogEntryCalloutPublished {
    callout {
      ...ActivityCalloutContext
      type
    }
  }
  ${ActivityCalloutContextFragmentDoc}
`;
export const ActivityLogCalloutPostCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutPostCreated on ActivityLogEntryCalloutPostCreated {
    callout {
      ...ActivityCalloutContext
    }
    post {
      id
      nameID
      profile {
        id
        url
        displayName
      }
    }
  }
  ${ActivityCalloutContextFragmentDoc}
`;
export const ActivityLogCalloutLinkCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutLinkCreated on ActivityLogEntryCalloutLinkCreated {
    callout {
      ...ActivityCalloutContext
    }
    link {
      id
      profile {
        id
        displayName
      }
    }
  }
  ${ActivityCalloutContextFragmentDoc}
`;
export const ActivitySubjectProfileFragmentDoc = gql`
  fragment ActivitySubjectProfile on Profile {
    id
    displayName
    url
  }
`;
export const ActivityLogCalloutPostCommentFragmentDoc = gql`
  fragment ActivityLogCalloutPostComment on ActivityLogEntryCalloutPostComment {
    description
    post {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogCalloutWhiteboardCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutWhiteboardCreated on ActivityLogEntryCalloutWhiteboardCreated {
    callout {
      ...ActivityCalloutContext
    }
    whiteboard {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivityCalloutContextFragmentDoc}
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogCalloutWhiteboardContentModifiedFragmentDoc = gql`
  fragment ActivityLogCalloutWhiteboardContentModified on ActivityLogEntryCalloutWhiteboardContentModified {
    callout {
      ...ActivityCalloutContext
    }
    whiteboard {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivityCalloutContextFragmentDoc}
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogCalloutDiscussionCommentFragmentDoc = gql`
  fragment ActivityLogCalloutDiscussionComment on ActivityLogEntryCalloutDiscussionComment {
    description
    callout {
      ...ActivityCalloutContext
    }
  }
  ${ActivityCalloutContextFragmentDoc}
`;
export const ActivityLogChallengeCreatedFragmentDoc = gql`
  fragment ActivityLogChallengeCreated on ActivityLogEntryChallengeCreated {
    challenge {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogOpportunityCreatedFragmentDoc = gql`
  fragment ActivityLogOpportunityCreated on ActivityLogEntryOpportunityCreated {
    opportunity {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogUpdateSentFragmentDoc = gql`
  fragment ActivityLogUpdateSent on ActivityLogEntryUpdateSent {
    message
    journeyUrl
  }
`;
export const ActivityLogCalendarEventCreatedFragmentDoc = gql`
  fragment ActivityLogCalendarEventCreated on ActivityLogEntryCalendarEventCreated {
    calendarEvent {
      id
      profile {
        ...ActivitySubjectProfile
      }
    }
  }
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogOnCollaborationFragmentDoc = gql`
  fragment ActivityLogOnCollaboration on ActivityLogEntry {
    id
    createdDate
    type
    ... on ActivityLogEntryMemberJoined {
      ...ActivityLogMemberJoined
    }
    ... on ActivityLogEntryCalloutPublished {
      ...ActivityLogCalloutPublished
    }
    ... on ActivityLogEntryCalloutPostCreated {
      ...ActivityLogCalloutPostCreated
    }
    ... on ActivityLogEntryCalloutLinkCreated {
      ...ActivityLogCalloutLinkCreated
    }
    ... on ActivityLogEntryCalloutPostComment {
      ...ActivityLogCalloutPostComment
    }
    ... on ActivityLogEntryCalloutWhiteboardCreated {
      ...ActivityLogCalloutWhiteboardCreated
    }
    ... on ActivityLogEntryCalloutWhiteboardContentModified {
      ...ActivityLogCalloutWhiteboardContentModified
    }
    ... on ActivityLogEntryCalloutDiscussionComment {
      ...ActivityLogCalloutDiscussionComment
    }
    ... on ActivityLogEntryChallengeCreated {
      ...ActivityLogChallengeCreated
    }
    ... on ActivityLogEntryOpportunityCreated {
      ...ActivityLogOpportunityCreated
    }
    ... on ActivityLogEntryUpdateSent {
      ...ActivityLogUpdateSent
    }
    ... on ActivityLogEntryCalendarEventCreated {
      ...ActivityLogCalendarEventCreated
    }
  }
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
  ${ActivityLogCalendarEventCreatedFragmentDoc}
`;
export const CollaborationPrivilegesFragmentDoc = gql`
  fragment CollaborationPrivileges on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
  }
`;
export const TemplateCardProfileInfoFragmentDoc = gql`
  fragment TemplateCardProfileInfo on Profile {
    id
    displayName
    description
    tagset {
      ...TagsetDetails
    }
    visual(type: CARD) {
      id
      uri
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CalloutTemplateCardFragmentDoc = gql`
  fragment CalloutTemplateCard on CalloutTemplate {
    id
    type
    profile {
      ...TemplateCardProfileInfo
    }
    contributionPolicy {
      allowedContributionTypes
      state
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
`;
export const ProfileDisplayNameFragmentDoc = gql`
  fragment ProfileDisplayName on Profile {
    id
    displayName
  }
`;
export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
    id
    type
    createdBy {
      id
      profile {
        id
        displayName
      }
    }
    createdDate
    comments {
      id
      messagesCount
    }
    profile {
      id
      url
      displayName
      description
      visuals {
        ...VisualFull
      }
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        uri
        description
      }
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const ContributeTabPostFragmentDoc = gql`
  fragment ContributeTabPost on Post {
    ...PostCard
    authorization {
      id
      myPrivileges
    }
  }
  ${PostCardFragmentDoc}
`;
export const CalloutFragmentDoc = gql`
  fragment Callout on Callout {
    id
    nameID
    type
    sortOrder
    activity
    authorization {
      id
      myPrivileges
    }
    framing {
      id
      profile {
        id
        url
        displayName
        tagsets {
          ...TagsetDetails
        }
      }
    }
    visibility
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CollaborationWithCalloutsFragmentDoc = gql`
  fragment CollaborationWithCallouts on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    callouts(groups: $groups, IDs: $calloutIds) {
      ...Callout
    }
  }
  ${CalloutFragmentDoc}
`;
export const ReferenceDetailsFragmentDoc = gql`
  fragment ReferenceDetails on Reference {
    id
    name
    uri
    description
  }
`;
export const WhiteboardProfileFragmentDoc = gql`
  fragment WhiteboardProfile on Profile {
    id
    url
    displayName
    description
    visual(type: CARD) {
      ...VisualFull
    }
    preview: visual(type: BANNER) {
      ...VisualFull
    }
    tagset {
      ...TagsetDetails
    }
    storageBucket {
      id
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const WhiteboardDetailsFragmentDoc = gql`
  fragment WhiteboardDetails on Whiteboard {
    id
    nameID
    createdDate
    profile {
      ...WhiteboardProfile
    }
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
    contentUpdatePolicy
    createdBy {
      id
      profile {
        id
        displayName
        url
        location {
          id
          country
          city
        }
        avatar: visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
`;
export const LinkDetailsWithAuthorizationFragmentDoc = gql`
  fragment LinkDetailsWithAuthorization on Link {
    id
    uri
    profile {
      id
      displayName
      description
    }
    authorization {
      id
      myPrivileges
    }
  }
`;
export const ReactionDetailsFragmentDoc = gql`
  fragment ReactionDetails on Reaction {
    id
    emoji
    sender {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export const SenderProfileFragmentDoc = gql`
  fragment SenderProfile on Profile {
    id
    displayName
    url
    type
    avatar: visual(type: AVATAR) {
      id
      uri
    }
    tagsets {
      ...TagsetDetails
    }
    location {
      id
      city
      country
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const MessageDetailsFragmentDoc = gql`
  fragment MessageDetails on Message {
    id
    message
    timestamp
    reactions {
      ...ReactionDetails
    }
    threadID
    sender {
      ... on User {
        id
        profile {
          ...SenderProfile
        }
      }
      ... on VirtualContributor {
        id
        profile {
          ...SenderProfile
        }
      }
    }
  }
  ${ReactionDetailsFragmentDoc}
  ${SenderProfileFragmentDoc}
`;
export const CommentsWithMessagesFragmentDoc = gql`
  fragment CommentsWithMessages on Room {
    id
    messagesCount
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
    messages {
      ...MessageDetails
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export const CalloutDetailsFragmentDoc = gql`
  fragment CalloutDetails on Callout {
    id
    nameID
    type
    framing {
      id
      profile {
        id
        displayName
        description
        tagset {
          ...TagsetDetails
        }
        tagsets {
          ...TagsetDetails
        }
        references {
          ...ReferenceDetails
        }
        storageBucket {
          id
        }
        url
      }
      whiteboard {
        ...WhiteboardDetails
      }
    }
    contributionPolicy {
      state
    }
    contributionDefaults {
      id
      postDescription
      whiteboardContent
    }
    sortOrder
    activity
    contributions {
      link {
        ...LinkDetailsWithAuthorization
      }
    }
    comments {
      ...CommentsWithMessages
    }
    authorization {
      id
      myPrivileges
    }
    visibility
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${LinkDetailsWithAuthorizationFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
`;
export const VisualUriFragmentDoc = gql`
  fragment VisualUri on Visual {
    id
    uri
    name
  }
`;
export const WhiteboardCollectionCalloutCardFragmentDoc = gql`
  fragment WhiteboardCollectionCalloutCard on Whiteboard {
    id
    profile {
      id
      url
      displayName
      visual(type: CARD) {
        ...VisualUri
      }
    }
    createdDate
  }
  ${VisualUriFragmentDoc}
`;
export const PostDashboardFragmentDoc = gql`
  fragment PostDashboard on Post {
    id
    nameID
    type
    createdDate
    profile {
      id
      url
      displayName
      description
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        uri
        description
      }
      visual(type: BANNER) {
        ...VisualUri
      }
    }
    createdBy {
      id
      profile {
        id
        displayName
        avatar: visual(type: AVATAR) {
          id
          uri
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
    comments {
      id
      authorization {
        id
        myPrivileges
      }
      messages {
        ...MessageDetails
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
  ${MessageDetailsFragmentDoc}
`;
export const PostSettingsFragmentDoc = gql`
  fragment PostSettings on Post {
    id
    nameID
    type
    authorization {
      id
      myPrivileges
    }
    profile {
      id
      displayName
      description
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        uri
        description
      }
      visuals {
        ...VisualFull
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const PostSettingsCalloutFragmentDoc = gql`
  fragment PostSettingsCallout on Callout {
    id
    nameID
    type
    contributions(filter: { postIDs: [$postNameId] }) {
      id
      post {
        ...PostSettings
      }
    }
    postNames: contributions {
      post {
        id
        profile {
          id
          displayName
        }
      }
    }
  }
  ${PostSettingsFragmentDoc}
`;
export const PostProvidedFragmentDoc = gql`
  fragment PostProvided on Post {
    id
    nameID
    profile {
      id
      displayName
    }
    authorization {
      id
      myPrivileges
    }
    comments {
      id
      messagesCount
    }
  }
`;
export const TemplateProviderProfileFragmentDoc = gql`
  fragment TemplateProviderProfile on Profile {
    id
    displayName
    visual(type: AVATAR) {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const InnovationPackWithProviderFragmentDoc = gql`
  fragment InnovationPackWithProvider on InnovationPack {
    id
    nameID
    profile {
      id
      displayName
    }
    provider {
      id
      profile {
        ...TemplateProviderProfile
      }
    }
  }
  ${TemplateProviderProfileFragmentDoc}
`;
export const LockedByDetailsFragmentDoc = gql`
  fragment LockedByDetails on User {
    id
    profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const WhiteboardSummaryFragmentDoc = gql`
  fragment WhiteboardSummary on Whiteboard {
    id
    nameID
    createdDate
    profile {
      id
      displayName
    }
  }
`;
export const WhiteboardContentFragmentDoc = gql`
  fragment WhiteboardContent on Whiteboard {
    id
    content
  }
`;
export const CreateWhiteboardWhiteboardTemplateFragmentDoc = gql`
  fragment CreateWhiteboardWhiteboardTemplate on WhiteboardTemplate {
    id
    profile {
      id
      displayName
      description
    }
    content
  }
`;
export const CalloutWithWhiteboardFragmentDoc = gql`
  fragment CalloutWithWhiteboard on Callout {
    id
    nameID
    type
    authorization {
      id
      anonymousReadAccess
      myPrivileges
    }
    framing {
      id
      whiteboard {
        ...WhiteboardDetails
      }
    }
    contributions(filter: { whiteboardIDs: [$whiteboardId] }) {
      whiteboard {
        ...WhiteboardDetails
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
`;
export const CollaborationWithWhiteboardDetailsFragmentDoc = gql`
  fragment CollaborationWithWhiteboardDetails on Collaboration {
    id
    callouts {
      id
      nameID
      type
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
      contributions {
        whiteboard {
          ...WhiteboardDetails
        }
      }
      framing {
        id
        whiteboard {
          ...WhiteboardDetails
        }
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
`;
export const LinkDetailsFragmentDoc = gql`
  fragment LinkDetails on Link {
    id
    uri
    profile {
      id
      displayName
      description
    }
  }
`;
export const DiscussionDetailsFragmentDoc = gql`
  fragment DiscussionDetails on Discussion {
    id
    profile {
      id
      url
      displayName
      description
    }
    createdBy
    timestamp
    category
    comments {
      id
      messagesCount
      authorization {
        myPrivileges
      }
      messages {
        ...MessageDetails
      }
    }
    authorization {
      myPrivileges
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export const DiscussionCardFragmentDoc = gql`
  fragment DiscussionCard on Discussion {
    id
    profile {
      id
      url
      displayName
      description
      tagline
      visual(type: AVATAR) {
        ...VisualFull
      }
    }
    category
    timestamp
    comments {
      id
      messagesCount
      authorization {
        myPrivileges
      }
    }
    createdBy
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
  }
  ${VisualFullFragmentDoc}
`;
export const AdminCommunityCandidateMemberFragmentDoc = gql`
  fragment AdminCommunityCandidateMember on User {
    id
    nameID
    email
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      location {
        id
        city
        country
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const AdminCommunityApplicationFragmentDoc = gql`
  fragment AdminCommunityApplication on Application {
    id
    createdDate
    updatedDate
    lifecycle {
      id
      state
      nextEvents
    }
    user {
      ...AdminCommunityCandidateMember
    }
    questions {
      id
      name
      value
    }
  }
  ${AdminCommunityCandidateMemberFragmentDoc}
`;
export const AdminCommunityInvitationFragmentDoc = gql`
  fragment AdminCommunityInvitation on Invitation {
    id
    createdDate
    updatedDate
    lifecycle {
      id
      state
      nextEvents
    }
    user {
      ...AdminCommunityCandidateMember
    }
  }
  ${AdminCommunityCandidateMemberFragmentDoc}
`;
export const AdminCommunityInvitationExternalFragmentDoc = gql`
  fragment AdminCommunityInvitationExternal on InvitationExternal {
    id
    createdDate
    email
  }
`;
export const ApplicationFormFragmentDoc = gql`
  fragment ApplicationForm on Form {
    id
    description
    questions {
      question
      explanation
      maxLength
      required
      sortOrder
    }
  }
`;
export const CommunityDetailsFragmentDoc = gql`
  fragment CommunityDetails on Community {
    id
    myMembershipStatus
    communication {
      id
      authorization {
        id
        myPrivileges
      }
    }
  }
`;
export const CommunityGuidelinesDetailsFragmentDoc = gql`
  fragment CommunityGuidelinesDetails on CommunityGuidelines {
    id
    profile {
      id
      displayName
      description
      references {
        id
        name
        uri
        description
      }
    }
  }
`;
export const CommunityPageMembersFragmentDoc = gql`
  fragment CommunityPageMembers on User {
    id
    nameID
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
      displayName
      location {
        country
        city
      }
      visual(type: AVATAR) {
        ...VisualUri
      }
      description
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const BasicOrganizationDetailsFragmentDoc = gql`
  fragment BasicOrganizationDetails on Organization {
    id
    nameID
    profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const CommunityMemberUserFragmentDoc = gql`
  fragment CommunityMemberUser on User {
    id
    nameID
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      location {
        id
        city
        country
      }
    }
    email
    firstName
    lastName
  }
  ${VisualUriFragmentDoc}
`;
export const OrganizationDetailsFragmentDoc = gql`
  fragment OrganizationDetails on Organization {
    id
    nameID
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      description
      tagsets {
        ...TagsetDetails
      }
      location {
        country
        city
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const CommunityPolicyFragmentDoc = gql`
  fragment CommunityPolicy on CommunityPolicy {
    id
    lead {
      maxOrg
      maxUser
      minOrg
      minUser
    }
    member {
      maxOrg
      maxUser
      minOrg
      minUser
    }
  }
`;
export const CommunityMembersDetailsFragmentDoc = gql`
  fragment CommunityMembersDetails on Community {
    id
    memberUsers {
      ...CommunityMemberUser
    }
    leadUsers: usersInRole(role: LEAD) {
      ...CommunityMemberUser
    }
    memberOrganizations: organizationsInRole(role: MEMBER) {
      ...OrganizationDetails
    }
    leadOrganizations: organizationsInRole(role: LEAD) {
      ...OrganizationDetails
    }
    policy {
      ...CommunityPolicy
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${CommunityMemberUserFragmentDoc}
  ${OrganizationDetailsFragmentDoc}
  ${CommunityPolicyFragmentDoc}
`;
export const AvailableUserFragmentDoc = gql`
  fragment AvailableUser on User {
    id
    profile {
      id
      displayName
    }
    email
  }
`;
export const PageInfoFragmentDoc = gql`
  fragment PageInfo on PageInfo {
    startCursor
    endCursor
    hasNextPage
  }
`;
export const CommunityAvailableLeadUsersFragmentDoc = gql`
  fragment CommunityAvailableLeadUsers on Community {
    id
    availableLeadUsers(first: $first, after: $after, filter: $filter) {
      users {
        ...AvailableUser
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${AvailableUserFragmentDoc}
  ${PageInfoFragmentDoc}
`;
export const CommunityAvailableMemberUsersFragmentDoc = gql`
  fragment CommunityAvailableMemberUsers on Community {
    id
    availableMemberUsers(first: $first, after: $after, filter: $filter) {
      users {
        ...AvailableUser
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${AvailableUserFragmentDoc}
  ${PageInfoFragmentDoc}
`;
export const OrganizationContributorFragmentDoc = gql`
  fragment OrganizationContributor on Organization {
    id
    nameID
    metrics {
      id
      name
      value
    }
    orgProfile: profile {
      id
      displayName
      visual(type: AVATAR) {
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
export const OrganizationContributorPaginatedFragmentDoc = gql`
  fragment OrganizationContributorPaginated on PaginatedOrganization {
    organization {
      ...OrganizationContributor
    }
    pageInfo {
      ...PageInfo
    }
  }
  ${OrganizationContributorFragmentDoc}
  ${PageInfoFragmentDoc}
`;
export const UserContributorFragmentDoc = gql`
  fragment UserContributor on User {
    id
    nameID
    isContactable
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
      displayName
      location {
        city
        country
      }
      visual(type: AVATAR) {
        ...VisualUri
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const UserContributorPaginatedFragmentDoc = gql`
  fragment UserContributorPaginated on PaginatedUsers {
    users {
      ...UserContributor
    }
    pageInfo {
      ...PageInfo
    }
  }
  ${UserContributorFragmentDoc}
  ${PageInfoFragmentDoc}
`;
export const FullLocationFragmentDoc = gql`
  fragment fullLocation on Location {
    id
    country
    city
    addressLine1
    addressLine2
    stateOrProvince
    postalCode
  }
`;
export const OrganizationInfoFragmentDoc = gql`
  fragment OrganizationInfo on Organization {
    id
    nameID
    contactEmail
    domain
    authorization {
      id
      myPrivileges
    }
    verification {
      id
      status
    }
    website
    profile {
      id
      displayName
      description
      tagline
      avatar: visual(type: AVATAR) {
        ...VisualUri
        alternativeText
      }
      tagsets {
        ...TagsetDetails
      }
      references {
        id
        name
        uri
      }
      location {
        ...fullLocation
      }
    }
    metrics {
      id
      name
      value
    }
    associates @include(if: $includeAssociates) {
      id
      nameID
      isContactable
      profile {
        id
        displayName
        location {
          country
          city
        }
        visual(type: AVATAR) {
          ...VisualUri
          alternativeText
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
    admins @include(if: $includeAssociates) {
      id
    }
    owners @include(if: $includeAssociates) {
      id
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${FullLocationFragmentDoc}
`;
export const OrganizationProfileInfoFragmentDoc = gql`
  fragment OrganizationProfileInfo on Organization {
    id
    nameID
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
      displayName
      visual(type: AVATAR) {
        ...VisualFull
      }
      description
      tagline
      location {
        country
        city
      }
      references {
        id
        name
        uri
        description
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const PendingMembershipsJourneyProfileFragmentDoc = gql`
  fragment PendingMembershipsJourneyProfile on Profile {
    id
    url
    displayName
    visual(type: $visualType) {
      id
      uri
    }
    ... on Profile @include(if: $fetchDetails) {
      tagline
      tagset {
        id
        tags
      }
    }
  }
`;
export const PendingMembershipInvitationFragmentDoc = gql`
  fragment PendingMembershipInvitation on Invitation {
    id
    welcomeMessage
    createdBy {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export const PendingMembershipsMembershipsFragmentDoc = gql`
  fragment PendingMembershipsMemberships on Community {
    id
    applications {
      id
    }
    invitations {
      ...PendingMembershipInvitation
    }
  }
  ${PendingMembershipInvitationFragmentDoc}
`;
export const CommunityGuidelinesSummaryFragmentDoc = gql`
  fragment CommunityGuidelinesSummary on CommunityGuidelines {
    id
    profile {
      id
      displayName
      description
      references {
        id
        name
        uri
        description
      }
    }
  }
`;
export const UserSelectorUserInformationFragmentDoc = gql`
  fragment UserSelectorUserInformation on User {
    id
    profile {
      id
      displayName
      location {
        id
        city
        country
      }
      visual(type: AVATAR) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const GroupDetailsFragmentDoc = gql`
  fragment GroupDetails on UserGroup {
    id
    profile {
      id
      displayName
    }
  }
`;
export const GroupInfoFragmentDoc = gql`
  fragment GroupInfo on UserGroup {
    id
    name
    profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualFull
      }
      description
      tagline
      references {
        id
        uri
        name
        description
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const GroupMembersFragmentDoc = gql`
  fragment GroupMembers on User {
    id
    profile {
      id
      displayName
    }
    firstName
    lastName
    email
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
    firstName
    lastName
    email
    gender
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
      displayName
      tagline
      location {
        country
        city
      }
      description
      avatar: visual(type: AVATAR) {
        ...VisualFull
      }
      references {
        id
        name
        uri
        description
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const UserDisplayNameFragmentDoc = gql`
  fragment UserDisplayName on User {
    id
    profile {
      id
      displayName
    }
  }
`;
export const UserRolesDetailsFragmentDoc = gql`
  fragment UserRolesDetails on ContributorRoles {
    spaces {
      id
      nameID
      displayName
      roles
      visibility
      challenges {
        id
        nameID
        displayName
        roles
      }
      opportunities {
        id
        nameID
        displayName
        roles
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
      roles
    }
  }
`;
export const UserCardFragmentDoc = gql`
  fragment UserCard on User {
    id
    nameID
    isContactable
    profile {
      id
      displayName
      location {
        country
        city
      }
      visual(type: AVATAR) {
        ...VisualUri
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const OrganizationCardFragmentDoc = gql`
  fragment OrganizationCard on Organization {
    id
    nameID
    metrics {
      id
      name
      value
    }
    profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualUri
      }
      location {
        id
        city
        country
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
export const CommunityMembersFragmentDoc = gql`
  fragment CommunityMembers on Community {
    leadUsers: usersInRole(role: LEAD) {
      ...UserCard
    }
    memberUsers {
      ...UserCard
    }
    leadOrganizations: organizationsInRole(role: LEAD) {
      ...OrganizationCard
    }
    memberOrganizations: organizationsInRole(role: MEMBER) {
      ...OrganizationCard
    }
  }
  ${UserCardFragmentDoc}
  ${OrganizationCardFragmentDoc}
`;
export const ContextDetailsProviderFragmentDoc = gql`
  fragment ContextDetailsProvider on Context {
    id
    vision
    impact
    who
  }
`;
export const InnovationHubProfileFragmentDoc = gql`
  fragment InnovationHubProfile on Profile {
    id
    displayName
    description
    tagline
    tagset {
      ...TagsetDetails
    }
    visual(type: BANNER_WIDE) {
      ...VisualFull
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const InnovationHubSpaceFragmentDoc = gql`
  fragment InnovationHubSpace on Space {
    id
    account {
      id
      license {
        id
        visibility
      }
    }
    profile {
      id
      displayName
    }
    host {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export const AdminInnovationHubFragmentDoc = gql`
  fragment AdminInnovationHub on InnovationHub {
    id
    nameID
    subdomain
    profile {
      ...InnovationHubProfile
    }
    spaceListFilter {
      ...InnovationHubSpace
    }
    spaceVisibilityFilter
  }
  ${InnovationHubProfileFragmentDoc}
  ${InnovationHubSpaceFragmentDoc}
`;
export const InnovationHubHomeInnovationHubFragmentDoc = gql`
  fragment InnovationHubHomeInnovationHub on InnovationHub {
    id
    nameID
    profile {
      id
      displayName
      tagline
      description
      banner: visual(type: BANNER_WIDE) {
        id
        uri
        alternativeText
      }
    }
  }
`;
export const DashboardTopCalloutFragmentDoc = gql`
  fragment DashboardTopCallout on Callout {
    id
    framing {
      id
      profile {
        id
        url
        displayName
        description
      }
    }
    type
    visibility
    activity
  }
`;
export const DashboardTopCalloutsFragmentDoc = gql`
  fragment DashboardTopCallouts on Collaboration {
    callouts(sortByActivity: true) {
      ...DashboardTopCallout
    }
  }
  ${DashboardTopCalloutFragmentDoc}
`;
export const DashboardTimelineAuthorizationFragmentDoc = gql`
  fragment DashboardTimelineAuthorization on Collaboration {
    timeline {
      id
      authorization {
        id
        myPrivileges
      }
    }
  }
`;
export const DashboardLeadUserFragmentDoc = gql`
  fragment DashboardLeadUser on User {
    id
    nameID
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      location {
        id
        country
        city
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const DashboardContributingUserFragmentDoc = gql`
  fragment DashboardContributingUser on User {
    id
    isContactable
    nameID
    profile {
      id
      displayName
      location {
        id
        city
        country
      }
      visual(type: AVATAR) {
        id
        uri
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const AssociatedOrganizationDetailsFragmentDoc = gql`
  fragment AssociatedOrganizationDetails on Organization {
    id
    nameID
    profile {
      id
      tagline
      displayName
      description
      location {
        id
        city
        country
      }
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      tagsets {
        id
        tags
      }
    }
    verification {
      id
      status
    }
    metrics {
      id
      name
      value
    }
  }
  ${VisualUriFragmentDoc}
`;
export const DashboardContributingOrganizationFragmentDoc = gql`
  fragment DashboardContributingOrganization on Organization {
    id
    nameID
    profile {
      id
      displayName
      visual(type: AVATAR) {
        id
        uri
        name
      }
      tagsets {
        ...TagsetDetails
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const EntityDashboardCommunityFragmentDoc = gql`
  fragment EntityDashboardCommunity on Community {
    id
    leadUsers: usersInRole(role: LEAD) {
      ...DashboardLeadUser
    }
    memberUsers(limit: 8) {
      ...DashboardContributingUser
    }
    leadOrganizations: organizationsInRole(role: LEAD) {
      ...AssociatedOrganizationDetails
    }
    memberOrganizations: organizationsInRole(role: MEMBER) {
      ...DashboardContributingOrganization
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${DashboardLeadUserFragmentDoc}
  ${DashboardContributingUserFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${DashboardContributingOrganizationFragmentDoc}
`;
export const ChallengeProfileFragmentDoc = gql`
  fragment ChallengeProfile on Challenge {
    id
    nameID
    metrics {
      id
      name
      value
    }
    profile {
      id
      url
      tagline
      displayName
      visuals {
        ...VisualFull
      }
      tagset {
        ...TagsetDetails
      }
    }
    authorization {
      id
      myPrivileges
    }
    context {
      id
      vision
      authorization {
        id
        myPrivileges
        anonymousReadAccess
      }
    }
    collaboration {
      id
      innovationFlow {
        id
        states {
          displayName
          description
        }
        currentState {
          displayName
        }
      }
      ...DashboardTopCallouts
      ...DashboardTimelineAuthorization
    }
    community {
      id
      myMembershipStatus
      ...EntityDashboardCommunity
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${DashboardTimelineAuthorizationFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
`;
export const ChallengeInfoFragmentDoc = gql`
  fragment ChallengeInfo on Challenge {
    id
    nameID
    profile {
      id
      displayName
      tagline
      description
      url
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        uri
      }
      visuals {
        ...VisualFull
      }
      location {
        ...fullLocation
      }
    }
    community {
      id
      myMembershipStatus
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
      authorization {
        id
        myPrivileges
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${FullLocationFragmentDoc}
`;
export const NewChallengeFragmentDoc = gql`
  fragment NewChallenge on Challenge {
    id
    nameID
    profile {
      id
      displayName
    }
  }
`;
export const ContextDetailsFragmentDoc = gql`
  fragment ContextDetails on Context {
    id
    vision
    impact
    who
    authorization {
      id
      myPrivileges
      anonymousReadAccess
    }
  }
`;
export const OpportunityCardFragmentDoc = gql`
  fragment OpportunityCard on Opportunity {
    id
    profile {
      id
      url
      displayName
      tagline
      tagset {
        ...TagsetDetails
      }
      cardBanner: visual(type: CARD) {
        ...VisualFull
      }
      url
    }
    metrics {
      id
      name
      value
    }
    collaboration {
      id
      innovationFlow {
        id
        currentState {
          displayName
        }
      }
    }
    context {
      ...ContextDetails
    }
    community {
      id
      myMembershipStatus
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${ContextDetailsFragmentDoc}
`;
export const OpportunitiesOnChallengeFragmentDoc = gql`
  fragment OpportunitiesOnChallenge on Challenge {
    id
    opportunities {
      ...OpportunityCard
    }
  }
  ${OpportunityCardFragmentDoc}
`;
export const ContextTabFragmentDoc = gql`
  fragment ContextTab on Context {
    id
    authorization {
      id
      myPrivileges
    }
    vision
    impact
    who
  }
`;
export const MetricsItemFragmentDoc = gql`
  fragment MetricsItem on NVP {
    id
    name
    value
  }
`;
export const ProfileJourneyDataFragmentDoc = gql`
  fragment ProfileJourneyData on Profile {
    id
    displayName
    tagline
    references {
      ...ReferenceDetails
    }
    description
  }
  ${ReferenceDetailsFragmentDoc}
`;
export const ContextJourneyDataFragmentDoc = gql`
  fragment ContextJourneyData on Context {
    id
    vision
    who
    impact
  }
`;
export const JourneyCommunityFragmentDoc = gql`
  fragment JourneyCommunity on Community {
    id
    leadUsers: usersInRole(role: LEAD) {
      ...DashboardLeadUser
    }
    leadOrganizations: organizationsInRole(role: LEAD) {
      ...AssociatedOrganizationDetails
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${DashboardLeadUserFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
`;
export const JourneyBreadcrumbsProfileFragmentDoc = gql`
  fragment JourneyBreadcrumbsProfile on Profile {
    id
    url
    displayName
    avatar: visual(type: AVATAR) {
      id
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const OpportunityPageFragmentDoc = gql`
  fragment OpportunityPage on Opportunity {
    id
    nameID
    profile {
      id
      url
      displayName
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        description
        uri
      }
      visuals {
        ...VisualUri
      }
    }
    authorization {
      id
      anonymousReadAccess
      myPrivileges
    }
    metrics {
      id
      name
      value
    }
    collaboration {
      id
      innovationFlow {
        id
        states {
          displayName
          description
        }
        currentState {
          displayName
        }
      }
      ...DashboardTopCallouts
      ...DashboardTimelineAuthorization
    }
    context {
      id
      vision
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
    }
    community {
      ...EntityDashboardCommunity
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${DashboardTimelineAuthorizationFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
`;
export const OpportunityProviderFragmentDoc = gql`
  fragment OpportunityProvider on Opportunity {
    id
    nameID
    profile {
      id
      displayName
      description
      tagline
      url
      visuals {
        ...VisualFull
      }
      tagset {
        ...TagsetDetails
      }
      location {
        id
        country
        city
      }
    }
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
    }
    community {
      id
      myMembershipStatus
      authorization {
        id
        myPrivileges
      }
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const NewOpportunityFragmentDoc = gql`
  fragment NewOpportunity on Opportunity {
    id
    nameID
    profile {
      id
      displayName
    }
  }
`;
export const SpaceCardFragmentDoc = gql`
  fragment SpaceCard on Space {
    id
    profile {
      id
      url
      displayName
      tagline
      tagset {
        ...TagsetDetails
      }
      cardBanner: visual(type: CARD) {
        ...VisualUri
      }
    }
    authorization {
      id
      anonymousReadAccess
    }
    metrics {
      name
      value
    }
    community {
      id
      myMembershipStatus
    }
    context {
      id
      vision
    }
    account {
      id
      license {
        id
        visibility
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const CommunityPageCommunityFragmentDoc = gql`
  fragment CommunityPageCommunity on Community {
    id
    leadUsers: usersInRole(role: LEAD) {
      ...DashboardLeadUser
    }
    memberUsers {
      ...DashboardContributingUser
    }
    leadOrganizations: organizationsInRole(role: LEAD) {
      ...AssociatedOrganizationDetails
    }
    memberOrganizations: organizationsInRole(role: MEMBER) {
      ...DashboardContributingOrganization
    }
  }
  ${DashboardLeadUserFragmentDoc}
  ${DashboardContributingUserFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${DashboardContributingOrganizationFragmentDoc}
`;
export const SpaceDetailsFragmentDoc = gql`
  fragment SpaceDetails on Space {
    id
    nameID
    profile {
      id
      displayName
      description
      tagline
      url
      tagset {
        ...TagsetDetails
      }
      references {
        id
        name
        description
        uri
      }
      visuals {
        ...VisualFull
      }
      location {
        ...fullLocation
      }
    }
    host {
      id
    }
    authorization {
      id
      anonymousReadAccess
    }
    context {
      ...ContextDetails
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${FullLocationFragmentDoc}
  ${ContextDetailsFragmentDoc}
`;
export const SpaceInfoFragmentDoc = gql`
  fragment SpaceInfo on Space {
    ...SpaceDetails
    authorization {
      id
      myPrivileges
    }
    community {
      id
      myMembershipStatus
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
    account {
      id
      license {
        id
        visibility
      }
    }
  }
  ${SpaceDetailsFragmentDoc}
`;
export const SpaceWelcomeBlockContributorProfileFragmentDoc = gql`
  fragment SpaceWelcomeBlockContributorProfile on Profile {
    id
    displayName
    location {
      id
      city
      country
    }
    tagsets {
      id
      tags
    }
  }
`;
export const SpacePageFragmentDoc = gql`
  fragment SpacePage on Space {
    id
    nameID
    account {
      id
      license {
        id
        visibility
      }
    }
    metrics {
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
      ...AssociatedOrganizationDetails
      profile {
        ...SpaceWelcomeBlockContributorProfile
      }
    }
    profile {
      id
      url
      displayName
      description
      tagline
      visuals {
        ...VisualUri
      }
      tagset {
        ...TagsetDetails
      }
    }
    context {
      id
      vision
      who
      impact
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
    }
    collaboration @include(if: $authorizedReadAccess) {
      id
      ...DashboardTopCallouts
      ...DashboardTimelineAuthorization
    }
    community @include(if: $authorizedReadAccessCommunity) {
      id
      myMembershipStatus
      ...EntityDashboardCommunity
      leadUsers: usersInRole(role: LEAD) {
        profile {
          ...SpaceWelcomeBlockContributorProfile
        }
      }
    }
  }
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${SpaceWelcomeBlockContributorProfileFragmentDoc}
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${DashboardTimelineAuthorizationFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
`;
export const SpaceDashboardNavigationProfileFragmentDoc = gql`
  fragment SpaceDashboardNavigationProfile on Profile {
    id
    url
    displayName
    tagline
    tagset {
      ...TagsetDetails
    }
    avatar: visual(type: AVATAR) {
      id
      uri
      alternativeText
    }
    cardBanner: visual(type: CARD) {
      id
      uri
      alternativeText
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const SpaceDashboardNavigationContextFragmentDoc = gql`
  fragment SpaceDashboardNavigationContext on Context {
    id
    vision
  }
`;
export const SpaceDashboardNavigationCommunityFragmentDoc = gql`
  fragment SpaceDashboardNavigationCommunity on Community {
    id
    myMembershipStatus
  }
`;
export const PostTemplateCardFragmentDoc = gql`
  fragment PostTemplateCard on PostTemplate {
    id
    defaultDescription
    type
    profile {
      ...TemplateCardProfileInfo
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
`;
export const WhiteboardTemplateCardFragmentDoc = gql`
  fragment WhiteboardTemplateCard on WhiteboardTemplate {
    id
    profile {
      ...TemplateCardProfileInfo
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
`;
export const InnovationFlowTemplateCardFragmentDoc = gql`
  fragment InnovationFlowTemplateCard on InnovationFlowTemplate {
    id
    profile {
      ...TemplateCardProfileInfo
    }
    states {
      displayName
      description
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
`;
export const SpaceTemplatesFragmentDoc = gql`
  fragment SpaceTemplates on Space {
    account {
      id
      library {
        id
        postTemplates {
          ...PostTemplateCard
        }
        whiteboardTemplates {
          ...WhiteboardTemplateCard
        }
        innovationFlowTemplates {
          ...InnovationFlowTemplateCard
        }
      }
    }
  }
  ${PostTemplateCardFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
  ${InnovationFlowTemplateCardFragmentDoc}
`;
export const ChallengeCardFragmentDoc = gql`
  fragment ChallengeCard on Challenge {
    id
    authorization {
      id
      anonymousReadAccess
    }
    metrics {
      id
      name
      value
    }
    profile {
      id
      url
      tagline
      displayName
      description
      cardBanner: visual(type: CARD) {
        ...VisualUri
      }
      tagset {
        ...TagsetDetails
      }
      url
    }
    context {
      id
      vision
    }
    community {
      id
      myMembershipStatus
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const ChallengesOnSpaceFragmentDoc = gql`
  fragment ChallengesOnSpace on Space {
    id
    challenges {
      ...ChallengeCard
    }
  }
  ${ChallengeCardFragmentDoc}
`;
export const AdminSpaceFragmentDoc = gql`
  fragment AdminSpace on Space {
    id
    nameID
    account {
      id
      license {
        id
        visibility
        featureFlags {
          name
          enabled
        }
      }
    }
    profile {
      id
      displayName
    }
    authorization {
      id
      myPrivileges
    }
    host {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export const StorageAggregatorParentFragmentDoc = gql`
  fragment StorageAggregatorParent on StorageAggregatorParent {
    id
    type
    displayName
    url
  }
`;
export const LoadableStorageAggregatorFragmentDoc = gql`
  fragment LoadableStorageAggregator on StorageAggregator {
    id
    parentEntity {
      ...StorageAggregatorParent
    }
  }
  ${StorageAggregatorParentFragmentDoc}
`;
export const DocumentDataFragmentDoc = gql`
  fragment DocumentData on Document {
    id
    displayName
    size
    mimeType
    createdBy {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    uploadedDate
    authorization {
      id
      myPrivileges
    }
    url
  }
`;
export const StorageBucketParentFragmentDoc = gql`
  fragment StorageBucketParent on StorageBucketParent {
    id
    type
    displayName
    url
  }
`;
export const StorageBucketFragmentDoc = gql`
  fragment StorageBucket on StorageBucket {
    id
    size
    documents {
      ...DocumentData
    }
    parentEntity {
      ...StorageBucketParent
    }
  }
  ${DocumentDataFragmentDoc}
  ${StorageBucketParentFragmentDoc}
`;
export const StorageAggregatorFragmentDoc = gql`
  fragment StorageAggregator on StorageAggregator {
    id
    parentEntity {
      ...StorageAggregatorParent
    }
    storageAggregators {
      ...LoadableStorageAggregator
    }
    storageBuckets {
      ...StorageBucket
    }
    directStorageBucket {
      ...StorageBucket
    }
  }
  ${StorageAggregatorParentFragmentDoc}
  ${LoadableStorageAggregatorFragmentDoc}
  ${StorageBucketFragmentDoc}
`;
export const ProfileInfoWithVisualFragmentDoc = gql`
  fragment ProfileInfoWithVisual on Profile {
    id
    displayName
    description
    tagset {
      ...TagsetDetails
    }
    visual(type: CARD) {
      ...VisualFull
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const AdminCalloutTemplateFragmentDoc = gql`
  fragment AdminCalloutTemplate on CalloutTemplate {
    id
    type
    profile {
      ...ProfileInfoWithVisual
    }
    contributionPolicy {
      id
      allowedContributionTypes
    }
  }
  ${ProfileInfoWithVisualFragmentDoc}
`;
export const InnovationPackProfileFragmentDoc = gql`
  fragment InnovationPackProfile on Profile {
    id
    displayName
    description
    tagline
    tagset {
      ...TagsetDetails
    }
    references {
      id
      name
      description
      uri
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const AdminPostTemplateFragmentDoc = gql`
  fragment AdminPostTemplate on PostTemplate {
    id
    defaultDescription
    type
    profile {
      ...ProfileInfoWithVisual
    }
  }
  ${ProfileInfoWithVisualFragmentDoc}
`;
export const AdminInnovationFlowTemplateFragmentDoc = gql`
  fragment AdminInnovationFlowTemplate on InnovationFlowTemplate {
    id
    states {
      displayName
      description
    }
    profile {
      ...ProfileInfoWithVisual
    }
  }
  ${ProfileInfoWithVisualFragmentDoc}
`;
export const AdminWhiteboardTemplateFragmentDoc = gql`
  fragment AdminWhiteboardTemplate on WhiteboardTemplate {
    id
    profile {
      ...ProfileInfoWithVisual
    }
  }
  ${ProfileInfoWithVisualFragmentDoc}
`;
export const AdminInnovationPackTemplatesFragmentDoc = gql`
  fragment AdminInnovationPackTemplates on TemplatesSet {
    id
    postTemplates {
      ...AdminPostTemplate
    }
    innovationFlowTemplates {
      ...AdminInnovationFlowTemplate
    }
    whiteboardTemplates {
      ...AdminWhiteboardTemplate
    }
  }
  ${AdminPostTemplateFragmentDoc}
  ${AdminInnovationFlowTemplateFragmentDoc}
  ${AdminWhiteboardTemplateFragmentDoc}
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
    locations {
      environment
      domain
      landing
      about
      blog
      feedback
      forumreleases
      privacy
      security
      support
      terms
      impact
      foundation
      opensource
      inspiration
      innovationLibrary
      releases
      help
      community
      newuser
      tips
      aup
    }
    featureFlags {
      enabled
      name
    }
    sentry {
      enabled
      endpoint
      submitPII
    }
    apm {
      rumEnabled
      endpoint
    }
    geo {
      endpoint
    }
  }
`;
export const ProfileStorageConfigFragmentDoc = gql`
  fragment ProfileStorageConfig on Profile {
    id
    storageBucket {
      id
      allowedMimeTypes
      maxFileSize
      authorization {
        id
        myPrivileges
      }
    }
  }
`;
export const CalloutOnCollaborationWithStorageConfigFragmentDoc = gql`
  fragment CalloutOnCollaborationWithStorageConfig on Collaboration {
    id
    callouts(IDs: [$calloutId]) {
      id
      framing {
        id
        profile {
          ...ProfileStorageConfig
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;
export const CalloutTemplatePreviewFragmentDoc = gql`
  fragment CalloutTemplatePreview on CalloutTemplate {
    id
    type
    framing {
      id
      profile {
        id
        displayName
        description
        tagset {
          ...TagsetDetails
        }
        storageBucket {
          id
        }
      }
      whiteboard {
        ...WhiteboardDetails
      }
    }
    contributionPolicy {
      state
    }
    contributionDefaults {
      id
      postDescription
      whiteboardContent
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
`;
export const EventProfileFragmentDoc = gql`
  fragment EventProfile on Profile {
    id
    url
    displayName
    description
    tagset {
      ...TagsetDetails
    }
    references {
      id
      name
      uri
      description
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CalendarEventInfoFragmentDoc = gql`
  fragment CalendarEventInfo on CalendarEvent {
    id
    nameID
    startDate
    durationDays
    durationMinutes
    wholeDay
    multipleDays
    profile {
      ...EventProfile
    }
  }
  ${EventProfileFragmentDoc}
`;
export const CollaborationTimelineInfoFragmentDoc = gql`
  fragment CollaborationTimelineInfo on Collaboration {
    id
    timeline {
      id
      calendar {
        id
        authorization {
          id
          myPrivileges
        }
        events(limit: $limit) {
          ...CalendarEventInfo
        }
      }
    }
  }
  ${CalendarEventInfoFragmentDoc}
`;
export const CalendarEventDetailsFragmentDoc = gql`
  fragment CalendarEventDetails on CalendarEvent {
    ...CalendarEventInfo
    type
    createdBy {
      id
      profile {
        id
        url
        displayName
        visual(type: AVATAR) {
          id
          uri
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
    createdDate
    comments {
      ...CommentsWithMessages
    }
  }
  ${CalendarEventInfoFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
`;
export const SearchResultPostProfileFragmentDoc = gql`
  fragment SearchResultPostProfile on Profile {
    id
    description
    tagset {
      ...TagsetDetails
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const PostParentFragmentDoc = gql`
  fragment PostParent on SearchResultPost {
    space {
      id
      account {
        id
        license {
          id
          visibility
        }
      }
      profile {
        id
        url
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    challenge {
      id
      profile {
        id
        url
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    opportunity {
      id
      profile {
        id
        url
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    callout {
      id
      framing {
        id
        profile {
          id
          url
          displayName
        }
      }
    }
  }
`;
export const SearchResultPostFragmentDoc = gql`
  fragment SearchResultPost on SearchResultPost {
    post {
      id
      profile {
        id
        url
        displayName
        visual(type: CARD) {
          ...VisualUri
        }
        ...SearchResultPostProfile
      }
      createdBy {
        id
        profile {
          id
          displayName
        }
      }
      createdDate
      comments {
        id
        messagesCount
      }
    }
    ...PostParent
  }
  ${VisualUriFragmentDoc}
  ${SearchResultPostProfileFragmentDoc}
  ${PostParentFragmentDoc}
`;
export const SearchResultProfileFragmentDoc = gql`
  fragment SearchResultProfile on Profile {
    id
    description
    location {
      id
      country
      city
    }
    tagsets {
      ...TagsetDetails
    }
    visual(type: AVATAR) {
      ...VisualUri
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const SearchResultUserFragmentDoc = gql`
  fragment SearchResultUser on SearchResultUser {
    user {
      id
      nameID
      profile {
        displayName
        ...SearchResultProfile
      }
    }
  }
  ${SearchResultProfileFragmentDoc}
`;
export const SearchResultCalloutFragmentDoc = gql`
  fragment SearchResultCallout on SearchResultCallout {
    callout {
      id
      nameID
      type
      framing {
        id
      }
    }
  }
`;
export const SearchResultOrganizationFragmentDoc = gql`
  fragment SearchResultOrganization on SearchResultOrganization {
    organization {
      id
      nameID
      profile {
        displayName
        ...SearchResultProfile
      }
    }
  }
  ${SearchResultProfileFragmentDoc}
`;
export const SearchResultSpaceFragmentDoc = gql`
  fragment SearchResultSpace on SearchResultSpace {
    space {
      id
      profile {
        id
        url
        displayName
        tagset {
          ...TagsetDetails
        }
        tagline
        visuals {
          ...VisualUri
        }
      }
      context {
        id
        vision
      }
      authorization {
        id
        anonymousReadAccess
      }
      community {
        id
        myMembershipStatus
      }
      account {
        id
        license {
          id
          visibility
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const SearchResultChallengeFragmentDoc = gql`
  fragment SearchResultChallenge on SearchResultChallenge {
    challenge {
      id
      profile {
        id
        url
        displayName
        tagset {
          ...TagsetDetails
        }
        tagline
        visuals {
          ...VisualUri
        }
      }
      account {
        spaceID
      }
      context {
        id
        vision
      }
      authorization {
        id
        anonymousReadAccess
      }
      community {
        id
        myMembershipStatus
      }
    }
    space {
      id
      profile {
        id
        url
        displayName
        tagline
      }
      authorization {
        id
        anonymousReadAccess
      }
      account {
        id
        license {
          id
          visibility
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const SearchResultOpportunityFragmentDoc = gql`
  fragment SearchResultOpportunity on SearchResultOpportunity {
    opportunity {
      id
      profile {
        id
        url
        displayName
        tagset {
          ...TagsetDetails
        }
        tagline
        visuals {
          ...VisualUri
        }
      }
      context {
        id
        vision
      }
      authorization {
        id
        anonymousReadAccess
      }
      community {
        id
        myMembershipStatus
      }
    }
    challenge {
      id
      profile {
        id
        url
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    space {
      id
      account {
        id
        license {
          id
          visibility
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const LibraryTemplatesFragmentDoc = gql`
  fragment LibraryTemplates on TemplatesSet {
    id
    postTemplates {
      id
      profile {
        id
        displayName
        description
        visual(type: CARD) {
          ...VisualUri
        }
        tagset {
          ...TagsetDetails
        }
      }
      type
      defaultDescription
    }
    postTemplatesCount
    whiteboardTemplates {
      id
      profile {
        id
        displayName
        description
        visual(type: CARD) {
          ...VisualUri
        }
        tagset {
          ...TagsetDetails
        }
      }
    }
    whiteboardTemplatesCount
    innovationFlowTemplates {
      id
      profile {
        id
        displayName
        description
        visual(type: CARD) {
          ...VisualUri
        }
        tagset {
          ...TagsetDetails
        }
      }
      states {
        displayName
        description
      }
    }
    innovationFlowTemplatesCount
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const InnovationPackProviderProfileWithAvatarFragmentDoc = gql`
  fragment InnovationPackProviderProfileWithAvatar on Organization {
    id
    nameID
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const InnovationPackDataFragmentDoc = gql`
  fragment InnovationPackData on InnovationPack {
    id
    nameID
    profile {
      id
      displayName
      description
      tagset {
        ...TagsetDetails
      }
    }
    templates {
      ...LibraryTemplates
    }
    provider {
      ...InnovationPackProviderProfileWithAvatar
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${LibraryTemplatesFragmentDoc}
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
`;
export const InnovationPackCardFragmentDoc = gql`
  fragment InnovationPackCard on InnovationPack {
    id
    nameID
    profile {
      id
      displayName
      description
      tagset {
        ...TagsetDetails
      }
    }
    templates {
      postTemplatesCount
      whiteboardTemplatesCount
      innovationFlowTemplatesCount
    }
    provider {
      ...InnovationPackProviderProfileWithAvatar
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
`;
export const RecentContributionsJourneyProfileFragmentDoc = gql`
  fragment RecentContributionsJourneyProfile on Profile {
    id
    url
    displayName
    type
  }
`;
export const RecentContributionsSpaceProfileFragmentDoc = gql`
  fragment RecentContributionsSpaceProfile on Profile {
    ...RecentContributionsJourneyProfile
    avatar: visual(type: CARD) {
      id
      uri
    }
  }
  ${RecentContributionsJourneyProfileFragmentDoc}
`;
export const RecentContributionsChildJourneyProfileFragmentDoc = gql`
  fragment RecentContributionsChildJourneyProfile on Profile {
    ...RecentContributionsJourneyProfile
    avatar: visual(type: AVATAR) {
      id
      uri
    }
  }
  ${RecentContributionsJourneyProfileFragmentDoc}
`;
export const MyMembershipsChildJourneyCommunityFragmentDoc = gql`
  fragment MyMembershipsChildJourneyCommunity on Community {
    id
    myMembershipStatus
    myRoles
  }
`;
export const MyMembershipsChildJourneyProfileFragmentDoc = gql`
  fragment MyMembershipsChildJourneyProfile on Profile {
    id
    displayName
    tagline
    url
    avatar: visual(type: AVATAR) {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const RecentJourneyProfileFragmentDoc = gql`
  fragment RecentJourneyProfile on Profile {
    id
    url
    displayName
    cardBanner: visual(type: CARD) {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SpaceExplorerSpaceFragmentDoc = gql`
  fragment SpaceExplorerSpace on Space {
    id
    authorization {
      id
      anonymousReadAccess
    }
    profile {
      id
      url
      tagline
      displayName
      type
      tagset {
        id
        tags
      }
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
    }
    context {
      id
      vision
    }
    account {
      id
      license {
        id
        visibility
      }
    }
    community {
      id
      myMembershipStatus
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SpaceExplorerSearchSpaceFragmentDoc = gql`
  fragment SpaceExplorerSearchSpace on SearchResultSpace {
    space {
      ...SpaceExplorerSpace
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
`;
export const SpaceExplorerChallengeFragmentDoc = gql`
  fragment SpaceExplorerChallenge on Challenge {
    id
    profile {
      id
      url
      tagline
      displayName
      description
      cardBanner: visual(type: CARD) {
        ...VisualUri
      }
      type
      tagset {
        id
        tags
      }
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
    }
    context {
      id
      vision
    }
    community {
      id
      myMembershipStatus
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SpaceExplorerSearchChallengeFragmentDoc = gql`
  fragment SpaceExplorerSearchChallenge on SearchResultChallenge {
    space {
      ...SpaceExplorerSpace
    }
    challenge {
      ...SpaceExplorerChallenge
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
  ${SpaceExplorerChallengeFragmentDoc}
`;
export const SpaceExplorerSpaceWithChallengesFragmentDoc = gql`
  fragment SpaceExplorerSpaceWithChallenges on Space {
    ...SpaceExplorerSpace
    challenges {
      ...SpaceExplorerChallenge
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
  ${SpaceExplorerChallengeFragmentDoc}
`;
export const AssignUserAsBetaTesterDocument = gql`
  mutation assignUserAsBetaTester($input: GrantAuthorizationCredentialInput!) {
    grantCredentialToUser(grantCredentialData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type AssignUserAsBetaTesterMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsBetaTesterMutation,
  SchemaTypes.AssignUserAsBetaTesterMutationVariables
>;

/**
 * __useAssignUserAsBetaTesterMutation__
 *
 * To run a mutation, you first call `useAssignUserAsBetaTesterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsBetaTesterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsBetaTesterMutation, { data, loading, error }] = useAssignUserAsBetaTesterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsBetaTesterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsBetaTesterMutation,
    SchemaTypes.AssignUserAsBetaTesterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsBetaTesterMutation,
    SchemaTypes.AssignUserAsBetaTesterMutationVariables
  >(AssignUserAsBetaTesterDocument, options);
}

export type AssignUserAsBetaTesterMutationHookResult = ReturnType<typeof useAssignUserAsBetaTesterMutation>;
export type AssignUserAsBetaTesterMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserAsBetaTesterMutation>;
export type AssignUserAsBetaTesterMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsBetaTesterMutation,
  SchemaTypes.AssignUserAsBetaTesterMutationVariables
>;
export const AssignUserAsGlobalAdminDocument = gql`
  mutation assignUserAsGlobalAdmin($input: AssignGlobalAdminInput!) {
    assignUserAsGlobalAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
      profile {
        id
        displayName
      }
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
export const AssignUserAsGlobalSpacesAdminDocument = gql`
  mutation assignUserAsGlobalSpacesAdmin($input: AssignGlobalSpacesAdminInput!) {
    assignUserAsGlobalSpacesAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type AssignUserAsGlobalSpacesAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsGlobalSpacesAdminMutation,
  SchemaTypes.AssignUserAsGlobalSpacesAdminMutationVariables
>;

/**
 * __useAssignUserAsGlobalSpacesAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsGlobalSpacesAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsGlobalSpacesAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsGlobalSpacesAdminMutation, { data, loading, error }] = useAssignUserAsGlobalSpacesAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsGlobalSpacesAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsGlobalSpacesAdminMutation,
    SchemaTypes.AssignUserAsGlobalSpacesAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsGlobalSpacesAdminMutation,
    SchemaTypes.AssignUserAsGlobalSpacesAdminMutationVariables
  >(AssignUserAsGlobalSpacesAdminDocument, options);
}

export type AssignUserAsGlobalSpacesAdminMutationHookResult = ReturnType<
  typeof useAssignUserAsGlobalSpacesAdminMutation
>;
export type AssignUserAsGlobalSpacesAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsGlobalSpacesAdminMutation>;
export type AssignUserAsGlobalSpacesAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsGlobalSpacesAdminMutation,
  SchemaTypes.AssignUserAsGlobalSpacesAdminMutationVariables
>;
export const AssignUserAsOrganizationOwnerDocument = gql`
  mutation assignUserAsOrganizationOwner($input: AssignOrganizationOwnerInput!) {
    assignUserAsOrganizationOwner(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const RemoveUserAsBetaTesterDocument = gql`
  mutation removeUserAsBetaTester($input: RevokeAuthorizationCredentialInput!) {
    revokeCredentialFromUser(revokeCredentialData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type RemoveUserAsBetaTesterMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsBetaTesterMutation,
  SchemaTypes.RemoveUserAsBetaTesterMutationVariables
>;

/**
 * __useRemoveUserAsBetaTesterMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsBetaTesterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsBetaTesterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsBetaTesterMutation, { data, loading, error }] = useRemoveUserAsBetaTesterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsBetaTesterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsBetaTesterMutation,
    SchemaTypes.RemoveUserAsBetaTesterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsBetaTesterMutation,
    SchemaTypes.RemoveUserAsBetaTesterMutationVariables
  >(RemoveUserAsBetaTesterDocument, options);
}

export type RemoveUserAsBetaTesterMutationHookResult = ReturnType<typeof useRemoveUserAsBetaTesterMutation>;
export type RemoveUserAsBetaTesterMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserAsBetaTesterMutation>;
export type RemoveUserAsBetaTesterMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsBetaTesterMutation,
  SchemaTypes.RemoveUserAsBetaTesterMutationVariables
>;
export const RemoveUserAsGlobalAdminDocument = gql`
  mutation removeUserAsGlobalAdmin($input: RemoveGlobalAdminInput!) {
    removeUserAsGlobalAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
      profile {
        id
        displayName
      }
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
export const RemoveUserAsGlobalSpacesAdminDocument = gql`
  mutation removeUserAsGlobalSpacesAdmin($input: RemoveGlobalSpacesAdminInput!) {
    removeUserAsGlobalSpacesAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type RemoveUserAsGlobalSpacesAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsGlobalSpacesAdminMutation,
  SchemaTypes.RemoveUserAsGlobalSpacesAdminMutationVariables
>;

/**
 * __useRemoveUserAsGlobalSpacesAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsGlobalSpacesAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsGlobalSpacesAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsGlobalSpacesAdminMutation, { data, loading, error }] = useRemoveUserAsGlobalSpacesAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsGlobalSpacesAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsGlobalSpacesAdminMutation,
    SchemaTypes.RemoveUserAsGlobalSpacesAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsGlobalSpacesAdminMutation,
    SchemaTypes.RemoveUserAsGlobalSpacesAdminMutationVariables
  >(RemoveUserAsGlobalSpacesAdminDocument, options);
}

export type RemoveUserAsGlobalSpacesAdminMutationHookResult = ReturnType<
  typeof useRemoveUserAsGlobalSpacesAdminMutation
>;
export type RemoveUserAsGlobalSpacesAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsGlobalSpacesAdminMutation>;
export type RemoveUserAsGlobalSpacesAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsGlobalSpacesAdminMutation,
  SchemaTypes.RemoveUserAsGlobalSpacesAdminMutationVariables
>;
export const RemoveUserAsOrganizationOwnerDocument = gql`
  mutation removeUserAsOrganizationOwner($input: RemoveOrganizationOwnerInput!) {
    removeUserAsOrganizationOwner(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const UploadFileOnReferenceDocument = gql`
  mutation UploadFileOnReference($file: Upload!, $uploadData: StorageBucketUploadFileOnReferenceInput!) {
    uploadFileOnReference(uploadData: $uploadData, file: $file) {
      id
      uri
    }
  }
`;
export type UploadFileOnReferenceMutationFn = Apollo.MutationFunction<
  SchemaTypes.UploadFileOnReferenceMutation,
  SchemaTypes.UploadFileOnReferenceMutationVariables
>;

/**
 * __useUploadFileOnReferenceMutation__
 *
 * To run a mutation, you first call `useUploadFileOnReferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileOnReferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileOnReferenceMutation, { data, loading, error }] = useUploadFileOnReferenceMutation({
 *   variables: {
 *      file: // value for 'file'
 *      uploadData: // value for 'uploadData'
 *   },
 * });
 */
export function useUploadFileOnReferenceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UploadFileOnReferenceMutation,
    SchemaTypes.UploadFileOnReferenceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UploadFileOnReferenceMutation,
    SchemaTypes.UploadFileOnReferenceMutationVariables
  >(UploadFileOnReferenceDocument, options);
}

export type UploadFileOnReferenceMutationHookResult = ReturnType<typeof useUploadFileOnReferenceMutation>;
export type UploadFileOnReferenceMutationResult = Apollo.MutationResult<SchemaTypes.UploadFileOnReferenceMutation>;
export type UploadFileOnReferenceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadFileOnReferenceMutation,
  SchemaTypes.UploadFileOnReferenceMutationVariables
>;
export const UploadFileOnLinkDocument = gql`
  mutation UploadFileOnLink($file: Upload!, $uploadData: StorageBucketUploadFileOnLinkInput!) {
    uploadFileOnLink(uploadData: $uploadData, file: $file) {
      id
      uri
    }
  }
`;
export type UploadFileOnLinkMutationFn = Apollo.MutationFunction<
  SchemaTypes.UploadFileOnLinkMutation,
  SchemaTypes.UploadFileOnLinkMutationVariables
>;

/**
 * __useUploadFileOnLinkMutation__
 *
 * To run a mutation, you first call `useUploadFileOnLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileOnLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileOnLinkMutation, { data, loading, error }] = useUploadFileOnLinkMutation({
 *   variables: {
 *      file: // value for 'file'
 *      uploadData: // value for 'uploadData'
 *   },
 * });
 */
export function useUploadFileOnLinkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UploadFileOnLinkMutation,
    SchemaTypes.UploadFileOnLinkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UploadFileOnLinkMutation, SchemaTypes.UploadFileOnLinkMutationVariables>(
    UploadFileOnLinkDocument,
    options
  );
}

export type UploadFileOnLinkMutationHookResult = ReturnType<typeof useUploadFileOnLinkMutation>;
export type UploadFileOnLinkMutationResult = Apollo.MutationResult<SchemaTypes.UploadFileOnLinkMutation>;
export type UploadFileOnLinkMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadFileOnLinkMutation,
  SchemaTypes.UploadFileOnLinkMutationVariables
>;
export const UploadFileDocument = gql`
  mutation UploadFile($file: Upload!, $uploadData: StorageBucketUploadFileInput!) {
    uploadFileOnStorageBucket(uploadData: $uploadData, file: $file)
  }
`;
export type UploadFileMutationFn = Apollo.MutationFunction<
  SchemaTypes.UploadFileMutation,
  SchemaTypes.UploadFileMutationVariables
>;

/**
 * __useUploadFileMutation__
 *
 * To run a mutation, you first call `useUploadFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileMutation, { data, loading, error }] = useUploadFileMutation({
 *   variables: {
 *      file: // value for 'file'
 *      uploadData: // value for 'uploadData'
 *   },
 * });
 */
export function useUploadFileMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UploadFileMutation, SchemaTypes.UploadFileMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UploadFileMutation, SchemaTypes.UploadFileMutationVariables>(
    UploadFileDocument,
    options
  );
}

export type UploadFileMutationHookResult = ReturnType<typeof useUploadFileMutation>;
export type UploadFileMutationResult = Apollo.MutationResult<SchemaTypes.UploadFileMutation>;
export type UploadFileMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UploadFileMutation,
  SchemaTypes.UploadFileMutationVariables
>;
export const ProfileVerifiedCredentialDocument = gql`
  subscription profileVerifiedCredential {
    profileVerifiedCredential {
      vc
    }
  }
`;

/**
 * __useProfileVerifiedCredentialSubscription__
 *
 * To run a query within a React component, call `useProfileVerifiedCredentialSubscription` and pass it any options that fit your needs.
 * When your component renders, `useProfileVerifiedCredentialSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileVerifiedCredentialSubscription({
 *   variables: {
 *   },
 * });
 */
export function useProfileVerifiedCredentialSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.ProfileVerifiedCredentialSubscription,
    SchemaTypes.ProfileVerifiedCredentialSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.ProfileVerifiedCredentialSubscription,
    SchemaTypes.ProfileVerifiedCredentialSubscriptionVariables
  >(ProfileVerifiedCredentialDocument, options);
}

export type ProfileVerifiedCredentialSubscriptionHookResult = ReturnType<
  typeof useProfileVerifiedCredentialSubscription
>;
export type ProfileVerifiedCredentialSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.ProfileVerifiedCredentialSubscription>;
export const GetSupportedCredentialMetadataDocument = gql`
  query getSupportedCredentialMetadata {
    getSupportedVerifiedCredentialMetadata {
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
    beginVerifiedCredentialRequestInteraction(types: $types) {
      qrCodeImg
      jwt
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
    beginAlkemioUserVerifiedCredentialOfferInteraction {
      jwt
      qrCodeImg
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
    beginCommunityMemberVerifiedCredentialOfferInteraction(communityID: $communityID) {
      jwt
      qrCodeImg
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
      user {
        ...UserAgentSsi
      }
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

export const CalloutPageCalloutDocument = gql`
  query CalloutPageCallout($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        ...CalloutDetails
      }
    }
  }
  ${CalloutDetailsFragmentDoc}
`;

/**
 * __useCalloutPageCalloutQuery__
 *
 * To run a query within a React component, call `useCalloutPageCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutPageCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutPageCalloutQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutPageCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutPageCalloutQuery,
    SchemaTypes.CalloutPageCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutPageCalloutQuery, SchemaTypes.CalloutPageCalloutQueryVariables>(
    CalloutPageCalloutDocument,
    options
  );
}

export function useCalloutPageCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutPageCalloutQuery,
    SchemaTypes.CalloutPageCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutPageCalloutQuery, SchemaTypes.CalloutPageCalloutQueryVariables>(
    CalloutPageCalloutDocument,
    options
  );
}

export type CalloutPageCalloutQueryHookResult = ReturnType<typeof useCalloutPageCalloutQuery>;
export type CalloutPageCalloutLazyQueryHookResult = ReturnType<typeof useCalloutPageCalloutLazyQuery>;
export type CalloutPageCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutPageCalloutQuery,
  SchemaTypes.CalloutPageCalloutQueryVariables
>;
export function refetchCalloutPageCalloutQuery(variables: SchemaTypes.CalloutPageCalloutQueryVariables) {
  return { query: CalloutPageCalloutDocument, variables: variables };
}

export const InnovationFlowBlockDocument = gql`
  query InnovationFlowBlock($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        id
        innovationFlow {
          id
          profile {
            id
            displayName
            cardBanner: visual(type: CARD) {
              id
              name
              uri
              alternativeText
            }
          }
        }
      }
    }
  }
`;

/**
 * __useInnovationFlowBlockQuery__
 *
 * To run a query within a React component, call `useInnovationFlowBlockQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowBlockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowBlockQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useInnovationFlowBlockQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowBlockQuery,
    SchemaTypes.InnovationFlowBlockQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationFlowBlockQuery, SchemaTypes.InnovationFlowBlockQueryVariables>(
    InnovationFlowBlockDocument,
    options
  );
}

export function useInnovationFlowBlockLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowBlockQuery,
    SchemaTypes.InnovationFlowBlockQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationFlowBlockQuery, SchemaTypes.InnovationFlowBlockQueryVariables>(
    InnovationFlowBlockDocument,
    options
  );
}

export type InnovationFlowBlockQueryHookResult = ReturnType<typeof useInnovationFlowBlockQuery>;
export type InnovationFlowBlockLazyQueryHookResult = ReturnType<typeof useInnovationFlowBlockLazyQuery>;
export type InnovationFlowBlockQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowBlockQuery,
  SchemaTypes.InnovationFlowBlockQueryVariables
>;
export function refetchInnovationFlowBlockQuery(variables: SchemaTypes.InnovationFlowBlockQueryVariables) {
  return { query: InnovationFlowBlockDocument, variables: variables };
}

export const InnovationFlowSettingsDocument = gql`
  query InnovationFlowSettings($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        innovationFlow {
          ...InnovationFlowDetails
        }
        ...InnovationFlowCollaboration
      }
    }
  }
  ${InnovationFlowDetailsFragmentDoc}
  ${InnovationFlowCollaborationFragmentDoc}
`;

/**
 * __useInnovationFlowSettingsQuery__
 *
 * To run a query within a React component, call `useInnovationFlowSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowSettingsQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useInnovationFlowSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowSettingsQuery,
    SchemaTypes.InnovationFlowSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationFlowSettingsQuery, SchemaTypes.InnovationFlowSettingsQueryVariables>(
    InnovationFlowSettingsDocument,
    options
  );
}

export function useInnovationFlowSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowSettingsQuery,
    SchemaTypes.InnovationFlowSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationFlowSettingsQuery, SchemaTypes.InnovationFlowSettingsQueryVariables>(
    InnovationFlowSettingsDocument,
    options
  );
}

export type InnovationFlowSettingsQueryHookResult = ReturnType<typeof useInnovationFlowSettingsQuery>;
export type InnovationFlowSettingsLazyQueryHookResult = ReturnType<typeof useInnovationFlowSettingsLazyQuery>;
export type InnovationFlowSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowSettingsQuery,
  SchemaTypes.InnovationFlowSettingsQueryVariables
>;
export function refetchInnovationFlowSettingsQuery(variables: SchemaTypes.InnovationFlowSettingsQueryVariables) {
  return { query: InnovationFlowSettingsDocument, variables: variables };
}

export const InnovationFlowDetailsDocument = gql`
  query InnovationFlowDetails($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        innovationFlow {
          ...InnovationFlowDetails
        }
      }
    }
  }
  ${InnovationFlowDetailsFragmentDoc}
`;

/**
 * __useInnovationFlowDetailsQuery__
 *
 * To run a query within a React component, call `useInnovationFlowDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowDetailsQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useInnovationFlowDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowDetailsQuery,
    SchemaTypes.InnovationFlowDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationFlowDetailsQuery, SchemaTypes.InnovationFlowDetailsQueryVariables>(
    InnovationFlowDetailsDocument,
    options
  );
}

export function useInnovationFlowDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowDetailsQuery,
    SchemaTypes.InnovationFlowDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationFlowDetailsQuery, SchemaTypes.InnovationFlowDetailsQueryVariables>(
    InnovationFlowDetailsDocument,
    options
  );
}

export type InnovationFlowDetailsQueryHookResult = ReturnType<typeof useInnovationFlowDetailsQuery>;
export type InnovationFlowDetailsLazyQueryHookResult = ReturnType<typeof useInnovationFlowDetailsLazyQuery>;
export type InnovationFlowDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowDetailsQuery,
  SchemaTypes.InnovationFlowDetailsQueryVariables
>;
export function refetchInnovationFlowDetailsQuery(variables: SchemaTypes.InnovationFlowDetailsQueryVariables) {
  return { query: InnovationFlowDetailsDocument, variables: variables };
}

export const UpdateInnovationFlowDocument = gql`
  mutation UpdateInnovationFlow($updateInnovationFlowData: UpdateInnovationFlowInput!) {
    updateInnovationFlow(innovationFlowData: $updateInnovationFlowData) {
      id
    }
  }
`;
export type UpdateInnovationFlowMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowMutation,
  SchemaTypes.UpdateInnovationFlowMutationVariables
>;

/**
 * __useUpdateInnovationFlowMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowMutation, { data, loading, error }] = useUpdateInnovationFlowMutation({
 *   variables: {
 *      updateInnovationFlowData: // value for 'updateInnovationFlowData'
 *   },
 * });
 */
export function useUpdateInnovationFlowMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowMutation,
    SchemaTypes.UpdateInnovationFlowMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowMutation,
    SchemaTypes.UpdateInnovationFlowMutationVariables
  >(UpdateInnovationFlowDocument, options);
}

export type UpdateInnovationFlowMutationHookResult = ReturnType<typeof useUpdateInnovationFlowMutation>;
export type UpdateInnovationFlowMutationResult = Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowMutation>;
export type UpdateInnovationFlowMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowMutation,
  SchemaTypes.UpdateInnovationFlowMutationVariables
>;
export const UpdateCalloutFlowStateDocument = gql`
  mutation UpdateCalloutFlowState($calloutId: UUID!, $flowStateTagsetId: UUID!, $value: String!) {
    updateCallout(
      calloutData: { ID: $calloutId, framing: { profile: { tagsets: [{ ID: $flowStateTagsetId, tags: [$value] }] } } }
    ) {
      id
      sortOrder
      framing {
        id
        profile {
          id
          flowState: tagset(tagsetName: FLOW_STATE) {
            ...TagsetDetails
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdateCalloutFlowStateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutFlowStateMutation,
  SchemaTypes.UpdateCalloutFlowStateMutationVariables
>;

/**
 * __useUpdateCalloutFlowStateMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutFlowStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutFlowStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutFlowStateMutation, { data, loading, error }] = useUpdateCalloutFlowStateMutation({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      flowStateTagsetId: // value for 'flowStateTagsetId'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useUpdateCalloutFlowStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutFlowStateMutation,
    SchemaTypes.UpdateCalloutFlowStateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCalloutFlowStateMutation,
    SchemaTypes.UpdateCalloutFlowStateMutationVariables
  >(UpdateCalloutFlowStateDocument, options);
}

export type UpdateCalloutFlowStateMutationHookResult = ReturnType<typeof useUpdateCalloutFlowStateMutation>;
export type UpdateCalloutFlowStateMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutFlowStateMutation>;
export type UpdateCalloutFlowStateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutFlowStateMutation,
  SchemaTypes.UpdateCalloutFlowStateMutationVariables
>;
export const UpdateInnovationFlowCurrentStateDocument = gql`
  mutation updateInnovationFlowCurrentState($innovationFlowId: UUID!, $currentState: String!) {
    updateInnovationFlowSelectedState(
      innovationFlowStateData: { innovationFlowID: $innovationFlowId, selectedState: $currentState }
    ) {
      id
      currentState {
        displayName
      }
    }
  }
`;
export type UpdateInnovationFlowCurrentStateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowCurrentStateMutation,
  SchemaTypes.UpdateInnovationFlowCurrentStateMutationVariables
>;

/**
 * __useUpdateInnovationFlowCurrentStateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowCurrentStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowCurrentStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowCurrentStateMutation, { data, loading, error }] = useUpdateInnovationFlowCurrentStateMutation({
 *   variables: {
 *      innovationFlowId: // value for 'innovationFlowId'
 *      currentState: // value for 'currentState'
 *   },
 * });
 */
export function useUpdateInnovationFlowCurrentStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowCurrentStateMutation,
    SchemaTypes.UpdateInnovationFlowCurrentStateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowCurrentStateMutation,
    SchemaTypes.UpdateInnovationFlowCurrentStateMutationVariables
  >(UpdateInnovationFlowCurrentStateDocument, options);
}

export type UpdateInnovationFlowCurrentStateMutationHookResult = ReturnType<
  typeof useUpdateInnovationFlowCurrentStateMutation
>;
export type UpdateInnovationFlowCurrentStateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowCurrentStateMutation>;
export type UpdateInnovationFlowCurrentStateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowCurrentStateMutation,
  SchemaTypes.UpdateInnovationFlowCurrentStateMutationVariables
>;
export const UpdateInnovationFlowStatesDocument = gql`
  mutation updateInnovationFlowStates($innovationFlowId: UUID!, $states: [UpdateInnovationFlowStateInput!]!) {
    updateInnovationFlow(innovationFlowData: { innovationFlowID: $innovationFlowId, states: $states }) {
      id
      states {
        displayName
        description
      }
    }
  }
`;
export type UpdateInnovationFlowStatesMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowStatesMutation,
  SchemaTypes.UpdateInnovationFlowStatesMutationVariables
>;

/**
 * __useUpdateInnovationFlowStatesMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowStatesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowStatesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowStatesMutation, { data, loading, error }] = useUpdateInnovationFlowStatesMutation({
 *   variables: {
 *      innovationFlowId: // value for 'innovationFlowId'
 *      states: // value for 'states'
 *   },
 * });
 */
export function useUpdateInnovationFlowStatesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowStatesMutation,
    SchemaTypes.UpdateInnovationFlowStatesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowStatesMutation,
    SchemaTypes.UpdateInnovationFlowStatesMutationVariables
  >(UpdateInnovationFlowStatesDocument, options);
}

export type UpdateInnovationFlowStatesMutationHookResult = ReturnType<typeof useUpdateInnovationFlowStatesMutation>;
export type UpdateInnovationFlowStatesMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowStatesMutation>;
export type UpdateInnovationFlowStatesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowStatesMutation,
  SchemaTypes.UpdateInnovationFlowStatesMutationVariables
>;
export const UpdateInnovationFlowStatesFromTemplateDocument = gql`
  mutation UpdateInnovationFlowStatesFromTemplate($innovationFlowId: UUID!, $innovationFlowTemplateId: UUID!) {
    updateInnovationFlowStatesFromTemplate(
      innovationFlowData: { innovationFlowID: $innovationFlowId, innovationFlowTemplateID: $innovationFlowTemplateId }
    ) {
      id
      states {
        displayName
        description
      }
      currentState {
        displayName
        description
      }
    }
  }
`;
export type UpdateInnovationFlowStatesFromTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutation,
  SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutationVariables
>;

/**
 * __useUpdateInnovationFlowStatesFromTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowStatesFromTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowStatesFromTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowStatesFromTemplateMutation, { data, loading, error }] = useUpdateInnovationFlowStatesFromTemplateMutation({
 *   variables: {
 *      innovationFlowId: // value for 'innovationFlowId'
 *      innovationFlowTemplateId: // value for 'innovationFlowTemplateId'
 *   },
 * });
 */
export function useUpdateInnovationFlowStatesFromTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutation,
    SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutation,
    SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutationVariables
  >(UpdateInnovationFlowStatesFromTemplateDocument, options);
}

export type UpdateInnovationFlowStatesFromTemplateMutationHookResult = ReturnType<
  typeof useUpdateInnovationFlowStatesFromTemplateMutation
>;
export type UpdateInnovationFlowStatesFromTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutation>;
export type UpdateInnovationFlowStatesFromTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutation,
  SchemaTypes.UpdateInnovationFlowStatesFromTemplateMutationVariables
>;
export const UpdateInnovationFlowSingleStateDocument = gql`
  mutation updateInnovationFlowSingleState(
    $innovationFlowId: UUID!
    $stateName: String!
    $stateUpdatedData: UpdateInnovationFlowStateInput!
  ) {
    updateInnovationFlowSingleState(
      innovationFlowStateData: {
        innovationFlowID: $innovationFlowId
        stateDisplayName: $stateName
        stateUpdatedData: $stateUpdatedData
      }
    ) {
      id
      states {
        displayName
        description
      }
      currentState {
        displayName
        description
      }
    }
  }
`;
export type UpdateInnovationFlowSingleStateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowSingleStateMutation,
  SchemaTypes.UpdateInnovationFlowSingleStateMutationVariables
>;

/**
 * __useUpdateInnovationFlowSingleStateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowSingleStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowSingleStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowSingleStateMutation, { data, loading, error }] = useUpdateInnovationFlowSingleStateMutation({
 *   variables: {
 *      innovationFlowId: // value for 'innovationFlowId'
 *      stateName: // value for 'stateName'
 *      stateUpdatedData: // value for 'stateUpdatedData'
 *   },
 * });
 */
export function useUpdateInnovationFlowSingleStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowSingleStateMutation,
    SchemaTypes.UpdateInnovationFlowSingleStateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowSingleStateMutation,
    SchemaTypes.UpdateInnovationFlowSingleStateMutationVariables
  >(UpdateInnovationFlowSingleStateDocument, options);
}

export type UpdateInnovationFlowSingleStateMutationHookResult = ReturnType<
  typeof useUpdateInnovationFlowSingleStateMutation
>;
export type UpdateInnovationFlowSingleStateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowSingleStateMutation>;
export type UpdateInnovationFlowSingleStateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowSingleStateMutation,
  SchemaTypes.UpdateInnovationFlowSingleStateMutationVariables
>;
export const SpaceInnovationFlowsDocument = gql`
  query SpaceInnovationFlows($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      account {
        id
        library {
          id
          innovationFlowTemplates {
            id
            profile {
              id
              displayName
            }
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceInnovationFlowsQuery__
 *
 * To run a query within a React component, call `useSpaceInnovationFlowsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceInnovationFlowsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceInnovationFlowsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceInnovationFlowsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceInnovationFlowsQuery,
    SchemaTypes.SpaceInnovationFlowsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceInnovationFlowsQuery, SchemaTypes.SpaceInnovationFlowsQueryVariables>(
    SpaceInnovationFlowsDocument,
    options
  );
}

export function useSpaceInnovationFlowsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceInnovationFlowsQuery,
    SchemaTypes.SpaceInnovationFlowsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceInnovationFlowsQuery, SchemaTypes.SpaceInnovationFlowsQueryVariables>(
    SpaceInnovationFlowsDocument,
    options
  );
}

export type SpaceInnovationFlowsQueryHookResult = ReturnType<typeof useSpaceInnovationFlowsQuery>;
export type SpaceInnovationFlowsLazyQueryHookResult = ReturnType<typeof useSpaceInnovationFlowsLazyQuery>;
export type SpaceInnovationFlowsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceInnovationFlowsQuery,
  SchemaTypes.SpaceInnovationFlowsQueryVariables
>;
export function refetchSpaceInnovationFlowsQuery(variables: SchemaTypes.SpaceInnovationFlowsQueryVariables) {
  return { query: SpaceInnovationFlowsDocument, variables: variables };
}

export const SpaceInnovationFlowTemplatesLibraryDocument = gql`
  query SpaceInnovationFlowTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          innovationFlowTemplates {
            ...InnovationFlowTemplateCard
          }
        }
        host {
          id
          nameID
          profile {
            ...TemplateProviderProfile
          }
        }
      }
    }
  }
  ${InnovationFlowTemplateCardFragmentDoc}
  ${TemplateProviderProfileFragmentDoc}
`;

/**
 * __useSpaceInnovationFlowTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useSpaceInnovationFlowTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceInnovationFlowTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceInnovationFlowTemplatesLibraryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceInnovationFlowTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
  >(SpaceInnovationFlowTemplatesLibraryDocument, options);
}

export function useSpaceInnovationFlowTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
  >(SpaceInnovationFlowTemplatesLibraryDocument, options);
}

export type SpaceInnovationFlowTemplatesLibraryQueryHookResult = ReturnType<
  typeof useSpaceInnovationFlowTemplatesLibraryQuery
>;
export type SpaceInnovationFlowTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof useSpaceInnovationFlowTemplatesLibraryLazyQuery
>;
export type SpaceInnovationFlowTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceInnovationFlowTemplatesLibraryQuery,
  SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
>;
export function refetchSpaceInnovationFlowTemplatesLibraryQuery(
  variables: SchemaTypes.SpaceInnovationFlowTemplatesLibraryQueryVariables
) {
  return { query: SpaceInnovationFlowTemplatesLibraryDocument, variables: variables };
}

export const PlatformInnovationFlowTemplatesLibraryDocument = gql`
  query PlatformInnovationFlowTemplatesLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          profile {
            id
            displayName
          }
          provider {
            id
            nameID
            profile {
              ...TemplateProviderProfile
            }
          }
          templates {
            id
            innovationFlowTemplates {
              ...InnovationFlowTemplateCard
            }
          }
        }
      }
    }
  }
  ${TemplateProviderProfileFragmentDoc}
  ${InnovationFlowTemplateCardFragmentDoc}
`;

/**
 * __usePlatformInnovationFlowTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `usePlatformInnovationFlowTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformInnovationFlowTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformInnovationFlowTemplatesLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformInnovationFlowTemplatesLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
  >(PlatformInnovationFlowTemplatesLibraryDocument, options);
}

export function usePlatformInnovationFlowTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQuery,
    SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
  >(PlatformInnovationFlowTemplatesLibraryDocument, options);
}

export type PlatformInnovationFlowTemplatesLibraryQueryHookResult = ReturnType<
  typeof usePlatformInnovationFlowTemplatesLibraryQuery
>;
export type PlatformInnovationFlowTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof usePlatformInnovationFlowTemplatesLibraryLazyQuery
>;
export type PlatformInnovationFlowTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformInnovationFlowTemplatesLibraryQuery,
  SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
>;
export function refetchPlatformInnovationFlowTemplatesLibraryQuery(
  variables?: SchemaTypes.PlatformInnovationFlowTemplatesLibraryQueryVariables
) {
  return { query: PlatformInnovationFlowTemplatesLibraryDocument, variables: variables };
}

export const InnovationFlowTemplateStatesDocument = gql`
  query InnovationFlowTemplateStates($innovationFlowTemplateId: UUID!) {
    lookup {
      innovationFlowTemplate(ID: $innovationFlowTemplateId) {
        ...InnovationFlowTemplateCard
      }
    }
  }
  ${InnovationFlowTemplateCardFragmentDoc}
`;

/**
 * __useInnovationFlowTemplateStatesQuery__
 *
 * To run a query within a React component, call `useInnovationFlowTemplateStatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowTemplateStatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowTemplateStatesQuery({
 *   variables: {
 *      innovationFlowTemplateId: // value for 'innovationFlowTemplateId'
 *   },
 * });
 */
export function useInnovationFlowTemplateStatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowTemplateStatesQuery,
    SchemaTypes.InnovationFlowTemplateStatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationFlowTemplateStatesQuery,
    SchemaTypes.InnovationFlowTemplateStatesQueryVariables
  >(InnovationFlowTemplateStatesDocument, options);
}

export function useInnovationFlowTemplateStatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowTemplateStatesQuery,
    SchemaTypes.InnovationFlowTemplateStatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationFlowTemplateStatesQuery,
    SchemaTypes.InnovationFlowTemplateStatesQueryVariables
  >(InnovationFlowTemplateStatesDocument, options);
}

export type InnovationFlowTemplateStatesQueryHookResult = ReturnType<typeof useInnovationFlowTemplateStatesQuery>;
export type InnovationFlowTemplateStatesLazyQueryHookResult = ReturnType<
  typeof useInnovationFlowTemplateStatesLazyQuery
>;
export type InnovationFlowTemplateStatesQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowTemplateStatesQuery,
  SchemaTypes.InnovationFlowTemplateStatesQueryVariables
>;
export function refetchInnovationFlowTemplateStatesQuery(
  variables: SchemaTypes.InnovationFlowTemplateStatesQueryVariables
) {
  return { query: InnovationFlowTemplateStatesDocument, variables: variables };
}

export const InnovationPackProfilePageDocument = gql`
  query InnovationPackProfilePage($innovationPackId: UUID_NAMEID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          id
          nameID
          authorization {
            id
            myPrivileges
          }
          provider {
            ...InnovationPackProviderProfileWithAvatar
          }
          profile {
            ...InnovationPackProfile
            tagline
          }
          templates {
            id
            whiteboardTemplates {
              ...WhiteboardTemplateCard
            }
            postTemplates {
              ...PostTemplateCard
            }
            innovationFlowTemplates {
              ...InnovationFlowTemplateCard
            }
          }
        }
      }
    }
  }
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
  ${InnovationPackProfileFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
  ${PostTemplateCardFragmentDoc}
  ${InnovationFlowTemplateCardFragmentDoc}
`;

/**
 * __useInnovationPackProfilePageQuery__
 *
 * To run a query within a React component, call `useInnovationPackProfilePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationPackProfilePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationPackProfilePageQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *   },
 * });
 */
export function useInnovationPackProfilePageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationPackProfilePageQuery,
    SchemaTypes.InnovationPackProfilePageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationPackProfilePageQuery,
    SchemaTypes.InnovationPackProfilePageQueryVariables
  >(InnovationPackProfilePageDocument, options);
}

export function useInnovationPackProfilePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationPackProfilePageQuery,
    SchemaTypes.InnovationPackProfilePageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationPackProfilePageQuery,
    SchemaTypes.InnovationPackProfilePageQueryVariables
  >(InnovationPackProfilePageDocument, options);
}

export type InnovationPackProfilePageQueryHookResult = ReturnType<typeof useInnovationPackProfilePageQuery>;
export type InnovationPackProfilePageLazyQueryHookResult = ReturnType<typeof useInnovationPackProfilePageLazyQuery>;
export type InnovationPackProfilePageQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPackProfilePageQuery,
  SchemaTypes.InnovationPackProfilePageQueryVariables
>;
export function refetchInnovationPackProfilePageQuery(variables: SchemaTypes.InnovationPackProfilePageQueryVariables) {
  return { query: InnovationPackProfilePageDocument, variables: variables };
}

export const ActivityCreatedDocument = gql`
  subscription activityCreated($input: ActivityCreatedSubscriptionInput!) {
    activityCreated(input: $input) {
      activity {
        ...ActivityLogOnCollaboration
      }
    }
  }
  ${ActivityLogOnCollaborationFragmentDoc}
`;

/**
 * __useActivityCreatedSubscription__
 *
 * To run a query within a React component, call `useActivityCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useActivityCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityCreatedSubscription({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useActivityCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.ActivityCreatedSubscription,
    SchemaTypes.ActivityCreatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.ActivityCreatedSubscription,
    SchemaTypes.ActivityCreatedSubscriptionVariables
  >(ActivityCreatedDocument, options);
}

export type ActivityCreatedSubscriptionHookResult = ReturnType<typeof useActivityCreatedSubscription>;
export type ActivityCreatedSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.ActivityCreatedSubscription>;
export const ActivityLogOnCollaborationDocument = gql`
  query activityLogOnCollaboration($collaborationID: UUID!, $limit: Float!, $types: [ActivityEventType!]) {
    activityLogOnCollaboration(
      queryData: { collaborationID: $collaborationID, limit: $limit, types: $types, includeChild: true }
    ) {
      id
      collaborationID
      createdDate
      description
      type
      child
      parentNameID
      journeyDisplayName: parentDisplayName
      journey {
        id
        ... on Space {
          profile {
            ...RecentContributionsSpaceProfile
          }
        }
        ... on RelayPaginatedSpace {
          profile {
            ...RecentContributionsSpaceProfile
          }
        }
        ... on Challenge {
          profile {
            ...RecentContributionsChildJourneyProfile
          }
        }
        ... on Opportunity {
          profile {
            ...RecentContributionsChildJourneyProfile
          }
        }
      }
      triggeredBy {
        id
        profile {
          id
          displayName
          avatar: visual(type: AVATAR) {
            id
            uri
          }
        }
      }
      ... on ActivityLogEntryMemberJoined {
        ...ActivityLogMemberJoined
      }
      ... on ActivityLogEntryCalloutPublished {
        ...ActivityLogCalloutPublished
      }
      ... on ActivityLogEntryCalloutPostCreated {
        ...ActivityLogCalloutPostCreated
      }
      ... on ActivityLogEntryCalloutLinkCreated {
        ...ActivityLogCalloutLinkCreated
      }
      ... on ActivityLogEntryCalloutPostComment {
        ...ActivityLogCalloutPostComment
      }
      ... on ActivityLogEntryCalloutWhiteboardCreated {
        ...ActivityLogCalloutWhiteboardCreated
      }
      ... on ActivityLogEntryCalloutWhiteboardContentModified {
        ...ActivityLogCalloutWhiteboardContentModified
      }
      ... on ActivityLogEntryCalloutDiscussionComment {
        ...ActivityLogCalloutDiscussionComment
      }
      ... on ActivityLogEntryChallengeCreated {
        ...ActivityLogChallengeCreated
      }
      ... on ActivityLogEntryOpportunityCreated {
        ...ActivityLogOpportunityCreated
      }
      ... on ActivityLogEntryUpdateSent {
        ...ActivityLogUpdateSent
      }
      ... on ActivityLogEntryCalendarEventCreated {
        ...ActivityLogCalendarEventCreated
      }
    }
  }
  ${RecentContributionsSpaceProfileFragmentDoc}
  ${RecentContributionsChildJourneyProfileFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
  ${ActivityLogCalendarEventCreatedFragmentDoc}
`;

/**
 * __useActivityLogOnCollaborationQuery__
 *
 * To run a query within a React component, call `useActivityLogOnCollaborationQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityLogOnCollaborationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityLogOnCollaborationQuery({
 *   variables: {
 *      collaborationID: // value for 'collaborationID'
 *      limit: // value for 'limit'
 *      types: // value for 'types'
 *   },
 * });
 */
export function useActivityLogOnCollaborationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ActivityLogOnCollaborationQuery,
    SchemaTypes.ActivityLogOnCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ActivityLogOnCollaborationQuery,
    SchemaTypes.ActivityLogOnCollaborationQueryVariables
  >(ActivityLogOnCollaborationDocument, options);
}

export function useActivityLogOnCollaborationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ActivityLogOnCollaborationQuery,
    SchemaTypes.ActivityLogOnCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ActivityLogOnCollaborationQuery,
    SchemaTypes.ActivityLogOnCollaborationQueryVariables
  >(ActivityLogOnCollaborationDocument, options);
}

export type ActivityLogOnCollaborationQueryHookResult = ReturnType<typeof useActivityLogOnCollaborationQuery>;
export type ActivityLogOnCollaborationLazyQueryHookResult = ReturnType<typeof useActivityLogOnCollaborationLazyQuery>;
export type ActivityLogOnCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.ActivityLogOnCollaborationQuery,
  SchemaTypes.ActivityLogOnCollaborationQueryVariables
>;
export function refetchActivityLogOnCollaborationQuery(
  variables: SchemaTypes.ActivityLogOnCollaborationQueryVariables
) {
  return { query: ActivityLogOnCollaborationDocument, variables: variables };
}

export const CollaborationAuthorizationDocument = gql`
  query CollaborationAuthorization(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      authorization {
        id
        myPrivileges
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        authorization {
          id
          myPrivileges
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
`;

/**
 * __useCollaborationAuthorizationQuery__
 *
 * To run a query within a React component, call `useCollaborationAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollaborationAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollaborationAuthorizationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useCollaborationAuthorizationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CollaborationAuthorizationQuery,
    SchemaTypes.CollaborationAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CollaborationAuthorizationQuery,
    SchemaTypes.CollaborationAuthorizationQueryVariables
  >(CollaborationAuthorizationDocument, options);
}

export function useCollaborationAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CollaborationAuthorizationQuery,
    SchemaTypes.CollaborationAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CollaborationAuthorizationQuery,
    SchemaTypes.CollaborationAuthorizationQueryVariables
  >(CollaborationAuthorizationDocument, options);
}

export type CollaborationAuthorizationQueryHookResult = ReturnType<typeof useCollaborationAuthorizationQuery>;
export type CollaborationAuthorizationLazyQueryHookResult = ReturnType<typeof useCollaborationAuthorizationLazyQuery>;
export type CollaborationAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.CollaborationAuthorizationQuery,
  SchemaTypes.CollaborationAuthorizationQueryVariables
>;
export function refetchCollaborationAuthorizationQuery(
  variables?: SchemaTypes.CollaborationAuthorizationQueryVariables
) {
  return { query: CollaborationAuthorizationDocument, variables: variables };
}

export const CollaborationPrivilegesDocument = gql`
  query CollaborationPrivileges(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      collaboration {
        ...CollaborationPrivileges
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        collaboration {
          ...CollaborationPrivileges
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        collaboration {
          ...CollaborationPrivileges
        }
      }
    }
  }
  ${CollaborationPrivilegesFragmentDoc}
`;

/**
 * __useCollaborationPrivilegesQuery__
 *
 * To run a query within a React component, call `useCollaborationPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollaborationPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollaborationPrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useCollaborationPrivilegesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CollaborationPrivilegesQuery,
    SchemaTypes.CollaborationPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CollaborationPrivilegesQuery, SchemaTypes.CollaborationPrivilegesQueryVariables>(
    CollaborationPrivilegesDocument,
    options
  );
}

export function useCollaborationPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CollaborationPrivilegesQuery,
    SchemaTypes.CollaborationPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CollaborationPrivilegesQuery,
    SchemaTypes.CollaborationPrivilegesQueryVariables
  >(CollaborationPrivilegesDocument, options);
}

export type CollaborationPrivilegesQueryHookResult = ReturnType<typeof useCollaborationPrivilegesQuery>;
export type CollaborationPrivilegesLazyQueryHookResult = ReturnType<typeof useCollaborationPrivilegesLazyQuery>;
export type CollaborationPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.CollaborationPrivilegesQuery,
  SchemaTypes.CollaborationPrivilegesQueryVariables
>;
export function refetchCollaborationPrivilegesQuery(variables?: SchemaTypes.CollaborationPrivilegesQueryVariables) {
  return { query: CollaborationPrivilegesDocument, variables: variables };
}

export const SpaceCalloutTemplatesLibraryDocument = gql`
  query SpaceCalloutTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          calloutTemplates {
            ...CalloutTemplateCard
          }
        }
        host {
          id
          nameID
          profile {
            ...TemplateProviderProfile
          }
        }
      }
    }
  }
  ${CalloutTemplateCardFragmentDoc}
  ${TemplateProviderProfileFragmentDoc}
`;

/**
 * __useSpaceCalloutTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useSpaceCalloutTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCalloutTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCalloutTemplatesLibraryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCalloutTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCalloutTemplatesLibraryQuery,
    SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCalloutTemplatesLibraryQuery,
    SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
  >(SpaceCalloutTemplatesLibraryDocument, options);
}

export function useSpaceCalloutTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCalloutTemplatesLibraryQuery,
    SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCalloutTemplatesLibraryQuery,
    SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
  >(SpaceCalloutTemplatesLibraryDocument, options);
}

export type SpaceCalloutTemplatesLibraryQueryHookResult = ReturnType<typeof useSpaceCalloutTemplatesLibraryQuery>;
export type SpaceCalloutTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof useSpaceCalloutTemplatesLibraryLazyQuery
>;
export type SpaceCalloutTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCalloutTemplatesLibraryQuery,
  SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
>;
export function refetchSpaceCalloutTemplatesLibraryQuery(
  variables: SchemaTypes.SpaceCalloutTemplatesLibraryQueryVariables
) {
  return { query: SpaceCalloutTemplatesLibraryDocument, variables: variables };
}

export const PlatformCalloutTemplatesLibraryDocument = gql`
  query PlatformCalloutTemplatesLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          profile {
            id
            displayName
          }
          provider {
            id
            nameID
            profile {
              ...TemplateProviderProfile
            }
          }
          templates {
            id
            calloutTemplates {
              ...CalloutTemplateCard
            }
          }
        }
      }
    }
  }
  ${TemplateProviderProfileFragmentDoc}
  ${CalloutTemplateCardFragmentDoc}
`;

/**
 * __usePlatformCalloutTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `usePlatformCalloutTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformCalloutTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformCalloutTemplatesLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformCalloutTemplatesLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformCalloutTemplatesLibraryQuery,
    SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformCalloutTemplatesLibraryQuery,
    SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
  >(PlatformCalloutTemplatesLibraryDocument, options);
}

export function usePlatformCalloutTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformCalloutTemplatesLibraryQuery,
    SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformCalloutTemplatesLibraryQuery,
    SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
  >(PlatformCalloutTemplatesLibraryDocument, options);
}

export type PlatformCalloutTemplatesLibraryQueryHookResult = ReturnType<typeof usePlatformCalloutTemplatesLibraryQuery>;
export type PlatformCalloutTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof usePlatformCalloutTemplatesLibraryLazyQuery
>;
export type PlatformCalloutTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformCalloutTemplatesLibraryQuery,
  SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
>;
export function refetchPlatformCalloutTemplatesLibraryQuery(
  variables?: SchemaTypes.PlatformCalloutTemplatesLibraryQueryVariables
) {
  return { query: PlatformCalloutTemplatesLibraryDocument, variables: variables };
}

export const CalloutTemplateContentDocument = gql`
  query CalloutTemplateContent($calloutTemplateId: UUID!) {
    lookup {
      calloutTemplate(ID: $calloutTemplateId) {
        id
        type
        profile {
          ...TemplateCardProfileInfo
        }
        framing {
          id
          profile {
            id
            displayName
            description
            tagset {
              ...TagsetDetails
            }
            tagsets {
              ...TagsetDetails
            }
            storageBucket {
              id
            }
            references {
              ...ReferenceDetails
            }
          }
          whiteboard {
            ...WhiteboardDetails
            ...WhiteboardContent
          }
        }
        contributionPolicy {
          state
        }
        contributionDefaults {
          id
          postDescription
          whiteboardContent
        }
      }
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${WhiteboardContentFragmentDoc}
`;

/**
 * __useCalloutTemplateContentQuery__
 *
 * To run a query within a React component, call `useCalloutTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutTemplateContentQuery({
 *   variables: {
 *      calloutTemplateId: // value for 'calloutTemplateId'
 *   },
 * });
 */
export function useCalloutTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutTemplateContentQuery,
    SchemaTypes.CalloutTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutTemplateContentQuery, SchemaTypes.CalloutTemplateContentQueryVariables>(
    CalloutTemplateContentDocument,
    options
  );
}

export function useCalloutTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutTemplateContentQuery,
    SchemaTypes.CalloutTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutTemplateContentQuery, SchemaTypes.CalloutTemplateContentQueryVariables>(
    CalloutTemplateContentDocument,
    options
  );
}

export type CalloutTemplateContentQueryHookResult = ReturnType<typeof useCalloutTemplateContentQuery>;
export type CalloutTemplateContentLazyQueryHookResult = ReturnType<typeof useCalloutTemplateContentLazyQuery>;
export type CalloutTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutTemplateContentQuery,
  SchemaTypes.CalloutTemplateContentQueryVariables
>;
export function refetchCalloutTemplateContentQuery(variables: SchemaTypes.CalloutTemplateContentQueryVariables) {
  return { query: CalloutTemplateContentDocument, variables: variables };
}

export const UpdateCalloutsSortOrderDocument = gql`
  mutation UpdateCalloutsSortOrder($collaborationId: UUID!, $calloutIds: [UUID_NAMEID!]!) {
    updateCalloutsSortOrder(sortOrderData: { collaborationID: $collaborationId, calloutIDs: $calloutIds }) {
      id
      sortOrder
    }
  }
`;
export type UpdateCalloutsSortOrderMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutsSortOrderMutation,
  SchemaTypes.UpdateCalloutsSortOrderMutationVariables
>;

/**
 * __useUpdateCalloutsSortOrderMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutsSortOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutsSortOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutsSortOrderMutation, { data, loading, error }] = useUpdateCalloutsSortOrderMutation({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *      calloutIds: // value for 'calloutIds'
 *   },
 * });
 */
export function useUpdateCalloutsSortOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutsSortOrderMutation,
    SchemaTypes.UpdateCalloutsSortOrderMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCalloutsSortOrderMutation,
    SchemaTypes.UpdateCalloutsSortOrderMutationVariables
  >(UpdateCalloutsSortOrderDocument, options);
}

export type UpdateCalloutsSortOrderMutationHookResult = ReturnType<typeof useUpdateCalloutsSortOrderMutation>;
export type UpdateCalloutsSortOrderMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutsSortOrderMutation>;
export type UpdateCalloutsSortOrderMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutsSortOrderMutation,
  SchemaTypes.UpdateCalloutsSortOrderMutationVariables
>;
export const PostTemplatesOnCalloutCreationDocument = gql`
  query PostTemplatesOnCalloutCreation($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          postTemplates {
            id
            profile {
              ...ProfileDisplayName
            }
          }
        }
      }
    }
  }
  ${ProfileDisplayNameFragmentDoc}
`;

/**
 * __usePostTemplatesOnCalloutCreationQuery__
 *
 * To run a query within a React component, call `usePostTemplatesOnCalloutCreationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostTemplatesOnCalloutCreationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostTemplatesOnCalloutCreationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function usePostTemplatesOnCalloutCreationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PostTemplatesOnCalloutCreationQuery,
    SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PostTemplatesOnCalloutCreationQuery,
    SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
  >(PostTemplatesOnCalloutCreationDocument, options);
}

export function usePostTemplatesOnCalloutCreationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PostTemplatesOnCalloutCreationQuery,
    SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PostTemplatesOnCalloutCreationQuery,
    SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
  >(PostTemplatesOnCalloutCreationDocument, options);
}

export type PostTemplatesOnCalloutCreationQueryHookResult = ReturnType<typeof usePostTemplatesOnCalloutCreationQuery>;
export type PostTemplatesOnCalloutCreationLazyQueryHookResult = ReturnType<
  typeof usePostTemplatesOnCalloutCreationLazyQuery
>;
export type PostTemplatesOnCalloutCreationQueryResult = Apollo.QueryResult<
  SchemaTypes.PostTemplatesOnCalloutCreationQuery,
  SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
>;
export function refetchPostTemplatesOnCalloutCreationQuery(
  variables: SchemaTypes.PostTemplatesOnCalloutCreationQueryVariables
) {
  return { query: PostTemplatesOnCalloutCreationDocument, variables: variables };
}

export const WhiteboardTemplatesOnCalloutCreationDocument = gql`
  query WhiteboardTemplatesOnCalloutCreation($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          whiteboardTemplates {
            id
            profile {
              ...ProfileDisplayName
            }
          }
        }
      }
    }
  }
  ${ProfileDisplayNameFragmentDoc}
`;

/**
 * __useWhiteboardTemplatesOnCalloutCreationQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplatesOnCalloutCreationQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplatesOnCalloutCreationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplatesOnCalloutCreationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useWhiteboardTemplatesOnCalloutCreationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQuery,
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQuery,
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
  >(WhiteboardTemplatesOnCalloutCreationDocument, options);
}

export function useWhiteboardTemplatesOnCalloutCreationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQuery,
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQuery,
    SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
  >(WhiteboardTemplatesOnCalloutCreationDocument, options);
}

export type WhiteboardTemplatesOnCalloutCreationQueryHookResult = ReturnType<
  typeof useWhiteboardTemplatesOnCalloutCreationQuery
>;
export type WhiteboardTemplatesOnCalloutCreationLazyQueryHookResult = ReturnType<
  typeof useWhiteboardTemplatesOnCalloutCreationLazyQuery
>;
export type WhiteboardTemplatesOnCalloutCreationQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplatesOnCalloutCreationQuery,
  SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
>;
export function refetchWhiteboardTemplatesOnCalloutCreationQuery(
  variables: SchemaTypes.WhiteboardTemplatesOnCalloutCreationQueryVariables
) {
  return { query: WhiteboardTemplatesOnCalloutCreationDocument, variables: variables };
}

export const CreateCalloutDocument = gql`
  mutation createCallout($calloutData: CreateCalloutOnCollaborationInput!) {
    createCalloutOnCollaboration(calloutData: $calloutData) {
      ...CalloutDetails
    }
  }
  ${CalloutDetailsFragmentDoc}
`;
export type CreateCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateCalloutMutation,
  SchemaTypes.CreateCalloutMutationVariables
>;

/**
 * __useCreateCalloutMutation__
 *
 * To run a mutation, you first call `useCreateCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCalloutMutation, { data, loading, error }] = useCreateCalloutMutation({
 *   variables: {
 *      calloutData: // value for 'calloutData'
 *   },
 * });
 */
export function useCreateCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateCalloutMutation,
    SchemaTypes.CreateCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateCalloutMutation, SchemaTypes.CreateCalloutMutationVariables>(
    CreateCalloutDocument,
    options
  );
}

export type CreateCalloutMutationHookResult = ReturnType<typeof useCreateCalloutMutation>;
export type CreateCalloutMutationResult = Apollo.MutationResult<SchemaTypes.CreateCalloutMutation>;
export type CreateCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateCalloutMutation,
  SchemaTypes.CreateCalloutMutationVariables
>;
export const UpdateCalloutDocument = gql`
  mutation UpdateCallout($calloutData: UpdateCalloutInput!) {
    updateCallout(calloutData: $calloutData) {
      id
      framing {
        id
        profile {
          id
          description
          displayName
          tagset {
            ...TagsetDetails
          }
          groupNameTagset: tagset(tagsetName: CALLOUT_GROUP) {
            ...TagsetDetails
          }
          references {
            id
            name
            uri
          }
        }
      }
      contributionDefaults {
        id
        postDescription
        whiteboardContent
      }
      contributionPolicy {
        id
        state
      }
      type
      visibility
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdateCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutMutation,
  SchemaTypes.UpdateCalloutMutationVariables
>;

/**
 * __useUpdateCalloutMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutMutation, { data, loading, error }] = useUpdateCalloutMutation({
 *   variables: {
 *      calloutData: // value for 'calloutData'
 *   },
 * });
 */
export function useUpdateCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutMutation,
    SchemaTypes.UpdateCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateCalloutMutation, SchemaTypes.UpdateCalloutMutationVariables>(
    UpdateCalloutDocument,
    options
  );
}

export type UpdateCalloutMutationHookResult = ReturnType<typeof useUpdateCalloutMutation>;
export type UpdateCalloutMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutMutation>;
export type UpdateCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutMutation,
  SchemaTypes.UpdateCalloutMutationVariables
>;
export const UpdateCalloutVisibilityDocument = gql`
  mutation UpdateCalloutVisibility($calloutData: UpdateCalloutVisibilityInput!) {
    updateCalloutVisibility(calloutData: $calloutData) {
      ...CalloutDetails
    }
  }
  ${CalloutDetailsFragmentDoc}
`;
export type UpdateCalloutVisibilityMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutVisibilityMutation,
  SchemaTypes.UpdateCalloutVisibilityMutationVariables
>;

/**
 * __useUpdateCalloutVisibilityMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutVisibilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutVisibilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutVisibilityMutation, { data, loading, error }] = useUpdateCalloutVisibilityMutation({
 *   variables: {
 *      calloutData: // value for 'calloutData'
 *   },
 * });
 */
export function useUpdateCalloutVisibilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutVisibilityMutation,
    SchemaTypes.UpdateCalloutVisibilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCalloutVisibilityMutation,
    SchemaTypes.UpdateCalloutVisibilityMutationVariables
  >(UpdateCalloutVisibilityDocument, options);
}

export type UpdateCalloutVisibilityMutationHookResult = ReturnType<typeof useUpdateCalloutVisibilityMutation>;
export type UpdateCalloutVisibilityMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutVisibilityMutation>;
export type UpdateCalloutVisibilityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutVisibilityMutation,
  SchemaTypes.UpdateCalloutVisibilityMutationVariables
>;
export const DeleteCalloutDocument = gql`
  mutation DeleteCallout($calloutId: UUID!) {
    deleteCallout(deleteData: { ID: $calloutId }) {
      id
    }
  }
`;
export type DeleteCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCalloutMutation,
  SchemaTypes.DeleteCalloutMutationVariables
>;

/**
 * __useDeleteCalloutMutation__
 *
 * To run a mutation, you first call `useDeleteCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCalloutMutation, { data, loading, error }] = useDeleteCalloutMutation({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useDeleteCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteCalloutMutation,
    SchemaTypes.DeleteCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteCalloutMutation, SchemaTypes.DeleteCalloutMutationVariables>(
    DeleteCalloutDocument,
    options
  );
}

export type DeleteCalloutMutationHookResult = ReturnType<typeof useDeleteCalloutMutation>;
export type DeleteCalloutMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCalloutMutation>;
export type DeleteCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCalloutMutation,
  SchemaTypes.DeleteCalloutMutationVariables
>;
export const CalloutIdDocument = gql`
  query CalloutId(
    $calloutNameId: UUID_NAMEID!
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $isSpace: Boolean = false
    $isChallenge: Boolean = false
    $isOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $isSpace) {
      id
      collaboration {
        id
        callouts(IDs: [$calloutNameId]) {
          id
        }
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $isChallenge) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            id
          }
        }
      }
      opportunity(ID: $opportunityId) @include(if: $isOpportunity) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useCalloutIdQuery__
 *
 * To run a query within a React component, call `useCalloutIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutIdQuery({
 *   variables: {
 *      calloutNameId: // value for 'calloutNameId'
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      isSpace: // value for 'isSpace'
 *      isChallenge: // value for 'isChallenge'
 *      isOpportunity: // value for 'isOpportunity'
 *   },
 * });
 */
export function useCalloutIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutIdQuery, SchemaTypes.CalloutIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutIdQuery, SchemaTypes.CalloutIdQueryVariables>(CalloutIdDocument, options);
}

export function useCalloutIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutIdQuery, SchemaTypes.CalloutIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutIdQuery, SchemaTypes.CalloutIdQueryVariables>(
    CalloutIdDocument,
    options
  );
}

export type CalloutIdQueryHookResult = ReturnType<typeof useCalloutIdQuery>;
export type CalloutIdLazyQueryHookResult = ReturnType<typeof useCalloutIdLazyQuery>;
export type CalloutIdQueryResult = Apollo.QueryResult<SchemaTypes.CalloutIdQuery, SchemaTypes.CalloutIdQueryVariables>;
export function refetchCalloutIdQuery(variables: SchemaTypes.CalloutIdQueryVariables) {
  return { query: CalloutIdDocument, variables: variables };
}

export const CreatePostFromContributeTabDocument = gql`
  mutation CreatePostFromContributeTab($postData: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $postData) {
      post {
        id
        nameID
        type
        profile {
          id
          displayName
          description
          tagset {
            ...TagsetDetails
          }
          visual(type: CARD) {
            ...VisualUri
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export type CreatePostFromContributeTabMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreatePostFromContributeTabMutation,
  SchemaTypes.CreatePostFromContributeTabMutationVariables
>;

/**
 * __useCreatePostFromContributeTabMutation__
 *
 * To run a mutation, you first call `useCreatePostFromContributeTabMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostFromContributeTabMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostFromContributeTabMutation, { data, loading, error }] = useCreatePostFromContributeTabMutation({
 *   variables: {
 *      postData: // value for 'postData'
 *   },
 * });
 */
export function useCreatePostFromContributeTabMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreatePostFromContributeTabMutation,
    SchemaTypes.CreatePostFromContributeTabMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreatePostFromContributeTabMutation,
    SchemaTypes.CreatePostFromContributeTabMutationVariables
  >(CreatePostFromContributeTabDocument, options);
}

export type CreatePostFromContributeTabMutationHookResult = ReturnType<typeof useCreatePostFromContributeTabMutation>;
export type CreatePostFromContributeTabMutationResult =
  Apollo.MutationResult<SchemaTypes.CreatePostFromContributeTabMutation>;
export type CreatePostFromContributeTabMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreatePostFromContributeTabMutation,
  SchemaTypes.CreatePostFromContributeTabMutationVariables
>;
export const RemoveCommentFromCalloutDocument = gql`
  mutation RemoveCommentFromCallout($messageData: RoomRemoveMessageInput!) {
    removeMessageOnRoom(messageData: $messageData)
  }
`;
export type RemoveCommentFromCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveCommentFromCalloutMutation,
  SchemaTypes.RemoveCommentFromCalloutMutationVariables
>;

/**
 * __useRemoveCommentFromCalloutMutation__
 *
 * To run a mutation, you first call `useRemoveCommentFromCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommentFromCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommentFromCalloutMutation, { data, loading, error }] = useRemoveCommentFromCalloutMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useRemoveCommentFromCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveCommentFromCalloutMutation,
    SchemaTypes.RemoveCommentFromCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveCommentFromCalloutMutation,
    SchemaTypes.RemoveCommentFromCalloutMutationVariables
  >(RemoveCommentFromCalloutDocument, options);
}

export type RemoveCommentFromCalloutMutationHookResult = ReturnType<typeof useRemoveCommentFromCalloutMutation>;
export type RemoveCommentFromCalloutMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveCommentFromCalloutMutation>;
export type RemoveCommentFromCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveCommentFromCalloutMutation,
  SchemaTypes.RemoveCommentFromCalloutMutationVariables
>;
export const CreateLinkOnCalloutDocument = gql`
  mutation createLinkOnCallout($input: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $input) {
      link {
        ...LinkDetails
      }
    }
  }
  ${LinkDetailsFragmentDoc}
`;
export type CreateLinkOnCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateLinkOnCalloutMutation,
  SchemaTypes.CreateLinkOnCalloutMutationVariables
>;

/**
 * __useCreateLinkOnCalloutMutation__
 *
 * To run a mutation, you first call `useCreateLinkOnCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLinkOnCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLinkOnCalloutMutation, { data, loading, error }] = useCreateLinkOnCalloutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateLinkOnCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateLinkOnCalloutMutation,
    SchemaTypes.CreateLinkOnCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateLinkOnCalloutMutation, SchemaTypes.CreateLinkOnCalloutMutationVariables>(
    CreateLinkOnCalloutDocument,
    options
  );
}

export type CreateLinkOnCalloutMutationHookResult = ReturnType<typeof useCreateLinkOnCalloutMutation>;
export type CreateLinkOnCalloutMutationResult = Apollo.MutationResult<SchemaTypes.CreateLinkOnCalloutMutation>;
export type CreateLinkOnCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateLinkOnCalloutMutation,
  SchemaTypes.CreateLinkOnCalloutMutationVariables
>;
export const DeleteLinkDocument = gql`
  mutation deleteLink($input: DeleteLinkInput!) {
    deleteLink(deleteData: $input) {
      id
    }
  }
`;
export type DeleteLinkMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteLinkMutation,
  SchemaTypes.DeleteLinkMutationVariables
>;

/**
 * __useDeleteLinkMutation__
 *
 * To run a mutation, you first call `useDeleteLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLinkMutation, { data, loading, error }] = useDeleteLinkMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteLinkMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteLinkMutation, SchemaTypes.DeleteLinkMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteLinkMutation, SchemaTypes.DeleteLinkMutationVariables>(
    DeleteLinkDocument,
    options
  );
}

export type DeleteLinkMutationHookResult = ReturnType<typeof useDeleteLinkMutation>;
export type DeleteLinkMutationResult = Apollo.MutationResult<SchemaTypes.DeleteLinkMutation>;
export type DeleteLinkMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteLinkMutation,
  SchemaTypes.DeleteLinkMutationVariables
>;
export const UpdateLinkDocument = gql`
  mutation updateLink($input: UpdateLinkInput!) {
    updateLink(linkData: $input) {
      ...LinkDetails
    }
  }
  ${LinkDetailsFragmentDoc}
`;
export type UpdateLinkMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateLinkMutation,
  SchemaTypes.UpdateLinkMutationVariables
>;

/**
 * __useUpdateLinkMutation__
 *
 * To run a mutation, you first call `useUpdateLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLinkMutation, { data, loading, error }] = useUpdateLinkMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateLinkMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateLinkMutation, SchemaTypes.UpdateLinkMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateLinkMutation, SchemaTypes.UpdateLinkMutationVariables>(
    UpdateLinkDocument,
    options
  );
}

export type UpdateLinkMutationHookResult = ReturnType<typeof useUpdateLinkMutation>;
export type UpdateLinkMutationResult = Apollo.MutationResult<SchemaTypes.UpdateLinkMutation>;
export type UpdateLinkMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateLinkMutation,
  SchemaTypes.UpdateLinkMutationVariables
>;
export const CalloutPostCreatedDocument = gql`
  subscription CalloutPostCreated($calloutId: UUID!) {
    calloutPostCreated(calloutID: $calloutId) {
      post {
        ...ContributeTabPost
      }
    }
  }
  ${ContributeTabPostFragmentDoc}
`;

/**
 * __useCalloutPostCreatedSubscription__
 *
 * To run a query within a React component, call `useCalloutPostCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCalloutPostCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutPostCreatedSubscription({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutPostCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CalloutPostCreatedSubscription,
    SchemaTypes.CalloutPostCreatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CalloutPostCreatedSubscription,
    SchemaTypes.CalloutPostCreatedSubscriptionVariables
  >(CalloutPostCreatedDocument, options);
}

export type CalloutPostCreatedSubscriptionHookResult = ReturnType<typeof useCalloutPostCreatedSubscription>;
export type CalloutPostCreatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CalloutPostCreatedSubscription>;
export const CalloutPostsDocument = gql`
  query CalloutPosts($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions {
          post {
            ...ContributeTabPost
          }
        }
      }
    }
  }
  ${ContributeTabPostFragmentDoc}
`;

/**
 * __useCalloutPostsQuery__
 *
 * To run a query within a React component, call `useCalloutPostsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutPostsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutPostsQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutPostsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutPostsQuery, SchemaTypes.CalloutPostsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutPostsQuery, SchemaTypes.CalloutPostsQueryVariables>(
    CalloutPostsDocument,
    options
  );
}

export function useCalloutPostsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutPostsQuery, SchemaTypes.CalloutPostsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutPostsQuery, SchemaTypes.CalloutPostsQueryVariables>(
    CalloutPostsDocument,
    options
  );
}

export type CalloutPostsQueryHookResult = ReturnType<typeof useCalloutPostsQuery>;
export type CalloutPostsLazyQueryHookResult = ReturnType<typeof useCalloutPostsLazyQuery>;
export type CalloutPostsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutPostsQuery,
  SchemaTypes.CalloutPostsQueryVariables
>;
export function refetchCalloutPostsQuery(variables: SchemaTypes.CalloutPostsQueryVariables) {
  return { query: CalloutPostsDocument, variables: variables };
}

export const CalloutsDocument = gql`
  query Callouts($collaborationId: UUID!, $groups: [String!], $calloutIds: [UUID_NAMEID!]) {
    lookup {
      collaboration(ID: $collaborationId) {
        ...CollaborationWithCallouts
      }
    }
  }
  ${CollaborationWithCalloutsFragmentDoc}
`;

/**
 * __useCalloutsQuery__
 *
 * To run a query within a React component, call `useCalloutsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutsQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *      groups: // value for 'groups'
 *      calloutIds: // value for 'calloutIds'
 *   },
 * });
 */
export function useCalloutsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutsQuery, SchemaTypes.CalloutsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutsQuery, SchemaTypes.CalloutsQueryVariables>(CalloutsDocument, options);
}

export function useCalloutsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutsQuery, SchemaTypes.CalloutsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutsQuery, SchemaTypes.CalloutsQueryVariables>(CalloutsDocument, options);
}

export type CalloutsQueryHookResult = ReturnType<typeof useCalloutsQuery>;
export type CalloutsLazyQueryHookResult = ReturnType<typeof useCalloutsLazyQuery>;
export type CalloutsQueryResult = Apollo.QueryResult<SchemaTypes.CalloutsQuery, SchemaTypes.CalloutsQueryVariables>;
export function refetchCalloutsQuery(variables: SchemaTypes.CalloutsQueryVariables) {
  return { query: CalloutsDocument, variables: variables };
}

export const CalloutDetailsDocument = gql`
  query CalloutDetails($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        ...CalloutDetails
      }
    }
  }
  ${CalloutDetailsFragmentDoc}
`;

/**
 * __useCalloutDetailsQuery__
 *
 * To run a query within a React component, call `useCalloutDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutDetailsQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>(
    CalloutDetailsDocument,
    options
  );
}

export function useCalloutDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>(
    CalloutDetailsDocument,
    options
  );
}

export type CalloutDetailsQueryHookResult = ReturnType<typeof useCalloutDetailsQuery>;
export type CalloutDetailsLazyQueryHookResult = ReturnType<typeof useCalloutDetailsLazyQuery>;
export type CalloutDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutDetailsQuery,
  SchemaTypes.CalloutDetailsQueryVariables
>;
export function refetchCalloutDetailsQuery(variables: SchemaTypes.CalloutDetailsQueryVariables) {
  return { query: CalloutDetailsDocument, variables: variables };
}

export const CalloutWhiteboardsDocument = gql`
  query CalloutWhiteboards($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions {
          id
          whiteboard {
            ...WhiteboardCollectionCalloutCard
          }
        }
      }
    }
  }
  ${WhiteboardCollectionCalloutCardFragmentDoc}
`;

/**
 * __useCalloutWhiteboardsQuery__
 *
 * To run a query within a React component, call `useCalloutWhiteboardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutWhiteboardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutWhiteboardsQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutWhiteboardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutWhiteboardsQuery,
    SchemaTypes.CalloutWhiteboardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutWhiteboardsQuery, SchemaTypes.CalloutWhiteboardsQueryVariables>(
    CalloutWhiteboardsDocument,
    options
  );
}

export function useCalloutWhiteboardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutWhiteboardsQuery,
    SchemaTypes.CalloutWhiteboardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutWhiteboardsQuery, SchemaTypes.CalloutWhiteboardsQueryVariables>(
    CalloutWhiteboardsDocument,
    options
  );
}

export type CalloutWhiteboardsQueryHookResult = ReturnType<typeof useCalloutWhiteboardsQuery>;
export type CalloutWhiteboardsLazyQueryHookResult = ReturnType<typeof useCalloutWhiteboardsLazyQuery>;
export type CalloutWhiteboardsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutWhiteboardsQuery,
  SchemaTypes.CalloutWhiteboardsQueryVariables
>;
export function refetchCalloutWhiteboardsQuery(variables: SchemaTypes.CalloutWhiteboardsQueryVariables) {
  return { query: CalloutWhiteboardsDocument, variables: variables };
}

export const SpacePostTemplatesLibraryDocument = gql`
  query SpacePostTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          postTemplates {
            ...PostTemplateCard
          }
        }
        host {
          id
          nameID
          profile {
            ...TemplateProviderProfile
          }
        }
      }
    }
  }
  ${PostTemplateCardFragmentDoc}
  ${TemplateProviderProfileFragmentDoc}
`;

/**
 * __useSpacePostTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useSpacePostTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePostTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePostTemplatesLibraryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpacePostTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpacePostTemplatesLibraryQuery,
    SchemaTypes.SpacePostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpacePostTemplatesLibraryQuery,
    SchemaTypes.SpacePostTemplatesLibraryQueryVariables
  >(SpacePostTemplatesLibraryDocument, options);
}

export function useSpacePostTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePostTemplatesLibraryQuery,
    SchemaTypes.SpacePostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpacePostTemplatesLibraryQuery,
    SchemaTypes.SpacePostTemplatesLibraryQueryVariables
  >(SpacePostTemplatesLibraryDocument, options);
}

export type SpacePostTemplatesLibraryQueryHookResult = ReturnType<typeof useSpacePostTemplatesLibraryQuery>;
export type SpacePostTemplatesLibraryLazyQueryHookResult = ReturnType<typeof useSpacePostTemplatesLibraryLazyQuery>;
export type SpacePostTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePostTemplatesLibraryQuery,
  SchemaTypes.SpacePostTemplatesLibraryQueryVariables
>;
export function refetchSpacePostTemplatesLibraryQuery(variables: SchemaTypes.SpacePostTemplatesLibraryQueryVariables) {
  return { query: SpacePostTemplatesLibraryDocument, variables: variables };
}

export const PlatformPostTemplatesLibraryDocument = gql`
  query PlatformPostTemplatesLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          profile {
            id
            displayName
          }
          provider {
            id
            nameID
            profile {
              ...TemplateProviderProfile
            }
          }
          templates {
            id
            postTemplates {
              ...PostTemplateCard
            }
          }
        }
      }
    }
  }
  ${TemplateProviderProfileFragmentDoc}
  ${PostTemplateCardFragmentDoc}
`;

/**
 * __usePlatformPostTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `usePlatformPostTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformPostTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformPostTemplatesLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformPostTemplatesLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformPostTemplatesLibraryQuery,
    SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformPostTemplatesLibraryQuery,
    SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
  >(PlatformPostTemplatesLibraryDocument, options);
}

export function usePlatformPostTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformPostTemplatesLibraryQuery,
    SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformPostTemplatesLibraryQuery,
    SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
  >(PlatformPostTemplatesLibraryDocument, options);
}

export type PlatformPostTemplatesLibraryQueryHookResult = ReturnType<typeof usePlatformPostTemplatesLibraryQuery>;
export type PlatformPostTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof usePlatformPostTemplatesLibraryLazyQuery
>;
export type PlatformPostTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformPostTemplatesLibraryQuery,
  SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
>;
export function refetchPlatformPostTemplatesLibraryQuery(
  variables?: SchemaTypes.PlatformPostTemplatesLibraryQueryVariables
) {
  return { query: PlatformPostTemplatesLibraryDocument, variables: variables };
}

export const PostDocument = gql`
  query Post($calloutId: UUID!, $postNameId: UUID_NAMEID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        nameID
        type
        contributions(filter: { postIDs: [$postNameId] }) {
          id
          post {
            ...PostDashboard
          }
        }
      }
    }
  }
  ${PostDashboardFragmentDoc}
`;

/**
 * __usePostQuery__
 *
 * To run a query within a React component, call `usePostQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      postNameId: // value for 'postNameId'
 *   },
 * });
 */
export function usePostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostQuery, SchemaTypes.PostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostQuery, SchemaTypes.PostQueryVariables>(PostDocument, options);
}

export function usePostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PostQuery, SchemaTypes.PostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostQuery, SchemaTypes.PostQueryVariables>(PostDocument, options);
}

export type PostQueryHookResult = ReturnType<typeof usePostQuery>;
export type PostLazyQueryHookResult = ReturnType<typeof usePostLazyQuery>;
export type PostQueryResult = Apollo.QueryResult<SchemaTypes.PostQuery, SchemaTypes.PostQueryVariables>;
export function refetchPostQuery(variables: SchemaTypes.PostQueryVariables) {
  return { query: PostDocument, variables: variables };
}

export const UpdatePostDocument = gql`
  mutation updatePost($input: UpdatePostInput!) {
    updatePost(postData: $input) {
      id
      type
      profile {
        id
        displayName
        description
        tagset {
          ...TagsetDetails
        }
        references {
          id
          name
          description
          uri
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdatePostMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePostMutation,
  SchemaTypes.UpdatePostMutationVariables
>;

/**
 * __useUpdatePostMutation__
 *
 * To run a mutation, you first call `useUpdatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePostMutation, { data, loading, error }] = useUpdatePostMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePostMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdatePostMutation, SchemaTypes.UpdatePostMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdatePostMutation, SchemaTypes.UpdatePostMutationVariables>(
    UpdatePostDocument,
    options
  );
}

export type UpdatePostMutationHookResult = ReturnType<typeof useUpdatePostMutation>;
export type UpdatePostMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePostMutation>;
export type UpdatePostMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePostMutation,
  SchemaTypes.UpdatePostMutationVariables
>;
export const PostSettingsDocument = gql`
  query PostSettings($postNameId: UUID_NAMEID!, $calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        ...PostSettingsCallout
      }
    }
  }
  ${PostSettingsCalloutFragmentDoc}
`;

/**
 * __usePostSettingsQuery__
 *
 * To run a query within a React component, call `usePostSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostSettingsQuery({
 *   variables: {
 *      postNameId: // value for 'postNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function usePostSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>(
    PostSettingsDocument,
    options
  );
}

export function usePostSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>(
    PostSettingsDocument,
    options
  );
}

export type PostSettingsQueryHookResult = ReturnType<typeof usePostSettingsQuery>;
export type PostSettingsLazyQueryHookResult = ReturnType<typeof usePostSettingsLazyQuery>;
export type PostSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.PostSettingsQuery,
  SchemaTypes.PostSettingsQueryVariables
>;
export function refetchPostSettingsQuery(variables: SchemaTypes.PostSettingsQueryVariables) {
  return { query: PostSettingsDocument, variables: variables };
}

export const PostProviderDocument = gql`
  query PostProvider($calloutId: UUID!, $postNameId: UUID_NAMEID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        nameID
        type
        contributions(filter: { postIDs: [$postNameId] }) {
          post {
            ...PostProvided
          }
        }
      }
    }
  }
  ${PostProvidedFragmentDoc}
`;

/**
 * __usePostProviderQuery__
 *
 * To run a query within a React component, call `usePostProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostProviderQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      postNameId: // value for 'postNameId'
 *   },
 * });
 */
export function usePostProviderQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostProviderQuery, SchemaTypes.PostProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostProviderQuery, SchemaTypes.PostProviderQueryVariables>(
    PostProviderDocument,
    options
  );
}

export function usePostProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PostProviderQuery, SchemaTypes.PostProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostProviderQuery, SchemaTypes.PostProviderQueryVariables>(
    PostProviderDocument,
    options
  );
}

export type PostProviderQueryHookResult = ReturnType<typeof usePostProviderQuery>;
export type PostProviderLazyQueryHookResult = ReturnType<typeof usePostProviderLazyQuery>;
export type PostProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.PostProviderQuery,
  SchemaTypes.PostProviderQueryVariables
>;
export function refetchPostProviderQuery(variables: SchemaTypes.PostProviderQueryVariables) {
  return { query: PostProviderDocument, variables: variables };
}

export const DeletePostDocument = gql`
  mutation deletePost($input: DeletePostInput!) {
    deletePost(deleteData: $input) {
      id
    }
  }
`;
export type DeletePostMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeletePostMutation,
  SchemaTypes.DeletePostMutationVariables
>;

/**
 * __useDeletePostMutation__
 *
 * To run a mutation, you first call `useDeletePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePostMutation, { data, loading, error }] = useDeletePostMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeletePostMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeletePostMutation, SchemaTypes.DeletePostMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeletePostMutation, SchemaTypes.DeletePostMutationVariables>(
    DeletePostDocument,
    options
  );
}

export type DeletePostMutationHookResult = ReturnType<typeof useDeletePostMutation>;
export type DeletePostMutationResult = Apollo.MutationResult<SchemaTypes.DeletePostMutation>;
export type DeletePostMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeletePostMutation,
  SchemaTypes.DeletePostMutationVariables
>;
export const MoveContributionToCalloutDocument = gql`
  mutation MoveContributionToCallout($contributionId: UUID!, $calloutId: UUID!) {
    moveContributionToCallout(moveContributionData: { contributionID: $contributionId, calloutID: $calloutId }) {
      id
      post {
        id
        nameID
        profile {
          id
          url
        }
      }
    }
  }
`;
export type MoveContributionToCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.MoveContributionToCalloutMutation,
  SchemaTypes.MoveContributionToCalloutMutationVariables
>;

/**
 * __useMoveContributionToCalloutMutation__
 *
 * To run a mutation, you first call `useMoveContributionToCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveContributionToCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveContributionToCalloutMutation, { data, loading, error }] = useMoveContributionToCalloutMutation({
 *   variables: {
 *      contributionId: // value for 'contributionId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useMoveContributionToCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.MoveContributionToCalloutMutation,
    SchemaTypes.MoveContributionToCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.MoveContributionToCalloutMutation,
    SchemaTypes.MoveContributionToCalloutMutationVariables
  >(MoveContributionToCalloutDocument, options);
}

export type MoveContributionToCalloutMutationHookResult = ReturnType<typeof useMoveContributionToCalloutMutation>;
export type MoveContributionToCalloutMutationResult =
  Apollo.MutationResult<SchemaTypes.MoveContributionToCalloutMutation>;
export type MoveContributionToCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.MoveContributionToCalloutMutation,
  SchemaTypes.MoveContributionToCalloutMutationVariables
>;
export const SpaceWhiteboardTemplatesLibraryDocument = gql`
  query SpaceWhiteboardTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          whiteboardTemplates {
            ...WhiteboardTemplateCard
          }
        }
        host {
          id
          nameID
          profile {
            ...TemplateProviderProfile
          }
        }
      }
    }
  }
  ${WhiteboardTemplateCardFragmentDoc}
  ${TemplateProviderProfileFragmentDoc}
`;

/**
 * __useSpaceWhiteboardTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useSpaceWhiteboardTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceWhiteboardTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceWhiteboardTemplatesLibraryQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceWhiteboardTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQuery,
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQuery,
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
  >(SpaceWhiteboardTemplatesLibraryDocument, options);
}

export function useSpaceWhiteboardTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQuery,
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQuery,
    SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
  >(SpaceWhiteboardTemplatesLibraryDocument, options);
}

export type SpaceWhiteboardTemplatesLibraryQueryHookResult = ReturnType<typeof useSpaceWhiteboardTemplatesLibraryQuery>;
export type SpaceWhiteboardTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof useSpaceWhiteboardTemplatesLibraryLazyQuery
>;
export type SpaceWhiteboardTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceWhiteboardTemplatesLibraryQuery,
  SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
>;
export function refetchSpaceWhiteboardTemplatesLibraryQuery(
  variables: SchemaTypes.SpaceWhiteboardTemplatesLibraryQueryVariables
) {
  return { query: SpaceWhiteboardTemplatesLibraryDocument, variables: variables };
}

export const PlatformWhiteboardTemplatesLibraryDocument = gql`
  query PlatformWhiteboardTemplatesLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          profile {
            id
            displayName
          }
          provider {
            id
            nameID
            profile {
              ...TemplateProviderProfile
            }
          }
          templates {
            id
            whiteboardTemplates {
              ...WhiteboardTemplateCard
            }
          }
        }
      }
    }
  }
  ${TemplateProviderProfileFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
`;

/**
 * __usePlatformWhiteboardTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `usePlatformWhiteboardTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformWhiteboardTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformWhiteboardTemplatesLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformWhiteboardTemplatesLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQuery,
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQuery,
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
  >(PlatformWhiteboardTemplatesLibraryDocument, options);
}

export function usePlatformWhiteboardTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQuery,
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQuery,
    SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
  >(PlatformWhiteboardTemplatesLibraryDocument, options);
}

export type PlatformWhiteboardTemplatesLibraryQueryHookResult = ReturnType<
  typeof usePlatformWhiteboardTemplatesLibraryQuery
>;
export type PlatformWhiteboardTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof usePlatformWhiteboardTemplatesLibraryLazyQuery
>;
export type PlatformWhiteboardTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformWhiteboardTemplatesLibraryQuery,
  SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
>;
export function refetchPlatformWhiteboardTemplatesLibraryQuery(
  variables?: SchemaTypes.PlatformWhiteboardTemplatesLibraryQueryVariables
) {
  return { query: PlatformWhiteboardTemplatesLibraryDocument, variables: variables };
}

export const WhiteboardLockedByDetailsDocument = gql`
  query WhiteboardLockedByDetails($ids: [UUID!]!) {
    users(IDs: $ids) {
      ...LockedByDetails
    }
  }
  ${LockedByDetailsFragmentDoc}
`;

/**
 * __useWhiteboardLockedByDetailsQuery__
 *
 * To run a query within a React component, call `useWhiteboardLockedByDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardLockedByDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardLockedByDetailsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useWhiteboardLockedByDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardLockedByDetailsQuery,
    SchemaTypes.WhiteboardLockedByDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardLockedByDetailsQuery,
    SchemaTypes.WhiteboardLockedByDetailsQueryVariables
  >(WhiteboardLockedByDetailsDocument, options);
}

export function useWhiteboardLockedByDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardLockedByDetailsQuery,
    SchemaTypes.WhiteboardLockedByDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardLockedByDetailsQuery,
    SchemaTypes.WhiteboardLockedByDetailsQueryVariables
  >(WhiteboardLockedByDetailsDocument, options);
}

export type WhiteboardLockedByDetailsQueryHookResult = ReturnType<typeof useWhiteboardLockedByDetailsQuery>;
export type WhiteboardLockedByDetailsLazyQueryHookResult = ReturnType<typeof useWhiteboardLockedByDetailsLazyQuery>;
export type WhiteboardLockedByDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardLockedByDetailsQuery,
  SchemaTypes.WhiteboardLockedByDetailsQueryVariables
>;
export function refetchWhiteboardLockedByDetailsQuery(variables: SchemaTypes.WhiteboardLockedByDetailsQueryVariables) {
  return { query: WhiteboardLockedByDetailsDocument, variables: variables };
}

export const WhiteboardTemplatesDocument = gql`
  query whiteboardTemplates($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          whiteboardTemplates {
            ...CreateWhiteboardWhiteboardTemplate
          }
        }
      }
    }
  }
  ${CreateWhiteboardWhiteboardTemplateFragmentDoc}
`;

/**
 * __useWhiteboardTemplatesQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useWhiteboardTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplatesQuery,
    SchemaTypes.WhiteboardTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardTemplatesQuery, SchemaTypes.WhiteboardTemplatesQueryVariables>(
    WhiteboardTemplatesDocument,
    options
  );
}

export function useWhiteboardTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplatesQuery,
    SchemaTypes.WhiteboardTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.WhiteboardTemplatesQuery, SchemaTypes.WhiteboardTemplatesQueryVariables>(
    WhiteboardTemplatesDocument,
    options
  );
}

export type WhiteboardTemplatesQueryHookResult = ReturnType<typeof useWhiteboardTemplatesQuery>;
export type WhiteboardTemplatesLazyQueryHookResult = ReturnType<typeof useWhiteboardTemplatesLazyQuery>;
export type WhiteboardTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplatesQuery,
  SchemaTypes.WhiteboardTemplatesQueryVariables
>;
export function refetchWhiteboardTemplatesQuery(variables: SchemaTypes.WhiteboardTemplatesQueryVariables) {
  return { query: WhiteboardTemplatesDocument, variables: variables };
}

export const WhiteboardFromCalloutDocument = gql`
  query WhiteboardFromCallout($calloutId: UUID!, $whiteboardId: UUID_NAMEID!) {
    lookup {
      callout(ID: $calloutId) {
        ...CalloutWithWhiteboard
      }
    }
  }
  ${CalloutWithWhiteboardFragmentDoc}
`;

/**
 * __useWhiteboardFromCalloutQuery__
 *
 * To run a query within a React component, call `useWhiteboardFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardFromCalloutQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardFromCalloutQuery,
    SchemaTypes.WhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardFromCalloutQuery, SchemaTypes.WhiteboardFromCalloutQueryVariables>(
    WhiteboardFromCalloutDocument,
    options
  );
}

export function useWhiteboardFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardFromCalloutQuery,
    SchemaTypes.WhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.WhiteboardFromCalloutQuery, SchemaTypes.WhiteboardFromCalloutQueryVariables>(
    WhiteboardFromCalloutDocument,
    options
  );
}

export type WhiteboardFromCalloutQueryHookResult = ReturnType<typeof useWhiteboardFromCalloutQuery>;
export type WhiteboardFromCalloutLazyQueryHookResult = ReturnType<typeof useWhiteboardFromCalloutLazyQuery>;
export type WhiteboardFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardFromCalloutQuery,
  SchemaTypes.WhiteboardFromCalloutQueryVariables
>;
export function refetchWhiteboardFromCalloutQuery(variables: SchemaTypes.WhiteboardFromCalloutQueryVariables) {
  return { query: WhiteboardFromCalloutDocument, variables: variables };
}

export const WhiteboardWithContentDocument = gql`
  query WhiteboardWithContent($whiteboardId: UUID!) {
    lookup {
      whiteboard(ID: $whiteboardId) {
        ...WhiteboardDetails
        ...WhiteboardContent
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
  ${WhiteboardContentFragmentDoc}
`;

/**
 * __useWhiteboardWithContentQuery__
 *
 * To run a query within a React component, call `useWhiteboardWithContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardWithContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardWithContentQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardWithContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardWithContentQuery,
    SchemaTypes.WhiteboardWithContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardWithContentQuery, SchemaTypes.WhiteboardWithContentQueryVariables>(
    WhiteboardWithContentDocument,
    options
  );
}

export function useWhiteboardWithContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardWithContentQuery,
    SchemaTypes.WhiteboardWithContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.WhiteboardWithContentQuery, SchemaTypes.WhiteboardWithContentQueryVariables>(
    WhiteboardWithContentDocument,
    options
  );
}

export type WhiteboardWithContentQueryHookResult = ReturnType<typeof useWhiteboardWithContentQuery>;
export type WhiteboardWithContentLazyQueryHookResult = ReturnType<typeof useWhiteboardWithContentLazyQuery>;
export type WhiteboardWithContentQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardWithContentQuery,
  SchemaTypes.WhiteboardWithContentQueryVariables
>;
export function refetchWhiteboardWithContentQuery(variables: SchemaTypes.WhiteboardWithContentQueryVariables) {
  return { query: WhiteboardWithContentDocument, variables: variables };
}

export const WhiteboardLastUpdatedDateDocument = gql`
  query whiteboardLastUpdatedDate($whiteboardId: UUID!) {
    lookup {
      whiteboard(ID: $whiteboardId) {
        id
        updatedDate
      }
    }
  }
`;

/**
 * __useWhiteboardLastUpdatedDateQuery__
 *
 * To run a query within a React component, call `useWhiteboardLastUpdatedDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardLastUpdatedDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardLastUpdatedDateQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardLastUpdatedDateQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardLastUpdatedDateQuery,
    SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardLastUpdatedDateQuery,
    SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
  >(WhiteboardLastUpdatedDateDocument, options);
}

export function useWhiteboardLastUpdatedDateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardLastUpdatedDateQuery,
    SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardLastUpdatedDateQuery,
    SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
  >(WhiteboardLastUpdatedDateDocument, options);
}

export type WhiteboardLastUpdatedDateQueryHookResult = ReturnType<typeof useWhiteboardLastUpdatedDateQuery>;
export type WhiteboardLastUpdatedDateLazyQueryHookResult = ReturnType<typeof useWhiteboardLastUpdatedDateLazyQuery>;
export type WhiteboardLastUpdatedDateQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardLastUpdatedDateQuery,
  SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
>;
export function refetchWhiteboardLastUpdatedDateQuery(variables: SchemaTypes.WhiteboardLastUpdatedDateQueryVariables) {
  return { query: WhiteboardLastUpdatedDateDocument, variables: variables };
}

export const PlatformTemplateWhiteboardContentsDocument = gql`
  query platformTemplateWhiteboardContents($innovationPackId: UUID_NAMEID!, $whiteboardId: UUID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          templates {
            id
            whiteboardTemplate(ID: $whiteboardId) {
              id
              profile {
                ...WhiteboardProfile
              }
              content
            }
          }
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
`;

/**
 * __usePlatformTemplateWhiteboardContentsQuery__
 *
 * To run a query within a React component, call `usePlatformTemplateWhiteboardContentsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformTemplateWhiteboardContentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformTemplateWhiteboardContentsQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function usePlatformTemplateWhiteboardContentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformTemplateWhiteboardContentsQuery,
    SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformTemplateWhiteboardContentsQuery,
    SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
  >(PlatformTemplateWhiteboardContentsDocument, options);
}

export function usePlatformTemplateWhiteboardContentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformTemplateWhiteboardContentsQuery,
    SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformTemplateWhiteboardContentsQuery,
    SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
  >(PlatformTemplateWhiteboardContentsDocument, options);
}

export type PlatformTemplateWhiteboardContentsQueryHookResult = ReturnType<
  typeof usePlatformTemplateWhiteboardContentsQuery
>;
export type PlatformTemplateWhiteboardContentsLazyQueryHookResult = ReturnType<
  typeof usePlatformTemplateWhiteboardContentsLazyQuery
>;
export type PlatformTemplateWhiteboardContentsQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformTemplateWhiteboardContentsQuery,
  SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
>;
export function refetchPlatformTemplateWhiteboardContentsQuery(
  variables: SchemaTypes.PlatformTemplateWhiteboardContentsQueryVariables
) {
  return { query: PlatformTemplateWhiteboardContentsDocument, variables: variables };
}

export const CreateWhiteboardOnCalloutDocument = gql`
  mutation createWhiteboardOnCallout($input: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $input) {
      whiteboard {
        ...WhiteboardDetails
        profile {
          url
        }
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
`;
export type CreateWhiteboardOnCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateWhiteboardOnCalloutMutation,
  SchemaTypes.CreateWhiteboardOnCalloutMutationVariables
>;

/**
 * __useCreateWhiteboardOnCalloutMutation__
 *
 * To run a mutation, you first call `useCreateWhiteboardOnCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWhiteboardOnCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWhiteboardOnCalloutMutation, { data, loading, error }] = useCreateWhiteboardOnCalloutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWhiteboardOnCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateWhiteboardOnCalloutMutation,
    SchemaTypes.CreateWhiteboardOnCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateWhiteboardOnCalloutMutation,
    SchemaTypes.CreateWhiteboardOnCalloutMutationVariables
  >(CreateWhiteboardOnCalloutDocument, options);
}

export type CreateWhiteboardOnCalloutMutationHookResult = ReturnType<typeof useCreateWhiteboardOnCalloutMutation>;
export type CreateWhiteboardOnCalloutMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateWhiteboardOnCalloutMutation>;
export type CreateWhiteboardOnCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateWhiteboardOnCalloutMutation,
  SchemaTypes.CreateWhiteboardOnCalloutMutationVariables
>;
export const DeleteWhiteboardDocument = gql`
  mutation deleteWhiteboard($input: DeleteWhiteboardInput!) {
    deleteWhiteboard(whiteboardData: $input) {
      id
    }
  }
`;
export type DeleteWhiteboardMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteWhiteboardMutation,
  SchemaTypes.DeleteWhiteboardMutationVariables
>;

/**
 * __useDeleteWhiteboardMutation__
 *
 * To run a mutation, you first call `useDeleteWhiteboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWhiteboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWhiteboardMutation, { data, loading, error }] = useDeleteWhiteboardMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteWhiteboardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteWhiteboardMutation,
    SchemaTypes.DeleteWhiteboardMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteWhiteboardMutation, SchemaTypes.DeleteWhiteboardMutationVariables>(
    DeleteWhiteboardDocument,
    options
  );
}

export type DeleteWhiteboardMutationHookResult = ReturnType<typeof useDeleteWhiteboardMutation>;
export type DeleteWhiteboardMutationResult = Apollo.MutationResult<SchemaTypes.DeleteWhiteboardMutation>;
export type DeleteWhiteboardMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteWhiteboardMutation,
  SchemaTypes.DeleteWhiteboardMutationVariables
>;
export const UpdateWhiteboardDocument = gql`
  mutation updateWhiteboard($input: UpdateWhiteboardInput!) {
    updateWhiteboard(whiteboardData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type UpdateWhiteboardMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateWhiteboardMutation,
  SchemaTypes.UpdateWhiteboardMutationVariables
>;

/**
 * __useUpdateWhiteboardMutation__
 *
 * To run a mutation, you first call `useUpdateWhiteboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhiteboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhiteboardMutation, { data, loading, error }] = useUpdateWhiteboardMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWhiteboardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateWhiteboardMutation,
    SchemaTypes.UpdateWhiteboardMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateWhiteboardMutation, SchemaTypes.UpdateWhiteboardMutationVariables>(
    UpdateWhiteboardDocument,
    options
  );
}

export type UpdateWhiteboardMutationHookResult = ReturnType<typeof useUpdateWhiteboardMutation>;
export type UpdateWhiteboardMutationResult = Apollo.MutationResult<SchemaTypes.UpdateWhiteboardMutation>;
export type UpdateWhiteboardMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateWhiteboardMutation,
  SchemaTypes.UpdateWhiteboardMutationVariables
>;
export const UpdateWhiteboardContentDocument = gql`
  mutation updateWhiteboardContent($input: UpdateWhiteboardContentInput!) {
    updateWhiteboardContent(whiteboardData: $input) {
      id
      content
    }
  }
`;
export type UpdateWhiteboardContentMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateWhiteboardContentMutation,
  SchemaTypes.UpdateWhiteboardContentMutationVariables
>;

/**
 * __useUpdateWhiteboardContentMutation__
 *
 * To run a mutation, you first call `useUpdateWhiteboardContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhiteboardContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhiteboardContentMutation, { data, loading, error }] = useUpdateWhiteboardContentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWhiteboardContentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateWhiteboardContentMutation,
    SchemaTypes.UpdateWhiteboardContentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateWhiteboardContentMutation,
    SchemaTypes.UpdateWhiteboardContentMutationVariables
  >(UpdateWhiteboardContentDocument, options);
}

export type UpdateWhiteboardContentMutationHookResult = ReturnType<typeof useUpdateWhiteboardContentMutation>;
export type UpdateWhiteboardContentMutationResult = Apollo.MutationResult<SchemaTypes.UpdateWhiteboardContentMutation>;
export type UpdateWhiteboardContentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateWhiteboardContentMutation,
  SchemaTypes.UpdateWhiteboardContentMutationVariables
>;
export const WhiteboardContentUpdatePolicyDocument = gql`
  query WhiteboardContentUpdatePolicy($whiteboardId: UUID!) {
    lookup {
      whiteboard(ID: $whiteboardId) {
        id
        contentUpdatePolicy
      }
    }
  }
`;

/**
 * __useWhiteboardContentUpdatePolicyQuery__
 *
 * To run a query within a React component, call `useWhiteboardContentUpdatePolicyQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardContentUpdatePolicyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardContentUpdatePolicyQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardContentUpdatePolicyQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardContentUpdatePolicyQuery,
    SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardContentUpdatePolicyQuery,
    SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
  >(WhiteboardContentUpdatePolicyDocument, options);
}

export function useWhiteboardContentUpdatePolicyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardContentUpdatePolicyQuery,
    SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardContentUpdatePolicyQuery,
    SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
  >(WhiteboardContentUpdatePolicyDocument, options);
}

export type WhiteboardContentUpdatePolicyQueryHookResult = ReturnType<typeof useWhiteboardContentUpdatePolicyQuery>;
export type WhiteboardContentUpdatePolicyLazyQueryHookResult = ReturnType<
  typeof useWhiteboardContentUpdatePolicyLazyQuery
>;
export type WhiteboardContentUpdatePolicyQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardContentUpdatePolicyQuery,
  SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
>;
export function refetchWhiteboardContentUpdatePolicyQuery(
  variables: SchemaTypes.WhiteboardContentUpdatePolicyQueryVariables
) {
  return { query: WhiteboardContentUpdatePolicyDocument, variables: variables };
}

export const UpdateWhiteboardContentUpdatePolicyDocument = gql`
  mutation UpdateWhiteboardContentUpdatePolicy($whiteboardId: UUID!, $contentUpdatePolicy: ContentUpdatePolicy!) {
    updateWhiteboard(whiteboardData: { ID: $whiteboardId, contentUpdatePolicy: $contentUpdatePolicy }) {
      id
      contentUpdatePolicy
    }
  }
`;
export type UpdateWhiteboardContentUpdatePolicyMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutation,
  SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutationVariables
>;

/**
 * __useUpdateWhiteboardContentUpdatePolicyMutation__
 *
 * To run a mutation, you first call `useUpdateWhiteboardContentUpdatePolicyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhiteboardContentUpdatePolicyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhiteboardContentUpdatePolicyMutation, { data, loading, error }] = useUpdateWhiteboardContentUpdatePolicyMutation({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *      contentUpdatePolicy: // value for 'contentUpdatePolicy'
 *   },
 * });
 */
export function useUpdateWhiteboardContentUpdatePolicyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutation,
    SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutation,
    SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutationVariables
  >(UpdateWhiteboardContentUpdatePolicyDocument, options);
}

export type UpdateWhiteboardContentUpdatePolicyMutationHookResult = ReturnType<
  typeof useUpdateWhiteboardContentUpdatePolicyMutation
>;
export type UpdateWhiteboardContentUpdatePolicyMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutation>;
export type UpdateWhiteboardContentUpdatePolicyMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutation,
  SchemaTypes.UpdateWhiteboardContentUpdatePolicyMutationVariables
>;
export const ChallengePreferencesDocument = gql`
  query ChallengePreferences($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        preferences {
          id
          value
          definition {
            id
            description
            displayName
            group
            type
            valueType
          }
        }
      }
    }
  }
`;

/**
 * __useChallengePreferencesQuery__
 *
 * To run a query within a React component, call `useChallengePreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengePreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengePreferencesQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengePreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengePreferencesQuery,
    SchemaTypes.ChallengePreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengePreferencesQuery, SchemaTypes.ChallengePreferencesQueryVariables>(
    ChallengePreferencesDocument,
    options
  );
}

export function useChallengePreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengePreferencesQuery,
    SchemaTypes.ChallengePreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengePreferencesQuery, SchemaTypes.ChallengePreferencesQueryVariables>(
    ChallengePreferencesDocument,
    options
  );
}

export type ChallengePreferencesQueryHookResult = ReturnType<typeof useChallengePreferencesQuery>;
export type ChallengePreferencesLazyQueryHookResult = ReturnType<typeof useChallengePreferencesLazyQuery>;
export type ChallengePreferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengePreferencesQuery,
  SchemaTypes.ChallengePreferencesQueryVariables
>;
export function refetchChallengePreferencesQuery(variables: SchemaTypes.ChallengePreferencesQueryVariables) {
  return { query: ChallengePreferencesDocument, variables: variables };
}

export const UpdatePreferenceOnChallengeDocument = gql`
  mutation updatePreferenceOnChallenge($preferenceData: UpdateChallengePreferenceInput!) {
    updatePreferenceOnChallenge(preferenceData: $preferenceData) {
      id
      value
    }
  }
`;
export type UpdatePreferenceOnChallengeMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferenceOnChallengeMutation,
  SchemaTypes.UpdatePreferenceOnChallengeMutationVariables
>;

/**
 * __useUpdatePreferenceOnChallengeMutation__
 *
 * To run a mutation, you first call `useUpdatePreferenceOnChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferenceOnChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferenceOnChallengeMutation, { data, loading, error }] = useUpdatePreferenceOnChallengeMutation({
 *   variables: {
 *      preferenceData: // value for 'preferenceData'
 *   },
 * });
 */
export function useUpdatePreferenceOnChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferenceOnChallengeMutation,
    SchemaTypes.UpdatePreferenceOnChallengeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdatePreferenceOnChallengeMutation,
    SchemaTypes.UpdatePreferenceOnChallengeMutationVariables
  >(UpdatePreferenceOnChallengeDocument, options);
}

export type UpdatePreferenceOnChallengeMutationHookResult = ReturnType<typeof useUpdatePreferenceOnChallengeMutation>;
export type UpdatePreferenceOnChallengeMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdatePreferenceOnChallengeMutation>;
export type UpdatePreferenceOnChallengeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferenceOnChallengeMutation,
  SchemaTypes.UpdatePreferenceOnChallengeMutationVariables
>;
export const OrganizationPreferencesDocument = gql`
  query organizationPreferences($orgId: UUID_NAMEID!) {
    organization(ID: $orgId) {
      id
      preferences {
        id
        value
        definition {
          id
          description
          displayName
          group
          type
          valueType
        }
      }
    }
  }
`;

/**
 * __useOrganizationPreferencesQuery__
 *
 * To run a query within a React component, call `useOrganizationPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationPreferencesQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useOrganizationPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationPreferencesQuery,
    SchemaTypes.OrganizationPreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationPreferencesQuery, SchemaTypes.OrganizationPreferencesQueryVariables>(
    OrganizationPreferencesDocument,
    options
  );
}

export function useOrganizationPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationPreferencesQuery,
    SchemaTypes.OrganizationPreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OrganizationPreferencesQuery,
    SchemaTypes.OrganizationPreferencesQueryVariables
  >(OrganizationPreferencesDocument, options);
}

export type OrganizationPreferencesQueryHookResult = ReturnType<typeof useOrganizationPreferencesQuery>;
export type OrganizationPreferencesLazyQueryHookResult = ReturnType<typeof useOrganizationPreferencesLazyQuery>;
export type OrganizationPreferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationPreferencesQuery,
  SchemaTypes.OrganizationPreferencesQueryVariables
>;
export function refetchOrganizationPreferencesQuery(variables: SchemaTypes.OrganizationPreferencesQueryVariables) {
  return { query: OrganizationPreferencesDocument, variables: variables };
}

export const UpdatePreferenceOnOrganizationDocument = gql`
  mutation updatePreferenceOnOrganization($preferenceData: UpdateOrganizationPreferenceInput!) {
    updatePreferenceOnOrganization(preferenceData: $preferenceData) {
      id
      value
    }
  }
`;
export type UpdatePreferenceOnOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferenceOnOrganizationMutation,
  SchemaTypes.UpdatePreferenceOnOrganizationMutationVariables
>;

/**
 * __useUpdatePreferenceOnOrganizationMutation__
 *
 * To run a mutation, you first call `useUpdatePreferenceOnOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferenceOnOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferenceOnOrganizationMutation, { data, loading, error }] = useUpdatePreferenceOnOrganizationMutation({
 *   variables: {
 *      preferenceData: // value for 'preferenceData'
 *   },
 * });
 */
export function useUpdatePreferenceOnOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferenceOnOrganizationMutation,
    SchemaTypes.UpdatePreferenceOnOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdatePreferenceOnOrganizationMutation,
    SchemaTypes.UpdatePreferenceOnOrganizationMutationVariables
  >(UpdatePreferenceOnOrganizationDocument, options);
}

export type UpdatePreferenceOnOrganizationMutationHookResult = ReturnType<
  typeof useUpdatePreferenceOnOrganizationMutation
>;
export type UpdatePreferenceOnOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdatePreferenceOnOrganizationMutation>;
export type UpdatePreferenceOnOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferenceOnOrganizationMutation,
  SchemaTypes.UpdatePreferenceOnOrganizationMutationVariables
>;
export const SpacePreferencesDocument = gql`
  query spacePreferences($spaceNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      preferences {
        id
        value
        definition {
          id
          description
          displayName
          group
          type
          valueType
        }
      }
    }
  }
`;

/**
 * __useSpacePreferencesQuery__
 *
 * To run a query within a React component, call `useSpacePreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePreferencesQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *   },
 * });
 */
export function useSpacePreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePreferencesQuery, SchemaTypes.SpacePreferencesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePreferencesQuery, SchemaTypes.SpacePreferencesQueryVariables>(
    SpacePreferencesDocument,
    options
  );
}

export function useSpacePreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePreferencesQuery,
    SchemaTypes.SpacePreferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePreferencesQuery, SchemaTypes.SpacePreferencesQueryVariables>(
    SpacePreferencesDocument,
    options
  );
}

export type SpacePreferencesQueryHookResult = ReturnType<typeof useSpacePreferencesQuery>;
export type SpacePreferencesLazyQueryHookResult = ReturnType<typeof useSpacePreferencesLazyQuery>;
export type SpacePreferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePreferencesQuery,
  SchemaTypes.SpacePreferencesQueryVariables
>;
export function refetchSpacePreferencesQuery(variables: SchemaTypes.SpacePreferencesQueryVariables) {
  return { query: SpacePreferencesDocument, variables: variables };
}

export const UpdatePreferenceOnSpaceDocument = gql`
  mutation updatePreferenceOnSpace($preferenceData: UpdateSpacePreferenceInput!) {
    updatePreferenceOnSpace(preferenceData: $preferenceData) {
      id
      value
    }
  }
`;
export type UpdatePreferenceOnSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferenceOnSpaceMutation,
  SchemaTypes.UpdatePreferenceOnSpaceMutationVariables
>;

/**
 * __useUpdatePreferenceOnSpaceMutation__
 *
 * To run a mutation, you first call `useUpdatePreferenceOnSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferenceOnSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferenceOnSpaceMutation, { data, loading, error }] = useUpdatePreferenceOnSpaceMutation({
 *   variables: {
 *      preferenceData: // value for 'preferenceData'
 *   },
 * });
 */
export function useUpdatePreferenceOnSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferenceOnSpaceMutation,
    SchemaTypes.UpdatePreferenceOnSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdatePreferenceOnSpaceMutation,
    SchemaTypes.UpdatePreferenceOnSpaceMutationVariables
  >(UpdatePreferenceOnSpaceDocument, options);
}

export type UpdatePreferenceOnSpaceMutationHookResult = ReturnType<typeof useUpdatePreferenceOnSpaceMutation>;
export type UpdatePreferenceOnSpaceMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePreferenceOnSpaceMutation>;
export type UpdatePreferenceOnSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferenceOnSpaceMutation,
  SchemaTypes.UpdatePreferenceOnSpaceMutationVariables
>;
export const CreateReferenceOnProfileDocument = gql`
  mutation createReferenceOnProfile($input: CreateReferenceOnProfileInput!) {
    createReferenceOnProfile(referenceInput: $input) {
      ...ReferenceDetails
    }
  }
  ${ReferenceDetailsFragmentDoc}
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
export const CreateTagsetOnProfileDocument = gql`
  mutation createTagsetOnProfile($input: CreateTagsetOnProfileInput!) {
    createTagsetOnProfile(tagsetData: $input) {
      ...TagsetDetails
    }
  }
  ${TagsetDetailsFragmentDoc}
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
export const UploadVisualDocument = gql`
  mutation uploadVisual($file: Upload!, $uploadData: VisualUploadImageInput!) {
    uploadImageOnVisual(file: $file, uploadData: $uploadData) {
      id
      uri
      alternativeText
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
export const AuthorDetailsDocument = gql`
  query authorDetails($ids: [UUID!]!) {
    users(IDs: $ids) {
      ...UserCard
      firstName
      lastName
    }
  }
  ${UserCardFragmentDoc}
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

export const LatestReleaseDiscussionDocument = gql`
  query latestReleaseDiscussion {
    platform {
      id
      latestReleaseDiscussion {
        id
        nameID
      }
    }
  }
`;

/**
 * __useLatestReleaseDiscussionQuery__
 *
 * To run a query within a React component, call `useLatestReleaseDiscussionQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestReleaseDiscussionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestReleaseDiscussionQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestReleaseDiscussionQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.LatestReleaseDiscussionQuery,
    SchemaTypes.LatestReleaseDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.LatestReleaseDiscussionQuery, SchemaTypes.LatestReleaseDiscussionQueryVariables>(
    LatestReleaseDiscussionDocument,
    options
  );
}

export function useLatestReleaseDiscussionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.LatestReleaseDiscussionQuery,
    SchemaTypes.LatestReleaseDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.LatestReleaseDiscussionQuery,
    SchemaTypes.LatestReleaseDiscussionQueryVariables
  >(LatestReleaseDiscussionDocument, options);
}

export type LatestReleaseDiscussionQueryHookResult = ReturnType<typeof useLatestReleaseDiscussionQuery>;
export type LatestReleaseDiscussionLazyQueryHookResult = ReturnType<typeof useLatestReleaseDiscussionLazyQuery>;
export type LatestReleaseDiscussionQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestReleaseDiscussionQuery,
  SchemaTypes.LatestReleaseDiscussionQueryVariables
>;
export function refetchLatestReleaseDiscussionQuery(variables?: SchemaTypes.LatestReleaseDiscussionQueryVariables) {
  return { query: LatestReleaseDiscussionDocument, variables: variables };
}

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
export const UpdateDiscussionDocument = gql`
  mutation updateDiscussion($input: UpdateDiscussionInput!) {
    updateDiscussion(updateData: $input) {
      ...DiscussionDetails
    }
  }
  ${DiscussionDetailsFragmentDoc}
`;
export type UpdateDiscussionMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateDiscussionMutation,
  SchemaTypes.UpdateDiscussionMutationVariables
>;

/**
 * __useUpdateDiscussionMutation__
 *
 * To run a mutation, you first call `useUpdateDiscussionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDiscussionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDiscussionMutation, { data, loading, error }] = useUpdateDiscussionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDiscussionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateDiscussionMutation,
    SchemaTypes.UpdateDiscussionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateDiscussionMutation, SchemaTypes.UpdateDiscussionMutationVariables>(
    UpdateDiscussionDocument,
    options
  );
}

export type UpdateDiscussionMutationHookResult = ReturnType<typeof useUpdateDiscussionMutation>;
export type UpdateDiscussionMutationResult = Apollo.MutationResult<SchemaTypes.UpdateDiscussionMutation>;
export type UpdateDiscussionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateDiscussionMutation,
  SchemaTypes.UpdateDiscussionMutationVariables
>;
export const DeleteDiscussionDocument = gql`
  mutation deleteDiscussion($deleteData: DeleteDiscussionInput!) {
    deleteDiscussion(deleteData: $deleteData) {
      id
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
export const PlatformDiscussionsDocument = gql`
  query platformDiscussions {
    platform {
      id
      communication {
        id
        discussionCategories
        authorization {
          id
          myPrivileges
          anonymousReadAccess
        }
        discussions {
          ...DiscussionCard
        }
      }
    }
  }
  ${DiscussionCardFragmentDoc}
`;

/**
 * __usePlatformDiscussionsQuery__
 *
 * To run a query within a React component, call `usePlatformDiscussionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformDiscussionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformDiscussionsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformDiscussionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformDiscussionsQuery,
    SchemaTypes.PlatformDiscussionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformDiscussionsQuery, SchemaTypes.PlatformDiscussionsQueryVariables>(
    PlatformDiscussionsDocument,
    options
  );
}

export function usePlatformDiscussionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformDiscussionsQuery,
    SchemaTypes.PlatformDiscussionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformDiscussionsQuery, SchemaTypes.PlatformDiscussionsQueryVariables>(
    PlatformDiscussionsDocument,
    options
  );
}

export type PlatformDiscussionsQueryHookResult = ReturnType<typeof usePlatformDiscussionsQuery>;
export type PlatformDiscussionsLazyQueryHookResult = ReturnType<typeof usePlatformDiscussionsLazyQuery>;
export type PlatformDiscussionsQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformDiscussionsQuery,
  SchemaTypes.PlatformDiscussionsQueryVariables
>;
export function refetchPlatformDiscussionsQuery(variables?: SchemaTypes.PlatformDiscussionsQueryVariables) {
  return { query: PlatformDiscussionsDocument, variables: variables };
}

export const PlatformDiscussionDocument = gql`
  query platformDiscussion($discussionId: String!) {
    platform {
      id
      communication {
        id
        authorization {
          id
          myPrivileges
          anonymousReadAccess
        }
        discussion(ID: $discussionId) {
          ...DiscussionDetails
        }
      }
    }
  }
  ${DiscussionDetailsFragmentDoc}
`;

/**
 * __usePlatformDiscussionQuery__
 *
 * To run a query within a React component, call `usePlatformDiscussionQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformDiscussionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformDiscussionQuery({
 *   variables: {
 *      discussionId: // value for 'discussionId'
 *   },
 * });
 */
export function usePlatformDiscussionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformDiscussionQuery,
    SchemaTypes.PlatformDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformDiscussionQuery, SchemaTypes.PlatformDiscussionQueryVariables>(
    PlatformDiscussionDocument,
    options
  );
}

export function usePlatformDiscussionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformDiscussionQuery,
    SchemaTypes.PlatformDiscussionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformDiscussionQuery, SchemaTypes.PlatformDiscussionQueryVariables>(
    PlatformDiscussionDocument,
    options
  );
}

export type PlatformDiscussionQueryHookResult = ReturnType<typeof usePlatformDiscussionQuery>;
export type PlatformDiscussionLazyQueryHookResult = ReturnType<typeof usePlatformDiscussionLazyQuery>;
export type PlatformDiscussionQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformDiscussionQuery,
  SchemaTypes.PlatformDiscussionQueryVariables
>;
export function refetchPlatformDiscussionQuery(variables: SchemaTypes.PlatformDiscussionQueryVariables) {
  return { query: PlatformDiscussionDocument, variables: variables };
}

export const CommunicationDiscussionUpdatedDocument = gql`
  subscription communicationDiscussionUpdated($communicationID: UUID!) {
    communicationDiscussionUpdated(communicationID: $communicationID) {
      id
      nameID
      profile {
        id
        displayName
        description
        tagline
        visuals {
          ...VisualFull
        }
      }
      createdBy
      timestamp
      category
      comments {
        id
        messagesCount
      }
    }
  }
  ${VisualFullFragmentDoc}
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
export const SendMessageToUserDocument = gql`
  mutation sendMessageToUser($messageData: CommunicationSendMessageToUserInput!) {
    sendMessageToUser(messageData: $messageData)
  }
`;
export type SendMessageToUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.SendMessageToUserMutation,
  SchemaTypes.SendMessageToUserMutationVariables
>;

/**
 * __useSendMessageToUserMutation__
 *
 * To run a mutation, you first call `useSendMessageToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageToUserMutation, { data, loading, error }] = useSendMessageToUserMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useSendMessageToUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SendMessageToUserMutation,
    SchemaTypes.SendMessageToUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.SendMessageToUserMutation, SchemaTypes.SendMessageToUserMutationVariables>(
    SendMessageToUserDocument,
    options
  );
}

export type SendMessageToUserMutationHookResult = ReturnType<typeof useSendMessageToUserMutation>;
export type SendMessageToUserMutationResult = Apollo.MutationResult<SchemaTypes.SendMessageToUserMutation>;
export type SendMessageToUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SendMessageToUserMutation,
  SchemaTypes.SendMessageToUserMutationVariables
>;
export const SendMessageToOrganizationDocument = gql`
  mutation sendMessageToOrganization($messageData: CommunicationSendMessageToOrganizationInput!) {
    sendMessageToOrganization(messageData: $messageData)
  }
`;
export type SendMessageToOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.SendMessageToOrganizationMutation,
  SchemaTypes.SendMessageToOrganizationMutationVariables
>;

/**
 * __useSendMessageToOrganizationMutation__
 *
 * To run a mutation, you first call `useSendMessageToOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageToOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageToOrganizationMutation, { data, loading, error }] = useSendMessageToOrganizationMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useSendMessageToOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SendMessageToOrganizationMutation,
    SchemaTypes.SendMessageToOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SendMessageToOrganizationMutation,
    SchemaTypes.SendMessageToOrganizationMutationVariables
  >(SendMessageToOrganizationDocument, options);
}

export type SendMessageToOrganizationMutationHookResult = ReturnType<typeof useSendMessageToOrganizationMutation>;
export type SendMessageToOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.SendMessageToOrganizationMutation>;
export type SendMessageToOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SendMessageToOrganizationMutation,
  SchemaTypes.SendMessageToOrganizationMutationVariables
>;
export const SendMessageToCommunityLeadsDocument = gql`
  mutation sendMessageToCommunityLeads($messageData: CommunicationSendMessageToCommunityLeadsInput!) {
    sendMessageToCommunityLeads(messageData: $messageData)
  }
`;
export type SendMessageToCommunityLeadsMutationFn = Apollo.MutationFunction<
  SchemaTypes.SendMessageToCommunityLeadsMutation,
  SchemaTypes.SendMessageToCommunityLeadsMutationVariables
>;

/**
 * __useSendMessageToCommunityLeadsMutation__
 *
 * To run a mutation, you first call `useSendMessageToCommunityLeadsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageToCommunityLeadsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageToCommunityLeadsMutation, { data, loading, error }] = useSendMessageToCommunityLeadsMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useSendMessageToCommunityLeadsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SendMessageToCommunityLeadsMutation,
    SchemaTypes.SendMessageToCommunityLeadsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.SendMessageToCommunityLeadsMutation,
    SchemaTypes.SendMessageToCommunityLeadsMutationVariables
  >(SendMessageToCommunityLeadsDocument, options);
}

export type SendMessageToCommunityLeadsMutationHookResult = ReturnType<typeof useSendMessageToCommunityLeadsMutation>;
export type SendMessageToCommunityLeadsMutationResult =
  Apollo.MutationResult<SchemaTypes.SendMessageToCommunityLeadsMutation>;
export type SendMessageToCommunityLeadsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SendMessageToCommunityLeadsMutation,
  SchemaTypes.SendMessageToCommunityLeadsMutationVariables
>;
export const AddReactionDocument = gql`
  mutation AddReaction($roomId: UUID!, $messageId: MessageID!, $emoji: Emoji!) {
    addReactionToMessageInRoom(reactionData: { emoji: $emoji, messageID: $messageId, roomID: $roomId }) {
      id
      emoji
      sender {
        id
        firstName
        lastName
      }
    }
  }
`;
export type AddReactionMutationFn = Apollo.MutationFunction<
  SchemaTypes.AddReactionMutation,
  SchemaTypes.AddReactionMutationVariables
>;

/**
 * __useAddReactionMutation__
 *
 * To run a mutation, you first call `useAddReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addReactionMutation, { data, loading, error }] = useAddReactionMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      messageId: // value for 'messageId'
 *      emoji: // value for 'emoji'
 *   },
 * });
 */
export function useAddReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.AddReactionMutation, SchemaTypes.AddReactionMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.AddReactionMutation, SchemaTypes.AddReactionMutationVariables>(
    AddReactionDocument,
    options
  );
}

export type AddReactionMutationHookResult = ReturnType<typeof useAddReactionMutation>;
export type AddReactionMutationResult = Apollo.MutationResult<SchemaTypes.AddReactionMutation>;
export type AddReactionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AddReactionMutation,
  SchemaTypes.AddReactionMutationVariables
>;
export const RemoveReactionDocument = gql`
  mutation RemoveReaction($roomId: UUID!, $reactionId: MessageID!) {
    removeReactionToMessageInRoom(reactionData: { reactionID: $reactionId, roomID: $roomId })
  }
`;
export type RemoveReactionMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveReactionMutation,
  SchemaTypes.RemoveReactionMutationVariables
>;

/**
 * __useRemoveReactionMutation__
 *
 * To run a mutation, you first call `useRemoveReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeReactionMutation, { data, loading, error }] = useRemoveReactionMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      reactionId: // value for 'reactionId'
 *   },
 * });
 */
export function useRemoveReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveReactionMutation,
    SchemaTypes.RemoveReactionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RemoveReactionMutation, SchemaTypes.RemoveReactionMutationVariables>(
    RemoveReactionDocument,
    options
  );
}

export type RemoveReactionMutationHookResult = ReturnType<typeof useRemoveReactionMutation>;
export type RemoveReactionMutationResult = Apollo.MutationResult<SchemaTypes.RemoveReactionMutation>;
export type RemoveReactionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveReactionMutation,
  SchemaTypes.RemoveReactionMutationVariables
>;
export const ReplyToMessageDocument = gql`
  mutation ReplyToMessage($roomId: UUID!, $message: String!, $threadId: MessageID!) {
    sendMessageReplyToRoom(messageData: { roomID: $roomId, threadID: $threadId, message: $message }) {
      id
      message
      sender {
        ... on User {
          id
        }
        ... on VirtualContributor {
          id
        }
      }
      timestamp
    }
  }
`;
export type ReplyToMessageMutationFn = Apollo.MutationFunction<
  SchemaTypes.ReplyToMessageMutation,
  SchemaTypes.ReplyToMessageMutationVariables
>;

/**
 * __useReplyToMessageMutation__
 *
 * To run a mutation, you first call `useReplyToMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReplyToMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [replyToMessageMutation, { data, loading, error }] = useReplyToMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      message: // value for 'message'
 *      threadId: // value for 'threadId'
 *   },
 * });
 */
export function useReplyToMessageMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ReplyToMessageMutation,
    SchemaTypes.ReplyToMessageMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.ReplyToMessageMutation, SchemaTypes.ReplyToMessageMutationVariables>(
    ReplyToMessageDocument,
    options
  );
}

export type ReplyToMessageMutationHookResult = ReturnType<typeof useReplyToMessageMutation>;
export type ReplyToMessageMutationResult = Apollo.MutationResult<SchemaTypes.ReplyToMessageMutation>;
export type ReplyToMessageMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ReplyToMessageMutation,
  SchemaTypes.ReplyToMessageMutationVariables
>;
export const MentionableUsersDocument = gql`
  query MentionableUsers($filter: UserFilterInput, $first: Int, $communityId: UUID!) {
    usersPaginated(filter: $filter, first: $first) {
      users {
        id
        profile {
          id
          url
          displayName
          location {
            id
            city
            country
          }
          avatar: visual(type: AVATAR) {
            ...VisualUri
          }
        }
      }
    }
    lookup {
      community(ID: $communityId) {
        virtualContributorsInRole(role: MEMBER) {
          id
          profile {
            id
            url
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualUri
            }
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useMentionableUsersQuery__
 *
 * To run a query within a React component, call `useMentionableUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useMentionableUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMentionableUsersQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useMentionableUsersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MentionableUsersQuery, SchemaTypes.MentionableUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MentionableUsersQuery, SchemaTypes.MentionableUsersQueryVariables>(
    MentionableUsersDocument,
    options
  );
}

export function useMentionableUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MentionableUsersQuery,
    SchemaTypes.MentionableUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MentionableUsersQuery, SchemaTypes.MentionableUsersQueryVariables>(
    MentionableUsersDocument,
    options
  );
}

export type MentionableUsersQueryHookResult = ReturnType<typeof useMentionableUsersQuery>;
export type MentionableUsersLazyQueryHookResult = ReturnType<typeof useMentionableUsersLazyQuery>;
export type MentionableUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.MentionableUsersQuery,
  SchemaTypes.MentionableUsersQueryVariables
>;
export function refetchMentionableUsersQuery(variables: SchemaTypes.MentionableUsersQueryVariables) {
  return { query: MentionableUsersDocument, variables: variables };
}

export const SendMessageToRoomDocument = gql`
  mutation sendMessageToRoom($messageData: RoomSendMessageInput!) {
    sendMessageToRoom(messageData: $messageData) {
      id
      message
      sender {
        ... on User {
          id
        }
        ... on VirtualContributor {
          id
        }
      }
      timestamp
    }
  }
`;
export type SendMessageToRoomMutationFn = Apollo.MutationFunction<
  SchemaTypes.SendMessageToRoomMutation,
  SchemaTypes.SendMessageToRoomMutationVariables
>;

/**
 * __useSendMessageToRoomMutation__
 *
 * To run a mutation, you first call `useSendMessageToRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageToRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageToRoomMutation, { data, loading, error }] = useSendMessageToRoomMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useSendMessageToRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.SendMessageToRoomMutation,
    SchemaTypes.SendMessageToRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.SendMessageToRoomMutation, SchemaTypes.SendMessageToRoomMutationVariables>(
    SendMessageToRoomDocument,
    options
  );
}

export type SendMessageToRoomMutationHookResult = ReturnType<typeof useSendMessageToRoomMutation>;
export type SendMessageToRoomMutationResult = Apollo.MutationResult<SchemaTypes.SendMessageToRoomMutation>;
export type SendMessageToRoomMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.SendMessageToRoomMutation,
  SchemaTypes.SendMessageToRoomMutationVariables
>;
export const RemoveMessageOnRoomDocument = gql`
  mutation removeMessageOnRoom($messageData: RoomRemoveMessageInput!) {
    removeMessageOnRoom(messageData: $messageData)
  }
`;
export type RemoveMessageOnRoomMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveMessageOnRoomMutation,
  SchemaTypes.RemoveMessageOnRoomMutationVariables
>;

/**
 * __useRemoveMessageOnRoomMutation__
 *
 * To run a mutation, you first call `useRemoveMessageOnRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMessageOnRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMessageOnRoomMutation, { data, loading, error }] = useRemoveMessageOnRoomMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useRemoveMessageOnRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveMessageOnRoomMutation,
    SchemaTypes.RemoveMessageOnRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RemoveMessageOnRoomMutation, SchemaTypes.RemoveMessageOnRoomMutationVariables>(
    RemoveMessageOnRoomDocument,
    options
  );
}

export type RemoveMessageOnRoomMutationHookResult = ReturnType<typeof useRemoveMessageOnRoomMutation>;
export type RemoveMessageOnRoomMutationResult = Apollo.MutationResult<SchemaTypes.RemoveMessageOnRoomMutation>;
export type RemoveMessageOnRoomMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveMessageOnRoomMutation,
  SchemaTypes.RemoveMessageOnRoomMutationVariables
>;
export const RoomEventsDocument = gql`
  subscription roomEvents($roomID: UUID!) {
    roomEvents(roomID: $roomID) {
      roomID
      message {
        type
        data {
          ...MessageDetails
        }
      }
      reaction {
        type
        messageID
        data {
          ...ReactionDetails
        }
      }
    }
  }
  ${MessageDetailsFragmentDoc}
  ${ReactionDetailsFragmentDoc}
`;

/**
 * __useRoomEventsSubscription__
 *
 * To run a query within a React component, call `useRoomEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useRoomEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoomEventsSubscription({
 *   variables: {
 *      roomID: // value for 'roomID'
 *   },
 * });
 */
export function useRoomEventsSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.RoomEventsSubscription,
    SchemaTypes.RoomEventsSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<SchemaTypes.RoomEventsSubscription, SchemaTypes.RoomEventsSubscriptionVariables>(
    RoomEventsDocument,
    options
  );
}

export type RoomEventsSubscriptionHookResult = ReturnType<typeof useRoomEventsSubscription>;
export type RoomEventsSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.RoomEventsSubscription>;
export const CommunityUpdatesDocument = gql`
  query communityUpdates($communityId: UUID!) {
    lookup {
      community(ID: $communityId) {
        id
        communication {
          id
          updates {
            id
            messages {
              id
              ...MessageDetails
            }
            messagesCount
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

export const PlatformUpdatesRoomDocument = gql`
  query platformUpdatesRoom {
    platform {
      id
      communication {
        id
        updates {
          id
        }
      }
    }
  }
`;

/**
 * __usePlatformUpdatesRoomQuery__
 *
 * To run a query within a React component, call `usePlatformUpdatesRoomQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformUpdatesRoomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformUpdatesRoomQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformUpdatesRoomQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformUpdatesRoomQuery,
    SchemaTypes.PlatformUpdatesRoomQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformUpdatesRoomQuery, SchemaTypes.PlatformUpdatesRoomQueryVariables>(
    PlatformUpdatesRoomDocument,
    options
  );
}

export function usePlatformUpdatesRoomLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformUpdatesRoomQuery,
    SchemaTypes.PlatformUpdatesRoomQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformUpdatesRoomQuery, SchemaTypes.PlatformUpdatesRoomQueryVariables>(
    PlatformUpdatesRoomDocument,
    options
  );
}

export type PlatformUpdatesRoomQueryHookResult = ReturnType<typeof usePlatformUpdatesRoomQuery>;
export type PlatformUpdatesRoomLazyQueryHookResult = ReturnType<typeof usePlatformUpdatesRoomLazyQuery>;
export type PlatformUpdatesRoomQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformUpdatesRoomQuery,
  SchemaTypes.PlatformUpdatesRoomQueryVariables
>;
export function refetchPlatformUpdatesRoomQuery(variables?: SchemaTypes.PlatformUpdatesRoomQueryVariables) {
  return { query: PlatformUpdatesRoomDocument, variables: variables };
}

export const ChallengeApplicationDocument = gql`
  query challengeApplication($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          id
          url
          displayName
        }
        community {
          id
          guidelines {
            ...CommunityGuidelinesDetails
          }
        }
      }
    }
  }
  ${CommunityGuidelinesDetailsFragmentDoc}
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

export const CommunityUserPrivilegesWithParentCommunityDocument = gql`
  query communityUserPrivilegesWithParentCommunity(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpaceCommunity: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpaceCommunity) {
      id
      community {
        id
        myMembershipStatus
        authorization {
          id
          myPrivileges
        }
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        profile {
          id
          url
        }
        authorization {
          id
          myPrivileges
        }
        community {
          id
          myMembershipStatus
          authorization {
            id
            myPrivileges
          }
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        authorization {
          id
          myPrivileges
        }
        community {
          id
          myMembershipStatus
          authorization {
            id
            myPrivileges
          }
          leadUsers: usersInRole(role: LEAD) {
            id
            profile {
              id
              displayName
              avatar: visual(type: AVATAR) {
                ...VisualUri
              }
              location {
                id
                country
                city
              }
            }
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useCommunityUserPrivilegesWithParentCommunityQuery__
 *
 * To run a query within a React component, call `useCommunityUserPrivilegesWithParentCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityUserPrivilegesWithParentCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityUserPrivilegesWithParentCommunityQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      includeSpaceCommunity: // value for 'includeSpaceCommunity'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useCommunityUserPrivilegesWithParentCommunityQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQuery,
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQuery,
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
  >(CommunityUserPrivilegesWithParentCommunityDocument, options);
}

export function useCommunityUserPrivilegesWithParentCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQuery,
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQuery,
    SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
  >(CommunityUserPrivilegesWithParentCommunityDocument, options);
}

export type CommunityUserPrivilegesWithParentCommunityQueryHookResult = ReturnType<
  typeof useCommunityUserPrivilegesWithParentCommunityQuery
>;
export type CommunityUserPrivilegesWithParentCommunityLazyQueryHookResult = ReturnType<
  typeof useCommunityUserPrivilegesWithParentCommunityLazyQuery
>;
export type CommunityUserPrivilegesWithParentCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityUserPrivilegesWithParentCommunityQuery,
  SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
>;
export function refetchCommunityUserPrivilegesWithParentCommunityQuery(
  variables?: SchemaTypes.CommunityUserPrivilegesWithParentCommunityQueryVariables
) {
  return { query: CommunityUserPrivilegesWithParentCommunityDocument, variables: variables };
}

export const CommunityUserPrivilegesDocument = gql`
  query communityUserPrivileges($spaceNameId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceNameId) {
      id
      spaceCommunity: community {
        id
        myMembershipStatus
        authorization {
          id
          myPrivileges
        }
      }
    }
    lookup {
      applicationCommunity: community(ID: $communityId) {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
`;

/**
 * __useCommunityUserPrivilegesQuery__
 *
 * To run a query within a React component, call `useCommunityUserPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityUserPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityUserPrivilegesQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityUserPrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityUserPrivilegesQuery,
    SchemaTypes.CommunityUserPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityUserPrivilegesQuery, SchemaTypes.CommunityUserPrivilegesQueryVariables>(
    CommunityUserPrivilegesDocument,
    options
  );
}

export function useCommunityUserPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityUserPrivilegesQuery,
    SchemaTypes.CommunityUserPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityUserPrivilegesQuery,
    SchemaTypes.CommunityUserPrivilegesQueryVariables
  >(CommunityUserPrivilegesDocument, options);
}

export type CommunityUserPrivilegesQueryHookResult = ReturnType<typeof useCommunityUserPrivilegesQuery>;
export type CommunityUserPrivilegesLazyQueryHookResult = ReturnType<typeof useCommunityUserPrivilegesLazyQuery>;
export type CommunityUserPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityUserPrivilegesQuery,
  SchemaTypes.CommunityUserPrivilegesQueryVariables
>;
export function refetchCommunityUserPrivilegesQuery(variables: SchemaTypes.CommunityUserPrivilegesQueryVariables) {
  return { query: CommunityUserPrivilegesDocument, variables: variables };
}

export const JoinCommunityDocument = gql`
  mutation joinCommunity($joiningData: CommunityJoinInput!) {
    joinCommunity(joinCommunityData: $joiningData) {
      id
    }
  }
`;
export type JoinCommunityMutationFn = Apollo.MutationFunction<
  SchemaTypes.JoinCommunityMutation,
  SchemaTypes.JoinCommunityMutationVariables
>;

/**
 * __useJoinCommunityMutation__
 *
 * To run a mutation, you first call `useJoinCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinCommunityMutation, { data, loading, error }] = useJoinCommunityMutation({
 *   variables: {
 *      joiningData: // value for 'joiningData'
 *   },
 * });
 */
export function useJoinCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.JoinCommunityMutation,
    SchemaTypes.JoinCommunityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.JoinCommunityMutation, SchemaTypes.JoinCommunityMutationVariables>(
    JoinCommunityDocument,
    options
  );
}

export type JoinCommunityMutationHookResult = ReturnType<typeof useJoinCommunityMutation>;
export type JoinCommunityMutationResult = Apollo.MutationResult<SchemaTypes.JoinCommunityMutation>;
export type JoinCommunityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.JoinCommunityMutation,
  SchemaTypes.JoinCommunityMutationVariables
>;
export const SpaceApplicationDocument = gql`
  query spaceApplication($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        url
        displayName
      }
      community {
        id
        guidelines {
          ...CommunityGuidelinesDetails
        }
      }
    }
  }
  ${CommunityGuidelinesDetailsFragmentDoc}
`;

/**
 * __useSpaceApplicationQuery__
 *
 * To run a query within a React component, call `useSpaceApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceApplicationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceApplicationQuery, SchemaTypes.SpaceApplicationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceApplicationQuery, SchemaTypes.SpaceApplicationQueryVariables>(
    SpaceApplicationDocument,
    options
  );
}

export function useSpaceApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceApplicationQuery,
    SchemaTypes.SpaceApplicationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceApplicationQuery, SchemaTypes.SpaceApplicationQueryVariables>(
    SpaceApplicationDocument,
    options
  );
}

export type SpaceApplicationQueryHookResult = ReturnType<typeof useSpaceApplicationQuery>;
export type SpaceApplicationLazyQueryHookResult = ReturnType<typeof useSpaceApplicationLazyQuery>;
export type SpaceApplicationQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceApplicationQuery,
  SchemaTypes.SpaceApplicationQueryVariables
>;
export function refetchSpaceApplicationQuery(variables: SchemaTypes.SpaceApplicationQueryVariables) {
  return { query: SpaceApplicationDocument, variables: variables };
}

export const ApplyForCommunityMembershipDocument = gql`
  mutation applyForCommunityMembership($input: CommunityApplyInput!) {
    applyForCommunityMembership(applicationData: $input) {
      id
    }
  }
`;
export type ApplyForCommunityMembershipMutationFn = Apollo.MutationFunction<
  SchemaTypes.ApplyForCommunityMembershipMutation,
  SchemaTypes.ApplyForCommunityMembershipMutationVariables
>;

/**
 * __useApplyForCommunityMembershipMutation__
 *
 * To run a mutation, you first call `useApplyForCommunityMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApplyForCommunityMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [applyForCommunityMembershipMutation, { data, loading, error }] = useApplyForCommunityMembershipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useApplyForCommunityMembershipMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ApplyForCommunityMembershipMutation,
    SchemaTypes.ApplyForCommunityMembershipMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.ApplyForCommunityMembershipMutation,
    SchemaTypes.ApplyForCommunityMembershipMutationVariables
  >(ApplyForCommunityMembershipDocument, options);
}

export type ApplyForCommunityMembershipMutationHookResult = ReturnType<typeof useApplyForCommunityMembershipMutation>;
export type ApplyForCommunityMembershipMutationResult =
  Apollo.MutationResult<SchemaTypes.ApplyForCommunityMembershipMutation>;
export type ApplyForCommunityMembershipMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ApplyForCommunityMembershipMutation,
  SchemaTypes.ApplyForCommunityMembershipMutationVariables
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
export const CommunityApplicationsInvitationsDocument = gql`
  query CommunityApplicationsInvitations($communityId: UUID!) {
    lookup {
      community(ID: $communityId) {
        id
        applications {
          ...AdminCommunityApplication
        }
        invitations {
          ...AdminCommunityInvitation
        }
        invitationsExternal {
          ...AdminCommunityInvitationExternal
        }
      }
    }
  }
  ${AdminCommunityApplicationFragmentDoc}
  ${AdminCommunityInvitationFragmentDoc}
  ${AdminCommunityInvitationExternalFragmentDoc}
`;

/**
 * __useCommunityApplicationsInvitationsQuery__
 *
 * To run a query within a React component, call `useCommunityApplicationsInvitationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityApplicationsInvitationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityApplicationsInvitationsQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityApplicationsInvitationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityApplicationsInvitationsQuery,
    SchemaTypes.CommunityApplicationsInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CommunityApplicationsInvitationsQuery,
    SchemaTypes.CommunityApplicationsInvitationsQueryVariables
  >(CommunityApplicationsInvitationsDocument, options);
}

export function useCommunityApplicationsInvitationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityApplicationsInvitationsQuery,
    SchemaTypes.CommunityApplicationsInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityApplicationsInvitationsQuery,
    SchemaTypes.CommunityApplicationsInvitationsQueryVariables
  >(CommunityApplicationsInvitationsDocument, options);
}

export type CommunityApplicationsInvitationsQueryHookResult = ReturnType<
  typeof useCommunityApplicationsInvitationsQuery
>;
export type CommunityApplicationsInvitationsLazyQueryHookResult = ReturnType<
  typeof useCommunityApplicationsInvitationsLazyQuery
>;
export type CommunityApplicationsInvitationsQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityApplicationsInvitationsQuery,
  SchemaTypes.CommunityApplicationsInvitationsQueryVariables
>;
export function refetchCommunityApplicationsInvitationsQuery(
  variables: SchemaTypes.CommunityApplicationsInvitationsQueryVariables
) {
  return { query: CommunityApplicationsInvitationsDocument, variables: variables };
}

export const CommunityApplicationFormDocument = gql`
  query CommunityApplicationForm(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $isSpace: Boolean = false
    $isChallenge: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $isSpace) {
      id
      community {
        id
        applicationForm {
          ...ApplicationForm
        }
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $isChallenge) {
        community {
          id
          applicationForm {
            ...ApplicationForm
          }
        }
      }
    }
  }
  ${ApplicationFormFragmentDoc}
`;

/**
 * __useCommunityApplicationFormQuery__
 *
 * To run a query within a React component, call `useCommunityApplicationFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityApplicationFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityApplicationFormQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      isSpace: // value for 'isSpace'
 *      isChallenge: // value for 'isChallenge'
 *   },
 * });
 */
export function useCommunityApplicationFormQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CommunityApplicationFormQuery,
    SchemaTypes.CommunityApplicationFormQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityApplicationFormQuery, SchemaTypes.CommunityApplicationFormQueryVariables>(
    CommunityApplicationFormDocument,
    options
  );
}

export function useCommunityApplicationFormLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityApplicationFormQuery,
    SchemaTypes.CommunityApplicationFormQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityApplicationFormQuery,
    SchemaTypes.CommunityApplicationFormQueryVariables
  >(CommunityApplicationFormDocument, options);
}

export type CommunityApplicationFormQueryHookResult = ReturnType<typeof useCommunityApplicationFormQuery>;
export type CommunityApplicationFormLazyQueryHookResult = ReturnType<typeof useCommunityApplicationFormLazyQuery>;
export type CommunityApplicationFormQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityApplicationFormQuery,
  SchemaTypes.CommunityApplicationFormQueryVariables
>;
export function refetchCommunityApplicationFormQuery(variables?: SchemaTypes.CommunityApplicationFormQueryVariables) {
  return { query: CommunityApplicationFormDocument, variables: variables };
}

export const UpdateCommunityApplicationQuestionsDocument = gql`
  mutation updateCommunityApplicationQuestions($communityId: UUID!, $formData: UpdateFormInput!) {
    updateCommunityApplicationForm(applicationFormData: { communityID: $communityId, formData: $formData }) {
      id
    }
  }
`;
export type UpdateCommunityApplicationQuestionsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCommunityApplicationQuestionsMutation,
  SchemaTypes.UpdateCommunityApplicationQuestionsMutationVariables
>;

/**
 * __useUpdateCommunityApplicationQuestionsMutation__
 *
 * To run a mutation, you first call `useUpdateCommunityApplicationQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommunityApplicationQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommunityApplicationQuestionsMutation, { data, loading, error }] = useUpdateCommunityApplicationQuestionsMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      formData: // value for 'formData'
 *   },
 * });
 */
export function useUpdateCommunityApplicationQuestionsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCommunityApplicationQuestionsMutation,
    SchemaTypes.UpdateCommunityApplicationQuestionsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCommunityApplicationQuestionsMutation,
    SchemaTypes.UpdateCommunityApplicationQuestionsMutationVariables
  >(UpdateCommunityApplicationQuestionsDocument, options);
}

export type UpdateCommunityApplicationQuestionsMutationHookResult = ReturnType<
  typeof useUpdateCommunityApplicationQuestionsMutation
>;
export type UpdateCommunityApplicationQuestionsMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateCommunityApplicationQuestionsMutation>;
export type UpdateCommunityApplicationQuestionsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCommunityApplicationQuestionsMutation,
  SchemaTypes.UpdateCommunityApplicationQuestionsMutationVariables
>;
export const ChallengeCommunityDocument = gql`
  query challengeCommunity($challengeId: UUID!, $includeDetails: Boolean = false) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          id
          displayName
        }
        community {
          id
          ...CommunityDetails @include(if: $includeDetails)
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
 *      challengeId: // value for 'challengeId'
 *      includeDetails: // value for 'includeDetails'
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

export const OpportunityCommunityDocument = gql`
  query opportunityCommunity($opportunityId: UUID!, $includeDetails: Boolean = false) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        profile {
          id
          displayName
        }
        community {
          id
          ...CommunityDetails @include(if: $includeDetails)
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
 *      opportunityId: // value for 'opportunityId'
 *      includeDetails: // value for 'includeDetails'
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

export const SpaceCommunityDocument = gql`
  query spaceCommunity($spaceId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    space(ID: $spaceId) {
      id
      profile {
        id
        displayName
      }
      community {
        id
        ...CommunityDetails @include(if: $includeDetails)
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

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
 *      spaceId: // value for 'spaceId'
 *      includeDetails: // value for 'includeDetails'
 *   },
 * });
 */
export function useSpaceCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceCommunityQuery, SchemaTypes.SpaceCommunityQueryVariables>
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

export type SpaceCommunityQueryHookResult = ReturnType<typeof useSpaceCommunityQuery>;
export type SpaceCommunityLazyQueryHookResult = ReturnType<typeof useSpaceCommunityLazyQuery>;
export type SpaceCommunityQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityQuery,
  SchemaTypes.SpaceCommunityQueryVariables
>;
export function refetchSpaceCommunityQuery(variables: SchemaTypes.SpaceCommunityQueryVariables) {
  return { query: SpaceCommunityDocument, variables: variables };
}

export const CommunityGuidelinesDocument = gql`
  query CommunityGuidelines($communityId: UUID!) {
    lookup {
      community(ID: $communityId) {
        id
        guidelines {
          ...CommunityGuidelinesDetails
        }
      }
    }
  }
  ${CommunityGuidelinesDetailsFragmentDoc}
`;

/**
 * __useCommunityGuidelinesQuery__
 *
 * To run a query within a React component, call `useCommunityGuidelinesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityGuidelinesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityGuidelinesQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityGuidelinesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityGuidelinesQuery,
    SchemaTypes.CommunityGuidelinesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityGuidelinesQuery, SchemaTypes.CommunityGuidelinesQueryVariables>(
    CommunityGuidelinesDocument,
    options
  );
}

export function useCommunityGuidelinesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityGuidelinesQuery,
    SchemaTypes.CommunityGuidelinesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityGuidelinesQuery, SchemaTypes.CommunityGuidelinesQueryVariables>(
    CommunityGuidelinesDocument,
    options
  );
}

export type CommunityGuidelinesQueryHookResult = ReturnType<typeof useCommunityGuidelinesQuery>;
export type CommunityGuidelinesLazyQueryHookResult = ReturnType<typeof useCommunityGuidelinesLazyQuery>;
export type CommunityGuidelinesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityGuidelinesQuery,
  SchemaTypes.CommunityGuidelinesQueryVariables
>;
export function refetchCommunityGuidelinesQuery(variables: SchemaTypes.CommunityGuidelinesQueryVariables) {
  return { query: CommunityGuidelinesDocument, variables: variables };
}

export const UpdateCommunityGuidelinesDocument = gql`
  mutation updateCommunityGuidelines($communityGuidelinesData: UpdateCommunityGuidelinesInput!) {
    updateCommunityGuidelines(communityGuidelinesData: $communityGuidelinesData) {
      ...CommunityGuidelinesDetails
    }
  }
  ${CommunityGuidelinesDetailsFragmentDoc}
`;
export type UpdateCommunityGuidelinesMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCommunityGuidelinesMutation,
  SchemaTypes.UpdateCommunityGuidelinesMutationVariables
>;

/**
 * __useUpdateCommunityGuidelinesMutation__
 *
 * To run a mutation, you first call `useUpdateCommunityGuidelinesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommunityGuidelinesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommunityGuidelinesMutation, { data, loading, error }] = useUpdateCommunityGuidelinesMutation({
 *   variables: {
 *      communityGuidelinesData: // value for 'communityGuidelinesData'
 *   },
 * });
 */
export function useUpdateCommunityGuidelinesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCommunityGuidelinesMutation,
    SchemaTypes.UpdateCommunityGuidelinesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCommunityGuidelinesMutation,
    SchemaTypes.UpdateCommunityGuidelinesMutationVariables
  >(UpdateCommunityGuidelinesDocument, options);
}

export type UpdateCommunityGuidelinesMutationHookResult = ReturnType<typeof useUpdateCommunityGuidelinesMutation>;
export type UpdateCommunityGuidelinesMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateCommunityGuidelinesMutation>;
export type UpdateCommunityGuidelinesMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCommunityGuidelinesMutation,
  SchemaTypes.UpdateCommunityGuidelinesMutationVariables
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
export const CommunityGroupsDocument = gql`
  query communityGroups($communityId: UUID!) {
    lookup {
      community(ID: $communityId) {
        id
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
  query communityMembers($communityId: UUID!) {
    lookup {
      community(ID: $communityId) {
        id
        memberUsers {
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

export const AvailableUsersDocument = gql`
  query availableUsers($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
      users {
        id
        profile {
          id
          displayName
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

/**
 * __useAvailableUsersQuery__
 *
 * To run a query within a React component, call `useAvailableUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableUsersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAvailableUsersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AvailableUsersQuery, SchemaTypes.AvailableUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AvailableUsersQuery, SchemaTypes.AvailableUsersQueryVariables>(
    AvailableUsersDocument,
    options
  );
}

export function useAvailableUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AvailableUsersQuery, SchemaTypes.AvailableUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AvailableUsersQuery, SchemaTypes.AvailableUsersQueryVariables>(
    AvailableUsersDocument,
    options
  );
}

export type AvailableUsersQueryHookResult = ReturnType<typeof useAvailableUsersQuery>;
export type AvailableUsersLazyQueryHookResult = ReturnType<typeof useAvailableUsersLazyQuery>;
export type AvailableUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableUsersQuery,
  SchemaTypes.AvailableUsersQueryVariables
>;
export function refetchAvailableUsersQuery(variables: SchemaTypes.AvailableUsersQueryVariables) {
  return { query: AvailableUsersDocument, variables: variables };
}

export const CommunityMembersListDocument = gql`
  query CommunityMembersList(
    $communityId: UUID!
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $includeSpaceHost: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpaceHost) {
      host {
        ...OrganizationDetails
      }
    }
    lookup {
      community(ID: $communityId) {
        ...CommunityMembersDetails
      }
    }
  }
  ${OrganizationDetailsFragmentDoc}
  ${CommunityMembersDetailsFragmentDoc}
`;

/**
 * __useCommunityMembersListQuery__
 *
 * To run a query within a React component, call `useCommunityMembersListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityMembersListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityMembersListQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      spaceId: // value for 'spaceId'
 *      includeSpaceHost: // value for 'includeSpaceHost'
 *   },
 * });
 */
export function useCommunityMembersListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityMembersListQuery,
    SchemaTypes.CommunityMembersListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityMembersListQuery, SchemaTypes.CommunityMembersListQueryVariables>(
    CommunityMembersListDocument,
    options
  );
}

export function useCommunityMembersListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityMembersListQuery,
    SchemaTypes.CommunityMembersListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityMembersListQuery, SchemaTypes.CommunityMembersListQueryVariables>(
    CommunityMembersListDocument,
    options
  );
}

export type CommunityMembersListQueryHookResult = ReturnType<typeof useCommunityMembersListQuery>;
export type CommunityMembersListLazyQueryHookResult = ReturnType<typeof useCommunityMembersListLazyQuery>;
export type CommunityMembersListQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityMembersListQuery,
  SchemaTypes.CommunityMembersListQueryVariables
>;
export function refetchCommunityMembersListQuery(variables: SchemaTypes.CommunityMembersListQueryVariables) {
  return { query: CommunityMembersListDocument, variables: variables };
}

export const CommunityAvailableMembersDocument = gql`
  query CommunityAvailableMembers($communityId: UUID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    lookup {
      availableMembers: community(ID: $communityId) {
        ...CommunityAvailableMemberUsers
      }
    }
  }
  ${CommunityAvailableMemberUsersFragmentDoc}
`;

/**
 * __useCommunityAvailableMembersQuery__
 *
 * To run a query within a React component, call `useCommunityAvailableMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityAvailableMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityAvailableMembersQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useCommunityAvailableMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityAvailableMembersQuery,
    SchemaTypes.CommunityAvailableMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CommunityAvailableMembersQuery,
    SchemaTypes.CommunityAvailableMembersQueryVariables
  >(CommunityAvailableMembersDocument, options);
}

export function useCommunityAvailableMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityAvailableMembersQuery,
    SchemaTypes.CommunityAvailableMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityAvailableMembersQuery,
    SchemaTypes.CommunityAvailableMembersQueryVariables
  >(CommunityAvailableMembersDocument, options);
}

export type CommunityAvailableMembersQueryHookResult = ReturnType<typeof useCommunityAvailableMembersQuery>;
export type CommunityAvailableMembersLazyQueryHookResult = ReturnType<typeof useCommunityAvailableMembersLazyQuery>;
export type CommunityAvailableMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityAvailableMembersQuery,
  SchemaTypes.CommunityAvailableMembersQueryVariables
>;
export function refetchCommunityAvailableMembersQuery(variables: SchemaTypes.CommunityAvailableMembersQueryVariables) {
  return { query: CommunityAvailableMembersDocument, variables: variables };
}

export const AllOrganizationsDocument = gql`
  query AllOrganizations($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    organizationsPaginated(first: $first, after: $after, filter: $filter) {
      organization {
        ...BasicOrganizationDetails
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${BasicOrganizationDetailsFragmentDoc}
  ${PageInfoFragmentDoc}
`;

/**
 * __useAllOrganizationsQuery__
 *
 * To run a query within a React component, call `useAllOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllOrganizationsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAllOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AllOrganizationsQuery, SchemaTypes.AllOrganizationsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AllOrganizationsQuery, SchemaTypes.AllOrganizationsQueryVariables>(
    AllOrganizationsDocument,
    options
  );
}

export function useAllOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AllOrganizationsQuery,
    SchemaTypes.AllOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AllOrganizationsQuery, SchemaTypes.AllOrganizationsQueryVariables>(
    AllOrganizationsDocument,
    options
  );
}

export type AllOrganizationsQueryHookResult = ReturnType<typeof useAllOrganizationsQuery>;
export type AllOrganizationsLazyQueryHookResult = ReturnType<typeof useAllOrganizationsLazyQuery>;
export type AllOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.AllOrganizationsQuery,
  SchemaTypes.AllOrganizationsQueryVariables
>;
export function refetchAllOrganizationsQuery(variables: SchemaTypes.AllOrganizationsQueryVariables) {
  return { query: AllOrganizationsDocument, variables: variables };
}

export const AssignUserAsCommunityMemberDocument = gql`
  mutation assignUserAsCommunityMember($communityId: UUID!, $memberId: UUID_NAMEID_EMAIL!) {
    assignCommunityRoleToUser(roleData: { communityID: $communityId, userID: $memberId, role: MEMBER }) {
      id
    }
  }
`;
export type AssignUserAsCommunityMemberMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsCommunityMemberMutation,
  SchemaTypes.AssignUserAsCommunityMemberMutationVariables
>;

/**
 * __useAssignUserAsCommunityMemberMutation__
 *
 * To run a mutation, you first call `useAssignUserAsCommunityMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsCommunityMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsCommunityMemberMutation, { data, loading, error }] = useAssignUserAsCommunityMemberMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignUserAsCommunityMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsCommunityMemberMutation,
    SchemaTypes.AssignUserAsCommunityMemberMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsCommunityMemberMutation,
    SchemaTypes.AssignUserAsCommunityMemberMutationVariables
  >(AssignUserAsCommunityMemberDocument, options);
}

export type AssignUserAsCommunityMemberMutationHookResult = ReturnType<typeof useAssignUserAsCommunityMemberMutation>;
export type AssignUserAsCommunityMemberMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsCommunityMemberMutation>;
export type AssignUserAsCommunityMemberMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsCommunityMemberMutation,
  SchemaTypes.AssignUserAsCommunityMemberMutationVariables
>;
export const AssignUserAsCommunityLeadDocument = gql`
  mutation assignUserAsCommunityLead($communityId: UUID!, $memberId: UUID_NAMEID_EMAIL!) {
    assignCommunityRoleToUser(roleData: { communityID: $communityId, userID: $memberId, role: LEAD }) {
      id
    }
  }
`;
export type AssignUserAsCommunityLeadMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsCommunityLeadMutation,
  SchemaTypes.AssignUserAsCommunityLeadMutationVariables
>;

/**
 * __useAssignUserAsCommunityLeadMutation__
 *
 * To run a mutation, you first call `useAssignUserAsCommunityLeadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsCommunityLeadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsCommunityLeadMutation, { data, loading, error }] = useAssignUserAsCommunityLeadMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignUserAsCommunityLeadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsCommunityLeadMutation,
    SchemaTypes.AssignUserAsCommunityLeadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsCommunityLeadMutation,
    SchemaTypes.AssignUserAsCommunityLeadMutationVariables
  >(AssignUserAsCommunityLeadDocument, options);
}

export type AssignUserAsCommunityLeadMutationHookResult = ReturnType<typeof useAssignUserAsCommunityLeadMutation>;
export type AssignUserAsCommunityLeadMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsCommunityLeadMutation>;
export type AssignUserAsCommunityLeadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsCommunityLeadMutation,
  SchemaTypes.AssignUserAsCommunityLeadMutationVariables
>;
export const RemoveUserAsCommunityMemberDocument = gql`
  mutation removeUserAsCommunityMember($communityId: UUID!, $memberId: UUID_NAMEID_EMAIL!) {
    removeCommunityRoleFromUser(roleData: { communityID: $communityId, userID: $memberId, role: MEMBER }) {
      id
    }
  }
`;
export type RemoveUserAsCommunityMemberMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsCommunityMemberMutation,
  SchemaTypes.RemoveUserAsCommunityMemberMutationVariables
>;

/**
 * __useRemoveUserAsCommunityMemberMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsCommunityMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsCommunityMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsCommunityMemberMutation, { data, loading, error }] = useRemoveUserAsCommunityMemberMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveUserAsCommunityMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsCommunityMemberMutation,
    SchemaTypes.RemoveUserAsCommunityMemberMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsCommunityMemberMutation,
    SchemaTypes.RemoveUserAsCommunityMemberMutationVariables
  >(RemoveUserAsCommunityMemberDocument, options);
}

export type RemoveUserAsCommunityMemberMutationHookResult = ReturnType<typeof useRemoveUserAsCommunityMemberMutation>;
export type RemoveUserAsCommunityMemberMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsCommunityMemberMutation>;
export type RemoveUserAsCommunityMemberMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsCommunityMemberMutation,
  SchemaTypes.RemoveUserAsCommunityMemberMutationVariables
>;
export const RemoveUserAsCommunityLeadDocument = gql`
  mutation removeUserAsCommunityLead($communityId: UUID!, $memberId: UUID_NAMEID_EMAIL!) {
    removeCommunityRoleFromUser(roleData: { communityID: $communityId, userID: $memberId, role: LEAD }) {
      id
    }
  }
`;
export type RemoveUserAsCommunityLeadMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsCommunityLeadMutation,
  SchemaTypes.RemoveUserAsCommunityLeadMutationVariables
>;

/**
 * __useRemoveUserAsCommunityLeadMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsCommunityLeadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsCommunityLeadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsCommunityLeadMutation, { data, loading, error }] = useRemoveUserAsCommunityLeadMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveUserAsCommunityLeadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsCommunityLeadMutation,
    SchemaTypes.RemoveUserAsCommunityLeadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsCommunityLeadMutation,
    SchemaTypes.RemoveUserAsCommunityLeadMutationVariables
  >(RemoveUserAsCommunityLeadDocument, options);
}

export type RemoveUserAsCommunityLeadMutationHookResult = ReturnType<typeof useRemoveUserAsCommunityLeadMutation>;
export type RemoveUserAsCommunityLeadMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsCommunityLeadMutation>;
export type RemoveUserAsCommunityLeadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsCommunityLeadMutation,
  SchemaTypes.RemoveUserAsCommunityLeadMutationVariables
>;
export const AssignOrganizationAsCommunityMemberDocument = gql`
  mutation assignOrganizationAsCommunityMember($communityId: UUID!, $memberId: UUID_NAMEID!) {
    assignCommunityRoleToOrganization(
      roleData: { communityID: $communityId, organizationID: $memberId, role: MEMBER }
    ) {
      id
    }
  }
`;
export type AssignOrganizationAsCommunityMemberMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignOrganizationAsCommunityMemberMutation,
  SchemaTypes.AssignOrganizationAsCommunityMemberMutationVariables
>;

/**
 * __useAssignOrganizationAsCommunityMemberMutation__
 *
 * To run a mutation, you first call `useAssignOrganizationAsCommunityMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignOrganizationAsCommunityMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignOrganizationAsCommunityMemberMutation, { data, loading, error }] = useAssignOrganizationAsCommunityMemberMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignOrganizationAsCommunityMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignOrganizationAsCommunityMemberMutation,
    SchemaTypes.AssignOrganizationAsCommunityMemberMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignOrganizationAsCommunityMemberMutation,
    SchemaTypes.AssignOrganizationAsCommunityMemberMutationVariables
  >(AssignOrganizationAsCommunityMemberDocument, options);
}

export type AssignOrganizationAsCommunityMemberMutationHookResult = ReturnType<
  typeof useAssignOrganizationAsCommunityMemberMutation
>;
export type AssignOrganizationAsCommunityMemberMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignOrganizationAsCommunityMemberMutation>;
export type AssignOrganizationAsCommunityMemberMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignOrganizationAsCommunityMemberMutation,
  SchemaTypes.AssignOrganizationAsCommunityMemberMutationVariables
>;
export const AssignOrganizationAsCommunityLeadDocument = gql`
  mutation assignOrganizationAsCommunityLead($communityId: UUID!, $memberId: UUID_NAMEID!) {
    assignCommunityRoleToOrganization(roleData: { communityID: $communityId, organizationID: $memberId, role: LEAD }) {
      id
    }
  }
`;
export type AssignOrganizationAsCommunityLeadMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignOrganizationAsCommunityLeadMutation,
  SchemaTypes.AssignOrganizationAsCommunityLeadMutationVariables
>;

/**
 * __useAssignOrganizationAsCommunityLeadMutation__
 *
 * To run a mutation, you first call `useAssignOrganizationAsCommunityLeadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignOrganizationAsCommunityLeadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignOrganizationAsCommunityLeadMutation, { data, loading, error }] = useAssignOrganizationAsCommunityLeadMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useAssignOrganizationAsCommunityLeadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignOrganizationAsCommunityLeadMutation,
    SchemaTypes.AssignOrganizationAsCommunityLeadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignOrganizationAsCommunityLeadMutation,
    SchemaTypes.AssignOrganizationAsCommunityLeadMutationVariables
  >(AssignOrganizationAsCommunityLeadDocument, options);
}

export type AssignOrganizationAsCommunityLeadMutationHookResult = ReturnType<
  typeof useAssignOrganizationAsCommunityLeadMutation
>;
export type AssignOrganizationAsCommunityLeadMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignOrganizationAsCommunityLeadMutation>;
export type AssignOrganizationAsCommunityLeadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignOrganizationAsCommunityLeadMutation,
  SchemaTypes.AssignOrganizationAsCommunityLeadMutationVariables
>;
export const RemoveOrganizationAsCommunityMemberDocument = gql`
  mutation removeOrganizationAsCommunityMember($communityId: UUID!, $memberId: UUID_NAMEID!) {
    removeCommunityRoleFromOrganization(
      roleData: { communityID: $communityId, organizationID: $memberId, role: MEMBER }
    ) {
      id
    }
  }
`;
export type RemoveOrganizationAsCommunityMemberMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveOrganizationAsCommunityMemberMutation,
  SchemaTypes.RemoveOrganizationAsCommunityMemberMutationVariables
>;

/**
 * __useRemoveOrganizationAsCommunityMemberMutation__
 *
 * To run a mutation, you first call `useRemoveOrganizationAsCommunityMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveOrganizationAsCommunityMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeOrganizationAsCommunityMemberMutation, { data, loading, error }] = useRemoveOrganizationAsCommunityMemberMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveOrganizationAsCommunityMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveOrganizationAsCommunityMemberMutation,
    SchemaTypes.RemoveOrganizationAsCommunityMemberMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveOrganizationAsCommunityMemberMutation,
    SchemaTypes.RemoveOrganizationAsCommunityMemberMutationVariables
  >(RemoveOrganizationAsCommunityMemberDocument, options);
}

export type RemoveOrganizationAsCommunityMemberMutationHookResult = ReturnType<
  typeof useRemoveOrganizationAsCommunityMemberMutation
>;
export type RemoveOrganizationAsCommunityMemberMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveOrganizationAsCommunityMemberMutation>;
export type RemoveOrganizationAsCommunityMemberMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveOrganizationAsCommunityMemberMutation,
  SchemaTypes.RemoveOrganizationAsCommunityMemberMutationVariables
>;
export const RemoveOrganizationAsCommunityLeadDocument = gql`
  mutation removeOrganizationAsCommunityLead($communityId: UUID!, $memberId: UUID_NAMEID!) {
    removeCommunityRoleFromOrganization(
      roleData: { communityID: $communityId, organizationID: $memberId, role: LEAD }
    ) {
      id
    }
  }
`;
export type RemoveOrganizationAsCommunityLeadMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveOrganizationAsCommunityLeadMutation,
  SchemaTypes.RemoveOrganizationAsCommunityLeadMutationVariables
>;

/**
 * __useRemoveOrganizationAsCommunityLeadMutation__
 *
 * To run a mutation, you first call `useRemoveOrganizationAsCommunityLeadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveOrganizationAsCommunityLeadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeOrganizationAsCommunityLeadMutation, { data, loading, error }] = useRemoveOrganizationAsCommunityLeadMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveOrganizationAsCommunityLeadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveOrganizationAsCommunityLeadMutation,
    SchemaTypes.RemoveOrganizationAsCommunityLeadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveOrganizationAsCommunityLeadMutation,
    SchemaTypes.RemoveOrganizationAsCommunityLeadMutationVariables
  >(RemoveOrganizationAsCommunityLeadDocument, options);
}

export type RemoveOrganizationAsCommunityLeadMutationHookResult = ReturnType<
  typeof useRemoveOrganizationAsCommunityLeadMutation
>;
export type RemoveOrganizationAsCommunityLeadMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveOrganizationAsCommunityLeadMutation>;
export type RemoveOrganizationAsCommunityLeadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveOrganizationAsCommunityLeadMutation,
  SchemaTypes.RemoveOrganizationAsCommunityLeadMutationVariables
>;
export const AssignCommunityRoleToUserDocument = gql`
  mutation AssignCommunityRoleToUser($communityID: UUID!, $role: CommunityRole!, $userID: UUID_NAMEID_EMAIL!) {
    assignCommunityRoleToUser(roleData: { communityID: $communityID, role: $role, userID: $userID }) {
      id
    }
  }
`;
export type AssignCommunityRoleToUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignCommunityRoleToUserMutation,
  SchemaTypes.AssignCommunityRoleToUserMutationVariables
>;

/**
 * __useAssignCommunityRoleToUserMutation__
 *
 * To run a mutation, you first call `useAssignCommunityRoleToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignCommunityRoleToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignCommunityRoleToUserMutation, { data, loading, error }] = useAssignCommunityRoleToUserMutation({
 *   variables: {
 *      communityID: // value for 'communityID'
 *      role: // value for 'role'
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useAssignCommunityRoleToUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignCommunityRoleToUserMutation,
    SchemaTypes.AssignCommunityRoleToUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignCommunityRoleToUserMutation,
    SchemaTypes.AssignCommunityRoleToUserMutationVariables
  >(AssignCommunityRoleToUserDocument, options);
}

export type AssignCommunityRoleToUserMutationHookResult = ReturnType<typeof useAssignCommunityRoleToUserMutation>;
export type AssignCommunityRoleToUserMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignCommunityRoleToUserMutation>;
export type AssignCommunityRoleToUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignCommunityRoleToUserMutation,
  SchemaTypes.AssignCommunityRoleToUserMutationVariables
>;
export const RemoveCommunityRoleFromUserDocument = gql`
  mutation RemoveCommunityRoleFromUser($communityID: UUID!, $role: CommunityRole!, $userID: UUID_NAMEID_EMAIL!) {
    removeCommunityRoleFromUser(roleData: { communityID: $communityID, role: $role, userID: $userID }) {
      id
    }
  }
`;
export type RemoveCommunityRoleFromUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveCommunityRoleFromUserMutation,
  SchemaTypes.RemoveCommunityRoleFromUserMutationVariables
>;

/**
 * __useRemoveCommunityRoleFromUserMutation__
 *
 * To run a mutation, you first call `useRemoveCommunityRoleFromUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommunityRoleFromUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommunityRoleFromUserMutation, { data, loading, error }] = useRemoveCommunityRoleFromUserMutation({
 *   variables: {
 *      communityID: // value for 'communityID'
 *      role: // value for 'role'
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useRemoveCommunityRoleFromUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveCommunityRoleFromUserMutation,
    SchemaTypes.RemoveCommunityRoleFromUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveCommunityRoleFromUserMutation,
    SchemaTypes.RemoveCommunityRoleFromUserMutationVariables
  >(RemoveCommunityRoleFromUserDocument, options);
}

export type RemoveCommunityRoleFromUserMutationHookResult = ReturnType<typeof useRemoveCommunityRoleFromUserMutation>;
export type RemoveCommunityRoleFromUserMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveCommunityRoleFromUserMutation>;
export type RemoveCommunityRoleFromUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveCommunityRoleFromUserMutation,
  SchemaTypes.RemoveCommunityRoleFromUserMutationVariables
>;
export const ContributorsPageOrganizationsDocument = gql`
  query ContributorsPageOrganizations($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    organizationsPaginated(first: $first, after: $after, filter: $filter) {
      ...OrganizationContributorPaginated
    }
  }
  ${OrganizationContributorPaginatedFragmentDoc}
`;

/**
 * __useContributorsPageOrganizationsQuery__
 *
 * To run a query within a React component, call `useContributorsPageOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorsPageOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorsPageOrganizationsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useContributorsPageOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  >(ContributorsPageOrganizationsDocument, options);
}

export function useContributorsPageOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  >(ContributorsPageOrganizationsDocument, options);
}

export type ContributorsPageOrganizationsQueryHookResult = ReturnType<typeof useContributorsPageOrganizationsQuery>;
export type ContributorsPageOrganizationsLazyQueryHookResult = ReturnType<
  typeof useContributorsPageOrganizationsLazyQuery
>;
export type ContributorsPageOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorsPageOrganizationsQuery,
  SchemaTypes.ContributorsPageOrganizationsQueryVariables
>;
export function refetchContributorsPageOrganizationsQuery(
  variables: SchemaTypes.ContributorsPageOrganizationsQueryVariables
) {
  return { query: ContributorsPageOrganizationsDocument, variables: variables };
}

export const ContributorsPageUsersDocument = gql`
  query ContributorsPageUsers($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
      ...UserContributorPaginated
    }
  }
  ${UserContributorPaginatedFragmentDoc}
`;

/**
 * __useContributorsPageUsersQuery__
 *
 * To run a query within a React component, call `useContributorsPageUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorsPageUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorsPageUsersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useContributorsPageUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsPageUsersQuery,
    SchemaTypes.ContributorsPageUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContributorsPageUsersQuery, SchemaTypes.ContributorsPageUsersQueryVariables>(
    ContributorsPageUsersDocument,
    options
  );
}

export function useContributorsPageUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributorsPageUsersQuery,
    SchemaTypes.ContributorsPageUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContributorsPageUsersQuery, SchemaTypes.ContributorsPageUsersQueryVariables>(
    ContributorsPageUsersDocument,
    options
  );
}

export type ContributorsPageUsersQueryHookResult = ReturnType<typeof useContributorsPageUsersQuery>;
export type ContributorsPageUsersLazyQueryHookResult = ReturnType<typeof useContributorsPageUsersLazyQuery>;
export type ContributorsPageUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorsPageUsersQuery,
  SchemaTypes.ContributorsPageUsersQueryVariables
>;
export function refetchContributorsPageUsersQuery(variables: SchemaTypes.ContributorsPageUsersQueryVariables) {
  return { query: ContributorsPageUsersDocument, variables: variables };
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
  mutation assignUserToOrganization($input: AssignOrganizationAssociateInput!) {
    assignUserToOrganization(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
  mutation removeUserFromOrganization($input: RemoveOrganizationAssociateInput!) {
    removeUserFromOrganization(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
      profile {
        id
        displayName
      }
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
      profile {
        id
        displayName
      }
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
export const OrganizationAssociatesDocument = gql`
  query organizationAssociates($id: UUID_NAMEID!) {
    organization(ID: $id) {
      id
      associates {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;

/**
 * __useOrganizationAssociatesQuery__
 *
 * To run a query within a React component, call `useOrganizationAssociatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationAssociatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationAssociatesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationAssociatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationAssociatesQuery,
    SchemaTypes.OrganizationAssociatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationAssociatesQuery, SchemaTypes.OrganizationAssociatesQueryVariables>(
    OrganizationAssociatesDocument,
    options
  );
}

export function useOrganizationAssociatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationAssociatesQuery,
    SchemaTypes.OrganizationAssociatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationAssociatesQuery, SchemaTypes.OrganizationAssociatesQueryVariables>(
    OrganizationAssociatesDocument,
    options
  );
}

export type OrganizationAssociatesQueryHookResult = ReturnType<typeof useOrganizationAssociatesQuery>;
export type OrganizationAssociatesLazyQueryHookResult = ReturnType<typeof useOrganizationAssociatesLazyQuery>;
export type OrganizationAssociatesQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationAssociatesQuery,
  SchemaTypes.OrganizationAssociatesQueryVariables
>;
export function refetchOrganizationAssociatesQuery(variables: SchemaTypes.OrganizationAssociatesQueryVariables) {
  return { query: OrganizationAssociatesDocument, variables: variables };
}

export const RolesOrganizationDocument = gql`
  query rolesOrganization($input: UUID_NAMEID!) {
    rolesOrganization(rolesData: { organizationID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        nameID
        id
        roles
        displayName
        visibility
        challenges {
          nameID
          id
          displayName
          roles
        }
      }
    }
  }
`;

/**
 * __useRolesOrganizationQuery__
 *
 * To run a query within a React component, call `useRolesOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useRolesOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRolesOrganizationQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRolesOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.RolesOrganizationQuery, SchemaTypes.RolesOrganizationQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RolesOrganizationQuery, SchemaTypes.RolesOrganizationQueryVariables>(
    RolesOrganizationDocument,
    options
  );
}

export function useRolesOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RolesOrganizationQuery,
    SchemaTypes.RolesOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RolesOrganizationQuery, SchemaTypes.RolesOrganizationQueryVariables>(
    RolesOrganizationDocument,
    options
  );
}

export type RolesOrganizationQueryHookResult = ReturnType<typeof useRolesOrganizationQuery>;
export type RolesOrganizationLazyQueryHookResult = ReturnType<typeof useRolesOrganizationLazyQuery>;
export type RolesOrganizationQueryResult = Apollo.QueryResult<
  SchemaTypes.RolesOrganizationQuery,
  SchemaTypes.RolesOrganizationQueryVariables
>;
export function refetchRolesOrganizationQuery(variables: SchemaTypes.RolesOrganizationQueryVariables) {
  return { query: RolesOrganizationDocument, variables: variables };
}

export const OrganizationInfoDocument = gql`
  query organizationInfo($organizationId: UUID_NAMEID!, $includeAssociates: Boolean = false) {
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
 *      includeAssociates: // value for 'includeAssociates'
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

export const CreateGroupOnOrganizationDocument = gql`
  mutation createGroupOnOrganization($input: CreateUserGroupInput!) {
    createGroupOnOrganization(groupData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const CreateOrganizationDocument = gql`
  mutation createOrganization($input: CreateOrganizationInput!) {
    createOrganization(organizationData: $input) {
      id
      nameID
      profile {
        id
        displayName
      }
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
export const OrganizationGroupDocument = gql`
  query organizationGroup($organizationId: UUID_NAMEID!, $groupId: UUID!) {
    organization(ID: $organizationId) {
      id
      associates {
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

export const OrganizationGroupsDocument = gql`
  query organizationGroups($id: UUID_NAMEID!) {
    organization(ID: $id) {
      id
      groups {
        id
        profile {
          id
          displayName
        }
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
  query organizationsList($limit: Float, $shuffle: Boolean, $filterCredentials: [AuthorizationCredential!]) {
    organizations(limit: $limit, shuffle: $shuffle, filter: { credentials: $filterCredentials }) {
      id
      nameID
      profile {
        id
        displayName
        visual(type: AVATAR) {
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
 *      filterCredentials: // value for 'filterCredentials'
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

export const DeleteInvitationDocument = gql`
  mutation DeleteInvitation($invitationId: UUID!) {
    deleteInvitation(deleteData: { ID: $invitationId }) {
      id
    }
  }
`;
export type DeleteInvitationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteInvitationMutation,
  SchemaTypes.DeleteInvitationMutationVariables
>;

/**
 * __useDeleteInvitationMutation__
 *
 * To run a mutation, you first call `useDeleteInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInvitationMutation, { data, loading, error }] = useDeleteInvitationMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useDeleteInvitationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteInvitationMutation,
    SchemaTypes.DeleteInvitationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteInvitationMutation, SchemaTypes.DeleteInvitationMutationVariables>(
    DeleteInvitationDocument,
    options
  );
}

export type DeleteInvitationMutationHookResult = ReturnType<typeof useDeleteInvitationMutation>;
export type DeleteInvitationMutationResult = Apollo.MutationResult<SchemaTypes.DeleteInvitationMutation>;
export type DeleteInvitationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteInvitationMutation,
  SchemaTypes.DeleteInvitationMutationVariables
>;
export const DeleteExternalInvitationDocument = gql`
  mutation DeleteExternalInvitation($invitationId: UUID!) {
    deleteInvitationExternal(deleteData: { ID: $invitationId }) {
      id
    }
  }
`;
export type DeleteExternalInvitationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteExternalInvitationMutation,
  SchemaTypes.DeleteExternalInvitationMutationVariables
>;

/**
 * __useDeleteExternalInvitationMutation__
 *
 * To run a mutation, you first call `useDeleteExternalInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteExternalInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteExternalInvitationMutation, { data, loading, error }] = useDeleteExternalInvitationMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useDeleteExternalInvitationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteExternalInvitationMutation,
    SchemaTypes.DeleteExternalInvitationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteExternalInvitationMutation,
    SchemaTypes.DeleteExternalInvitationMutationVariables
  >(DeleteExternalInvitationDocument, options);
}

export type DeleteExternalInvitationMutationHookResult = ReturnType<typeof useDeleteExternalInvitationMutation>;
export type DeleteExternalInvitationMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteExternalInvitationMutation>;
export type DeleteExternalInvitationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteExternalInvitationMutation,
  SchemaTypes.DeleteExternalInvitationMutationVariables
>;
export const InvitationStateEventDocument = gql`
  mutation InvitationStateEvent($eventName: String!, $invitationId: UUID!) {
    eventOnCommunityInvitation(invitationEventData: { eventName: $eventName, invitationID: $invitationId }) {
      id
      lifecycle {
        id
        nextEvents
        state
      }
    }
  }
`;
export type InvitationStateEventMutationFn = Apollo.MutationFunction<
  SchemaTypes.InvitationStateEventMutation,
  SchemaTypes.InvitationStateEventMutationVariables
>;

/**
 * __useInvitationStateEventMutation__
 *
 * To run a mutation, you first call `useInvitationStateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInvitationStateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [invitationStateEventMutation, { data, loading, error }] = useInvitationStateEventMutation({
 *   variables: {
 *      eventName: // value for 'eventName'
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useInvitationStateEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InvitationStateEventMutation,
    SchemaTypes.InvitationStateEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.InvitationStateEventMutation,
    SchemaTypes.InvitationStateEventMutationVariables
  >(InvitationStateEventDocument, options);
}

export type InvitationStateEventMutationHookResult = ReturnType<typeof useInvitationStateEventMutation>;
export type InvitationStateEventMutationResult = Apollo.MutationResult<SchemaTypes.InvitationStateEventMutation>;
export type InvitationStateEventMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InvitationStateEventMutation,
  SchemaTypes.InvitationStateEventMutationVariables
>;
export const InviteExistingUserDocument = gql`
  mutation InviteExistingUser($userIds: [UUID!]!, $communityId: UUID!, $message: String) {
    inviteExistingUserForCommunityMembership(
      invitationData: { invitedUsers: $userIds, communityID: $communityId, welcomeMessage: $message }
    ) {
      id
    }
  }
`;
export type InviteExistingUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteExistingUserMutation,
  SchemaTypes.InviteExistingUserMutationVariables
>;

/**
 * __useInviteExistingUserMutation__
 *
 * To run a mutation, you first call `useInviteExistingUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteExistingUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteExistingUserMutation, { data, loading, error }] = useInviteExistingUserMutation({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      communityId: // value for 'communityId'
 *      message: // value for 'message'
 *   },
 * });
 */
export function useInviteExistingUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteExistingUserMutation,
    SchemaTypes.InviteExistingUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.InviteExistingUserMutation, SchemaTypes.InviteExistingUserMutationVariables>(
    InviteExistingUserDocument,
    options
  );
}

export type InviteExistingUserMutationHookResult = ReturnType<typeof useInviteExistingUserMutation>;
export type InviteExistingUserMutationResult = Apollo.MutationResult<SchemaTypes.InviteExistingUserMutation>;
export type InviteExistingUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteExistingUserMutation,
  SchemaTypes.InviteExistingUserMutationVariables
>;
export const InviteExternalUserDocument = gql`
  mutation InviteExternalUser($email: String!, $communityId: UUID!, $message: String) {
    inviteExternalUserForCommunityMembership(
      invitationData: { email: $email, communityID: $communityId, welcomeMessage: $message }
    ) {
      id
    }
  }
`;
export type InviteExternalUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteExternalUserMutation,
  SchemaTypes.InviteExternalUserMutationVariables
>;

/**
 * __useInviteExternalUserMutation__
 *
 * To run a mutation, you first call `useInviteExternalUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteExternalUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteExternalUserMutation, { data, loading, error }] = useInviteExternalUserMutation({
 *   variables: {
 *      email: // value for 'email'
 *      communityId: // value for 'communityId'
 *      message: // value for 'message'
 *   },
 * });
 */
export function useInviteExternalUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteExternalUserMutation,
    SchemaTypes.InviteExternalUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.InviteExternalUserMutation, SchemaTypes.InviteExternalUserMutationVariables>(
    InviteExternalUserDocument,
    options
  );
}

export type InviteExternalUserMutationHookResult = ReturnType<typeof useInviteExternalUserMutation>;
export type InviteExternalUserMutationResult = Apollo.MutationResult<SchemaTypes.InviteExternalUserMutation>;
export type InviteExternalUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteExternalUserMutation,
  SchemaTypes.InviteExternalUserMutationVariables
>;
export const PendingMembershipsSpaceDocument = gql`
  query PendingMembershipsSpace(
    $spaceId: UUID_NAMEID!
    $fetchDetails: Boolean! = false
    $visualType: VisualType!
    $fetchCommunityGuidelines: Boolean! = false
  ) {
    space(ID: $spaceId) {
      id
      profile {
        ...PendingMembershipsJourneyProfile
      }
      community @include(if: $fetchCommunityGuidelines) {
        id
        guidelines {
          ...CommunityGuidelinesSummary
        }
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
  ${CommunityGuidelinesSummaryFragmentDoc}
`;

/**
 * __usePendingMembershipsSpaceQuery__
 *
 * To run a query within a React component, call `usePendingMembershipsSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingMembershipsSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingMembershipsSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      fetchDetails: // value for 'fetchDetails'
 *      visualType: // value for 'visualType'
 *      fetchCommunityGuidelines: // value for 'fetchCommunityGuidelines'
 *   },
 * });
 */
export function usePendingMembershipsSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsSpaceQuery,
    SchemaTypes.PendingMembershipsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PendingMembershipsSpaceQuery, SchemaTypes.PendingMembershipsSpaceQueryVariables>(
    PendingMembershipsSpaceDocument,
    options
  );
}

export function usePendingMembershipsSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingMembershipsSpaceQuery,
    SchemaTypes.PendingMembershipsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PendingMembershipsSpaceQuery,
    SchemaTypes.PendingMembershipsSpaceQueryVariables
  >(PendingMembershipsSpaceDocument, options);
}

export type PendingMembershipsSpaceQueryHookResult = ReturnType<typeof usePendingMembershipsSpaceQuery>;
export type PendingMembershipsSpaceLazyQueryHookResult = ReturnType<typeof usePendingMembershipsSpaceLazyQuery>;
export type PendingMembershipsSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsSpaceQuery,
  SchemaTypes.PendingMembershipsSpaceQueryVariables
>;
export function refetchPendingMembershipsSpaceQuery(variables: SchemaTypes.PendingMembershipsSpaceQueryVariables) {
  return { query: PendingMembershipsSpaceDocument, variables: variables };
}

export const PendingMembershipsChallengeDocument = gql`
  query PendingMembershipsChallenge(
    $challengeId: UUID!
    $fetchDetails: Boolean! = false
    $visualType: VisualType!
    $fetchCommunityGuidelines: Boolean! = false
  ) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          ...PendingMembershipsJourneyProfile
        }
        community @include(if: $fetchCommunityGuidelines) {
          id
          guidelines {
            ...CommunityGuidelinesSummary
          }
        }
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
  ${CommunityGuidelinesSummaryFragmentDoc}
`;

/**
 * __usePendingMembershipsChallengeQuery__
 *
 * To run a query within a React component, call `usePendingMembershipsChallengeQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingMembershipsChallengeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingMembershipsChallengeQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      fetchDetails: // value for 'fetchDetails'
 *      visualType: // value for 'visualType'
 *      fetchCommunityGuidelines: // value for 'fetchCommunityGuidelines'
 *   },
 * });
 */
export function usePendingMembershipsChallengeQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsChallengeQuery,
    SchemaTypes.PendingMembershipsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PendingMembershipsChallengeQuery,
    SchemaTypes.PendingMembershipsChallengeQueryVariables
  >(PendingMembershipsChallengeDocument, options);
}

export function usePendingMembershipsChallengeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingMembershipsChallengeQuery,
    SchemaTypes.PendingMembershipsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PendingMembershipsChallengeQuery,
    SchemaTypes.PendingMembershipsChallengeQueryVariables
  >(PendingMembershipsChallengeDocument, options);
}

export type PendingMembershipsChallengeQueryHookResult = ReturnType<typeof usePendingMembershipsChallengeQuery>;
export type PendingMembershipsChallengeLazyQueryHookResult = ReturnType<typeof usePendingMembershipsChallengeLazyQuery>;
export type PendingMembershipsChallengeQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsChallengeQuery,
  SchemaTypes.PendingMembershipsChallengeQueryVariables
>;
export function refetchPendingMembershipsChallengeQuery(
  variables: SchemaTypes.PendingMembershipsChallengeQueryVariables
) {
  return { query: PendingMembershipsChallengeDocument, variables: variables };
}

export const PendingMembershipsOpportunityDocument = gql`
  query PendingMembershipsOpportunity(
    $opportunityId: UUID!
    $fetchDetails: Boolean! = false
    $visualType: VisualType!
    $fetchCommunityGuidelines: Boolean! = false
  ) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        profile {
          ...PendingMembershipsJourneyProfile
        }
        community @include(if: $fetchCommunityGuidelines) {
          id
          guidelines {
            ...CommunityGuidelinesSummary
          }
        }
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
  ${CommunityGuidelinesSummaryFragmentDoc}
`;

/**
 * __usePendingMembershipsOpportunityQuery__
 *
 * To run a query within a React component, call `usePendingMembershipsOpportunityQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingMembershipsOpportunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingMembershipsOpportunityQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *      fetchDetails: // value for 'fetchDetails'
 *      visualType: // value for 'visualType'
 *      fetchCommunityGuidelines: // value for 'fetchCommunityGuidelines'
 *   },
 * });
 */
export function usePendingMembershipsOpportunityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsOpportunityQuery,
    SchemaTypes.PendingMembershipsOpportunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PendingMembershipsOpportunityQuery,
    SchemaTypes.PendingMembershipsOpportunityQueryVariables
  >(PendingMembershipsOpportunityDocument, options);
}

export function usePendingMembershipsOpportunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingMembershipsOpportunityQuery,
    SchemaTypes.PendingMembershipsOpportunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PendingMembershipsOpportunityQuery,
    SchemaTypes.PendingMembershipsOpportunityQueryVariables
  >(PendingMembershipsOpportunityDocument, options);
}

export type PendingMembershipsOpportunityQueryHookResult = ReturnType<typeof usePendingMembershipsOpportunityQuery>;
export type PendingMembershipsOpportunityLazyQueryHookResult = ReturnType<
  typeof usePendingMembershipsOpportunityLazyQuery
>;
export type PendingMembershipsOpportunityQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsOpportunityQuery,
  SchemaTypes.PendingMembershipsOpportunityQueryVariables
>;
export function refetchPendingMembershipsOpportunityQuery(
  variables: SchemaTypes.PendingMembershipsOpportunityQueryVariables
) {
  return { query: PendingMembershipsOpportunityDocument, variables: variables };
}

export const PendingMembershipsUserDocument = gql`
  query PendingMembershipsUser($userId: UUID_NAMEID_EMAIL!) {
    user(ID: $userId) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;

/**
 * __usePendingMembershipsUserQuery__
 *
 * To run a query within a React component, call `usePendingMembershipsUserQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingMembershipsUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingMembershipsUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function usePendingMembershipsUserQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsUserQuery,
    SchemaTypes.PendingMembershipsUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PendingMembershipsUserQuery, SchemaTypes.PendingMembershipsUserQueryVariables>(
    PendingMembershipsUserDocument,
    options
  );
}

export function usePendingMembershipsUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingMembershipsUserQuery,
    SchemaTypes.PendingMembershipsUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PendingMembershipsUserQuery, SchemaTypes.PendingMembershipsUserQueryVariables>(
    PendingMembershipsUserDocument,
    options
  );
}

export type PendingMembershipsUserQueryHookResult = ReturnType<typeof usePendingMembershipsUserQuery>;
export type PendingMembershipsUserLazyQueryHookResult = ReturnType<typeof usePendingMembershipsUserLazyQuery>;
export type PendingMembershipsUserQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsUserQuery,
  SchemaTypes.PendingMembershipsUserQueryVariables
>;
export function refetchPendingMembershipsUserQuery(variables: SchemaTypes.PendingMembershipsUserQueryVariables) {
  return { query: PendingMembershipsUserDocument, variables: variables };
}

export const SpaceContributionDetailsDocument = gql`
  query spaceContributionDetails($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        url
        displayName
        tagline
        visuals {
          ...VisualUri
        }
        tagset {
          ...TagsetDetails
        }
      }
      context {
        id
      }
      community {
        id
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __useSpaceContributionDetailsQuery__
 *
 * To run a query within a React component, call `useSpaceContributionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceContributionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceContributionDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceContributionDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceContributionDetailsQuery,
    SchemaTypes.SpaceContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceContributionDetailsQuery, SchemaTypes.SpaceContributionDetailsQueryVariables>(
    SpaceContributionDetailsDocument,
    options
  );
}

export function useSpaceContributionDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceContributionDetailsQuery,
    SchemaTypes.SpaceContributionDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceContributionDetailsQuery,
    SchemaTypes.SpaceContributionDetailsQueryVariables
  >(SpaceContributionDetailsDocument, options);
}

export type SpaceContributionDetailsQueryHookResult = ReturnType<typeof useSpaceContributionDetailsQuery>;
export type SpaceContributionDetailsLazyQueryHookResult = ReturnType<typeof useSpaceContributionDetailsLazyQuery>;
export type SpaceContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceContributionDetailsQuery,
  SchemaTypes.SpaceContributionDetailsQueryVariables
>;
export function refetchSpaceContributionDetailsQuery(variables: SchemaTypes.SpaceContributionDetailsQueryVariables) {
  return { query: SpaceContributionDetailsDocument, variables: variables };
}

export const ChallengeContributionDetailsDocument = gql`
  query challengeContributionDetails($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          id
          url
          displayName
          tagset {
            ...TagsetDetails
          }
          tagline
          visuals {
            ...VisualUri
          }
        }
        context {
          id
        }
        community {
          id
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
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
  query opportunityContributionDetails($opportunityId: UUID!) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        profile {
          id
          url
          displayName
          tagset {
            ...TagsetDetails
          }
          tagline
          visuals {
            ...VisualUri
          }
        }
        context {
          id
        }
        community {
          id
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
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

export const UserSelectorDocument = gql`
  query UserSelector($filter: UserFilterInput, $first: Int) {
    usersPaginated(filter: $filter, first: $first) {
      users {
        ...UserSelectorUserInformation
      }
    }
  }
  ${UserSelectorUserInformationFragmentDoc}
`;

/**
 * __useUserSelectorQuery__
 *
 * To run a query within a React component, call `useUserSelectorQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSelectorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSelectorQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useUserSelectorQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>(
    UserSelectorDocument,
    options
  );
}

export function useUserSelectorLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>(
    UserSelectorDocument,
    options
  );
}

export type UserSelectorQueryHookResult = ReturnType<typeof useUserSelectorQuery>;
export type UserSelectorLazyQueryHookResult = ReturnType<typeof useUserSelectorLazyQuery>;
export type UserSelectorQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSelectorQuery,
  SchemaTypes.UserSelectorQueryVariables
>;
export function refetchUserSelectorQuery(variables?: SchemaTypes.UserSelectorQueryVariables) {
  return { query: UserSelectorDocument, variables: variables };
}

export const UserSelectorUserDetailsDocument = gql`
  query UserSelectorUserDetails($id: UUID_NAMEID_EMAIL!) {
    user(ID: $id) {
      ...UserSelectorUserInformation
    }
  }
  ${UserSelectorUserInformationFragmentDoc}
`;

/**
 * __useUserSelectorUserDetailsQuery__
 *
 * To run a query within a React component, call `useUserSelectorUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSelectorUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSelectorUserDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserSelectorUserDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserSelectorUserDetailsQuery,
    SchemaTypes.UserSelectorUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserSelectorUserDetailsQuery, SchemaTypes.UserSelectorUserDetailsQueryVariables>(
    UserSelectorUserDetailsDocument,
    options
  );
}

export function useUserSelectorUserDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserSelectorUserDetailsQuery,
    SchemaTypes.UserSelectorUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.UserSelectorUserDetailsQuery,
    SchemaTypes.UserSelectorUserDetailsQueryVariables
  >(UserSelectorUserDetailsDocument, options);
}

export type UserSelectorUserDetailsQueryHookResult = ReturnType<typeof useUserSelectorUserDetailsQuery>;
export type UserSelectorUserDetailsLazyQueryHookResult = ReturnType<typeof useUserSelectorUserDetailsLazyQuery>;
export type UserSelectorUserDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSelectorUserDetailsQuery,
  SchemaTypes.UserSelectorUserDetailsQueryVariables
>;
export function refetchUserSelectorUserDetailsQuery(variables: SchemaTypes.UserSelectorUserDetailsQueryVariables) {
  return { query: UserSelectorUserDetailsDocument, variables: variables };
}

export const PlatformLevelAuthorizationDocument = gql`
  query PlatformLevelAuthorization {
    platform {
      authorization {
        ...MyPrivileges
      }
    }
  }
  ${MyPrivilegesFragmentDoc}
`;

/**
 * __usePlatformLevelAuthorizationQuery__
 *
 * To run a query within a React component, call `usePlatformLevelAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformLevelAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformLevelAuthorizationQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformLevelAuthorizationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformLevelAuthorizationQuery,
    SchemaTypes.PlatformLevelAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformLevelAuthorizationQuery,
    SchemaTypes.PlatformLevelAuthorizationQueryVariables
  >(PlatformLevelAuthorizationDocument, options);
}

export function usePlatformLevelAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformLevelAuthorizationQuery,
    SchemaTypes.PlatformLevelAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformLevelAuthorizationQuery,
    SchemaTypes.PlatformLevelAuthorizationQueryVariables
  >(PlatformLevelAuthorizationDocument, options);
}

export type PlatformLevelAuthorizationQueryHookResult = ReturnType<typeof usePlatformLevelAuthorizationQuery>;
export type PlatformLevelAuthorizationLazyQueryHookResult = ReturnType<typeof usePlatformLevelAuthorizationLazyQuery>;
export type PlatformLevelAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformLevelAuthorizationQuery,
  SchemaTypes.PlatformLevelAuthorizationQueryVariables
>;
export function refetchPlatformLevelAuthorizationQuery(
  variables?: SchemaTypes.PlatformLevelAuthorizationQueryVariables
) {
  return { query: PlatformLevelAuthorizationDocument, variables: variables };
}

export const UserAvatarsDocument = gql`
  query userAvatars($ids: [UUID!]!) {
    users(IDs: $ids) {
      id
      nameID
      profile {
        id
        displayName
        location {
          country
          city
        }
        visual(type: AVATAR) {
          ...VisualUri
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
export const UpdateGroupDocument = gql`
  mutation updateGroup($input: UpdateUserGroupInput!) {
    updateUserGroup(userGroupData: $input) {
      id
      name
      profile {
        id
        visual(type: AVATAR) {
          ...VisualUri
        }
        description
        references {
          uri
          name
          description
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
export const UpdatePreferenceOnUserDocument = gql`
  mutation updatePreferenceOnUser($input: UpdateUserPreferenceInput!) {
    updatePreferenceOnUser(preferenceData: $input) {
      id
      value
    }
  }
`;
export type UpdatePreferenceOnUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferenceOnUserMutation,
  SchemaTypes.UpdatePreferenceOnUserMutationVariables
>;

/**
 * __useUpdatePreferenceOnUserMutation__
 *
 * To run a mutation, you first call `useUpdatePreferenceOnUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferenceOnUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferenceOnUserMutation, { data, loading, error }] = useUpdatePreferenceOnUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePreferenceOnUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferenceOnUserMutation,
    SchemaTypes.UpdatePreferenceOnUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdatePreferenceOnUserMutation,
    SchemaTypes.UpdatePreferenceOnUserMutationVariables
  >(UpdatePreferenceOnUserDocument, options);
}

export type UpdatePreferenceOnUserMutationHookResult = ReturnType<typeof useUpdatePreferenceOnUserMutation>;
export type UpdatePreferenceOnUserMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePreferenceOnUserMutation>;
export type UpdatePreferenceOnUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferenceOnUserMutation,
  SchemaTypes.UpdatePreferenceOnUserMutationVariables
>;
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

export const UserProfileDocument = gql`
  query userProfile($input: UUID_NAMEID_EMAIL!) {
    user(ID: $input) {
      isContactable
      ...UserDetails
      ...UserAgent
    }
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      ...UserRolesDetails
    }
    platform {
      authorization {
        ...MyPrivileges
      }
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
  ${UserRolesDetailsFragmentDoc}
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

export const UsersWithCredentialsDocument = gql`
  query usersWithCredentials($input: UsersWithAuthorizationCredentialInput!) {
    usersWithAuthorizationCredential(credentialsCriteriaData: $input) {
      id
      nameID
      firstName
      lastName
      email
      profile {
        id
        displayName
        visual(type: AVATAR) {
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
      profile {
        id
        displayName
      }
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

export const UserProviderDocument = gql`
  query UserProvider {
    me {
      user {
        ...UserDetails
        ...UserAgent
      }
      applications(states: ["new"]) {
        id
        communityID
        displayName
        state
        spaceID
        challengeID
        opportunityID
      }
      invitations(states: ["invited"]) {
        id
        spaceID
        challengeID
        opportunityID
        welcomeMessage
        createdBy
        createdDate
        state
      }
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserAgentFragmentDoc}
`;

/**
 * __useUserProviderQuery__
 *
 * To run a query within a React component, call `useUserProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProviderQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserProviderQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.UserProviderQuery, SchemaTypes.UserProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserProviderQuery, SchemaTypes.UserProviderQueryVariables>(
    UserProviderDocument,
    options
  );
}

export function useUserProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserProviderQuery, SchemaTypes.UserProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserProviderQuery, SchemaTypes.UserProviderQueryVariables>(
    UserProviderDocument,
    options
  );
}

export type UserProviderQueryHookResult = ReturnType<typeof useUserProviderQuery>;
export type UserProviderLazyQueryHookResult = ReturnType<typeof useUserProviderLazyQuery>;
export type UserProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.UserProviderQuery,
  SchemaTypes.UserProviderQueryVariables
>;
export function refetchUserProviderQuery(variables?: SchemaTypes.UserProviderQueryVariables) {
  return { query: UserProviderDocument, variables: variables };
}

export const UserListDocument = gql`
  query userList($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
      users {
        id
        nameID
        profile {
          id
          displayName
        }
        email
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

/**
 * __useUserListQuery__
 *
 * To run a query within a React component, call `useUserListQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserListQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useUserListQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserListQuery, SchemaTypes.UserListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserListQuery, SchemaTypes.UserListQueryVariables>(UserListDocument, options);
}

export function useUserListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserListQuery, SchemaTypes.UserListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserListQuery, SchemaTypes.UserListQueryVariables>(UserListDocument, options);
}

export type UserListQueryHookResult = ReturnType<typeof useUserListQuery>;
export type UserListLazyQueryHookResult = ReturnType<typeof useUserListLazyQuery>;
export type UserListQueryResult = Apollo.QueryResult<SchemaTypes.UserListQuery, SchemaTypes.UserListQueryVariables>;
export function refetchUserListQuery(variables: SchemaTypes.UserListQueryVariables) {
  return { query: UserListDocument, variables: variables };
}

export const SpaceCommunityContributorsDocument = gql`
  query SpaceCommunityContributors($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      host {
        ...OrganizationCard
      }
      community {
        id
        leadUsers: usersInRole(role: LEAD) {
          ...UserCard
        }
        memberUsers {
          ...UserCard
        }
        memberOrganizations: organizationsInRole(role: MEMBER) {
          ...OrganizationCard
        }
      }
    }
  }
  ${OrganizationCardFragmentDoc}
  ${UserCardFragmentDoc}
`;

/**
 * __useSpaceCommunityContributorsQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityContributorsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCommunityContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityContributorsQuery,
    SchemaTypes.SpaceCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCommunityContributorsQuery,
    SchemaTypes.SpaceCommunityContributorsQueryVariables
  >(SpaceCommunityContributorsDocument, options);
}

export function useSpaceCommunityContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityContributorsQuery,
    SchemaTypes.SpaceCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCommunityContributorsQuery,
    SchemaTypes.SpaceCommunityContributorsQueryVariables
  >(SpaceCommunityContributorsDocument, options);
}

export type SpaceCommunityContributorsQueryHookResult = ReturnType<typeof useSpaceCommunityContributorsQuery>;
export type SpaceCommunityContributorsLazyQueryHookResult = ReturnType<typeof useSpaceCommunityContributorsLazyQuery>;
export type SpaceCommunityContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityContributorsQuery,
  SchemaTypes.SpaceCommunityContributorsQueryVariables
>;
export function refetchSpaceCommunityContributorsQuery(
  variables: SchemaTypes.SpaceCommunityContributorsQueryVariables
) {
  return { query: SpaceCommunityContributorsDocument, variables: variables };
}

export const ChallengeCommunityContributorsDocument = gql`
  query ChallengeCommunityContributors($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        community {
          id
          ...CommunityMembers
        }
      }
    }
  }
  ${CommunityMembersFragmentDoc}
`;

/**
 * __useChallengeCommunityContributorsQuery__
 *
 * To run a query within a React component, call `useChallengeCommunityContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCommunityContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCommunityContributorsQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCommunityContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCommunityContributorsQuery,
    SchemaTypes.ChallengeCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCommunityContributorsQuery,
    SchemaTypes.ChallengeCommunityContributorsQueryVariables
  >(ChallengeCommunityContributorsDocument, options);
}

export function useChallengeCommunityContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityContributorsQuery,
    SchemaTypes.ChallengeCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCommunityContributorsQuery,
    SchemaTypes.ChallengeCommunityContributorsQueryVariables
  >(ChallengeCommunityContributorsDocument, options);
}

export type ChallengeCommunityContributorsQueryHookResult = ReturnType<typeof useChallengeCommunityContributorsQuery>;
export type ChallengeCommunityContributorsLazyQueryHookResult = ReturnType<
  typeof useChallengeCommunityContributorsLazyQuery
>;
export type ChallengeCommunityContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCommunityContributorsQuery,
  SchemaTypes.ChallengeCommunityContributorsQueryVariables
>;
export function refetchChallengeCommunityContributorsQuery(
  variables: SchemaTypes.ChallengeCommunityContributorsQueryVariables
) {
  return { query: ChallengeCommunityContributorsDocument, variables: variables };
}

export const OpportunityCommunityContributorsDocument = gql`
  query OpportunityCommunityContributors($opportunityId: UUID!) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        community {
          id
          ...CommunityMembers
        }
      }
    }
  }
  ${CommunityMembersFragmentDoc}
`;

/**
 * __useOpportunityCommunityContributorsQuery__
 *
 * To run a query within a React component, call `useOpportunityCommunityContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCommunityContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCommunityContributorsQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCommunityContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCommunityContributorsQuery,
    SchemaTypes.OpportunityCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCommunityContributorsQuery,
    SchemaTypes.OpportunityCommunityContributorsQueryVariables
  >(OpportunityCommunityContributorsDocument, options);
}

export function useOpportunityCommunityContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityContributorsQuery,
    SchemaTypes.OpportunityCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCommunityContributorsQuery,
    SchemaTypes.OpportunityCommunityContributorsQueryVariables
  >(OpportunityCommunityContributorsDocument, options);
}

export type OpportunityCommunityContributorsQueryHookResult = ReturnType<
  typeof useOpportunityCommunityContributorsQuery
>;
export type OpportunityCommunityContributorsLazyQueryHookResult = ReturnType<
  typeof useOpportunityCommunityContributorsLazyQuery
>;
export type OpportunityCommunityContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCommunityContributorsQuery,
  SchemaTypes.OpportunityCommunityContributorsQueryVariables
>;
export function refetchOpportunityCommunityContributorsQuery(
  variables: SchemaTypes.OpportunityCommunityContributorsQueryVariables
) {
  return { query: OpportunityCommunityContributorsDocument, variables: variables };
}

export const UserContributionDisplayNamesDocument = gql`
  query UserContributionDisplayNames($userId: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      spaces {
        id
        displayName
        challenges {
          id
          displayName
        }
        opportunities {
          id
          displayName
        }
      }
      organizations {
        id
        displayName
      }
    }
  }
`;

/**
 * __useUserContributionDisplayNamesQuery__
 *
 * To run a query within a React component, call `useUserContributionDisplayNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserContributionDisplayNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserContributionDisplayNamesQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserContributionDisplayNamesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserContributionDisplayNamesQuery,
    SchemaTypes.UserContributionDisplayNamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.UserContributionDisplayNamesQuery,
    SchemaTypes.UserContributionDisplayNamesQueryVariables
  >(UserContributionDisplayNamesDocument, options);
}

export function useUserContributionDisplayNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserContributionDisplayNamesQuery,
    SchemaTypes.UserContributionDisplayNamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.UserContributionDisplayNamesQuery,
    SchemaTypes.UserContributionDisplayNamesQueryVariables
  >(UserContributionDisplayNamesDocument, options);
}

export type UserContributionDisplayNamesQueryHookResult = ReturnType<typeof useUserContributionDisplayNamesQuery>;
export type UserContributionDisplayNamesLazyQueryHookResult = ReturnType<
  typeof useUserContributionDisplayNamesLazyQuery
>;
export type UserContributionDisplayNamesQueryResult = Apollo.QueryResult<
  SchemaTypes.UserContributionDisplayNamesQuery,
  SchemaTypes.UserContributionDisplayNamesQueryVariables
>;
export function refetchUserContributionDisplayNamesQuery(
  variables: SchemaTypes.UserContributionDisplayNamesQueryVariables
) {
  return { query: UserContributionDisplayNamesDocument, variables: variables };
}

export const UserContributionsDocument = gql`
  query UserContributions($userId: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      spaces {
        id
        nameID
        challenges {
          id
          nameID
        }
        opportunities {
          id
          nameID
        }
      }
    }
  }
`;

/**
 * __useUserContributionsQuery__
 *
 * To run a query within a React component, call `useUserContributionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserContributionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserContributionsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserContributionsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserContributionsQuery, SchemaTypes.UserContributionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserContributionsQuery, SchemaTypes.UserContributionsQueryVariables>(
    UserContributionsDocument,
    options
  );
}

export function useUserContributionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserContributionsQuery,
    SchemaTypes.UserContributionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserContributionsQuery, SchemaTypes.UserContributionsQueryVariables>(
    UserContributionsDocument,
    options
  );
}

export type UserContributionsQueryHookResult = ReturnType<typeof useUserContributionsQuery>;
export type UserContributionsLazyQueryHookResult = ReturnType<typeof useUserContributionsLazyQuery>;
export type UserContributionsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserContributionsQuery,
  SchemaTypes.UserContributionsQueryVariables
>;
export function refetchUserContributionsQuery(variables: SchemaTypes.UserContributionsQueryVariables) {
  return { query: UserContributionsDocument, variables: variables };
}

export const UserOrganizationIdsDocument = gql`
  query UserOrganizationIds($userId: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userId }) {
      organizations {
        id
      }
    }
  }
`;

/**
 * __useUserOrganizationIdsQuery__
 *
 * To run a query within a React component, call `useUserOrganizationIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserOrganizationIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserOrganizationIdsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserOrganizationIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserOrganizationIdsQuery,
    SchemaTypes.UserOrganizationIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserOrganizationIdsQuery, SchemaTypes.UserOrganizationIdsQueryVariables>(
    UserOrganizationIdsDocument,
    options
  );
}

export function useUserOrganizationIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserOrganizationIdsQuery,
    SchemaTypes.UserOrganizationIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserOrganizationIdsQuery, SchemaTypes.UserOrganizationIdsQueryVariables>(
    UserOrganizationIdsDocument,
    options
  );
}

export type UserOrganizationIdsQueryHookResult = ReturnType<typeof useUserOrganizationIdsQuery>;
export type UserOrganizationIdsLazyQueryHookResult = ReturnType<typeof useUserOrganizationIdsLazyQuery>;
export type UserOrganizationIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserOrganizationIdsQuery,
  SchemaTypes.UserOrganizationIdsQueryVariables
>;
export function refetchUserOrganizationIdsQuery(variables: SchemaTypes.UserOrganizationIdsQueryVariables) {
  return { query: UserOrganizationIdsDocument, variables: variables };
}

export const InnovationHubAvailableSpacesDocument = gql`
  query InnovationHubAvailableSpaces {
    spaces(filter: { visibilities: [ACTIVE, DEMO] }) {
      ...InnovationHubSpace
    }
  }
  ${InnovationHubSpaceFragmentDoc}
`;

/**
 * __useInnovationHubAvailableSpacesQuery__
 *
 * To run a query within a React component, call `useInnovationHubAvailableSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationHubAvailableSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationHubAvailableSpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useInnovationHubAvailableSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.InnovationHubAvailableSpacesQuery,
    SchemaTypes.InnovationHubAvailableSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationHubAvailableSpacesQuery,
    SchemaTypes.InnovationHubAvailableSpacesQueryVariables
  >(InnovationHubAvailableSpacesDocument, options);
}

export function useInnovationHubAvailableSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationHubAvailableSpacesQuery,
    SchemaTypes.InnovationHubAvailableSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationHubAvailableSpacesQuery,
    SchemaTypes.InnovationHubAvailableSpacesQueryVariables
  >(InnovationHubAvailableSpacesDocument, options);
}

export type InnovationHubAvailableSpacesQueryHookResult = ReturnType<typeof useInnovationHubAvailableSpacesQuery>;
export type InnovationHubAvailableSpacesLazyQueryHookResult = ReturnType<
  typeof useInnovationHubAvailableSpacesLazyQuery
>;
export type InnovationHubAvailableSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubAvailableSpacesQuery,
  SchemaTypes.InnovationHubAvailableSpacesQueryVariables
>;
export function refetchInnovationHubAvailableSpacesQuery(
  variables?: SchemaTypes.InnovationHubAvailableSpacesQueryVariables
) {
  return { query: InnovationHubAvailableSpacesDocument, variables: variables };
}

export const AdminInnovationHubsListDocument = gql`
  query AdminInnovationHubsList {
    platform {
      id
      innovationHubs {
        id
        nameID
        subdomain
        profile {
          id
          displayName
        }
      }
    }
  }
`;

/**
 * __useAdminInnovationHubsListQuery__
 *
 * To run a query within a React component, call `useAdminInnovationHubsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminInnovationHubsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminInnovationHubsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminInnovationHubsListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AdminInnovationHubsListQuery,
    SchemaTypes.AdminInnovationHubsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminInnovationHubsListQuery, SchemaTypes.AdminInnovationHubsListQueryVariables>(
    AdminInnovationHubsListDocument,
    options
  );
}

export function useAdminInnovationHubsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminInnovationHubsListQuery,
    SchemaTypes.AdminInnovationHubsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminInnovationHubsListQuery,
    SchemaTypes.AdminInnovationHubsListQueryVariables
  >(AdminInnovationHubsListDocument, options);
}

export type AdminInnovationHubsListQueryHookResult = ReturnType<typeof useAdminInnovationHubsListQuery>;
export type AdminInnovationHubsListLazyQueryHookResult = ReturnType<typeof useAdminInnovationHubsListLazyQuery>;
export type AdminInnovationHubsListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminInnovationHubsListQuery,
  SchemaTypes.AdminInnovationHubsListQueryVariables
>;
export function refetchAdminInnovationHubsListQuery(variables?: SchemaTypes.AdminInnovationHubsListQueryVariables) {
  return { query: AdminInnovationHubsListDocument, variables: variables };
}

export const DeleteInnovationHubDocument = gql`
  mutation deleteInnovationHub($innovationHubId: UUID!) {
    deleteInnovationHub(deleteData: { ID: $innovationHubId }) {
      id
    }
  }
`;
export type DeleteInnovationHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteInnovationHubMutation,
  SchemaTypes.DeleteInnovationHubMutationVariables
>;

/**
 * __useDeleteInnovationHubMutation__
 *
 * To run a mutation, you first call `useDeleteInnovationHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInnovationHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInnovationHubMutation, { data, loading, error }] = useDeleteInnovationHubMutation({
 *   variables: {
 *      innovationHubId: // value for 'innovationHubId'
 *   },
 * });
 */
export function useDeleteInnovationHubMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteInnovationHubMutation,
    SchemaTypes.DeleteInnovationHubMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteInnovationHubMutation, SchemaTypes.DeleteInnovationHubMutationVariables>(
    DeleteInnovationHubDocument,
    options
  );
}

export type DeleteInnovationHubMutationHookResult = ReturnType<typeof useDeleteInnovationHubMutation>;
export type DeleteInnovationHubMutationResult = Apollo.MutationResult<SchemaTypes.DeleteInnovationHubMutation>;
export type DeleteInnovationHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteInnovationHubMutation,
  SchemaTypes.DeleteInnovationHubMutationVariables
>;
export const AdminInnovationHubDocument = gql`
  query AdminInnovationHub($innovationHubId: UUID_NAMEID!) {
    platform {
      id
      innovationHub(id: $innovationHubId) {
        ...AdminInnovationHub
      }
    }
  }
  ${AdminInnovationHubFragmentDoc}
`;

/**
 * __useAdminInnovationHubQuery__
 *
 * To run a query within a React component, call `useAdminInnovationHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminInnovationHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminInnovationHubQuery({
 *   variables: {
 *      innovationHubId: // value for 'innovationHubId'
 *   },
 * });
 */
export function useAdminInnovationHubQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminInnovationHubQuery,
    SchemaTypes.AdminInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminInnovationHubQuery, SchemaTypes.AdminInnovationHubQueryVariables>(
    AdminInnovationHubDocument,
    options
  );
}

export function useAdminInnovationHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminInnovationHubQuery,
    SchemaTypes.AdminInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminInnovationHubQuery, SchemaTypes.AdminInnovationHubQueryVariables>(
    AdminInnovationHubDocument,
    options
  );
}

export type AdminInnovationHubQueryHookResult = ReturnType<typeof useAdminInnovationHubQuery>;
export type AdminInnovationHubLazyQueryHookResult = ReturnType<typeof useAdminInnovationHubLazyQuery>;
export type AdminInnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminInnovationHubQuery,
  SchemaTypes.AdminInnovationHubQueryVariables
>;
export function refetchAdminInnovationHubQuery(variables: SchemaTypes.AdminInnovationHubQueryVariables) {
  return { query: AdminInnovationHubDocument, variables: variables };
}

export const CreateInnovationHubDocument = gql`
  mutation createInnovationHub($hubData: CreateInnovationHubInput!) {
    createInnovationHub(createData: $hubData) {
      ...AdminInnovationHub
    }
  }
  ${AdminInnovationHubFragmentDoc}
`;
export type CreateInnovationHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateInnovationHubMutation,
  SchemaTypes.CreateInnovationHubMutationVariables
>;

/**
 * __useCreateInnovationHubMutation__
 *
 * To run a mutation, you first call `useCreateInnovationHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInnovationHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInnovationHubMutation, { data, loading, error }] = useCreateInnovationHubMutation({
 *   variables: {
 *      hubData: // value for 'hubData'
 *   },
 * });
 */
export function useCreateInnovationHubMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateInnovationHubMutation,
    SchemaTypes.CreateInnovationHubMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateInnovationHubMutation, SchemaTypes.CreateInnovationHubMutationVariables>(
    CreateInnovationHubDocument,
    options
  );
}

export type CreateInnovationHubMutationHookResult = ReturnType<typeof useCreateInnovationHubMutation>;
export type CreateInnovationHubMutationResult = Apollo.MutationResult<SchemaTypes.CreateInnovationHubMutation>;
export type CreateInnovationHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateInnovationHubMutation,
  SchemaTypes.CreateInnovationHubMutationVariables
>;
export const UpdateInnovationHubDocument = gql`
  mutation updateInnovationHub($hubData: UpdateInnovationHubInput!) {
    updateInnovationHub(updateData: $hubData) {
      ...AdminInnovationHub
    }
  }
  ${AdminInnovationHubFragmentDoc}
`;
export type UpdateInnovationHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationHubMutation,
  SchemaTypes.UpdateInnovationHubMutationVariables
>;

/**
 * __useUpdateInnovationHubMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationHubMutation, { data, loading, error }] = useUpdateInnovationHubMutation({
 *   variables: {
 *      hubData: // value for 'hubData'
 *   },
 * });
 */
export function useUpdateInnovationHubMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationHubMutation,
    SchemaTypes.UpdateInnovationHubMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateInnovationHubMutation, SchemaTypes.UpdateInnovationHubMutationVariables>(
    UpdateInnovationHubDocument,
    options
  );
}

export type UpdateInnovationHubMutationHookResult = ReturnType<typeof useUpdateInnovationHubMutation>;
export type UpdateInnovationHubMutationResult = Apollo.MutationResult<SchemaTypes.UpdateInnovationHubMutation>;
export type UpdateInnovationHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationHubMutation,
  SchemaTypes.UpdateInnovationHubMutationVariables
>;
export const InnovationHubDocument = gql`
  query InnovationHub($subdomain: String) {
    platform {
      id
      innovationHub(subdomain: $subdomain) {
        ...InnovationHubHomeInnovationHub
      }
    }
  }
  ${InnovationHubHomeInnovationHubFragmentDoc}
`;

/**
 * __useInnovationHubQuery__
 *
 * To run a query within a React component, call `useInnovationHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationHubQuery({
 *   variables: {
 *      subdomain: // value for 'subdomain'
 *   },
 * });
 */
export function useInnovationHubQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>(
    InnovationHubDocument,
    options
  );
}

export function useInnovationHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>(
    InnovationHubDocument,
    options
  );
}

export type InnovationHubQueryHookResult = ReturnType<typeof useInnovationHubQuery>;
export type InnovationHubLazyQueryHookResult = ReturnType<typeof useInnovationHubLazyQuery>;
export type InnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubQuery,
  SchemaTypes.InnovationHubQueryVariables
>;
export function refetchInnovationHubQuery(variables?: SchemaTypes.InnovationHubQueryVariables) {
  return { query: InnovationHubDocument, variables: variables };
}

export const ChallengeOpportunityCardsDocument = gql`
  query ChallengeOpportunityCards($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        opportunities {
          ...OpportunityCard
        }
      }
    }
  }
  ${OpportunityCardFragmentDoc}
`;

/**
 * __useChallengeOpportunityCardsQuery__
 *
 * To run a query within a React component, call `useChallengeOpportunityCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeOpportunityCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeOpportunityCardsQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeOpportunityCardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeOpportunityCardsQuery,
    SchemaTypes.ChallengeOpportunityCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeOpportunityCardsQuery,
    SchemaTypes.ChallengeOpportunityCardsQueryVariables
  >(ChallengeOpportunityCardsDocument, options);
}

export function useChallengeOpportunityCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeOpportunityCardsQuery,
    SchemaTypes.ChallengeOpportunityCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeOpportunityCardsQuery,
    SchemaTypes.ChallengeOpportunityCardsQueryVariables
  >(ChallengeOpportunityCardsDocument, options);
}

export type ChallengeOpportunityCardsQueryHookResult = ReturnType<typeof useChallengeOpportunityCardsQuery>;
export type ChallengeOpportunityCardsLazyQueryHookResult = ReturnType<typeof useChallengeOpportunityCardsLazyQuery>;
export type ChallengeOpportunityCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeOpportunityCardsQuery,
  SchemaTypes.ChallengeOpportunityCardsQueryVariables
>;
export function refetchChallengeOpportunityCardsQuery(variables: SchemaTypes.ChallengeOpportunityCardsQueryVariables) {
  return { query: ChallengeOpportunityCardsDocument, variables: variables };
}

export const ChallengePageDocument = gql`
  query challengePage($challengeId: UUID!) {
    lookup {
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

export const ChallengeDashboardReferencesDocument = gql`
  query ChallengeDashboardReferences($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          id
          references {
            id
            name
            uri
            description
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeDashboardReferencesQuery__
 *
 * To run a query within a React component, call `useChallengeDashboardReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeDashboardReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeDashboardReferencesQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeDashboardReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeDashboardReferencesQuery,
    SchemaTypes.ChallengeDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeDashboardReferencesQuery,
    SchemaTypes.ChallengeDashboardReferencesQueryVariables
  >(ChallengeDashboardReferencesDocument, options);
}

export function useChallengeDashboardReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeDashboardReferencesQuery,
    SchemaTypes.ChallengeDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeDashboardReferencesQuery,
    SchemaTypes.ChallengeDashboardReferencesQueryVariables
  >(ChallengeDashboardReferencesDocument, options);
}

export type ChallengeDashboardReferencesQueryHookResult = ReturnType<typeof useChallengeDashboardReferencesQuery>;
export type ChallengeDashboardReferencesLazyQueryHookResult = ReturnType<
  typeof useChallengeDashboardReferencesLazyQuery
>;
export type ChallengeDashboardReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeDashboardReferencesQuery,
  SchemaTypes.ChallengeDashboardReferencesQueryVariables
>;
export function refetchChallengeDashboardReferencesQuery(
  variables: SchemaTypes.ChallengeDashboardReferencesQueryVariables
) {
  return { query: ChallengeDashboardReferencesDocument, variables: variables };
}

export const ChallengeInfoDocument = gql`
  query challengeInfo($challengeId: UUID!) {
    lookup {
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
export const UpdateChallengeDocument = gql`
  mutation updateChallenge($input: UpdateChallengeInput!) {
    updateChallenge(challengeData: $input) {
      id
      nameID
      profile {
        id
        displayName
      }
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
export const UpdateChallengeInnovationFlowDocument = gql`
  mutation updateChallengeInnovationFlow($input: UpdateInnovationFlowInput!) {
    updateInnovationFlow(innovationFlowData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type UpdateChallengeInnovationFlowMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateChallengeInnovationFlowMutation,
  SchemaTypes.UpdateChallengeInnovationFlowMutationVariables
>;

/**
 * __useUpdateChallengeInnovationFlowMutation__
 *
 * To run a mutation, you first call `useUpdateChallengeInnovationFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChallengeInnovationFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChallengeInnovationFlowMutation, { data, loading, error }] = useUpdateChallengeInnovationFlowMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateChallengeInnovationFlowMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateChallengeInnovationFlowMutation,
    SchemaTypes.UpdateChallengeInnovationFlowMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateChallengeInnovationFlowMutation,
    SchemaTypes.UpdateChallengeInnovationFlowMutationVariables
  >(UpdateChallengeInnovationFlowDocument, options);
}

export type UpdateChallengeInnovationFlowMutationHookResult = ReturnType<
  typeof useUpdateChallengeInnovationFlowMutation
>;
export type UpdateChallengeInnovationFlowMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateChallengeInnovationFlowMutation>;
export type UpdateChallengeInnovationFlowMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateChallengeInnovationFlowMutation,
  SchemaTypes.UpdateChallengeInnovationFlowMutationVariables
>;
export const ChallengeApplicationTemplateDocument = gql`
  query challengeApplicationTemplate($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        community {
          id
          applicationForm {
            description
            questions {
              required
              question
              sortOrder
              explanation
              maxLength
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
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeApplicationTemplateQuery(
  baseOptions: Apollo.QueryHookOptions<
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
  variables: SchemaTypes.ChallengeApplicationTemplateQueryVariables
) {
  return { query: ChallengeApplicationTemplateDocument, variables: variables };
}

export const ChallengeProfileInfoDocument = gql`
  query challengeProfileInfo($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        nameID
        collaboration {
          id
        }
        profile {
          id
          displayName
          tagline
          description
          tagset {
            ...TagsetDetails
          }
          visuals {
            ...VisualFull
          }
          references {
            id
            name
            uri
            description
          }
          location {
            ...fullLocation
          }
        }
        collaboration {
          id
          innovationFlow {
            id
            currentState {
              displayName
            }
          }
        }
        context {
          ...ContextDetails
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${FullLocationFragmentDoc}
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

export const OpportunityCreatedDocument = gql`
  subscription OpportunityCreated($challengeID: UUID!) {
    opportunityCreated(challengeID: $challengeID) {
      opportunity {
        ...OpportunityCard
      }
    }
  }
  ${OpportunityCardFragmentDoc}
`;

/**
 * __useOpportunityCreatedSubscription__
 *
 * To run a query within a React component, call `useOpportunityCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCreatedSubscription({
 *   variables: {
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useOpportunityCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.OpportunityCreatedSubscription,
    SchemaTypes.OpportunityCreatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.OpportunityCreatedSubscription,
    SchemaTypes.OpportunityCreatedSubscriptionVariables
  >(OpportunityCreatedDocument, options);
}

export type OpportunityCreatedSubscriptionHookResult = ReturnType<typeof useOpportunityCreatedSubscription>;
export type OpportunityCreatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.OpportunityCreatedSubscription>;
export const AboutPageNonMembersDocument = gql`
  query AboutPageNonMembers(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      profile {
        id
        url
        displayName
        tagline
        description
        tagset {
          ...TagsetDetails
        }
        visuals {
          ...VisualFull
        }
      }
      host {
        ...AssociatedOrganizationDetails
      }
      metrics {
        ...MetricsItem
      }
      community {
        id
        authorization {
          id
          myPrivileges
        }
      }
      context {
        ...ContextTab
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        profile {
          id
          url
          displayName
          tagline
          description
          tagset {
            ...TagsetDetails
          }
          visuals {
            ...VisualFull
          }
        }
        authorization {
          id
          myPrivileges
        }
        collaboration {
          id
          innovationFlow {
            id
            currentState {
              displayName
            }
            states {
              displayName
              description
            }
          }
        }
        context {
          ...ContextTab
        }
        metrics {
          ...MetricsItem
        }
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        profile {
          id
          url
          displayName
          tagline
          description
          tagset {
            ...TagsetDetails
          }
          visuals {
            ...VisualFull
          }
        }
        collaboration {
          id
          innovationFlow {
            id
            currentState {
              displayName
            }
            states {
              displayName
              description
            }
          }
        }
        context {
          ...ContextTab
        }
        metrics {
          ...MetricsItem
        }
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${MetricsItemFragmentDoc}
  ${ContextTabFragmentDoc}
`;

/**
 * __useAboutPageNonMembersQuery__
 *
 * To run a query within a React component, call `useAboutPageNonMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAboutPageNonMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAboutPageNonMembersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useAboutPageNonMembersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AboutPageNonMembersQuery,
    SchemaTypes.AboutPageNonMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AboutPageNonMembersQuery, SchemaTypes.AboutPageNonMembersQueryVariables>(
    AboutPageNonMembersDocument,
    options
  );
}

export function useAboutPageNonMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AboutPageNonMembersQuery,
    SchemaTypes.AboutPageNonMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AboutPageNonMembersQuery, SchemaTypes.AboutPageNonMembersQueryVariables>(
    AboutPageNonMembersDocument,
    options
  );
}

export type AboutPageNonMembersQueryHookResult = ReturnType<typeof useAboutPageNonMembersQuery>;
export type AboutPageNonMembersLazyQueryHookResult = ReturnType<typeof useAboutPageNonMembersLazyQuery>;
export type AboutPageNonMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.AboutPageNonMembersQuery,
  SchemaTypes.AboutPageNonMembersQueryVariables
>;
export function refetchAboutPageNonMembersQuery(variables?: SchemaTypes.AboutPageNonMembersQueryVariables) {
  return { query: AboutPageNonMembersDocument, variables: variables };
}

export const AboutPageMembersDocument = gql`
  query AboutPageMembers(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $communityReadAccess: Boolean!
    $referencesReadAccess: Boolean!
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      community @include(if: $communityReadAccess) {
        ...EntityDashboardCommunity
      }
      profile {
        id
        references @include(if: $referencesReadAccess) {
          ...ReferenceDetails
        }
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        community @include(if: $communityReadAccess) {
          ...EntityDashboardCommunity
        }
        profile {
          id
          references @include(if: $referencesReadAccess) {
            ...ReferenceDetails
          }
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        community @include(if: $communityReadAccess) {
          ...EntityDashboardCommunity
        }
        profile {
          id
          references @include(if: $referencesReadAccess) {
            ...ReferenceDetails
          }
        }
      }
    }
  }
  ${EntityDashboardCommunityFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
`;

/**
 * __useAboutPageMembersQuery__
 *
 * To run a query within a React component, call `useAboutPageMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAboutPageMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAboutPageMembersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      communityReadAccess: // value for 'communityReadAccess'
 *      referencesReadAccess: // value for 'referencesReadAccess'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useAboutPageMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AboutPageMembersQuery, SchemaTypes.AboutPageMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AboutPageMembersQuery, SchemaTypes.AboutPageMembersQueryVariables>(
    AboutPageMembersDocument,
    options
  );
}

export function useAboutPageMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AboutPageMembersQuery,
    SchemaTypes.AboutPageMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AboutPageMembersQuery, SchemaTypes.AboutPageMembersQueryVariables>(
    AboutPageMembersDocument,
    options
  );
}

export type AboutPageMembersQueryHookResult = ReturnType<typeof useAboutPageMembersQuery>;
export type AboutPageMembersLazyQueryHookResult = ReturnType<typeof useAboutPageMembersLazyQuery>;
export type AboutPageMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.AboutPageMembersQuery,
  SchemaTypes.AboutPageMembersQueryVariables
>;
export function refetchAboutPageMembersQuery(variables: SchemaTypes.AboutPageMembersQueryVariables) {
  return { query: AboutPageMembersDocument, variables: variables };
}

export const CommunityFeedbackTemplatesDocument = gql`
  query communityFeedbackTemplates {
    platform {
      configuration {
        template {
          challenges {
            feedback {
              name
              questions {
                question
                required
                sortOrder
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * __useCommunityFeedbackTemplatesQuery__
 *
 * To run a query within a React component, call `useCommunityFeedbackTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityFeedbackTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityFeedbackTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCommunityFeedbackTemplatesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CommunityFeedbackTemplatesQuery,
    SchemaTypes.CommunityFeedbackTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CommunityFeedbackTemplatesQuery,
    SchemaTypes.CommunityFeedbackTemplatesQueryVariables
  >(CommunityFeedbackTemplatesDocument, options);
}

export function useCommunityFeedbackTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityFeedbackTemplatesQuery,
    SchemaTypes.CommunityFeedbackTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityFeedbackTemplatesQuery,
    SchemaTypes.CommunityFeedbackTemplatesQueryVariables
  >(CommunityFeedbackTemplatesDocument, options);
}

export type CommunityFeedbackTemplatesQueryHookResult = ReturnType<typeof useCommunityFeedbackTemplatesQuery>;
export type CommunityFeedbackTemplatesLazyQueryHookResult = ReturnType<typeof useCommunityFeedbackTemplatesLazyQuery>;
export type CommunityFeedbackTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityFeedbackTemplatesQuery,
  SchemaTypes.CommunityFeedbackTemplatesQueryVariables
>;
export function refetchCommunityFeedbackTemplatesQuery(
  variables?: SchemaTypes.CommunityFeedbackTemplatesQueryVariables
) {
  return { query: CommunityFeedbackTemplatesDocument, variables: variables };
}

export const CreateFeedbackOnCommunityContextDocument = gql`
  mutation createFeedbackOnCommunityContext($feedbackData: CreateFeedbackOnCommunityContextInput!) {
    createFeedbackOnCommunityContext(feedbackData: $feedbackData)
  }
`;
export type CreateFeedbackOnCommunityContextMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateFeedbackOnCommunityContextMutation,
  SchemaTypes.CreateFeedbackOnCommunityContextMutationVariables
>;

/**
 * __useCreateFeedbackOnCommunityContextMutation__
 *
 * To run a mutation, you first call `useCreateFeedbackOnCommunityContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFeedbackOnCommunityContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFeedbackOnCommunityContextMutation, { data, loading, error }] = useCreateFeedbackOnCommunityContextMutation({
 *   variables: {
 *      feedbackData: // value for 'feedbackData'
 *   },
 * });
 */
export function useCreateFeedbackOnCommunityContextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateFeedbackOnCommunityContextMutation,
    SchemaTypes.CreateFeedbackOnCommunityContextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateFeedbackOnCommunityContextMutation,
    SchemaTypes.CreateFeedbackOnCommunityContextMutationVariables
  >(CreateFeedbackOnCommunityContextDocument, options);
}

export type CreateFeedbackOnCommunityContextMutationHookResult = ReturnType<
  typeof useCreateFeedbackOnCommunityContextMutation
>;
export type CreateFeedbackOnCommunityContextMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateFeedbackOnCommunityContextMutation>;
export type CreateFeedbackOnCommunityContextMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateFeedbackOnCommunityContextMutation,
  SchemaTypes.CreateFeedbackOnCommunityContextMutationVariables
>;
export const CollaborationIdentityDocument = gql`
  query CollaborationIdentity(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $isSpace: Boolean = false
    $isChallenge: Boolean = false
    $isOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $isSpace) {
      id
      collaboration {
        id
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $isChallenge) {
        id
        collaboration {
          id
        }
      }
      opportunity(ID: $opportunityId) @include(if: $isOpportunity) {
        id
        collaboration {
          id
        }
      }
    }
  }
`;

/**
 * __useCollaborationIdentityQuery__
 *
 * To run a query within a React component, call `useCollaborationIdentityQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollaborationIdentityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollaborationIdentityQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      isSpace: // value for 'isSpace'
 *      isChallenge: // value for 'isChallenge'
 *      isOpportunity: // value for 'isOpportunity'
 *   },
 * });
 */
export function useCollaborationIdentityQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CollaborationIdentityQuery,
    SchemaTypes.CollaborationIdentityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CollaborationIdentityQuery, SchemaTypes.CollaborationIdentityQueryVariables>(
    CollaborationIdentityDocument,
    options
  );
}

export function useCollaborationIdentityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CollaborationIdentityQuery,
    SchemaTypes.CollaborationIdentityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CollaborationIdentityQuery, SchemaTypes.CollaborationIdentityQueryVariables>(
    CollaborationIdentityDocument,
    options
  );
}

export type CollaborationIdentityQueryHookResult = ReturnType<typeof useCollaborationIdentityQuery>;
export type CollaborationIdentityLazyQueryHookResult = ReturnType<typeof useCollaborationIdentityLazyQuery>;
export type CollaborationIdentityQueryResult = Apollo.QueryResult<
  SchemaTypes.CollaborationIdentityQuery,
  SchemaTypes.CollaborationIdentityQueryVariables
>;
export function refetchCollaborationIdentityQuery(variables?: SchemaTypes.CollaborationIdentityQueryVariables) {
  return { query: CollaborationIdentityDocument, variables: variables };
}

export const JourneyCommunityPrivilegesDocument = gql`
  query JourneyCommunityPrivileges(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      community {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
    }
  }
`;

/**
 * __useJourneyCommunityPrivilegesQuery__
 *
 * To run a query within a React component, call `useJourneyCommunityPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyCommunityPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyCommunityPrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useJourneyCommunityPrivilegesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.JourneyCommunityPrivilegesQuery,
    SchemaTypes.JourneyCommunityPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.JourneyCommunityPrivilegesQuery,
    SchemaTypes.JourneyCommunityPrivilegesQueryVariables
  >(JourneyCommunityPrivilegesDocument, options);
}

export function useJourneyCommunityPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyCommunityPrivilegesQuery,
    SchemaTypes.JourneyCommunityPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.JourneyCommunityPrivilegesQuery,
    SchemaTypes.JourneyCommunityPrivilegesQueryVariables
  >(JourneyCommunityPrivilegesDocument, options);
}

export type JourneyCommunityPrivilegesQueryHookResult = ReturnType<typeof useJourneyCommunityPrivilegesQuery>;
export type JourneyCommunityPrivilegesLazyQueryHookResult = ReturnType<typeof useJourneyCommunityPrivilegesLazyQuery>;
export type JourneyCommunityPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyCommunityPrivilegesQuery,
  SchemaTypes.JourneyCommunityPrivilegesQueryVariables
>;
export function refetchJourneyCommunityPrivilegesQuery(
  variables?: SchemaTypes.JourneyCommunityPrivilegesQueryVariables
) {
  return { query: JourneyCommunityPrivilegesDocument, variables: variables };
}

export const JourneyDataDocument = gql`
  query JourneyData(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $includeCommunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      profile {
        ...ProfileJourneyData
      }
      context {
        ...ContextJourneyData
      }
      community @include(if: $includeCommunity) {
        ...JourneyCommunity
      }
      metrics {
        ...MetricsItem
      }
      host {
        ...AssociatedOrganizationDetails
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        profile {
          ...ProfileJourneyData
        }
        context {
          ...ContextJourneyData
        }
        community @include(if: $includeCommunity) {
          ...JourneyCommunity
        }
        metrics {
          ...MetricsItem
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        profile {
          ...ProfileJourneyData
        }
        context {
          ...ContextJourneyData
        }
        community @include(if: $includeCommunity) {
          ...JourneyCommunity
        }
        metrics {
          ...MetricsItem
        }
      }
    }
  }
  ${ProfileJourneyDataFragmentDoc}
  ${ContextJourneyDataFragmentDoc}
  ${JourneyCommunityFragmentDoc}
  ${MetricsItemFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
`;

/**
 * __useJourneyDataQuery__
 *
 * To run a query within a React component, call `useJourneyDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyDataQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      includeCommunity: // value for 'includeCommunity'
 *   },
 * });
 */
export function useJourneyDataQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.JourneyDataQuery, SchemaTypes.JourneyDataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.JourneyDataQuery, SchemaTypes.JourneyDataQueryVariables>(
    JourneyDataDocument,
    options
  );
}

export function useJourneyDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.JourneyDataQuery, SchemaTypes.JourneyDataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.JourneyDataQuery, SchemaTypes.JourneyDataQueryVariables>(
    JourneyDataDocument,
    options
  );
}

export type JourneyDataQueryHookResult = ReturnType<typeof useJourneyDataQuery>;
export type JourneyDataLazyQueryHookResult = ReturnType<typeof useJourneyDataLazyQuery>;
export type JourneyDataQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyDataQuery,
  SchemaTypes.JourneyDataQueryVariables
>;
export function refetchJourneyDataQuery(variables?: SchemaTypes.JourneyDataQueryVariables) {
  return { query: JourneyDataDocument, variables: variables };
}

export const JourneyPrivilegesDocument = gql`
  query JourneyPrivileges(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      authorization {
        id
        myPrivileges
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        authorization {
          id
          myPrivileges
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
`;

/**
 * __useJourneyPrivilegesQuery__
 *
 * To run a query within a React component, call `useJourneyPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyPrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useJourneyPrivilegesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.JourneyPrivilegesQuery, SchemaTypes.JourneyPrivilegesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.JourneyPrivilegesQuery, SchemaTypes.JourneyPrivilegesQueryVariables>(
    JourneyPrivilegesDocument,
    options
  );
}

export function useJourneyPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyPrivilegesQuery,
    SchemaTypes.JourneyPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.JourneyPrivilegesQuery, SchemaTypes.JourneyPrivilegesQueryVariables>(
    JourneyPrivilegesDocument,
    options
  );
}

export type JourneyPrivilegesQueryHookResult = ReturnType<typeof useJourneyPrivilegesQuery>;
export type JourneyPrivilegesLazyQueryHookResult = ReturnType<typeof useJourneyPrivilegesLazyQuery>;
export type JourneyPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyPrivilegesQuery,
  SchemaTypes.JourneyPrivilegesQueryVariables
>;
export function refetchJourneyPrivilegesQuery(variables?: SchemaTypes.JourneyPrivilegesQueryVariables) {
  return { query: JourneyPrivilegesDocument, variables: variables };
}

export const JourneyBreadcrumbsInnovationHubDocument = gql`
  query JourneyBreadcrumbsInnovationHub {
    platform {
      innovationHub {
        id
        profile {
          id
          displayName
          avatar: visual(type: BANNER_WIDE) {
            id
            ...VisualUri
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useJourneyBreadcrumbsInnovationHubQuery__
 *
 * To run a query within a React component, call `useJourneyBreadcrumbsInnovationHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyBreadcrumbsInnovationHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyBreadcrumbsInnovationHubQuery({
 *   variables: {
 *   },
 * });
 */
export function useJourneyBreadcrumbsInnovationHubQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsInnovationHubQuery,
    SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.JourneyBreadcrumbsInnovationHubQuery,
    SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
  >(JourneyBreadcrumbsInnovationHubDocument, options);
}

export function useJourneyBreadcrumbsInnovationHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsInnovationHubQuery,
    SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.JourneyBreadcrumbsInnovationHubQuery,
    SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
  >(JourneyBreadcrumbsInnovationHubDocument, options);
}

export type JourneyBreadcrumbsInnovationHubQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsInnovationHubQuery>;
export type JourneyBreadcrumbsInnovationHubLazyQueryHookResult = ReturnType<
  typeof useJourneyBreadcrumbsInnovationHubLazyQuery
>;
export type JourneyBreadcrumbsInnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyBreadcrumbsInnovationHubQuery,
  SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
>;
export function refetchJourneyBreadcrumbsInnovationHubQuery(
  variables?: SchemaTypes.JourneyBreadcrumbsInnovationHubQueryVariables
) {
  return { query: JourneyBreadcrumbsInnovationHubDocument, variables: variables };
}

export const JourneyBreadcrumbsSpaceDocument = gql`
  query JourneyBreadcrumbsSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        url
        displayName
        avatar: visual(type: BANNER) {
          id
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useJourneyBreadcrumbsSpaceQuery__
 *
 * To run a query within a React component, call `useJourneyBreadcrumbsSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyBreadcrumbsSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyBreadcrumbsSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useJourneyBreadcrumbsSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsSpaceQuery,
    SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.JourneyBreadcrumbsSpaceQuery, SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables>(
    JourneyBreadcrumbsSpaceDocument,
    options
  );
}

export function useJourneyBreadcrumbsSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsSpaceQuery,
    SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.JourneyBreadcrumbsSpaceQuery,
    SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables
  >(JourneyBreadcrumbsSpaceDocument, options);
}

export type JourneyBreadcrumbsSpaceQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsSpaceQuery>;
export type JourneyBreadcrumbsSpaceLazyQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsSpaceLazyQuery>;
export type JourneyBreadcrumbsSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyBreadcrumbsSpaceQuery,
  SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables
>;
export function refetchJourneyBreadcrumbsSpaceQuery(variables: SchemaTypes.JourneyBreadcrumbsSpaceQueryVariables) {
  return { query: JourneyBreadcrumbsSpaceDocument, variables: variables };
}

export const JourneyBreadcrumbsChallengeDocument = gql`
  query JourneyBreadcrumbsChallenge($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          ...JourneyBreadcrumbsProfile
        }
      }
    }
  }
  ${JourneyBreadcrumbsProfileFragmentDoc}
`;

/**
 * __useJourneyBreadcrumbsChallengeQuery__
 *
 * To run a query within a React component, call `useJourneyBreadcrumbsChallengeQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyBreadcrumbsChallengeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyBreadcrumbsChallengeQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useJourneyBreadcrumbsChallengeQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsChallengeQuery,
    SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.JourneyBreadcrumbsChallengeQuery,
    SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
  >(JourneyBreadcrumbsChallengeDocument, options);
}

export function useJourneyBreadcrumbsChallengeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsChallengeQuery,
    SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.JourneyBreadcrumbsChallengeQuery,
    SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
  >(JourneyBreadcrumbsChallengeDocument, options);
}

export type JourneyBreadcrumbsChallengeQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsChallengeQuery>;
export type JourneyBreadcrumbsChallengeLazyQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsChallengeLazyQuery>;
export type JourneyBreadcrumbsChallengeQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyBreadcrumbsChallengeQuery,
  SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
>;
export function refetchJourneyBreadcrumbsChallengeQuery(
  variables: SchemaTypes.JourneyBreadcrumbsChallengeQueryVariables
) {
  return { query: JourneyBreadcrumbsChallengeDocument, variables: variables };
}

export const JourneyBreadcrumbsOpportunityDocument = gql`
  query JourneyBreadcrumbsOpportunity($opportunityId: UUID!) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        profile {
          ...JourneyBreadcrumbsProfile
        }
      }
    }
  }
  ${JourneyBreadcrumbsProfileFragmentDoc}
`;

/**
 * __useJourneyBreadcrumbsOpportunityQuery__
 *
 * To run a query within a React component, call `useJourneyBreadcrumbsOpportunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyBreadcrumbsOpportunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyBreadcrumbsOpportunityQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useJourneyBreadcrumbsOpportunityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsOpportunityQuery,
    SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.JourneyBreadcrumbsOpportunityQuery,
    SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
  >(JourneyBreadcrumbsOpportunityDocument, options);
}

export function useJourneyBreadcrumbsOpportunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyBreadcrumbsOpportunityQuery,
    SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.JourneyBreadcrumbsOpportunityQuery,
    SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
  >(JourneyBreadcrumbsOpportunityDocument, options);
}

export type JourneyBreadcrumbsOpportunityQueryHookResult = ReturnType<typeof useJourneyBreadcrumbsOpportunityQuery>;
export type JourneyBreadcrumbsOpportunityLazyQueryHookResult = ReturnType<
  typeof useJourneyBreadcrumbsOpportunityLazyQuery
>;
export type JourneyBreadcrumbsOpportunityQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyBreadcrumbsOpportunityQuery,
  SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
>;
export function refetchJourneyBreadcrumbsOpportunityQuery(
  variables: SchemaTypes.JourneyBreadcrumbsOpportunityQueryVariables
) {
  return { query: JourneyBreadcrumbsOpportunityDocument, variables: variables };
}

export const OpportunityPageDocument = gql`
  query opportunityPage($opportunityId: UUID!) {
    lookup {
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

export const OpportunityProviderDocument = gql`
  query opportunityProvider($opportunityId: UUID!) {
    lookup {
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
export const UpdateOpportunityDocument = gql`
  mutation updateOpportunity($input: UpdateOpportunityInput!) {
    updateOpportunity(opportunityData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const UpdateOpportunityInnovationFlowDocument = gql`
  mutation updateOpportunityInnovationFlow($input: UpdateInnovationFlowInput!) {
    updateInnovationFlow(innovationFlowData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type UpdateOpportunityInnovationFlowMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateOpportunityInnovationFlowMutation,
  SchemaTypes.UpdateOpportunityInnovationFlowMutationVariables
>;

/**
 * __useUpdateOpportunityInnovationFlowMutation__
 *
 * To run a mutation, you first call `useUpdateOpportunityInnovationFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOpportunityInnovationFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOpportunityInnovationFlowMutation, { data, loading, error }] = useUpdateOpportunityInnovationFlowMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOpportunityInnovationFlowMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateOpportunityInnovationFlowMutation,
    SchemaTypes.UpdateOpportunityInnovationFlowMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateOpportunityInnovationFlowMutation,
    SchemaTypes.UpdateOpportunityInnovationFlowMutationVariables
  >(UpdateOpportunityInnovationFlowDocument, options);
}

export type UpdateOpportunityInnovationFlowMutationHookResult = ReturnType<
  typeof useUpdateOpportunityInnovationFlowMutation
>;
export type UpdateOpportunityInnovationFlowMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateOpportunityInnovationFlowMutation>;
export type UpdateOpportunityInnovationFlowMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateOpportunityInnovationFlowMutation,
  SchemaTypes.UpdateOpportunityInnovationFlowMutationVariables
>;
export const OpportunitiesDocument = gql`
  query opportunities($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        opportunities {
          id
          nameID
          profile {
            id
            displayName
          }
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

export const OpportunityProfileInfoDocument = gql`
  query opportunityProfileInfo($opportunityId: UUID!) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        nameID
        profile {
          id
          displayName
          description
          tagline
          tagset {
            ...TagsetDetails
          }
          visuals {
            ...VisualFull
          }
          location {
            ...fullLocation
          }
          references {
            id
            name
            description
            uri
          }
        }
        context {
          ...ContextDetails
        }
        collaboration {
          id
          innovationFlow {
            id
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${FullLocationFragmentDoc}
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

export const SpaceCommunityPageDocument = gql`
  query SpaceCommunityPage($spaceNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      host {
        ...AssociatedOrganizationDetails
      }
      community {
        ...CommunityPageCommunity
      }
      collaboration {
        id
      }
    }
  }
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${CommunityPageCommunityFragmentDoc}
`;

/**
 * __useSpaceCommunityPageQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityPageQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *   },
 * });
 */
export function useSpaceCommunityPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityPageQuery,
    SchemaTypes.SpaceCommunityPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityPageQuery, SchemaTypes.SpaceCommunityPageQueryVariables>(
    SpaceCommunityPageDocument,
    options
  );
}

export function useSpaceCommunityPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityPageQuery,
    SchemaTypes.SpaceCommunityPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCommunityPageQuery, SchemaTypes.SpaceCommunityPageQueryVariables>(
    SpaceCommunityPageDocument,
    options
  );
}

export type SpaceCommunityPageQueryHookResult = ReturnType<typeof useSpaceCommunityPageQuery>;
export type SpaceCommunityPageLazyQueryHookResult = ReturnType<typeof useSpaceCommunityPageLazyQuery>;
export type SpaceCommunityPageQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityPageQuery,
  SchemaTypes.SpaceCommunityPageQueryVariables
>;
export function refetchSpaceCommunityPageQuery(variables: SchemaTypes.SpaceCommunityPageQueryVariables) {
  return { query: SpaceCommunityPageDocument, variables: variables };
}

export const SpaceProviderDocument = gql`
  query spaceProvider($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      ...SpaceInfo
    }
  }
  ${SpaceInfoFragmentDoc}
`;

/**
 * __useSpaceProviderQuery__
 *
 * To run a query within a React component, call `useSpaceProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceProviderQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceProviderQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceProviderQuery, SchemaTypes.SpaceProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceProviderQuery, SchemaTypes.SpaceProviderQueryVariables>(
    SpaceProviderDocument,
    options
  );
}

export function useSpaceProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceProviderQuery, SchemaTypes.SpaceProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceProviderQuery, SchemaTypes.SpaceProviderQueryVariables>(
    SpaceProviderDocument,
    options
  );
}

export type SpaceProviderQueryHookResult = ReturnType<typeof useSpaceProviderQuery>;
export type SpaceProviderLazyQueryHookResult = ReturnType<typeof useSpaceProviderLazyQuery>;
export type SpaceProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceProviderQuery,
  SchemaTypes.SpaceProviderQueryVariables
>;
export function refetchSpaceProviderQuery(variables: SchemaTypes.SpaceProviderQueryVariables) {
  return { query: SpaceProviderDocument, variables: variables };
}

export const SpaceHostDocument = gql`
  query spaceHost($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      host {
        id
        nameID
        profile {
          id
          displayName
          avatar: visual(type: AVATAR) {
            id
            uri
          }
          location {
            id
            city
            country
          }
          tagsets {
            id
            tags
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceHostQuery__
 *
 * To run a query within a React component, call `useSpaceHostQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceHostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceHostQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceHostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceHostQuery, SchemaTypes.SpaceHostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceHostQuery, SchemaTypes.SpaceHostQueryVariables>(SpaceHostDocument, options);
}

export function useSpaceHostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceHostQuery, SchemaTypes.SpaceHostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceHostQuery, SchemaTypes.SpaceHostQueryVariables>(
    SpaceHostDocument,
    options
  );
}

export type SpaceHostQueryHookResult = ReturnType<typeof useSpaceHostQuery>;
export type SpaceHostLazyQueryHookResult = ReturnType<typeof useSpaceHostLazyQuery>;
export type SpaceHostQueryResult = Apollo.QueryResult<SchemaTypes.SpaceHostQuery, SchemaTypes.SpaceHostQueryVariables>;
export function refetchSpaceHostQuery(variables: SchemaTypes.SpaceHostQueryVariables) {
  return { query: SpaceHostDocument, variables: variables };
}

export const SpacePageDocument = gql`
  query spacePage(
    $spaceId: UUID_NAMEID!
    $authorizedReadAccess: Boolean = false
    $authorizedReadAccessCommunity: Boolean = false
  ) {
    space(ID: $spaceId) {
      ...SpacePage
    }
  }
  ${SpacePageFragmentDoc}
`;

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
 *      spaceId: // value for 'spaceId'
 *      authorizedReadAccess: // value for 'authorizedReadAccess'
 *      authorizedReadAccessCommunity: // value for 'authorizedReadAccessCommunity'
 *   },
 * });
 */
export function useSpacePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>
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

export type SpacePageQueryHookResult = ReturnType<typeof useSpacePageQuery>;
export type SpacePageLazyQueryHookResult = ReturnType<typeof useSpacePageLazyQuery>;
export type SpacePageQueryResult = Apollo.QueryResult<SchemaTypes.SpacePageQuery, SchemaTypes.SpacePageQueryVariables>;
export function refetchSpacePageQuery(variables: SchemaTypes.SpacePageQueryVariables) {
  return { query: SpacePageDocument, variables: variables };
}

export const SpaceDashboardReferencesDocument = gql`
  query SpaceDashboardReferences($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        references {
          id
          name
          uri
          description
        }
      }
    }
  }
`;

/**
 * __useSpaceDashboardReferencesQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardReferencesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDashboardReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardReferencesQuery,
    SchemaTypes.SpaceDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceDashboardReferencesQuery, SchemaTypes.SpaceDashboardReferencesQueryVariables>(
    SpaceDashboardReferencesDocument,
    options
  );
}

export function useSpaceDashboardReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardReferencesQuery,
    SchemaTypes.SpaceDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardReferencesQuery,
    SchemaTypes.SpaceDashboardReferencesQueryVariables
  >(SpaceDashboardReferencesDocument, options);
}

export type SpaceDashboardReferencesQueryHookResult = ReturnType<typeof useSpaceDashboardReferencesQuery>;
export type SpaceDashboardReferencesLazyQueryHookResult = ReturnType<typeof useSpaceDashboardReferencesLazyQuery>;
export type SpaceDashboardReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardReferencesQuery,
  SchemaTypes.SpaceDashboardReferencesQueryVariables
>;
export function refetchSpaceDashboardReferencesQuery(variables: SchemaTypes.SpaceDashboardReferencesQueryVariables) {
  return { query: SpaceDashboardReferencesDocument, variables: variables };
}

export const SpaceDashboardNavigationChallengesDocument = gql`
  query SpaceDashboardNavigationChallenges($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenges {
        id
        profile {
          ...SpaceDashboardNavigationProfile
        }
        context {
          ...SpaceDashboardNavigationContext
        }
        authorization {
          id
          myPrivileges
        }
        community {
          ...SpaceDashboardNavigationCommunity
        }
      }
      account {
        id
        license {
          id
          visibility
        }
      }
    }
  }
  ${SpaceDashboardNavigationProfileFragmentDoc}
  ${SpaceDashboardNavigationContextFragmentDoc}
  ${SpaceDashboardNavigationCommunityFragmentDoc}
`;

/**
 * __useSpaceDashboardNavigationChallengesQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardNavigationChallengesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardNavigationChallengesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardNavigationChallengesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDashboardNavigationChallengesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationChallengesQuery,
    SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceDashboardNavigationChallengesQuery,
    SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
  >(SpaceDashboardNavigationChallengesDocument, options);
}

export function useSpaceDashboardNavigationChallengesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationChallengesQuery,
    SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardNavigationChallengesQuery,
    SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
  >(SpaceDashboardNavigationChallengesDocument, options);
}

export type SpaceDashboardNavigationChallengesQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationChallengesQuery
>;
export type SpaceDashboardNavigationChallengesLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationChallengesLazyQuery
>;
export type SpaceDashboardNavigationChallengesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardNavigationChallengesQuery,
  SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
>;
export function refetchSpaceDashboardNavigationChallengesQuery(
  variables: SchemaTypes.SpaceDashboardNavigationChallengesQueryVariables
) {
  return { query: SpaceDashboardNavigationChallengesDocument, variables: variables };
}

export const SpaceDashboardNavigationOpportunitiesDocument = gql`
  query SpaceDashboardNavigationOpportunities($spaceId: UUID_NAMEID!, $challengeIds: [UUID!]!) {
    space(ID: $spaceId) {
      id
      challenges(IDs: $challengeIds) {
        id
        opportunities {
          id
          profile {
            ...SpaceDashboardNavigationProfile
          }
          context {
            ...SpaceDashboardNavigationContext
          }
          community {
            ...SpaceDashboardNavigationCommunity
          }
        }
      }
    }
  }
  ${SpaceDashboardNavigationProfileFragmentDoc}
  ${SpaceDashboardNavigationContextFragmentDoc}
  ${SpaceDashboardNavigationCommunityFragmentDoc}
`;

/**
 * __useSpaceDashboardNavigationOpportunitiesQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardNavigationOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardNavigationOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardNavigationOpportunitiesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeIds: // value for 'challengeIds'
 *   },
 * });
 */
export function useSpaceDashboardNavigationOpportunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQuery,
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQuery,
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
  >(SpaceDashboardNavigationOpportunitiesDocument, options);
}

export function useSpaceDashboardNavigationOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQuery,
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQuery,
    SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
  >(SpaceDashboardNavigationOpportunitiesDocument, options);
}

export type SpaceDashboardNavigationOpportunitiesQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationOpportunitiesQuery
>;
export type SpaceDashboardNavigationOpportunitiesLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationOpportunitiesLazyQuery
>;
export type SpaceDashboardNavigationOpportunitiesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardNavigationOpportunitiesQuery,
  SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
>;
export function refetchSpaceDashboardNavigationOpportunitiesQuery(
  variables: SchemaTypes.SpaceDashboardNavigationOpportunitiesQueryVariables
) {
  return { query: SpaceDashboardNavigationOpportunitiesDocument, variables: variables };
}

export const CalloutFormTemplatesFromSpaceDocument = gql`
  query CalloutFormTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          postTemplates {
            ...PostTemplateCard
          }
          whiteboardTemplates {
            ...WhiteboardTemplateCard
          }
        }
      }
    }
  }
  ${PostTemplateCardFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
`;

/**
 * __useCalloutFormTemplatesFromSpaceQuery__
 *
 * To run a query within a React component, call `useCalloutFormTemplatesFromSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutFormTemplatesFromSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutFormTemplatesFromSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useCalloutFormTemplatesFromSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutFormTemplatesFromSpaceQuery,
    SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutFormTemplatesFromSpaceQuery,
    SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
  >(CalloutFormTemplatesFromSpaceDocument, options);
}

export function useCalloutFormTemplatesFromSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutFormTemplatesFromSpaceQuery,
    SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutFormTemplatesFromSpaceQuery,
    SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
  >(CalloutFormTemplatesFromSpaceDocument, options);
}

export type CalloutFormTemplatesFromSpaceQueryHookResult = ReturnType<typeof useCalloutFormTemplatesFromSpaceQuery>;
export type CalloutFormTemplatesFromSpaceLazyQueryHookResult = ReturnType<
  typeof useCalloutFormTemplatesFromSpaceLazyQuery
>;
export type CalloutFormTemplatesFromSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutFormTemplatesFromSpaceQuery,
  SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
>;
export function refetchCalloutFormTemplatesFromSpaceQuery(
  variables: SchemaTypes.CalloutFormTemplatesFromSpaceQueryVariables
) {
  return { query: CalloutFormTemplatesFromSpaceDocument, variables: variables };
}

export const WhiteboardTemplatesFromSpaceDocument = gql`
  query WhiteboardTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          whiteboardTemplates {
            ...WhiteboardTemplateCard
          }
        }
      }
    }
  }
  ${WhiteboardTemplateCardFragmentDoc}
`;

/**
 * __useWhiteboardTemplatesFromSpaceQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplatesFromSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplatesFromSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplatesFromSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useWhiteboardTemplatesFromSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplatesFromSpaceQuery,
    SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardTemplatesFromSpaceQuery,
    SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
  >(WhiteboardTemplatesFromSpaceDocument, options);
}

export function useWhiteboardTemplatesFromSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplatesFromSpaceQuery,
    SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardTemplatesFromSpaceQuery,
    SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
  >(WhiteboardTemplatesFromSpaceDocument, options);
}

export type WhiteboardTemplatesFromSpaceQueryHookResult = ReturnType<typeof useWhiteboardTemplatesFromSpaceQuery>;
export type WhiteboardTemplatesFromSpaceLazyQueryHookResult = ReturnType<
  typeof useWhiteboardTemplatesFromSpaceLazyQuery
>;
export type WhiteboardTemplatesFromSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplatesFromSpaceQuery,
  SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
>;
export function refetchWhiteboardTemplatesFromSpaceQuery(
  variables: SchemaTypes.WhiteboardTemplatesFromSpaceQueryVariables
) {
  return { query: WhiteboardTemplatesFromSpaceDocument, variables: variables };
}

export const InnovationFlowTemplatesFromSpaceDocument = gql`
  query InnovationFlowTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          innovationFlowTemplates {
            ...InnovationFlowTemplateCard
          }
        }
      }
    }
  }
  ${InnovationFlowTemplateCardFragmentDoc}
`;

/**
 * __useInnovationFlowTemplatesFromSpaceQuery__
 *
 * To run a query within a React component, call `useInnovationFlowTemplatesFromSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowTemplatesFromSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowTemplatesFromSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useInnovationFlowTemplatesFromSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowTemplatesFromSpaceQuery,
    SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationFlowTemplatesFromSpaceQuery,
    SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
  >(InnovationFlowTemplatesFromSpaceDocument, options);
}

export function useInnovationFlowTemplatesFromSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowTemplatesFromSpaceQuery,
    SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationFlowTemplatesFromSpaceQuery,
    SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
  >(InnovationFlowTemplatesFromSpaceDocument, options);
}

export type InnovationFlowTemplatesFromSpaceQueryHookResult = ReturnType<
  typeof useInnovationFlowTemplatesFromSpaceQuery
>;
export type InnovationFlowTemplatesFromSpaceLazyQueryHookResult = ReturnType<
  typeof useInnovationFlowTemplatesFromSpaceLazyQuery
>;
export type InnovationFlowTemplatesFromSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowTemplatesFromSpaceQuery,
  SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
>;
export function refetchInnovationFlowTemplatesFromSpaceQuery(
  variables: SchemaTypes.InnovationFlowTemplatesFromSpaceQueryVariables
) {
  return { query: InnovationFlowTemplatesFromSpaceDocument, variables: variables };
}

export const SpaceChallengeCardsDocument = gql`
  query SpaceChallengeCards($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenges {
        ...ChallengeCard
      }
    }
  }
  ${ChallengeCardFragmentDoc}
`;

/**
 * __useSpaceChallengeCardsQuery__
 *
 * To run a query within a React component, call `useSpaceChallengeCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceChallengeCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceChallengeCardsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceChallengeCardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceChallengeCardsQuery,
    SchemaTypes.SpaceChallengeCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceChallengeCardsQuery, SchemaTypes.SpaceChallengeCardsQueryVariables>(
    SpaceChallengeCardsDocument,
    options
  );
}

export function useSpaceChallengeCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceChallengeCardsQuery,
    SchemaTypes.SpaceChallengeCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceChallengeCardsQuery, SchemaTypes.SpaceChallengeCardsQueryVariables>(
    SpaceChallengeCardsDocument,
    options
  );
}

export type SpaceChallengeCardsQueryHookResult = ReturnType<typeof useSpaceChallengeCardsQuery>;
export type SpaceChallengeCardsLazyQueryHookResult = ReturnType<typeof useSpaceChallengeCardsLazyQuery>;
export type SpaceChallengeCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceChallengeCardsQuery,
  SchemaTypes.SpaceChallengeCardsQueryVariables
>;
export function refetchSpaceChallengeCardsQuery(variables: SchemaTypes.SpaceChallengeCardsQueryVariables) {
  return { query: SpaceChallengeCardsDocument, variables: variables };
}

export const CreateSpaceDocument = gql`
  mutation createSpace($input: CreateSpaceInput!) {
    createSpace(spaceData: $input) {
      ...SpaceDetails
    }
  }
  ${SpaceDetailsFragmentDoc}
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
export const DeleteSpaceDocument = gql`
  mutation deleteSpace($input: DeleteSpaceInput!) {
    deleteSpace(deleteData: $input) {
      id
      nameID
    }
  }
`;
export type DeleteSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteSpaceMutation,
  SchemaTypes.DeleteSpaceMutationVariables
>;

/**
 * __useDeleteSpaceMutation__
 *
 * To run a mutation, you first call `useDeleteSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSpaceMutation, { data, loading, error }] = useDeleteSpaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteSpaceMutation, SchemaTypes.DeleteSpaceMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteSpaceMutation, SchemaTypes.DeleteSpaceMutationVariables>(
    DeleteSpaceDocument,
    options
  );
}

export type DeleteSpaceMutationHookResult = ReturnType<typeof useDeleteSpaceMutation>;
export type DeleteSpaceMutationResult = Apollo.MutationResult<SchemaTypes.DeleteSpaceMutation>;
export type DeleteSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteSpaceMutation,
  SchemaTypes.DeleteSpaceMutationVariables
>;
export const UpdateSpaceDocument = gql`
  mutation updateSpace($input: UpdateSpaceInput!) {
    updateSpace(spaceData: $input) {
      ...SpaceDetails
    }
  }
  ${SpaceDetailsFragmentDoc}
`;
export type UpdateSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateSpaceMutation,
  SchemaTypes.UpdateSpaceMutationVariables
>;

/**
 * __useUpdateSpaceMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceMutation, { data, loading, error }] = useUpdateSpaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateSpaceMutation, SchemaTypes.UpdateSpaceMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateSpaceMutation, SchemaTypes.UpdateSpaceMutationVariables>(
    UpdateSpaceDocument,
    options
  );
}

export type UpdateSpaceMutationHookResult = ReturnType<typeof useUpdateSpaceMutation>;
export type UpdateSpaceMutationResult = Apollo.MutationResult<SchemaTypes.UpdateSpaceMutation>;
export type UpdateSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateSpaceMutation,
  SchemaTypes.UpdateSpaceMutationVariables
>;
export const SpaceApplicationTemplateDocument = gql`
  query spaceApplicationTemplate($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      community {
        id
        applicationForm {
          id
          description
          questions {
            required
            question
            explanation
            sortOrder
            maxLength
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceApplicationTemplateQuery__
 *
 * To run a query within a React component, call `useSpaceApplicationTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceApplicationTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceApplicationTemplateQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceApplicationTemplateQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceApplicationTemplateQuery,
    SchemaTypes.SpaceApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceApplicationTemplateQuery, SchemaTypes.SpaceApplicationTemplateQueryVariables>(
    SpaceApplicationTemplateDocument,
    options
  );
}

export function useSpaceApplicationTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceApplicationTemplateQuery,
    SchemaTypes.SpaceApplicationTemplateQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceApplicationTemplateQuery,
    SchemaTypes.SpaceApplicationTemplateQueryVariables
  >(SpaceApplicationTemplateDocument, options);
}

export type SpaceApplicationTemplateQueryHookResult = ReturnType<typeof useSpaceApplicationTemplateQuery>;
export type SpaceApplicationTemplateLazyQueryHookResult = ReturnType<typeof useSpaceApplicationTemplateLazyQuery>;
export type SpaceApplicationTemplateQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceApplicationTemplateQuery,
  SchemaTypes.SpaceApplicationTemplateQueryVariables
>;
export function refetchSpaceApplicationTemplateQuery(variables: SchemaTypes.SpaceApplicationTemplateQueryVariables) {
  return { query: SpaceApplicationTemplateDocument, variables: variables };
}

export const SpaceCardDocument = gql`
  query spaceCard($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      ...SpaceCard
    }
  }
  ${SpaceCardFragmentDoc}
`;

/**
 * __useSpaceCardQuery__
 *
 * To run a query within a React component, call `useSpaceCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCardQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCardQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceCardQuery, SchemaTypes.SpaceCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCardQuery, SchemaTypes.SpaceCardQueryVariables>(SpaceCardDocument, options);
}

export function useSpaceCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceCardQuery, SchemaTypes.SpaceCardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCardQuery, SchemaTypes.SpaceCardQueryVariables>(
    SpaceCardDocument,
    options
  );
}

export type SpaceCardQueryHookResult = ReturnType<typeof useSpaceCardQuery>;
export type SpaceCardLazyQueryHookResult = ReturnType<typeof useSpaceCardLazyQuery>;
export type SpaceCardQueryResult = Apollo.QueryResult<SchemaTypes.SpaceCardQuery, SchemaTypes.SpaceCardQueryVariables>;
export function refetchSpaceCardQuery(variables: SchemaTypes.SpaceCardQueryVariables) {
  return { query: SpaceCardDocument, variables: variables };
}

export const SpaceGroupDocument = gql`
  query spaceGroup($spaceId: UUID_NAMEID!, $groupId: UUID!) {
    space(ID: $spaceId) {
      id
      group(ID: $groupId) {
        ...GroupInfo
      }
    }
  }
  ${GroupInfoFragmentDoc}
`;

/**
 * __useSpaceGroupQuery__
 *
 * To run a query within a React component, call `useSpaceGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceGroupQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useSpaceGroupQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceGroupQuery, SchemaTypes.SpaceGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceGroupQuery, SchemaTypes.SpaceGroupQueryVariables>(
    SpaceGroupDocument,
    options
  );
}

export function useSpaceGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceGroupQuery, SchemaTypes.SpaceGroupQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceGroupQuery, SchemaTypes.SpaceGroupQueryVariables>(
    SpaceGroupDocument,
    options
  );
}

export type SpaceGroupQueryHookResult = ReturnType<typeof useSpaceGroupQuery>;
export type SpaceGroupLazyQueryHookResult = ReturnType<typeof useSpaceGroupLazyQuery>;
export type SpaceGroupQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceGroupQuery,
  SchemaTypes.SpaceGroupQueryVariables
>;
export function refetchSpaceGroupQuery(variables: SchemaTypes.SpaceGroupQueryVariables) {
  return { query: SpaceGroupDocument, variables: variables };
}

export const SpaceInnovationFlowTemplatesDocument = gql`
  query SpaceInnovationFlowTemplates($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          innovationFlowTemplates {
            id
            states {
              displayName
              description
            }
            profile {
              id
              displayName
            }
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceInnovationFlowTemplatesQuery__
 *
 * To run a query within a React component, call `useSpaceInnovationFlowTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceInnovationFlowTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceInnovationFlowTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceInnovationFlowTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceInnovationFlowTemplatesQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceInnovationFlowTemplatesQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
  >(SpaceInnovationFlowTemplatesDocument, options);
}

export function useSpaceInnovationFlowTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceInnovationFlowTemplatesQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceInnovationFlowTemplatesQuery,
    SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
  >(SpaceInnovationFlowTemplatesDocument, options);
}

export type SpaceInnovationFlowTemplatesQueryHookResult = ReturnType<typeof useSpaceInnovationFlowTemplatesQuery>;
export type SpaceInnovationFlowTemplatesLazyQueryHookResult = ReturnType<
  typeof useSpaceInnovationFlowTemplatesLazyQuery
>;
export type SpaceInnovationFlowTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceInnovationFlowTemplatesQuery,
  SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
>;
export function refetchSpaceInnovationFlowTemplatesQuery(
  variables: SchemaTypes.SpaceInnovationFlowTemplatesQueryVariables
) {
  return { query: SpaceInnovationFlowTemplatesDocument, variables: variables };
}

export const ChallengeCreatedDocument = gql`
  subscription ChallengeCreated($spaceID: UUID_NAMEID!) {
    challengeCreated(spaceID: $spaceID) {
      challenge {
        ...ChallengeCard
      }
    }
  }
  ${ChallengeCardFragmentDoc}
`;

/**
 * __useChallengeCreatedSubscription__
 *
 * To run a query within a React component, call `useChallengeCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCreatedSubscription({
 *   variables: {
 *      spaceID: // value for 'spaceID'
 *   },
 * });
 */
export function useChallengeCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.ChallengeCreatedSubscription,
    SchemaTypes.ChallengeCreatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.ChallengeCreatedSubscription,
    SchemaTypes.ChallengeCreatedSubscriptionVariables
  >(ChallengeCreatedDocument, options);
}

export type ChallengeCreatedSubscriptionHookResult = ReturnType<typeof useChallengeCreatedSubscription>;
export type ChallengeCreatedSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.ChallengeCreatedSubscription>;
export const BannerInnovationHubDocument = gql`
  query BannerInnovationHub($subdomain: String) {
    platform {
      id
      innovationHub(subdomain: $subdomain) {
        id
        profile {
          id
          displayName
        }
        spaceListFilter {
          id
        }
      }
    }
  }
`;

/**
 * __useBannerInnovationHubQuery__
 *
 * To run a query within a React component, call `useBannerInnovationHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useBannerInnovationHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBannerInnovationHubQuery({
 *   variables: {
 *      subdomain: // value for 'subdomain'
 *   },
 * });
 */
export function useBannerInnovationHubQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.BannerInnovationHubQuery,
    SchemaTypes.BannerInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.BannerInnovationHubQuery, SchemaTypes.BannerInnovationHubQueryVariables>(
    BannerInnovationHubDocument,
    options
  );
}

export function useBannerInnovationHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.BannerInnovationHubQuery,
    SchemaTypes.BannerInnovationHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.BannerInnovationHubQuery, SchemaTypes.BannerInnovationHubQueryVariables>(
    BannerInnovationHubDocument,
    options
  );
}

export type BannerInnovationHubQueryHookResult = ReturnType<typeof useBannerInnovationHubQuery>;
export type BannerInnovationHubLazyQueryHookResult = ReturnType<typeof useBannerInnovationHubLazyQuery>;
export type BannerInnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.BannerInnovationHubQuery,
  SchemaTypes.BannerInnovationHubQueryVariables
>;
export function refetchBannerInnovationHubQuery(variables?: SchemaTypes.BannerInnovationHubQueryVariables) {
  return { query: BannerInnovationHubDocument, variables: variables };
}

export const AdminSpaceChallengesPageDocument = gql`
  query AdminSpaceChallengesPage($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenges {
        id
        nameID
        profile {
          id
          displayName
        }
      }
      account {
        id
        defaults {
          innovationFlowTemplate {
            id
            profile {
              ...InnovationFlowProfile
            }
            states {
              displayName
              description
            }
          }
        }
      }
    }
  }
  ${InnovationFlowProfileFragmentDoc}
`;

/**
 * __useAdminSpaceChallengesPageQuery__
 *
 * To run a query within a React component, call `useAdminSpaceChallengesPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminSpaceChallengesPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSpaceChallengesPageQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAdminSpaceChallengesPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminSpaceChallengesPageQuery,
    SchemaTypes.AdminSpaceChallengesPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminSpaceChallengesPageQuery, SchemaTypes.AdminSpaceChallengesPageQueryVariables>(
    AdminSpaceChallengesPageDocument,
    options
  );
}

export function useAdminSpaceChallengesPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminSpaceChallengesPageQuery,
    SchemaTypes.AdminSpaceChallengesPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminSpaceChallengesPageQuery,
    SchemaTypes.AdminSpaceChallengesPageQueryVariables
  >(AdminSpaceChallengesPageDocument, options);
}

export type AdminSpaceChallengesPageQueryHookResult = ReturnType<typeof useAdminSpaceChallengesPageQuery>;
export type AdminSpaceChallengesPageLazyQueryHookResult = ReturnType<typeof useAdminSpaceChallengesPageLazyQuery>;
export type AdminSpaceChallengesPageQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminSpaceChallengesPageQuery,
  SchemaTypes.AdminSpaceChallengesPageQueryVariables
>;
export function refetchAdminSpaceChallengesPageQuery(variables: SchemaTypes.AdminSpaceChallengesPageQueryVariables) {
  return { query: AdminSpaceChallengesPageDocument, variables: variables };
}

export const UpdateSpaceDefaultInnovationFlowTemplateDocument = gql`
  mutation UpdateSpaceDefaultInnovationFlowTemplate($spaceId: UUID!, $innovationFlowTemplateId: UUID!) {
    updateSpaceDefaults(spaceDefaultsData: { spaceID: $spaceId, flowTemplateID: $innovationFlowTemplateId }) {
      id
    }
  }
`;
export type UpdateSpaceDefaultInnovationFlowTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutation,
  SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutationVariables
>;

/**
 * __useUpdateSpaceDefaultInnovationFlowTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceDefaultInnovationFlowTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceDefaultInnovationFlowTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceDefaultInnovationFlowTemplateMutation, { data, loading, error }] = useUpdateSpaceDefaultInnovationFlowTemplateMutation({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      innovationFlowTemplateId: // value for 'innovationFlowTemplateId'
 *   },
 * });
 */
export function useUpdateSpaceDefaultInnovationFlowTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutation,
    SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutation,
    SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutationVariables
  >(UpdateSpaceDefaultInnovationFlowTemplateDocument, options);
}

export type UpdateSpaceDefaultInnovationFlowTemplateMutationHookResult = ReturnType<
  typeof useUpdateSpaceDefaultInnovationFlowTemplateMutation
>;
export type UpdateSpaceDefaultInnovationFlowTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutation>;
export type UpdateSpaceDefaultInnovationFlowTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutation,
  SchemaTypes.UpdateSpaceDefaultInnovationFlowTemplateMutationVariables
>;
export const AdminGlobalOrganizationsListDocument = gql`
  query adminGlobalOrganizationsList($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    organizationsPaginated(first: $first, after: $after, filter: $filter) {
      organization {
        id
        nameID
        profile {
          id
          displayName
        }
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${PageInfoFragmentDoc}
`;

/**
 * __useAdminGlobalOrganizationsListQuery__
 *
 * To run a query within a React component, call `useAdminGlobalOrganizationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminGlobalOrganizationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminGlobalOrganizationsListQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAdminGlobalOrganizationsListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminGlobalOrganizationsListQuery,
    SchemaTypes.AdminGlobalOrganizationsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AdminGlobalOrganizationsListQuery,
    SchemaTypes.AdminGlobalOrganizationsListQueryVariables
  >(AdminGlobalOrganizationsListDocument, options);
}

export function useAdminGlobalOrganizationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminGlobalOrganizationsListQuery,
    SchemaTypes.AdminGlobalOrganizationsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminGlobalOrganizationsListQuery,
    SchemaTypes.AdminGlobalOrganizationsListQueryVariables
  >(AdminGlobalOrganizationsListDocument, options);
}

export type AdminGlobalOrganizationsListQueryHookResult = ReturnType<typeof useAdminGlobalOrganizationsListQuery>;
export type AdminGlobalOrganizationsListLazyQueryHookResult = ReturnType<
  typeof useAdminGlobalOrganizationsListLazyQuery
>;
export type AdminGlobalOrganizationsListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminGlobalOrganizationsListQuery,
  SchemaTypes.AdminGlobalOrganizationsListQueryVariables
>;
export function refetchAdminGlobalOrganizationsListQuery(
  variables: SchemaTypes.AdminGlobalOrganizationsListQueryVariables
) {
  return { query: AdminGlobalOrganizationsListDocument, variables: variables };
}

export const UpdateSpacePlatformSettingsDocument = gql`
  mutation UpdateSpacePlatformSettings(
    $spaceID: String!
    $hostID: UUID_NAMEID
    $nameID: NameID
    $license: UpdateLicenseInput
  ) {
    updateSpacePlatformSettings(
      updateData: { spaceID: $spaceID, nameID: $nameID, account: { hostID: $hostID, license: $license } }
    ) {
      id
      account {
        id
        license {
          id
          visibility
          featureFlags {
            name
            enabled
          }
        }
        host {
          id
        }
      }
      nameID
    }
  }
`;
export type UpdateSpacePlatformSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateSpacePlatformSettingsMutation,
  SchemaTypes.UpdateSpacePlatformSettingsMutationVariables
>;

/**
 * __useUpdateSpacePlatformSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpacePlatformSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpacePlatformSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpacePlatformSettingsMutation, { data, loading, error }] = useUpdateSpacePlatformSettingsMutation({
 *   variables: {
 *      spaceID: // value for 'spaceID'
 *      hostID: // value for 'hostID'
 *      nameID: // value for 'nameID'
 *      license: // value for 'license'
 *   },
 * });
 */
export function useUpdateSpacePlatformSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateSpacePlatformSettingsMutation,
    SchemaTypes.UpdateSpacePlatformSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateSpacePlatformSettingsMutation,
    SchemaTypes.UpdateSpacePlatformSettingsMutationVariables
  >(UpdateSpacePlatformSettingsDocument, options);
}

export type UpdateSpacePlatformSettingsMutationHookResult = ReturnType<typeof useUpdateSpacePlatformSettingsMutation>;
export type UpdateSpacePlatformSettingsMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateSpacePlatformSettingsMutation>;
export type UpdateSpacePlatformSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateSpacePlatformSettingsMutation,
  SchemaTypes.UpdateSpacePlatformSettingsMutationVariables
>;
export const AdminSpacesListDocument = gql`
  query adminSpacesList {
    spaces(filter: { visibilities: [ARCHIVED, ACTIVE, DEMO] }) {
      ...AdminSpace
    }
  }
  ${AdminSpaceFragmentDoc}
`;

/**
 * __useAdminSpacesListQuery__
 *
 * To run a query within a React component, call `useAdminSpacesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminSpacesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSpacesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminSpacesListQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.AdminSpacesListQuery, SchemaTypes.AdminSpacesListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminSpacesListQuery, SchemaTypes.AdminSpacesListQueryVariables>(
    AdminSpacesListDocument,
    options
  );
}

export function useAdminSpacesListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AdminSpacesListQuery, SchemaTypes.AdminSpacesListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminSpacesListQuery, SchemaTypes.AdminSpacesListQueryVariables>(
    AdminSpacesListDocument,
    options
  );
}

export type AdminSpacesListQueryHookResult = ReturnType<typeof useAdminSpacesListQuery>;
export type AdminSpacesListLazyQueryHookResult = ReturnType<typeof useAdminSpacesListLazyQuery>;
export type AdminSpacesListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminSpacesListQuery,
  SchemaTypes.AdminSpacesListQueryVariables
>;
export function refetchAdminSpacesListQuery(variables?: SchemaTypes.AdminSpacesListQueryVariables) {
  return { query: AdminSpacesListDocument, variables: variables };
}

export const SpaceStorageAdminPageDocument = gql`
  query SpaceStorageAdminPage($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        displayName
      }
      storageAggregator {
        ...StorageAggregator
      }
    }
  }
  ${StorageAggregatorFragmentDoc}
`;

/**
 * __useSpaceStorageAdminPageQuery__
 *
 * To run a query within a React component, call `useSpaceStorageAdminPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceStorageAdminPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceStorageAdminPageQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceStorageAdminPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceStorageAdminPageQuery,
    SchemaTypes.SpaceStorageAdminPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceStorageAdminPageQuery, SchemaTypes.SpaceStorageAdminPageQueryVariables>(
    SpaceStorageAdminPageDocument,
    options
  );
}

export function useSpaceStorageAdminPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceStorageAdminPageQuery,
    SchemaTypes.SpaceStorageAdminPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceStorageAdminPageQuery, SchemaTypes.SpaceStorageAdminPageQueryVariables>(
    SpaceStorageAdminPageDocument,
    options
  );
}

export type SpaceStorageAdminPageQueryHookResult = ReturnType<typeof useSpaceStorageAdminPageQuery>;
export type SpaceStorageAdminPageLazyQueryHookResult = ReturnType<typeof useSpaceStorageAdminPageLazyQuery>;
export type SpaceStorageAdminPageQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceStorageAdminPageQuery,
  SchemaTypes.SpaceStorageAdminPageQueryVariables
>;
export function refetchSpaceStorageAdminPageQuery(variables: SchemaTypes.SpaceStorageAdminPageQueryVariables) {
  return { query: SpaceStorageAdminPageDocument, variables: variables };
}

export const StorageAggregatorLookupDocument = gql`
  query StorageAggregatorLookup($storageAggregatorId: UUID!) {
    lookup {
      storageAggregator(ID: $storageAggregatorId) {
        ...StorageAggregator
      }
    }
  }
  ${StorageAggregatorFragmentDoc}
`;

/**
 * __useStorageAggregatorLookupQuery__
 *
 * To run a query within a React component, call `useStorageAggregatorLookupQuery` and pass it any options that fit your needs.
 * When your component renders, `useStorageAggregatorLookupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStorageAggregatorLookupQuery({
 *   variables: {
 *      storageAggregatorId: // value for 'storageAggregatorId'
 *   },
 * });
 */
export function useStorageAggregatorLookupQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.StorageAggregatorLookupQuery,
    SchemaTypes.StorageAggregatorLookupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.StorageAggregatorLookupQuery, SchemaTypes.StorageAggregatorLookupQueryVariables>(
    StorageAggregatorLookupDocument,
    options
  );
}

export function useStorageAggregatorLookupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.StorageAggregatorLookupQuery,
    SchemaTypes.StorageAggregatorLookupQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.StorageAggregatorLookupQuery,
    SchemaTypes.StorageAggregatorLookupQueryVariables
  >(StorageAggregatorLookupDocument, options);
}

export type StorageAggregatorLookupQueryHookResult = ReturnType<typeof useStorageAggregatorLookupQuery>;
export type StorageAggregatorLookupLazyQueryHookResult = ReturnType<typeof useStorageAggregatorLookupLazyQuery>;
export type StorageAggregatorLookupQueryResult = Apollo.QueryResult<
  SchemaTypes.StorageAggregatorLookupQuery,
  SchemaTypes.StorageAggregatorLookupQueryVariables
>;
export function refetchStorageAggregatorLookupQuery(variables: SchemaTypes.StorageAggregatorLookupQueryVariables) {
  return { query: StorageAggregatorLookupDocument, variables: variables };
}

export const DeleteDocumentDocument = gql`
  mutation DeleteDocument($documentId: UUID!) {
    deleteDocument(deleteData: { ID: $documentId }) {
      id
    }
  }
`;
export type DeleteDocumentMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteDocumentMutation,
  SchemaTypes.DeleteDocumentMutationVariables
>;

/**
 * __useDeleteDocumentMutation__
 *
 * To run a mutation, you first call `useDeleteDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDocumentMutation, { data, loading, error }] = useDeleteDocumentMutation({
 *   variables: {
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useDeleteDocumentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteDocumentMutation,
    SchemaTypes.DeleteDocumentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteDocumentMutation, SchemaTypes.DeleteDocumentMutationVariables>(
    DeleteDocumentDocument,
    options
  );
}

export type DeleteDocumentMutationHookResult = ReturnType<typeof useDeleteDocumentMutation>;
export type DeleteDocumentMutationResult = Apollo.MutationResult<SchemaTypes.DeleteDocumentMutation>;
export type DeleteDocumentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteDocumentMutation,
  SchemaTypes.DeleteDocumentMutationVariables
>;
export const AdminSpaceTemplatesDocument = gql`
  query AdminSpaceTemplates($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
          authorization {
            id
            myPrivileges
          }
          calloutTemplates {
            ...AdminCalloutTemplate
          }
          postTemplates {
            ...AdminPostTemplate
          }
          whiteboardTemplates {
            ...AdminWhiteboardTemplate
          }
          innovationFlowTemplates {
            ...AdminInnovationFlowTemplate
          }
        }
      }
    }
  }
  ${AdminCalloutTemplateFragmentDoc}
  ${AdminPostTemplateFragmentDoc}
  ${AdminWhiteboardTemplateFragmentDoc}
  ${AdminInnovationFlowTemplateFragmentDoc}
`;

/**
 * __useAdminSpaceTemplatesQuery__
 *
 * To run a query within a React component, call `useAdminSpaceTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminSpaceTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSpaceTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAdminSpaceTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminSpaceTemplatesQuery,
    SchemaTypes.AdminSpaceTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminSpaceTemplatesQuery, SchemaTypes.AdminSpaceTemplatesQueryVariables>(
    AdminSpaceTemplatesDocument,
    options
  );
}

export function useAdminSpaceTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminSpaceTemplatesQuery,
    SchemaTypes.AdminSpaceTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminSpaceTemplatesQuery, SchemaTypes.AdminSpaceTemplatesQueryVariables>(
    AdminSpaceTemplatesDocument,
    options
  );
}

export type AdminSpaceTemplatesQueryHookResult = ReturnType<typeof useAdminSpaceTemplatesQuery>;
export type AdminSpaceTemplatesLazyQueryHookResult = ReturnType<typeof useAdminSpaceTemplatesLazyQuery>;
export type AdminSpaceTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminSpaceTemplatesQuery,
  SchemaTypes.AdminSpaceTemplatesQueryVariables
>;
export function refetchAdminSpaceTemplatesQuery(variables: SchemaTypes.AdminSpaceTemplatesQueryVariables) {
  return { query: AdminSpaceTemplatesDocument, variables: variables };
}

export const CreateCalloutTemplateDocument = gql`
  mutation createCalloutTemplate(
    $templatesSetId: UUID!
    $framing: CreateCalloutFramingInput!
    $contributionDefaults: CreateCalloutContributionDefaultsInput!
    $contributionPolicy: CreateCalloutContributionPolicyInput!
    $profile: CreateProfileInput!
    $type: CalloutType!
    $tags: [String!]
  ) {
    createCalloutTemplate(
      calloutTemplateInput: {
        templatesSetID: $templatesSetId
        framing: $framing
        contributionDefaults: $contributionDefaults
        contributionPolicy: $contributionPolicy
        profile: $profile
        type: $type
        tags: $tags
      }
    ) {
      id
    }
  }
`;
export type CreateCalloutTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateCalloutTemplateMutation,
  SchemaTypes.CreateCalloutTemplateMutationVariables
>;

/**
 * __useCreateCalloutTemplateMutation__
 *
 * To run a mutation, you first call `useCreateCalloutTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCalloutTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCalloutTemplateMutation, { data, loading, error }] = useCreateCalloutTemplateMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      framing: // value for 'framing'
 *      contributionDefaults: // value for 'contributionDefaults'
 *      contributionPolicy: // value for 'contributionPolicy'
 *      profile: // value for 'profile'
 *      type: // value for 'type'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreateCalloutTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateCalloutTemplateMutation,
    SchemaTypes.CreateCalloutTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateCalloutTemplateMutation,
    SchemaTypes.CreateCalloutTemplateMutationVariables
  >(CreateCalloutTemplateDocument, options);
}

export type CreateCalloutTemplateMutationHookResult = ReturnType<typeof useCreateCalloutTemplateMutation>;
export type CreateCalloutTemplateMutationResult = Apollo.MutationResult<SchemaTypes.CreateCalloutTemplateMutation>;
export type CreateCalloutTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateCalloutTemplateMutation,
  SchemaTypes.CreateCalloutTemplateMutationVariables
>;
export const SpaceTemplateSetIdDocument = gql`
  query SpaceTemplateSetId($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      account {
        id
        library {
          id
        }
      }
    }
  }
`;

/**
 * __useSpaceTemplateSetIdQuery__
 *
 * To run a query within a React component, call `useSpaceTemplateSetIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplateSetIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplateSetIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTemplateSetIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplateSetIdQuery,
    SchemaTypes.SpaceTemplateSetIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTemplateSetIdQuery, SchemaTypes.SpaceTemplateSetIdQueryVariables>(
    SpaceTemplateSetIdDocument,
    options
  );
}

export function useSpaceTemplateSetIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplateSetIdQuery,
    SchemaTypes.SpaceTemplateSetIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTemplateSetIdQuery, SchemaTypes.SpaceTemplateSetIdQueryVariables>(
    SpaceTemplateSetIdDocument,
    options
  );
}

export type SpaceTemplateSetIdQueryHookResult = ReturnType<typeof useSpaceTemplateSetIdQuery>;
export type SpaceTemplateSetIdLazyQueryHookResult = ReturnType<typeof useSpaceTemplateSetIdLazyQuery>;
export type SpaceTemplateSetIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplateSetIdQuery,
  SchemaTypes.SpaceTemplateSetIdQueryVariables
>;
export function refetchSpaceTemplateSetIdQuery(variables: SchemaTypes.SpaceTemplateSetIdQueryVariables) {
  return { query: SpaceTemplateSetIdDocument, variables: variables };
}

export const DeleteCalloutTemplateDocument = gql`
  mutation deleteCalloutTemplate($templateId: UUID!) {
    deleteCalloutTemplate(deleteData: { ID: $templateId }) {
      id
    }
  }
`;
export type DeleteCalloutTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCalloutTemplateMutation,
  SchemaTypes.DeleteCalloutTemplateMutationVariables
>;

/**
 * __useDeleteCalloutTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteCalloutTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCalloutTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCalloutTemplateMutation, { data, loading, error }] = useDeleteCalloutTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeleteCalloutTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteCalloutTemplateMutation,
    SchemaTypes.DeleteCalloutTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteCalloutTemplateMutation,
    SchemaTypes.DeleteCalloutTemplateMutationVariables
  >(DeleteCalloutTemplateDocument, options);
}

export type DeleteCalloutTemplateMutationHookResult = ReturnType<typeof useDeleteCalloutTemplateMutation>;
export type DeleteCalloutTemplateMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCalloutTemplateMutation>;
export type DeleteCalloutTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCalloutTemplateMutation,
  SchemaTypes.DeleteCalloutTemplateMutationVariables
>;
export const InnovationPacksDocument = gql`
  query InnovationPacks {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          provider {
            ...InnovationPackProviderProfileWithAvatar
          }
          profile {
            id
            displayName
          }
          templates {
            id
            postTemplates {
              ...AdminPostTemplate
            }
            whiteboardTemplates {
              ...AdminWhiteboardTemplate
            }
            innovationFlowTemplates {
              ...AdminInnovationFlowTemplate
            }
          }
        }
      }
    }
  }
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
  ${AdminPostTemplateFragmentDoc}
  ${AdminWhiteboardTemplateFragmentDoc}
  ${AdminInnovationFlowTemplateFragmentDoc}
`;

/**
 * __useInnovationPacksQuery__
 *
 * To run a query within a React component, call `useInnovationPacksQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationPacksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationPacksQuery({
 *   variables: {
 *   },
 * });
 */
export function useInnovationPacksQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.InnovationPacksQuery, SchemaTypes.InnovationPacksQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationPacksQuery, SchemaTypes.InnovationPacksQueryVariables>(
    InnovationPacksDocument,
    options
  );
}

export function useInnovationPacksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.InnovationPacksQuery, SchemaTypes.InnovationPacksQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationPacksQuery, SchemaTypes.InnovationPacksQueryVariables>(
    InnovationPacksDocument,
    options
  );
}

export type InnovationPacksQueryHookResult = ReturnType<typeof useInnovationPacksQuery>;
export type InnovationPacksLazyQueryHookResult = ReturnType<typeof useInnovationPacksLazyQuery>;
export type InnovationPacksQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPacksQuery,
  SchemaTypes.InnovationPacksQueryVariables
>;
export function refetchInnovationPacksQuery(variables?: SchemaTypes.InnovationPacksQueryVariables) {
  return { query: InnovationPacksDocument, variables: variables };
}

export const AdminInnovationPacksListDocument = gql`
  query AdminInnovationPacksList {
    platform {
      id
      library {
        id
        innovationPacks {
          id
          nameID
          profile {
            id
            displayName
          }
        }
      }
    }
  }
`;

/**
 * __useAdminInnovationPacksListQuery__
 *
 * To run a query within a React component, call `useAdminInnovationPacksListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminInnovationPacksListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminInnovationPacksListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminInnovationPacksListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AdminInnovationPacksListQuery,
    SchemaTypes.AdminInnovationPacksListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminInnovationPacksListQuery, SchemaTypes.AdminInnovationPacksListQueryVariables>(
    AdminInnovationPacksListDocument,
    options
  );
}

export function useAdminInnovationPacksListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminInnovationPacksListQuery,
    SchemaTypes.AdminInnovationPacksListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminInnovationPacksListQuery,
    SchemaTypes.AdminInnovationPacksListQueryVariables
  >(AdminInnovationPacksListDocument, options);
}

export type AdminInnovationPacksListQueryHookResult = ReturnType<typeof useAdminInnovationPacksListQuery>;
export type AdminInnovationPacksListLazyQueryHookResult = ReturnType<typeof useAdminInnovationPacksListLazyQuery>;
export type AdminInnovationPacksListQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminInnovationPacksListQuery,
  SchemaTypes.AdminInnovationPacksListQueryVariables
>;
export function refetchAdminInnovationPacksListQuery(variables?: SchemaTypes.AdminInnovationPacksListQueryVariables) {
  return { query: AdminInnovationPacksListDocument, variables: variables };
}

export const DeleteInnovationPackDocument = gql`
  mutation deleteInnovationPack($innovationPackId: UUID_NAMEID!) {
    deleteInnovationPack(deleteData: { ID: $innovationPackId }) {
      id
    }
  }
`;
export type DeleteInnovationPackMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteInnovationPackMutation,
  SchemaTypes.DeleteInnovationPackMutationVariables
>;

/**
 * __useDeleteInnovationPackMutation__
 *
 * To run a mutation, you first call `useDeleteInnovationPackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInnovationPackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInnovationPackMutation, { data, loading, error }] = useDeleteInnovationPackMutation({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *   },
 * });
 */
export function useDeleteInnovationPackMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteInnovationPackMutation,
    SchemaTypes.DeleteInnovationPackMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteInnovationPackMutation,
    SchemaTypes.DeleteInnovationPackMutationVariables
  >(DeleteInnovationPackDocument, options);
}

export type DeleteInnovationPackMutationHookResult = ReturnType<typeof useDeleteInnovationPackMutation>;
export type DeleteInnovationPackMutationResult = Apollo.MutationResult<SchemaTypes.DeleteInnovationPackMutation>;
export type DeleteInnovationPackMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteInnovationPackMutation,
  SchemaTypes.DeleteInnovationPackMutationVariables
>;
export const AdminInnovationPackDocument = gql`
  query AdminInnovationPack($innovationPackId: UUID_NAMEID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          id
          nameID
          provider {
            ...InnovationPackProviderProfileWithAvatar
          }
          profile {
            ...InnovationPackProfile
          }
          templates {
            ...AdminInnovationPackTemplates
          }
        }
      }
    }
    organizations {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
  ${InnovationPackProfileFragmentDoc}
  ${AdminInnovationPackTemplatesFragmentDoc}
`;

/**
 * __useAdminInnovationPackQuery__
 *
 * To run a query within a React component, call `useAdminInnovationPackQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminInnovationPackQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminInnovationPackQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *   },
 * });
 */
export function useAdminInnovationPackQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminInnovationPackQuery,
    SchemaTypes.AdminInnovationPackQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminInnovationPackQuery, SchemaTypes.AdminInnovationPackQueryVariables>(
    AdminInnovationPackDocument,
    options
  );
}

export function useAdminInnovationPackLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminInnovationPackQuery,
    SchemaTypes.AdminInnovationPackQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminInnovationPackQuery, SchemaTypes.AdminInnovationPackQueryVariables>(
    AdminInnovationPackDocument,
    options
  );
}

export type AdminInnovationPackQueryHookResult = ReturnType<typeof useAdminInnovationPackQuery>;
export type AdminInnovationPackLazyQueryHookResult = ReturnType<typeof useAdminInnovationPackLazyQuery>;
export type AdminInnovationPackQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminInnovationPackQuery,
  SchemaTypes.AdminInnovationPackQueryVariables
>;
export function refetchAdminInnovationPackQuery(variables: SchemaTypes.AdminInnovationPackQueryVariables) {
  return { query: AdminInnovationPackDocument, variables: variables };
}

export const CreateInnovationPackDocument = gql`
  mutation createInnovationPack($packData: CreateInnovationPackOnLibraryInput!) {
    createInnovationPackOnLibrary(packData: $packData) {
      id
      nameID
    }
  }
`;
export type CreateInnovationPackMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateInnovationPackMutation,
  SchemaTypes.CreateInnovationPackMutationVariables
>;

/**
 * __useCreateInnovationPackMutation__
 *
 * To run a mutation, you first call `useCreateInnovationPackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInnovationPackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInnovationPackMutation, { data, loading, error }] = useCreateInnovationPackMutation({
 *   variables: {
 *      packData: // value for 'packData'
 *   },
 * });
 */
export function useCreateInnovationPackMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateInnovationPackMutation,
    SchemaTypes.CreateInnovationPackMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateInnovationPackMutation,
    SchemaTypes.CreateInnovationPackMutationVariables
  >(CreateInnovationPackDocument, options);
}

export type CreateInnovationPackMutationHookResult = ReturnType<typeof useCreateInnovationPackMutation>;
export type CreateInnovationPackMutationResult = Apollo.MutationResult<SchemaTypes.CreateInnovationPackMutation>;
export type CreateInnovationPackMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateInnovationPackMutation,
  SchemaTypes.CreateInnovationPackMutationVariables
>;
export const UpdateInnovationPackDocument = gql`
  mutation updateInnovationPack($packData: UpdateInnovationPackInput!) {
    updateInnovationPack(innovationPackData: $packData) {
      id
      nameID
    }
  }
`;
export type UpdateInnovationPackMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationPackMutation,
  SchemaTypes.UpdateInnovationPackMutationVariables
>;

/**
 * __useUpdateInnovationPackMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationPackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationPackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationPackMutation, { data, loading, error }] = useUpdateInnovationPackMutation({
 *   variables: {
 *      packData: // value for 'packData'
 *   },
 * });
 */
export function useUpdateInnovationPackMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationPackMutation,
    SchemaTypes.UpdateInnovationPackMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationPackMutation,
    SchemaTypes.UpdateInnovationPackMutationVariables
  >(UpdateInnovationPackDocument, options);
}

export type UpdateInnovationPackMutationHookResult = ReturnType<typeof useUpdateInnovationPackMutation>;
export type UpdateInnovationPackMutationResult = Apollo.MutationResult<SchemaTypes.UpdateInnovationPackMutation>;
export type UpdateInnovationPackMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationPackMutation,
  SchemaTypes.UpdateInnovationPackMutationVariables
>;
export const UpdateInnovationFlowTemplateDocument = gql`
  mutation updateInnovationFlowTemplate(
    $templateId: UUID!
    $profile: UpdateProfileInput!
    $states: [UpdateInnovationFlowStateInput!]
  ) {
    updateInnovationFlowTemplate(innovationFlowTemplateInput: { ID: $templateId, profile: $profile, states: $states }) {
      id
    }
  }
`;
export type UpdateInnovationFlowTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowTemplateMutation,
  SchemaTypes.UpdateInnovationFlowTemplateMutationVariables
>;

/**
 * __useUpdateInnovationFlowTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowTemplateMutation, { data, loading, error }] = useUpdateInnovationFlowTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      profile: // value for 'profile'
 *      states: // value for 'states'
 *   },
 * });
 */
export function useUpdateInnovationFlowTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowTemplateMutation,
    SchemaTypes.UpdateInnovationFlowTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowTemplateMutation,
    SchemaTypes.UpdateInnovationFlowTemplateMutationVariables
  >(UpdateInnovationFlowTemplateDocument, options);
}

export type UpdateInnovationFlowTemplateMutationHookResult = ReturnType<typeof useUpdateInnovationFlowTemplateMutation>;
export type UpdateInnovationFlowTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowTemplateMutation>;
export type UpdateInnovationFlowTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowTemplateMutation,
  SchemaTypes.UpdateInnovationFlowTemplateMutationVariables
>;
export const CreateInnovationFlowTemplateDocument = gql`
  mutation createInnovationFlowTemplate(
    $templatesSetId: UUID!
    $profile: CreateProfileInput!
    $states: [UpdateInnovationFlowStateInput!]
    $tags: [String!]
  ) {
    createInnovationFlowTemplate(
      innovationFlowTemplateInput: { templatesSetID: $templatesSetId, profile: $profile, states: $states, tags: $tags }
    ) {
      id
    }
  }
`;
export type CreateInnovationFlowTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateInnovationFlowTemplateMutation,
  SchemaTypes.CreateInnovationFlowTemplateMutationVariables
>;

/**
 * __useCreateInnovationFlowTemplateMutation__
 *
 * To run a mutation, you first call `useCreateInnovationFlowTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInnovationFlowTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInnovationFlowTemplateMutation, { data, loading, error }] = useCreateInnovationFlowTemplateMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      profile: // value for 'profile'
 *      states: // value for 'states'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreateInnovationFlowTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateInnovationFlowTemplateMutation,
    SchemaTypes.CreateInnovationFlowTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateInnovationFlowTemplateMutation,
    SchemaTypes.CreateInnovationFlowTemplateMutationVariables
  >(CreateInnovationFlowTemplateDocument, options);
}

export type CreateInnovationFlowTemplateMutationHookResult = ReturnType<typeof useCreateInnovationFlowTemplateMutation>;
export type CreateInnovationFlowTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateInnovationFlowTemplateMutation>;
export type CreateInnovationFlowTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateInnovationFlowTemplateMutation,
  SchemaTypes.CreateInnovationFlowTemplateMutationVariables
>;
export const DeleteInnovationFlowTemplateDocument = gql`
  mutation deleteInnovationFlowTemplate($templateId: UUID!) {
    deleteInnovationFlowTemplate(deleteData: { ID: $templateId }) {
      id
    }
  }
`;
export type DeleteInnovationFlowTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteInnovationFlowTemplateMutation,
  SchemaTypes.DeleteInnovationFlowTemplateMutationVariables
>;

/**
 * __useDeleteInnovationFlowTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteInnovationFlowTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInnovationFlowTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInnovationFlowTemplateMutation, { data, loading, error }] = useDeleteInnovationFlowTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeleteInnovationFlowTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteInnovationFlowTemplateMutation,
    SchemaTypes.DeleteInnovationFlowTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteInnovationFlowTemplateMutation,
    SchemaTypes.DeleteInnovationFlowTemplateMutationVariables
  >(DeleteInnovationFlowTemplateDocument, options);
}

export type DeleteInnovationFlowTemplateMutationHookResult = ReturnType<typeof useDeleteInnovationFlowTemplateMutation>;
export type DeleteInnovationFlowTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteInnovationFlowTemplateMutation>;
export type DeleteInnovationFlowTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteInnovationFlowTemplateMutation,
  SchemaTypes.DeleteInnovationFlowTemplateMutationVariables
>;
export const UpdatePostTemplateDocument = gql`
  mutation updatePostTemplate(
    $templateId: UUID!
    $defaultDescription: Markdown
    $profile: UpdateProfileInput
    $type: String
  ) {
    updatePostTemplate(
      postTemplateInput: { ID: $templateId, defaultDescription: $defaultDescription, profile: $profile, type: $type }
    ) {
      id
    }
  }
`;
export type UpdatePostTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePostTemplateMutation,
  SchemaTypes.UpdatePostTemplateMutationVariables
>;

/**
 * __useUpdatePostTemplateMutation__
 *
 * To run a mutation, you first call `useUpdatePostTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePostTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePostTemplateMutation, { data, loading, error }] = useUpdatePostTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      defaultDescription: // value for 'defaultDescription'
 *      profile: // value for 'profile'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useUpdatePostTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePostTemplateMutation,
    SchemaTypes.UpdatePostTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdatePostTemplateMutation, SchemaTypes.UpdatePostTemplateMutationVariables>(
    UpdatePostTemplateDocument,
    options
  );
}

export type UpdatePostTemplateMutationHookResult = ReturnType<typeof useUpdatePostTemplateMutation>;
export type UpdatePostTemplateMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePostTemplateMutation>;
export type UpdatePostTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePostTemplateMutation,
  SchemaTypes.UpdatePostTemplateMutationVariables
>;
export const CreatePostTemplateDocument = gql`
  mutation createPostTemplate(
    $templatesSetId: UUID!
    $defaultDescription: Markdown!
    $profile: CreateProfileInput!
    $type: String!
    $tags: [String!]
  ) {
    createPostTemplate(
      postTemplateInput: {
        templatesSetID: $templatesSetId
        defaultDescription: $defaultDescription
        profile: $profile
        type: $type
        tags: $tags
      }
    ) {
      id
    }
  }
`;
export type CreatePostTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreatePostTemplateMutation,
  SchemaTypes.CreatePostTemplateMutationVariables
>;

/**
 * __useCreatePostTemplateMutation__
 *
 * To run a mutation, you first call `useCreatePostTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostTemplateMutation, { data, loading, error }] = useCreatePostTemplateMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      defaultDescription: // value for 'defaultDescription'
 *      profile: // value for 'profile'
 *      type: // value for 'type'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreatePostTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreatePostTemplateMutation,
    SchemaTypes.CreatePostTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreatePostTemplateMutation, SchemaTypes.CreatePostTemplateMutationVariables>(
    CreatePostTemplateDocument,
    options
  );
}

export type CreatePostTemplateMutationHookResult = ReturnType<typeof useCreatePostTemplateMutation>;
export type CreatePostTemplateMutationResult = Apollo.MutationResult<SchemaTypes.CreatePostTemplateMutation>;
export type CreatePostTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreatePostTemplateMutation,
  SchemaTypes.CreatePostTemplateMutationVariables
>;
export const DeletePostTemplateDocument = gql`
  mutation deletePostTemplate($templateId: UUID!) {
    deletePostTemplate(deleteData: { ID: $templateId }) {
      id
    }
  }
`;
export type DeletePostTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeletePostTemplateMutation,
  SchemaTypes.DeletePostTemplateMutationVariables
>;

/**
 * __useDeletePostTemplateMutation__
 *
 * To run a mutation, you first call `useDeletePostTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePostTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePostTemplateMutation, { data, loading, error }] = useDeletePostTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeletePostTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeletePostTemplateMutation,
    SchemaTypes.DeletePostTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeletePostTemplateMutation, SchemaTypes.DeletePostTemplateMutationVariables>(
    DeletePostTemplateDocument,
    options
  );
}

export type DeletePostTemplateMutationHookResult = ReturnType<typeof useDeletePostTemplateMutation>;
export type DeletePostTemplateMutationResult = Apollo.MutationResult<SchemaTypes.DeletePostTemplateMutation>;
export type DeletePostTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeletePostTemplateMutation,
  SchemaTypes.DeletePostTemplateMutationVariables
>;
export const UpdateWhiteboardTemplateDocument = gql`
  mutation updateWhiteboardTemplate($templateId: UUID!, $content: WhiteboardContent, $profile: UpdateProfileInput!) {
    updateWhiteboardTemplate(whiteboardTemplateInput: { ID: $templateId, content: $content, profile: $profile }) {
      id
      profile {
        id
        visual(type: CARD) {
          id
        }
      }
    }
  }
`;
export type UpdateWhiteboardTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateWhiteboardTemplateMutation,
  SchemaTypes.UpdateWhiteboardTemplateMutationVariables
>;

/**
 * __useUpdateWhiteboardTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateWhiteboardTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhiteboardTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhiteboardTemplateMutation, { data, loading, error }] = useUpdateWhiteboardTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      content: // value for 'content'
 *      profile: // value for 'profile'
 *   },
 * });
 */
export function useUpdateWhiteboardTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateWhiteboardTemplateMutation,
    SchemaTypes.UpdateWhiteboardTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateWhiteboardTemplateMutation,
    SchemaTypes.UpdateWhiteboardTemplateMutationVariables
  >(UpdateWhiteboardTemplateDocument, options);
}

export type UpdateWhiteboardTemplateMutationHookResult = ReturnType<typeof useUpdateWhiteboardTemplateMutation>;
export type UpdateWhiteboardTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateWhiteboardTemplateMutation>;
export type UpdateWhiteboardTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateWhiteboardTemplateMutation,
  SchemaTypes.UpdateWhiteboardTemplateMutationVariables
>;
export const CreateWhiteboardTemplateDocument = gql`
  mutation createWhiteboardTemplate(
    $templatesSetId: UUID!
    $content: WhiteboardContent!
    $profile: CreateProfileInput!
    $tags: [String!]
  ) {
    createWhiteboardTemplate(
      whiteboardTemplateInput: { templatesSetID: $templatesSetId, content: $content, profile: $profile, tags: $tags }
    ) {
      id
      profile {
        id
        visual(type: CARD) {
          id
        }
      }
    }
  }
`;
export type CreateWhiteboardTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateWhiteboardTemplateMutation,
  SchemaTypes.CreateWhiteboardTemplateMutationVariables
>;

/**
 * __useCreateWhiteboardTemplateMutation__
 *
 * To run a mutation, you first call `useCreateWhiteboardTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWhiteboardTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWhiteboardTemplateMutation, { data, loading, error }] = useCreateWhiteboardTemplateMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      content: // value for 'content'
 *      profile: // value for 'profile'
 *      tags: // value for 'tags'
 *   },
 * });
 */
export function useCreateWhiteboardTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateWhiteboardTemplateMutation,
    SchemaTypes.CreateWhiteboardTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateWhiteboardTemplateMutation,
    SchemaTypes.CreateWhiteboardTemplateMutationVariables
  >(CreateWhiteboardTemplateDocument, options);
}

export type CreateWhiteboardTemplateMutationHookResult = ReturnType<typeof useCreateWhiteboardTemplateMutation>;
export type CreateWhiteboardTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateWhiteboardTemplateMutation>;
export type CreateWhiteboardTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateWhiteboardTemplateMutation,
  SchemaTypes.CreateWhiteboardTemplateMutationVariables
>;
export const DeleteWhiteboardTemplateDocument = gql`
  mutation deleteWhiteboardTemplate($templateId: UUID!) {
    deleteWhiteboardTemplate(deleteData: { ID: $templateId }) {
      id
    }
  }
`;
export type DeleteWhiteboardTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteWhiteboardTemplateMutation,
  SchemaTypes.DeleteWhiteboardTemplateMutationVariables
>;

/**
 * __useDeleteWhiteboardTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteWhiteboardTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWhiteboardTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWhiteboardTemplateMutation, { data, loading, error }] = useDeleteWhiteboardTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeleteWhiteboardTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteWhiteboardTemplateMutation,
    SchemaTypes.DeleteWhiteboardTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteWhiteboardTemplateMutation,
    SchemaTypes.DeleteWhiteboardTemplateMutationVariables
  >(DeleteWhiteboardTemplateDocument, options);
}

export type DeleteWhiteboardTemplateMutationHookResult = ReturnType<typeof useDeleteWhiteboardTemplateMutation>;
export type DeleteWhiteboardTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteWhiteboardTemplateMutation>;
export type DeleteWhiteboardTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteWhiteboardTemplateMutation,
  SchemaTypes.DeleteWhiteboardTemplateMutationVariables
>;
export const ConfigurationDocument = gql`
  query configuration {
    platform {
      configuration {
        ...Configuration
      }
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

export const ServerMetadataDocument = gql`
  query serverMetadata {
    platform {
      metadata {
        services {
          name
          version
        }
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

export const ShareLinkWithUserDocument = gql`
  mutation shareLinkWithUser($messageData: CommunicationSendMessageToUserInput!) {
    sendMessageToUser(messageData: $messageData)
  }
`;
export type ShareLinkWithUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.ShareLinkWithUserMutation,
  SchemaTypes.ShareLinkWithUserMutationVariables
>;

/**
 * __useShareLinkWithUserMutation__
 *
 * To run a mutation, you first call `useShareLinkWithUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShareLinkWithUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shareLinkWithUserMutation, { data, loading, error }] = useShareLinkWithUserMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useShareLinkWithUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ShareLinkWithUserMutation,
    SchemaTypes.ShareLinkWithUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.ShareLinkWithUserMutation, SchemaTypes.ShareLinkWithUserMutationVariables>(
    ShareLinkWithUserDocument,
    options
  );
}

export type ShareLinkWithUserMutationHookResult = ReturnType<typeof useShareLinkWithUserMutation>;
export type ShareLinkWithUserMutationResult = Apollo.MutationResult<SchemaTypes.ShareLinkWithUserMutation>;
export type ShareLinkWithUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ShareLinkWithUserMutation,
  SchemaTypes.ShareLinkWithUserMutationVariables
>;
export const CreateChallengeDocument = gql`
  mutation createChallenge($input: CreateChallengeOnSpaceInput!) {
    createChallenge(challengeData: $input) {
      ...ChallengeCard
    }
  }
  ${ChallengeCardFragmentDoc}
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
export const CreateOpportunityDocument = gql`
  mutation createOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(opportunityData: $input) {
      ...OpportunityCard
    }
  }
  ${OpportunityCardFragmentDoc}
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
export const JourneyStorageConfigDocument = gql`
  query JourneyStorageConfig(
    $spaceId: UUID_NAMEID = "00000000-0000-0000-0000-000000000000"
    $challengeId: UUID = "00000000-0000-0000-0000-000000000000"
    $opportunityId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      profile {
        ...ProfileStorageConfig
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        profile {
          ...ProfileStorageConfig
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        profile {
          ...ProfileStorageConfig
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useJourneyStorageConfigQuery__
 *
 * To run a query within a React component, call `useJourneyStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyStorageConfigQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useJourneyStorageConfigQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.JourneyStorageConfigQuery,
    SchemaTypes.JourneyStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.JourneyStorageConfigQuery, SchemaTypes.JourneyStorageConfigQueryVariables>(
    JourneyStorageConfigDocument,
    options
  );
}

export function useJourneyStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyStorageConfigQuery,
    SchemaTypes.JourneyStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.JourneyStorageConfigQuery, SchemaTypes.JourneyStorageConfigQueryVariables>(
    JourneyStorageConfigDocument,
    options
  );
}

export type JourneyStorageConfigQueryHookResult = ReturnType<typeof useJourneyStorageConfigQuery>;
export type JourneyStorageConfigLazyQueryHookResult = ReturnType<typeof useJourneyStorageConfigLazyQuery>;
export type JourneyStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyStorageConfigQuery,
  SchemaTypes.JourneyStorageConfigQueryVariables
>;
export function refetchJourneyStorageConfigQuery(variables?: SchemaTypes.JourneyStorageConfigQueryVariables) {
  return { query: JourneyStorageConfigDocument, variables: variables };
}

export const CalloutStorageConfigDocument = gql`
  query CalloutStorageConfig($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        framing {
          id
          profile {
            ...ProfileStorageConfig
          }
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useCalloutStorageConfigQuery__
 *
 * To run a query within a React component, call `useCalloutStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutStorageConfigQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutStorageConfigQuery,
    SchemaTypes.CalloutStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutStorageConfigQuery, SchemaTypes.CalloutStorageConfigQueryVariables>(
    CalloutStorageConfigDocument,
    options
  );
}

export function useCalloutStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutStorageConfigQuery,
    SchemaTypes.CalloutStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutStorageConfigQuery, SchemaTypes.CalloutStorageConfigQueryVariables>(
    CalloutStorageConfigDocument,
    options
  );
}

export type CalloutStorageConfigQueryHookResult = ReturnType<typeof useCalloutStorageConfigQuery>;
export type CalloutStorageConfigLazyQueryHookResult = ReturnType<typeof useCalloutStorageConfigLazyQuery>;
export type CalloutStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutStorageConfigQuery,
  SchemaTypes.CalloutStorageConfigQueryVariables
>;
export function refetchCalloutStorageConfigQuery(variables: SchemaTypes.CalloutStorageConfigQueryVariables) {
  return { query: CalloutStorageConfigDocument, variables: variables };
}

export const CalloutPostStorageConfigDocument = gql`
  query CalloutPostStorageConfig($postId: UUID_NAMEID!, $calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions(filter: { postIDs: [$postId] }) {
          post {
            id
            profile {
              ...ProfileStorageConfig
            }
          }
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useCalloutPostStorageConfigQuery__
 *
 * To run a query within a React component, call `useCalloutPostStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutPostStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutPostStorageConfigQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutPostStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutPostStorageConfigQuery,
    SchemaTypes.CalloutPostStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutPostStorageConfigQuery, SchemaTypes.CalloutPostStorageConfigQueryVariables>(
    CalloutPostStorageConfigDocument,
    options
  );
}

export function useCalloutPostStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutPostStorageConfigQuery,
    SchemaTypes.CalloutPostStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutPostStorageConfigQuery,
    SchemaTypes.CalloutPostStorageConfigQueryVariables
  >(CalloutPostStorageConfigDocument, options);
}

export type CalloutPostStorageConfigQueryHookResult = ReturnType<typeof useCalloutPostStorageConfigQuery>;
export type CalloutPostStorageConfigLazyQueryHookResult = ReturnType<typeof useCalloutPostStorageConfigLazyQuery>;
export type CalloutPostStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutPostStorageConfigQuery,
  SchemaTypes.CalloutPostStorageConfigQueryVariables
>;
export function refetchCalloutPostStorageConfigQuery(variables: SchemaTypes.CalloutPostStorageConfigQueryVariables) {
  return { query: CalloutPostStorageConfigDocument, variables: variables };
}

export const UserStorageConfigDocument = gql`
  query UserStorageConfig($userId: UUID_NAMEID_EMAIL!) {
    user(ID: $userId) {
      id
      profile {
        ...ProfileStorageConfig
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useUserStorageConfigQuery__
 *
 * To run a query within a React component, call `useUserStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserStorageConfigQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserStorageConfigQuery, SchemaTypes.UserStorageConfigQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserStorageConfigQuery, SchemaTypes.UserStorageConfigQueryVariables>(
    UserStorageConfigDocument,
    options
  );
}

export function useUserStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserStorageConfigQuery,
    SchemaTypes.UserStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserStorageConfigQuery, SchemaTypes.UserStorageConfigQueryVariables>(
    UserStorageConfigDocument,
    options
  );
}

export type UserStorageConfigQueryHookResult = ReturnType<typeof useUserStorageConfigQuery>;
export type UserStorageConfigLazyQueryHookResult = ReturnType<typeof useUserStorageConfigLazyQuery>;
export type UserStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.UserStorageConfigQuery,
  SchemaTypes.UserStorageConfigQueryVariables
>;
export function refetchUserStorageConfigQuery(variables: SchemaTypes.UserStorageConfigQueryVariables) {
  return { query: UserStorageConfigDocument, variables: variables };
}

export const OrganizationStorageConfigDocument = gql`
  query OrganizationStorageConfig($organizationId: UUID_NAMEID!) {
    organization(ID: $organizationId) {
      id
      profile {
        ...ProfileStorageConfig
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useOrganizationStorageConfigQuery__
 *
 * To run a query within a React component, call `useOrganizationStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationStorageConfigQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useOrganizationStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationStorageConfigQuery,
    SchemaTypes.OrganizationStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OrganizationStorageConfigQuery,
    SchemaTypes.OrganizationStorageConfigQueryVariables
  >(OrganizationStorageConfigDocument, options);
}

export function useOrganizationStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationStorageConfigQuery,
    SchemaTypes.OrganizationStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OrganizationStorageConfigQuery,
    SchemaTypes.OrganizationStorageConfigQueryVariables
  >(OrganizationStorageConfigDocument, options);
}

export type OrganizationStorageConfigQueryHookResult = ReturnType<typeof useOrganizationStorageConfigQuery>;
export type OrganizationStorageConfigLazyQueryHookResult = ReturnType<typeof useOrganizationStorageConfigLazyQuery>;
export type OrganizationStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationStorageConfigQuery,
  SchemaTypes.OrganizationStorageConfigQueryVariables
>;
export function refetchOrganizationStorageConfigQuery(variables: SchemaTypes.OrganizationStorageConfigQueryVariables) {
  return { query: OrganizationStorageConfigDocument, variables: variables };
}

export const InnovationPackStorageConfigDocument = gql`
  query InnovationPackStorageConfig($innovationPackId: UUID_NAMEID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          id
          profile {
            ...ProfileStorageConfig
          }
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useInnovationPackStorageConfigQuery__
 *
 * To run a query within a React component, call `useInnovationPackStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationPackStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationPackStorageConfigQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *   },
 * });
 */
export function useInnovationPackStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationPackStorageConfigQuery,
    SchemaTypes.InnovationPackStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationPackStorageConfigQuery,
    SchemaTypes.InnovationPackStorageConfigQueryVariables
  >(InnovationPackStorageConfigDocument, options);
}

export function useInnovationPackStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationPackStorageConfigQuery,
    SchemaTypes.InnovationPackStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationPackStorageConfigQuery,
    SchemaTypes.InnovationPackStorageConfigQueryVariables
  >(InnovationPackStorageConfigDocument, options);
}

export type InnovationPackStorageConfigQueryHookResult = ReturnType<typeof useInnovationPackStorageConfigQuery>;
export type InnovationPackStorageConfigLazyQueryHookResult = ReturnType<typeof useInnovationPackStorageConfigLazyQuery>;
export type InnovationPackStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPackStorageConfigQuery,
  SchemaTypes.InnovationPackStorageConfigQueryVariables
>;
export function refetchInnovationPackStorageConfigQuery(
  variables: SchemaTypes.InnovationPackStorageConfigQueryVariables
) {
  return { query: InnovationPackStorageConfigDocument, variables: variables };
}

export const InnovationHubStorageConfigDocument = gql`
  query InnovationHubStorageConfig($innovationHubId: UUID_NAMEID!) {
    platform {
      id
      innovationHub(id: $innovationHubId) {
        profile {
          ...ProfileStorageConfig
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;

/**
 * __useInnovationHubStorageConfigQuery__
 *
 * To run a query within a React component, call `useInnovationHubStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationHubStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationHubStorageConfigQuery({
 *   variables: {
 *      innovationHubId: // value for 'innovationHubId'
 *   },
 * });
 */
export function useInnovationHubStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationHubStorageConfigQuery,
    SchemaTypes.InnovationHubStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationHubStorageConfigQuery,
    SchemaTypes.InnovationHubStorageConfigQueryVariables
  >(InnovationHubStorageConfigDocument, options);
}

export function useInnovationHubStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationHubStorageConfigQuery,
    SchemaTypes.InnovationHubStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationHubStorageConfigQuery,
    SchemaTypes.InnovationHubStorageConfigQueryVariables
  >(InnovationHubStorageConfigDocument, options);
}

export type InnovationHubStorageConfigQueryHookResult = ReturnType<typeof useInnovationHubStorageConfigQuery>;
export type InnovationHubStorageConfigLazyQueryHookResult = ReturnType<typeof useInnovationHubStorageConfigLazyQuery>;
export type InnovationHubStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubStorageConfigQuery,
  SchemaTypes.InnovationHubStorageConfigQueryVariables
>;
export function refetchInnovationHubStorageConfigQuery(
  variables: SchemaTypes.InnovationHubStorageConfigQueryVariables
) {
  return { query: InnovationHubStorageConfigDocument, variables: variables };
}

export const PlatformStorageConfigDocument = gql`
  query PlatformStorageConfig {
    platform {
      id
      storageAggregator {
        id
        authorization {
          id
          myPrivileges
        }
        directStorageBucket {
          id
          allowedMimeTypes
          maxFileSize
          authorization {
            id
            myPrivileges
          }
        }
      }
    }
  }
`;

/**
 * __usePlatformStorageConfigQuery__
 *
 * To run a query within a React component, call `usePlatformStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformStorageConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformStorageConfigQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformStorageConfigQuery,
    SchemaTypes.PlatformStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformStorageConfigQuery, SchemaTypes.PlatformStorageConfigQueryVariables>(
    PlatformStorageConfigDocument,
    options
  );
}

export function usePlatformStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformStorageConfigQuery,
    SchemaTypes.PlatformStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformStorageConfigQuery, SchemaTypes.PlatformStorageConfigQueryVariables>(
    PlatformStorageConfigDocument,
    options
  );
}

export type PlatformStorageConfigQueryHookResult = ReturnType<typeof usePlatformStorageConfigQuery>;
export type PlatformStorageConfigLazyQueryHookResult = ReturnType<typeof usePlatformStorageConfigLazyQuery>;
export type PlatformStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformStorageConfigQuery,
  SchemaTypes.PlatformStorageConfigQueryVariables
>;
export function refetchPlatformStorageConfigQuery(variables?: SchemaTypes.PlatformStorageConfigQueryVariables) {
  return { query: PlatformStorageConfigDocument, variables: variables };
}

export const CalloutTemplatePreviewDocument = gql`
  query CalloutTemplatePreview($calloutTemplateId: UUID!) {
    lookup {
      calloutTemplate(ID: $calloutTemplateId) {
        ...CalloutTemplatePreview
      }
    }
  }
  ${CalloutTemplatePreviewFragmentDoc}
`;

/**
 * __useCalloutTemplatePreviewQuery__
 *
 * To run a query within a React component, call `useCalloutTemplatePreviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutTemplatePreviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutTemplatePreviewQuery({
 *   variables: {
 *      calloutTemplateId: // value for 'calloutTemplateId'
 *   },
 * });
 */
export function useCalloutTemplatePreviewQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutTemplatePreviewQuery,
    SchemaTypes.CalloutTemplatePreviewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutTemplatePreviewQuery, SchemaTypes.CalloutTemplatePreviewQueryVariables>(
    CalloutTemplatePreviewDocument,
    options
  );
}

export function useCalloutTemplatePreviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutTemplatePreviewQuery,
    SchemaTypes.CalloutTemplatePreviewQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutTemplatePreviewQuery, SchemaTypes.CalloutTemplatePreviewQueryVariables>(
    CalloutTemplatePreviewDocument,
    options
  );
}

export type CalloutTemplatePreviewQueryHookResult = ReturnType<typeof useCalloutTemplatePreviewQuery>;
export type CalloutTemplatePreviewLazyQueryHookResult = ReturnType<typeof useCalloutTemplatePreviewLazyQuery>;
export type CalloutTemplatePreviewQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutTemplatePreviewQuery,
  SchemaTypes.CalloutTemplatePreviewQueryVariables
>;
export function refetchCalloutTemplatePreviewQuery(variables: SchemaTypes.CalloutTemplatePreviewQueryVariables) {
  return { query: CalloutTemplatePreviewDocument, variables: variables };
}

export const WhiteboardTemplateContentDocument = gql`
  query whiteboardTemplateContent($whiteboardTemplateId: UUID!) {
    lookup {
      whiteboardTemplate(ID: $whiteboardTemplateId) {
        id
        profile {
          ...WhiteboardProfile
        }
        content
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
`;

/**
 * __useWhiteboardTemplateContentQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplateContentQuery({
 *   variables: {
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useWhiteboardTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplateContentQuery,
    SchemaTypes.WhiteboardTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardTemplateContentQuery,
    SchemaTypes.WhiteboardTemplateContentQueryVariables
  >(WhiteboardTemplateContentDocument, options);
}

export function useWhiteboardTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplateContentQuery,
    SchemaTypes.WhiteboardTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardTemplateContentQuery,
    SchemaTypes.WhiteboardTemplateContentQueryVariables
  >(WhiteboardTemplateContentDocument, options);
}

export type WhiteboardTemplateContentQueryHookResult = ReturnType<typeof useWhiteboardTemplateContentQuery>;
export type WhiteboardTemplateContentLazyQueryHookResult = ReturnType<typeof useWhiteboardTemplateContentLazyQuery>;
export type WhiteboardTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplateContentQuery,
  SchemaTypes.WhiteboardTemplateContentQueryVariables
>;
export function refetchWhiteboardTemplateContentQuery(variables: SchemaTypes.WhiteboardTemplateContentQueryVariables) {
  return { query: WhiteboardTemplateContentDocument, variables: variables };
}

export const SpaceDashboardCalendarEventsDocument = gql`
  query spaceDashboardCalendarEvents($spaceId: UUID_NAMEID!, $limit: Float) {
    space(ID: $spaceId) {
      id
      collaboration {
        ...CollaborationTimelineInfo
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useSpaceDashboardCalendarEventsQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardCalendarEventsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSpaceDashboardCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardCalendarEventsQuery,
    SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceDashboardCalendarEventsQuery,
    SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
  >(SpaceDashboardCalendarEventsDocument, options);
}

export function useSpaceDashboardCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardCalendarEventsQuery,
    SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardCalendarEventsQuery,
    SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
  >(SpaceDashboardCalendarEventsDocument, options);
}

export type SpaceDashboardCalendarEventsQueryHookResult = ReturnType<typeof useSpaceDashboardCalendarEventsQuery>;
export type SpaceDashboardCalendarEventsLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardCalendarEventsLazyQuery
>;
export type SpaceDashboardCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardCalendarEventsQuery,
  SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
>;
export function refetchSpaceDashboardCalendarEventsQuery(
  variables: SchemaTypes.SpaceDashboardCalendarEventsQueryVariables
) {
  return { query: SpaceDashboardCalendarEventsDocument, variables: variables };
}

export const ChallengeDashboardCalendarEventsDocument = gql`
  query challengeDashboardCalendarEvents($challengeId: UUID!, $limit: Float) {
    lookup {
      challenge(ID: $challengeId) {
        id
        collaboration {
          ...CollaborationTimelineInfo
        }
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useChallengeDashboardCalendarEventsQuery__
 *
 * To run a query within a React component, call `useChallengeDashboardCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeDashboardCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeDashboardCalendarEventsQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useChallengeDashboardCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeDashboardCalendarEventsQuery,
    SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeDashboardCalendarEventsQuery,
    SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
  >(ChallengeDashboardCalendarEventsDocument, options);
}

export function useChallengeDashboardCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeDashboardCalendarEventsQuery,
    SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeDashboardCalendarEventsQuery,
    SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
  >(ChallengeDashboardCalendarEventsDocument, options);
}

export type ChallengeDashboardCalendarEventsQueryHookResult = ReturnType<
  typeof useChallengeDashboardCalendarEventsQuery
>;
export type ChallengeDashboardCalendarEventsLazyQueryHookResult = ReturnType<
  typeof useChallengeDashboardCalendarEventsLazyQuery
>;
export type ChallengeDashboardCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeDashboardCalendarEventsQuery,
  SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
>;
export function refetchChallengeDashboardCalendarEventsQuery(
  variables: SchemaTypes.ChallengeDashboardCalendarEventsQueryVariables
) {
  return { query: ChallengeDashboardCalendarEventsDocument, variables: variables };
}

export const OpportunityDashboardCalendarEventsDocument = gql`
  query opportunityDashboardCalendarEvents($opportunityId: UUID!, $limit: Float) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        collaboration {
          ...CollaborationTimelineInfo
        }
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useOpportunityDashboardCalendarEventsQuery__
 *
 * To run a query within a React component, call `useOpportunityDashboardCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityDashboardCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityDashboardCalendarEventsQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useOpportunityDashboardCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityDashboardCalendarEventsQuery,
    SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityDashboardCalendarEventsQuery,
    SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
  >(OpportunityDashboardCalendarEventsDocument, options);
}

export function useOpportunityDashboardCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityDashboardCalendarEventsQuery,
    SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityDashboardCalendarEventsQuery,
    SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
  >(OpportunityDashboardCalendarEventsDocument, options);
}

export type OpportunityDashboardCalendarEventsQueryHookResult = ReturnType<
  typeof useOpportunityDashboardCalendarEventsQuery
>;
export type OpportunityDashboardCalendarEventsLazyQueryHookResult = ReturnType<
  typeof useOpportunityDashboardCalendarEventsLazyQuery
>;
export type OpportunityDashboardCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityDashboardCalendarEventsQuery,
  SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
>;
export function refetchOpportunityDashboardCalendarEventsQuery(
  variables: SchemaTypes.OpportunityDashboardCalendarEventsQueryVariables
) {
  return { query: OpportunityDashboardCalendarEventsDocument, variables: variables };
}

export const SpaceCalendarEventsDocument = gql`
  query spaceCalendarEvents($spaceId: UUID_NAMEID!, $limit: Float) {
    space(ID: $spaceId) {
      id
      collaboration {
        ...CollaborationTimelineInfo
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useSpaceCalendarEventsQuery__
 *
 * To run a query within a React component, call `useSpaceCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCalendarEventsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSpaceCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCalendarEventsQuery,
    SchemaTypes.SpaceCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCalendarEventsQuery, SchemaTypes.SpaceCalendarEventsQueryVariables>(
    SpaceCalendarEventsDocument,
    options
  );
}

export function useSpaceCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCalendarEventsQuery,
    SchemaTypes.SpaceCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCalendarEventsQuery, SchemaTypes.SpaceCalendarEventsQueryVariables>(
    SpaceCalendarEventsDocument,
    options
  );
}

export type SpaceCalendarEventsQueryHookResult = ReturnType<typeof useSpaceCalendarEventsQuery>;
export type SpaceCalendarEventsLazyQueryHookResult = ReturnType<typeof useSpaceCalendarEventsLazyQuery>;
export type SpaceCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCalendarEventsQuery,
  SchemaTypes.SpaceCalendarEventsQueryVariables
>;
export function refetchSpaceCalendarEventsQuery(variables: SchemaTypes.SpaceCalendarEventsQueryVariables) {
  return { query: SpaceCalendarEventsDocument, variables: variables };
}

export const ChallengeCalendarEventsDocument = gql`
  query challengeCalendarEvents($challengeId: UUID!, $limit: Float) {
    lookup {
      challenge(ID: $challengeId) {
        id
        collaboration {
          ...CollaborationTimelineInfo
        }
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useChallengeCalendarEventsQuery__
 *
 * To run a query within a React component, call `useChallengeCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCalendarEventsQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useChallengeCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCalendarEventsQuery,
    SchemaTypes.ChallengeCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCalendarEventsQuery, SchemaTypes.ChallengeCalendarEventsQueryVariables>(
    ChallengeCalendarEventsDocument,
    options
  );
}

export function useChallengeCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCalendarEventsQuery,
    SchemaTypes.ChallengeCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCalendarEventsQuery,
    SchemaTypes.ChallengeCalendarEventsQueryVariables
  >(ChallengeCalendarEventsDocument, options);
}

export type ChallengeCalendarEventsQueryHookResult = ReturnType<typeof useChallengeCalendarEventsQuery>;
export type ChallengeCalendarEventsLazyQueryHookResult = ReturnType<typeof useChallengeCalendarEventsLazyQuery>;
export type ChallengeCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCalendarEventsQuery,
  SchemaTypes.ChallengeCalendarEventsQueryVariables
>;
export function refetchChallengeCalendarEventsQuery(variables: SchemaTypes.ChallengeCalendarEventsQueryVariables) {
  return { query: ChallengeCalendarEventsDocument, variables: variables };
}

export const OpportunityCalendarEventsDocument = gql`
  query opportunityCalendarEvents($opportunityId: UUID!, $limit: Float) {
    lookup {
      opportunity(ID: $opportunityId) {
        id
        collaboration {
          ...CollaborationTimelineInfo
        }
      }
    }
  }
  ${CollaborationTimelineInfoFragmentDoc}
`;

/**
 * __useOpportunityCalendarEventsQuery__
 *
 * To run a query within a React component, call `useOpportunityCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCalendarEventsQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useOpportunityCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCalendarEventsQuery,
    SchemaTypes.OpportunityCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCalendarEventsQuery,
    SchemaTypes.OpportunityCalendarEventsQueryVariables
  >(OpportunityCalendarEventsDocument, options);
}

export function useOpportunityCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCalendarEventsQuery,
    SchemaTypes.OpportunityCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCalendarEventsQuery,
    SchemaTypes.OpportunityCalendarEventsQueryVariables
  >(OpportunityCalendarEventsDocument, options);
}

export type OpportunityCalendarEventsQueryHookResult = ReturnType<typeof useOpportunityCalendarEventsQuery>;
export type OpportunityCalendarEventsLazyQueryHookResult = ReturnType<typeof useOpportunityCalendarEventsLazyQuery>;
export type OpportunityCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCalendarEventsQuery,
  SchemaTypes.OpportunityCalendarEventsQueryVariables
>;
export function refetchOpportunityCalendarEventsQuery(variables: SchemaTypes.OpportunityCalendarEventsQueryVariables) {
  return { query: OpportunityCalendarEventsDocument, variables: variables };
}

export const CalendarEventDetailsDocument = gql`
  query calendarEventDetails($eventId: UUID!) {
    lookup {
      calendarEvent(ID: $eventId) {
        ...CalendarEventDetails
      }
    }
  }
  ${CalendarEventDetailsFragmentDoc}
`;

/**
 * __useCalendarEventDetailsQuery__
 *
 * To run a query within a React component, call `useCalendarEventDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalendarEventDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalendarEventDetailsQuery({
 *   variables: {
 *      eventId: // value for 'eventId'
 *   },
 * });
 */
export function useCalendarEventDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalendarEventDetailsQuery,
    SchemaTypes.CalendarEventDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalendarEventDetailsQuery, SchemaTypes.CalendarEventDetailsQueryVariables>(
    CalendarEventDetailsDocument,
    options
  );
}

export function useCalendarEventDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalendarEventDetailsQuery,
    SchemaTypes.CalendarEventDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalendarEventDetailsQuery, SchemaTypes.CalendarEventDetailsQueryVariables>(
    CalendarEventDetailsDocument,
    options
  );
}

export type CalendarEventDetailsQueryHookResult = ReturnType<typeof useCalendarEventDetailsQuery>;
export type CalendarEventDetailsLazyQueryHookResult = ReturnType<typeof useCalendarEventDetailsLazyQuery>;
export type CalendarEventDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalendarEventDetailsQuery,
  SchemaTypes.CalendarEventDetailsQueryVariables
>;
export function refetchCalendarEventDetailsQuery(variables: SchemaTypes.CalendarEventDetailsQueryVariables) {
  return { query: CalendarEventDetailsDocument, variables: variables };
}

export const CreateCalendarEventDocument = gql`
  mutation createCalendarEvent($eventData: CreateCalendarEventOnCalendarInput!) {
    createEventOnCalendar(eventData: $eventData) {
      ...CalendarEventDetails
    }
  }
  ${CalendarEventDetailsFragmentDoc}
`;
export type CreateCalendarEventMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateCalendarEventMutation,
  SchemaTypes.CreateCalendarEventMutationVariables
>;

/**
 * __useCreateCalendarEventMutation__
 *
 * To run a mutation, you first call `useCreateCalendarEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCalendarEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCalendarEventMutation, { data, loading, error }] = useCreateCalendarEventMutation({
 *   variables: {
 *      eventData: // value for 'eventData'
 *   },
 * });
 */
export function useCreateCalendarEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateCalendarEventMutation,
    SchemaTypes.CreateCalendarEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateCalendarEventMutation, SchemaTypes.CreateCalendarEventMutationVariables>(
    CreateCalendarEventDocument,
    options
  );
}

export type CreateCalendarEventMutationHookResult = ReturnType<typeof useCreateCalendarEventMutation>;
export type CreateCalendarEventMutationResult = Apollo.MutationResult<SchemaTypes.CreateCalendarEventMutation>;
export type CreateCalendarEventMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateCalendarEventMutation,
  SchemaTypes.CreateCalendarEventMutationVariables
>;
export const UpdateCalendarEventDocument = gql`
  mutation updateCalendarEvent($eventData: UpdateCalendarEventInput!) {
    updateCalendarEvent(eventData: $eventData) {
      ...CalendarEventDetails
    }
  }
  ${CalendarEventDetailsFragmentDoc}
`;
export type UpdateCalendarEventMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalendarEventMutation,
  SchemaTypes.UpdateCalendarEventMutationVariables
>;

/**
 * __useUpdateCalendarEventMutation__
 *
 * To run a mutation, you first call `useUpdateCalendarEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalendarEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalendarEventMutation, { data, loading, error }] = useUpdateCalendarEventMutation({
 *   variables: {
 *      eventData: // value for 'eventData'
 *   },
 * });
 */
export function useUpdateCalendarEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalendarEventMutation,
    SchemaTypes.UpdateCalendarEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateCalendarEventMutation, SchemaTypes.UpdateCalendarEventMutationVariables>(
    UpdateCalendarEventDocument,
    options
  );
}

export type UpdateCalendarEventMutationHookResult = ReturnType<typeof useUpdateCalendarEventMutation>;
export type UpdateCalendarEventMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalendarEventMutation>;
export type UpdateCalendarEventMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalendarEventMutation,
  SchemaTypes.UpdateCalendarEventMutationVariables
>;
export const DeleteCalendarEventDocument = gql`
  mutation deleteCalendarEvent($deleteData: DeleteCalendarEventInput!) {
    deleteCalendarEvent(deleteData: $deleteData) {
      id
      nameID
    }
  }
`;
export type DeleteCalendarEventMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCalendarEventMutation,
  SchemaTypes.DeleteCalendarEventMutationVariables
>;

/**
 * __useDeleteCalendarEventMutation__
 *
 * To run a mutation, you first call `useDeleteCalendarEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCalendarEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCalendarEventMutation, { data, loading, error }] = useDeleteCalendarEventMutation({
 *   variables: {
 *      deleteData: // value for 'deleteData'
 *   },
 * });
 */
export function useDeleteCalendarEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteCalendarEventMutation,
    SchemaTypes.DeleteCalendarEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteCalendarEventMutation, SchemaTypes.DeleteCalendarEventMutationVariables>(
    DeleteCalendarEventDocument,
    options
  );
}

export type DeleteCalendarEventMutationHookResult = ReturnType<typeof useDeleteCalendarEventMutation>;
export type DeleteCalendarEventMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCalendarEventMutation>;
export type DeleteCalendarEventMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCalendarEventMutation,
  SchemaTypes.DeleteCalendarEventMutationVariables
>;
export const UpdateAnswerRelevanceDocument = gql`
  mutation updateAnswerRelevance($input: ChatGuidanceAnswerRelevanceInput!) {
    updateAnswerRelevance(input: $input)
  }
`;
export type UpdateAnswerRelevanceMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateAnswerRelevanceMutation,
  SchemaTypes.UpdateAnswerRelevanceMutationVariables
>;

/**
 * __useUpdateAnswerRelevanceMutation__
 *
 * To run a mutation, you first call `useUpdateAnswerRelevanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnswerRelevanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnswerRelevanceMutation, { data, loading, error }] = useUpdateAnswerRelevanceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAnswerRelevanceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateAnswerRelevanceMutation,
    SchemaTypes.UpdateAnswerRelevanceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateAnswerRelevanceMutation,
    SchemaTypes.UpdateAnswerRelevanceMutationVariables
  >(UpdateAnswerRelevanceDocument, options);
}

export type UpdateAnswerRelevanceMutationHookResult = ReturnType<typeof useUpdateAnswerRelevanceMutation>;
export type UpdateAnswerRelevanceMutationResult = Apollo.MutationResult<SchemaTypes.UpdateAnswerRelevanceMutation>;
export type UpdateAnswerRelevanceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateAnswerRelevanceMutation,
  SchemaTypes.UpdateAnswerRelevanceMutationVariables
>;
export const ResetChatGuidanceDocument = gql`
  mutation resetChatGuidance {
    resetChatGuidance
  }
`;
export type ResetChatGuidanceMutationFn = Apollo.MutationFunction<
  SchemaTypes.ResetChatGuidanceMutation,
  SchemaTypes.ResetChatGuidanceMutationVariables
>;

/**
 * __useResetChatGuidanceMutation__
 *
 * To run a mutation, you first call `useResetChatGuidanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetChatGuidanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetChatGuidanceMutation, { data, loading, error }] = useResetChatGuidanceMutation({
 *   variables: {
 *   },
 * });
 */
export function useResetChatGuidanceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ResetChatGuidanceMutation,
    SchemaTypes.ResetChatGuidanceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.ResetChatGuidanceMutation, SchemaTypes.ResetChatGuidanceMutationVariables>(
    ResetChatGuidanceDocument,
    options
  );
}

export type ResetChatGuidanceMutationHookResult = ReturnType<typeof useResetChatGuidanceMutation>;
export type ResetChatGuidanceMutationResult = Apollo.MutationResult<SchemaTypes.ResetChatGuidanceMutation>;
export type ResetChatGuidanceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ResetChatGuidanceMutation,
  SchemaTypes.ResetChatGuidanceMutationVariables
>;
export const AskChatGuidanceQuestionDocument = gql`
  query askChatGuidanceQuestion($chatData: ChatGuidanceInput!) {
    askChatGuidanceQuestion(chatData: $chatData) {
      id
      answer
      question
      sources {
        uri
        title
      }
    }
  }
`;

/**
 * __useAskChatGuidanceQuestionQuery__
 *
 * To run a query within a React component, call `useAskChatGuidanceQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useAskChatGuidanceQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAskChatGuidanceQuestionQuery({
 *   variables: {
 *      chatData: // value for 'chatData'
 *   },
 * });
 */
export function useAskChatGuidanceQuestionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AskChatGuidanceQuestionQuery,
    SchemaTypes.AskChatGuidanceQuestionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AskChatGuidanceQuestionQuery, SchemaTypes.AskChatGuidanceQuestionQueryVariables>(
    AskChatGuidanceQuestionDocument,
    options
  );
}

export function useAskChatGuidanceQuestionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AskChatGuidanceQuestionQuery,
    SchemaTypes.AskChatGuidanceQuestionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AskChatGuidanceQuestionQuery,
    SchemaTypes.AskChatGuidanceQuestionQueryVariables
  >(AskChatGuidanceQuestionDocument, options);
}

export type AskChatGuidanceQuestionQueryHookResult = ReturnType<typeof useAskChatGuidanceQuestionQuery>;
export type AskChatGuidanceQuestionLazyQueryHookResult = ReturnType<typeof useAskChatGuidanceQuestionLazyQuery>;
export type AskChatGuidanceQuestionQueryResult = Apollo.QueryResult<
  SchemaTypes.AskChatGuidanceQuestionQuery,
  SchemaTypes.AskChatGuidanceQuestionQueryVariables
>;
export function refetchAskChatGuidanceQuestionQuery(variables: SchemaTypes.AskChatGuidanceQuestionQueryVariables) {
  return { query: AskChatGuidanceQuestionDocument, variables: variables };
}

export const JourneyRouteResolverDocument = gql`
  query JourneyRouteResolver(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID! = "00000000-0000-0000-0000-000000000000"
    $opportunityNameId: UUID_NAMEID! = "00000000-0000-0000-0000-000000000000"
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
      }
    }
  }
`;

/**
 * __useJourneyRouteResolverQuery__
 *
 * To run a query within a React component, call `useJourneyRouteResolverQuery` and pass it any options that fit your needs.
 * When your component renders, `useJourneyRouteResolverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJourneyRouteResolverQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useJourneyRouteResolverQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.JourneyRouteResolverQuery,
    SchemaTypes.JourneyRouteResolverQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.JourneyRouteResolverQuery, SchemaTypes.JourneyRouteResolverQueryVariables>(
    JourneyRouteResolverDocument,
    options
  );
}

export function useJourneyRouteResolverLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.JourneyRouteResolverQuery,
    SchemaTypes.JourneyRouteResolverQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.JourneyRouteResolverQuery, SchemaTypes.JourneyRouteResolverQueryVariables>(
    JourneyRouteResolverDocument,
    options
  );
}

export type JourneyRouteResolverQueryHookResult = ReturnType<typeof useJourneyRouteResolverQuery>;
export type JourneyRouteResolverLazyQueryHookResult = ReturnType<typeof useJourneyRouteResolverLazyQuery>;
export type JourneyRouteResolverQueryResult = Apollo.QueryResult<
  SchemaTypes.JourneyRouteResolverQuery,
  SchemaTypes.JourneyRouteResolverQueryVariables
>;
export function refetchJourneyRouteResolverQuery(variables: SchemaTypes.JourneyRouteResolverQueryVariables) {
  return { query: JourneyRouteResolverDocument, variables: variables };
}

export const SearchDocument = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      journeyResults {
        id
        score
        terms
        type
        ... on SearchResultSpace {
          ...SearchResultSpace
        }
        ... on SearchResultChallenge {
          ...SearchResultChallenge
        }
        ... on SearchResultOpportunity {
          ...SearchResultOpportunity
        }
      }
      journeyResultsCount
      calloutResults {
        id
        score
        terms
        type
        ... on SearchResultCallout {
          ...SearchResultCallout
        }
      }
      contributorResults {
        id
        score
        terms
        type
        ... on SearchResultUser {
          ...SearchResultUser
        }
        ... on SearchResultOrganization {
          ...SearchResultOrganization
        }
      }
      contributorResultsCount
      contributionResults {
        id
        score
        terms
        type
        ... on SearchResultPost {
          ...SearchResultPost
        }
      }
      contributionResultsCount
    }
  }
  ${SearchResultSpaceFragmentDoc}
  ${SearchResultChallengeFragmentDoc}
  ${SearchResultOpportunityFragmentDoc}
  ${SearchResultCalloutFragmentDoc}
  ${SearchResultUserFragmentDoc}
  ${SearchResultOrganizationFragmentDoc}
  ${SearchResultPostFragmentDoc}
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

export const UserRolesSearchCardsDocument = gql`
  query userRolesSearchCards($userId: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      spaces {
        id
        roles
        challenges {
          id
          nameID
          roles
        }
        opportunities {
          id
          roles
        }
      }
      organizations {
        id
        roles
      }
    }
  }
`;

/**
 * __useUserRolesSearchCardsQuery__
 *
 * To run a query within a React component, call `useUserRolesSearchCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserRolesSearchCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserRolesSearchCardsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserRolesSearchCardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserRolesSearchCardsQuery,
    SchemaTypes.UserRolesSearchCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserRolesSearchCardsQuery, SchemaTypes.UserRolesSearchCardsQueryVariables>(
    UserRolesSearchCardsDocument,
    options
  );
}

export function useUserRolesSearchCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserRolesSearchCardsQuery,
    SchemaTypes.UserRolesSearchCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserRolesSearchCardsQuery, SchemaTypes.UserRolesSearchCardsQueryVariables>(
    UserRolesSearchCardsDocument,
    options
  );
}

export type UserRolesSearchCardsQueryHookResult = ReturnType<typeof useUserRolesSearchCardsQuery>;
export type UserRolesSearchCardsLazyQueryHookResult = ReturnType<typeof useUserRolesSearchCardsLazyQuery>;
export type UserRolesSearchCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserRolesSearchCardsQuery,
  SchemaTypes.UserRolesSearchCardsQueryVariables
>;
export function refetchUserRolesSearchCardsQuery(variables: SchemaTypes.UserRolesSearchCardsQueryVariables) {
  return { query: UserRolesSearchCardsDocument, variables: variables };
}

export const SearchScopeDetailsSpaceDocument = gql`
  query SearchScopeDetailsSpace($spaceNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      profile {
        id
        displayName
        avatar: visual(type: AVATAR) {
          id
          uri
        }
      }
      account {
        id
        license {
          id
          visibility
        }
      }
    }
  }
`;

/**
 * __useSearchScopeDetailsSpaceQuery__
 *
 * To run a query within a React component, call `useSearchScopeDetailsSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchScopeDetailsSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchScopeDetailsSpaceQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *   },
 * });
 */
export function useSearchScopeDetailsSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SearchScopeDetailsSpaceQuery,
    SchemaTypes.SearchScopeDetailsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SearchScopeDetailsSpaceQuery, SchemaTypes.SearchScopeDetailsSpaceQueryVariables>(
    SearchScopeDetailsSpaceDocument,
    options
  );
}

export function useSearchScopeDetailsSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SearchScopeDetailsSpaceQuery,
    SchemaTypes.SearchScopeDetailsSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SearchScopeDetailsSpaceQuery,
    SchemaTypes.SearchScopeDetailsSpaceQueryVariables
  >(SearchScopeDetailsSpaceDocument, options);
}

export type SearchScopeDetailsSpaceQueryHookResult = ReturnType<typeof useSearchScopeDetailsSpaceQuery>;
export type SearchScopeDetailsSpaceLazyQueryHookResult = ReturnType<typeof useSearchScopeDetailsSpaceLazyQuery>;
export type SearchScopeDetailsSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SearchScopeDetailsSpaceQuery,
  SchemaTypes.SearchScopeDetailsSpaceQueryVariables
>;
export function refetchSearchScopeDetailsSpaceQuery(variables: SchemaTypes.SearchScopeDetailsSpaceQueryVariables) {
  return { query: SearchScopeDetailsSpaceDocument, variables: variables };
}

export const InnovationLibraryDocument = gql`
  query InnovationLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          ...InnovationPackData
        }
      }
    }
  }
  ${InnovationPackDataFragmentDoc}
`;

/**
 * __useInnovationLibraryQuery__
 *
 * To run a query within a React component, call `useInnovationLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function useInnovationLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.InnovationLibraryQuery, SchemaTypes.InnovationLibraryQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationLibraryQuery, SchemaTypes.InnovationLibraryQueryVariables>(
    InnovationLibraryDocument,
    options
  );
}

export function useInnovationLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationLibraryQuery,
    SchemaTypes.InnovationLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationLibraryQuery, SchemaTypes.InnovationLibraryQueryVariables>(
    InnovationLibraryDocument,
    options
  );
}

export type InnovationLibraryQueryHookResult = ReturnType<typeof useInnovationLibraryQuery>;
export type InnovationLibraryLazyQueryHookResult = ReturnType<typeof useInnovationLibraryLazyQuery>;
export type InnovationLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationLibraryQuery,
  SchemaTypes.InnovationLibraryQueryVariables
>;
export function refetchInnovationLibraryQuery(variables?: SchemaTypes.InnovationLibraryQueryVariables) {
  return { query: InnovationLibraryDocument, variables: variables };
}

export const DashboardSpacesDocument = gql`
  query DashboardSpaces($visibilities: [SpaceVisibility!] = [ACTIVE]) {
    spaces(filter: { visibilities: $visibilities }) {
      ...SpaceCard
    }
  }
  ${SpaceCardFragmentDoc}
`;

/**
 * __useDashboardSpacesQuery__
 *
 * To run a query within a React component, call `useDashboardSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardSpacesQuery({
 *   variables: {
 *      visibilities: // value for 'visibilities'
 *   },
 * });
 */
export function useDashboardSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>(
    DashboardSpacesDocument,
    options
  );
}

export function useDashboardSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>(
    DashboardSpacesDocument,
    options
  );
}

export type DashboardSpacesQueryHookResult = ReturnType<typeof useDashboardSpacesQuery>;
export type DashboardSpacesLazyQueryHookResult = ReturnType<typeof useDashboardSpacesLazyQuery>;
export type DashboardSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.DashboardSpacesQuery,
  SchemaTypes.DashboardSpacesQueryVariables
>;
export function refetchDashboardSpacesQuery(variables?: SchemaTypes.DashboardSpacesQueryVariables) {
  return { query: DashboardSpacesDocument, variables: variables };
}

export const DashboardSpacesPaginatedDocument = gql`
  query DashboardSpacesPaginated($first: Int!, $after: UUID, $visibilities: [SpaceVisibility!] = [ACTIVE]) {
    spacesPaginated(first: $first, after: $after, filter: { visibilities: $visibilities }) {
      spaces {
        ...SpaceCard
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${SpaceCardFragmentDoc}
  ${PageInfoFragmentDoc}
`;

/**
 * __useDashboardSpacesPaginatedQuery__
 *
 * To run a query within a React component, call `useDashboardSpacesPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardSpacesPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardSpacesPaginatedQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      visibilities: // value for 'visibilities'
 *   },
 * });
 */
export function useDashboardSpacesPaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.DashboardSpacesPaginatedQuery,
    SchemaTypes.DashboardSpacesPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.DashboardSpacesPaginatedQuery, SchemaTypes.DashboardSpacesPaginatedQueryVariables>(
    DashboardSpacesPaginatedDocument,
    options
  );
}

export function useDashboardSpacesPaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.DashboardSpacesPaginatedQuery,
    SchemaTypes.DashboardSpacesPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.DashboardSpacesPaginatedQuery,
    SchemaTypes.DashboardSpacesPaginatedQueryVariables
  >(DashboardSpacesPaginatedDocument, options);
}

export type DashboardSpacesPaginatedQueryHookResult = ReturnType<typeof useDashboardSpacesPaginatedQuery>;
export type DashboardSpacesPaginatedLazyQueryHookResult = ReturnType<typeof useDashboardSpacesPaginatedLazyQuery>;
export type DashboardSpacesPaginatedQueryResult = Apollo.QueryResult<
  SchemaTypes.DashboardSpacesPaginatedQuery,
  SchemaTypes.DashboardSpacesPaginatedQueryVariables
>;
export function refetchDashboardSpacesPaginatedQuery(variables: SchemaTypes.DashboardSpacesPaginatedQueryVariables) {
  return { query: DashboardSpacesPaginatedDocument, variables: variables };
}

export const InnovationLibraryBlockDocument = gql`
  query InnovationLibraryBlock {
    platform {
      id
      library {
        id
        innovationPacks(queryData: { limit: 1, orderBy: RANDOM }) {
          ...InnovationPackCard
        }
      }
    }
  }
  ${InnovationPackCardFragmentDoc}
`;

/**
 * __useInnovationLibraryBlockQuery__
 *
 * To run a query within a React component, call `useInnovationLibraryBlockQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationLibraryBlockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationLibraryBlockQuery({
 *   variables: {
 *   },
 * });
 */
export function useInnovationLibraryBlockQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.InnovationLibraryBlockQuery,
    SchemaTypes.InnovationLibraryBlockQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationLibraryBlockQuery, SchemaTypes.InnovationLibraryBlockQueryVariables>(
    InnovationLibraryBlockDocument,
    options
  );
}

export function useInnovationLibraryBlockLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationLibraryBlockQuery,
    SchemaTypes.InnovationLibraryBlockQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationLibraryBlockQuery, SchemaTypes.InnovationLibraryBlockQueryVariables>(
    InnovationLibraryBlockDocument,
    options
  );
}

export type InnovationLibraryBlockQueryHookResult = ReturnType<typeof useInnovationLibraryBlockQuery>;
export type InnovationLibraryBlockLazyQueryHookResult = ReturnType<typeof useInnovationLibraryBlockLazyQuery>;
export type InnovationLibraryBlockQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationLibraryBlockQuery,
  SchemaTypes.InnovationLibraryBlockQueryVariables
>;
export function refetchInnovationLibraryBlockQuery(variables?: SchemaTypes.InnovationLibraryBlockQueryVariables) {
  return { query: InnovationLibraryBlockDocument, variables: variables };
}

export const LatestContributionsDocument = gql`
  query LatestContributions($first: Int!, $after: UUID, $filter: ActivityFeedQueryArgs) {
    activityFeed(after: $after, first: $first, args: $filter) {
      activityFeed {
        id
        collaborationID
        createdDate
        description
        type
        child
        parentNameID
        journeyDisplayName: parentDisplayName
        journey {
          id
          ... on Space {
            profile {
              ...RecentContributionsSpaceProfile
            }
          }
          ... on RelayPaginatedSpace {
            profile {
              ...RecentContributionsSpaceProfile
            }
          }
          ... on Challenge {
            profile {
              ...RecentContributionsChildJourneyProfile
            }
          }
          ... on Opportunity {
            profile {
              ...RecentContributionsChildJourneyProfile
            }
          }
        }
        triggeredBy {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              id
              uri
            }
          }
        }
        ... on ActivityLogEntryMemberJoined {
          ...ActivityLogMemberJoined
        }
        ... on ActivityLogEntryCalloutPublished {
          ...ActivityLogCalloutPublished
        }
        ... on ActivityLogEntryCalloutPostCreated {
          ...ActivityLogCalloutPostCreated
        }
        ... on ActivityLogEntryCalloutLinkCreated {
          ...ActivityLogCalloutLinkCreated
        }
        ... on ActivityLogEntryCalloutPostComment {
          ...ActivityLogCalloutPostComment
        }
        ... on ActivityLogEntryCalloutWhiteboardCreated {
          ...ActivityLogCalloutWhiteboardCreated
        }
        ... on ActivityLogEntryCalloutWhiteboardContentModified {
          ...ActivityLogCalloutWhiteboardContentModified
        }
        ... on ActivityLogEntryCalloutDiscussionComment {
          ...ActivityLogCalloutDiscussionComment
        }
        ... on ActivityLogEntryChallengeCreated {
          ...ActivityLogChallengeCreated
        }
        ... on ActivityLogEntryOpportunityCreated {
          ...ActivityLogOpportunityCreated
        }
        ... on ActivityLogEntryUpdateSent {
          ...ActivityLogUpdateSent
        }
        ... on ActivityLogEntryCalendarEventCreated {
          ...ActivityLogCalendarEventCreated
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${RecentContributionsSpaceProfileFragmentDoc}
  ${RecentContributionsChildJourneyProfileFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
  ${ActivityLogCalendarEventCreatedFragmentDoc}
`;

/**
 * __useLatestContributionsQuery__
 *
 * To run a query within a React component, call `useLatestContributionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestContributionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestContributionsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useLatestContributionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.LatestContributionsQuery,
    SchemaTypes.LatestContributionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.LatestContributionsQuery, SchemaTypes.LatestContributionsQueryVariables>(
    LatestContributionsDocument,
    options
  );
}

export function useLatestContributionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.LatestContributionsQuery,
    SchemaTypes.LatestContributionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.LatestContributionsQuery, SchemaTypes.LatestContributionsQueryVariables>(
    LatestContributionsDocument,
    options
  );
}

export type LatestContributionsQueryHookResult = ReturnType<typeof useLatestContributionsQuery>;
export type LatestContributionsLazyQueryHookResult = ReturnType<typeof useLatestContributionsLazyQuery>;
export type LatestContributionsQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestContributionsQuery,
  SchemaTypes.LatestContributionsQueryVariables
>;
export function refetchLatestContributionsQuery(variables: SchemaTypes.LatestContributionsQueryVariables) {
  return { query: LatestContributionsDocument, variables: variables };
}

export const LatestContributionsGroupedDocument = gql`
  query LatestContributionsGrouped($filter: ActivityFeedGroupedQueryArgs) {
    activityFeedGrouped(args: $filter) {
      id
      collaborationID
      createdDate
      description
      type
      child
      parentNameID
      journeyDisplayName: parentDisplayName
      journey {
        id
        ... on Space {
          profile {
            ...RecentContributionsSpaceProfile
          }
        }
        ... on RelayPaginatedSpace {
          profile {
            ...RecentContributionsSpaceProfile
          }
        }
        ... on Challenge {
          profile {
            ...RecentContributionsChildJourneyProfile
          }
        }
        ... on Opportunity {
          profile {
            ...RecentContributionsChildJourneyProfile
          }
        }
      }
      ... on ActivityLogEntryMemberJoined {
        ...ActivityLogMemberJoined
      }
      ... on ActivityLogEntryCalloutPublished {
        ...ActivityLogCalloutPublished
      }
      ... on ActivityLogEntryCalloutPostCreated {
        ...ActivityLogCalloutPostCreated
      }
      ... on ActivityLogEntryCalloutLinkCreated {
        ...ActivityLogCalloutLinkCreated
      }
      ... on ActivityLogEntryCalloutPostComment {
        ...ActivityLogCalloutPostComment
      }
      ... on ActivityLogEntryCalloutWhiteboardCreated {
        ...ActivityLogCalloutWhiteboardCreated
      }
      ... on ActivityLogEntryCalloutWhiteboardContentModified {
        ...ActivityLogCalloutWhiteboardContentModified
      }
      ... on ActivityLogEntryCalloutDiscussionComment {
        ...ActivityLogCalloutDiscussionComment
      }
      ... on ActivityLogEntryChallengeCreated {
        ...ActivityLogChallengeCreated
      }
      ... on ActivityLogEntryOpportunityCreated {
        ...ActivityLogOpportunityCreated
      }
      ... on ActivityLogEntryUpdateSent {
        ...ActivityLogUpdateSent
      }
      ... on ActivityLogEntryCalendarEventCreated {
        ...ActivityLogCalendarEventCreated
      }
    }
  }
  ${RecentContributionsSpaceProfileFragmentDoc}
  ${RecentContributionsChildJourneyProfileFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
  ${ActivityLogCalendarEventCreatedFragmentDoc}
`;

/**
 * __useLatestContributionsGroupedQuery__
 *
 * To run a query within a React component, call `useLatestContributionsGroupedQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestContributionsGroupedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestContributionsGroupedQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useLatestContributionsGroupedQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.LatestContributionsGroupedQuery,
    SchemaTypes.LatestContributionsGroupedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.LatestContributionsGroupedQuery,
    SchemaTypes.LatestContributionsGroupedQueryVariables
  >(LatestContributionsGroupedDocument, options);
}

export function useLatestContributionsGroupedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.LatestContributionsGroupedQuery,
    SchemaTypes.LatestContributionsGroupedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.LatestContributionsGroupedQuery,
    SchemaTypes.LatestContributionsGroupedQueryVariables
  >(LatestContributionsGroupedDocument, options);
}

export type LatestContributionsGroupedQueryHookResult = ReturnType<typeof useLatestContributionsGroupedQuery>;
export type LatestContributionsGroupedLazyQueryHookResult = ReturnType<typeof useLatestContributionsGroupedLazyQuery>;
export type LatestContributionsGroupedQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestContributionsGroupedQuery,
  SchemaTypes.LatestContributionsGroupedQueryVariables
>;
export function refetchLatestContributionsGroupedQuery(
  variables?: SchemaTypes.LatestContributionsGroupedQueryVariables
) {
  return { query: LatestContributionsGroupedDocument, variables: variables };
}

export const LatestContributionsSpacesDocument = gql`
  query LatestContributionsSpaces {
    me {
      spaceMemberships {
        id
        profile {
          id
          displayName
        }
      }
    }
  }
`;

/**
 * __useLatestContributionsSpacesQuery__
 *
 * To run a query within a React component, call `useLatestContributionsSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestContributionsSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestContributionsSpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestContributionsSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.LatestContributionsSpacesQuery,
    SchemaTypes.LatestContributionsSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.LatestContributionsSpacesQuery,
    SchemaTypes.LatestContributionsSpacesQueryVariables
  >(LatestContributionsSpacesDocument, options);
}

export function useLatestContributionsSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.LatestContributionsSpacesQuery,
    SchemaTypes.LatestContributionsSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.LatestContributionsSpacesQuery,
    SchemaTypes.LatestContributionsSpacesQueryVariables
  >(LatestContributionsSpacesDocument, options);
}

export type LatestContributionsSpacesQueryHookResult = ReturnType<typeof useLatestContributionsSpacesQuery>;
export type LatestContributionsSpacesLazyQueryHookResult = ReturnType<typeof useLatestContributionsSpacesLazyQuery>;
export type LatestContributionsSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestContributionsSpacesQuery,
  SchemaTypes.LatestContributionsSpacesQueryVariables
>;
export function refetchLatestContributionsSpacesQuery(variables?: SchemaTypes.LatestContributionsSpacesQueryVariables) {
  return { query: LatestContributionsSpacesDocument, variables: variables };
}

export const MembershipSuggestionSpaceDocument = gql`
  query MembershipSuggestionSpace($id: UUID_NAMEID!) {
    space(ID: $id) {
      id
      nameID
      profile {
        id
        displayName
        tagline
        url
        avatar: visual(type: CARD) {
          ...VisualUri
        }
      }
      community {
        id
        myRoles
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useMembershipSuggestionSpaceQuery__
 *
 * To run a query within a React component, call `useMembershipSuggestionSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipSuggestionSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipSuggestionSpaceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMembershipSuggestionSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MembershipSuggestionSpaceQuery,
    SchemaTypes.MembershipSuggestionSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.MembershipSuggestionSpaceQuery,
    SchemaTypes.MembershipSuggestionSpaceQueryVariables
  >(MembershipSuggestionSpaceDocument, options);
}

export function useMembershipSuggestionSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MembershipSuggestionSpaceQuery,
    SchemaTypes.MembershipSuggestionSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.MembershipSuggestionSpaceQuery,
    SchemaTypes.MembershipSuggestionSpaceQueryVariables
  >(MembershipSuggestionSpaceDocument, options);
}

export type MembershipSuggestionSpaceQueryHookResult = ReturnType<typeof useMembershipSuggestionSpaceQuery>;
export type MembershipSuggestionSpaceLazyQueryHookResult = ReturnType<typeof useMembershipSuggestionSpaceLazyQuery>;
export type MembershipSuggestionSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.MembershipSuggestionSpaceQuery,
  SchemaTypes.MembershipSuggestionSpaceQueryVariables
>;
export function refetchMembershipSuggestionSpaceQuery(variables: SchemaTypes.MembershipSuggestionSpaceQueryVariables) {
  return { query: MembershipSuggestionSpaceDocument, variables: variables };
}

export const MyMembershipsDocument = gql`
  query MyMemberships {
    me {
      spaceMemberships {
        id
        account {
          id
          license {
            id
            visibility
          }
        }
        metrics {
          name
          value
        }
        context {
          id
          vision
        }
        profile {
          id
          url
          displayName
          tagline
          tagset {
            id
            tags
          }
          cardBanner: visual(type: CARD) {
            ...VisualUri
          }
        }
        challenges {
          id
          authorization {
            id
            myPrivileges
          }
          community {
            ...MyMembershipsChildJourneyCommunity
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${MyMembershipsChildJourneyCommunityFragmentDoc}
`;

/**
 * __useMyMembershipsQuery__
 *
 * To run a query within a React component, call `useMyMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>(
    MyMembershipsDocument,
    options
  );
}

export function useMyMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>(
    MyMembershipsDocument,
    options
  );
}

export type MyMembershipsQueryHookResult = ReturnType<typeof useMyMembershipsQuery>;
export type MyMembershipsLazyQueryHookResult = ReturnType<typeof useMyMembershipsLazyQuery>;
export type MyMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.MyMembershipsQuery,
  SchemaTypes.MyMembershipsQueryVariables
>;
export function refetchMyMembershipsQuery(variables?: SchemaTypes.MyMembershipsQueryVariables) {
  return { query: MyMembershipsDocument, variables: variables };
}

export const MyMembershipsChallengeDocument = gql`
  query MyMembershipsChallenge($challengeId: UUID!) {
    lookup {
      challenge(ID: $challengeId) {
        id
        profile {
          ...MyMembershipsChildJourneyProfile
        }
        opportunities {
          id
          community {
            ...MyMembershipsChildJourneyCommunity
          }
          profile {
            ...MyMembershipsChildJourneyProfile
          }
        }
      }
    }
  }
  ${MyMembershipsChildJourneyProfileFragmentDoc}
  ${MyMembershipsChildJourneyCommunityFragmentDoc}
`;

/**
 * __useMyMembershipsChallengeQuery__
 *
 * To run a query within a React component, call `useMyMembershipsChallengeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyMembershipsChallengeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyMembershipsChallengeQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useMyMembershipsChallengeQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MyMembershipsChallengeQuery,
    SchemaTypes.MyMembershipsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MyMembershipsChallengeQuery, SchemaTypes.MyMembershipsChallengeQueryVariables>(
    MyMembershipsChallengeDocument,
    options
  );
}

export function useMyMembershipsChallengeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MyMembershipsChallengeQuery,
    SchemaTypes.MyMembershipsChallengeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MyMembershipsChallengeQuery, SchemaTypes.MyMembershipsChallengeQueryVariables>(
    MyMembershipsChallengeDocument,
    options
  );
}

export type MyMembershipsChallengeQueryHookResult = ReturnType<typeof useMyMembershipsChallengeQuery>;
export type MyMembershipsChallengeLazyQueryHookResult = ReturnType<typeof useMyMembershipsChallengeLazyQuery>;
export type MyMembershipsChallengeQueryResult = Apollo.QueryResult<
  SchemaTypes.MyMembershipsChallengeQuery,
  SchemaTypes.MyMembershipsChallengeQueryVariables
>;
export function refetchMyMembershipsChallengeQuery(variables: SchemaTypes.MyMembershipsChallengeQueryVariables) {
  return { query: MyMembershipsChallengeDocument, variables: variables };
}

export const NewMembershipsDocument = gql`
  query NewMemberships {
    me {
      applications(states: ["new", "approved"]) {
        id
        communityID
        displayName
        state
        spaceID
        challengeID
        opportunityID
        createdDate
      }
      invitations(states: ["invited", "accepted"]) {
        id
        spaceID
        challengeID
        opportunityID
        welcomeMessage
        createdBy
        createdDate
        state
      }
    }
  }
`;

/**
 * __useNewMembershipsQuery__
 *
 * To run a query within a React component, call `useNewMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useNewMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.NewMembershipsQuery, SchemaTypes.NewMembershipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.NewMembershipsQuery, SchemaTypes.NewMembershipsQueryVariables>(
    NewMembershipsDocument,
    options
  );
}

export function useNewMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.NewMembershipsQuery, SchemaTypes.NewMembershipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.NewMembershipsQuery, SchemaTypes.NewMembershipsQueryVariables>(
    NewMembershipsDocument,
    options
  );
}

export type NewMembershipsQueryHookResult = ReturnType<typeof useNewMembershipsQuery>;
export type NewMembershipsLazyQueryHookResult = ReturnType<typeof useNewMembershipsLazyQuery>;
export type NewMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.NewMembershipsQuery,
  SchemaTypes.NewMembershipsQueryVariables
>;
export function refetchNewMembershipsQuery(variables?: SchemaTypes.NewMembershipsQueryVariables) {
  return { query: NewMembershipsDocument, variables: variables };
}

export const RecentForumMessagesDocument = gql`
  query recentForumMessages($limit: Float = 5) {
    platform {
      id
      communication {
        id
        discussionCategories
        authorization {
          id
          myPrivileges
          anonymousReadAccess
        }
        discussions(queryData: { orderBy: DISCUSSIONS_CREATEDATE_DESC, limit: $limit }) {
          ...DiscussionCard
        }
      }
    }
  }
  ${DiscussionCardFragmentDoc}
`;

/**
 * __useRecentForumMessagesQuery__
 *
 * To run a query within a React component, call `useRecentForumMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentForumMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentForumMessagesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRecentForumMessagesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.RecentForumMessagesQuery,
    SchemaTypes.RecentForumMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RecentForumMessagesQuery, SchemaTypes.RecentForumMessagesQueryVariables>(
    RecentForumMessagesDocument,
    options
  );
}

export function useRecentForumMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RecentForumMessagesQuery,
    SchemaTypes.RecentForumMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RecentForumMessagesQuery, SchemaTypes.RecentForumMessagesQueryVariables>(
    RecentForumMessagesDocument,
    options
  );
}

export type RecentForumMessagesQueryHookResult = ReturnType<typeof useRecentForumMessagesQuery>;
export type RecentForumMessagesLazyQueryHookResult = ReturnType<typeof useRecentForumMessagesLazyQuery>;
export type RecentForumMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.RecentForumMessagesQuery,
  SchemaTypes.RecentForumMessagesQueryVariables
>;
export function refetchRecentForumMessagesQuery(variables?: SchemaTypes.RecentForumMessagesQueryVariables) {
  return { query: RecentForumMessagesDocument, variables: variables };
}

export const RecentJourneyDocument = gql`
  query RecentJourney(
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $spaceId: UUID_NAMEID!
    $challengeId: UUID!
    $opportunityId: UUID!
  ) {
    space(ID: $spaceId) @include(if: $includeSpace) {
      id
      profile {
        ...RecentJourneyProfile
      }
    }
    lookup {
      challenge(ID: $challengeId) @include(if: $includeChallenge) {
        id
        profile {
          ...RecentJourneyProfile
        }
      }
      opportunity(ID: $opportunityId) @include(if: $includeOpportunity) {
        id
        profile {
          ...RecentJourneyProfile
        }
      }
    }
  }
  ${RecentJourneyProfileFragmentDoc}
`;

/**
 * __useRecentJourneyQuery__
 *
 * To run a query within a React component, call `useRecentJourneyQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentJourneyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentJourneyQuery({
 *   variables: {
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useRecentJourneyQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.RecentJourneyQuery, SchemaTypes.RecentJourneyQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RecentJourneyQuery, SchemaTypes.RecentJourneyQueryVariables>(
    RecentJourneyDocument,
    options
  );
}

export function useRecentJourneyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RecentJourneyQuery, SchemaTypes.RecentJourneyQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RecentJourneyQuery, SchemaTypes.RecentJourneyQueryVariables>(
    RecentJourneyDocument,
    options
  );
}

export type RecentJourneyQueryHookResult = ReturnType<typeof useRecentJourneyQuery>;
export type RecentJourneyLazyQueryHookResult = ReturnType<typeof useRecentJourneyLazyQuery>;
export type RecentJourneyQueryResult = Apollo.QueryResult<
  SchemaTypes.RecentJourneyQuery,
  SchemaTypes.RecentJourneyQueryVariables
>;
export function refetchRecentJourneyQuery(variables: SchemaTypes.RecentJourneyQueryVariables) {
  return { query: RecentJourneyDocument, variables: variables };
}

export const RecentJourneysDocument = gql`
  query RecentJourneys($limit: Float) {
    me {
      myJourneys(limit: $limit) {
        journey {
          id
          __typename
        }
      }
    }
  }
`;

/**
 * __useRecentJourneysQuery__
 *
 * To run a query within a React component, call `useRecentJourneysQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentJourneysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentJourneysQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRecentJourneysQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.RecentJourneysQuery, SchemaTypes.RecentJourneysQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RecentJourneysQuery, SchemaTypes.RecentJourneysQueryVariables>(
    RecentJourneysDocument,
    options
  );
}

export function useRecentJourneysLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RecentJourneysQuery, SchemaTypes.RecentJourneysQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RecentJourneysQuery, SchemaTypes.RecentJourneysQueryVariables>(
    RecentJourneysDocument,
    options
  );
}

export type RecentJourneysQueryHookResult = ReturnType<typeof useRecentJourneysQuery>;
export type RecentJourneysLazyQueryHookResult = ReturnType<typeof useRecentJourneysLazyQuery>;
export type RecentJourneysQueryResult = Apollo.QueryResult<
  SchemaTypes.RecentJourneysQuery,
  SchemaTypes.RecentJourneysQueryVariables
>;
export function refetchRecentJourneysQuery(variables?: SchemaTypes.RecentJourneysQueryVariables) {
  return { query: RecentJourneysDocument, variables: variables };
}

export const ChallengeExplorerPageDocument = gql`
  query ChallengeExplorerPage {
    me {
      spaceMemberships(visibilities: [ACTIVE, DEMO]) {
        id
      }
    }
  }
`;

/**
 * __useChallengeExplorerPageQuery__
 *
 * To run a query within a React component, call `useChallengeExplorerPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeExplorerPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeExplorerPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useChallengeExplorerPageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeExplorerPageQuery,
    SchemaTypes.ChallengeExplorerPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeExplorerPageQuery, SchemaTypes.ChallengeExplorerPageQueryVariables>(
    ChallengeExplorerPageDocument,
    options
  );
}

export function useChallengeExplorerPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeExplorerPageQuery,
    SchemaTypes.ChallengeExplorerPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeExplorerPageQuery, SchemaTypes.ChallengeExplorerPageQueryVariables>(
    ChallengeExplorerPageDocument,
    options
  );
}

export type ChallengeExplorerPageQueryHookResult = ReturnType<typeof useChallengeExplorerPageQuery>;
export type ChallengeExplorerPageLazyQueryHookResult = ReturnType<typeof useChallengeExplorerPageLazyQuery>;
export type ChallengeExplorerPageQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeExplorerPageQuery,
  SchemaTypes.ChallengeExplorerPageQueryVariables
>;
export function refetchChallengeExplorerPageQuery(variables?: SchemaTypes.ChallengeExplorerPageQueryVariables) {
  return { query: ChallengeExplorerPageDocument, variables: variables };
}

export const SpaceExplorerSearchDocument = gql`
  query SpaceExplorerSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      journeyResults {
        id
        type
        terms
        ... on SearchResultSpace {
          ...SpaceExplorerSearchSpace
        }
        ... on SearchResultChallenge {
          ...SpaceExplorerSearchChallenge
        }
      }
    }
  }
  ${SpaceExplorerSearchSpaceFragmentDoc}
  ${SpaceExplorerSearchChallengeFragmentDoc}
`;

/**
 * __useSpaceExplorerSearchQuery__
 *
 * To run a query within a React component, call `useSpaceExplorerSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceExplorerSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceExplorerSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useSpaceExplorerSearchQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceExplorerSearchQuery,
    SchemaTypes.SpaceExplorerSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceExplorerSearchQuery, SchemaTypes.SpaceExplorerSearchQueryVariables>(
    SpaceExplorerSearchDocument,
    options
  );
}

export function useSpaceExplorerSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceExplorerSearchQuery,
    SchemaTypes.SpaceExplorerSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceExplorerSearchQuery, SchemaTypes.SpaceExplorerSearchQueryVariables>(
    SpaceExplorerSearchDocument,
    options
  );
}

export type SpaceExplorerSearchQueryHookResult = ReturnType<typeof useSpaceExplorerSearchQuery>;
export type SpaceExplorerSearchLazyQueryHookResult = ReturnType<typeof useSpaceExplorerSearchLazyQuery>;
export type SpaceExplorerSearchQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerSearchQuery,
  SchemaTypes.SpaceExplorerSearchQueryVariables
>;
export function refetchSpaceExplorerSearchQuery(variables: SchemaTypes.SpaceExplorerSearchQueryVariables) {
  return { query: SpaceExplorerSearchDocument, variables: variables };
}

export const SpaceExplorerMemberSpacesDocument = gql`
  query SpaceExplorerMemberSpaces($spaceIDs: [UUID!]) {
    spaces(IDs: $spaceIDs) {
      ...SpaceExplorerSpaceWithChallenges
    }
  }
  ${SpaceExplorerSpaceWithChallengesFragmentDoc}
`;

/**
 * __useSpaceExplorerMemberSpacesQuery__
 *
 * To run a query within a React component, call `useSpaceExplorerMemberSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceExplorerMemberSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceExplorerMemberSpacesQuery({
 *   variables: {
 *      spaceIDs: // value for 'spaceIDs'
 *   },
 * });
 */
export function useSpaceExplorerMemberSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.SpaceExplorerMemberSpacesQuery,
    SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceExplorerMemberSpacesQuery,
    SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
  >(SpaceExplorerMemberSpacesDocument, options);
}

export function useSpaceExplorerMemberSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceExplorerMemberSpacesQuery,
    SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceExplorerMemberSpacesQuery,
    SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
  >(SpaceExplorerMemberSpacesDocument, options);
}

export type SpaceExplorerMemberSpacesQueryHookResult = ReturnType<typeof useSpaceExplorerMemberSpacesQuery>;
export type SpaceExplorerMemberSpacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerMemberSpacesLazyQuery>;
export type SpaceExplorerMemberSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerMemberSpacesQuery,
  SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
>;
export function refetchSpaceExplorerMemberSpacesQuery(variables?: SchemaTypes.SpaceExplorerMemberSpacesQueryVariables) {
  return { query: SpaceExplorerMemberSpacesDocument, variables: variables };
}

export const SpaceExplorerAllSpacesDocument = gql`
  query SpaceExplorerAllSpaces($first: Int!, $after: UUID, $visibilities: [SpaceVisibility!] = [ACTIVE]) {
    spacesPaginated(first: $first, after: $after, filter: { visibilities: $visibilities }) {
      spaces {
        ...SpaceExplorerSpaceWithChallenges
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${SpaceExplorerSpaceWithChallengesFragmentDoc}
  ${PageInfoFragmentDoc}
`;

/**
 * __useSpaceExplorerAllSpacesQuery__
 *
 * To run a query within a React component, call `useSpaceExplorerAllSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceExplorerAllSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceExplorerAllSpacesQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      visibilities: // value for 'visibilities'
 *   },
 * });
 */
export function useSpaceExplorerAllSpacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceExplorerAllSpacesQuery,
    SchemaTypes.SpaceExplorerAllSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceExplorerAllSpacesQuery, SchemaTypes.SpaceExplorerAllSpacesQueryVariables>(
    SpaceExplorerAllSpacesDocument,
    options
  );
}

export function useSpaceExplorerAllSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceExplorerAllSpacesQuery,
    SchemaTypes.SpaceExplorerAllSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceExplorerAllSpacesQuery, SchemaTypes.SpaceExplorerAllSpacesQueryVariables>(
    SpaceExplorerAllSpacesDocument,
    options
  );
}

export type SpaceExplorerAllSpacesQueryHookResult = ReturnType<typeof useSpaceExplorerAllSpacesQuery>;
export type SpaceExplorerAllSpacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerAllSpacesLazyQuery>;
export type SpaceExplorerAllSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerAllSpacesQuery,
  SchemaTypes.SpaceExplorerAllSpacesQueryVariables
>;
export function refetchSpaceExplorerAllSpacesQuery(variables: SchemaTypes.SpaceExplorerAllSpacesQueryVariables) {
  return { query: SpaceExplorerAllSpacesDocument, variables: variables };
}
