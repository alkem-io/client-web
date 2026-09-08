import { Pencil, UserPlus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import {
  type PendingMembership,
  PendingMembershipsTable,
} from '@/crd/components/space/settings/PendingMembershipsTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type OrgAssociateListRow = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  subtitle?: string;
  color: string;
  isAssociate: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

export type OrgAssociatesTabViewProps = {
  associates: OrgAssociateListRow[];
  loading: boolean;
  canManage: boolean;
  manageDisabledReason?: string;
  onEdit: (id: string) => void;
  onInvite: () => void;

  pending: PendingMembership[];
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingRevoke: (id: string) => void;
  onPendingView: (id: string) => void;

  allowUsersMatchingDomainToJoin: boolean;
  allowApplications: boolean;
  switchesSaving: boolean;
  onToggleAllowDomain: (next: boolean) => void;
  onToggleAllowApplications: (next: boolean) => void;
};

const NS = 'crd-contributorSettings';

export function OrgAssociatesTabView({
  associates,
  loading,
  canManage,
  manageDisabledReason,
  onEdit,
  onInvite,
  pending,
  onPendingApprove,
  onPendingReject,
  onPendingRevoke,
  onPendingView,
  allowUsersMatchingDomainToJoin,
  allowApplications,
  switchesSaving,
  onToggleAllowDomain,
  onToggleAllowApplications,
}: OrgAssociatesTabViewProps) {
  const { t } = useTranslation(NS);

  const inviteButton = (
    <Button type="button" size="sm" className="gap-2" onClick={onInvite} disabled={!canManage}>
      <UserPlus className="size-4" aria-hidden="true" />
      {t('org.associates.invite')}
    </Button>
  );

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Users}
        title={t('org.associates.title')}
        description={t('org.associates.description')}
        titleAccessory={
          canManage ? (
            inviteButton
          ) : (
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <span>{inviteButton}</span>
              </TooltipTrigger>
              <TooltipContent>{manageDisabledReason}</TooltipContent>
            </Tooltip>
          )
        }
      >
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : associates.length === 0 ? (
          <p className="text-body text-muted-foreground py-4">{t('org.associates.empty')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {associates.map(row => (
              <li key={row.id} className="flex items-center gap-3 py-3">
                <Avatar className="size-10 shrink-0 border border-border">
                  {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt="" />}
                  <AvatarFallback color={row.color} className="text-white">
                    {row.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-body-emphasis truncate">{row.displayName}</p>
                  {row.subtitle && <p className="text-caption text-muted-foreground truncate">{row.subtitle}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {row.isAssociate && <Badge variant="secondary">{t('org.associates.badge.associate')}</Badge>}
                  {row.isAdmin && <Badge variant="secondary">{t('org.associates.badge.admin')}</Badge>}
                  {row.isOwner && <Badge variant="secondary">{t('org.associates.badge.owner')}</Badge>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onEdit(row.id)}
                  disabled={!canManage}
                  aria-label={t('org.associates.editAriaLabel', { name: row.displayName })}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <PendingMembershipsTable
        items={pending}
        title={t('org.associates.pending.title')}
        onView={onPendingView}
        onApprove={onPendingApprove}
        onReject={onPendingReject}
        onDelete={onPendingRevoke}
      />

      <SettingsCard title={t('org.associates.switches.title')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('org.associates.switches.allowDomainLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('org.associates.switches.allowDomainCaption')}
            </p>
          </div>
          <Switch
            checked={allowUsersMatchingDomainToJoin}
            disabled={switchesSaving}
            onCheckedChange={onToggleAllowDomain}
            aria-label={t('org.associates.switches.allowDomainLabel')}
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('org.associates.switches.allowApplicationsLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('org.associates.switches.allowApplicationsCaption')}
            </p>
          </div>
          <Switch
            checked={allowApplications}
            disabled={switchesSaving}
            onCheckedChange={onToggleAllowApplications}
            aria-label={t('org.associates.switches.allowApplicationsLabel')}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
