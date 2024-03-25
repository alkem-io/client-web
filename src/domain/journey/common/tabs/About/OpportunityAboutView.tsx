import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box, DialogContent, Theme, useMediaQuery } from '@mui/material';
import { ReferenceDetailsFragment } from '../../../../../core/apollo/generated/graphql-schema';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContent from '../../../../../core/ui/content/PageContent';
import { BlockTitle, Tagline } from '../../../../../core/ui/typography';
import PageContentBlock, { PageContentBlockProps } from '../../../../../core/ui/content/PageContentBlock';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { OpportunityApplicationButton } from '../../../../community/application/applicationButton/OpportunityApplicationButton';
import OpportunityApplicationButtonContainer from '../../../../community/application/containers/OpportunityApplicationButtonContainer';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import WrapperMarkdown, { MarkdownProps } from '../../../../../core/ui/markdown/WrapperMarkdown';
import ActivityView from '../../../../platform/metrics/views/MetricsView';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import References from '../../../../shared/components/References/References';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Actions } from '../../../../../core/ui/actions/Actions';
import PageContentBlockHeaderWithDialogAction from '../../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import useScrollToElement from '../../../../shared/utils/scroll/useScrollToElement';
import OverflowGradient from '../../../../../core/ui/overflow/OverflowGradient';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { buildUpdatesUrl } from '../../../../../main/routing/urlBuilders';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import FullWidthButton from '../../../../../core/ui/button/FullWidthButton';
import { InnovationFlowDetails } from '../../../../collaboration/InnovationFlow/InnovationFlow';
import InnovationFlowChips from '../../../../collaboration/InnovationFlow/InnovationFlowChips/InnovationFlowChips';
import useMetricsItems from '../../../../platform/metrics/utils/useMetricsItems';
import OpportunityMetrics from '../../../opportunity/utils/useOpportunityMetricsItems';
import { Metric } from '../../../../platform/metrics/utils/getMetricCount';

export interface OpportunityAboutViewProps extends EntityDashboardContributors, EntityDashboardLeads {
  challengeId: string | undefined;
  opportunityId: string | undefined;
  opportunityUrl: string;
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
  communityId: string | undefined;
  references: ReferenceDetailsFragment[] | undefined;
  metrics: Metric[] | undefined;
  innovationFlow?: InnovationFlowDetails;
}

const BLOCK_HEIGHT_GUTTERS = 13;

const FixedHeightContentBlock = (props: PageContentBlockProps) => (
  <PageContentBlock {...props} sx={{ maxHeight: gutters(BLOCK_HEIGHT_GUTTERS) }} />
);

const FixedHeightBlockContent = ({ children }: MarkdownProps) => (
  <OverflowGradient>
    <WrapperMarkdown>{children}</WrapperMarkdown>
  </OverflowGradient>
);

enum JourneyContextField {
  Vision = 'vision',
  Background = 'background',
  Impact = 'impact',
  Who = 'who',
}

const journeyTypeName = 'opportunity';

const OpportunityAboutView: FC<OpportunityAboutViewProps> = ({
  opportunityId,
  challengeId,
  opportunityUrl,
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
  communityId,
  references,
  metrics,
  innovationFlow,
}) => {
  const { t } = useTranslation();
  const [dialogSectionName, setDialogSectionName] = useState<JourneyContextField>();
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);

  const metricsItems = useMetricsItems(metrics, OpportunityMetrics);

  const organizationsHeader = 'community.leading-organizations';
  const usersHeader = 'community.leads';

  const { scrollable } = useScrollToElement(dialogSectionName, { method: 'element', defer: true });

  const openDialog = (field: JourneyContextField) => {
    setDialogSectionName(field);
  };

  const closeDialog = () => {
    setDialogSectionName(undefined);
  };

  const isDialogOpen = !!dialogSectionName;

  const context = {
    vision,
    background,
    impact,
    who,
  } as const;

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const shareUpdatesUrl = buildUpdatesUrl(opportunityUrl);

  return (
    <>
      <PageContent>
        <OpportunityApplicationButtonContainer opportunityId={opportunityId} challengeId={challengeId}>
          {({ applicationButtonProps, state: { loading } }) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }

            return (
              <PageContentColumn columns={12}>
                <OpportunityApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                />
              </PageContentColumn>
            );
          }}
        </OpportunityApplicationButtonContainer>
        <PageContentColumn columns={4}>
          <PageContentBlock accent>
            <PageContentBlockHeader title={name} />
            <Tagline>{tagline}</Tagline>
            <TagsComponent tags={tags} variant="filled" loading={loading} />
            <Actions justifyContent="end">
              {innovationFlow && innovationFlow.states && (
                <InnovationFlowChips
                  states={innovationFlow.states}
                  currentState={innovationFlow.currentState.displayName}
                  selectedState={selectedState}
                  onSelectState={state => setSelectedState(state.displayName)}
                />
              )}
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
            >
              <SeeMore subject={t('common.contributors')} to={`${EntityPageSection.Dashboard}/contributors`} />
            </EntityDashboardContributorsSection>
          )}
          {!communityReadAccess && (
            <PageContentBlock halfWidth>
              <PageContentBlockHeader
                title={t('components.journeyMetrics.title', { journey: t(`common.${journeyTypeName}` as const) })}
              />
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <FixedHeightContentBlock>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.vision.title` as const)}
              onDialogOpen={() => openDialog(JourneyContextField.Vision)}
            />
            <FixedHeightBlockContent>{vision}</FixedHeightBlockContent>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.background.title` as const)}
              onDialogOpen={() => openDialog(JourneyContextField.Background)}
            />
            <FixedHeightBlockContent>{background}</FixedHeightBlockContent>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock halfWidth>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.impact.title` as const)}
              onDialogOpen={() => openDialog(JourneyContextField.Impact)}
            />
            <FixedHeightBlockContent>{impact}</FixedHeightBlockContent>
          </FixedHeightContentBlock>
          <FixedHeightContentBlock halfWidth>
            <PageContentBlockHeaderWithDialogAction
              title={t(`context.${journeyTypeName}.who.title` as const)}
              onDialogOpen={() => openDialog(JourneyContextField.Who)}
            />
            <FixedHeightBlockContent>{who}</FixedHeightBlockContent>
          </FixedHeightContentBlock>
          {communityReadAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
          <PageContentBlock halfWidth>
            <PageContentBlockHeader title={t('common.references')} />
            <References references={references} noItemsView={t('common.no-references')} />
          </PageContentBlock>
          {communityReadAccess && (
            <PageContentBlock halfWidth>
              <PageContentBlockHeader
                title={t('components.journeyMetrics.title', { journey: t(`common.${journeyTypeName}` as const) })}
              />
              <ActivityView activity={metricsItems} loading={loading} />
            </PageContentBlock>
          )}
        </PageContentColumn>
      </PageContent>
      <DialogWithGrid open={isDialogOpen} columns={12} onClose={closeDialog}>
        <DialogHeader title={t('common.context')} onClose={closeDialog} />
        <DialogContent>
          {[
            JourneyContextField.Vision,
            JourneyContextField.Background,
            JourneyContextField.Impact,
            JourneyContextField.Who,
          ].map(field => (
            <Box marginTop={gutters()}>
              <BlockTitle ref={scrollable(field)} marginBottom={gutters()}>
                {t(`context.${journeyTypeName}.${field}.title` as const)}
              </BlockTitle>
              <WrapperMarkdown>{context[field]}</WrapperMarkdown>
            </Box>
          ))}
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default OpportunityAboutView;
