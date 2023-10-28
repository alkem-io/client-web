import { ExpandMore, HelpOutlineOutlined, HubOutlined } from '@mui/icons-material';
import { ButtonBase, Collapse, Skeleton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildChallengeUrl, buildOpportunityUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import OpportunityCard from '../../opportunity/OpportunityCard/OpportunityCard';
import DashboardNavigationItemView from './DashboardNavigationItemView';
import { DashboardNavigationItem } from './useSpaceDashboardNavigation';

interface DashboardNavigationProps {
  spaceNameId: string | undefined;
  spaceLicense?: SpaceVisibility;
  displayName: ReactNode;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  loading: boolean;
}

const VISIBLE_ROWS_WHEN_COLLAPSED = 6;

const DashboardNavigation = ({
  spaceNameId,
  displayName,
  spaceLicense,
  dashboardNavigation,
  loading,
}: DashboardNavigationProps) => {
  const { t } = useTranslation();

  const theme = useTheme();

  const [isExpanded, setIsExpanded] = useState(false);

  const itemsCount = useMemo(() => {
    if (loading) {
      return undefined;
    }
    const childCount = dashboardNavigation?.reduce((count, item) => {
      return count + (item.children?.length ?? 0);
    }, 0);
    return dashboardNavigation?.length! + childCount!;
  }, [dashboardNavigation, loading]);

  const allItemsFit = !itemsCount || itemsCount <= VISIBLE_ROWS_WHEN_COLLAPSED;

  const showAll = isExpanded || allItemsFit;

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const tooltipPlacement = isMobile ? 'left' : 'right';

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        icon={<HubOutlined />}
        title={displayName}
        actions={
          <Tooltip
            title={<Caption>{t('components.dashboardNavigation.help')}</Caption>}
            placement={tooltipPlacement}
            arrow
          >
            <HelpOutlineOutlined fontSize="small" />
          </Tooltip>
        }
      />
      <Collapse in={showAll} collapsedSize={allItemsFit ? 0 : theme.spacing(6 * VISIBLE_ROWS_WHEN_COLLAPSED - 2)}>
        <Gutters disablePadding>
          {dashboardNavigation?.map(({ id, nameId: challengeNameId, visual, member, ...challenge }) => {
            if (!spaceNameId) {
              return <Skeleton key={id} />;
            }
            const challengeUrl = buildChallengeUrl(spaceNameId, challengeNameId);
            const spaceUrl = buildSpaceUrl(spaceNameId);
            return (
              <DashboardNavigationItemView
                key={id}
                url={challengeUrl}
                visualUri={visual?.uri}
                tooltip={
                  <ChallengeCard
                    challengeId={id}
                    challengeNameId={challengeNameId}
                    banner={visual}
                    displayName={challenge.displayName}
                    tags={challenge.tags ?? []}
                    tagline={challenge.tagline}
                    vision={challenge.vision ?? ''}
                    innovationFlowState={challenge.lifecycleState}
                    journeyUri={challengeUrl}
                    spaceDisplayName={displayName ?? ''}
                    spaceUri={spaceUrl}
                    spaceLicense={spaceLicense}
                    sx={{ width: gutters(15) }}
                    member={member}
                  />
                }
                tooltipPlacement={tooltipPlacement}
                {...challenge}
              >
                {Boolean(challenge.children?.length) &&
                  challenge.children?.map(({ id, nameId: opportunityNameId, visual, member, ...opportunity }) => (
                    <DashboardNavigationItemView
                      key={id}
                      url={spaceNameId && buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId)}
                      visualUri={visual?.uri}
                      tooltip={
                        <OpportunityCard
                          opportunityId={id}
                          banner={visual}
                          displayName={opportunity.displayName}
                          tags={opportunity.tags ?? []}
                          tagline={opportunity.tagline}
                          vision={opportunity.vision ?? ''}
                          innovationFlowState={opportunity.lifecycleState}
                          journeyUri={buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId)}
                          challengeDisplayName={challenge.displayName}
                          challengeUri={challengeUrl}
                          spaceLicense={spaceLicense}
                          sx={{ width: gutters(15) }}
                          member={member}
                        />
                      }
                      {...opportunity}
                    />
                  ))}
              </DashboardNavigationItemView>
            );
          })}
        </Gutters>
      </Collapse>
      {!showAll && (
        <ButtonBase onClick={() => setIsExpanded(true)}>
          <Caption display="flex" alignItems="center">
            <ExpandMore fontSize="small" />
            {t('components.dashboardNavigation.showAll')}
          </Caption>
        </ButtonBase>
      )}
    </PageContentBlock>
  );
};

export default DashboardNavigation;
