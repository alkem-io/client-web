import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import { useAdminVirtualContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import RouterLink from '../../../../core/ui/link/RouterLink';
import Loading from '../../../../core/ui/loading/Loading';

const VirtualContributorsPage: FC = () => {
  const { t } = useTranslation();
  const { data, loading: loadingVCs } = useAdminVirtualContributorsQuery();

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <PageContentBlockSeamless disablePadding>
        <BlockTitle>{t('pages.admin.virtualContributors.title')}</BlockTitle>
        {loadingVCs && <Loading />}
        {data?.virtualContributors.map(virtualContributor => (
          <BadgeCardView
            key={virtualContributor.id}
            outlined
            visual={
              <Avatar
                src={virtualContributor.profile.avatar?.uri}
                alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
              />
            }
            component={RouterLink}
            to={virtualContributor.profile.url}
          >
            <BlockTitle>{virtualContributor.profile.displayName}</BlockTitle>
          </BadgeCardView>
        ))}
      </PageContentBlockSeamless>
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
