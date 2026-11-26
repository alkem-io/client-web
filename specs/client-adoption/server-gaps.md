# Group C consumer needs for Group S

Legacy behavior/source pin: `71f8ddcf7d0a97097a4de445c0ddc0c8a8ecb252`.
Inspected server SDL/source pin: `2b4e97752d1fd89ded57ef73462d4174541e95a5`.
This is the single initial handoff, grouped by view. It is not a complete audit
of the 152 pending routes or evidence that a declared field works at runtime.
No view below is accepted or marked served.

`C:` paths are relative to legacy `src/` at that pin. `S:` paths are relative to
server `internal/` at the inspected pin. New adapter paths are explicitly named.
Legacy operation/wrapper names locate evidence; they are not requested API shapes.
Group S owns the document-shaped, typed API and costed statements. Group C maps
that API into the existing components' props, then regenerates from its SDL.

Tree views need one subtree-backed request per batch using internal v0.1
`subtree_verdicts` semantics, with root, depth, types/kinds, selected fields and
requested privileges evaluated as one set. Disclosure follows the global surface
rules: neither READ nor READ_META is absent; READ_META-only supplies a locked
face, with any type-specific additional rule applied. The public API must not
expose raw verdict/JSON rows or recreate legacy lookup/role-set wrappers.

## Bootstrap shared by the views

| Consumer and evidence | Props/fields and behavior actually needed | Current evidence / unresolved binding |
| --- | --- | --- |
| Current-user/auth contexts: `C:domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx:24`; new `NativeAuthenticationProvider.tsx:12`, `NativeCurrentUserProvider.tsx:16` | Authenticated/loading/verified states; actor identity and available name/avatar/URL/PII; language/home/dashboard/sound preferences; account identity, creation affordances and entitlements; admin affordances from current verdicts. Preserve denied PII as absent. | The new viewer document generates against 2b4. Three observers share the same document, not three intended HTTP calls. The transplanted role/entitlement generator still records its historical 47aa declaration pin and must be requalified on the chosen S1 line; no authority or current-model qualification is inferred from that artifact. |
| Configuration contexts: `C:domain/platform/config/ConfigProvider.tsx:48`; new `native/legacyConfigDataMapper.ts:22` | Languages/default, declared links, boolean features, iframe allowlist, geo/telemetry, server version; existing loading/error behavior. | Two observers of one config document. Cache-only viewer-identity observation adds no intended HTTP. The synthetic Apollo dedup witness is not a browser count. Bootstrap also has a separate Kratos session read. |

## Tree and home views

The issued first C-V01 increment is **root text cards only** (server-go
`docs/spaces-deployable-increment@2de32bf759971366dbf2b14fa04dd5ffc2cd4e64`,
§1.2; Astra `68khvu2dzxgt` / `dkafwsqsolcd`). Its existing legacy root/layout
composition calls only new-server `spaces`, with SPACE/depth0/ACTIVE and FC-X1
root paging. Search, filters, children, images, leads, membership and account
state are visibly unavailable. The actual BFF login returns to `/spaces`;
logout remains unavailable until its real return contract is bound. No Viewer,
config, legacy, Matrix or alternate response path is used. The historical
152-route census remains intact; its runtime increment records the bounded
route cut. **C-V01 stays pending** until the composed live server, policy inputs,
real identity, browser/parity, root continuation and Pi evidence pass. This
source increment does not close child paging or the rest of the view row below.

