import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';
import Loading from '@/core/ui/loading/Loading';
import { times } from 'lodash';
import { ComponentType, useEffect, useState } from 'react';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import { AnyContribution } from '../interfaces/AnyContributionType';
import { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';
import useCalloutContributions from '../useCalloutContributions/useCalloutContributions';
import PaginationExpander from './PaginationExpander';
import AutomaticOverflowGradient from '@/core/ui/overflow/AutomaticOverflowGradient';
import { gutters } from '@/core/ui/grid/utils';

interface ContributionsCardsExpandableProps extends BaseCalloutViewProps {
  contributionType: CalloutContributionType;
  contributionCardComponent: ComponentType<CalloutContributionCardComponentProps>;
  onClickOnContribution: (contribution: AnyContribution) => void;
}

const CONTRIBUTIONS_PER_ROW = 5;
const GRID_COLUMNS_PER_CARD = 3;

const ContributionsCardsExpandable = ({
  callout,
  contributionType,
  contributionCardComponent: Card,
  onClickOnContribution,
  loading: loadingCallout,
  expanded: calloutExpanded,
  onCalloutUpdate,
}: ContributionsCardsExpandableProps) => {
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const pageSize = CONTRIBUTIONS_PER_ROW * 2; // 2 rows maximum

  const {
    inViewRef,
    contributions: { items: contributions, hasMore, setFetchAll, total: totalContributions },
    loading: loadingContributions,
  } = useCalloutContributions({
    callout,
    contributionType,
    onCalloutUpdate,
    pageSize,
  });

  // Always show all Links in callout expanded mode:
  // Do not confuse Callout expanded with this component's expanded mode:
  //  - Callout expanded means the whole Callout is expanded to a dialog.
  //  - This component's expanded means showing all contributions, not just the first 4.
  useEffect(() => {
    if (calloutExpanded && hasMore) {
      setFetchAll(true);
    } else {
      setFetchAll(!isCollapsed);
    }
  }, [calloutExpanded, hasMore, setFetchAll, isCollapsed]);

  const gridColumns = (() => {
    if (isSmallScreen) return GRID_COLUMNS_PER_CARD; // 1 card per row
    if (isMediumSmallScreen) return GRID_COLUMNS_PER_CARD * 3; // 3 cards per row
    return GRID_COLUMNS_PER_CARD * 5; // 5 cards per row
  })();

  return (
    <>
      {loadingCallout && <Loading />}
      <AutomaticOverflowGradient
        maxHeight={isCollapsed ? gutters(15) : undefined}
        minHeight={0}
        margin={gutters(-1)}
        padding={gutters()}
        expanderButton={
          <PaginationExpander
            onClick={() => setIsCollapsed(!isCollapsed)}
            totalContributions={totalContributions}
            pageSize={CONTRIBUTIONS_PER_ROW}
            isCollapsed={isCollapsed}
            hasMore={hasMore}
          />
        }
      >
        <GridProvider columns={gridColumns} force>
          <Gutters ref={inViewRef} disablePadding row flexWrap="wrap">
            {contributions.map(contribution => (
              <Card
                key={contribution.id}
                callout={callout}
                columns={GRID_COLUMNS_PER_CARD}
                contribution={contribution}
                onClick={() => onClickOnContribution(contribution)}
              />
            ))}
            {loadingContributions &&
              times(pageSize, index => <ContributeCardSkeleton key={index} columns={GRID_COLUMNS_PER_CARD} />)}
          </Gutters>
        </GridProvider>
      </AutomaticOverflowGradient>
    </>
  );
};

export default ContributionsCardsExpandable;
