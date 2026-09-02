import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime } from '@/crd/lib/dateTimeFormat';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

export type MembershipDetailQuestion = { id: string; question: string; answer: string };

export type MembershipDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `application` → questions & answers; `invitation` → welcome message (covers platform invitations too). */
  kind: 'application' | 'invitation';
  loading: boolean;
  /** Contributor display name. Omitted for external (platform) invitations — then `email` is the header. */
  displayName?: string;
  /** Shown as the header when there is no `displayName` (external/platform invitation). */
  email?: string;
  avatarUrl?: string;
  /** Deterministic accent colour shown as the avatar fallback when `avatarUrl` is missing. */
  avatarColor?: string;
  city?: string;
  country?: string;
  createdDate?: Date | string;
  updatedDate?: Date | string;
  /** Application answers — rendered for `kind === 'application'`. */
  questions?: MembershipDetailQuestion[];
  /** Invitation welcome text (markdown) — rendered for `kind === 'invitation'`. */
  welcomeMessage?: string;
  className?: string;
};

export function MembershipDetailDialog({
  open,
  onOpenChange,
  kind,
  loading,
  displayName,
  email,
  avatarUrl,
  avatarColor,
  city,
  country,
  createdDate,
  updatedDate,
  questions,
  welcomeMessage,
  className,
}: MembershipDetailDialogProps) {
  const { t, i18n } = useTranslation('crd-spaceSettings');
  const locale = resolveDateFnsLocale(i18n.language);

  const title = t(
    kind === 'application'
      ? 'community.pendingMemberships.viewApplication'
      : 'community.pendingMemberships.viewInvitation'
  );
  const name = displayName || email || '';
  const location = [city, country].filter(Boolean).join(', ');
  const created = formatAbsoluteDateTime(createdDate, locale);
  const updated = formatAbsoluteDateTime(updatedDate, locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-[640px] flex flex-col max-h-[85vh]', className)}
        closeLabel={t('community.pendingMemberships.viewDialog.close')}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <output className="py-10" aria-label={t('community.pendingMemberships.viewDialog.loading')}>
            <LoadingSpinner />
          </output>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 py-1">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-border">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className={cn('text-caption', avatarColor && 'text-white')} color={avatarColor}>
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-body-emphasis truncate">{name}</p>
                {location && <p className="text-caption text-muted-foreground truncate">{location}</p>}
              </div>
            </div>

            {(created || updated) && (
              <div className="flex flex-col gap-0.5">
                {created && (
                  <p className="text-caption text-muted-foreground">
                    {t('community.pendingMemberships.viewDialog.created', { date: created })}
                  </p>
                )}
                {updated && (
                  <p className="text-caption text-muted-foreground">
                    {t('community.pendingMemberships.viewDialog.updated', { date: updated })}
                  </p>
                )}
              </div>
            )}

            {kind === 'application' ? (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                {questions && questions.length > 0 ? (
                  questions.map(q => (
                    <div key={q.id} className="flex flex-col gap-1">
                      <p className="text-body-emphasis">{q.question}</p>
                      {q.answer.trim() ? (
                        <MarkdownContent content={q.answer} />
                      ) : (
                        <p className="text-caption text-muted-foreground">—</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-body text-muted-foreground">
                    {t('community.pendingMemberships.viewDialog.noAnswers')}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-body-emphasis">{t('community.pendingMemberships.viewDialog.welcomeMessage')}</p>
                {welcomeMessage?.trim() ? (
                  <MarkdownContent content={welcomeMessage} />
                ) : (
                  <p className="text-body text-muted-foreground">
                    {t('community.pendingMemberships.viewDialog.noWelcomeMessage')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
