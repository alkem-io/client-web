import * as SchemaTypes from './graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const TagsetDetailsFragmentDoc = gql`
  fragment TagsetDetails on Tagset {
    id
    name
    tags
    allowedValues
    type
  }
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
    url
  }
  ${TagsetDetailsFragmentDoc}
`;
export const VisualModelFragmentDoc = gql`
  fragment VisualModel on Visual {
    id
    uri
    name
    alternativeText
  }
`;
export const InnovationPackProviderProfileWithAvatarFragmentDoc = gql`
  fragment InnovationPackProviderProfileWithAvatar on Contributor {
    id
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      url
    }
    ... on User {
      isContactable
    }
  }
  ${VisualModelFragmentDoc}
`;
export const InnovationPackCardFragmentDoc = gql`
  fragment InnovationPackCard on InnovationPack {
    id
    profile {
      id
      displayName
      description
      tagset {
        ...TagsetDetails
      }
      url
    }
    templatesSet {
      id
      calloutTemplatesCount
      communityGuidelinesTemplatesCount
      spaceTemplatesCount
      postTemplatesCount
      whiteboardTemplatesCount
    }
    provider {
      ...InnovationPackProviderProfileWithAvatar
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
`;
export const AdminCommunityCandidateMemberFragmentDoc = gql`
  fragment AdminCommunityCandidateMember on Contributor {
    id
    profile {
      id
      displayName
      url
    }
  }
`;
export const AdminCommunityApplicationFragmentDoc = gql`
  fragment AdminCommunityApplication on Application {
    id
    createdDate
    updatedDate
    state
    nextEvents
    contributor {
      ...AdminCommunityCandidateMember
      ... on User {
        email
      }
    }
  }
  ${AdminCommunityCandidateMemberFragmentDoc}
`;
export const AdminCommunityInvitationFragmentDoc = gql`
  fragment AdminCommunityInvitation on Invitation {
    id
    createdDate
    updatedDate
    state
    nextEvents
    contributorType
    contributor {
      ...AdminCommunityCandidateMember
      ... on User {
        email
      }
    }
  }
  ${AdminCommunityCandidateMemberFragmentDoc}
`;
export const AdminPlatformInvitationCommunityFragmentDoc = gql`
  fragment AdminPlatformInvitationCommunity on PlatformInvitation {
    id
    createdDate
    email
  }
`;
export const AvailableUserForRoleSetFragmentDoc = gql`
  fragment AvailableUserForRoleSet on User {
    id
    profile {
      id
      displayName
    }
    email
  }
`;
export const AvailableUsersForRoleSetPaginatedFragmentDoc = gql`
  fragment AvailableUsersForRoleSetPaginated on PaginatedUsers {
    users {
      ...AvailableUserForRoleSet
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
  ${AvailableUserForRoleSetFragmentDoc}
`;
export const MyMembershipsRoleSetFragmentDoc = gql`
  fragment MyMembershipsRoleSet on RoleSet {
    id
    myMembershipStatus
    myRoles
  }
`;
export const RoleDefinitionPolicyFragmentDoc = gql`
  fragment RoleDefinitionPolicy on Role {
    id
    name
    organizationPolicy {
      minimum
      maximum
    }
    userPolicy {
      minimum
      maximum
    }
  }
`;
export const RoleSetMemberUserFragmentDoc = gql`
  fragment RoleSetMemberUser on User {
    id
    isContactable
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      location {
        id
        city
        country
      }
      tagsets {
        ...TagsetDetails
      }
      url
    }
    email
    firstName
    lastName
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const RoleSetMemberOrganizationFragmentDoc = gql`
  fragment RoleSetMemberOrganization on Organization {
    id
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      description
      tagsets {
        ...TagsetDetails
      }
      location {
        id
        country
        city
      }
      url
    }
    verification {
      id
      status
    }
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const RoleSetMemberVirtualContributorFragmentDoc = gql`
  fragment RoleSetMemberVirtualContributor on VirtualContributor {
    id
    searchVisibility
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      tagsets {
        ...TagsetDetails
      }
      location {
        id
        city
        country
      }
      url
    }
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const AccountItemProfileFragmentDoc = gql`
  fragment AccountItemProfile on Profile {
    id
    displayName
    description
    avatar: visual(type: AVATAR) {
      ...VisualModel
    }
    url
  }
  ${VisualModelFragmentDoc}
`;
export const InnovationFlowCollaborationFragmentDoc = gql`
  fragment InnovationFlowCollaboration on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    calloutsSet {
      id
      callouts {
        id
        activity
        sortOrder
        classification {
          id
          flowState: tagset(tagsetName: FLOW_STATE) {
            ...TagsetDetails
          }
        }
        framing {
          id
          profile {
            id
            displayName
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
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
      ...VisualModel
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const InnovationFlowStatesFragmentDoc = gql`
  fragment InnovationFlowStates on InnovationFlow {
    id
    states {
      id
      displayName
      description
      sortOrder
      settings {
        allowNewCallouts
      }
    }
  }
`;
export const InnovationFlowDetailsFragmentDoc = gql`
  fragment InnovationFlowDetails on InnovationFlow {
    id
    profile {
      ...InnovationFlowProfile
    }
    ...InnovationFlowStates
    currentState {
      id
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${InnovationFlowProfileFragmentDoc}
  ${InnovationFlowStatesFragmentDoc}
`;
export const ActivityLogMemberJoinedFragmentDoc = gql`
  fragment ActivityLogMemberJoined on ActivityLogEntryMemberJoined {
    contributor {
      id
      profile {
        id
        url
        displayName
        visual(type: AVATAR) {
          id
          uri
        }
      }
      ... on User {
        firstName
        lastName
        isContactable
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
export const ActivityLogSubspaceCreatedFragmentDoc = gql`
  fragment ActivityLogSubspaceCreated on ActivityLogEntrySubspaceCreated {
    subspace {
      id
      about {
        id
        profile {
          ...ActivitySubjectProfile
        }
      }
    }
  }
  ${ActivitySubjectProfileFragmentDoc}
`;
export const ActivityLogUpdateSentFragmentDoc = gql`
  fragment ActivityLogUpdateSent on ActivityLogEntryUpdateSent {
    message
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
    ... on ActivityLogEntrySubspaceCreated {
      ...ActivityLogSubspaceCreated
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
  ${ActivityLogSubspaceCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
  ${ActivityLogCalendarEventCreatedFragmentDoc}
`;
export const CalloutContributionsWhiteboardCardFragmentDoc = gql`
  fragment CalloutContributionsWhiteboardCard on Whiteboard {
    id
    profile {
      id
      url
      displayName
      visual(type: CARD) {
        ...VisualModel
      }
    }
    createdDate
    createdBy {
      id
      profile {
        id
        displayName
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const CalloutContributionsPostCardFragmentDoc = gql`
  fragment CalloutContributionsPostCard on Post {
    id
    profile {
      id
      url
      displayName
      tagset {
        ...TagsetDetails
      }
      description
    }
    createdDate
    createdBy {
      id
      profile {
        id
        displayName
      }
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
  ${TagsetDetailsFragmentDoc}
`;
export const CalloutFragmentDoc = gql`
  fragment Callout on Callout {
    id
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
      }
      type
    }
    settings {
      visibility
    }
  }
`;
export const ClassificationDetailsFragmentDoc = gql`
  fragment ClassificationDetails on Callout {
    classification {
      id
      flowState: tagset(tagsetName: FLOW_STATE) {
        ...TagsetDetails
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const ReferenceDetailsFragmentDoc = gql`
  fragment ReferenceDetails on Reference {
    id
    name
    uri
    description
  }
`;
export const VisualModelFullFragmentDoc = gql`
  fragment VisualModelFull on Visual {
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
export const WhiteboardProfileFragmentDoc = gql`
  fragment WhiteboardProfile on Profile {
    id
    url
    displayName
    description
    visual(type: CARD) {
      ...VisualModelFull
    }
    preview: visual(type: BANNER) {
      ...VisualModelFull
    }
    tagset {
      ...TagsetDetails
    }
    storageBucket {
      id
    }
  }
  ${VisualModelFullFragmentDoc}
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
          ...VisualModel
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const MemoProfileFragmentDoc = gql`
  fragment MemoProfile on Profile {
    id
    displayName
    preview: visual(type: BANNER_WIDE) {
      ...VisualModelFull
    }
    storageBucket {
      id
    }
    url
  }
  ${VisualModelFullFragmentDoc}
`;
export const MemoDetailsFragmentDoc = gql`
  fragment MemoDetails on Memo {
    id
    createdDate
    profile {
      ...MemoProfile
    }
    markdown
    authorization {
      id
      myPrivileges
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
          ...VisualModel
        }
      }
    }
  }
  ${MemoProfileFragmentDoc}
  ${VisualModelFragmentDoc}
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
export const ContributorDetailsFragmentDoc = gql`
  fragment ContributorDetails on Contributor {
    id
    profile {
      id
      displayName
      url
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      description
      tagsets {
        ...TagsetDetails
      }
      location {
        id
        country
        city
      }
    }
    ... on User {
      isContactable
    }
  }
  ${VisualModelFragmentDoc}
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
      ...ContributorDetails
    }
  }
  ${ReactionDetailsFragmentDoc}
  ${ContributorDetailsFragmentDoc}
`;
export const VcInteractionsDetailsFragmentDoc = gql`
  fragment VcInteractionsDetails on VcInteraction {
    id
    threadID
    virtualContributorID
  }
`;
export const CommentsWithMessagesFragmentDoc = gql`
  fragment CommentsWithMessages on Room {
    id
    messagesCount
    authorization {
      id
      myPrivileges
    }
    messages {
      ...MessageDetails
    }
    vcInteractions {
      ...VcInteractionsDetails
    }
  }
  ${MessageDetailsFragmentDoc}
  ${VcInteractionsDetailsFragmentDoc}
`;
export const CalloutSettingsFullFragmentDoc = gql`
  fragment CalloutSettingsFull on CalloutSettings {
    contribution {
      enabled
      allowedTypes
      canAddContributions
      commentsEnabled
    }
    framing {
      commentsEnabled
    }
    visibility
  }
`;
export const CalloutDetailsFragmentDoc = gql`
  fragment CalloutDetails on Callout {
    id
    framing {
      id
      profile {
        id
        displayName
        description
        tagset {
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
      type
      whiteboard {
        ...WhiteboardDetails
      }
      memo {
        ...MemoDetails
      }
      link {
        ...LinkDetails
      }
    }
    contributionDefaults {
      id
      defaultDisplayName
      postDescription
      whiteboardContent
    }
    sortOrder
    activity
    contributions {
      id
      sortOrder
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
    settings {
      ...CalloutSettingsFull
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${MemoDetailsFragmentDoc}
  ${LinkDetailsFragmentDoc}
  ${LinkDetailsWithAuthorizationFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
  ${CalloutSettingsFullFragmentDoc}
`;
export const PostSettingsFragmentDoc = gql`
  fragment PostSettings on Post {
    id
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
        ...VisualModelFull
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFullFragmentDoc}
`;
export const PostSettingsCalloutFragmentDoc = gql`
  fragment PostSettingsCallout on Callout {
    id
    contributions {
      id
      post {
        id
      }
    }
  }
`;
export const WhiteboardContentFragmentDoc = gql`
  fragment WhiteboardContent on Whiteboard {
    id
    content
  }
`;
export const CollaborationWithWhiteboardDetailsFragmentDoc = gql`
  fragment CollaborationWithWhiteboardDetails on Collaboration {
    id
    calloutsSet {
      id
      callouts {
        id
        authorization {
          id
          myPrivileges
        }
        contributions {
          whiteboard {
            ...WhiteboardDetails
          }
        }
        framing {
          id
          type
          whiteboard {
            ...WhiteboardDetails
          }
        }
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
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
        ...VisualModel
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
    }
  }
  ${VisualModelFragmentDoc}
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
    authorization {
      id
      myPrivileges
    }
  }
`;
export const BasicOrganizationDetailsFragmentDoc = gql`
  fragment BasicOrganizationDetails on Organization {
    id
    profile {
      id
      url
      displayName
      visual(type: AVATAR) {
        ...VisualModel
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const OrganizationContributorFragmentDoc = gql`
  fragment OrganizationContributor on Organization {
    id
    metrics {
      id
      name
      value
    }
    orgProfile: profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualModel
      }
      description
      url
    }
    verification {
      id
      status
    }
  }
  ${VisualModelFragmentDoc}
`;
export const PageInfoFragmentDoc = gql`
  fragment PageInfo on PageInfo {
    startCursor
    endCursor
    hasNextPage
  }
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
    isContactable
    userProfile: profile {
      id
      displayName
      location {
        city
        country
      }
      visual(type: AVATAR) {
        ...VisualModel
      }
      tagsets {
        ...TagsetDetails
      }
      url
    }
  }
  ${VisualModelFragmentDoc}
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
export const AccountResourceProfileFragmentDoc = gql`
  fragment AccountResourceProfile on Profile {
    id
    displayName
    url
    avatar: visual(type: AVATAR) {
      ...VisualModel
    }
  }
  ${VisualModelFragmentDoc}
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
    contactEmail
    domain
    authorization {
      id
      myPrivileges
    }
    roleSet {
      id
    }
    verification {
      id
      status
    }
    website
    profile {
      id
      url
      displayName
      description
      tagline
      avatar: visual(type: AVATAR) {
        ...VisualModel
        alternativeText
      }
      tagsets {
        ...TagsetDetails
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
    metrics {
      id
      name
      value
    }
  }
  ${VisualModelFragmentDoc}
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
      url
      displayName
      visuals {
        ...VisualModelFull
      }
      description
      tagline
      location {
        id
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
  ${VisualModelFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
    roleSet {
      applications {
        id
      }
      invitations {
        ...PendingMembershipInvitation
      }
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
        ...VisualModel
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const UserDetailsFragmentDoc = gql`
  fragment UserDetails on User {
    id
    firstName
    lastName
    email
    phone
    profile {
      id
      displayName
      tagline
      location {
        id
        country
        city
      }
      description
      avatar: visual(type: AVATAR) {
        ...VisualModelFull
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
      url
    }
    isContactable
  }
  ${VisualModelFullFragmentDoc}
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
export const UserSettingsFragmentFragmentDoc = gql`
  fragment userSettingsFragment on UserSettings {
    id
    communication {
      allowOtherUsersToSendMessages
    }
    privacy {
      contributionRolesPubliclyVisible
    }
    notification {
      platform {
        admin {
          userProfileRemoved {
            email
            inApp
          }
          userProfileCreated {
            email
            inApp
          }
          spaceCreated {
            email
            inApp
          }
          userGlobalRoleChanged {
            email
            inApp
          }
        }
        forumDiscussionComment {
          email
          inApp
        }
        forumDiscussionCreated {
          email
          inApp
        }
      }
      organization {
        adminMentioned {
          email
          inApp
        }
        adminMessageReceived {
          email
          inApp
        }
      }
      space {
        admin {
          communityApplicationReceived {
            email
            inApp
          }
          collaborationCalloutContributionCreated {
            email
            inApp
          }
          communityNewMember {
            email
            inApp
          }
          communicationMessageReceived {
            email
            inApp
          }
        }
        collaborationCalloutContributionCreated {
          email
          inApp
        }
        communicationUpdates {
          email
          inApp
        }
        collaborationCalloutPublished {
          email
          inApp
        }
        collaborationCalloutComment {
          email
          inApp
        }
        collaborationCalloutPostContributionComment {
          email
          inApp
        }
      }
      user {
        membership {
          spaceCommunityInvitationReceived {
            email
            inApp
          }
          spaceCommunityJoined {
            email
            inApp
          }
        }
        mentioned {
          email
          inApp
        }
        commentReply {
          email
          inApp
        }
        messageReceived {
          email
          inApp
        }
      }
      virtualContributor {
        adminSpaceCommunityInvitation {
          email
          inApp
        }
      }
    }
  }
`;
export const SpaceAboutMinimalUrlFragmentDoc = gql`
  fragment SpaceAboutMinimalUrl on SpaceAbout {
    id
    profile {
      id
      displayName
      tagline
      url
    }
  }
`;
export const InvitationDataFragmentDoc = gql`
  fragment InvitationData on CommunityInvitationResult {
    id
    spacePendingMembershipInfo {
      id
      level
      about {
        ...SpaceAboutMinimalUrl
      }
    }
    invitation {
      id
      welcomeMessage
      createdBy {
        id
      }
      state
      createdDate
      contributor {
        id
      }
      contributorType
    }
  }
  ${SpaceAboutMinimalUrlFragmentDoc}
`;
export const EntitlementDetailsFragmentDoc = gql`
  fragment EntitlementDetails on LicenseEntitlement {
    id
    type
    limit
    usage
    isAvailable
    dataType
    enabled
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
      ...VisualModelFull
    }
    url
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFullFragmentDoc}
`;
export const InnovationHubSpaceFragmentDoc = gql`
  fragment InnovationHubSpace on Space {
    id
    visibility
    about {
      ...SpaceAboutMinimalUrl
      provider {
        id
        profile {
          id
          displayName
        }
      }
    }
  }
  ${SpaceAboutMinimalUrlFragmentDoc}
`;
export const InnovationHubSettingsFragmentDoc = gql`
  fragment InnovationHubSettings on InnovationHub {
    id
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
      documentation
    }
    featureFlags {
      enabled
      name
    }
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
    geo {
      enabled
      endpoint
    }
  }
`;
export const SpaceAboutCardAvatarFragmentDoc = gql`
  fragment SpaceAboutCardAvatar on SpaceAbout {
    id
    profile {
      id
      displayName
      url
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceAboutMinimalFragmentDoc = gql`
  fragment SpaceAboutMinimal on SpaceAbout {
    id
    profile {
      id
      displayName
      tagline
    }
  }
`;
export const ProfileVisualsFragmentDoc = gql`
  fragment ProfileVisuals on Profile {
    id
    banner: visual(type: BANNER) {
      ...VisualModel
    }
    cardBanner: visual(type: CARD) {
      ...VisualModel
    }
    avatar: visual(type: AVATAR) {
      ...VisualModel
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceAboutCardBannerFragmentDoc = gql`
  fragment SpaceAboutCardBanner on SpaceAbout {
    id
    profile {
      id
      displayName
      url
      tagline
      cardBanner: visual(type: CARD) {
        ...VisualModel
      }
      tagset {
        ...TagsetDetails
      }
    }
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const SpaceCardFragmentDoc = gql`
  fragment SpaceCard on Space {
    id
    about {
      ...SpaceAboutCardBanner
      why
      isContentPublic
      metrics {
        name
        value
      }
      membership {
        myMembershipStatus
      }
    }
    visibility
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const BreadcrumbsSpaceL0FragmentDoc = gql`
  fragment BreadcrumbsSpaceL0 on Space {
    id
    level
    about {
      id
      profile {
        id
        url
        displayName
        avatar: visual(type: BANNER) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const BreadcrumbsSubspaceFragmentDoc = gql`
  fragment BreadcrumbsSubspace on Space {
    id
    level
    about {
      id
      profile {
        id
        url
        displayName
        avatar: visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SubspaceCardFragmentDoc = gql`
  fragment SubspaceCard on Space {
    id
    level
    about {
      ...SpaceAboutCardBanner
      metrics {
        id
        name
        value
      }
      membership {
        myMembershipStatus
        myPrivileges
      }
      isContentPublic
      why
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const SubspacesOnSpaceFragmentDoc = gql`
  fragment SubspacesOnSpace on Space {
    id
    subspaces {
      ...SubspaceCard
    }
  }
  ${SubspaceCardFragmentDoc}
`;
export const SpaceAboutDetailsFragmentDoc = gql`
  fragment SpaceAboutDetails on SpaceAbout {
    id
    who
    why
    authorization {
      id
      myPrivileges
    }
    membership {
      roleSetID
      communityID
      myMembershipStatus
      leadOrganizations {
        id
        profile {
          id
          url
          displayName
          avatar: visual(type: AVATAR) {
            ...VisualModel
          }
          location {
            id
            city
            country
          }
        }
      }
      leadUsers {
        id
        profile {
          id
          url
          displayName
          avatar: visual(type: AVATAR) {
            ...VisualModel
          }
          location {
            id
            city
            country
          }
        }
        isContactable
      }
    }
    isContentPublic
    provider {
      id
      profile {
        id
        url
        displayName
        avatar: visual(type: AVATAR) {
          ...VisualModel
        }
        location {
          id
          city
          country
        }
        type
      }
      ... on User {
        isContactable
      }
    }
    profile {
      id
      url
      displayName
      tagline
      description
      tagset {
        ...TagsetDetails
      }
      avatar: visual(type: AVATAR) {
        ...VisualModelFull
      }
      cardBanner: visual(type: CARD) {
        ...VisualModelFull
      }
      banner: visual(type: BANNER) {
        ...VisualModelFull
      }
      references {
        ...ReferenceDetails
      }
      location {
        id
        city
        country
      }
    }
    guidelines {
      id
    }
    metrics {
      id
      name
      value
    }
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFullFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
`;
export const SpaceInfoFragmentDoc = gql`
  fragment SpaceInfo on Space {
    about {
      ...SpaceAboutDetails
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
`;
export const SubspaceVisualsFragmentDoc = gql`
  fragment SubspaceVisuals on Profile {
    avatar: visual(type: AVATAR) {
      ...VisualModel
    }
    cardBanner: visual(type: CARD) {
      ...VisualModel
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceAboutLightFragmentDoc = gql`
  fragment SpaceAboutLight on SpaceAbout {
    id
    profile {
      id
      displayName
      url
      tagline
      description
      tagset {
        id
        tags
      }
      ...SubspaceVisuals
    }
    isContentPublic
    membership {
      myMembershipStatus
      myPrivileges
      communityID
      roleSetID
    }
    guidelines {
      id
    }
  }
  ${SubspaceVisualsFragmentDoc}
`;
export const SubspacePageSpaceFragmentDoc = gql`
  fragment SubspacePageSpace on Space {
    id
    level
    authorization {
      id
      myPrivileges
    }
    about {
      ...SpaceAboutLight
      why
      metrics {
        id
        name
        value
      }
      membership {
        roleSetID
        communityID
      }
    }
    collaboration {
      id
      calloutsSet {
        id
      }
    }
    templatesManager {
      id
      templatesSet {
        id
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
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
    settings {
      visibility
    }
    activity
  }
`;
export const DashboardTopCalloutsFragmentDoc = gql`
  fragment DashboardTopCallouts on Collaboration {
    calloutsSet {
      id
      callouts(sortByActivity: true) {
        ...DashboardTopCallout
      }
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
export const SpacePageFragmentDoc = gql`
  fragment SpacePage on Space {
    id
    level
    nameID
    about {
      ...SpaceAboutDetails
      membership {
        communityID
        roleSetID
      }
      profile {
        location {
          ...fullLocation
        }
      }
      provider {
        ...ContributorDetails
      }
      metrics {
        id
        name
        value
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
        states {
          displayName
        }
        currentState {
          displayName
        }
      }
      ...DashboardTopCallouts
      ...DashboardTimelineAuthorization
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
  ${FullLocationFragmentDoc}
  ${ContributorDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${DashboardTimelineAuthorizationFragmentDoc}
`;
export const VirtualContributorWithModelCardFragmentDoc = gql`
  fragment VirtualContributorWithModelCard on VirtualContributor {
    bodyOfKnowledgeID
    bodyOfKnowledgeType
    bodyOfKnowledgeDescription
    aiPersona {
      id
      engine
    }
    modelCard {
      spaceUsage {
        modelCardEntry
        flags {
          name
          enabled
        }
      }
      aiEngine {
        isExternal
        hostingLocation
        isUsingOpenWeightsModel
        isInteractionDataUsedForTraining
        canAccessWebWhenAnswering
        areAnswersRestrictedToBodyOfKnowledge
        additionalTechnicalDetails
      }
      monitoring {
        isUsageMonitoredByAlkemio
      }
    }
  }
`;
export const VirtualContributorFullFragmentDoc = gql`
  fragment VirtualContributorFull on VirtualContributor {
    id
    profile {
      id
      displayName
      description
      avatar: visual(type: AVATAR) {
        ...VisualModel
      }
      tagsets {
        ...TagsetDetails
      }
      location {
        id
        city
        country
      }
      url
      references {
        id
        name
        uri
        description
      }
    }
    ...VirtualContributorWithModelCard
  }
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VirtualContributorWithModelCardFragmentDoc}
`;
export const AvailableVirtualContributorsForRoleSetPaginatedFragmentDoc = gql`
  fragment AvailableVirtualContributorsForRoleSetPaginated on PaginatedVirtualContributor {
    virtualContributors {
      ...VirtualContributorFull
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
  ${VirtualContributorFullFragmentDoc}
`;
export const SpaceSettingsFragmentDoc = gql`
  fragment SpaceSettings on SpaceSettings {
    privacy {
      mode
      allowPlatformSupportAsAdmin
    }
    membership {
      policy
      trustedOrganizations
      allowSubspaceAdminsToInviteMembers
    }
    collaboration {
      allowMembersToCreateCallouts
      allowMembersToCreateSubspaces
      inheritMembershipRights
      allowEventsFromSubspaces
      allowMembersToVideoCall
    }
  }
`;
export const StorageAggregatorParentFragmentDoc = gql`
  fragment StorageAggregatorParent on StorageAggregatorParent {
    id
    level
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
      profile {
        id
        displayName
        url
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
    calloutsSet {
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
  }
  ${ProfileStorageConfigFragmentDoc}
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
export const MemoTemplateDetailsFragmentDoc = gql`
  fragment MemoTemplateDetails on Memo {
    id
    markdown
    profile {
      id
      displayName
    }
  }
`;
export const CalloutTemplateContentFragmentDoc = gql`
  fragment CalloutTemplateContent on Callout {
    id
    framing {
      id
      profile {
        id
        displayName
        description
        tagsets {
          ...TagsetDetails
        }
        defaultTagset: tagset {
          ...TagsetDetails
        }
        references {
          ...ReferenceDetails
        }
        storageBucket {
          id
        }
      }
      type
      whiteboard {
        ...WhiteboardDetails
        content
      }
      link {
        ...LinkDetails
      }
      memo {
        ...MemoTemplateDetails
      }
    }
    settings {
      ...CalloutSettingsFull
    }
    contributionDefaults {
      id
      defaultDisplayName
      postDescription
      whiteboardContent
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${LinkDetailsFragmentDoc}
  ${MemoTemplateDetailsFragmentDoc}
  ${CalloutSettingsFullFragmentDoc}
`;
export const CommunityGuidelinesTemplateContentFragmentDoc = gql`
  fragment CommunityGuidelinesTemplateContent on CommunityGuidelines {
    id
    profile {
      id
      displayName
      description
      references {
        ...ReferenceDetails
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
  ${ReferenceDetailsFragmentDoc}
`;
export const SpaceTemplateContent_CollaborationFragmentDoc = gql`
  fragment SpaceTemplateContent_Collaboration on Collaboration {
    id
    innovationFlow {
      ...InnovationFlowStates
    }
    calloutsSet {
      id
      callouts {
        id
        classification {
          id
          flowState: tagset(tagsetName: FLOW_STATE) {
            ...TagsetDetails
          }
        }
        framing {
          id
          profile {
            id
            displayName
            description
          }
          type
          whiteboard {
            id
            profile {
              preview: visual(type: BANNER) {
                ...VisualModel
              }
            }
          }
        }
        sortOrder
      }
    }
  }
  ${InnovationFlowStatesFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const SpaceTemplateContent_AboutFragmentDoc = gql`
  fragment SpaceTemplateContent_About on SpaceAbout {
    id
    profile {
      id
      displayName
      description
      tagline
      tagsets {
        ...TagsetDetails
      }
      visuals {
        ...VisualModel
      }
      url
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const SpaceTemplateContent_SettingsFragmentDoc = gql`
  fragment SpaceTemplateContent_Settings on SpaceSettings {
    privacy {
      mode
      allowPlatformSupportAsAdmin
    }
    membership {
      policy
      allowSubspaceAdminsToInviteMembers
      trustedOrganizations
    }
    collaboration {
      allowMembersToCreateCallouts
      allowMembersToCreateSubspaces
      inheritMembershipRights
      allowEventsFromSubspaces
      allowMembersToVideoCall
    }
  }
`;
export const SpaceAboutTileFragmentDoc = gql`
  fragment SpaceAboutTile on SpaceAbout {
    id
    profile {
      id
      displayName
      tagline
      url
      ...SubspaceVisuals
    }
    isContentPublic
  }
  ${SubspaceVisualsFragmentDoc}
`;
export const SpaceTemplateContent_SubspacesFragmentDoc = gql`
  fragment SpaceTemplateContent_Subspaces on SpaceAbout {
    ...SpaceAboutTile
  }
  ${SpaceAboutTileFragmentDoc}
`;
export const SpaceTemplateContentFragmentDoc = gql`
  fragment SpaceTemplateContent on TemplateContentSpace {
    id
    collaboration {
      ...SpaceTemplateContent_Collaboration
    }
    about {
      ...SpaceTemplateContent_About
    }
    settings {
      ...SpaceTemplateContent_Settings
    }
    subspaces {
      id
      about {
        ...SpaceTemplateContent_Subspaces
      }
    }
  }
  ${SpaceTemplateContent_CollaborationFragmentDoc}
  ${SpaceTemplateContent_AboutFragmentDoc}
  ${SpaceTemplateContent_SettingsFragmentDoc}
  ${SpaceTemplateContent_SubspacesFragmentDoc}
`;
export const WhiteboardTemplateContentFragmentDoc = gql`
  fragment WhiteboardTemplateContent on Whiteboard {
    id
    profile {
      id
      displayName
      preview: visual(type: BANNER) {
        name
        uri
      }
    }
    content
  }
`;
export const TemplateProfileInfoFragmentDoc = gql`
  fragment TemplateProfileInfo on Template {
    id
    profile {
      id
      displayName
      description
      defaultTagset: tagset {
        ...TagsetDetails
      }
      visual(type: CARD) {
        ...VisualModel
      }
      url
    }
    type
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const CalloutTemplateFragmentDoc = gql`
  fragment CalloutTemplate on Template {
    ...TemplateProfileInfo
    callout {
      id
      settings {
        contribution {
          enabled
          allowedTypes
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
`;
export const PostTemplateFragmentDoc = gql`
  fragment PostTemplate on Template {
    ...TemplateProfileInfo
    postDefaultDescription
  }
  ${TemplateProfileInfoFragmentDoc}
`;
export const WhiteboardTemplateFragmentDoc = gql`
  fragment WhiteboardTemplate on Template {
    ...TemplateProfileInfo
    whiteboard {
      id
    }
  }
  ${TemplateProfileInfoFragmentDoc}
`;
export const CommunityGuidelinesTemplateFragmentDoc = gql`
  fragment CommunityGuidelinesTemplate on Template {
    ...TemplateProfileInfo
    communityGuidelines {
      id
      profile {
        id
        displayName
        description
        references {
          ...ReferenceDetails
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
`;
export const SpaceTemplateFragmentDoc = gql`
  fragment SpaceTemplate on Template {
    ...TemplateProfileInfo
    contentSpace {
      id
      about {
        id
        profile {
          id
          visual(type: CARD) {
            ...VisualModel
          }
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const TemplatesSetTemplatesFragmentDoc = gql`
  fragment TemplatesSetTemplates on TemplatesSet {
    calloutTemplates {
      ...CalloutTemplate
    }
    postTemplates {
      ...PostTemplate
    }
    whiteboardTemplates {
      ...WhiteboardTemplate
    }
    communityGuidelinesTemplates {
      ...CommunityGuidelinesTemplate
    }
    spaceTemplates {
      ...SpaceTemplate
    }
  }
  ${CalloutTemplateFragmentDoc}
  ${PostTemplateFragmentDoc}
  ${WhiteboardTemplateFragmentDoc}
  ${CommunityGuidelinesTemplateFragmentDoc}
  ${SpaceTemplateFragmentDoc}
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
    location {
      id
      city
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CalendarEventInfoFragmentDoc = gql`
  fragment CalendarEventInfo on CalendarEvent {
    id
    type
    startDate
    durationDays
    durationMinutes
    wholeDay
    multipleDays
    visibleOnParentCalendar
    profile {
      ...EventProfile
    }
    subspace @include(if: $includeSubspace) {
      id
      about {
        ...SpaceAboutLight
      }
    }
  }
  ${EventProfileFragmentDoc}
  ${SpaceAboutLightFragmentDoc}
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
        events {
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
    authorization {
      id
      myPrivileges
    }
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
export const InAppNotificationPayloadOrganizationMessageDirectFragmentDoc = gql`
  fragment InAppNotificationPayloadOrganizationMessageDirect on InAppNotificationPayloadOrganizationMessageDirect {
    organizationMessage: message
    organization {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationPayloadOrganizationMessageRoomFragmentDoc = gql`
  fragment InAppNotificationPayloadOrganizationMessageRoom on InAppNotificationPayloadOrganizationMessageRoom {
    comment
    roomID
    organization {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationPayloadPlatformGlobalRoleChangeFragmentDoc = gql`
  fragment InAppNotificationPayloadPlatformGlobalRoleChange on InAppNotificationPayloadPlatformGlobalRoleChange {
    type
    role
    user {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceNotificationFragmentDoc = gql`
  fragment spaceNotification on Space {
    id
    level
    about {
      id
      profile {
        id
        displayName
        description
        url
        tagline
        tagset {
          ...TagsetDetails
        }
        ...SubspaceVisuals
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${SubspaceVisualsFragmentDoc}
`;
export const InAppNotificationPayloadSpaceFragmentDoc = gql`
  fragment InAppNotificationPayloadSpace on InAppNotificationPayloadSpace {
    type
    space {
      ...spaceNotification
    }
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadPlatformForumDiscussionFragmentDoc = gql`
  fragment InAppNotificationPayloadPlatformForumDiscussion on InAppNotificationPayloadPlatformForumDiscussion {
    type
    comment
    discussion {
      id
      displayName
      description
      category
      url
    }
  }
`;
export const InAppNotificationUserMentionedFragmentDoc = gql`
  fragment InAppNotificationUserMentioned on InAppNotificationPayloadPlatformUserMessageRoom {
    messageDetails {
      message
      parent {
        displayName
        url
      }
      room {
        id
      }
    }
  }
`;
export const InAppNotificationPayloadPlatformUserFragmentDoc = gql`
  fragment InAppNotificationPayloadPlatformUser on InAppNotificationPayloadPlatformUser {
    type
  }
`;
export const InAppNotificationPayloadPlatformUserProfileRemovedFragmentDoc = gql`
  fragment InAppNotificationPayloadPlatformUserProfileRemoved on InAppNotificationPayloadPlatformUserProfileRemoved {
    type
    userEmail
    userDisplayName
  }
`;
export const InAppNotificationPayloadSpaceCollaborationCalloutFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCollaborationCallout on InAppNotificationPayloadSpaceCollaborationCallout {
    callout {
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
    space {
      ...spaceNotification
    }
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationSpaceCommunityContributorFragmentDoc = gql`
  fragment InAppNotificationSpaceCommunityContributor on InAppNotificationPayloadSpaceCommunityContributor {
    space {
      ...spaceNotification
    }
    contributor {
      id
      __typename
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${SpaceNotificationFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCommunityApplicationFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCommunityApplication on InAppNotificationPayloadSpaceCommunityApplication {
    space {
      ...spaceNotification
    }
    application {
      id
      createdDate
      contributor {
        id
        profile {
          id
          displayName
          url
          visual(type: AVATAR) {
            ...VisualModel
          }
        }
      }
    }
  }
  ${SpaceNotificationFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCommunicationUpdateFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCommunicationUpdate on InAppNotificationPayloadSpaceCommunicationUpdate {
    space {
      ...spaceNotification
    }
    update
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCommunicationMessageDirectFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCommunicationMessageDirect on InAppNotificationPayloadSpaceCommunicationMessageDirect {
    space {
      ...spaceNotification
    }
    spaceCommunicationMessage: message
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCommunityInvitationFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCommunityInvitation on InAppNotificationPayloadSpaceCommunityInvitation {
    space {
      ...spaceNotification
    }
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCommunityInvitationPlatformFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCommunityInvitationPlatform on InAppNotificationPayloadSpaceCommunityInvitationPlatform {
    space {
      ...spaceNotification
    }
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadUserMessageDirectFragmentDoc = gql`
  fragment InAppNotificationPayloadUserMessageDirect on InAppNotificationPayloadUserMessageDirect {
    userMessage: message
    user {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCollaborationCalloutCommentFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCollaborationCalloutComment on InAppNotificationPayloadSpaceCollaborationCalloutComment {
    messageDetails {
      message
      parent {
        displayName
        url
      }
      room {
        id
      }
    }
    space {
      ...spaceNotification
    }
    callout {
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
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadSpaceCollaborationCalloutPostCommentFragmentDoc = gql`
  fragment InAppNotificationPayloadSpaceCollaborationCalloutPostComment on InAppNotificationPayloadSpaceCollaborationCalloutPostComment {
    messageDetails {
      message
      parent {
        displayName
        url
      }
      room {
        id
      }
    }
    space {
      ...spaceNotification
    }
    callout {
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
  }
  ${SpaceNotificationFragmentDoc}
`;
export const InAppNotificationPayloadVirtualContributorFragmentDoc = gql`
  fragment InAppNotificationPayloadVirtualContributor on InAppNotificationPayloadVirtualContributor {
    type
    space {
      ...spaceNotification
    }
    contributor {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
  }
  ${SpaceNotificationFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const InAppNotificationAllTypesFragmentDoc = gql`
  fragment InAppNotificationAllTypes on InAppNotification {
    id
    type
    category
    state
    triggeredAt
    triggeredBy {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualModel
        }
      }
    }
    payload {
      type
      ... on InAppNotificationPayloadOrganizationMessageDirect {
        ...InAppNotificationPayloadOrganizationMessageDirect
      }
      ... on InAppNotificationPayloadOrganizationMessageRoom {
        ...InAppNotificationPayloadOrganizationMessageRoom
      }
      ... on InAppNotificationPayloadPlatformGlobalRoleChange {
        ...InAppNotificationPayloadPlatformGlobalRoleChange
      }
      ... on InAppNotificationPayloadSpace {
        ...InAppNotificationPayloadSpace
      }
      ... on InAppNotificationPayloadPlatformForumDiscussion {
        ...InAppNotificationPayloadPlatformForumDiscussion
      }
      ... on InAppNotificationPayloadPlatformUserMessageRoom {
        ...InAppNotificationUserMentioned
      }
      ... on InAppNotificationPayloadPlatformUser {
        ...InAppNotificationPayloadPlatformUser
      }
      ... on InAppNotificationPayloadPlatformUserProfileRemoved {
        ...InAppNotificationPayloadPlatformUserProfileRemoved
      }
      ... on InAppNotificationPayloadSpaceCollaborationCallout {
        ...InAppNotificationPayloadSpaceCollaborationCallout
      }
      ... on InAppNotificationPayloadSpaceCommunityContributor {
        ...InAppNotificationSpaceCommunityContributor
      }
      ... on InAppNotificationPayloadSpaceCommunityApplication {
        ...InAppNotificationPayloadSpaceCommunityApplication
      }
      ... on InAppNotificationPayloadSpaceCommunicationUpdate {
        ...InAppNotificationPayloadSpaceCommunicationUpdate
      }
      ... on InAppNotificationPayloadSpaceCommunicationMessageDirect {
        ...InAppNotificationPayloadSpaceCommunicationMessageDirect
      }
      ... on InAppNotificationPayloadSpaceCommunityInvitation {
        ...InAppNotificationPayloadSpaceCommunityInvitation
      }
      ... on InAppNotificationPayloadSpaceCommunityInvitationPlatform {
        ...InAppNotificationPayloadSpaceCommunityInvitationPlatform
      }
      ... on InAppNotificationPayloadUserMessageDirect {
        ...InAppNotificationPayloadUserMessageDirect
      }
      ... on InAppNotificationPayloadSpaceCollaborationCalloutComment {
        ...InAppNotificationPayloadSpaceCollaborationCalloutComment
      }
      ... on InAppNotificationPayloadSpaceCollaborationCalloutPostComment {
        ...InAppNotificationPayloadSpaceCollaborationCalloutPostComment
      }
      ... on InAppNotificationPayloadVirtualContributor {
        ...InAppNotificationPayloadVirtualContributor
      }
    }
  }
  ${VisualModelFragmentDoc}
  ${InAppNotificationPayloadOrganizationMessageDirectFragmentDoc}
  ${InAppNotificationPayloadOrganizationMessageRoomFragmentDoc}
  ${InAppNotificationPayloadPlatformGlobalRoleChangeFragmentDoc}
  ${InAppNotificationPayloadSpaceFragmentDoc}
  ${InAppNotificationPayloadPlatformForumDiscussionFragmentDoc}
  ${InAppNotificationUserMentionedFragmentDoc}
  ${InAppNotificationPayloadPlatformUserFragmentDoc}
  ${InAppNotificationPayloadPlatformUserProfileRemovedFragmentDoc}
  ${InAppNotificationPayloadSpaceCollaborationCalloutFragmentDoc}
  ${InAppNotificationSpaceCommunityContributorFragmentDoc}
  ${InAppNotificationPayloadSpaceCommunityApplicationFragmentDoc}
  ${InAppNotificationPayloadSpaceCommunicationUpdateFragmentDoc}
  ${InAppNotificationPayloadSpaceCommunicationMessageDirectFragmentDoc}
  ${InAppNotificationPayloadSpaceCommunityInvitationFragmentDoc}
  ${InAppNotificationPayloadSpaceCommunityInvitationPlatformFragmentDoc}
  ${InAppNotificationPayloadUserMessageDirectFragmentDoc}
  ${InAppNotificationPayloadSpaceCollaborationCalloutCommentFragmentDoc}
  ${InAppNotificationPayloadSpaceCollaborationCalloutPostCommentFragmentDoc}
  ${InAppNotificationPayloadVirtualContributorFragmentDoc}
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
      level
      visibility
      about {
        ...SpaceAboutLight
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
  ${SpaceAboutLightFragmentDoc}
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
          ...VisualModel
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
  ${VisualModelFragmentDoc}
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
      ...VisualModel
    }
    url
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const SearchResultUserFragmentDoc = gql`
  fragment SearchResultUser on SearchResultUser {
    user {
      id
      isContactable
      profile {
        displayName
        ...SearchResultProfile
      }
    }
  }
  ${SearchResultProfileFragmentDoc}
`;
export const CalloutParentFragmentDoc = gql`
  fragment CalloutParent on SearchResultCallout {
    space {
      id
      about {
        ...SpaceAboutLight
      }
      level
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;
export const SearchResultCalloutFragmentDoc = gql`
  fragment SearchResultCallout on SearchResultCallout {
    id
    callout {
      id
      framing {
        id
        profile {
          id
          displayName
          description
          url
          tagset {
            ...TagsetDetails
          }
        }
      }
      contributions {
        id
        post {
          id
        }
        whiteboard {
          id
        }
        link {
          id
        }
      }
      comments {
        id
        messagesCount
      }
    }
    ...CalloutParent
  }
  ${TagsetDetailsFragmentDoc}
  ${CalloutParentFragmentDoc}
`;
export const SearchResultOrganizationFragmentDoc = gql`
  fragment SearchResultOrganization on SearchResultOrganization {
    organization {
      id
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
    parentSpace {
      id
      level
      about {
        ...SpaceAboutLight
      }
    }
    space {
      id
      level
      about {
        id
        why
        profile {
          id
          url
          displayName
          tagset {
            ...TagsetDetails
          }
          tagline
          visuals {
            ...VisualModel
          }
        }
        isContentPublic
        membership {
          myMembershipStatus
        }
      }
      visibility
    }
  }
  ${SpaceAboutLightFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const DashboardSpaceMembershipFragmentDoc = gql`
  fragment DashboardSpaceMembership on Space {
    id
    level
    about {
      ...SpaceAboutCardBanner
      isContentPublic
      profile {
        spaceBanner: visual(type: BANNER) {
          ...VisualModel
        }
      }
      isContentPublic
      membership {
        myMembershipStatus
      }
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualModelFragmentDoc}
`;
export const ExploreSpacesFragmentDoc = gql`
  fragment ExploreSpaces on Space {
    id
    level
    about {
      id
      isContentPublic
      profile {
        id
        url
        displayName
        cardBanner: visual(type: CARD) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const ExploreSpacesSearchFragmentDoc = gql`
  fragment ExploreSpacesSearch on SearchResultSpace {
    space {
      ...ExploreSpaces
    }
  }
  ${ExploreSpacesFragmentDoc}
`;
export const ActivityLogSpaceVisualsFragmentDoc = gql`
  fragment ActivityLogSpaceVisuals on Space {
    id
    about {
      id
      profile {
        id
        displayName
        avatar: visual(type: AVATAR) {
          ...VisualModel
        }
        cardBanner: visual(type: CARD) {
          ...VisualModel
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceMembershipFragmentDoc = gql`
  fragment SpaceMembership on Space {
    id
    level
    authorization {
      id
      myPrivileges
    }
    about {
      ...SpaceAboutCardBanner
      membership {
        myMembershipStatus
      }
    }
    community {
      id
      roleSet {
        id
        myRoles
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const ShortAccountItemFragmentDoc = gql`
  fragment ShortAccountItem on Profile {
    id
    displayName
    url
    avatar: visual(type: AVATAR) {
      ...VisualModel
    }
  }
  ${VisualModelFragmentDoc}
`;
export const SpaceProfileCommunityDetailsFragmentDoc = gql`
  fragment spaceProfileCommunityDetails on Space {
    id
    authorization {
      id
      myPrivileges
    }
    about {
      ...SpaceAboutLight
    }
    community {
      id
      roleSet {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;
export const SpaceExplorerSpaceFragmentDoc = gql`
  fragment SpaceExplorerSpace on Space {
    id
    authorization {
      id
      myPrivileges
    }
    level
    visibility
    about {
      why
      ...SpaceAboutCardBanner
      membership {
        myMembershipStatus
      }
      isContentPublic
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const SpaceExplorerSearchSpaceFragmentDoc = gql`
  fragment SpaceExplorerSearchSpace on SearchResultSpace {
    space {
      ...SpaceExplorerSpace
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
`;
export const SpaceExplorerSubspaceFragmentDoc = gql`
  fragment SpaceExplorerSubspace on Space {
    id
    level
    about {
      ...SpaceAboutCardBanner
      why
      profile {
        avatar: visual(type: AVATAR) {
          ...VisualModel
        }
      }
      membership {
        myMembershipStatus
      }
      isContentPublic
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualModelFragmentDoc}
`;
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
export const DefaultVisualTypeConstraintsDocument = gql`
  query DefaultVisualTypeConstraints($visualType: VisualType!) {
    platform {
      id
      configuration {
        defaultVisualTypeConstraints(type: $visualType) {
          maxHeight
          maxWidth
          minHeight
          minWidth
          aspectRatio
          allowedTypes
        }
      }
    }
  }
`;

/**
 * __useDefaultVisualTypeConstraintsQuery__
 *
 * To run a query within a React component, call `useDefaultVisualTypeConstraintsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDefaultVisualTypeConstraintsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDefaultVisualTypeConstraintsQuery({
 *   variables: {
 *      visualType: // value for 'visualType'
 *   },
 * });
 */
export function useDefaultVisualTypeConstraintsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.DefaultVisualTypeConstraintsQuery,
    SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
  > &
    ({ variables: SchemaTypes.DefaultVisualTypeConstraintsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.DefaultVisualTypeConstraintsQuery,
    SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
  >(DefaultVisualTypeConstraintsDocument, options);
}
export function useDefaultVisualTypeConstraintsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.DefaultVisualTypeConstraintsQuery,
    SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.DefaultVisualTypeConstraintsQuery,
    SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
  >(DefaultVisualTypeConstraintsDocument, options);
}
export function useDefaultVisualTypeConstraintsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.DefaultVisualTypeConstraintsQuery,
        SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.DefaultVisualTypeConstraintsQuery,
    SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
  >(DefaultVisualTypeConstraintsDocument, options);
}
export type DefaultVisualTypeConstraintsQueryHookResult = ReturnType<typeof useDefaultVisualTypeConstraintsQuery>;
export type DefaultVisualTypeConstraintsLazyQueryHookResult = ReturnType<
  typeof useDefaultVisualTypeConstraintsLazyQuery
>;
export type DefaultVisualTypeConstraintsSuspenseQueryHookResult = ReturnType<
  typeof useDefaultVisualTypeConstraintsSuspenseQuery
>;
export type DefaultVisualTypeConstraintsQueryResult = Apollo.QueryResult<
  SchemaTypes.DefaultVisualTypeConstraintsQuery,
  SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
>;
export function refetchDefaultVisualTypeConstraintsQuery(
  variables: SchemaTypes.DefaultVisualTypeConstraintsQueryVariables
) {
  return { query: DefaultVisualTypeConstraintsDocument, variables: variables };
}
export const InnovationPackProfilePageDocument = gql`
  query InnovationPackProfilePage($innovationPackId: UUID!) {
    lookup {
      innovationPack(ID: $innovationPackId) {
        id
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
        templatesSet {
          id
        }
      }
    }
  }
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
  ${InnovationPackProfileFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.InnovationPackProfilePageQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useInnovationPackProfilePageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationPackProfilePageQuery,
        SchemaTypes.InnovationPackProfilePageQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationPackProfilePageQuery,
    SchemaTypes.InnovationPackProfilePageQueryVariables
  >(InnovationPackProfilePageDocument, options);
}
export type InnovationPackProfilePageQueryHookResult = ReturnType<typeof useInnovationPackProfilePageQuery>;
export type InnovationPackProfilePageLazyQueryHookResult = ReturnType<typeof useInnovationPackProfilePageLazyQuery>;
export type InnovationPackProfilePageSuspenseQueryHookResult = ReturnType<
  typeof useInnovationPackProfilePageSuspenseQuery
>;
export type InnovationPackProfilePageQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPackProfilePageQuery,
  SchemaTypes.InnovationPackProfilePageQueryVariables
>;
export function refetchInnovationPackProfilePageQuery(variables: SchemaTypes.InnovationPackProfilePageQueryVariables) {
  return { query: InnovationPackProfilePageDocument, variables: variables };
}
export const DeleteInnovationPackDocument = gql`
  mutation deleteInnovationPack($innovationPackId: UUID!) {
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
  query AdminInnovationPack($innovationPackId: UUID!) {
    lookup {
      innovationPack(ID: $innovationPackId) {
        id
        provider {
          ...InnovationPackProviderProfileWithAvatar
        }
        profile {
          ...InnovationPackProfile
        }
        templatesSet {
          id
        }
        listedInStore
        searchVisibility
      }
    }
  }
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
  ${InnovationPackProfileFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.AdminInnovationPackQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useAdminInnovationPackSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AdminInnovationPackQuery,
        SchemaTypes.AdminInnovationPackQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AdminInnovationPackQuery, SchemaTypes.AdminInnovationPackQueryVariables>(
    AdminInnovationPackDocument,
    options
  );
}
export type AdminInnovationPackQueryHookResult = ReturnType<typeof useAdminInnovationPackQuery>;
export type AdminInnovationPackLazyQueryHookResult = ReturnType<typeof useAdminInnovationPackLazyQuery>;
export type AdminInnovationPackSuspenseQueryHookResult = ReturnType<typeof useAdminInnovationPackSuspenseQuery>;
export type AdminInnovationPackQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminInnovationPackQuery,
  SchemaTypes.AdminInnovationPackQueryVariables
>;
export function refetchAdminInnovationPackQuery(variables: SchemaTypes.AdminInnovationPackQueryVariables) {
  return { query: AdminInnovationPackDocument, variables: variables };
}
export const CreateInnovationPackDocument = gql`
  mutation createInnovationPack($packData: CreateInnovationPackOnAccountInput!) {
    createInnovationPack(innovationPackData: $packData) {
      id
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
export const ApplicationButtonDocument = gql`
  query ApplicationButton(
    $spaceId: UUID!
    $parentSpaceId: UUID! = "00000000-0000-0000-0000-000000000000"
    $includeParentSpace: Boolean! = false
  ) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimalUrl
          membership {
            communityID
            roleSetID
            myMembershipStatus
            myPrivileges
          }
        }
      }
    }
    parentSpace: lookup @include(if: $includeParentSpace) {
      space(ID: $parentSpaceId) {
        id
        level
        about {
          ...SpaceAboutMinimalUrl
          membership {
            communityID
            roleSetID
            myMembershipStatus
            myPrivileges
          }
        }
      }
    }
  }
  ${SpaceAboutMinimalUrlFragmentDoc}
`;

/**
 * __useApplicationButtonQuery__
 *
 * To run a query within a React component, call `useApplicationButtonQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationButtonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationButtonQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      parentSpaceId: // value for 'parentSpaceId'
 *      includeParentSpace: // value for 'includeParentSpace'
 *   },
 * });
 */
export function useApplicationButtonQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ApplicationButtonQuery,
    SchemaTypes.ApplicationButtonQueryVariables
  > &
    ({ variables: SchemaTypes.ApplicationButtonQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ApplicationButtonQuery, SchemaTypes.ApplicationButtonQueryVariables>(
    ApplicationButtonDocument,
    options
  );
}
export function useApplicationButtonLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ApplicationButtonQuery,
    SchemaTypes.ApplicationButtonQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ApplicationButtonQuery, SchemaTypes.ApplicationButtonQueryVariables>(
    ApplicationButtonDocument,
    options
  );
}
export function useApplicationButtonSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ApplicationButtonQuery, SchemaTypes.ApplicationButtonQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ApplicationButtonQuery, SchemaTypes.ApplicationButtonQueryVariables>(
    ApplicationButtonDocument,
    options
  );
}
export type ApplicationButtonQueryHookResult = ReturnType<typeof useApplicationButtonQuery>;
export type ApplicationButtonLazyQueryHookResult = ReturnType<typeof useApplicationButtonLazyQuery>;
export type ApplicationButtonSuspenseQueryHookResult = ReturnType<typeof useApplicationButtonSuspenseQuery>;
export type ApplicationButtonQueryResult = Apollo.QueryResult<
  SchemaTypes.ApplicationButtonQuery,
  SchemaTypes.ApplicationButtonQueryVariables
>;
export function refetchApplicationButtonQuery(variables: SchemaTypes.ApplicationButtonQueryVariables) {
  return { query: ApplicationButtonDocument, variables: variables };
}
export const ApplyForEntryRoleOnRoleSetDocument = gql`
  mutation ApplyForEntryRoleOnRoleSet($roleSetId: UUID!, $questions: [CreateNVPInput!]!) {
    applyForEntryRoleOnRoleSet(applicationData: { roleSetID: $roleSetId, questions: $questions }) {
      id
    }
  }
`;
export type ApplyForEntryRoleOnRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.ApplyForEntryRoleOnRoleSetMutation,
  SchemaTypes.ApplyForEntryRoleOnRoleSetMutationVariables
>;

/**
 * __useApplyForEntryRoleOnRoleSetMutation__
 *
 * To run a mutation, you first call `useApplyForEntryRoleOnRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApplyForEntryRoleOnRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [applyForEntryRoleOnRoleSetMutation, { data, loading, error }] = useApplyForEntryRoleOnRoleSetMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      questions: // value for 'questions'
 *   },
 * });
 */
export function useApplyForEntryRoleOnRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.ApplyForEntryRoleOnRoleSetMutation,
    SchemaTypes.ApplyForEntryRoleOnRoleSetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.ApplyForEntryRoleOnRoleSetMutation,
    SchemaTypes.ApplyForEntryRoleOnRoleSetMutationVariables
  >(ApplyForEntryRoleOnRoleSetDocument, options);
}
export type ApplyForEntryRoleOnRoleSetMutationHookResult = ReturnType<typeof useApplyForEntryRoleOnRoleSetMutation>;
export type ApplyForEntryRoleOnRoleSetMutationResult =
  Apollo.MutationResult<SchemaTypes.ApplyForEntryRoleOnRoleSetMutation>;
export type ApplyForEntryRoleOnRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.ApplyForEntryRoleOnRoleSetMutation,
  SchemaTypes.ApplyForEntryRoleOnRoleSetMutationVariables
>;
export const EventOnApplicationDocument = gql`
  mutation EventOnApplication($input: ApplicationEventInput!) {
    eventOnApplication(eventData: $input) {
      id
      nextEvents
      state
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
export const JoinRoleSetDocument = gql`
  mutation JoinRoleSet($roleSetId: UUID!) {
    joinRoleSet(joinData: { roleSetID: $roleSetId }) {
      id
    }
  }
`;
export type JoinRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.JoinRoleSetMutation,
  SchemaTypes.JoinRoleSetMutationVariables
>;

/**
 * __useJoinRoleSetMutation__
 *
 * To run a mutation, you first call `useJoinRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinRoleSetMutation, { data, loading, error }] = useJoinRoleSetMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *   },
 * });
 */
export function useJoinRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.JoinRoleSetMutation, SchemaTypes.JoinRoleSetMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.JoinRoleSetMutation, SchemaTypes.JoinRoleSetMutationVariables>(
    JoinRoleSetDocument,
    options
  );
}
export type JoinRoleSetMutationHookResult = ReturnType<typeof useJoinRoleSetMutation>;
export type JoinRoleSetMutationResult = Apollo.MutationResult<SchemaTypes.JoinRoleSetMutation>;
export type JoinRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.JoinRoleSetMutation,
  SchemaTypes.JoinRoleSetMutationVariables
>;
export const InvitationStateEventDocument = gql`
  mutation InvitationStateEvent($eventName: String!, $invitationId: UUID!) {
    eventOnInvitation(eventData: { eventName: $eventName, invitationID: $invitationId }) {
      id
      nextEvents
      state
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
export const InviteForEntryRoleOnRoleSetDocument = gql`
  mutation InviteForEntryRoleOnRoleSet(
    $roleSetId: UUID!
    $invitedContributorIds: [UUID!]!
    $invitedUserEmails: [String!]!
    $welcomeMessage: String
    $extraRoles: [RoleName!]!
  ) {
    inviteForEntryRoleOnRoleSet(
      invitationData: {
        invitedContributorIDs: $invitedContributorIds
        invitedUserEmails: $invitedUserEmails
        roleSetID: $roleSetId
        welcomeMessage: $welcomeMessage
        extraRoles: $extraRoles
      }
    ) {
      type
      invitation {
        id
        contributor {
          id
          profile {
            id
            displayName
          }
        }
      }
      platformInvitation {
        id
        email
        firstName
        lastName
      }
    }
  }
`;
export type InviteForEntryRoleOnRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteForEntryRoleOnRoleSetMutation,
  SchemaTypes.InviteForEntryRoleOnRoleSetMutationVariables
>;

/**
 * __useInviteForEntryRoleOnRoleSetMutation__
 *
 * To run a mutation, you first call `useInviteForEntryRoleOnRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteForEntryRoleOnRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteForEntryRoleOnRoleSetMutation, { data, loading, error }] = useInviteForEntryRoleOnRoleSetMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      invitedContributorIds: // value for 'invitedContributorIds'
 *      invitedUserEmails: // value for 'invitedUserEmails'
 *      welcomeMessage: // value for 'welcomeMessage'
 *      extraRoles: // value for 'extraRoles'
 *   },
 * });
 */
export function useInviteForEntryRoleOnRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteForEntryRoleOnRoleSetMutation,
    SchemaTypes.InviteForEntryRoleOnRoleSetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.InviteForEntryRoleOnRoleSetMutation,
    SchemaTypes.InviteForEntryRoleOnRoleSetMutationVariables
  >(InviteForEntryRoleOnRoleSetDocument, options);
}
export type InviteForEntryRoleOnRoleSetMutationHookResult = ReturnType<typeof useInviteForEntryRoleOnRoleSetMutation>;
export type InviteForEntryRoleOnRoleSetMutationResult =
  Apollo.MutationResult<SchemaTypes.InviteForEntryRoleOnRoleSetMutation>;
export type InviteForEntryRoleOnRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteForEntryRoleOnRoleSetMutation,
  SchemaTypes.InviteForEntryRoleOnRoleSetMutationVariables
>;
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
export const DeletePlatformInvitationDocument = gql`
  mutation DeletePlatformInvitation($invitationId: UUID!) {
    deletePlatformInvitation(deleteData: { ID: $invitationId }) {
      id
    }
  }
`;
export type DeletePlatformInvitationMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeletePlatformInvitationMutation,
  SchemaTypes.DeletePlatformInvitationMutationVariables
>;

/**
 * __useDeletePlatformInvitationMutation__
 *
 * To run a mutation, you first call `useDeletePlatformInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePlatformInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePlatformInvitationMutation, { data, loading, error }] = useDeletePlatformInvitationMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useDeletePlatformInvitationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeletePlatformInvitationMutation,
    SchemaTypes.DeletePlatformInvitationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeletePlatformInvitationMutation,
    SchemaTypes.DeletePlatformInvitationMutationVariables
  >(DeletePlatformInvitationDocument, options);
}
export type DeletePlatformInvitationMutationHookResult = ReturnType<typeof useDeletePlatformInvitationMutation>;
export type DeletePlatformInvitationMutationResult =
  Apollo.MutationResult<SchemaTypes.DeletePlatformInvitationMutation>;
export type DeletePlatformInvitationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeletePlatformInvitationMutation,
  SchemaTypes.DeletePlatformInvitationMutationVariables
>;
export const CommunityApplicationsInvitationsDocument = gql`
  query CommunityApplicationsInvitations($roleSetId: UUID!) {
    lookup {
      roleSet(ID: $roleSetId) {
        id
        authorization {
          myPrivileges
        }
        applications {
          ...AdminCommunityApplication
        }
        invitations {
          ...AdminCommunityInvitation
        }
        platformInvitations {
          ...AdminPlatformInvitationCommunity
        }
      }
    }
  }
  ${AdminCommunityApplicationFragmentDoc}
  ${AdminCommunityInvitationFragmentDoc}
  ${AdminPlatformInvitationCommunityFragmentDoc}
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
 *      roleSetId: // value for 'roleSetId'
 *   },
 * });
 */
export function useCommunityApplicationsInvitationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityApplicationsInvitationsQuery,
    SchemaTypes.CommunityApplicationsInvitationsQueryVariables
  > &
    ({ variables: SchemaTypes.CommunityApplicationsInvitationsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCommunityApplicationsInvitationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CommunityApplicationsInvitationsQuery,
        SchemaTypes.CommunityApplicationsInvitationsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type CommunityApplicationsInvitationsSuspenseQueryHookResult = ReturnType<
  typeof useCommunityApplicationsInvitationsSuspenseQuery
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
export const UserPendingMembershipsDocument = gql`
  query UserPendingMemberships {
    me {
      user {
        ...UserDetails
      }
      communityApplications(states: ["new"]) {
        id
        spacePendingMembershipInfo {
          id
          level
          about {
            ...SpaceAboutMinimalUrl
          }
        }
        application {
          id
          state
          createdDate
        }
      }
      communityInvitations(states: ["invited"]) {
        ...InvitationData
      }
    }
  }
  ${UserDetailsFragmentDoc}
  ${SpaceAboutMinimalUrlFragmentDoc}
  ${InvitationDataFragmentDoc}
`;

/**
 * __useUserPendingMembershipsQuery__
 *
 * To run a query within a React component, call `useUserPendingMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserPendingMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserPendingMembershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserPendingMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.UserPendingMembershipsQuery,
    SchemaTypes.UserPendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserPendingMembershipsQuery, SchemaTypes.UserPendingMembershipsQueryVariables>(
    UserPendingMembershipsDocument,
    options
  );
}
export function useUserPendingMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserPendingMembershipsQuery,
    SchemaTypes.UserPendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserPendingMembershipsQuery, SchemaTypes.UserPendingMembershipsQueryVariables>(
    UserPendingMembershipsDocument,
    options
  );
}
export function useUserPendingMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.UserPendingMembershipsQuery,
        SchemaTypes.UserPendingMembershipsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.UserPendingMembershipsQuery,
    SchemaTypes.UserPendingMembershipsQueryVariables
  >(UserPendingMembershipsDocument, options);
}
export type UserPendingMembershipsQueryHookResult = ReturnType<typeof useUserPendingMembershipsQuery>;
export type UserPendingMembershipsLazyQueryHookResult = ReturnType<typeof useUserPendingMembershipsLazyQuery>;
export type UserPendingMembershipsSuspenseQueryHookResult = ReturnType<typeof useUserPendingMembershipsSuspenseQuery>;
export type UserPendingMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserPendingMembershipsQuery,
  SchemaTypes.UserPendingMembershipsQueryVariables
>;
export function refetchUserPendingMembershipsQuery(variables?: SchemaTypes.UserPendingMembershipsQueryVariables) {
  return { query: UserPendingMembershipsDocument, variables: variables };
}
export const PlatformRoleAvailableUsersDocument = gql`
  query PlatformRoleAvailableUsers($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
      ...AvailableUsersForRoleSetPaginated
    }
  }
  ${AvailableUsersForRoleSetPaginatedFragmentDoc}
`;

/**
 * __usePlatformRoleAvailableUsersQuery__
 *
 * To run a query within a React component, call `usePlatformRoleAvailableUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformRoleAvailableUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformRoleAvailableUsersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function usePlatformRoleAvailableUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformRoleAvailableUsersQuery,
    SchemaTypes.PlatformRoleAvailableUsersQueryVariables
  > &
    ({ variables: SchemaTypes.PlatformRoleAvailableUsersQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformRoleAvailableUsersQuery,
    SchemaTypes.PlatformRoleAvailableUsersQueryVariables
  >(PlatformRoleAvailableUsersDocument, options);
}
export function usePlatformRoleAvailableUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformRoleAvailableUsersQuery,
    SchemaTypes.PlatformRoleAvailableUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformRoleAvailableUsersQuery,
    SchemaTypes.PlatformRoleAvailableUsersQueryVariables
  >(PlatformRoleAvailableUsersDocument, options);
}
export function usePlatformRoleAvailableUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformRoleAvailableUsersQuery,
        SchemaTypes.PlatformRoleAvailableUsersQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformRoleAvailableUsersQuery,
    SchemaTypes.PlatformRoleAvailableUsersQueryVariables
  >(PlatformRoleAvailableUsersDocument, options);
}
export type PlatformRoleAvailableUsersQueryHookResult = ReturnType<typeof usePlatformRoleAvailableUsersQuery>;
export type PlatformRoleAvailableUsersLazyQueryHookResult = ReturnType<typeof usePlatformRoleAvailableUsersLazyQuery>;
export type PlatformRoleAvailableUsersSuspenseQueryHookResult = ReturnType<
  typeof usePlatformRoleAvailableUsersSuspenseQuery
>;
export type PlatformRoleAvailableUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformRoleAvailableUsersQuery,
  SchemaTypes.PlatformRoleAvailableUsersQueryVariables
>;
export function refetchPlatformRoleAvailableUsersQuery(
  variables: SchemaTypes.PlatformRoleAvailableUsersQueryVariables
) {
  return { query: PlatformRoleAvailableUsersDocument, variables: variables };
}
export const AvailableUsersForEntryRoleDocument = gql`
  query AvailableUsersForEntryRole($roleSetId: UUID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    lookup {
      roleSet(ID: $roleSetId) {
        availableUsersForEntryRole(first: $first, after: $after, filter: $filter) {
          ...AvailableUsersForRoleSetPaginated
        }
      }
    }
  }
  ${AvailableUsersForRoleSetPaginatedFragmentDoc}
`;

/**
 * __useAvailableUsersForEntryRoleQuery__
 *
 * To run a query within a React component, call `useAvailableUsersForEntryRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableUsersForEntryRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableUsersForEntryRoleQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAvailableUsersForEntryRoleQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AvailableUsersForEntryRoleQuery,
    SchemaTypes.AvailableUsersForEntryRoleQueryVariables
  > &
    ({ variables: SchemaTypes.AvailableUsersForEntryRoleQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableUsersForEntryRoleQuery,
    SchemaTypes.AvailableUsersForEntryRoleQueryVariables
  >(AvailableUsersForEntryRoleDocument, options);
}
export function useAvailableUsersForEntryRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableUsersForEntryRoleQuery,
    SchemaTypes.AvailableUsersForEntryRoleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableUsersForEntryRoleQuery,
    SchemaTypes.AvailableUsersForEntryRoleQueryVariables
  >(AvailableUsersForEntryRoleDocument, options);
}
export function useAvailableUsersForEntryRoleSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableUsersForEntryRoleQuery,
        SchemaTypes.AvailableUsersForEntryRoleQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableUsersForEntryRoleQuery,
    SchemaTypes.AvailableUsersForEntryRoleQueryVariables
  >(AvailableUsersForEntryRoleDocument, options);
}
export type AvailableUsersForEntryRoleQueryHookResult = ReturnType<typeof useAvailableUsersForEntryRoleQuery>;
export type AvailableUsersForEntryRoleLazyQueryHookResult = ReturnType<typeof useAvailableUsersForEntryRoleLazyQuery>;
export type AvailableUsersForEntryRoleSuspenseQueryHookResult = ReturnType<
  typeof useAvailableUsersForEntryRoleSuspenseQuery
>;
export type AvailableUsersForEntryRoleQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableUsersForEntryRoleQuery,
  SchemaTypes.AvailableUsersForEntryRoleQueryVariables
>;
export function refetchAvailableUsersForEntryRoleQuery(
  variables: SchemaTypes.AvailableUsersForEntryRoleQueryVariables
) {
  return { query: AvailableUsersForEntryRoleDocument, variables: variables };
}
export const AvailableUsersForElevatedRoleDocument = gql`
  query AvailableUsersForElevatedRole(
    $roleSetId: UUID!
    $role: RoleName!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    lookup {
      roleSet(ID: $roleSetId) {
        availableUsersForElevatedRole(role: $role, first: $first, after: $after, filter: $filter) {
          ...AvailableUsersForRoleSetPaginated
        }
      }
    }
  }
  ${AvailableUsersForRoleSetPaginatedFragmentDoc}
`;

/**
 * __useAvailableUsersForElevatedRoleQuery__
 *
 * To run a query within a React component, call `useAvailableUsersForElevatedRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableUsersForElevatedRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableUsersForElevatedRoleQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAvailableUsersForElevatedRoleQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AvailableUsersForElevatedRoleQuery,
    SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
  > &
    ({ variables: SchemaTypes.AvailableUsersForElevatedRoleQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableUsersForElevatedRoleQuery,
    SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
  >(AvailableUsersForElevatedRoleDocument, options);
}
export function useAvailableUsersForElevatedRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableUsersForElevatedRoleQuery,
    SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableUsersForElevatedRoleQuery,
    SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
  >(AvailableUsersForElevatedRoleDocument, options);
}
export function useAvailableUsersForElevatedRoleSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableUsersForElevatedRoleQuery,
        SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableUsersForElevatedRoleQuery,
    SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
  >(AvailableUsersForElevatedRoleDocument, options);
}
export type AvailableUsersForElevatedRoleQueryHookResult = ReturnType<typeof useAvailableUsersForElevatedRoleQuery>;
export type AvailableUsersForElevatedRoleLazyQueryHookResult = ReturnType<
  typeof useAvailableUsersForElevatedRoleLazyQuery
>;
export type AvailableUsersForElevatedRoleSuspenseQueryHookResult = ReturnType<
  typeof useAvailableUsersForElevatedRoleSuspenseQuery
>;
export type AvailableUsersForElevatedRoleQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableUsersForElevatedRoleQuery,
  SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
>;
export function refetchAvailableUsersForElevatedRoleQuery(
  variables: SchemaTypes.AvailableUsersForElevatedRoleQueryVariables
) {
  return { query: AvailableUsersForElevatedRoleDocument, variables: variables };
}
export const AvailableOrganizationsDocument = gql`
  query AvailableOrganizations($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    organizationsPaginated(first: $first, after: $after, filter: $filter) {
      organization {
        ...BasicOrganizationDetails
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${BasicOrganizationDetailsFragmentDoc}
`;

/**
 * __useAvailableOrganizationsQuery__
 *
 * To run a query within a React component, call `useAvailableOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableOrganizationsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAvailableOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AvailableOrganizationsQuery,
    SchemaTypes.AvailableOrganizationsQueryVariables
  > &
    ({ variables: SchemaTypes.AvailableOrganizationsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AvailableOrganizationsQuery, SchemaTypes.AvailableOrganizationsQueryVariables>(
    AvailableOrganizationsDocument,
    options
  );
}
export function useAvailableOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableOrganizationsQuery,
    SchemaTypes.AvailableOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AvailableOrganizationsQuery, SchemaTypes.AvailableOrganizationsQueryVariables>(
    AvailableOrganizationsDocument,
    options
  );
}
export function useAvailableOrganizationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableOrganizationsQuery,
        SchemaTypes.AvailableOrganizationsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableOrganizationsQuery,
    SchemaTypes.AvailableOrganizationsQueryVariables
  >(AvailableOrganizationsDocument, options);
}
export type AvailableOrganizationsQueryHookResult = ReturnType<typeof useAvailableOrganizationsQuery>;
export type AvailableOrganizationsLazyQueryHookResult = ReturnType<typeof useAvailableOrganizationsLazyQuery>;
export type AvailableOrganizationsSuspenseQueryHookResult = ReturnType<typeof useAvailableOrganizationsSuspenseQuery>;
export type AvailableOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableOrganizationsQuery,
  SchemaTypes.AvailableOrganizationsQueryVariables
>;
export function refetchAvailableOrganizationsQuery(variables: SchemaTypes.AvailableOrganizationsQueryVariables) {
  return { query: AvailableOrganizationsDocument, variables: variables };
}
export const AssignPlatformRoleToUserDocument = gql`
  mutation AssignPlatformRoleToUser($role: RoleName!, $contributorId: UUID!) {
    assignPlatformRoleToUser(roleData: { role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type AssignPlatformRoleToUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignPlatformRoleToUserMutation,
  SchemaTypes.AssignPlatformRoleToUserMutationVariables
>;

/**
 * __useAssignPlatformRoleToUserMutation__
 *
 * To run a mutation, you first call `useAssignPlatformRoleToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignPlatformRoleToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignPlatformRoleToUserMutation, { data, loading, error }] = useAssignPlatformRoleToUserMutation({
 *   variables: {
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useAssignPlatformRoleToUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignPlatformRoleToUserMutation,
    SchemaTypes.AssignPlatformRoleToUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignPlatformRoleToUserMutation,
    SchemaTypes.AssignPlatformRoleToUserMutationVariables
  >(AssignPlatformRoleToUserDocument, options);
}
export type AssignPlatformRoleToUserMutationHookResult = ReturnType<typeof useAssignPlatformRoleToUserMutation>;
export type AssignPlatformRoleToUserMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignPlatformRoleToUserMutation>;
export type AssignPlatformRoleToUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignPlatformRoleToUserMutation,
  SchemaTypes.AssignPlatformRoleToUserMutationVariables
>;
export const AssignRoleToUserDocument = gql`
  mutation AssignRoleToUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    assignRoleToUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type AssignRoleToUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignRoleToUserMutation,
  SchemaTypes.AssignRoleToUserMutationVariables
>;

/**
 * __useAssignRoleToUserMutation__
 *
 * To run a mutation, you first call `useAssignRoleToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToUserMutation, { data, loading, error }] = useAssignRoleToUserMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useAssignRoleToUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignRoleToUserMutation,
    SchemaTypes.AssignRoleToUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.AssignRoleToUserMutation, SchemaTypes.AssignRoleToUserMutationVariables>(
    AssignRoleToUserDocument,
    options
  );
}
export type AssignRoleToUserMutationHookResult = ReturnType<typeof useAssignRoleToUserMutation>;
export type AssignRoleToUserMutationResult = Apollo.MutationResult<SchemaTypes.AssignRoleToUserMutation>;
export type AssignRoleToUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignRoleToUserMutation,
  SchemaTypes.AssignRoleToUserMutationVariables
>;
export const AssignRoleToOrganizationDocument = gql`
  mutation AssignRoleToOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    assignRoleToOrganization(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type AssignRoleToOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignRoleToOrganizationMutation,
  SchemaTypes.AssignRoleToOrganizationMutationVariables
>;

/**
 * __useAssignRoleToOrganizationMutation__
 *
 * To run a mutation, you first call `useAssignRoleToOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToOrganizationMutation, { data, loading, error }] = useAssignRoleToOrganizationMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useAssignRoleToOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignRoleToOrganizationMutation,
    SchemaTypes.AssignRoleToOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignRoleToOrganizationMutation,
    SchemaTypes.AssignRoleToOrganizationMutationVariables
  >(AssignRoleToOrganizationDocument, options);
}
export type AssignRoleToOrganizationMutationHookResult = ReturnType<typeof useAssignRoleToOrganizationMutation>;
export type AssignRoleToOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignRoleToOrganizationMutation>;
export type AssignRoleToOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignRoleToOrganizationMutation,
  SchemaTypes.AssignRoleToOrganizationMutationVariables
>;
export const AssignRoleToVirtualContributorDocument = gql`
  mutation AssignRoleToVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    assignRoleToVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type AssignRoleToVirtualContributorMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignRoleToVirtualContributorMutation,
  SchemaTypes.AssignRoleToVirtualContributorMutationVariables
>;

/**
 * __useAssignRoleToVirtualContributorMutation__
 *
 * To run a mutation, you first call `useAssignRoleToVirtualContributorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToVirtualContributorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToVirtualContributorMutation, { data, loading, error }] = useAssignRoleToVirtualContributorMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useAssignRoleToVirtualContributorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignRoleToVirtualContributorMutation,
    SchemaTypes.AssignRoleToVirtualContributorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignRoleToVirtualContributorMutation,
    SchemaTypes.AssignRoleToVirtualContributorMutationVariables
  >(AssignRoleToVirtualContributorDocument, options);
}
export type AssignRoleToVirtualContributorMutationHookResult = ReturnType<
  typeof useAssignRoleToVirtualContributorMutation
>;
export type AssignRoleToVirtualContributorMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignRoleToVirtualContributorMutation>;
export type AssignRoleToVirtualContributorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignRoleToVirtualContributorMutation,
  SchemaTypes.AssignRoleToVirtualContributorMutationVariables
>;
export const RemovePlatformRoleFromUserDocument = gql`
  mutation RemovePlatformRoleFromUser($role: RoleName!, $contributorId: UUID!) {
    removePlatformRoleFromUser(roleData: { role: $role, contributorID: $contributorId }) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type RemovePlatformRoleFromUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemovePlatformRoleFromUserMutation,
  SchemaTypes.RemovePlatformRoleFromUserMutationVariables
>;

/**
 * __useRemovePlatformRoleFromUserMutation__
 *
 * To run a mutation, you first call `useRemovePlatformRoleFromUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePlatformRoleFromUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePlatformRoleFromUserMutation, { data, loading, error }] = useRemovePlatformRoleFromUserMutation({
 *   variables: {
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useRemovePlatformRoleFromUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemovePlatformRoleFromUserMutation,
    SchemaTypes.RemovePlatformRoleFromUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemovePlatformRoleFromUserMutation,
    SchemaTypes.RemovePlatformRoleFromUserMutationVariables
  >(RemovePlatformRoleFromUserDocument, options);
}
export type RemovePlatformRoleFromUserMutationHookResult = ReturnType<typeof useRemovePlatformRoleFromUserMutation>;
export type RemovePlatformRoleFromUserMutationResult =
  Apollo.MutationResult<SchemaTypes.RemovePlatformRoleFromUserMutation>;
export type RemovePlatformRoleFromUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemovePlatformRoleFromUserMutation,
  SchemaTypes.RemovePlatformRoleFromUserMutationVariables
>;
export const RemoveRoleFromUserDocument = gql`
  mutation RemoveRoleFromUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    removeRoleFromUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type RemoveRoleFromUserMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveRoleFromUserMutation,
  SchemaTypes.RemoveRoleFromUserMutationVariables
>;

/**
 * __useRemoveRoleFromUserMutation__
 *
 * To run a mutation, you first call `useRemoveRoleFromUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRoleFromUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRoleFromUserMutation, { data, loading, error }] = useRemoveRoleFromUserMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useRemoveRoleFromUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveRoleFromUserMutation,
    SchemaTypes.RemoveRoleFromUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RemoveRoleFromUserMutation, SchemaTypes.RemoveRoleFromUserMutationVariables>(
    RemoveRoleFromUserDocument,
    options
  );
}
export type RemoveRoleFromUserMutationHookResult = ReturnType<typeof useRemoveRoleFromUserMutation>;
export type RemoveRoleFromUserMutationResult = Apollo.MutationResult<SchemaTypes.RemoveRoleFromUserMutation>;
export type RemoveRoleFromUserMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveRoleFromUserMutation,
  SchemaTypes.RemoveRoleFromUserMutationVariables
>;
export const RemoveRoleFromOrganizationDocument = gql`
  mutation removeRoleFromOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    removeRoleFromOrganization(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type RemoveRoleFromOrganizationMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveRoleFromOrganizationMutation,
  SchemaTypes.RemoveRoleFromOrganizationMutationVariables
>;

/**
 * __useRemoveRoleFromOrganizationMutation__
 *
 * To run a mutation, you first call `useRemoveRoleFromOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRoleFromOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRoleFromOrganizationMutation, { data, loading, error }] = useRemoveRoleFromOrganizationMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useRemoveRoleFromOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveRoleFromOrganizationMutation,
    SchemaTypes.RemoveRoleFromOrganizationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveRoleFromOrganizationMutation,
    SchemaTypes.RemoveRoleFromOrganizationMutationVariables
  >(RemoveRoleFromOrganizationDocument, options);
}
export type RemoveRoleFromOrganizationMutationHookResult = ReturnType<typeof useRemoveRoleFromOrganizationMutation>;
export type RemoveRoleFromOrganizationMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveRoleFromOrganizationMutation>;
export type RemoveRoleFromOrganizationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveRoleFromOrganizationMutation,
  SchemaTypes.RemoveRoleFromOrganizationMutationVariables
>;
export const RemoveRoleFromVirtualContributorDocument = gql`
  mutation removeRoleFromVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
    removeRoleFromVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
      id
    }
  }
`;
export type RemoveRoleFromVirtualContributorMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveRoleFromVirtualContributorMutation,
  SchemaTypes.RemoveRoleFromVirtualContributorMutationVariables
>;

/**
 * __useRemoveRoleFromVirtualContributorMutation__
 *
 * To run a mutation, you first call `useRemoveRoleFromVirtualContributorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRoleFromVirtualContributorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRoleFromVirtualContributorMutation, { data, loading, error }] = useRemoveRoleFromVirtualContributorMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      role: // value for 'role'
 *      contributorId: // value for 'contributorId'
 *   },
 * });
 */
export function useRemoveRoleFromVirtualContributorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveRoleFromVirtualContributorMutation,
    SchemaTypes.RemoveRoleFromVirtualContributorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveRoleFromVirtualContributorMutation,
    SchemaTypes.RemoveRoleFromVirtualContributorMutationVariables
  >(RemoveRoleFromVirtualContributorDocument, options);
}
export type RemoveRoleFromVirtualContributorMutationHookResult = ReturnType<
  typeof useRemoveRoleFromVirtualContributorMutation
>;
export type RemoveRoleFromVirtualContributorMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveRoleFromVirtualContributorMutation>;
export type RemoveRoleFromVirtualContributorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveRoleFromVirtualContributorMutation,
  SchemaTypes.RemoveRoleFromVirtualContributorMutationVariables
>;
export const RoleSetAuthorizationDocument = gql`
  query RoleSetAuthorization($roleSetId: UUID!) {
    platform {
      authorization {
        myPrivileges
      }
    }
    lookup {
      roleSet(ID: $roleSetId) {
        id
        authorization {
          id
          myPrivileges
        }
        roleNames
      }
    }
  }
`;

/**
 * __useRoleSetAuthorizationQuery__
 *
 * To run a query within a React component, call `useRoleSetAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useRoleSetAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoleSetAuthorizationQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *   },
 * });
 */
export function useRoleSetAuthorizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.RoleSetAuthorizationQuery,
    SchemaTypes.RoleSetAuthorizationQueryVariables
  > &
    ({ variables: SchemaTypes.RoleSetAuthorizationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RoleSetAuthorizationQuery, SchemaTypes.RoleSetAuthorizationQueryVariables>(
    RoleSetAuthorizationDocument,
    options
  );
}
export function useRoleSetAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RoleSetAuthorizationQuery,
    SchemaTypes.RoleSetAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RoleSetAuthorizationQuery, SchemaTypes.RoleSetAuthorizationQueryVariables>(
    RoleSetAuthorizationDocument,
    options
  );
}
export function useRoleSetAuthorizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.RoleSetAuthorizationQuery,
        SchemaTypes.RoleSetAuthorizationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.RoleSetAuthorizationQuery, SchemaTypes.RoleSetAuthorizationQueryVariables>(
    RoleSetAuthorizationDocument,
    options
  );
}
export type RoleSetAuthorizationQueryHookResult = ReturnType<typeof useRoleSetAuthorizationQuery>;
export type RoleSetAuthorizationLazyQueryHookResult = ReturnType<typeof useRoleSetAuthorizationLazyQuery>;
export type RoleSetAuthorizationSuspenseQueryHookResult = ReturnType<typeof useRoleSetAuthorizationSuspenseQuery>;
export type RoleSetAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.RoleSetAuthorizationQuery,
  SchemaTypes.RoleSetAuthorizationQueryVariables
>;
export function refetchRoleSetAuthorizationQuery(variables: SchemaTypes.RoleSetAuthorizationQueryVariables) {
  return { query: RoleSetAuthorizationDocument, variables: variables };
}
export const RoleSetRoleAssignmentDocument = gql`
  query RoleSetRoleAssignment(
    $roleSetId: UUID!
    $roles: [RoleName!]!
    $includeUsers: Boolean = false
    $includeOrganizations: Boolean = false
    $includeVirtualContributors: Boolean = false
    $includeRoleDefinitions: Boolean = false
  ) {
    lookup {
      roleSet(ID: $roleSetId) {
        id
        usersInRoles(roles: $roles) @include(if: $includeUsers) {
          role
          users {
            ...RoleSetMemberUser
          }
        }
        organizationsInRoles(roles: $roles) @include(if: $includeOrganizations) {
          role
          organizations {
            ...RoleSetMemberOrganization
          }
        }
        virtualContributorsInRoles(roles: $roles) @include(if: $includeVirtualContributors) {
          role
          virtualContributors {
            ...RoleSetMemberVirtualContributor
          }
        }
        roleDefinitions(roles: $roles) @include(if: $includeRoleDefinitions) {
          ...RoleDefinitionPolicy
        }
      }
    }
  }
  ${RoleSetMemberUserFragmentDoc}
  ${RoleSetMemberOrganizationFragmentDoc}
  ${RoleSetMemberVirtualContributorFragmentDoc}
  ${RoleDefinitionPolicyFragmentDoc}
`;

/**
 * __useRoleSetRoleAssignmentQuery__
 *
 * To run a query within a React component, call `useRoleSetRoleAssignmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useRoleSetRoleAssignmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoleSetRoleAssignmentQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      roles: // value for 'roles'
 *      includeUsers: // value for 'includeUsers'
 *      includeOrganizations: // value for 'includeOrganizations'
 *      includeVirtualContributors: // value for 'includeVirtualContributors'
 *      includeRoleDefinitions: // value for 'includeRoleDefinitions'
 *   },
 * });
 */
export function useRoleSetRoleAssignmentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.RoleSetRoleAssignmentQuery,
    SchemaTypes.RoleSetRoleAssignmentQueryVariables
  > &
    ({ variables: SchemaTypes.RoleSetRoleAssignmentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RoleSetRoleAssignmentQuery, SchemaTypes.RoleSetRoleAssignmentQueryVariables>(
    RoleSetRoleAssignmentDocument,
    options
  );
}
export function useRoleSetRoleAssignmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RoleSetRoleAssignmentQuery,
    SchemaTypes.RoleSetRoleAssignmentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RoleSetRoleAssignmentQuery, SchemaTypes.RoleSetRoleAssignmentQueryVariables>(
    RoleSetRoleAssignmentDocument,
    options
  );
}
export function useRoleSetRoleAssignmentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.RoleSetRoleAssignmentQuery,
        SchemaTypes.RoleSetRoleAssignmentQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.RoleSetRoleAssignmentQuery,
    SchemaTypes.RoleSetRoleAssignmentQueryVariables
  >(RoleSetRoleAssignmentDocument, options);
}
export type RoleSetRoleAssignmentQueryHookResult = ReturnType<typeof useRoleSetRoleAssignmentQuery>;
export type RoleSetRoleAssignmentLazyQueryHookResult = ReturnType<typeof useRoleSetRoleAssignmentLazyQuery>;
export type RoleSetRoleAssignmentSuspenseQueryHookResult = ReturnType<typeof useRoleSetRoleAssignmentSuspenseQuery>;
export type RoleSetRoleAssignmentQueryResult = Apollo.QueryResult<
  SchemaTypes.RoleSetRoleAssignmentQuery,
  SchemaTypes.RoleSetRoleAssignmentQueryVariables
>;
export function refetchRoleSetRoleAssignmentQuery(variables: SchemaTypes.RoleSetRoleAssignmentQueryVariables) {
  return { query: RoleSetRoleAssignmentDocument, variables: variables };
}
export const SubspaceCommunityAndRoleSetIdDocument = gql`
  query SubspaceCommunityAndRoleSetId($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        community {
          id
          roleSet {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useSubspaceCommunityAndRoleSetIdQuery__
 *
 * To run a query within a React component, call `useSubspaceCommunityAndRoleSetIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubspaceCommunityAndRoleSetIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspaceCommunityAndRoleSetIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSubspaceCommunityAndRoleSetIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
    SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
  > &
    ({ variables: SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
    SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
  >(SubspaceCommunityAndRoleSetIdDocument, options);
}
export function useSubspaceCommunityAndRoleSetIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
    SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
    SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
  >(SubspaceCommunityAndRoleSetIdDocument, options);
}
export function useSubspaceCommunityAndRoleSetIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
        SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
    SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
  >(SubspaceCommunityAndRoleSetIdDocument, options);
}
export type SubspaceCommunityAndRoleSetIdQueryHookResult = ReturnType<typeof useSubspaceCommunityAndRoleSetIdQuery>;
export type SubspaceCommunityAndRoleSetIdLazyQueryHookResult = ReturnType<
  typeof useSubspaceCommunityAndRoleSetIdLazyQuery
>;
export type SubspaceCommunityAndRoleSetIdSuspenseQueryHookResult = ReturnType<
  typeof useSubspaceCommunityAndRoleSetIdSuspenseQuery
>;
export type SubspaceCommunityAndRoleSetIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspaceCommunityAndRoleSetIdQuery,
  SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
>;
export function refetchSubspaceCommunityAndRoleSetIdQuery(
  variables: SchemaTypes.SubspaceCommunityAndRoleSetIdQueryVariables
) {
  return { query: SubspaceCommunityAndRoleSetIdDocument, variables: variables };
}
export const AccountInformationDocument = gql`
  query AccountInformation($accountId: UUID!) {
    lookup {
      account(ID: $accountId) {
        id
        externalSubscriptionID
        authorization {
          id
          myPrivileges
        }
        license {
          id
          availableEntitlements
          entitlements {
            type
            limit
            usage
          }
        }
        host {
          id
        }
        spaces {
          id
          level
          authorization {
            id
            myPrivileges
          }
          license {
            id
            availableEntitlements
          }
          about {
            id
            profile {
              id
              displayName
              url
              cardBanner: visual(type: CARD) {
                ...VisualModel
              }
              tagline
            }
            membership {
              myPrivileges
            }
          }
        }
        virtualContributors {
          id
          profile {
            ...AccountItemProfile
            tagline
          }
        }
        innovationPacks {
          id
          profile {
            ...AccountItemProfile
          }
          templatesSet {
            id
            calloutTemplatesCount
            spaceTemplatesCount
            communityGuidelinesTemplatesCount
            postTemplatesCount
            whiteboardTemplatesCount
          }
        }
        innovationHubs {
          id
          profile {
            ...AccountItemProfile
            banner: visual(type: BANNER_WIDE) {
              ...VisualModel
            }
          }
          subdomain
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
  ${AccountItemProfileFragmentDoc}
`;

/**
 * __useAccountInformationQuery__
 *
 * To run a query within a React component, call `useAccountInformationQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountInformationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountInformationQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useAccountInformationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AccountInformationQuery,
    SchemaTypes.AccountInformationQueryVariables
  > &
    ({ variables: SchemaTypes.AccountInformationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AccountInformationQuery, SchemaTypes.AccountInformationQueryVariables>(
    AccountInformationDocument,
    options
  );
}
export function useAccountInformationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AccountInformationQuery,
    SchemaTypes.AccountInformationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AccountInformationQuery, SchemaTypes.AccountInformationQueryVariables>(
    AccountInformationDocument,
    options
  );
}
export function useAccountInformationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.AccountInformationQuery, SchemaTypes.AccountInformationQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AccountInformationQuery, SchemaTypes.AccountInformationQueryVariables>(
    AccountInformationDocument,
    options
  );
}
export type AccountInformationQueryHookResult = ReturnType<typeof useAccountInformationQuery>;
export type AccountInformationLazyQueryHookResult = ReturnType<typeof useAccountInformationLazyQuery>;
export type AccountInformationSuspenseQueryHookResult = ReturnType<typeof useAccountInformationSuspenseQuery>;
export type AccountInformationQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountInformationQuery,
  SchemaTypes.AccountInformationQueryVariables
>;
export function refetchAccountInformationQuery(variables: SchemaTypes.AccountInformationQueryVariables) {
  return { query: AccountInformationDocument, variables: variables };
}
export const InnovationFlowSettingsDocument = gql`
  query InnovationFlowSettings($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        ...InnovationFlowCollaboration
        innovationFlow {
          ...InnovationFlowDetails
          settings {
            maximumNumberOfStates
            minimumNumberOfStates
          }
        }
      }
    }
  }
  ${InnovationFlowCollaborationFragmentDoc}
  ${InnovationFlowDetailsFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.InnovationFlowSettingsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useInnovationFlowSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationFlowSettingsQuery,
        SchemaTypes.InnovationFlowSettingsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationFlowSettingsQuery,
    SchemaTypes.InnovationFlowSettingsQueryVariables
  >(InnovationFlowSettingsDocument, options);
}
export type InnovationFlowSettingsQueryHookResult = ReturnType<typeof useInnovationFlowSettingsQuery>;
export type InnovationFlowSettingsLazyQueryHookResult = ReturnType<typeof useInnovationFlowSettingsLazyQuery>;
export type InnovationFlowSettingsSuspenseQueryHookResult = ReturnType<typeof useInnovationFlowSettingsSuspenseQuery>;
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
        id
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
  > &
    ({ variables: SchemaTypes.InnovationFlowDetailsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useInnovationFlowDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationFlowDetailsQuery,
        SchemaTypes.InnovationFlowDetailsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationFlowDetailsQuery,
    SchemaTypes.InnovationFlowDetailsQueryVariables
  >(InnovationFlowDetailsDocument, options);
}
export type InnovationFlowDetailsQueryHookResult = ReturnType<typeof useInnovationFlowDetailsQuery>;
export type InnovationFlowDetailsLazyQueryHookResult = ReturnType<typeof useInnovationFlowDetailsLazyQuery>;
export type InnovationFlowDetailsSuspenseQueryHookResult = ReturnType<typeof useInnovationFlowDetailsSuspenseQuery>;
export type InnovationFlowDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowDetailsQuery,
  SchemaTypes.InnovationFlowDetailsQueryVariables
>;
export function refetchInnovationFlowDetailsQuery(variables: SchemaTypes.InnovationFlowDetailsQueryVariables) {
  return { query: InnovationFlowDetailsDocument, variables: variables };
}
export const UpdateCalloutFlowStateDocument = gql`
  mutation UpdateCalloutFlowState($calloutId: UUID!, $flowStateTagsetId: UUID!, $value: String!) {
    updateCallout(
      calloutData: { ID: $calloutId, classification: { tagsets: [{ ID: $flowStateTagsetId, tags: [$value] }] } }
    ) {
      id
      sortOrder
      classification {
        id
        flowState: tagset(tagsetName: FLOW_STATE) {
          ...TagsetDetails
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
export const UpdateCollaborationFromSpaceTemplateDocument = gql`
  mutation UpdateCollaborationFromSpaceTemplate(
    $collaborationId: UUID!
    $spaceTemplateId: UUID!
    $addCallouts: Boolean
  ) {
    updateCollaborationFromSpaceTemplate(
      updateData: { collaborationID: $collaborationId, spaceTemplateID: $spaceTemplateId, addCallouts: $addCallouts }
    ) {
      id
      innovationFlow {
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
  }
`;
export type UpdateCollaborationFromSpaceTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCollaborationFromSpaceTemplateMutation,
  SchemaTypes.UpdateCollaborationFromSpaceTemplateMutationVariables
>;

/**
 * __useUpdateCollaborationFromSpaceTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateCollaborationFromSpaceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCollaborationFromSpaceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCollaborationFromSpaceTemplateMutation, { data, loading, error }] = useUpdateCollaborationFromSpaceTemplateMutation({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *      spaceTemplateId: // value for 'spaceTemplateId'
 *      addCallouts: // value for 'addCallouts'
 *   },
 * });
 */
export function useUpdateCollaborationFromSpaceTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCollaborationFromSpaceTemplateMutation,
    SchemaTypes.UpdateCollaborationFromSpaceTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCollaborationFromSpaceTemplateMutation,
    SchemaTypes.UpdateCollaborationFromSpaceTemplateMutationVariables
  >(UpdateCollaborationFromSpaceTemplateDocument, options);
}
export type UpdateCollaborationFromSpaceTemplateMutationHookResult = ReturnType<
  typeof useUpdateCollaborationFromSpaceTemplateMutation
>;
export type UpdateCollaborationFromSpaceTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateCollaborationFromSpaceTemplateMutation>;
export type UpdateCollaborationFromSpaceTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCollaborationFromSpaceTemplateMutation,
  SchemaTypes.UpdateCollaborationFromSpaceTemplateMutationVariables
>;
export const UpdateInnovationFlowDocument = gql`
  mutation UpdateInnovationFlow($input: UpdateInnovationFlowInput!) {
    updateInnovationFlow(innovationFlowData: $input) {
      id
      profile {
        id
        displayName
      }
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
 *      input: // value for 'input'
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
export const UpdateInnovationFlowCurrentStateDocument = gql`
  mutation UpdateInnovationFlowCurrentState($innovationFlowId: UUID!, $currentStateId: UUID!) {
    updateInnovationFlowCurrentState(
      innovationFlowStateData: { innovationFlowID: $innovationFlowId, currentStateID: $currentStateId }
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
 *      currentStateId: // value for 'currentStateId'
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
export const CreateStateOnInnovationFlowDocument = gql`
  mutation CreateStateOnInnovationFlow($stateData: CreateStateOnInnovationFlowInput!) {
    createStateOnInnovationFlow(stateData: $stateData) {
      id
      displayName
      description
      settings {
        allowNewCallouts
      }
    }
  }
`;
export type CreateStateOnInnovationFlowMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateStateOnInnovationFlowMutation,
  SchemaTypes.CreateStateOnInnovationFlowMutationVariables
>;

/**
 * __useCreateStateOnInnovationFlowMutation__
 *
 * To run a mutation, you first call `useCreateStateOnInnovationFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateStateOnInnovationFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createStateOnInnovationFlowMutation, { data, loading, error }] = useCreateStateOnInnovationFlowMutation({
 *   variables: {
 *      stateData: // value for 'stateData'
 *   },
 * });
 */
export function useCreateStateOnInnovationFlowMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateStateOnInnovationFlowMutation,
    SchemaTypes.CreateStateOnInnovationFlowMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateStateOnInnovationFlowMutation,
    SchemaTypes.CreateStateOnInnovationFlowMutationVariables
  >(CreateStateOnInnovationFlowDocument, options);
}
export type CreateStateOnInnovationFlowMutationHookResult = ReturnType<typeof useCreateStateOnInnovationFlowMutation>;
export type CreateStateOnInnovationFlowMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateStateOnInnovationFlowMutation>;
export type CreateStateOnInnovationFlowMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateStateOnInnovationFlowMutation,
  SchemaTypes.CreateStateOnInnovationFlowMutationVariables
>;
export const DeleteStateOnInnovationFlowDocument = gql`
  mutation DeleteStateOnInnovationFlow($stateData: DeleteStateOnInnovationFlowInput!) {
    deleteStateOnInnovationFlow(stateData: $stateData) {
      id
    }
  }
`;
export type DeleteStateOnInnovationFlowMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteStateOnInnovationFlowMutation,
  SchemaTypes.DeleteStateOnInnovationFlowMutationVariables
>;

/**
 * __useDeleteStateOnInnovationFlowMutation__
 *
 * To run a mutation, you first call `useDeleteStateOnInnovationFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteStateOnInnovationFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteStateOnInnovationFlowMutation, { data, loading, error }] = useDeleteStateOnInnovationFlowMutation({
 *   variables: {
 *      stateData: // value for 'stateData'
 *   },
 * });
 */
export function useDeleteStateOnInnovationFlowMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteStateOnInnovationFlowMutation,
    SchemaTypes.DeleteStateOnInnovationFlowMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteStateOnInnovationFlowMutation,
    SchemaTypes.DeleteStateOnInnovationFlowMutationVariables
  >(DeleteStateOnInnovationFlowDocument, options);
}
export type DeleteStateOnInnovationFlowMutationHookResult = ReturnType<typeof useDeleteStateOnInnovationFlowMutation>;
export type DeleteStateOnInnovationFlowMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteStateOnInnovationFlowMutation>;
export type DeleteStateOnInnovationFlowMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteStateOnInnovationFlowMutation,
  SchemaTypes.DeleteStateOnInnovationFlowMutationVariables
>;
export const UpdateInnovationFlowStateDocument = gql`
  mutation UpdateInnovationFlowState(
    $innovationFlowStateId: UUID!
    $displayName: String!
    $description: Markdown!
    $settings: UpdateInnovationFlowStateSettingsInput
  ) {
    updateInnovationFlowState(
      stateData: {
        innovationFlowStateID: $innovationFlowStateId
        displayName: $displayName
        description: $description
        settings: $settings
      }
    ) {
      id
      displayName
      description
      settings {
        allowNewCallouts
      }
    }
  }
`;
export type UpdateInnovationFlowStateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowStateMutation,
  SchemaTypes.UpdateInnovationFlowStateMutationVariables
>;

/**
 * __useUpdateInnovationFlowStateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowStateMutation, { data, loading, error }] = useUpdateInnovationFlowStateMutation({
 *   variables: {
 *      innovationFlowStateId: // value for 'innovationFlowStateId'
 *      displayName: // value for 'displayName'
 *      description: // value for 'description'
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useUpdateInnovationFlowStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowStateMutation,
    SchemaTypes.UpdateInnovationFlowStateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowStateMutation,
    SchemaTypes.UpdateInnovationFlowStateMutationVariables
  >(UpdateInnovationFlowStateDocument, options);
}
export type UpdateInnovationFlowStateMutationHookResult = ReturnType<typeof useUpdateInnovationFlowStateMutation>;
export type UpdateInnovationFlowStateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowStateMutation>;
export type UpdateInnovationFlowStateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowStateMutation,
  SchemaTypes.UpdateInnovationFlowStateMutationVariables
>;
export const UpdateInnovationFlowStatesSortOrderDocument = gql`
  mutation UpdateInnovationFlowStatesSortOrder($innovationFlowID: UUID!, $stateIDs: [UUID!]!) {
    updateInnovationFlowStatesSortOrder(sortOrderData: { innovationFlowID: $innovationFlowID, stateIDs: $stateIDs }) {
      id
      sortOrder
    }
  }
`;
export type UpdateInnovationFlowStatesSortOrderMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowStatesSortOrderMutation,
  SchemaTypes.UpdateInnovationFlowStatesSortOrderMutationVariables
>;

/**
 * __useUpdateInnovationFlowStatesSortOrderMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowStatesSortOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowStatesSortOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowStatesSortOrderMutation, { data, loading, error }] = useUpdateInnovationFlowStatesSortOrderMutation({
 *   variables: {
 *      innovationFlowID: // value for 'innovationFlowID'
 *      stateIDs: // value for 'stateIDs'
 *   },
 * });
 */
export function useUpdateInnovationFlowStatesSortOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowStatesSortOrderMutation,
    SchemaTypes.UpdateInnovationFlowStatesSortOrderMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowStatesSortOrderMutation,
    SchemaTypes.UpdateInnovationFlowStatesSortOrderMutationVariables
  >(UpdateInnovationFlowStatesSortOrderDocument, options);
}
export type UpdateInnovationFlowStatesSortOrderMutationHookResult = ReturnType<
  typeof useUpdateInnovationFlowStatesSortOrderMutation
>;
export type UpdateInnovationFlowStatesSortOrderMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowStatesSortOrderMutation>;
export type UpdateInnovationFlowStatesSortOrderMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowStatesSortOrderMutation,
  SchemaTypes.UpdateInnovationFlowStatesSortOrderMutationVariables
>;
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
  > &
    ({ variables: SchemaTypes.ActivityCreatedSubscriptionVariables; skip?: boolean } | { skip: boolean })
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
      spaceDisplayName: parentDisplayName
      space {
        id
        about {
          ...SpaceAboutCardBanner
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
      ... on ActivityLogEntrySubspaceCreated {
        ...ActivityLogSubspaceCreated
      }
      ... on ActivityLogEntryUpdateSent {
        ...ActivityLogUpdateSent
      }
      ... on ActivityLogEntryCalendarEventCreated {
        ...ActivityLogCalendarEventCreated
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogSubspaceCreatedFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.ActivityLogOnCollaborationQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useActivityLogOnCollaborationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ActivityLogOnCollaborationQuery,
        SchemaTypes.ActivityLogOnCollaborationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ActivityLogOnCollaborationQuery,
    SchemaTypes.ActivityLogOnCollaborationQueryVariables
  >(ActivityLogOnCollaborationDocument, options);
}
export type ActivityLogOnCollaborationQueryHookResult = ReturnType<typeof useActivityLogOnCollaborationQuery>;
export type ActivityLogOnCollaborationLazyQueryHookResult = ReturnType<typeof useActivityLogOnCollaborationLazyQuery>;
export type ActivityLogOnCollaborationSuspenseQueryHookResult = ReturnType<
  typeof useActivityLogOnCollaborationSuspenseQuery
>;
export type ActivityLogOnCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.ActivityLogOnCollaborationQuery,
  SchemaTypes.ActivityLogOnCollaborationQueryVariables
>;
export function refetchActivityLogOnCollaborationQuery(
  variables: SchemaTypes.ActivityLogOnCollaborationQueryVariables
) {
  return { query: ActivityLogOnCollaborationDocument, variables: variables };
}
export const CalloutContentDocument = gql`
  query CalloutContent($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        framing {
          id
          profile {
            id
            displayName
            description
            tagsets {
              ...TagsetDetails
            }
            references {
              ...ReferenceDetails
            }
          }
          type
          whiteboard {
            id
            profile {
              id
              displayName
              preview: visual(type: BANNER) {
                id
                name
                uri
              }
            }
            content
          }
          memo {
            id
            profile {
              id
              displayName
              preview: visual(type: BANNER) {
                id
                name
                uri
              }
            }
            markdown
          }
          link {
            ...LinkDetails
          }
        }
        contributionDefaults {
          id
          defaultDisplayName
          postDescription
          whiteboardContent
        }
        settings {
          ...CalloutSettingsFull
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${LinkDetailsFragmentDoc}
  ${CalloutSettingsFullFragmentDoc}
`;

/**
 * __useCalloutContentQuery__
 *
 * To run a query within a React component, call `useCalloutContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutContentQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutContentQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables> &
    ({ variables: SchemaTypes.CalloutContentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>(
    CalloutContentDocument,
    options
  );
}
export function useCalloutContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>(
    CalloutContentDocument,
    options
  );
}
export function useCalloutContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>(
    CalloutContentDocument,
    options
  );
}
export type CalloutContentQueryHookResult = ReturnType<typeof useCalloutContentQuery>;
export type CalloutContentLazyQueryHookResult = ReturnType<typeof useCalloutContentLazyQuery>;
export type CalloutContentSuspenseQueryHookResult = ReturnType<typeof useCalloutContentSuspenseQuery>;
export type CalloutContentQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContentQuery,
  SchemaTypes.CalloutContentQueryVariables
>;
export function refetchCalloutContentQuery(variables: SchemaTypes.CalloutContentQueryVariables) {
  return { query: CalloutContentDocument, variables: variables };
}
export const UpdateCalloutContentDocument = gql`
  mutation UpdateCalloutContent($calloutData: UpdateCalloutEntityInput!) {
    updateCallout(calloutData: $calloutData) {
      ...CalloutDetails
    }
  }
  ${CalloutDetailsFragmentDoc}
`;
export type UpdateCalloutContentMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutContentMutation,
  SchemaTypes.UpdateCalloutContentMutationVariables
>;

/**
 * __useUpdateCalloutContentMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutContentMutation, { data, loading, error }] = useUpdateCalloutContentMutation({
 *   variables: {
 *      calloutData: // value for 'calloutData'
 *   },
 * });
 */
export function useUpdateCalloutContentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutContentMutation,
    SchemaTypes.UpdateCalloutContentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCalloutContentMutation,
    SchemaTypes.UpdateCalloutContentMutationVariables
  >(UpdateCalloutContentDocument, options);
}
export type UpdateCalloutContentMutationHookResult = ReturnType<typeof useUpdateCalloutContentMutation>;
export type UpdateCalloutContentMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutContentMutation>;
export type UpdateCalloutContentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutContentMutation,
  SchemaTypes.UpdateCalloutContentMutationVariables
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
export const CalloutContributionDocument = gql`
  query CalloutContribution(
    $contributionId: UUID!
    $includeLink: Boolean! = false
    $includeWhiteboard: Boolean! = false
    $includePost: Boolean! = false
  ) {
    lookup {
      contribution(ID: $contributionId) {
        id
        sortOrder
        authorization {
          id
          myPrivileges
        }
        link @include(if: $includeLink) {
          ...LinkDetailsWithAuthorization
        }
        whiteboard @include(if: $includeWhiteboard) {
          id
          profile {
            id
            url
            displayName
            preview: visual(type: BANNER) {
              ...VisualModel
            }
          }
          createdDate
          createdBy {
            id
            profile {
              id
              displayName
            }
          }
        }
        post @include(if: $includePost) {
          id
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
              ...VisualModel
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
      }
    }
  }
  ${LinkDetailsWithAuthorizationFragmentDoc}
  ${VisualModelFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __useCalloutContributionQuery__
 *
 * To run a query within a React component, call `useCalloutContributionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutContributionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutContributionQuery({
 *   variables: {
 *      contributionId: // value for 'contributionId'
 *      includeLink: // value for 'includeLink'
 *      includeWhiteboard: // value for 'includeWhiteboard'
 *      includePost: // value for 'includePost'
 *   },
 * });
 */
export function useCalloutContributionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutContributionQuery,
    SchemaTypes.CalloutContributionQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutContributionQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutContributionQuery, SchemaTypes.CalloutContributionQueryVariables>(
    CalloutContributionDocument,
    options
  );
}
export function useCalloutContributionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutContributionQuery,
    SchemaTypes.CalloutContributionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutContributionQuery, SchemaTypes.CalloutContributionQueryVariables>(
    CalloutContributionDocument,
    options
  );
}
export function useCalloutContributionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutContributionQuery,
        SchemaTypes.CalloutContributionQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutContributionQuery, SchemaTypes.CalloutContributionQueryVariables>(
    CalloutContributionDocument,
    options
  );
}
export type CalloutContributionQueryHookResult = ReturnType<typeof useCalloutContributionQuery>;
export type CalloutContributionLazyQueryHookResult = ReturnType<typeof useCalloutContributionLazyQuery>;
export type CalloutContributionSuspenseQueryHookResult = ReturnType<typeof useCalloutContributionSuspenseQuery>;
export type CalloutContributionQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContributionQuery,
  SchemaTypes.CalloutContributionQueryVariables
>;
export function refetchCalloutContributionQuery(variables: SchemaTypes.CalloutContributionQueryVariables) {
  return { query: CalloutContributionDocument, variables: variables };
}
export const CalloutContributionsSortOrderDocument = gql`
  query CalloutContributionsSortOrder($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions {
          id
          sortOrder
          link {
            id
            profile {
              id
              displayName
            }
          }
          whiteboard {
            id
            profile {
              id
              displayName
            }
          }
          post {
            id
            profile {
              id
              displayName
            }
            comments {
              id
              messagesCount
            }
          }
        }
      }
    }
  }
`;

/**
 * __useCalloutContributionsSortOrderQuery__
 *
 * To run a query within a React component, call `useCalloutContributionsSortOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutContributionsSortOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutContributionsSortOrderQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutContributionsSortOrderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutContributionsSortOrderQuery,
    SchemaTypes.CalloutContributionsSortOrderQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutContributionsSortOrderQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutContributionsSortOrderQuery,
    SchemaTypes.CalloutContributionsSortOrderQueryVariables
  >(CalloutContributionsSortOrderDocument, options);
}
export function useCalloutContributionsSortOrderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutContributionsSortOrderQuery,
    SchemaTypes.CalloutContributionsSortOrderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutContributionsSortOrderQuery,
    SchemaTypes.CalloutContributionsSortOrderQueryVariables
  >(CalloutContributionsSortOrderDocument, options);
}
export function useCalloutContributionsSortOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutContributionsSortOrderQuery,
        SchemaTypes.CalloutContributionsSortOrderQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CalloutContributionsSortOrderQuery,
    SchemaTypes.CalloutContributionsSortOrderQueryVariables
  >(CalloutContributionsSortOrderDocument, options);
}
export type CalloutContributionsSortOrderQueryHookResult = ReturnType<typeof useCalloutContributionsSortOrderQuery>;
export type CalloutContributionsSortOrderLazyQueryHookResult = ReturnType<
  typeof useCalloutContributionsSortOrderLazyQuery
>;
export type CalloutContributionsSortOrderSuspenseQueryHookResult = ReturnType<
  typeof useCalloutContributionsSortOrderSuspenseQuery
>;
export type CalloutContributionsSortOrderQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContributionsSortOrderQuery,
  SchemaTypes.CalloutContributionsSortOrderQueryVariables
>;
export function refetchCalloutContributionsSortOrderQuery(
  variables: SchemaTypes.CalloutContributionsSortOrderQueryVariables
) {
  return { query: CalloutContributionsSortOrderDocument, variables: variables };
}
export const UpdateContributionsSortOrderDocument = gql`
  mutation UpdateContributionsSortOrder($calloutID: UUID!, $contributionIds: [UUID!]!) {
    updateContributionsSortOrder(sortOrderData: { calloutID: $calloutID, contributionIDs: $contributionIds }) {
      id
      sortOrder
    }
  }
`;
export type UpdateContributionsSortOrderMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateContributionsSortOrderMutation,
  SchemaTypes.UpdateContributionsSortOrderMutationVariables
>;

/**
 * __useUpdateContributionsSortOrderMutation__
 *
 * To run a mutation, you first call `useUpdateContributionsSortOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateContributionsSortOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateContributionsSortOrderMutation, { data, loading, error }] = useUpdateContributionsSortOrderMutation({
 *   variables: {
 *      calloutID: // value for 'calloutID'
 *      contributionIds: // value for 'contributionIds'
 *   },
 * });
 */
export function useUpdateContributionsSortOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateContributionsSortOrderMutation,
    SchemaTypes.UpdateContributionsSortOrderMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateContributionsSortOrderMutation,
    SchemaTypes.UpdateContributionsSortOrderMutationVariables
  >(UpdateContributionsSortOrderDocument, options);
}
export type UpdateContributionsSortOrderMutationHookResult = ReturnType<typeof useUpdateContributionsSortOrderMutation>;
export type UpdateContributionsSortOrderMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateContributionsSortOrderMutation>;
export type UpdateContributionsSortOrderMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateContributionsSortOrderMutation,
  SchemaTypes.UpdateContributionsSortOrderMutationVariables
>;
export const CalloutContributionCommentsDocument = gql`
  query CalloutContributionComments($contributionId: UUID!, $includePost: Boolean = false) {
    lookup {
      contribution(ID: $contributionId) {
        id
        post @include(if: $includePost) {
          id
          comments {
            ...CommentsWithMessages
          }
        }
      }
    }
  }
  ${CommentsWithMessagesFragmentDoc}
`;

/**
 * __useCalloutContributionCommentsQuery__
 *
 * To run a query within a React component, call `useCalloutContributionCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutContributionCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutContributionCommentsQuery({
 *   variables: {
 *      contributionId: // value for 'contributionId'
 *      includePost: // value for 'includePost'
 *   },
 * });
 */
export function useCalloutContributionCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutContributionCommentsQuery,
    SchemaTypes.CalloutContributionCommentsQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutContributionCommentsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutContributionCommentsQuery,
    SchemaTypes.CalloutContributionCommentsQueryVariables
  >(CalloutContributionCommentsDocument, options);
}
export function useCalloutContributionCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutContributionCommentsQuery,
    SchemaTypes.CalloutContributionCommentsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutContributionCommentsQuery,
    SchemaTypes.CalloutContributionCommentsQueryVariables
  >(CalloutContributionCommentsDocument, options);
}
export function useCalloutContributionCommentsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutContributionCommentsQuery,
        SchemaTypes.CalloutContributionCommentsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CalloutContributionCommentsQuery,
    SchemaTypes.CalloutContributionCommentsQueryVariables
  >(CalloutContributionCommentsDocument, options);
}
export type CalloutContributionCommentsQueryHookResult = ReturnType<typeof useCalloutContributionCommentsQuery>;
export type CalloutContributionCommentsLazyQueryHookResult = ReturnType<typeof useCalloutContributionCommentsLazyQuery>;
export type CalloutContributionCommentsSuspenseQueryHookResult = ReturnType<
  typeof useCalloutContributionCommentsSuspenseQuery
>;
export type CalloutContributionCommentsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContributionCommentsQuery,
  SchemaTypes.CalloutContributionCommentsQueryVariables
>;
export function refetchCalloutContributionCommentsQuery(
  variables: SchemaTypes.CalloutContributionCommentsQueryVariables
) {
  return { query: CalloutContributionCommentsDocument, variables: variables };
}
export const DeleteContributionDocument = gql`
  mutation DeleteContribution($contributionId: UUID!) {
    deleteContribution(deleteData: { ID: $contributionId }) {
      id
    }
  }
`;
export type DeleteContributionMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteContributionMutation,
  SchemaTypes.DeleteContributionMutationVariables
>;

/**
 * __useDeleteContributionMutation__
 *
 * To run a mutation, you first call `useDeleteContributionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteContributionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteContributionMutation, { data, loading, error }] = useDeleteContributionMutation({
 *   variables: {
 *      contributionId: // value for 'contributionId'
 *   },
 * });
 */
export function useDeleteContributionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteContributionMutation,
    SchemaTypes.DeleteContributionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteContributionMutation, SchemaTypes.DeleteContributionMutationVariables>(
    DeleteContributionDocument,
    options
  );
}
export type DeleteContributionMutationHookResult = ReturnType<typeof useDeleteContributionMutation>;
export type DeleteContributionMutationResult = Apollo.MutationResult<SchemaTypes.DeleteContributionMutation>;
export type DeleteContributionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteContributionMutation,
  SchemaTypes.DeleteContributionMutationVariables
>;
export const CreateLinkOnCalloutDocument = gql`
  mutation CreateLinkOnCallout($calloutId: UUID!, $link: CreateLinkInput!) {
    createContributionOnCallout(contributionData: { calloutID: $calloutId, type: LINK, link: $link }) {
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
 *      calloutId: // value for 'calloutId'
 *      link: // value for 'link'
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
      contributionID
      sortOrder
      post {
        ...CalloutContributionsPostCard
      }
    }
  }
  ${CalloutContributionsPostCardFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.CalloutPostCreatedSubscriptionVariables; skip?: boolean } | { skip: boolean })
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
export const CreatePostOnCalloutDocument = gql`
  mutation CreatePostOnCallout($calloutId: UUID!, $post: CreatePostInput!) {
    createContributionOnCallout(contributionData: { calloutID: $calloutId, type: POST, post: $post }) {
      post {
        id
        profile {
          id
          url
        }
      }
    }
  }
`;
export type CreatePostOnCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreatePostOnCalloutMutation,
  SchemaTypes.CreatePostOnCalloutMutationVariables
>;

/**
 * __useCreatePostOnCalloutMutation__
 *
 * To run a mutation, you first call `useCreatePostOnCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostOnCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostOnCalloutMutation, { data, loading, error }] = useCreatePostOnCalloutMutation({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      post: // value for 'post'
 *   },
 * });
 */
export function useCreatePostOnCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreatePostOnCalloutMutation,
    SchemaTypes.CreatePostOnCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreatePostOnCalloutMutation, SchemaTypes.CreatePostOnCalloutMutationVariables>(
    CreatePostOnCalloutDocument,
    options
  );
}
export type CreatePostOnCalloutMutationHookResult = ReturnType<typeof useCreatePostOnCalloutMutation>;
export type CreatePostOnCalloutMutationResult = Apollo.MutationResult<SchemaTypes.CreatePostOnCalloutMutation>;
export type CreatePostOnCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreatePostOnCalloutMutation,
  SchemaTypes.CreatePostOnCalloutMutationVariables
>;
export const CalloutContributionsDocument = gql`
  query CalloutContributions(
    $calloutId: UUID!
    $includeLink: Boolean! = false
    $includeWhiteboard: Boolean! = false
    $includePost: Boolean! = false
    $filter: [CalloutContributionType!] = [LINK, WHITEBOARD, POST]
    $limit: Int
  ) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions(filter: { types: $filter }, limit: $limit) {
          id
          sortOrder
          link @include(if: $includeLink) {
            ...LinkDetailsWithAuthorization
          }
          whiteboard @include(if: $includeWhiteboard) {
            ...CalloutContributionsWhiteboardCard
          }
          post @include(if: $includePost) {
            ...CalloutContributionsPostCard
          }
        }
        contributionsCount {
          link @include(if: $includeLink)
          whiteboard @include(if: $includeWhiteboard)
          post @include(if: $includePost)
        }
      }
    }
  }
  ${LinkDetailsWithAuthorizationFragmentDoc}
  ${CalloutContributionsWhiteboardCardFragmentDoc}
  ${CalloutContributionsPostCardFragmentDoc}
`;

/**
 * __useCalloutContributionsQuery__
 *
 * To run a query within a React component, call `useCalloutContributionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutContributionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutContributionsQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *      includeLink: // value for 'includeLink'
 *      includeWhiteboard: // value for 'includeWhiteboard'
 *      includePost: // value for 'includePost'
 *      filter: // value for 'filter'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useCalloutContributionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutContributionsQuery,
    SchemaTypes.CalloutContributionsQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutContributionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutContributionsQuery, SchemaTypes.CalloutContributionsQueryVariables>(
    CalloutContributionsDocument,
    options
  );
}
export function useCalloutContributionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutContributionsQuery,
    SchemaTypes.CalloutContributionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutContributionsQuery, SchemaTypes.CalloutContributionsQueryVariables>(
    CalloutContributionsDocument,
    options
  );
}
export function useCalloutContributionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutContributionsQuery,
        SchemaTypes.CalloutContributionsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutContributionsQuery, SchemaTypes.CalloutContributionsQueryVariables>(
    CalloutContributionsDocument,
    options
  );
}
export type CalloutContributionsQueryHookResult = ReturnType<typeof useCalloutContributionsQuery>;
export type CalloutContributionsLazyQueryHookResult = ReturnType<typeof useCalloutContributionsLazyQuery>;
export type CalloutContributionsSuspenseQueryHookResult = ReturnType<typeof useCalloutContributionsSuspenseQuery>;
export type CalloutContributionsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContributionsQuery,
  SchemaTypes.CalloutContributionsQueryVariables
>;
export function refetchCalloutContributionsQuery(variables: SchemaTypes.CalloutContributionsQueryVariables) {
  return { query: CalloutContributionsDocument, variables: variables };
}
export const CreateWhiteboardOnCalloutDocument = gql`
  mutation CreateWhiteboardOnCallout($calloutId: UUID!, $whiteboard: CreateWhiteboardInput!) {
    createContributionOnCallout(
      contributionData: { calloutID: $calloutId, type: WHITEBOARD, whiteboard: $whiteboard }
    ) {
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
 *      calloutId: // value for 'calloutId'
 *      whiteboard: // value for 'whiteboard'
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
export const UpdateCalloutsSortOrderDocument = gql`
  mutation UpdateCalloutsSortOrder($calloutsSetID: UUID!, $calloutIds: [UUID!]!) {
    updateCalloutsSortOrder(sortOrderData: { calloutsSetID: $calloutsSetID, calloutIDs: $calloutIds }) {
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
 *      calloutsSetID: // value for 'calloutsSetID'
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
export const CalloutsSetAuthorizationDocument = gql`
  query CalloutsSetAuthorization($calloutsSetId: UUID!) {
    lookup {
      calloutsSet(ID: $calloutsSetId) {
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
 * __useCalloutsSetAuthorizationQuery__
 *
 * To run a query within a React component, call `useCalloutsSetAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutsSetAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutsSetAuthorizationQuery({
 *   variables: {
 *      calloutsSetId: // value for 'calloutsSetId'
 *   },
 * });
 */
export function useCalloutsSetAuthorizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutsSetAuthorizationQuery,
    SchemaTypes.CalloutsSetAuthorizationQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutsSetAuthorizationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutsSetAuthorizationQuery, SchemaTypes.CalloutsSetAuthorizationQueryVariables>(
    CalloutsSetAuthorizationDocument,
    options
  );
}
export function useCalloutsSetAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutsSetAuthorizationQuery,
    SchemaTypes.CalloutsSetAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutsSetAuthorizationQuery,
    SchemaTypes.CalloutsSetAuthorizationQueryVariables
  >(CalloutsSetAuthorizationDocument, options);
}
export function useCalloutsSetAuthorizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutsSetAuthorizationQuery,
        SchemaTypes.CalloutsSetAuthorizationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CalloutsSetAuthorizationQuery,
    SchemaTypes.CalloutsSetAuthorizationQueryVariables
  >(CalloutsSetAuthorizationDocument, options);
}
export type CalloutsSetAuthorizationQueryHookResult = ReturnType<typeof useCalloutsSetAuthorizationQuery>;
export type CalloutsSetAuthorizationLazyQueryHookResult = ReturnType<typeof useCalloutsSetAuthorizationLazyQuery>;
export type CalloutsSetAuthorizationSuspenseQueryHookResult = ReturnType<
  typeof useCalloutsSetAuthorizationSuspenseQuery
>;
export type CalloutsSetAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutsSetAuthorizationQuery,
  SchemaTypes.CalloutsSetAuthorizationQueryVariables
>;
export function refetchCalloutsSetAuthorizationQuery(variables: SchemaTypes.CalloutsSetAuthorizationQueryVariables) {
  return { query: CalloutsSetAuthorizationDocument, variables: variables };
}
export const CreateCalloutDocument = gql`
  mutation createCallout($calloutData: CreateCalloutOnCalloutsSetInput!) {
    createCalloutOnCalloutsSet(calloutData: $calloutData) {
      ...CalloutDetails
      nameID
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
export const CalloutsOnCalloutsSetUsingClassificationDocument = gql`
  query CalloutsOnCalloutsSetUsingClassification(
    $calloutsSetId: UUID!
    $classificationTagsets: [TagsetArgs!] = []
    $withClassification: Boolean = true
  ) {
    lookup {
      calloutsSet(ID: $calloutsSetId) {
        id
        authorization {
          id
          myPrivileges
        }
        callouts(classificationTagsets: $classificationTagsets) {
          ...Callout
          ...ClassificationDetails @include(if: $withClassification)
        }
      }
    }
  }
  ${CalloutFragmentDoc}
  ${ClassificationDetailsFragmentDoc}
`;

/**
 * __useCalloutsOnCalloutsSetUsingClassificationQuery__
 *
 * To run a query within a React component, call `useCalloutsOnCalloutsSetUsingClassificationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutsOnCalloutsSetUsingClassificationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutsOnCalloutsSetUsingClassificationQuery({
 *   variables: {
 *      calloutsSetId: // value for 'calloutsSetId'
 *      classificationTagsets: // value for 'classificationTagsets'
 *      withClassification: // value for 'withClassification'
 *   },
 * });
 */
export function useCalloutsOnCalloutsSetUsingClassificationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
  > &
    (
      | { variables: SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
  >(CalloutsOnCalloutsSetUsingClassificationDocument, options);
}
export function useCalloutsOnCalloutsSetUsingClassificationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
  >(CalloutsOnCalloutsSetUsingClassificationDocument, options);
}
export function useCalloutsOnCalloutsSetUsingClassificationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
        SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
    SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
  >(CalloutsOnCalloutsSetUsingClassificationDocument, options);
}
export type CalloutsOnCalloutsSetUsingClassificationQueryHookResult = ReturnType<
  typeof useCalloutsOnCalloutsSetUsingClassificationQuery
>;
export type CalloutsOnCalloutsSetUsingClassificationLazyQueryHookResult = ReturnType<
  typeof useCalloutsOnCalloutsSetUsingClassificationLazyQuery
>;
export type CalloutsOnCalloutsSetUsingClassificationSuspenseQueryHookResult = ReturnType<
  typeof useCalloutsOnCalloutsSetUsingClassificationSuspenseQuery
>;
export type CalloutsOnCalloutsSetUsingClassificationQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQuery,
  SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
>;
export function refetchCalloutsOnCalloutsSetUsingClassificationQuery(
  variables: SchemaTypes.CalloutsOnCalloutsSetUsingClassificationQueryVariables
) {
  return { query: CalloutsOnCalloutsSetUsingClassificationDocument, variables: variables };
}
export const CalloutDetailsDocument = gql`
  query CalloutDetails($calloutId: UUID!, $withClassification: Boolean = true) {
    lookup {
      callout(ID: $calloutId) {
        ...CalloutDetails
        ...ClassificationDetails @include(if: $withClassification)
      }
    }
  }
  ${CalloutDetailsFragmentDoc}
  ${ClassificationDetailsFragmentDoc}
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
 *      withClassification: // value for 'withClassification'
 *   },
 * });
 */
export function useCalloutDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables> &
    ({ variables: SchemaTypes.CalloutDetailsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCalloutDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutDetailsQuery, SchemaTypes.CalloutDetailsQueryVariables>(
    CalloutDetailsDocument,
    options
  );
}
export type CalloutDetailsQueryHookResult = ReturnType<typeof useCalloutDetailsQuery>;
export type CalloutDetailsLazyQueryHookResult = ReturnType<typeof useCalloutDetailsLazyQuery>;
export type CalloutDetailsSuspenseQueryHookResult = ReturnType<typeof useCalloutDetailsSuspenseQuery>;
export type CalloutDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutDetailsQuery,
  SchemaTypes.CalloutDetailsQueryVariables
>;
export function refetchCalloutDetailsQuery(variables: SchemaTypes.CalloutDetailsQueryVariables) {
  return { query: CalloutDetailsDocument, variables: variables };
}
export const MemoMarkdownDocument = gql`
  query MemoMarkdown($id: UUID!) {
    lookup {
      memo(ID: $id) {
        id
        markdown
      }
    }
  }
`;

/**
 * __useMemoMarkdownQuery__
 *
 * To run a query within a React component, call `useMemoMarkdownQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemoMarkdownQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemoMarkdownQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMemoMarkdownQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables> &
    ({ variables: SchemaTypes.MemoMarkdownQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables>(
    MemoMarkdownDocument,
    options
  );
}
export function useMemoMarkdownLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables>(
    MemoMarkdownDocument,
    options
  );
}
export function useMemoMarkdownSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MemoMarkdownQuery, SchemaTypes.MemoMarkdownQueryVariables>(
    MemoMarkdownDocument,
    options
  );
}
export type MemoMarkdownQueryHookResult = ReturnType<typeof useMemoMarkdownQuery>;
export type MemoMarkdownLazyQueryHookResult = ReturnType<typeof useMemoMarkdownLazyQuery>;
export type MemoMarkdownSuspenseQueryHookResult = ReturnType<typeof useMemoMarkdownSuspenseQuery>;
export type MemoMarkdownQueryResult = Apollo.QueryResult<
  SchemaTypes.MemoMarkdownQuery,
  SchemaTypes.MemoMarkdownQueryVariables
>;
export function refetchMemoMarkdownQuery(variables: SchemaTypes.MemoMarkdownQueryVariables) {
  return { query: MemoMarkdownDocument, variables: variables };
}
export const MemoDetailsDocument = gql`
  query memoDetails($id: UUID!) {
    lookup {
      memo(ID: $id) {
        ...MemoDetails
      }
    }
  }
  ${MemoDetailsFragmentDoc}
`;

/**
 * __useMemoDetailsQuery__
 *
 * To run a query within a React component, call `useMemoDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemoDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemoDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMemoDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables> &
    ({ variables: SchemaTypes.MemoDetailsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables>(
    MemoDetailsDocument,
    options
  );
}
export function useMemoDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables>(
    MemoDetailsDocument,
    options
  );
}
export function useMemoDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MemoDetailsQuery, SchemaTypes.MemoDetailsQueryVariables>(
    MemoDetailsDocument,
    options
  );
}
export type MemoDetailsQueryHookResult = ReturnType<typeof useMemoDetailsQuery>;
export type MemoDetailsLazyQueryHookResult = ReturnType<typeof useMemoDetailsLazyQuery>;
export type MemoDetailsSuspenseQueryHookResult = ReturnType<typeof useMemoDetailsSuspenseQuery>;
export type MemoDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.MemoDetailsQuery,
  SchemaTypes.MemoDetailsQueryVariables
>;
export function refetchMemoDetailsQuery(variables: SchemaTypes.MemoDetailsQueryVariables) {
  return { query: MemoDetailsDocument, variables: variables };
}
export const CalloutSettingsDocument = gql`
  query CalloutSettings($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        settings {
          contribution {
            commentsEnabled
          }
        }
      }
    }
  }
`;

/**
 * __useCalloutSettingsQuery__
 *
 * To run a query within a React component, call `useCalloutSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutSettingsQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCalloutSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables> &
    ({ variables: SchemaTypes.CalloutSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables>(
    CalloutSettingsDocument,
    options
  );
}
export function useCalloutSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables>(
    CalloutSettingsDocument,
    options
  );
}
export function useCalloutSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutSettingsQuery, SchemaTypes.CalloutSettingsQueryVariables>(
    CalloutSettingsDocument,
    options
  );
}
export type CalloutSettingsQueryHookResult = ReturnType<typeof useCalloutSettingsQuery>;
export type CalloutSettingsLazyQueryHookResult = ReturnType<typeof useCalloutSettingsLazyQuery>;
export type CalloutSettingsSuspenseQueryHookResult = ReturnType<typeof useCalloutSettingsSuspenseQuery>;
export type CalloutSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutSettingsQuery,
  SchemaTypes.CalloutSettingsQueryVariables
>;
export function refetchCalloutSettingsQuery(variables: SchemaTypes.CalloutSettingsQueryVariables) {
  return { query: CalloutSettingsDocument, variables: variables };
}
export const PostCalloutsInCalloutSetDocument = gql`
  query PostCalloutsInCalloutSet($calloutsSetId: UUID!) {
    lookup {
      calloutsSet(ID: $calloutsSetId) {
        id
        callouts(withContributionTypes: [POST]) {
          id
          framing {
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
 * __usePostCalloutsInCalloutSetQuery__
 *
 * To run a query within a React component, call `usePostCalloutsInCalloutSetQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostCalloutsInCalloutSetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostCalloutsInCalloutSetQuery({
 *   variables: {
 *      calloutsSetId: // value for 'calloutsSetId'
 *   },
 * });
 */
export function usePostCalloutsInCalloutSetQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PostCalloutsInCalloutSetQuery,
    SchemaTypes.PostCalloutsInCalloutSetQueryVariables
  > &
    ({ variables: SchemaTypes.PostCalloutsInCalloutSetQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostCalloutsInCalloutSetQuery, SchemaTypes.PostCalloutsInCalloutSetQueryVariables>(
    PostCalloutsInCalloutSetDocument,
    options
  );
}
export function usePostCalloutsInCalloutSetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PostCalloutsInCalloutSetQuery,
    SchemaTypes.PostCalloutsInCalloutSetQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PostCalloutsInCalloutSetQuery,
    SchemaTypes.PostCalloutsInCalloutSetQueryVariables
  >(PostCalloutsInCalloutSetDocument, options);
}
export function usePostCalloutsInCalloutSetSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PostCalloutsInCalloutSetQuery,
        SchemaTypes.PostCalloutsInCalloutSetQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PostCalloutsInCalloutSetQuery,
    SchemaTypes.PostCalloutsInCalloutSetQueryVariables
  >(PostCalloutsInCalloutSetDocument, options);
}
export type PostCalloutsInCalloutSetQueryHookResult = ReturnType<typeof usePostCalloutsInCalloutSetQuery>;
export type PostCalloutsInCalloutSetLazyQueryHookResult = ReturnType<typeof usePostCalloutsInCalloutSetLazyQuery>;
export type PostCalloutsInCalloutSetSuspenseQueryHookResult = ReturnType<
  typeof usePostCalloutsInCalloutSetSuspenseQuery
>;
export type PostCalloutsInCalloutSetQueryResult = Apollo.QueryResult<
  SchemaTypes.PostCalloutsInCalloutSetQuery,
  SchemaTypes.PostCalloutsInCalloutSetQueryVariables
>;
export function refetchPostCalloutsInCalloutSetQuery(variables: SchemaTypes.PostCalloutsInCalloutSetQueryVariables) {
  return { query: PostCalloutsInCalloutSetDocument, variables: variables };
}
export const UpdatePostDocument = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(postData: $input) {
      id
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
export const DeletePostDocument = gql`
  mutation DeletePost($postId: UUID!) {
    deletePost(deleteData: { ID: $postId }) {
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
 *      postId: // value for 'postId'
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
export const PostSettingsDocument = gql`
  query PostSettings($postId: UUID!, $calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        ...PostSettingsCallout
      }
      post(ID: $postId) {
        ...PostSettings
      }
    }
  }
  ${PostSettingsCalloutFragmentDoc}
  ${PostSettingsFragmentDoc}
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
 *      postId: // value for 'postId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function usePostSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables> &
    ({ variables: SchemaTypes.PostSettingsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function usePostSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PostSettingsQuery, SchemaTypes.PostSettingsQueryVariables>(
    PostSettingsDocument,
    options
  );
}
export type PostSettingsQueryHookResult = ReturnType<typeof usePostSettingsQuery>;
export type PostSettingsLazyQueryHookResult = ReturnType<typeof usePostSettingsLazyQuery>;
export type PostSettingsSuspenseQueryHookResult = ReturnType<typeof usePostSettingsSuspenseQuery>;
export type PostSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.PostSettingsQuery,
  SchemaTypes.PostSettingsQueryVariables
>;
export function refetchPostSettingsQuery(variables: SchemaTypes.PostSettingsQueryVariables) {
  return { query: PostSettingsDocument, variables: variables };
}
export const ContentUpdatePolicyDocument = gql`
  query ContentUpdatePolicy($elementId: UUID!, $isWhiteboard: Boolean!, $isMemo: Boolean!) {
    lookup {
      whiteboard(ID: $elementId) @include(if: $isWhiteboard) {
        id
        contentUpdatePolicy
      }
      memo(ID: $elementId) @include(if: $isMemo) {
        id
        contentUpdatePolicy
      }
    }
  }
`;

/**
 * __useContentUpdatePolicyQuery__
 *
 * To run a query within a React component, call `useContentUpdatePolicyQuery` and pass it any options that fit your needs.
 * When your component renders, `useContentUpdatePolicyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContentUpdatePolicyQuery({
 *   variables: {
 *      elementId: // value for 'elementId'
 *      isWhiteboard: // value for 'isWhiteboard'
 *      isMemo: // value for 'isMemo'
 *   },
 * });
 */
export function useContentUpdatePolicyQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContentUpdatePolicyQuery,
    SchemaTypes.ContentUpdatePolicyQueryVariables
  > &
    ({ variables: SchemaTypes.ContentUpdatePolicyQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContentUpdatePolicyQuery, SchemaTypes.ContentUpdatePolicyQueryVariables>(
    ContentUpdatePolicyDocument,
    options
  );
}
export function useContentUpdatePolicyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContentUpdatePolicyQuery,
    SchemaTypes.ContentUpdatePolicyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContentUpdatePolicyQuery, SchemaTypes.ContentUpdatePolicyQueryVariables>(
    ContentUpdatePolicyDocument,
    options
  );
}
export function useContentUpdatePolicySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ContentUpdatePolicyQuery,
        SchemaTypes.ContentUpdatePolicyQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ContentUpdatePolicyQuery, SchemaTypes.ContentUpdatePolicyQueryVariables>(
    ContentUpdatePolicyDocument,
    options
  );
}
export type ContentUpdatePolicyQueryHookResult = ReturnType<typeof useContentUpdatePolicyQuery>;
export type ContentUpdatePolicyLazyQueryHookResult = ReturnType<typeof useContentUpdatePolicyLazyQuery>;
export type ContentUpdatePolicySuspenseQueryHookResult = ReturnType<typeof useContentUpdatePolicySuspenseQuery>;
export type ContentUpdatePolicyQueryResult = Apollo.QueryResult<
  SchemaTypes.ContentUpdatePolicyQuery,
  SchemaTypes.ContentUpdatePolicyQueryVariables
>;
export function refetchContentUpdatePolicyQuery(variables: SchemaTypes.ContentUpdatePolicyQueryVariables) {
  return { query: ContentUpdatePolicyDocument, variables: variables };
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
export const UpdateMemoContentUpdatePolicyDocument = gql`
  mutation UpdateMemoContentUpdatePolicy($memoId: UUID!, $contentUpdatePolicy: ContentUpdatePolicy!) {
    updateMemo(memoData: { ID: $memoId, contentUpdatePolicy: $contentUpdatePolicy }) {
      id
      contentUpdatePolicy
    }
  }
`;
export type UpdateMemoContentUpdatePolicyMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateMemoContentUpdatePolicyMutation,
  SchemaTypes.UpdateMemoContentUpdatePolicyMutationVariables
>;

/**
 * __useUpdateMemoContentUpdatePolicyMutation__
 *
 * To run a mutation, you first call `useUpdateMemoContentUpdatePolicyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemoContentUpdatePolicyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemoContentUpdatePolicyMutation, { data, loading, error }] = useUpdateMemoContentUpdatePolicyMutation({
 *   variables: {
 *      memoId: // value for 'memoId'
 *      contentUpdatePolicy: // value for 'contentUpdatePolicy'
 *   },
 * });
 */
export function useUpdateMemoContentUpdatePolicyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateMemoContentUpdatePolicyMutation,
    SchemaTypes.UpdateMemoContentUpdatePolicyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateMemoContentUpdatePolicyMutation,
    SchemaTypes.UpdateMemoContentUpdatePolicyMutationVariables
  >(UpdateMemoContentUpdatePolicyDocument, options);
}
export type UpdateMemoContentUpdatePolicyMutationHookResult = ReturnType<
  typeof useUpdateMemoContentUpdatePolicyMutation
>;
export type UpdateMemoContentUpdatePolicyMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateMemoContentUpdatePolicyMutation>;
export type UpdateMemoContentUpdatePolicyMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateMemoContentUpdatePolicyMutation,
  SchemaTypes.UpdateMemoContentUpdatePolicyMutationVariables
>;
export const WhiteboardFromCalloutDocument = gql`
  query WhiteboardFromCallout($calloutId: UUID!, $contributionId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        authorization {
          id
          myPrivileges
        }
        contributions(filter: { IDs: [$contributionId] }) {
          id
          whiteboard {
            ...WhiteboardDetails
          }
        }
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
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
 *      contributionId: // value for 'contributionId'
 *   },
 * });
 */
export function useWhiteboardFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardFromCalloutQuery,
    SchemaTypes.WhiteboardFromCalloutQueryVariables
  > &
    ({ variables: SchemaTypes.WhiteboardFromCalloutQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useWhiteboardFromCalloutSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.WhiteboardFromCalloutQuery,
        SchemaTypes.WhiteboardFromCalloutQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.WhiteboardFromCalloutQuery,
    SchemaTypes.WhiteboardFromCalloutQueryVariables
  >(WhiteboardFromCalloutDocument, options);
}
export type WhiteboardFromCalloutQueryHookResult = ReturnType<typeof useWhiteboardFromCalloutQuery>;
export type WhiteboardFromCalloutLazyQueryHookResult = ReturnType<typeof useWhiteboardFromCalloutLazyQuery>;
export type WhiteboardFromCalloutSuspenseQueryHookResult = ReturnType<typeof useWhiteboardFromCalloutSuspenseQuery>;
export type WhiteboardFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardFromCalloutQuery,
  SchemaTypes.WhiteboardFromCalloutQueryVariables
>;
export function refetchWhiteboardFromCalloutQuery(variables: SchemaTypes.WhiteboardFromCalloutQueryVariables) {
  return { query: WhiteboardFromCalloutDocument, variables: variables };
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
  > &
    ({ variables: SchemaTypes.WhiteboardLastUpdatedDateQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useWhiteboardLastUpdatedDateSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.WhiteboardLastUpdatedDateQuery,
        SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.WhiteboardLastUpdatedDateQuery,
    SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
  >(WhiteboardLastUpdatedDateDocument, options);
}
export type WhiteboardLastUpdatedDateQueryHookResult = ReturnType<typeof useWhiteboardLastUpdatedDateQuery>;
export type WhiteboardLastUpdatedDateLazyQueryHookResult = ReturnType<typeof useWhiteboardLastUpdatedDateLazyQuery>;
export type WhiteboardLastUpdatedDateSuspenseQueryHookResult = ReturnType<
  typeof useWhiteboardLastUpdatedDateSuspenseQuery
>;
export type WhiteboardLastUpdatedDateQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardLastUpdatedDateQuery,
  SchemaTypes.WhiteboardLastUpdatedDateQueryVariables
>;
export function refetchWhiteboardLastUpdatedDateQuery(variables: SchemaTypes.WhiteboardLastUpdatedDateQueryVariables) {
  return { query: WhiteboardLastUpdatedDateDocument, variables: variables };
}
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
  mutation updateWhiteboard($input: UpdateWhiteboardEntityInput!) {
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
export const LatestReleaseDiscussionDocument = gql`
  query latestReleaseDiscussion {
    platform {
      id
      latestReleaseDiscussion {
        id
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
export function useLatestReleaseDiscussionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.LatestReleaseDiscussionQuery,
        SchemaTypes.LatestReleaseDiscussionQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.LatestReleaseDiscussionQuery,
    SchemaTypes.LatestReleaseDiscussionQueryVariables
  >(LatestReleaseDiscussionDocument, options);
}
export type LatestReleaseDiscussionQueryHookResult = ReturnType<typeof useLatestReleaseDiscussionQuery>;
export type LatestReleaseDiscussionLazyQueryHookResult = ReturnType<typeof useLatestReleaseDiscussionLazyQuery>;
export type LatestReleaseDiscussionSuspenseQueryHookResult = ReturnType<typeof useLatestReleaseDiscussionSuspenseQuery>;
export type LatestReleaseDiscussionQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestReleaseDiscussionQuery,
  SchemaTypes.LatestReleaseDiscussionQueryVariables
>;
export function refetchLatestReleaseDiscussionQuery(variables?: SchemaTypes.LatestReleaseDiscussionQueryVariables) {
  return { query: LatestReleaseDiscussionDocument, variables: variables };
}
export const CreateDiscussionDocument = gql`
  mutation createDiscussion($input: ForumCreateDiscussionInput!) {
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
      forum {
        id
        discussionCategories
        authorization {
          id
          myPrivileges
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
export function usePlatformDiscussionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformDiscussionsQuery,
        SchemaTypes.PlatformDiscussionsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PlatformDiscussionsQuery, SchemaTypes.PlatformDiscussionsQueryVariables>(
    PlatformDiscussionsDocument,
    options
  );
}
export type PlatformDiscussionsQueryHookResult = ReturnType<typeof usePlatformDiscussionsQuery>;
export type PlatformDiscussionsLazyQueryHookResult = ReturnType<typeof usePlatformDiscussionsLazyQuery>;
export type PlatformDiscussionsSuspenseQueryHookResult = ReturnType<typeof usePlatformDiscussionsSuspenseQuery>;
export type PlatformDiscussionsQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformDiscussionsQuery,
  SchemaTypes.PlatformDiscussionsQueryVariables
>;
export function refetchPlatformDiscussionsQuery(variables?: SchemaTypes.PlatformDiscussionsQueryVariables) {
  return { query: PlatformDiscussionsDocument, variables: variables };
}
export const PlatformDiscussionDocument = gql`
  query platformDiscussion($discussionId: UUID!) {
    platform {
      id
      forum {
        id
        authorization {
          id
          myPrivileges
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
  > &
    ({ variables: SchemaTypes.PlatformDiscussionQueryVariables; skip?: boolean } | { skip: boolean })
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
export function usePlatformDiscussionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PlatformDiscussionQuery, SchemaTypes.PlatformDiscussionQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PlatformDiscussionQuery, SchemaTypes.PlatformDiscussionQueryVariables>(
    PlatformDiscussionDocument,
    options
  );
}
export type PlatformDiscussionQueryHookResult = ReturnType<typeof usePlatformDiscussionQuery>;
export type PlatformDiscussionLazyQueryHookResult = ReturnType<typeof usePlatformDiscussionLazyQuery>;
export type PlatformDiscussionSuspenseQueryHookResult = ReturnType<typeof usePlatformDiscussionSuspenseQuery>;
export type PlatformDiscussionQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformDiscussionQuery,
  SchemaTypes.PlatformDiscussionQueryVariables
>;
export function refetchPlatformDiscussionQuery(variables: SchemaTypes.PlatformDiscussionQueryVariables) {
  return { query: PlatformDiscussionDocument, variables: variables };
}
export const ForumDiscussionUpdatedDocument = gql`
  subscription forumDiscussionUpdated($forumID: UUID!) {
    forumDiscussionUpdated(forumID: $forumID) {
      id
      profile {
        id
        displayName
        description
        tagline
        visuals {
          ...VisualModel
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
  ${VisualModelFragmentDoc}
`;

/**
 * __useForumDiscussionUpdatedSubscription__
 *
 * To run a query within a React component, call `useForumDiscussionUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useForumDiscussionUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useForumDiscussionUpdatedSubscription({
 *   variables: {
 *      forumID: // value for 'forumID'
 *   },
 * });
 */
export function useForumDiscussionUpdatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.ForumDiscussionUpdatedSubscription,
    SchemaTypes.ForumDiscussionUpdatedSubscriptionVariables
  > &
    ({ variables: SchemaTypes.ForumDiscussionUpdatedSubscriptionVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.ForumDiscussionUpdatedSubscription,
    SchemaTypes.ForumDiscussionUpdatedSubscriptionVariables
  >(ForumDiscussionUpdatedDocument, options);
}
export type ForumDiscussionUpdatedSubscriptionHookResult = ReturnType<typeof useForumDiscussionUpdatedSubscription>;
export type ForumDiscussionUpdatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.ForumDiscussionUpdatedSubscription>;
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
export const MentionableContributorsDocument = gql`
  query MentionableContributors(
    $filter: UserFilterInput
    $first: Int
    $roleSetId: UUID! = "00000000-0000-0000-0000-000000000000"
    $includeVirtualContributors: Boolean!
  ) {
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
            ...VisualModel
          }
        }
      }
    }
    lookup @include(if: $includeVirtualContributors) {
      roleSet(ID: $roleSetId) {
        virtualContributorsInRoleInHierarchy(role: MEMBER) {
          id
          profile {
            id
            url
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
          }
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useMentionableContributorsQuery__
 *
 * To run a query within a React component, call `useMentionableContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMentionableContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMentionableContributorsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *      roleSetId: // value for 'roleSetId'
 *      includeVirtualContributors: // value for 'includeVirtualContributors'
 *   },
 * });
 */
export function useMentionableContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MentionableContributorsQuery,
    SchemaTypes.MentionableContributorsQueryVariables
  > &
    ({ variables: SchemaTypes.MentionableContributorsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MentionableContributorsQuery, SchemaTypes.MentionableContributorsQueryVariables>(
    MentionableContributorsDocument,
    options
  );
}
export function useMentionableContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MentionableContributorsQuery,
    SchemaTypes.MentionableContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.MentionableContributorsQuery,
    SchemaTypes.MentionableContributorsQueryVariables
  >(MentionableContributorsDocument, options);
}
export function useMentionableContributorsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.MentionableContributorsQuery,
        SchemaTypes.MentionableContributorsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.MentionableContributorsQuery,
    SchemaTypes.MentionableContributorsQueryVariables
  >(MentionableContributorsDocument, options);
}
export type MentionableContributorsQueryHookResult = ReturnType<typeof useMentionableContributorsQuery>;
export type MentionableContributorsLazyQueryHookResult = ReturnType<typeof useMentionableContributorsLazyQuery>;
export type MentionableContributorsSuspenseQueryHookResult = ReturnType<typeof useMentionableContributorsSuspenseQuery>;
export type MentionableContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.MentionableContributorsQuery,
  SchemaTypes.MentionableContributorsQueryVariables
>;
export function refetchMentionableContributorsQuery(variables: SchemaTypes.MentionableContributorsQueryVariables) {
  return { query: MentionableContributorsDocument, variables: variables };
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
      room {
        vcInteractions {
          ...VcInteractionsDetails
        }
      }
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
  ${VcInteractionsDetailsFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.RoomEventsSubscriptionVariables; skip?: boolean } | { skip: boolean })
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables> &
    ({ variables: SchemaTypes.CommunityUpdatesQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCommunityUpdatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CommunityUpdatesQuery, SchemaTypes.CommunityUpdatesQueryVariables>(
    CommunityUpdatesDocument,
    options
  );
}
export type CommunityUpdatesQueryHookResult = ReturnType<typeof useCommunityUpdatesQuery>;
export type CommunityUpdatesLazyQueryHookResult = ReturnType<typeof useCommunityUpdatesLazyQuery>;
export type CommunityUpdatesSuspenseQueryHookResult = ReturnType<typeof useCommunityUpdatesSuspenseQuery>;
export type CommunityUpdatesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityUpdatesQuery,
  SchemaTypes.CommunityUpdatesQueryVariables
>;
export function refetchCommunityUpdatesQuery(variables: SchemaTypes.CommunityUpdatesQueryVariables) {
  return { query: CommunityUpdatesDocument, variables: variables };
}
export const ApplicationDialogDocument = gql`
  query ApplicationDialog($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimalUrl
          membership {
            communityID
            roleSetID
            applicationForm {
              id
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
          guidelines {
            ...CommunityGuidelinesDetails
          }
        }
      }
    }
  }
  ${SpaceAboutMinimalUrlFragmentDoc}
  ${CommunityGuidelinesDetailsFragmentDoc}
`;

/**
 * __useApplicationDialogQuery__
 *
 * To run a query within a React component, call `useApplicationDialogQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationDialogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationDialogQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useApplicationDialogQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ApplicationDialogQuery,
    SchemaTypes.ApplicationDialogQueryVariables
  > &
    ({ variables: SchemaTypes.ApplicationDialogQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ApplicationDialogQuery, SchemaTypes.ApplicationDialogQueryVariables>(
    ApplicationDialogDocument,
    options
  );
}
export function useApplicationDialogLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ApplicationDialogQuery,
    SchemaTypes.ApplicationDialogQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ApplicationDialogQuery, SchemaTypes.ApplicationDialogQueryVariables>(
    ApplicationDialogDocument,
    options
  );
}
export function useApplicationDialogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ApplicationDialogQuery, SchemaTypes.ApplicationDialogQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ApplicationDialogQuery, SchemaTypes.ApplicationDialogQueryVariables>(
    ApplicationDialogDocument,
    options
  );
}
export type ApplicationDialogQueryHookResult = ReturnType<typeof useApplicationDialogQuery>;
export type ApplicationDialogLazyQueryHookResult = ReturnType<typeof useApplicationDialogLazyQuery>;
export type ApplicationDialogSuspenseQueryHookResult = ReturnType<typeof useApplicationDialogSuspenseQuery>;
export type ApplicationDialogQueryResult = Apollo.QueryResult<
  SchemaTypes.ApplicationDialogQuery,
  SchemaTypes.ApplicationDialogQueryVariables
>;
export function refetchApplicationDialogQuery(variables: SchemaTypes.ApplicationDialogQueryVariables) {
  return { query: ApplicationDialogDocument, variables: variables };
}
export const RoleSetApplicationFormDocument = gql`
  query RoleSetApplicationForm($roleSetId: UUID!) {
    lookup {
      roleSet(ID: $roleSetId) {
        id
        applicationForm {
          ...ApplicationForm
        }
      }
    }
  }
  ${ApplicationFormFragmentDoc}
`;

/**
 * __useRoleSetApplicationFormQuery__
 *
 * To run a query within a React component, call `useRoleSetApplicationFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useRoleSetApplicationFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRoleSetApplicationFormQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *   },
 * });
 */
export function useRoleSetApplicationFormQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.RoleSetApplicationFormQuery,
    SchemaTypes.RoleSetApplicationFormQueryVariables
  > &
    ({ variables: SchemaTypes.RoleSetApplicationFormQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RoleSetApplicationFormQuery, SchemaTypes.RoleSetApplicationFormQueryVariables>(
    RoleSetApplicationFormDocument,
    options
  );
}
export function useRoleSetApplicationFormLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RoleSetApplicationFormQuery,
    SchemaTypes.RoleSetApplicationFormQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RoleSetApplicationFormQuery, SchemaTypes.RoleSetApplicationFormQueryVariables>(
    RoleSetApplicationFormDocument,
    options
  );
}
export function useRoleSetApplicationFormSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.RoleSetApplicationFormQuery,
        SchemaTypes.RoleSetApplicationFormQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.RoleSetApplicationFormQuery,
    SchemaTypes.RoleSetApplicationFormQueryVariables
  >(RoleSetApplicationFormDocument, options);
}
export type RoleSetApplicationFormQueryHookResult = ReturnType<typeof useRoleSetApplicationFormQuery>;
export type RoleSetApplicationFormLazyQueryHookResult = ReturnType<typeof useRoleSetApplicationFormLazyQuery>;
export type RoleSetApplicationFormSuspenseQueryHookResult = ReturnType<typeof useRoleSetApplicationFormSuspenseQuery>;
export type RoleSetApplicationFormQueryResult = Apollo.QueryResult<
  SchemaTypes.RoleSetApplicationFormQuery,
  SchemaTypes.RoleSetApplicationFormQueryVariables
>;
export function refetchRoleSetApplicationFormQuery(variables: SchemaTypes.RoleSetApplicationFormQueryVariables) {
  return { query: RoleSetApplicationFormDocument, variables: variables };
}
export const UpdateApplicationFormOnRoleSetDocument = gql`
  mutation updateApplicationFormOnRoleSet($roleSetId: UUID!, $formData: UpdateFormInput!) {
    updateApplicationFormOnRoleSet(applicationFormData: { roleSetID: $roleSetId, formData: $formData }) {
      id
    }
  }
`;
export type UpdateApplicationFormOnRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateApplicationFormOnRoleSetMutation,
  SchemaTypes.UpdateApplicationFormOnRoleSetMutationVariables
>;

/**
 * __useUpdateApplicationFormOnRoleSetMutation__
 *
 * To run a mutation, you first call `useUpdateApplicationFormOnRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApplicationFormOnRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApplicationFormOnRoleSetMutation, { data, loading, error }] = useUpdateApplicationFormOnRoleSetMutation({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      formData: // value for 'formData'
 *   },
 * });
 */
export function useUpdateApplicationFormOnRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateApplicationFormOnRoleSetMutation,
    SchemaTypes.UpdateApplicationFormOnRoleSetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateApplicationFormOnRoleSetMutation,
    SchemaTypes.UpdateApplicationFormOnRoleSetMutationVariables
  >(UpdateApplicationFormOnRoleSetDocument, options);
}
export type UpdateApplicationFormOnRoleSetMutationHookResult = ReturnType<
  typeof useUpdateApplicationFormOnRoleSetMutation
>;
export type UpdateApplicationFormOnRoleSetMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateApplicationFormOnRoleSetMutation>;
export type UpdateApplicationFormOnRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateApplicationFormOnRoleSetMutation,
  SchemaTypes.UpdateApplicationFormOnRoleSetMutationVariables
>;
export const CommunityGuidelinesDocument = gql`
  query CommunityGuidelines($communityGuidelinesId: UUID!) {
    lookup {
      communityGuidelines(ID: $communityGuidelinesId) {
        ...CommunityGuidelinesDetails
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
 *      communityGuidelinesId: // value for 'communityGuidelinesId'
 *   },
 * });
 */
export function useCommunityGuidelinesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityGuidelinesQuery,
    SchemaTypes.CommunityGuidelinesQueryVariables
  > &
    ({ variables: SchemaTypes.CommunityGuidelinesQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCommunityGuidelinesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CommunityGuidelinesQuery,
        SchemaTypes.CommunityGuidelinesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CommunityGuidelinesQuery, SchemaTypes.CommunityGuidelinesQueryVariables>(
    CommunityGuidelinesDocument,
    options
  );
}
export type CommunityGuidelinesQueryHookResult = ReturnType<typeof useCommunityGuidelinesQuery>;
export type CommunityGuidelinesLazyQueryHookResult = ReturnType<typeof useCommunityGuidelinesLazyQuery>;
export type CommunityGuidelinesSuspenseQueryHookResult = ReturnType<typeof useCommunityGuidelinesSuspenseQuery>;
export type CommunityGuidelinesQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityGuidelinesQuery,
  SchemaTypes.CommunityGuidelinesQueryVariables
>;
export function refetchCommunityGuidelinesQuery(variables: SchemaTypes.CommunityGuidelinesQueryVariables) {
  return { query: CommunityGuidelinesDocument, variables: variables };
}
export const UpdateCommunityGuidelinesDocument = gql`
  mutation UpdateCommunityGuidelines($communityGuidelinesData: UpdateCommunityGuidelinesEntityInput!) {
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
export const RemoveCommunityGuidelinesContentDocument = gql`
  mutation RemoveCommunityGuidelinesContent($communityGuidelinesData: RemoveCommunityGuidelinesContentInput!) {
    removeCommunityGuidelinesContent(communityGuidelinesData: $communityGuidelinesData) {
      ...CommunityGuidelinesDetails
    }
  }
  ${CommunityGuidelinesDetailsFragmentDoc}
`;
export type RemoveCommunityGuidelinesContentMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveCommunityGuidelinesContentMutation,
  SchemaTypes.RemoveCommunityGuidelinesContentMutationVariables
>;

/**
 * __useRemoveCommunityGuidelinesContentMutation__
 *
 * To run a mutation, you first call `useRemoveCommunityGuidelinesContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommunityGuidelinesContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommunityGuidelinesContentMutation, { data, loading, error }] = useRemoveCommunityGuidelinesContentMutation({
 *   variables: {
 *      communityGuidelinesData: // value for 'communityGuidelinesData'
 *   },
 * });
 */
export function useRemoveCommunityGuidelinesContentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveCommunityGuidelinesContentMutation,
    SchemaTypes.RemoveCommunityGuidelinesContentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveCommunityGuidelinesContentMutation,
    SchemaTypes.RemoveCommunityGuidelinesContentMutationVariables
  >(RemoveCommunityGuidelinesContentDocument, options);
}
export type RemoveCommunityGuidelinesContentMutationHookResult = ReturnType<
  typeof useRemoveCommunityGuidelinesContentMutation
>;
export type RemoveCommunityGuidelinesContentMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveCommunityGuidelinesContentMutation>;
export type RemoveCommunityGuidelinesContentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveCommunityGuidelinesContentMutation,
  SchemaTypes.RemoveCommunityGuidelinesContentMutationVariables
>;
export const CreateWingbackAccountDocument = gql`
  mutation createWingbackAccount($accountID: UUID!) {
    createWingbackAccount(accountID: $accountID)
  }
`;
export type CreateWingbackAccountMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateWingbackAccountMutation,
  SchemaTypes.CreateWingbackAccountMutationVariables
>;

/**
 * __useCreateWingbackAccountMutation__
 *
 * To run a mutation, you first call `useCreateWingbackAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWingbackAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWingbackAccountMutation, { data, loading, error }] = useCreateWingbackAccountMutation({
 *   variables: {
 *      accountID: // value for 'accountID'
 *   },
 * });
 */
export function useCreateWingbackAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateWingbackAccountMutation,
    SchemaTypes.CreateWingbackAccountMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateWingbackAccountMutation,
    SchemaTypes.CreateWingbackAccountMutationVariables
  >(CreateWingbackAccountDocument, options);
}
export type CreateWingbackAccountMutationHookResult = ReturnType<typeof useCreateWingbackAccountMutation>;
export type CreateWingbackAccountMutationResult = Apollo.MutationResult<SchemaTypes.CreateWingbackAccountMutation>;
export type CreateWingbackAccountMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateWingbackAccountMutation,
  SchemaTypes.CreateWingbackAccountMutationVariables
>;
export const ContributorTooltipDocument = gql`
  query ContributorTooltip($userId: UUID!, $includeUser: Boolean = false) {
    user(ID: $userId) @include(if: $includeUser) {
      id
      profile {
        id
        displayName
        avatar: visual(type: AVATAR) {
          ...VisualModel
        }
        location {
          id
          city
          country
        }
        tagsets {
          id
          name
          tags
        }
        url
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useContributorTooltipQuery__
 *
 * To run a query within a React component, call `useContributorTooltipQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorTooltipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorTooltipQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      includeUser: // value for 'includeUser'
 *   },
 * });
 */
export function useContributorTooltipQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorTooltipQuery,
    SchemaTypes.ContributorTooltipQueryVariables
  > &
    ({ variables: SchemaTypes.ContributorTooltipQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContributorTooltipQuery, SchemaTypes.ContributorTooltipQueryVariables>(
    ContributorTooltipDocument,
    options
  );
}
export function useContributorTooltipLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributorTooltipQuery,
    SchemaTypes.ContributorTooltipQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContributorTooltipQuery, SchemaTypes.ContributorTooltipQueryVariables>(
    ContributorTooltipDocument,
    options
  );
}
export function useContributorTooltipSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ContributorTooltipQuery, SchemaTypes.ContributorTooltipQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ContributorTooltipQuery, SchemaTypes.ContributorTooltipQueryVariables>(
    ContributorTooltipDocument,
    options
  );
}
export type ContributorTooltipQueryHookResult = ReturnType<typeof useContributorTooltipQuery>;
export type ContributorTooltipLazyQueryHookResult = ReturnType<typeof useContributorTooltipLazyQuery>;
export type ContributorTooltipSuspenseQueryHookResult = ReturnType<typeof useContributorTooltipSuspenseQuery>;
export type ContributorTooltipQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorTooltipQuery,
  SchemaTypes.ContributorTooltipQueryVariables
>;
export function refetchContributorTooltipQuery(variables: SchemaTypes.ContributorTooltipQueryVariables) {
  return { query: ContributorTooltipDocument, variables: variables };
}
export const ContributorsPageOrganizationsDocument = gql`
  query ContributorsPageOrganizations(
    $first: Int!
    $after: UUID
    $status: OrganizationVerificationEnum
    $filter: OrganizationFilterInput
  ) {
    organizationsPaginated(first: $first, after: $after, filter: $filter, status: $status) {
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
 *      status: // value for 'status'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useContributorsPageOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  > &
    ({ variables: SchemaTypes.ContributorsPageOrganizationsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useContributorsPageOrganizationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ContributorsPageOrganizationsQuery,
        SchemaTypes.ContributorsPageOrganizationsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ContributorsPageOrganizationsQuery,
    SchemaTypes.ContributorsPageOrganizationsQueryVariables
  >(ContributorsPageOrganizationsDocument, options);
}
export type ContributorsPageOrganizationsQueryHookResult = ReturnType<typeof useContributorsPageOrganizationsQuery>;
export type ContributorsPageOrganizationsLazyQueryHookResult = ReturnType<
  typeof useContributorsPageOrganizationsLazyQuery
>;
export type ContributorsPageOrganizationsSuspenseQueryHookResult = ReturnType<
  typeof useContributorsPageOrganizationsSuspenseQuery
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
  query ContributorsPageUsers($first: Int!, $after: UUID, $filter: UserFilterInput, $withTags: Boolean) {
    usersPaginated(first: $first, after: $after, filter: $filter, withTags: $withTags) {
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
 *      withTags: // value for 'withTags'
 *   },
 * });
 */
export function useContributorsPageUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsPageUsersQuery,
    SchemaTypes.ContributorsPageUsersQueryVariables
  > &
    ({ variables: SchemaTypes.ContributorsPageUsersQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useContributorsPageUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ContributorsPageUsersQuery,
        SchemaTypes.ContributorsPageUsersQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ContributorsPageUsersQuery,
    SchemaTypes.ContributorsPageUsersQueryVariables
  >(ContributorsPageUsersDocument, options);
}
export type ContributorsPageUsersQueryHookResult = ReturnType<typeof useContributorsPageUsersQuery>;
export type ContributorsPageUsersLazyQueryHookResult = ReturnType<typeof useContributorsPageUsersLazyQuery>;
export type ContributorsPageUsersSuspenseQueryHookResult = ReturnType<typeof useContributorsPageUsersSuspenseQuery>;
export type ContributorsPageUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorsPageUsersQuery,
  SchemaTypes.ContributorsPageUsersQueryVariables
>;
export function refetchContributorsPageUsersQuery(variables: SchemaTypes.ContributorsPageUsersQueryVariables) {
  return { query: ContributorsPageUsersDocument, variables: variables };
}
export const ContributorsVirtualInLibraryDocument = gql`
  query ContributorsVirtualInLibrary {
    platform {
      id
      library {
        id
        virtualContributors {
          id
          profile {
            id
            displayName
            url
            location {
              city
              country
            }
            tagsets {
              ...TagsetDetails
            }
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;

/**
 * __useContributorsVirtualInLibraryQuery__
 *
 * To run a query within a React component, call `useContributorsVirtualInLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorsVirtualInLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorsVirtualInLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function useContributorsVirtualInLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ContributorsVirtualInLibraryQuery,
    SchemaTypes.ContributorsVirtualInLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ContributorsVirtualInLibraryQuery,
    SchemaTypes.ContributorsVirtualInLibraryQueryVariables
  >(ContributorsVirtualInLibraryDocument, options);
}
export function useContributorsVirtualInLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributorsVirtualInLibraryQuery,
    SchemaTypes.ContributorsVirtualInLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ContributorsVirtualInLibraryQuery,
    SchemaTypes.ContributorsVirtualInLibraryQueryVariables
  >(ContributorsVirtualInLibraryDocument, options);
}
export function useContributorsVirtualInLibrarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ContributorsVirtualInLibraryQuery,
        SchemaTypes.ContributorsVirtualInLibraryQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ContributorsVirtualInLibraryQuery,
    SchemaTypes.ContributorsVirtualInLibraryQueryVariables
  >(ContributorsVirtualInLibraryDocument, options);
}
export type ContributorsVirtualInLibraryQueryHookResult = ReturnType<typeof useContributorsVirtualInLibraryQuery>;
export type ContributorsVirtualInLibraryLazyQueryHookResult = ReturnType<
  typeof useContributorsVirtualInLibraryLazyQuery
>;
export type ContributorsVirtualInLibrarySuspenseQueryHookResult = ReturnType<
  typeof useContributorsVirtualInLibrarySuspenseQuery
>;
export type ContributorsVirtualInLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributorsVirtualInLibraryQuery,
  SchemaTypes.ContributorsVirtualInLibraryQueryVariables
>;
export function refetchContributorsVirtualInLibraryQuery(
  variables?: SchemaTypes.ContributorsVirtualInLibraryQueryVariables
) {
  return { query: ContributorsVirtualInLibraryDocument, variables: variables };
}
export const AccountResourcesInfoDocument = gql`
  query AccountResourcesInfo($accountId: UUID!) {
    lookup {
      account(ID: $accountId) {
        id
        spaces {
          id
          about {
            id
            profile {
              ...AccountResourceProfile
              cardBanner: visual(type: CARD) {
                ...VisualModel
              }
            }
          }
        }
        virtualContributors {
          id
          profile {
            ...AccountResourceProfile
            tagline
          }
        }
        innovationPacks {
          id
          profile {
            ...AccountResourceProfile
          }
          templatesSet {
            id
            calloutTemplatesCount
            spaceTemplatesCount
            communityGuidelinesTemplatesCount
            postTemplatesCount
            whiteboardTemplatesCount
          }
        }
        innovationHubs {
          id
          profile {
            ...AccountResourceProfile
            banner: visual(type: BANNER_WIDE) {
              ...VisualModel
            }
          }
          subdomain
        }
      }
    }
  }
  ${AccountResourceProfileFragmentDoc}
  ${VisualModelFragmentDoc}
`;

/**
 * __useAccountResourcesInfoQuery__
 *
 * To run a query within a React component, call `useAccountResourcesInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountResourcesInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountResourcesInfoQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useAccountResourcesInfoQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AccountResourcesInfoQuery,
    SchemaTypes.AccountResourcesInfoQueryVariables
  > &
    ({ variables: SchemaTypes.AccountResourcesInfoQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AccountResourcesInfoQuery, SchemaTypes.AccountResourcesInfoQueryVariables>(
    AccountResourcesInfoDocument,
    options
  );
}
export function useAccountResourcesInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AccountResourcesInfoQuery,
    SchemaTypes.AccountResourcesInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AccountResourcesInfoQuery, SchemaTypes.AccountResourcesInfoQueryVariables>(
    AccountResourcesInfoDocument,
    options
  );
}
export function useAccountResourcesInfoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AccountResourcesInfoQuery,
        SchemaTypes.AccountResourcesInfoQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AccountResourcesInfoQuery, SchemaTypes.AccountResourcesInfoQueryVariables>(
    AccountResourcesInfoDocument,
    options
  );
}
export type AccountResourcesInfoQueryHookResult = ReturnType<typeof useAccountResourcesInfoQuery>;
export type AccountResourcesInfoLazyQueryHookResult = ReturnType<typeof useAccountResourcesInfoLazyQuery>;
export type AccountResourcesInfoSuspenseQueryHookResult = ReturnType<typeof useAccountResourcesInfoSuspenseQuery>;
export type AccountResourcesInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountResourcesInfoQuery,
  SchemaTypes.AccountResourcesInfoQueryVariables
>;
export function refetchAccountResourcesInfoQuery(variables: SchemaTypes.AccountResourcesInfoQueryVariables) {
  return { query: AccountResourcesInfoDocument, variables: variables };
}
export const InviteUsersDialogDocument = gql`
  query InviteUsersDialog($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          id
          profile {
            id
            displayName
          }
          membership {
            roleSetID
          }
        }
      }
    }
  }
`;

/**
 * __useInviteUsersDialogQuery__
 *
 * To run a query within a React component, call `useInviteUsersDialogQuery` and pass it any options that fit your needs.
 * When your component renders, `useInviteUsersDialogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInviteUsersDialogQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useInviteUsersDialogQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InviteUsersDialogQuery,
    SchemaTypes.InviteUsersDialogQueryVariables
  > &
    ({ variables: SchemaTypes.InviteUsersDialogQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InviteUsersDialogQuery, SchemaTypes.InviteUsersDialogQueryVariables>(
    InviteUsersDialogDocument,
    options
  );
}
export function useInviteUsersDialogLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InviteUsersDialogQuery,
    SchemaTypes.InviteUsersDialogQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InviteUsersDialogQuery, SchemaTypes.InviteUsersDialogQueryVariables>(
    InviteUsersDialogDocument,
    options
  );
}
export function useInviteUsersDialogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.InviteUsersDialogQuery, SchemaTypes.InviteUsersDialogQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.InviteUsersDialogQuery, SchemaTypes.InviteUsersDialogQueryVariables>(
    InviteUsersDialogDocument,
    options
  );
}
export type InviteUsersDialogQueryHookResult = ReturnType<typeof useInviteUsersDialogQuery>;
export type InviteUsersDialogLazyQueryHookResult = ReturnType<typeof useInviteUsersDialogLazyQuery>;
export type InviteUsersDialogSuspenseQueryHookResult = ReturnType<typeof useInviteUsersDialogSuspenseQuery>;
export type InviteUsersDialogQueryResult = Apollo.QueryResult<
  SchemaTypes.InviteUsersDialogQuery,
  SchemaTypes.InviteUsersDialogQueryVariables
>;
export function refetchInviteUsersDialogQuery(variables: SchemaTypes.InviteUsersDialogQueryVariables) {
  return { query: InviteUsersDialogDocument, variables: variables };
}
export const AssociatedOrganizationDocument = gql`
  query associatedOrganization($organizationId: UUID!) {
    lookup {
      organization(ID: $organizationId) {
        id
        roleSet {
          id
          myRoles
        }
        profile {
          id
          url
          tagline
          displayName
          description
          location {
            id
            city
            country
          }
          avatar: visual(type: AVATAR) {
            ...VisualModel
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
    }
  }
  ${VisualModelFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.AssociatedOrganizationQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useAssociatedOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AssociatedOrganizationQuery,
        SchemaTypes.AssociatedOrganizationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AssociatedOrganizationQuery,
    SchemaTypes.AssociatedOrganizationQueryVariables
  >(AssociatedOrganizationDocument, options);
}
export type AssociatedOrganizationQueryHookResult = ReturnType<typeof useAssociatedOrganizationQuery>;
export type AssociatedOrganizationLazyQueryHookResult = ReturnType<typeof useAssociatedOrganizationLazyQuery>;
export type AssociatedOrganizationSuspenseQueryHookResult = ReturnType<typeof useAssociatedOrganizationSuspenseQuery>;
export type AssociatedOrganizationQueryResult = Apollo.QueryResult<
  SchemaTypes.AssociatedOrganizationQuery,
  SchemaTypes.AssociatedOrganizationQueryVariables
>;
export function refetchAssociatedOrganizationQuery(variables: SchemaTypes.AssociatedOrganizationQueryVariables) {
  return { query: AssociatedOrganizationDocument, variables: variables };
}
export const OrganizationInfoDocument = gql`
  query organizationInfo($organizationId: UUID!) {
    lookup {
      organization(ID: $organizationId) {
        ...OrganizationInfo
      }
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables> &
    ({ variables: SchemaTypes.OrganizationInfoQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useOrganizationInfoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.OrganizationInfoQuery, SchemaTypes.OrganizationInfoQueryVariables>(
    OrganizationInfoDocument,
    options
  );
}
export type OrganizationInfoQueryHookResult = ReturnType<typeof useOrganizationInfoQuery>;
export type OrganizationInfoLazyQueryHookResult = ReturnType<typeof useOrganizationInfoLazyQuery>;
export type OrganizationInfoSuspenseQueryHookResult = ReturnType<typeof useOrganizationInfoSuspenseQuery>;
export type OrganizationInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationInfoQuery,
  SchemaTypes.OrganizationInfoQueryVariables
>;
export function refetchOrganizationInfoQuery(variables: SchemaTypes.OrganizationInfoQueryVariables) {
  return { query: OrganizationInfoDocument, variables: variables };
}
export const CreateOrganizationDocument = gql`
  mutation createOrganization($input: CreateOrganizationInput!) {
    createOrganization(organizationData: $input) {
      id
      profile {
        id
        displayName
        url
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
export const OrganizationAuthorizationDocument = gql`
  query OrganizationAuthorization($organizationId: UUID!) {
    lookup {
      organization(ID: $organizationId) {
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
 * __useOrganizationAuthorizationQuery__
 *
 * To run a query within a React component, call `useOrganizationAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationAuthorizationQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useOrganizationAuthorizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationAuthorizationQuery,
    SchemaTypes.OrganizationAuthorizationQueryVariables
  > &
    ({ variables: SchemaTypes.OrganizationAuthorizationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OrganizationAuthorizationQuery,
    SchemaTypes.OrganizationAuthorizationQueryVariables
  >(OrganizationAuthorizationDocument, options);
}
export function useOrganizationAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationAuthorizationQuery,
    SchemaTypes.OrganizationAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OrganizationAuthorizationQuery,
    SchemaTypes.OrganizationAuthorizationQueryVariables
  >(OrganizationAuthorizationDocument, options);
}
export function useOrganizationAuthorizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.OrganizationAuthorizationQuery,
        SchemaTypes.OrganizationAuthorizationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.OrganizationAuthorizationQuery,
    SchemaTypes.OrganizationAuthorizationQueryVariables
  >(OrganizationAuthorizationDocument, options);
}
export type OrganizationAuthorizationQueryHookResult = ReturnType<typeof useOrganizationAuthorizationQuery>;
export type OrganizationAuthorizationLazyQueryHookResult = ReturnType<typeof useOrganizationAuthorizationLazyQuery>;
export type OrganizationAuthorizationSuspenseQueryHookResult = ReturnType<
  typeof useOrganizationAuthorizationSuspenseQuery
>;
export type OrganizationAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationAuthorizationQuery,
  SchemaTypes.OrganizationAuthorizationQueryVariables
>;
export function refetchOrganizationAuthorizationQuery(variables: SchemaTypes.OrganizationAuthorizationQueryVariables) {
  return { query: OrganizationAuthorizationDocument, variables: variables };
}
export const RolesOrganizationDocument = gql`
  query rolesOrganization($organizationId: UUID!) {
    rolesOrganization(rolesData: { organizationID: $organizationId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        roles
        displayName
        visibility
        subspaces {
          id
          displayName
          roles
          level
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
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useRolesOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.RolesOrganizationQuery,
    SchemaTypes.RolesOrganizationQueryVariables
  > &
    ({ variables: SchemaTypes.RolesOrganizationQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useRolesOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.RolesOrganizationQuery, SchemaTypes.RolesOrganizationQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.RolesOrganizationQuery, SchemaTypes.RolesOrganizationQueryVariables>(
    RolesOrganizationDocument,
    options
  );
}
export type RolesOrganizationQueryHookResult = ReturnType<typeof useRolesOrganizationQuery>;
export type RolesOrganizationLazyQueryHookResult = ReturnType<typeof useRolesOrganizationLazyQuery>;
export type RolesOrganizationSuspenseQueryHookResult = ReturnType<typeof useRolesOrganizationSuspenseQuery>;
export type RolesOrganizationQueryResult = Apollo.QueryResult<
  SchemaTypes.RolesOrganizationQuery,
  SchemaTypes.RolesOrganizationQueryVariables
>;
export function refetchRolesOrganizationQuery(variables: SchemaTypes.RolesOrganizationQueryVariables) {
  return { query: RolesOrganizationDocument, variables: variables };
}
export const OrganizationAccountDocument = gql`
  query OrganizationAccount($organizationId: UUID!) {
    lookup {
      organization(ID: $organizationId) {
        id
        profile {
          id
          displayName
        }
        account {
          id
        }
      }
    }
  }
`;

/**
 * __useOrganizationAccountQuery__
 *
 * To run a query within a React component, call `useOrganizationAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationAccountQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useOrganizationAccountQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationAccountQuery,
    SchemaTypes.OrganizationAccountQueryVariables
  > &
    ({ variables: SchemaTypes.OrganizationAccountQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationAccountQuery, SchemaTypes.OrganizationAccountQueryVariables>(
    OrganizationAccountDocument,
    options
  );
}
export function useOrganizationAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationAccountQuery,
    SchemaTypes.OrganizationAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationAccountQuery, SchemaTypes.OrganizationAccountQueryVariables>(
    OrganizationAccountDocument,
    options
  );
}
export function useOrganizationAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.OrganizationAccountQuery,
        SchemaTypes.OrganizationAccountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.OrganizationAccountQuery, SchemaTypes.OrganizationAccountQueryVariables>(
    OrganizationAccountDocument,
    options
  );
}
export type OrganizationAccountQueryHookResult = ReturnType<typeof useOrganizationAccountQuery>;
export type OrganizationAccountLazyQueryHookResult = ReturnType<typeof useOrganizationAccountLazyQuery>;
export type OrganizationAccountSuspenseQueryHookResult = ReturnType<typeof useOrganizationAccountSuspenseQuery>;
export type OrganizationAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationAccountQuery,
  SchemaTypes.OrganizationAccountQueryVariables
>;
export function refetchOrganizationAccountQuery(variables: SchemaTypes.OrganizationAccountQueryVariables) {
  return { query: OrganizationAccountDocument, variables: variables };
}
export const OrganizationProfileInfoDocument = gql`
  query OrganizationProfileInfo($id: UUID!) {
    lookup {
      organization(ID: $id) {
        ...OrganizationProfileInfo
      }
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
  > &
    ({ variables: SchemaTypes.OrganizationProfileInfoQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useOrganizationProfileInfoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.OrganizationProfileInfoQuery,
        SchemaTypes.OrganizationProfileInfoQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.OrganizationProfileInfoQuery,
    SchemaTypes.OrganizationProfileInfoQueryVariables
  >(OrganizationProfileInfoDocument, options);
}
export type OrganizationProfileInfoQueryHookResult = ReturnType<typeof useOrganizationProfileInfoQuery>;
export type OrganizationProfileInfoLazyQueryHookResult = ReturnType<typeof useOrganizationProfileInfoLazyQuery>;
export type OrganizationProfileInfoSuspenseQueryHookResult = ReturnType<typeof useOrganizationProfileInfoSuspenseQuery>;
export type OrganizationProfileInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationProfileInfoQuery,
  SchemaTypes.OrganizationProfileInfoQueryVariables
>;
export function refetchOrganizationProfileInfoQuery(variables: SchemaTypes.OrganizationProfileInfoQueryVariables) {
  return { query: OrganizationProfileInfoDocument, variables: variables };
}
export const OrganizationSettingsDocument = gql`
  query OrganizationSettings($orgId: UUID!) {
    lookup {
      organization(ID: $orgId) {
        id
        settings {
          membership {
            allowUsersMatchingDomainToJoin
          }
          privacy {
            contributionRolesPubliclyVisible
          }
        }
      }
    }
  }
`;

/**
 * __useOrganizationSettingsQuery__
 *
 * To run a query within a React component, call `useOrganizationSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationSettingsQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useOrganizationSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OrganizationSettingsQuery,
    SchemaTypes.OrganizationSettingsQueryVariables
  > &
    ({ variables: SchemaTypes.OrganizationSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OrganizationSettingsQuery, SchemaTypes.OrganizationSettingsQueryVariables>(
    OrganizationSettingsDocument,
    options
  );
}
export function useOrganizationSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OrganizationSettingsQuery,
    SchemaTypes.OrganizationSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OrganizationSettingsQuery, SchemaTypes.OrganizationSettingsQueryVariables>(
    OrganizationSettingsDocument,
    options
  );
}
export function useOrganizationSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.OrganizationSettingsQuery,
        SchemaTypes.OrganizationSettingsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.OrganizationSettingsQuery, SchemaTypes.OrganizationSettingsQueryVariables>(
    OrganizationSettingsDocument,
    options
  );
}
export type OrganizationSettingsQueryHookResult = ReturnType<typeof useOrganizationSettingsQuery>;
export type OrganizationSettingsLazyQueryHookResult = ReturnType<typeof useOrganizationSettingsLazyQuery>;
export type OrganizationSettingsSuspenseQueryHookResult = ReturnType<typeof useOrganizationSettingsSuspenseQuery>;
export type OrganizationSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationSettingsQuery,
  SchemaTypes.OrganizationSettingsQueryVariables
>;
export function refetchOrganizationSettingsQuery(variables: SchemaTypes.OrganizationSettingsQueryVariables) {
  return { query: OrganizationSettingsDocument, variables: variables };
}
export const UpdateOrganizationDocument = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
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
export const UpdateOrganizationSettingsDocument = gql`
  mutation UpdateOrganizationSettings($settingsData: UpdateOrganizationSettingsInput!) {
    updateOrganizationSettings(settingsData: $settingsData) {
      id
      settings {
        membership {
          allowUsersMatchingDomainToJoin
        }
      }
    }
  }
`;
export type UpdateOrganizationSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateOrganizationSettingsMutation,
  SchemaTypes.UpdateOrganizationSettingsMutationVariables
>;

/**
 * __useUpdateOrganizationSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationSettingsMutation, { data, loading, error }] = useUpdateOrganizationSettingsMutation({
 *   variables: {
 *      settingsData: // value for 'settingsData'
 *   },
 * });
 */
export function useUpdateOrganizationSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateOrganizationSettingsMutation,
    SchemaTypes.UpdateOrganizationSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateOrganizationSettingsMutation,
    SchemaTypes.UpdateOrganizationSettingsMutationVariables
  >(UpdateOrganizationSettingsDocument, options);
}
export type UpdateOrganizationSettingsMutationHookResult = ReturnType<typeof useUpdateOrganizationSettingsMutation>;
export type UpdateOrganizationSettingsMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateOrganizationSettingsMutation>;
export type UpdateOrganizationSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateOrganizationSettingsMutation,
  SchemaTypes.UpdateOrganizationSettingsMutationVariables
>;
export const PendingInvitationsCountDocument = gql`
  query PendingInvitationsCount {
    me {
      communityInvitationsCount(states: ["invited"])
    }
  }
`;

/**
 * __usePendingInvitationsCountQuery__
 *
 * To run a query within a React component, call `usePendingInvitationsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingInvitationsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingInvitationsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function usePendingInvitationsCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PendingInvitationsCountQuery,
    SchemaTypes.PendingInvitationsCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PendingInvitationsCountQuery, SchemaTypes.PendingInvitationsCountQueryVariables>(
    PendingInvitationsCountDocument,
    options
  );
}
export function usePendingInvitationsCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingInvitationsCountQuery,
    SchemaTypes.PendingInvitationsCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PendingInvitationsCountQuery,
    SchemaTypes.PendingInvitationsCountQueryVariables
  >(PendingInvitationsCountDocument, options);
}
export function usePendingInvitationsCountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PendingInvitationsCountQuery,
        SchemaTypes.PendingInvitationsCountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PendingInvitationsCountQuery,
    SchemaTypes.PendingInvitationsCountQueryVariables
  >(PendingInvitationsCountDocument, options);
}
export type PendingInvitationsCountQueryHookResult = ReturnType<typeof usePendingInvitationsCountQuery>;
export type PendingInvitationsCountLazyQueryHookResult = ReturnType<typeof usePendingInvitationsCountLazyQuery>;
export type PendingInvitationsCountSuspenseQueryHookResult = ReturnType<typeof usePendingInvitationsCountSuspenseQuery>;
export type PendingInvitationsCountQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingInvitationsCountQuery,
  SchemaTypes.PendingInvitationsCountQueryVariables
>;
export function refetchPendingInvitationsCountQuery(variables?: SchemaTypes.PendingInvitationsCountQueryVariables) {
  return { query: PendingInvitationsCountDocument, variables: variables };
}
export const PendingMembershipsSpaceDocument = gql`
  query PendingMembershipsSpace($spaceId: UUID!, $includeCommunityGuidelines: Boolean! = false) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutCardBanner
          profile {
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
          }
          guidelines @include(if: $includeCommunityGuidelines) {
            ...CommunityGuidelinesSummary
          }
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualModelFragmentDoc}
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
 *      includeCommunityGuidelines: // value for 'includeCommunityGuidelines'
 *   },
 * });
 */
export function usePendingMembershipsSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsSpaceQuery,
    SchemaTypes.PendingMembershipsSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.PendingMembershipsSpaceQueryVariables; skip?: boolean } | { skip: boolean })
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
export function usePendingMembershipsSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PendingMembershipsSpaceQuery,
        SchemaTypes.PendingMembershipsSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PendingMembershipsSpaceQuery,
    SchemaTypes.PendingMembershipsSpaceQueryVariables
  >(PendingMembershipsSpaceDocument, options);
}
export type PendingMembershipsSpaceQueryHookResult = ReturnType<typeof usePendingMembershipsSpaceQuery>;
export type PendingMembershipsSpaceLazyQueryHookResult = ReturnType<typeof usePendingMembershipsSpaceLazyQuery>;
export type PendingMembershipsSpaceSuspenseQueryHookResult = ReturnType<typeof usePendingMembershipsSpaceSuspenseQuery>;
export type PendingMembershipsSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsSpaceQuery,
  SchemaTypes.PendingMembershipsSpaceQueryVariables
>;
export function refetchPendingMembershipsSpaceQuery(variables: SchemaTypes.PendingMembershipsSpaceQueryVariables) {
  return { query: PendingMembershipsSpaceDocument, variables: variables };
}
export const PendingMembershipsUserDocument = gql`
  query PendingMembershipsUser($userId: UUID!) {
    lookup {
      user(ID: $userId) {
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
  > &
    ({ variables: SchemaTypes.PendingMembershipsUserQueryVariables; skip?: boolean } | { skip: boolean })
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
export function usePendingMembershipsUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PendingMembershipsUserQuery,
        SchemaTypes.PendingMembershipsUserQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PendingMembershipsUserQuery,
    SchemaTypes.PendingMembershipsUserQueryVariables
  >(PendingMembershipsUserDocument, options);
}
export type PendingMembershipsUserQueryHookResult = ReturnType<typeof usePendingMembershipsUserQuery>;
export type PendingMembershipsUserLazyQueryHookResult = ReturnType<typeof usePendingMembershipsUserLazyQuery>;
export type PendingMembershipsUserSuspenseQueryHookResult = ReturnType<typeof usePendingMembershipsUserSuspenseQuery>;
export type PendingMembershipsUserQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsUserQuery,
  SchemaTypes.PendingMembershipsUserQueryVariables
>;
export function refetchPendingMembershipsUserQuery(variables: SchemaTypes.PendingMembershipsUserQueryVariables) {
  return { query: PendingMembershipsUserDocument, variables: variables };
}
export const SpaceContributionDetailsDocument = gql`
  query SpaceContributionDetails($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        about {
          id
          profile {
            id
            url
            displayName
            tagline
            cardBanner: visual(type: CARD) {
              ...VisualModel
            }
            tagset {
              id
              tags
            }
          }
          membership {
            roleSetID
            communityID
          }
          isContentPublic
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.SpaceContributionDetailsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSpaceContributionDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceContributionDetailsQuery,
        SchemaTypes.SpaceContributionDetailsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceContributionDetailsQuery,
    SchemaTypes.SpaceContributionDetailsQueryVariables
  >(SpaceContributionDetailsDocument, options);
}
export type SpaceContributionDetailsQueryHookResult = ReturnType<typeof useSpaceContributionDetailsQuery>;
export type SpaceContributionDetailsLazyQueryHookResult = ReturnType<typeof useSpaceContributionDetailsLazyQuery>;
export type SpaceContributionDetailsSuspenseQueryHookResult = ReturnType<
  typeof useSpaceContributionDetailsSuspenseQuery
>;
export type SpaceContributionDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceContributionDetailsQuery,
  SchemaTypes.SpaceContributionDetailsQueryVariables
>;
export function refetchSpaceContributionDetailsQuery(variables: SchemaTypes.SpaceContributionDetailsQueryVariables) {
  return { query: SpaceContributionDetailsDocument, variables: variables };
}
export const UserSelectorDocument = gql`
  query UserSelector($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
      users {
        ...UserSelectorUserInformation
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${UserSelectorUserInformationFragmentDoc}
  ${PageInfoFragmentDoc}
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
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useUserSelectorQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables> &
    ({ variables: SchemaTypes.UserSelectorQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserSelectorSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserSelectorQuery, SchemaTypes.UserSelectorQueryVariables>(
    UserSelectorDocument,
    options
  );
}
export type UserSelectorQueryHookResult = ReturnType<typeof useUserSelectorQuery>;
export type UserSelectorLazyQueryHookResult = ReturnType<typeof useUserSelectorLazyQuery>;
export type UserSelectorSuspenseQueryHookResult = ReturnType<typeof useUserSelectorSuspenseQuery>;
export type UserSelectorQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSelectorQuery,
  SchemaTypes.UserSelectorQueryVariables
>;
export function refetchUserSelectorQuery(variables: SchemaTypes.UserSelectorQueryVariables) {
  return { query: UserSelectorDocument, variables: variables };
}
export const UserSelectorUserDetailsDocument = gql`
  query UserSelectorUserDetails($id: UUID!) {
    lookup {
      user(ID: $id) {
        ...UserSelectorUserInformation
      }
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
  > &
    ({ variables: SchemaTypes.UserSelectorUserDetailsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserSelectorUserDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.UserSelectorUserDetailsQuery,
        SchemaTypes.UserSelectorUserDetailsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.UserSelectorUserDetailsQuery,
    SchemaTypes.UserSelectorUserDetailsQueryVariables
  >(UserSelectorUserDetailsDocument, options);
}
export type UserSelectorUserDetailsQueryHookResult = ReturnType<typeof useUserSelectorUserDetailsQuery>;
export type UserSelectorUserDetailsLazyQueryHookResult = ReturnType<typeof useUserSelectorUserDetailsLazyQuery>;
export type UserSelectorUserDetailsSuspenseQueryHookResult = ReturnType<typeof useUserSelectorUserDetailsSuspenseQuery>;
export type UserSelectorUserDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSelectorUserDetailsQuery,
  SchemaTypes.UserSelectorUserDetailsQueryVariables
>;
export function refetchUserSelectorUserDetailsQuery(variables: SchemaTypes.UserSelectorUserDetailsQueryVariables) {
  return { query: UserSelectorUserDetailsDocument, variables: variables };
}
export const CreateUserNewRegistrationDocument = gql`
  mutation createUserNewRegistration {
    createUserNewRegistration {
      id
    }
  }
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
export const UserAccountDocument = gql`
  query UserAccount($userId: UUID!) {
    lookup {
      user(ID: $userId) {
        id
        profile {
          id
          displayName
        }
        agent {
          id
          credentials {
            id
            type
          }
        }
        account {
          id
        }
      }
    }
  }
`;

/**
 * __useUserAccountQuery__
 *
 * To run a query within a React component, call `useUserAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAccountQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserAccountQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables> &
    ({ variables: SchemaTypes.UserAccountQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>(
    UserAccountDocument,
    options
  );
}
export function useUserAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>(
    UserAccountDocument,
    options
  );
}
export function useUserAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>(
    UserAccountDocument,
    options
  );
}
export type UserAccountQueryHookResult = ReturnType<typeof useUserAccountQuery>;
export type UserAccountLazyQueryHookResult = ReturnType<typeof useUserAccountLazyQuery>;
export type UserAccountSuspenseQueryHookResult = ReturnType<typeof useUserAccountSuspenseQuery>;
export type UserAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.UserAccountQuery,
  SchemaTypes.UserAccountQueryVariables
>;
export function refetchUserAccountQuery(variables: SchemaTypes.UserAccountQueryVariables) {
  return { query: UserAccountDocument, variables: variables };
}
export const UserDocument = gql`
  query user($id: UUID!) {
    lookup {
      user(ID: $id) {
        email
        ...UserDetails
      }
    }
  }
  ${UserDetailsFragmentDoc}
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables> &
    ({ variables: SchemaTypes.UserQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>(UserDocument, options);
}
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserSuspenseQueryHookResult = ReturnType<typeof useUserSuspenseQuery>;
export type UserQueryResult = Apollo.QueryResult<SchemaTypes.UserQuery, SchemaTypes.UserQueryVariables>;
export function refetchUserQuery(variables: SchemaTypes.UserQueryVariables) {
  return { query: UserDocument, variables: variables };
}
export const UserModelFullDocument = gql`
  query UserModelFull($userId: UUID!) {
    lookup {
      user(ID: $userId) {
        ...UserDetails
      }
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUserModelFullQuery__
 *
 * To run a query within a React component, call `useUserModelFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserModelFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserModelFullQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUserModelFullQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables> &
    ({ variables: SchemaTypes.UserModelFullQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables>(
    UserModelFullDocument,
    options
  );
}
export function useUserModelFullLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables>(
    UserModelFullDocument,
    options
  );
}
export function useUserModelFullSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserModelFullQuery, SchemaTypes.UserModelFullQueryVariables>(
    UserModelFullDocument,
    options
  );
}
export type UserModelFullQueryHookResult = ReturnType<typeof useUserModelFullQuery>;
export type UserModelFullLazyQueryHookResult = ReturnType<typeof useUserModelFullLazyQuery>;
export type UserModelFullSuspenseQueryHookResult = ReturnType<typeof useUserModelFullSuspenseQuery>;
export type UserModelFullQueryResult = Apollo.QueryResult<
  SchemaTypes.UserModelFullQuery,
  SchemaTypes.UserModelFullQueryVariables
>;
export function refetchUserModelFullQuery(variables: SchemaTypes.UserModelFullQueryVariables) {
  return { query: UserModelFullDocument, variables: variables };
}
export const UsersModelFullDocument = gql`
  query UsersModelFull($ids: [UUID!]!) {
    users(IDs: $ids) {
      isContactable
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUsersModelFullQuery__
 *
 * To run a query within a React component, call `useUsersModelFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersModelFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersModelFullQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useUsersModelFullQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables> &
    ({ variables: SchemaTypes.UsersModelFullQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables>(
    UsersModelFullDocument,
    options
  );
}
export function useUsersModelFullLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables>(
    UsersModelFullDocument,
    options
  );
}
export function useUsersModelFullSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UsersModelFullQuery, SchemaTypes.UsersModelFullQueryVariables>(
    UsersModelFullDocument,
    options
  );
}
export type UsersModelFullQueryHookResult = ReturnType<typeof useUsersModelFullQuery>;
export type UsersModelFullLazyQueryHookResult = ReturnType<typeof useUsersModelFullLazyQuery>;
export type UsersModelFullSuspenseQueryHookResult = ReturnType<typeof useUsersModelFullSuspenseQuery>;
export type UsersModelFullQueryResult = Apollo.QueryResult<
  SchemaTypes.UsersModelFullQuery,
  SchemaTypes.UsersModelFullQueryVariables
>;
export function refetchUsersModelFullQuery(variables: SchemaTypes.UsersModelFullQueryVariables) {
  return { query: UsersModelFullDocument, variables: variables };
}
export const UserContributionsDocument = gql`
  query UserContributions($userId: UUID!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        roles
        subspaces {
          id
          level
          roles
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
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserContributionsQuery,
    SchemaTypes.UserContributionsQueryVariables
  > &
    ({ variables: SchemaTypes.UserContributionsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserContributionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserContributionsQuery, SchemaTypes.UserContributionsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserContributionsQuery, SchemaTypes.UserContributionsQueryVariables>(
    UserContributionsDocument,
    options
  );
}
export type UserContributionsQueryHookResult = ReturnType<typeof useUserContributionsQuery>;
export type UserContributionsLazyQueryHookResult = ReturnType<typeof useUserContributionsLazyQuery>;
export type UserContributionsSuspenseQueryHookResult = ReturnType<typeof useUserContributionsSuspenseQuery>;
export type UserContributionsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserContributionsQuery,
  SchemaTypes.UserContributionsQueryVariables
>;
export function refetchUserContributionsQuery(variables: SchemaTypes.UserContributionsQueryVariables) {
  return { query: UserContributionsDocument, variables: variables };
}
export const UserOrganizationIdsDocument = gql`
  query UserOrganizationIds($userId: UUID!) {
    rolesUser(rolesData: { userID: $userId }) {
      id
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
  > &
    ({ variables: SchemaTypes.UserOrganizationIdsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserOrganizationIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.UserOrganizationIdsQuery,
        SchemaTypes.UserOrganizationIdsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserOrganizationIdsQuery, SchemaTypes.UserOrganizationIdsQueryVariables>(
    UserOrganizationIdsDocument,
    options
  );
}
export type UserOrganizationIdsQueryHookResult = ReturnType<typeof useUserOrganizationIdsQuery>;
export type UserOrganizationIdsLazyQueryHookResult = ReturnType<typeof useUserOrganizationIdsLazyQuery>;
export type UserOrganizationIdsSuspenseQueryHookResult = ReturnType<typeof useUserOrganizationIdsSuspenseQuery>;
export type UserOrganizationIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserOrganizationIdsQuery,
  SchemaTypes.UserOrganizationIdsQueryVariables
>;
export function refetchUserOrganizationIdsQuery(variables: SchemaTypes.UserOrganizationIdsQueryVariables) {
  return { query: UserOrganizationIdsDocument, variables: variables };
}
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
export const UpdateUserSettingsDocument = gql`
  mutation updateUserSettings($settingsData: UpdateUserSettingsInput!) {
    updateUserSettings(settingsData: $settingsData) {
      id
      settings {
        notification {
          user {
            mentioned {
              email
              inApp
            }
            commentReply {
              email
              inApp
            }
            messageReceived {
              email
              inApp
            }
            membership {
              spaceCommunityInvitationReceived {
                email
                inApp
              }
              spaceCommunityJoined {
                email
                inApp
              }
            }
          }
          space {
            communicationUpdates {
              email
              inApp
            }
            collaborationCalloutPublished {
              email
              inApp
            }
            collaborationCalloutComment {
              email
              inApp
            }
            collaborationCalloutContributionCreated {
              email
              inApp
            }
            collaborationCalloutPostContributionComment {
              email
              inApp
            }
            admin {
              communityApplicationReceived {
                email
                inApp
              }
              communityNewMember {
                email
                inApp
              }
              collaborationCalloutContributionCreated {
                email
                inApp
              }
              communicationMessageReceived {
                email
                inApp
              }
            }
          }
          platform {
            forumDiscussionComment {
              email
              inApp
            }
            forumDiscussionCreated {
              email
              inApp
            }
            admin {
              userProfileCreated {
                email
                inApp
              }
              userProfileRemoved {
                email
                inApp
              }
              userGlobalRoleChanged {
                email
                inApp
              }
              spaceCreated {
                email
                inApp
              }
            }
          }
          organization {
            adminMentioned {
              email
              inApp
            }
            adminMessageReceived {
              email
              inApp
            }
          }
          virtualContributor {
            adminSpaceCommunityInvitation {
              email
              inApp
            }
          }
        }
      }
    }
  }
`;
export type UpdateUserSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateUserSettingsMutation,
  SchemaTypes.UpdateUserSettingsMutationVariables
>;

/**
 * __useUpdateUserSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateUserSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserSettingsMutation, { data, loading, error }] = useUpdateUserSettingsMutation({
 *   variables: {
 *      settingsData: // value for 'settingsData'
 *   },
 * });
 */
export function useUpdateUserSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateUserSettingsMutation,
    SchemaTypes.UpdateUserSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateUserSettingsMutation, SchemaTypes.UpdateUserSettingsMutationVariables>(
    UpdateUserSettingsDocument,
    options
  );
}
export type UpdateUserSettingsMutationHookResult = ReturnType<typeof useUpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationResult = Apollo.MutationResult<SchemaTypes.UpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateUserSettingsMutation,
  SchemaTypes.UpdateUserSettingsMutationVariables
>;
export const UserSettingsDocument = gql`
  query userSettings($userID: UUID!) {
    lookup {
      user(ID: $userID) {
        id
        settings {
          ...userSettingsFragment
        }
      }
    }
  }
  ${UserSettingsFragmentFragmentDoc}
`;

/**
 * __useUserSettingsQuery__
 *
 * To run a query within a React component, call `useUserSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSettingsQuery({
 *   variables: {
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useUserSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables> &
    ({ variables: SchemaTypes.UserSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>(
    UserSettingsDocument,
    options
  );
}
export function useUserSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>(
    UserSettingsDocument,
    options
  );
}
export function useUserSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>(
    UserSettingsDocument,
    options
  );
}
export type UserSettingsQueryHookResult = ReturnType<typeof useUserSettingsQuery>;
export type UserSettingsLazyQueryHookResult = ReturnType<typeof useUserSettingsLazyQuery>;
export type UserSettingsSuspenseQueryHookResult = ReturnType<typeof useUserSettingsSuspenseQuery>;
export type UserSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSettingsQuery,
  SchemaTypes.UserSettingsQueryVariables
>;
export function refetchUserSettingsQuery(variables: SchemaTypes.UserSettingsQueryVariables) {
  return { query: UserSettingsDocument, variables: variables };
}
export const CurrentUserFullDocument = gql`
  query CurrentUserFull {
    me {
      user {
        ...UserDetails
        account {
          id
          authorization {
            id
            myPrivileges
          }
          license {
            id
            availableEntitlements
          }
        }
      }
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useCurrentUserFullQuery__
 *
 * To run a query within a React component, call `useCurrentUserFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserFullQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserFullQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>(
    CurrentUserFullDocument,
    options
  );
}
export function useCurrentUserFullLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>(
    CurrentUserFullDocument,
    options
  );
}
export function useCurrentUserFullSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CurrentUserFullQuery, SchemaTypes.CurrentUserFullQueryVariables>(
    CurrentUserFullDocument,
    options
  );
}
export type CurrentUserFullQueryHookResult = ReturnType<typeof useCurrentUserFullQuery>;
export type CurrentUserFullLazyQueryHookResult = ReturnType<typeof useCurrentUserFullLazyQuery>;
export type CurrentUserFullSuspenseQueryHookResult = ReturnType<typeof useCurrentUserFullSuspenseQuery>;
export type CurrentUserFullQueryResult = Apollo.QueryResult<
  SchemaTypes.CurrentUserFullQuery,
  SchemaTypes.CurrentUserFullQueryVariables
>;
export function refetchCurrentUserFullQuery(variables?: SchemaTypes.CurrentUserFullQueryVariables) {
  return { query: CurrentUserFullDocument, variables: variables };
}
export const CommunityAvailableVCsDocument = gql`
  query CommunityAvailableVCs($roleSetId: UUID!) {
    lookup {
      roleSet(ID: $roleSetId) {
        virtualContributorsInRoleInHierarchy(role: MEMBER) {
          id
          searchVisibility
          profile {
            id
            url
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
          }
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useCommunityAvailableVCsQuery__
 *
 * To run a query within a React component, call `useCommunityAvailableVCsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityAvailableVCsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityAvailableVCsQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *   },
 * });
 */
export function useCommunityAvailableVCsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityAvailableVCsQuery,
    SchemaTypes.CommunityAvailableVCsQueryVariables
  > &
    ({ variables: SchemaTypes.CommunityAvailableVCsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityAvailableVCsQuery, SchemaTypes.CommunityAvailableVCsQueryVariables>(
    CommunityAvailableVCsDocument,
    options
  );
}
export function useCommunityAvailableVCsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityAvailableVCsQuery,
    SchemaTypes.CommunityAvailableVCsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityAvailableVCsQuery, SchemaTypes.CommunityAvailableVCsQueryVariables>(
    CommunityAvailableVCsDocument,
    options
  );
}
export function useCommunityAvailableVCsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CommunityAvailableVCsQuery,
        SchemaTypes.CommunityAvailableVCsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CommunityAvailableVCsQuery,
    SchemaTypes.CommunityAvailableVCsQueryVariables
  >(CommunityAvailableVCsDocument, options);
}
export type CommunityAvailableVCsQueryHookResult = ReturnType<typeof useCommunityAvailableVCsQuery>;
export type CommunityAvailableVCsLazyQueryHookResult = ReturnType<typeof useCommunityAvailableVCsLazyQuery>;
export type CommunityAvailableVCsSuspenseQueryHookResult = ReturnType<typeof useCommunityAvailableVCsSuspenseQuery>;
export type CommunityAvailableVCsQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityAvailableVCsQuery,
  SchemaTypes.CommunityAvailableVCsQueryVariables
>;
export function refetchCommunityAvailableVCsQuery(variables: SchemaTypes.CommunityAvailableVCsQueryVariables) {
  return { query: CommunityAvailableVCsDocument, variables: variables };
}
export const AiPersonaDocument = gql`
  query AiPersona($id: UUID!) {
    virtualContributor(ID: $id) {
      id
      aiPersona {
        id
        prompt
        engine
        externalConfig {
          apiKey
          assistantId
          model
        }
      }
    }
  }
`;

/**
 * __useAiPersonaQuery__
 *
 * To run a query within a React component, call `useAiPersonaQuery` and pass it any options that fit your needs.
 * When your component renders, `useAiPersonaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiPersonaQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAiPersonaQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables> &
    ({ variables: SchemaTypes.AiPersonaQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>(AiPersonaDocument, options);
}
export function useAiPersonaLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>(
    AiPersonaDocument,
    options
  );
}
export function useAiPersonaSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>(
    AiPersonaDocument,
    options
  );
}
export type AiPersonaQueryHookResult = ReturnType<typeof useAiPersonaQuery>;
export type AiPersonaLazyQueryHookResult = ReturnType<typeof useAiPersonaLazyQuery>;
export type AiPersonaSuspenseQueryHookResult = ReturnType<typeof useAiPersonaSuspenseQuery>;
export type AiPersonaQueryResult = Apollo.QueryResult<SchemaTypes.AiPersonaQuery, SchemaTypes.AiPersonaQueryVariables>;
export function refetchAiPersonaQuery(variables: SchemaTypes.AiPersonaQueryVariables) {
  return { query: AiPersonaDocument, variables: variables };
}
export const VirtualContributorDocument = gql`
  query VirtualContributor($id: UUID!) {
    lookup {
      virtualContributor(ID: $id) {
        id
        authorization {
          id
          myPrivileges
        }
        settings {
          privacy {
            knowledgeBaseContentVisible
          }
        }
        searchVisibility
        listedInStore
        status
        bodyOfKnowledgeID
        bodyOfKnowledgeType
        bodyOfKnowledgeDescription
        aiPersona {
          id
          engine
        }
        profile {
          id
          displayName
          description
          tagline
          tagsets {
            ...TagsetDetails
          }
          url
          avatar: visual(type: AVATAR) {
            ...VisualModelFull
          }
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
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFullFragmentDoc}
`;

/**
 * __useVirtualContributorQuery__
 *
 * To run a query within a React component, call `useVirtualContributorQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorQuery,
    SchemaTypes.VirtualContributorQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.VirtualContributorQuery, SchemaTypes.VirtualContributorQueryVariables>(
    VirtualContributorDocument,
    options
  );
}
export function useVirtualContributorLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorQuery,
    SchemaTypes.VirtualContributorQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.VirtualContributorQuery, SchemaTypes.VirtualContributorQueryVariables>(
    VirtualContributorDocument,
    options
  );
}
export function useVirtualContributorSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.VirtualContributorQuery, SchemaTypes.VirtualContributorQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.VirtualContributorQuery, SchemaTypes.VirtualContributorQueryVariables>(
    VirtualContributorDocument,
    options
  );
}
export type VirtualContributorQueryHookResult = ReturnType<typeof useVirtualContributorQuery>;
export type VirtualContributorLazyQueryHookResult = ReturnType<typeof useVirtualContributorLazyQuery>;
export type VirtualContributorSuspenseQueryHookResult = ReturnType<typeof useVirtualContributorSuspenseQuery>;
export type VirtualContributorQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorQuery,
  SchemaTypes.VirtualContributorQueryVariables
>;
export function refetchVirtualContributorQuery(variables: SchemaTypes.VirtualContributorQueryVariables) {
  return { query: VirtualContributorDocument, variables: variables };
}
export const VirtualContributorProfileDocument = gql`
  query VirtualContributorProfile($id: UUID!) {
    lookup {
      virtualContributor(ID: $id) {
        id
        profile {
          id
          displayName
          tagline
          tagsets {
            ...TagsetDetails
          }
          url
          avatar: visual(type: AVATAR) {
            ...VisualModel
          }
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
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;

/**
 * __useVirtualContributorProfileQuery__
 *
 * To run a query within a React component, call `useVirtualContributorProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorProfileQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorProfileQuery,
    SchemaTypes.VirtualContributorProfileQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorProfileQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorProfileQuery,
    SchemaTypes.VirtualContributorProfileQueryVariables
  >(VirtualContributorProfileDocument, options);
}
export function useVirtualContributorProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorProfileQuery,
    SchemaTypes.VirtualContributorProfileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorProfileQuery,
    SchemaTypes.VirtualContributorProfileQueryVariables
  >(VirtualContributorProfileDocument, options);
}
export function useVirtualContributorProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorProfileQuery,
        SchemaTypes.VirtualContributorProfileQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorProfileQuery,
    SchemaTypes.VirtualContributorProfileQueryVariables
  >(VirtualContributorProfileDocument, options);
}
export type VirtualContributorProfileQueryHookResult = ReturnType<typeof useVirtualContributorProfileQuery>;
export type VirtualContributorProfileLazyQueryHookResult = ReturnType<typeof useVirtualContributorProfileLazyQuery>;
export type VirtualContributorProfileSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorProfileSuspenseQuery
>;
export type VirtualContributorProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorProfileQuery,
  SchemaTypes.VirtualContributorProfileQueryVariables
>;
export function refetchVirtualContributorProfileQuery(variables: SchemaTypes.VirtualContributorProfileQueryVariables) {
  return { query: VirtualContributorProfileDocument, variables: variables };
}
export const VirtualContributorProviderDocument = gql`
  query VirtualContributorProvider($id: UUID!) {
    lookup {
      virtualContributor(ID: $id) {
        id
        provider {
          id
          profile {
            id
            displayName
            url
            location {
              country
              city
            }
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
            tagsets {
              id
              tags
            }
          }
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useVirtualContributorProviderQuery__
 *
 * To run a query within a React component, call `useVirtualContributorProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorProviderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorProviderQuery,
    SchemaTypes.VirtualContributorProviderQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorProviderQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorProviderQuery,
    SchemaTypes.VirtualContributorProviderQueryVariables
  >(VirtualContributorProviderDocument, options);
}
export function useVirtualContributorProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorProviderQuery,
    SchemaTypes.VirtualContributorProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorProviderQuery,
    SchemaTypes.VirtualContributorProviderQueryVariables
  >(VirtualContributorProviderDocument, options);
}
export function useVirtualContributorProviderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorProviderQuery,
        SchemaTypes.VirtualContributorProviderQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorProviderQuery,
    SchemaTypes.VirtualContributorProviderQueryVariables
  >(VirtualContributorProviderDocument, options);
}
export type VirtualContributorProviderQueryHookResult = ReturnType<typeof useVirtualContributorProviderQuery>;
export type VirtualContributorProviderLazyQueryHookResult = ReturnType<typeof useVirtualContributorProviderLazyQuery>;
export type VirtualContributorProviderSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorProviderSuspenseQuery
>;
export type VirtualContributorProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorProviderQuery,
  SchemaTypes.VirtualContributorProviderQueryVariables
>;
export function refetchVirtualContributorProviderQuery(
  variables: SchemaTypes.VirtualContributorProviderQueryVariables
) {
  return { query: VirtualContributorProviderDocument, variables: variables };
}
export const SpaceBodyOfKnowledgeAuthorizationPrivilegesDocument = gql`
  query SpaceBodyOfKnowledgeAuthorizationPrivileges($spaceId: UUID!) {
    lookup {
      myPrivileges {
        space(ID: $spaceId)
      }
    }
  }
`;

/**
 * __useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery__
 *
 * To run a query within a React component, call `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
  > &
    (
      | { variables: SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
  >(SpaceBodyOfKnowledgeAuthorizationPrivilegesDocument, options);
}
export function useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
  >(SpaceBodyOfKnowledgeAuthorizationPrivilegesDocument, options);
}
export function useSpaceBodyOfKnowledgeAuthorizationPrivilegesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
        SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
  >(SpaceBodyOfKnowledgeAuthorizationPrivilegesDocument, options);
}
export type SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryHookResult = ReturnType<
  typeof useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery
>;
export type SpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQueryHookResult = ReturnType<
  typeof useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery
>;
export type SpaceBodyOfKnowledgeAuthorizationPrivilegesSuspenseQueryHookResult = ReturnType<
  typeof useSpaceBodyOfKnowledgeAuthorizationPrivilegesSuspenseQuery
>;
export type SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
>;
export function refetchSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery(
  variables: SchemaTypes.SpaceBodyOfKnowledgeAuthorizationPrivilegesQueryVariables
) {
  return { query: SpaceBodyOfKnowledgeAuthorizationPrivilegesDocument, variables: variables };
}
export const SpaceBodyOfKnowledgeAboutDocument = gql`
  query SpaceBodyOfKnowledgeAbout($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutLight
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __useSpaceBodyOfKnowledgeAboutQuery__
 *
 * To run a query within a React component, call `useSpaceBodyOfKnowledgeAboutQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceBodyOfKnowledgeAboutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceBodyOfKnowledgeAboutQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceBodyOfKnowledgeAboutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
  >(SpaceBodyOfKnowledgeAboutDocument, options);
}
export function useSpaceBodyOfKnowledgeAboutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
  >(SpaceBodyOfKnowledgeAboutDocument, options);
}
export function useSpaceBodyOfKnowledgeAboutSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
        SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
    SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
  >(SpaceBodyOfKnowledgeAboutDocument, options);
}
export type SpaceBodyOfKnowledgeAboutQueryHookResult = ReturnType<typeof useSpaceBodyOfKnowledgeAboutQuery>;
export type SpaceBodyOfKnowledgeAboutLazyQueryHookResult = ReturnType<typeof useSpaceBodyOfKnowledgeAboutLazyQuery>;
export type SpaceBodyOfKnowledgeAboutSuspenseQueryHookResult = ReturnType<
  typeof useSpaceBodyOfKnowledgeAboutSuspenseQuery
>;
export type SpaceBodyOfKnowledgeAboutQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceBodyOfKnowledgeAboutQuery,
  SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables
>;
export function refetchSpaceBodyOfKnowledgeAboutQuery(variables: SchemaTypes.SpaceBodyOfKnowledgeAboutQueryVariables) {
  return { query: SpaceBodyOfKnowledgeAboutDocument, variables: variables };
}
export const VirtualContributorProfileWithModelCardDocument = gql`
  query VirtualContributorProfileWithModelCard($id: UUID!) {
    lookup {
      virtualContributor(ID: $id) {
        id
        authorization {
          id
          myPrivileges
        }
        settings {
          privacy {
            knowledgeBaseContentVisible
          }
        }
        searchVisibility
        listedInStore
        status
        ...VirtualContributorWithModelCard
        profile {
          id
          displayName
          description
          tagline
          tagsets {
            ...TagsetDetails
          }
          url
          avatar: visual(type: AVATAR) {
            ...VisualModel
          }
          references {
            id
            name
            uri
            description
          }
        }
        provider {
          id
          profile {
            id
            displayName
            description
            tagline
            url
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
          }
        }
      }
    }
  }
  ${VirtualContributorWithModelCardFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualModelFragmentDoc}
`;

/**
 * __useVirtualContributorProfileWithModelCardQuery__
 *
 * To run a query within a React component, call `useVirtualContributorProfileWithModelCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorProfileWithModelCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorProfileWithModelCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorProfileWithModelCardQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorProfileWithModelCardQuery,
    SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
  > &
    (
      | { variables: SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorProfileWithModelCardQuery,
    SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
  >(VirtualContributorProfileWithModelCardDocument, options);
}
export function useVirtualContributorProfileWithModelCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorProfileWithModelCardQuery,
    SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorProfileWithModelCardQuery,
    SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
  >(VirtualContributorProfileWithModelCardDocument, options);
}
export function useVirtualContributorProfileWithModelCardSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorProfileWithModelCardQuery,
        SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorProfileWithModelCardQuery,
    SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
  >(VirtualContributorProfileWithModelCardDocument, options);
}
export type VirtualContributorProfileWithModelCardQueryHookResult = ReturnType<
  typeof useVirtualContributorProfileWithModelCardQuery
>;
export type VirtualContributorProfileWithModelCardLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorProfileWithModelCardLazyQuery
>;
export type VirtualContributorProfileWithModelCardSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorProfileWithModelCardSuspenseQuery
>;
export type VirtualContributorProfileWithModelCardQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorProfileWithModelCardQuery,
  SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
>;
export function refetchVirtualContributorProfileWithModelCardQuery(
  variables: SchemaTypes.VirtualContributorProfileWithModelCardQueryVariables
) {
  return { query: VirtualContributorProfileWithModelCardDocument, variables: variables };
}
export const UpdateAiPersonaDocument = gql`
  mutation updateAiPersona($aiPersonaData: UpdateAiPersonaInput!) {
    aiServerUpdateAiPersona(aiPersonaData: $aiPersonaData) {
      id
      prompt
      externalConfig {
        apiKey
      }
    }
  }
`;
export type UpdateAiPersonaMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateAiPersonaMutation,
  SchemaTypes.UpdateAiPersonaMutationVariables
>;

/**
 * __useUpdateAiPersonaMutation__
 *
 * To run a mutation, you first call `useUpdateAiPersonaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAiPersonaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAiPersonaMutation, { data, loading, error }] = useUpdateAiPersonaMutation({
 *   variables: {
 *      aiPersonaData: // value for 'aiPersonaData'
 *   },
 * });
 */
export function useUpdateAiPersonaMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateAiPersonaMutation,
    SchemaTypes.UpdateAiPersonaMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateAiPersonaMutation, SchemaTypes.UpdateAiPersonaMutationVariables>(
    UpdateAiPersonaDocument,
    options
  );
}
export type UpdateAiPersonaMutationHookResult = ReturnType<typeof useUpdateAiPersonaMutation>;
export type UpdateAiPersonaMutationResult = Apollo.MutationResult<SchemaTypes.UpdateAiPersonaMutation>;
export type UpdateAiPersonaMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateAiPersonaMutation,
  SchemaTypes.UpdateAiPersonaMutationVariables
>;
export const RefreshBodyOfKnowledgeDocument = gql`
  mutation refreshBodyOfKnowledge($refreshData: RefreshVirtualContributorBodyOfKnowledgeInput!) {
    refreshVirtualContributorBodyOfKnowledge(refreshData: $refreshData)
  }
`;
export type RefreshBodyOfKnowledgeMutationFn = Apollo.MutationFunction<
  SchemaTypes.RefreshBodyOfKnowledgeMutation,
  SchemaTypes.RefreshBodyOfKnowledgeMutationVariables
>;

/**
 * __useRefreshBodyOfKnowledgeMutation__
 *
 * To run a mutation, you first call `useRefreshBodyOfKnowledgeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshBodyOfKnowledgeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshBodyOfKnowledgeMutation, { data, loading, error }] = useRefreshBodyOfKnowledgeMutation({
 *   variables: {
 *      refreshData: // value for 'refreshData'
 *   },
 * });
 */
export function useRefreshBodyOfKnowledgeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RefreshBodyOfKnowledgeMutation,
    SchemaTypes.RefreshBodyOfKnowledgeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RefreshBodyOfKnowledgeMutation,
    SchemaTypes.RefreshBodyOfKnowledgeMutationVariables
  >(RefreshBodyOfKnowledgeDocument, options);
}
export type RefreshBodyOfKnowledgeMutationHookResult = ReturnType<typeof useRefreshBodyOfKnowledgeMutation>;
export type RefreshBodyOfKnowledgeMutationResult = Apollo.MutationResult<SchemaTypes.RefreshBodyOfKnowledgeMutation>;
export type RefreshBodyOfKnowledgeMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RefreshBodyOfKnowledgeMutation,
  SchemaTypes.RefreshBodyOfKnowledgeMutationVariables
>;
export const UpdateVirtualContributorDocument = gql`
  mutation UpdateVirtualContributor($virtualContributorData: UpdateVirtualContributorInput!) {
    updateVirtualContributor(virtualContributorData: $virtualContributorData) {
      id
      listedInStore
      status
      searchVisibility
      settings {
        privacy {
          knowledgeBaseContentVisible
        }
      }
      profile {
        id
        tagline
        tagsets {
          ...TagsetDetails
        }
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
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdateVirtualContributorMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateVirtualContributorMutation,
  SchemaTypes.UpdateVirtualContributorMutationVariables
>;

/**
 * __useUpdateVirtualContributorMutation__
 *
 * To run a mutation, you first call `useUpdateVirtualContributorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVirtualContributorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVirtualContributorMutation, { data, loading, error }] = useUpdateVirtualContributorMutation({
 *   variables: {
 *      virtualContributorData: // value for 'virtualContributorData'
 *   },
 * });
 */
export function useUpdateVirtualContributorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateVirtualContributorMutation,
    SchemaTypes.UpdateVirtualContributorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateVirtualContributorMutation,
    SchemaTypes.UpdateVirtualContributorMutationVariables
  >(UpdateVirtualContributorDocument, options);
}
export type UpdateVirtualContributorMutationHookResult = ReturnType<typeof useUpdateVirtualContributorMutation>;
export type UpdateVirtualContributorMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateVirtualContributorMutation>;
export type UpdateVirtualContributorMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateVirtualContributorMutation,
  SchemaTypes.UpdateVirtualContributorMutationVariables
>;
export const UpdateVirtualContributorSettingsDocument = gql`
  mutation UpdateVirtualContributorSettings($settingsData: UpdateVirtualContributorSettingsInput!) {
    updateVirtualContributorSettings(settingsData: $settingsData) {
      id
      listedInStore
      status
      searchVisibility
      settings {
        privacy {
          knowledgeBaseContentVisible
        }
      }
      profile {
        id
        tagline
        tagsets {
          ...TagsetDetails
        }
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
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdateVirtualContributorSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateVirtualContributorSettingsMutation,
  SchemaTypes.UpdateVirtualContributorSettingsMutationVariables
>;

/**
 * __useUpdateVirtualContributorSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateVirtualContributorSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVirtualContributorSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVirtualContributorSettingsMutation, { data, loading, error }] = useUpdateVirtualContributorSettingsMutation({
 *   variables: {
 *      settingsData: // value for 'settingsData'
 *   },
 * });
 */
export function useUpdateVirtualContributorSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateVirtualContributorSettingsMutation,
    SchemaTypes.UpdateVirtualContributorSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateVirtualContributorSettingsMutation,
    SchemaTypes.UpdateVirtualContributorSettingsMutationVariables
  >(UpdateVirtualContributorSettingsDocument, options);
}
export type UpdateVirtualContributorSettingsMutationHookResult = ReturnType<
  typeof useUpdateVirtualContributorSettingsMutation
>;
export type UpdateVirtualContributorSettingsMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateVirtualContributorSettingsMutation>;
export type UpdateVirtualContributorSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateVirtualContributorSettingsMutation,
  SchemaTypes.UpdateVirtualContributorSettingsMutationVariables
>;
export const VirtualContributorUpdatesDocument = gql`
  subscription virtualContributorUpdates($virtualContributorID: UUID!) {
    virtualContributorUpdated(virtualContributorID: $virtualContributorID) {
      virtualContributor {
        id
        status
      }
    }
  }
`;

/**
 * __useVirtualContributorUpdatesSubscription__
 *
 * To run a query within a React component, call `useVirtualContributorUpdatesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorUpdatesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorUpdatesSubscription({
 *   variables: {
 *      virtualContributorID: // value for 'virtualContributorID'
 *   },
 * });
 */
export function useVirtualContributorUpdatesSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.VirtualContributorUpdatesSubscription,
    SchemaTypes.VirtualContributorUpdatesSubscriptionVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorUpdatesSubscriptionVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.VirtualContributorUpdatesSubscription,
    SchemaTypes.VirtualContributorUpdatesSubscriptionVariables
  >(VirtualContributorUpdatesDocument, options);
}
export type VirtualContributorUpdatesSubscriptionHookResult = ReturnType<
  typeof useVirtualContributorUpdatesSubscription
>;
export type VirtualContributorUpdatesSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.VirtualContributorUpdatesSubscription>;
export const VirtualContributorKnowledgeBaseLastUpdatedDocument = gql`
  query VirtualContributorKnowledgeBaseLastUpdated($id: UUID!) {
    virtualContributor(ID: $id) {
      id
      aiPersona {
        id
        bodyOfKnowledgeLastUpdated
      }
    }
  }
`;

/**
 * __useVirtualContributorKnowledgeBaseLastUpdatedQuery__
 *
 * To run a query within a React component, call `useVirtualContributorKnowledgeBaseLastUpdatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorKnowledgeBaseLastUpdatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorKnowledgeBaseLastUpdatedQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorKnowledgeBaseLastUpdatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
  > &
    (
      | { variables: SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
  >(VirtualContributorKnowledgeBaseLastUpdatedDocument, options);
}
export function useVirtualContributorKnowledgeBaseLastUpdatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
  >(VirtualContributorKnowledgeBaseLastUpdatedDocument, options);
}
export function useVirtualContributorKnowledgeBaseLastUpdatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
        SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
  >(VirtualContributorKnowledgeBaseLastUpdatedDocument, options);
}
export type VirtualContributorKnowledgeBaseLastUpdatedQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseLastUpdatedQuery
>;
export type VirtualContributorKnowledgeBaseLastUpdatedLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseLastUpdatedLazyQuery
>;
export type VirtualContributorKnowledgeBaseLastUpdatedSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseLastUpdatedSuspenseQuery
>;
export type VirtualContributorKnowledgeBaseLastUpdatedQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQuery,
  SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
>;
export function refetchVirtualContributorKnowledgeBaseLastUpdatedQuery(
  variables: SchemaTypes.VirtualContributorKnowledgeBaseLastUpdatedQueryVariables
) {
  return { query: VirtualContributorKnowledgeBaseLastUpdatedDocument, variables: variables };
}
export const VirtualContributorKnowledgeBaseDocument = gql`
  query VirtualContributorKnowledgeBase($id: UUID!) {
    virtualContributor(ID: $id) {
      id
      knowledgeBase {
        id
        authorization {
          id
          myPrivileges
        }
        profile {
          id
          displayName
          description
        }
        calloutsSet {
          id
        }
      }
    }
  }
`;

/**
 * __useVirtualContributorKnowledgeBaseQuery__
 *
 * To run a query within a React component, call `useVirtualContributorKnowledgeBaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorKnowledgeBaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorKnowledgeBaseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorKnowledgeBaseQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgeBaseQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
  >(VirtualContributorKnowledgeBaseDocument, options);
}
export function useVirtualContributorKnowledgeBaseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgeBaseQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
  >(VirtualContributorKnowledgeBaseDocument, options);
}
export function useVirtualContributorKnowledgeBaseSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorKnowledgeBaseQuery,
        SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorKnowledgeBaseQuery,
    SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
  >(VirtualContributorKnowledgeBaseDocument, options);
}
export type VirtualContributorKnowledgeBaseQueryHookResult = ReturnType<typeof useVirtualContributorKnowledgeBaseQuery>;
export type VirtualContributorKnowledgeBaseLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseLazyQuery
>;
export type VirtualContributorKnowledgeBaseSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseSuspenseQuery
>;
export type VirtualContributorKnowledgeBaseQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorKnowledgeBaseQuery,
  SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
>;
export function refetchVirtualContributorKnowledgeBaseQuery(
  variables: SchemaTypes.VirtualContributorKnowledgeBaseQueryVariables
) {
  return { query: VirtualContributorKnowledgeBaseDocument, variables: variables };
}
export const VirtualContributorKnowledgePrivilegesDocument = gql`
  query VirtualContributorKnowledgePrivileges($id: UUID!) {
    virtualContributor(ID: $id) {
      id
      knowledgeBase {
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
 * __useVirtualContributorKnowledgePrivilegesQuery__
 *
 * To run a query within a React component, call `useVirtualContributorKnowledgePrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorKnowledgePrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorKnowledgePrivilegesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVirtualContributorKnowledgePrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
    SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
    SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
  >(VirtualContributorKnowledgePrivilegesDocument, options);
}
export function useVirtualContributorKnowledgePrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
    SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
    SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
  >(VirtualContributorKnowledgePrivilegesDocument, options);
}
export function useVirtualContributorKnowledgePrivilegesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
        SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
    SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
  >(VirtualContributorKnowledgePrivilegesDocument, options);
}
export type VirtualContributorKnowledgePrivilegesQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgePrivilegesQuery
>;
export type VirtualContributorKnowledgePrivilegesLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgePrivilegesLazyQuery
>;
export type VirtualContributorKnowledgePrivilegesSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgePrivilegesSuspenseQuery
>;
export type VirtualContributorKnowledgePrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorKnowledgePrivilegesQuery,
  SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
>;
export function refetchVirtualContributorKnowledgePrivilegesQuery(
  variables: SchemaTypes.VirtualContributorKnowledgePrivilegesQueryVariables
) {
  return { query: VirtualContributorKnowledgePrivilegesDocument, variables: variables };
}
export const VcMembershipsDocument = gql`
  query VCMemberships($virtualContributorId: UUID!) {
    lookup {
      virtualContributor(ID: $virtualContributorId) {
        id
        authorization {
          id
          myPrivileges
        }
      }
    }
    rolesVirtualContributor(rolesData: { virtualContributorID: $virtualContributorId }) {
      spaces {
        id
        subspaces {
          id
          level
        }
      }
    }
    me {
      id
      communityInvitations(states: ["invited"]) {
        ...InvitationData
      }
    }
  }
  ${InvitationDataFragmentDoc}
`;

/**
 * __useVcMembershipsQuery__
 *
 * To run a query within a React component, call `useVcMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useVcMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVcMembershipsQuery({
 *   variables: {
 *      virtualContributorId: // value for 'virtualContributorId'
 *   },
 * });
 */
export function useVcMembershipsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables> &
    ({ variables: SchemaTypes.VcMembershipsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>(
    VcMembershipsDocument,
    options
  );
}
export function useVcMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>(
    VcMembershipsDocument,
    options
  );
}
export function useVcMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>(
    VcMembershipsDocument,
    options
  );
}
export type VcMembershipsQueryHookResult = ReturnType<typeof useVcMembershipsQuery>;
export type VcMembershipsLazyQueryHookResult = ReturnType<typeof useVcMembershipsLazyQuery>;
export type VcMembershipsSuspenseQueryHookResult = ReturnType<typeof useVcMembershipsSuspenseQuery>;
export type VcMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.VcMembershipsQuery,
  SchemaTypes.VcMembershipsQueryVariables
>;
export function refetchVcMembershipsQuery(variables: SchemaTypes.VcMembershipsQueryVariables) {
  return { query: VcMembershipsDocument, variables: variables };
}
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
export function useBannerInnovationHubSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.BannerInnovationHubQuery,
        SchemaTypes.BannerInnovationHubQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.BannerInnovationHubQuery, SchemaTypes.BannerInnovationHubQueryVariables>(
    BannerInnovationHubDocument,
    options
  );
}
export type BannerInnovationHubQueryHookResult = ReturnType<typeof useBannerInnovationHubQuery>;
export type BannerInnovationHubLazyQueryHookResult = ReturnType<typeof useBannerInnovationHubLazyQuery>;
export type BannerInnovationHubSuspenseQueryHookResult = ReturnType<typeof useBannerInnovationHubSuspenseQuery>;
export type BannerInnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.BannerInnovationHubQuery,
  SchemaTypes.BannerInnovationHubQueryVariables
>;
export function refetchBannerInnovationHubQuery(variables?: SchemaTypes.BannerInnovationHubQueryVariables) {
  return { query: BannerInnovationHubDocument, variables: variables };
}
export const InnovationHubBannerWideDocument = gql`
  query InnovationHubBannerWide {
    platform {
      innovationHub {
        id
        profile {
          id
          displayName
          bannerWide: visual(type: BANNER_WIDE) {
            id
            ...VisualModel
          }
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useInnovationHubBannerWideQuery__
 *
 * To run a query within a React component, call `useInnovationHubBannerWideQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationHubBannerWideQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationHubBannerWideQuery({
 *   variables: {
 *   },
 * });
 */
export function useInnovationHubBannerWideQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.InnovationHubBannerWideQuery,
    SchemaTypes.InnovationHubBannerWideQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationHubBannerWideQuery, SchemaTypes.InnovationHubBannerWideQueryVariables>(
    InnovationHubBannerWideDocument,
    options
  );
}
export function useInnovationHubBannerWideLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationHubBannerWideQuery,
    SchemaTypes.InnovationHubBannerWideQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationHubBannerWideQuery,
    SchemaTypes.InnovationHubBannerWideQueryVariables
  >(InnovationHubBannerWideDocument, options);
}
export function useInnovationHubBannerWideSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationHubBannerWideQuery,
        SchemaTypes.InnovationHubBannerWideQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationHubBannerWideQuery,
    SchemaTypes.InnovationHubBannerWideQueryVariables
  >(InnovationHubBannerWideDocument, options);
}
export type InnovationHubBannerWideQueryHookResult = ReturnType<typeof useInnovationHubBannerWideQuery>;
export type InnovationHubBannerWideLazyQueryHookResult = ReturnType<typeof useInnovationHubBannerWideLazyQuery>;
export type InnovationHubBannerWideSuspenseQueryHookResult = ReturnType<typeof useInnovationHubBannerWideSuspenseQuery>;
export type InnovationHubBannerWideQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubBannerWideQuery,
  SchemaTypes.InnovationHubBannerWideQueryVariables
>;
export function refetchInnovationHubBannerWideQuery(variables?: SchemaTypes.InnovationHubBannerWideQueryVariables) {
  return { query: InnovationHubBannerWideDocument, variables: variables };
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
export function useDashboardSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.DashboardSpacesQuery, SchemaTypes.DashboardSpacesQueryVariables>(
    DashboardSpacesDocument,
    options
  );
}
export type DashboardSpacesQueryHookResult = ReturnType<typeof useDashboardSpacesQuery>;
export type DashboardSpacesLazyQueryHookResult = ReturnType<typeof useDashboardSpacesLazyQuery>;
export type DashboardSpacesSuspenseQueryHookResult = ReturnType<typeof useDashboardSpacesSuspenseQuery>;
export type DashboardSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.DashboardSpacesQuery,
  SchemaTypes.DashboardSpacesQueryVariables
>;
export function refetchDashboardSpacesQuery(variables?: SchemaTypes.DashboardSpacesQueryVariables) {
  return { query: DashboardSpacesDocument, variables: variables };
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
export const CreateInnovationHubDocument = gql`
  mutation createInnovationHub($hubData: CreateInnovationHubOnAccountInput!) {
    createInnovationHub(createData: $hubData) {
      ...InnovationHubSettings
    }
  }
  ${InnovationHubSettingsFragmentDoc}
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
      ...InnovationHubSettings
    }
  }
  ${InnovationHubSettingsFragmentDoc}
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
export function useInnovationHubAvailableSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationHubAvailableSpacesQuery,
        SchemaTypes.InnovationHubAvailableSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationHubAvailableSpacesQuery,
    SchemaTypes.InnovationHubAvailableSpacesQueryVariables
  >(InnovationHubAvailableSpacesDocument, options);
}
export type InnovationHubAvailableSpacesQueryHookResult = ReturnType<typeof useInnovationHubAvailableSpacesQuery>;
export type InnovationHubAvailableSpacesLazyQueryHookResult = ReturnType<
  typeof useInnovationHubAvailableSpacesLazyQuery
>;
export type InnovationHubAvailableSpacesSuspenseQueryHookResult = ReturnType<
  typeof useInnovationHubAvailableSpacesSuspenseQuery
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
export const InnovationHubSettingsDocument = gql`
  query InnovationHubSettings($innovationHubId: UUID!) {
    platform {
      id
      innovationHub(id: $innovationHubId) {
        ...InnovationHubSettings
      }
    }
  }
  ${InnovationHubSettingsFragmentDoc}
`;

/**
 * __useInnovationHubSettingsQuery__
 *
 * To run a query within a React component, call `useInnovationHubSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationHubSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationHubSettingsQuery({
 *   variables: {
 *      innovationHubId: // value for 'innovationHubId'
 *   },
 * });
 */
export function useInnovationHubSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationHubSettingsQuery,
    SchemaTypes.InnovationHubSettingsQueryVariables
  > &
    ({ variables: SchemaTypes.InnovationHubSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InnovationHubSettingsQuery, SchemaTypes.InnovationHubSettingsQueryVariables>(
    InnovationHubSettingsDocument,
    options
  );
}
export function useInnovationHubSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationHubSettingsQuery,
    SchemaTypes.InnovationHubSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InnovationHubSettingsQuery, SchemaTypes.InnovationHubSettingsQueryVariables>(
    InnovationHubSettingsDocument,
    options
  );
}
export function useInnovationHubSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationHubSettingsQuery,
        SchemaTypes.InnovationHubSettingsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationHubSettingsQuery,
    SchemaTypes.InnovationHubSettingsQueryVariables
  >(InnovationHubSettingsDocument, options);
}
export type InnovationHubSettingsQueryHookResult = ReturnType<typeof useInnovationHubSettingsQuery>;
export type InnovationHubSettingsLazyQueryHookResult = ReturnType<typeof useInnovationHubSettingsLazyQuery>;
export type InnovationHubSettingsSuspenseQueryHookResult = ReturnType<typeof useInnovationHubSettingsSuspenseQuery>;
export type InnovationHubSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubSettingsQuery,
  SchemaTypes.InnovationHubSettingsQueryVariables
>;
export function refetchInnovationHubSettingsQuery(variables: SchemaTypes.InnovationHubSettingsQueryVariables) {
  return { query: InnovationHubSettingsDocument, variables: variables };
}
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
export function useInnovationHubSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.InnovationHubQuery, SchemaTypes.InnovationHubQueryVariables>(
    InnovationHubDocument,
    options
  );
}
export type InnovationHubQueryHookResult = ReturnType<typeof useInnovationHubQuery>;
export type InnovationHubLazyQueryHookResult = ReturnType<typeof useInnovationHubLazyQuery>;
export type InnovationHubSuspenseQueryHookResult = ReturnType<typeof useInnovationHubSuspenseQuery>;
export type InnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubQuery,
  SchemaTypes.InnovationHubQueryVariables
>;
export function refetchInnovationHubQuery(variables?: SchemaTypes.InnovationHubQueryVariables) {
  return { query: InnovationHubDocument, variables: variables };
}
export const PlatformLevelAuthorizationDocument = gql`
  query PlatformLevelAuthorization {
    platform {
      id
      roleSet {
        id
        myRoles
      }
      authorization {
        myPrivileges
      }
    }
  }
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
export function usePlatformLevelAuthorizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformLevelAuthorizationQuery,
        SchemaTypes.PlatformLevelAuthorizationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformLevelAuthorizationQuery,
    SchemaTypes.PlatformLevelAuthorizationQueryVariables
  >(PlatformLevelAuthorizationDocument, options);
}
export type PlatformLevelAuthorizationQueryHookResult = ReturnType<typeof usePlatformLevelAuthorizationQuery>;
export type PlatformLevelAuthorizationLazyQueryHookResult = ReturnType<typeof usePlatformLevelAuthorizationLazyQuery>;
export type PlatformLevelAuthorizationSuspenseQueryHookResult = ReturnType<
  typeof usePlatformLevelAuthorizationSuspenseQuery
>;
export type PlatformLevelAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformLevelAuthorizationQuery,
  SchemaTypes.PlatformLevelAuthorizationQueryVariables
>;
export function refetchPlatformLevelAuthorizationQuery(
  variables?: SchemaTypes.PlatformLevelAuthorizationQueryVariables
) {
  return { query: PlatformLevelAuthorizationDocument, variables: variables };
}
export const ConfigurationDocument = gql`
  query configuration {
    platform {
      configuration {
        ...Configuration
      }
      settings {
        integration {
          iframeAllowedUrls
        }
      }
      metadata {
        services {
          name
          version
        }
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
export function useConfigurationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ConfigurationQuery, SchemaTypes.ConfigurationQueryVariables>(
    ConfigurationDocument,
    options
  );
}
export type ConfigurationQueryHookResult = ReturnType<typeof useConfigurationQuery>;
export type ConfigurationLazyQueryHookResult = ReturnType<typeof useConfigurationLazyQuery>;
export type ConfigurationSuspenseQueryHookResult = ReturnType<typeof useConfigurationSuspenseQuery>;
export type ConfigurationQueryResult = Apollo.QueryResult<
  SchemaTypes.ConfigurationQuery,
  SchemaTypes.ConfigurationQueryVariables
>;
export function refetchConfigurationQuery(variables?: SchemaTypes.ConfigurationQueryVariables) {
  return { query: ConfigurationDocument, variables: variables };
}
export const PlatformLicensingPlansDocument = gql`
  query platformLicensingPlans {
    platform {
      licensingFramework {
        id
        plans {
          id
          type
          name
          sortOrder
          licenseCredential
        }
      }
    }
  }
`;

/**
 * __usePlatformLicensingPlansQuery__
 *
 * To run a query within a React component, call `usePlatformLicensingPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformLicensingPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformLicensingPlansQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformLicensingPlansQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformLicensingPlansQuery,
    SchemaTypes.PlatformLicensingPlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformLicensingPlansQuery, SchemaTypes.PlatformLicensingPlansQueryVariables>(
    PlatformLicensingPlansDocument,
    options
  );
}
export function usePlatformLicensingPlansLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformLicensingPlansQuery,
    SchemaTypes.PlatformLicensingPlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformLicensingPlansQuery, SchemaTypes.PlatformLicensingPlansQueryVariables>(
    PlatformLicensingPlansDocument,
    options
  );
}
export function usePlatformLicensingPlansSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformLicensingPlansQuery,
        SchemaTypes.PlatformLicensingPlansQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformLicensingPlansQuery,
    SchemaTypes.PlatformLicensingPlansQueryVariables
  >(PlatformLicensingPlansDocument, options);
}
export type PlatformLicensingPlansQueryHookResult = ReturnType<typeof usePlatformLicensingPlansQuery>;
export type PlatformLicensingPlansLazyQueryHookResult = ReturnType<typeof usePlatformLicensingPlansLazyQuery>;
export type PlatformLicensingPlansSuspenseQueryHookResult = ReturnType<typeof usePlatformLicensingPlansSuspenseQuery>;
export type PlatformLicensingPlansQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformLicensingPlansQuery,
  SchemaTypes.PlatformLicensingPlansQueryVariables
>;
export function refetchPlatformLicensingPlansQuery(variables?: SchemaTypes.PlatformLicensingPlansQueryVariables) {
  return { query: PlatformLicensingPlansDocument, variables: variables };
}
export const PlatformRoleSetDocument = gql`
  query PlatformRoleSet {
    platform {
      roleSet {
        id
      }
    }
  }
`;

/**
 * __usePlatformRoleSetQuery__
 *
 * To run a query within a React component, call `usePlatformRoleSetQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformRoleSetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformRoleSetQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformRoleSetQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>(
    PlatformRoleSetDocument,
    options
  );
}
export function usePlatformRoleSetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>(
    PlatformRoleSetDocument,
    options
  );
}
export function usePlatformRoleSetSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PlatformRoleSetQuery, SchemaTypes.PlatformRoleSetQueryVariables>(
    PlatformRoleSetDocument,
    options
  );
}
export type PlatformRoleSetQueryHookResult = ReturnType<typeof usePlatformRoleSetQuery>;
export type PlatformRoleSetLazyQueryHookResult = ReturnType<typeof usePlatformRoleSetLazyQuery>;
export type PlatformRoleSetSuspenseQueryHookResult = ReturnType<typeof usePlatformRoleSetSuspenseQuery>;
export type PlatformRoleSetQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformRoleSetQuery,
  SchemaTypes.PlatformRoleSetQueryVariables
>;
export function refetchPlatformRoleSetQuery(variables?: SchemaTypes.PlatformRoleSetQueryVariables) {
  return { query: PlatformRoleSetDocument, variables: variables };
}
export const PlatformAdminInnovationHubsDocument = gql`
  query PlatformAdminInnovationHubs {
    platformAdmin {
      innovationHubs {
        id
        subdomain
        profile {
          id
          displayName
          url
        }
      }
    }
  }
`;

/**
 * __usePlatformAdminInnovationHubsQuery__
 *
 * To run a query within a React component, call `usePlatformAdminInnovationHubsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminInnovationHubsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminInnovationHubsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformAdminInnovationHubsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminInnovationHubsQuery,
    SchemaTypes.PlatformAdminInnovationHubsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformAdminInnovationHubsQuery,
    SchemaTypes.PlatformAdminInnovationHubsQueryVariables
  >(PlatformAdminInnovationHubsDocument, options);
}
export function usePlatformAdminInnovationHubsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminInnovationHubsQuery,
    SchemaTypes.PlatformAdminInnovationHubsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformAdminInnovationHubsQuery,
    SchemaTypes.PlatformAdminInnovationHubsQueryVariables
  >(PlatformAdminInnovationHubsDocument, options);
}
export function usePlatformAdminInnovationHubsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminInnovationHubsQuery,
        SchemaTypes.PlatformAdminInnovationHubsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminInnovationHubsQuery,
    SchemaTypes.PlatformAdminInnovationHubsQueryVariables
  >(PlatformAdminInnovationHubsDocument, options);
}
export type PlatformAdminInnovationHubsQueryHookResult = ReturnType<typeof usePlatformAdminInnovationHubsQuery>;
export type PlatformAdminInnovationHubsLazyQueryHookResult = ReturnType<typeof usePlatformAdminInnovationHubsLazyQuery>;
export type PlatformAdminInnovationHubsSuspenseQueryHookResult = ReturnType<
  typeof usePlatformAdminInnovationHubsSuspenseQuery
>;
export type PlatformAdminInnovationHubsQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminInnovationHubsQuery,
  SchemaTypes.PlatformAdminInnovationHubsQueryVariables
>;
export function refetchPlatformAdminInnovationHubsQuery(
  variables?: SchemaTypes.PlatformAdminInnovationHubsQueryVariables
) {
  return { query: PlatformAdminInnovationHubsDocument, variables: variables };
}
export const PlatformAdminInnovationPacksDocument = gql`
  query PlatformAdminInnovationPacks {
    platformAdmin {
      innovationPacks {
        id
        profile {
          id
          displayName
          url
        }
      }
    }
  }
`;

/**
 * __usePlatformAdminInnovationPacksQuery__
 *
 * To run a query within a React component, call `usePlatformAdminInnovationPacksQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminInnovationPacksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminInnovationPacksQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformAdminInnovationPacksQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminInnovationPacksQuery,
    SchemaTypes.PlatformAdminInnovationPacksQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformAdminInnovationPacksQuery,
    SchemaTypes.PlatformAdminInnovationPacksQueryVariables
  >(PlatformAdminInnovationPacksDocument, options);
}
export function usePlatformAdminInnovationPacksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminInnovationPacksQuery,
    SchemaTypes.PlatformAdminInnovationPacksQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformAdminInnovationPacksQuery,
    SchemaTypes.PlatformAdminInnovationPacksQueryVariables
  >(PlatformAdminInnovationPacksDocument, options);
}
export function usePlatformAdminInnovationPacksSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminInnovationPacksQuery,
        SchemaTypes.PlatformAdminInnovationPacksQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminInnovationPacksQuery,
    SchemaTypes.PlatformAdminInnovationPacksQueryVariables
  >(PlatformAdminInnovationPacksDocument, options);
}
export type PlatformAdminInnovationPacksQueryHookResult = ReturnType<typeof usePlatformAdminInnovationPacksQuery>;
export type PlatformAdminInnovationPacksLazyQueryHookResult = ReturnType<
  typeof usePlatformAdminInnovationPacksLazyQuery
>;
export type PlatformAdminInnovationPacksSuspenseQueryHookResult = ReturnType<
  typeof usePlatformAdminInnovationPacksSuspenseQuery
>;
export type PlatformAdminInnovationPacksQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminInnovationPacksQuery,
  SchemaTypes.PlatformAdminInnovationPacksQueryVariables
>;
export function refetchPlatformAdminInnovationPacksQuery(
  variables?: SchemaTypes.PlatformAdminInnovationPacksQueryVariables
) {
  return { query: PlatformAdminInnovationPacksDocument, variables: variables };
}
export const AssignLicensePlanToAccountDocument = gql`
  mutation AssignLicensePlanToAccount($licensePlanId: UUID!, $accountId: UUID!, $licensingId: UUID!) {
    assignLicensePlanToAccount(
      planData: { accountID: $accountId, licensePlanID: $licensePlanId, licensingID: $licensingId }
    ) {
      id
    }
  }
`;
export type AssignLicensePlanToAccountMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignLicensePlanToAccountMutation,
  SchemaTypes.AssignLicensePlanToAccountMutationVariables
>;

/**
 * __useAssignLicensePlanToAccountMutation__
 *
 * To run a mutation, you first call `useAssignLicensePlanToAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignLicensePlanToAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignLicensePlanToAccountMutation, { data, loading, error }] = useAssignLicensePlanToAccountMutation({
 *   variables: {
 *      licensePlanId: // value for 'licensePlanId'
 *      accountId: // value for 'accountId'
 *      licensingId: // value for 'licensingId'
 *   },
 * });
 */
export function useAssignLicensePlanToAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignLicensePlanToAccountMutation,
    SchemaTypes.AssignLicensePlanToAccountMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignLicensePlanToAccountMutation,
    SchemaTypes.AssignLicensePlanToAccountMutationVariables
  >(AssignLicensePlanToAccountDocument, options);
}
export type AssignLicensePlanToAccountMutationHookResult = ReturnType<typeof useAssignLicensePlanToAccountMutation>;
export type AssignLicensePlanToAccountMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignLicensePlanToAccountMutation>;
export type AssignLicensePlanToAccountMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignLicensePlanToAccountMutation,
  SchemaTypes.AssignLicensePlanToAccountMutationVariables
>;
export const RevokeLicensePlanFromAccountDocument = gql`
  mutation RevokeLicensePlanFromAccount($licensePlanId: UUID!, $accountId: UUID!, $licensingId: UUID!) {
    revokeLicensePlanFromAccount(
      planData: { accountID: $accountId, licensePlanID: $licensePlanId, licensingID: $licensingId }
    ) {
      id
    }
  }
`;
export type RevokeLicensePlanFromAccountMutationFn = Apollo.MutationFunction<
  SchemaTypes.RevokeLicensePlanFromAccountMutation,
  SchemaTypes.RevokeLicensePlanFromAccountMutationVariables
>;

/**
 * __useRevokeLicensePlanFromAccountMutation__
 *
 * To run a mutation, you first call `useRevokeLicensePlanFromAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeLicensePlanFromAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeLicensePlanFromAccountMutation, { data, loading, error }] = useRevokeLicensePlanFromAccountMutation({
 *   variables: {
 *      licensePlanId: // value for 'licensePlanId'
 *      accountId: // value for 'accountId'
 *      licensingId: // value for 'licensingId'
 *   },
 * });
 */
export function useRevokeLicensePlanFromAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RevokeLicensePlanFromAccountMutation,
    SchemaTypes.RevokeLicensePlanFromAccountMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RevokeLicensePlanFromAccountMutation,
    SchemaTypes.RevokeLicensePlanFromAccountMutationVariables
  >(RevokeLicensePlanFromAccountDocument, options);
}
export type RevokeLicensePlanFromAccountMutationHookResult = ReturnType<typeof useRevokeLicensePlanFromAccountMutation>;
export type RevokeLicensePlanFromAccountMutationResult =
  Apollo.MutationResult<SchemaTypes.RevokeLicensePlanFromAccountMutation>;
export type RevokeLicensePlanFromAccountMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RevokeLicensePlanFromAccountMutation,
  SchemaTypes.RevokeLicensePlanFromAccountMutationVariables
>;
export const PlatformAdminOrganizationsListDocument = gql`
  query platformAdminOrganizationsList($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    platformAdmin {
      organizations(first: $first, after: $after, filter: $filter) {
        organization {
          id
          account {
            id
            subscriptions {
              name
            }
          }
          profile {
            id
            url
            displayName
            visual(type: AVATAR) {
              id
              uri
            }
          }
          verification {
            id
            state
          }
        }
        pageInfo {
          ...PageInfo
        }
      }
    }
  }
  ${PageInfoFragmentDoc}
`;

/**
 * __usePlatformAdminOrganizationsListQuery__
 *
 * To run a query within a React component, call `usePlatformAdminOrganizationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminOrganizationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminOrganizationsListQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function usePlatformAdminOrganizationsListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminOrganizationsListQuery,
    SchemaTypes.PlatformAdminOrganizationsListQueryVariables
  > &
    ({ variables: SchemaTypes.PlatformAdminOrganizationsListQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformAdminOrganizationsListQuery,
    SchemaTypes.PlatformAdminOrganizationsListQueryVariables
  >(PlatformAdminOrganizationsListDocument, options);
}
export function usePlatformAdminOrganizationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminOrganizationsListQuery,
    SchemaTypes.PlatformAdminOrganizationsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformAdminOrganizationsListQuery,
    SchemaTypes.PlatformAdminOrganizationsListQueryVariables
  >(PlatformAdminOrganizationsListDocument, options);
}
export function usePlatformAdminOrganizationsListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminOrganizationsListQuery,
        SchemaTypes.PlatformAdminOrganizationsListQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminOrganizationsListQuery,
    SchemaTypes.PlatformAdminOrganizationsListQueryVariables
  >(PlatformAdminOrganizationsListDocument, options);
}
export type PlatformAdminOrganizationsListQueryHookResult = ReturnType<typeof usePlatformAdminOrganizationsListQuery>;
export type PlatformAdminOrganizationsListLazyQueryHookResult = ReturnType<
  typeof usePlatformAdminOrganizationsListLazyQuery
>;
export type PlatformAdminOrganizationsListSuspenseQueryHookResult = ReturnType<
  typeof usePlatformAdminOrganizationsListSuspenseQuery
>;
export type PlatformAdminOrganizationsListQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminOrganizationsListQuery,
  SchemaTypes.PlatformAdminOrganizationsListQueryVariables
>;
export function refetchPlatformAdminOrganizationsListQuery(
  variables: SchemaTypes.PlatformAdminOrganizationsListQueryVariables
) {
  return { query: PlatformAdminOrganizationsListDocument, variables: variables };
}
export const AdminOrganizationVerifyDocument = gql`
  mutation adminOrganizationVerify($input: OrganizationVerificationEventInput!) {
    eventOnOrganizationVerification(eventData: $input) {
      id
      nextEvents
      state
    }
  }
`;
export type AdminOrganizationVerifyMutationFn = Apollo.MutationFunction<
  SchemaTypes.AdminOrganizationVerifyMutation,
  SchemaTypes.AdminOrganizationVerifyMutationVariables
>;

/**
 * __useAdminOrganizationVerifyMutation__
 *
 * To run a mutation, you first call `useAdminOrganizationVerifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAdminOrganizationVerifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [adminOrganizationVerifyMutation, { data, loading, error }] = useAdminOrganizationVerifyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAdminOrganizationVerifyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AdminOrganizationVerifyMutation,
    SchemaTypes.AdminOrganizationVerifyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AdminOrganizationVerifyMutation,
    SchemaTypes.AdminOrganizationVerifyMutationVariables
  >(AdminOrganizationVerifyDocument, options);
}
export type AdminOrganizationVerifyMutationHookResult = ReturnType<typeof useAdminOrganizationVerifyMutation>;
export type AdminOrganizationVerifyMutationResult = Apollo.MutationResult<SchemaTypes.AdminOrganizationVerifyMutation>;
export type AdminOrganizationVerifyMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AdminOrganizationVerifyMutation,
  SchemaTypes.AdminOrganizationVerifyMutationVariables
>;
export const AssignLicensePlanToSpaceDocument = gql`
  mutation AssignLicensePlanToSpace($licensePlanId: UUID!, $spaceId: UUID!) {
    assignLicensePlanToSpace(planData: { spaceID: $spaceId, licensePlanID: $licensePlanId }) {
      id
      subscriptions {
        name
      }
    }
  }
`;
export type AssignLicensePlanToSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignLicensePlanToSpaceMutation,
  SchemaTypes.AssignLicensePlanToSpaceMutationVariables
>;

/**
 * __useAssignLicensePlanToSpaceMutation__
 *
 * To run a mutation, you first call `useAssignLicensePlanToSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignLicensePlanToSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignLicensePlanToSpaceMutation, { data, loading, error }] = useAssignLicensePlanToSpaceMutation({
 *   variables: {
 *      licensePlanId: // value for 'licensePlanId'
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAssignLicensePlanToSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignLicensePlanToSpaceMutation,
    SchemaTypes.AssignLicensePlanToSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignLicensePlanToSpaceMutation,
    SchemaTypes.AssignLicensePlanToSpaceMutationVariables
  >(AssignLicensePlanToSpaceDocument, options);
}
export type AssignLicensePlanToSpaceMutationHookResult = ReturnType<typeof useAssignLicensePlanToSpaceMutation>;
export type AssignLicensePlanToSpaceMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignLicensePlanToSpaceMutation>;
export type AssignLicensePlanToSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignLicensePlanToSpaceMutation,
  SchemaTypes.AssignLicensePlanToSpaceMutationVariables
>;
export const RevokeLicensePlanFromSpaceDocument = gql`
  mutation RevokeLicensePlanFromSpace($licensePlanId: UUID!, $spaceId: UUID!) {
    revokeLicensePlanFromSpace(planData: { spaceID: $spaceId, licensePlanID: $licensePlanId }) {
      id
      subscriptions {
        name
      }
    }
  }
`;
export type RevokeLicensePlanFromSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.RevokeLicensePlanFromSpaceMutation,
  SchemaTypes.RevokeLicensePlanFromSpaceMutationVariables
>;

/**
 * __useRevokeLicensePlanFromSpaceMutation__
 *
 * To run a mutation, you first call `useRevokeLicensePlanFromSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeLicensePlanFromSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeLicensePlanFromSpaceMutation, { data, loading, error }] = useRevokeLicensePlanFromSpaceMutation({
 *   variables: {
 *      licensePlanId: // value for 'licensePlanId'
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useRevokeLicensePlanFromSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RevokeLicensePlanFromSpaceMutation,
    SchemaTypes.RevokeLicensePlanFromSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RevokeLicensePlanFromSpaceMutation,
    SchemaTypes.RevokeLicensePlanFromSpaceMutationVariables
  >(RevokeLicensePlanFromSpaceDocument, options);
}
export type RevokeLicensePlanFromSpaceMutationHookResult = ReturnType<typeof useRevokeLicensePlanFromSpaceMutation>;
export type RevokeLicensePlanFromSpaceMutationResult =
  Apollo.MutationResult<SchemaTypes.RevokeLicensePlanFromSpaceMutation>;
export type RevokeLicensePlanFromSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RevokeLicensePlanFromSpaceMutation,
  SchemaTypes.RevokeLicensePlanFromSpaceMutationVariables
>;
export const UpdateSpacePlatformSettingsDocument = gql`
  mutation UpdateSpacePlatformSettings($spaceId: UUID!, $nameId: NameID!, $visibility: SpaceVisibility!) {
    updateSpacePlatformSettings(updateData: { spaceID: $spaceId, nameID: $nameId, visibility: $visibility }) {
      id
      nameID
      visibility
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
 *      spaceId: // value for 'spaceId'
 *      nameId: // value for 'nameId'
 *      visibility: // value for 'visibility'
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
export const PlatformAdminSpacesListDocument = gql`
  query platformAdminSpacesList {
    platformAdmin {
      spaces(filter: { visibilities: [ACTIVE, DEMO] }) {
        id
        nameID
        visibility
        about {
          id
          profile {
            id
            displayName
            url
          }
        }
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
`;

/**
 * __usePlatformAdminSpacesListQuery__
 *
 * To run a query within a React component, call `usePlatformAdminSpacesListQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminSpacesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminSpacesListQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformAdminSpacesListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminSpacesListQuery,
    SchemaTypes.PlatformAdminSpacesListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformAdminSpacesListQuery, SchemaTypes.PlatformAdminSpacesListQueryVariables>(
    PlatformAdminSpacesListDocument,
    options
  );
}
export function usePlatformAdminSpacesListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminSpacesListQuery,
    SchemaTypes.PlatformAdminSpacesListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformAdminSpacesListQuery,
    SchemaTypes.PlatformAdminSpacesListQueryVariables
  >(PlatformAdminSpacesListDocument, options);
}
export function usePlatformAdminSpacesListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminSpacesListQuery,
        SchemaTypes.PlatformAdminSpacesListQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminSpacesListQuery,
    SchemaTypes.PlatformAdminSpacesListQueryVariables
  >(PlatformAdminSpacesListDocument, options);
}
export type PlatformAdminSpacesListQueryHookResult = ReturnType<typeof usePlatformAdminSpacesListQuery>;
export type PlatformAdminSpacesListLazyQueryHookResult = ReturnType<typeof usePlatformAdminSpacesListLazyQuery>;
export type PlatformAdminSpacesListSuspenseQueryHookResult = ReturnType<typeof usePlatformAdminSpacesListSuspenseQuery>;
export type PlatformAdminSpacesListQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminSpacesListQuery,
  SchemaTypes.PlatformAdminSpacesListQueryVariables
>;
export function refetchPlatformAdminSpacesListQuery(variables?: SchemaTypes.PlatformAdminSpacesListQueryVariables) {
  return { query: PlatformAdminSpacesListDocument, variables: variables };
}
export const PlatformLicensePlansDocument = gql`
  query PlatformLicensePlans {
    platform {
      licensingFramework {
        plans {
          id
          name
          sortOrder
          type
          licenseCredential
        }
      }
    }
  }
`;

/**
 * __usePlatformLicensePlansQuery__
 *
 * To run a query within a React component, call `usePlatformLicensePlansQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformLicensePlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformLicensePlansQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformLicensePlansQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformLicensePlansQuery,
    SchemaTypes.PlatformLicensePlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformLicensePlansQuery, SchemaTypes.PlatformLicensePlansQueryVariables>(
    PlatformLicensePlansDocument,
    options
  );
}
export function usePlatformLicensePlansLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformLicensePlansQuery,
    SchemaTypes.PlatformLicensePlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformLicensePlansQuery, SchemaTypes.PlatformLicensePlansQueryVariables>(
    PlatformLicensePlansDocument,
    options
  );
}
export function usePlatformLicensePlansSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformLicensePlansQuery,
        SchemaTypes.PlatformLicensePlansQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PlatformLicensePlansQuery, SchemaTypes.PlatformLicensePlansQueryVariables>(
    PlatformLicensePlansDocument,
    options
  );
}
export type PlatformLicensePlansQueryHookResult = ReturnType<typeof usePlatformLicensePlansQuery>;
export type PlatformLicensePlansLazyQueryHookResult = ReturnType<typeof usePlatformLicensePlansLazyQuery>;
export type PlatformLicensePlansSuspenseQueryHookResult = ReturnType<typeof usePlatformLicensePlansSuspenseQuery>;
export type PlatformLicensePlansQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformLicensePlansQuery,
  SchemaTypes.PlatformLicensePlansQueryVariables
>;
export function refetchPlatformLicensePlansQuery(variables?: SchemaTypes.PlatformLicensePlansQueryVariables) {
  return { query: PlatformLicensePlansDocument, variables: variables };
}
export const SpaceSubscriptionsDocument = gql`
  query SpaceSubscriptions($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        subscriptions {
          name
        }
      }
    }
  }
`;

/**
 * __useSpaceSubscriptionsQuery__
 *
 * To run a query within a React component, call `useSpaceSubscriptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSubscriptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSubscriptionsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceSubscriptionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSubscriptionsQuery,
    SchemaTypes.SpaceSubscriptionsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSubscriptionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSubscriptionsQuery, SchemaTypes.SpaceSubscriptionsQueryVariables>(
    SpaceSubscriptionsDocument,
    options
  );
}
export function useSpaceSubscriptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSubscriptionsQuery,
    SchemaTypes.SpaceSubscriptionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSubscriptionsQuery, SchemaTypes.SpaceSubscriptionsQueryVariables>(
    SpaceSubscriptionsDocument,
    options
  );
}
export function useSpaceSubscriptionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceSubscriptionsQuery, SchemaTypes.SpaceSubscriptionsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceSubscriptionsQuery, SchemaTypes.SpaceSubscriptionsQueryVariables>(
    SpaceSubscriptionsDocument,
    options
  );
}
export type SpaceSubscriptionsQueryHookResult = ReturnType<typeof useSpaceSubscriptionsQuery>;
export type SpaceSubscriptionsLazyQueryHookResult = ReturnType<typeof useSpaceSubscriptionsLazyQuery>;
export type SpaceSubscriptionsSuspenseQueryHookResult = ReturnType<typeof useSpaceSubscriptionsSuspenseQuery>;
export type SpaceSubscriptionsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSubscriptionsQuery,
  SchemaTypes.SpaceSubscriptionsQueryVariables
>;
export function refetchSpaceSubscriptionsQuery(variables: SchemaTypes.SpaceSubscriptionsQueryVariables) {
  return { query: SpaceSubscriptionsDocument, variables: variables };
}
export const SpaceLicensePlansDocument = gql`
  query SpaceLicensePlans($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        subscriptions {
          name
        }
      }
    }
    platform {
      licensingFramework {
        plans {
          id
          name
          sortOrder
          type
          licenseCredential
        }
      }
    }
  }
`;

/**
 * __useSpaceLicensePlansQuery__
 *
 * To run a query within a React component, call `useSpaceLicensePlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceLicensePlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceLicensePlansQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceLicensePlansQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceLicensePlansQuery,
    SchemaTypes.SpaceLicensePlansQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceLicensePlansQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceLicensePlansQuery, SchemaTypes.SpaceLicensePlansQueryVariables>(
    SpaceLicensePlansDocument,
    options
  );
}
export function useSpaceLicensePlansLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceLicensePlansQuery,
    SchemaTypes.SpaceLicensePlansQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceLicensePlansQuery, SchemaTypes.SpaceLicensePlansQueryVariables>(
    SpaceLicensePlansDocument,
    options
  );
}
export function useSpaceLicensePlansSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceLicensePlansQuery, SchemaTypes.SpaceLicensePlansQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceLicensePlansQuery, SchemaTypes.SpaceLicensePlansQueryVariables>(
    SpaceLicensePlansDocument,
    options
  );
}
export type SpaceLicensePlansQueryHookResult = ReturnType<typeof useSpaceLicensePlansQuery>;
export type SpaceLicensePlansLazyQueryHookResult = ReturnType<typeof useSpaceLicensePlansLazyQuery>;
export type SpaceLicensePlansSuspenseQueryHookResult = ReturnType<typeof useSpaceLicensePlansSuspenseQuery>;
export type SpaceLicensePlansQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceLicensePlansQuery,
  SchemaTypes.SpaceLicensePlansQueryVariables
>;
export function refetchSpaceLicensePlansQuery(variables: SchemaTypes.SpaceLicensePlansQueryVariables) {
  return { query: SpaceLicensePlansDocument, variables: variables };
}
export const PlatformAdminUsersListDocument = gql`
  query platformAdminUsersList($first: Int!, $after: UUID, $filter: UserFilterInput) {
    platformAdmin {
      users(first: $first, after: $after, filter: $filter) {
        users {
          id
          account {
            id
            subscriptions {
              name
            }
          }
          profile {
            id
            url
            displayName
            visual(type: AVATAR) {
              id
              uri
            }
          }
          email
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

/**
 * __usePlatformAdminUsersListQuery__
 *
 * To run a query within a React component, call `usePlatformAdminUsersListQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminUsersListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminUsersListQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function usePlatformAdminUsersListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminUsersListQuery,
    SchemaTypes.PlatformAdminUsersListQueryVariables
  > &
    ({ variables: SchemaTypes.PlatformAdminUsersListQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlatformAdminUsersListQuery, SchemaTypes.PlatformAdminUsersListQueryVariables>(
    PlatformAdminUsersListDocument,
    options
  );
}
export function usePlatformAdminUsersListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminUsersListQuery,
    SchemaTypes.PlatformAdminUsersListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlatformAdminUsersListQuery, SchemaTypes.PlatformAdminUsersListQueryVariables>(
    PlatformAdminUsersListDocument,
    options
  );
}
export function usePlatformAdminUsersListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminUsersListQuery,
        SchemaTypes.PlatformAdminUsersListQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminUsersListQuery,
    SchemaTypes.PlatformAdminUsersListQueryVariables
  >(PlatformAdminUsersListDocument, options);
}
export type PlatformAdminUsersListQueryHookResult = ReturnType<typeof usePlatformAdminUsersListQuery>;
export type PlatformAdminUsersListLazyQueryHookResult = ReturnType<typeof usePlatformAdminUsersListLazyQuery>;
export type PlatformAdminUsersListSuspenseQueryHookResult = ReturnType<typeof usePlatformAdminUsersListSuspenseQuery>;
export type PlatformAdminUsersListQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminUsersListQuery,
  SchemaTypes.PlatformAdminUsersListQueryVariables
>;
export function refetchPlatformAdminUsersListQuery(variables: SchemaTypes.PlatformAdminUsersListQueryVariables) {
  return { query: PlatformAdminUsersListDocument, variables: variables };
}
export const PlatformAdminVirtualContributorsListDocument = gql`
  query platformAdminVirtualContributorsList {
    platformAdmin {
      virtualContributors {
        id
        authorization {
          id
          myPrivileges
        }
        profile {
          id
          displayName
          description
          url
          avatar: visual(type: AVATAR) {
            ...VisualModel
          }
        }
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __usePlatformAdminVirtualContributorsListQuery__
 *
 * To run a query within a React component, call `usePlatformAdminVirtualContributorsListQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformAdminVirtualContributorsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformAdminVirtualContributorsListQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformAdminVirtualContributorsListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PlatformAdminVirtualContributorsListQuery,
    SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformAdminVirtualContributorsListQuery,
    SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
  >(PlatformAdminVirtualContributorsListDocument, options);
}
export function usePlatformAdminVirtualContributorsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformAdminVirtualContributorsListQuery,
    SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformAdminVirtualContributorsListQuery,
    SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
  >(PlatformAdminVirtualContributorsListDocument, options);
}
export function usePlatformAdminVirtualContributorsListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformAdminVirtualContributorsListQuery,
        SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformAdminVirtualContributorsListQuery,
    SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
  >(PlatformAdminVirtualContributorsListDocument, options);
}
export type PlatformAdminVirtualContributorsListQueryHookResult = ReturnType<
  typeof usePlatformAdminVirtualContributorsListQuery
>;
export type PlatformAdminVirtualContributorsListLazyQueryHookResult = ReturnType<
  typeof usePlatformAdminVirtualContributorsListLazyQuery
>;
export type PlatformAdminVirtualContributorsListSuspenseQueryHookResult = ReturnType<
  typeof usePlatformAdminVirtualContributorsListSuspenseQuery
>;
export type PlatformAdminVirtualContributorsListQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformAdminVirtualContributorsListQuery,
  SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
>;
export function refetchPlatformAdminVirtualContributorsListQuery(
  variables?: SchemaTypes.PlatformAdminVirtualContributorsListQueryVariables
) {
  return { query: PlatformAdminVirtualContributorsListDocument, variables: variables };
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
export const SpaceAboutBaseDocument = gql`
  query SpaceAboutBase($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        nameID
        about {
          ...SpaceAboutLight
        }
        authorization {
          id
          myPrivileges
        }
        visibility
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __useSpaceAboutBaseQuery__
 *
 * To run a query within a React component, call `useSpaceAboutBaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAboutBaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAboutBaseQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAboutBaseQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables> &
    ({ variables: SchemaTypes.SpaceAboutBaseQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables>(
    SpaceAboutBaseDocument,
    options
  );
}
export function useSpaceAboutBaseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables>(
    SpaceAboutBaseDocument,
    options
  );
}
export function useSpaceAboutBaseSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceAboutBaseQuery, SchemaTypes.SpaceAboutBaseQueryVariables>(
    SpaceAboutBaseDocument,
    options
  );
}
export type SpaceAboutBaseQueryHookResult = ReturnType<typeof useSpaceAboutBaseQuery>;
export type SpaceAboutBaseLazyQueryHookResult = ReturnType<typeof useSpaceAboutBaseLazyQuery>;
export type SpaceAboutBaseSuspenseQueryHookResult = ReturnType<typeof useSpaceAboutBaseSuspenseQuery>;
export type SpaceAboutBaseQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAboutBaseQuery,
  SchemaTypes.SpaceAboutBaseQueryVariables
>;
export function refetchSpaceAboutBaseQuery(variables: SchemaTypes.SpaceAboutBaseQueryVariables) {
  return { query: SpaceAboutBaseDocument, variables: variables };
}
export const SpaceAboutDetailsDocument = gql`
  query SpaceAboutDetails($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        nameID
        level
        about {
          ...SpaceAboutDetails
        }
        authorization {
          id
          myPrivileges
        }
        visibility
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
`;

/**
 * __useSpaceAboutDetailsQuery__
 *
 * To run a query within a React component, call `useSpaceAboutDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAboutDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAboutDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAboutDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceAboutDetailsQuery,
    SchemaTypes.SpaceAboutDetailsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceAboutDetailsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceAboutDetailsQuery, SchemaTypes.SpaceAboutDetailsQueryVariables>(
    SpaceAboutDetailsDocument,
    options
  );
}
export function useSpaceAboutDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceAboutDetailsQuery,
    SchemaTypes.SpaceAboutDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceAboutDetailsQuery, SchemaTypes.SpaceAboutDetailsQueryVariables>(
    SpaceAboutDetailsDocument,
    options
  );
}
export function useSpaceAboutDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceAboutDetailsQuery, SchemaTypes.SpaceAboutDetailsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceAboutDetailsQuery, SchemaTypes.SpaceAboutDetailsQueryVariables>(
    SpaceAboutDetailsDocument,
    options
  );
}
export type SpaceAboutDetailsQueryHookResult = ReturnType<typeof useSpaceAboutDetailsQuery>;
export type SpaceAboutDetailsLazyQueryHookResult = ReturnType<typeof useSpaceAboutDetailsLazyQuery>;
export type SpaceAboutDetailsSuspenseQueryHookResult = ReturnType<typeof useSpaceAboutDetailsSuspenseQuery>;
export type SpaceAboutDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAboutDetailsQuery,
  SchemaTypes.SpaceAboutDetailsQueryVariables
>;
export function refetchSpaceAboutDetailsQuery(variables: SchemaTypes.SpaceAboutDetailsQueryVariables) {
  return { query: SpaceAboutDetailsDocument, variables: variables };
}
export const SpaceAboutFullDocument = gql`
  query SpaceAboutFull($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        about {
          ...SpaceAboutDetails
        }
        authorization {
          id
          myPrivileges
        }
        visibility
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
`;

/**
 * __useSpaceAboutFullQuery__
 *
 * To run a query within a React component, call `useSpaceAboutFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAboutFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAboutFullQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAboutFullQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables> &
    ({ variables: SchemaTypes.SpaceAboutFullQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables>(
    SpaceAboutFullDocument,
    options
  );
}
export function useSpaceAboutFullLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables>(
    SpaceAboutFullDocument,
    options
  );
}
export function useSpaceAboutFullSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceAboutFullQuery, SchemaTypes.SpaceAboutFullQueryVariables>(
    SpaceAboutFullDocument,
    options
  );
}
export type SpaceAboutFullQueryHookResult = ReturnType<typeof useSpaceAboutFullQuery>;
export type SpaceAboutFullLazyQueryHookResult = ReturnType<typeof useSpaceAboutFullLazyQuery>;
export type SpaceAboutFullSuspenseQueryHookResult = ReturnType<typeof useSpaceAboutFullSuspenseQuery>;
export type SpaceAboutFullQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAboutFullQuery,
  SchemaTypes.SpaceAboutFullQueryVariables
>;
export function refetchSpaceAboutFullQuery(variables: SchemaTypes.SpaceAboutFullQueryVariables) {
  return { query: SpaceAboutFullDocument, variables: variables };
}
export const RestrictedSpaceNamesDocument = gql`
  query RestrictedSpaceNames {
    restrictedSpaceNames
  }
`;

/**
 * __useRestrictedSpaceNamesQuery__
 *
 * To run a query within a React component, call `useRestrictedSpaceNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRestrictedSpaceNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRestrictedSpaceNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function useRestrictedSpaceNamesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.RestrictedSpaceNamesQuery,
    SchemaTypes.RestrictedSpaceNamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RestrictedSpaceNamesQuery, SchemaTypes.RestrictedSpaceNamesQueryVariables>(
    RestrictedSpaceNamesDocument,
    options
  );
}
export function useRestrictedSpaceNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.RestrictedSpaceNamesQuery,
    SchemaTypes.RestrictedSpaceNamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RestrictedSpaceNamesQuery, SchemaTypes.RestrictedSpaceNamesQueryVariables>(
    RestrictedSpaceNamesDocument,
    options
  );
}
export function useRestrictedSpaceNamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.RestrictedSpaceNamesQuery,
        SchemaTypes.RestrictedSpaceNamesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.RestrictedSpaceNamesQuery, SchemaTypes.RestrictedSpaceNamesQueryVariables>(
    RestrictedSpaceNamesDocument,
    options
  );
}
export type RestrictedSpaceNamesQueryHookResult = ReturnType<typeof useRestrictedSpaceNamesQuery>;
export type RestrictedSpaceNamesLazyQueryHookResult = ReturnType<typeof useRestrictedSpaceNamesLazyQuery>;
export type RestrictedSpaceNamesSuspenseQueryHookResult = ReturnType<typeof useRestrictedSpaceNamesSuspenseQuery>;
export type RestrictedSpaceNamesQueryResult = Apollo.QueryResult<
  SchemaTypes.RestrictedSpaceNamesQuery,
  SchemaTypes.RestrictedSpaceNamesQueryVariables
>;
export function refetchRestrictedSpaceNamesQuery(variables?: SchemaTypes.RestrictedSpaceNamesQueryVariables) {
  return { query: RestrictedSpaceNamesDocument, variables: variables };
}
export const PlansTableDocument = gql`
  query PlansTable {
    platform {
      id
      licensingFramework {
        id
        plans {
          id
          name
          enabled
          sortOrder
          pricePerMonth
          isFree
          trialEnabled
          requiresPaymentMethod
          requiresContactSupport
          type
        }
      }
    }
  }
`;

/**
 * __usePlansTableQuery__
 *
 * To run a query within a React component, call `usePlansTableQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlansTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlansTableQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlansTableQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>(
    PlansTableDocument,
    options
  );
}
export function usePlansTableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>(
    PlansTableDocument,
    options
  );
}
export function usePlansTableSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PlansTableQuery, SchemaTypes.PlansTableQueryVariables>(
    PlansTableDocument,
    options
  );
}
export type PlansTableQueryHookResult = ReturnType<typeof usePlansTableQuery>;
export type PlansTableLazyQueryHookResult = ReturnType<typeof usePlansTableLazyQuery>;
export type PlansTableSuspenseQueryHookResult = ReturnType<typeof usePlansTableSuspenseQuery>;
export type PlansTableQueryResult = Apollo.QueryResult<
  SchemaTypes.PlansTableQuery,
  SchemaTypes.PlansTableQueryVariables
>;
export function refetchPlansTableQuery(variables?: SchemaTypes.PlansTableQueryVariables) {
  return { query: PlansTableDocument, variables: variables };
}
export const AccountPlanAvailabilityDocument = gql`
  query AccountPlanAvailability($accountId: UUID!) {
    lookup {
      account(ID: $accountId) {
        id
        authorization {
          id
          myPrivileges
        }
        license {
          id
          availableEntitlements
        }
      }
    }
  }
`;

/**
 * __useAccountPlanAvailabilityQuery__
 *
 * To run a query within a React component, call `useAccountPlanAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountPlanAvailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountPlanAvailabilityQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useAccountPlanAvailabilityQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AccountPlanAvailabilityQuery,
    SchemaTypes.AccountPlanAvailabilityQueryVariables
  > &
    ({ variables: SchemaTypes.AccountPlanAvailabilityQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AccountPlanAvailabilityQuery, SchemaTypes.AccountPlanAvailabilityQueryVariables>(
    AccountPlanAvailabilityDocument,
    options
  );
}
export function useAccountPlanAvailabilityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AccountPlanAvailabilityQuery,
    SchemaTypes.AccountPlanAvailabilityQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AccountPlanAvailabilityQuery,
    SchemaTypes.AccountPlanAvailabilityQueryVariables
  >(AccountPlanAvailabilityDocument, options);
}
export function useAccountPlanAvailabilitySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AccountPlanAvailabilityQuery,
        SchemaTypes.AccountPlanAvailabilityQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AccountPlanAvailabilityQuery,
    SchemaTypes.AccountPlanAvailabilityQueryVariables
  >(AccountPlanAvailabilityDocument, options);
}
export type AccountPlanAvailabilityQueryHookResult = ReturnType<typeof useAccountPlanAvailabilityQuery>;
export type AccountPlanAvailabilityLazyQueryHookResult = ReturnType<typeof useAccountPlanAvailabilityLazyQuery>;
export type AccountPlanAvailabilitySuspenseQueryHookResult = ReturnType<typeof useAccountPlanAvailabilitySuspenseQuery>;
export type AccountPlanAvailabilityQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountPlanAvailabilityQuery,
  SchemaTypes.AccountPlanAvailabilityQueryVariables
>;
export function refetchAccountPlanAvailabilityQuery(variables: SchemaTypes.AccountPlanAvailabilityQueryVariables) {
  return { query: AccountPlanAvailabilityDocument, variables: variables };
}
export const ContactSupportLocationDocument = gql`
  query ContactSupportLocation {
    platform {
      configuration {
        locations {
          contactsupport
        }
      }
    }
  }
`;

/**
 * __useContactSupportLocationQuery__
 *
 * To run a query within a React component, call `useContactSupportLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useContactSupportLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContactSupportLocationQuery({
 *   variables: {
 *   },
 * });
 */
export function useContactSupportLocationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ContactSupportLocationQuery,
    SchemaTypes.ContactSupportLocationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContactSupportLocationQuery, SchemaTypes.ContactSupportLocationQueryVariables>(
    ContactSupportLocationDocument,
    options
  );
}
export function useContactSupportLocationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContactSupportLocationQuery,
    SchemaTypes.ContactSupportLocationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContactSupportLocationQuery, SchemaTypes.ContactSupportLocationQueryVariables>(
    ContactSupportLocationDocument,
    options
  );
}
export function useContactSupportLocationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ContactSupportLocationQuery,
        SchemaTypes.ContactSupportLocationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ContactSupportLocationQuery,
    SchemaTypes.ContactSupportLocationQueryVariables
  >(ContactSupportLocationDocument, options);
}
export type ContactSupportLocationQueryHookResult = ReturnType<typeof useContactSupportLocationQuery>;
export type ContactSupportLocationLazyQueryHookResult = ReturnType<typeof useContactSupportLocationLazyQuery>;
export type ContactSupportLocationSuspenseQueryHookResult = ReturnType<typeof useContactSupportLocationSuspenseQuery>;
export type ContactSupportLocationQueryResult = Apollo.QueryResult<
  SchemaTypes.ContactSupportLocationQuery,
  SchemaTypes.ContactSupportLocationQueryVariables
>;
export function refetchContactSupportLocationQuery(variables?: SchemaTypes.ContactSupportLocationQueryVariables) {
  return { query: ContactSupportLocationDocument, variables: variables };
}
export const CreateSpaceDocument = gql`
  mutation CreateSpace($spaceData: CreateSpaceOnAccountInput!, $includeVisuals: Boolean = false) {
    createSpace(spaceData: $spaceData) {
      id
      about {
        ...SpaceAboutLight
        profile {
          id
          url
        }
        profile @include(if: $includeVisuals) {
          ...ProfileVisuals
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
  ${ProfileVisualsFragmentDoc}
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
 *      spaceData: // value for 'spaceData'
 *      includeVisuals: // value for 'includeVisuals'
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
  mutation CreateSubspace($input: CreateSubspaceInput!, $includeVisuals: Boolean = false) {
    createSubspace(subspaceData: $input) {
      ...SubspaceCard
      about {
        id
        profile {
          id
          url
        }
        profile @include(if: $includeVisuals) {
          ...ProfileVisuals
        }
      }
    }
  }
  ${SubspaceCardFragmentDoc}
  ${ProfileVisualsFragmentDoc}
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
 *      includeVisuals: // value for 'includeVisuals'
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
export const SubspacePageBannerDocument = gql`
  query SubspacePageBanner($level0Space: UUID!, $spaceId: UUID!) {
    lookup {
      level0Space: space(ID: $level0Space) {
        id
        about {
          id
          profile {
            id
            banner: visual(type: BANNER) {
              id
              uri
            }
          }
        }
      }
      space(ID: $spaceId) {
        id
        about {
          id
          profile {
            id
            displayName
            tagline
            avatar: visual(type: AVATAR) {
              id
              uri
            }
            tagset {
              id
              tags
            }
          }
          membership {
            myMembershipStatus
          }
        }
      }
    }
  }
`;

/**
 * __useSubspacePageBannerQuery__
 *
 * To run a query within a React component, call `useSubspacePageBannerQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubspacePageBannerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspacePageBannerQuery({
 *   variables: {
 *      level0Space: // value for 'level0Space'
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSubspacePageBannerQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SubspacePageBannerQuery,
    SchemaTypes.SubspacePageBannerQueryVariables
  > &
    ({ variables: SchemaTypes.SubspacePageBannerQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SubspacePageBannerQuery, SchemaTypes.SubspacePageBannerQueryVariables>(
    SubspacePageBannerDocument,
    options
  );
}
export function useSubspacePageBannerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SubspacePageBannerQuery,
    SchemaTypes.SubspacePageBannerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SubspacePageBannerQuery, SchemaTypes.SubspacePageBannerQueryVariables>(
    SubspacePageBannerDocument,
    options
  );
}
export function useSubspacePageBannerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SubspacePageBannerQuery, SchemaTypes.SubspacePageBannerQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SubspacePageBannerQuery, SchemaTypes.SubspacePageBannerQueryVariables>(
    SubspacePageBannerDocument,
    options
  );
}
export type SubspacePageBannerQueryHookResult = ReturnType<typeof useSubspacePageBannerQuery>;
export type SubspacePageBannerLazyQueryHookResult = ReturnType<typeof useSubspacePageBannerLazyQuery>;
export type SubspacePageBannerSuspenseQueryHookResult = ReturnType<typeof useSubspacePageBannerSuspenseQuery>;
export type SubspacePageBannerQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspacePageBannerQuery,
  SchemaTypes.SubspacePageBannerQueryVariables
>;
export function refetchSubspacePageBannerQuery(variables: SchemaTypes.SubspacePageBannerQueryVariables) {
  return { query: SubspacePageBannerDocument, variables: variables };
}
export const SpaceBreadcrumbsDocument = gql`
  query SpaceBreadcrumbs(
    $spaceId: UUID!
    $subspaceL1Id: UUID = "00000000-0000-0000-0000-000000000000"
    $subspaceL2Id: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSubspaceL1: Boolean = false
    $includeSubspaceL2: Boolean = false
  ) {
    lookup {
      space(ID: $spaceId) {
        ...BreadcrumbsSpaceL0
      }
      subspaceL1: space(ID: $subspaceL1Id) @include(if: $includeSubspaceL1) {
        ...BreadcrumbsSubspace
      }
      subspaceL2: space(ID: $subspaceL2Id) @include(if: $includeSubspaceL2) {
        ...BreadcrumbsSubspace
      }
    }
  }
  ${BreadcrumbsSpaceL0FragmentDoc}
  ${BreadcrumbsSubspaceFragmentDoc}
`;

/**
 * __useSpaceBreadcrumbsQuery__
 *
 * To run a query within a React component, call `useSpaceBreadcrumbsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceBreadcrumbsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceBreadcrumbsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      subspaceL1Id: // value for 'subspaceL1Id'
 *      subspaceL2Id: // value for 'subspaceL2Id'
 *      includeSubspaceL1: // value for 'includeSubspaceL1'
 *      includeSubspaceL2: // value for 'includeSubspaceL2'
 *   },
 * });
 */
export function useSpaceBreadcrumbsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceBreadcrumbsQuery, SchemaTypes.SpaceBreadcrumbsQueryVariables> &
    ({ variables: SchemaTypes.SpaceBreadcrumbsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceBreadcrumbsQuery, SchemaTypes.SpaceBreadcrumbsQueryVariables>(
    SpaceBreadcrumbsDocument,
    options
  );
}
export function useSpaceBreadcrumbsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceBreadcrumbsQuery,
    SchemaTypes.SpaceBreadcrumbsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceBreadcrumbsQuery, SchemaTypes.SpaceBreadcrumbsQueryVariables>(
    SpaceBreadcrumbsDocument,
    options
  );
}
export function useSpaceBreadcrumbsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceBreadcrumbsQuery, SchemaTypes.SpaceBreadcrumbsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceBreadcrumbsQuery, SchemaTypes.SpaceBreadcrumbsQueryVariables>(
    SpaceBreadcrumbsDocument,
    options
  );
}
export type SpaceBreadcrumbsQueryHookResult = ReturnType<typeof useSpaceBreadcrumbsQuery>;
export type SpaceBreadcrumbsLazyQueryHookResult = ReturnType<typeof useSpaceBreadcrumbsLazyQuery>;
export type SpaceBreadcrumbsSuspenseQueryHookResult = ReturnType<typeof useSpaceBreadcrumbsSuspenseQuery>;
export type SpaceBreadcrumbsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceBreadcrumbsQuery,
  SchemaTypes.SpaceBreadcrumbsQueryVariables
>;
export function refetchSpaceBreadcrumbsQuery(variables: SchemaTypes.SpaceBreadcrumbsQueryVariables) {
  return { query: SpaceBreadcrumbsDocument, variables: variables };
}
export const SpaceDashboardNavigationSubspacesDocument = gql`
  query SpaceDashboardNavigationSubspaces($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        authorization {
          id
          myPrivileges
        }
        about {
          ...SpaceAboutCardBanner
          isContentPublic
        }
        subspaces {
          id
          about {
            ...SpaceAboutCardAvatar
            isContentPublic
            membership {
              myMembershipStatus
            }
          }
          authorization {
            id
            myPrivileges
          }
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${SpaceAboutCardAvatarFragmentDoc}
`;

/**
 * __useSpaceDashboardNavigationSubspacesQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardNavigationSubspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardNavigationSubspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardNavigationSubspacesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDashboardNavigationSubspacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
  >(SpaceDashboardNavigationSubspacesDocument, options);
}
export function useSpaceDashboardNavigationSubspacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
  >(SpaceDashboardNavigationSubspacesDocument, options);
}
export function useSpaceDashboardNavigationSubspacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
        SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
  >(SpaceDashboardNavigationSubspacesDocument, options);
}
export type SpaceDashboardNavigationSubspacesQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesQuery
>;
export type SpaceDashboardNavigationSubspacesLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesLazyQuery
>;
export type SpaceDashboardNavigationSubspacesSuspenseQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesSuspenseQuery
>;
export type SpaceDashboardNavigationSubspacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardNavigationSubspacesQuery,
  SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
>;
export function refetchSpaceDashboardNavigationSubspacesQuery(
  variables: SchemaTypes.SpaceDashboardNavigationSubspacesQueryVariables
) {
  return { query: SpaceDashboardNavigationSubspacesDocument, variables: variables };
}
export const SpaceEntitlementsDocument = gql`
  query SpaceEntitlements($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        license {
          id
          availableEntitlements
        }
      }
    }
  }
`;

/**
 * __useSpaceEntitlementsQuery__
 *
 * To run a query within a React component, call `useSpaceEntitlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceEntitlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceEntitlementsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceEntitlementsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceEntitlementsQuery,
    SchemaTypes.SpaceEntitlementsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceEntitlementsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceEntitlementsQuery, SchemaTypes.SpaceEntitlementsQueryVariables>(
    SpaceEntitlementsDocument,
    options
  );
}
export function useSpaceEntitlementsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceEntitlementsQuery,
    SchemaTypes.SpaceEntitlementsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceEntitlementsQuery, SchemaTypes.SpaceEntitlementsQueryVariables>(
    SpaceEntitlementsDocument,
    options
  );
}
export function useSpaceEntitlementsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceEntitlementsQuery, SchemaTypes.SpaceEntitlementsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceEntitlementsQuery, SchemaTypes.SpaceEntitlementsQueryVariables>(
    SpaceEntitlementsDocument,
    options
  );
}
export type SpaceEntitlementsQueryHookResult = ReturnType<typeof useSpaceEntitlementsQuery>;
export type SpaceEntitlementsLazyQueryHookResult = ReturnType<typeof useSpaceEntitlementsLazyQuery>;
export type SpaceEntitlementsSuspenseQueryHookResult = ReturnType<typeof useSpaceEntitlementsSuspenseQuery>;
export type SpaceEntitlementsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceEntitlementsQuery,
  SchemaTypes.SpaceEntitlementsQueryVariables
>;
export function refetchSpaceEntitlementsQuery(variables: SchemaTypes.SpaceEntitlementsQueryVariables) {
  return { query: SpaceEntitlementsDocument, variables: variables };
}
export const SpaceTemplatesManagerDocument = gql`
  query SpaceTemplatesManager($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        templatesManager {
          id
          templatesSet {
            id
            authorization {
              id
              myPrivileges
            }
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceTemplatesManagerQuery__
 *
 * To run a query within a React component, call `useSpaceTemplatesManagerQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplatesManagerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplatesManagerQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTemplatesManagerQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplatesManagerQuery,
    SchemaTypes.SpaceTemplatesManagerQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceTemplatesManagerQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTemplatesManagerQuery, SchemaTypes.SpaceTemplatesManagerQueryVariables>(
    SpaceTemplatesManagerDocument,
    options
  );
}
export function useSpaceTemplatesManagerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplatesManagerQuery,
    SchemaTypes.SpaceTemplatesManagerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTemplatesManagerQuery, SchemaTypes.SpaceTemplatesManagerQueryVariables>(
    SpaceTemplatesManagerDocument,
    options
  );
}
export function useSpaceTemplatesManagerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceTemplatesManagerQuery,
        SchemaTypes.SpaceTemplatesManagerQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceTemplatesManagerQuery,
    SchemaTypes.SpaceTemplatesManagerQueryVariables
  >(SpaceTemplatesManagerDocument, options);
}
export type SpaceTemplatesManagerQueryHookResult = ReturnType<typeof useSpaceTemplatesManagerQuery>;
export type SpaceTemplatesManagerLazyQueryHookResult = ReturnType<typeof useSpaceTemplatesManagerLazyQuery>;
export type SpaceTemplatesManagerSuspenseQueryHookResult = ReturnType<typeof useSpaceTemplatesManagerSuspenseQuery>;
export type SpaceTemplatesManagerQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplatesManagerQuery,
  SchemaTypes.SpaceTemplatesManagerQueryVariables
>;
export function refetchSpaceTemplatesManagerQuery(variables: SchemaTypes.SpaceTemplatesManagerQueryVariables) {
  return { query: SpaceTemplatesManagerDocument, variables: variables };
}
export const SpaceSubspaceCardsDocument = gql`
  query SpaceSubspaceCards($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        subspaces {
          ...SubspaceCard
        }
      }
    }
  }
  ${SubspaceCardFragmentDoc}
`;

/**
 * __useSpaceSubspaceCardsQuery__
 *
 * To run a query within a React component, call `useSpaceSubspaceCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSubspaceCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSubspaceCardsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceSubspaceCardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceSubspaceCardsQuery,
    SchemaTypes.SpaceSubspaceCardsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceSubspaceCardsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSubspaceCardsQuery, SchemaTypes.SpaceSubspaceCardsQueryVariables>(
    SpaceSubspaceCardsDocument,
    options
  );
}
export function useSpaceSubspaceCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceSubspaceCardsQuery,
    SchemaTypes.SpaceSubspaceCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSubspaceCardsQuery, SchemaTypes.SpaceSubspaceCardsQueryVariables>(
    SpaceSubspaceCardsDocument,
    options
  );
}
export function useSpaceSubspaceCardsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceSubspaceCardsQuery, SchemaTypes.SpaceSubspaceCardsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceSubspaceCardsQuery, SchemaTypes.SpaceSubspaceCardsQueryVariables>(
    SpaceSubspaceCardsDocument,
    options
  );
}
export type SpaceSubspaceCardsQueryHookResult = ReturnType<typeof useSpaceSubspaceCardsQuery>;
export type SpaceSubspaceCardsLazyQueryHookResult = ReturnType<typeof useSpaceSubspaceCardsLazyQuery>;
export type SpaceSubspaceCardsSuspenseQueryHookResult = ReturnType<typeof useSpaceSubspaceCardsSuspenseQuery>;
export type SpaceSubspaceCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSubspaceCardsQuery,
  SchemaTypes.SpaceSubspaceCardsQueryVariables
>;
export function refetchSpaceSubspaceCardsQuery(variables: SchemaTypes.SpaceSubspaceCardsQueryVariables) {
  return { query: SpaceSubspaceCardsDocument, variables: variables };
}
export const DeleteSpaceDocument = gql`
  mutation deleteSpace($spaceId: UUID!) {
    deleteSpace(deleteData: { ID: $spaceId }) {
      id
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
 *      spaceId: // value for 'spaceId'
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
      ...SpaceInfo
    }
  }
  ${SpaceInfoFragmentDoc}
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
export const SubspacesInSpaceDocument = gql`
  query SubspacesInSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        subspaces {
          id
          about {
            ...SpaceAboutCardBanner
          }
          level
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;

/**
 * __useSubspacesInSpaceQuery__
 *
 * To run a query within a React component, call `useSubspacesInSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubspacesInSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspacesInSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSubspacesInSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables> &
    ({ variables: SchemaTypes.SubspacesInSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables>(
    SubspacesInSpaceDocument,
    options
  );
}
export function useSubspacesInSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SubspacesInSpaceQuery,
    SchemaTypes.SubspacesInSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables>(
    SubspacesInSpaceDocument,
    options
  );
}
export function useSubspacesInSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables>(
    SubspacesInSpaceDocument,
    options
  );
}
export type SubspacesInSpaceQueryHookResult = ReturnType<typeof useSubspacesInSpaceQuery>;
export type SubspacesInSpaceLazyQueryHookResult = ReturnType<typeof useSubspacesInSpaceLazyQuery>;
export type SubspacesInSpaceSuspenseQueryHookResult = ReturnType<typeof useSubspacesInSpaceSuspenseQuery>;
export type SubspacesInSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspacesInSpaceQuery,
  SchemaTypes.SubspacesInSpaceQueryVariables
>;
export function refetchSubspacesInSpaceQuery(variables: SchemaTypes.SubspacesInSpaceQueryVariables) {
  return { query: SubspacesInSpaceDocument, variables: variables };
}
export const SubspaceCreatedDocument = gql`
  subscription subspaceCreated($subspaceId: UUID!) {
    subspaceCreated(spaceID: $subspaceId) {
      subspace {
        ...SpaceCard
      }
    }
  }
  ${SpaceCardFragmentDoc}
`;

/**
 * __useSubspaceCreatedSubscription__
 *
 * To run a query within a React component, call `useSubspaceCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubspaceCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspaceCreatedSubscription({
 *   variables: {
 *      subspaceId: // value for 'subspaceId'
 *   },
 * });
 */
export function useSubspaceCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.SubspaceCreatedSubscription,
    SchemaTypes.SubspaceCreatedSubscriptionVariables
  > &
    ({ variables: SchemaTypes.SubspaceCreatedSubscriptionVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.SubspaceCreatedSubscription,
    SchemaTypes.SubspaceCreatedSubscriptionVariables
  >(SubspaceCreatedDocument, options);
}
export type SubspaceCreatedSubscriptionHookResult = ReturnType<typeof useSubspaceCreatedSubscription>;
export type SubspaceCreatedSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.SubspaceCreatedSubscription>;
export const SpacePermissionsAndEntitlementsDocument = gql`
  query SpacePermissionsAndEntitlements($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        authorization {
          id
          myPrivileges
        }
        license {
          id
          availableEntitlements
        }
        collaboration {
          id
          license {
            id
            availableEntitlements
          }
        }
        templatesManager {
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
 * __useSpacePermissionsAndEntitlementsQuery__
 *
 * To run a query within a React component, call `useSpacePermissionsAndEntitlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePermissionsAndEntitlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePermissionsAndEntitlementsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpacePermissionsAndEntitlementsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpacePermissionsAndEntitlementsQuery,
    SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
  > &
    ({ variables: SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpacePermissionsAndEntitlementsQuery,
    SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
  >(SpacePermissionsAndEntitlementsDocument, options);
}
export function useSpacePermissionsAndEntitlementsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePermissionsAndEntitlementsQuery,
    SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpacePermissionsAndEntitlementsQuery,
    SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
  >(SpacePermissionsAndEntitlementsDocument, options);
}
export function useSpacePermissionsAndEntitlementsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpacePermissionsAndEntitlementsQuery,
        SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpacePermissionsAndEntitlementsQuery,
    SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
  >(SpacePermissionsAndEntitlementsDocument, options);
}
export type SpacePermissionsAndEntitlementsQueryHookResult = ReturnType<typeof useSpacePermissionsAndEntitlementsQuery>;
export type SpacePermissionsAndEntitlementsLazyQueryHookResult = ReturnType<
  typeof useSpacePermissionsAndEntitlementsLazyQuery
>;
export type SpacePermissionsAndEntitlementsSuspenseQueryHookResult = ReturnType<
  typeof useSpacePermissionsAndEntitlementsSuspenseQuery
>;
export type SpacePermissionsAndEntitlementsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePermissionsAndEntitlementsQuery,
  SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
>;
export function refetchSpacePermissionsAndEntitlementsQuery(
  variables: SchemaTypes.SpacePermissionsAndEntitlementsQueryVariables
) {
  return { query: SpacePermissionsAndEntitlementsDocument, variables: variables };
}
export const SpaceStorageAggregatorIdDocument = gql`
  query SpaceStorageAggregatorId($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        storageAggregator {
          id
        }
      }
    }
  }
`;

/**
 * __useSpaceStorageAggregatorIdQuery__
 *
 * To run a query within a React component, call `useSpaceStorageAggregatorIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceStorageAggregatorIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceStorageAggregatorIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceStorageAggregatorIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceStorageAggregatorIdQuery,
    SchemaTypes.SpaceStorageAggregatorIdQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceStorageAggregatorIdQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceStorageAggregatorIdQuery, SchemaTypes.SpaceStorageAggregatorIdQueryVariables>(
    SpaceStorageAggregatorIdDocument,
    options
  );
}
export function useSpaceStorageAggregatorIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceStorageAggregatorIdQuery,
    SchemaTypes.SpaceStorageAggregatorIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceStorageAggregatorIdQuery,
    SchemaTypes.SpaceStorageAggregatorIdQueryVariables
  >(SpaceStorageAggregatorIdDocument, options);
}
export function useSpaceStorageAggregatorIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceStorageAggregatorIdQuery,
        SchemaTypes.SpaceStorageAggregatorIdQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceStorageAggregatorIdQuery,
    SchemaTypes.SpaceStorageAggregatorIdQueryVariables
  >(SpaceStorageAggregatorIdDocument, options);
}
export type SpaceStorageAggregatorIdQueryHookResult = ReturnType<typeof useSpaceStorageAggregatorIdQuery>;
export type SpaceStorageAggregatorIdLazyQueryHookResult = ReturnType<typeof useSpaceStorageAggregatorIdLazyQuery>;
export type SpaceStorageAggregatorIdSuspenseQueryHookResult = ReturnType<
  typeof useSpaceStorageAggregatorIdSuspenseQuery
>;
export type SpaceStorageAggregatorIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceStorageAggregatorIdQuery,
  SchemaTypes.SpaceStorageAggregatorIdQueryVariables
>;
export function refetchSpaceStorageAggregatorIdQuery(variables: SchemaTypes.SpaceStorageAggregatorIdQueryVariables) {
  return { query: SpaceStorageAggregatorIdDocument, variables: variables };
}
export const SubspacePageDocument = gql`
  query SubspacePage($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        ...SubspacePageSpace
      }
    }
  }
  ${SubspacePageSpaceFragmentDoc}
`;

/**
 * __useSubspacePageQuery__
 *
 * To run a query within a React component, call `useSubspacePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubspacePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspacePageQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSubspacePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables> &
    ({ variables: SchemaTypes.SubspacePageQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>(
    SubspacePageDocument,
    options
  );
}
export function useSubspacePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>(
    SubspacePageDocument,
    options
  );
}
export function useSubspacePageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>(
    SubspacePageDocument,
    options
  );
}
export type SubspacePageQueryHookResult = ReturnType<typeof useSubspacePageQuery>;
export type SubspacePageLazyQueryHookResult = ReturnType<typeof useSubspacePageLazyQuery>;
export type SubspacePageSuspenseQueryHookResult = ReturnType<typeof useSubspacePageSuspenseQuery>;
export type SubspacePageQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspacePageQuery,
  SchemaTypes.SubspacePageQueryVariables
>;
export function refetchSubspacePageQuery(variables: SchemaTypes.SubspacePageQueryVariables) {
  return { query: SubspacePageDocument, variables: variables };
}
export const SpaceTabDocument = gql`
  query SpaceTab($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        authorization {
          id
          myPrivileges
        }
        about {
          ...SpaceAboutLight
        }
        collaboration {
          id
          innovationFlow {
            id
            states {
              id
              displayName
              description
              sortOrder
              settings {
                allowNewCallouts
              }
            }
          }
          calloutsSet {
            id
          }
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __useSpaceTabQuery__
 *
 * To run a query within a React component, call `useSpaceTabQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTabQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTabQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTabQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables> &
    ({ variables: SchemaTypes.SpaceTabQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>(SpaceTabDocument, options);
}
export function useSpaceTabLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>(SpaceTabDocument, options);
}
export function useSpaceTabSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>(
    SpaceTabDocument,
    options
  );
}
export type SpaceTabQueryHookResult = ReturnType<typeof useSpaceTabQuery>;
export type SpaceTabLazyQueryHookResult = ReturnType<typeof useSpaceTabLazyQuery>;
export type SpaceTabSuspenseQueryHookResult = ReturnType<typeof useSpaceTabSuspenseQuery>;
export type SpaceTabQueryResult = Apollo.QueryResult<SchemaTypes.SpaceTabQuery, SchemaTypes.SpaceTabQueryVariables>;
export function refetchSpaceTabQuery(variables: SchemaTypes.SpaceTabQueryVariables) {
  return { query: SpaceTabDocument, variables: variables };
}
export const SpacePageDocument = gql`
  query SpacePage($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        ...SpacePage
      }
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
export const SpaceTabsDocument = gql`
  query SpaceTabs($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        collaboration {
          id
          innovationFlow {
            id
            currentState {
              id
            }
            states {
              id
              displayName
              description
              sortOrder
              settings {
                allowNewCallouts
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceTabsQuery__
 *
 * To run a query within a React component, call `useSpaceTabsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTabsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTabsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTabsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables> &
    ({ variables: SchemaTypes.SpaceTabsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>(SpaceTabsDocument, options);
}
export function useSpaceTabsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>(
    SpaceTabsDocument,
    options
  );
}
export function useSpaceTabsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>(
    SpaceTabsDocument,
    options
  );
}
export type SpaceTabsQueryHookResult = ReturnType<typeof useSpaceTabsQuery>;
export type SpaceTabsLazyQueryHookResult = ReturnType<typeof useSpaceTabsLazyQuery>;
export type SpaceTabsSuspenseQueryHookResult = ReturnType<typeof useSpaceTabsSuspenseQuery>;
export type SpaceTabsQueryResult = Apollo.QueryResult<SchemaTypes.SpaceTabsQuery, SchemaTypes.SpaceTabsQueryVariables>;
export function refetchSpaceTabsQuery(variables: SchemaTypes.SpaceTabsQueryVariables) {
  return { query: SpaceTabsDocument, variables: variables };
}
export const SpaceAccountDocument = gql`
  query SpaceAccount($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutLight
          provider {
            id
            __typename
            authorization {
              myPrivileges
            }
            profile {
              id
              displayName
              avatar: visual(type: AVATAR) {
                ...VisualModel
              }
              location {
                id
                city
                country
              }
              url
            }
            ... on User {
              isContactable
            }
          }
        }
        activeSubscription {
          name
          expires
        }
        authorization {
          id
          myPrivileges
        }
        visibility
      }
    }
    platform {
      id
      licensingFramework {
        id
        plans {
          id
          name
          enabled
          type
          sortOrder
          isFree
          pricePerMonth
          licenseCredential
        }
      }
      configuration {
        locations {
          support
          switchplan
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
  ${VisualModelFragmentDoc}
`;

/**
 * __useSpaceAccountQuery__
 *
 * To run a query within a React component, call `useSpaceAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAccountQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAccountQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables> &
    ({ variables: SchemaTypes.SpaceAccountQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>(
    SpaceAccountDocument,
    options
  );
}
export function useSpaceAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>(
    SpaceAccountDocument,
    options
  );
}
export function useSpaceAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>(
    SpaceAccountDocument,
    options
  );
}
export type SpaceAccountQueryHookResult = ReturnType<typeof useSpaceAccountQuery>;
export type SpaceAccountLazyQueryHookResult = ReturnType<typeof useSpaceAccountLazyQuery>;
export type SpaceAccountSuspenseQueryHookResult = ReturnType<typeof useSpaceAccountSuspenseQuery>;
export type SpaceAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAccountQuery,
  SchemaTypes.SpaceAccountQueryVariables
>;
export function refetchSpaceAccountQuery(variables: SchemaTypes.SpaceAccountQueryVariables) {
  return { query: SpaceAccountDocument, variables: variables };
}
export const CommunityApplicationDocument = gql`
  query CommunityApplication($applicationId: UUID!) {
    lookup {
      application(ID: $applicationId) {
        id
        createdDate
        updatedDate
        contributor {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
            location {
              id
              city
              country
            }
            url
          }
        }
        questions {
          id
          name
          value
        }
        state
        nextEvents
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useCommunityApplicationQuery__
 *
 * To run a query within a React component, call `useCommunityApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityApplicationQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useCommunityApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityApplicationQuery,
    SchemaTypes.CommunityApplicationQueryVariables
  > &
    ({ variables: SchemaTypes.CommunityApplicationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityApplicationQuery, SchemaTypes.CommunityApplicationQueryVariables>(
    CommunityApplicationDocument,
    options
  );
}
export function useCommunityApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityApplicationQuery,
    SchemaTypes.CommunityApplicationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityApplicationQuery, SchemaTypes.CommunityApplicationQueryVariables>(
    CommunityApplicationDocument,
    options
  );
}
export function useCommunityApplicationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CommunityApplicationQuery,
        SchemaTypes.CommunityApplicationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CommunityApplicationQuery, SchemaTypes.CommunityApplicationQueryVariables>(
    CommunityApplicationDocument,
    options
  );
}
export type CommunityApplicationQueryHookResult = ReturnType<typeof useCommunityApplicationQuery>;
export type CommunityApplicationLazyQueryHookResult = ReturnType<typeof useCommunityApplicationLazyQuery>;
export type CommunityApplicationSuspenseQueryHookResult = ReturnType<typeof useCommunityApplicationSuspenseQuery>;
export type CommunityApplicationQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityApplicationQuery,
  SchemaTypes.CommunityApplicationQueryVariables
>;
export function refetchCommunityApplicationQuery(variables: SchemaTypes.CommunityApplicationQueryVariables) {
  return { query: CommunityApplicationDocument, variables: variables };
}
export const CommunityInvitationDocument = gql`
  query CommunityInvitation($invitationId: UUID!, $isPlatformInvitation: Boolean!) {
    lookup {
      invitation(ID: $invitationId) @skip(if: $isPlatformInvitation) {
        id
        createdDate
        updatedDate
        welcomeMessage
        contributorType
        contributor {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualModel
            }
            location {
              id
              city
              country
            }
            url
          }
        }
      }
      platformInvitation(ID: $invitationId) @include(if: $isPlatformInvitation) {
        id
        createdDate
        updatedDate
        email
        welcomeMessage
      }
    }
  }
  ${VisualModelFragmentDoc}
`;

/**
 * __useCommunityInvitationQuery__
 *
 * To run a query within a React component, call `useCommunityInvitationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityInvitationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityInvitationQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      isPlatformInvitation: // value for 'isPlatformInvitation'
 *   },
 * });
 */
export function useCommunityInvitationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityInvitationQuery,
    SchemaTypes.CommunityInvitationQueryVariables
  > &
    ({ variables: SchemaTypes.CommunityInvitationQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityInvitationQuery, SchemaTypes.CommunityInvitationQueryVariables>(
    CommunityInvitationDocument,
    options
  );
}
export function useCommunityInvitationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityInvitationQuery,
    SchemaTypes.CommunityInvitationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CommunityInvitationQuery, SchemaTypes.CommunityInvitationQueryVariables>(
    CommunityInvitationDocument,
    options
  );
}
export function useCommunityInvitationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CommunityInvitationQuery,
        SchemaTypes.CommunityInvitationQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CommunityInvitationQuery, SchemaTypes.CommunityInvitationQueryVariables>(
    CommunityInvitationDocument,
    options
  );
}
export type CommunityInvitationQueryHookResult = ReturnType<typeof useCommunityInvitationQuery>;
export type CommunityInvitationLazyQueryHookResult = ReturnType<typeof useCommunityInvitationLazyQuery>;
export type CommunityInvitationSuspenseQueryHookResult = ReturnType<typeof useCommunityInvitationSuspenseQuery>;
export type CommunityInvitationQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityInvitationQuery,
  SchemaTypes.CommunityInvitationQueryVariables
>;
export function refetchCommunityInvitationQuery(variables: SchemaTypes.CommunityInvitationQueryVariables) {
  return { query: CommunityInvitationDocument, variables: variables };
}
export const AvailableVirtualContributorsInLibraryDocument = gql`
  query AvailableVirtualContributorsInLibrary {
    platform {
      id
      library {
        id
        virtualContributors {
          searchVisibility
          ...VirtualContributorFull
        }
      }
    }
  }
  ${VirtualContributorFullFragmentDoc}
`;

/**
 * __useAvailableVirtualContributorsInLibraryQuery__
 *
 * To run a query within a React component, call `useAvailableVirtualContributorsInLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableVirtualContributorsInLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableVirtualContributorsInLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function useAvailableVirtualContributorsInLibraryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
    SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
    SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
  >(AvailableVirtualContributorsInLibraryDocument, options);
}
export function useAvailableVirtualContributorsInLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
    SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
    SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
  >(AvailableVirtualContributorsInLibraryDocument, options);
}
export function useAvailableVirtualContributorsInLibrarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
        SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
    SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
  >(AvailableVirtualContributorsInLibraryDocument, options);
}
export type AvailableVirtualContributorsInLibraryQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInLibraryQuery
>;
export type AvailableVirtualContributorsInLibraryLazyQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInLibraryLazyQuery
>;
export type AvailableVirtualContributorsInLibrarySuspenseQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInLibrarySuspenseQuery
>;
export type AvailableVirtualContributorsInLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableVirtualContributorsInLibraryQuery,
  SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
>;
export function refetchAvailableVirtualContributorsInLibraryQuery(
  variables?: SchemaTypes.AvailableVirtualContributorsInLibraryQueryVariables
) {
  return { query: AvailableVirtualContributorsInLibraryDocument, variables: variables };
}
export const AvailableVirtualContributorsInSpaceAccountDocument = gql`
  query AvailableVirtualContributorsInSpaceAccount($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        account {
          id
          virtualContributors {
            ...VirtualContributorFull
          }
        }
      }
    }
  }
  ${VirtualContributorFullFragmentDoc}
`;

/**
 * __useAvailableVirtualContributorsInSpaceAccountQuery__
 *
 * To run a query within a React component, call `useAvailableVirtualContributorsInSpaceAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableVirtualContributorsInSpaceAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableVirtualContributorsInSpaceAccountQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAvailableVirtualContributorsInSpaceAccountQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
  > &
    (
      | { variables: SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
  >(AvailableVirtualContributorsInSpaceAccountDocument, options);
}
export function useAvailableVirtualContributorsInSpaceAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
  >(AvailableVirtualContributorsInSpaceAccountDocument, options);
}
export function useAvailableVirtualContributorsInSpaceAccountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
        SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
  >(AvailableVirtualContributorsInSpaceAccountDocument, options);
}
export type AvailableVirtualContributorsInSpaceAccountQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceAccountQuery
>;
export type AvailableVirtualContributorsInSpaceAccountLazyQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceAccountLazyQuery
>;
export type AvailableVirtualContributorsInSpaceAccountSuspenseQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceAccountSuspenseQuery
>;
export type AvailableVirtualContributorsInSpaceAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableVirtualContributorsInSpaceAccountQuery,
  SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
>;
export function refetchAvailableVirtualContributorsInSpaceAccountQuery(
  variables: SchemaTypes.AvailableVirtualContributorsInSpaceAccountQueryVariables
) {
  return { query: AvailableVirtualContributorsInSpaceAccountDocument, variables: variables };
}
export const AvailableVirtualContributorsInSpaceDocument = gql`
  query AvailableVirtualContributorsInSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        community {
          id
          roleSet {
            id
            availableVirtualContributorsForEntryRole {
              ...AvailableVirtualContributorsForRoleSetPaginated
            }
          }
        }
      }
    }
  }
  ${AvailableVirtualContributorsForRoleSetPaginatedFragmentDoc}
`;

/**
 * __useAvailableVirtualContributorsInSpaceQuery__
 *
 * To run a query within a React component, call `useAvailableVirtualContributorsInSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableVirtualContributorsInSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableVirtualContributorsInSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAvailableVirtualContributorsInSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
  >(AvailableVirtualContributorsInSpaceDocument, options);
}
export function useAvailableVirtualContributorsInSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
  >(AvailableVirtualContributorsInSpaceDocument, options);
}
export function useAvailableVirtualContributorsInSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
        SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
    SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
  >(AvailableVirtualContributorsInSpaceDocument, options);
}
export type AvailableVirtualContributorsInSpaceQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceQuery
>;
export type AvailableVirtualContributorsInSpaceLazyQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceLazyQuery
>;
export type AvailableVirtualContributorsInSpaceSuspenseQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInSpaceSuspenseQuery
>;
export type AvailableVirtualContributorsInSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableVirtualContributorsInSpaceQuery,
  SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
>;
export function refetchAvailableVirtualContributorsInSpaceQuery(
  variables: SchemaTypes.AvailableVirtualContributorsInSpaceQueryVariables
) {
  return { query: AvailableVirtualContributorsInSpaceDocument, variables: variables };
}
export const SpaceCollaborationIdDocument = gql`
  query SpaceCollaborationId($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        collaboration {
          id
          calloutsSet {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceCollaborationIdQuery__
 *
 * To run a query within a React component, call `useSpaceCollaborationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCollaborationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCollaborationIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCollaborationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCollaborationIdQuery,
    SchemaTypes.SpaceCollaborationIdQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCollaborationIdQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCollaborationIdQuery, SchemaTypes.SpaceCollaborationIdQueryVariables>(
    SpaceCollaborationIdDocument,
    options
  );
}
export function useSpaceCollaborationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCollaborationIdQuery,
    SchemaTypes.SpaceCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCollaborationIdQuery, SchemaTypes.SpaceCollaborationIdQueryVariables>(
    SpaceCollaborationIdDocument,
    options
  );
}
export function useSpaceCollaborationIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCollaborationIdQuery,
        SchemaTypes.SpaceCollaborationIdQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceCollaborationIdQuery, SchemaTypes.SpaceCollaborationIdQueryVariables>(
    SpaceCollaborationIdDocument,
    options
  );
}
export type SpaceCollaborationIdQueryHookResult = ReturnType<typeof useSpaceCollaborationIdQuery>;
export type SpaceCollaborationIdLazyQueryHookResult = ReturnType<typeof useSpaceCollaborationIdLazyQuery>;
export type SpaceCollaborationIdSuspenseQueryHookResult = ReturnType<typeof useSpaceCollaborationIdSuspenseQuery>;
export type SpaceCollaborationIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCollaborationIdQuery,
  SchemaTypes.SpaceCollaborationIdQueryVariables
>;
export function refetchSpaceCollaborationIdQuery(variables: SchemaTypes.SpaceCollaborationIdQueryVariables) {
  return { query: SpaceCollaborationIdDocument, variables: variables };
}
export const SpaceSettingsDocument = gql`
  query SpaceSettings($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          id
          provider {
            id
            profile {
              id
              displayName
            }
          }
          membership {
            roleSetID
            communityID
          }
        }
        settings {
          ...SpaceSettings
        }
        collaboration {
          id
        }
      }
    }
  }
  ${SpaceSettingsFragmentDoc}
`;

/**
 * __useSpaceSettingsQuery__
 *
 * To run a query within a React component, call `useSpaceSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSettingsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables> &
    ({ variables: SchemaTypes.SpaceSettingsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>(
    SpaceSettingsDocument,
    options
  );
}
export function useSpaceSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>(
    SpaceSettingsDocument,
    options
  );
}
export function useSpaceSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>(
    SpaceSettingsDocument,
    options
  );
}
export type SpaceSettingsQueryHookResult = ReturnType<typeof useSpaceSettingsQuery>;
export type SpaceSettingsLazyQueryHookResult = ReturnType<typeof useSpaceSettingsLazyQuery>;
export type SpaceSettingsSuspenseQueryHookResult = ReturnType<typeof useSpaceSettingsSuspenseQuery>;
export type SpaceSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsQuery,
  SchemaTypes.SpaceSettingsQueryVariables
>;
export function refetchSpaceSettingsQuery(variables: SchemaTypes.SpaceSettingsQueryVariables) {
  return { query: SpaceSettingsDocument, variables: variables };
}
export const UpdateSpaceSettingsDocument = gql`
  mutation UpdateSpaceSettings($settingsData: UpdateSpaceSettingsInput!) {
    updateSpaceSettings(settingsData: $settingsData) {
      id
      settings {
        privacy {
          mode
          allowPlatformSupportAsAdmin
        }
        membership {
          policy
          trustedOrganizations
          allowSubspaceAdminsToInviteMembers
        }
        collaboration {
          allowMembersToCreateCallouts
          allowMembersToCreateSubspaces
          inheritMembershipRights
          allowEventsFromSubspaces
          allowMembersToVideoCall
        }
      }
    }
  }
`;
export type UpdateSpaceSettingsMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateSpaceSettingsMutation,
  SchemaTypes.UpdateSpaceSettingsMutationVariables
>;

/**
 * __useUpdateSpaceSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSpaceSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSpaceSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSpaceSettingsMutation, { data, loading, error }] = useUpdateSpaceSettingsMutation({
 *   variables: {
 *      settingsData: // value for 'settingsData'
 *   },
 * });
 */
export function useUpdateSpaceSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateSpaceSettingsMutation,
    SchemaTypes.UpdateSpaceSettingsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateSpaceSettingsMutation, SchemaTypes.UpdateSpaceSettingsMutationVariables>(
    UpdateSpaceSettingsDocument,
    options
  );
}
export type UpdateSpaceSettingsMutationHookResult = ReturnType<typeof useUpdateSpaceSettingsMutation>;
export type UpdateSpaceSettingsMutationResult = Apollo.MutationResult<SchemaTypes.UpdateSpaceSettingsMutation>;
export type UpdateSpaceSettingsMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateSpaceSettingsMutation,
  SchemaTypes.UpdateSpaceSettingsMutationVariables
>;
export const SpaceStorageAdminPageDocument = gql`
  query SpaceStorageAdminPage($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimal
        }
        storageAggregator {
          ...StorageAggregator
        }
      }
    }
  }
  ${SpaceAboutMinimalFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.SpaceStorageAdminPageQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSpaceStorageAdminPageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceStorageAdminPageQuery,
        SchemaTypes.SpaceStorageAdminPageQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceStorageAdminPageQuery,
    SchemaTypes.SpaceStorageAdminPageQueryVariables
  >(SpaceStorageAdminPageDocument, options);
}
export type SpaceStorageAdminPageQueryHookResult = ReturnType<typeof useSpaceStorageAdminPageQuery>;
export type SpaceStorageAdminPageLazyQueryHookResult = ReturnType<typeof useSpaceStorageAdminPageLazyQuery>;
export type SpaceStorageAdminPageSuspenseQueryHookResult = ReturnType<typeof useSpaceStorageAdminPageSuspenseQuery>;
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
  > &
    ({ variables: SchemaTypes.StorageAggregatorLookupQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useStorageAggregatorLookupSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.StorageAggregatorLookupQuery,
        SchemaTypes.StorageAggregatorLookupQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.StorageAggregatorLookupQuery,
    SchemaTypes.StorageAggregatorLookupQueryVariables
  >(StorageAggregatorLookupDocument, options);
}
export type StorageAggregatorLookupQueryHookResult = ReturnType<typeof useStorageAggregatorLookupQuery>;
export type StorageAggregatorLookupLazyQueryHookResult = ReturnType<typeof useStorageAggregatorLookupLazyQuery>;
export type StorageAggregatorLookupSuspenseQueryHookResult = ReturnType<typeof useStorageAggregatorLookupSuspenseQuery>;
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
export const SpaceAdminDefaultSpaceTemplatesDetailsDocument = gql`
  query SpaceAdminDefaultSpaceTemplatesDetails($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        templatesManager {
          id
          templatesSet {
            id
            authorization {
              myPrivileges
            }
          }
          templateDefaults {
            id
            type
            template {
              id
              profile {
                ...InnovationFlowProfile
              }
              contentSpace {
                id
                collaboration {
                  id
                  calloutsSet {
                    id
                    callouts {
                      id
                      sortOrder
                      classification {
                        id
                        flowState: tagset(tagsetName: FLOW_STATE) {
                          ...TagsetDetails
                        }
                      }
                      framing {
                        id
                        profile {
                          id
                          displayName
                          description
                        }
                        type
                      }
                    }
                  }
                  innovationFlow {
                    ...InnovationFlowDetails
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${InnovationFlowProfileFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${InnovationFlowDetailsFragmentDoc}
`;

/**
 * __useSpaceAdminDefaultSpaceTemplatesDetailsQuery__
 *
 * To run a query within a React component, call `useSpaceAdminDefaultSpaceTemplatesDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAdminDefaultSpaceTemplatesDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAdminDefaultSpaceTemplatesDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAdminDefaultSpaceTemplatesDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
  > &
    (
      | { variables: SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
  >(SpaceAdminDefaultSpaceTemplatesDetailsDocument, options);
}
export function useSpaceAdminDefaultSpaceTemplatesDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
  >(SpaceAdminDefaultSpaceTemplatesDetailsDocument, options);
}
export function useSpaceAdminDefaultSpaceTemplatesDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
        SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
    SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
  >(SpaceAdminDefaultSpaceTemplatesDetailsDocument, options);
}
export type SpaceAdminDefaultSpaceTemplatesDetailsQueryHookResult = ReturnType<
  typeof useSpaceAdminDefaultSpaceTemplatesDetailsQuery
>;
export type SpaceAdminDefaultSpaceTemplatesDetailsLazyQueryHookResult = ReturnType<
  typeof useSpaceAdminDefaultSpaceTemplatesDetailsLazyQuery
>;
export type SpaceAdminDefaultSpaceTemplatesDetailsSuspenseQueryHookResult = ReturnType<
  typeof useSpaceAdminDefaultSpaceTemplatesDetailsSuspenseQuery
>;
export type SpaceAdminDefaultSpaceTemplatesDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQuery,
  SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
>;
export function refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery(
  variables: SchemaTypes.SpaceAdminDefaultSpaceTemplatesDetailsQueryVariables
) {
  return { query: SpaceAdminDefaultSpaceTemplatesDetailsDocument, variables: variables };
}
export const SpacePrivilegesDocument = gql`
  query SpacePrivileges($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
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
 * __useSpacePrivilegesQuery__
 *
 * To run a query within a React component, call `useSpacePrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpacePrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables> &
    ({ variables: SchemaTypes.SpacePrivilegesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>(
    SpacePrivilegesDocument,
    options
  );
}
export function useSpacePrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>(
    SpacePrivilegesDocument,
    options
  );
}
export function useSpacePrivilegesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>(
    SpacePrivilegesDocument,
    options
  );
}
export type SpacePrivilegesQueryHookResult = ReturnType<typeof useSpacePrivilegesQuery>;
export type SpacePrivilegesLazyQueryHookResult = ReturnType<typeof useSpacePrivilegesLazyQuery>;
export type SpacePrivilegesSuspenseQueryHookResult = ReturnType<typeof useSpacePrivilegesSuspenseQuery>;
export type SpacePrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePrivilegesQuery,
  SchemaTypes.SpacePrivilegesQueryVariables
>;
export function refetchSpacePrivilegesQuery(variables: SchemaTypes.SpacePrivilegesQueryVariables) {
  return { query: SpacePrivilegesDocument, variables: variables };
}
export const SpaceStorageConfigDocument = gql`
  query SpaceStorageConfig($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
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
 * __useSpaceStorageConfigQuery__
 *
 * To run a query within a React component, call `useSpaceStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceStorageConfigQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceStorageConfigQuery,
    SchemaTypes.SpaceStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceStorageConfigQuery, SchemaTypes.SpaceStorageConfigQueryVariables>(
    SpaceStorageConfigDocument,
    options
  );
}
export function useSpaceStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceStorageConfigQuery,
    SchemaTypes.SpaceStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceStorageConfigQuery, SchemaTypes.SpaceStorageConfigQueryVariables>(
    SpaceStorageConfigDocument,
    options
  );
}
export function useSpaceStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceStorageConfigQuery, SchemaTypes.SpaceStorageConfigQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceStorageConfigQuery, SchemaTypes.SpaceStorageConfigQueryVariables>(
    SpaceStorageConfigDocument,
    options
  );
}
export type SpaceStorageConfigQueryHookResult = ReturnType<typeof useSpaceStorageConfigQuery>;
export type SpaceStorageConfigLazyQueryHookResult = ReturnType<typeof useSpaceStorageConfigLazyQuery>;
export type SpaceStorageConfigSuspenseQueryHookResult = ReturnType<typeof useSpaceStorageConfigSuspenseQuery>;
export type SpaceStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceStorageConfigQuery,
  SchemaTypes.SpaceStorageConfigQueryVariables
>;
export function refetchSpaceStorageConfigQuery(variables: SchemaTypes.SpaceStorageConfigQueryVariables) {
  return { query: SpaceStorageConfigDocument, variables: variables };
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
  > &
    ({ variables: SchemaTypes.CalloutStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCalloutStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutStorageConfigQuery,
        SchemaTypes.CalloutStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalloutStorageConfigQuery, SchemaTypes.CalloutStorageConfigQueryVariables>(
    CalloutStorageConfigDocument,
    options
  );
}
export type CalloutStorageConfigQueryHookResult = ReturnType<typeof useCalloutStorageConfigQuery>;
export type CalloutStorageConfigLazyQueryHookResult = ReturnType<typeof useCalloutStorageConfigLazyQuery>;
export type CalloutStorageConfigSuspenseQueryHookResult = ReturnType<typeof useCalloutStorageConfigSuspenseQuery>;
export type CalloutStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutStorageConfigQuery,
  SchemaTypes.CalloutStorageConfigQueryVariables
>;
export function refetchCalloutStorageConfigQuery(variables: SchemaTypes.CalloutStorageConfigQueryVariables) {
  return { query: CalloutStorageConfigDocument, variables: variables };
}
export const CalloutPostStorageConfigDocument = gql`
  query CalloutPostStorageConfig($postId: UUID!) {
    lookup {
      post(ID: $postId) {
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
 *   },
 * });
 */
export function useCalloutPostStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutPostStorageConfigQuery,
    SchemaTypes.CalloutPostStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.CalloutPostStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCalloutPostStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalloutPostStorageConfigQuery,
        SchemaTypes.CalloutPostStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CalloutPostStorageConfigQuery,
    SchemaTypes.CalloutPostStorageConfigQueryVariables
  >(CalloutPostStorageConfigDocument, options);
}
export type CalloutPostStorageConfigQueryHookResult = ReturnType<typeof useCalloutPostStorageConfigQuery>;
export type CalloutPostStorageConfigLazyQueryHookResult = ReturnType<typeof useCalloutPostStorageConfigLazyQuery>;
export type CalloutPostStorageConfigSuspenseQueryHookResult = ReturnType<
  typeof useCalloutPostStorageConfigSuspenseQuery
>;
export type CalloutPostStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutPostStorageConfigQuery,
  SchemaTypes.CalloutPostStorageConfigQueryVariables
>;
export function refetchCalloutPostStorageConfigQuery(variables: SchemaTypes.CalloutPostStorageConfigQueryVariables) {
  return { query: CalloutPostStorageConfigDocument, variables: variables };
}
export const UserStorageConfigDocument = gql`
  query UserStorageConfig($userId: UUID!) {
    lookup {
      user(ID: $userId) {
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
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.UserStorageConfigQuery,
    SchemaTypes.UserStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.UserStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UserStorageConfigQuery, SchemaTypes.UserStorageConfigQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserStorageConfigQuery, SchemaTypes.UserStorageConfigQueryVariables>(
    UserStorageConfigDocument,
    options
  );
}
export type UserStorageConfigQueryHookResult = ReturnType<typeof useUserStorageConfigQuery>;
export type UserStorageConfigLazyQueryHookResult = ReturnType<typeof useUserStorageConfigLazyQuery>;
export type UserStorageConfigSuspenseQueryHookResult = ReturnType<typeof useUserStorageConfigSuspenseQuery>;
export type UserStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.UserStorageConfigQuery,
  SchemaTypes.UserStorageConfigQueryVariables
>;
export function refetchUserStorageConfigQuery(variables: SchemaTypes.UserStorageConfigQueryVariables) {
  return { query: UserStorageConfigDocument, variables: variables };
}
export const VirtualContributorStorageConfigDocument = gql`
  query VirtualContributorStorageConfig($virtualContributorId: UUID!) {
    lookup {
      virtualContributor(ID: $virtualContributorId) {
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
 * __useVirtualContributorStorageConfigQuery__
 *
 * To run a query within a React component, call `useVirtualContributorStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useVirtualContributorStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVirtualContributorStorageConfigQuery({
 *   variables: {
 *      virtualContributorId: // value for 'virtualContributorId'
 *   },
 * });
 */
export function useVirtualContributorStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.VirtualContributorStorageConfigQuery,
    SchemaTypes.VirtualContributorStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.VirtualContributorStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.VirtualContributorStorageConfigQuery,
    SchemaTypes.VirtualContributorStorageConfigQueryVariables
  >(VirtualContributorStorageConfigDocument, options);
}
export function useVirtualContributorStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.VirtualContributorStorageConfigQuery,
    SchemaTypes.VirtualContributorStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.VirtualContributorStorageConfigQuery,
    SchemaTypes.VirtualContributorStorageConfigQueryVariables
  >(VirtualContributorStorageConfigDocument, options);
}
export function useVirtualContributorStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.VirtualContributorStorageConfigQuery,
        SchemaTypes.VirtualContributorStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.VirtualContributorStorageConfigQuery,
    SchemaTypes.VirtualContributorStorageConfigQueryVariables
  >(VirtualContributorStorageConfigDocument, options);
}
export type VirtualContributorStorageConfigQueryHookResult = ReturnType<typeof useVirtualContributorStorageConfigQuery>;
export type VirtualContributorStorageConfigLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorStorageConfigLazyQuery
>;
export type VirtualContributorStorageConfigSuspenseQueryHookResult = ReturnType<
  typeof useVirtualContributorStorageConfigSuspenseQuery
>;
export type VirtualContributorStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorStorageConfigQuery,
  SchemaTypes.VirtualContributorStorageConfigQueryVariables
>;
export function refetchVirtualContributorStorageConfigQuery(
  variables: SchemaTypes.VirtualContributorStorageConfigQueryVariables
) {
  return { query: VirtualContributorStorageConfigDocument, variables: variables };
}
export const OrganizationStorageConfigDocument = gql`
  query OrganizationStorageConfig($organizationId: UUID!) {
    lookup {
      organization(ID: $organizationId) {
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
  > &
    ({ variables: SchemaTypes.OrganizationStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useOrganizationStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.OrganizationStorageConfigQuery,
        SchemaTypes.OrganizationStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.OrganizationStorageConfigQuery,
    SchemaTypes.OrganizationStorageConfigQueryVariables
  >(OrganizationStorageConfigDocument, options);
}
export type OrganizationStorageConfigQueryHookResult = ReturnType<typeof useOrganizationStorageConfigQuery>;
export type OrganizationStorageConfigLazyQueryHookResult = ReturnType<typeof useOrganizationStorageConfigLazyQuery>;
export type OrganizationStorageConfigSuspenseQueryHookResult = ReturnType<
  typeof useOrganizationStorageConfigSuspenseQuery
>;
export type OrganizationStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationStorageConfigQuery,
  SchemaTypes.OrganizationStorageConfigQueryVariables
>;
export function refetchOrganizationStorageConfigQuery(variables: SchemaTypes.OrganizationStorageConfigQueryVariables) {
  return { query: OrganizationStorageConfigDocument, variables: variables };
}
export const InnovationPackStorageConfigDocument = gql`
  query InnovationPackStorageConfig($innovationPackId: UUID!) {
    lookup {
      innovationPack(ID: $innovationPackId) {
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
  > &
    ({ variables: SchemaTypes.InnovationPackStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useInnovationPackStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationPackStorageConfigQuery,
        SchemaTypes.InnovationPackStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationPackStorageConfigQuery,
    SchemaTypes.InnovationPackStorageConfigQueryVariables
  >(InnovationPackStorageConfigDocument, options);
}
export type InnovationPackStorageConfigQueryHookResult = ReturnType<typeof useInnovationPackStorageConfigQuery>;
export type InnovationPackStorageConfigLazyQueryHookResult = ReturnType<typeof useInnovationPackStorageConfigLazyQuery>;
export type InnovationPackStorageConfigSuspenseQueryHookResult = ReturnType<
  typeof useInnovationPackStorageConfigSuspenseQuery
>;
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
  query InnovationHubStorageConfig($innovationHubId: UUID!) {
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
  > &
    ({ variables: SchemaTypes.InnovationHubStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useInnovationHubStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InnovationHubStorageConfigQuery,
        SchemaTypes.InnovationHubStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InnovationHubStorageConfigQuery,
    SchemaTypes.InnovationHubStorageConfigQueryVariables
  >(InnovationHubStorageConfigDocument, options);
}
export type InnovationHubStorageConfigQueryHookResult = ReturnType<typeof useInnovationHubStorageConfigQuery>;
export type InnovationHubStorageConfigLazyQueryHookResult = ReturnType<typeof useInnovationHubStorageConfigLazyQuery>;
export type InnovationHubStorageConfigSuspenseQueryHookResult = ReturnType<
  typeof useInnovationHubStorageConfigSuspenseQuery
>;
export type InnovationHubStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubStorageConfigQuery,
  SchemaTypes.InnovationHubStorageConfigQueryVariables
>;
export function refetchInnovationHubStorageConfigQuery(
  variables: SchemaTypes.InnovationHubStorageConfigQueryVariables
) {
  return { query: InnovationHubStorageConfigDocument, variables: variables };
}
export const TemplateStorageConfigDocument = gql`
  query TemplateStorageConfig($templateId: UUID!) {
    lookup {
      template(ID: $templateId) {
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
 * __useTemplateStorageConfigQuery__
 *
 * To run a query within a React component, call `useTemplateStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateStorageConfigQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useTemplateStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.TemplateStorageConfigQuery,
    SchemaTypes.TemplateStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.TemplateStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.TemplateStorageConfigQuery, SchemaTypes.TemplateStorageConfigQueryVariables>(
    TemplateStorageConfigDocument,
    options
  );
}
export function useTemplateStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.TemplateStorageConfigQuery,
    SchemaTypes.TemplateStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.TemplateStorageConfigQuery, SchemaTypes.TemplateStorageConfigQueryVariables>(
    TemplateStorageConfigDocument,
    options
  );
}
export function useTemplateStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.TemplateStorageConfigQuery,
        SchemaTypes.TemplateStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.TemplateStorageConfigQuery,
    SchemaTypes.TemplateStorageConfigQueryVariables
  >(TemplateStorageConfigDocument, options);
}
export type TemplateStorageConfigQueryHookResult = ReturnType<typeof useTemplateStorageConfigQuery>;
export type TemplateStorageConfigLazyQueryHookResult = ReturnType<typeof useTemplateStorageConfigLazyQuery>;
export type TemplateStorageConfigSuspenseQueryHookResult = ReturnType<typeof useTemplateStorageConfigSuspenseQuery>;
export type TemplateStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.TemplateStorageConfigQuery,
  SchemaTypes.TemplateStorageConfigQueryVariables
>;
export function refetchTemplateStorageConfigQuery(variables: SchemaTypes.TemplateStorageConfigQueryVariables) {
  return { query: TemplateStorageConfigDocument, variables: variables };
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
export function usePlatformStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.PlatformStorageConfigQuery,
        SchemaTypes.PlatformStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.PlatformStorageConfigQuery,
    SchemaTypes.PlatformStorageConfigQueryVariables
  >(PlatformStorageConfigDocument, options);
}
export type PlatformStorageConfigQueryHookResult = ReturnType<typeof usePlatformStorageConfigQuery>;
export type PlatformStorageConfigLazyQueryHookResult = ReturnType<typeof usePlatformStorageConfigLazyQuery>;
export type PlatformStorageConfigSuspenseQueryHookResult = ReturnType<typeof usePlatformStorageConfigSuspenseQuery>;
export type PlatformStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformStorageConfigQuery,
  SchemaTypes.PlatformStorageConfigQueryVariables
>;
export function refetchPlatformStorageConfigQuery(variables?: SchemaTypes.PlatformStorageConfigQueryVariables) {
  return { query: PlatformStorageConfigDocument, variables: variables };
}
export const AccountStorageConfigDocument = gql`
  query AccountStorageConfig($accountId: UUID!) {
    lookup {
      account(ID: $accountId) {
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
  }
`;

/**
 * __useAccountStorageConfigQuery__
 *
 * To run a query within a React component, call `useAccountStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountStorageConfigQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useAccountStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AccountStorageConfigQuery,
    SchemaTypes.AccountStorageConfigQueryVariables
  > &
    ({ variables: SchemaTypes.AccountStorageConfigQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AccountStorageConfigQuery, SchemaTypes.AccountStorageConfigQueryVariables>(
    AccountStorageConfigDocument,
    options
  );
}
export function useAccountStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AccountStorageConfigQuery,
    SchemaTypes.AccountStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AccountStorageConfigQuery, SchemaTypes.AccountStorageConfigQueryVariables>(
    AccountStorageConfigDocument,
    options
  );
}
export function useAccountStorageConfigSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AccountStorageConfigQuery,
        SchemaTypes.AccountStorageConfigQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AccountStorageConfigQuery, SchemaTypes.AccountStorageConfigQueryVariables>(
    AccountStorageConfigDocument,
    options
  );
}
export type AccountStorageConfigQueryHookResult = ReturnType<typeof useAccountStorageConfigQuery>;
export type AccountStorageConfigLazyQueryHookResult = ReturnType<typeof useAccountStorageConfigLazyQuery>;
export type AccountStorageConfigSuspenseQueryHookResult = ReturnType<typeof useAccountStorageConfigSuspenseQuery>;
export type AccountStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountStorageConfigQuery,
  SchemaTypes.AccountStorageConfigQueryVariables
>;
export function refetchAccountStorageConfigQuery(variables: SchemaTypes.AccountStorageConfigQueryVariables) {
  return { query: AccountStorageConfigDocument, variables: variables };
}
export const SpaceContentTemplatesOnSpaceDocument = gql`
  query SpaceContentTemplatesOnSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        templatesManager {
          id
          templatesSet {
            id
            spaceTemplates {
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
  }
`;

/**
 * __useSpaceContentTemplatesOnSpaceQuery__
 *
 * To run a query within a React component, call `useSpaceContentTemplatesOnSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceContentTemplatesOnSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceContentTemplatesOnSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceContentTemplatesOnSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
    SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
    SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
  >(SpaceContentTemplatesOnSpaceDocument, options);
}
export function useSpaceContentTemplatesOnSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
    SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
    SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
  >(SpaceContentTemplatesOnSpaceDocument, options);
}
export function useSpaceContentTemplatesOnSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
        SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
    SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
  >(SpaceContentTemplatesOnSpaceDocument, options);
}
export type SpaceContentTemplatesOnSpaceQueryHookResult = ReturnType<typeof useSpaceContentTemplatesOnSpaceQuery>;
export type SpaceContentTemplatesOnSpaceLazyQueryHookResult = ReturnType<
  typeof useSpaceContentTemplatesOnSpaceLazyQuery
>;
export type SpaceContentTemplatesOnSpaceSuspenseQueryHookResult = ReturnType<
  typeof useSpaceContentTemplatesOnSpaceSuspenseQuery
>;
export type SpaceContentTemplatesOnSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceContentTemplatesOnSpaceQuery,
  SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
>;
export function refetchSpaceContentTemplatesOnSpaceQuery(
  variables: SchemaTypes.SpaceContentTemplatesOnSpaceQueryVariables
) {
  return { query: SpaceContentTemplatesOnSpaceDocument, variables: variables };
}
export const SpaceDefaultTemplatesDocument = gql`
  query SpaceDefaultTemplates($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        templatesManager {
          id
          templateDefaults {
            id
            type
            template {
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
  }
`;

/**
 * __useSpaceDefaultTemplatesQuery__
 *
 * To run a query within a React component, call `useSpaceDefaultTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDefaultTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDefaultTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDefaultTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDefaultTemplatesQuery,
    SchemaTypes.SpaceDefaultTemplatesQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceDefaultTemplatesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceDefaultTemplatesQuery, SchemaTypes.SpaceDefaultTemplatesQueryVariables>(
    SpaceDefaultTemplatesDocument,
    options
  );
}
export function useSpaceDefaultTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDefaultTemplatesQuery,
    SchemaTypes.SpaceDefaultTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceDefaultTemplatesQuery, SchemaTypes.SpaceDefaultTemplatesQueryVariables>(
    SpaceDefaultTemplatesDocument,
    options
  );
}
export function useSpaceDefaultTemplatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceDefaultTemplatesQuery,
        SchemaTypes.SpaceDefaultTemplatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceDefaultTemplatesQuery,
    SchemaTypes.SpaceDefaultTemplatesQueryVariables
  >(SpaceDefaultTemplatesDocument, options);
}
export type SpaceDefaultTemplatesQueryHookResult = ReturnType<typeof useSpaceDefaultTemplatesQuery>;
export type SpaceDefaultTemplatesLazyQueryHookResult = ReturnType<typeof useSpaceDefaultTemplatesLazyQuery>;
export type SpaceDefaultTemplatesSuspenseQueryHookResult = ReturnType<typeof useSpaceDefaultTemplatesSuspenseQuery>;
export type SpaceDefaultTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDefaultTemplatesQuery,
  SchemaTypes.SpaceDefaultTemplatesQueryVariables
>;
export function refetchSpaceDefaultTemplatesQuery(variables: SchemaTypes.SpaceDefaultTemplatesQueryVariables) {
  return { query: SpaceDefaultTemplatesDocument, variables: variables };
}
export const ImportTemplateDialogDocument = gql`
  query ImportTemplateDialog($templatesSetId: UUID!, $includeSpace: Boolean = false, $includeCallout: Boolean = false) {
    lookup {
      templatesSet(ID: $templatesSetId) {
        templates {
          ...TemplateProfileInfo
          callout @include(if: $includeCallout) {
            id
          }
          contentSpace @include(if: $includeSpace) {
            id
            about {
              id
              profile {
                id
                visual(type: CARD) {
                  id
                  uri
                }
              }
            }
            collaboration {
              id
              innovationFlow {
                id
                states {
                  displayName
                }
              }
            }
          }
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
`;

/**
 * __useImportTemplateDialogQuery__
 *
 * To run a query within a React component, call `useImportTemplateDialogQuery` and pass it any options that fit your needs.
 * When your component renders, `useImportTemplateDialogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useImportTemplateDialogQuery({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      includeSpace: // value for 'includeSpace'
 *      includeCallout: // value for 'includeCallout'
 *   },
 * });
 */
export function useImportTemplateDialogQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ImportTemplateDialogQuery,
    SchemaTypes.ImportTemplateDialogQueryVariables
  > &
    ({ variables: SchemaTypes.ImportTemplateDialogQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ImportTemplateDialogQuery, SchemaTypes.ImportTemplateDialogQueryVariables>(
    ImportTemplateDialogDocument,
    options
  );
}
export function useImportTemplateDialogLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ImportTemplateDialogQuery,
    SchemaTypes.ImportTemplateDialogQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ImportTemplateDialogQuery, SchemaTypes.ImportTemplateDialogQueryVariables>(
    ImportTemplateDialogDocument,
    options
  );
}
export function useImportTemplateDialogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ImportTemplateDialogQuery,
        SchemaTypes.ImportTemplateDialogQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ImportTemplateDialogQuery, SchemaTypes.ImportTemplateDialogQueryVariables>(
    ImportTemplateDialogDocument,
    options
  );
}
export type ImportTemplateDialogQueryHookResult = ReturnType<typeof useImportTemplateDialogQuery>;
export type ImportTemplateDialogLazyQueryHookResult = ReturnType<typeof useImportTemplateDialogLazyQuery>;
export type ImportTemplateDialogSuspenseQueryHookResult = ReturnType<typeof useImportTemplateDialogSuspenseQuery>;
export type ImportTemplateDialogQueryResult = Apollo.QueryResult<
  SchemaTypes.ImportTemplateDialogQuery,
  SchemaTypes.ImportTemplateDialogQueryVariables
>;
export function refetchImportTemplateDialogQuery(variables: SchemaTypes.ImportTemplateDialogQueryVariables) {
  return { query: ImportTemplateDialogDocument, variables: variables };
}
export const ImportTemplateDialogPlatformTemplatesDocument = gql`
  query ImportTemplateDialogPlatformTemplates(
    $templateTypes: [TemplateType!]
    $includeSpace: Boolean = false
    $includeCallout: Boolean = false
  ) {
    platform {
      library {
        templates(filter: { types: $templateTypes }) {
          template {
            ...TemplateProfileInfo
            callout @include(if: $includeCallout) {
              id
            }
            contentSpace @include(if: $includeSpace) {
              id
              about {
                id
                profile {
                  id
                  visual(type: CARD) {
                    id
                    uri
                  }
                }
              }
              collaboration {
                id
                innovationFlow {
                  id
                  states {
                    displayName
                  }
                }
              }
            }
          }
          innovationPack {
            id
            profile {
              id
              displayName
              url
            }
            provider {
              id
              profile {
                id
                displayName
                avatar: visual(type: AVATAR) {
                  id
                  uri
                }
                url
              }
            }
          }
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
`;

/**
 * __useImportTemplateDialogPlatformTemplatesQuery__
 *
 * To run a query within a React component, call `useImportTemplateDialogPlatformTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useImportTemplateDialogPlatformTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useImportTemplateDialogPlatformTemplatesQuery({
 *   variables: {
 *      templateTypes: // value for 'templateTypes'
 *      includeSpace: // value for 'includeSpace'
 *      includeCallout: // value for 'includeCallout'
 *   },
 * });
 */
export function useImportTemplateDialogPlatformTemplatesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
  >(ImportTemplateDialogPlatformTemplatesDocument, options);
}
export function useImportTemplateDialogPlatformTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
  >(ImportTemplateDialogPlatformTemplatesDocument, options);
}
export function useImportTemplateDialogPlatformTemplatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
        SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
    SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
  >(ImportTemplateDialogPlatformTemplatesDocument, options);
}
export type ImportTemplateDialogPlatformTemplatesQueryHookResult = ReturnType<
  typeof useImportTemplateDialogPlatformTemplatesQuery
>;
export type ImportTemplateDialogPlatformTemplatesLazyQueryHookResult = ReturnType<
  typeof useImportTemplateDialogPlatformTemplatesLazyQuery
>;
export type ImportTemplateDialogPlatformTemplatesSuspenseQueryHookResult = ReturnType<
  typeof useImportTemplateDialogPlatformTemplatesSuspenseQuery
>;
export type ImportTemplateDialogPlatformTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.ImportTemplateDialogPlatformTemplatesQuery,
  SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
>;
export function refetchImportTemplateDialogPlatformTemplatesQuery(
  variables?: SchemaTypes.ImportTemplateDialogPlatformTemplatesQueryVariables
) {
  return { query: ImportTemplateDialogPlatformTemplatesDocument, variables: variables };
}
export const AllTemplatesInTemplatesSetDocument = gql`
  query AllTemplatesInTemplatesSet($templatesSetId: UUID!) {
    lookup {
      templatesSet(ID: $templatesSetId) {
        id
        authorization {
          id
          myPrivileges
        }
        ...TemplatesSetTemplates
      }
    }
  }
  ${TemplatesSetTemplatesFragmentDoc}
`;

/**
 * __useAllTemplatesInTemplatesSetQuery__
 *
 * To run a query within a React component, call `useAllTemplatesInTemplatesSetQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllTemplatesInTemplatesSetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllTemplatesInTemplatesSetQuery({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *   },
 * });
 */
export function useAllTemplatesInTemplatesSetQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AllTemplatesInTemplatesSetQuery,
    SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
  > &
    ({ variables: SchemaTypes.AllTemplatesInTemplatesSetQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AllTemplatesInTemplatesSetQuery,
    SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
  >(AllTemplatesInTemplatesSetDocument, options);
}
export function useAllTemplatesInTemplatesSetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AllTemplatesInTemplatesSetQuery,
    SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AllTemplatesInTemplatesSetQuery,
    SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
  >(AllTemplatesInTemplatesSetDocument, options);
}
export function useAllTemplatesInTemplatesSetSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AllTemplatesInTemplatesSetQuery,
        SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AllTemplatesInTemplatesSetQuery,
    SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
  >(AllTemplatesInTemplatesSetDocument, options);
}
export type AllTemplatesInTemplatesSetQueryHookResult = ReturnType<typeof useAllTemplatesInTemplatesSetQuery>;
export type AllTemplatesInTemplatesSetLazyQueryHookResult = ReturnType<typeof useAllTemplatesInTemplatesSetLazyQuery>;
export type AllTemplatesInTemplatesSetSuspenseQueryHookResult = ReturnType<
  typeof useAllTemplatesInTemplatesSetSuspenseQuery
>;
export type AllTemplatesInTemplatesSetQueryResult = Apollo.QueryResult<
  SchemaTypes.AllTemplatesInTemplatesSetQuery,
  SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
>;
export function refetchAllTemplatesInTemplatesSetQuery(
  variables: SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
) {
  return { query: AllTemplatesInTemplatesSetDocument, variables: variables };
}
export const TemplateContentDocument = gql`
  query TemplateContent(
    $templateId: UUID!
    $includeCallout: Boolean = false
    $includeCommunityGuidelines: Boolean = false
    $includeSpace: Boolean = false
    $includePost: Boolean = false
    $includeWhiteboard: Boolean = false
  ) {
    lookup {
      template(ID: $templateId) {
        id
        type
        profile {
          id
          displayName
          description
          defaultTagset: tagset {
            ...TagsetDetails
          }
        }
        callout @include(if: $includeCallout) {
          ...CalloutTemplateContent
        }
        communityGuidelines @include(if: $includeCommunityGuidelines) {
          ...CommunityGuidelinesTemplateContent
        }
        postDefaultDescription @include(if: $includePost)
        whiteboard @include(if: $includeWhiteboard) {
          ...WhiteboardTemplateContent
        }
        contentSpace @include(if: $includeSpace) {
          ...SpaceTemplateContent
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${CalloutTemplateContentFragmentDoc}
  ${CommunityGuidelinesTemplateContentFragmentDoc}
  ${WhiteboardTemplateContentFragmentDoc}
  ${SpaceTemplateContentFragmentDoc}
`;

/**
 * __useTemplateContentQuery__
 *
 * To run a query within a React component, call `useTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateContentQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      includeCallout: // value for 'includeCallout'
 *      includeCommunityGuidelines: // value for 'includeCommunityGuidelines'
 *      includeSpace: // value for 'includeSpace'
 *      includePost: // value for 'includePost'
 *      includeWhiteboard: // value for 'includeWhiteboard'
 *   },
 * });
 */
export function useTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables> &
    ({ variables: SchemaTypes.TemplateContentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>(
    TemplateContentDocument,
    options
  );
}
export function useTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>(
    TemplateContentDocument,
    options
  );
}
export function useTemplateContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>(
    TemplateContentDocument,
    options
  );
}
export type TemplateContentQueryHookResult = ReturnType<typeof useTemplateContentQuery>;
export type TemplateContentLazyQueryHookResult = ReturnType<typeof useTemplateContentLazyQuery>;
export type TemplateContentSuspenseQueryHookResult = ReturnType<typeof useTemplateContentSuspenseQuery>;
export type TemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.TemplateContentQuery,
  SchemaTypes.TemplateContentQueryVariables
>;
export function refetchTemplateContentQuery(variables: SchemaTypes.TemplateContentQueryVariables) {
  return { query: TemplateContentDocument, variables: variables };
}
export const SpaceTemplateContentDocument = gql`
  query SpaceTemplateContent($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        authorization {
          id
          myPrivileges
        }
        collaboration {
          ...SpaceTemplateContent_Collaboration
        }
        about {
          ...SpaceTemplateContent_About
        }
        settings {
          ...SpaceTemplateContent_Settings
        }
        subspaces {
          id
          about {
            ...SpaceTemplateContent_Subspaces
          }
        }
      }
    }
  }
  ${SpaceTemplateContent_CollaborationFragmentDoc}
  ${SpaceTemplateContent_AboutFragmentDoc}
  ${SpaceTemplateContent_SettingsFragmentDoc}
  ${SpaceTemplateContent_SubspacesFragmentDoc}
`;

/**
 * __useSpaceTemplateContentQuery__
 *
 * To run a query within a React component, call `useSpaceTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplateContentQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplateContentQuery,
    SchemaTypes.SpaceTemplateContentQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceTemplateContentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTemplateContentQuery, SchemaTypes.SpaceTemplateContentQueryVariables>(
    SpaceTemplateContentDocument,
    options
  );
}
export function useSpaceTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplateContentQuery,
    SchemaTypes.SpaceTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTemplateContentQuery, SchemaTypes.SpaceTemplateContentQueryVariables>(
    SpaceTemplateContentDocument,
    options
  );
}
export function useSpaceTemplateContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceTemplateContentQuery,
        SchemaTypes.SpaceTemplateContentQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceTemplateContentQuery, SchemaTypes.SpaceTemplateContentQueryVariables>(
    SpaceTemplateContentDocument,
    options
  );
}
export type SpaceTemplateContentQueryHookResult = ReturnType<typeof useSpaceTemplateContentQuery>;
export type SpaceTemplateContentLazyQueryHookResult = ReturnType<typeof useSpaceTemplateContentLazyQuery>;
export type SpaceTemplateContentSuspenseQueryHookResult = ReturnType<typeof useSpaceTemplateContentSuspenseQuery>;
export type SpaceTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplateContentQuery,
  SchemaTypes.SpaceTemplateContentQueryVariables
>;
export function refetchSpaceTemplateContentQuery(variables: SchemaTypes.SpaceTemplateContentQueryVariables) {
  return { query: SpaceTemplateContentDocument, variables: variables };
}
export const CreateTemplateDocument = gql`
  mutation CreateTemplate(
    $templatesSetId: UUID!
    $profileData: CreateProfileInput!
    $type: TemplateType!
    $tags: [String!]
    $calloutData: CreateCalloutInput
    $communityGuidelinesData: CreateCommunityGuidelinesInput
    $contentSpaceData: CreateTemplateContentSpaceInput
    $postDefaultDescription: Markdown
    $whiteboard: CreateWhiteboardInput
    $includeProfileVisuals: Boolean = false
  ) {
    createTemplate(
      templateData: {
        templatesSetID: $templatesSetId
        profileData: $profileData
        tags: $tags
        type: $type
        calloutData: $calloutData
        communityGuidelinesData: $communityGuidelinesData
        postDefaultDescription: $postDefaultDescription
        contentSpaceData: $contentSpaceData
        whiteboard: $whiteboard
      }
    ) {
      id
      nameID
      profile @include(if: $includeProfileVisuals) {
        id
        cardVisual: visual(type: CARD) {
          id
        }
        previewVisual: visual(type: BANNER) {
          id
        }
      }
      callout {
        id
        framing {
          id
          whiteboard {
            id
            nameID
            profile {
              id
              previewVisual: visual(type: BANNER) {
                id
              }
            }
          }
        }
      }
    }
  }
`;
export type CreateTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateTemplateMutation,
  SchemaTypes.CreateTemplateMutationVariables
>;

/**
 * __useCreateTemplateMutation__
 *
 * To run a mutation, you first call `useCreateTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateMutation, { data, loading, error }] = useCreateTemplateMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      profileData: // value for 'profileData'
 *      type: // value for 'type'
 *      tags: // value for 'tags'
 *      calloutData: // value for 'calloutData'
 *      communityGuidelinesData: // value for 'communityGuidelinesData'
 *      contentSpaceData: // value for 'contentSpaceData'
 *      postDefaultDescription: // value for 'postDefaultDescription'
 *      whiteboard: // value for 'whiteboard'
 *      includeProfileVisuals: // value for 'includeProfileVisuals'
 *   },
 * });
 */
export function useCreateTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateTemplateMutation,
    SchemaTypes.CreateTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateTemplateMutation, SchemaTypes.CreateTemplateMutationVariables>(
    CreateTemplateDocument,
    options
  );
}
export type CreateTemplateMutationHookResult = ReturnType<typeof useCreateTemplateMutation>;
export type CreateTemplateMutationResult = Apollo.MutationResult<SchemaTypes.CreateTemplateMutation>;
export type CreateTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateTemplateMutation,
  SchemaTypes.CreateTemplateMutationVariables
>;
export const CreateTemplateFromContentSpaceDocument = gql`
  mutation CreateTemplateFromContentSpace(
    $templatesSetId: UUID!
    $profileData: CreateProfileInput!
    $tags: [String!]
    $contentSpaceId: UUID!
  ) {
    createTemplateFromContentSpace(
      templateData: {
        templatesSetID: $templatesSetId
        profileData: $profileData
        tags: $tags
        contentSpaceID: $contentSpaceId
      }
    ) {
      id
    }
  }
`;
export type CreateTemplateFromContentSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateTemplateFromContentSpaceMutation,
  SchemaTypes.CreateTemplateFromContentSpaceMutationVariables
>;

/**
 * __useCreateTemplateFromContentSpaceMutation__
 *
 * To run a mutation, you first call `useCreateTemplateFromContentSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateFromContentSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateFromContentSpaceMutation, { data, loading, error }] = useCreateTemplateFromContentSpaceMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      profileData: // value for 'profileData'
 *      tags: // value for 'tags'
 *      contentSpaceId: // value for 'contentSpaceId'
 *   },
 * });
 */
export function useCreateTemplateFromContentSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateTemplateFromContentSpaceMutation,
    SchemaTypes.CreateTemplateFromContentSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateTemplateFromContentSpaceMutation,
    SchemaTypes.CreateTemplateFromContentSpaceMutationVariables
  >(CreateTemplateFromContentSpaceDocument, options);
}
export type CreateTemplateFromContentSpaceMutationHookResult = ReturnType<
  typeof useCreateTemplateFromContentSpaceMutation
>;
export type CreateTemplateFromContentSpaceMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateTemplateFromContentSpaceMutation>;
export type CreateTemplateFromContentSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateTemplateFromContentSpaceMutation,
  SchemaTypes.CreateTemplateFromContentSpaceMutationVariables
>;
export const CreateTemplateFromSpaceDocument = gql`
  mutation CreateTemplateFromSpace(
    $templatesSetId: UUID!
    $profileData: CreateProfileInput!
    $tags: [String!]
    $spaceId: UUID!
    $recursive: Boolean
  ) {
    createTemplateFromSpace(
      templateData: {
        templatesSetID: $templatesSetId
        profileData: $profileData
        recursive: $recursive
        tags: $tags
        spaceID: $spaceId
      }
    ) {
      id
    }
  }
`;
export type CreateTemplateFromSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateTemplateFromSpaceMutation,
  SchemaTypes.CreateTemplateFromSpaceMutationVariables
>;

/**
 * __useCreateTemplateFromSpaceMutation__
 *
 * To run a mutation, you first call `useCreateTemplateFromSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateFromSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateFromSpaceMutation, { data, loading, error }] = useCreateTemplateFromSpaceMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      profileData: // value for 'profileData'
 *      tags: // value for 'tags'
 *      spaceId: // value for 'spaceId'
 *      recursive: // value for 'recursive'
 *   },
 * });
 */
export function useCreateTemplateFromSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateTemplateFromSpaceMutation,
    SchemaTypes.CreateTemplateFromSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateTemplateFromSpaceMutation,
    SchemaTypes.CreateTemplateFromSpaceMutationVariables
  >(CreateTemplateFromSpaceDocument, options);
}
export type CreateTemplateFromSpaceMutationHookResult = ReturnType<typeof useCreateTemplateFromSpaceMutation>;
export type CreateTemplateFromSpaceMutationResult = Apollo.MutationResult<SchemaTypes.CreateTemplateFromSpaceMutation>;
export type CreateTemplateFromSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateTemplateFromSpaceMutation,
  SchemaTypes.CreateTemplateFromSpaceMutationVariables
>;
export const UpdateTemplateDocument = gql`
  mutation UpdateTemplate(
    $templateId: UUID!
    $profile: UpdateProfileInput!
    $postDefaultDescription: Markdown
    $whiteboardContent: WhiteboardContent
    $includeProfileVisuals: Boolean = false
  ) {
    updateTemplate(
      updateData: {
        ID: $templateId
        profile: $profile
        postDefaultDescription: $postDefaultDescription
        whiteboardContent: $whiteboardContent
      }
    ) {
      id
      nameID
      profile @include(if: $includeProfileVisuals) {
        id
        cardVisual: visual(type: CARD) {
          id
        }
        previewVisual: visual(type: BANNER) {
          id
        }
      }
      whiteboard {
        id
        content
      }
    }
  }
`;
export type UpdateTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateTemplateMutation,
  SchemaTypes.UpdateTemplateMutationVariables
>;

/**
 * __useUpdateTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateMutation, { data, loading, error }] = useUpdateTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      profile: // value for 'profile'
 *      postDefaultDescription: // value for 'postDefaultDescription'
 *      whiteboardContent: // value for 'whiteboardContent'
 *      includeProfileVisuals: // value for 'includeProfileVisuals'
 *   },
 * });
 */
export function useUpdateTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateTemplateMutation,
    SchemaTypes.UpdateTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateTemplateMutation, SchemaTypes.UpdateTemplateMutationVariables>(
    UpdateTemplateDocument,
    options
  );
}
export type UpdateTemplateMutationHookResult = ReturnType<typeof useUpdateTemplateMutation>;
export type UpdateTemplateMutationResult = Apollo.MutationResult<SchemaTypes.UpdateTemplateMutation>;
export type UpdateTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateTemplateMutation,
  SchemaTypes.UpdateTemplateMutationVariables
>;
export const UpdateCalloutTemplateDocument = gql`
  mutation UpdateCalloutTemplate($calloutData: UpdateCalloutEntityInput!) {
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
          references {
            id
            name
            uri
          }
        }
        type
        whiteboard {
          id
          content
          nameID
          profile {
            id
            previewVisual: visual(type: BANNER) {
              id
            }
          }
        }
        memo {
          id
          markdown
        }
      }
      contributionDefaults {
        id
        postDescription
        whiteboardContent
      }
      settings {
        contribution {
          enabled
          allowedTypes
        }
        visibility
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export type UpdateCalloutTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCalloutTemplateMutation,
  SchemaTypes.UpdateCalloutTemplateMutationVariables
>;

/**
 * __useUpdateCalloutTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateCalloutTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCalloutTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCalloutTemplateMutation, { data, loading, error }] = useUpdateCalloutTemplateMutation({
 *   variables: {
 *      calloutData: // value for 'calloutData'
 *   },
 * });
 */
export function useUpdateCalloutTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCalloutTemplateMutation,
    SchemaTypes.UpdateCalloutTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCalloutTemplateMutation,
    SchemaTypes.UpdateCalloutTemplateMutationVariables
  >(UpdateCalloutTemplateDocument, options);
}
export type UpdateCalloutTemplateMutationHookResult = ReturnType<typeof useUpdateCalloutTemplateMutation>;
export type UpdateCalloutTemplateMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCalloutTemplateMutation>;
export type UpdateCalloutTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCalloutTemplateMutation,
  SchemaTypes.UpdateCalloutTemplateMutationVariables
>;
export const UpdateTemplateFromSpaceDocument = gql`
  mutation UpdateTemplateFromSpace($templateId: UUID!, $spaceId: UUID!, $recursive: Boolean) {
    updateTemplateFromSpace(updateData: { templateID: $templateId, spaceID: $spaceId, recursive: $recursive }) {
      id
    }
  }
`;
export type UpdateTemplateFromSpaceMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateTemplateFromSpaceMutation,
  SchemaTypes.UpdateTemplateFromSpaceMutationVariables
>;

/**
 * __useUpdateTemplateFromSpaceMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateFromSpaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateFromSpaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateFromSpaceMutation, { data, loading, error }] = useUpdateTemplateFromSpaceMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      spaceId: // value for 'spaceId'
 *      recursive: // value for 'recursive'
 *   },
 * });
 */
export function useUpdateTemplateFromSpaceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateTemplateFromSpaceMutation,
    SchemaTypes.UpdateTemplateFromSpaceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateTemplateFromSpaceMutation,
    SchemaTypes.UpdateTemplateFromSpaceMutationVariables
  >(UpdateTemplateFromSpaceDocument, options);
}
export type UpdateTemplateFromSpaceMutationHookResult = ReturnType<typeof useUpdateTemplateFromSpaceMutation>;
export type UpdateTemplateFromSpaceMutationResult = Apollo.MutationResult<SchemaTypes.UpdateTemplateFromSpaceMutation>;
export type UpdateTemplateFromSpaceMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateTemplateFromSpaceMutation,
  SchemaTypes.UpdateTemplateFromSpaceMutationVariables
>;
export const DeleteTemplateDocument = gql`
  mutation DeleteTemplate($templateId: UUID!) {
    deleteTemplate(deleteData: { ID: $templateId }) {
      id
    }
  }
`;
export type DeleteTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteTemplateMutation,
  SchemaTypes.DeleteTemplateMutationVariables
>;

/**
 * __useDeleteTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTemplateMutation, { data, loading, error }] = useDeleteTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeleteTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteTemplateMutation,
    SchemaTypes.DeleteTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteTemplateMutation, SchemaTypes.DeleteTemplateMutationVariables>(
    DeleteTemplateDocument,
    options
  );
}
export type DeleteTemplateMutationHookResult = ReturnType<typeof useDeleteTemplateMutation>;
export type DeleteTemplateMutationResult = Apollo.MutationResult<SchemaTypes.DeleteTemplateMutation>;
export type DeleteTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteTemplateMutation,
  SchemaTypes.DeleteTemplateMutationVariables
>;
export const TemplateNameDocument = gql`
  query TemplateName($templateId: UUID!) {
    lookup {
      template(ID: $templateId) {
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
 * __useTemplateNameQuery__
 *
 * To run a query within a React component, call `useTemplateNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateNameQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useTemplateNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables> &
    ({ variables: SchemaTypes.TemplateNameQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>(
    TemplateNameDocument,
    options
  );
}
export function useTemplateNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>(
    TemplateNameDocument,
    options
  );
}
export function useTemplateNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>(
    TemplateNameDocument,
    options
  );
}
export type TemplateNameQueryHookResult = ReturnType<typeof useTemplateNameQuery>;
export type TemplateNameLazyQueryHookResult = ReturnType<typeof useTemplateNameLazyQuery>;
export type TemplateNameSuspenseQueryHookResult = ReturnType<typeof useTemplateNameSuspenseQuery>;
export type TemplateNameQueryResult = Apollo.QueryResult<
  SchemaTypes.TemplateNameQuery,
  SchemaTypes.TemplateNameQueryVariables
>;
export function refetchTemplateNameQuery(variables: SchemaTypes.TemplateNameQueryVariables) {
  return { query: TemplateNameDocument, variables: variables };
}
export const UpdateTemplateDefaultDocument = gql`
  mutation updateTemplateDefault($templateDefaultID: UUID!, $templateID: UUID!) {
    updateTemplateDefault(templateDefaultData: { templateDefaultID: $templateDefaultID, templateID: $templateID }) {
      id
    }
  }
`;
export type UpdateTemplateDefaultMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateTemplateDefaultMutation,
  SchemaTypes.UpdateTemplateDefaultMutationVariables
>;

/**
 * __useUpdateTemplateDefaultMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateDefaultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateDefaultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateDefaultMutation, { data, loading, error }] = useUpdateTemplateDefaultMutation({
 *   variables: {
 *      templateDefaultID: // value for 'templateDefaultID'
 *      templateID: // value for 'templateID'
 *   },
 * });
 */
export function useUpdateTemplateDefaultMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateTemplateDefaultMutation,
    SchemaTypes.UpdateTemplateDefaultMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateTemplateDefaultMutation,
    SchemaTypes.UpdateTemplateDefaultMutationVariables
  >(UpdateTemplateDefaultDocument, options);
}
export type UpdateTemplateDefaultMutationHookResult = ReturnType<typeof useUpdateTemplateDefaultMutation>;
export type UpdateTemplateDefaultMutationResult = Apollo.MutationResult<SchemaTypes.UpdateTemplateDefaultMutation>;
export type UpdateTemplateDefaultMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateTemplateDefaultMutation,
  SchemaTypes.UpdateTemplateDefaultMutationVariables
>;
export const SpaceCalendarEventsDocument = gql`
  query SpaceCalendarEvents($spaceId: UUID!, $includeSubspace: Boolean = false) {
    lookup {
      space(ID: $spaceId) {
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
 *      includeSubspace: // value for 'includeSubspace'
 *   },
 * });
 */
export function useSpaceCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCalendarEventsQuery,
    SchemaTypes.SpaceCalendarEventsQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceCalendarEventsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSpaceCalendarEventsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceCalendarEventsQuery,
        SchemaTypes.SpaceCalendarEventsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceCalendarEventsQuery, SchemaTypes.SpaceCalendarEventsQueryVariables>(
    SpaceCalendarEventsDocument,
    options
  );
}
export type SpaceCalendarEventsQueryHookResult = ReturnType<typeof useSpaceCalendarEventsQuery>;
export type SpaceCalendarEventsLazyQueryHookResult = ReturnType<typeof useSpaceCalendarEventsLazyQuery>;
export type SpaceCalendarEventsSuspenseQueryHookResult = ReturnType<typeof useSpaceCalendarEventsSuspenseQuery>;
export type SpaceCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCalendarEventsQuery,
  SchemaTypes.SpaceCalendarEventsQueryVariables
>;
export function refetchSpaceCalendarEventsQuery(variables: SchemaTypes.SpaceCalendarEventsQueryVariables) {
  return { query: SpaceCalendarEventsDocument, variables: variables };
}
export const CalendarEventDetailsDocument = gql`
  query calendarEventDetails($eventId: UUID!, $includeSubspace: Boolean = false) {
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
 *      includeSubspace: // value for 'includeSubspace'
 *   },
 * });
 */
export function useCalendarEventDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalendarEventDetailsQuery,
    SchemaTypes.CalendarEventDetailsQueryVariables
  > &
    ({ variables: SchemaTypes.CalendarEventDetailsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useCalendarEventDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CalendarEventDetailsQuery,
        SchemaTypes.CalendarEventDetailsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.CalendarEventDetailsQuery, SchemaTypes.CalendarEventDetailsQueryVariables>(
    CalendarEventDetailsDocument,
    options
  );
}
export type CalendarEventDetailsQueryHookResult = ReturnType<typeof useCalendarEventDetailsQuery>;
export type CalendarEventDetailsLazyQueryHookResult = ReturnType<typeof useCalendarEventDetailsLazyQuery>;
export type CalendarEventDetailsSuspenseQueryHookResult = ReturnType<typeof useCalendarEventDetailsSuspenseQuery>;
export type CalendarEventDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CalendarEventDetailsQuery,
  SchemaTypes.CalendarEventDetailsQueryVariables
>;
export function refetchCalendarEventDetailsQuery(variables: SchemaTypes.CalendarEventDetailsQueryVariables) {
  return { query: CalendarEventDetailsDocument, variables: variables };
}
export const CreateCalendarEventDocument = gql`
  mutation createCalendarEvent($eventData: CreateCalendarEventOnCalendarInput!, $includeSubspace: Boolean = false) {
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
 *      includeSubspace: // value for 'includeSubspace'
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
  mutation updateCalendarEvent($eventData: UpdateCalendarEventInput!, $includeSubspace: Boolean = false) {
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
 *      includeSubspace: // value for 'includeSubspace'
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
export const AuthorizationPolicyDocument = gql`
  query AuthorizationPolicy($authorizationPolicyId: UUID!) {
    lookup {
      authorizationPolicy(ID: $authorizationPolicyId) {
        id
        type
        credentialRules {
          name
          cascade
          criterias {
            resourceID
            type
          }
          grantedPrivileges
        }
        privilegeRules {
          name
          sourcePrivilege
          grantedPrivileges
        }
      }
    }
  }
`;

/**
 * __useAuthorizationPolicyQuery__
 *
 * To run a query within a React component, call `useAuthorizationPolicyQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthorizationPolicyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthorizationPolicyQuery({
 *   variables: {
 *      authorizationPolicyId: // value for 'authorizationPolicyId'
 *   },
 * });
 */
export function useAuthorizationPolicyQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AuthorizationPolicyQuery,
    SchemaTypes.AuthorizationPolicyQueryVariables
  > &
    ({ variables: SchemaTypes.AuthorizationPolicyQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AuthorizationPolicyQuery, SchemaTypes.AuthorizationPolicyQueryVariables>(
    AuthorizationPolicyDocument,
    options
  );
}
export function useAuthorizationPolicyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AuthorizationPolicyQuery,
    SchemaTypes.AuthorizationPolicyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AuthorizationPolicyQuery, SchemaTypes.AuthorizationPolicyQueryVariables>(
    AuthorizationPolicyDocument,
    options
  );
}
export function useAuthorizationPolicySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AuthorizationPolicyQuery,
        SchemaTypes.AuthorizationPolicyQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AuthorizationPolicyQuery, SchemaTypes.AuthorizationPolicyQueryVariables>(
    AuthorizationPolicyDocument,
    options
  );
}
export type AuthorizationPolicyQueryHookResult = ReturnType<typeof useAuthorizationPolicyQuery>;
export type AuthorizationPolicyLazyQueryHookResult = ReturnType<typeof useAuthorizationPolicyLazyQuery>;
export type AuthorizationPolicySuspenseQueryHookResult = ReturnType<typeof useAuthorizationPolicySuspenseQuery>;
export type AuthorizationPolicyQueryResult = Apollo.QueryResult<
  SchemaTypes.AuthorizationPolicyQuery,
  SchemaTypes.AuthorizationPolicyQueryVariables
>;
export function refetchAuthorizationPolicyQuery(variables: SchemaTypes.AuthorizationPolicyQueryVariables) {
  return { query: AuthorizationPolicyDocument, variables: variables };
}
export const AuthorizationPrivilegesForUserDocument = gql`
  query AuthorizationPrivilegesForUser($userId: UUID!, $authorizationPolicyId: UUID!) {
    lookup {
      authorizationPrivilegesForUser(userID: $userId, authorizationPolicyID: $authorizationPolicyId)
    }
  }
`;

/**
 * __useAuthorizationPrivilegesForUserQuery__
 *
 * To run a query within a React component, call `useAuthorizationPrivilegesForUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthorizationPrivilegesForUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthorizationPrivilegesForUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      authorizationPolicyId: // value for 'authorizationPolicyId'
 *   },
 * });
 */
export function useAuthorizationPrivilegesForUserQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AuthorizationPrivilegesForUserQuery,
    SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
  > &
    ({ variables: SchemaTypes.AuthorizationPrivilegesForUserQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AuthorizationPrivilegesForUserQuery,
    SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
  >(AuthorizationPrivilegesForUserDocument, options);
}
export function useAuthorizationPrivilegesForUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AuthorizationPrivilegesForUserQuery,
    SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AuthorizationPrivilegesForUserQuery,
    SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
  >(AuthorizationPrivilegesForUserDocument, options);
}
export function useAuthorizationPrivilegesForUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.AuthorizationPrivilegesForUserQuery,
        SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.AuthorizationPrivilegesForUserQuery,
    SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
  >(AuthorizationPrivilegesForUserDocument, options);
}
export type AuthorizationPrivilegesForUserQueryHookResult = ReturnType<typeof useAuthorizationPrivilegesForUserQuery>;
export type AuthorizationPrivilegesForUserLazyQueryHookResult = ReturnType<
  typeof useAuthorizationPrivilegesForUserLazyQuery
>;
export type AuthorizationPrivilegesForUserSuspenseQueryHookResult = ReturnType<
  typeof useAuthorizationPrivilegesForUserSuspenseQuery
>;
export type AuthorizationPrivilegesForUserQueryResult = Apollo.QueryResult<
  SchemaTypes.AuthorizationPrivilegesForUserQuery,
  SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
>;
export function refetchAuthorizationPrivilegesForUserQuery(
  variables: SchemaTypes.AuthorizationPrivilegesForUserQueryVariables
) {
  return { query: AuthorizationPrivilegesForUserDocument, variables: variables };
}
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
export const CreateGuidanceRoomDocument = gql`
  mutation createGuidanceRoom {
    createChatGuidanceRoom {
      id
    }
  }
`;
export type CreateGuidanceRoomMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateGuidanceRoomMutation,
  SchemaTypes.CreateGuidanceRoomMutationVariables
>;

/**
 * __useCreateGuidanceRoomMutation__
 *
 * To run a mutation, you first call `useCreateGuidanceRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGuidanceRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGuidanceRoomMutation, { data, loading, error }] = useCreateGuidanceRoomMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateGuidanceRoomMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateGuidanceRoomMutation,
    SchemaTypes.CreateGuidanceRoomMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreateGuidanceRoomMutation, SchemaTypes.CreateGuidanceRoomMutationVariables>(
    CreateGuidanceRoomDocument,
    options
  );
}
export type CreateGuidanceRoomMutationHookResult = ReturnType<typeof useCreateGuidanceRoomMutation>;
export type CreateGuidanceRoomMutationResult = Apollo.MutationResult<SchemaTypes.CreateGuidanceRoomMutation>;
export type CreateGuidanceRoomMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateGuidanceRoomMutation,
  SchemaTypes.CreateGuidanceRoomMutationVariables
>;
export const AskChatGuidanceQuestionDocument = gql`
  mutation askChatGuidanceQuestion($chatData: ChatGuidanceInput!) {
    askChatGuidanceQuestion(chatData: $chatData) {
      id
      success
    }
  }
`;
export type AskChatGuidanceQuestionMutationFn = Apollo.MutationFunction<
  SchemaTypes.AskChatGuidanceQuestionMutation,
  SchemaTypes.AskChatGuidanceQuestionMutationVariables
>;

/**
 * __useAskChatGuidanceQuestionMutation__
 *
 * To run a mutation, you first call `useAskChatGuidanceQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAskChatGuidanceQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [askChatGuidanceQuestionMutation, { data, loading, error }] = useAskChatGuidanceQuestionMutation({
 *   variables: {
 *      chatData: // value for 'chatData'
 *   },
 * });
 */
export function useAskChatGuidanceQuestionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AskChatGuidanceQuestionMutation,
    SchemaTypes.AskChatGuidanceQuestionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AskChatGuidanceQuestionMutation,
    SchemaTypes.AskChatGuidanceQuestionMutationVariables
  >(AskChatGuidanceQuestionDocument, options);
}
export type AskChatGuidanceQuestionMutationHookResult = ReturnType<typeof useAskChatGuidanceQuestionMutation>;
export type AskChatGuidanceQuestionMutationResult = Apollo.MutationResult<SchemaTypes.AskChatGuidanceQuestionMutation>;
export type AskChatGuidanceQuestionMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AskChatGuidanceQuestionMutation,
  SchemaTypes.AskChatGuidanceQuestionMutationVariables
>;
export const GuidanceRoomIdDocument = gql`
  query GuidanceRoomId {
    me {
      user {
        id
        guidanceRoom {
          id
        }
      }
    }
  }
`;

/**
 * __useGuidanceRoomIdQuery__
 *
 * To run a query within a React component, call `useGuidanceRoomIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuidanceRoomIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuidanceRoomIdQuery({
 *   variables: {
 *   },
 * });
 */
export function useGuidanceRoomIdQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>(
    GuidanceRoomIdDocument,
    options
  );
}
export function useGuidanceRoomIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>(
    GuidanceRoomIdDocument,
    options
  );
}
export function useGuidanceRoomIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.GuidanceRoomIdQuery, SchemaTypes.GuidanceRoomIdQueryVariables>(
    GuidanceRoomIdDocument,
    options
  );
}
export type GuidanceRoomIdQueryHookResult = ReturnType<typeof useGuidanceRoomIdQuery>;
export type GuidanceRoomIdLazyQueryHookResult = ReturnType<typeof useGuidanceRoomIdLazyQuery>;
export type GuidanceRoomIdSuspenseQueryHookResult = ReturnType<typeof useGuidanceRoomIdSuspenseQuery>;
export type GuidanceRoomIdQueryResult = Apollo.QueryResult<
  SchemaTypes.GuidanceRoomIdQuery,
  SchemaTypes.GuidanceRoomIdQueryVariables
>;
export function refetchGuidanceRoomIdQuery(variables?: SchemaTypes.GuidanceRoomIdQueryVariables) {
  return { query: GuidanceRoomIdDocument, variables: variables };
}
export const GuidanceRoomMessagesDocument = gql`
  query GuidanceRoomMessages($roomId: UUID!) {
    lookup {
      room(ID: $roomId) {
        ...CommentsWithMessages
      }
    }
  }
  ${CommentsWithMessagesFragmentDoc}
`;

/**
 * __useGuidanceRoomMessagesQuery__
 *
 * To run a query within a React component, call `useGuidanceRoomMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGuidanceRoomMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGuidanceRoomMessagesQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGuidanceRoomMessagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.GuidanceRoomMessagesQuery,
    SchemaTypes.GuidanceRoomMessagesQueryVariables
  > &
    ({ variables: SchemaTypes.GuidanceRoomMessagesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.GuidanceRoomMessagesQuery, SchemaTypes.GuidanceRoomMessagesQueryVariables>(
    GuidanceRoomMessagesDocument,
    options
  );
}
export function useGuidanceRoomMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.GuidanceRoomMessagesQuery,
    SchemaTypes.GuidanceRoomMessagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.GuidanceRoomMessagesQuery, SchemaTypes.GuidanceRoomMessagesQueryVariables>(
    GuidanceRoomMessagesDocument,
    options
  );
}
export function useGuidanceRoomMessagesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.GuidanceRoomMessagesQuery,
        SchemaTypes.GuidanceRoomMessagesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.GuidanceRoomMessagesQuery, SchemaTypes.GuidanceRoomMessagesQueryVariables>(
    GuidanceRoomMessagesDocument,
    options
  );
}
export type GuidanceRoomMessagesQueryHookResult = ReturnType<typeof useGuidanceRoomMessagesQuery>;
export type GuidanceRoomMessagesLazyQueryHookResult = ReturnType<typeof useGuidanceRoomMessagesLazyQuery>;
export type GuidanceRoomMessagesSuspenseQueryHookResult = ReturnType<typeof useGuidanceRoomMessagesSuspenseQuery>;
export type GuidanceRoomMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.GuidanceRoomMessagesQuery,
  SchemaTypes.GuidanceRoomMessagesQueryVariables
>;
export function refetchGuidanceRoomMessagesQuery(variables: SchemaTypes.GuidanceRoomMessagesQueryVariables) {
  return { query: GuidanceRoomMessagesDocument, variables: variables };
}
export const NotificationsUnreadCountDocument = gql`
  subscription NotificationsUnreadCount {
    notificationsUnreadCount
  }
`;

/**
 * __useNotificationsUnreadCountSubscription__
 *
 * To run a query within a React component, call `useNotificationsUnreadCountSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsUnreadCountSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsUnreadCountSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNotificationsUnreadCountSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.NotificationsUnreadCountSubscription,
    SchemaTypes.NotificationsUnreadCountSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.NotificationsUnreadCountSubscription,
    SchemaTypes.NotificationsUnreadCountSubscriptionVariables
  >(NotificationsUnreadCountDocument, options);
}
export type NotificationsUnreadCountSubscriptionHookResult = ReturnType<typeof useNotificationsUnreadCountSubscription>;
export type NotificationsUnreadCountSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.NotificationsUnreadCountSubscription>;
export const InAppNotificationReceivedDocument = gql`
  subscription InAppNotificationReceived {
    inAppNotificationReceived {
      ... on InAppNotification {
        ...InAppNotificationAllTypes
      }
    }
  }
  ${InAppNotificationAllTypesFragmentDoc}
`;

/**
 * __useInAppNotificationReceivedSubscription__
 *
 * To run a query within a React component, call `useInAppNotificationReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useInAppNotificationReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInAppNotificationReceivedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useInAppNotificationReceivedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    SchemaTypes.InAppNotificationReceivedSubscription,
    SchemaTypes.InAppNotificationReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.InAppNotificationReceivedSubscription,
    SchemaTypes.InAppNotificationReceivedSubscriptionVariables
  >(InAppNotificationReceivedDocument, options);
}
export type InAppNotificationReceivedSubscriptionHookResult = ReturnType<
  typeof useInAppNotificationReceivedSubscription
>;
export type InAppNotificationReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.InAppNotificationReceivedSubscription>;
export const InAppNotificationsDocument = gql`
  query InAppNotifications($types: [NotificationEvent!], $first: Int, $after: UUID) {
    me {
      notifications(filter: { types: $types }, first: $first, after: $after) {
        inAppNotifications {
          ...InAppNotificationAllTypes
        }
        pageInfo {
          endCursor
          hasNextPage
        }
        total
      }
    }
  }
  ${InAppNotificationAllTypesFragmentDoc}
`;

/**
 * __useInAppNotificationsQuery__
 *
 * To run a query within a React component, call `useInAppNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInAppNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInAppNotificationsQuery({
 *   variables: {
 *      types: // value for 'types'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useInAppNotificationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.InAppNotificationsQuery,
    SchemaTypes.InAppNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.InAppNotificationsQuery, SchemaTypes.InAppNotificationsQueryVariables>(
    InAppNotificationsDocument,
    options
  );
}
export function useInAppNotificationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InAppNotificationsQuery,
    SchemaTypes.InAppNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.InAppNotificationsQuery, SchemaTypes.InAppNotificationsQueryVariables>(
    InAppNotificationsDocument,
    options
  );
}
export function useInAppNotificationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.InAppNotificationsQuery, SchemaTypes.InAppNotificationsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.InAppNotificationsQuery, SchemaTypes.InAppNotificationsQueryVariables>(
    InAppNotificationsDocument,
    options
  );
}
export type InAppNotificationsQueryHookResult = ReturnType<typeof useInAppNotificationsQuery>;
export type InAppNotificationsLazyQueryHookResult = ReturnType<typeof useInAppNotificationsLazyQuery>;
export type InAppNotificationsSuspenseQueryHookResult = ReturnType<typeof useInAppNotificationsSuspenseQuery>;
export type InAppNotificationsQueryResult = Apollo.QueryResult<
  SchemaTypes.InAppNotificationsQuery,
  SchemaTypes.InAppNotificationsQueryVariables
>;
export function refetchInAppNotificationsQuery(variables?: SchemaTypes.InAppNotificationsQueryVariables) {
  return { query: InAppNotificationsDocument, variables: variables };
}
export const UpdateNotificationStateDocument = gql`
  mutation UpdateNotificationState($ID: UUID!, $state: NotificationEventInAppState!) {
    updateNotificationState(notificationData: { ID: $ID, state: $state })
  }
`;
export type UpdateNotificationStateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateNotificationStateMutation,
  SchemaTypes.UpdateNotificationStateMutationVariables
>;

/**
 * __useUpdateNotificationStateMutation__
 *
 * To run a mutation, you first call `useUpdateNotificationStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNotificationStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNotificationStateMutation, { data, loading, error }] = useUpdateNotificationStateMutation({
 *   variables: {
 *      ID: // value for 'ID'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useUpdateNotificationStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateNotificationStateMutation,
    SchemaTypes.UpdateNotificationStateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateNotificationStateMutation,
    SchemaTypes.UpdateNotificationStateMutationVariables
  >(UpdateNotificationStateDocument, options);
}
export type UpdateNotificationStateMutationHookResult = ReturnType<typeof useUpdateNotificationStateMutation>;
export type UpdateNotificationStateMutationResult = Apollo.MutationResult<SchemaTypes.UpdateNotificationStateMutation>;
export type UpdateNotificationStateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateNotificationStateMutation,
  SchemaTypes.UpdateNotificationStateMutationVariables
>;
export const MarkNotificationsAsReadDocument = gql`
  mutation MarkNotificationsAsRead($notificationIds: [String!]!) {
    markNotificationsAsRead(notificationIds: $notificationIds)
  }
`;
export type MarkNotificationsAsReadMutationFn = Apollo.MutationFunction<
  SchemaTypes.MarkNotificationsAsReadMutation,
  SchemaTypes.MarkNotificationsAsReadMutationVariables
>;

/**
 * __useMarkNotificationsAsReadMutation__
 *
 * To run a mutation, you first call `useMarkNotificationsAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkNotificationsAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markNotificationsAsReadMutation, { data, loading, error }] = useMarkNotificationsAsReadMutation({
 *   variables: {
 *      notificationIds: // value for 'notificationIds'
 *   },
 * });
 */
export function useMarkNotificationsAsReadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.MarkNotificationsAsReadMutation,
    SchemaTypes.MarkNotificationsAsReadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.MarkNotificationsAsReadMutation,
    SchemaTypes.MarkNotificationsAsReadMutationVariables
  >(MarkNotificationsAsReadDocument, options);
}
export type MarkNotificationsAsReadMutationHookResult = ReturnType<typeof useMarkNotificationsAsReadMutation>;
export type MarkNotificationsAsReadMutationResult = Apollo.MutationResult<SchemaTypes.MarkNotificationsAsReadMutation>;
export type MarkNotificationsAsReadMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.MarkNotificationsAsReadMutation,
  SchemaTypes.MarkNotificationsAsReadMutationVariables
>;
export const InAppNotificationsUnreadCountDocument = gql`
  query InAppNotificationsUnreadCount($types: [NotificationEvent!]) {
    me {
      notificationsUnreadCount(filter: { types: $types })
    }
  }
`;

/**
 * __useInAppNotificationsUnreadCountQuery__
 *
 * To run a query within a React component, call `useInAppNotificationsUnreadCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useInAppNotificationsUnreadCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInAppNotificationsUnreadCountQuery({
 *   variables: {
 *      types: // value for 'types'
 *   },
 * });
 */
export function useInAppNotificationsUnreadCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.InAppNotificationsUnreadCountQuery,
    SchemaTypes.InAppNotificationsUnreadCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InAppNotificationsUnreadCountQuery,
    SchemaTypes.InAppNotificationsUnreadCountQueryVariables
  >(InAppNotificationsUnreadCountDocument, options);
}
export function useInAppNotificationsUnreadCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InAppNotificationsUnreadCountQuery,
    SchemaTypes.InAppNotificationsUnreadCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InAppNotificationsUnreadCountQuery,
    SchemaTypes.InAppNotificationsUnreadCountQueryVariables
  >(InAppNotificationsUnreadCountDocument, options);
}
export function useInAppNotificationsUnreadCountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.InAppNotificationsUnreadCountQuery,
        SchemaTypes.InAppNotificationsUnreadCountQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.InAppNotificationsUnreadCountQuery,
    SchemaTypes.InAppNotificationsUnreadCountQueryVariables
  >(InAppNotificationsUnreadCountDocument, options);
}
export type InAppNotificationsUnreadCountQueryHookResult = ReturnType<typeof useInAppNotificationsUnreadCountQuery>;
export type InAppNotificationsUnreadCountLazyQueryHookResult = ReturnType<
  typeof useInAppNotificationsUnreadCountLazyQuery
>;
export type InAppNotificationsUnreadCountSuspenseQueryHookResult = ReturnType<
  typeof useInAppNotificationsUnreadCountSuspenseQuery
>;
export type InAppNotificationsUnreadCountQueryResult = Apollo.QueryResult<
  SchemaTypes.InAppNotificationsUnreadCountQuery,
  SchemaTypes.InAppNotificationsUnreadCountQueryVariables
>;
export function refetchInAppNotificationsUnreadCountQuery(
  variables?: SchemaTypes.InAppNotificationsUnreadCountQueryVariables
) {
  return { query: InAppNotificationsUnreadCountDocument, variables: variables };
}
export const UrlResolverDocument = gql`
  query UrlResolver($url: String!) {
    urlResolver(url: $url) {
      type
      space {
        id
        level
        levelZeroSpaceID
        collaboration {
          id
          calloutsSet {
            id
            calloutId
            contributionId
            postId
            whiteboardId
          }
        }
        calendar {
          id
          calendarEventId
        }
        templatesSet {
          id
          templateId
        }
        parentSpaces
      }
      organizationId
      userId
      virtualContributor {
        id
        calloutsSet {
          id
          calloutId
          contributionId
          postId
        }
      }
      discussionId
      innovationPack {
        id
        templatesSet {
          id
          templateId
        }
      }
      innovationHubId
    }
  }
`;

/**
 * __useUrlResolverQuery__
 *
 * To run a query within a React component, call `useUrlResolverQuery` and pass it any options that fit your needs.
 * When your component renders, `useUrlResolverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUrlResolverQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useUrlResolverQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables> &
    ({ variables: SchemaTypes.UrlResolverQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>(
    UrlResolverDocument,
    options
  );
}
export function useUrlResolverLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>(
    UrlResolverDocument,
    options
  );
}
export function useUrlResolverSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>(
    UrlResolverDocument,
    options
  );
}
export type UrlResolverQueryHookResult = ReturnType<typeof useUrlResolverQuery>;
export type UrlResolverLazyQueryHookResult = ReturnType<typeof useUrlResolverLazyQuery>;
export type UrlResolverSuspenseQueryHookResult = ReturnType<typeof useUrlResolverSuspenseQuery>;
export type UrlResolverQueryResult = Apollo.QueryResult<
  SchemaTypes.UrlResolverQuery,
  SchemaTypes.UrlResolverQueryVariables
>;
export function refetchUrlResolverQuery(variables: SchemaTypes.UrlResolverQueryVariables) {
  return { query: UrlResolverDocument, variables: variables };
}
export const SpaceUrlResolverDocument = gql`
  query SpaceUrlResolver(
    $spaceNameId: NameID!
    $subspaceL1NameId: NameID = "nameid"
    $subspaceL2NameId: NameID = "nameid"
    $includeSubspaceL1: Boolean = false
    $includeSubspaceL2: Boolean = false
  ) {
    lookupByName {
      space(NAMEID: $spaceNameId) {
        id
        subspaceByNameID(NAMEID: $subspaceL1NameId) @include(if: $includeSubspaceL1) {
          id
          subspaceByNameID(NAMEID: $subspaceL2NameId) @include(if: $includeSubspaceL2) {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceUrlResolverQuery__
 *
 * To run a query within a React component, call `useSpaceUrlResolverQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceUrlResolverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceUrlResolverQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      subspaceL1NameId: // value for 'subspaceL1NameId'
 *      subspaceL2NameId: // value for 'subspaceL2NameId'
 *      includeSubspaceL1: // value for 'includeSubspaceL1'
 *      includeSubspaceL2: // value for 'includeSubspaceL2'
 *   },
 * });
 */
export function useSpaceUrlResolverQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables> &
    ({ variables: SchemaTypes.SpaceUrlResolverQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables>(
    SpaceUrlResolverDocument,
    options
  );
}
export function useSpaceUrlResolverLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceUrlResolverQuery,
    SchemaTypes.SpaceUrlResolverQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables>(
    SpaceUrlResolverDocument,
    options
  );
}
export function useSpaceUrlResolverSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables>(
    SpaceUrlResolverDocument,
    options
  );
}
export type SpaceUrlResolverQueryHookResult = ReturnType<typeof useSpaceUrlResolverQuery>;
export type SpaceUrlResolverLazyQueryHookResult = ReturnType<typeof useSpaceUrlResolverLazyQuery>;
export type SpaceUrlResolverSuspenseQueryHookResult = ReturnType<typeof useSpaceUrlResolverSuspenseQuery>;
export type SpaceUrlResolverQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceUrlResolverQuery,
  SchemaTypes.SpaceUrlResolverQueryVariables
>;
export function refetchSpaceUrlResolverQuery(variables: SchemaTypes.SpaceUrlResolverQueryVariables) {
  return { query: SpaceUrlResolverDocument, variables: variables };
}
export const SearchDocument = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      spaceResults {
        cursor
        results {
          id
          type
          score
          terms
          ...SearchResultSpace
        }
        total
      }
      calloutResults {
        cursor
        results {
          id
          type
          score
          terms
          ...SearchResultCallout
        }
        total
      }
      contributionResults {
        cursor
        results {
          id
          type
          score
          terms
          ...SearchResultPost
          ...SearchResultCallout
        }
        total
      }
      contributorResults {
        cursor
        results {
          id
          type
          score
          terms
          ...SearchResultUser
          ...SearchResultOrganization
        }
        total
      }
    }
  }
  ${SearchResultSpaceFragmentDoc}
  ${SearchResultCalloutFragmentDoc}
  ${SearchResultPostFragmentDoc}
  ${SearchResultUserFragmentDoc}
  ${SearchResultOrganizationFragmentDoc}
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables> &
    ({ variables: SchemaTypes.SearchQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSearchSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>(SearchDocument, options);
}
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchSuspenseQueryHookResult = ReturnType<typeof useSearchSuspenseQuery>;
export type SearchQueryResult = Apollo.QueryResult<SchemaTypes.SearchQuery, SchemaTypes.SearchQueryVariables>;
export function refetchSearchQuery(variables: SchemaTypes.SearchQueryVariables) {
  return { query: SearchDocument, variables: variables };
}
export const UserRolesSearchCardsDocument = gql`
  query userRolesSearchCards($userId: UUID!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        roles
        subspaces {
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
  > &
    ({ variables: SchemaTypes.UserRolesSearchCardsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useUserRolesSearchCardsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.UserRolesSearchCardsQuery,
        SchemaTypes.UserRolesSearchCardsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.UserRolesSearchCardsQuery, SchemaTypes.UserRolesSearchCardsQueryVariables>(
    UserRolesSearchCardsDocument,
    options
  );
}
export type UserRolesSearchCardsQueryHookResult = ReturnType<typeof useUserRolesSearchCardsQuery>;
export type UserRolesSearchCardsLazyQueryHookResult = ReturnType<typeof useUserRolesSearchCardsLazyQuery>;
export type UserRolesSearchCardsSuspenseQueryHookResult = ReturnType<typeof useUserRolesSearchCardsSuspenseQuery>;
export type UserRolesSearchCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserRolesSearchCardsQuery,
  SchemaTypes.UserRolesSearchCardsQueryVariables
>;
export function refetchUserRolesSearchCardsQuery(variables: SchemaTypes.UserRolesSearchCardsQueryVariables) {
  return { query: UserRolesSearchCardsDocument, variables: variables };
}
export const SearchScopeDetailsSpaceDocument = gql`
  query SearchScopeDetailsSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
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
        visibility
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
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSearchScopeDetailsSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SearchScopeDetailsSpaceQuery,
    SchemaTypes.SearchScopeDetailsSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.SearchScopeDetailsSpaceQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSearchScopeDetailsSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SearchScopeDetailsSpaceQuery,
        SchemaTypes.SearchScopeDetailsSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SearchScopeDetailsSpaceQuery,
    SchemaTypes.SearchScopeDetailsSpaceQueryVariables
  >(SearchScopeDetailsSpaceDocument, options);
}
export type SearchScopeDetailsSpaceQueryHookResult = ReturnType<typeof useSearchScopeDetailsSpaceQuery>;
export type SearchScopeDetailsSpaceLazyQueryHookResult = ReturnType<typeof useSearchScopeDetailsSpaceLazyQuery>;
export type SearchScopeDetailsSpaceSuspenseQueryHookResult = ReturnType<typeof useSearchScopeDetailsSpaceSuspenseQuery>;
export type SearchScopeDetailsSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SearchScopeDetailsSpaceQuery,
  SchemaTypes.SearchScopeDetailsSpaceQueryVariables
>;
export function refetchSearchScopeDetailsSpaceQuery(variables: SchemaTypes.SearchScopeDetailsSpaceQueryVariables) {
  return { query: SearchScopeDetailsSpaceDocument, variables: variables };
}
export const InnovationLibraryDocument = gql`
  query InnovationLibrary($filterTemplateType: [TemplateType!]) {
    platform {
      id
      library {
        id
        templates(filter: { types: $filterTemplateType }) {
          template {
            ...TemplateProfileInfo
            callout {
              id
            }
          }
          innovationPack {
            id
            profile {
              id
              displayName
              url
            }
            provider {
              id
              profile {
                id
                displayName
                avatar: visual(type: AVATAR) {
                  id
                  uri
                }
                url
              }
            }
          }
        }
        innovationPacks {
          id
          profile {
            id
            displayName
            description
            tagset {
              ...TagsetDetails
            }
            url
          }
          templatesSet {
            id
            calloutTemplatesCount
            spaceTemplatesCount
            communityGuidelinesTemplatesCount
            postTemplatesCount
            whiteboardTemplatesCount
          }
          provider {
            ...InnovationPackProviderProfileWithAvatar
          }
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${InnovationPackProviderProfileWithAvatarFragmentDoc}
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
 *      filterTemplateType: // value for 'filterTemplateType'
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
export function useInnovationLibrarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.InnovationLibraryQuery, SchemaTypes.InnovationLibraryQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.InnovationLibraryQuery, SchemaTypes.InnovationLibraryQueryVariables>(
    InnovationLibraryDocument,
    options
  );
}
export type InnovationLibraryQueryHookResult = ReturnType<typeof useInnovationLibraryQuery>;
export type InnovationLibraryLazyQueryHookResult = ReturnType<typeof useInnovationLibraryLazyQuery>;
export type InnovationLibrarySuspenseQueryHookResult = ReturnType<typeof useInnovationLibrarySuspenseQuery>;
export type InnovationLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationLibraryQuery,
  SchemaTypes.InnovationLibraryQueryVariables
>;
export function refetchInnovationLibraryQuery(variables?: SchemaTypes.InnovationLibraryQueryVariables) {
  return { query: InnovationLibraryDocument, variables: variables };
}
export const CampaignBlockCredentialsDocument = gql`
  query CampaignBlockCredentials {
    platform {
      id
      roleSet {
        id
        myRoles
      }
    }
    me {
      user {
        id
        account {
          id
          license {
            id
            availableEntitlements
          }
        }
      }
    }
  }
`;

/**
 * __useCampaignBlockCredentialsQuery__
 *
 * To run a query within a React component, call `useCampaignBlockCredentialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCampaignBlockCredentialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCampaignBlockCredentialsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCampaignBlockCredentialsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.CampaignBlockCredentialsQuery,
    SchemaTypes.CampaignBlockCredentialsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CampaignBlockCredentialsQuery, SchemaTypes.CampaignBlockCredentialsQueryVariables>(
    CampaignBlockCredentialsDocument,
    options
  );
}
export function useCampaignBlockCredentialsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CampaignBlockCredentialsQuery,
    SchemaTypes.CampaignBlockCredentialsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CampaignBlockCredentialsQuery,
    SchemaTypes.CampaignBlockCredentialsQueryVariables
  >(CampaignBlockCredentialsDocument, options);
}
export function useCampaignBlockCredentialsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.CampaignBlockCredentialsQuery,
        SchemaTypes.CampaignBlockCredentialsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.CampaignBlockCredentialsQuery,
    SchemaTypes.CampaignBlockCredentialsQueryVariables
  >(CampaignBlockCredentialsDocument, options);
}
export type CampaignBlockCredentialsQueryHookResult = ReturnType<typeof useCampaignBlockCredentialsQuery>;
export type CampaignBlockCredentialsLazyQueryHookResult = ReturnType<typeof useCampaignBlockCredentialsLazyQuery>;
export type CampaignBlockCredentialsSuspenseQueryHookResult = ReturnType<
  typeof useCampaignBlockCredentialsSuspenseQuery
>;
export type CampaignBlockCredentialsQueryResult = Apollo.QueryResult<
  SchemaTypes.CampaignBlockCredentialsQuery,
  SchemaTypes.CampaignBlockCredentialsQueryVariables
>;
export function refetchCampaignBlockCredentialsQuery(variables?: SchemaTypes.CampaignBlockCredentialsQueryVariables) {
  return { query: CampaignBlockCredentialsDocument, variables: variables };
}
export const DashboardWithMembershipsDocument = gql`
  query DashboardWithMemberships($limit: Float! = 0) {
    me {
      spaceMembershipsHierarchical(limit: $limit) {
        id
        space {
          ...DashboardSpaceMembership
        }
        childMemberships {
          id
          space {
            ...DashboardSpaceMembership
          }
        }
      }
    }
  }
  ${DashboardSpaceMembershipFragmentDoc}
`;

/**
 * __useDashboardWithMembershipsQuery__
 *
 * To run a query within a React component, call `useDashboardWithMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardWithMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardWithMembershipsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useDashboardWithMembershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.DashboardWithMembershipsQuery,
    SchemaTypes.DashboardWithMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.DashboardWithMembershipsQuery, SchemaTypes.DashboardWithMembershipsQueryVariables>(
    DashboardWithMembershipsDocument,
    options
  );
}
export function useDashboardWithMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.DashboardWithMembershipsQuery,
    SchemaTypes.DashboardWithMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.DashboardWithMembershipsQuery,
    SchemaTypes.DashboardWithMembershipsQueryVariables
  >(DashboardWithMembershipsDocument, options);
}
export function useDashboardWithMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.DashboardWithMembershipsQuery,
        SchemaTypes.DashboardWithMembershipsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.DashboardWithMembershipsQuery,
    SchemaTypes.DashboardWithMembershipsQueryVariables
  >(DashboardWithMembershipsDocument, options);
}
export type DashboardWithMembershipsQueryHookResult = ReturnType<typeof useDashboardWithMembershipsQuery>;
export type DashboardWithMembershipsLazyQueryHookResult = ReturnType<typeof useDashboardWithMembershipsLazyQuery>;
export type DashboardWithMembershipsSuspenseQueryHookResult = ReturnType<
  typeof useDashboardWithMembershipsSuspenseQuery
>;
export type DashboardWithMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.DashboardWithMembershipsQuery,
  SchemaTypes.DashboardWithMembershipsQueryVariables
>;
export function refetchDashboardWithMembershipsQuery(variables?: SchemaTypes.DashboardWithMembershipsQueryVariables) {
  return { query: DashboardWithMembershipsDocument, variables: variables };
}
export const ExploreSpacesSearchDocument = gql`
  query ExploreSpacesSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      spaceResults {
        cursor
        results {
          score
          terms
          type
          ...ExploreSpacesSearch
        }
        total
      }
    }
  }
  ${ExploreSpacesSearchFragmentDoc}
`;

/**
 * __useExploreSpacesSearchQuery__
 *
 * To run a query within a React component, call `useExploreSpacesSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useExploreSpacesSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExploreSpacesSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useExploreSpacesSearchQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ExploreSpacesSearchQuery,
    SchemaTypes.ExploreSpacesSearchQueryVariables
  > &
    ({ variables: SchemaTypes.ExploreSpacesSearchQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ExploreSpacesSearchQuery, SchemaTypes.ExploreSpacesSearchQueryVariables>(
    ExploreSpacesSearchDocument,
    options
  );
}
export function useExploreSpacesSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ExploreSpacesSearchQuery,
    SchemaTypes.ExploreSpacesSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ExploreSpacesSearchQuery, SchemaTypes.ExploreSpacesSearchQueryVariables>(
    ExploreSpacesSearchDocument,
    options
  );
}
export function useExploreSpacesSearchSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.ExploreSpacesSearchQuery,
        SchemaTypes.ExploreSpacesSearchQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ExploreSpacesSearchQuery, SchemaTypes.ExploreSpacesSearchQueryVariables>(
    ExploreSpacesSearchDocument,
    options
  );
}
export type ExploreSpacesSearchQueryHookResult = ReturnType<typeof useExploreSpacesSearchQuery>;
export type ExploreSpacesSearchLazyQueryHookResult = ReturnType<typeof useExploreSpacesSearchLazyQuery>;
export type ExploreSpacesSearchSuspenseQueryHookResult = ReturnType<typeof useExploreSpacesSearchSuspenseQuery>;
export type ExploreSpacesSearchQueryResult = Apollo.QueryResult<
  SchemaTypes.ExploreSpacesSearchQuery,
  SchemaTypes.ExploreSpacesSearchQueryVariables
>;
export function refetchExploreSpacesSearchQuery(variables: SchemaTypes.ExploreSpacesSearchQueryVariables) {
  return { query: ExploreSpacesSearchDocument, variables: variables };
}
export const ExploreAllSpacesDocument = gql`
  query ExploreAllSpaces {
    exploreSpaces {
      ...ExploreSpaces
    }
  }
  ${ExploreSpacesFragmentDoc}
`;

/**
 * __useExploreAllSpacesQuery__
 *
 * To run a query within a React component, call `useExploreAllSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExploreAllSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExploreAllSpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useExploreAllSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.ExploreAllSpacesQuery, SchemaTypes.ExploreAllSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ExploreAllSpacesQuery, SchemaTypes.ExploreAllSpacesQueryVariables>(
    ExploreAllSpacesDocument,
    options
  );
}
export function useExploreAllSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ExploreAllSpacesQuery,
    SchemaTypes.ExploreAllSpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ExploreAllSpacesQuery, SchemaTypes.ExploreAllSpacesQueryVariables>(
    ExploreAllSpacesDocument,
    options
  );
}
export function useExploreAllSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.ExploreAllSpacesQuery, SchemaTypes.ExploreAllSpacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.ExploreAllSpacesQuery, SchemaTypes.ExploreAllSpacesQueryVariables>(
    ExploreAllSpacesDocument,
    options
  );
}
export type ExploreAllSpacesQueryHookResult = ReturnType<typeof useExploreAllSpacesQuery>;
export type ExploreAllSpacesLazyQueryHookResult = ReturnType<typeof useExploreAllSpacesLazyQuery>;
export type ExploreAllSpacesSuspenseQueryHookResult = ReturnType<typeof useExploreAllSpacesSuspenseQuery>;
export type ExploreAllSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.ExploreAllSpacesQuery,
  SchemaTypes.ExploreAllSpacesQueryVariables
>;
export function refetchExploreAllSpacesQuery(variables?: SchemaTypes.ExploreAllSpacesQueryVariables) {
  return { query: ExploreAllSpacesDocument, variables: variables };
}
export const WelcomeSpaceDocument = gql`
  query WelcomeSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        ...ExploreSpaces
      }
    }
  }
  ${ExploreSpacesFragmentDoc}
`;

/**
 * __useWelcomeSpaceQuery__
 *
 * To run a query within a React component, call `useWelcomeSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useWelcomeSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWelcomeSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useWelcomeSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables> &
    ({ variables: SchemaTypes.WelcomeSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>(
    WelcomeSpaceDocument,
    options
  );
}
export function useWelcomeSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>(
    WelcomeSpaceDocument,
    options
  );
}
export function useWelcomeSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>(
    WelcomeSpaceDocument,
    options
  );
}
export type WelcomeSpaceQueryHookResult = ReturnType<typeof useWelcomeSpaceQuery>;
export type WelcomeSpaceLazyQueryHookResult = ReturnType<typeof useWelcomeSpaceLazyQuery>;
export type WelcomeSpaceSuspenseQueryHookResult = ReturnType<typeof useWelcomeSpaceSuspenseQuery>;
export type WelcomeSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.WelcomeSpaceQuery,
  SchemaTypes.WelcomeSpaceQueryVariables
>;
export function refetchWelcomeSpaceQuery(variables: SchemaTypes.WelcomeSpaceQueryVariables) {
  return { query: WelcomeSpaceDocument, variables: variables };
}
export const PendingInvitationsDocument = gql`
  query PendingInvitations {
    me {
      communityInvitations(states: ["invited"]) {
        id
        spacePendingMembershipInfo {
          id
          level
          about {
            ...SpaceAboutLight
          }
        }
        invitation {
          id
          welcomeMessage
          contributorType
          createdBy {
            id
          }
          state
          createdDate
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __usePendingInvitationsQuery__
 *
 * To run a query within a React component, call `usePendingInvitationsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingInvitationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingInvitationsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePendingInvitationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.PendingInvitationsQuery,
    SchemaTypes.PendingInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PendingInvitationsQuery, SchemaTypes.PendingInvitationsQueryVariables>(
    PendingInvitationsDocument,
    options
  );
}
export function usePendingInvitationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingInvitationsQuery,
    SchemaTypes.PendingInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PendingInvitationsQuery, SchemaTypes.PendingInvitationsQueryVariables>(
    PendingInvitationsDocument,
    options
  );
}
export function usePendingInvitationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.PendingInvitationsQuery, SchemaTypes.PendingInvitationsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.PendingInvitationsQuery, SchemaTypes.PendingInvitationsQueryVariables>(
    PendingInvitationsDocument,
    options
  );
}
export type PendingInvitationsQueryHookResult = ReturnType<typeof usePendingInvitationsQuery>;
export type PendingInvitationsLazyQueryHookResult = ReturnType<typeof usePendingInvitationsLazyQuery>;
export type PendingInvitationsSuspenseQueryHookResult = ReturnType<typeof usePendingInvitationsSuspenseQuery>;
export type PendingInvitationsQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingInvitationsQuery,
  SchemaTypes.PendingInvitationsQueryVariables
>;
export function refetchPendingInvitationsQuery(variables?: SchemaTypes.PendingInvitationsQueryVariables) {
  return { query: PendingInvitationsDocument, variables: variables };
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
        spaceDisplayName: parentDisplayName
        space {
          id
          ... on Space {
            about {
              ...SpaceAboutCardBanner
              profile {
                avatar: visual(type: AVATAR) {
                  id
                  uri
                }
              }
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
        ... on ActivityLogEntrySubspaceCreated {
          ...ActivityLogSubspaceCreated
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
  ${SpaceAboutCardBannerFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogSubspaceCreatedFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.LatestContributionsQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useLatestContributionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.LatestContributionsQuery,
        SchemaTypes.LatestContributionsQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.LatestContributionsQuery, SchemaTypes.LatestContributionsQueryVariables>(
    LatestContributionsDocument,
    options
  );
}
export type LatestContributionsQueryHookResult = ReturnType<typeof useLatestContributionsQuery>;
export type LatestContributionsLazyQueryHookResult = ReturnType<typeof useLatestContributionsLazyQuery>;
export type LatestContributionsSuspenseQueryHookResult = ReturnType<typeof useLatestContributionsSuspenseQuery>;
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
      spaceDisplayName: parentDisplayName
      space {
        ...ActivityLogSpaceVisuals
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
      ... on ActivityLogEntrySubspaceCreated {
        ...ActivityLogSubspaceCreated
      }
      ... on ActivityLogEntryUpdateSent {
        ...ActivityLogUpdateSent
      }
      ... on ActivityLogEntryCalendarEventCreated {
        ...ActivityLogCalendarEventCreated
      }
    }
  }
  ${ActivityLogSpaceVisualsFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutPostCreatedFragmentDoc}
  ${ActivityLogCalloutLinkCreatedFragmentDoc}
  ${ActivityLogCalloutPostCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutWhiteboardContentModifiedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogSubspaceCreatedFragmentDoc}
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
export function useLatestContributionsGroupedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.LatestContributionsGroupedQuery,
        SchemaTypes.LatestContributionsGroupedQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.LatestContributionsGroupedQuery,
    SchemaTypes.LatestContributionsGroupedQueryVariables
  >(LatestContributionsGroupedDocument, options);
}
export type LatestContributionsGroupedQueryHookResult = ReturnType<typeof useLatestContributionsGroupedQuery>;
export type LatestContributionsGroupedLazyQueryHookResult = ReturnType<typeof useLatestContributionsGroupedLazyQuery>;
export type LatestContributionsGroupedSuspenseQueryHookResult = ReturnType<
  typeof useLatestContributionsGroupedSuspenseQuery
>;
export type LatestContributionsGroupedQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestContributionsGroupedQuery,
  SchemaTypes.LatestContributionsGroupedQueryVariables
>;
export function refetchLatestContributionsGroupedQuery(
  variables?: SchemaTypes.LatestContributionsGroupedQueryVariables
) {
  return { query: LatestContributionsGroupedDocument, variables: variables };
}
export const LatestContributionsSpacesFlatDocument = gql`
  query LatestContributionsSpacesFlat {
    me {
      spaceMembershipsFlat {
        id
        space {
          ...ActivityLogSpaceVisuals
        }
      }
    }
  }
  ${ActivityLogSpaceVisualsFragmentDoc}
`;

/**
 * __useLatestContributionsSpacesFlatQuery__
 *
 * To run a query within a React component, call `useLatestContributionsSpacesFlatQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestContributionsSpacesFlatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestContributionsSpacesFlatQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestContributionsSpacesFlatQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.LatestContributionsSpacesFlatQuery,
    SchemaTypes.LatestContributionsSpacesFlatQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.LatestContributionsSpacesFlatQuery,
    SchemaTypes.LatestContributionsSpacesFlatQueryVariables
  >(LatestContributionsSpacesFlatDocument, options);
}
export function useLatestContributionsSpacesFlatLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.LatestContributionsSpacesFlatQuery,
    SchemaTypes.LatestContributionsSpacesFlatQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.LatestContributionsSpacesFlatQuery,
    SchemaTypes.LatestContributionsSpacesFlatQueryVariables
  >(LatestContributionsSpacesFlatDocument, options);
}
export function useLatestContributionsSpacesFlatSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.LatestContributionsSpacesFlatQuery,
        SchemaTypes.LatestContributionsSpacesFlatQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.LatestContributionsSpacesFlatQuery,
    SchemaTypes.LatestContributionsSpacesFlatQueryVariables
  >(LatestContributionsSpacesFlatDocument, options);
}
export type LatestContributionsSpacesFlatQueryHookResult = ReturnType<typeof useLatestContributionsSpacesFlatQuery>;
export type LatestContributionsSpacesFlatLazyQueryHookResult = ReturnType<
  typeof useLatestContributionsSpacesFlatLazyQuery
>;
export type LatestContributionsSpacesFlatSuspenseQueryHookResult = ReturnType<
  typeof useLatestContributionsSpacesFlatSuspenseQuery
>;
export type LatestContributionsSpacesFlatQueryResult = Apollo.QueryResult<
  SchemaTypes.LatestContributionsSpacesFlatQuery,
  SchemaTypes.LatestContributionsSpacesFlatQueryVariables
>;
export function refetchLatestContributionsSpacesFlatQuery(
  variables?: SchemaTypes.LatestContributionsSpacesFlatQueryVariables
) {
  return { query: LatestContributionsSpacesFlatDocument, variables: variables };
}
export const MyMembershipsDocument = gql`
  query MyMemberships($limit: Float) {
    me {
      spaceMembershipsHierarchical(limit: $limit) {
        id
        space {
          ...SpaceMembership
        }
        childMemberships {
          id
          space {
            ...SpaceMembership
          }
          childMemberships {
            id
            space {
              ...SpaceMembership
            }
          }
        }
      }
    }
  }
  ${SpaceMembershipFragmentDoc}
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
 *      limit: // value for 'limit'
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
export function useMyMembershipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MyMembershipsQuery, SchemaTypes.MyMembershipsQueryVariables>(
    MyMembershipsDocument,
    options
  );
}
export type MyMembershipsQueryHookResult = ReturnType<typeof useMyMembershipsQuery>;
export type MyMembershipsLazyQueryHookResult = ReturnType<typeof useMyMembershipsLazyQuery>;
export type MyMembershipsSuspenseQueryHookResult = ReturnType<typeof useMyMembershipsSuspenseQuery>;
export type MyMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.MyMembershipsQuery,
  SchemaTypes.MyMembershipsQueryVariables
>;
export function refetchMyMembershipsQuery(variables?: SchemaTypes.MyMembershipsQueryVariables) {
  return { query: MyMembershipsDocument, variables: variables };
}
export const MyResourcesDocument = gql`
  query MyResources($accountId: UUID!) {
    lookup {
      account(ID: $accountId) {
        id
        spaces {
          id
          level
          about {
            ...SpaceAboutCardBanner
            profile {
              avatar: visual(type: AVATAR) {
                ...VisualModel
              }
            }
            isContentPublic
          }
        }
        virtualContributors {
          id
          profile {
            ...ShortAccountItem
          }
        }
        innovationPacks {
          id
          profile {
            ...ShortAccountItem
          }
        }
        innovationHubs {
          id
          profile {
            ...ShortAccountItem
            banner: visual(type: BANNER_WIDE) {
              ...VisualModel
            }
          }
          subdomain
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualModelFragmentDoc}
  ${ShortAccountItemFragmentDoc}
`;

/**
 * __useMyResourcesQuery__
 *
 * To run a query within a React component, call `useMyResourcesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyResourcesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyResourcesQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useMyResourcesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables> &
    ({ variables: SchemaTypes.MyResourcesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>(
    MyResourcesDocument,
    options
  );
}
export function useMyResourcesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>(
    MyResourcesDocument,
    options
  );
}
export function useMyResourcesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>(
    MyResourcesDocument,
    options
  );
}
export type MyResourcesQueryHookResult = ReturnType<typeof useMyResourcesQuery>;
export type MyResourcesLazyQueryHookResult = ReturnType<typeof useMyResourcesLazyQuery>;
export type MyResourcesSuspenseQueryHookResult = ReturnType<typeof useMyResourcesSuspenseQuery>;
export type MyResourcesQueryResult = Apollo.QueryResult<
  SchemaTypes.MyResourcesQuery,
  SchemaTypes.MyResourcesQueryVariables
>;
export function refetchMyResourcesQuery(variables: SchemaTypes.MyResourcesQueryVariables) {
  return { query: MyResourcesDocument, variables: variables };
}
export const CreateVirtualContributorOnAccountDocument = gql`
  mutation CreateVirtualContributorOnAccount($virtualContributorData: CreateVirtualContributorOnAccountInput!) {
    createVirtualContributor(virtualContributorData: $virtualContributorData) {
      id
      profile {
        id
        url
        avatar: visual(type: AVATAR) {
          id
        }
      }
      knowledgeBase {
        id
        calloutsSet {
          id
          callouts {
            id
            framing {
              id
              profile {
                id
                displayName
                description
              }
            }
          }
        }
      }
    }
  }
`;
export type CreateVirtualContributorOnAccountMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateVirtualContributorOnAccountMutation,
  SchemaTypes.CreateVirtualContributorOnAccountMutationVariables
>;

/**
 * __useCreateVirtualContributorOnAccountMutation__
 *
 * To run a mutation, you first call `useCreateVirtualContributorOnAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateVirtualContributorOnAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createVirtualContributorOnAccountMutation, { data, loading, error }] = useCreateVirtualContributorOnAccountMutation({
 *   variables: {
 *      virtualContributorData: // value for 'virtualContributorData'
 *   },
 * });
 */
export function useCreateVirtualContributorOnAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateVirtualContributorOnAccountMutation,
    SchemaTypes.CreateVirtualContributorOnAccountMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateVirtualContributorOnAccountMutation,
    SchemaTypes.CreateVirtualContributorOnAccountMutationVariables
  >(CreateVirtualContributorOnAccountDocument, options);
}
export type CreateVirtualContributorOnAccountMutationHookResult = ReturnType<
  typeof useCreateVirtualContributorOnAccountMutation
>;
export type CreateVirtualContributorOnAccountMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateVirtualContributorOnAccountMutation>;
export type CreateVirtualContributorOnAccountMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateVirtualContributorOnAccountMutation,
  SchemaTypes.CreateVirtualContributorOnAccountMutationVariables
>;
export const DeleteVirtualContributorOnAccountDocument = gql`
  mutation DeleteVirtualContributorOnAccount($virtualContributorData: DeleteVirtualContributorInput!) {
    deleteVirtualContributor(deleteData: $virtualContributorData) {
      id
    }
  }
`;
export type DeleteVirtualContributorOnAccountMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteVirtualContributorOnAccountMutation,
  SchemaTypes.DeleteVirtualContributorOnAccountMutationVariables
>;

/**
 * __useDeleteVirtualContributorOnAccountMutation__
 *
 * To run a mutation, you first call `useDeleteVirtualContributorOnAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVirtualContributorOnAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVirtualContributorOnAccountMutation, { data, loading, error }] = useDeleteVirtualContributorOnAccountMutation({
 *   variables: {
 *      virtualContributorData: // value for 'virtualContributorData'
 *   },
 * });
 */
export function useDeleteVirtualContributorOnAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteVirtualContributorOnAccountMutation,
    SchemaTypes.DeleteVirtualContributorOnAccountMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.DeleteVirtualContributorOnAccountMutation,
    SchemaTypes.DeleteVirtualContributorOnAccountMutationVariables
  >(DeleteVirtualContributorOnAccountDocument, options);
}
export type DeleteVirtualContributorOnAccountMutationHookResult = ReturnType<
  typeof useDeleteVirtualContributorOnAccountMutation
>;
export type DeleteVirtualContributorOnAccountMutationResult =
  Apollo.MutationResult<SchemaTypes.DeleteVirtualContributorOnAccountMutation>;
export type DeleteVirtualContributorOnAccountMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteVirtualContributorOnAccountMutation,
  SchemaTypes.DeleteVirtualContributorOnAccountMutationVariables
>;
export const NewVirtualContributorMySpacesDocument = gql`
  query NewVirtualContributorMySpaces {
    me {
      id
      user {
        id
        account {
          id
          host {
            id
          }
          spaces {
            id
            authorization {
              id
              myPrivileges
            }
            license {
              id
              availableEntitlements
            }
            authorization {
              id
              myPrivileges
            }
            ...spaceProfileCommunityDetails
          }
        }
      }
    }
  }
  ${SpaceProfileCommunityDetailsFragmentDoc}
`;

/**
 * __useNewVirtualContributorMySpacesQuery__
 *
 * To run a query within a React component, call `useNewVirtualContributorMySpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewVirtualContributorMySpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewVirtualContributorMySpacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useNewVirtualContributorMySpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.NewVirtualContributorMySpacesQuery,
    SchemaTypes.NewVirtualContributorMySpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.NewVirtualContributorMySpacesQuery,
    SchemaTypes.NewVirtualContributorMySpacesQueryVariables
  >(NewVirtualContributorMySpacesDocument, options);
}
export function useNewVirtualContributorMySpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.NewVirtualContributorMySpacesQuery,
    SchemaTypes.NewVirtualContributorMySpacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.NewVirtualContributorMySpacesQuery,
    SchemaTypes.NewVirtualContributorMySpacesQueryVariables
  >(NewVirtualContributorMySpacesDocument, options);
}
export function useNewVirtualContributorMySpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.NewVirtualContributorMySpacesQuery,
        SchemaTypes.NewVirtualContributorMySpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.NewVirtualContributorMySpacesQuery,
    SchemaTypes.NewVirtualContributorMySpacesQueryVariables
  >(NewVirtualContributorMySpacesDocument, options);
}
export type NewVirtualContributorMySpacesQueryHookResult = ReturnType<typeof useNewVirtualContributorMySpacesQuery>;
export type NewVirtualContributorMySpacesLazyQueryHookResult = ReturnType<
  typeof useNewVirtualContributorMySpacesLazyQuery
>;
export type NewVirtualContributorMySpacesSuspenseQueryHookResult = ReturnType<
  typeof useNewVirtualContributorMySpacesSuspenseQuery
>;
export type NewVirtualContributorMySpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.NewVirtualContributorMySpacesQuery,
  SchemaTypes.NewVirtualContributorMySpacesQueryVariables
>;
export function refetchNewVirtualContributorMySpacesQuery(
  variables?: SchemaTypes.NewVirtualContributorMySpacesQueryVariables
) {
  return { query: NewVirtualContributorMySpacesDocument, variables: variables };
}
export const AllSpaceSubspacesDocument = gql`
  query AllSpaceSubspaces($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        subspaces {
          ...spaceProfileCommunityDetails
          subspaces {
            ...spaceProfileCommunityDetails
          }
        }
      }
    }
  }
  ${SpaceProfileCommunityDetailsFragmentDoc}
`;

/**
 * __useAllSpaceSubspacesQuery__
 *
 * To run a query within a React component, call `useAllSpaceSubspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllSpaceSubspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllSpaceSubspacesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAllSpaceSubspacesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AllSpaceSubspacesQuery,
    SchemaTypes.AllSpaceSubspacesQueryVariables
  > &
    ({ variables: SchemaTypes.AllSpaceSubspacesQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AllSpaceSubspacesQuery, SchemaTypes.AllSpaceSubspacesQueryVariables>(
    AllSpaceSubspacesDocument,
    options
  );
}
export function useAllSpaceSubspacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AllSpaceSubspacesQuery,
    SchemaTypes.AllSpaceSubspacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AllSpaceSubspacesQuery, SchemaTypes.AllSpaceSubspacesQueryVariables>(
    AllSpaceSubspacesDocument,
    options
  );
}
export function useAllSpaceSubspacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.AllSpaceSubspacesQuery, SchemaTypes.AllSpaceSubspacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.AllSpaceSubspacesQuery, SchemaTypes.AllSpaceSubspacesQueryVariables>(
    AllSpaceSubspacesDocument,
    options
  );
}
export type AllSpaceSubspacesQueryHookResult = ReturnType<typeof useAllSpaceSubspacesQuery>;
export type AllSpaceSubspacesLazyQueryHookResult = ReturnType<typeof useAllSpaceSubspacesLazyQuery>;
export type AllSpaceSubspacesSuspenseQueryHookResult = ReturnType<typeof useAllSpaceSubspacesSuspenseQuery>;
export type AllSpaceSubspacesQueryResult = Apollo.QueryResult<
  SchemaTypes.AllSpaceSubspacesQuery,
  SchemaTypes.AllSpaceSubspacesQueryVariables
>;
export function refetchAllSpaceSubspacesQuery(variables: SchemaTypes.AllSpaceSubspacesQueryVariables) {
  return { query: AllSpaceSubspacesDocument, variables: variables };
}
export const RecentSpacesDocument = gql`
  query RecentSpaces($limit: Float) {
    me {
      mySpaces(limit: $limit) {
        space {
          id
          about {
            ...SpaceAboutCardBanner
            isContentPublic
            membership {
              myMembershipStatus
            }
          }
          level
          __typename
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
`;

/**
 * __useRecentSpacesQuery__
 *
 * To run a query within a React component, call `useRecentSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentSpacesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRecentSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>(
    RecentSpacesDocument,
    options
  );
}
export function useRecentSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>(
    RecentSpacesDocument,
    options
  );
}
export function useRecentSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.RecentSpacesQuery, SchemaTypes.RecentSpacesQueryVariables>(
    RecentSpacesDocument,
    options
  );
}
export type RecentSpacesQueryHookResult = ReturnType<typeof useRecentSpacesQuery>;
export type RecentSpacesLazyQueryHookResult = ReturnType<typeof useRecentSpacesLazyQuery>;
export type RecentSpacesSuspenseQueryHookResult = ReturnType<typeof useRecentSpacesSuspenseQuery>;
export type RecentSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.RecentSpacesQuery,
  SchemaTypes.RecentSpacesQueryVariables
>;
export function refetchRecentSpacesQuery(variables?: SchemaTypes.RecentSpacesQueryVariables) {
  return { query: RecentSpacesDocument, variables: variables };
}
export const MySpacesExplorerPageDocument = gql`
  query MySpacesExplorerPage {
    me {
      spaceMembershipsFlat {
        id
        space {
          id
        }
      }
    }
  }
`;

/**
 * __useMySpacesExplorerPageQuery__
 *
 * To run a query within a React component, call `useMySpacesExplorerPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useMySpacesExplorerPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMySpacesExplorerPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useMySpacesExplorerPageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.MySpacesExplorerPageQuery,
    SchemaTypes.MySpacesExplorerPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MySpacesExplorerPageQuery, SchemaTypes.MySpacesExplorerPageQueryVariables>(
    MySpacesExplorerPageDocument,
    options
  );
}
export function useMySpacesExplorerPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MySpacesExplorerPageQuery,
    SchemaTypes.MySpacesExplorerPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MySpacesExplorerPageQuery, SchemaTypes.MySpacesExplorerPageQueryVariables>(
    MySpacesExplorerPageDocument,
    options
  );
}
export function useMySpacesExplorerPageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.MySpacesExplorerPageQuery,
        SchemaTypes.MySpacesExplorerPageQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.MySpacesExplorerPageQuery, SchemaTypes.MySpacesExplorerPageQueryVariables>(
    MySpacesExplorerPageDocument,
    options
  );
}
export type MySpacesExplorerPageQueryHookResult = ReturnType<typeof useMySpacesExplorerPageQuery>;
export type MySpacesExplorerPageLazyQueryHookResult = ReturnType<typeof useMySpacesExplorerPageLazyQuery>;
export type MySpacesExplorerPageSuspenseQueryHookResult = ReturnType<typeof useMySpacesExplorerPageSuspenseQuery>;
export type MySpacesExplorerPageQueryResult = Apollo.QueryResult<
  SchemaTypes.MySpacesExplorerPageQuery,
  SchemaTypes.MySpacesExplorerPageQueryVariables
>;
export function refetchMySpacesExplorerPageQuery(variables?: SchemaTypes.MySpacesExplorerPageQueryVariables) {
  return { query: MySpacesExplorerPageDocument, variables: variables };
}
export const SpaceExplorerSearchDocument = gql`
  query SpaceExplorerSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      spaceResults {
        cursor
        results {
          score
          terms
          type
          ...SpaceExplorerSearchSpace
        }
        total
      }
    }
  }
  ${SpaceExplorerSearchSpaceFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.SpaceExplorerSearchQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSpaceExplorerSearchSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceExplorerSearchQuery,
        SchemaTypes.SpaceExplorerSearchQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SchemaTypes.SpaceExplorerSearchQuery, SchemaTypes.SpaceExplorerSearchQueryVariables>(
    SpaceExplorerSearchDocument,
    options
  );
}
export type SpaceExplorerSearchQueryHookResult = ReturnType<typeof useSpaceExplorerSearchQuery>;
export type SpaceExplorerSearchLazyQueryHookResult = ReturnType<typeof useSpaceExplorerSearchLazyQuery>;
export type SpaceExplorerSearchSuspenseQueryHookResult = ReturnType<typeof useSpaceExplorerSearchSuspenseQuery>;
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
      ...SpaceExplorerSpace
      subspaces {
        ...SpaceExplorerSubspace
      }
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
  ${SpaceExplorerSubspaceFragmentDoc}
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
export function useSpaceExplorerMemberSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceExplorerMemberSpacesQuery,
        SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceExplorerMemberSpacesQuery,
    SchemaTypes.SpaceExplorerMemberSpacesQueryVariables
  >(SpaceExplorerMemberSpacesDocument, options);
}
export type SpaceExplorerMemberSpacesQueryHookResult = ReturnType<typeof useSpaceExplorerMemberSpacesQuery>;
export type SpaceExplorerMemberSpacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerMemberSpacesLazyQuery>;
export type SpaceExplorerMemberSpacesSuspenseQueryHookResult = ReturnType<
  typeof useSpaceExplorerMemberSpacesSuspenseQuery
>;
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
        ...SpaceExplorerSpace
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${SpaceExplorerSpaceFragmentDoc}
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
  > &
    ({ variables: SchemaTypes.SpaceExplorerAllSpacesQueryVariables; skip?: boolean } | { skip: boolean })
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
export function useSpaceExplorerAllSpacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceExplorerAllSpacesQuery,
        SchemaTypes.SpaceExplorerAllSpacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceExplorerAllSpacesQuery,
    SchemaTypes.SpaceExplorerAllSpacesQueryVariables
  >(SpaceExplorerAllSpacesDocument, options);
}
export type SpaceExplorerAllSpacesQueryHookResult = ReturnType<typeof useSpaceExplorerAllSpacesQuery>;
export type SpaceExplorerAllSpacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerAllSpacesLazyQuery>;
export type SpaceExplorerAllSpacesSuspenseQueryHookResult = ReturnType<typeof useSpaceExplorerAllSpacesSuspenseQuery>;
export type SpaceExplorerAllSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerAllSpacesQuery,
  SchemaTypes.SpaceExplorerAllSpacesQueryVariables
>;
export function refetchSpaceExplorerAllSpacesQuery(variables: SchemaTypes.SpaceExplorerAllSpacesQueryVariables) {
  return { query: SpaceExplorerAllSpacesDocument, variables: variables };
}
export const SpaceExplorerSubspacesDocument = gql`
  query SpaceExplorerSubspaces($IDs: [UUID!]) {
    spaces(IDs: $IDs) {
      id
      subspaces {
        ...SpaceExplorerSubspace
      }
    }
  }
  ${SpaceExplorerSubspaceFragmentDoc}
`;

/**
 * __useSpaceExplorerSubspacesQuery__
 *
 * To run a query within a React component, call `useSpaceExplorerSubspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceExplorerSubspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceExplorerSubspacesQuery({
 *   variables: {
 *      IDs: // value for 'IDs'
 *   },
 * });
 */
export function useSpaceExplorerSubspacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.SpaceExplorerSubspacesQuery,
    SchemaTypes.SpaceExplorerSubspacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceExplorerSubspacesQuery, SchemaTypes.SpaceExplorerSubspacesQueryVariables>(
    SpaceExplorerSubspacesDocument,
    options
  );
}
export function useSpaceExplorerSubspacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceExplorerSubspacesQuery,
    SchemaTypes.SpaceExplorerSubspacesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceExplorerSubspacesQuery, SchemaTypes.SpaceExplorerSubspacesQueryVariables>(
    SpaceExplorerSubspacesDocument,
    options
  );
}
export function useSpaceExplorerSubspacesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceExplorerSubspacesQuery,
        SchemaTypes.SpaceExplorerSubspacesQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceExplorerSubspacesQuery,
    SchemaTypes.SpaceExplorerSubspacesQueryVariables
  >(SpaceExplorerSubspacesDocument, options);
}
export type SpaceExplorerSubspacesQueryHookResult = ReturnType<typeof useSpaceExplorerSubspacesQuery>;
export type SpaceExplorerSubspacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerSubspacesLazyQuery>;
export type SpaceExplorerSubspacesSuspenseQueryHookResult = ReturnType<typeof useSpaceExplorerSubspacesSuspenseQuery>;
export type SpaceExplorerSubspacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerSubspacesQuery,
  SchemaTypes.SpaceExplorerSubspacesQueryVariables
>;
export function refetchSpaceExplorerSubspacesQuery(variables?: SchemaTypes.SpaceExplorerSubspacesQueryVariables) {
  return { query: SpaceExplorerSubspacesDocument, variables: variables };
}
export const SpaceExplorerWelcomeSpaceDocument = gql`
  query SpaceExplorerWelcomeSpace($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        about {
          ...SpaceAboutLight
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __useSpaceExplorerWelcomeSpaceQuery__
 *
 * To run a query within a React component, call `useSpaceExplorerWelcomeSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceExplorerWelcomeSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceExplorerWelcomeSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceExplorerWelcomeSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
    SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
  > &
    ({ variables: SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
    SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
  >(SpaceExplorerWelcomeSpaceDocument, options);
}
export function useSpaceExplorerWelcomeSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
    SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
    SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
  >(SpaceExplorerWelcomeSpaceDocument, options);
}
export function useSpaceExplorerWelcomeSpaceSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
        SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
      >
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
    SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
  >(SpaceExplorerWelcomeSpaceDocument, options);
}
export type SpaceExplorerWelcomeSpaceQueryHookResult = ReturnType<typeof useSpaceExplorerWelcomeSpaceQuery>;
export type SpaceExplorerWelcomeSpaceLazyQueryHookResult = ReturnType<typeof useSpaceExplorerWelcomeSpaceLazyQuery>;
export type SpaceExplorerWelcomeSpaceSuspenseQueryHookResult = ReturnType<
  typeof useSpaceExplorerWelcomeSpaceSuspenseQuery
>;
export type SpaceExplorerWelcomeSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
  SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
>;
export function refetchSpaceExplorerWelcomeSpaceQuery(variables: SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables) {
  return { query: SpaceExplorerWelcomeSpaceDocument, variables: variables };
}
