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
export const AspectCardFragmentDoc = gql`
  fragment AspectCard on Aspect {
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
      commentsCount
    }
    profile {
      id
      displayName
      description
      visuals {
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
        description
      }
    }
  }
  ${VisualFullFragmentDoc}
`;
export const CanvasProfileFragmentDoc = gql`
  fragment CanvasProfile on Profile {
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
      id
      tags
    }
  }
  ${VisualFullFragmentDoc}
`;
export const CheckoutDetailsFragmentDoc = gql`
  fragment CheckoutDetails on CanvasCheckout {
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
    id
    nameID
    createdDate
    profile {
      ...CanvasProfile
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
  ${CanvasProfileFragmentDoc}
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
    aspects(limit: 2, shuffle: true) {
      ...AspectCard
    }
    canvases(limit: 2, shuffle: true) {
      ...CanvasDetails
    }
    activity
  }
  ${AspectCardFragmentDoc}
  ${CanvasDetailsFragmentDoc}
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
        id
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
        id
        tags
      }
    }
  }
`;
export const AssociatedOrganizationDetailsFragmentDoc = gql`
  fragment AssociatedOrganizationDetails on Organization {
    id
    nameID
    profile {
      id
      displayName
      description
      visual(type: AVATAR) {
        ...VisualUri
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
    leadUsers {
      ...DashboardLeadUser
    }
    memberUsers(limit: 8) {
      ...DashboardContributingUser
    }
    leadOrganizations {
      ...AssociatedOrganizationDetails
    }
    memberOrganizations {
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
        id
        name
        tags
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
        id
        name
        tags
      }
    }
    authorization {
      id
      myPrivileges
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
        id
        name
        tags
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
export const ProfileJourneyDataFragmentDoc = gql`
  fragment ProfileJourneyData on Profile {
    id
    displayName
    tagline
    description
  }
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
    leadUsers {
      ...DashboardLeadUser
    }
    leadOrganizations {
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
export const CommunityPageCommunityFragmentDoc = gql`
  fragment CommunityPageCommunity on Community {
    id
    leadUsers {
      ...DashboardLeadUser
    }
    memberUsers {
      ...DashboardContributingUser
    }
    leadOrganizations {
      ...AssociatedOrganizationDetails
    }
    memberOrganizations {
      ...DashboardContributingOrganization
    }
  }
  ${DashboardLeadUserFragmentDoc}
  ${DashboardContributingUserFragmentDoc}
  ${AssociatedOrganizationDetailsFragmentDoc}
  ${DashboardContributingOrganizationFragmentDoc}
`;
export const HubDetailsFragmentDoc = gql`
  fragment HubDetails on Hub {
    id
    nameID
    profile {
      id
      displayName
      description
      tagline
      tagset {
        id
        name
        tags
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
    authorization {
      id
      anonymousReadAccess
    }
    context {
      ...ContextDetails
    }
  }
  ${VisualFullFragmentDoc}
  ${FullLocationFragmentDoc}
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
  ${HubDetailsFragmentDoc}
`;
export const HubWelcomeBlockContributorProfileFragmentDoc = gql`
  fragment HubWelcomeBlockContributorProfile on Profile {
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
        id
        name
        tags
      }
    }
    context {
      id
      vision
    }
    lifecycle {
      id
      state
    }
  }
  ${VisualUriFragmentDoc}
`;
export const HubPageFragmentDoc = gql`
  fragment HubPage on Hub {
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
        ...HubWelcomeBlockContributorProfile
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
        id
        name
        tags
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
      leadUsers {
        profile {
          ...HubWelcomeBlockContributorProfile
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
  ${HubWelcomeBlockContributorProfileFragmentDoc}
  ${VisualUriFragmentDoc}
  ${DashboardTopCalloutsFragmentDoc}
  ${EntityDashboardCommunityFragmentDoc}
  ${ChallengeCardFragmentDoc}
`;
export const HubDashboardNavigationProfileFragmentDoc = gql`
  fragment HubDashboardNavigationProfile on Profile {
    id
    displayName
    tagline
    tagset {
      id
      tags
    }
    visual(type: CARD) {
      id
      uri
      alternativeText
    }
  }
`;
export const HubDashboardNavigationContextFragmentDoc = gql`
  fragment HubDashboardNavigationContext on Context {
    id
    vision
  }
`;
export const HubDashboardNavigationLifecycleFragmentDoc = gql`
  fragment HubDashboardNavigationLifecycle on Lifecycle {
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
      id
      tags
    }
    visual(type: CARD) {
      id
      uri
    }
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
export const HubTemplatesFragmentDoc = gql`
  fragment HubTemplates on Hub {
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
export const ChallengesOnHubFragmentDoc = gql`
  fragment ChallengesOnHub on Hub {
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
export const HubDetailsProviderFragmentDoc = gql`
  fragment HubDetailsProvider on Hub {
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
        id
        name
        tags
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
  ${ContextDetailsProviderFragmentDoc}
`;
export const HubNameFragmentDoc = gql`
  fragment HubName on Hub {
    id
    nameID
    profile {
      id
      displayName
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
      nameID
      email
      profile {
        id
        displayName
        visual(type: AVATAR) {
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
export const OpportunityPageFragmentDoc = gql`
  fragment OpportunityPage on Opportunity {
    id
    nameID
    profile {
      id
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
    lifecycle {
      id
      machineDef
      state
      nextEvents
      stateIsFinal
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
        id
        name
        tags
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
          id
          tags
        }
        location {
          id
          city
          country
        }
      }
    }
  }
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
  fragment ActivityLogCalloutCardCreated on ActivityLogEntryCalloutCardCreated {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    card {
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
  fragment ActivityLogCalloutCardComment on ActivityLogEntryCalloutCardComment {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    card {
      id
      nameID
      profile {
        id
        displayName
      }
    }
  }
`;
export const ActivityLogCalloutCanvasCreatedFragmentDoc = gql`
  fragment ActivityLogCalloutCanvasCreated on ActivityLogEntryCalloutCanvasCreated {
    callout {
      id
      nameID
      profile {
        id
        displayName
      }
    }
    canvas {
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
export const ActivityLogOnCollaborationFragmentDoc = gql`
  fragment ActivityLogOnCollaboration on ActivityLogEntry {
    id
    collaborationID
    createdDate
    description
    type
    child
    parentNameID
    parentDisplayName
    __typename
    triggeredBy {
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
          id
          tags
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
    ... on ActivityLogEntryCalloutCardCreated {
      ...ActivityLogCalloutCardCreated
    }
    ... on ActivityLogEntryCalloutCardComment {
      ...ActivityLogCalloutCardComment
    }
    ... on ActivityLogEntryCalloutCanvasCreated {
      ...ActivityLogCalloutCanvasCreated
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
  }
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutCardCreatedFragmentDoc}
  ${ActivityLogCalloutCardCommentFragmentDoc}
  ${ActivityLogCalloutCanvasCreatedFragmentDoc}
  ${ActivityLogCalloutDiscussionCommentFragmentDoc}
  ${ActivityLogChallengeCreatedFragmentDoc}
  ${ActivityLogOpportunityCreatedFragmentDoc}
`;
export const ActivityLogUpdateSentFragmentDoc = gql`
  fragment ActivityLogUpdateSent on ActivityLogEntryUpdateSent {
    updates {
      id
    }
    message
  }
`;
export const MessageDetailsFragmentDoc = gql`
  fragment MessageDetails on Message {
    id
    message
    timestamp
    sender {
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
          id
          name
          tags
        }
        location {
          id
          city
          country
        }
      }
    }
  }
`;
export const AspectDashboardFragmentDoc = gql`
  fragment AspectDashboard on Aspect {
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
          tags
        }
      }
    }
    createdDate
    profile {
      id
      displayName
      description
      tagset {
        id
        name
        tags
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
  ${VisualUriFragmentDoc}
  ${MessageDetailsFragmentDoc}
`;
export const AspectDashboardDataFragmentDoc = gql`
  fragment AspectDashboardData on Collaboration {
    id
    authorization {
      id
      myPrivileges
    }
    callouts(IDs: [$calloutNameId]) {
      id
      type
      aspects(IDs: [$aspectNameId]) {
        ...AspectDashboard
      }
    }
  }
  ${AspectDashboardFragmentDoc}
`;
export const AspectSettingsFragmentDoc = gql`
  fragment AspectSettings on Aspect {
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
        id
        name
        tags
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
  ${VisualFullFragmentDoc}
`;
export const AspectSettingsCalloutFragmentDoc = gql`
  fragment AspectSettingsCallout on Callout {
    id
    type
    aspects(IDs: [$aspectNameId]) {
      ...AspectSettings
    }
    aspectNames: aspects {
      id
      profile {
        id
        displayName
      }
    }
  }
  ${AspectSettingsFragmentDoc}
`;
export const AspectProvidedFragmentDoc = gql`
  fragment AspectProvided on Aspect {
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
  }
`;
export const AspectProviderDataFragmentDoc = gql`
  fragment AspectProviderData on Collaboration {
    id
    callouts(IDs: [$calloutNameId]) {
      id
      type
      aspects(IDs: [$aspectNameId]) {
        ...AspectProvided
      }
    }
  }
  ${AspectProvidedFragmentDoc}
`;
export const CalloutAspectInfoFragmentDoc = gql`
  fragment CalloutAspectInfo on Collaboration {
    id
    callouts {
      id
      nameID
      type
      aspects {
        id
        nameID
      }
    }
  }
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
export const ReferenceDetailsFragmentDoc = gql`
  fragment ReferenceDetails on Reference {
    id
    name
    uri
    description
  }
`;
export const CommentsWithMessagesFragmentDoc = gql`
  fragment CommentsWithMessages on Comments {
    id
    commentsCount
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
          id
          tags
        }
        visual(type: CARD) {
          id
          uri
        }
      }
    }
  }
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
          id
          tags
        }
        visual(type: CARD) {
          id
          uri
        }
      }
    }
  }
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
        id
        tags
      }
      references {
        ...ReferenceDetails
      }
    }
    state
    sortOrder
    activity
    canvases {
      ...CanvasDetails
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
  ${ReferenceDetailsFragmentDoc}
  ${CanvasDetailsFragmentDoc}
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
export const CanvasSummaryFragmentDoc = gql`
  fragment CanvasSummary on Canvas {
    id
    nameID
    createdDate
    profile {
      id
      displayName
    }
  }
`;
export const CanvasValueFragmentDoc = gql`
  fragment CanvasValue on Canvas {
    id
    value
  }
`;
export const CreateCanvasWhiteboardTemplateFragmentDoc = gql`
  fragment CreateCanvasWhiteboardTemplate on WhiteboardTemplate {
    id
    profile {
      id
      displayName
      description
    }
    value
  }
`;
export const CalloutWithCanvasFragmentDoc = gql`
  fragment CalloutWithCanvas on Collaboration {
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
      canvases(IDs: [$canvasId]) {
        ...CanvasDetails
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
`;
export const CollaborationWithCanvasDetailsFragmentDoc = gql`
  fragment CollaborationWithCanvasDetails on Collaboration {
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
      canvases {
        ...CanvasDetails
      }
    }
  }
  ${CanvasDetailsFragmentDoc}
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
export const ContributeTabAspectFragmentDoc = gql`
  fragment ContributeTabAspect on Aspect {
    ...AspectCard
    authorization {
      id
      myPrivileges
    }
  }
  ${AspectCardFragmentDoc}
`;
export const AspectsOnCalloutFragmentDoc = gql`
  fragment AspectsOnCallout on Callout {
    id
    aspects {
      ...ContributeTabAspect
    }
  }
  ${ContributeTabAspectFragmentDoc}
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
    commentsCount
    authorization {
      myPrivileges
    }
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
        id
        name
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
    leadUsers {
      ...UserCard
    }
    memberUsers {
      ...UserCard
    }
    leadOrganizations {
      ...OrganizationCard
    }
    memberOrganizations {
      ...OrganizationCard
    }
  }
  ${UserCardFragmentDoc}
  ${OrganizationCardFragmentDoc}
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
        id
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
      visual(type: AVATAR) {
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
        id
        name
        tags
      }
    }
  }
  ${VisualUriFragmentDoc}
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
        id
        name
        tags
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
          id
          tags
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
  ${FullLocationFragmentDoc}
`;
export const OrganizationDetailsFragmentDoc = gql`
  fragment OrganizationDetails on Organization {
    id
    nameID
    profile {
      id
      displayName
      visual(type: AVATAR) {
        ...VisualUri
      }
      description
      tagsets {
        id
        tags
      }
      location {
        country
        city
      }
    }
  }
  ${VisualUriFragmentDoc}
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
        id
        name
        tags
      }
    }
  }
  ${VisualFullFragmentDoc}
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
        id
        name
        tags
      }
    }
  }
  ${VisualFullFragmentDoc}
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
    profile {
      id
      displayName
    }
  }
`;
export const UserRolesDetailsFragmentDoc = gql`
  fragment UserRolesDetails on ContributorRoles {
    hubs {
      id
      nameID
      hubID
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
      hubID
      challengeID
      opportunityID
    }
  }
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
          id
          tags
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
          id
          tags
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
          id
          tags
        }
      }
      definition
      type
    }
  }
  ${VisualUriFragmentDoc}
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
        id
        tags
      }
    }
    templates {
      ...LibraryTemplates
    }
    provider {
      ...InnovationPackProviderProfileWithAvatar
    }
  }
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
export const AdminHubFragmentDoc = gql`
  fragment AdminHub on Hub {
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
      id
      name
      tags
    }
    references {
      id
      name
      description
      uri
    }
  }
`;
export const ProfileInfoWithVisualFragmentDoc = gql`
  fragment ProfileInfoWithVisual on Profile {
    id
    displayName
    description
    tagset {
      id
      tags
    }
    visual(type: CARD) {
      ...VisualFull
    }
  }
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
export const SearchResultCardProfileFragmentDoc = gql`
  fragment SearchResultCardProfile on Profile {
    id
    description
    tagset {
      id
      tags
    }
  }
`;
export const CardParentFragmentDoc = gql`
  fragment CardParent on SearchResultCard {
    hub {
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
export const SearchResultCardFragmentDoc = gql`
  fragment SearchResultCard on SearchResultCard {
    card {
      id
      nameID
      profile {
        displayName
        visual(type: CARD) {
          ...VisualUri
        }
        ...SearchResultCardProfile
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
        commentsCount
      }
    }
    ...CardParent
  }
  ${VisualUriFragmentDoc}
  ${SearchResultCardProfileFragmentDoc}
  ${CardParentFragmentDoc}
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
      id
      tags
    }
    visual(type: AVATAR) {
      ...VisualUri
    }
  }
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
export const SearchResultHubFragmentDoc = gql`
  fragment SearchResultHub on SearchResultHub {
    hub {
      id
      nameID
      profile {
        id
        displayName
        tagset {
          id
          name
          tags
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
          id
          name
          tags
        }
        tagline
        visuals {
          ...VisualUri
        }
      }
      hubID
      context {
        id
        vision
      }
      authorization {
        id
        anonymousReadAccess
      }
    }
    hub {
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
          id
          name
          tags
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
    hub {
      id
      nameID
      profile {
        id
        displayName
      }
      visibility
    }
  }
  ${VisualUriFragmentDoc}
`;
export const ProfileStorageConfigFragmentDoc = gql`
  fragment ProfileStorageConfig on Profile {
    id
    storageBucket {
      id
      allowedMimeTypes
      maxFileSize
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
export const AspectInCalloutOnCollaborationWithStorageConfigFragmentDoc = gql`
  fragment AspectInCalloutOnCollaborationWithStorageConfig on Collaboration {
    id
    callouts(IDs: [$calloutId]) {
      id
      aspects(IDs: [$aspectId]) {
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
      id
      name
      tags
    }
    references {
      id
      name
      uri
      description
    }
  }
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
          id
          tags
        }
      }
    }
    createdDate
    comments {
      ...CommentsWithMessages
    }
  }
  ${CalendarEventInfoFragmentDoc}
  ${CommentsWithMessagesFragmentDoc}
`;
export const AssignUserAsChallengeAdminDocument = gql`
  mutation assignUserAsChallengeAdmin($input: AssignChallengeAdminInput!) {
    assignUserAsChallengeAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const AssignUserAsGlobalHubsAdminDocument = gql`
  mutation assignUserAsGlobalHubsAdmin($input: AssignGlobalHubsAdminInput!) {
    assignUserAsGlobalHubsAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type AssignUserAsGlobalHubsAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.AssignUserAsGlobalHubsAdminMutation,
  SchemaTypes.AssignUserAsGlobalHubsAdminMutationVariables
>;

/**
 * __useAssignUserAsGlobalHubsAdminMutation__
 *
 * To run a mutation, you first call `useAssignUserAsGlobalHubsAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignUserAsGlobalHubsAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignUserAsGlobalHubsAdminMutation, { data, loading, error }] = useAssignUserAsGlobalHubsAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignUserAsGlobalHubsAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.AssignUserAsGlobalHubsAdminMutation,
    SchemaTypes.AssignUserAsGlobalHubsAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.AssignUserAsGlobalHubsAdminMutation,
    SchemaTypes.AssignUserAsGlobalHubsAdminMutationVariables
  >(AssignUserAsGlobalHubsAdminDocument, options);
}

export type AssignUserAsGlobalHubsAdminMutationHookResult = ReturnType<typeof useAssignUserAsGlobalHubsAdminMutation>;
export type AssignUserAsGlobalHubsAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.AssignUserAsGlobalHubsAdminMutation>;
export type AssignUserAsGlobalHubsAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.AssignUserAsGlobalHubsAdminMutation,
  SchemaTypes.AssignUserAsGlobalHubsAdminMutationVariables
>;
export const AssignUserAsHubAdminDocument = gql`
  mutation assignUserAsHubAdmin($input: AssignHubAdminInput!) {
    assignUserAsHubAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const RemoveUserAsChallengeAdminDocument = gql`
  mutation removeUserAsChallengeAdmin($input: RemoveChallengeAdminInput!) {
    removeUserAsChallengeAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const RemoveUserAsGlobalHubsAdminDocument = gql`
  mutation removeUserAsGlobalHubsAdmin($input: RemoveGlobalHubsAdminInput!) {
    removeUserAsGlobalHubsAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
    }
  }
`;
export type RemoveUserAsGlobalHubsAdminMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveUserAsGlobalHubsAdminMutation,
  SchemaTypes.RemoveUserAsGlobalHubsAdminMutationVariables
>;

/**
 * __useRemoveUserAsGlobalHubsAdminMutation__
 *
 * To run a mutation, you first call `useRemoveUserAsGlobalHubsAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserAsGlobalHubsAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserAsGlobalHubsAdminMutation, { data, loading, error }] = useRemoveUserAsGlobalHubsAdminMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserAsGlobalHubsAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveUserAsGlobalHubsAdminMutation,
    SchemaTypes.RemoveUserAsGlobalHubsAdminMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.RemoveUserAsGlobalHubsAdminMutation,
    SchemaTypes.RemoveUserAsGlobalHubsAdminMutationVariables
  >(RemoveUserAsGlobalHubsAdminDocument, options);
}

export type RemoveUserAsGlobalHubsAdminMutationHookResult = ReturnType<typeof useRemoveUserAsGlobalHubsAdminMutation>;
export type RemoveUserAsGlobalHubsAdminMutationResult =
  Apollo.MutationResult<SchemaTypes.RemoveUserAsGlobalHubsAdminMutation>;
export type RemoveUserAsGlobalHubsAdminMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveUserAsGlobalHubsAdminMutation,
  SchemaTypes.RemoveUserAsGlobalHubsAdminMutationVariables
>;
export const RemoveUserAsHubAdminDocument = gql`
  mutation removeUserAsHubAdmin($input: RemoveHubAdminInput!) {
    removeUserAsHubAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
export const UploadFileDocument = gql`
  mutation UploadFile($file: Upload!, $uploadData: StorageBucketUploadFileInput!) {
    uploadFileOnReference(uploadData: $uploadData, file: $file) {
      id
      uri
    }
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

export const ChallengeDashboardReferencesDocument = gql`
  query ChallengeDashboardReferences($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  mutation createChallenge($input: CreateChallengeOnHubInput!) {
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
  mutation updateChallengeInnovationFlow($input: UpdateChallengeInnovationFlowInput!) {
    updateChallengeInnovationFlow(challengeData: $input) {
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
  query challengeActivity($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
  query challengeApplicationTemplate($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
          templateName
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

export const ChallengeNameDocument = gql`
  query challengeName($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
        profile {
          id
          displayName
          tagline
          description
          tagset {
            id
            name
            tags
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
        lifecycle {
          state
        }
        context {
          ...ContextDetails
        }
      }
    }
  }
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
    $hubNameId: UUID_NAMEID!
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
        nameID
        profile {
          id
          displayName
          tagline
          description
          tagset {
            id
            name
            tags
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
            id
            name
            tags
          }
          visuals {
            ...VisualFull
          }
        }
        authorization {
          id
          myPrivileges
        }
        lifecycle {
          ...LifecycleContextTab
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
            id
            name
            tags
          }
          visuals {
            ...VisualFull
          }
        }
        lifecycle {
          ...LifecycleContextTab
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
 *      hubNameId: // value for 'hubNameId'
 *      includeHub: // value for 'includeHub'
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
    $hubNameId: UUID_NAMEID!
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $communityReadAccess: Boolean!
    $referencesReadAccess: Boolean!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      includeHub: // value for 'includeHub'
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
    $hubNameId: UUID_NAMEID!
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      includeHub: // value for 'includeHub'
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
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $includeCommunity: Boolean = false
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeHub: // value for 'includeHub'
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
    $hubNameId: UUID_NAMEID!
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      includeHub: // value for 'includeHub'
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

export const HubCommunityPageDocument = gql`
  query HubCommunityPage($hubNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
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
 * __useHubCommunityPageQuery__
 *
 * To run a query within a React component, call `useHubCommunityPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCommunityPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCommunityPageQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *   },
 * });
 */
export function useHubCommunityPageQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCommunityPageQuery, SchemaTypes.HubCommunityPageQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCommunityPageQuery, SchemaTypes.HubCommunityPageQueryVariables>(
    HubCommunityPageDocument,
    options
  );
}

export function useHubCommunityPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCommunityPageQuery,
    SchemaTypes.HubCommunityPageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCommunityPageQuery, SchemaTypes.HubCommunityPageQueryVariables>(
    HubCommunityPageDocument,
    options
  );
}

