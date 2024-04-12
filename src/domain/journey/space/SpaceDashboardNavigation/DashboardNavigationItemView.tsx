import { ExpandLess, ExpandMore, LockOutlined } from '@mui/icons-material';
import { Box, Collapse, IconButton, Tooltip, TooltipProps } from '@mui/material';
import React, {
  Children,
  forwardRef,
  MouseEventHandler,
  PropsWithChildren,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Caption } from '../../../../core/ui/typography';
import { DashboardNavigationItem } from './useSpaceDashboardNavigation';
import JourneyAvatar from '../../common/JourneyAvatar/JourneyAvatar';
import RouterLink from '../../../../core/ui/link/RouterLink';

export interface DashboardNavigationItemViewProps extends Omit<DashboardNavigationItem, 'id' | 'member' | 'children'> {
  url: string;
  visualUri?: string;
  tooltipPlacement?: TooltipProps['placement'];
  current?: boolean;
  level?: number;
  onClick?: MouseEventHandler;
  onToggle?: (isExpanded: boolean) => void;
}

export interface DashboardNavigationItemViewApi {
  expand: () => void;
  getBoundingClientRect: () => DOMRect | undefined;
}

const DashboardNavigationItemView = forwardRef<
  DashboardNavigationItemViewApi,
  PropsWithChildren<DashboardNavigationItemViewProps>
>(
  (
    {
      displayName,
      visualUri,
      url,
      children,
      private: isPrivate = false,
      tooltipPlacement,
      current: isCurrent = false,
      level = 0,
      onClick,
      onToggle,
    },
    ref
  ) => {
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

    const containerRef = useRef<HTMLDivElement>();

    useImperativeHandle(
      ref,
      () => ({
        expand: () => setIsExpanded(true),
        getBoundingClientRect: () => containerRef.current?.getBoundingClientRect(),
      }),
      []
    );

    return (
      <Box ref={containerRef}>
        <BadgeCardView
          component={RouterLink}
          to={url ?? ''}
          visual={<JourneyAvatar src={visualUri} size="medium" />}
          visualRight={
            isPrivate ? (
              <Tooltip
                title={<Caption>{t('components.dashboardNavigation.privateSubspace')}</Caption>}
                placement={tooltipPlacement}
                arrow
              >
                <IconButton disableRipple onClick={preventDefault} aria-label={t('common.lock')}>
                  <LockOutlined />
                </IconButton>
              </Tooltip>
            ) : (
              Children.count(children) > 0 && (
                <IconButton
                  onClick={toggleExpand}
                  aria-label={isExpanded ? t('buttons.collapse') : t('buttons.expand')}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )
            )
          }
          padding
          square
          sx={{
            backgroundColor: isCurrent ? 'highlight.main' : undefined,
            paddingLeft: gutters(1 + level * 2),
          }}
          onClick={onClick}
        >
          <Caption>{displayName}</Caption>
        </BadgeCardView>
        {children && (
          <Collapse in={isExpanded} onEntered={() => onToggle?.(isExpanded)} onExited={() => onToggle?.(isExpanded)}>
            <Box>{children}</Box>
          </Collapse>
        )}
      </Box>
    );
  }
);

export default DashboardNavigationItemView;
