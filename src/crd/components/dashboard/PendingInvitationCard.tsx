import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Skeleton } from '@/crd/primitives/skeleton';

type PendingInvitationCardData = {
  id: string;
  spaceName: string;
  spaceAvatarUrl?: string;
  senderName: string;
  welcomeMessageExcerpt?: string;
  timeElapsed: string;
  /** Deterministic accent colour, shown as the avatar fallback when
   * `spaceAvatarUrl` is missing. */
  color?: string;
};

type PendingInvitationCardProps = {
  invitation: PendingInvitationCardData;
  onClick?: () => void;
  className?: string;
};

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

function PendingInvitationCard({ invitation, onClick, className }: PendingInvitationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full min-h-11 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer',
        'flex items-center gap-3',
        className
      )}
    >
      <Avatar className="size-10 shrink-0 rounded-lg">
        {invitation.spaceAvatarUrl ? (
          <AvatarImage src={invitation.spaceAvatarUrl} alt={invitation.spaceName} className="rounded-lg object-cover" />
        ) : null}
        <AvatarFallback
          className={cn('rounded-lg text-xs', invitation.color && 'text-white')}
          style={invitation.color ? { backgroundColor: invitation.color } : undefined}
        >
          {getInitials(invitation.spaceName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">{invitation.spaceName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{invitation.senderName}</p>
        {invitation.welcomeMessageExcerpt && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{invitation.welcomeMessageExcerpt}</p>
        )}
      </div>

      <span className="text-xs text-muted-foreground shrink-0">{invitation.timeElapsed}</span>
    </button>
  );
}

function PendingInvitationCardSkeleton() {
  const { t } = useTranslation('crd-dashboard');
  return (
    <output
      aria-label={t('pendingMemberships.loadingInvitation')}
      className="block rounded-lg border border-border bg-card p-4 flex items-center gap-3"
    >
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-3 w-16 shrink-0" />
    </output>
  );
}

export { PendingInvitationCard, PendingInvitationCardSkeleton };
export type { PendingInvitationCardData, PendingInvitationCardProps };
