import { Eye, Settings as SettingsIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type OrgSettingsTabViewProps = {
  loading: boolean;
  // Membership
  allowUsersMatchingDomainToJoin: boolean;
  membershipSaving: boolean;
  onToggleAllowDomain: (next: boolean) => void;
  // Membership — allow Spaces to invite this organization (061)
  allowSpaceInvitations: boolean;
  allowSpaceInvitationsSaving: boolean;
  onToggleAllowSpaceInvitations: (next: boolean) => void;
  // Privacy
  contributionRolesPubliclyVisible: boolean;
  privacySaving: boolean;
  onToggleContributionRoles: (next: boolean) => void;
};

/**
 * Org Settings tab — presentational view (US12).
 *
 * Two `SettingsCard`s:
 *
 * 1. **Membership** — `allowUsersMatchingDomainToJoin` and
 *    `allowSpaceInvitations` (whether Spaces may invite this organization).
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('org.settings.membership.allowDomainLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('org.settings.membership.allowDomainCaption')}
            </p>
          </div>
          <Switch
            checked={props.allowUsersMatchingDomainToJoin}
            disabled={props.membershipSaving}
            onCheckedChange={props.onToggleAllowDomain}
            aria-label={t('org.settings.membership.allowDomainLabel')}
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('org.settings.membership.allowSpaceInvitationsLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('org.settings.membership.allowSpaceInvitationsCaption')}
            </p>
          </div>
          <Switch
            checked={props.allowSpaceInvitations}
            disabled={props.allowSpaceInvitationsSaving}
            onCheckedChange={props.onToggleAllowSpaceInvitations}
            aria-label={t('org.settings.membership.allowSpaceInvitationsLabel')}
          />
        </div>
      </SettingsCard>

      <SettingsCard icon={Eye} title={t('org.settings.privacy.title')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('org.settings.privacy.contributionRolesLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('org.settings.privacy.contributionRolesCaption')}
            </p>
          </div>
          <Switch
            checked={props.contributionRolesPubliclyVisible}
            disabled={props.privacySaving}
            onCheckedChange={props.onToggleContributionRoles}
            aria-label={t('org.settings.privacy.contributionRolesLabel')}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
