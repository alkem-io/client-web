import type {
  CalloutDeletionSummaryModel,
  CalloutRichContentKind,
  DeletionLinkItem,
} from '@/crd/components/dialogs/calloutDeletionSummary.types';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';

const resolveRichContent = (framing: CalloutDetailsModelExtended['framing']): CalloutRichContentKind | undefined => {
  if (framing?.whiteboard) return 'whiteboard';
  if (framing?.memo) return 'memo';
  if (framing?.poll) return 'poll';
  if (framing?.mediaGallery) return 'mediaGallery';
  if (framing?.collaboraDocument) return 'document';
  return undefined;
};

/**
 * Pure, cache-only mapping from the cached callout model to the plain-TS
 * deletion summary rendered by `DeleteCalloutDialog` (feature 114, Option A).
 * Reads only fields the `CalloutDetails` fragment already selects — opening
 * the delete dialog must never trigger a fetch. A framing link body is
 * surfaced via `links` (it is nameable), not via `richContent`.
 */
export function mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummaryModel {
  const framing = callout.framing;
  const links: DeletionLinkItem[] = [];

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
    richContent: resolveRichContent(framing),
    links,
    commentCount: callout.comments?.messagesCount ?? 0,
  };
}
