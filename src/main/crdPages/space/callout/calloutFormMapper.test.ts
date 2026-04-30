import { describe, expect, it } from 'vitest';
import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
  PollResultsDetail,
  PollResultsVisibility,
  VisualType,
  WhiteboardPreviewMode,
} from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { type CalloutFormValues, EMPTY_CALLOUT_FORM_VALUES } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import {
  allowedActorsFromServer,
  allowedActorsToServer,
  framingChipToServer,
  mapFormToCalloutCreationInput,
  mapFormToCalloutUpdateInput,
  responseTypeToServer,
  tagsStringToArray,
} from './calloutFormMapper';

const baseValues = (overrides: Partial<CalloutFormValues> = {}): CalloutFormValues => ({
  ...EMPTY_CALLOUT_FORM_VALUES,
  title: 'My callout',
  ...overrides,
});

const createOptions = {
  visibility: CalloutVisibility.Published,
  whiteboardFallbackDisplayName: 'Untitled whiteboard',
};

const updateOptions = { calloutId: 'callout-1' };

const previewBlob: WhiteboardPreviewImage = {
  visualType: VisualType.Banner,
  imageData: new Blob(['x'], { type: 'image/png' }),
};

describe('framingChipToServer', () => {
  it('maps every chip including the disabled "document" → None', () => {
    expect(framingChipToServer('none')).toBe(CalloutFramingType.None);
    expect(framingChipToServer('whiteboard')).toBe(CalloutFramingType.Whiteboard);
    expect(framingChipToServer('memo')).toBe(CalloutFramingType.Memo);
    expect(framingChipToServer('cta')).toBe(CalloutFramingType.Link);
    expect(framingChipToServer('image')).toBe(CalloutFramingType.MediaGallery);
    expect(framingChipToServer('poll')).toBe(CalloutFramingType.Poll);
    expect(framingChipToServer('document')).toBe(CalloutFramingType.None);
  });
});

describe('responseTypeToServer', () => {
  it('maps active types and collapses none/document to undefined', () => {
    expect(responseTypeToServer('none')).toBeUndefined();
    expect(responseTypeToServer('document')).toBeUndefined();
    expect(responseTypeToServer('link')).toBe(CalloutContributionType.Link);
    expect(responseTypeToServer('post')).toBe(CalloutContributionType.Post);
    expect(responseTypeToServer('memo')).toBe(CalloutContributionType.Memo);
    expect(responseTypeToServer('whiteboard')).toBe(CalloutContributionType.Whiteboard);
  });
});

describe('allowedActors round-trip', () => {
  it('maps the three reachable states symmetrically', () => {
    expect(allowedActorsToServer({ members: true, admins: true })).toBe(CalloutAllowedActors.Members);
    expect(allowedActorsToServer({ members: false, admins: true })).toBe(CalloutAllowedActors.Admins);
    expect(allowedActorsToServer({ members: false, admins: false })).toBe(CalloutAllowedActors.None);

    expect(allowedActorsFromServer(CalloutAllowedActors.Members)).toEqual({ members: true, admins: true });
    expect(allowedActorsFromServer(CalloutAllowedActors.Admins)).toEqual({ members: false, admins: true });
    expect(allowedActorsFromServer(CalloutAllowedActors.None)).toEqual({ members: false, admins: false });
    expect(allowedActorsFromServer(undefined)).toEqual({ members: false, admins: false });
  });

  it('unreachable members-only state collapses to None on the way out', () => {
    expect(allowedActorsToServer({ members: true, admins: false })).toBe(CalloutAllowedActors.None);
  });
});

describe('tagsStringToArray', () => {
  it('splits, trims, drops empties', () => {
    expect(tagsStringToArray('a, b ,, c')).toEqual(['a', 'b', 'c']);
    expect(tagsStringToArray('   ')).toEqual([]);
    expect(tagsStringToArray('')).toEqual([]);
  });
});

