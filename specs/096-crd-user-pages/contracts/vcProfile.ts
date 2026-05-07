/**
 * CRD Virtual Contributor profile view contracts.
 *
 * File location at implementation time:
 *   src/crd/components/virtualContributor/VCPageHero.tsx
 *   src/crd/components/virtualContributor/VCProfileSidebar.tsx
 *   src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx
 *   src/crd/components/virtualContributor/VCContentView.tsx
 *   src/crd/components/virtualContributor/VCPublicProfileView.tsx
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * The shared `CompactContributorCard` contract lives in `compactContributor.ts`
 * (used by the Host section here AND by the User profile's Organizations
 * sidebar — NOT by the Organization profile's Associates section).
 */

import type { ReactNode } from 'react';
import type { CompactContributorCardItem } from './compactContributor';
import type { ReferenceLink } from './organizationProfile';

/* ----------------------------- VCPageHero -------------------------------- */

/**
 * 2026-05-06 redesign: the hero gains two new structural elements introduced
 * by `prototype/src/app/pages/VCProfilePage.tsx`:
 *   - A "Virtual Contributor" type badge sitting beside the display name.
 *   - A row of skill-tag chips below the name, sourced from the VC's reserved
 *     `Keywords` tagset (resolved by the mapper via TagsetReservedName.Keywords
 *     against `vc.profile.tagsets[]`).
 *
 * The hero MUST NOT render a banner image (the prototype removes the banner)
 * and MUST NOT render a Message button (parity with current MUI VCPageBanner;
 * VCs are AI personas, not message recipients).
 */
export type VCPageHeroProps = {
  avatarImageUrl: string | null;
  displayName: string;
  /**
   * When `null` the Settings (gear) icon is hidden. When set, the icon links
   * to this URL (which is the existing MUI admin URL via
   * `buildSettingsUrl(vc.profile.url)` per FR-031).
   */
  settingsUrl: string | null;
  /**
   * i18n-resolved "Virtual Contributor" label rendered inside a small Badge
   * next to the display name (with a Bot icon). Resolved by the mapper from
   * `crd-profilePages:vcProfile.typeBadge`.
   */
  typeBadgeLabel: string;
  /**
   * Resolved keyword strings from `vc.profile.tagsets[]` filtered by
   * TagsetReservedName.Keywords. Empty array → the chip row is omitted entirely
   * (no header, no empty-state caption — same omission rule as the User profile
   * Tagsets block, FR-010a).
   */
  keywords: string[];
  /**
   * NOTE: VCs do NOT have a Message button (FR-030). This contract intentionally
   * omits `onSendMessage`.
   */
};

/* --------------------------- VCProfileSidebar ---------------------------- */

export type VCProfileSidebarProps = {
  /** Markdown rendering of `vc.profile.description`. */
  description: string | null;
  /**
   * Compact card showing the VC's provider (`vc.provider.profile`). `null` when
   * the VC has no provider (rare).
   */
  host: CompactContributorCardItem | null;
  /**
   * 2026-05-06 redesign: ALL references rendered as flat URL chips (no
   * social/non-social split). Deliberate divergence from current MUI which
   * silently discards the social subset; the redesigned right column does not
   * surface social references either, so MUI's split would lose UI. Parity
   * with the prototype's flat reference list. (FR-032 updated)
   */
  references: ReferenceLink[];
  /**
   * Body of Knowledge section data. `null` only for VCs with no BoK at all
   * (rare but possible — render nothing for the BoK section in that case).
   */
  bodyOfKnowledge: BodyOfKnowledge | null;
  /**
   * i18n-resolved labels. Several are PARITY REUSES of existing
   * `translation`-namespace keys (FR-102) — the mapper resolves them via
   * `t(...)` from the global namespace rather than introducing duplicates
   * under `crd-profilePages`.
   */
  labels: {
    descriptionTitle: string;
    hostTitle: string;
    /** Parity reuse — `components.profile.fields.references.title`. */
    referencesTitle: string;
    /** Parity reuse — `common.no-references`. */
    referencesEmpty: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.title`. */
    bodyOfKnowledgeTitle: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.privateBokTooltip`. */
    bodyOfKnowledgePrivateTooltip: string;
    /** Parity reuse — `buttons.visit`. */
    bodyOfKnowledgeVisitButton: string;
    /** Parity reuse — `components.profile.fields.bodyOfKnowledge.spaceBokDescription` (interpolates `{vcName}`). */
    bodyOfKnowledgeSpaceContextDescription: string;
    /**
     * Parity reuse — `components.profile.fields.engines.externalVCDescription`,
     * with `{engineName}` interpolated from `components.profile.fields.engines.externalAssistant`
     * (variant=assistant) or `components.profile.fields.engines.external` (other).
     */
    bodyOfKnowledgeExternalAssistantDescription: string;
    bodyOfKnowledgeExternalOtherDescription: string;
    /** Parity reuse — `components.card.privacy.private` with `entity: 'space'`. */
    privateSpaceLabel: string;
  };
};

