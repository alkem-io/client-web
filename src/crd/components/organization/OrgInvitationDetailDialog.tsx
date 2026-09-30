import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

export type OrgInvitationDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  organizationAvatarUrl?: string;
  organizationColor: string;
  /** "Associate" / "Associate + Admin" / "Associate + Owner", already localized. */
  offeredRoleLabel: string;
  /** "Invited by {{name}}", already localized; omitted when the inviter is unknown. */
  invitedByLabel?: string;
  message?: string;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
  declining: boolean;
  /** Set after a successful accept when an offered extra role could not be granted (FR-003). */
  withheldNotice?: string;
};

export function OrgInvitationDetailDialog({
  open,
  onOpenChange,
  organizationName,
  organizationAvatarUrl,
  organizationColor,
  offeredRoleLabel,
  invitedByLabel,
  message,
  onAccept,
  onDecline,
  accepting,
  declining,
  withheldNotice,
}: OrgInvitationDetailDialogProps) {
  const { t } = useTranslation('crd-profilePages');
  const busy = accepting || declining;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[85vh]">
        <DialogTitle>{t('orgProfile.invitationDialog.title', { organizationName })}</DialogTitle>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              {organizationAvatarUrl && <AvatarImage src={organizationAvatarUrl} alt="" />}
              <AvatarFallback color={organizationColor} className="text-white">
                {organizationName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-body-emphasis truncate">{organizationName}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-caption text-muted-foreground">{t('orgProfile.invitationDialog.role')}</p>
            <p className="text-body-emphasis">{offeredRoleLabel}</p>
          </div>

          {invitedByLabel && <p className="text-caption text-muted-foreground">{invitedByLabel}</p>}

          {message && <DialogDescription className="text-body">{message}</DialogDescription>}

          {withheldNotice && <output className="block text-caption text-warning">{withheldNotice}</output>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDecline} disabled={busy} aria-busy={declining}>
            {t('orgProfile.invitationDialog.decline')}
          </Button>
          <Button type="button" variant="default" onClick={onAccept} disabled={busy} aria-busy={accepting}>
            {t('orgProfile.invitationDialog.accept')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
