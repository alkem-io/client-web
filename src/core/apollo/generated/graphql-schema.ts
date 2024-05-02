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
  CID: string;
  DID: string;
  DateTime: Date;
  Emoji: string;
  JSON: string;
  LifecycleDefinition: string;
  Markdown: string;
  MessageID: string;
  NameID: string;
  UUID: string;
  UUID_NAMEID: string;
  UUID_NAMEID_EMAIL: string;
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
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The defaults in use by this Account */
  defaults?: Maybe<SpaceDefaults>;
  /** The Account host. */
  host?: Maybe<Organization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Library in use by this Account */
  library?: Maybe<TemplatesSet>;
  /** The License governing platform functionality in use by this Account */
  license: License;
  /** The ID for the root space for the Account . */
  spaceID: Scalars['String'];
};

export type AccountAuthorizationResetInput = {
  /** The identifier of the Account whose Authorization Policy should be reset. */
  accountID: Scalars['UUID_NAMEID'];
};

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
  /** The type of the the Community. */
  communityType: Scalars['String'];
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
  /** The User that joined the Community. */
  user: User;
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

export type Actor = {
  __typename?: 'Actor';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A description of this actor */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The change / effort required of this actor */
  impact?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /** A value derived by this actor */
  value?: Maybe<Scalars['String']>;
};

export type ActorGroup = {
  __typename?: 'ActorGroup';
  /** The set of actors in this actor group */
  actors?: Maybe<Array<Actor>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A description of this group of actors */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
};

export type AdminSearchIngestResult = {
  __typename?: 'AdminSearchIngestResult';
  /** The result of the operation. */
  results: Array<IngestResult>;
};

