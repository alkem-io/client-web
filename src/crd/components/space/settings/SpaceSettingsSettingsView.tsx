import { Calendar, Edit3, Globe, Layout, Loader2, Lock, Mail, Share2, Shield, UserPlus, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/crd/primitives/accordion';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Separator } from '@/crd/primitives/separator';
import { Switch } from '@/crd/primitives/switch';

export type SpacePrivacy = 'public' | 'private';
export type MembershipPolicy = 'open' | 'application' | 'invitation';

export type AllowedActionKey =
  | 'subspaceAdminInvitations'
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'
  | 'subspaceEvents'
  | 'alkemioSupportAccess'
  | 'trustHostOrganization';

export type AllowedActionToggle = {
  key: AllowedActionKey;
  enabled: boolean;
};

export type SpaceSettingsSettingsViewProps = {
  privacy: SpacePrivacy;
  membershipPolicy: MembershipPolicy;
  allowedActions: AllowedActionToggle[];
  hostOrganizationTrusted: boolean;
  providerDisplayName: string;
  loading?: boolean;
  updatingKeys: ReadonlySet<string>;
  /** Slot for the Application Form editor (MUI component passed from integration layer). */
  applicationFormSlot?: React.ReactNode;
  onPrivacyChange: (next: SpacePrivacy) => void;
  onMembershipPolicyChange: (next: MembershipPolicy) => void;
  onToggleAllowedAction: (key: AllowedActionKey, next: boolean) => void;
  onHostOrgTrustChange: (next: boolean) => void;
  className?: string;
};

const ACTION_META: Record<AllowedActionKey, { label: string; description: string; icon: React.ElementType }> = {
  subspaceAdminInvitations: {
    label: 'Space Invitations',
    description: 'Allow admins of Subspaces to invite users to their Subspace.',
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
  privacy,
  membershipPolicy,
  allowedActions,
  hostOrganizationTrusted,
  providerDisplayName,
  updatingKeys,
  applicationFormSlot,
  onPrivacyChange,
  onMembershipPolicyChange,
  onToggleAllowedAction,
  onHostOrgTrustChange,
  className,
}: SpaceSettingsSettingsViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const hasPrefix = (prefix: string) => [...updatingKeys].some(k => k.startsWith(prefix));
  const privacyBusy = hasPrefix('privacy:');
  const membershipBusy = hasPrefix('membership:');

  return (
    <div className={cn('space-y-6 max-w-4xl mx-auto', className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('settings.pageHeader.title', { defaultValue: 'Settings' })}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('settings.pageHeader.subtitle', {
            defaultValue: "Configure your space's visibility, membership policies, and allowed member actions.",
          })}
        </p>
      </div>

      <Separator />

      <Accordion
        type="multiple"
        defaultValue={['visibility', 'membership', 'applicationForm', 'actions']}
        className="w-full space-y-4"
      >
        {/* Visibility */}
        <AccordionItem value="visibility" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">
                {t('settings.visibility.title', { defaultValue: 'Visibility' })}
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                {t('settings.visibility.description', { defaultValue: 'Control who can see and access this space' })}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup
              value={privacy}
              onValueChange={v => onPrivacyChange(v as SpacePrivacy)}
              className="space-y-4"
              disabled={privacyBusy}
            >
              <label
                htmlFor="visibility-public"
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                  privacyBusy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                )}
              >
                {updatingKeys.has('privacy:public') ? (
                  <Loader2 className="size-4 mt-1 animate-spin text-primary shrink-0" />
                ) : (
                  <RadioGroupItem value="public" id="visibility-public" className="mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-base font-medium flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    {t('settings.visibility.public', { defaultValue: 'Public' })}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('settings.visibility.publicDescription', {
                      defaultValue:
                        'This Space and its contents are visible to everyone on the platform. Users can only contribute if they are a member.',
                    })}
                  </p>
                </div>
              </label>
              <label
                htmlFor="visibility-private"
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                  privacyBusy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                )}
              >
                {updatingKeys.has('privacy:private') ? (
                  <Loader2 className="size-4 mt-1 animate-spin text-primary shrink-0" />
                ) : (
                  <RadioGroupItem value="private" id="visibility-private" className="mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-base font-medium flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground" />
                    {t('settings.visibility.private', { defaultValue: 'Private' })}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('settings.visibility.privateDescription', {
                      defaultValue:
                        'This Space is visible to everyone on the platform, but the content is only visible to members.',
                    })}
                  </p>
                </div>
              </label>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-4 italic">
              {t('settings.visibility.hint', {
                defaultValue: "Consider your space's purpose and audience when choosing visibility.",
              })}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Membership */}
        <AccordionItem value="membership" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">
                {t('settings.membership.title', { defaultValue: 'Membership' })}
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                {t('settings.membership.description', { defaultValue: 'Choose how users join your space' })}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup
              value={membershipPolicy}
              onValueChange={v => onMembershipPolicyChange(v as MembershipPolicy)}
              className="space-y-4"
              disabled={membershipBusy}
            >
              <label
                htmlFor="membership-open"
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                  membershipBusy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                )}
              >
                {updatingKeys.has('membership:open') ? (
                  <Loader2 className="size-4 mt-1 animate-spin text-primary shrink-0" />
                ) : (
                  <RadioGroupItem value="open" id="membership-open" className="mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-base font-medium flex items-center gap-2">
                    <UserPlus className="size-4 text-primary" />
                    {t('settings.membership.open', { defaultValue: 'No Application Required' })}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('settings.membership.openDescription', {
                      defaultValue:
                        'All Space members can directly join, without you having to review their applications.',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {t('settings.membership.openHint', { defaultValue: 'Best for public, open collaboration spaces' })}
                  </p>
                </div>
              </label>
              <label
                htmlFor="membership-application"
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                  membershipBusy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                )}
              >
                {updatingKeys.has('membership:application') ? (
                  <Loader2 className="size-4 mt-1 animate-spin text-primary shrink-0" />
                ) : (
                  <RadioGroupItem value="application" id="membership-application" className="mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-base font-medium flex items-center gap-2">
                    <Edit3 className="size-4 text-primary" />
                    {t('settings.membership.application', { defaultValue: 'Application Required' })}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('settings.membership.applicationDescription', {
                      defaultValue:
                        'If people want to become a member, they have to fill in the application form. You receive their applications (see community tab here) and you can accept them or reject them.',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {t('settings.membership.applicationHint', {
                      defaultValue: 'Best for curated spaces with specific requirements',
                    })}
                  </p>
                </div>
              </label>
              <label
                htmlFor="membership-invitation"
                className={cn(
                  'flex items-start space-x-3 p-4 rounded-md border bg-muted/20 transition-colors',
                  membershipBusy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'
                )}
              >
                {updatingKeys.has('membership:invitation') ? (
                  <Loader2 className="size-4 mt-1 animate-spin text-primary shrink-0" />
                ) : (
                  <RadioGroupItem value="invitation" id="membership-invitation" className="mt-1" />
                )}
                <div className="space-y-1">
                  <span className="text-base font-medium flex items-center gap-2">
                    <Mail className="size-4 text-primary" />
                    {t('settings.membership.invitation', { defaultValue: 'Invitation Only' })}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('settings.membership.invitationDescription', {
                      defaultValue:
                        "Users can only become a member after you've invited them. There is no 'apply' or 'join' button for others to click.",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {t('settings.membership.invitationHint', {
                      defaultValue: 'Best for private, restricted collaboration teams',
                    })}
                  </p>
                </div>
              </label>
            </RadioGroup>

            {/* Trust host organization toggle */}
            {providerDisplayName && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between space-x-4">
                  <div className="space-y-1">
                    <Label htmlFor="host-org-trust" className="text-sm font-medium">
                      {t('settings.membership.trustedApplicants', { defaultValue: 'Trusted Applicants' })}
                    </Label>
                    <p className="text-xs text-muted-foreground max-w-md">
                      {t('settings.membership.hostOrgTrust', {
                        defaultValue: 'Allow members of {{host}} to join this Space without an application.',
                        host: providerDisplayName,
                      })}
                    </p>
                  </div>
                  {updatingKeys.has('membership:hostTrust') ? (
                    <Loader2 className="size-5 animate-spin text-primary shrink-0" />
                  ) : (
                    <Switch
                      id="host-org-trust"
                      checked={hostOrganizationTrusted}
                      onCheckedChange={onHostOrgTrustChange}
                    />
                  )}
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Application Form */}
        {applicationFormSlot && (
          <AccordionItem value="applicationForm" className="border rounded-lg bg-card px-6">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-lg font-semibold">
                  {t('settings.applicationForm.title', { defaultValue: 'Application Form' })}
                </h3>
                <p className="text-sm text-muted-foreground font-normal text-left">
                  {t('settings.applicationForm.description', {
                    defaultValue: 'Configure the questions shown to users who apply to join this space.',
                  })}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-0">{applicationFormSlot}</AccordionContent>
          </AccordionItem>
        )}

        {/* Allowed Actions */}
        <AccordionItem value="actions" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">
                {t('settings.allowedActions.title', { defaultValue: 'Allowed Actions' })}
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                {t('settings.allowedActions.description', {
                  defaultValue: 'Choose which actions members can perform in this space',
                })}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allowedActions.map(action => {
                const meta = ACTION_META[action.key];
                if (!meta) return null;
                const ActionIcon = meta.icon;
                const isBusy = updatingKeys.has(`action:${action.key}`);
                return (
                  <div
                    key={action.key}
                    className={cn(
                      'flex items-start justify-between space-x-4 p-3 rounded-lg border bg-muted/20',
                      isBusy && 'opacity-70'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <ActionIcon className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor={`action-${action.key}`} className="text-base font-medium cursor-pointer">
                          {t(`settings.allowedActions.${action.key}`, { defaultValue: meta.label })}
                        </Label>
                        <p className="text-xs text-muted-foreground leading-snug max-w-[200px] sm:max-w-xs">
                          {meta.description}
                        </p>
                      </div>
                    </div>
                    {isBusy ? (
                      <Loader2 className="size-5 animate-spin text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Switch
                        id={`action-${action.key}`}
                        checked={action.enabled}
                        onCheckedChange={checked => onToggleAllowedAction(action.key, checked)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
