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
};

export type Apm = {
  __typename?: 'APM';
  /** Endpoint where events are sent. */
  endpoint: Scalars['String'];
  /** Flag indicating if real user monitoring is enabled. */
  rumEnabled: Scalars['Boolean'];
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
  CalloutWhiteboardCreated = 'CALLOUT_WHITEBOARD_CREATED',
  ChallengeCreated = 'CHALLENGE_CREATED',
  DiscussionComment = 'DISCUSSION_COMMENT',
  MemberJoined = 'MEMBER_JOINED',
  OpportunityCreated = 'OPPORTUNITY_CREATED',
  UpdateSent = 'UPDATE_SENT',
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
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
  /** The Post that was created. */
  reference: Reference;
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
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
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
  /** The user that triggered this Activity. */
  triggeredBy: User;
  /** The event type for this Activity. */
  type: ActivityEventType;
  /** The Whiteboard that was created. */
  whiteboard: Whiteboard;
};

export type ActivityLogEntryChallengeCreated = ActivityLogEntry & {
  __typename?: 'ActivityLogEntryChallengeCreated';
  /** The Challenge that was created. */
  challenge: Challenge;
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
  /** The Opportunity that was created. */
  opportunity: Opportunity;
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
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
  /** The Message that been sent to this Community. */
  message: Scalars['String'];
  /** The display name of the parent */
  parentDisplayName: Scalars['String'];
  /** The nameID of the parent */
  parentNameID: Scalars['NameID'];
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

export type AdminInnovationFlowSynchronizeStatesInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
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
  /** ID for the Challenge being applied to, if any. Or the Challenge containing the Opportunity being applied to. */
  challengeID?: Maybe<Scalars['UUID']>;
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** Date of creation */
  createdDate: Scalars['DateTime'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the application */
  id: Scalars['UUID'];
  /** ID for the Opportunity being applied to, if any. */
  opportunityID?: Maybe<Scalars['UUID']>;
  /** ID for the ultimate containing Space */
  spaceID: Scalars['UUID'];
  /** The current state of the application. */
  state: Scalars['String'];
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
  ChallengeAdmin = 'CHALLENGE_ADMIN',
  ChallengeHost = 'CHALLENGE_HOST',
  ChallengeLead = 'CHALLENGE_LEAD',
  ChallengeMember = 'CHALLENGE_MEMBER',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalAdminCommunity = 'GLOBAL_ADMIN_COMMUNITY',
  GlobalAdminSpaces = 'GLOBAL_ADMIN_SPACES',
  GlobalRegistered = 'GLOBAL_REGISTERED',
  InnovationPackProvider = 'INNOVATION_PACK_PROVIDER',
  OpportunityAdmin = 'OPPORTUNITY_ADMIN',
  OpportunityHost = 'OPPORTUNITY_HOST',
  OpportunityLead = 'OPPORTUNITY_LEAD',
  OpportunityMember = 'OPPORTUNITY_MEMBER',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  OrganizationAssociate = 'ORGANIZATION_ASSOCIATE',
  OrganizationOwner = 'ORGANIZATION_OWNER',
  SpaceAdmin = 'SPACE_ADMIN',
  SpaceHost = 'SPACE_HOST',
  SpaceLead = 'SPACE_LEAD',
  SpaceMember = 'SPACE_MEMBER',
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
  Admin = 'ADMIN',
  AuthorizationReset = 'AUTHORIZATION_RESET',
  CommunityAddMember = 'COMMUNITY_ADD_MEMBER',
  CommunityApply = 'COMMUNITY_APPLY',
  CommunityContextReview = 'COMMUNITY_CONTEXT_REVIEW',
  CommunityInvite = 'COMMUNITY_INVITE',
  CommunityInviteAccept = 'COMMUNITY_INVITE_ACCEPT',
  CommunityJoin = 'COMMUNITY_JOIN',
  Contribute = 'CONTRIBUTE',
  Create = 'CREATE',
  CreateCallout = 'CREATE_CALLOUT',
  CreateChallenge = 'CREATE_CHALLENGE',
  CreateDiscussion = 'CREATE_DISCUSSION',
  CreateMessage = 'CREATE_MESSAGE',
  CreateMessageReaction = 'CREATE_MESSAGE_REACTION',
  CreateMessageReply = 'CREATE_MESSAGE_REPLY',
  CreateOpportunity = 'CREATE_OPPORTUNITY',
  CreateOrganization = 'CREATE_ORGANIZATION',
  CreatePost = 'CREATE_POST',
  CreateRelation = 'CREATE_RELATION',
  CreateSpace = 'CREATE_SPACE',
  CreateWhiteboard = 'CREATE_WHITEBOARD',
  Delete = 'DELETE',
  FileDelete = 'FILE_DELETE',
  FileUpload = 'FILE_UPLOAD',
  Grant = 'GRANT',
  GrantGlobalAdmins = 'GRANT_GLOBAL_ADMINS',
  MovePost = 'MOVE_POST',
  PlatformAdmin = 'PLATFORM_ADMIN',
  Read = 'READ',
  ReadUsers = 'READ_USERS',
  Update = 'UPDATE',
  UpdateCalloutPublisher = 'UPDATE_CALLOUT_PUBLISHER',
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
  /** The user that created this Callout */
  createdBy?: Maybe<User>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Post template associated with this Callout. */
  postTemplate?: Maybe<PostTemplate>;
  /** The Posts associated with this Callout. */
  posts?: Maybe<Array<Post>>;
  /** The Profile for this Callout. */
  profile: Profile;
  /** The user that published this Callout */
  publishedBy?: Maybe<User>;
  /** The timestamp for the publishing of this Callout. */
  publishedDate?: Maybe<Scalars['Float']>;
  /** The sorting order for this Callout. */
  sortOrder: Scalars['Float'];
  /** State of the Callout. */
  state: CalloutState;
  /** The Callout type, e.g. Post, Whiteboard, Discussion */
  type: CalloutType;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
  /** The whiteboard template associated with this Callout. */
  whiteboardTemplate?: Maybe<WhiteboardTemplate>;
  /** The Whiteboards associated with this Callout. */
  whiteboards?: Maybe<Array<Whiteboard>>;
};

export type CalloutPostsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type CalloutWhiteboardsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export enum CalloutDisplayLocation {
  ChallengesLeft = 'CHALLENGES_LEFT',
  ChallengesRight = 'CHALLENGES_RIGHT',
  CommunityLeft = 'COMMUNITY_LEFT',
  CommunityRight = 'COMMUNITY_RIGHT',
  ContributeLeft = 'CONTRIBUTE_LEFT',
  ContributeRight = 'CONTRIBUTE_RIGHT',
  HomeLeft = 'HOME_LEFT',
  HomeRight = 'HOME_RIGHT',
  HomeTop = 'HOME_TOP',
  Knowledge = 'KNOWLEDGE',
  OpportunitiesLeft = 'OPPORTUNITIES_LEFT',
  OpportunitiesRight = 'OPPORTUNITIES_RIGHT',
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

export type Challenge = {
  __typename?: 'Challenge';
  /** The Agent representing this Challenge. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The set of child Challenges within this challenge. */
  challenges?: Maybe<Array<Challenge>>;
  /** Collaboration object for the base challenge */
  collaboration?: Maybe<Collaboration>;
  /** The community for the challenge. */
  community?: Maybe<Community>;
  /** The context for the challenge. */
  context?: Maybe<Context>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationFlow for the Challenge. */
  innovationFlow?: Maybe<InnovationFlow>;
  /** Metrics about activity within this Challenge. */
  metrics?: Maybe<Array<Nvp>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Opportunities for the challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
  /** The preferences for this Challenge */
  preferences: Array<Preference>;
  /** The Profile for the  Challenge. */
  profile: Profile;
  /** The ID of the containing Space. */
  spaceID: Scalars['String'];
  /** The StorageBucket with documents in use by this Challenge */
  storageBucket?: Maybe<StorageBucket>;
};

export type ChallengeOpportunitiesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type ChallengeCreated = {
  __typename?: 'ChallengeCreated';
  /** The Challenge that has been created. */
  challenge: Challenge;
  /** The identifier for the Space on which the Challenge was created. */
  spaceID: Scalars['UUID_NAMEID'];
};

export enum ChallengePreferenceType {
  AllowContributorsToCreateCallouts = 'ALLOW_CONTRIBUTORS_TO_CREATE_CALLOUTS',
  AllowContributorsToCreateOpportunities = 'ALLOW_CONTRIBUTORS_TO_CREATE_OPPORTUNITIES',
  AllowNonMembersReadAccess = 'ALLOW_NON_MEMBERS_READ_ACCESS',
  AllowSpaceMembersToContribute = 'ALLOW_SPACE_MEMBERS_TO_CONTRIBUTE',
  MembershipApplyChallengeFromSpaceMembers = 'MEMBERSHIP_APPLY_CHALLENGE_FROM_SPACE_MEMBERS',
  MembershipFeedbackOnChallengeContext = 'MEMBERSHIP_FEEDBACK_ON_CHALLENGE_CONTEXT',
  MembershipJoinChallengeFromSpaceMembers = 'MEMBERSHIP_JOIN_CHALLENGE_FROM_SPACE_MEMBERS',
}

export type ChallengeTemplate = {
  __typename?: 'ChallengeTemplate';
  /** Feedback templates. */
  feedback?: Maybe<Array<FeedbackTemplate>>;
  /** Challenge template name. */
  name: Scalars['String'];
};

export type Collaboration = {
  __typename?: 'Collaboration';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** List of callouts */
  callouts?: Maybe<Array<Callout>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** List of relations */
  relations?: Maybe<Array<Relation>>;
  /** The tagset templates on this Collaboration. */
  tagsetTemplates?: Maybe<Array<TagsetTemplate>>;
};

export type CollaborationCalloutsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  displayLocations?: InputMaybe<Array<CalloutDisplayLocation>>;
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
  applicationForm?: Maybe<Form>;
  /** Applications available for this community. */
  applications?: Maybe<Array<Application>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** All member users excluding the current lead users in this Community. */
  availableLeadUsers?: Maybe<PaginatedUsers>;
  /** All available users that are potential Community members. */
  availableMemberUsers?: Maybe<PaginatedUsers>;
  /** The Communications for this Community. */
  communication?: Maybe<Communication>;
  /** The displayName for this Community. */
  displayName?: Maybe<Scalars['String']>;
  /** Groups of users related to a Community. */
  groups?: Maybe<Array<UserGroup>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Invitations for this community. */
  invitations?: Maybe<Array<Invitation>>;
  /** Invitations to join this Community for users not yet on the Alkemio platform. */
  invitationsExternal?: Maybe<Array<InvitationExternal>>;
  /** All users that are contributing to this Community. */
  memberUsers?: Maybe<Array<User>>;
  /** The membership status of the currently logged in user. */
  myMembershipStatus?: Maybe<CommunityMembershipStatus>;
  /** All Organizations that have the specified Role in this Community. */
  organizationsInRole?: Maybe<Array<Organization>>;
  /** The policy that defines the roles for this Community. */
  policy?: Maybe<CommunityPolicy>;
  /** All users that have the specified Role in this Community. */
  usersInRole?: Maybe<Array<User>>;
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

export type CommunityMemberUsersArgs = {
  limit?: InputMaybe<Scalars['Float']>;
};

export type CommunityOrganizationsInRoleArgs = {
  role: CommunityRole;
};

export type CommunityUsersInRoleArgs = {
  role: CommunityRole;
};

export type CommunityApplyInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CommunityJoinInput = {
  communityID: Scalars['UUID'];
};

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
  /** The role policy that defines the hosts for this Community. */
  host: CommunityRolePolicy;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The role policy that defines the leads for this Community. */
  lead: CommunityRolePolicy;
  /** The role policy that defines the members for this Community. */
  member: CommunityRolePolicy;
};

export enum CommunityRole {
  Admin = 'ADMIN',
  Host = 'HOST',
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
  /** Integration with a 3rd party Geo information service */
  geo: Geo;
  /** Platform related resources. */
  platform: PlatformLocations;
  /** Sentry (client monitoring) related configuration. */
  sentry: Sentry;
  /** Configuration for storage providers, e.g. file */
  storage: StorageConfig;
  /** Alkemio template configuration. */
  template: Template;
};

export type Context = {
  __typename?: 'Context';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The EcosystemModel for this Context. */
  ecosystemModel?: Maybe<EcosystemModel>;
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
  /** Open applications for this contributor. */
  applications?: Maybe<Array<ApplicationForRoleResult>>;
  id: Scalars['UUID'];
  /** Open invitations for this contributor. */
  invitations?: Maybe<Array<InvitationForRoleResult>>;
  /** Details of the Organizations the User is a member of, with child memberships. */
  organizations: Array<RolesResultOrganization>;
  /** Details of Spaces the User or Organization is a member of, with child memberships */
  spaces: Array<RolesResultSpace>;
};

export type ConvertChallengeToSpaceInput = {
  /** The Challenge to be promoted to be a new Space. Note: the original Challenge will no longer exist after the conversion.  */
  challengeID: Scalars['UUID_NAMEID'];
};

export type ConvertOpportunityToChallengeInput = {
  /** The Opportunity to be promoted to be a new Challenge. Note: the original Opportunity will no longer exist after the conversion.  */
  opportunityID: Scalars['UUID_NAMEID'];
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

export type CreateCalloutOnCollaborationInput = {
  collaborationID: Scalars['UUID'];
  /** Set callout display location for this Callout. */
  displayLocation?: InputMaybe<CalloutDisplayLocation>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** PostTemplate data for Post Callouts. */
  postTemplate?: InputMaybe<CreatePostTemplateInput>;
  profile: CreateProfileInput;
  /** The sort order to assign to this Callout. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  /** Callout type. */
  type: CalloutType;
  /** Whiteboard data for whiteboard Callouts. */
  whiteboard?: InputMaybe<CreateWhiteboardInput>;
  /** WhiteboardTemplate data for whiteboard Callouts. */
  whiteboardTemplate?: InputMaybe<CreateWhiteboardTemplateInput>;
};

export type CreateChallengeOnChallengeInput = {
  challengeID: Scalars['UUID'];
  context?: InputMaybe<CreateContextInput>;
  /** The Innovation Flow template to use for the Challenge. */
  innovationFlowTemplateID?: InputMaybe<Scalars['UUID']>;
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateChallengeOnSpaceInput = {
  context?: InputMaybe<CreateContextInput>;
  /** The Innovation Flow template to use for the Challenge. */
  innovationFlowTemplateID?: InputMaybe<Scalars['UUID']>;
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  spaceID: Scalars['UUID_NAMEID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateContextInput = {
  impact?: InputMaybe<Scalars['Markdown']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type CreateFeedbackOnCommunityContextInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CreateInnovationFlowTemplateOnTemplatesSetInput = {
  /** The XState definition for this InnovationFlowTemplate. */
  definition: Scalars['LifecycleDefinition'];
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  /** The type of the InnovationFlows that this Template supports. */
  type: InnovationFlowType;
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

export type CreateLinkOnCalloutInput = {
  calloutID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
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

export type CreateNvpInput = {
  name: Scalars['String'];
  sortOrder: Scalars['Float'];
  value: Scalars['String'];
};

export type CreateOpportunityInput = {
  challengeID: Scalars['UUID'];
  context?: InputMaybe<CreateContextInput>;
  /** The Innovation Flow template to use for the Opportunity. */
  innovationFlowTemplateID?: InputMaybe<Scalars['UUID']>;
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
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

export type CreatePostOnCalloutInput = {
  calloutID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  type: Scalars['String'];
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreatePostTemplateInput = {
  /** The default description to be pre-filled when users create Posts based on this template. */
  defaultDescription: Scalars['Markdown'];
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  /** The type of Posts created from this Template. */
  type: Scalars['String'];
  visualUri?: InputMaybe<Scalars['String']>;
};

export type CreatePostTemplateOnTemplatesSetInput = {
  /** The default description to be pre-filled when users create Posts based on this template. */
  defaultDescription: Scalars['Markdown'];
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

export type CreateProjectInput = {
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  opportunityID: Scalars['UUID_NAMEID'];
  profileData: CreateProfileInput;
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
  context?: InputMaybe<CreateContextInput>;
  /** The host Organization for the space */
  hostID: Scalars['UUID_NAMEID'];
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData: CreateProfileInput;
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
  /** The name of the UserGroup. Minimum length 2. */
  name: Scalars['String'];
  parentID: Scalars['UUID'];
  profileData?: InputMaybe<CreateProfileInput>;
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

export type CreateWhiteboardInput = {
  /** A readable identifier, unique within the containing scope. If not provided it will be generated based on the displayName. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  value?: InputMaybe<Scalars['String']>;
};

export type CreateWhiteboardOnCalloutInput = {
  calloutID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. If not provided it will be generated based on the displayName. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData: CreateProfileInput;
  value?: InputMaybe<Scalars['String']>;
};

export type CreateWhiteboardTemplateInput = {
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  value?: InputMaybe<Scalars['JSON']>;
  visualUri?: InputMaybe<Scalars['String']>;
  /** Use the specified Whiteboard as the initial value for this WhiteboardTemplate */
  whiteboardID?: InputMaybe<Scalars['UUID']>;
};

export type CreateWhiteboardTemplateOnTemplatesSetInput = {
  profile: CreateProfileInput;
  tags?: InputMaybe<Array<Scalars['String']>>;
  templatesSetID: Scalars['UUID'];
  value?: InputMaybe<Scalars['JSON']>;
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

export type DeleteChallengeInput = {
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

export type DeleteOpportunityInput = {
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

export type DeleteProjectInput = {
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

export type DeleteUserGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
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
  Sharing = 'SHARING',
}

export type Document = {
  __typename?: 'Document';
  /** Do we allow anonymous read access for this document? */
  anonymousReadAccess: Scalars['Boolean'];
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

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  /** Whether the feature flag is enabled / disabled. */
  enabled: Scalars['Boolean'];
  /** The name of the feature flag */
  name: Scalars['String'];
};

export type FeedbackTemplate = {
  __typename?: 'FeedbackTemplate';
  /** Feedback template name. */
  name: Scalars['String'];
  /** Template questions. */
  questions: Array<QuestionTemplate>;
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

export type Groupable = {
  /** The groups contained by this entity. */
  groups?: Maybe<Array<UserGroup>>;
};

export type ISearchResults = {
  __typename?: 'ISearchResults';
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

export type InnovationFlow = {
  __typename?: 'InnovationFlow';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Lifecycle being used by this InnovationFlow */
  lifecycle?: Maybe<Lifecycle>;
  /** The Profile for this InnovationFlow. */
  profile: Profile;
  /** The InnovationFlow type, e.g. Challenge, Opportunity */
  type: InnovationFlowType;
};

export type InnovationFlowEvent = {
  eventName: Scalars['String'];
  innovationFlowID: Scalars['UUID'];
};

export type InnovationFlowTemplate = {
  __typename?: 'InnovationFlowTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The XState definition for this InnovationFlowTemplate. */
  definition: Scalars['LifecycleDefinition'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
  /** The type for this InnovationFlowTemplate. */
  type: InnovationFlowType;
};

export enum InnovationFlowType {
  Challenge = 'CHALLENGE',
  Opportunity = 'OPPORTUNITY',
}

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
  /** ID for the Challenge being invited to, if any. Or the Challenge containing the Opportunity being invited to. */
  challengeID?: Maybe<Scalars['UUID']>;
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
  /** ID for the Opportunity being invited to, if any. */
  opportunityID?: Maybe<Scalars['UUID']>;
  /** ID for the ultimate containing Space */
  spaceID: Scalars['UUID'];
  /** The current state of the invitation. */
  state: Scalars['String'];
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
  /** The welcome message of the invitation */
  welcomeMessage?: Maybe<Scalars['UUID']>;
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
  /** The StorageBucket with documents in use by this User */
  storageBucket?: Maybe<StorageBucket>;
};

export type LibraryInnovationPackArgs = {
  ID: Scalars['UUID_NAMEID'];
};

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
  /** Lookup the specified Callout */
  callout?: Maybe<Callout>;
  /** Lookup the specified Collaboration */
  collaboration?: Maybe<Collaboration>;
  /** Lookup the specified Community */
  community?: Maybe<Community>;
  /** Lookup the specified Context */
  context?: Maybe<Context>;
  /** Lookup the specified InnovationFlow */
  innovationFlow?: Maybe<InnovationFlow>;
  /** Lookup the specified InnovationFlow Template */
  innovationFlowTemplate?: Maybe<InnovationFlowTemplate>;
  /** Lookup the specified Post */
  post?: Maybe<Post>;
  /** Lookup the specified Profile */
  profile?: Maybe<Profile>;
  /** Lookup the specified Room */
  room?: Maybe<Room>;
  /** Lookup the specified Whiteboard */
  whiteboard?: Maybe<Whiteboard>;
  /** Lookup the specified Whiteboard Template */
  whiteboardTemplate?: Maybe<WhiteboardTemplate>;
};

export type LookupQueryResultsCalloutArgs = {
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

export type LookupQueryResultsInnovationFlowArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsInnovationFlowTemplateArgs = {
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

export type LookupQueryResultsWhiteboardArgs = {
  ID: Scalars['UUID'];
};

export type LookupQueryResultsWhiteboardTemplateArgs = {
  ID: Scalars['UUID'];
};

export type MeQueryResults = {
  __typename?: 'MeQueryResults';
  /** The applications of the current authenticated user */
  applications: Array<Application>;
  /** The invitations of the current authenticated user */
  invitations: Array<Invitation>;
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

export type MeQueryResultsSpaceMembershipsArgs = {
  visibilities?: InputMaybe<Array<SpaceVisibility>>;
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
  /** The user that created this Post */
  sender?: Maybe<User>;
  /** The message being replied to */
  threadID?: Maybe<Scalars['String']>;
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

export type Metadata = {
  __typename?: 'Metadata';
  /** Metrics about the activity on the platform */
  metrics: Array<Nvp>;
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

export type MovePostInput = {
  /** ID of the Callout to move the Post to. */
  calloutID: Scalars['UUID'];
  /** ID of the Post to move. */
  postID: Scalars['UUID'];
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
  /** Updates the States tagset to be synchronized with the Lifecycle states. */
  adminInnovationFlowSynchronizeStates: Tagset;
  /** Migrate all ipfs links to use new storage access api */
  adminStorageMigrateIpfsUrls: Scalars['Boolean'];
  /** Apply to join the specified Community as a member. */
  applyForCommunityMembership: Application;
  /** Assigns an Organization a Role in the specified Community. */
  assignCommunityRoleToOrganization: Organization;
  /** Assigns a User to a role in the specified Community. */
  assignCommunityRoleToUser: User;
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
  authorizationPolicyResetAll: Scalars['Boolean'];
  /** Reset the Authorization Policy on the specified Organization. */
  authorizationPolicyResetOnOrganization: Organization;
  /** Reset the Authorization Policy on the specified Platform. */
  authorizationPolicyResetOnPlatform: Platform;
  /** Reset the Authorization Policy on the specified Space. */
  authorizationPolicyResetOnSpace: Space;
  /** Reset the Authorization policy on the specified User. */
  authorizationPolicyResetOnUser: User;
  /** Generate Alkemio user credential offer */
  beginAlkemioUserVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate community member credential offer */
  beginCommunityMemberVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate verified credential share request */
  beginVerifiedCredentialRequestInteraction: AgentBeginVerifiedCredentialRequestOutput;
  /** Creates a new Space by converting an existing Challenge. */
  convertChallengeToSpace: Space;
  /** Creates a new Challenge by converting an existing Opportunity. */
  convertOpportunityToChallenge: Challenge;
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the EcosystemModel. */
  createActorGroup: ActorGroup;
  /** Create a new Callout on the Collaboration. */
  createCalloutOnCollaboration: Callout;
  /** Creates a new Challenge within the specified Space. */
  createChallenge: Challenge;
  /** Creates a new child challenge within the parent Challenge. */
  createChildChallenge: Challenge;
  /** Creates a new Discussion as part of this Communication. */
  createDiscussion: Discussion;
  /** Create a new CalendarEvent on the Calendar. */
  createEventOnCalendar: CalendarEvent;
  /** Creates feedback on community context from users having COMMUNITY_CONTEXT_REVIEW privilege */
  createFeedbackOnCommunityContext: Scalars['Boolean'];
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
  /** Create a new Link on the Callout. */
  createLinkOnCallout: Reference;
  /** Creates a new Opportunity within the parent Challenge. */
  createOpportunity: Opportunity;
  /** Creates a new Organization on the platform. */
  createOrganization: Organization;
  /** Create a new Post on the Callout. */
  createPostOnCallout: Post;
  /** Creates a new PostTemplate on the specified TemplatesSet. */
  createPostTemplate: PostTemplate;
  /** Create a new Project on the Opportunity */
  createProject: Project;
  /** Creates a new Reference on the specified Profile. */
  createReferenceOnProfile: Reference;
  /** Create a new Relation on the Collaboration. */
  createRelationOnCollaboration: Relation;
  /** Creates a new Space. */
  createSpace: Space;
  /** Creates a new Tagset on the specified Profile */
  createTagsetOnProfile: Tagset;
  /** Creates a new User on the platform. */
  createUser: User;
  /** Creates a new User profile on the platform for a user that has a valid Authentication session. */
  createUserNewRegistration: User;
  /** Create a new Whiteboard on the Callout. */
  createWhiteboardOnCallout: Whiteboard;
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
  /** Deletes the specified Challenge. */
  deleteChallenge: Challenge;
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
  /** Deletes the specified Opportunity. */
  deleteOpportunity: Opportunity;
  /** Deletes the specified Organization. */
  deleteOrganization: Organization;
  /** Deletes the specified Post. */
  deletePost: Post;
  /** Deletes the specified PostTemplate. */
  deletePostTemplate: PostTemplate;
  /** Deletes the specified Project. */
  deleteProject: Project;
  /** Deletes the specified Reference. */
  deleteReference: Reference;
  /** Deletes the specified Relation. */
  deleteRelation: Relation;
  /** Deletes the specified Space. */
  deleteSpace: Space;
  /** Deletes the specified User. */
  deleteUser: User;
  /** Removes the specified User Application. */
  deleteUserApplication: Application;
  /** Deletes the specified User Group. */
  deleteUserGroup: UserGroup;
  /** Updates the specified Whiteboard. */
  deleteWhiteboard: Whiteboard;
  /** Deletes the specified WhiteboardTemplate. */
  deleteWhiteboardTemplate: WhiteboardTemplate;
  /** Trigger an event on the Application. */
  eventOnApplication: Application;
  /** Trigger an event on the InnovationFlow for a Challenge. */
  eventOnChallenge: InnovationFlow;
  /** Trigger an event on the Invitation. */
  eventOnCommunityInvitation: Application;
  /** Trigger an event on the InnovationFlow for an Opportunity. */
  eventOnOpportunity: InnovationFlow;
  /** Trigger an event on the Organization Verification. */
  eventOnOrganizationVerification: OrganizationVerification;
  /** Trigger an event on the Project. */
  eventOnProject: Project;
  /** Trigger an event on the Organization Verification. */
  eventOnWhiteboardCheckout: WhiteboardCheckout;
  /** Grants an authorization credential to a User. */
  grantCredentialToUser: User;
  /** Invite an existing User to join the specified Community as a member. */
  inviteExistingUserForCommunityMembership: Array<Invitation>;
  /** Invite an external User to join the specified Community as a member. */
  inviteExternalUserForCommunityMembership: InvitationExternal;
  /** Join the specified Community as a member, without going through an approval process. */
  joinCommunity: Community;
  /** Sends a message on the specified User`s behalf and returns the room id */
  messageUser: Scalars['String'];
  /** Moves the specified Post to another Callout. */
  movePostToCallout: Post;
  /** Removes an Organization from a Role in the specified Community. */
  removeCommunityRoleFromOrganization: Organization;
  /** Removes a User from a Role in the specified Community. */
  removeCommunityRoleFromUser: User;
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
  /** Updates the specified Actor. */
  updateActor: Actor;
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
  /** Updates the specified Challenge. */
  updateChallenge: Challenge;
  /** Update the Application Form used by this Community. */
  updateCommunityApplicationForm: Community;
  /** Updates the specified Discussion. */
  updateDiscussion: Discussion;
  /** Updates the specified Document. */
  updateDocument: Document;
  /** Updates the specified EcosystemModel. */
  updateEcosystemModel: EcosystemModel;
  /** Updates the InnovationFlow. */
  updateInnovationFlow: InnovationFlow;
  /** Updates the template for the specified Innovation Flow. */
  updateInnovationFlowLifecycleTemplate: InnovationFlow;
  /** Updates the specified InnovationFlowTemplate. */
  updateInnovationFlowTemplate: InnovationFlowTemplate;
  /** Update Innovation Hub. */
  updateInnovationHub: InnovationHub;
  /** Updates the InnovationPack. */
  updateInnovationPack: InnovationPack;
  /** Updates the specified Opportunity. */
  updateOpportunity: Opportunity;
  /** Updates the specified Organization. */
  updateOrganization: Organization;
  /** Updates the specified Post. */
  updatePost: Post;
  /** Updates the specified PostTemplate. */
  updatePostTemplate: PostTemplate;
  /** Updates one of the Preferences on a Challenge */
  updatePreferenceOnChallenge: Preference;
  /** Updates one of the Preferences on an Organization */
  updatePreferenceOnOrganization: Preference;
  /** Updates one of the Preferences on a Space */
  updatePreferenceOnSpace: Preference;
  /** Updates one of the Preferences on a Space */
  updatePreferenceOnUser: Preference;
  /** Updates the specified Profile. */
  updateProfile: Profile;
  /** Updates the specified Project. */
  updateProject: Project;
  /** Updates the Space. */
  updateSpace: Space;
  /** Update the platform settings, such as visibility, of the specified Space. */
  updateSpacePlatformSettings: Space;
  /** Updates the specified Tagset. */
  updateTagset: Tagset;
  /** Updates the User. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Updates the image URI for the specified Visual. */
  updateVisual: Visual;
  /** Updates the specified Whiteboard. */
  updateWhiteboard: Whiteboard;
  /** Updates the specified WhiteboardTemplate. */
  updateWhiteboardTemplate: WhiteboardTemplate;
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

export type MutationAdminInnovationFlowSynchronizeStatesArgs = {
  innovationFlowData: AdminInnovationFlowSynchronizeStatesInput;
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

export type MutationAuthorizationPolicyResetOnOrganizationArgs = {
  authorizationResetData: OrganizationAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnSpaceArgs = {
  authorizationResetData: SpaceAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnUserArgs = {
  authorizationResetData: UserAuthorizationResetInput;
};

export type MutationBeginCommunityMemberVerifiedCredentialOfferInteractionArgs = {
  communityID: Scalars['String'];
};

export type MutationBeginVerifiedCredentialRequestInteractionArgs = {
  types: Array<Scalars['String']>;
};

export type MutationConvertChallengeToSpaceArgs = {
  convertData: ConvertChallengeToSpaceInput;
};

export type MutationConvertOpportunityToChallengeArgs = {
  convertData: ConvertOpportunityToChallengeInput;
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

export type MutationCreateChallengeArgs = {
  challengeData: CreateChallengeOnSpaceInput;
};

export type MutationCreateChildChallengeArgs = {
  challengeData: CreateChallengeOnChallengeInput;
};

export type MutationCreateDiscussionArgs = {
  createData: CommunicationCreateDiscussionInput;
};

export type MutationCreateEventOnCalendarArgs = {
  eventData: CreateCalendarEventOnCalendarInput;
};

export type MutationCreateFeedbackOnCommunityContextArgs = {
  feedbackData: CreateFeedbackOnCommunityContextInput;
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

export type MutationCreateLinkOnCalloutArgs = {
  linkData: CreateLinkOnCalloutInput;
};

export type MutationCreateOpportunityArgs = {
  opportunityData: CreateOpportunityInput;
};

export type MutationCreateOrganizationArgs = {
  organizationData: CreateOrganizationInput;
};

export type MutationCreatePostOnCalloutArgs = {
  postData: CreatePostOnCalloutInput;
};

export type MutationCreatePostTemplateArgs = {
  postTemplateInput: CreatePostTemplateOnTemplatesSetInput;
};

export type MutationCreateProjectArgs = {
  projectData: CreateProjectInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: CreateReferenceOnProfileInput;
};

export type MutationCreateRelationOnCollaborationArgs = {
  relationData: CreateRelationOnCollaborationInput;
};

export type MutationCreateSpaceArgs = {
  spaceData: CreateSpaceInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetData: CreateTagsetOnProfileInput;
};

export type MutationCreateUserArgs = {
  userData: CreateUserInput;
};

export type MutationCreateWhiteboardOnCalloutArgs = {
  whiteboardData: CreateWhiteboardOnCalloutInput;
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

export type MutationDeleteChallengeArgs = {
  deleteData: DeleteChallengeInput;
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

export type MutationDeleteOpportunityArgs = {
  deleteData: DeleteOpportunityInput;
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

export type MutationDeleteProjectArgs = {
  deleteData: DeleteProjectInput;
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

export type MutationDeleteUserArgs = {
  deleteData: DeleteUserInput;
};

export type MutationDeleteUserApplicationArgs = {
  deleteData: DeleteApplicationInput;
};

export type MutationDeleteUserGroupArgs = {
  deleteData: DeleteUserGroupInput;
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

export type MutationEventOnChallengeArgs = {
  innovationFlowEventData: InnovationFlowEvent;
};

export type MutationEventOnCommunityInvitationArgs = {
  invitationEventData: InvitationEventInput;
};

export type MutationEventOnOpportunityArgs = {
  innovationFlowEventData: InnovationFlowEvent;
};

export type MutationEventOnOrganizationVerificationArgs = {
  organizationVerificationEventData: OrganizationVerificationEventInput;
};

export type MutationEventOnProjectArgs = {
  projectEventData: ProjectEventInput;
};

export type MutationEventOnWhiteboardCheckoutArgs = {
  whiteboardCheckoutEventData: WhiteboardCheckoutEventInput;
};

export type MutationGrantCredentialToUserArgs = {
  grantCredentialData: GrantAuthorizationCredentialInput;
};

export type MutationInviteExistingUserForCommunityMembershipArgs = {
  invitationData: CreateInvitationExistingUserOnCommunityInput;
};

export type MutationInviteExternalUserForCommunityMembershipArgs = {
  invitationData: CreateInvitationExternalUserOnCommunityInput;
};

export type MutationJoinCommunityArgs = {
  joinCommunityData: CommunityJoinInput;
};

export type MutationMessageUserArgs = {
  messageData: UserSendMessageInput;
};

export type MutationMovePostToCalloutArgs = {
  movePostData: MovePostInput;
};

export type MutationRemoveCommunityRoleFromOrganizationArgs = {
  roleData: RemoveCommunityRoleFromOrganizationInput;
};

export type MutationRemoveCommunityRoleFromUserArgs = {
  roleData: RemoveCommunityRoleFromUserInput;
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

export type MutationUpdateActorArgs = {
  actorData: UpdateActorInput;
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

export type MutationUpdateCalloutVisibilityArgs = {
  calloutData: UpdateCalloutVisibilityInput;
};

export type MutationUpdateCalloutsSortOrderArgs = {
  sortOrderData: UpdateCollaborationCalloutsSortOrderInput;
};

export type MutationUpdateChallengeArgs = {
  challengeData: UpdateChallengeInput;
};

export type MutationUpdateCommunityApplicationFormArgs = {
  applicationFormData: UpdateCommunityApplicationFormInput;
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

export type MutationUpdateInnovationFlowLifecycleTemplateArgs = {
  innovationFlowData: UpdateInnovationFlowLifecycleTemplateInput;
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

export type MutationUpdateOpportunityArgs = {
  opportunityData: UpdateOpportunityInput;
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

export type MutationUpdatePreferenceOnChallengeArgs = {
  preferenceData: UpdateChallengePreferenceInput;
};

export type MutationUpdatePreferenceOnOrganizationArgs = {
  preferenceData: UpdateOrganizationPreferenceInput;
};

export type MutationUpdatePreferenceOnSpaceArgs = {
  preferenceData: UpdateSpacePreferenceInput;
};

export type MutationUpdatePreferenceOnUserArgs = {
  preferenceData: UpdateUserPreferenceInput;
};

export type MutationUpdateProfileArgs = {
  profileData: UpdateProfileDirectInput;
};

export type MutationUpdateProjectArgs = {
  projectData: UpdateProjectInput;
};

export type MutationUpdateSpaceArgs = {
  spaceData: UpdateSpaceInput;
};

export type MutationUpdateSpacePlatformSettingsArgs = {
  updateData: UpdateSpacePlatformSettingsInput;
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

export type MutationUpdateVisualArgs = {
  updateData: UpdateVisualInput;
};

export type MutationUpdateWhiteboardArgs = {
  whiteboardData: UpdateWhiteboardDirectInput;
};

export type MutationUpdateWhiteboardTemplateArgs = {
  whiteboardTemplateInput: UpdateWhiteboardTemplateInput;
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

export type Nvp = {
  __typename?: 'NVP';
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Opportunity = {
  __typename?: 'Opportunity';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** Collaboration object for the base challenge */
  collaboration?: Maybe<Collaboration>;
  /** The community for the Opportunity. */
  community?: Maybe<Community>;
  /** The context for the Opportunity. */
  context?: Maybe<Context>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The InnovationFlow for the Opportunity. */
  innovationFlow?: Maybe<InnovationFlow>;
  /** Metrics about the activity within this Opportunity. */
  metrics?: Maybe<Array<Nvp>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The parent entity name (challenge) ID. */
  parentNameID?: Maybe<Scalars['String']>;
  /** The Profile for the Opportunity. */
  profile: Profile;
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
};

export type OpportunityCreated = {
  __typename?: 'OpportunityCreated';
  /** The identifier for the Challenge on which the Opportunity was created. */
  challengeID: Scalars['UUID'];
  /** The Opportunity that has been created. */
  opportunity: Opportunity;
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
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** All Users that are owners of this Organization. */
  owners?: Maybe<Array<User>>;
  /** The preferences for this Organization */
  preferences: Array<Preference>;
  /** The profile for this organization. */
  profile: Profile;
  /** The StorageBucket with documents in use by this Organization */
  storageBucket?: Maybe<StorageBucket>;
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
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  pageInfo: PageInfo;
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
  /** The Innovation Library for the platform */
  library: Library;
  /** Alkemio Services Metadata. */
  metadata: Metadata;
  /** The StorageBucket with documents in use by Users + Organizations on the Platform. */
  storageBucket: StorageBucket;
};

export type PlatformInnovationHubArgs = {
  id?: InputMaybe<Scalars['UUID_NAMEID']>;
  subdomain?: InputMaybe<Scalars['String']>;
};

export type PlatformLocations = {
  __typename?: 'PlatformLocations';
  /** URL to a page about the platform */
  about: Scalars['String'];
  /** URL where users can get tips and tricks */
  aup: Scalars['String'];
  /** URL where users can see the community forum */
  community: Scalars['String'];
  /** Main domain of the environment */
  domain: Scalars['String'];
  /** Name of the environment */
  environment: Scalars['String'];
  /** The feature flags for the platform */
  featureFlags: Array<FeatureFlag>;
  /** URL to a form for providing feedback */
  feedback: Scalars['String'];
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
  /** The parent Callout of the Post */
  callout?: Maybe<Callout>;
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
  AllowContributorsToCreateCallouts = 'ALLOW_CONTRIBUTORS_TO_CREATE_CALLOUTS',
  AllowContributorsToCreateOpportunities = 'ALLOW_CONTRIBUTORS_TO_CREATE_OPPORTUNITIES',
  AllowMembersToCreateCallouts = 'ALLOW_MEMBERS_TO_CREATE_CALLOUTS',
  AllowMembersToCreateChallenges = 'ALLOW_MEMBERS_TO_CREATE_CHALLENGES',
  AllowNonMembersReadAccess = 'ALLOW_NON_MEMBERS_READ_ACCESS',
  AllowSpaceMembersToContribute = 'ALLOW_SPACE_MEMBERS_TO_CONTRIBUTE',
  AuthorizationAnonymousReadAccess = 'AUTHORIZATION_ANONYMOUS_READ_ACCESS',
  AuthorizationOrganizationMatchDomain = 'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN',
  MembershipApplicationsFromAnyone = 'MEMBERSHIP_APPLICATIONS_FROM_ANYONE',
  MembershipApplyChallengeFromSpaceMembers = 'MEMBERSHIP_APPLY_CHALLENGE_FROM_SPACE_MEMBERS',
  MembershipFeedbackOnChallengeContext = 'MEMBERSHIP_FEEDBACK_ON_CHALLENGE_CONTEXT',
  MembershipJoinChallengeFromSpaceMembers = 'MEMBERSHIP_JOIN_CHALLENGE_FROM_SPACE_MEMBERS',
  MembershipJoinSpaceFromAnyone = 'MEMBERSHIP_JOIN_SPACE_FROM_ANYONE',
  MembershipJoinSpaceFromHostOrganizationMembers = 'MEMBERSHIP_JOIN_SPACE_FROM_HOST_ORGANIZATION_MEMBERS',
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
  storageBucket?: Maybe<StorageBucket>;
  /** The taglie for this entity. */
  tagline: Scalars['String'];
  /** The default or named tagset. */
  tagset?: Maybe<Tagset>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
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

export type Project = {
  __typename?: 'Project';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Project. */
  profile: Profile;
};

export type ProjectEventInput = {
  /** The ID of the entity to which the event is sent */
  ID: Scalars['String'];
  /** The name of the event. Simple text and matching an event in the Lifecycle definition. */
  eventName: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve the ActivityLog for the specified Collaboration */
  activityLogOnCollaboration: Array<ActivityLogEntry>;
  /** All Users that are members of a given room */
  adminCommunicationMembership: CommunicationAdminMembershipResult;
  /** Usage of the messaging platform that are not tied to the domain model. */
  adminCommunicationOrphanedUsage: CommunicationAdminOrphanedUsageResult;
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
  /** The Spaces on this platform */
  spaces: Array<Space>;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** Privileges assigned to a User (based on held credentials) given an Authorization defnition. */
  userAuthorizationPrivileges: Array<AuthorizationPrivilege>;
  /** The users who have profiles on this platform */
  users: Array<User>;
  /** The users filtered by list of IDs. */
  usersById: Array<User>;
  /** The users who have profiles on this platform */
  usersPaginated: PaginatedUsers;
  /** All Users that hold credentials matching the supplied criteria. */
  usersWithAuthorizationCredential: Array<User>;
};

export type QueryActivityLogOnCollaborationArgs = {
  queryData: ActivityLogInput;
};

export type QueryAdminCommunicationMembershipArgs = {
  communicationData: CommunicationAdminMembershipInput;
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

export type QueryUserArgs = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
};

export type QueryUserAuthorizationPrivilegesArgs = {
  userAuthorizationPrivilegesData: UserAuthorizationPrivilegesInput;
};

export type QueryUsersArgs = {
  filter?: InputMaybe<ContributorFilterInput>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryUsersByIdArgs = {
  IDs: Array<Scalars['UUID']>;
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

export type Question = {
  __typename?: 'Question';
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  /** Question template. */
  question: Scalars['String'];
  /** Is question required? */
  required: Scalars['Boolean'];
  /** Sorting order for the question. Lower is first. */
  sortOrder?: Maybe<Scalars['Float']>;
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
  /** Details of the Challenges the user is a member of */
  challenges: Array<RolesResultCommunity>;
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** Details of the Opportunities the Contributor is a member of */
  opportunities: Array<RolesResultCommunity>;
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** The Space ID */
  spaceID: Scalars['String'];
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
  /** Restrict the search to only the specified entity types. Values allowed: user, group, organization, Default is all. */
  typesFilter?: InputMaybe<Array<Scalars['String']>>;
};

export type SearchResult = {
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The event type for this Activity. */
  type: SearchResultType;
};

export type SearchResultChallenge = SearchResult & {
  __typename?: 'SearchResultChallenge';
  /** The Challenge that was found. */
  challenge: Challenge;
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space that the Challenge is in. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The event type for this Activity. */
  type: SearchResultType;
};

export type SearchResultOpportunity = SearchResult & {
  __typename?: 'SearchResultOpportunity';
  /** The Challenge that the Opportunity is in. */
  challenge: Challenge;
  id: Scalars['UUID'];
  /** The Opportunity that was found. */
  opportunity: Opportunity;
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space that the Opportunity is in. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The event type for this Activity. */
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
  /** The event type for this Activity. */
  type: SearchResultType;
};

export type SearchResultPost = SearchResult & {
  __typename?: 'SearchResultPost';
  /** The Callout of the Post. */
  callout: Callout;
  /** The Challenge of the Post. Applicable for Callouts on Opportunities and Challenges. */
  challenge?: Maybe<Challenge>;
  id: Scalars['UUID'];
  /** The Opportunity of the Post. Applicable only for Callouts on Opportunities. */
  opportunity?: Maybe<Opportunity>;
  /** The Post that was found. */
  post: Post;
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space of the Post. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The event type for this Activity. */
  type: SearchResultType;
};

export type SearchResultSpace = SearchResult & {
  __typename?: 'SearchResultSpace';
  id: Scalars['UUID'];
  /** The score for this search result; more matches means a higher score. */
  score: Scalars['Float'];
  /** The Space that was found. */
  space: Space;
  /** The terms that were matched for this result */
  terms: Array<Scalars['String']>;
  /** The event type for this Activity. */
  type: SearchResultType;
};

export enum SearchResultType {
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
  /** The event type for this Activity. */
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
  /** The event type for this Activity. */
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

export type Space = {
  __typename?: 'Space';
  /** The Agent representing this Space. */
  agent?: Maybe<Agent>;
  /** A particular User Application within this Space. */
  application: Application;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A particular Challenge, either by its ID or nameID */
  challenge: Challenge;
  /** The challenges for the space. */
  challenges?: Maybe<Array<Challenge>>;
  /** Collaboration object for the base challenge */
  collaboration?: Maybe<Collaboration>;
  /** Get a Community within the Space. Defaults to the Community for the Space itself. */
  community?: Maybe<Community>;
  /** The context for the space. */
  context?: Maybe<Context>;
  /** The user group with the specified id anywhere in the space */
  group: UserGroup;
  /** The User Groups on this Space */
  groups: Array<UserGroup>;
  /** The Space host. */
  host?: Maybe<Organization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Metrics about activity within this Space. */
  metrics?: Maybe<Array<Nvp>>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** All opportunities within the space */
  opportunities?: Maybe<Array<Opportunity>>;
  /** A particular Opportunity, either by its ID or nameID */
  opportunity: Opportunity;
  /** The preferences for this Space */
  preferences?: Maybe<Array<Preference>>;
  /** The Profile for the  space. */
  profile: Profile;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this space */
  projects: Array<Project>;
  /** The StorageBucket with documents in use by this Space */
  storageBucket?: Maybe<StorageBucket>;
  /** The templates in use by this Space */
  templates?: Maybe<TemplatesSet>;
  /** The timeline with events in use by this Space */
  timeline?: Maybe<Timeline>;
  /** Visibility of the Space. */
  visibility: SpaceVisibility;
};

export type SpaceApplicationArgs = {
  ID: Scalars['UUID'];
};

export type SpaceChallengeArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type SpaceChallengesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type SpaceCommunityArgs = {
  ID?: InputMaybe<Scalars['UUID']>;
};

export type SpaceGroupArgs = {
  ID: Scalars['UUID'];
};

export type SpaceOpportunitiesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
};

export type SpaceOpportunityArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type SpaceProjectArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type SpaceAuthorizationResetInput = {
  /** The identifier of the Space whose Authorization Policy should be reset. */
  spaceID: Scalars['UUID_NAMEID'];
};

export type SpaceFilterInput = {
  /** Return Spaces with a Visibility matching one of the provided types. */
  visibilities?: InputMaybe<Array<SpaceVisibility>>;
};

export enum SpacePreferenceType {
  AllowMembersToCreateCallouts = 'ALLOW_MEMBERS_TO_CREATE_CALLOUTS',
  AllowMembersToCreateChallenges = 'ALLOW_MEMBERS_TO_CREATE_CHALLENGES',
  AuthorizationAnonymousReadAccess = 'AUTHORIZATION_ANONYMOUS_READ_ACCESS',
  MembershipApplicationsFromAnyone = 'MEMBERSHIP_APPLICATIONS_FROM_ANYONE',
  MembershipJoinSpaceFromAnyone = 'MEMBERSHIP_JOIN_SPACE_FROM_ANYONE',
  MembershipJoinSpaceFromHostOrganizationMembers = 'MEMBERSHIP_JOIN_SPACE_FROM_HOST_ORGANIZATION_MEMBERS',
}

export enum SpaceVisibility {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Demo = 'DEMO',
}

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

export type StorageBucketUploadFileInput = {
  storageBucketId: Scalars['String'];
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
  /** Receive new Challenges created on the Space. */
  challengeCreated: ChallengeCreated;
  /** Receive updates on Discussions */
  communicationDiscussionUpdated: Discussion;
  /** Receive new Opportunities created on the Challenge. */
  opportunityCreated: OpportunityCreated;
  /** Received on verified credentials change */
  profileVerifiedCredential: ProfileCredentialVerified;
  /** Receive Room event */
  roomEvents: RoomEventSubscriptionResult;
  /** Receive updated content of a whiteboard */
  whiteboardContentUpdated: WhiteboardContentUpdated;
};

export type SubscriptionActivityCreatedArgs = {
  input: ActivityCreatedSubscriptionInput;
};

export type SubscriptionCalloutPostCreatedArgs = {
  calloutID: Scalars['UUID'];
};

export type SubscriptionChallengeCreatedArgs = {
  spaceID: Scalars['UUID_NAMEID'];
};

export type SubscriptionCommunicationDiscussionUpdatedArgs = {
  communicationID: Scalars['UUID'];
};

export type SubscriptionOpportunityCreatedArgs = {
  challengeID: Scalars['UUID'];
};

export type SubscriptionRoomEventsArgs = {
  roomID: Scalars['UUID'];
};

export type SubscriptionWhiteboardContentUpdatedArgs = {
  whiteboardIDs: Array<Scalars['UUID']>;
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
  CalloutDisplayLocation = 'CALLOUT_DISPLAY_LOCATION',
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

export type Template = {
  __typename?: 'Template';
  /** Challenge templates. */
  challenges: Array<ChallengeTemplate>;
  /** Template description. */
  description: Scalars['String'];
  /** Template name. */
  name: Scalars['String'];
};

export type TemplatesSet = {
  __typename?: 'TemplatesSet';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A single InnovationFlowTemplate */
  innovationFlowTemplate?: Maybe<InnovationFlowTemplate>;
  /** The InnovationFlowTemplates in this TemplatesSet. */
  innovationFlowTemplates: Array<InnovationFlowTemplate>;
  /** The policy for this TemplatesSet. */
  policy?: Maybe<TemplatesSetPolicy>;
  /** A single PostTemplate */
  postTemplate?: Maybe<PostTemplate>;
  /** The PostTemplates in this TemplatesSet. */
  postTemplates: Array<PostTemplate>;
  /** A single WhiteboardTemplate */
  whiteboardTemplate?: Maybe<WhiteboardTemplate>;
  /** The WhiteboardTemplates in this TemplatesSet. */
  whiteboardTemplates: Array<WhiteboardTemplate>;
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

export type TemplatesSetPolicy = {
  __typename?: 'TemplatesSetPolicy';
  minInnovationFlow: Scalars['Float'];
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

export type UpdateCalloutInput = {
  ID: Scalars['UUID'];
  /** Set display location for this Callout. */
  displayLocation?: InputMaybe<CalloutDisplayLocation>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** PostTemplate data for this Callout. */
  postTemplate?: InputMaybe<UpdateCalloutPostTemplateInput>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** The sort order to assign to this Callout. */
  sortOrder?: InputMaybe<Scalars['Float']>;
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
  /** WhiteboardTemplate data for this Callout. */
  whiteboardTemplate?: InputMaybe<UpdateCalloutWhiteboardTemplateInput>;
};

export type UpdateCalloutPostTemplateInput = {
  /** The default description to be pre-filled when users create Posts based on this template. */
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  /** The Profile of the Template. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** The type of Posts created from this Template. */
  type?: InputMaybe<Scalars['String']>;
};

export type UpdateCalloutPublishInfoInput = {
  /** The identifier for the Callout whose publisher is to be updated. */
  calloutID: Scalars['String'];
  /** The timestamp to set for the publishing of the Callout. */
  publishDate?: InputMaybe<Scalars['Float']>;
  /** The identifier of the publisher of the Callout. */
  publisherID?: InputMaybe<Scalars['UUID_NAMEID_EMAIL']>;
};

export type UpdateCalloutVisibilityInput = {
  /** The identifier for the Callout whose visibility is to be updated. */
  calloutID: Scalars['String'];
  /** Send a notification on publishing. */
  sendNotification?: InputMaybe<Scalars['Boolean']>;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type UpdateCalloutWhiteboardTemplateInput = {
  /** The Profile of the Template. */
  profileData?: InputMaybe<UpdateProfileInput>;
  value?: InputMaybe<Scalars['JSON']>;
};

export type UpdateChallengeInput = {
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

export type UpdateChallengePreferenceInput = {
  /** ID of the Challenge */
  challengeID: Scalars['UUID'];
  /** Type of the challenge preference */
  type: ChallengePreferenceType;
  value: Scalars['String'];
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

export type UpdateInnovationFlowInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  /** The states on this InnovationFlow that should be selectable. */
  visibleStates?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateInnovationFlowLifecycleTemplateInput = {
  /** ID of the Innovation Flow */
  innovationFlowID: Scalars['UUID'];
  /** The Innovation Flow Template to use for updating the lifecycle used in this Innovation Flow. */
  innovationFlowTemplateID: Scalars['UUID'];
};

export type UpdateInnovationFlowTemplateInput = {
  ID: Scalars['UUID'];
  /** The XState definition for this InnovationFlowTemplate. */
  definition?: InputMaybe<Scalars['LifecycleDefinition']>;
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
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

export type UpdateLocationInput = {
  addressLine1?: InputMaybe<Scalars['String']>;
  addressLine2?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  stateOrProvince?: InputMaybe<Scalars['String']>;
};

export type UpdateOpportunityInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
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

export type UpdateProjectInput = {
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateReferenceInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  uri?: InputMaybe<Scalars['String']>;
};

export type UpdateSpaceInput = {
  /** The ID or NameID of the Space. */
  ID: Scalars['UUID_NAMEID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** Update the host Organization for the Space. */
  hostID?: InputMaybe<Scalars['UUID_NAMEID']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateSpacePlatformSettingsInput = {
  /** Update the host Organization for the Space. */
  hostID?: InputMaybe<Scalars['UUID_NAMEID']>;
  /** Upate the URL path for the Space. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The identifier for the Space whose visibility is to be updated. */
  spaceID: Scalars['String'];
  /** Visibility of the Space. */
  visibility?: InputMaybe<SpaceVisibility>;
};

export type UpdateSpacePreferenceInput = {
  /** ID of the Space */
  spaceID: Scalars['UUID_NAMEID'];
  /** Type of the user preference */
  type: SpacePreferenceType;
  value: Scalars['String'];
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

export type UpdateUserPreferenceInput = {
  /** Type of the user preference */
  type: UserPreferenceType;
  /** ID of the User */
  userID: Scalars['UUID_NAMEID_EMAIL'];
  value: Scalars['String'];
};

export type UpdateVisualInput = {
  alternativeText?: InputMaybe<Scalars['String']>;
  uri: Scalars['String'];
  visualID: Scalars['String'];
};

export type UpdateWhiteboardDirectInput = {
  ID: Scalars['UUID'];
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** The Profile of this entity. */
  profileData?: InputMaybe<UpdateProfileInput>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateWhiteboardTemplateInput = {
  ID: Scalars['UUID'];
  /** The Profile of the Template. */
  profile?: InputMaybe<UpdateProfileInput>;
  value?: InputMaybe<Scalars['JSON']>;
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
  name: Scalars['String'];
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
  /** The checkout out state of this Whiteboard. */
  checkout?: Maybe<WhiteboardCheckout>;
  /** The user that created this Whiteboard */
  createdBy?: Maybe<User>;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Profile for this Whiteboard. */
  profile: Profile;
  /** The JSON representation of the Whiteboard. */
  value: Scalars['JSON'];
};

export type WhiteboardCheckout = {
  __typename?: 'WhiteboardCheckout';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** The id of the user that has checked the entity out. */
  lockedBy: Scalars['UUID'];
  /** The checkout out state of this Whiteboard. */
  status: WhiteboardCheckoutStateEnum;
};

export type WhiteboardCheckoutEventInput = {
  /** Report an error if this event fails to trigger a transition. */
  errorOnFailedTransition?: InputMaybe<Scalars['Boolean']>;
  eventName: Scalars['String'];
  whiteboardCheckoutID: Scalars['UUID'];
};

export enum WhiteboardCheckoutStateEnum {
  Available = 'AVAILABLE',
  CheckedOut = 'CHECKED_OUT',
}

export type WhiteboardContentUpdated = {
  __typename?: 'WhiteboardContentUpdated';
  /** The updated content. */
  value: Scalars['String'];
  /** The identifier for the Whiteboard. */
  whiteboardID: Scalars['String'];
};

export type WhiteboardTemplate = {
  __typename?: 'WhiteboardTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Profile for this template. */
  profile: Profile;
  /** The JSON representation of the Whiteboard. */
  value: Scalars['JSON'];
};

export type MyPrivilegesFragment = {
  __typename?: 'Authorization';
  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
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

export type UploadFileMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: StorageBucketUploadFileInput;
}>;

export type UploadFileMutation = { __typename?: 'Mutation'; uploadFileOnStorageBucket: string };

export type ChallengeCardFragment = {
  __typename?: 'Challenge';
  id: string;
  nameID: string;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    tagline: string;
    displayName: string;
    description?: string | undefined;
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
  context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
  innovationFlow?:
    | {
        __typename?: 'InnovationFlow';
        id: string;
        lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
      }
    | undefined;
};

export type ChallengePageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  machineDef: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                }
              | undefined;
          }
        | undefined;
      context?:
        | {
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
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  visibility: CalloutVisibility;
                  activity: number;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
                        type: string;
                        createdDate: Date;
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
                      }>
                    | undefined;
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      opportunities?:
        | Array<{
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            innovationFlow?:
              | {
                  __typename?: 'InnovationFlow';
                  id: string;
                  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                }
              | undefined;
            context?:
              | {
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
                }
              | undefined;
            projects?:
              | Array<{
                  __typename?: 'Project';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                }>
              | undefined;
          }>
        | undefined;
    };
  };
};

export type ChallengeProfileFragment = {
  __typename?: 'Challenge';
  id: string;
  nameID: string;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
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
  innovationFlow?:
    | {
        __typename?: 'InnovationFlow';
        id: string;
        lifecycle?:
          | {
              __typename?: 'Lifecycle';
              id: string;
              machineDef: string;
              state?: string | undefined;
              nextEvents?: Array<string> | undefined;
              stateIsFinal: boolean;
            }
          | undefined;
      }
    | undefined;
  context?:
    | {
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
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              activity: number;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              posts?:
                | Array<{
                    __typename?: 'Post';
                    id: string;
                    nameID: string;
                    type: string;
                    createdDate: Date;
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
                  }>
                | undefined;
              whiteboards?:
                | Array<{
                    __typename?: 'Whiteboard';
                    id: string;
                    nameID: string;
                    createdDate: Date;
                    profile: {
                      __typename?: 'Profile';
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
                    };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'WhiteboardCheckout';
                          id: string;
                          lockedBy: string;
                          status: WhiteboardCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
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
                            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                          };
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
            }>
          | undefined;
        memberUsers?:
          | Array<{
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
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
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
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
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
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  opportunities?:
    | Array<{
        __typename?: 'Opportunity';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
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
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        innovationFlow?:
          | {
              __typename?: 'InnovationFlow';
              id: string;
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }
          | undefined;
        context?:
          | {
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
            }
          | undefined;
        projects?:
          | Array<{
              __typename?: 'Project';
              id: string;
              nameID: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type ChallengeDashboardReferencesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeDashboardReferencesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
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
};

export type ChallengeInfoFragment = {
  __typename?: 'Challenge';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
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
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type NewChallengeFragment = {
  __typename?: 'Challenge';
  id: string;
  nameID: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type OpportunitiesOnChallengeFragment = {
  __typename?: 'Challenge';
  id: string;
  opportunities?:
    | Array<{
        __typename?: 'Opportunity';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
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
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        innovationFlow?:
          | {
              __typename?: 'InnovationFlow';
              id: string;
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }
          | undefined;
        context?:
          | {
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
            }
          | undefined;
        projects?:
          | Array<{
              __typename?: 'Project';
              id: string;
              nameID: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type CreateChallengeMutationVariables = Exact<{
  input: CreateChallengeOnSpaceInput;
}>;

export type CreateChallengeMutation = {
  __typename?: 'Mutation';
  createChallenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    profile: {
      __typename?: 'Profile';
      id: string;
      tagline: string;
      displayName: string;
      description?: string | undefined;
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
    context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
    innovationFlow?:
      | {
          __typename?: 'InnovationFlow';
          id: string;
          lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
        }
      | undefined;
  };
};

export type DeleteChallengeMutationVariables = Exact<{
  input: DeleteChallengeInput;
}>;

export type DeleteChallengeMutation = {
  __typename?: 'Mutation';
  deleteChallenge: { __typename?: 'Challenge'; id: string; nameID: string };
};

export type UpdateChallengeMutationVariables = Exact<{
  input: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = {
  __typename?: 'Mutation';
  updateChallenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type UpdateChallengeInnovationFlowMutationVariables = Exact<{
  input: UpdateInnovationFlowInput;
}>;

export type UpdateChallengeInnovationFlowMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ChallengeActivityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeActivityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    };
  };
};

export type ChallengeApplicationTemplateQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationTemplateQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            applicationForm?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeCardQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCardQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
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
      context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeCardsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCardsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            tagline: string;
            displayName: string;
            description?: string | undefined;
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
          context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
          innovationFlow?:
            | {
                __typename?: 'InnovationFlow';
                id: string;
                lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
              }
            | undefined;
        }>
      | undefined;
  };
};

export type ChallengeInfoQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeInfoQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeLifecycleQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLifecycleQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  machineDef: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                  templateName?: string | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeNameQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeNameQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    };
  };
};

export type ChallengeProfileInfoQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeProfileInfoQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
      };
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
          }
        | undefined;
      context?:
        | {
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
          }
        | undefined;
    };
  };
};

export type OpportunityCreatedSubscriptionVariables = Exact<{
  challengeID: Scalars['UUID'];
}>;

export type OpportunityCreatedSubscription = {
  __typename?: 'Subscription';
  opportunityCreated: {
    __typename?: 'OpportunityCreated';
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
          }
        | undefined;
      context?:
        | {
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
          }
        | undefined;
      projects?:
        | Array<{
            __typename?: 'Project';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
          }>
        | undefined;
    };
  };
};

export type UpdateInnovationFlowLifecycleTemplateMutationVariables = Exact<{
  input: UpdateInnovationFlowLifecycleTemplateInput;
}>;

export type UpdateInnovationFlowLifecycleTemplateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowLifecycleTemplate: {
    __typename?: 'InnovationFlow';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
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

export type LifecycleContextTabFragment = {
  __typename?: 'Lifecycle';
  id: string;
  state?: string | undefined;
  machineDef: string;
};

export type MetricsItemFragment = { __typename?: 'NVP'; id: string; name: string; value: string };

export type AboutPageNonMembersQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type AboutPageNonMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    nameID: string;
    id: string;
    profile?: {
      __typename?: 'Profile';
      id: string;
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
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?:
              | { __typename?: 'Lifecycle'; id: string; state?: string | undefined; machineDef: string }
              | undefined;
          }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?:
              | { __typename?: 'Lifecycle'; id: string; state?: string | undefined; machineDef: string }
              | undefined;
          }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      community?:
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
};

export type AboutPageMembersQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  communityReadAccess: Scalars['Boolean'];
  referencesReadAccess: Scalars['Boolean'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type AboutPageMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
              }>
            | undefined;
          memberUsers?:
            | Array<{
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
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
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
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
                metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
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
              }>
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    profile?: {
      __typename?: 'Profile';
      id: string;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
      };
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
          | undefined;
      };
    };
  };
};

export type CommunityFeedbackTemplatesQueryVariables = Exact<{ [key: string]: never }>;

export type CommunityFeedbackTemplatesQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
    configuration: {
      __typename?: 'Config';
      template: {
        __typename?: 'Template';
        challenges: Array<{
          __typename?: 'ChallengeTemplate';
          feedback?:
            | Array<{
                __typename?: 'FeedbackTemplate';
                name: string;
                questions: Array<{
                  __typename?: 'QuestionTemplate';
                  question: string;
                  required: boolean;
                  sortOrder?: number | undefined;
                }>;
              }>
            | undefined;
        }>;
      };
    };
  };
};

export type CreateFeedbackOnCommunityContextMutationVariables = Exact<{
  feedbackData: CreateFeedbackOnCommunityContextInput;
}>;

export type CreateFeedbackOnCommunityContextMutation = {
  __typename?: 'Mutation';
  createFeedbackOnCommunityContext: boolean;
};

export type JourneyCommunityPrivilegesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type JourneyCommunityPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      community?:
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
};

export type JourneyDataQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  includeCommunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type JourneyDataQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile?: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      tagline: string;
      description?: string | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
    };
    context?:
      | {
          __typename?: 'Context';
          id: string;
          vision?: string | undefined;
          who?: string | undefined;
          impact?: string | undefined;
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
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
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
                metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              }>
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
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
    challenge?: {
      __typename?: 'Challenge';
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            vision?: string | undefined;
            who?: string | undefined;
            impact?: string | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            vision?: string | undefined;
            who?: string | undefined;
            impact?: string | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
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
  leadUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
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
      }>
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type JourneyPrivilegesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type JourneyPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
    };
  };
};

export type OpportunityPageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityPageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  machineDef: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                }
              | undefined;
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            relations?:
              | Array<{
                  __typename?: 'Relation';
                  id: string;
                  type: string;
                  actorRole: string;
                  actorName: string;
                  actorType: string;
                  description: string;
                }>
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  visibility: CalloutVisibility;
                  activity: number;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
                        type: string;
                        createdDate: Date;
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
                      }>
                    | undefined;
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
      context?:
        | {
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
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
                }>
              | undefined;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityPageFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
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
  innovationFlow?:
    | {
        __typename?: 'InnovationFlow';
        lifecycle?:
          | {
              __typename?: 'Lifecycle';
              id: string;
              machineDef: string;
              state?: string | undefined;
              nextEvents?: Array<string> | undefined;
              stateIsFinal: boolean;
            }
          | undefined;
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        relations?:
          | Array<{
              __typename?: 'Relation';
              id: string;
              type: string;
              actorRole: string;
              actorName: string;
              actorType: string;
              description: string;
            }>
          | undefined;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              activity: number;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              posts?:
                | Array<{
                    __typename?: 'Post';
                    id: string;
                    nameID: string;
                    type: string;
                    createdDate: Date;
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
                  }>
                | undefined;
              whiteboards?:
                | Array<{
                    __typename?: 'Whiteboard';
                    id: string;
                    nameID: string;
                    createdDate: Date;
                    profile: {
                      __typename?: 'Profile';
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
                    };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'WhiteboardCheckout';
                          id: string;
                          lockedBy: string;
                          status: WhiteboardCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
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
                            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                          };
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  context?:
    | {
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
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
            }>
          | undefined;
        memberUsers?:
          | Array<{
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
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
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
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
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
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type OpportunityPageRelationsFragment = {
  __typename?: 'Relation';
  id: string;
  type: string;
  actorRole: string;
  actorName: string;
  actorType: string;
  description: string;
};

export type EventOnOpportunityMutationVariables = Exact<{
  innovationFlowId: Scalars['UUID'];
  eventName: Scalars['String'];
}>;

export type EventOnOpportunityMutation = {
  __typename?: 'Mutation';
  eventOnOpportunity: {
    __typename?: 'InnovationFlow';
    id: string;
    lifecycle?:
      | { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined; state?: string | undefined }
      | undefined;
  };
};

export type OpportunityProviderQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
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
      context?:
        | {
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
          }
        | undefined;
      community?:
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
};

export type OpportunityProviderFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
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
  context?:
    | {
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
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type NewOpportunityFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type OpportunityCardFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
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
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  innovationFlow?:
    | {
        __typename?: 'InnovationFlow';
        id: string;
        lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
      }
    | undefined;
  context?:
    | {
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
      }
    | undefined;
  projects?:
    | Array<{
        __typename?: 'Project';
        id: string;
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
      }>
    | undefined;
};

export type CreateOpportunityMutationVariables = Exact<{
  input: CreateOpportunityInput;
}>;

export type CreateOpportunityMutation = {
  __typename?: 'Mutation';
  createOpportunity: {
    __typename?: 'Opportunity';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    innovationFlow?:
      | {
          __typename?: 'InnovationFlow';
          id: string;
          lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
        }
      | undefined;
    context?:
      | {
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
        }
      | undefined;
    projects?:
      | Array<{
          __typename?: 'Project';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
        }>
      | undefined;
  };
};

export type DeleteOpportunityMutationVariables = Exact<{
  input: DeleteOpportunityInput;
}>;

export type DeleteOpportunityMutation = {
  __typename?: 'Mutation';
  deleteOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string };
};

export type UpdateOpportunityMutationVariables = Exact<{
  input: UpdateOpportunityInput;
}>;

export type UpdateOpportunityMutation = {
  __typename?: 'Mutation';
  updateOpportunity: {
    __typename?: 'Opportunity';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type UpdateOpportunityInnovationFlowMutationVariables = Exact<{
  input: UpdateInnovationFlowInput;
}>;

export type UpdateOpportunityInnovationFlowMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: {
    __typename?: 'InnovationFlow';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type AllOpportunitiesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AllOpportunitiesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunities?: Array<{ __typename?: 'Opportunity'; id: string; nameID: string }> | undefined;
  };
};

export type OpportunitiesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type OpportunitiesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      opportunities?:
        | Array<{
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }>
        | undefined;
    };
  };
};

export type OpportunityActivityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActivityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    };
  };
};

export type OpportunityActorGroupsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActorGroupsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            ecosystemModel?:
              | {
                  __typename?: 'EcosystemModel';
                  id: string;
                  actorGroups?:
                    | Array<{
                        __typename?: 'ActorGroup';
                        id: string;
                        name: string;
                        description?: string | undefined;
                        actors?:
                          | Array<{
                              __typename?: 'Actor';
                              id: string;
                              name: string;
                              description?: string | undefined;
                              value?: string | undefined;
                              impact?: string | undefined;
                            }>
                          | undefined;
                      }>
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCardsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCardsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      opportunities?:
        | Array<{
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            innovationFlow?:
              | {
                  __typename?: 'InnovationFlow';
                  id: string;
                  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                }
              | undefined;
            context?:
              | {
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
                }
              | undefined;
            projects?:
              | Array<{
                  __typename?: 'Project';
                  id: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    displayName: string;
                    description?: string | undefined;
                  };
                  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                }>
              | undefined;
          }>
        | undefined;
    };
  };
};

export type OpportunityEcosystemDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityEcosystemDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      context?:
        | {
            __typename?: 'Context';
            ecosystemModel?:
              | {
                  __typename?: 'EcosystemModel';
                  id: string;
                  actorGroups?:
                    | Array<{
                        __typename?: 'ActorGroup';
                        id: string;
                        name: string;
                        description?: string | undefined;
                        actors?:
                          | Array<{
                              __typename?: 'Actor';
                              id: string;
                              name: string;
                              description?: string | undefined;
                              value?: string | undefined;
                              impact?: string | undefined;
                            }>
                          | undefined;
                      }>
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityGroupsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityGroupsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityLifecycleQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityLifecycleQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  machineDef: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                  templateName?: string | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityNameQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityNameQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
    };
  };
};

export type OpportunityProfileInfoQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProfileInfoQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
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
      context?:
        | {
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
          }
        | undefined;
      innovationFlow?: { __typename?: 'InnovationFlow'; id: string } | undefined;
    };
  };
};

export type OpportunityRelationsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityRelationsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            relations?:
              | Array<{
                  __typename?: 'Relation';
                  id: string;
                  actorRole: string;
                  actorName: string;
                  actorType: string;
                  description: string;
                  type: string;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityUserIdsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityUserIdsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | { __typename?: 'Community'; memberUsers?: Array<{ __typename?: 'User'; id: string }> | undefined }
        | undefined;
    };
  };
};

export type OpportunityWithActivityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityWithActivityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunities?:
      | Array<{
          __typename?: 'Opportunity';
          id: string;
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
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
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        }>
      | undefined;
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
              }>
            | undefined;
          memberUsers?:
            | Array<{
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
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
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
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
                metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
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
              }>
            | undefined;
        }
      | undefined;
    collaboration?: { __typename?: 'Collaboration'; id: string } | undefined;
  };
};

export type CommunityPageCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
      }>
    | undefined;
  memberUsers?:
    | Array<{
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
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
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
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
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
      }>
    | undefined;
};

export type SpaceProviderQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    visibility: SpaceVisibility;
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    context?:
      | {
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
    host?: { __typename?: 'Organization'; id: string } | undefined;
  };
};

export type SpaceInfoFragment = {
  __typename?: 'Space';
  visibility: SpaceVisibility;
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
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  context?:
    | {
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
  host?: { __typename?: 'Organization'; id: string } | undefined;
};

export type SpaceHostQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceHostQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        }
      | undefined;
  };
};

export type SpacePageQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpacePageQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
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
    profile: {
      __typename?: 'Profile';
      id: string;
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
    context?:
      | {
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
        }
      | undefined;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                visibility: CalloutVisibility;
                activity: number;
                profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
                posts?:
                  | Array<{
                      __typename?: 'Post';
                      id: string;
                      nameID: string;
                      type: string;
                      createdDate: Date;
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
                    }>
                  | undefined;
                whiteboards?:
                  | Array<{
                      __typename?: 'Whiteboard';
                      id: string;
                      nameID: string;
                      createdDate: Date;
                      profile: {
                        __typename?: 'Profile';
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
                      };
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'WhiteboardCheckout';
                            id: string;
                            lockedBy: string;
                            status: WhiteboardCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
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
                              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                            };
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  displayName: string;
                  visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
              }>
            | undefined;
          memberUsers?:
            | Array<{
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
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
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
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
                metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
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
              }>
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            tagline: string;
            displayName: string;
            description?: string | undefined;
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
          context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
          innovationFlow?:
            | {
                __typename?: 'InnovationFlow';
                id: string;
                lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
              }
            | undefined;
        }>
      | undefined;
    timeline?:
      | {
          __typename?: 'Timeline';
          id: string;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                anonymousReadAccess: boolean;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              }
            | undefined;
        }
      | undefined;
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
  visibility: SpaceVisibility;
  metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        anonymousReadAccess: boolean;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
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
  profile: {
    __typename?: 'Profile';
    id: string;
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
  context?:
    | {
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
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              activity: number;
              profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
              posts?:
                | Array<{
                    __typename?: 'Post';
                    id: string;
                    nameID: string;
                    type: string;
                    createdDate: Date;
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
                  }>
                | undefined;
              whiteboards?:
                | Array<{
                    __typename?: 'Whiteboard';
                    id: string;
                    nameID: string;
                    createdDate: Date;
                    profile: {
                      __typename?: 'Profile';
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
                    };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'WhiteboardCheckout';
                          id: string;
                          lockedBy: string;
                          status: WhiteboardCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
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
                            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                          };
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                displayName: string;
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
            }>
          | undefined;
        memberUsers?:
          | Array<{
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
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
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
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
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
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  challenges?:
    | Array<{
        __typename?: 'Challenge';
        id: string;
        nameID: string;
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
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
        context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
        innovationFlow?:
          | {
              __typename?: 'InnovationFlow';
              id: string;
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }
          | undefined;
      }>
    | undefined;
  timeline?:
    | {
        __typename?: 'Timeline';
        id: string;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              anonymousReadAccess: boolean;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            }
          | undefined;
      }
    | undefined;
};

export type SpaceWelcomeBlockContributorProfileFragment = {
  __typename?: 'Profile';
  id: string;
  displayName: string;
  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
};

export type SpaceDashboardNavigationChallengesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceDashboardNavigationChallengesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    visibility: SpaceVisibility;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
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
            visual?:
              | { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined }
              | undefined;
          };
          context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
          innovationFlow?:
            | {
                __typename?: 'InnovationFlow';
                id: string;
                lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
              }
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          community?:
            | { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined }
            | undefined;
        }>
      | undefined;
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
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          opportunities?:
            | Array<{
                __typename?: 'Opportunity';
                id: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
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
                  visual?:
                    | { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined }
                    | undefined;
                };
                context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
                innovationFlow?:
                  | {
                      __typename?: 'InnovationFlow';
                      id: string;
                      lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                    }
                  | undefined;
              }>
            | undefined;
        }>
      | undefined;
  };
};

