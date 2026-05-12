import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  type RoleAssignmentLabels,
  type RoleAssignmentPerson,
  RoleAssignmentView,
} from '@/crd/components/contributor/settings/RoleAssignmentView';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';

const NS = 'crd-contributorSettings';

export type OrgCommunityTabViewProps = {
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

/**
 * Org Community tab — presentational view (US10 / Decision #5).
 * Composes the shared `RoleAssignmentView` for the `Associate` role
 * with role-aware confirm copy (the parent integration page renders the
 * actual `ConfirmationDialog` with `"Remove {{name}} as Associate"`).
 */
export function OrgCommunityTabView(props: OrgCommunityTabViewProps) {
  const { t } = useTranslation(NS);

  const labels: RoleAssignmentLabels = {
    currentTitle: t('org.community.currentAssociatesTitle'),
    availableTitle: t('org.community.availableUsersTitle'),
    searchPlaceholder: t('org.community.searchPlaceholder'),
    removeAriaLabel: t('org.community.removeAriaLabel'),
    addAriaLabel: t('org.community.addAriaLabel'),
    loadMoreLabel: t('org.community.loadMore'),
    emptyCurrentLabel: t('org.community.emptyCurrent'),
    emptyAvailableLabel: t('org.community.emptyAvailable'),
  };

  return (
    <SettingsCard icon={Users} title={t('org.community.title')} description={t('org.community.description')}>
      <RoleAssignmentView
        current={props.current}
        available={props.available}
        searchTerm={props.searchTerm}
        onSearchChange={props.onSearchChange}
        onAdd={props.onAdd}
        onRequestRemove={props.onRequestRemove}
        onLoadMore={props.onLoadMore}
        hasMore={props.hasMore}
        loadingCurrent={props.loadingCurrent}
        loadingAvailable={props.loadingAvailable}
        updating={props.updating}
        labels={labels}
      />
    </SettingsCard>
  );
}
