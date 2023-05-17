import React, { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Skeleton,
  Tooltip,
  TooltipProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import {
  HelpOutlineOutlined,
  HubOutlined,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { DashboardNavigationItem } from './useHubDashboardNavigation';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { buildChallengeUrl, buildHubUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import { useTranslation } from 'react-i18next';
import { Theme } from '@mui/material/styles';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import OpportunityCard from '../../opportunity/OpportunityCard/OpportunityCard';

interface DashboardNavigationProps {
  hubNameId: string | undefined;
  hubVisibility?: HubVisibility;
  displayName: ReactNode;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  loading: boolean;
}

interface DashboardNavigationItemViewProps extends Omit<DashboardNavigationItem, 'id' | 'nameId' | 'children'> {
  url?: string;
  tooltip?: ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}

const DashboardNavigationItemView = ({
  displayName,
  visual,
  url,
  journeyTypeName,
  children,
  private: isPrivate = false,
  tooltip,
  tooltipPlacement,
}: PropsWithChildren<DashboardNavigationItemViewProps>) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { t } = useTranslation();

  const JourneyIcon = journeyIcon[journeyTypeName];

  const preventDefault = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const toggleExpand = (event: React.MouseEvent) => {
    preventDefault(event);
    setIsExpanded(value => !value);
  };

  return (
    <Box>
      <Tooltip title={tooltip ?? <Skeleton />} PopperProps={{ sx: { '.MuiTooltip-tooltip': { padding: 0 } } }}>
        <BadgeCardView
          component={LinkNoUnderline}
          to={url ?? ''}
          visual={
            <Box position="relative">
              <Avatar
                src={visual?.uri}
                sx={{
                  '.MuiAvatar-img': { filter: 'blur(1.5px)', opacity: '50%' },
                  '.MuiAvatar-fallback': { display: 'none' },
                  borderRadius: 0.5,
                  backgroundColor: theme => theme.palette.challenge.main,
                }}
              />
              <SwapColors>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <JourneyIcon color="primary" />
                </Box>
              </SwapColors>
            </Box>
          }
          visualRight={
            isPrivate ? (
              <Tooltip
                title={<Caption>{t('components.dashboardNavigation.privateChallenge')}</Caption>}
                placement={tooltipPlacement}
                arrow
              >
                <IconButton disableRipple onClick={preventDefault}>
                  <LockOutlined />
                </IconButton>
              </Tooltip>
            ) : (
              children && (
                <IconButton onClick={toggleExpand}>
                  {isExpanded ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                </IconButton>
              )
            )
          }
        >
          <Caption>{displayName}</Caption>
        </BadgeCardView>
      </Tooltip>
      {children && (
        <Collapse in={isExpanded}>
          <Gutters disablePadding paddingLeft={gutters(2)} marginTop={gutters()}>
            {children}
          </Gutters>
        </Collapse>
      )}
    </Box>
  );
};

const VISIBLE_ROWS_WHEN_COLLAPSED = 6;

const DashboardNavigation = ({
  hubNameId,
  displayName,
  hubVisibility,
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
          {dashboardNavigation?.map(({ id, nameId: challengeNameId, ...challenge }) => {
            if (!hubNameId) {
              return <Skeleton />;
            }
            const challengeUrl = buildChallengeUrl(hubNameId, challengeNameId);
            const hubUrl = buildHubUrl(hubNameId);
            return (
              <DashboardNavigationItemView
                key={id}
                url={challengeUrl}
                tooltip={
                  <ChallengeCard
                    challengeId={id}
                    challengeNameId={challengeNameId}
                    banner={challenge.visual}
                    displayName={challenge.displayName}
                    tags={challenge.tags ?? []}
                    tagline={challenge.tagline}
                    vision={challenge.vision ?? ''}
                    innovationFlowState={challenge.lifecycleState}
                    journeyUri={challengeUrl}
                    hubDisplayName={displayName ?? ''}
                    hubUri={hubUrl}
                    hubVisibility={hubVisibility}
                    sx={{ width: gutters(15) }}
                  />
                }
                tooltipPlacement={tooltipPlacement}
                {...challenge}
              >
                {Boolean(challenge.children?.length) &&
                  challenge.children?.map(({ id, nameId: opportunityNameId, ...opportunity }) => (
                    <DashboardNavigationItemView
                      key={id}
                      url={hubNameId && buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}
                      tooltip={
                        <OpportunityCard
                          opportunityId={id}
                          banner={opportunity.visual}
                          displayName={opportunity.displayName}
                          tags={opportunity.tags ?? []}
                          tagline={opportunity.tagline}
                          vision={opportunity.vision ?? ''}
                          innovationFlowState={opportunity.lifecycleState}
                          journeyUri={buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}
                          challengeDisplayName={challenge.displayName}
                          challengeUri={challengeUrl}
                          hubVisibility={hubVisibility}
                          sx={{ width: gutters(15) }}
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
            <KeyboardArrowDownOutlined fontSize="small" />
            {t('components.dashboardNavigation.showAll')}
          </Caption>
        </ButtonBase>
      )}
    </PageContentBlock>
  );
};

export default DashboardNavigation;
