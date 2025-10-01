import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Button, styled } from '@mui/material';
import React, { ComponentType } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../CalloutPage/CalloutPage';
import { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';
import useNavigate from '@/core/routing/useNavigate';

interface ContributionCardProps<T> {
  contribution: T;
  columns: number;
  onClick: () => void;
  selected?: boolean;
}

interface CalloutContributionsScrollerProps<T extends Identifiable> {
  callout: CalloutDetailsModelExtended;
  contributionSelectedId?: string;
  contributions: {
    items: T[];
    total: number;
  };
  canCreateContribution: boolean;
  loading?: boolean;
  cardComponent: ComponentType<ContributionCardProps<T>>;
  getContributionUrl: (contribution: T) => string | undefined;
  // subscriptionEnabled: boolean;
  // onCalloutUpdate?: () => Promise<unknown>;
}

const ScrollButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  border: 0,
  width: gutters()(theme),
  minWidth: 0,
  color: theme.palette.primary.dark,
}));

const CalloutContributionsScroller = <T extends Identifiable>({
  ref,
  callout,
  contributionSelectedId,
  contributions,
  cardComponent: Card,
  getContributionUrl,
}: CalloutContributionsScrollerProps<T> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const navigate = useNavigate();

  const navigateToContribution = (contribution: T) => {
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

  };
  const handleClickRight = () => {

  };

  return (
    <Gutters disableSidePadding>
      <Gutters row disablePadding ref={ref}>
        <ScrollButton onClick={handleClickLeft}><KeyboardDoubleArrowLeftIcon /></ScrollButton>
        <GridProvider columns={10} force>
          {contributions.items.map(contribution => (
            <Card
              key={contribution.id}
              contribution={contribution}
              onClick={() => navigateToContribution(contribution)}
              selected={contribution.id === contributionSelectedId}
              columns={2}
            />
          ))}
        </GridProvider>
        <ScrollButton onClick={handleClickRight} sx={{ marginLeft: 'auto' }}><KeyboardDoubleArrowRightIcon /></ScrollButton>
      </Gutters>

    </Gutters>
  );
};

export default CalloutContributionsScroller;