export type HubCommunityPageQueryHookResult = ReturnType<typeof useHubCommunityPageQuery>;
export type HubCommunityPageLazyQueryHookResult = ReturnType<typeof useHubCommunityPageLazyQuery>;
export type HubCommunityPageQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCommunityPageQuery,
  SchemaTypes.HubCommunityPageQueryVariables
>;
export function refetchHubCommunityPageQuery(variables: SchemaTypes.HubCommunityPageQueryVariables) {
  return { query: HubCommunityPageDocument, variables: variables };
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

export const HubHostDocument = gql`
  query hubHost($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubHostQuery__
 *
 * To run a query within a React component, call `useHubHostQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubHostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubHostQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubHostQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubHostQuery, SchemaTypes.HubHostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubHostQuery, SchemaTypes.HubHostQueryVariables>(HubHostDocument, options);
}

export function useHubHostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubHostQuery, SchemaTypes.HubHostQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubHostQuery, SchemaTypes.HubHostQueryVariables>(HubHostDocument, options);
}

export type HubHostQueryHookResult = ReturnType<typeof useHubHostQuery>;
export type HubHostLazyQueryHookResult = ReturnType<typeof useHubHostLazyQuery>;
export type HubHostQueryResult = Apollo.QueryResult<SchemaTypes.HubHostQuery, SchemaTypes.HubHostQueryVariables>;
export function refetchHubHostQuery(variables: SchemaTypes.HubHostQueryVariables) {
  return { query: HubHostDocument, variables: variables };
}

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

export const HubDashboardReferencesDocument = gql`
  query HubDashboardReferences($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubDashboardReferencesQuery__
 *
 * To run a query within a React component, call `useHubDashboardReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubDashboardReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubDashboardReferencesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubDashboardReferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubDashboardReferencesQuery,
    SchemaTypes.HubDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubDashboardReferencesQuery, SchemaTypes.HubDashboardReferencesQueryVariables>(
    HubDashboardReferencesDocument,
    options
  );
}

export function useHubDashboardReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubDashboardReferencesQuery,
    SchemaTypes.HubDashboardReferencesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubDashboardReferencesQuery, SchemaTypes.HubDashboardReferencesQueryVariables>(
    HubDashboardReferencesDocument,
    options
  );
}

export type HubDashboardReferencesQueryHookResult = ReturnType<typeof useHubDashboardReferencesQuery>;
export type HubDashboardReferencesLazyQueryHookResult = ReturnType<typeof useHubDashboardReferencesLazyQuery>;
export type HubDashboardReferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubDashboardReferencesQuery,
  SchemaTypes.HubDashboardReferencesQueryVariables
>;
export function refetchHubDashboardReferencesQuery(variables: SchemaTypes.HubDashboardReferencesQueryVariables) {
  return { query: HubDashboardReferencesDocument, variables: variables };
}

export const HubDashboardNavigationChallengesDocument = gql`
  query HubDashboardNavigationChallenges($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      challenges {
        id
        nameID
        profile {
          ...HubDashboardNavigationProfile
        }
        context {
          ...HubDashboardNavigationContext
        }
        lifecycle {
          ...HubDashboardNavigationLifecycle
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
  ${HubDashboardNavigationProfileFragmentDoc}
  ${HubDashboardNavigationContextFragmentDoc}
  ${HubDashboardNavigationLifecycleFragmentDoc}
`;

/**
 * __useHubDashboardNavigationChallengesQuery__
 *
 * To run a query within a React component, call `useHubDashboardNavigationChallengesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubDashboardNavigationChallengesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubDashboardNavigationChallengesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubDashboardNavigationChallengesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubDashboardNavigationChallengesQuery,
    SchemaTypes.HubDashboardNavigationChallengesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubDashboardNavigationChallengesQuery,
    SchemaTypes.HubDashboardNavigationChallengesQueryVariables
  >(HubDashboardNavigationChallengesDocument, options);
}

export function useHubDashboardNavigationChallengesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubDashboardNavigationChallengesQuery,
    SchemaTypes.HubDashboardNavigationChallengesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubDashboardNavigationChallengesQuery,
    SchemaTypes.HubDashboardNavigationChallengesQueryVariables
  >(HubDashboardNavigationChallengesDocument, options);
}

export type HubDashboardNavigationChallengesQueryHookResult = ReturnType<
  typeof useHubDashboardNavigationChallengesQuery
>;
export type HubDashboardNavigationChallengesLazyQueryHookResult = ReturnType<
  typeof useHubDashboardNavigationChallengesLazyQuery
>;
export type HubDashboardNavigationChallengesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubDashboardNavigationChallengesQuery,
  SchemaTypes.HubDashboardNavigationChallengesQueryVariables
>;
export function refetchHubDashboardNavigationChallengesQuery(
  variables: SchemaTypes.HubDashboardNavigationChallengesQueryVariables
) {
  return { query: HubDashboardNavigationChallengesDocument, variables: variables };
}

export const HubDashboardNavigationOpportunitiesDocument = gql`
  query HubDashboardNavigationOpportunities($hubId: UUID_NAMEID!, $challengeIds: [UUID!]!) {
    hub(ID: $hubId) {
      id
      challenges(IDs: $challengeIds) {
        id
        opportunities {
          id
          nameID
          profile {
            ...HubDashboardNavigationProfile
          }
          context {
            ...HubDashboardNavigationContext
          }
          lifecycle {
            ...HubDashboardNavigationLifecycle
          }
        }
      }
    }
  }
  ${HubDashboardNavigationProfileFragmentDoc}
  ${HubDashboardNavigationContextFragmentDoc}
  ${HubDashboardNavigationLifecycleFragmentDoc}
`;

/**
 * __useHubDashboardNavigationOpportunitiesQuery__
 *
 * To run a query within a React component, call `useHubDashboardNavigationOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubDashboardNavigationOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubDashboardNavigationOpportunitiesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      challengeIds: // value for 'challengeIds'
 *   },
 * });
 */
export function useHubDashboardNavigationOpportunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubDashboardNavigationOpportunitiesQuery,
    SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubDashboardNavigationOpportunitiesQuery,
    SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
  >(HubDashboardNavigationOpportunitiesDocument, options);
}

export function useHubDashboardNavigationOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubDashboardNavigationOpportunitiesQuery,
    SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubDashboardNavigationOpportunitiesQuery,
    SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
  >(HubDashboardNavigationOpportunitiesDocument, options);
}

export type HubDashboardNavigationOpportunitiesQueryHookResult = ReturnType<
  typeof useHubDashboardNavigationOpportunitiesQuery
