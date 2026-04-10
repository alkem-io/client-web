import { ArrowLeft, Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type InvitationDetailData = {
  spaceName: string;
  spaceAvatarUrl?: string;
  spaceTagline?: string;
  spaceTags: string[];
  spaceHref: string;
  senderName: string;
  timeElapsed: string;
  /** Deterministic accent colour, shown as the avatar fallback when
   * `spaceAvatarUrl` is missing. */
  color?: string;
};

type InvitationDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  invitation?: InvitationDetailData;
  title: string;
  acceptLabel: string;
  rejectLabel: string;
  descriptionSlot?: ReactNode;
  welcomeMessageSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  onAccept: () => void;
  accepting: boolean;
  onReject: () => void;
  rejecting: boolean;
  updating: boolean;
  className?: string;
};

function InvitationDetailDialog({
  open,
  onClose,
  onBack,
  invitation,
  title,
  acceptLabel,
  rejectLabel,
  descriptionSlot,
  welcomeMessageSlot,
  guidelinesSlot,
  onAccept,
  accepting,
  onReject,
  rejecting,
  updating,
  className,
}: InvitationDetailDialogProps) {
  const { t } = useTranslation('crd-dashboard');

  if (!invitation) {
    return null;
  }

  const acceptAriaLabel = t('pendingMemberships.detail.acceptAriaLabel', { spaceName: invitation.spaceName });
  const rejectAriaLabel = t('pendingMemberships.detail.rejectAriaLabel', { spaceName: invitation.spaceName });

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        className={cn('sm:max-w-[700px] flex flex-col max-h-[85vh]', className)}
        closeLabel={t('pendingMemberships.closeDialog')}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 rounded-sm p-1 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
              aria-label={t('pendingMemberships.detail.back')}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <DialogTitle className="truncate">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Space card */}
            <a
              href={invitation.spaceHref}
              className="shrink-0 sm:w-[200px] rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none flex flex-col items-center text-center gap-2"
            >
              <Avatar className="size-16 rounded-lg">
                {invitation.spaceAvatarUrl ? (
                  <AvatarImage
                    src={invitation.spaceAvatarUrl}
                    alt={invitation.spaceName}
                    className="rounded-lg object-cover"
                  />
                ) : null}
                <AvatarFallback
                  className={cn('rounded-lg text-lg', invitation.color && 'text-white')}
                  style={invitation.color ? { backgroundColor: invitation.color } : undefined}
                >
                  {getInitials(invitation.spaceName)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold leading-tight">{invitation.spaceName}</p>
              {invitation.spaceTagline && (
                <p className="text-xs text-muted-foreground line-clamp-2">{invitation.spaceTagline}</p>
              )}
              {invitation.spaceTags.length > 0 && (
                <ul className="flex flex-wrap justify-center gap-1 mt-1">
                  {invitation.spaceTags.slice(0, 5).map(tag => (
                    <li key={tag}>
                      <Badge variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </a>

            {/* Content area */}
            <div className="flex-1 min-w-0 space-y-3">
              {descriptionSlot && <div className="text-sm">{descriptionSlot}</div>}
              {welcomeMessageSlot && <div className="text-sm">{welcomeMessageSlot}</div>}
              {guidelinesSlot && <div className="text-sm">{guidelinesSlot}</div>}
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border pt-4 flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onReject}
            disabled={updating}
            aria-busy={rejecting}
            aria-label={rejectAriaLabel}
          >
            <X className="size-4 mr-1" aria-hidden="true" />
            {rejectLabel}
          </Button>
          <Button onClick={onAccept} disabled={updating} aria-busy={accepting} aria-label={acceptAriaLabel}>
            <Check className="size-4 mr-1" aria-hidden="true" />
            {acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { InvitationDetailDialog };
export type { InvitationDetailData, InvitationDetailDialogProps };
