import { Grid } from '@mui/material';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import Markdown from '../../components/core/Markdown';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { CanvasDetailsFragment, ChallengeCardFragment } from '../../models/graphql-schema';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../domain/shared/layout/CardsLayout/CardsLayout';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import DashboardSectionAspects from '../../components/composite/aspect/DashboardSectionAspects/DashboardSectionAspects';
import { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import { ActivityType } from '../../domain/activity/ActivityType';
import CanvasesDashboardPreview from '../../domain/canvas/CanvasesDashboardPreview/CanvasesDashboardPreview';
import { buildCanvasUrl, buildHubUrl } from '../../utils/urlBuilders';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface HubDashboardView2Props {
  vision?: string;
  hubId?: string;
  hubNameId?: string;
  activity: ActivityItem[];
  organization?: any;
  challenges: ChallengeCardFragment[];
  aspects: AspectCardAspect[];
  aspectsCount: number | undefined;
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
  community?: any;
  loading: boolean;
  challengesReadAccess?: boolean;
}

const SPACING = 2;

const HubDashboardView: FC<HubDashboardView2Props> = ({
  vision = '',
  challenges,
  hubNameId = '',
  activity,
  aspects,
  aspectsCount,
  canvases,
  canvasesCount,
  loading,
  challengesReadAccess = false,
}) => {
  const { t } = useTranslation();

  const challengesCount = useMemo(() => {
    return activity.find(({ type }) => type === ActivityType.Challenge)?.count;
  }, [activity]);

  const [, buildLinkToCanvas] = useBackToParentPage(buildHubUrl(hubNameId));

  const buildCanvasLink = useCallback(
    (canvasNameId: string) => {
      const url = buildCanvasUrl(canvasNameId, hubNameId);
      return buildLinkToCanvas(url);
    },
    [hubNameId]
  );

  return (
    <>
      <Grid container spacing={SPACING}>
        <DashboardColumn>
          <DashboardGenericSection
            headerText={t('pages.hub.about-this-hub')}
            primaryAction={
              <ApplicationButtonContainer>
                {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
              </ApplicationButtonContainer>
            }
            navText={t('buttons.see-more')}
            navLink={EntityPageSection.About}
          >
            <Markdown children={vision} />
          </DashboardGenericSection>
        </DashboardColumn>
        <DashboardColumn>
          {challengesReadAccess && (
            <DashboardGenericSection
              headerText={`${t('pages.hub.sections.dashboard.challenges.title')} (${challengesCount})`}
              helpText={t('pages.hub.sections.dashboard.challenges.help-text')}
              navText={t('buttons.see-all')}
              navLink={'challenges'}
            >
              <CardsLayout items={challenges} deps={[hubNameId]}>
                {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
              </CardsLayout>
            </DashboardGenericSection>
          )}
          <DashboardSectionAspects aspects={aspects} aspectsCount={aspectsCount} hubNameId={hubNameId} />
          <CanvasesDashboardPreview
            canvases={canvases}
            canvasesCount={canvasesCount}
            noItemsMessage={t('pages.canvas.no-canvases')}
            buildCanvasLink={buildCanvasLink}
            loading={loading}
          />
        </DashboardColumn>
      </Grid>
    </>
  );
};

export default HubDashboardView;
