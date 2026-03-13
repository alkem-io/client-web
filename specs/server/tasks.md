# Tasks: Community Polls & Voting

**Input**: Design documents from `specs/038-community-polls/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/schema.graphql ✅

**Tests**: Unit tests included for domain invariants (PollService validation, vote constraints) per constitution Principle 6 and plan.md directive — no full integration or e2e tests required.

**Organization**: Tasks grouped by user story; each phase is independently testable.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no incomplete task dependencies
- **[Story]**: User story this task belongs to (US1…US6 from spec.md)
- File paths follow `src/domain/collaboration/` conventions per plan.md

---

## Phase 1: Setup

**Purpose**: Locate existing files that will be modified; no new dependencies needed — NestJS, TypeORM, Apollo, and Vitest are already configured.

- [ ] T001 Locate the existing `CalloutFramingType` enum file (e.g. `src/common/enums/callout.framing.type.ts` or equivalent) and confirm the `POLL` value addition does not break existing code; note the path for T024
- [ ] T002 Locate the existing `NotificationEvent` enum file (e.g. `src/common/enums/notification.event.ts`) and confirm naming conventions for the 4 new poll event values; note the path for T055
- [ ] T003 [P] Locate `src/domain/community/user-settings/user.settings.notification.space.interface.ts` (or equivalent interface/class holding `IUserSettingsNotificationSpaceBase`) and note the exact type used for channel fields; required for T056
- [ ] T004 [P] Locate the `NotificationSpaceAdapter` in `src/services/adapters/notification-adapter/notification.space.adapter.ts` and confirm the method signature pattern (return type, DTO shape) used for existing callout-contribution notification methods; required for T059

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New enums, entity files, module skeletons, CalloutFraming modifications, and migration. All user story phases depend on this phase being complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Enums (fully parallel)

- [ ] T005 [P] Create `src/common/enums/poll.status.ts` — export `enum PollStatus { OPEN = 'open', CLOSED = 'closed' }`
- [ ] T006 [P] Create `src/common/enums/poll.results.visibility.ts` — export `enum PollResultsVisibility { HIDDEN = 'hidden', TOTAL_ONLY = 'total-only', VISIBLE = 'visible' }`
- [ ] T007 [P] Create `src/common/enums/poll.results.detail.ts` — export `enum PollResultsDetail { PERCENTAGE = 'percentage', COUNT = 'count', FULL = 'full' }`

### Interfaces & ObjectTypes (parallel after T005–T007)

- [ ] T008 [P] Create `src/domain/collaboration/poll/poll.settings.interface.ts` — `@ObjectType('PollSettings') abstract class IPollSettings` with `@Field` decorators for `minResponses: Int!`, `maxResponses: Int!`, `resultsVisibility: PollResultsVisibility!`, `resultsDetail: PollResultsDetail!` (all immutable, per data-model.md)
- [ ] T009 [P] Create `src/domain/collaboration/poll/poll.interface.ts` — `@ObjectType('Poll') abstract class IPoll extends IAuthorizable` with fields: `title: String!`, `status: PollStatus!`, `settings: IPollSettings!`, `deadline: DateTime`, `totalVotes: Int`, `canSeeDetailedResults: Boolean!`, `options: [IPollOption!]!`, `myVote: IPollVote`; include internal `votes?: IPollVote[]` and `framing?: ICalloutFraming` (not exposed)
- [ ] T010 [P] Create `src/domain/collaboration/poll-option/poll.option.interface.ts` — `@ObjectType('PollOption') abstract class IPollOption` with fields: `id: UUID!`, `createdDate: DateTime!`, `updatedDate: DateTime!`, `text: String!`, `sortOrder: Int!`, `voteCount: Int`, `votePercentage: Float`, `voters: [IUser!]`; nullable fields follow data-model.md visibility rules
- [ ] T011 [P] Create `src/domain/collaboration/poll-vote/poll.vote.interface.ts` — `@ObjectType('PollVote') abstract class IPollVote extends IBaseAlkemio` with fields: `createdBy: UUID!`, `selectedOptions: [IPollOption!]!`; internal `poll?: IPoll`

### Entities (parallel after T005–T011)

- [ ] T012 [P] Create `src/domain/collaboration/poll/poll.entity.ts` — `@Entity() class Poll extends AuthorizableEntity implements IPoll` with `@Column` for `title` (varchar 512), `status` (varchar ENUM_LENGTH, default OPEN), `settings` (jsonb, `IPollSettings`, immutable), `deadline` (timestamp, nullable); `@OneToMany` to `PollOption` (eager: false, cascade: true) and `PollVote` (eager: false, cascade: true); `@OneToOne` back-ref to `CalloutFraming`; no class-field defaults per project convention
- [ ] T013 [P] Create `src/domain/collaboration/poll-option/poll.option.entity.ts` — `@Entity() class PollOption extends BaseAlkemioEntity implements IPollOption` with `@Column` for `text` (varchar MID_TEXT_LENGTH = 512, not null) and `sortOrder` (int, not null); `@ManyToOne` to `Poll` (eager: false, cascade: false, onDelete: CASCADE); UNIQUE `(pollId, sortOrder)` via `@Unique` decorator
- [ ] T014 [P] Create `src/domain/collaboration/poll-vote/poll.vote.entity.ts` — `@Entity() class PollVote extends BaseAlkemioEntity implements IPollVote` with `@Column` for `createdBy` (uuid, not null; FK → user.id ON DELETE CASCADE) and `selectedOptionIds` (jsonb, string[], not null); `@ManyToOne` to `Poll` (eager: false, cascade: false, onDelete: CASCADE); UNIQUE `(createdBy, pollId)` via `@Unique` decorator (one vote per user per poll)

### Module skeletons (after entities + interfaces)

- [ ] T015 Create `src/domain/collaboration/poll-option/poll.option.service.ts` — stub `PollOptionService` class with NestJS `@Injectable()`; inject `PollOption` repository via TypeORM; export class (methods added in later phases)
- [ ] T016 Create `src/domain/collaboration/poll-option/poll.option.module.ts` — `@Module` importing `TypeOrmModule.forFeature([PollOption])`, providing and exporting `PollOptionService`
- [ ] T017 Create `src/domain/collaboration/poll-vote/poll.vote.service.ts` — stub `PollVoteService` class; inject `PollVote` repository; export class with two stubbed methods (implementations added in Phase 4): `castVote(pollId: string, voterId: string, selectedOptionIds: string[]): Promise<Poll>` and `getVoteForUser(pollId: string, userId: string): Promise<PollVote | null>` (called by T038 myVote field resolver)
- [ ] T018 Create `src/domain/collaboration/poll-vote/poll.vote.module.ts` — `@Module` importing `TypeOrmModule.forFeature([PollVote])`, providing and exporting `PollVoteService`
- [ ] T019 Create skeleton `src/domain/collaboration/poll/poll.service.ts` — `@Injectable() PollService` with constructor injecting `Poll` and `PollOption` repositories; all methods stubbed (throwing `NotImplementedException`) — implementations added per phase; explicitly include the following stubs so later tasks have clear anchors: `createPoll()` (T029), `getPollForFraming(framingId: string): Promise<Poll | null>` (called by T033 CalloutFraming field resolver), `computePollResults()` (T040), `applyVisibilityRules()` (T041), `canUserSeeDetailedResults()` (T042), `addOption()` (T049), `updateOption()` (T050), `removeOption()` (T051), `reorderOptions()` (T052), `getCalloutCreatorIdForPoll()` (T061)
- [ ] T020 Create skeleton `src/domain/collaboration/poll/poll.service.authorization.ts` — `@Injectable() PollAuthorizationService`; stub `createAuthorizationPolicy()` and `applyAuthorizationRules()` methods. Also verify whether the codebase's base authorization pattern exposes a reusable `checkAuthorization(agentInfo, policy, privilege)` utility (likely in `src/core/authorization/` or a shared authorization service) — T037 and T053 will call this utility to enforce `CONTRIBUTE` and `UPDATE` privileges respectively; note the actual import path so later tasks use the correct symbol
- [ ] T021 Create `src/domain/collaboration/poll/poll.module.ts` — `@Module` importing `TypeOrmModule.forFeature([Poll])`, `PollOptionModule`, `PollVoteModule`; providing `PollService`, `PollAuthorizationService`; exporting `PollService`

### CalloutFraming modifications

- [ ] T022 Add `poll?: Poll` relation to `src/domain/collaboration/callout-framing/callout.framing.entity.ts`: `@OneToOne(() => Poll, poll => poll.framing, { eager: false, cascade: true, onDelete: 'SET NULL' }) @JoinColumn() poll?: Poll`
- [ ] T023 Add `poll?: IPoll` to `src/domain/collaboration/callout-framing/callout.framing.interface.ts`
- [ ] T024 Add `POLL` to the `CalloutFramingType` enum in the file identified in T001 (e.g. `POLL = 'poll'` alongside WHITEBOARD, LINK, MEMO, MEDIA_GALLERY, NONE)
- [ ] T025 Import `PollModule` in `src/domain/collaboration/callout-framing/callout.framing.module.ts` imports array to resolve `PollService` dependency

### Migration

- [ ] T026 Run `pnpm run migration:generate -n CommunityPolls` to generate `src/migrations/{TIMESTAMP}-CommunityPolls.ts`; verify the generated `up()` creates: `poll` table (id, createdDate, updatedDate, version, title varchar(512), status varchar(128) default 'open', settings jsonb NOT NULL, deadline timestamp NULL, authorizationId uuid FK); `poll_option` table (id, createdDate, updatedDate, version, text varchar(512), sortOrder int, pollId FK ON DELETE CASCADE, UNIQUE(pollId, sortOrder)); `poll_vote` table (id, createdDate, updatedDate, version, createdBy uuid FK → user(id) ON DELETE CASCADE, selectedOptionIds jsonb, pollId FK ON DELETE CASCADE, UNIQUE(createdBy, pollId)); `pollId` column added to `callout_framing` (uuid NULL, FK → poll(id) ON DELETE SET NULL); verify `down()` drops FK then tables in reverse order

**Checkpoint**: Foundation ready — all three new domain modules exist, CalloutFraming knows about Poll, migration is ready. User story phases can now begin.

---

## Phase 3: User Story 1 — Creating a Poll (Priority: P1) 🎯 MVP

**Goal**: Enable any user with Callout creation rights to create a Callout (Post) with an attached poll by extending `createCallout` — no separate mutation. Poll is immediately visible and open for voting.

**Independent Test**: A user with Callout creation rights can run the `createCalloutOnCalloutsSet` mutation with `framing.type = POLL` and `framing.poll = { title, options: ["A","B","C"] }`, receive a response containing `framing.poll.id`, `framing.poll.status = OPEN`, `framing.poll.settings.minResponses = 1`, `framing.poll.settings.maxResponses = 1`, and three options each with `voteCount = null` (results visible by default). Attempting to create with fewer than 2 options returns a validation error.

### Implementation

- [ ] T027 [P] [US1] Create `PollSettingsInput` input DTO in `src/domain/collaboration/poll/dto/poll.dto.create.ts`: decorate with `@InputType('PollSettingsInput')` to match the schema contract; optional fields `minResponses?: Int` (default 1), `maxResponses?: Int` (default 1), `resultsVisibility?: PollResultsVisibility` (default VISIBLE), `resultsDetail?: PollResultsDetail` (default FULL); use `@IsOptional()` and `@IsInt()` validators
- [ ] T028 [P] [US1] Create `CreatePollInput` input DTO in `src/domain/collaboration/poll/dto/poll.dto.create.ts`: required `title: String!` (max 512 chars, `@MaxLength(MID_TEXT_LENGTH)`), optional `settings?: PollSettingsInput`, required `options: [String!]!` (each max 512 chars, `@ArrayMinSize(2)`)
- [ ] T029 [US1] Implement `PollService.createPoll(input: CreatePollInput): Promise<{ poll: Poll; warnings: string[] }>` in `src/domain/collaboration/poll/poll.service.ts`: (1) validate `options.length >= 2`; (2) validate `minResponses >= 1`; (3) validate `maxResponses >= 0`; (4) when `maxResponses > 0` validate `maxResponses >= minResponses`; (5) detect duplicate option texts — if any two options share the same case-insensitive text, add `"Poll contains duplicate option text"` to a `warnings` array (creation proceeds regardless); (6) create `Poll` entity with `status = OPEN`, `deadline = null`, settings object with resolved defaults; (7) create one `PollOption` entity per option text with sequential `sortOrder` starting at 1; (8) persist via repository; return `{ poll, warnings }`. In the `createCallout` resolver (T032 caller), if `warnings` is non-empty, surface each warning via Apollo response extensions (e.g. `context.res.extensions = { warnings }`) so the GraphQL response includes a warnings array alongside the data — spec requires the warning to appear in the response without blocking creation.
- [ ] T030 [US1] Implement `PollAuthorizationService.createAuthorizationPolicy()` in `src/domain/collaboration/poll/poll.service.authorization.ts`: create a new `AuthorizationPolicy` for the `Poll`; inherit `READ` from parent `CalloutFraming` policy; grant `CONTRIBUTE` to space members (matching how existing callout contributions are granted); grant `UPDATE` to Callout editors (facilitators, admins)
- [ ] T031 [US1] Add `poll?: CreatePollInput` field to `CreateCalloutFramingInput` in `src/domain/collaboration/callout-framing/dto/callout.framing.dto.create.ts`: mark `@IsOptional()`; no `@ValidateNested()` needed unless other input fields require it
- [ ] T032 [US1] Implement `CalloutFramingService.createPollOnFraming()` in `src/domain/collaboration/callout-framing/callout.framing.service.ts`: (0) **guard**: in `createCalloutFraming()`, when `input.type === CalloutFramingType.POLL` and `input.poll` is `undefined`/`null`, throw a `ValidationException('Poll input is required when framing type is POLL', LogContext.COLLABORATION)` before proceeding — do not silently create a framing with a missing poll; (1) call `PollService.createPoll(input.poll)` (receives `{ poll, warnings }`); (2) call `PollAuthorizationService.createAuthorizationPolicy()`; (3) set `framing.poll = poll` before persisting; (4) **verify** that the existing `createCallout` mutation in `callout.resolver.mutations.ts` delegates `framing` input fully to `calloutFramingService.createCalloutFraming()` without stripping the `poll` field — if any input transformation exists in that resolver, ensure `poll` is passed through; update the resolver if needed (plan.md lists this file as modified)
- [ ] T033 [US1] Add `poll` field resolver for `CalloutFraming` type in `callout.framing.resolver.fields.ts`: annotate with `@ResolveField(() => IPoll, { nullable: true })`; load `Poll` via `PollService.getPollForFraming(framingId)`.
- [ ] T034 [US1] Add unit tests for `createPoll()` invariants in `src/domain/collaboration/poll/poll.service.spec.ts`: (a) rejects input with fewer than 2 options; (b) rejects `minResponses < 1`; (c) rejects `maxResponses < 0`; (d) rejects `maxResponses > 0 && maxResponses < minResponses`; (e) applies default settings when `settings` is omitted; (f) assigns sequential `sortOrder` starting at 1; (g) returns `warnings` containing the duplicate-text message when two options share the same text, but still creates the poll successfully (FR edge case); (h) newly created poll has `status = OPEN` (FR-023); (i) newly created poll has `deadline = null` (FR-027). Add one test for the framing guard in `src/domain/collaboration/callout-framing/callout.framing.service.spec.ts`: (j) `createCalloutFraming()` throws `ValidationException` when `input.type === POLL` and `input.poll` is undefined

**Checkpoint**: A poll can be created and read. `createCallout` with `framing.type = POLL` returns the poll with all static fields. Validation errors fire correctly.

---

## Phase 4: User Story 2 & User Story 4 — Voting & Changing a Vote (Priority: P2 / P4)

**Goal (US2)**: Space members can cast a vote on an open poll by calling `castPollVote`. The vote is recorded, results update immediately.

**Goal (US4)**: Members who already voted can call `castPollVote` again with a new complete selection set; their previous vote is replaced entirely. Old selection loses votes, new selection gains votes.

**Independent Test**: (US2) A member calls `castPollVote({ pollID, selectedOptionIDs: [optionA] })`; the returned `Poll.options` shows `optionA.voteCount = 1` and `Poll.myVote.selectedOptions` contains `optionA`. (US4) The same member calls `castPollVote({ pollID, selectedOptionIDs: [optionB] })`; the returned poll shows `optionA.voteCount = 0`, `optionB.voteCount = 1`, and `myVote.selectedOptions` now contains only `optionB`. Non-members receive an authorization error.

### Implementation

- [ ] T035 [P] [US2] Create `CastPollVoteInput` input DTO in `src/domain/collaboration/poll-vote/dto/poll.vote.dto.cast.ts`: `pollID: UUID!` and `selectedOptionIDs: [UUID!]!` (both required; `@IsUUID()` on each element via `@each` validator)
- [ ] T036 [US2] Implement `PollVoteService.castVote(pollId: string, voterId: string, selectedOptionIds: string[]): Promise<Poll>` in `src/domain/collaboration/poll-vote/poll.vote.service.ts`: (1) load `Poll` with options; (2) validate all `selectedOptionIds` exist in `poll.options` and belong to this poll — reject any unknown or cross-poll IDs; (3) validate no duplicate IDs within the submission; (4) validate `selectedOptionIds.length >= poll.settings.minResponses`; (5) when `poll.settings.maxResponses > 0` validate `selectedOptionIds.length <= poll.settings.maxResponses`; (6) upsert: if a `PollVote` row exists for `(voterId, pollId)` update `selectedOptionIds` entirely (full replacement); otherwise insert new `PollVote`; (7) return updated `Poll` (for field resolvers to compute results)
- [ ] T037 [US2] Create `castPollVote` mutation in `src/domain/collaboration/poll/poll.resolver.mutations.ts`: `@Mutation(() => IPoll) castPollVote(@Args('voteData') voteData: CastPollVoteInput, @CurrentUser() user: AgentInfo): Promise<IPoll>`; enforce `CONTRIBUTE` privilege on `Poll` via `PollAuthorizationService.checkAuthorization()`; call `PollVoteService.castVote(voteData.pollID, user.userID, voteData.selectedOptionIDs)`; return updated `Poll`
- [ ] T038 [US2] Add `myVote` field resolver on `Poll` in `src/domain/collaboration/poll/poll.resolver.fields.ts`: `@ResolveField(() => IPollVote, { nullable: true })`; load the `PollVote` record for the current user and this poll from `PollVoteService.getVoteForUser(pollId, userId)`; if found, resolve `selectedOptions` by cross-referencing `selectedOptionIds` with `poll.options` (already in context); return `null` if user has not voted
- [ ] T039 [US2] Add unit tests in `src/domain/collaboration/poll-vote/poll.vote.service.spec.ts` for `castVote()` invariants: (a) rejects option ID from a different poll; (b) rejects duplicate option IDs within the submission; (c) rejects `selectedOptionIds.length < minResponses`; (d) rejects `selectedOptionIds.length > maxResponses` when `maxResponses > 0`; (e) rejects empty selection array; (f) inserts new `PollVote` on first call; (g) fully replaces `selectedOptionIds` on second call (US4 branch); (h) result of (g) shows old option loses vote, new option gains vote

**Checkpoint**: Members can cast and update votes. `castPollVote` is idempotent in the sense that each call replaces the full vote. US2 and US4 are both covered by this mutation.

---

## Phase 5: User Story 3 — Viewing Results with Vote Transparency (Priority: P3)

**Goal**: Any space member can view poll results at any time (results update on page load). Results are ranked by vote count (most votes first; ties preserve original `sortOrder`). Visibility is governed by `settings.resultsVisibility` and `settings.resultsDetail`.

**Independent Test**: After US2 votes are cast, any member (including non-voters when `resultsVisibility = VISIBLE`) queries `callout.framing.poll { options { text voteCount votePercentage voters { id } } totalVotes canSeeDetailedResults }`. Options are returned in descending `voteCount` order. With `resultsDetail = FULL`, `voters` contains the voter's `IUser`. With `resultsDetail = COUNT`, `voters` is null. With `resultsVisibility = HIDDEN` and user has not voted, all result fields are null.

### Implementation

- [ ] T040 [US3] Implement `PollService.computePollResults(poll: Poll, currentUserId: string): EnrichedPollOptions` in `src/domain/collaboration/poll/poll.service.ts`: (1) load all `PollVote` rows for the poll; (2) build `Map<optionId, PollVote[]>` in memory; (3) compute `totalVotes = PollVote.length`; (4) for each option compute `voteCount = votesForOption.length` and `votePercentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : null`; (5) sort options by `voteCount DESC, sortOrder ASC`; (6) set `voterIds = votesForOption.map(v => v.createdBy)` (used by voters field resolver)
- [ ] T041 [US3] Implement server-side visibility/detail filtering in `PollService.applyVisibilityRules()` in `src/domain/collaboration/poll/poll.service.ts`: apply the 6-cell matrix from data-model.md — `resultsVisibility × hasVoted` determines whether to return `totalVotes`, `voteCount`, `votePercentage`, and `voterIds`; `resultsDetail` further nulls out fields per rule (PERCENTAGE nulls voteCount+voters; COUNT nulls votePercentage+voters; FULL returns all); result: each enriched option has correct fields set to `null` or value per the matrix
- [ ] T042 [US3] Implement `Poll.canSeeDetailedResults` derived field: `true` when the current user has a `PollVote` record for this poll OR `settings.resultsVisibility === VISIBLE`; compute in `PollService.canUserSeeDetailedResults(poll, userId)` and expose via `@ResolveField(() => Boolean)` in `src/domain/collaboration/poll/poll.resolver.fields.ts`
- [ ] T043 [US3] Add `Poll.options` field resolver in `src/domain/collaboration/poll/poll.resolver.fields.ts`: `@ResolveField(() => [IPollOption])` — call `PollService.computePollResults()` then `PollService.applyVisibilityRules()` using current user ID and whether user has voted; return enriched, sorted `IPollOption[]`
- [ ] T044 [US3] Add `Poll.totalVotes` field resolver in `src/domain/collaboration/poll/poll.resolver.fields.ts`: return `totalVotes` from results computation per the data-model.md 6-cell visibility matrix — `HIDDEN + not voted → null`; `HIDDEN + voted → value`; `TOTAL_ONLY + not voted → value` (total count is the one thing revealed before voting in TOTAL_ONLY mode); `TOTAL_ONLY + voted → value`; `VISIBLE + either → value`. Note: `TOTAL_ONLY` reveals the aggregate count but no per-option breakdown — totalVotes is the only non-null result field in that state when the user has not voted.
- [ ] T045 [US3] Implement DataLoader for voter identity resolution in `src/domain/collaboration/poll/poll.voter.dataloader.ts`: batch-load `IUser` objects by array of `createdBy` UUIDs using a single user-service query; register as a request-scoped DataLoader in the NestJS module; use in `PollOption.voters` `@ResolveField` resolver to avoid N+1 when multiple options each have voter lists
- [ ] T046 [US3] Add `PollOption.voters` field resolver using the DataLoader from T045: when `voterIds` is non-null (per visibility rules), call `dataLoader.loadMany(voterIds)` and return resolved `IUser[]`; return `null` otherwise
- [ ] T047 [US3] Add unit tests in `src/domain/collaboration/poll/poll.service.spec.ts` for results computation and visibility: (a) options sorted by `voteCount DESC, sortOrder ASC` with ties; (b) `HIDDEN + not voted` nulls all result fields; (c) `HIDDEN + voted` shows full results; (d) `TOTAL_ONLY + not voted` shows only `totalVotes`; (e) `VISIBLE` always shows results; (f) `resultsDetail = PERCENTAGE` nulls `voteCount` and `voters`; (g) `resultsDetail = COUNT` nulls `votePercentage` and `voters`; (h) `votePercentage = null` when `totalVotes = 0`

**Checkpoint**: Poll results are correctly ranked, visibility-gated, and detail-filtered. Any space member can view results according to poll settings.

---

## Phase 6: User Story 5 — Editing Poll Options (Priority: P5)

**Goal**: Users with Callout edit permissions can add options, update option text (deletes affected votes + notifies voters), remove options with minimum-options guard (deletes affected votes + notifies voters), and reorder options. All changes are immediately visible.

**Independent Test**: (add) After US1 creates a 3-option poll, calling `addPollOption({ pollID, text: "Thursday" })` returns a poll with 4 options and the new option has `sortOrder = 4`. (remove) Calling `removePollOption` on an option with 2 remaining would return a validation error. (reorder) Calling `reorderPollOptions` with a list containing an extra ID returns a domain error. (update) Calling `updatePollOption` on an option that a user voted for removes that user's vote (verified by `poll.options` showing `voteCount` reduced).

_Note_: Full notification delivery for these mutations is wired in Phase 7 (US6). The mutations complete correctly without notifications until US6 is integrated.

### Implementation

- [ ] T048 [P] [US5] Create `AddPollOptionInput`, `UpdatePollOptionInput`, `RemovePollOptionInput`, `ReorderPollOptionsInput` DTOs in `src/domain/collaboration/poll/dto/poll.dto.option.ts`:
  - `AddPollOptionInput`: `pollID: UUID!`, `text: String!` (max 512 chars)
  - `UpdatePollOptionInput`: `pollID: UUID!`, `optionID: UUID!`, `text: String!` (max 512 chars)
  - `RemovePollOptionInput`: `pollID: UUID!`, `optionID: UUID!`
  - `ReorderPollOptionsInput`: `pollID: UUID!`, `optionIDs: [UUID!]!`
- [ ] T049 [US5] Implement `PollService.addOption(pollId, text): Promise<Poll>` in `src/domain/collaboration/poll/poll.service.ts`: create new `PollOption` with `sortOrder = max(existingOptions.sortOrder) + 1`; persist; return updated `Poll` (notification hook placeholder: `// TODO US6: dispatch SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON to all existing voters`)
- [ ] T050 [US5] Implement `PollService.updateOption(pollId, optionId, newText): Promise<{ poll: Poll; deletedVoterIds: string[] }>` in `src/domain/collaboration/poll/poll.service.ts`: (1) load all `PollVote` rows where `selectedOptionIds` contains `optionId` (JSONB `@>` containment query); (2) delete those `PollVote` rows entirely; (3) update `poll_option.text` and set `updatedDate`; (4) return updated `Poll` and list of `deletedVoterIds` (for notification dispatch in US6) (notification hook placeholder: `// TODO US6: dispatch VOTE_AFFECTED_BY_OPTION_CHANGE to deletedVoterIds and POLL_MODIFIED to remaining voters`)
- [ ] T051 [US5] Implement `PollService.removeOption(pollId, optionId): Promise<{ poll: Poll; deletedVoterIds: string[] }>` in `src/domain/collaboration/poll/poll.service.ts`: (1) enforce minimum-options guard: count current options; if count ≤ 2 throw validation error "Poll must retain at least 2 options"; (2) load and delete all `PollVote` rows containing `optionId`; (3) delete `poll_option` row; (4) re-sequence `sortOrder` for remaining options (sequential 1, 2, 3…) in a transaction; (5) return updated `Poll` and `deletedVoterIds` (notification hook placeholder: `// TODO US6: dispatch VOTE_AFFECTED_BY_OPTION_CHANGE to deletedVoterIds; dispatch POLL_MODIFIED_ON_POLL_I_VOTED_ON to remaining voters (all PollVote.createdBy for this poll minus deletedVoterIds)`)
- [ ] T052 [US5] Implement `PollService.reorderOptions(pollId, orderedOptionIds: string[]): Promise<Poll>` in `src/domain/collaboration/poll/poll.service.ts`: (1) validate `orderedOptionIds` contains exactly the same set of IDs as current `poll.options` (no additions, no omissions — symmetric diff must be empty); (2) two-pass update in a transaction: Pass 1 — assign temp negative `sortOrder` values (`-1, -2, -3…`) to all options to avoid the UNIQUE `(pollId, sortOrder)` constraint; Pass 2 — assign final sequential values (`1, 2, 3…`) per `orderedOptionIds`; (3) return updated `Poll` (notification hook placeholder: `// TODO US6: dispatch POLL_MODIFIED to all voters`)
- [ ] T053 [US5] Add `addPollOption`, `updatePollOption`, `removePollOption`, `reorderPollOptions` mutations to `src/domain/collaboration/poll/poll.resolver.mutations.ts`: each mutation enforces `UPDATE` privilege on the parent `Callout` (checked via `PollAuthorizationService` or parent authorization service); each returns `Poll!` (the updated poll including enriched options)
- [ ] T054 [US5] Add unit tests in `src/domain/collaboration/poll/poll.service.spec.ts` for option management: (a) `removeOption` rejects when poll has exactly 2 options; (b) `removeOption` deletes affected `PollVote` rows and returns their voter IDs; (c) `reorderOptions` rejects mismatched ID list (missing ID, extra ID); (d) `reorderOptions` two-pass update preserves vote counts; (e) `updateOption` deletes all votes containing the target option; (f) `addOption` assigns `sortOrder = max + 1`