export type Agent = {
  __typename?: 'Agent';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Credentials held by this Agent. */
  credentials?: Maybe<Array<Credential>>;
  /** The Decentralized Identifier (DID) for this Agent. */
  did?: Maybe<Scalars['DID']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
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

export type AnyInvitation = Invitation | InvitationExternal;

export type Application = {
  __typename?: 'Application';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** The Questions for this application. */
  questions: Array<Question>;
  updatedDate: Scalars['DateTime'];
  /** The User for this Application. */
  user: User;
};

export type ApplicationEventInput = {
  applicationID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export type ApplicationForRoleResult = {
  __typename?: 'ApplicationForRoleResult';
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
  /** The current state of the application. */
  state: Scalars['String'];
  /** ID for the Challenge being applied to, if any. Or the Challenge containing the Opportunity being applied to. */
  subspaceID?: Maybe<Scalars['UUID']>;
  /** ID for the Opportunity being applied to, if any. */
  subsubspaceID?: Maybe<Scalars['UUID']>;
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
};

export type AssignCommunityRoleToOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
  role: CommunityRole;
};

export type AssignCommunityRoleToUserInput = {
  communityID: Scalars['UUID'];
  role: CommunityRole;
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignCommunityRoleToVirtualInput = {
  communityID: Scalars['UUID'];
  role: CommunityRole;
  virtualContributorID: Scalars['UUID_NAMEID'];
};

export type AssignGlobalAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignGlobalCommunityAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignGlobalSpacesAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationAdminInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationAssociateInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationOwnerInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AuthenticationConfig = {
  __typename?: 'AuthenticationConfig';
  /** Alkemio Authentication Providers Config. */
  providers: Array<AuthenticationProviderConfig>;
};

export type AuthenticationProviderConfig = {
  __typename?: 'AuthenticationProviderConfig';
  /** Configuration of the authenticaiton provider */
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

export type Authorization = {
  __typename?: 'Authorization';
  anonymousReadAccess: Scalars['Boolean'];
  /** The set of credential rules that are contained by this Authorization Policy. */
  credentialRules?: Maybe<Array<AuthorizationPolicyRuleCredential>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The privileges granted to the current user based on this Authorization Policy. */
  myPrivileges?: Maybe<Array<AuthorizationPrivilege>>;
  /** The set of privilege rules that are contained by this Authorization Policy. */
  privilegeRules?: Maybe<Array<AuthorizationPolicyRulePrivilege>>;
  /** The set of verified credential rules that are contained by this Authorization Policy. */
  verifiedCredentialRules?: Maybe<Array<AuthorizationPolicyRuleVerifiedCredential>>;
};

export enum AuthorizationCredential {
  AccountHost = 'ACCOUNT_HOST',
  BetaTester = 'BETA_TESTER',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalAdminCommunity = 'GLOBAL_ADMIN_COMMUNITY',
  GlobalAdminSpaces = 'GLOBAL_ADMIN_SPACES',
  GlobalRegistered = 'GLOBAL_REGISTERED',
  InnovationPackProvider = 'INNOVATION_PACK_PROVIDER',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  OrganizationAssociate = 'ORGANIZATION_ASSOCIATE',
  OrganizationOwner = 'ORGANIZATION_OWNER',
  SpaceAdmin = 'SPACE_ADMIN',
  SpaceLead = 'SPACE_LEAD',
  SpaceMember = 'SPACE_MEMBER',
  SubspaceAdmin = 'SUBSPACE_ADMIN',
  SubspaceLead = 'SUBSPACE_LEAD',
  SubspaceMember = 'SUBSPACE_MEMBER',
  UserGroupMember = 'USER_GROUP_MEMBER',
  UserSelfManagement = 'USER_SELF_MANAGEMENT',
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

export enum AuthorizationPrivilege {
  AccessDashboardRefresh = 'ACCESS_DASHBOARD_REFRESH',
  AccessInteractiveGuidance = 'ACCESS_INTERACTIVE_GUIDANCE',
  AccessVirtualContributor = 'ACCESS_VIRTUAL_CONTRIBUTOR',
  Admin = 'ADMIN',
  AuthorizationReset = 'AUTHORIZATION_RESET',
  CommunityAddMember = 'COMMUNITY_ADD_MEMBER',
  CommunityApply = 'COMMUNITY_APPLY',
  CommunityInvite = 'COMMUNITY_INVITE',
  CommunityInviteAccept = 'COMMUNITY_INVITE_ACCEPT',
  CommunityJoin = 'COMMUNITY_JOIN',
  Contribute = 'CONTRIBUTE',
  Create = 'CREATE',
  CreateCallout = 'CREATE_CALLOUT',
  CreateDiscussion = 'CREATE_DISCUSSION',
  CreateMessage = 'CREATE_MESSAGE',
  CreateMessageReaction = 'CREATE_MESSAGE_REACTION',
  CreateMessageReply = 'CREATE_MESSAGE_REPLY',
  CreateOrganization = 'CREATE_ORGANIZATION',
  CreatePost = 'CREATE_POST',
  CreateRelation = 'CREATE_RELATION',
  CreateSpace = 'CREATE_SPACE',
  CreateSubspace = 'CREATE_SUBSPACE',
  CreateWhiteboard = 'CREATE_WHITEBOARD',
  CreateWhiteboardRt = 'CREATE_WHITEBOARD_RT',
  Delete = 'DELETE',
  FileDelete = 'FILE_DELETE',
  FileUpload = 'FILE_UPLOAD',
  Grant = 'GRANT',
  GrantGlobalAdmins = 'GRANT_GLOBAL_ADMINS',
  MoveContribution = 'MOVE_CONTRIBUTION',
  MovePost = 'MOVE_POST',
  PlatformAdmin = 'PLATFORM_ADMIN',
  Read = 'READ',
  ReadUsers = 'READ_USERS',
  ReadUserPii = 'READ_USER_PII',
  SaveAsTemplate = 'SAVE_AS_TEMPLATE',
  Update = 'UPDATE',
  UpdateCalloutPublisher = 'UPDATE_CALLOUT_PUBLISHER',
  UpdateContent = 'UPDATE_CONTENT',
  UpdateInnovationFlow = 'UPDATE_INNOVATION_FLOW',
  UpdateWhiteboard = 'UPDATE_WHITEBOARD',
}

export type Calendar = {
  __typename?: 'Calendar';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A single CalendarEvent */
  event?: Maybe<CalendarEvent>;
  /** The list of CalendarEvents for this Calendar. */
  events?: Maybe<Array<CalendarEvent>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
};

export type CalendarEventArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type CalendarEventsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  limit?: InputMaybe<Scalars['Float']>;
};

export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The comments for this CalendarEvent */
  comments: Room;
  /** The user that created this CalendarEvent */
  createdBy?: Maybe<User>;
  createdDate: Scalars['DateTime'];
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
  /** The event type, e.g. webinar, meetup etc. */
  type: CalendarEventType;
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
  comments?: Maybe<Room>;
  /** The Contribution Defaults for this Callout. */
  contributionDefaults: CalloutContributionDefaults;
  /** The ContributionPolicy for this Callout. */
  contributionPolicy: CalloutContributionPolicy;
  /** The Contributions that have been made to this Callout. */
  contributions: Array<CalloutContribution>;
  /** The user that created this Callout */
  createdBy?: Maybe<User>;
  /** The Callout Framing associated with this Callout. */
  framing: CalloutFraming;
  /** The ID of the entity */
  id: Scalars['UUID'];
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
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type CalloutContributionsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  filter?: InputMaybe<CalloutContributionFilterArgs>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type CalloutContribution = {
  __typename?: 'CalloutContribution';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The user that created this Document */
  createdBy?: Maybe<User>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Link that was contributed. */
  link?: Maybe<Link>;
  /** The Post that was contributed. */
  post?: Maybe<Post>;
  /** The Whiteboard that was contributed. */
  whiteboard?: Maybe<Whiteboard>;
};

export type CalloutContributionDefaults = {
  __typename?: 'CalloutContributionDefaults';
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The default description to use for new contributions. */
  postDescription?: Maybe<Scalars['Markdown']>;
  /** The default whiteboard content for whiteboard responses. */
  whiteboardContent?: Maybe<Scalars['WhiteboardContent']>;
};

export type CalloutContributionFilterArgs = {
  /** Include Contributions with Link ids of contributions to include. */
  linkIDs?: InputMaybe<Array<Scalars['UUID']>>;
  /** Include Contributions with Post ids/nameIds. */
  postIDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** Include Contributions with Whiteboard ids/nameIds. */
  whiteboardIDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
};

export type CalloutContributionPolicy = {
  __typename?: 'CalloutContributionPolicy';
  /** The allowed contribution types for this callout. */
  allowedContributionTypes: Array<CalloutContributionType>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** State of the Callout. */
  state: CalloutState;
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
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for framing the associated Callout. */
  profile: Profile;
  /** The Whiteboard for framing the associated Callout. */
  whiteboard?: Maybe<Whiteboard>;
};

export type CalloutGroup = {
  __typename?: 'CalloutGroup';
  /** The explation text to clarify the Group. */
  description: Scalars['Markdown'];
  /** The display name for the Group */
  displayName: CalloutGroupName;
};

export enum CalloutGroupName {
  Community = 'COMMUNITY',
  Contribute = 'CONTRIBUTE',
  Home = 'HOME',
  Knowledge = 'KNOWLEDGE',
  Subspaces = 'SUBSPACES',
}

export type CalloutPostCreated = {
  __typename?: 'CalloutPostCreated';
  /** The identifier for the Callout on which the post was created. */
  calloutID: Scalars['String'];
  /** The post that has been created. */
  post: Post;
};

export enum CalloutState {
  Archived = 'ARCHIVED',
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export type CalloutTemplate = {
  __typename?: 'CalloutTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The defaults to use for Callouts created from this template.   */
  contributionDefaults: CalloutContributionDefaults;
  /** The response policy to use for Callouts created from this template.   */
  contributionPolicy: CalloutContributionPolicy;
  /** The framing for callouts created from this template. */
  framing: CalloutFraming;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
  /** The Callout type, e.g. Post, Whiteboard, Discussion */
  type: CalloutType;
};

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

export type ChatGuidanceAnswerRelevanceInput = {
  /** The answer id. */
  id: Scalars['UUID'];
  /** Is the answer relevant or not. */
  relevant: Scalars['Boolean'];
};

export type ChatGuidanceInput = {
  /** The language of the answer. */
  language?: InputMaybe<Scalars['String']>;
  /** The question that is being asked. */
  question: Scalars['String'];
};

export type ChatGuidanceResult = {
  __typename?: 'ChatGuidanceResult';
  /** The answer to the question */
  answer: Scalars['String'];
  /** The id of the answer; null if an error was returned */
  id?: Maybe<Scalars['String']>;
  /** The original question */
  question: Scalars['String'];
  /** The sources used to answer the question */
  sources?: Maybe<Array<Source>>;
};

export type Collaboration = {
  __typename?: 'Collaboration';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The list of Callouts for this Collaboration object. */
  callouts: Array<Callout>;
  /** The set of CalloutGroups in use in this Collaboration. */
  groups: Array<CalloutGroup>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationFlow for the Collaboration. */
  innovationFlow: InnovationFlow;
  /** List of relations */
  relations?: Maybe<Array<Relation>>;
  /** The tagset templates on this Collaboration. */
  tagsetTemplates?: Maybe<Array<TagsetTemplate>>;
  /** The timeline with events in use by this Space */
  timeline: Timeline;
};

export type CollaborationCalloutsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  groups?: InputMaybe<Array<Scalars['String']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
  sortByActivity?: InputMaybe<Scalars['Boolean']>;
  tagsets?: InputMaybe<Array<TagsetArgs>>;
};

export type Communication = {
  __typename?: 'Communication';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A particular Discussions active in this Communication. */
  discussion?: Maybe<Discussion>;
  discussionCategories: Array<DiscussionCategory>;
  /** The Discussions active in this Communication. */
  discussions?: Maybe<Array<Discussion>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The updates on this Communication. */
  updates: Room;
};

export type CommunicationDiscussionArgs = {
  ID: Scalars['String'];
};

export type CommunicationDiscussionsArgs = {
  queryData?: InputMaybe<DiscussionsInput>;
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

export type CommunicationAdminUpdateRoomsJoinRuleInput = {
  isPublic: Scalars['Boolean'];
};

export type CommunicationCreateDiscussionInput = {
  /** The category for the Discussion */
  category: DiscussionCategory;
  /** The identifier for the Communication entity the Discussion is being created on. */
  communicationID: Scalars['UUID'];
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
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
  /** The Form used for Applications to this community. */
  applicationForm: Form;
  /** Applications available for this community. */
  applications: Array<Application>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** All member users excluding the current lead users in this Community. */
  availableLeadUsers: PaginatedUsers;
  /** All available users that are potential Community members. */
  availableMemberUsers: PaginatedUsers;
  /** The Communications for this Community. */
  communication: Communication;
  /** The user group with the specified id anywhere in the space */
  group: UserGroup;
  /** Groups of users related to a Community. */
  groups: Array<UserGroup>;
  /** The guidelines for members of this Community. */
  guidelines: CommunityGuidelines;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Invitations for this community. */
  invitations: Array<Invitation>;
  /** Invitations to join this Community for users not yet on the Alkemio platform. */
  invitationsExternal: Array<InvitationExternal>;
  /** All users that are contributing to this Community. */
  memberUsers: Array<User>;
  /** The membership status of the currently logged in user. */
  myMembershipStatus?: Maybe<CommunityMembershipStatus>;
  /** The roles on this community for the currently logged in user. */
  myRoles: Array<CommunityRole>;
  /** All Organizations that have the specified Role in this Community. */
  organizationsInRole: Array<Organization>;
  /** The policy that defines the roles for this Community. */
  policy: CommunityPolicy;
  /** All users that have the specified Role in this Community. */
  usersInRole: Array<User>;
  /** All virtuals that have the specified Role in this Community. */
  virtualContributorsInRole: Array<VirtualContributor>;
};

export type CommunityAvailableLeadUsersArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CommunityAvailableMemberUsersArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CommunityGroupArgs = {
  ID: Scalars['UUID'];
};

export type CommunityMemberUsersArgs = {
  limit?: InputMaybe<Scalars['Float']>;
};

export type CommunityOrganizationsInRoleArgs = {
  role: CommunityRole;
};

export type CommunityUsersInRoleArgs = {
  role: CommunityRole;
};

export type CommunityVirtualContributorsInRoleArgs = {
  role: CommunityRole;
};

export type CommunityApplyInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CommunityGuidelines = {
  __typename?: 'CommunityGuidelines';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The details of the guidelilnes */
  profile: Profile;
};

export type CommunityJoinInput = {
  communityID: Scalars['UUID'];
};

export enum CommunityMembershipPolicy {
  Applications = 'APPLICATIONS',
  Invitations = 'INVITATIONS',
  Open = 'OPEN',
}

export enum CommunityMembershipStatus {
  ApplicationPending = 'APPLICATION_PENDING',
  InvitationPending = 'INVITATION_PENDING',
  Member = 'MEMBER',
  NotMember = 'NOT_MEMBER',
}

export type CommunityPolicy = {
  __typename?: 'CommunityPolicy';
  /** The role policy that defines the Admins for this Community. */
  admin: CommunityRolePolicy;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The role policy that defines the leads for this Community. */
  lead: CommunityRolePolicy;
  /** The role policy that defines the members for this Community. */
  member: CommunityRolePolicy;
};

export enum CommunityRole {
  Admin = 'ADMIN',
  Lead = 'LEAD',
  Member = 'MEMBER',
}

export type CommunityRolePolicy = {
  __typename?: 'CommunityRolePolicy';
  /** The CredentialDefinition that is associated with this role */
  credential: CredentialDefinition;
  /** Is this role enabled for this Community */
  enabled: Scalars['Boolean'];
  /** Maximum number of Organizations in this role */
  maxOrg: Scalars['Float'];
  /** Maximum number of Users in this role */
  maxUser: Scalars['Float'];
  /** Minimun number of Organizations in this role */
  minOrg: Scalars['Float'];
  /** Minimum number of Users in this role */
  minUser: Scalars['Float'];
  /** The CredentialDefinitions associated with this role in parent communities */
  parentCredentials: Array<CredentialDefinition>;
};

export type Config = {
  __typename?: 'Config';
  /** Elastic APM (RUM & performance monitoring) related configuration. */
  apm: Apm;
  /** Authentication configuration. */
  authentication: AuthenticationConfig;
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

export enum ContentUpdatePolicy {
  Admins = 'ADMINS',
  Contributors = 'CONTRIBUTORS',
  Owner = 'OWNER',
}

export type Context = {
  __typename?: 'Context';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** What is the potential impact? */
  impact?: Maybe<Scalars['Markdown']>;
  /** The goal that is being pursued */
  vision?: Maybe<Scalars['Markdown']>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['Markdown']>;
};

export type ContributorFilterInput = {
  /** Return contributors with credentials in the provided list */
  credentials?: InputMaybe<Array<AuthorizationCredential>>;
};

export type ContributorRoles = {
  __typename?: 'ContributorRoles';
  /** The applications for the specified user; only accessible for platform admins */
  applications: Array<ApplicationForRoleResult>;
  id: Scalars['UUID'];
  /** The invitations for the specified user; only accessible for platform admins */
  invitations: Array<InvitationForRoleResult>;
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

export type ConvertSubspaceToSpaceInput = {
  /** The subspace to be promoted to be a new Space. Note: the original Subspace will no longer exist after the conversion.  */
  subspaceID: Scalars['UUID_NAMEID'];
};

export type ConvertSubsubspaceToSubspaceInput = {
  /** The subsubspace to be promoted. Note: the original Opportunity will no longer exist after the conversion.  */
  subsubspaceID: Scalars['UUID_NAMEID'];
};

export type CreateAccountInput = {
  /** The host Organization for the account */
  hostID: Scalars['UUID_NAMEID'];
  /** The root Space to be created. */
  spaceData: CreateSpaceInput;
};

export type CreateActorGroupInput = {
  description?: InputMaybe<Scalars['String']>;
  ecosystemModelID: Scalars['UUID'];
  name: Scalars['String'];
};

export type CreateActorInput = {
  actorGroupID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  impact?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
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
  /** Flag to indicate if this event is for a whole day. */
  wholeDay: Scalars['Boolean'];
};

export type CreateCalloutContributionDefaultsInput = {
  /** The default description to use for new Post contributions. */
  postDescription?: InputMaybe<Scalars['Markdown']>;
  whiteboardContent?: InputMaybe<Scalars['WhiteboardContent']>;
};

export type CreateCalloutContributionPolicyInput = {
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
};

export type CreateCalloutFramingInput = {
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
};

export type CreateCalloutOnCollaborationInput = {
  collaborationID: Scalars['UUID'];
  contributionDefaults?: InputMaybe<CreateCalloutContributionDefaultsInput>;
  contributionPolicy?: InputMaybe<CreateCalloutContributionPolicyInput>;
  framing: CreateCalloutFramingInput;
  /** Set Callout Group for this Callout. */
  groupName?: InputMaybe<Scalars['String']>;
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

export type CreateCalloutTemplateOnTemplatesSetInput = {
  contributionDefaults: CreateCalloutContributionDefaultsInput;
  contributionPolicy: CreateCalloutContributionPolicyInput;
  framing: CreateCalloutFramingInput;
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  /** Callout type. */
  type: CalloutType;
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreateCollaborationInput = {
  /** Add default callouts to the Collaboration; defaults to true. */
  addDefaultCallouts?: InputMaybe<Scalars['Boolean']>;
  /** The ID of the Collaboration to use for setting up the collaboration of the Collaboration. */
  collaborationTemplateID?: InputMaybe<Scalars['UUID']>;
  /** The Innovation Flow template to use for the Collaboration. */
  innovationFlowTemplateID?: InputMaybe<Scalars['UUID']>;
};

export type CreateContextInput = {
  impact?: InputMaybe<Scalars['Markdown']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type CreateContributionOnCalloutInput = {
  calloutID: Scalars['UUID'];
  link?: InputMaybe<CreateLinkInput>;
  post?: InputMaybe<CreatePostInput>;
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
};

export type CreateInnovationFlowTemplateOnTemplatesSetInput = {
  profile: CreateProfileInput;
  states?: InputMaybe<Array<UpdateInnovationFlowStateInput>>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreateInnovationHubInput = {
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

export type CreateInnovationPackOnLibraryInput = {
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData: CreateProfileInput;
  /** The provider Organization for the InnovationPack */
  providerID: Scalars['UUID_NAMEID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateInvitationExistingUserOnCommunityInput = {
  communityID: Scalars['UUID'];
  /** The identifier for the user being invited. */
  invitedUsers: Array<Scalars['UUID']>;
  welcomeMessage?: InputMaybe<Scalars['String']>;
};

export type CreateInvitationExternalUserOnCommunityInput = {
  communityID: Scalars['UUID'];
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  welcomeMessage?: InputMaybe<Scalars['String']>;
};

export type CreateLinkInput = {
  profile: CreateProfileInput;
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateLocationInput = {
  addressLine1?: InputMaybe<Scalars['String']>;
  addressLine2?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  stateOrProvince?: InputMaybe<Scalars['String']>;
};

export type CreateMemberGuidelinesTemplateOnTemplatesSetInput = {
  /** The default description to be pre-filled when users create Member Guidelines based on this template. */
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  /** The type of Member Guidelines created from this Template. */
  type: Scalars['String'];
  visualUri?: InputMaybe<Scalars['String']>;
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
  nameID: Scalars['NameID'];
  profileData: CreateProfileInput;
  website?: InputMaybe<Scalars['String']>;
};

export type CreatePostInput = {
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  type: Scalars['String'];
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreatePostTemplateOnTemplatesSetInput = {
  /** The default description to be pre-filled when users create Posts based on this template. */
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  /** The type of Posts created from this Template. */
  type: Scalars['String'];
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreateProfileInput = {
  /** The URL of the avatar of the user */
  avatarURL?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  location?: InputMaybe<CreateLocationInput>;
  referencesData?: InputMaybe<Array<CreateReferenceInput>>;
  /** A memorable short description for this entity. */
  tagline?: InputMaybe<Scalars['String']>;
  tagsets?: InputMaybe<Array<CreateTagsetInput>>;
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

export type CreateRelationOnCollaborationInput = {
  actorName: Scalars['String'];
  actorRole?: InputMaybe<Scalars['String']>;
  actorType?: InputMaybe<Scalars['String']>;
  collaborationID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
};

export type CreateSpaceInput = {
  collaborationData?: InputMaybe<CreateCollaborationInput>;
  context?: InputMaybe<CreateContextInput>;
  /** A readable identifier, unique within the containing Account. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateSubspaceInput = {
  collaborationData?: InputMaybe<CreateCollaborationInput>;
  context?: InputMaybe<CreateContextInput>;
  /** A readable identifier, unique within the containing Account. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  spaceID: Scalars['UUID_NAMEID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
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

export type CreateUserGroupInput = {
  parentID: Scalars['UUID'];
  profile: CreateProfileInput;
};

export type CreateUserInput = {
  accountUpn?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  phone?: InputMaybe<Scalars['String']>;
  profileData: CreateProfileInput;
};

export type CreateVirtualContributorInput = {
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData: CreateProfileInput;
  virtualPersonaID: Scalars['UUID'];
};

export type CreateVirtualPersonaInput = {
  engine: VirtualPersonaEngine;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData: CreateProfileInput;
  prompt: Scalars['JSON'];
};

export type CreateWhiteboardInput = {
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  /** A readable identifier, unique within the containing scope. If not provided it will be generated based on the displayName. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
};

export type CreateWhiteboardTemplateOnTemplatesSetInput = {
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  visualUri?: InputMaybe<Scalars['String']>;
  /** Use the specified Whiteboard as the initial value for this WhiteboardTemplate */
  whiteboardID?: InputMaybe<Scalars['UUID']>;
};

export type Credential = {
  __typename?: 'Credential';
  /** The ID of the entity */
  id: Scalars['UUID'];
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
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

export type DeleteActorGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteActorInput = {
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

export type DeleteCalloutTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteCollaborationInput = {
  ID: Scalars['UUID'];
};

export type DeleteDiscussionInput = {
  ID: Scalars['UUID'];
};

export type DeleteDocumentInput = {
  ID: Scalars['UUID'];
};

export type DeleteInnovationFlowTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteInnovationHubInput = {
  ID: Scalars['UUID'];
};

export type DeleteInnovationPackInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteInvitationExternalInput = {
  ID: Scalars['UUID'];
};

export type DeleteInvitationInput = {
  ID: Scalars['UUID'];
};

export type DeleteLinkInput = {
  ID: Scalars['UUID'];
};

export type DeleteOrganizationInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeletePostInput = {
  ID: Scalars['UUID'];
};

export type DeletePostTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteReferenceInput = {
  ID: Scalars['UUID'];
};

export type DeleteRelationInput = {
  ID: Scalars['String'];
};

export type DeleteSpaceInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteStorageBuckeetInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
};

export type DeleteVirtualContributorInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteVirtualPersonaInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteWhiteboardInput = {
  ID: Scalars['UUID'];
};

export type DeleteWhiteboardTemplateInput = {
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
  category: DiscussionCategory;
  /** The comments for this Discussion. */
  comments: Room;
  /** The id of the user that created this discussion */
  createdBy?: Maybe<Scalars['UUID']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Discussion. */
  profile: Profile;
  /** The timestamp for the creation of this Discussion. */
  timestamp?: Maybe<Scalars['Float']>;
};

export enum DiscussionCategory {
  ChallengeCentric = 'CHALLENGE_CENTRIC',
  CommunityBuilding = 'COMMUNITY_BUILDING',
  General = 'GENERAL',
  Help = 'HELP',
  Ideas = 'IDEAS',
  Other = 'OTHER',
  PlatformFunctionalities = 'PLATFORM_FUNCTIONALITIES',
  Questions = 'QUESTIONS',
  Releases = 'RELEASES',
  Sharing = 'SHARING',
}

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
  /** The uploaded date of this Document */
  uploadedDate: Scalars['DateTime'];
  /** The URL to be used to retrieve the Document */
  url: Scalars['String'];
};

export type EcosystemModel = {
  __typename?: 'EcosystemModel';
  /** A list of ActorGroups */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** Overview of this ecosystem model. */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
};

export type FileStorageConfig = {
  __typename?: 'FileStorageConfig';
  /** Max file size, in bytes. */
  maxFileSize: Scalars['Float'];
  /** Allowed mime types for file upload, separated by a coma. */
  mimeTypes: Array<Scalars['String']>;
};

export type Form = {
  __typename?: 'Form';
  /** A description of the purpose of this Form. */
  description?: Maybe<Scalars['Markdown']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The set of Questions in this Form. */
  questions: Array<FormQuestion>;
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
  userID: Scalars['UUID_NAMEID_EMAIL'];
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
  /** The search results for Spaces / Challenges / Opportunities. */
  journeyResults: Array<SearchResult>;
  /** The total number of results for Spaces / Challenges / Opportunities. */
  journeyResultsCount: Scalars['Float'];
};

export type IngestBatchResult = {
  __typename?: 'IngestBatchResult';
  /** A message to describe the result of the operation. */
  message?: Maybe<Scalars['String']>;
  /** Whether the operation was successful. */
  success: Scalars['Boolean'];
};

export type IngestResult = {
  __typename?: 'IngestResult';
  /** The result of the operation. */
  batches: Array<IngestBatchResult>;
  /** The index that the documents were ingested into. */
  index: Scalars['String'];
  /** Amount of documents indexed. */
  total?: Maybe<Scalars['Float']>;
};

export type InnovationFlow = {
  __typename?: 'InnovationFlow';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The currently selected state for this Flow. */
  currentState: InnovationFlowState;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this InnovationFlow. */
  profile: Profile;
  /** The set of States in use in this Flow. */
  states: Array<InnovationFlowState>;
};

export type InnovationFlowState = {
  __typename?: 'InnovationFlowState';
  /** The explation text to clarify the state. */
  description: Scalars['Markdown'];
  /** The display name for the State */
  displayName: Scalars['String'];
};

export type InnovationFlowTemplate = {
  __typename?: 'InnovationFlowTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
  /** The set of States in use in this Flow. */
  states: Array<InnovationFlowState>;
};

export type InnovationHub = {
  __typename?: 'InnovationHub';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Innovation Hub profile. */
  profile: Profile;
  spaceListFilter?: Maybe<Array<Space>>;
  /** If defined, what type of visibility to filter the Spaces on. You can have only one type of filter active at any given time. */
  spaceVisibilityFilter?: Maybe<SpaceVisibility>;
  /** The subdomain associated with this Innovation Hub. */
  subdomain: Scalars['String'];
  /** Type of Innovation Hub */
  type: InnovationHubType;
};

export enum InnovationHubType {
  List = 'LIST',
  Visibility = 'VISIBILITY',
}

export type InnovationPack = {
  __typename?: 'InnovationPack';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this InnovationPack. */
  profile: Profile;
  /** The InnovationPack provider. */
  provider?: Maybe<Organization>;
  /** The templates in use by this InnovationPack */
  templates?: Maybe<TemplatesSet>;
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

export type Invitation = {
  __typename?: 'Invitation';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The User who triggered the invitation. */
  createdBy: User;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  updatedDate: Scalars['DateTime'];
  /** The User who is invited. */
  user: User;
  welcomeMessage?: Maybe<Scalars['String']>;
};

export type InvitationEventInput = {
  eventName: Scalars['String'];
  invitationID: Scalars['UUID'];
};

export type InvitationExternal = {
  __typename?: 'InvitationExternal';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The User who triggered the invitationExternal. */
  createdBy: User;
  createdDate: Scalars['DateTime'];
  /** The email address of the external user being invited */
  email: Scalars['String'];
  firstName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  lastName: Scalars['String'];
  /** Whether a new user profile has been created. */
  profileCreated: Scalars['Boolean'];
  welcomeMessage?: Maybe<Scalars['String']>;
};

export type InvitationForRoleResult = {
  __typename?: 'InvitationForRoleResult';
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** ID for the user that created the invitation. */
  createdBy: Scalars['UUID'];
  /** Date of creation */
  createdDate: Scalars['DateTime'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the application */
  id: Scalars['UUID'];
  /** ID for the ultimate containing Space */
  spaceID: Scalars['UUID'];
  /** The current state of the invitation. */
  state: Scalars['String'];
  /** ID for the Subspace being invited to, if any. Or the Challenge containing the Opportunity being invited to. */
  subspaceID?: Maybe<Scalars['UUID']>;
  /** ID for the Opportunity being invited to, if any. */
  subsubspaceID?: Maybe<Scalars['UUID']>;
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
  /** The welcome message of the invitation */
  welcomeMessage?: Maybe<Scalars['UUID']>;
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
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A single Innovation Pack */
  innovationPack?: Maybe<InnovationPack>;
  /** The Innovation Packs in the platform Innovation Library. */
  innovationPacks: Array<InnovationPack>;
  /** The StorageAggregator for storage used by this Library */
  storageAggregator?: Maybe<StorageAggregator>;
};

export type LibraryInnovationPackArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type LibraryInnovationPacksArgs = {
  queryData?: InputMaybe<InnovationPacksInput>;
};

export type License = {
  __typename?: 'License';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The FeatureFlags for the license */
  featureFlags: Array<LicenseFeatureFlag>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type LicenseFeatureFlag = {
  __typename?: 'LicenseFeatureFlag';
  /** Is this feature flag enabled? */
  enabled: Scalars['Boolean'];
  /** The name of the feature flag */
  name: LicenseFeatureFlagName;
};

export enum LicenseFeatureFlagName {
  CalloutToCalloutTemplate = 'CALLOUT_TO_CALLOUT_TEMPLATE',
  VirtualContributors = 'VIRTUAL_CONTRIBUTORS',
  WhiteboardMultiUser = 'WHITEBOARD_MULTI_USER',
}

export type Lifecycle = {
  __typename?: 'Lifecycle';
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The machine definition, describing the states, transitions etc for this Lifeycle. */
  machineDef: Scalars['LifecycleDefinition'];
  /** The next events of this Lifecycle. */
  nextEvents?: Maybe<Array<Scalars['String']>>;
  /** The current state of this Lifecycle. */
  state?: Maybe<Scalars['String']>;
  /** Is this lifecycle in a final state (done). */
  stateIsFinal: Scalars['Boolean'];
  /** The Lifecycle template name. */
  templateName?: Maybe<Scalars['String']>;
};

export type Link = {
  __typename?: 'Link';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for framing the associated Link Contribution. */
  profile: Profile;
  /** URI of the Link */
  uri: Scalars['String'];
};

export type Location = {
  __typename?: 'Location';
  addressLine1: Scalars['String'];
  addressLine2: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  postalCode: Scalars['String'];
  stateOrProvince: Scalars['String'];
};

export type LookupQueryResults = {
  __typename?: 'LookupQueryResults';
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
  /** Lookup the specified Callout Template */
  calloutTemplate?: Maybe<CalloutTemplate>;
  /** Lookup the specified Collaboration */
  collaboration?: Maybe<Collaboration>;
  /** Lookup the specified Community */
  community?: Maybe<Community>;
  /** Lookup the specified Context */
  context?: Maybe<Context>;
  /** Lookup the specified Document */
  document?: Maybe<Document>;
  /** Lookup the specified InnovationFlow */
  innovationFlow?: Maybe<InnovationFlow>;
  /** Lookup the specified InnovationFlow Template */
  innovationFlowTemplate?: Maybe<InnovationFlowTemplate>;
  /** Lookup the specified Invitation */
  invitation?: Maybe<Invitation>;
  /** Lookup the specified Post */
  post?: Maybe<Post>;
  /** Lookup the specified Profile */
  profile?: Maybe<Profile>;
  /** Lookup the specified Room */
  room?: Maybe<Room>;
  /** Lookup the specified StorageAggregator */
  storageAggregator?: Maybe<StorageAggregator>;
  /** Lookup the specified Whiteboard */
  whiteboard?: Maybe<Whiteboard>;
  /** Lookup the specified Whiteboard Template */
  whiteboardTemplate?: Maybe<WhiteboardTemplate>;
};

export type LookupQueryResultsApplicationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsAuthorizationPolicyArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsAuthorizationPrivilegesForUserArgs = {
  authorizationID: Scalars['UUID'];
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

export type LookupQueryResultsCalloutTemplateArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCollaborationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsCommunityArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsContextArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsDocumentArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationFlowArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationFlowTemplateArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInvitationArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsPostArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsProfileArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsRoomArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsStorageAggregatorArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsWhiteboardArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsWhiteboardTemplateArgs = {
  ID: Scalars['UUID'];
};

export type MeQueryResults = {
  __typename?: 'MeQueryResults';
  /** The applications of the current authenticated user */
  applications: Array<ApplicationForRoleResult>;
  /** The query id */
  id: Scalars['String'];
  /** The invitations of the current authenticated user */
  invitations: Array<InvitationForRoleResult>;
  /** The Spaces I am contributing to */
  mySpaces: Array<MySpaceResults>;
  /** The applications of the current authenticated user */
  spaceMemberships: Array<Space>;
  /** The current authenticated User;  null if not yet registered on the platform */
  user?: Maybe<User>;
};

export type MeQueryResultsApplicationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type MeQueryResultsInvitationsArgs = {
  states?: InputMaybe<Array<Scalars['String']>>;
};

export type MeQueryResultsMySpacesArgs = {
  limit?: InputMaybe<Scalars['Float']>;
};

export type MeQueryResultsSpaceMembershipsArgs = {
  visibilities?: InputMaybe<Array<SpaceVisibility>>;
};

export type MemberGuidelinesTemplate = {
  __typename?: 'MemberGuidelinesTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
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
  sender?: Maybe<MessageSender>;
  /** The message being replied to */
  threadID?: Maybe<Scalars['String']>;
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

export type MessageSender = User | VirtualContributor;

export type Metadata = {
  __typename?: 'Metadata';
  /** Collection of metadata about Alkemio services. */
  services: Array<ServiceMetadata>;
};

export enum MimeType {
  Avif = 'AVIF',
  Bmp = 'BMP',
  Gif = 'GIF',
  Jpeg = 'JPEG',
  Jpg = 'JPG',
  Pdf = 'PDF',
  Png = 'PNG',
  Svg = 'SVG',
  Webp = 'WEBP',
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
  /** Allow updating the rule for joining rooms: public or invite. */
  adminCommunicationUpdateRoomsJoinRule: Scalars['Boolean'];
  /** Ingests new data into Elasticsearch from scratch. This will delete all existing data and ingest new data from the source. This is an admin only operation. */
  adminSearchIngestFromScratch: AdminSearchIngestResult;
  /** Apply to join the specified Community as a member. */
  applyForCommunityMembership: Application;
  /** Assigns an Organization a Role in the specified Community. */
  assignCommunityRoleToOrganization: Organization;
  /** Assigns a User to a role in the specified Community. */
  assignCommunityRoleToUser: User;
  /** Assigns a Virtual Contributor to a role in the specified Community. */
  assignCommunityRoleToVirtual: VirtualContributor;
  /** Assigns a User as a Global Admin. */
  assignUserAsGlobalAdmin: User;
  /** Assigns a User as a Global Community Admin. */
  assignUserAsGlobalCommunityAdmin: User;
  /** Assigns a User as a Global Spaces Admin. */
  assignUserAsGlobalSpacesAdmin: User;
  /** Assigns a User as an Organization Admin. */
  assignUserAsOrganizationAdmin: User;
  /** Assigns a User as an Organization Owner. */
  assignUserAsOrganizationOwner: User;
  /** Assigns a User as a member of the specified User Group. */
  assignUserToGroup: UserGroup;
  /** Assigns a User as an associate of the specified Organization. */
  assignUserToOrganization: Organization;
  /** Reset the Authorization Policy on all entities */
  authorizationPolicyResetAll: Scalars['String'];
  /** Reset the Authorization Policy on the specified Space. */
  authorizationPolicyResetOnAccount: Account;
  /** Reset the Authorization Policy on the specified Organization. */
  authorizationPolicyResetOnOrganization: Organization;
  /** Reset the Authorization Policy on the specified Platform. */
  authorizationPolicyResetOnPlatform: Platform;
  /** Reset the Authorization policy on the specified User. */
  authorizationPolicyResetOnUser: User;
  /** Reset the Authorization Policy on the specified VirtualContributor. */
  authorizationPolicyResetOnVirtualContributor: VirtualContributor;
  /** Reset the Authorization Policy on the specified VirtualPersona. */
  authorizationPolicyResetOnVirtualPersona: VirtualPersona;
  /** Reset the specified Authorization Policy to global admin privileges */
  authorizationPolicyResetToGlobalAdminsAccess: Authorization;
  /** Generate Alkemio user credential offer */
  beginAlkemioUserVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate community member credential offer */
  beginCommunityMemberVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate verified credential share request */
  beginVerifiedCredentialRequestInteraction: AgentBeginVerifiedCredentialRequestOutput;
  /** Creates a new Space by converting an existing Challenge. */
  convertChallengeToSpace: Space;
  /** Creates a new Challenge by converting an existing Opportunity. */
  convertOpportunityToChallenge: Space;
  /** Creates a new Account with a single root Space. */
  createAccount: Account;
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the EcosystemModel. */
  createActorGroup: ActorGroup;
  /** Create a new Callout on the Collaboration. */
  createCalloutOnCollaboration: Callout;
  /** Creates a new CalloutTemplate on the specified TemplatesSet. */
  createCalloutTemplate: CalloutTemplate;
  /** Create a new Contribution on the Callout. */
  createContributionOnCallout: CalloutContribution;
  /** Creates a new Discussion as part of this Communication. */
  createDiscussion: Discussion;
  /** Create a new CalendarEvent on the Calendar. */
  createEventOnCalendar: CalendarEvent;
  /** Creates a new User Group in the specified Community. */
  createGroupOnCommunity: UserGroup;
  /** Creates a new User Group for the specified Organization. */
  createGroupOnOrganization: UserGroup;
  /** Creates a new InnovationFlowTemplate on the specified TemplatesSet. */
  createInnovationFlowTemplate: InnovationFlowTemplate;
  /** Create Innovation Hub. */
  createInnovationHub: InnovationHub;
  /** Create a new InnovatonPack on the Library. */
  createInnovationPackOnLibrary: InnovationPack;
  /** Creates a new MemberGuidelinesTemplate on the specified TemplatesSet. */
  createMemberGuidelinesTemplate: MemberGuidelinesTemplate;
  /** Creates a new Organization on the platform. */
  createOrganization: Organization;
  /** Creates a new PostTemplate on the specified TemplatesSet. */
  createPostTemplate: PostTemplate;
  /** Creates a new Reference on the specified Profile. */
  createReferenceOnProfile: Reference;
  /** Create a new Relation on the Collaboration. */
  createRelationOnCollaboration: Relation;
  /** Creates a new Subspace within the specified Space. */
  createSubspace: Space;
  /** Creates a new Tagset on the specified Profile */
  createTagsetOnProfile: Tagset;
  /** Creates a new User on the platform. */
  createUser: User;
  /** Creates a new User profile on the platform for a user that has a valid Authentication session. */
  createUserNewRegistration: User;
  /** Creates a new VirtualContributor on the platform. */
  createVirtualContributor: VirtualContributor;
  /** Creates a new VirtualPersona on the platform. */
  createVirtualPersona: VirtualPersona;
  /** Creates a new WhiteboardTemplate on the specified TemplatesSet. */
  createWhiteboardTemplate: WhiteboardTemplate;
  /** Deletes the specified Actor. */
  deleteActor: Actor;
  /** Deletes the specified Actor Group, including contained Actors. */
  deleteActorGroup: ActorGroup;
  /** Deletes the specified CalendarEvent. */
  deleteCalendarEvent: CalendarEvent;
  /** Delete a Callout. */
  deleteCallout: Callout;
  /** Deletes the specified CalloutTemplate. */
  deleteCalloutTemplate: CalloutTemplate;
  /** Delete Collaboration. */
  deleteCollaboration: Collaboration;
  /** Deletes the specified Discussion. */
  deleteDiscussion: Discussion;
  /** Deletes the specified Document. */
  deleteDocument: Document;
  /** Deletes the specified InnovationFlowTemplate. */
  deleteInnovationFlowTemplate: InnovationFlowTemplate;
  /** Delete Innovation Hub. */
  deleteInnovationHub: InnovationHub;
  /** Deletes the specified InnovationPack. */
  deleteInnovationPack: InnovationPack;
  /** Removes the specified User invitation. */
  deleteInvitation: Invitation;
  /** Removes the specified User invitationExternal. */
  deleteInvitationExternal: InvitationExternal;
  /** Deletes the specified Link. */
  deleteLink: Link;
  /** Deletes the specified Organization. */
  deleteOrganization: Organization;
  /** Deletes the specified Post. */
  deletePost: Post;
  /** Deletes the specified PostTemplate. */
  deletePostTemplate: PostTemplate;
  /** Deletes the specified Reference. */
  deleteReference: Reference;
  /** Deletes the specified Relation. */
  deleteRelation: Relation;
  /** Deletes the specified Space. */
  deleteSpace: Space;
  /** Deletes a Storage Bucket */
  deleteStorageBucket: StorageBucket;
  /** Deletes the specified User. */
  deleteUser: User;
  /** Removes the specified User Application. */
  deleteUserApplication: Application;
  /** Deletes the specified User Group. */
  deleteUserGroup: UserGroup;
  /** Deletes the specified VirtualContributor. */
  deleteVirtualContributor: VirtualContributor;
  /** Deletes the specified VirtualPersona. */
  deleteVirtualPersona: VirtualPersona;
  /** Deletes the specified Whiteboard. */
  deleteWhiteboard: Whiteboard;
  /** Deletes the specified WhiteboardTemplate. */
  deleteWhiteboardTemplate: WhiteboardTemplate;
  /** Trigger an event on the Application. */
  eventOnApplication: Application;
  /** Trigger an event on the Invitation. */
  eventOnCommunityInvitation: Invitation;
  /** Trigger an event on the Organization Verification. */
  eventOnOrganizationVerification: OrganizationVerification;
  /** Grants an authorization credential to an Organization. */
  grantCredentialToOrganization: Organization;
  /** Grants an authorization credential to a User. */
  grantCredentialToUser: User;
  /** Resets the interaction with the chat engine. */
  ingest: Scalars['Boolean'];
  /** Invite an existing User to join the specified Community as a member. */
  inviteExistingUserForCommunityMembership: Array<Invitation>;
  /** Invite an external User to join the specified Community as a member. */
  inviteForCommunityMembershipByEmail: AnyInvitation;
  /** Join the specified Community as a member, without going through an approval process. */
  joinCommunity: Community;
  /** Sends a message on the specified User`s behalf and returns the room id */
  messageUser: Scalars['String'];
  /** Moves the specified Contribution to another Callout. */
  moveContributionToCallout: CalloutContribution;
  /** Removes an Organization from a Role in the specified Community. */
  removeCommunityRoleFromOrganization: Organization;
  /** Removes a User from a Role in the specified Community. */
  removeCommunityRoleFromUser: User;
  /** Removes a Virtual from a Role in the specified Community. */
  removeCommunityRoleFromVirtual: VirtualContributor;
  /** Removes a message. */
  removeMessageOnRoom: Scalars['MessageID'];
  /** Remove a reaction on a message from the specified Room. */
  removeReactionToMessageInRoom: Scalars['Boolean'];
  /** Removes a User from being a Global Admin. */
  removeUserAsGlobalAdmin: User;
  /** Removes a User from being a Global Community Admin. */
  removeUserAsGlobalCommunityAdmin: User;
  /** Removes a User from being a Global Spaces Admin. */
  removeUserAsGlobalSpacesAdmin: User;
  /** Removes a User from being an Organization Admin. */
  removeUserAsOrganizationAdmin: User;
  /** Removes a User from being an Organization Owner. */
  removeUserAsOrganizationOwner: User;
  /** Removes the specified User from specified user group */
  removeUserFromGroup: UserGroup;
  /** Removes a User as a member of the specified Organization. */
  removeUserFromOrganization: Organization;
  /** Resets the interaction with the chat engine. */
  resetChatGuidance: Scalars['Boolean'];
  /** Resets the interaction with the chat engine. */
  resetVirtualContributor: Scalars['Boolean'];
  /** Removes an authorization credential from an Organization. */
  revokeCredentialFromOrganization: Organization;
  /** Removes an authorization credential from a User. */
  revokeCredentialFromUser: User;
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
  /** Update the platform settings, such as license, of the specified Account. */
  updateAccountPlatformSettings: Account;
  /** Updates the specified Actor. */
  updateActor: Actor;
  /** User vote if a specific answer is relevant. */
  updateAnswerRelevance: Scalars['Boolean'];
  /** Updates the specified CalendarEvent. */
  updateCalendarEvent: CalendarEvent;
  /** Update a Callout. */
  updateCallout: Callout;
  /** Update the information describing the publishing of the specified Callout. */
  updateCalloutPublishInfo: Callout;
  /** Updates the specified CalloutTemplate. */
  updateCalloutTemplate: CalloutTemplate;
  /** Update the visibility of the specified Callout. */
  updateCalloutVisibility: Callout;
  /** Update the sortOrder field of the supplied Callouts to increase as per the order that they are provided in. */
  updateCalloutsSortOrder: Array<Callout>;
  /** Update the Application Form used by this Community. */
  updateCommunityApplicationForm: Community;
  /** Updates the CommunityGuidelines. */
  updateCommunityGuidelines: CommunityGuidelines;
  /** Updates the specified Discussion. */
  updateDiscussion: Discussion;
  /** Updates the specified Document. */
  updateDocument: Document;
  /** Updates the specified EcosystemModel. */
  updateEcosystemModel: EcosystemModel;
  /** Updates the InnovationFlow. */
  updateInnovationFlow: InnovationFlow;
  /** Updates the InnovationFlow. */
  updateInnovationFlowSelectedState: InnovationFlow;
  /** Updates the specified InnovationFlowState. */
  updateInnovationFlowSingleState: InnovationFlow;
  /** Updates the InnovationFlow states from the specified template. */
  updateInnovationFlowStatesFromTemplate: InnovationFlow;
  /** Updates the specified InnovationFlowTemplate. */
  updateInnovationFlowTemplate: InnovationFlowTemplate;
  /** Update Innovation Hub. */
  updateInnovationHub: InnovationHub;
  /** Updates the InnovationPack. */
  updateInnovationPack: InnovationPack;
  /** Updates the specified Link. */
  updateLink: Link;
  /** Updates the specified Organization. */
  updateOrganization: Organization;
  /** Updates the specified Post. */
  updatePost: Post;
  /** Updates the specified PostTemplate. */
  updatePostTemplate: PostTemplate;
  /** Updates one of the Preferences on an Organization */
  updatePreferenceOnOrganization: Preference;
  /** Updates one of the Preferences on a Space */
  updatePreferenceOnUser: Preference;
  /** Updates the specified Profile. */
  updateProfile: Profile;
  /** Updates the specified Reference. */
  updateReference: Reference;
  /** Updates the Space. */
  updateSpace: Space;
  /** Updates the specified SpaceDefaults. */
  updateSpaceDefaults: SpaceDefaults;
  /** Update the platform settings, such as nameID, of the specified Space. */
  updateSpacePlatformSettings: Space;
  /** Updates one of the Setting on a Space */
  updateSpaceSettings: Space;
  /** Updates the specified Tagset. */
  updateTagset: Tagset;
  /** Updates the User. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Update the platform settings, such as nameID, email, for the specified User. */
  updateUserPlatformSettings: User;
  /** Updates the specified VirtualContributor. */
  updateVirtualContributor: VirtualContributor;
  /** Updates the specified VirtualPersona. */
  updateVirtualPersona: VirtualPersona;
  /** Updates the image URI for the specified Visual. */
  updateVisual: Visual;
  /** Updates the specified Whiteboard. */
  updateWhiteboard: Whiteboard;
  /** Updates the specified Whiteboard content. */
  updateWhiteboardContent: Whiteboard;
  /** Updates the specified WhiteboardTemplate. */
  updateWhiteboardTemplate: WhiteboardTemplate;
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

export type MutationAdminCommunicationUpdateRoomsJoinRuleArgs = {
  changeRoomAccessData: CommunicationAdminUpdateRoomsJoinRuleInput;
};

export type MutationApplyForCommunityMembershipArgs = {
  applicationData: CommunityApplyInput;
};

export type MutationAssignCommunityRoleToOrganizationArgs = {
  roleData: AssignCommunityRoleToOrganizationInput;
};

export type MutationAssignCommunityRoleToUserArgs = {
  roleData: AssignCommunityRoleToUserInput;
};

export type MutationAssignCommunityRoleToVirtualArgs = {
  roleData: AssignCommunityRoleToVirtualInput;
};

export type MutationAssignUserAsGlobalAdminArgs = {
  membershipData: AssignGlobalAdminInput;
};

export type MutationAssignUserAsGlobalCommunityAdminArgs = {
  membershipData: AssignGlobalCommunityAdminInput;
};

export type MutationAssignUserAsGlobalSpacesAdminArgs = {
  membershipData: AssignGlobalSpacesAdminInput;
};

export type MutationAssignUserAsOrganizationAdminArgs = {
  membershipData: AssignOrganizationAdminInput;
};

export type MutationAssignUserAsOrganizationOwnerArgs = {
  membershipData: AssignOrganizationOwnerInput;
};

export type MutationAssignUserToGroupArgs = {
  membershipData: AssignUserGroupMemberInput;
};

export type MutationAssignUserToOrganizationArgs = {
  membershipData: AssignOrganizationAssociateInput;
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

export type MutationAuthorizationPolicyResetOnVirtualContributorArgs = {
  authorizationResetData: VirtualContributorAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnVirtualPersonaArgs = {
  authorizationResetData: VirtualPersonaAuthorizationResetInput;
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

export type MutationCreateAccountArgs = {
  accountData: CreateAccountInput;
};

export type MutationCreateActorArgs = {
  actorData: CreateActorInput;
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: CreateActorGroupInput;
};

export type MutationCreateCalloutOnCollaborationArgs = {
  calloutData: CreateCalloutOnCollaborationInput;
};

export type MutationCreateCalloutTemplateArgs = {
  calloutTemplateInput: CreateCalloutTemplateOnTemplatesSetInput;
};

export type MutationCreateContributionOnCalloutArgs = {
  contributionData: CreateContributionOnCalloutInput;
};

export type MutationCreateDiscussionArgs = {
  createData: CommunicationCreateDiscussionInput;
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

export type MutationCreateInnovationFlowTemplateArgs = {
  innovationFlowTemplateInput: CreateInnovationFlowTemplateOnTemplatesSetInput;
};

export type MutationCreateInnovationHubArgs = {
  createData: CreateInnovationHubInput;
};

export type MutationCreateInnovationPackOnLibraryArgs = {
  packData: CreateInnovationPackOnLibraryInput;
};

export type MutationCreateMemberGuidelinesTemplateArgs = {
  memberGuidelinesTemplateInput: CreateMemberGuidelinesTemplateOnTemplatesSetInput;
};

export type MutationCreateOrganizationArgs = {
  organizationData: CreateOrganizationInput;
};

export type MutationCreatePostTemplateArgs = {
  postTemplateInput: CreatePostTemplateOnTemplatesSetInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: CreateReferenceOnProfileInput;
};

export type MutationCreateRelationOnCollaborationArgs = {
  relationData: CreateRelationOnCollaborationInput;
};

export type MutationCreateSubspaceArgs = {
  subspaceData: CreateSubspaceInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetData: CreateTagsetOnProfileInput;
};

export type MutationCreateUserArgs = {
  userData: CreateUserInput;
};

export type MutationCreateVirtualContributorArgs = {
  virtualContributorData: CreateVirtualContributorInput;
};

export type MutationCreateVirtualPersonaArgs = {
  virtualPersonaData: CreateVirtualPersonaInput;
};

export type MutationCreateWhiteboardTemplateArgs = {
  whiteboardTemplateInput: CreateWhiteboardTemplateOnTemplatesSetInput;
};

export type MutationDeleteActorArgs = {
  deleteData: DeleteActorInput;
};

export type MutationDeleteActorGroupArgs = {
  deleteData: DeleteActorGroupInput;
};

export type MutationDeleteCalendarEventArgs = {
  deleteData: DeleteCalendarEventInput;
};

export type MutationDeleteCalloutArgs = {
  deleteData: DeleteCalloutInput;
};

export type MutationDeleteCalloutTemplateArgs = {
  deleteData: DeleteCalloutTemplateInput;
};

export type MutationDeleteCollaborationArgs = {
  deleteData: DeleteCollaborationInput;
};

export type MutationDeleteDiscussionArgs = {
  deleteData: DeleteDiscussionInput;
};

export type MutationDeleteDocumentArgs = {
  deleteData: DeleteDocumentInput;
};

export type MutationDeleteInnovationFlowTemplateArgs = {
  deleteData: DeleteInnovationFlowTemplateInput;
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

export type MutationDeleteInvitationExternalArgs = {
  deleteData: DeleteInvitationExternalInput;
};

export type MutationDeleteLinkArgs = {
  deleteData: DeleteLinkInput;
};

export type MutationDeleteOrganizationArgs = {
  deleteData: DeleteOrganizationInput;
};

export type MutationDeletePostArgs = {
  deleteData: DeletePostInput;
};

export type MutationDeletePostTemplateArgs = {
  deleteData: DeletePostTemplateInput;
};

export type MutationDeleteReferenceArgs = {
  deleteData: DeleteReferenceInput;
};

export type MutationDeleteRelationArgs = {
  deleteData: DeleteRelationInput;
};

export type MutationDeleteSpaceArgs = {
  deleteData: DeleteSpaceInput;
};

export type MutationDeleteStorageBucketArgs = {
  deleteData: DeleteStorageBuckeetInput;
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

export type MutationDeleteVirtualPersonaArgs = {
  deleteData: DeleteVirtualPersonaInput;
};

export type MutationDeleteWhiteboardArgs = {
  whiteboardData: DeleteWhiteboardInput;
};

export type MutationDeleteWhiteboardTemplateArgs = {
  deleteData: DeleteWhiteboardTemplateInput;
};

export type MutationEventOnApplicationArgs = {
  applicationEventData: ApplicationEventInput;
};

export type MutationEventOnCommunityInvitationArgs = {
  invitationEventData: InvitationEventInput;
};

export type MutationEventOnOrganizationVerificationArgs = {
  organizationVerificationEventData: OrganizationVerificationEventInput;
};

export type MutationGrantCredentialToOrganizationArgs = {
  grantCredentialData: GrantOrganizationAuthorizationCredentialInput;
};

export type MutationGrantCredentialToUserArgs = {
  grantCredentialData: GrantAuthorizationCredentialInput;
};

export type MutationInviteExistingUserForCommunityMembershipArgs = {
  invitationData: CreateInvitationExistingUserOnCommunityInput;
};

export type MutationInviteForCommunityMembershipByEmailArgs = {
  invitationData: CreateInvitationExternalUserOnCommunityInput;
};

export type MutationJoinCommunityArgs = {
  joinCommunityData: CommunityJoinInput;
};

export type MutationMessageUserArgs = {
  messageData: UserSendMessageInput;
};

export type MutationMoveContributionToCalloutArgs = {
  moveContributionData: MoveCalloutContributionInput;
};

export type MutationRemoveCommunityRoleFromOrganizationArgs = {
  roleData: RemoveCommunityRoleFromOrganizationInput;
};

export type MutationRemoveCommunityRoleFromUserArgs = {
  roleData: RemoveCommunityRoleFromUserInput;
};

export type MutationRemoveCommunityRoleFromVirtualArgs = {
  roleData: RemoveCommunityRoleFromVirtualInput;
};

export type MutationRemoveMessageOnRoomArgs = {
  messageData: RoomRemoveMessageInput;
};

export type MutationRemoveReactionToMessageInRoomArgs = {
  reactionData: RoomRemoveReactionToMessageInput;
};

export type MutationRemoveUserAsGlobalAdminArgs = {
  membershipData: RemoveGlobalAdminInput;
};

export type MutationRemoveUserAsGlobalCommunityAdminArgs = {
  membershipData: RemoveGlobalCommunityAdminInput;
};

export type MutationRemoveUserAsGlobalSpacesAdminArgs = {
  membershipData: RemoveGlobalSpacesAdminInput;
};

export type MutationRemoveUserAsOrganizationAdminArgs = {
  membershipData: RemoveOrganizationAdminInput;
};

export type MutationRemoveUserAsOrganizationOwnerArgs = {
  membershipData: RemoveOrganizationOwnerInput;
};

export type MutationRemoveUserFromGroupArgs = {
  membershipData: RemoveUserGroupMemberInput;
};

export type MutationRemoveUserFromOrganizationArgs = {
  membershipData: RemoveOrganizationAssociateInput;
};

export type MutationRevokeCredentialFromOrganizationArgs = {
  revokeCredentialData: RevokeOrganizationAuthorizationCredentialInput;
};

export type MutationRevokeCredentialFromUserArgs = {
  revokeCredentialData: RevokeAuthorizationCredentialInput;
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

export type MutationUpdateAccountPlatformSettingsArgs = {
  updateData: UpdateAccountPlatformSettingsInput;
};

export type MutationUpdateActorArgs = {
  actorData: UpdateActorInput;
};

export type MutationUpdateAnswerRelevanceArgs = {
  input: ChatGuidanceAnswerRelevanceInput;
};

export type MutationUpdateCalendarEventArgs = {
  eventData: UpdateCalendarEventInput;
};

export type MutationUpdateCalloutArgs = {
  calloutData: UpdateCalloutInput;
};

export type MutationUpdateCalloutPublishInfoArgs = {
  calloutData: UpdateCalloutPublishInfoInput;
};

export type MutationUpdateCalloutTemplateArgs = {
  calloutTemplateInput: UpdateCalloutTemplateInput;
};

export type MutationUpdateCalloutVisibilityArgs = {
  calloutData: UpdateCalloutVisibilityInput;
};

export type MutationUpdateCalloutsSortOrderArgs = {
  sortOrderData: UpdateCollaborationCalloutsSortOrderInput;
};

export type MutationUpdateCommunityApplicationFormArgs = {
  applicationFormData: UpdateCommunityApplicationFormInput;
};

export type MutationUpdateCommunityGuidelinesArgs = {
  communityGuidelinesData: UpdateCommunityGuidelinesInput;
};

export type MutationUpdateDiscussionArgs = {
  updateData: UpdateDiscussionInput;
};

export type MutationUpdateDocumentArgs = {
  documentData: UpdateDocumentInput;
};

export type MutationUpdateEcosystemModelArgs = {
  ecosystemModelData: UpdateEcosystemModelInput;
};

export type MutationUpdateInnovationFlowArgs = {
  innovationFlowData: UpdateInnovationFlowInput;
};

export type MutationUpdateInnovationFlowSelectedStateArgs = {
  innovationFlowStateData: UpdateInnovationFlowSelectedStateInput;
};

export type MutationUpdateInnovationFlowSingleStateArgs = {
  innovationFlowStateData: UpdateInnovationFlowSingleStateInput;
};

export type MutationUpdateInnovationFlowStatesFromTemplateArgs = {
  innovationFlowData: UpdateInnovationFlowFromTemplateInput;
};

export type MutationUpdateInnovationFlowTemplateArgs = {
  innovationFlowTemplateInput: UpdateInnovationFlowTemplateInput;
};

export type MutationUpdateInnovationHubArgs = {
  updateData: UpdateInnovationHubInput;
};

export type MutationUpdateInnovationPackArgs = {
  innovationPackData: UpdateInnovationPackInput;
};

export type MutationUpdateLinkArgs = {
  linkData: UpdateLinkInput;
};

export type MutationUpdateOrganizationArgs = {
  organizationData: UpdateOrganizationInput;
};

export type MutationUpdatePostArgs = {
  postData: UpdatePostInput;
};

export type MutationUpdatePostTemplateArgs = {
  postTemplateInput: UpdatePostTemplateInput;
};

export type MutationUpdatePreferenceOnOrganizationArgs = {
  preferenceData: UpdateOrganizationPreferenceInput;
};

export type MutationUpdatePreferenceOnUserArgs = {
  preferenceData: UpdateUserPreferenceInput;
};

export type MutationUpdateProfileArgs = {
  profileData: UpdateProfileDirectInput;
};

export type MutationUpdateReferenceArgs = {
  referenceData: UpdateReferenceInput;
};

export type MutationUpdateSpaceArgs = {
  spaceData: UpdateSpaceInput;
};

export type MutationUpdateSpaceDefaultsArgs = {
  spaceDefaultsData: UpdateSpaceDefaultsInput;
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

export type MutationUpdateUserArgs = {
  userData: UpdateUserInput;
};

export type MutationUpdateUserGroupArgs = {
  userGroupData: UpdateUserGroupInput;
};

export type MutationUpdateUserPlatformSettingsArgs = {
  updateData: UpdateUserPlatformSettingsInput;
};

export type MutationUpdateVirtualContributorArgs = {
  virtualContributorData: UpdateVirtualContributorInput;
};

export type MutationUpdateVirtualPersonaArgs = {
  virtualPersonaData: UpdateVirtualPersonaInput;
};

export type MutationUpdateVisualArgs = {
  updateData: UpdateVisualInput;
};

export type MutationUpdateWhiteboardArgs = {
  whiteboardData: UpdateWhiteboardInput;
};

export type MutationUpdateWhiteboardContentArgs = {
  whiteboardData: UpdateWhiteboardContentInput;
};

export type MutationUpdateWhiteboardTemplateArgs = {
  whiteboardTemplateInput: UpdateWhiteboardTemplateInput;
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
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Organization = Groupable & {
  __typename?: 'Organization';
  /** All Users that are admins of this Organization. */
  admins?: Maybe<Array<User>>;
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** All Users that are associated with this Organization. */
  associates?: Maybe<Array<User>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** Organization contact email */
  contactEmail?: Maybe<Scalars['String']>;
  /** Domain name; what is verified, eg. alkem.io */
  domain?: Maybe<Scalars['String']>;
  /** Group defined on this organization. */
  group?: Maybe<UserGroup>;
  /** Groups defined on this organization. */
  groups?: Maybe<Array<UserGroup>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Legal name - required if hosting an Space */
  legalEntityName?: Maybe<Scalars['String']>;
  /** Metrics about the activity within this Organization. */
  metrics?: Maybe<Array<Nvp>>;
  /** The roles on this Organization for the currently logged in user. */
  myRoles?: Maybe<Array<OrganizationRole>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** All Users that are owners of this Organization. */
  owners?: Maybe<Array<User>>;
  /** The preferences for this Organization */
  preferences: Array<Preference>;
  /** The profile for this Organization. */
  profile: Profile;
  /** The StorageAggregator for managing storage buckets in use by this Organization */
  storageAggregator?: Maybe<StorageAggregator>;
  verification: OrganizationVerification;
  /** Organization website */
  website?: Maybe<Scalars['String']>;
};

export type OrganizationGroupArgs = {
  ID: Scalars['UUID'];
};

export type OrganizationAuthorizationResetInput = {
  /** The identifier of the Organization whose Authorization Policy should be reset. */
  organizationID: Scalars['UUID_NAMEID_EMAIL'];
};

export type OrganizationFilterInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  nameID?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export enum OrganizationPreferenceType {
  AuthorizationOrganizationMatchDomain = 'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN',
}

export enum OrganizationRole {
  Admin = 'ADMIN',
  Associate = 'ASSOCIATE',
  Owner = 'OWNER',
}

export type OrganizationVerification = {
  __typename?: 'OrganizationVerification';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** Organization verification type */
  status: OrganizationVerificationEnum;
};

export enum OrganizationVerificationEnum {
  NotVerified = 'NOT_VERIFIED',
  VerifiedManualAttestation = 'VERIFIED_MANUAL_ATTESTATION',
}

export type OrganizationVerificationEventInput = {
  eventName: Scalars['String'];
  organizationVerificationID: Scalars['UUID'];
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
  /** The Communications for the platform */
  communication: Communication;
  /** Alkemio configuration. Provides configuration to external services in the Alkemio ecosystem. */
  configuration: Config;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Details about an Innovation Hubs on the platform. If the arguments are omitted, the current Innovation Hub you are in will be returned. */
  innovationHub?: Maybe<InnovationHub>;
  /** List of Innovation Hubs on the platform */
  innovationHubs: Array<InnovationHub>;
  /** The latest release discussion. */
  latestReleaseDiscussion?: Maybe<LatestReleaseDiscussion>;
  /** The Innovation Library for the platform */
  library: Library;
  /** Alkemio Services Metadata. */
  metadata: Metadata;
  /** The StorageAggregator with documents in use by Users + Organizations on the Platform. */
  storageAggregator: StorageAggregator;
};

export type PlatformInnovationHubArgs = {
  id?: InputMaybe<Scalars['UUID_NAMEID']>;
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
  /** URL to the terms of usage for the platform */
  terms: Scalars['String'];
  /** URL where users can get tips and tricks */
  tips: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The comments on this Post. */
  comments: Room;
  /** The user that created this Post */
  createdBy?: Maybe<User>;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Post. */
  profile: Profile;
  /** The Post type, e.g. knowledge, idea, stakeholder persona etc. */
  type: Scalars['String'];
};

export type PostTemplate = {
  __typename?: 'PostTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The default description to show to users filling our a new instance. */
  defaultDescription: Scalars['Markdown'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
  /** The type for this Post. */
  type: Scalars['String'];
};

export type Preference = {
  __typename?: 'Preference';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The definition for the Preference */
  definition: PreferenceDefinition;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Value of the preference */
  value: Scalars['String'];
};

export type PreferenceDefinition = {
  __typename?: 'PreferenceDefinition';
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
  /** Preference value type */
  valueType: PreferenceValueType;
};

export enum PreferenceType {
  AuthorizationOrganizationMatchDomain = 'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN',
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationCalloutPublished = 'NOTIFICATION_CALLOUT_PUBLISHED',
  NotificationCommentReply = 'NOTIFICATION_COMMENT_REPLY',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationMention = 'NOTIFICATION_COMMUNICATION_MENTION',
  NotificationCommunicationMessage = 'NOTIFICATION_COMMUNICATION_MESSAGE',
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
  /** The taglie for this entity. */
  tagline: Scalars['String'];
  /** The default or named tagset. */
  tagset?: Maybe<Tagset>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
  /** A type of entity that this Profile is being used with. */
  type?: Maybe<ProfileType>;
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
  CalloutTemplate = 'CALLOUT_TEMPLATE',
  Challenge = 'CHALLENGE',
  CommunityGuidelines = 'COMMUNITY_GUIDELINES',
  ContributionLink = 'CONTRIBUTION_LINK',
  Discussion = 'DISCUSSION',
  InnovationFlow = 'INNOVATION_FLOW',
  InnovationFlowTemplate = 'INNOVATION_FLOW_TEMPLATE',
  InnovationHub = 'INNOVATION_HUB',
  InnovationPack = 'INNOVATION_PACK',
  MemberGuidelinesTemplate = 'MEMBER_GUIDELINES_TEMPLATE',
  Opportunity = 'OPPORTUNITY',
  Organization = 'ORGANIZATION',
  Post = 'POST',
  PostTemplate = 'POST_TEMPLATE',
  Space = 'SPACE',
  User = 'USER',
  UserGroup = 'USER_GROUP',
  VirtualContributor = 'VIRTUAL_CONTRIBUTOR',
  VirtualPersona = 'VIRTUAL_PERSONA',
  Whiteboard = 'WHITEBOARD',
  WhiteboardTemplate = 'WHITEBOARD_TEMPLATE',
}

export type Query = {
  __typename?: 'Query';
  /** An account. If no ID is specified then the first Account is returned. */
  account: Account;
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
  /** Ask the chat engine for guidance. */
  askChatGuidanceQuestion: ChatGuidanceResult;
  /** Ask the virtual persona engine for guidance. */
  askVirtualPersonaQuestion: VirtualPersonaResult;
  /** Get supported credential metadata */
  getSupportedVerifiedCredentialMetadata: Array<CredentialMetadataOutput>;
  /** Allow direct lookup of entities from the domain model */
  lookup: LookupQueryResults;
  /** Information about the current authenticated user */
  me: MeQueryResults;
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
  /** Search the platform for terms supplied */
  search: ISearchResults;
  /** An space. If no ID is specified then the first Space is returned. */
  space: Space;
  /** The Spaces on this platform; If accessed through an Innovation Hub will return ONLY the Spaces defined in it. */
  spaces: Array<Space>;
  /** The Spaces on this platform */
  spacesPaginated: PaginatedSpaces;
  /** Information about a specific task */
  task: Task;
  /** All tasks with filtering applied */
  tasks: Array<Task>;
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
  /** The VirtualContributors on this platform */
  virtualContributors: Array<VirtualContributor>;
  /** A particular VirtualPersona */
  virtualPersona: VirtualPersona;
  /** The VirtualPersonas on this platform */
  virtualPersonas: Array<VirtualPersona>;
};

export type QueryAccountArgs = {
  ID: Scalars['UUID_NAMEID'];
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

export type QueryAskChatGuidanceQuestionArgs = {
  chatData: ChatGuidanceInput;
};

export type QueryAskVirtualPersonaQuestionArgs = {
  chatData: VirtualPersonaQuestionInput;
};

export type QueryOrganizationArgs = {
  ID: Scalars['UUID_NAMEID'];
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
};

export type QueryRolesOrganizationArgs = {
  rolesData: RolesOrganizationInput;
};

export type QueryRolesUserArgs = {
  rolesData: RolesUserInput;
};

export type QuerySearchArgs = {
  searchData: SearchInput;
};

export type QuerySpaceArgs = {
  ID: Scalars['UUID_NAMEID'];
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

export type QueryUserArgs = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
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
};

export type QueryUsersWithAuthorizationCredentialArgs = {
  credentialsCriteriaData: UsersWithAuthorizationCredentialInput;
};

export type QueryVirtualContributorArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryVirtualContributorsArgs = {
  filter?: InputMaybe<ContributorFilterInput>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryVirtualPersonaArgs = {
  ID: Scalars['UUID'];
};

export type Question = {
  __typename?: 'Question';
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
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
  /** Description of this reference */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Name of the reference, e.g. Linkedin, Twitter etc. */
  name: Scalars['String'];
  /** URI of the reference */
  uri: Scalars['String'];
};

export type Relation = {
  __typename?: 'Relation';
  actorName: Scalars['String'];
  actorRole: Scalars['String'];
  actorType: Scalars['String'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  description: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  type: Scalars['String'];
};

export type RelayPaginatedSpace = {
  __typename?: 'RelayPaginatedSpace';
  /** The Account that this Space is part of. */
  account: Account;
  /** The Agent representing this Space. */
  agent: Agent;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The collaboration for the Space. */
  collaboration: Collaboration;
  /** Get the Community for the Space.  */
  community: Community;
  /** The context for the space. */
  context: Context;
  /** The date for the creation of this Space. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The level of this Space, representing the number of Spaces above this one. */
  level: Scalars['Float'];
  /** Metrics about activity within this Space. */
  metrics?: Maybe<Array<Nvp>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for the Space. */
  profile: Profile;
  /** The settings for this Space. */
  settings: SpaceSettings;
  /** The StorageAggregator in use by this Space */
  storageAggregator: StorageAggregator;
  /** A particular subspace, either by its ID or nameID */
  subspace: Space;
  /** The subspaces for the space. */
  subspaces: Array<Space>;
  /** The Type of the Space e.g. space/challenge/opportunity. */
  type: SpaceType;
};

export type RelayPaginatedSpaceSubspaceArgs = {
  ID: Scalars['UUID_NAMEID'];
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

export type RelayPaginatedUser = {
  __typename?: 'RelayPaginatedUser';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  /** The direct rooms this user is a member of */
  directRooms?: Maybe<Array<DirectRoom>>;
  /** The email address for this User. */
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Can a message be sent to this User. */
  isContactable: Scalars['Boolean'];
  lastName: Scalars['String'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The phone number for this User. */
  phone: Scalars['String'];
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** The Profile for this User. */
  profile: Profile;
  /** The StorageAggregator for managing storage buckets in use by this User */
  storageAggregator?: Maybe<StorageAggregator>;
};

export type RelayPaginatedUserEdge = {
  __typename?: 'RelayPaginatedUserEdge';
  node: RelayPaginatedUser;
};

export type RelayPaginatedUserPageInfo = {
  __typename?: 'RelayPaginatedUserPageInfo';
  /** The last cursor of the page result */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicate whether more items exist after the returned ones */
  hasNextPage: Scalars['Boolean'];
  /** Indicate whether more items exist before the returned ones */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor of the page result */
  startCursor?: Maybe<Scalars['String']>;
};

export type RemoveCommunityRoleFromOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
  role: CommunityRole;
};

export type RemoveCommunityRoleFromUserInput = {
  communityID: Scalars['UUID'];
  role: CommunityRole;
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveCommunityRoleFromVirtualInput = {
  communityID: Scalars['UUID'];
  role: CommunityRole;
  virtualContributorID: Scalars['UUID_NAMEID'];
};

export type RemoveGlobalAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveGlobalCommunityAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveGlobalSpacesAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationAdminInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationAssociateInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationOwnerInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RevokeAuthorizationCredentialInput = {
  /** The resource to which access is being removed. */
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
  /** The user from whom the credential is being removed. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RevokeOrganizationAuthorizationCredentialInput = {
  /** The Organization from whom the credential is being removed. */
  organizationID: Scalars['UUID'];
  /** The resource to which access is being removed. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  type: AuthorizationCredential;
};

export type RolesOrganizationInput = {
  /** Return membership in Spaces matching the provided filter. */
  filter?: InputMaybe<SpaceFilterInput>;
  /** The ID of the organization to retrieve the roles of. */
  organizationID: Scalars['UUID_NAMEID'];
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
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
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
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** The Space ID */
  spaceID: Scalars['String'];
  /** Details of the Challenges the user is a member of */
  subspaces: Array<RolesResultCommunity>;
  /** Details of the Opportunities the Contributor is a member of */
  subsubspaces: Array<RolesResultCommunity>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type RolesUserInput = {
  /** Return membership in Spaces matching the provided filter. */
  filter?: InputMaybe<SpaceFilterInput>;
  /** The ID of the user to retrieve the roles of. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type Room = {
  __typename?: 'Room';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Messages in this Room. */
  messages: Array<Message>;
  /** The number of messages in the Room. */
  messagesCount: Scalars['Float'];
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
  searchInSpaceFilter?: InputMaybe<Scalars['UUID_NAMEID']>;
  /** Expand the search to includes Tagsets with the provided names. Max 2. */
  tagsetNames?: InputMaybe<Array<Scalars['String']>>;
  /** The terms to be searched for within this Space. Max 5. */
  terms: Array<Scalars['String']>;
  /** Restrict the search to only the specified entity types. Values allowed: space, subspace, user, group, organization, Default is all. */
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
  User = 'USER',
  Usergroup = 'USERGROUP',
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

export type Sentry = {
  __typename?: 'Sentry';
  /** Flag indicating if the client should use Sentry for monitoring. */
  enabled: Scalars['Boolean'];
  /** URL to the Sentry endpoint. */
  endpoint: Scalars['String'];
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

export type Source = {
  __typename?: 'Source';
  /** The title of the source */
  title?: Maybe<Scalars['String']>;
  /** The URI of the source */
  uri?: Maybe<Scalars['String']>;
};

export type Space = {
  __typename?: 'Space';
  /** The Account that this Space is part of. */
  account: Account;
  /** The Agent representing this Space. */
  agent: Agent;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The collaboration for the Space. */
  collaboration: Collaboration;
  /** Get the Community for the Space.  */
  community: Community;
  /** The context for the space. */
  context: Context;
  /** The date for the creation of this Space. */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The level of this Space, representing the number of Spaces above this one. */
  level: Scalars['Float'];
  /** Metrics about activity within this Space. */
  metrics?: Maybe<Array<Nvp>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for the Space. */
  profile: Profile;
  /** The settings for this Space. */
  settings: SpaceSettings;
  /** The StorageAggregator in use by this Space */
  storageAggregator: StorageAggregator;
  /** A particular subspace, either by its ID or nameID */
  subspace: Space;
  /** The subspaces for the space. */
  subspaces: Array<Space>;
  /** The Type of the Space e.g. space/challenge/opportunity. */
  type: SpaceType;
};

export type SpaceSubspaceArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type SpaceSubspacesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type SpaceDefaults = {
  __typename?: 'SpaceDefaults';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The innovation flow template to use for new Challenges / Opportunities. */
  innovationFlowTemplate?: Maybe<InnovationFlowTemplate>;
};

export type SpaceFilterInput = {
  /** Return Spaces with a Visibility matching one of the provided types. */
  visibilities?: InputMaybe<Array<SpaceVisibility>>;
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
  /** Flag to control if members can create callouts. */
  allowMembersToCreateCallouts: Scalars['Boolean'];
  /** Flag to control if members can create subspaces. */
  allowMembersToCreateSubspaces: Scalars['Boolean'];
  /** Flag to control if ability to contribute is inherited from parent Space. */
  inheritMembershipRights: Scalars['Boolean'];
};

export type SpaceSettingsMembership = {
  __typename?: 'SpaceSettingsMembership';
  /** The membership policy in usage for this Space */
  policy: CommunityMembershipPolicy;
  /** The organizations that are trusted to Join as members for this Space */
  trustedOrganizations: Array<Scalars['UUID']>;
};

export type SpaceSettingsPrivacy = {
  __typename?: 'SpaceSettingsPrivacy';
  /** The privacy mode for this Space */
  mode: SpacePrivacyMode;
};

export enum SpaceType {
  Challenge = 'CHALLENGE',
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
};

export type StorageAggregatorParent = {
  __typename?: 'StorageAggregatorParent';
  /** The display name. */
  displayName: Scalars['String'];
  /** The UUID of the parent entity. */
  id: Scalars['UUID'];
  /** The Type of the parent Entity. */
  type: SpaceType;
  /** The URL that can be used to access the parent entity. */
  url: Scalars['String'];
};

export type StorageBucket = {
  __typename?: 'StorageBucket';
  /** Mime types allowed to be stored on this StorageBucket. */
  allowedMimeTypes: Array<Scalars['String']>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
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
};

export type StorageBucketDocumentArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type StorageBucketDocumentsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
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
  communicationDiscussionUpdated: Discussion;
  /** Received on verified credentials change */
  profileVerifiedCredential: ProfileCredentialVerified;
  /** Receive Room event */
  roomEvents: RoomEventSubscriptionResult;
  /** Receive new Subspaces created on the Space. */
  subspaceCreated: SubspaceCreated;
};

export type SubscriptionActivityCreatedArgs = {
  input: ActivityCreatedSubscriptionInput;
};

export type SubscriptionCalloutPostCreatedArgs = {
  calloutID: Scalars['UUID'];
};

export type SubscriptionCommunicationDiscussionUpdatedArgs = {
  communicationID: Scalars['UUID'];
};

export type SubscriptionRoomEventsArgs = {
  roomID: Scalars['UUID'];
};

export type SubscriptionSubspaceCreatedArgs = {
  spaceID: Scalars['UUID'];
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
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
  type: TagsetType;
};

export type TagsetArgs = {
  /** Return only Callouts that match one of the tagsets and any of the tags in them. */
  name: Scalars['String'];
  /** A list of tags to include. */
  tags: Array<Scalars['String']>;
};

export enum TagsetReservedName {
  CalloutGroup = 'CALLOUT_GROUP',
  Capabilities = 'CAPABILITIES',
  Default = 'DEFAULT',
  FlowState = 'FLOW_STATE',
  Keywords = 'KEYWORDS',
  Skills = 'SKILLS',
}

export type TagsetTemplate = {
  __typename?: 'TagsetTemplate';
  allowedValues: Array<Scalars['String']>;
  /** For Tagsets of type SELECT_ONE, the default selected value. */
  defaultSelectedValue?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  type: TagsetType;
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

export type TemplatesSet = {
  __typename?: 'TemplatesSet';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The CalloutTemplates in this TemplatesSet. */
  calloutTemplates: Array<CalloutTemplate>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A single InnovationFlowTemplate */
  innovationFlowTemplate?: Maybe<InnovationFlowTemplate>;
  /** The InnovationFlowTemplates in this TemplatesSet. */
  innovationFlowTemplates: Array<InnovationFlowTemplate>;
  /** The total number of InnovationFlowTemplates in this TemplatesSet. */
  innovationFlowTemplatesCount: Scalars['Float'];
  /** A single PostTemplate */
  postTemplate?: Maybe<PostTemplate>;
  /** The PostTemplates in this TemplatesSet. */
  postTemplates: Array<PostTemplate>;
  /** The total number of PostTemplates in this TemplatesSet. */
  postTemplatesCount: Scalars['Float'];
  /** A single WhiteboardTemplate */
  whiteboardTemplate?: Maybe<WhiteboardTemplate>;
  /** The WhiteboardTemplates in this TemplatesSet. */
  whiteboardTemplates: Array<WhiteboardTemplate>;
  /** The total number of WhiteboardTemplates in this TemplatesSet. */
  whiteboardTemplatesCount: Scalars['Float'];
};

export type TemplatesSetInnovationFlowTemplateArgs = {
  ID: Scalars['UUID'];
};

export type TemplatesSetPostTemplateArgs = {
  ID: Scalars['UUID'];
};

export type TemplatesSetWhiteboardTemplateArgs = {
  ID: Scalars['UUID'];
};

export type Timeline = {
  __typename?: 'Timeline';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Innovation Library for the timeline */
  calendar: Calendar;
  /** The ID of the entity */
  id: Scalars['UUID'];
};

export type UpdateAccountPlatformSettingsInput = {
  /** The identifier for the Account whose license etc is to be updated. */
  accountID: Scalars['UUID'];
  /** Update the host Organization for the Account. */
  hostID?: InputMaybe<Scalars['UUID_NAMEID']>;
  /** Update the license settings for the Account. */
  license?: InputMaybe<UpdateLicenseInput>;
};

export type UpdateActorInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  impact?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
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

export type UpdateCalloutFramingInput = {
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  whiteboard?: InputMaybe<UpdateWhiteboardInput>;
};

export type UpdateCalloutInput = {
  ID: Scalars['UUID'];
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

export type UpdateCalloutPublishInfoInput = {
  /** The identifier for the Callout whose publisher is to be updated. */
  calloutID: Scalars['String'];
  /** The timestamp to set for the publishing of the Callout. */
  publishDate?: InputMaybe<Scalars['Float']>;
  /** The identifier of the publisher of the Callout. */
  publisherID?: InputMaybe<Scalars['UUID_NAMEID_EMAIL']>;
};

export type UpdateCalloutTemplateInput = {
  ID: Scalars['UUID'];
  contributionDefaults?: InputMaybe<UpdateCalloutContributionDefaultsInput>;
  contributionPolicy?: InputMaybe<UpdateCalloutContributionPolicyInput>;
  framing?: InputMaybe<UpdateCalloutFramingInput>;
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
};

export type UpdateCalloutVisibilityInput = {
  /** The identifier for the Callout whose visibility is to be updated. */
  calloutID: Scalars['String'];
  /** Send a notification on publishing. */
  sendNotification?: InputMaybe<Scalars['Boolean']>;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type UpdateCollaborationCalloutsSortOrderInput = {
  /** The IDs of the callouts to update the sort order on */
  calloutIDs: Array<Scalars['UUID_NAMEID']>;
  collaborationID: Scalars['UUID'];
};

export type UpdateCommunityApplicationFormInput = {
  communityID: Scalars['UUID'];
  formData: UpdateFormInput;
};

export type UpdateCommunityGuidelinesInput = {
  /** ID of the CommunityGuidelines */
  communityGuidelinesID: Scalars['UUID'];
  /** The Profile for this community guidelines. */
  profile: UpdateProfileInput;
};

export type UpdateContextInput = {
  impact?: InputMaybe<Scalars['Markdown']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type UpdateDiscussionInput = {
  ID: Scalars['UUID'];
  /** The category for the Discussion */
  category?: InputMaybe<DiscussionCategory>;
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

export type UpdateEcosystemModelInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
};

export type UpdateFeatureFlagInput = {
  /** Is this feature flag enabled? */
  enabled: Scalars['Boolean'];
  /** The name of the feature flag */
  name: Scalars['String'];
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

export type UpdateInnovationFlowFromTemplateInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The InnovationFlow template whose State definition will be used for the Innovation Flow */
  innovationFlowTemplateID: Scalars['UUID'];
};

export type UpdateInnovationFlowInput = {
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

export type UpdateInnovationFlowTemplateInput = {
  ID: Scalars['UUID'];
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  states?: InputMaybe<Array<UpdateInnovationFlowStateInput>>;
};

export type UpdateInnovationHubInput = {
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** A list of Spaces to include in this Innovation Hub. Only valid when type 'list' is used. */
  spaceListFilter?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** Spaces with which visibility this Innovation Hub will display. Only valid when type 'visibility' is used. */
  spaceVisibilityFilter?: InputMaybe<SpaceVisibility>;
};

export type UpdateInnovationPackInput = {
  /** The ID or NameID of the InnovationPack. */
  ID: Scalars['UUID_NAMEID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Update the provider Organization for the InnovationPack. */
  providerOrgID?: InputMaybe<Scalars['UUID_NAMEID']>;
};

export type UpdateLicenseInput = {
  /** Update the feature flags for the License. */
  featureFlags?: InputMaybe<Array<UpdateFeatureFlagInput>>;
  /** Visibility of the Space. */
  visibility?: InputMaybe<SpaceVisibility>;
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

export type UpdateOrganizationInput = {
  /** The ID or NameID of the Organization to update. */
  ID: Scalars['UUID_NAMEID'];
  contactEmail?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationPreferenceInput = {
  /** ID of the Organization */
  organizationID: Scalars['UUID_NAMEID'];
  /** Type of the organization preference */
  type: OrganizationPreferenceType;
  value: Scalars['String'];
};

export type UpdatePostInput = {
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  type?: InputMaybe<Scalars['String']>;
};

export type UpdatePostTemplateInput = {
  ID: Scalars['UUID'];
  /** The default description to be pre-filled when users create Posts based on this template. */
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  /** The type of Posts created from this Template. */
  type?: InputMaybe<Scalars['String']>;
};

export type UpdateProfileDirectInput = {
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<UpdateLocationInput>;
  profileID: Scalars['UUID'];
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  /** A memorable short description for this entity. */
  tagline?: InputMaybe<Scalars['String']>;
  tagsets?: InputMaybe<Array<UpdateTagsetInput>>;
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

export type UpdateSpaceDefaultsInput = {
  /** The ID for the InnovationFlowtemplate to use for new Subspaces. */
  flowTemplateID: Scalars['UUID'];
  /** The identifier for the Space whose Defaaults are to be updated. */
  spaceID: Scalars['UUID'];
};

export type UpdateSpaceInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** The Profile of the InnovationFlow of this entity. */
  innovationFlowData?: InputMaybe<UpdateInnovationFlowInput>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateSpacePlatformSettingsInput = {
  /** Upate the URL path for the Space. */
  nameID: Scalars['NameID'];
  /** The identifier for the Space whose license etc is to be updated. */
  spaceID: Scalars['UUID'];
};

export type UpdateSpaceSettingsCollaborationInput = {
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
  /** The membership policy in usage for this Space */
  policy: CommunityMembershipPolicy;
  /** The organizations that are trusted to Join as members for this Space */
  trustedOrganizations: Array<Scalars['UUID']>;
};

export type UpdateSpaceSettingsPrivacyInput = {
  mode: SpacePrivacyMode;
};

export type UpdateTagsetInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  tags: Array<Scalars['String']>;
};

export type UpdateUserGroupInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
  accountUpn?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
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
  type: UserPreferenceType;
  /** ID of the User */
  userID: Scalars['UUID_NAMEID_EMAIL'];
  value: Scalars['String'];
};

export type UpdateVirtualContributorInput = {
  /** The ID of the Virtual Contributor to update. */
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateVirtualPersonaInput = {
  ID: Scalars['UUID'];
  engine: VirtualPersonaEngine;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  prompt: Scalars['JSON'];
};

export type UpdateVisualInput = {
  alternativeText?: InputMaybe<Scalars['String']>;
  uri: Scalars['String'];
  visualID: Scalars['String'];
};

export type UpdateWhiteboardContentInput = {
  ID: Scalars['UUID'];
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateWhiteboardInput = {
  ID: Scalars['UUID'];
  contentUpdatePolicy?: InputMaybe<ContentUpdatePolicy>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateWhiteboardTemplateInput = {
  ID: Scalars['UUID'];
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
};

export type User = {
  __typename?: 'User';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  /** The direct rooms this user is a member of */
  directRooms?: Maybe<Array<DirectRoom>>;
  /** The email address for this User. */
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Can a message be sent to this User. */
  isContactable: Scalars['Boolean'];
  lastName: Scalars['String'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The phone number for this User. */
  phone: Scalars['String'];
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** The Profile for this User. */
  profile: Profile;
  /** The StorageAggregator for managing storage buckets in use by this User */
  storageAggregator?: Maybe<StorageAggregator>;
};

export type UserAuthorizationPrivilegesInput = {
  /** The authorization definition to evaluate the user credentials against. */
  authorizationID: Scalars['UUID'];
  /** The user to evaluate privileges granted based on held credentials. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type UserAuthorizationResetInput = {
  /** The identifier of the User whose Authorization Policy should be reset. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
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
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Users that are members of this User Group. */
  members?: Maybe<Array<User>>;
  /** Containing entity for this UserGroup. */
  parent?: Maybe<Groupable>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
};

export enum UserPreferenceType {
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationCalloutPublished = 'NOTIFICATION_CALLOUT_PUBLISHED',
  NotificationCommentReply = 'NOTIFICATION_COMMENT_REPLY',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationMention = 'NOTIFICATION_COMMUNICATION_MENTION',
  NotificationCommunicationMessage = 'NOTIFICATION_COMMUNICATION_MESSAGE',
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

export type UserSendMessageInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The user a message is being sent to */
  receivingUserID: Scalars['String'];
};

export type UsersWithAuthorizationCredentialInput = {
  /** The resource to which a credential needs to be bound. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  /** The type of credential. */
  type: AuthorizationCredential;
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

export type VirtualContributor = {
  __typename?: 'VirtualContributor';
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The profile for this Virtual. */
  profile: Profile;
  /** The StorageAggregator for managing storage buckets in use by this Virtual */
  storageAggregator?: Maybe<StorageAggregator>;
  /** The virtual persona being used by this virtual contributor */
  virtualPersona: VirtualPersona;
};

export type VirtualContributorAuthorizationResetInput = {
  /** The identifier of the Virtual Contributor whose Authorization Policy should be reset. */
  virtualContributorID: Scalars['UUID'];
};

export type VirtualPersona = {
  __typename?: 'VirtualPersona';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Virtual Persona Engine being used by this virtual persona. */
  engine?: Maybe<VirtualPersonaEngine>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this VirtualPersona. */
  profile: Profile;
  /** The prompt used by this Virtual Persona */
  prompt: Scalars['String'];
};

export type VirtualPersonaAuthorizationResetInput = {
  /** The identifier of the Virtual Persona whose Authorization Policy should be reset. */
  virtualPersonaID: Scalars['UUID_NAMEID_EMAIL'];
};

export enum VirtualPersonaEngine {
  AlkemioDigileefomgeving = 'ALKEMIO_DIGILEEFOMGEVING',
  AlkemioWelcome = 'ALKEMIO_WELCOME',
  CommunityManager = 'COMMUNITY_MANAGER',
  Guidance = 'GUIDANCE',
}

export type VirtualPersonaQuestionInput = {
  /** The question that is being asked. */
  question: Scalars['String'];
  /** Virtual Persona Type. */
  virtualPersonaID: Scalars['UUID'];
};

export type VirtualPersonaResult = {
  __typename?: 'VirtualPersonaResult';
  /** The answer to the question */
  answer: Scalars['String'];
  /** The id of the answer; null if an error was returned */
  id?: Maybe<Scalars['String']>;
  /** The original question */
  question: Scalars['String'];
  /** The sources used to answer the question */
  sources?: Maybe<Array<Source>>;
};

export type Visual = {
  __typename?: 'Visual';
  allowedTypes: Array<Scalars['String']>;
  alternativeText?: Maybe<Scalars['String']>;
  /** Post ratio width / height. */
  aspectRatio: Scalars['Float'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
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
  uri: Scalars['String'];
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

export type WhiteboardTemplate = {
  __typename?: 'WhiteboardTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The visual content of the Whiteboard. */
  content: Scalars['WhiteboardContent'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
};

export type MyPrivilegesFragment = {
  __typename?: 'Authorization';
  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
};

export type AssignUserAsBetaTesterMutationVariables = Exact<{
  input: GrantAuthorizationCredentialInput;
}>;

export type AssignUserAsBetaTesterMutation = {
  __typename?: 'Mutation';
  grantCredentialToUser: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AssignUserAsGlobalAdminMutationVariables = Exact<{
  input: AssignGlobalAdminInput;
}>;

export type AssignUserAsGlobalAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsGlobalAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AssignUserAsGlobalCommunityAdminMutationVariables = Exact<{
  input: AssignGlobalCommunityAdminInput;
}>;

export type AssignUserAsGlobalCommunityAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsGlobalCommunityAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AssignUserAsGlobalSpacesAdminMutationVariables = Exact<{
  input: AssignGlobalSpacesAdminInput;
}>;

export type AssignUserAsGlobalSpacesAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsGlobalSpacesAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AssignUserAsOrganizationOwnerMutationVariables = Exact<{
  input: AssignOrganizationOwnerInput;
}>;

export type AssignUserAsOrganizationOwnerMutation = {
  __typename?: 'Mutation';
  assignUserAsOrganizationOwner: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsBetaTesterMutationVariables = Exact<{
  input: RevokeAuthorizationCredentialInput;
}>;

export type RemoveUserAsBetaTesterMutation = {
  __typename?: 'Mutation';
  revokeCredentialFromUser: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsGlobalAdminMutationVariables = Exact<{
  input: RemoveGlobalAdminInput;
}>;

export type RemoveUserAsGlobalAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsGlobalAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsGlobalCommunityAdminMutationVariables = Exact<{
  input: RemoveGlobalCommunityAdminInput;
}>;

export type RemoveUserAsGlobalCommunityAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsGlobalCommunityAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsGlobalSpacesAdminMutationVariables = Exact<{
  input: RemoveGlobalSpacesAdminInput;
}>;

export type RemoveUserAsGlobalSpacesAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsGlobalSpacesAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsOrganizationOwnerMutationVariables = Exact<{
  input: RemoveOrganizationOwnerInput;
}>;

export type RemoveUserAsOrganizationOwnerMutation = {
  __typename?: 'Mutation';
  removeUserAsOrganizationOwner: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
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
  nameID: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        did?: string | undefined;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
          | undefined;
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
      }
    | undefined;
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
          nameID: string;
          agent?:
            | {
                __typename?: 'Agent';
                id: string;
                did?: string | undefined;
                credentials?:
                  | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
                  | undefined;
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
              }
            | undefined;
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
          nameID: string;
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
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
                      anonymousReadAccess: boolean;
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
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          type?: ProfileType | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                          type?: ProfileType | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                        };
                      }
                    | undefined;
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
  filterCalloutGroups?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
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
          callouts: Array<{
            __typename?: 'Callout';
            id: string;
            nameID: string;
            type: CalloutType;
            activity: number;
            sortOrder: number;
            framing: {
              __typename?: 'CalloutFraming';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                calloutGroupName?:
                  | {
                      __typename?: 'Tagset';
                      id: string;
                      name: string;
                      tags: Array<string>;
                      allowedValues: Array<string>;
                      type: TagsetType;
                    }
                  | undefined;
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
              };
            };
          }>;
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
  callouts: Array<{
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    activity: number;
    sortOrder: number;
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        calloutGroupName?:
          | {
              __typename?: 'Tagset';
              id: string;
              name: string;
              tags: Array<string>;
              allowedValues: Array<string>;
              type: TagsetType;
            }
          | undefined;
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
      };
    };
  }>;
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
    framing: {
      __typename?: 'CalloutFraming';
      id: string;
      profile: {
        __typename?: 'Profile';
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
      };
    };
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

export type UpdateInnovationFlowStatesFromTemplateMutationVariables = Exact<{
  innovationFlowId: Scalars['UUID'];
  innovationFlowTemplateId: Scalars['UUID'];
}>;

export type UpdateInnovationFlowStatesFromTemplateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowStatesFromTemplate: {
    __typename?: 'InnovationFlow';
    id: string;
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
    currentState: { __typename?: 'InnovationFlowState'; displayName: string; description: string };
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

export type SpaceInnovationFlowsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceInnovationFlowsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            innovationFlowTemplates: Array<{
              __typename?: 'InnovationFlowTemplate';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
          }
        | undefined;
    };
  };
};

export type InnovationFlowTemplateCardFragment = {
  __typename?: 'InnovationFlowTemplate';
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
    visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
  };
  states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
};

export type SpaceInnovationFlowTemplatesLibraryQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceInnovationFlowTemplatesLibraryQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            innovationFlowTemplates: Array<{
              __typename?: 'InnovationFlowTemplate';
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
            }>;
          }
        | undefined;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }
        | undefined;
    };
  };
};

export type PlatformInnovationFlowTemplatesLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformInnovationFlowTemplatesLibraryQuery = {
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              innovationFlowTemplates: Array<{
                __typename?: 'InnovationFlowTemplate';
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
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
                states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
              }>;
            }
          | undefined;
      }>;
    };
  };
};

export type InnovationFlowTemplateStatesQueryVariables = Exact<{
  innovationFlowTemplateId: Scalars['UUID'];
}>;

export type InnovationFlowTemplateStatesQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    innovationFlowTemplate?:
      | {
          __typename?: 'InnovationFlowTemplate';
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
            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
          states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
        }
      | undefined;
  };
};

export type UpdateInnovationFlowMutationVariables = Exact<{
  input: UpdateInnovationFlowInput;
}>;

export type UpdateInnovationFlowMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type InnovationPackProfilePageQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
}>;

export type InnovationPackProfilePageQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      innovationPack?:
        | {
            __typename?: 'InnovationPack';
            id: string;
            nameID: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            provider?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              tagline: string;
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
                    description?: string | undefined;
                    uri: string;
                  }>
                | undefined;
            };
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  whiteboardTemplates: Array<{
                    __typename?: 'WhiteboardTemplate';
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }>;
                  postTemplates: Array<{
                    __typename?: 'PostTemplate';
                    id: string;
                    defaultDescription: string;
                    type: string;
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
                  }>;
                  innovationFlowTemplates: Array<{
                    __typename?: 'InnovationFlowTemplate';
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
                  }>;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ActivityLogMemberJoinedFragment = {
  __typename?: 'ActivityLogEntryMemberJoined';
  user: {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
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
    nameID: string;
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
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

export type ActivityLogOpportunityCreatedFragment = {
  __typename?: 'ActivityLogEntryOpportunityCreated';
  subsubspace: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
            nameID: string;
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
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
          };
        }
      | {
          __typename?: 'ActivityLogEntryMemberJoined';
          id: string;
          createdDate: Date;
          type: ActivityEventType;
          user: {
            __typename?: 'User';
            id: string;
            firstName: string;
            lastName: string;
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
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
    nameID: string;
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
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryMemberJoined_Fragment = {
  __typename?: 'ActivityLogEntryMemberJoined';
  id: string;
  createdDate: Date;
  type: ActivityEventType;
  user: {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
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
    profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          nameID: string;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        user: {
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
        parentNameID: string;
        message: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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

export type CollaborationAuthorizationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CollaborationAuthorizationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CollaborationPrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CollaborationPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration: {
      __typename?: 'Collaboration';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type CollaborationPrivilegesFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type SpaceCalloutTemplatesLibraryQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCalloutTemplatesLibraryQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            calloutTemplates: Array<{
              __typename?: 'CalloutTemplate';
              id: string;
              type: CalloutType;
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
              contributionPolicy: {
                __typename?: 'CalloutContributionPolicy';
                allowedContributionTypes: Array<CalloutContributionType>;
                state: CalloutState;
              };
            }>;
          }
        | undefined;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }
        | undefined;
    };
  };
};

export type PlatformCalloutTemplatesLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformCalloutTemplatesLibraryQuery = {
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              calloutTemplates: Array<{
                __typename?: 'CalloutTemplate';
                id: string;
                type: CalloutType;
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
                contributionPolicy: {
                  __typename?: 'CalloutContributionPolicy';
                  allowedContributionTypes: Array<CalloutContributionType>;
                  state: CalloutState;
                };
              }>;
            }
          | undefined;
      }>;
    };
  };
};

export type CalloutTemplateContentQueryVariables = Exact<{
  calloutTemplateId: Scalars['UUID'];
}>;

export type CalloutTemplateContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calloutTemplate?:
      | {
          __typename?: 'CalloutTemplate';
          id: string;
          type: CalloutType;
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
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
        }
      | undefined;
  };
};

export type CalloutTemplateCardFragment = {
  __typename?: 'CalloutTemplate';
  id: string;
  type: CalloutType;
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
  contributionPolicy: {
    __typename?: 'CalloutContributionPolicy';
    allowedContributionTypes: Array<CalloutContributionType>;
    state: CalloutState;
  };
};

export type UpdateCalloutsSortOrderMutationVariables = Exact<{
  collaborationId: Scalars['UUID'];
  calloutIds: Array<Scalars['UUID_NAMEID']> | Scalars['UUID_NAMEID'];
}>;

export type UpdateCalloutsSortOrderMutation = {
  __typename?: 'Mutation';
  updateCalloutsSortOrder: Array<{ __typename?: 'Callout'; id: string; sortOrder: number }>;
};

export type DashboardTopCalloutsFragment = {
  __typename?: 'Collaboration';
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

export type PostTemplatesOnCalloutCreationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type PostTemplatesOnCalloutCreationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            postTemplates: Array<{
              __typename?: 'PostTemplate';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
          }
        | undefined;
    };
  };
};

export type WhiteboardTemplatesOnCalloutCreationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardTemplatesOnCalloutCreationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            whiteboardTemplates: Array<{
              __typename?: 'WhiteboardTemplate';
              id: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
          }
        | undefined;
    };
  };
};

export type ProfileDisplayNameFragment = { __typename?: 'Profile'; id: string; displayName: string };

export type CreateCalloutMutationVariables = Exact<{
  calloutData: CreateCalloutOnCollaborationInput;
}>;

export type CreateCalloutMutation = {
  __typename?: 'Mutation';
  createCalloutOnCollaboration: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
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
                  anonymousReadAccess: boolean;
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
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
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
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type UpdateCalloutMutationVariables = Exact<{
  calloutData: UpdateCalloutInput;
}>;

export type UpdateCalloutMutation = {
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
        groupNameTagset?:
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

export type UpdateCalloutVisibilityMutationVariables = Exact<{
  calloutData: UpdateCalloutVisibilityInput;
}>;

export type UpdateCalloutVisibilityMutation = {
  __typename?: 'Mutation';
  updateCalloutVisibility: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
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
                  anonymousReadAccess: boolean;
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
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
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
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                  };
                }
              | undefined;
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

export type CalloutIdQueryVariables = Exact<{
  calloutNameId: Scalars['UUID_NAMEID'];
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CalloutIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration: {
      __typename?: 'Collaboration';
      id: string;
      callouts: Array<{ __typename?: 'Callout'; id: string }>;
    };
  };
};

export type CreatePostFromContributeTabMutationVariables = Exact<{
  postData: CreateContributionOnCalloutInput;
}>;

export type CreatePostFromContributeTabMutation = {
  __typename?: 'Mutation';
  createContributionOnCallout: {
    __typename?: 'CalloutContribution';
    post?:
      | {
          __typename?: 'Post';
          id: string;
          nameID: string;
          type: string;
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
            visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
        }
      | undefined;
  };
};

export type RemoveCommentFromCalloutMutationVariables = Exact<{
  messageData: RoomRemoveMessageInput;
}>;

export type RemoveCommentFromCalloutMutation = { __typename?: 'Mutation'; removeMessageOnRoom: string };

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
    post: {
      __typename?: 'Post';
      id: string;
      type: string;
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
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  type: string;
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
  type: string;
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

export type PostCardFragment = {
  __typename?: 'Post';
  id: string;
  type: string;
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

export type CalloutsQueryVariables = Exact<{
  collaborationId: Scalars['UUID'];
  groups?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  calloutIds?: InputMaybe<Array<Scalars['UUID_NAMEID']> | Scalars['UUID_NAMEID']>;
}>;

export type CalloutsQuery = {
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
          callouts: Array<{
            __typename?: 'Callout';
            id: string;
            nameID: string;
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
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
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
          }>;
        }
      | undefined;
  };
};

export type CollaborationWithCalloutsFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  callouts: Array<{
    __typename?: 'Callout';
    id: string;
    nameID: string;
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
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
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
  }>;
};

export type CalloutFragment = {
  __typename?: 'Callout';
  id: string;
  nameID: string;
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
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
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

export type CalloutDetailsQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type CalloutDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          nameID: string;
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
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
                      anonymousReadAccess: boolean;
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
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          url: string;
                          type?: ProfileType | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                          type?: ProfileType | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                        };
                      }
                    | undefined;
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
  nameID: string;
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
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
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
                __typename?: 'User';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  url: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                };
              }
            | undefined;
        }>;
      }
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
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

export type PostTemplateCardFragment = {
  __typename?: 'PostTemplate';
  id: string;
  defaultDescription: string;
  type: string;
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
};

export type SpacePostTemplatesLibraryQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpacePostTemplatesLibraryQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            postTemplates: Array<{
              __typename?: 'PostTemplate';
              id: string;
              defaultDescription: string;
              type: string;
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
            }>;
          }
        | undefined;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }
        | undefined;
    };
  };
};

export type PlatformPostTemplatesLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformPostTemplatesLibraryQuery = {
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              postTemplates: Array<{
                __typename?: 'PostTemplate';
                id: string;
                defaultDescription: string;
                type: string;
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
              }>;
            }
          | undefined;
      }>;
    };
  };
};

export type PostQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
  postNameId: Scalars['UUID_NAMEID'];
}>;

export type PostQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          type: CalloutType;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  nameID: string;
                  type: string;
                  createdDate: Date;
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
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          displayName: string;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                            __typename?: 'User';
                            id: string;
                            profile: {
                              __typename?: 'Profile';
                              id: string;
                              displayName: string;
                              url: string;
                              type?: ProfileType | undefined;
                              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                                | { __typename?: 'Location'; id: string; city: string; country: string }
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
                              type?: ProfileType | undefined;
                              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                                | { __typename?: 'Location'; id: string; city: string; country: string }
                                | undefined;
                            };
                          }
                        | undefined;
                    }>;
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type PostDashboardFragment = {
  __typename?: 'Post';
  id: string;
  nameID: string;
  type: string;
  createdDate: Date;
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
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  createdBy?:
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
          | undefined;
      }>;
      sender?:
        | {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }
        | undefined;
    }>;
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
    type: string;
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

export type PostSettingsQueryVariables = Exact<{
  postNameId: Scalars['UUID_NAMEID'];
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
          nameID: string;
          type: CalloutType;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            id: string;
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  nameID: string;
                  type: string;
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
          postNames: Array<{
            __typename?: 'CalloutContribution';
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type PostSettingsFragment = {
  __typename?: 'Post';
  id: string;
  nameID: string;
  type: string;
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
  nameID: string;
  type: CalloutType;
  contributions: Array<{
    __typename?: 'CalloutContribution';
    id: string;
    post?:
      | {
          __typename?: 'Post';
          id: string;
          nameID: string;
          type: string;
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
  postNames: Array<{
    __typename?: 'CalloutContribution';
    post?:
      | { __typename?: 'Post'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
      | undefined;
  }>;
};

export type PostProviderQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
  postNameId: Scalars['UUID_NAMEID'];
}>;

export type PostProviderQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          type: CalloutType;
          contributions: Array<{
            __typename?: 'CalloutContribution';
            post?:
              | {
                  __typename?: 'Post';
                  id: string;
                  nameID: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  comments: { __typename?: 'Room'; id: string; messagesCount: number };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type PostProvidedFragment = {
  __typename?: 'Post';
  id: string;
  nameID: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  comments: { __typename?: 'Room'; id: string; messagesCount: number };
};

export type DeletePostMutationVariables = Exact<{
  input: DeletePostInput;
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
      | {
          __typename?: 'Post';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; url: string };
        }
      | undefined;
  };
};

export type InnovationPackWithProviderFragment = {
  __typename?: 'InnovationPack';
  id: string;
  nameID: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
  provider?:
    | {
        __typename?: 'Organization';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
};

export type TemplateProviderProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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

export type WhiteboardTemplateCardFragment = {
  __typename?: 'WhiteboardTemplate';
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
    visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
  };
};

export type SpaceWhiteboardTemplatesLibraryQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceWhiteboardTemplatesLibraryQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            whiteboardTemplates: Array<{
              __typename?: 'WhiteboardTemplate';
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }>;
          }
        | undefined;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
          }
        | undefined;
    };
  };
};

export type PlatformWhiteboardTemplatesLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformWhiteboardTemplatesLibraryQuery = {
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              whiteboardTemplates: Array<{
                __typename?: 'WhiteboardTemplate';
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
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }>;
            }
          | undefined;
      }>;
    };
  };
};

export type WhiteboardLockedByDetailsQueryVariables = Exact<{
  ids: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type WhiteboardLockedByDetailsQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  }>;
};

export type LockedByDetailsFragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
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
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | undefined;
};

export type WhiteboardSummaryFragment = {
  __typename?: 'Whiteboard';
  id: string;
  nameID: string;
  createdDate: Date;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type WhiteboardContentFragment = { __typename?: 'Whiteboard'; id: string; content: string };

export type WhiteboardTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardTemplatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            whiteboardTemplates: Array<{
              __typename?: 'WhiteboardTemplate';
              id: string;
              content: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
            }>;
          }
        | undefined;
    };
  };
};