>;
export type HubDashboardNavigationOpportunitiesLazyQueryHookResult = ReturnType<
  typeof useHubDashboardNavigationOpportunitiesLazyQuery
>;
export type HubDashboardNavigationOpportunitiesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubDashboardNavigationOpportunitiesQuery,
  SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
>;
export function refetchHubDashboardNavigationOpportunitiesQuery(
  variables: SchemaTypes.HubDashboardNavigationOpportunitiesQueryVariables
) {
  return { query: HubDashboardNavigationOpportunitiesDocument, variables: variables };
}

export const HubTemplatesDocument = gql`
  query HubTemplates($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      ...HubTemplates
    }
  }
  ${HubTemplatesFragmentDoc}
`;

/**
 * __useHubTemplatesQuery__
 *
 * To run a query within a React component, call `useHubTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubTemplatesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubTemplatesQuery, SchemaTypes.HubTemplatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubTemplatesQuery, SchemaTypes.HubTemplatesQueryVariables>(
    HubTemplatesDocument,
    options
  );
}

export function useHubTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubTemplatesQuery, SchemaTypes.HubTemplatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubTemplatesQuery, SchemaTypes.HubTemplatesQueryVariables>(
    HubTemplatesDocument,
    options
  );
}

export type HubTemplatesQueryHookResult = ReturnType<typeof useHubTemplatesQuery>;
export type HubTemplatesLazyQueryHookResult = ReturnType<typeof useHubTemplatesLazyQuery>;
export type HubTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubTemplatesQuery,
  SchemaTypes.HubTemplatesQueryVariables
>;
export function refetchHubTemplatesQuery(variables: SchemaTypes.HubTemplatesQueryVariables) {
  return { query: HubTemplatesDocument, variables: variables };
}

export const CalloutFormTemplatesFromHubDocument = gql`
  query CalloutFormTemplatesFromHub($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useCalloutFormTemplatesFromHubQuery__
 *
 * To run a query within a React component, call `useCalloutFormTemplatesFromHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutFormTemplatesFromHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutFormTemplatesFromHubQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useCalloutFormTemplatesFromHubQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutFormTemplatesFromHubQuery,
    SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutFormTemplatesFromHubQuery,
    SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
  >(CalloutFormTemplatesFromHubDocument, options);
}

export function useCalloutFormTemplatesFromHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutFormTemplatesFromHubQuery,
    SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutFormTemplatesFromHubQuery,
    SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
  >(CalloutFormTemplatesFromHubDocument, options);
}

export type CalloutFormTemplatesFromHubQueryHookResult = ReturnType<typeof useCalloutFormTemplatesFromHubQuery>;
export type CalloutFormTemplatesFromHubLazyQueryHookResult = ReturnType<typeof useCalloutFormTemplatesFromHubLazyQuery>;
export type CalloutFormTemplatesFromHubQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutFormTemplatesFromHubQuery,
  SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
>;
export function refetchCalloutFormTemplatesFromHubQuery(
  variables: SchemaTypes.CalloutFormTemplatesFromHubQueryVariables
) {
  return { query: CalloutFormTemplatesFromHubDocument, variables: variables };
}

export const PostTemplatesFromHubDocument = gql`
  query PostTemplatesFromHub($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __usePostTemplatesFromHubQuery__
 *
 * To run a query within a React component, call `usePostTemplatesFromHubQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostTemplatesFromHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostTemplatesFromHubQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function usePostTemplatesFromHubQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PostTemplatesFromHubQuery,
    SchemaTypes.PostTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.PostTemplatesFromHubQuery, SchemaTypes.PostTemplatesFromHubQueryVariables>(
    PostTemplatesFromHubDocument,
    options
  );
}

export function usePostTemplatesFromHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PostTemplatesFromHubQuery,
    SchemaTypes.PostTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.PostTemplatesFromHubQuery, SchemaTypes.PostTemplatesFromHubQueryVariables>(
    PostTemplatesFromHubDocument,
    options
  );
}

export type PostTemplatesFromHubQueryHookResult = ReturnType<typeof usePostTemplatesFromHubQuery>;
export type PostTemplatesFromHubLazyQueryHookResult = ReturnType<typeof usePostTemplatesFromHubLazyQuery>;
export type PostTemplatesFromHubQueryResult = Apollo.QueryResult<
  SchemaTypes.PostTemplatesFromHubQuery,
  SchemaTypes.PostTemplatesFromHubQueryVariables
>;
export function refetchPostTemplatesFromHubQuery(variables: SchemaTypes.PostTemplatesFromHubQueryVariables) {
  return { query: PostTemplatesFromHubDocument, variables: variables };
}

export const WhiteboardTemplatesFromHubDocument = gql`
  query WhiteboardTemplatesFromHub($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useWhiteboardTemplatesFromHubQuery__
 *
 * To run a query within a React component, call `useWhiteboardTemplatesFromHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhiteboardTemplatesFromHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhiteboardTemplatesFromHubQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useWhiteboardTemplatesFromHubQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.WhiteboardTemplatesFromHubQuery,
    SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.WhiteboardTemplatesFromHubQuery,
    SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
  >(WhiteboardTemplatesFromHubDocument, options);
}

export function useWhiteboardTemplatesFromHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.WhiteboardTemplatesFromHubQuery,
    SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.WhiteboardTemplatesFromHubQuery,
    SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
  >(WhiteboardTemplatesFromHubDocument, options);
}

export type WhiteboardTemplatesFromHubQueryHookResult = ReturnType<typeof useWhiteboardTemplatesFromHubQuery>;
export type WhiteboardTemplatesFromHubLazyQueryHookResult = ReturnType<typeof useWhiteboardTemplatesFromHubLazyQuery>;
export type WhiteboardTemplatesFromHubQueryResult = Apollo.QueryResult<
  SchemaTypes.WhiteboardTemplatesFromHubQuery,
  SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
>;
export function refetchWhiteboardTemplatesFromHubQuery(
  variables: SchemaTypes.WhiteboardTemplatesFromHubQueryVariables
) {
  return { query: WhiteboardTemplatesFromHubDocument, variables: variables };
}

export const InnovationFlowTemplatesFromHubDocument = gql`
  query InnovationFlowTemplatesFromHub($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useInnovationFlowTemplatesFromHubQuery__
 *
 * To run a query within a React component, call `useInnovationFlowTemplatesFromHubQuery` and pass it any options that fit your needs.
 * When your component renders, `useInnovationFlowTemplatesFromHubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInnovationFlowTemplatesFromHubQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useInnovationFlowTemplatesFromHubQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.InnovationFlowTemplatesFromHubQuery,
    SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.InnovationFlowTemplatesFromHubQuery,
    SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
  >(InnovationFlowTemplatesFromHubDocument, options);
}

export function useInnovationFlowTemplatesFromHubLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.InnovationFlowTemplatesFromHubQuery,
    SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.InnovationFlowTemplatesFromHubQuery,
    SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
  >(InnovationFlowTemplatesFromHubDocument, options);
}

export type InnovationFlowTemplatesFromHubQueryHookResult = ReturnType<typeof useInnovationFlowTemplatesFromHubQuery>;
export type InnovationFlowTemplatesFromHubLazyQueryHookResult = ReturnType<
  typeof useInnovationFlowTemplatesFromHubLazyQuery
>;
export type InnovationFlowTemplatesFromHubQueryResult = Apollo.QueryResult<
  SchemaTypes.InnovationFlowTemplatesFromHubQuery,
  SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
>;
export function refetchInnovationFlowTemplatesFromHubQuery(
  variables: SchemaTypes.InnovationFlowTemplatesFromHubQueryVariables
) {
  return { query: InnovationFlowTemplatesFromHubDocument, variables: variables };
}

export const HubTemplatesWhiteboardTemplateWithValueDocument = gql`
  query HubTemplatesWhiteboardTemplateWithValue($hubId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    hub(ID: $hubId) {
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
 * __useHubTemplatesWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useHubTemplatesWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubTemplatesWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubTemplatesWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useHubTemplatesWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
  >(HubTemplatesWhiteboardTemplateWithValueDocument, options);
}

export function useHubTemplatesWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
  >(HubTemplatesWhiteboardTemplateWithValueDocument, options);
}

export type HubTemplatesWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useHubTemplatesWhiteboardTemplateWithValueQuery
>;
export type HubTemplatesWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useHubTemplatesWhiteboardTemplateWithValueLazyQuery
>;
export type HubTemplatesWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQuery,
  SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
>;
export function refetchHubTemplatesWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.HubTemplatesWhiteboardTemplateWithValueQueryVariables
) {
  return { query: HubTemplatesWhiteboardTemplateWithValueDocument, variables: variables };
}

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
export const DeleteHubDocument = gql`
  mutation deleteHub($input: DeleteHubInput!) {
    deleteHub(deleteData: $input) {
      id
      nameID
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
export const HubActivityDocument = gql`
  query hubActivity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      metrics {
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
  query hubApplicationTemplate($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubApplicationTemplateQuery(
  baseOptions: Apollo.QueryHookOptions<
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
export function refetchHubApplicationTemplateQuery(variables: SchemaTypes.HubApplicationTemplateQueryVariables) {
  return { query: HubApplicationTemplateDocument, variables: variables };
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

export const HubInnovationFlowTemplatesDocument = gql`
  query hubInnovationFlowTemplates($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubInnovationFlowTemplatesQuery__
 *
 * To run a query within a React component, call `useHubInnovationFlowTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubInnovationFlowTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubInnovationFlowTemplatesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubInnovationFlowTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubInnovationFlowTemplatesQuery,
    SchemaTypes.HubInnovationFlowTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubInnovationFlowTemplatesQuery,
    SchemaTypes.HubInnovationFlowTemplatesQueryVariables
  >(HubInnovationFlowTemplatesDocument, options);
}

export function useHubInnovationFlowTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubInnovationFlowTemplatesQuery,
    SchemaTypes.HubInnovationFlowTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubInnovationFlowTemplatesQuery,
    SchemaTypes.HubInnovationFlowTemplatesQueryVariables
  >(HubInnovationFlowTemplatesDocument, options);
}

export type HubInnovationFlowTemplatesQueryHookResult = ReturnType<typeof useHubInnovationFlowTemplatesQuery>;
export type HubInnovationFlowTemplatesLazyQueryHookResult = ReturnType<typeof useHubInnovationFlowTemplatesLazyQuery>;
export type HubInnovationFlowTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubInnovationFlowTemplatesQuery,
  SchemaTypes.HubInnovationFlowTemplatesQueryVariables
>;
export function refetchHubInnovationFlowTemplatesQuery(
  variables: SchemaTypes.HubInnovationFlowTemplatesQueryVariables
) {
  return { query: HubInnovationFlowTemplatesDocument, variables: variables };
}

export const HubMembersDocument = gql`
  query hubMembers($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
        memberUsers {
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
  query hubs($visibilities: [HubVisibility!] = [ACTIVE]) {
    hubs(filter: { visibilities: $visibilities }) {
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
 *      visibilities: // value for 'visibilities'
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

export const ChallengeCreatedDocument = gql`
  subscription ChallengeCreated($hubID: UUID_NAMEID!) {
    challengeCreated(hubID: $hubID) {
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
 *      hubID: // value for 'hubID'
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
        hubListFilter {
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

export const AssignUserAsOpportunityAdminDocument = gql`
  mutation assignUserAsOpportunityAdmin($input: AssignOpportunityAdminInput!) {
    assignUserAsOpportunityAdmin(membershipData: $input) {
      id
      profile {
        id
        displayName
      }
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
      profile {
        id
        displayName
      }
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

export const EventOnOpportunityDocument = gql`
  mutation eventOnOpportunity($opportunityId: UUID!, $eventName: String!) {
    eventOnOpportunity(opportunityEventData: { ID: $opportunityId, eventName: $eventName }) {
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
 *      opportunityId: // value for 'opportunityId'
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
  mutation updateOpportunityInnovationFlow($input: UpdateOpportunityInnovationFlowInput!) {
    updateOpportunityInnovationFlow(opportunityData: $input) {
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

export const OpportunitiesDocument = gql`
  query opportunities($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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

export const OpportunityCardsDocument = gql`
  query opportunityCards($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
          templateName
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
        profile {
          id
          displayName
          description
          tagline
          tagset {
            id
            name
            tags
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
      }
    }
  }
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
        profile {
          id
          displayName
          tagline
          visuals {
            ...VisualUri
          }
          tagset {
            name
            tags
          }
        }
        nameID
        metrics {
          name
          value
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

export const CalloutPageCalloutDocument = gql`
  query CalloutPageCallout(
    $calloutNameId: UUID_NAMEID!
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    hub(ID: $hubNameId) {
      id
      collaboration @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeHub: // value for 'includeHub'
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
      parentDisplayName
      __typename
      triggeredBy {
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
            id
            tags
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
      ... on ActivityLogEntryCalloutCardCreated {
        ...ActivityLogCalloutCardCreated
      }
      ... on ActivityLogEntryCalloutCardComment {
        ...ActivityLogCalloutCardComment
      }
      ... on ActivityLogEntryCalloutCanvasCreated {
        ...ActivityLogCalloutCanvasCreated
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
  ${ActivityLogMemberJoinedFragmentDoc}
  ${ActivityLogCalloutPublishedFragmentDoc}
  ${ActivityLogCalloutCardCreatedFragmentDoc}
  ${ActivityLogCalloutCardCommentFragmentDoc}
  ${ActivityLogCalloutCanvasCreatedFragmentDoc}
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

export const HubPostTemplatesLibraryDocument = gql`
  query HubPostTemplatesLibrary($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubPostTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useHubPostTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubPostTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubPostTemplatesLibraryQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubPostTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubPostTemplatesLibraryQuery,
    SchemaTypes.HubPostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubPostTemplatesLibraryQuery, SchemaTypes.HubPostTemplatesLibraryQueryVariables>(
    HubPostTemplatesLibraryDocument,
    options
  );
}

export function useHubPostTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubPostTemplatesLibraryQuery,
    SchemaTypes.HubPostTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubPostTemplatesLibraryQuery,
    SchemaTypes.HubPostTemplatesLibraryQueryVariables
  >(HubPostTemplatesLibraryDocument, options);
}

export type HubPostTemplatesLibraryQueryHookResult = ReturnType<typeof useHubPostTemplatesLibraryQuery>;
export type HubPostTemplatesLibraryLazyQueryHookResult = ReturnType<typeof useHubPostTemplatesLibraryLazyQuery>;
export type HubPostTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.HubPostTemplatesLibraryQuery,
  SchemaTypes.HubPostTemplatesLibraryQueryVariables
>;
export function refetchHubPostTemplatesLibraryQuery(variables: SchemaTypes.HubPostTemplatesLibraryQueryVariables) {
  return { query: HubPostTemplatesLibraryDocument, variables: variables };
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

export const HubAspectDocument = gql`
  query HubAspect($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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
  query ChallengeAspect(
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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
  query OpportunityAspect(
    $hubNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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
      type
      profile {
        id
        displayName
        description
        tagset {
          id
          name
          tags
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
  query HubAspectSettings($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      collaboration {
        id
        callouts(IDs: [$calloutNameId]) {
          ...AspectSettingsCallout
        }
      }
    }
  }
  ${AspectSettingsCalloutFragmentDoc}
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
 *      calloutNameId: // value for 'calloutNameId'
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
  query ChallengeAspectSettings(
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...AspectSettingsCallout
          }
        }
      }
    }
  }
  ${AspectSettingsCalloutFragmentDoc}
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
 *      calloutNameId: // value for 'calloutNameId'
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
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutNameId]) {
            ...AspectSettingsCallout
          }
        }
      }
    }
  }
  ${AspectSettingsCalloutFragmentDoc}
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
 *      calloutNameId: // value for 'calloutNameId'
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

export const HubAspectProviderDocument = gql`
  query HubAspectProvider($hubNameId: UUID_NAMEID!, $aspectNameId: UUID_NAMEID!, $calloutNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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
  query ChallengeAspectProvider(
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $aspectNameId: UUID_NAMEID!
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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
    $calloutNameId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
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
 *      calloutNameId: // value for 'calloutNameId'
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

export const CreateAspectDocument = gql`
  mutation CreateAspect($aspectData: CreateAspectOnCalloutInput!) {
    createAspectOnCallout(aspectData: $aspectData) {
      id
      nameID
      type
      profile {
        id
        description
        displayName
        tagset {
          id
          name
          tags
        }
        visuals {
          ...VisualUri
        }
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
export const MoveAspectToCalloutDocument = gql`
  mutation MoveAspectToCallout($aspectId: UUID!, $calloutId: UUID!) {
    moveAspectToCallout(moveAspectData: { aspectID: $aspectId, calloutID: $calloutId }) {
      id
      nameID
      callout {
        id
        nameID
      }
    }
  }
`;
export type MoveAspectToCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.MoveAspectToCalloutMutation,
  SchemaTypes.MoveAspectToCalloutMutationVariables
>;

/**
 * __useMoveAspectToCalloutMutation__
 *
 * To run a mutation, you first call `useMoveAspectToCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveAspectToCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveAspectToCalloutMutation, { data, loading, error }] = useMoveAspectToCalloutMutation({
 *   variables: {
 *      aspectId: // value for 'aspectId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useMoveAspectToCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.MoveAspectToCalloutMutation,
    SchemaTypes.MoveAspectToCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.MoveAspectToCalloutMutation, SchemaTypes.MoveAspectToCalloutMutationVariables>(
    MoveAspectToCalloutDocument,
    options
  );
}

export type MoveAspectToCalloutMutationHookResult = ReturnType<typeof useMoveAspectToCalloutMutation>;
export type MoveAspectToCalloutMutationResult = Apollo.MutationResult<SchemaTypes.MoveAspectToCalloutMutation>;
export type MoveAspectToCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.MoveAspectToCalloutMutation,
  SchemaTypes.MoveAspectToCalloutMutationVariables
>;
export const AspectCommentsMessageReceivedDocument = gql`
  subscription AspectCommentsMessageReceived($aspectID: UUID!) {
    aspectCommentsMessageReceived(aspectID: $aspectID) {
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useAspectCommentsMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useAspectCommentsMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAspectCommentsMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAspectCommentsMessageReceivedSubscription({
 *   variables: {
 *      aspectID: // value for 'aspectID'
 *   },
 * });
 */
export function useAspectCommentsMessageReceivedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.AspectCommentsMessageReceivedSubscription,
    SchemaTypes.AspectCommentsMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.AspectCommentsMessageReceivedSubscription,
    SchemaTypes.AspectCommentsMessageReceivedSubscriptionVariables
  >(AspectCommentsMessageReceivedDocument, options);
}

export type AspectCommentsMessageReceivedSubscriptionHookResult = ReturnType<
  typeof useAspectCommentsMessageReceivedSubscription
>;
export type AspectCommentsMessageReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.AspectCommentsMessageReceivedSubscription>;
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
export const PostCommentInCalloutDocument = gql`
  mutation PostCommentInCallout($data: SendMessageOnCalloutInput!) {
    sendMessageOnCallout(data: $data) {
      ...MessageDetails
    }
  }
  ${MessageDetailsFragmentDoc}
`;
export type PostCommentInCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.PostCommentInCalloutMutation,
  SchemaTypes.PostCommentInCalloutMutationVariables
>;

/**
 * __usePostCommentInCalloutMutation__
 *
 * To run a mutation, you first call `usePostCommentInCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostCommentInCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postCommentInCalloutMutation, { data, loading, error }] = usePostCommentInCalloutMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostCommentInCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.PostCommentInCalloutMutation,
    SchemaTypes.PostCommentInCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.PostCommentInCalloutMutation,
    SchemaTypes.PostCommentInCalloutMutationVariables
  >(PostCommentInCalloutDocument, options);
}

export type PostCommentInCalloutMutationHookResult = ReturnType<typeof usePostCommentInCalloutMutation>;
export type PostCommentInCalloutMutationResult = Apollo.MutationResult<SchemaTypes.PostCommentInCalloutMutation>;
export type PostCommentInCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.PostCommentInCalloutMutation,
  SchemaTypes.PostCommentInCalloutMutationVariables
>;
export const TemplatesForCalloutCreationDocument = gql`
  query TemplatesForCalloutCreation($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  query PostTemplatesOnCalloutCreation($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  query WhiteboardTemplatesOnCalloutCreation($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  query PostTemplateValue($hubId: UUID_NAMEID!, $id: UUID!) {
    hub(ID: $hubId) {
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
              id
              tags
            }
          }
        }
      }
    }
  }
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
 *      hubId: // value for 'hubId'
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
  query WhiteboardTemplateValue($hubId: UUID_NAMEID!, $id: UUID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export const HubCollaborationIdDocument = gql`
  query hubCollaborationId($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      collaboration {
        id
      }
    }
  }
`;

/**
 * __useHubCollaborationIdQuery__
 *
 * To run a query within a React component, call `useHubCollaborationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCollaborationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCollaborationIdQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCollaborationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubCollaborationIdQuery,
    SchemaTypes.HubCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCollaborationIdQuery, SchemaTypes.HubCollaborationIdQueryVariables>(
    HubCollaborationIdDocument,
    options
  );
}

export function useHubCollaborationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCollaborationIdQuery,
    SchemaTypes.HubCollaborationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCollaborationIdQuery, SchemaTypes.HubCollaborationIdQueryVariables>(
    HubCollaborationIdDocument,
    options
  );
}

export type HubCollaborationIdQueryHookResult = ReturnType<typeof useHubCollaborationIdQuery>;
export type HubCollaborationIdLazyQueryHookResult = ReturnType<typeof useHubCollaborationIdLazyQuery>;
export type HubCollaborationIdQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCollaborationIdQuery,
  SchemaTypes.HubCollaborationIdQueryVariables
>;
export function refetchHubCollaborationIdQuery(variables: SchemaTypes.HubCollaborationIdQueryVariables) {
  return { query: HubCollaborationIdDocument, variables: variables };
}

export const ChallengeCollaborationIdDocument = gql`
  query challengeCollaborationId($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  query opportunityCollaborationId($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
          id
          tags
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
export const CreateAspectFromContributeTabDocument = gql`
  mutation CreateAspectFromContributeTab($aspectData: CreateAspectOnCalloutInput!) {
    createAspectOnCallout(aspectData: $aspectData) {
      id
      nameID
      type
      profile {
        id
        displayName
        description
        tagset {
          id
          name
          tags
        }
        visual(type: CARD) {
          ...VisualUri
        }
      }
    }
  }
  ${VisualUriFragmentDoc}
`;
export type CreateAspectFromContributeTabMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateAspectFromContributeTabMutation,
  SchemaTypes.CreateAspectFromContributeTabMutationVariables
>;

/**
 * __useCreateAspectFromContributeTabMutation__
 *
 * To run a mutation, you first call `useCreateAspectFromContributeTabMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAspectFromContributeTabMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAspectFromContributeTabMutation, { data, loading, error }] = useCreateAspectFromContributeTabMutation({
 *   variables: {
 *      aspectData: // value for 'aspectData'
 *   },
 * });
 */
export function useCreateAspectFromContributeTabMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateAspectFromContributeTabMutation,
    SchemaTypes.CreateAspectFromContributeTabMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateAspectFromContributeTabMutation,
    SchemaTypes.CreateAspectFromContributeTabMutationVariables
  >(CreateAspectFromContributeTabDocument, options);
}

export type CreateAspectFromContributeTabMutationHookResult = ReturnType<
  typeof useCreateAspectFromContributeTabMutation
>;
export type CreateAspectFromContributeTabMutationResult =
  Apollo.MutationResult<SchemaTypes.CreateAspectFromContributeTabMutation>;
export type CreateAspectFromContributeTabMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateAspectFromContributeTabMutation,
  SchemaTypes.CreateAspectFromContributeTabMutationVariables
>;
export const RemoveCommentFromCalloutDocument = gql`
  mutation RemoveCommentFromCallout($messageData: CommentsRemoveMessageInput!) {
    removeComment(messageData: $messageData)
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
export const CalloutMessageReceivedDocument = gql`
  subscription CalloutMessageReceived($calloutIDs: [UUID!]!) {
    calloutMessageReceived(calloutIDs: $calloutIDs) {
      commentsID
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCalloutMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useCalloutMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCalloutMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutMessageReceivedSubscription({
 *   variables: {
 *      calloutIDs: // value for 'calloutIDs'
 *   },
 * });
 */
export function useCalloutMessageReceivedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CalloutMessageReceivedSubscription,
    SchemaTypes.CalloutMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CalloutMessageReceivedSubscription,
    SchemaTypes.CalloutMessageReceivedSubscriptionVariables
  >(CalloutMessageReceivedDocument, options);
}

export type CalloutMessageReceivedSubscriptionHookResult = ReturnType<typeof useCalloutMessageReceivedSubscription>;
export type CalloutMessageReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CalloutMessageReceivedSubscription>;
export const CalloutsDocument = gql`
  query Callouts(
    $hubNameId: UUID_NAMEID!
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $calloutGroups: [String!]
    $calloutIds: [UUID_NAMEID!]
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      includeHub: // value for 'includeHub'
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

export const HubCalloutAspectsSubscriptionDocument = gql`
  query HubCalloutAspectsSubscription($hubNameId: UUID_NAMEID!, $calloutId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      collaboration {
        id
        callouts(IDs: [$calloutId]) {
          id
          aspects {
            ...ContributeTabAspect
          }
        }
      }
    }
  }
  ${ContributeTabAspectFragmentDoc}
`;

/**
 * __useHubCalloutAspectsSubscriptionQuery__
 *
 * To run a query within a React component, call `useHubCalloutAspectsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCalloutAspectsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCalloutAspectsSubscriptionQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useHubCalloutAspectsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubCalloutAspectsSubscriptionQuery,
    SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubCalloutAspectsSubscriptionQuery,
    SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
  >(HubCalloutAspectsSubscriptionDocument, options);
}

export function useHubCalloutAspectsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCalloutAspectsSubscriptionQuery,
    SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubCalloutAspectsSubscriptionQuery,
    SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
  >(HubCalloutAspectsSubscriptionDocument, options);
}

export type HubCalloutAspectsSubscriptionQueryHookResult = ReturnType<typeof useHubCalloutAspectsSubscriptionQuery>;
export type HubCalloutAspectsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useHubCalloutAspectsSubscriptionLazyQuery
>;
export type HubCalloutAspectsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCalloutAspectsSubscriptionQuery,
  SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
>;
export function refetchHubCalloutAspectsSubscriptionQuery(
  variables: SchemaTypes.HubCalloutAspectsSubscriptionQueryVariables
) {
  return { query: HubCalloutAspectsSubscriptionDocument, variables: variables };
}

export const ChallengeCalloutAspectsSubscriptionDocument = gql`
  query ChallengeCalloutAspectsSubscription(
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      challenge(ID: $challengeNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutId]) {
            id
            aspects {
              ...ContributeTabAspect
            }
          }
        }
      }
    }
  }
  ${ContributeTabAspectFragmentDoc}
`;

/**
 * __useChallengeCalloutAspectsSubscriptionQuery__
 *
 * To run a query within a React component, call `useChallengeCalloutAspectsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCalloutAspectsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCalloutAspectsSubscriptionQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useChallengeCalloutAspectsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
  >(ChallengeCalloutAspectsSubscriptionDocument, options);
}

export function useChallengeCalloutAspectsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQuery,
    SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
  >(ChallengeCalloutAspectsSubscriptionDocument, options);
}

export type ChallengeCalloutAspectsSubscriptionQueryHookResult = ReturnType<
  typeof useChallengeCalloutAspectsSubscriptionQuery
>;
export type ChallengeCalloutAspectsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useChallengeCalloutAspectsSubscriptionLazyQuery
>;
export type ChallengeCalloutAspectsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCalloutAspectsSubscriptionQuery,
  SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
>;
export function refetchChallengeCalloutAspectsSubscriptionQuery(
  variables: SchemaTypes.ChallengeCalloutAspectsSubscriptionQueryVariables
) {
  return { query: ChallengeCalloutAspectsSubscriptionDocument, variables: variables };
}

export const OpportunityCalloutAspectsSubscriptionDocument = gql`
  query OpportunityCalloutAspectsSubscription(
    $hubNameId: UUID_NAMEID!
    $opportunityNameId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
  ) {
    hub(ID: $hubNameId) {
      id
      opportunity(ID: $opportunityNameId) {
        id
        collaboration {
          id
          callouts(IDs: [$calloutId]) {
            id
            aspects {
              ...ContributeTabAspect
            }
          }
        }
      }
    }
  }
  ${ContributeTabAspectFragmentDoc}
`;

/**
 * __useOpportunityCalloutAspectsSubscriptionQuery__
 *
 * To run a query within a React component, call `useOpportunityCalloutAspectsSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCalloutAspectsSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCalloutAspectsSubscriptionQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      calloutId: // value for 'calloutId'
 *   },
 * });
 */
export function useOpportunityCalloutAspectsSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
  >(OpportunityCalloutAspectsSubscriptionDocument, options);
}

export function useOpportunityCalloutAspectsSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQuery,
    SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
  >(OpportunityCalloutAspectsSubscriptionDocument, options);
}

export type OpportunityCalloutAspectsSubscriptionQueryHookResult = ReturnType<
  typeof useOpportunityCalloutAspectsSubscriptionQuery
>;
export type OpportunityCalloutAspectsSubscriptionLazyQueryHookResult = ReturnType<
  typeof useOpportunityCalloutAspectsSubscriptionLazyQuery
>;
export type OpportunityCalloutAspectsSubscriptionQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCalloutAspectsSubscriptionQuery,
  SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
>;
export function refetchOpportunityCalloutAspectsSubscriptionQuery(
  variables: SchemaTypes.OpportunityCalloutAspectsSubscriptionQueryVariables
) {
  return { query: OpportunityCalloutAspectsSubscriptionDocument, variables: variables };
}

export const PrivilegesOnHubCollaborationDocument = gql`
  query PrivilegesOnHubCollaboration($hubNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
      id
      collaboration {
        ...PrivilegesOnCollaboration
      }
    }
  }
  ${PrivilegesOnCollaborationFragmentDoc}
`;

/**
 * __usePrivilegesOnHubCollaborationQuery__
 *
 * To run a query within a React component, call `usePrivilegesOnHubCollaborationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrivilegesOnHubCollaborationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrivilegesOnHubCollaborationQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *   },
 * });
 */
export function usePrivilegesOnHubCollaborationQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PrivilegesOnHubCollaborationQuery,
    SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PrivilegesOnHubCollaborationQuery,
    SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
  >(PrivilegesOnHubCollaborationDocument, options);
}

export function usePrivilegesOnHubCollaborationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PrivilegesOnHubCollaborationQuery,
    SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PrivilegesOnHubCollaborationQuery,
    SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
  >(PrivilegesOnHubCollaborationDocument, options);
}

export type PrivilegesOnHubCollaborationQueryHookResult = ReturnType<typeof usePrivilegesOnHubCollaborationQuery>;
export type PrivilegesOnHubCollaborationLazyQueryHookResult = ReturnType<
  typeof usePrivilegesOnHubCollaborationLazyQuery
>;
export type PrivilegesOnHubCollaborationQueryResult = Apollo.QueryResult<
  SchemaTypes.PrivilegesOnHubCollaborationQuery,
  SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
>;
export function refetchPrivilegesOnHubCollaborationQuery(
  variables: SchemaTypes.PrivilegesOnHubCollaborationQueryVariables
) {
  return { query: PrivilegesOnHubCollaborationDocument, variables: variables };
}

export const PrivilegesOnChallengeCollaborationDocument = gql`
  query PrivilegesOnChallengeCollaboration($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
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
 *      hubNameId: // value for 'hubNameId'
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
  query PrivilegesOnOpportunityCollaboration($hubNameId: UUID_NAMEID!, $opportunityNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
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
 *      hubNameId: // value for 'hubNameId'
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

export const HubWhiteboardTemplatesLibraryDocument = gql`
  query HubWhiteboardTemplatesLibrary($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubWhiteboardTemplatesLibraryQuery__
 *
 * To run a query within a React component, call `useHubWhiteboardTemplatesLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubWhiteboardTemplatesLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubWhiteboardTemplatesLibraryQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubWhiteboardTemplatesLibraryQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubWhiteboardTemplatesLibraryQuery,
    SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubWhiteboardTemplatesLibraryQuery,
    SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
  >(HubWhiteboardTemplatesLibraryDocument, options);
}

export function useHubWhiteboardTemplatesLibraryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubWhiteboardTemplatesLibraryQuery,
    SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubWhiteboardTemplatesLibraryQuery,
    SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
  >(HubWhiteboardTemplatesLibraryDocument, options);
}

export type HubWhiteboardTemplatesLibraryQueryHookResult = ReturnType<typeof useHubWhiteboardTemplatesLibraryQuery>;
export type HubWhiteboardTemplatesLibraryLazyQueryHookResult = ReturnType<
  typeof useHubWhiteboardTemplatesLibraryLazyQuery
>;
export type HubWhiteboardTemplatesLibraryQueryResult = Apollo.QueryResult<
  SchemaTypes.HubWhiteboardTemplatesLibraryQuery,
  SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
>;
export function refetchHubWhiteboardTemplatesLibraryQuery(
  variables: SchemaTypes.HubWhiteboardTemplatesLibraryQueryVariables
) {
  return { query: HubWhiteboardTemplatesLibraryDocument, variables: variables };
}

export const HubWhiteboardTemplateValueDocument = gql`
  query HubWhiteboardTemplateValue($hubId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    hub(ID: $hubId) {
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
 * __useHubWhiteboardTemplateValueQuery__
 *
 * To run a query within a React component, call `useHubWhiteboardTemplateValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubWhiteboardTemplateValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubWhiteboardTemplateValueQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useHubWhiteboardTemplateValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubWhiteboardTemplateValueQuery,
    SchemaTypes.HubWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubWhiteboardTemplateValueQuery,
    SchemaTypes.HubWhiteboardTemplateValueQueryVariables
  >(HubWhiteboardTemplateValueDocument, options);
}

export function useHubWhiteboardTemplateValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubWhiteboardTemplateValueQuery,
    SchemaTypes.HubWhiteboardTemplateValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubWhiteboardTemplateValueQuery,
    SchemaTypes.HubWhiteboardTemplateValueQueryVariables
  >(HubWhiteboardTemplateValueDocument, options);
}

export type HubWhiteboardTemplateValueQueryHookResult = ReturnType<typeof useHubWhiteboardTemplateValueQuery>;
export type HubWhiteboardTemplateValueLazyQueryHookResult = ReturnType<typeof useHubWhiteboardTemplateValueLazyQuery>;
export type HubWhiteboardTemplateValueQueryResult = Apollo.QueryResult<
  SchemaTypes.HubWhiteboardTemplateValueQuery,
  SchemaTypes.HubWhiteboardTemplateValueQueryVariables
>;
export function refetchHubWhiteboardTemplateValueQuery(
  variables: SchemaTypes.HubWhiteboardTemplateValueQueryVariables
) {
  return { query: HubWhiteboardTemplateValueDocument, variables: variables };
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

export const WhiteboardTemplatesDocument = gql`
  query whiteboardTemplates($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      templates {
        id
        whiteboardTemplates {
          ...CreateCanvasWhiteboardTemplate
        }
      }
    }
  }
  ${CreateCanvasWhiteboardTemplateFragmentDoc}
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
 *      hubId: // value for 'hubId'
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

export const HubCanvasFromCalloutDocument = gql`
  query hubCanvasFromCallout($hubId: UUID_NAMEID!, $calloutId: UUID_NAMEID!, $canvasId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      collaboration {
        ...CalloutWithCanvas
      }
    }
  }
  ${CalloutWithCanvasFragmentDoc}
`;

/**
 * __useHubCanvasFromCalloutQuery__
 *
 * To run a query within a React component, call `useHubCanvasFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCanvasFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCanvasFromCalloutQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      calloutId: // value for 'calloutId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useHubCanvasFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubCanvasFromCalloutQuery,
    SchemaTypes.HubCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCanvasFromCalloutQuery, SchemaTypes.HubCanvasFromCalloutQueryVariables>(
    HubCanvasFromCalloutDocument,
    options
  );
}

export function useHubCanvasFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCanvasFromCalloutQuery,
    SchemaTypes.HubCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCanvasFromCalloutQuery, SchemaTypes.HubCanvasFromCalloutQueryVariables>(
    HubCanvasFromCalloutDocument,
    options
  );
}

export type HubCanvasFromCalloutQueryHookResult = ReturnType<typeof useHubCanvasFromCalloutQuery>;
export type HubCanvasFromCalloutLazyQueryHookResult = ReturnType<typeof useHubCanvasFromCalloutLazyQuery>;
export type HubCanvasFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCanvasFromCalloutQuery,
  SchemaTypes.HubCanvasFromCalloutQueryVariables
>;
export function refetchHubCanvasFromCalloutQuery(variables: SchemaTypes.HubCanvasFromCalloutQueryVariables) {
  return { query: HubCanvasFromCalloutDocument, variables: variables };
}

export const HubCanvasesDocument = gql`
  query hubCanvases($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      collaboration {
        ...CollaborationWithCanvasDetails
      }
    }
  }
  ${CollaborationWithCanvasDetailsFragmentDoc}
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

export const CanvasWithValueDocument = gql`
  query canvasWithValue($canvasId: UUID!) {
    canvas(ID: $canvasId) {
      ...CanvasDetails
      ...CanvasValue
    }
  }
  ${CanvasDetailsFragmentDoc}
  ${CanvasValueFragmentDoc}
`;

/**
 * __useCanvasWithValueQuery__
 *
 * To run a query within a React component, call `useCanvasWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanvasWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanvasWithValueQuery({
 *   variables: {
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useCanvasWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.CanvasWithValueQuery, SchemaTypes.CanvasWithValueQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CanvasWithValueQuery, SchemaTypes.CanvasWithValueQueryVariables>(
    CanvasWithValueDocument,
    options
  );
}

export function useCanvasWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.CanvasWithValueQuery, SchemaTypes.CanvasWithValueQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CanvasWithValueQuery, SchemaTypes.CanvasWithValueQueryVariables>(
    CanvasWithValueDocument,
    options
  );
}

export type CanvasWithValueQueryHookResult = ReturnType<typeof useCanvasWithValueQuery>;
export type CanvasWithValueLazyQueryHookResult = ReturnType<typeof useCanvasWithValueLazyQuery>;
export type CanvasWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.CanvasWithValueQuery,
  SchemaTypes.CanvasWithValueQueryVariables
>;
export function refetchCanvasWithValueQuery(variables: SchemaTypes.CanvasWithValueQueryVariables) {
  return { query: CanvasWithValueDocument, variables: variables };
}

export const ChallengeCanvasFromCalloutDocument = gql`
  query challengeCanvasFromCallout(
    $hubId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $canvasId: UUID_NAMEID!
  ) {
    hub(ID: $hubId) {
      id
      challenge(ID: $challengeId) {
        id
        collaboration {
          ...CalloutWithCanvas
        }
      }
    }
  }
  ${CalloutWithCanvasFragmentDoc}
`;

/**
 * __useChallengeCanvasFromCalloutQuery__
 *
 * To run a query within a React component, call `useChallengeCanvasFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCanvasFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCanvasFromCalloutQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      challengeId: // value for 'challengeId'
 *      calloutId: // value for 'calloutId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useChallengeCanvasFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.ChallengeCanvasFromCalloutQuery,
    SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.ChallengeCanvasFromCalloutQuery,
    SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
  >(ChallengeCanvasFromCalloutDocument, options);
}

export function useChallengeCanvasFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.ChallengeCanvasFromCalloutQuery,
    SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.ChallengeCanvasFromCalloutQuery,
    SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
  >(ChallengeCanvasFromCalloutDocument, options);
}

export type ChallengeCanvasFromCalloutQueryHookResult = ReturnType<typeof useChallengeCanvasFromCalloutQuery>;
export type ChallengeCanvasFromCalloutLazyQueryHookResult = ReturnType<typeof useChallengeCanvasFromCalloutLazyQuery>;
export type ChallengeCanvasFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.ChallengeCanvasFromCalloutQuery,
  SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
>;
export function refetchChallengeCanvasFromCalloutQuery(
  variables: SchemaTypes.ChallengeCanvasFromCalloutQueryVariables
) {
  return { query: ChallengeCanvasFromCalloutDocument, variables: variables };
}

export const OpportunityCanvasFromCalloutDocument = gql`
  query opportunityCanvasFromCallout(
    $hubId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $canvasId: UUID_NAMEID!
  ) {
    hub(ID: $hubId) {
      id
      opportunity(ID: $opportunityId) {
        id
        collaboration {
          ...CalloutWithCanvas
        }
      }
    }
  }
  ${CalloutWithCanvasFragmentDoc}
`;

/**
 * __useOpportunityCanvasFromCalloutQuery__
 *
 * To run a query within a React component, call `useOpportunityCanvasFromCalloutQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCanvasFromCalloutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCanvasFromCalloutQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      opportunityId: // value for 'opportunityId'
 *      calloutId: // value for 'calloutId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useOpportunityCanvasFromCalloutQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.OpportunityCanvasFromCalloutQuery,
    SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.OpportunityCanvasFromCalloutQuery,
    SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
  >(OpportunityCanvasFromCalloutDocument, options);
}

export function useOpportunityCanvasFromCalloutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.OpportunityCanvasFromCalloutQuery,
    SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.OpportunityCanvasFromCalloutQuery,
    SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
  >(OpportunityCanvasFromCalloutDocument, options);
}

export type OpportunityCanvasFromCalloutQueryHookResult = ReturnType<typeof useOpportunityCanvasFromCalloutQuery>;
export type OpportunityCanvasFromCalloutLazyQueryHookResult = ReturnType<
  typeof useOpportunityCanvasFromCalloutLazyQuery
>;
export type OpportunityCanvasFromCalloutQueryResult = Apollo.QueryResult<
  SchemaTypes.OpportunityCanvasFromCalloutQuery,
  SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
>;
export function refetchOpportunityCanvasFromCalloutQuery(
  variables: SchemaTypes.OpportunityCanvasFromCalloutQueryVariables
) {
  return { query: OpportunityCanvasFromCalloutDocument, variables: variables };
}

export const HubTemplateCanvasValuesDocument = gql`
  query hubTemplateCanvasValues($hubId: UUID_NAMEID!, $canvasId: UUID!) {
    hub(ID: $hubId) {
      id
      templates {
        id
        whiteboardTemplate(ID: $canvasId) {
          id
          profile {
            ...CanvasProfile
          }
          value
        }
      }
    }
  }
  ${CanvasProfileFragmentDoc}
`;

/**
 * __useHubTemplateCanvasValuesQuery__
 *
 * To run a query within a React component, call `useHubTemplateCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubTemplateCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubTemplateCanvasValuesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function useHubTemplateCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubTemplateCanvasValuesQuery,
    SchemaTypes.HubTemplateCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubTemplateCanvasValuesQuery, SchemaTypes.HubTemplateCanvasValuesQueryVariables>(
    HubTemplateCanvasValuesDocument,
    options
  );
}

export function useHubTemplateCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubTemplateCanvasValuesQuery,
    SchemaTypes.HubTemplateCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubTemplateCanvasValuesQuery,
    SchemaTypes.HubTemplateCanvasValuesQueryVariables
  >(HubTemplateCanvasValuesDocument, options);
}

export type HubTemplateCanvasValuesQueryHookResult = ReturnType<typeof useHubTemplateCanvasValuesQuery>;
export type HubTemplateCanvasValuesLazyQueryHookResult = ReturnType<typeof useHubTemplateCanvasValuesLazyQuery>;
export type HubTemplateCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubTemplateCanvasValuesQuery,
  SchemaTypes.HubTemplateCanvasValuesQueryVariables
>;
export function refetchHubTemplateCanvasValuesQuery(variables: SchemaTypes.HubTemplateCanvasValuesQueryVariables) {
  return { query: HubTemplateCanvasValuesDocument, variables: variables };
}

export const PlatformTemplateCanvasValuesDocument = gql`
  query platformTemplateCanvasValues($innovationPackId: UUID_NAMEID!, $canvasId: UUID!) {
    platform {
      id
      library {
        id
        innovationPack(ID: $innovationPackId) {
          templates {
            id
            whiteboardTemplate(ID: $canvasId) {
              id
              profile {
                ...CanvasProfile
              }
              value
            }
          }
        }
      }
    }
  }
  ${CanvasProfileFragmentDoc}
`;

/**
 * __usePlatformTemplateCanvasValuesQuery__
 *
 * To run a query within a React component, call `usePlatformTemplateCanvasValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformTemplateCanvasValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformTemplateCanvasValuesQuery({
 *   variables: {
 *      innovationPackId: // value for 'innovationPackId'
 *      canvasId: // value for 'canvasId'
 *   },
 * });
 */
export function usePlatformTemplateCanvasValuesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.PlatformTemplateCanvasValuesQuery,
    SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.PlatformTemplateCanvasValuesQuery,
    SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
  >(PlatformTemplateCanvasValuesDocument, options);
}

export function usePlatformTemplateCanvasValuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.PlatformTemplateCanvasValuesQuery,
    SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.PlatformTemplateCanvasValuesQuery,
    SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
  >(PlatformTemplateCanvasValuesDocument, options);
}

