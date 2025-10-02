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

const PAGE_SIZE = 5;
const COLUMNS_PER_CARD = 2;
const COLUMNS_SCROLLER = PAGE_SIZE * COLUMNS_PER_CARD + 1;

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
  const [selectedPage, setSelectedPage] = useState(0);

  const {
    inViewRef,
    contributions,
    //!! canCreateContribution,
    loading,
  } = useCalloutContributions({
    callout,
    contributionType,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (contributions.hasMore && !loading && contributions.total > contributions.items.length) {
      contributions.setFetchAll(true);
    }
  }, [contributions]);

  const pages = useMemo(() => {
    const chunkedPages: AnyContribution[][] = [];
    for (let i = 0; i < contributions.items.length; i += PAGE_SIZE) {
      chunkedPages.push(contributions.items.slice(i, i + PAGE_SIZE));
    }
    return chunkedPages;
  }, [contributions.items]);

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
  const fullRow = currentPageItems.length >= PAGE_SIZE; // we have 5 items in this page

  return (
    <Gutters ref={inViewRef} disableSidePadding>
      <Gutters row disablePadding justifyContent={fullRow ? 'space-between' : undefined} ref={ref}>
        <ScrollButton onClick={handleClickLeft} disabled={pages.length < 2}>
          <KeyboardDoubleArrowLeftIcon />
        </ScrollButton>
        <GridProvider columns={COLUMNS_SCROLLER} force>
          {currentPageItems.map(contribution => (
            <Card
              key={contribution.id}
              callout={callout}
              contribution={contribution}
              onClick={() => handleClickOnContribution(contribution)}
              selected={contribution.id === contributionSelectedId}
              columns={COLUMNS_PER_CARD}
            />
          ))}
        </GridProvider>
        <ScrollButton
          onClick={handleClickRight}
          disabled={pages.length < 2}
          sx={{ marginLeft: !fullRow ? 'auto' : undefined }}
        >
          <KeyboardDoubleArrowRightIcon />
        </ScrollButton>
      </Gutters>

      <Box display="flex" justifyContent="center" gap={1} mt={2}>
        {pages.map((_, index) => (
          <PaginationDot key={index} selected={index === selectedPage} onClick={() => setSelectedPage(index)} />
        ))}
      </Box>
    </Gutters>
  );
};

export default CalloutContributionsHorizontalPager;
