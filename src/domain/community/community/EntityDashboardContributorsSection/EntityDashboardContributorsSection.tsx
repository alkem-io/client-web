import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardContributors } from './Types';
import DashboardContributingUsers from './DashboardContributingUsers';
import DashboardContributingOrganizations from './DashboardContributingOrganizations';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle } from '@/core/ui/typography';
import withOptionalCount from '../../../shared/utils/withOptionalCount';

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
      <BlockSectionTitle>{withOptionalCount(t('common.organizations'), memberOrganizationsCount)}</BlockSectionTitle>
      <DashboardContributingOrganizations organizations={memberOrganizations} />
      <BlockSectionTitle>{withOptionalCount(t('common.users'), memberUsersCount)}</BlockSectionTitle>
      <DashboardContributingUsers users={memberUsers} />
      {children}
    </PageContentBlock>
  );
};

export default EntityDashboardContributorsSection;
