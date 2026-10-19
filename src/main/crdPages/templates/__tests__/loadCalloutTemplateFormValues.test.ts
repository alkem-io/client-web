import { describe, expect, it, vi } from 'vitest';
import {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  type CalloutTemplateContentFragment,
  CalloutVisibility,
  CollaboraDocumentType,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import { loadCalloutTemplateFormValues } from '../loadCalloutTemplateFormValues';

const fragment = (
  overrides: Partial<CalloutTemplateContentFragment['framing']> = {}
): CalloutTemplateContentFragment => ({
  __typename: 'Callout',
  id: 'callout-1',
  classification: undefined,
  framing: {
    __typename: 'CalloutFraming',
    id: 'framing-1',
    type: CalloutFramingType.None,
    profile: {
      __typename: 'Profile',
      id: 'profile-1',
      displayName: 'Framed thing',
      description: 'desc',
      tagsets: [
        { __typename: 'Tagset', id: 'ts-1', name: 'default', tags: [], allowedValues: [], type: TagsetType.Freeform },
      ],
      defaultTagset: undefined,
      references: [],
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
    whiteboardContentAvailable: false,
  },
});

const getTemplateContent = (callout: CalloutTemplateContentFragment) =>
  vi.fn().mockResolvedValue({ data: { lookup: { template: { callout } } } }) as never;

/**
 * This wrapper is the feature's ONLY producer of `editMeta.collaboraDocumentId` (085 §6 D15), and
 * these cases are the only automated evidence that applying a Collabora-document template carries
 * the copy source through to `mapFormToCalloutCreationInput` (residual R-12).
 */
describe('loadCalloutTemplateFormValues — Collabora copy source', () => {
  it('carries the template document id into editMeta so the create mapper can copy it', async () => {
    const callout = fragment({
      type: CalloutFramingType.CollaboraDocument,
      collaboraDocument: {
        __typename: 'CollaboraDocument',
        id: 'doc-1',
        documentType: CollaboraDocumentType.Presentation,
        profile: { __typename: 'Profile', id: 'dp-1', displayName: 'Slides' },
      },
    });

    const values = await loadCalloutTemplateFormValues(getTemplateContent(callout), 'template-1');

    expect(values?.editMeta?.collaboraDocumentId).toBe('doc-1');
  });

  it('leaves the copy source unset for a template with another framing kind', async () => {
    const values = await loadCalloutTemplateFormValues(getTemplateContent(fragment()), 'template-1');

    expect(values?.editMeta?.collaboraDocumentId).toBeUndefined();
  });
});