**Checkpoint**: All four option-management mutations work. Vote cleanup on option removal/edit is correct. Notifications are stubbed but not yet dispatched.

---

## Phase 7: User Story 6 — Callout Creator & Voter Notifications (Priority: P6)

**Goal**: Four notification events are delivered via the existing dual-channel notification infrastructure: (1) creator notified on every vote; (2) existing voters notified when another vote is cast; (3) voters notified when their vote is deleted by option change; (4) unaffected voters notified when poll is modified.

**Independent Test**: After US2 casts vote as Member B, Member A (Callout creator) receives an in-app notification with event type `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_OWN_POLL`. When Member A updates poll option text that Member B voted for, Member B receives `SPACE_COLLABORATION_POLL_VOTE_AFFECTED_BY_OPTION_CHANGE`. Member A does not receive a notification when voting on their own poll.

_Note_: US6 completes the notification hooks introduced as `// TODO US6` comments in US2 (T037) and US5 (T049–T052).

### Infrastructure (parallel, no inter-dependencies)

- [ ] T055 [P] [US6] Add 4 new values to `NotificationEvent` enum in the file identified in T002: `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_OWN_POLL`, `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_POLL_I_VOTED_ON`, `SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON`, `SPACE_COLLABORATION_POLL_VOTE_AFFECTED_BY_OPTION_CHANGE`
- [ ] T056 [P] [US6] Add 4 preference fields to `IUserSettingsNotificationSpaceBase` interface in `src/domain/community/user-settings/user.settings.notification.space.interface.ts`: `collaborationPollVoteCastOnOwnPoll`, `collaborationPollVoteCastOnPollIVotedOn`, `collaborationPollModifiedOnPollIVotedOn`, `collaborationPollVoteAffectedByOptionChange` — all typed as `IUserSettingsNotificationChannels!`; use same field type as existing `collaborationCalloutContribution` or equivalent peer field
- [ ] T057 [P] [US6] Create 4 notification input DTO files in `src/services/adapters/notification-adapter/dto/space/`:
  - `notification.dto.input.space.collaboration.poll.vote.cast.on.own.poll.ts`
  - `notification.dto.input.space.collaboration.poll.vote.cast.on.poll.i.voted.on.ts`
  - `notification.dto.input.space.collaboration.poll.modified.on.poll.i.voted.on.ts`
  - `notification.dto.input.space.collaboration.poll.vote.affected.by.option.change.ts`
    Each DTO contains `spaceID`, `calloutID`, `pollID`, `triggeredByUserID`, and any event-specific fields; model after the existing `NotificationCalloutContributionCreated` DTO pattern
