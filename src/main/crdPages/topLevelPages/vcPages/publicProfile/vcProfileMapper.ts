import {
  AiPersonaEngine,
  AuthorizationPrivilege,
  TagsetReservedName,
  VirtualContributorBodyOfKnowledgeType,
  VirtualContributorModelCardEntry,
  VirtualContributorModelCardEntryFlagName,
} from '@/core/apollo/generated/graphql-schema';
import type { CompactContributorCardItem } from '@/crd/components/common/CompactContributorCard';
import type { VCAiEngineSectionData } from '@/crd/components/virtualContributor/VCAiEngineGrid';
import type {
  BodyOfKnowledge,
  SpaceProfileSummary,
} from '@/crd/components/virtualContributor/VCBodyOfKnowledgeSection';
import type { VCFunctionalitySectionData } from '@/crd/components/virtualContributor/VCFunctionalityGrid';
import type { ReferenceLink } from '@/crd/components/virtualContributor/VCProfileSidebar';
import type { TransparencyCardData } from '@/crd/components/virtualContributor/VCTransparencyCard';
import { fallbackInitials } from '@/crd/lib/fallbackInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { VirtualContributorModelFull } from '@/domain/community/virtualContributor/model/VirtualContributorModelFull';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';

/* ----------------------- BoK resolver ----------------------- */

export type BoKResolverInput = {
  vc: VirtualContributorModelFull | undefined;
  bokSpaceProfile?: { id?: string; displayName?: string; url?: string } | null;
  hasSpaceReadAccess?: boolean;
  knowledgeBaseDescription?: string;
  knowledgeBasePlaceholder: string;
  knowledgeBaseHasReadAccess?: boolean;
  privateSpaceLabel: string;
  externalAssistantDescription: string;
  externalGenericDescription: string;
  /**
   * Resolved caption rendered above the space-backed BoK card. Per FR-033 /
   * contracts/vcProfile.ts, this is `components.profile.fields.bodyOfKnowledge.spaceBokDescription`
   * with `{vcName}` already interpolated by the caller.
   */
  spaceContextDescription: string;
};

export const resolveBodyOfKnowledge = (input: BoKResolverInput): BodyOfKnowledge | null => {
  const { vc } = input;
  if (!vc) return null;
  const isExternal = vc.modelCard?.aiEngine?.isExternal ?? false;
  const type = vc.bodyOfKnowledgeType;

  if (type === VirtualContributorBodyOfKnowledgeType.AlkemioSpace) {
    const spaceId = input.hasSpaceReadAccess ? (input.bokSpaceProfile?.id ?? vc.bodyOfKnowledgeID ?? '') : '';
    const displayName = input.hasSpaceReadAccess ? (input.bokSpaceProfile?.displayName ?? '') : input.privateSpaceLabel;
    const spaceProfile: SpaceProfileSummary = {
      id: spaceId,
      url: input.hasSpaceReadAccess ? (input.bokSpaceProfile?.url ?? '') : '',
      displayName,
      level: 'L0',
      avatarImageUrl: null,
      color: pickColorFromId(spaceId || displayName),
      initials: fallbackInitials(displayName),
    };

    return {
      kind: 'space',
      spaceProfile,
      hasReadAccess: Boolean(input.hasSpaceReadAccess),
      description: vc.bodyOfKnowledgeDescription ?? null,
      vcDisplayName: vc.profile.displayName,
      spaceContextDescription: input.spaceContextDescription,
    };
  }

  if (type === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase) {
    return {
      kind: 'knowledgeBase',
      description: input.knowledgeBaseDescription || input.knowledgeBasePlaceholder,
      hasReadAccess: Boolean(input.knowledgeBaseHasReadAccess),
      visitUrl: `${vc.profile.url}/${KNOWLEDGE_BASE_PATH}`,
    };
  }

  if (isExternal) {
    const isAssistant = vc.aiPersona?.engine === AiPersonaEngine.OpenaiAssistant;
    return {
      kind: 'external',
      description: isAssistant ? input.externalAssistantDescription : input.externalGenericDescription,
    };
  }

  return null;
};

/* ----------------------- References (flat, FR-032) ----------------------- */

/**
 * 2026-05-06 redesign: references pass straight through (FR-032). The previous
 * social/non-social split is dropped — the redesigned right column does not
 * surface social references at all, so MUI's silent split-and-discard would
 * lose UI. Deliberate divergence from MUI documented in spec.md Session
 * 2026-05-06.
 */
export const mapVcReferences = (references: VirtualContributorModelFull['profile']['references']): ReferenceLink[] =>
  (references ?? []).map(r => ({
    id: r.id,
    name: r.name,
    uri: r.uri,
    description: r.description ?? null,
  }));

/* ----------------------- Host card ----------------------- */