/* --------------------- VCBodyOfKnowledgeSection -------------------------- */

/**
 * Discriminated-union BoK contract — the mapper produces one of three shapes
 * (research §4):
 *
 *  - `space` — VC backed by an Alkemio Space. Renders a SpaceCardHorizontal-
 *    equivalent CRD card linking to the space; falls back to "Private space"
 *    placeholder when `hasReadAccess === false`.
 *  - `knowledgeBase` — VC backed by an Alkemio Knowledge Base. Renders the
 *    description plus a Visit button, disabled when `hasReadAccess === false`.
 *  - `external` — VC with no BoK; renders the engine-type description.
 */
export type BodyOfKnowledge =
  | {
      kind: 'space';
      /**
       * Always populated. When `hasReadAccess === false`, the mapper produces
       * a placeholder `SpaceProfileSummary` matching current MUI parity:
       *   - `displayName: t('components.card.privacy.private', { entity: 'space' })`
       *   - `url: ''`, `id: ''`, `avatarImageUrl: null`, `level: 'L0'`
       * The view renders the same `SpaceCardHorizontal`-equivalent for both
       * read-allowed and private cases — no separate "Private space"
       * component (Q7 — match MUI).
       */
      spaceProfile: SpaceProfileSummary;
      hasReadAccess: boolean;
      /** vc.bodyOfKnowledgeDescription — rendered above the card regardless of read access. */
      description: string | null;
      /** vc.profile.displayName — used to interpolate the spaceBokDescription caption. */
      vcDisplayName: string;
      /**
       * i18n-resolved caption rendered above the space-backed card with the VC's
       * displayName interpolated in (e.g., "Spaces hosted by {{vcName}}…"). The
       * mapper calls `t('components.profile.fields.bodyOfKnowledge.spaceBokDescription', { vcName })`.
       * Pass an empty string when the consumer wants to suppress the caption.
       */
      spaceContextDescription: string;
    }
  | {
      kind: 'knowledgeBase';
      /**
       * Resolved by the mapper:
       *   description = useKnowledgeBase().knowledgeBaseDescription
       *               || t('virtualContributorSpaceSettings.placeholder')
       * Exact parity with current MUI `VCProfilePageView`'s
       * `knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')`.
       * The view receives a populated string and never branches on emptiness.
       */
      description: string;
      hasReadAccess: boolean;
      visitUrl: string;                  // ${vc.profile.url}/${KNOWLEDGE_BASE_PATH}
    }
  | {
      kind: 'external';
      /**
       * Fully i18n-resolved engine-type description. The mapper derives this
       * from `vc.aiPersona.engine` — when the engine is `OpenaiAssistant` it
       * resolves `externalAssistantDescription`; otherwise `externalGenericDescription`.
       * Both come from `components.profile.fields.engines.externalVCDescription`
       * with the engine name interpolated in. The view renders the string
       * through `MarkdownContent` (the description may contain a link).
       *
       * NOTE: an earlier draft of this contract declared `engineLabel: 'assistant' | 'other'`
       * and let the view resolve the copy. That was inverted in the implementation —
       * the integration layer owns translation resolution (FR-005), so the
       * resolved string crosses the boundary, not the discriminator.
       */
      description: string;
    };

export type SpaceProfileSummary = {
  id: string;
  url: string;
  displayName: string;
  level: 'L0' | 'L1' | 'L2';
  avatarImageUrl: string | null;
};

export type VCBodyOfKnowledgeSectionProps = {
  bodyOfKnowledge: BodyOfKnowledge;
  labels: VCProfileSidebarProps['labels'];
};

