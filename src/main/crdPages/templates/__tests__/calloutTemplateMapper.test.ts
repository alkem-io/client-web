import { describe, expect, it } from 'vitest';
import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  type CalloutTemplateContentFragment,
  CalloutVisibility,
  CollaboraDocumentType,
  PollResultsDetail,
  PollResultsVisibility,
  PollStatus,
  TagsetType,
  WhiteboardPreviewMode,
} from '@/core/apollo/generated/graphql-schema';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { type CalloutFormValues, EMPTY_CALLOUT_FORM_VALUES } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import {
  calloutFormValuesToCreateCalloutInput,
  calloutFormValuesToUpdateCalloutEntityInput,
  calloutTemplateContentToFormValues,
} from '../calloutTemplateMapper';

const fallbacks = {
  whiteboardFallbackDisplayName: 'Untitled whiteboard',
  collaboraFallbackDisplayName: 'Untitled doc',
};

const values = (overrides: Partial<CalloutFormValues> = {}): CalloutFormValues => ({
  ...EMPTY_CALLOUT_FORM_VALUES,
  title: 'My callout',
  ...overrides,
});

// ---------------------------------------------------------------------------
// calloutFormValuesToCreateCalloutInput
// ---------------------------------------------------------------------------

describe('calloutFormValuesToCreateCalloutInput', () => {
  it('keeps only framing / settings / contributionDefaults (drops sendNotification + classification)', () => {
    const input = calloutFormValuesToCreateCalloutInput(values({ notifyMembers: true }), fallbacks);
    expect(Object.keys(input).sort()).toEqual(['contributionDefaults', 'framing', 'settings'].sort());
    expect('sendNotification' in input).toBe(false);
    expect('classification' in input).toBe(false);
  });

  it('maps each framing kind to the server enum', () => {
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'none' }), fallbacks).framing.type).toBe(
      CalloutFramingType.None
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'whiteboard' }), fallbacks).framing.type).toBe(
      CalloutFramingType.Whiteboard
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'memo' }), fallbacks).framing.type).toBe(
      CalloutFramingType.Memo
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'document' }), fallbacks).framing.type).toBe(
      CalloutFramingType.CollaboraDocument
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'cta' }), fallbacks).framing.type).toBe(
      CalloutFramingType.Link
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'image' }), fallbacks).framing.type).toBe(
      CalloutFramingType.MediaGallery
    );
    expect(calloutFormValuesToCreateCalloutInput(values({ framingChip: 'poll' }), fallbacks).framing.type).toBe(
      CalloutFramingType.Poll
    );
  });

  it('carries the whiteboard drawing for whiteboard framing', () => {
    const input = calloutFormValuesToCreateCalloutInput(
      values({ framingChip: 'whiteboard', whiteboardContent: '{"elements":[]}' }),
      fallbacks
    );
    expect(input.framing.whiteboard?.content).toBe('{"elements":[]}');
  });

  it('carries the poll definition for poll framing', () => {
    const input = calloutFormValuesToCreateCalloutInput(
      values({ framingChip: 'poll', pollQuestion: 'Pick one', pollOptions: [{ text: 'A' }, { text: 'B' }] }),
      fallbacks
    );
    expect(input.framing.poll?.title).toBe('Pick one');
    expect(input.framing.poll?.options).toEqual(['A', 'B']);
  });

  it('carries the Collabora blank-create document type for document framing', () => {
    const input = calloutFormValuesToCreateCalloutInput(
      values({ framingChip: 'document', collaboraDocumentType: CollaboraDocumentType.Spreadsheet }),
      fallbacks
    );
    expect(input.framing.collaboraDocument?.documentType).toBe(CollaboraDocumentType.Spreadsheet);
  });
});

// ---------------------------------------------------------------------------
// calloutFormValuesToUpdateCalloutEntityInput
// ---------------------------------------------------------------------------