export type SpaceDashboardNavigationProfileFragment = {
  __typename?: 'Profile';
  id: string;
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
  visual?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
};

export type SpaceDashboardNavigationContextFragment = {
  __typename?: 'Context';
  id: string;
  vision?: string | undefined;
};

export type SpaceDashboardNavigationLifecycleFragment = {
  __typename?: 'Lifecycle';
  id: string;
  state?: string | undefined;
};

export type SpaceTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceTemplatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
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
            definition: string;
            type: InnovationFlowType;
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

export type CalloutFormTemplatesFromSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type CalloutFormTemplatesFromSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
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

export type PostTemplatesFromSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type PostTemplatesFromSpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
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
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          innovationFlowTemplates: Array<{
            __typename?: 'InnovationFlowTemplate';
            id: string;
            definition: string;
            type: InnovationFlowType;
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

export type SpaceTemplatesWhiteboardTemplateWithValueQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type SpaceTemplatesWhiteboardTemplateWithValueQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplate?:
            | {
                __typename?: 'WhiteboardTemplate';
                value: string;
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
              }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceTemplatesFragment = {
  __typename?: 'Space';
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
          definition: string;
          type: InnovationFlowType;
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

export type WhiteboardTemplateWithValueFragment = {
  __typename?: 'WhiteboardTemplate';
  value: string;
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

export type InnovationFlowTemplateFragment = {
  __typename?: 'InnovationFlowTemplate';
  id: string;
  definition: string;
  type: InnovationFlowType;
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

export type ChallengesOnSpaceFragment = {
  __typename?: 'Space';
  id: string;
  challenges?:
    | Array<{
        __typename?: 'Challenge';
        id: string;
        nameID: string;
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
        metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        profile: {
          __typename?: 'Profile';
          id: string;
          tagline: string;
          displayName: string;
          description?: string | undefined;
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
        context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
        innovationFlow?:
          | {
              __typename?: 'InnovationFlow';
              id: string;
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }
          | undefined;
      }>
    | undefined;
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
  host?: { __typename?: 'Organization'; id: string } | undefined;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  context?:
    | {
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
      }
    | undefined;
};

export type SpaceDetailsProviderFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  visibility: SpaceVisibility;
  profile: {
    __typename?: 'Profile';
    id: string;
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
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  community?: { __typename?: 'Community'; id: string } | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        vision?: string | undefined;
        impact?: string | undefined;
        who?: string | undefined;
      }
    | undefined;
};

export type SpaceNameFragment = {
  __typename?: 'Space';
  id: string;
  nameID: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
};

export type CreateSpaceMutationVariables = Exact<{
  input: CreateSpaceInput;
}>;

export type CreateSpaceMutation = {
  __typename?: 'Mutation';
  createSpace: {
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
    host?: { __typename?: 'Organization'; id: string } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    context?:
      | {
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
        }
      | undefined;
  };
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
    host?: { __typename?: 'Organization'; id: string } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    context?:
      | {
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
        }
      | undefined;
  };
};

export type SpaceActivityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceActivityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          applicationForm?:
            | {
                __typename?: 'Form';
                id: string;
                description?: string | undefined;
                questions: Array<{
                  __typename?: 'FormQuestion';
                  required: boolean;
                  question: string;
                  explanation: string;
                  sortOrder: number;
                  maxLength: number;
                }>;
              }
            | undefined;
        }
      | undefined;
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
    nameID: string;
    visibility: SpaceVisibility;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
        }
      | undefined;
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
    group: {
      __typename?: 'UserGroup';
      id: string;
      name: string;
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

export type SpaceGroupsListQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceGroupsListQuery = {
  __typename?: 'Query';
  space: { __typename?: 'Space'; id: string; groups: Array<{ __typename?: 'UserGroup'; id: string; name: string }> };
};

export type SpaceHostReferencesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceHostReferencesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    host?:
      | {
          __typename?: 'Organization';
          profile: {
            __typename?: 'Profile';
            id: string;
            references?: Array<{ __typename?: 'Reference'; name: string; uri: string }> | undefined;
          };
        }
      | undefined;
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
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          innovationFlowTemplates: Array<{
            __typename?: 'InnovationFlowTemplate';
            definition: string;
            id: string;
            type: InnovationFlowType;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }>;
        }
      | undefined;
  };
};