export type CreateWhiteboardWhiteboardTemplateFragment = {
  __typename?: 'WhiteboardTemplate';
  id: string;
  content: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
};

export type CalloutWithWhiteboardFragment = {
  __typename?: 'Callout';
  id: string;
  nameID: string;
  type: CalloutType;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        anonymousReadAccess: boolean;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      }
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
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
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
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  }>;
};

export type CollaborationWithWhiteboardDetailsFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts: Array<{
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
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
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
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
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
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
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                  };
                }
              | undefined;
          }
        | undefined;
    };
  }>;
};

export type WhiteboardFromCalloutQueryVariables = Exact<{
  calloutId: Scalars['UUID'];
  whiteboardId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardFromCalloutQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          type: CalloutType;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                anonymousReadAccess: boolean;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              }
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
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        };
                      }
                    | undefined;
                }
              | undefined;
          };
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
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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

export type PlatformTemplateWhiteboardContentsQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID'];
}>;

export type PlatformTemplateWhiteboardContentsQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      innovationPack?:
        | {
            __typename?: 'InnovationPack';
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        id: string;
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
                      }
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
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
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  input: UpdateWhiteboardInput;
}>;

export type UpdateWhiteboardMutation = {
  __typename?: 'Mutation';
  updateWhiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type UpdateWhiteboardContentMutationVariables = Exact<{
  input: UpdateWhiteboardContentInput;
}>;

export type UpdateWhiteboardContentMutation = {
  __typename?: 'Mutation';
  updateWhiteboardContent: { __typename?: 'Whiteboard'; id: string; content: string };
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

export type OrganizationPreferencesQueryVariables = Exact<{
  orgId: Scalars['UUID_NAMEID'];
}>;

export type OrganizationPreferencesQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
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
  };
};