export type PlatformTemplateCanvasValuesQueryHookResult = ReturnType<typeof usePlatformTemplateCanvasValuesQuery>;
export type PlatformTemplateCanvasValuesLazyQueryHookResult = ReturnType<
  typeof usePlatformTemplateCanvasValuesLazyQuery
>;
export type PlatformTemplateCanvasValuesQueryResult = Apollo.QueryResult<
  SchemaTypes.PlatformTemplateCanvasValuesQuery,
  SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
>;
export function refetchPlatformTemplateCanvasValuesQuery(
  variables: SchemaTypes.PlatformTemplateCanvasValuesQueryVariables
) {
  return { query: PlatformTemplateCanvasValuesDocument, variables: variables };
}

export const CreateCanvasOnCalloutDocument = gql`
  mutation createCanvasOnCallout($input: CreateCanvasOnCalloutInput!) {
    createCanvasOnCallout(canvasData: $input) {
      ...CanvasDetails
    }
  }
  ${CanvasDetailsFragmentDoc}
`;
export type CreateCanvasOnCalloutMutationFn = Apollo.MutationFunction<
  SchemaTypes.CreateCanvasOnCalloutMutation,
  SchemaTypes.CreateCanvasOnCalloutMutationVariables
>;

/**
 * __useCreateCanvasOnCalloutMutation__
 *
 * To run a mutation, you first call `useCreateCanvasOnCalloutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCanvasOnCalloutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCanvasOnCalloutMutation, { data, loading, error }] = useCreateCanvasOnCalloutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCanvasOnCalloutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CreateCanvasOnCalloutMutation,
    SchemaTypes.CreateCanvasOnCalloutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.CreateCanvasOnCalloutMutation,
    SchemaTypes.CreateCanvasOnCalloutMutationVariables
  >(CreateCanvasOnCalloutDocument, options);
}

export type CreateCanvasOnCalloutMutationHookResult = ReturnType<typeof useCreateCanvasOnCalloutMutation>;
export type CreateCanvasOnCalloutMutationResult = Apollo.MutationResult<SchemaTypes.CreateCanvasOnCalloutMutation>;
export type CreateCanvasOnCalloutMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CreateCanvasOnCalloutMutation,
  SchemaTypes.CreateCanvasOnCalloutMutationVariables
>;
export const DeleteCanvasDocument = gql`
  mutation deleteCanvas($input: DeleteCanvasInput!) {
    deleteCanvas(canvasData: $input) {
      id
    }
  }
`;
export type DeleteCanvasMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCanvasMutation,
  SchemaTypes.DeleteCanvasMutationVariables
>;

/**
 * __useDeleteCanvasMutation__
 *
 * To run a mutation, you first call `useDeleteCanvasMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCanvasMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCanvasMutation, { data, loading, error }] = useDeleteCanvasMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCanvasMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.DeleteCanvasMutation, SchemaTypes.DeleteCanvasMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteCanvasMutation, SchemaTypes.DeleteCanvasMutationVariables>(
    DeleteCanvasDocument,
    options
  );
}

export type DeleteCanvasMutationHookResult = ReturnType<typeof useDeleteCanvasMutation>;
export type DeleteCanvasMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCanvasMutation>;
export type DeleteCanvasMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCanvasMutation,
  SchemaTypes.DeleteCanvasMutationVariables
>;
export const UpdateCanvasDocument = gql`
  mutation updateCanvas($input: UpdateCanvasDirectInput!) {
    updateCanvas(canvasData: $input) {
      id
      value
      profile {
        id
        displayName
      }
    }
  }
`;
export type UpdateCanvasMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateCanvasMutation,
  SchemaTypes.UpdateCanvasMutationVariables
>;

/**
 * __useUpdateCanvasMutation__
 *
 * To run a mutation, you first call `useUpdateCanvasMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCanvasMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCanvasMutation, { data, loading, error }] = useUpdateCanvasMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCanvasMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.UpdateCanvasMutation, SchemaTypes.UpdateCanvasMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateCanvasMutation, SchemaTypes.UpdateCanvasMutationVariables>(
    UpdateCanvasDocument,
    options
  );
}

export type UpdateCanvasMutationHookResult = ReturnType<typeof useUpdateCanvasMutation>;
export type UpdateCanvasMutationResult = Apollo.MutationResult<SchemaTypes.UpdateCanvasMutation>;
export type UpdateCanvasMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateCanvasMutation,
  SchemaTypes.UpdateCanvasMutationVariables
>;
export const CheckoutCanvasDocument = gql`
  mutation checkoutCanvas($input: CanvasCheckoutEventInput!) {
    eventOnCanvasCheckout(canvasCheckoutEventData: $input) {
      ...CheckoutDetails
    }
  }
  ${CheckoutDetailsFragmentDoc}
`;
export type CheckoutCanvasMutationFn = Apollo.MutationFunction<
  SchemaTypes.CheckoutCanvasMutation,
  SchemaTypes.CheckoutCanvasMutationVariables
>;

/**
 * __useCheckoutCanvasMutation__
 *
 * To run a mutation, you first call `useCheckoutCanvasMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutCanvasMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutCanvasMutation, { data, loading, error }] = useCheckoutCanvasMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCheckoutCanvasMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.CheckoutCanvasMutation,
    SchemaTypes.CheckoutCanvasMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.CheckoutCanvasMutation, SchemaTypes.CheckoutCanvasMutationVariables>(
    CheckoutCanvasDocument,
    options
  );
}

export type CheckoutCanvasMutationHookResult = ReturnType<typeof useCheckoutCanvasMutation>;
export type CheckoutCanvasMutationResult = Apollo.MutationResult<SchemaTypes.CheckoutCanvasMutation>;
export type CheckoutCanvasMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.CheckoutCanvasMutation,
  SchemaTypes.CheckoutCanvasMutationVariables
>;
export const CanvasContentUpdatedDocument = gql`
  subscription canvasContentUpdated($canvasIDs: [UUID!]!) {
    canvasContentUpdated(canvasIDs: $canvasIDs) {
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
 *      canvasIDs: // value for 'canvasIDs'
 *   },
 * });
 */
export function useCanvasContentUpdatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
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
export const CanvasLockedByDetailsDocument = gql`
  query CanvasLockedByDetails($ids: [UUID!]!) {
    usersById(IDs: $ids) {
      ...LockedByDetails
    }
  }
  ${LockedByDetailsFragmentDoc}
`;

/**
 * __useCanvasLockedByDetailsQuery__
 *
 * To run a query within a React component, call `useCanvasLockedByDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanvasLockedByDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanvasLockedByDetailsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useCanvasLockedByDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CanvasLockedByDetailsQuery,
    SchemaTypes.CanvasLockedByDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.CanvasLockedByDetailsQuery, SchemaTypes.CanvasLockedByDetailsQueryVariables>(
    CanvasLockedByDetailsDocument,
    options
  );
}

export function useCanvasLockedByDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CanvasLockedByDetailsQuery,
    SchemaTypes.CanvasLockedByDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.CanvasLockedByDetailsQuery, SchemaTypes.CanvasLockedByDetailsQueryVariables>(
    CanvasLockedByDetailsDocument,
    options
  );
}

export type CanvasLockedByDetailsQueryHookResult = ReturnType<typeof useCanvasLockedByDetailsQuery>;
export type CanvasLockedByDetailsLazyQueryHookResult = ReturnType<typeof useCanvasLockedByDetailsLazyQuery>;
export type CanvasLockedByDetailsQueryResult = Apollo.QueryResult<
  SchemaTypes.CanvasLockedByDetailsQuery,
  SchemaTypes.CanvasLockedByDetailsQueryVariables
>;
export function refetchCanvasLockedByDetailsQuery(variables: SchemaTypes.CanvasLockedByDetailsQueryVariables) {
  return { query: CanvasLockedByDetailsDocument, variables: variables };
}

export const CalloutAspectCreatedDocument = gql`
  subscription CalloutAspectCreated($calloutID: UUID!) {
    calloutAspectCreated(calloutID: $calloutID) {
      aspect {
        ...ContributeTabAspect
      }
    }
  }
  ${ContributeTabAspectFragmentDoc}
`;

/**
 * __useCalloutAspectCreatedSubscription__
 *
 * To run a query within a React component, call `useCalloutAspectCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCalloutAspectCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutAspectCreatedSubscription({
 *   variables: {
 *      calloutID: // value for 'calloutID'
 *   },
 * });
 */
export function useCalloutAspectCreatedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CalloutAspectCreatedSubscription,
    SchemaTypes.CalloutAspectCreatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CalloutAspectCreatedSubscription,
    SchemaTypes.CalloutAspectCreatedSubscriptionVariables
  >(CalloutAspectCreatedDocument, options);
}

export type CalloutAspectCreatedSubscriptionHookResult = ReturnType<typeof useCalloutAspectCreatedSubscription>;
export type CalloutAspectCreatedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CalloutAspectCreatedSubscription>;
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
  query challengePreferences($hubNameId: UUID_NAMEID!, $challengeNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
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
 *      hubNameId: // value for 'hubNameId'
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
export const HubPreferencesDocument = gql`
  query hubPreferences($hubNameId: UUID_NAMEID!) {
    hub(ID: $hubNameId) {
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
 * __useHubPreferencesQuery__
 *
 * To run a query within a React component, call `useHubPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubPreferencesQuery({
 *   variables: {
 *      hubNameId: // value for 'hubNameId'
 *   },
 * });
 */
export function useHubPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubPreferencesQuery, SchemaTypes.HubPreferencesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubPreferencesQuery, SchemaTypes.HubPreferencesQueryVariables>(
    HubPreferencesDocument,
    options
  );
}

export function useHubPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubPreferencesQuery, SchemaTypes.HubPreferencesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubPreferencesQuery, SchemaTypes.HubPreferencesQueryVariables>(
    HubPreferencesDocument,
    options
  );
}

export type HubPreferencesQueryHookResult = ReturnType<typeof useHubPreferencesQuery>;
export type HubPreferencesLazyQueryHookResult = ReturnType<typeof useHubPreferencesLazyQuery>;
export type HubPreferencesQueryResult = Apollo.QueryResult<
  SchemaTypes.HubPreferencesQuery,
  SchemaTypes.HubPreferencesQueryVariables
>;
export function refetchHubPreferencesQuery(variables: SchemaTypes.HubPreferencesQueryVariables) {
  return { query: HubPreferencesDocument, variables: variables };
}

export const UpdatePreferenceOnHubDocument = gql`
  mutation updatePreferenceOnHub($preferenceData: UpdateHubPreferenceInput!) {
    updatePreferenceOnHub(preferenceData: $preferenceData) {
      id
      value
    }
  }
`;
export type UpdatePreferenceOnHubMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdatePreferenceOnHubMutation,
  SchemaTypes.UpdatePreferenceOnHubMutationVariables
>;

/**
 * __useUpdatePreferenceOnHubMutation__
 *
 * To run a mutation, you first call `useUpdatePreferenceOnHubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferenceOnHubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferenceOnHubMutation, { data, loading, error }] = useUpdatePreferenceOnHubMutation({
 *   variables: {
 *      preferenceData: // value for 'preferenceData'
 *   },
 * });
 */
export function useUpdatePreferenceOnHubMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdatePreferenceOnHubMutation,
    SchemaTypes.UpdatePreferenceOnHubMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SchemaTypes.UpdatePreferenceOnHubMutation,
    SchemaTypes.UpdatePreferenceOnHubMutationVariables
  >(UpdatePreferenceOnHubDocument, options);
}

export type UpdatePreferenceOnHubMutationHookResult = ReturnType<typeof useUpdatePreferenceOnHubMutation>;
export type UpdatePreferenceOnHubMutationResult = Apollo.MutationResult<SchemaTypes.UpdatePreferenceOnHubMutation>;
export type UpdatePreferenceOnHubMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdatePreferenceOnHubMutation,
  SchemaTypes.UpdatePreferenceOnHubMutationVariables
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
export const DeleteCommentDocument = gql`
  mutation deleteComment($messageData: DiscussionRemoveMessageInput!) {
    removeMessageFromDiscussion(messageData: $messageData)
  }
`;
export type DeleteCommentMutationFn = Apollo.MutationFunction<
  SchemaTypes.DeleteCommentMutation,
  SchemaTypes.DeleteCommentMutationVariables
>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useDeleteCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.DeleteCommentMutation,
    SchemaTypes.DeleteCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.DeleteCommentMutation, SchemaTypes.DeleteCommentMutationVariables>(
    DeleteCommentDocument,
    options
  );
}

