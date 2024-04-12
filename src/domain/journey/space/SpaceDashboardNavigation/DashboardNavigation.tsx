import { ExpandMore, HelpOutlineOutlined, UnfoldLess, UnfoldMore } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Skeleton, Tooltip, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import DashboardNavigationItemView, {
  DashboardNavigationItemViewApi,
  DashboardNavigationItemViewProps,
} from './DashboardNavigationItemView';
import { DashboardNavigationItem } from './useSpaceDashboardNavigation';
import { Actions } from '../../../../core/ui/actions/Actions';

import produce from 'immer';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { GUTTER_PX } from '../../../../core/ui/grid/constants';
import findCurrentPath from './findCurrentPath';

interface DashboardNavigationProps {
  spaceUrl: string | undefined;
  displayName: string | undefined;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  loading?: boolean;
  currentItemId?: string;
  itemProps?:
    | Partial<DashboardNavigationItemViewProps>
    | ((item: DashboardNavigationItem) => Partial<DashboardNavigationItemViewProps>);
}

const VISIBLE_ROWS_WHEN_COLLAPSED = 6;

const INITIAL_HEIGHT_LIMIT = GUTTER_PX * VISIBLE_ROWS_WHEN_COLLAPSED * 3;

const DashboardNavigation = ({
  spaceUrl,
  displayName,
  dashboardNavigation,
  loading = false,
  currentItemId,
  itemProps = () => ({}),
}: DashboardNavigationProps) => {
  const { t } = useTranslation();

  const [isSnappedToCurrentSubspace, setIsSnappedToCurrentSubspace] = useState(true);

  const [hasHeightLimit, setHasHeightLimit] = useState(true);

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

  const showAll = !hasHeightLimit || allItemsFit;

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const tooltipPlacement = isMobile ? 'left' : 'right';

  const pathToItem = findCurrentPath(dashboardNavigation, currentItemId);

  const currentLevel = pathToItem.length - 1;
  const isTopLevel = currentLevel === -1;

  const itemRefs = useRef<Record<string, DashboardNavigationItemViewApi | null>>({}).current;

  const itemRef = (itemId: string) => (element: DashboardNavigationItemViewApi | null) => {
    itemRefs[itemId] = element;
  };

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [viewportSnap, setViewportSnap] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  });

  // The only purpose of this method is to calculate the height of the content before expand/collapse transition is completed on an item.
  // If items aren't expandable/collapsible anymore, this method is not needed, just get the height of the content from the contentWrapperRef.
  const getContentHeight = () => {
    return Object.values(itemRefs).reduce((height, itemRef) => {
      const bounds = itemRef?.level === 0 ? itemRef.getDimensions() : undefined;
      return height + (bounds?.height ?? 0);
    }, 0);
  };

  const adjustViewport = () => {
    const itemRef = currentItemId && itemRefs[currentItemId];

    if (!isSnappedToCurrentSubspace || !itemRef) {
      setViewportSnap(snap =>
        produce(snap, snap => {
          const contentHeight = getContentHeight();
          const maxHeight = hasHeightLimit && isTopLevel ? INITIAL_HEIGHT_LIMIT : Infinity;

          snap.top = 0;
          snap.height = Math.min(maxHeight, contentHeight);
        })
      );
      return;
    }

    setViewportSnap(snap =>
      produce(snap, snap => {
        const itemBounds = itemRef.getDimensions();

        const parentBounds = contentWrapperRef.current?.getBoundingClientRect();

        const offsetTop =
          typeof parentBounds?.top === 'number' && typeof itemBounds.top === 'number'
            ? itemBounds.top - parentBounds?.top
            : 0;

        snap.height = itemBounds?.height ?? parentBounds?.height ?? 0;
        snap.top = offsetTop;
      })
    );
  };

  useLayoutEffect(adjustViewport, [
    dashboardNavigation,
    currentItemId,
    isSnappedToCurrentSubspace,
    hasHeightLimit,
    isTopLevel,
  ]);

  const contentTranslationX = (theme: Theme) =>
    isSnappedToCurrentSubspace && !isTopLevel ? gutters(-currentLevel * 2)(theme) : 0;
  const contentTranslationY = () => `-${viewportSnap.top}px`;
  const contentWidth = (theme: Theme) =>
    isSnappedToCurrentSubspace && !isTopLevel ? `calc(100% + ${gutters(currentLevel * 2)(theme)})` : '100%';

  const getItemProps = typeof itemProps === 'function' ? itemProps : () => itemProps;

  return (
    <PageContentBlock disablePadding disableGap>
      <Collapse in={!isSnappedToCurrentSubspace || isTopLevel}>
        <RouterLink to={spaceUrl ?? ''}>
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
            sx={{ padding: gutters() }}
          />
        </RouterLink>
      </Collapse>
      <Box height={viewportSnap.height} overflow="hidden" sx={{ transition: 'height 0.3s ease-in-out' }}>
        <Box
          ref={contentWrapperRef}
          sx={{
            transform: theme => `translate(${contentTranslationX(theme)}, ${contentTranslationY()})`,
            width: contentWidth,
            transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out',
          }}
        >
          {dashboardNavigation?.map(({ id, avatar, member, ...subspace }) => {
            if (loading) {
              return <Skeleton key={id} />;
            }
            const isCurrent = id === currentItemId;
            return (
              <DashboardNavigationItemView
                key={id}
                ref={itemRef(id)}
                visualUri={avatar?.uri}
                current={isCurrent}
                tooltipPlacement={tooltipPlacement}
                onToggle={adjustViewport}
                expandable={isTopLevel || !(isSnappedToCurrentSubspace && pathToItem.includes(id))}
                {...subspace}
                {...getItemProps({ id, avatar, member, ...subspace })}
              >
                {subspace.children?.map(({ id, avatar, member, ...subsubspace }) => (
                  <DashboardNavigationItemView
                    key={id}
                    ref={itemRef(id)}
                    visualUri={avatar?.uri}
                    current={id === currentItemId}
                    tooltipPlacement={tooltipPlacement}
                    level={1}
                    onToggle={adjustViewport}
                    expandable={isTopLevel || !(isSnappedToCurrentSubspace && pathToItem.includes(id))}
                    {...subsubspace}
                    {...getItemProps({ id, avatar, member, ...subsubspace })}
                  />
                ))}
              </DashboardNavigationItemView>
            );
          })}
        </Box>
      </Box>
      {currentLevel !== -1 && (
        <Actions padding={1} justifyContent="center">
          <Button
            startIcon={isSnappedToCurrentSubspace ? <UnfoldMore /> : <UnfoldLess />}
            onClick={() => setIsSnappedToCurrentSubspace(isExpanded => !isExpanded)}
            sx={{ textTransform: 'none' }}
          >
            {t(`components.dashboardNavigation.${isSnappedToCurrentSubspace ? 'expand' : 'collapse'}` as const)}
          </Button>
        </Actions>
      )}
      {isTopLevel &&
        (showAll ? (
          <Box height={gutters(0.5)} />
        ) : (
          <Actions padding={1} justifyContent="center">
            <Button startIcon={<ExpandMore />} onClick={() => setHasHeightLimit(false)} sx={{ textTransform: 'none' }}>
              {t('components.dashboardNavigation.showAll')}
            </Button>
          </Actions>
        ))}
    </PageContentBlock>
  );
};

export default DashboardNavigation;