export type SpaceMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type SpaceNameQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceNameQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type SpaceUserIdsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceUserIdsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | { __typename?: 'Community'; id: string; memberUsers?: Array<{ __typename?: 'User'; id: string }> | undefined }
      | undefined;
  };
};

export type SpaceVisualQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceVisualQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: {
      __typename?: 'Profile';
      visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
    };
  };
};

export type SpacesQueryVariables = Exact<{
  visibilities?: InputMaybe<Array<SpaceVisibility> | SpaceVisibility>;
}>;

export type SpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
        }
      | undefined;
  }>;
};

export type ChallengeCreatedSubscriptionVariables = Exact<{
  spaceID: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCreatedSubscription = {
  __typename?: 'Subscription';
  challengeCreated: {
    __typename?: 'ChallengeCreated';
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
        tagline: string;
        displayName: string;
        description?: string | undefined;
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
      context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
          }
        | undefined;
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

export type SpaceDisplayNameQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceDisplayNameQuery = {
  __typename?: 'Query';
  space: { __typename?: 'Space'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

export type SpaceApplicationsInvitationsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceApplicationsInvitationsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          applications?:
            | Array<{
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
              }>
            | undefined;
          invitations?:
            | Array<{
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
              }>
            | undefined;
          invitationsExternal?:
            | Array<{ __typename?: 'InvitationExternal'; id: string; createdDate: Date; email: string }>
            | undefined;
        }
      | undefined;
  };
};

export type AdminSpaceCommunityApplicationFragment = {
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

export type AdminSpaceCommunityInvitationFragment = {
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

export type AdminSpaceCommunityInvitationExternalFragment = {
  __typename?: 'InvitationExternal';
  id: string;
  createdDate: Date;
  email: string;
};

export type AdminSpaceCommunityCandidateMemberFragment = {
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

export type CalloutPageCalloutQueryVariables = Exact<{
  calloutNameId: Scalars['UUID_NAMEID'];
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type CalloutPageCalloutQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                state: CalloutState;
                sortOrder: number;
                activity: number;
                visibility: CalloutVisibility;
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
                  references?:
                    | Array<{
                        __typename?: 'Reference';
                        id: string;
                        name: string;
                        uri: string;
                        description?: string | undefined;
                      }>
                    | undefined;
                  displayLocationTagset?:
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
                whiteboards?:
                  | Array<{
                      __typename?: 'Whiteboard';
                      id: string;
                      nameID: string;
                      createdDate: Date;
                      profile: {
                        __typename?: 'Profile';
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
                      };
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'WhiteboardCheckout';
                            id: string;
                            lockedBy: string;
                            status: WhiteboardCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
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
                              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                            };
                          }
                        | undefined;
                    }>
                  | undefined;
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
                          sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                        }>;
                        sender?:
                          | {
                              __typename?: 'User';
                              id: string;
                              nameID: string;
                              firstName: string;
                              lastName: string;
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
                                location?:
                                  | { __typename?: 'Location'; id: string; city: string; country: string }
                                  | undefined;
                              };
                            }
                          | undefined;
                      }>;
                    }
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                postTemplate?:
                  | {
                      __typename?: 'PostTemplate';
                      id: string;
                      type: string;
                      defaultDescription: string;
                      profile: {
                        __typename?: 'Profile';
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
                    }
                  | undefined;
                whiteboardTemplate?:
                  | {
                      __typename?: 'WhiteboardTemplate';
                      id: string;
                      value: string;
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
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  state: CalloutState;
                  sortOrder: number;
                  activity: number;
                  visibility: CalloutVisibility;
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
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    displayLocationTagset?:
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
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
                              | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                              | undefined;
                          }>;
                          sender?:
                            | {
                                __typename?: 'User';
                                id: string;
                                nameID: string;
                                firstName: string;
                                lastName: string;
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
                                  location?:
                                    | { __typename?: 'Location'; id: string; city: string; country: string }
                                    | undefined;
                                };
                              }
                            | undefined;
                        }>;
                      }
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  postTemplate?:
                    | {
                        __typename?: 'PostTemplate';
                        id: string;
                        type: string;
                        defaultDescription: string;
                        profile: {
                          __typename?: 'Profile';
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
                      }
                    | undefined;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        id: string;
                        value: string;
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
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  state: CalloutState;
                  sortOrder: number;
                  activity: number;
                  visibility: CalloutVisibility;
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
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    displayLocationTagset?:
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
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
                              | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                              | undefined;
                          }>;
                          sender?:
                            | {
                                __typename?: 'User';
                                id: string;
                                nameID: string;
                                firstName: string;
                                lastName: string;
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
                                  location?:
                                    | { __typename?: 'Location'; id: string; city: string; country: string }
                                    | undefined;
                                };
                              }
                            | undefined;
                        }>;
                      }
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  postTemplate?:
                    | {
                        __typename?: 'PostTemplate';
                        id: string;
                        type: string;
                        defaultDescription: string;
                        profile: {
                          __typename?: 'Profile';
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
                      }
                    | undefined;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        id: string;
                        value: string;
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
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type InnovationFlowBlockQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type InnovationFlowBlockQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              cardBanner?:
                | { __typename?: 'Visual'; id: string; name: string; uri: string; alternativeText?: string | undefined }
                | undefined;
            };
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            profile: {
              __typename?: 'Profile';
              id: string;
              displayName: string;
              cardBanner?:
                | { __typename?: 'Visual'; id: string; name: string; uri: string; alternativeText?: string | undefined }
                | undefined;
            };
          }
        | undefined;
    };
  };
};