export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<SchemaTypes.DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.DeleteCommentMutation,
  SchemaTypes.DeleteCommentMutationVariables
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
            visuals {
              ...VisualFull
            }
          }
          category
          timestamp
          commentsCount
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
          messages {
            ...MessageDetails
          }
        }
      }
    }
  }
  ${DiscussionDetailsFragmentDoc}
  ${MessageDetailsFragmentDoc}
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
      commentsCount
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
export const CommunityUserPrivilegesDocument = gql`
  query communityUserPrivileges($hubNameId: UUID_NAMEID!, $communityId: UUID!) {
    hub(ID: $hubNameId) {
      id
      hubCommunity: community {
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
 *      hubNameId: // value for 'hubNameId'
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

export const HubApplicationDocument = gql`
  query hubApplication($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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

export const CommunityApplicationFormDocument = gql`
  query CommunityApplicationForm(
    $hubId: UUID_NAMEID!
    $challengeId: UUID_NAMEID = "mockid"
    $isHub: Boolean = false
    $isChallenge: Boolean = false
  ) {
    hub(ID: $hubId) {
      id
      ... on Hub @include(if: $isHub) {
        community {
          id
          applicationForm {
            ...ApplicationForm
          }
        }
      }
      ... on Hub @include(if: $isChallenge) {
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
 *      hubId: // value for 'hubId'
 *      challengeId: // value for 'challengeId'
 *      isHub: // value for 'isHub'
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
  query challengeCommunity($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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

export const HubCommunityDocument = gql`
  query hubCommunity($hubId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    hub(ID: $hubId) {
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
 *      includeDetails: // value for 'includeDetails'
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

export const OpportunityCommunityDocument = gql`
  query opportunityCommunity($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!, $includeDetails: Boolean = false) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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

export const HubCommunityContributorsDocument = gql`
  query HubCommunityContributors($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      host {
        ...OrganizationCard
      }
      community {
        id
        leadUsers {
          ...UserCard
        }
        memberUsers {
          ...UserCard
        }
        memberOrganizations {
          ...OrganizationCard
        }
      }
    }
  }
  ${OrganizationCardFragmentDoc}
  ${UserCardFragmentDoc}
`;

/**
 * __useHubCommunityContributorsQuery__
 *
 * To run a query within a React component, call `useHubCommunityContributorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCommunityContributorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCommunityContributorsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCommunityContributorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubCommunityContributorsQuery,
    SchemaTypes.HubCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCommunityContributorsQuery, SchemaTypes.HubCommunityContributorsQueryVariables>(
    HubCommunityContributorsDocument,
    options
  );
}

export function useHubCommunityContributorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCommunityContributorsQuery,
    SchemaTypes.HubCommunityContributorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubCommunityContributorsQuery,
    SchemaTypes.HubCommunityContributorsQueryVariables
  >(HubCommunityContributorsDocument, options);
}

export type HubCommunityContributorsQueryHookResult = ReturnType<typeof useHubCommunityContributorsQuery>;
export type HubCommunityContributorsLazyQueryHookResult = ReturnType<typeof useHubCommunityContributorsLazyQuery>;
export type HubCommunityContributorsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCommunityContributorsQuery,
  SchemaTypes.HubCommunityContributorsQueryVariables
>;
export function refetchHubCommunityContributorsQuery(variables: SchemaTypes.HubCommunityContributorsQueryVariables) {
  return { query: HubCommunityContributorsDocument, variables: variables };
}

export const ChallengeCommunityContributorsDocument = gql`
  query ChallengeCommunityContributors($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
  query OpportunityCommunityContributors($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
          id
          tags
        }
      }
    }
  }
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

export const ChallengesWithCommunityDocument = gql`
  query challengesWithCommunity($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
  query challengeCommunityMembers($hubId: UUID_NAMEID!, $challengeId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      challenge(ID: $challengeId) {
        id
        community {
          id
          memberUsers {
            ...CommunityMemberUser
          }
          leadUsers {
            ...CommunityMemberUser
          }
          memberOrganizations {
            ...OrganizationDetails
          }
          leadOrganizations {
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
 *      hubId: // value for 'hubId'
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

export const HubCommunityMembersDocument = gql`
  query hubCommunityMembers($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      community {
        id
        memberUsers {
          ...CommunityMemberUser
        }
        leadUsers {
          ...CommunityMemberUser
        }
        memberOrganizations {
          ...OrganizationDetails
        }
        leadOrganizations {
          ...OrganizationDetails
        }
      }
      host {
        ...OrganizationDetails
      }
    }
  }
  ${CommunityMemberUserFragmentDoc}
  ${OrganizationDetailsFragmentDoc}
`;

/**
 * __useHubCommunityMembersQuery__
 *
 * To run a query within a React component, call `useHubCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCommunityMembersQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCommunityMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubCommunityMembersQuery,
    SchemaTypes.HubCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCommunityMembersQuery, SchemaTypes.HubCommunityMembersQueryVariables>(
    HubCommunityMembersDocument,
    options
  );
}

export function useHubCommunityMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCommunityMembersQuery,
    SchemaTypes.HubCommunityMembersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCommunityMembersQuery, SchemaTypes.HubCommunityMembersQueryVariables>(
    HubCommunityMembersDocument,
    options
  );
}

export type HubCommunityMembersQueryHookResult = ReturnType<typeof useHubCommunityMembersQuery>;
export type HubCommunityMembersLazyQueryHookResult = ReturnType<typeof useHubCommunityMembersLazyQuery>;
export type HubCommunityMembersQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCommunityMembersQuery,
  SchemaTypes.HubCommunityMembersQueryVariables
>;
export function refetchHubCommunityMembersQuery(variables: SchemaTypes.HubCommunityMembersQueryVariables) {
  return { query: HubCommunityMembersDocument, variables: variables };
}

export const AssignUserAsCommunityMemberDocument = gql`
  mutation assignUserAsCommunityMember($communityId: UUID!, $memberId: UUID_NAMEID_EMAIL!) {
    assignUserAsCommunityMember(membershipData: { communityID: $communityId, userID: $memberId }) {
      id
      displayName
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
    assignUserAsCommunityLead(leadershipData: { communityID: $communityId, userID: $memberId }) {
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
    removeUserAsCommunityMember(membershipData: { communityID: $communityId, userID: $memberId }) {
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
    removeUserAsCommunityLead(leadershipData: { communityID: $communityId, userID: $memberId }) {
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
    assignOrganizationAsCommunityMember(membershipData: { communityID: $communityId, organizationID: $memberId }) {
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
    assignOrganizationAsCommunityLead(leadershipData: { communityID: $communityId, organizationID: $memberId }) {
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
    removeOrganizationAsCommunityMember(membershipData: { communityID: $communityId, organizationID: $memberId }) {
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
    removeOrganizationAsCommunityLead(leadershipData: { communityID: $communityId, organizationID: $memberId }) {
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
export const OpportunityCommunityMembersDocument = gql`
  query opportunityCommunityMembers($hubId: UUID_NAMEID!, $opportunityId: UUID_NAMEID!) {
    hub(ID: $hubId) {
      id
      opportunity(ID: $opportunityId) {
        id
        community {
          id
          memberUsers {
            ...CommunityMemberUser
          }
          leadUsers {
            ...CommunityMemberUser
          }
          memberOrganizations {
            ...OrganizationDetails
          }
          leadOrganizations {
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
 *      hubId: // value for 'hubId'
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
      hubs {
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
          profile {
            id
            displayName
          }
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

export const HubContributionDetailsDocument = gql`
  query hubContributionDetails($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
          id
          name
          tags
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
        profile {
          id
          displayName
          tagset {
            id
            name
            tags
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
        profile {
          id
          displayName
          tagset {
            id
            name
            tags
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
    hubs(filter: { visibilities: [ACTIVE] }) {
      id
      nameID
      profile {
        id
        displayName
        tagline
        tagset {
          id
          tags
        }
        banner: visual(type: BANNER) {
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
      ... on Hub @include(if: $includeMembershipStatus) {
        community {
          id
          myMembershipStatus
        }
      }
      visibility
    }
  }
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
      hubs {
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
  query ChallengeExplorerData($hubIDs: [UUID!], $challengeIDs: [UUID!]) {
    hubs(IDs: $hubIDs) {
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
            id
            tags
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
 *      hubIDs: // value for 'hubIDs'
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

export const HubAvailableLeadUsersDocument = gql`
  query HubAvailableLeadUsers($hubId: UUID_NAMEID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    hub(ID: $hubId) {
      community {
        ...CommunityAvailableLeadUsers
      }
    }
  }
  ${CommunityAvailableLeadUsersFragmentDoc}
`;

/**
 * __useHubAvailableLeadUsersQuery__
 *
 * To run a query within a React component, call `useHubAvailableLeadUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubAvailableLeadUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubAvailableLeadUsersQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useHubAvailableLeadUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubAvailableLeadUsersQuery,
    SchemaTypes.HubAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubAvailableLeadUsersQuery, SchemaTypes.HubAvailableLeadUsersQueryVariables>(
    HubAvailableLeadUsersDocument,
    options
  );
}

export function useHubAvailableLeadUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubAvailableLeadUsersQuery,
    SchemaTypes.HubAvailableLeadUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubAvailableLeadUsersQuery, SchemaTypes.HubAvailableLeadUsersQueryVariables>(
    HubAvailableLeadUsersDocument,
    options
  );
}

export type HubAvailableLeadUsersQueryHookResult = ReturnType<typeof useHubAvailableLeadUsersQuery>;
export type HubAvailableLeadUsersLazyQueryHookResult = ReturnType<typeof useHubAvailableLeadUsersLazyQuery>;
export type HubAvailableLeadUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.HubAvailableLeadUsersQuery,
  SchemaTypes.HubAvailableLeadUsersQueryVariables
>;
export function refetchHubAvailableLeadUsersQuery(variables: SchemaTypes.HubAvailableLeadUsersQueryVariables) {
  return { query: HubAvailableLeadUsersDocument, variables: variables };
}

export const HubAvailableMemberUsersDocument = gql`
  query HubAvailableMemberUsers($hubId: UUID_NAMEID!, $first: Int!, $after: UUID, $filter: UserFilterInput) {
    hub(ID: $hubId) {
      community {
        ...CommunityAvailableMemberUsers
      }
    }
  }
  ${CommunityAvailableMemberUsersFragmentDoc}
`;

/**
 * __useHubAvailableMemberUsersQuery__
 *
 * To run a query within a React component, call `useHubAvailableMemberUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubAvailableMemberUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubAvailableMemberUsersQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useHubAvailableMemberUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubAvailableMemberUsersQuery,
    SchemaTypes.HubAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubAvailableMemberUsersQuery, SchemaTypes.HubAvailableMemberUsersQueryVariables>(
    HubAvailableMemberUsersDocument,
    options
  );
}

export function useHubAvailableMemberUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubAvailableMemberUsersQuery,
    SchemaTypes.HubAvailableMemberUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubAvailableMemberUsersQuery,
    SchemaTypes.HubAvailableMemberUsersQueryVariables
  >(HubAvailableMemberUsersDocument, options);
}

export type HubAvailableMemberUsersQueryHookResult = ReturnType<typeof useHubAvailableMemberUsersQuery>;
export type HubAvailableMemberUsersLazyQueryHookResult = ReturnType<typeof useHubAvailableMemberUsersLazyQuery>;
export type HubAvailableMemberUsersQueryResult = Apollo.QueryResult<
  SchemaTypes.HubAvailableMemberUsersQuery,
  SchemaTypes.HubAvailableMemberUsersQueryVariables
>;
export function refetchHubAvailableMemberUsersQuery(variables: SchemaTypes.HubAvailableMemberUsersQueryVariables) {
  return { query: HubAvailableMemberUsersDocument, variables: variables };
}

export const ChallengeAvailableLeadUsersDocument = gql`
  query ChallengeAvailableLeadUsers(
    $hubId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
    $hubId: UUID_NAMEID!
    $challengeId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
    $hubId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
    $hubId: UUID_NAMEID!
    $opportunityId: UUID_NAMEID!
    $first: Int!
    $after: UUID
    $filter: UserFilterInput
  ) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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

export const UpdateHubVisibilityDocument = gql`
  mutation UpdateHubVisibility($hubId: String!, $visibility: HubVisibility!) {
    updateHubVisibility(visibilityData: { hubID: $hubId, visibility: $visibility }) {
      id
      visibility
    }
  }
`;
export type UpdateHubVisibilityMutationFn = Apollo.MutationFunction<
  SchemaTypes.UpdateHubVisibilityMutation,
  SchemaTypes.UpdateHubVisibilityMutationVariables
>;

/**
 * __useUpdateHubVisibilityMutation__
 *
 * To run a mutation, you first call `useUpdateHubVisibilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHubVisibilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHubVisibilityMutation, { data, loading, error }] = useUpdateHubVisibilityMutation({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function useUpdateHubVisibilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.UpdateHubVisibilityMutation,
    SchemaTypes.UpdateHubVisibilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.UpdateHubVisibilityMutation, SchemaTypes.UpdateHubVisibilityMutationVariables>(
    UpdateHubVisibilityDocument,
    options
  );
}

export type UpdateHubVisibilityMutationHookResult = ReturnType<typeof useUpdateHubVisibilityMutation>;
export type UpdateHubVisibilityMutationResult = Apollo.MutationResult<SchemaTypes.UpdateHubVisibilityMutation>;
export type UpdateHubVisibilityMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.UpdateHubVisibilityMutation,
  SchemaTypes.UpdateHubVisibilityMutationVariables
>;
export const AdminHubsListDocument = gql`
  query adminHubsList {
    hubs(filter: { visibilities: [ARCHIVED, ACTIVE, DEMO] }) {
      ...AdminHub
      visibility
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

export const HubStorageAdminDocument = gql`
  query HubStorageAdmin($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubStorageAdminQuery__
 *
 * To run a query within a React component, call `useHubStorageAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubStorageAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubStorageAdminQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubStorageAdminQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubStorageAdminQuery, SchemaTypes.HubStorageAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubStorageAdminQuery, SchemaTypes.HubStorageAdminQueryVariables>(
    HubStorageAdminDocument,
    options
  );
}

export function useHubStorageAdminLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SchemaTypes.HubStorageAdminQuery, SchemaTypes.HubStorageAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubStorageAdminQuery, SchemaTypes.HubStorageAdminQueryVariables>(
    HubStorageAdminDocument,
    options
  );
}

export type HubStorageAdminQueryHookResult = ReturnType<typeof useHubStorageAdminQuery>;
export type HubStorageAdminLazyQueryHookResult = ReturnType<typeof useHubStorageAdminLazyQuery>;
export type HubStorageAdminQueryResult = Apollo.QueryResult<
  SchemaTypes.HubStorageAdminQuery,
  SchemaTypes.HubStorageAdminQueryVariables
>;
export function refetchHubStorageAdminQuery(variables: SchemaTypes.HubStorageAdminQueryVariables) {
  return { query: HubStorageAdminDocument, variables: variables };
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

export const AdminHubTemplatesDocument = gql`
  query AdminHubTemplates($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useAdminHubTemplatesQuery__
 *
 * To run a query within a React component, call `useAdminHubTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminHubTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminHubTemplatesQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useAdminHubTemplatesQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.AdminHubTemplatesQuery, SchemaTypes.AdminHubTemplatesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.AdminHubTemplatesQuery, SchemaTypes.AdminHubTemplatesQueryVariables>(
    AdminHubTemplatesDocument,
    options
  );
}

export function useAdminHubTemplatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.AdminHubTemplatesQuery,
    SchemaTypes.AdminHubTemplatesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.AdminHubTemplatesQuery, SchemaTypes.AdminHubTemplatesQueryVariables>(
    AdminHubTemplatesDocument,
    options
  );
}

export type AdminHubTemplatesQueryHookResult = ReturnType<typeof useAdminHubTemplatesQuery>;
export type AdminHubTemplatesLazyQueryHookResult = ReturnType<typeof useAdminHubTemplatesLazyQuery>;
export type AdminHubTemplatesQueryResult = Apollo.QueryResult<
  SchemaTypes.AdminHubTemplatesQuery,
  SchemaTypes.AdminHubTemplatesQueryVariables
>;
export function refetchAdminHubTemplatesQuery(variables: SchemaTypes.AdminHubTemplatesQueryVariables) {
  return { query: AdminHubTemplatesDocument, variables: variables };
}

export const HubTemplatesAdminWhiteboardTemplateWithValueDocument = gql`
  query HubTemplatesAdminWhiteboardTemplateWithValue($hubId: UUID_NAMEID!, $whiteboardTemplateId: UUID!) {
    hub(ID: $hubId) {
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
 * __useHubTemplatesAdminWhiteboardTemplateWithValueQuery__
 *
 * To run a query within a React component, call `useHubTemplatesAdminWhiteboardTemplateWithValueQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubTemplatesAdminWhiteboardTemplateWithValueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubTemplatesAdminWhiteboardTemplateWithValueQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      whiteboardTemplateId: // value for 'whiteboardTemplateId'
 *   },
 * });
 */
export function useHubTemplatesAdminWhiteboardTemplateWithValueQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >(HubTemplatesAdminWhiteboardTemplateWithValueDocument, options);
}

export function useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQuery,
    SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
  >(HubTemplatesAdminWhiteboardTemplateWithValueDocument, options);
}

export type HubTemplatesAdminWhiteboardTemplateWithValueQueryHookResult = ReturnType<
  typeof useHubTemplatesAdminWhiteboardTemplateWithValueQuery
>;
export type HubTemplatesAdminWhiteboardTemplateWithValueLazyQueryHookResult = ReturnType<
  typeof useHubTemplatesAdminWhiteboardTemplateWithValueLazyQuery
>;
export type HubTemplatesAdminWhiteboardTemplateWithValueQueryResult = Apollo.QueryResult<
  SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQuery,
  SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
>;
export function refetchHubTemplatesAdminWhiteboardTemplateWithValueQuery(
  variables: SchemaTypes.HubTemplatesAdminWhiteboardTemplateWithValueQueryVariables
) {
  return { query: HubTemplatesAdminWhiteboardTemplateWithValueDocument, variables: variables };
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
        ... on SearchResultHub {
          ...SearchResultHub
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
        ... on SearchResultCard {
          ...SearchResultCard
        }
      }
      contributionResultsCount
    }
  }
  ${SearchResultHubFragmentDoc}
  ${SearchResultChallengeFragmentDoc}
  ${SearchResultOpportunityFragmentDoc}
  ${SearchResultUserFragmentDoc}
  ${SearchResultOrganizationFragmentDoc}
  ${SearchResultCardFragmentDoc}
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
      hubs {
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
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeHub: // value for 'includeHub'
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
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
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
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeHub: // value for 'includeHub'
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

export const CalloutAspectStorageConfigDocument = gql`
  query CalloutAspectStorageConfig(
    $aspectId: UUID_NAMEID!
    $calloutId: UUID_NAMEID!
    $hubNameId: UUID_NAMEID!
    $challengeNameId: UUID_NAMEID = "mockid"
    $opportunityNameId: UUID_NAMEID = "mockid"
    $includeHub: Boolean = false
    $includeChallenge: Boolean = false
    $includeOpportunity: Boolean = false
  ) {
    hub(ID: $hubNameId) {
      id
      ... on Hub @include(if: $includeHub) {
        collaboration {
          ...AspectInCalloutOnCollaborationWithStorageConfig
        }
      }
      challenge(ID: $challengeNameId) @include(if: $includeChallenge) {
        id
        collaboration {
          ...AspectInCalloutOnCollaborationWithStorageConfig
        }
      }
      opportunity(ID: $opportunityNameId) @include(if: $includeOpportunity) {
        id
        collaboration {
          ...AspectInCalloutOnCollaborationWithStorageConfig
        }
      }
    }
  }
  ${AspectInCalloutOnCollaborationWithStorageConfigFragmentDoc}
`;

/**
 * __useCalloutAspectStorageConfigQuery__
 *
 * To run a query within a React component, call `useCalloutAspectStorageConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useCalloutAspectStorageConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalloutAspectStorageConfigQuery({
 *   variables: {
 *      aspectId: // value for 'aspectId'
 *      calloutId: // value for 'calloutId'
 *      hubNameId: // value for 'hubNameId'
 *      challengeNameId: // value for 'challengeNameId'
 *      opportunityNameId: // value for 'opportunityNameId'
 *      includeHub: // value for 'includeHub'
 *      includeChallenge: // value for 'includeChallenge'
 *      includeOpportunity: // value for 'includeOpportunity'
 *   },
 * });
 */
export function useCalloutAspectStorageConfigQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.CalloutAspectStorageConfigQuery,
    SchemaTypes.CalloutAspectStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.CalloutAspectStorageConfigQuery,
    SchemaTypes.CalloutAspectStorageConfigQueryVariables
  >(CalloutAspectStorageConfigDocument, options);
}

export function useCalloutAspectStorageConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.CalloutAspectStorageConfigQuery,
    SchemaTypes.CalloutAspectStorageConfigQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.CalloutAspectStorageConfigQuery,
    SchemaTypes.CalloutAspectStorageConfigQueryVariables
  >(CalloutAspectStorageConfigDocument, options);
}

export type CalloutAspectStorageConfigQueryHookResult = ReturnType<typeof useCalloutAspectStorageConfigQuery>;
export type CalloutAspectStorageConfigLazyQueryHookResult = ReturnType<typeof useCalloutAspectStorageConfigLazyQuery>;
export type CalloutAspectStorageConfigQueryResult = Apollo.QueryResult<
  SchemaTypes.CalloutAspectStorageConfigQuery,
  SchemaTypes.CalloutAspectStorageConfigQueryVariables
>;
export function refetchCalloutAspectStorageConfigQuery(
  variables: SchemaTypes.CalloutAspectStorageConfigQueryVariables
) {
  return { query: CalloutAspectStorageConfigDocument, variables: variables };
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
export const PostCommentDocument = gql`
  mutation PostComment($messageData: CommentsSendMessageInput!) {
    sendComment(messageData: $messageData) {
      id
      message
      sender {
        id
      }
      timestamp
    }
  }
`;
export type PostCommentMutationFn = Apollo.MutationFunction<
  SchemaTypes.PostCommentMutation,
  SchemaTypes.PostCommentMutationVariables
>;

/**
 * __usePostCommentMutation__
 *
 * To run a mutation, you first call `usePostCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postCommentMutation, { data, loading, error }] = usePostCommentMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function usePostCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<SchemaTypes.PostCommentMutation, SchemaTypes.PostCommentMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.PostCommentMutation, SchemaTypes.PostCommentMutationVariables>(
    PostCommentDocument,
    options
  );
}

export type PostCommentMutationHookResult = ReturnType<typeof usePostCommentMutation>;
export type PostCommentMutationResult = Apollo.MutationResult<SchemaTypes.PostCommentMutation>;
export type PostCommentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.PostCommentMutation,
  SchemaTypes.PostCommentMutationVariables
>;
export const RemoveCommentDocument = gql`
  mutation RemoveComment($messageData: CommentsRemoveMessageInput!) {
    removeComment(messageData: $messageData)
  }
`;
export type RemoveCommentMutationFn = Apollo.MutationFunction<
  SchemaTypes.RemoveCommentMutation,
  SchemaTypes.RemoveCommentMutationVariables
>;

/**
 * __useRemoveCommentMutation__
 *
 * To run a mutation, you first call `useRemoveCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommentMutation, { data, loading, error }] = useRemoveCommentMutation({
 *   variables: {
 *      messageData: // value for 'messageData'
 *   },
 * });
 */
export function useRemoveCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SchemaTypes.RemoveCommentMutation,
    SchemaTypes.RemoveCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SchemaTypes.RemoveCommentMutation, SchemaTypes.RemoveCommentMutationVariables>(
    RemoveCommentDocument,
    options
  );
}

export type RemoveCommentMutationHookResult = ReturnType<typeof useRemoveCommentMutation>;
export type RemoveCommentMutationResult = Apollo.MutationResult<SchemaTypes.RemoveCommentMutation>;
export type RemoveCommentMutationOptions = Apollo.BaseMutationOptions<
  SchemaTypes.RemoveCommentMutation,
  SchemaTypes.RemoveCommentMutationVariables
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
export const HubDashboardCalendarEventsDocument = gql`
  query hubDashboardCalendarEvents($hubId: UUID_NAMEID!, $limit: Float) {
    hub(ID: $hubId) {
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
 * __useHubDashboardCalendarEventsQuery__
 *
 * To run a query within a React component, call `useHubDashboardCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubDashboardCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubDashboardCalendarEventsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useHubDashboardCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SchemaTypes.HubDashboardCalendarEventsQuery,
    SchemaTypes.HubDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SchemaTypes.HubDashboardCalendarEventsQuery,
    SchemaTypes.HubDashboardCalendarEventsQueryVariables
  >(HubDashboardCalendarEventsDocument, options);
}