- [ ] T058 [P] [US6] Create in-app notification payload DTO in `src/platform/in-app-notification-payload/dto/space/notification.in.app.payload.space.collaboration.poll.ts` — follow the pattern of existing in-app payload DTOs for callout events

### Adapter & Recipients (after T055–T058)

- [ ] T059 [US6] Add 4 notification dispatch methods to `NotificationSpaceAdapter` in `src/services/adapters/notification-adapter/notification.space.adapter.ts`:
  - `spaceCollaborationPollVoteCastOnOwnPoll(dto)` → `NotificationEvent.SPACE_COLLABORATION_POLL_VOTE_CAST_ON_OWN_POLL`
  - `spaceCollaborationPollVoteCastOnPollIVotedOn(dto)` → `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_POLL_I_VOTED_ON`
  - `spaceCollaborationPollModifiedOnPollIVotedOn(dto)` → `SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON`
  - `spaceCollaborationPollVoteAffectedByOptionChange(dto)` → `SPACE_COLLABORATION_POLL_VOTE_AFFECTED_BY_OPTION_CHANGE`
- [ ] T060 [US6] Add poll notification recipient resolution cases in `src/services/api/notification-recipients/notification.recipients.service.ts`:
  - **(a) `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_OWN_POLL`** — recipient is the Callout creator. The creator's user ID is resolved **before the DTO is built** (in T061, inside `PollVoteService.castVote()`) via a 3-step join: `pollId → poll.framing → framing.callout → callout.createdBy`. Concretely: load the Poll with `relations: { framing: { callout: true } }` and `select: { id: true, framing: { id: true, callout: { id: true, createdBy: true } } }`; expose this as a helper method `PollService.getCalloutCreatorIdForPoll(pollId: string): Promise<string>`. The resolved `createdBy` UUID is placed in the DTO's `userID` field. In the recipients service, handle this event with `credentialCriteria = this.getUserSelfCriteria(userID)` — same pattern as `SPACE_COMMUNITY_CALENDAR_EVENT_COMMENT`.
  - **(b) `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_POLL_I_VOTED_ON`** — recipients are all prior voters. Load all `PollVote.createdBy` for the poll (already in memory from the castVote flow); exclude the current voter's ID. Pass each recipient ID individually or as a list; dispatch one notification per recipient using `getUserSelfCriteria(recipientId)`.
  - **(c) `SPACE_COLLABORATION_POLL_VOTE_AFFECTED_BY_OPTION_CHANGE`** — recipients are the `deletedVoterIds` list returned by `PollService.updateOption()` or `PollService.removeOption()`. Dispatch one notification per ID using `getUserSelfCriteria(recipientId)`.
  - **(d) `SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON`** — recipients are all current voters, excluding any in the `deletedVoterIds` set. Load all `PollVote.createdBy` for the poll; subtract `deletedVoterIds`; dispatch one notification per remaining ID using `getUserSelfCriteria(recipientId)`.

