import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useNavigate from '@/core/routing/useNavigate';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { ContributorCollection } from '@/crd/components/callout/ContributorCollection/ContributorCollection';
import { MessageDialog } from '@/crd/components/common/MessageDialog';
import type { ContributorTypeId } from '@/crd/forms/callout/types';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { formatJoinedMonth } from '@/main/crdPages/space/dataMappers/contributorCollectionDataMapper';
import { useCrdSpaceContributors } from '@/main/crdPages/space/hooks/useCrdSpaceContributors';
import { useCrdSpaceLocale } from '@/main/crdPages/space/hooks/useCrdSpaceLocale';
import { useSendMessageToOrganizationHandler } from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';
import { useStartDirectChat } from '@/main/crdPages/unifiedChat/useStartDirectChat';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

/**
 * Integration layer for a contributor-collection callout (feature 008). Owns the
 * active-type state, drives the lazy per-type fetch via `useCrdSpaceContributors`
 * (default type eager, others on first switch), wires navigation, and — for the
 * "…" menu's Message action — the 1:1 chat start and the organisation compose
 * dialog. The CRD `ContributorCollection` stays purely presentational.
 */

// The server's refusal code when the recipient has messaging disabled — the
// card item carries no per-user "is contactable" value (the five-value rule),
// so this is handled on click rather than by hiding the action ahead of time.
const CODE_MESSAGING_NOT_ENABLED = 'MESSAGING_NOT_ENABLED';

type ContributorCollectionConnectorProps = {
  calloutId: string;
  className?: string;
};

export function ContributorCollectionConnector({ calloutId, className }: ContributorCollectionConnectorProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('crd-profilePages');
  const {
    types,
    defaultType,
    defaultView,
    fixedView,
    counts,
    getCards,
    ensureLoaded,
    isLoading,
    loading,
    isCustomSelection,
  } = useCrdSpaceContributors(calloutId);

  const [activeType, setActiveType] = useState<ContributorTypeId | null>(null);

  // Opens on the configured default type until the viewer (or the child
  // `ContributorCollection`'s own auto-heal effect, when the default type's
  // count is zero) explicitly picks one — no separate "open on default type"
  // effect is needed here, and one previously existed and raced the child's
  // heal effect within the same commit (both fire when the config query
  // lands): the child's write could be clobbered by this effect re-applying
  // the stale default, since its closure still saw `activeType === null` from
  // that same render.
  const resolvedType = activeType ?? defaultType;

  const handleActiveTypeChange = (type: ContributorTypeId) => {
    setActiveType(type);
    ensureLoaded(type); // lazy-fetch this type's full set once (FR-008)
  };

  // Render-time decoration only — never stored in state, so a live language
  // switch re-labels every already-loaded card without a new fetch.
  const locale = useCrdSpaceLocale();
  const { isEnabled: signedIn } = useUserMessagingContext();
  const { userModel } = useCurrentUserContext();
  const { startDirectChat } = useStartDirectChat(undefined);
  const [orgMessageTarget, setOrgMessageTarget] = useState<{ id: string; name: string } | null>(null);
  const { onSendMessage } = useSendMessageToOrganizationHandler({ recipientOrganizationId: orgMessageTarget?.id });

  const cards = getCards(resolvedType)?.map(({ joinedDate, ...card }) => ({
    ...card,
    joinedMonthLabel: joinedDate ? formatJoinedMonth(joinedDate, locale) : undefined,
    // Never for a VC, never for one's own card, never for a signed-out viewer.
    canMessage: signedIn && card.type !== 'virtualContributor' && card.id !== userModel?.id,
  }));

  const handleMessage = async (contributor: ContributorCardData) => {
    if (contributor.type === 'organization') {
      // No standalone "message this organisation" dialog exists to bind a
      // trigger to (MessagePopover is trigger-bound) — the controlled
      // MessageDialog fills that gap, fed by the existing send handler.
      setOrgMessageTarget({ id: contributor.id, name: contributor.name });
      return;
    }
    try {
      await startDirectChat(contributor.id);
    } catch (err) {
      const graphQLError = err instanceof ApolloError ? err.graphQLErrors[0] : undefined;
      const code = graphQLError?.extensions?.code as string | undefined;
      toast.error(
        code === CODE_MESSAGING_NOT_ENABLED
          ? t('common.messagePopover.cannotBeReached')
          : t('common.messagePopover.openChatError')
      );
    }
  };

  return (
    <>
      <ContributorCollection
        className={className}
        types={types}
        activeType={resolvedType}
        onActiveTypeChange={handleActiveTypeChange}
        defaultView={defaultView}
        fixedView={fixedView}
        counts={counts}
        cards={cards}
        loading={loading || isLoading(resolvedType)}
        isCustomSelection={isCustomSelection}
        onContributorClick={href => navigate(href)}
        onMessage={handleMessage}
      />
      <MessageDialog
        open={Boolean(orgMessageTarget)}
        onOpenChange={open => {
          if (!open) setOrgMessageTarget(null);
        }}
        onSendMessage={onSendMessage}
        title={t('orgProfile.hero.messageEmailTitle')}
        notice={t('orgProfile.hero.messageEmailNotice')}
        placeholder={t('orgProfile.hero.messageEmailPlaceholder')}
      />
    </>
  );
}