export function useHubDashboardCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubDashboardCalendarEventsQuery,
    SchemaTypes.HubDashboardCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SchemaTypes.HubDashboardCalendarEventsQuery,
    SchemaTypes.HubDashboardCalendarEventsQueryVariables
  >(HubDashboardCalendarEventsDocument, options);
}

export type HubDashboardCalendarEventsQueryHookResult = ReturnType<typeof useHubDashboardCalendarEventsQuery>;
export type HubDashboardCalendarEventsLazyQueryHookResult = ReturnType<typeof useHubDashboardCalendarEventsLazyQuery>;
export type HubDashboardCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubDashboardCalendarEventsQuery,
  SchemaTypes.HubDashboardCalendarEventsQueryVariables
>;
export function refetchHubDashboardCalendarEventsQuery(
  variables: SchemaTypes.HubDashboardCalendarEventsQueryVariables
) {
  return { query: HubDashboardCalendarEventsDocument, variables: variables };
}

export const HubCalendarEventsDocument = gql`
  query hubCalendarEvents($hubId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 * __useHubCalendarEventsQuery__
 *
 * To run a query within a React component, call `useHubCalendarEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHubCalendarEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHubCalendarEventsQuery({
 *   variables: {
 *      hubId: // value for 'hubId'
 *   },
 * });
 */
export function useHubCalendarEventsQuery(
  baseOptions: Apollo.QueryHookOptions<SchemaTypes.HubCalendarEventsQuery, SchemaTypes.HubCalendarEventsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SchemaTypes.HubCalendarEventsQuery, SchemaTypes.HubCalendarEventsQueryVariables>(
    HubCalendarEventsDocument,
    options
  );
}

export function useHubCalendarEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SchemaTypes.HubCalendarEventsQuery,
    SchemaTypes.HubCalendarEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SchemaTypes.HubCalendarEventsQuery, SchemaTypes.HubCalendarEventsQueryVariables>(
    HubCalendarEventsDocument,
    options
  );
}

export type HubCalendarEventsQueryHookResult = ReturnType<typeof useHubCalendarEventsQuery>;
export type HubCalendarEventsLazyQueryHookResult = ReturnType<typeof useHubCalendarEventsLazyQuery>;
export type HubCalendarEventsQueryResult = Apollo.QueryResult<
  SchemaTypes.HubCalendarEventsQuery,
  SchemaTypes.HubCalendarEventsQueryVariables
>;
export function refetchHubCalendarEventsQuery(variables: SchemaTypes.HubCalendarEventsQueryVariables) {
  return { query: HubCalendarEventsDocument, variables: variables };
}

export const CalendarEventDetailsDocument = gql`
  query calendarEventDetails($hubId: UUID_NAMEID!, $eventId: UUID_NAMEID!) {
    hub(ID: $hubId) {
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
 *      hubId: // value for 'hubId'
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
export const CalendarEventCommentsMessageReceivedDocument = gql`
  subscription CalendarEventCommentsMessageReceived($calendarEventID: UUID!) {
    calendarEventCommentsMessageReceived(calendarEventID: $calendarEventID) {
      message {
        ...MessageDetails
      }
    }
  }
  ${MessageDetailsFragmentDoc}
`;

/**
 * __useCalendarEventCommentsMessageReceivedSubscription__
 *
 * To run a query within a React component, call `useCalendarEventCommentsMessageReceivedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCalendarEventCommentsMessageReceivedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCalendarEventCommentsMessageReceivedSubscription({
 *   variables: {
 *      calendarEventID: // value for 'calendarEventID'
 *   },
 * });
 */
export function useCalendarEventCommentsMessageReceivedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SchemaTypes.CalendarEventCommentsMessageReceivedSubscription,
    SchemaTypes.CalendarEventCommentsMessageReceivedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SchemaTypes.CalendarEventCommentsMessageReceivedSubscription,
    SchemaTypes.CalendarEventCommentsMessageReceivedSubscriptionVariables
  >(CalendarEventCommentsMessageReceivedDocument, options);
}

export type CalendarEventCommentsMessageReceivedSubscriptionHookResult = ReturnType<
  typeof useCalendarEventCommentsMessageReceivedSubscription
>;
export type CalendarEventCommentsMessageReceivedSubscriptionResult =
  Apollo.SubscriptionResult<SchemaTypes.CalendarEventCommentsMessageReceivedSubscription>;