### Notification wiring (after T059–T060)

- [ ] T061 [US6] Wire notification dispatch in `PollVoteService.castVote()` (from T036): after vote persist — (1) call `PollService.getCalloutCreatorIdForPoll(pollId)` (see T060a) to resolve the creator; if creator ≠ current voter, dispatch `spaceCollaborationPollVoteCastOnOwnPoll` with `userID = creatorId` (FR-022 self-notification exclusion); set `creatorNotified = (creator !== currentVoter)`; (2) from the votes already loaded in step (1) of castVote, collect prior voter IDs, exclude current voter, **and exclude `creatorId` when `creatorNotified = true`** (FR-020b dedup: when FR-020a was dispatched to the creator, the creator MUST NOT also receive FR-020b for the same event — FR-020a takes precedence), dispatch `spaceCollaborationPollVoteCastOnPollIVotedOn` per remaining recipient
- [ ] T062 [US6] Wire `SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON` in `PollService.addOption()` and `PollService.reorderOptions()` (from T049, T052): after persist, load current voter IDs and dispatch `spaceCollaborationPollModifiedOnPollIVotedOn` to each
- [ ] T063 [US6] Wire dual-notification in `PollService.updateOption()` (from T050): (1) dispatch `spaceCollaborationPollVoteAffectedByOptionChange` to `deletedVoterIds`; (2) dispatch `spaceCollaborationPollModifiedOnPollIVotedOn` to remaining voters whose vote was not deleted (all voters minus `deletedVoterIds`)
- [ ] T064 [US6] Wire dual notifications in `PollService.removeOption()` (from T051): (1) dispatch `spaceCollaborationPollVoteAffectedByOptionChange` to `deletedVoterIds`; (2) load all current `PollVote.createdBy` for the poll (after deletion), subtract `deletedVoterIds`, dispatch `spaceCollaborationPollModifiedOnPollIVotedOn` to each remaining voter — mirrors the dual-dispatch pattern in T063 (`updateOption`) and satisfies FR-020d ("options removed where the recipient did not vote for the removed option" triggers `collaborationPollModifiedOnPollIVotedOn`)
- [ ] T065 [US6] Add unit tests in `src/services/api/notification-recipients/notification.recipients.service.spec.ts` for poll recipient resolution: (a) self-notification exclusion for creator-is-voter case (FR-022: creator votes on own poll → no FR-020a dispatched); (b) empty prior-voters list produces no notification dispatch; (c) `POLL_VOTE_CAST_ON_POLL_I_VOTED_ON` excludes the current voter from recipient list; (d) `POLL_MODIFIED` excludes voters in the `deletedVoterIds` set; **(e) `removePollOption` dual-dispatch: when option is removed with 2 affected voters and 3 unaffected voters, `VOTE_AFFECTED_BY_OPTION_CHANGE` is dispatched to the 2 affected voters and `POLL_MODIFIED_ON_POLL_I_VOTED_ON` is dispatched to the 3 unaffected voters (H1 coverage)**; **(f) creator-voted dedup (H2): when the Callout creator has previously voted on the poll and Member B casts a new vote — creator receives `POLL_VOTE_CAST_ON_OWN_POLL` (FR-020a) and is NOT included in the `POLL_VOTE_CAST_ON_POLL_I_VOTED_ON` (FR-020b) recipient list for that same event**