| View and components / source | Used fields and behavior | Topology and Group S need |
| --- | --- | --- |
| **C-V01 Explorer**, `C:main/crdPages/spaces/useSpaceExplorer.ts:48,54,62,86,128,142`; card mapper `spaceCardDataMapper.ts:41,53` | Cards: id, display name, tagline, description where rendered, card/avatar URLs, canonical destination, tags, locked/content state, leads, parent identity/destination; ordering, search terms/type and opaque paging. Private visible cards must retain their about/apply destination; invisible nodes stay absent. | Legacy has a roots call plus one batched missing-parent child call, not one call per card. Adopt one subtree request per batch. Final signed **FC-X1** overrides fixed-size proposals: roots and each root's children use infinite scroll, no Load more, visible cards ×2 clamped [10,60], server max 200. No nested child connections. Roots+initial children and single-parent continuation need bounded cost statements/budgets. |
| **C-V02 Dashboard**, `C:main/crdPages/dashboard/DashboardPage.tsx:27`; `DashboardWithMemberships.tsx:117,120,131,149,153,166,176,222,232,422` | Membership-dependent layout; recent/home cards; hierarchy, admin/lead/member badges, image selection and destinations; hosted-space cards; sidebar account resources; pending requests; personal and space activity rows with their separate filters/cursors; current settings and permitted actions. Components include non-activity sections, activity feeds/dialogs and membership panel. Keep recent limit 5, home-first/fallback ordering and conditional sections. | Several reads cover the same tree. Current C0 outer native id-only membership probe is a **different** document from the unchanged legacy child reads and does not adopt them. One subtree-backed membership/view request must feed the rendered sections; the two differently filtered activity lists are distinct data needs, not redundant copies. Sidebar consumer `C:main/crdPages/dashboard/useDashboardSidebar.ts:35,88` uses hosted spaces/VCs/homepages/packs. |
| **C-V03 Host homepage**, `C:main/topLevelPages/Home/CrdHomePage.tsx:23`; `C:main/crdPages/innovationHub/hooks/useInnovationHubHomeData.ts:55`; `dataMappers/mapInnovationHubToHomeData.ts:34,91,105` | Existing home dispatcher, header/profile/banner/alt/edit affordance; ordered curated pack/contributor cards; filtered space cards, lead/parent faces and links. Keep explicit curated order, status selection separate from listing visibility, and complete-collection behavior. | The new home resolver query is trimmed to the actually consumed `resolve.homepage.id`; unrelated node/ancestor/space fields are removed. Home data sources generate against 2b4, but current generic URL fields are nullable while unchanged legacy cards require real destinations. Do not drop cards, fabricate URLs or change those components to compile. This also affects C-V01/C-V02: legacy references are `spaceCardDataMapper.ts:46,69`, `dashboardDataMappers.tsx:447,487`, and the homepage pack/contributor mappers above. Five composed type errors record this unresolved contract, not five proved runtime failures. |

Space/subspace pages, knowledge bases and collections remain pending per-view
component inventory. Their future handoff must include posts/responses under the
same production containment spine; the present document does not claim that
their full field sets have been audited.

The 2026-11-18 child-list increment replaces the dashboard/sidebar privilege-chain
and the existing subspaces dialog reads with `NativeSubspaces`: one
`spaces(filter: {parent, kind: SPACE}, first: 500, after)` document, parent
identity/settings in the same request, server order retained and opaque scroll
continuation. The temporary first500 instruction supersedes FC-X1's batch size;
FC-X1/011 FR-006's Relay topology and FC-S2's server ordering remain. Local client
tests cover 305 children, deeper selected parents, refreshed READ answers and
visible denied/unavailable reads. The mounted shared-reader/route/About producer,
the Actor-settings contract transition and deployed visitor/member recursive
navigation remain separate owning deliveries; no whole-space or served claim.

## Settings views

