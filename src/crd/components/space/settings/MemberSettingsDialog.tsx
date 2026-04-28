import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { MemberSettingsSubject } from '@/crd/components/space/settings/memberSettingsTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';

export type MemberSettingsLeadGate = {
  canAddLead: boolean;
  canRemoveLead: boolean;
};

export type MemberSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: MemberSettingsSubject;
  leadGate: MemberSettingsLeadGate;
  onLeadChange: (id: string, isLead: boolean) => Promise<unknown>;
  /** Provided only for individual users that the viewer can re-authorize. */
  onAdminChange?: (id: string, isAdmin: boolean) => Promise<unknown>;
  /** Provided when the viewer can remove this member AND it is not the viewer themselves. */
  onRemoveMember?: (id: string) => void;
};

const initials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
};

export function MemberSettingsDialog({
  open,
  onOpenChange,
  subject,
  leadGate,
  onLeadChange,
  onAdminChange,
  onRemoveMember,
}: MemberSettingsDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const leadCheckboxId = useId();
  const adminCheckboxId = useId();
  const maxLeadsHelpId = useId();

  const initialIsAdmin = subject.type === 'user' ? subject.isAdmin : false;
  const [isLead, setIsLead] = useState(subject.isLead);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [saveInFlight, setSaveInFlight] = useState(false);

  // Re-seed local state every time the dialog opens for a different subject so
  // the checkboxes always reflect the row currently being edited.
  useEffect(() => {
    if (!open) return;
    setIsLead(subject.isLead);
    setIsAdmin(initialIsAdmin);
    setSaveInFlight(false);
  }, [open, subject.id, subject.isLead, initialIsAdmin]);

  const showAuthorizationSection = subject.type === 'user' && !!onAdminChange;
  const showRemoveSection = !!onRemoveMember;

  const leadDisabled =
    saveInFlight || (!leadGate.canAddLead && !subject.isLead) || (!leadGate.canRemoveLead && subject.isLead);

  const handleSave = async () => {
    const leadDiff = isLead !== subject.isLead;
    const adminDiff = subject.type === 'user' && !!onAdminChange && isAdmin !== subject.isAdmin;
    if (!leadDiff && !adminDiff) {
      onOpenChange(false);
      return;
    }
    setSaveInFlight(true);
    try {
      if (leadDiff) {
        await onLeadChange(subject.id, isLead);
      }
      if (adminDiff && onAdminChange) {
        await onAdminChange(subject.id, isAdmin);
      }
      onOpenChange(false);
    } catch {
      // Toasts are surfaced by the mutation hooks themselves; keep the dialog open
      // so the user can retry. Reset the in-flight flag.
      setSaveInFlight(false);
    }
  };

  const locationParts = [subject.city, subject.country].filter(Boolean);

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        // Block close requests while a mutation is in flight to avoid losing the
        // user's pending change before the request resolves.
        if (!nextOpen && saveInFlight) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        closeLabel={t('community.memberSettings.close')}
      >
        <DialogHeader>
          <DialogTitle>{t('community.memberSettings.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('community.memberSettings.title')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Member identification chip */}
          <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
            <Avatar className="size-10">
              {subject.avatarUrl ? <AvatarImage src={subject.avatarUrl} alt="" /> : null}
              <AvatarFallback>{initials(subject.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-card-title text-foreground truncate">{subject.displayName}</span>
              {locationParts.length > 0 && (
                <span className="text-caption text-muted-foreground truncate">{locationParts.join(', ')}</span>
              )}
            </div>
          </div>

          {/* Role section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-label uppercase text-muted-foreground">{t('community.memberSettings.section.role')}</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id={leadCheckboxId}
                checked={isLead}
                disabled={leadDisabled}
                aria-describedby={maxLeadsHelpId}
                onCheckedChange={value => setIsLead(value === true)}
                className="mt-1"
              />
              {/* `block` overrides Label's default `flex items-center gap-2`, which would otherwise insert
                  flex gaps around the inline <strong> produced by <Trans>. */}
              <Label htmlFor={leadCheckboxId} className="block text-body font-normal leading-snug cursor-pointer">
                <Trans
                  t={t}
                  i18nKey="community.memberSettings.lead"
                  components={{ b: <strong className="font-semibold" /> }}
                />
              </Label>
            </div>
            <p id={maxLeadsHelpId} className="text-caption text-muted-foreground">
              <Trans
                t={t}
                i18nKey="community.memberSettings.maxLeadsWarning"
                components={{ b: <strong className="font-semibold" /> }}
              />
            </p>
          </div>

          {/* Authorization section (users only) */}
          {showAuthorizationSection && (
            <div className="flex flex-col gap-2">
              <h3 className="text-label uppercase text-muted-foreground">
                {t('community.memberSettings.section.authorization')}
              </h3>
              <div className="flex items-start gap-3">
                <Checkbox
                  id={adminCheckboxId}
                  checked={isAdmin}
                  disabled={saveInFlight}
                  onCheckedChange={value => setIsAdmin(value === true)}
                  className="mt-1"
                />
                <Label htmlFor={adminCheckboxId} className="block text-body font-normal leading-snug cursor-pointer">
                  <Trans
                    t={t}
                    i18nKey="community.memberSettings.admin"
                    components={{ b: <strong className="font-semibold" /> }}
                  />
                </Label>
              </div>
            </div>
          )}

          {/* Remove member section */}
          {showRemoveSection && (
            <div className="flex flex-col gap-2">
              <h3 className="text-label uppercase text-muted-foreground">
                {t('community.memberSettings.section.removeMember')}
              </h3>
              <button
                type="button"
                disabled={saveInFlight}
                onClick={() => onRemoveMember?.(subject.id)}
                className="flex items-center gap-2 self-start text-body text-destructive hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 aria-hidden="true" className="size-4 shrink-0" />
                <span className="text-left">{t('community.memberSettings.remove.link')}</span>
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saveInFlight}>
            {t('community.memberSettings.footer.cancel')}
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saveInFlight} aria-busy={saveInFlight}>
            {saveInFlight && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {t('community.memberSettings.footer.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