**Checkpoint**: All four notification events fire with correct recipients. Self-notification is suppressed. Voter notifications fire on option removal and text edit.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation fixes, schema contract generation, lint/test verification, migration validation, quickstart smoke test.

- [ ] T066 [P] Fix `specs/038-community-polls/quickstart.md` — H1 fix: update all read queries to use `poll { settings { minResponses maxResponses resultsVisibility resultsDetail } status ... }` instead of flat `poll.minResponses` etc. (Steps 1, 4, and Settings Verification section)
- [ ] T067 [P] Fix `specs/038-community-polls/quickstart.md` — H2 fix: update Multi-Select Poll Example mutation to wrap `minResponses`/`maxResponses` inside `settings: { minResponses: 1, maxResponses: 0 }` inside `CreatePollInput`
- [ ] T068 [P] Fix `specs/038-community-polls/plan.md` — H3 fix: update the Summary paragraph to replace "a background cleanup listener removes all Poll votes" with "DB-level `ON DELETE CASCADE` on `poll_vote.createdBy` (FK → user(id)) automatically removes PollVote rows when the user account is deleted — no application-level cleanup listener required"
- [ ] T069 Run `pnpm run migration:run` and confirm migration applies without error; run `pnpm run migration:revert` and confirm rollback completes; re-run `pnpm run migration:run` to restore the state. Also verify FK cascade behavior for FR-019: using `psql`, insert a test `poll_vote` row for a test user, delete the user row, and confirm the `poll_vote` row is automatically deleted by the DB cascade — this is the only verification of the `createdBy FK → user(id) ON DELETE CASCADE` guarantee.
- [ ] T070 [P] Run `pnpm run schema:print && pnpm run schema:sort`; diff against baseline with `pnpm run schema:diff`; review `change-report.json` for BREAKING changes — new types and fields are additive (no breaking changes expected); verify `Poll`, `PollOption`, `PollVote`, `PollSettings` types are present and `CalloutFraming.poll` field is added
- [ ] T071 [P] Run `pnpm lint` (tsc + Biome); fix any reported violations before marking complete — key rules: no `console.*` (use Winston), no explicit `any`, no unused imports
- [ ] T072 Run `pnpm test:ci:no:coverage` to verify all unit tests pass (T034, T039, T047, T054, T065)
- [ ] T073 [P] Validate the quickstart.md scenarios against the running server (`pnpm start:dev`): execute Steps 1–8 from the corrected quickstart.md using the `/gql` skill or GraphQL playground; verify each "Verify:" assertion passes

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational) ─┬─► Phase 3 (US1 - Create Poll)
                               ├─► Phase 4 (US2+US4 - Vote)       ← depends on US1 data to test
                               ├─► Phase 5 (US3 - Results)         ← depends on US2 votes to test
                               ├─► Phase 6 (US5 - Options)         ← depends on US1 data to test
                               └─► Phase 7 (US6 - Notifications)   ← depends on US2+US5 hooks
