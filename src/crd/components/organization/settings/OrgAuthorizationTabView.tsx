import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  type RoleAssignmentLabels,
  type RoleAssignmentPerson,
  RoleAssignmentView,
} from '@/crd/components/contributor/settings/RoleAssignmentView';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/crd/primitives/tabs';

const NS = 'crd-contributorSettings';

export type AuthorizationSubTab = 'admin' | 'owner';

export type OrgAuthorizationRoleSlot = {
  current: RoleAssignmentPerson[];
  available: RoleAssignmentPerson[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAdd: (id: string) => void;
  onRequestRemove: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingCurrent: boolean;
  loadingAvailable: boolean;
  updating: boolean;
};

export type OrgAuthorizationTabViewProps = {
  activeSubTab: AuthorizationSubTab;
  onSubTabChange: (next: AuthorizationSubTab) => void;
  admin: OrgAuthorizationRoleSlot;
  owner: OrgAuthorizationRoleSlot;
};

/**
 * Org Authorization tab — presentational view (US11).
 *
 * Two sub-tabs (Admin / Owner) held in **local React state**, no URL sync
 * per FR-120. The integration page owns the active-tab state and the
 * destructive `ConfirmationDialog`s for each role; this view just
 * composes two `RoleAssignmentView` instances behind the sub-tab strip.
 *
 * Sub-tab strip is keyboard-navigable per FR-152 (Radix `Tabs` primitive
 * provides Tab → Left/Right arrows → Enter activation natively).
 */
export function OrgAuthorizationTabView(props: OrgAuthorizationTabViewProps) {
  const { t } = useTranslation(NS);

  const adminLabels: RoleAssignmentLabels = {
    currentTitle: t('org.authorization.admin.currentTitle'),
    availableTitle: t('org.authorization.admin.availableTitle'),
    searchPlaceholder: t('org.authorization.admin.searchPlaceholder'),
    addAriaLabel: t('org.authorization.admin.addAriaLabel'),
    removeAriaLabel: t('org.authorization.admin.removeAriaLabel'),
    loadMoreLabel: t('org.authorization.loadMore'),
    emptyCurrentLabel: t('org.authorization.admin.emptyCurrent'),
    emptyAvailableLabel: t('org.authorization.admin.emptyAvailable'),
  };

  const ownerLabels: RoleAssignmentLabels = {
    currentTitle: t('org.authorization.owner.currentTitle'),
    availableTitle: t('org.authorization.owner.availableTitle'),
    searchPlaceholder: t('org.authorization.owner.searchPlaceholder'),
    addAriaLabel: t('org.authorization.owner.addAriaLabel'),
    removeAriaLabel: t('org.authorization.owner.removeAriaLabel'),
    loadMoreLabel: t('org.authorization.loadMore'),
    emptyCurrentLabel: t('org.authorization.owner.emptyCurrent'),
    emptyAvailableLabel: t('org.authorization.owner.emptyAvailable'),
  };

  return (
    <SettingsCard
      icon={ShieldCheck}
      title={t('org.authorization.title')}
      description={t('org.authorization.description')}
    >
      <Tabs value={props.activeSubTab} onValueChange={value => props.onSubTabChange(value as AuthorizationSubTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="admin">{t('org.authorization.adminTabLabel')}</TabsTrigger>
          <TabsTrigger value="owner">{t('org.authorization.ownerTabLabel')}</TabsTrigger>
        </TabsList>
        <TabsContent value="admin">
          <RoleAssignmentView
            current={props.admin.current}
            available={props.admin.available}
            searchTerm={props.admin.searchTerm}
            onSearchChange={props.admin.onSearchChange}
            onAdd={props.admin.onAdd}
            onRequestRemove={props.admin.onRequestRemove}
            onLoadMore={props.admin.onLoadMore}
            hasMore={props.admin.hasMore}
            loadingCurrent={props.admin.loadingCurrent}
            loadingAvailable={props.admin.loadingAvailable}
            updating={props.admin.updating}
            labels={adminLabels}
          />
        </TabsContent>
        <TabsContent value="owner">
          <RoleAssignmentView
            current={props.owner.current}
            available={props.owner.available}
            searchTerm={props.owner.searchTerm}
            onSearchChange={props.owner.onSearchChange}
            onAdd={props.owner.onAdd}
            onRequestRemove={props.owner.onRequestRemove}
            onLoadMore={props.owner.onLoadMore}
            hasMore={props.owner.hasMore}
            loadingCurrent={props.owner.loadingCurrent}
            loadingAvailable={props.owner.loadingAvailable}
            updating={props.owner.updating}
            labels={ownerLabels}
          />
        </TabsContent>
      </Tabs>
    </SettingsCard>
  );
}
