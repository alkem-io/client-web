import { Paperclip } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import type { CalloutDeletionSummaryModel } from '@/crd/components/dialogs/calloutDeletionSummary.types';

/** Max named items listed per list before the totals/overflow take over (clarification 2026-07-02). */
const DEFAULT_LIST_CAP = 3;

type CalloutDeletionSummaryProps = {
  summary: CalloutDeletionSummaryModel;
  /** Max named items shown per list. */
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
 * Content summary for the delete-callout confirmation, built from data the
 * callout's standard load already carries (feature 114). A table headed by the
 * scope sentence ("The whiteboard and 20 contributions will be deleted") lists
 * the first contributions — bold title, one-line markdown description preview —
 * followed by the comment count and the attachments note; named links render
 * below. Renders nothing for an empty callout so the dialog collapses to its
 * concise form.
 */
export function CalloutDeletionSummary({ summary, listCap = DEFAULT_LIST_CAP }: CalloutDeletionSummaryProps) {
  const { t } = useTranslation('crd-space');

  if (!hasDeletableContent(summary)) {
    return null;
  }

  const { contributionCount, richContent, commentCount } = summary;
  // With exactly one contribution beyond the cap, show it as a row — an
  // "1 contribution more..." line would waste the very row it summarizes.
  const contributionRowCap = contributionCount === listCap + 1 ? listCap + 1 : listCap;
  const visibleContributions = summary.contributions.slice(0, contributionRowCap);
  const moreContributionsCount = contributionCount - visibleContributions.length;
  const visibleLinks = summary.links.slice(0, listCap);
  const moreLinksCount = summary.links.length - visibleLinks.length;

  let headerText: string | undefined;
  if (richContent === 'poll') {
    // A poll's deletion always takes its collected results with it — the header
    // says so. Dedicated keys (not contentType composition): the compound
    // subject needs a plural verb in most supported languages.
    headerText =
      contributionCount > 0
        ? t('deleteCallout.headerRichPollContributions', { count: contributionCount })
        : t('deleteCallout.headerRichPoll');
  } else if (richContent !== undefined) {
    const content = t(`deleteCallout.contentType.${richContent}`);
    headerText =
      contributionCount > 0
        ? t('deleteCallout.headerRichContributions', { content, count: contributionCount })
        : t('deleteCallout.headerRich', { content });
  } else if (contributionCount > 0) {
    headerText = t('deleteCallout.headerContributions', { count: contributionCount });
  }

  const showTable = headerText !== undefined || commentCount > 0;

  return (
    <div className="flex flex-col gap-2">
      {showTable && (
        <table className="w-full table-fixed border-collapse border border-border text-body text-muted-foreground">
          {headerText !== undefined && (
            <thead>
              <tr className="border-b border-border">
                <th colSpan={2} className="px-2 py-1.5 text-left text-card-title text-foreground">
                  {headerText}
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {visibleContributions.map(contribution => (
              <tr key={contribution.id} className="border-b border-border">
                <th scope="row" className="w-2/5 truncate px-2 py-1.5 text-left text-card-title">
                  {contribution.label}
                </th>
                <td className="py-1.5 pr-2">
                  {contribution.description !== undefined && (
                    <InlineMarkdown
                      content={contribution.description}
                      clampLines={1}
                      disableLinks={true}
                      className="text-caption"
                    />
                  )}
                </td>
              </tr>
            ))}
            {moreContributionsCount > 0 && (
              <tr className="border-b border-border">
                <td colSpan={2} className="px-2 py-1.5">
                  {t('deleteCallout.moreContributions', { count: moreContributionsCount })}
                </td>
              </tr>
            )}
            {commentCount > 0 && (
              <tr className="border-b border-border">
                <td colSpan={2} className="px-2 py-1.5">
                  {t('deleteCallout.comments', { count: commentCount })}
                </td>
              </tr>
            )}
            {contributionCount > 0 && (
              <tr>
                <td colSpan={2} className="px-2 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <Paperclip aria-hidden="true" className="size-3.5 shrink-0" />
                    {/* Contribution attachments are not enumerable from the loaded data (FR-007) — a general note stands in. */}
                    {t('deleteCallout.attachmentsNote')}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {visibleLinks.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          {visibleLinks.map(link => (
            <li key={link.id} className="truncate">
              {link.label}
            </li>
          ))}
          {moreLinksCount > 0 && <li>{t('deleteCallout.moreLinks', { count: moreLinksCount })}</li>}
        </ul>
      )}
    </div>
  );
}
