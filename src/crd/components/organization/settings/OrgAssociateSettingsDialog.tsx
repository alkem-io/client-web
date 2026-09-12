import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type OrgAssociateSettingsSubject = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  color: string;
  isAssociate: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

export type OrgAssociateSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: OrgAssociateSettingsSubject | null;
  saving: boolean;
  /** True when the row being edited is the signed-in administrator themselves. */
  isSelf?: boolean;
  /** Readable copy for a role-limit refusal (limitAdmin / limitOwner / minOwner), cleared by the caller. */
  errorMessage?: string;
  onSave: (next: { isAssociate: boolean; isAdmin: boolean; isOwner: boolean }) => void;
  onRemove: () => void;
};

const NS = 'crd-contributorSettings';

/**
 * The Associates tab's role editor — three independent toggles (unlike the two-toggle
 * Space member dialog, which cannot represent an admin/owner who is not an associate,
 * D14) plus a confirmed destructive Remove. The Associate toggle is disabled while
 * Admin or Owner is on (both roles declare `requiresEntryRole`), with an explanatory
 * caption rather than a silent no-op.
 */
export function OrgAssociateSettingsDialog({
  open,
  onOpenChange,
  subject,
  saving,
  isSelf = false,
  errorMessage,
  onSave,
  onRemove,
}: OrgAssociateSettingsDialogProps) {
  const { t } = useTranslation(NS);
  const [isAssociate, setIsAssociate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (open && subject) {
      setIsAssociate(subject.isAssociate);
      setIsAdmin(subject.isAdmin);
      setIsOwner(subject.isOwner);
    }
  }, [open, subject]);

  if (!subject) return null;

  const associateLocked = isAdmin || isOwner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{t('org.associates.editor.title', { name: subject.displayName })}</DialogTitle>
        {/* Radix requires an accessible description on every DialogContent; the
              visible body is a bare list of toggles, so the description is
              screen-reader only rather than repeated on screen. */}
        <DialogDescription className="sr-only">
          {t('org.associates.editor.description', { name: subject.displayName })}
        </DialogDescription>

        <div className="flex items-center gap-3 py-2">
          <Avatar className="size-10 border border-border">
            {subject.avatarUrl && <AvatarImage src={subject.avatarUrl} alt="" />}
            <AvatarFallback color={subject.color} className="text-white">
              {subject.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-body-emphasis truncate">{subject.displayName}</p>
        </div>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="org-associate-toggle-associate">{t('org.associates.editor.associateLabel')}</Label>
              <Switch
                id="org-associate-toggle-associate"
                checked={isAssociate}
                disabled={associateLocked || saving}
                onCheckedChange={setIsAssociate}
              />
            </div>
            {associateLocked && (
              <p className="text-caption text-muted-foreground">{t('org.associates.editor.associateCaption')}</p>
            )}
          </div>

          {/* An administrator may not switch off their OWN Admin role here (R43 /
                FR-019a): one accidental click would otherwise lock them out of the
                surface they are standing on. Deliberate self-demotion is still
                possible through the API — this is an interface guard, not a rule. */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="org-associate-toggle-admin">{t('org.associates.editor.adminLabel')}</Label>
            <Switch
              id="org-associate-toggle-admin"
              checked={isAdmin}
              disabled={saving || (isSelf && isAdmin)}
              onCheckedChange={next => {
                if (isSelf && isAdmin && !next) return;
                setIsAdmin(next);
                if (next) setIsAssociate(true);
              }}
            />
          </div>
          {isSelf && isAdmin && (
            <p className="text-caption text-muted-foreground -mt-2">{t('org.associates.editor.selfAdminLocked')}</p>
          )}

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="org-associate-toggle-owner">{t('org.associates.editor.ownerLabel')}</Label>
            <Switch
              id="org-associate-toggle-owner"
              checked={isOwner}
              disabled={saving}
              onCheckedChange={next => {
                setIsOwner(next);
                if (next) setIsAssociate(true);
              }}
            />
          </div>

          {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          <Button type="button" variant="destructive" onClick={onRemove} disabled={saving || (isSelf && isAdmin)}>
            {t('org.associates.editor.remove')}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('org.associates.editor.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => onSave({ isAssociate, isAdmin, isOwner })}
              disabled={saving}
              aria-busy={saving}
            >
              {t('org.associates.editor.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
