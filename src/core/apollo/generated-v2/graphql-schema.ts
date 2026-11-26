export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  JSON: { input: unknown; output: unknown };
  Long: { input: number; output: number };
  UUID: { input: string; output: string };
};

export type About = {
  __typename?: 'About';
  avatar?: Maybe<FileRef>;
  banner?: Maybe<FileRef>;
  card?: Maybe<FileRef>;
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  facets: Array<AboutFacet>;
  location?: Maybe<Scalars['JSON']['output']>;
  tagline?: Maybe<Scalars['String']['output']>;
};

export type AboutFacet = {
  __typename?: 'AboutFacet';
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  value?: Maybe<Scalars['JSON']['output']>;
};

export type AboutFacetInput = {
  name: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
};

export type AccessInspection = {
  __typename?: 'AccessInspection';
  actor: Scalars['UUID']['output'];
  privileges: Array<Scalars['String']['output']>;
  proofs: Array<AuthorizationProof>;
  target: Scalars['UUID']['output'];
};

export type AccountSummary = {
  __typename?: 'AccountSummary';
  canAcceptTransfer: Scalars['Boolean']['output'];
  canCreate: Array<CanCreate>;
  entitlements?: Maybe<Array<Entitlement>>;
  externalSubscriptionId?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Actor>;
  hosted: HostedResources;
  id: Scalars['UUID']['output'];
  planAssignments: Array<PlanAssignment>;
};

export type Activity = {
  __typename?: 'Activity';
  actor?: Maybe<Actor>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  payload: Scalars['JSON']['output'];
  space?: Maybe<Space>;
  subject?: Maybe<Node>;
  type: Scalars['String']['output'];
};

