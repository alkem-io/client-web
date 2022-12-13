import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { styled } from '@mui/material';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import { Tagline, Text } from '../../../../../core/ui/typography';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../core/WrapperMarkdown';
import TagsComponent from '../../../../../domain/shared/components/TagsComponent/TagsComponent';
import EntityDashboardLeadsSection
  from '../../../../../domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import {
  AssociatedOrganizationDetailsFragment, MetricsItemFragment,
  Reference,
  ReferenceDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../../domain/community/community/EntityDashboardContributorsSection/Types';
import EntityDashboardContributorsSection
  from '../../../../../domain/community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import DashboardUpdatesSection from '../../../../../domain/shared/components/DashboardSections/DashboardUpdatesSection';
import References from '../../common/References/References';
import ActivityView from '../../../../../domain/platform/metrics/views/MetricsView';
import { MetricItem } from '../../common/MetricsPanel/Metrics';

type JourneyTypeName = 'hub' | 'challenge' | 'opportunity';

interface AboutSectionProps {
  entityTypeName: JourneyTypeName
  infoBlockTitle: string;
  infoBlockText: string | undefined;
  tags: string[];
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  loading: boolean | undefined;
  error?: ApolloError,
  communityReadAccess: boolean,
  isHub: boolean;
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
}

const BLOCK_HEIGHT = 260;

const RightColumn = styled(props => <PageContentColumn {...props} columns={8} />)(() => ({
  height: BLOCK_HEIGHT
}));

const LeftColumn = styled(props => <PageContentColumn {...props} columns={4} />)(() => ({}));
/**
 * todos
 * - info block tags
 * - loading
 * - error
 * - references
 */
export const AboutSection: FC<AboutSectionProps> = ({
  entityTypeName,
  infoBlockTitle, infoBlockText, tags,
  vision = '', background = '', impact = '', who = '',
  loading = false, error,
  communityReadAccess,
  leadUsers, leadOrganizations,
  memberUsers, memberUsersCount, memberOrganizations, memberOrganizationsCount,
  isHub,
  hubNameId, communityId,
  references, metricsItems,
}) => {
  const { t } = useTranslation();

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
        </LeftColumn>
        <RightColumn>
          <PageContentBlock sx={{ height: BLOCK_HEIGHT }}>
            <Text>
              {t(`context.${entityTypeName}.vision.title` as const)}
            </Text>
            <WrapperMarkdown>
              {vision}
            </WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock sx={{ height: BLOCK_HEIGHT }}>
            <Text>
              {t(`context.${entityTypeName}.background.title` as const)}
            </Text>
            <WrapperMarkdown>
              {background}
            </WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock halfWidth>
            <Text>
              {t(`context.${entityTypeName}.impact.title` as const)}
            </Text>
            <WrapperMarkdown>
              {impact}
            </WrapperMarkdown>
          </PageContentBlock>
          <PageContentBlock halfWidth>
            <Text>
              {t(`context.${entityTypeName}.who.title` as const)}
            </Text>
            <WrapperMarkdown>
              {who}
            </WrapperMarkdown>
          </PageContentBlock>
          {communityReadAccess && (
              <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />
          )}
          <PageContentBlock halfWidth>
            <References references={references} />
          </PageContentBlock>
          <PageContentBlock halfWidth>
            <Text>
              {t('pages.hub.sections.dashboard.activity')}
            </Text>
            <ActivityView activity={metricsItems} loading={loading} />
          </PageContentBlock>
        </RightColumn>
      </PageContent>
    </>
  );
};
