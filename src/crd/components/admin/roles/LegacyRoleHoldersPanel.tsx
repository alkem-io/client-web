import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import type { RoleMember } from './RoleMembersEditor';

export type LegacyRoleGroup = {
  role: string;
  roleLabel: string;
  holders: RoleMember[];
};

type LegacyRoleHoldersPanelProps = {
  groups: LegacyRoleGroup[];
  onRemove: (role: string, memberId: string) => void;
  removing?: boolean;
};

type PendingRemoval = {
  role: string;
  member: RoleMember;
};

const memberLabel = (member: RoleMember) =>
  member.email ? `${member.displayName} (${member.email})` : member.displayName;

/**
 * sec-client-web-1: a clearly-labelled, remove-only view of the legacy
 * platform credentials (`GLOBAL_*` / `PLATFORM_BETA_TESTER` /
 * `PLATFORM_VC_CAMPAIGN` / `PLATFORM_ASSISTANT_ACCESS`) still live until
 * Slice B retires them. Unlike `RoleMembersEditor`, this component has **no
 * add affordance at all** — nothing should ever be newly granted a role that
 * is being retired; the only action offered is revoking an existing holder,
 * which is the incident-response capability the round-1 fix restores.
 */
export function LegacyRoleHoldersPanel({ groups, onRemove, removing = false }: LegacyRoleHoldersPanelProps) {
  const { t } = useTranslation('crd-admin');
  const [pendingRemove, setPendingRemove] = useState<PendingRemoval | null>(null);

  const groupsWithHolders = groups.filter(group => group.holders.length > 0);

  return (
    <section className="flex flex-col gap-4" aria-label={t('roleMembers.legacyRolesHeading')}>
      <h2 className="text-section-title">{t('roleMembers.legacyRolesHeading')}</h2>
      <p className="text-body text-muted-foreground">{t('roleMembers.legacyRolesDescription')}</p>

      {groupsWithHolders.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('roleMembers.legacyRolesNoHolders')}</p>
      ) : (
        groupsWithHolders.map(group => (
          <div key={group.role} className="flex flex-col gap-2">
            <h3 className="text-subheader font-semibold">{group.roleLabel}</h3>
            <ul className="flex flex-col gap-2">
              {group.holders.map(member => (
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
                    disabled={removing}
                    onClick={() => setPendingRemove({ role: group.role, member })}
                  >
                    {t('roleMembers.remove')}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <ConfirmationDialog
        open={Boolean(pendingRemove)}
        onOpenChange={open => {
          if (!open) setPendingRemove(null);
        }}
        variant="destructive"
        title={t('roleMembers.removeTitle', { name: pendingRemove?.member.displayName ?? '' })}
        description={t('roleMembers.removeDescription')}
        confirmLabel={t('roleMembers.remove')}
        loading={removing}
        onConfirm={() => {
          if (pendingRemove) {
            onRemove(pendingRemove.role, pendingRemove.member.id);
          }
          setPendingRemove(null);
        }}
      />
    </section>
  );
}
