import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box, Dialog, DialogContent } from '@mui/material';
import {
  LifecycleContextTabFragment,
  ReferenceDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import { MetricItem } from '../../../../../common/components/composite/common/MetricsPanel/Metrics';
import PageContentColumn, { PageContentColumnProps } from '../../../../../core/ui/content/PageContentColumn';
import PageContent from '../../../../../core/ui/content/PageContent';
import { BlockTitle, Tagline } from '../../../../../core/ui/typography';
import PageContentBlock, { PageContentBlockProps } from '../../../../../core/ui/content/PageContentBlock';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { LifecycleState } from '../../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import { ApplicationButton } from '../../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../../../community/application/containers/ApplicationButtonContainer';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';
import ActivityView from '../../../../platform/metrics/views/MetricsView';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import References from '../../../../../common/components/composite/common/References/References';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { JourneyTypeName } from '../../../JourneyTypeName';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Actions } from '../../../../../core/ui/actions/Actions';
import PageContentBlockHeaderWithDialogAction from '../../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogTitle from '../../../../../common/components/core/dialog/DialogTitle';
import useScrollToElement from '../../../../shared/utils/scroll/useScrollToElement';
import { useChallenge } from '../../../challenge/hooks/useChallenge';

export interface AboutSectionProps extends EntityDashboardContributors, EntityDashboardLeads {
  journeyTypeName: JourneyTypeName;
  name: string;
  tagline: string | undefined;
  tags: string[] | undefined;
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  loading?: boolean;
  error?: ApolloError;
  communityReadAccess: boolean;
  hubNameId: string | undefined;
  communityId: string | undefined;
  references: ReferenceDetailsFragment[] | undefined;
  metricsItems: MetricItem[];
  lifecycle?: LifecycleContextTabFragment;
}

const BLOCK_HEIGHT_GUTTERS = 13;

const RightColumn = (props: Omit<PageContentColumnProps, 'columns'>) => <PageContentColumn {...props} columns={8} />;
const LeftColumn = (props: Omit<PageContentColumnProps, 'columns'>) => <PageContentColumn {...props} columns={4} />;
const FixedHeightContentBlock = (props: PageContentBlockProps) => (
  <PageContentBlock {...props} sx={{ height: gutters(BLOCK_HEIGHT_GUTTERS) }} />
);
/**
 * todos
 * - info block tags
 * - loading
 * - error
 */
export const AboutSection: FC<AboutSectionProps> = ({
  journeyTypeName,
  name,
  tagline,
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
  const [open, setOpen] = useState(false);
  // todo change string
  const [sectionName, setSectionName] = useState<string>();

  const isHub = journeyTypeName === 'hub';
  const organizationsHeader = isHub ? 'pages.hub.sections.dashboard.organization' : 'community.leading-organizations';
  const usersHeader = isHub ? 'community.host' : 'community.leads';

  const { challengeId, challengeNameId, displayName: challengeName } = useChallenge();

  const { scrollable } = useScrollToElement(sectionName, { method: 'element', defer: true });

  const handleDialogOpen = (_sectionName: 'vision' | 'background' | 'impact' | 'who') => {
    setOpen(true);
    setSectionName(_sectionName);
  };
  const handleDialogClose = () => {
    setOpen(false);
    setSectionName(undefined);
  };

  return (
    <>
      <PageContent>
        <LeftColumn>
          <PageContentBlock accent>
            <PageContentBlockHeader title={name} />
            <Tagline>{tagline}</Tagline>
            <TagsComponent tags={tags} variant="filled" loading={loading} />
            <Actions justifyContent="end">
              {lifecycle && <LifecycleState lifecycle={lifecycle} />}
              <ApplicationButtonContainer
                challengeId={challengeId}
                challengeNameId={challengeNameId}
                challengeName={challengeName}
              >
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            </Actions>
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
              <PageContentBlockHeader title={t('pages.hub.sections.dashboard.activity')} />
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </LeftColumn>
        <RightColumn>
          <FixedHeightContentBlock>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.vision.title` as const)}
              onDialogOpen={() => handleDialogOpen('vision')}
            />
            <WrapperMarkdown>{vision}</WrapperMarkdown>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.background.title` as const)}
              onDialogOpen={() => handleDialogOpen('background')}
            />
            <WrapperMarkdown>{background}</WrapperMarkdown>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock halfWidth>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.impact.title` as const)}
              onDialogOpen={() => handleDialogOpen('impact')}
            />
            <WrapperMarkdown>{impact}</WrapperMarkdown>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock halfWidth>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.who.title` as const)}
              onDialogOpen={() => handleDialogOpen('who')}
            />
            <WrapperMarkdown>{who}</WrapperMarkdown>
          </FixedHeightContentBlock>
          {communityReadAccess && <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />}
          <PageContentBlock halfWidth>
            <PageContentBlockHeader title={t('common.references')} />
            <References references={references} noItemsView={t('common.no-references')} />
          </PageContentBlock>
          {communityReadAccess && (
            <PageContentBlock halfWidth>
              <PageContentBlockHeader title={t('pages.hub.sections.dashboard.activity')} />
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </RightColumn>
      </PageContent>
      <Dialog open={open} fullWidth maxWidth={false} onClose={handleDialogClose}>
        <DialogTitle onClose={handleDialogClose}>{t('common.context')}</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} flexDirection="column">
            <BlockTitle>{t(`context.${journeyTypeName}.vision.title` as const)}</BlockTitle>
            <WrapperMarkdown>{vision}</WrapperMarkdown>
            <BlockTitle>{t(`context.${journeyTypeName}.background.title` as const)}</BlockTitle>
            <WrapperMarkdown>{background}</WrapperMarkdown>
            <BlockTitle>{t(`context.${journeyTypeName}.impact.title` as const)}</BlockTitle>
            <WrapperMarkdown>{impact}</WrapperMarkdown>
            <BlockTitle ref={scrollable('who')}>{t(`context.${journeyTypeName}.who.title` as const)}</BlockTitle>
            <WrapperMarkdown>{who}</WrapperMarkdown>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
