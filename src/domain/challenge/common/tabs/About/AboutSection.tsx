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
import { MetricItem } from '../../../../platform/metrics/views/Metrics';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContent from '../../../../../core/ui/content/PageContent';
import { BlockTitle, Tagline } from '../../../../../core/ui/typography';
import PageContentBlock, { PageContentBlockProps } from '../../../../../core/ui/content/PageContentBlock';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import InnovationFlow from '../../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlow';
import { ApplicationButton } from '../../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ApplicationButtonContainer from '../../../../community/application/containers/ApplicationButtonContainer';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import WrapperMarkdown, { MarkdownProps } from '../../../../../core/ui/markdown/WrapperMarkdown';
import ActivityView from '../../../../platform/metrics/views/MetricsView';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import References from '../../../../shared/components/References/References';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { JourneyTypeName } from '../../../JourneyTypeName';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Actions } from '../../../../../core/ui/actions/Actions';
import PageContentBlockHeaderWithDialogAction from '../../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import DialogTitle from '../../../../../common/components/core/dialog/DialogTitle';
import useScrollToElement from '../../../../shared/utils/scroll/useScrollToElement';
import { useChallenge } from '../../../challenge/hooks/useChallenge';
import OverflowGradient from '../../../../../core/ui/overflow/OverflowGradient';

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
  spaceNameId: string | undefined;
  communityId: string | undefined;
  references: ReferenceDetailsFragment[] | undefined;
  metricsItems: MetricItem[];
  lifecycle?: LifecycleContextTabFragment;
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
  spaceNameId,
  communityId,
  references,
  metricsItems,
  lifecycle,
}) => {
  const { t } = useTranslation();
  const [dialogSectionName, setDialogSectionName] = useState<JourneyContextField>();

  const isSpace = journeyTypeName === 'space';
  const organizationsHeader = isSpace
    ? 'pages.space.sections.dashboard.organization'
    : 'community.leading-organizations';
  const usersHeader = isSpace ? 'community.host' : 'community.leads';

  const {
    challengeId,
    challengeNameId,
    profile: { displayName: challengeName },
  } = useChallenge();

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

  return (
    <>
      <PageContent>
        <PageContentColumn columns={4}>
          <PageContentBlock accent>
            <PageContentBlockHeader title={name} />
            <Tagline>{tagline}</Tagline>
            <TagsComponent tags={tags} variant="filled" loading={loading} />
            <Actions justifyContent="end">
              {lifecycle && <InnovationFlow lifecycle={lifecycle} />}
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
          {communityReadAccess && <DashboardUpdatesSection entities={{ spaceId: spaceNameId, communityId }} />}
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
      <Dialog open={isDialogOpen} fullWidth maxWidth={false} onClose={closeDialog}>
        <DialogTitle onClose={closeDialog}>{t('common.context')}</DialogTitle>
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
      </Dialog>
    </>
  );
};
