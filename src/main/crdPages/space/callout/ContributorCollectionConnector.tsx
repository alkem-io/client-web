import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { type ActorType, ContributorCollectionView } from '@/core/apollo/generated/graphql-schema';
import type { PostBodyFragment } from '@/core/apollo/generated-v2/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { ContributorCollection } from '@/crd/components/callout/ContributorCollection/ContributorCollection';
import { MessageDialog } from '@/crd/components/common/MessageDialog';
import type { ContributorTypeId } from '@/crd/forms/callout/types';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { contributorCollectionFromServer } from '@/main/crdPages/space/callout/contributorCollectionMapper';
import {
  formatJoinedMonth,
  mapActorToContributorCard,
} from '@/main/crdPages/space/dataMappers/contributorCollectionDataMapper';
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

type ContributorsContent = Extract<NonNullable<PostBodyFragment['content']>, { __typename: 'ContributorsContent' }>;
/** The post's contributors settings (post_kind contributors setting). */
type ContributorsSettings = {
  types: string[];
  default_type?: string;
  view?: string;
  map?: { longitude: number; latitude: number; zoom: number };
  selection?: { mode?: string };
};
const toActorType = (type: string) => type.toUpperCase() as ActorType;

type ContributorCollectionConnectorProps = {
  calloutId: string;
  className?: string;
};

export function ContributorCollectionConnector({ calloutId, className }: ContributorCollectionConnectorProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('crd-profilePages');
  // 021 F081-F099: settings, counts and contributors arrive in the post's ContributorsContent; no request. The
  // contributors and counts stay null until the server declares them (FC-C6); role and joined date wait for S09.
  const post = useCachedPost(calloutId);
  const content = post?.contentKind === 'contributors' ? (post.content as ContributorsContent | null) : undefined;
  const settings = (content?.settings ?? null) as ContributorsSettings | null;
  const config = contributorCollectionFromServer(
    settings && {
      contributorTypes: settings.types.map(toActorType),
      defaultContributorType: toActorType(settings.default_type ?? settings.types[0] ?? 'user'),
      defaultView: settings.view === 'map' ? ContributorCollectionView.Map : ContributorCollectionView.List,
      mapView: settings.map,
    }
  );
  const { types, defaultType, defaultView, mapView: fixedView } = config;
  const countOf = (type: string) => content?.counts?.find(entry => entry.type === type)?.count ?? 0;
  const counts = {
    users: countOf('user'),
    organizations: countOf('organization'),
    virtualContributors: countOf('virtual_contributor'),
  };
  const contributorCards = content?.contributors?.map(mapActorToContributorCard);
  const getCards = (type: ContributorTypeId) => contributorCards?.filter(card => card.type === type);
  const loading = !post;
  const isCustomSelection = settings?.selection?.mode === 'custom';

  const [activeType, setActiveType] = useState<ContributorTypeId | null>(null);

  // Opens on the configured default type until the viewer (or the child
  // `ContributorCollection`'s own auto-heal effect, when the default type's
  // count is zero) explicitly picks one — no separate "set activeType to the
  // default type" effect is needed here, and one previously existed and
  // raced the child's heal effect within the same commit (both fire when the
  // config query lands): the child's write could be clobbered by this effect
  // re-applying the stale default, since its closure still saw
  // `activeType === null` from that same render.
  const resolvedType = activeType ?? defaultType;

  // Whatever type is resolved must have been requested at least once, even
  // when it was never reached through a click — e.g. the config's default
  // type changes after mount (an admin edits the callout and the config
  // refetches with a different default) while `activeType` is still null, so
  // `resolvedType` starts pointing at a type nothing has fetched yet. Gated
  // on `!loading` so it never fires on the very first render, before the
  // config query has resolved and `defaultType` is still its unloaded
  // fallback value — the hook's own eager-load effect already owns that
  // first fetch. This effect never writes `activeType`, only calls the
  // already-idempotent `ensureLoaded` (guarded by `requestedRef` in the
  // hook), so it cannot race the child's own auto-heal write the way the
  // removed effect above did.
  const handleActiveTypeChange = (type: ContributorTypeId) => {
    setActiveType(type);
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
        loading={loading}
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
