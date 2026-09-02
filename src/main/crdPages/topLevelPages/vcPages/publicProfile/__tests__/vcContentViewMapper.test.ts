import { describe, expect, it } from 'vitest';
import {
  VirtualContributorModelCardEntry,
  VirtualContributorModelCardEntryFlagName,
} from '@/core/apollo/generated/graphql-schema';
import type { VirtualContributorModelFull } from '@/domain/community/virtualContributor/model/VirtualContributorModelFull';
import { mapVCAiEngine, mapVCFunctionality } from '../vcProfileMapper';

const labels = {
  capabilitiesTagging: 'tag-label',
  capabilitiesCreateContent: 'create-label',
  capabilitiesCommunityManagement: 'invite-label',
  dataAccessAbout: 'about-label',
  dataAccessContent: 'content-label',
  dataAccessSubspaces: 'subspaces-label',
  engineNameAlkemio: 'Alkemio AI',
  engineNameAssistant: 'Assistant AI',
  engineNameExternal: 'External AI',
  aiEngineHeadingFor: (engineName: string) => `AI Engine: ${engineName}`,
  cards: {
    openModelTransparency: { title: 'omt-t', description: 'omt-d' },
    dataUsageDisclosure: { title: 'dud-t', description: 'dud-d' },
    knowledgeRestriction: { title: 'kr-t', description: 'kr-d' },
    webAccess: { title: 'wa-t', description: 'wa-d' },
    physicalLocation: { title: 'pl-t', description: 'pl-d' },
    technicalReferences: { title: 'tr-t', description: 'tr-d' },
  },
  seeDocumentation: 'SEE DOCS',
};

