import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { SearchField } from '@/crd/forms/SearchField';
import { Button } from '@/crd/primitives/button';

export type RoleMember = {
  id: string;
  displayName: string;
  email?: string;
};

type RoleMembersEditorProps = {
  /** Translated name of the role being edited. */
  roleLabel: string;
  members: RoleMember[];
  availableUsers: RoleMember[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  loadingMembers?: boolean;
  loadingAvailable?: boolean;
  updating?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

const memberLabel = (member: RoleMember) =>
  member.email ? `${member.displayName} (${member.email})` : member.displayName;

/**
 * Presentational editor for a single global role's membership — current members
 * (with remove) on one side, a searchable list of available users (with add) on
 * the other. Removal is destructive and routed through `ConfirmationDialog`
 * (CRD rule #9). All data + behaviour arrive via props.
 */
export function RoleMembersEditor({
  roleLabel,
  members,
  availableUsers,
  searchTerm,
  onSearchTermChange,
  onAdd,
  onRemove,
  loadingMembers = false,
  loadingAvailable = false,
  updating = false,
  hasMore = false,
  onLoadMore,
}: RoleMembersEditorProps) {
  const { t } = useTranslation('crd-admin');
  const [pendingRemove, setPendingRemove] = useState<RoleMember | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-section-title">{roleLabel}</h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Current members */}
        <section className="flex flex-col gap-3">
          <h3 className="text-subheader font-semibold">{t('roleMembers.currentMembers')}</h3>
          {members.length === 0 ? (
            <p className="text-body text-muted-foreground">{t('roleMembers.noMembers')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map(member => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-body break-words">{memberLabel(member)}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={updating}
                    onClick={() => setPendingRemove(member)}
                  >
                    {t('roleMembers.remove')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add members */}
        <section className="flex flex-col gap-3">
          <h3 className="text-subheader font-semibold">{t('roleMembers.addMembers')}</h3>
          <SearchField
            value={searchTerm}
            onValueChange={onSearchTermChange}
            placeholder={t('roleMembers.searchPlaceholder')}
          />
          {availableUsers.length === 0 ? (
            <p className="text-body text-muted-foreground">
              {loadingAvailable ? t('roleMembers.loading') : t('roleMembers.noResults')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {availableUsers.map(user => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-body break-words">{memberLabel(user)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('roleMembers.add')}
                    disabled={updating}
                    onClick={() => onAdd(user.id)}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {hasMore && onLoadMore && (
            <Button type="button" variant="outline" onClick={onLoadMore} disabled={loadingAvailable}>
              {t('table.loadMore')}
            </Button>
          )}
        </section>
      </div>

      {loadingMembers && (
        <output className="sr-only" aria-live="polite">
          {t('roleMembers.loading')}
        </output>
      )}

      <ConfirmationDialog
        open={Boolean(pendingRemove)}
        onOpenChange={open => {
          if (!open) setPendingRemove(null);
        }}
        variant="destructive"
        title={t('roleMembers.removeTitle', { name: pendingRemove?.displayName ?? '' })}
        description={t('roleMembers.removeDescription')}
        confirmLabel={t('roleMembers.remove')}
        loading={updating}
        onConfirm={() => {
          if (pendingRemove) onRemove(pendingRemove.id);
          setPendingRemove(null);
        }}
      />
    </div>
  );
}
