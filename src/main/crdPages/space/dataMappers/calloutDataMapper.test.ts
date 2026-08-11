import { describe, expect, it } from 'vitest';
import { CalloutFramingType, CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { type CrdSpaceTranslator, mapCalloutDetailsToPostCard } from './calloutDataMapper';

// Minimal translator stub — the mapper only ever passes `t` through to
// `resolveAuthorAndTimestamp`'s relative-date formatting, which isn't exercised
// by these fixtures (no publishedDate/createdDate supplied).
const t = ((key: string) => key) as unknown as CrdSpaceTranslator;

const baseCallout = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'callout-1',
    framing: { type: CalloutFramingType.None, profile: { displayName: 'Untitled', references: [] } },
    settings: { framing: { commentsEnabled: true } },
    comments: undefined,
    ...overrides,
  }) as unknown as CalloutDetailsModelExtended;

describe('mapCalloutDetailsToPostCard — CollaboraDocument framing', () => {
  it('leaves framingDocumentPreviewUrl undefined — no backend field exists yet (spec A-001/A-002)', () => {
    const callout = baseCallout({
      framing: {
        type: CalloutFramingType.CollaboraDocument,
        profile: { displayName: 'Q3 roadmap', references: [] },
        collaboraDocument: { id: 'doc-1', documentType: CollaboraDocumentType.Wordprocessing },
      },
    });

    const result = mapCalloutDetailsToPostCard(callout, t);

    expect(result.framingDocumentPreviewUrl).toBeUndefined();
    expect(result.framingDocumentType).toBe('text');
  });

  it('derives spreadsheet and presentation types correctly (regression)', () => {
    const spreadsheet = mapCalloutDetailsToPostCard(
      baseCallout({
        framing: {
          type: CalloutFramingType.CollaboraDocument,
          profile: { displayName: 'Budget', references: [] },
          collaboraDocument: { id: 'doc-2', documentType: CollaboraDocumentType.Spreadsheet },
        },
      }),
      t
    );
    expect(spreadsheet.framingDocumentType).toBe('spreadsheet');
    expect(spreadsheet.framingDocumentPreviewUrl).toBeUndefined();

    const presentation = mapCalloutDetailsToPostCard(
      baseCallout({
        framing: {
          type: CalloutFramingType.CollaboraDocument,
          profile: { displayName: 'Pitch deck', references: [] },
          collaboraDocument: { id: 'doc-3', documentType: CollaboraDocumentType.Presentation },
        },
      }),
      t
    );
    expect(presentation.framingDocumentType).toBe('presentation');
    expect(presentation.framingDocumentPreviewUrl).toBeUndefined();
  });

  it('collapses DRAWING to the "text" preview type, same as WORDPROCESSING (spec Clarifications/FR-012)', () => {
    const result = mapCalloutDetailsToPostCard(
      baseCallout({
        framing: {
          type: CalloutFramingType.CollaboraDocument,
          profile: { displayName: 'Sketch', references: [] },
          collaboraDocument: { id: 'doc-4', documentType: CollaboraDocumentType.Drawing },
        },
      }),
      t
    );

    expect(result.framingDocumentType).toBe('text');
    expect(result.framingDocumentPreviewUrl).toBeUndefined();
  });

  it('leaves framingDocumentType and framingDocumentPreviewUrl undefined for non-document framings (regression)', () => {
    const result = mapCalloutDetailsToPostCard(baseCallout(), t);

    expect(result.framingDocumentType).toBeUndefined();
    expect(result.framingDocumentPreviewUrl).toBeUndefined();
  });
});
