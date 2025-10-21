import React, { FC, useMemo } from 'react';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import { usePlatformAdminVirtualContributorsListQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import ListPage from '@/domain/platformAdmin/components/ListPage';
import VirtualContributorListItem from './VirtualContributorListItem';

const VirtualContributorsPage: FC = () => {
  const { data, loading } = usePlatformAdminVirtualContributorsListQuery();

  const virtualContributorsList = useMemo(() => {
    const vcs = data?.platformAdmin.virtualContributors ?? [];

    return vcs.map(vc => {
      const accountOwner = vc.account?.host?.profile?.displayName || 'N/A';

      return {
        id: vc.id,
        value: vc.profile.displayName,
        url: vc.profile.url,
        listedInStore: vc.listedInStore,
        searchVisibility: vc.searchVisibility,
        accountOwner,
      };
    });
  }, [data]);

  if (loading) return <Loading text={'Loading virtual contributors'} />;

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <ListPage data={virtualContributorsList} itemViewComponent={VirtualContributorListItem} />
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
