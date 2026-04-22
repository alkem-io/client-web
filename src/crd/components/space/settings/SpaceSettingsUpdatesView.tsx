import { Calendar, Loader2, Megaphone, MoreHorizontal, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Separator } from '@/crd/primitives/separator';

export type UpdateAuthor = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  /** Optional role badge text (e.g. "Host", "Admin"). */
  roleLabel?: string | null;
};

export type UpdateMessage = {
  id: string;
  body: string;
  timestamp: number;
  author: UpdateAuthor | null;
};

export type SpaceSettingsUpdatesViewProps = {
  messages: UpdateMessage[];
  draft: string;
  loading: boolean;
  submitting: boolean;
  removing: boolean;
  canEdit: boolean;
  canRemove: boolean;
  onDraftChange: (next: string) => void;
  onSubmit: () => void;
  onRequestRemove: (messageId: string) => void;
  className?: string;
};

/**
 * Space Settings → Updates tab view. Mirrors the MUI `CommunityUpdatesView`
 * contract (list of markdown messages + composer + remove) while matching
 * the prototype's "Updates from the Leads" styling: prominent New Update
 * button with collapsible composer, author row with avatar/role/date,
 * kebab menu per message.
 *
 * Per-update titles and pinning are present in the prototype's mocks but
 * not backed by the server schema — they're intentionally omitted here.
 */
export function SpaceSettingsUpdatesView({
  messages,
  draft,
  loading,
  submitting,
  removing,
  canEdit,
  canRemove,
  onDraftChange,
  onSubmit,
  onRequestRemove,
  className,
}: SpaceSettingsUpdatesViewProps) {
  const { t, i18n } = useTranslation('crd-spaceSettings');
  const [composerOpen, setComposerOpen] = useState(false);
  const prevSubmittingRef = useRef(submitting);

  // Close the composer once a publish flips `submitting` back to false without
  // an error leaving draft populated. Consumers are expected to clear the
  // draft on success; if draft is empty on the transition, we collapse.
  useEffect(() => {
    if (prevSubmittingRef.current && !submitting && draft.trim().length === 0) {
      setComposerOpen(false);
    }
    prevSubmittingRef.current = submitting;
  }, [submitting, draft]);

  const formatDate = (timestamp: number) => {
    if (!timestamp || Number.isNaN(timestamp)) return '';
    try {
      return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const canSubmit = canEdit && draft.trim().length > 0 && !submitting;

  const handlePublish = () => {
    onSubmit();
  };

  const handleCancelComposer = () => {
    onDraftChange('');
    setComposerOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-section-title tracking-tight flex items-center gap-2">
            <Megaphone aria-hidden="true" className="size-5" />
            {t('updates.pageHeader.title', { defaultValue: 'Updates from the Leads' })}
          </h2>
          <p className="text-body text-muted-foreground mt-2">
            {t('updates.pageHeader.subtitle', {
              defaultValue: 'Post announcements, milestones, and progress updates visible to all space members.',
            })}
          </p>
        </div>
        {canEdit && !composerOpen && (
          <Button type="button" size="sm" className="gap-2" onClick={() => setComposerOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            {t('updates.composer.new', { defaultValue: 'New Update' })}
          </Button>
        )}
      </div>

      <Separator />

      {/* Composer (collapsed by default, opens on New Update click) */}
      {canEdit && composerOpen && (
        <section className="rounded-lg border bg-muted p-5 flex flex-col gap-4">
          <h3 className="text-card-title">{t('updates.composer.title', { defaultValue: 'New update' })}</h3>
          <MarkdownEditor
            value={draft}
            onChange={onDraftChange}
            placeholder={t('updates.composer.placeholder', { defaultValue: 'Write your update…' })}
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={handlePublish}
              disabled={!canSubmit}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  {t('updates.composer.submitting', { defaultValue: 'Publishing…' })}
                </>
              ) : (
                <>
                  <Send aria-hidden="true" className="size-4" />
                  {t('updates.composer.publish', { defaultValue: 'Publish' })}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCancelComposer} disabled={submitting}>
              {t('updates.composer.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </div>
        </section>
      )}

      {/* Message list */}
      <section className="flex flex-col gap-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-body text-muted-foreground py-12">
            {t('updates.empty', { defaultValue: 'No updates yet.' })}
          </p>
        ) : (
          messages.map(message => (
            <article
              key={message.id}
              className="rounded-lg border border-border bg-muted p-5 flex flex-col gap-3 transition-colors"
              aria-busy={removing}
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    {message.author?.avatarUrl ? <AvatarImage src={message.author.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-caption">
                      {initialsFromName(message.author?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {message.author?.profileUrl ? (
                        <a
                          href={message.author.profileUrl}
                          className="text-body-emphasis text-foreground hover:underline"
                        >
                          {message.author.displayName}
                        </a>
                      ) : (
                        <span className="text-body-emphasis text-foreground">
                          {message.author?.displayName ??
                            t('updates.unknownAuthor', { defaultValue: 'Unknown author' })}
                        </span>
                      )}
                      {message.author?.roleLabel && (
                        <span className="text-caption text-muted-foreground">{message.author.roleLabel}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground mt-0.5">
                      <Calendar aria-hidden="true" className="size-3" />
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                </div>
                {canRemove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={t('updates.message.actions', { defaultValue: 'Update actions' })}
                      >
                        <MoreHorizontal aria-hidden="true" className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onRequestRemove(message.id)}
                      >
                        <Trash2 aria-hidden="true" className="mr-2 size-4" />
                        {t('updates.message.delete', { defaultValue: 'Delete' })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </header>
              <div className="text-body text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-foreground [&_strong]:font-semibold [&_p]:mb-2 [&_p:last-child]:mb-0">
                <MarkdownContent content={message.body} />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function initialsFromName(name: string | null | undefined): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}