Phase 8 (Polish) ← depends on all phases complete
```

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 2 — no other story dependency
- **US2 (P2)**: Requires US1 data (a poll must exist to vote on); can be implemented independently once Phase 2 is complete
- **US3 (P3)**: Requires US2 to have cast votes for meaningful test data; implementation is independent of US2 code
- **US4 (P4)**: Implemented as the update branch in US2's `castVote()` — no additional story phase needed
- **US5 (P5)**: Requires US1 data; notification stubs reference US6 but mutations work without notifications
- **US6 (P6)**: Wires into US2 (`castVote`) and US5 (option mutations); must be done after US2 and US5 service methods exist

### Within Each Phase: Execution Order

1. [P] tasks in the phase run in parallel
2. DTOs/interfaces before services
3. Services before resolver mutations
4. Field resolvers after service methods that back them
5. Unit tests after the service method under test

---

## Parallel Execution Examples

### Phase 2 — Foundational

```
Parallel batch 1: T005, T006, T007            (enums — no dependencies)
Parallel batch 2: T008, T009, T010, T011      (interfaces — after enums)
Parallel batch 3: T012, T013, T014            (entities — after interfaces)
Parallel batch 4: T015, T016, T017, T018      (module skeletons — after entities)
Sequential:       T019, T020, T021            (module wiring — one at a time)
Sequential:       T022, T023, T024, T025      (CalloutFraming mods)
Sequential:       T026                        (migration — after all entity changes)
```

### Phase 3 — US1

```
Parallel batch 1: T027, T028                  (DTOs — no inter-dependencies)
Sequential:       T029                        (PollService.createPoll — after DTOs)
Parallel batch 2: T030, T031                  (auth service + DTO extension — after T029)
Sequential:       T032                        (CalloutFramingService — after T030, T031)
Sequential:       T033                        (field resolver — after T032)
Sequential:       T034                        (unit tests — after T029)
```

### Phase 7 — US6

```
Parallel batch 1: T055, T056, T057, T058      (enums, prefs, DTOs, payload — fully parallel)
Sequential:       T059                        (adapter methods — after T055–T058)
Sequential:       T060                        (recipients service — after T059)
Sequential:       T061, T062, T063, T064      (wiring — after T060; one mutation at a time)
Sequential:       T065                        (tests — after T061–T064)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T026 — CRITICAL, blocks everything)
3. Complete Phase 3: User Story 1 (T027–T034)
4. **STOP and VALIDATE**: Create a poll via `createCallout`; query it back; confirm static fields, options with `sortOrder`, and authorization errors for non-permitted users
5. Run migration, lint, and unit tests
6. Demo/review MVP