| View and components / source | Used props/fields and behavior | Current evidence / Group S need |
| --- | --- | --- |
| **C-V04 User or organization memberships**, `C:main/crdPages/topLevelPages/userPages/settings/membership/CrdUserMembershipTab.tsx:29`; `useMembershipEnrichment.ts:54,65`; organization `CrdOrgMembershipTab.tsx:37,44` | Hierarchical space identity/name/tagline/card/avatar/destination, lead faces, membership roles and permitted actions; current home-space/settings and pending states. | Legacy enrichment issues a cache-first read per distinct space. Replace that cold-cache fanout with one subtree-backed view request. Legacy wrapper IDs are evidence of old connector plumbing, not new API requirements. |
| **C-V05 User organizations**, `C:main/crdPages/topLevelPages/userPages/settings/organizations/CrdUserOrganizationsTab.tsx:38`; `useOrganizationEnrichment.ts:56,65` | Organization name/avatar/tagline/description/location/destination, verification state, associates count, current role and permitted membership actions. | Cold cache produces one enrichment read per organization. Need one set-shaped view request, preserving ordering and controls; do not rebuild lookup bags. |
| **C-V06 Organization account**, `C:main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx:52,58,64,94` | Organization display name, hosted resource collections, entitlement availability and existing delete actions/confirmation states. | Legacy follows organization → account in two sequential documents. Need one view document containing the rendered data; successful deletion intentionally refreshes it. Generic account/plan fields in the current SDL are partial source evidence, not this view's acceptance. |
| **C-V07 Organization associates**, `C:main/crdPages/topLevelPages/organizationPages/settings/community/useOrgAssociatesTabData.ts:136,147`; `C:domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts:93,120` | Associate rows and actor identity/type/email; pending applications/invitations and state; distinct manage/support/invite affordances; explicit mutation refresh. Keep the privilege-aware guard before the read. | The associates root is one legacy read, but pending entries add one actor read per distinct contributor. Need the view's faces/state/allowed actions in one set-shaped request. Preserve the 71f8 Associates URL/redirect and community-only support guard. |
| **C-V08 Space settings**, `C:main/crdPages/topLevelPages/spaceSettings/settings/useSettingsTabData.ts:37,67,101,122` | Existing settings view and shared unsaved bar: privacy/user visibility; membership policy, org-host trust, subspace-admin invitations, platform-support control; collaboration toggles; layout description mode. Buffered edits save together and discard restores the source. Host trust is shown only for organization hosts. | Current `Space.settings` is a JSON read; `setSettings` is declared as an Actor setting operation. No corresponding whole-space write is declared in the inspected SDL. Need the behavior through the new API, not a copied `updateSpaceSettings` wrapper or several per-toggle writes. |
| **C-V09 Space About**, `C:main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts:4,35,83` | Profile/about fields, references/uploads/visual constraints and crop state; classification definitions, displayed labels, cardinality, available values and selected values; staged additions/removals/conflicts committed by the existing Save action. | A CLASSIFICATION template kind does not itself serve the classification editing workflow. The existing new profile/file primitives need a coherent view/write binding; do not request separate legacy mutation names for each UI field. |
| **C-V10 Space layout**, `C:main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts:2,28,71,81,87` | Phase identity/name/description/order/layout/visibility/current state/default template, attached post count and collection; buffered reorder/move/save/reset plus existing immediate actions and confirmations. | Current Stage `{id,name}` and post stage operations are partial. The full view's lifecycle/layout actions and limits are not declared as a coherent contract. Serve the bounded contained collection, not per-phase reads. |
| **C-V11 Own-account Danger Zone**, `C:main/crdPages/topLevelPages/userPages/settings/account/useDeleteAccount.ts:25,70,128,150`; `CrdUserAccountTab.tsx:53,180` | Owner-only action, fresh-session state, can-delete, blocker rows(kind/resource identity/name/destination/self-resolvability), per-kind totals/truncation, typed-name confirmation, rollback/failure and reauthentication return. | No corresponding preflight/delete-user operation is declared in the inspected SDL. Group S supplies the new domain intent and data shape through its parking/erasure model; the client does not invent raw deletion or an ops command. Existing register reference: GAP-012. |
| **C-V12 Space storage**, `C:main/crdPages/topLevelPages/spaceSettings/storage/useStorageTabData.ts:17,23,43` | Existing folder/file tree, document identity/name/metadata, expansion state, deletion permission and confirmation; refresh after successful deletion. | File download/upload primitives are present but do not themselves provide this administrator tree/action binding. No fabricated empty storage result; view remains pending. |

## Common About metadata: consumer map and bounded transition

User direction `bhdv7hlcsze6`, clarified by Astra `mtpqu0w2t5xb`: **About** is
the common client-facing metadata concept for entities. It combines the existing
fixed profile fields with applicable declared sections. It does not create an
About entity, rename physical storage, duplicate fixed-field authority, or turn
the named `core.about` content section into the whole metadata model.

