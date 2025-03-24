import { ExpandLess, ExpandMore, LockOutlined } from '@mui/icons-material';
import { Box, Collapse, IconButton, Tooltip, TooltipProps } from '@mui/material';
import React, { forwardRef, MouseEventHandler, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { Caption } from '@/core/ui/typography';
import JourneyAvatar from '../../../journey/common/JourneyAvatar/JourneyAvatar';
import RouterLink from '@/core/ui/link/RouterLink';
import { getIndentStyle } from './utils';
import { DashboardNavigationItem } from '../../../journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';

export interface DashboardNavigationItemViewProps extends DashboardNavigationItem {
  tooltipPlacement?: TooltipProps['placement'];
  subspaceOfCurrent?: boolean;
  level?: number;
  onClick?: MouseEventHandler;
  onToggle?: (isExpanded: boolean) => void;
  compact?: boolean;
  itemProps?:
    | Partial<DashboardNavigationItemViewProps>
    | ((item: DashboardNavigationItem) => Partial<DashboardNavigationItemViewProps>);
}

export interface DashboardNavigationItemViewApi {
  id: string;
  expand: () => void;
  level: number;
  getDimensions: () => { top?: number; height?: number };
  getChildrenDimensions: () => { top?: number; height?: number };
}

const DashboardNavigationItemView = forwardRef<DashboardNavigationItemViewApi, DashboardNavigationItemViewProps>(
  (
    {
      id,
      displayName,
      url,
      children,
      avatar,
      private: isPrivate = false,
      tooltipPlacement,
      level = 0,
      onClick,
      onToggle,
      compact = false,
      itemProps = () => ({}),
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

    const hostContainerRef = useRef<HTMLDivElement>();

    const childrenContainerRef = useRef<HTMLDivElement>();

    useImperativeHandle(
      ref,
      () => {
        const getChildrenDimensions = () => {
          const childrenBounds = childrenContainerRef.current?.getBoundingClientRect();
          return {
            top: childrenBounds?.top,
            height: childrenBounds?.height,
          };
        };
        return {
          id,
          level,
          expand: () => setIsExpanded(true),
          getDimensions: () => {
            // If items lose expandability, we can greatly simplify the code by using a wrapper Box and reading its height.
            const hostBounds = hostContainerRef.current?.getBoundingClientRect();
            const top = hostBounds?.top;

            if (!isExpanded) {
              return {
                top,
                height: hostBounds?.height,
              };
            }

            const childrenBounds = getChildrenDimensions();

            return {
              top,
              height: (hostBounds?.height ?? 0) + (childrenBounds.height ?? 0),
            };
          },
          getChildrenDimensions,
        };
      },
      [id, isExpanded, level]
    );

    const hasChildren = children && children.length > 0;

    const getItemProps = typeof itemProps === 'function' ? itemProps : () => itemProps;

    return (
      <>
        {!hasChildren ? (
          <BadgeCardView
            ref={hostContainerRef}
            component={RouterLink}
            to={url ?? ''}
            keepScroll
            visual={
              <Tooltip
                open={compact ? undefined : false}
                title={<Caption>{displayName}</Caption>}
                placement={tooltipPlacement}
                arrow
              >
                <JourneyAvatar src={avatar?.uri} size="medium" />
              </Tooltip>
            }
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
                hasChildren && (
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
              ...getIndentStyle(level, compact),
            }}
            onClick={onClick}
          >
            {!compact && <Caption>{displayName}</Caption>}
          </BadgeCardView>
        ) : (
          // If items lose expandability, we can safely remove the callbacks.
          <Collapse
            in={isExpanded}
            onEntering={() => onToggle?.(isExpanded)}
            onEntered={() => onToggle?.(isExpanded)}
            onExiting={() => onToggle?.(isExpanded)}
            onExited={() => onToggle?.(isExpanded)}
          >
            <Box ref={childrenContainerRef}>
              {children?.map(child => (
                <DashboardNavigationItemView
                  key={child.id}
                  ref={ref}
                  level={level + 1}
                  tooltipPlacement={tooltipPlacement}
                  subspaceOfCurrent
                  compact={compact}
                  itemProps={itemProps}
                  onToggle={onToggle}
                  {...child}
                  {...getItemProps(child)}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </>
    );
  }
);

export default DashboardNavigationItemView;