export type ActivityConnection = {
  __typename?: 'ActivityConnection';
  edges: Array<ActivityEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ActivityEdge = {
  __typename?: 'ActivityEdge';
  cursor: Scalars['String']['output'];
  node: Activity;
};

export type ActivityKindInfo = {
  __typename?: 'ActivityKindInfo';
  payloadSchema?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type Actor = {
  about?: Maybe<About>;
  account?: Maybe<AccountSummary>;
  actorType: Scalars['String']['output'];
  can: ActorCan;
  id: Scalars['UUID']['output'];
  notificationPrefs?: Maybe<Scalars['JSON']['output']>;
  settings?: Maybe<Scalars['JSON']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ActorCan = {
  __typename?: 'ActorCan';
  delete: Scalars['Boolean']['output'];
  invite: Scalars['Boolean']['output'];
  message: Scalars['Boolean']['output'];
  read: Scalars['Boolean']['output'];
  update: Scalars['Boolean']['output'];
};

export type ActorConnection = {
  __typename?: 'ActorConnection';
  edges: Array<ActorEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ActorEdge = {
  __typename?: 'ActorEdge';
  cursor: Scalars['String']['output'];
  node: Actor;
};

export type ActorFilter = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  terms?: InputMaybe<Scalars['String']['input']>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
  verification?: InputMaybe<VerificationState>;
};

export type Agent = Actor &
  Node & {
    __typename?: 'Agent';
    about: About;
    account?: Maybe<AccountSummary>;
    actorType: Scalars['String']['output'];
    can: ActorCan;
    engine?: Maybe<AiEngine>;
    entityType: Scalars['String']['output'];
    handle: Scalars['String']['output'];
    id: Scalars['UUID']['output'];
    keywords: Array<Scalars['String']['output']>;
    kind: AgentKind;
    knowledge?: Maybe<Space>;
    knowledgeDescription?: Maybe<Scalars['String']['output']>;
    knowledgeKind?: Maybe<Scalars['String']['output']>;
    links: Array<Link>;
    memberships: Array<SpaceMembership>;
    modelCard?: Maybe<AgentModelCard>;
    notificationPrefs?: Maybe<Scalars['JSON']['output']>;
    settings?: Maybe<Scalars['JSON']['output']>;
    url?: Maybe<Scalars['String']['output']>;
  };

export const AgentKind = {
  Assistant: 'ASSISTANT',
  Bot: 'BOT',
  Service: 'SERVICE',
  Vc: 'VC',
} as const;

export type AgentKind = (typeof AgentKind)[keyof typeof AgentKind];
export type AgentModelCard = {
  __typename?: 'AgentModelCard';
  aiEngine?: Maybe<AiEngine>;
  attestation?: Maybe<Attestation>;
  monitoring?: Maybe<AgentModelCardMonitoring>;
  spaceUsage?: Maybe<Array<AgentModelCardSpaceUsage>>;
};

export type AgentModelCardFlag = {
  __typename?: 'AgentModelCardFlag';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type AgentModelCardMonitoring = {
  __typename?: 'AgentModelCardMonitoring';
  isUsageMonitoredByAlkemio: Scalars['Boolean']['output'];
};

export type AgentModelCardSpaceUsage = {
  __typename?: 'AgentModelCardSpaceUsage';
  flags: Array<AgentModelCardFlag>;
  modelCardEntry: Scalars['String']['output'];
};

export type AiEngine = {
  __typename?: 'AiEngine';
  additionalTechnicalDetails?: Maybe<Scalars['String']['output']>;
  areAnswersRestrictedToBodyOfKnowledge?: Maybe<Scalars['String']['output']>;
  canAccessWebWhenAnswering?: Maybe<Scalars['Boolean']['output']>;
  capabilities: Scalars['JSON']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  hostingLocation?: Maybe<Scalars['String']['output']>;
  isExternal?: Maybe<Scalars['Boolean']['output']>;
  isInteractionDataUsedForTraining?: Maybe<Scalars['Boolean']['output']>;
  isUsingOpenWeightsModel?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
};

export type ApmConfig = {
  __typename?: 'ApmConfig';
  endpoint?: Maybe<Scalars['String']['output']>;
  rumEnabled: Scalars['Boolean']['output'];
};

export type Attestation = {
  __typename?: 'Attestation';
  claims: Scalars['JSON']['output'];
  format: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  kind: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export const Audience = {
  Public: 'PUBLIC',
  Registered: 'REGISTERED',
  Restricted: 'RESTRICTED',
} as const;

export type Audience = (typeof Audience)[keyof typeof Audience];
export type AuthorizationProof = {
  __typename?: 'AuthorizationProof';
  basePrivilege: Scalars['String']['output'];
  criterion: Scalars['Long']['output'];
  grantId: Scalars['Long']['output'];
  implicationId?: Maybe<Scalars['Long']['output']>;
  origin: Scalars['UUID']['output'];
  path: Array<Scalars['UUID']['output']>;
  privilege: Scalars['String']['output'];
};

export type BlueprintOmission = {
  __typename?: 'BlueprintOmission';
  code: BlueprintOmissionCode;
  path: Scalars['String']['output'];
};

export const BlueprintOmissionCode = {
  DepthExceeded: 'DEPTH_EXCEEDED',
  ReferenceUnavailable: 'REFERENCE_UNAVAILABLE',
} as const;

export type BlueprintOmissionCode = (typeof BlueprintOmissionCode)[keyof typeof BlueprintOmissionCode];
export type BlueprintResult = {
  __typename?: 'BlueprintResult';
  node: Node;
  omissions: Array<BlueprintOmission>;
};

export type CalendarLink = {
  __typename?: 'CalendarLink';
  provider: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CanCreate = {
  __typename?: 'CanCreate';
  allowed: Scalars['Boolean']['output'];
  byEntitlement: Array<EntitlementAvailability>;
  kind: Scalars['String']['output'];
  reason?: Maybe<CanCreateReason>;
};

export const CanCreateReason = {
  Entitlement: 'ENTITLEMENT',
  Privilege: 'PRIVILEGE',
} as const;

export type CanCreateReason = (typeof CanCreateReason)[keyof typeof CanCreateReason];
export const CandidateEntry = {
  Direct: 'DIRECT',
  Invite: 'INVITE',
} as const;

export type CandidateEntry = (typeof CandidateEntry)[keyof typeof CandidateEntry];
export type Capability = {
  __typename?: 'Capability';
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  kind: CapabilityKind;
  name: Scalars['String']['output'];
};

export const CapabilityKind = {
  Read: 'READ',
  WriteAdditive: 'WRITE_ADDITIVE',
  WriteDestructive: 'WRITE_DESTRUCTIVE',
} as const;

export type CapabilityKind = (typeof CapabilityKind)[keyof typeof CapabilityKind];
export type Choice = {
  __typename?: 'Choice';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  settings?: Maybe<Scalars['JSON']['output']>;
  sortOrder: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type ChoiceSetRef = {
  __typename?: 'ChoiceSetRef';
  id: Scalars['UUID']['output'];
  mode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  values?: Maybe<Array<Choice>>;
};

export type Classification = {
  __typename?: 'Classification';
  id: Scalars['UUID']['output'];
  label: Scalars['String']['output'];
  selected: Array<Choice>;
  settings?: Maybe<Scalars['JSON']['output']>;
  values: Array<Choice>;
};

export type Config = {
  __typename?: 'Config';
  activityKinds: Array<ActivityKindInfo>;
  aiEngines: Array<AiEngine>;
  assistantCapabilities: Array<Capability>;
  authProviders: Array<Scalars['String']['output']>;
  authentication: ConfigAuthentication;
  choiceSets: Array<ChoiceSetRef>;
  defaultLanguage: Scalars['String']['output'];
  entitlementCatalog: Array<EntitlementInfo>;
  features: Scalars['JSON']['output'];
  geo?: Maybe<ConfigGeo>;
  iframeAllowlist: Array<Scalars['String']['output']>;
  languages: Array<Scalars['String']['output']>;
  links: Array<ConfigLink>;
  matrix: ConfigMatrix;
  notificationKinds: Array<NotificationKindInfo>;
  platformId: Scalars['UUID']['output'];
  pointers: ConfigPointers;
  postKinds: Array<PostKindInfo>;
  storage: StorageLimits;
  telemetry?: Maybe<ConfigTelemetry>;
  vapidPublicKey?: Maybe<Scalars['String']['output']>;
  versions?: Maybe<ConfigVersions>;
  visualConstraints: Array<VisualConstraint>;
};

export type ConfigAuthentication = {
  __typename?: 'ConfigAuthentication';
  kratosPublicUrl: Scalars['String']['output'];
};

export type ConfigGeo = {
  __typename?: 'ConfigGeo';
  enabled: Scalars['Boolean']['output'];
  endpoint?: Maybe<Scalars['String']['output']>;
};

export type ConfigLink = {
  __typename?: 'ConfigLink';
  key: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ConfigMatrix = {
  __typename?: 'ConfigMatrix';
  homeserverUrl: Scalars['String']['output'];
  serverName: Scalars['String']['output'];
  sessionBaseUrl: Scalars['String']['output'];
};

export type ConfigPointers = {
  __typename?: 'ConfigPointers';
  forumSpace?: Maybe<Scalars['UUID']['output']>;
  guidanceVirtualContributor?: Maybe<Scalars['UUID']['output']>;
  releasesCategory?: Maybe<Scalars['UUID']['output']>;
};

export type ConfigTelemetry = {
  __typename?: 'ConfigTelemetry';
  apm?: Maybe<ApmConfig>;
  environment?: Maybe<Scalars['String']['output']>;
  sentry?: Maybe<SentryConfig>;
};

export type ConfigVersions = {
  __typename?: 'ConfigVersions';
  server?: Maybe<Scalars['String']['output']>;
};

export type ContributorsContent = {
  __typename?: 'ContributorsContent';
  contributors?: Maybe<Array<Actor>>;
  counts?: Maybe<Array<TypeCount>>;
  settings?: Maybe<Scalars['JSON']['output']>;
};

export type CreateDocumentInput = {
  blueprint?: InputMaybe<Scalars['JSON']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  docType: DocType;
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  file?: InputMaybe<Scalars['UUID']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  parent: Scalars['UUID']['input'];
  role?: InputMaybe<DocRole>;
  sourceDocument?: InputMaybe<Scalars['UUID']['input']>;
};

export type CreateSpaceInput = {
  account?: InputMaybe<Scalars['UUID']['input']>;
  blueprint: Scalars['JSON']['input'];
  handle?: InputMaybe<Scalars['String']['input']>;
  parent?: InputMaybe<Scalars['UUID']['input']>;
  plan?: InputMaybe<Scalars['UUID']['input']>;
  template?: InputMaybe<Scalars['UUID']['input']>;
  tutorials?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CuratedItem = {
  __typename?: 'CuratedItem';
  node: Node;
  role: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type DeleteResult = {
  __typename?: 'DeleteResult';
  deletedId: Scalars['UUID']['output'];
  parent?: Maybe<Node>;
};

export const DocRole = {
  Content: 'CONTENT',
  ResponseDefault: 'RESPONSE_DEFAULT',
  Standalone: 'STANDALONE',
} as const;

export type DocRole = (typeof DocRole)[keyof typeof DocRole];
export const DocType = {
  Excalidraw: 'EXCALIDRAW',
  OfficeDrawing: 'OFFICE_DRAWING',
  OfficeSheet: 'OFFICE_SHEET',
  OfficeSlides: 'OFFICE_SLIDES',
  OfficeText: 'OFFICE_TEXT',
  Pdf: 'PDF',
  Richtext: 'RICHTEXT',
} as const;

export type DocType = (typeof DocType)[keyof typeof DocType];
export type Document = Node & {
  __typename?: 'Document';
  about?: Maybe<About>;
  can: DocumentCan;
  contentFile?: Maybe<File>;
  contentVersion: Scalars['Int']['output'];
  docType: DocType;
  draftExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  engine: Scalars['String']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  preview?: Maybe<File>;
  role: DocRole;
  saveServiceAvailable?: Maybe<Scalars['Boolean']['output']>;
  textSnapshot?: Maybe<Scalars['String']['output']>;
  updatePolicy: UpdatePolicy;
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  versions: Array<FileRef>;
};

export type DocumentVersionsArgs = {
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type DocumentCan = {
  __typename?: 'DocumentCan';
  delete: Scalars['Boolean']['output'];
  edit: Scalars['Boolean']['output'];
  privileges: Array<Scalars['String']['output']>;
  read: Scalars['Boolean']['output'];
  rename: Scalars['Boolean']['output'];
  share: Scalars['Boolean']['output'];
  sign: Scalars['Boolean']['output'];
};

export type DocumentContent = {
  __typename?: 'DocumentContent';
  document: Document;
};

export type DocumentSession = {
  __typename?: 'DocumentSession';
  editDeniedReason?: Maybe<EditDeniedReason>;
  editorUrl: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  kind: DocumentSessionKind;
  token: Scalars['String']['output'];
};

export const DocumentSessionKind = {
  Collab: 'COLLAB',
  Wopi: 'WOPI',
} as const;

export type DocumentSessionKind = (typeof DocumentSessionKind)[keyof typeof DocumentSessionKind];
export const EditDeniedReason = {
  Archived: 'ARCHIVED',
  DraftExpired: 'DRAFT_EXPIRED',
  Inactivity: 'INACTIVITY',
  MultiUserNotEntitled: 'MULTI_USER_NOT_ENTITLED',
  NoMembership: 'NO_MEMBERSHIP',
  NoOwner: 'NO_OWNER',
  Policy: 'POLICY',
  RoomCapacity: 'ROOM_CAPACITY',
  Unauthenticated: 'UNAUTHENTICATED',
} as const;

export type EditDeniedReason = (typeof EditDeniedReason)[keyof typeof EditDeniedReason];
export type Entitlement = {
  __typename?: 'Entitlement';
  limit?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  usage?: Maybe<Scalars['Int']['output']>;
};

export type EntitlementAvailability = {
  __typename?: 'EntitlementAvailability';
  allowed: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  reason?: Maybe<CanCreateReason>;
  remaining?: Maybe<Scalars['Int']['output']>;
};

export type EntitlementCreationKind = {
  __typename?: 'EntitlementCreationKind';
  entityType: Scalars['String']['output'];
  kind: Scalars['String']['output'];
};

export type EntitlementInfo = {
  __typename?: 'EntitlementInfo';
  creationKinds: Array<EntitlementCreationKind>;
  effectiveEntitlement?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  usagePriority?: Maybe<Scalars['Int']['output']>;
};

export type EventContent = {
  __typename?: 'EventContent';
  allDay: Scalars['Boolean']['output'];
  calendarLinks: Array<CalendarLink>;
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  endsOn?: Maybe<Scalars['Date']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  rollUp: Scalars['Boolean']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  startsOn?: Maybe<Scalars['Date']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type File = {
  __typename?: 'File';
  can: FileCan;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  folder?: Maybe<Node>;
  id: Scalars['UUID']['output'];
  mime: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  size: Scalars['Long']['output'];
  uploadedBy?: Maybe<Actor>;
  url: Scalars['String']['output'];
};

export type FileCan = {
  __typename?: 'FileCan';
  delete: Scalars['Boolean']['output'];
};

export type FileConnection = {
  __typename?: 'FileConnection';
  edges: Array<FileEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type FileEdge = {
  __typename?: 'FileEdge';
  cursor: Scalars['String']['output'];
  node: File;
};

export type FileRef = {
  __typename?: 'FileRef';
  alt?: Maybe<Scalars['String']['output']>;
  aspectRatio?: Maybe<Scalars['Float']['output']>;
  file: File;
};

export type FormContent = {
  __typename?: 'FormContent';
  myResponseCount: Scalars['Int']['output'];
  questions: Scalars['JSON']['output'];
  responseCount: Scalars['Int']['output'];
};

export type FormResponseContent = {
  __typename?: 'FormResponseContent';
  answers: Scalars['JSON']['output'];
};

export type GalleryContent = {
  __typename?: 'GalleryContent';
  images: Array<FileRef>;
};

export type GenericActor = Actor &
  Node & {
    __typename?: 'GenericActor';
    about?: Maybe<About>;
    account?: Maybe<AccountSummary>;
    actorType: Scalars['String']['output'];
    can: ActorCan;
    entityType: Scalars['String']['output'];
    id: Scalars['UUID']['output'];
    notificationPrefs?: Maybe<Scalars['JSON']['output']>;
    settings?: Maybe<Scalars['JSON']['output']>;
    url?: Maybe<Scalars['String']['output']>;
  };

export type HostedResources = {
  __typename?: 'HostedResources';
  agents: Array<Agent>;
  homepages: Array<Space>;
  packs: Array<Space>;
  spaces: Array<Space>;
};

export type InnovationPack = Node & {
  __typename?: 'InnovationPack';
  about: About;
  entityType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
};

export type InviteInput = {
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  language?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type InviteOutcome = {
  __typename?: 'InviteOutcome';
  actor?: Maybe<Scalars['UUID']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  noOrganizationAdmin: Scalars['Boolean']['output'];
  outcome: InviteOutcomeKind;
  request?: Maybe<MembershipRequest>;
};

export const InviteOutcomeKind = {
  AlreadyInvited: 'ALREADY_INVITED',
  AlreadyMember: 'ALREADY_MEMBER',
  ExtraRoleLimitReached: 'EXTRA_ROLE_LIMIT_REACHED',
  NotAllowed: 'NOT_ALLOWED',
  OpenApplication: 'OPEN_APPLICATION',
  OrganizationLeadRoleLimitReached: 'ORGANIZATION_LEAD_ROLE_LIMIT_REACHED',
  OrganizationNotAcceptingInvitations: 'ORGANIZATION_NOT_ACCEPTING_INVITATIONS',
  ParentNotAuthorized: 'PARENT_NOT_AUTHORIZED',
  RoleLimitReached: 'ROLE_LIMIT_REACHED',
  Sent: 'SENT',
} as const;

export type InviteOutcomeKind = (typeof InviteOutcomeKind)[keyof typeof InviteOutcomeKind];
export type JoiningSpace = {
  __typename?: 'JoiningSpace';
  displayName: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type LibraryFilter = {
  itemType: LibraryItemType;
  kinds?: InputMaybe<Array<TemplateKind>>;
  scope?: InputMaybe<Scalars['UUID']['input']>;
  terms?: InputMaybe<Array<Scalars['String']['input']>>;
};

export const LibraryItemType = {
  InnovationHub: 'INNOVATION_HUB',
  InnovationPack: 'INNOVATION_PACK',
  Template: 'TEMPLATE',
} as const;

export type LibraryItemType = (typeof LibraryItemType)[keyof typeof LibraryItemType];
export type Link = {
  __typename?: 'Link';
  description?: Maybe<Scalars['String']['output']>;
  file?: Maybe<File>;
  id: Scalars['UUID']['output'];
  role: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  uri: Scalars['String']['output'];
};

export type LinkContent = {
  __typename?: 'LinkContent';
  link: Link;
};

export type MatrixAccess = {
  __typename?: 'MatrixAccess';
  expiresAt: Scalars['DateTime']['output'];
  sessionBaseUrl: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type Member = Node & {
  __typename?: 'Member';
  actor: Actor;
  entityType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
  roles: Array<Scalars['String']['output']>;
};

export type MemberConnection = {
  __typename?: 'MemberConnection';
  edges: Array<MemberEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MemberEdge = {
  __typename?: 'MemberEdge';
  cursor: Scalars['String']['output'];
  node: Member;
};

export type Membership = {
  __typename?: 'Membership';
  request?: Maybe<MembershipRequest>;
  roles: Array<Scalars['String']['output']>;
  status: MembershipStatus;
  wouldJoin: Array<JoiningSpace>;
};

export type MembershipRequest = {
  __typename?: 'MembershipRequest';
  actor?: Maybe<Actor>;
  answers?: Maybe<Scalars['JSON']['output']>;
  availableEvents: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Actor>;
  decidedAt?: Maybe<Scalars['DateTime']['output']>;
  decidedBy?: Maybe<Actor>;
  direction: RequestDirection;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  profileCreated?: Maybe<Scalars['Boolean']['output']>;
  resource: Node;
  roles: Array<Scalars['String']['output']>;
  space?: Maybe<Space>;
  state?: Maybe<RequestState>;
  updatedAt: Scalars['DateTime']['output'];
  withheldRoles: Array<WithheldRole>;
  wouldJoin?: Maybe<Array<JoiningSpace>>;
};

export type MembershipRequestConnection = {
  __typename?: 'MembershipRequestConnection';
  edges: Array<MembershipRequestEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MembershipRequestEdge = {
  __typename?: 'MembershipRequestEdge';
  cursor: Scalars['String']['output'];
  node: MembershipRequest;
};

export type MembershipResult = {
  __typename?: 'MembershipResult';
  node?: Maybe<Node>;
  request?: Maybe<MembershipRequest>;
  viewer: Viewer;
};

export const MembershipStatus = {
  Applied: 'APPLIED',
  Invited: 'INVITED',
  Member: 'MEMBER',
  None: 'NONE',
} as const;

export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];
export type Mutation = {
  __typename?: 'Mutation';
  addClassification: BlueprintResult;
  assignPlan: PlanAssignment;
  attachFile: Node;
  createDocument: BlueprintResult;
  createSpace: BlueprintResult;
  createTemplate: BlueprintResult;
  deleteDocument: DeleteResult;
  deleteFile: DeleteResult;
  deleteLink: Node;
  deletePlan: Scalars['Boolean']['output'];
  deleteSpace: DeleteResult;
  detachFile: Node;
  inspectAccess: AccessInspection;
  invite: Array<InviteOutcome>;
  leave: MembershipResult;
  openDocument: DocumentSession;
  pinSubspace: Space;
  removeClassification: Space;
  reorderSubspaces: Space;
  replaceDocument: Document;
  requestUpload: UploadToken;
  resendInvitation: MembershipRequest;
  respondToRequest: MembershipResult;
  revokePlan: Scalars['Boolean']['output'];
  setLabels: Node;
  setPostStatus: Post;
  setReferences: Node;
  setRoles: MembershipResult;
  setSettings: Actor;
  setSpaceAudience: Space;
  setTemplateDefault: Array<TemplateDefault>;
  subscribePush: PushSubscription;
  unsubscribePush: Scalars['Boolean']['output'];
  updateActor: Actor;
  updateClassification: Space;
  updateDocument: Document;
  updatePost: BlueprintResult;
  updateSpace: Space;
  updateTemplate: BlueprintResult;
  upsertLink: Node;
  upsertPlan: Plan;
};

export type MutationAddClassificationArgs = {
  label?: InputMaybe<Scalars['String']['input']>;
  space: Scalars['UUID']['input'];
  template: Scalars['UUID']['input'];
};

export type MutationAssignPlanArgs = {
  input: PlanAssignInput;
};

export type MutationAttachFileArgs = {
  alt?: InputMaybe<Scalars['String']['input']>;
  aspectRatio?: InputMaybe<Scalars['Float']['input']>;
  displayName: Scalars['String']['input'];
  file: Scalars['UUID']['input'];
  owner: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
};

export type MutationCreateSpaceArgs = {
  input: CreateSpaceInput;
};

export type MutationCreateTemplateArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  blueprint?: InputMaybe<Scalars['JSON']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  init?: InputMaybe<TemplateInitInput>;
  kind: TemplateKind;
  recursive?: InputMaybe<Scalars['Boolean']['input']>;
  scope: Scalars['UUID']['input'];
  source?: InputMaybe<Scalars['UUID']['input']>;
};

export type MutationDeleteDocumentArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationDeleteFileArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationDeleteLinkArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationDeletePlanArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationDeleteSpaceArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationDetachFileArgs = {
  file: Scalars['UUID']['input'];
  owner: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
};

export type MutationInspectAccessArgs = {
  actor: Scalars['UUID']['input'];
  target: Scalars['UUID']['input'];
};

export type MutationInviteArgs = {
  input: InviteInput;
  resource: Scalars['UUID']['input'];
};

export type MutationLeaveArgs = {
  resource: Scalars['UUID']['input'];
};

export type MutationOpenDocumentArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationPinSubspaceArgs = {
  id: Scalars['UUID']['input'];
  pinned: Scalars['Boolean']['input'];
};

export type MutationRemoveClassificationArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationReorderSubspacesArgs = {
  input: ReorderInput;
};

export type MutationReplaceDocumentArgs = {
  file?: InputMaybe<Scalars['UUID']['input']>;
  id: Scalars['UUID']['input'];
  sourceDocument?: InputMaybe<Scalars['UUID']['input']>;
};

export type MutationRequestUploadArgs = {
  mime: Scalars['String']['input'];
  owner: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  size: Scalars['Long']['input'];
};

export type MutationResendInvitationArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationRespondToRequestArgs = {
  event: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
};

export type MutationRevokePlanArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationSetLabelsArgs = {
  input: SetLabelsInput;
};

export type MutationSetPostStatusArgs = {
  event: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
  notify?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationSetReferencesArgs = {
  owner: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  targets: Array<Scalars['UUID']['input']>;
};

export type MutationSetRolesArgs = {
  actor: Scalars['UUID']['input'];
  resource: Scalars['UUID']['input'];
  roles: Array<Scalars['String']['input']>;
};

export type MutationSetSettingsArgs = {
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type MutationSetSpaceAudienceArgs = {
  audience: Audience;
  id: Scalars['UUID']['input'];
};

export type MutationSetTemplateDefaultArgs = {
  scope: Scalars['UUID']['input'];
  slot: Scalars['String']['input'];
  stage?: InputMaybe<Scalars['UUID']['input']>;
  template?: InputMaybe<Scalars['UUID']['input']>;
};

export type MutationSubscribePushArgs = {
  endpoint: Scalars['String']['input'];
  keys: Scalars['JSON']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUnsubscribePushArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationUpdateActorArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  fields?: InputMaybe<Scalars['JSON']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUpdateClassificationArgs = {
  id: Scalars['UUID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  selected?: InputMaybe<Array<Scalars['UUID']['input']>>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
};

export type MutationUpdateDocumentArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  id: Scalars['UUID']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  updatePolicy?: InputMaybe<UpdatePolicy>;
};

export type MutationUpdatePostArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  commentsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['UUID']['input'];
  responseDefaults?: InputMaybe<Scalars['JSON']['input']>;
  responsePolicy?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUpdateSpaceArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  applicationForm?: InputMaybe<Scalars['JSON']['input']>;
  guidelines?: InputMaybe<Scalars['JSON']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  listed?: InputMaybe<Scalars['Boolean']['input']>;
  searchVisibility?: InputMaybe<SearchVisibility>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUpdateTemplateArgs = {
  about?: InputMaybe<UpdateAboutInput>;
  blueprint?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['UUID']['input'];
  recursive?: InputMaybe<Scalars['Boolean']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['UUID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUpsertLinkArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  owner: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  uri: Scalars['String']['input'];
};

export type MutationUpsertPlanArgs = {
  input: PlanInput;
};

export type Node = {
  entityType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
};

export type NodeConnection = {
  __typename?: 'NodeConnection';
  edges: Array<NodeEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type NodeEdge = {
  __typename?: 'NodeEdge';
  cursor: Scalars['String']['output'];
  node: Node;
};

export type Notification = {
  __typename?: 'Notification';
  category: NotificationCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  payload: Scalars['JSON']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  state: NotificationState;
  type: Scalars['String']['output'];
};

export const NotificationCategory = {
  Messages: 'MESSAGES',
  Organization: 'ORGANIZATION',
  Platform: 'PLATFORM',
  SpaceAdmin: 'SPACE_ADMIN',
  SpaceMember: 'SPACE_MEMBER',
  VirtualContributor: 'VIRTUAL_CONTRIBUTOR',
} as const;

export type NotificationCategory = (typeof NotificationCategory)[keyof typeof NotificationCategory];
export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  edges: Array<NotificationEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type NotificationDebounce = {
  __typename?: 'NotificationDebounce';
  max: Scalars['Int']['output'];
  quiet: Scalars['Int']['output'];
};

export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  cursor: Scalars['String']['output'];
  node: Notification;
};

export type NotificationKindInfo = {
  __typename?: 'NotificationKindInfo';
  category: NotificationCategory;
  channels: Array<Scalars['String']['output']>;
  debounce: NotificationDebounce;
  defaults: Scalars['JSON']['output'];
  locked: Array<Scalars['String']['output']>;
  payloadSchema?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export const NotificationState = {
  Archived: 'ARCHIVED',
  Read: 'READ',
  Unread: 'UNREAD',
} as const;

export type NotificationState = (typeof NotificationState)[keyof typeof NotificationState];
export type Organization = Actor &
  Node & {
    __typename?: 'Organization';
    about: About;
    account?: Maybe<AccountSummary>;
    actorType: Scalars['String']['output'];
    associateCount?: Maybe<Scalars['Int']['output']>;
    associates?: Maybe<Array<User>>;
    can: ActorCan;
    capabilities: Array<Scalars['String']['output']>;
    domain?: Maybe<Scalars['String']['output']>;
    entityType: Scalars['String']['output'];
    handle: Scalars['String']['output'];
    hosted?: Maybe<HostedResources>;
    id: Scalars['UUID']['output'];
    legalName?: Maybe<Scalars['String']['output']>;
    links: Array<Link>;
    notificationPrefs?: Maybe<Scalars['JSON']['output']>;
    settings?: Maybe<Scalars['JSON']['output']>;
    spacesLed: Array<Space>;
    spacesMemberOf: Array<Space>;
    tags: Array<Scalars['String']['output']>;
    url?: Maybe<Scalars['String']['output']>;
    verification?: Maybe<VerificationState>;
    website?: Maybe<Scalars['String']['output']>;
  };

export type OrganizationMembership = {
  __typename?: 'OrganizationMembership';
  organization: Organization;
  roles: Array<Scalars['String']['output']>;
};

/** Relay cursor-pagination page metadata (shared by every connection). */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Plan = {
  __typename?: 'Plan';
  autoAssignTo: Array<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  entitlements: Array<Entitlement>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  pricing?: Maybe<Scalars['JSON']['output']>;
  requiresContact: Scalars['Boolean']['output'];
  scope: PlanScope;
  sortOrder: Scalars['Int']['output'];
  tier?: Maybe<Scalars['String']['output']>;
};

export type PlanAssignInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  externalRef?: InputMaybe<Scalars['String']['input']>;
  plan: Scalars['UUID']['input'];
  target: Scalars['UUID']['input'];
};

export type PlanAssignment = {
  __typename?: 'PlanAssignment';
  assignedAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  externalRef?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  plan: Plan;
};

export type PlanInput = {
  autoAssignTo?: InputMaybe<Array<Scalars['String']['input']>>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  entitlements?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  pricing?: InputMaybe<Scalars['JSON']['input']>;
  requiresContact?: InputMaybe<Scalars['Boolean']['input']>;
  scope: PlanScope;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
};

export const PlanScope = {
  Account: 'ACCOUNT',
  Space: 'SPACE',
} as const;

export type PlanScope = (typeof PlanScope)[keyof typeof PlanScope];
export type PollContent = {
  __typename?: 'PollContent';
  deadline?: Maybe<Scalars['DateTime']['output']>;
  myVotes: Array<Scalars['UUID']['output']>;
  options: Array<PollOption>;
  question: Scalars['String']['output'];
  settings?: Maybe<Scalars['JSON']['output']>;
  status: PollStatus;
  totalVotes?: Maybe<Scalars['Int']['output']>;
};

export type PollOption = {
  __typename?: 'PollOption';
  id: Scalars['UUID']['output'];
  mine: Scalars['Boolean']['output'];
  percentage?: Maybe<Scalars['Int']['output']>;
  sortOrder: Scalars['Int']['output'];
  value: Scalars['String']['output'];
  voters?: Maybe<Array<Actor>>;
  votes?: Maybe<Scalars['Int']['output']>;
};

export const PollStatus = {
  Closed: 'CLOSED',
  Open: 'OPEN',
} as const;

export type PollStatus = (typeof PollStatus)[keyof typeof PollStatus];
export type Post = Node & {
  __typename?: 'Post';
  about: About;
  author?: Maybe<Actor>;
  availableEvents: Array<Scalars['String']['output']>;
  can: PostCan;
  commentsEnabled: Scalars['Boolean']['output'];
  content?: Maybe<PostContent>;
  contentKind: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  entityType: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  links: Array<Link>;
  parentPost?: Maybe<Post>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  publishedBy?: Maybe<Actor>;
  responseCount: Scalars['Int']['output'];
  responseDefaults?: Maybe<Scalars['JSON']['output']>;
  responseKind?: Maybe<Scalars['String']['output']>;
  responsePolicy?: Maybe<Scalars['JSON']['output']>;
  responses: PostConnection;
  room?: Maybe<Room>;
  sortOrder: Scalars['Int']['output'];
  space: Space;
  stage?: Maybe<Stage>;
  status: PostStatus;
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type PostResponsesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  lane?: InputMaybe<Scalars['UUID']['input']>;
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<PostOrder>;
  stage?: InputMaybe<Scalars['UUID']['input']>;
};

export type PostCan = {
  __typename?: 'PostCan';
  comment: Scalars['Boolean']['output'];
  delete: Scalars['Boolean']['output'];
  manageColumns: Scalars['Boolean']['output'];
  move: Scalars['Boolean']['output'];
  moveTask: Scalars['Boolean']['output'];
  privileges: Array<Scalars['String']['output']>;
  publish: Scalars['Boolean']['output'];
  react: Scalars['Boolean']['output'];
  read: Scalars['Boolean']['output'];
  respond: Scalars['Boolean']['output'];
  share: Scalars['Boolean']['output'];
  update: Scalars['Boolean']['output'];
  vote: Scalars['Boolean']['output'];
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges: Array<PostEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PostContent =
  | ContributorsContent
  | DocumentContent
  | EventContent
  | FormContent
  | FormResponseContent
  | GalleryContent
  | LinkContent
  | PollContent
  | SpacesContent
  | TaskBoardContent;

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node: Post;
};

export type PostKindInfo = {
  __typename?: 'PostKindInfo';
  blueprintSchema?: Maybe<Scalars['JSON']['output']>;
  computed: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  role: Scalars['String']['output'];
  settingsSchema?: Maybe<Scalars['JSON']['output']>;
  templatable: Scalars['Boolean']['output'];
};

export const PostOrder = {
  Manual: 'MANUAL',
  MostActive: 'MOST_ACTIVE',
  Newest: 'NEWEST',
  Oldest: 'OLDEST',
} as const;

export type PostOrder = (typeof PostOrder)[keyof typeof PostOrder];
export const PostStatus = {
  Archived: 'ARCHIVED',
  Draft: 'DRAFT',
  Published: 'PUBLISHED',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export type PushSubscription = {
  __typename?: 'PushSubscription';
  endpoint: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  status: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activity: ActivityConnection;
  actors: ActorConnection;
  candidates: ActorConnection;
  config: Config;
  files: FileConnection;
  library: NodeConnection;
  members: MemberConnection;
  node?: Maybe<Node>;
  notifications: NotificationConnection;
  plans: Array<Plan>;
  post?: Maybe<Post>;
  requests: MembershipRequestConnection;
  resolve: ResolveResult;
  rolePolicies: Array<RolePolicy>;
  spaceActivity: ActivityConnection;
  spacePosts: PostConnection;
  spaces: SpaceConnection;
  subtree?: Maybe<NodeConnection>;
  templateDefaults: Array<TemplateDefault>;
  templates: Array<Template>;
  viewer: Viewer;
};

export type QueryActivityArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  excludeTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
  space?: InputMaybe<Scalars['UUID']['input']>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryActorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ActorFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCandidatesArgs = {
  actorType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  entry: CandidateEntry;
  first?: InputMaybe<Scalars['Int']['input']>;
  resource: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  terms?: InputMaybe<Scalars['String']['input']>;
};

export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeSubspaces?: InputMaybe<Scalars['Boolean']['input']>;
  resource: Scalars['UUID']['input'];
};

export type QueryLibraryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter: LibraryFilter;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMembersArgs = {
  actorType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  resource: Scalars['UUID']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  terms?: InputMaybe<Scalars['String']['input']>;
};

export type QueryNodeArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<NotificationCategory>>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPlansArgs = {
  scope?: InputMaybe<PlanScope>;
};

export type QueryPostArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryRequestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  resource: Scalars['UUID']['input'];
  state?: InputMaybe<RequestState>;
};

export type QueryResolveArgs = {
  url: Scalars['String']['input'];
};

export type QueryRolePoliciesArgs = {
  resource: Scalars['UUID']['input'];
};

export type QuerySpaceActivityArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  space: Scalars['UUID']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QuerySpacePostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  kinds?: InputMaybe<Array<Scalars['String']['input']>>;
  labels?: InputMaybe<Array<Scalars['UUID']['input']>>;
  order?: InputMaybe<PostOrder>;
  responseKinds?: InputMaybe<Array<Scalars['String']['input']>>;
  space: Scalars['UUID']['input'];
  stage?: InputMaybe<Scalars['UUID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QuerySpacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SpaceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QuerySubtreeArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeRoot?: InputMaybe<Scalars['Boolean']['input']>;
  kinds?: InputMaybe<Array<Scalars['String']['input']>>;
  maxDepth: Scalars['Int']['input'];
  root: Scalars['UUID']['input'];
  stopAt?: InputMaybe<Array<Scalars['String']['input']>>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type QueryTemplateDefaultsArgs = {
  scope: Scalars['UUID']['input'];
};

export type QueryTemplatesArgs = {
  kind?: InputMaybe<TemplateKind>;
  scope: Scalars['UUID']['input'];
};

export type RecentSpace = {
  __typename?: 'RecentSpace';
  lastParticipatedAt: Scalars['DateTime']['output'];
  space: Space;
};

export type ReorderInput = {
  ids: Array<Scalars['UUID']['input']>;
  parent: Scalars['UUID']['input'];
};

export const RequestDirection = {
  Inbound: 'INBOUND',
  Outbound: 'OUTBOUND',
} as const;

export type RequestDirection = (typeof RequestDirection)[keyof typeof RequestDirection];
export const RequestState = {
  Accepted: 'ACCEPTED',
  Accepting: 'ACCEPTING',
  Approved: 'APPROVED',
  Approving: 'APPROVING',
  Archived: 'ARCHIVED',
  Cancelled: 'CANCELLED',
  Invited: 'INVITED',
  New: 'NEW',
  Rejected: 'REJECTED',
} as const;

export type RequestState = (typeof RequestState)[keyof typeof RequestState];
export type ResolveResult = {
  __typename?: 'ResolveResult';
  ancestors: Array<Node>;
  closestReadable?: Maybe<Node>;
  homepage?: Maybe<Space>;
  matchedPrefix?: Maybe<Scalars['String']['output']>;
  node?: Maybe<Node>;
  remainder: Array<Scalars['String']['output']>;
  space?: Maybe<Space>;
  state: ResolveState;
};

export const ResolveState = {
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Ok: 'OK',
} as const;

export type ResolveState = (typeof ResolveState)[keyof typeof ResolveState];
export type RolePolicy = {
  __typename?: 'RolePolicy';
  actorType: Scalars['String']['output'];
  entryModes: Array<Scalars['String']['output']>;
  holders: Scalars['Int']['output'];
  maxHolders?: Maybe<Scalars['Int']['output']>;
  minHolders?: Maybe<Scalars['Int']['output']>;
  role: Scalars['String']['output'];
};

export type Room = Node & {
  __typename?: 'Room';
  can: RoomCan;
  entityType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  kind: RoomKind;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  messageCount: Scalars['Int']['output'];
};

export type RoomCan = {
  __typename?: 'RoomCan';
  createMessage: Scalars['Boolean']['output'];
  deleteAny: Scalars['Boolean']['output'];
  react: Scalars['Boolean']['output'];
};

export const RoomKind = {
  Comments: 'COMMENTS',
  Direct: 'DIRECT',
  Discussion: 'DISCUSSION',
  Group: 'GROUP',
  Updates: 'UPDATES',
} as const;

export type RoomKind = (typeof RoomKind)[keyof typeof RoomKind];
export const SearchVisibility = {
  Account: 'ACCOUNT',
  Hidden: 'HIDDEN',
  Public: 'PUBLIC',
} as const;

export type SearchVisibility = (typeof SearchVisibility)[keyof typeof SearchVisibility];
export type SentryConfig = {
  __typename?: 'SentryConfig';
  enabled: Scalars['Boolean']['output'];
  endpoint?: Maybe<Scalars['String']['output']>;
  environment?: Maybe<Scalars['String']['output']>;
  submitPII: Scalars['Boolean']['output'];
};

export type SessionInfo = {
  __typename?: 'SessionInfo';
  authMethods: Array<Scalars['String']['output']>;
  authenticated: Scalars['Boolean']['output'];
  fresh: Scalars['Boolean']['output'];
  issuedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type SetLabelsInput = {
  choiceSet?: InputMaybe<Scalars['UUID']['input']>;
  entity: Scalars['UUID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  values: Array<Scalars['String']['input']>;
};

export type Space = Node & {
  __typename?: 'Space';
  about: About;
  activityScore?: Maybe<Scalars['Int']['output']>;
  applicationForm?: Maybe<Scalars['JSON']['output']>;
  audience?: Maybe<Audience>;
  can: SpaceCan;
  classifications: Array<Classification>;
  createdAt: Scalars['DateTime']['output'];
  curated?: Maybe<Array<CuratedItem>>;
  depth: Scalars['Int']['output'];
  entitlements?: Maybe<Array<Entitlement>>;
  entityType: Scalars['String']['output'];
  guidelines?: Maybe<Scalars['JSON']['output']>;
  handle: Scalars['String']['output'];
  host?: Maybe<Actor>;
  id: Scalars['UUID']['output'];
  isContentPublic: Scalars['Boolean']['output'];
  kind: SpaceKind;
  leads?: Maybe<Array<Actor>>;
  links: Array<Link>;
  memberCount?: Maybe<Scalars['Int']['output']>;
  membership?: Maybe<Membership>;
  parent?: Maybe<Space>;
  pinned?: Maybe<Scalars['Boolean']['output']>;
  planAssignments?: Maybe<Array<PlanAssignment>>;
  settings?: Maybe<Scalars['JSON']['output']>;
  sortOrder?: Maybe<Scalars['Int']['output']>;
  stages?: Maybe<Array<Stage>>;
  status: SpaceStatus;
  subdomain?: Maybe<Scalars['String']['output']>;
  subspaces?: Maybe<Array<Space>>;
  tags: Array<Scalars['String']['output']>;
  templateCount?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  videoCallUrl?: Maybe<Scalars['String']['output']>;
};

export type SpaceSubspacesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type SpaceCan = {
  __typename?: 'SpaceCan';
  apply: Scalars['Boolean']['output'];
  archive: Scalars['Boolean']['output'];
  createDocument: Scalars['Boolean']['output'];
  createPost: Scalars['Boolean']['output'];
  createSubspace: Scalars['Boolean']['output'];
  delete: Scalars['Boolean']['output'];
  invite: Scalars['Boolean']['output'];
  join: Scalars['Boolean']['output'];
  manageMembers: Scalars['Boolean']['output'];
  manageTemplates: Scalars['Boolean']['output'];
  read: Scalars['Boolean']['output'];
  readActivity: Scalars['Boolean']['output'];
  saveAsTemplate: Scalars['Boolean']['output'];
  update: Scalars['Boolean']['output'];
  upload: Scalars['Boolean']['output'];
};

export type SpaceConnection = {
  __typename?: 'SpaceConnection';
  edges: Array<SpaceEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SpaceEdge = {
  __typename?: 'SpaceEdge';
  cursor: Scalars['String']['output'];
  node: Space;
};

export type SpaceFilter = {
  account?: InputMaybe<Scalars['UUID']['input']>;
  depths?: InputMaybe<Array<Scalars['Int']['input']>>;
  ids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  kind?: InputMaybe<SpaceKind>;
  labels?: InputMaybe<Array<Scalars['UUID']['input']>>;
  listed?: InputMaybe<Scalars['Boolean']['input']>;
  membership?: InputMaybe<Scalars['Boolean']['input']>;
  mostActiveDays?: InputMaybe<Scalars['Int']['input']>;
  parent?: InputMaybe<Scalars['UUID']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<Array<SpaceStatus>>;
  terms?: InputMaybe<Array<Scalars['String']['input']>>;
};

export const SpaceKind = {
  Forum: 'FORUM',
  Homepage: 'HOMEPAGE',
  KnowledgeBase: 'KNOWLEDGE_BASE',
  Pack: 'PACK',
  Space: 'SPACE',
} as const;

export type SpaceKind = (typeof SpaceKind)[keyof typeof SpaceKind];
export type SpaceMembership = {
  __typename?: 'SpaceMembership';
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
  roles: Array<Scalars['String']['output']>;
  space: Space;
};

export const SpaceStatus = {
  Active: 'ACTIVE',
  Archived: 'ARCHIVED',
  Demo: 'DEMO',
  Inactive: 'INACTIVE',
} as const;

export type SpaceStatus = (typeof SpaceStatus)[keyof typeof SpaceStatus];
export type SpacesContent = {
  __typename?: 'SpacesContent';
  hasHiddenSpaces: Scalars['Boolean']['output'];
  settings?: Maybe<Scalars['JSON']['output']>;
  spaces: Array<Space>;
};

export type Stage = {
  __typename?: 'Stage';
  defaultTemplate?: Maybe<Template>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type StorageLimits = {
  __typename?: 'StorageLimits';
  allowedMime: Array<Scalars['String']['output']>;
  maxFileSize: Scalars['Long']['output'];
};

export type TaskBoardContent = {
  __typename?: 'TaskBoardContent';
  columns: Array<Stage>;
  tasks: Array<Post>;
};

export type Template = Node & {
  __typename?: 'Template';
  about: About;
  body?: Maybe<Node>;
  entityType: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  kind: TemplateKind;
  provider?: Maybe<Actor>;
  scope: Node;
  tags: Array<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type TemplateConnection = {
  __typename?: 'TemplateConnection';
  edges: Array<TemplateEdge>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TemplateDefault = {
  __typename?: 'TemplateDefault';
  slot: Scalars['String']['output'];
  stage?: Maybe<Stage>;
  template?: Maybe<Template>;
};

export type TemplateDocumentInit = {
  blueprint?: InputMaybe<Scalars['JSON']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  docType: DocType;
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  file?: InputMaybe<Scalars['UUID']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<DocRole>;
  sourceDocument?: InputMaybe<Scalars['UUID']['input']>;
};

export type TemplateEdge = {
  __typename?: 'TemplateEdge';
  cursor: Scalars['String']['output'];
  node: Template;
};

export type TemplateInitInput = {
  document?: InputMaybe<TemplateDocumentInit>;
  post?: InputMaybe<TemplatePostInit>;
};

export const TemplateKind = {
  Classification: 'CLASSIFICATION',
  Document: 'DOCUMENT',
  Guidelines: 'GUIDELINES',
  Post: 'POST',
  ResponseDefault: 'RESPONSE_DEFAULT',
  Space: 'SPACE',
} as const;

export type TemplateKind = (typeof TemplateKind)[keyof typeof TemplateKind];
export type TemplatePostInit = {
  blueprint: Scalars['JSON']['input'];
  handle?: InputMaybe<Scalars['String']['input']>;
  notify?: InputMaybe<Scalars['Boolean']['input']>;
  publish?: InputMaybe<Scalars['Boolean']['input']>;
  stage?: InputMaybe<Scalars['UUID']['input']>;
  template?: InputMaybe<Scalars['UUID']['input']>;
};

export type TypeCount = {
  __typename?: 'TypeCount';
  count: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type UpdateAboutInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  facets?: InputMaybe<Array<AboutFacetInput>>;
  location?: InputMaybe<Scalars['JSON']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export const UpdatePolicy = {
  Admins: 'ADMINS',
  Contributors: 'CONTRIBUTORS',
  Owner: 'OWNER',
} as const;

export type UpdatePolicy = (typeof UpdatePolicy)[keyof typeof UpdatePolicy];
export type UploadToken = {
  __typename?: 'UploadToken';
  allowedMime: Array<Scalars['String']['output']>;
  expiresAt: Scalars['DateTime']['output'];
  maxSize: Scalars['Int']['output'];
  token: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type User = Actor &
  Node & {
    __typename?: 'User';
    about: About;
    account?: Maybe<AccountSummary>;
    actorType: Scalars['String']['output'];
    can: ActorCan;
    email?: Maybe<Scalars['String']['output']>;
    entityType: Scalars['String']['output'];
    firstName?: Maybe<Scalars['String']['output']>;
    handle: Scalars['String']['output'];
    hosted?: Maybe<HostedResources>;
    id: Scalars['UUID']['output'];
    keywords: Array<Scalars['String']['output']>;
    lastName?: Maybe<Scalars['String']['output']>;
    links: Array<Link>;
    memberships: Array<SpaceMembership>;
    notificationPrefs?: Maybe<Scalars['JSON']['output']>;
    organizations: Array<OrganizationMembership>;
    settings?: Maybe<Scalars['JSON']['output']>;
    skills: Array<Scalars['String']['output']>;
    url?: Maybe<Scalars['String']['output']>;
  };

export const VerificationState = {
  Archived: 'ARCHIVED',
  NotVerified: 'NOT_VERIFIED',
  Pending: 'PENDING',
  Rejected: 'REJECTED',
  Verified: 'VERIFIED',
} as const;

export type VerificationState = (typeof VerificationState)[keyof typeof VerificationState];
export type Viewer = {
  __typename?: 'Viewer';
  account?: Maybe<AccountSummary>;
  actor?: Maybe<Actor>;
  homeSpace?: Maybe<Space>;
  id: Scalars['UUID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  matrix?: Maybe<MatrixAccess>;
  pendingApplications: Array<MembershipRequest>;
  pendingInvitations: Array<MembershipRequest>;
  platformPrivileges: Array<Scalars['String']['output']>;
  platformRoles: Array<Scalars['String']['output']>;
  recentSpaces: Array<RecentSpace>;
  session: SessionInfo;
};

export type ViewerRecentSpacesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type VisualConstraint = {
  __typename?: 'VisualConstraint';
  allowedTypes: Array<Scalars['String']['output']>;
  aspectRatio: Scalars['Float']['output'];
  maxAspectRatio: Scalars['Float']['output'];
  maxHeight: Scalars['Int']['output'];
  maxWidth: Scalars['Int']['output'];
  minAspectRatio: Scalars['Float']['output'];
  minHeight: Scalars['Int']['output'];
  minWidth: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type WithheldRole = {
  __typename?: 'WithheldRole';
  reason: WithheldRoleReason;
  role: Scalars['String']['output'];
};

export const WithheldRoleReason = {
  OffererDeleted: 'OFFERER_DELETED',
  RoleLimits: 'ROLE_LIMITS',
  SelfOffer: 'SELF_OFFER',
  StandingLost: 'STANDING_LOST',
} as const;

export type WithheldRoleReason = (typeof WithheldRoleReason)[keyof typeof WithheldRoleReason];
export type V2FoundationQueryVariables = Exact<{
  origin: Scalars['String']['input'];
  resolveHomepage: Scalars['Boolean']['input'];
}>;

export type V2FoundationQuery = {
  __typename?: 'Query';
  resolve?: { __typename?: 'ResolveResult'; homepage?: { __typename?: 'Space'; id: string } | null };
  viewer: {
    __typename?: 'Viewer';
    id: string;
    language?: string | null;
    platformRoles: Array<string>;
    platformPrivileges: Array<string>;
    actor?:
      | {
          __typename?: 'Agent';
          id: string;
          actorType: string;
          url?: string | null;
          settings?: unknown | null;
          notificationPrefs?: unknown | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
        }
      | {
          __typename?: 'GenericActor';
          id: string;
          actorType: string;
          url?: string | null;
          settings?: unknown | null;
          notificationPrefs?: unknown | null;
          about?: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          } | null;
        }
      | {
          __typename?: 'Organization';
          id: string;
          actorType: string;
          url?: string | null;
          settings?: unknown | null;
          notificationPrefs?: unknown | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
        }
      | {
          __typename?: 'User';
          firstName?: string | null;
          lastName?: string | null;
          id: string;
          actorType: string;
          url?: string | null;
          settings?: unknown | null;
          notificationPrefs?: unknown | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
        }
      | null;
    session: {
      __typename?: 'SessionInfo';
      authenticated: boolean;
      issuedAt?: string | null;
      fresh: boolean;
      authMethods: Array<string>;
    };
    matrix?: { __typename?: 'MatrixAccess'; userId: string; sessionBaseUrl: string; expiresAt: string } | null;
    homeSpace?: { __typename?: 'Space'; id: string; url?: string | null } | null;
    account?: {
      __typename?: 'AccountSummary';
      id: string;
      canCreate: Array<{ __typename?: 'CanCreate'; kind: string; allowed: boolean; reason?: CanCreateReason | null }>;
      entitlements?: Array<{
        __typename?: 'Entitlement';
        name: string;
        limit?: number | null;
        usage?: number | null;
      }> | null;
    } | null;
  };
};

export type MembershipRequestRowFragment = {
  __typename?: 'MembershipRequest';
  id: string;
  direction: RequestDirection;
  state?: RequestState | null;
  roles: Array<string>;
  email?: string | null;
  message?: string | null;
  answers?: unknown | null;
  createdAt: string;
  decidedAt?: string | null;
  availableEvents: Array<string>;
  actor?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          location?: unknown | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          location?: unknown | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          location?: unknown | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          location?: unknown | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
};

export type MembershipRequestsQueryVariables = Exact<{
  resource: Scalars['UUID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type MembershipRequestsQuery = {
  __typename?: 'Query';
  requests: {
    __typename?: 'MembershipRequestConnection';
    edges: Array<{
      __typename?: 'MembershipRequestEdge';
      node: {
        __typename?: 'MembershipRequest';
        id: string;
        direction: RequestDirection;
        state?: RequestState | null;
        roles: Array<string>;
        email?: string | null;
        message?: string | null;
        answers?: unknown | null;
        createdAt: string;
        decidedAt?: string | null;
        availableEvents: Array<string>;
        actor?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                location?: unknown | null;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                location?: unknown | null;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                location?: unknown | null;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                location?: unknown | null;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | null;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type RespondToMembershipRequestMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  event: Scalars['String']['input'];
}>;

export type RespondToMembershipRequestMutation = {
  __typename?: 'Mutation';
  respondToRequest: {
    __typename?: 'MembershipResult';
    request?: {
      __typename?: 'MembershipRequest';
      id: string;
      state?: RequestState | null;
      availableEvents: Array<string>;
    } | null;
  };
};

export type ResendMembershipInvitationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type ResendMembershipInvitationMutation = {
  __typename?: 'Mutation';
  resendInvitation: { __typename?: 'MembershipRequest'; id: string };
};

export type PostDetailQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type PostDetailQuery = {
  __typename?: 'Query';
  post?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | {
        __typename?: 'Post';
        id: string;
        entityType: string;
        url?: string | null;
        handle: string;
        sortOrder: number;
        contentKind: string;
        createdAt: string;
        publishedAt?: string | null;
        tags: Array<string>;
        commentsEnabled: boolean;
        responseKind?: string | null;
        responsePolicy?: unknown | null;
        responseDefaults?: unknown | null;
        responseCount: number;
        postStatus: PostStatus;
        parentPost?: { __typename?: 'Post'; id: string; url?: string | null } | null;
        stage?: { __typename?: 'Stage'; id: string } | null;
        about: { __typename?: 'About'; displayName: string; description?: string | null };
        links: Array<{
          __typename?: 'Link';
          id: string;
          title?: string | null;
          description?: string | null;
          uri: string;
          sortOrder: number;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        }>;
        author?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        publishedBy?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
        can: {
          __typename?: 'PostCan';
          read: boolean;
          update: boolean;
          delete: boolean;
          respond: boolean;
          comment: boolean;
          move: boolean;
          moveTask: boolean;
          manageColumns: boolean;
        };
        content?:
          | {
              __typename: 'ContributorsContent';
              settings?: unknown | null;
              counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
              contributors?: Array<
                | {
                    __typename?: 'Agent';
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
                | {
                    __typename?: 'GenericActor';
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about?: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    } | null;
                  }
                | {
                    __typename?: 'Organization';
                    tags: Array<string>;
                    associateCount?: number | null;
                    website?: string | null;
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
                | {
                    __typename?: 'User';
                    skills: Array<string>;
                    keywords: Array<string>;
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
              > | null;
            }
          | {
              __typename: 'DocumentContent';
              document: {
                __typename?: 'Document';
                id: string;
                docType: DocType;
                url?: string | null;
                textSnapshot?: string | null;
                preview?: { __typename?: 'File'; url: string } | null;
                about?: { __typename?: 'About'; displayName: string } | null;
                can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
              };
            }
          | {
              __typename: 'EventContent';
              startsAt?: string | null;
              endsAt?: string | null;
              startsOn?: string | null;
              endsOn?: string | null;
              allDay: boolean;
              timezone?: string | null;
              location?: string | null;
              type?: string | null;
              rollUp: boolean;
              calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
            }
          | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
          | { __typename: 'FormResponseContent'; answers: unknown }
          | {
              __typename: 'GalleryContent';
              images: Array<{
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; id: string; url: string; mime: string };
              }>;
            }
          | {
              __typename: 'LinkContent';
              link: {
                __typename?: 'Link';
                id: string;
                uri: string;
                title?: string | null;
                description?: string | null;
                file?: { __typename?: 'File'; id: string; url: string } | null;
              };
            }
          | {
              __typename: 'PollContent';
              question: string;
              status: PollStatus;
              deadline?: string | null;
              settings?: unknown | null;
              totalVotes?: number | null;
              myVotes: Array<string>;
              options: Array<{
                __typename?: 'PollOption';
                id: string;
                value: string;
                sortOrder: number;
                votes?: number | null;
                percentage?: number | null;
                mine: boolean;
                voters?: Array<
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                > | null;
              }>;
            }
          | {
              __typename: 'SpacesContent';
              settings?: unknown | null;
              hasHiddenSpaces: boolean;
              spaces: Array<{
                __typename?: 'Space';
                id: string;
                url?: string | null;
                pinned?: boolean | null;
                status: SpaceStatus;
                isContentPublic: boolean;
                tags: Array<string>;
                membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  tagline?: string | null;
                  description?: string | null;
                  card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                };
                leads?: Array<
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                > | null;
              }>;
            }
          | {
              __typename: 'TaskBoardContent';
              columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
              tasks: Array<{
                __typename?: 'Post';
                id: string;
                url?: string | null;
                contentKind: string;
                createdAt: string;
                tags: Array<string>;
                sortOrder: number;
                stage?: { __typename?: 'Stage'; id: string } | null;
                about: { __typename?: 'About'; displayName: string; description?: string | null };
                links: Array<{
                  __typename?: 'Link';
                  id: string;
                  title?: string | null;
                  description?: string | null;
                  uri: string;
                  sortOrder: number;
                  file?: { __typename?: 'File'; id: string; url: string } | null;
                }>;
                author?:
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | null;
                room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
                can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
                content?:
                  | { __typename: 'ContributorsContent' }
                  | {
                      __typename: 'DocumentContent';
                      document: {
                        __typename?: 'Document';
                        id: string;
                        docType: DocType;
                        textSnapshot?: string | null;
                        preview?: { __typename?: 'File'; url: string } | null;
                        about?: { __typename?: 'About'; displayName: string } | null;
                      };
                    }
                  | { __typename: 'EventContent' }
                  | { __typename: 'FormContent' }
                  | { __typename: 'FormResponseContent' }
                  | { __typename: 'GalleryContent' }
                  | {
                      __typename: 'LinkContent';
                      link: {
                        __typename?: 'Link';
                        id: string;
                        uri: string;
                        title?: string | null;
                        description?: string | null;
                        file?: { __typename?: 'File'; id: string; url: string } | null;
                      };
                    }
                  | { __typename: 'PollContent' }
                  | { __typename: 'SpacesContent' }
                  | { __typename: 'TaskBoardContent' }
                  | null;
              }>;
            }
          | null;
      }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type V2FileRefFragment = { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } };

export type V2RespondToRequestMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  event: Scalars['String']['input'];
}>;

export type V2RespondToRequestMutation = {
  __typename?: 'Mutation';
  respondToRequest: {
    __typename?: 'MembershipResult';
    request?: {
      __typename?: 'MembershipRequest';
      id: string;
      state?: RequestState | null;
      availableEvents: Array<string>;
      withheldRoles: Array<{ __typename?: 'WithheldRole'; role: string; reason: WithheldRoleReason }>;
    } | null;
  };
};

export type V2PendingMembershipRequestFragment = {
  __typename?: 'MembershipRequest';
  id: string;
  state?: RequestState | null;
  createdAt: string;
  message?: string | null;
  roles: Array<string>;
  availableEvents: Array<string>;
  wouldJoin?: Array<{ __typename?: 'JoiningSpace'; displayName: string; url: string }> | null;
  resource:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | {
        __typename?: 'Organization';
        url?: string | null;
        id: string;
        entityType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        };
      }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string };
  space?: {
    __typename?: 'Space';
    id: string;
    url?: string | null;
    depth: number;
    tags: Array<string>;
    about: {
      __typename?: 'About';
      displayName: string;
      tagline?: string | null;
      avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
      card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
    };
  } | null;
  actor?:
    | { __typename?: 'Agent'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        about?: { __typename?: 'About'; displayName: string } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        about: { __typename?: 'About'; displayName: string };
      }
    | { __typename?: 'User'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
    | null;
  createdBy?:
    | { __typename?: 'Agent'; id: string; about: { __typename?: 'About'; displayName: string } }
    | { __typename?: 'GenericActor'; id: string; about?: { __typename?: 'About'; displayName: string } | null }
    | { __typename?: 'Organization'; id: string; about: { __typename?: 'About'; displayName: string } }
    | { __typename?: 'User'; id: string; about: { __typename?: 'About'; displayName: string } }
    | null;
};

export type V2PendingMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type V2PendingMembershipsQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    pendingInvitations: Array<{
      __typename?: 'MembershipRequest';
      id: string;
      state?: RequestState | null;
      createdAt: string;
      message?: string | null;
      roles: Array<string>;
      availableEvents: Array<string>;
      wouldJoin?: Array<{ __typename?: 'JoiningSpace'; displayName: string; url: string }> | null;
      resource:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | {
            __typename?: 'Organization';
            url?: string | null;
            id: string;
            entityType: string;
            about: {
              __typename?: 'About';
              displayName: string;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
            };
          }
        | { __typename?: 'Post'; id: string; entityType: string }
        | { __typename?: 'Room'; id: string; entityType: string }
        | { __typename?: 'Space'; id: string; entityType: string }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
      space?: {
        __typename?: 'Space';
        id: string;
        url?: string | null;
        depth: number;
        tags: Array<string>;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        };
      } | null;
      actor?:
        | { __typename?: 'Agent'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
        | {
            __typename?: 'GenericActor';
            id: string;
            actorType: string;
            about?: { __typename?: 'About'; displayName: string } | null;
          }
        | {
            __typename?: 'Organization';
            id: string;
            actorType: string;
            about: { __typename?: 'About'; displayName: string };
          }
        | { __typename?: 'User'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
        | null;
      createdBy?:
        | { __typename?: 'Agent'; id: string; about: { __typename?: 'About'; displayName: string } }
        | { __typename?: 'GenericActor'; id: string; about?: { __typename?: 'About'; displayName: string } | null }
        | { __typename?: 'Organization'; id: string; about: { __typename?: 'About'; displayName: string } }
        | { __typename?: 'User'; id: string; about: { __typename?: 'About'; displayName: string } }
        | null;
    }>;
    pendingApplications: Array<{
      __typename?: 'MembershipRequest';
      id: string;
      state?: RequestState | null;
      createdAt: string;
      message?: string | null;
      roles: Array<string>;
      availableEvents: Array<string>;
      wouldJoin?: Array<{ __typename?: 'JoiningSpace'; displayName: string; url: string }> | null;
      resource:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | {
            __typename?: 'Organization';
            url?: string | null;
            id: string;
            entityType: string;
            about: {
              __typename?: 'About';
              displayName: string;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
            };
          }
        | { __typename?: 'Post'; id: string; entityType: string }
        | { __typename?: 'Room'; id: string; entityType: string }
        | { __typename?: 'Space'; id: string; entityType: string }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
      space?: {
        __typename?: 'Space';
        id: string;
        url?: string | null;
        depth: number;
        tags: Array<string>;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        };
      } | null;
      actor?:
        | { __typename?: 'Agent'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
        | {
            __typename?: 'GenericActor';
            id: string;
            actorType: string;
            about?: { __typename?: 'About'; displayName: string } | null;
          }
        | {
            __typename?: 'Organization';
            id: string;
            actorType: string;
            about: { __typename?: 'About'; displayName: string };
          }
        | { __typename?: 'User'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
        | null;
      createdBy?:
        | { __typename?: 'Agent'; id: string; about: { __typename?: 'About'; displayName: string } }
        | { __typename?: 'GenericActor'; id: string; about?: { __typename?: 'About'; displayName: string } | null }
        | { __typename?: 'Organization'; id: string; about: { __typename?: 'About'; displayName: string } }
        | { __typename?: 'User'; id: string; about: { __typename?: 'About'; displayName: string } }
        | null;
    }>;
  };
};

export type NativeConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type NativeConfigurationQuery = {
  __typename?: 'Query';
  config: {
    __typename?: 'Config';
    platformId: string;
    languages: Array<string>;
    defaultLanguage: string;
    features: unknown;
    authProviders: Array<string>;
    iframeAllowlist: Array<string>;
    matrix: { __typename?: 'ConfigMatrix'; sessionBaseUrl: string };
    authentication: { __typename?: 'ConfigAuthentication'; kratosPublicUrl: string };
    links: Array<{ __typename?: 'ConfigLink'; key: string; url: string }>;
    telemetry?: {
      __typename?: 'ConfigTelemetry';
      environment?: string | null;
      sentry?: {
        __typename?: 'SentryConfig';
        enabled: boolean;
        endpoint?: string | null;
        submitPII: boolean;
        environment?: string | null;
      } | null;
      apm?: { __typename?: 'ApmConfig'; rumEnabled: boolean; endpoint?: string | null } | null;
    } | null;
    geo?: { __typename?: 'ConfigGeo'; enabled: boolean; endpoint?: string | null } | null;
    versions?: { __typename?: 'ConfigVersions'; server?: string | null } | null;
  };
};

export type NativeGuidancePointerQueryVariables = Exact<{ [key: string]: never }>;

export type NativeGuidancePointerQuery = {
  __typename?: 'Query';
  config: {
    __typename?: 'Config';
    pointers: { __typename?: 'ConfigPointers'; guidanceVirtualContributor?: string | null };
  };
};

export type V2ConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type V2ConfigurationQuery = {
  __typename?: 'Query';
  config: {
    __typename?: 'Config';
    platformId: string;
    languages: Array<string>;
    defaultLanguage: string;
    features: unknown;
    iframeAllowlist: Array<string>;
    vapidPublicKey?: string | null;
    authentication: { __typename?: 'ConfigAuthentication'; kratosPublicUrl: string };
    matrix: { __typename?: 'ConfigMatrix'; homeserverUrl: string; sessionBaseUrl: string; serverName: string };
    links: Array<{ __typename?: 'ConfigLink'; key: string; url: string }>;
    telemetry?: {
      __typename?: 'ConfigTelemetry';
      environment?: string | null;
      sentry?: {
        __typename?: 'SentryConfig';
        enabled: boolean;
        endpoint?: string | null;
        submitPII: boolean;
        environment?: string | null;
      } | null;
      apm?: { __typename?: 'ApmConfig'; rumEnabled: boolean; endpoint?: string | null } | null;
    } | null;
    geo?: { __typename?: 'ConfigGeo'; enabled: boolean; endpoint?: string | null } | null;
    versions?: { __typename?: 'ConfigVersions'; server?: string | null } | null;
    storage: { __typename?: 'StorageLimits'; maxFileSize: number; allowedMime: Array<string> };
  };
};

export type HomeRedirectMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type HomeRedirectMembershipsQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    actor?:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'Organization'; id: string }
      | {
          __typename?: 'User';
          id: string;
          memberships: Array<{
            __typename?: 'SpaceMembership';
            space: { __typename?: 'Space'; id: string; depth: number; url?: string | null };
          }>;
        }
      | null;
  };
};

export type CreateSpaceVisualConstraintsQueryVariables = Exact<{ [key: string]: never }>;

export type CreateSpaceVisualConstraintsQuery = {
  __typename?: 'Query';
  config: {
    __typename?: 'Config';
    visualConstraints: Array<{
      __typename?: 'VisualConstraint';
      name: string;
      minWidth: number;
      maxWidth: number;
      minHeight: number;
      maxHeight: number;
      aspectRatio: number;
      minAspectRatio: number;
      maxAspectRatio: number;
      allowedTypes: Array<string>;
    }>;
  };
};

export type CreateSpaceAccountFragment = {
  __typename?: 'AccountSummary';
  id: string;
  canCreate: Array<{
    __typename?: 'CanCreate';
    kind: string;
    allowed: boolean;
    reason?: CanCreateReason | null;
    byEntitlement: Array<{ __typename?: 'EntitlementAvailability'; name: string; allowed: boolean }>;
  }>;
};

export type CreateSpaceViewerAccountQueryVariables = Exact<{ [key: string]: never }>;

export type CreateSpaceViewerAccountQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    account?: {
      __typename?: 'AccountSummary';
      id: string;
      canCreate: Array<{
        __typename?: 'CanCreate';
        kind: string;
        allowed: boolean;
        reason?: CanCreateReason | null;
        byEntitlement: Array<{ __typename?: 'EntitlementAvailability'; name: string; allowed: boolean }>;
      }>;
    } | null;
  };
};

export type CreateSpaceOrganizationAccountQueryVariables = Exact<{
  organization: Scalars['UUID']['input'];
}>;

export type CreateSpaceOrganizationAccountQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | {
        __typename?: 'Organization';
        id: string;
        account?: {
          __typename?: 'AccountSummary';
          id: string;
          canCreate: Array<{
            __typename?: 'CanCreate';
            kind: string;
            allowed: boolean;
            reason?: CanCreateReason | null;
            byEntitlement: Array<{ __typename?: 'EntitlementAvailability'; name: string; allowed: boolean }>;
          }>;
        } | null;
      }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | { __typename?: 'Space'; id: string }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string }
    | null;
};

export type CreateSpacePlansQueryVariables = Exact<{ [key: string]: never }>;

export type CreateSpacePlansQuery = {
  __typename?: 'Query';
  plans: Array<{
    __typename?: 'Plan';
    id: string;
    name: string;
    sortOrder: number;
    enabled: boolean;
    entitlements: Array<{ __typename?: 'Entitlement'; name: string }>;
  }>;
  config: {
    __typename?: 'Config';
    entitlementCatalog: Array<{
      __typename?: 'EntitlementInfo';
      name: string;
      effectiveEntitlement?: string | null;
      creationKinds: Array<{ __typename?: 'EntitlementCreationKind'; entityType: string; kind: string }>;
    }>;
  };
};

export type CreateSpaceMutationVariables = Exact<{
  input: CreateSpaceInput;
}>;

export type CreateSpaceMutation = {
  __typename?: 'Mutation';
  createSpace: {
    __typename?: 'BlueprintResult';
    node:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | { __typename?: 'Space'; url?: string | null; id: string }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string };
    omissions: Array<{ __typename?: 'BlueprintOmission'; path: string; code: BlueprintOmissionCode }>;
  };
};

export type CreateSubspaceMutationVariables = Exact<{
  input: CreateSpaceInput;
}>;

export type CreateSubspaceMutation = {
  __typename?: 'Mutation';
  createSpace: {
    __typename?: 'BlueprintResult';
    node:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | { __typename?: 'Space'; url?: string | null; id: string }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string };
    omissions: Array<{ __typename?: 'BlueprintOmission'; path: string; code: BlueprintOmissionCode }>;
  };
};

export type RequestVisualUploadMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  mime: Scalars['String']['input'];
  size: Scalars['Long']['input'];
  role: Scalars['String']['input'];
}>;

export type RequestVisualUploadMutation = {
  __typename?: 'Mutation';
  requestUpload: { __typename?: 'UploadToken'; token: string; url: string };
};

export type AttachVisualMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  file: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  alt?: InputMaybe<Scalars['String']['input']>;
}>;

export type AttachVisualMutation = {
  __typename?: 'Mutation';
  attachFile:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | { __typename?: 'Space'; id: string }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string };
};

export type SpacePageShellQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpacePageShellQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        handle: string;
        url?: string | null;
        depth: number;
        status: SpaceStatus;
        isContentPublic: boolean;
        tags: Array<string>;
        settings?: unknown | null;
        videoCallUrl?: string | null;
        id: string;
        entityType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; url: string };
          } | null;
          card?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
        can: {
          __typename?: 'SpaceCan';
          read: boolean;
          update: boolean;
          createSubspace: boolean;
          manageTemplates: boolean;
          saveAsTemplate: boolean;
        };
        membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
        entitlements?: Array<{ __typename?: 'Entitlement'; name: string }> | null;
        host?:
          | { __typename?: 'Agent'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'GenericActor'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'Organization'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'User'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | null;
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type NativeSubspaceCardFragment = {
  __typename?: 'Space';
  id: string;
  url?: string | null;
  status: SpaceStatus;
  isContentPublic: boolean;
  pinned?: boolean | null;
  tags: Array<string>;
  about: {
    __typename?: 'About';
    displayName: string;
    tagline?: string | null;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
    card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
  membership?: { __typename?: 'Membership'; roles: Array<string> } | null;
  can: { __typename?: 'SpaceCan'; read: boolean };
  leads?: Array<
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
  > | null;
};

export type NativeSubspacesQueryVariables = Exact<{
  root: Scalars['UUID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type NativeSubspacesQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; settings?: unknown | null; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
  spaces?: {
    __typename?: 'NodeConnection';
    totalCount?: number | null;
    edges: Array<{
      __typename?: 'NodeEdge';
      cursor: string;
      node:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | { __typename?: 'Organization'; id: string; entityType: string }
        | { __typename?: 'Post'; id: string; entityType: string }
        | { __typename?: 'Room'; id: string; entityType: string }
        | {
            __typename?: 'Space';
            id: string;
            entityType: string;
            url?: string | null;
            status: SpaceStatus;
            isContentPublic: boolean;
            pinned?: boolean | null;
            tags: Array<string>;
            about: {
              __typename?: 'About';
              displayName: string;
              tagline?: string | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            membership?: { __typename?: 'Membership'; roles: Array<string> } | null;
            can: { __typename?: 'SpaceCan'; read: boolean };
            leads?: Array<
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
            > | null;
          }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SpaceCommunityQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceCommunityQuery = {
  __typename?: 'Query';
  members: {
    __typename?: 'MemberConnection';
    totalCount?: number | null;
    edges: Array<{
      __typename?: 'MemberEdge';
      cursor: string;
      node: {
        __typename?: 'Member';
        id: string;
        roles: Array<string>;
        joinedAt?: string | null;
        actor:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                description?: string | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                description?: string | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              tags: Array<string>;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                description?: string | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              skills: Array<string>;
              keywords: Array<string>;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                description?: string | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type SpacePageQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  withSpace: Scalars['Boolean']['input'];
}>;

export type SpacePageQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        handle: string;
        url?: string | null;
        depth: number;
        status: SpaceStatus;
        createdAt: string;
        tags: Array<string>;
        isContentPublic: boolean;
        settings?: unknown | null;
        videoCallUrl?: string | null;
        memberCount?: number | null;
        guidelines?: unknown | null;
        applicationForm?: unknown | null;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          location?: unknown | null;
          facets: Array<{ __typename?: 'AboutFacet'; namespace: string; name: string; value?: unknown | null }>;
          avatar?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          card?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
        host?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        leads?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
        stages?: Array<{
          __typename?: 'Stage';
          id: string;
          name: string;
          description?: string | null;
          sortOrder: number;
        }> | null;
        membership?: {
          __typename?: 'Membership';
          roles: Array<string>;
          status: MembershipStatus;
          request?: {
            __typename?: 'MembershipRequest';
            id: string;
            state?: RequestState | null;
            direction: RequestDirection;
            message?: string | null;
            createdAt: string;
            createdBy?:
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | null;
          } | null;
        } | null;
        parent?: {
          __typename?: 'Space';
          id: string;
          url?: string | null;
          can: { __typename?: 'SpaceCan'; join: boolean; apply: boolean };
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
        } | null;
        entitlements?: Array<{ __typename?: 'Entitlement'; name: string }> | null;
        can: {
          __typename?: 'SpaceCan';
          read: boolean;
          update: boolean;
          delete: boolean;
          archive: boolean;
          createPost: boolean;
          createSubspace: boolean;
          createDocument: boolean;
          invite: boolean;
          manageMembers: boolean;
          manageTemplates: boolean;
          upload: boolean;
          readActivity: boolean;
          saveAsTemplate: boolean;
          join: boolean;
          apply: boolean;
        };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpacePageWithPostQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  withSpace: Scalars['Boolean']['input'];
  post: Scalars['UUID']['input'];
}>;

export type SpacePageWithPostQuery = {
  __typename?: 'Query';
  post?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | {
        __typename?: 'Post';
        id: string;
        entityType: string;
        url?: string | null;
        handle: string;
        sortOrder: number;
        contentKind: string;
        createdAt: string;
        publishedAt?: string | null;
        tags: Array<string>;
        commentsEnabled: boolean;
        responseKind?: string | null;
        responsePolicy?: unknown | null;
        responseDefaults?: unknown | null;
        responseCount: number;
        postStatus: PostStatus;
        parentPost?: { __typename?: 'Post'; id: string; url?: string | null } | null;
        stage?: { __typename?: 'Stage'; id: string } | null;
        about: { __typename?: 'About'; displayName: string; description?: string | null };
        links: Array<{
          __typename?: 'Link';
          id: string;
          title?: string | null;
          description?: string | null;
          uri: string;
          sortOrder: number;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        }>;
        author?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        publishedBy?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
        can: {
          __typename?: 'PostCan';
          read: boolean;
          update: boolean;
          delete: boolean;
          respond: boolean;
          comment: boolean;
          move: boolean;
          moveTask: boolean;
          manageColumns: boolean;
        };
        content?:
          | {
              __typename: 'ContributorsContent';
              settings?: unknown | null;
              counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
              contributors?: Array<
                | {
                    __typename?: 'Agent';
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
                | {
                    __typename?: 'GenericActor';
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about?: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    } | null;
                  }
                | {
                    __typename?: 'Organization';
                    tags: Array<string>;
                    associateCount?: number | null;
                    website?: string | null;
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
                | {
                    __typename?: 'User';
                    skills: Array<string>;
                    keywords: Array<string>;
                    id: string;
                    actorType: string;
                    url?: string | null;
                    about: {
                      __typename?: 'About';
                      tagline?: string | null;
                      location?: unknown | null;
                      displayName: string;
                      avatar?: {
                        __typename?: 'FileRef';
                        alt?: string | null;
                        file: { __typename?: 'File'; url: string };
                      } | null;
                    };
                  }
              > | null;
            }
          | {
              __typename: 'DocumentContent';
              document: {
                __typename?: 'Document';
                id: string;
                docType: DocType;
                url?: string | null;
                textSnapshot?: string | null;
                preview?: { __typename?: 'File'; url: string } | null;
                about?: { __typename?: 'About'; displayName: string } | null;
                can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
              };
            }
          | {
              __typename: 'EventContent';
              startsAt?: string | null;
              endsAt?: string | null;
              startsOn?: string | null;
              endsOn?: string | null;
              allDay: boolean;
              timezone?: string | null;
              location?: string | null;
              type?: string | null;
              rollUp: boolean;
              calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
            }
          | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
          | { __typename: 'FormResponseContent'; answers: unknown }
          | {
              __typename: 'GalleryContent';
              images: Array<{
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; id: string; url: string; mime: string };
              }>;
            }
          | {
              __typename: 'LinkContent';
              link: {
                __typename?: 'Link';
                id: string;
                uri: string;
                title?: string | null;
                description?: string | null;
                file?: { __typename?: 'File'; id: string; url: string } | null;
              };
            }
          | {
              __typename: 'PollContent';
              question: string;
              status: PollStatus;
              deadline?: string | null;
              settings?: unknown | null;
              totalVotes?: number | null;
              myVotes: Array<string>;
              options: Array<{
                __typename?: 'PollOption';
                id: string;
                value: string;
                sortOrder: number;
                votes?: number | null;
                percentage?: number | null;
                mine: boolean;
                voters?: Array<
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                > | null;
              }>;
            }
          | {
              __typename: 'SpacesContent';
              settings?: unknown | null;
              hasHiddenSpaces: boolean;
              spaces: Array<{
                __typename?: 'Space';
                id: string;
                url?: string | null;
                pinned?: boolean | null;
                status: SpaceStatus;
                isContentPublic: boolean;
                tags: Array<string>;
                membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  tagline?: string | null;
                  description?: string | null;
                  card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                };
                leads?: Array<
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                > | null;
              }>;
            }
          | {
              __typename: 'TaskBoardContent';
              columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
              tasks: Array<{
                __typename?: 'Post';
                id: string;
                url?: string | null;
                contentKind: string;
                createdAt: string;
                tags: Array<string>;
                sortOrder: number;
                stage?: { __typename?: 'Stage'; id: string } | null;
                about: { __typename?: 'About'; displayName: string; description?: string | null };
                links: Array<{
                  __typename?: 'Link';
                  id: string;
                  title?: string | null;
                  description?: string | null;
                  uri: string;
                  sortOrder: number;
                  file?: { __typename?: 'File'; id: string; url: string } | null;
                }>;
                author?:
                  | {
                      __typename?: 'Agent';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      id: string;
                      actorType: string;
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          alt?: string | null;
                          file: { __typename?: 'File'; url: string };
                        } | null;
                      };
                    }
                  | null;
                room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
                can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
                content?:
                  | { __typename: 'ContributorsContent' }
                  | {
                      __typename: 'DocumentContent';
                      document: {
                        __typename?: 'Document';
                        id: string;
                        docType: DocType;
                        textSnapshot?: string | null;
                        preview?: { __typename?: 'File'; url: string } | null;
                        about?: { __typename?: 'About'; displayName: string } | null;
                      };
                    }
                  | { __typename: 'EventContent' }
                  | { __typename: 'FormContent' }
                  | { __typename: 'FormResponseContent' }
                  | { __typename: 'GalleryContent' }
                  | {
                      __typename: 'LinkContent';
                      link: {
                        __typename?: 'Link';
                        id: string;
                        uri: string;
                        title?: string | null;
                        description?: string | null;
                        file?: { __typename?: 'File'; id: string; url: string } | null;
                      };
                    }
                  | { __typename: 'PollContent' }
                  | { __typename: 'SpacesContent' }
                  | { __typename: 'TaskBoardContent' }
                  | null;
              }>;
            }
          | null;
      }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        handle: string;
        url?: string | null;
        depth: number;
        status: SpaceStatus;
        createdAt: string;
        tags: Array<string>;
        isContentPublic: boolean;
        settings?: unknown | null;
        videoCallUrl?: string | null;
        memberCount?: number | null;
        guidelines?: unknown | null;
        applicationForm?: unknown | null;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          location?: unknown | null;
          facets: Array<{ __typename?: 'AboutFacet'; namespace: string; name: string; value?: unknown | null }>;
          avatar?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          card?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
        host?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        leads?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
        stages?: Array<{
          __typename?: 'Stage';
          id: string;
          name: string;
          description?: string | null;
          sortOrder: number;
        }> | null;
        membership?: {
          __typename?: 'Membership';
          roles: Array<string>;
          status: MembershipStatus;
          request?: {
            __typename?: 'MembershipRequest';
            id: string;
            state?: RequestState | null;
            direction: RequestDirection;
            message?: string | null;
            createdAt: string;
            createdBy?:
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | null;
          } | null;
        } | null;
        parent?: {
          __typename?: 'Space';
          id: string;
          url?: string | null;
          can: { __typename?: 'SpaceCan'; join: boolean; apply: boolean };
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
        } | null;
        entitlements?: Array<{ __typename?: 'Entitlement'; name: string }> | null;
        can: {
          __typename?: 'SpaceCan';
          read: boolean;
          update: boolean;
          delete: boolean;
          archive: boolean;
          createPost: boolean;
          createSubspace: boolean;
          createDocument: boolean;
          invite: boolean;
          manageMembers: boolean;
          manageTemplates: boolean;
          upload: boolean;
          readActivity: boolean;
          saveAsTemplate: boolean;
          join: boolean;
          apply: boolean;
        };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceTreeQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  treeFirst: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceTreeQuery = {
  __typename?: 'Query';
  tree?: {
    __typename?: 'NodeConnection';
    totalCount?: number | null;
    edges: Array<{
      __typename?: 'NodeEdge';
      cursor: string;
      node:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | { __typename?: 'Organization'; id: string; entityType: string }
        | {
            __typename?: 'Post';
            id: string;
            entityType: string;
            url?: string | null;
            handle: string;
            sortOrder: number;
            contentKind: string;
            createdAt: string;
            publishedAt?: string | null;
            tags: Array<string>;
            commentsEnabled: boolean;
            responseKind?: string | null;
            responsePolicy?: unknown | null;
            responseDefaults?: unknown | null;
            responseCount: number;
            postStatus: PostStatus;
            parentPost?: { __typename?: 'Post'; id: string } | null;
            stage?: { __typename?: 'Stage'; id: string } | null;
            about: { __typename?: 'About'; displayName: string; description?: string | null };
            links: Array<{
              __typename?: 'Link';
              id: string;
              title?: string | null;
              description?: string | null;
              uri: string;
              sortOrder: number;
              file?: { __typename?: 'File'; id: string; url: string } | null;
            }>;
            author?:
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | null;
            publishedBy?:
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | null;
            room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
            can: {
              __typename?: 'PostCan';
              read: boolean;
              update: boolean;
              delete: boolean;
              respond: boolean;
              comment: boolean;
              move: boolean;
              moveTask: boolean;
              manageColumns: boolean;
            };
            content?:
              | {
                  __typename: 'ContributorsContent';
                  settings?: unknown | null;
                  counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
                  contributors?: Array<
                    | {
                        __typename?: 'Agent';
                        id: string;
                        actorType: string;
                        url?: string | null;
                        about: {
                          __typename?: 'About';
                          tagline?: string | null;
                          location?: unknown | null;
                          displayName: string;
                          avatar?: {
                            __typename?: 'FileRef';
                            alt?: string | null;
                            file: { __typename?: 'File'; url: string };
                          } | null;
                        };
                      }
                    | {
                        __typename?: 'GenericActor';
                        id: string;
                        actorType: string;
                        url?: string | null;
                        about?: {
                          __typename?: 'About';
                          tagline?: string | null;
                          location?: unknown | null;
                          displayName: string;
                          avatar?: {
                            __typename?: 'FileRef';
                            alt?: string | null;
                            file: { __typename?: 'File'; url: string };
                          } | null;
                        } | null;
                      }
                    | {
                        __typename?: 'Organization';
                        tags: Array<string>;
                        associateCount?: number | null;
                        website?: string | null;
                        id: string;
                        actorType: string;
                        url?: string | null;
                        about: {
                          __typename?: 'About';
                          tagline?: string | null;
                          location?: unknown | null;
                          displayName: string;
                          avatar?: {
                            __typename?: 'FileRef';
                            alt?: string | null;
                            file: { __typename?: 'File'; url: string };
                          } | null;
                        };
                      }
                    | {
                        __typename?: 'User';
                        skills: Array<string>;
                        keywords: Array<string>;
                        id: string;
                        actorType: string;
                        url?: string | null;
                        about: {
                          __typename?: 'About';
                          tagline?: string | null;
                          location?: unknown | null;
                          displayName: string;
                          avatar?: {
                            __typename?: 'FileRef';
                            alt?: string | null;
                            file: { __typename?: 'File'; url: string };
                          } | null;
                        };
                      }
                  > | null;
                }
              | {
                  __typename: 'DocumentContent';
                  document: {
                    __typename?: 'Document';
                    id: string;
                    docType: DocType;
                    url?: string | null;
                    textSnapshot?: string | null;
                    preview?: { __typename?: 'File'; url: string } | null;
                    about?: { __typename?: 'About'; displayName: string } | null;
                    can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
                  };
                }
              | {
                  __typename: 'EventContent';
                  startsAt?: string | null;
                  endsAt?: string | null;
                  startsOn?: string | null;
                  endsOn?: string | null;
                  allDay: boolean;
                  timezone?: string | null;
                  location?: string | null;
                  type?: string | null;
                  rollUp: boolean;
                  calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
                }
              | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
              | { __typename: 'FormResponseContent'; answers: unknown }
              | {
                  __typename: 'GalleryContent';
                  images: Array<{
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; id: string; url: string; mime: string };
                  }>;
                }
              | {
                  __typename: 'LinkContent';
                  link: {
                    __typename?: 'Link';
                    id: string;
                    uri: string;
                    title?: string | null;
                    description?: string | null;
                    file?: { __typename?: 'File'; id: string; url: string } | null;
                  };
                }
              | {
                  __typename: 'PollContent';
                  question: string;
                  status: PollStatus;
                  deadline?: string | null;
                  settings?: unknown | null;
                  totalVotes?: number | null;
                  myVotes: Array<string>;
                  options: Array<{
                    __typename?: 'PollOption';
                    id: string;
                    value: string;
                    sortOrder: number;
                    votes?: number | null;
                    percentage?: number | null;
                    mine: boolean;
                    voters?: Array<
                      | {
                          __typename?: 'Agent';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'GenericActor';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about?: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          } | null;
                        }
                      | {
                          __typename?: 'Organization';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'User';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                    > | null;
                  }>;
                }
              | {
                  __typename: 'SpacesContent';
                  settings?: unknown | null;
                  hasHiddenSpaces: boolean;
                  spaces: Array<{
                    __typename?: 'Space';
                    id: string;
                    url?: string | null;
                    pinned?: boolean | null;
                    status: SpaceStatus;
                    isContentPublic: boolean;
                    tags: Array<string>;
                    membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
                    about: {
                      __typename?: 'About';
                      displayName: string;
                      tagline?: string | null;
                      description?: string | null;
                      card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                      avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                    };
                    leads?: Array<
                      | {
                          __typename?: 'Agent';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'GenericActor';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about?: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          } | null;
                        }
                      | {
                          __typename?: 'Organization';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'User';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                    > | null;
                  }>;
                }
              | {
                  __typename: 'TaskBoardContent';
                  columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
                  tasks: Array<{
                    __typename?: 'Post';
                    id: string;
                    url?: string | null;
                    contentKind: string;
                    createdAt: string;
                    tags: Array<string>;
                    sortOrder: number;
                    stage?: { __typename?: 'Stage'; id: string } | null;
                    about: { __typename?: 'About'; displayName: string; description?: string | null };
                    links: Array<{
                      __typename?: 'Link';
                      id: string;
                      title?: string | null;
                      description?: string | null;
                      uri: string;
                      sortOrder: number;
                      file?: { __typename?: 'File'; id: string; url: string } | null;
                    }>;
                    author?:
                      | {
                          __typename?: 'Agent';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'GenericActor';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about?: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          } | null;
                        }
                      | {
                          __typename?: 'Organization';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | {
                          __typename?: 'User';
                          id: string;
                          actorType: string;
                          url?: string | null;
                          about: {
                            __typename?: 'About';
                            displayName: string;
                            avatar?: {
                              __typename?: 'FileRef';
                              alt?: string | null;
                              file: { __typename?: 'File'; url: string };
                            } | null;
                          };
                        }
                      | null;
                    room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
                    can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
                    content?:
                      | { __typename: 'ContributorsContent' }
                      | {
                          __typename: 'DocumentContent';
                          document: {
                            __typename?: 'Document';
                            id: string;
                            docType: DocType;
                            textSnapshot?: string | null;
                            preview?: { __typename?: 'File'; url: string } | null;
                            about?: { __typename?: 'About'; displayName: string } | null;
                          };
                        }
                      | { __typename: 'EventContent' }
                      | { __typename: 'FormContent' }
                      | { __typename: 'FormResponseContent' }
                      | { __typename: 'GalleryContent' }
                      | {
                          __typename: 'LinkContent';
                          link: {
                            __typename?: 'Link';
                            id: string;
                            uri: string;
                            title?: string | null;
                            description?: string | null;
                            file?: { __typename?: 'File'; id: string; url: string } | null;
                          };
                        }
                      | { __typename: 'PollContent' }
                      | { __typename: 'SpacesContent' }
                      | { __typename: 'TaskBoardContent' }
                      | null;
                  }>;
                }
              | null;
          }
        | { __typename?: 'Room'; id: string; entityType: string }
        | {
            __typename?: 'Space';
            id: string;
            entityType: string;
            url?: string | null;
            status: SpaceStatus;
            isContentPublic: boolean;
            pinned?: boolean | null;
            tags: Array<string>;
            about: {
              __typename?: 'About';
              displayName: string;
              tagline?: string | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            membership?: { __typename?: 'Membership'; roles: Array<string> } | null;
            can: { __typename?: 'SpaceCan'; read: boolean };
            leads?: Array<
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
            > | null;
          }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SpaceVirtualContributorsQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  membersFirst: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceVirtualContributorsQuery = {
  __typename?: 'Query';
  members: {
    __typename?: 'MemberConnection';
    edges: Array<{
      __typename?: 'MemberEdge';
      cursor: string;
      node: {
        __typename?: 'Member';
        id: string;
        actor:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type SpacePageRootsFragment = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        handle: string;
        url?: string | null;
        depth: number;
        status: SpaceStatus;
        createdAt: string;
        tags: Array<string>;
        isContentPublic: boolean;
        settings?: unknown | null;
        videoCallUrl?: string | null;
        memberCount?: number | null;
        guidelines?: unknown | null;
        applicationForm?: unknown | null;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          location?: unknown | null;
          facets: Array<{ __typename?: 'AboutFacet'; namespace: string; name: string; value?: unknown | null }>;
          avatar?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          card?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
        host?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              account?: { __typename?: 'AccountSummary'; id: string } | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | null;
        leads?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
        stages?: Array<{
          __typename?: 'Stage';
          id: string;
          name: string;
          description?: string | null;
          sortOrder: number;
        }> | null;
        membership?: {
          __typename?: 'Membership';
          roles: Array<string>;
          status: MembershipStatus;
          request?: {
            __typename?: 'MembershipRequest';
            id: string;
            state?: RequestState | null;
            direction: RequestDirection;
            message?: string | null;
            createdAt: string;
            createdBy?:
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  url?: string | null;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: {
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    } | null;
                  };
                }
              | null;
          } | null;
        } | null;
        parent?: {
          __typename?: 'Space';
          id: string;
          url?: string | null;
          can: { __typename?: 'SpaceCan'; join: boolean; apply: boolean };
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
        } | null;
        entitlements?: Array<{ __typename?: 'Entitlement'; name: string }> | null;
        can: {
          __typename?: 'SpaceCan';
          read: boolean;
          update: boolean;
          delete: boolean;
          archive: boolean;
          createPost: boolean;
          createSubspace: boolean;
          createDocument: boolean;
          invite: boolean;
          manageMembers: boolean;
          manageTemplates: boolean;
          upload: boolean;
          readActivity: boolean;
          saveAsTemplate: boolean;
          join: boolean;
          apply: boolean;
        };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

type ActorIdentity_Agent_Fragment = {
  __typename?: 'Agent';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type ActorIdentity_GenericActor_Fragment = {
  __typename?: 'GenericActor';
  id: string;
  actorType: string;
  url?: string | null;
  about?: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  } | null;
};

type ActorIdentity_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type ActorIdentity_User_Fragment = {
  __typename?: 'User';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

export type ActorIdentityFragment =
  | ActorIdentity_Agent_Fragment
  | ActorIdentity_GenericActor_Fragment
  | ActorIdentity_Organization_Fragment
  | ActorIdentity_User_Fragment;

type LeadFace_Agent_Fragment = {
  __typename?: 'Agent';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type LeadFace_GenericActor_Fragment = {
  __typename?: 'GenericActor';
  id: string;
  actorType: string;
  url?: string | null;
  about?: {
    __typename?: 'About';
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  } | null;
};

type LeadFace_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type LeadFace_User_Fragment = {
  __typename?: 'User';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

export type LeadFaceFragment =
  | LeadFace_Agent_Fragment
  | LeadFace_GenericActor_Fragment
  | LeadFace_Organization_Fragment
  | LeadFace_User_Fragment;

type ContributorCard_Agent_Fragment = {
  __typename?: 'Agent';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    tagline?: string | null;
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type ContributorCard_GenericActor_Fragment = {
  __typename?: 'GenericActor';
  id: string;
  actorType: string;
  url?: string | null;
  about?: {
    __typename?: 'About';
    tagline?: string | null;
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  } | null;
};

type ContributorCard_Organization_Fragment = {
  __typename?: 'Organization';
  tags: Array<string>;
  associateCount?: number | null;
  website?: string | null;
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    tagline?: string | null;
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

type ContributorCard_User_Fragment = {
  __typename?: 'User';
  skills: Array<string>;
  keywords: Array<string>;
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    tagline?: string | null;
    location?: unknown | null;
    displayName: string;
    avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
  };
};

export type ContributorCardFragment =
  | ContributorCard_Agent_Fragment
  | ContributorCard_GenericActor_Fragment
  | ContributorCard_Organization_Fragment
  | ContributorCard_User_Fragment;

export type SpaceDocumentFragment = {
  __typename?: 'Space';
  id: string;
  handle: string;
  url?: string | null;
  depth: number;
  status: SpaceStatus;
  createdAt: string;
  tags: Array<string>;
  isContentPublic: boolean;
  settings?: unknown | null;
  videoCallUrl?: string | null;
  memberCount?: number | null;
  guidelines?: unknown | null;
  applicationForm?: unknown | null;
  about: {
    __typename?: 'About';
    displayName: string;
    tagline?: string | null;
    description?: string | null;
    location?: unknown | null;
    facets: Array<{ __typename?: 'AboutFacet'; namespace: string; name: string; value?: unknown | null }>;
    avatar?: {
      __typename?: 'FileRef';
      alt?: string | null;
      file: { __typename?: 'File'; id: string; url: string };
    } | null;
    banner?: {
      __typename?: 'FileRef';
      alt?: string | null;
      aspectRatio?: number | null;
      file: { __typename?: 'File'; id: string; url: string };
    } | null;
    card?: {
      __typename?: 'FileRef';
      alt?: string | null;
      file: { __typename?: 'File'; id: string; url: string };
    } | null;
  };
  host?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        account?: { __typename?: 'AccountSummary'; id: string } | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        account?: { __typename?: 'AccountSummary'; id: string } | null;
        about?: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        account?: { __typename?: 'AccountSummary'; id: string } | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        account?: { __typename?: 'AccountSummary'; id: string } | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  leads?: Array<
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          location?: unknown | null;
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
  > | null;
  stages?: Array<{
    __typename?: 'Stage';
    id: string;
    name: string;
    description?: string | null;
    sortOrder: number;
  }> | null;
  membership?: {
    __typename?: 'Membership';
    roles: Array<string>;
    status: MembershipStatus;
    request?: {
      __typename?: 'MembershipRequest';
      id: string;
      state?: RequestState | null;
      direction: RequestDirection;
      message?: string | null;
      createdAt: string;
      createdBy?:
        | {
            __typename?: 'Agent';
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              avatar?: {
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; url: string };
              } | null;
            };
          }
        | {
            __typename?: 'GenericActor';
            id: string;
            actorType: string;
            url?: string | null;
            about?: {
              __typename?: 'About';
              displayName: string;
              avatar?: {
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; url: string };
              } | null;
            } | null;
          }
        | {
            __typename?: 'Organization';
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              avatar?: {
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; url: string };
              } | null;
            };
          }
        | {
            __typename?: 'User';
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              avatar?: {
                __typename?: 'FileRef';
                alt?: string | null;
                file: { __typename?: 'File'; url: string };
              } | null;
            };
          }
        | null;
    } | null;
  } | null;
  parent?: {
    __typename?: 'Space';
    id: string;
    url?: string | null;
    can: { __typename?: 'SpaceCan'; join: boolean; apply: boolean };
    membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
  } | null;
  entitlements?: Array<{ __typename?: 'Entitlement'; name: string }> | null;
  can: {
    __typename?: 'SpaceCan';
    read: boolean;
    update: boolean;
    delete: boolean;
    archive: boolean;
    createPost: boolean;
    createSubspace: boolean;
    createDocument: boolean;
    invite: boolean;
    manageMembers: boolean;
    manageTemplates: boolean;
    upload: boolean;
    readActivity: boolean;
    saveAsTemplate: boolean;
    join: boolean;
    apply: boolean;
  };
};

export type ResponseCardFragment = {
  __typename?: 'Post';
  id: string;
  url?: string | null;
  contentKind: string;
  createdAt: string;
  tags: Array<string>;
  sortOrder: number;
  stage?: { __typename?: 'Stage'; id: string } | null;
  about: { __typename?: 'About'; displayName: string; description?: string | null };
  links: Array<{
    __typename?: 'Link';
    id: string;
    title?: string | null;
    description?: string | null;
    uri: string;
    sortOrder: number;
    file?: { __typename?: 'File'; id: string; url: string } | null;
  }>;
  author?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
  can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
  content?:
    | { __typename: 'ContributorsContent' }
    | {
        __typename: 'DocumentContent';
        document: {
          __typename?: 'Document';
          id: string;
          docType: DocType;
          textSnapshot?: string | null;
          preview?: { __typename?: 'File'; url: string } | null;
          about?: { __typename?: 'About'; displayName: string } | null;
        };
      }
    | { __typename: 'EventContent' }
    | { __typename: 'FormContent' }
    | { __typename: 'FormResponseContent' }
    | { __typename: 'GalleryContent' }
    | {
        __typename: 'LinkContent';
        link: {
          __typename?: 'Link';
          id: string;
          uri: string;
          title?: string | null;
          description?: string | null;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        };
      }
    | { __typename: 'PollContent' }
    | { __typename: 'SpacesContent' }
    | { __typename: 'TaskBoardContent' }
    | null;
};

export type PostBodyFragment = {
  __typename?: 'Post';
  id: string;
  url?: string | null;
  handle: string;
  sortOrder: number;
  contentKind: string;
  createdAt: string;
  publishedAt?: string | null;
  tags: Array<string>;
  commentsEnabled: boolean;
  responseKind?: string | null;
  responsePolicy?: unknown | null;
  responseDefaults?: unknown | null;
  responseCount: number;
  postStatus: PostStatus;
  stage?: { __typename?: 'Stage'; id: string } | null;
  about: { __typename?: 'About'; displayName: string; description?: string | null };
  links: Array<{
    __typename?: 'Link';
    id: string;
    title?: string | null;
    description?: string | null;
    uri: string;
    sortOrder: number;
    file?: { __typename?: 'File'; id: string; url: string } | null;
  }>;
  author?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  publishedBy?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
  can: {
    __typename?: 'PostCan';
    read: boolean;
    update: boolean;
    delete: boolean;
    respond: boolean;
    comment: boolean;
    move: boolean;
    moveTask: boolean;
    manageColumns: boolean;
  };
  content?:
    | {
        __typename: 'ContributorsContent';
        settings?: unknown | null;
        counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
        contributors?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              tags: Array<string>;
              associateCount?: number | null;
              website?: string | null;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              skills: Array<string>;
              keywords: Array<string>;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
      }
    | {
        __typename: 'DocumentContent';
        document: {
          __typename?: 'Document';
          id: string;
          docType: DocType;
          url?: string | null;
          textSnapshot?: string | null;
          preview?: { __typename?: 'File'; url: string } | null;
          about?: { __typename?: 'About'; displayName: string } | null;
          can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
        };
      }
    | {
        __typename: 'EventContent';
        startsAt?: string | null;
        endsAt?: string | null;
        startsOn?: string | null;
        endsOn?: string | null;
        allDay: boolean;
        timezone?: string | null;
        location?: string | null;
        type?: string | null;
        rollUp: boolean;
        calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
      }
    | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
    | { __typename: 'FormResponseContent'; answers: unknown }
    | {
        __typename: 'GalleryContent';
        images: Array<{
          __typename?: 'FileRef';
          alt?: string | null;
          file: { __typename?: 'File'; id: string; url: string; mime: string };
        }>;
      }
    | {
        __typename: 'LinkContent';
        link: {
          __typename?: 'Link';
          id: string;
          uri: string;
          title?: string | null;
          description?: string | null;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        };
      }
    | {
        __typename: 'PollContent';
        question: string;
        status: PollStatus;
        deadline?: string | null;
        settings?: unknown | null;
        totalVotes?: number | null;
        myVotes: Array<string>;
        options: Array<{
          __typename?: 'PollOption';
          id: string;
          value: string;
          sortOrder: number;
          votes?: number | null;
          percentage?: number | null;
          mine: boolean;
          voters?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'SpacesContent';
        settings?: unknown | null;
        hasHiddenSpaces: boolean;
        spaces: Array<{
          __typename?: 'Space';
          id: string;
          url?: string | null;
          pinned?: boolean | null;
          status: SpaceStatus;
          isContentPublic: boolean;
          tags: Array<string>;
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            description?: string | null;
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
          leads?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'TaskBoardContent';
        columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
        tasks: Array<{
          __typename?: 'Post';
          id: string;
          url?: string | null;
          contentKind: string;
          createdAt: string;
          tags: Array<string>;
          sortOrder: number;
          stage?: { __typename?: 'Stage'; id: string } | null;
          about: { __typename?: 'About'; displayName: string; description?: string | null };
          links: Array<{
            __typename?: 'Link';
            id: string;
            title?: string | null;
            description?: string | null;
            uri: string;
            sortOrder: number;
            file?: { __typename?: 'File'; id: string; url: string } | null;
          }>;
          author?:
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | null;
          room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
          can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
          content?:
            | { __typename: 'ContributorsContent' }
            | {
                __typename: 'DocumentContent';
                document: {
                  __typename?: 'Document';
                  id: string;
                  docType: DocType;
                  textSnapshot?: string | null;
                  preview?: { __typename?: 'File'; url: string } | null;
                  about?: { __typename?: 'About'; displayName: string } | null;
                };
              }
            | { __typename: 'EventContent' }
            | { __typename: 'FormContent' }
            | { __typename: 'FormResponseContent' }
            | { __typename: 'GalleryContent' }
            | {
                __typename: 'LinkContent';
                link: {
                  __typename?: 'Link';
                  id: string;
                  uri: string;
                  title?: string | null;
                  description?: string | null;
                  file?: { __typename?: 'File'; id: string; url: string } | null;
                };
              }
            | { __typename: 'PollContent' }
            | { __typename: 'SpacesContent' }
            | { __typename: 'TaskBoardContent' }
            | null;
        }>;
      }
    | null;
};

export type PostCardFragment = {
  __typename?: 'Post';
  id: string;
  url?: string | null;
  handle: string;
  sortOrder: number;
  contentKind: string;
  createdAt: string;
  publishedAt?: string | null;
  tags: Array<string>;
  commentsEnabled: boolean;
  responseKind?: string | null;
  responsePolicy?: unknown | null;
  responseDefaults?: unknown | null;
  responseCount: number;
  postStatus: PostStatus;
  parentPost?: { __typename?: 'Post'; id: string } | null;
  stage?: { __typename?: 'Stage'; id: string } | null;
  about: { __typename?: 'About'; displayName: string; description?: string | null };
  links: Array<{
    __typename?: 'Link';
    id: string;
    title?: string | null;
    description?: string | null;
    uri: string;
    sortOrder: number;
    file?: { __typename?: 'File'; id: string; url: string } | null;
  }>;
  author?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  publishedBy?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
  can: {
    __typename?: 'PostCan';
    read: boolean;
    update: boolean;
    delete: boolean;
    respond: boolean;
    comment: boolean;
    move: boolean;
    moveTask: boolean;
    manageColumns: boolean;
  };
  content?:
    | {
        __typename: 'ContributorsContent';
        settings?: unknown | null;
        counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
        contributors?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              tags: Array<string>;
              associateCount?: number | null;
              website?: string | null;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              skills: Array<string>;
              keywords: Array<string>;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
      }
    | {
        __typename: 'DocumentContent';
        document: {
          __typename?: 'Document';
          id: string;
          docType: DocType;
          url?: string | null;
          textSnapshot?: string | null;
          preview?: { __typename?: 'File'; url: string } | null;
          about?: { __typename?: 'About'; displayName: string } | null;
          can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
        };
      }
    | {
        __typename: 'EventContent';
        startsAt?: string | null;
        endsAt?: string | null;
        startsOn?: string | null;
        endsOn?: string | null;
        allDay: boolean;
        timezone?: string | null;
        location?: string | null;
        type?: string | null;
        rollUp: boolean;
        calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
      }
    | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
    | { __typename: 'FormResponseContent'; answers: unknown }
    | {
        __typename: 'GalleryContent';
        images: Array<{
          __typename?: 'FileRef';
          alt?: string | null;
          file: { __typename?: 'File'; id: string; url: string; mime: string };
        }>;
      }
    | {
        __typename: 'LinkContent';
        link: {
          __typename?: 'Link';
          id: string;
          uri: string;
          title?: string | null;
          description?: string | null;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        };
      }
    | {
        __typename: 'PollContent';
        question: string;
        status: PollStatus;
        deadline?: string | null;
        settings?: unknown | null;
        totalVotes?: number | null;
        myVotes: Array<string>;
        options: Array<{
          __typename?: 'PollOption';
          id: string;
          value: string;
          sortOrder: number;
          votes?: number | null;
          percentage?: number | null;
          mine: boolean;
          voters?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'SpacesContent';
        settings?: unknown | null;
        hasHiddenSpaces: boolean;
        spaces: Array<{
          __typename?: 'Space';
          id: string;
          url?: string | null;
          pinned?: boolean | null;
          status: SpaceStatus;
          isContentPublic: boolean;
          tags: Array<string>;
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            description?: string | null;
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
          leads?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'TaskBoardContent';
        columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
        tasks: Array<{
          __typename?: 'Post';
          id: string;
          url?: string | null;
          contentKind: string;
          createdAt: string;
          tags: Array<string>;
          sortOrder: number;
          stage?: { __typename?: 'Stage'; id: string } | null;
          about: { __typename?: 'About'; displayName: string; description?: string | null };
          links: Array<{
            __typename?: 'Link';
            id: string;
            title?: string | null;
            description?: string | null;
            uri: string;
            sortOrder: number;
            file?: { __typename?: 'File'; id: string; url: string } | null;
          }>;
          author?:
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | null;
          room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
          can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
          content?:
            | { __typename: 'ContributorsContent' }
            | {
                __typename: 'DocumentContent';
                document: {
                  __typename?: 'Document';
                  id: string;
                  docType: DocType;
                  textSnapshot?: string | null;
                  preview?: { __typename?: 'File'; url: string } | null;
                  about?: { __typename?: 'About'; displayName: string } | null;
                };
              }
            | { __typename: 'EventContent' }
            | { __typename: 'FormContent' }
            | { __typename: 'FormResponseContent' }
            | { __typename: 'GalleryContent' }
            | {
                __typename: 'LinkContent';
                link: {
                  __typename?: 'Link';
                  id: string;
                  uri: string;
                  title?: string | null;
                  description?: string | null;
                  file?: { __typename?: 'File'; id: string; url: string } | null;
                };
              }
            | { __typename: 'PollContent' }
            | { __typename: 'SpacesContent' }
            | { __typename: 'TaskBoardContent' }
            | null;
        }>;
      }
    | null;
};

export type PostDetailFragment = {
  __typename?: 'Post';
  id: string;
  url?: string | null;
  handle: string;
  sortOrder: number;
  contentKind: string;
  createdAt: string;
  publishedAt?: string | null;
  tags: Array<string>;
  commentsEnabled: boolean;
  responseKind?: string | null;
  responsePolicy?: unknown | null;
  responseDefaults?: unknown | null;
  responseCount: number;
  postStatus: PostStatus;
  parentPost?: { __typename?: 'Post'; id: string; url?: string | null } | null;
  stage?: { __typename?: 'Stage'; id: string } | null;
  about: { __typename?: 'About'; displayName: string; description?: string | null };
  links: Array<{
    __typename?: 'Link';
    id: string;
    title?: string | null;
    description?: string | null;
    uri: string;
    sortOrder: number;
    file?: { __typename?: 'File'; id: string; url: string } | null;
  }>;
  author?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  publishedBy?:
    | {
        __typename?: 'Agent';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'GenericActor';
        id: string;
        actorType: string;
        url?: string | null;
        about?: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        } | null;
      }
    | {
        __typename?: 'Organization';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | {
        __typename?: 'User';
        id: string;
        actorType: string;
        url?: string | null;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; alt?: string | null; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | null;
  room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
  can: {
    __typename?: 'PostCan';
    read: boolean;
    update: boolean;
    delete: boolean;
    respond: boolean;
    comment: boolean;
    move: boolean;
    moveTask: boolean;
    manageColumns: boolean;
  };
  content?:
    | {
        __typename: 'ContributorsContent';
        settings?: unknown | null;
        counts?: Array<{ __typename?: 'TypeCount'; type: string; count: number }> | null;
        contributors?: Array<
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              tags: Array<string>;
              associateCount?: number | null;
              website?: string | null;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
          | {
              __typename?: 'User';
              skills: Array<string>;
              keywords: Array<string>;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                tagline?: string | null;
                location?: unknown | null;
                displayName: string;
                avatar?: {
                  __typename?: 'FileRef';
                  alt?: string | null;
                  file: { __typename?: 'File'; url: string };
                } | null;
              };
            }
        > | null;
      }
    | {
        __typename: 'DocumentContent';
        document: {
          __typename?: 'Document';
          id: string;
          docType: DocType;
          url?: string | null;
          textSnapshot?: string | null;
          preview?: { __typename?: 'File'; url: string } | null;
          about?: { __typename?: 'About'; displayName: string } | null;
          can: { __typename?: 'DocumentCan'; read: boolean; edit: boolean };
        };
      }
    | {
        __typename: 'EventContent';
        startsAt?: string | null;
        endsAt?: string | null;
        startsOn?: string | null;
        endsOn?: string | null;
        allDay: boolean;
        timezone?: string | null;
        location?: string | null;
        type?: string | null;
        rollUp: boolean;
        calendarLinks: Array<{ __typename?: 'CalendarLink'; provider: string; url: string }>;
      }
    | { __typename: 'FormContent'; questions: unknown; responseCount: number; myResponseCount: number }
    | { __typename: 'FormResponseContent'; answers: unknown }
    | {
        __typename: 'GalleryContent';
        images: Array<{
          __typename?: 'FileRef';
          alt?: string | null;
          file: { __typename?: 'File'; id: string; url: string; mime: string };
        }>;
      }
    | {
        __typename: 'LinkContent';
        link: {
          __typename?: 'Link';
          id: string;
          uri: string;
          title?: string | null;
          description?: string | null;
          file?: { __typename?: 'File'; id: string; url: string } | null;
        };
      }
    | {
        __typename: 'PollContent';
        question: string;
        status: PollStatus;
        deadline?: string | null;
        settings?: unknown | null;
        totalVotes?: number | null;
        myVotes: Array<string>;
        options: Array<{
          __typename?: 'PollOption';
          id: string;
          value: string;
          sortOrder: number;
          votes?: number | null;
          percentage?: number | null;
          mine: boolean;
          voters?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'SpacesContent';
        settings?: unknown | null;
        hasHiddenSpaces: boolean;
        spaces: Array<{
          __typename?: 'Space';
          id: string;
          url?: string | null;
          pinned?: boolean | null;
          status: SpaceStatus;
          isContentPublic: boolean;
          tags: Array<string>;
          membership?: { __typename?: 'Membership'; status: MembershipStatus } | null;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            description?: string | null;
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
          leads?: Array<
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
          > | null;
        }>;
      }
    | {
        __typename: 'TaskBoardContent';
        columns: Array<{ __typename?: 'Stage'; id: string; name: string; sortOrder: number }>;
        tasks: Array<{
          __typename?: 'Post';
          id: string;
          url?: string | null;
          contentKind: string;
          createdAt: string;
          tags: Array<string>;
          sortOrder: number;
          stage?: { __typename?: 'Stage'; id: string } | null;
          about: { __typename?: 'About'; displayName: string; description?: string | null };
          links: Array<{
            __typename?: 'Link';
            id: string;
            title?: string | null;
            description?: string | null;
            uri: string;
            sortOrder: number;
            file?: { __typename?: 'File'; id: string; url: string } | null;
          }>;
          author?:
            | {
                __typename?: 'Agent';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'GenericActor';
                id: string;
                actorType: string;
                url?: string | null;
                about?: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                } | null;
              }
            | {
                __typename?: 'Organization';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | {
                __typename?: 'User';
                id: string;
                actorType: string;
                url?: string | null;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  avatar?: {
                    __typename?: 'FileRef';
                    alt?: string | null;
                    file: { __typename?: 'File'; url: string };
                  } | null;
                };
              }
            | null;
          room?: { __typename?: 'Room'; id: string; messageCount: number } | null;
          can: { __typename?: 'PostCan'; update: boolean; delete: boolean; moveTask: boolean };
          content?:
            | { __typename: 'ContributorsContent' }
            | {
                __typename: 'DocumentContent';
                document: {
                  __typename?: 'Document';
                  id: string;
                  docType: DocType;
                  textSnapshot?: string | null;
                  preview?: { __typename?: 'File'; url: string } | null;
                  about?: { __typename?: 'About'; displayName: string } | null;
                };
              }
            | { __typename: 'EventContent' }
            | { __typename: 'FormContent' }
            | { __typename: 'FormResponseContent' }
            | { __typename: 'GalleryContent' }
            | {
                __typename: 'LinkContent';
                link: {
                  __typename?: 'Link';
                  id: string;
                  uri: string;
                  title?: string | null;
                  description?: string | null;
                  file?: { __typename?: 'File'; id: string; url: string } | null;
                };
              }
            | { __typename: 'PollContent' }
            | { __typename: 'SpacesContent' }
            | { __typename: 'TaskBoardContent' }
            | null;
        }>;
      }
    | null;
};

type SpaceCommunityActor_Agent_Fragment = {
  __typename?: 'Agent';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
};

type SpaceCommunityActor_GenericActor_Fragment = {
  __typename?: 'GenericActor';
  id: string;
  actorType: string;
  url?: string | null;
  about?: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  } | null;
};

type SpaceCommunityActor_Organization_Fragment = {
  __typename?: 'Organization';
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
};

type SpaceCommunityActor_User_Fragment = {
  __typename?: 'User';
  firstName?: string | null;
  email?: string | null;
  id: string;
  actorType: string;
  url?: string | null;
  about: {
    __typename?: 'About';
    displayName: string;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
};

export type SpaceCommunityActorFragment =
  | SpaceCommunityActor_Agent_Fragment
  | SpaceCommunityActor_GenericActor_Fragment
  | SpaceCommunityActor_Organization_Fragment
  | SpaceCommunityActor_User_Fragment;

export type SpaceCommunityAdminQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type SpaceCommunityAdminQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        can: { __typename?: 'SpaceCan'; invite: boolean; manageMembers: boolean };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
  rolePolicies: Array<{
    __typename?: 'RolePolicy';
    role: string;
    actorType: string;
    minHolders?: number | null;
    maxHolders?: number | null;
    holders: number;
  }>;
};

export type SpaceCommunityMembersQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceCommunityMembersQuery = {
  __typename?: 'Query';
  members: {
    __typename?: 'MemberConnection';
    edges: Array<{
      __typename?: 'MemberEdge';
      node: {
        __typename?: 'Member';
        roles: Array<string>;
        actor:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              url?: string | null;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'User';
              firstName?: string | null;
              email?: string | null;
              id: string;
              actorType: string;
              url?: string | null;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type SpaceCommunityInviteTargetQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type SpaceCommunityInviteTargetQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string; about: { __typename?: 'About'; displayName: string } }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceCommunityCandidatesQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  entry: CandidateEntry;
  actorType?: InputMaybe<Scalars['String']['input']>;
  terms?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceCommunityCandidatesQuery = {
  __typename?: 'Query';
  candidates: {
    __typename?: 'ActorConnection';
    edges: Array<{
      __typename?: 'ActorEdge';
      node:
        | {
            __typename?: 'Agent';
            keywords: Array<string>;
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          }
        | {
            __typename?: 'GenericActor';
            id: string;
            actorType: string;
            url?: string | null;
            about?: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            } | null;
          }
        | {
            __typename?: 'Organization';
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          }
        | {
            __typename?: 'User';
            id: string;
            actorType: string;
            url?: string | null;
            about: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type SpaceCommunityVirtualContributorPickerQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type SpaceCommunityVirtualContributorPickerQuery = {
  __typename?: 'Query';
  candidates: {
    __typename?: 'ActorConnection';
    edges: Array<{
      __typename?: 'ActorEdge';
      node:
        | { __typename?: 'Agent'; id: string }
        | { __typename?: 'GenericActor'; id: string }
        | { __typename?: 'Organization'; id: string }
        | { __typename?: 'User'; id: string };
    }>;
  };
};

export type SetSpaceCommunityRolesMutationVariables = Exact<{
  space: Scalars['UUID']['input'];
  actor: Scalars['UUID']['input'];
  roles: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;

export type SetSpaceCommunityRolesMutation = {
  __typename?: 'Mutation';
  setRoles: {
    __typename?: 'MembershipResult';
    node?:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | { __typename?: 'Space'; id: string }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string }
      | null;
  };
};

export type InviteToSpaceCommunityMutationVariables = Exact<{
  space: Scalars['UUID']['input'];
  input: InviteInput;
}>;

export type InviteToSpaceCommunityMutation = {
  __typename?: 'Mutation';
  invite: Array<{
    __typename?: 'InviteOutcome';
    actor?: string | null;
    email?: string | null;
    outcome: InviteOutcomeKind;
    noOrganizationAdmin: boolean;
    request?: { __typename?: 'MembershipRequest'; id: string } | null;
  }>;
};

export type V2DashboardSpaceCardFragment = {
  __typename?: 'Space';
  id: string;
  url?: string | null;
  depth: number;
  isContentPublic: boolean;
  about: {
    __typename?: 'About';
    displayName: string;
    tagline?: string | null;
    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
    card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
  };
};

export type V2DashboardMembershipProbeQueryVariables = Exact<{ [key: string]: never }>;

export type V2DashboardMembershipProbeQuery = {
  __typename?: 'Query';
  spaces: {
    __typename?: 'SpaceConnection';
    edges: Array<{ __typename?: 'SpaceEdge'; node: { __typename?: 'Space'; id: string } }>;
  };
};

export type V2DashboardRecentSpacesQueryVariables = Exact<{
  first: Scalars['Int']['input'];
}>;

export type V2DashboardRecentSpacesQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    recentSpaces: Array<{
      __typename?: 'RecentSpace';
      lastParticipatedAt: string;
      space: {
        __typename?: 'Space';
        id: string;
        url?: string | null;
        depth: number;
        isContentPublic: boolean;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        };
      };
    }>;
    homeSpace?: {
      __typename?: 'Space';
      id: string;
      url?: string | null;
      depth: number;
      isContentPublic: boolean;
      about: {
        __typename?: 'About';
        displayName: string;
        tagline?: string | null;
        avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
      };
    } | null;
  };
};

export type V2DashboardMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type V2DashboardMembershipsQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    actor?:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'Organization'; id: string }
      | {
          __typename?: 'User';
          id: string;
          memberships: Array<{
            __typename?: 'SpaceMembership';
            roles: Array<string>;
            space: {
              __typename?: 'Space';
              activityScore?: number | null;
              id: string;
              url?: string | null;
              depth: number;
              isContentPublic: boolean;
              parent?: { __typename?: 'Space'; id: string } | null;
              about: {
                __typename?: 'About';
                displayName: string;
                tagline?: string | null;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
                card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
              };
            };
          }>;
        }
      | null;
  };
};

export type V2DashboardMostActiveSpacesQueryVariables = Exact<{
  days: Scalars['Int']['input'];
  first: Scalars['Int']['input'];
}>;

export type V2DashboardMostActiveSpacesQuery = {
  __typename?: 'Query';
  spaces: {
    __typename?: 'SpaceConnection';
    edges: Array<{
      __typename?: 'SpaceEdge';
      node: {
        __typename?: 'Space';
        id: string;
        url?: string | null;
        depth: number;
        isContentPublic: boolean;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
        };
      };
    }>;
  };
};

export type V2DashboardHostedResourcesQueryVariables = Exact<{ [key: string]: never }>;

export type V2DashboardHostedResourcesQuery = {
  __typename?: 'Query';
  viewer: {
    __typename?: 'Viewer';
    id: string;
    account?: {
      __typename?: 'AccountSummary';
      id: string;
      canCreate: Array<{
        __typename?: 'CanCreate';
        kind: string;
        allowed: boolean;
        reason?: CanCreateReason | null;
        byEntitlement: Array<{ __typename?: 'EntitlementAvailability'; name: string; allowed: boolean }>;
      }>;
      hosted: {
        __typename?: 'HostedResources';
        spaces: Array<{
          __typename?: 'Space';
          activityScore?: number | null;
          id: string;
          url?: string | null;
          depth: number;
          isContentPublic: boolean;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          };
        }>;
        agents: Array<{
          __typename?: 'Agent';
          id: string;
          url?: string | null;
          about: {
            __typename?: 'About';
            displayName: string;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          };
        }>;
        packs: Array<{
          __typename?: 'Space';
          id: string;
          url?: string | null;
          about: {
            __typename?: 'About';
            displayName: string;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          };
        }>;
        homepages: Array<{
          __typename?: 'Space';
          id: string;
          url?: string | null;
          about: {
            __typename?: 'About';
            displayName: string;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          };
        }>;
      };
    } | null;
  };
};

export type V2DashboardFeedSpacesQueryVariables = Exact<{ [key: string]: never }>;

export type V2DashboardFeedSpacesQuery = {
  __typename?: 'Query';
  spaces: {
    __typename?: 'SpaceConnection';
    edges: Array<{
      __typename?: 'SpaceEdge';
      node: { __typename?: 'Space'; id: string; about: { __typename?: 'About'; displayName: string } };
    }>;
  };
};

export type V2DashboardActivityQueryVariables = Exact<{
  space?: InputMaybe<Scalars['UUID']['input']>;
  mine: Scalars['Boolean']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type V2DashboardActivityQuery = {
  __typename?: 'Query';
  activity: {
    __typename?: 'ActivityConnection';
    edges: Array<{
      __typename?: 'ActivityEdge';
      cursor: string;
      node: {
        __typename?: 'Activity';
        id: string;
        type: string;
        createdAt: string;
        actor?:
          | {
              __typename?: 'Agent';
              id: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
              };
            }
          | null;
        space?: {
          __typename?: 'Space';
          id: string;
          url?: string | null;
          about: { __typename?: 'About'; displayName: string };
        } | null;
        subject?:
          | {
              __typename?: 'Agent';
              url?: string | null;
              id: string;
              entityType: string;
              actorAbout: { __typename?: 'About'; displayName: string };
            }
          | {
              __typename?: 'Document';
              url?: string | null;
              id: string;
              entityType: string;
              documentAbout?: { __typename?: 'About'; displayName: string } | null;
            }
          | {
              __typename?: 'GenericActor';
              url?: string | null;
              id: string;
              entityType: string;
              actorAbout?: { __typename?: 'About'; displayName: string } | null;
            }
          | { __typename?: 'InnovationPack'; id: string; entityType: string }
          | { __typename?: 'Member'; id: string; entityType: string }
          | {
              __typename?: 'Organization';
              url?: string | null;
              id: string;
              entityType: string;
              actorAbout: { __typename?: 'About'; displayName: string };
            }
          | {
              __typename?: 'Post';
              url?: string | null;
              id: string;
              entityType: string;
              about: { __typename?: 'About'; displayName: string };
              parentPost?: {
                __typename?: 'Post';
                id: string;
                url?: string | null;
                about: { __typename?: 'About'; displayName: string };
              } | null;
            }
          | { __typename?: 'Room'; id: string; entityType: string }
          | {
              __typename?: 'Space';
              url?: string | null;
              id: string;
              entityType: string;
              about: { __typename?: 'About'; displayName: string };
            }
          | { __typename?: 'Template'; id: string; entityType: string }
          | {
              __typename?: 'User';
              url?: string | null;
              id: string;
              entityType: string;
              actorAbout: { __typename?: 'About'; displayName: string };
            }
          | null;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type V2DashboardSaveUserSettingsMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  value: Scalars['JSON']['input'];
}>;

export type V2DashboardSaveUserSettingsMutation = {
  __typename?: 'Mutation';
  setSettings:
    | { __typename?: 'Agent'; id: string; settings?: unknown | null }
    | { __typename?: 'GenericActor'; id: string; settings?: unknown | null }
    | { __typename?: 'Organization'; id: string; settings?: unknown | null }
    | { __typename?: 'User'; id: string; settings?: unknown | null };
};

export type V2DashboardWelcomeSpaceQueryVariables = Exact<{
  url: Scalars['String']['input'];
}>;

export type V2DashboardWelcomeSpaceQuery = {
  __typename?: 'Query';
  resolve: {
    __typename?: 'ResolveResult';
    state: ResolveState;
    remainder: Array<string>;
    node?:
      | { __typename?: 'Agent'; id: string; entityType: string }
      | { __typename?: 'Document'; id: string; entityType: string }
      | { __typename?: 'GenericActor'; id: string; entityType: string }
      | { __typename?: 'InnovationPack'; id: string; entityType: string }
      | { __typename?: 'Member'; id: string; entityType: string }
      | { __typename?: 'Organization'; id: string; entityType: string }
      | { __typename?: 'Post'; id: string; entityType: string }
      | { __typename?: 'Room'; id: string; entityType: string }
      | {
          __typename?: 'Space';
          id: string;
          entityType: string;
          url?: string | null;
          depth: number;
          isContentPublic: boolean;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
          };
        }
      | { __typename?: 'Template'; id: string; entityType: string }
      | { __typename?: 'User'; id: string; entityType: string }
      | null;
  };
};

export type V2HomepageQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type V2HomepageQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | {
        __typename?: 'Space';
        kind: SpaceKind;
        url?: string | null;
        settings?: unknown | null;
        subdomain?: string | null;
        id: string;
        can: { __typename?: 'SpaceCan'; update: boolean };
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
        curated?: Array<{
          __typename?: 'CuratedItem';
          role: string;
          sortOrder: number;
          node:
            | {
                __typename?: 'Agent';
                actorType: string;
                url?: string | null;
                id: string;
                entityType: string;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  tagline?: string | null;
                  avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
                };
              }
            | { __typename?: 'Document'; id: string; entityType: string }
            | { __typename?: 'GenericActor'; id: string; entityType: string }
            | { __typename?: 'InnovationPack'; id: string; entityType: string }
            | { __typename?: 'Member'; id: string; entityType: string }
            | { __typename?: 'Organization'; id: string; entityType: string }
            | { __typename?: 'Post'; id: string; entityType: string }
            | { __typename?: 'Room'; id: string; entityType: string }
            | {
                __typename?: 'Space';
                kind: SpaceKind;
                url?: string | null;
                tags: Array<string>;
                templateCount?: number | null;
                id: string;
                entityType: string;
                about: {
                  __typename?: 'About';
                  displayName: string;
                  description?: string | null;
                  avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; id: string; url: string } } | null;
                };
                host?:
                  | {
                      __typename?: 'Agent';
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          file: { __typename?: 'File'; id: string; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'GenericActor';
                      url?: string | null;
                      about?: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          file: { __typename?: 'File'; id: string; url: string };
                        } | null;
                      } | null;
                    }
                  | {
                      __typename?: 'Organization';
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          file: { __typename?: 'File'; id: string; url: string };
                        } | null;
                      };
                    }
                  | {
                      __typename?: 'User';
                      url?: string | null;
                      about: {
                        __typename?: 'About';
                        displayName: string;
                        avatar?: {
                          __typename?: 'FileRef';
                          file: { __typename?: 'File'; id: string; url: string };
                        } | null;
                      };
                    }
                  | null;
              }
            | { __typename?: 'Template'; id: string; entityType: string }
            | { __typename?: 'User'; id: string; entityType: string };
        }> | null;
      }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string }
    | null;
};

export type ExplorerRootSpacesQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type ExplorerRootSpacesQuery = {
  __typename?: 'Query';
  spaces: {
    __typename?: 'SpaceConnection';
    edges: Array<{
      __typename?: 'SpaceEdge';
      node: {
        __typename?: 'Space';
        id: string;
        depth: number;
        status: SpaceStatus;
        url?: string | null;
        about: { __typename?: 'About'; displayName: string; tagline?: string | null };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type ExplorerSpaceTreeQueryVariables = Exact<{
  platform: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type ExplorerSpaceTreeQuery = {
  __typename?: 'Query';
  subtree?: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent'; id: string }
        | { __typename?: 'Document'; id: string }
        | { __typename?: 'GenericActor'; id: string }
        | { __typename?: 'InnovationPack'; id: string }
        | { __typename?: 'Member'; id: string }
        | { __typename?: 'Organization'; id: string }
        | { __typename?: 'Post'; id: string }
        | { __typename?: 'Room'; id: string }
        | {
            __typename?: 'Space';
            depth: number;
            id: string;
            url?: string | null;
            status: SpaceStatus;
            isContentPublic: boolean;
            pinned?: boolean | null;
            tags: Array<string>;
            parent?: { __typename?: 'Space'; id: string } | null;
            about: {
              __typename?: 'About';
              displayName: string;
              tagline?: string | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            membership?: { __typename?: 'Membership'; roles: Array<string> } | null;
            can: { __typename?: 'SpaceCan'; read: boolean };
            leads?: Array<
              | {
                  __typename?: 'Agent';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  actorType: string;
                  about?: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  } | null;
                }
              | {
                  __typename?: 'Organization';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | {
                  __typename?: 'User';
                  id: string;
                  actorType: string;
                  about: {
                    __typename?: 'About';
                    displayName: string;
                    avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
            > | null;
          }
        | { __typename?: 'Template'; id: string }
        | { __typename?: 'User'; id: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SettingsPostTemplateCardFragment = {
  __typename?: 'Template';
  id: string;
  kind: TemplateKind;
  url?: string | null;
  tags: Array<string>;
  about: {
    __typename?: 'About';
    displayName: string;
    description?: string | null;
    card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
};

export type SettingsPostTemplatesQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type SettingsPostTemplatesQuery = {
  __typename?: 'Query';
  templates: Array<{
    __typename?: 'Template';
    id: string;
    kind: TemplateKind;
    url?: string | null;
    tags: Array<string>;
    about: {
      __typename?: 'About';
      displayName: string;
      description?: string | null;
      card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
    };
  }>;
};

export type SettingsPostTemplateLibraryQueryVariables = Exact<{
  scope?: InputMaybe<Scalars['UUID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SettingsPostTemplateLibraryQuery = {
  __typename?: 'Query';
  library: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent' }
        | { __typename?: 'Document' }
        | { __typename?: 'GenericActor' }
        | { __typename?: 'InnovationPack' }
        | { __typename?: 'Member' }
        | { __typename?: 'Organization' }
        | { __typename?: 'Post' }
        | { __typename?: 'Room' }
        | { __typename?: 'Space' }
        | {
            __typename?: 'Template';
            id: string;
            kind: TemplateKind;
            url?: string | null;
            tags: Array<string>;
            scope:
              | { __typename?: 'Agent'; id: string }
              | { __typename?: 'Document'; id: string }
              | { __typename?: 'GenericActor'; id: string }
              | { __typename?: 'InnovationPack'; id: string; about: { __typename?: 'About'; displayName: string } }
              | { __typename?: 'Member'; id: string }
              | { __typename?: 'Organization'; id: string }
              | { __typename?: 'Post'; id: string }
              | { __typename?: 'Room'; id: string }
              | { __typename?: 'Space'; id: string }
              | { __typename?: 'Template'; id: string }
              | { __typename?: 'User'; id: string };
            provider?:
              | { __typename?: 'Agent'; id: string; about: { __typename?: 'About'; displayName: string } }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  about?: { __typename?: 'About'; displayName: string } | null;
                }
              | { __typename?: 'Organization'; id: string; about: { __typename?: 'About'; displayName: string } }
              | { __typename?: 'User'; id: string; about: { __typename?: 'About'; displayName: string } }
              | null;
            about: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          }
        | { __typename?: 'User' };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type SettingsPostTemplateContentQueryVariables = Exact<{
  template: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SettingsPostTemplateContentQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | { __typename?: 'Space'; id: string }
    | {
        __typename?: 'Template';
        kind: TemplateKind;
        id: string;
        body?:
          | { __typename?: 'Agent'; id: string }
          | { __typename?: 'Document'; id: string }
          | { __typename?: 'GenericActor'; id: string }
          | { __typename?: 'InnovationPack'; id: string }
          | { __typename?: 'Member'; id: string }
          | { __typename?: 'Organization'; id: string }
          | {
              __typename?: 'Post';
              contentKind: string;
              responseKind?: string | null;
              responsePolicy?: unknown | null;
              responseDefaults?: unknown | null;
              commentsEnabled: boolean;
              id: string;
              about: { __typename?: 'About'; displayName: string; description?: string | null };
              links: Array<{
                __typename?: 'Link';
                id: string;
                uri: string;
                title?: string | null;
                description?: string | null;
                sortOrder: number;
              }>;
              content?:
                | { __typename?: 'ContributorsContent' }
                | {
                    __typename?: 'DocumentContent';
                    document: {
                      __typename?: 'Document';
                      id: string;
                      docType: DocType;
                      textSnapshot?: string | null;
                      about?: { __typename?: 'About'; displayName: string } | null;
                      preview?: { __typename?: 'File'; url: string } | null;
                    };
                  }
                | { __typename?: 'EventContent' }
                | { __typename?: 'FormContent' }
                | { __typename?: 'FormResponseContent' }
                | {
                    __typename?: 'GalleryContent';
                    images: Array<{
                      __typename?: 'FileRef';
                      alt?: string | null;
                      file: { __typename?: 'File'; url: string };
                    }>;
                  }
                | {
                    __typename?: 'LinkContent';
                    link: { __typename?: 'Link'; id: string; uri: string; title?: string | null };
                  }
                | {
                    __typename?: 'PollContent';
                    question: string;
                    options: Array<{ __typename?: 'PollOption'; id: string; value: string; sortOrder: number }>;
                  }
                | { __typename?: 'SpacesContent' }
                | { __typename?: 'TaskBoardContent' }
                | null;
            }
          | { __typename?: 'Room'; id: string }
          | { __typename?: 'Space'; id: string }
          | { __typename?: 'Template'; id: string }
          | { __typename?: 'User'; id: string }
          | null;
      }
    | { __typename?: 'User'; id: string }
    | null;
  subtree?: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; role: DocRole; docType: DocType; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | { __typename?: 'Organization'; id: string; entityType: string }
        | { __typename?: 'Post'; id: string; entityType: string }
        | { __typename?: 'Room'; id: string; entityType: string }
        | { __typename?: 'Space'; id: string; entityType: string }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SettingsSetStageTemplateDefaultMutationVariables = Exact<{
  scope: Scalars['UUID']['input'];
  stage: Scalars['UUID']['input'];
  template?: InputMaybe<Scalars['UUID']['input']>;
}>;

export type SettingsSetStageTemplateDefaultMutation = {
  __typename?: 'Mutation';
  setTemplateDefault: Array<{
    __typename?: 'TemplateDefault';
    slot: string;
    stage?: {
      __typename?: 'Stage';
      id: string;
      defaultTemplate?: {
        __typename?: 'Template';
        id: string;
        about: { __typename?: 'About'; displayName: string };
      } | null;
    } | null;
    template?: { __typename?: 'Template'; id: string; about: { __typename?: 'About'; displayName: string } } | null;
  }>;
};

export type SettingsSaveAsResolveSourceQueryVariables = Exact<{
  url: Scalars['String']['input'];
}>;

export type SettingsSaveAsResolveSourceQuery = {
  __typename?: 'Query';
  resolve: {
    __typename?: 'ResolveResult';
    state: ResolveState;
    remainder: Array<string>;
    node?:
      | { __typename?: 'Agent'; id: string; entityType: string }
      | { __typename?: 'Document'; id: string; entityType: string }
      | { __typename?: 'GenericActor'; id: string; entityType: string }
      | { __typename?: 'InnovationPack'; id: string; entityType: string }
      | { __typename?: 'Member'; id: string; entityType: string }
      | { __typename?: 'Organization'; id: string; entityType: string }
      | { __typename?: 'Post'; id: string; entityType: string }
      | { __typename?: 'Room'; id: string; entityType: string }
      | { __typename?: 'Space'; id: string; entityType: string }
      | { __typename?: 'Template'; id: string; entityType: string }
      | { __typename?: 'User'; id: string; entityType: string }
      | null;
  };
};

export type SettingsSaveAsSourceQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type SettingsSaveAsSourceQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | {
        __typename?: 'Space';
        id: string;
        about: {
          __typename?: 'About';
          displayName: string;
          avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
        can: { __typename?: 'SpaceCan'; saveAsTemplate: boolean };
      }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string }
    | null;
  subtree?: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | { __typename?: 'Organization'; id: string; entityType: string }
        | {
            __typename?: 'Post';
            contentKind: string;
            sortOrder: number;
            id: string;
            entityType: string;
            about: { __typename?: 'About'; displayName: string; description?: string | null };
            stage?: { __typename?: 'Stage'; name: string } | null;
            content?:
              | { __typename?: 'ContributorsContent' }
              | { __typename?: 'DocumentContent'; document: { __typename?: 'Document'; id: string; docType: DocType } }
              | { __typename?: 'EventContent' }
              | { __typename?: 'FormContent' }
              | { __typename?: 'FormResponseContent' }
              | { __typename?: 'GalleryContent' }
              | { __typename?: 'LinkContent' }
              | { __typename?: 'PollContent' }
              | { __typename?: 'SpacesContent' }
              | { __typename?: 'TaskBoardContent' }
              | null;
          }
        | { __typename?: 'Room'; id: string; entityType: string }
        | {
            __typename?: 'Space';
            isContentPublic: boolean;
            id: string;
            entityType: string;
            about: {
              __typename?: 'About';
              displayName: string;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            stages?: Array<{
              __typename?: 'Stage';
              name: string;
              description?: string | null;
              sortOrder: number;
            }> | null;
          }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SettingsCreateSpaceTemplateMutationVariables = Exact<{
  scope: Scalars['UUID']['input'];
  source: Scalars['UUID']['input'];
  recursive: Scalars['Boolean']['input'];
  about: UpdateAboutInput;
}>;

export type SettingsCreateSpaceTemplateMutation = {
  __typename?: 'Mutation';
  createTemplate: {
    __typename?: 'BlueprintResult';
    node:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | { __typename?: 'Space'; id: string }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string };
    omissions: Array<{ __typename?: 'BlueprintOmission'; path: string; code: BlueprintOmissionCode }>;
  };
};

export type SettingsUpdateSpaceTemplateMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  source?: InputMaybe<Scalars['UUID']['input']>;
  recursive?: InputMaybe<Scalars['Boolean']['input']>;
  about?: InputMaybe<UpdateAboutInput>;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type SettingsUpdateSpaceTemplateMutation = {
  __typename?: 'Mutation';
  updateTemplate: {
    __typename?: 'BlueprintResult';
    node:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | { __typename?: 'Space'; id: string }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string };
    omissions: Array<{ __typename?: 'BlueprintOmission'; path: string; code: BlueprintOmissionCode }>;
  };
};

export type CreateSubspaceTemplateDefaultQueryVariables = Exact<{
  root: Scalars['UUID']['input'];
}>;

export type CreateSubspaceTemplateDefaultQuery = {
  __typename?: 'Query';
  templateDefaults: Array<{
    __typename?: 'TemplateDefault';
    slot: string;
    template?: { __typename?: 'Template'; id: string; about: { __typename?: 'About'; displayName: string } } | null;
  }>;
};

export type CreateSpacePickerCardFragment = {
  __typename?: 'Template';
  id: string;
  kind: TemplateKind;
  url?: string | null;
  tags: Array<string>;
  about: {
    __typename?: 'About';
    displayName: string;
    description?: string | null;
    card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
  };
  body?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | {
        __typename?: 'Space';
        id: string;
        about: {
          __typename?: 'About';
          card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
        };
      }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string }
    | null;
};

export type CreateSpacePickerSpaceTemplatesQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type CreateSpacePickerSpaceTemplatesQuery = {
  __typename?: 'Query';
  templates: Array<{
    __typename?: 'Template';
    id: string;
    kind: TemplateKind;
    url?: string | null;
    tags: Array<string>;
    about: {
      __typename?: 'About';
      displayName: string;
      description?: string | null;
      card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
    };
    body?:
      | { __typename?: 'Agent'; id: string }
      | { __typename?: 'Document'; id: string }
      | { __typename?: 'GenericActor'; id: string }
      | { __typename?: 'InnovationPack'; id: string }
      | { __typename?: 'Member'; id: string }
      | { __typename?: 'Organization'; id: string }
      | { __typename?: 'Post'; id: string }
      | { __typename?: 'Room'; id: string }
      | {
          __typename?: 'Space';
          id: string;
          about: {
            __typename?: 'About';
            card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
          };
        }
      | { __typename?: 'Template'; id: string }
      | { __typename?: 'User'; id: string }
      | null;
  }>;
};

export type CreateSpacePickerLibraryQueryVariables = Exact<{
  scope?: InputMaybe<Scalars['UUID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type CreateSpacePickerLibraryQuery = {
  __typename?: 'Query';
  library: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent' }
        | { __typename?: 'Document' }
        | { __typename?: 'GenericActor' }
        | { __typename?: 'InnovationPack' }
        | { __typename?: 'Member' }
        | { __typename?: 'Organization' }
        | { __typename?: 'Post' }
        | { __typename?: 'Room' }
        | { __typename?: 'Space' }
        | {
            __typename?: 'Template';
            id: string;
            kind: TemplateKind;
            url?: string | null;
            tags: Array<string>;
            scope:
              | { __typename?: 'Agent'; id: string }
              | { __typename?: 'Document'; id: string }
              | { __typename?: 'GenericActor'; id: string }
              | { __typename?: 'InnovationPack'; id: string; about: { __typename?: 'About'; displayName: string } }
              | { __typename?: 'Member'; id: string }
              | { __typename?: 'Organization'; id: string }
              | { __typename?: 'Post'; id: string }
              | { __typename?: 'Room'; id: string }
              | { __typename?: 'Space'; id: string }
              | { __typename?: 'Template'; id: string }
              | { __typename?: 'User'; id: string };
            provider?:
              | { __typename?: 'Agent'; id: string; about: { __typename?: 'About'; displayName: string } }
              | {
                  __typename?: 'GenericActor';
                  id: string;
                  about?: { __typename?: 'About'; displayName: string } | null;
                }
              | { __typename?: 'Organization'; id: string; about: { __typename?: 'About'; displayName: string } }
              | { __typename?: 'User'; id: string; about: { __typename?: 'About'; displayName: string } }
              | null;
            about: {
              __typename?: 'About';
              displayName: string;
              description?: string | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            body?:
              | { __typename?: 'Agent'; id: string }
              | { __typename?: 'Document'; id: string }
              | { __typename?: 'GenericActor'; id: string }
              | { __typename?: 'InnovationPack'; id: string }
              | { __typename?: 'Member'; id: string }
              | { __typename?: 'Organization'; id: string }
              | { __typename?: 'Post'; id: string }
              | { __typename?: 'Room'; id: string }
              | {
                  __typename?: 'Space';
                  id: string;
                  about: {
                    __typename?: 'About';
                    card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
                  };
                }
              | { __typename?: 'Template'; id: string }
              | { __typename?: 'User'; id: string }
              | null;
          }
        | { __typename?: 'User' };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type CreateSpaceTemplateContentQueryVariables = Exact<{
  template: Scalars['UUID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type CreateSpaceTemplateContentQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | { __typename?: 'Space'; id: string }
    | {
        __typename?: 'Template';
        tags: Array<string>;
        id: string;
        about: { __typename?: 'About'; displayName: string; description?: string | null };
        body?:
          | { __typename?: 'Agent'; id: string }
          | { __typename?: 'Document'; id: string }
          | { __typename?: 'GenericActor'; id: string }
          | { __typename?: 'InnovationPack'; id: string }
          | { __typename?: 'Member'; id: string }
          | { __typename?: 'Organization'; id: string }
          | { __typename?: 'Post'; id: string }
          | { __typename?: 'Room'; id: string }
          | { __typename?: 'Space'; id: string }
          | { __typename?: 'Template'; id: string }
          | { __typename?: 'User'; id: string }
          | null;
      }
    | { __typename?: 'User'; id: string }
    | null;
  subtree?: {
    __typename?: 'NodeConnection';
    edges: Array<{
      __typename?: 'NodeEdge';
      node:
        | { __typename?: 'Agent'; id: string; entityType: string }
        | { __typename?: 'Document'; id: string; entityType: string }
        | { __typename?: 'GenericActor'; id: string; entityType: string }
        | { __typename?: 'InnovationPack'; id: string; entityType: string }
        | { __typename?: 'Member'; id: string; entityType: string }
        | { __typename?: 'Organization'; id: string; entityType: string }
        | {
            __typename?: 'Post';
            contentKind: string;
            sortOrder: number;
            id: string;
            entityType: string;
            about: { __typename?: 'About'; displayName: string; description?: string | null };
            stage?: { __typename?: 'Stage'; name: string } | null;
          }
        | { __typename?: 'Room'; id: string; entityType: string }
        | {
            __typename?: 'Space';
            tags: Array<string>;
            isContentPublic: boolean;
            id: string;
            entityType: string;
            about: {
              __typename?: 'About';
              displayName: string;
              tagline?: string | null;
              description?: string | null;
              card?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
            stages?: Array<{
              __typename?: 'Stage';
              name: string;
              description?: string | null;
              sortOrder: number;
            }> | null;
          }
        | { __typename?: 'Template'; id: string; entityType: string }
        | { __typename?: 'User'; id: string; entityType: string };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  } | null;
};

export type SpaceSettingsAboutVisualFragment = {
  __typename?: 'FileRef';
  alt?: string | null;
  aspectRatio?: number | null;
  file: { __typename?: 'File'; id: string; url: string };
};

export type SpaceSettingsAboutQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsAboutQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        tags: Array<string>;
        id: string;
        entityType: string;
        about: {
          __typename?: 'About';
          displayName: string;
          tagline?: string | null;
          description?: string | null;
          location?: unknown | null;
          facets: Array<{ __typename?: 'AboutFacet'; namespace: string; name: string; value?: unknown | null }>;
          avatar?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          card?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
        links: Array<{
          __typename?: 'Link';
          id: string;
          role: string;
          uri: string;
          title?: string | null;
          description?: string | null;
          sortOrder: number;
        }>;
        classifications: Array<{
          __typename?: 'Classification';
          id: string;
          label: string;
          settings?: unknown | null;
          values: Array<{ __typename?: 'Choice'; id: string; value: string; sortOrder: number }>;
          selected: Array<{ __typename?: 'Choice'; id: string }>;
        }>;
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
  config: {
    __typename?: 'Config';
    visualConstraints: Array<{
      __typename?: 'VisualConstraint';
      name: string;
      minWidth: number;
      maxWidth: number;
      minHeight: number;
      maxHeight: number;
      aspectRatio: number;
      minAspectRatio: number;
      maxAspectRatio: number;
    }>;
  };
};

export type SpaceSettingsUpdateAboutMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  about?: InputMaybe<UpdateAboutInput>;
  tags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;

export type SpaceSettingsUpdateAboutMutation = {
  __typename?: 'Mutation';
  updateSpace: { __typename?: 'Space'; id: string };
};

export type SpaceSettingsUpsertLinkMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  role: Scalars['String']['input'];
  uri: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceSettingsUpsertLinkMutation = {
  __typename?: 'Mutation';
  upsertLink:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string };
};

export type SpaceSettingsDeleteLinkMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsDeleteLinkMutation = {
  __typename?: 'Mutation';
  deleteLink:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string };
};

export type SpaceSettingsAddClassificationMutationVariables = Exact<{
  space: Scalars['UUID']['input'];
  template: Scalars['UUID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceSettingsAddClassificationMutation = {
  __typename?: 'Mutation';
  addClassification: {
    __typename?: 'BlueprintResult';
    node:
      | { __typename?: 'Agent'; id: string; entityType: string }
      | { __typename?: 'Document'; id: string; entityType: string }
      | { __typename?: 'GenericActor'; id: string; entityType: string }
      | { __typename?: 'InnovationPack'; id: string; entityType: string }
      | { __typename?: 'Member'; id: string; entityType: string }
      | { __typename?: 'Organization'; id: string; entityType: string }
      | { __typename?: 'Post'; id: string; entityType: string }
      | { __typename?: 'Room'; id: string; entityType: string }
      | { __typename?: 'Space'; id: string; entityType: string }
      | { __typename?: 'Template'; id: string; entityType: string }
      | { __typename?: 'User'; id: string; entityType: string };
  };
};

export type SpaceSettingsUpdateClassificationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  selected?: InputMaybe<Array<Scalars['UUID']['input']> | Scalars['UUID']['input']>;
}>;

export type SpaceSettingsUpdateClassificationMutation = {
  __typename?: 'Mutation';
  updateClassification: { __typename?: 'Space'; id: string };
};

export type SpaceSettingsRemoveClassificationMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsRemoveClassificationMutation = {
  __typename?: 'Mutation';
  removeClassification: { __typename?: 'Space'; id: string };
};

export type SpaceSettingsRequestVisualUploadMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  mime: Scalars['String']['input'];
  size: Scalars['Long']['input'];
  role: Scalars['String']['input'];
}>;

export type SpaceSettingsRequestVisualUploadMutation = {
  __typename?: 'Mutation';
  requestUpload: { __typename?: 'UploadToken'; token: string; url: string };
};

export type SpaceSettingsAttachVisualMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  file: Scalars['UUID']['input'];
  role: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  alt?: InputMaybe<Scalars['String']['input']>;
}>;

export type SpaceSettingsAttachVisualMutation = {
  __typename?: 'Mutation';
  attachFile:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        about: {
          __typename?: 'About';
          avatar?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          banner?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
          card?: {
            __typename?: 'FileRef';
            alt?: string | null;
            aspectRatio?: number | null;
            file: { __typename?: 'File'; id: string; url: string };
          } | null;
        };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string };
};

export type SpaceSettingsAccountQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsAccountQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        url?: string | null;
        status: SpaceStatus;
        id: string;
        entityType: string;
        host?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              about?: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | {
              __typename?: 'User';
              id: string;
              actorType: string;
              about: {
                __typename?: 'About';
                displayName: string;
                avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
              };
            }
          | null;
        planAssignments?: Array<{
          __typename?: 'PlanAssignment';
          id: string;
          expiresAt?: string | null;
          plan: { __typename?: 'Plan'; id: string; name: string; scope: PlanScope; sortOrder: number };
        }> | null;
        can: { __typename?: 'SpaceCan'; delete: boolean };
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceSettingsApplicationFormQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsApplicationFormQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; applicationForm?: unknown | null; id: string; entityType: string }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceSettingsUpdateApplicationFormMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  applicationForm: Scalars['JSON']['input'];
}>;

export type SpaceSettingsUpdateApplicationFormMutation = {
  __typename?: 'Mutation';
  updateSpace: { __typename?: 'Space'; id: string; applicationForm?: unknown | null };
};

export type SpaceSettingsDeleteGateQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsDeleteGateQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | { __typename?: 'Space'; id: string; entityType: string; can: { __typename?: 'SpaceCan'; delete: boolean } }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceSettingsDeleteSpaceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsDeleteSpaceMutation = {
  __typename?: 'Mutation';
  deleteSpace: { __typename?: 'DeleteResult'; deletedId: string };
};

export type SpaceSettingsSettingsQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SpaceSettingsSettingsQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        settings?: unknown | null;
        audience?: Audience | null;
        id: string;
        entityType: string;
        host?:
          | {
              __typename?: 'Agent';
              id: string;
              actorType: string;
              about: { __typename?: 'About'; displayName: string };
            }
          | {
              __typename?: 'GenericActor';
              id: string;
              actorType: string;
              about?: { __typename?: 'About'; displayName: string } | null;
            }
          | {
              __typename?: 'Organization';
              id: string;
              actorType: string;
              about: { __typename?: 'About'; displayName: string };
            }
          | { __typename?: 'User'; id: string; actorType: string; about: { __typename?: 'About'; displayName: string } }
          | null;
        curated?: Array<{
          __typename?: 'CuratedItem';
          role: string;
          sortOrder: number;
          node:
            | { __typename?: 'Agent'; id: string; entityType: string }
            | { __typename?: 'Document'; id: string; entityType: string }
            | { __typename?: 'GenericActor'; id: string; entityType: string }
            | { __typename?: 'InnovationPack'; id: string; entityType: string }
            | { __typename?: 'Member'; id: string; entityType: string }
            | { __typename?: 'Organization'; id: string; entityType: string }
            | { __typename?: 'Post'; id: string; entityType: string }
            | { __typename?: 'Room'; id: string; entityType: string }
            | { __typename?: 'Space'; id: string; entityType: string }
            | { __typename?: 'Template'; id: string; entityType: string }
            | { __typename?: 'User'; id: string; entityType: string };
        }> | null;
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string }
    | null;
};

export type SpaceSettingsUpdateSettingsMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  settings: Scalars['JSON']['input'];
}>;

export type SpaceSettingsUpdateSettingsMutation = {
  __typename?: 'Mutation';
  updateSpace: { __typename?: 'Space'; id: string; settings?: unknown | null };
};

export type SpaceSettingsSetAudienceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  audience: Audience;
}>;

export type SpaceSettingsSetAudienceMutation = {
  __typename?: 'Mutation';
  setSpaceAudience: { __typename?: 'Space'; id: string; audience?: Audience | null };
};

export type SpaceSettingsSetTrustedOrganizationsMutationVariables = Exact<{
  owner: Scalars['UUID']['input'];
  targets: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
}>;

export type SpaceSettingsSetTrustedOrganizationsMutation = {
  __typename?: 'Mutation';
  setReferences:
    | { __typename?: 'Agent'; id: string; entityType: string }
    | { __typename?: 'Document'; id: string; entityType: string }
    | { __typename?: 'GenericActor'; id: string; entityType: string }
    | { __typename?: 'InnovationPack'; id: string; entityType: string }
    | { __typename?: 'Member'; id: string; entityType: string }
    | { __typename?: 'Organization'; id: string; entityType: string }
    | { __typename?: 'Post'; id: string; entityType: string }
    | { __typename?: 'Room'; id: string; entityType: string }
    | {
        __typename?: 'Space';
        id: string;
        entityType: string;
        curated?: Array<{
          __typename?: 'CuratedItem';
          role: string;
          sortOrder: number;
          node:
            | { __typename?: 'Agent'; id: string; entityType: string }
            | { __typename?: 'Document'; id: string; entityType: string }
            | { __typename?: 'GenericActor'; id: string; entityType: string }
            | { __typename?: 'InnovationPack'; id: string; entityType: string }
            | { __typename?: 'Member'; id: string; entityType: string }
            | { __typename?: 'Organization'; id: string; entityType: string }
            | { __typename?: 'Post'; id: string; entityType: string }
            | { __typename?: 'Room'; id: string; entityType: string }
            | { __typename?: 'Space'; id: string; entityType: string }
            | { __typename?: 'Template'; id: string; entityType: string }
            | { __typename?: 'User'; id: string; entityType: string };
        }> | null;
      }
    | { __typename?: 'Template'; id: string; entityType: string }
    | { __typename?: 'User'; id: string; entityType: string };
};

export type CreateSubspaceRootQueryVariables = Exact<{
  root: Scalars['UUID']['input'];
}>;

export type CreateSubspaceRootQuery = {
  __typename?: 'Query';
  node?:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'Document'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'InnovationPack'; id: string }
    | { __typename?: 'Member'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'Post'; id: string }
    | { __typename?: 'Room'; id: string }
    | {
        __typename?: 'Space';
        id: string;
        host?:
          | { __typename?: 'Agent'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'GenericActor'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'Organization'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | { __typename?: 'User'; id: string; account?: { __typename?: 'AccountSummary'; id: string } | null }
          | null;
      }
    | { __typename?: 'Template'; id: string }
    | { __typename?: 'User'; id: string }
    | null;
};

export type PinSpaceSettingsSubspaceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  pinned: Scalars['Boolean']['input'];
}>;

export type PinSpaceSettingsSubspaceMutation = {
  __typename?: 'Mutation';
  pinSubspace: { __typename?: 'Space'; id: string; pinned?: boolean | null; sortOrder?: number | null };
};

export type ReorderSpaceSettingsSubspacesMutationVariables = Exact<{
  parent: Scalars['UUID']['input'];
  ids: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
}>;

export type ReorderSpaceSettingsSubspacesMutation = {
  __typename?: 'Mutation';
  reorderSubspaces: { __typename?: 'Space'; id: string };
};

export type DeleteSpaceSettingsSubspaceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type DeleteSpaceSettingsSubspaceMutation = {
  __typename?: 'Mutation';
  deleteSpace: { __typename?: 'DeleteResult'; deletedId: string };
};

export type UpdateSpaceSettingsSubspacesSortModeMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  settings: Scalars['JSON']['input'];
}>;

export type UpdateSpaceSettingsSubspacesSortModeMutation = {
  __typename?: 'Mutation';
  updateSpace: { __typename?: 'Space'; id: string; settings?: unknown | null };
};

export type SpaceSettingsSubspaceTemplatesQueryVariables = Exact<{
  space: Scalars['UUID']['input'];
}>;

export type SpaceSettingsSubspaceTemplatesQuery = {
  __typename?: 'Query';
  templates: Array<{ __typename?: 'Template'; id: string; about: { __typename?: 'About'; displayName: string } }>;
};

export type SetSpaceSettingsSubspaceDefaultTemplateMutationVariables = Exact<{
  scope: Scalars['UUID']['input'];
  template: Scalars['UUID']['input'];
}>;

export type SetSpaceSettingsSubspaceDefaultTemplateMutation = {
  __typename?: 'Mutation';
  setTemplateDefault: Array<{
    __typename?: 'TemplateDefault';
    slot: string;
    template?: { __typename?: 'Template'; id: string; about: { __typename?: 'About'; displayName: string } } | null;
  }>;
};

export type V2SavePersonalSettingsMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  value: Scalars['JSON']['input'];
}>;

export type V2SavePersonalSettingsMutation = {
  __typename?: 'Mutation';
  setSettings:
    | { __typename?: 'Agent'; id: string }
    | { __typename?: 'GenericActor'; id: string }
    | { __typename?: 'Organization'; id: string }
    | { __typename?: 'User'; id: string };
};

export type ChatRecipientDirectoryQueryVariables = Exact<{
  terms: Scalars['String']['input'];
}>;

export type ChatRecipientDirectoryQuery = {
  __typename?: 'Query';
  actors: {
    __typename?: 'ActorConnection';
    edges: Array<{
      __typename?: 'ActorEdge';
      node:
        | {
            __typename?: 'Agent';
            id: string;
            about: {
              __typename?: 'About';
              displayName: string;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          }
        | {
            __typename?: 'GenericActor';
            id: string;
            about?: {
              __typename?: 'About';
              displayName: string;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            } | null;
          }
        | {
            __typename?: 'Organization';
            id: string;
            about: {
              __typename?: 'About';
              displayName: string;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          }
        | {
            __typename?: 'User';
            id: string;
            about: {
              __typename?: 'About';
              displayName: string;
              location?: unknown | null;
              avatar?: { __typename?: 'FileRef'; file: { __typename?: 'File'; url: string } } | null;
            };
          };
    }>;
  };
};

export type NativeRouteResolutionQueryVariables = Exact<{
  url: Scalars['String']['input'];
}>;

export type NativeRouteResolutionQuery = {
  __typename?: 'Query';
  resolve: {
    __typename?: 'ResolveResult';
    matchedPrefix?: string | null;
    remainder: Array<string>;
    state: ResolveState;
    node?:
      | { __typename: 'Agent'; id: string; entityType: string }
      | { __typename: 'Document'; id: string; entityType: string }
      | { __typename: 'GenericActor'; id: string; entityType: string }
      | { __typename: 'InnovationPack'; id: string; entityType: string }
      | { __typename: 'Member'; id: string; entityType: string }
      | { __typename: 'Organization'; id: string; entityType: string }
      | {
          __typename: 'Post';
          url?: string | null;
          contentKind: string;
          id: string;
          entityType: string;
          parentPost?: { __typename?: 'Post'; id: string } | null;
        }
      | { __typename: 'Room'; id: string; entityType: string }
      | {
          __typename: 'Space';
          kind: SpaceKind;
          id: string;
          entityType: string;
          depth: number;
          url?: string | null;
          settings?: unknown | null;
          stages?: Array<{ __typename?: 'Stage'; id: string; sortOrder: number }> | null;
        }
      | { __typename: 'Template'; id: string; entityType: string }
      | { __typename: 'User'; id: string; entityType: string }
      | null;
    ancestors: Array<
      | { __typename: 'Agent'; id: string; entityType: string }
      | { __typename: 'Document'; id: string; entityType: string }
      | { __typename: 'GenericActor'; id: string; entityType: string }
      | { __typename: 'InnovationPack'; id: string; entityType: string }
      | { __typename: 'Member'; id: string; entityType: string }
      | { __typename: 'Organization'; id: string; entityType: string }
      | { __typename: 'Post'; id: string; entityType: string }
      | { __typename: 'Room'; id: string; entityType: string }
      | {
          __typename: 'Space';
          kind: SpaceKind;
          depth: number;
          url?: string | null;
          id: string;
          entityType: string;
          about: {
            __typename?: 'About';
            displayName: string;
            tagline?: string | null;
            avatar?: {
              __typename?: 'FileRef';
              alt?: string | null;
              file: { __typename?: 'File'; id: string; url: string };
            } | null;
            card?: {
              __typename?: 'FileRef';
              alt?: string | null;
              file: { __typename?: 'File'; id: string; url: string };
            } | null;
            banner?: {
              __typename?: 'FileRef';
              alt?: string | null;
              aspectRatio?: number | null;
              file: { __typename?: 'File'; id: string; url: string };
            } | null;
          };
        }
      | { __typename: 'Template'; id: string; entityType: string }
      | { __typename: 'User'; id: string; entityType: string }
    >;
    closestReadable?:
      | { __typename: 'Agent'; id: string; entityType: string }
      | { __typename: 'Document'; id: string; entityType: string }
      | { __typename: 'GenericActor'; id: string; entityType: string }
      | { __typename: 'InnovationPack'; id: string; entityType: string }
      | { __typename: 'Member'; id: string; entityType: string }
      | { __typename: 'Organization'; id: string; entityType: string }
      | { __typename: 'Post'; id: string; entityType: string }
      | { __typename: 'Room'; id: string; entityType: string }
      | { __typename: 'Space'; url?: string | null; id: string; entityType: string }
      | { __typename: 'Template'; id: string; entityType: string }
      | { __typename: 'User'; id: string; entityType: string }
      | null;
    space?: {
      __typename?: 'Space';
      id: string;
      entityType: string;
      kind: SpaceKind;
      depth: number;
      url?: string | null;
      settings?: unknown | null;
      stages?: Array<{ __typename?: 'Stage'; id: string; sortOrder: number }> | null;
    } | null;
    homepage?: { __typename?: 'Space'; id: string } | null;
  };
};

export type SpaceInputsFragment = {
  __typename?: 'Space';
  depth: number;
  url?: string | null;
  settings?: unknown | null;
  stages?: Array<{ __typename?: 'Stage'; id: string; sortOrder: number }> | null;
};

export type V2ResolveQueryVariables = Exact<{
  url: Scalars['String']['input'];
}>;

export type V2ResolveQuery = {
  __typename?: 'Query';
  resolve: { __typename?: 'ResolveResult'; homepage?: { __typename?: 'Space'; id: string } | null };
};
