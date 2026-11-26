import { describe, expect, it } from 'vitest';
import {
  mapLiveSpaceStructure,
  mapPostTemplateCard,
  mapPostTemplateContent,
  type PostLibraryTemplate,
  type PostTemplateBody,
  postAccountOwnerLabel,
  postFramingKind,
  postPlatformOwnerLabel,
  type SourcePostNode,
  type SourceSpaceNode,
} from './settingsTemplateMappers';

const body = (overrides: Partial<PostTemplateBody> = {}): PostTemplateBody => ({
  __typename: 'Post',
  id: 'body',
  about: { __typename: 'About', displayName: 'Ideas', description: 'Share **ideas**' },
  contentKind: 'text',
  links: [],
  responseKind: null,
  responsePolicy: {},
  responseDefaults: null,
  commentsEnabled: true,
  content: null,
  ...overrides,
});

describe('postFramingKind', () => {
  it('maps the 008 callout-framing correspondence, splitting documents by docType', () => {
    expect(postFramingKind('text', undefined)).toBe('none');
    expect(postFramingKind('document', 'EXCALIDRAW')).toBe('whiteboard');
    expect(postFramingKind('document', 'RICHTEXT')).toBe('memo');
    expect(postFramingKind('document', 'OFFICE_SHEET')).toBe('document');
    expect(postFramingKind('cta', undefined)).toBe('cta');
    expect(postFramingKind('gallery', undefined)).toBe('image');
    expect(postFramingKind('poll', undefined)).toBe('poll');
    expect(postFramingKind('contributors', undefined)).toBe('contributors');
    expect(postFramingKind('form', undefined)).toBe('form');
    expect(postFramingKind('spaces', undefined)).toBe('none');
    expect(postFramingKind('event', undefined)).toBe('none');
  });
});

describe('mapPostTemplateCard', () => {
  it('maps a POST template to a callout card with its own card banner', () => {
    expect(
      mapPostTemplateCard(
        {
          id: 'tpl',
          kind: 'POST',
          url: '/t/tpl',
          tags: ['a'],
          about: { displayName: 'Tpl', description: null, card: { file: { url: '/card' } } },
        },
        'Pack'
      )
    ).toMatchObject({
      id: 'tpl',
      type: 'callout',
      name: 'Tpl',
      description: '',
      tags: ['a'],
      bannerUrl: '/card',
      url: '/t/tpl',
      ownerLabel: 'Pack',
    });
  });

  it('refuses a template of another kind', () => {
    expect(() => mapPostTemplateCard({ id: 'x', kind: 'SPACE', tags: [], about: { displayName: 'x' } })).toThrow(
      'Post template picker received a SPACE template'
    );
  });

  it('labels library templates by pack, and platform ones by provider first', () => {
    const template = {
      id: 't',
      kind: 'POST',
      tags: [],
      about: { displayName: 't' },
      scope: { __typename: 'InnovationPack', id: 'pack', about: { displayName: 'Pack' } },
      provider: { __typename: 'Organization', id: 'org', about: { displayName: 'Org' } },
    } as const satisfies PostLibraryTemplate;
    expect(postAccountOwnerLabel(template)).toBe('Pack');
    expect(postPlatformOwnerLabel(template)).toBe('Org');
    expect(postPlatformOwnerLabel({ ...template, provider: null })).toBe('Pack');
  });
});

