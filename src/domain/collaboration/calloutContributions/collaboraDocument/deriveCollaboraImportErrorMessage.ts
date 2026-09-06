import type { TFunction } from 'i18next';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';

/**
 * Maps a `validateCollaboraImportFile` rejection (or a server-side rejection recast into the
 * same shape) to a human-readable, localized message. Single source of truth shared by every
 * Collabora-document upload surface — the callout-framing upload flow (`CalloutFormConnector`)
 * and the document-response upload flow (`DocumentContributionAddConnector`) — so the two never
 * drift into different copy for the same rejection reason.
 *
 * Takes the broader `DocumentImportError` union (not the narrower `ValidationError` that
 * `validateCollaboraImportFile` itself returns) because that is the type `DocumentImportZone`'s
 * `onError` callback actually surfaces to both consumers; `'different-type'` and any other
 * unhandled kind fall through to `null` (no message), matching the original inline switch.
 */
export const deriveCollaboraImportErrorMessage = (
  error: DocumentImportError | null,
  t: TFunction<'crd-space'>,
  formatList: string,
  capMb: number
): string | null => {
  if (!error) return null;

  switch (error.kind) {
    case 'extension':
      return t('callout.documentImportErrorUnsupported', { formats: formatList });
    case 'size':
      return t('callout.documentImportErrorTooLarge', { cap: capMb });
    case 'multiple-files':
      return t('callout.documentImportErrorMultiple');
    case 'folder':
      return t('callout.documentImportErrorFolder');
    default:
      return null;
  }
};