describe('mapFormToCalloutCreationInput — framing branches', () => {
  it('Whiteboard framing emits framing.whiteboard with content + previewSettings, hoists preview blobs out-of-band', () => {
    const previewSettings = { mode: WhiteboardPreviewMode.Custom, coordinates: undefined };
    const result = mapFormToCalloutCreationInput(
      baseValues({
        framingChip: 'whiteboard',
        whiteboardContent: '<wb/>',
        whiteboardPreviewSettings: previewSettings,
        whiteboardPreviewImages: [previewBlob],
      }),
      createOptions
    );

    expect(result.input.framing.type).toBe(CalloutFramingType.Whiteboard);
    expect(result.input.framing.whiteboard?.content).toBe('<wb/>');
    expect(result.input.framing.whiteboard?.profile.displayName).toBe('My callout');
    expect(result.input.framing.whiteboard?.previewSettings).toEqual(previewSettings);
    // Preview blobs travel out-of-band, never on the input
    expect(result.whiteboardPreviewImages).toEqual([previewBlob]);
    expect((result.input.framing.whiteboard as { previewImages?: unknown }).previewImages).toBeUndefined();
  });

  it('Whiteboard framing without title falls back to whiteboardFallbackDisplayName', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'whiteboard', title: '   ' }),
      createOptions
    );
    expect(result.input.framing.whiteboard?.profile.displayName).toBe('Untitled whiteboard');
  });

  it('Memo framing emits framing.memo.markdown when present, undefined when blank', () => {
    const withBody = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'memo', memoMarkdown: '# Hello' }),
      createOptions
    );
    expect(withBody.input.framing.type).toBe(CalloutFramingType.Memo);
    expect(withBody.input.framing.memo?.markdown).toBe('# Hello');

    const blank = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'memo', memoMarkdown: '   ' }),
      createOptions
    );
    expect(blank.input.framing.memo?.markdown).toBeUndefined();
  });

  it('Link (CTA) framing emits framing.link with displayName falling back to URL', () => {
    const named = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'cta', linkUrl: 'https://example.org', linkDisplayName: 'Example' }),
      createOptions
    );
    expect(named.input.framing.type).toBe(CalloutFramingType.Link);
    expect(named.input.framing.link?.uri).toBe('https://example.org');
    expect(named.input.framing.link?.profile.displayName).toBe('Example');

    const unnamed = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'cta', linkUrl: 'https://example.org', linkDisplayName: '' }),
      createOptions
    );
    expect(unnamed.input.framing.link?.profile.displayName).toBe('https://example.org');

    const blankUrl = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'cta', linkUrl: '', linkDisplayName: 'name' }),
      createOptions
    );
    expect(blankUrl.input.framing.link).toBeUndefined();
  });

  it('Poll framing emits poll with options dropping blanks; multi/hidden settings encoded correctly', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({
        framingChip: 'poll',
        pollQuestion: 'Best chip flavour?',
        pollOptions: [{ text: 'Salt' }, { text: '  ' }, { text: 'Vinegar' }],
        pollAllowMultiple: true,
        pollAllowCustomOptions: true,
        pollHideResultsUntilVoted: true,
        pollShowVoterAvatars: false,
      }),
      createOptions
    );
    expect(result.input.framing.poll?.title).toBe('Best chip flavour?');
    expect(result.input.framing.poll?.options).toEqual(['Salt', 'Vinegar']);
    expect(result.input.framing.poll?.settings).toEqual({
      allowContributorsAddOptions: true,
      minResponses: 1,
      maxResponses: 0,
      resultsVisibility: PollResultsVisibility.Hidden,
      resultsDetail: PollResultsDetail.Count,
    });
  });

  it('Poll framing single-response: maxResponses=1, visible+full results', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({
        framingChip: 'poll',
        pollQuestion: 'Q?',
        pollOptions: [{ text: 'A' }, { text: 'B' }],
        pollAllowMultiple: false,
        pollShowVoterAvatars: true,
        pollHideResultsUntilVoted: false,
      }),
      createOptions
    );
    expect(result.input.framing.poll?.settings.maxResponses).toBe(1);
    expect(result.input.framing.poll?.settings.resultsVisibility).toBe(PollResultsVisibility.Visible);
    expect(result.input.framing.poll?.settings.resultsDetail).toBe(PollResultsDetail.Full);
  });

  it('Poll framing without a question is dropped (matches MUI parity check)', () => {
    const result = mapFormToCalloutCreationInput(baseValues({ framingChip: 'poll', pollQuestion: '' }), createOptions);
    expect(result.input.framing.type).toBe(CalloutFramingType.Poll);
    expect(result.input.framing.poll).toBeUndefined();
  });

  it('MediaGallery framing sets the type only — server auto-creates the entity', () => {
    const result = mapFormToCalloutCreationInput(baseValues({ framingChip: 'image' }), createOptions);
    expect(result.input.framing.type).toBe(CalloutFramingType.MediaGallery);
    expect(result.input.framing.whiteboard).toBeUndefined();
    expect(result.input.framing.memo).toBeUndefined();
    expect(result.input.framing.link).toBeUndefined();
    expect(result.input.framing.poll).toBeUndefined();
  });

  it('"document" disabled chip is mapped to None framing', () => {
    const result = mapFormToCalloutCreationInput(baseValues({ framingChip: 'document' }), createOptions);
    expect(result.input.framing.type).toBe(CalloutFramingType.None);
  });
});

