import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Avatar, Box, Collapse, IconButton, Tooltip } from '@mui/material';
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
import { buildChallengeUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import { useTranslation } from 'react-i18next';

interface DashboardNavigationProps {
  hubNameId: string | undefined;
  displayName: ReactNode;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
}

interface DashboardNavigationItemViewProps extends Omit<DashboardNavigationItem, 'id' | 'nameId' | 'children'> {
  url?: string;
}

const DashboardNavigationItemView = ({
  displayName,
  visualUri,
  url,
  journeyTypeName,
  children,
  private: isPrivate = false,
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
    <Gutters disablePadding>
      <BadgeCardView
        component={LinkNoUnderline}
        to={url ?? ''}
        visual={
          <Box position="relative">
            <Avatar
              src={visualUri}
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
              title={<Caption>{t('components.dashboardNavigation.dashboardNavigationPrivateChallenge')}</Caption>}
              placement="right"
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
      {children && (
        <Collapse in={isExpanded}>
          <Gutters disablePadding paddingLeft={gutters(2)}>
            {children}
          </Gutters>
        </Collapse>
      )}
    </Gutters>
  );
};

const DashboardNavigation = ({ hubNameId, displayName, dashboardNavigation }: DashboardNavigationProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        icon={<HubOutlined />}
        title={displayName}
        actions={
          <Tooltip
            title={<Caption>{t('components.dashboardNavigation.dashboardNavigationHelp')}</Caption>}
            placement="right"
            arrow
          >
            <HelpOutlineOutlined fontSize="small" />
          </Tooltip>
        }
      />
      {dashboardNavigation?.map(({ id, nameId: challengeNameId, ...challenge }) => (
        <DashboardNavigationItemView
          key={id}
          url={hubNameId && buildChallengeUrl(hubNameId, challengeNameId)}
          {...challenge}
        >
          {challenge.children?.map(({ id, nameId: opportunityNameId, ...opportunity }) => (
            <DashboardNavigationItemView
              key={id}
              url={hubNameId && buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}
              {...opportunity}
            />
          ))}
        </DashboardNavigationItemView>
      ))}
    </PageContentBlock>
  );
};

export default DashboardNavigation;