/* ----------------------------- VCContentView ----------------------------- */

/**
 * 2026-05-06 redesign — research §15:
 *
 * The right column was rebuilt per `prototype/src/app/pages/VCProfilePage.tsx`
 * to render three card-grid sections (Functionality / AI Engine / Monitoring).
 * The data extraction logic is the same as the existing MUI hook
 * `useTemporaryHardCodedVCProfilePageData(modelCard)`; the labels/copy are
 * moved to the `crd-profilePages` i18n namespace; the two MUI
 * `dangerouslySetInnerHTML` calls are replaced by `<Trans>`.
 *
 * The MUI hook is NOT imported by the CRD layer (it lives under
 * `src/domain/`, off-limits per CRD architectural rules). The CRD mapper
 * re-implements the equivalent extraction in plain TypeScript locally.
 *
 * The earlier `ModelCardSummary` shape (single object with aiEngine +
 * monitoring sub-objects) is replaced by the three structured section shapes
 * below. The earlier "Social Links sub-section" inside the right column is
 * also removed — the redesigned right column does not surface social
 * references at all (sidebar's References block now renders all entries flat).
 */

/**
 * One bullet row for the Functionality section's Capabilities + Data Access
 * cards. The mapper produces one BulletItem per `flag` in the matching
 * `modelCard.spaceUsage[…].flags[]` entry, resolving the human-readable
 * `label` from a per-flag-name i18n key.
 */
export type BulletItem = {
  label: string;                           // i18n-resolved
  enabled: boolean;                        // → Check (foreground) when true; Minus (muted) when false
};

/**
 * One transparency card in the AI Engine section. The mapper produces six in
 * a fixed order (see VCAiEngineSectionData). Each card has an icon, title,
 * description, and exactly ONE answer field populated. The union below
 * encodes that invariant at the type level: setting two answer fields on the
 * same card is a compile-time error.
 *  - `booleanAnswer`: renders Yes/No row with CheckCircle2 / XCircle (or noIcon override)
 *  - `textValue`: renders plain text answer (Physical Location)
 *  - `action`: renders an outlined Button linking to a URL (Technical References),
 *    OR an italic muted "Not available" caption when href === ''
 */
type TransparencyCardBase = {
  /** Stable iterator key (e.g., 'openModelTransparency'). */
  id: string;
  /** Mapped to a lucide-react component inside the view. */
  iconName:
    | 'eye'
    | 'database'
    | 'shieldCheck'
    | 'globe'
    | 'mapPin'
    | 'fileText';
  title: string;                           // i18n-resolved
  description: string;                     // i18n-resolved caption ("Does the VC use…?")
};

type TransparencyBooleanCard = TransparencyCardBase & {
  /** Boolean answer — renders Yes/No glyph row. */
  booleanAnswer: { value: boolean; noIcon?: 'clock' | 'xCircle' };
  textValue?: never;
  action?: never;
};

type TransparencyTextCard = TransparencyCardBase & {
  booleanAnswer?: never;
  /** Plain text answer — renders as `<span>{textValue}</span>`. */
  textValue: string;
  action?: never;
};

type TransparencyActionCard = TransparencyCardBase & {
  booleanAnswer?: never;
  textValue?: never;
  /**
   * Action answer — renders an outlined Button. When `href === ''`, the view
   * renders an italic muted "Not available" caption instead (mapper passes
   * an empty href when `aiEngine.additionalTechnicalDetails` is empty).
   */
  action: { href: string; label: string };
};

export type TransparencyCardData =
  | TransparencyBooleanCard
  | TransparencyTextCard
  | TransparencyActionCard;

export type VCFunctionalitySectionData = {
  /** From modelCard.spaceUsage[…SpaceCapabilities].flags[] */
  capabilities: BulletItem[];
  /** From modelCard.spaceUsage[…SpaceDataAccess].flags[] */
  dataAccess: BulletItem[];
  /**
   * Discriminated kind. The mapper resolves `'memberRequired'` when
   * `spaceUsage[…SpaceRoleRequired].flags` contains `SpaceRoleMember.enabled === true`,
   * else `'noneRequired'`. The view renders different copy per kind:
   *  - 'memberRequired' → "This VC needs to be granted **member rights**…"
   *    rendered via `<Trans i18nKey={memberRequiredKey} components={{ strong: <strong /> }} />`
   *  - 'noneRequired' → plain "No special member rights required" paragraph.
   */
  roleRequirements: { kind: 'memberRequired' | 'noneRequired' };
};

