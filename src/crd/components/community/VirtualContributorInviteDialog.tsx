import { ArrowLeft, Bot, Loader2, Plus, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VirtualContributorPreview } from '@/crd/components/virtualContributor/community/VirtualContributorPreview';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
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
  /** When true, only the library section is shown (used by the settings
   * "Invite External Virtual Contributor" entry — account VCs are added via a
   * separate button there). */
  libraryOnly?: boolean;
  /** Detail data for the currently-previewed VC (set after `onPreview`). */
  previewData?: VcPreviewData;
  /** True while the preview detail is being fetched. */
  previewLoading?: boolean;
  /** Called when the user opens a VC's detail preview from the list. */
  onPreview?: (id: string) => void;
  /** Called when the user leaves the preview back to the list. */
  onClosePreview?: () => void;
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
  libraryOnly = false,
  previewData,
  previewLoading = false,
  onPreview,
  onClosePreview,
  className,
}: VirtualContributorInviteDialogProps) {
  const { t } = useTranslation('crd-community');
  const [messageVc, setMessageVc] = useState<VcInviteItem | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  // When set, the dialog shows the detail preview for a VC selected from the
  // given section; the action button adds (account) or opens the message step (library).
  const [previewSource, setPreviewSource] = useState<'account' | 'library' | null>(null);

  // Reset every sub-view whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setMessageVc(null);
      setWelcomeMessage('');
      setPreviewSource(null);
    }
  }, [open]);

  const openMessageStep = (vc: VcInviteItem) => {
    setMessageVc(vc);
    setWelcomeMessage(defaultWelcomeMessage);
  };

  const openPreview = (id: string, source: 'account' | 'library') => {
    setPreviewSource(source);
    onPreview?.(id);
  };

  const closePreview = () => {
    setPreviewSource(null);
    onClosePreview?.();
  };

  const onPreviewAction = () => {
    if (!previewData) return;
    if (previewSource === 'account') {
      onAddAccountVc(previewData.id);
      return;
    }
    // library → go to the welcome-message step
    setPreviewSource(null);
    openMessageStep({ id: previewData.id, displayName: previewData.displayName, avatarUrl: previewData.avatarUrl });
  };

  const messageEmpty = welcomeMessage.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-xl md:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden [&>*]:min-w-0', className)}
      >
        <DialogHeader className="shrink-0">
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
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
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
            </div>
            <div className="flex justify-end gap-2 pt-4 shrink-0">
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
        ) : previewSource ? (
          <VirtualContributorPreview
            data={previewData}
            loading={previewLoading}
            onBack={closePreview}
            onAction={onPreviewAction}
            actionLabel={previewSource === 'account' ? t('inviteVc.add') : t('inviteVc.invite')}
            actionBusy={Boolean(previewData) && busyId === previewData?.id}
          />
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="relative shrink-0 py-2">
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

            <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <output className="block py-6 text-center text-muted-foreground" aria-label={t('inviteVc.loading')}>
                  <Loader2 aria-hidden="true" className="inline size-4 animate-spin" />
                </output>
              ) : (
                <>
                  {!libraryOnly && (
                    <VcSection
                      title={t('inviteVc.onAccount')}
                      emptyLabel={t('inviteVc.onAccountEmpty')}
                      vcs={accountVcs}
                      actionLabel={t('inviteVc.add')}
                      actionIcon="add"
                      busyId={busyId}
                      onAction={onAddAccountVc}
                      onPreview={id => openPreview(id, 'account')}
                      previewAriaLabel={name => t('inviteVc.previewAriaLabel', { name })}
                      addAriaLabel={name => t('inviteVc.addAriaLabel', { name })}
                    />
                  )}
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
                    onPreview={id => openPreview(id, 'library')}
                    previewAriaLabel={name => t('inviteVc.previewAriaLabel', { name })}
                    addAriaLabel={name => t('inviteVc.inviteAriaLabel', { name })}
                  />
                </>
              )}
            </div>
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
  onPreview,
  previewAriaLabel,
  addAriaLabel,
}: {
  title: string;
  emptyLabel: string;
  vcs: VcInviteItem[];
  actionLabel: string;
  actionIcon: 'add' | 'invite';
  busyId?: string | null;
  onAction: (id: string) => void;
  onPreview: (id: string) => void;
  previewAriaLabel: (name: string) => string;
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
                <button
                  type="button"
                  onClick={() => onPreview(vc.id)}
                  aria-label={previewAriaLabel(vc.displayName)}
                  className="flex items-center gap-3 min-w-0 rounded text-left outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <VcAvatar vc={vc} />
                  <div className="min-w-0">
                    <span className="block text-body-emphasis truncate">{vc.displayName}</span>
                    {vc.subtitle && (
                      <span className="block text-caption text-muted-foreground truncate">{vc.subtitle}</span>
                    )}
                  </div>
                </button>
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
