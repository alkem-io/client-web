import { describe, expect, test } from 'vitest';
import {
  CalloutContributionType,
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
  CalloutFramingType,
  CalloutVisibility,
  CollaboraDocumentType,
  PollResultsDetail,
  PollResultsVisibility,
  PollStatus,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import {
  DocType,
  PollStatus as NativePollStatus,
  type PostCardFragment,
} from '@/core/apollo/generated-v2/graphql-schema';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { type CrdSpaceTranslator, mapCalloutDetailsToPostCard, mapPostToCallout } from './calloutDataMapper';
import { mapAnyContributionToCardData, mapResponseToCardData } from './contributionDataMapper';
import { nativePost, nativeResponse } from './nativePostFixtures.test-utils';
import { mapPostIndexRowsToListItems, mapPostIndexToListItems } from './postIndexDataMapper';

const t = ((key: string, options?: { count?: number }) =>
  options?.count === undefined ? key : `${key}:${options.count}`) as unknown as CrdSpaceTranslator;

const person = (id: string, displayName: string) => ({
  id,
  profile: { displayName, url: `/user/${id}`, avatar: { id, uri: `/avatar/${id}` } },
});

// The callout the legacy CalloutDetails query delivered for the same post (the legacy mapper's input).
const legacyCallout = (framing: Partial<CalloutDetailsModelExtended['framing']>, draft = false) =>
  ({
    id: 'p1',
    draft,
    publishedDate: new Date('2026-01-01T00:00:00.000Z'),
    publishedBy: person('user-2', 'Ben'),
    createdDate: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: person('user-1', 'Ada'),
    comments: { id: 'room-1', messagesCount: 3, messages: [], vcInteractions: [] },
    settings: { framing: { commentsEnabled: true }, contribution: { allowedTypes: [] }, visibility: 'PUBLISHED' },
    framing: {
      type: CalloutFramingType.None,
      profile: {
        displayName: 'Post p1',
        description: 'Description',
        tagset: { tags: ['alpha'] },
        references: [{ id: 'l1', name: 'Spec', uri: 'https://example.org/spec', description: 'Read me' }],
      },
      ...framing,
    },
  }) as unknown as CalloutDetailsModelExtended;

const post = (overrides: Partial<PostCardFragment>) =>
  nativePost('p1', {
    room: { __typename: 'Room', id: 'room-1', messageCount: 3 },
    links: [
      {
        __typename: 'Link',
        id: 'l1',
        title: 'Spec',
        description: 'Read me',
        uri: 'https://example.org/spec',
        sortOrder: 0,
        file: null,
      },
    ],
    ...overrides,
  });

const document = (docType: DocType, extra: object = {}) => ({
  __typename: 'DocumentContent' as const,
  document: {
    __typename: 'Document' as const,
    id: 'd1',
    docType,
    url: '/doc/d1',
    textSnapshot: null,
    preview: null,
    about: { __typename: 'About' as const, displayName: 'Doc' },
    can: { __typename: 'DocumentCan' as const, read: true, edit: false },
    ...extra,
  },
});

const poll = {
  __typename: 'PollContent' as const,
  question: 'Which?',
  status: NativePollStatus.Open,
  deadline: null,
  settings: { min: 1, max: 2, allow_add: true, results_detail: 'percentage', results_visibility: 'total-only' },
  totalVotes: 3,
  myVotes: ['o1'],
  options: [
    {
      __typename: 'PollOption' as const,
      id: 'o1',
      value: 'A',
      sortOrder: 0,
      votes: 2,
      percentage: 67,
      mine: true,
      voters: null,
    },
    {
      __typename: 'PollOption' as const,
      id: 'o2',
      value: 'B',
      sortOrder: 1,
      votes: 1,
      percentage: 33,
      mine: false,
      voters: null,
    },
  ],
};

// One row per content kind (021 FR-008): native PostCard → the same PostCardData as the legacy callout.
const kinds: [string, Partial<PostCardFragment>, Partial<CalloutDetailsModelExtended['framing']>][] = [
  ['text', {}, {}],
  [
    'whiteboard',
    {
      contentKind: 'document',
      content: document(DocType.Excalidraw, { preview: { __typename: 'File', url: '/p.png' } }),
    },
    { type: CalloutFramingType.Whiteboard, whiteboard: { profile: { preview: { uri: '/p.png' } } } as never },
  ],
  [
    'memo',
    { contentKind: 'document', content: document(DocType.Richtext, { textSnapshot: '# Notes' }) },
    { type: CalloutFramingType.Memo, memo: { id: 'd1', markdown: '# Notes' } },
  ],
  [
    'office',
    {
      contentKind: 'document',
      content: document(DocType.OfficeSheet, { preview: { __typename: 'File', url: '/sheet.png' } }),
    },
    {
      type: CalloutFramingType.CollaboraDocument,
      collaboraDocument: { id: 'd1', documentType: CollaboraDocumentType.Spreadsheet, previewUrl: '/sheet.png' },
    },
  ],
  [
    'cta',
    {
      contentKind: 'cta',
      content: {
        __typename: 'LinkContent',
        link: { __typename: 'Link', id: 'k1', uri: 'https://example.org', title: 'Go', description: null, file: null },
      },
    },
    { type: CalloutFramingType.Link, link: { id: 'k1', uri: 'https://example.org', profile: { displayName: 'Go' } } },
  ],
  [
    'gallery',
    {
      contentKind: 'gallery',
      content: {
        __typename: 'GalleryContent',
        images: [1, 2, 3, 4, 5].map(n => ({
          __typename: 'FileRef' as const,
          alt: `alt ${n}`,
          file: { __typename: 'File' as const, id: `f${n}`, url: `/f${n}.png`, mime: 'image/png' },
        })),
      },
    },
    {
      type: CalloutFramingType.MediaGallery,
      mediaGallery: {
        id: 'g1',
        visuals: [1, 2, 3, 4, 5].map(n => ({
          id: `f${n}`,
          uri: `/f${n}.png`,
          name: VisualType.MediaGalleryImage,
          alternativeText: `alt ${n}`,
          sortOrder: n,
        })),
      },
    },
  ],
  ['poll', { contentKind: 'poll', content: poll }, { type: CalloutFramingType.Poll }],
  ['event', { contentKind: 'event' }, {}],
  ['contributors', { contentKind: 'contributors' }, { type: CalloutFramingType.Contributors }],
  ['spaces', { contentKind: 'spaces' }, { type: CalloutFramingType.Spaces }],
  ['form', { contentKind: 'form' }, { type: CalloutFramingType.Form }],
  ['task board', { contentKind: 'task_board', responseKind: 'task' }, {}],
];

describe('native post card mapper parity (021 FR-008)', () => {
  test.each(kinds)('%s: the native post fills the same PostCardData as the legacy callout', (_, native, framing) => {
    expect(mapCalloutDetailsToPostCard(mapPostToCallout(post(native), []), t)).toEqual(
      mapCalloutDetailsToPostCard(legacyCallout(framing), t)
    );
  });

  test('a draft renders where the server returns it, with the draft treatment', () => {
    const native = mapPostToCallout(post({ postStatus: 'DRAFT' }), []);
    expect(native.settings.visibility).toBe(CalloutVisibility.Draft);
    expect(mapCalloutDetailsToPostCard(native, t)).toEqual(mapCalloutDetailsToPostCard(legacyCallout({}, true), t));
  });

  test('the poll model carries the served poll', () => {
    expect(mapPostToCallout(post({ contentKind: 'poll', content: poll }), []).framing.poll).toEqual({
      id: 'p1',
      title: 'Which?',
      status: PollStatus.Open,
      settings: {
        allowContributorsAddOptions: true,
        minResponses: 1,
        maxResponses: 2,
        resultsVisibility: PollResultsVisibility.TotalOnly,
        resultsDetail: PollResultsDetail.Percentage,
      },
      totalVotes: 3,
      canSeeDetailedResults: true,
      options: [
        { id: 'o1', text: 'A', sortOrder: 0, voteCount: 2, votePercentage: 67, voters: undefined },
        { id: 'o2', text: 'B', sortOrder: 1, voteCount: 1, votePercentage: 33, voters: undefined },
      ],
      myVote: { id: 'p1', selectedOptions: [{ id: 'o1' }] },
    });
  });

  test('the form model carries the served questions and policy', () => {
    const form = {
      __typename: 'FormContent' as const,
      questions: [
        { id: 'q1', prompt: 'Why?', type: 'single_choice', required: true, options: [{ id: 'a', label: 'A' }] },
      ],
      responseCount: 4,
      myResponseCount: 1,
    };
    const native = post({
      contentKind: 'form',
      content: form,
      responsePolicy: { max_per_contributor: 1, read: 'all' },
      responseDefaults: { title: 'Survey', description: 'Tell us', default_collapsed: true, questions: form.questions },
    });
    expect(mapPostToCallout(native, []).framing.form).toEqual({
      id: 'p1',
      title: 'Survey',
      description: 'Tell us',
      questions: [
        {
          id: 'q1',
          prompt: 'Why?',
          explanation: undefined,
          type: CalloutFormQuestionType.SingleChoice,
          required: true,
          options: [{ id: 'a', label: 'A' }],
        },
      ],
      settings: {
        visibility: CalloutFormResponseVisibility.Members,
        responseMode: CalloutFormResponseMode.Single,
        state: CalloutFormState.Open,
        defaultCollapsed: true,
      },
    });
  });

  test('a new response takes the served response defaults, as legacy contributionDefaults', () => {
    const native = post({ responseKind: 'text', responseDefaults: { display_name: 'Idea', description: 'Explain' } });
    expect(mapPostToCallout(native, []).contributionDefaults).toEqual({
      defaultDisplayName: 'Idea',
      postDescription: 'Explain',
    });
  });

  test.each([
    ['text', CalloutContributionType.Post, null],
    ['task', CalloutContributionType.Post, null],
    ['link', CalloutContributionType.Link, null],
    ['document', CalloutContributionType.Whiteboard, ['excalidraw']],
    ['document', CalloutContributionType.Memo, ['richtext']],
    ['document', CalloutContributionType.CollaboraDocument, ['office_text', 'pdf']],
  ])('response kind %s (%s) is the legacy contribution type', (responseKind, type, documentTypes) => {
    const native = post({ responseKind, responsePolicy: documentTypes && { allowed_document_types: documentTypes } });
    expect(mapPostToCallout(native, []).settings.contribution.allowedTypes).toEqual([type]);
  });
});

const legacyAuthor = { profile: { displayName: 'Ada', avatar: { uri: '/avatar/user-1' } } };

// One row per response kind (021 FR-009): a native response → the same card as the legacy contribution.
const responses: [string, ReturnType<typeof nativeResponse>, Parameters<typeof mapAnyContributionToCardData>[0]][] = [
  [
    'post',
    nativeResponse('r1'),
    {
      id: 'r1',
      post: {
        id: 'r1',
        createdDate: '2026-01-02T00:00:00.000Z',
        createdBy: legacyAuthor,
        profile: { displayName: 'Response r1', description: 'Body', url: '/response/r1', tagset: { tags: ['tag'] } },
        comments: { id: 'room-r1', messagesCount: 2 },
      },
    },
  ],
  [
    'whiteboard',
    nativeResponse('r2', {
      contentKind: 'document',
      content: document(DocType.Excalidraw, { preview: { url: '/w.png' } }),
    }),
    {
      id: 'r2',
      whiteboard: {
        id: 'd1',
        createdDate: '2026-01-02T00:00:00.000Z',
        createdBy: legacyAuthor,
        profile: { displayName: 'Response r2', url: '/response/r2', visual: { uri: '/w.png' } },
      },
    },
  ],
  [
    'memo',
    nativeResponse('r3', { contentKind: 'document', content: document(DocType.Richtext, { textSnapshot: 'Hi' }) }),
    {
      id: 'r3',
      memo: {
        id: 'd1',
        createdDate: '2026-01-02T00:00:00.000Z',
        createdBy: legacyAuthor,
        profile: { displayName: 'Response r3', url: '/response/r3' },
        markdown: 'Hi',
      },
    },
  ],
  [
    'document',
    nativeResponse('r4', {
      contentKind: 'document',
      content: document(DocType.OfficeText, { preview: { url: '/t.png' } }),
    }),
    {
      id: 'r4',
      collaboraDocument: {
        id: 'd1',
        documentType: CollaboraDocumentType.Wordprocessing,
        previewUrl: '/t.png',
        createdDate: '2026-01-02T00:00:00.000Z',
        createdBy: legacyAuthor,
        profile: { displayName: 'Response r4', url: '/response/r4' },
      },
    },
  ],
  [
    'link',
    nativeResponse('r5', {
      contentKind: 'link',
      can: { update: true, delete: false, moveTask: false },
      content: {
        __typename: 'LinkContent',
        link: { id: 'k5', uri: 'https://example.org/x', title: 'X', description: 'About x', file: null },
      },
    }),
    {
      id: 'r5',
      link: {
        id: 'k5',
        uri: 'https://example.org/x',
        profile: { displayName: 'X', description: 'About x' },
        authorization: { myPrivileges: ['UPDATE'] },
      },
    },
  ],
];

describe('native response card mapper parity (021 FR-009)', () => {
  test.each(responses)('%s response renders the same card as the legacy contribution', (_, native, legacy) => {
    expect(mapResponseToCardData(native)).toEqual(mapAnyContributionToCardData(legacy));
  });
});

describe('native post index mapper parity (021 D9)', () => {
  test('a whiteboard post collecting memos renders the same index item as the legacy callout row', () => {
    const row = nativePost('p2', {
      sortOrder: 1,
      contentKind: 'document',
      responseKind: 'document',
      responsePolicy: { allowed_document_types: ['richtext'] },
      responseCount: 2,
      content: document(DocType.Excalidraw),
      about: { __typename: 'About', displayName: 'Board p2', description: null },
    });
    const legacy = {
      id: 'p2',
      sortOrder: 1,
      activity: 2,
      framing: {
        type: CalloutFramingType.Whiteboard,
        profile: { displayName: 'Board p2', url: '/space/collaboration/p2' },
      },
      settings: { contribution: { allowedTypes: [CalloutContributionType.Memo] } },
    };
    expect(mapPostIndexRowsToListItems([row], 2, t)).toEqual(mapPostIndexToListItems([legacy as never], 2, t));
  });

  test('a post row renders the same index item as the legacy callout row', () => {
    const row = nativePost('p1', { responseKind: 'text', responseCount: 3 });
    const legacy = {
      id: 'p1',
      sortOrder: 0,
      activity: 3,
      framing: { type: CalloutFramingType.None, profile: { displayName: 'Post p1', url: '/space/collaboration/p1' } },
      settings: { contribution: { allowedTypes: [CalloutContributionType.Post] } },
    };
    expect(mapPostIndexRowsToListItems([row], 2, t)).toEqual(mapPostIndexToListItems([legacy as never], 2, t));
  });
});