export type VCAiEngineSectionData = {
  /**
   * i18n-resolved engine display name. The mapper picks one of three keys
   * based on `modelCard.aiEngine.isExternal` + `isAssistant`:
   *   - `vcProfile.aiEngine.engineName.alkemio`     when !isExternal && !isAssistant
   *   - `vcProfile.aiEngine.engineName.assistant`   when isAssistant
   *   - `vcProfile.aiEngine.engineName.external`    when isExternal && !isAssistant
   */
  engineName: string;
  /** Always exactly six entries, in fixed prototype order. */
  cards: TransparencyCardData[];
};

export type VCMonitoringSectionData = {
  /**
   * The view passes these keys directly to `<Trans>` (the body key contains
   * `<a>` markup; the view supplies the `<a>` component with the hard-coded
   * T&C href). Heading uses `t()` directly.
   */
  headingKey: string;                      // e.g., 'crd-profilePages:vcProfile.monitoring.heading'
  bodyKey: string;                         // e.g., 'crd-profilePages:vcProfile.monitoring.body'
};

export type VCContentViewProps = {
  functionality: VCFunctionalitySectionData;
  aiEngine: VCAiEngineSectionData;
  monitoring: VCMonitoringSectionData;
  /**
   * i18n-resolved labels for the Functionality + AI Engine sections. The
   * Monitoring section's labels are not in this object because they're keys
   * passed straight to `<Trans>` (see `VCMonitoringSectionData`).
   */
  labels: {
    functionalityHeading: string;          // "Functionality"
    capabilitiesTitle: string;             // "Functional Capabilities"
    dataAccessTitle: string;               // "Data access from the Space where it is a member"
    roleRequirementsTitle: string;         // "Role Requirements"
    /** i18n KEY (not resolved) — passed to <Trans> with `<strong>` component. */
    roleRequirementsMemberRequiredKey: string;
    roleRequirementsNoneRequired: string;  // "No special member rights required" — plain string
    aiEngineHeading: string;               // resolved with engineName interpolated, e.g., "AI Engine: Alkemio AI"
    /**
     * Yes/No labels for the boolean transparency cards. The view picks the
     * correct one based on each card's `booleanAnswer.value`.
     */
    yesAnswer: string;
    noAnswer: string;
    unknownAnswer: string;                 // "Unknown" — used for null isInteractionDataUsedForTraining and empty hostingLocation fallback
    technicalReferencesNotAvailable: string;  // italic muted caption when href === ''
  };
};

/* ----------------------- VCPublicProfileView ----------------------------- */

export type VCPublicProfileViewProps = {
  vc: {
    id: string;
    slug: string;
    isOwn: boolean;
    hasUpdatePrivilege: boolean;
    hero: VCPageHeroProps;
    sidebar: VCProfileSidebarProps;
    contentView: VCContentViewProps;
  };

  /**
   * Per-region loading flags (FR-009). Mapping (data-model.md "Query → region"):
   *   - `hero` / `sidebar` (excl. BoK) / `contentView`  ← useVirtualContributorProfileWithModelCardQuery
   *   - `bodyOfKnowledge`                                ← BoK auxiliary queries
   *     (useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery + useSpaceBodyOfKnowledgeAboutQuery
   *      for space-backed; useKnowledgeBase for knowledge-base-backed; n/a for external)
   *
   * The BoK section unblocks independently — the rest of the page can paint
   * before the auxiliary BoK queries resolve.
   */
  loading: {
    hero: boolean;
    sidebar: boolean;
    bodyOfKnowledge: boolean;
    contentView: boolean;
  };

  /**
   * i18n-resolved aria-labels for the per-region skeleton `<output>` containers
   * (WCAG 2.1 AA). Three entries — `bodyOfKnowledge` is rendered inside the
   * sidebar so it shares the sidebar label rather than getting its own. Resolved
   * from the `crd-profilePages` `common.loading.*` namespace.
   */
  loadingLabels: {
    hero: string;
    sidebar: string;
    contentView: string;
  };

  /** Optional slot for portals. */
  children?: ReactNode;
};
