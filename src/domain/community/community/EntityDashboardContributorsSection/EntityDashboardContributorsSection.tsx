import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardContributors } from './Types';
import DashboardContributingUsers from './DashboardContributingUsers';
import DashboardContributingOrganizations from './DashboardContributingOrganizations';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle } from '@/core/ui/typography';
import EllipsableWithCount from '@/core/ui/typography/EllipsableWithCount';

const EntityDashboardContributorsSection = ({
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  children,
}: PropsWithChildren<EntityDashboardContributors>) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('contributors-section.title')} />
      <BlockSectionTitle>
        <EllipsableWithCount count={memberOrganizationsCount}>{t('common.organizations')}</EllipsableWithCount>
      </BlockSectionTitle>
      <DashboardContributingOrganizations organizations={memberOrganizations} />
      <BlockSectionTitle>
        <EllipsableWithCount count={memberUsersCount}>{t('common.users')}</EllipsableWithCount>
      </BlockSectionTitle>
      <DashboardContributingUsers users={memberUsers} />
      {children}
    </PageContentBlock>
  );
};

export default EntityDashboardContributorsSection;