describe('mapFormToCalloutCreationInput — contribution settings', () => {
  it('responseType=none → permissive default (enabled, empty allowedTypes, Members, comments on)', () => {
    const result = mapFormToCalloutCreationInput(baseValues({ responseType: 'none' }), createOptions);
    expect(result.input.settings?.contribution).toEqual({
      enabled: true,
      allowedTypes: [],
      canAddContributions: CalloutAllowedActors.Members,
      commentsEnabled: true,
    });
    expect(result.input.contributionDefaults).toBeUndefined();
    expect(result.input.contributions).toBeUndefined();
  });

  it('responseType=post → allowedTypes:[Post], commentsEnabled tracks the toggle', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({ responseType: 'post', contributionCommentsEnabled: false }),
      createOptions
    );
    expect(result.input.settings?.contribution?.allowedTypes).toEqual([CalloutContributionType.Post]);
    expect(result.input.settings?.contribution?.commentsEnabled).toBe(false);
  });

  it('responseType in {link,memo,whiteboard} forces commentsEnabled=true (toggle hidden in UI)', () => {
    for (const responseType of ['link', 'memo', 'whiteboard'] as const) {
      const result = mapFormToCalloutCreationInput(
        baseValues({ responseType, contributionCommentsEnabled: false }),
        createOptions
      );
      expect(result.input.settings?.contribution?.commentsEnabled).toBe(true);
    }
  });

  it('allowedActors=None → settings.contribution.enabled=false, canAddContributions=None', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({ responseType: 'post', allowedActors: { members: false, admins: false } }),
      createOptions
    );
    expect(result.input.settings?.contribution?.enabled).toBe(false);
    expect(result.input.settings?.contribution?.canAddContributions).toBe(CalloutAllowedActors.None);
  });

  it('allowedActors=Admins-only → enabled=true, canAddContributions=Admins', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({ responseType: 'post', allowedActors: { members: false, admins: true } }),
      createOptions
    );
    expect(result.input.settings?.contribution?.enabled).toBe(true);
    expect(result.input.settings?.contribution?.canAddContributions).toBe(CalloutAllowedActors.Admins);
  });
});

