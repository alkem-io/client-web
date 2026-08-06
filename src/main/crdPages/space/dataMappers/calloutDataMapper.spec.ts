/**
 * @vitest-environment jsdom
 *
 * Guards the non-exhaustive `if/else` chain in `mapCollaboraDocumentTypeToPreviewType`
 * (unlike collaboraDocumentTypeMap.ts's exhaustive Record, the TypeScript compiler
 * does NOT force every CollaboraDocumentType to be handled here — a missed branch
 * silently drops the framing preview type instead of failing to build).
 */
import { describe, expect, it } from 'vitest';
import { CalloutFramingType, CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { type CrdSpaceTranslator, mapCalloutDetailsToPostCard } from './calloutDataMapper';

const t = ((key: string) => key) as unknown as CrdSpaceTranslator;

const makeCollaboraCallout = (documentType: string): CalloutDetailsModelExtended =>
  ({
    id: 'callout-1',
    draft: false,
    comments: { messagesCount: 0 },
    settings: { framing: { commentsEnabled: true }, contribution: { allowedTypes: [] } },
    framing: {
      type: CalloutFramingType.CollaboraDocument,
      profile: { id: 'p', displayName: 'Doc title', tagset: undefined, references: [] },
      collaboraDocument: { id: 'doc-1', documentType },
    },
  }) as unknown as CalloutDetailsModelExtended;

describe('mapCalloutDetailsToPostCard — Collabora document framing type mapping', () => {
  it.each([
    [CollaboraDocumentType.Wordprocessing, 'text'],
    [CollaboraDocumentType.Spreadsheet, 'spreadsheet'],
    [CollaboraDocumentType.Presentation, 'presentation'],
    [CollaboraDocumentType.Drawing, 'text'],
    [CollaboraDocumentType.Pdf, 'pdf'],
  ])('maps documentType %s to framingDocumentType %s', (documentType, expected) => {
    const result = mapCalloutDetailsToPostCard(makeCollaboraCallout(documentType), t);
    expect(result.framingDocumentType).toBe(expected);
  });

  it('maps a PDF-typed contribution to the "pdf" preview type (T012 guard — not undefined/dropped)', () => {
    const result = mapCalloutDetailsToPostCard(makeCollaboraCallout(CollaboraDocumentType.Pdf), t);
    expect(result.framingDocumentType).toBe('pdf');
    expect(result.framingDocumentType).not.toBeUndefined();
  });

  it('leaves framingDocumentType undefined for a non-CollaboraDocument framing type', () => {
    const callout = {
      ...makeCollaboraCallout(CollaboraDocumentType.Pdf),
      framing: {
        type: CalloutFramingType.None,
        profile: { id: 'p', displayName: 'Post title', tagset: undefined, references: [] },
      },
    } as unknown as CalloutDetailsModelExtended;
    const result = mapCalloutDetailsToPostCard(callout, t);
    expect(result.framingDocumentType).toBeUndefined();
  });
});
