import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { useSpaceCardQuery } from '@/core/apollo/generated/apollo-hooks';
import { UrlType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { CrdRedirectDialog } from '@/crd/components/error/CrdRedirectDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Skeleton } from '@/crd/primitives/skeleton';

const REDIRECT_COUNTDOWN_SECONDS = 10;

type AncestorSpaceCardSlotProps = {
  spaceId: string;
};

/**
 * Inline space card rendered inside the CRD redirect dialog. Kept in the
 * integration layer so we don't pull `useSpaceCardQuery` into `src/crd/`.
 */
function AncestorSpaceCardSlot({ spaceId }: AncestorSpaceCardSlotProps) {
  const { data, loading } = useSpaceCardQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  if (loading || !data?.lookup.space) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-card p-3">
        <Skeleton className="size-12 rounded-md" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  const space = data.lookup.space;
  const profile = space.about.profile;
  const avatarUrl = profile.avatar?.uri;
  const cardBannerUrl = profile.cardBanner?.uri;
  const displayName = profile.displayName;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <a
      href={profile.url}
      className="flex items-center gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {cardBannerUrl ? (
        <img alt="" src={cardBannerUrl} className="size-12 rounded-md object-cover" />
      ) : (
        <Avatar className="size-12 rounded-md">
          <AvatarImage src={avatarUrl} alt="" />
          <AvatarFallback className="rounded-md">{initial}</AvatarFallback>
        </Avatar>
      )}
      <span className="text-body-emphasis text-foreground">{displayName}</span>
    </a>
  );
}

type CrdRedirectToAncestorDialogProps = {
  closestAncestor: ClosestAncestor;
};

export function CrdRedirectToAncestorDialog({ closestAncestor }: CrdRedirectToAncestorDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [closed, setClosed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_COUNTDOWN_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  // Reset internal state when the closest ancestor changes (matches the MUI
  // implementation's reopen-on-change behavior).
  useEffect(() => {
    setClosed(false);
    setSecondsLeft(REDIRECT_COUNTDOWN_SECONDS);
    setCancelled(false);
  }, [closestAncestor.url]);

  useEffect(() => {
    if (closed || cancelled) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(closestAncestor.url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [closed, cancelled, closestAncestor.url, navigate]);

  const handleGoNow = () => {
    navigate(closestAncestor.url);
  };

  const handleCancelCountdown = () => {
    setCancelled(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setClosed(true);
    }
  };

  const ancestorSlot =
    closestAncestor.type === UrlType.Space && closestAncestor.space?.id ? (
      <AncestorSpaceCardSlot spaceId={closestAncestor.space.id} />
    ) : undefined;

  return (
    <CrdRedirectDialog
      open={!closed}
      onOpenChange={handleOpenChange}
      title={t('components.urlResolver.redirectDialog.title')}
      message={
        <Trans
          i18nKey="components.urlResolver.redirectDialog.message"
          components={{
            br: <br />,
          }}
        />
      }
      countdownLabel={t('components.urlResolver.redirectDialog.countdown', { seconds: secondsLeft })}
      cancelCountdownLabel={t('components.urlResolver.redirectDialog.cancelCountdown')}
      goNowLabel={t('components.urlResolver.redirectDialog.goNow')}
      cancelled={cancelled}
      onCancelCountdown={handleCancelCountdown}
      onGoNow={handleGoNow}
      ancestorSlot={ancestorSlot}
    />
  );
}