export type ChallengeInnovationFlowEventMutationVariables = Exact<{
  eventName: Scalars['String'];
  innovationFlowID: Scalars['UUID'];
}>;

export type ChallengeInnovationFlowEventMutation = {
  __typename?: 'Mutation';
  eventOnChallenge: { __typename?: 'InnovationFlow'; id: string };
};

export type OpportunityInnovationFlowEventMutationVariables = Exact<{
  eventName: Scalars['String'];
  innovationFlowID: Scalars['UUID'];
}>;

export type OpportunityInnovationFlowEventMutation = {
  __typename?: 'Mutation';
  eventOnOpportunity: { __typename?: 'InnovationFlow'; id: string };
};

export type InnovationFlowSettingsQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
}>;

export type InnovationFlowSettingsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            type: InnovationFlowType;
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
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                }
              | undefined;
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  activity: number;
                  sortOrder: number;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
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
                }>
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            type: InnovationFlowType;
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
            lifecycle?:
              | {
                  __typename?: 'Lifecycle';
                  id: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                  stateIsFinal: boolean;
                }
              | undefined;
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  activity: number;
                  sortOrder: number;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
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
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type LifecycleProfileFragment = {
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

export type LifecycleDetailsFragment = {
  __typename?: 'Lifecycle';
  id: string;
  state?: string | undefined;
  nextEvents?: Array<string> | undefined;
  stateIsFinal: boolean;
};

export type InnovationFlowCollaborationFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        activity: number;
        sortOrder: number;
        profile: {
          __typename?: 'Profile';
          id: string;
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
      }>
    | undefined;
};