export type UpdatePreferenceOnOrganizationMutationVariables = Exact<{
  preferenceData: UpdateOrganizationPreferenceInput;
}>;

export type UpdatePreferenceOnOrganizationMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnOrganization: { __typename?: 'Preference'; id: string; value: string };
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
    firstName: string;
    lastName: string;
    id: string;
    nameID: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
    latestReleaseDiscussion?: { __typename?: 'LatestReleaseDiscussion'; id: string; nameID: string } | undefined;
  };
};

export type CreateDiscussionMutationVariables = Exact<{
  input: CommunicationCreateDiscussionInput;
}>;

export type CreateDiscussionMutation = {
  __typename?: 'Mutation';
  createDiscussion: {
    __typename?: 'Discussion';
    id: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: DiscussionCategory;
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
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    category: DiscussionCategory;
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
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
  category: DiscussionCategory;
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
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    communication: {
      __typename?: 'Communication';
      id: string;
      discussionCategories: Array<DiscussionCategory>;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
      discussions?:
        | Array<{
            __typename?: 'Discussion';
            id: string;
            category: DiscussionCategory;
            timestamp?: number | undefined;
            createdBy?: string | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              tagline: string;
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
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
          }>
        | undefined;
    };
  };
};

export type DiscussionCardFragment = {
  __typename?: 'Discussion';
  id: string;
  category: DiscussionCategory;
  timestamp?: number | undefined;
  createdBy?: string | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
};

