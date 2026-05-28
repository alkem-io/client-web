import { describe, expect, it } from 'vitest';
import {
  CalloutContributionType,
  CalloutFramingType,
  TemplateType as GqlTemplateType,
} from '@/core/apollo/generated/graphql-schema';
import {
  type GqlTemplateLike,
  mapGqlTemplateType,
  mapTemplateToCardData,
  toGqlTemplateType,
} from '../templateCardMapper';
import {
  mapGqlFramingType,
  mapTemplateContent,
  type TemplateContentTemplate,
  templateContentIncludeVars,
  templateContentToFormValues,
} from '../templateContentMapper';
import { mapTemplatesSetToCategories, mapTemplatesToCards } from '../templatesManagerMapper';

const tpl = (over: Partial<GqlTemplateLike> & { id: string }): GqlTemplateLike => ({
  type: GqlTemplateType.Post,
  profile: { displayName: `Template ${over.id}` },
  ...over,
});

// ---------------------------------------------------------------------------
// templateCardMapper
// ---------------------------------------------------------------------------

describe('templateCardMapper', () => {
  it('round-trips the type enum ⇄ string union', () => {
    const types = ['space', 'callout', 'whiteboard', 'post', 'communityGuidelines'] as const;
    for (const t of types) expect(mapGqlTemplateType(toGqlTemplateType(t))).toBe(t);
  });

  it('maps a Template to card data, dropping the banner when there is no real visual', () => {
    const card = mapTemplateToCardData(
      tpl({ id: 't1', type: GqlTemplateType.Whiteboard, profile: { displayName: 'WB', description: 'd', url: '/t1' } })
    );
    expect(card).toMatchObject({ id: 't1', type: 'whiteboard', name: 'WB', description: 'd', url: '/t1', tags: [] });
    expect(card.bannerUrl).toBeUndefined();
    expect(typeof card.color).toBe('string');
    expect(card.ownerLabel).toBeUndefined();
  });

  it('prefers visual over cardBanner, falls back to cardBanner', () => {
    expect(
      mapTemplateToCardData(
        tpl({ id: 'a', profile: { displayName: 'A', visual: { uri: 'v' }, cardBanner: { uri: 'c' } } })
      ).bannerUrl
    ).toBe('v');
    expect(
      mapTemplateToCardData(tpl({ id: 'b', profile: { displayName: 'B', cardBanner: { uri: 'c' } } })).bannerUrl
    ).toBe('c');
  });

  it('reads tags from defaultTagset, then tagset, filtering non-strings', () => {
    expect(
      mapTemplateToCardData(tpl({ id: 'a', profile: { displayName: 'A', defaultTagset: { tags: ['x', 'y'] } } })).tags
    ).toEqual(['x', 'y']);
    expect(
      mapTemplateToCardData(tpl({ id: 'b', profile: { displayName: 'B', tagset: { tags: ['z'] } } })).tags
    ).toEqual(['z']);
  });

  it('passes the owner label through', () => {
    expect(mapTemplateToCardData(tpl({ id: 'a' }), 'Pack One').ownerLabel).toBe('Pack One');
  });

  it('is deterministic in the accent colour for a given id', () => {
    expect(mapTemplateToCardData(tpl({ id: 'fixed' })).color).toBe(mapTemplateToCardData(tpl({ id: 'fixed' })).color);
  });
});

// ---------------------------------------------------------------------------
// templatesManagerMapper
// ---------------------------------------------------------------------------

describe('templatesManagerMapper', () => {
  it('returns one section per type in TEMPLATE_TYPE_ORDER even when the set is empty/undefined', () => {
    const sections = mapTemplatesSetToCategories(undefined);
    expect(sections.map(s => s.type)).toEqual(['space', 'callout', 'whiteboard', 'post', 'communityGuidelines']);
    expect(sections.every(s => s.templates.length === 0)).toBe(true);
  });

  it('buckets templates into the right sections', () => {
    const sections = mapTemplatesSetToCategories({
      postTemplates: [tpl({ id: 'p1', type: GqlTemplateType.Post })],
      calloutTemplates: [
        tpl({ id: 'c1', type: GqlTemplateType.Callout }),
        tpl({ id: 'c2', type: GqlTemplateType.Callout }),
      ],
    });
    const byType = Object.fromEntries(sections.map(s => [s.type, s.templates]));
    expect(byType.post.map(c => c.id)).toEqual(['p1']);
    expect(byType.callout.map(c => c.id)).toEqual(['c1', 'c2']);
    expect(byType.whiteboard).toEqual([]);
  });

  it('flattens a single source to cards with an owner label', () => {
    expect(mapTemplatesToCards([tpl({ id: 'a' }), tpl({ id: 'b' })], 'Lib').map(c => [c.id, c.ownerLabel])).toEqual([
      ['a', 'Lib'],
      ['b', 'Lib'],
    ]);
  });
});