export type UpdateInnovationFlowMutationVariables = Exact<{
  updateInnovationFlowData: UpdateInnovationFlowInput;
}>;

export type UpdateInnovationFlowMutation = {
  __typename?: 'Mutation';
  updateInnovationFlow: { __typename?: 'InnovationFlow'; id: string };
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
    profile: {
      __typename?: 'Profile';
      id: string;
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

export type ChallengeInnovationFlowStatesAllowedValuesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeInnovationFlowStatesAllowedValuesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagsets?:
                | Array<{ __typename?: 'Tagset'; id: string; name: string; allowedValues: Array<string> }>
                | undefined;
            };
          }
        | undefined;
    };
  };
};

export type OpportunityInnovationFlowStatesAllowedValuesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityInnovationFlowStatesAllowedValuesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      innovationFlow?:
        | {
            __typename?: 'InnovationFlow';
            id: string;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            profile: {
              __typename?: 'Profile';
              id: string;
              tagsets?:
                | Array<{ __typename?: 'Tagset'; id: string; name: string; allowedValues: Array<string> }>
                | undefined;
            };
          }
        | undefined;
    };
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
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    definition: string;
                    type: InnovationFlowType;
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
          }
        | undefined;
    };
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
          __typename: 'ActivityLogEntryCalendarEventCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          calendar: { __typename?: 'Calendar'; id: string };
          calendarEvent: {
            __typename?: 'CalendarEvent';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutDiscussionComment';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutLinkCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
          reference: {
            __typename?: 'Reference';
            id: string;
            name: string;
            description?: string | undefined;
            uri: string;
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutPostComment';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
          post: {
            __typename?: 'Post';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutPostCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
          post: {
            __typename?: 'Post';
            id: string;
            nameID: string;
            type: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutPublished';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            type: CalloutType;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryCalloutWhiteboardCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
          whiteboard: {
            __typename?: 'Whiteboard';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryChallengeCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          challenge: {
            __typename?: 'Challenge';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryMemberJoined';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          communityType: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          community: { __typename?: 'Community'; id: string; displayName?: string | undefined };
          user: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
        }
      | {
          __typename: 'ActivityLogEntryOpportunityCreated';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
          opportunity: {
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
          };
        }
      | {
          __typename: 'ActivityLogEntryUpdateSent';
          id: string;
          collaborationID: string;
          createdDate: Date;
          description: string;
          type: ActivityEventType;
          child: boolean;
          parentNameID: string;
          message: string;
          journeyDisplayName: string;
          triggeredBy: {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          };
        };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalendarEventCreated_Fragment = {
  __typename: 'ActivityLogEntryCalendarEventCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  calendar: { __typename?: 'Calendar'; id: string };
  calendarEvent: {
    __typename?: 'CalendarEvent';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutDiscussionComment_Fragment = {
  __typename: 'ActivityLogEntryCalloutDiscussionComment';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutLinkCreated_Fragment = {
  __typename: 'ActivityLogEntryCalloutLinkCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  reference: { __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPostComment_Fragment = {
  __typename: 'ActivityLogEntryCalloutPostComment';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  post: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPostCreated_Fragment = {
  __typename: 'ActivityLogEntryCalloutPostCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  post: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    type: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutPublished_Fragment = {
  __typename: 'ActivityLogEntryCalloutPublished';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardCreated_Fragment = {
  __typename: 'ActivityLogEntryCalloutWhiteboardCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryChallengeCreated_Fragment = {
  __typename: 'ActivityLogEntryChallengeCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  challenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryMemberJoined_Fragment = {
  __typename: 'ActivityLogEntryMemberJoined';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  communityType: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  community: { __typename?: 'Community'; id: string; displayName?: string | undefined };
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryOpportunityCreated_Fragment = {
  __typename: 'ActivityLogEntryOpportunityCreated';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
  opportunity: {
    __typename?: 'Opportunity';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
  };
};

type ActivityLogOnCollaboration_ActivityLogEntryUpdateSent_Fragment = {
  __typename: 'ActivityLogEntryUpdateSent';
  id: string;
  collaborationID: string;
  createdDate: Date;
  description: string;
  type: ActivityEventType;
  child: boolean;
  parentNameID: string;
  message: string;
  journeyDisplayName: string;
  triggeredBy: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
};

export type ActivityLogOnCollaborationFragment =
  | ActivityLogOnCollaboration_ActivityLogEntryCalendarEventCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutDiscussionComment_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutLinkCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPostComment_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPostCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutPublished_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryCalloutWhiteboardCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryChallengeCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryMemberJoined_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryOpportunityCreated_Fragment
  | ActivityLogOnCollaboration_ActivityLogEntryUpdateSent_Fragment;

export type ActivityLogOnCollaborationQueryVariables = Exact<{
  queryData: ActivityLogInput;
}>;

export type ActivityLogOnCollaborationQuery = {
  __typename?: 'Query';
  activityLogOnCollaboration: Array<
    | {
        __typename: 'ActivityLogEntryCalendarEventCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        calendar: { __typename?: 'Calendar'; id: string };
        calendarEvent: {
          __typename?: 'CalendarEvent';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutDiscussionComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutLinkCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
        reference: {
          __typename?: 'Reference';
          id: string;
          name: string;
          description?: string | undefined;
          uri: string;
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutPostComment';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
        post: {
          __typename?: 'Post';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutPostCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
        post: {
          __typename?: 'Post';
          id: string;
          nameID: string;
          type: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutPublished';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          type: CalloutType;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryCalloutWhiteboardCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        callout: {
          __typename?: 'Callout';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
        whiteboard: {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryChallengeCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        challenge: {
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryMemberJoined';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        communityType: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        community: { __typename?: 'Community'; id: string; displayName?: string | undefined };
        user: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
          profile: {
            __typename?: 'Profile';
            id: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
      }
    | {
        __typename: 'ActivityLogEntryOpportunityCreated';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
        opportunity: {
          __typename?: 'Opportunity';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
        };
      }
    | {
        __typename: 'ActivityLogEntryUpdateSent';
        id: string;
        collaborationID: string;
        createdDate: Date;
        description: string;
        type: ActivityEventType;
        child: boolean;
        parentNameID: string;
        message: string;
        journeyDisplayName: string;
        triggeredBy: {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          };
        };
      }
  >;
};

export type ActivityLogMemberJoinedFragment = {
  __typename?: 'ActivityLogEntryMemberJoined';
  communityType: string;
  community: { __typename?: 'Community'; id: string; displayName?: string | undefined };
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    firstName: string;
    lastName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
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
      location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
    };
  };
};

export type ActivityLogCalloutPublishedFragment = {
  __typename?: 'ActivityLogEntryCalloutPublished';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ActivityLogCalloutPostCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutPostCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  post: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    type: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

export type ActivityLogCalloutLinkCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutLinkCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  reference: { __typename?: 'Reference'; id: string; name: string; description?: string | undefined; uri: string };
};

export type ActivityLogCalloutPostCommentFragment = {
  __typename?: 'ActivityLogEntryCalloutPostComment';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  post: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ActivityLogCalloutWhiteboardCreatedFragment = {
  __typename?: 'ActivityLogEntryCalloutWhiteboardCreated';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
  whiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ActivityLogChallengeCreatedFragment = {
  __typename?: 'ActivityLogEntryChallengeCreated';
  challenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
  };
};

export type ActivityLogOpportunityCreatedFragment = {
  __typename?: 'ActivityLogEntryOpportunityCreated';
  opportunity: {
    __typename?: 'Opportunity';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
  };
};

export type ActivityLogCalloutDiscussionCommentFragment = {
  __typename?: 'ActivityLogEntryCalloutDiscussionComment';
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type ActivityLogCalendarEventCreatedFragment = {
  __typename?: 'ActivityLogEntryCalendarEventCreated';
  calendar: { __typename?: 'Calendar'; id: string };
  calendarEvent: {
    __typename?: 'CalendarEvent';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  };
};

export type ActivityLogUpdateSentFragment = { __typename?: 'ActivityLogEntryUpdateSent'; message: string };

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
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        visibility: CalloutVisibility;
        activity: number;
        profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
        posts?:
          | Array<{
              __typename?: 'Post';
              id: string;
              nameID: string;
              type: string;
              createdDate: Date;
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
            }>
          | undefined;
        whiteboards?:
          | Array<{
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              profile: {
                __typename?: 'Profile';
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
              };
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
              checkout?:
                | {
                    __typename?: 'WhiteboardCheckout';
                    id: string;
                    lockedBy: string;
                    status: WhiteboardCheckoutStateEnum;
                    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type DashboardTopCalloutFragment = {
  __typename?: 'Callout';
  id: string;
  nameID: string;
  type: CalloutType;
  visibility: CalloutVisibility;
  activity: number;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
  posts?:
    | Array<{
        __typename?: 'Post';
        id: string;
        nameID: string;
        type: string;
        createdDate: Date;
        createdBy?:
          | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
          | undefined;
        comments: { __typename?: 'Room'; id: string; messagesCount: number };
        profile: {
          __typename?: 'Profile';
          id: string;
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
      }>
    | undefined;
  whiteboards?:
    | Array<{
        __typename?: 'Whiteboard';
        id: string;
        nameID: string;
        createdDate: Date;
        profile: {
          __typename?: 'Profile';
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
        };
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        checkout?:
          | {
              __typename?: 'WhiteboardCheckout';
              id: string;
              lockedBy: string;
              status: WhiteboardCheckoutStateEnum;
              lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
      }>
    | undefined;
};

export type TemplatesForCalloutCreationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type TemplatesForCalloutCreationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          postTemplates: Array<{
            __typename?: 'PostTemplate';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }>;
          whiteboardTemplates: Array<{
            __typename?: 'WhiteboardTemplate';
            id: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
          }>;
        }
      | undefined;
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
    templates?:
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

export type WhiteboardTemplatesOnCalloutCreationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardTemplatesOnCalloutCreationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
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

export type ProfileDisplayNameFragment = { __typename?: 'Profile'; id: string; displayName: string };

export type PostTemplateValueQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  id: Scalars['UUID'];
}>;

export type PostTemplateValueQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          postTemplate?:
            | {
                __typename?: 'PostTemplate';
                id: string;
                type: string;
                defaultDescription: string;
                profile: {
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
              }
            | undefined;
        }
      | undefined;
  };
};

export type WhiteboardTemplateValueQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  id: Scalars['UUID'];
}>;

export type WhiteboardTemplateValueQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplate?: { __typename?: 'WhiteboardTemplate'; id: string; value: string } | undefined;
        }
      | undefined;
  };
};

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
    state: CalloutState;
    sortOrder: number;
    activity: number;
    visibility: CalloutVisibility;
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
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
        | undefined;
      displayLocationTagset?:
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
    whiteboards?:
      | Array<{
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          profile: {
            __typename?: 'Profile';
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
          };
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
              }
            | undefined;
          checkout?:
            | {
                __typename?: 'WhiteboardCheckout';
                id: string;
                lockedBy: string;
                status: WhiteboardCheckoutStateEnum;
                lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
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
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }>
      | undefined;
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
              sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  firstName: string;
                  lastName: string;
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
    postTemplate?:
      | {
          __typename?: 'PostTemplate';
          id: string;
          type: string;
          defaultDescription: string;
          profile: {
            __typename?: 'Profile';
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
        }
      | undefined;
    whiteboardTemplate?:
      | {
          __typename?: 'WhiteboardTemplate';
          id: string;
          value: string;
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
        }
      | undefined;
  };
};

export type SpaceCollaborationIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCollaborationIdQuery = {
  __typename?: 'Query';
  space: { __typename?: 'Space'; id: string; collaboration?: { __typename?: 'Collaboration'; id: string } | undefined };
};

export type ChallengeCollaborationIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCollaborationIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?: { __typename?: 'Collaboration'; id: string } | undefined;
    };
  };
};

export type OpportunityCollaborationIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCollaborationIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?: { __typename?: 'Collaboration'; id: string } | undefined;
    };
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
    state: CalloutState;
    type: CalloutType;
    visibility: CalloutVisibility;
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
      displayLocationTagset?:
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
    postTemplate?:
      | {
          __typename?: 'PostTemplate';
          id: string;
          type: string;
          defaultDescription: string;
          profile: {
            __typename?: 'Profile';
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
        }
      | undefined;
    whiteboardTemplate?:
      | {
          __typename?: 'WhiteboardTemplate';
          id: string;
          value: string;
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
        }
      | undefined;
  };
};

export type UpdateCalloutVisibilityMutationVariables = Exact<{
  calloutData: UpdateCalloutVisibilityInput;
}>;

export type UpdateCalloutVisibilityMutation = {
  __typename?: 'Mutation';
  updateCalloutVisibility: { __typename?: 'Callout'; id: string; visibility: CalloutVisibility };
};

export type DeleteCalloutMutationVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type DeleteCalloutMutation = { __typename?: 'Mutation'; deleteCallout: { __typename?: 'Callout'; id: string } };

export type CreatePostFromContributeTabMutationVariables = Exact<{
  postData: CreatePostOnCalloutInput;
}>;

export type CreatePostFromContributeTabMutation = {
  __typename?: 'Mutation';
  createPostOnCallout: {
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
  };
};

export type RemoveCommentFromCalloutMutationVariables = Exact<{
  messageData: RoomRemoveMessageInput;
}>;

export type RemoveCommentFromCalloutMutation = { __typename?: 'Mutation'; removeMessageOnRoom: string };

export type CreateLinkOnCalloutMutationVariables = Exact<{
  input: CreateLinkOnCalloutInput;
}>;

export type CreateLinkOnCalloutMutation = {
  __typename?: 'Mutation';
  createLinkOnCallout: {
    __typename?: 'Reference';
    id: string;
    name: string;
    uri: string;
    description?: string | undefined;
  };
};

export type CalloutsQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  displayLocations?: InputMaybe<Array<CalloutDisplayLocation> | CalloutDisplayLocation>;
  calloutIds?: InputMaybe<Array<Scalars['UUID_NAMEID']> | Scalars['UUID_NAMEID']>;
}>;

export type CalloutsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    nameID: string;
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                state: CalloutState;
                sortOrder: number;
                activity: number;
                visibility: CalloutVisibility;
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
                  references?:
                    | Array<{
                        __typename?: 'Reference';
                        id: string;
                        name: string;
                        uri: string;
                        description?: string | undefined;
                      }>
                    | undefined;
                  displayLocationTagset?:
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
                whiteboards?:
                  | Array<{
                      __typename?: 'Whiteboard';
                      id: string;
                      nameID: string;
                      createdDate: Date;
                      profile: {
                        __typename?: 'Profile';
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
                      };
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'WhiteboardCheckout';
                            id: string;
                            lockedBy: string;
                            status: WhiteboardCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
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
                              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                            };
                          }
                        | undefined;
                    }>
                  | undefined;
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
                          sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                        }>;
                        sender?:
                          | {
                              __typename?: 'User';
                              id: string;
                              nameID: string;
                              firstName: string;
                              lastName: string;
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
                                location?:
                                  | { __typename?: 'Location'; id: string; city: string; country: string }
                                  | undefined;
                              };
                            }
                          | undefined;
                      }>;
                    }
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                postTemplate?:
                  | {
                      __typename?: 'PostTemplate';
                      id: string;
                      type: string;
                      defaultDescription: string;
                      profile: {
                        __typename?: 'Profile';
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
                    }
                  | undefined;
                whiteboardTemplate?:
                  | {
                      __typename?: 'WhiteboardTemplate';
                      id: string;
                      value: string;
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
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  state: CalloutState;
                  sortOrder: number;
                  activity: number;
                  visibility: CalloutVisibility;
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
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    displayLocationTagset?:
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
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
                              | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                              | undefined;
                          }>;
                          sender?:
                            | {
                                __typename?: 'User';
                                id: string;
                                nameID: string;
                                firstName: string;
                                lastName: string;
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
                                  location?:
                                    | { __typename?: 'Location'; id: string; city: string; country: string }
                                    | undefined;
                                };
                              }
                            | undefined;
                        }>;
                      }
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  postTemplate?:
                    | {
                        __typename?: 'PostTemplate';
                        id: string;
                        type: string;
                        defaultDescription: string;
                        profile: {
                          __typename?: 'Profile';
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
                      }
                    | undefined;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        id: string;
                        value: string;
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
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  state: CalloutState;
                  sortOrder: number;
                  activity: number;
                  visibility: CalloutVisibility;
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
                    references?:
                      | Array<{
                          __typename?: 'Reference';
                          id: string;
                          name: string;
                          uri: string;
                          description?: string | undefined;
                        }>
                      | undefined;
                    displayLocationTagset?:
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
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
                              | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                              | undefined;
                          }>;
                          sender?:
                            | {
                                __typename?: 'User';
                                id: string;
                                nameID: string;
                                firstName: string;
                                lastName: string;
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
                                  location?:
                                    | { __typename?: 'Location'; id: string; city: string; country: string }
                                    | undefined;
                                };
                              }
                            | undefined;
                        }>;
                      }
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  postTemplate?:
                    | {
                        __typename?: 'PostTemplate';
                        id: string;
                        type: string;
                        defaultDescription: string;
                        profile: {
                          __typename?: 'Profile';
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
                      }
                    | undefined;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        id: string;
                        value: string;
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
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type SpaceCalloutPostsSubscriptionQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCalloutPostsSubscriptionQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                posts?:
                  | Array<{
                      __typename?: 'Post';
                      id: string;
                      nameID: string;
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
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCalloutPostsSubscriptionQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCalloutPostsSubscriptionQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
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
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCalloutPostsSubscriptionQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCalloutPostsSubscriptionQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
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
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type PrivilegesOnCollaborationFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type PrivilegesOnSpaceCollaborationQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnSpaceCollaborationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type PrivilegesOnChallengeCollaborationQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnChallengeCollaborationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type PrivilegesOnOpportunityCollaborationQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnOpportunityCollaborationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type CollaborationWithCalloutsFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        state: CalloutState;
        sortOrder: number;
        activity: number;
        visibility: CalloutVisibility;
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
          references?:
            | Array<{
                __typename?: 'Reference';
                id: string;
                name: string;
                uri: string;
                description?: string | undefined;
              }>
            | undefined;
          displayLocationTagset?:
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
        whiteboards?:
          | Array<{
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              profile: {
                __typename?: 'Profile';
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
              };
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
              checkout?:
                | {
                    __typename?: 'WhiteboardCheckout';
                    id: string;
                    lockedBy: string;
                    status: WhiteboardCheckoutStateEnum;
                    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }>
          | undefined;
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
                  sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                }>;
                sender?:
                  | {
                      __typename?: 'User';
                      id: string;
                      nameID: string;
                      firstName: string;
                      lastName: string;
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
        postTemplate?:
          | {
              __typename?: 'PostTemplate';
              id: string;
              type: string;
              defaultDescription: string;
              profile: {
                __typename?: 'Profile';
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
            }
          | undefined;
        whiteboardTemplate?:
          | {
              __typename?: 'WhiteboardTemplate';
              id: string;
              value: string;
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
            }
          | undefined;
      }>
    | undefined;
};

export type CalloutFragment = {
  __typename?: 'Callout';
  id: string;
  nameID: string;
  type: CalloutType;
  state: CalloutState;
  sortOrder: number;
  activity: number;
  visibility: CalloutVisibility;
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
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description?: string | undefined }>
      | undefined;
    displayLocationTagset?:
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
  whiteboards?:
    | Array<{
        __typename?: 'Whiteboard';
        id: string;
        nameID: string;
        createdDate: Date;
        profile: {
          __typename?: 'Profile';
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
        };
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        checkout?:
          | {
              __typename?: 'WhiteboardCheckout';
              id: string;
              lockedBy: string;
              status: WhiteboardCheckoutStateEnum;
              lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
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
                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              };
            }
          | undefined;
      }>
    | undefined;
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
            sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
          }>;
          sender?:
            | {
                __typename?: 'User';
                id: string;
                nameID: string;
                firstName: string;
                lastName: string;
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
  postTemplate?:
    | {
        __typename?: 'PostTemplate';
        id: string;
        type: string;
        defaultDescription: string;
        profile: {
          __typename?: 'Profile';
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
      }
    | undefined;
  whiteboardTemplate?:
    | {
        __typename?: 'WhiteboardTemplate';
        id: string;
        value: string;
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
      }
    | undefined;
};

export type CalloutPostTemplateFragment = {
  __typename?: 'Callout';
  postTemplate?:
    | {
        __typename?: 'PostTemplate';
        id: string;
        type: string;
        defaultDescription: string;
        profile: {
          __typename?: 'Profile';
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
      }
    | undefined;
};

export type CalloutWhiteboardTemplateFragment = {
  __typename?: 'Callout';
  whiteboardTemplate?:
    | {
        __typename?: 'WhiteboardTemplate';
        id: string;
        value: string;
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
      }
    | undefined;
};

export type CalloutPostCreatedSubscriptionVariables = Exact<{
  calloutID: Scalars['UUID'];
}>;

export type CalloutPostCreatedSubscription = {
  __typename?: 'Subscription';
  calloutPostCreated: {
    __typename?: 'CalloutPostCreated';
    post: {
      __typename?: 'Post';
      id: string;
      nameID: string;
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

export type PostsOnCalloutFragment = {
  __typename?: 'Callout';
  id: string;
  posts?:
    | Array<{
        __typename?: 'Post';
        id: string;
        nameID: string;
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
      }>
    | undefined;
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

export type SpacePostQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type SpacePostQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                posts?:
                  | Array<{
                      __typename?: 'Post';
                      id: string;
                      nameID: string;
                      type: string;
                      createdDate: Date;
                      createdBy?:
                        | {
                            __typename?: 'User';
                            id: string;
                            profile: {
                              __typename?: 'Profile';
                              id: string;
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
                        visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      };
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
                              | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                              | undefined;
                          }>;
                          sender?:
                            | {
                                __typename?: 'User';
                                id: string;
                                nameID: string;
                                firstName: string;
                                lastName: string;
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
                                  location?:
                                    | { __typename?: 'Location'; id: string; city: string; country: string }
                                    | undefined;
                                };
                              }
                            | undefined;
                        }>;
                      };
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengePostQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePostQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
                        type: string;
                        createdDate: Date;
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
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
                          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        };
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
                                | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                                | undefined;
                            }>;
                            sender?:
                              | {
                                  __typename?: 'User';
                                  id: string;
                                  nameID: string;
                                  firstName: string;
                                  lastName: string;
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
                                    location?:
                                      | { __typename?: 'Location'; id: string; city: string; country: string }
                                      | undefined;
                                  };
                                }
                              | undefined;
                          }>;
                        };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityPostQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityPostQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        nameID: string;
                        type: string;
                        createdDate: Date;
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
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
                          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        };
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
                                | { __typename?: 'User'; id: string; firstName: string; lastName: string }
                                | undefined;
                            }>;
                            sender?:
                              | {
                                  __typename?: 'User';
                                  id: string;
                                  nameID: string;
                                  firstName: string;
                                  lastName: string;
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
                                    location?:
                                      | { __typename?: 'Location'; id: string; city: string; country: string }
                                      | undefined;
                                  };
                                }
                              | undefined;
                          }>;
                        };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type PostDashboardDataFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        posts?:
          | Array<{
              __typename?: 'Post';
              id: string;
              nameID: string;
              type: string;
              createdDate: Date;
              createdBy?:
                | {
                    __typename?: 'User';
                    id: string;
                    profile: {
                      __typename?: 'Profile';
                      id: string;
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
                visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
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
                    sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                  }>;
                  sender?:
                    | {
                        __typename?: 'User';
                        id: string;
                        nameID: string;
                        firstName: string;
                        lastName: string;
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
                          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
                        };
                      }
                    | undefined;
                }>;
              };
            }>
          | undefined;
      }>
    | undefined;
};

