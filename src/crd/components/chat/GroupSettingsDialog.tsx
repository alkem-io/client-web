import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { type ShareUser, UserSelector } from '@/crd/forms/UserSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import type { GroupMember } from './types';

type GroupSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  members: GroupMember[];
  /** Integration-supplied avatar display / uploader. */
  avatarSlot?: ReactNode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: ShareUser[];
  loadingSearch?: boolean;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveGroup: () => void;
  onSave: (displayName: string) => void;
  saving?: boolean;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('') || '?';

/** Group settings: rename, change avatar (slot), add/remove members, leave. */
export function GroupSettingsDialog({
  open,
  onOpenChange,
  displayName,
  members,
  avatarSlot,
  searchQuery,
  onSearchChange,
  searchResults,
  loadingSearch,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
  onSave,
  saving,
}: GroupSettingsDialogProps) {
  const { t } = useTranslation('crd-chat');
  const [editedName, setEditedName] = useState(displayName);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // Re-seed the editable name whenever the dialog (re)opens for a conversation.
  useEffect(() => {
    if (open) {
      setEditedName(displayName);
    }
  }, [open, displayName]);

  const isDirty = editedName.trim() !== displayName;

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
    blockClose: saving,
  });

  const pendingRemoveMember = members.find(member => member.id === pendingRemoveId);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('group.settings')}</DialogTitle>
            <DialogDescription className="sr-only">{t('group.settings')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {avatarSlot && <div className="flex items-center gap-3">{avatarSlot}</div>}

            <label htmlFor="crd-group-name" className="flex flex-col gap-1">
              <span className="text-body-emphasis">{t('group.nameLabel')}</span>
              <Input id="crd-group-name" value={editedName} onChange={event => setEditedName(event.target.value)} />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-body-emphasis">{t('group.members')}</span>
              <UserSelector
                selectedUsers={[]}
                searchResults={searchResults}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSelect={user => onAddMember(user.id)}
                onRemove={() => {}}
                loading={loadingSearch}
                placeholder={t('group.addPlaceholder')}
                searchAriaLabel={t('group.addPlaceholder')}
                noResultsLabel={t('group.noResults')}
                loadingLabel={t('list.loading')}
              />
              <ul className="flex flex-col gap-1">
                {members.map(member => (
                  <li key={member.id} className="flex items-center gap-3 rounded-md px-1 py-1.5">
                    <Avatar className="size-8 shrink-0">
                      {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
                      <AvatarFallback className="text-caption">{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-body">
                      {member.name}
                      {member.isCurrentUser && <span className="text-muted-foreground"> ({t('group.you')})</span>}
                    </span>
                    {!member.isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingRemoveId(member.id)}
                        aria-label={t('group.removeMemberAria', { name: member.name })}
                      >
                        {t('group.removeMemberConfirm.confirm')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Button variant="ghost" className="text-destructive" onClick={() => setLeaveOpen(true)}>
                {t('group.leave')}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={requestClose} disabled={saving}>
                  {t('actions.cancel')}
                </Button>
                <Button onClick={() => onSave(editedName)} disabled={saving} aria-busy={saving}>
                  {t('group.save')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {guardElement}

      <ConfirmationDialog
        open={Boolean(pendingRemoveId)}
        onOpenChange={openState => !openState && setPendingRemoveId(null)}
        title={t('group.removeMemberConfirm.title')}
        description={t('group.removeMemberConfirm.description')}
        confirmLabel={t('group.removeMemberConfirm.confirm')}
        variant="destructive"
        onConfirm={() => {
          if (pendingRemoveMember) {
            onRemoveMember(pendingRemoveMember.id);
          }
          setPendingRemoveId(null);
        }}
      />
      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title={t('group.leaveConfirm.title')}
        description={t('group.leaveConfirm.description')}
        confirmLabel={t('group.leaveConfirm.confirm')}
        variant="destructive"
        onConfirm={() => {
          setLeaveOpen(false);
          onLeaveGroup();
        }}
      />
    </>
  );
}