describe('mapFormToCalloutCreationInput — cross-cutting fields', () => {
  it('tags: included on framing.tags only when non-empty; profile.tagsets is never set on create', () => {
    const withTags = mapFormToCalloutCreationInput(baseValues({ tags: 'a, b' }), createOptions);
    expect(withTags.input.framing.tags).toEqual(['a', 'b']);
    expect((withTags.input.framing.profile as { tagsets?: unknown }).tagsets).toBeUndefined();

    const blankTags = mapFormToCalloutCreationInput(baseValues({ tags: '   ' }), createOptions);
    expect(blankTags.input.framing.tags).toBeUndefined();
  });

  it('references: dropped when title or url is blank, kept ones go on profile.referencesData', () => {
    const result = mapFormToCalloutCreationInput(
      baseValues({
        referenceRows: [
          { title: 'Site', url: 'https://example.org', description: 'docs' },
          { title: '', url: 'https://no-title.example', description: '' },
          { title: 'No URL', url: '', description: '' },
        ],
      }),
      createOptions
    );
    expect(result.input.framing.profile.referencesData).toEqual([
      { name: 'Site', uri: 'https://example.org', description: 'docs' },
    ]);
  });

  it('contributionDefaults: present only when responseType is set AND at least one default has content', () => {
    const allBlank = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'post',
        contributionDefaults: { defaultDisplayName: '', postDescription: '', whiteboardContent: '' },
      }),
      createOptions
    );
    expect(allBlank.input.contributionDefaults).toBeUndefined();

    const populated = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'whiteboard',
        contributionDefaults: { defaultDisplayName: 'Title', postDescription: '', whiteboardContent: '<wb/>' },
      }),
      createOptions
    );
    expect(populated.input.contributionDefaults).toEqual({
      defaultDisplayName: 'Title',
      postDescription: undefined,
      whiteboardContent: '<wb/>',
    });

    const noResponse = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'none',
        contributionDefaults: { defaultDisplayName: 'X', postDescription: '', whiteboardContent: '' },
      }),
      createOptions
    );
    expect(noResponse.input.contributionDefaults).toBeUndefined();
  });

  it('contributionDefaults: empty whiteboardContent is omitted for whiteboard responses (create + update)', () => {
    const create = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'whiteboard',
        contributionDefaults: { defaultDisplayName: '', postDescription: '', whiteboardContent: '' },
      }),
      createOptions
    );
    expect(create.input.contributionDefaults).toBeUndefined();

    const update = mapFormToCalloutUpdateInput(
      baseValues({
        responseType: 'whiteboard',
        contributionDefaults: { defaultDisplayName: '', postDescription: '', whiteboardContent: '' },
      }),
      updateOptions
    );
    expect(update.input.contributionDefaults).toEqual({
      defaultDisplayName: undefined,
      postDescription: undefined,
      whiteboardContent: undefined,
    });
  });

  it('prePopulateLinkRows: only sent when responseType=link, blanks dropped', () => {
    const linkType = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'link',
        prePopulateLinkRows: [
          { title: 'Docs', url: 'https://docs', description: 'Read me' },
          { title: '', url: 'https://no-title', description: '' },
          { title: 'No URL', url: '', description: '' },
        ],
      }),
      createOptions
    );
    expect(linkType.input.contributions).toEqual([
      {
        type: CalloutContributionType.Link,
        link: {
          uri: 'https://docs',
          profile: { displayName: 'Docs', description: 'Read me' },
        },
      },
    ]);

    const otherType = mapFormToCalloutCreationInput(
      baseValues({
        responseType: 'post',
        prePopulateLinkRows: [{ title: 'X', url: 'https://x', description: '' }],
      }),
      createOptions
    );
    expect(otherType.input.contributions).toBeUndefined();
  });

  it('sendNotification: notifyMembers AND non-Draft visibility', () => {
    const draft = mapFormToCalloutCreationInput(baseValues({ notifyMembers: true }), {
      ...createOptions,
      visibility: CalloutVisibility.Draft,
    });
    expect(draft.input.sendNotification).toBe(false);

    const published = mapFormToCalloutCreationInput(baseValues({ notifyMembers: true }), createOptions);
    expect(published.input.sendNotification).toBe(true);

    const optedOut = mapFormToCalloutCreationInput(baseValues({ notifyMembers: false }), createOptions);
    expect(optedOut.input.sendNotification).toBe(false);
  });

  it('whiteboardPreviewImages: emitted only when framing=Whiteboard AND blobs exist', () => {
    const memoWithBlob = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'memo', whiteboardPreviewImages: [previewBlob] }),
      createOptions
    );
    expect(memoWithBlob.whiteboardPreviewImages).toBeUndefined();

    const wbNoBlob = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'whiteboard', whiteboardPreviewImages: [] }),
      createOptions
    );
    expect(wbNoBlob.whiteboardPreviewImages).toBeUndefined();

    const wbWithBlob = mapFormToCalloutCreationInput(
      baseValues({ framingChip: 'whiteboard', whiteboardPreviewImages: [previewBlob] }),
      createOptions
    );
    expect(wbWithBlob.whiteboardPreviewImages).toEqual([previewBlob]);
  });
});