### Incremental Delivery

1. Phases 1–2 → Foundation ready (entities, modules, migration)
2. Phase 3 → Poll creation works → can be demoed
3. Phase 4 → Voting works → can be demoed with results
4. Phase 5 → Results visible to all members → core value delivered
5. Phase 6 → Option editing works → editorial controls complete
6. Phase 7 → Notifications → engagement loop closed
7. Phase 8 → Polish → production-ready

### Single-Developer Sequence

Complete phases in order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Stop at each **Checkpoint** to validate the story independently before proceeding.

---

## Notes

- **[P]** tasks touch different files with no dependency on incomplete work in the same phase — safe to run concurrently
- **[Story]** label maps each task to the user story for traceability; Setup/Foundational/Polish phases have no story label
- Notification dispatch (`castVote`, option mutations) is **synchronous** per existing callout notification pattern (research.md §7); this deviates from constitution Principle 4 but follows the established codebase pattern — documented in plan.md constitution check
- `settings` JSONB is **immutable after creation** — no update path exists; the resolver must reject any attempt to change it
- The two-pass `reorderOptions` transaction is required by the UNIQUE `(pollId, sortOrder)` constraint — do not simplify to a single pass
- `createdBy` FK `ON DELETE CASCADE` handles account deletion automatically at the DB level — no application listener needed
- DataLoader for voter resolution (T045) must be request-scoped to avoid cross-request cache poisoning
