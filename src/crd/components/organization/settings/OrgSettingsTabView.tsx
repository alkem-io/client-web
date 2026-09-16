import { Eye, Settings as SettingsIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type OrgSettingsTabViewProps = {
  loading: boolean;
  // Membership — all three switches live here (R41). The domain switch never
  // leaves this tab, and `allowApplications` (062) joins it rather than sitting
  // on the Associates tab; that tab carries no settings at all.
  allowSpaceInvitations: boolean;
  allowSpaceInvitationsSaving: boolean;
  onToggleAllowSpaceInvitations: (next: boolean) => void;
  allowUsersMatchingDomainToJoin: boolean;
  allowUsersMatchingDomainToJoinSaving: boolean;
  onToggleAllowUsersMatchingDomainToJoin: (next: boolean) => void;
  allowApplications: boolean;
  allowApplicationsSaving: boolean;
  onToggleAllowApplications: (next: boolean) => void;
  // Privacy
  contributionRolesPubliclyVisible: boolean;
  privacySaving: boolean;
  onToggleContributionRoles: (next: boolean) => void;
};

type SwitchRowProps = {
  label: string;
  caption: string;
  checked: boolean;
  saving: boolean;
  onCheckedChange: (next: boolean) => void;
};

/**
 * One labelled switch row. Extracted because this card now carries four of them:
 * the duplicated `allowSpaceInvitations` block Carlos found on 2026-09-11 (R45)
 * was a merge artefact that survived precisely because the markup was repeated
 * verbatim, so there is one copy of it here and only the data differs.
 */
function SwitchRow({ label, caption, checked, saving, onCheckedChange }: SwitchRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-body-emphasis">{label}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">{caption}</p>
      </div>
      <Switch checked={checked} disabled={saving} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

/**
 * Org Settings tab — presentational view (US12).
 *
 * Two `SettingsCard`s:
 *
 * 1. **Membership** — `allowSpaceInvitations` (whether Spaces may invite this
 *    organization, 061), `allowUsersMatchingDomainToJoin` and `allowApplications`
 *    (062, R41).
 * 2. **Privacy** (`contributionRolesPubliclyVisible`).
 *
 * **No Design System toggle** on this tab (FR-132 — User-only). Every
 * switch commits via a callback prop; the parent owns the optimistic
 * flip + hard-failure revert with toast (FR-133).
 */
export function OrgSettingsTabView(props: OrgSettingsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <SettingsCard icon={SettingsIcon} title={t('org.settings.title')}>
          <Skeleton className="h-20 w-full" />
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard icon={Users} title={t('org.settings.membership.title')}>
        <div className="space-y-4">
          <SwitchRow
            label={t('org.settings.membership.allowSpaceInvitationsLabel')}
            caption={t('org.settings.membership.allowSpaceInvitationsCaption')}
            checked={props.allowSpaceInvitations}
            saving={props.allowSpaceInvitationsSaving}
            onCheckedChange={props.onToggleAllowSpaceInvitations}
          />
          <SwitchRow
            label={t('org.settings.membership.allowDomainLabel')}
            caption={t('org.settings.membership.allowDomainCaption')}
            checked={props.allowUsersMatchingDomainToJoin}
            saving={props.allowUsersMatchingDomainToJoinSaving}
            onCheckedChange={props.onToggleAllowUsersMatchingDomainToJoin}
          />
          <SwitchRow
            label={t('org.settings.membership.allowApplicationsLabel')}
            caption={t('org.settings.membership.allowApplicationsCaption')}
            checked={props.allowApplications}
            saving={props.allowApplicationsSaving}
            onCheckedChange={props.onToggleAllowApplications}
          />
        </div>
      </SettingsCard>

      <SettingsCard icon={Eye} title={t('org.settings.privacy.title')}>
        <SwitchRow
          label={t('org.settings.privacy.contributionRolesLabel')}
          caption={t('org.settings.privacy.contributionRolesCaption')}
          checked={props.contributionRolesPubliclyVisible}
          saving={props.privacySaving}
          onCheckedChange={props.onToggleContributionRoles}
        />
      </SettingsCard>
    </div>
  );
}