const buildVc = (overrides: Partial<VirtualContributorModelFull> = {}): VirtualContributorModelFull => ({
  id: 'vc-1',
  profile: { displayName: 'Test VC', url: '/vc/test' },
  modelCard: {
    spaceUsage: [
      {
        modelCardEntry: VirtualContributorModelCardEntry.SpaceCapabilities,
        flags: [
          { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityTagging, enabled: true },
          { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCreateContent, enabled: false },
          { name: VirtualContributorModelCardEntryFlagName.SpaceCapabilityCommunityManagement, enabled: false },
        ],
      },
      {
        modelCardEntry: VirtualContributorModelCardEntry.SpaceDataAccess,
        flags: [
          { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessAbout, enabled: true },
          { name: VirtualContributorModelCardEntryFlagName.SpaceDataAccessContent, enabled: true },
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
      hostingLocation: 'EU',
      isUsingOpenWeightsModel: true,
      isInteractionDataUsedForTraining: false,
      canAccessWebWhenAnswering: true,
      areAnswersRestrictedToBodyOfKnowledge: 'Yes',
      additionalTechnicalDetails: 'https://example.com/docs',
    },
    monitoring: { isUsageMonitoredByAlkemio: true },
  },
  aiPersona: { id: 'persona-1' },
  ...overrides,
});

describe('mapVCFunctionality', () => {
  it('returns all-disabled bullets for an empty/undefined model card (FR-034 fallback)', () => {
    const result = mapVCFunctionality(undefined, labels);
    expect(result.capabilities).toHaveLength(3);
    expect(result.capabilities.every(b => b.enabled === false)).toBe(true);
    expect(result.dataAccess.every(b => b.enabled === false)).toBe(true);
    expect(result.roleRequirements.kind).toBe('noneRequired');
  });

  it('maps mixed flags to BulletItem[] with correct enabled states + i18n labels', () => {
    const result = mapVCFunctionality(buildVc(), labels);
    expect(result.capabilities).toEqual([
      { label: 'tag-label', enabled: true },
      { label: 'create-label', enabled: false },
      { label: 'invite-label', enabled: false },
    ]);
    expect(result.dataAccess).toEqual([
      { label: 'about-label', enabled: true },
      { label: 'content-label', enabled: true },
      { label: 'subspaces-label', enabled: false },
    ]);
  });

  it('produces roleRequirements.kind === "memberRequired" when SpaceRoleMember is enabled', () => {
    const vc = buildVc();
    const roleEntry = vc.modelCard.spaceUsage.find(
      e => e.modelCardEntry === VirtualContributorModelCardEntry.SpaceRoleRequired
    );
    if (roleEntry) {
      const memberFlag = roleEntry.flags.find(f => f.name === VirtualContributorModelCardEntryFlagName.SpaceRoleMember);
      if (memberFlag) memberFlag.enabled = true;
    }
    expect(mapVCFunctionality(vc, labels).roleRequirements.kind).toBe('memberRequired');
  });

  it('produces roleRequirements.kind === "noneRequired" when SpaceRoleMember is missing or disabled', () => {
    expect(mapVCFunctionality(buildVc(), labels).roleRequirements.kind).toBe('noneRequired');
  });
});

describe('mapVCAiEngine', () => {
  it('resolves engineName to "Alkemio AI" when neither external nor assistant', () => {
    expect(mapVCAiEngine(buildVc(), labels).engineName).toBe('Alkemio AI');
  });

  it('resolves engineName to "Assistant AI" when isAssistant === true', () => {
    const vc = buildVc();
    vc.modelCard.aiEngine.isAssistant = true;
    expect(mapVCAiEngine(vc, labels).engineName).toBe('Assistant AI');
  });

  it('resolves engineName to "External AI" when isExternal && !isAssistant', () => {
    const vc = buildVc();
    vc.modelCard.aiEngine.isExternal = true;
    vc.modelCard.aiEngine.isAssistant = false;
    expect(mapVCAiEngine(vc, labels).engineName).toBe('External AI');
  });

  it('renders six cards in fixed order', () => {
    const result = mapVCAiEngine(buildVc(), labels);
    expect(result.cards.map(c => c.id)).toEqual([
      'openModelTransparency',
      'dataUsageDisclosure',
      'knowledgeRestriction',
      'webAccess',
      'physicalLocation',
      'technicalReferences',
    ]);
  });

  it('produces textValue (empty → Unknown via view fallback) for null isInteractionDataUsedForTraining', () => {
    const vc = buildVc();
    vc.modelCard.aiEngine.isInteractionDataUsedForTraining = null;
    const dataUsage = mapVCAiEngine(vc, labels).cards.find(c => c.id === 'dataUsageDisclosure');
    expect(dataUsage?.booleanAnswer).toBeUndefined();
    expect(dataUsage?.textValue).toBe('');
  });

  it('produces booleanAnswer for explicit true/false isInteractionDataUsedForTraining', () => {
    const vcFalse = buildVc();
    vcFalse.modelCard.aiEngine.isInteractionDataUsedForTraining = false;
    const dataUsageFalse = mapVCAiEngine(vcFalse, labels).cards.find(c => c.id === 'dataUsageDisclosure');
    expect(dataUsageFalse?.booleanAnswer?.value).toBe(false);

    const vcTrue = buildVc();
    vcTrue.modelCard.aiEngine.isInteractionDataUsedForTraining = true;
    const dataUsageTrue = mapVCAiEngine(vcTrue, labels).cards.find(c => c.id === 'dataUsageDisclosure');
    expect(dataUsageTrue?.booleanAnswer?.value).toBe(true);
  });

  it('uses Clock noIcon override on the Web Access card', () => {
    const webAccess = mapVCAiEngine(buildVc(), labels).cards.find(c => c.id === 'webAccess');
    expect(webAccess?.booleanAnswer?.noIcon).toBe('clock');
  });

  it('produces action.href === "" when additionalTechnicalDetails is empty', () => {
    const vc = buildVc();
    vc.modelCard.aiEngine.additionalTechnicalDetails = '';
    const techRefs = mapVCAiEngine(vc, labels).cards.find(c => c.id === 'technicalReferences');
    expect(techRefs?.action?.href).toBe('');
    expect(techRefs?.action?.label).toBe('SEE DOCS');
  });

  it('produces action.href with a real URL when additionalTechnicalDetails is populated', () => {
    const techRefs = mapVCAiEngine(buildVc(), labels).cards.find(c => c.id === 'technicalReferences');
    expect(techRefs?.action?.href).toBe('https://example.com/docs');
  });

  it('passes hostingLocation through as textValue (view handles empty/unknown fallback)', () => {
    const physicalLocation = mapVCAiEngine(buildVc(), labels).cards.find(c => c.id === 'physicalLocation');
    expect(physicalLocation?.textValue).toBe('EU');
  });

  it('renders six cards even when modelCard is missing (EMPTY_MODEL_CARD_FALLBACK)', () => {
    const result = mapVCAiEngine(undefined, labels);
    expect(result.cards).toHaveLength(6);
    expect(result.engineName).toBe('Alkemio AI');
    // dataUsageDisclosure null → textValue === ''
    expect(result.cards.find(c => c.id === 'dataUsageDisclosure')?.textValue).toBe('');
    // technicalReferences empty → action.href === ''
    expect(result.cards.find(c => c.id === 'technicalReferences')?.action?.href).toBe('');
  });
});