describe('mapFormToCalloutUpdateInput', () => {
  it('always emits ID + framing.type + trimmed displayName + description', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({ title: '  My title  ', description: 'desc' }),
      updateOptions
    );
    expect(result.input.ID).toBe('callout-1');
    expect(result.input.framing?.type).toBe(CalloutFramingType.None);
    expect(result.input.framing?.profile?.displayName).toBe('My title');
    expect(result.input.framing?.profile?.description).toBe('desc');
  });

  it('references: only rows with id pass; blank title/url filtered out; tagsets absent without editMeta tagsetId', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        referenceRows: [
          { id: 'ref-1', title: 'A', url: 'https://a', description: 'desc' },
          { id: undefined, title: 'New row no id yet', url: 'https://new', description: '' },
          { id: 'ref-2', title: '', url: 'https://no-title', description: '' },
        ],
      }),
      updateOptions
    );
    expect(result.input.framing?.profile?.references).toEqual([
      { ID: 'ref-1', name: 'A', uri: 'https://a', description: 'desc' },
    ]);
    expect(result.input.framing?.profile?.tagsets).toBeUndefined();
  });

  it('tagsets: included only when editMeta.framingProfileTagsetId is present', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        tags: 'a, b',
        editMeta: { framingProfileTagsetId: 'tagset-1' },
      }),
      updateOptions
    );
    expect(result.input.framing?.profile?.tagsets).toEqual([{ ID: 'tagset-1', name: 'default', tags: ['a', 'b'] }]);
  });

  it('Whiteboard framing on update never sends whiteboard content / previewSettings (edited via collaborative dialog)', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        framingChip: 'whiteboard',
        whiteboardContent: '<wb/>',
        whiteboardPreviewImages: [previewBlob],
      }),
      updateOptions
    );
    expect(result.input.framing?.type).toBe(CalloutFramingType.Whiteboard);
    expect(result.input.framing?.whiteboardContent).toBeUndefined();
    expect(result.input.framing?.whiteboardPreviewSettings).toBeUndefined();
    // Preview blobs still travel out-of-band when present
    expect(result.whiteboardPreviewImages).toEqual([previewBlob]);
  });

  it('Memo framing on update never sends memo body (edited via dedicated dialog)', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({ framingChip: 'memo', memoMarkdown: '# body' }),
      updateOptions
    );
    expect(result.input.framing?.type).toBe(CalloutFramingType.Memo);
    expect(result.input.framing?.memoContent).toBeUndefined();
  });

  it('Link framing on update emits framing.link with editMeta.framingLinkId; omitted when id missing', () => {
    const withId = mapFormToCalloutUpdateInput(
      baseValues({
        framingChip: 'cta',
        linkUrl: 'https://x',
        linkDisplayName: 'X',
        editMeta: { framingLinkId: 'link-1' },
      }),
      updateOptions
    );
    expect(withId.input.framing?.link).toEqual({
      ID: 'link-1',
      uri: 'https://x',
      profile: { displayName: 'X' },
    });

    const noId = mapFormToCalloutUpdateInput(
      baseValues({ framingChip: 'cta', linkUrl: 'https://x', linkDisplayName: 'X' }),
      updateOptions
    );
    expect(noId.input.framing?.link).toBeUndefined();
  });

  it('Link framing on update falls back to URL when displayName is blank', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        framingChip: 'cta',
        linkUrl: 'https://x',
        linkDisplayName: '',
        editMeta: { framingLinkId: 'link-1' },
      }),
      updateOptions
    );
    expect(result.input.framing?.link?.profile?.displayName).toBe('https://x');
  });

  it('Poll framing on update emits poll.title only — options flow through dedicated mutations', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        framingChip: 'poll',
        pollQuestion: 'Updated?',
        pollOptions: [{ text: 'Yes' }, { text: 'No' }],
      }),
      updateOptions
    );
    expect(result.input.framing?.poll).toEqual({ title: 'Updated?' });
  });

  it('contribution settings on update omit allowedTypes; absent when responseType=none', () => {
    const noResponse = mapFormToCalloutUpdateInput(baseValues({ responseType: 'none' }), updateOptions);
    expect(noResponse.input.settings?.contribution).toBeUndefined();

    const post = mapFormToCalloutUpdateInput(
      baseValues({ responseType: 'post', contributionCommentsEnabled: false }),
      updateOptions
    );
    expect(post.input.settings?.contribution).toEqual({
      enabled: true,
      canAddContributions: CalloutAllowedActors.Members,
      commentsEnabled: false,
    });
    expect((post.input.settings?.contribution as { allowedTypes?: unknown }).allowedTypes).toBeUndefined();
  });

  it('contributionDefaults on update: post/memo populate postDescription; whiteboard populates whiteboardContent', () => {
    const post = mapFormToCalloutUpdateInput(
      baseValues({
        responseType: 'post',
        contributionDefaults: { defaultDisplayName: 'Name', postDescription: 'desc', whiteboardContent: '<wb/>' },
      }),
      updateOptions
    );
    expect(post.input.contributionDefaults).toEqual({
      defaultDisplayName: 'Name',
      postDescription: 'desc',
      whiteboardContent: undefined,
    });

    const wb = mapFormToCalloutUpdateInput(
      baseValues({
        responseType: 'whiteboard',
        contributionDefaults: { defaultDisplayName: 'N', postDescription: 'p', whiteboardContent: '<wb/>' },
      }),
      updateOptions
    );
    expect(wb.input.contributionDefaults).toEqual({
      defaultDisplayName: 'N',
      postDescription: undefined,
      whiteboardContent: '<wb/>',
    });

    const memo = mapFormToCalloutUpdateInput(
      baseValues({
        responseType: 'memo',
        contributionDefaults: { defaultDisplayName: '', postDescription: 'p', whiteboardContent: '' },
      }),
      updateOptions
    );
    expect(memo.input.contributionDefaults).toEqual({
      defaultDisplayName: undefined,
      postDescription: 'p',
      whiteboardContent: undefined,
    });

    const none = mapFormToCalloutUpdateInput(baseValues({ responseType: 'none' }), updateOptions);
    expect(none.input.contributionDefaults).toBeUndefined();
  });

  it('whiteboardPreviewImages: emitted only for Whiteboard framing with blobs', () => {
    const memoWithBlob = mapFormToCalloutUpdateInput(
      baseValues({ framingChip: 'memo', whiteboardPreviewImages: [previewBlob] }),
      updateOptions
    );
    expect(memoWithBlob.whiteboardPreviewImages).toBeUndefined();

    const wbNoBlob = mapFormToCalloutUpdateInput(
      baseValues({ framingChip: 'whiteboard', whiteboardPreviewImages: [] }),
      updateOptions
    );
    expect(wbNoBlob.whiteboardPreviewImages).toBeUndefined();

    const wbWithBlob = mapFormToCalloutUpdateInput(
      baseValues({ framingChip: 'whiteboard', whiteboardPreviewImages: [previewBlob] }),
      updateOptions
    );
    expect(wbWithBlob.whiteboardPreviewImages).toEqual([previewBlob]);
  });

  it('pre-populate links are never sent on update (spec D19)', () => {
    const result = mapFormToCalloutUpdateInput(
      baseValues({
        responseType: 'link',
        prePopulateLinkRows: [{ title: 'X', url: 'https://x', description: '' }],
      }),
      updateOptions
    );
    expect((result.input as { contributions?: unknown }).contributions).toBeUndefined();
  });
});
