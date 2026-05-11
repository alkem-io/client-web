import { describe, expect, it } from 'vitest';
import {
  AiPersonaEngine,
  AuthorizationPrivilege,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import type { VirtualContributorModelFull } from '@/domain/community/virtualContributor/model/VirtualContributorModelFull';
import {
  computeSettingsHref,
  extractVcKeywords,
  mapHostCard,
  mapVcReferences,
  resolveBodyOfKnowledge,
} from '../vcProfileMapper';

const buildVc = (overrides: Partial<VirtualContributorModelFull> = {}): VirtualContributorModelFull => ({
  id: 'vc-1',
  profile: { displayName: 'Test VC', url: '/vc/test' },
  modelCard: {
    spaceUsage: [],
    aiEngine: {
      isExternal: false,
      isAssistant: false,
      hostingLocation: '',
      isUsingOpenWeightsModel: false,
      isInteractionDataUsedForTraining: null,
      canAccessWebWhenAnswering: false,
      areAnswersRestrictedToBodyOfKnowledge: '',
      additionalTechnicalDetails: '',
    },
    monitoring: { isUsageMonitoredByAlkemio: true },
  },
  aiPersona: { id: 'persona-1' },
  ...overrides,
});

const bokLabels = {
  knowledgeBasePlaceholder: 'No knowledge base configured',
  privateSpaceLabel: 'Private space',
  externalAssistantDescription: 'External via OpenAI Assistant',
  externalGenericDescription: 'External (generic)',
  spaceContextDescription: 'About <strong>Test VC</strong>',
};

describe('resolveBodyOfKnowledge', () => {
  it('returns null when vc is undefined', () => {
    expect(resolveBodyOfKnowledge({ vc: undefined, ...bokLabels })).toBeNull();
  });

  it('returns null when bodyOfKnowledgeType is None and engine is not external', () => {
    const vc = buildVc({ bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.None });
    expect(resolveBodyOfKnowledge({ vc, ...bokLabels })).toBeNull();
  });

  describe('AlkemioSpace', () => {
    const baseVc = buildVc({
      bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
      bodyOfKnowledgeID: 'space-id-fallback',
      bodyOfKnowledgeDescription: 'BoK description here',
    });

    it('uses the resolved space profile when hasSpaceReadAccess is true', () => {
      const result = resolveBodyOfKnowledge({
        vc: baseVc,
        bokSpaceProfile: { id: 'real-space-id', displayName: 'Real Space', url: '/s/real' },
        hasSpaceReadAccess: true,
        ...bokLabels,
      });
      expect(result?.kind).toBe('space');
      if (result?.kind !== 'space') throw new Error('Expected space');
      expect(result.spaceProfile.id).toBe('real-space-id');
      expect(result.spaceProfile.displayName).toBe('Real Space');
      expect(result.spaceProfile.url).toBe('/s/real');
      expect(result.hasReadAccess).toBe(true);
      expect(result.description).toBe('BoK description here');
      expect(result.vcDisplayName).toBe('Test VC');
      expect(result.spaceContextDescription).toBe(bokLabels.spaceContextDescription);
    });

    it('falls back to vc.bodyOfKnowledgeID when bokSpaceProfile.id is missing but read access is granted', () => {
      const result = resolveBodyOfKnowledge({
        vc: baseVc,
        bokSpaceProfile: { displayName: 'Named Space', url: '/s/named' },
        hasSpaceReadAccess: true,
        ...bokLabels,
      });
      if (result?.kind !== 'space') throw new Error('Expected space');
      expect(result.spaceProfile.id).toBe('space-id-fallback');
    });

    it('shows the privateSpaceLabel and blank URL/id when hasSpaceReadAccess is false', () => {
      const result = resolveBodyOfKnowledge({
        vc: baseVc,
        bokSpaceProfile: { id: 'hidden', displayName: 'Hidden Name', url: '/s/hidden' },
        hasSpaceReadAccess: false,
        ...bokLabels,
      });
      if (result?.kind !== 'space') throw new Error('Expected space');
      expect(result.spaceProfile.id).toBe('');
      expect(result.spaceProfile.url).toBe('');
      expect(result.spaceProfile.displayName).toBe(bokLabels.privateSpaceLabel);
      expect(result.hasReadAccess).toBe(false);
    });

    it('produces deterministic colour from id, falling back to displayName when id is empty', () => {
      const result = resolveBodyOfKnowledge({
        vc: baseVc,
        bokSpaceProfile: { id: 'hidden', displayName: 'X', url: '/s/x' },
        hasSpaceReadAccess: false, // → spaceId is '', so colour is keyed on displayName ("Private space")
        ...bokLabels,
      });
      if (result?.kind !== 'space') throw new Error('Expected space');
      expect(typeof result.spaceProfile.color).toBe('string');
      expect(result.spaceProfile.color.length).toBeGreaterThan(0);
    });

    it('description is null when bodyOfKnowledgeDescription is missing', () => {
      const vc = buildVc({
        bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
        bodyOfKnowledgeDescription: undefined,
      });
      const result = resolveBodyOfKnowledge({
        vc,
        bokSpaceProfile: { id: 's', displayName: 's', url: '/s' },
        hasSpaceReadAccess: true,
        ...bokLabels,
      });
      if (result?.kind !== 'space') throw new Error('Expected space');
      expect(result.description).toBeNull();
    });
  });

  describe('AlkemioKnowledgeBase', () => {
    const vc = buildVc({ bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase });

    it('returns kind="knowledgeBase" with placeholder when description is empty', () => {
      const result = resolveBodyOfKnowledge({
        vc,
        knowledgeBaseDescription: '',
        knowledgeBaseHasReadAccess: true,
        ...bokLabels,
      });
      expect(result?.kind).toBe('knowledgeBase');
      if (result?.kind !== 'knowledgeBase') throw new Error('Expected knowledgeBase');
      expect(result.description).toBe(bokLabels.knowledgeBasePlaceholder);
      expect(result.hasReadAccess).toBe(true);
    });

    it('uses the provided description when populated', () => {
      const result = resolveBodyOfKnowledge({
        vc,
        knowledgeBaseDescription: 'Custom KB description',
        knowledgeBaseHasReadAccess: true,
        ...bokLabels,
      });
      if (result?.kind !== 'knowledgeBase') throw new Error('Expected knowledgeBase');
      expect(result.description).toBe('Custom KB description');
    });

    it('builds visitUrl from vc.profile.url + KNOWLEDGE_BASE_PATH', () => {
      const result = resolveBodyOfKnowledge({ vc, knowledgeBaseHasReadAccess: false, ...bokLabels });
      if (result?.kind !== 'knowledgeBase') throw new Error('Expected knowledgeBase');
      expect(result.visitUrl).toBe('/vc/test/knowledge-base');
      expect(result.hasReadAccess).toBe(false);
    });
  });

  describe('External engine fallback', () => {
    it('returns kind="external" with assistant description when persona engine is OpenaiAssistant', () => {
      const vc = buildVc({
        bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.None,
        aiPersona: { id: 'p', engine: AiPersonaEngine.OpenaiAssistant },
      });
      vc.modelCard.aiEngine.isExternal = true;
      const result = resolveBodyOfKnowledge({ vc, ...bokLabels });
      expect(result).toEqual({ kind: 'external', description: bokLabels.externalAssistantDescription });
    });

    it('returns kind="external" with generic description for non-assistant external engines', () => {
      const vc = buildVc({
        bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.None,
        aiPersona: { id: 'p', engine: AiPersonaEngine.GenericOpenai },
      });
      vc.modelCard.aiEngine.isExternal = true;
      const result = resolveBodyOfKnowledge({ vc, ...bokLabels });
      expect(result).toEqual({ kind: 'external', description: bokLabels.externalGenericDescription });
    });

    it('returns null when isExternal is false and no other BoK type matches', () => {
      const vc = buildVc({ bodyOfKnowledgeType: VirtualContributorBodyOfKnowledgeType.Other });
      expect(resolveBodyOfKnowledge({ vc, ...bokLabels })).toBeNull();
    });
  });
});

describe('mapVcReferences (FR-032 — flat passthrough)', () => {
  it('returns empty array for undefined input', () => {
    expect(mapVcReferences(undefined)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(mapVcReferences([])).toEqual([]);
  });

  it('passes references straight through, normalising description to null', () => {
    const result = mapVcReferences([
      { id: 'r-1', name: 'Docs', uri: 'https://example.com', description: 'External docs' },
      { id: 'r-2', name: 'Site', uri: 'https://site.example' },
    ]);
    expect(result).toEqual([
      { id: 'r-1', name: 'Docs', uri: 'https://example.com', description: 'External docs' },
      { id: 'r-2', name: 'Site', uri: 'https://site.example', description: null },
    ]);
  });

  it('does not split social references (FR-032 — explicit divergence from MUI)', () => {
    const result = mapVcReferences([
      { id: 'r-1', name: 'LinkedIn', uri: 'https://linkedin.com/in/x' },
      { id: 'r-2', name: 'Website', uri: 'https://example.com' },
    ]);
    expect(result.map(r => r.id)).toEqual(['r-1', 'r-2']);
  });
});

describe('mapHostCard', () => {
  it('returns null when vc is undefined', () => {
    expect(mapHostCard(undefined)).toBeNull();
  });

  it('returns null when provider is missing', () => {
    expect(mapHostCard(buildVc())).toBeNull();
  });

  it('maps a provider into CompactContributorCardItem with `id: "host"`', () => {
    const vc = buildVc({
      provider: {
        profile: {
          displayName: 'Acme Org',
          url: '/org/acme',
          avatar: { uri: 'https://cdn.example/acme.png' },
        },
      },
    });
    expect(mapHostCard(vc)).toEqual({
      id: 'host',
      displayName: 'Acme Org',
      avatarImageUrl: 'https://cdn.example/acme.png',
      caption: null,
      secondaryCaption: null,
      href: '/org/acme',
    });
  });

  it('falls back to null avatarImageUrl when the provider has no avatar', () => {
    const vc = buildVc({ provider: { profile: { displayName: 'Plain', url: '/org/plain' } } });
    expect(mapHostCard(vc)?.avatarImageUrl).toBeNull();
  });
});

describe('computeSettingsHref', () => {
  const fakeBuildSettingsUrl = (url: string) => `${url}/settings`;

  it('returns null when myPrivileges is undefined', () => {
    expect(computeSettingsHref(buildVc(), undefined, fakeBuildSettingsUrl)).toBeNull();
  });

  it('returns null when myPrivileges does not include Update', () => {
    expect(computeSettingsHref(buildVc(), [AuthorizationPrivilege.Read], fakeBuildSettingsUrl)).toBeNull();
  });

  it('returns null when vc is undefined', () => {
    expect(computeSettingsHref(undefined, [AuthorizationPrivilege.Update], fakeBuildSettingsUrl)).toBeNull();
  });

  it('returns null when vc.profile.url is missing', () => {
    const vc = buildVc({ profile: { displayName: 'X', url: '' } });
    expect(computeSettingsHref(vc, [AuthorizationPrivilege.Update], fakeBuildSettingsUrl)).toBeNull();
  });

  it('returns the built settings URL when Update is granted and url is present', () => {
    const vc = buildVc({ profile: { displayName: 'X', url: '/vc/x' } });
    expect(computeSettingsHref(vc, [AuthorizationPrivilege.Update], fakeBuildSettingsUrl)).toBe('/vc/x/settings');
  });
});

describe('extractVcKeywords', () => {
  it('returns empty array for undefined or null tagsets', () => {
    expect(extractVcKeywords(undefined)).toEqual([]);
    expect(extractVcKeywords(null)).toEqual([]);
  });

  it('returns empty array when no tagset matches the reserved Keywords name', () => {
    expect(extractVcKeywords([{ name: 'OTHER', tags: ['a'] }])).toEqual([]);
  });

  it('case-insensitively matches the reserved KEYWORDS name', () => {
    expect(extractVcKeywords([{ name: 'keywords', tags: ['ai', 'rag'] }])).toEqual(['ai', 'rag']);
    expect(extractVcKeywords([{ name: 'Keywords', tags: ['ai'] }])).toEqual(['ai']);
    expect(extractVcKeywords([{ name: 'KEYWORDS', tags: ['ai'] }])).toEqual(['ai']);
  });

  it('returns an empty array when the matched tagset has no tags', () => {
    expect(extractVcKeywords([{ name: 'KEYWORDS', tags: [] }])).toEqual([]);
    expect(extractVcKeywords([{ name: 'KEYWORDS' }])).toEqual([]);
  });

  it('ignores other tagsets and returns only the Keywords tags', () => {
    expect(
      extractVcKeywords([
        { name: 'SKILLS', tags: ['ts'] },
        { name: 'KEYWORDS', tags: ['ai'] },
      ])
    ).toEqual(['ai']);
  });
});
