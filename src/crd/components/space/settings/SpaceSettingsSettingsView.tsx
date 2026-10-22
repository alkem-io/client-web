import {
  AlertTriangle,
  Bookmark,
  Calendar,
  Edit3,
  Eye,
  Globe,
  Layout,
  Lock,
  Mail,
  Share2,
  Shield,
  Trash2,
  UserPlus,
  Video,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Separator } from '@/crd/primitives/separator';
import { Switch } from '@/crd/primitives/switch';

export type SpacePrivacy = 'public' | 'private';
export type MembershipPolicy = 'open' | 'application' | 'invitation';
/** Space-level user-information visibility (feature 008). */
export type UserInfoVisibility = 'followSpace' | 'membersOnly';

export type AllowedActionKey =
  | 'subspaceAdminInvitations'
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'
  | 'inheritMembershipRights'
  | 'subspaceEvents'
  | 'alkemioSupportAccess'
  | 'trustHostOrganization';

const ACTIONS_VISIBLE_AT_L0 = new Set<AllowedActionKey>([
  'subspaceAdminInvitations',
  'memberCreatePosts',
  'videoCalls',
  'guestContributions',
  'memberCreateSubspaces',
  'subspaceEvents',
  'alkemioSupportAccess',
]);

const ACTIONS_VISIBLE_AT_L1 = new Set<AllowedActionKey>([
  'subspaceAdminInvitations',
  'memberCreatePosts',
  'videoCalls',
  'guestContributions',
  'memberCreateSubspaces',
  'inheritMembershipRights',
]);

const ACTIONS_VISIBLE_AT_L2 = new Set<AllowedActionKey>([
  'memberCreatePosts',
  'videoCalls',
  'guestContributions',
  'inheritMembershipRights',
]);

function isActionVisibleAtLevel(level: 'L0' | 'L1' | 'L2', key: AllowedActionKey): boolean {
  if (level === 'L1') return ACTIONS_VISIBLE_AT_L1.has(key);
  if (level === 'L2') return ACTIONS_VISIBLE_AT_L2.has(key);
  return ACTIONS_VISIBLE_AT_L0.has(key);
}

export type AllowedActionToggle = {
  key: AllowedActionKey;
  enabled: boolean;
};

export type SpaceSettingsSettingsViewProps = {
  /**
   * Space hierarchy level. Drives which member-action toggles are visible:
   * - L0: hides "Inherit Membership Rights" (only meaningful inside subspaces).
   * - L2: hides "Subspace Membership", "Create Subspaces", "Subspace Events"
   *   (a sub-subspace cannot have child subspaces).
   */
  level: 'L0' | 'L1' | 'L2';
  privacy: SpacePrivacy;
  /** User-information visibility (feature 008). Admin-gated; enforcement is server-side. */
  userInfoVisibility: UserInfoVisibility;
  onUserInfoVisibilityChange: (next: UserInfoVisibility) => void;
  membershipPolicy: MembershipPolicy;
  allowedActions: AllowedActionToggle[];
  hostOrganizationTrusted: boolean;
  providerDisplayName: string;
  loading?: boolean;
  /** Locks every control while the tab's changes are being saved (FR-025d). */
  disabled?: boolean;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onMembershipPolicyChange: (next: MembershipPolicy) => void;
  onToggleAllowedAction: (key: AllowedActionKey, next: boolean) => void;
  onHostOrgTrustChange: (next: boolean) => void;
  /**
   * Subspace-only (L1/L2) "Save as a template" action. When provided, a section
   * is rendered at the bottom of the tab; the consumer wires the create-template
   * flow. Omitted at L0 (a top-level space templates its subspaces from the
   * Subspaces tab, not itself).
   */
  onSaveAsTemplate?: () => void;
  /**
   * Subspace-only (L1/L2) delete danger zone. When provided, a destructive
   * section is rendered at the bottom of the tab; the consumer confirms and
   * fires the delete. Omitted at L0 (deletion lives in the Account tab).
   */
  onDeleteSpace?: () => void;
  className?: string;
};