export type PlatformDiscussionQueryVariables = Exact<{
  discussionId: Scalars['String'];
}>;

export type PlatformDiscussionQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    communication: {
      __typename?: 'Communication';
      id: string;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
      discussion?:
        | {
            __typename?: 'Discussion';
            id: string;
            createdBy?: string | undefined;
            timestamp?: number | undefined;
            category: DiscussionCategory;
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
                      __typename?: 'User';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        type?: ProfileType | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                        type?: ProfileType | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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

export type CommunicationDiscussionUpdatedSubscriptionVariables = Exact<{
  communicationID: Scalars['UUID'];
}>;

export type CommunicationDiscussionUpdatedSubscription = {
  __typename?: 'Subscription';
  communicationDiscussionUpdated: {
    __typename?: 'Discussion';
    id: string;
    nameID: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: DiscussionCategory;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          url: string;
          type?: ProfileType | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
          type?: ProfileType | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        };
      }
    | undefined;
};

export type SenderProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  url: string;
  type?: ProfileType | undefined;
  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
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
        | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
        | undefined;
    }>;
    sender?:
      | {
          __typename?: 'User';
          id: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            url: string;
            type?: ProfileType | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
            type?: ProfileType | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        }
      | undefined;
  }>;
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
    sender?: { __typename?: 'User'; id: string } | { __typename?: 'VirtualContributor'; id: string } | undefined;
  };
};

export type MentionableUsersQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  communityId?: Scalars['UUID'];
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
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
  };
  lookup?: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
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
    sender?: { __typename?: 'User'; id: string } | { __typename?: 'VirtualContributor'; id: string } | undefined;
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
                  __typename?: 'User';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    url: string;
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                    type?: ProfileType | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                      __typename?: 'User';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        displayName: string;
                        url: string;
                        type?: ProfileType | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                        type?: ProfileType | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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

export type PlatformUpdatesRoomQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformUpdatesRoomQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    communication: { __typename?: 'Communication'; id: string; updates: { __typename?: 'Room'; id: string } };
  };
};

export type CommunityUserPrivilegesWithParentCommunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CommunityUserPrivilegesWithParentCommunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    community: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
        };
      }>;
    };
  };
};

export type CommunityUserPrivilegesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityUserPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    spaceCommunity: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
  lookup: {
    __typename?: 'LookupQueryResults';
    applicationCommunity?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type JoinCommunityMutationVariables = Exact<{
  joiningData: CommunityJoinInput;
}>;

export type JoinCommunityMutation = {
  __typename?: 'Mutation';
  joinCommunity: { __typename?: 'Community'; id: string };
};

export type SpaceApplicationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceApplicationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    community: {
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
    };
  };
};

export type ApplyForCommunityMembershipMutationVariables = Exact<{
  input: CommunityApplyInput;
}>;

export type ApplyForCommunityMembershipMutation = {
  __typename?: 'Mutation';
  applyForCommunityMembership: { __typename?: 'Application'; id: string };
};

export type EventOnApplicationMutationVariables = Exact<{
  input: ApplicationEventInput;
}>;

export type EventOnApplicationMutation = {
  __typename?: 'Mutation';
  eventOnApplication: {
    __typename?: 'Application';
    id: string;
    lifecycle: {
      __typename?: 'Lifecycle';
      id: string;
      nextEvents?: Array<string> | undefined;
      state?: string | undefined;
    };
  };
};

export type CommunityApplicationsInvitationsQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityApplicationsInvitationsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          applications: Array<{
            __typename?: 'Application';
            id: string;
            createdDate: Date;
            updatedDate: Date;
            lifecycle: {
              __typename?: 'Lifecycle';
              id: string;
              state?: string | undefined;
              nextEvents?: Array<string> | undefined;
            };
            user: {
              __typename?: 'User';
              id: string;
              nameID: string;
              email: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            };
            questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
          }>;
          invitations: Array<{
            __typename?: 'Invitation';
            id: string;
            createdDate: Date;
            updatedDate: Date;
            lifecycle: {
              __typename?: 'Lifecycle';
              id: string;
              state?: string | undefined;
              nextEvents?: Array<string> | undefined;
            };
            user: {
              __typename?: 'User';
              id: string;
              nameID: string;
              email: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            };
          }>;
          invitationsExternal: Array<{
            __typename?: 'InvitationExternal';
            id: string;
            createdDate: Date;
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
  lifecycle: {
    __typename?: 'Lifecycle';
    id: string;
    state?: string | undefined;
    nextEvents?: Array<string> | undefined;
  };
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    email: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
};

export type AdminCommunityInvitationFragment = {
  __typename?: 'Invitation';
  id: string;
  createdDate: Date;
  updatedDate: Date;
  lifecycle: {
    __typename?: 'Lifecycle';
    id: string;
    state?: string | undefined;
    nextEvents?: Array<string> | undefined;
  };
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    email: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
};

export type AdminCommunityInvitationExternalFragment = {
  __typename?: 'InvitationExternal';
  id: string;
  createdDate: Date;
  email: string;
};

export type AdminCommunityCandidateMemberFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  email: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  };
};

export type CommunityApplicationFormQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityApplicationFormQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
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

export type UpdateCommunityApplicationQuestionsMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  formData: UpdateFormInput;
}>;

export type UpdateCommunityApplicationQuestionsMutation = {
  __typename?: 'Mutation';
  updateCommunityApplicationForm: { __typename?: 'Community'; id: string };
};

export type CommunityDetailsFragment = {
  __typename?: 'Community';
  id: string;
  myMembershipStatus?: CommunityMembershipStatus | undefined;
  communication: {
    __typename?: 'Communication';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SpaceCommunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  includeDetails?: InputMaybe<Scalars['Boolean']>;
}>;

export type SpaceCommunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    community: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      communication: {
        __typename?: 'Communication';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      };
    };
  };
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
  communityGuidelinesData: UpdateCommunityGuidelinesInput;
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

