import { ExpandMore, HelpOutlineOutlined } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Tooltip } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import DashboardNavigationItemView, {
  DashboardNavigationItemViewApi,
  DashboardNavigationItemViewProps,
} from './DashboardNavigationItemView';
import { DashboardNavigationItem } from '../useSpaceDashboardNavigation';
import { Actions } from '@/core/ui/actions/Actions';

import { produce } from 'immer';
import RouterLink from '@/core/ui/link/RouterLink';
import { GUTTER_PX, useScreenSize } from '@/core/ui/grid/constants';
import { findCurrentPath } from './utils';
import { Identifiable } from '@/core/utils/Identifiable';
import { debounce, difference } from 'lodash';
import { DashboardAddButton } from '@/domain/shared/components/DashboardSections/DashboardAddButton';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface DashboardNavigationProps {
  dashboardNavigation: DashboardNavigationItem | undefined;
  loading?: boolean;
  currentItemId: string | undefined;
  itemProps?:
    | Partial<DashboardNavigationItemViewProps>
    | ((item: DashboardNavigationItem) => Partial<DashboardNavigationItemViewProps>);
  onCreateSubspace?: (parent: Identifiable) => void;
  compact?: boolean;
  onCurrentItemNotFound?: () => void;
  level?: SpaceLevel;
}

const VISIBLE_ROWS_WHEN_COLLAPSED = 6;

const INITIAL_HEIGHT_LIMIT = GUTTER_PX * VISIBLE_ROWS_WHEN_COLLAPSED * 3;

const collectIds = (item: DashboardNavigationItem): string[] => {
  const children = item.children ?? [];
  return [item.id, ...children.flatMap(collectIds)];
};