const ACTION_META: Record<AllowedActionKey, { label: string; description: string; icon: React.ElementType }> = {
  subspaceAdminInvitations: {
    label: 'Subspace Membership',
    description: 'Let Subspaces bring in their own members. They become members here too.',
    icon: UserPlus,
  },
  memberCreatePosts: {
    label: 'Create Posts',
    description: 'Allow members to create posts in the community.',
    icon: Edit3,
  },
  videoCalls: { label: 'Video Calls', description: 'Show video call button for Jitsi conferences.', icon: Video },
  guestContributions: {
    label: 'Guest Contributions',
    description: 'Allow whiteboards to be shared with non-members.',
    icon: Share2,
  },
  memberCreateSubspaces: {
    label: 'Create Subspaces',
    description: 'Allow members to create Subspaces in this Space.',
    icon: Layout,
  },
  inheritMembershipRights: {
    label: 'Inherit Membership Rights',
    description: 'Members of the parent Space automatically gain access to this Subspace.',
    icon: UserPlus,
  },
  subspaceEvents: {
    label: 'Subspace Events',
    description: 'Allow events from Subspaces to be visible here.',
    icon: Calendar,
  },
  alkemioSupportAccess: {
    label: 'Alkemio Support',
    description: 'Allow Alkemio Support team to act as admin.',
    icon: Shield,
  },
  trustHostOrganization: {
    label: 'Trust Host Organization',
    description: 'Trust the host organization for this space.',
    icon: UserPlus,
  },
};