export type EntityDashboardCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  memberUsers: Array<{
    __typename?: 'User';
    id: string;
    isContactable: boolean;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
  }>;
  leadOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  }>;
  memberOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
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
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type DashboardContributingUserFragment = {
  __typename?: 'User';
  id: string;
  isContactable: boolean;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
};

export type DashboardContributingOrganizationFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
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

export type DashboardLeadUserFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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

export type CommunityPageMembersFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  email: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type CreateGroupOnCommunityMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnCommunityMutation = {
  __typename?: 'Mutation';
  createGroupOnCommunity: {
    __typename?: 'UserGroup';
    id: string;
    profile?: { __typename?: 'Profile'; id: string; displayName: string } | undefined;
  };
};

export type CommunityGroupsQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityGroupsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          groups: Array<{
            __typename?: 'UserGroup';
            id: string;
            profile?: { __typename?: 'Profile'; displayName: string } | undefined;
          }>;
        }
      | undefined;
  };
};

export type CommunityMembersQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityMembersQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers: Array<{
            __typename?: 'User';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }>;
        }
      | undefined;
  };
};

export type AvailableUsersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type AvailableUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type BasicOrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type CommunityMembersListQueryVariables = Exact<{
  communityId: Scalars['UUID'];
  spaceId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpaceHost?: InputMaybe<Scalars['Boolean']>;
}>;

export type CommunityMembersListQuery = {
  __typename?: 'Query';
  space?: {
    __typename?: 'Space';
    account: {
      __typename?: 'Account';
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
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
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
            };
          }
        | undefined;
    };
  };
  lookup: {
    __typename?: 'LookupQueryResults';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers: Array<{
            __typename?: 'User';
            id: string;
            nameID: string;
            email: string;
            firstName: string;
            lastName: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }>;
          leadUsers: Array<{
            __typename?: 'User';
            id: string;
            nameID: string;
            email: string;
            firstName: string;
            lastName: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }>;
          memberOrganizations: Array<{
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
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
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
            };
          }>;
          leadOrganizations: Array<{
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
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
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
            };
          }>;
          virtualContributorsInRole: Array<{
            __typename?: 'VirtualContributor';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }>;
          policy: {
            __typename?: 'CommunityPolicy';
            id: string;
            lead: {
              __typename?: 'CommunityRolePolicy';
              maxOrg: number;
              maxUser: number;
              minOrg: number;
              minUser: number;
            };
            member: {
              __typename?: 'CommunityRolePolicy';
              maxOrg: number;
              maxUser: number;
              minOrg: number;
              minUser: number;
            };
          };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type CommunityAvailableMembersQueryVariables = Exact<{
  communityId: Scalars['UUID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type CommunityAvailableMembersQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    availableMembers?:
      | {
          __typename?: 'Community';
          id: string;
          availableMemberUsers: {
            __typename?: 'PaginatedUsers';
            users: Array<{
              __typename?: 'User';
              id: string;
              email: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
            pageInfo: {
              __typename?: 'PageInfo';
              startCursor?: string | undefined;
              endCursor?: string | undefined;
              hasNextPage: boolean;
            };
          };
        }
      | undefined;
  };
};

export type CommunityMembersDetailsFragment = {
  __typename?: 'Community';
  id: string;
  memberUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    email: string;
    firstName: string;
    lastName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  }>;
  leadUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    email: string;
    firstName: string;
    lastName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  }>;
  memberOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
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
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
    };
  }>;
  leadOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
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
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
    };
  }>;
  virtualContributorsInRole: Array<{
    __typename?: 'VirtualContributor';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  }>;
  policy: {
    __typename?: 'CommunityPolicy';
    id: string;
    lead: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
    member: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type CommunityPolicyFragment = {
  __typename?: 'CommunityPolicy';
  id: string;
  lead: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
  member: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
};

export type CommunityAvailableLeadUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableLeadUsers: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      email: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type CommunityAvailableMemberUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableMemberUsers: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      email: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type CommunityMemberUserFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  };
};

export type CommunityMemberVirtualContributorFragment = {
  __typename?: 'VirtualContributor';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  };
};

export type AvailableUserFragment = {
  __typename?: 'User';
  id: string;
  email: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type AvailableVirtualContributorsQueryVariables = Exact<{ [key: string]: never }>;

export type AvailableVirtualContributorsQuery = {
  __typename?: 'Query';
  virtualContributors: Array<{
    __typename?: 'VirtualContributor';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
};

export type AddVirtualContributorToCommunityMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  virtualContributorId: Scalars['UUID_NAMEID'];
}>;

export type AddVirtualContributorToCommunityMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToVirtual: { __typename?: 'VirtualContributor'; id: string };
};

export type RemoveVirtualContributorFromCommunityMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  virtualContributorId: Scalars['UUID_NAMEID'];
}>;

export type RemoveVirtualContributorFromCommunityMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromVirtual: { __typename?: 'VirtualContributor'; id: string };
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
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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

export type AssignUserAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AssignUserAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type AssignUserAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AssignUserAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type RemoveUserAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RemoveUserAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type RemoveUserAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RemoveUserAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type AssignOrganizationAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type AssignOrganizationAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToOrganization: { __typename?: 'Organization'; id: string };
};

export type AssignOrganizationAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type AssignOrganizationAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToOrganization: { __typename?: 'Organization'; id: string };
};

export type RemoveOrganizationAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type RemoveOrganizationAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromOrganization: { __typename?: 'Organization'; id: string };
};

export type RemoveOrganizationAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type RemoveOrganizationAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromOrganization: { __typename?: 'Organization'; id: string };
};

export type AssignCommunityRoleToUserMutationVariables = Exact<{
  communityID: Scalars['UUID'];
  role: CommunityRole;
  userID: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AssignCommunityRoleToUserMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type RemoveCommunityRoleFromUserMutationVariables = Exact<{
  communityID: Scalars['UUID'];
  role: CommunityRole;
  userID: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RemoveCommunityRoleFromUserMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type ContributorsPageOrganizationsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type ContributorsPageOrganizationsQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      orgProfile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
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
}>;

export type ContributorsPageUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
      isContactable: boolean;
      agent?:
        | {
            __typename?: 'Agent';
            id: string;
            credentials?:
              | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
              | undefined;
          }
        | undefined;
      userProfile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?: { __typename?: 'Location'; city: string; country: string } | undefined;
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

export type OrganizationContributorPaginatedFragment = {
  __typename?: 'PaginatedOrganization';
  organization: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    orgProfile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
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
  nameID: string;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  orgProfile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type UserContributorPaginatedFragment = {
  __typename?: 'PaginatedUsers';
  users: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    isContactable: boolean;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          credentials?:
            | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    userProfile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; city: string; country: string } | undefined;
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
  nameID: string;
  isContactable: boolean;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  userProfile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    location?: { __typename?: 'Location'; city: string; country: string } | undefined;
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

export type AssociatedOrganizationQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
}>;

export type AssociatedOrganizationQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  };
};

export type AssociatedOrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    tagline: string;
    displayName: string;
    description?: string | undefined;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
};

export type AssignUserToOrganizationMutationVariables = Exact<{
  input: AssignOrganizationAssociateInput;
}>;

export type AssignUserToOrganizationMutation = {
  __typename?: 'Mutation';
  assignUserToOrganization: {
    __typename?: 'Organization';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserFromOrganizationMutationVariables = Exact<{
  input: RemoveOrganizationAssociateInput;
}>;

export type RemoveUserFromOrganizationMutation = {
  __typename?: 'Mutation';
  removeUserFromOrganization: {
    __typename?: 'Organization';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AssignUserAsOrganizationAdminMutationVariables = Exact<{
  input: AssignOrganizationAdminInput;
}>;

export type AssignUserAsOrganizationAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsOrganizationAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type RemoveUserAsOrganizationAdminMutationVariables = Exact<{
  input: RemoveOrganizationAdminInput;
}>;

export type RemoveUserAsOrganizationAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsOrganizationAdmin: {
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type OrganizationAssociatesQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationAssociatesQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    associates?:
      | Array<{
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }>
      | undefined;
  };
};

export type RolesOrganizationQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID'];
}>;

export type RolesOrganizationQuery = {
  __typename?: 'Query';
  rolesOrganization: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      nameID: string;
      id: string;
      roles: Array<string>;
      displayName: string;
      visibility: SpaceVisibility;
      subspaces: Array<{
        __typename?: 'RolesResultCommunity';
        nameID: string;
        id: string;
        displayName: string;
        roles: Array<string>;
      }>;
    }>;
  };
};

export type OrganizationInfoFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  contactEmail?: string | undefined;
  domain?: string | undefined;
  website?: string | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
    references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
    location?:
      | {
          __typename?: 'Location';
          id: string;
          country: string;
          city: string;
          addressLine1: string;
          addressLine2: string;
          stateOrProvince: string;
          postalCode: string;
        }
      | undefined;
  };
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  associates?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        isContactable: boolean;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          visual?:
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
        };
      }>
    | undefined;
  admins?: Array<{ __typename?: 'User'; id: string }> | undefined;
  owners?: Array<{ __typename?: 'User'; id: string }> | undefined;
};

export type OrganizationInfoQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
  includeAssociates?: InputMaybe<Scalars['Boolean']>;
}>;

export type OrganizationInfoQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    contactEmail?: string | undefined;
    domain?: string | undefined;
    website?: string | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
      references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
      location?:
        | {
            __typename?: 'Location';
            id: string;
            country: string;
            city: string;
            addressLine1: string;
            addressLine2: string;
            stateOrProvince: string;
            postalCode: string;
          }
        | undefined;
    };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    associates?:
      | Array<{
          __typename?: 'User';
          id: string;
          nameID: string;
          isContactable: boolean;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            location?: { __typename?: 'Location'; country: string; city: string } | undefined;
            visual?:
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
          };
        }>
      | undefined;
    admins?: Array<{ __typename?: 'User'; id: string }> | undefined;
    owners?: Array<{ __typename?: 'User'; id: string }> | undefined;
  };
};

export type OrganizationCardFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type OrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
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
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
    tagline: string;
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
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
    nameID: string;
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
      tagline: string;
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
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type OrganizationGroupQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type OrganizationGroupQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    associates?:
      | Array<{
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }>
      | undefined;
    group?:
      | {
          __typename?: 'UserGroup';
          id: string;
          profile?:
            | {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                description?: string | undefined;
                tagline: string;
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
                references?:
                  | Array<{
                      __typename?: 'Reference';
                      id: string;
                      uri: string;
                      name: string;
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
              }
            | undefined;
        }
      | undefined;
  };
};

export type OrganizationGroupsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationGroupsQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    groups?:
      | Array<{
          __typename?: 'UserGroup';
          id: string;
          profile?: { __typename?: 'Profile'; id: string; displayName: string } | undefined;
        }>
      | undefined;
  };
};

export type OrganizationProfileInfoQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationProfileInfoQuery = {
  __typename?: 'Query';
  organization: {
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
      tagline: string;
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
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type OrganizationsListQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
  filterCredentials?: InputMaybe<Array<AuthorizationCredential> | AuthorizationCredential>;
}>;

export type OrganizationsListQuery = {
  __typename?: 'Query';
  organizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  }>;
};

export type DeleteInvitationMutationVariables = Exact<{
  invitationId: Scalars['UUID'];
}>;

export type DeleteInvitationMutation = {
  __typename?: 'Mutation';
  deleteInvitation: { __typename?: 'Invitation'; id: string };
};

export type DeleteExternalInvitationMutationVariables = Exact<{
  invitationId: Scalars['UUID'];
}>;

export type DeleteExternalInvitationMutation = {
  __typename?: 'Mutation';
  deleteInvitationExternal: { __typename?: 'InvitationExternal'; id: string };
};

export type InvitationStateEventMutationVariables = Exact<{
  eventName: Scalars['String'];
  invitationId: Scalars['UUID'];
}>;

export type InvitationStateEventMutation = {
  __typename?: 'Mutation';
  eventOnCommunityInvitation: {
    __typename?: 'Invitation';
    id: string;
    lifecycle: {
      __typename?: 'Lifecycle';
      id: string;
      nextEvents?: Array<string> | undefined;
      state?: string | undefined;
    };
  };
};

export type InviteExistingUserMutationVariables = Exact<{
  userIds: Array<Scalars['UUID']> | Scalars['UUID'];
  communityId: Scalars['UUID'];
  message?: InputMaybe<Scalars['String']>;
}>;

export type InviteExistingUserMutation = {
  __typename?: 'Mutation';
  inviteExistingUserForCommunityMembership: Array<{ __typename?: 'Invitation'; id: string }>;
};

export type InviteExternalUserMutationVariables = Exact<{
  email: Scalars['String'];
  communityId: Scalars['UUID'];
  message?: InputMaybe<Scalars['String']>;
}>;

export type InviteExternalUserMutation = {
  __typename?: 'Mutation';
  inviteForCommunityMembershipByEmail:
    | { __typename?: 'Invitation'; id: string }
    | { __typename?: 'InvitationExternal'; id: string };
};

export type PendingMembershipsSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  fetchDetails?: Scalars['Boolean'];
  visualType: VisualType;
  fetchCommunityGuidelines?: Scalars['Boolean'];
}>;

export type PendingMembershipsSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      tagline: string;
      id: string;
      url: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
  };
};

export type PendingMembershipsUserQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type PendingMembershipsUserQuery = {
  __typename?: 'Query';
  user: { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

export type PendingMembershipsJourneyProfileFragment = {
  __typename?: 'Profile';
  tagline: string;
  id: string;
  url: string;
  displayName: string;
  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
};

export type PendingMembershipsMembershipsFragment = {
  __typename?: 'Community';
  id: string;
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
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceContributionDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline: string;
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
    context: { __typename?: 'Context'; id: string };
    community: { __typename?: 'Community'; id: string };
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
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
  };
};

export type UserSelectorUserDetailsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserSelectorUserDetailsQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type UserSelectorUserInformationFragment = {
  __typename?: 'User';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type PlatformLevelAuthorizationQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformLevelAuthorizationQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type UserAvatarsQueryVariables = Exact<{
  ids: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type UserAvatarsQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type UserCardFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  isContactable: boolean;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type GroupDetailsFragment = {
  __typename?: 'UserGroup';
  id: string;
  profile?: { __typename?: 'Profile'; id: string; displayName: string } | undefined;
};

export type GroupInfoFragment = {
  __typename?: 'UserGroup';
  id: string;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        description?: string | undefined;
        tagline: string;
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
        references?:
          | Array<{ __typename?: 'Reference'; id: string; uri: string; name: string; description?: string | undefined }>
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
      }
    | undefined;
};

export type GroupMembersFragment = {
  __typename?: 'User';
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type UserAgentFragment = {
  __typename?: 'User';
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        did?: string | undefined;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
          | undefined;
      }
    | undefined;
};

export type UserDetailsFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  accountUpn: string;
  agent?:
    | {
        __typename?: 'Agent';
        credentials?:
          | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    tagline: string;
    description?: string | undefined;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type UserRolesDetailsFragment = {
  __typename?: 'ContributorRoles';
  spaces: Array<{
    __typename?: 'RolesResultSpace';
    id: string;
    nameID: string;
    displayName: string;
    roles: Array<string>;
    visibility: SpaceVisibility;
    subspaces: Array<{
      __typename?: 'RolesResultCommunity';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
    }>;
    subsubspaces: Array<{
      __typename?: 'RolesResultCommunity';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
    }>;
    userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
  }>;
  organizations: Array<{
    __typename?: 'RolesResultOrganization';
    id: string;
    nameID: string;
    displayName: string;
    roles: Array<string>;
    userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
  }>;
};

export type AssignUserToGroupMutationVariables = Exact<{
  input: AssignUserGroupMemberInput;
}>;

export type AssignUserToGroupMutation = {
  __typename?: 'Mutation';
  assignUserToGroup: {
    __typename?: 'UserGroup';
    id: string;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }>
      | undefined;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type DeleteGroupMutationVariables = Exact<{
  input: DeleteUserGroupInput;
}>;

export type DeleteGroupMutation = {
  __typename?: 'Mutation';
  deleteUserGroup: {
    __typename?: 'UserGroup';
    id: string;
    profile?: { __typename?: 'Profile'; displayName: string } | undefined;
  };
};

export type DeleteUserMutationVariables = Exact<{
  input: DeleteUserInput;
}>;

export type DeleteUserMutation = { __typename?: 'Mutation'; deleteUser: { __typename?: 'User'; id: string } };

export type RemoveUserFromGroupMutationVariables = Exact<{
  input: RemoveUserGroupMemberInput;
}>;

export type RemoveUserFromGroupMutation = {
  __typename?: 'Mutation';
  removeUserFromGroup: {
    __typename?: 'UserGroup';
    id: string;
    profile?: { __typename?: 'Profile'; displayName: string } | undefined;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }>
      | undefined;
  };
};

export type UpdateGroupMutationVariables = Exact<{
  input: UpdateUserGroupInput;
}>;

export type UpdateGroupMutation = {
  __typename?: 'Mutation';
  updateUserGroup: {
    __typename?: 'UserGroup';
    id: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          description?: string | undefined;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; uri: string; name: string; description?: string | undefined }>
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
        }
      | undefined;
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
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type UpdatePreferenceOnUserMutationVariables = Exact<{
  input: UpdateUserPreferenceInput;
}>;

export type UpdatePreferenceOnUserMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnUser: { __typename?: 'Preference'; id: string; value: string };
};

export type UserQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
            | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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

export type UserNotificationsPreferencesQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserNotificationsPreferencesQuery = {
  __typename?: 'Query';
  user: {
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
  };
};

export type UserProfileQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    isContactable: boolean;
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
            | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
      visibility: SpaceVisibility;
      subspaces: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      subsubspaces: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
    organizations: Array<{
      __typename?: 'RolesResultOrganization';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
  };
  platform: {
    __typename?: 'Platform';
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type UsersWithCredentialsQueryVariables = Exact<{
  input: UsersWithAuthorizationCredentialInput;
}>;

export type UsersWithCredentialsQuery = {
  __typename?: 'Query';
  usersWithAuthorizationCredential: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  }>;
};

export type UsersWithCredentialsSimpleListQueryVariables = Exact<{
  input: UsersWithAuthorizationCredentialInput;
}>;

export type UsersWithCredentialsSimpleListQuery = {
  __typename?: 'Query';
  usersWithAuthorizationCredential: Array<{
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
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
          nameID: string;
          firstName: string;
          lastName: string;
          email: string;
          gender: string;
          phone: string;
          accountUpn: string;
          agent?:
            | {
                __typename?: 'Agent';
                id: string;
                did?: string | undefined;
                credentials?:
                  | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
                  | undefined;
              }
            | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline: string;
            description?: string | undefined;
            location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
    applications: Array<{
      __typename?: 'ApplicationForRoleResult';
      id: string;
      communityID: string;
      displayName: string;
      state: string;
      spaceID: string;
      subspaceID?: string | undefined;
      subsubspaceID?: string | undefined;
    }>;
    invitations: Array<{
      __typename?: 'InvitationForRoleResult';
      id: string;
      spaceID: string;
      subspaceID?: string | undefined;
      subsubspaceID?: string | undefined;
      welcomeMessage?: string | undefined;
      createdBy: string;
      createdDate: Date;
      state: string;
    }>;
  };
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
      nameID: string;
      email: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type SpaceCommunityContributorsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCommunityContributorsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
            verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          }
        | undefined;
    };
    community: {
      __typename?: 'Community';
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        isContactable: boolean;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        isContactable: boolean;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          description?: string | undefined;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      }>;
    };
  };
};

export type CommunityMembersFragment = {
  __typename?: 'Community';
  leadUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
  memberUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
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
  leadOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  }>;
  memberOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  }>;
};

export type UserContributionDisplayNamesQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserContributionDisplayNamesQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      displayName: string;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; displayName: string }>;
      subsubspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; displayName: string }>;
    }>;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string; displayName: string }>;
  };
};

export type UserContributionsQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserContributionsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      nameID: string;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; nameID: string }>;
      subsubspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; nameID: string }>;
    }>;
  };
};

export type UserOrganizationIdsQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserOrganizationIdsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string }>;
  };
};

export type ContextDetailsFragment = {
  __typename?: 'Context';
  id: string;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
};

export type ContextDetailsProviderFragment = {
  __typename?: 'Context';
  id: string;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
};

export type FullLocationFragment = {
  __typename?: 'Location';
  id: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  stateOrProvince: string;
  postalCode: string;
};

export type InnovationHubAvailableSpacesQueryVariables = Exact<{ [key: string]: never }>;

export type InnovationHubAvailableSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }
        | undefined;
    };
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
};

export type InnovationHubSpaceFragment = {
  __typename?: 'Space';
  id: string;
  account: {
    __typename?: 'Account';
    id: string;
    license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }
      | undefined;
  };
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type AdminInnovationHubsListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminInnovationHubsListQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHubs: Array<{
      __typename?: 'InnovationHub';
      id: string;
      nameID: string;
      subdomain: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
  };
};

export type DeleteInnovationHubMutationVariables = Exact<{
  innovationHubId: Scalars['UUID'];
}>;

export type DeleteInnovationHubMutation = {
  __typename?: 'Mutation';
  deleteInnovationHub: { __typename?: 'InnovationHub'; id: string };
};

export type InnovationHubProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  description?: string | undefined;
  tagline: string;
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

export type AdminInnovationHubQueryVariables = Exact<{
  innovationHubId: Scalars['UUID_NAMEID'];
}>;

export type AdminInnovationHubQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    innovationHub?:
      | {
          __typename?: 'InnovationHub';
          id: string;
          nameID: string;
          subdomain: string;
          spaceVisibilityFilter?: SpaceVisibility | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            description?: string | undefined;
            tagline: string;
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
                account: {
                  __typename?: 'Account';
                  id: string;
                  license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
                  host?:
                    | {
                        __typename?: 'Organization';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }
                    | undefined;
                };
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type AdminInnovationHubFragment = {
  __typename?: 'InnovationHub';
  id: string;
  nameID: string;
  subdomain: string;
  spaceVisibilityFilter?: SpaceVisibility | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
        account: {
          __typename?: 'Account';
          id: string;
          license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
          host?:
            | {
                __typename?: 'Organization';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }
            | undefined;
        };
        profile: { __typename?: 'Profile'; id: string; displayName: string };
      }>
    | undefined;
};

export type CreateInnovationHubMutationVariables = Exact<{
  hubData: CreateInnovationHubInput;
}>;

export type CreateInnovationHubMutation = {
  __typename?: 'Mutation';
  createInnovationHub: {
    __typename?: 'InnovationHub';
    id: string;
    nameID: string;
    subdomain: string;
    spaceVisibilityFilter?: SpaceVisibility | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
          account: {
            __typename?: 'Account';
            id: string;
            license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
            host?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          };
          profile: { __typename?: 'Profile'; id: string; displayName: string };
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
    nameID: string;
    subdomain: string;
    spaceVisibilityFilter?: SpaceVisibility | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
          account: {
            __typename?: 'Account';
            id: string;
            license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
            host?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  profile: { __typename?: 'Profile'; id: string; displayName: string };
                }
              | undefined;
          };
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }>
      | undefined;
  };
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
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            displayName: string;
            tagline: string;
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
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    tagline: string;
    description?: string | undefined;
    banner?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
  };
};

export type ContextTabFragment = {
  __typename?: 'Context';
  id: string;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type MetricsItemFragment = { __typename?: 'NVP'; id: string; name: string; value: string };

export type AboutPageNonMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AboutPageNonMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline: string;
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
    };
    account: {
      __typename?: 'Account';
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagline: string;
              displayName: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            };
            verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          }
        | undefined;
    };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    community: {
      __typename?: 'Community';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      impact?: string | undefined;
      who?: string | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    collaboration: {
      __typename?: 'Collaboration';
      id: string;
      innovationFlow: {
        __typename?: 'InnovationFlow';
        id: string;
        currentState: { __typename?: 'InnovationFlowState'; displayName: string };
        states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
      };
    };
  };
};

export type AboutPageMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AboutPageMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community: {
      __typename?: 'Community';
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        isContactable: boolean;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
      }>;
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
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
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
  };
};

export type JourneyCommunityPrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type JourneyCommunityPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community: {
      __typename?: 'Community';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type JourneyDataQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  includeCommunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type JourneyDataQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      who?: string | undefined;
      impact?: string | undefined;
    };
    community?: {
      __typename?: 'Community';
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    account: {
      __typename?: 'Account';
      id: string;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagline: string;
              displayName: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            };
            verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          }
        | undefined;
    };
  };
};

