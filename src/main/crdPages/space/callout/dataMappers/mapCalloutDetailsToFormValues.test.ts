import { describe, expect, it } from 'vitest';
import type { CalloutContentQuery } from '@/core/apollo/generated/graphql-schema';
import { CalloutAllowedActors, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { mapCalloutDetailsToFormValues } from './mapCalloutDetailsToFormValues';

// D16, 2026-05-18 — a live callout with whiteboard framing carries a server-rendered preview
// image (`framing.whiteboard.profile.preview` = `visual(type: WHITEBOARD_PREVIEW)`). The edit
// prefill MUST surface it on `whiteboardPreviewServerUrl` so `FramingEditorConnector` can render
// it as the inline preview's read-time fallback (mirrors `calloutTemplateContentToFormValues`).

const baseData = (preview: { uri: string } | null = { uri: 'https://cdn.alkem.io/wb/preview.png' }) =>
  ({
    lookup: {
      callout: {
        framing: {
          type: CalloutFramingType.Whiteboard,
          profile: { displayName: 'WB callout', description: '', tagsets: [], references: [] },
          whiteboard: {
            id: 'wb-1',
            content: '{"elements":[]}',
            profile: { preview },
            previewSettings: undefined,
          },
        },
        settings: {
          contribution: { allowedTypes: [], canAddContributions: CalloutAllowedActors.None, commentsEnabled: false },
          framing: { commentsEnabled: false },
        },
        contributionDefaults: {},
      },
    },
  }) as unknown as CalloutContentQuery;

describe('mapCalloutDetailsToFormValues — whiteboardPreviewServerUrl (D16)', () => {
  it('surfaces framing.whiteboard.profile.preview.uri on the prefill', () => {
    expect(mapCalloutDetailsToFormValues(baseData()).whiteboardPreviewServerUrl).toBe(
      'https://cdn.alkem.io/wb/preview.png'
    );
  });

  it('leaves it undefined when the whiteboard has no rendered preview', () => {
    expect(mapCalloutDetailsToFormValues(baseData(null)).whiteboardPreviewServerUrl).toBeUndefined();
  });

  it('leaves it undefined for non-whiteboard framing (no whiteboard node)', () => {
    const data = {
      lookup: {
        callout: {
          framing: {
            type: CalloutFramingType.None,
            profile: { displayName: 'x', description: '', tagsets: [], references: [] },
          },
          settings: {
            contribution: { allowedTypes: [], canAddContributions: CalloutAllowedActors.None, commentsEnabled: false },
            framing: { commentsEnabled: false },
          },
          contributionDefaults: {},
        },
      },
    } as unknown as CalloutContentQuery;
    expect(mapCalloutDetailsToFormValues(data).whiteboardPreviewServerUrl).toBeUndefined();
  });
});