export type PostDashboardFragment = {
  __typename?: 'Post';
  id: string;
  nameID: string;
  type: string;
  createdDate: Date;
  createdBy?:
    | {
        __typename?: 'User';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
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
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
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
        sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
      }>;
      sender?:
        | {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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

export type SpacePostSettingsQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type SpacePostSettingsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                posts?:
                  | Array<{
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
                    }>
                  | undefined;
                postNames?:
                  | Array<{
                      __typename?: 'Post';
                      id: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string };
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengePostSettingsQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePostSettingsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
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
                      }>
                    | undefined;
                  postNames?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityPostSettingsQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityPostSettingsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
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
                      }>
                    | undefined;
                  postNames?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
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
  type: CalloutType;
  posts?:
    | Array<{
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
      }>
    | undefined;
  postNames?:
    | Array<{ __typename?: 'Post'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }>
    | undefined;
};

export type SpacePostProviderQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type SpacePostProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                posts?:
                  | Array<{
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
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengePostProviderQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePostProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
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
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityPostProviderQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  postNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityPostProviderQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  posts?:
                    | Array<{
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
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type PostProviderDataFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        posts?:
          | Array<{
              __typename?: 'Post';
              id: string;
              nameID: string;
              profile: { __typename?: 'Profile'; id: string; displayName: string };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
              comments: { __typename?: 'Room'; id: string; messagesCount: number };
            }>
          | undefined;
      }>
    | undefined;
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

export type CalloutPostInfoFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        posts?: Array<{ __typename?: 'Post'; id: string; nameID: string }> | undefined;
      }>
    | undefined;
};

export type ContributeTabPostFragment = {
  __typename?: 'Post';
  id: string;
  nameID: string;
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
  nameID: string;
  type: string;
  createdDate: Date;
  createdBy?:
    | { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } }
    | undefined;
  comments: { __typename?: 'Room'; id: string; messagesCount: number };
  profile: {
    __typename?: 'Profile';
    id: string;
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

export type CreatePostMutationVariables = Exact<{
  postData: CreatePostOnCalloutInput;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPostOnCallout: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    type: string;
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
      visuals: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }>;
    };
  };
};

export type DeletePostMutationVariables = Exact<{
  input: DeletePostInput;
}>;

export type DeletePostMutation = { __typename?: 'Mutation'; deletePost: { __typename?: 'Post'; id: string } };

export type MovePostToCalloutMutationVariables = Exact<{
  postId: Scalars['UUID'];
  calloutId: Scalars['UUID'];
}>;

export type MovePostToCalloutMutation = {
  __typename?: 'Mutation';
  movePostToCallout: {
    __typename?: 'Post';
    id: string;
    nameID: string;
    callout?: { __typename?: 'Callout'; id: string; nameID: string } | undefined;
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

export type InnovationFlowTemplateCardFragment = {
  __typename?: 'InnovationFlowTemplate';
  id: string;
  definition: string;
  type: InnovationFlowType;
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

export type SpaceWhiteboardTemplateValueQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type SpaceWhiteboardTemplateValueQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplate?:
            | {
                __typename?: 'WhiteboardTemplate';
                value: string;
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
              }
            | undefined;
        }
      | undefined;
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

export type PlatformWhiteboardTemplateValueQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type PlatformWhiteboardTemplateValueQuery = {
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
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  id: string;
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        value: string;
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
                      }
                    | undefined;
                }
              | undefined;
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
          }
        | undefined;
    };
  };
};

