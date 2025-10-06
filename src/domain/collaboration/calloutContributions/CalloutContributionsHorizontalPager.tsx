import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Button, styled } from '@mui/material';
import React, { ComponentType, useEffect, useMemo, useState } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../CalloutPage/CalloutPage';
import { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';
import useNavigate from '@/core/routing/useNavigate';
import useCalloutContributions from './useCalloutContributions/useCalloutContributions';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { AnyContribution } from './interfaces/AnyContributionType';
import { CalloutContributionCardComponentProps } from './interfaces/CalloutContributionCardComponentProps';
import { times } from 'lodash';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { useColumns } from '@/core/ui/grid/GridContext';

const ResponsiveConfiguration: Record<
  number, // key: Number of columns available
  {
    PageSize: number;
    ColumnsPerCard: number;
    ColumnsScroller: number; // Columns available for the cards
    ScrollerButtons: 'small' | 'big'; // Scroller buttons big: next to the cards, small: with the pagination dots
    SingleRow: boolean; // All cards in a single row
  }
> = {
  [4]: {
    PageSize: 3,
    ColumnsPerCard: 4,
    ColumnsScroller: 4,
    ScrollerButtons: 'small',
    SingleRow: false,
  },
  [8]: {
    PageSize: 3,
    ColumnsPerCard: 2,
    ColumnsScroller: 6,
    ScrollerButtons: 'small',
    SingleRow: true,
  },
  [12]: {
    PageSize: 5,
    ColumnsPerCard: 2,
    ColumnsScroller: 11,
    ScrollerButtons: 'big',
    SingleRow: true,
  },
} as const;

interface CalloutContributionsHorizontalPagerProps {
  callout: CalloutDetailsModelExtended;
  contributionSelectedId?: string;
  contributionType: CalloutContributionType;
  loading?: boolean;
  cardComponent: ComponentType<CalloutContributionCardComponentProps>;
  getContributionUrl: (contribution: AnyContribution) => string | undefined;
}

const ScrollButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  border: 0,
  width: gutters()(theme),
  minWidth: 0,
  color: theme.palette.primary.dark,
}));

const PaginationDot = styled(Box, {
  shouldForwardProp: prop => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.divider,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    opacity: 0.7,
  },
}));

const CalloutContributionsHorizontalPager = ({
  ref,
  callout,
  contributionType,
  contributionSelectedId,
  cardComponent: Card,
  getContributionUrl,
}: CalloutContributionsHorizontalPagerProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const navigate = useNavigate();

  /**
   * Used to move to the correct page when a contributionId is provided, but only once
   */
  const [autoSelectPage, setAutoSelectPage] = useState(true);
  const [selectedPage, setSelectedPage] = useState(0);

  const availableColumns = useColumns();
  const responsiveConfig = ResponsiveConfiguration[availableColumns] ?? ResponsiveConfiguration[12];

  const { inViewRef, contributions, loading } = useCalloutContributions({
    callout,
    contributionType,
    pageSize: responsiveConfig.PageSize,
  });

  const { hasMore, items, setFetchAll, total } = contributions;

  // Always fetch all contributions in this viewer, we'll paginate them in the UI
  useEffect(() => {
    if (hasMore && !loading && total > items.length) {
      setFetchAll(true);
    }
  }, [hasMore, items, loading, setFetchAll, total]);

  const pages = useMemo(() => {
    const chunkedPages: AnyContribution[][] = [];
    for (let i = 0; i < items.length; i += responsiveConfig.PageSize) {
      chunkedPages.push(items.slice(i, i + responsiveConfig.PageSize));
    }
    return chunkedPages;
  }, [items, items.length, responsiveConfig, availableColumns]);

  useEffect(() => {
    if (!autoSelectPage) {
      return;
    }
    if (contributionSelectedId) {
      pages.some((page, index) => {
        if (page.find(contribution => contribution.id === contributionSelectedId)) {
          setSelectedPage(index);
          setAutoSelectPage(false);
          return true; // Break the loop
        }
      });
    }
  }, [pages, contributionSelectedId]);

  const handleClickOnContribution = (contribution: AnyContribution) => {
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
    const url = getContributionUrl(contribution);
    if (url) {
      navigate(url, { state });
    }
  };

  const handleClickLeft = () => {
    setSelectedPage(prev => (prev === 0 ? pages.length - 1 : prev - 1));
  };

  const handleClickRight = () => {
    setSelectedPage(prev => (prev === pages.length - 1 ? 0 : prev + 1));
  };

  const currentPageItems = pages[selectedPage] || [];
  const fullRow = currentPageItems.length >= responsiveConfig.PageSize; // we have 5 items in this page

  return (
    <Gutters ref={inViewRef} disableSidePadding>
      <Gutters
        row
        disablePadding
        justifyContent={fullRow ? 'space-between' : undefined}
        ref={ref}
        flexWrap={responsiveConfig.SingleRow ? 'nowrap' : 'wrap'}
      >
        {responsiveConfig.ScrollerButtons === 'big' && (
          <ScrollButton onClick={handleClickLeft} disabled={pages.length < 2}>
            <KeyboardDoubleArrowLeftIcon />
          </ScrollButton>
        )}
        <GridProvider columns={responsiveConfig.ColumnsScroller} force>
          {loading &&
            times(5, index => <ContributeCardSkeleton key={index} columns={responsiveConfig.ColumnsPerCard} />)}
          {!loading &&
            currentPageItems.map(contribution => (
              <Card
                key={contribution.id}
                callout={callout}
                contribution={contribution}
                onClick={() => handleClickOnContribution(contribution)}
                selected={contribution.id === contributionSelectedId}
                columns={responsiveConfig.ColumnsPerCard}
              />
            ))}
        </GridProvider>
        {responsiveConfig.ScrollerButtons === 'big' && (
          <ScrollButton
            onClick={handleClickRight}
            disabled={pages.length < 2}
            sx={{ marginLeft: !fullRow ? 'auto' : undefined }}
          >
            <KeyboardDoubleArrowRightIcon />
          </ScrollButton>
        )}
      </Gutters>
      <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={2}>
        {responsiveConfig.ScrollerButtons === 'small' && (
          <ScrollButton onClick={handleClickLeft} disabled={pages.length < 2}>
            <KeyboardDoubleArrowLeftIcon />
          </ScrollButton>
        )}
        {pages.map((_, index) => (
          <PaginationDot key={index} selected={index === selectedPage} onClick={() => setSelectedPage(index)} />
        ))}
        {responsiveConfig.ScrollerButtons === 'small' && (
          <ScrollButton onClick={handleClickRight} disabled={pages.length < 2}>
            <KeyboardDoubleArrowRightIcon />
          </ScrollButton>
        )}
      </Box>
    </Gutters>
  );
};

export default CalloutContributionsHorizontalPager;
