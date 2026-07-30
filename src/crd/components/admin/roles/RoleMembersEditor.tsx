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

type PendingRemoval = {
  kind: 'user' | 'organization';
  member: RoleMember;
};

/**
 * SC-009 / FR-002: an organization holder-kind section, rendered only for a role
 * whose role set allows an organization to hold it (the 3 `Feature …` roles).
 * Mirrors the user members/available columns exactly — same shape, same
 * add/remove/search behaviour — just a different holder kind.
 */
export type RoleOrganizationSection = {
  members: RoleMember[];
  availableOrganizations: RoleMember[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onAdd: (organizationId: string) => void;
  onRemove: (organizationId: string) => void;
  loadingMembers?: boolean;
  loadingAvailable?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

type RoleMembersEditorProps = {
  /** Translated name of the role being edited. */
  roleLabel: string;
  /** Translated description of the role's scope; omitted → no description rendered. */
  roleDescription?: string;
  /**
   * A server assignment rejection, rendered verbatim (FR-012) — the five
   * rule-naming errors from contracts/graphql-contract.md. Never predicted,
   * pre-validated or reworded here; this component only renders the string
   * it is given.
   */
  errorMessage?: string;
  /** Current members, already filtered by `memberSearchTerm` upstream. */
  members: RoleMember[];
  availableUsers: RoleMember[];
  /** Client-side filter over the current members. */
  memberSearchTerm: string;
  onMemberSearchTermChange: (term: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  loadingMembers?: boolean;
  loadingAvailable?: boolean;
  updating?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  organizationSection?: RoleOrganizationSection;
  /**
   * True when the holder-list read could not be attempted or was rejected —
   * as opposed to a genuine "no holders" result. Renders an explicit
   * unavailable message instead of the misleading `noMembers` empty state
   * (sec-client-web-2).
   */
  holdersUnavailable?: boolean;
  /**
   * corr-client-web-7: true when the operator can view this role's holders
   * but not manage them (a legacy holder-list-read privilege, not a manage
   * privilege). Hides the add/remove affordances on both the user and
   * organization holder-kind columns — current holders still render.
   */
  readOnly?: boolean;
};

const memberLabel = (member: RoleMember) =>
  member.email ? `${member.displayName} (${member.email})` : member.displayName;

type MemberColumnsProps = {
  titleCurrent: string;
  titleAdd: string;
  members: RoleMember[];
  available: RoleMember[];
  memberSearchTerm?: string;
  onMemberSearchTermChange?: (term: string) => void;
  showMemberSearch?: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onAdd: (id: string) => void;
  onRequestRemove: (member: RoleMember) => void;
  loadingMembers?: boolean;
  loadingAvailable?: boolean;
  updating?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  holdersUnavailable?: boolean;
  readOnly?: boolean;
};

/** Shared current-members / available-to-add column pair — reused for both the
 * user holder kind and, on Feature roles, the organization holder kind. */
function MemberColumns({
  titleCurrent,
  titleAdd,
  members,
  available,
  memberSearchTerm,
  onMemberSearchTermChange,
  showMemberSearch = false,
  searchTerm,
  onSearchTermChange,
  onAdd,
  onRequestRemove,
  loadingMembers = false,
  loadingAvailable = false,
  updating = false,
  hasMore = false,
  onLoadMore,
  holdersUnavailable = false,
  readOnly = false,
}: MemberColumnsProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <div className={readOnly ? 'flex flex-col gap-8' : 'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
      {/* Current members */}
      <section className="flex flex-col gap-3">
        <h3 className="text-subheader font-semibold">{titleCurrent}</h3>
        {showMemberSearch && onMemberSearchTermChange && (
          <SearchField
            value={memberSearchTerm ?? ''}
            onValueChange={onMemberSearchTermChange}
            placeholder={t('roleMembers.filterMembersPlaceholder')}
          />
        )}
        {members.length === 0 ? (
          <p role={holdersUnavailable ? 'alert' : undefined} className="text-body text-muted-foreground">
            {holdersUnavailable
              ? t('roleMembers.holdersUnavailable')
              : memberSearchTerm
                ? t('roleMembers.noResults')
                : t('roleMembers.noMembers')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map(member => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-body break-words">{memberLabel(member)}</span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={updating}
                    onClick={() => onRequestRemove(member)}
                  >
                    {t('roleMembers.remove')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add members — never rendered in read-only mode (corr-client-web-7):
          nothing here can ever be granted by a view-only operator. */}
      {!readOnly && (
        <section className="flex flex-col gap-3">
          <h3 className="text-subheader font-semibold">{titleAdd}</h3>
          <SearchField
            value={searchTerm}
            onValueChange={onSearchTermChange}
            placeholder={t('roleMembers.searchPlaceholder')}
          />
          {available.length === 0 ? (
            <p className="text-body text-muted-foreground">
              {loadingAvailable ? t('roleMembers.loading') : t('roleMembers.noResults')}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {available.map(candidate => (
                <li
                  key={candidate.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-body break-words">{memberLabel(candidate)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('roleMembers.add')}
                    disabled={updating}
                    onClick={() => onAdd(candidate.id)}
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
      )}

      {loadingMembers && (
        <output className="sr-only" aria-live="polite">
          {t('roleMembers.loading')}
        </output>
      )}
    </div>
  );
}

/**
 * Presentational editor for a single global role's membership — current members
 * (with remove) on one side, a searchable list of available users (with add) on
 * the other. Removal is destructive and routed through `ConfirmationDialog`
 * (CRD rule #9). All data + behaviour arrive via props.
 *
 * When `organizationSection` is provided (the 3 `Feature …` roles, SC-009), a
 * second such pair renders below for the organization holder kind — the server
 * enforces which roles allow it (FR-002); this component just renders what it's
 * given.
 */
export function RoleMembersEditor({
  roleLabel,
  roleDescription,
  errorMessage,
  members,
  availableUsers,
  memberSearchTerm,
  onMemberSearchTermChange,
  searchTerm,
  onSearchTermChange,
  onAdd,
  onRemove,
  loadingMembers = false,
  loadingAvailable = false,
  updating = false,
  hasMore = false,
  onLoadMore,
  organizationSection,
  holdersUnavailable = false,
  readOnly = false,
}: RoleMembersEditorProps) {
  const { t } = useTranslation('crd-admin');
  const [pendingRemove, setPendingRemove] = useState<PendingRemoval | null>(null);

  // Show the members filter once there's something to search — or while a search
  // is active even if it currently matches nothing (so the box doesn't vanish).
  const showMemberSearch = members.length > 0 || Boolean(memberSearchTerm);

  const confirmLabel =
    pendingRemove?.kind === 'organization' ? t('roleMembers.removeOrganization') : t('roleMembers.remove');

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-section-title">{roleLabel}</h2>
      {roleDescription && <p className="text-body text-muted-foreground">{roleDescription}</p>}

      {errorMessage && (
        <p role="alert" className="text-body text-destructive">
          {errorMessage}
        </p>
      )}

      <MemberColumns
        titleCurrent={t('roleMembers.currentMembers')}
        titleAdd={t('roleMembers.addMembers')}
        members={members}
        available={availableUsers}
        memberSearchTerm={memberSearchTerm}
        onMemberSearchTermChange={onMemberSearchTermChange}
        showMemberSearch={showMemberSearch}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        onAdd={onAdd}
        onRequestRemove={member => setPendingRemove({ kind: 'user', member })}
        loadingMembers={loadingMembers}
        loadingAvailable={loadingAvailable}
        updating={updating}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        holdersUnavailable={holdersUnavailable}
        readOnly={readOnly}
      />

      {organizationSection && (
        <>
          <h3 className="text-subsection-title font-semibold">{t('roleMembers.organizations')}</h3>
          <MemberColumns
            titleCurrent={t('roleMembers.currentOrganizations')}
            titleAdd={t('roleMembers.addOrganizations')}
            members={organizationSection.members}
            available={organizationSection.availableOrganizations}
            searchTerm={organizationSection.searchTerm}
            onSearchTermChange={organizationSection.onSearchTermChange}
            onAdd={organizationSection.onAdd}
            onRequestRemove={member => setPendingRemove({ kind: 'organization', member })}
            loadingMembers={organizationSection.loadingMembers}
            loadingAvailable={organizationSection.loadingAvailable}
            updating={updating}
            hasMore={organizationSection.hasMore}
            onLoadMore={organizationSection.onLoadMore}
            holdersUnavailable={holdersUnavailable}
            readOnly={readOnly}
          />
        </>
      )}

      <ConfirmationDialog
        open={Boolean(pendingRemove)}
        onOpenChange={open => {
          if (!open) setPendingRemove(null);
        }}
        variant="destructive"
        title={t('roleMembers.removeTitle', { name: pendingRemove?.member.displayName ?? '' })}
        description={t('roleMembers.removeDescription')}
        confirmLabel={confirmLabel}
        loading={updating}
        onConfirm={() => {
          if (pendingRemove) {
            if (pendingRemove.kind === 'organization') {
              organizationSection?.onRemove(pendingRemove.member.id);
            } else {
              onRemove(pendingRemove.member.id);
            }
          }
          setPendingRemove(null);
        }}
      />
    </div>
  );
}
