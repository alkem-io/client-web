import { ExpandLess, ExpandMore, LockOutlined } from '@mui/icons-material';
import { Box, Collapse, IconButton, Tooltip, TooltipProps } from '@mui/material';
import React, { forwardRef, MouseEventHandler, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import { Caption } from '../../../core/ui/typography';
import JourneyAvatar from '../common/JourneyAvatar/JourneyAvatar';
import RouterLink from '../../../core/ui/link/RouterLink';
import { findCurrentPath, getIndentStyle } from './utils';
import { DashboardNavigationItem } from '../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { Identifiable } from '../../../core/utils/Identifiable';
import DashboardNavigationAddSubspace from './DashboardNavigationAddSubspace';
import { gutters } from '../../../core/ui/grid/utils';

export interface DashboardNavigationItemViewProps extends DashboardNavigationItem {
  tooltipPlacement?: TooltipProps['placement'];
  current?: string;
  level?: number;
  onClick?: MouseEventHandler;
  onToggle?: (isExpanded: boolean) => void;
  compact?: boolean;
  onCreateSubspace?: (parent: Identifiable) => void;
  itemRef?: (itemId: string) => Ref<DashboardNavigationItemViewApi>;
  itemProps?:
    | Partial<DashboardNavigationItemViewProps>
    | ((item: DashboardNavigationItem) => Partial<DashboardNavigationItemViewProps>);
}

export interface DashboardNavigationItemViewApi {
  expand: () => void;
  level: number;
  getDimensions: () => { top?: number; height?: number };
}

const EMPTY_ITEM_REF = () => {};

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
      current,
      level = 0,
      onClick,
      onToggle,
      compact = false,
      canCreateSubspace = false,
      onCreateSubspace,
      itemRef = () => EMPTY_ITEM_REF,
      itemProps = () => ({}),
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const { t } = useTranslation();

    const isCurrent = current === id;

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

    const expandable = !compact && findCurrentPath(children, current).length === 0;

    useImperativeHandle(
      ref,
      () => ({
        level,
        expand: () => setIsExpanded(true),
        getDimensions: () => {
          // If items lose expandability, we can greatly simplify the code by using a wrapper Box and reading its height.
          const hostBounds = hostContainerRef.current?.getBoundingClientRect();
          const top = hostBounds?.top;

          if (!isExpanded && expandable) {
            return {
              top,
              height: hostBounds?.height,
            };
          }

          const childrenBounds = childrenContainerRef.current?.getBoundingClientRect();

          return {
            top,
            height: (hostBounds?.height ?? 0) + (childrenBounds?.height ?? 0),
          };
        },
      }),
      [isExpanded, expandable, level]
    );

    const hasChildren = children && children.length > 0;

    const hasCreateButton = !compact && canCreateSubspace && !!onCreateSubspace;

    const getItemProps = typeof itemProps === 'function' ? itemProps : () => itemProps;

    return (
      <>
        <BadgeCardView
          ref={hostContainerRef}
          component={RouterLink}
          to={url ?? ''}
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
              hasChildren &&
              expandable && (
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
            width: compact ? gutters(3) : undefined,
            backgroundColor: isCurrent ? 'highlight.main' : undefined,
          }}
          onClick={onClick}
        >
          {!compact && <Caption>{displayName}</Caption>}
        </BadgeCardView>
        {(hasChildren || hasCreateButton) && (
          // If items lose expandability, we can safely remove the callbacks.
          <Collapse
            in={isExpanded || !expandable}
            onEntering={() => onToggle?.(isExpanded)}
            onEntered={() => onToggle?.(isExpanded)}
            onExiting={() => onToggle?.(isExpanded)}
            onExited={() => onToggle?.(isExpanded)}
          >
            <Box ref={childrenContainerRef}>
              {hasCreateButton && (
                <DashboardNavigationAddSubspace level={level + 1} onClick={() => onCreateSubspace?.({ id })} />
              )}
              {children?.map(child => (
                <DashboardNavigationItemView
                  key={child.id}
                  ref={itemRef(child.id)}
                  itemRef={itemRef}
                  level={level + 1}
                  tooltipPlacement={tooltipPlacement}
                  current={current}
                  onClick={onClick}
                  compact={compact}
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
