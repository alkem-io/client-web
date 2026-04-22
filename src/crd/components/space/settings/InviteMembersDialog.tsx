import { Check, Loader2, Mail, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AddCommunityMemberCandidate } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Separator } from '@/crd/primitives/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type InviteMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: AddCommunityMemberCandidate[];
  loading: boolean;
  search: string;
  addedIds: ReadonlySet<string>;
  addingId: string | null;
  inviting: boolean;
  onSearchChange: (next: string) => void;
  onInviteUser: (id: string) => void;
  onInviteEmail: (email: string) => Promise<void>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMembersDialog({
  open,
  onOpenChange,
  candidates,
  loading,
  search,
  addedIds,
  addingId,
  inviting,
  onSearchChange,
  onInviteUser,
  onInviteEmail,
}: InviteMembersDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailInvitedNotice, setEmailInvitedNotice] = useState<string | null>(null);

  const handleSendEmail = async () => {
    const trimmed = emailDraft.trim();
    if (!trimmed) {
      setEmailError(t('community.invite.email.errors.empty', { defaultValue: 'Enter an email address.' }));
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError(t('community.invite.email.errors.invalid', { defaultValue: 'Enter a valid email address.' }));
      return;
    }
    setEmailError(undefined);
    try {
      await onInviteEmail(trimmed);
      setEmailInvitedNotice(trimmed);
      setEmailDraft('');
    } catch (_e) {
      setEmailError(t('community.invite.email.errors.failed', { defaultValue: 'Could not send the invitation.' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('community.invite.title', { defaultValue: 'Invite Members' })}</DialogTitle>
          <DialogDescription>
            {t('community.invite.description', {
              defaultValue:
                'Invite an existing Alkemio member by picking from the list, or invite someone new by email.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Invite by email */}
          <div className="flex flex-col gap-2">
            <h3 className="text-card-title">
              {t('community.invite.email.title', { defaultValue: 'Invite by email' })}
            </h3>
            <div className="flex gap-2">
              <Input
                type="email"
                value={emailDraft}
                onChange={e => {
                  setEmailDraft(e.target.value);
                  setEmailInvitedNotice(null);
                  if (emailError) setEmailError(undefined);
                }}
                placeholder={t('community.invite.email.placeholder', { defaultValue: 'person@example.com' })}
                disabled={inviting}
                aria-invalid={!!emailError}
                className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              <Button type="button" onClick={() => void handleSendEmail()} disabled={inviting} aria-busy={inviting}>
                {inviting ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <>
                    <Mail aria-hidden="true" className="mr-1.5 size-4" />
                    {t('community.invite.email.send', { defaultValue: 'Send' })}
                  </>
                )}
              </Button>
            </div>
            {emailError && <p className="text-caption text-destructive">{emailError}</p>}
            {emailInvitedNotice && !emailError && (
              <p className="text-caption text-emerald-600 inline-flex items-center gap-1">
                <Check aria-hidden="true" className="size-3" />
                {t('community.invite.email.sent', {
                  defaultValue: 'Invitation sent to {{email}}',
                  email: emailInvitedNotice,
                })}
              </p>
            )}
          </div>

          <Separator />

          {/* Invite existing users */}
          <div className="flex flex-col gap-3">
            <h3 className="text-card-title">
              {t('community.invite.users.title', { defaultValue: 'Invite existing members' })}
            </h3>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('community.invite.users.search', { defaultValue: 'Search Alkemio members…' })}
                className="h-9 pl-9 text-sm"
              />
            </div>
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('community.addDialog.name', { defaultValue: 'Name' })}</TableHead>
                    <TableHead className="w-[110px] text-right">
                      {t('community.addDialog.action', { defaultValue: 'Action' })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                        <Loader2 aria-hidden="true" className="inline size-4 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-6 text-center text-muted-foreground text-caption">
                        {t('community.invite.users.empty', { defaultValue: 'No candidates match your search.' })}
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map(c => {
                      const isAdded = addedIds.has(c.id);
                      const isAdding = addingId === c.id;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-8 border border-border shrink-0">
                                {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt="" /> : null}
                                <AvatarFallback className="text-caption">
                                  {c.displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <span className="block text-body-emphasis truncate">{c.displayName}</span>
                                {c.email && (
                                  <span className="block text-caption text-muted-foreground truncate">{c.email}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isAdded ? (
                              <span className="inline-flex items-center gap-1 text-caption text-emerald-600">
                                <Check aria-hidden="true" className="size-3" />
                                {t('community.invite.users.invited', { defaultValue: 'Invited' })}
                              </span>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onInviteUser(c.id)}
                                disabled={isAdding}
                                aria-busy={isAdding}
                              >
                                {isAdding ? (
                                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus aria-hidden="true" className="mr-1.5 size-4" />
                                    {t('community.invite.users.invite', { defaultValue: 'Invite' })}
                                  </>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
