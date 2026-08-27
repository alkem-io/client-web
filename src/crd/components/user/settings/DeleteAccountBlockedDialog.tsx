import type { LucideIcon } from 'lucide-react';
import { Bot, Building2, CircleAlert, LayoutGrid, Package, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import type {
  AccountDeletionBlockerKindOption,
  DeleteAccountBlocker,
  DeleteAccountBlockerTotal,
} from './DeleteAccount.types';

const NS = 'crd-contributorSettings';

const SUPPORT_EMAIL = 'support@alkem.io';

const ICON_BY_KIND: Record<AccountDeletionBlockerKindOption, LucideIcon> = {
  ACCOUNT_SPACE: LayoutGrid,
  ACCOUNT_VIRTUAL_CONTRIBUTOR: Bot,
  ACCOUNT_INNOVATION_PACK: Package,
  ACCOUNT_INNOVATION_HUB: Building2,
  SOLE_ORGANIZATION_OWNER: Users,
};

export type DeleteAccountBlockedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockers: DeleteAccountBlocker[];
  totals: DeleteAccountBlockerTotal[];
  truncated: boolean;
  /** Deep-links to the existing account-resources management page. */
  accountResourcesUrl: string;
};

/**
 * Blocked-deletion dialog (US2, US4, FR-005, FR-007). Itemizes exactly what
 * blocks the account from being deleted, up to the server's 25-item cap, with
 * per-kind totals so a truncated list never reads as complete. Every
 * self-resolvable blocker deep-links to the account-resources page; the
 * support mailto is always offered alongside it — never in its place — and
 * is the ONLY route offered for a sole-owned organization, which the user
 * cannot resolve without either appointing a co-owner elsewhere or asking
 * support to intervene.
 */
export function DeleteAccountBlockedDialog({
  open,
  onOpenChange,
  blockers,
  totals,
  truncated,
  accountResourcesUrl,
}: DeleteAccountBlockedDialogProps) {
  const { t } = useTranslation(NS);

  const totalCount = totals.reduce((sum, entry) => sum + entry.total, 0);
  // Derived from `totals`, which is authoritative and unaffected by the 25-item
  // cap on `blockers`. Reading the capped list instead would hide the
  // "manage my resources" route whenever the visible page happens to be all
  // sole-owned organizations while a self-resolvable blocker sits past the cap.
  const hasSelfResolvableBlocker = totals.some(entry => entry.kind !== 'SOLE_ORGANIZATION_OWNER' && entry.total > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 p-0"
        closeLabel={t('user.security.deleteAccount.blocked.close')}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{t('user.security.deleteAccount.blocked.title')}</DialogTitle>
          <DialogDescription>{t('user.security.deleteAccount.blocked.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          {totals
            .filter(total => total.total > 0)
            .map(total => (
              <p key={total.kind} className="text-caption text-muted-foreground">
                {t(`user.security.deleteAccount.blocked.kinds.${total.kind}`)}: {total.total}
              </p>
            ))}

          {truncated ? (
            <output className="text-caption text-muted-foreground">
              {t('user.security.deleteAccount.blocked.truncatedNotice', {
                count: blockers.length,
                total: totalCount,
              })}
            </output>
          ) : null}

          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
          {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
          <ul role="list" className="flex list-none flex-col gap-2 p-0 m-0">
            {blockers.map(blocker => {
              const Icon = ICON_BY_KIND[blocker.kind] ?? CircleAlert;
              return (
                <li
                  key={`${blocker.kind}-${blocker.resourceID}`}
                  className="flex items-start gap-2 rounded-md border p-3"
                >
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-emphasis">{blocker.displayName}</span>
                    <span className="text-caption text-muted-foreground">
                      {t(`user.security.deleteAccount.blocked.kinds.${blocker.kind}`)}
                    </span>
                    {blocker.kind === 'SOLE_ORGANIZATION_OWNER' ? (
                      <span className="text-caption text-muted-foreground">
                        {t('user.security.deleteAccount.blocked.soleOwner.notice', { name: blocker.displayName })}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          {/* Support is a PARALLEL route, never the sole exit for a self-resolvable
              blocker (FR-007) — it is always rendered alongside, not instead of,
              the account-resources link below. */}
          <Button asChild={true} variant="outline">
            <a href={`mailto:${SUPPORT_EMAIL}`}>{t('user.security.deleteAccount.blocked.supportLink')}</a>
          </Button>
          {hasSelfResolvableBlocker ? (
            <Button asChild={true}>
              <a href={accountResourcesUrl}>{t('user.security.deleteAccount.blocked.resolveLink')}</a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
