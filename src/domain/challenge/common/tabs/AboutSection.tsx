import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import {
  AssociatedOrganizationDetailsFragment,
  LifecycleContextTabFragment,
  ReferenceDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContent from '../../../../core/ui/content/PageContent';
import { Tagline, Text } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { LifecycleState } from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import { ApplicationButton } from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import ActivityView from '../../../platform/metrics/views/MetricsView';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import References from '../../../../common/components/composite/common/References/References';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

type JourneyTypeName = 'hub' | 'challenge' | 'opportunity';

interface AboutSectionProps {
  entityTypeName: JourneyTypeName;
  infoBlockTitle: string;
  infoBlockText: string | undefined;
  tags: string[] | undefined;
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  loading?: boolean;
  error?: ApolloError;
  communityReadAccess: boolean;
  leadOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  leadUsers: EntityDashboardLeads['leadUsers'];
  memberUsers: EntityDashboardContributors['memberUsers'];
  memberUsersCount: EntityDashboardContributors['memberUsersCount'];
  memberOrganizations: EntityDashboardContributors['memberOrganizations'];
  memberOrganizationsCount: EntityDashboardContributors['memberOrganizationsCount'];
  hubNameId: string | undefined;
  communityId: string | undefined;
  references: ReferenceDetailsFragment[] | undefined;
  metricsItems: MetricItem[];
  lifecycle?: LifecycleContextTabFragment;
}

const BLOCK_HEIGHT = 260;

const RightColumn = styled(props => <PageContentColumn {...props} columns={8} />)(() => ({}));
const LeftColumn = styled(props => <PageContentColumn {...props} columns={4} />)(() => ({}));
/**
 * todos
 * - info block tags
 * - loading
 * - error
 */
export const AboutSection: FC<AboutSectionProps> = ({
  entityTypeName,
  infoBlockTitle,
  infoBlockText,
  tags = [],
  vision = '',
  background = '',
  impact = '',
  who = '',
  loading = false,
  communityReadAccess,
  leadUsers,
  leadOrganizations,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  hubNameId,
  communityId,
  references,
  metricsItems,
  lifecycle,
}) => {
  const { t } = useTranslation();

  const isHub = entityTypeName === 'hub';
  const organizationsHeader = isHub ? 'pages.hub.sections.dashboard.organization' : 'community.leading-organizations';
  const usersHeader = isHub ? 'community.host' : 'community.leads';

  return (
    <>
      <PageContent>
        <LeftColumn>
          <PageContentBlock accent>
            <Text>{infoBlockTitle}</Text>
            <Tagline>{infoBlockText}</Tagline>
            <TagsComponent tags={tags} variant="filled" loading={loading} />
            <Box display="flex" justifyContent="end" gap={1}>
              {lifecycle && <LifecycleState lifecycle={lifecycle} />}
              <ApplicationButtonContainer>
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            </Box>
          </PageContentBlock>
          {communityReadAccess && (
            <EntityDashboardLeadsSection
              organizationsHeader={t(organizationsHeader)}
              usersHeader={t(usersHeader)}
              leadUsers={leadUsers}
              leadOrganizations={leadOrganizations}
            />
          )}
          {communityReadAccess && (
            <EntityDashboardContributorsSection
              memberUsers={memberUsers}
              memberUsersCount={memberUsersCount}
              memberOrganizations={memberOrganizations}
              memberOrganizationsCount={memberOrganizationsCount}
            />
          )}
          {!communityReadAccess && (
            <PageContentBlock halfWidth>
              <Text>{t('pages.hub.sections.dashboard.activity')}</Text>
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </LeftColumn>
        <RightColumn>
          <PageContentBlock sx={{ height: BLOCK_HEIGHT }}>
            <Text>{t(`context.${entityTypeName}.vision.title` as const)}</Text>
            <WrapperMarkdown>{vision}</WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock sx={{ height: BLOCK_HEIGHT }}>
            <Text>{t(`context.${entityTypeName}.background.title` as const)}</Text>
            <WrapperMarkdown>{background}</WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock halfWidth sx={{ height: BLOCK_HEIGHT }}>
            <Text>{t(`context.${entityTypeName}.impact.title` as const)}</Text>
            <WrapperMarkdown>{impact}</WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock halfWidth sx={{ height: BLOCK_HEIGHT }}>
            <Text>{t(`context.${entityTypeName}.who.title` as const)}</Text>
            <WrapperMarkdown>{who}</WrapperMarkdown>
          </PageContentBlock>
          {communityReadAccess && <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />}
          <PageContentBlock halfWidth>
            <PageContentBlockHeader title={t('common.references')} />
            <References references={references} noItemsView={t('common.no-references')} />
          </PageContentBlock>
          {communityReadAccess && (
            <PageContentBlock halfWidth>
              <Text>{t('pages.hub.sections.dashboard.activity')}</Text>
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </RightColumn>
      </PageContent>
    </>
  );
};
