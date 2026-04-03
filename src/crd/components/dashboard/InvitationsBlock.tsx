import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

type InvitationCardData = {
  id: string;
  spaceName: string;
  spaceHref: string;
  senderName: string;
  senderAvatarUrl?: string;
  role: string;
};

type InvitationsBlockProps = {
  invitations: InvitationCardData[];
  loading?: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  className?: string;
};

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

export function InvitationsBlock({ invitations, loading, onAccept, onDecline, className }: InvitationsBlockProps) {
  const { t } = useTranslation('crd-dashboard');

  if (loading) {
    return (
      <section className={cn('space-y-3', className)}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </section>
    );
  }

  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold">{t('invitations.title')}</h3>

      {invitations.length === 0 ? (
        <output className="block text-sm text-muted-foreground">{t('invitations.noInvitations')}</output>
      ) : (
        <ul className="space-y-2">
          {invitations.map(invitation => (
            <li key={invitation.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
              <Avatar>
                {invitation.senderAvatarUrl ? <AvatarImage src={invitation.senderAvatarUrl} alt="" /> : null}
                <AvatarFallback>{getInitials(invitation.senderName || invitation.spaceName)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <a href={invitation.spaceHref} className="font-semibold text-sm hover:underline">
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
          ))}
        </ul>
      )}
    </section>
  );
}

export type { InvitationCardData, InvitationsBlockProps };