export type WhiteboardLockedByDetailsQueryVariables = Exact<{
  ids: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type WhiteboardLockedByDetailsQuery = {
  __typename?: 'Query';
  usersById: Array<{
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
};

export type WhiteboardDetailsFragment = {
  __typename?: 'Whiteboard';
  id: string;
  nameID: string;
  createdDate: Date;
  profile: {
    __typename?: 'Profile';
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
  };
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
  checkout?:
    | {
        __typename?: 'WhiteboardCheckout';
        id: string;
        lockedBy: string;
        status: WhiteboardCheckoutStateEnum;
        lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
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
          visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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

export type WhiteboardValueFragment = { __typename?: 'Whiteboard'; id: string; value: string };

export type CheckoutDetailsFragment = {
  __typename?: 'WhiteboardCheckout';
  id: string;
  lockedBy: string;
  status: WhiteboardCheckoutStateEnum;
  lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type WhiteboardTemplatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type WhiteboardTemplatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplates: Array<{
            __typename?: 'WhiteboardTemplate';
            id: string;
            value: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
          }>;
        }
      | undefined;
  };
};

export type CreateWhiteboardWhiteboardTemplateFragment = {
  __typename?: 'WhiteboardTemplate';
  id: string;
  value: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
};

export type CalloutWithWhiteboardFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
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
        whiteboards?:
          | Array<{
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              profile: {
                __typename?: 'Profile';
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
              };
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
              checkout?:
                | {
                    __typename?: 'WhiteboardCheckout';
                    id: string;
                    lockedBy: string;
                    status: WhiteboardCheckoutStateEnum;
                    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type CollaborationWithWhiteboardDetailsFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
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
        whiteboards?:
          | Array<{
              __typename?: 'Whiteboard';
              id: string;
              nameID: string;
              createdDate: Date;
              profile: {
                __typename?: 'Profile';
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
              };
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
              checkout?:
                | {
                    __typename?: 'WhiteboardCheckout';
                    id: string;
                    lockedBy: string;
                    status: WhiteboardCheckoutStateEnum;
                    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
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
                      visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    };
                  }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type SpaceWhiteboardFromCalloutQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID_NAMEID'];
}>;

export type SpaceWhiteboardFromCalloutQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
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
                whiteboards?:
                  | Array<{
                      __typename?: 'Whiteboard';
                      id: string;
                      nameID: string;
                      createdDate: Date;
                      profile: {
                        __typename?: 'Profile';
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
                      };
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'WhiteboardCheckout';
                            id: string;
                            lockedBy: string;
                            status: WhiteboardCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
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
                              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                            };
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type SpaceWhiteboardsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceWhiteboardsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
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
                whiteboards?:
                  | Array<{
                      __typename?: 'Whiteboard';
                      id: string;
                      nameID: string;
                      createdDate: Date;
                      profile: {
                        __typename?: 'Profile';
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
                      };
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'WhiteboardCheckout';
                            id: string;
                            lockedBy: string;
                            status: WhiteboardCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
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
                              visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                            };
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type WhiteboardWithValueQueryVariables = Exact<{
  whiteboardId: Scalars['UUID'];
}>;

export type WhiteboardWithValueQuery = {
  __typename?: 'Query';
  lookup: {
    __typename?: 'LookupQueryResults';
    whiteboard?:
      | {
          __typename?: 'Whiteboard';
          id: string;
          nameID: string;
          createdDate: Date;
          value: string;
          profile: {
            __typename?: 'Profile';
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
          };
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
              }
            | undefined;
          checkout?:
            | {
                __typename?: 'WhiteboardCheckout';
                id: string;
                lockedBy: string;
                status: WhiteboardCheckoutStateEnum;
                lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
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
                  visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeWhiteboardFromCalloutQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeWhiteboardFromCalloutQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityWhiteboardFromCalloutQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityWhiteboardFromCalloutQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
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
                  whiteboards?:
                    | Array<{
                        __typename?: 'Whiteboard';
                        id: string;
                        nameID: string;
                        createdDate: Date;
                        profile: {
                          __typename?: 'Profile';
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
                        };
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'WhiteboardCheckout';
                              id: string;
                              lockedBy: string;
                              status: WhiteboardCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
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
                        createdBy?:
                          | {
                              __typename?: 'User';
                              id: string;
                              profile: {
                                __typename?: 'Profile';
                                id: string;
                                displayName: string;
                                visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                              };
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type SpaceTemplateWhiteboardValuesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID'];
}>;

export type SpaceTemplateWhiteboardValuesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplate?:
            | {
                __typename?: 'WhiteboardTemplate';
                id: string;
                value: string;
                profile: {
                  __typename?: 'Profile';
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
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type PlatformTemplateWhiteboardValuesQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
  whiteboardId: Scalars['UUID'];
}>;

export type PlatformTemplateWhiteboardValuesQuery = {
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
                        value: string;
                        profile: {
                          __typename?: 'Profile';
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
  input: CreateWhiteboardOnCalloutInput;
}>;

export type CreateWhiteboardOnCalloutMutation = {
  __typename?: 'Mutation';
  createWhiteboardOnCallout: {
    __typename?: 'Whiteboard';
    id: string;
    nameID: string;
    createdDate: Date;
    profile: {
      __typename?: 'Profile';
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
    };
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
    checkout?:
      | {
          __typename?: 'WhiteboardCheckout';
          id: string;
          lockedBy: string;
          status: WhiteboardCheckoutStateEnum;
          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
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
            visual?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
          };
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
  input: UpdateWhiteboardDirectInput;
}>;

export type UpdateWhiteboardMutation = {
  __typename?: 'Mutation';
  updateWhiteboard: {
    __typename?: 'Whiteboard';
    id: string;
    value: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type CheckoutWhiteboardMutationVariables = Exact<{
  input: WhiteboardCheckoutEventInput;
}>;

export type CheckoutWhiteboardMutation = {
  __typename?: 'Mutation';
  eventOnWhiteboardCheckout: {
    __typename?: 'WhiteboardCheckout';
    id: string;
    lockedBy: string;
    status: WhiteboardCheckoutStateEnum;
    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type WhiteboardContentUpdatedSubscriptionVariables = Exact<{
  whiteboardIDs: Array<Scalars['UUID']> | Scalars['UUID'];
}>;

export type WhiteboardContentUpdatedSubscription = {
  __typename?: 'Subscription';
  whiteboardContentUpdated: { __typename?: 'WhiteboardContentUpdated'; whiteboardID: string; value: string };
};

export type ProfileVerifiedCredentialSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ProfileVerifiedCredentialSubscription = {
  __typename?: 'Subscription';
  profileVerifiedCredential: { __typename?: 'ProfileCredentialVerified'; vc: string };
};

export type ChallengePreferencesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePreferencesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
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
};

export type UpdatePreferenceOnChallengeMutationVariables = Exact<{
  preferenceData: UpdateChallengePreferenceInput;
}>;

export type UpdatePreferenceOnChallengeMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnChallenge: { __typename?: 'Preference'; id: string; value: string };
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

export type SpacePreferencesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
}>;

export type SpacePreferencesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    preferences?:
      | Array<{
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
        }>
      | undefined;
  };
};

export type UpdatePreferenceOnSpaceMutationVariables = Exact<{
  preferenceData: UpdateSpacePreferenceInput;
}>;

export type UpdatePreferenceOnSpaceMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnSpace: { __typename?: 'Preference'; id: string; value: string };
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
  usersById: Array<{
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

export type CreateDiscussionMutationVariables = Exact<{
  input: CommunicationCreateDiscussionInput;
}>;

export type CreateDiscussionMutation = {
  __typename?: 'Mutation';
  createDiscussion: {
    __typename?: 'Discussion';
    id: string;
    nameID: string;
    createdBy?: string | undefined;
    timestamp?: number | undefined;
    category: DiscussionCategory;
    profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
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
          sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
        }>;
        sender?:
          | {
              __typename?: 'User';
              id: string;
              nameID: string;
              firstName: string;
              lastName: string;
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
  nameID: string;
  createdBy?: string | undefined;
  timestamp?: number | undefined;
  category: DiscussionCategory;
  profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
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
        sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
      }>;
      sender?:
        | {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
            nameID: string;
            category: DiscussionCategory;
            timestamp?: number | undefined;
            createdBy?: string | undefined;
            profile: {
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
            nameID: string;
            createdBy?: string | undefined;
            timestamp?: number | undefined;
            category: DiscussionCategory;
            profile: { __typename?: 'Profile'; id: string; displayName: string; description?: string | undefined };
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
                  sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                }>;
                sender?:
                  | {
                      __typename?: 'User';
                      id: string;
                      nameID: string;
                      firstName: string;
                      lastName: string;
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
    sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
  }>;
  sender?:
    | {
        __typename?: 'User';
        id: string;
        nameID: string;
        firstName: string;
        lastName: string;
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
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
        };
      }
    | undefined;
};

export type ReactionDetailsFragment = {
  __typename?: 'Reaction';
  id: string;
  emoji: string;
  sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
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
      sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
    }>;
    sender?:
      | {
          __typename?: 'User';
          id: string;
          nameID: string;
          firstName: string;
          lastName: string;
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
    sender?: { __typename?: 'User'; id: string } | undefined;
  };
};

export type MentionableUsersQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
}>;

export type MentionableUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      nameID: string;
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
    sender?: { __typename?: 'User'; id: string } | undefined;
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
              sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
            }>;
            sender?:
              | {
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  firstName: string;
                  lastName: string;
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
            sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
          };
        }
      | undefined;
  };
};

export type CommunityUpdatesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityUpdatesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName?: string | undefined;
          communication?:
            | {
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
                      sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                    }>;
                    sender?:
                      | {
                          __typename?: 'User';
                          id: string;
                          nameID: string;
                          firstName: string;
                          lastName: string;
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

export type CommunityUserPrivilegesQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityUserPrivilegesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    spaceCommunity?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    community?:
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

export type ApplyForCommunityMembershipMutationVariables = Exact<{
  input: CommunityApplyInput;
}>;

export type ApplyForCommunityMembershipMutation = {
  __typename?: 'Mutation';
  applyForCommunityMembership: { __typename?: 'Application'; id: string };
};

export type DeleteUserApplicationMutationVariables = Exact<{
  input: DeleteApplicationInput;
}>;

export type DeleteUserApplicationMutation = {
  __typename?: 'Mutation';
  deleteUserApplication: { __typename?: 'Application'; id: string };
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

export type EventOnChallengeMutationVariables = Exact<{
  input: InnovationFlowEvent;
}>;

export type EventOnChallengeMutation = {
  __typename?: 'Mutation';
  eventOnChallenge: {
    __typename?: 'InnovationFlow';
    id: string;
    lifecycle?:
      | { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined; state?: string | undefined }
      | undefined;
  };
};

export type ApplicationBySpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  appId: Scalars['UUID'];
}>;

export type ApplicationBySpaceQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    application: {
      __typename?: 'Application';
      id: string;
      createdDate: Date;
      updatedDate: Date;
      questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
    };
  };
};

export type ChallengeApplicationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      profile: { __typename?: 'Profile'; id: string; displayName: string };
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
  };
};

export type SpaceNameIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceNameIdQuery = { __typename?: 'Query'; space: { __typename?: 'Space'; id: string; nameID: string } };

export type ChallengeNameIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeNameIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    challenge: { __typename?: 'Challenge'; id: string; nameID: string };
  };
};

export type OpportunityNameIdQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityNameIdQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    opportunity: { __typename?: 'Opportunity'; id: string; nameID: string; parentNameID?: string | undefined };
  };
};

export type SpaceApplicationQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceApplicationQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    community?: { __typename?: 'Community'; id: string; displayName?: string | undefined } | undefined;
  };
};

export type CommunityApplicationFormQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId?: InputMaybe<Scalars['UUID_NAMEID']>;
  isSpace?: InputMaybe<Scalars['Boolean']>;
  isChallenge?: InputMaybe<Scalars['Boolean']>;
}>;

export type CommunityApplicationFormQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          applicationForm?:
            | {
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
              }
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            applicationForm?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
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

export type ChallengeCommunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  includeDetails?: InputMaybe<Scalars['Boolean']>;
}>;

export type ChallengeCommunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName?: string | undefined;
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            communication?:
              | {
                  __typename?: 'Communication';
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
    };
  };
};

export type CommunityDetailsFragment = {
  __typename?: 'Community';
  id: string;
  displayName?: string | undefined;
  myMembershipStatus?: CommunityMembershipStatus | undefined;
  communication?:
    | {
        __typename?: 'Communication';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type OpportunityCommunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  includeDetails?: InputMaybe<Scalars['Boolean']>;
}>;

export type OpportunityCommunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName?: string | undefined;
            myMembershipStatus?: CommunityMembershipStatus | undefined;
            communication?:
              | {
                  __typename?: 'Communication';
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
    };
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName?: string | undefined;
          myMembershipStatus?: CommunityMembershipStatus | undefined;
          communication?:
            | {
                __typename?: 'Communication';
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
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
              }>
            | undefined;
          memberUsers?:
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
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
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
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCommunityContributorsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityContributorsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
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
                }>
              | undefined;
            memberUsers?:
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCommunityContributorsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityContributorsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
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
                }>
              | undefined;
            memberUsers?:
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type CommunityMembersFragment = {
  __typename?: 'Community';
  leadUsers?:
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
      }>
    | undefined;
  memberUsers?:
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
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
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
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
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
      }>
    | undefined;
};

export type EntityDashboardCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          displayName: string;
          visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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
      }>
    | undefined;
  memberUsers?:
    | Array<{
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
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
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
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
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
      }>
    | undefined;
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
    visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
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

export type ContributingOrganizationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
  filterCredentials?: InputMaybe<Array<AuthorizationCredential> | AuthorizationCredential>;
}>;

export type ContributingOrganizationsQuery = {
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

export type ContributingUsersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
  filterCredentials?: InputMaybe<Array<AuthorizationCredential> | AuthorizationCredential>;
}>;

export type ContributingUsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    isContactable: boolean;
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
  createGroupOnCommunity: { __typename?: 'UserGroup'; id: string; name: string };
};

export type AllCommunitiesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type AllCommunitiesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    community?: { __typename?: 'Community'; id: string; displayName?: string | undefined } | undefined;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          community?: { __typename?: 'Community'; id: string; displayName?: string | undefined } | undefined;
        }>
      | undefined;
    opportunities?:
      | Array<{
          __typename?: 'Opportunity';
          community?: { __typename?: 'Community'; id: string; displayName?: string | undefined } | undefined;
        }>
      | undefined;
  };
};

export type AllCommunityDetailsFragment = { __typename?: 'Community'; id: string; displayName?: string | undefined };

export type ChallengesWithCommunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesWithCommunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
          community?: { __typename?: 'Community'; id: string; displayName?: string | undefined } | undefined;
        }>
      | undefined;
  };
};

export type CommunityGroupsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityGroupsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName?: string | undefined;
          groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
        }
      | undefined;
  };
};

export type CommunityMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type CommunityMessagesQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityMessagesQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          communication?:
            | {
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
                      sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                    }>;
                    sender?:
                      | {
                          __typename?: 'User';
                          id: string;
                          nameID: string;
                          firstName: string;
                          lastName: string;
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

export type ChallengeCommunityMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadUsers?:
              | Array<{
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
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                }>
              | undefined;
          }
        | undefined;
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

export type AssignUserAsSpaceAdminMutationVariables = Exact<{
  input: AssignCommunityRoleToUserInput;
}>;

export type AssignUserAsSpaceAdminMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type RemoveUserAsSpaceAdminMutationVariables = Exact<{
  input: RemoveCommunityRoleFromUserInput;
}>;

export type RemoveUserAsSpaceAdminMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type AssignUserAsChallengeAdminMutationVariables = Exact<{
  input: AssignCommunityRoleToUserInput;
}>;

export type AssignUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type RemoveUserAsChallengeAdminMutationVariables = Exact<{
  input: RemoveCommunityRoleFromUserInput;
}>;

export type RemoveUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type AssignUserAsOpportunityAdminMutationVariables = Exact<{
  input: AssignCommunityRoleToUserInput;
}>;

export type AssignUserAsOpportunityAdminMutation = {
  __typename?: 'Mutation';
  assignCommunityRoleToUser: { __typename?: 'User'; id: string };
};

export type RemoveUserAsOpportunityAdminMutationVariables = Exact<{
  input: RemoveCommunityRoleFromUserInput;
}>;

export type RemoveUserAsOpportunityAdminMutation = {
  __typename?: 'Mutation';
  removeCommunityRoleFromUser: { __typename?: 'User'; id: string };
};

export type OpportunityCommunityMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            memberUsers?:
              | Array<{
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
                }>
              | undefined;
            leadUsers?:
              | Array<{
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
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
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
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
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
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type SpaceCommunityMembersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCommunityMembersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?:
            | Array<{
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
              }>
            | undefined;
          leadUsers?:
            | Array<{
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
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
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
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
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
              }>
            | undefined;
          policy?:
            | {
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
              }
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
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

export type CommunityPolicyFragment = {
  __typename?: 'CommunityPolicy';
  id: string;
  lead: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
  member: { __typename?: 'CommunityRolePolicy'; maxOrg: number; maxUser: number; minOrg: number; minUser: number };
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

export type UserOrganizationsQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserOrganizationsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    organizations: Array<{
      __typename?: 'RolesResultOrganization';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
  };
};

export type UserOrganizationsDetailsFragment = {
  __typename?: 'ContributorRoles';
  organizations: Array<{
    __typename?: 'RolesResultOrganization';
    id: string;
    nameID: string;
    displayName: string;
    roles: Array<string>;
    userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
  }>;
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
      challenges: Array<{
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
  createGroupOnOrganization: { __typename?: 'UserGroup'; id: string; name: string };
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
    profile: { __typename?: 'Profile'; id: string; displayName: string };
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
          name: string;
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

export type OrganizationDetailsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationDetailsQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      displayName: string;
      description?: string | undefined;
      visual?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      references?: Array<{ __typename?: 'Reference'; name: string; uri: string }> | undefined;
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
    groups?:
      | Array<{
          __typename?: 'UserGroup';
          id: string;
          name: string;
          members?:
            | Array<{
                __typename?: 'User';
                id: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
              }>
            | undefined;
        }>
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
    groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
  };
};

export type OrganizationNameQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationNameQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
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

export type MessagingAvailableRecipientsQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
}>;

export type MessagingAvailableRecipientsQuery = {
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

export type MessagingUserDetailsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type MessagingUserDetailsQuery = {
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

export type MessagingUserInformationFragment = {
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
  usersById: Array<{
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

export type GroupDetailsFragment = { __typename?: 'UserGroup'; id: string; name: string };

export type GroupInfoFragment = {
  __typename?: 'UserGroup';
  id: string;
  name: string;
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
    spaceID: string;
    displayName: string;
    roles: Array<string>;
    visibility: SpaceVisibility;
    challenges: Array<{
      __typename?: 'RolesResultCommunity';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
    }>;
    opportunities: Array<{
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
  applications?:
    | Array<{
        __typename?: 'ApplicationForRoleResult';
        id: string;
        communityID: string;
        displayName: string;
        state: string;
        spaceID: string;
        challengeID?: string | undefined;
        opportunityID?: string | undefined;
      }>
    | undefined;
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
  deleteUserGroup: { __typename?: 'UserGroup'; id: string; name: string };
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
    name: string;
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
    name: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
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

export type RolesUserQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RolesUserQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      nameID: string;
      spaceID: string;
      displayName: string;
      roles: Array<string>;
      visibility: SpaceVisibility;
      challenges: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      opportunities: Array<{
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
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          communityID: string;
          displayName: string;
          state: string;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
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

export type UserApplicationsQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserApplicationsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          state: string;
          communityID: string;
          displayName: string;
          createdDate: Date;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
};

export type UserCardQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserCardQuery = {
  __typename?: 'Query';
  user: {
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
      spaceID: string;
      displayName: string;
      roles: Array<string>;
      visibility: SpaceVisibility;
      challenges: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      opportunities: Array<{
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
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          communityID: string;
          displayName: string;
          state: string;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
  platform: {
    __typename?: 'Platform';
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type UserProfileApplicationsQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserProfileApplicationsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          state: string;
          displayName: string;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
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

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
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
  inviteExternalUserForCommunityMembership: { __typename?: 'InvitationExternal'; id: string };
};

export type PendingMembershipsQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type PendingMembershipsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    invitations?:
      | Array<{
          __typename?: 'InvitationForRoleResult';
          id: string;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
          welcomeMessage?: string | undefined;
          createdBy: string;
          createdDate: Date;
          state: string;
        }>
      | undefined;
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          spaceID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
          state: string;
        }>
      | undefined;
  };
};

export type PendingMembershipsSpaceQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  fetchDetails?: Scalars['Boolean'];
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
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
    };
  };
};

export type PendingMembershipsChallengeQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  fetchDetails?: Scalars['Boolean'];
}>;

export type PendingMembershipsChallengeQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      profile: {
        __typename?: 'Profile';
        tagline: string;
        id: string;
        displayName: string;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
      };
    };
  };
};

export type PendingMembershipsOpportunityQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  fetchDetails?: Scalars['Boolean'];
}>;

export type PendingMembershipsOpportunityQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      profile: {
        __typename?: 'Profile';
        tagline: string;
        id: string;
        displayName: string;
        tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        cardBanner?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
      };
    };
  };
};

export type PendingMembershipsUserQueryVariables = Exact<{
  userId: Scalars['UUID'];
}>;

export type PendingMembershipsUserQuery = {
  __typename?: 'Query';
  usersById: Array<{
    __typename?: 'User';
    id: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  }>;
};

export type PendingMembershipsJourneyProfileFragment = {
  __typename?: 'Profile';
  tagline: string;
  id: string;
  displayName: string;
  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
  cardBanner?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
};