export type ProfileJourneyDataFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  tagline: string;
  description?: string | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
    | undefined;
};

export type ContextJourneyDataFragment = {
  __typename?: 'Context';
  id: string;
  vision?: string | undefined;
  who?: string | undefined;
  impact?: string | undefined;
};

export type JourneyCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  leadOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  }>;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type JourneyPrivilegesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type JourneyPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type ChildJourneyPageBannerQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type ChildJourneyPageBannerQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
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
  spaceId: Scalars['UUID_NAMEID'];
  visualType?: VisualType;
}>;

export type JourneyBreadcrumbsSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
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

export type JourneyBreadcrumbsProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type SubspaceProviderQueryVariables = Exact<{
  subspaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspaceProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
      url: string;
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
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
    };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    context: {
      __typename?: 'Context';
      id: string;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
    };
    community: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type SubspaceProviderFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
    url: string;
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
    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context: {
    __typename?: 'Context';
    id: string;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
  };
  community: {
    __typename?: 'Community';
    id: string;
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SpaceCardFragment = {
  __typename?: 'Space';
  id: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    tagline: string;
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
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  account: {
    __typename?: 'Account';
    id: string;
    license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
  };
};

export type SpaceCommunityPageQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCommunityPageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagline: string;
              displayName: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            };
            verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          }
        | undefined;
    };
    community: {
      __typename?: 'Community';
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        isContactable: boolean;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
      }>;
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
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
    collaboration: { __typename?: 'Collaboration'; id: string };
  };
};

export type CommunityPageCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  memberUsers: Array<{
    __typename?: 'User';
    id: string;
    isContactable: boolean;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
  }>;
  leadOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  }>;
  memberOrganizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
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

export type SpaceDetailsFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
    location?:
      | {
          __typename?: 'Location';
          id: string;
          country: string;
          city: string;
          addressLine1: string;
          addressLine2: string;
          stateOrProvince: string;
          postalCode: string;
        }
      | undefined;
  };
  account: { __typename?: 'Account'; host?: { __typename?: 'Organization'; id: string } | undefined };
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  context: {
    __typename?: 'Context';
    id: string;
    vision?: string | undefined;
    impact?: string | undefined;
    who?: string | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
  };
};

export type SpaceProviderQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
    community: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      impact?: string | undefined;
      who?: string | undefined;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
    };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
      host?: { __typename?: 'Organization'; id: string } | undefined;
    };
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
      location?:
        | {
            __typename?: 'Location';
            id: string;
            country: string;
            city: string;
            addressLine1: string;
            addressLine2: string;
            stateOrProvince: string;
            postalCode: string;
          }
        | undefined;
    };
  };
};

export type SpaceUrlQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceUrlQuery = {
  __typename?: 'Query';
  space: { __typename?: 'Space'; id: string; profile: { __typename?: 'Profile'; id: string; url: string } };
};

export type SpaceInfoFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
  community: {
    __typename?: 'Community';
    id: string;
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  context: {
    __typename?: 'Context';
    id: string;
    vision?: string | undefined;
    impact?: string | undefined;
    who?: string | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
  };
  account: {
    __typename?: 'Account';
    id: string;
    license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    host?: { __typename?: 'Organization'; id: string } | undefined;
  };
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
    location?:
      | {
          __typename?: 'Location';
          id: string;
          country: string;
          city: string;
          addressLine1: string;
          addressLine2: string;
          stateOrProvince: string;
          postalCode: string;
        }
      | undefined;
  };
};

export type SpaceHostQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceHostQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            };
          }
        | undefined;
    };
  };
};

export type SpacePageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  authorizedReadAccess?: InputMaybe<Scalars['Boolean']>;
  authorizedReadAccessCommunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type SpacePageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    account: {
      __typename?: 'Account';
      id: string;
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagline: string;
              displayName: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            };
            verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          }
        | undefined;
    };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
      | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      who?: string | undefined;
      impact?: string | undefined;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            anonymousReadAccess: boolean;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          }
        | undefined;
    };
    collaboration?: {
      __typename?: 'Collaboration';
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
      timeline: {
        __typename?: 'Timeline';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      };
    };
    community?: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          tagsets?:
            | Array<{
                __typename?: 'Tagset';
                id: string;
                tags: Array<string>;
                name: string;
                allowedValues: Array<string>;
                type: TagsetType;
              }>
            | undefined;
        };
      }>;
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        isContactable: boolean;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
      }>;
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
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
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type SpaceDashboardReferencesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceDashboardReferencesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
  };
};

export type SpacePageFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  account: {
    __typename?: 'Account';
    id: string;
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            tagline: string;
            displayName: string;
            description?: string | undefined;
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
          };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        }
      | undefined;
  };
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        anonymousReadAccess: boolean;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      }
    | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    tagline: string;
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
  context: {
    __typename?: 'Context';
    id: string;
    vision?: string | undefined;
    who?: string | undefined;
    impact?: string | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
      | undefined;
  };
  collaboration?: {
    __typename?: 'Collaboration';
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
    timeline: {
      __typename?: 'Timeline';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
  community?: {
    __typename?: 'Community';
    id: string;
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    leadUsers: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
        tagsets?:
          | Array<{
              __typename?: 'Tagset';
              id: string;
              tags: Array<string>;
              name: string;
              allowedValues: Array<string>;
              type: TagsetType;
            }>
          | undefined;
      };
    }>;
    memberUsers: Array<{
      __typename?: 'User';
      id: string;
      isContactable: boolean;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    }>;
    leadOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    }>;
    memberOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
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
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SpaceWelcomeBlockContributorProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
};

export type CalloutFormTemplatesFromSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CalloutFormTemplatesFromSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            postTemplates: Array<{
              __typename?: 'PostTemplate';
              id: string;
              defaultDescription: string;
              type: string;
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
            }>;
            whiteboardTemplates: Array<{
              __typename?: 'WhiteboardTemplate';
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }>;
          }
        | undefined;
    };
  };
};

export type WhiteboardTemplatesFromSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardTemplatesFromSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            whiteboardTemplates: Array<{
              __typename?: 'WhiteboardTemplate';
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }>;
          }
        | undefined;
    };
  };
};

export type InnovationFlowTemplatesFromSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type InnovationFlowTemplatesFromSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            innovationFlowTemplates: Array<{
              __typename?: 'InnovationFlowTemplate';
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
            }>;
          }
        | undefined;
    };
  };
};

export type SpaceTemplatesFragment = {
  __typename?: 'Space';
  account: {
    __typename?: 'Account';
    id: string;
    library?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          postTemplates: Array<{
            __typename?: 'PostTemplate';
            id: string;
            defaultDescription: string;
            type: string;
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
          }>;
          whiteboardTemplates: Array<{
            __typename?: 'WhiteboardTemplate';
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
              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
          }>;
          innovationFlowTemplates: Array<{
            __typename?: 'InnovationFlowTemplate';
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
              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            };
            states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
          }>;
        }
      | undefined;
  };
};

export type SpaceSubspaceCardsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceSubspaceCardsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    }>;
  };
};

export type LegacySubspaceDashboardPageQueryVariables = Exact<{
  subspaceId: Scalars['UUID_NAMEID'];
}>;

export type LegacySubspaceDashboardPageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
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
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
        | undefined;
      visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
    };
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
      | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    collaboration: {
      __typename?: 'Collaboration';
      id: string;
      innovationFlow: {
        __typename?: 'InnovationFlow';
        id: string;
        states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
        currentState: { __typename?: 'InnovationFlowState'; displayName: string };
      };
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
      timeline: {
        __typename?: 'Timeline';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      };
    };
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            anonymousReadAccess: boolean;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          }
        | undefined;
    };
    community: {
      __typename?: 'Community';
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        isContactable: boolean;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
      }>;
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
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
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type SubspacePageFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
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
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
      | undefined;
    visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
  };
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        anonymousReadAccess: boolean;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      }
    | undefined;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  collaboration: {
    __typename?: 'Collaboration';
    id: string;
    innovationFlow: {
      __typename?: 'InnovationFlow';
      id: string;
      states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
      currentState: { __typename?: 'InnovationFlowState'; displayName: string };
    };
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
    timeline: {
      __typename?: 'Timeline';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
  context: {
    __typename?: 'Context';
    id: string;
    vision?: string | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
      | undefined;
  };
  community: {
    __typename?: 'Community';
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    id: string;
    leadUsers: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
    memberUsers: Array<{
      __typename?: 'User';
      id: string;
      isContactable: boolean;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    }>;
    leadOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    }>;
    memberOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
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
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SubspaceCardFragment = {
  __typename?: 'Space';
  id: string;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    tagline: string;
    displayName: string;
    description?: string | undefined;
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
};

export type SubspacesOnSpaceFragment = {
  __typename?: 'Space';
  id: string;
  subspaces: Array<{
    __typename?: 'Space';
    id: string;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
  }>;
};

export type CreateAccountMutationVariables = Exact<{
  input: CreateAccountInput;
}>;

export type CreateAccountMutation = {
  __typename?: 'Mutation';
  createAccount: { __typename?: 'Account'; id: string; spaceID: string };
};

export type DeleteSpaceMutationVariables = Exact<{
  input: DeleteSpaceInput;
}>;

export type DeleteSpaceMutation = {
  __typename?: 'Mutation';
  deleteSpace: { __typename?: 'Space'; id: string; nameID: string };
};

export type UpdateSpaceMutationVariables = Exact<{
  input: UpdateSpaceInput;
}>;

export type UpdateSpaceMutation = {
  __typename?: 'Mutation';
  updateSpace: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
      location?:
        | {
            __typename?: 'Location';
            id: string;
            country: string;
            city: string;
            addressLine1: string;
            addressLine2: string;
            stateOrProvince: string;
            postalCode: string;
          }
        | undefined;
    };
    account: { __typename?: 'Account'; host?: { __typename?: 'Organization'; id: string } | undefined };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      impact?: string | undefined;
      who?: string | undefined;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
    };
  };
};

export type SubspaceCardsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspaceCardsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    }>;
  };
};

export type SpaceApplicationTemplateQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceApplicationTemplateQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community: {
      __typename?: 'Community';
      id: string;
      applicationForm: {
        __typename?: 'Form';
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
};

export type SpaceCardQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCardQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline: string;
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
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
  };
};

export type SpaceGroupQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type SpaceGroupQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community: {
      __typename?: 'Community';
      id: string;
      group: {
        __typename?: 'UserGroup';
        id: string;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagline: string;
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
              references?:
                | Array<{
                    __typename?: 'Reference';
                    id: string;
                    uri: string;
                    name: string;
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
            }
          | undefined;
      };
    };
  };
};

export type SpaceInnovationFlowTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceInnovationFlowTemplatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            innovationFlowTemplates: Array<{
              __typename?: 'InnovationFlowTemplate';
              id: string;
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
            }>;
          }
        | undefined;
    };
  };
};

export type SubspaceProfileInfoQueryVariables = Exact<{
  subspaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspaceProfileInfoQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      tagline: string;
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
      location?:
        | {
            __typename?: 'Location';
            id: string;
            country: string;
            city: string;
            addressLine1: string;
            addressLine2: string;
            stateOrProvince: string;
            postalCode: string;
          }
        | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string }>
        | undefined;
    };
    context: {
      __typename?: 'Context';
      id: string;
      vision?: string | undefined;
      impact?: string | undefined;
      who?: string | undefined;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
    };
    collaboration: {
      __typename?: 'Collaboration';
      id: string;
      innovationFlow: { __typename?: 'InnovationFlow'; id: string };
    };
  };
};

export type SubspacesInSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspacesInSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      nameID: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
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
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        tagline: string;
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
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      account: {
        __typename?: 'Account';
        id: string;
        license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
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

export type AdminSpaceChallengesPageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AdminSpaceChallengesPageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      nameID: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    account: {
      __typename?: 'Account';
      id: string;
      defaults?:
        | {
            __typename?: 'SpaceDefaults';
            innovationFlowTemplate?:
              | {
                  __typename?: 'InnovationFlowTemplate';
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type UpdateSpaceDefaultInnovationFlowTemplateMutationVariables = Exact<{
  spaceId: Scalars['UUID'];
  innovationFlowTemplateId: Scalars['UUID'];
}>;

export type UpdateSpaceDefaultInnovationFlowTemplateMutation = {
  __typename?: 'Mutation';
  updateSpaceDefaults: { __typename?: 'SpaceDefaults'; id: string };
};

export type SpaceProfileFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    tagline: string;
    displayName: string;
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
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context: {
    __typename?: 'Context';
    id: string;
    vision?: string | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
  };
  collaboration: {
    __typename?: 'Collaboration';
    id: string;
    innovationFlow: {
      __typename?: 'InnovationFlow';
      id: string;
      states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
      currentState: { __typename?: 'InnovationFlowState'; displayName: string };
    };
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
    timeline: {
      __typename?: 'Timeline';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
  community: {
    __typename?: 'Community';
    id: string;
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    leadUsers: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
    memberUsers: Array<{
      __typename?: 'User';
      id: string;
      isContactable: boolean;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    }>;
    leadOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    }>;
    memberOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
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
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SpaceSettingsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceSettingsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    settings: {
      __typename?: 'SpaceSettings';
      privacy: { __typename?: 'SpaceSettingsPrivacy'; mode: SpacePrivacyMode };
      membership: {
        __typename?: 'SpaceSettingsMembership';
        policy: CommunityMembershipPolicy;
        trustedOrganizations: Array<string>;
      };
      collaboration: {
        __typename?: 'SpaceSettingsCollaboration';
        allowMembersToCreateCallouts: boolean;
        allowMembersToCreateSubspaces: boolean;
        inheritMembershipRights: boolean;
      };
    };
    community: { __typename?: 'Community'; id: string };
  };
};

export type SpaceSettingsFragment = {
  __typename?: 'SpaceSettings';
  privacy: { __typename?: 'SpaceSettingsPrivacy'; mode: SpacePrivacyMode };
  membership: {
    __typename?: 'SpaceSettingsMembership';
    policy: CommunityMembershipPolicy;
    trustedOrganizations: Array<string>;
  };
  collaboration: {
    __typename?: 'SpaceSettingsCollaboration';
    allowMembersToCreateCallouts: boolean;
    allowMembersToCreateSubspaces: boolean;
    inheritMembershipRights: boolean;
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
      privacy: { __typename?: 'SpaceSettingsPrivacy'; mode: SpacePrivacyMode };
      membership: {
        __typename?: 'SpaceSettingsMembership';
        policy: CommunityMembershipPolicy;
        trustedOrganizations: Array<string>;
      };
      collaboration: {
        __typename?: 'SpaceSettingsCollaboration';
        allowMembersToCreateCallouts: boolean;
        allowMembersToCreateSubspaces: boolean;
        inheritMembershipRights: boolean;
      };
    };
  };
};

export type SpaceDashboardNavigationChallengesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceDashboardNavigationChallengesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
    };
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
      };
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    }>;
  };
};

export type SpaceDashboardNavigationOpportunitiesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeIds: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type SpaceDashboardNavigationOpportunitiesQuery = {
  __typename?: 'Query';
  space: {
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
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
        };
        community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
      }>;
    }>;
  };
};

export type SpaceDashboardNavigationProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
};

export type SpaceDashboardNavigationCommunityFragment = {
  __typename?: 'Community';
  id: string;
  myMembershipStatus?: CommunityMembershipStatus | undefined;
};

export type SubspaceInfoQueryVariables = Exact<{
  subspaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspaceInfoQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
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
      references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
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
      location?:
        | {
            __typename?: 'Location';
            id: string;
            country: string;
            city: string;
            addressLine1: string;
            addressLine2: string;
            stateOrProvince: string;
            postalCode: string;
          }
        | undefined;
    };
    community: {
      __typename?: 'Community';
      id: string;
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    context: {
      __typename?: 'Context';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type SubspaceInfoFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    tagline: string;
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
    references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
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
    location?:
      | {
          __typename?: 'Location';
          id: string;
          country: string;
          city: string;
          addressLine1: string;
          addressLine2: string;
          stateOrProvince: string;
          postalCode: string;
        }
      | undefined;
  };
  community: {
    __typename?: 'Community';
    id: string;
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context: {
    __typename?: 'Context';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type SubspacePageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SubspacePageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    community: {
      __typename?: 'Community';
      myMembershipStatus?: CommunityMembershipStatus | undefined;
      id: string;
      leadUsers: Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
      memberUsers: Array<{
        __typename?: 'User';
        id: string;
        isContactable: boolean;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
      }>;
      leadOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>;
      memberOrganizations: Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
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
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    collaboration: { __typename?: 'Collaboration'; id: string };
  };
};

export type SubspacePageSpaceFragment = {
  __typename?: 'Space';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  community: {
    __typename?: 'Community';
    myMembershipStatus?: CommunityMembershipStatus | undefined;
    id: string;
    leadUsers: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
    memberUsers: Array<{
      __typename?: 'User';
      id: string;
      isContactable: boolean;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
    }>;
    leadOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      };
      verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    }>;
    memberOrganizations: Array<{
      __typename?: 'Organization';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
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
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
  collaboration: { __typename?: 'Collaboration'; id: string };
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
      nameID: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type UpdateAccountPlatformSettingsMutationVariables = Exact<{
  accountId: Scalars['UUID'];
  hostId?: InputMaybe<Scalars['UUID_NAMEID']>;
  license?: InputMaybe<UpdateLicenseInput>;
}>;

export type UpdateAccountPlatformSettingsMutation = {
  __typename?: 'Mutation';
  updateAccountPlatformSettings: {
    __typename?: 'Account';
    id: string;
    license: {
      __typename?: 'License';
      id: string;
      visibility: SpaceVisibility;
      featureFlags: Array<{ __typename?: 'LicenseFeatureFlag'; name: LicenseFeatureFlagName; enabled: boolean }>;
    };
    host?: { __typename?: 'Organization'; id: string } | undefined;
  };
};

export type UpdateSpacePlatformSettingsMutationVariables = Exact<{
  spaceId: Scalars['UUID'];
  nameId: Scalars['NameID'];
}>;

export type UpdateSpacePlatformSettingsMutation = {
  __typename?: 'Mutation';
  updateSpacePlatformSettings: { __typename?: 'Space'; id: string; nameID: string };
};

export type AdminSpacesListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminSpacesListQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    nameID: string;
    account: {
      __typename?: 'Account';
      id: string;
      license: {
        __typename?: 'License';
        id: string;
        visibility: SpaceVisibility;
        featureFlags: Array<{ __typename?: 'LicenseFeatureFlag'; name: LicenseFeatureFlagName; enabled: boolean }>;
      };
      host?:
        | {
            __typename?: 'Organization';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }
        | undefined;
    };
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  }>;
};

export type AdminSpaceFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  account: {
    __typename?: 'Account';
    id: string;
    license: {
      __typename?: 'License';
      id: string;
      visibility: SpaceVisibility;
      featureFlags: Array<{ __typename?: 'LicenseFeatureFlag'; name: LicenseFeatureFlagName; enabled: boolean }>;
    };
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }
      | undefined;
  };
  profile: { __typename?: 'Profile'; id: string; displayName: string };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type SpaceStorageAdminPageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceStorageAdminPageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    storageAggregator: {
      __typename?: 'StorageAggregator';
      id: string;
      parentEntity?:
        | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
        | undefined;
      storageAggregators: Array<{
        __typename?: 'StorageAggregator';
        id: string;
        parentEntity?:
          | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
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
                nameID: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
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
                nameID: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
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
            | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
            | undefined;
          storageAggregators: Array<{
            __typename?: 'StorageAggregator';
            id: string;
            parentEntity?:
              | {
                  __typename?: 'StorageAggregatorParent';
                  id: string;
                  type: SpaceType;
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
                    nameID: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
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
                    nameID: string;
                    profile: { __typename?: 'Profile'; id: string; displayName: string };
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
    | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
    | undefined;
  storageAggregators: Array<{
    __typename?: 'StorageAggregator';
    id: string;
    parentEntity?:
      | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
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
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
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
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
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
    | { __typename?: 'StorageAggregatorParent'; id: string; type: SpaceType; displayName: string; url: string }
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
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
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
  type: SpaceType;
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
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

export type AdminSpaceTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AdminSpaceTemplatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: {
      __typename?: 'Account';
      id: string;
      library?:
        | {
            __typename?: 'TemplatesSet';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            calloutTemplates: Array<{
              __typename?: 'CalloutTemplate';
              id: string;
              type: CalloutType;
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
              contributionPolicy: {
                __typename?: 'CalloutContributionPolicy';
                id: string;
                allowedContributionTypes: Array<CalloutContributionType>;
              };
            }>;
            postTemplates: Array<{
              __typename?: 'PostTemplate';
              id: string;
              defaultDescription: string;
              type: string;
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
              __typename?: 'WhiteboardTemplate';
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
            innovationFlowTemplates: Array<{
              __typename?: 'InnovationFlowTemplate';
              id: string;
              states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
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
};

export type AdminCalloutTemplateFragment = {
  __typename?: 'CalloutTemplate';
  id: string;
  type: CalloutType;
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
  contributionPolicy: {
    __typename?: 'CalloutContributionPolicy';
    id: string;
    allowedContributionTypes: Array<CalloutContributionType>;
  };
};

export type AdminPostTemplateFragment = {
  __typename?: 'PostTemplate';
  id: string;
  defaultDescription: string;
  type: string;
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

export type AdminWhiteboardTemplateFragment = {
  __typename?: 'WhiteboardTemplate';
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

export type AdminInnovationFlowTemplateFragment = {
  __typename?: 'InnovationFlowTemplate';
  id: string;
  states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
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

export type ProfileInfoWithVisualFragment = {
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

export type CreateCalloutTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  framing: CreateCalloutFramingInput;
  contributionDefaults: CreateCalloutContributionDefaultsInput;
  contributionPolicy: CreateCalloutContributionPolicyInput;
  profile: CreateProfileInput;
  type: CalloutType;
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type CreateCalloutTemplateMutation = {
  __typename?: 'Mutation';
  createCalloutTemplate: { __typename?: 'CalloutTemplate'; id: string };
};

export type SpaceTemplateSetIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceTemplateSetIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    account: { __typename?: 'Account'; id: string; library?: { __typename?: 'TemplatesSet'; id: string } | undefined };
  };
};

export type DeleteCalloutTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteCalloutTemplateMutation = {
  __typename?: 'Mutation';
  deleteCalloutTemplate: { __typename?: 'CalloutTemplate'; id: string };
};

export type InnovationPacksQueryVariables = Exact<{ [key: string]: never }>;

export type InnovationPacksQuery = {
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
        nameID: string;
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              postTemplates: Array<{
                __typename?: 'PostTemplate';
                id: string;
                defaultDescription: string;
                type: string;
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
                __typename?: 'WhiteboardTemplate';
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
              innovationFlowTemplates: Array<{
                __typename?: 'InnovationFlowTemplate';
                id: string;
                states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
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
      }>;
    };
  };
};

export type InnovationPackProviderProfileWithAvatarFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    displayName: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
      }>;
    };
  };
};

export type DeleteInnovationPackMutationVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
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
  tagline: string;
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

export type AdminInnovationPackTemplatesFragment = {
  __typename?: 'TemplatesSet';
  id: string;
  postTemplates: Array<{
    __typename?: 'PostTemplate';
    id: string;
    defaultDescription: string;
    type: string;
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
  innovationFlowTemplates: Array<{
    __typename?: 'InnovationFlowTemplate';
    id: string;
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
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
    __typename?: 'WhiteboardTemplate';
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

export type AdminInnovationPackQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
}>;

export type AdminInnovationPackQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
      innovationPack?:
        | {
            __typename?: 'InnovationPack';
            id: string;
            nameID: string;
            provider?:
              | {
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                }
              | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              description?: string | undefined;
              tagline: string;
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
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  postTemplates: Array<{
                    __typename?: 'PostTemplate';
                    id: string;
                    defaultDescription: string;
                    type: string;
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
                  innovationFlowTemplates: Array<{
                    __typename?: 'InnovationFlowTemplate';
                    id: string;
                    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
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
                    __typename?: 'WhiteboardTemplate';
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
          }
        | undefined;
    };
  };
  organizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
};

export type CreateInnovationPackMutationVariables = Exact<{
  packData: CreateInnovationPackOnLibraryInput;
}>;

export type CreateInnovationPackMutation = {
  __typename?: 'Mutation';
  createInnovationPackOnLibrary: { __typename?: 'InnovationPack'; id: string; nameID: string };
};

export type UpdateInnovationPackMutationVariables = Exact<{
  packData: UpdateInnovationPackInput;
}>;

export type UpdateInnovationPackMutation = {
  __typename?: 'Mutation';
  updateInnovationPack: { __typename?: 'InnovationPack'; id: string; nameID: string };
};

export type UpdateInnovationFlowTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  profile: UpdateProfileInput;
  states?: InputMaybe<Array<UpdateInnovationFlowStateInput> | UpdateInnovationFlowStateInput>;
}>;

export type UpdateInnovationFlowTemplateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowTemplate: { __typename?: 'InnovationFlowTemplate'; id: string };
};

export type CreateInnovationFlowTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  profile: CreateProfileInput;
  states?: InputMaybe<Array<UpdateInnovationFlowStateInput> | UpdateInnovationFlowStateInput>;
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type CreateInnovationFlowTemplateMutation = {
  __typename?: 'Mutation';
  createInnovationFlowTemplate: { __typename?: 'InnovationFlowTemplate'; id: string };
};

export type DeleteInnovationFlowTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteInnovationFlowTemplateMutation = {
  __typename?: 'Mutation';
  deleteInnovationFlowTemplate: { __typename?: 'InnovationFlowTemplate'; id: string };
};

export type UpdatePostTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  profile?: InputMaybe<UpdateProfileInput>;
  type?: InputMaybe<Scalars['String']>;
}>;

export type UpdatePostTemplateMutation = {
  __typename?: 'Mutation';
  updatePostTemplate: { __typename?: 'PostTemplate'; id: string };
};

export type CreatePostTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  defaultDescription: Scalars['Markdown'];
  profile: CreateProfileInput;
  type: Scalars['String'];
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type CreatePostTemplateMutation = {
  __typename?: 'Mutation';
  createPostTemplate: { __typename?: 'PostTemplate'; id: string };
};

export type DeletePostTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeletePostTemplateMutation = {
  __typename?: 'Mutation';
  deletePostTemplate: { __typename?: 'PostTemplate'; id: string };
};

export type UpdateWhiteboardTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  content?: InputMaybe<Scalars['WhiteboardContent']>;
  profile: UpdateProfileInput;
}>;

export type UpdateWhiteboardTemplateMutation = {
  __typename?: 'Mutation';
  updateWhiteboardTemplate: {
    __typename?: 'WhiteboardTemplate';
    id: string;
    profile: { __typename?: 'Profile'; id: string; visual?: { __typename?: 'Visual'; id: string } | undefined };
  };
};

export type CreateWhiteboardTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  content: Scalars['WhiteboardContent'];
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type CreateWhiteboardTemplateMutation = {
  __typename?: 'Mutation';
  createWhiteboardTemplate: {
    __typename?: 'WhiteboardTemplate';
    id: string;
    profile: { __typename?: 'Profile'; id: string; visual?: { __typename?: 'Visual'; id: string } | undefined };
  };
};

export type DeleteWhiteboardTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteWhiteboardTemplateMutation = {
  __typename?: 'Mutation';
  deleteWhiteboardTemplate: { __typename?: 'WhiteboardTemplate'; id: string };
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

export type CreateVirtualContributorMutationVariables = Exact<{
  virtualContributorData: CreateVirtualContributorInput;
}>;

export type CreateVirtualContributorMutation = {
  __typename?: 'Mutation';
  createVirtualContributor: { __typename?: 'VirtualContributor'; id: string };
};

export type UpdateVirtualContributorMutationVariables = Exact<{
  virtualContributorData: UpdateVirtualContributorInput;
}>;

export type UpdateVirtualContributorMutation = {
  __typename?: 'Mutation';
  updateVirtualContributor: {
    __typename?: 'VirtualContributor';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

export type VirtualContributorAvailablePersonasQueryVariables = Exact<{ [key: string]: never }>;

export type VirtualContributorAvailablePersonasQuery = {
  __typename?: 'Query';
  virtualPersonas: Array<{
    __typename?: 'VirtualPersona';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  }>;
};

export type CreateVirtualPersonaMutationVariables = Exact<{
  virtualPersonaData: CreateVirtualPersonaInput;
}>;

export type CreateVirtualPersonaMutation = {
  __typename?: 'Mutation';
  createVirtualPersona: {
    __typename?: 'VirtualPersona';
    id: string;
    nameID: string;
    prompt: string;
    engine?: VirtualPersonaEngine | undefined;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
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
      };
      featureFlags: Array<{ __typename?: 'PlatformFeatureFlag'; enabled: boolean; name: PlatformFeatureFlagName }>;
      sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
      apm: { __typename?: 'APM'; rumEnabled: boolean; endpoint: string };
      geo: { __typename?: 'Geo'; endpoint: string };
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
  };
  featureFlags: Array<{ __typename?: 'PlatformFeatureFlag'; enabled: boolean; name: PlatformFeatureFlagName }>;
  sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
  apm: { __typename?: 'APM'; rumEnabled: boolean; endpoint: string };
  geo: { __typename?: 'Geo'; endpoint: string };
};

export type ServerMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type ServerMetadataQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    metadata: {
      __typename?: 'Metadata';
      services: Array<{ __typename?: 'ServiceMetadata'; name?: string | undefined; version?: string | undefined }>;
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
}>;

export type CreateSubspaceMutation = {
  __typename?: 'Mutation';
  createSubspace: {
    __typename?: 'Space';
    id: string;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
  };
};

export type JourneyStorageConfigQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type JourneyStorageConfigQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
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
  postId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID'];
}>;

export type CalloutPostStorageConfigQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    callout?:
      | {
          __typename?: 'Callout';
          id: string;
          contributions: Array<{
            __typename?: 'CalloutContribution';
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
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                    };
                  };
                }
              | undefined;
          }>;
        }
      | undefined;
  };
};

