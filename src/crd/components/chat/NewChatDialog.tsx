import { useTranslation } from 'react-i18next';
import { type ShareUser, UserSelector } from '@/crd/forms/UserSelector';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: ShareUser[];
  selectedUsers: ShareUser[];
  onSelect: (user: ShareUser) => void;
  onRemove: (userId: string) => void;
  loading?: boolean;
  creating?: boolean;
  onCreate: () => void;
};

/** Recipient picker for a new direct (1 person) or group (2+) conversation. */
export function NewChatDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  searchResults,
  selectedUsers,
  onSelect,
  onRemove,
  loading,
  creating,
  onCreate,
}: NewChatDialogProps) {
  const { t } = useTranslation('crd-chat');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newChat.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('newChat.title')}</DialogDescription>
        </DialogHeader>
        <UserSelector
          selectedUsers={selectedUsers}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelect={onSelect}
          onRemove={onRemove}
          loading={loading}
          placeholder={t('newChat.searchPlaceholder')}
          searchAriaLabel={t('newChat.searchPlaceholder')}
          noResultsLabel={t('newChat.noResults')}
          loadingLabel={t('list.loading')}
          removeAriaLabel={name => t('newChat.removeAria', { name })}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={creating}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={onCreate} disabled={selectedUsers.length === 0 || creating} aria-busy={creating}>
            {selectedUsers.length > 1 ? t('newChat.createGroup') : t('newChat.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