export type PendingMembershipsMembershipsFragment = {
  __typename?: 'Community';
  id: string;
  applications?: Array<{ __typename?: 'Application'; id: string }> | undefined;
  invitations?:
    | Array<{
        __typename?: 'Invitation';
        id: string;
        welcomeMessage?: string | undefined;
        createdBy: {
          __typename?: 'User';
          id: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
        };
      }>
    | undefined;
};

export type PendingMembershipInvitationFragment = {
  __typename?: 'Invitation';
  id: string;
  welcomeMessage?: string | undefined;
  createdBy: { __typename?: 'User'; id: string; profile: { __typename?: 'Profile'; id: string; displayName: string } };
};

export type SpaceContributionDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceContributionDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    context?: { __typename?: 'Context'; id: string } | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
  };
};

export type ChallengeContributionDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeContributionDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      context?: { __typename?: 'Context'; id: string } | undefined;
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
  };
};

export type OpportunityContributionDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityContributionDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      parentNameID?: string | undefined;
      profile: {
        __typename?: 'Profile';
        id: string;
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
      context?: { __typename?: 'Context'; id: string } | undefined;
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
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

export type InnovationHubQueryVariables = Exact<{ [key: string]: never }>;

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

export type HomePageSpacesQueryVariables = Exact<{
  includeMembershipStatus: Scalars['Boolean'];
}>;

export type HomePageSpacesQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    community?:
      | { __typename?: 'Community'; id: string; myMembershipStatus?: CommunityMembershipStatus | undefined }
      | undefined;
    profile?: {
      __typename?: 'Profile';
      id: string;
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
      cardBanner?: { __typename?: 'Visual'; id: string; uri: string; alternativeText?: string | undefined } | undefined;
    };
    context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
    metrics?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  }>;
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
          type: InnovationHubType;
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
                nameID: string;
                visibility: SpaceVisibility;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
                host?:
                  | {
                      __typename?: 'Organization';
                      id: string;
                      nameID: string;
                      profile: { __typename?: 'Profile'; id: string; displayName: string };
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type CreateInnovationHubMutationVariables = Exact<{
  hubData: CreateInnovationHubInput;
}>;

export type CreateInnovationHubMutation = {
  __typename?: 'Mutation';
  createInnovationHub: { __typename?: 'InnovationHub'; id: string; nameID: string };
};

export type UpdateInnovationHubMutationVariables = Exact<{
  hubData: UpdateInnovationHubInput;
}>;

export type UpdateInnovationHubMutation = {
  __typename?: 'Mutation';
  updateInnovationHub: { __typename?: 'InnovationHub'; id: string; nameID: string };
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
                definition: string;
                type: InnovationFlowType;
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
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
        id: string;
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
          definition: string;
          type: InnovationFlowType;
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
          avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        };
      }
    | undefined;
};

export type LibraryTemplatesFragment = {
  __typename?: 'TemplatesSet';
  id: string;
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
    definition: string;
    type: InnovationFlowType;
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
};

export type ChallengeExplorerPageQueryVariables = Exact<{
  userID: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type ChallengeExplorerPageQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    spaces: Array<{
      __typename?: 'RolesResultSpace';
      id: string;
      roles: Array<string>;
      challenges: Array<{ __typename?: 'RolesResultCommunity'; id: string; roles: Array<string> }>;
    }>;
  };
};

export type ChallengeExplorerSearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type ChallengeExplorerSearchQuery = {
  __typename?: 'Query';
  search: {
    __typename?: 'ISearchResults';
    journeyResults: Array<
      | {
          __typename?: 'SearchResultChallenge';
          id: string;
          type: SearchResultType;
          terms: Array<string>;
          challenge: {
            __typename?: 'Challenge';
            id: string;
            nameID: string;
            spaceID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
          space: {
            __typename?: 'Space';
            id: string;
            nameID: string;
            visibility: SpaceVisibility;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
        }
      | { __typename?: 'SearchResultOpportunity'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultOrganization'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultPost'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultSpace'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultUser'; id: string; type: SearchResultType; terms: Array<string> }
      | { __typename?: 'SearchResultUserGroup'; id: string; type: SearchResultType; terms: Array<string> }
    >;
  };
};

export type ChallengeExplorerDataQueryVariables = Exact<{
  spaceIDs?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
  challengeIDs?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
}>;

export type ChallengeExplorerDataQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: { __typename?: 'Profile'; id: string; tagline: string; displayName: string };
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            tagline: string;
            displayName: string;
            description?: string | undefined;
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
          context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
        }>
      | undefined;
  }>;
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

export type ChallengeApplicationsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            applications?:
              | Array<{
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
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type SpaceAvailableLeadUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type SpaceAvailableLeadUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          availableLeadUsers?:
            | {
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
              }
            | undefined;
        }
      | undefined;
  };
};

export type SpaceAvailableMemberUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type SpaceAvailableMemberUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          availableMemberUsers?:
            | {
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
              }
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAvailableLeadUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type ChallengeAvailableLeadUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableLeadUsers?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeAvailableMemberUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type ChallengeAvailableMemberUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableMemberUsers?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAvailableLeadUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type OpportunityAvailableLeadUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableLeadUsers?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAvailableMemberUsersQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type OpportunityAvailableMemberUsersQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableMemberUsers?:
              | {
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
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type CommunityAvailableLeadUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableLeadUsers?:
    | {
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
      }
    | undefined;
};

export type CommunityAvailableMemberUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableMemberUsers?:
    | {
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
      }
    | undefined;
};

export type AvailableUserFragment = {
  __typename?: 'User';
  id: string;
  email: string;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
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

export type UpdateSpacePlatformSettingsMutationVariables = Exact<{
  spaceId: Scalars['String'];
  visibility: SpaceVisibility;
}>;

export type UpdateSpacePlatformSettingsMutation = {
  __typename?: 'Mutation';
  updateSpacePlatformSettings: {
    __typename?: 'Space';
    id: string;
    visibility: SpaceVisibility;
    nameID: string;
    host?: { __typename?: 'Organization'; id: string } | undefined;
  };
};

export type AdminSpacesListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminSpacesListQuery = {
  __typename?: 'Query';
  spaces: Array<{
    __typename?: 'Space';
    visibility: SpaceVisibility;
    id: string;
    nameID: string;
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
  visibility: SpaceVisibility;
  profile: { __typename?: 'Profile'; id: string; displayName: string };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type SpaceStorageAdminQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceStorageAdminQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    storageBucket?:
      | {
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
        }
      | undefined;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          profile: { __typename?: 'Profile'; id: string; displayName: string };
          storageBucket?:
            | {
                __typename?: 'StorageBucket';
                id: string;
                documents: Array<{
                  __typename?: 'Document';
                  id: string;
                  displayName: string;
                  size: number;
                  mimeType: MimeType;
                  uploadedDate: Date;
                  createdBy?:
                    | {
                        __typename?: 'User';
                        id: string;
                        nameID: string;
                        profile: { __typename?: 'Profile'; id: string; displayName: string };
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
              }
            | undefined;
        }>
      | undefined;
  };
};

export type DocumentDataFragment = {
  __typename?: 'Document';
  id: string;
  displayName: string;
  size: number;
  mimeType: MimeType;
  uploadedDate: Date;
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
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
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
            definition: string;
            type: InnovationFlowType;
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

export type AdminInnovationFlowTemplateFragment = {
  __typename?: 'InnovationFlowTemplate';
  id: string;
  definition: string;
  type: InnovationFlowType;
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

export type AdminWhiteboardTemplateValueFragment = { __typename?: 'WhiteboardTemplate'; id: string; value: string };

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

export type SpaceTemplatesAdminWhiteboardTemplateWithValueQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type SpaceTemplatesAdminWhiteboardTemplateWithValueQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          whiteboardTemplate?: { __typename?: 'WhiteboardTemplate'; id: string; value: string } | undefined;
        }
      | undefined;
  };
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
                avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                definition: string;
                type: InnovationFlowType;
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
    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
  };
};

export type InnovationPackWhiteboardTemplateWithValueQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type InnovationPackWhiteboardTemplateWithValueQuery = {
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
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  whiteboardTemplate?: { __typename?: 'WhiteboardTemplate'; id: string; value: string } | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type InnovationPackFullWhiteboardTemplateWithValueQueryVariables = Exact<{
  innovationPackId: Scalars['UUID_NAMEID'];
  whiteboardTemplateId: Scalars['UUID'];
}>;

export type InnovationPackFullWhiteboardTemplateWithValueQuery = {
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
            templates?:
              | {
                  __typename?: 'TemplatesSet';
                  whiteboardTemplate?:
                    | {
                        __typename?: 'WhiteboardTemplate';
                        value: string;
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
                      }
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
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
    definition: string;
    type: InnovationFlowType;
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
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
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
                    definition: string;
                    type: InnovationFlowType;
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
  definition: Scalars['LifecycleDefinition'];
}>;

export type UpdateInnovationFlowTemplateMutation = {
  __typename?: 'Mutation';
  updateInnovationFlowTemplate: { __typename?: 'InnovationFlowTemplate'; id: string };
};

export type CreateInnovationFlowTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  profile: CreateProfileInput;
  definition: Scalars['LifecycleDefinition'];
  type: InnovationFlowType;
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
  value?: InputMaybe<Scalars['JSON']>;
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
  value: Scalars['JSON'];
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
      platform: {
        __typename?: 'PlatformLocations';
        environment: string;
        domain: string;
        about: string;
        feedback: string;
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
        featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
      };
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
  platform: {
    __typename?: 'PlatformLocations';
    environment: string;
    domain: string;
    about: string;
    feedback: string;
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
    featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
  };
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
      metrics: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }>;
      services: Array<{ __typename?: 'ServiceMetadata'; name?: string | undefined; version?: string | undefined }>;
    };
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
      | {
          __typename?: 'SearchResultChallenge';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          challenge: {
            __typename?: 'Challenge';
            id: string;
            nameID: string;
            spaceID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
          space: {
            __typename?: 'Space';
            id: string;
            nameID: string;
            visibility: SpaceVisibility;
            profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
        }
      | {
          __typename?: 'SearchResultOpportunity';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          opportunity: {
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
          challenge: {
            __typename?: 'Challenge';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
          space: {
            __typename?: 'Space';
            id: string;
            nameID: string;
            visibility: SpaceVisibility;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
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
      | {
          __typename?: 'SearchResultSpace';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
          space: {
            __typename?: 'Space';
            id: string;
            nameID: string;
            visibility: SpaceVisibility;
            profile: {
              __typename?: 'Profile';
              id: string;
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
            context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
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
    contributorResults: Array<
      | {
          __typename?: 'SearchResultChallenge';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
      | {
          __typename?: 'SearchResultOpportunity';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
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
      | {
          __typename?: 'SearchResultChallenge';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
      | {
          __typename?: 'SearchResultOpportunity';
          id: string;
          score: number;
          terms: Array<string>;
          type: SearchResultType;
        }
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
            nameID: string;
            createdDate: Date;
            profile: {
              __typename?: 'Profile';
              displayName: string;
              id: string;
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
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
            authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
          };
          challenge?:
            | {
                __typename?: 'Challenge';
                id: string;
                nameID: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
                authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
              }
            | undefined;
          opportunity?:
            | {
                __typename?: 'Opportunity';
                id: string;
                nameID: string;
                profile: { __typename?: 'Profile'; id: string; displayName: string };
                authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
              }
            | undefined;
          callout: {
            __typename?: 'Callout';
            id: string;
            nameID: string;
            profile: { __typename?: 'Profile'; id: string; displayName: string };
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
    nameID: string;
    createdDate: Date;
    profile: {
      __typename?: 'Profile';
      displayName: string;
      id: string;
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
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
  challenge?:
    | {
        __typename?: 'Challenge';
        id: string;
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      }
    | undefined;
  opportunity?:
    | {
        __typename?: 'Opportunity';
        id: string;
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      }
    | undefined;
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type PostParentFragment = {
  __typename?: 'SearchResultPost';
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
  challenge?:
    | {
        __typename?: 'Challenge';
        id: string;
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      }
    | undefined;
  opportunity?:
    | {
        __typename?: 'Opportunity';
        id: string;
        nameID: string;
        profile: { __typename?: 'Profile'; id: string; displayName: string };
        authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
      }
    | undefined;
  callout: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
  };
};

export type SearchResultUserFragment = {
  __typename?: 'SearchResultUser';
  user: {
    __typename?: 'User';
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
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
};

export type SearchResultChallengeFragment = {
  __typename?: 'SearchResultChallenge';
  challenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    spaceID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: { __typename?: 'Profile'; id: string; displayName: string; tagline: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
};

export type SearchResultOpportunityFragment = {
  __typename?: 'SearchResultOpportunity';
  opportunity: {
    __typename?: 'Opportunity';
    id: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
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
    context?: { __typename?: 'Context'; id: string; vision?: string | undefined } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
  challenge: {
    __typename?: 'Challenge';
    id: string;
    nameID: string;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  };
  space: {
    __typename?: 'Space';
    id: string;
    nameID: string;
    visibility: SpaceVisibility;
    profile: { __typename?: 'Profile'; id: string; displayName: string };
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
      challenges: Array<{ __typename?: 'RolesResultCommunity'; id: string; nameID: string; roles: Array<string> }>;
      opportunities: Array<{ __typename?: 'RolesResultCommunity'; id: string; roles: Array<string> }>;
    }>;
    organizations: Array<{ __typename?: 'RolesResultOrganization'; id: string; roles: Array<string> }>;
  };
};

export type JourneyStorageConfigQueryVariables = Exact<{
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type JourneyStorageConfigQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    profile?: {
      __typename?: 'Profile';
      id: string;
      storageBucket?:
        | {
            __typename?: 'StorageBucket';
            id: string;
            allowedMimeTypes: Array<string>;
            maxFileSize: number;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        storageBucket?:
          | {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }
          | undefined;
      };
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        storageBucket?:
          | {
              __typename?: 'StorageBucket';
              id: string;
              allowedMimeTypes: Array<string>;
              maxFileSize: number;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }
          | undefined;
      };
    };
  };
};

export type CalloutStorageConfigQueryVariables = Exact<{
  calloutId: Scalars['UUID_NAMEID'];
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type CalloutStorageConfigQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  storageBucket?:
                    | {
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
                      }
                    | undefined;
                };
              }>
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    storageBucket?:
                      | {
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
                        }
                      | undefined;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    storageBucket?:
                      | {
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
                        }
                      | undefined;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type CalloutPostStorageConfigQueryVariables = Exact<{
  postId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  spaceNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  opportunityNameId?: InputMaybe<Scalars['UUID_NAMEID']>;
  includeSpace?: InputMaybe<Scalars['Boolean']>;
  includeChallenge?: InputMaybe<Scalars['Boolean']>;
  includeOpportunity?: InputMaybe<Scalars['Boolean']>;
}>;

export type CalloutPostStorageConfigQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                posts?:
                  | Array<{
                      __typename?: 'Post';
                      id: string;
                      profile: {
                        __typename?: 'Profile';
                        id: string;
                        storageBucket?:
                          | {
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
                            }
                          | undefined;
                      };
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
    challenge?: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          storageBucket?:
                            | {
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
                              }
                            | undefined;
                        };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
    opportunity?: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  posts?:
                    | Array<{
                        __typename?: 'Post';
                        id: string;
                        profile: {
                          __typename?: 'Profile';
                          id: string;
                          storageBucket?:
                            | {
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
                              }
                            | undefined;
                        };
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
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
      storageBucket?:
        | {
            __typename?: 'StorageBucket';
            id: string;
            allowedMimeTypes: Array<string>;
            maxFileSize: number;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
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
      storageBucket?:
        | {
            __typename?: 'StorageBucket';
            id: string;
            allowedMimeTypes: Array<string>;
            maxFileSize: number;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
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
              storageBucket?:
                | {
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
                  }
                | undefined;
            };
          }
        | undefined;
    };
  };
};

export type PlatformStorageConfigQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformStorageConfigQuery = {
  __typename?: 'Query';
  platform: {
    __typename?: 'Platform';
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

export type ProfileStorageConfigFragment = {
  __typename?: 'Profile';
  id: string;
  storageBucket?:
    | {
        __typename?: 'StorageBucket';
        id: string;
        allowedMimeTypes: Array<string>;
        maxFileSize: number;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type CalloutOnCollaborationWithStorageConfigFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          storageBucket?:
            | {
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
              }
            | undefined;
        };
      }>
    | undefined;
};

export type PostInCalloutOnCollaborationWithStorageConfigFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        posts?:
          | Array<{
              __typename?: 'Post';
              id: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                storageBucket?:
                  | {
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
                    }
                  | undefined;
              };
            }>
          | undefined;
      }>
    | undefined;
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

export type CreateRelationMutationVariables = Exact<{
  input: CreateRelationOnCollaborationInput;
}>;

export type CreateRelationMutation = {
  __typename?: 'Mutation';
  createRelationOnCollaboration: { __typename?: 'Relation'; id: string };
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

export type SpaceDashboardCalendarEventsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  limit?: InputMaybe<Scalars['Float']>;
}>;

export type SpaceDashboardCalendarEventsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    timeline?:
      | {
          __typename?: 'Timeline';
          id: string;
          calendar: {
            __typename?: 'Calendar';
            id: string;
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
        }
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

export type SpaceCalendarEventsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
}>;

export type SpaceCalendarEventsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    timeline?:
      | {
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
                        sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                      }>;
                      sender?:
                        | {
                            __typename?: 'User';
                            id: string;
                            nameID: string;
                            firstName: string;
                            lastName: string;
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
                              location?:
                                | { __typename?: 'Location'; id: string; city: string; country: string }
                                | undefined;
                            };
                          }
                        | undefined;
                    }>;
                  };
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
                }>
              | undefined;
          };
        }
      | undefined;
  };
};

export type CalendarEventDetailsQueryVariables = Exact<{
  spaceId: Scalars['UUID_NAMEID'];
  eventId: Scalars['UUID_NAMEID'];
}>;

export type CalendarEventDetailsQuery = {
  __typename?: 'Query';
  space: {
    __typename?: 'Space';
    id: string;
    timeline?:
      | {
          __typename?: 'Timeline';
          id: string;
          calendar: {
            __typename?: 'Calendar';
            id: string;
            event?:
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
                        sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
                      }>;
                      sender?:
                        | {
                            __typename?: 'User';
                            id: string;
                            nameID: string;
                            firstName: string;
                            lastName: string;
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
                              location?:
                                | { __typename?: 'Location'; id: string; city: string; country: string }
                                | undefined;
                            };
                          }
                        | undefined;
                    }>;
                  };
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
                }
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
        sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
      }>;
      sender?:
        | {
            __typename?: 'User';
            id: string;
            nameID: string;
            firstName: string;
            lastName: string;
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
              location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            };
          }
        | undefined;
    }>;
  };
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
  };
};

export type EventProfileFragment = {
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
          sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
        }>;
        sender?:
          | {
              __typename?: 'User';
              id: string;
              nameID: string;
              firstName: string;
              lastName: string;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            }
          | undefined;
      }>;
    };
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
          sender?: { __typename?: 'User'; id: string; firstName: string; lastName: string } | undefined;
        }>;
        sender?:
          | {
              __typename?: 'User';
              id: string;
              nameID: string;
              firstName: string;
              lastName: string;
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
                location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
              };
            }
          | undefined;
      }>;
    };
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
    };
  };
};

export type DeleteCalendarEventMutationVariables = Exact<{
  deleteData: DeleteCalendarEventInput;
}>;

export type DeleteCalendarEventMutation = {
  __typename?: 'Mutation';
  deleteCalendarEvent: { __typename?: 'CalendarEvent'; id: string; nameID: string };
};