export const mapHostCard = (vc: VirtualContributorModelFull | undefined): CompactContributorCardItem | null => {
  const provider = vc?.provider;
  if (!provider) return null;
  return {
    id: 'host',
    displayName: provider.profile.displayName,
    avatarImageUrl: provider.profile.avatar?.uri ?? null,
    caption: null,
    secondaryCaption: null,
    href: provider.profile.url,
  };
};

/* ----------------------- Settings href ----------------------- */

export const computeSettingsHref = (
  vc: VirtualContributorModelFull | undefined,
  myPrivileges: AuthorizationPrivilege[] | undefined,
  buildSettingsUrl: (url: string) => string
): string | null => {
  const hasUpdate = myPrivileges?.includes(AuthorizationPrivilege.Update);
  if (!hasUpdate || !vc?.profile?.url) return null;
  return buildSettingsUrl(vc.profile.url);
};

/* ----------------------- Hero keywords (FR-030) ----------------------- */

type TagsetLite = {
  name?: string | null;
  /** Reserved-name discriminator from the backend. */
  type?: string | null;
  tags?: string[] | null;
};

/**
 * Resolves the VC's reserved Keywords tagset from the raw GraphQL `tagsets`
 * array. Case-insensitive match on the reserved-name discriminator (parity
 * with the User profile mapper). Returns an empty array when the tagset is
 * missing or empty — the hero view's chip-row omission rule then fires.
 */
export const extractVcKeywords = (tagsets: TagsetLite[] | undefined | null): string[] => {
  if (!tagsets) return [];
  const keywordsTagset = tagsets.find(t => (t.name ?? '').toLowerCase() === TagsetReservedName.Keywords.toLowerCase());
  return keywordsTagset?.tags ?? [];
};

/* ----------------------- VC content view (Functionality / AI Engine / Monitoring) ----------------------- */

/**
 * Local fallback mirroring `EMPTY_MODEL_CARD` from
 * `src/domain/community/virtualContributor/model/VirtualContributorModelCardModel.ts`.
 * The constant is duplicated locally so the CRD layer never imports the
 * domain runtime value (FR-005 / data-model.md:557-588).
 */
const EMPTY_MODEL_CARD_FALLBACK = {
  spaceUsage: [
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceCapabilities,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityTagging, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCreateContent, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCommunityManagement, enabled: false },
      ],
    },
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceDataAccess,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessAbout, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessContent, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessSubspaces, enabled: false },
      ],
    },
    {
      modelCardEntry: VirtualContributorModelCardEntry.SpaceRoleRequired,
      flags: [
        { name: VirtualContributorModelCardEntryFlagName.SpaceRoleMember, enabled: false },
        { name: VirtualContributorModelCardEntryFlagName.SpaceRoleAdmin, enabled: false },
      ],
    },
  ],
  aiEngine: {
    isExternal: false,
    isAssistant: false,
    hostingLocation: '',
    isUsingOpenWeightsModel: false,
    isInteractionDataUsedForTraining: null as boolean | null,
    canAccessWebWhenAnswering: false,
    areAnswersRestrictedToBodyOfKnowledge: '',
    additionalTechnicalDetails: '',
  },
  monitoring: {
    isUsageMonitoredByAlkemio: true,
  },
};

type VCContentLabels = {
  // Functionality
  capabilitiesTagging: string;
  capabilitiesCreateContent: string;
  capabilitiesCommunityManagement: string;
  dataAccessAbout: string;
  dataAccessContent: string;
  dataAccessSubspaces: string;
  // AI Engine — engine display name (one-of, picked by mapper)
  engineNameAlkemio: string;
  engineNameAssistant: string;
  engineNameExternal: string;
  // AI Engine — heading template, e.g., "AI Engine: {{engineName}}"
  aiEngineHeadingFor: (engineName: string) => string;
  // AI Engine — card titles + descriptions
  cards: {
    openModelTransparency: { title: string; description: string };
    dataUsageDisclosure: { title: string; description: string };
    knowledgeRestriction: { title: string; description: string };
    webAccess: { title: string; description: string };
    physicalLocation: { title: string; description: string };
    technicalReferences: { title: string; description: string };
  };
  // AI Engine — Technical References button label
  seeDocumentation: string;
};

const FLAG_LABEL_BY_NAME: Record<string, (l: VCContentLabels) => string> = {
  [VirtualContributorModelCardEntryFlagName.SpaceCapabilityTagging]: l => l.capabilitiesTagging,
  [VirtualContributorModelCardEntryFlagName.SpaceCapabilityCreateContent]: l => l.capabilitiesCreateContent,
  [VirtualContributorModelCardEntryFlagName.SpaceCapabilityCommunityManagement]: l => l.capabilitiesCommunityManagement,
  [VirtualContributorModelCardEntryFlagName.SpaceDataAccessAbout]: l => l.dataAccessAbout,
  [VirtualContributorModelCardEntryFlagName.SpaceDataAccessContent]: l => l.dataAccessContent,
  [VirtualContributorModelCardEntryFlagName.SpaceDataAccessSubspaces]: l => l.dataAccessSubspaces,
};

