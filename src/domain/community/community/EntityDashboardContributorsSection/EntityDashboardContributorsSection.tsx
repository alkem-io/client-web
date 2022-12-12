import React from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardContributors } from './Types';
import DashboardContributingUsers from './DashboardContributingUsers';
import DashboardContributingOrganizations from './DashboardContributingOrganizations';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import withOptionalCount from '../../../shared/utils/withOptionalCount';

const EntityDashboardContributorsSection = ({
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
}: EntityDashboardContributors) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('contributors-section.title')} />
      <BlockSectionTitle>{withOptionalCount(t('common.organizations'), memberOrganizationsCount)}</BlockSectionTitle>
      <DashboardContributingOrganizations organizations={memberOrganizations} />
      <BlockSectionTitle>{withOptionalCount(t('common.users'), memberUsersCount)}</BlockSectionTitle>
      <DashboardContributingUsers users={memberUsers} />
      <SeeMore subject={t('common.contributors')} to={`${EntityPageSection.Dashboard}/contributors`} />
    </PageContentBlock>
  );
};

export default EntityDashboardContributorsSection;