const DashboardNavigation = ({
  dashboardNavigation: dashboardNavigationRoot,
  currentItemId,
  itemProps = () => ({}),
  onCreateSubspace,
  compact = false,
  onCurrentItemNotFound = () => {},
  level = SpaceLevel.L0,
}: DashboardNavigationProps) => {
  const { t } = useTranslation();

  const [isSnapped] = useState(false);

  const [hasHeightLimit, setHasHeightLimit] = useState(true);

  const ids = useMemo(
    () => (dashboardNavigationRoot ? collectIds(dashboardNavigationRoot) : []),
    [dashboardNavigationRoot]
  );

  // Used only on top level where we have "Show all"
  const itemsCount = ids.length - 1;

  const allItemsFit = !itemsCount || itemsCount <= VISIBLE_ROWS_WHEN_COLLAPSED;

  const showAll = !hasHeightLimit || allItemsFit;

  const { isMediumSmallScreen } = useScreenSize();

  const tooltipPlacement = isMediumSmallScreen ? 'left' : 'right';

  // TODO: receive spaceHierarchyPath as argument, revise the currentLevel && isTopLevel logic!
  // TODO: simplify the logic here and in the DashboardNavigationItemView
  const pathToItem = findCurrentPath(dashboardNavigationRoot, currentItemId);
  const currentLevel = pathToItem.length - 1;
  const isTopLevel = currentLevel === 0;

  useLayoutEffect(() => {
    if (currentItemId && dashboardNavigationRoot && pathToItem.length === 0) {
      onCurrentItemNotFound();
    }
  }, [currentItemId, dashboardNavigationRoot, pathToItem.length]);

  const itemRefs = useRef<Record<string, DashboardNavigationItemViewApi | null>>({}).current;

  // Because we can't use high-order itemRef (id) => (ref) => {}, we can't rely on null ref value to do cleanup,
  // therefore we do a manual cleanup by removing all refs that are not in the current list of ids.
  useEffect(() => {
    for (const key of difference(Object.keys(itemRefs), ids)) {
      itemRefs[key] = null;
    }
  }, [ids.join(',')]);

  const rootItem = dashboardNavigationRoot && itemRefs[dashboardNavigationRoot.id];

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [viewportSnap, setViewportSnap] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  });

  const rootLevel = compact ? 0 : 1;

  // The only purpose of this method is to calculate the height of the content before expand/collapse transition is completed on an item.
  // If items aren't expandable/collapsible anymore, this method is not needed, just get the height of the content from the contentWrapperRef.
  const getContentHeight = () => {
    // Iterating over ids instead of itemRefs to skip outdated items (cleanup may not have run yet)
    return ids.reduce((height, id) => {
      const itemRef = itemRefs[id];
      const bounds = itemRef?.level === rootLevel ? itemRef.getDimensions() : undefined;
      return height + (bounds?.height ?? 0);
    }, 0);
  };

  const adjustViewport = () => {
    const itemRef = currentItemId && itemRefs[currentItemId];

    const getRelativeOffsetTop = (itemBounds: { top?: number } | undefined) => {
      if (typeof itemBounds?.top !== 'number') {
        return 0;
      }
      const parentBounds = contentWrapperRef.current?.getBoundingClientRect();
      return parentBounds ? itemBounds.top - parentBounds.top : 0;
    };

    if (!isSnapped || isTopLevel || !itemRef) {
      setViewportSnap(snap =>
        produce(snap, snap => {
          const contentHeight = getContentHeight();
          const maxHeight = hasHeightLimit && isTopLevel ? INITIAL_HEIGHT_LIMIT : Infinity;

          snap.top = compact ? 0 : getRelativeOffsetTop(rootItem?.getChildrenDimensions());
          snap.height = Math.min(maxHeight, contentHeight);
        })
      );
      return;
    }

    setViewportSnap(snap =>
      produce(snap, snap => {
        const itemBounds = itemRef.getDimensions();
        const parentBounds = contentWrapperRef.current?.getBoundingClientRect();
        const offsetTop = getRelativeOffsetTop(itemBounds);

        snap.height = itemBounds?.height ?? parentBounds?.height ?? 0;
        snap.top = offsetTop;
      })
    );
  };

  const adjustViewportFnRef = useRef(adjustViewport);

  adjustViewportFnRef.current = adjustViewport;

  useLayoutEffect(adjustViewport, [
    dashboardNavigationRoot,
    currentItemId,
    isSnapped,
    hasHeightLimit,
    isTopLevel,
    compact,
    ids,
  ]);

  const onRefsUpdated = useRef(debounce(() => adjustViewportFnRef.current())).current;

  // Has to maintain stable id over renders, otherwise we get a loop because React always invokes a new functional ref
  const itemRef = useCallback((element: DashboardNavigationItemViewApi | null) => {
    if (element && itemRefs[element.id] !== element) {
      itemRefs[element.id] = element;
      onRefsUpdated();
    }
  }, []);

  const shouldShift = isSnapped && currentLevel !== -1 && !isTopLevel && !compact;

  const contentTranslationX = (theme: Theme) => (shouldShift ? gutters(-(currentLevel - 1) * 2)(theme) : 0);
  const contentTranslationY = () => `-${viewportSnap.top}px`;
  const contentWidth = (theme: Theme) =>
    shouldShift ? `calc(100% + ${gutters((currentLevel - 1) * 2)(theme)})` : '100%';

  const getItemProps = typeof itemProps === 'function' ? itemProps : () => itemProps;

  const hasCreate =
    !compact &&
    Boolean(onCreateSubspace) &&
    level === SpaceLevel.L1 &&
    Boolean(currentItemId) &&
    dashboardNavigationRoot?.canCreateSubspace;

  // do not show the block as L2 subspaces doesn't have subspaces
  // do not show if there are no children and the navigation is compact
  if (level === SpaceLevel.L2 || (!dashboardNavigationRoot?.children?.length && compact)) {
    return <Box />; // Box because of cut drop shadow on the buttons above
  }

  return (
    <PageContentBlock sx={{ py: gutters(0.5), px: gutters(0.1) }} disablePadding disableGap>
      {!compact && (
        <Collapse in={!isSnapped || isTopLevel}>
          <RouterLink to={dashboardNavigationRoot?.url ?? ''}>
            <PageContentBlockHeader
              title={
                <Tooltip title={<Caption>{dashboardNavigationRoot?.displayName}</Caption>}>
                  <Box component="span">{dashboardNavigationRoot?.displayName}</Box>
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
          <Box>
            {hasCreate && (
              <DashboardAddButton level={1} onClick={() => onCreateSubspace?.({ id: currentItemId ?? '' })} />
            )}
          </Box>
        </Collapse>
      )}
      <Box height={viewportSnap.height} overflow="hidden" sx={{ transition: 'height 0.3s ease-in-out' }}>
        <Box
          ref={contentWrapperRef}
          sx={{
            transform: theme => `translate(${contentTranslationX(theme)}, ${contentTranslationY()})`,
            width: contentWidth,
            transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out',
          }}
        >
          {dashboardNavigationRoot && (
            <DashboardNavigationItemView
              ref={itemRef}
              tooltipPlacement={tooltipPlacement}
              onToggle={adjustViewport}
              compact={compact}
              itemProps={itemProps}
              {...dashboardNavigationRoot}
              {...getItemProps(dashboardNavigationRoot)}
            />
          )}
        </Box>
      </Box>
      {isTopLevel &&
        (showAll ? null : (
          <Actions padding={1} justifyContent="center">
            <Button
              startIcon={!compact && <ExpandMore />}
              onClick={() => setHasHeightLimit(false)}
              sx={{ textTransform: 'none', minWidth: 0, padding: 0.8 }}
            >
              {compact && <ExpandMore />}
              {!compact && t('components.dashboardNavigation.showAll')}
            </Button>
          </Actions>
        ))}
    </PageContentBlock>
  );
};

export default DashboardNavigation;