/**
 * Re-implementation of the data-extraction logic that today lives in
 * `src/domain/community/virtualContributor/vcProfilePage/useTemporaryHardCodedVCProfilePageData.ts`.
 * The MUI hook itself is NOT imported (it lives under `src/domain/`, off-limits
 * per CRD architectural rules).
 */
export const mapVCFunctionality = (
  vc: VirtualContributorModelFull | undefined,
  labels: VCContentLabels
): VCFunctionalitySectionData => {
  const modelCard = vc?.modelCard ?? EMPTY_MODEL_CARD_FALLBACK;

  const findEntry = (entry: VirtualContributorModelCardEntry) =>
    modelCard.spaceUsage.find(e => e.modelCardEntry === entry);

  const capabilitiesEntry = findEntry(VirtualContributorModelCardEntry.SpaceCapabilities);
  const dataAccessEntry = findEntry(VirtualContributorModelCardEntry.SpaceDataAccess);
  const roleEntry = findEntry(VirtualContributorModelCardEntry.SpaceRoleRequired);

  const toBullets = (entry: typeof capabilitiesEntry) =>
    (entry?.flags ?? []).map(flag => ({
      label: FLAG_LABEL_BY_NAME[flag.name]?.(labels) ?? flag.name,
      enabled: flag.enabled,
    }));

  const memberRequired =
    roleEntry?.flags.some(f => f.name === VirtualContributorModelCardEntryFlagName.SpaceRoleMember && f.enabled) ??
    false;

  return {
    capabilities: toBullets(capabilitiesEntry),
    dataAccess: toBullets(dataAccessEntry),
    roleRequirements: { kind: memberRequired ? 'memberRequired' : 'noneRequired' },
  };
};

const resolveEngineName = (
  isExternal: boolean,
  isAssistant: boolean,
  labels: Pick<VCContentLabels, 'engineNameAlkemio' | 'engineNameAssistant' | 'engineNameExternal'>
): string => {
  if (isAssistant) return labels.engineNameAssistant;
  if (isExternal) return labels.engineNameExternal;
  return labels.engineNameAlkemio;
};

export const mapVCAiEngine = (
  vc: VirtualContributorModelFull | undefined,
  labels: VCContentLabels
): VCAiEngineSectionData => {
  const aiEngine = vc?.modelCard?.aiEngine ?? EMPTY_MODEL_CARD_FALLBACK.aiEngine;
  const engineName = resolveEngineName(aiEngine.isExternal, aiEngine.isAssistant, labels);

  const cards: TransparencyCardData[] = [
    {
      id: 'openModelTransparency',
      iconName: 'eye',
      title: labels.cards.openModelTransparency.title,
      description: labels.cards.openModelTransparency.description,
      booleanAnswer: { value: Boolean(aiEngine.isUsingOpenWeightsModel) },
    },
    {
      id: 'dataUsageDisclosure',
      iconName: 'database',
      title: labels.cards.dataUsageDisclosure.title,
      description: labels.cards.dataUsageDisclosure.description,
      // null → "Unknown" via the textValue fallback path the view already handles;
      // explicit false → "No"; explicit true → "Yes".
      ...(aiEngine.isInteractionDataUsedForTraining === null
        ? { textValue: '' } // empty string triggers the "Unknown" fallback in the view
        : { booleanAnswer: { value: aiEngine.isInteractionDataUsedForTraining } }),
    },
    {
      id: 'knowledgeRestriction',
      iconName: 'shieldCheck',
      title: labels.cards.knowledgeRestriction.title,
      description: labels.cards.knowledgeRestriction.description,
      // The field is a free-form string. Empty → "Unknown" via view fallback.
      textValue: aiEngine.areAnswersRestrictedToBodyOfKnowledge ?? '',
    },
    {
      id: 'webAccess',
      iconName: 'globe',
      title: labels.cards.webAccess.title,
      description: labels.cards.webAccess.description,
      // The prototype renders `Clock` for the No state on this specific card.
      booleanAnswer: { value: Boolean(aiEngine.canAccessWebWhenAnswering), noIcon: 'clock' },
    },
    {
      id: 'physicalLocation',
      iconName: 'mapPin',
      title: labels.cards.physicalLocation.title,
      description: labels.cards.physicalLocation.description,
      // Empty / 'unknown' (legacy literal) → "Unknown" via view fallback.
      textValue: aiEngine.hostingLocation ?? '',
    },
    {
      id: 'technicalReferences',
      iconName: 'fileText',
      title: labels.cards.technicalReferences.title,
      description: labels.cards.technicalReferences.description,
      // Empty href → the view renders the "Not available" italic caption.
      action: { href: aiEngine.additionalTechnicalDetails ?? '', label: labels.seeDocumentation },
    },
  ];

  return { engineName, cards };
};
