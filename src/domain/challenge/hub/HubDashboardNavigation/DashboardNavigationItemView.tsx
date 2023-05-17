import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, LockOutlined } from '@mui/icons-material';
import { Avatar, Box, Collapse, IconButton, Skeleton, Tooltip, TooltipProps } from '@mui/material';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import { Caption } from '../../../../core/ui/typography';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import { DashboardNavigationItem } from './useHubDashboardNavigation';

interface DashboardNavigationItemViewProps extends Omit<DashboardNavigationItem, 'id' | 'nameId' | 'children'> {
  url?: string;
  visualUri?: string;
  tooltip?: ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}

const DashboardNavigationItemView = ({
  displayName,
  visualUri,
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

export default DashboardNavigationItemView;