describe('mapPostTemplateContent', () => {
  it('maps a text post with post responses, its links and its response defaults', () => {
    const content = mapPostTemplateContent({
      body: body({
        responseKind: 'text',
        responseDefaults: { display_name: 'New idea', description: 'Describe it' },
        commentsEnabled: false,
        links: [
          { id: 'l2', uri: 'https://b', title: null, description: null, sortOrder: 2 },
          { id: 'l1', uri: 'https://a', title: 'A', description: 'first', sortOrder: 1 },
        ],
      }),
      documents: [],
    });
    expect(content).toEqual({
      type: 'callout',
      sourceCalloutId: 'body',
      framingKind: 'none',
      framingTitle: 'Ideas',
      framingDescription: 'Share **ideas**',
      framingWhiteboardPreviewImageUrl: undefined,
      framingMemoContent: undefined,
      framingCollaboraDoc: undefined,
      framingLinks: undefined,
      framingMediaImages: undefined,
      framingPoll: undefined,
      framingForm: undefined,
      references: [
        { id: 'l1', name: 'A', uri: 'https://a', description: 'first' },
        { id: 'l2', name: 'https://b', uri: 'https://b', description: undefined },
      ],
      allowedContributionTypes: ['post'],
      commentsEnabled: false,
      defaultPostDescription: 'Describe it',
      defaultWhiteboardAvailable: false,
      defaultWhiteboardName: 'New idea',
    });
  });

  it('maps a whiteboard framing with whiteboard responses and a starting board', () => {
    const content = mapPostTemplateContent({
      body: body({
        contentKind: 'document',
        responseKind: 'document',
        responsePolicy: { accept_new: true, allowed_document_types: ['excalidraw'] },
        content: {
          __typename: 'DocumentContent',
          document: {
            id: 'doc',
            docType: 'EXCALIDRAW',
            about: { displayName: 'Board' },
            textSnapshot: null,
            preview: { url: '/preview.png' },
          },
        },
      }),
      documents: [
        { __typename: 'Document', id: 'doc', entityType: 'document', role: 'CONTENT', docType: 'EXCALIDRAW' },
        {
          __typename: 'Document',
          id: 'start',
          entityType: 'document',
          role: 'RESPONSE_DEFAULT',
          docType: 'EXCALIDRAW',
        },
      ],
    });
    expect(content).toMatchObject({
      framingKind: 'whiteboard',
      framingWhiteboardPreviewImageUrl: '/preview.png',
      allowedContributionTypes: ['whiteboard'],
      defaultWhiteboardAvailable: true,
    });
  });

  it('maps memo, office document, link, gallery and poll framings', () => {
    const doc = (docType: 'RICHTEXT' | 'OFFICE_TEXT') => ({
      __typename: 'DocumentContent' as const,
      document: { id: 'd', docType, about: { displayName: 'Doc' }, textSnapshot: '# Memo', preview: null },
    });
    expect(
      mapPostTemplateContent({
        body: body({
          contentKind: 'document',
          content: doc('RICHTEXT'),
          responseKind: 'document',
          responsePolicy: { allowed_document_types: ['richtext'] },
        }),
        documents: [],
      })
    ).toMatchObject({ framingKind: 'memo', framingMemoContent: '# Memo', allowedContributionTypes: ['memo'] });
    expect(
      mapPostTemplateContent({ body: body({ contentKind: 'document', content: doc('OFFICE_TEXT') }), documents: [] })
    ).toMatchObject({
      framingKind: 'document',
      framingCollaboraDoc: { displayName: 'Doc', documentType: 'OFFICE_TEXT' },
    });
    expect(
      mapPostTemplateContent({
        body: body({
          contentKind: 'cta',
          responseKind: 'link',
          content: { __typename: 'LinkContent', link: { id: 'l', uri: 'https://x', title: null } },
        }),
        documents: [],
      })
    ).toMatchObject({ framingLinks: [{ name: 'https://x', uri: 'https://x' }], allowedContributionTypes: ['link'] });
    expect(
      mapPostTemplateContent({
        body: body({
          contentKind: 'gallery',
          content: { __typename: 'GalleryContent', images: [{ alt: 'cat', file: { url: '/cat.png' } }] },
        }),
        documents: [],
      })
    ).toMatchObject({ framingKind: 'image', framingMediaImages: [{ uri: '/cat.png', alt: 'cat' }] });
    expect(
      mapPostTemplateContent({
        body: body({
          contentKind: 'poll',
          content: {
            __typename: 'PollContent',
            question: 'Which?',
            options: [
              { id: 'b', value: 'B', sortOrder: 2 },
              { id: 'a', value: 'A', sortOrder: 1 },
            ],
          },
        }),
        documents: [],
      })
    ).toMatchObject({ framingKind: 'poll', framingPoll: { question: 'Which?', options: ['A', 'B'] } });
  });

  it('maps a form definition from the form response_defaults and drops office response types', () => {
    const content = mapPostTemplateContent({
      body: body({
        contentKind: 'form',
        responseDefaults: {
          title: 'Survey',
          description: 'Tell us',
          questions: [
            { id: 'q1', prompt: 'Name?', type: 'short_text', required: true },
            {
              id: 'q2',
              prompt: 'Pick',
              type: 'single_choice',
              explanation: 'One only',
              options: [
                { id: 'o1', label: 'Yes' },
                { id: 'o2', label: 'No' },
              ],
            },
          ],
        },
        responseKind: 'document',
        responsePolicy: { allowed_document_types: ['office_text'] },
      }),
      documents: [],
    });
    expect(content.framingForm).toEqual({
      title: 'Survey',
      description: 'Tell us',
      questions: [
        { prompt: 'Name?', explanation: undefined, type: 'SHORT_TEXT', required: true, options: [] },
        { prompt: 'Pick', explanation: 'One only', type: 'SINGLE_CHOICE', required: false, options: ['Yes', 'No'] },
      ],
    });
    expect(content.defaultPostDescription).toBeUndefined();
    expect(content.allowedContributionTypes).toEqual([]);
  });

  it('fails loudly on a form without its declared questions', () => {
    expect(() => mapPostTemplateContent({ body: body({ contentKind: 'form' }), documents: [] })).toThrow(
      'Form post template has no response_defaults questions'
    );
  });
});

describe('mapLiveSpaceStructure', () => {
  const space = (id: string, overrides: Partial<SourceSpaceNode> = {}): SourceSpaceNode => ({
    __typename: 'Space',
    id,
    entityType: 'space',
    about: { __typename: 'About', displayName: id, card: null },
    isContentPublic: true,
    stages: null,
    ...overrides,
  });
  const post = (id: string, sortOrder: number, stage: string | null): SourcePostNode => ({
    __typename: 'Post',
    id,
    entityType: 'post',
    about: { __typename: 'About', displayName: id, description: null },
    contentKind: 'text',
    sortOrder,
    stage: stage ? { __typename: 'Stage', name: stage } : null,
    content: null,
  });

  it('maps the root stages, its posts by stage and its child spaces', () => {
    expect(
      mapLiveSpaceStructure('root', [
        space('root', {
          stages: [
            { __typename: 'Stage', name: 'Later', description: null, sortOrder: 2 },
            { __typename: 'Stage', name: 'First', description: 'Start', sortOrder: 1 },
          ],
        }),
        post('p2', 2, 'Later'),
        post('p1', 1, 'First'),
        space('child', { isContentPublic: false, about: { displayName: 'Child', card: { file: { url: '/c' } } } }),
      ])
    ).toEqual({
      type: 'space',
      phases: [
        { name: 'First', description: 'Start' },
        { name: 'Later', description: undefined },
      ],
      starterCallouts: [
        { name: 'p1', framingKind: 'none', flowStateName: 'First', description: undefined },
        { name: 'p2', framingKind: 'none', flowStateName: 'Later', description: undefined },
      ],
      subspaceTemplates: [{ id: 'child', name: 'Child', bannerUrl: '/c', isPrivate: true }],
    });
  });
});
