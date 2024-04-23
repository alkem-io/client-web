import { ExpandLess, ExpandMore, LockOutlined } from '@mui/icons-material';
import { Box, Collapse, IconButton, Skeleton, Tooltip, TooltipProps } from '@mui/material';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Caption } from '../../../../core/ui/typography';
import { DashboardNavigationItem } from './useSpaceDashboardNavigation';
import JourneyAvatar from '../../common/JourneyAvatar/JourneyAvatar';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface DashboardNavigationItemViewProps extends Omit<DashboardNavigationItem, 'id' | 'member' | 'children'> {
  url: string;
  visualUri?: string;
  tooltip?: ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}

const DashboardNavigationItemView = ({
  displayName,
  visualUri,
  url,
  children,
  private: isPrivate = false,
  tooltip,
  tooltipPlacement,
}: PropsWithChildren<DashboardNavigationItemViewProps>) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { t } = useTranslation();

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
          component={RouterLink}
          to={url ?? ''}
          visual={<JourneyAvatar src={visualUri} size="medium" />}
          visualRight={
            isPrivate ? (
              <Tooltip
                title={<Caption>{t('components.dashboardNavigation.privateChallenge')}</Caption>}
                placement={tooltipPlacement}
                arrow
              >
                <IconButton disableRipple onClick={preventDefault} aria-label={t('common.lock')}>
                  <LockOutlined />
                </IconButton>
              </Tooltip>
            ) : (
              children && (
                <IconButton
                  onClick={toggleExpand}
                  aria-label={isExpanded ? t('buttons.collapse') : t('buttons.expand')}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
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