export type UserStorageConfigQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserStorageConfigQuery = {
  __typename?: 'Query';
  user: {
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
  };
};

export type OrganizationStorageConfigQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
}>;

export type OrganizationStorageConfigQuery = {
  __typename?: 'Query';
  organization: {
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
  };
};

export type InnovationPackStorageConfigQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
}>;

export type InnovationPackStorageConfigQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    library: {
      __typename?: 'Library';
      id: string;
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
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              };
            };
          }
        | undefined;
    };
  };
};

export type InnovationHubStorageConfigQueryVariables = Exact<{
  innovationHubId: Scalars['UUID_NAMEID'];
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

export type CalloutTemplatePreviewQueryVariables = Exact<{
  calloutTemplateId: Scalars['UUID'];
}>;

export type CalloutTemplatePreviewQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calloutTemplate?:
      | {
          __typename?: 'CalloutTemplate';
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
                        anonymousReadAccess: boolean;
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
                          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
        }
      | undefined;
  };
};

export type CalloutTemplatePreviewFragment = {
  __typename?: 'CalloutTemplate';
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
                anonymousReadAccess: boolean;
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
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
};

export type WhiteboardTemplateContentQueryVariables = Exact<{
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type WhiteboardTemplateContentQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboardTemplate?:
      | {
          __typename?: 'WhiteboardTemplate';
          id: string;
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
        }
      | undefined;
  };
};

export type SpaceCalendarEventsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type SpaceCalendarEventsQuery = {
  __typename?: 'Query';
  space: {
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
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          events?:
            | Array<{
                __typename?: 'CalendarEvent';
                id: string;
                nameID: string;
                startDate?: Date | undefined;
                durationDays?: number | undefined;
                durationMinutes: number;
                wholeDay: boolean;
                multipleDays: boolean;
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
                };
              }>
            | undefined;
        };
      };
    };
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
      events?:
        | Array<{
            __typename?: 'CalendarEvent';
            id: string;
            nameID: string;
            startDate?: Date | undefined;
            durationDays?: number | undefined;
            durationMinutes: number;
            wholeDay: boolean;
            multipleDays: boolean;
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
            };
          }>
        | undefined;
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
  nameID: string;
  startDate?: Date | undefined;
  durationDays?: number | undefined;
  durationMinutes: number;
  wholeDay: boolean;
  multipleDays: boolean;
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
  };
};

export type CalendarEventDetailsQueryVariables = Exact<{
  eventId: Scalars['UUID'];
}>;

export type CalendarEventDetailsQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    calendarEvent?:
      | {
          __typename?: 'CalendarEvent';
          type: CalendarEventType;
          createdDate: Date;
          id: string;
          nameID: string;
          startDate?: Date | undefined;
          durationDays?: number | undefined;
          durationMinutes: number;
          wholeDay: boolean;
          multipleDays: boolean;
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
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
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
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
                      displayName: string;
                      url: string;
                      type?: ProfileType | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                      type?: ProfileType | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                    };
                  }
                | undefined;
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
          };
        }
      | undefined;
  };
};

export type CalendarEventDetailsFragment = {
  __typename?: 'CalendarEvent';
  type: CalendarEventType;
  createdDate: Date;
  id: string;
  nameID: string;
  startDate?: Date | undefined;
  durationDays?: number | undefined;
  durationMinutes: number;
  wholeDay: boolean;
  multipleDays: boolean;
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
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
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
          | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
          | undefined;
      }>;
      sender?:
        | {
            __typename?: 'User';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              url: string;
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
              type?: ProfileType | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }
        | undefined;
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
  };
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
};

export type CreateCalendarEventMutationVariables = Exact<{
  eventData: CreateCalendarEventOnCalendarInput;
}>;

export type CreateCalendarEventMutation = {
  __typename?: 'Mutation';
  createEventOnCalendar: {
    __typename?: 'CalendarEvent';
    type: CalendarEventType;
    createdDate: Date;
    id: string;
    nameID: string;
    startDate?: Date | undefined;
    durationDays?: number | undefined;
    durationMinutes: number;
    wholeDay: boolean;
    multipleDays: boolean;
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
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
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
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            }
          | undefined;
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
    };
  };
};

export type UpdateCalendarEventMutationVariables = Exact<{
  eventData: UpdateCalendarEventInput;
}>;

export type UpdateCalendarEventMutation = {
  __typename?: 'Mutation';
  updateCalendarEvent: {
    __typename?: 'CalendarEvent';
    type: CalendarEventType;
    createdDate: Date;
    id: string;
    nameID: string;
    startDate?: Date | undefined;
    durationDays?: number | undefined;
    durationMinutes: number;
    wholeDay: boolean;
    multipleDays: boolean;
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
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
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
            | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
            | undefined;
        }>;
        sender?:
          | {
              __typename?: 'User';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                url: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
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
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            }
          | undefined;
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
    };
  };
};

export type DeleteCalendarEventMutationVariables = Exact<{
  deleteData: DeleteCalendarEventInput;
}>;

export type DeleteCalendarEventMutation = {
  __typename?: 'Mutation';
  deleteCalendarEvent: { __typename?: 'CalendarEvent'; id: string };
};

export type UpdateAnswerRelevanceMutationVariables = Exact<{
  input: ChatGuidanceAnswerRelevanceInput;
}>;

export type UpdateAnswerRelevanceMutation = { __typename?: 'Mutation'; updateAnswerRelevance: boolean };

export type ResetChatGuidanceMutationVariables = Exact<{ [key: string]: never }>;

export type ResetChatGuidanceMutation = { __typename?: 'Mutation'; resetChatGuidance: boolean };

export type AskChatGuidanceQuestionQueryVariables = Exact<{
  chatData: ChatGuidanceInput;
}>;

export type AskChatGuidanceQuestionQuery = {
  __typename?: 'Query';
  askChatGuidanceQuestion: {
    __typename?: 'ChatGuidanceResult';
    id?: string | undefined;
    answer: string;
    question: string;
    sources?: Array<{ __typename?: 'Source'; uri?: string | undefined; title?: string | undefined }> | undefined;
  };
};

export type JourneyRouteResolverQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type JourneyRouteResolverQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    subspace?: { __typename?: 'Space'; id: string; subspace?: { __typename?: 'Space'; id: string } };
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
                type: SpaceType;
                profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
                authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
              }
            | undefined;
          space: {
            __typename?: 'Space';
            id: string;
            type: SpaceType;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              tagline: string;
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
            context: { __typename?: 'Context'; id: string; vision?: string | undefined };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
            community: {
              __typename?: 'Community';
              id: string;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
            };
            account: {
              __typename?: 'Account';
              id: string;
              license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
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
            nameID: string;
            type: CalloutType;
            framing: { __typename?: 'CalloutFraming'; id: string };
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
            nameID: string;
            profile: {
              __typename?: 'Profile';
              displayName: string;
              id: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
            nameID: string;
            isContactable: boolean;
            profile: {
              __typename?: 'Profile';
              displayName: string;
              id: string;
              description?: string | undefined;
              location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
            type: SpaceType;
            account: {
              __typename?: 'Account';
              id: string;
              license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
            };
            profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
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
    type: SpaceType;
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
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
    type: SpaceType;
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
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
    nameID: string;
    isContactable: boolean;
    profile: {
      __typename?: 'Profile';
      displayName: string;
      id: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    framing: { __typename?: 'CalloutFraming'; id: string };
  };
};

export type SearchResultOrganizationFragment = {
  __typename?: 'SearchResultOrganization';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      displayName: string;
      id: string;
      description?: string | undefined;
      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
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
        type: SpaceType;
        profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      }
    | undefined;
  space: {
    __typename?: 'Space';
    id: string;
    type: SpaceType;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline: string;
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
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
  };
};

export type UserRolesSearchCardsQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserRolesSearchCardsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      roles: Array<string>;
      subspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; nameID: string; roles: Array<string> }>;
      subsubspaces: Array<{ __typename?: 'RolesResultCommunity'; id: string; roles: Array<string> }>;
    }>;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string; roles: Array<string> }>;
  };
};

export type SearchScopeDetailsSpaceQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
}>;

export type SearchScopeDetailsSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
    };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
  };
};

export type InnovationLibraryQueryVariables = Exact<{ [key: string]: never }>;

export type InnovationLibraryQuery = {
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
        nameID: string;
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
        templates?:
          | {
              __typename?: 'TemplatesSet';
              id: string;
              postTemplatesCount: number;
              whiteboardTemplatesCount: number;
              innovationFlowTemplatesCount: number;
              postTemplates: Array<{
                __typename?: 'PostTemplate';
                id: string;
                type: string;
                defaultDescription: string;
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
                __typename?: 'WhiteboardTemplate';
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
              innovationFlowTemplates: Array<{
                __typename?: 'InnovationFlowTemplate';
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
                states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
              }>;
            }
          | undefined;
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
      }>;
    };
  };
};

export type InnovationPackDataFragment = {
  __typename?: 'InnovationPack';
  id: string;
  nameID: string;
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
  templates?:
    | {
        __typename?: 'TemplatesSet';
        id: string;
        postTemplatesCount: number;
        whiteboardTemplatesCount: number;
        innovationFlowTemplatesCount: number;
        postTemplates: Array<{
          __typename?: 'PostTemplate';
          id: string;
          type: string;
          defaultDescription: string;
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
          __typename?: 'WhiteboardTemplate';
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
        innovationFlowTemplates: Array<{
          __typename?: 'InnovationFlowTemplate';
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
          states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
        }>;
      }
    | undefined;
  provider?:
    | {
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
};

export type LibraryTemplatesFragment = {
  __typename?: 'TemplatesSet';
  id: string;
  postTemplatesCount: number;
  whiteboardTemplatesCount: number;
  innovationFlowTemplatesCount: number;
  postTemplates: Array<{
    __typename?: 'PostTemplate';
    id: string;
    type: string;
    defaultDescription: string;
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
    __typename?: 'WhiteboardTemplate';
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
  innovationFlowTemplates: Array<{
    __typename?: 'InnovationFlowTemplate';
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
    states: Array<{ __typename?: 'InnovationFlowState'; displayName: string; description: string }>;
  }>;
};

export type DashboardSpacesQueryVariables = Exact<{
  visibilities?: InputMaybe<Array<SpaceVisibility> | SpaceVisibility>;
}>;

export type DashboardSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      tagline: string;
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
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
  }>;
};

export type DashboardSpacesPaginatedQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  visibilities?: InputMaybe<Array<SpaceVisibility> | SpaceVisibility>;
}>;

export type DashboardSpacesPaginatedQuery = {
  __typename?: 'Query';
  spacesPaginated: {
    __typename?: 'PaginatedSpaces';
    spaces: Array<{
      __typename?: 'Space';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        tagline: string;
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
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      account: {
        __typename?: 'Account';
        id: string;
        license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
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

export type InnovationLibraryBlockQueryVariables = Exact<{ [key: string]: never }>;

export type InnovationLibraryBlockQuery = {
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
        nameID: string;
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
        templates?:
          | {
              __typename?: 'TemplatesSet';
              postTemplatesCount: number;
              whiteboardTemplatesCount: number;
              innovationFlowTemplatesCount: number;
            }
          | undefined;
        provider?:
          | {
              __typename?: 'Organization';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }
          | undefined;
      }>;
    };
  };
};

export type InnovationPackCardFragment = {
  __typename?: 'InnovationPack';
  id: string;
  nameID: string;
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
  templates?:
    | {
        __typename?: 'TemplatesSet';
        postTemplatesCount: number;
        whiteboardTemplatesCount: number;
        innovationFlowTemplatesCount: number;
      }
    | undefined;
  provider?:
    | {
        __typename?: 'Organization';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }
    | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
            nameID: string;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          user: {
            __typename?: 'User';
            id: string;
            firstName: string;
            lastName: string;
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
          parentNameID: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
            profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
          parentNameID: string;
          message: string;
          journeyDisplayName: string;
          space?:
            | {
                __typename?: 'Space';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  url: string;
                  displayName: string;
                  type?: ProfileType | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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

export type RecentContributionsJourneyProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  type?: ProfileType | undefined;
};

export type RecentContributionsSpaceProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  type?: ProfileType | undefined;
  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
};

export type RecentContributionsChildJourneyProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  type?: ProfileType | undefined;
  avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
          nameID: string;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
        subspace: {
          __typename?: 'Space';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
        user: {
          __typename?: 'User';
          id: string;
          firstName: string;
          lastName: string;
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
        parentNameID: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
        subsubspace: {
          __typename?: 'Space';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; url: string };
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
        parentNameID: string;
        message: string;
        journeyDisplayName: string;
        space?:
          | {
              __typename?: 'Space';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                url: string;
                displayName: string;
                type?: ProfileType | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
      }
  >;
};

export type LatestContributionsSpacesQueryVariables = Exact<{ [key: string]: never }>;

export type LatestContributionsSpacesQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMemberships: Array<{
      __typename?: 'Space';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    }>;
  };
};

export type MembershipSuggestionSpaceQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type MembershipSuggestionSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      url: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    community: { __typename?: 'Community'; id: string; myRoles: Array<CommunityRole> };
  };
};

export type MyMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type MyMembershipsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    spaceMemberships: Array<{
      __typename?: 'Space';
      id: string;
      account: {
        __typename?: 'Account';
        id: string;
        license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
      };
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        displayName: string;
        tagline: string;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      subspaces: Array<{
        __typename?: 'Space';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        community: {
          __typename?: 'Community';
          id: string;
          myMembershipStatus?: CommunityMembershipStatus | undefined;
          myRoles: Array<CommunityRole>;
        };
      }>;
    }>;
  };
};

export type MyMembershipsSubspaceQueryVariables = Exact<{
  subspaceId: Scalars['UUID_NAMEID'];
}>;

export type MyMembershipsSubspaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      url: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      community: {
        __typename?: 'Community';
        id: string;
        myMembershipStatus?: CommunityMembershipStatus | undefined;
        myRoles: Array<CommunityRole>;
      };
      profile: {
        __typename?: 'Profile';
        id: string;
        displayName: string;
        tagline: string;
        url: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
  };
};

export type MyMembershipsChildJourneyCommunityFragment = {
  __typename?: 'Community';
  id: string;
  myMembershipStatus?: CommunityMembershipStatus | undefined;
  myRoles: Array<CommunityRole>;
};

export type MyMembershipsChildJourneyProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  tagline: string;
  url: string;
  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type NewMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type NewMembershipsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    applications: Array<{
      __typename?: 'ApplicationForRoleResult';
      id: string;
      communityID: string;
      displayName: string;
      state: string;
      spaceID: string;
      subspaceID?: string | undefined;
      subsubspaceID?: string | undefined;
      createdDate: Date;
    }>;
    invitations: Array<{
      __typename?: 'InvitationForRoleResult';
      id: string;
      spaceID: string;
      state: string;
      subspaceID?: string | undefined;
      welcomeMessage?: string | undefined;
      createdBy: string;
      createdDate: Date;
    }>;
  };
};

export type RecentForumMessagesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type RecentForumMessagesQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    id: string;
    communication: {
      __typename?: 'Communication';
      id: string;
      discussionCategories: Array<DiscussionCategory>;
      authorization?:
        | {
            __typename?: 'Authorization';
            id: string;
            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            anonymousReadAccess: boolean;
          }
        | undefined;
      discussions?:
        | Array<{
            __typename?: 'Discussion';
            id: string;
            category: DiscussionCategory;
            timestamp?: number | undefined;
            createdBy?: string | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              displayName: string;
              description?: string | undefined;
              tagline: string;
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
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
          }>
        | undefined;
    };
  };
};

export type RecentJourneyQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type RecentJourneyQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  };
};

export type RecentJourneyProfileFragment = {
  __typename?: 'Profile';
  id: string;
  url: string;
  displayName: string;
  cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
};

export type RecentSpacesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type RecentSpacesQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'MeQueryResults';
    mySpaces: Array<{ __typename?: 'MySpaceResults'; space: { __typename: 'Space'; id: string } }>;
  };
};

export type ChallengeExplorerPageQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengeExplorerPageQuery = {
  __typename?: 'Query';
  me: { __typename?: 'MeQueryResults'; spaceMemberships: Array<{ __typename?: 'Space'; id: string }> };
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
            type: SpaceType;
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              url: string;
              tagline: string;
              displayName: string;
              type?: ProfileType | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            };
            context: { __typename?: 'Context'; id: string; vision?: string | undefined };
            account: {
              __typename?: 'Account';
              id: string;
              license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
            };
            community: {
              __typename?: 'Community';
              id: string;
              myMembershipStatus?: CommunityMembershipStatus | undefined;
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
    type: SpaceType;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      tagline: string;
      displayName: string;
      type?: ProfileType | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
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
    type: SpaceType;
    subspaces: Array<{
      __typename?: 'Space';
      id: string;
      type: SpaceType;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
        type?: ProfileType | undefined;
        cardBanner2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        avatar2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    }>;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      tagline: string;
      displayName: string;
      type?: ProfileType | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    account: {
      __typename?: 'Account';
      id: string;
      license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
    };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
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
      type: SpaceType;
      subspaces: Array<{
        __typename?: 'Space';
        id: string;
        type: SpaceType;
        profile: {
          __typename?: 'Profile';
          id: string;
          url: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
          type?: ProfileType | undefined;
          cardBanner2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          avatar2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
        context: { __typename?: 'Context'; id: string; vision?: string | undefined };
        community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
      }>;
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        url: string;
        tagline: string;
        displayName: string;
        type?: ProfileType | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
      context: { __typename?: 'Context'; id: string; vision?: string | undefined };
      account: {
        __typename?: 'Account';
        id: string;
        license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
      };
      community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type SpaceExplorerSpaceFragment = {
  __typename?: 'Space';
  id: string;
  type: SpaceType;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    tagline: string;
    displayName: string;
    type?: ProfileType | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  account: {
    __typename?: 'Account';
    id: string;
    license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
  };
  community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
};

export type SpaceExplorerSubspaceFragment = {
  __typename?: 'Space';
  id: string;
  type: SpaceType;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    tagline: string;
    displayName: string;
    description?: string | undefined;
    type?: ProfileType | undefined;
    cardBanner2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    avatar2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
};

export type SpaceExplorerSpaceWithChallengesFragment = {
  __typename?: 'Space';
  id: string;
  type: SpaceType;
  subspaces: Array<{
    __typename?: 'Space';
    id: string;
    type: SpaceType;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
      type?: ProfileType | undefined;
      cardBanner2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      avatar2?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    context: { __typename?: 'Context'; id: string; vision?: string | undefined };
    community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
  }>;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    url: string;
    tagline: string;
    displayName: string;
    type?: ProfileType | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    cardBanner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  context: { __typename?: 'Context'; id: string; vision?: string | undefined };
  account: {
    __typename?: 'Account';
    id: string;
    license: { __typename?: 'License'; id: string; visibility: SpaceVisibility };
  };
  community: { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined };
};

export type SpaceExplorerWelcomeSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceExplorerWelcomeSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; url: string; displayName: string };
  };
};