This supplement inspects client `4295f7a2eaf3dcf2ed542f69e2e6c79a82aff7f8`;
paths below are relative to its `src/`. The cited existing editor/control files
are unchanged from the legacy pin unless explicitly identified as the new
explorer mapper. This is a source map for existing C-V01/C-V09 and the historical
profile routes, not a new tracker or acceptance claim. Related server records are
`client-repoint.md` and ledger L017/L018/L039/L116/L121; their historical status
does not qualify the current client/v0.1 path.

| Existing consumer | Common metadata and concrete boundary |
| --- | --- |
| **C-V01 root cards**, new `main/crdPages/spaces/useSpaceExplorer.ts:8`, existing `crd/components/space/SpaceCard.tsx:22` | Exactly `displayName` and nullable `tagline` feed `name` and compact-card `description`. The latter means tagline; full description belongs to the expanded card's `what` (`SpaceCard.tsx:65`). Entity id, canonical URL, lifecycle and READ answer remain separate. No description, sections, editing, tags or visuals request is needed for increment1. |
| **Space/subspace About**, `crd/components/space/SpaceAboutView.tsx:28`, `main/crdPages/space/about/CrdSpaceAbout.tsx:119`, `main/crdPages/subspace/about/CrdSubspaceAbout.tsx:117` | Name, tagline, description and location overlap the fixed metadata contract; why/who, references, tags and classifications need their actual declarations. Host/leads, member metrics, join/apply and guidelines slots have separate resource/capability bindings and must not become implicit metadata permissions. Existing route and dialog share `SpaceAboutView`; no replacement page is needed. |
| **C-V09 Space editor**, `crd/components/space/settings/SpaceSettingsAboutView.types.ts:31`, `SpaceSettingsAboutView.tsx:246`, `main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts:633` | Existing name/tagline/location/what plus why/who, visuals, references, tags and classification editors use a tab buffer. Fixed description maps to `what`; why/who must become values of the actual named section, not another fixed-profile authority. Classification ids/schema/cardinality and visual limits must survive; do not render them as arbitrary text fields. |
| **User and organization profiles**, `crd/components/user/UserProfileSidebar.tsx:14`, `organization/OrganizationProfileSidebar.tsx:20`; editor shapes `user/settings/UserProfileTabView.types.ts:53`, `organization/settings/OrgProfileTabView.tsx:42` | Shared name/tagline/description/location, links and declared tag groups. User first/last name, email and phone, and organization contact/legal/verification fields retain their actual typed sources and individual gates; they are not copied into every entity's fixed metadata set. Social/reference display rules and location support differ in existing consumers and are not silently homogenized. |
| **VC profile**, `crd/components/virtualContributor/settings/VCProfileTabView.types.ts:44`, `VCProfileSidebar.tsx:13` | Name/tagline/description, keywords, avatar and references share existing controls; VC has no user location/PII form fields. Body-of-knowledge, host and service settings remain their own capabilities. The sidebar renders all references; it must not inherit the user/org social-reference split and lose rows. |
| **Homepage and pack metadata**, `crd/components/innovationHub/InnovationHubAboutTab.tsx:13`, `main/crdPages/innovationHub/hooks/useHubAboutTabData.ts:65`, `main/crdPages/innovationPack/useInnovationPackProfile.ts:34` | Homepage name/tagline/description/tags/banner and pack name/description/tags/references consume the same metadata concepts. Homepage subdomain is immutable; provider identity and template collections are separate data. Homepage currently saves each section; the actor/space editors buffer a whole tab. One contract must retain this difference until a visible save-behavior change is signed. |

The existing shared seams are sufficient to start without another page family:

- `crd/components/contributor/settings/ProfileFormFields.tsx:20,43,140` already
  supplies field blocks, text fields and image controls to User/Org/VC editors.
  `crd/components/common/SettingsSection.tsx:48`, `MarkdownContent`,
  `MarkdownEditor`, `ReferencesEditor` and `TagsInput` are reusable presentation.
  Space currently duplicates its field labels/blocks; it can consume the same
  controls when its declared field/edit binding is issued.
