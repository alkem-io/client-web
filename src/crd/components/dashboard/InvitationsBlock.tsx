import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

type InvitationCardData = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceHref: string;
  spaceAvatarUrl?: string;
  role: string;
  /** Deterministic accent colour, shown as the avatar fallback when
   * `spaceAvatarUrl` is missing. */
  color?: string;
};

type InvitationsBlockProps = {
  invitations: InvitationCardData[];
  loading?: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  className?: string;
};

export function InvitationsBlock({ invitations, loading, onAccept, onDecline, className }: InvitationsBlockProps) {
  const { t } = useTranslation('crd-dashboard');

  if (loading) {
    return (
      <output aria-label={t('invitations.loading')} className={cn('space-y-3 block', className)}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </output>
    );
  }

  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="text-subsection-title">{t('invitations.title')}</h3>

      {invitations.length === 0 ? (
        <output className="block text-body text-muted-foreground">{t('invitations.noInvitations')}</output>
      ) : (
        <ul className="space-y-2">
          {invitations.map(invitation => {
            return (
              <li key={invitation.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                <Avatar className="size-10 rounded-lg">
                  {invitation.spaceAvatarUrl ? (
                    <AvatarImage src={invitation.spaceAvatarUrl} alt={invitation.spaceName} />
                  ) : null}
                  <AvatarFallback
                    className={cn('rounded-lg text-caption', invitation.color && 'text-white')}
                    color={invitation.color}
                  >
                    {getInitials(invitation.spaceName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <a
                    href={invitation.spaceHref}
                    className="text-card-title hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                  >
                    {invitation.spaceName}
                  </a>
                  {invitation.role && (
                    <Badge variant="secondary" className="ml-2">
                      {invitation.role}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onAccept(invitation.id)}
                    aria-label={`${t('invitations.accept')} ${invitation.spaceName}`}
                  >
                    {t('invitations.accept')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecline(invitation.id)}
                    aria-label={`${t('invitations.decline')} ${invitation.spaceName}`}
                  >
                    {t('invitations.decline')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export type { InvitationCardData, InvitationsBlockProps };
