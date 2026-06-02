import { ArrowLeft, Bot, Loader2, Plus, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Textarea } from '@/crd/primitives/textarea';

export type VcInviteItem = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Optional secondary line (e.g. the VC's engine/host). */
  subtitle?: string;
};

export type VirtualContributorInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Virtual Contributors on the space's account — added directly, no message. */
  accountVcs: VcInviteItem[];
  /** Virtual Contributors from the shared library — invited with a welcome message. */
  libraryVcs: VcInviteItem[];
  onAddAccountVc: (id: string) => void;
  onInviteLibraryVc: (id: string, welcomeMessage: string) => void;
  loading?: boolean;
  /** Id of the VC currently being added/invited — its row shows a spinner. */
  busyId?: string | null;
  /** Pre-fills the welcome-message step for library invites. */
  defaultWelcomeMessage?: string;
  className?: string;
};

/**
 * Combined Virtual Contributor invite dialog — mirrors the MUI `InviteVCsDialog`:
 * one entry point listing both account VCs (added directly) and library VCs
 * (invited with a welcome message via a second step). Pure presentational
 * component — all data + actions arrive via props.
 */
export function VirtualContributorInviteDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  accountVcs,
  libraryVcs,
  onAddAccountVc,
  onInviteLibraryVc,
  loading,
  busyId,
  defaultWelcomeMessage = '',
  className,
}: VirtualContributorInviteDialogProps) {
  const { t } = useTranslation('crd-community');
  const [messageVc, setMessageVc] = useState<VcInviteItem | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Reset the sub-view + message whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setMessageVc(null);
      setWelcomeMessage('');
    }
  }, [open]);

  const openMessageStep = (vc: VcInviteItem) => {
    setMessageVc(vc);
    setWelcomeMessage(defaultWelcomeMessage);
  };

  const messageEmpty = welcomeMessage.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto [&>*]:min-w-0', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {messageVc && (
              <button
                type="button"
                onClick={() => setMessageVc(null)}
                aria-label={t('inviteVc.back')}
                className="rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
            )}
            <Bot aria-hidden="true" className="size-4" />
            {t('inviteVc.title')}
          </DialogTitle>
          {!messageVc && <DialogDescription>{t('inviteVc.description')}</DialogDescription>}
        </DialogHeader>

        {messageVc ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3">
              <VcAvatar vc={messageVc} />
              <span className="text-body-emphasis">{messageVc.displayName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-body-emphasis">{t('inviteVc.welcomeMessageLabel')}</span>
              <Textarea
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                placeholder={t('inviteVc.welcomeMessagePlaceholder')}
                aria-label={t('inviteVc.welcomeMessageLabel')}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setMessageVc(null)}>
                {t('inviteVc.back')}
              </Button>
              <Button
                type="button"
                onClick={() => onInviteLibraryVc(messageVc.id, welcomeMessage.trim())}
                disabled={messageEmpty || busyId === messageVc.id}
                aria-busy={busyId === messageVc.id}
              >
                {busyId === messageVc.id ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <>
                    <Send aria-hidden="true" className="mr-1.5 size-4" />
                    {t('inviteVc.sendInvite')}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('inviteVc.searchPlaceholder')}
                aria-label={t('inviteVc.searchPlaceholder')}
                className="h-9 pl-9 text-control"
              />
            </div>

            {loading ? (
              <output className="block py-6 text-center text-muted-foreground" aria-label={t('inviteVc.loading')}>
                <Loader2 aria-hidden="true" className="inline size-4 animate-spin" />
              </output>
            ) : (
              <>
                <VcSection
                  title={t('inviteVc.onAccount')}
                  emptyLabel={t('inviteVc.onAccountEmpty')}
                  vcs={accountVcs}
                  actionLabel={t('inviteVc.add')}
                  actionIcon="add"
                  busyId={busyId}
                  onAction={onAddAccountVc}
                  addAriaLabel={name => t('inviteVc.addAriaLabel', { name })}
                />
                <VcSection
                  title={t('inviteVc.inLibrary')}
                  emptyLabel={t('inviteVc.inLibraryEmpty')}
                  vcs={libraryVcs}
                  actionLabel={t('inviteVc.invite')}
                  actionIcon="invite"
                  busyId={busyId}
                  onAction={id => {
                    const vc = libraryVcs.find(v => v.id === id);
                    if (vc) openMessageStep(vc);
                  }}
                  addAriaLabel={name => t('inviteVc.inviteAriaLabel', { name })}
                />
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function VcAvatar({ vc }: { vc: VcInviteItem }) {
  return (
    <Avatar className="size-8 shrink-0">
      {vc.avatarUrl ? <AvatarImage src={vc.avatarUrl} alt="" /> : null}
      <AvatarFallback
        style={{ background: 'color-mix(in srgb, var(--info) 15%, transparent)', color: 'var(--info)' }}
        className="text-badge"
      >
        {vc.displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function VcSection({
  title,
  emptyLabel,
  vcs,
  actionLabel,
  actionIcon,
  busyId,
  onAction,
  addAriaLabel,
}: {
  title: string;
  emptyLabel: string;
  vcs: VcInviteItem[];
  actionLabel: string;
  actionIcon: 'add' | 'invite';
  busyId?: string | null;
  onAction: (id: string) => void;
  addAriaLabel: (name: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uppercase text-label text-muted-foreground">{title}</span>
      {vcs.length === 0 ? (
        <p className="text-caption text-muted-foreground px-1 py-2">{emptyLabel}</p>
      ) : (
        <ul className="rounded-lg border bg-card divide-y divide-border">
          {vcs.map(vc => {
            const busy = busyId === vc.id;
            return (
              <li key={vc.id} className="flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <VcAvatar vc={vc} />
                  <div className="min-w-0">
                    <span className="block text-body-emphasis truncate">{vc.displayName}</span>
                    {vc.subtitle && (
                      <span className="block text-caption text-muted-foreground truncate">{vc.subtitle}</span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(vc.id)}
                  disabled={busy}
                  aria-busy={busy}
                  aria-label={addAriaLabel(vc.displayName)}
                  className="shrink-0"
                >
                  {busy ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <>
                      {actionIcon === 'add' ? (
                        <Plus aria-hidden="true" className="mr-1.5 size-4" />
                      ) : (
                        <Send aria-hidden="true" className="mr-1.5 size-4" />
                      )}
                      {actionLabel}
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