// ---------------------------------------------------------------------------
// templateContentMapper
// ---------------------------------------------------------------------------

describe('templateContentMapper', () => {
  it('maps every framing-type enum to the CRD framing-kind union', () => {
    expect(mapGqlFramingType(CalloutFramingType.None)).toBe('none');
    expect(mapGqlFramingType(CalloutFramingType.Whiteboard)).toBe('whiteboard');
    expect(mapGqlFramingType(CalloutFramingType.Memo)).toBe('memo');
    expect(mapGqlFramingType(CalloutFramingType.CollaboraDocument)).toBe('document');
    expect(mapGqlFramingType(CalloutFramingType.Link)).toBe('cta');
    expect(mapGqlFramingType(CalloutFramingType.MediaGallery)).toBe('image');
    expect(mapGqlFramingType(CalloutFramingType.Poll)).toBe('poll');
  });

  it('produces the include* query vars for a type', () => {
    expect(templateContentIncludeVars('callout')).toEqual({
      includeCallout: true,
      includeWhiteboard: false,
      includePost: false,
      includeSpace: false,
      includeCommunityGuidelines: false,
    });
    expect(templateContentIncludeVars('communityGuidelines').includeCommunityGuidelines).toBe(true);
  });

  it('returns empty shells when the matching *Content field is absent', () => {
    const empty = {} as TemplateContentTemplate;
    expect(mapTemplateContent(empty, 'callout')).toEqual({
      type: 'callout',
      framingKind: 'none',
      framingTitle: '',
      framingDescription: '',
      allowedContributionTypes: [],
      commentsEnabled: false,
    });
    expect(mapTemplateContent(empty, 'whiteboard')).toEqual({ type: 'whiteboard', whiteboardContent: '' });
    expect(mapTemplateContent(empty, 'post')).toEqual({ type: 'post', defaultDescription: '' });
    expect(mapTemplateContent(empty, 'space')).toEqual({
      type: 'space',
      phases: [],
      starterCallouts: [],
      subspaceTemplates: [],
    });
    expect(mapTemplateContent(empty, 'communityGuidelines')).toEqual({
      type: 'communityGuidelines',
      title: '',
      guidelinesMarkdown: '',
      references: [],
    });
  });

  it('maps a Collabora-document-framed callout content payload', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.CollaboraDocument,
          profile: { displayName: 'Strategy doc', description: 'shared planning surface' },
          collaboraDocument: {
            profile: { displayName: 'Strategy.docx' },
            documentType: 'word',
          },
        },
        settings: {
          contribution: { allowedTypes: [] },
          framing: { commentsEnabled: false },
        },
        contributionDefaults: {},
      },
    } as unknown as TemplateContentTemplate;
    const content = mapTemplateContent(template, 'callout');
    expect(content).toMatchObject({
      type: 'callout',
      framingKind: 'document',
      framingTitle: 'Strategy doc',
      framingDescription: 'shared planning surface',
      framingCollaboraDoc: { displayName: 'Strategy.docx', documentType: 'word' },
    });
    // The Collabora preview is a read-only title/placeholder — the mapper carries the doc handle on
    // `framingCollaboraDoc` so the consumer can render `CalloutCollaboraPreview` without a live document service.
  });

  // D16, 2026-05-18 — when a Callout template's framing is a whiteboard with a server-rendered
  // preview image, the mapper surfaces it on `framingWhiteboardPreviewImageUrl` so the Preview
  // dialog renders an `<img>` instead of the literal "Whiteboard" placeholder.
  it('maps the server-rendered whiteboard preview URL for whiteboard-framed callout templates (D16)', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.Whiteboard,
          profile: { displayName: 'Roadmap WB', description: 'workshop' },
          whiteboard: {
            content: '{"elements":[]}',
            profile: { preview: { uri: 'https://cdn.alkem.io/wb/preview.png' } },
          },
        },
        settings: {
          contribution: { allowedTypes: [] },
          framing: { commentsEnabled: false },
        },
        contributionDefaults: {},
      },
    } as unknown as TemplateContentTemplate;
    const content = mapTemplateContent(template, 'callout');
    expect(content).toMatchObject({
      type: 'callout',
      framingKind: 'whiteboard',
      framingWhiteboardContent: '{"elements":[]}',
      framingWhiteboardPreviewImageUrl: 'https://cdn.alkem.io/wb/preview.png',
    });
  });

  it('leaves framingWhiteboardPreviewImageUrl undefined when the whiteboard has no rendered preview (D16)', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.Whiteboard,
          profile: { displayName: 'WB' },
          whiteboard: { content: '{}', profile: { preview: null } },
        },
        settings: { contribution: { allowedTypes: [] }, framing: { commentsEnabled: false } },
        contributionDefaults: {},
      },
    } as unknown as TemplateContentTemplate;
    expect(mapTemplateContent(template, 'callout')).toMatchObject({
      type: 'callout',
      framingWhiteboardPreviewImageUrl: undefined,
    });
  });

  // D19, 2026-05-18 — `framing.profile.references` (calloutReferences) are carried into the
  // `TemplateContent.callout.references` field so the Preview dialog renders them via
  // `ReferencesAndTagsStrip`. Distinct from `framingLinks` (the *cta* framing's single Link).
  it('maps `framing.profile.references` into the callout-content references field (D19)', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.None,
          profile: {
            displayName: 'My callout',
            description: '',
            references: [
              { id: 'r-1', name: 'Docs', uri: 'https://docs.example', description: 'd' },
              { id: 'r-2', name: 'Spec', uri: 'https://spec.example' },
            ],
          },
        },
        settings: { contribution: { allowedTypes: [] }, framing: { commentsEnabled: false } },
        contributionDefaults: {},
      },
    } as unknown as TemplateContentTemplate;
    const content = mapTemplateContent(template, 'callout');
    expect(content).toMatchObject({
      type: 'callout',
      references: [
        { id: 'r-1', name: 'Docs', uri: 'https://docs.example', description: 'd' },
        { id: 'r-2', name: 'Spec', uri: 'https://spec.example', description: undefined },
      ],
    });
  });

  it('leaves `references` undefined when the framing profile has none (D19)', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.None,
          profile: { displayName: 'no refs', description: '' },
        },
        settings: { contribution: { allowedTypes: [] }, framing: { commentsEnabled: false } },
        contributionDefaults: {},
      },
    } as unknown as TemplateContentTemplate;
    const content = mapTemplateContent(template, 'callout');
    expect(content).toMatchObject({ type: 'callout', references: undefined });
  });

  it('maps a poll-framed callout content payload', () => {
    const template = {
      callout: {
        framing: {
          type: CalloutFramingType.Poll,
          profile: { displayName: 'Vote', description: 'pick' },
          poll: { title: 'Q?', options: [{ text: 'A' }, { text: 'B' }] },
        },
        settings: {
          contribution: { allowedTypes: [CalloutContributionType.Post] },
          framing: { commentsEnabled: true },
        },
        contributionDefaults: { postDescription: 'pd' },
      },
    } as unknown as TemplateContentTemplate;
    const content = mapTemplateContent(template, 'callout');
    expect(content).toMatchObject({
      type: 'callout',
      framingKind: 'poll',
      framingTitle: 'Vote',
      framingPoll: { question: 'Q?', options: ['A', 'B'] },
      allowedContributionTypes: ['post'],
      commentsEnabled: true,
      defaultPostDescription: 'pd',
    });
  });

  it('templateContentToFormValues round-trips post / whiteboard / community-guidelines, returns null for space + callout', () => {
    expect(templateContentToFormValues({ type: 'post', defaultDescription: 'pd' }, 'N', 'D', ['t'])).toEqual({
      type: 'post',
      name: 'N',
      description: 'D',
      tags: ['t'],
      defaultDescription: 'pd',
    });
    expect(templateContentToFormValues({ type: 'whiteboard', whiteboardContent: '{}' }, 'W')).toEqual({
      type: 'whiteboard',
      name: 'W',
      description: '',
      tags: [],
      whiteboardContent: '{}',
    });
    expect(
      templateContentToFormValues(
        { type: 'communityGuidelines', title: 'CG', guidelinesMarkdown: 'body', references: [{ name: 'r', uri: 'u' }] },
        'Name'
      )
    ).toEqual({
      type: 'communityGuidelines',
      name: 'Name',
      description: '',
      tags: [],
      title: 'CG',
      guidelinesMarkdown: 'body',
      references: [{ name: 'r', uri: 'u' }],
    });
    expect(
      templateContentToFormValues({ type: 'space', phases: [], starterCallouts: [], subspaceTemplates: [] }, 'S')
    ).toBeNull();
    expect(
      templateContentToFormValues(
        {
          type: 'callout',
          framingKind: 'none',
          framingTitle: '',
          framingDescription: '',
          allowedContributionTypes: [],
          commentsEnabled: false,
        },
        'C'
      )
    ).toBeNull();
  });
});
