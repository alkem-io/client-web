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
export const VisualUriFragmentDoc = gql`
  fragment VisualUri on Visual {
    id
    uri
    name
  }
`;
export const InnovationPackProviderProfileWithAvatarFragmentDoc = gql`
  fragment InnovationPackProviderProfileWithAvatar on Contributor {
    id
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      url
    }
  }
  ${VisualUriFragmentDoc}
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
      collaborationTemplatesCount
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
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      location {
        id
        city
        country
      }
      url
    }
  }
  ${VisualUriFragmentDoc}
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
export const VirtualContributorFullFragmentDoc = gql`
  fragment VirtualContributorFull on VirtualContributor {
    id
    profile {
      id
      displayName
      description
      avatar: visual(type: AVATAR) {
        ...VisualUri
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
    aiPersona {
      bodyOfKnowledge
      bodyOfKnowledgeType
      bodyOfKnowledgeID
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
export const RoleSetMemberVirtualContributorFragmentDoc = gql`
  fragment RoleSetMemberVirtualContributor on VirtualContributor {
    id
    searchVisibility
    profile {
      id
      displayName
      avatar: visual(type: AVATAR) {
        ...VisualUri
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
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const AccountItemProfileFragmentDoc = gql`
  fragment AccountItemProfile on Profile {
    id
    displayName
    description
    avatar: visual(type: AVATAR) {
      ...VisualUri
    }
    url
  }
  ${VisualUriFragmentDoc}
`;
export const UserAgentSsiFragmentDoc = gql`
  fragment UserAgentSsi on User {
    id
    agent {
      id
      did
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
    calloutsSet {
      id
      callouts(groups: $filterCalloutGroups) {
        id
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
  }
  ${TagsetDetailsFragmentDoc}
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
export const ActivityLogOpportunityCreatedFragmentDoc = gql`
  fragment ActivityLogOpportunityCreated on ActivityLogEntryOpportunityCreated {
    subsubspace {
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
export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
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
export const CalloutFragmentDoc = gql`
  fragment Callout on Callout {
    id
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
export const ContributorDetailsFragmentDoc = gql`
  fragment ContributorDetails on Contributor {
    id
    profile {
      id
      displayName
      url
      avatar: visual(type: AVATAR) {
        ...VisualUri
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
  }
  ${VisualUriFragmentDoc}
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
export const CalloutDetailsFragmentDoc = gql`
  fragment CalloutDetails on Callout {
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
    visibility
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${LinkDetailsWithAuthorizationFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
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
    type
    contributions {
      id
      post {
        id
      }
    }
    postNames: contributions {
      post {
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
            ...VisualFull
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const CollaborationWithWhiteboardDetailsFragmentDoc = gql`
  fragment CollaborationWithWhiteboardDetails on Collaboration {
    id
    calloutsSet {
      id
      callouts {
        id
        type
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
          whiteboard {
            ...WhiteboardDetails
          }
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
    }
  }
  ${VisualFullFragmentDoc}
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
export const CommunityPageMembersFragmentDoc = gql`
  fragment CommunityPageMembers on User {
    id
    email
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
    profile {
      id
      url
      displayName
      visual(type: AVATAR) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
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
        ...VisualUri
      }
      description
      url
    }
    verification {
      id
      status
    }
  }
  ${VisualUriFragmentDoc}
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
        ...VisualUri
      }
      tagsets {
        ...TagsetDetails
      }
      url
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
      url
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
export const AccountResourceProfileFragmentDoc = gql`
  fragment AccountResourceProfile on Profile {
    id
    displayName
    url
    avatar: visual(type: AVATAR) {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
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
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
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
      url
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
export const MyPrivilegesFragmentDoc = gql`
  fragment MyPrivileges on Authorization {
    myPrivileges
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
      ...VisualFull
    }
    url
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const InnovationHubSpaceFragmentDoc = gql`
  fragment InnovationHubSpace on Space {
    id
    visibility
    provider {
      id
      profile {
        id
        displayName
      }
    }
    about {
      ...SpaceAboutMinimalUrl
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
export const JourneyBreadcrumbsSpaceFragmentDoc = gql`
  fragment JourneyBreadcrumbsSpace on Space {
    id
    level
    about {
      id
      profile {
        id
        url
        displayName
        avatar: visual(type: BANNER) {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const JourneyBreadcrumbsSubpaceFragmentDoc = gql`
  fragment JourneyBreadcrumbsSubpace on Space {
    id
    level
    about {
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
  ${VisualUriFragmentDoc}
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
        ...VisualUri
      }
      tagset {
        id
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SpaceCardFragmentDoc = gql`
  fragment SpaceCard on Space {
    id
    about {
      ...SpaceAboutCardBanner
      why
    }
    metrics {
      name
      value
    }
    community {
      id
      roleSet {
        id
        myMembershipStatus
      }
    }
    settings {
      privacy {
        mode
      }
    }
    visibility
  }
  ${SpaceAboutCardBannerFragmentDoc}
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
      references {
        ...ReferenceDetails
      }
      location {
        id
        city
        country
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
`;
export const SpaceInfoFragmentDoc = gql`
  fragment SpaceInfo on Space {
    about {
      ...SpaceAboutDetails
    }
    settings {
      privacy {
        mode
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
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
export const RoleSetMemberUserFragmentDoc = gql`
  fragment RoleSetMemberUser on User {
    id
    isContactable
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
      tagsets {
        ...TagsetDetails
      }
      url
    }
    email
    firstName
    lastName
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const RoleSetMemberOrganizationFragmentDoc = gql`
  fragment RoleSetMemberOrganization on Organization {
    id
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
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const SpacePageFragmentDoc = gql`
  fragment SpacePage on Space {
    id
    level
    nameID
    about {
      ...SpaceAboutDetails
      profile {
        location {
          ...fullLocation
        }
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
    authorization {
      id
      myPrivileges
    }
    collaboration @include(if: $authorizedReadAccess) {
      id
      ...DashboardTopCallouts
      ...DashboardTimelineAuthorization
    }
    community @include(if: $authorizedReadAccessCommunity) {
      id
      authorization {
        id
        myPrivileges
      }
      roleSet {
        id
        myMembershipStatus
        leadUsers: usersInRole(role: LEAD) {
          ...RoleSetMemberUser
        }
        leadOrganizations: organizationsInRole(role: LEAD) {
          ...RoleSetMemberOrganization
        }
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
  ${FullLocationFragmentDoc}
  ${ContributorDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${DashboardTimelineAuthorizationFragmentDoc}
  ${RoleSetMemberUserFragmentDoc}
  ${RoleSetMemberOrganizationFragmentDoc}
`;
export const SubspaceCardFragmentDoc = gql`
  fragment SubspaceCard on Space {
    id
    metrics {
      id
      name
      value
    }
    about {
      ...SpaceAboutCardBanner
      why
    }
    community {
      id
      roleSet {
        id
        myMembershipStatus
      }
    }
    settings {
      privacy {
        mode
      }
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
    }
  }
`;
export const MyMembershipsRoleSetFragmentDoc = gql`
  fragment MyMembershipsRoleSet on RoleSet {
    id
    myMembershipStatus
    myRoles
  }
`;
export const SubspacePendingMembershipInfoFragmentDoc = gql`
  fragment SubspacePendingMembershipInfo on Space {
    id
    level
    about {
      ...SpaceAboutDetails
      authorization {
        id
        myPrivileges
      }
    }
    community {
      id
      authorization {
        id
        myPrivileges
      }
      roleSet {
        ...MyMembershipsRoleSet
      }
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
  ${MyMembershipsRoleSetFragmentDoc}
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
      avatar: visual(type: AVATAR) {
        ...VisualUri
      }
      cardBanner: visual(type: CARD) {
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
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
    }
    metrics {
      id
      name
      value
    }
    community @include(if: $authorizedReadAccessCommunity) {
      id
      authorization {
        id
        myPrivileges
      }
      roleSet {
        id
        myMembershipStatus
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
export const AdminSpaceFragmentDoc = gql`
  fragment AdminSpace on Space {
    id
    nameID
    visibility
    subscriptions {
      name
    }
    provider {
      id
      profile {
        id
        displayName
      }
    }
    about {
      ...SpaceAboutLight
    }
    authorization {
      id
      myPrivileges
    }
  }
  ${SpaceAboutLightFragmentDoc}
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
      endpoint
    }
  }
`;
export const MetricsItemFragmentDoc = gql`
  fragment MetricsItem on NVP {
    id
    name
    value
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
        ...VisualUri
      }
    }
  }
  ${VisualUriFragmentDoc}
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
export const CalloutTemplateContentFragmentDoc = gql`
  fragment CalloutTemplateContent on Callout {
    id
    type
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
        storageBucket {
          id
        }
      }
      whiteboard {
        ...WhiteboardDetails
        content
      }
    }
    contributionPolicy {
      id
      state
    }
    contributionDefaults {
      id
      postDescription
      whiteboardContent
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
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
export const CollaborationTemplateContentFragmentDoc = gql`
  fragment CollaborationTemplateContent on Collaboration {
    id
    innovationFlow {
      id
      states {
        displayName
        description
      }
    }
    calloutsSet {
      id
      callouts {
        id
        type
        framing {
          id
          profile {
            id
            displayName
            description
            flowStateTagset: tagset(tagsetName: FLOW_STATE) {
              tags
            }
          }
          whiteboard {
            id
            profile {
              preview: visual(type: BANNER) {
                ...VisualFull
              }
            }
          }
        }
        sortOrder
      }
    }
  }
  ${VisualFullFragmentDoc}
`;
export const WhiteboardTemplateContentFragmentDoc = gql`
  fragment WhiteboardTemplateContent on Whiteboard {
    id
    profile {
      id
      displayName
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
        ...VisualFull
      }
      url
    }
    type
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
`;
export const CalloutTemplateFragmentDoc = gql`
  fragment CalloutTemplate on Template {
    ...TemplateProfileInfo
    callout {
      id
      type
      contributionPolicy {
        id
        allowedContributionTypes
        state
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
export const CollaborationTemplateFragmentDoc = gql`
  fragment CollaborationTemplate on Template {
    ...TemplateProfileInfo
    collaboration {
      id
      innovationFlow {
        id
        states {
          displayName
          description
        }
      }
    }
  }
  ${TemplateProfileInfoFragmentDoc}
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
    collaborationTemplates {
      ...CollaborationTemplate
    }
  }
  ${CalloutTemplateFragmentDoc}
  ${PostTemplateFragmentDoc}
  ${WhiteboardTemplateFragmentDoc}
  ${CommunityGuidelinesTemplateFragmentDoc}
  ${CollaborationTemplateFragmentDoc}
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
export const InAppNotificationCalloutPublishedFragmentDoc = gql`
  fragment InAppNotificationCalloutPublished on InAppNotificationCalloutPublished {
    callout {
      id
      type
      framing {
        id
        profile {
          id
          displayName
          url
          visual(type: CARD) {
            ...VisualUri
          }
        }
      }
    }
    space {
      id
      level
      about {
        ...SpaceAboutCardBanner
      }
    }
    triggeredBy {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const InAppNotificationCommunityNewMemberFragmentDoc = gql`
  fragment InAppNotificationCommunityNewMember on InAppNotificationCommunityNewMember {
    triggeredBy {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualUri
        }
      }
    }
    space {
      id
      level
      about {
        ...SpaceAboutCardBanner
      }
    }
    actor {
      id
      __typename
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${SpaceAboutCardBannerFragmentDoc}
`;
export const InAppNotificationUserMentionedFragmentDoc = gql`
  fragment InAppNotificationUserMentioned on InAppNotificationUserMentioned {
    triggeredBy {
      id
      profile {
        id
        displayName
        url
        visual(type: AVATAR) {
          ...VisualUri
        }
      }
    }
    commentUrl
    comment
    commentOriginName
    contributorType
  }
  ${VisualUriFragmentDoc}
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
      settings {
        privacy {
          mode
        }
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
    url
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
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
      type
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
      contributionPolicy {
        id
        state
        allowedContributionTypes
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
      settings {
        privacy {
          mode
        }
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
            ...VisualUri
          }
        }
      }
      community {
        id
        roleSet {
          id
          myMembershipStatus
        }
      }
      settings {
        privacy {
          mode
        }
      }
      visibility
    }
  }
  ${SpaceAboutLightFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
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
export const WhiteboardContentFragmentDoc = gql`
  fragment WhiteboardContent on Whiteboard {
    id
    content
  }
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
      postDefaultDescription
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
    calloutTemplates {
      id
      type
      profile {
        ...TemplateCardProfileInfo
      }
      callout {
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
      }
    }
    calloutTemplatesCount
    communityGuidelinesTemplates {
      id
      profile {
        id
        displayName
        description
        tagset {
          ...TagsetDetails
        }
      }
      communityGuidelines {
        id
        profile {
          displayName
          description
          references {
            ...ReferenceDetails
          }
        }
      }
    }
    collaborationTemplatesCount
    collaborationTemplates {
      id
      profile {
        id
        displayName
        description
        tagset {
          ...TagsetDetails
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
        }
        calloutsSet {
          id
          callouts {
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
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${TemplateCardProfileInfoFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${WhiteboardContentFragmentDoc}
`;
export const DashboardSpaceMembershipFragmentDoc = gql`
  fragment DashboardSpaceMembership on Space {
    id
    level
    about {
      ...SpaceAboutCardBanner
      profile {
        spaceBanner: visual(type: BANNER) {
          ...VisualUri
        }
      }
    }
    settings {
      privacy {
        mode
      }
    }
    authorization {
      id
      myPrivileges
    }
    community {
      roleSet {
        id
        ...MyMembershipsRoleSet
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualUriFragmentDoc}
  ${MyMembershipsRoleSetFragmentDoc}
`;
export const ExploreSpacesFragmentDoc = gql`
  fragment ExploreSpaces on Space {
    id
    type
    about {
      id
      profile {
        id
        url
        displayName
        cardBanner: visual(type: CARD) {
          ...VisualUri
        }
      }
    }
    settings {
      privacy {
        mode
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export const ExploreSpacesSearchFragmentDoc = gql`
  fragment ExploreSpacesSearch on SearchResultSpace {
    space {
      ...ExploreSpaces
    }
  }
  ${ExploreSpacesFragmentDoc}
`;
export const SpaceMembershipFragmentDoc = gql`
  fragment SpaceMembership on Space {
    id
    level
    authorization {
      id
      myPrivileges
    }
    community {
      roleSet {
        id
        ...MyMembershipsRoleSet
      }
    }
    about {
      ...SpaceAboutCardBanner
    }
  }
  ${MyMembershipsRoleSetFragmentDoc}
  ${SpaceAboutCardBannerFragmentDoc}
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
export const ShortAccountItemFragmentDoc = gql`
  fragment ShortAccountItem on Profile {
    id
    displayName
    url
    avatar: visual(type: AVATAR) {
      ...VisualUri
    }
  }
  ${VisualUriFragmentDoc}
`;
export const SpaceProfileCommunityDetailsFragmentDoc = gql`
  fragment spaceProfileCommunityDetails on Space {
    id
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
    type
    level
    about {
      why
      ...SpaceAboutCardBanner
    }
    visibility
    community {
      id
      roleSet {
        id
        myMembershipStatus
      }
    }
    settings {
      privacy {
        mode
      }
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
    type
    level
    about {
      ...SpaceAboutCardBanner
      why
      profile {
        avatar: visual(type: AVATAR) {
          ...VisualUri
        }
      }
    }
    community {
      id
      roleSet {
        id
        myMembershipStatus
      }
    }
    settings {
      privacy {
        mode
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualUriFragmentDoc}
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
  >
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

export type DefaultVisualTypeConstraintsQueryHookResult = ReturnType<typeof useDefaultVisualTypeConstraintsQuery>;
export type DefaultVisualTypeConstraintsLazyQueryHookResult = ReturnType<
  typeof useDefaultVisualTypeConstraintsLazyQuery
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

export const AdminInnovationPacksListDocument = gql`
  query AdminInnovationPacksList {
    platform {
      id
      library {
        id
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
export const InviteContributorsEntryRoleOnRoleSetDocument = gql`
  mutation InviteContributorsEntryRoleOnRoleSet(
    $contributorIds: [UUID!]!
    $roleSetId: UUID!
    $message: String
    $extraRole: RoleName
  ) {
    inviteContributorsEntryRoleOnRoleSet(
      invitationData: {
        invitedContributors: $contributorIds
        roleSetID: $roleSetId
        welcomeMessage: $message
        extraRole: $extraRole
      }
    ) {
      id
    }
  }
`;
export type InviteContributorsEntryRoleOnRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutation,
  SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutationVariables
>;

/**
 * __useInviteContributorsEntryRoleOnRoleSetMutation__
 *
 * To run a mutation, you first call `useInviteContributorsEntryRoleOnRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteContributorsEntryRoleOnRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteContributorsEntryRoleOnRoleSetMutation, { data, loading, error }] = useInviteContributorsEntryRoleOnRoleSetMutation({
 *   variables: {
 *      contributorIds: // value for 'contributorIds'
 *      roleSetId: // value for 'roleSetId'
 *      message: // value for 'message'
 *      extraRole: // value for 'extraRole'
 *   },
 * });
 */
export function useInviteContributorsEntryRoleOnRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutation,
    SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutation,
    SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutationVariables
  >(InviteContributorsEntryRoleOnRoleSetDocument, options);
}

export type InviteContributorsEntryRoleOnRoleSetMutationHookResult = ReturnType<
  typeof useInviteContributorsEntryRoleOnRoleSetMutation
>;
export type InviteContributorsEntryRoleOnRoleSetMutationResult =
  Apollo.MutationResult<SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutation>;
export type InviteContributorsEntryRoleOnRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutation,
  SchemaTypes.InviteContributorsEntryRoleOnRoleSetMutationVariables
>;
export const InviteUserToPlatformAndRoleSetDocument = gql`
  mutation InviteUserToPlatformAndRoleSet($email: String!, $roleSetId: UUID!, $message: String, $extraRole: RoleName) {
    inviteUserToPlatformAndRoleSet(
      invitationData: { email: $email, roleSetID: $roleSetId, welcomeMessage: $message, roleSetExtraRole: $extraRole }
    ) {
      ... on PlatformInvitation {
        id
      }
    }
  }
`;
export type InviteUserToPlatformAndRoleSetMutationFn = Apollo.MutationFunction<
  SchemaTypes.InviteUserToPlatformAndRoleSetMutation,
  SchemaTypes.InviteUserToPlatformAndRoleSetMutationVariables
>;

/**
 * __useInviteUserToPlatformAndRoleSetMutation__
 *
 * To run a mutation, you first call `useInviteUserToPlatformAndRoleSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteUserToPlatformAndRoleSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteUserToPlatformAndRoleSetMutation, { data, loading, error }] = useInviteUserToPlatformAndRoleSetMutation({
 *   variables: {
 *      email: // value for 'email'
 *      roleSetId: // value for 'roleSetId'
 *      message: // value for 'message'
 *      extraRole: // value for 'extraRole'
 *   },
 * });
 */
export function useInviteUserToPlatformAndRoleSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.InviteUserToPlatformAndRoleSetMutation,
    SchemaTypes.InviteUserToPlatformAndRoleSetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.InviteUserToPlatformAndRoleSetMutation,
    SchemaTypes.InviteUserToPlatformAndRoleSetMutationVariables
  >(InviteUserToPlatformAndRoleSetDocument, options);
}

export type InviteUserToPlatformAndRoleSetMutationHookResult = ReturnType<
  typeof useInviteUserToPlatformAndRoleSetMutation
>;
export type InviteUserToPlatformAndRoleSetMutationResult =
  Apollo.MutationResult<SchemaTypes.InviteUserToPlatformAndRoleSetMutation>;
export type InviteUserToPlatformAndRoleSetMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.InviteUserToPlatformAndRoleSetMutation,
  SchemaTypes.InviteUserToPlatformAndRoleSetMutationVariables
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

export type UserPendingMembershipsQueryHookResult = ReturnType<typeof useUserPendingMembershipsQuery>;
export type UserPendingMembershipsLazyQueryHookResult = ReturnType<typeof useUserPendingMembershipsLazyQuery>;
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
  >
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

export type PlatformRoleAvailableUsersQueryHookResult = ReturnType<typeof usePlatformRoleAvailableUsersQuery>;
export type PlatformRoleAvailableUsersLazyQueryHookResult = ReturnType<typeof usePlatformRoleAvailableUsersLazyQuery>;
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
  >
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

export type AvailableUsersForEntryRoleQueryHookResult = ReturnType<typeof useAvailableUsersForEntryRoleQuery>;
export type AvailableUsersForEntryRoleLazyQueryHookResult = ReturnType<typeof useAvailableUsersForEntryRoleLazyQuery>;
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
  >
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

export type AvailableUsersForElevatedRoleQueryHookResult = ReturnType<typeof useAvailableUsersForElevatedRoleQuery>;
export type AvailableUsersForElevatedRoleLazyQueryHookResult = ReturnType<
  typeof useAvailableUsersForElevatedRoleLazyQuery
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
  >
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

export type AvailableOrganizationsQueryHookResult = ReturnType<typeof useAvailableOrganizationsQuery>;
export type AvailableOrganizationsLazyQueryHookResult = ReturnType<typeof useAvailableOrganizationsLazyQuery>;
export type AvailableOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableOrganizationsQuery,
  SchemaTypes.AvailableOrganizationsQueryVariables
>;
export function refetchAvailableOrganizationsQuery(variables: SchemaTypes.AvailableOrganizationsQueryVariables) {
  return { query: AvailableOrganizationsDocument, variables: variables };
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

export type AvailableVirtualContributorsInLibraryQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInLibraryQuery
>;
export type AvailableVirtualContributorsInLibraryLazyQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsInLibraryLazyQuery
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

export const AvailableVirtualContributorsDocument = gql`
  query AvailableVirtualContributors(
    $filterSpace: Boolean = false
    $filterSpaceId: UUID = "00000000-0000-0000-0000-000000000000"
  ) {
    lookup @include(if: $filterSpace) {
      space(ID: $filterSpaceId) {
        id
        community {
          id
          roleSet {
            id
            virtualContributorsInRole(role: MEMBER) {
              ...VirtualContributorFull
            }
          }
        }
        account {
          id
          virtualContributors {
            ...VirtualContributorFull
          }
        }
      }
    }
    virtualContributors @skip(if: $filterSpace) {
      ...VirtualContributorFull
    }
  }
  ${VirtualContributorFullFragmentDoc}
`;

/**
 * __useAvailableVirtualContributorsQuery__
 *
 * To run a query within a React component, call `useAvailableVirtualContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableVirtualContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableVirtualContributorsQuery({
 *   variables: {
 *      filterSpace: // value for 'filterSpace'
 *      filterSpaceId: // value for 'filterSpaceId'
 *   },
 * });
 */
export function useAvailableVirtualContributorsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsQuery,
    SchemaTypes.AvailableVirtualContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.AvailableVirtualContributorsQuery,
    SchemaTypes.AvailableVirtualContributorsQueryVariables
  >(AvailableVirtualContributorsDocument, options);
}

export function useAvailableVirtualContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AvailableVirtualContributorsQuery,
    SchemaTypes.AvailableVirtualContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AvailableVirtualContributorsQuery,
    SchemaTypes.AvailableVirtualContributorsQueryVariables
  >(AvailableVirtualContributorsDocument, options);
}

export type AvailableVirtualContributorsQueryHookResult = ReturnType<typeof useAvailableVirtualContributorsQuery>;
export type AvailableVirtualContributorsLazyQueryHookResult = ReturnType<
  typeof useAvailableVirtualContributorsLazyQuery
>;
export type AvailableVirtualContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.AvailableVirtualContributorsQuery,
  SchemaTypes.AvailableVirtualContributorsQueryVariables
>;
export function refetchAvailableVirtualContributorsQuery(
  variables?: SchemaTypes.AvailableVirtualContributorsQueryVariables
) {
  return { query: AvailableVirtualContributorsDocument, variables: variables };
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
export const CommunityVirtualMembersListDocument = gql`
  query CommunityVirtualMembersList(
    $roleSetId: UUID!
    $spaceId: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSpaceHost: Boolean = false
  ) {
    lookup {
      space(ID: $spaceId) @include(if: $includeSpaceHost) {
        id
        provider {
          ...ContributorDetails
        }
      }
      roleSet(ID: $roleSetId) {
        authorization {
          id
          myPrivileges
        }
        memberVirtualContributors: virtualContributorsInRole(role: MEMBER) {
          ...RoleSetMemberVirtualContributor
        }
      }
    }
  }
  ${ContributorDetailsFragmentDoc}
  ${RoleSetMemberVirtualContributorFragmentDoc}
`;

/**
 * __useCommunityVirtualMembersListQuery__
 *
 * To run a query within a React component, call `useCommunityVirtualMembersListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityVirtualMembersListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityVirtualMembersListQuery({
 *   variables: {
 *      roleSetId: // value for 'roleSetId'
 *      spaceId: // value for 'spaceId'
 *      includeSpaceHost: // value for 'includeSpaceHost'
 *   },
 * });
 */
export function useCommunityVirtualMembersListQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityVirtualMembersListQuery,
    SchemaTypes.CommunityVirtualMembersListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CommunityVirtualMembersListQuery,
    SchemaTypes.CommunityVirtualMembersListQueryVariables
  >(CommunityVirtualMembersListDocument, options);
}

export function useCommunityVirtualMembersListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityVirtualMembersListQuery,
    SchemaTypes.CommunityVirtualMembersListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityVirtualMembersListQuery,
    SchemaTypes.CommunityVirtualMembersListQueryVariables
  >(CommunityVirtualMembersListDocument, options);
}

export type CommunityVirtualMembersListQueryHookResult = ReturnType<typeof useCommunityVirtualMembersListQuery>;
export type CommunityVirtualMembersListLazyQueryHookResult = ReturnType<typeof useCommunityVirtualMembersListLazyQuery>;
export type CommunityVirtualMembersListQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityVirtualMembersListQuery,
  SchemaTypes.CommunityVirtualMembersListQueryVariables
>;
export function refetchCommunityVirtualMembersListQuery(
  variables: SchemaTypes.CommunityVirtualMembersListQueryVariables
) {
  return { query: CommunityVirtualMembersListDocument, variables: variables };
}

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
  >
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

export type RoleSetAuthorizationQueryHookResult = ReturnType<typeof useRoleSetAuthorizationQuery>;
export type RoleSetAuthorizationLazyQueryHookResult = ReturnType<typeof useRoleSetAuthorizationLazyQuery>;
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
  >
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

export type RoleSetRoleAssignmentQueryHookResult = ReturnType<typeof useRoleSetRoleAssignmentQuery>;
export type RoleSetRoleAssignmentLazyQueryHookResult = ReturnType<typeof useRoleSetRoleAssignmentLazyQuery>;
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
  >
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

export type SubspaceCommunityAndRoleSetIdQueryHookResult = ReturnType<typeof useSubspaceCommunityAndRoleSetIdQuery>;
export type SubspaceCommunityAndRoleSetIdLazyQueryHookResult = ReturnType<
  typeof useSubspaceCommunityAndRoleSetIdLazyQuery
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
          about {
            id
            profile {
              id
              displayName
              url
              cardBanner: visual(type: CARD) {
                ...VisualUri
              }
              tagline
            }
          }
          license {
            id
            entitlements {
              ...EntitlementDetails
            }
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
            collaborationTemplatesCount
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
              ...VisualUri
            }
          }
          spaceVisibilityFilter
          spaceListFilter {
            id
            about {
              ...SpaceAboutLight
            }
          }
          subdomain
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${EntitlementDetailsFragmentDoc}
  ${AccountItemProfileFragmentDoc}
  ${SpaceAboutLightFragmentDoc}
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
  >
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

export type AccountInformationQueryHookResult = ReturnType<typeof useAccountInformationQuery>;
export type AccountInformationLazyQueryHookResult = ReturnType<typeof useAccountInformationLazyQuery>;
export type AccountInformationQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountInformationQuery,
  SchemaTypes.AccountInformationQueryVariables
>;
export function refetchAccountInformationQuery(variables: SchemaTypes.AccountInformationQueryVariables) {
  return { query: AccountInformationDocument, variables: variables };
}

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

export const InnovationFlowSettingsDocument = gql`
  query InnovationFlowSettings($collaborationId: UUID!, $filterCalloutGroups: [String!]) {
    lookup {
      collaboration(ID: $collaborationId) {
        ...InnovationFlowCollaboration
        innovationFlow {
          ...InnovationFlowDetails
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
 *      filterCalloutGroups: // value for 'filterCalloutGroups'
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
export const UpdateCollaborationFromTemplateDocument = gql`
  mutation UpdateCollaborationFromTemplate(
    $collaborationId: UUID!
    $collaborationTemplateId: UUID!
    $addCallouts: Boolean
  ) {
    updateCollaborationFromTemplate(
      updateData: {
        collaborationID: $collaborationId
        collaborationTemplateID: $collaborationTemplateId
        addCallouts: $addCallouts
      }
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
export type UpdateCollaborationFromTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCollaborationFromTemplateMutation,
  SchemaTypes.UpdateCollaborationFromTemplateMutationVariables
>;

/**
 * __useUpdateCollaborationFromTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateCollaborationFromTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCollaborationFromTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCollaborationFromTemplateMutation, { data, loading, error }] = useUpdateCollaborationFromTemplateMutation({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *      collaborationTemplateId: // value for 'collaborationTemplateId'
 *      addCallouts: // value for 'addCallouts'
 *   },
 * });
 */
export function useUpdateCollaborationFromTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateCollaborationFromTemplateMutation,
    SchemaTypes.UpdateCollaborationFromTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateCollaborationFromTemplateMutation,
    SchemaTypes.UpdateCollaborationFromTemplateMutationVariables
  >(UpdateCollaborationFromTemplateDocument, options);
}

export type UpdateCollaborationFromTemplateMutationHookResult = ReturnType<
  typeof useUpdateCollaborationFromTemplateMutation
>;
export type UpdateCollaborationFromTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateCollaborationFromTemplateMutation>;
export type UpdateCollaborationFromTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCollaborationFromTemplateMutation,
  SchemaTypes.UpdateCollaborationFromTemplateMutationVariables
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
export const UpdateInnovationFlowDocument = gql`
  mutation updateInnovationFlow($input: UpdateInnovationFlowEntityInput!) {
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
      journeyDisplayName: parentDisplayName
      space {
        id
        ... on Space {
          about {
            ...SpaceAboutCardBanner
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
  ${SpaceAboutCardBannerFragmentDoc}
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

export const CollaborationAuthorizationEntitlementsDocument = gql`
  query CollaborationAuthorizationEntitlements($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        id
        authorization {
          id
          myPrivileges
        }
        license {
          id
          availableEntitlements
        }
        calloutsSet {
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
 * __useCollaborationAuthorizationEntitlementsQuery__
 *
 * To run a query within a React component, call `useCollaborationAuthorizationEntitlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollaborationAuthorizationEntitlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollaborationAuthorizationEntitlementsQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useCollaborationAuthorizationEntitlementsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CollaborationAuthorizationEntitlementsQuery,
    SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CollaborationAuthorizationEntitlementsQuery,
    SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
  >(CollaborationAuthorizationEntitlementsDocument, options);
}

export function useCollaborationAuthorizationEntitlementsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CollaborationAuthorizationEntitlementsQuery,
    SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CollaborationAuthorizationEntitlementsQuery,
    SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
  >(CollaborationAuthorizationEntitlementsDocument, options);
}

export type CollaborationAuthorizationEntitlementsQueryHookResult = ReturnType<
  typeof useCollaborationAuthorizationEntitlementsQuery
>;
export type CollaborationAuthorizationEntitlementsLazyQueryHookResult = ReturnType<
  typeof useCollaborationAuthorizationEntitlementsLazyQuery
>;
export type CollaborationAuthorizationEntitlementsQueryResult = Apollo.QueryResult<
  SchemaTypes.CollaborationAuthorizationEntitlementsQuery,
  SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
>;
export function refetchCollaborationAuthorizationEntitlementsQuery(
  variables: SchemaTypes.CollaborationAuthorizationEntitlementsQueryVariables
) {
  return { query: CollaborationAuthorizationEntitlementsDocument, variables: variables };
}

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
export const UpdateCalloutDocument = gql`
  mutation UpdateCallout($calloutData: UpdateCalloutEntityInput!) {
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
        whiteboard {
          id
          content
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
      contributionID
      sortOrder
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
          id
          sortOrder
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

export const CreatePostFromContributeTabDocument = gql`
  mutation CreatePostFromContributeTab($postData: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $postData) {
      post {
        id
      }
    }
  }
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
export const CalloutWhiteboardsDocument = gql`
  query CalloutWhiteboards($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        contributions {
          id
          sortOrder
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
  >
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

export type CalloutsSetAuthorizationQueryHookResult = ReturnType<typeof useCalloutsSetAuthorizationQuery>;
export type CalloutsSetAuthorizationLazyQueryHookResult = ReturnType<typeof useCalloutsSetAuthorizationLazyQuery>;
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
export const CalloutsDocument = gql`
  query Callouts($calloutsSetId: UUID!, $groups: [String!], $calloutIds: [UUID!]) {
    lookup {
      calloutsSet(ID: $calloutsSetId) {
        id
        authorization {
          id
          myPrivileges
        }
        callouts(groups: $groups, IDs: $calloutIds) {
          ...Callout
        }
      }
    }
  }
  ${CalloutFragmentDoc}
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
 *      calloutsSetId: // value for 'calloutsSetId'
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

export const CalloutContentDocument = gql`
  query CalloutContent($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        type
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
          whiteboard {
            id
            profile {
              id
              displayName
            }
            content
          }
        }
        contributionDefaults {
          id
          postDescription
          whiteboardContent
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CalloutContentQuery, SchemaTypes.CalloutContentQueryVariables>
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

export type CalloutContentQueryHookResult = ReturnType<typeof useCalloutContentQuery>;
export type CalloutContentLazyQueryHookResult = ReturnType<typeof useCalloutContentLazyQuery>;
export type CalloutContentQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutContentQuery,
  SchemaTypes.CalloutContentQueryVariables
>;
export function refetchCalloutContentQuery(variables: SchemaTypes.CalloutContentQueryVariables) {
  return { query: CalloutContentDocument, variables: variables };
}

export const PostDocument = gql`
  query Post($postId: UUID!) {
    lookup {
      post(ID: $postId) {
        id
        createdDate
        authorization {
          id
          myPrivileges
        }
        profile {
          id
          displayName
          description
          url
          tagset {
            ...TagsetDetails
          }
          references {
            ...ReferenceDetails
          }
          banner: visual(type: BANNER) {
            ...VisualUri
          }
        }
        createdBy {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              ...VisualUri
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
          vcInteractions {
            id
            threadID
            virtualContributorID
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
  ${MessageDetailsFragmentDoc}
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
 *      postId: // value for 'postId'
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

export const PostCalloutsInCalloutSetDocument = gql`
  query PostCalloutsInCalloutSet($calloutsSetId: UUID!) {
    lookup {
      calloutsSet(ID: $calloutsSetId) {
        id
        callouts(types: [POST_COLLECTION]) {
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
  >
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

export type PostCalloutsInCalloutSetQueryHookResult = ReturnType<typeof usePostCalloutsInCalloutSetQuery>;
export type PostCalloutsInCalloutSetLazyQueryHookResult = ReturnType<typeof usePostCalloutsInCalloutSetLazyQuery>;
export type PostCalloutsInCalloutSetQueryResult = Apollo.QueryResult<
  SchemaTypes.PostCalloutsInCalloutSetQuery,
  SchemaTypes.PostCalloutsInCalloutSetQueryVariables
>;
export function refetchPostCalloutsInCalloutSetQuery(variables: SchemaTypes.PostCalloutsInCalloutSetQueryVariables) {
  return { query: PostCalloutsInCalloutSetDocument, variables: variables };
}

export const WhiteboardFromCalloutDocument = gql`
  query WhiteboardFromCallout($calloutId: UUID!, $contributionId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        type
        authorization {
          id
          myPrivileges
        }
        framing {
          id
          whiteboard {
            ...WhiteboardDetails
          }
        }
        contributions(IDs: [$contributionId]) {
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

export const WhiteboardWithoutContentDocument = gql`
  query WhiteboardWithoutContent($whiteboardId: UUID!) {
    lookup {
      whiteboard(ID: $whiteboardId) {
        ...WhiteboardDetails
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
`;

/**
 * __useWhiteboardWithoutContentQuery__
 *
 * To run a query within a React component, call `useWhiteboardWithoutContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardWithoutContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardWithoutContentQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardWithoutContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardWithoutContentQuery,
    SchemaTypes.WhiteboardWithoutContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardWithoutContentQuery, SchemaTypes.WhiteboardWithoutContentQueryVariables>(
    WhiteboardWithoutContentDocument,
    options
  );
}

export function useWhiteboardWithoutContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardWithoutContentQuery,
    SchemaTypes.WhiteboardWithoutContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardWithoutContentQuery,
    SchemaTypes.WhiteboardWithoutContentQueryVariables
  >(WhiteboardWithoutContentDocument, options);
}

export type WhiteboardWithoutContentQueryHookResult = ReturnType<typeof useWhiteboardWithoutContentQuery>;
export type WhiteboardWithoutContentLazyQueryHookResult = ReturnType<typeof useWhiteboardWithoutContentLazyQuery>;
export type WhiteboardWithoutContentQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardWithoutContentQuery,
  SchemaTypes.WhiteboardWithoutContentQueryVariables
>;
export function refetchWhiteboardWithoutContentQuery(variables: SchemaTypes.WhiteboardWithoutContentQueryVariables) {
  return { query: WhiteboardWithoutContentDocument, variables: variables };
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
      id
      firstName
      lastName
      isContactable
      profile {
        id
        url
        displayName
        location {
          id
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
  >
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
export const MentionableUsersDocument = gql`
  query MentionableUsers(
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
            ...VisualUri
          }
        }
      }
    }
    lookup @include(if: $includeVirtualContributors) {
      roleSet(ID: $roleSetId) {
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
 *      roleSetId: // value for 'roleSetId'
 *      includeVirtualContributors: // value for 'includeVirtualContributors'
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

export const CommunityUserPrivilegesDocument = gql`
  query CommunityUserPrivileges(
    $spaceId: UUID!
    $parentSpaceId: UUID! = "00000000-0000-0000-0000-000000000000"
    $includeParentSpace: Boolean! = false
  ) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimalUrl
        }
        community {
          id
          authorization {
            id
            myPrivileges
          }
          roleSet {
            id
            myMembershipStatus
            authorization {
              id
              myPrivileges
            }
          }
        }
      }
    }
    parentSpace: lookup @include(if: $includeParentSpace) {
      space(ID: $parentSpaceId) {
        id
        about {
          ...SpaceAboutMinimalUrl
        }
        community {
          id
          authorization {
            id
            myPrivileges
          }
          roleSet {
            id
            myMembershipStatus
            authorization {
              id
              myPrivileges
            }
          }
        }
      }
    }
  }
  ${SpaceAboutMinimalUrlFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
 *      parentSpaceId: // value for 'parentSpaceId'
 *      includeParentSpace: // value for 'includeParentSpace'
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

export const SpaceApplicationDocument = gql`
  query SpaceApplication($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimalUrl
        }
        community {
          id
          roleSet {
            id
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

export const CommunityProviderDetailsDocument = gql`
  query CommunityProviderDetails($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        provider {
          ...RoleSetMemberOrganization
        }
      }
    }
  }
  ${RoleSetMemberOrganizationFragmentDoc}
`;

/**
 * __useCommunityProviderDetailsQuery__
 *
 * To run a query within a React component, call `useCommunityProviderDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityProviderDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityProviderDetailsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useCommunityProviderDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CommunityProviderDetailsQuery,
    SchemaTypes.CommunityProviderDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CommunityProviderDetailsQuery, SchemaTypes.CommunityProviderDetailsQueryVariables>(
    CommunityProviderDetailsDocument,
    options
  );
}

export function useCommunityProviderDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CommunityProviderDetailsQuery,
    SchemaTypes.CommunityProviderDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CommunityProviderDetailsQuery,
    SchemaTypes.CommunityProviderDetailsQueryVariables
  >(CommunityProviderDetailsDocument, options);
}

export type CommunityProviderDetailsQueryHookResult = ReturnType<typeof useCommunityProviderDetailsQuery>;
export type CommunityProviderDetailsLazyQueryHookResult = ReturnType<typeof useCommunityProviderDetailsLazyQuery>;
export type CommunityProviderDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CommunityProviderDetailsQuery,
  SchemaTypes.CommunityProviderDetailsQueryVariables
>;
export function refetchCommunityProviderDetailsQuery(variables: SchemaTypes.CommunityProviderDetailsQueryVariables) {
  return { query: CommunityProviderDetailsDocument, variables: variables };
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
  >
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

export type RoleSetApplicationFormQueryHookResult = ReturnType<typeof useRoleSetApplicationFormQuery>;
export type RoleSetApplicationFormLazyQueryHookResult = ReturnType<typeof useRoleSetApplicationFormLazyQuery>;
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
              ...VisualUri
            }
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
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

export type ContributorsVirtualInLibraryQueryHookResult = ReturnType<typeof useContributorsVirtualInLibraryQuery>;
export type ContributorsVirtualInLibraryLazyQueryHookResult = ReturnType<
  typeof useContributorsVirtualInLibraryLazyQuery
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
    }
  }
  ${VisualUriFragmentDoc}
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
  >
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

export type OrganizationAuthorizationQueryHookResult = ReturnType<typeof useOrganizationAuthorizationQuery>;
export type OrganizationAuthorizationLazyQueryHookResult = ReturnType<typeof useOrganizationAuthorizationLazyQuery>;
export type OrganizationAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationAuthorizationQuery,
  SchemaTypes.OrganizationAuthorizationQueryVariables
>;
export function refetchOrganizationAuthorizationQuery(variables: SchemaTypes.OrganizationAuthorizationQueryVariables) {
  return { query: OrganizationAuthorizationDocument, variables: variables };
}

export const OrganizationProfileInfoDocument = gql`
  query organizationProfileInfo($id: UUID!) {
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
                ...VisualUri
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
            collaborationTemplatesCount
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
              ...VisualUri
            }
          }
          spaceVisibilityFilter
          spaceListFilter {
            id
            about {
              ...SpaceAboutLight
            }
          }
          subdomain
        }
      }
    }
  }
  ${AccountResourceProfileFragmentDoc}
  ${VisualUriFragmentDoc}
  ${SpaceAboutLightFragmentDoc}
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
  >
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

export type AccountResourcesInfoQueryHookResult = ReturnType<typeof useAccountResourcesInfoQuery>;
export type AccountResourcesInfoLazyQueryHookResult = ReturnType<typeof useAccountResourcesInfoLazyQuery>;
export type AccountResourcesInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountResourcesInfoQuery,
  SchemaTypes.AccountResourcesInfoQueryVariables
>;
export function refetchAccountResourcesInfoQuery(variables: SchemaTypes.AccountResourcesInfoQueryVariables) {
  return { query: AccountResourcesInfoDocument, variables: variables };
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
  >
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

export type OrganizationAccountQueryHookResult = ReturnType<typeof useOrganizationAccountQuery>;
export type OrganizationAccountLazyQueryHookResult = ReturnType<typeof useOrganizationAccountLazyQuery>;
export type OrganizationAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationAccountQuery,
  SchemaTypes.OrganizationAccountQueryVariables
>;
export function refetchOrganizationAccountQuery(variables: SchemaTypes.OrganizationAccountQueryVariables) {
  return { query: OrganizationAccountDocument, variables: variables };
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
  >
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

export type OrganizationSettingsQueryHookResult = ReturnType<typeof useOrganizationSettingsQuery>;
export type OrganizationSettingsLazyQueryHookResult = ReturnType<typeof useOrganizationSettingsLazyQuery>;
export type OrganizationSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.OrganizationSettingsQuery,
  SchemaTypes.OrganizationSettingsQueryVariables
>;
export function refetchOrganizationSettingsQuery(variables: SchemaTypes.OrganizationSettingsQueryVariables) {
  return { query: OrganizationSettingsDocument, variables: variables };
}

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
export const UpdateOrganizationSettingsDocument = gql`
  mutation updateOrganizationSettings($settingsData: UpdateOrganizationSettingsInput!) {
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

export type PendingInvitationsCountQueryHookResult = ReturnType<typeof usePendingInvitationsCountQuery>;
export type PendingInvitationsCountLazyQueryHookResult = ReturnType<typeof usePendingInvitationsCountLazyQuery>;
export type PendingInvitationsCountQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingInvitationsCountQuery,
  SchemaTypes.PendingInvitationsCountQueryVariables
>;
export function refetchPendingInvitationsCountQuery(variables?: SchemaTypes.PendingInvitationsCountQueryVariables) {
  return { query: PendingInvitationsCountDocument, variables: variables };
}

export const PendingMembershipsSpaceDocument = gql`
  query PendingMembershipsSpace($spaceId: UUID!, $fetchCommunityGuidelines: Boolean! = false) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutCardBanner
          profile {
            avatar: visual(type: AVATAR) {
              ...VisualUri
            }
          }
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
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualUriFragmentDoc}
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
            visuals {
              ...VisualUri
            }
            tagset {
              ...TagsetDetails
            }
          }
        }
        community {
          id
          roleSet {
            id
          }
        }
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
export const UpdatePreferenceOnUserDocument = gql`
  mutation updatePreferenceOnUser($userId: UUID!, $type: PreferenceType!, $value: String!) {
    updatePreferenceOnUser(preferenceData: { userID: $userId, type: $type, value: $value }) {
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
 *      userId: // value for 'userId'
 *      type: // value for 'type'
 *      value: // value for 'value'
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserAccountQuery, SchemaTypes.UserAccountQueryVariables>
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

export type UserAccountQueryHookResult = ReturnType<typeof useUserAccountQuery>;
export type UserAccountLazyQueryHookResult = ReturnType<typeof useUserAccountLazyQuery>;
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
  query userNotificationsPreferences($userId: UUID!) {
    lookup {
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
  query userProfile($input: UUID!) {
    lookup {
      user(ID: $input) {
        isContactable
        ...UserDetails
      }
    }
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        displayName
        roles
        visibility
        subspaces {
          id
          displayName
          roles
        }
      }
      organizations {
        id
        displayName
        roles
      }
    }
    platform {
      authorization {
        ...MyPrivileges
      }
      roleSet {
        id
        myRoles
      }
    }
  }
  ${UserDetailsFragmentDoc}
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

export const UserProviderDocument = gql`
  query UserProvider {
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

export const UserContributionDisplayNamesDocument = gql`
  query UserContributionDisplayNames($userId: UUID!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        displayName
        subspaces {
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
  query UserContributions($userId: UUID!) {
    rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      spaces {
        id
        roles
        subspaces {
          id
          type
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
        privacy {
          contributionRolesPubliclyVisible
        }
        communication {
          allowOtherUsersToSendMessages
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
          communication {
            allowOtherUsersToSendMessages
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserSettingsQuery, SchemaTypes.UserSettingsQueryVariables>
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

export type UserSettingsQueryHookResult = ReturnType<typeof useUserSettingsQuery>;
export type UserSettingsLazyQueryHookResult = ReturnType<typeof useUserSettingsLazyQuery>;
export type UserSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserSettingsQuery,
  SchemaTypes.UserSettingsQueryVariables
>;
export function refetchUserSettingsQuery(variables: SchemaTypes.UserSettingsQueryVariables) {
  return { query: UserSettingsDocument, variables: variables };
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
              ...VisualFull
            }
            tagsets {
              id
              tags
            }
          }
        }
        searchVisibility
        listedInStore
        status
        aiPersona {
          id
          bodyOfKnowledgeID
          bodyOfKnowledgeType
          bodyOfKnowledge
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
            ...VisualFull
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
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
  >
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

export type VirtualContributorQueryHookResult = ReturnType<typeof useVirtualContributorQuery>;
export type VirtualContributorLazyQueryHookResult = ReturnType<typeof useVirtualContributorLazyQuery>;
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
            ...VisualFull
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
  ${VisualFullFragmentDoc}
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
  >
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

export type VirtualContributorProfileQueryHookResult = ReturnType<typeof useVirtualContributorProfileQuery>;
export type VirtualContributorProfileLazyQueryHookResult = ReturnType<typeof useVirtualContributorProfileLazyQuery>;
export type VirtualContributorProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.VirtualContributorProfileQuery,
  SchemaTypes.VirtualContributorProfileQueryVariables
>;
export function refetchVirtualContributorProfileQuery(variables: SchemaTypes.VirtualContributorProfileQueryVariables) {
  return { query: VirtualContributorProfileDocument, variables: variables };
}

export const BodyOfKnowledgeProfileAuthorizationDocument = gql`
  query BodyOfKnowledgeProfileAuthorization($spaceId: UUID!) {
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
 * __useBodyOfKnowledgeProfileAuthorizationQuery__
 *
 * To run a query within a React component, call `useBodyOfKnowledgeProfileAuthorizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useBodyOfKnowledgeProfileAuthorizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBodyOfKnowledgeProfileAuthorizationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useBodyOfKnowledgeProfileAuthorizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQuery,
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQuery,
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
  >(BodyOfKnowledgeProfileAuthorizationDocument, options);
}

export function useBodyOfKnowledgeProfileAuthorizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQuery,
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQuery,
    SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
  >(BodyOfKnowledgeProfileAuthorizationDocument, options);
}

export type BodyOfKnowledgeProfileAuthorizationQueryHookResult = ReturnType<
  typeof useBodyOfKnowledgeProfileAuthorizationQuery
>;
export type BodyOfKnowledgeProfileAuthorizationLazyQueryHookResult = ReturnType<
  typeof useBodyOfKnowledgeProfileAuthorizationLazyQuery
>;
export type BodyOfKnowledgeProfileAuthorizationQueryResult = Apollo.QueryResult<
  SchemaTypes.BodyOfKnowledgeProfileAuthorizationQuery,
  SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
>;
export function refetchBodyOfKnowledgeProfileAuthorizationQuery(
  variables: SchemaTypes.BodyOfKnowledgeProfileAuthorizationQueryVariables
) {
  return { query: BodyOfKnowledgeProfileAuthorizationDocument, variables: variables };
}

export const BodyOfKnowledgeProfileDocument = gql`
  query BodyOfKnowledgeProfile($spaceId: UUID!) {
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
 * __useBodyOfKnowledgeProfileQuery__
 *
 * To run a query within a React component, call `useBodyOfKnowledgeProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useBodyOfKnowledgeProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBodyOfKnowledgeProfileQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useBodyOfKnowledgeProfileQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.BodyOfKnowledgeProfileQuery,
    SchemaTypes.BodyOfKnowledgeProfileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.BodyOfKnowledgeProfileQuery, SchemaTypes.BodyOfKnowledgeProfileQueryVariables>(
    BodyOfKnowledgeProfileDocument,
    options
  );
}

export function useBodyOfKnowledgeProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.BodyOfKnowledgeProfileQuery,
    SchemaTypes.BodyOfKnowledgeProfileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.BodyOfKnowledgeProfileQuery, SchemaTypes.BodyOfKnowledgeProfileQueryVariables>(
    BodyOfKnowledgeProfileDocument,
    options
  );
}

export type BodyOfKnowledgeProfileQueryHookResult = ReturnType<typeof useBodyOfKnowledgeProfileQuery>;
export type BodyOfKnowledgeProfileLazyQueryHookResult = ReturnType<typeof useBodyOfKnowledgeProfileLazyQuery>;
export type BodyOfKnowledgeProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.BodyOfKnowledgeProfileQuery,
  SchemaTypes.BodyOfKnowledgeProfileQueryVariables
>;
export function refetchBodyOfKnowledgeProfileQuery(variables: SchemaTypes.BodyOfKnowledgeProfileQueryVariables) {
  return { query: BodyOfKnowledgeProfileDocument, variables: variables };
}

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
  >
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

export type VirtualContributorKnowledgeBaseQueryHookResult = ReturnType<typeof useVirtualContributorKnowledgeBaseQuery>;
export type VirtualContributorKnowledgeBaseLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgeBaseLazyQuery
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
  >
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

export type VirtualContributorKnowledgePrivilegesQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgePrivilegesQuery
>;
export type VirtualContributorKnowledgePrivilegesLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorKnowledgePrivilegesLazyQuery
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.VcMembershipsQuery, SchemaTypes.VcMembershipsQueryVariables>
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

export type VcMembershipsQueryHookResult = ReturnType<typeof useVcMembershipsQuery>;
export type VcMembershipsLazyQueryHookResult = ReturnType<typeof useVcMembershipsLazyQuery>;
export type VcMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.VcMembershipsQuery,
  SchemaTypes.VcMembershipsQueryVariables
>;
export function refetchVcMembershipsQuery(variables: SchemaTypes.VcMembershipsQueryVariables) {
  return { query: VcMembershipsDocument, variables: variables };
}

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
  >
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

export const AdminInnovationHubsListDocument = gql`
  query AdminInnovationHubsList {
    platform {
      id
      library {
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
  >
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

export type InnovationHubSettingsQueryHookResult = ReturnType<typeof useInnovationHubSettingsQuery>;
export type InnovationHubSettingsLazyQueryHookResult = ReturnType<typeof useInnovationHubSettingsLazyQuery>;
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

export type InnovationHubQueryHookResult = ReturnType<typeof useInnovationHubQuery>;
export type InnovationHubLazyQueryHookResult = ReturnType<typeof useInnovationHubLazyQuery>;
export type InnovationHubQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationHubQuery,
  SchemaTypes.InnovationHubQueryVariables
>;
export function refetchInnovationHubQuery(variables?: SchemaTypes.InnovationHubQueryVariables) {
  return { query: InnovationHubDocument, variables: variables };
}

export const ChildJourneyPageBannerDocument = gql`
  query ChildJourneyPageBanner($level0Space: UUID!, $spaceId: UUID!) {
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
        }
        community {
          id
          roleSet {
            id
            myMembershipStatus
          }
        }
      }
    }
  }
`;

/**
 * __useChildJourneyPageBannerQuery__
 *
 * To run a query within a React component, call `useChildJourneyPageBannerQuery` and pass it any options that fit your needs.
 * When your component renders, `useChildJourneyPageBannerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChildJourneyPageBannerQuery({
 *   variables: {
 *      level0Space: // value for 'level0Space'
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useChildJourneyPageBannerQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChildJourneyPageBannerQuery,
    SchemaTypes.ChildJourneyPageBannerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChildJourneyPageBannerQuery, SchemaTypes.ChildJourneyPageBannerQueryVariables>(
    ChildJourneyPageBannerDocument,
    options
  );
}

export function useChildJourneyPageBannerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChildJourneyPageBannerQuery,
    SchemaTypes.ChildJourneyPageBannerQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChildJourneyPageBannerQuery, SchemaTypes.ChildJourneyPageBannerQueryVariables>(
    ChildJourneyPageBannerDocument,
    options
  );
}

export type ChildJourneyPageBannerQueryHookResult = ReturnType<typeof useChildJourneyPageBannerQuery>;
export type ChildJourneyPageBannerLazyQueryHookResult = ReturnType<typeof useChildJourneyPageBannerLazyQuery>;
export type ChildJourneyPageBannerQueryResult = Apollo.QueryResult<
  SchemaTypes.ChildJourneyPageBannerQuery,
  SchemaTypes.ChildJourneyPageBannerQueryVariables
>;
export function refetchChildJourneyPageBannerQuery(variables: SchemaTypes.ChildJourneyPageBannerQueryVariables) {
  return { query: ChildJourneyPageBannerDocument, variables: variables };
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
  query JourneyBreadcrumbsSpace(
    $spaceId: UUID!
    $subspaceL1Id: UUID = "00000000-0000-0000-0000-000000000000"
    $subspaceL2Id: UUID = "00000000-0000-0000-0000-000000000000"
    $includeSubspaceL1: Boolean = false
    $includeSubspaceL2: Boolean = false
  ) {
    lookup {
      space(ID: $spaceId) {
        ...JourneyBreadcrumbsSpace
      }
      subspaceL1: space(ID: $subspaceL1Id) @include(if: $includeSubspaceL1) {
        ...JourneyBreadcrumbsSubpace
      }
      subspaceL2: space(ID: $subspaceL2Id) @include(if: $includeSubspaceL2) {
        ...JourneyBreadcrumbsSubpace
      }
    }
  }
  ${JourneyBreadcrumbsSpaceFragmentDoc}
  ${JourneyBreadcrumbsSubpaceFragmentDoc}
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
 *      subspaceL1Id: // value for 'subspaceL1Id'
 *      subspaceL2Id: // value for 'subspaceL2Id'
 *      includeSubspaceL1: // value for 'includeSubspaceL1'
 *      includeSubspaceL2: // value for 'includeSubspaceL2'
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePrivilegesQuery, SchemaTypes.SpacePrivilegesQueryVariables>
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

export type SpacePrivilegesQueryHookResult = ReturnType<typeof useSpacePrivilegesQuery>;
export type SpacePrivilegesLazyQueryHookResult = ReturnType<typeof useSpacePrivilegesLazyQuery>;
export type SpacePrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePrivilegesQuery,
  SchemaTypes.SpacePrivilegesQueryVariables
>;
export function refetchSpacePrivilegesQuery(variables: SchemaTypes.SpacePrivilegesQueryVariables) {
  return { query: SpacePrivilegesDocument, variables: variables };
}

export const SpaceCommunityPageDocument = gql`
  query SpaceCommunityPage($spaceId: UUID!, $includeCommunity: Boolean!) {
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
        provider {
          ...ContributorDetails
        }
        authorization {
          id
          myPrivileges
        }
        community @include(if: $includeCommunity) {
          id
          roleSet {
            id
          }
        }
        collaboration {
          id
          calloutsSet {
            id
          }
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
  ${ContributorDetailsFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
 *      includeCommunity: // value for 'includeCommunity'
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

export const SpaceDocument = gql`
  query Space($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        nameID
        about {
          ...SpaceAboutLight
        }
        authorization {
          id
          myPrivileges
        }
        collaboration {
          id
          authorization {
            id
            myPrivileges
          }
          calloutsSet {
            id
          }
        }
        visibility
        settings {
          privacy {
            mode
          }
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
`;

/**
 * __useSpaceQuery__
 *
 * To run a query within a React component, call `useSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceQuery, SchemaTypes.SpaceQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceQuery, SchemaTypes.SpaceQueryVariables>(SpaceDocument, options);
}

export function useSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceQuery, SchemaTypes.SpaceQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceQuery, SchemaTypes.SpaceQueryVariables>(SpaceDocument, options);
}

export type SpaceQueryHookResult = ReturnType<typeof useSpaceQuery>;
export type SpaceLazyQueryHookResult = ReturnType<typeof useSpaceLazyQuery>;
export type SpaceQueryResult = Apollo.QueryResult<SchemaTypes.SpaceQuery, SchemaTypes.SpaceQueryVariables>;
export function refetchSpaceQuery(variables: SchemaTypes.SpaceQueryVariables) {
  return { query: SpaceDocument, variables: variables };
}

export const SpaceCommunityIdsDocument = gql`
  query SpaceCommunityIds($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        community {
          id
          authorization {
            id
            myPrivileges
          }
          roleSet {
            id
            myMembershipStatus
          }
        }
      }
    }
  }
`;

/**
 * __useSpaceCommunityIdsQuery__
 *
 * To run a query within a React component, call `useSpaceCommunityIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCommunityIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCommunityIdsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCommunityIdsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceCommunityIdsQuery, SchemaTypes.SpaceCommunityIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceCommunityIdsQuery, SchemaTypes.SpaceCommunityIdsQueryVariables>(
    SpaceCommunityIdsDocument,
    options
  );
}

export function useSpaceCommunityIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCommunityIdsQuery,
    SchemaTypes.SpaceCommunityIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceCommunityIdsQuery, SchemaTypes.SpaceCommunityIdsQueryVariables>(
    SpaceCommunityIdsDocument,
    options
  );
}

export type SpaceCommunityIdsQueryHookResult = ReturnType<typeof useSpaceCommunityIdsQuery>;
export type SpaceCommunityIdsLazyQueryHookResult = ReturnType<typeof useSpaceCommunityIdsLazyQuery>;
export type SpaceCommunityIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityIdsQuery,
  SchemaTypes.SpaceCommunityIdsQueryVariables
>;
export function refetchSpaceCommunityIdsQuery(variables: SchemaTypes.SpaceCommunityIdsQueryVariables) {
  return { query: SpaceCommunityIdsDocument, variables: variables };
}

export const SpaceProfileDocument = gql`
  query SpaceProfile($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        level
        ...SpaceInfo
      }
    }
  }
  ${SpaceInfoFragmentDoc}
`;

/**
 * __useSpaceProfileQuery__
 *
 * To run a query within a React component, call `useSpaceProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceProfileQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceProfileQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceProfileQuery, SchemaTypes.SpaceProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceProfileQuery, SchemaTypes.SpaceProfileQueryVariables>(
    SpaceProfileDocument,
    options
  );
}

export function useSpaceProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceProfileQuery, SchemaTypes.SpaceProfileQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceProfileQuery, SchemaTypes.SpaceProfileQueryVariables>(
    SpaceProfileDocument,
    options
  );
}

export type SpaceProfileQueryHookResult = ReturnType<typeof useSpaceProfileQuery>;
export type SpaceProfileLazyQueryHookResult = ReturnType<typeof useSpaceProfileLazyQuery>;
export type SpaceProfileQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceProfileQuery,
  SchemaTypes.SpaceProfileQueryVariables
>;
export function refetchSpaceProfileQuery(variables: SchemaTypes.SpaceProfileQueryVariables) {
  return { query: SpaceProfileDocument, variables: variables };
}

export const SpaceHostDocument = gql`
  query SpaceHost($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        provider {
          id
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
  >
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

export type SpaceTemplatesManagerQueryHookResult = ReturnType<typeof useSpaceTemplatesManagerQuery>;
export type SpaceTemplatesManagerLazyQueryHookResult = ReturnType<typeof useSpaceTemplatesManagerLazyQuery>;
export type SpaceTemplatesManagerQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplatesManagerQuery,
  SchemaTypes.SpaceTemplatesManagerQueryVariables
>;
export function refetchSpaceTemplatesManagerQuery(variables: SchemaTypes.SpaceTemplatesManagerQueryVariables) {
  return { query: SpaceTemplatesManagerDocument, variables: variables };
}

export const SpaceUrlDocument = gql`
  query SpaceUrl($spaceId: UUID!) {
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
 * __useSpaceUrlQuery__
 *
 * To run a query within a React component, call `useSpaceUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceUrlQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceUrlQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceUrlQuery, SchemaTypes.SpaceUrlQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceUrlQuery, SchemaTypes.SpaceUrlQueryVariables>(SpaceUrlDocument, options);
}

export function useSpaceUrlLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceUrlQuery, SchemaTypes.SpaceUrlQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceUrlQuery, SchemaTypes.SpaceUrlQueryVariables>(SpaceUrlDocument, options);
}

export type SpaceUrlQueryHookResult = ReturnType<typeof useSpaceUrlQuery>;
export type SpaceUrlLazyQueryHookResult = ReturnType<typeof useSpaceUrlLazyQuery>;
export type SpaceUrlQueryResult = Apollo.QueryResult<SchemaTypes.SpaceUrlQuery, SchemaTypes.SpaceUrlQueryVariables>;
export function refetchSpaceUrlQuery(variables: SchemaTypes.SpaceUrlQueryVariables) {
  return { query: SpaceUrlDocument, variables: variables };
}

export const SpacePageDocument = gql`
  query SpacePage(
    $spaceId: UUID!
    $authorizedReadAccess: Boolean = false
    $authorizedReadAccessCommunity: Boolean = false
  ) {
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
  query SpaceDashboardReferences($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
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
  >
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

export type SpaceSubspaceCardsQueryHookResult = ReturnType<typeof useSpaceSubspaceCardsQuery>;
export type SpaceSubspaceCardsLazyQueryHookResult = ReturnType<typeof useSpaceSubspaceCardsLazyQuery>;
export type SpaceSubspaceCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSubspaceCardsQuery,
  SchemaTypes.SpaceSubspaceCardsQueryVariables
>;
export function refetchSpaceSubspaceCardsQuery(variables: SchemaTypes.SpaceSubspaceCardsQueryVariables) {
  return { query: SpaceSubspaceCardsDocument, variables: variables };
}

export const CreateSpaceDocument = gql`
  mutation CreateSpace($spaceData: CreateSpaceOnAccountInput!) {
    createSpace(spaceData: $spaceData) {
      id
      about {
        ...SpaceAboutLight
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
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

export type PlansTableQueryHookResult = ReturnType<typeof usePlansTableQuery>;
export type PlansTableLazyQueryHookResult = ReturnType<typeof usePlansTableLazyQuery>;
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
  >
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

export type AccountPlanAvailabilityQueryHookResult = ReturnType<typeof useAccountPlanAvailabilityQuery>;
export type AccountPlanAvailabilityLazyQueryHookResult = ReturnType<typeof useAccountPlanAvailabilityLazyQuery>;
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

export type ContactSupportLocationQueryHookResult = ReturnType<typeof useContactSupportLocationQuery>;
export type ContactSupportLocationLazyQueryHookResult = ReturnType<typeof useContactSupportLocationLazyQuery>;
export type ContactSupportLocationQueryResult = Apollo.QueryResult<
  SchemaTypes.ContactSupportLocationQuery,
  SchemaTypes.ContactSupportLocationQueryVariables
>;
export function refetchContactSupportLocationQuery(variables?: SchemaTypes.ContactSupportLocationQueryVariables) {
  return { query: ContactSupportLocationDocument, variables: variables };
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
export const SpaceAndCommunityPrivilegesDocument = gql`
  query SpaceAndCommunityPrivileges($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        authorization {
          id
          myPrivileges
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
`;

/**
 * __useSpaceAndCommunityPrivilegesQuery__
 *
 * To run a query within a React component, call `useSpaceAndCommunityPrivilegesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAndCommunityPrivilegesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAndCommunityPrivilegesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceAndCommunityPrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceAndCommunityPrivilegesQuery,
    SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceAndCommunityPrivilegesQuery,
    SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
  >(SpaceAndCommunityPrivilegesDocument, options);
}

export function useSpaceAndCommunityPrivilegesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceAndCommunityPrivilegesQuery,
    SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceAndCommunityPrivilegesQuery,
    SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
  >(SpaceAndCommunityPrivilegesDocument, options);
}

export type SpaceAndCommunityPrivilegesQueryHookResult = ReturnType<typeof useSpaceAndCommunityPrivilegesQuery>;
export type SpaceAndCommunityPrivilegesLazyQueryHookResult = ReturnType<typeof useSpaceAndCommunityPrivilegesLazyQuery>;
export type SpaceAndCommunityPrivilegesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAndCommunityPrivilegesQuery,
  SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
>;
export function refetchSpaceAndCommunityPrivilegesQuery(
  variables: SchemaTypes.SpaceAndCommunityPrivilegesQueryVariables
) {
  return { query: SpaceAndCommunityPrivilegesDocument, variables: variables };
}

export const SpaceApplicationTemplateDocument = gql`
  query SpaceApplicationTemplate($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        community {
          id
          roleSet {
            id
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SubspacesInSpaceQuery, SchemaTypes.SubspacesInSpaceQueryVariables>
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

export type SubspacesInSpaceQueryHookResult = ReturnType<typeof useSubspacesInSpaceQuery>;
export type SubspacesInSpaceLazyQueryHookResult = ReturnType<typeof useSubspacesInSpaceLazyQuery>;
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
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.SubspaceCreatedSubscription,
    SchemaTypes.SubspaceCreatedSubscriptionVariables
  >(SubspaceCreatedDocument, options);
}

export type SubspaceCreatedSubscriptionHookResult = ReturnType<typeof useSubspaceCreatedSubscription>;
export type SubspaceCreatedSubscriptionResult = Apollo.SubscriptionResult<SchemaTypes.SubspaceCreatedSubscription>;
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

export const SpaceAccountDocument = gql`
  query SpaceAccount($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutLight
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
              ...VisualUri
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
  ${VisualUriFragmentDoc}
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceAccountQuery, SchemaTypes.SpaceAccountQueryVariables>
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

export type SpaceAccountQueryHookResult = ReturnType<typeof useSpaceAccountQuery>;
export type SpaceAccountLazyQueryHookResult = ReturnType<typeof useSpaceAccountLazyQuery>;
export type SpaceAccountQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAccountQuery,
  SchemaTypes.SpaceAccountQueryVariables
>;
export function refetchSpaceAccountQuery(variables: SchemaTypes.SpaceAccountQueryVariables) {
  return { query: SpaceAccountDocument, variables: variables };
}

export const SpaceSettingsDocument = gql`
  query SpaceSettings($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        settings {
          ...SpaceSettings
        }
        community {
          id
          roleSet {
            id
          }
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceSettingsQuery, SchemaTypes.SpaceSettingsQueryVariables>
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

export type SpaceSettingsQueryHookResult = ReturnType<typeof useSpaceSettingsQuery>;
export type SpaceSettingsLazyQueryHookResult = ReturnType<typeof useSpaceSettingsLazyQuery>;
export type SpaceSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSettingsQuery,
  SchemaTypes.SpaceSettingsQueryVariables
>;
export function refetchSpaceSettingsQuery(variables: SchemaTypes.SpaceSettingsQueryVariables) {
  return { query: SpaceSettingsDocument, variables: variables };
}

export const SpaceSubspacesDocument = gql`
  query SpaceSubspaces($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutMinimal
        }
        account {
          id
          authorization {
            myPrivileges
          }
          virtualContributors {
            id
            profile {
              id
              displayName
              tagline
              url
              tagsets {
                ...TagsetDetails
              }
              avatar: visual(type: AVATAR) {
                ...VisualFull
              }
            }
          }
        }
        subspaces {
          id
          about {
            ...SpaceAboutCardAvatar
          }
        }
      }
    }
  }
  ${SpaceAboutMinimalFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${SpaceAboutCardAvatarFragmentDoc}
`;

/**
 * __useSpaceSubspacesQuery__
 *
 * To run a query within a React component, call `useSpaceSubspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceSubspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceSubspacesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceSubspacesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceSubspacesQuery, SchemaTypes.SpaceSubspacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceSubspacesQuery, SchemaTypes.SpaceSubspacesQueryVariables>(
    SpaceSubspacesDocument,
    options
  );
}

export function useSpaceSubspacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceSubspacesQuery, SchemaTypes.SpaceSubspacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceSubspacesQuery, SchemaTypes.SpaceSubspacesQueryVariables>(
    SpaceSubspacesDocument,
    options
  );
}

export type SpaceSubspacesQueryHookResult = ReturnType<typeof useSpaceSubspacesQuery>;
export type SpaceSubspacesLazyQueryHookResult = ReturnType<typeof useSpaceSubspacesLazyQuery>;
export type SpaceSubspacesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceSubspacesQuery,
  SchemaTypes.SpaceSubspacesQueryVariables
>;
export function refetchSpaceSubspacesQuery(variables: SchemaTypes.SpaceSubspacesQueryVariables) {
  return { query: SpaceSubspacesDocument, variables: variables };
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
export const AdminSpaceSubspacesPageDocument = gql`
  query AdminSpaceSubspacesPage($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        subspaces {
          id
          level
          about {
            ...SpaceAboutCardAvatar
          }
        }
        templatesManager {
          id
          templatesSet {
            id
          }
          templateDefaults {
            id
            type
            template {
              id
              profile {
                ...InnovationFlowProfile
              }
              collaboration {
                id
                calloutsSet {
                  id
                  callouts {
                    id
                    type
                    sortOrder
                    framing {
                      id
                      profile {
                        id
                        displayName
                        description
                        flowStateTagset: tagset(tagsetName: FLOW_STATE) {
                          id
                          tags
                        }
                      }
                    }
                  }
                }
                innovationFlow {
                  id
                  profile {
                    id
                    displayName
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
      }
    }
  }
  ${SpaceAboutCardAvatarFragmentDoc}
  ${InnovationFlowProfileFragmentDoc}
`;

/**
 * __useAdminSpaceSubspacesPageQuery__
 *
 * To run a query within a React component, call `useAdminSpaceSubspacesPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminSpaceSubspacesPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSpaceSubspacesPageQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useAdminSpaceSubspacesPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.AdminSpaceSubspacesPageQuery,
    SchemaTypes.AdminSpaceSubspacesPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminSpaceSubspacesPageQuery, SchemaTypes.AdminSpaceSubspacesPageQueryVariables>(
    AdminSpaceSubspacesPageDocument,
    options
  );
}

export function useAdminSpaceSubspacesPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminSpaceSubspacesPageQuery,
    SchemaTypes.AdminSpaceSubspacesPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminSpaceSubspacesPageQuery,
    SchemaTypes.AdminSpaceSubspacesPageQueryVariables
  >(AdminSpaceSubspacesPageDocument, options);
}

export type AdminSpaceSubspacesPageQueryHookResult = ReturnType<typeof useAdminSpaceSubspacesPageQuery>;
export type AdminSpaceSubspacesPageLazyQueryHookResult = ReturnType<typeof useAdminSpaceSubspacesPageLazyQuery>;
export type AdminSpaceSubspacesPageQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminSpaceSubspacesPageQuery,
  SchemaTypes.AdminSpaceSubspacesPageQueryVariables
>;
export function refetchAdminSpaceSubspacesPageQuery(variables: SchemaTypes.AdminSpaceSubspacesPageQueryVariables) {
  return { query: AdminSpaceSubspacesPageDocument, variables: variables };
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
        }
        subspaces {
          id
          about {
            ...SpaceAboutCardAvatar
          }
          authorization {
            id
            myPrivileges
          }
          community {
            id
            roleSet {
              ...MyMembershipsRoleSet
            }
          }
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${SpaceAboutCardAvatarFragmentDoc}
  ${MyMembershipsRoleSetFragmentDoc}
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
  >
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

export type SpaceDashboardNavigationSubspacesQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesQuery
>;
export type SpaceDashboardNavigationSubspacesLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesLazyQuery
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

export const SpaceDashboardNavigationSubspacesAuthDocument = gql`
  query SpaceDashboardNavigationSubspacesAuth($spaceId: UUID!) {
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
 * __useSpaceDashboardNavigationSubspacesAuthQuery__
 *
 * To run a query within a React component, call `useSpaceDashboardNavigationSubspacesAuthQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDashboardNavigationSubspacesAuthQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDashboardNavigationSubspacesAuthQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDashboardNavigationSubspacesAuthQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
  >(SpaceDashboardNavigationSubspacesAuthDocument, options);
}

export function useSpaceDashboardNavigationSubspacesAuthLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQuery,
    SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
  >(SpaceDashboardNavigationSubspacesAuthDocument, options);
}

export type SpaceDashboardNavigationSubspacesAuthQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesAuthQuery
>;
export type SpaceDashboardNavigationSubspacesAuthLazyQueryHookResult = ReturnType<
  typeof useSpaceDashboardNavigationSubspacesAuthLazyQuery
>;
export type SpaceDashboardNavigationSubspacesAuthQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDashboardNavigationSubspacesAuthQuery,
  SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
>;
export function refetchSpaceDashboardNavigationSubspacesAuthQuery(
  variables: SchemaTypes.SpaceDashboardNavigationSubspacesAuthQueryVariables
) {
  return { query: SpaceDashboardNavigationSubspacesAuthDocument, variables: variables };
}

export const SubspacePendingMembershipInfoDocument = gql`
  query SubspacePendingMembershipInfo($subspaceId: UUID!) {
    lookup {
      space(ID: $subspaceId) {
        ...SubspacePendingMembershipInfo
      }
    }
  }
  ${SubspacePendingMembershipInfoFragmentDoc}
`;

/**
 * __useSubspacePendingMembershipInfoQuery__
 *
 * To run a query within a React component, call `useSubspacePendingMembershipInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubspacePendingMembershipInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubspacePendingMembershipInfoQuery({
 *   variables: {
 *      subspaceId: // value for 'subspaceId'
 *   },
 * });
 */
export function useSubspacePendingMembershipInfoQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SubspacePendingMembershipInfoQuery,
    SchemaTypes.SubspacePendingMembershipInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SubspacePendingMembershipInfoQuery,
    SchemaTypes.SubspacePendingMembershipInfoQueryVariables
  >(SubspacePendingMembershipInfoDocument, options);
}

export function useSubspacePendingMembershipInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SubspacePendingMembershipInfoQuery,
    SchemaTypes.SubspacePendingMembershipInfoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SubspacePendingMembershipInfoQuery,
    SchemaTypes.SubspacePendingMembershipInfoQueryVariables
  >(SubspacePendingMembershipInfoDocument, options);
}

export type SubspacePendingMembershipInfoQueryHookResult = ReturnType<typeof useSubspacePendingMembershipInfoQuery>;
export type SubspacePendingMembershipInfoLazyQueryHookResult = ReturnType<
  typeof useSubspacePendingMembershipInfoLazyQuery
>;
export type SubspacePendingMembershipInfoQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspacePendingMembershipInfoQuery,
  SchemaTypes.SubspacePendingMembershipInfoQueryVariables
>;
export function refetchSubspacePendingMembershipInfoQuery(
  variables: SchemaTypes.SubspacePendingMembershipInfoQueryVariables
) {
  return { query: SubspacePendingMembershipInfoDocument, variables: variables };
}

export const SubspacePageDocument = gql`
  query SubspacePage($spaceId: UUID!, $authorizedReadAccessCommunity: Boolean = false) {
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
 *      authorizedReadAccessCommunity: // value for 'authorizedReadAccessCommunity'
 *   },
 * });
 */
export function useSubspacePageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SubspacePageQuery, SchemaTypes.SubspacePageQueryVariables>
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

export type SubspacePageQueryHookResult = ReturnType<typeof useSubspacePageQuery>;
export type SubspacePageLazyQueryHookResult = ReturnType<typeof useSubspacePageLazyQuery>;
export type SubspacePageQueryResult = Apollo.QueryResult<
  SchemaTypes.SubspacePageQuery,
  SchemaTypes.SubspacePageQueryVariables
>;
export function refetchSubspacePageQuery(variables: SchemaTypes.SubspacePageQueryVariables) {
  return { query: SubspacePageDocument, variables: variables };
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

export type PlatformRoleSetQueryHookResult = ReturnType<typeof usePlatformRoleSetQuery>;
export type PlatformRoleSetLazyQueryHookResult = ReturnType<typeof usePlatformRoleSetLazyQuery>;
export type PlatformRoleSetQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformRoleSetQuery,
  SchemaTypes.PlatformRoleSetQueryVariables
>;
export function refetchPlatformRoleSetQuery(variables?: SchemaTypes.PlatformRoleSetQueryVariables) {
  return { query: PlatformRoleSetDocument, variables: variables };
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
export const AdminGlobalOrganizationsListDocument = gql`
  query adminGlobalOrganizationsList($first: Int!, $after: UUID, $filter: OrganizationFilterInput) {
    organizationsPaginated(first: $first, after: $after, filter: $filter) {
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
export const UserListDocument = gql`
  query userList($first: Int!, $after: UUID, $filter: UserFilterInput) {
    usersPaginated(first: $first, after: $after, filter: $filter) {
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

export const AdminVirtualContributorsDocument = gql`
  query AdminVirtualContributors {
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
          ...VisualFull
        }
      }
    }
  }
  ${VisualFullFragmentDoc}
`;

/**
 * __useAdminVirtualContributorsQuery__
 *
 * To run a query within a React component, call `useAdminVirtualContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminVirtualContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminVirtualContributorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminVirtualContributorsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.AdminVirtualContributorsQuery,
    SchemaTypes.AdminVirtualContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminVirtualContributorsQuery, SchemaTypes.AdminVirtualContributorsQueryVariables>(
    AdminVirtualContributorsDocument,
    options
  );
}

export function useAdminVirtualContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminVirtualContributorsQuery,
    SchemaTypes.AdminVirtualContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.AdminVirtualContributorsQuery,
    SchemaTypes.AdminVirtualContributorsQueryVariables
  >(AdminVirtualContributorsDocument, options);
}

export type AdminVirtualContributorsQueryHookResult = ReturnType<typeof useAdminVirtualContributorsQuery>;
export type AdminVirtualContributorsLazyQueryHookResult = ReturnType<typeof useAdminVirtualContributorsLazyQuery>;
export type AdminVirtualContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminVirtualContributorsQuery,
  SchemaTypes.AdminVirtualContributorsQueryVariables
>;
export function refetchAdminVirtualContributorsQuery(variables?: SchemaTypes.AdminVirtualContributorsQueryVariables) {
  return { query: AdminVirtualContributorsDocument, variables: variables };
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

export type ConfigurationQueryHookResult = ReturnType<typeof useConfigurationQuery>;
export type ConfigurationLazyQueryHookResult = ReturnType<typeof useConfigurationLazyQuery>;
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

export type PlatformLicensingPlansQueryHookResult = ReturnType<typeof usePlatformLicensingPlansQuery>;
export type PlatformLicensingPlansLazyQueryHookResult = ReturnType<typeof usePlatformLicensingPlansLazyQuery>;
export type PlatformLicensingPlansQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformLicensingPlansQuery,
  SchemaTypes.PlatformLicensingPlansQueryVariables
>;
export function refetchPlatformLicensingPlansQuery(variables?: SchemaTypes.PlatformLicensingPlansQueryVariables) {
  return { query: PlatformLicensingPlansDocument, variables: variables };
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
export const CreateSubspaceDocument = gql`
  mutation createSubspace($input: CreateSubspaceInput!, $includeVisuals: Boolean = false) {
    createSubspace(subspaceData: $input) {
      ...SubspaceCard
      about {
        id
        profile @include(if: $includeVisuals) {
          id
          cardBanner: visual(type: CARD) {
            id
            uri
            name
          }
          avatar: visual(type: AVATAR) {
            id
            uri
            name
          }
          tagset {
            ...TagsetDetails
          }
        }
      }
    }
  }
  ${SubspaceCardFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
export const AboutPageNonMembersDocument = gql`
  query AboutPageNonMembers($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        about {
          ...SpaceAboutDetails
        }
        provider {
          ...ContributorDetails
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
          roleSet {
            id
            authorization {
              id
              myPrivileges
            }
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
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
  ${ContributorDetailsFragmentDoc}
  ${MetricsItemFragmentDoc}
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
 *   },
 * });
 */
export function useAboutPageNonMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
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
export function refetchAboutPageNonMembersQuery(variables: SchemaTypes.AboutPageNonMembersQueryVariables) {
  return { query: AboutPageNonMembersDocument, variables: variables };
}

export const AboutPageMembersDocument = gql`
  query AboutPageMembers($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        id
        community {
          id
          roleSet {
            id
          }
        }
        about {
          ...SpaceAboutDetails
        }
        authorization {
          id
          myPrivileges
        }
      }
    }
  }
  ${SpaceAboutDetailsFragmentDoc}
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

export const JourneyStorageConfigDocument = gql`
  query JourneyStorageConfig($spaceId: UUID!) {
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
 *   },
 * });
 */
export function useJourneyStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
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
export function refetchJourneyStorageConfigQuery(variables: SchemaTypes.JourneyStorageConfigQueryVariables) {
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
  >
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

export type VirtualContributorStorageConfigQueryHookResult = ReturnType<typeof useVirtualContributorStorageConfigQuery>;
export type VirtualContributorStorageConfigLazyQueryHookResult = ReturnType<
  typeof useVirtualContributorStorageConfigLazyQuery
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
  >
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

export type TemplateStorageConfigQueryHookResult = ReturnType<typeof useTemplateStorageConfigQuery>;
export type TemplateStorageConfigLazyQueryHookResult = ReturnType<typeof useTemplateStorageConfigLazyQuery>;
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

export type PlatformStorageConfigQueryHookResult = ReturnType<typeof usePlatformStorageConfigQuery>;
export type PlatformStorageConfigLazyQueryHookResult = ReturnType<typeof usePlatformStorageConfigLazyQuery>;
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
  >
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

export type AccountStorageConfigQueryHookResult = ReturnType<typeof useAccountStorageConfigQuery>;
export type AccountStorageConfigLazyQueryHookResult = ReturnType<typeof useAccountStorageConfigLazyQuery>;
export type AccountStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.AccountStorageConfigQuery,
  SchemaTypes.AccountStorageConfigQueryVariables
>;
export function refetchAccountStorageConfigQuery(variables: SchemaTypes.AccountStorageConfigQueryVariables) {
  return { query: AccountStorageConfigDocument, variables: variables };
}

export const SpaceCollaborationTemplatesDocument = gql`
  query SpaceCollaborationTemplates($spaceId: UUID!) {
    lookup {
      space(ID: $spaceId) {
        templatesManager {
          id
          templatesSet {
            id
            collaborationTemplates {
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
 * __useSpaceCollaborationTemplatesQuery__
 *
 * To run a query within a React component, call `useSpaceCollaborationTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCollaborationTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCollaborationTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCollaborationTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCollaborationTemplatesQuery,
    SchemaTypes.SpaceCollaborationTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCollaborationTemplatesQuery,
    SchemaTypes.SpaceCollaborationTemplatesQueryVariables
  >(SpaceCollaborationTemplatesDocument, options);
}

export function useSpaceCollaborationTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCollaborationTemplatesQuery,
    SchemaTypes.SpaceCollaborationTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCollaborationTemplatesQuery,
    SchemaTypes.SpaceCollaborationTemplatesQueryVariables
  >(SpaceCollaborationTemplatesDocument, options);
}

export type SpaceCollaborationTemplatesQueryHookResult = ReturnType<typeof useSpaceCollaborationTemplatesQuery>;
export type SpaceCollaborationTemplatesLazyQueryHookResult = ReturnType<typeof useSpaceCollaborationTemplatesLazyQuery>;
export type SpaceCollaborationTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCollaborationTemplatesQuery,
  SchemaTypes.SpaceCollaborationTemplatesQueryVariables
>;
export function refetchSpaceCollaborationTemplatesQuery(
  variables: SchemaTypes.SpaceCollaborationTemplatesQueryVariables
) {
  return { query: SpaceCollaborationTemplatesDocument, variables: variables };
}

export const ImportTemplateDialogDocument = gql`
  query ImportTemplateDialog(
    $templatesSetId: UUID!
    $includeCollaboration: Boolean = false
    $includeCallout: Boolean = false
  ) {
    lookup {
      templatesSet(ID: $templatesSetId) {
        templates {
          ...TemplateProfileInfo
          callout @include(if: $includeCallout) {
            id
            type
          }
          collaboration @include(if: $includeCollaboration) {
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
 *      includeCollaboration: // value for 'includeCollaboration'
 *      includeCallout: // value for 'includeCallout'
 *   },
 * });
 */
export function useImportTemplateDialogQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ImportTemplateDialogQuery,
    SchemaTypes.ImportTemplateDialogQueryVariables
  >
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

export type ImportTemplateDialogQueryHookResult = ReturnType<typeof useImportTemplateDialogQuery>;
export type ImportTemplateDialogLazyQueryHookResult = ReturnType<typeof useImportTemplateDialogLazyQuery>;
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
    $includeCollaboration: Boolean = false
    $includeCallout: Boolean = false
  ) {
    platform {
      library {
        templates(filter: { types: $templateTypes }) {
          template {
            ...TemplateProfileInfo
            callout @include(if: $includeCallout) {
              id
              type
            }
            collaboration @include(if: $includeCollaboration) {
              id
              innovationFlow {
                id
                states {
                  displayName
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
 *      includeCollaboration: // value for 'includeCollaboration'
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

export type ImportTemplateDialogPlatformTemplatesQueryHookResult = ReturnType<
  typeof useImportTemplateDialogPlatformTemplatesQuery
>;
export type ImportTemplateDialogPlatformTemplatesLazyQueryHookResult = ReturnType<
  typeof useImportTemplateDialogPlatformTemplatesLazyQuery
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
  >
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

export type AllTemplatesInTemplatesSetQueryHookResult = ReturnType<typeof useAllTemplatesInTemplatesSetQuery>;
export type AllTemplatesInTemplatesSetLazyQueryHookResult = ReturnType<typeof useAllTemplatesInTemplatesSetLazyQuery>;
export type AllTemplatesInTemplatesSetQueryResult = Apollo.QueryResult<
  SchemaTypes.AllTemplatesInTemplatesSetQuery,
  SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
>;
export function refetchAllTemplatesInTemplatesSetQuery(
  variables: SchemaTypes.AllTemplatesInTemplatesSetQueryVariables
) {
  return { query: AllTemplatesInTemplatesSetDocument, variables: variables };
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
  >
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

export type SpaceCollaborationIdQueryHookResult = ReturnType<typeof useSpaceCollaborationIdQuery>;
export type SpaceCollaborationIdLazyQueryHookResult = ReturnType<typeof useSpaceCollaborationIdLazyQuery>;
export type SpaceCollaborationIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCollaborationIdQuery,
  SchemaTypes.SpaceCollaborationIdQueryVariables
>;
export function refetchSpaceCollaborationIdQuery(variables: SchemaTypes.SpaceCollaborationIdQueryVariables) {
  return { query: SpaceCollaborationIdDocument, variables: variables };
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
  >
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

export type SpaceDefaultTemplatesQueryHookResult = ReturnType<typeof useSpaceDefaultTemplatesQuery>;
export type SpaceDefaultTemplatesLazyQueryHookResult = ReturnType<typeof useSpaceDefaultTemplatesLazyQuery>;
export type SpaceDefaultTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDefaultTemplatesQuery,
  SchemaTypes.SpaceDefaultTemplatesQueryVariables
>;
export function refetchSpaceDefaultTemplatesQuery(variables: SchemaTypes.SpaceDefaultTemplatesQueryVariables) {
  return { query: SpaceDefaultTemplatesDocument, variables: variables };
}

export const TemplateContentDocument = gql`
  query TemplateContent(
    $templateId: UUID!
    $includeCallout: Boolean = false
    $includeCommunityGuidelines: Boolean = false
    $includeCollaboration: Boolean = false
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
        collaboration @include(if: $includeCollaboration) {
          ...CollaborationTemplateContent
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${CalloutTemplateContentFragmentDoc}
  ${CommunityGuidelinesTemplateContentFragmentDoc}
  ${WhiteboardTemplateContentFragmentDoc}
  ${CollaborationTemplateContentFragmentDoc}
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
 *      includeCollaboration: // value for 'includeCollaboration'
 *      includePost: // value for 'includePost'
 *      includeWhiteboard: // value for 'includeWhiteboard'
 *   },
 * });
 */
export function useTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.TemplateContentQuery, SchemaTypes.TemplateContentQueryVariables>
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

export type TemplateContentQueryHookResult = ReturnType<typeof useTemplateContentQuery>;
export type TemplateContentLazyQueryHookResult = ReturnType<typeof useTemplateContentLazyQuery>;
export type TemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.TemplateContentQuery,
  SchemaTypes.TemplateContentQueryVariables
>;
export function refetchTemplateContentQuery(variables: SchemaTypes.TemplateContentQueryVariables) {
  return { query: TemplateContentDocument, variables: variables };
}

export const CollaborationTemplateContentDocument = gql`
  query CollaborationTemplateContent($collaborationId: UUID!) {
    lookup {
      collaboration(ID: $collaborationId) {
        ...CollaborationTemplateContent
      }
    }
  }
  ${CollaborationTemplateContentFragmentDoc}
`;

/**
 * __useCollaborationTemplateContentQuery__
 *
 * To run a query within a React component, call `useCollaborationTemplateContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollaborationTemplateContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollaborationTemplateContentQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useCollaborationTemplateContentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CollaborationTemplateContentQuery,
    SchemaTypes.CollaborationTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CollaborationTemplateContentQuery,
    SchemaTypes.CollaborationTemplateContentQueryVariables
  >(CollaborationTemplateContentDocument, options);
}

export function useCollaborationTemplateContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CollaborationTemplateContentQuery,
    SchemaTypes.CollaborationTemplateContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CollaborationTemplateContentQuery,
    SchemaTypes.CollaborationTemplateContentQueryVariables
  >(CollaborationTemplateContentDocument, options);
}

export type CollaborationTemplateContentQueryHookResult = ReturnType<typeof useCollaborationTemplateContentQuery>;
export type CollaborationTemplateContentLazyQueryHookResult = ReturnType<
  typeof useCollaborationTemplateContentLazyQuery
>;
export type CollaborationTemplateContentQueryResult = Apollo.QueryResult<
  SchemaTypes.CollaborationTemplateContentQuery,
  SchemaTypes.CollaborationTemplateContentQueryVariables
>;
export function refetchCollaborationTemplateContentQuery(
  variables: SchemaTypes.CollaborationTemplateContentQueryVariables
) {
  return { query: CollaborationTemplateContentDocument, variables: variables };
}

export const CreateTemplateDocument = gql`
  mutation CreateTemplate(
    $templatesSetId: UUID!
    $profileData: CreateProfileInput!
    $type: TemplateType!
    $tags: [String!]
    $calloutData: CreateCalloutInput
    $communityGuidelinesData: CreateCommunityGuidelinesInput
    $collaborationData: CreateCollaborationInput
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
        collaborationData: $collaborationData
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
 *      collaborationData: // value for 'collaborationData'
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
export const CreateTemplateFromCollaborationDocument = gql`
  mutation CreateTemplateFromCollaboration(
    $templatesSetId: UUID!
    $profileData: CreateProfileInput!
    $tags: [String!]
    $collaborationId: UUID!
  ) {
    createTemplateFromCollaboration(
      templateData: {
        templatesSetID: $templatesSetId
        profileData: $profileData
        tags: $tags
        collaborationID: $collaborationId
      }
    ) {
      id
    }
  }
`;
export type CreateTemplateFromCollaborationMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateTemplateFromCollaborationMutation,
  SchemaTypes.CreateTemplateFromCollaborationMutationVariables
>;

/**
 * __useCreateTemplateFromCollaborationMutation__
 *
 * To run a mutation, you first call `useCreateTemplateFromCollaborationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateFromCollaborationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateFromCollaborationMutation, { data, loading, error }] = useCreateTemplateFromCollaborationMutation({
 *   variables: {
 *      templatesSetId: // value for 'templatesSetId'
 *      profileData: // value for 'profileData'
 *      tags: // value for 'tags'
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useCreateTemplateFromCollaborationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateTemplateFromCollaborationMutation,
    SchemaTypes.CreateTemplateFromCollaborationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateTemplateFromCollaborationMutation,
    SchemaTypes.CreateTemplateFromCollaborationMutationVariables
  >(CreateTemplateFromCollaborationDocument, options);
}

export type CreateTemplateFromCollaborationMutationHookResult = ReturnType<
  typeof useCreateTemplateFromCollaborationMutation
>;
export type CreateTemplateFromCollaborationMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateTemplateFromCollaborationMutation>;
export type CreateTemplateFromCollaborationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateTemplateFromCollaborationMutation,
  SchemaTypes.CreateTemplateFromCollaborationMutationVariables
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
export const UpdateTemplateFromCollaborationDocument = gql`
  mutation UpdateTemplateFromCollaboration($templateId: UUID!, $collaborationId: UUID!) {
    updateTemplateFromCollaboration(updateData: { templateID: $templateId, collaborationID: $collaborationId }) {
      id
    }
  }
`;
export type UpdateTemplateFromCollaborationMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateTemplateFromCollaborationMutation,
  SchemaTypes.UpdateTemplateFromCollaborationMutationVariables
>;

/**
 * __useUpdateTemplateFromCollaborationMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateFromCollaborationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateFromCollaborationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateFromCollaborationMutation, { data, loading, error }] = useUpdateTemplateFromCollaborationMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useUpdateTemplateFromCollaborationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateTemplateFromCollaborationMutation,
    SchemaTypes.UpdateTemplateFromCollaborationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateTemplateFromCollaborationMutation,
    SchemaTypes.UpdateTemplateFromCollaborationMutationVariables
  >(UpdateTemplateFromCollaborationDocument, options);
}

export type UpdateTemplateFromCollaborationMutationHookResult = ReturnType<
  typeof useUpdateTemplateFromCollaborationMutation
>;
export type UpdateTemplateFromCollaborationMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateTemplateFromCollaborationMutation>;
export type UpdateTemplateFromCollaborationMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateTemplateFromCollaborationMutation,
  SchemaTypes.UpdateTemplateFromCollaborationMutationVariables
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.TemplateNameQuery, SchemaTypes.TemplateNameQueryVariables>
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

export type TemplateNameQueryHookResult = ReturnType<typeof useTemplateNameQuery>;
export type TemplateNameLazyQueryHookResult = ReturnType<typeof useTemplateNameLazyQuery>;
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
export const CreateTemplateInputDocument = gql`
  query CreateTemplateInput($templateId: UUID!) {
    lookup {
      template(ID: $templateId) {
        profile {
          displayName
          description
          tagset {
            tags
          }
        }
      }
    }
  }
`;

/**
 * __useCreateTemplateInputQuery__
 *
 * To run a query within a React component, call `useCreateTemplateInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateTemplateInputQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useCreateTemplateInputQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateTemplateInputQuery,
    SchemaTypes.CreateTemplateInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateTemplateInputQuery, SchemaTypes.CreateTemplateInputQueryVariables>(
    CreateTemplateInputDocument,
    options
  );
}

export function useCreateTemplateInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateTemplateInputQuery,
    SchemaTypes.CreateTemplateInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreateTemplateInputQuery, SchemaTypes.CreateTemplateInputQueryVariables>(
    CreateTemplateInputDocument,
    options
  );
}

export type CreateTemplateInputQueryHookResult = ReturnType<typeof useCreateTemplateInputQuery>;
export type CreateTemplateInputLazyQueryHookResult = ReturnType<typeof useCreateTemplateInputLazyQuery>;
export type CreateTemplateInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateTemplateInputQuery,
  SchemaTypes.CreateTemplateInputQueryVariables
>;
export function refetchCreateTemplateInputQuery(variables: SchemaTypes.CreateTemplateInputQueryVariables) {
  return { query: CreateTemplateInputDocument, variables: variables };
}

export const CreateCommunityGuidelinesInputDocument = gql`
  query CreateCommunityGuidelinesInput($communityGuidelinesId: UUID!) {
    inputCreator {
      communityGuidelines(ID: $communityGuidelinesId) {
        profile {
          displayName
          description
          referencesData {
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
 * __useCreateCommunityGuidelinesInputQuery__
 *
 * To run a query within a React component, call `useCreateCommunityGuidelinesInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateCommunityGuidelinesInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateCommunityGuidelinesInputQuery({
 *   variables: {
 *      communityGuidelinesId: // value for 'communityGuidelinesId'
 *   },
 * });
 */
export function useCreateCommunityGuidelinesInputQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateCommunityGuidelinesInputQuery,
    SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CreateCommunityGuidelinesInputQuery,
    SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
  >(CreateCommunityGuidelinesInputDocument, options);
}

export function useCreateCommunityGuidelinesInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateCommunityGuidelinesInputQuery,
    SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateCommunityGuidelinesInputQuery,
    SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
  >(CreateCommunityGuidelinesInputDocument, options);
}

export type CreateCommunityGuidelinesInputQueryHookResult = ReturnType<typeof useCreateCommunityGuidelinesInputQuery>;
export type CreateCommunityGuidelinesInputLazyQueryHookResult = ReturnType<
  typeof useCreateCommunityGuidelinesInputLazyQuery
>;
export type CreateCommunityGuidelinesInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateCommunityGuidelinesInputQuery,
  SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
>;
export function refetchCreateCommunityGuidelinesInputQuery(
  variables: SchemaTypes.CreateCommunityGuidelinesInputQueryVariables
) {
  return { query: CreateCommunityGuidelinesInputDocument, variables: variables };
}

export const CreateCalloutInputDocument = gql`
  query CreateCalloutInput($calloutId: UUID!) {
    inputCreator {
      callout(ID: $calloutId) {
        type
        framing {
          profile {
            displayName
            description
            tagsets {
              tags
            }
          }
          whiteboard {
            content
          }
        }
        contributionDefaults {
          postDescription
          whiteboardContent
        }
      }
    }
  }
`;

/**
 * __useCreateCalloutInputQuery__
 *
 * To run a query within a React component, call `useCreateCalloutInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateCalloutInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateCalloutInputQuery({
 *   variables: {
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useCreateCalloutInputQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateCalloutInputQuery,
    SchemaTypes.CreateCalloutInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateCalloutInputQuery, SchemaTypes.CreateCalloutInputQueryVariables>(
    CreateCalloutInputDocument,
    options
  );
}

export function useCreateCalloutInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateCalloutInputQuery,
    SchemaTypes.CreateCalloutInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreateCalloutInputQuery, SchemaTypes.CreateCalloutInputQueryVariables>(
    CreateCalloutInputDocument,
    options
  );
}

export type CreateCalloutInputQueryHookResult = ReturnType<typeof useCreateCalloutInputQuery>;
export type CreateCalloutInputLazyQueryHookResult = ReturnType<typeof useCreateCalloutInputLazyQuery>;
export type CreateCalloutInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateCalloutInputQuery,
  SchemaTypes.CreateCalloutInputQueryVariables
>;
export function refetchCreateCalloutInputQuery(variables: SchemaTypes.CreateCalloutInputQueryVariables) {
  return { query: CreateCalloutInputDocument, variables: variables };
}

export const CreateCollaborationInputDocument = gql`
  query CreateCollaborationInput($collaborationId: UUID!) {
    inputCreator {
      collaboration(ID: $collaborationId) {
        calloutsSetData {
          calloutsData {
            framing {
              profile {
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
 * __useCreateCollaborationInputQuery__
 *
 * To run a query within a React component, call `useCreateCollaborationInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateCollaborationInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateCollaborationInputQuery({
 *   variables: {
 *      collaborationId: // value for 'collaborationId'
 *   },
 * });
 */
export function useCreateCollaborationInputQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateCollaborationInputQuery,
    SchemaTypes.CreateCollaborationInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateCollaborationInputQuery, SchemaTypes.CreateCollaborationInputQueryVariables>(
    CreateCollaborationInputDocument,
    options
  );
}

export function useCreateCollaborationInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateCollaborationInputQuery,
    SchemaTypes.CreateCollaborationInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CreateCollaborationInputQuery,
    SchemaTypes.CreateCollaborationInputQueryVariables
  >(CreateCollaborationInputDocument, options);
}

export type CreateCollaborationInputQueryHookResult = ReturnType<typeof useCreateCollaborationInputQuery>;
export type CreateCollaborationInputLazyQueryHookResult = ReturnType<typeof useCreateCollaborationInputLazyQuery>;
export type CreateCollaborationInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateCollaborationInputQuery,
  SchemaTypes.CreateCollaborationInputQueryVariables
>;
export function refetchCreateCollaborationInputQuery(variables: SchemaTypes.CreateCollaborationInputQueryVariables) {
  return { query: CreateCollaborationInputDocument, variables: variables };
}

export const CreateWhiteboardInputDocument = gql`
  query CreateWhiteboardInput($whiteboardId: UUID!) {
    inputCreator {
      whiteboard(ID: $whiteboardId) {
        content
      }
    }
  }
`;

/**
 * __useCreateWhiteboardInputQuery__
 *
 * To run a query within a React component, call `useCreateWhiteboardInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateWhiteboardInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateWhiteboardInputQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useCreateWhiteboardInputQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CreateWhiteboardInputQuery,
    SchemaTypes.CreateWhiteboardInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreateWhiteboardInputQuery, SchemaTypes.CreateWhiteboardInputQueryVariables>(
    CreateWhiteboardInputDocument,
    options
  );
}

export function useCreateWhiteboardInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CreateWhiteboardInputQuery,
    SchemaTypes.CreateWhiteboardInputQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreateWhiteboardInputQuery, SchemaTypes.CreateWhiteboardInputQueryVariables>(
    CreateWhiteboardInputDocument,
    options
  );
}

export type CreateWhiteboardInputQueryHookResult = ReturnType<typeof useCreateWhiteboardInputQuery>;
export type CreateWhiteboardInputLazyQueryHookResult = ReturnType<typeof useCreateWhiteboardInputLazyQuery>;
export type CreateWhiteboardInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreateWhiteboardInputQuery,
  SchemaTypes.CreateWhiteboardInputQueryVariables
>;
export function refetchCreateWhiteboardInputQuery(variables: SchemaTypes.CreateWhiteboardInputQueryVariables) {
  return { query: CreateWhiteboardInputDocument, variables: variables };
}

export const CreatePostInputDocument = gql`
  query CreatePostInput($templateId: UUID!) {
    lookup {
      template(ID: $templateId) {
        id
        postDefaultDescription
      }
    }
  }
`;

/**
 * __useCreatePostInputQuery__
 *
 * To run a query within a React component, call `useCreatePostInputQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreatePostInputQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreatePostInputQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useCreatePostInputQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CreatePostInputQuery, SchemaTypes.CreatePostInputQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CreatePostInputQuery, SchemaTypes.CreatePostInputQueryVariables>(
    CreatePostInputDocument,
    options
  );
}

export function useCreatePostInputLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CreatePostInputQuery, SchemaTypes.CreatePostInputQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CreatePostInputQuery, SchemaTypes.CreatePostInputQueryVariables>(
    CreatePostInputDocument,
    options
  );
}

export type CreatePostInputQueryHookResult = ReturnType<typeof useCreatePostInputQuery>;
export type CreatePostInputLazyQueryHookResult = ReturnType<typeof useCreatePostInputLazyQuery>;
export type CreatePostInputQueryResult = Apollo.QueryResult<
  SchemaTypes.CreatePostInputQuery,
  SchemaTypes.CreatePostInputQueryVariables
>;
export function refetchCreatePostInputQuery(variables: SchemaTypes.CreatePostInputQueryVariables) {
  return { query: CreatePostInputDocument, variables: variables };
}

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
  >
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

export type AuthorizationPolicyQueryHookResult = ReturnType<typeof useAuthorizationPolicyQuery>;
export type AuthorizationPolicyLazyQueryHookResult = ReturnType<typeof useAuthorizationPolicyLazyQuery>;
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
  >
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

export type AuthorizationPrivilegesForUserQueryHookResult = ReturnType<typeof useAuthorizationPrivilegesForUserQuery>;
export type AuthorizationPrivilegesForUserLazyQueryHookResult = ReturnType<
  typeof useAuthorizationPrivilegesForUserLazyQuery
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

export type GuidanceRoomIdQueryHookResult = ReturnType<typeof useGuidanceRoomIdQuery>;
export type GuidanceRoomIdLazyQueryHookResult = ReturnType<typeof useGuidanceRoomIdLazyQuery>;
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
  >
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

export type GuidanceRoomMessagesQueryHookResult = ReturnType<typeof useGuidanceRoomMessagesQuery>;
export type GuidanceRoomMessagesLazyQueryHookResult = ReturnType<typeof useGuidanceRoomMessagesLazyQuery>;
export type GuidanceRoomMessagesQueryResult = Apollo.QueryResult<
  SchemaTypes.GuidanceRoomMessagesQuery,
  SchemaTypes.GuidanceRoomMessagesQueryVariables
>;
export function refetchGuidanceRoomMessagesQuery(variables: SchemaTypes.GuidanceRoomMessagesQueryVariables) {
  return { query: GuidanceRoomMessagesDocument, variables: variables };
}

export const InAppNotificationsDocument = gql`
  query InAppNotifications {
    notifications {
      id
      type
      category
      state
      triggeredAt
      ... on InAppNotificationCalloutPublished {
        ...InAppNotificationCalloutPublished
      }
      ... on InAppNotificationCommunityNewMember {
        ...InAppNotificationCommunityNewMember
      }
      ... on InAppNotificationUserMentioned {
        ...InAppNotificationUserMentioned
      }
    }
  }
  ${InAppNotificationCalloutPublishedFragmentDoc}
  ${InAppNotificationCommunityNewMemberFragmentDoc}
  ${InAppNotificationUserMentionedFragmentDoc}
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

export type InAppNotificationsQueryHookResult = ReturnType<typeof useInAppNotificationsQuery>;
export type InAppNotificationsLazyQueryHookResult = ReturnType<typeof useInAppNotificationsLazyQuery>;
export type InAppNotificationsQueryResult = Apollo.QueryResult<
  SchemaTypes.InAppNotificationsQuery,
  SchemaTypes.InAppNotificationsQueryVariables
>;
export function refetchInAppNotificationsQuery(variables?: SchemaTypes.InAppNotificationsQueryVariables) {
  return { query: InAppNotificationsDocument, variables: variables };
}

export const UpdateNotificationStateDocument = gql`
  mutation UpdateNotificationState($ID: UUID!, $state: InAppNotificationState!) {
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UrlResolverQuery, SchemaTypes.UrlResolverQueryVariables>
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

export type UrlResolverQueryHookResult = ReturnType<typeof useUrlResolverQuery>;
export type UrlResolverLazyQueryHookResult = ReturnType<typeof useUrlResolverLazyQuery>;
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceUrlResolverQuery, SchemaTypes.SpaceUrlResolverQueryVariables>
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

export type SpaceUrlResolverQueryHookResult = ReturnType<typeof useSpaceUrlResolverQuery>;
export type SpaceUrlResolverLazyQueryHookResult = ReturnType<typeof useSpaceUrlResolverLazyQuery>;
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
      journeyResults {
        id
        score
        terms
        type
        ... on SearchResultSpace {
          ...SearchResultSpace
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
      calloutResultsCount
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
              type
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
            collaborationTemplatesCount
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

export type InnovationLibraryQueryHookResult = ReturnType<typeof useInnovationLibraryQuery>;
export type InnovationLibraryLazyQueryHookResult = ReturnType<typeof useInnovationLibraryLazyQuery>;
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

export type CampaignBlockCredentialsQueryHookResult = ReturnType<typeof useCampaignBlockCredentialsQuery>;
export type CampaignBlockCredentialsLazyQueryHookResult = ReturnType<typeof useCampaignBlockCredentialsLazyQuery>;
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

export type DashboardWithMembershipsQueryHookResult = ReturnType<typeof useDashboardWithMembershipsQuery>;
export type DashboardWithMembershipsLazyQueryHookResult = ReturnType<typeof useDashboardWithMembershipsLazyQuery>;
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
      journeyResults {
        id
        type
        ... on SearchResultSpace {
          ...ExploreSpacesSearch
        }
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
  >
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

export type ExploreSpacesSearchQueryHookResult = ReturnType<typeof useExploreSpacesSearchQuery>;
export type ExploreSpacesSearchLazyQueryHookResult = ReturnType<typeof useExploreSpacesSearchLazyQuery>;
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

export type ExploreAllSpacesQueryHookResult = ReturnType<typeof useExploreAllSpacesQuery>;
export type ExploreAllSpacesLazyQueryHookResult = ReturnType<typeof useExploreAllSpacesLazyQuery>;
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.WelcomeSpaceQuery, SchemaTypes.WelcomeSpaceQueryVariables>
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

export type WelcomeSpaceQueryHookResult = ReturnType<typeof useWelcomeSpaceQuery>;
export type WelcomeSpaceLazyQueryHookResult = ReturnType<typeof useWelcomeSpaceLazyQuery>;
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

export type PendingInvitationsQueryHookResult = ReturnType<typeof usePendingInvitationsQuery>;
export type PendingInvitationsLazyQueryHookResult = ReturnType<typeof usePendingInvitationsLazyQuery>;
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
        journeyDisplayName: parentDisplayName
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
  ${SpaceAboutCardBannerFragmentDoc}
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
      journeyDisplayName: parentDisplayName
      space {
        id
        ... on Space {
          about {
            ...SpaceAboutCardAvatar
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
  ${SpaceAboutCardAvatarFragmentDoc}
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

export const LatestContributionsSpacesFlatDocument = gql`
  query LatestContributionsSpacesFlat {
    me {
      spaceMembershipsFlat {
        id
        space {
          id
          about {
            ...SpaceAboutLight
          }
        }
      }
    }
  }
  ${SpaceAboutLightFragmentDoc}
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

export type LatestContributionsSpacesFlatQueryHookResult = ReturnType<typeof useLatestContributionsSpacesFlatQuery>;
export type LatestContributionsSpacesFlatLazyQueryHookResult = ReturnType<
  typeof useLatestContributionsSpacesFlatLazyQuery
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

export type MyMembershipsQueryHookResult = ReturnType<typeof useMyMembershipsQuery>;
export type MyMembershipsLazyQueryHookResult = ReturnType<typeof useMyMembershipsLazyQuery>;
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
                ...VisualUri
              }
            }
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
              ...VisualUri
            }
          }
          subdomain
        }
      }
    }
  }
  ${SpaceAboutCardBannerFragmentDoc}
  ${VisualUriFragmentDoc}
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.MyResourcesQuery, SchemaTypes.MyResourcesQueryVariables>
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

export type MyResourcesQueryHookResult = ReturnType<typeof useMyResourcesQuery>;
export type MyResourcesLazyQueryHookResult = ReturnType<typeof useMyResourcesLazyQuery>;
export type MyResourcesQueryResult = Apollo.QueryResult<
  SchemaTypes.MyResourcesQuery,
  SchemaTypes.MyResourcesQueryVariables
>;
export function refetchMyResourcesQuery(variables: SchemaTypes.MyResourcesQueryVariables) {
  return { query: MyResourcesDocument, variables: variables };
}

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

export type NewVirtualContributorMySpacesQueryHookResult = ReturnType<typeof useNewVirtualContributorMySpacesQuery>;
export type NewVirtualContributorMySpacesLazyQueryHookResult = ReturnType<
  typeof useNewVirtualContributorMySpacesLazyQuery
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
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AllSpaceSubspacesQuery, SchemaTypes.AllSpaceSubspacesQueryVariables>
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

export type AllSpaceSubspacesQueryHookResult = ReturnType<typeof useAllSpaceSubspacesQuery>;
export type AllSpaceSubspacesLazyQueryHookResult = ReturnType<typeof useAllSpaceSubspacesLazyQuery>;
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
          settings {
            privacy {
              mode
            }
          }
          about {
            ...SpaceAboutCardBanner
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

export type RecentSpacesQueryHookResult = ReturnType<typeof useRecentSpacesQuery>;
export type RecentSpacesLazyQueryHookResult = ReturnType<typeof useRecentSpacesLazyQuery>;
export type RecentSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.RecentSpacesQuery,
  SchemaTypes.RecentSpacesQueryVariables
>;
export function refetchRecentSpacesQuery(variables?: SchemaTypes.RecentSpacesQueryVariables) {
  return { query: RecentSpacesDocument, variables: variables };
}

export const ChallengeExplorerPageDocument = gql`
  query ChallengeExplorerPage {
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

export type SpaceExplorerSubspacesQueryHookResult = ReturnType<typeof useSpaceExplorerSubspacesQuery>;
export type SpaceExplorerSubspacesLazyQueryHookResult = ReturnType<typeof useSpaceExplorerSubspacesLazyQuery>;
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
  >
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

export type SpaceExplorerWelcomeSpaceQueryHookResult = ReturnType<typeof useSpaceExplorerWelcomeSpaceQuery>;
export type SpaceExplorerWelcomeSpaceLazyQueryHookResult = ReturnType<typeof useSpaceExplorerWelcomeSpaceLazyQuery>;
export type SpaceExplorerWelcomeSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceExplorerWelcomeSpaceQuery,
  SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables
>;
export function refetchSpaceExplorerWelcomeSpaceQuery(variables: SchemaTypes.SpaceExplorerWelcomeSpaceQueryVariables) {
  return { query: SpaceExplorerWelcomeSpaceDocument, variables: variables };
}
