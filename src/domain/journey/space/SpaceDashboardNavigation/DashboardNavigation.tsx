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

const findCurrentLevel = (
  dashboardNavigation: DashboardNavigationItem[] | undefined,
  currentItemId: string | undefined,
  level = 0
) => {
  if (!currentItemId || !dashboardNavigation) {
    return undefined;
  }
  if (dashboardNavigation.some(item => item.id === currentItemId)) {
    return level;
  } else {
    for (const item of dashboardNavigation) {
      if (!item.children) {
        continue;
      }
      const found = findCurrentLevel(item.children, currentItemId, level + 1);
      if (typeof found === 'number') {
        return found;
      }
    }
    return undefined;
  }
};

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

  const currentLevel = findCurrentLevel(dashboardNavigation, currentItemId) ?? -1;

  const itemRefs = useRef<Record<string, DashboardNavigationItemViewApi | null>>({}).current;

  const itemRef = (itemId: string) => (element: DashboardNavigationItemViewApi | null) => {
    itemRefs[itemId] = element;
  };

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [viewportSnap, setViewportSnap] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  });

  const adjustViewport = () => {
    const itemRef = currentItemId && itemRefs[currentItemId];

    if (!isSnappedToCurrentSubspace || !itemRef) {
      setViewportSnap(snap =>
        produce(snap, snap => {
          const contentHeight = contentWrapperRef.current?.getBoundingClientRect().height ?? 0;
          const maxHeight = hasHeightLimit ? GUTTER_PX * VISIBLE_ROWS_WHEN_COLLAPSED * 3 : Infinity;

          snap.top = 0;
          snap.height = Math.min(maxHeight, contentHeight);
        })
      );
      return;
    }

    setViewportSnap(snap =>
      produce(snap, snap => {
        const itemBounds = itemRef.getBoundingClientRect();

        const parentBounds = contentWrapperRef.current?.getBoundingClientRect();

        const offsetTop =
          typeof parentBounds?.top === 'number' && typeof itemBounds?.top === 'number'
            ? itemBounds.top - parentBounds.top
            : 0;

        snap.height = itemBounds?.height ?? parentBounds?.height ?? 0;
        snap.top = offsetTop;
      })
    );
  };

  useLayoutEffect(adjustViewport, [currentItemId, dashboardNavigation, isSnappedToCurrentSubspace, hasHeightLimit]);

  const contentTranslationX = (theme: Theme) =>
    isSnappedToCurrentSubspace && currentLevel !== -1 ? gutters(-currentLevel * 2)(theme) : 0;
  const contentTranslationY = () => `-${viewportSnap.top}px`;
  const contentWidth = (theme: Theme) =>
    isSnappedToCurrentSubspace && currentLevel !== -1 ? `calc(100% + ${gutters(currentLevel * 2)(theme)})` : '100%';

  const getItemProps = typeof itemProps === 'function' ? itemProps : () => itemProps;

  return (
    <PageContentBlock disablePadding disableGap>
      <Collapse in={!isSnappedToCurrentSubspace || currentLevel === -1}>
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
            return (
              <DashboardNavigationItemView
                key={id}
                ref={itemRef(id)}
                visualUri={avatar?.uri}
                current={id === currentItemId}
                tooltipPlacement={tooltipPlacement}
                onToggle={adjustViewport}
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
      {currentLevel === -1 &&
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