export function SpaceSettingsSettingsView({
  level,
  privacy,
  userInfoVisibility,
  onUserInfoVisibilityChange,
  membershipPolicy,
  allowedActions,
  hostOrganizationTrusted,
  providerDisplayName,
  disabled = false,
  onPrivacyChange,
  onMembershipPolicyChange,
  onToggleAllowedAction,
  onHostOrgTrustChange,
  onSaveAsTemplate,
  onDeleteSpace,
  className,
}: SpaceSettingsSettingsViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const visibleActions = allowedActions.filter(action => isActionVisibleAtLevel(level, action.key));

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <SettingsSection title={t('settings.visibility.title')} icon={<Eye className="size-4" />} iconColor="blue">
        <RadioGroup
          value={privacy}
          onValueChange={v => onPrivacyChange(v as SpacePrivacy)}
          className="space-y-4"
          disabled={disabled}
        >
          <label
            htmlFor="visibility-public"
            className={cn(
              'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
              disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
            )}
          >
            <RadioGroupItem value="public" id="visibility-public" className="mt-1" />
            <div className="space-y-1">
              <span className="text-card-title flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                {t('settings.visibility.public')}
              </span>
              <p className="text-body text-muted-foreground">{t('settings.visibility.publicDescription')}</p>
            </div>
          </label>
          <label
            htmlFor="visibility-private"
            className={cn(
              'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
              disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
            )}
          >
            <RadioGroupItem value="private" id="visibility-private" className="mt-1" />
            <div className="space-y-1">
              <span className="text-card-title flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                {t('settings.visibility.private')}
              </span>
              <p className="text-body text-muted-foreground">{t('settings.visibility.privateDescription')}</p>
            </div>
          </label>
        </RadioGroup>
        <p className="text-caption text-muted-foreground mt-4 italic">{t('settings.visibility.hint')}</p>

        {/* User-information visibility (feature 008). Enforcement is
                server-side; this only configures + reflects the setting. */}
        <Separator className="my-4" />
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-card-title">{t('settings.userInfoVisibility.title')}</h4>
            <p className="text-body text-muted-foreground">{t('settings.userInfoVisibility.description')}</p>
          </div>
          <RadioGroup
            value={userInfoVisibility}
            onValueChange={v => onUserInfoVisibilityChange(v as UserInfoVisibility)}
            className="space-y-3"
            disabled={disabled}
          >
            {(['followSpace', 'membersOnly'] as const).map(option => {
              const inputId = `user-info-${option}`;
              return (
                <label
                  key={option}
                  htmlFor={inputId}
                  className={cn(
                    'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                    disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                  )}
                >
                  <RadioGroupItem value={option} id={inputId} className="mt-1" />
                  <div className="space-y-1">
                    <span className="text-card-title flex items-center gap-2">
                      {option === 'membersOnly' ? (
                        <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Globe className="size-4 text-primary" aria-hidden="true" />
                      )}
                      {t(`settings.userInfoVisibility.${option}` as 'settings.userInfoVisibility.followSpace')}
                    </span>
                    <p className="text-body text-muted-foreground">
                      {t(
                        `settings.userInfoVisibility.${option}Description` as 'settings.userInfoVisibility.followSpaceDescription'
                      )}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </SettingsSection>

      <SettingsSection title={t('settings.membership.title')} icon={<UserPlus className="size-4" />} iconColor="green">
        <RadioGroup
          value={membershipPolicy}
          onValueChange={v => onMembershipPolicyChange(v as MembershipPolicy)}
          className="space-y-4"
          disabled={disabled}
        >
          <label
            htmlFor="membership-open"
            className={cn(
              'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
              disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
            )}
          >
            <RadioGroupItem value="open" id="membership-open" className="mt-1" />
            <div className="space-y-1">
              <span className="text-card-title flex items-center gap-2">
                <UserPlus className="size-4 text-primary" />
                {t('settings.membership.open')}
              </span>
              <p className="text-body text-muted-foreground">{t('settings.membership.openDescription')}</p>
              <p className="text-caption text-muted-foreground italic mt-1">{t('settings.membership.openHint')}</p>
            </div>
          </label>
          <label
            htmlFor="membership-application"
            className={cn(
              'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
              disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
            )}
          >
            <RadioGroupItem value="application" id="membership-application" className="mt-1" />
            <div className="space-y-1">
              <span className="text-card-title flex items-center gap-2">
                <Edit3 className="size-4 text-primary" />
                {t('settings.membership.application')}
              </span>
              <p className="text-body text-muted-foreground">{t('settings.membership.applicationDescription')}</p>
              <p className="text-caption text-muted-foreground italic mt-1">
                {t('settings.membership.applicationHint')}
              </p>
            </div>
          </label>
          <label
            htmlFor="membership-invitation"
            className={cn(
              'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
              disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
            )}
          >
            <RadioGroupItem value="invitation" id="membership-invitation" className="mt-1" />
            <div className="space-y-1">
              <span className="text-card-title flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                {t('settings.membership.invitation')}
              </span>
              <p className="text-body text-muted-foreground">{t('settings.membership.invitationDescription')}</p>
              <p className="text-caption text-muted-foreground italic mt-1">
                {t('settings.membership.invitationHint')}
              </p>
            </div>
          </label>
        </RadioGroup>

        {/* Trust host organization toggle */}
        {providerDisplayName && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <Label htmlFor="host-org-trust" className="text-body-emphasis">
                {t('settings.membership.trustedApplicants')}
              </Label>
              <p className="text-caption text-muted-foreground">
                {t('settings.membership.hostOrgTrust', { host: providerDisplayName })}
              </p>
            </div>
            <Switch
              id="host-org-trust"
              checked={hostOrganizationTrusted}
              onCheckedChange={onHostOrgTrustChange}
              disabled={disabled}
            />
          </div>
        )}
      </SettingsSection>

      <SettingsSection title={t('settings.allowedActions.title')} icon={<Zap className="size-4" />} iconColor="amber">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleActions.map(action => {
            const meta = ACTION_META[action.key];
            if (!meta) return null;
            const ActionIcon = meta.icon;
            return (
              <div
                key={action.key}
                className={cn(
                  'flex items-start justify-between space-x-4 p-3 rounded-lg border bg-muted/20',
                  disabled && 'opacity-70'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-muted-foreground">
                    <ActionIcon className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={`action-${action.key}`} className="text-body-emphasis cursor-pointer">
                      {t(`settings.allowedActions.${action.key}`)}
                    </Label>
                    <p className="text-caption text-muted-foreground leading-snug">
                      {t(`settings.allowedActions.${action.key}Description`, { defaultValue: meta.description })}
                    </p>
                  </div>
                </div>
                <Switch
                  id={`action-${action.key}`}
                  checked={action.enabled}
                  onCheckedChange={checked => onToggleAllowedAction(action.key, checked)}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* Save as a template — subspaces (L1/L2) only; the consumer omits the handler at L0. */}
      {onSaveAsTemplate && (
        <SettingsSection
          title={t('settings.saveAsTemplate.title')}
          icon={<Bookmark className="size-4" />}
          iconColor="purple"
          collapsible={false}
        >
          <p className="text-body text-muted-foreground">{t('settings.saveAsTemplate.description')}</p>
          <Button type="button" variant="default" size="sm" className="mt-3" onClick={onSaveAsTemplate}>
            <Bookmark aria-hidden="true" className="mr-1.5 size-3.5" />
            {t('settings.saveAsTemplate.button')}
          </Button>
        </SettingsSection>
      )}

      {/* Danger zone (delete subspace) — subspaces (L1/L2) only; the consumer omits the handler at L0. */}
      {onDeleteSpace && (
        <SettingsSection
          title={t('settings.dangerZone.title')}
          icon={<AlertTriangle className="size-4" />}
          iconColor="rose"
          defaultOpen={false}
          className="border-destructive/40"
        >
          <p className="text-body text-muted-foreground">{t('settings.dangerZone.description')}</p>
          <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onDeleteSpace}>
            <Trash2 aria-hidden="true" className="mr-1.5 size-3.5" />
            {t('settings.dangerZone.delete')}
          </Button>
        </SettingsSection>
      )}
    </div>
  );
}
