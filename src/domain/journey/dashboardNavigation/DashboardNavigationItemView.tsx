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
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import { Caption } from '../../../core/ui/typography';
import JourneyAvatar from '../common/JourneyAvatar/JourneyAvatar';
import RouterLink from '../../../core/ui/link/RouterLink';
import { getIndentStyle } from './utils';

export interface DashboardNavigationItemViewProps {
  displayName: string;
  avatar?: {
    uri: string;
    alternativeText?: string;
  };
  innovationFlowState?: string | undefined;
  private?: boolean;
  url: string;
  visualUri?: string;
  tooltipPlacement?: TooltipProps['placement'];
  current?: boolean;
  level?: number;
  onClick?: MouseEventHandler;
  onToggle?: (isExpanded: boolean) => void;
  expandable?: boolean;
}

export interface DashboardNavigationItemViewApi {
  expand: () => void;
  level: number;
  getDimensions: () => { top?: number; height?: number };
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
      expandable = false,
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

    return (
      <>
        <BadgeCardView
          ref={hostContainerRef}
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
              Children.count(children) > 0 &&
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
            ...getIndentStyle(level),
            backgroundColor: isCurrent ? 'highlight.main' : undefined,
          }}
          onClick={onClick}
        >
          <Caption>{displayName}</Caption>
        </BadgeCardView>
        {children && (
          // If items lose expandability, we can safely remove the callbacks.
          <Collapse
            in={isExpanded || !expandable}
            onEntering={() => onToggle?.(isExpanded)}
            onEntered={() => onToggle?.(isExpanded)}
            onExiting={() => onToggle?.(isExpanded)}
            onExited={() => onToggle?.(isExpanded)}
          >
            <Box ref={childrenContainerRef}>{children}</Box>
          </Collapse>
        )}
      </>
    );
  }
);

export default DashboardNavigationItemView;
