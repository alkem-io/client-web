import type {
  CalloutDeletionSummaryModel,
  CalloutRichContentKind,
  DeletionListItem,
} from '@/crd/components/dialogs/calloutDeletionSummary.types';
import type {
  CalloutContributionStub,
  CalloutDetailsModelExtended,
} from '@/domain/collaboration/callout/models/CalloutDetailsModel';

const resolveRichContent = (framing: CalloutDetailsModelExtended['framing']): CalloutRichContentKind | undefined => {
  if (framing?.whiteboard) return 'whiteboard';
  if (framing?.memo) return 'memo';
  if (framing?.poll) return 'poll';
  if (framing?.mediaGallery) return 'mediaGallery';
  if (framing?.collaboraDocument) return 'document';
  return undefined;
};

// Exactly one entity stub is set per contribution (schema invariant); links fall back to the URI.
const resolveContribution = (
  contribution: CalloutContributionStub
): { label: string; description?: string } | undefined => {
  const profile =
    contribution.post?.profile ??
    contribution.whiteboard?.profile ??
    contribution.memo?.profile ??
    contribution.collaboraDocument?.profile;
  if (profile?.displayName) {
    return { label: profile.displayName, description: profile.description || undefined };
  }
  if (contribution.link) {
    const label = contribution.link.profile.displayName || contribution.link.uri;
    return label ? { label, description: contribution.link.profile.description || undefined } : undefined;
  }
  return undefined;
};

/**
 * Pure mapping from the callout model (as loaded by the standard `CalloutDetails`
 * query — contribution title stubs included) to the plain-TS deletion summary
 * rendered by `DeleteCalloutDialog` (feature 114, Option A). No fetch, no
 * mutation — opening the delete dialog must never trigger a request. A framing
 * link body is surfaced via `links` (it is nameable), not via `richContent`.
 */
export function mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummaryModel {
  const framing = callout.framing;

  const contributions: DeletionListItem[] = [...(callout.contributions ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap(contribution => {
      const resolved = resolveContribution(contribution);
      return resolved ? [{ id: contribution.id, ...resolved }] : [];
    });

  const links: DeletionListItem[] = [];
  if (framing?.link) {
    const label = framing.link.profile?.displayName || framing.link.uri;
    if (label) {
      links.push({ id: framing.link.id ?? 'framing-link', label });
    }
  }
  for (const reference of framing?.profile?.references ?? []) {
    const label = reference.name || reference.uri;
    if (label) {
      links.push({ id: reference.id, label });
    }
  }

  return {
    contributionCount: callout.contributions?.length ?? 0,
    contributions,
    richContent: resolveRichContent(framing),
    links,
    commentCount: callout.comments?.messagesCount ?? 0,
  };
}
