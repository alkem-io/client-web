import { ExpandMore, HelpOutlineOutlined } from '@mui/icons-material';
import { Box, ButtonBase, Collapse, IconButton, Skeleton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  spaceUrl: string | undefined;
  spaceVisibility?: SpaceVisibility;
  displayName: string | undefined;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  loading: boolean;
}

const VISIBLE_ROWS_WHEN_COLLAPSED = 6;

const DashboardNavigation = ({
  spaceUrl,
  displayName,
  spaceVisibility,
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
        title={
          <Tooltip title={<Caption>{displayName}</Caption>}>
            <Box component="span">{displayName}</Box>
          </Tooltip>
        }
        actions={
          <Tooltip
            title={<Caption>{t('components.dashboardNavigation.help')}</Caption>}
            placement={tooltipPlacement}
            arrow
          >
            <IconButton size="small" aria-label={t('components.dashboardNavigation.help')}>
              <HelpOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <Collapse in={showAll} collapsedSize={allItemsFit ? 0 : theme.spacing(6 * VISIBLE_ROWS_WHEN_COLLAPSED - 2)}>
        <Gutters disablePadding>
          {dashboardNavigation?.map(({ id, url: challengeUrl, avatar, cardBanner, member, ...challenge }) => {
            if (loading) {
              return <Skeleton key={id} />;
            }
            return (
              <DashboardNavigationItemView
                key={id}
                url={challengeUrl}
                visualUri={avatar?.uri}
                tooltip={
                  <ChallengeCard
                    challengeId={id}
                    banner={cardBanner}
                    displayName={challenge.displayName}
                    tags={challenge.tags ?? []}
                    tagline={challenge.tagline}
                    vision={challenge.vision ?? ''}
                    innovationFlowState={challenge.innovationFlowState}
                    journeyUri={challengeUrl}
                    spaceDisplayName={displayName ?? ''}
                    spaceUri={spaceUrl}
                    spaceVisibility={spaceVisibility}
                    sx={{ width: gutters(15) }}
                    member={member}
                  />
                }
                tooltipPlacement={tooltipPlacement}
                {...challenge}
              >
                {Boolean(challenge.children?.length) &&
                  challenge.children?.map(({ id, url: opportunityUrl, avatar, cardBanner, member, ...opportunity }) => (
                    <DashboardNavigationItemView
                      key={id}
                      url={opportunityUrl}
                      visualUri={avatar?.uri}
                      tooltip={
                        <OpportunityCard
                          opportunityId={id}
                          banner={cardBanner}
                          displayName={opportunity.displayName}
                          tags={opportunity.tags ?? []}
                          tagline={opportunity.tagline}
                          vision={opportunity.vision ?? ''}
                          innovationFlowState={opportunity.innovationFlowState}
                          journeyUri={opportunityUrl}
                          challengeDisplayName={challenge.displayName}
                          challengeUri={challengeUrl}
                          spaceVisibility={spaceVisibility}
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