- `crd/components/common/profileTypes.ts:1,7` and
  `main/crdPages/topLevelPages/common/profileMapperHelpers.ts:15,23` already share
  reference/tag presentation shapes. These shapes contain no schema,
  applicability or permission authority and cannot stand in for section
  declarations. The inspected About/Profile views contain no general renderer
  consuming a declared section schema/read/write contract.
- `main/crdPages/utils/tabUnsavedChanges.ts:8` is the existing common save/discard
  boundary. `topLevelPages/common/profileChanges.ts:23,62` shares actor reference
  diff/save mechanics, while Space has a separate sequence at
  `spaceSettings/about/useAboutTabData.ts:633`. Reuse the UI buffer boundary;
  legacy per-reference mutation loops are not a required new-server API shape.

**Issued first transition:** server contract
`c86ac30b675cb5c7fa7d5c06e5c47edf3cb31dea` and executable SDL
`81d7bc091261a973600bbb9eccf340627fb63c93` replace the shared Profile/profile
surface with About/about, preserving storage, authority and field nullability.
The client regenerates all current documents against that exact SDL and maps
`about { displayName tagline }` into the same existing card props. No new JSX
component, route, broad metadata fragment, lookup per card or second legacy
request is added. Unsupported section/edit/visual capabilities remain absent.

Whole codegen also requires closing the previously unserved Viewer path:
root decisions `5qx513wdj6cz` and `mcyjjolevspr` authorize retiring both dormant
Viewer documents, their closed unreachable connector/import chain, and the
unused broad explorer fragment. The TypeScript import census found no
intersection between the 21 affected modules and the 248 modules reachable from
the current entry. The removed hub/home connector modules remain historical
pending routes in the existing census; the guard explicitly forbids restoring
them and continues to check the served legacy route/layout bindings. Underlying
CRD presentation is retained. This source completion does not mark a route
served or establish live server, BFF, two-stack or Pi acceptance.

For the next declared-section/edit unit, evolve the existing shared field
controls once, with ordinary text/markdown/reference/tag renderers selected by
the actual declaration schema. Rebind the existing shells instead of writing
per-kind About components. Each fixed field and section needs its real
applicability, read/write binding, validation and current value; an entity-wide
UPDATE flag, a returned null, or a missing binding does not authorize editing.
Do not manufacture `READ_ABOUT`, section permissions, empty successful sections,
or writable defaults. Current section/edit/visual/tag capabilities remain
unavailable in increment1; exact section SDL and write binding are Group S work.

## Messaging views (M1 source inventory)

| View and components / source | Used props and behavior | Current evidence / Group S need |
| --- | --- | --- |
| **C-V13 Unified chat list and closed badge**, `C:main/crdPages/unifiedChat/UnifiedChatPanelConnector.tsx:118,359`; `UnifiedChatLauncher.tsx:20`; `C:main/crdPages/unifiedChat/useUnifiedConversations.ts:30,124` | Stable conversation identity/name/avatar/member avatars/group flag, preview or attachment count, timestamp, unread count and selection; draft-preview replacement without reordering; loading/empty/search/select/new-message and `?chat` state. | Native Matrix sync supplies events/read markers and Room supplies basic counters/permissions. The view still needs canonical collection/member/header identity and unread-conversation total. Current viewer unread counts refer to notifications. Dormant Guidance controls filtered by the legacy source are not new requirements. |
| **C-V14 Selected conversation and group settings**, `C:main/crdPages/unifiedChat/UnifiedChatPanelConnector.tsx:144,235,325,382`; `C:main/userMessaging/useConversationView.ts:63,126,144,175` | Conversation/header/member identity and count; current actor; messages/author/time/own/pending state/reactions/media; compose/loading/sending/upload-policy/draft/error state. Preserve history paging/live redaction, failed-send draft restoration, focused+visible read marking, fresh contactability check, and existing group edit/member/leave confirmations. | Matrix history/send/reaction/redaction/read-marker routes exist. Header/member data and group lifecycle permissions/actions still need pairing. Actor.can.message exists but naming alone does not prove the legacy pre-send contactability behavior. See D01–D03 below. |
| **C-V15 New-chat dialog**, `C:main/crdPages/unifiedChat/UnifiedChatPanelConnector.tsx:65,369`; `C:main/crdPages/unifiedChat/useNewChat.ts:25,65` | Recipient identity/name/avatar/city/country, selected chips/query/loading/creating/removal state. Exclude self/already selected, open-or-create a persistent deduplicated direct conversation for one recipient or group for several, then select it. | Actor search/profile fields are available. The chat open/create/dedup/member/identity behavior remains a contract need; DIRECT/GROUP enum labels are not implementation evidence. |
| **C-V16 Callout or selected-response discussion**, `C:main/crdPages/space/hooks/useCrdRoomComments.tsx:90,151,179,249`; `CalloutCommentsConnector.tsx:67,84`; `CalloutDetailDialogConnector.tsx:970,984,1041`; `dataMappers/commentDataMapper.ts:19,100` | Existing CommentThread/Input: author/VC badge/profile destination, content/time/reply identity, own/count/name reactions, images/media, deletion/post/reply capabilities, current actor/mentions and draft/upload/error state; count and commentsEnabled. Preserve replies/deleted-parent placeholders, confirmation, one image+caption cleared only on confirmed send, subject switching, reopen freshness and readable history when posting is disabled. | Native Matrix history/relations/media/mentions and GraphQL Room/Actor fields exist. Host → discussion identity, face/capability/media/mention policy and count/reopen refresh need the exact binding. The legacy one network revalidation per eligible open is required freshness, not disposable duplicate polling. |