describe('calloutFormValuesToUpdateCalloutEntityInput', () => {
  it('sends the callout id and the framing profile', () => {
    const input = calloutFormValuesToUpdateCalloutEntityInput(values({ title: 'Edited' }), 'callout-7');
    expect(input.ID).toBe('callout-7');
    expect(input.framing?.profile?.displayName).toBe('Edited');
  });

  it('adds the whiteboard body + preview settings for whiteboard framing (unlike the live-callout mapper)', () => {
    const input = calloutFormValuesToUpdateCalloutEntityInput(
      values({ framingChip: 'whiteboard', whiteboardContent: '{"elements":[1]}' }),
      'c1'
    );
    expect(input.framing?.whiteboardContent).toBe('{"elements":[1]}');
    expect(input.framing?.whiteboardPreviewSettings).toBeDefined();
  });

  it('adds the memo body for memo framing when non-empty', () => {
    const input = calloutFormValuesToUpdateCalloutEntityInput(
      values({ framingChip: 'memo', memoMarkdown: '# Notes' }),
      'c1'
    );
    expect(input.framing?.memoContent).toBe('# Notes');
  });

  it('does not add a memo body for non-memo framing', () => {
    const input = calloutFormValuesToUpdateCalloutEntityInput(values({ framingChip: 'none', memoMarkdown: 'x' }), 'c1');
    expect(input.framing?.memoContent).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// calloutTemplateContentToFormValues
// ---------------------------------------------------------------------------

const tagset = (tags: string[]) => ({
  __typename: 'Tagset' as const,
  id: 'ts-1',
  name: 'default',
  tags,
  allowedValues: [],
  type: TagsetType.Freeform,
});

const baseFragment = (
  overrides: Partial<CalloutTemplateContentFragment['framing']> = {}
): CalloutTemplateContentFragment => ({
  __typename: 'Callout',
  id: 'callout-1',
  framing: {
    __typename: 'CalloutFraming',
    id: 'framing-1',
    type: CalloutFramingType.None,
    profile: {
      __typename: 'Profile',
      id: 'profile-1',
      displayName: 'Framed thing',
      description: 'desc',
      tagsets: [tagset(['alpha', 'beta'])],
      defaultTagset: undefined,
      references: [{ __typename: 'Reference', id: 'ref-1', name: 'Docs', uri: 'https://x.test', description: 'd' }],
      storageBucket: { __typename: 'StorageBucket', id: 'sb-1' },
    },
    whiteboard: undefined,
    link: undefined,
    memo: undefined,
    mediaGallery: undefined,
    poll: undefined,
    collaboraDocument: undefined,
    ...overrides,
  },
  settings: {
    __typename: 'CalloutSettings',
    visibility: CalloutVisibility.Draft,
    contribution: {
      __typename: 'CalloutSettingsContribution',
      enabled: true,
      allowedTypes: [CalloutContributionType.Post],
      canAddContributions: CalloutAllowedActors.Members,
      commentsEnabled: true,
    },
    framing: { __typename: 'CalloutSettingsFraming', commentsEnabled: false },
  },
  contributionDefaults: {
    __typename: 'CalloutContributionDefaults',
    id: 'cd-1',
    defaultDisplayName: 'Item',
    postDescription: 'A post',
    whiteboardContent: undefined,
  },
});

describe('calloutTemplateContentToFormValues', () => {
  it('round-trips the framing profile, tags, references and contribution settings', () => {
    const v = calloutTemplateContentToFormValues(baseFragment());
    expect(v.title).toBe('Framed thing');
    expect(v.description).toBe('desc');
    expect(v.tags).toBe('alpha, beta');
    expect(v.framingChip).toBe('none');
    expect(v.framingCommentsEnabled).toBe(false);
    expect(v.responseType).toBe('post');
    expect(v.allowedActors).toEqual({ members: true, admins: true });
    expect(v.contributionCommentsEnabled).toBe(true);
    expect(v.contributionDefaults).toEqual({
      defaultDisplayName: 'Item',
      postDescription: 'A post',
      whiteboardContent: '',
    });
    expect(v.referenceRows).toEqual([{ id: 'ref-1', title: 'Docs', url: 'https://x.test', description: 'd' }]);
    expect(v.editMeta?.framingProfileTagsetId).toBe('ts-1');
  });

  it('copies the whiteboard drawing (unlike the live-callout edit prefill)', () => {
    const v = calloutTemplateContentToFormValues(
      baseFragment({
        type: CalloutFramingType.Whiteboard,
        whiteboard: {
          __typename: 'Whiteboard',
          content: '{"elements":[42]}',
          id: 'wb-1',
          nameID: 'wb-1',
          createdDate: new Date(),
          guestContributionsAllowed: false,
          contentUpdatePolicy: 'CONTRIBUTORS' as never,
          profile: {
            __typename: 'Profile',
            id: 'wbp-1',
            url: '/wb',
            displayName: 'WB',
            description: undefined,
            visual: undefined,
            preview: undefined,
            tagset: undefined,
            storageBucket: { __typename: 'StorageBucket', id: 'sb', allowedMimeTypes: [], maxFileSize: 0 },
          },
          authorization: undefined,
          createdBy: undefined,
          previewSettings: {
            __typename: 'WhiteboardPreviewSettings',
            mode: WhiteboardPreviewMode.Auto,
            coordinates: undefined,
          },
        },
      })
    );
    expect(v.framingChip).toBe('whiteboard');
    expect(v.whiteboardContent).toBe('{"elements":[42]}');
    expect(v.whiteboardConfigured).toBe(true);
  });

  it('falls back to the empty-whiteboard sentinel when whiteboard framing has no drawing', () => {
    const v = calloutTemplateContentToFormValues(baseFragment());
    expect(v.whiteboardContent).toBe(EmptyWhiteboardString);
  });

  it('copies the memo body', () => {
    const v = calloutTemplateContentToFormValues(
      baseFragment({
        type: CalloutFramingType.Memo,
        memo: {
          __typename: 'Memo',
          id: 'm-1',
          markdown: '# hi',
          profile: { __typename: 'Profile', id: 'mp', displayName: 'M' },
        },
      })
    );
    expect(v.framingChip).toBe('memo');
    expect(v.memoMarkdown).toBe('# hi');
    expect(v.editMeta?.memoId).toBe('m-1');
  });

  it('reconstructs poll question, options and settings', () => {
    const v = calloutTemplateContentToFormValues(
      baseFragment({
        type: CalloutFramingType.Poll,
        poll: {
          __typename: 'Poll',
          id: 'p-1',
          createdDate: new Date(),
          updatedDate: new Date(),
          title: 'Choose',
          status: PollStatus.Open,
          totalVotes: 0,
          canSeeDetailedResults: true,
          settings: {
            __typename: 'PollSettings',
            allowContributorsAddOptions: true,
            minResponses: 1,
            maxResponses: 0,
            resultsVisibility: PollResultsVisibility.Hidden,
            resultsDetail: PollResultsDetail.Count,
          },
          options: [
            {
              __typename: 'PollOption',
              id: 'o2',
              createdDate: new Date(),
              updatedDate: new Date(),
              text: 'B',
              sortOrder: 2,
              voteCount: 0,
              votePercentage: 0,
              voters: undefined,
              myVote: undefined,
            } as never,
            {
              __typename: 'PollOption',
              id: 'o1',
              createdDate: new Date(),
              updatedDate: new Date(),
              text: 'A',
              sortOrder: 1,
              voteCount: 0,
              votePercentage: 0,
              voters: undefined,
              myVote: undefined,
            } as never,
          ],
          myVote: undefined,
        },
      })
    );
    expect(v.framingChip).toBe('poll');
    expect(v.pollQuestion).toBe('Choose');
    expect(v.pollOptions).toEqual([
      { id: 'o1', text: 'A' },
      { id: 'o2', text: 'B' },
    ]);
    expect(v.pollAllowMultiple).toBe(true);
    expect(v.pollAllowCustomOptions).toBe(true);
    expect(v.pollHideResultsUntilVoted).toBe(true);
    expect(v.pollShowVoterAvatars).toBe(false);
    expect(v.editMeta?.pollId).toBe('p-1');
  });

  it('reconstructs the Collabora document type', () => {
    const v = calloutTemplateContentToFormValues(
      baseFragment({
        type: CalloutFramingType.CollaboraDocument,
        collaboraDocument: {
          __typename: 'CollaboraDocument',
          id: 'doc-1',
          documentType: CollaboraDocumentType.Presentation,
          profile: { __typename: 'Profile', id: 'dp', displayName: 'Slides' },
        },
      })
    );
    expect(v.framingChip).toBe('document');
    expect(v.collaboraDocumentType).toBe(CollaboraDocumentType.Presentation);
  });

  it('treats disabled / empty contribution settings as the "none" response type', () => {
    const frag = baseFragment();
    frag.settings.contribution.enabled = false;
    expect(calloutTemplateContentToFormValues(frag).responseType).toBe('none');
  });
});
