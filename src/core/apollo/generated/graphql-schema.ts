export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DID: string;
  DateTime: Date;
  Emoji: string;
  JSON: string;
  LifecycleDefinition: string;
  Markdown: string;
  MessageID: string;
  NameID: string;
  UUID: string;
  Upload: File;
  WhiteboardContent: string;
};

export type Apm = {
  __typename?: 'APM';
  /** Endpoint where events are sent. */
  endpoint: Scalars['String'];
  /** Flag indicating if real user monitoring is enabled. */
  rumEnabled: Scalars['Boolean'];
};

export type Account = {
  __typename?: 'Account';
  /** The Agent representing this Account. */
  agent: Agent;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The external subscription ID for this Account. */
  externalSubscriptionID?: Maybe<Scalars['String']>;
  /** The Account host. */
  host?: Maybe<Contributor>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationHubs for this Account. */
  innovationHubs: Array<InnovationHub>;
  /** The InnovationPacks for this Account. */
  innovationPacks: Array<InnovationPack>;
  /** The License operating on this Account. */
  license: License;
  /** The Spaces within this Account. */
  spaces: Array<Space>;
  /** The StorageAggregator in use by this Account */
  storageAggregator: StorageAggregator;
  /** The subscriptions active for this Account. */
  subscriptions: Array<AccountSubscription>;
  /** A type of entity that this Account is being used with. */
  type?: Maybe<AccountType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The virtual contributors for this Account. */
  virtualContributors: Array<VirtualContributor>;
};

export type AccountAuthorizationResetInput = {
  /** The identifier of the Account whose Authorization Policy should be reset. */
  accountID: Scalars['UUID'];
};

export type AccountLicenseResetInput = {
  /** The identifier of the Account whose License and Entitlements should be reset. */
  accountID: Scalars['UUID'];
};

export type AccountSubscription = {
  __typename?: 'AccountSubscription';
  /** The expiry date of this subscription, null if it does never expire. */
  expires?: Maybe<Scalars['DateTime']>;
  /** The name of the Subscription. */
  name: LicensingCredentialBasedCredentialType;
};

export enum AccountType {
  Organization = 'ORGANIZATION',
  User = 'USER',
}

export type ActivityCreatedSubscriptionInput = {
  /** The collaboration on which to subscribe for new activity */
  collaborationID: Scalars['UUID'];
  /** Include activities happened on child Collaborations. */
  includeChild?: InputMaybe<Scalars['Boolean']>;
  /** Which activity types to include in the results. Returns all by default. */
  types?: InputMaybe<Array<ActivityEventType>>;
};

export type ActivityCreatedSubscriptionResult = {
  __typename?: 'ActivityCreatedSubscriptionResult';
  /** The newly created activity */
  activity: ActivityLogEntry;
};

export enum ActivityEventType {
  CalendarEventCreated = 'CALENDAR_EVENT_CREATED',
  CalloutLinkCreated = 'CALLOUT_LINK_CREATED',
  CalloutPostComment = 'CALLOUT_POST_COMMENT',
  CalloutPostCreated = 'CALLOUT_POST_CREATED',
  CalloutPublished = 'CALLOUT_PUBLISHED',
  CalloutWhiteboardContentModified = 'CALLOUT_WHITEBOARD_CONTENT_MODIFIED',
  CalloutWhiteboardCreated = 'CALLOUT_WHITEBOARD_CREATED',
  ChallengeCreated = 'CHALLENGE_CREATED',
  DiscussionComment = 'DISCUSSION_COMMENT',
  MemberJoined = 'MEMBER_JOINED',
  OpportunityCreated = 'OPPORTUNITY_CREATED',
  UpdateSent = 'UPDATE_SENT',
}

export type ActivityFeed = {
  __typename?: 'ActivityFeed';
  activityFeed: Array<ActivityLogEntry>;
  pageInfo: PageInfo;
  total: Scalars['Float'];
};

export type ActivityFeedGroupedQueryArgs = {
  /** What events to exclude. */
  excludeTypes?: InputMaybe<Array<ActivityEventType>>;
  /** Number of activities to return. */
  limit?: InputMaybe<Scalars['Float']>;
  /** Returns only events that the current user triggered; Includes all by default. */
  myActivity?: InputMaybe<Scalars['Boolean']>;
  /** Activity from which Spaces to include; Includes all by default. */
  roles?: InputMaybe<Array<ActivityFeedRoles>>;
  /** Activity from which Spaces to include; Includes all by default. */
  spaceIds?: InputMaybe<Array<Scalars['UUID']>>;
  /** What events to include; Includes all by default. */
  types?: InputMaybe<Array<ActivityEventType>>;
};

export type ActivityFeedQueryArgs = {
  /** What events to exclude. */
  excludeTypes?: InputMaybe<Array<ActivityEventType>>;
  /** Returns only events that the current user triggered; Includes all by default. */
  myActivity?: InputMaybe<Scalars['Boolean']>;
  /** Activity from which Spaces to include; Includes all by default. */
  roles?: InputMaybe<Array<ActivityFeedRoles>>;
  /** Activity from which Spaces to include; Includes all by default. */
  spaceIds?: InputMaybe<Array<Scalars['UUID']>>;
  /** What events to include; Includes all by default. */
  types?: InputMaybe<Array<ActivityEventType>>;
};

export enum ActivityFeedRoles {
  Admin = 'ADMIN',
  Lead = 'LEAD',
  Member = 'MEMBER',
}

export type ActivityLogEntry = {
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalendarEventCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalendarEventCreated';
  /** The Calendar in which the CalendarEvent was created. */
  calendar: Calendar;
  /** The CalendarEvent that was created. */
  calendarEvent: CalendarEvent;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutDiscussionComment = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutDiscussionComment';
  /** The Callout in which the comment was added. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutLinkCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutLinkCreated';
  /** The Callout in which the Link was created. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The Link that was created. */
  link: Link;
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutPostComment = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutPostComment';
  /** The Callout in which the Post was commented. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Post that was commented on. */
  post: Post;
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutPostCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutPostCreated';
  /** The Callout in which the Post was created. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Post that was created. */
  post: Post;
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutPublished = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutPublished';
  /** The Callout that was published. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryCalloutWhiteboardContentModified = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
  /** The Callout in which the Whiteboard was updated. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
  /** The Whiteboard that was updated. */
  whiteboard: Whiteboard;
};

export type ActivityLogEntryCalloutWhiteboardCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
  /** The Callout in which the Whiteboard was created. */
  callout: Callout;
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
  /** The Whiteboard that was created. */
  whiteboard: Whiteboard;
};

export type ActivityLogEntryChallengeCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryChallengeCreated';
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The Subspace that was created. */
  subspace: Space;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryMemberJoined = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryMemberJoined';
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The community that was joined. */
  community: Community;
  /** The Contributor that joined the Community. */
  contributor: Contributor;
  /** The type of the Contributor that joined the Community. */
  contributorType: RoleSetContributorType;
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryOpportunityCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryOpportunityCreated';
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The Subsubspace that was created. */
  subsubspace: Space;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
};

export type ActivityLogEntryUpdateSent = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryUpdateSent';
  /** Indicates if this Activity happened on a child Collaboration. Child results can be included via the "includeChild" parameter. */
  child: Scalars['Boolean'];
  /** The id of the Collaboration entity within which the Activity was generated. */
  collaborationID: Scalars['UUID'];
  /** The timestamp for the Activity. */
  createdDate: Scalars['DateTime'];
  /** The text details for this Activity. */
  description: Scalars['String'];
  id: Scalars['UUID'];
  /** The url to the Journey. */
  journeyUrl: Scalars['String'];
  /** The Message that been sent to this Community. */
  message: Scalars['String'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Space where the activity happened */
  space?: Maybe<Space>;
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
  /** The Updates for this Community. */
  updates: Room;
};

export type ActivityLogInput = {
  /** Display the activityLog results for the specified Collaboration. */
  collaborationID: Scalars['UUID'];
  /** Include entries happened on child Collaborations. */
  includeChild?: InputMaybe<Scalars['Boolean']>;
  /** The number of ActivityLog entries to return; if omitted return all. */
  limit?: InputMaybe<Scalars['Float']>;
  /** Which activity types to include in the results. Returns all by default. */
  types?: InputMaybe<Array<ActivityEventType>>;
};

export type Agent = {
  __typename?: 'Agent';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Credentials held by this Agent. */
  credentials?: Maybe<Array<Credential>>;
  /** The Decentralized Identifier (DID) for this Agent. */
  did?: Maybe<Scalars['DID']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A type of entity that this Agent is being used with. */
  type: AgentType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The Verfied Credentials for this Agent. */
  verifiedCredentials?: Maybe<Array<VerifiedCredential>>;
};

export type AgentBeginVerifiedCredentialOfferOutput = {
  __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
  /** The token containing the information about issuer, callback endpoint and the credentials offered */
  jwt: Scalars['String'];
  /** The QR Code Image to be offered on the client for scanning by a mobile wallet */
  qrCodeImg: Scalars['String'];
};

export type AgentBeginVerifiedCredentialRequestOutput = {
  __typename?: 'AgentBeginVerifiedCredentialRequestOutput';
  /** The token containing the information about issuer, callback endpoint and the credentials offered */
  jwt: Scalars['String'];
  /** The QR Code Image to be offered on the client for scanning by a mobile wallet */
  qrCodeImg: Scalars['String'];
};

export enum AgentType {
  Account = 'ACCOUNT',
  Organization = 'ORGANIZATION',
  Space = 'SPACE',
  User = 'USER',
  VirtualContributor = 'VIRTUAL_CONTRIBUTOR',
}

export type AiPersona = {
  __typename?: 'AiPersona';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A overview of knowledge provided by this AI Persona. */
  bodyOfKnowledge?: Maybe<Scalars['Markdown']>;
  /** The body of knowledge ID used for the AI Persona. */
  bodyOfKnowledgeID?: Maybe<Scalars['String']>;
  /** The body of knowledge type used for the AI Persona. */
  bodyOfKnowledgeType?: Maybe<AiPersonaBodyOfKnowledgeType>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The type of context sharing that are supported by this AI Persona when used. */
  dataAccessMode: AiPersonaDataAccessMode;
  /** The description for this AI Persona. */
  description?: Maybe<Scalars['Markdown']>;
  /** The engine powering the AiPersona. */
  engine: AiPersonaEngine;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The type of interactions that are supported by this AI Persona when used. */
  interactionModes: Array<AiPersonaInteractionMode>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum AiPersonaBodyOfKnowledgeType {
  AlkemioKnowledgeBase = 'ALKEMIO_KNOWLEDGE_BASE',
  AlkemioSpace = 'ALKEMIO_SPACE',
  None = 'NONE',
  Other = 'OTHER',
  Website = 'WEBSITE',
}

export enum AiPersonaDataAccessMode {
  None = 'NONE',
  SpaceProfile = 'SPACE_PROFILE',
  SpaceProfileAndContents = 'SPACE_PROFILE_AND_CONTENTS',
}

export enum AiPersonaEngine {
  CommunityManager = 'COMMUNITY_MANAGER',
  Expert = 'EXPERT',
  GenericOpenai = 'GENERIC_OPENAI',
  Guidance = 'GUIDANCE',
  OpenaiAssistant = 'OPENAI_ASSISTANT',
}

export enum AiPersonaInteractionMode {
  DiscussionTagging = 'DISCUSSION_TAGGING',
}

export type AiPersonaService = {
  __typename?: 'AiPersonaService';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The body of knowledge ID used for the AI Persona Service */
  bodyOfKnowledgeID?: Maybe<Scalars['UUID']>;
  /** When wat the body of knowledge of the VC last updated. */
  bodyOfKnowledgeLastUpdated?: Maybe<Scalars['DateTime']>;
  /** The body of knowledge type used for the AI Persona Service */
  bodyOfKnowledgeType: AiPersonaBodyOfKnowledgeType;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The required data access by the Virtual Persona */
  dataAccessMode: AiPersonaDataAccessMode;
  /** The AI Persona Engine being used by this AI Persona. */
  engine: AiPersonaEngine;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The prompt used by this Virtual Persona */
  prompt: Array<Scalars['String']>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type AiServer = {
  __typename?: 'AiServer';
  /** A particular AiPersonaService */
  aiPersonaService: AiPersonaService;
  /** The AiPersonaServices on this aiServer */
  aiPersonaServices: Array<AiPersonaService>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The default AiPersonaService in use on the aiServer. */
  defaultAiPersonaService: AiPersonaService;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type AiServerAiPersonaServiceArgs = {
  ID: Scalars['UUID'];
};

export type Application = {
  __typename?: 'Application';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The User for this Application. */
  contributor: Contributor;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Is this lifecycle in a final state (done). */
  isFinalized: Scalars['Boolean'];
  lifecycle: Lifecycle;
  /** The next events of this Lifecycle. */
  nextEvents: Array<Scalars['String']>;
  /** The Questions for this application. */
  questions: Array<Question>;
  /** The current state of this Lifecycle. */
  state: Scalars['String'];
  updatedDate: Scalars['DateTime'];
};

export type ApplicationEventInput = {
  applicationID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export type ApplyForEntryRoleOnRoleSetInput = {
  questions: Array<CreateNvpInput>;
  roleSetID: Scalars['UUID'];
};

export type AssignLicensePlanToAccount = {
  /** The ID of the Account to assign the LicensePlan to. */
  accountID: Scalars['UUID'];
  /** The ID of the LicensePlan to assign. */
  licensePlanID: Scalars['UUID'];
  /** The ID of the Licensing to use. */
  licensingID?: InputMaybe<Scalars['UUID']>;
};

export type AssignLicensePlanToSpace = {
  /** The ID of the LicensePlan to assign. */
  licensePlanID: Scalars['UUID'];
  /** The ID of the Licensing to use. */
  licensingID?: InputMaybe<Scalars['UUID']>;
  /** The ID of the Space to assign the LicensePlan to. */
  spaceID: Scalars['UUID'];
};

export type AssignPlatformRoleInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
};

export type AssignRoleOnRoleSetToOrganizationInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type AssignRoleOnRoleSetToUserInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type AssignRoleOnRoleSetToVirtualContributorInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type AssignUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID'];
};

export type AuthenticationConfig = {
  __typename?: 'AuthenticationConfig';
  /** Alkemio Authentication Providers Config. */
  providers: Array<AuthenticationProviderConfig>;
};

export type AuthenticationProviderConfig = {
  __typename?: 'AuthenticationProviderConfig';
  /** Configuration of the authentication provider */
  config: AuthenticationProviderConfigUnion;
  /** Is the authentication provider enabled? */
  enabled: Scalars['Boolean'];
  /** CDN location of an icon of the authentication provider login button. */
  icon: Scalars['String'];
  /** Label of the authentication provider. */
  label: Scalars['String'];
  /** Name of the authentication provider. */
  name: Scalars['String'];
};

export type AuthenticationProviderConfigUnion = OryConfig;

export enum AuthenticationType {
  Email = 'EMAIL',
  Linkedin = 'LINKEDIN',
  Microsoft = 'MICROSOFT',
  Unknown = 'UNKNOWN',
}

export type Authorization = {
  __typename?: 'Authorization';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The set of credential rules that are contained by this Authorization Policy. */
  credentialRules?: Maybe<Array<AuthorizationPolicyRuleCredential>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The privileges granted to the current user based on this Authorization Policy. */
  myPrivileges?: Maybe<Array<AuthorizationPrivilege>>;
  /** The set of privilege rules that are contained by this Authorization Policy. */
  privilegeRules?: Maybe<Array<AuthorizationPolicyRulePrivilege>>;
  /** A type of entity that this Authorization Policy is being used with. */
  type?: Maybe<AuthorizationPolicyType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The set of verified credential rules that are contained by this Authorization Policy. */
  verifiedCredentialRules?: Maybe<Array<AuthorizationPolicyRuleVerifiedCredential>>;
};

export enum AuthorizationCredential {
  AccountAdmin = 'ACCOUNT_ADMIN',
  BetaTester = 'BETA_TESTER',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalAnonymous = 'GLOBAL_ANONYMOUS',
  GlobalCommunityRead = 'GLOBAL_COMMUNITY_READ',
  GlobalLicenseManager = 'GLOBAL_LICENSE_MANAGER',
  GlobalRegistered = 'GLOBAL_REGISTERED',
  GlobalSpacesReader = 'GLOBAL_SPACES_READER',
  GlobalSupport = 'GLOBAL_SUPPORT',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  OrganizationAssociate = 'ORGANIZATION_ASSOCIATE',
  OrganizationOwner = 'ORGANIZATION_OWNER',
  SpaceAdmin = 'SPACE_ADMIN',
  SpaceLead = 'SPACE_LEAD',
  SpaceMember = 'SPACE_MEMBER',
  SpaceMemberInvitee = 'SPACE_MEMBER_INVITEE',
  SpaceSubspaceAdmin = 'SPACE_SUBSPACE_ADMIN',
  UserGroupMember = 'USER_GROUP_MEMBER',
  UserSelfManagement = 'USER_SELF_MANAGEMENT',
  VcCampaign = 'VC_CAMPAIGN',
}

export type AuthorizationPolicyRuleCredential = {
  __typename?: 'AuthorizationPolicyRuleCredential';
  cascade: Scalars['Boolean'];
  criterias: Array<CredentialDefinition>;
  grantedPrivileges: Array<AuthorizationPrivilege>;
  name?: Maybe<Scalars['String']>;
};

export type AuthorizationPolicyRulePrivilege = {
  __typename?: 'AuthorizationPolicyRulePrivilege';
  grantedPrivileges: Array<AuthorizationPrivilege>;
  name?: Maybe<Scalars['String']>;
  sourcePrivilege: AuthorizationPrivilege;
};

export type AuthorizationPolicyRuleVerifiedCredential = {
  __typename?: 'AuthorizationPolicyRuleVerifiedCredential';
  claimRule: Scalars['String'];
  credentialName: Scalars['String'];
  grantedPrivileges: Array<AuthorizationPrivilege>;
};

export enum AuthorizationPolicyType {
  Account = 'ACCOUNT',
  Agent = 'AGENT',
  AiPersona = 'AI_PERSONA',
  AiPersonaService = 'AI_PERSONA_SERVICE',
  AiServer = 'AI_SERVER',
  Application = 'APPLICATION',
  Calendar = 'CALENDAR',
  CalendarEvent = 'CALENDAR_EVENT',
  Callout = 'CALLOUT',
  CalloutsSet = 'CALLOUTS_SET',
  CalloutContribution = 'CALLOUT_CONTRIBUTION',
  CalloutFraming = 'CALLOUT_FRAMING',
  Classification = 'CLASSIFICATION',
  Collaboration = 'COLLABORATION',
  Communication = 'COMMUNICATION',
  Community = 'COMMUNITY',
  CommunityGuidelines = 'COMMUNITY_GUIDELINES',
  Discussion = 'DISCUSSION',
  Document = 'DOCUMENT',
  Forum = 'FORUM',
  InnovationFlow = 'INNOVATION_FLOW',
  InnovationHub = 'INNOVATION_HUB',
  InnovationPack = 'INNOVATION_PACK',
  Invitation = 'INVITATION',
  InMemory = 'IN_MEMORY',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  Library = 'LIBRARY',
  License = 'LICENSE',
  LicensePolicy = 'LICENSE_POLICY',
  Licensing = 'LICENSING',
  Link = 'LINK',
  Organization = 'ORGANIZATION',
  OrganizationVerification = 'ORGANIZATION_VERIFICATION',
  Platform = 'PLATFORM',
  Post = 'POST',
  Preference = 'PREFERENCE',
  PreferenceSet = 'PREFERENCE_SET',
  Profile = 'PROFILE',
  Reference = 'REFERENCE',
  RoleSet = 'ROLE_SET',
  Room = 'ROOM',
  Space = 'SPACE',
  SpaceAbout = 'SPACE_ABOUT',
  StorageAggregator = 'STORAGE_AGGREGATOR',
  StorageBucket = 'STORAGE_BUCKET',
  Tagset = 'TAGSET',
  Template = 'TEMPLATE',
  TemplatesManager = 'TEMPLATES_MANAGER',
  TemplatesSet = 'TEMPLATES_SET',
  TemplateDefault = 'TEMPLATE_DEFAULT',
  Timeline = 'TIMELINE',
  Unknown = 'UNKNOWN',
  User = 'USER',
  UserGroup = 'USER_GROUP',
  VirtualContributor = 'VIRTUAL_CONTRIBUTOR',
  Visual = 'VISUAL',
  Whiteboard = 'WHITEBOARD',
}

export enum AuthorizationPrivilege {
  AccessInteractiveGuidance = 'ACCESS_INTERACTIVE_GUIDANCE',
  AccountLicenseManage = 'ACCOUNT_LICENSE_MANAGE',
  AuthorizationReset = 'AUTHORIZATION_RESET',
  CommunityAssignVcFromAccount = 'COMMUNITY_ASSIGN_VC_FROM_ACCOUNT',
  Contribute = 'CONTRIBUTE',
  Create = 'CREATE',
  CreateCallout = 'CREATE_CALLOUT',
  CreateDiscussion = 'CREATE_DISCUSSION',
  CreateInnovationHub = 'CREATE_INNOVATION_HUB',
  CreateInnovationPack = 'CREATE_INNOVATION_PACK',
  CreateMessage = 'CREATE_MESSAGE',
  CreateMessageReaction = 'CREATE_MESSAGE_REACTION',
  CreateMessageReply = 'CREATE_MESSAGE_REPLY',
  CreateOrganization = 'CREATE_ORGANIZATION',
  CreatePost = 'CREATE_POST',
  CreateSpace = 'CREATE_SPACE',
  CreateSubspace = 'CREATE_SUBSPACE',
  CreateVirtualContributor = 'CREATE_VIRTUAL_CONTRIBUTOR',
  CreateWhiteboard = 'CREATE_WHITEBOARD',
  Delete = 'DELETE',
  FileDelete = 'FILE_DELETE',
  FileUpload = 'FILE_UPLOAD',
  Grant = 'GRANT',
  GrantGlobalAdmins = 'GRANT_GLOBAL_ADMINS',
  LicenseReset = 'LICENSE_RESET',
  MoveContribution = 'MOVE_CONTRIBUTION',
  MovePost = 'MOVE_POST',
  PlatformAdmin = 'PLATFORM_ADMIN',
  PlatformSettingsAdmin = 'PLATFORM_SETTINGS_ADMIN',
  Read = 'READ',
  ReadAbout = 'READ_ABOUT',
  ReadUsers = 'READ_USERS',
  ReadUserPii = 'READ_USER_PII',
  ReadUserSettings = 'READ_USER_SETTINGS',
  RolesetEntryRoleApply = 'ROLESET_ENTRY_ROLE_APPLY',
  RolesetEntryRoleAssign = 'ROLESET_ENTRY_ROLE_ASSIGN',
  RolesetEntryRoleInvite = 'ROLESET_ENTRY_ROLE_INVITE',
  RolesetEntryRoleInviteAccept = 'ROLESET_ENTRY_ROLE_INVITE_ACCEPT',
  RolesetEntryRoleJoin = 'ROLESET_ENTRY_ROLE_JOIN',
  TransferResourceAccept = 'TRANSFER_RESOURCE_ACCEPT',
  TransferResourceOffer = 'TRANSFER_RESOURCE_OFFER',
  Update = 'UPDATE',
  UpdateCalloutPublisher = 'UPDATE_CALLOUT_PUBLISHER',
  UpdateContent = 'UPDATE_CONTENT',
  UpdateInnovationFlow = 'UPDATE_INNOVATION_FLOW',
}

export type Calendar = {
  __typename?: 'Calendar';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** A single CalendarEvent */
  event?: Maybe<CalendarEvent>;
  /** The list of CalendarEvents for this Calendar. */
  events: Array<CalendarEvent>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type CalendarEventArgs = {
  ID: Scalars['UUID'];
};

export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The comments for this CalendarEvent */
  comments: Room;
  /** The user that created this CalendarEvent */
  createdBy?: Maybe<User>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The length of the event in days. */
  durationDays?: Maybe<Scalars['Float']>;
  /** The length of the event in minutes. */
  durationMinutes: Scalars['Float'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Flag to indicate if this event is for multiple days. */
  multipleDays: Scalars['Boolean'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Post. */
  profile: Profile;
  /** The start time for this CalendarEvent. */
  startDate?: Maybe<Scalars['DateTime']>;
  /** Which Subspace is this event part of. Only applicable if the Space has this option enabled. */
  subspace?: Maybe<Space>;
  /** The event type, e.g. webinar, meetup etc. */
  type: CalendarEventType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Is the event visible on the parent calendar. */
  visibleOnParentCalendar: Scalars['Boolean'];
  /** Flag to indicate if this event is for a whole day. */
  wholeDay: Scalars['Boolean'];
};

export enum CalendarEventType {
  Event = 'EVENT',
  Milestone = 'MILESTONE',
  Other = 'OTHER',
  Training = 'TRAINING',
}

export type Callout = {
  __typename?: 'Callout';
  /** The activity for this Callout. */
  activity: Scalars['Float'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The comments for this Callout. */
  classification?: Maybe<Classification>;
  /** The comments for this Callout. */
  comments?: Maybe<Room>;
  /** The Contribution Defaults for this Callout. */
  contributionDefaults: CalloutContributionDefaults;
  /** The ContributionPolicy for this Callout. */
  contributionPolicy: CalloutContributionPolicy;
  /** The Contributions that have been made to this Callout. */
  contributions: Array<CalloutContribution>;
  /** The user that created this Callout */
  createdBy?: Maybe<User>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Callout Framing associated with this Callout. */
  framing: CalloutFraming;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Whether this callout is a Template or not. */
  isTemplate: Scalars['Boolean'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Posts associated with this Callout. */
  posts?: Maybe<Array<Post>>;
  /** The user that published this Callout */
  publishedBy?: Maybe<User>;
  /** The timestamp for the publishing of this Callout. */
  publishedDate?: Maybe<Scalars['Float']>;
  /** The sorting order for this Callout. */
  sortOrder: Scalars['Float'];
  /** The Callout type, e.g. Post, Whiteboard, Discussion */
  type: CalloutType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type CalloutContributionsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type CalloutContribution = {
  __typename?: 'CalloutContribution';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The user that created this Document */
  createdBy?: Maybe<User>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Link that was contributed. */
  link?: Maybe<Link>;
  /** The Post that was contributed. */
  post?: Maybe<Post>;
  /** The sorting order for this Contribution. */
  sortOrder: Scalars['Float'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The Whiteboard that was contributed. */
  whiteboard?: Maybe<Whiteboard>;
};

export type CalloutContributionDefaults = {
  __typename?: 'CalloutContributionDefaults';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The default description to use for new contributions. */
  postDescription?: Maybe<Scalars['Markdown']>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The default whiteboard content for whiteboard responses. */
  whiteboardContent?: Maybe<Scalars['WhiteboardContent']>;
};

export type CalloutContributionPolicy = {
  __typename?: 'CalloutContributionPolicy';
  /** The allowed contribution types for this callout. */
  allowedContributionTypes: Array<CalloutContributionType>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** State of the Callout. */
  state: CalloutState;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum CalloutContributionType {
  Link = 'LINK',
  Post = 'POST',
  Whiteboard = 'WHITEBOARD',
}

export type CalloutFraming = {
  __typename?: 'CalloutFraming';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for framing the associated Callout. */
  profile: Profile;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The Whiteboard for framing the associated Callout. */
  whiteboard?: Maybe<Whiteboard>;
};

export type CalloutPostCreated = {
  __typename?: 'CalloutPostCreated';
  /** The identifier of the Callout on which the post was created. */
  calloutID: Scalars['String'];
  /** The identifier of the Contribution. */
  contributionID: Scalars['String'];
  /** The Post that has been created. */
  post: Post;
  /** The sorting order for this Contribution. */
  sortOrder: Scalars['Float'];
};

export enum CalloutState {
  Archived = 'ARCHIVED',
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export enum CalloutType {
  LinkCollection = 'LINK_COLLECTION',
  Post = 'POST',
  PostCollection = 'POST_COLLECTION',
  Whiteboard = 'WHITEBOARD',
  WhiteboardCollection = 'WHITEBOARD_COLLECTION',
}

export enum CalloutVisibility {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
}

export type CalloutsSet = {
  __typename?: 'CalloutsSet';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The list of Callouts for this CalloutsSet object. */
  callouts: Array<Callout>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The tagset templates on this CalloutsSet. */
  tagsetTemplates?: Maybe<Array<TagsetTemplate>>;
  /** The set of CalloutGroups in use in this CalloutsSet. */
  type: CalloutsSetType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type CalloutsSetCalloutsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  classificationTagsets?: InputMaybe<Array<TagsetArgs>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
  sortByActivity?: InputMaybe<Scalars['Boolean']>;
  types?: InputMaybe<Array<CalloutType>>;
};

export enum CalloutsSetType {
  Collaboration = 'COLLABORATION',
  KnowledgeBase = 'KNOWLEDGE_BASE',
}

export type ChatGuidanceAnswerRelevanceInput = {
  /** The answer id. */
  id: Scalars['String'];
  /** Is the answer relevant or not. */
  relevant: Scalars['Boolean'];
};

export type ChatGuidanceInput = {
  /** The language of the answer. */
  language?: InputMaybe<Scalars['String']>;
  /** The question that is being asked. */
  question: Scalars['String'];
};

export type Classification = {
  __typename?: 'Classification';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The default or named tagset. */
  tagset?: Maybe<Tagset>;
  /** The classification tagsets. */
  tagsets?: Maybe<Array<Tagset>>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type ClassificationTagsetArgs = {
  tagsetName: TagsetReservedName;
};

export type Collaboration = {
  __typename?: 'Collaboration';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The calloutsSet with Callouts in use by this Space */
  calloutsSet: CalloutsSet;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationFlow for the Collaboration. */
  innovationFlow: InnovationFlow;
  /** Whether this Collaboration is a Template or not. */
  isTemplate: Scalars['Boolean'];
  /** The License operating on this Collaboration. */
  license: License;
  /** The timeline with events in use by this Space */
  timeline: Timeline;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type Communication = {
  __typename?: 'Communication';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The updates on this Communication. */
  updates: Room;
};

export type CommunicationAdminEnsureAccessInput = {
  communityID: Scalars['UUID'];
};

export type CommunicationAdminMembershipInput = {
  communityID: Scalars['UUID'];
};

export type CommunicationAdminMembershipResult = {
  __typename?: 'CommunicationAdminMembershipResult';
  /** Display name of the result */
  displayName: Scalars['String'];
  /** A unique identifier for this comunication room membership result. */
  id: Scalars['String'];
  /** Rooms in this Communication */
  rooms: Array<CommunicationAdminRoomMembershipResult>;
};

export type CommunicationAdminOrphanedUsageResult = {
  __typename?: 'CommunicationAdminOrphanedUsageResult';
  /** Rooms in the Communication platform that are not used */
  rooms: Array<CommunicationAdminRoomResult>;
};

export type CommunicationAdminRemoveOrphanedRoomInput = {
  roomID: Scalars['String'];
};

export type CommunicationAdminRoomMembershipResult = {
  __typename?: 'CommunicationAdminRoomMembershipResult';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** Members of the room that are not members of the Community. */
  extraMembers: Array<Scalars['String']>;
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** The access mode for the room. */
  joinRule: Scalars['String'];
  /** Name of the room */
  members: Array<Scalars['String']>;
  /** Members of the community that are missing from the room */
  missingMembers: Array<Scalars['String']>;
  /** The matrix room ID */
  roomID: Scalars['String'];
};

export type CommunicationAdminRoomResult = {
  __typename?: 'CommunicationAdminRoomResult';
  /** Display name of the result */
  displayName: Scalars['String'];
  /** The identifier for the orphaned room. */
  id: Scalars['String'];
  /** The members of the orphaned room */
  members: Array<Scalars['String']>;
};

export type CommunicationAdminUpdateRoomStateInput = {
  isPublic: Scalars['Boolean'];
  isWorldVisible: Scalars['Boolean'];
  roomID: Scalars['String'];
};

export type CommunicationRoom = {
  __typename?: 'CommunicationRoom';
  /** The display name of the room */
  displayName: Scalars['String'];
  /** The identifier of the room */
  id: Scalars['String'];
  /** The messages that have been sent to the Room. */
  messages: Array<Message>;
};

export type CommunicationSendMessageToCommunityLeadsInput = {
  /** The Community the message is being sent to */
  communityId: Scalars['UUID'];
  /** The message being sent */
  message: Scalars['String'];
};

export type CommunicationSendMessageToOrganizationInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The Organization the message is being sent to */
  organizationId: Scalars['UUID'];
};

export type CommunicationSendMessageToUserInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** All Users the message is being sent to */
  receiverIds: Array<Scalars['UUID']>;
};

export type Community = Groupable & {
  __typename?: 'Community';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Communications for this Community. */
  communication: Communication;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The user group with the specified id anywhere in the space */
  group: UserGroup;
  /** Groups of users related to a Community. */
  groups: Array<UserGroup>;
  /** The guidelines for members of this Community. */
  guidelines: CommunityGuidelines;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The RoleSet for this Community. */
  roleSet: RoleSet;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type CommunityGroupArgs = {
  ID: Scalars['UUID'];
};

export type CommunityApplicationForRoleResult = {
  __typename?: 'CommunityApplicationForRoleResult';
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** Date of creation */
  createdDate: Scalars['DateTime'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the application */
  id: Scalars['UUID'];
  /** ID for the ultimate containing Space */
  spaceID: Scalars['UUID'];
  /** Nesting level of the Space */
  spaceLevel: Scalars['Float'];
  /** The current state of the application. */
  state: Scalars['String'];
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
};

export type CommunityApplicationResult = {
  __typename?: 'CommunityApplicationResult';
  /** The application itself */
  application: Application;
  /** ID for the pending membership */
  id: Scalars['UUID'];
  /** The key information for the Space that the application/invitation is for */
  spacePendingMembershipInfo: SpacePendingMembershipInfo;
};

export type CommunityGuidelines = {
  __typename?: 'CommunityGuidelines';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The details of the guidelilnes */
  profile: Profile;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type CommunityInvitationForRoleResult = {
  __typename?: 'CommunityInvitationForRoleResult';
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** ID for Contrbutor that is being invited to a community */
  contributorID: Scalars['UUID'];
  /** The Type of the Contrbutor that is being invited to a community */
  contributorType: RoleSetContributorType;
  /** ID for the user that created the invitation. */
  createdBy: Scalars['UUID'];
  /** Date of creation */
  createdDate: Scalars['DateTime'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the Invitation */
  id: Scalars['UUID'];
  /** ID for the ultimate containing Space */
  spaceID: Scalars['UUID'];
  /** Nesting level of the Space */
  spaceLevel: Scalars['Float'];
  /** The current state of the invitation. */
  state: Scalars['String'];
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
  /** The welcome message of the invitation */
  welcomeMessage?: Maybe<Scalars['UUID']>;
};

export type CommunityInvitationResult = {
  __typename?: 'CommunityInvitationResult';
  /** ID for the pending membership */
  id: Scalars['UUID'];
  /** The invitation itself */
  invitation: Invitation;
  /** The key information for the Space that the application/invitation is for */
  spacePendingMembershipInfo: SpacePendingMembershipInfo;
};

export enum CommunityMembershipPolicy {
  Applications = 'APPLICATIONS',
  Invitations = 'INVITATIONS',
  Open = 'OPEN',
}

export type CommunityMembershipResult = {
  __typename?: 'CommunityMembershipResult';
  /** The child community memberships */
  childMemberships: Array<CommunityMembershipResult>;
  /** ID for the membership */
  id: Scalars['UUID'];
  /** The space for the membership is for */
  space: Space;
};

export enum CommunityMembershipStatus {
  ApplicationPending = 'APPLICATION_PENDING',
  InvitationPending = 'INVITATION_PENDING',
  Member = 'MEMBER',
  NotMember = 'NOT_MEMBER',
}

export type Config = {
  __typename?: 'Config';
  /** Elastic APM (RUM & performance monitoring) related configuration. */
  apm: Apm;
  /** Authentication configuration. */
  authentication: AuthenticationConfig;
  /** Visual constraints for the given type */
  defaultVisualTypeConstraints: VisualConstraints;
  /** The feature flags for the platform */
  featureFlags: Array<PlatformFeatureFlag>;
  /** Integration with a 3rd party Geo information service */
  geo: Geo;
  /** Platform related locations. */
  locations: PlatformLocations;
  /** Sentry (client monitoring) related configuration. */
  sentry: Sentry;
  /** Configuration for storage providers, e.g. file */
  storage: StorageConfig;
};

export type ConfigDefaultVisualTypeConstraintsArgs = {
  type: VisualType;
};

export enum ContentUpdatePolicy {
  Admins = 'ADMINS',
  Contributors = 'CONTRIBUTORS',
  Owner = 'OWNER',
}

export type Contributor = {
  /** The Agent for the Contributor. */
  agent: Agent;
  /** The authorization rules for the Contributor */
  authorization?: Maybe<Authorization>;
  /** The ID of the Contributor */
  id: Scalars['UUID'];
  /** A name identifier of the Contributor, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The profile for the Contributor. */
  profile: Profile;
};

export type ContributorFilterInput = {
  /** Return contributors with credentials in the provided list */
  credentials?: InputMaybe<Array<AuthorizationCredential>>;
};

export type ContributorRolePolicy = {
  __typename?: 'ContributorRolePolicy';
  /** Maximum number of Contributors in this role */
  maximum: Scalars['Float'];
  /** Minimum number of Contributors in this role */
  minimum: Scalars['Float'];
};

export type ContributorRoles = {
  __typename?: 'ContributorRoles';
  /** The applications for the specified user; only accessible for platform admins */
  applications: Array<CommunityApplicationForRoleResult>;
  id: Scalars['UUID'];
  /** The invitations for the specified user; only accessible for platform admins */
  invitations: Array<CommunityInvitationForRoleResult>;
  /** Details of the roles the contributor has in Organizations */
  organizations: Array<RolesResultOrganization>;
  /** Details of Spaces the User or Organization is a member of, with child memberships - if Space is accessible for the current user. */
  spaces: Array<RolesResultSpace>;
};

export type ContributorRolesApplicationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type ContributorRolesInvitationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type ConversionVcSpaceToVcKnowledgeBaseInput = {
  /** The Virtual Contributor to be converted. */
  virtualContributorID: Scalars['UUID'];
};

export type ConvertSubspaceToSpaceInput = {
  /** The subspace to be promoted to be a new Space. Note: the original Subspace will no longer exist after the conversion.  */
  subspaceID: Scalars['UUID'];
};

export type ConvertSubsubspaceToSubspaceInput = {
  /** The subsubspace to be promoted. Note: the original Opportunity will no longer exist after the conversion.  */
  subsubspaceID: Scalars['UUID'];
};

export type CreateAiPersonaInput = {
  aiPersonaService?: InputMaybe<CreateAiPersonaServiceInput>;
  aiPersonaServiceID?: InputMaybe<Scalars['UUID']>;
  bodyOfKnowledge?: InputMaybe<Scalars['Markdown']>;
  description?: InputMaybe<Scalars['Markdown']>;
};

export type CreateAiPersonaServiceInput = {
  bodyOfKnowledgeID?: InputMaybe<Scalars['UUID']>;
  bodyOfKnowledgeType?: InputMaybe<AiPersonaBodyOfKnowledgeType>;
  dataAccessMode?: InputMaybe<AiPersonaDataAccessMode>;
  engine?: InputMaybe<AiPersonaEngine>;
  externalConfig?: InputMaybe<ExternalConfig>;
  prompt?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateCalendarEventOnCalendarInput = {
  calendarID: Scalars['UUID'];
  /** The length of the event in days. */
  durationDays?: InputMaybe<Scalars['Float']>;
  /** The length of the event in minutes. */
  durationMinutes: Scalars['Float'];
  /** Flag to indicate if this event is for multiple days. */
  multipleDays: Scalars['Boolean'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  /** The start date for the event. */
  startDate: Scalars['DateTime'];
  tags?: InputMaybe<Array<Scalars['String']>>;
  type: CalendarEventType;
  /** Is the event visible on the parent calendar. */
  visibleOnParentCalendar: Scalars['Boolean'];
  /** Flag to indicate if this event is for a whole day. */
  wholeDay: Scalars['Boolean'];
};

export type CreateCalloutContributionDefaultsData = {
  __typename?: 'CreateCalloutContributionDefaultsData';
  /** The default description to use for new Post contributions. */
  postDescription?: Maybe<Scalars['Markdown']>;
  whiteboardContent?: Maybe<Scalars['WhiteboardContent']>;
};

export type CreateCalloutContributionDefaultsInput = {
  /** The default description to use for new Post contributions. */
  postDescription?: InputMaybe<Scalars['Markdown']>;
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
};

export type CreateCalloutContributionPolicyData = {
  __typename?: 'CreateCalloutContributionPolicyData';
  /** State of the callout. */
  state?: Maybe<CalloutState>;
};

export type CreateCalloutContributionPolicyInput = {
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
};

export type CreateCalloutData = {
  __typename?: 'CreateCalloutData';
  classification?: Maybe<CreateClassificationData>;
  contributionDefaults?: Maybe<CreateCalloutContributionDefaultsData>;
  contributionPolicy?: Maybe<CreateCalloutContributionPolicyData>;
  /** Controls if the comments are enabled for this Callout. Defaults to false. */
  enableComments?: Maybe<Scalars['Boolean']>;
  framing: CreateCalloutFramingData;
  /** A readable identifier, unique within the containing scope. */
  nameID?: Maybe<Scalars['NameID']>;
  /** Send notification if this flag is true and visibility is PUBLISHED. Defaults to false. */
  sendNotification?: Maybe<Scalars['Boolean']>;
  /** The sort order to assign to this Callout. */
  sortOrder?: Maybe<Scalars['Float']>;
  /** Callout type. */
  type: CalloutType;
  /** Visibility of the Callout. Defaults to DRAFT. */
  visibility?: Maybe<CalloutVisibility>;
};

export type CreateCalloutFramingData = {
  __typename?: 'CreateCalloutFramingData';
  profile: CreateProfileData;
  tags?: Maybe<Array<Scalars['String']>>;
  whiteboard?: Maybe<CreateWhiteboardData>;
};

export type CreateCalloutFramingInput = {
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
};

export type CreateCalloutInput = {
  classification?: InputMaybe<CreateClassificationInput>;
  contributionDefaults?: InputMaybe<CreateCalloutContributionDefaultsInput>;
  contributionPolicy?: InputMaybe<CreateCalloutContributionPolicyInput>;
  /** Controls if the comments are enabled for this Callout. Defaults to false. */
  enableComments?: InputMaybe<Scalars['Boolean']>;
  framing: CreateCalloutFramingInput;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Send notification if this flag is true and visibility is PUBLISHED. Defaults to false. */
  sendNotification?: InputMaybe<Scalars['Boolean']>;
  /** The sort order to assign to this Callout. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  /** Callout type. */
  type: CalloutType;
  /** Visibility of the Callout. Defaults to DRAFT. */
  visibility?: InputMaybe<CalloutVisibility>;
};

export type CreateCalloutOnCalloutsSetInput = {
  calloutsSetID: Scalars['UUID'];
  classification?: InputMaybe<CreateClassificationInput>;
  contributionDefaults?: InputMaybe<CreateCalloutContributionDefaultsInput>;
  contributionPolicy?: InputMaybe<CreateCalloutContributionPolicyInput>;
  /** Controls if the comments are enabled for this Callout. Defaults to false. */
  enableComments?: InputMaybe<Scalars['Boolean']>;
  framing: CreateCalloutFramingInput;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Send notification if this flag is true and visibility is PUBLISHED. Defaults to false. */
  sendNotification?: InputMaybe<Scalars['Boolean']>;
  /** The sort order to assign to this Callout. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  /** Callout type. */
  type: CalloutType;
  /** Visibility of the Callout. Defaults to DRAFT. */
  visibility?: InputMaybe<CalloutVisibility>;
};

export type CreateCalloutsSetData = {
  __typename?: 'CreateCalloutsSetData';
  /** The Callouts to add to this Collaboration. */
  calloutsData?: Maybe<Array<CreateCalloutData>>;
};

export type CreateCalloutsSetInput = {
  /** The Callouts to add to this Collaboration. */
  calloutsData?: InputMaybe<Array<CreateCalloutInput>>;
};

export type CreateClassificationData = {
  __typename?: 'CreateClassificationData';
  tagsets: Array<CreateTagsetData>;
};

export type CreateClassificationInput = {
  tagsets: Array<CreateTagsetInput>;
};

export type CreateCollaborationData = {
  __typename?: 'CreateCollaborationData';
  /** The CalloutsSet to use for this Collaboration. */
  calloutsSetData: CreateCalloutsSetData;
  /** The InnovationFlow Template to use for this Collaboration. */
  innovationFlowData?: Maybe<CreateInnovationFlowData>;
};

export type CreateCollaborationInput = {
  /** The CalloutsSet to use for this Collaboration. */
  calloutsSetData: CreateCalloutsSetInput;
  /** The InnovationFlow Template to use for this Collaboration. */
  innovationFlowData?: InputMaybe<CreateInnovationFlowInput>;
};

export type CreateCollaborationOnSpaceInput = {
  /** Add callouts from the template to the Collaboration; defaults to true. */
  addCallouts?: InputMaybe<Scalars['Boolean']>;
  /** Add tutorial callouts to the Collaboration; defaults to false. */
  addTutorialCallouts?: InputMaybe<Scalars['Boolean']>;
  /** The CalloutsSet to use for this Collaboration. */
  calloutsSetData: CreateCalloutsSetInput;
  /** The Template to use for instantiating the Collaboration. */
  collaborationTemplateID?: InputMaybe<Scalars['UUID']>;
  /** The InnovationFlow Template to use for this Collaboration. */
  innovationFlowData?: InputMaybe<CreateInnovationFlowInput>;
};

export type CreateCommunityGuidelinesData = {
  __typename?: 'CreateCommunityGuidelinesData';
  profile: CreateProfileData;
};

export type CreateCommunityGuidelinesInput = {
  profile: CreateProfileInput;
};

export type CreateContributionOnCalloutInput = {
  calloutID: Scalars['UUID'];
  link?: InputMaybe<CreateLinkInput>;
  post?: InputMaybe<CreatePostInput>;
  /** The sort order to assign to this Contribution. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
};

export type CreateInnovationFlowData = {
  __typename?: 'CreateInnovationFlowData';
  profile: CreateProfileData;
  states: Array<CreateInnovationFlowStateData>;
};

export type CreateInnovationFlowInput = {
  profile: CreateProfileInput;
  states: Array<CreateInnovationFlowStateInput>;
};

export type CreateInnovationFlowStateData = {
  __typename?: 'CreateInnovationFlowStateData';
  /** The explation text to clarify the State. */
  description?: Maybe<Scalars['Markdown']>;
  /** The display name for the State */
  displayName: Scalars['String'];
};

export type CreateInnovationFlowStateInput = {
  /** The explation text to clarify the State. */
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the State */
  displayName: Scalars['String'];
};

export type CreateInnovationHubOnAccountInput = {
  /** The Account where the InnovationHub is to be created. */
  accountID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  /** A list of Spaces to include in this Innovation Hub. Only valid when type 'list' is used. */
  spaceListFilter?: InputMaybe<Array<Scalars['UUID']>>;
  /** Spaces with which visibility this Innovation Hub will display. Only valid when type 'visibility' is used. */
  spaceVisibilityFilter?: InputMaybe<SpaceVisibility>;
  /** The subdomain to associate the Innovation Hub with. */
  subdomain: Scalars['String'];
  /** The type of Innovation Hub. */
  type: InnovationHubType;
};

export type CreateInnovationPackOnAccountInput = {
  /** The Account where the InnovationPack is to be created. */
  accountID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateKnowledgeBaseInput = {
  /** The CalloutsSet to use for this KnowledgeBase. */
  calloutsSetData?: InputMaybe<CreateCalloutsSetInput>;
  /** The Profile to use for this KnowledgeBase. */
  profile: CreateProfileInput;
};

export type CreateLicensePlanOnLicensingFrameworkInput = {
  /** Assign this plan to all new Organization accounts */
  assignToNewOrganizationAccounts: Scalars['Boolean'];
  /** Assign this plan to all new User accounts */
  assignToNewUserAccounts: Scalars['Boolean'];
  /** Is this plan enabled? */
  enabled: Scalars['Boolean'];
  /** Is this plan free? */
  isFree: Scalars['Boolean'];
  /** The credential to represent this plan */
  licenseCredential: LicensingCredentialBasedCredentialType;
  licensingFrameworkID: Scalars['UUID'];
  /** The name of the License Plan */
  name: Scalars['String'];
  /** The price per month of this plan. */
  pricePerMonth?: InputMaybe<Scalars['Float']>;
  /** Does this plan require contact support */
  requiresContactSupport: Scalars['Boolean'];
  /** Does this plan require a payment method? */
  requiresPaymentMethod: Scalars['Boolean'];
  /** The sorting order for this Plan. */
  sortOrder: Scalars['Float'];
  /** Is there a trial period enabled */
  trialEnabled: Scalars['Boolean'];
  /** The type of this License Plan. */
  type: LicensingCredentialBasedPlanType;
};

export type CreateLinkInput = {
  profile: CreateProfileInput;
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateLocationData = {
  __typename?: 'CreateLocationData';
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  stateOrProvince?: Maybe<Scalars['String']>;
};

export type CreateLocationInput = {
  addressLine1?: InputMaybe<Scalars['String']>;
  addressLine2?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  stateOrProvince?: InputMaybe<Scalars['String']>;
};

export type CreateNvpInput = {
  name: Scalars['String'];
  sortOrder: Scalars['Float'];
  value: Scalars['String'];
};

export type CreateOrganizationInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  website?: InputMaybe<Scalars['String']>;
};

export type CreatePostInput = {
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateProfileData = {
  __typename?: 'CreateProfileData';
  description?: Maybe<Scalars['Markdown']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  location?: Maybe<CreateLocationData>;
  referencesData?: Maybe<Array<CreateReferenceData>>;
  /** A memorable short description for this entity. */
  tagline?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  tagsets?: Maybe<Array<CreateTagsetData>>;
  /** The visuals URLs */
  visuals?: Maybe<Array<CreateVisualOnProfileData>>;
};

export type CreateProfileInput = {
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  location?: InputMaybe<CreateLocationInput>;
  referencesData?: InputMaybe<Array<CreateReferenceInput>>;
  /** A memorable short description for this entity. */
  tagline?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  tagsets?: InputMaybe<Array<CreateTagsetInput>>;
  /** The visuals URLs */
  visuals?: InputMaybe<Array<CreateVisualOnProfileInput>>;
};

export type CreateReferenceData = {
  __typename?: 'CreateReferenceData';
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: Maybe<Scalars['String']>;
};

export type CreateReferenceInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateReferenceOnProfileInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  profileID: Scalars['UUID'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateSpaceAboutInput = {
  profileData: CreateProfileInput;
  when?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
  why?: InputMaybe<Scalars['Markdown']>;
};

export type CreateSpaceOnAccountInput = {
  about: CreateSpaceAboutInput;
  /** The Account where the Space is to be created. */
  accountID: Scalars['UUID'];
  collaborationData: CreateCollaborationOnSpaceInput;
  /** The license plan the user wishes to use when creating the space. */
  licensePlanID?: InputMaybe<Scalars['UUID']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  type?: InputMaybe<SpaceType>;
};

export type CreateSubspaceInput = {
  about: CreateSpaceAboutInput;
  collaborationData: CreateCollaborationOnSpaceInput;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  spaceID: Scalars['UUID'];
  type?: InputMaybe<SpaceType>;
};

export type CreateTagsetData = {
  __typename?: 'CreateTagsetData';
  name: Scalars['String'];
  tags?: Maybe<Array<Scalars['String']>>;
  type?: Maybe<TagsetType>;
};

export type CreateTagsetInput = {
  name: Scalars['String'];
  tags?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<TagsetType>;
};

export type CreateTagsetOnProfileInput = {
  name: Scalars['String'];
  profileID?: InputMaybe<Scalars['UUID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<TagsetType>;
};

export type CreateTemplateFromCollaborationOnTemplatesSetInput = {
  /** The Collaboration to use as the content for the Template. */
  collaborationID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
};

export type CreateTemplateOnTemplatesSetInput = {
  /** The Callout to associate with this template. */
  calloutData?: InputMaybe<CreateCalloutInput>;
  /** The Collaboration to associate with this template. */
  collaborationData?: InputMaybe<CreateCollaborationInput>;
  /** The Community guidelines to associate with this template. */
  communityGuidelinesData?: InputMaybe<CreateCommunityGuidelinesInput>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Post Template: The default description to be pre-filled. */
  postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  /** The type of the Template to be created. */
  type: TemplateType;
  /** The Whiteboard to associate with this template. */
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
};

export type CreateUserGroupInput = {
  parentID: Scalars['UUID'];
  profile: CreateProfileInput;
};

export type CreateUserInput = {
  accountUpn?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  phone?: InputMaybe<Scalars['String']>;
  profileData: CreateProfileInput;
};

export type CreateVirtualContributorOnAccountInput = {
  /** The Account where the VirtualContributor is to be created. */
  accountID: Scalars['UUID'];
  /** Data used to create the AI Persona */
  aiPersona: CreateAiPersonaInput;
  /** The KnowledgeBase to use for this Collaboration. */
  knowledgeBaseData?: InputMaybe<CreateKnowledgeBaseInput>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
};

export type CreateVisualOnProfileData = {
  __typename?: 'CreateVisualOnProfileData';
  /** The type of visual. */
  name: VisualType;
  /** The URI of the image. Needs to be a url inside Alkemio already uploaded to a StorageBucket. It will be then copied to the Profile holding this Visual. */
  uri: Scalars['String'];
};

export type CreateVisualOnProfileInput = {
  /** The type of visual. */
  name: VisualType;
  /** The URI of the image. Needs to be a url inside Alkemio already uploaded to a StorageBucket. It will be then copied to the Profile holding this Visual. */
  uri: Scalars['String'];
};

export type CreateWhiteboardData = {
  __typename?: 'CreateWhiteboardData';
  content?: Maybe<Scalars['WhiteboardContent']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: Maybe<Scalars['NameID']>;
  profile?: Maybe<CreateProfileData>;
};

export type CreateWhiteboardInput = {
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profile?: InputMaybe<CreateProfileInput>;
};

export type Credential = {
  __typename?: 'Credential';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The timestamp for the expiry of this credential. */
  expires?: Maybe<Scalars['Float']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The User issuing the credential */
  issuer?: Maybe<Scalars['UUID']>;
  resourceID: Scalars['String'];
  type: CredentialType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type CredentialDefinition = {
  __typename?: 'CredentialDefinition';
  /** The resourceID for this CredentialDefinition */
  resourceID: Scalars['String'];
  /** The type for this CredentialDefinition */
  type: Scalars['String'];
};

export type CredentialMetadataOutput = {
  __typename?: 'CredentialMetadataOutput';
  /** A json description of what the claim contains and schema validation definition */
  context: Scalars['String'];
  /** The purpose of the credential */
  description: Scalars['String'];
  /** The display name of the credential */
  name: Scalars['String'];
  /** The schema that the credential will be validated against */
  schema: Scalars['String'];
  /** The credential types that are associated with this credential */
  types: Array<Scalars['String']>;
  /** System recognized unique type for the credential */
  uniqueType: Scalars['String'];
};

export enum CredentialType {
  AccountAdmin = 'ACCOUNT_ADMIN',
  AccountLicensePlus = 'ACCOUNT_LICENSE_PLUS',
  BetaTester = 'BETA_TESTER',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalAnonymous = 'GLOBAL_ANONYMOUS',
  GlobalCommunityRead = 'GLOBAL_COMMUNITY_READ',
  GlobalLicenseManager = 'GLOBAL_LICENSE_MANAGER',
  GlobalRegistered = 'GLOBAL_REGISTERED',
  GlobalSpacesReader = 'GLOBAL_SPACES_READER',
  GlobalSupport = 'GLOBAL_SUPPORT',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  OrganizationAssociate = 'ORGANIZATION_ASSOCIATE',
  OrganizationOwner = 'ORGANIZATION_OWNER',
  SpaceAdmin = 'SPACE_ADMIN',
  SpaceFeatureSaveAsTemplate = 'SPACE_FEATURE_SAVE_AS_TEMPLATE',
  SpaceFeatureVirtualContributors = 'SPACE_FEATURE_VIRTUAL_CONTRIBUTORS',
  SpaceFeatureWhiteboardMultiUser = 'SPACE_FEATURE_WHITEBOARD_MULTI_USER',
  SpaceLead = 'SPACE_LEAD',
  SpaceLicenseEnterprise = 'SPACE_LICENSE_ENTERPRISE',
  SpaceLicenseFree = 'SPACE_LICENSE_FREE',
  SpaceLicensePlus = 'SPACE_LICENSE_PLUS',
  SpaceLicensePremium = 'SPACE_LICENSE_PREMIUM',
  SpaceMember = 'SPACE_MEMBER',
  SpaceMemberInvitee = 'SPACE_MEMBER_INVITEE',
  SpaceSubspaceAdmin = 'SPACE_SUBSPACE_ADMIN',
  UserGroupMember = 'USER_GROUP_MEMBER',
  UserSelfManagement = 'USER_SELF_MANAGEMENT',
  VcCampaign = 'VC_CAMPAIGN',
}

export type DeleteAiPersonaServiceInput = {
  ID: Scalars['UUID'];
};

export type DeleteApplicationInput = {
  ID: Scalars['UUID'];
};

export type DeleteCalendarEventInput = {
  ID: Scalars['UUID'];
};

export type DeleteCalloutInput = {
  ID: Scalars['UUID'];
};

export type DeleteDiscussionInput = {
  ID: Scalars['UUID'];
};

export type DeleteDocumentInput = {
  ID: Scalars['UUID'];
};

export type DeleteInnovationHubInput = {
  ID: Scalars['UUID'];
};

export type DeleteInnovationPackInput = {
  ID: Scalars['UUID'];
};

export type DeleteInvitationInput = {
  ID: Scalars['UUID'];
};

export type DeleteLicensePlanInput = {
  ID: Scalars['UUID'];
};

export type DeleteLinkInput = {
  ID: Scalars['UUID'];
};

export type DeleteOrganizationInput = {
  ID: Scalars['UUID'];
};

export type DeletePlatformInvitationInput = {
  ID: Scalars['UUID'];
};

export type DeletePostInput = {
  ID: Scalars['UUID'];
};

export type DeleteReferenceInput = {
  ID: Scalars['UUID'];
};

export type DeleteSpaceInput = {
  ID: Scalars['UUID'];
};

export type DeleteStorageBuckeetInput = {
  ID: Scalars['UUID'];
};

export type DeleteTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserInput = {
  ID: Scalars['UUID'];
  deleteIdentity?: InputMaybe<Scalars['Boolean']>;
};

export type DeleteVirtualContributorInput = {
  ID: Scalars['UUID'];
};

export type DeleteWhiteboardInput = {
  ID: Scalars['UUID'];
};

export type DirectRoom = {
  __typename?: 'DirectRoom';
  /** The display name of the room */
  displayName: Scalars['String'];
  /** The identifier of the direct room */
  id: Scalars['String'];
  /** The messages that have been sent to the Direct Room. */
  messages: Array<Message>;
  /** The recepient userID */
  receiverID?: Maybe<Scalars['String']>;
};

export type Discussion = {
  __typename?: 'Discussion';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The category assigned to this Discussion. */
  category: ForumDiscussionCategory;
  /** The comments for this Discussion. */
  comments: Room;
  /** The id of the user that created this discussion */
  createdBy?: Maybe<Scalars['UUID']>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** Privacy mode for the Discussion. Note: this is not yet implemented in the authorization policy. */
  privacy: ForumDiscussionPrivacy;
  /** The Profile for this Discussion. */
  profile: Profile;
  /** The timestamp for the creation of this Discussion. */
  timestamp?: Maybe<Scalars['Float']>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type DiscussionsInput = {
  /** The number of Discussion entries to return; if omitted return all Discussions. */
  limit?: InputMaybe<Scalars['Float']>;
  /** The sort order of the Discussions to return. */
  orderBy?: InputMaybe<DiscussionsOrderBy>;
};

export enum DiscussionsOrderBy {
  DiscussionsCreatedateAsc = 'DISCUSSIONS_CREATEDATE_ASC',
  DiscussionsCreatedateDesc = 'DISCUSSIONS_CREATEDATE_DESC',
}

export type Document = {
  __typename?: 'Document';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The user that created this Document */
  createdBy?: Maybe<User>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Mime type for this Document. */
  mimeType: MimeType;
  /** Size of the Document. */
  size: Scalars['Float'];
  /** The tagset in use on this Document. */
  tagset: Tagset;
  /** Whether this Document is in its end location or not. */
  temporaryLocation: Scalars['Boolean'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The uploaded date of this Document */
  uploadedDate: Scalars['DateTime'];
  /** The URL to be used to retrieve the Document */
  url: Scalars['String'];
};

export type ExploreSpacesInput = {
  /** Take into account only the activity in the past X days. */
  daysOld?: InputMaybe<Scalars['Float']>;
  /** Amount of Spaces returned. */
  limit?: InputMaybe<Scalars['Float']>;
};

export type ExternalConfig = {
  /** The API key for the external LLM provider. */
  apiKey?: InputMaybe<Scalars['String']>;
  /** The assistent ID backing the service in OpenAI`s assistant API */
  assistantId?: InputMaybe<Scalars['String']>;
};

export type FileStorageConfig = {
  __typename?: 'FileStorageConfig';
  /** Max file size, in bytes. */
  maxFileSize: Scalars['Float'];
};

export type Form = {
  __typename?: 'Form';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** A description of the purpose of this Form. */
  description?: Maybe<Scalars['Markdown']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The set of Questions in this Form. */
  questions: Array<FormQuestion>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type FormQuestion = {
  __typename?: 'FormQuestion';
  /** The explation text to clarify the question. */
  explanation: Scalars['String'];
  /** The maxiumum length of the answer, in characters, up to a limit of 512. */
  maxLength: Scalars['Float'];
  /** The question to be answered */
  question: Scalars['String'];
  /** Whether this Question requires an answer or not. */
  required: Scalars['Boolean'];
  /** The sort order of this question in a wider set of questions. */
  sortOrder: Scalars['Float'];
};

export type Forum = {
  __typename?: 'Forum';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** A particular Discussions active in this Forum. */
  discussion?: Maybe<Discussion>;
  discussionCategories: Array<ForumDiscussionCategory>;
  /** The Discussions active in this Forum. */
  discussions?: Maybe<Array<Discussion>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type ForumDiscussionArgs = {
  ID: Scalars['UUID'];
};

export type ForumDiscussionsArgs = {
  queryData?: InputMaybe<DiscussionsInput>;
};

export type ForumCreateDiscussionInput = {
  /** The category for the Discussion */
  category: ForumDiscussionCategory;
  /** The identifier for the Forum entity the Discussion is being created on. */
  forumID: Scalars['UUID'];
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export enum ForumDiscussionCategory {
  ChallengeCentric = 'CHALLENGE_CENTRIC',
  CommunityBuilding = 'COMMUNITY_BUILDING',
  Help = 'HELP',
  Other = 'OTHER',
  PlatformFunctionalities = 'PLATFORM_FUNCTIONALITIES',
  Releases = 'RELEASES',
}

export enum ForumDiscussionPrivacy {
  Authenticated = 'AUTHENTICATED',
  Author = 'AUTHOR',
  Public = 'PUBLIC',
}

export type Geo = {
  __typename?: 'Geo';
  /** Endpoint where geo information is consumed from. */
  endpoint: Scalars['String'];
};

export type GrantAuthorizationCredentialInput = {
  /** The resource to which this credential is tied. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  type: AuthorizationCredential;
  /** The user to whom the credential is being granted. */
  userID: Scalars['UUID'];
};

export type GrantOrganizationAuthorizationCredentialInput = {
  /** The Organization to whom the credential is being granted. */
  organizationID: Scalars['UUID'];
  /** The resource to which this credential is tied. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  type: AuthorizationCredential;
};

export type Groupable = {
  /** The groups contained by this entity. */
  groups?: Maybe<Array<UserGroup>>;
};

export type ISearchResults = {
  __typename?: 'ISearchResults';
  /** The search results for Callouts. */
  calloutResults: Array<SearchResult>;
  /** The total number of results for Callouts. */
  calloutResultsCount: Scalars['Float'];
  /** The search results for contributions (Posts, Whiteboards etc). */
  contributionResults: Array<SearchResult>;
  /** The total number of search results for contributions (Posts, Whiteboards etc). */
  contributionResultsCount: Scalars['Float'];
  /** The search results for contributors (Users, Organizations). */
  contributorResults: Array<SearchResult>;
  /** The total number of search results for contributors (Users, Organizations). */
  contributorResultsCount: Scalars['Float'];
  /** The search results for Groups. */
  groupResults: Array<SearchResult>;
  /** The search results for Spaces / Subspaces. */
  journeyResults: Array<SearchResult>;
  /** The total number of results for Spaces / Subspaces. */
  journeyResultsCount: Scalars['Float'];
};

/** An in-app notification type. To not be queried directly */
export type InAppNotification = {
  /** Which category (role) is this notification targeted to. */
  category: InAppNotificationCategory;
  id: Scalars['UUID'];
  /** The receiver of the notification. */
  receiver: Contributor;
  /** The current state of the notification */
  state: InAppNotificationState;
  /** When (UTC) was the notification sent. */
  triggeredAt: Scalars['DateTime'];
  /** The Contributor who triggered the notification. */
  triggeredBy?: Maybe<Contributor>;
  /** The type of the notification */
  type: NotificationEventType;
};

export type InAppNotificationCalloutPublished = InAppNotification & {
  __typename?: 'InAppNotificationCalloutPublished';
  /** The Callout that was published. */
  callout?: Maybe<Callout>;
  /** Which category (role) is this notification targeted to. */
  category: InAppNotificationCategory;
  id: Scalars['UUID'];
  /** The receiver of the notification. */
  receiver: Contributor;
  /** Where the callout is located. */
  space?: Maybe<Space>;
  /** The current state of the notification */
  state: InAppNotificationState;
  /** When (UTC) was the notification sent. */
  triggeredAt: Scalars['DateTime'];
  /** The Contributor who triggered the notification. */
  triggeredBy?: Maybe<Contributor>;
  /** The type of the notification */
  type: NotificationEventType;
};

/** Which category (role) is this notification targeted to. */
export enum InAppNotificationCategory {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Self = 'SELF',
}

export type InAppNotificationCommunityNewMember = InAppNotification & {
  __typename?: 'InAppNotificationCommunityNewMember';
  /** The Contributor that joined. */
  actor?: Maybe<Contributor>;
  /** Which category (role) is this notification targeted to. */
  category: InAppNotificationCategory;
  /** The type of the Contributor that joined. */
  contributorType: RoleSetContributorType;
  id: Scalars['UUID'];
  /** The receiver of the notification. */
  receiver: Contributor;
  /** The Space that was joined. */
  space?: Maybe<Space>;
  /** The current state of the notification */
  state: InAppNotificationState;
  /** When (UTC) was the notification sent. */
  triggeredAt: Scalars['DateTime'];
  /** The Contributor who triggered the notification. */
  triggeredBy?: Maybe<Contributor>;
  /** The type of the notification */
  type: NotificationEventType;
};

export enum InAppNotificationState {
  Archived = 'ARCHIVED',
  Read = 'READ',
  Unread = 'UNREAD',
}

export type InAppNotificationUserMentioned = InAppNotification & {
  __typename?: 'InAppNotificationUserMentioned';
  /** Which category (role) is this notification targeted to. */
  category: InAppNotificationCategory;
  /** The comment that the contributor was mentioned in. */
  comment: Scalars['String'];
  /** The display name of the resource where the comment was created. */
  commentOriginName: Scalars['String'];
  /** The url of the resource where the comment was created. */
  commentUrl: Scalars['String'];
  /** The type of the Contributor that joined. */
  contributorType: RoleSetContributorType;
  id: Scalars['UUID'];
  /** The receiver of the notification. */
  receiver: Contributor;
  /** The current state of the notification */
  state: InAppNotificationState;
  /** When (UTC) was the notification sent. */
  triggeredAt: Scalars['DateTime'];
  /** The Contributor who triggered the notification. */
  triggeredBy?: Maybe<Contributor>;
  /** The type of the notification */
  type: NotificationEventType;
};

export type InnovationFlow = {
  __typename?: 'InnovationFlow';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The currently selected State in this Flow. */
  currentState: InnovationFlowState;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this InnovationFlow. */
  profile: Profile;
  /** The settings for this InnovationFlow. */
  settings: InnovationFlowSettings;
  /** The set of States in use in this Flow. */
  states: Array<InnovationFlowState>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type InnovationFlowSettings = {
  __typename?: 'InnovationFlowSettings';
  /** The maximum number of allowed states. */
  maximumNumberOfStates: Scalars['Float'];
  /** The minimum number of allowed states */
  minimumNumberOfStates: Scalars['Float'];
};

export type InnovationFlowState = {
  __typename?: 'InnovationFlowState';
  /** The explanation text to clarify the state. */
  description: Scalars['Markdown'];
  /** The display name for the State */
  displayName: Scalars['String'];
};

export type InnovationHub = {
  __typename?: 'InnovationHub';
  /** The Innovation Hub account. */
  account: Account;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Flag to control if this InnovationHub is listed in the platform store. */
  listedInStore: Scalars['Boolean'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Innovation Hub profile. */
  profile: Profile;
  /** The InnovationHub provider. */
  provider: Contributor;
  /** Visibility of the InnovationHub in searches. */
  searchVisibility: SearchVisibility;
  spaceListFilter?: Maybe<Array<Space>>;
  /** If defined, what type of visibility to filter the Spaces on. You can have only one type of filter active at any given time. */
  spaceVisibilityFilter?: Maybe<SpaceVisibility>;
  /** The subdomain associated with this Innovation Hub. */
  subdomain: Scalars['String'];
  /** Type of Innovation Hub */
  type: InnovationHubType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum InnovationHubType {
  List = 'LIST',
  Visibility = 'VISIBILITY',
}

export type InnovationPack = {
  __typename?: 'InnovationPack';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Flag to control if this InnovationPack is listed in the platform store. */
  listedInStore: Scalars['Boolean'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this InnovationPack. */
  profile: Profile;
  /** The InnovationPack provider. */
  provider: Contributor;
  /** Visibility of the InnovationPack in searches. */
  searchVisibility: SearchVisibility;
  /** The templatesSet in use by this InnovationPack */
  templatesSet?: Maybe<TemplatesSet>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type InnovationPacksInput = {
  /** The number of Discussion entries to return; if omitted return all InnovationPacks. */
  limit?: InputMaybe<Scalars['Float']>;
  /** The sort order of the InnovationPacks to return. Defaults to number of templates Descending. */
  orderBy?: InputMaybe<InnovationPacksOrderBy>;
};

export enum InnovationPacksOrderBy {
  NumberOfTemplatesAsc = 'NUMBER_OF_TEMPLATES_ASC',
  NumberOfTemplatesDesc = 'NUMBER_OF_TEMPLATES_DESC',
  Random = 'RANDOM',
}

export type InputCreatorQueryResults = {
  __typename?: 'InputCreatorQueryResults';
  /** Create an input based on the provided Callout */
  callout?: Maybe<CreateCalloutData>;
  /** Create an input based on the provided Collaboration */
  collaboration?: Maybe<CreateCollaborationData>;
  /** Create an input based on the provided Community Guidelines */
  communityGuidelines?: Maybe<CreateCommunityGuidelinesData>;
  /** Create an input based on the provided InnovationFlow */
  innovationFlow?: Maybe<CreateInnovationFlowData>;
  /** Create an input based on the provided Whiteboard */
  whiteboard?: Maybe<CreateWhiteboardData>;
};

export type InputCreatorQueryResultsCalloutArgs = {
  ID: Scalars['UUID'];
};

export type InputCreatorQueryResultsCollaborationArgs = {
  ID: Scalars['UUID'];
};

export type InputCreatorQueryResultsCommunityGuidelinesArgs = {
  ID: Scalars['UUID'];
};

export type InputCreatorQueryResultsInnovationFlowArgs = {
  ID: Scalars['UUID'];
};

export type InputCreatorQueryResultsWhiteboardArgs = {
  ID: Scalars['UUID'];
};

export type Invitation = {
  __typename?: 'Invitation';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Contributor who is invited. */
  contributor: Contributor;
  /** The type of contributor that is invited. */
  contributorType: RoleSetContributorType;
  /** The User who triggered the invitation. */
  createdBy: User;
  createdDate: Scalars['DateTime'];
  /** An additional role to assign to the Contributor, in addition to the entry Role. */
  extraRole?: Maybe<RoleName>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Whether to also add the invited contributor to the parent community. */
  invitedToParent: Scalars['Boolean'];
  /** Is this lifecycle in a final state (done). */
  isFinalized: Scalars['Boolean'];
  lifecycle: Lifecycle;
  /** The next events of this Lifecycle. */
  nextEvents: Array<Scalars['String']>;
  /** The current state of this Lifecycle. */
  state: Scalars['String'];
  updatedDate: Scalars['DateTime'];
  welcomeMessage?: Maybe<Scalars['String']>;
};

export type InvitationEventInput = {
  eventName: Scalars['String'];
  invitationID: Scalars['UUID'];
};

export type InviteForEntryRoleOnRoleSetInput = {
  /** An additional role to assign to the Contributors, in addition to the entry Role. */
  extraRole?: InputMaybe<RoleName>;
  /** The identifiers for the contributors being invited. */
  invitedContributors: Array<Scalars['UUID']>;
  roleSetID: Scalars['UUID'];
  welcomeMessage?: InputMaybe<Scalars['String']>;
};

export type InviteNewContributorForRoleOnRoleSetInput = {
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** An additional role to assign to the Contributors, in addition to the entry Role. */
  roleSetExtraRole?: InputMaybe<RoleName>;
  roleSetID: Scalars['UUID'];
  welcomeMessage?: InputMaybe<Scalars['String']>;
};

export type JoinAsEntryRoleOnRoleSetInput = {
  roleSetID: Scalars['UUID'];
};

export type KnowledgeBase = {
  __typename?: 'KnowledgeBase';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The calloutsSet with Callouts in use by this KnowledgeBase */
  calloutsSet: CalloutsSet;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for describing this KnowledgeBase. */
  profile: Profile;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type LatestReleaseDiscussion = {
  __typename?: 'LatestReleaseDiscussion';
  /** Id of the latest release discussion. */
  id: Scalars['String'];
  /** NameID of the latest release discussion. */
  nameID: Scalars['String'];
};

export type Library = {
  __typename?: 'Library';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationHub listed on this platform */
  innovationHubs: Array<InnovationHub>;
  /** The Innovation Packs in the platform Innovation Library. */
  innovationPacks: Array<InnovationPack>;
  /** The Templates in the Innovation Library, together with information about the InnovationPack. */
  templates: Array<TemplateResult>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The VirtualContributors listed on this platform */
  virtualContributors: Array<VirtualContributor>;
};

export type LibraryInnovationPacksArgs = {
  queryData?: InputMaybe<InnovationPacksInput>;
};

export type LibraryTemplatesArgs = {
  filter?: InputMaybe<LibraryTemplatesFilterInput>;
};

export type LibraryTemplatesFilterInput = {
  /** Return Templates within the Library matching the specified Template Types. */
  types?: InputMaybe<Array<TemplateType>>;
};

export type License = {
  __typename?: 'License';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The set of License Entitlement Types on that entity. */
  availableEntitlements?: Maybe<Array<LicenseEntitlementType>>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The set of Entitlements associated with the License applicable to this entity. */
  entitlements: Array<LicenseEntitlement>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The type of entity that this License is being used with. */
  type?: Maybe<LicenseType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type LicenseEntitlement = {
  __typename?: 'LicenseEntitlement';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Data type of the entitlement, e.g. Limit, Feature flag etc. */
  dataType: LicenseEntitlementDataType;
  /** If the Entitlement is enabled */
  enabled: Scalars['Boolean'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Whether the specified entitlement is available. */
  isAvailable: Scalars['Boolean'];
  /** Limit of the entitlement */
  limit: Scalars['Float'];
  /** Type of the entitlement, e.g. Space, Whiteboard contributors etc. */
  type: LicenseEntitlementType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The amount of the spcified entitlement used. */
  usage: Scalars['Float'];
};

export enum LicenseEntitlementDataType {
  Flag = 'FLAG',
  Limit = 'LIMIT',
}

export enum LicenseEntitlementType {
  AccountInnovationHub = 'ACCOUNT_INNOVATION_HUB',
  AccountInnovationPack = 'ACCOUNT_INNOVATION_PACK',
  AccountSpaceFree = 'ACCOUNT_SPACE_FREE',
  AccountSpacePlus = 'ACCOUNT_SPACE_PLUS',
  AccountSpacePremium = 'ACCOUNT_SPACE_PREMIUM',
  AccountVirtualContributor = 'ACCOUNT_VIRTUAL_CONTRIBUTOR',
  SpaceFlagSaveAsTemplate = 'SPACE_FLAG_SAVE_AS_TEMPLATE',
  SpaceFlagVirtualContributorAccess = 'SPACE_FLAG_VIRTUAL_CONTRIBUTOR_ACCESS',
  SpaceFlagWhiteboardMultiUser = 'SPACE_FLAG_WHITEBOARD_MULTI_USER',
  SpaceFree = 'SPACE_FREE',
  SpacePlus = 'SPACE_PLUS',
  SpacePremium = 'SPACE_PREMIUM',
}

export type LicensePlan = {
  __typename?: 'LicensePlan';
  /** Assign this plan to all new Organization accounts */
  assignToNewOrganizationAccounts: Scalars['Boolean'];
  /** Assign this plan to all new User accounts */
  assignToNewUserAccounts: Scalars['Boolean'];
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Is this plan enabled? */
  enabled: Scalars['Boolean'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Is this plan free? */
  isFree: Scalars['Boolean'];
  /** The credential to represent this plan */
  licenseCredential: LicensingCredentialBasedCredentialType;
  /** The name of the License Plan */
  name: Scalars['String'];
  /** The price per month of this plan. */
  pricePerMonth?: Maybe<Scalars['Float']>;
  /** Does this plan require contact support */
  requiresContactSupport: Scalars['Boolean'];
  /** Does this plan require a payment method? */
  requiresPaymentMethod: Scalars['Boolean'];
  /** The sorting order for this Plan. */
  sortOrder: Scalars['Float'];
  /** Is there a trial period enabled */
  trialEnabled: Scalars['Boolean'];
  /** The type of this License Plan. */
  type: LicensingCredentialBasedPlanType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type LicensePolicy = {
  __typename?: 'LicensePolicy';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The set of credential rules that are contained by this License Policy. */
  credentialRules: Array<LicensingCredentialBasedPolicyCredentialRule>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum LicenseType {
  Account = 'ACCOUNT',
  Collaboration = 'COLLABORATION',
  Roleset = 'ROLESET',
  Space = 'SPACE',
  Whiteboard = 'WHITEBOARD',
}

export type Licensing = {
  __typename?: 'Licensing';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The License Plans in use on the platform. */
  plans: Array<LicensePlan>;
  /** The LicensePolicy in use by the Licensing setup. */
  policy: LicensePolicy;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum LicensingCredentialBasedCredentialType {
  AccountLicensePlus = 'ACCOUNT_LICENSE_PLUS',
  SpaceFeatureSaveAsTemplate = 'SPACE_FEATURE_SAVE_AS_TEMPLATE',
  SpaceFeatureVirtualContributors = 'SPACE_FEATURE_VIRTUAL_CONTRIBUTORS',
  SpaceFeatureWhiteboardMultiUser = 'SPACE_FEATURE_WHITEBOARD_MULTI_USER',
  SpaceLicenseEnterprise = 'SPACE_LICENSE_ENTERPRISE',
  SpaceLicenseFree = 'SPACE_LICENSE_FREE',
  SpaceLicensePlus = 'SPACE_LICENSE_PLUS',
  SpaceLicensePremium = 'SPACE_LICENSE_PREMIUM',
}

export enum LicensingCredentialBasedPlanType {
  AccountFeatureFlag = 'ACCOUNT_FEATURE_FLAG',
  AccountPlan = 'ACCOUNT_PLAN',
  SpaceFeatureFlag = 'SPACE_FEATURE_FLAG',
  SpacePlan = 'SPACE_PLAN',
}

export type LicensingCredentialBasedPolicyCredentialRule = {
  __typename?: 'LicensingCredentialBasedPolicyCredentialRule';
  credentialType: LicensingCredentialBasedCredentialType;
  grantedEntitlements: Array<LicensingGrantedEntitlement>;
  name?: Maybe<Scalars['String']>;
};

export type LicensingGrantedEntitlement = {
  __typename?: 'LicensingGrantedEntitlement';
  limit: Scalars['Float'];
  /** The entitlement that is granted. */
  type: LicenseEntitlementType;
};

export type Lifecycle = {
  __typename?: 'Lifecycle';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type Link = {
  __typename?: 'Link';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for framing the associated Link Contribution. */
  profile: Profile;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** URI of the Link */
  uri: Scalars['String'];
};

export type Location = {
  __typename?: 'Location';
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  /** City of the location. */
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  postalCode?: Maybe<Scalars['String']>;
  stateOrProvince?: Maybe<Scalars['String']>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type LookupByNameQueryResults = {
  __typename?: 'LookupByNameQueryResults';
  /** Lookup the ID of the specified InnovationHub using a NameID */
  innovationHub?: Maybe<Scalars['String']>;
  /** Lookup the ID of the specified InnovationPack using a NameID */
  innovationPack?: Maybe<Scalars['String']>;
  /** Lookup the ID of the specified Organization using a NameID */
  organization?: Maybe<Scalars['String']>;
  /** Lookup a Space using a NameID */
  space?: Maybe<Space>;
  /** Lookup the ID of the specified Template using a templatesSetId and the template NameID */
  template?: Maybe<Scalars['String']>;
  /** Lookup the ID of the specified User using a NameID */
  user?: Maybe<Scalars['String']>;
  /** Lookup the ID of the specified Virtual Contributor using a NameID */
  virtualContributor?: Maybe<Scalars['String']>;
};

export type LookupByNameQueryResultsInnovationHubArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupByNameQueryResultsInnovationPackArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupByNameQueryResultsOrganizationArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupByNameQueryResultsSpaceArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupByNameQueryResultsTemplateArgs = {
  NAMEID: Scalars['NameID'];
  templatesSetID: Scalars['UUID'];
};

export type LookupByNameQueryResultsUserArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupByNameQueryResultsVirtualContributorArgs = {
  NAMEID: Scalars['NameID'];
};

export type LookupMyPrivilegesQueryResults = {
  __typename?: 'LookupMyPrivilegesQueryResults';
  /** Lookup myPrivileges on the specified Account */
  account?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Application */
  application?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Calendar */
  calendar?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified CalendarEvent */
  calendarEvent?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Callout */
  callout?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Collaboration */
  collaboration?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Community */
  community?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Community guidelines */
  communityGuidelines?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Document */
  document?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified InnovationFlow */
  innovationFlow?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified InnovationHub */
  innovationHub?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified InnovationPack */
  innovationPack?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Invitation */
  invitation?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified License */
  license?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Post */
  post?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Profile */
  profile?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified RoleSet */
  roleSet?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Room */
  room?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Space */
  space?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified SpaceAbout */
  spaceAbout?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified StorageAggregator */
  storageAggregator?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified StorageBucket */
  storageBucket?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Template */
  template?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified TemplatesManager */
  templatesManager?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified TemplatesSet */
  templatesSet?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified User */
  user?: Maybe<Array<AuthorizationPrivilege>>;
  /** A particular VirtualContributor */
  virtualContributor?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup myPrivileges on the specified Whiteboard */
  whiteboard?: Maybe<Array<AuthorizationPrivilege>>;
};

export type LookupMyPrivilegesQueryResultsAccountArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsApplicationArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCalendarArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCalendarEventArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCalloutArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCollaborationArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCommunityArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsCommunityGuidelinesArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsDocumentArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsInnovationFlowArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsInnovationHubArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsInnovationPackArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsInvitationArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsLicenseArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsPostArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsProfileArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsRoleSetArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsRoomArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsSpaceArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsSpaceAboutArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsStorageAggregatorArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsStorageBucketArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsTemplateArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsTemplatesManagerArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsTemplatesSetArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsUserArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsVirtualContributorArgs = {
  ID: Scalars['UUID'];
};

export type LookupMyPrivilegesQueryResultsWhiteboardArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResults = {
  __typename?: 'LookupQueryResults';
  /** Lookup the specified SpaceAbout */
  about?: Maybe<SpaceAbout>;
  /** Lookup the specified Account */
  account?: Maybe<Account>;
  /** Lookup the specified Application */
  application?: Maybe<Application>;
  /** Lookup the specified Authorization Policy */
  authorizationPolicy?: Maybe<Authorization>;
  /** The privileges granted to the specified user based on this Authorization Policy. */
  authorizationPrivilegesForUser?: Maybe<Array<AuthorizationPrivilege>>;
  /** Lookup the specified Calendar */
  calendar?: Maybe<Calendar>;
  /** Lookup the specified CalendarEvent */
  calendarEvent?: Maybe<CalendarEvent>;
  /** Lookup the specified Callout */
  callout?: Maybe<Callout>;
  /** Lookup the specified CalloutsSet */
  calloutsSet?: Maybe<CalloutsSet>;
  /** Lookup the specified Collaboration */
  collaboration?: Maybe<Collaboration>;
  /** Lookup the specified Community */
  community?: Maybe<Community>;
  /** Lookup the specified Community guidelines */
  communityGuidelines?: Maybe<CommunityGuidelines>;
  /** Lookup the specified Document */
  document?: Maybe<Document>;
  /** Lookup the specified InnovationFlow */
  innovationFlow?: Maybe<InnovationFlow>;
  /** Lookup the specified InnovationHub */
  innovationHub?: Maybe<InnovationHub>;
  /** Lookup the specified InnovationPack */
  innovationPack?: Maybe<InnovationPack>;
  /** Lookup the specified Invitation */
  invitation?: Maybe<Invitation>;
  /** Lookup as specific KnowledgeBase */
  knowledgeBase: KnowledgeBase;
  /** Lookup the specified License */
  license?: Maybe<License>;
  /** Lookup myPrivileges on the specified entity. */
  myPrivileges?: Maybe<LookupMyPrivilegesQueryResults>;
  /** Lookup the specified Organization using a ID */
  organization?: Maybe<Organization>;
  /** Lookup the specified Post */
  post?: Maybe<Post>;
  /** Lookup the specified Profile */
  profile?: Maybe<Profile>;
  /** Lookup the specified RoleSet */
  roleSet?: Maybe<RoleSet>;
  /** Lookup the specified Room */
  room?: Maybe<Room>;
  /** Lookup the specified Space */
  space?: Maybe<Space>;
  /** Lookup the specified StorageAggregator */
  storageAggregator?: Maybe<StorageAggregator>;
  /** Lookup the specified StorageBucket */
  storageBucket?: Maybe<StorageBucket>;
  /** Lookup the specified Template */
  template?: Maybe<Template>;
  /** Lookup the specified TemplatesManager */
  templatesManager?: Maybe<TemplatesManager>;
  /** Lookup the specified TemplatesSet */
  templatesSet?: Maybe<TemplatesSet>;
  /** A particular User */
  user?: Maybe<User>;
  /** A particular VirtualContributor */
  virtualContributor?: Maybe<VirtualContributor>;
  /** Lookup the specified Whiteboard */
  whiteboard?: Maybe<Whiteboard>;
};

export type LookupQueryResultsAboutArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsAccountArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsApplicationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsAuthorizationPolicyArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsAuthorizationPrivilegesForUserArgs = {
  authorizationPolicyID: Scalars['UUID'];
  userID: Scalars['UUID'];
};

export type LookupQueryResultsCalendarArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCalendarEventArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCalloutArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCalloutsSetArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCollaborationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCommunityArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCommunityGuidelinesArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsDocumentArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationFlowArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationHubArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationPackArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInvitationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsKnowledgeBaseArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsLicenseArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsOrganizationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsPostArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsProfileArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsRoleSetArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsRoomArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsSpaceArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsStorageAggregatorArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsStorageBucketArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsTemplateArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsTemplatesManagerArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsTemplatesSetArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsUserArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsVirtualContributorArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsWhiteboardArgs = {
  ID: Scalars['UUID'];
};

export type MeQueryResults = {
  __typename?: 'MeQueryResults';
  /** The community applications current authenticated user can act on. */
  communityApplications: Array<CommunityApplicationResult>;
  /** The invitations the current authenticated user can act on. */
  communityInvitations: Array<CommunityInvitationResult>;
  /** The number of invitations the current authenticated user can act on. */
  communityInvitationsCount: Scalars['Float'];
  /** The query id */
  id: Scalars['String'];
  /** The Spaces I am contributing to */
  mySpaces: Array<MySpaceResults>;
  /** The Spaces the current user is a member of as a flat list. */
  spaceMembershipsFlat: Array<CommunityMembershipResult>;
  /** The hierarchy of the Spaces the current user is a member. */
  spaceMembershipsHierarchical: Array<CommunityMembershipResult>;
  /** The current authenticated User;  null if not yet registered on the platform */
  user?: Maybe<User>;
};

export type MeQueryResultsCommunityApplicationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type MeQueryResultsCommunityInvitationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type MeQueryResultsCommunityInvitationsCountArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type MeQueryResultsMySpacesArgs = {
  limit?: InputMaybe<Scalars['Float']>;
};

export type MeQueryResultsSpaceMembershipsHierarchicalArgs = {
  limit?: InputMaybe<Scalars['Float']>;
};

/** A message that was sent either as an Update or as part of a Discussion. */
export type Message = {
  __typename?: 'Message';
  /** The id for the message event. */
  id: Scalars['MessageID'];
  /** The message being sent */
  message: Scalars['Markdown'];
  /** Reactions on this message */
  reactions: Array<Reaction>;
  /** The User or Virtual Contributor that created this Message */
  sender?: Maybe<Contributor>;
  /** The message being replied to */
  threadID?: Maybe<Scalars['String']>;
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

/** A detailed answer to a question, typically from an AI service. */
export type MessageAnswerQuestion = {
  __typename?: 'MessageAnswerQuestion';
  /** Error message if an error occurred */
  error?: Maybe<Scalars['String']>;
  /** The id of the answer; null if an error was returned */
  id?: Maybe<Scalars['String']>;
  /** The original question */
  question: Scalars['String'];
  /** Message successfully sent. If false, error will have the reason. */
  success: Scalars['Boolean'];
};

export type Metadata = {
  __typename?: 'Metadata';
  /** Collection of metadata about Alkemio services. */
  services: Array<ServiceMetadata>;
};

export type MigrateEmbeddings = {
  __typename?: 'MigrateEmbeddings';
  /** Result from the mutation execution. */
  success: Scalars['Boolean'];
};

export enum MimeType {
  Avif = 'AVIF',
  Bmp = 'BMP',
  Doc = 'DOC',
  Docx = 'DOCX',
  Gif = 'GIF',
  Jpeg = 'JPEG',
  Jpg = 'JPG',
  Odp = 'ODP',
  Ods = 'ODS',
  Odt = 'ODT',
  Pdf = 'PDF',
  Png = 'PNG',
  Potm = 'POTM',
  Potx = 'POTX',
  Ppsm = 'PPSM',
  Ppsx = 'PPSX',
  Ppt = 'PPT',
  Pptm = 'PPTM',
  Pptx = 'PPTX',
  Svg = 'SVG',
  Webp = 'WEBP',
  Xls = 'XLS',
  Xlsx = 'XLSX',
  Xpng = 'XPNG',
}

export type MoveCalloutContributionInput = {
  /** ID of the Callout to move the Contribution to. */
  calloutID: Scalars['UUID'];
  /** ID of the Contribution to move. */
  contributionID: Scalars['UUID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add a reaction to a message from the specified Room. */
  addReactionToMessageInRoom: Reaction;
  /** Ensure all community members are registered for communications. */
  adminCommunicationEnsureAccessToCommunications: Scalars['Boolean'];
  /** Remove an orphaned room from messaging platform. */
  adminCommunicationRemoveOrphanedRoom: Scalars['Boolean'];
  /** Allow updating the state flags of a particular rule. */
  adminCommunicationUpdateRoomState: Scalars['Boolean'];
  /** Ingests new data into Elasticsearch from scratch. This will delete all existing data and ingest new data from the source. This is an admin only operation. */
  adminSearchIngestFromScratch: Scalars['String'];
  /** Update the Avatar on the Profile with the spedified profileID to be stored as a Document. */
  adminUpdateContributorAvatars: Profile;
  /** Remove the Kratos account associated with the specified User. Note: the Users profile on the platform is not deleted. */
  adminUserAccountDelete: User;
  /** Create a test customer on wingback. */
  adminWingbackCreateTestCustomer: Scalars['String'];
  /** Get wingback customer entitlements. */
  adminWingbackGetCustomerEntitlements: Array<LicensingGrantedEntitlement>;
  /** Reset the Authorization Policy on the specified AiServer. */
  aiServerAuthorizationPolicyReset: AiServer;
  /** Creates a new AiPersonaService on the aiServer. */
  aiServerCreateAiPersonaService: AiPersonaService;
  /** Deletes the specified AiPersonaService. */
  aiServerDeleteAiPersonaService: AiPersonaService;
  /** Updates the specified AI Persona. */
  aiServerUpdateAiPersonaService: AiPersonaService;
  /** Apply to join the specified RoleSet in the entry Role. */
  applyForEntryRoleOnRoleSet: Application;
  /** Ask the chat engine for guidance. */
  askChatGuidanceQuestion: MessageAnswerQuestion;
  /** Assign the specified LicensePlan to an Account. */
  assignLicensePlanToAccount: Account;
  /** Assign the specified LicensePlan to a Space. */
  assignLicensePlanToSpace: Space;
  /** Assigns a User to a role on the Platform. */
  assignPlatformRoleToUser: User;
  /** Assigns an Organization a Role in the specified Community. */
  assignRoleToOrganization: Organization;
  /** Assigns a User to a role in the specified Community. */
  assignRoleToUser: User;
  /** Assigns a Virtual Contributor to a role in the specified Community. */
  assignRoleToVirtualContributor: VirtualContributor;
  /** Assigns a User as a member of the specified User Group. */
  assignUserToGroup: UserGroup;
  /** Reset the Authorization Policy on all entities */
  authorizationPolicyResetAll: Scalars['String'];
  /** Reset the Authorization Policy on the specified Account. */
  authorizationPolicyResetOnAccount: Account;
  /** Reset the Authorization Policy on the specified Organization. */
  authorizationPolicyResetOnOrganization: Organization;
  /** Reset the Authorization Policy on the specified Platform. */
  authorizationPolicyResetOnPlatform: Platform;
  /** Reset the Authorization policy on the specified User. */
  authorizationPolicyResetOnUser: User;
  /** Reset the specified Authorization Policy to global admin privileges */
  authorizationPolicyResetToGlobalAdminsAccess: Authorization;
  /** Generate Alkemio user credential offer */
  beginAlkemioUserVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate community member credential offer */
  beginCommunityMemberVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate verified credential share request */
  beginVerifiedCredentialRequestInteraction: AgentBeginVerifiedCredentialRequestOutput;
  /** Deletes collections nameID-... */
  cleanupCollections: MigrateEmbeddings;
  /** Creates a new Space by converting an existing Challenge. */
  convertChallengeToSpace: Space;
  /** Creates a new Challenge by converting an existing Opportunity. */
  convertOpportunityToChallenge: Space;
  /** Convert a VC of type ALKEMIO_SPACE to be of type KNOWLEDGE_BASE. All Callouts from the Space currently being used are moved to the Knowledge Base. Note: only allowed for VCs using a Space within the same Account. */
  convertVirtualContributorToUseKnowledgeBase: VirtualContributor;
  /** Create a new Callout on the CalloutsSet. */
  createCalloutOnCalloutsSet: Callout;
  /** Create a guidance chat room. */
  createChatGuidanceRoom?: Maybe<Room>;
  /** Create a new Contribution on the Callout. */
  createContributionOnCallout: CalloutContribution;
  /** Creates a new Discussion as part of this Forum. */
  createDiscussion: Discussion;
  /** Create a new CalendarEvent on the Calendar. */
  createEventOnCalendar: CalendarEvent;
  /** Creates a new User Group in the specified Community. */
  createGroupOnCommunity: UserGroup;
  /** Creates a new User Group for the specified Organization. */
  createGroupOnOrganization: UserGroup;
  /** Create an Innovation Hub on the specified account */
  createInnovationHub: InnovationHub;
  /** Creates a new InnovationPack on an Account. */
  createInnovationPack: InnovationPack;
  /** Create a new LicensePlan on the Licensing. */
  createLicensePlan: LicensePlan;
  /** Creates a new Organization on the platform. */
  createOrganization: Organization;
  /** Creates a new Reference on the specified Profile. */
  createReferenceOnProfile: Reference;
  /** Creates a new Level Zero Space within the specified Account. */
  createSpace: Space;
  /** Creates a new Subspace within the specified Space. */
  createSubspace: Space;
  /** Creates a new Tagset on the specified Profile */
  createTagsetOnProfile: Tagset;
  /** Creates a new Template on the specified TemplatesSet. */
  createTemplate: Template;
  /** Creates a new Template on the specified TemplatesSet using the provided Collaboration as content. */
  createTemplateFromCollaboration: Template;
  /** Creates a new User on the platform. */
  createUser: User;
  /** Creates a new User profile on the platform for a user that has a valid Authentication session. */
  createUserNewRegistration: User;
  /** Creates a new VirtualContributor on an Account. */
  createVirtualContributor: VirtualContributor;
  /** Creates an account in Wingback */
  createWingbackAccount: Scalars['String'];
  /** Deletes the specified CalendarEvent. */
  deleteCalendarEvent: CalendarEvent;
  /** Delete a Callout. */
  deleteCallout: Callout;
  /** Deletes the specified Discussion. */
  deleteDiscussion: Discussion;
  /** Deletes the specified Document. */
  deleteDocument: Document;
  /** Delete Innovation Hub. */
  deleteInnovationHub: InnovationHub;
  /** Deletes the specified InnovationPack. */
  deleteInnovationPack: InnovationPack;
  /** Removes the specified User invitation. */
  deleteInvitation: Invitation;
  /** Deletes the specified LicensePlan. */
  deleteLicensePlan: LicensePlan;
  /** Deletes the specified Link. */
  deleteLink: Link;
  /** Deletes the specified Organization. */
  deleteOrganization: Organization;
  /** Removes the specified User platformInvitation. */
  deletePlatformInvitation: PlatformInvitation;
  /** Deletes the specified Post. */
  deletePost: Post;
  /** Deletes the specified Reference. */
  deleteReference: Reference;
  /** Deletes the specified Space. */
  deleteSpace: Space;
  /** Deletes a Storage Bucket */
  deleteStorageBucket: StorageBucket;
  /** Deletes the specified Template. */
  deleteTemplate: Template;
  /** Deletes the specified User. */
  deleteUser: User;
  /** Removes the specified User Application. */
  deleteUserApplication: Application;
  /** Deletes the specified User Group. */
  deleteUserGroup: UserGroup;
  /** Deletes the specified VirtualContributor. */
  deleteVirtualContributor: VirtualContributor;
  /** Deletes the specified Whiteboard. */
  deleteWhiteboard: Whiteboard;
  /** Trigger an event on the Application. */
  eventOnApplication: Application;
  /** Trigger an event on the Invitation. */
  eventOnInvitation: Invitation;
  /** Trigger an event on the Organization Verification. */
  eventOnOrganizationVerification: OrganizationVerification;
  /** Grants an authorization credential to an Organization. */
  grantCredentialToOrganization: Organization;
  /** Grants an authorization credential to a User. */
  grantCredentialToUser: User;
  /** Invite an existing Contributor to join the specified RoleSet in the Entry Role. */
  inviteContributorsEntryRoleOnRoleSet: Array<Invitation>;
  /** Invite a User to join the platform and the specified RoleSet as a member. */
  inviteUserToPlatformAndRoleSet: PlatformInvitation;
  /** Join the specified RoleSet using the entry Role, without going through an approval process. */
  joinRoleSet: RoleSet;
  /** Reset the License with Entitlements on the specified Account. */
  licenseResetOnAccount: Account;
  /** Sends a message on the specified User`s behalf and returns the room id */
  messageUser: Scalars['String'];
  /** Moves the specified Contribution to another Callout. */
  moveContributionToCallout: CalloutContribution;
  /** Refresh the Bodies of Knowledge on All VCs */
  refreshAllBodiesOfKnowledge: Scalars['Boolean'];
  /** Triggers a request to the backing AI Service to refresh the knowledge that is available to it. */
  refreshVirtualContributorBodyOfKnowledge: Scalars['Boolean'];
  /** Empties the CommunityGuidelines. */
  removeCommunityGuidelinesContent: CommunityGuidelines;
  /** Removes a message. */
  removeMessageOnRoom: Scalars['MessageID'];
  /** Removes a User from a Role on the Platform. */
  removePlatformRoleFromUser: User;
  /** Remove a reaction on a message from the specified Room. */
  removeReactionToMessageInRoom: Scalars['Boolean'];
  /** Removes an Organization from a Role in the specified Community. */
  removeRoleFromOrganization: Organization;
  /** Removes a User from a Role in the specified Community. */
  removeRoleFromUser: User;
  /** Removes a Virtual from a Role in the specified Community. */
  removeRoleFromVirtualContributor: VirtualContributor;
  /** Removes the specified User from specified user group */
  removeUserFromGroup: UserGroup;
  /** Resets the interaction with the chat engine. */
  resetChatGuidance: Scalars['Boolean'];
  /** Reset all license plans on Accounts */
  resetLicenseOnAccounts: Space;
  /** Removes an authorization credential from an Organization. */
  revokeCredentialFromOrganization: Organization;
  /** Removes an authorization credential from a User. */
  revokeCredentialFromUser: User;
  /** Revokes the specified LicensePlan on an Account. */
  revokeLicensePlanFromAccount: Account;
  /** Revokes the specified LicensePlan on a Space. */
  revokeLicensePlanFromSpace: Space;
  /** Sends a reply to a message from the specified Room. */
  sendMessageReplyToRoom: Message;
  /** Send message to Community Leads. */
  sendMessageToCommunityLeads: Scalars['Boolean'];
  /** Send message to an Organization. */
  sendMessageToOrganization: Scalars['Boolean'];
  /** Sends an comment message. Returns the id of the new Update message. */
  sendMessageToRoom: Message;
  /** Send message to a User. */
  sendMessageToUser: Scalars['Boolean'];
  /** Transfer the specified Callout from its current CalloutsSet to the target CalloutsSet. Note: this is experimental, and only for GlobalAdmins. The user that executes the transfer becomes the creator of the Callout. */
  transferCallout: Callout;
  /** Transfer the specified InnovationHub to another Account. */
  transferInnovationHubToAccount: InnovationHub;
  /** Transfer the specified Innovation Pack to another Account. */
  transferInnovationPackToAccount: InnovationPack;
  /** Transfer the specified Space to another Account. */
  transferSpaceToAccount: Space;
  /** Transfer the specified Virtual Contributor to another Account. */
  transferVirtualContributorToAccount: InnovationPack;
  /** Updates the specified AiPersona. */
  updateAiPersona: AiPersona;
  /** User vote if a specific answer is relevant. */
  updateAnswerRelevance: Scalars['Boolean'];
  /** Update the Application Form used by this RoleSet. */
  updateApplicationFormOnRoleSet: RoleSet;
  /** Updates the specified CalendarEvent. */
  updateCalendarEvent: CalendarEvent;
  /** Update a Callout. */
  updateCallout: Callout;
  /** Update the information describing the publishing of the specified Callout. */
  updateCalloutPublishInfo: Callout;
  /** Update the visibility of the specified Callout. */
  updateCalloutVisibility: Callout;
  /** Update the sortOrder field of the supplied Callouts to increase as per the order that they are provided in. */
  updateCalloutsSortOrder: Array<Callout>;
  /** Updates the Collaboration, including InnovationFlow states, from the specified Collaboration Template. */
  updateCollaborationFromTemplate: Collaboration;
  /** Updates the CommunityGuidelines. */
  updateCommunityGuidelines: CommunityGuidelines;
  /** Update the sortOrder field of the Contributions of s Callout. */
  updateContributionsSortOrder: Array<CalloutContribution>;
  /** Updates the specified Discussion. */
  updateDiscussion: Discussion;
  /** Updates the specified Document. */
  updateDocument: Document;
  /** Updates the InnovationFlow. */
  updateInnovationFlow: InnovationFlow;
  /** Updates the InnovationFlow. */
  updateInnovationFlowSelectedState: InnovationFlow;
  /** Updates the specified InnovationFlowState. */
  updateInnovationFlowSingleState: InnovationFlow;
  /** Update Innovation Hub. */
  updateInnovationHub: InnovationHub;
  /** Updates the InnovationPack. */
  updateInnovationPack: InnovationPack;
  /** Updates the LicensePlan. */
  updateLicensePlan: LicensePlan;
  /** Updates the specified Link. */
  updateLink: Link;
  /** Update notification state and return the notification. */
  updateNotificationState: InAppNotificationState;
  /** Updates the specified Organization. */
  updateOrganization: Organization;
  /** Updates the specified Organization platform settings. */
  updateOrganizationPlatformSettings: Organization;
  /** Updates one of the Setting on an Organization */
  updateOrganizationSettings: Organization;
  /** Updates one of the Setting on the Platform */
  updatePlatformSettings: PlatformSettings;
  /** Updates the specified Post. */
  updatePost: Post;
  /** Updates one of the Preferences on a Space */
  updatePreferenceOnUser: Preference;
  /** Updates the specified Tagset. */
  updateProfile: Tagset;
  /** Updates the specified Reference. */
  updateReference: Reference;
  /** Updates the Space. */
  updateSpace: Space;
  /** Update the platform settings, such as nameID, of the specified Space. */
  updateSpacePlatformSettings: Space;
  /** Updates one of the Setting on a Space */
  updateSpaceSettings: Space;
  /** Updates the specified Tagset. */
  updateTagset: Tagset;
  /** Updates the specified Template. */
  updateTemplate: Template;
  /** Updates the specified Template Defaults. */
  updateTemplateDefault: TemplateDefault;
  /** Updates the specified Collaboration Template using the provided Collaboration. */
  updateTemplateFromCollaboration: Template;
  /** Updates the User. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Update the platform settings, such as nameID, email, for the specified User. */
  updateUserPlatformSettings: User;
  /** Updates one of the Setting on a User */
  updateUserSettings: User;
  /** Updates the specified VirtualContributor. */
  updateVirtualContributor: VirtualContributor;
  /** Updates one of the Setting on an Organization */
  updateVirtualContributorSettings: VirtualContributor;
  /** Updates the image URI for the specified Visual. */
  updateVisual: Visual;
  /** Updates the specified Whiteboard. */
  updateWhiteboard: Whiteboard;
  /** Create a new Document on the Storage and return the value as part of the returned Link. */
  uploadFileOnLink: Link;
  /** Create a new Document on the Storage and return the value as part of the returned Reference. */
  uploadFileOnReference: Reference;
  /** Create a new Document on the Storage and return the public Url. */
  uploadFileOnStorageBucket: Scalars['String'];
  /** Uploads and sets an image for the specified Visual. */
  uploadImageOnVisual: Visual;
};

export type MutationAddReactionToMessageInRoomArgs = {
  reactionData: RoomAddReactionToMessageInput;
};

export type MutationAdminCommunicationEnsureAccessToCommunicationsArgs = {
  communicationData: CommunicationAdminEnsureAccessInput;
};

export type MutationAdminCommunicationRemoveOrphanedRoomArgs = {
  orphanedRoomData: CommunicationAdminRemoveOrphanedRoomInput;
};

export type MutationAdminCommunicationUpdateRoomStateArgs = {
  roomStateData: CommunicationAdminUpdateRoomStateInput;
};

export type MutationAdminUpdateContributorAvatarsArgs = {
  profileID: Scalars['UUID'];
};

export type MutationAdminUserAccountDeleteArgs = {
  userID: Scalars['UUID'];
};

export type MutationAdminWingbackGetCustomerEntitlementsArgs = {
  customerID: Scalars['String'];
};

export type MutationAiServerCreateAiPersonaServiceArgs = {
  aiPersonaServiceData: CreateAiPersonaServiceInput;
};

export type MutationAiServerDeleteAiPersonaServiceArgs = {
  deleteData: DeleteAiPersonaServiceInput;
};

export type MutationAiServerUpdateAiPersonaServiceArgs = {
  aiPersonaServiceData: UpdateAiPersonaServiceInput;
};

export type MutationApplyForEntryRoleOnRoleSetArgs = {
  applicationData: ApplyForEntryRoleOnRoleSetInput;
};

export type MutationAskChatGuidanceQuestionArgs = {
  chatData: ChatGuidanceInput;
};

export type MutationAssignLicensePlanToAccountArgs = {
  planData: AssignLicensePlanToAccount;
};

export type MutationAssignLicensePlanToSpaceArgs = {
  planData: AssignLicensePlanToSpace;
};

export type MutationAssignPlatformRoleToUserArgs = {
  roleData: AssignPlatformRoleInput;
};

export type MutationAssignRoleToOrganizationArgs = {
  roleData: AssignRoleOnRoleSetToOrganizationInput;
};

export type MutationAssignRoleToUserArgs = {
  roleData: AssignRoleOnRoleSetToUserInput;
};

export type MutationAssignRoleToVirtualContributorArgs = {
  roleData: AssignRoleOnRoleSetToVirtualContributorInput;
};

export type MutationAssignUserToGroupArgs = {
  membershipData: AssignUserGroupMemberInput;
};

export type MutationAuthorizationPolicyResetOnAccountArgs = {
  authorizationResetData: AccountAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnOrganizationArgs = {
  authorizationResetData: OrganizationAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnUserArgs = {
  authorizationResetData: UserAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetToGlobalAdminsAccessArgs = {
  authorizationID: Scalars['String'];
};

export type MutationBeginCommunityMemberVerifiedCredentialOfferInteractionArgs = {
  communityID: Scalars['String'];
};

export type MutationBeginVerifiedCredentialRequestInteractionArgs = {
  types: Array<Scalars['String']>;
};

export type MutationConvertChallengeToSpaceArgs = {
  convertData: ConvertSubspaceToSpaceInput;
};

export type MutationConvertOpportunityToChallengeArgs = {
  convertData: ConvertSubsubspaceToSubspaceInput;
};

export type MutationConvertVirtualContributorToUseKnowledgeBaseArgs = {
  conversionData: ConversionVcSpaceToVcKnowledgeBaseInput;
};

export type MutationCreateCalloutOnCalloutsSetArgs = {
  calloutData: CreateCalloutOnCalloutsSetInput;
};

export type MutationCreateContributionOnCalloutArgs = {
  contributionData: CreateContributionOnCalloutInput;
};

export type MutationCreateDiscussionArgs = {
  createData: ForumCreateDiscussionInput;
};

export type MutationCreateEventOnCalendarArgs = {
  eventData: CreateCalendarEventOnCalendarInput;
};

export type MutationCreateGroupOnCommunityArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateGroupOnOrganizationArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateInnovationHubArgs = {
  createData: CreateInnovationHubOnAccountInput;
};

export type MutationCreateInnovationPackArgs = {
  innovationPackData: CreateInnovationPackOnAccountInput;
};

export type MutationCreateLicensePlanArgs = {
  planData: CreateLicensePlanOnLicensingFrameworkInput;
};

export type MutationCreateOrganizationArgs = {
  organizationData: CreateOrganizationInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: CreateReferenceOnProfileInput;
};

export type MutationCreateSpaceArgs = {
  spaceData: CreateSpaceOnAccountInput;
};

export type MutationCreateSubspaceArgs = {
  subspaceData: CreateSubspaceInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetData: CreateTagsetOnProfileInput;
};

export type MutationCreateTemplateArgs = {
  templateData: CreateTemplateOnTemplatesSetInput;
};

export type MutationCreateTemplateFromCollaborationArgs = {
  templateData: CreateTemplateFromCollaborationOnTemplatesSetInput;
};

export type MutationCreateUserArgs = {
  userData: CreateUserInput;
};

export type MutationCreateVirtualContributorArgs = {
  virtualContributorData: CreateVirtualContributorOnAccountInput;
};

export type MutationCreateWingbackAccountArgs = {
  accountID: Scalars['UUID'];
};

export type MutationDeleteCalendarEventArgs = {
  deleteData: DeleteCalendarEventInput;
};

export type MutationDeleteCalloutArgs = {
  deleteData: DeleteCalloutInput;
};

export type MutationDeleteDiscussionArgs = {
  deleteData: DeleteDiscussionInput;
};

export type MutationDeleteDocumentArgs = {
  deleteData: DeleteDocumentInput;
};

export type MutationDeleteInnovationHubArgs = {
  deleteData: DeleteInnovationHubInput;
};

export type MutationDeleteInnovationPackArgs = {
  deleteData: DeleteInnovationPackInput;
};

export type MutationDeleteInvitationArgs = {
  deleteData: DeleteInvitationInput;
};

export type MutationDeleteLicensePlanArgs = {
  deleteData: DeleteLicensePlanInput;
};

export type MutationDeleteLinkArgs = {
  deleteData: DeleteLinkInput;
};

export type MutationDeleteOrganizationArgs = {
  deleteData: DeleteOrganizationInput;
};

export type MutationDeletePlatformInvitationArgs = {
  deleteData: DeletePlatformInvitationInput;
};

export type MutationDeletePostArgs = {
  deleteData: DeletePostInput;
};

export type MutationDeleteReferenceArgs = {
  deleteData: DeleteReferenceInput;
};

export type MutationDeleteSpaceArgs = {
  deleteData: DeleteSpaceInput;
};

export type MutationDeleteStorageBucketArgs = {
  deleteData: DeleteStorageBuckeetInput;
};

export type MutationDeleteTemplateArgs = {
  deleteData: DeleteTemplateInput;
};

export type MutationDeleteUserArgs = {
  deleteData: DeleteUserInput;
};

export type MutationDeleteUserApplicationArgs = {
  deleteData: DeleteApplicationInput;
};

export type MutationDeleteUserGroupArgs = {
  deleteData: DeleteUserGroupInput;
};

export type MutationDeleteVirtualContributorArgs = {
  deleteData: DeleteVirtualContributorInput;
};

export type MutationDeleteWhiteboardArgs = {
  whiteboardData: DeleteWhiteboardInput;
};

export type MutationEventOnApplicationArgs = {
  eventData: ApplicationEventInput;
};

export type MutationEventOnInvitationArgs = {
  eventData: InvitationEventInput;
};

export type MutationEventOnOrganizationVerificationArgs = {
  eventData: OrganizationVerificationEventInput;
};

export type MutationGrantCredentialToOrganizationArgs = {
  grantCredentialData: GrantOrganizationAuthorizationCredentialInput;
};

export type MutationGrantCredentialToUserArgs = {
  grantCredentialData: GrantAuthorizationCredentialInput;
};

export type MutationInviteContributorsEntryRoleOnRoleSetArgs = {
  invitationData: InviteForEntryRoleOnRoleSetInput;
};

export type MutationInviteUserToPlatformAndRoleSetArgs = {
  invitationData: InviteNewContributorForRoleOnRoleSetInput;
};

export type MutationJoinRoleSetArgs = {
  joinData: JoinAsEntryRoleOnRoleSetInput;
};

export type MutationLicenseResetOnAccountArgs = {
  resetData: AccountLicenseResetInput;
};

export type MutationMessageUserArgs = {
  messageData: UserSendMessageInput;
};

export type MutationMoveContributionToCalloutArgs = {
  moveContributionData: MoveCalloutContributionInput;
};

export type MutationRefreshVirtualContributorBodyOfKnowledgeArgs = {
  refreshData: RefreshVirtualContributorBodyOfKnowledgeInput;
};

export type MutationRemoveCommunityGuidelinesContentArgs = {
  communityGuidelinesData: RemoveCommunityGuidelinesContentInput;
};

export type MutationRemoveMessageOnRoomArgs = {
  messageData: RoomRemoveMessageInput;
};

export type MutationRemovePlatformRoleFromUserArgs = {
  roleData: RemovePlatformRoleInput;
};

export type MutationRemoveReactionToMessageInRoomArgs = {
  reactionData: RoomRemoveReactionToMessageInput;
};

export type MutationRemoveRoleFromOrganizationArgs = {
  roleData: RemoveRoleOnRoleSetFromOrganizationInput;
};

export type MutationRemoveRoleFromUserArgs = {
  roleData: RemoveRoleOnRoleSetFromUserInput;
};

export type MutationRemoveRoleFromVirtualContributorArgs = {
  roleData: RemoveRoleOnRoleSetFromVirtualContributorInput;
};

export type MutationRemoveUserFromGroupArgs = {
  membershipData: RemoveUserGroupMemberInput;
};

export type MutationRevokeCredentialFromOrganizationArgs = {
  revokeCredentialData: RevokeOrganizationAuthorizationCredentialInput;
};

export type MutationRevokeCredentialFromUserArgs = {
  revokeCredentialData: RevokeAuthorizationCredentialInput;
};

export type MutationRevokeLicensePlanFromAccountArgs = {
  planData: RevokeLicensePlanFromAccount;
};

export type MutationRevokeLicensePlanFromSpaceArgs = {
  planData: RevokeLicensePlanFromSpace;
};

export type MutationSendMessageReplyToRoomArgs = {
  messageData: RoomSendMessageReplyInput;
};

export type MutationSendMessageToCommunityLeadsArgs = {
  messageData: CommunicationSendMessageToCommunityLeadsInput;
};

export type MutationSendMessageToOrganizationArgs = {
  messageData: CommunicationSendMessageToOrganizationInput;
};

export type MutationSendMessageToRoomArgs = {
  messageData: RoomSendMessageInput;
};

export type MutationSendMessageToUserArgs = {
  messageData: CommunicationSendMessageToUserInput;
};

export type MutationTransferCalloutArgs = {
  transferData: TransferCalloutInput;
};

export type MutationTransferInnovationHubToAccountArgs = {
  transferData: TransferAccountInnovationHubInput;
};

export type MutationTransferInnovationPackToAccountArgs = {
  transferData: TransferAccountInnovationPackInput;
};

export type MutationTransferSpaceToAccountArgs = {
  transferData: TransferAccountSpaceInput;
};

export type MutationTransferVirtualContributorToAccountArgs = {
  transferData: TransferAccountVirtualContributorInput;
};

export type MutationUpdateAiPersonaArgs = {
  aiPersonaData: UpdateAiPersonaInput;
};

export type MutationUpdateAnswerRelevanceArgs = {
  input: ChatGuidanceAnswerRelevanceInput;
};

export type MutationUpdateApplicationFormOnRoleSetArgs = {
  applicationFormData: UpdateApplicationFormOnRoleSetInput;
};

export type MutationUpdateCalendarEventArgs = {
  eventData: UpdateCalendarEventInput;
};

export type MutationUpdateCalloutArgs = {
  calloutData: UpdateCalloutEntityInput;
};

export type MutationUpdateCalloutPublishInfoArgs = {
  calloutData: UpdateCalloutPublishInfoInput;
};

export type MutationUpdateCalloutVisibilityArgs = {
  calloutData: UpdateCalloutVisibilityInput;
};

export type MutationUpdateCalloutsSortOrderArgs = {
  sortOrderData: UpdateCalloutsSortOrderInput;
};

export type MutationUpdateCollaborationFromTemplateArgs = {
  updateData: UpdateCollaborationFromTemplateInput;
};

export type MutationUpdateCommunityGuidelinesArgs = {
  communityGuidelinesData: UpdateCommunityGuidelinesEntityInput;
};

export type MutationUpdateContributionsSortOrderArgs = {
  sortOrderData: UpdateContributionCalloutsSortOrderInput;
};

export type MutationUpdateDiscussionArgs = {
  updateData: UpdateDiscussionInput;
};

export type MutationUpdateDocumentArgs = {
  documentData: UpdateDocumentInput;
};

export type MutationUpdateInnovationFlowArgs = {
  innovationFlowData: UpdateInnovationFlowEntityInput;
};

export type MutationUpdateInnovationFlowSelectedStateArgs = {
  innovationFlowStateData: UpdateInnovationFlowSelectedStateInput;
};

export type MutationUpdateInnovationFlowSingleStateArgs = {
  innovationFlowStateData: UpdateInnovationFlowSingleStateInput;
};

export type MutationUpdateInnovationHubArgs = {
  updateData: UpdateInnovationHubInput;
};

export type MutationUpdateInnovationPackArgs = {
  innovationPackData: UpdateInnovationPackInput;
};

export type MutationUpdateLicensePlanArgs = {
  updateData: UpdateLicensePlanInput;
};

export type MutationUpdateLinkArgs = {
  linkData: UpdateLinkInput;
};

export type MutationUpdateNotificationStateArgs = {
  notificationData: UpdateNotificationStateInput;
};

export type MutationUpdateOrganizationArgs = {
  organizationData: UpdateOrganizationInput;
};

export type MutationUpdateOrganizationPlatformSettingsArgs = {
  organizationData: UpdateOrganizationPlatformSettingsInput;
};

export type MutationUpdateOrganizationSettingsArgs = {
  settingsData: UpdateOrganizationSettingsInput;
};

export type MutationUpdatePlatformSettingsArgs = {
  settingsData: UpdatePlatformSettingsInput;
};

export type MutationUpdatePostArgs = {
  postData: UpdatePostInput;
};

export type MutationUpdatePreferenceOnUserArgs = {
  preferenceData: UpdateUserPreferenceInput;
};

export type MutationUpdateProfileArgs = {
  updateData: UpdateClassificationSelectTagsetValueInput;
};

export type MutationUpdateReferenceArgs = {
  referenceData: UpdateReferenceInput;
};

export type MutationUpdateSpaceArgs = {
  spaceData: UpdateSpaceInput;
};

export type MutationUpdateSpacePlatformSettingsArgs = {
  updateData: UpdateSpacePlatformSettingsInput;
};

export type MutationUpdateSpaceSettingsArgs = {
  settingsData: UpdateSpaceSettingsInput;
};

export type MutationUpdateTagsetArgs = {
  updateData: UpdateTagsetInput;
};

export type MutationUpdateTemplateArgs = {
  updateData: UpdateTemplateInput;
};

export type MutationUpdateTemplateDefaultArgs = {
  templateDefaultData: UpdateTemplateDefaultTemplateInput;
};

export type MutationUpdateTemplateFromCollaborationArgs = {
  updateData: UpdateTemplateFromCollaborationInput;
};

export type MutationUpdateUserArgs = {
  userData: UpdateUserInput;
};

export type MutationUpdateUserGroupArgs = {
  userGroupData: UpdateUserGroupInput;
};

export type MutationUpdateUserPlatformSettingsArgs = {
  updateData: UpdateUserPlatformSettingsInput;
};

export type MutationUpdateUserSettingsArgs = {
  settingsData: UpdateUserSettingsInput;
};

export type MutationUpdateVirtualContributorArgs = {
  virtualContributorData: UpdateVirtualContributorInput;
};

export type MutationUpdateVirtualContributorSettingsArgs = {
  settingsData: UpdateVirtualContributorSettingsInput;
};

export type MutationUpdateVisualArgs = {
  updateData: UpdateVisualInput;
};

export type MutationUpdateWhiteboardArgs = {
  whiteboardData: UpdateWhiteboardEntityInput;
};

export type MutationUploadFileOnLinkArgs = {
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileOnLinkInput;
};

export type MutationUploadFileOnReferenceArgs = {
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileOnReferenceInput;
};

export type MutationUploadFileOnStorageBucketArgs = {
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileInput;
};

export type MutationUploadImageOnVisualArgs = {
  file: Scalars['Upload'];
  uploadData: VisualUploadImageInput;
};

export enum MutationType {
  Create = 'CREATE',
  Delete = 'DELETE',
  Update = 'UPDATE',
}

export type MySpaceResults = {
  __typename?: 'MySpaceResults';
  latestActivity?: Maybe<ActivityLogEntry>;
  space: Space;
};

export type Nvp = {
  __typename?: 'NVP';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  value: Scalars['String'];
};

/** The type of the notification */
export enum NotificationEventType {
  CollaborationCalloutPublished = 'COLLABORATION_CALLOUT_PUBLISHED',
  CollaborationDiscussionComment = 'COLLABORATION_DISCUSSION_COMMENT',
  CollaborationPostComment = 'COLLABORATION_POST_COMMENT',
  CollaborationPostCreated = 'COLLABORATION_POST_CREATED',
  CollaborationWhiteboardCreated = 'COLLABORATION_WHITEBOARD_CREATED',
  CommentReply = 'COMMENT_REPLY',
  CommunicationCommentSent = 'COMMUNICATION_COMMENT_SENT',
  CommunicationCommunityMessage = 'COMMUNICATION_COMMUNITY_MESSAGE',
  CommunicationOrganizationMention = 'COMMUNICATION_ORGANIZATION_MENTION',
  CommunicationOrganizationMessage = 'COMMUNICATION_ORGANIZATION_MESSAGE',
  CommunicationUpdateSent = 'COMMUNICATION_UPDATE_SENT',
  CommunicationUserMention = 'COMMUNICATION_USER_MENTION',
  CommunicationUserMessage = 'COMMUNICATION_USER_MESSAGE',
  CommunityApplicationCreated = 'COMMUNITY_APPLICATION_CREATED',
  CommunityInvitationCreated = 'COMMUNITY_INVITATION_CREATED',
  CommunityInvitationCreatedVc = 'COMMUNITY_INVITATION_CREATED_VC',
  CommunityNewMember = 'COMMUNITY_NEW_MEMBER',
  CommunityPlatformInvitationCreated = 'COMMUNITY_PLATFORM_INVITATION_CREATED',
  PlatformForumDiscussionComment = 'PLATFORM_FORUM_DISCUSSION_COMMENT',
  PlatformForumDiscussionCreated = 'PLATFORM_FORUM_DISCUSSION_CREATED',
  PlatformGlobalRoleChange = 'PLATFORM_GLOBAL_ROLE_CHANGE',
  PlatformUserInvitedToRole = 'PLATFORM_USER_INVITED_TO_ROLE',
  PlatformUserRegistered = 'PLATFORM_USER_REGISTERED',
  PlatformUserRemoved = 'PLATFORM_USER_REMOVED',
  SpaceCreated = 'SPACE_CREATED',
}

export type Organization = Contributor &
  Groupable & {
    __typename?: 'Organization';
    /** The account hosted by this Organization. */
    account?: Maybe<Account>;
    /** The Agent representing this User. */
    agent: Agent;
    /** The authorization rules for the Contributor */
    authorization?: Maybe<Authorization>;
    /** Organization contact email */
    contactEmail?: Maybe<Scalars['String']>;
    /** The date at which the entity was created. */
    createdDate?: Maybe<Scalars['DateTime']>;
    /** Domain name; what is verified, eg. alkem.io */
    domain?: Maybe<Scalars['String']>;
    /** Group defined on this organization. */
    group?: Maybe<UserGroup>;
    /** Groups defined on this organization. */
    groups?: Maybe<Array<UserGroup>>;
    /** The ID of the Contributor */
    id: Scalars['UUID'];
    /** Legal name - required if hosting an Space */
    legalEntityName?: Maybe<Scalars['String']>;
    /** Metrics about the activity within this Organization. */
    metrics?: Maybe<Array<Nvp>>;
    /** A name identifier of the Contributor, unique within a given scope. */
    nameID: Scalars['NameID'];
    /** The profile for this Organization. */
    profile: Profile;
    /** The RoleSet for this Organization. */
    roleSet: RoleSet;
    /** The settings for this Organization. */
    settings: OrganizationSettings;
    /** The StorageAggregator for managing storage buckets in use by this Organization */
    storageAggregator?: Maybe<StorageAggregator>;
    /** The date at which the entity was last updated. */
    updatedDate?: Maybe<Scalars['DateTime']>;
    verification: OrganizationVerification;
    /** Organization website */
    website?: Maybe<Scalars['String']>;
  };

export type OrganizationGroupArgs = {
  ID: Scalars['UUID'];
};

export type OrganizationAuthorizationResetInput = {
  /** The identifier of the Organization whose Authorization Policy should be reset. */
  organizationID: Scalars['UUID'];
};

export type OrganizationFilterInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  nameID?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type OrganizationSettings = {
  __typename?: 'OrganizationSettings';
  /** The membership settings for this Organization. */
  membership: OrganizationSettingsMembership;
  /** The privacy settings for this Organization */
  privacy: OrganizationSettingsPrivacy;
};

export type OrganizationSettingsMembership = {
  __typename?: 'OrganizationSettingsMembership';
  /** Allow Users with email addresses matching the domain of this Organization to join. */
  allowUsersMatchingDomainToJoin: Scalars['Boolean'];
};

export type OrganizationSettingsPrivacy = {
  __typename?: 'OrganizationSettingsPrivacy';
  /** Allow contribution roles (membership, lead etc) in Spaces to be visible. */
  contributionRolesPubliclyVisible: Scalars['Boolean'];
};

export type OrganizationVerification = {
  __typename?: 'OrganizationVerification';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Is this lifecycle in a final state (done). */
  isFinalized: Scalars['Boolean'];
  lifecycle: Lifecycle;
  /** The next events of this Lifecycle. */
  nextEvents: Array<Scalars['String']>;
  /** The current state of this Lifecycle. */
  state: Scalars['String'];
  /** Organization verification type */
  status: OrganizationVerificationEnum;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum OrganizationVerificationEnum {
  NotVerified = 'NOT_VERIFIED',
  VerifiedManualAttestation = 'VERIFIED_MANUAL_ATTESTATION',
}

export type OrganizationVerificationEventInput = {
  eventName: Scalars['String'];
  organizationVerificationID: Scalars['UUID'];
};

export type OrganizationsInRolesResponse = {
  __typename?: 'OrganizationsInRolesResponse';
  organizations: Array<Organization>;
  role: RoleName;
};

export type OryConfig = {
  __typename?: 'OryConfig';
  /** Ory Issuer. */
  issuer: Scalars['String'];
  /** Ory Kratos Public Base URL. Used by all Kratos Public Clients. */
  kratosPublicBaseURL: Scalars['String'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The last cursor of the page result */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicate whether more items exist after the returned ones */
  hasNextPage: Scalars['Boolean'];
  /** Indicate whether more items exist before the returned ones */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor of the page result */
  startCursor?: Maybe<Scalars['String']>;
};

export type PaginatedOrganization = {
  __typename?: 'PaginatedOrganization';
  organization: Array<Organization>;
  pageInfo: PageInfo;
  total: Scalars['Float'];
};

export type PaginatedSpaces = {
  __typename?: 'PaginatedSpaces';
  pageInfo: PageInfo;
  spaces: Array<Space>;
  total: Scalars['Float'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  pageInfo: PageInfo;
  total: Scalars['Float'];
  users: Array<User>;
};

export type Platform = {
  __typename?: 'Platform';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Virtual Contributor that is used to provide chat help on the platform. */
  chatGuidanceVirtualContributor: VirtualContributor;
  /** Alkemio configuration. Provides configuration to external services in the Alkemio ecosystem. */
  configuration: Config;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Forum for the platform */
  forum: Forum;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Details about the current Innovation Hub you are in. */
  innovationHub?: Maybe<InnovationHub>;
  /** The latest release discussion. */
  latestReleaseDiscussion?: Maybe<LatestReleaseDiscussion>;
  /** The Innovation Library for the platform */
  library: Library;
  /** The Licensing in use by the platform. */
  licensingFramework: Licensing;
  /** Alkemio Services Metadata. */
  metadata: Metadata;
  /** The RoleSet for this Platform. */
  roleSet: RoleSet;
  /** The settings of the Platform. */
  settings: PlatformSettings;
  /** The StorageAggregator with documents in use by Users + Organizations on the Platform. */
  storageAggregator: StorageAggregator;
  /** The TemplatesManager in use by the Platform */
  templatesManager?: Maybe<TemplatesManager>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type PlatformInnovationHubArgs = {
  id?: InputMaybe<Scalars['UUID']>;
  subdomain?: InputMaybe<Scalars['String']>;
};

export type PlatformFeatureFlag = {
  __typename?: 'PlatformFeatureFlag';
  /** Is this feature flag enabled? */
  enabled: Scalars['Boolean'];
  /** The name of the feature flag */
  name: PlatformFeatureFlagName;
};

export enum PlatformFeatureFlagName {
  Communications = 'COMMUNICATIONS',
  CommunicationsDiscussions = 'COMMUNICATIONS_DISCUSSIONS',
  GuidenceEngine = 'GUIDENCE_ENGINE',
  LandingPage = 'LANDING_PAGE',
  Notifications = 'NOTIFICATIONS',
  Ssi = 'SSI',
  Subscriptions = 'SUBSCRIPTIONS',
  Whiteboards = 'WHITEBOARDS',
}

export type PlatformIntegrationSettings = {
  __typename?: 'PlatformIntegrationSettings';
  /** The list of allowed URLs for iFrames within Markdown content. */
  iframeAllowedUrls: Array<Scalars['String']>;
};

export type PlatformInvitation = {
  __typename?: 'PlatformInvitation';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The User who created the platformInvitation. */
  createdBy: User;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The email address of the external user being invited */
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lastName?: Maybe<Scalars['String']>;
  /** The platform role the user will receive when they sign up */
  platformRole?: Maybe<RoleName>;
  /** Whether a new user profile has been created. */
  profileCreated: Scalars['Boolean'];
  /** An additional role to assign to the Contributor, in addition to the entry Role. */
  roleSetExtraRole?: Maybe<RoleName>;
  /** Whether to also add the invited user to the parent community. */
  roleSetInvitedToParent: Scalars['Boolean'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  welcomeMessage?: Maybe<Scalars['String']>;
};

export type PlatformLocations = {
  __typename?: 'PlatformLocations';
  /** URL to a page about the platform */
  about: Scalars['String'];
  /** URL where users can get tips and tricks */
  aup: Scalars['String'];
  /** URL to the blog of the platform */
  blog: Scalars['String'];
  /** URL where users can see the community forum */
  community: Scalars['String'];
  /** URL for the link Contact in the HomePage and to create a new space with Enterprise plan */
  contactsupport: Scalars['String'];
  /** URL for the documentation site */
  documentation: Scalars['String'];
  /** Main domain of the environment */
  domain: Scalars['String'];
  /** Name of the environment */
  environment: Scalars['String'];
  /** URL to a form for providing feedback */
  feedback: Scalars['String'];
  /** URL to latest forum release discussion where users can get information about the latest release */
  forumreleases: Scalars['String'];
  /** URL for the link Foundation in the HomePage of the application */
  foundation: Scalars['String'];
  /** URL where users can get help */
  help: Scalars['String'];
  /** URL for the link Impact in the HomePage of the application */
  impact: Scalars['String'];
  /** URL to a page about the innovation library */
  innovationLibrary: Scalars['String'];
  /** URL to a page about the collaboration tools */
  inspiration: Scalars['String'];
  /** URL to the landing page of the platform */
  landing: Scalars['String'];
  /** URL where new users can get onboarding help */
  newuser: Scalars['String'];
  /** URL for the link Opensource in the HomePage of the application */
  opensource: Scalars['String'];
  /** URL to the privacy policy for the platform */
  privacy: Scalars['String'];
  /** URL where users can get information about previous releases */
  releases: Scalars['String'];
  /** URL to the security policy for the platform */
  security: Scalars['String'];
  /** URL where users can get support for the platform */
  support: Scalars['String'];
  /** URL for the link Contact in the HomePage to switch between plans */
  switchplan: Scalars['String'];
  /** URL to the terms of usage for the platform */
  terms: Scalars['String'];
  /** URL where users can get tips and tricks */
  tips: Scalars['String'];
};

export type PlatformSettings = {
  __typename?: 'PlatformSettings';
  /** The integration settings for this Platform */
  integration: PlatformIntegrationSettings;
};

export type Post = {
  __typename?: 'Post';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The comments on this Post. */
  comments: Room;
  /** The user that created this Post */
  createdBy?: Maybe<User>;
  /** The date at which the entity was created. */
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Post. */
  profile: Profile;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type Preference = {
  __typename?: 'Preference';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The definition for the Preference */
  definition: PreferenceDefinition;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Value of the preference */
  value: Scalars['String'];
};

export type PreferenceDefinition = {
  __typename?: 'PreferenceDefinition';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Preference description */
  description: Scalars['String'];
  /** The name */
  displayName: Scalars['String'];
  /** The group for the preference within the containing entity type. */
  group: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The type of the Preference, specific to the Entity it is on. */
  type: PreferenceType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Preference value type */
  valueType: PreferenceValueType;
};

export enum PreferenceType {
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationCalloutPublished = 'NOTIFICATION_CALLOUT_PUBLISHED',
  NotificationCommentReply = 'NOTIFICATION_COMMENT_REPLY',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationMention = 'NOTIFICATION_COMMUNICATION_MENTION',
  NotificationCommunicationUpdates = 'NOTIFICATION_COMMUNICATION_UPDATES',
  NotificationCommunicationUpdateSentAdmin = 'NOTIFICATION_COMMUNICATION_UPDATE_SENT_ADMIN',
  NotificationCommunityCollaborationInterestAdmin = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_ADMIN',
  NotificationCommunityCollaborationInterestUser = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_USER',
  NotificationCommunityInvitationUser = 'NOTIFICATION_COMMUNITY_INVITATION_USER',
  NotificationCommunityNewMember = 'NOTIFICATION_COMMUNITY_NEW_MEMBER',
  NotificationCommunityNewMemberAdmin = 'NOTIFICATION_COMMUNITY_NEW_MEMBER_ADMIN',
  NotificationCommunityReviewSubmitted = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED',
  NotificationCommunityReviewSubmittedAdmin = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED_ADMIN',
  NotificationDiscussionCommentCreated = 'NOTIFICATION_DISCUSSION_COMMENT_CREATED',
  NotificationForumDiscussionComment = 'NOTIFICATION_FORUM_DISCUSSION_COMMENT',
  NotificationForumDiscussionCreated = 'NOTIFICATION_FORUM_DISCUSSION_CREATED',
  NotificationOrganizationMention = 'NOTIFICATION_ORGANIZATION_MENTION',
  NotificationOrganizationMessage = 'NOTIFICATION_ORGANIZATION_MESSAGE',
  NotificationPostCommentCreated = 'NOTIFICATION_POST_COMMENT_CREATED',
  NotificationPostCreated = 'NOTIFICATION_POST_CREATED',
  NotificationPostCreatedAdmin = 'NOTIFICATION_POST_CREATED_ADMIN',
  NotificationUserRemoved = 'NOTIFICATION_USER_REMOVED',
  NotificationUserSignUp = 'NOTIFICATION_USER_SIGN_UP',
  NotificationWhiteboardCreated = 'NOTIFICATION_WHITEBOARD_CREATED',
}

export enum PreferenceValueType {
  Boolean = 'BOOLEAN',
  Float = 'FLOAT',
  Int = 'INT',
  String = 'STRING',
}

export type Profile = {
  __typename?: 'Profile';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** A description of the entity associated with this profile. */
  description?: Maybe<Scalars['Markdown']>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The location for this Profile. */
  location?: Maybe<Location>;
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** The storage bucket for this Profile. */
  storageBucket: StorageBucket;
  /** The tagline for this entity. */
  tagline?: Maybe<Scalars['String']>;
  /** The default or named tagset. */
  tagset?: Maybe<Tagset>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
  /** A type of entity that this Profile is being used with. */
  type?: Maybe<ProfileType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The URL at which this profile can be viewed. */
  url: Scalars['String'];
  /** A particular type of visual for this Profile. */
  visual?: Maybe<Visual>;
  /** A list of visuals for this Profile. */
  visuals: Array<Visual>;
};

export type ProfileTagsetArgs = {
  tagsetName?: InputMaybe<TagsetReservedName>;
};

export type ProfileVisualArgs = {
  type: VisualType;
};

export type ProfileCredentialVerified = {
  __typename?: 'ProfileCredentialVerified';
  /** The email */
  userEmail: Scalars['String'];
  /** The vc. */
  vc: Scalars['String'];
};

export enum ProfileType {
  CalendarEvent = 'CALENDAR_EVENT',
  CalloutFraming = 'CALLOUT_FRAMING',
  CommunityGuidelines = 'COMMUNITY_GUIDELINES',
  ContributionLink = 'CONTRIBUTION_LINK',
  Discussion = 'DISCUSSION',
  InnovationFlow = 'INNOVATION_FLOW',
  InnovationHub = 'INNOVATION_HUB',
  InnovationPack = 'INNOVATION_PACK',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  Organization = 'ORGANIZATION',
  Post = 'POST',
  SpaceAbout = 'SPACE_ABOUT',
  Template = 'TEMPLATE',
  User = 'USER',
  UserGroup = 'USER_GROUP',
  VirtualContributor = 'VIRTUAL_CONTRIBUTOR',
  VirtualPersona = 'VIRTUAL_PERSONA',
  Whiteboard = 'WHITEBOARD',
}

export type Query = {
  __typename?: 'Query';
  /** The Accounts on this platform; If accessed through an Innovation Hub will return ONLY the Accounts defined in it. */
  accounts: Array<Account>;
  /** Activity events related to the current user. */
  activityFeed: ActivityFeed;
  /** Activity events related to the current user grouped by Activity type and resource. */
  activityFeedGrouped: Array<ActivityLogEntry>;
  /** Retrieve the ActivityLog for the specified Collaboration */
  activityLogOnCollaboration: Array<ActivityLogEntry>;
  /** All Users that are members of a given room */
  adminCommunicationMembership: CommunicationAdminMembershipResult;
  /** Usage of the messaging platform that are not tied to the domain model. */
  adminCommunicationOrphanedUsage: CommunicationAdminOrphanedUsageResult;
  /** Alkemio AiServer */
  aiServer: AiServer;
  /** Active Spaces only, order by most active in the past X days. */
  exploreSpaces: Array<Space>;
  /** Get supported credential metadata */
  getSupportedVerifiedCredentialMetadata: Array<CredentialMetadataOutput>;
  /** Allow creation of inputs based on existing entities in the domain model */
  inputCreator: InputCreatorQueryResults;
  /** Allow direct lookup of entities from the domain model */
  lookup: LookupQueryResults;
  /** Allow direct lookup of entities using their NameIDs */
  lookupByName: LookupByNameQueryResults;
  /** Information about the current authenticated user */
  me: MeQueryResults;
  /** Get all notifications for the logged in user. */
  notifications: Array<InAppNotification>;
  /** A particular Organization */
  organization: Organization;
  /** The Organizations on this platform */
  organizations: Array<Organization>;
  /** The Organizations on this platform in paginated format */
  organizationsPaginated: PaginatedOrganization;
  /** Alkemio Platform */
  platform: Platform;
  /** The roles that the specified Organization has. */
  rolesOrganization: ContributorRoles;
  /** The roles that that the specified User has. */
  rolesUser: ContributorRoles;
  /** The roles that the specified VirtualContributor has. */
  rolesVirtualContributor: ContributorRoles;
  /** Search the platform for terms supplied */
  search: ISearchResults;
  /** The Spaces on this platform; If accessed through an Innovation Hub will return ONLY the Spaces defined in it. */
  spaces: Array<Space>;
  /** The Spaces on this platform */
  spacesPaginated: PaginatedSpaces;
  /** Information about a specific task */
  task: Task;
  /** All tasks with filtering applied */
  tasks: Array<Task>;
  /** Allow resolving of a URL into a set of IDs. */
  urlResolver: UrlResolverQueryResults;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** Privileges assigned to a User (based on held credentials) given an Authorization defnition. */
  userAuthorizationPrivileges: Array<AuthorizationPrivilege>;
  /** The users who have profiles on this platform */
  users: Array<User>;
  /** The users who have profiles on this platform */
  usersPaginated: PaginatedUsers;
  /** All Users that hold credentials matching the supplied criteria. */
  usersWithAuthorizationCredential: Array<User>;
  /** A particular VirtualContributor */
  virtualContributor: VirtualContributor;
  /** The VirtualContributors on this platform; only accessible to platform admins */
  virtualContributors: Array<VirtualContributor>;
};

export type QueryActivityFeedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  args?: InputMaybe<ActivityFeedQueryArgs>;
  before?: InputMaybe<Scalars['UUID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryActivityFeedGroupedArgs = {
  args?: InputMaybe<ActivityFeedGroupedQueryArgs>;
};

export type QueryActivityLogOnCollaborationArgs = {
  queryData: ActivityLogInput;
};

export type QueryAdminCommunicationMembershipArgs = {
  communicationData: CommunicationAdminMembershipInput;
};

export type QueryExploreSpacesArgs = {
  options?: InputMaybe<ExploreSpacesInput>;
};

export type QueryOrganizationArgs = {
  ID: Scalars['UUID'];
};

export type QueryOrganizationsArgs = {
  filter?: InputMaybe<ContributorFilterInput>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryOrganizationsPaginatedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<OrganizationVerificationEnum>;
};

export type QueryRolesOrganizationArgs = {
  rolesData: RolesOrganizationInput;
};

export type QueryRolesUserArgs = {
  rolesData: RolesUserInput;
};

export type QueryRolesVirtualContributorArgs = {
  rolesData: RolesVirtualContributorInput;
};

export type QuerySearchArgs = {
  searchData: SearchInput;
};

export type QuerySpacesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  filter?: InputMaybe<SpaceFilterInput>;
};

export type QuerySpacesPaginatedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<SpaceFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryTaskArgs = {
  id: Scalars['UUID'];
};

export type QueryTasksArgs = {
  status?: InputMaybe<TaskStatus>;
};

export type QueryUrlResolverArgs = {
  url: Scalars['String'];
};

export type QueryUserArgs = {
  ID: Scalars['UUID'];
};

export type QueryUserAuthorizationPrivilegesArgs = {
  userAuthorizationPrivilegesData: UserAuthorizationPrivilegesInput;
};

export type QueryUsersArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  filter?: InputMaybe<ContributorFilterInput>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryUsersPaginatedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  withTags?: InputMaybe<Scalars['Boolean']>;
};

export type QueryUsersWithAuthorizationCredentialArgs = {
  credentialsCriteriaData: UsersWithAuthorizationCredentialInput;
};

export type QueryVirtualContributorArgs = {
  ID: Scalars['UUID'];
};

export type QueryVirtualContributorsArgs = {
  filter?: InputMaybe<ContributorFilterInput>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type Question = {
  __typename?: 'Question';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  value: Scalars['String'];
};

/** A reaction to a message. */
export type Reaction = {
  __typename?: 'Reaction';
  /** The reaction Emoji */
  emoji: Scalars['Emoji'];
  /** The id for the reaction. */
  id: Scalars['MessageID'];
  /** The user that reacted */
  sender?: Maybe<User>;
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

export type Reference = {
  __typename?: 'Reference';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Description of this reference */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Name of the reference, e.g. Linkedin, Twitter etc. */
  name: Scalars['String'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** URI of the reference */
  uri: Scalars['String'];
};

export type RefreshVirtualContributorBodyOfKnowledgeInput = {
  /** The ID of the Virtual Contributor to update. */
  virtualContributorID: Scalars['UUID'];
};

export type RelayPaginatedSpace = {
  __typename?: 'RelayPaginatedSpace';
  /** About this space. */
  about: SpaceAbout;
  /** The Account that this Space is part of. */
  account: Account;
  /** The "highest" subscription active for this Space. */
  activeSubscription?: Maybe<SpaceSubscription>;
  /** The Agent representing this Space. */
  agent: Agent;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The collaboration for the Space. */
  collaboration: Collaboration;
  /** Get the Community for the Space.  */
  community: Community;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The level of this Space, representing the number of Spaces above this one. */
  level: SpaceLevel;
  /** The ID of the level zero space for this tree. */
  levelZeroSpaceID: Scalars['String'];
  /** The License operating on this Space. */
  license: License;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The settings for this Space. */
  settings: SpaceSettings;
  /** The StorageAggregator in use by this Space */
  storageAggregator: StorageAggregator;
  /** The subscriptions active for this Space. */
  subscriptions: Array<SpaceSubscription>;
  /** A particular subspace by its nameID */
  subspaceByNameID: Space;
  /** The subspaces for the space. */
  subspaces: Array<Space>;
  /** The TemplatesManager in use by this Space */
  templatesManager?: Maybe<TemplatesManager>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type RelayPaginatedSpaceSubspaceByNameIdArgs = {
  NAMEID: Scalars['NameID'];
};

export type RelayPaginatedSpaceSubspacesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type RelayPaginatedSpaceEdge = {
  __typename?: 'RelayPaginatedSpaceEdge';
  node: RelayPaginatedSpace;
};

export type RelayPaginatedSpacePageInfo = {
  __typename?: 'RelayPaginatedSpacePageInfo';
  /** The last cursor of the page result */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicate whether more items exist after the returned ones */
  hasNextPage: Scalars['Boolean'];
  /** Indicate whether more items exist before the returned ones */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor of the page result */
  startCursor?: Maybe<Scalars['String']>;
};

export type RemoveCommunityGuidelinesContentInput = {
  /** ID of the CommunityGuidelines that will be emptied */
  communityGuidelinesID: Scalars['UUID'];
};

export type RemovePlatformRoleInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
};

export type RemoveRoleOnRoleSetFromOrganizationInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type RemoveRoleOnRoleSetFromUserInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type RemoveRoleOnRoleSetFromVirtualContributorInput = {
  contributorID: Scalars['UUID'];
  role: RoleName;
  roleSetID: Scalars['UUID'];
};

export type RemoveUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID'];
};

export type RevokeAuthorizationCredentialInput = {
  /** The resource to which access is being removed. */
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
  /** The user from whom the credential is being removed. */
  userID: Scalars['UUID'];
};

export type RevokeLicensePlanFromAccount = {
  /** The ID of the Account to assign the LicensePlan to. */
  accountID: Scalars['UUID'];
  /** The ID of the LicensePlan to assign. */
  licensePlanID: Scalars['UUID'];
  /** The ID of the Licensing to use. */
  licensingID?: InputMaybe<Scalars['UUID']>;
};

export type RevokeLicensePlanFromSpace = {
  /** The ID of the LicensePlan to assign. */
  licensePlanID: Scalars['UUID'];
  /** The ID of the Licensing to use. */
  licensingID?: InputMaybe<Scalars['UUID']>;
  /** The ID of the Space to assign the LicensePlan to. */
  spaceID: Scalars['UUID'];
};

export type RevokeOrganizationAuthorizationCredentialInput = {
  /** The Organization from whom the credential is being removed. */
  organizationID: Scalars['UUID'];
  /** The resource to which access is being removed. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  type: AuthorizationCredential;
};

export type Role = {
  __typename?: 'Role';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Credential associated with this Role. */
  credential: CredentialDefinition;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The CommunityRole that this role definition is for. */
  name: RoleName;
  /** The role policy that applies for Organizations in this Role. */
  organizationPolicy: ContributorRolePolicy;
  /** The Credential associated with this Role. */
  parentCredentials: Array<CredentialDefinition>;
  /** Flag to indicate if this Role requires the entry level role to be held. */
  requiresEntryRole: Scalars['Boolean'];
  /** Flag to indicate if this Role requires having the same role in the Parent RoleSet. */
  requiresSameRoleInParentRoleSet: Scalars['Boolean'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The role policy that applies for Users in this Role. */
  userPolicy: ContributorRolePolicy;
  /** The role policy that applies for VirtualContributors in this Role. */
  virtualContributorPolicy: ContributorRolePolicy;
};

export enum RoleName {
  Admin = 'ADMIN',
  Associate = 'ASSOCIATE',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalCommunityReader = 'GLOBAL_COMMUNITY_READER',
  GlobalLicenseManager = 'GLOBAL_LICENSE_MANAGER',
  GlobalSpacesReader = 'GLOBAL_SPACES_READER',
  GlobalSupport = 'GLOBAL_SUPPORT',
  Lead = 'LEAD',
  Member = 'MEMBER',
  Owner = 'OWNER',
  PlatformBetaTester = 'PLATFORM_BETA_TESTER',
  PlatformVcCampaign = 'PLATFORM_VC_CAMPAIGN',
}

export type RoleSet = {
  __typename?: 'RoleSet';
  /** The Form used for Applications to this roleSet. */
  applicationForm: Form;
  /** Applications available for this RoleSet. */
  applications: Array<Application>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** All users that have the entryRole in the RoleSet, minus those already in the specified role. */
  availableUsersForElevatedRole: PaginatedUsers;
  /** All available users that are could join this RoleSet in the entry role. */
  availableUsersForEntryRole: PaginatedUsers;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Role that acts as the entry Role for the RoleSet, so other roles potentially require it. */
  entryRoleName: RoleName;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Invitations for this roleSet. */
  invitations: Array<Invitation>;
  /** The License operating on this RoleSet. */
  license: License;
  /** The membership status of the currently logged in user. */
  myMembershipStatus?: Maybe<CommunityMembershipStatus>;
  /** The roles on this community for the currently logged in user. */
  myRoles: Array<RoleName>;
  /** The implicit roles on this community for the currently logged in user. */
  myRolesImplicit: Array<RoleSetRoleImplicit>;
  /** All Organizations that have the specified Role in this Community. */
  organizationsInRole: Array<Organization>;
  /** All organizations that have a role in this RoleSet in the specified Roles. */
  organizationsInRoles: Array<OrganizationsInRolesResponse>;
  /** Invitations to join this RoleSet in an entry role for users not yet on the Alkemio platform. */
  platformInvitations: Array<PlatformInvitation>;
  /** The Role Definitions from this RoleSet to return. */
  roleDefinition: Role;
  /** The Role Definitions included in this roleSet. */
  roleDefinitions: Array<Role>;
  /** The Roles available in this roleSet. */
  roleNames: Array<RoleName>;
  /** A type of entity that this RoleSet is being used with. */
  type?: Maybe<RoleSetType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** All users that are contributing to this Community in the specified Role. */
  usersInRole: Array<User>;
  /** All users that have a Role in this RoleSet in the specified Roles. */
  usersInRoles: Array<UsersInRolesResponse>;
  /** All virtuals that have the specified Role in this Community. */
  virtualContributorsInRole: Array<VirtualContributor>;
  /** All VirtualContributors that have a role in this RoleSet in the specified Roles. */
  virtualContributorsInRoles: Array<VirtualContributorsInRolesResponse>;
};

export type RoleSetAvailableUsersForElevatedRoleArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  role: RoleName;
};

export type RoleSetAvailableUsersForEntryRoleArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RoleSetOrganizationsInRoleArgs = {
  role: RoleName;
};

export type RoleSetOrganizationsInRolesArgs = {
  roles: Array<RoleName>;
};

export type RoleSetRoleDefinitionArgs = {
  role: RoleName;
};

export type RoleSetRoleDefinitionsArgs = {
  roles?: InputMaybe<Array<RoleName>>;
};

export type RoleSetUsersInRoleArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  role: RoleName;
};

export type RoleSetUsersInRolesArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  roles: Array<RoleName>;
};

export type RoleSetVirtualContributorsInRoleArgs = {
  role: RoleName;
};

export type RoleSetVirtualContributorsInRolesArgs = {
  roles: Array<RoleName>;
};

export enum RoleSetContributorType {
  Organization = 'ORGANIZATION',
  User = 'USER',
  Virtual = 'VIRTUAL',
}

export enum RoleSetRoleImplicit {
  AccountAdmin = 'ACCOUNT_ADMIN',
  SubspaceAdmin = 'SUBSPACE_ADMIN',
}

export enum RoleSetType {
  Organization = 'ORGANIZATION',
  Platform = 'PLATFORM',
  Space = 'SPACE',
}

export type RolesOrganizationInput = {
  /** Return membership in Spaces matching the provided filter. */
  filter?: InputMaybe<SpaceFilterInput>;
  /** The ID of the organization to retrieve the roles of. */
  organizationID: Scalars['UUID'];
};

export type RolesResult = {
  __typename?: 'RolesResult';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
};

export type RolesResultCommunity = {
  __typename?: 'RolesResultCommunity';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** The level of the Space e.g. space/challenge/opportunity. */
  level: SpaceLevel;
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** The Type of the Space e.g. space/challenge/opportunity. */
  type: SpaceType;
};

export type RolesResultOrganization = {
  __typename?: 'RolesResultOrganization';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The Organization ID. */
  organizationID: Scalars['String'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
};

export type RolesResultSpace = {
  __typename?: 'RolesResultSpace';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** The level of the Space e.g. space/challenge/opportunity. */
  level: SpaceLevel;
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** The Space ID */
  spaceID: Scalars['String'];
  /** Details of the Subspace the user is a member of */
  subspaces: Array<RolesResultCommunity>;
  /** The Type of the Space e.g. space/challenge/opportunity. */
  type: SpaceType;
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type RolesUserInput = {
  /** Return membership in Spaces matching the provided filter. */
  filter?: InputMaybe<SpaceFilterInput>;
  /** The ID of the user to retrieve the roles of. */
  userID: Scalars['UUID'];
};

export type RolesVirtualContributorInput = {
  /** The ID or nameID of the VC to retrieve the roles of. */
  virtualContributorID: Scalars['UUID'];
};

export type Room = {
  __typename?: 'Room';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Messages in this Room. */
  messages: Array<Message>;
  /** The number of messages in the Room. */
  messagesCount: Scalars['Float'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Virtual Contributor Interactions in this Room. */
  vcInteractions: Array<VcInteraction>;
};

export type RoomAddReactionToMessageInput = {
  /** The reaction to the message. */
  emoji: Scalars['Emoji'];
  /** The message id that is being reacted to */
  messageID: Scalars['MessageID'];
  /** The Room to remove a message from. */
  roomID: Scalars['UUID'];
};

/** The event happened in the subscribed room */
export type RoomEventSubscriptionResult = {
  __typename?: 'RoomEventSubscriptionResult';
  /** A message related event. */
  message?: Maybe<RoomMessageEventSubscriptionResult>;
  /** A message reaction related event. */
  reaction?: Maybe<RoomMessageReactionEventSubscriptionResult>;
  /** The Room on which the event happened. */
  room: Room;
  /** The identifier for the Room on which the event happened. */
  roomID: Scalars['String'];
};

/** A message event happened in the subscribed room */
export type RoomMessageEventSubscriptionResult = {
  __typename?: 'RoomMessageEventSubscriptionResult';
  /** A message related event. */
  data: Message;
  /** The type of event. */
  type: MutationType;
};

/** A message reaction event happened in the subscribed room */
export type RoomMessageReactionEventSubscriptionResult = {
  __typename?: 'RoomMessageReactionEventSubscriptionResult';
  /** A message related event. */
  data: Reaction;
  /** The message on which the reaction event happened. */
  messageID?: Maybe<Scalars['String']>;
  /** The type of event. */
  type: MutationType;
};

export type RoomRemoveMessageInput = {
  /** The message id that should be removed */
  messageID: Scalars['MessageID'];
  /** The Room to remove a message from. */
  roomID: Scalars['UUID'];
};

export type RoomRemoveReactionToMessageInput = {
  /** The reaction that is being removed */
  reactionID: Scalars['MessageID'];
  /** The Room to remove a message from. */
  roomID: Scalars['UUID'];
};

export type RoomSendMessageInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The Room the message is being sent to */
  roomID: Scalars['UUID'];
};

export type RoomSendMessageReplyInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The Room the message is being sent to */
  roomID: Scalars['UUID'];
  /** The message starting the thread being replied to */
  threadID: Scalars['MessageID'];
};

export type SearchInput = {
  /** Restrict the search to only the specified Space. Default is all Spaces. */
  searchInSpaceFilter?: InputMaybe<Scalars['UUID']>;
  /** Expand the search to includes Tagsets with the provided names. Max 2. */
  tagsetNames?: InputMaybe<Array<Scalars['String']>>;
  /** The terms to be searched for within this Space. Max 5. */
  terms: Array<Scalars['String']>;
  /** Restrict the search to only the specified entity types. Values allowed: space, subspace, user, group, organization, callout. Default is all. */
  typesFilter?: InputMaybe<Array<Scalars['String']>>;
};

export type SearchResult = {
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
};

export type SearchResultCallout = SearchResult & {
  __typename?: 'SearchResultCallout';
  /** The Callout that was found. */
  callout: Callout;
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The parent Space of the Callout. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
};

export type SearchResultOrganization = SearchResult & {
  __typename?: 'SearchResultOrganization';
  id: Scalars['UUID'];
  /** The Organization that was found. */
  organization: Organization;
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
};

export type SearchResultPost = SearchResult & {
  __typename?: 'SearchResultPost';
  /** The Callout of the Post. */
  callout: Callout;
  id: Scalars['UUID'];
  /** The Post that was found. */
  post: Post;
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space of the Post. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
};

export type SearchResultSpace = SearchResult & {
  __typename?: 'SearchResultSpace';
  id: Scalars['UUID'];
  /** The parent of this Space, if any. */
  parentSpace?: Maybe<Space>;
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space that was found. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
};

export enum SearchResultType {
  Callout = 'CALLOUT',
  Challenge = 'CHALLENGE',
  Opportunity = 'OPPORTUNITY',
  Organization = 'ORGANIZATION',
  Post = 'POST',
  Space = 'SPACE',
  Subspace = 'SUBSPACE',
  User = 'USER',
  Usergroup = 'USERGROUP',
  Whiteboard = 'WHITEBOARD',
}

export type SearchResultUser = SearchResult & {
  __typename?: 'SearchResultUser';
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
  /** The User that was found. */
  user: User;
};

export type SearchResultUserGroup = SearchResult & {
  __typename?: 'SearchResultUserGroup';
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The type of returned result for this search. */
  type: SearchResultType;
  /** The User Group that was found. */
  userGroup: UserGroup;
};

export enum SearchVisibility {
  Account = 'ACCOUNT',
  Hidden = 'HIDDEN',
  Public = 'PUBLIC',
}

export type Sentry = {
  __typename?: 'Sentry';
  /** Flag indicating if the client should use Sentry for monitoring. */
  enabled: Scalars['Boolean'];
  /** URL to the Sentry endpoint. */
  endpoint: Scalars['String'];
  /** The Sentry environment to report to. */
  environment: Scalars['String'];
  /** Flag indicating if PII should be submitted on Sentry events. */
  submitPII: Scalars['Boolean'];
};

export type ServiceMetadata = {
  __typename?: 'ServiceMetadata';
  /** Service name e.g. CT Server */
  name?: Maybe<Scalars['String']>;
  /** Version in the format {major.minor.patch} - using SemVer. */
  version?: Maybe<Scalars['String']>;
};

export type Space = {
  __typename?: 'Space';
  /** About this space. */
  about: SpaceAbout;
  /** The Account that this Space is part of. */
  account: Account;
  /** The "highest" subscription active for this Space. */
  activeSubscription?: Maybe<SpaceSubscription>;
  /** The Agent representing this Space. */
  agent: Agent;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The collaboration for the Space. */
  collaboration: Collaboration;
  /** Get the Community for the Space.  */
  community: Community;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The level of this Space, representing the number of Spaces above this one. */
  level: SpaceLevel;
  /** The ID of the level zero space for this tree. */
  levelZeroSpaceID: Scalars['String'];
  /** The License operating on this Space. */
  license: License;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The settings for this Space. */
  settings: SpaceSettings;
  /** The StorageAggregator in use by this Space */
  storageAggregator: StorageAggregator;
  /** The subscriptions active for this Space. */
  subscriptions: Array<SpaceSubscription>;
  /** A particular subspace by its nameID */
  subspaceByNameID: Space;
  /** The subspaces for the space. */
  subspaces: Array<Space>;
  /** The TemplatesManager in use by this Space */
  templatesManager?: Maybe<TemplatesManager>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type SpaceSubspaceByNameIdArgs = {
  NAMEID: Scalars['NameID'];
};

export type SpaceSubspacesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type SpaceAbout = {
  __typename?: 'SpaceAbout';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Is the content of this Space visible to non-Members?. */
  isContentPublic: Scalars['Boolean'];
  /** The membership information for this Space. */
  membership: SpaceAboutMembership;
  /** Metrics about activity within this Space. */
  metrics?: Maybe<Array<Nvp>>;
  /** The Profile for the Space. */
  profile: Profile;
  /** The Space provider (host). */
  provider: Contributor;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['Markdown']>;
  /** The goal that is being pursued */
  why?: Maybe<Scalars['Markdown']>;
};

export type SpaceAboutMembership = {
  __typename?: 'SpaceAboutMembership';
  /** The Form used for Applications to this Space. */
  applicationForm: Form;
  /** The identifier of the Community within the Space. */
  communityID?: Maybe<Scalars['UUID']>;
  /** The Lead Organizations that are associated with this Space. */
  leadOrganizations: Array<Organization>;
  /** The Lead Users that are associated with this Space. */
  leadUsers: Array<User>;
  /** The membership status of the currently logged in user. */
  myMembershipStatus?: Maybe<CommunityMembershipStatus>;
  /** The privileges granted to the current user based on the Space membership policy. */
  myPrivileges?: Maybe<Array<AuthorizationPrivilege>>;
  /** The identifier of the RoleSet within the Space. */
  roleSetID?: Maybe<Scalars['UUID']>;
};

export type SpaceFilterInput = {
  /** Return Spaces with a Visibility matching one of the provided types. */
  visibilities?: InputMaybe<Array<SpaceVisibility>>;
};

export enum SpaceLevel {
  L0 = 'L0',
  L1 = 'L1',
  L2 = 'L2',
}

export type SpacePendingMembershipInfo = {
  __typename?: 'SpacePendingMembershipInfo';
  /** About the Space */
  about: SpaceAbout;
  /** The CommunityGuidelines for the Space */
  communityGuidelines: CommunityGuidelines;
  /** The Space ID */
  id: Scalars['UUID'];
  /** The Level of the Space */
  level: SpaceLevel;
};

export enum SpacePrivacyMode {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
}

export type SpaceSettings = {
  __typename?: 'SpaceSettings';
  /** The collaboration settings for this Space. */
  collaboration: SpaceSettingsCollaboration;
  /** The membership settings for this Space. */
  membership: SpaceSettingsMembership;
  /** The privacy settings for this Space */
  privacy: SpaceSettingsPrivacy;
};

export type SpaceSettingsCollaboration = {
  __typename?: 'SpaceSettingsCollaboration';
  /** Flag to control if events from Subspaces are visible on this Space calendar as well. */
  allowEventsFromSubspaces: Scalars['Boolean'];
  /** Flag to control if members can create callouts. */
  allowMembersToCreateCallouts: Scalars['Boolean'];
  /** Flag to control if members can create subspaces. */
  allowMembersToCreateSubspaces: Scalars['Boolean'];
  /** Flag to control if ability to contribute is inherited from parent Space. */
  inheritMembershipRights: Scalars['Boolean'];
};

export type SpaceSettingsMembership = {
  __typename?: 'SpaceSettingsMembership';
  /** Allow subspace admins to invite to this Space. */
  allowSubspaceAdminsToInviteMembers: Scalars['Boolean'];
  /** The membership policy in usage for this Space */
  policy: CommunityMembershipPolicy;
  /** The organizations that are trusted to Join as members for this Space */
  trustedOrganizations: Array<Scalars['UUID']>;
};

export type SpaceSettingsPrivacy = {
  __typename?: 'SpaceSettingsPrivacy';
  /** Flag to control if Platform Support has admin rights. */
  allowPlatformSupportAsAdmin: Scalars['Boolean'];
  /** The privacy mode for this Space */
  mode: SpacePrivacyMode;
};

export type SpaceSubscription = {
  __typename?: 'SpaceSubscription';
  /** The expiry date of this subscription, null if it does never expire. */
  expires?: Maybe<Scalars['DateTime']>;
  /** The name of the Subscription. */
  name: LicensingCredentialBasedCredentialType;
};

export enum SpaceType {
  BlankSlate = 'BLANK_SLATE',
  Challenge = 'CHALLENGE',
  Knowledge = 'KNOWLEDGE',
  Opportunity = 'OPPORTUNITY',
  Space = 'SPACE',
}

export enum SpaceVisibility {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Demo = 'DEMO',
}

export type StorageAggregator = {
  __typename?: 'StorageAggregator';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The Storage Bucket for files directly on this Storage Aggregator (legacy). */
  directStorageBucket: StorageBucket;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The key information about the entity using this StorageAggregator, if any. */
  parentEntity?: Maybe<StorageAggregatorParent>;
  /** The aggregate size of all StorageBuckets for this StorageAggregator. */
  size: Scalars['Float'];
  /** The list of child storageAggregators for this StorageAggregator. */
  storageAggregators: Array<StorageAggregator>;
  /** The Storage Buckets that are being managed via this StorageAggregators. */
  storageBuckets: Array<StorageBucket>;
  /** A type of entity that this StorageAggregator is being used with. */
  type?: Maybe<StorageAggregatorType>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

/** Valid parent is Account, Space, User, Organization, Platform */
export type StorageAggregatorParent = {
  __typename?: 'StorageAggregatorParent';
  /** The display name. */
  displayName: Scalars['String'];
  /** The UUID of the parent entity. */
  id: Scalars['UUID'];
  /** If the parent entity is a Space, then the level of the Space. */
  level?: Maybe<SpaceLevel>;
  /** The URL that can be used to access the parent entity. */
  url: Scalars['String'];
};

export enum StorageAggregatorType {
  Account = 'ACCOUNT',
  Organization = 'ORGANIZATION',
  Platform = 'PLATFORM',
  Space = 'SPACE',
  User = 'USER',
}

export type StorageBucket = {
  __typename?: 'StorageBucket';
  /** Mime types allowed to be stored on this StorageBucket. */
  allowedMimeTypes: Array<Scalars['String']>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** A single Document */
  document?: Maybe<Document>;
  /** The list of Documents for this StorageBucket. */
  documents: Array<Document>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Maximum allowed file size on this StorageBucket. */
  maxFileSize: Scalars['Float'];
  /** The key information about the entity using this StorageBucket, if any. */
  parentEntity?: Maybe<StorageBucketParent>;
  /** The aggregate size of all Documents for this StorageBucket. */
  size: Scalars['Float'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type StorageBucketDocumentArgs = {
  ID: Scalars['UUID'];
};

export type StorageBucketDocumentsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
};

export type StorageBucketParent = {
  __typename?: 'StorageBucketParent';
  /** The display name. */
  displayName: Scalars['String'];
  /** The UUID of the parent entity. */
  id: Scalars['UUID'];
  /** The type of entity that this StorageBucket is being used with. */
  type: ProfileType;
  /** The URL that can be used to access the parent entity. */
  url: Scalars['String'];
};

export type StorageBucketUploadFileInput = {
  storageBucketId: Scalars['String'];
  /** Is this a temporary Document that will be moved later to another StorageBucket. */
  temporaryLocation?: InputMaybe<Scalars['Boolean']>;
};

export type StorageBucketUploadFileOnLinkInput = {
  linkID: Scalars['String'];
};

export type StorageBucketUploadFileOnReferenceInput = {
  referenceID: Scalars['String'];
};

export type StorageConfig = {
  __typename?: 'StorageConfig';
  /** Config for uploading files to Alkemio. */
  file: FileStorageConfig;
};

export type Subscription = {
  __typename?: 'Subscription';
  activityCreated: ActivityCreatedSubscriptionResult;
  /** Receive new Update messages on Communities the currently authenticated User is a member of. */
  calloutPostCreated: CalloutPostCreated;
  /** Receive updates on Discussions */
  forumDiscussionUpdated: Discussion;
  /** Received on verified credentials change */
  profileVerifiedCredential: ProfileCredentialVerified;
  /** Receive Room event */
  roomEvents: RoomEventSubscriptionResult;
  /** Receive new Subspaces created on the Space. */
  subspaceCreated: SubspaceCreated;
  /** Receive updates on virtual contributors */
  virtualContributorUpdated: VirtualContributorUpdatedSubscriptionResult;
};

export type SubscriptionActivityCreatedArgs = {
  input: ActivityCreatedSubscriptionInput;
};

export type SubscriptionCalloutPostCreatedArgs = {
  calloutID: Scalars['UUID'];
};

export type SubscriptionForumDiscussionUpdatedArgs = {
  forumID: Scalars['UUID'];
};

export type SubscriptionRoomEventsArgs = {
  roomID: Scalars['UUID'];
};

export type SubscriptionSubspaceCreatedArgs = {
  spaceID: Scalars['UUID'];
};

export type SubscriptionVirtualContributorUpdatedArgs = {
  virtualContributorID: Scalars['UUID'];
};

export type SubspaceCreated = {
  __typename?: 'SubspaceCreated';
  /** The identifier for the Space on which the subspace was created. */
  spaceID: Scalars['UUID'];
  /** The subspace that has been created. */
  subspace: Space;
};

export type Tagset = {
  __typename?: 'Tagset';
  /** The allowed values for this Tagset. */
  allowedValues: Array<Scalars['String']>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
  type: TagsetType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type TagsetArgs = {
  /** Return only Callouts that match one of the tagsets and any of the tags in them. */
  name: TagsetReservedName;
  /** A list of tags to include. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export enum TagsetReservedName {
  Capabilities = 'CAPABILITIES',
  Default = 'DEFAULT',
  FlowState = 'FLOW_STATE',
  Keywords = 'KEYWORDS',
  Skills = 'SKILLS',
}

export type TagsetTemplate = {
  __typename?: 'TagsetTemplate';
  allowedValues: Array<Scalars['String']>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** For Tagsets of type SELECT_ONE, the default selected value. */
  defaultSelectedValue?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  type: TagsetType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum TagsetType {
  Freeform = 'FREEFORM',
  SelectMany = 'SELECT_MANY',
  SelectOne = 'SELECT_ONE',
}

export type Task = {
  __typename?: 'Task';
  /** The timestamp when the task was created */
  created: Scalars['Float'];
  /** the timestamp when the task was completed */
  end?: Maybe<Scalars['Float']>;
  /** info about the errors of the task */
  errors?: Maybe<Array<Scalars['String']>>;
  /** The UUID of the task */
  id: Scalars['UUID'];
  /** Amount of items that need to be processed */
  itemsCount?: Maybe<Scalars['Float']>;
  /** Amount of items that are already processed */
  itemsDone?: Maybe<Scalars['Float']>;
  /** The progress  of the task if the total item count is defined */
  progress?: Maybe<Scalars['Float']>;
  /** info about the completed part of the task */
  results?: Maybe<Array<Scalars['String']>>;
  /** The timestamp when the task was started */
  start: Scalars['Float'];
  /** The current status of the task */
  status: TaskStatus;
  /** TBD */
  type?: Maybe<Scalars['String']>;
};

/** The current status of the task */
export enum TaskStatus {
  Completed = 'COMPLETED',
  Errored = 'ERRORED',
  InProgress = 'IN_PROGRESS',
}

export type Template = {
  __typename?: 'Template';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Callout for this Template. */
  callout?: Maybe<Callout>;
  /** The Collaboration for this Template. */
  collaboration?: Maybe<Collaboration>;
  /** The Community Guidelines for this Template. */
  communityGuidelines?: Maybe<CommunityGuidelines>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The description for Post Templates to users filling out a new Post based on this Template. */
  postDefaultDescription?: Maybe<Scalars['Markdown']>;
  /** The Profile for this Template. */
  profile: Profile;
  /** The type for this Template. */
  type: TemplateType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The Whiteboard for this Template. */
  whiteboard?: Maybe<Whiteboard>;
};

export type TemplateDefault = {
  __typename?: 'TemplateDefault';
  /** The type of any Template stored here. */
  allowedTemplateType: TemplateType;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The template accessible via this TemplateDefault, if any. */
  template?: Maybe<Template>;
  /** The type of this TemplateDefault. */
  type: TemplateDefaultType;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export enum TemplateDefaultType {
  PlatformSpace = 'PLATFORM_SPACE',
  PlatformSpaceTutorials = 'PLATFORM_SPACE_TUTORIALS',
  PlatformSubspace = 'PLATFORM_SUBSPACE',
  PlatformSubspaceKnowledge = 'PLATFORM_SUBSPACE_KNOWLEDGE',
  SpaceSubspace = 'SPACE_SUBSPACE',
}

export type TemplateResult = {
  __typename?: 'TemplateResult';
  /** The InnovationPack where this Template is being returned from. */
  innovationPack: InnovationPack;
  /** The Template that is being returned. */
  template: Template;
};

export enum TemplateType {
  Callout = 'CALLOUT',
  Collaboration = 'COLLABORATION',
  CommunityGuidelines = 'COMMUNITY_GUIDELINES',
  Post = 'POST',
  Whiteboard = 'WHITEBOARD',
}

export type TemplatesManager = {
  __typename?: 'TemplatesManager';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The TemplateDefaults in this TemplatesManager. */
  templateDefaults: Array<TemplateDefault>;
  /** The templatesSet in use by this TemplatesManager. */
  templatesSet?: Maybe<TemplatesSet>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type TemplatesSet = {
  __typename?: 'TemplatesSet';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The CalloutTemplates in this TemplatesSet. */
  calloutTemplates: Array<Template>;
  /** The total number of CalloutTemplates in this TemplatesSet. */
  calloutTemplatesCount: Scalars['Float'];
  /** The CollaborationTemplates in this TemplatesSet. */
  collaborationTemplates: Array<Template>;
  /** The total number of CollaborationTemplates in this TemplatesSet. */
  collaborationTemplatesCount: Scalars['Float'];
  /** The CommunityGuidelines in this TemplatesSet. */
  communityGuidelinesTemplates: Array<Template>;
  /** The total number of CommunityGuidelinesTemplates in this TemplatesSet. */
  communityGuidelinesTemplatesCount: Scalars['Float'];
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Post Templates in this TemplatesSet. */
  postTemplates: Array<Template>;
  /** The total number of Post Templates in this TemplatesSet. */
  postTemplatesCount: Scalars['Float'];
  /** The Templates in this TemplatesSet. */
  templates: Array<Template>;
  /** The total number of Templates in this TemplatesSet. */
  templatesCount: Scalars['Float'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  /** The WhiteboardTemplates in this TemplatesSet. */
  whiteboardTemplates: Array<Template>;
  /** The total number of WhiteboardTemplates in this TemplatesSet. */
  whiteboardTemplatesCount: Scalars['Float'];
};

export type Timeline = {
  __typename?: 'Timeline';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Innovation Library for the timeline */
  calendar: Calendar;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type TransferAccountInnovationHubInput = {
  /** The Innovation Hub to be transferred. */
  innovationHubID: Scalars['UUID'];
  /** The Account to which the Innovation Hub will be transferred. */
  targetAccountID: Scalars['UUID'];
};

export type TransferAccountInnovationPackInput = {
  /** The InnovationPack to be transferred. */
  innovationPackID: Scalars['UUID'];
  /** The Account to which the Innovation Pack will be transferred. */
  targetAccountID: Scalars['UUID'];
};

export type TransferAccountSpaceInput = {
  /** The Space to be transferred. */
  spaceID: Scalars['UUID'];
  /** The Account to which the Space will be transferred. */
  targetAccountID: Scalars['UUID'];
};

export type TransferAccountVirtualContributorInput = {
  /** The Account to which the Virtual Contributor will be transferred. */
  targetAccountID: Scalars['UUID'];
  /** The Virtual Contributor to be transferred. */
  virtualContributorID: Scalars['UUID'];
};

export type TransferCalloutInput = {
  /** The Callout to be transferred. */
  calloutID: Scalars['UUID'];
  /** The target CalloutsSet to which the Callout will be transferred. */
  targetCalloutsSetID: Scalars['UUID'];
};

export type UpdateAiPersonaInput = {
  ID: Scalars['UUID'];
};

export type UpdateAiPersonaServiceInput = {
  ID: Scalars['UUID'];
  bodyOfKnowledgeID?: InputMaybe<Scalars['UUID']>;
  bodyOfKnowledgeType?: InputMaybe<AiPersonaBodyOfKnowledgeType>;
  engine?: InputMaybe<AiPersonaEngine>;
  externalConfig?: InputMaybe<ExternalConfig>;
  prompt?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateApplicationFormOnRoleSetInput = {
  formData: UpdateFormInput;
  roleSetID: Scalars['UUID'];
};

export type UpdateCalendarEventInput = {
  ID: Scalars['UUID'];
  /** The length of the event in days. */
  durationDays?: InputMaybe<Scalars['Float']>;
  /** The length of the event in minutes. */
  durationMinutes: Scalars['Float'];
  /** Flag to indicate if this event is for multiple days. */
  multipleDays: Scalars['Boolean'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** The state date for the event. */
  startDate: Scalars['DateTime'];
  type?: InputMaybe<CalendarEventType>;
  /** Is the event visible on the parent calendar. */
  visibleOnParentCalendar?: InputMaybe<Scalars['Boolean']>;
  /** Flag to indicate if this event is for a whole day. */
  wholeDay: Scalars['Boolean'];
};

export type UpdateCalloutContributionDefaultsInput = {
  /** The default description to use for new Post contributions. */
  postDescription?: InputMaybe<Scalars['Markdown']>;
  /** The default description to use for new Whiteboard contributions. */
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
};

export type UpdateCalloutContributionPolicyInput = {
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
};

export type UpdateCalloutEntityInput = {
  ID: Scalars['UUID'];
  classification?: InputMaybe<UpdateClassificationInput>;
  contributionDefaults?: InputMaybe<UpdateCalloutContributionDefaultsInput>;
  contributionPolicy?: InputMaybe<UpdateCalloutContributionPolicyInput>;
  framing?: InputMaybe<UpdateCalloutFramingInput>;
  /** Set Group for this Callout. */
  groupName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The sort order to assign to this Callout. */
  sortOrder?: InputMaybe<Scalars['Float']>;
};

export type UpdateCalloutFramingInput = {
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  /** The new content to be used. */
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
};

export type UpdateCalloutPublishInfoInput = {
  /** The identifier for the Callout whose publisher is to be updated. */
  calloutID: Scalars['UUID'];
  /** The timestamp to set for the publishing of the Callout. */
  publishDate?: InputMaybe<Scalars['Float']>;
  /** The identifier of the publisher of the Callout. */
  publisherID?: InputMaybe<Scalars['UUID']>;
};

export type UpdateCalloutVisibilityInput = {
  /** The identifier for the Callout whose visibility is to be updated. */
  calloutID: Scalars['String'];
  /** Send a notification on publishing. */
  sendNotification?: InputMaybe<Scalars['Boolean']>;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type UpdateCalloutsSortOrderInput = {
  /** The IDs of the callouts to update the sort order on */
  calloutIDs: Array<Scalars['UUID']>;
  calloutsSetID: Scalars['UUID'];
};

export type UpdateClassificationInput = {
  tagsets?: InputMaybe<Array<UpdateTagsetInput>>;
};

export type UpdateClassificationSelectTagsetValueInput = {
  classificationID: Scalars['UUID'];
  selectedValue: Scalars['String'];
  tagsetName: Scalars['String'];
};

export type UpdateCollaborationFromTemplateInput = {
  /** Add the Callouts from the Collaboration Template */
  addCallouts?: InputMaybe<Scalars['Boolean']>;
  /** ID of the Collaboration to be updated */
  collaborationID: Scalars['UUID'];
  /** The Collaboration Template that will be used for updates to the Collaboration */
  collaborationTemplateID: Scalars['UUID'];
};

export type UpdateCommunityGuidelinesEntityInput = {
  /** ID of the CommunityGuidelines */
  communityGuidelinesID: Scalars['UUID'];
  /** The Profile for this community guidelines. */
  profile: UpdateProfileInput;
};

export type UpdateContributionCalloutsSortOrderInput = {
  calloutID: Scalars['UUID'];
  /** The IDs of the contributions to update the sort order on */
  contributionIDs: Array<Scalars['UUID']>;
};

export type UpdateDiscussionInput = {
  ID: Scalars['UUID'];
  /** The category for the Discussion */
  category?: InputMaybe<ForumDiscussionCategory>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateDocumentInput = {
  ID: Scalars['UUID'];
  /** The display name for the Document. */
  displayName: Scalars['String'];
  tagset?: InputMaybe<UpdateTagsetInput>;
};

export type UpdateFormInput = {
  description: Scalars['Markdown'];
  questions: Array<UpdateFormQuestionInput>;
};

export type UpdateFormQuestionInput = {
  /** The explation text to clarify the question. */
  explanation: Scalars['String'];
  /** The maxiumum length of the answer, in characters, up to a limit of 512. */
  maxLength: Scalars['Float'];
  /** The question to be answered */
  question: Scalars['String'];
  /** Whether an answer is required for this Question. */
  required: Scalars['Boolean'];
  /** The sort order of this question in a wider set of questions. */
  sortOrder: Scalars['Float'];
};

export type UpdateInnovationFlowEntityInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  states?: InputMaybe<Array<UpdateInnovationFlowStateInput>>;
};

export type UpdateInnovationFlowSelectedStateInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The State that the Innovation Flow is in */
  selectedState: Scalars['String'];
};

export type UpdateInnovationFlowSingleStateInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The name of the Innovation Flow State to be updated */
  stateDisplayName: Scalars['String'];
  stateUpdatedData: UpdateInnovationFlowStateInput;
};

export type UpdateInnovationFlowStateInput = {
  /** The explation text to clarify the State. */
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the State */
  displayName: Scalars['String'];
};

export type UpdateInnovationHubInput = {
  ID: Scalars['UUID'];
  /** Flag to control the visibility of the InnovationHub in the platform store. */
  listedInStore?: InputMaybe<Scalars['Boolean']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Visibility of the InnovationHub in searches. */
  searchVisibility?: InputMaybe<SearchVisibility>;
  /** A list of Spaces to include in this Innovation Hub. Only valid when type 'list' is used. */
  spaceListFilter?: InputMaybe<Array<Scalars['UUID']>>;
  /** Spaces with which visibility this Innovation Hub will display. Only valid when type 'visibility' is used. */
  spaceVisibilityFilter?: InputMaybe<SpaceVisibility>;
};

export type UpdateInnovationPackInput = {
  ID: Scalars['UUID'];
  /** Flag to control the visibility of the InnovationPack in the platform Library. */
  listedInStore?: InputMaybe<Scalars['Boolean']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Visibility of the InnovationPack in searches. */
  searchVisibility?: InputMaybe<SearchVisibility>;
};

export type UpdateKnowledgeBaseInput = {
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
};

export type UpdateLicensePlanInput = {
  ID: Scalars['UUID'];
  /** Assign this plan to all new Organization accounts */
  assignToNewOrganizationAccounts?: InputMaybe<Scalars['Boolean']>;
  /** Assign this plan to all new User accounts */
  assignToNewUserAccounts?: InputMaybe<Scalars['Boolean']>;
  /** Is this plan enabled? */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** Is this plan free? */
  isFree?: InputMaybe<Scalars['Boolean']>;
  /** The credential to represent this plan */
  licenseCredential?: InputMaybe<LicensingCredentialBasedCredentialType>;
  /** The price per month of this plan. */
  pricePerMonth?: InputMaybe<Scalars['Float']>;
  /** Does this plan require contact support */
  requiresContactSupport?: InputMaybe<Scalars['Boolean']>;
  /** Does this plan require a payment method? */
  requiresPaymentMethod?: InputMaybe<Scalars['Boolean']>;
  /** The sorting order for this Plan. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  /** Is there a trial period enabled */
  trialEnabled?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateLinkInput = {
  ID: Scalars['UUID'];
  /** The Profile of the Link. */
  profile?: InputMaybe<UpdateProfileInput>;
  uri?: InputMaybe<Scalars['String']>;
};

export type UpdateLocationInput = {
  addressLine1?: InputMaybe<Scalars['String']>;
  addressLine2?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  stateOrProvince?: InputMaybe<Scalars['String']>;
};

export type UpdateNotificationStateInput = {
  /** The ID of the notification to update. */
  ID: Scalars['UUID'];
  /** The new state of the notification. */
  state: InAppNotificationState;
};

export type UpdateOrganizationInput = {
  /** The ID of the Organization to update. */
  ID: Scalars['UUID'];
  contactEmail?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationPlatformSettingsInput = {
  /** Upate the URL path for the Organization. */
  nameID: Scalars['NameID'];
  /** The ID of the Organization to update. */
  organizationID: Scalars['UUID'];
};

export type UpdateOrganizationSettingsEntityInput = {
  membership?: InputMaybe<UpdateOrganizationSettingsMembershipInput>;
  privacy?: InputMaybe<UpdateOrganizationSettingsPrivacyInput>;
};

export type UpdateOrganizationSettingsInput = {
  /** The identifier for the Organization whose settings are to be updated. */
  organizationID: Scalars['UUID'];
  /** Update the settings for the Organization. */
  settings: UpdateOrganizationSettingsEntityInput;
};

export type UpdateOrganizationSettingsMembershipInput = {
  /** Allow Users with email addresses matching the domain of this Organization to join. */
  allowUsersMatchingDomainToJoin: Scalars['Boolean'];
};

export type UpdateOrganizationSettingsPrivacyInput = {
  /** Allow contribution roles (membership, lead etc) in Spaces to be visible. */
  contributionRolesPubliclyVisible: Scalars['Boolean'];
};

export type UpdatePlatformSettingsInput = {
  integration?: InputMaybe<UpdatePlatformSettingsIntegrationInput>;
};

export type UpdatePlatformSettingsIntegrationInput = {
  /** Update the list of allowed URLs for iFrames within Markdown content. */
  iframeAllowedUrls: Array<Scalars['String']>;
};

export type UpdatePostInput = {
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateProfileInput = {
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<UpdateLocationInput>;
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  /** A memorable short description for this entity. */
  tagline?: InputMaybe<Scalars['String']>;
  tagsets?: InputMaybe<Array<UpdateTagsetInput>>;
};

export type UpdateReferenceInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  uri?: InputMaybe<Scalars['String']>;
};

export type UpdateSpaceAboutInput = {
  /** The Profile of this Space. */
  profile?: InputMaybe<UpdateProfileInput>;
  when?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
  why?: InputMaybe<Scalars['Markdown']>;
};

export type UpdateSpaceInput = {
  ID: Scalars['UUID'];
  /** Update the Space About information. */
  about?: InputMaybe<UpdateSpaceAboutInput>;
};

export type UpdateSpacePlatformSettingsInput = {
  /** Upate the URL path for the Space. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The identifier for the Space whose license etc is to be updated. */
  spaceID: Scalars['UUID'];
  /** Visibility of the Space, only on L0 spaces. */
  visibility?: InputMaybe<SpaceVisibility>;
};

export type UpdateSpaceSettingsCollaborationInput = {
  /** Flag to control if events from Subspaces are visible on this Space calendar as well. */
  allowEventsFromSubspaces: Scalars['Boolean'];
  /** Flag to control if members can create callouts. */
  allowMembersToCreateCallouts: Scalars['Boolean'];
  /** Flag to control if members can create subspaces. */
  allowMembersToCreateSubspaces: Scalars['Boolean'];
  /** Flag to control if ability to contribute is inherited from parent Space. */
  inheritMembershipRights: Scalars['Boolean'];
};

export type UpdateSpaceSettingsEntityInput = {
  collaboration?: InputMaybe<UpdateSpaceSettingsCollaborationInput>;
  membership?: InputMaybe<UpdateSpaceSettingsMembershipInput>;
  privacy?: InputMaybe<UpdateSpaceSettingsPrivacyInput>;
};

export type UpdateSpaceSettingsInput = {
  /** Update the settings for the Space. */
  settings: UpdateSpaceSettingsEntityInput;
  /** The identifier for the Space whose settings are to be updated. */
  spaceID: Scalars['String'];
};

export type UpdateSpaceSettingsMembershipInput = {
  /** Flag to control if Subspace admins can invite for this Space. */
  allowSubspaceAdminsToInviteMembers: Scalars['Boolean'];
  /** The membership policy in usage for this Space */
  policy: CommunityMembershipPolicy;
  /** The organizations that are trusted to Join as members for this Space */
  trustedOrganizations: Array<Scalars['UUID']>;
};

export type UpdateSpaceSettingsPrivacyInput = {
  /** Flag to control if Platform Support has admin rights. */
  allowPlatformSupportAsAdmin?: InputMaybe<Scalars['Boolean']>;
  mode?: InputMaybe<SpacePrivacyMode>;
};

export type UpdateTagsetInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  tags: Array<Scalars['String']>;
};

export type UpdateTemplateDefaultTemplateInput = {
  /** The identifier for the TemplateDefault to be updated. */
  templateDefaultID: Scalars['UUID'];
  /** The ID for the Template to use. */
  templateID: Scalars['UUID'];
};

export type UpdateTemplateFromCollaborationInput = {
  /** The Collaboration whose content should be copied to this Template. */
  collaborationID: Scalars['UUID'];
  /** The ID of the Template. */
  templateID: Scalars['UUID'];
};

export type UpdateTemplateInput = {
  ID: Scalars['UUID'];
  /** The default description to be pre-filled when users create Posts based on this template. */
  postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  /** The new content to be used. */
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
};

export type UpdateUserGroupInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['UUID'];
  accountUpn?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  phone?: InputMaybe<Scalars['String']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Set this user profile as being used as a service account or not. */
  serviceProfile?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateUserPlatformSettingsInput = {
  email?: InputMaybe<Scalars['String']>;
  /** Upate the URL path for the User. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The identifier for the User whose platform managed information is to be updated. */
  userID: Scalars['String'];
};

export type UpdateUserPreferenceInput = {
  /** Type of the user preference */
  type: PreferenceType;
  /** ID of the User */
  userID: Scalars['UUID'];
  value: Scalars['String'];
};

export type UpdateUserSettingsCommunicationInput = {
  /** Allow Users to send messages to this User. */
  allowOtherUsersToSendMessages: Scalars['Boolean'];
};

export type UpdateUserSettingsEntityInput = {
  /** Settings related to this users Communication preferences. */
  communication?: InputMaybe<UpdateUserSettingsCommunicationInput>;
  /** Settings related to Privacy. */
  privacy?: InputMaybe<UpdateUserSettingsPrivacyInput>;
};

export type UpdateUserSettingsInput = {
  /** Update the settings for the User. */
  settings: UpdateUserSettingsEntityInput;
  /** The identifier for the User whose settings are to be updated. */
  userID: Scalars['UUID'];
};

export type UpdateUserSettingsPrivacyInput = {
  /** Allow contribution roles (communication, lead etc) in Spaces to be visible. */
  contributionRolesPubliclyVisible: Scalars['Boolean'];
};

export type UpdateVirtualContributorInput = {
  /** The ID of the Virtual Contributor to update. */
  ID: Scalars['UUID'];
  /** The KnowledgeBase to use for this Collaboration. */
  knowledgeBaseData?: InputMaybe<UpdateKnowledgeBaseInput>;
  /** Flag to control the visibility of the VC in the platform store. */
  listedInStore?: InputMaybe<Scalars['Boolean']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Visibility of the VC in searches. */
  searchVisibility?: InputMaybe<SearchVisibility>;
};

export type UpdateVirtualContributorSettingsEntityInput = {
  privacy?: InputMaybe<UpdateVirtualContributorSettingsPrivacyInput>;
};

export type UpdateVirtualContributorSettingsInput = {
  /** Update the settings for the VirtualContributor. */
  settings: UpdateVirtualContributorSettingsEntityInput;
  /** The identifier for the VirtualCOntributor whose settings are to be updated. */
  virtualContributorID: Scalars['UUID'];
};

export type UpdateVirtualContributorSettingsPrivacyInput = {
  /** Enable the content of knowledge bases to be accessed or not. */
  knowledgeBaseContentVisible: Scalars['Boolean'];
};

export type UpdateVisualInput = {
  alternativeText?: InputMaybe<Scalars['String']>;
  uri: Scalars['String'];
  visualID: Scalars['String'];
};

export type UpdateWhiteboardEntityInput = {
  ID: Scalars['UUID'];
  contentUpdatePolicy?: InputMaybe<ContentUpdatePolicy>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profile?: InputMaybe<UpdateProfileInput>;
};

export type UrlResolverQueryResultCalendar = {
  __typename?: 'UrlResolverQueryResultCalendar';
  calendarEventId?: Maybe<Scalars['UUID']>;
  id: Scalars['UUID'];
};

export type UrlResolverQueryResultCalloutsSet = {
  __typename?: 'UrlResolverQueryResultCalloutsSet';
  calloutId?: Maybe<Scalars['UUID']>;
  contributionId?: Maybe<Scalars['UUID']>;
  id: Scalars['UUID'];
  postId?: Maybe<Scalars['UUID']>;
  type: UrlType;
  whiteboardId?: Maybe<Scalars['UUID']>;
};

export type UrlResolverQueryResultCollaboration = {
  __typename?: 'UrlResolverQueryResultCollaboration';
  calloutsSet: UrlResolverQueryResultCalloutsSet;
  id: Scalars['UUID'];
};

export type UrlResolverQueryResultInnovationPack = {
  __typename?: 'UrlResolverQueryResultInnovationPack';
  id: Scalars['UUID'];
  templatesSet: UrlResolverQueryResultTemplatesSet;
};

export type UrlResolverQueryResultSpace = {
  __typename?: 'UrlResolverQueryResultSpace';
  calendar?: Maybe<UrlResolverQueryResultCalendar>;
  collaboration: UrlResolverQueryResultCollaboration;
  id: Scalars['UUID'];
  level: SpaceLevel;
  levelZeroSpaceID: Scalars['UUID'];
  parentSpaces: Array<Scalars['UUID']>;
  templatesSet?: Maybe<UrlResolverQueryResultTemplatesSet>;
};

export type UrlResolverQueryResultTemplatesSet = {
  __typename?: 'UrlResolverQueryResultTemplatesSet';
  id: Scalars['UUID'];
  templateId?: Maybe<Scalars['UUID']>;
};

export type UrlResolverQueryResultVirtualContributor = {
  __typename?: 'UrlResolverQueryResultVirtualContributor';
  calloutsSet: UrlResolverQueryResultCalloutsSet;
  id: Scalars['UUID'];
};

export type UrlResolverQueryResults = {
  __typename?: 'UrlResolverQueryResults';
  discussionId?: Maybe<Scalars['UUID']>;
  innovationHubId?: Maybe<Scalars['UUID']>;
  innovationPack?: Maybe<UrlResolverQueryResultInnovationPack>;
  organizationId?: Maybe<Scalars['UUID']>;
  space?: Maybe<UrlResolverQueryResultSpace>;
  type: UrlType;
  userId?: Maybe<Scalars['UUID']>;
  virtualContributor?: Maybe<UrlResolverQueryResultVirtualContributor>;
};

export enum UrlType {
  Admin = 'ADMIN',
  Callout = 'CALLOUT',
  CalloutsSet = 'CALLOUTS_SET',
  ContributionPost = 'CONTRIBUTION_POST',
  ContributionWhiteboard = 'CONTRIBUTION_WHITEBOARD',
  ContributorsExplorer = 'CONTRIBUTORS_EXPLORER',
  Discussion = 'DISCUSSION',
  Documentation = 'DOCUMENTATION',
  Flow = 'FLOW',
  Forum = 'FORUM',
  Home = 'HOME',
  InnovationHub = 'INNOVATION_HUB',
  InnovationLibrary = 'INNOVATION_LIBRARY',
  InnovationPacks = 'INNOVATION_PACKS',
  NotAuthorized = 'NOT_AUTHORIZED',
  Organization = 'ORGANIZATION',
  Space = 'SPACE',
  SpaceExplorer = 'SPACE_EXPLORER',
  Unknown = 'UNKNOWN',
  User = 'USER',
  VirtualContributor = 'VIRTUAL_CONTRIBUTOR',
}

export type User = Contributor & {
  __typename?: 'User';
  /** The account hosted by this User. */
  account?: Maybe<Account>;
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent: Agent;
  /** Details about the authentication used for this User. */
  authentication?: Maybe<UserAuthenticationResult>;
  /** The authorization rules for the Contributor */
  authorization?: Maybe<Authorization>;
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The direct rooms this user is a member of */
  directRooms?: Maybe<Array<DirectRoom>>;
  /** The email address for this User. */
  email: Scalars['String'];
  firstName: Scalars['String'];
  /** Guidance Chat Room for this user */
  guidanceRoom?: Maybe<Room>;
  /** The ID of the Contributor */
  id: Scalars['UUID'];
  /** Can a message be sent to this User. */
  isContactable: Scalars['Boolean'];
  lastName: Scalars['String'];
  /** A name identifier of the Contributor, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The phone number for this User. */
  phone?: Maybe<Scalars['String']>;
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** The Profile for this User. */
  profile: Profile;
  /** The settings for this User. */
  settings: UserSettings;
  /** The StorageAggregator for managing storage buckets in use by this User */
  storageAggregator?: Maybe<StorageAggregator>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type UserAuthenticationResult = {
  __typename?: 'UserAuthenticationResult';
  /** When the Kratos Account for the user last logged in */
  authenticatedAt?: Maybe<Scalars['DateTime']>;
  /** When the Kratos Account for the user was created */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** The Authentication Method used for this User. One of email, linkedin, microsoft, or unknown */
  method: AuthenticationType;
};

export type UserAuthorizationPrivilegesInput = {
  /** The authorization definition to evaluate the user credentials against. */
  authorizationID: Scalars['UUID'];
  /** The user to evaluate privileges granted based on held credentials. */
  userID: Scalars['UUID'];
};

export type UserAuthorizationResetInput = {
  /** The identifier of the User whose Authorization Policy should be reset. */
  userID: Scalars['UUID'];
};

export type UserFilterInput = {
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Users that are members of this User Group. */
  members?: Maybe<Array<User>>;
  /** Containing entity for this UserGroup. */
  parent?: Maybe<Groupable>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type UserSendMessageInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The user a message is being sent to */
  receivingUserID: Scalars['String'];
};

export type UserSettings = {
  __typename?: 'UserSettings';
  /** The communication settings for this User. */
  communication: UserSettingsCommunication;
  /** The privacy settings for this User */
  privacy: UserSettingsPrivacy;
};

export type UserSettingsCommunication = {
  __typename?: 'UserSettingsCommunication';
  /** Allow Users to send messages to this User. */
  allowOtherUsersToSendMessages: Scalars['Boolean'];
};

export type UserSettingsPrivacy = {
  __typename?: 'UserSettingsPrivacy';
  /** Allow contribution roles (communication, lead etc) in Spaces to be visible. */
  contributionRolesPubliclyVisible: Scalars['Boolean'];
};

export type UsersInRolesResponse = {
  __typename?: 'UsersInRolesResponse';
  role: RoleName;
  users: Array<User>;
};

export type UsersWithAuthorizationCredentialInput = {
  /** The resource to which a credential needs to be bound. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  /** The type of credential. */
  type: AuthorizationCredential;
};

export type VcInteraction = {
  __typename?: 'VcInteraction';
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  room: Room;
  threadID: Scalars['String'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  virtualContributorID: Scalars['UUID'];
};

export type VerifiedCredential = {
  __typename?: 'VerifiedCredential';
  /** The time at which the credential is no longer valid */
  claims: Array<VerifiedCredentialClaim>;
  /** JSON for the context in the credential */
  context: Scalars['JSON'];
  /** The time at which the credential is no longer valid */
  expires: Scalars['String'];
  /** The time at which the credential was issued */
  issued: Scalars['String'];
  /** The party issuing the VC */
  issuer: Scalars['String'];
  /** The name of the VC */
  name: Scalars['String'];
  /** The type of VC */
  type: Scalars['String'];
};

export type VerifiedCredentialClaim = {
  __typename?: 'VerifiedCredentialClaim';
  /** The name of the claim */
  name: Scalars['JSON'];
  /** The value for the claim */
  value: Scalars['JSON'];
};

export type VirtualContributor = Contributor & {
  __typename?: 'VirtualContributor';
  /** The Account of the Virtual Contributor. */
  account?: Maybe<Account>;
  /** The Agent representing this User. */
  agent: Agent;
  /** The AI persona being used by this virtual contributor */
  aiPersona?: Maybe<AiPersona>;
  /** The authorization rules for the Contributor */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the Contributor */
  id: Scalars['UUID'];
  /** The KnowledgeBase being used by this virtual contributor */
  knowledgeBase?: Maybe<KnowledgeBase>;
  /** Flag to control if this VC is listed in the platform store. */
  listedInStore: Scalars['Boolean'];
  /** A name identifier of the Contributor, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The profile for this Virtual. */
  profile: Profile;
  /** The Virtual Contributor provider. */
  provider: Contributor;
  /** Visibility of the VC in searches. */
  searchVisibility: SearchVisibility;
  /** The settings of this Virtual Contributor. */
  settings: VirtualContributorSettings;
  /** The status of the virtual contributor */
  status: VirtualContributorStatus;
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type VirtualContributorSettings = {
  __typename?: 'VirtualContributorSettings';
  /** The privacy settings for this VirtualContributor */
  privacy: VirtualContributorSettingsPrivacy;
};

export type VirtualContributorSettingsPrivacy = {
  __typename?: 'VirtualContributorSettingsPrivacy';
  /** Are the contents of the knowledge base publicly visible. */
  knowledgeBaseContentVisible: Scalars['Boolean'];
};

export enum VirtualContributorStatus {
  Initializing = 'INITIALIZING',
  Ready = 'READY',
}

/** The result from a Virtual Contributor update */
export type VirtualContributorUpdatedSubscriptionResult = {
  __typename?: 'VirtualContributorUpdatedSubscriptionResult';
  /** The Virtual Contributor that was updated */
  virtualContributor: VirtualContributor;
};

export type VirtualContributorsInRolesResponse = {
  __typename?: 'VirtualContributorsInRolesResponse';
  role: RoleName;
  virtualContributors: Array<VirtualContributor>;
};

export type Visual = {
  __typename?: 'Visual';
  allowedTypes: Array<Scalars['String']>;
  alternativeText?: Maybe<Scalars['String']>;
  /** Post ratio width / height. */
  aspectRatio: Scalars['Float'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The date at which the entity was created. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Maximum height resolution. */
  maxHeight: Scalars['Float'];
  /** Maximum width resolution. */
  maxWidth: Scalars['Float'];
  /** Minimum height resolution. */
  minHeight: Scalars['Float'];
  /** Minimum width resolution. */
  minWidth: Scalars['Float'];
  name: Scalars['String'];
  /** The date at which the entity was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
  uri: Scalars['String'];
};

export type VisualConstraints = {
  __typename?: 'VisualConstraints';
  /** Allowed file types. */
  allowedTypes: Array<Scalars['String']>;
  /** Dimensions ratio width / height. */
  aspectRatio: Scalars['Float'];
  /** Maximum height resolution. */
  maxHeight: Scalars['Float'];
  /** Maximum width resolution. */
  maxWidth: Scalars['Float'];
  /** Minimum height resolution. */
  minHeight: Scalars['Float'];
  /** Minimum width resolution. */
  minWidth: Scalars['Float'];
};

export enum VisualType {
  Avatar = 'AVATAR',
  Banner = 'BANNER',
  BannerWide = 'BANNER_WIDE',
  Card = 'CARD',
}

export type VisualUploadImageInput = {
  alternativeText?: InputMaybe<Scalars['String']>;
  visualID: Scalars['String'];
};

export type Whiteboard = {
  __typename?: 'Whiteboard';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The visual content of the Whiteboard. */
  content: Scalars['WhiteboardContent'];
  /** The policy governing who can update the Whiteboard contet. */
  contentUpdatePolicy: ContentUpdatePolicy;
  /** The user that created this Whiteboard */
  createdBy?: Maybe<User>;
  /** The date at which the Whiteboard was created. */
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Whether the Whiteboard is multi-user enabled on Space level. */
  isMultiUser: Scalars['Boolean'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Whiteboard. */
  profile: Profile;
  /** The date at which the Whiteboard was last updated. */
  updatedDate?: Maybe<Scalars['DateTime']>;
};

export type UploadFileOnReferenceMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileOnReferenceInput;
}>;

export type UploadFileOnReferenceMutation = {
  __typename?: 'Mutation';
  uploadFileOnReference: { __typename?: 'Reference'; id: string; uri: string };
};

export type UploadFileOnLinkMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileOnLinkInput;
}>;

export type UploadFileOnLinkMutation = {
  __typename?: 'Mutation';
  uploadFileOnLink: { __typename?: 'Link'; id: string; uri: string };
};

export type UploadFileMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileInput;
}>;

export type UploadFileMutation = { __typename?: 'Mutation'; uploadFileOnStorageBucket: string };

export type DefaultVisualTypeConstraintsQueryVariables = Exact<{
  visualType: VisualType;
}>;

export type DefaultVisualTypeConstraintsQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    configuration: {
      __typename?: 'Config';
      defaultVisualTypeConstraints: {
        __typename?: 'VisualConstraints';
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        aspectRatio: number;
        allowedTypes: Array<string>;
      };
    };
  };
};

export type InnovationPackProfilePageQueryVariables = Exact<{
  innovationPackId: Scalars['UUID'];
}>;

export type InnovationPackProfilePageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    innovationPack?:
      | {
          __typename?: 'InnovationPack';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
          profile: {
            __typename?: 'Profile';
            tagline?: string | undefined;
            id: string;
            displayName: string;
            description?: string | undefined;
            url: string;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  description?: string | undefined;
                  uri: string;
                }>
              | undefined;
          };
          templatesSet?: { __typename?: 'TemplatesSet'; id: string } | undefined;
        }
      | undefined;
  };
};

export type AdminInnovationPacksListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminInnovationPacksListQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      innovationPacks: Array<{
        __typename?: 'InnovationPack';
        id: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
      }>;
    };
  };
};

export type DeleteInnovationPackMutationVariables = Exact<{
  innovationPackId: Scalars['UUID'];
}>;

export type DeleteInnovationPackMutation = {
  __typename?: 'Mutation';
  deleteInnovationPack: { __typename?: 'InnovationPack'; id: string };
};

export type InnovationPackProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  tagline?: string | undefined;
  url: string;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
    | undefined;
};

export type AdminInnovationPackQueryVariables = Exact<{
  innovationPackId: Scalars['UUID'];
}>;

export type AdminInnovationPackQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    innovationPack?:
      | {
          __typename?: 'InnovationPack';
          id: string;
          listedInStore: boolean;
          searchVisibility: SearchVisibility;
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagline?: string | undefined;
            url: string;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  description?: string | undefined;
                  uri: string;
                }>
              | undefined;
          };
          templatesSet?: { __typename?: 'TemplatesSet'; id: string } | undefined;
        }
      | undefined;
  };
};

export type CreateInnovationPackMutationVariables = Exact<{
  packData: CreateInnovationPackOnAccountInput;
}>;

export type CreateInnovationPackMutation = {
  __typename?: 'Mutation';
  createInnovationPack: { __typename?: 'InnovationPack'; id: string };
};

export type UpdateInnovationPackMutationVariables = Exact<{
  packData: UpdateInnovationPackInput;
}>;

export type UpdateInnovationPackMutation = {
  __typename?: 'Mutation';
  updateInnovationPack: { __typename?: 'InnovationPack'; id: string };
};

type InnovationPackProviderProfileWithAvatar_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

type InnovationPackProviderProfileWithAvatar_User_Fragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

type InnovationPackProviderProfileWithAvatar_VirtualContributor_Fragment = {
  __typename?: 'VirtualContributor';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type InnovationPackProviderProfileWithAvatarFragment =
  | InnovationPackProviderProfileWithAvatar_Organization_Fragment
  | InnovationPackProviderProfileWithAvatar_User_Fragment
  | InnovationPackProviderProfileWithAvatar_VirtualContributor_Fragment;

export type InnovationPackCardFragment = {
  __typename?: 'InnovationPack';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
  };
  templatesSet?:
    | {
        __typename?: 'TemplatesSet';
        id: string;
        calloutTemplatesCount: number;
        communityGuidelinesTemplatesCount: number;
        collaborationTemplatesCount: number;
        postTemplatesCount: number;
        whiteboardTemplatesCount: number;
      }
    | undefined;
  provider:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      };
};

export type ApplyForEntryRoleOnRoleSetMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  questions: Array<CreateNvpInput> | CreateNvpInput;
}>;

export type ApplyForEntryRoleOnRoleSetMutation = {
  __typename?: 'Mutation';
  applyForEntryRoleOnRoleSet: { __typename?: 'Application'; id: string };
};

export type EventOnApplicationMutationVariables = Exact<{
  input: ApplicationEventInput;
}>;

export type EventOnApplicationMutation = {
  __typename?: 'Mutation';
  eventOnApplication: { __typename?: 'Application'; id: string; nextEvents: Array<string>; state: string };
};

export type JoinRoleSetMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
}>;

export type JoinRoleSetMutation = { __typename?: 'Mutation'; joinRoleSet: { __typename?: 'RoleSet'; id: string } };

export type InvitationStateEventMutationVariables = Exact<{
  eventName: Scalars['String'];
  invitationId: Scalars['UUID'];
}>;

export type InvitationStateEventMutation = {
  __typename?: 'Mutation';
  eventOnInvitation: { __typename?: 'Invitation'; id: string; nextEvents: Array<string>; state: string };
};

export type InviteContributorsEntryRoleOnRoleSetMutationVariables = Exact<{
  contributorIds: Array<Scalars['UUID']> | Scalars['UUID'];
  roleSetId: Scalars['UUID'];
  message?: InputMaybe<Scalars['String']>;
  extraRole?: InputMaybe<RoleName>;
}>;

export type InviteContributorsEntryRoleOnRoleSetMutation = {
  __typename?: 'Mutation';
  inviteContributorsEntryRoleOnRoleSet: Array<{ __typename?: 'Invitation'; id: string }>;
};

export type InviteUserToPlatformAndRoleSetMutationVariables = Exact<{
  email: Scalars['String'];
  roleSetId: Scalars['UUID'];
  message?: InputMaybe<Scalars['String']>;
  extraRole?: InputMaybe<RoleName>;
}>;

export type InviteUserToPlatformAndRoleSetMutation = {
  __typename?: 'Mutation';
  inviteUserToPlatformAndRoleSet: { __typename?: 'PlatformInvitation'; id: string };
};

export type DeleteInvitationMutationVariables = Exact<{
  invitationId: Scalars['UUID'];
}>;

export type DeleteInvitationMutation = {
  __typename?: 'Mutation';
  deleteInvitation: { __typename?: 'Invitation'; id: string };
};

export type DeletePlatformInvitationMutationVariables = Exact<{
  invitationId: Scalars['UUID'];
}>;

export type DeletePlatformInvitationMutation = {
  __typename?: 'Mutation';
  deletePlatformInvitation: { __typename?: 'PlatformInvitation'; id: string };
};

export type CommunityApplicationsInvitationsQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
}>;

export type CommunityApplicationsInvitationsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          applications: Array<{
            __typename?: 'Application';
            id: string;
            createdDate: Date;
            updatedDate: Date;
            state: string;
            nextEvents: Array<string>;
            contributor:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  email: string;
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                };
            questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
          }>;
          invitations: Array<{
            __typename?: 'Invitation';
            id: string;
            createdDate: Date;
            updatedDate: Date;
            state: string;
            nextEvents: Array<string>;
            contributorType: RoleSetContributorType;
            contributor:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  email: string;
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                };
          }>;
          platformInvitations: Array<{
            __typename?: 'PlatformInvitation';
            id: string;
            createdDate?: Date | undefined;
            email: string;
          }>;
        }
      | undefined;
  };
};

export type AdminCommunityApplicationFragment = {
  __typename?: 'Application';
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributor:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'User';
        email: string;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      };
  questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
};

export type AdminCommunityInvitationFragment = {
  __typename?: 'Invitation';
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: RoleSetContributorType;
  contributor:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'User';
        email: string;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
      };
};

export type AdminPlatformInvitationCommunityFragment = {
  __typename?: 'PlatformInvitation';
  id: string;
  createdDate?: Date | undefined;
  email: string;
};

type AdminCommunityCandidateMember_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
};

type AdminCommunityCandidateMember_User_Fragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
};

type AdminCommunityCandidateMember_VirtualContributor_Fragment = {
  __typename?: 'VirtualContributor';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
};

export type AdminCommunityCandidateMemberFragment =
  | AdminCommunityCandidateMember_Organization_Fragment
  | AdminCommunityCandidateMember_User_Fragment
  | AdminCommunityCandidateMember_VirtualContributor_Fragment;

export type UserPendingMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type UserPendingMembershipsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            description?: string | undefined;
            url: string;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
    communityApplications: Array<{
      __typename?: 'CommunityApplicationResult';
      id: string;
      spacePendingMembershipInfo: {
        __typename?: 'SpacePendingMembershipInfo';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            url: string;
          };
        };
      };
      application: { __typename?: 'Application'; id: string; state: string; createdDate: Date };
    }>;
    communityInvitations: Array<{
      __typename?: 'CommunityInvitationResult';
      id: string;
      spacePendingMembershipInfo: {
        __typename?: 'SpacePendingMembershipInfo';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            url: string;
          };
        };
      };
      invitation: {
        __typename?: 'Invitation';
        id: string;
        welcomeMessage?: string | undefined;
        state: string;
        createdDate: Date;
        contributorType: RoleSetContributorType;
        createdBy: { __typename?: 'User'; id: string };
        contributor:
          | { __typename?: 'Organization'; id: string }
          | { __typename?: 'User'; id: string }
          | { __typename?: 'VirtualContributor'; id: string };
      };
    }>;
  };
};

export type AvailableUserForRoleSetFragment = {
  __typename?: 'User';
  id: string;
  email: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type AvailableUsersForRoleSetPaginatedFragment = {
  __typename?: 'PaginatedUsers';
  users: Array<{
    __typename?: 'User';
    id: string;
    email: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
  pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
};

export type PlatformRoleAvailableUsersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type PlatformRoleAvailableUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      email: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
  };
};

export type AvailableUsersForEntryRoleQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type AvailableUsersForEntryRoleQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          availableUsersForEntryRole: {
            __typename?: 'PaginatedUsers';
            users: Array<{
              __typename?: 'User';
              id: string;
              email: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
            pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
          };
        }
      | undefined;
  };
};

export type AvailableUsersForElevatedRoleQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type AvailableUsersForElevatedRoleQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          availableUsersForElevatedRole: {
            __typename?: 'PaginatedUsers';
            users: Array<{
              __typename?: 'User';
              id: string;
              email: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
            pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
          };
        }
      | undefined;
  };
};

export type AvailableOrganizationsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type AvailableOrganizationsQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
  };
};

export type AvailableVirtualContributorsInLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type AvailableVirtualContributorsInLibraryQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      virtualContributors: Array<{
        __typename?: 'VirtualContributor';
        searchVisibility: SearchVisibility;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          description?: string | undefined;
          url: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
          location?:
            | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
            | undefined;
        };
        aiPersona?:
          | {
              __typename?: 'AiPersona';
              bodyOfKnowledge?: string | undefined;
              bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
              bodyOfKnowledgeID?: string | undefined;
            }
          | undefined;
      }>;
    };
  };
};

export type AvailableVirtualContributorsQueryVariables = Exact<{
  filterSpace?: InputMaybe<Scalars['Boolean']>;
  filterSpaceId?: InputMaybe<Scalars['UUID']>;
}>;

export type AvailableVirtualContributorsQuery = {
  __typename?: 'Query';
  lookup?: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          community: {
            __typename?: 'Community';
            id: string;
            roleSet: {
              __typename?: 'RoleSet';
              id: string;
              virtualContributorsInRole: Array<{
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  description?: string | undefined;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                  location?:
                    | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                    | undefined;
                };
                aiPersona?:
                  | {
                      __typename?: 'AiPersona';
                      bodyOfKnowledge?: string | undefined;
                      bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
                      bodyOfKnowledgeID?: string | undefined;
                    }
                  | undefined;
              }>;
            };
          };
          account: {
            __typename?: 'Account';
            id: string;
            virtualContributors: Array<{
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                  | undefined;
              };
              aiPersona?:
                | {
                    __typename?: 'AiPersona';
                    bodyOfKnowledge?: string | undefined;
                    bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
                    bodyOfKnowledgeID?: string | undefined;
                  }
                | undefined;
            }>;
          };
        }
      | undefined;
  };
  virtualContributors?: Array<{
    __typename?: 'VirtualContributor';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
      location?:
        | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
        | undefined;
    };
    aiPersona?:
      | {
          __typename?: 'AiPersona';
          bodyOfKnowledge?: string | undefined;
          bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
          bodyOfKnowledgeID?: string | undefined;
        }
      | undefined;
  }>;
};

export type VirtualContributorFullFragment = {
  __typename?: 'VirtualContributor';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
  aiPersona?:
    | {
        __typename?: 'AiPersona';
        bodyOfKnowledge?: string | undefined;
        bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
        bodyOfKnowledgeID?: string | undefined;
      }
    | undefined;
};

export type AssignPlatformRoleToUserMutationVariables = Exact<{
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type AssignPlatformRoleToUserMutation = {
  __typename?: 'Mutation';
  assignPlatformRoleToUser: { __typename?: 'User'; id: string };
};

export type AssignRoleToUserMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type AssignRoleToUserMutation = {
  __typename?: 'Mutation';
  assignRoleToUser: { __typename?: 'User'; id: string };
};

export type AssignRoleToOrganizationMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type AssignRoleToOrganizationMutation = {
  __typename?: 'Mutation';
  assignRoleToOrganization: { __typename?: 'Organization'; id: string };
};

export type AssignRoleToVirtualContributorMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type AssignRoleToVirtualContributorMutation = {
  __typename?: 'Mutation';
  assignRoleToVirtualContributor: { __typename?: 'VirtualContributor'; id: string };
};

export type RemovePlatformRoleFromUserMutationVariables = Exact<{
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type RemovePlatformRoleFromUserMutation = {
  __typename?: 'Mutation';
  removePlatformRoleFromUser: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveRoleFromUserMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type RemoveRoleFromUserMutation = {
  __typename?: 'Mutation';
  removeRoleFromUser: { __typename?: 'User'; id: string };
};

export type RemoveRoleFromOrganizationMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type RemoveRoleFromOrganizationMutation = {
  __typename?: 'Mutation';
  removeRoleFromOrganization: { __typename?: 'Organization'; id: string };
};

export type RemoveRoleFromVirtualContributorMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  role: RoleName;
  contributorId: Scalars['UUID'];
}>;

export type RemoveRoleFromVirtualContributorMutation = {
  __typename?: 'Mutation';
  removeRoleFromVirtualContributor: { __typename?: 'VirtualContributor'; id: string };
};

export type CommunityVirtualMembersListQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
}>;

export type CommunityVirtualMembersListQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          memberVirtualContributors: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            searchVisibility: SearchVisibility;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type MyMembershipsRoleSetFragment = {
  __typename?: 'RoleSet';
  id: string;
  myMembershipStatus?: CommunityMembershipStatus | undefined;
  myRoles: Array<RoleName>;
};

export type RoleDefinitionPolicyFragment = {
  __typename?: 'Role';
  id: string;
  name: RoleName;
  organizationPolicy: { __typename?: 'ContributorRolePolicy'; minimum: number; maximum: number };
  userPolicy: { __typename?: 'ContributorRolePolicy'; minimum: number; maximum: number };
};

export type RoleSetMemberUserFragment = {
  __typename?: 'User';
  id: string;
  isContactable: boolean;
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
  };
};

export type RoleSetMemberOrganizationFragment = {
  __typename?: 'Organization';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
      | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type RoleSetMemberVirtualContributorFragment = {
  __typename?: 'VirtualContributor';
  id: string;
  searchVisibility: SearchVisibility;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
};

export type RoleSetAuthorizationQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
}>;

export type RoleSetAuthorizationQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          id: string;
          roleNames: Array<RoleName>;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type RoleSetRoleAssignmentQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
  roles: Array<RoleName> | RoleName;
  includeUsers?: InputMaybe<Scalars['Boolean']>;
  includeOrganizations?: InputMaybe<Scalars['Boolean']>;
  includeVirtualContributors?: InputMaybe<Scalars['Boolean']>;
  includeRoleDefinitions?: InputMaybe<Scalars['Boolean']>;
}>;

export type RoleSetRoleAssignmentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          id: string;
          usersInRoles?: Array<{
            __typename?: 'UsersInRolesResponse';
            role: RoleName;
            users: Array<{
              __typename?: 'User';
              id: string;
              isContactable: boolean;
              email: string;
              firstName: string;
              lastName: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                  | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
              };
            }>;
          }>;
          organizationsInRoles?: Array<{
            __typename?: 'OrganizationsInRolesResponse';
            role: RoleName;
            organizations: Array<{
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
            }>;
          }>;
          virtualContributorsInRoles?: Array<{
            __typename?: 'VirtualContributorsInRolesResponse';
            role: RoleName;
            virtualContributors: Array<{
              __typename?: 'VirtualContributor';
              id: string;
              searchVisibility: SearchVisibility;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                  | undefined;
              };
            }>;
          }>;
          roleDefinitions?: Array<{
            __typename?: 'Role';
            id: string;
            name: RoleName;
            organizationPolicy: { __typename?: 'ContributorRolePolicy'; minimum: number; maximum: number };
            userPolicy: { __typename?: 'ContributorRolePolicy'; minimum: number; maximum: number };
          }>;
        }
      | undefined;
  };
};

export type SubspaceCommunityAndRoleSetIdQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SubspaceCommunityAndRoleSetIdQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          community: { __typename?: 'Community'; id: string; roleSet: { __typename?: 'RoleSet'; id: string } };
        }
      | undefined;
  };
};

export type AccountInformationQueryVariables = Exact<{
  accountId: Scalars['UUID'];
}>;

export type AccountInformationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    account?:
      | {
          __typename?: 'Account';
          id: string;
          externalSubscriptionID?: string | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          license: {
            __typename?: 'License';
            id: string;
            availableEntitlements?: Array<LicenseEntitlementType> | undefined;
            entitlements: Array<{
              __typename?: 'LicenseEntitlement';
              type: LicenseEntitlementType;
              limit: number;
              usage: number;
            }>;
          };
          host?:
            | { __typename?: 'Organization'; id: string }
            | { __typename?: 'User'; id: string }
            | { __typename?: 'VirtualContributor'; id: string }
            | undefined;
          spaces: Array<{
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              membership: {
                __typename?: 'SpaceAboutMembership';
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              };
            };
            license: {
              __typename?: 'License';
              id: string;
              entitlements: Array<{
                __typename?: 'LicenseEntitlement';
                id: string;
                type: LicenseEntitlementType;
                limit: number;
                usage: number;
                isAvailable: boolean;
                dataType: LicenseEntitlementDataType;
                enabled: boolean;
              }>;
            };
          }>;
          virtualContributors: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              tagline?: string | undefined;
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
          innovationPacks: Array<{
            __typename?: 'InnovationPack';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            templatesSet?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  calloutTemplatesCount: number;
                  collaborationTemplatesCount: number;
                  communityGuidelinesTemplatesCount: number;
                  postTemplatesCount: number;
                  whiteboardTemplatesCount: number;
                }
              | undefined;
          }>;
          innovationHubs: Array<{
            __typename?: 'InnovationHub';
            id: string;
            spaceVisibilityFilter?: SpaceVisibility | undefined;
            subdomain: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            spaceListFilter?:
              | Array<{
                  __typename?: 'Space';
                  id: string;
                  about: {
                    __typename?: 'SpaceAbout';
                    id: string;
                    isContentPublic: boolean;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      tagline?: string | undefined;
                      description?: string | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    };
                    membership: {
                      __typename?: 'SpaceAboutMembership';
                      myMembershipStatus?: CommunityMembershipStatus | undefined;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    };
                  };
                }>
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type AccountItemProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  url: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type ProfileVerifiedCredentialSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ProfileVerifiedCredentialSubscription = {
  __typename?: 'Subscription';
  profileVerifiedCredential: { __typename?: 'ProfileCredentialVerified'; vc: string };
};

export type GetSupportedCredentialMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type GetSupportedCredentialMetadataQuery = {
  __typename?: 'Query';
  getSupportedVerifiedCredentialMetadata: Array<{
    __typename?: 'CredentialMetadataOutput';
    name: string;
    description: string;
    schema: string;
    types: Array<string>;
    uniqueType: string;
    context: string;
  }>;
};

export type BeginCredentialRequestInteractionMutationVariables = Exact<{
  types: Array<Scalars['String']> | Scalars['String'];
}>;

export type BeginCredentialRequestInteractionMutation = {
  __typename?: 'Mutation';
  beginVerifiedCredentialRequestInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialRequestOutput';
    qrCodeImg: string;
    jwt: string;
  };
};

export type BeginAlkemioUserCredentialOfferInteractionMutationVariables = Exact<{ [key: string]: never }>;

export type BeginAlkemioUserCredentialOfferInteractionMutation = {
  __typename?: 'Mutation';
  beginAlkemioUserVerifiedCredentialOfferInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
    jwt: string;
    qrCodeImg: string;
  };
};

export type BeginCommunityMemberCredentialOfferInteractionMutationVariables = Exact<{
  communityID: Scalars['String'];
}>;

export type BeginCommunityMemberCredentialOfferInteractionMutation = {
  __typename?: 'Mutation';
  beginCommunityMemberVerifiedCredentialOfferInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
    jwt: string;
    qrCodeImg: string;
  };
};

export type UserAgentSsiFragment = {
  __typename?: 'User';
  id: string;
  agent: {
    __typename?: 'Agent';
    id: string;
    did?: string | undefined;
    verifiedCredentials?:
      | Array<{
          __typename?: 'VerifiedCredential';
          context: string;
          issued: string;
          expires: string;
          issuer: string;
          name: string;
          type: string;
          claims: Array<{ __typename?: 'VerifiedCredentialClaim'; name: string; value: string }>;
        }>
      | undefined;
  };
};

export type UserSsiQueryVariables = Exact<{ [key: string]: never }>;

export type UserSsiQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          agent: {
            __typename?: 'Agent';
            id: string;
            did?: string | undefined;
            verifiedCredentials?:
              | Array<{
                  __typename?: 'VerifiedCredential';
                  context: string;
                  issued: string;
                  expires: string;
                  issuer: string;
                  name: string;
                  type: string;
                  claims: Array<{ __typename?: 'VerifiedCredentialClaim'; name: string; value: string }>;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type CalloutPageCalloutQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutPageCalloutQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          sortOrder: number;
          activity: number;
          visibility: CalloutVisibility;
          classification?:
            | {
                __typename?: 'Classification';
                id: string;
                flowState?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
              }
            | undefined;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
              storageBucket: { __typename?: 'StorageBucket'; id: string };
            };
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  nameID: string;
                  createdDate: Date;
                  contentUpdatePolicy: ContentUpdatePolicy;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visual?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          };
          contributionPolicy: { __typename?: 'CalloutContributionPolicy'; state: CalloutState };
          contributionDefaults: {
            __typename?: 'CalloutContributionDefaults';
            id: string;
            postDescription?: string | undefined;
            whiteboardContent?: string | undefined;
          };
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            sortOrder: number;
            link?:
              | {
                  __typename?: 'Link';
                  id: string;
                  uri: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }
              | undefined;
          }>;
          comments?:
            | {
                __typename?: 'Room';
                id: string;
                messagesCount: number;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                messages: Array<{
                  __typename?: 'Message';
                  id: string;
                  message: string;
                  timestamp: number;
                  threadID?: string | undefined;
                  reactions: Array<{
                    __typename?: 'Reaction';
                    id: string;
                    emoji: string;
                    sender?:
                      | {
                          __typename?: 'User';
                          id: string;
                          profile: { __typename?: 'Profile'; id: string; displayName: string };
                        }
                      | undefined;
                  }>;
                  sender?:
                    | {
                        __typename?: 'Organization';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | {
                        __typename?: 'VirtualContributor';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | undefined;
                }>;
                vcInteractions: Array<{
                  __typename?: 'VcInteraction';
                  id: string;
                  threadID: string;
                  virtualContributorID: string;
                }>;
              }
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type InnovationFlowSettingsQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type InnovationFlowSettingsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    description?: string | undefined;
                    uri: string;
                  }>
                | undefined;
              bannerNarrow?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
            currentState: { __typename?: 'InnovationFlowState'; displayName: string };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          calloutsSet: {
            __typename?: 'CalloutsSet';
            id: string;
            callouts: Array<{
              __typename?: 'Callout';
              id: string;
              type: CalloutType;
              activity: number;
              sortOrder: number;
              classification?:
                | {
                    __typename?: 'Classification';
                    id: string;
                    flowState?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                  }
                | undefined;
              framing: {
                __typename?: 'CalloutFraming';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              };
            }>;
          };
        }
      | undefined;
  };
};

export type InnovationFlowDetailsQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type InnovationFlowDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    description?: string | undefined;
                    uri: string;
                  }>
                | undefined;
              bannerNarrow?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
            currentState: { __typename?: 'InnovationFlowState'; displayName: string };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
        }
      | undefined;
  };
};

export type InnovationFlowDetailsFragment = {
  __typename?: 'InnovationFlow';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
      | undefined;
    bannerNarrow?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
  states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
  currentState: { __typename?: 'InnovationFlowState'; displayName: string };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type InnovationFlowProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  tagsets?:
    | Array<{
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }>
    | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
    | undefined;
  bannerNarrow?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }
    | undefined;
};

export type InnovationFlowCollaborationFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  calloutsSet: {
    __typename?: 'CalloutsSet';
    id: string;
    callouts: Array<{
      __typename?: 'Callout';
      id: string;
      type: CalloutType;
      activity: number;
      sortOrder: number;
      classification?:
        | {
            __typename?: 'Classification';
            id: string;
            flowState?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
          }
        | undefined;
      framing: {
        __typename?: 'CalloutFraming';
        id: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
      };
    }>;
  };
};

export type UpdateCalloutFlowStateMutationVariables = Exact<{
  calloutId: Scalars['UUID'];
  flowStateTagsetId: Scalars['UUID'];
  value: Scalars['String'];
}>;

export type UpdateCalloutFlowStateMutation = {
  __typename?: 'Mutation';
  updateCallout: {
    __typename?: 'Callout';
    id: string;
    sortOrder: number;
    classification?:
      | {
          __typename?: 'Classification';
          id: string;
          flowState?:
            | {
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }
            | undefined;
        }
      | undefined;
  };
};

export type UpdateInnovationFlowCurrentStateMutationVariables = Exact<{
  innovationFlowId: Scalars['UUID'];
  currentState: Scalars['String'];
}>;

export type UpdateInnovationFlowCurrentStateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowSelectedState: {
    __typename?: 'InnovationFlow';
    id: string;
    currentState: { __typename?: 'InnovationFlowState'; displayName: string };
  };
};

export type UpdateInnovationFlowStatesMutationVariables = Exact<{
  innovationFlowId: Scalars['UUID'];
  states: Array<UpdateInnovationFlowStateInput> | UpdateInnovationFlowStateInput;
}>;

export type UpdateInnovationFlowStatesMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
  };
};

export type UpdateCollaborationFromTemplateMutationVariables = Exact<{
  collaborationId: Scalars['UUID'];
  collaborationTemplateId: Scalars['UUID'];
  addCallouts?: InputMaybe<Scalars['Boolean']>;
}>;

export type UpdateCollaborationFromTemplateMutation = {
  __typename?: 'Mutation';
  updateCollaborationFromTemplate: {
    __typename?: 'Collaboration';
    id: string;
    innovationFlow: {
      __typename?: 'InnovationFlow';
      id: string;
      states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
      currentState: { __typename?: 'InnovationFlowState'; displayName: string; description: string };
    };
  };
};

export type UpdateInnovationFlowSingleStateMutationVariables = Exact<{
  innovationFlowId: Scalars['UUID'];
  stateName: Scalars['String'];
  stateUpdatedData: UpdateInnovationFlowStateInput;
}>;

export type UpdateInnovationFlowSingleStateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowSingleState: {
    __typename?: 'InnovationFlow';
    id: string;
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
    currentState: { __typename?: 'InnovationFlowState'; displayName: string; description: string };
  };
};

export type UpdateInnovationFlowMutationVariables = Exact<{
  input: UpdateInnovationFlowEntityInput;
}>;

export type UpdateInnovationFlowMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ActivityLogMemberJoinedFragment = {
  __typename?: 'ActivityLogEntryMemberJoined';
  contributor:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        firstName: string;
        lastName: string;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      };
};

export type ActivityLogCalloutPublishedFragment = {
  __typename?: 'ActivityLogEntryCalloutPublished';
  callout: {
    __typename?: 'Callout';
    type: CalloutType;
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

export type ActivityLogCalloutPostCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutPostCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  post: {
    __typename?: 'Post';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
  };
};

export type ActivityLogCalloutLinkCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutLinkCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  link: { __typename?: 'Link'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

export type ActivityLogCalloutPostCommentFragment = {
  __typename?: 'ActivityLogEntryCalloutPostComment';
  description: string;
  post: {
    __typename?: 'Post';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityLogCalloutWhiteboardCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityLogCalloutWhiteboardContentModifiedFragment = {
  __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityLogChallengeCreatedFragment = {
  __typename?: 'ActivityLogEntryChallengeCreated';
  subspace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

export type ActivityLogOpportunityCreatedFragment = {
  __typename?: 'ActivityLogEntryOpportunityCreated';
  subsubspace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

export type ActivityLogCalloutDiscussionCommentFragment = {
  __typename?: 'ActivityLogEntryCalloutDiscussionComment';
  description: string;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

export type ActivityLogCalendarEventCreatedFragment = {
  __typename?: 'ActivityLogEntryCalendarEventCreated';
  calendarEvent: {
    __typename?: 'CalendarEvent';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityLogUpdateSentFragment = { __typename?: 'ActivityLogEntryUpdateSent'; message: string };

export type ActivitySubjectProfileFragment = { __typename?: 'Profile'; id: string; displayName: string; url: string };

export type ActivityCalloutContextFragment = {
  __typename?: 'Callout';
  id: string;
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityCreatedSubscriptionVariables = Exact<{
  input: ActivityCreatedSubscriptionInput;
}>;

export type ActivityCreatedSubscription = {
  __typename?: 'Subscription';
  activityCreated: {
    __typename?: 'ActivityCreatedSubscriptionResult';
    activity:
      | {
          __typename?: 'ActivityLogEntryCalendarEventCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          calendarEvent: {
            __typename?: 'CalendarEvent';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutDiscussionComment';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          description: string;
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutLinkCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          link: {
            __typename?: 'Link';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPostComment';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          description: string;
          post: {
            __typename?: 'Post';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPostCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          post: {
            __typename?: 'Post';
            id: string;
            profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPublished';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          callout: {
            __typename?: 'Callout';
            type: CalloutType;
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          whiteboard: {
            __typename?: 'Whiteboard';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          whiteboard: {
            __typename?: 'Whiteboard';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryChallengeCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          subspace: {
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryMemberJoined';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          contributor:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                firstName: string;
                lastName: string;
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              };
        }
      | {
          __typename?: 'ActivityLogEntryOpportunityCreated';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          subsubspace: {
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryUpdateSent';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          message: string;
        };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalendarEventCreated_Fragment = {
  __typename?: 'ActivityLogEntryCalendarEventCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  calendarEvent: {
    __typename?: 'CalendarEvent';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutDiscussionComment_Fragment = {
  __typename?: 'ActivityLogEntryCalloutDiscussionComment';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  description: string;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutLinkCreated_Fragment = {
  __typename?: 'ActivityLogEntryCalloutLinkCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  link: { __typename?: 'Link'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPostComment_Fragment = {
  __typename?: 'ActivityLogEntryCalloutPostComment';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  description: string;
  post: {
    __typename?: 'Post';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPostCreated_Fragment = {
  __typename?: 'ActivityLogEntryCalloutPostCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  post: {
    __typename?: 'Post';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPublished_Fragment = {
  __typename?: 'ActivityLogEntryCalloutPublished';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  callout: {
    __typename?: 'Callout';
    type: CalloutType;
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardContentModified_Fragment = {
  __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardCreated_Fragment = {
  __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryChallengeCreated_Fragment = {
  __typename?: 'ActivityLogEntryChallengeCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  subspace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryMemberJoined_Fragment = {
  __typename?: 'ActivityLogEntryMemberJoined';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  contributor:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        firstName: string;
        lastName: string;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      };
};

type ActivityLogOnCollaboration_ActivityLogEntryOpportunityCreated_Fragment = {
  __typename?: 'ActivityLogEntryOpportunityCreated';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  subsubspace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
    };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryUpdateSent_Fragment = {
  __typename?: 'ActivityLogEntryUpdateSent';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  message: string;
};

export type ActivityLogOnCollaborationFragment =
  | ActivityLogOnCollaboration_ActivityLogEntryCalendarEventCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutDiscussionComment_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutLinkCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPostComment_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPostCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPublished_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardContentModified_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryChallengeCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryMemberJoined_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryOpportunityCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryUpdateSent_Fragment;

export type ActivityLogOnCollaborationQueryVariables = Exact<{
  collaborationID: Scalars['UUID'];
  limit: Scalars['Float'];
  types?: InputMaybe<Array<ActivityEventType> | ActivityEventType>;
}>;

export type ActivityLogOnCollaborationQuery = {
  __typename?: 'Query';
  activityLogOnCollaboration: Array<
    | {
        __typename?: 'ActivityLogEntryCalendarEventCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        calendarEvent: {
          __typename?: 'CalendarEvent';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutDiscussionComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutLinkCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        link: { __typename?: 'Link'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPostComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        post: {
          __typename?: 'Post';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPostCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        post: {
          __typename?: 'Post';
          id: string;
          profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPublished';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          type: CalloutType;
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        whiteboard: {
          __typename?: 'Whiteboard';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        whiteboard: {
          __typename?: 'Whiteboard';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryChallengeCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        subspace: {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryMemberJoined';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        contributor:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              firstName: string;
              lastName: string;
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            };
      }
    | {
        __typename?: 'ActivityLogEntryOpportunityCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
        subsubspace: {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryUpdateSent';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        message: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
        };
      }
  >;
};

export type CollaborationAuthorizationEntitlementsQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type CollaborationAuthorizationEntitlementsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          license: {
            __typename?: 'License';
            id: string;
            availableEntitlements?: Array<LicenseEntitlementType> | undefined;
          };
          calloutsSet: {
            __typename?: 'CalloutsSet';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
        }
      | undefined;
  };
};

export type RemoveCommentFromCalloutMutationVariables = Exact<{
  messageData: RoomRemoveMessageInput;
}>;

export type RemoveCommentFromCalloutMutation = { __typename?: 'Mutation'; removeMessageOnRoom: string };

export type UpdateCalloutMutationVariables = Exact<{
  calloutData: UpdateCalloutEntityInput;
}>;

export type UpdateCalloutMutation = {
  __typename?: 'Mutation';
  updateCallout: {
    __typename?: 'Callout';
    id: string;
    type: CalloutType;
    visibility: CalloutVisibility;
    classification?:
      | {
          __typename?: 'Classification';
          id: string;
          flowState?:
            | {
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }
            | undefined;
        }
      | undefined;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        description?: string | undefined;
        displayName: string;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
      };
    };
    contributionDefaults: {
      __typename?: 'CalloutContributionDefaults';
      id: string;
      postDescription?: string | undefined;
      whiteboardContent?: string | undefined;
    };
    contributionPolicy: { __typename?: 'CalloutContributionPolicy'; id: string; state: CalloutState };
  };
};

export type UpdateCalloutTemplateMutationVariables = Exact<{
  calloutData: UpdateCalloutEntityInput;
}>;

export type UpdateCalloutTemplateMutation = {
  __typename?: 'Mutation';
  updateCallout: {
    __typename?: 'Callout';
    id: string;
    type: CalloutType;
    visibility: CalloutVisibility;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        description?: string | undefined;
        displayName: string;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
      };
      whiteboard?: { __typename?: 'Whiteboard'; id: string; content: string } | undefined;
    };
    contributionDefaults: {
      __typename?: 'CalloutContributionDefaults';
      id: string;
      postDescription?: string | undefined;
      whiteboardContent?: string | undefined;
    };
    contributionPolicy: { __typename?: 'CalloutContributionPolicy'; id: string; state: CalloutState };
  };
};

export type UpdateCalloutVisibilityMutationVariables = Exact<{
  calloutData: UpdateCalloutVisibilityInput;
}>;

export type UpdateCalloutVisibilityMutation = {
  __typename?: 'Mutation';
  updateCalloutVisibility: {
    __typename?: 'Callout';
    id: string;
    type: CalloutType;
    sortOrder: number;
    activity: number;
    visibility: CalloutVisibility;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
        url: string;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
        storageBucket: { __typename?: 'StorageBucket'; id: string };
      };
      whiteboard?:
        | {
            __typename?: 'Whiteboard';
            id: string;
            nameID: string;
            createdDate: Date;
            contentUpdatePolicy: ContentUpdatePolicy;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
              preview?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              storageBucket: { __typename?: 'StorageBucket'; id: string };
            };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            createdBy?:
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                  };
                }
              | undefined;
          }
        | undefined;
    };
    contributionPolicy: { __typename?: 'CalloutContributionPolicy'; state: CalloutState };
    contributionDefaults: {
      __typename?: 'CalloutContributionDefaults';
      id: string;
      postDescription?: string | undefined;
      whiteboardContent?: string | undefined;
    };
    contributions: Array<{
      __typename?: 'CalloutContribution';
      id: string;
      sortOrder: number;
      link?:
        | {
            __typename?: 'Link';
            id: string;
            uri: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    }>;
    comments?:
      | {
          __typename?: 'Room';
          id: string;
          messagesCount: number;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          messages: Array<{
            __typename?: 'Message';
            id: string;
            message: string;
            timestamp: number;
            threadID?: string | undefined;
            reactions: Array<{
              __typename?: 'Reaction';
              id: string;
              emoji: string;
              sender?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
                  }
                | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | undefined;
          }>;
          vcInteractions: Array<{
            __typename?: 'VcInteraction';
            id: string;
            threadID: string;
            virtualContributorID: string;
          }>;
        }
      | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type DeleteCalloutMutationVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type DeleteCalloutMutation = { __typename?: 'Mutation'; deleteCallout: { __typename?: 'Callout'; id: string } };

export type CreateLinkOnCalloutMutationVariables = Exact<{
  input: CreateContributionOnCalloutInput;
}>;

export type CreateLinkOnCalloutMutation = {
  __typename?: 'Mutation';
  createContributionOnCallout: {
    __typename?: 'CalloutContribution';
    link?:
      | {
          __typename?: 'Link';
          id: string;
          uri: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        }
      | undefined;
  };
};

export type DeleteLinkMutationVariables = Exact<{
  input: DeleteLinkInput;
}>;

export type DeleteLinkMutation = { __typename?: 'Mutation'; deleteLink: { __typename?: 'Link'; id: string } };

export type UpdateLinkMutationVariables = Exact<{
  input: UpdateLinkInput;
}>;

export type UpdateLinkMutation = {
  __typename?: 'Mutation';
  updateLink: {
    __typename?: 'Link';
    id: string;
    uri: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

export type CalloutPostCreatedSubscriptionVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutPostCreatedSubscription = {
  __typename?: 'Subscription';
  calloutPostCreated: {
    __typename?: 'CalloutPostCreated';
    contributionID: string;
    sortOrder: number;
    post: {
      __typename?: 'Post';
      id: string;
      createdDate: Date;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      createdBy?:
        | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
        | undefined;
      comments: { __typename?: 'Room'; id: string; messagesCount: number };
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        description?: string | undefined;
        visuals: Array<{
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }>;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
      };
    };
  };
};

export type CalloutPostsQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutPostsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            sortOrder: number;
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  createdDate: Date;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | undefined;
                  comments: { __typename?: 'Room'; id: string; messagesCount: number };
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visuals: Array<{
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }>;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type ContributeTabPostFragment = {
  __typename?: 'Post';
  id: string;
  createdDate: Date;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  createdBy?:
    | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
    | undefined;
  comments: { __typename?: 'Room'; id: string; messagesCount: number };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    visuals: Array<{
      __typename?: 'Visual';
      id: string;
      uri: string;
      name: string;
      allowedTypes: Array<string>;
      aspectRatio: number;
      maxHeight: number;
      maxWidth: number;
      minHeight: number;
      minWidth: number;
      alternativeText?: string | undefined;
    }>;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
  };
};

export type CreatePostFromContributeTabMutationVariables = Exact<{
  postData: CreateContributionOnCalloutInput;
}>;

export type CreatePostFromContributeTabMutation = {
  __typename?: 'Mutation';
  createContributionOnCallout: {
    __typename?: 'CalloutContribution';
    post?: { __typename?: 'Post'; id: string } | undefined;
  };
};

export type PostCardFragment = {
  __typename?: 'Post';
  id: string;
  createdDate: Date;
  createdBy?:
    | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
    | undefined;
  comments: { __typename?: 'Room'; id: string; messagesCount: number };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    visuals: Array<{
      __typename?: 'Visual';
      id: string;
      uri: string;
      name: string;
      allowedTypes: Array<string>;
      aspectRatio: number;
      maxHeight: number;
      maxWidth: number;
      minHeight: number;
      minWidth: number;
      alternativeText?: string | undefined;
    }>;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
  };
};

export type CalloutWhiteboardsQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutWhiteboardsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            sortOrder: number;
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  createdDate: Date;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type WhiteboardCollectionCalloutCardFragment = {
  __typename?: 'Whiteboard';
  id: string;
  createdDate: Date;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type UpdateCalloutsSortOrderMutationVariables = Exact<{
  calloutsSetID: Scalars['UUID'];
  calloutIds: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type UpdateCalloutsSortOrderMutation = {
  __typename?: 'Mutation';
  updateCalloutsSortOrder: Array<{ __typename?: 'Callout'; id: string; sortOrder: number }>;
};

export type UpdateContributionsSortOrderMutationVariables = Exact<{
  calloutID: Scalars['UUID'];
  contributionIds: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type UpdateContributionsSortOrderMutation = {
  __typename?: 'Mutation';
  updateContributionsSortOrder: Array<{ __typename?: 'CalloutContribution'; id: string; sortOrder: number }>;
};

export type DashboardTopCalloutsFragment = {
  __typename?: 'Collaboration';
  calloutsSet: {
    __typename?: 'CalloutsSet';
    id: string;
    callouts: Array<{
      __typename?: 'Callout';
      id: string;
      type: CalloutType;
      visibility: CalloutVisibility;
      activity: number;
      framing: {
        __typename?: 'CalloutFraming';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          description?: string | undefined;
        };
      };
    }>;
  };
};

export type DashboardTopCalloutFragment = {
  __typename?: 'Callout';
  id: string;
  type: CalloutType;
  visibility: CalloutVisibility;
  activity: number;
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string; description?: string | undefined };
  };
};

export type CalloutsSetAuthorizationQueryVariables = Exact<{
  calloutsSetId: Scalars['UUID'];
}>;

export type CalloutsSetAuthorizationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calloutsSet?:
      | {
          __typename?: 'CalloutsSet';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type CreateCalloutMutationVariables = Exact<{
  calloutData: CreateCalloutOnCalloutsSetInput;
}>;

export type CreateCalloutMutation = {
  __typename?: 'Mutation';
  createCalloutOnCalloutsSet: {
    __typename?: 'Callout';
    nameID: string;
    id: string;
    type: CalloutType;
    sortOrder: number;
    activity: number;
    visibility: CalloutVisibility;
    classification?:
      | {
          __typename?: 'Classification';
          id: string;
          flowState?:
            | {
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }
            | undefined;
        }
      | undefined;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
        url: string;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
        storageBucket: { __typename?: 'StorageBucket'; id: string };
      };
      whiteboard?:
        | {
            __typename?: 'Whiteboard';
            id: string;
            nameID: string;
            createdDate: Date;
            contentUpdatePolicy: ContentUpdatePolicy;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
              preview?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              storageBucket: { __typename?: 'StorageBucket'; id: string };
            };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            createdBy?:
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                  };
                }
              | undefined;
          }
        | undefined;
    };
    contributionPolicy: { __typename?: 'CalloutContributionPolicy'; state: CalloutState };
    contributionDefaults: {
      __typename?: 'CalloutContributionDefaults';
      id: string;
      postDescription?: string | undefined;
      whiteboardContent?: string | undefined;
    };
    contributions: Array<{
      __typename?: 'CalloutContribution';
      id: string;
      sortOrder: number;
      link?:
        | {
            __typename?: 'Link';
            id: string;
            uri: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    }>;
    comments?:
      | {
          __typename?: 'Room';
          id: string;
          messagesCount: number;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          messages: Array<{
            __typename?: 'Message';
            id: string;
            message: string;
            timestamp: number;
            threadID?: string | undefined;
            reactions: Array<{
              __typename?: 'Reaction';
              id: string;
              emoji: string;
              sender?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
                  }
                | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | undefined;
          }>;
          vcInteractions: Array<{
            __typename?: 'VcInteraction';
            id: string;
            threadID: string;
            virtualContributorID: string;
          }>;
        }
      | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CalloutsOnCalloutsSetUsingClassificationQueryVariables = Exact<{
  calloutsSetId: Scalars['UUID'];
  classificationByFlowStateEnabled?: Scalars['Boolean'];
  classificationTagsets?: InputMaybe<Array<TagsetArgs> | TagsetArgs>;
}>;

export type CalloutsOnCalloutsSetUsingClassificationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calloutsSet?:
      | {
          __typename?: 'CalloutsSet';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts: Array<{
            __typename?: 'Callout';
            id: string;
            type: CalloutType;
            sortOrder: number;
            activity: number;
            visibility: CalloutVisibility;
            classification?:
              | {
                  __typename?: 'Classification';
                  id: string;
                  flowState?:
                    | {
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }
                    | undefined;
                }
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
            };
          }>;
        }
      | undefined;
  };
};

export type CalloutFragment = {
  __typename?: 'Callout';
  id: string;
  type: CalloutType;
  sortOrder: number;
  activity: number;
  visibility: CalloutVisibility;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
  };
};

export type CalloutDetailsQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
  includeClassification?: Scalars['Boolean'];
}>;

export type CalloutDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          sortOrder: number;
          activity: number;
          visibility: CalloutVisibility;
          classification?:
            | {
                __typename?: 'Classification';
                id: string;
                flowState?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
              }
            | undefined;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
              storageBucket: { __typename?: 'StorageBucket'; id: string };
            };
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  nameID: string;
                  createdDate: Date;
                  contentUpdatePolicy: ContentUpdatePolicy;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visual?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          };
          contributionPolicy: { __typename?: 'CalloutContributionPolicy'; state: CalloutState };
          contributionDefaults: {
            __typename?: 'CalloutContributionDefaults';
            id: string;
            postDescription?: string | undefined;
            whiteboardContent?: string | undefined;
          };
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            sortOrder: number;
            link?:
              | {
                  __typename?: 'Link';
                  id: string;
                  uri: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }
              | undefined;
          }>;
          comments?:
            | {
                __typename?: 'Room';
                id: string;
                messagesCount: number;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                messages: Array<{
                  __typename?: 'Message';
                  id: string;
                  message: string;
                  timestamp: number;
                  threadID?: string | undefined;
                  reactions: Array<{
                    __typename?: 'Reaction';
                    id: string;
                    emoji: string;
                    sender?:
                      | {
                          __typename?: 'User';
                          id: string;
                          profile: { __typename?: 'Profile'; id: string; displayName: string };
                        }
                      | undefined;
                  }>;
                  sender?:
                    | {
                        __typename?: 'Organization';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | {
                        __typename?: 'VirtualContributor';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          description?: string | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                        };
                      }
                    | undefined;
                }>;
                vcInteractions: Array<{
                  __typename?: 'VcInteraction';
                  id: string;
                  threadID: string;
                  virtualContributorID: string;
                }>;
              }
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type CalloutDetailsFragment = {
  __typename?: 'Callout';
  id: string;
  type: CalloutType;
  sortOrder: number;
  activity: number;
  visibility: CalloutVisibility;
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      storageBucket: { __typename?: 'StorageBucket'; id: string };
    };
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          contentUpdatePolicy: ContentUpdatePolicy;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            preview?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            storageBucket: { __typename?: 'StorageBucket'; id: string };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
  contributionPolicy: { __typename?: 'CalloutContributionPolicy'; state: CalloutState };
  contributionDefaults: {
    __typename?: 'CalloutContributionDefaults';
    id: string;
    postDescription?: string | undefined;
    whiteboardContent?: string | undefined;
  };
  contributions: Array<{
    __typename?: 'CalloutContribution';
    id: string;
    sortOrder: number;
    link?:
      | {
          __typename?: 'Link';
          id: string;
          uri: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  }>;
  comments?:
    | {
        __typename?: 'Room';
        id: string;
        messagesCount: number;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        messages: Array<{
          __typename?: 'Message';
          id: string;
          message: string;
          timestamp: number;
          threadID?: string | undefined;
          reactions: Array<{
            __typename?: 'Reaction';
            id: string;
            emoji: string;
            sender?:
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          }>;
          sender?:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                };
              }
            | undefined;
        }>;
        vcInteractions: Array<{
          __typename?: 'VcInteraction';
          id: string;
          threadID: string;
          virtualContributorID: string;
        }>;
      }
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type CalloutContentQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
            };
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  content: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          };
          contributionDefaults: {
            __typename?: 'CalloutContributionDefaults';
            id: string;
            postDescription?: string | undefined;
            whiteboardContent?: string | undefined;
          };
        }
      | undefined;
  };
};

export type PostQueryVariables = Exact<{
  postId: Scalars['UUID'];
}>;

export type PostQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    post?:
      | {
          __typename?: 'Post';
          id: string;
          createdDate: Date;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            url: string;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                };
              }
            | undefined;
          comments: {
            __typename?: 'Room';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            messages: Array<{
              __typename?: 'Message';
              id: string;
              message: string;
              timestamp: number;
              threadID?: string | undefined;
              reactions: Array<{
                __typename?: 'Reaction';
                id: string;
                emoji: string;
                sender?:
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string };
                    }
                  | undefined;
              }>;
              sender?:
                | {
                    __typename?: 'Organization';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | {
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | {
                    __typename?: 'VirtualContributor';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | undefined;
            }>;
            vcInteractions: Array<{
              __typename?: 'VcInteraction';
              id: string;
              threadID: string;
              virtualContributorID: string;
            }>;
          };
        }
      | undefined;
  };
};

export type UpdatePostMutationVariables = Exact<{
  input: UpdatePostInput;
}>;

export type UpdatePostMutation = {
  __typename?: 'Mutation';
  updatePost: {
    __typename?: 'Post';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
        | undefined;
    };
  };
};

export type DeletePostMutationVariables = Exact<{
  postId: Scalars['UUID'];
}>;

export type DeletePostMutation = { __typename?: 'Mutation'; deletePost: { __typename?: 'Post'; id: string } };

export type MoveContributionToCalloutMutationVariables = Exact<{
  contributionId: Scalars['UUID'];
  calloutId: Scalars['UUID'];
}>;

export type MoveContributionToCalloutMutation = {
  __typename?: 'Mutation';
  moveContributionToCallout: {
    __typename?: 'CalloutContribution';
    id: string;
    post?:
      | { __typename?: 'Post'; id: string; profile: { __typename?: 'Profile'; id: string; url: string } }
      | undefined;
  };
};

export type PostSettingsQueryVariables = Exact<{
  postId: Scalars['UUID'];
  calloutId: Scalars['UUID'];
}>;

export type PostSettingsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            post?: { __typename?: 'Post'; id: string } | undefined;
          }>;
          postNames: Array<{
            __typename?: 'CalloutContribution';
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    visuals: Array<{
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }>;
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
    post?:
      | {
          __typename?: 'Post';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            visuals: Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
              alternativeText?: string | undefined;
            }>;
          };
        }
      | undefined;
  };
};

export type PostSettingsFragment = {
  __typename?: 'Post';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    visuals: Array<{
      __typename?: 'Visual';
      id: string;
      uri: string;
      name: string;
      allowedTypes: Array<string>;
      aspectRatio: number;
      maxHeight: number;
      maxWidth: number;
      minHeight: number;
      minWidth: number;
      alternativeText?: string | undefined;
    }>;
  };
};

export type PostSettingsCalloutFragment = {
  __typename?: 'Callout';
  id: string;
  type: CalloutType;
  contributions: Array<{
    __typename?: 'CalloutContribution';
    id: string;
    post?: { __typename?: 'Post'; id: string } | undefined;
  }>;
  postNames: Array<{
    __typename?: 'CalloutContribution';
    post?:
      | {
          __typename?: 'Post';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            visuals: Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
              alternativeText?: string | undefined;
            }>;
          };
        }
      | undefined;
  }>;
};

export type PostCalloutsInCalloutSetQueryVariables = Exact<{
  calloutsSetId: Scalars['UUID'];
}>;

export type PostCalloutsInCalloutSetQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calloutsSet?:
      | {
          __typename?: 'CalloutsSet';
          id: string;
          callouts: Array<{
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            };
          }>;
        }
      | undefined;
  };
};

export type WhiteboardProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  description?: string | undefined;
  visual?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }
    | undefined;
  preview?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }
    | undefined;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
  storageBucket: { __typename?: 'StorageBucket'; id: string };
};

export type WhiteboardDetailsFragment = {
  __typename?: 'Whiteboard';
  id: string;
  nameID: string;
  createdDate: Date;
  contentUpdatePolicy: ContentUpdatePolicy;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
    preview?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    storageBucket: { __typename?: 'StorageBucket'; id: string };
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  createdBy?:
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          location?:
            | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
            | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | undefined;
};

export type WhiteboardContentFragment = { __typename?: 'Whiteboard'; id: string; content: string };

export type CollaborationWithWhiteboardDetailsFragment = {
  __typename?: 'Collaboration';
  id: string;
  calloutsSet: {
    __typename?: 'CalloutsSet';
    id: string;
    callouts: Array<{
      __typename?: 'Callout';
      id: string;
      type: CalloutType;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      contributions: Array<{
        __typename?: 'CalloutContribution';
        whiteboard?:
          | {
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              contentUpdatePolicy: ContentUpdatePolicy;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                description?: string | undefined;
                visual?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
                preview?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
                tagset?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
                storageBucket: { __typename?: 'StorageBucket'; id: string };
              };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              createdBy?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }
          | undefined;
      }>;
      framing: {
        __typename?: 'CalloutFraming';
        id: string;
        whiteboard?:
          | {
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              contentUpdatePolicy: ContentUpdatePolicy;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                description?: string | undefined;
                visual?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
                preview?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
                tagset?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
                storageBucket: { __typename?: 'StorageBucket'; id: string };
              };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              createdBy?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }
          | undefined;
      };
    }>;
  };
};

export type WhiteboardFromCalloutQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
  contributionId: Scalars['UUID'];
}>;

export type WhiteboardFromCalloutQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  nameID: string;
                  createdDate: Date;
                  contentUpdatePolicy: ContentUpdatePolicy;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visual?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          };
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  nameID: string;
                  createdDate: Date;
                  contentUpdatePolicy: ContentUpdatePolicy;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visual?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type WhiteboardWithContentQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type WhiteboardWithContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          contentUpdatePolicy: ContentUpdatePolicy;
          content: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            preview?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            storageBucket: { __typename?: 'StorageBucket'; id: string };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type WhiteboardWithoutContentQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type WhiteboardWithoutContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          contentUpdatePolicy: ContentUpdatePolicy;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            preview?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            storageBucket: { __typename?: 'StorageBucket'; id: string };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type WhiteboardLastUpdatedDateQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type WhiteboardLastUpdatedDateQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboard?: { __typename?: 'Whiteboard'; id: string; updatedDate?: Date | undefined } | undefined;
  };
};

export type CreateWhiteboardOnCalloutMutationVariables = Exact<{
  input: CreateContributionOnCalloutInput;
}>;

export type CreateWhiteboardOnCalloutMutation = {
  __typename?: 'Mutation';
  createContributionOnCallout: {
    __typename?: 'CalloutContribution';
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          contentUpdatePolicy: ContentUpdatePolicy;
          profile: {
            __typename?: 'Profile';
            url: string;
            id: string;
            displayName: string;
            description?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            preview?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            storageBucket: { __typename?: 'StorageBucket'; id: string };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type DeleteWhiteboardMutationVariables = Exact<{
  input: DeleteWhiteboardInput;
}>;

export type DeleteWhiteboardMutation = {
  __typename?: 'Mutation';
  deleteWhiteboard: { __typename?: 'Whiteboard'; id: string };
};

export type UpdateWhiteboardMutationVariables = Exact<{
  input: UpdateWhiteboardEntityInput;
}>;

export type UpdateWhiteboardMutation = {
  __typename?: 'Mutation';
  updateWhiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type WhiteboardContentUpdatePolicyQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type WhiteboardContentUpdatePolicyQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboard?: { __typename?: 'Whiteboard'; id: string; contentUpdatePolicy: ContentUpdatePolicy } | undefined;
  };
};

export type UpdateWhiteboardContentUpdatePolicyMutationVariables = Exact<{
  whiteboardId: Scalars['UUID'];
  contentUpdatePolicy: ContentUpdatePolicy;
}>;

export type UpdateWhiteboardContentUpdatePolicyMutation = {
  __typename?: 'Mutation';
  updateWhiteboard: { __typename?: 'Whiteboard'; id: string; contentUpdatePolicy: ContentUpdatePolicy };
};

export type LinkDetailsFragment = {
  __typename?: 'Link';
  id: string;
  uri: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
};

export type LinkDetailsWithAuthorizationFragment = {
  __typename?: 'Link';
  id: string;
  uri: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type FullLocationFragment = {
  __typename?: 'Location';
  id: string;
  country?: string | undefined;
  city?: string | undefined;
  addressLine1?: string | undefined;
  addressLine2?: string | undefined;
  stateOrProvince?: string | undefined;
  postalCode?: string | undefined;
};

export type CreateReferenceOnProfileMutationVariables = Exact<{
  input: CreateReferenceOnProfileInput;
}>;

export type CreateReferenceOnProfileMutation = {
  __typename?: 'Mutation';
  createReferenceOnProfile: {
    __typename?: 'Reference';
    id: string;
    name: string;
    uri: string;
    description?: string | undefined;
  };
};

export type DeleteReferenceMutationVariables = Exact<{
  input: DeleteReferenceInput;
}>;

export type DeleteReferenceMutation = {
  __typename?: 'Mutation';
  deleteReference: { __typename?: 'Reference'; id: string };
};

export type ReferenceDetailsFragment = {
  __typename?: 'Reference';
  id: string;
  name: string;
  uri: string;
  description?: string | undefined;
};

export type CreateTagsetOnProfileMutationVariables = Exact<{
  input: CreateTagsetOnProfileInput;
}>;

export type CreateTagsetOnProfileMutation = {
  __typename?: 'Mutation';
  createTagsetOnProfile: {
    __typename?: 'Tagset';
    id: string;
    name: string;
    tags: Array<string>;
    allowedValues: Array<string>;
    type: TagsetType;
  };
};

export type TagsetDetailsFragment = {
  __typename?: 'Tagset';
  id: string;
  name: string;
  tags: Array<string>;
  allowedValues: Array<string>;
  type: TagsetType;
};

export type UploadVisualMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: VisualUploadImageInput;
}>;

export type UploadVisualMutation = {
  __typename?: 'Mutation';
  uploadImageOnVisual: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined };
};

export type VisualFullFragment = {
  __typename?: 'Visual';
  id: string;
  uri: string;
  name: string;
  allowedTypes: Array<string>;
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
  alternativeText?: string | undefined;
};

export type VisualUriFragment = { __typename?: 'Visual'; id: string; uri: string; name: string };

export type AuthorDetailsQueryVariables = Exact<{
  ids: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type AuthorDetailsQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  }>;
};

export type LatestReleaseDiscussionQueryVariables = Exact<{ [key: string]: never }>;

export type LatestReleaseDiscussionQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    latestReleaseDiscussion?: { __typename?: 'LatestReleaseDiscussion'; id: string } | undefined;
  };
};

export type CreateDiscussionMutationVariables = Exact<{
  input: ForumCreateDiscussionInput;
}>;

export type CreateDiscussionMutation = {
  __typename?: 'Mutation';
  createDiscussion: {
    __typename?: 'Discussion';
    id: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: ForumDiscussionCategory;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string; description?: string | undefined };
    comments: {
      __typename?: 'Room';
      id: string;
      messagesCount: number;
      authorization?:
        | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      messages: Array<{
        __typename?: 'Message';
        id: string;
        message: string;
        timestamp: number;
        threadID?: string | undefined;
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          sender?:
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | undefined;
      }>;
    };
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type UpdateDiscussionMutationVariables = Exact<{
  input: UpdateDiscussionInput;
}>;

export type UpdateDiscussionMutation = {
  __typename?: 'Mutation';
  updateDiscussion: {
    __typename?: 'Discussion';
    id: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: ForumDiscussionCategory;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string; description?: string | undefined };
    comments: {
      __typename?: 'Room';
      id: string;
      messagesCount: number;
      authorization?:
        | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      messages: Array<{
        __typename?: 'Message';
        id: string;
        message: string;
        timestamp: number;
        threadID?: string | undefined;
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          sender?:
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | undefined;
      }>;
    };
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type DeleteDiscussionMutationVariables = Exact<{
  deleteData: DeleteDiscussionInput;
}>;

export type DeleteDiscussionMutation = {
  __typename?: 'Mutation';
  deleteDiscussion: { __typename?: 'Discussion'; id: string };
};

export type DiscussionDetailsFragment = {
  __typename?: 'Discussion';
  id: string;
  createdBy?: string | undefined;
  timestamp?: number | undefined;
  category: ForumDiscussionCategory;
  profile: { __typename?: 'Profile'; id: string; url: string; displayName: string; description?: string | undefined };
  comments: {
    __typename?: 'Room';
    id: string;
    messagesCount: number;
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    messages: Array<{
      __typename?: 'Message';
      id: string;
      message: string;
      timestamp: number;
      threadID?: string | undefined;
      reactions: Array<{
        __typename?: 'Reaction';
        id: string;
        emoji: string;
        sender?:
          | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
          | undefined;
      }>;
      sender?:
        | {
            __typename?: 'Organization';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | {
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | undefined;
    }>;
  };
  authorization?:
    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type PlatformDiscussionsQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformDiscussionsQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    forum: {
      __typename?: 'Forum';
      id: string;
      discussionCategories: Array<ForumDiscussionCategory>;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      discussions?:
        | Array<{
            __typename?: 'Discussion';
            id: string;
            category: ForumDiscussionCategory;
            timestamp?: number | undefined;
            createdBy?: string | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              tagline?: string | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
            comments: {
              __typename?: 'Room';
              id: string;
              messagesCount: number;
              authorization?:
                | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }>
        | undefined;
    };
  };
};

export type DiscussionCardFragment = {
  __typename?: 'Discussion';
  id: string;
  category: ForumDiscussionCategory;
  timestamp?: number | undefined;
  createdBy?: string | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagline?: string | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
  comments: {
    __typename?: 'Room';
    id: string;
    messagesCount: number;
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type PlatformDiscussionQueryVariables = Exact<{
  discussionId: Scalars['UUID'];
}>;

export type PlatformDiscussionQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    forum: {
      __typename?: 'Forum';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      discussion?:
        | {
            __typename?: 'Discussion';
            id: string;
            createdBy?: string | undefined;
            timestamp?: number | undefined;
            category: ForumDiscussionCategory;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
            };
            comments: {
              __typename?: 'Room';
              id: string;
              messagesCount: number;
              authorization?:
                | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              messages: Array<{
                __typename?: 'Message';
                id: string;
                message: string;
                timestamp: number;
                threadID?: string | undefined;
                reactions: Array<{
                  __typename?: 'Reaction';
                  id: string;
                  emoji: string;
                  sender?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | undefined;
                }>;
                sender?:
                  | {
                      __typename?: 'Organization';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | {
                      __typename?: 'VirtualContributor';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | undefined;
              }>;
            };
            authorization?:
              | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ForumDiscussionUpdatedSubscriptionVariables = Exact<{
  forumID: Scalars['UUID'];
}>;

export type ForumDiscussionUpdatedSubscription = {
  __typename?: 'Subscription';
  forumDiscussionUpdated: {
    __typename?: 'Discussion';
    id: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: ForumDiscussionCategory;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline?: string | undefined;
      visuals: Array<{
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }>;
    };
    comments: { __typename?: 'Room'; id: string; messagesCount: number };
  };
};

export type SendMessageToUserMutationVariables = Exact<{
  messageData: CommunicationSendMessageToUserInput;
}>;

export type SendMessageToUserMutation = { __typename?: 'Mutation'; sendMessageToUser: boolean };

export type SendMessageToOrganizationMutationVariables = Exact<{
  messageData: CommunicationSendMessageToOrganizationInput;
}>;

export type SendMessageToOrganizationMutation = { __typename?: 'Mutation'; sendMessageToOrganization: boolean };

export type SendMessageToCommunityLeadsMutationVariables = Exact<{
  messageData: CommunicationSendMessageToCommunityLeadsInput;
}>;

export type SendMessageToCommunityLeadsMutation = { __typename?: 'Mutation'; sendMessageToCommunityLeads: boolean };

export type AddReactionMutationVariables = Exact<{
  roomId: Scalars['UUID'];
  messageId: Scalars['MessageID'];
  emoji: Scalars['Emoji'];
}>;

export type AddReactionMutation = {
  __typename?: 'Mutation';
  addReactionToMessageInRoom: {
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
  };
};

export type MessageDetailsFragment = {
  __typename?: 'Message';
  id: string;
  message: string;
  timestamp: number;
  threadID?: string | undefined;
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    sender?:
      | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | undefined;
  }>;
  sender?:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
          location?:
            | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
          location?:
            | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
            | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
          location?:
            | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
            | undefined;
        };
      }
    | undefined;
};

export type ReactionDetailsFragment = {
  __typename?: 'Reaction';
  id: string;
  emoji: string;
  sender?:
    | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
    | undefined;
};

export type CommentsWithMessagesFragment = {
  __typename?: 'Room';
  id: string;
  messagesCount: number;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  messages: Array<{
    __typename?: 'Message';
    id: string;
    message: string;
    timestamp: number;
    threadID?: string | undefined;
    reactions: Array<{
      __typename?: 'Reaction';
      id: string;
      emoji: string;
      sender?:
        | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
        | undefined;
    }>;
    sender?:
      | {
          __typename?: 'Organization';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        }
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        }
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        }
      | undefined;
  }>;
  vcInteractions: Array<{ __typename?: 'VcInteraction'; id: string; threadID: string; virtualContributorID: string }>;
};

export type RemoveReactionMutationVariables = Exact<{
  roomId: Scalars['UUID'];
  reactionId: Scalars['MessageID'];
}>;

export type RemoveReactionMutation = { __typename?: 'Mutation'; removeReactionToMessageInRoom: boolean };

export type ReplyToMessageMutationVariables = Exact<{
  roomId: Scalars['UUID'];
  message: Scalars['String'];
  threadId: Scalars['MessageID'];
}>;

export type ReplyToMessageMutation = {
  __typename?: 'Mutation';
  sendMessageReplyToRoom: {
    __typename?: 'Message';
    id: string;
    message: string;
    timestamp: number;
    sender?:
      | { __typename?: 'Organization' }
      | { __typename?: 'User'; id: string }
      | { __typename?: 'VirtualContributor'; id: string }
      | undefined;
  };
};

export type VcInteractionsDetailsFragment = {
  __typename?: 'VcInteraction';
  id: string;
  threadID: string;
  virtualContributorID: string;
};

export type MentionableUsersQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  roleSetId?: Scalars['UUID'];
  includeVirtualContributors: Scalars['Boolean'];
}>;

export type MentionableUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        location?:
          | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
          | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
  };
  lookup?: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          virtualContributorsInRole: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type SendMessageToRoomMutationVariables = Exact<{
  messageData: RoomSendMessageInput;
}>;

export type SendMessageToRoomMutation = {
  __typename?: 'Mutation';
  sendMessageToRoom: {
    __typename?: 'Message';
    id: string;
    message: string;
    timestamp: number;
    sender?:
      | { __typename?: 'Organization' }
      | { __typename?: 'User'; id: string }
      | { __typename?: 'VirtualContributor'; id: string }
      | undefined;
  };
};

export type RemoveMessageOnRoomMutationVariables = Exact<{
  messageData: RoomRemoveMessageInput;
}>;

export type RemoveMessageOnRoomMutation = { __typename?: 'Mutation'; removeMessageOnRoom: string };

export type RoomEventsSubscriptionVariables = Exact<{
  roomID: Scalars['UUID'];
}>;

export type RoomEventsSubscription = {
  __typename?: 'Subscription';
  roomEvents: {
    __typename?: 'RoomEventSubscriptionResult';
    roomID: string;
    room: {
      __typename?: 'Room';
      vcInteractions: Array<{
        __typename?: 'VcInteraction';
        id: string;
        threadID: string;
        virtualContributorID: string;
      }>;
    };
    message?:
      | {
          __typename?: 'RoomMessageEventSubscriptionResult';
          type: MutationType;
          data: {
            __typename?: 'Message';
            id: string;
            message: string;
            timestamp: number;
            threadID?: string | undefined;
            reactions: Array<{
              __typename?: 'Reaction';
              id: string;
              emoji: string;
              sender?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
                  }
                | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | undefined;
          };
        }
      | undefined;
    reaction?:
      | {
          __typename?: 'RoomMessageReactionEventSubscriptionResult';
          type: MutationType;
          messageID?: string | undefined;
          data: {
            __typename?: 'Reaction';
            id: string;
            emoji: string;
            sender?:
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          };
        }
      | undefined;
  };
};

export type CommunityUpdatesQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityUpdatesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          communication: {
            __typename?: 'Communication';
            id: string;
            updates: {
              __typename?: 'Room';
              id: string;
              messagesCount: number;
              messages: Array<{
                __typename?: 'Message';
                id: string;
                message: string;
                timestamp: number;
                threadID?: string | undefined;
                reactions: Array<{
                  __typename?: 'Reaction';
                  id: string;
                  emoji: string;
                  sender?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | undefined;
                }>;
                sender?:
                  | {
                      __typename?: 'Organization';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | {
                      __typename?: 'VirtualContributor';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        description?: string | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{
                              __typename?: 'Tagset';
                              id: string;
                              name: string;
                              tags: Array<string>;
                              allowedValues: Array<string>;
                              type: TagsetType;
                            }>
                          | undefined;
                        location?:
                          | {
                              __typename?: 'Location';
                              id: string;
                              country?: string | undefined;
                              city?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | undefined;
              }>;
            };
          };
        }
      | undefined;
  };
};

export type CommunityUserPrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
  parentSpaceId?: Scalars['UUID'];
  includeParentSpace?: Scalars['Boolean'];
}>;

export type CommunityUserPrivilegesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              url: string;
            };
          };
          community: {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            roleSet: {
              __typename?: 'RoleSet';
              id: string;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
  parentSpace: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              url: string;
            };
          };
          community: {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            roleSet: {
              __typename?: 'RoleSet';
              id: string;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type SpaceApplicationQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceApplicationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              url: string;
            };
          };
          community: {
            __typename?: 'Community';
            id: string;
            roleSet: { __typename?: 'RoleSet'; id: string };
            guidelines: {
              __typename?: 'CommunityGuidelines';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                references?:
                  | Array<{
                      __typename?: 'Reference';
                      id: string;
                      name: string;
                      uri: string;
                      description?: string | undefined;
                    }>
                  | undefined;
              };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type RoleSetApplicationFormQueryVariables = Exact<{
  roleSetId: Scalars['UUID'];
}>;

export type RoleSetApplicationFormQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    roleSet?:
      | {
          __typename?: 'RoleSet';
          id: string;
          applicationForm: {
            __typename?: 'Form';
            id: string;
            description?: string | undefined;
            questions: Array<{
              __typename?: 'FormQuestion';
              question: string;
              explanation: string;
              maxLength: number;
              required: boolean;
              sortOrder: number;
            }>;
          };
        }
      | undefined;
  };
};

export type ApplicationFormFragment = {
  __typename?: 'Form';
  id: string;
  description?: string | undefined;
  questions: Array<{
    __typename?: 'FormQuestion';
    question: string;
    explanation: string;
    maxLength: number;
    required: boolean;
    sortOrder: number;
  }>;
};

export type UpdateApplicationFormOnRoleSetMutationVariables = Exact<{
  roleSetId: Scalars['UUID'];
  formData: UpdateFormInput;
}>;

export type UpdateApplicationFormOnRoleSetMutation = {
  __typename?: 'Mutation';
  updateApplicationFormOnRoleSet: { __typename?: 'RoleSet'; id: string };
};

export type CommunityGuidelinesQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityGuidelinesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          guidelines: {
            __typename?: 'CommunityGuidelines';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
            };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
        }
      | undefined;
  };
};

export type CommunityGuidelinesDetailsFragment = {
  __typename?: 'CommunityGuidelines';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type UpdateCommunityGuidelinesMutationVariables = Exact<{
  communityGuidelinesData: UpdateCommunityGuidelinesEntityInput;
}>;

export type UpdateCommunityGuidelinesMutation = {
  __typename?: 'Mutation';
  updateCommunityGuidelines: {
    __typename?: 'CommunityGuidelines';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type RemoveCommunityGuidelinesContentMutationVariables = Exact<{
  communityGuidelinesData: RemoveCommunityGuidelinesContentInput;
}>;

export type RemoveCommunityGuidelinesContentMutation = {
  __typename?: 'Mutation';
  removeCommunityGuidelinesContent: {
    __typename?: 'CommunityGuidelines';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CommunityPageMembersFragment = {
  __typename?: 'User';
  id: string;
  email: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    location?: { __typename?: 'Location'; country?: string | undefined; city?: string | undefined } | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
  };
};

export type BasicOrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type AllOrganizationsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type AllOrganizationsQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type CreateWingbackAccountMutationVariables = Exact<{
  accountID: Scalars['UUID'];
}>;

export type CreateWingbackAccountMutation = { __typename?: 'Mutation'; createWingbackAccount: string };

export type ContributorsPageOrganizationsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  status?: InputMaybe<OrganizationVerificationEnum>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type ContributorsPageOrganizationsQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      orgProfile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
        url: string;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type ContributorsPageUsersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  withTags?: InputMaybe<Scalars['Boolean']>;
}>;

export type ContributorsPageUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      isContactable: boolean;
      userProfile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        location?: { __typename?: 'Location'; city?: string | undefined; country?: string | undefined } | undefined;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?:
          | Array<{
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }>
          | undefined;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type ContributorsVirtualInLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type ContributorsVirtualInLibraryQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      virtualContributors: Array<{
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          location?: { __typename?: 'Location'; city?: string | undefined; country?: string | undefined } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }>;
    };
  };
};

export type OrganizationContributorPaginatedFragment = {
  __typename?: 'PaginatedOrganization';
  organization: Array<{
    __typename?: 'Organization';
    id: string;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    orgProfile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  }>;
  pageInfo: {
    __typename?: 'PageInfo';
    startCursor?: string | undefined;
    endCursor?: string | undefined;
    hasNextPage: boolean;
  };
};

export type OrganizationContributorFragment = {
  __typename?: 'Organization';
  id: string;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  orgProfile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type UserContributorPaginatedFragment = {
  __typename?: 'PaginatedUsers';
  users: Array<{
    __typename?: 'User';
    id: string;
    isContactable: boolean;
    userProfile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      location?: { __typename?: 'Location'; city?: string | undefined; country?: string | undefined } | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  }>;
  pageInfo: {
    __typename?: 'PageInfo';
    startCursor?: string | undefined;
    endCursor?: string | undefined;
    hasNextPage: boolean;
  };
};

export type UserContributorFragment = {
  __typename?: 'User';
  id: string;
  isContactable: boolean;
  userProfile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    location?: { __typename?: 'Location'; city?: string | undefined; country?: string | undefined } | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
  };
};

type ContributorDetails_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
      | undefined;
  };
};

type ContributorDetails_User_Fragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
      | undefined;
  };
};

type ContributorDetails_VirtualContributor_Fragment = {
  __typename?: 'VirtualContributor';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
      | undefined;
  };
};

export type ContributorDetailsFragment =
  | ContributorDetails_Organization_Fragment
  | ContributorDetails_User_Fragment
  | ContributorDetails_VirtualContributor_Fragment;

export type AssociatedOrganizationQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type AssociatedOrganizationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          roleSet: { __typename?: 'RoleSet'; id: string; myRoles: Array<RoleName> };
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            tagline?: string | undefined;
            displayName: string;
            description?: string | undefined;
            location?:
              | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
              | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
          };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        }
      | undefined;
  };
};

export type RolesOrganizationQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type RolesOrganizationQuery = {
  __typename?: 'Query';
  rolesOrganization: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      roles: Array<string>;
      displayName: string;
      visibility: SpaceVisibility;
      subspaces: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        displayName: string;
        roles: Array<string>;
        level: SpaceLevel;
      }>;
    }>;
  };
};

export type OrganizationInfoFragment = {
  __typename?: 'Organization';
  id: string;
  contactEmail?: string | undefined;
  domain?: string | undefined;
  website?: string | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  roleSet: { __typename?: 'RoleSet'; id: string };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagline?: string | undefined;
    avatar?:
      | { __typename?: 'Visual'; alternativeText?: string | undefined; id: string; uri: string; name: string }
      | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    location?:
      | {
          __typename?: 'Location';
          id: string;
          country?: string | undefined;
          city?: string | undefined;
          addressLine1?: string | undefined;
          addressLine2?: string | undefined;
          stateOrProvince?: string | undefined;
          postalCode?: string | undefined;
        }
      | undefined;
  };
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
};

export type OrganizationInfoQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type OrganizationInfoQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          contactEmail?: string | undefined;
          domain?: string | undefined;
          website?: string | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          roleSet: { __typename?: 'RoleSet'; id: string };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            tagline?: string | undefined;
            avatar?:
              | { __typename?: 'Visual'; alternativeText?: string | undefined; id: string; uri: string; name: string }
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            location?:
              | {
                  __typename?: 'Location';
                  id: string;
                  country?: string | undefined;
                  city?: string | undefined;
                  addressLine1?: string | undefined;
                  addressLine2?: string | undefined;
                  stateOrProvince?: string | undefined;
                  postalCode?: string | undefined;
                }
              | undefined;
          };
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        }
      | undefined;
  };
};

export type OrganizationProfileInfoFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  contactEmail?: string | undefined;
  domain?: string | undefined;
  legalEntityName?: string | undefined;
  website?: string | undefined;
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagline?: string | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
    location?: { __typename?: 'Location'; country?: string | undefined; city?: string | undefined } | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
  };
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnOrganizationMutation = {
  __typename?: 'Mutation';
  createGroupOnOrganization: {
    __typename?: 'UserGroup';
    id: string;
    profile?: { __typename?: 'Profile'; id: string; displayName: string } | undefined;
  };
};

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;

export type CreateOrganizationMutation = {
  __typename?: 'Mutation';
  createOrganization: {
    __typename?: 'Organization';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type DeleteOrganizationMutationVariables = Exact<{
  input: DeleteOrganizationInput;
}>;

export type DeleteOrganizationMutation = {
  __typename?: 'Mutation';
  deleteOrganization: { __typename?: 'Organization'; id: string };
};

export type OrganizationAuthorizationQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type OrganizationAuthorizationQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type OrganizationProfileInfoQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type OrganizationProfileInfoQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          nameID: string;
          contactEmail?: string | undefined;
          domain?: string | undefined;
          legalEntityName?: string | undefined;
          website?: string | undefined;
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            tagline?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            location?: { __typename?: 'Location'; country?: string | undefined; city?: string | undefined } | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type AccountResourcesInfoQueryVariables = Exact<{
  accountId: Scalars['UUID'];
}>;

export type AccountResourcesInfoQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    account?:
      | {
          __typename?: 'Account';
          id: string;
          spaces: Array<{
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
          }>;
          virtualContributors: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              tagline?: string | undefined;
              id: string;
              displayName: string;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
          innovationPacks: Array<{
            __typename?: 'InnovationPack';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            templatesSet?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  calloutTemplatesCount: number;
                  collaborationTemplatesCount: number;
                  communityGuidelinesTemplatesCount: number;
                  postTemplatesCount: number;
                  whiteboardTemplatesCount: number;
                }
              | undefined;
          }>;
          innovationHubs: Array<{
            __typename?: 'InnovationHub';
            id: string;
            spaceVisibilityFilter?: SpaceVisibility | undefined;
            subdomain: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            spaceListFilter?:
              | Array<{
                  __typename?: 'Space';
                  id: string;
                  about: {
                    __typename?: 'SpaceAbout';
                    id: string;
                    isContentPublic: boolean;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      tagline?: string | undefined;
                      description?: string | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    };
                    membership: {
                      __typename?: 'SpaceAboutMembership';
                      myMembershipStatus?: CommunityMembershipStatus | undefined;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    };
                  };
                }>
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type AccountResourceProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  url: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type OrganizationAccountQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type OrganizationAccountQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
          account?: { __typename?: 'Account'; id: string } | undefined;
        }
      | undefined;
  };
};

export type OrganizationSettingsQueryVariables = Exact<{
  orgId: Scalars['UUID'];
}>;

export type OrganizationSettingsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          settings: {
            __typename?: 'OrganizationSettings';
            membership: { __typename?: 'OrganizationSettingsMembership'; allowUsersMatchingDomainToJoin: boolean };
            privacy: { __typename?: 'OrganizationSettingsPrivacy'; contributionRolesPubliclyVisible: boolean };
          };
        }
      | undefined;
  };
};

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;

export type UpdateOrganizationMutation = {
  __typename?: 'Mutation';
  updateOrganization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    contactEmail?: string | undefined;
    domain?: string | undefined;
    legalEntityName?: string | undefined;
    website?: string | undefined;
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      description?: string | undefined;
      tagline?: string | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
      location?: { __typename?: 'Location'; country?: string | undefined; city?: string | undefined } | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  };
};

export type UpdateOrganizationSettingsMutationVariables = Exact<{
  settingsData: UpdateOrganizationSettingsInput;
}>;

export type UpdateOrganizationSettingsMutation = {
  __typename?: 'Mutation';
  updateOrganizationSettings: {
    __typename?: 'Organization';
    id: string;
    settings: {
      __typename?: 'OrganizationSettings';
      membership: { __typename?: 'OrganizationSettingsMembership'; allowUsersMatchingDomainToJoin: boolean };
    };
  };
};

export type PendingInvitationsCountQueryVariables = Exact<{ [key: string]: never }>;

export type PendingInvitationsCountQuery = {
  __typename?: 'Query';
  me: { __typename?: 'MeQueryResults'; communityInvitationsCount: number };
};

export type PendingMembershipsSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
  fetchCommunityGuidelines?: Scalars['Boolean'];
}>;

export type PendingMembershipsSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            };
          };
          community?: {
            __typename?: 'Community';
            id: string;
            guidelines: {
              __typename?: 'CommunityGuidelines';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                references?:
                  | Array<{
                      __typename?: 'Reference';
                      id: string;
                      name: string;
                      uri: string;
                      description?: string | undefined;
                    }>
                  | undefined;
              };
            };
          };
        }
      | undefined;
  };
};

export type PendingMembershipsUserQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type PendingMembershipsUserQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | undefined;
  };
};

export type PendingMembershipsMembershipsFragment = {
  __typename?: 'Community';
  id: string;
  roleSet: {
    __typename?: 'RoleSet';
    applications: Array<{ __typename?: 'Application'; id: string }>;
    invitations: Array<{
      __typename?: 'Invitation';
      id: string;
      welcomeMessage?: string | undefined;
      createdBy: {
        __typename?: 'User';
        id: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
      };
    }>;
  };
};

export type PendingMembershipInvitationFragment = {
  __typename?: 'Invitation';
  id: string;
  welcomeMessage?: string | undefined;
  createdBy: { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

export type CommunityGuidelinesSummaryFragment = {
  __typename?: 'CommunityGuidelines';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
  };
};

export type SpaceContributionDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceContributionDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              tagline?: string | undefined;
              visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              roleSetID?: string | undefined;
              communityID?: string | undefined;
            };
          };
        }
      | undefined;
  };
};

export type UserSelectorQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
}>;

export type UserSelectorQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?:
          | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
          | undefined;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
  };
};

export type UserSelectorUserDetailsQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type UserSelectorUserDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            location?:
              | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
              | undefined;
            visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
        }
      | undefined;
  };
};

export type UserSelectorUserInformationFragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type UserDetailsFragment = {
  __typename?: 'User';
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    tagline?: string | undefined;
    description?: string | undefined;
    url: string;
    location?:
      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
      | undefined;
    avatar?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    tagsets?:
      | Array<{
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }>
      | undefined;
  };
};

export type UserDisplayNameFragment = {
  __typename?: 'User';
  id: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline?: string | undefined;
      description?: string | undefined;
      url: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  };
};

export type CreateUserNewRegistrationMutationVariables = Exact<{ [key: string]: never }>;

export type CreateUserNewRegistrationMutation = {
  __typename?: 'Mutation';
  createUserNewRegistration: {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline?: string | undefined;
      description?: string | undefined;
      url: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  };
};

export type DeleteUserMutationVariables = Exact<{
  input: DeleteUserInput;
}>;

export type DeleteUserMutation = { __typename?: 'Mutation'; deleteUser: { __typename?: 'User'; id: string } };

export type UpdatePreferenceOnUserMutationVariables = Exact<{
  userId: Scalars['UUID'];
  type: PreferenceType;
  value: Scalars['String'];
}>;

export type UpdatePreferenceOnUserMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnUser: { __typename?: 'Preference'; id: string; value: string };
};

export type UserAccountQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserAccountQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
          agent: {
            __typename?: 'Agent';
            id: string;
            credentials?: Array<{ __typename?: 'Credential'; id: string; type: CredentialType }> | undefined;
          };
          account?: { __typename?: 'Account'; id: string } | undefined;
        }
      | undefined;
  };
};

export type UserQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            description?: string | undefined;
            url: string;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type UserNotificationsPreferencesQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserNotificationsPreferencesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          preferences: Array<{
            __typename?: 'Preference';
            id: string;
            value: string;
            definition: {
              __typename?: 'PreferenceDefinition';
              id: string;
              description: string;
              displayName: string;
              group: string;
              type: PreferenceType;
              valueType: PreferenceValueType;
            };
          }>;
        }
      | undefined;
  };
};

export type UserProfileQueryVariables = Exact<{
  input: Scalars['UUID'];
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          isContactable: boolean;
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            description?: string | undefined;
            url: string;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
  };
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      displayName: string;
      roles: Array<string>;
      visibility: SpaceVisibility;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; displayName: string; roles: Array<string> }>;
    }>;
    organizations: Array<{
      __typename?: 'RolesResultOrganization';
      id: string;
      displayName: string;
      roles: Array<string>;
    }>;
  };
  platform: {
    __typename?: 'Platform';
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    roleSet: { __typename?: 'RoleSet'; id: string; myRoles: Array<RoleName> };
  };
};

export type MyPrivilegesFragment = {
  __typename?: 'Authorization';
  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
};

export type UserProviderQueryVariables = Exact<{ [key: string]: never }>;

export type UserProviderQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | undefined;
          account?:
            | {
                __typename?: 'Account';
                id: string;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                license: {
                  __typename?: 'License';
                  id: string;
                  availableEntitlements?: Array<LicenseEntitlementType> | undefined;
                };
              }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            description?: string | undefined;
            url: string;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type InvitationDataFragment = {
  __typename?: 'CommunityInvitationResult';
  id: string;
  spacePendingMembershipInfo: {
    __typename?: 'SpacePendingMembershipInfo';
    id: string;
    level: SpaceLevel;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined; url: string };
    };
  };
  invitation: {
    __typename?: 'Invitation';
    id: string;
    welcomeMessage?: string | undefined;
    state: string;
    createdDate: Date;
    contributorType: RoleSetContributorType;
    createdBy: { __typename?: 'User'; id: string };
    contributor:
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'User'; id: string }
      | { __typename?: 'VirtualContributor'; id: string };
  };
};

export type EntitlementDetailsFragment = {
  __typename?: 'LicenseEntitlement';
  id: string;
  type: LicenseEntitlementType;
  limit: number;
  usage: number;
  isAvailable: boolean;
  dataType: LicenseEntitlementDataType;
  enabled: boolean;
};

export type UserContributionDisplayNamesQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserContributionDisplayNamesQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      displayName: string;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; displayName: string }>;
    }>;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string; displayName: string }>;
  };
};

export type UserContributionsQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserContributionsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      roles: Array<string>;
      subspaces: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        type: SpaceType;
        level: SpaceLevel;
        roles: Array<string>;
      }>;
    }>;
  };
};

export type UserOrganizationIdsQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserOrganizationIdsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string }>;
  };
};

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline?: string | undefined;
      description?: string | undefined;
      url: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
    };
  };
};

export type UpdateUserSettingsMutationVariables = Exact<{
  settingsData: UpdateUserSettingsInput;
}>;

export type UpdateUserSettingsMutation = {
  __typename?: 'Mutation';
  updateUserSettings: {
    __typename?: 'User';
    id: string;
    settings: {
      __typename?: 'UserSettings';
      privacy: { __typename?: 'UserSettingsPrivacy'; contributionRolesPubliclyVisible: boolean };
      communication: { __typename?: 'UserSettingsCommunication'; allowOtherUsersToSendMessages: boolean };
    };
  };
};

export type UserSettingsQueryVariables = Exact<{
  userID: Scalars['UUID'];
}>;

export type UserSettingsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          settings: {
            __typename?: 'UserSettings';
            communication: { __typename?: 'UserSettingsCommunication'; allowOtherUsersToSendMessages: boolean };
            privacy: { __typename?: 'UserSettingsPrivacy'; contributionRolesPubliclyVisible: boolean };
          };
        }
      | undefined;
  };
};

export type VirtualContributorQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type VirtualContributorQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    virtualContributor?:
      | {
          __typename?: 'VirtualContributor';
          id: string;
          searchVisibility: SearchVisibility;
          listedInStore: boolean;
          status: VirtualContributorStatus;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          settings: {
            __typename?: 'VirtualContributorSettings';
            privacy: { __typename?: 'VirtualContributorSettingsPrivacy'; knowledgeBaseContentVisible: boolean };
          };
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?:
                    | {
                        __typename?: 'Visual';
                        id: string;
                        uri: string;
                        name: string;
                        allowedTypes: Array<string>;
                        aspectRatio: number;
                        maxHeight: number;
                        maxWidth: number;
                        minHeight: number;
                        minWidth: number;
                        alternativeText?: string | undefined;
                      }
                    | undefined;
                  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?:
                    | {
                        __typename?: 'Visual';
                        id: string;
                        uri: string;
                        name: string;
                        allowedTypes: Array<string>;
                        aspectRatio: number;
                        maxHeight: number;
                        maxWidth: number;
                        minHeight: number;
                        minWidth: number;
                        alternativeText?: string | undefined;
                      }
                    | undefined;
                  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?:
                    | {
                        __typename?: 'Visual';
                        id: string;
                        uri: string;
                        name: string;
                        allowedTypes: Array<string>;
                        aspectRatio: number;
                        maxHeight: number;
                        maxWidth: number;
                        minHeight: number;
                        minWidth: number;
                        alternativeText?: string | undefined;
                      }
                    | undefined;
                  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                };
              };
          aiPersona?:
            | {
                __typename?: 'AiPersona';
                id: string;
                bodyOfKnowledgeID?: string | undefined;
                bodyOfKnowledgeType?: AiPersonaBodyOfKnowledgeType | undefined;
                bodyOfKnowledge?: string | undefined;
                engine: AiPersonaEngine;
              }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagline?: string | undefined;
            url: string;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type VirtualContributorProfileQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type VirtualContributorProfileQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    virtualContributor?:
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            url: string;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type BodyOfKnowledgeProfileQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type BodyOfKnowledgeProfileQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
        }
      | undefined;
  };
};

export type UpdateVirtualContributorMutationVariables = Exact<{
  virtualContributorData: UpdateVirtualContributorInput;
}>;

export type UpdateVirtualContributorMutation = {
  __typename?: 'Mutation';
  updateVirtualContributor: {
    __typename?: 'VirtualContributor';
    id: string;
    listedInStore: boolean;
    status: VirtualContributorStatus;
    searchVisibility: SearchVisibility;
    settings: {
      __typename?: 'VirtualContributorSettings';
      privacy: { __typename?: 'VirtualContributorSettingsPrivacy'; knowledgeBaseContentVisible: boolean };
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline?: string | undefined;
      displayName: string;
      description?: string | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
  };
};

export type UpdateVirtualContributorSettingsMutationVariables = Exact<{
  settingsData: UpdateVirtualContributorSettingsInput;
}>;

export type UpdateVirtualContributorSettingsMutation = {
  __typename?: 'Mutation';
  updateVirtualContributorSettings: {
    __typename?: 'VirtualContributor';
    id: string;
    listedInStore: boolean;
    status: VirtualContributorStatus;
    searchVisibility: SearchVisibility;
    settings: {
      __typename?: 'VirtualContributorSettings';
      privacy: { __typename?: 'VirtualContributorSettingsPrivacy'; knowledgeBaseContentVisible: boolean };
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline?: string | undefined;
      displayName: string;
      description?: string | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
  };
};

export type RefreshBodyOfKnowledgeMutationVariables = Exact<{
  refreshData: RefreshVirtualContributorBodyOfKnowledgeInput;
}>;

export type RefreshBodyOfKnowledgeMutation = {
  __typename?: 'Mutation';
  refreshVirtualContributorBodyOfKnowledge: boolean;
};

export type VirtualContributorKnowledgeBaseQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type VirtualContributorKnowledgeBaseQuery = {
  __typename?: 'Query';
  virtualContributor: {
    __typename?: 'VirtualContributor';
    id: string;
    knowledgeBase?:
      | {
          __typename?: 'KnowledgeBase';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          calloutsSet: { __typename?: 'CalloutsSet'; id: string };
        }
      | undefined;
  };
};

export type VirtualContributorKnowledgePrivilegesQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;

export type VirtualContributorKnowledgePrivilegesQuery = {
  __typename?: 'Query';
  virtualContributor: {
    __typename?: 'VirtualContributor';
    id: string;
    knowledgeBase?:
      | {
          __typename?: 'KnowledgeBase';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type VcMembershipsQueryVariables = Exact<{
  virtualContributorId: Scalars['UUID'];
}>;

export type VcMembershipsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    virtualContributor?:
      | {
          __typename?: 'VirtualContributor';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
  rolesVirtualContributor: {
    __typename?: 'ContributorRoles';
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; level: SpaceLevel }>;
    }>;
  };
  me: {
    __typename?: 'MeQueryResults';
    id: string;
    communityInvitations: Array<{
      __typename?: 'CommunityInvitationResult';
      id: string;
      spacePendingMembershipInfo: {
        __typename?: 'SpacePendingMembershipInfo';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            url: string;
          };
        };
      };
      invitation: {
        __typename?: 'Invitation';
        id: string;
        welcomeMessage?: string | undefined;
        state: string;
        createdDate: Date;
        contributorType: RoleSetContributorType;
        createdBy: { __typename?: 'User'; id: string };
        contributor:
          | { __typename?: 'Organization'; id: string }
          | { __typename?: 'User'; id: string }
          | { __typename?: 'VirtualContributor'; id: string };
      };
    }>;
  };
};

export type VirtualContributorUpdatesSubscriptionVariables = Exact<{
  virtualContributorID: Scalars['UUID'];
}>;

export type VirtualContributorUpdatesSubscription = {
  __typename?: 'Subscription';
  virtualContributorUpdated: {
    __typename?: 'VirtualContributorUpdatedSubscriptionResult';
    virtualContributor: { __typename?: 'VirtualContributor'; id: string; status: VirtualContributorStatus };
  };
};

export type DashboardSpacesQueryVariables = Exact<{
  visibilities?: InputMaybe<Array<SpaceVisibility> | SpaceVisibility>;
}>;

export type DashboardSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    visibility: SpaceVisibility;
    about: {
      __typename?: 'SpaceAbout';
      why?: string | undefined;
      isContentPublic: boolean;
      id: string;
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
      membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      };
    };
  }>;
};

export type AdminInnovationHubsListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminInnovationHubsListQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      innovationHubs: Array<{
        __typename?: 'InnovationHub';
        id: string;
        subdomain: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
      }>;
    };
  };
};

export type DeleteInnovationHubMutationVariables = Exact<{
  innovationHubId: Scalars['UUID'];
}>;

export type DeleteInnovationHubMutation = {
  __typename?: 'Mutation';
  deleteInnovationHub: { __typename?: 'InnovationHub'; id: string };
};

export type CreateInnovationHubMutationVariables = Exact<{
  hubData: CreateInnovationHubOnAccountInput;
}>;

export type CreateInnovationHubMutation = {
  __typename?: 'Mutation';
  createInnovationHub: {
    __typename?: 'InnovationHub';
    id: string;
    subdomain: string;
    spaceVisibilityFilter?: SpaceVisibility | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline?: string | undefined;
      url: string;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
    spaceListFilter?:
      | Array<{
          __typename?: 'Space';
          id: string;
          visibility: SpaceVisibility;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            provider:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              url: string;
            };
          };
        }>
      | undefined;
  };
};

export type UpdateInnovationHubMutationVariables = Exact<{
  hubData: UpdateInnovationHubInput;
}>;

export type UpdateInnovationHubMutation = {
  __typename?: 'Mutation';
  updateInnovationHub: {
    __typename?: 'InnovationHub';
    id: string;
    subdomain: string;
    spaceVisibilityFilter?: SpaceVisibility | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline?: string | undefined;
      url: string;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
    spaceListFilter?:
      | Array<{
          __typename?: 'Space';
          id: string;
          visibility: SpaceVisibility;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            provider:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              url: string;
            };
          };
        }>
      | undefined;
  };
};

export type InnovationHubAvailableSpacesQueryVariables = Exact<{ [key: string]: never }>;

export type InnovationHubAvailableSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    visibility: SpaceVisibility;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      provider:
        | {
            __typename?: 'Organization';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }
        | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
        | {
            __typename?: 'VirtualContributor';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
      profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined; url: string };
    };
  }>;
};

export type InnovationHubSpaceFragment = {
  __typename?: 'Space';
  id: string;
  visibility: SpaceVisibility;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    provider:
      | {
          __typename?: 'Organization';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }
      | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined; url: string };
  };
};

export type InnovationHubProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  tagline?: string | undefined;
  url: string;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
  visual?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }
    | undefined;
};

export type InnovationHubSettingsQueryVariables = Exact<{
  innovationHubId: Scalars['UUID'];
}>;

export type InnovationHubSettingsQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          id: string;
          subdomain: string;
          spaceVisibilityFilter?: SpaceVisibility | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagline?: string | undefined;
            url: string;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
          };
          spaceListFilter?:
            | Array<{
                __typename?: 'Space';
                id: string;
                visibility: SpaceVisibility;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  provider:
                    | {
                        __typename?: 'Organization';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | {
                        __typename?: 'VirtualContributor';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      };
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    tagline?: string | undefined;
                    url: string;
                  };
                };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type InnovationHubSettingsFragment = {
  __typename?: 'InnovationHub';
  id: string;
  subdomain: string;
  spaceVisibilityFilter?: SpaceVisibility | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline?: string | undefined;
    url: string;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
  spaceListFilter?:
    | Array<{
        __typename?: 'Space';
        id: string;
        visibility: SpaceVisibility;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              };
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            url: string;
          };
        };
      }>
    | undefined;
};

export type InnovationHubQueryVariables = Exact<{
  subdomain?: InputMaybe<Scalars['String']>;
}>;

export type InnovationHubQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline?: string | undefined;
            description?: string | undefined;
            banner?:
              | { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined }
              | undefined;
          };
        }
      | undefined;
  };
};

export type InnovationHubHomeInnovationHubFragment = {
  __typename?: 'InnovationHub';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    tagline?: string | undefined;
    description?: string | undefined;
    banner?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
  };
};

export type ChildJourneyPageBannerQueryVariables = Exact<{
  level0Space: Scalars['UUID'];
  spaceId: Scalars['UUID'];
}>;

export type ChildJourneyPageBannerQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    level0Space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              banner?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
        }
      | undefined;
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              tagline?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            };
          };
          community: {
            __typename?: 'Community';
            id: string;
            roleSet: { __typename?: 'RoleSet'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
          };
        }
      | undefined;
  };
};

export type JourneyBreadcrumbsInnovationHubQueryVariables = Exact<{ [key: string]: never }>;

export type JourneyBreadcrumbsInnovationHubQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
        }
      | undefined;
  };
};

export type JourneyBreadcrumbsSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
  subspaceL1Id?: InputMaybe<Scalars['UUID']>;
  subspaceL2Id?: InputMaybe<Scalars['UUID']>;
  includeSubspaceL1?: InputMaybe<Scalars['Boolean']>;
  includeSubspaceL2?: InputMaybe<Scalars['Boolean']>;
}>;

export type JourneyBreadcrumbsSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | undefined;
    subspaceL1?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | undefined;
    subspaceL2?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | undefined;
  };
};

export type JourneyBreadcrumbsSpaceFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type JourneyBreadcrumbsSubpaceFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type SpacePrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpacePrivilegesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceCardFragment = {
  __typename?: 'Space';
  id: string;
  visibility: SpaceVisibility;
  about: {
    __typename?: 'SpaceAbout';
    why?: string | undefined;
    isContentPublic: boolean;
    id: string;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
  };
};

export type SpaceTemplatesManagerQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceTemplatesManagerQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          templatesManager?:
            | {
                __typename?: 'TemplatesManager';
                id: string;
                templatesSet?:
                  | {
                      __typename?: 'TemplatesSet';
                      id: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceSubspaceCardsQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceSubspaceCardsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              isContentPublic: boolean;
              why?: string | undefined;
              id: string;
              metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              };
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              };
            };
          }>;
        }
      | undefined;
  };
};

export type CreateSpaceMutationVariables = Exact<{
  spaceData: CreateSpaceOnAccountInput;
}>;

export type CreateSpaceMutation = {
  __typename?: 'Mutation';
  createSpace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
};

export type PlansTableQueryVariables = Exact<{ [key: string]: never }>;

export type PlansTableQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    licensingFramework: {
      __typename?: 'Licensing';
      id: string;
      plans: Array<{
        __typename?: 'LicensePlan';
        id: string;
        name: string;
        enabled: boolean;
        sortOrder: number;
        pricePerMonth?: number | undefined;
        isFree: boolean;
        trialEnabled: boolean;
        requiresPaymentMethod: boolean;
        requiresContactSupport: boolean;
        type: LicensingCredentialBasedPlanType;
      }>;
    };
  };
};

export type AccountPlanAvailabilityQueryVariables = Exact<{
  accountId: Scalars['UUID'];
}>;

export type AccountPlanAvailabilityQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    account?:
      | {
          __typename?: 'Account';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          license: {
            __typename?: 'License';
            id: string;
            availableEntitlements?: Array<LicenseEntitlementType> | undefined;
          };
        }
      | undefined;
  };
};

export type ContactSupportLocationQueryVariables = Exact<{ [key: string]: never }>;

export type ContactSupportLocationQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    configuration: { __typename?: 'Config'; locations: { __typename?: 'PlatformLocations'; contactsupport: string } };
  };
};

export type SubspaceCardFragment = {
  __typename?: 'Space';
  id: string;
  about: {
    __typename?: 'SpaceAbout';
    isContentPublic: boolean;
    why?: string | undefined;
    id: string;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    membership: {
      __typename?: 'SpaceAboutMembership';
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
  };
};

export type SubspacesOnSpaceFragment = {
  __typename?: 'Space';
  id: string;
  subspaces: Array<{
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      isContentPublic: boolean;
      why?: string | undefined;
      id: string;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      };
    };
  }>;
};

export type DeleteSpaceMutationVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type DeleteSpaceMutation = { __typename?: 'Mutation'; deleteSpace: { __typename?: 'Space'; id: string } };

export type UpdateSpaceMutationVariables = Exact<{
  input: UpdateSpaceInput;
}>;

export type UpdateSpaceMutation = {
  __typename?: 'Mutation';
  updateSpace: {
    __typename?: 'Space';
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      who?: string | undefined;
      why?: string | undefined;
      isContentPublic: boolean;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        visuals: Array<{
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }>;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
        location?:
          | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
          | undefined;
      };
    };
  };
};

export type SpaceInfoFragment = {
  __typename?: 'Space';
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    who?: string | undefined;
    why?: string | undefined;
    isContentPublic: boolean;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline?: string | undefined;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visuals: Array<{
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }>;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      location?:
        | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
        | undefined;
    };
  };
};

export type SpaceAndCommunityPrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceAndCommunityPrivilegesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          community: {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
        }
      | undefined;
  };
};

export type SpaceApplicationTemplateQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceApplicationTemplateQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          community: {
            __typename?: 'Community';
            id: string;
            roleSet: {
              __typename?: 'RoleSet';
              id: string;
              applicationForm: {
                __typename?: 'Form';
                id: string;
                description?: string | undefined;
                questions: Array<{
                  __typename?: 'FormQuestion';
                  required: boolean;
                  question: string;
                  sortOrder: number;
                  explanation: string;
                  maxLength: number;
                }>;
              };
            };
          };
        }
      | undefined;
  };
};

export type SubspacesInSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SubspacesInSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              };
            };
          }>;
        }
      | undefined;
  };
};

export type SubspaceCreatedSubscriptionVariables = Exact<{
  subspaceId: Scalars['UUID'];
}>;

export type SubspaceCreatedSubscription = {
  __typename?: 'Subscription';
  subspaceCreated: {
    __typename?: 'SubspaceCreated';
    subspace: {
      __typename?: 'Space';
      id: string;
      visibility: SpaceVisibility;
      about: {
        __typename?: 'SpaceAbout';
        why?: string | undefined;
        isContentPublic: boolean;
        id: string;
        metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
        membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          tagline?: string | undefined;
          cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        };
      };
    };
  };
};

export type BannerInnovationHubQueryVariables = Exact<{
  subdomain?: InputMaybe<Scalars['String']>;
}>;

export type BannerInnovationHubQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
          spaceListFilter?: Array<{ __typename?: 'Space'; id: string }> | undefined;
        }
      | undefined;
  };
};

export type SpaceTabsQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type SpaceTabsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
          };
        }
      | undefined;
  };
};

export type AdminSpaceSubspacesPageQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type AdminSpaceSubspacesPageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
          }>;
          templatesManager?:
            | {
                __typename?: 'TemplatesManager';
                id: string;
                templatesSet?: { __typename?: 'TemplatesSet'; id: string } | undefined;
                templateDefaults: Array<{
                  __typename?: 'TemplateDefault';
                  id: string;
                  type: TemplateDefaultType;
                  template?:
                    | {
                        __typename?: 'Template';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          description?: string | undefined;
                          tagsets?:
                            | Array<{
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }>
                            | undefined;
                          references?:
                            | Array<{
                                __typename?: 'Reference';
                                id: string;
                                name: string;
                                description?: string | undefined;
                                uri: string;
                              }>
                            | undefined;
                          bannerNarrow?:
                            | {
                                __typename?: 'Visual';
                                id: string;
                                uri: string;
                                name: string;
                                allowedTypes: Array<string>;
                                aspectRatio: number;
                                maxHeight: number;
                                maxWidth: number;
                                minHeight: number;
                                minWidth: number;
                                alternativeText?: string | undefined;
                              }
                            | undefined;
                        };
                        collaboration?:
                          | {
                              __typename?: 'Collaboration';
                              id: string;
                              calloutsSet: {
                                __typename?: 'CalloutsSet';
                                id: string;
                                callouts: Array<{
                                  __typename?: 'Callout';
                                  id: string;
                                  type: CalloutType;
                                  sortOrder: number;
                                  classification?:
                                    | {
                                        __typename?: 'Classification';
                                        id: string;
                                        flowState?:
                                          | {
                                              __typename?: 'Tagset';
                                              id: string;
                                              name: string;
                                              tags: Array<string>;
                                              allowedValues: Array<string>;
                                              type: TagsetType;
                                            }
                                          | undefined;
                                      }
                                    | undefined;
                                  framing: {
                                    __typename?: 'CalloutFraming';
                                    id: string;
                                    profile: {
                                      __typename?: 'Profile';
                                      id: string;
                                      displayName: string;
                                      description?: string | undefined;
                                    };
                                  };
                                }>;
                              };
                              innovationFlow: {
                                __typename?: 'InnovationFlow';
                                id: string;
                                profile: { __typename?: 'Profile'; id: string; displayName: string };
                                states: Array<{
                                  __typename?: 'InnovationFlowState';
                                  displayName: string;
                                  description: string;
                                }>;
                              };
                            }
                          | undefined;
                      }
                    | undefined;
                }>;
              }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceAccountQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceAccountQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          visibility: SpaceVisibility;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            provider:
              | {
                  __typename: 'Organization';
                  id: string;
                  authorization?:
                    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                    | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename: 'User';
                  id: string;
                  authorization?:
                    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                    | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename: 'VirtualContributor';
                  id: string;
                  authorization?:
                    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                    | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                      | undefined;
                  };
                };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
          activeSubscription?:
            | {
                __typename?: 'SpaceSubscription';
                name: LicensingCredentialBasedCredentialType;
                expires?: Date | undefined;
              }
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
  platform: {
    __typename?: 'Platform';
    id: string;
    licensingFramework: {
      __typename?: 'Licensing';
      id: string;
      plans: Array<{
        __typename?: 'LicensePlan';
        id: string;
        name: string;
        enabled: boolean;
        type: LicensingCredentialBasedPlanType;
        sortOrder: number;
        isFree: boolean;
        pricePerMonth?: number | undefined;
        licenseCredential: LicensingCredentialBasedCredentialType;
      }>;
    };
    configuration: {
      __typename?: 'Config';
      locations: { __typename?: 'PlatformLocations'; support: string; switchplan: string };
    };
  };
};

export type SpaceSettingsQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceSettingsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            provider:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                };
            membership: {
              __typename?: 'SpaceAboutMembership';
              roleSetID?: string | undefined;
              communityID?: string | undefined;
            };
          };
          settings: {
            __typename?: 'SpaceSettings';
            privacy: {
              __typename?: 'SpaceSettingsPrivacy';
              mode: SpacePrivacyMode;
              allowPlatformSupportAsAdmin: boolean;
            };
            membership: {
              __typename?: 'SpaceSettingsMembership';
              policy: CommunityMembershipPolicy;
              trustedOrganizations: Array<string>;
              allowSubspaceAdminsToInviteMembers: boolean;
            };
            collaboration: {
              __typename?: 'SpaceSettingsCollaboration';
              allowMembersToCreateCallouts: boolean;
              allowMembersToCreateSubspaces: boolean;
              inheritMembershipRights: boolean;
              allowEventsFromSubspaces: boolean;
            };
          };
          collaboration: { __typename?: 'Collaboration'; id: string };
        }
      | undefined;
  };
};

export type SpaceSettingsFragment = {
  __typename?: 'SpaceSettings';
  privacy: { __typename?: 'SpaceSettingsPrivacy'; mode: SpacePrivacyMode; allowPlatformSupportAsAdmin: boolean };
  membership: {
    __typename?: 'SpaceSettingsMembership';
    policy: CommunityMembershipPolicy;
    trustedOrganizations: Array<string>;
    allowSubspaceAdminsToInviteMembers: boolean;
  };
  collaboration: {
    __typename?: 'SpaceSettingsCollaboration';
    allowMembersToCreateCallouts: boolean;
    allowMembersToCreateSubspaces: boolean;
    inheritMembershipRights: boolean;
    allowEventsFromSubspaces: boolean;
  };
};

export type SpaceSubspacesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceSubspacesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined };
          };
          account: {
            __typename?: 'Account';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            virtualContributors: Array<{
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                tagline?: string | undefined;
                url: string;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                avatar?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
              };
            }>;
          };
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
          }>;
        }
      | undefined;
  };
};

export type UpdateSpaceSettingsMutationVariables = Exact<{
  settingsData: UpdateSpaceSettingsInput;
}>;

export type UpdateSpaceSettingsMutation = {
  __typename?: 'Mutation';
  updateSpaceSettings: {
    __typename?: 'Space';
    id: string;
    settings: {
      __typename?: 'SpaceSettings';
      privacy: { __typename?: 'SpaceSettingsPrivacy'; mode: SpacePrivacyMode; allowPlatformSupportAsAdmin: boolean };
      membership: {
        __typename?: 'SpaceSettingsMembership';
        policy: CommunityMembershipPolicy;
        trustedOrganizations: Array<string>;
        allowSubspaceAdminsToInviteMembers: boolean;
      };
      collaboration: {
        __typename?: 'SpaceSettingsCollaboration';
        allowMembersToCreateCallouts: boolean;
        allowMembersToCreateSubspaces: boolean;
        inheritMembershipRights: boolean;
        allowEventsFromSubspaces: boolean;
      };
    };
  };
};

export type CreateVirtualContributorOnAccountMutationVariables = Exact<{
  virtualContributorData: CreateVirtualContributorOnAccountInput;
}>;

export type CreateVirtualContributorOnAccountMutation = {
  __typename?: 'Mutation';
  createVirtualContributor: {
    __typename?: 'VirtualContributor';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      avatar?: { __typename?: 'Visual'; id: string } | undefined;
    };
    knowledgeBase?:
      | {
          __typename?: 'KnowledgeBase';
          id: string;
          calloutsSet: {
            __typename?: 'CalloutsSet';
            id: string;
            callouts: Array<{
              __typename?: 'Callout';
              id: string;
              framing: {
                __typename?: 'CalloutFraming';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              };
            }>;
          };
        }
      | undefined;
  };
};

export type DeleteVirtualContributorOnAccountMutationVariables = Exact<{
  virtualContributorData: DeleteVirtualContributorInput;
}>;

export type DeleteVirtualContributorOnAccountMutation = {
  __typename?: 'Mutation';
  deleteVirtualContributor: { __typename?: 'VirtualContributor'; id: string };
};

export type SpaceDashboardNavigationSubspacesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceDashboardNavigationSubspacesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            };
          };
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
              };
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            community: {
              __typename?: 'Community';
              id: string;
              roleSet: {
                __typename?: 'RoleSet';
                id: string;
                myMembershipStatus?: CommunityMembershipStatus | undefined;
                myRoles: Array<RoleName>;
              };
            };
          }>;
        }
      | undefined;
  };
};

export type SpaceDashboardNavigationOpportunitiesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
  challengeIds: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type SpaceDashboardNavigationOpportunitiesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            subspaces: Array<{
              __typename?: 'Space';
              id: string;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
              community: {
                __typename?: 'Community';
                id: string;
                roleSet: {
                  __typename?: 'RoleSet';
                  id: string;
                  myMembershipStatus?: CommunityMembershipStatus | undefined;
                  myRoles: Array<RoleName>;
                };
              };
            }>;
          }>;
        }
      | undefined;
  };
};

export type PlatformLevelAuthorizationQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformLevelAuthorizationQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    roleSet: { __typename?: 'RoleSet'; id: string; myRoles: Array<RoleName> };
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type PlatformRoleSetQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformRoleSetQuery = {
  __typename?: 'Query';
  platform: { __typename?: 'Platform'; roleSet: { __typename?: 'RoleSet'; id: string } };
};

export type AssignLicensePlanToAccountMutationVariables = Exact<{
  licensePlanId: Scalars['UUID'];
  accountId: Scalars['UUID'];
  licensingId: Scalars['UUID'];
}>;

export type AssignLicensePlanToAccountMutation = {
  __typename?: 'Mutation';
  assignLicensePlanToAccount: { __typename?: 'Account'; id: string };
};

export type RevokeLicensePlanFromAccountMutationVariables = Exact<{
  licensePlanId: Scalars['UUID'];
  accountId: Scalars['UUID'];
  licensingId: Scalars['UUID'];
}>;

export type RevokeLicensePlanFromAccountMutation = {
  __typename?: 'Mutation';
  revokeLicensePlanFromAccount: { __typename?: 'Account'; id: string };
};

export type AdminGlobalOrganizationsListQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type AdminGlobalOrganizationsListQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      account?:
        | {
            __typename?: 'Account';
            id: string;
            subscriptions: Array<{ __typename?: 'AccountSubscription'; name: LicensingCredentialBasedCredentialType }>;
          }
        | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; state: string };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type AdminOrganizationVerifyMutationVariables = Exact<{
  input: OrganizationVerificationEventInput;
}>;

export type AdminOrganizationVerifyMutation = {
  __typename?: 'Mutation';
  eventOnOrganizationVerification: {
    __typename?: 'OrganizationVerification';
    id: string;
    nextEvents: Array<string>;
    state: string;
  };
};

export type AssignLicensePlanToSpaceMutationVariables = Exact<{
  licensePlanId: Scalars['UUID'];
  spaceId: Scalars['UUID'];
}>;

export type AssignLicensePlanToSpaceMutation = {
  __typename?: 'Mutation';
  assignLicensePlanToSpace: {
    __typename?: 'Space';
    id: string;
    subscriptions: Array<{ __typename?: 'SpaceSubscription'; name: LicensingCredentialBasedCredentialType }>;
  };
};

export type RevokeLicensePlanFromSpaceMutationVariables = Exact<{
  licensePlanId: Scalars['UUID'];
  spaceId: Scalars['UUID'];
}>;

export type RevokeLicensePlanFromSpaceMutation = {
  __typename?: 'Mutation';
  revokeLicensePlanFromSpace: {
    __typename?: 'Space';
    id: string;
    subscriptions: Array<{ __typename?: 'SpaceSubscription'; name: LicensingCredentialBasedCredentialType }>;
  };
};

export type UpdateSpacePlatformSettingsMutationVariables = Exact<{
  spaceId: Scalars['UUID'];
  nameId: Scalars['NameID'];
  visibility: SpaceVisibility;
}>;

export type UpdateSpacePlatformSettingsMutation = {
  __typename?: 'Mutation';
  updateSpacePlatformSettings: { __typename?: 'Space'; id: string; nameID: string; visibility: SpaceVisibility };
};

export type AdminSpacesListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminSpacesListQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    subscriptions: Array<{ __typename?: 'SpaceSubscription'; name: LicensingCredentialBasedCredentialType }>;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      provider:
        | {
            __typename?: 'Organization';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }
        | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
        | {
            __typename?: 'VirtualContributor';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  }>;
};

export type AdminSpaceFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  visibility: SpaceVisibility;
  subscriptions: Array<{ __typename?: 'SpaceSubscription'; name: LicensingCredentialBasedCredentialType }>;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    isContentPublic: boolean;
    provider:
      | {
          __typename?: 'Organization';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }
      | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      description?: string | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    membership: {
      __typename?: 'SpaceAboutMembership';
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
    };
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type SpaceStorageAdminPageQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceStorageAdminPageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined };
          };
          storageAggregator: {
            __typename?: 'StorageAggregator';
            id: string;
            parentEntity?:
              | {
                  __typename?: 'StorageAggregatorParent';
                  id: string;
                  level?: SpaceLevel | undefined;
                  displayName: string;
                  url: string;
                }
              | undefined;
            storageAggregators: Array<{
              __typename?: 'StorageAggregator';
              id: string;
              parentEntity?:
                | {
                    __typename?: 'StorageAggregatorParent';
                    id: string;
                    level?: SpaceLevel | undefined;
                    displayName: string;
                    url: string;
                  }
                | undefined;
            }>;
            storageBuckets: Array<{
              __typename?: 'StorageBucket';
              id: string;
              size: number;
              documents: Array<{
                __typename?: 'Document';
                id: string;
                displayName: string;
                size: number;
                mimeType: MimeType;
                uploadedDate: Date;
                url: string;
                createdBy?:
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
                    }
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              }>;
              parentEntity?:
                | {
                    __typename?: 'StorageBucketParent';
                    id: string;
                    type: ProfileType;
                    displayName: string;
                    url: string;
                  }
                | undefined;
            }>;
            directStorageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              size: number;
              documents: Array<{
                __typename?: 'Document';
                id: string;
                displayName: string;
                size: number;
                mimeType: MimeType;
                uploadedDate: Date;
                url: string;
                createdBy?:
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
                    }
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              }>;
              parentEntity?:
                | {
                    __typename?: 'StorageBucketParent';
                    id: string;
                    type: ProfileType;
                    displayName: string;
                    url: string;
                  }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type StorageAggregatorLookupQueryVariables = Exact<{
  storageAggregatorId: Scalars['UUID'];
}>;

export type StorageAggregatorLookupQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    storageAggregator?:
      | {
          __typename?: 'StorageAggregator';
          id: string;
          parentEntity?:
            | {
                __typename?: 'StorageAggregatorParent';
                id: string;
                level?: SpaceLevel | undefined;
                displayName: string;
                url: string;
              }
            | undefined;
          storageAggregators: Array<{
            __typename?: 'StorageAggregator';
            id: string;
            parentEntity?:
              | {
                  __typename?: 'StorageAggregatorParent';
                  id: string;
                  level?: SpaceLevel | undefined;
                  displayName: string;
                  url: string;
                }
              | undefined;
          }>;
          storageBuckets: Array<{
            __typename?: 'StorageBucket';
            id: string;
            size: number;
            documents: Array<{
              __typename?: 'Document';
              id: string;
              displayName: string;
              size: number;
              mimeType: MimeType;
              uploadedDate: Date;
              url: string;
              createdBy?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
                  }
                | undefined;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }>;
            parentEntity?:
              | { __typename?: 'StorageBucketParent'; id: string; type: ProfileType; displayName: string; url: string }
              | undefined;
          }>;
          directStorageBucket: {
            __typename?: 'StorageBucket';
            id: string;
            size: number;
            documents: Array<{
              __typename?: 'Document';
              id: string;
              displayName: string;
              size: number;
              mimeType: MimeType;
              uploadedDate: Date;
              url: string;
              createdBy?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
                  }
                | undefined;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }>;
            parentEntity?:
              | { __typename?: 'StorageBucketParent'; id: string; type: ProfileType; displayName: string; url: string }
              | undefined;
          };
        }
      | undefined;
  };
};

export type StorageAggregatorFragment = {
  __typename?: 'StorageAggregator';
  id: string;
  parentEntity?:
    | {
        __typename?: 'StorageAggregatorParent';
        id: string;
        level?: SpaceLevel | undefined;
        displayName: string;
        url: string;
      }
    | undefined;
  storageAggregators: Array<{
    __typename?: 'StorageAggregator';
    id: string;
    parentEntity?:
      | {
          __typename?: 'StorageAggregatorParent';
          id: string;
          level?: SpaceLevel | undefined;
          displayName: string;
          url: string;
        }
      | undefined;
  }>;
  storageBuckets: Array<{
    __typename?: 'StorageBucket';
    id: string;
    size: number;
    documents: Array<{
      __typename?: 'Document';
      id: string;
      displayName: string;
      size: number;
      mimeType: MimeType;
      uploadedDate: Date;
      url: string;
      createdBy?:
        | {
            __typename?: 'User';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          }
        | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    }>;
    parentEntity?:
      | { __typename?: 'StorageBucketParent'; id: string; type: ProfileType; displayName: string; url: string }
      | undefined;
  }>;
  directStorageBucket: {
    __typename?: 'StorageBucket';
    id: string;
    size: number;
    documents: Array<{
      __typename?: 'Document';
      id: string;
      displayName: string;
      size: number;
      mimeType: MimeType;
      uploadedDate: Date;
      url: string;
      createdBy?:
        | {
            __typename?: 'User';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          }
        | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    }>;
    parentEntity?:
      | { __typename?: 'StorageBucketParent'; id: string; type: ProfileType; displayName: string; url: string }
      | undefined;
  };
};

export type LoadableStorageAggregatorFragment = {
  __typename?: 'StorageAggregator';
  id: string;
  parentEntity?:
    | {
        __typename?: 'StorageAggregatorParent';
        id: string;
        level?: SpaceLevel | undefined;
        displayName: string;
        url: string;
      }
    | undefined;
};

export type StorageBucketFragment = {
  __typename?: 'StorageBucket';
  id: string;
  size: number;
  documents: Array<{
    __typename?: 'Document';
    id: string;
    displayName: string;
    size: number;
    mimeType: MimeType;
    uploadedDate: Date;
    url: string;
    createdBy?:
      | {
          __typename?: 'User';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        }
      | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  }>;
  parentEntity?:
    | { __typename?: 'StorageBucketParent'; id: string; type: ProfileType; displayName: string; url: string }
    | undefined;
};

export type StorageBucketParentFragment = {
  __typename?: 'StorageBucketParent';
  id: string;
  type: ProfileType;
  displayName: string;
  url: string;
};

export type StorageAggregatorParentFragment = {
  __typename?: 'StorageAggregatorParent';
  id: string;
  level?: SpaceLevel | undefined;
  displayName: string;
  url: string;
};

export type DocumentDataFragment = {
  __typename?: 'Document';
  id: string;
  displayName: string;
  size: number;
  mimeType: MimeType;
  uploadedDate: Date;
  url: string;
  createdBy?:
    | {
        __typename?: 'User';
        id: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
      }
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type DeleteDocumentMutationVariables = Exact<{
  documentId: Scalars['UUID'];
}>;

export type DeleteDocumentMutation = {
  __typename?: 'Mutation';
  deleteDocument: { __typename?: 'Document'; id: string };
};

export type UserListQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type UserListQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      email: string;
      account?:
        | {
            __typename?: 'Account';
            id: string;
            subscriptions: Array<{ __typename?: 'AccountSubscription'; name: LicensingCredentialBasedCredentialType }>;
          }
        | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type AdminVirtualContributorsQueryVariables = Exact<{ [key: string]: never }>;

export type AdminVirtualContributorsQuery = {
  __typename?: 'Query';
  virtualContributors: Array<{
    __typename?: 'VirtualContributor';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
};

export type ConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type ConfigurationQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    configuration: {
      __typename?: 'Config';
      authentication: {
        __typename?: 'AuthenticationConfig';
        providers: Array<{
          __typename?: 'AuthenticationProviderConfig';
          name: string;
          label: string;
          icon: string;
          enabled: boolean;
          config: { __typename: 'OryConfig'; kratosPublicBaseURL: string; issuer: string };
        }>;
      };
      locations: {
        __typename?: 'PlatformLocations';
        environment: string;
        domain: string;
        landing: string;
        about: string;
        blog: string;
        feedback: string;
        forumreleases: string;
        privacy: string;
        security: string;
        support: string;
        terms: string;
        impact: string;
        foundation: string;
        opensource: string;
        inspiration: string;
        innovationLibrary: string;
        releases: string;
        help: string;
        community: string;
        newuser: string;
        tips: string;
        aup: string;
        documentation: string;
      };
      featureFlags: Array<{ __typename?: 'PlatformFeatureFlag'; enabled: boolean; name: PlatformFeatureFlagName }>;
      sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean; environment: string };
      apm: { __typename?: 'APM'; rumEnabled: boolean; endpoint: string };
      geo: { __typename?: 'Geo'; endpoint: string };
    };
    settings: {
      __typename?: 'PlatformSettings';
      integration: { __typename?: 'PlatformIntegrationSettings'; iframeAllowedUrls: Array<string> };
    };
    metadata: {
      __typename?: 'Metadata';
      services: Array<{ __typename?: 'ServiceMetadata'; name?: string | undefined; version?: string | undefined }>;
    };
  };
};

export type ConfigurationFragment = {
  __typename?: 'Config';
  authentication: {
    __typename?: 'AuthenticationConfig';
    providers: Array<{
      __typename?: 'AuthenticationProviderConfig';
      name: string;
      label: string;
      icon: string;
      enabled: boolean;
      config: { __typename: 'OryConfig'; kratosPublicBaseURL: string; issuer: string };
    }>;
  };
  locations: {
    __typename?: 'PlatformLocations';
    environment: string;
    domain: string;
    landing: string;
    about: string;
    blog: string;
    feedback: string;
    forumreleases: string;
    privacy: string;
    security: string;
    support: string;
    terms: string;
    impact: string;
    foundation: string;
    opensource: string;
    inspiration: string;
    innovationLibrary: string;
    releases: string;
    help: string;
    community: string;
    newuser: string;
    tips: string;
    aup: string;
    documentation: string;
  };
  featureFlags: Array<{ __typename?: 'PlatformFeatureFlag'; enabled: boolean; name: PlatformFeatureFlagName }>;
  sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean; environment: string };
  apm: { __typename?: 'APM'; rumEnabled: boolean; endpoint: string };
  geo: { __typename?: 'Geo'; endpoint: string };
};

export type PlatformLicensingPlansQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformLicensingPlansQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    licensingFramework: {
      __typename?: 'Licensing';
      id: string;
      plans: Array<{
        __typename?: 'LicensePlan';
        id: string;
        type: LicensingCredentialBasedPlanType;
        name: string;
        licenseCredential: LicensingCredentialBasedCredentialType;
      }>;
    };
  };
};

export type ShareLinkWithUserMutationVariables = Exact<{
  messageData: CommunicationSendMessageToUserInput;
}>;

export type ShareLinkWithUserMutation = { __typename?: 'Mutation'; sendMessageToUser: boolean };

export type PageInfoFragment = {
  __typename?: 'PageInfo';
  startCursor?: string | undefined;
  endCursor?: string | undefined;
  hasNextPage: boolean;
};

export type CreateSubspaceMutationVariables = Exact<{
  input: CreateSubspaceInput;
  includeVisuals?: InputMaybe<Scalars['Boolean']>;
}>;

export type CreateSubspaceMutation = {
  __typename?: 'Mutation';
  createSubspace: {
    __typename?: 'Space';
    id: string;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      why?: string | undefined;
      profile?: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              tags: Array<string>;
              name: string;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
      };
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
};

export type SpaceAboutBaseQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceAboutBaseQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          nameID: string;
          visibility: SpaceVisibility;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            who?: string | undefined;
            why?: string | undefined;
            isContentPublic: boolean;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
            };
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visuals: Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
                alternativeText?: string | undefined;
              }>;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
                | undefined;
            };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceAboutCardAvatarFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type SpaceAboutCardBannerFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    tagline?: string | undefined;
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
  };
};

export type SpaceAboutDetailsFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  who?: string | undefined;
  why?: string | undefined;
  isContentPublic: boolean;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    tagline?: string | undefined;
    description?: string | undefined;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visuals: Array<{
      __typename?: 'Visual';
      id: string;
      uri: string;
      name: string;
      allowedTypes: Array<string>;
      aspectRatio: number;
      maxHeight: number;
      maxWidth: number;
      minHeight: number;
      minWidth: number;
      alternativeText?: string | undefined;
    }>;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    location?:
      | { __typename?: 'Location'; id: string; city?: string | undefined; country?: string | undefined }
      | undefined;
  };
};

export type SpaceAboutLightFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  isContentPublic: boolean;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    url: string;
    tagline?: string | undefined;
    description?: string | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  membership: {
    __typename?: 'SpaceAboutMembership';
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
  };
};

export type SpaceAboutMinimalFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined };
};

export type SpaceAboutMinimalUrlFragment = {
  __typename?: 'SpaceAbout';
  id: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; tagline?: string | undefined; url: string };
};

export type SubspacePageQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SubspacePageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          about: {
            __typename?: 'SpaceAbout';
            why?: string | undefined;
            id: string;
            isContentPublic: boolean;
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            membership: {
              __typename?: 'SpaceAboutMembership';
              roleSetID?: string | undefined;
              communityID?: string | undefined;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            calloutsSet: { __typename?: 'CalloutsSet'; id: string };
          };
          templatesManager?:
            | {
                __typename?: 'TemplatesManager';
                id: string;
                templatesSet?: { __typename?: 'TemplatesSet'; id: string } | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type SubspacePageSpaceFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  about: {
    __typename?: 'SpaceAbout';
    why?: string | undefined;
    id: string;
    isContentPublic: boolean;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    membership: {
      __typename?: 'SpaceAboutMembership';
      roleSetID?: string | undefined;
      communityID?: string | undefined;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      description?: string | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
  collaboration: { __typename?: 'Collaboration'; id: string; calloutsSet: { __typename?: 'CalloutsSet'; id: string } };
  templatesManager?:
    | {
        __typename?: 'TemplatesManager';
        id: string;
        templatesSet?: { __typename?: 'TemplatesSet'; id: string } | undefined;
      }
    | undefined;
};

export type SpaceTabQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceTabQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            innovationFlow: {
              __typename?: 'InnovationFlow';
              id: string;
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
              currentState: { __typename?: 'InnovationFlowState'; displayName: string; description: string };
            };
            calloutsSet: { __typename?: 'CalloutsSet'; id: string };
          };
        }
      | undefined;
  };
};

export type SpaceCommunityPageQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceCommunityPageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            membership: {
              __typename?: 'SpaceAboutMembership';
              communityID?: string | undefined;
              roleSetID?: string | undefined;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
            provider:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            innovationFlow: {
              __typename?: 'InnovationFlow';
              id: string;
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string }>;
            };
            calloutsSet: { __typename?: 'CalloutsSet'; id: string };
          };
        }
      | undefined;
  };
};

export type SpacePageQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpacePageQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          nameID: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            who?: string | undefined;
            why?: string | undefined;
            isContentPublic: boolean;
            membership: {
              __typename?: 'SpaceAboutMembership';
              communityID?: string | undefined;
              roleSetID?: string | undefined;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
            };
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              tagline?: string | undefined;
              description?: string | undefined;
              location?:
                | {
                    __typename?: 'Location';
                    id: string;
                    city?: string | undefined;
                    country?: string | undefined;
                    addressLine1?: string | undefined;
                    addressLine2?: string | undefined;
                    stateOrProvince?: string | undefined;
                    postalCode?: string | undefined;
                  }
                | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visuals: Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
                alternativeText?: string | undefined;
              }>;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
            };
            provider:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                };
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            innovationFlow: {
              __typename?: 'InnovationFlow';
              id: string;
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string }>;
              currentState: { __typename?: 'InnovationFlowState'; displayName: string };
            };
            calloutsSet: {
              __typename?: 'CalloutsSet';
              id: string;
              callouts: Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                visibility: CalloutVisibility;
                activity: number;
                framing: {
                  __typename?: 'CalloutFraming';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                };
              }>;
            };
            timeline: {
              __typename?: 'Timeline';
              id: string;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type SpaceDashboardReferencesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceDashboardReferencesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type SpacePageFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  nameID: string;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    who?: string | undefined;
    why?: string | undefined;
    isContentPublic: boolean;
    membership: {
      __typename?: 'SpaceAboutMembership';
      communityID?: string | undefined;
      roleSetID?: string | undefined;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline?: string | undefined;
      description?: string | undefined;
      location?:
        | {
            __typename?: 'Location';
            id: string;
            city?: string | undefined;
            country?: string | undefined;
            addressLine1?: string | undefined;
            addressLine2?: string | undefined;
            stateOrProvince?: string | undefined;
            postalCode?: string | undefined;
          }
        | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visuals: Array<{
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        alternativeText?: string | undefined;
      }>;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    provider:
      | {
          __typename?: 'Organization';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        }
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        }
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
            location?:
              | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
              | undefined;
          };
        };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  collaboration: {
    __typename?: 'Collaboration';
    id: string;
    innovationFlow: {
      __typename?: 'InnovationFlow';
      id: string;
      states: Array<{ __typename?: 'InnovationFlowState'; displayName: string }>;
      currentState: { __typename?: 'InnovationFlowState'; displayName: string };
    };
    calloutsSet: {
      __typename?: 'CalloutsSet';
      id: string;
      callouts: Array<{
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        visibility: CalloutVisibility;
        activity: number;
        framing: {
          __typename?: 'CalloutFraming';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
          };
        };
      }>;
    };
    timeline: {
      __typename?: 'Timeline';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type JourneyStorageConfigQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type JourneyStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              storageBucket: {
                __typename?: 'StorageBucket';
                id: string;
                allowedMimeTypes: Array<string>;
                maxFileSize: number;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              };
            };
          };
        }
      | undefined;
  };
};

export type CalloutStorageConfigQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              storageBucket: {
                __typename?: 'StorageBucket';
                id: string;
                allowedMimeTypes: Array<string>;
                maxFileSize: number;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              };
            };
          };
        }
      | undefined;
  };
};

export type CalloutPostStorageConfigQueryVariables = Exact<{
  postId: Scalars['UUID'];
}>;

export type CalloutPostStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    post?:
      | {
          __typename?: 'Post';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type UserStorageConfigQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type VirtualContributorStorageConfigQueryVariables = Exact<{
  virtualContributorId: Scalars['UUID'];
}>;

export type VirtualContributorStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    virtualContributor?:
      | {
          __typename?: 'VirtualContributor';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type OrganizationStorageConfigQueryVariables = Exact<{
  organizationId: Scalars['UUID'];
}>;

export type OrganizationStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    organization?:
      | {
          __typename?: 'Organization';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type InnovationPackStorageConfigQueryVariables = Exact<{
  innovationPackId: Scalars['UUID'];
}>;

export type InnovationPackStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    innovationPack?:
      | {
          __typename?: 'InnovationPack';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type InnovationHubStorageConfigQueryVariables = Exact<{
  innovationHubId: Scalars['UUID'];
}>;

export type InnovationHubStorageConfigQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type TemplateStorageConfigQueryVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type TemplateStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    template?:
      | {
          __typename?: 'Template';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            storageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type PlatformStorageConfigQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformStorageConfigQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    storageAggregator: {
      __typename?: 'StorageAggregator';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      directStorageBucket: {
        __typename?: 'StorageBucket';
        id: string;
        allowedMimeTypes: Array<string>;
        maxFileSize: number;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      };
    };
  };
};

export type AccountStorageConfigQueryVariables = Exact<{
  accountId: Scalars['UUID'];
}>;

export type AccountStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    account?:
      | {
          __typename?: 'Account';
          id: string;
          storageAggregator: {
            __typename?: 'StorageAggregator';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            directStorageBucket: {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            };
          };
        }
      | undefined;
  };
};

export type ProfileStorageConfigFragment = {
  __typename?: 'Profile';
  id: string;
  storageBucket: {
    __typename?: 'StorageBucket';
    id: string;
    allowedMimeTypes: Array<string>;
    maxFileSize: number;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CalloutOnCollaborationWithStorageConfigFragment = {
  __typename?: 'Collaboration';
  id: string;
  calloutsSet: {
    __typename?: 'CalloutsSet';
    id: string;
    callouts: Array<{
      __typename?: 'Callout';
      id: string;
      framing: {
        __typename?: 'CalloutFraming';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          storageBucket: {
            __typename?: 'StorageBucket';
            id: string;
            allowedMimeTypes: Array<string>;
            maxFileSize: number;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          };
        };
      };
    }>;
  };
};

export type SpaceCollaborationTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceCollaborationTemplatesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          templatesManager?:
            | {
                __typename?: 'TemplatesManager';
                id: string;
                templatesSet?:
                  | {
                      __typename?: 'TemplatesSet';
                      id: string;
                      collaborationTemplates: Array<{
                        __typename?: 'Template';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }>;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type ImportTemplateDialogQueryVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  includeCollaboration?: InputMaybe<Scalars['Boolean']>;
  includeCallout?: InputMaybe<Scalars['Boolean']>;
}>;

export type ImportTemplateDialogQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    templatesSet?:
      | {
          __typename?: 'TemplatesSet';
          templates: Array<{
            __typename?: 'Template';
            id: string;
            type: TemplateType;
            callout?: { __typename?: 'Callout'; id: string; type: CalloutType } | undefined;
            collaboration?:
              | {
                  __typename?: 'Collaboration';
                  id: string;
                  innovationFlow: {
                    __typename?: 'InnovationFlow';
                    id: string;
                    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string }>;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type ImportTemplateDialogPlatformTemplatesQueryVariables = Exact<{
  templateTypes?: InputMaybe<Array<TemplateType> | TemplateType>;
  includeCollaboration?: InputMaybe<Scalars['Boolean']>;
  includeCallout?: InputMaybe<Scalars['Boolean']>;
}>;

export type ImportTemplateDialogPlatformTemplatesQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    library: {
      __typename?: 'Library';
      templates: Array<{
        __typename?: 'TemplateResult';
        template: {
          __typename?: 'Template';
          id: string;
          type: TemplateType;
          callout?: { __typename?: 'Callout'; id: string; type: CalloutType } | undefined;
          collaboration?:
            | {
                __typename?: 'Collaboration';
                id: string;
                innovationFlow: {
                  __typename?: 'InnovationFlow';
                  id: string;
                  states: Array<{ __typename?: 'InnovationFlowState'; displayName: string }>;
                };
              }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            url: string;
            defaultTagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
          };
        };
        innovationPack: {
          __typename?: 'InnovationPack';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              };
        };
      }>;
    };
  };
};

export type AllTemplatesInTemplatesSetQueryVariables = Exact<{
  templatesSetId: Scalars['UUID'];
}>;

export type AllTemplatesInTemplatesSetQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    templatesSet?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          calloutTemplates: Array<{
            __typename?: 'Template';
            id: string;
            type: TemplateType;
            callout?:
              | {
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  contributionPolicy: {
                    __typename?: 'CalloutContributionPolicy';
                    id: string;
                    allowedContributionTypes: Array<CalloutContributionType>;
                    state: CalloutState;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
          postTemplates: Array<{
            __typename?: 'Template';
            postDefaultDescription?: string | undefined;
            id: string;
            type: TemplateType;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
          whiteboardTemplates: Array<{
            __typename?: 'Template';
            id: string;
            type: TemplateType;
            whiteboard?: { __typename?: 'Whiteboard'; id: string } | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
          communityGuidelinesTemplates: Array<{
            __typename?: 'Template';
            id: string;
            type: TemplateType;
            communityGuidelines?:
              | {
                  __typename?: 'CommunityGuidelines';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
          collaborationTemplates: Array<{
            __typename?: 'Template';
            id: string;
            type: TemplateType;
            collaboration?:
              | {
                  __typename?: 'Collaboration';
                  id: string;
                  innovationFlow: {
                    __typename?: 'InnovationFlow';
                    id: string;
                    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              url: string;
              defaultTagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                    alternativeText?: string | undefined;
                  }
                | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type SpaceCollaborationIdQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceCollaborationIdQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            calloutsSet: { __typename?: 'CalloutsSet'; id: string };
          };
        }
      | undefined;
  };
};

export type SpaceDefaultTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceDefaultTemplatesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          templatesManager?:
            | {
                __typename?: 'TemplatesManager';
                id: string;
                templateDefaults: Array<{
                  __typename?: 'TemplateDefault';
                  id: string;
                  type: TemplateDefaultType;
                  template?:
                    | {
                        __typename?: 'Template';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | undefined;
                }>;
              }
            | undefined;
        }
      | undefined;
  };
};

export type TemplateCardProfileInfoFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
};

export type TemplateContentQueryVariables = Exact<{
  templateId: Scalars['UUID'];
  includeCallout?: InputMaybe<Scalars['Boolean']>;
  includeCommunityGuidelines?: InputMaybe<Scalars['Boolean']>;
  includeCollaboration?: InputMaybe<Scalars['Boolean']>;
  includePost?: InputMaybe<Scalars['Boolean']>;
  includeWhiteboard?: InputMaybe<Scalars['Boolean']>;
}>;

export type TemplateContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    template?:
      | {
          __typename?: 'Template';
          id: string;
          type: TemplateType;
          postDefaultDescription?: string | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            defaultTagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
          };
          callout?:
            | {
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                framing: {
                  __typename?: 'CalloutFraming';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  whiteboard?:
                    | {
                        __typename?: 'Whiteboard';
                        content: string;
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        contentUpdatePolicy: ContentUpdatePolicy;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          url: string;
                          displayName: string;
                          description?: string | undefined;
                          visual?:
                            | {
                                __typename?: 'Visual';
                                id: string;
                                uri: string;
                                name: string;
                                allowedTypes: Array<string>;
                                aspectRatio: number;
                                maxHeight: number;
                                maxWidth: number;
                                minHeight: number;
                                minWidth: number;
                                alternativeText?: string | undefined;
                              }
                            | undefined;
                          preview?:
                            | {
                                __typename?: 'Visual';
                                id: string;
                                uri: string;
                                name: string;
                                allowedTypes: Array<string>;
                                aspectRatio: number;
                                maxHeight: number;
                                maxWidth: number;
                                minHeight: number;
                                minWidth: number;
                                alternativeText?: string | undefined;
                              }
                            | undefined;
                          tagset?:
                            | {
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }
                            | undefined;
                          storageBucket: { __typename?: 'StorageBucket'; id: string };
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                url: string;
                                location?:
                                  | {
                                      __typename?: 'Location';
                                      id: string;
                                      country?: string | undefined;
                                      city?: string | undefined;
                                    }
                                  | undefined;
                                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }
                    | undefined;
                };
                contributionPolicy: { __typename?: 'CalloutContributionPolicy'; id: string; state: CalloutState };
                contributionDefaults: {
                  __typename?: 'CalloutContributionDefaults';
                  id: string;
                  postDescription?: string | undefined;
                  whiteboardContent?: string | undefined;
                };
              }
            | undefined;
          communityGuidelines?:
            | {
                __typename?: 'CommunityGuidelines';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  description?: string | undefined;
                  references?:
                    | Array<{
                        __typename?: 'Reference';
                        id: string;
                        name: string;
                        uri: string;
                        description?: string | undefined;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                      }>
                    | undefined;
                };
              }
            | undefined;
          whiteboard?:
            | {
                __typename?: 'Whiteboard';
                id: string;
                content: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }
            | undefined;
          collaboration?:
            | {
                __typename?: 'Collaboration';
                id: string;
                innovationFlow: {
                  __typename?: 'InnovationFlow';
                  id: string;
                  states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
                };
                calloutsSet: {
                  __typename?: 'CalloutsSet';
                  id: string;
                  callouts: Array<{
                    __typename?: 'Callout';
                    id: string;
                    type: CalloutType;
                    sortOrder: number;
                    classification?:
                      | {
                          __typename?: 'Classification';
                          id: string;
                          flowState?:
                            | {
                                __typename?: 'Tagset';
                                id: string;
                                name: string;
                                tags: Array<string>;
                                allowedValues: Array<string>;
                                type: TagsetType;
                              }
                            | undefined;
                        }
                      | undefined;
                    framing: {
                      __typename?: 'CalloutFraming';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        description?: string | undefined;
                      };
                      whiteboard?:
                        | {
                            __typename?: 'Whiteboard';
                            id: string;
                            profile: {
                              __typename?: 'Profile';
                              preview?:
                                | {
                                    __typename?: 'Visual';
                                    id: string;
                                    uri: string;
                                    name: string;
                                    allowedTypes: Array<string>;
                                    aspectRatio: number;
                                    maxHeight: number;
                                    maxWidth: number;
                                    minHeight: number;
                                    minWidth: number;
                                    alternativeText?: string | undefined;
                                  }
                                | undefined;
                            };
                          }
                        | undefined;
                    };
                  }>;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type CollaborationTemplateContentQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type CollaborationTemplateContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
          };
          calloutsSet: {
            __typename?: 'CalloutsSet';
            id: string;
            callouts: Array<{
              __typename?: 'Callout';
              id: string;
              type: CalloutType;
              sortOrder: number;
              classification?:
                | {
                    __typename?: 'Classification';
                    id: string;
                    flowState?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                  }
                | undefined;
              framing: {
                __typename?: 'CalloutFraming';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
                whiteboard?:
                  | {
                      __typename?: 'Whiteboard';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                              alternativeText?: string | undefined;
                            }
                          | undefined;
                      };
                    }
                  | undefined;
              };
            }>;
          };
        }
      | undefined;
  };
};

export type CalloutTemplateContentFragment = {
  __typename?: 'Callout';
  id: string;
  type: CalloutType;
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      storageBucket: { __typename?: 'StorageBucket'; id: string };
    };
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          content: string;
          id: string;
          nameID: string;
          createdDate: Date;
          contentUpdatePolicy: ContentUpdatePolicy;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            preview?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            storageBucket: { __typename?: 'StorageBucket'; id: string };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  location?:
                    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                    | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
  contributionPolicy: { __typename?: 'CalloutContributionPolicy'; id: string; state: CalloutState };
  contributionDefaults: {
    __typename?: 'CalloutContributionDefaults';
    id: string;
    postDescription?: string | undefined;
    whiteboardContent?: string | undefined;
  };
};

export type CommunityGuidelinesTemplateContentFragment = {
  __typename?: 'CommunityGuidelines';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    references?:
      | Array<{
          __typename?: 'Reference';
          id: string;
          name: string;
          uri: string;
          description?: string | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }>
      | undefined;
  };
};

export type CollaborationTemplateContentFragment = {
  __typename?: 'Collaboration';
  id: string;
  innovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
  };
  calloutsSet: {
    __typename?: 'CalloutsSet';
    id: string;
    callouts: Array<{
      __typename?: 'Callout';
      id: string;
      type: CalloutType;
      sortOrder: number;
      classification?:
        | {
            __typename?: 'Classification';
            id: string;
            flowState?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
          }
        | undefined;
      framing: {
        __typename?: 'CalloutFraming';
        id: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        whiteboard?:
          | {
              __typename?: 'Whiteboard';
              id: string;
              profile: {
                __typename?: 'Profile';
                preview?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                      alternativeText?: string | undefined;
                    }
                  | undefined;
              };
            }
          | undefined;
      };
    }>;
  };
};

export type WhiteboardTemplateContentFragment = {
  __typename?: 'Whiteboard';
  id: string;
  content: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type TemplateProfileInfoFragment = {
  __typename?: 'Template';
  id: string;
  type: TemplateType;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type CalloutTemplateFragment = {
  __typename?: 'Template';
  id: string;
  type: TemplateType;
  callout?:
    | {
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        contributionPolicy: {
          __typename?: 'CalloutContributionPolicy';
          id: string;
          allowedContributionTypes: Array<CalloutContributionType>;
          state: CalloutState;
        };
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type PostTemplateFragment = {
  __typename?: 'Template';
  postDefaultDescription?: string | undefined;
  id: string;
  type: TemplateType;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type CollaborationTemplateFragment = {
  __typename?: 'Template';
  id: string;
  type: TemplateType;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        innovationFlow: {
          __typename?: 'InnovationFlow';
          id: string;
          states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
        };
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type WhiteboardTemplateFragment = {
  __typename?: 'Template';
  id: string;
  type: TemplateType;
  whiteboard?: { __typename?: 'Whiteboard'; id: string } | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type CommunityGuidelinesTemplateFragment = {
  __typename?: 'Template';
  id: string;
  type: TemplateType;
  communityGuidelines?:
    | {
        __typename?: 'CommunityGuidelines';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          description?: string | undefined;
          references?:
            | Array<{
                __typename?: 'Reference';
                id: string;
                name: string;
                uri: string;
                description?: string | undefined;
              }>
            | undefined;
        };
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    url: string;
    defaultTagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
          alternativeText?: string | undefined;
        }
      | undefined;
  };
};

export type CreateTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  profileData: CreateProfileInput;
  type: TemplateType;
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  calloutData?: InputMaybe<CreateCalloutInput>;
  communityGuidelinesData?: InputMaybe<CreateCommunityGuidelinesInput>;
  collaborationData?: InputMaybe<CreateCollaborationInput>;
  postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
  includeProfileVisuals?: InputMaybe<Scalars['Boolean']>;
}>;

export type CreateTemplateMutation = {
  __typename?: 'Mutation';
  createTemplate: {
    __typename?: 'Template';
    id: string;
    nameID: string;
    profile?: {
      __typename?: 'Profile';
      id: string;
      cardVisual?: { __typename?: 'Visual'; id: string } | undefined;
      previewVisual?: { __typename?: 'Visual'; id: string } | undefined;
    };
  };
};

export type CreateTemplateFromCollaborationMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  collaborationId: Scalars['UUID'];
}>;

export type CreateTemplateFromCollaborationMutation = {
  __typename?: 'Mutation';
  createTemplateFromCollaboration: { __typename?: 'Template'; id: string };
};

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  profile: UpdateProfileInput;
  postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
  includeProfileVisuals?: InputMaybe<Scalars['Boolean']>;
}>;

export type UpdateTemplateMutation = {
  __typename?: 'Mutation';
  updateTemplate: {
    __typename?: 'Template';
    id: string;
    nameID: string;
    profile?: {
      __typename?: 'Profile';
      id: string;
      cardVisual?: { __typename?: 'Visual'; id: string } | undefined;
      previewVisual?: { __typename?: 'Visual'; id: string } | undefined;
    };
    whiteboard?: { __typename?: 'Whiteboard'; id: string; content: string } | undefined;
  };
};

export type UpdateTemplateFromCollaborationMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  collaborationId: Scalars['UUID'];
}>;

export type UpdateTemplateFromCollaborationMutation = {
  __typename?: 'Mutation';
  updateTemplateFromCollaboration: { __typename?: 'Template'; id: string };
};

export type DeleteTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteTemplateMutation = {
  __typename?: 'Mutation';
  deleteTemplate: { __typename?: 'Template'; id: string };
};

export type TemplateNameQueryVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type TemplateNameQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    template?:
      | { __typename?: 'Template'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | undefined;
  };
};

export type UpdateTemplateDefaultMutationVariables = Exact<{
  templateDefaultID: Scalars['UUID'];
  templateID: Scalars['UUID'];
}>;

export type UpdateTemplateDefaultMutation = {
  __typename?: 'Mutation';
  updateTemplateDefault: { __typename?: 'TemplateDefault'; id: string };
};

export type TemplatesSetTemplatesFragment = {
  __typename?: 'TemplatesSet';
  calloutTemplates: Array<{
    __typename?: 'Template';
    id: string;
    type: TemplateType;
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          type: CalloutType;
          contributionPolicy: {
            __typename?: 'CalloutContributionPolicy';
            id: string;
            allowedContributionTypes: Array<CalloutContributionType>;
            state: CalloutState;
          };
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      defaultTagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
  postTemplates: Array<{
    __typename?: 'Template';
    postDefaultDescription?: string | undefined;
    id: string;
    type: TemplateType;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      defaultTagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
  whiteboardTemplates: Array<{
    __typename?: 'Template';
    id: string;
    type: TemplateType;
    whiteboard?: { __typename?: 'Whiteboard'; id: string } | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      defaultTagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
  communityGuidelinesTemplates: Array<{
    __typename?: 'Template';
    id: string;
    type: TemplateType;
    communityGuidelines?:
      | {
          __typename?: 'CommunityGuidelines';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
          };
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      defaultTagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
  collaborationTemplates: Array<{
    __typename?: 'Template';
    id: string;
    type: TemplateType;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
          };
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      url: string;
      defaultTagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
            alternativeText?: string | undefined;
          }
        | undefined;
    };
  }>;
};

export type CreateTemplateInputQueryVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type CreateTemplateInputQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    template?:
      | {
          __typename?: 'Template';
          profile: {
            __typename?: 'Profile';
            displayName: string;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; tags: Array<string> } | undefined;
          };
        }
      | undefined;
  };
};

export type CreateCommunityGuidelinesInputQueryVariables = Exact<{
  communityGuidelinesId: Scalars['UUID'];
}>;

export type CreateCommunityGuidelinesInputQuery = {
  __typename?: 'Query';
  inputCreator: {
    __typename?: 'InputCreatorQueryResults';
    communityGuidelines?:
      | {
          __typename?: 'CreateCommunityGuidelinesData';
          profile: {
            __typename?: 'CreateProfileData';
            displayName: string;
            description?: string | undefined;
            referencesData?:
              | Array<{
                  __typename?: 'CreateReferenceData';
                  name: string;
                  uri?: string | undefined;
                  description?: string | undefined;
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type CreateCalloutInputQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CreateCalloutInputQuery = {
  __typename?: 'Query';
  inputCreator: {
    __typename?: 'InputCreatorQueryResults';
    callout?:
      | {
          __typename?: 'CreateCalloutData';
          type: CalloutType;
          framing: {
            __typename?: 'CreateCalloutFramingData';
            profile: {
              __typename?: 'CreateProfileData';
              displayName: string;
              description?: string | undefined;
              tagsets?: Array<{ __typename?: 'CreateTagsetData'; tags?: Array<string> | undefined }> | undefined;
            };
            whiteboard?: { __typename?: 'CreateWhiteboardData'; content?: string | undefined } | undefined;
          };
          contributionDefaults?:
            | {
                __typename?: 'CreateCalloutContributionDefaultsData';
                postDescription?: string | undefined;
                whiteboardContent?: string | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type CreateCollaborationInputQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
}>;

export type CreateCollaborationInputQuery = {
  __typename?: 'Query';
  inputCreator: {
    __typename?: 'InputCreatorQueryResults';
    collaboration?:
      | {
          __typename?: 'CreateCollaborationData';
          calloutsSetData: {
            __typename?: 'CreateCalloutsSetData';
            calloutsData?:
              | Array<{
                  __typename?: 'CreateCalloutData';
                  framing: {
                    __typename?: 'CreateCalloutFramingData';
                    profile: { __typename?: 'CreateProfileData'; displayName: string };
                  };
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type CreateWhiteboardInputQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type CreateWhiteboardInputQuery = {
  __typename?: 'Query';
  inputCreator: {
    __typename?: 'InputCreatorQueryResults';
    whiteboard?: { __typename?: 'CreateWhiteboardData'; content?: string | undefined } | undefined;
  };
};

export type CreatePostInputQueryVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type CreatePostInputQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    template?: { __typename?: 'Template'; id: string; postDefaultDescription?: string | undefined } | undefined;
  };
};

export type SpaceCalendarEventsQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
  includeSubspace?: InputMaybe<Scalars['Boolean']>;
}>;

export type SpaceCalendarEventsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          collaboration: {
            __typename?: 'Collaboration';
            id: string;
            timeline: {
              __typename?: 'Timeline';
              id: string;
              calendar: {
                __typename?: 'Calendar';
                id: string;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                events: Array<{
                  __typename?: 'CalendarEvent';
                  id: string;
                  startDate?: Date | undefined;
                  durationDays?: number | undefined;
                  durationMinutes: number;
                  wholeDay: boolean;
                  multipleDays: boolean;
                  visibleOnParentCalendar: boolean;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
                  };
                  subspace?:
                    | {
                        __typename?: 'Space';
                        id: string;
                        about: {
                          __typename?: 'SpaceAbout';
                          id: string;
                          isContentPublic: boolean;
                          profile: {
                            __typename?: 'Profile';
                            id: string;
                            displayName: string;
                            url: string;
                            tagline?: string | undefined;
                            description?: string | undefined;
                            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                          };
                          membership: {
                            __typename?: 'SpaceAboutMembership';
                            myMembershipStatus?: CommunityMembershipStatus | undefined;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          };
                        };
                      }
                    | undefined;
                }>;
              };
            };
          };
        }
      | undefined;
  };
};

export type CollaborationTimelineInfoFragment = {
  __typename?: 'Collaboration';
  id: string;
  timeline: {
    __typename?: 'Timeline';
    id: string;
    calendar: {
      __typename?: 'Calendar';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      events: Array<{
        __typename?: 'CalendarEvent';
        id: string;
        startDate?: Date | undefined;
        durationDays?: number | undefined;
        durationMinutes: number;
        wholeDay: boolean;
        multipleDays: boolean;
        visibleOnParentCalendar: boolean;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          description?: string | undefined;
          tagset?:
            | {
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }
            | undefined;
          references?:
            | Array<{
                __typename?: 'Reference';
                id: string;
                name: string;
                uri: string;
                description?: string | undefined;
              }>
            | undefined;
          location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
        };
        subspace?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                isContentPublic: boolean;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  description?: string | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
                membership: {
                  __typename?: 'SpaceAboutMembership';
                  myMembershipStatus?: CommunityMembershipStatus | undefined;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                };
              };
            }
          | undefined;
      }>;
    };
  };
};

export type DashboardTimelineAuthorizationFragment = {
  __typename?: 'Collaboration';
  timeline: {
    __typename?: 'Timeline';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CalendarEventInfoFragment = {
  __typename?: 'CalendarEvent';
  id: string;
  startDate?: Date | undefined;
  durationDays?: number | undefined;
  durationMinutes: number;
  wholeDay: boolean;
  multipleDays: boolean;
  visibleOnParentCalendar: boolean;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
  };
  subspace?:
    | {
        __typename?: 'Space';
        id: string;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          isContentPublic: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          };
        };
      }
    | undefined;
};

export type CalendarEventDetailsQueryVariables = Exact<{
  eventId: Scalars['UUID'];
  includeSubspace?: InputMaybe<Scalars['Boolean']>;
}>;

export type CalendarEventDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calendarEvent?:
      | {
          __typename?: 'CalendarEvent';
          type: CalendarEventType;
          createdDate?: Date | undefined;
          id: string;
          startDate?: Date | undefined;
          durationDays?: number | undefined;
          durationMinutes: number;
          wholeDay: boolean;
          multipleDays: boolean;
          visibleOnParentCalendar: boolean;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          createdBy?:
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                  tagsets?:
                    | Array<{
                        __typename?: 'Tagset';
                        id: string;
                        name: string;
                        tags: Array<string>;
                        allowedValues: Array<string>;
                        type: TagsetType;
                      }>
                    | undefined;
                };
              }
            | undefined;
          comments: {
            __typename?: 'Room';
            id: string;
            messagesCount: number;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            messages: Array<{
              __typename?: 'Message';
              id: string;
              message: string;
              timestamp: number;
              threadID?: string | undefined;
              reactions: Array<{
                __typename?: 'Reaction';
                id: string;
                emoji: string;
                sender?:
                  | {
                      __typename?: 'User';
                      id: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string };
                    }
                  | undefined;
              }>;
              sender?:
                | {
                    __typename?: 'Organization';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | {
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | {
                    __typename?: 'VirtualContributor';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      description?: string | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{
                            __typename?: 'Tagset';
                            id: string;
                            name: string;
                            tags: Array<string>;
                            allowedValues: Array<string>;
                            type: TagsetType;
                          }>
                        | undefined;
                      location?:
                        | {
                            __typename?: 'Location';
                            id: string;
                            country?: string | undefined;
                            city?: string | undefined;
                          }
                        | undefined;
                    };
                  }
                | undefined;
            }>;
            vcInteractions: Array<{
              __typename?: 'VcInteraction';
              id: string;
              threadID: string;
              virtualContributorID: string;
            }>;
          };
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            description?: string | undefined;
            tagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
            location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
          };
          subspace?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  isContentPublic: boolean;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    description?: string | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  membership: {
                    __typename?: 'SpaceAboutMembership';
                    myMembershipStatus?: CommunityMembershipStatus | undefined;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  };
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type CalendarEventDetailsFragment = {
  __typename?: 'CalendarEvent';
  type: CalendarEventType;
  createdDate?: Date | undefined;
  id: string;
  startDate?: Date | undefined;
  durationDays?: number | undefined;
  durationMinutes: number;
  wholeDay: boolean;
  multipleDays: boolean;
  visibleOnParentCalendar: boolean;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  createdBy?:
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
        };
      }
    | undefined;
  comments: {
    __typename?: 'Room';
    id: string;
    messagesCount: number;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    messages: Array<{
      __typename?: 'Message';
      id: string;
      message: string;
      timestamp: number;
      threadID?: string | undefined;
      reactions: Array<{
        __typename?: 'Reaction';
        id: string;
        emoji: string;
        sender?:
          | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
          | undefined;
      }>;
      sender?:
        | {
            __typename?: 'Organization';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | {
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              description?: string | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
            };
          }
        | undefined;
    }>;
    vcInteractions: Array<{ __typename?: 'VcInteraction'; id: string; threadID: string; virtualContributorID: string }>;
  };
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagset?:
      | {
          __typename?: 'Tagset';
          id: string;
          name: string;
          tags: Array<string>;
          allowedValues: Array<string>;
          type: TagsetType;
        }
      | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
  };
  subspace?:
    | {
        __typename?: 'Space';
        id: string;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          isContentPublic: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          };
        };
      }
    | undefined;
};

export type EventProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  description?: string | undefined;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
    | undefined;
  location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
};

export type CreateCalendarEventMutationVariables = Exact<{
  eventData: CreateCalendarEventOnCalendarInput;
  includeSubspace?: InputMaybe<Scalars['Boolean']>;
}>;

export type CreateCalendarEventMutation = {
  __typename?: 'Mutation';
  createEventOnCalendar: {
    __typename?: 'CalendarEvent';
    type: CalendarEventType;
    createdDate?: Date | undefined;
    id: string;
    startDate?: Date | undefined;
    durationDays?: number | undefined;
    durationMinutes: number;
    wholeDay: boolean;
    multipleDays: boolean;
    visibleOnParentCalendar: boolean;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    createdBy?:
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
    comments: {
      __typename?: 'Room';
      id: string;
      messagesCount: number;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      messages: Array<{
        __typename?: 'Message';
        id: string;
        message: string;
        timestamp: number;
        threadID?: string | undefined;
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          sender?:
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | undefined;
      }>;
      vcInteractions: Array<{
        __typename?: 'VcInteraction';
        id: string;
        threadID: string;
        virtualContributorID: string;
      }>;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
    };
    subspace?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
        }
      | undefined;
  };
};

export type UpdateCalendarEventMutationVariables = Exact<{
  eventData: UpdateCalendarEventInput;
  includeSubspace?: InputMaybe<Scalars['Boolean']>;
}>;

export type UpdateCalendarEventMutation = {
  __typename?: 'Mutation';
  updateCalendarEvent: {
    __typename?: 'CalendarEvent';
    type: CalendarEventType;
    createdDate?: Date | undefined;
    id: string;
    startDate?: Date | undefined;
    durationDays?: number | undefined;
    durationMinutes: number;
    wholeDay: boolean;
    multipleDays: boolean;
    visibleOnParentCalendar: boolean;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    createdBy?:
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            url: string;
            displayName: string;
            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            tagsets?:
              | Array<{
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }>
              | undefined;
          };
        }
      | undefined;
    comments: {
      __typename?: 'Room';
      id: string;
      messagesCount: number;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      messages: Array<{
        __typename?: 'Message';
        id: string;
        message: string;
        timestamp: number;
        threadID?: string | undefined;
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          sender?:
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?:
                  | Array<{
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }>
                  | undefined;
                location?:
                  | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                  | undefined;
              };
            }
          | undefined;
      }>;
      vcInteractions: Array<{
        __typename?: 'VcInteraction';
        id: string;
        threadID: string;
        virtualContributorID: string;
      }>;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      location?: { __typename?: 'Location'; id: string; city?: string | undefined } | undefined;
    };
    subspace?:
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
        }
      | undefined;
  };
};

export type DeleteCalendarEventMutationVariables = Exact<{
  deleteData: DeleteCalendarEventInput;
}>;

export type DeleteCalendarEventMutation = {
  __typename?: 'Mutation';
  deleteCalendarEvent: { __typename?: 'CalendarEvent'; id: string };
};

export type AuthorizationPolicyQueryVariables = Exact<{
  authorizationPolicyId: Scalars['UUID'];
}>;

export type AuthorizationPolicyQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    authorizationPolicy?:
      | {
          __typename?: 'Authorization';
          id: string;
          type?: AuthorizationPolicyType | undefined;
          credentialRules?:
            | Array<{
                __typename?: 'AuthorizationPolicyRuleCredential';
                name?: string | undefined;
                cascade: boolean;
                grantedPrivileges: Array<AuthorizationPrivilege>;
                criterias: Array<{ __typename?: 'CredentialDefinition'; resourceID: string; type: string }>;
              }>
            | undefined;
          privilegeRules?:
            | Array<{
                __typename?: 'AuthorizationPolicyRulePrivilege';
                name?: string | undefined;
                sourcePrivilege: AuthorizationPrivilege;
                grantedPrivileges: Array<AuthorizationPrivilege>;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type AuthorizationPrivilegesForUserQueryVariables = Exact<{
  userId: Scalars['UUID'];
  authorizationPolicyId: Scalars['UUID'];
}>;

export type AuthorizationPrivilegesForUserQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    authorizationPrivilegesForUser?: Array<AuthorizationPrivilege> | undefined;
  };
};

export type UpdateAnswerRelevanceMutationVariables = Exact<{
  input: ChatGuidanceAnswerRelevanceInput;
}>;

export type UpdateAnswerRelevanceMutation = { __typename?: 'Mutation'; updateAnswerRelevance: boolean };

export type ResetChatGuidanceMutationVariables = Exact<{ [key: string]: never }>;

export type ResetChatGuidanceMutation = { __typename?: 'Mutation'; resetChatGuidance: boolean };

export type CreateGuidanceRoomMutationVariables = Exact<{ [key: string]: never }>;

export type CreateGuidanceRoomMutation = {
  __typename?: 'Mutation';
  createChatGuidanceRoom?: { __typename?: 'Room'; id: string } | undefined;
};

export type AskChatGuidanceQuestionMutationVariables = Exact<{
  chatData: ChatGuidanceInput;
}>;

export type AskChatGuidanceQuestionMutation = {
  __typename?: 'Mutation';
  askChatGuidanceQuestion: { __typename?: 'MessageAnswerQuestion'; id?: string | undefined; success: boolean };
};

export type GuidanceRoomIdQueryVariables = Exact<{ [key: string]: never }>;

export type GuidanceRoomIdQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    user?:
      | { __typename?: 'User'; id: string; guidanceRoom?: { __typename?: 'Room'; id: string } | undefined }
      | undefined;
  };
};

export type GuidanceRoomMessagesQueryVariables = Exact<{
  roomId: Scalars['UUID'];
}>;

export type GuidanceRoomMessagesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    room?:
      | {
          __typename?: 'Room';
          id: string;
          messagesCount: number;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          messages: Array<{
            __typename?: 'Message';
            id: string;
            message: string;
            timestamp: number;
            threadID?: string | undefined;
            reactions: Array<{
              __typename?: 'Reaction';
              id: string;
              emoji: string;
              sender?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
                  }
                | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | {
                  __typename?: 'VirtualContributor';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?:
                      | Array<{
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }>
                      | undefined;
                    location?:
                      | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                      | undefined;
                  };
                }
              | undefined;
          }>;
          vcInteractions: Array<{
            __typename?: 'VcInteraction';
            id: string;
            threadID: string;
            virtualContributorID: string;
          }>;
        }
      | undefined;
  };
};

export type InAppNotificationsQueryVariables = Exact<{ [key: string]: never }>;

export type InAppNotificationsQuery = {
  __typename?: 'Query';
  notifications: Array<
    | {
        __typename?: 'InAppNotificationCalloutPublished';
        id: string;
        type: NotificationEventType;
        category: InAppNotificationCategory;
        state: InAppNotificationState;
        triggeredAt: Date;
        callout?:
          | {
              __typename?: 'Callout';
              id: string;
              type: CalloutType;
              framing: {
                __typename?: 'CalloutFraming';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              level: SpaceLevel;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        triggeredBy?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
      }
    | {
        __typename?: 'InAppNotificationCommunityNewMember';
        id: string;
        type: NotificationEventType;
        category: InAppNotificationCategory;
        state: InAppNotificationState;
        triggeredAt: Date;
        triggeredBy?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              level: SpaceLevel;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              };
            }
          | undefined;
        actor?:
          | {
              __typename: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
      }
    | {
        __typename?: 'InAppNotificationUserMentioned';
        id: string;
        type: NotificationEventType;
        category: InAppNotificationCategory;
        state: InAppNotificationState;
        triggeredAt: Date;
        commentUrl: string;
        comment: string;
        commentOriginName: string;
        contributorType: RoleSetContributorType;
        triggeredBy?:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
      }
  >;
};

export type UpdateNotificationStateMutationVariables = Exact<{
  ID: Scalars['UUID'];
  state: InAppNotificationState;
}>;

export type UpdateNotificationStateMutation = {
  __typename?: 'Mutation';
  updateNotificationState: InAppNotificationState;
};

export type InAppNotificationCalloutPublishedFragment = {
  __typename?: 'InAppNotificationCalloutPublished';
  callout?:
    | {
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        framing: {
          __typename?: 'CalloutFraming';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
        };
      }
    | undefined;
  space?:
    | {
        __typename?: 'Space';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          };
        };
      }
    | undefined;
  triggeredBy?:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
};

export type InAppNotificationCommunityNewMemberFragment = {
  __typename?: 'InAppNotificationCommunityNewMember';
  triggeredBy?:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
  space?:
    | {
        __typename?: 'Space';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          };
        };
      }
    | undefined;
  actor?:
    | {
        __typename: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
};

export type InAppNotificationUserMentionedFragment = {
  __typename?: 'InAppNotificationUserMentioned';
  commentUrl: string;
  comment: string;
  commentOriginName: string;
  contributorType: RoleSetContributorType;
  triggeredBy?:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | {
        __typename?: 'VirtualContributor';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
};

export type UrlResolverQueryVariables = Exact<{
  url: Scalars['String'];
}>;

export type UrlResolverQuery = {
  __typename?: 'Query';
  urlResolver: {
    __typename?: 'UrlResolverQueryResults';
    type: UrlType;
    organizationId?: string | undefined;
    userId?: string | undefined;
    discussionId?: string | undefined;
    innovationHubId?: string | undefined;
    space?:
      | {
          __typename?: 'UrlResolverQueryResultSpace';
          id: string;
          level: SpaceLevel;
          levelZeroSpaceID: string;
          parentSpaces: Array<string>;
          collaboration: {
            __typename?: 'UrlResolverQueryResultCollaboration';
            id: string;
            calloutsSet: {
              __typename?: 'UrlResolverQueryResultCalloutsSet';
              id: string;
              calloutId?: string | undefined;
              contributionId?: string | undefined;
              postId?: string | undefined;
              whiteboardId?: string | undefined;
            };
          };
          calendar?:
            | { __typename?: 'UrlResolverQueryResultCalendar'; id: string; calendarEventId?: string | undefined }
            | undefined;
          templatesSet?:
            | { __typename?: 'UrlResolverQueryResultTemplatesSet'; id: string; templateId?: string | undefined }
            | undefined;
        }
      | undefined;
    virtualContributor?:
      | {
          __typename?: 'UrlResolverQueryResultVirtualContributor';
          id: string;
          calloutsSet: {
            __typename?: 'UrlResolverQueryResultCalloutsSet';
            id: string;
            calloutId?: string | undefined;
            contributionId?: string | undefined;
            postId?: string | undefined;
          };
        }
      | undefined;
    innovationPack?:
      | {
          __typename?: 'UrlResolverQueryResultInnovationPack';
          id: string;
          templatesSet: {
            __typename?: 'UrlResolverQueryResultTemplatesSet';
            id: string;
            templateId?: string | undefined;
          };
        }
      | undefined;
  };
};

export type SpaceUrlResolverQueryVariables = Exact<{
  spaceNameId: Scalars['NameID'];
  subspaceL1NameId?: InputMaybe<Scalars['NameID']>;
  subspaceL2NameId?: InputMaybe<Scalars['NameID']>;
  includeSubspaceL1?: InputMaybe<Scalars['Boolean']>;
  includeSubspaceL2?: InputMaybe<Scalars['Boolean']>;
}>;

export type SpaceUrlResolverQuery = {
  __typename?: 'Query';
  lookupByName: {
    __typename?: 'LookupByNameQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          subspaceByNameID?: {
            __typename?: 'Space';
            id: string;
            subspaceByNameID?: { __typename?: 'Space'; id: string };
          };
        }
      | undefined;
  };
};

export type SearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type SearchQuery = {
  __typename?: 'Query';
  search: {
    __typename?: 'ISearchResults';
    journeyResultsCount: number;
    calloutResultsCount: number;
    contributorResultsCount: number;
    contributionResultsCount: number;
    journeyResults: Array<
      | { __typename?: 'SearchResultCallout'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultOrganization';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
      | { __typename?: 'SearchResultPost'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultSpace';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          parentSpace?:
            | {
                __typename?: 'Space';
                id: string;
                level: SpaceLevel;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  isContentPublic: boolean;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    description?: string | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  membership: {
                    __typename?: 'SpaceAboutMembership';
                    myMembershipStatus?: CommunityMembershipStatus | undefined;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  };
                };
              }
            | undefined;
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            visibility: SpaceVisibility;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              why?: string | undefined;
              isContentPublic: boolean;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                tagline?: string | undefined;
                tagset?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
                visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
              };
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
              };
            };
          };
        }
      | { __typename?: 'SearchResultUser'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultUserGroup';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
    >;
    calloutResults: Array<
      | {
          __typename?: 'SearchResultCallout';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          callout: {
            __typename?: 'Callout';
            id: string;
            type: CalloutType;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                url: string;
                tagset?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
              };
            };
            contributionPolicy: {
              __typename?: 'CalloutContributionPolicy';
              id: string;
              state: CalloutState;
              allowedContributionTypes: Array<CalloutContributionType>;
            };
            contributions: Array<{
              __typename?: 'CalloutContribution';
              id: string;
              post?: { __typename?: 'Post'; id: string } | undefined;
              whiteboard?: { __typename?: 'Whiteboard'; id: string } | undefined;
              link?: { __typename?: 'Link'; id: string } | undefined;
            }>;
            comments?: { __typename?: 'Room'; id: string; messagesCount: number } | undefined;
          };
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              isContentPublic: boolean;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                description?: string | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              };
            };
          };
        }
      | {
          __typename?: 'SearchResultOrganization';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
      | { __typename?: 'SearchResultPost'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | { __typename?: 'SearchResultSpace'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | { __typename?: 'SearchResultUser'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultUserGroup';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
    >;
    contributorResults: Array<
      | { __typename?: 'SearchResultCallout'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultOrganization';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          organization: {
            __typename?: 'Organization';
            id: string;
            profile: {
              __typename?: 'Profile';
              displayName: string;
              id: string;
              description?: string | undefined;
              url: string;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | { __typename?: 'SearchResultPost'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | { __typename?: 'SearchResultSpace'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultUser';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          user: {
            __typename?: 'User';
            id: string;
            isContactable: boolean;
            profile: {
              __typename?: 'Profile';
              displayName: string;
              id: string;
              description?: string | undefined;
              url: string;
              location?:
                | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
                | undefined;
              tagsets?:
                | Array<{
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }>
                | undefined;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | {
          __typename?: 'SearchResultUserGroup';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
    >;
    contributionResults: Array<
      | { __typename?: 'SearchResultCallout'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultOrganization';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
      | {
          __typename?: 'SearchResultPost';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          post: {
            __typename?: 'Post';
            id: string;
            createdDate: Date;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
            };
            createdBy?:
              | {
                  __typename?: 'User';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
            comments: { __typename?: 'Room'; id: string; messagesCount: number };
          };
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            visibility: SpaceVisibility;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              isContentPublic: boolean;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                description?: string | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              };
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
            };
          };
        }
      | { __typename?: 'SearchResultSpace'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | { __typename?: 'SearchResultUser'; id: string; score: number; terms: Array<string>; type: SearchResultType }
      | {
          __typename?: 'SearchResultUserGroup';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
    >;
  };
};

export type SearchResultPostFragment = {
  __typename?: 'SearchResultPost';
  post: {
    __typename?: 'Post';
    id: string;
    createdDate: Date;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
    };
    createdBy?:
      | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | undefined;
    comments: { __typename?: 'Room'; id: string; messagesCount: number };
  };
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    visibility: SpaceVisibility;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    };
  };
};

export type PostParentFragment = {
  __typename?: 'SearchResultPost';
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    visibility: SpaceVisibility;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    };
  };
};

export type SearchResultUserFragment = {
  __typename?: 'SearchResultUser';
  user: {
    __typename?: 'User';
    id: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      displayName: string;
      id: string;
      description?: string | undefined;
      url: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type SearchResultCalloutFragment = {
  __typename?: 'SearchResultCallout';
  id: string;
  callout: {
    __typename?: 'Callout';
    id: string;
    type: CalloutType;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
        url: string;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
      };
    };
    contributionPolicy: {
      __typename?: 'CalloutContributionPolicy';
      id: string;
      state: CalloutState;
      allowedContributionTypes: Array<CalloutContributionType>;
    };
    contributions: Array<{
      __typename?: 'CalloutContribution';
      id: string;
      post?: { __typename?: 'Post'; id: string } | undefined;
      whiteboard?: { __typename?: 'Whiteboard'; id: string } | undefined;
      link?: { __typename?: 'Link'; id: string } | undefined;
    }>;
    comments?: { __typename?: 'Room'; id: string; messagesCount: number } | undefined;
  };
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
};

export type CalloutParentFragment = {
  __typename?: 'SearchResultCallout';
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        description?: string | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      membership: {
        __typename?: 'SpaceAboutMembership';
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      };
    };
  };
};

export type SearchResultOrganizationFragment = {
  __typename?: 'SearchResultOrganization';
  organization: {
    __typename?: 'Organization';
    id: string;
    profile: {
      __typename?: 'Profile';
      displayName: string;
      id: string;
      description?: string | undefined;
      url: string;
      location?:
        | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
        | undefined;
      tagsets?:
        | Array<{
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }>
        | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type SearchResultProfileFragment = {
  __typename?: 'Profile';
  id: string;
  description?: string | undefined;
  url: string;
  location?:
    | { __typename?: 'Location'; id: string; country?: string | undefined; city?: string | undefined }
    | undefined;
  tagsets?:
    | Array<{
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }>
    | undefined;
  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type SearchResultPostProfileFragment = {
  __typename?: 'Profile';
  id: string;
  description?: string | undefined;
  tagset?:
    | {
        __typename?: 'Tagset';
        id: string;
        name: string;
        tags: Array<string>;
        allowedValues: Array<string>;
        type: TagsetType;
      }
    | undefined;
};

export type SearchResultSpaceFragment = {
  __typename?: 'SearchResultSpace';
  parentSpace?:
    | {
        __typename?: 'Space';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          isContentPublic: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          };
        };
      }
    | undefined;
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    visibility: SpaceVisibility;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      why?: string | undefined;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        tagline?: string | undefined;
        tagset?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
        visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
      };
      membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
    };
  };
};

export type UserRolesSearchCardsQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type UserRolesSearchCardsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      roles: Array<string>;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; roles: Array<string> }>;
    }>;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string; roles: Array<string> }>;
  };
};

export type SearchScopeDetailsSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SearchScopeDetailsSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          visibility: SpaceVisibility;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
        }
      | undefined;
  };
};

export type InnovationLibraryQueryVariables = Exact<{
  filterTemplateType?: InputMaybe<Array<TemplateType> | TemplateType>;
}>;

export type InnovationLibraryQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      templates: Array<{
        __typename?: 'TemplateResult';
        template: {
          __typename?: 'Template';
          id: string;
          type: TemplateType;
          callout?: { __typename?: 'Callout'; id: string; type: CalloutType } | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            url: string;
            defaultTagset?:
              | {
                  __typename?: 'Tagset';
                  id: string;
                  name: string;
                  tags: Array<string>;
                  allowedValues: Array<string>;
                  type: TagsetType;
                }
              | undefined;
            visual?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                  alternativeText?: string | undefined;
                }
              | undefined;
          };
        };
        innovationPack: {
          __typename?: 'InnovationPack';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          provider:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              };
        };
      }>;
      innovationPacks: Array<{
        __typename?: 'InnovationPack';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          description?: string | undefined;
          url: string;
          tagset?:
            | {
                __typename?: 'Tagset';
                id: string;
                name: string;
                tags: Array<string>;
                allowedValues: Array<string>;
                type: TagsetType;
              }
            | undefined;
        };
        templatesSet?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              calloutTemplatesCount: number;
              collaborationTemplatesCount: number;
              communityGuidelinesTemplatesCount: number;
              postTemplatesCount: number;
              whiteboardTemplatesCount: number;
            }
          | undefined;
        provider:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
      }>;
    };
  };
};

export type LibraryTemplatesFragment = {
  __typename?: 'TemplatesSet';
  id: string;
  postTemplatesCount: number;
  whiteboardTemplatesCount: number;
  calloutTemplatesCount: number;
  collaborationTemplatesCount: number;
  postTemplates: Array<{
    __typename?: 'Template';
    id: string;
    postDefaultDescription?: string | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
    };
  }>;
  whiteboardTemplates: Array<{
    __typename?: 'Template';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
    };
  }>;
  calloutTemplates: Array<{
    __typename?: 'Template';
    id: string;
    type: TemplateType;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
    };
    callout?:
      | {
          __typename?: 'Callout';
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagset?:
                | {
                    __typename?: 'Tagset';
                    id: string;
                    name: string;
                    tags: Array<string>;
                    allowedValues: Array<string>;
                    type: TagsetType;
                  }
                | undefined;
              storageBucket: { __typename?: 'StorageBucket'; id: string };
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    name: string;
                    uri: string;
                    description?: string | undefined;
                  }>
                | undefined;
            };
            whiteboard?:
              | {
                  __typename?: 'Whiteboard';
                  id: string;
                  nameID: string;
                  createdDate: Date;
                  contentUpdatePolicy: ContentUpdatePolicy;
                  content: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    url: string;
                    displayName: string;
                    description?: string | undefined;
                    visual?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                          alternativeText?: string | undefined;
                        }
                      | undefined;
                    tagset?:
                      | {
                          __typename?: 'Tagset';
                          id: string;
                          name: string;
                          tags: Array<string>;
                          allowedValues: Array<string>;
                          type: TagsetType;
                        }
                      | undefined;
                    storageBucket: { __typename?: 'StorageBucket'; id: string };
                  };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          location?:
                            | {
                                __typename?: 'Location';
                                id: string;
                                country?: string | undefined;
                                city?: string | undefined;
                              }
                            | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          };
        }
      | undefined;
  }>;
  communityGuidelinesTemplates: Array<{
    __typename?: 'Template';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
    };
    communityGuidelines?:
      | {
          __typename?: 'CommunityGuidelines';
          id: string;
          profile: {
            __typename?: 'Profile';
            displayName: string;
            description?: string | undefined;
            references?:
              | Array<{
                  __typename?: 'Reference';
                  id: string;
                  name: string;
                  uri: string;
                  description?: string | undefined;
                }>
              | undefined;
          };
        }
      | undefined;
  }>;
  collaborationTemplates: Array<{
    __typename?: 'Template';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagset?:
        | {
            __typename?: 'Tagset';
            id: string;
            name: string;
            tags: Array<string>;
            allowedValues: Array<string>;
            type: TagsetType;
          }
        | undefined;
    };
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          innovationFlow: {
            __typename?: 'InnovationFlow';
            id: string;
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
          };
          calloutsSet: {
            __typename?: 'CalloutsSet';
            id: string;
            callouts: Array<{
              __typename?: 'Callout';
              id: string;
              framing: {
                __typename?: 'CalloutFraming';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              };
            }>;
          };
        }
      | undefined;
  }>;
};

export type CampaignBlockCredentialsQueryVariables = Exact<{ [key: string]: never }>;

export type CampaignBlockCredentialsQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    roleSet: { __typename?: 'RoleSet'; id: string; myRoles: Array<RoleName> };
  };
  me: {
    __typename?: 'MeQueryResults';
    user?:
      | {
          __typename?: 'User';
          id: string;
          account?:
            | {
                __typename?: 'Account';
                id: string;
                license: {
                  __typename?: 'License';
                  id: string;
                  availableEntitlements?: Array<LicenseEntitlementType> | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type DashboardWithMembershipsQueryVariables = Exact<{
  limit?: Scalars['Float'];
}>;

export type DashboardWithMembershipsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMembershipsHierarchical: Array<{
      __typename?: 'CommunityMembershipResult';
      id: string;
      space: {
        __typename?: 'Space';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          isContentPublic: boolean;
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            spaceBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
          };
        };
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      };
      childMemberships: Array<{
        __typename?: 'CommunityMembershipResult';
        id: string;
        space: {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            isContentPublic: boolean;
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              spaceBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
            };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        };
      }>;
    }>;
  };
};

export type DashboardSpaceMembershipFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  about: {
    __typename?: 'SpaceAbout';
    isContentPublic: boolean;
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      spaceBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type ExploreSpacesSearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type ExploreSpacesSearchQuery = {
  __typename?: 'Query';
  search: {
    __typename?: 'ISearchResults';
    journeyResults: Array<
      | { __typename?: 'SearchResultCallout'; id: string; type: SearchResultType }
      | { __typename?: 'SearchResultOrganization'; id: string; type: SearchResultType }
      | { __typename?: 'SearchResultPost'; id: string; type: SearchResultType }
      | {
          __typename?: 'SearchResultSpace';
          id: string;
          type: SearchResultType;
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              isContentPublic: boolean;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            };
          };
        }
      | { __typename?: 'SearchResultUser'; id: string; type: SearchResultType }
      | { __typename?: 'SearchResultUserGroup'; id: string; type: SearchResultType }
    >;
  };
};

export type ExploreSpacesSearchFragment = {
  __typename?: 'SearchResultSpace';
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    };
  };
};

export type ExploreAllSpacesQueryVariables = Exact<{ [key: string]: never }>;

export type ExploreAllSpacesQuery = {
  __typename?: 'Query';
  exploreSpaces: Array<{
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    about: {
      __typename?: 'SpaceAbout';
      id: string;
      isContentPublic: boolean;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    };
  }>;
};

export type WelcomeSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type WelcomeSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          };
        }
      | undefined;
  };
};

export type ExploreSpacesFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    isContentPublic: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type PendingInvitationsQueryVariables = Exact<{ [key: string]: never }>;

export type PendingInvitationsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    communityInvitations: Array<{
      __typename?: 'CommunityInvitationResult';
      id: string;
      spacePendingMembershipInfo: {
        __typename?: 'SpacePendingMembershipInfo';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          isContentPublic: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          };
        };
      };
      invitation: {
        __typename?: 'Invitation';
        id: string;
        welcomeMessage?: string | undefined;
        contributorType: RoleSetContributorType;
        state: string;
        createdDate: Date;
        createdBy: { __typename?: 'User'; id: string };
      };
    }>;
  };
};

export type LatestContributionsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<ActivityFeedQueryArgs>;
}>;

export type LatestContributionsQuery = {
  __typename?: 'Query';
  activityFeed: {
    __typename?: 'ActivityFeed';
    activityFeed: Array<
      | {
          __typename?: 'ActivityLogEntryCalendarEventCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          calendarEvent: {
            __typename?: 'CalendarEvent';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutDiscussionComment';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutLinkCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          link: {
            __typename?: 'Link';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPostComment';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          post: {
            __typename?: 'Post';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPostCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          post: {
            __typename?: 'Post';
            id: string;
            profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutPublished';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            type: CalloutType;
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          whiteboard: {
            __typename?: 'Whiteboard';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
          whiteboard: {
            __typename?: 'Whiteboard';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryChallengeCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          subspace: {
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryMemberJoined';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          contributor:
            | {
                __typename?: 'Organization';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'User';
                firstName: string;
                lastName: string;
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | {
                __typename?: 'VirtualContributor';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              };
        }
      | {
          __typename?: 'ActivityLogEntryOpportunityCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
          subsubspace: {
            __typename?: 'Space';
            id: string;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
            };
          };
        }
      | {
          __typename?: 'ActivityLogEntryUpdateSent';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          message: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                about: {
                  __typename?: 'SpaceAbout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    tagline?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  };
                };
              }
            | undefined;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          };
        }
    >;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | undefined };
  };
};

export type LatestContributionsGroupedQueryVariables = Exact<{
  filter?: InputMaybe<ActivityFeedGroupedQueryArgs>;
}>;

export type LatestContributionsGroupedQuery = {
  __typename?: 'Query';
  activityFeedGrouped: Array<
    | {
        __typename?: 'ActivityLogEntryCalendarEventCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        calendarEvent: {
          __typename?: 'CalendarEvent';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutDiscussionComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutLinkCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        link: { __typename?: 'Link'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPostComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        post: {
          __typename?: 'Post';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPostCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        post: {
          __typename?: 'Post';
          id: string;
          profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutPublished';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          type: CalloutType;
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutWhiteboardContentModified';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        whiteboard: {
          __typename?: 'Whiteboard';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        callout: {
          __typename?: 'Callout';
          id: string;
          framing: {
            __typename?: 'CalloutFraming';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
        whiteboard: {
          __typename?: 'Whiteboard';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
        };
      }
    | {
        __typename?: 'ActivityLogEntryChallengeCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        subspace: {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryMemberJoined';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        contributor:
          | {
              __typename?: 'Organization';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | {
              __typename?: 'User';
              firstName: string;
              lastName: string;
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | {
              __typename?: 'VirtualContributor';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            };
      }
    | {
        __typename?: 'ActivityLogEntryOpportunityCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
        subsubspace: {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        };
      }
    | {
        __typename?: 'ActivityLogEntryUpdateSent';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        message: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              };
            }
          | undefined;
      }
  >;
};

export type LatestContributionsSpacesFlatQueryVariables = Exact<{ [key: string]: never }>;

export type LatestContributionsSpacesFlatQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMembershipsFlat: Array<{
      __typename?: 'CommunityMembershipResult';
      id: string;
      space: {
        __typename?: 'Space';
        id: string;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          isContentPublic: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            description?: string | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          };
        };
      };
    }>;
  };
};

export type MyMembershipsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type MyMembershipsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMembershipsHierarchical: Array<{
      __typename?: 'CommunityMembershipResult';
      id: string;
      space: {
        __typename?: 'Space';
        id: string;
        level: SpaceLevel;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        about: {
          __typename?: 'SpaceAbout';
          id: string;
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
          };
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          };
        };
      };
      childMemberships: Array<{
        __typename?: 'CommunityMembershipResult';
        id: string;
        space: {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
            };
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
            };
          };
        };
        childMemberships: Array<{
          __typename?: 'CommunityMembershipResult';
          id: string;
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
              };
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              };
            };
          };
        }>;
      }>;
    }>;
  };
};

export type SpaceMembershipFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
  };
};

export type MyMembershipsChildJourneyProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  tagline?: string | undefined;
  url: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type MyResourcesQueryVariables = Exact<{
  accountId: Scalars['UUID'];
}>;

export type MyResourcesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    account?:
      | {
          __typename?: 'Account';
          id: string;
          spaces: Array<{
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            about: {
              __typename?: 'SpaceAbout';
              isContentPublic: boolean;
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              };
            };
          }>;
          virtualContributors: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
          innovationPacks: Array<{
            __typename?: 'InnovationPack';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
          innovationHubs: Array<{
            __typename?: 'InnovationHub';
            id: string;
            subdomain: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type ShortAccountItemFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  url: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type NewVirtualContributorMySpacesQueryVariables = Exact<{ [key: string]: never }>;

export type NewVirtualContributorMySpacesQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    id: string;
    user?:
      | {
          __typename?: 'User';
          id: string;
          account?:
            | {
                __typename?: 'Account';
                id: string;
                host?:
                  | { __typename?: 'Organization'; id: string }
                  | { __typename?: 'User'; id: string }
                  | { __typename?: 'VirtualContributor'; id: string }
                  | undefined;
                spaces: Array<{
                  __typename?: 'Space';
                  id: string;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  license: {
                    __typename?: 'License';
                    id: string;
                    availableEntitlements?: Array<LicenseEntitlementType> | undefined;
                  };
                  about: {
                    __typename?: 'SpaceAbout';
                    id: string;
                    isContentPublic: boolean;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      tagline?: string | undefined;
                      description?: string | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    };
                    membership: {
                      __typename?: 'SpaceAboutMembership';
                      myMembershipStatus?: CommunityMembershipStatus | undefined;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    };
                  };
                  community: {
                    __typename?: 'Community';
                    id: string;
                    roleSet: {
                      __typename?: 'RoleSet';
                      id: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                    };
                  };
                }>;
              }
            | undefined;
        }
      | undefined;
  };
};

export type AllSpaceSubspacesQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type AllSpaceSubspacesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          subspaces: Array<{
            __typename?: 'Space';
            id: string;
            subspaces: Array<{
              __typename?: 'Space';
              id: string;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              about: {
                __typename?: 'SpaceAbout';
                id: string;
                isContentPublic: boolean;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  tagline?: string | undefined;
                  description?: string | undefined;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
                membership: {
                  __typename?: 'SpaceAboutMembership';
                  myMembershipStatus?: CommunityMembershipStatus | undefined;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                };
              };
              community: {
                __typename?: 'Community';
                id: string;
                roleSet: {
                  __typename?: 'RoleSet';
                  id: string;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                };
              };
            }>;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            about: {
              __typename?: 'SpaceAbout';
              id: string;
              isContentPublic: boolean;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                description?: string | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              };
            };
            community: {
              __typename?: 'Community';
              id: string;
              roleSet: {
                __typename?: 'RoleSet';
                id: string;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              };
            };
          }>;
        }
      | undefined;
  };
};

export type SpaceProfileCommunityDetailsFragment = {
  __typename?: 'Space';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  about: {
    __typename?: 'SpaceAbout';
    id: string;
    isContentPublic: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      description?: string | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    membership: {
      __typename?: 'SpaceAboutMembership';
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
    };
  };
  community: {
    __typename?: 'Community';
    id: string;
    roleSet: {
      __typename?: 'RoleSet';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type RecentSpacesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type RecentSpacesQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    mySpaces: Array<{
      __typename?: 'MySpaceResults';
      space: {
        __typename: 'Space';
        id: string;
        level: SpaceLevel;
        about: {
          __typename?: 'SpaceAbout';
          isContentPublic: boolean;
          id: string;
          membership: {
            __typename?: 'SpaceAboutMembership';
            myMembershipStatus?: CommunityMembershipStatus | undefined;
          };
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            tagline?: string | undefined;
            cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          };
        };
      };
    }>;
  };
};

export type ChallengeExplorerPageQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengeExplorerPageQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMembershipsFlat: Array<{
      __typename?: 'CommunityMembershipResult';
      id: string;
      space: { __typename?: 'Space'; id: string };
    }>;
  };
};

export type SpaceExplorerSearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type SpaceExplorerSearchQuery = {
  __typename?: 'Query';
  search: {
    __typename?: 'ISearchResults';
    journeyResults: Array<
      | { __typename?: 'SearchResultCallout'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultOrganization'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultPost'; id: string; type: SearchResultType; terms: Array<string> }
      | {
          __typename?: 'SearchResultSpace';
          id: string;
          type: SearchResultType;
          terms: Array<string>;
          space: {
            __typename?: 'Space';
            id: string;
            level: SpaceLevel;
            visibility: SpaceVisibility;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            about: {
              __typename?: 'SpaceAbout';
              why?: string | undefined;
              isContentPublic: boolean;
              id: string;
              membership: {
                __typename?: 'SpaceAboutMembership';
                myMembershipStatus?: CommunityMembershipStatus | undefined;
              };
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                tagline?: string | undefined;
                cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              };
            };
          };
        }
      | { __typename?: 'SearchResultUser'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultUserGroup'; id: string; type: SearchResultType; terms: Array<string> }
    >;
  };
};

export type SpaceExplorerSearchSpaceFragment = {
  __typename?: 'SearchResultSpace';
  space: {
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    visibility: SpaceVisibility;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    about: {
      __typename?: 'SpaceAbout';
      why?: string | undefined;
      isContentPublic: boolean;
      id: string;
      membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      };
    };
  };
};

export type SpaceExplorerMemberSpacesQueryVariables = Exact<{
  spaceIDs?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
}>;

export type SpaceExplorerMemberSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    level: SpaceLevel;
    visibility: SpaceVisibility;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      level: SpaceLevel;
      about: {
        __typename?: 'SpaceAbout';
        why?: string | undefined;
        isContentPublic: boolean;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          tagline?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        };
        membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      };
    }>;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    about: {
      __typename?: 'SpaceAbout';
      why?: string | undefined;
      isContentPublic: boolean;
      id: string;
      membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        url: string;
        tagline?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      };
    };
  }>;
};

export type SpaceExplorerAllSpacesQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  visibilities?: InputMaybe<Array<SpaceVisibility> | SpaceVisibility>;
}>;

export type SpaceExplorerAllSpacesQuery = {
  __typename?: 'Query';
  spacesPaginated: {
    __typename?: 'PaginatedSpaces';
    spaces: Array<{
      __typename?: 'Space';
      id: string;
      level: SpaceLevel;
      visibility: SpaceVisibility;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      about: {
        __typename?: 'SpaceAbout';
        why?: string | undefined;
        isContentPublic: boolean;
        id: string;
        membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          tagline?: string | undefined;
          cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        };
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type SpaceExplorerSubspacesQueryVariables = Exact<{
  IDs?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
}>;

export type SpaceExplorerSubspacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      level: SpaceLevel;
      about: {
        __typename?: 'SpaceAbout';
        why?: string | undefined;
        isContentPublic: boolean;
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          tagline?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        };
        membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
      };
    }>;
  }>;
};

export type SpaceExplorerSpaceFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  visibility: SpaceVisibility;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  about: {
    __typename?: 'SpaceAbout';
    why?: string | undefined;
    isContentPublic: boolean;
    id: string;
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
  };
};

export type SpaceExplorerSubspaceFragment = {
  __typename?: 'Space';
  id: string;
  level: SpaceLevel;
  about: {
    __typename?: 'SpaceAbout';
    why?: string | undefined;
    isContentPublic: boolean;
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      url: string;
      tagline?: string | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
    membership: { __typename?: 'SpaceAboutMembership'; myMembershipStatus?: CommunityMembershipStatus | undefined };
  };
};

export type SpaceExplorerWelcomeSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID'];
}>;

export type SpaceExplorerWelcomeSpaceQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    space?:
      | {
          __typename?: 'Space';
          id: string;
          level: SpaceLevel;
          about: {
            __typename?: 'SpaceAbout';
            id: string;
            isContentPublic: boolean;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              tagline?: string | undefined;
              description?: string | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            membership: {
              __typename?: 'SpaceAboutMembership';
              myMembershipStatus?: CommunityMembershipStatus | undefined;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            };
          };
        }
      | undefined;
  };
};
