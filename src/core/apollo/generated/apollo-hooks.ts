import * as SchemaTypes from './graphql-schema';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const MyPrivilegesFragmentDoc = gql`
  fragment MyPrivileges on Authorization {
    myPrivileges
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
export const TagsetDetailsFragmentDoc = gql`
  fragment TagsetDetails on Tagset {
    id
    name
    tags
    allowedValues
    type
  }
`;
export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
    id
    nameID
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
export const WhiteboardProfileFragmentDoc = gql`
  fragment WhiteboardProfile on Profile {
    id
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
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const CheckoutDetailsFragmentDoc = gql`
  fragment CheckoutDetails on WhiteboardCheckout {
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
    checkout {
      ...CheckoutDetails
    }
    createdBy {
      id
      profile {
        id
        displayName
        visual(type: AVATAR) {
          id
          uri
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
  ${CheckoutDetailsFragmentDoc}
`;
export const DashboardTopCalloutFragmentDoc = gql`
  fragment DashboardTopCallout on Callout {
    id
    nameID
    profile {
      id
      displayName
      description
    }
    type
    visibility
    posts(limit: 2, shuffle: true) {
      ...PostCard
    }
    whiteboards(limit: 2, shuffle: true) {
      ...WhiteboardDetails
    }
    activity
  }
  ${PostCardFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
`;
export const DashboardTopCalloutsFragmentDoc = gql`
  fragment DashboardTopCallouts on Collaboration {
    id
    callouts(sortByActivity: true) {
      ...DashboardTopCallout
    }
  }
  ${DashboardTopCalloutFragmentDoc}
`;
export const VisualUriFragmentDoc = gql`
  fragment VisualUri on Visual {
    id
    uri
    name
  }
`;
export const DashboardLeadUserFragmentDoc = gql`
  fragment DashboardLeadUser on User {
    id
    nameID
    profile {
      id
      displayName
      visual(type: AVATAR) {
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
    }
  }
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
    nameID
    profile {
      id
      displayName
      tagline
      tagset {
        ...TagsetDetails
      }
      visuals {
        ...VisualFull
      }
    }
    metrics {
      id
      name
      value
    }
    innovationFlow {
      id
      lifecycle {
        id
        state
      }
    }
    context {
      ...ContextDetails
    }
    projects {
      id
      nameID
      profile {
        id
        displayName
        description
      }
      lifecycle {
        id
        state
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
  ${ContextDetailsFragmentDoc}
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
    innovationFlow {
      id
      lifecycle {
        id
        machineDef
        state
        nextEvents
        stateIsFinal
      }
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
      ...DashboardTopCallouts
    }
    community {
      ...EntityDashboardCommunity
    }
    opportunities {
      ...OpportunityCard
    }
  }
  ${VisualFullFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
  ${OpportunityCardFragmentDoc}
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
export const ChallengeInfoFragmentDoc = gql`
  fragment ChallengeInfo on Challenge {
    id
    nameID
    profile {
      id
      displayName
      tagline
      description
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
export const LifecycleContextTabFragmentDoc = gql`
  fragment LifecycleContextTab on Lifecycle {
    id
    state
    machineDef
  }
`;
export const MetricsItemFragmentDoc = gql`
  fragment MetricsItem on NVP {
    id
    name
    value
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
export const OpportunityPageFragmentDoc = gql`
  fragment OpportunityPage on Opportunity {
    id
    nameID
    profile {
      id
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
    innovationFlow {
      lifecycle {
        id
        machineDef
        state
        nextEvents
        stateIsFinal
      }
    }
    collaboration {
      id
      relations {
        id
        type
        actorRole
        actorName
        actorType
        description
      }
      ...DashboardTopCallouts
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
  ${EntityDashboardCommunityFragmentDoc}
`;
export const OpportunityPageRelationsFragmentDoc = gql`
  fragment OpportunityPageRelations on Relation {
    id
    type
    actorRole
    actorName
    actorType
    description
  }
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
    visibility
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
export const ChallengeCardFragmentDoc = gql`
  fragment ChallengeCard on Challenge {
    id
    nameID
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
      tagline
      displayName
      description
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
    }
    innovationFlow {
      id
      lifecycle {
        id
        state
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;
export const SpacePageFragmentDoc = gql`
  fragment SpacePage on Space {
    id
    nameID
    visibility
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
    collaboration {
      ...DashboardTopCallouts
    }
    community {
      ...EntityDashboardCommunity
      leadUsers: usersInRole(role: LEAD) {
        profile {
          ...SpaceWelcomeBlockContributorProfile
        }
      }
    }
    challenges(limit: 3, shuffle: true) {
      ...ChallengeCard
    }
    timeline {
      id
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
    }
  }
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${SpaceWelcomeBlockContributorProfileFragmentDoc}
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
  ${ChallengeCardFragmentDoc}
`;
export const SpaceDashboardNavigationProfileFragmentDoc = gql`
  fragment SpaceDashboardNavigationProfile on Profile {
    id
    displayName
    tagline
    tagset {
      ...TagsetDetails
    }
    visual(type: CARD) {
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
export const SpaceDashboardNavigationLifecycleFragmentDoc = gql`
  fragment SpaceDashboardNavigationLifecycle on Lifecycle {
    id
    state
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
export const InnovationFlowTemplateFragmentDoc = gql`
  fragment InnovationFlowTemplate on InnovationFlowTemplate {
    id
    definition
    type
    profile {
      ...TemplateCardProfileInfo
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
`;
export const SpaceTemplatesFragmentDoc = gql`
  fragment SpaceTemplates on Space {
    templates {
      id
      postTemplates {
        ...PostTemplateCard
      }
      whiteboardTemplates {
        ...WhiteboardTemplateCard
      }
      innovationFlowTemplates {
        ...InnovationFlowTemplate
      }
    }
  }
  ${PostTemplateCardFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
  ${InnovationFlowTemplateFragmentDoc}
`;
export const WhiteboardTemplateWithValueFragmentDoc = gql`
  fragment WhiteboardTemplateWithValue on WhiteboardTemplate {
    ...WhiteboardTemplateCard
    value
  }
  ${WhiteboardTemplateCardFragmentDoc}
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
export const ContextDetailsProviderFragmentDoc = gql`
  fragment ContextDetailsProvider on Context {
    id
    vision
    impact
    who
  }
`;
export const SpaceDetailsProviderFragmentDoc = gql`
  fragment SpaceDetailsProvider on Space {
    id
    nameID
    profile {
      id
      displayName
      tagline
      visuals {
        ...VisualUri
      }
      tagset {
        ...TagsetDetails
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
    }
    context {
      ...ContextDetailsProvider
    }
    visibility
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
  ${ContextDetailsProviderFragmentDoc}
`;
export const SpaceNameFragmentDoc = gql`
  fragment SpaceName on Space {
    id
    nameID
    profile {
      id
      displayName
    }
  }
`;
export const AdminSpaceCommunityCandidateMemberFragmentDoc = gql`
  fragment AdminSpaceCommunityCandidateMember on User {
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
export const AdminSpaceCommunityApplicationFragmentDoc = gql`
  fragment AdminSpaceCommunityApplication on Application {
    id
    createdDate
    updatedDate
    lifecycle {
      id
      state
      nextEvents
    }
    user {
      ...AdminSpaceCommunityCandidateMember
    }
    questions {
      id
      name
      value
    }
  }
  ${AdminSpaceCommunityCandidateMemberFragmentDoc}
`;
export const AdminSpaceCommunityInvitationFragmentDoc = gql`
  fragment AdminSpaceCommunityInvitation on Invitation {
    id
    createdDate
    updatedDate
    lifecycle {
      id
      state
      nextEvents
    }
    user {
      ...AdminSpaceCommunityCandidateMember
    }
  }
  ${AdminSpaceCommunityCandidateMemberFragmentDoc}
`;
export const AdminSpaceCommunityInvitationExternalFragmentDoc = gql`
  fragment AdminSpaceCommunityInvitationExternal on InvitationExternal {
    id
    createdDate
    email
  }
`;
export const ActivityLogMemberJoinedFragmentDoc = gql`
  fragment ActivityLogMemberJoined on ActivityLogEntryMemberJoined {
    communityType
    community {
      id
      displayName
    }
    user {
      id
      nameID
      firstName
      lastName
      profile {
        id
        displayName
        visual(type: AVATAR) {
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
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const ActivityLogCalloutPublishedFragmentDoc = gql`
  fragment ActivityLogCalloutPublished on ActivityLogEntryCalloutPublished {
    callout {
      id
      nameID
      type
      profile {
        id
        displayName
      }
    }
  }
`;
export const ActivityLogCalloutCardCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutCardCreated on ActivityLogEntryCalloutPostCreated {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    post {
      id
      nameID
      type
      profile {
        id
        displayName
        description
      }
    }
  }
`;
export const ActivityLogCalloutCardCommentFragmentDoc = gql`
  fragment ActivityLogCalloutCardComment on ActivityLogEntryCalloutPostComment {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    post {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
`;
export const ActivityLogCalloutWhiteboardCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutWhiteboardCreated on ActivityLogEntryCalloutWhiteboardCreated {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    whiteboard {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
`;
export const ActivityLogCalloutDiscussionCommentFragmentDoc = gql`
  fragment ActivityLogCalloutDiscussionComment on ActivityLogEntryCalloutDiscussionComment {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
`;
export const ActivityLogChallengeCreatedFragmentDoc = gql`
  fragment ActivityLogChallengeCreated on ActivityLogEntryChallengeCreated {
    challenge {
      id
      nameID
      profile {
        id
        displayName
        tagline
      }
    }
  }
`;
export const ActivityLogOpportunityCreatedFragmentDoc = gql`
  fragment ActivityLogOpportunityCreated on ActivityLogEntryOpportunityCreated {
    opportunity {
      id
      nameID
      profile {
        id
        displayName
        tagline
      }
    }
  }
`;
export const ActivityLogUpdateSentFragmentDoc = gql`
  fragment ActivityLogUpdateSent on ActivityLogEntryUpdateSent {
    message
  }
`;
export const ActivityLogOnCollaborationFragmentDoc = gql`
  fragment ActivityLogOnCollaboration on ActivityLogEntry {
    id
    collaborationID
    createdDate
    description
    type
    child
    parentNameID
    journeyDisplayName: parentDisplayName
    __typename
    triggeredBy {
      id
      nameID
      firstName
      lastName
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
        location {
          id
          city
          country
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
      ...ActivityLogCalloutCardCreated
    }
    ... on ActivityLogEntryCalloutPostComment {
      ...ActivityLogCalloutCardComment
    }
    ... on ActivityLogEntryCalloutWhiteboardCreated {
      ...ActivityLogCalloutWhiteboardCreated
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
  }
  ${TagsetDetailsFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutCardCreatedFragmentDoc}
  ${ActivityLogCalloutCardCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
`;
export const ProfileDisplayNameFragmentDoc = gql`
  fragment ProfileDisplayName on Profile {
    id
    displayName
  }
`;
export const PrivilegesOnCollaborationFragmentDoc = gql`
  fragment PrivilegesOnCollaboration on Collaboration {
    id
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
      firstName
      lastName
    }
  }
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
      id
      nameID
      firstName
      lastName
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
        location {
          id
          city
          country
        }
      }
    }
  }
  ${ReactionDetailsFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
export const CalloutPostTemplateFragmentDoc = gql`
  fragment CalloutPostTemplate on Callout {
    postTemplate {
      id
      type
      defaultDescription
      profile {
        tagset {
          ...TagsetDetails
        }
        visual(type: CARD) {
          id
          uri
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CalloutWhiteboardTemplateFragmentDoc = gql`
  fragment CalloutWhiteboardTemplate on Callout {
    whiteboardTemplate {
      id
      value
      profile {
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
    }
  }
  ${TagsetDetailsFragmentDoc}
`;
export const CalloutFragmentDoc = gql`
  fragment Callout on Callout {
    id
    nameID
    type
    group
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
    }
    state
    sortOrder
    activity
    whiteboards {
      ...WhiteboardDetails
    }
    comments {
      ...CommentsWithMessages
    }
    authorization {
      id
      myPrivileges
    }
    visibility
    ...CalloutPostTemplate
    ...CalloutWhiteboardTemplate
  }
  ${TagsetDetailsFragmentDoc}
  ${ReferenceDetailsFragmentDoc}
  ${WhiteboardDetailsFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
  ${CalloutPostTemplateFragmentDoc}
  ${CalloutWhiteboardTemplateFragmentDoc}
`;
export const CollaborationWithCalloutsFragmentDoc = gql`
  fragment CollaborationWithCallouts on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    callouts(groups: $calloutGroups, IDs: $calloutIds) {
      ...Callout
    }
  }
  ${CalloutFragmentDoc}
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
export const PostsOnCalloutFragmentDoc = gql`
  fragment PostsOnCallout on Callout {
    id
    posts {
      ...ContributeTabPost
    }
  }
  ${ContributeTabPostFragmentDoc}
`;
export const PostDashboardFragmentDoc = gql`
  fragment PostDashboard on Post {
    id
    nameID
    type
    createdBy {
      id
      profile {
        id
        displayName
        visual(type: BANNER) {
          id
          uri
        }
        tagsets {
          ...TagsetDetails
        }
      }
    }
    createdDate
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
      visual(type: BANNER) {
        ...VisualUri
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
export const PostDashboardDataFragmentDoc = gql`
  fragment PostDashboardData on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    callouts(IDs: [$calloutNameId]) {
      id
      type
      posts(IDs: [$postNameId]) {
        ...PostDashboard
      }
    }
  }
  ${PostDashboardFragmentDoc}
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
    type
    posts(IDs: [$postNameId]) {
      ...PostSettings
    }
    postNames: posts {
      id
      profile {
        id
        displayName
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
export const PostProviderDataFragmentDoc = gql`
  fragment PostProviderData on Collaboration {
    id
    callouts(IDs: [$calloutNameId]) {
      id
      type
      posts(IDs: [$postNameId]) {
        ...PostProvided
      }
    }
  }
  ${PostProvidedFragmentDoc}
`;
export const CalloutPostInfoFragmentDoc = gql`
  fragment CalloutPostInfo on Collaboration {
    id
    callouts {
      id
      nameID
      type
      posts {
        id
        nameID
      }
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
export const InnovationFlowTemplateCardFragmentDoc = gql`
  fragment InnovationFlowTemplateCard on InnovationFlowTemplate {
    id
    definition
    type
    profile {
      ...TemplateCardProfileInfo
    }
  }
  ${TemplateCardProfileInfoFragmentDoc}
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
export const WhiteboardValueFragmentDoc = gql`
  fragment WhiteboardValue on Whiteboard {
    id
    value
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
    value
  }
`;
export const CalloutWithWhiteboardFragmentDoc = gql`
  fragment CalloutWithWhiteboard on Collaboration {
    id
    callouts(IDs: [$calloutId]) {
      id
      nameID
      type
      authorization {
        id
        anonymousReadAccess
        myPrivileges
      }
      whiteboards(IDs: [$whiteboardId]) {
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
      whiteboards {
        ...WhiteboardDetails
      }
    }
  }
  ${WhiteboardDetailsFragmentDoc}
`;
export const DiscussionDetailsFragmentDoc = gql`
  fragment DiscussionDetails on Discussion {
    id
    nameID
    profile {
      id
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
    displayName
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
export const AllCommunityDetailsFragmentDoc = gql`
  fragment AllCommunityDetails on Community {
    id
    displayName
  }
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
export const UserOrganizationsDetailsFragmentDoc = gql`
  fragment UserOrganizationsDetails on ContributorRoles {
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
      visual(type: AVATAR) {
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
export const MessagingUserInformationFragmentDoc = gql`
  fragment MessagingUserInformation on User {
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
    name
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
      visual(type: AVATAR) {
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
      spaceID
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
    applications {
      id
      communityID
      displayName
      state
      spaceID
      challengeID
      opportunityID
    }
  }
`;
export const PendingMembershipsJourneyProfileFragmentDoc = gql`
  fragment PendingMembershipsJourneyProfile on Profile {
    id
    displayName
    ... on Profile @include(if: $fetchDetails) {
      description
      tagset {
        id
        tags
      }
      banner: visual(type: BANNER) {
        id
        uri
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
export const InnovationHubHomeInnovationHubFragmentDoc = gql`
  fragment InnovationHubHomeInnovationHub on InnovationHub {
    id
    nameID
    profile {
      id
      displayName
      tagline
      description
      banner: visual(type: BANNER) {
        id
        uri
        alternativeText
      }
    }
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
    visual(type: BANNER) {
      ...VisualFull
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualFullFragmentDoc}
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
      definition
      type
    }
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
        id
        uri
      }
    }
  }
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
export const AdminSpaceFragmentDoc = gql`
  fragment AdminSpace on Space {
    id
    nameID
    visibility
    profile {
      id
      displayName
    }
    authorization {
      id
      myPrivileges
    }
  }
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
  }
`;
export const AdminWhiteboardTemplateValueFragmentDoc = gql`
  fragment AdminWhiteboardTemplateValue on WhiteboardTemplate {
    id
    value
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
  }
  ${TagsetDetailsFragmentDoc}
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
    definition
    type
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
    platform {
      environment
      domain
      about
      feedback
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
    apm {
      rumEnabled
      endpoint
    }
    geo {
      endpoint
    }
  }
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
      nameID
      profile {
        id
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    challenge {
      id
      nameID
      profile {
        id
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    opportunity {
      id
      nameID
      profile {
        id
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
`;
export const SearchResultPostFragmentDoc = gql`
  fragment SearchResultPost on SearchResultPost {
    post {
      id
      nameID
      profile {
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
      nameID
      profile {
        id
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
      visibility
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const SearchResultChallengeFragmentDoc = gql`
  fragment SearchResultChallenge on SearchResultChallenge {
    challenge {
      id
      nameID
      profile {
        id
        displayName
        tagset {
          ...TagsetDetails
        }
        tagline
        visuals {
          ...VisualUri
        }
      }
      spaceID
      context {
        id
        vision
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    space {
      id
      nameID
      profile {
        id
        displayName
        tagline
      }
      authorization {
        id
        anonymousReadAccess
      }
      visibility
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export const SearchResultOpportunityFragmentDoc = gql`
  fragment SearchResultOpportunity on SearchResultOpportunity {
    opportunity {
      id
      nameID
      profile {
        id
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
    }
    challenge {
      id
      nameID
      profile {
        id
        displayName
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    space {
      id
      nameID
      profile {
        id
        displayName
      }
      visibility
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
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
      profile {
        ...ProfileStorageConfig
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;
export const PostInCalloutOnCollaborationWithStorageConfigFragmentDoc = gql`
  fragment PostInCalloutOnCollaborationWithStorageConfig on Collaboration {
    id
    callouts(IDs: [$calloutId]) {
      id
      posts(IDs: [$postId]) {
        id
        profile {
          ...ProfileStorageConfig
        }
      }
    }
  }
  ${ProfileStorageConfigFragmentDoc}
`;
export const EventProfileFragmentDoc = gql`
  fragment EventProfile on Profile {
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
export const CalendarEventDetailsFragmentDoc = gql`
  fragment CalendarEventDetails on CalendarEvent {
    ...CalendarEventInfo
    type
    createdBy {
      id
      profile {
        id
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
export const ChallengePageDocument = gql`
  query challengePage($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query ChallengeDashboardReferences($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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
export const ChallengeActivityDocument = gql`
  query challengeActivity($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        metrics {
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
 *      spaceId: // value for 'spaceId'
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
  query challengeApplicationTemplate($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengeCardDocument = gql`
  query challengeCard($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query challengeCards($spaceId: UUID_NAMEID!) {
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengeInfoDocument = gql`
  query challengeInfo($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengeLifecycleDocument = gql`
  query challengeLifecycle($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        innovationFlow {
          id
          lifecycle {
            id
            machineDef
            state
            nextEvents
            stateIsFinal
            templateName
          }
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengeNameDocument = gql`
  query challengeName($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
      challenge(ID: $challengeId) {
        id
        nameID
        profile {
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
 *      spaceId: // value for 'spaceId'
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
  query challengeProfileInfo($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        nameID
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
        }
        innovationFlow {
          id
          lifecycle {
            id
            state
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
 *      spaceId: // value for 'spaceId'
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
export const UpdateInnovationFlowLifecycleTemplateDocument = gql`
  mutation UpdateInnovationFlowLifecycleTemplate($input: UpdateInnovationFlowLifecycleTemplateInput!) {
    updateInnovationFlowLifecycleTemplate(innovationFlowData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type UpdateInnovationFlowLifecycleTemplateMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutation,
  SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutationVariables
>;

/**
 * __useUpdateInnovationFlowLifecycleTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateInnovationFlowLifecycleTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInnovationFlowLifecycleTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInnovationFlowLifecycleTemplateMutation, { data, loading, error }] = useUpdateInnovationFlowLifecycleTemplateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateInnovationFlowLifecycleTemplateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutation,
    SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutation,
    SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutationVariables
  >(UpdateInnovationFlowLifecycleTemplateDocument, options);
}

export type UpdateInnovationFlowLifecycleTemplateMutationHookResult = ReturnType<
  typeof useUpdateInnovationFlowLifecycleTemplateMutation
>;
export type UpdateInnovationFlowLifecycleTemplateMutationResult =
  Apollo.MutationResult<SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutation>;
export type UpdateInnovationFlowLifecycleTemplateMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutation,
  SchemaTypes.UpdateInnovationFlowLifecycleTemplateMutationVariables
>;
export const AboutPageNonMembersDocument = gql`
  query AboutPageNonMembers(
    $spaceNameId: UUID_NAMEID!
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        nameID
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
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        nameID
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
        }
        authorization {
          id
          myPrivileges
        }
        innovationFlow {
          id
          lifecycle {
            ...LifecycleContextTab
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
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        nameID
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
        }
        innovationFlow {
          id
          lifecycle {
            ...LifecycleContextTab
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
  ${LifecycleContextTabFragmentDoc}
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
 *      spaceNameId: // value for 'spaceNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
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
  query AboutPageMembers(
    $spaceNameId: UUID_NAMEID!
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $communityReadAccess: Boolean!
    $referencesReadAccess: Boolean!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
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
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
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
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      communityReadAccess: // value for 'communityReadAccess'
 *      referencesReadAccess: // value for 'referencesReadAccess'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
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
export const JourneyCommunityPrivilegesDocument = gql`
  query JourneyCommunityPrivileges(
    $spaceNameId: UUID_NAMEID!
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        community {
          id
          authorization {
            id
            myPrivileges
          }
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *   },
 * });
 */
export function useJourneyCommunityPrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<
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
  variables: SchemaTypes.JourneyCommunityPrivilegesQueryVariables
) {
  return { query: JourneyCommunityPrivilegesDocument, variables: variables };
}

export const JourneyDataDocument = gql`
  query JourneyData(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $includeCommunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
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
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
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
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      includeCommunity: // value for 'includeCommunity'
 *   },
 * });
 */
export function useJourneyDataQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.JourneyDataQuery, SchemaTypes.JourneyDataQueryVariables>
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
export function refetchJourneyDataQuery(variables: SchemaTypes.JourneyDataQueryVariables) {
  return { query: JourneyDataDocument, variables: variables };
}

export const JourneyPrivilegesDocument = gql`
  query JourneyPrivileges(
    $spaceNameId: UUID_NAMEID!
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        authorization {
          id
          myPrivileges
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        authorization {
          id
          myPrivileges
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *   },
 * });
 */
export function useJourneyPrivilegesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.JourneyPrivilegesQuery, SchemaTypes.JourneyPrivilegesQueryVariables>
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
export function refetchJourneyPrivilegesQuery(variables: SchemaTypes.JourneyPrivilegesQueryVariables) {
  return { query: JourneyPrivilegesDocument, variables: variables };
}

export const OpportunityPageDocument = gql`
  query opportunityPage($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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

export const EventOnOpportunityDocument = gql`
  mutation eventOnOpportunity($innovationFlowId: UUID!, $eventName: String!) {
    eventOnOpportunity(innovationFlowEventData: { innovationFlowID: $innovationFlowId, eventName: $eventName }) {
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
 *      innovationFlowId: // value for 'innovationFlowId'
 *      eventName: // value for 'eventName'
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
export const OpportunityProviderDocument = gql`
  query opportunityProvider($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
export const AllOpportunitiesDocument = gql`
  query allOpportunities($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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

export const OpportunitiesDocument = gql`
  query opportunities($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityActivity($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        metrics {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityActorGroups($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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

export const OpportunityCardsDocument = gql`
  query opportunityCards($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 * __useOpportunityCardsQuery__
 *
 * To run a query within a React component, call `useOpportunityCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCardsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useOpportunityCardsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityCardsQuery, SchemaTypes.OpportunityCardsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityCardsQuery, SchemaTypes.OpportunityCardsQueryVariables>(
    OpportunityCardsDocument,
    options
  );
}

export function useOpportunityCardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCardsQuery,
    SchemaTypes.OpportunityCardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityCardsQuery, SchemaTypes.OpportunityCardsQueryVariables>(
    OpportunityCardsDocument,
    options
  );
}

export type OpportunityCardsQueryHookResult = ReturnType<typeof useOpportunityCardsQuery>;
export type OpportunityCardsLazyQueryHookResult = ReturnType<typeof useOpportunityCardsLazyQuery>;
export type OpportunityCardsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCardsQuery,
  SchemaTypes.OpportunityCardsQueryVariables
>;
export function refetchOpportunityCardsQuery(variables: SchemaTypes.OpportunityCardsQueryVariables) {
  return { query: OpportunityCardsDocument, variables: variables };
}

export const OpportunityEcosystemDetailsDocument = gql`
  query opportunityEcosystemDetails($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityGroups($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityLifecycle($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        innovationFlow {
          id
          lifecycle {
            id
            machineDef
            state
            nextEvents
            stateIsFinal
            templateName
          }
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityName($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityProfileInfo($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
        innovationFlow {
          id
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityRelations($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        collaboration {
          id
          relations {
            id
            actorRole
            actorName
            actorType
            description
            type
          }
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityUserIds($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        community {
          memberUsers {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityWithActivity($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunities {
        id
        profile {
          id
          displayName
          tagline
          visuals {
            ...VisualUri
          }
          tagset {
            ...TagsetDetails
          }
        }
        nameID
        metrics {
          id
          name
          value
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
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
  query spacePage($spaceId: UUID_NAMEID!) {
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
        nameID
        profile {
          ...SpaceDashboardNavigationProfile
        }
        context {
          ...SpaceDashboardNavigationContext
        }
        innovationFlow {
          id
          lifecycle {
            ...SpaceDashboardNavigationLifecycle
          }
        }
        authorization {
          id
          myPrivileges
        }
        community {
          id
          myMembershipStatus
        }
      }
      visibility
    }
  }
  ${SpaceDashboardNavigationProfileFragmentDoc}
  ${SpaceDashboardNavigationContextFragmentDoc}
  ${SpaceDashboardNavigationLifecycleFragmentDoc}
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
          nameID
          profile {
            ...SpaceDashboardNavigationProfile
          }
          context {
            ...SpaceDashboardNavigationContext
          }
          innovationFlow {
            id
            lifecycle {
              ...SpaceDashboardNavigationLifecycle
            }
          }
        }
      }
    }
  }
  ${SpaceDashboardNavigationProfileFragmentDoc}
  ${SpaceDashboardNavigationContextFragmentDoc}
  ${SpaceDashboardNavigationLifecycleFragmentDoc}
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

export const SpaceTemplatesDocument = gql`
  query SpaceTemplates($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      ...SpaceTemplates
    }
  }
  ${SpaceTemplatesFragmentDoc}
`;

/**
 * __useSpaceTemplatesQuery__
 *
 * To run a query within a React component, call `useSpaceTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplatesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceTemplatesQuery, SchemaTypes.SpaceTemplatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceTemplatesQuery, SchemaTypes.SpaceTemplatesQueryVariables>(
    SpaceTemplatesDocument,
    options
  );
}

export function useSpaceTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceTemplatesQuery, SchemaTypes.SpaceTemplatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceTemplatesQuery, SchemaTypes.SpaceTemplatesQueryVariables>(
    SpaceTemplatesDocument,
    options
  );
}

export type SpaceTemplatesQueryHookResult = ReturnType<typeof useSpaceTemplatesQuery>;
export type SpaceTemplatesLazyQueryHookResult = ReturnType<typeof useSpaceTemplatesLazyQuery>;
export type SpaceTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplatesQuery,
  SchemaTypes.SpaceTemplatesQueryVariables
>;
export function refetchSpaceTemplatesQuery(variables: SchemaTypes.SpaceTemplatesQueryVariables) {
  return { query: SpaceTemplatesDocument, variables: variables };
}

export const CalloutFormTemplatesFromSpaceDocument = gql`
  query CalloutFormTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
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

export const PostTemplatesFromSpaceDocument = gql`
  query PostTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        postTemplates {
          ...PostTemplateCard
        }
      }
    }
  }
  ${PostTemplateCardFragmentDoc}
`;

/**
 * __usePostTemplatesFromSpaceQuery__
 *
 * To run a query within a React component, call `usePostTemplatesFromSpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostTemplatesFromSpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostTemplatesFromSpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function usePostTemplatesFromSpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PostTemplatesFromSpaceQuery,
    SchemaTypes.PostTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostTemplatesFromSpaceQuery, SchemaTypes.PostTemplatesFromSpaceQueryVariables>(
    PostTemplatesFromSpaceDocument,
    options
  );
}

export function usePostTemplatesFromSpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PostTemplatesFromSpaceQuery,
    SchemaTypes.PostTemplatesFromSpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostTemplatesFromSpaceQuery, SchemaTypes.PostTemplatesFromSpaceQueryVariables>(
    PostTemplatesFromSpaceDocument,
    options
  );
}

export type PostTemplatesFromSpaceQueryHookResult = ReturnType<typeof usePostTemplatesFromSpaceQuery>;
export type PostTemplatesFromSpaceLazyQueryHookResult = ReturnType<typeof usePostTemplatesFromSpaceLazyQuery>;
export type PostTemplatesFromSpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.PostTemplatesFromSpaceQuery,
  SchemaTypes.PostTemplatesFromSpaceQueryVariables
>;
export function refetchPostTemplatesFromSpaceQuery(variables: SchemaTypes.PostTemplatesFromSpaceQueryVariables) {
  return { query: PostTemplatesFromSpaceDocument, variables: variables };
}

export const WhiteboardTemplatesFromSpaceDocument = gql`
  query WhiteboardTemplatesFromSpace($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplates {
          ...WhiteboardTemplateCard
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
      templates {
        id
        innovationFlowTemplates {
          ...InnovationFlowTemplate
        }
      }
    }
  }
  ${InnovationFlowTemplateFragmentDoc}
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

export const SpaceTemplatesWhiteboardTemplateWithValueDocument = gql`
  query SpaceTemplatesWhiteboardTemplateWithValue($spaceId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $whiteboardTemplateId) {
          ...WhiteboardTemplateWithValue
        }
      }
    }
  }
  ${WhiteboardTemplateWithValueFragmentDoc}
`;

/**
 * __useSpaceTemplatesWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useSpaceTemplatesWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplatesWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplatesWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useSpaceTemplatesWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
  >(SpaceTemplatesWhiteboardTemplateWithValueDocument, options);
}

export function useSpaceTemplatesWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
  >(SpaceTemplatesWhiteboardTemplateWithValueDocument, options);
}

export type SpaceTemplatesWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useSpaceTemplatesWhiteboardTemplateWithValueQuery
>;
export type SpaceTemplatesWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useSpaceTemplatesWhiteboardTemplateWithValueLazyQuery
>;
export type SpaceTemplatesWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQuery,
  SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
>;
export function refetchSpaceTemplatesWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.SpaceTemplatesWhiteboardTemplateWithValueQueryVariables
) {
  return { query: SpaceTemplatesWhiteboardTemplateWithValueDocument, variables: variables };
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
export const SpaceActivityDocument = gql`
  query spaceActivity($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      metrics {
        name
        value
      }
    }
  }
`;

/**
 * __useSpaceActivityQuery__
 *
 * To run a query within a React component, call `useSpaceActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceActivityQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceActivityQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceActivityQuery, SchemaTypes.SpaceActivityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceActivityQuery, SchemaTypes.SpaceActivityQueryVariables>(
    SpaceActivityDocument,
    options
  );
}

export function useSpaceActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceActivityQuery, SchemaTypes.SpaceActivityQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceActivityQuery, SchemaTypes.SpaceActivityQueryVariables>(
    SpaceActivityDocument,
    options
  );
}

export type SpaceActivityQueryHookResult = ReturnType<typeof useSpaceActivityQuery>;
export type SpaceActivityLazyQueryHookResult = ReturnType<typeof useSpaceActivityLazyQuery>;
export type SpaceActivityQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceActivityQuery,
  SchemaTypes.SpaceActivityQueryVariables
>;
export function refetchSpaceActivityQuery(variables: SchemaTypes.SpaceActivityQueryVariables) {
  return { query: SpaceActivityDocument, variables: variables };
}

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
      ...SpaceDetailsProvider
    }
  }
  ${SpaceDetailsProviderFragmentDoc}
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

export const SpaceGroupsListDocument = gql`
  query spaceGroupsList($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useSpaceGroupsListQuery__
 *
 * To run a query within a React component, call `useSpaceGroupsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceGroupsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceGroupsListQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceGroupsListQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceGroupsListQuery, SchemaTypes.SpaceGroupsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceGroupsListQuery, SchemaTypes.SpaceGroupsListQueryVariables>(
    SpaceGroupsListDocument,
    options
  );
}

export function useSpaceGroupsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceGroupsListQuery, SchemaTypes.SpaceGroupsListQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceGroupsListQuery, SchemaTypes.SpaceGroupsListQueryVariables>(
    SpaceGroupsListDocument,
    options
  );
}

export type SpaceGroupsListQueryHookResult = ReturnType<typeof useSpaceGroupsListQuery>;
export type SpaceGroupsListLazyQueryHookResult = ReturnType<typeof useSpaceGroupsListLazyQuery>;
export type SpaceGroupsListQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceGroupsListQuery,
  SchemaTypes.SpaceGroupsListQueryVariables
>;
export function refetchSpaceGroupsListQuery(variables: SchemaTypes.SpaceGroupsListQueryVariables) {
  return { query: SpaceGroupsListDocument, variables: variables };
}

export const SpaceHostReferencesDocument = gql`
  query spaceHostReferences($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 * __useSpaceHostReferencesQuery__
 *
 * To run a query within a React component, call `useSpaceHostReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceHostReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceHostReferencesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceHostReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceHostReferencesQuery,
    SchemaTypes.SpaceHostReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceHostReferencesQuery, SchemaTypes.SpaceHostReferencesQueryVariables>(
    SpaceHostReferencesDocument,
    options
  );
}

export function useSpaceHostReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceHostReferencesQuery,
    SchemaTypes.SpaceHostReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceHostReferencesQuery, SchemaTypes.SpaceHostReferencesQueryVariables>(
    SpaceHostReferencesDocument,
    options
  );
}

export type SpaceHostReferencesQueryHookResult = ReturnType<typeof useSpaceHostReferencesQuery>;
export type SpaceHostReferencesLazyQueryHookResult = ReturnType<typeof useSpaceHostReferencesLazyQuery>;
export type SpaceHostReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceHostReferencesQuery,
  SchemaTypes.SpaceHostReferencesQueryVariables
>;
export function refetchSpaceHostReferencesQuery(variables: SchemaTypes.SpaceHostReferencesQueryVariables) {
  return { query: SpaceHostReferencesDocument, variables: variables };
}

export const SpaceInnovationFlowTemplatesDocument = gql`
  query spaceInnovationFlowTemplates($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        innovationFlowTemplates {
          definition
          id
          type
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

export const SpaceMembersDocument = gql`
  query spaceMembers($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      community {
        id
        memberUsers {
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
    }
  }
`;

/**
 * __useSpaceMembersQuery__
 *
 * To run a query within a React component, call `useSpaceMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceMembersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceMembersQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceMembersQuery, SchemaTypes.SpaceMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceMembersQuery, SchemaTypes.SpaceMembersQueryVariables>(
    SpaceMembersDocument,
    options
  );
}

export function useSpaceMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceMembersQuery, SchemaTypes.SpaceMembersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceMembersQuery, SchemaTypes.SpaceMembersQueryVariables>(
    SpaceMembersDocument,
    options
  );
}

export type SpaceMembersQueryHookResult = ReturnType<typeof useSpaceMembersQuery>;
export type SpaceMembersLazyQueryHookResult = ReturnType<typeof useSpaceMembersLazyQuery>;
export type SpaceMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceMembersQuery,
  SchemaTypes.SpaceMembersQueryVariables
>;
export function refetchSpaceMembersQuery(variables: SchemaTypes.SpaceMembersQueryVariables) {
  return { query: SpaceMembersDocument, variables: variables };
}

export const SpaceNameDocument = gql`
  query spaceName($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      ...SpaceName
    }
  }
  ${SpaceNameFragmentDoc}
`;

/**
 * __useSpaceNameQuery__
 *
 * To run a query within a React component, call `useSpaceNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceNameQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceNameQuery, SchemaTypes.SpaceNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceNameQuery, SchemaTypes.SpaceNameQueryVariables>(SpaceNameDocument, options);
}

export function useSpaceNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceNameQuery, SchemaTypes.SpaceNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceNameQuery, SchemaTypes.SpaceNameQueryVariables>(
    SpaceNameDocument,
    options
  );
}

export type SpaceNameQueryHookResult = ReturnType<typeof useSpaceNameQuery>;
export type SpaceNameLazyQueryHookResult = ReturnType<typeof useSpaceNameLazyQuery>;
export type SpaceNameQueryResult = Apollo.QueryResult<SchemaTypes.SpaceNameQuery, SchemaTypes.SpaceNameQueryVariables>;
export function refetchSpaceNameQuery(variables: SchemaTypes.SpaceNameQueryVariables) {
  return { query: SpaceNameDocument, variables: variables };
}

export const SpaceUserIdsDocument = gql`
  query spaceUserIds($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      community {
        id
        memberUsers {
          id
        }
      }
    }
  }
`;

/**
 * __useSpaceUserIdsQuery__
 *
 * To run a query within a React component, call `useSpaceUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceUserIdsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceUserIdsQuery, SchemaTypes.SpaceUserIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceUserIdsQuery, SchemaTypes.SpaceUserIdsQueryVariables>(
    SpaceUserIdsDocument,
    options
  );
}

export function useSpaceUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceUserIdsQuery, SchemaTypes.SpaceUserIdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceUserIdsQuery, SchemaTypes.SpaceUserIdsQueryVariables>(
    SpaceUserIdsDocument,
    options
  );
}

export type SpaceUserIdsQueryHookResult = ReturnType<typeof useSpaceUserIdsQuery>;
export type SpaceUserIdsLazyQueryHookResult = ReturnType<typeof useSpaceUserIdsLazyQuery>;
export type SpaceUserIdsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceUserIdsQuery,
  SchemaTypes.SpaceUserIdsQueryVariables
>;
export function refetchSpaceUserIdsQuery(variables: SchemaTypes.SpaceUserIdsQueryVariables) {
  return { query: SpaceUserIdsDocument, variables: variables };
}

export const SpaceVisualDocument = gql`
  query spaceVisual($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        visuals {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;

/**
 * __useSpaceVisualQuery__
 *
 * To run a query within a React component, call `useSpaceVisualQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceVisualQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceVisualQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceVisualQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceVisualQuery, SchemaTypes.SpaceVisualQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceVisualQuery, SchemaTypes.SpaceVisualQueryVariables>(
    SpaceVisualDocument,
    options
  );
}

export function useSpaceVisualLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceVisualQuery, SchemaTypes.SpaceVisualQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceVisualQuery, SchemaTypes.SpaceVisualQueryVariables>(
    SpaceVisualDocument,
    options
  );
}

export type SpaceVisualQueryHookResult = ReturnType<typeof useSpaceVisualQuery>;
export type SpaceVisualLazyQueryHookResult = ReturnType<typeof useSpaceVisualLazyQuery>;
export type SpaceVisualQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceVisualQuery,
  SchemaTypes.SpaceVisualQueryVariables
>;
export function refetchSpaceVisualQuery(variables: SchemaTypes.SpaceVisualQueryVariables) {
  return { query: SpaceVisualDocument, variables: variables };
}

export const SpacesDocument = gql`
  query spaces($visibilities: [SpaceVisibility!] = [ACTIVE]) {
    spaces(filter: { visibilities: $visibilities }) {
      ...SpaceDetailsProvider
    }
  }
  ${SpaceDetailsProviderFragmentDoc}
`;

/**
 * __useSpacesQuery__
 *
 * To run a query within a React component, call `useSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacesQuery({
 *   variables: {
 *      visibilities: // value for 'visibilities'
 *   },
 * });
 */
export function useSpacesQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.SpacesQuery, SchemaTypes.SpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacesQuery, SchemaTypes.SpacesQueryVariables>(SpacesDocument, options);
}

export function useSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpacesQuery, SchemaTypes.SpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacesQuery, SchemaTypes.SpacesQueryVariables>(SpacesDocument, options);
}

export type SpacesQueryHookResult = ReturnType<typeof useSpacesQuery>;
export type SpacesLazyQueryHookResult = ReturnType<typeof useSpacesLazyQuery>;
export type SpacesQueryResult = Apollo.QueryResult<SchemaTypes.SpacesQuery, SchemaTypes.SpacesQueryVariables>;
export function refetchSpacesQuery(variables?: SchemaTypes.SpacesQueryVariables) {
  return { query: SpacesDocument, variables: variables };
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

export const SpaceDisplayNameDocument = gql`
  query SpaceDisplayName($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;

/**
 * __useSpaceDisplayNameQuery__
 *
 * To run a query within a React component, call `useSpaceDisplayNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceDisplayNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceDisplayNameQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceDisplayNameQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceDisplayNameQuery, SchemaTypes.SpaceDisplayNameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceDisplayNameQuery, SchemaTypes.SpaceDisplayNameQueryVariables>(
    SpaceDisplayNameDocument,
    options
  );
}

export function useSpaceDisplayNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceDisplayNameQuery,
    SchemaTypes.SpaceDisplayNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceDisplayNameQuery, SchemaTypes.SpaceDisplayNameQueryVariables>(
    SpaceDisplayNameDocument,
    options
  );
}

export type SpaceDisplayNameQueryHookResult = ReturnType<typeof useSpaceDisplayNameQuery>;
export type SpaceDisplayNameLazyQueryHookResult = ReturnType<typeof useSpaceDisplayNameLazyQuery>;
export type SpaceDisplayNameQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceDisplayNameQuery,
  SchemaTypes.SpaceDisplayNameQueryVariables
>;
export function refetchSpaceDisplayNameQuery(variables: SchemaTypes.SpaceDisplayNameQueryVariables) {
  return { query: SpaceDisplayNameDocument, variables: variables };
}

export const SpaceApplicationsInvitationsDocument = gql`
  query spaceApplicationsInvitations($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      community {
        id
        applications {
          ...AdminSpaceCommunityApplication
        }
        invitations {
          ...AdminSpaceCommunityInvitation
        }
        invitationsExternal {
          ...AdminSpaceCommunityInvitationExternal
        }
      }
    }
  }
  ${AdminSpaceCommunityApplicationFragmentDoc}
  ${AdminSpaceCommunityInvitationFragmentDoc}
  ${AdminSpaceCommunityInvitationExternalFragmentDoc}
`;

/**
 * __useSpaceApplicationsInvitationsQuery__
 *
 * To run a query within a React component, call `useSpaceApplicationsInvitationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceApplicationsInvitationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceApplicationsInvitationsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceApplicationsInvitationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceApplicationsInvitationsQuery,
    SchemaTypes.SpaceApplicationsInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceApplicationsInvitationsQuery,
    SchemaTypes.SpaceApplicationsInvitationsQueryVariables
  >(SpaceApplicationsInvitationsDocument, options);
}

export function useSpaceApplicationsInvitationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceApplicationsInvitationsQuery,
    SchemaTypes.SpaceApplicationsInvitationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceApplicationsInvitationsQuery,
    SchemaTypes.SpaceApplicationsInvitationsQueryVariables
  >(SpaceApplicationsInvitationsDocument, options);
}

export type SpaceApplicationsInvitationsQueryHookResult = ReturnType<typeof useSpaceApplicationsInvitationsQuery>;
export type SpaceApplicationsInvitationsLazyQueryHookResult = ReturnType<
  typeof useSpaceApplicationsInvitationsLazyQuery
>;
export type SpaceApplicationsInvitationsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceApplicationsInvitationsQuery,
  SchemaTypes.SpaceApplicationsInvitationsQueryVariables
>;
export function refetchSpaceApplicationsInvitationsQuery(
  variables: SchemaTypes.SpaceApplicationsInvitationsQueryVariables
) {
  return { query: SpaceApplicationsInvitationsDocument, variables: variables };
}

export const CalloutPageCalloutDocument = gql`
  query CalloutPageCallout(
    $calloutNameId: UUID_NAMEID!
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      collaboration @include(if: $includeSpace) {
        id
        callouts(IDs: [$calloutNameId]) {
          ...Callout
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...Callout
          }
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...Callout
          }
        }
      }
    }
  }
  ${CalloutFragmentDoc}
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
 *      calloutNameId: // value for 'calloutNameId'
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
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

export const InnovationFlowStatesAllowedValuesDocument = gql`
  query InnovationFlowStatesAllowedValues($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        innovationFlow {
          id
          lifecycle {
            id
            state
          }
          profile {
            id
            tagsets {
              id
              name
              allowedValues
            }
          }
        }
      }
    }
  }
`;

/**
 * __useInnovationFlowStatesAllowedValuesQuery__
 *
 * To run a query within a React component, call `useInnovationFlowStatesAllowedValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowStatesAllowedValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowStatesAllowedValuesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useInnovationFlowStatesAllowedValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowStatesAllowedValuesQuery,
    SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationFlowStatesAllowedValuesQuery,
    SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
  >(InnovationFlowStatesAllowedValuesDocument, options);
}

export function useInnovationFlowStatesAllowedValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowStatesAllowedValuesQuery,
    SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationFlowStatesAllowedValuesQuery,
    SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
  >(InnovationFlowStatesAllowedValuesDocument, options);
}

export type InnovationFlowStatesAllowedValuesQueryHookResult = ReturnType<
  typeof useInnovationFlowStatesAllowedValuesQuery
>;
export type InnovationFlowStatesAllowedValuesLazyQueryHookResult = ReturnType<
  typeof useInnovationFlowStatesAllowedValuesLazyQuery
>;
export type InnovationFlowStatesAllowedValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowStatesAllowedValuesQuery,
  SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
>;
export function refetchInnovationFlowStatesAllowedValuesQuery(
  variables: SchemaTypes.InnovationFlowStatesAllowedValuesQueryVariables
) {
  return { query: InnovationFlowStatesAllowedValuesDocument, variables: variables };
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
  query activityLogOnCollaboration($queryData: ActivityLogInput!) {
    activityLogOnCollaboration(queryData: $queryData) {
      id
      collaborationID
      createdDate
      description
      type
      child
      parentNameID
      journeyDisplayName: parentDisplayName
      __typename
      triggeredBy {
        id
        nameID
        firstName
        lastName
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
          location {
            id
            city
            country
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
        ...ActivityLogCalloutCardCreated
      }
      ... on ActivityLogEntryCalloutPostComment {
        ...ActivityLogCalloutCardComment
      }
      ... on ActivityLogEntryCalloutWhiteboardCreated {
        ...ActivityLogCalloutWhiteboardCreated
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
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutCardCreatedFragmentDoc}
  ${ActivityLogCalloutCardCommentFragmentDoc}
  ${ActivityLogCalloutWhiteboardCreatedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
  ${ActivityLogUpdateSentFragmentDoc}
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
 *      queryData: // value for 'queryData'
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
export const TemplatesForCalloutCreationDocument = gql`
  query TemplatesForCalloutCreation($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        postTemplates {
          id
          profile {
            ...ProfileDisplayName
          }
        }
        whiteboardTemplates {
          id
          profile {
            ...ProfileDisplayName
          }
        }
      }
    }
  }
  ${ProfileDisplayNameFragmentDoc}
`;

/**
 * __useTemplatesForCalloutCreationQuery__
 *
 * To run a query within a React component, call `useTemplatesForCalloutCreationQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplatesForCalloutCreationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplatesForCalloutCreationQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useTemplatesForCalloutCreationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.TemplatesForCalloutCreationQuery,
    SchemaTypes.TemplatesForCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.TemplatesForCalloutCreationQuery,
    SchemaTypes.TemplatesForCalloutCreationQueryVariables
  >(TemplatesForCalloutCreationDocument, options);
}

export function useTemplatesForCalloutCreationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.TemplatesForCalloutCreationQuery,
    SchemaTypes.TemplatesForCalloutCreationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.TemplatesForCalloutCreationQuery,
    SchemaTypes.TemplatesForCalloutCreationQueryVariables
  >(TemplatesForCalloutCreationDocument, options);
}

export type TemplatesForCalloutCreationQueryHookResult = ReturnType<typeof useTemplatesForCalloutCreationQuery>;
export type TemplatesForCalloutCreationLazyQueryHookResult = ReturnType<typeof useTemplatesForCalloutCreationLazyQuery>;
export type TemplatesForCalloutCreationQueryResult = Apollo.QueryResult<
  SchemaTypes.TemplatesForCalloutCreationQuery,
  SchemaTypes.TemplatesForCalloutCreationQueryVariables
>;
export function refetchTemplatesForCalloutCreationQuery(
  variables: SchemaTypes.TemplatesForCalloutCreationQueryVariables
) {
  return { query: TemplatesForCalloutCreationDocument, variables: variables };
}

export const PostTemplatesOnCalloutCreationDocument = gql`
  query PostTemplatesOnCalloutCreation($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
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
      templates {
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

export const PostTemplateValueDocument = gql`
  query PostTemplateValue($spaceId: UUID_NAMEID!, $id: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        postTemplate(ID: $id) {
          id
          type
          defaultDescription
          profile {
            id
            description
            tagset {
              ...TagsetDetails
            }
          }
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __usePostTemplateValueQuery__
 *
 * To run a query within a React component, call `usePostTemplateValueQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostTemplateValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostTemplateValueQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePostTemplateValueQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.PostTemplateValueQuery, SchemaTypes.PostTemplateValueQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostTemplateValueQuery, SchemaTypes.PostTemplateValueQueryVariables>(
    PostTemplateValueDocument,
    options
  );
}

export function usePostTemplateValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PostTemplateValueQuery,
    SchemaTypes.PostTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostTemplateValueQuery, SchemaTypes.PostTemplateValueQueryVariables>(
    PostTemplateValueDocument,
    options
  );
}

export type PostTemplateValueQueryHookResult = ReturnType<typeof usePostTemplateValueQuery>;
export type PostTemplateValueLazyQueryHookResult = ReturnType<typeof usePostTemplateValueLazyQuery>;
export type PostTemplateValueQueryResult = Apollo.QueryResult<
  SchemaTypes.PostTemplateValueQuery,
  SchemaTypes.PostTemplateValueQueryVariables
>;
export function refetchPostTemplateValueQuery(variables: SchemaTypes.PostTemplateValueQueryVariables) {
  return { query: PostTemplateValueDocument, variables: variables };
}

export const WhiteboardTemplateValueDocument = gql`
  query WhiteboardTemplateValue($spaceId: UUID_NAMEID!, $id: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $id) {
          id
          value
        }
      }
    }
  }
`;

/**
 * __useWhiteboardTemplateValueQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplateValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplateValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplateValueQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useWhiteboardTemplateValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplateValueQuery,
    SchemaTypes.WhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardTemplateValueQuery, SchemaTypes.WhiteboardTemplateValueQueryVariables>(
    WhiteboardTemplateValueDocument,
    options
  );
}

export function useWhiteboardTemplateValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplateValueQuery,
    SchemaTypes.WhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardTemplateValueQuery,
    SchemaTypes.WhiteboardTemplateValueQueryVariables
  >(WhiteboardTemplateValueDocument, options);
}

export type WhiteboardTemplateValueQueryHookResult = ReturnType<typeof useWhiteboardTemplateValueQuery>;
export type WhiteboardTemplateValueLazyQueryHookResult = ReturnType<typeof useWhiteboardTemplateValueLazyQuery>;
export type WhiteboardTemplateValueQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplateValueQuery,
  SchemaTypes.WhiteboardTemplateValueQueryVariables
>;
export function refetchWhiteboardTemplateValueQuery(variables: SchemaTypes.WhiteboardTemplateValueQueryVariables) {
  return { query: WhiteboardTemplateValueDocument, variables: variables };
}

export const CreateCalloutDocument = gql`
  mutation createCallout($calloutData: CreateCalloutOnCollaborationInput!) {
    createCalloutOnCollaboration(calloutData: $calloutData) {
      ...Callout
    }
  }
  ${CalloutFragmentDoc}
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
export const SpaceCollaborationIdDocument = gql`
  query spaceCollaborationId($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      collaboration {
        id
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

export const ChallengeCollaborationIdDocument = gql`
  query challengeCollaborationId($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        collaboration {
          id
        }
      }
    }
  }
`;

/**
 * __useChallengeCollaborationIdQuery__
 *
 * To run a query within a React component, call `useChallengeCollaborationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCollaborationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCollaborationIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCollaborationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCollaborationIdQuery,
    SchemaTypes.ChallengeCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeCollaborationIdQuery, SchemaTypes.ChallengeCollaborationIdQueryVariables>(
    ChallengeCollaborationIdDocument,
    options
  );
}

export function useChallengeCollaborationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCollaborationIdQuery,
    SchemaTypes.ChallengeCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCollaborationIdQuery,
    SchemaTypes.ChallengeCollaborationIdQueryVariables
  >(ChallengeCollaborationIdDocument, options);
}

export type ChallengeCollaborationIdQueryHookResult = ReturnType<typeof useChallengeCollaborationIdQuery>;
export type ChallengeCollaborationIdLazyQueryHookResult = ReturnType<typeof useChallengeCollaborationIdLazyQuery>;
export type ChallengeCollaborationIdQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCollaborationIdQuery,
  SchemaTypes.ChallengeCollaborationIdQueryVariables
>;
export function refetchChallengeCollaborationIdQuery(variables: SchemaTypes.ChallengeCollaborationIdQueryVariables) {
  return { query: ChallengeCollaborationIdDocument, variables: variables };
}

export const OpportunityCollaborationIdDocument = gql`
  query opportunityCollaborationId($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        collaboration {
          id
        }
      }
    }
  }
`;

/**
 * __useOpportunityCollaborationIdQuery__
 *
 * To run a query within a React component, call `useOpportunityCollaborationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCollaborationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCollaborationIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCollaborationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCollaborationIdQuery,
    SchemaTypes.OpportunityCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCollaborationIdQuery,
    SchemaTypes.OpportunityCollaborationIdQueryVariables
  >(OpportunityCollaborationIdDocument, options);
}

export function useOpportunityCollaborationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCollaborationIdQuery,
    SchemaTypes.OpportunityCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCollaborationIdQuery,
    SchemaTypes.OpportunityCollaborationIdQueryVariables
  >(OpportunityCollaborationIdDocument, options);
}

export type OpportunityCollaborationIdQueryHookResult = ReturnType<typeof useOpportunityCollaborationIdQuery>;
export type OpportunityCollaborationIdLazyQueryHookResult = ReturnType<typeof useOpportunityCollaborationIdLazyQuery>;
export type OpportunityCollaborationIdQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCollaborationIdQuery,
  SchemaTypes.OpportunityCollaborationIdQueryVariables
>;
export function refetchOpportunityCollaborationIdQuery(
  variables: SchemaTypes.OpportunityCollaborationIdQueryVariables
) {
  return { query: OpportunityCollaborationIdDocument, variables: variables };
}

export const UpdateCalloutDocument = gql`
  mutation UpdateCallout($calloutData: UpdateCalloutInput!) {
    updateCallout(calloutData: $calloutData) {
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
      state
      group
      type
      visibility
      ...CalloutPostTemplate
      ...CalloutWhiteboardTemplate
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${CalloutPostTemplateFragmentDoc}
  ${CalloutWhiteboardTemplateFragmentDoc}
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
      id
      visibility
    }
  }
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
export const CreatePostFromContributeTabDocument = gql`
  mutation CreatePostFromContributeTab($postData: CreatePostOnCalloutInput!) {
    createPostOnCallout(postData: $postData) {
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
export const CalloutsDocument = gql`
  query Callouts(
    $spaceNameId: UUID_NAMEID!
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $calloutGroups: [String!]
    $calloutIds: [UUID_NAMEID!]
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        nameID
        collaboration {
          ...CollaborationWithCallouts
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        nameID
        ... on Challenge @skip(if: $includeOpportunity) {
          collaboration {
            ...CollaborationWithCallouts
          }
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        nameID
        collaboration {
          ...CollaborationWithCallouts
        }
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
 *      spaceNameId: // value for 'spaceNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      calloutGroups: // value for 'calloutGroups'
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

export const SpaceCalloutPostsSubscriptionDocument = gql`
  query SpaceCalloutPostsSubscription($spaceNameId: UUID_NAMEID!, $calloutId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      collaboration {
        id
        callouts(IDs: [$calloutId]) {
          id
          posts {
            ...ContributeTabPost
          }
        }
      }
    }
  }
  ${ContributeTabPostFragmentDoc}
`;

/**
 * __useSpaceCalloutPostsSubscriptionQuery__
 *
 * To run a query within a React component, call `useSpaceCalloutPostsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceCalloutPostsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceCalloutPostsSubscriptionQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useSpaceCalloutPostsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCalloutPostsSubscriptionQuery,
    SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceCalloutPostsSubscriptionQuery,
    SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
  >(SpaceCalloutPostsSubscriptionDocument, options);
}

export function useSpaceCalloutPostsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceCalloutPostsSubscriptionQuery,
    SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceCalloutPostsSubscriptionQuery,
    SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
  >(SpaceCalloutPostsSubscriptionDocument, options);
}

export type SpaceCalloutPostsSubscriptionQueryHookResult = ReturnType<typeof useSpaceCalloutPostsSubscriptionQuery>;
export type SpaceCalloutPostsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useSpaceCalloutPostsSubscriptionLazyQuery
>;
export type SpaceCalloutPostsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCalloutPostsSubscriptionQuery,
  SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
>;
export function refetchSpaceCalloutPostsSubscriptionQuery(
  variables: SchemaTypes.SpaceCalloutPostsSubscriptionQueryVariables
) {
  return { query: SpaceCalloutPostsSubscriptionDocument, variables: variables };
}

export const ChallengeCalloutPostsSubscriptionDocument = gql`
  query ChallengeCalloutPostsSubscription(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutId]) {
            id
            posts {
              ...ContributeTabPost
            }
          }
        }
      }
    }
  }
  ${ContributeTabPostFragmentDoc}
`;

/**
 * __useChallengeCalloutPostsSubscriptionQuery__
 *
 * To run a query within a React component, call `useChallengeCalloutPostsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCalloutPostsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCalloutPostsSubscriptionQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useChallengeCalloutPostsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCalloutPostsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCalloutPostsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
  >(ChallengeCalloutPostsSubscriptionDocument, options);
}

export function useChallengeCalloutPostsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCalloutPostsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCalloutPostsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
  >(ChallengeCalloutPostsSubscriptionDocument, options);
}

export type ChallengeCalloutPostsSubscriptionQueryHookResult = ReturnType<
  typeof useChallengeCalloutPostsSubscriptionQuery
>;
export type ChallengeCalloutPostsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useChallengeCalloutPostsSubscriptionLazyQuery
>;
export type ChallengeCalloutPostsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCalloutPostsSubscriptionQuery,
  SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
>;
export function refetchChallengeCalloutPostsSubscriptionQuery(
  variables: SchemaTypes.ChallengeCalloutPostsSubscriptionQueryVariables
) {
  return { query: ChallengeCalloutPostsSubscriptionDocument, variables: variables };
}

export const OpportunityCalloutPostsSubscriptionDocument = gql`
  query OpportunityCalloutPostsSubscription(
    $spaceNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutId]) {
            id
            posts {
              ...ContributeTabPost
            }
          }
        }
      }
    }
  }
  ${ContributeTabPostFragmentDoc}
`;

/**
 * __useOpportunityCalloutPostsSubscriptionQuery__
 *
 * To run a query within a React component, call `useOpportunityCalloutPostsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCalloutPostsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCalloutPostsSubscriptionQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useOpportunityCalloutPostsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCalloutPostsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCalloutPostsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
  >(OpportunityCalloutPostsSubscriptionDocument, options);
}

export function useOpportunityCalloutPostsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCalloutPostsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCalloutPostsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
  >(OpportunityCalloutPostsSubscriptionDocument, options);
}

export type OpportunityCalloutPostsSubscriptionQueryHookResult = ReturnType<
  typeof useOpportunityCalloutPostsSubscriptionQuery
>;
export type OpportunityCalloutPostsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useOpportunityCalloutPostsSubscriptionLazyQuery
>;
export type OpportunityCalloutPostsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCalloutPostsSubscriptionQuery,
  SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
>;
export function refetchOpportunityCalloutPostsSubscriptionQuery(
  variables: SchemaTypes.OpportunityCalloutPostsSubscriptionQueryVariables
) {
  return { query: OpportunityCalloutPostsSubscriptionDocument, variables: variables };
}

export const PrivilegesOnSpaceCollaborationDocument = gql`
  query PrivilegesOnSpaceCollaboration($spaceNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      collaboration {
        ...PrivilegesOnCollaboration
      }
    }
  }
  ${PrivilegesOnCollaborationFragmentDoc}
`;

/**
 * __usePrivilegesOnSpaceCollaborationQuery__
 *
 * To run a query within a React component, call `usePrivilegesOnSpaceCollaborationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrivilegesOnSpaceCollaborationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrivilegesOnSpaceCollaborationQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *   },
 * });
 */
export function usePrivilegesOnSpaceCollaborationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PrivilegesOnSpaceCollaborationQuery,
    SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PrivilegesOnSpaceCollaborationQuery,
    SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
  >(PrivilegesOnSpaceCollaborationDocument, options);
}

export function usePrivilegesOnSpaceCollaborationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PrivilegesOnSpaceCollaborationQuery,
    SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PrivilegesOnSpaceCollaborationQuery,
    SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
  >(PrivilegesOnSpaceCollaborationDocument, options);
}

export type PrivilegesOnSpaceCollaborationQueryHookResult = ReturnType<typeof usePrivilegesOnSpaceCollaborationQuery>;
export type PrivilegesOnSpaceCollaborationLazyQueryHookResult = ReturnType<
  typeof usePrivilegesOnSpaceCollaborationLazyQuery
>;
export type PrivilegesOnSpaceCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.PrivilegesOnSpaceCollaborationQuery,
  SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
>;
export function refetchPrivilegesOnSpaceCollaborationQuery(
  variables: SchemaTypes.PrivilegesOnSpaceCollaborationQueryVariables
) {
  return { query: PrivilegesOnSpaceCollaborationDocument, variables: variables };
}

export const PrivilegesOnChallengeCollaborationDocument = gql`
  query PrivilegesOnChallengeCollaboration($spaceNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          ...PrivilegesOnCollaboration
        }
      }
    }
  }
  ${PrivilegesOnCollaborationFragmentDoc}
`;

/**
 * __usePrivilegesOnChallengeCollaborationQuery__
 *
 * To run a query within a React component, call `usePrivilegesOnChallengeCollaborationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrivilegesOnChallengeCollaborationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrivilegesOnChallengeCollaborationQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *   },
 * });
 */
export function usePrivilegesOnChallengeCollaborationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PrivilegesOnChallengeCollaborationQuery,
    SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PrivilegesOnChallengeCollaborationQuery,
    SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
  >(PrivilegesOnChallengeCollaborationDocument, options);
}

export function usePrivilegesOnChallengeCollaborationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PrivilegesOnChallengeCollaborationQuery,
    SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PrivilegesOnChallengeCollaborationQuery,
    SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
  >(PrivilegesOnChallengeCollaborationDocument, options);
}

export type PrivilegesOnChallengeCollaborationQueryHookResult = ReturnType<
  typeof usePrivilegesOnChallengeCollaborationQuery
>;
export type PrivilegesOnChallengeCollaborationLazyQueryHookResult = ReturnType<
  typeof usePrivilegesOnChallengeCollaborationLazyQuery
>;
export type PrivilegesOnChallengeCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.PrivilegesOnChallengeCollaborationQuery,
  SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
>;
export function refetchPrivilegesOnChallengeCollaborationQuery(
  variables: SchemaTypes.PrivilegesOnChallengeCollaborationQueryVariables
) {
  return { query: PrivilegesOnChallengeCollaborationDocument, variables: variables };
}

export const PrivilegesOnOpportunityCollaborationDocument = gql`
  query PrivilegesOnOpportunityCollaboration($spaceNameId: UUID_NAMEID!, $opportunityNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          ...PrivilegesOnCollaboration
        }
      }
    }
  }
  ${PrivilegesOnCollaborationFragmentDoc}
`;

/**
 * __usePrivilegesOnOpportunityCollaborationQuery__
 *
 * To run a query within a React component, call `usePrivilegesOnOpportunityCollaborationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrivilegesOnOpportunityCollaborationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrivilegesOnOpportunityCollaborationQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *   },
 * });
 */
export function usePrivilegesOnOpportunityCollaborationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PrivilegesOnOpportunityCollaborationQuery,
    SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PrivilegesOnOpportunityCollaborationQuery,
    SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
  >(PrivilegesOnOpportunityCollaborationDocument, options);
}

export function usePrivilegesOnOpportunityCollaborationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PrivilegesOnOpportunityCollaborationQuery,
    SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PrivilegesOnOpportunityCollaborationQuery,
    SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
  >(PrivilegesOnOpportunityCollaborationDocument, options);
}

export type PrivilegesOnOpportunityCollaborationQueryHookResult = ReturnType<
  typeof usePrivilegesOnOpportunityCollaborationQuery
>;
export type PrivilegesOnOpportunityCollaborationLazyQueryHookResult = ReturnType<
  typeof usePrivilegesOnOpportunityCollaborationLazyQuery
>;
export type PrivilegesOnOpportunityCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.PrivilegesOnOpportunityCollaborationQuery,
  SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
>;
export function refetchPrivilegesOnOpportunityCollaborationQuery(
  variables: SchemaTypes.PrivilegesOnOpportunityCollaborationQueryVariables
) {
  return { query: PrivilegesOnOpportunityCollaborationDocument, variables: variables };
}

export const CalloutPostCreatedDocument = gql`
  subscription CalloutPostCreated($calloutID: UUID!) {
    calloutPostCreated(calloutID: $calloutID) {
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
 *      calloutID: // value for 'calloutID'
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
export const SpacePostTemplatesLibraryDocument = gql`
  query SpacePostTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
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

export const SpacePostDocument = gql`
  query SpacePost($spaceNameId: UUID_NAMEID!, $postNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      collaboration {
        ...PostDashboardData
      }
    }
  }
  ${PostDashboardDataFragmentDoc}
`;

/**
 * __useSpacePostQuery__
 *
 * To run a query within a React component, call `useSpacePostQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePostQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useSpacePostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePostQuery, SchemaTypes.SpacePostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePostQuery, SchemaTypes.SpacePostQueryVariables>(SpacePostDocument, options);
}

export function useSpacePostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpacePostQuery, SchemaTypes.SpacePostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePostQuery, SchemaTypes.SpacePostQueryVariables>(
    SpacePostDocument,
    options
  );
}

export type SpacePostQueryHookResult = ReturnType<typeof useSpacePostQuery>;
export type SpacePostLazyQueryHookResult = ReturnType<typeof useSpacePostLazyQuery>;
export type SpacePostQueryResult = Apollo.QueryResult<SchemaTypes.SpacePostQuery, SchemaTypes.SpacePostQueryVariables>;
export function refetchSpacePostQuery(variables: SchemaTypes.SpacePostQueryVariables) {
  return { query: SpacePostDocument, variables: variables };
}

export const ChallengePostDocument = gql`
  query ChallengePost(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          ...PostDashboardData
        }
      }
    }
  }
  ${PostDashboardDataFragmentDoc}
`;

/**
 * __useChallengePostQuery__
 *
 * To run a query within a React component, call `useChallengePostQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengePostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengePostQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useChallengePostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.ChallengePostQuery, SchemaTypes.ChallengePostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengePostQuery, SchemaTypes.ChallengePostQueryVariables>(
    ChallengePostDocument,
    options
  );
}

export function useChallengePostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.ChallengePostQuery, SchemaTypes.ChallengePostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengePostQuery, SchemaTypes.ChallengePostQueryVariables>(
    ChallengePostDocument,
    options
  );
}

export type ChallengePostQueryHookResult = ReturnType<typeof useChallengePostQuery>;
export type ChallengePostLazyQueryHookResult = ReturnType<typeof useChallengePostLazyQuery>;
export type ChallengePostQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengePostQuery,
  SchemaTypes.ChallengePostQueryVariables
>;
export function refetchChallengePostQuery(variables: SchemaTypes.ChallengePostQueryVariables) {
  return { query: ChallengePostDocument, variables: variables };
}

export const OpportunityPostDocument = gql`
  query OpportunityPost(
    $spaceNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          ...PostDashboardData
        }
      }
    }
  }
  ${PostDashboardDataFragmentDoc}
`;

/**
 * __useOpportunityPostQuery__
 *
 * To run a query within a React component, call `useOpportunityPostQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityPostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityPostQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useOpportunityPostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.OpportunityPostQuery, SchemaTypes.OpportunityPostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityPostQuery, SchemaTypes.OpportunityPostQueryVariables>(
    OpportunityPostDocument,
    options
  );
}

export function useOpportunityPostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.OpportunityPostQuery, SchemaTypes.OpportunityPostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.OpportunityPostQuery, SchemaTypes.OpportunityPostQueryVariables>(
    OpportunityPostDocument,
    options
  );
}

export type OpportunityPostQueryHookResult = ReturnType<typeof useOpportunityPostQuery>;
export type OpportunityPostLazyQueryHookResult = ReturnType<typeof useOpportunityPostLazyQuery>;
export type OpportunityPostQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityPostQuery,
  SchemaTypes.OpportunityPostQueryVariables
>;
export function refetchOpportunityPostQuery(variables: SchemaTypes.OpportunityPostQueryVariables) {
  return { query: OpportunityPostDocument, variables: variables };
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
export const SpacePostSettingsDocument = gql`
  query SpacePostSettings($spaceNameId: UUID_NAMEID!, $postNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      collaboration {
        id
        callouts(IDs: [$calloutNameId]) {
          ...PostSettingsCallout
        }
      }
    }
  }
  ${PostSettingsCalloutFragmentDoc}
`;

/**
 * __useSpacePostSettingsQuery__
 *
 * To run a query within a React component, call `useSpacePostSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePostSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePostSettingsQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useSpacePostSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePostSettingsQuery, SchemaTypes.SpacePostSettingsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePostSettingsQuery, SchemaTypes.SpacePostSettingsQueryVariables>(
    SpacePostSettingsDocument,
    options
  );
}

export function useSpacePostSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePostSettingsQuery,
    SchemaTypes.SpacePostSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePostSettingsQuery, SchemaTypes.SpacePostSettingsQueryVariables>(
    SpacePostSettingsDocument,
    options
  );
}

export type SpacePostSettingsQueryHookResult = ReturnType<typeof useSpacePostSettingsQuery>;
export type SpacePostSettingsLazyQueryHookResult = ReturnType<typeof useSpacePostSettingsLazyQuery>;
export type SpacePostSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePostSettingsQuery,
  SchemaTypes.SpacePostSettingsQueryVariables
>;
export function refetchSpacePostSettingsQuery(variables: SchemaTypes.SpacePostSettingsQueryVariables) {
  return { query: SpacePostSettingsDocument, variables: variables };
}

export const ChallengePostSettingsDocument = gql`
  query ChallengePostSettings(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...PostSettingsCallout
          }
        }
      }
    }
  }
  ${PostSettingsCalloutFragmentDoc}
`;

/**
 * __useChallengePostSettingsQuery__
 *
 * To run a query within a React component, call `useChallengePostSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengePostSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengePostSettingsQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useChallengePostSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengePostSettingsQuery,
    SchemaTypes.ChallengePostSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengePostSettingsQuery, SchemaTypes.ChallengePostSettingsQueryVariables>(
    ChallengePostSettingsDocument,
    options
  );
}

export function useChallengePostSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengePostSettingsQuery,
    SchemaTypes.ChallengePostSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengePostSettingsQuery, SchemaTypes.ChallengePostSettingsQueryVariables>(
    ChallengePostSettingsDocument,
    options
  );
}

export type ChallengePostSettingsQueryHookResult = ReturnType<typeof useChallengePostSettingsQuery>;
export type ChallengePostSettingsLazyQueryHookResult = ReturnType<typeof useChallengePostSettingsLazyQuery>;
export type ChallengePostSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengePostSettingsQuery,
  SchemaTypes.ChallengePostSettingsQueryVariables
>;
export function refetchChallengePostSettingsQuery(variables: SchemaTypes.ChallengePostSettingsQueryVariables) {
  return { query: ChallengePostSettingsDocument, variables: variables };
}

export const OpportunityPostSettingsDocument = gql`
  query OpportunityPostSettings(
    $spaceNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...PostSettingsCallout
          }
        }
      }
    }
  }
  ${PostSettingsCalloutFragmentDoc}
`;

/**
 * __useOpportunityPostSettingsQuery__
 *
 * To run a query within a React component, call `useOpportunityPostSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityPostSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityPostSettingsQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useOpportunityPostSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityPostSettingsQuery,
    SchemaTypes.OpportunityPostSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityPostSettingsQuery, SchemaTypes.OpportunityPostSettingsQueryVariables>(
    OpportunityPostSettingsDocument,
    options
  );
}

export function useOpportunityPostSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityPostSettingsQuery,
    SchemaTypes.OpportunityPostSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityPostSettingsQuery,
    SchemaTypes.OpportunityPostSettingsQueryVariables
  >(OpportunityPostSettingsDocument, options);
}

export type OpportunityPostSettingsQueryHookResult = ReturnType<typeof useOpportunityPostSettingsQuery>;
export type OpportunityPostSettingsLazyQueryHookResult = ReturnType<typeof useOpportunityPostSettingsLazyQuery>;
export type OpportunityPostSettingsQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityPostSettingsQuery,
  SchemaTypes.OpportunityPostSettingsQueryVariables
>;
export function refetchOpportunityPostSettingsQuery(variables: SchemaTypes.OpportunityPostSettingsQueryVariables) {
  return { query: OpportunityPostSettingsDocument, variables: variables };
}

export const SpacePostProviderDocument = gql`
  query SpacePostProvider($spaceNameId: UUID_NAMEID!, $postNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      collaboration {
        ...PostProviderData
      }
    }
  }
  ${PostProviderDataFragmentDoc}
`;

/**
 * __useSpacePostProviderQuery__
 *
 * To run a query within a React component, call `useSpacePostProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpacePostProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpacePostProviderQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useSpacePostProviderQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpacePostProviderQuery, SchemaTypes.SpacePostProviderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpacePostProviderQuery, SchemaTypes.SpacePostProviderQueryVariables>(
    SpacePostProviderDocument,
    options
  );
}

export function useSpacePostProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpacePostProviderQuery,
    SchemaTypes.SpacePostProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpacePostProviderQuery, SchemaTypes.SpacePostProviderQueryVariables>(
    SpacePostProviderDocument,
    options
  );
}

export type SpacePostProviderQueryHookResult = ReturnType<typeof useSpacePostProviderQuery>;
export type SpacePostProviderLazyQueryHookResult = ReturnType<typeof useSpacePostProviderLazyQuery>;
export type SpacePostProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.SpacePostProviderQuery,
  SchemaTypes.SpacePostProviderQueryVariables
>;
export function refetchSpacePostProviderQuery(variables: SchemaTypes.SpacePostProviderQueryVariables) {
  return { query: SpacePostProviderDocument, variables: variables };
}

export const ChallengePostProviderDocument = gql`
  query ChallengePostProvider(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          ...PostProviderData
        }
      }
    }
  }
  ${PostProviderDataFragmentDoc}
`;

/**
 * __useChallengePostProviderQuery__
 *
 * To run a query within a React component, call `useChallengePostProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengePostProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengePostProviderQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useChallengePostProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengePostProviderQuery,
    SchemaTypes.ChallengePostProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengePostProviderQuery, SchemaTypes.ChallengePostProviderQueryVariables>(
    ChallengePostProviderDocument,
    options
  );
}

export function useChallengePostProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengePostProviderQuery,
    SchemaTypes.ChallengePostProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengePostProviderQuery, SchemaTypes.ChallengePostProviderQueryVariables>(
    ChallengePostProviderDocument,
    options
  );
}

export type ChallengePostProviderQueryHookResult = ReturnType<typeof useChallengePostProviderQuery>;
export type ChallengePostProviderLazyQueryHookResult = ReturnType<typeof useChallengePostProviderLazyQuery>;
export type ChallengePostProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengePostProviderQuery,
  SchemaTypes.ChallengePostProviderQueryVariables
>;
export function refetchChallengePostProviderQuery(variables: SchemaTypes.ChallengePostProviderQueryVariables) {
  return { query: ChallengePostProviderDocument, variables: variables };
}

export const OpportunityPostProviderDocument = gql`
  query OpportunityPostProvider(
    $spaceNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $postNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    space(ID: $spaceNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          ...PostProviderData
        }
      }
    }
  }
  ${PostProviderDataFragmentDoc}
`;

/**
 * __useOpportunityPostProviderQuery__
 *
 * To run a query within a React component, call `useOpportunityPostProviderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityPostProviderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityPostProviderQuery({
 *   variables: {
 *      spaceNameId: // value for 'spaceNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      postNameId: // value for 'postNameId'
 *      calloutNameId: // value for 'calloutNameId'
 *   },
 * });
 */
export function useOpportunityPostProviderQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityPostProviderQuery,
    SchemaTypes.OpportunityPostProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.OpportunityPostProviderQuery, SchemaTypes.OpportunityPostProviderQueryVariables>(
    OpportunityPostProviderDocument,
    options
  );
}

export function useOpportunityPostProviderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityPostProviderQuery,
    SchemaTypes.OpportunityPostProviderQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityPostProviderQuery,
    SchemaTypes.OpportunityPostProviderQueryVariables
  >(OpportunityPostProviderDocument, options);
}

export type OpportunityPostProviderQueryHookResult = ReturnType<typeof useOpportunityPostProviderQuery>;
export type OpportunityPostProviderLazyQueryHookResult = ReturnType<typeof useOpportunityPostProviderLazyQuery>;
export type OpportunityPostProviderQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityPostProviderQuery,
  SchemaTypes.OpportunityPostProviderQueryVariables
>;
export function refetchOpportunityPostProviderQuery(variables: SchemaTypes.OpportunityPostProviderQueryVariables) {
  return { query: OpportunityPostProviderDocument, variables: variables };
}

export const CreatePostDocument = gql`
  mutation CreatePost($postData: CreatePostOnCalloutInput!) {
    createPostOnCallout(postData: $postData) {
      id
      nameID
      type
      profile {
        id
        description
        displayName
        tagset {
          ...TagsetDetails
        }
        visuals {
          ...VisualUri
        }
      }
    }
  }
  ${TagsetDetailsFragmentDoc}
  ${VisualUriFragmentDoc}
`;
export type CreatePostMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreatePostMutation,
  SchemaTypes.CreatePostMutationVariables
>;

/**
 * __useCreatePostMutation__
 *
 * To run a mutation, you first call `useCreatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostMutation, { data, loading, error }] = useCreatePostMutation({
 *   variables: {
 *      postData: // value for 'postData'
 *   },
 * });
 */
export function useCreatePostMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.CreatePostMutation, SchemaTypes.CreatePostMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CreatePostMutation, SchemaTypes.CreatePostMutationVariables>(
    CreatePostDocument,
    options
  );
}

export type CreatePostMutationHookResult = ReturnType<typeof useCreatePostMutation>;
export type CreatePostMutationResult = Apollo.MutationResult<SchemaTypes.CreatePostMutation>;
export type CreatePostMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreatePostMutation,
  SchemaTypes.CreatePostMutationVariables
>;
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
export const MovePostToCalloutDocument = gql`
  mutation MovePostToCallout($postId: UUID!, $calloutId: UUID!) {
    movePostToCallout(movePostData: { postID: $postId, calloutID: $calloutId }) {
      id
      nameID
      callout {
        id
        nameID
      }
    }
  }
`;
export type MovePostToCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.MovePostToCalloutMutation,
  SchemaTypes.MovePostToCalloutMutationVariables
>;

/**
 * __useMovePostToCalloutMutation__
 *
 * To run a mutation, you first call `useMovePostToCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMovePostToCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [movePostToCalloutMutation, { data, loading, error }] = useMovePostToCalloutMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useMovePostToCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.MovePostToCalloutMutation,
    SchemaTypes.MovePostToCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.MovePostToCalloutMutation, SchemaTypes.MovePostToCalloutMutationVariables>(
    MovePostToCalloutDocument,
    options
  );
}

export type MovePostToCalloutMutationHookResult = ReturnType<typeof useMovePostToCalloutMutation>;
export type MovePostToCalloutMutationResult = Apollo.MutationResult<SchemaTypes.MovePostToCalloutMutation>;
export type MovePostToCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.MovePostToCalloutMutation,
  SchemaTypes.MovePostToCalloutMutationVariables
>;
export const SpaceWhiteboardTemplatesLibraryDocument = gql`
  query SpaceWhiteboardTemplatesLibrary($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      templates {
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

export const SpaceWhiteboardTemplateValueDocument = gql`
  query SpaceWhiteboardTemplateValue($spaceId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $whiteboardTemplateId) {
          ...WhiteboardTemplateCard
          value
        }
      }
    }
  }
  ${WhiteboardTemplateCardFragmentDoc}
`;

/**
 * __useSpaceWhiteboardTemplateValueQuery__
 *
 * To run a query within a React component, call `useSpaceWhiteboardTemplateValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceWhiteboardTemplateValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceWhiteboardTemplateValueQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useSpaceWhiteboardTemplateValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceWhiteboardTemplateValueQuery,
    SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceWhiteboardTemplateValueQuery,
    SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
  >(SpaceWhiteboardTemplateValueDocument, options);
}

export function useSpaceWhiteboardTemplateValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceWhiteboardTemplateValueQuery,
    SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceWhiteboardTemplateValueQuery,
    SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
  >(SpaceWhiteboardTemplateValueDocument, options);
}

export type SpaceWhiteboardTemplateValueQueryHookResult = ReturnType<typeof useSpaceWhiteboardTemplateValueQuery>;
export type SpaceWhiteboardTemplateValueLazyQueryHookResult = ReturnType<
  typeof useSpaceWhiteboardTemplateValueLazyQuery
>;
export type SpaceWhiteboardTemplateValueQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceWhiteboardTemplateValueQuery,
  SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
>;
export function refetchSpaceWhiteboardTemplateValueQuery(
  variables: SchemaTypes.SpaceWhiteboardTemplateValueQueryVariables
) {
  return { query: SpaceWhiteboardTemplateValueDocument, variables: variables };
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

export const PlatformWhiteboardTemplateValueDocument = gql`
  query PlatformWhiteboardTemplateValue($innovationPackId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          ...InnovationPackWithProvider
          templates {
            id
            whiteboardTemplate(ID: $whiteboardTemplateId) {
              ...WhiteboardTemplateCard
              value
            }
          }
        }
      }
    }
  }
  ${InnovationPackWithProviderFragmentDoc}
  ${WhiteboardTemplateCardFragmentDoc}
`;

/**
 * __usePlatformWhiteboardTemplateValueQuery__
 *
 * To run a query within a React component, call `usePlatformWhiteboardTemplateValueQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformWhiteboardTemplateValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformWhiteboardTemplateValueQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function usePlatformWhiteboardTemplateValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformWhiteboardTemplateValueQuery,
    SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformWhiteboardTemplateValueQuery,
    SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
  >(PlatformWhiteboardTemplateValueDocument, options);
}

export function usePlatformWhiteboardTemplateValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformWhiteboardTemplateValueQuery,
    SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformWhiteboardTemplateValueQuery,
    SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
  >(PlatformWhiteboardTemplateValueDocument, options);
}

export type PlatformWhiteboardTemplateValueQueryHookResult = ReturnType<typeof usePlatformWhiteboardTemplateValueQuery>;
export type PlatformWhiteboardTemplateValueLazyQueryHookResult = ReturnType<
  typeof usePlatformWhiteboardTemplateValueLazyQuery
>;
export type PlatformWhiteboardTemplateValueQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformWhiteboardTemplateValueQuery,
  SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
>;
export function refetchPlatformWhiteboardTemplateValueQuery(
  variables: SchemaTypes.PlatformWhiteboardTemplateValueQueryVariables
) {
  return { query: PlatformWhiteboardTemplateValueDocument, variables: variables };
}

export const WhiteboardLockedByDetailsDocument = gql`
  query WhiteboardLockedByDetails($ids: [UUID!]!) {
    usersById(IDs: $ids) {
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
      templates {
        id
        whiteboardTemplates {
          ...CreateWhiteboardWhiteboardTemplate
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

export const SpaceWhiteboardFromCalloutDocument = gql`
  query spaceWhiteboardFromCallout($spaceId: UUID_NAMEID!, $calloutId: UUID_NAMEID!, $whiteboardId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      collaboration {
        ...CalloutWithWhiteboard
      }
    }
  }
  ${CalloutWithWhiteboardFragmentDoc}
`;

/**
 * __useSpaceWhiteboardFromCalloutQuery__
 *
 * To run a query within a React component, call `useSpaceWhiteboardFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceWhiteboardFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceWhiteboardFromCalloutQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      calloutId: // value for 'calloutId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useSpaceWhiteboardFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceWhiteboardFromCalloutQuery,
    SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceWhiteboardFromCalloutQuery,
    SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
  >(SpaceWhiteboardFromCalloutDocument, options);
}

export function useSpaceWhiteboardFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceWhiteboardFromCalloutQuery,
    SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceWhiteboardFromCalloutQuery,
    SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
  >(SpaceWhiteboardFromCalloutDocument, options);
}

export type SpaceWhiteboardFromCalloutQueryHookResult = ReturnType<typeof useSpaceWhiteboardFromCalloutQuery>;
export type SpaceWhiteboardFromCalloutLazyQueryHookResult = ReturnType<typeof useSpaceWhiteboardFromCalloutLazyQuery>;
export type SpaceWhiteboardFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceWhiteboardFromCalloutQuery,
  SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
>;
export function refetchSpaceWhiteboardFromCalloutQuery(
  variables: SchemaTypes.SpaceWhiteboardFromCalloutQueryVariables
) {
  return { query: SpaceWhiteboardFromCalloutDocument, variables: variables };
}

export const SpaceWhiteboardsDocument = gql`
  query spaceWhiteboards($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      collaboration {
        ...CollaborationWithWhiteboardDetails
      }
    }
  }
  ${CollaborationWithWhiteboardDetailsFragmentDoc}
`;

/**
 * __useSpaceWhiteboardsQuery__
 *
 * To run a query within a React component, call `useSpaceWhiteboardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceWhiteboardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceWhiteboardsQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceWhiteboardsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceWhiteboardsQuery, SchemaTypes.SpaceWhiteboardsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceWhiteboardsQuery, SchemaTypes.SpaceWhiteboardsQueryVariables>(
    SpaceWhiteboardsDocument,
    options
  );
}

export function useSpaceWhiteboardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceWhiteboardsQuery,
    SchemaTypes.SpaceWhiteboardsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceWhiteboardsQuery, SchemaTypes.SpaceWhiteboardsQueryVariables>(
    SpaceWhiteboardsDocument,
    options
  );
}

export type SpaceWhiteboardsQueryHookResult = ReturnType<typeof useSpaceWhiteboardsQuery>;
export type SpaceWhiteboardsLazyQueryHookResult = ReturnType<typeof useSpaceWhiteboardsLazyQuery>;
export type SpaceWhiteboardsQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceWhiteboardsQuery,
  SchemaTypes.SpaceWhiteboardsQueryVariables
>;
export function refetchSpaceWhiteboardsQuery(variables: SchemaTypes.SpaceWhiteboardsQueryVariables) {
  return { query: SpaceWhiteboardsDocument, variables: variables };
}

export const WhiteboardWithValueDocument = gql`
  query whiteboardWithValue($whiteboardId: UUID!) {
    whiteboard(ID: $whiteboardId) {
      ...WhiteboardDetails
      ...WhiteboardValue
    }
  }
  ${WhiteboardDetailsFragmentDoc}
  ${WhiteboardValueFragmentDoc}
`;

/**
 * __useWhiteboardWithValueQuery__
 *
 * To run a query within a React component, call `useWhiteboardWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardWithValueQuery({
 *   variables: {
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useWhiteboardWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardWithValueQuery,
    SchemaTypes.WhiteboardWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.WhiteboardWithValueQuery, SchemaTypes.WhiteboardWithValueQueryVariables>(
    WhiteboardWithValueDocument,
    options
  );
}

export function useWhiteboardWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardWithValueQuery,
    SchemaTypes.WhiteboardWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.WhiteboardWithValueQuery, SchemaTypes.WhiteboardWithValueQueryVariables>(
    WhiteboardWithValueDocument,
    options
  );
}

export type WhiteboardWithValueQueryHookResult = ReturnType<typeof useWhiteboardWithValueQuery>;
export type WhiteboardWithValueLazyQueryHookResult = ReturnType<typeof useWhiteboardWithValueLazyQuery>;
export type WhiteboardWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardWithValueQuery,
  SchemaTypes.WhiteboardWithValueQueryVariables
>;
export function refetchWhiteboardWithValueQuery(variables: SchemaTypes.WhiteboardWithValueQueryVariables) {
  return { query: WhiteboardWithValueDocument, variables: variables };
}

export const ChallengeWhiteboardFromCalloutDocument = gql`
  query challengeWhiteboardFromCallout(
    $spaceId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $whiteboardId: UUID_NAMEID!
  ) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        collaboration {
          ...CalloutWithWhiteboard
        }
      }
    }
  }
  ${CalloutWithWhiteboardFragmentDoc}
`;

/**
 * __useChallengeWhiteboardFromCalloutQuery__
 *
 * To run a query within a React component, call `useChallengeWhiteboardFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeWhiteboardFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeWhiteboardFromCalloutQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      calloutId: // value for 'calloutId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useChallengeWhiteboardFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeWhiteboardFromCalloutQuery,
    SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeWhiteboardFromCalloutQuery,
    SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
  >(ChallengeWhiteboardFromCalloutDocument, options);
}

export function useChallengeWhiteboardFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeWhiteboardFromCalloutQuery,
    SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeWhiteboardFromCalloutQuery,
    SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
  >(ChallengeWhiteboardFromCalloutDocument, options);
}

export type ChallengeWhiteboardFromCalloutQueryHookResult = ReturnType<typeof useChallengeWhiteboardFromCalloutQuery>;
export type ChallengeWhiteboardFromCalloutLazyQueryHookResult = ReturnType<
  typeof useChallengeWhiteboardFromCalloutLazyQuery
>;
export type ChallengeWhiteboardFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeWhiteboardFromCalloutQuery,
  SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
>;
export function refetchChallengeWhiteboardFromCalloutQuery(
  variables: SchemaTypes.ChallengeWhiteboardFromCalloutQueryVariables
) {
  return { query: ChallengeWhiteboardFromCalloutDocument, variables: variables };
}

export const OpportunityWhiteboardFromCalloutDocument = gql`
  query opportunityWhiteboardFromCallout(
    $spaceId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $whiteboardId: UUID_NAMEID!
  ) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        collaboration {
          ...CalloutWithWhiteboard
        }
      }
    }
  }
  ${CalloutWithWhiteboardFragmentDoc}
`;

/**
 * __useOpportunityWhiteboardFromCalloutQuery__
 *
 * To run a query within a React component, call `useOpportunityWhiteboardFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityWhiteboardFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityWhiteboardFromCalloutQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *      calloutId: // value for 'calloutId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useOpportunityWhiteboardFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityWhiteboardFromCalloutQuery,
    SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityWhiteboardFromCalloutQuery,
    SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
  >(OpportunityWhiteboardFromCalloutDocument, options);
}

export function useOpportunityWhiteboardFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityWhiteboardFromCalloutQuery,
    SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityWhiteboardFromCalloutQuery,
    SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
  >(OpportunityWhiteboardFromCalloutDocument, options);
}

export type OpportunityWhiteboardFromCalloutQueryHookResult = ReturnType<
  typeof useOpportunityWhiteboardFromCalloutQuery
>;
export type OpportunityWhiteboardFromCalloutLazyQueryHookResult = ReturnType<
  typeof useOpportunityWhiteboardFromCalloutLazyQuery
>;
export type OpportunityWhiteboardFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityWhiteboardFromCalloutQuery,
  SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
>;
export function refetchOpportunityWhiteboardFromCalloutQuery(
  variables: SchemaTypes.OpportunityWhiteboardFromCalloutQueryVariables
) {
  return { query: OpportunityWhiteboardFromCalloutDocument, variables: variables };
}

export const SpaceTemplateWhiteboardValuesDocument = gql`
  query spaceTemplateWhiteboardValues($spaceId: UUID_NAMEID!, $whiteboardId: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $whiteboardId) {
          id
          profile {
            ...WhiteboardProfile
          }
          value
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
`;

/**
 * __useSpaceTemplateWhiteboardValuesQuery__
 *
 * To run a query within a React component, call `useSpaceTemplateWhiteboardValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplateWhiteboardValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplateWhiteboardValuesQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function useSpaceTemplateWhiteboardValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplateWhiteboardValuesQuery,
    SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceTemplateWhiteboardValuesQuery,
    SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
  >(SpaceTemplateWhiteboardValuesDocument, options);
}

export function useSpaceTemplateWhiteboardValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplateWhiteboardValuesQuery,
    SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceTemplateWhiteboardValuesQuery,
    SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
  >(SpaceTemplateWhiteboardValuesDocument, options);
}

export type SpaceTemplateWhiteboardValuesQueryHookResult = ReturnType<typeof useSpaceTemplateWhiteboardValuesQuery>;
export type SpaceTemplateWhiteboardValuesLazyQueryHookResult = ReturnType<
  typeof useSpaceTemplateWhiteboardValuesLazyQuery
>;
export type SpaceTemplateWhiteboardValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplateWhiteboardValuesQuery,
  SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
>;
export function refetchSpaceTemplateWhiteboardValuesQuery(
  variables: SchemaTypes.SpaceTemplateWhiteboardValuesQueryVariables
) {
  return { query: SpaceTemplateWhiteboardValuesDocument, variables: variables };
}

export const PlatformTemplateWhiteboardValuesDocument = gql`
  query platformTemplateWhiteboardValues($innovationPackId: UUID_NAMEID!, $whiteboardId: UUID!) {
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
              value
            }
          }
        }
      }
    }
  }
  ${WhiteboardProfileFragmentDoc}
`;

/**
 * __usePlatformTemplateWhiteboardValuesQuery__
 *
 * To run a query within a React component, call `usePlatformTemplateWhiteboardValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformTemplateWhiteboardValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformTemplateWhiteboardValuesQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      whiteboardId: // value for 'whiteboardId'
 *   },
 * });
 */
export function usePlatformTemplateWhiteboardValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformTemplateWhiteboardValuesQuery,
    SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformTemplateWhiteboardValuesQuery,
    SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
  >(PlatformTemplateWhiteboardValuesDocument, options);
}

export function usePlatformTemplateWhiteboardValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformTemplateWhiteboardValuesQuery,
    SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformTemplateWhiteboardValuesQuery,
    SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
  >(PlatformTemplateWhiteboardValuesDocument, options);
}

export type PlatformTemplateWhiteboardValuesQueryHookResult = ReturnType<
  typeof usePlatformTemplateWhiteboardValuesQuery
>;
export type PlatformTemplateWhiteboardValuesLazyQueryHookResult = ReturnType<
  typeof usePlatformTemplateWhiteboardValuesLazyQuery
>;
export type PlatformTemplateWhiteboardValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformTemplateWhiteboardValuesQuery,
  SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
>;
export function refetchPlatformTemplateWhiteboardValuesQuery(
  variables: SchemaTypes.PlatformTemplateWhiteboardValuesQueryVariables
) {
  return { query: PlatformTemplateWhiteboardValuesDocument, variables: variables };
}

export const CreateWhiteboardOnCalloutDocument = gql`
  mutation createWhiteboardOnCallout($input: CreateWhiteboardOnCalloutInput!) {
    createWhiteboardOnCallout(whiteboardData: $input) {
      ...WhiteboardDetails
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
  mutation updateWhiteboard($input: UpdateWhiteboardDirectInput!) {
    updateWhiteboard(whiteboardData: $input) {
      id
      value
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
export const CheckoutWhiteboardDocument = gql`
  mutation checkoutWhiteboard($input: WhiteboardCheckoutEventInput!) {
    eventOnWhiteboardCheckout(whiteboardCheckoutEventData: $input) {
      ...CheckoutDetails
    }
  }
  ${CheckoutDetailsFragmentDoc}
`;
export type CheckoutWhiteboardMutationFn = Apollo.MutationFunction<
  SchemaTypes.CheckoutWhiteboardMutation,
  SchemaTypes.CheckoutWhiteboardMutationVariables
>;

/**
 * __useCheckoutWhiteboardMutation__
 *
 * To run a mutation, you first call `useCheckoutWhiteboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutWhiteboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutWhiteboardMutation, { data, loading, error }] = useCheckoutWhiteboardMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCheckoutWhiteboardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CheckoutWhiteboardMutation,
    SchemaTypes.CheckoutWhiteboardMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CheckoutWhiteboardMutation, SchemaTypes.CheckoutWhiteboardMutationVariables>(
    CheckoutWhiteboardDocument,
    options
  );
}

export type CheckoutWhiteboardMutationHookResult = ReturnType<typeof useCheckoutWhiteboardMutation>;
export type CheckoutWhiteboardMutationResult = Apollo.MutationResult<SchemaTypes.CheckoutWhiteboardMutation>;
export type CheckoutWhiteboardMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CheckoutWhiteboardMutation,
  SchemaTypes.CheckoutWhiteboardMutationVariables
>;
export const WhiteboardContentUpdatedDocument = gql`
  subscription whiteboardContentUpdated($whiteboardIDs: [UUID!]!) {
    whiteboardContentUpdated(whiteboardIDs: $whiteboardIDs) {
      whiteboardID
      value
    }
  }
`;

/**
 * __useWhiteboardContentUpdatedSubscription__
 *
 * To run a query within a React component, call `useWhiteboardContentUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardContentUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardContentUpdatedSubscription({
 *   variables: {
 *      whiteboardIDs: // value for 'whiteboardIDs'
 *   },
 * });
 */
export function useWhiteboardContentUpdatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.WhiteboardContentUpdatedSubscription,
    SchemaTypes.WhiteboardContentUpdatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.WhiteboardContentUpdatedSubscription,
    SchemaTypes.WhiteboardContentUpdatedSubscriptionVariables
  >(WhiteboardContentUpdatedDocument, options);
}

export type WhiteboardContentUpdatedSubscriptionHookResult = ReturnType<typeof useWhiteboardContentUpdatedSubscription>;
export type WhiteboardContentUpdatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.WhiteboardContentUpdatedSubscription>;
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
export const ChallengePreferencesDocument = gql`
  query challengePreferences($spaceNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    space(ID: $spaceNameId) {
      id
      challenge(ID: $challengeNameId) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
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
    usersById(IDs: $ids) {
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
          id
          nameID
          profile {
            id
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
      }
    }
  }
  ${VisualFullFragmentDoc}
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
        id
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
  query MentionableUsers($filter: UserFilterInput, $first: Int) {
    usersPaginated(filter: $filter, first: $first) {
      users {
        id
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
            ...VisualUri
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
 *   },
 * });
 */
export function useMentionableUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.MentionableUsersQuery, SchemaTypes.MentionableUsersQueryVariables>
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
export function refetchMentionableUsersQuery(variables?: SchemaTypes.MentionableUsersQueryVariables) {
  return { query: MentionableUsersDocument, variables: variables };
}

export const SendMessageToRoomDocument = gql`
  mutation sendMessageToRoom($messageData: RoomSendMessageInput!) {
    sendMessageToRoom(messageData: $messageData) {
      id
      message
      sender {
        id
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
  query communityUpdates($spaceId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceId) {
      id
      community(ID: $communityId) {
        id
        displayName
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
 *      spaceId: // value for 'spaceId'
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

export const CommunityUserPrivilegesDocument = gql`
  query communityUserPrivileges($spaceNameId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceNameId) {
      id
      spaceCommunity: community {
        id
        authorization {
          id
          myPrivileges
        }
      }
      community(ID: $communityId) {
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
  mutation eventOnChallenge($input: InnovationFlowEvent!) {
    eventOnChallenge(innovationFlowEventData: $input) {
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
export const ApplicationBySpaceDocument = gql`
  query applicationBySpace($spaceId: UUID_NAMEID!, $appId: UUID!) {
    space(ID: $spaceId) {
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
 * __useApplicationBySpaceQuery__
 *
 * To run a query within a React component, call `useApplicationBySpaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationBySpaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationBySpaceQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      appId: // value for 'appId'
 *   },
 * });
 */
export function useApplicationBySpaceQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ApplicationBySpaceQuery,
    SchemaTypes.ApplicationBySpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ApplicationBySpaceQuery, SchemaTypes.ApplicationBySpaceQueryVariables>(
    ApplicationBySpaceDocument,
    options
  );
}

export function useApplicationBySpaceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ApplicationBySpaceQuery,
    SchemaTypes.ApplicationBySpaceQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ApplicationBySpaceQuery, SchemaTypes.ApplicationBySpaceQueryVariables>(
    ApplicationBySpaceDocument,
    options
  );
}

export type ApplicationBySpaceQueryHookResult = ReturnType<typeof useApplicationBySpaceQuery>;
export type ApplicationBySpaceLazyQueryHookResult = ReturnType<typeof useApplicationBySpaceLazyQuery>;
export type ApplicationBySpaceQueryResult = Apollo.QueryResult<
  SchemaTypes.ApplicationBySpaceQuery,
  SchemaTypes.ApplicationBySpaceQueryVariables
>;
export function refetchApplicationBySpaceQuery(variables: SchemaTypes.ApplicationBySpaceQueryVariables) {
  return { query: ApplicationBySpaceDocument, variables: variables };
}

export const ChallengeApplicationDocument = gql`
  query challengeApplication($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        profile {
          id
          displayName
        }
        community {
          id
        }
      }
    }
  }
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
 *      spaceId: // value for 'spaceId'
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

export const SpaceNameIdDocument = gql`
  query spaceNameId($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
    }
  }
`;

/**
 * __useSpaceNameIdQuery__
 *
 * To run a query within a React component, call `useSpaceNameIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceNameIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceNameIdQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceNameIdQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceNameIdQuery, SchemaTypes.SpaceNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceNameIdQuery, SchemaTypes.SpaceNameIdQueryVariables>(
    SpaceNameIdDocument,
    options
  );
}

export function useSpaceNameIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.SpaceNameIdQuery, SchemaTypes.SpaceNameIdQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceNameIdQuery, SchemaTypes.SpaceNameIdQueryVariables>(
    SpaceNameIdDocument,
    options
  );
}

export type SpaceNameIdQueryHookResult = ReturnType<typeof useSpaceNameIdQuery>;
export type SpaceNameIdLazyQueryHookResult = ReturnType<typeof useSpaceNameIdLazyQuery>;
export type SpaceNameIdQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceNameIdQuery,
  SchemaTypes.SpaceNameIdQueryVariables
>;
export function refetchSpaceNameIdQuery(variables: SchemaTypes.SpaceNameIdQueryVariables) {
  return { query: SpaceNameIdDocument, variables: variables };
}

export const ChallengeNameIdDocument = gql`
  query challengeNameId($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityNameId($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        id
        nameID
        parentNameID
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
 *      spaceId: // value for 'spaceId'
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

export const SpaceApplicationDocument = gql`
  query spaceApplication($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      profile {
        id
        displayName
      }
      community {
        id
        displayName
      }
    }
  }
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

export const CommunityApplicationFormDocument = gql`
  query CommunityApplicationForm(
    $spaceId: UUID_NAMEID!
    $challengeId: UUID_NAMEID = "mockid"
    $isSpace: Boolean = false
    $isChallenge: Boolean = false
  ) {
    space(ID: $spaceId) {
      id
      ... on Space @include(if: $isSpace) {
        community {
          id
          applicationForm {
            ...ApplicationForm
          }
        }
      }
      ... on Space @include(if: $isChallenge) {
        challenge(ID: $challengeId) {
          community {
            id
            applicationForm {
              ...ApplicationForm
            }
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
  baseOptions: Apollo.QueryHookOptions<
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
export function refetchCommunityApplicationFormQuery(variables: SchemaTypes.CommunityApplicationFormQueryVariables) {
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
  query challengeCommunity($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityCommunity($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
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
 *      spaceId: // value for 'spaceId'
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
  query ChallengeCommunityContributors($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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
  query OpportunityCommunityContributors($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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

export const ContributingOrganizationsDocument = gql`
  query contributingOrganizations($limit: Float, $shuffle: Boolean, $filterCredentials: [AuthorizationCredential!]) {
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
 * __useContributingOrganizationsQuery__
 *
 * To run a query within a React component, call `useContributingOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributingOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributingOrganizationsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      shuffle: // value for 'shuffle'
 *      filterCredentials: // value for 'filterCredentials'
 *   },
 * });
 */
export function useContributingOrganizationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ContributingOrganizationsQuery,
    SchemaTypes.ContributingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ContributingOrganizationsQuery,
    SchemaTypes.ContributingOrganizationsQueryVariables
  >(ContributingOrganizationsDocument, options);
}

export function useContributingOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributingOrganizationsQuery,
    SchemaTypes.ContributingOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ContributingOrganizationsQuery,
    SchemaTypes.ContributingOrganizationsQueryVariables
  >(ContributingOrganizationsDocument, options);
}

export type ContributingOrganizationsQueryHookResult = ReturnType<typeof useContributingOrganizationsQuery>;
export type ContributingOrganizationsLazyQueryHookResult = ReturnType<typeof useContributingOrganizationsLazyQuery>;
export type ContributingOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributingOrganizationsQuery,
  SchemaTypes.ContributingOrganizationsQueryVariables
>;
export function refetchContributingOrganizationsQuery(variables?: SchemaTypes.ContributingOrganizationsQueryVariables) {
  return { query: ContributingOrganizationsDocument, variables: variables };
}

export const ContributingUsersDocument = gql`
  query contributingUsers($limit: Float, $shuffle: Boolean, $filterCredentials: [AuthorizationCredential!]) {
    users(limit: $limit, shuffle: $shuffle, filter: { credentials: $filterCredentials }) {
      id
      nameID
      isContactable
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
  }
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __useContributingUsersQuery__
 *
 * To run a query within a React component, call `useContributingUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributingUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributingUsersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      shuffle: // value for 'shuffle'
 *      filterCredentials: // value for 'filterCredentials'
 *   },
 * });
 */
export function useContributingUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<SchemaTypes.ContributingUsersQuery, SchemaTypes.ContributingUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ContributingUsersQuery, SchemaTypes.ContributingUsersQueryVariables>(
    ContributingUsersDocument,
    options
  );
}

export function useContributingUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ContributingUsersQuery,
    SchemaTypes.ContributingUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ContributingUsersQuery, SchemaTypes.ContributingUsersQueryVariables>(
    ContributingUsersDocument,
    options
  );
}

export type ContributingUsersQueryHookResult = ReturnType<typeof useContributingUsersQuery>;
export type ContributingUsersLazyQueryHookResult = ReturnType<typeof useContributingUsersLazyQuery>;
export type ContributingUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.ContributingUsersQuery,
  SchemaTypes.ContributingUsersQueryVariables
>;
export function refetchContributingUsersQuery(variables?: SchemaTypes.ContributingUsersQueryVariables) {
  return { query: ContributingUsersDocument, variables: variables };
}

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
export const AllCommunitiesDocument = gql`
  query allCommunities($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengesWithCommunityDocument = gql`
  query challengesWithCommunity($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenges {
        id
        nameID
        profile {
          id
          displayName
        }
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
 *      spaceId: // value for 'spaceId'
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

export const CommunityGroupsDocument = gql`
  query communityGroups($spaceId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceId) {
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
 *      spaceId: // value for 'spaceId'
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
  query communityMembers($spaceId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceId) {
      id
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
 *      spaceId: // value for 'spaceId'
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

export const CommunityMessagesDocument = gql`
  query communityMessages($spaceId: UUID_NAMEID!, $communityId: UUID!) {
    space(ID: $spaceId) {
      id
      community(ID: $communityId) {
        id
        communication {
          id
          updates {
            id
            messages {
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
 *      spaceId: // value for 'spaceId'
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

export const ChallengeCommunityMembersDocument = gql`
  query challengeCommunityMembers($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        community {
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
        }
      }
    }
  }
  ${CommunityMemberUserFragmentDoc}
  ${OrganizationDetailsFragmentDoc}
`;

/**
 * __useChallengeCommunityMembersQuery__
 *
 * To run a query within a React component, call `useChallengeCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCommunityMembersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useChallengeCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCommunityMembersQuery,
    SchemaTypes.ChallengeCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCommunityMembersQuery,
    SchemaTypes.ChallengeCommunityMembersQueryVariables
  >(ChallengeCommunityMembersDocument, options);
}

export function useChallengeCommunityMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCommunityMembersQuery,
    SchemaTypes.ChallengeCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCommunityMembersQuery,
    SchemaTypes.ChallengeCommunityMembersQueryVariables
  >(ChallengeCommunityMembersDocument, options);
}

export type ChallengeCommunityMembersQueryHookResult = ReturnType<typeof useChallengeCommunityMembersQuery>;
export type ChallengeCommunityMembersLazyQueryHookResult = ReturnType<typeof useChallengeCommunityMembersLazyQuery>;
export type ChallengeCommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCommunityMembersQuery,
  SchemaTypes.ChallengeCommunityMembersQueryVariables
>;
export function refetchChallengeCommunityMembersQuery(variables: SchemaTypes.ChallengeCommunityMembersQueryVariables) {
  return { query: ChallengeCommunityMembersDocument, variables: variables };
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
export const AssignUserAsSpaceAdminDocument = gql`
  mutation assignUserAsSpaceAdmin($input: AssignCommunityRoleToUserInput!) {
    assignCommunityRoleToUser(roleData: $input) {
      id
    }
  }
`;
export type AssignUserAsSpaceAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsSpaceAdminMutation,
  SchemaTypes.AssignUserAsSpaceAdminMutationVariables
>;

/**
 * __useAssignUserAsSpaceAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsSpaceAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsSpaceAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsSpaceAdminMutation, { data, loading, error }] = useAssignUserAsSpaceAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsSpaceAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsSpaceAdminMutation,
    SchemaTypes.AssignUserAsSpaceAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsSpaceAdminMutation,
    SchemaTypes.AssignUserAsSpaceAdminMutationVariables
  >(AssignUserAsSpaceAdminDocument, options);
}

export type AssignUserAsSpaceAdminMutationHookResult = ReturnType<typeof useAssignUserAsSpaceAdminMutation>;
export type AssignUserAsSpaceAdminMutationResult = Apollo.MutationResult<SchemaTypes.AssignUserAsSpaceAdminMutation>;
export type AssignUserAsSpaceAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsSpaceAdminMutation,
  SchemaTypes.AssignUserAsSpaceAdminMutationVariables
>;
export const RemoveUserAsSpaceAdminDocument = gql`
  mutation removeUserAsSpaceAdmin($input: RemoveCommunityRoleFromUserInput!) {
    removeCommunityRoleFromUser(roleData: $input) {
      id
    }
  }
`;
export type RemoveUserAsSpaceAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsSpaceAdminMutation,
  SchemaTypes.RemoveUserAsSpaceAdminMutationVariables
>;

/**
 * __useRemoveUserAsSpaceAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsSpaceAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsSpaceAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsSpaceAdminMutation, { data, loading, error }] = useRemoveUserAsSpaceAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsSpaceAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsSpaceAdminMutation,
    SchemaTypes.RemoveUserAsSpaceAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsSpaceAdminMutation,
    SchemaTypes.RemoveUserAsSpaceAdminMutationVariables
  >(RemoveUserAsSpaceAdminDocument, options);
}

export type RemoveUserAsSpaceAdminMutationHookResult = ReturnType<typeof useRemoveUserAsSpaceAdminMutation>;
export type RemoveUserAsSpaceAdminMutationResult = Apollo.MutationResult<SchemaTypes.RemoveUserAsSpaceAdminMutation>;
export type RemoveUserAsSpaceAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsSpaceAdminMutation,
  SchemaTypes.RemoveUserAsSpaceAdminMutationVariables
>;
export const AssignUserAsChallengeAdminDocument = gql`
  mutation assignUserAsChallengeAdmin($input: AssignCommunityRoleToUserInput!) {
    assignCommunityRoleToUser(roleData: $input) {
      id
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
export const RemoveUserAsChallengeAdminDocument = gql`
  mutation removeUserAsChallengeAdmin($input: RemoveCommunityRoleFromUserInput!) {
    removeCommunityRoleFromUser(roleData: $input) {
      id
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
export const AssignUserAsOpportunityAdminDocument = gql`
  mutation assignUserAsOpportunityAdmin($input: AssignCommunityRoleToUserInput!) {
    assignCommunityRoleToUser(roleData: $input) {
      id
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
  mutation removeUserAsOpportunityAdmin($input: RemoveCommunityRoleFromUserInput!) {
    removeCommunityRoleFromUser(roleData: $input) {
      id
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
export const OpportunityCommunityMembersDocument = gql`
  query opportunityCommunityMembers($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        community {
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
        }
      }
    }
  }
  ${CommunityMemberUserFragmentDoc}
  ${OrganizationDetailsFragmentDoc}
`;

/**
 * __useOpportunityCommunityMembersQuery__
 *
 * To run a query within a React component, call `useOpportunityCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCommunityMembersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *   },
 * });
 */
export function useOpportunityCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCommunityMembersQuery,
    SchemaTypes.OpportunityCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCommunityMembersQuery,
    SchemaTypes.OpportunityCommunityMembersQueryVariables
  >(OpportunityCommunityMembersDocument, options);
}

export function useOpportunityCommunityMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCommunityMembersQuery,
    SchemaTypes.OpportunityCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCommunityMembersQuery,
    SchemaTypes.OpportunityCommunityMembersQueryVariables
  >(OpportunityCommunityMembersDocument, options);
}

export type OpportunityCommunityMembersQueryHookResult = ReturnType<typeof useOpportunityCommunityMembersQuery>;
export type OpportunityCommunityMembersLazyQueryHookResult = ReturnType<typeof useOpportunityCommunityMembersLazyQuery>;
export type OpportunityCommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCommunityMembersQuery,
  SchemaTypes.OpportunityCommunityMembersQueryVariables
>;
export function refetchOpportunityCommunityMembersQuery(
  variables: SchemaTypes.OpportunityCommunityMembersQueryVariables
) {
  return { query: OpportunityCommunityMembersDocument, variables: variables };
}

export const SpaceCommunityMembersDocument = gql`
  query spaceCommunityMembers($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      community {
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
      host {
        ...OrganizationDetails
      }
    }
  }
  ${CommunityMemberUserFragmentDoc}
  ${OrganizationDetailsFragmentDoc}
  ${CommunityPolicyFragmentDoc}
`;

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
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceCommunityMembersQuery,
    SchemaTypes.SpaceCommunityMembersQueryVariables
  >
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

export type SpaceCommunityMembersQueryHookResult = ReturnType<typeof useSpaceCommunityMembersQuery>;
export type SpaceCommunityMembersLazyQueryHookResult = ReturnType<typeof useSpaceCommunityMembersLazyQuery>;
export type SpaceCommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceCommunityMembersQuery,
  SchemaTypes.SpaceCommunityMembersQueryVariables
>;
export function refetchSpaceCommunityMembersQuery(variables: SchemaTypes.SpaceCommunityMembersQueryVariables) {
  return { query: SpaceCommunityMembersDocument, variables: variables };
}

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

export const UserOrganizationsDocument = gql`
  query userOrganizations($input: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      ...UserOrganizationsDetails
    }
  }
  ${UserOrganizationsDetailsFragmentDoc}
`;

/**
 * __useUserOrganizationsQuery__
 *
 * To run a query within a React component, call `useUserOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserOrganizationsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserOrganizationsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.UserOrganizationsQuery, SchemaTypes.UserOrganizationsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.UserOrganizationsQuery, SchemaTypes.UserOrganizationsQueryVariables>(
    UserOrganizationsDocument,
    options
  );
}

export function useUserOrganizationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.UserOrganizationsQuery,
    SchemaTypes.UserOrganizationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.UserOrganizationsQuery, SchemaTypes.UserOrganizationsQueryVariables>(
    UserOrganizationsDocument,
    options
  );
}

export type UserOrganizationsQueryHookResult = ReturnType<typeof useUserOrganizationsQuery>;
export type UserOrganizationsLazyQueryHookResult = ReturnType<typeof useUserOrganizationsLazyQuery>;
export type UserOrganizationsQueryResult = Apollo.QueryResult<
  SchemaTypes.UserOrganizationsQuery,
  SchemaTypes.UserOrganizationsQueryVariables
>;
export function refetchUserOrganizationsQuery(variables: SchemaTypes.UserOrganizationsQueryVariables) {
  return { query: UserOrganizationsDocument, variables: variables };
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

export const OrganizationDetailsDocument = gql`
  query organizationDetails($id: UUID_NAMEID!) {
    organization(ID: $id) {
      id
      nameID
      profile {
        id
        displayName
        visual(type: AVATAR) {
          ...VisualUri
        }
        description
        references {
          name
          uri
        }
        tagsets {
          ...TagsetDetails
        }
      }
      groups {
        id
        name
        members {
          id
          profile {
            id
            displayName
          }
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
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
      profile {
        id
        displayName
      }
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

export const MessagingAvailableRecipientsDocument = gql`
  query MessagingAvailableRecipients($filter: UserFilterInput, $first: Int) {
    usersPaginated(filter: $filter, first: $first) {
      users {
        ...MessagingUserInformation
      }
    }
  }
  ${MessagingUserInformationFragmentDoc}
`;

/**
 * __useMessagingAvailableRecipientsQuery__
 *
 * To run a query within a React component, call `useMessagingAvailableRecipientsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMessagingAvailableRecipientsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMessagingAvailableRecipientsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useMessagingAvailableRecipientsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.MessagingAvailableRecipientsQuery,
    SchemaTypes.MessagingAvailableRecipientsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.MessagingAvailableRecipientsQuery,
    SchemaTypes.MessagingAvailableRecipientsQueryVariables
  >(MessagingAvailableRecipientsDocument, options);
}

export function useMessagingAvailableRecipientsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MessagingAvailableRecipientsQuery,
    SchemaTypes.MessagingAvailableRecipientsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.MessagingAvailableRecipientsQuery,
    SchemaTypes.MessagingAvailableRecipientsQueryVariables
  >(MessagingAvailableRecipientsDocument, options);
}

export type MessagingAvailableRecipientsQueryHookResult = ReturnType<typeof useMessagingAvailableRecipientsQuery>;
export type MessagingAvailableRecipientsLazyQueryHookResult = ReturnType<
  typeof useMessagingAvailableRecipientsLazyQuery
>;
export type MessagingAvailableRecipientsQueryResult = Apollo.QueryResult<
  SchemaTypes.MessagingAvailableRecipientsQuery,
  SchemaTypes.MessagingAvailableRecipientsQueryVariables
>;
export function refetchMessagingAvailableRecipientsQuery(
  variables?: SchemaTypes.MessagingAvailableRecipientsQueryVariables
) {
  return { query: MessagingAvailableRecipientsDocument, variables: variables };
}

export const MessagingUserDetailsDocument = gql`
  query MessagingUserDetails($id: UUID_NAMEID_EMAIL!) {
    user(ID: $id) {
      ...MessagingUserInformation
    }
  }
  ${MessagingUserInformationFragmentDoc}
`;

/**
 * __useMessagingUserDetailsQuery__
 *
 * To run a query within a React component, call `useMessagingUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMessagingUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMessagingUserDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMessagingUserDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.MessagingUserDetailsQuery,
    SchemaTypes.MessagingUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.MessagingUserDetailsQuery, SchemaTypes.MessagingUserDetailsQueryVariables>(
    MessagingUserDetailsDocument,
    options
  );
}

export function useMessagingUserDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.MessagingUserDetailsQuery,
    SchemaTypes.MessagingUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.MessagingUserDetailsQuery, SchemaTypes.MessagingUserDetailsQueryVariables>(
    MessagingUserDetailsDocument,
    options
  );
}

export type MessagingUserDetailsQueryHookResult = ReturnType<typeof useMessagingUserDetailsQuery>;
export type MessagingUserDetailsLazyQueryHookResult = ReturnType<typeof useMessagingUserDetailsLazyQuery>;
export type MessagingUserDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.MessagingUserDetailsQuery,
  SchemaTypes.MessagingUserDetailsQueryVariables
>;
export function refetchMessagingUserDetailsQuery(variables: SchemaTypes.MessagingUserDetailsQueryVariables) {
  return { query: MessagingUserDetailsDocument, variables: variables };
}

export const PlatformLevelAuthorizationDocument = gql`
  query PlatformLevelAuthorization {
    authorization {
      ...MyPrivileges
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
    usersById(IDs: $ids) {
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
export const RolesUserDocument = gql`
  query rolesUser($input: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      id
      ...UserRolesDetails
    }
  }
  ${UserRolesDetailsFragmentDoc}
`;

/**
 * __useRolesUserQuery__
 *
 * To run a query within a React component, call `useRolesUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useRolesUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRolesUserQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRolesUserQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.RolesUserQuery, SchemaTypes.RolesUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.RolesUserQuery, SchemaTypes.RolesUserQueryVariables>(RolesUserDocument, options);
}

export function useRolesUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.RolesUserQuery, SchemaTypes.RolesUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.RolesUserQuery, SchemaTypes.RolesUserQueryVariables>(
    RolesUserDocument,
    options
  );
}

export type RolesUserQueryHookResult = ReturnType<typeof useRolesUserQuery>;
export type RolesUserLazyQueryHookResult = ReturnType<typeof useRolesUserLazyQuery>;
export type RolesUserQueryResult = Apollo.QueryResult<SchemaTypes.RolesUserQuery, SchemaTypes.RolesUserQueryVariables>;
export function refetchRolesUserQuery(variables: SchemaTypes.RolesUserQueryVariables) {
  return { query: RolesUserDocument, variables: variables };
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
  query userApplications($input: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      applications {
        id
        state
        communityID
        displayName
        createdDate
        spaceID
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
    authorization {
      ...MyPrivileges
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

export const UserProfileApplicationsDocument = gql`
  query userProfileApplications($input: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $input, filter: { visibilities: [ACTIVE, DEMO] } }) {
      applications {
        id
        state
        displayName
        spaceID
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
export const PendingMembershipsDocument = gql`
  query PendingMemberships($userId: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userId }) {
      invitations {
        id
        spaceID
        challengeID
        opportunityID
        welcomeMessage
        createdBy
        createdDate
        state
      }
      applications {
        id
        spaceID
        challengeID
        opportunityID
        state
      }
    }
  }
`;

/**
 * __usePendingMembershipsQuery__
 *
 * To run a query within a React component, call `usePendingMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePendingMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePendingMembershipsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function usePendingMembershipsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PendingMembershipsQuery,
    SchemaTypes.PendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PendingMembershipsQuery, SchemaTypes.PendingMembershipsQueryVariables>(
    PendingMembershipsDocument,
    options
  );
}

export function usePendingMembershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PendingMembershipsQuery,
    SchemaTypes.PendingMembershipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PendingMembershipsQuery, SchemaTypes.PendingMembershipsQueryVariables>(
    PendingMembershipsDocument,
    options
  );
}

export type PendingMembershipsQueryHookResult = ReturnType<typeof usePendingMembershipsQuery>;
export type PendingMembershipsLazyQueryHookResult = ReturnType<typeof usePendingMembershipsLazyQuery>;
export type PendingMembershipsQueryResult = Apollo.QueryResult<
  SchemaTypes.PendingMembershipsQuery,
  SchemaTypes.PendingMembershipsQueryVariables
>;
export function refetchPendingMembershipsQuery(variables: SchemaTypes.PendingMembershipsQueryVariables) {
  return { query: PendingMembershipsDocument, variables: variables };
}

export const PendingMembershipsSpaceDocument = gql`
  query PendingMembershipsSpace($spaceId: UUID_NAMEID!, $fetchDetails: Boolean! = false) {
    space(ID: $spaceId) {
      id
      profile {
        ...PendingMembershipsJourneyProfile
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
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
    $spaceId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $fetchDetails: Boolean! = false
  ) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        profile {
          ...PendingMembershipsJourneyProfile
        }
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      fetchDetails: // value for 'fetchDetails'
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
    $spaceId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $fetchDetails: Boolean! = false
  ) {
    space(ID: $spaceId) {
      id
      opportunity(ID: $opportunityId) {
        id
        profile {
          ...PendingMembershipsJourneyProfile
        }
      }
    }
  }
  ${PendingMembershipsJourneyProfileFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *      fetchDetails: // value for 'fetchDetails'
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
  query PendingMembershipsUser($userId: UUID!) {
    usersById(IDs: [$userId]) {
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
      nameID
      visibility
      profile {
        id
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
  query challengeContributionDetails($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
      challenge(ID: $challengeId) {
        id
        nameID
        profile {
          id
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
      visibility
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
 *      spaceId: // value for 'spaceId'
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
  query opportunityContributionDetails($spaceId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
      opportunity(ID: $opportunityId) {
        id
        nameID
        profile {
          id
          displayName
          tagset {
            ...TagsetDetails
          }
          tagline
          visuals {
            ...VisualUri
          }
        }
        parentNameID
        context {
          id
        }
        community {
          id
        }
      }
      visibility
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
 *      spaceId: // value for 'spaceId'
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

export const InnovationHubDocument = gql`
  query InnovationHub {
    platform {
      id
      innovationHub {
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

export const HomePageSpacesDocument = gql`
  query HomePageSpaces($includeMembershipStatus: Boolean!) {
    spaces(filter: { visibilities: [ACTIVE] }) {
      id
      nameID
      profile {
        id
        displayName
        tagline
        tagset {
          ...TagsetDetails
        }
        cardBanner: visual(type: CARD) {
          id
          uri
          alternativeText
        }
      }
      context {
        id
        vision
      }
      metrics {
        id
        name
        value
      }
      ... on Space @include(if: $includeMembershipStatus) {
        community {
          id
          myMembershipStatus
        }
      }
      visibility
    }
  }
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __useHomePageSpacesQuery__
 *
 * To run a query within a React component, call `useHomePageSpacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomePageSpacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomePageSpacesQuery({
 *   variables: {
 *      includeMembershipStatus: // value for 'includeMembershipStatus'
 *   },
 * });
 */
export function useHomePageSpacesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HomePageSpacesQuery, SchemaTypes.HomePageSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HomePageSpacesQuery, SchemaTypes.HomePageSpacesQueryVariables>(
    HomePageSpacesDocument,
    options
  );
}

export function useHomePageSpacesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HomePageSpacesQuery, SchemaTypes.HomePageSpacesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HomePageSpacesQuery, SchemaTypes.HomePageSpacesQueryVariables>(
    HomePageSpacesDocument,
    options
  );
}

export type HomePageSpacesQueryHookResult = ReturnType<typeof useHomePageSpacesQuery>;
export type HomePageSpacesLazyQueryHookResult = ReturnType<typeof useHomePageSpacesLazyQuery>;
export type HomePageSpacesQueryResult = Apollo.QueryResult<
  SchemaTypes.HomePageSpacesQuery,
  SchemaTypes.HomePageSpacesQueryVariables
>;
export function refetchHomePageSpacesQuery(variables: SchemaTypes.HomePageSpacesQueryVariables) {
  return { query: HomePageSpacesDocument, variables: variables };
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
        id
        nameID
        subdomain
        profile {
          ...InnovationHubProfile
        }
        spaceListFilter {
          id
          nameID
          visibility
          profile {
            id
            displayName
          }
          host {
            id
            nameID
            profile {
              id
              displayName
            }
          }
        }
        spaceVisibilityFilter
        type
      }
    }
  }
  ${InnovationHubProfileFragmentDoc}
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
      id
      nameID
    }
  }
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
      id
      nameID
    }
  }
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
export const InnovationLibraryDocument = gql`
  query InnovationLibrary {
    platform {
      id
      library {
        id
        innovationPacks {
          ...InnovationPackCard
        }
      }
    }
  }
  ${InnovationPackCardFragmentDoc}
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

export const ChallengeExplorerPageDocument = gql`
  query ChallengeExplorerPage($userID: UUID_NAMEID_EMAIL!) {
    rolesUser(rolesData: { userID: $userID, filter: { visibilities: [ACTIVE, DEMO] } }) {
      spaces {
        id
        roles
        challenges {
          id
          roles
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
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useChallengeExplorerPageQuery(
  baseOptions: Apollo.QueryHookOptions<
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
export function refetchChallengeExplorerPageQuery(variables: SchemaTypes.ChallengeExplorerPageQueryVariables) {
  return { query: ChallengeExplorerPageDocument, variables: variables };
}

export const ChallengeExplorerSearchDocument = gql`
  query ChallengeExplorerSearch($searchData: SearchInput!) {
    search(searchData: $searchData) {
      journeyResults {
        id
        type
        terms
        ... on SearchResultChallenge {
          ...SearchResultChallenge
        }
      }
    }
  }
  ${SearchResultChallengeFragmentDoc}
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

export const ChallengeExplorerDataDocument = gql`
  query ChallengeExplorerData($spaceIDs: [UUID!], $challengeIDs: [UUID!]) {
    spaces(IDs: $spaceIDs) {
      id
      nameID
      profile {
        id
        tagline
        displayName
      }
      visibility
      challenges(IDs: $challengeIDs) {
        id
        nameID
        profile {
          id
          tagline
          displayName
          description
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
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
  ${TagsetDetailsFragmentDoc}
`;

/**
 * __useChallengeExplorerDataQuery__
 *
 * To run a query within a React component, call `useChallengeExplorerDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeExplorerDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeExplorerDataQuery({
 *   variables: {
 *      spaceIDs: // value for 'spaceIDs'
 *      challengeIDs: // value for 'challengeIDs'
 *   },
 * });
 */
export function useChallengeExplorerDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeExplorerDataQuery,
    SchemaTypes.ChallengeExplorerDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.ChallengeExplorerDataQuery, SchemaTypes.ChallengeExplorerDataQueryVariables>(
    ChallengeExplorerDataDocument,
    options
  );
}

export function useChallengeExplorerDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeExplorerDataQuery,
    SchemaTypes.ChallengeExplorerDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.ChallengeExplorerDataQuery, SchemaTypes.ChallengeExplorerDataQueryVariables>(
    ChallengeExplorerDataDocument,
    options
  );
}

export type ChallengeExplorerDataQueryHookResult = ReturnType<typeof useChallengeExplorerDataQuery>;
export type ChallengeExplorerDataLazyQueryHookResult = ReturnType<typeof useChallengeExplorerDataLazyQuery>;
export type ChallengeExplorerDataQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeExplorerDataQuery,
  SchemaTypes.ChallengeExplorerDataQueryVariables
>;
export function refetchChallengeExplorerDataQuery(variables?: SchemaTypes.ChallengeExplorerDataQueryVariables) {
  return { query: ChallengeExplorerDataDocument, variables: variables };
}

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

export const ChallengeApplicationsDocument = gql`
  query challengeApplications($spaceId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      challenge(ID: $challengeId) {
        id
        community {
          id
          applications {
            ...AdminSpaceCommunityApplication
          }
        }
      }
    }
  }
  ${AdminSpaceCommunityApplicationFragmentDoc}
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
 *      spaceId: // value for 'spaceId'
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

export const SpaceAvailableLeadUsersDocument = gql`
  query SpaceAvailableLeadUsers($spaceId: UUID_NAMEID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    space(ID: $spaceId) {
      community {
        ...CommunityAvailableLeadUsers
      }
    }
  }
  ${CommunityAvailableLeadUsersFragmentDoc}
`;

/**
 * __useSpaceAvailableLeadUsersQuery__
 *
 * To run a query within a React component, call `useSpaceAvailableLeadUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAvailableLeadUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAvailableLeadUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useSpaceAvailableLeadUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceAvailableLeadUsersQuery,
    SchemaTypes.SpaceAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceAvailableLeadUsersQuery, SchemaTypes.SpaceAvailableLeadUsersQueryVariables>(
    SpaceAvailableLeadUsersDocument,
    options
  );
}

export function useSpaceAvailableLeadUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceAvailableLeadUsersQuery,
    SchemaTypes.SpaceAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceAvailableLeadUsersQuery,
    SchemaTypes.SpaceAvailableLeadUsersQueryVariables
  >(SpaceAvailableLeadUsersDocument, options);
}

export type SpaceAvailableLeadUsersQueryHookResult = ReturnType<typeof useSpaceAvailableLeadUsersQuery>;
export type SpaceAvailableLeadUsersLazyQueryHookResult = ReturnType<typeof useSpaceAvailableLeadUsersLazyQuery>;
export type SpaceAvailableLeadUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAvailableLeadUsersQuery,
  SchemaTypes.SpaceAvailableLeadUsersQueryVariables
>;
export function refetchSpaceAvailableLeadUsersQuery(variables: SchemaTypes.SpaceAvailableLeadUsersQueryVariables) {
  return { query: SpaceAvailableLeadUsersDocument, variables: variables };
}

export const SpaceAvailableMemberUsersDocument = gql`
  query SpaceAvailableMemberUsers($spaceId: UUID_NAMEID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    space(ID: $spaceId) {
      community {
        ...CommunityAvailableMemberUsers
      }
    }
  }
  ${CommunityAvailableMemberUsersFragmentDoc}
`;

/**
 * __useSpaceAvailableMemberUsersQuery__
 *
 * To run a query within a React component, call `useSpaceAvailableMemberUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceAvailableMemberUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceAvailableMemberUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useSpaceAvailableMemberUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceAvailableMemberUsersQuery,
    SchemaTypes.SpaceAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceAvailableMemberUsersQuery,
    SchemaTypes.SpaceAvailableMemberUsersQueryVariables
  >(SpaceAvailableMemberUsersDocument, options);
}

export function useSpaceAvailableMemberUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceAvailableMemberUsersQuery,
    SchemaTypes.SpaceAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceAvailableMemberUsersQuery,
    SchemaTypes.SpaceAvailableMemberUsersQueryVariables
  >(SpaceAvailableMemberUsersDocument, options);
}

export type SpaceAvailableMemberUsersQueryHookResult = ReturnType<typeof useSpaceAvailableMemberUsersQuery>;
export type SpaceAvailableMemberUsersLazyQueryHookResult = ReturnType<typeof useSpaceAvailableMemberUsersLazyQuery>;
export type SpaceAvailableMemberUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceAvailableMemberUsersQuery,
  SchemaTypes.SpaceAvailableMemberUsersQueryVariables
>;
export function refetchSpaceAvailableMemberUsersQuery(variables: SchemaTypes.SpaceAvailableMemberUsersQueryVariables) {
  return { query: SpaceAvailableMemberUsersDocument, variables: variables };
}

export const ChallengeAvailableLeadUsersDocument = gql`
  query ChallengeAvailableLeadUsers(
    $spaceId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    space(ID: $spaceId) {
      challenge(ID: $challengeId) {
        community {
          ...CommunityAvailableLeadUsers
        }
      }
    }
  }
  ${CommunityAvailableLeadUsersFragmentDoc}
`;

/**
 * __useChallengeAvailableLeadUsersQuery__
 *
 * To run a query within a React component, call `useChallengeAvailableLeadUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeAvailableLeadUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeAvailableLeadUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useChallengeAvailableLeadUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeAvailableLeadUsersQuery,
    SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeAvailableLeadUsersQuery,
    SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
  >(ChallengeAvailableLeadUsersDocument, options);
}

export function useChallengeAvailableLeadUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeAvailableLeadUsersQuery,
    SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeAvailableLeadUsersQuery,
    SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
  >(ChallengeAvailableLeadUsersDocument, options);
}

export type ChallengeAvailableLeadUsersQueryHookResult = ReturnType<typeof useChallengeAvailableLeadUsersQuery>;
export type ChallengeAvailableLeadUsersLazyQueryHookResult = ReturnType<typeof useChallengeAvailableLeadUsersLazyQuery>;
export type ChallengeAvailableLeadUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeAvailableLeadUsersQuery,
  SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
>;
export function refetchChallengeAvailableLeadUsersQuery(
  variables: SchemaTypes.ChallengeAvailableLeadUsersQueryVariables
) {
  return { query: ChallengeAvailableLeadUsersDocument, variables: variables };
}

export const ChallengeAvailableMemberUsersDocument = gql`
  query ChallengeAvailableMemberUsers(
    $spaceId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    space(ID: $spaceId) {
      challenge(ID: $challengeId) {
        community {
          ...CommunityAvailableMemberUsers
        }
      }
    }
  }
  ${CommunityAvailableMemberUsersFragmentDoc}
`;

/**
 * __useChallengeAvailableMemberUsersQuery__
 *
 * To run a query within a React component, call `useChallengeAvailableMemberUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeAvailableMemberUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeAvailableMemberUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      challengeId: // value for 'challengeId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useChallengeAvailableMemberUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeAvailableMemberUsersQuery,
    SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeAvailableMemberUsersQuery,
    SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
  >(ChallengeAvailableMemberUsersDocument, options);
}

export function useChallengeAvailableMemberUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeAvailableMemberUsersQuery,
    SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeAvailableMemberUsersQuery,
    SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
  >(ChallengeAvailableMemberUsersDocument, options);
}

export type ChallengeAvailableMemberUsersQueryHookResult = ReturnType<typeof useChallengeAvailableMemberUsersQuery>;
export type ChallengeAvailableMemberUsersLazyQueryHookResult = ReturnType<
  typeof useChallengeAvailableMemberUsersLazyQuery
>;
export type ChallengeAvailableMemberUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeAvailableMemberUsersQuery,
  SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
>;
export function refetchChallengeAvailableMemberUsersQuery(
  variables: SchemaTypes.ChallengeAvailableMemberUsersQueryVariables
) {
  return { query: ChallengeAvailableMemberUsersDocument, variables: variables };
}

export const OpportunityAvailableLeadUsersDocument = gql`
  query OpportunityAvailableLeadUsers(
    $spaceId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    space(ID: $spaceId) {
      opportunity(ID: $opportunityId) {
        community {
          ...CommunityAvailableLeadUsers
        }
      }
    }
  }
  ${CommunityAvailableLeadUsersFragmentDoc}
`;

/**
 * __useOpportunityAvailableLeadUsersQuery__
 *
 * To run a query within a React component, call `useOpportunityAvailableLeadUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAvailableLeadUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAvailableLeadUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useOpportunityAvailableLeadUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAvailableLeadUsersQuery,
    SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityAvailableLeadUsersQuery,
    SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
  >(OpportunityAvailableLeadUsersDocument, options);
}

export function useOpportunityAvailableLeadUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAvailableLeadUsersQuery,
    SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityAvailableLeadUsersQuery,
    SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
  >(OpportunityAvailableLeadUsersDocument, options);
}

export type OpportunityAvailableLeadUsersQueryHookResult = ReturnType<typeof useOpportunityAvailableLeadUsersQuery>;
export type OpportunityAvailableLeadUsersLazyQueryHookResult = ReturnType<
  typeof useOpportunityAvailableLeadUsersLazyQuery
>;
export type OpportunityAvailableLeadUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAvailableLeadUsersQuery,
  SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
>;
export function refetchOpportunityAvailableLeadUsersQuery(
  variables: SchemaTypes.OpportunityAvailableLeadUsersQueryVariables
) {
  return { query: OpportunityAvailableLeadUsersDocument, variables: variables };
}

export const OpportunityAvailableMemberUsersDocument = gql`
  query OpportunityAvailableMemberUsers(
    $spaceId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    space(ID: $spaceId) {
      opportunity(ID: $opportunityId) {
        community {
          ...CommunityAvailableMemberUsers
        }
      }
    }
  }
  ${CommunityAvailableMemberUsersFragmentDoc}
`;

/**
 * __useOpportunityAvailableMemberUsersQuery__
 *
 * To run a query within a React component, call `useOpportunityAvailableMemberUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAvailableMemberUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAvailableMemberUsersQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      opportunityId: // value for 'opportunityId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useOpportunityAvailableMemberUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityAvailableMemberUsersQuery,
    SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityAvailableMemberUsersQuery,
    SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
  >(OpportunityAvailableMemberUsersDocument, options);
}

export function useOpportunityAvailableMemberUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityAvailableMemberUsersQuery,
    SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityAvailableMemberUsersQuery,
    SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
  >(OpportunityAvailableMemberUsersDocument, options);
}

export type OpportunityAvailableMemberUsersQueryHookResult = ReturnType<typeof useOpportunityAvailableMemberUsersQuery>;
export type OpportunityAvailableMemberUsersLazyQueryHookResult = ReturnType<
  typeof useOpportunityAvailableMemberUsersLazyQuery
>;
export type OpportunityAvailableMemberUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityAvailableMemberUsersQuery,
  SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
>;
export function refetchOpportunityAvailableMemberUsersQuery(
  variables: SchemaTypes.OpportunityAvailableMemberUsersQueryVariables
) {
  return { query: OpportunityAvailableMemberUsersDocument, variables: variables };
}

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
  mutation UpdateSpacePlatformSettings($spaceId: String!, $visibility: SpaceVisibility!) {
    updateSpacePlatformSettings(updateData: { spaceID: $spaceId, visibility: $visibility }) {
      id
      visibility
      nameID
      host {
        id
      }
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
      visibility
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

export const SpaceStorageAdminDocument = gql`
  query SpaceStorageAdmin($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      nameID
      profile {
        id
        displayName
      }
      storageBucket {
        id
        size
        documents {
          ...DocumentData
        }
      }
      challenges {
        id
        nameID
        profile {
          id
          displayName
        }
        storageBucket {
          id
          documents {
            ...DocumentData
          }
        }
      }
    }
  }
  ${DocumentDataFragmentDoc}
`;

/**
 * __useSpaceStorageAdminQuery__
 *
 * To run a query within a React component, call `useSpaceStorageAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceStorageAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceStorageAdminQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *   },
 * });
 */
export function useSpaceStorageAdminQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.SpaceStorageAdminQuery, SchemaTypes.SpaceStorageAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.SpaceStorageAdminQuery, SchemaTypes.SpaceStorageAdminQueryVariables>(
    SpaceStorageAdminDocument,
    options
  );
}

export function useSpaceStorageAdminLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceStorageAdminQuery,
    SchemaTypes.SpaceStorageAdminQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.SpaceStorageAdminQuery, SchemaTypes.SpaceStorageAdminQueryVariables>(
    SpaceStorageAdminDocument,
    options
  );
}

export type SpaceStorageAdminQueryHookResult = ReturnType<typeof useSpaceStorageAdminQuery>;
export type SpaceStorageAdminLazyQueryHookResult = ReturnType<typeof useSpaceStorageAdminLazyQuery>;
export type SpaceStorageAdminQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceStorageAdminQuery,
  SchemaTypes.SpaceStorageAdminQueryVariables
>;
export function refetchSpaceStorageAdminQuery(variables: SchemaTypes.SpaceStorageAdminQueryVariables) {
  return { query: SpaceStorageAdminDocument, variables: variables };
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
      templates {
        id
        authorization {
          id
          myPrivileges
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

export const SpaceTemplatesAdminWhiteboardTemplateWithValueDocument = gql`
  query SpaceTemplatesAdminWhiteboardTemplateWithValue($spaceId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    space(ID: $spaceId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $whiteboardTemplateId) {
          ...AdminWhiteboardTemplateValue
        }
      }
    }
  }
  ${AdminWhiteboardTemplateValueFragmentDoc}
`;

/**
 * __useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      spaceId: // value for 'spaceId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >(SpaceTemplatesAdminWhiteboardTemplateWithValueDocument, options);
}

export function useSpaceTemplatesAdminWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >(SpaceTemplatesAdminWhiteboardTemplateWithValueDocument, options);
}

export type SpaceTemplatesAdminWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useSpaceTemplatesAdminWhiteboardTemplateWithValueQuery
>;
export type SpaceTemplatesAdminWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useSpaceTemplatesAdminWhiteboardTemplateWithValueLazyQuery
>;
export type SpaceTemplatesAdminWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQuery,
  SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
>;
export function refetchSpaceTemplatesAdminWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables
) {
  return { query: SpaceTemplatesAdminWhiteboardTemplateWithValueDocument, variables: variables };
}

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

export const InnovationPackWhiteboardTemplateWithValueDocument = gql`
  query InnovationPackWhiteboardTemplateWithValue($innovationPackId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          id
          templates {
            whiteboardTemplate(ID: $whiteboardTemplateId) {
              ...AdminWhiteboardTemplateValue
            }
          }
        }
      }
    }
  }
  ${AdminWhiteboardTemplateValueFragmentDoc}
`;

/**
 * __useInnovationPackWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useInnovationPackWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationPackWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationPackWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useInnovationPackWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
  >(InnovationPackWhiteboardTemplateWithValueDocument, options);
}

export function useInnovationPackWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
  >(InnovationPackWhiteboardTemplateWithValueDocument, options);
}

export type InnovationPackWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useInnovationPackWhiteboardTemplateWithValueQuery
>;
export type InnovationPackWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useInnovationPackWhiteboardTemplateWithValueLazyQuery
>;
export type InnovationPackWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPackWhiteboardTemplateWithValueQuery,
  SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
>;
export function refetchInnovationPackWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.InnovationPackWhiteboardTemplateWithValueQueryVariables
) {
  return { query: InnovationPackWhiteboardTemplateWithValueDocument, variables: variables };
}

export const InnovationPackFullWhiteboardTemplateWithValueDocument = gql`
  query InnovationPackFullWhiteboardTemplateWithValue($innovationPackId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          id
          templates {
            whiteboardTemplate(ID: $whiteboardTemplateId) {
              ...WhiteboardTemplateWithValue
            }
          }
        }
      }
    }
  }
  ${WhiteboardTemplateWithValueFragmentDoc}
`;

/**
 * __useInnovationPackFullWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useInnovationPackFullWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationPackFullWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationPackFullWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useInnovationPackFullWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
  >(InnovationPackFullWhiteboardTemplateWithValueDocument, options);
}

export function useInnovationPackFullWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQuery,
    SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
  >(InnovationPackFullWhiteboardTemplateWithValueDocument, options);
}

export type InnovationPackFullWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useInnovationPackFullWhiteboardTemplateWithValueQuery
>;
export type InnovationPackFullWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useInnovationPackFullWhiteboardTemplateWithValueLazyQuery
>;
export type InnovationPackFullWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQuery,
  SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
>;
export function refetchInnovationPackFullWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.InnovationPackFullWhiteboardTemplateWithValueQueryVariables
) {
  return { query: InnovationPackFullWhiteboardTemplateWithValueDocument, variables: variables };
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
    $definition: LifecycleDefinition!
  ) {
    updateInnovationFlowTemplate(
      innovationFlowTemplateInput: { ID: $templateId, profile: $profile, definition: $definition }
    ) {
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
 *      definition: // value for 'definition'
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
    $definition: LifecycleDefinition!
    $type: InnovationFlowType!
    $tags: [String!]
  ) {
    createInnovationFlowTemplate(
      innovationFlowTemplateInput: {
        templatesSetID: $templatesSetId
        profile: $profile
        type: $type
        definition: $definition
        tags: $tags
      }
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
 *      definition: // value for 'definition'
 *      type: // value for 'type'
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
  mutation updateWhiteboardTemplate($templateId: UUID!, $value: JSON, $profile: UpdateProfileInput!) {
    updateWhiteboardTemplate(whiteboardTemplateInput: { ID: $templateId, value: $value, profile: $profile }) {
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
 *      value: // value for 'value'
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
    $value: JSON!
    $profile: CreateProfileInput!
    $tags: [String!]
  ) {
    createWhiteboardTemplate(
      whiteboardTemplateInput: { templatesSetID: $templatesSetId, value: $value, profile: $profile, tags: $tags }
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
 *      value: // value for 'value'
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

export const ServerMetadataDocument = gql`
  query serverMetadata {
    metadata {
      metrics {
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

export const JourneyStorageConfigDocument = gql`
  query JourneyStorageConfig(
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        profile {
          ...ProfileStorageConfig
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        profile {
          ...ProfileStorageConfig
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
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
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
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
  query CalloutStorageConfig(
    $calloutId: UUID_NAMEID!
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        collaboration {
          ...CalloutOnCollaborationWithStorageConfig
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        collaboration {
          ...CalloutOnCollaborationWithStorageConfig
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        collaboration {
          ...CalloutOnCollaborationWithStorageConfig
        }
      }
    }
  }
  ${CalloutOnCollaborationWithStorageConfigFragmentDoc}
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
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
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
  query CalloutPostStorageConfig(
    $postId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $spaceNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeSpace: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    space(ID: $spaceNameId) {
      id
      ... on Space @include(if: $includeSpace) {
        collaboration {
          ...PostInCalloutOnCollaborationWithStorageConfig
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        collaboration {
          ...PostInCalloutOnCollaborationWithStorageConfig
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        collaboration {
          ...PostInCalloutOnCollaborationWithStorageConfig
        }
      }
    }
  }
  ${PostInCalloutOnCollaborationWithStorageConfigFragmentDoc}
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
 *      spaceNameId: // value for 'spaceNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeSpace: // value for 'includeSpace'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
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

export const PlatformStorageConfigDocument = gql`
  query PlatformStorageConfig {
    platform {
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
export const CreateRelationDocument = gql`
  mutation createRelation($input: CreateRelationOnCollaborationInput!) {
    createRelationOnCollaboration(relationData: $input) {
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
export const SpaceDashboardCalendarEventsDocument = gql`
  query spaceDashboardCalendarEvents($spaceId: UUID_NAMEID!, $limit: Float) {
    space(ID: $spaceId) {
      id
      timeline {
        id
        calendar {
          id
          events(limit: $limit) {
            ...CalendarEventInfo
          }
        }
      }
    }
  }
  ${CalendarEventInfoFragmentDoc}
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

export const SpaceCalendarEventsDocument = gql`
  query spaceCalendarEvents($spaceId: UUID_NAMEID!) {
    space(ID: $spaceId) {
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
            ...CalendarEventDetails
          }
        }
      }
    }
  }
  ${CalendarEventDetailsFragmentDoc}
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
  query calendarEventDetails($spaceId: UUID_NAMEID!, $eventId: UUID_NAMEID!) {
    space(ID: $spaceId) {
      id
      timeline {
        id
        calendar {
          id
          event(ID: $eventId) {
            ...CalendarEventDetails
          }
        }
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
 *      spaceId: // value for 'spaceId'
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
