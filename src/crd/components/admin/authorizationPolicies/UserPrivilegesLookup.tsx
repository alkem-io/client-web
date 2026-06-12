import { useTranslation } from 'react-i18next';
import { SearchField } from '@/crd/forms/SearchField';
import { Badge } from '@/crd/primitives/badge';

export type UserPrivilegesOption = { id: string; label: string };

type UserPrivilegesLookupProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  users: UserPrivilegesOption[];
  loadingUsers: boolean;
  selectedLabel?: string;
  onSelectUser: (userId: string) => void;
  privileges?: string[];
  loadingPrivileges: boolean;
};

/**
 * Looks up the privileges a specific user is granted within the loaded policy.
 * Search → pick a user → see their effective privileges. Pure presentation.
 */
export function UserPrivilegesLookup({
  searchTerm,
  onSearchTermChange,
  users,
  loadingUsers,
  selectedLabel,
  onSelectUser,
  privileges,
  loadingPrivileges,
}: UserPrivilegesLookupProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-subheader font-semibold">{t('authPolicies.userLookup')}</h3>
      <SearchField
        value={searchTerm}
        onValueChange={onSearchTermChange}
        placeholder={t('authPolicies.userSearchPlaceholder')}
      />

      {searchTerm && (
        <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {loadingUsers && <li className="text-caption text-muted-foreground">{t('roleMembers.loading')}</li>}
          {!loadingUsers &&
            users.map(user => (
              <li key={user.id}>
                <button
                  type="button"
                  className="w-full rounded-md px-2 py-1 text-left text-body hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  onClick={() => onSelectUser(user.id)}
                >
                  {user.label}
                </button>
              </li>
            ))}
        </ul>
      )}

      {selectedLabel && (
        <div className="flex flex-col gap-2">
          <p className="text-body-emphasis">{t('authPolicies.privilegesForUser', { name: selectedLabel })}</p>
          {loadingPrivileges ? (
            <p className="text-caption text-muted-foreground">{t('roleMembers.loading')}</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {(privileges ?? []).map(privilege => (
                <Badge key={privilege} variant="secondary">
                  {privilege}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
