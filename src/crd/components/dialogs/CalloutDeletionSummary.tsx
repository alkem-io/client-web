import { useTranslation } from 'react-i18next';
import type { CalloutDeletionSummaryModel } from '@/crd/components/dialogs/calloutDeletionSummary.types';

/** Max named links listed before the "and N more links" overflow line (clarification 2026-07-02). */
const DEFAULT_LIST_CAP = 3;

type CalloutDeletionSummaryProps = {
  summary: CalloutDeletionSummaryModel;
  /** Max named items shown before an overflow line. */
  listCap?: number;
};

/** Whether the summary carries anything beyond the callout itself — drives the body and the confirm-label scope. */
export function hasDeletableContent(summary: CalloutDeletionSummaryModel): boolean {
  return (
    summary.contributionCount > 0 ||
    summary.richContent !== undefined ||
    summary.links.length > 0 ||
    summary.commentCount > 0
  );
}

/**
 * Content list for the delete-callout confirmation: what will be permanently
 * removed, built from cache-only data (feature 114). Renders nothing for an
 * empty callout so the dialog collapses to its concise form.
 */
export function CalloutDeletionSummary({ summary, listCap = DEFAULT_LIST_CAP }: CalloutDeletionSummaryProps) {
  const { t } = useTranslation('crd-space');

  if (!hasDeletableContent(summary)) {
    return null;
  }

  const visibleLinks = summary.links.slice(0, listCap);
  const overflowCount = summary.links.length - visibleLinks.length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-emphasis">{t('deleteCallout.contentsIntro')}</p>
      <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
        {summary.contributionCount > 0 && (
          <li>
            {t('deleteCallout.contributions', { count: summary.contributionCount })}
            {/* Contribution attachments are not enumerable from cached data (FR-007) — a general note stands in. */}
            <span className="block text-caption">{t('deleteCallout.attachmentsNote')}</span>
          </li>
        )}
        {summary.richContent !== undefined && (
          <li>{t('deleteCallout.including', { content: t(`deleteCallout.contentType.${summary.richContent}`) })}</li>
        )}
        {visibleLinks.map(link => (
          <li key={link.id} className="truncate">
            {link.label}
          </li>
        ))}
        {overflowCount > 0 && <li>{t('deleteCallout.moreLinks', { count: overflowCount })}</li>}
        {summary.commentCount > 0 && <li>{t('deleteCallout.comments', { count: summary.commentCount })}</li>}
      </ul>
    </div>
  );
}