**D01 Session/origin/device:** legacy `C:core/matrix/MatrixSessionProvider.tsx:20`
and `mintSession.ts:5` use a different transport from the new cookie-session
contract. Available new fields are viewer.matrix userId/sessionBaseUrl/expiresAt,
whoami device identity, mandatory web/instance headers and the configured-origin
boundary (`S:adapter/matrixclient/session_boundary.go:56,76`). No token
fallback is inferred. Actual mobile/WebView pairing remains open.

**D02 Room/event identity:** legacy alias lookup
`C:main/userMessaging/matrix/matrixRooms.ts:41` is not the native room/space UUID
room contract. Native events are `$<UUID>` without a server suffix
(`S:adapter/matrixclient/ids.go:29,60`). Do not transplant the older helper
that reconstructs suffixed events or equate conversation / Matrix room / native room IDs.

**D03 Media/policy:** the existing attachment/caption/retry lifetime and rendered
MIME/size/capability/readable-byte props must survive. Native Matrix upload returns
content_uri and authenticated download/thumbnail are available
(`S:adapter/http/matrix_media.go:44,112`); `/api/files/{UUID}` also exists. Those
are different identities from legacy mediaId/externalReference/bucket-reference
URLs, not permission for a guessed conversion.

## Request evidence still required

Source call topology is not measured HTTP counts. Apollo may deduplicate identical
observers or satisfy cache-first reads; retries are separate attempts. Conversely,
distinct-ID membership/organization/pending-face enrichment remains cold-cache
fanout. The two dashboard activity filters are deliberately different.

No production Apollo polling call was found in M5's 71f8 scan. Relative-time
`useNow(30000)`, a 50ms debounce and 400ms IndexedDB readiness waits are not HTTP
polling. Native Matrix sync, notifications and assistant traffic need their own
request accounting. Each accepted route still requires both stacks, same persona
and acceptance data, 1440/390 screenshot+DOM/behavior checks, and measured request
counts/bytes/fetched-versus-used fields. No such acceptance is supplied here.

Every change to request count or shape, batching or scroll continuation also
requires a Pi performance check before it is done (user, 2026-10-30). The Group C
lead requests a slot from rpi-deployer with the exact ready candidate pin;
rpi-deployer owns all Pi mutations and schedules an owned instance or slot.
Use real acceptance data: the 305-child space, a sparse anonymous viewer, page
continuation and a member. Record the query plan, statement count, per-view
request count/shape and end-to-end HTTP p50/p95 against the previous Pi result,
identifying both pins and the tested shapes. Missing measurements remain an open
acceptance requirement. The public deployment changes only on an explicit
release instruction from the orchestrator.
