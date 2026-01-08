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
import { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';
import useCalloutContributions from '../useCalloutContributions/useCalloutContributions';
import PaginationExpander from './PaginationExpander';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import AutomaticOverflowGradient from '@/core/ui/overflow/AutomaticOverflowGradient';
import { gutters } from '@/core/ui/grid/utils';

interface ContributionsCardsExpandableProps extends BaseCalloutViewProps {
  contributionType: CalloutContributionType;
  contributionCardComponent: ComponentType<CalloutContributionCardComponentProps>;
  createContributionButtonComponent?: ComponentType<CalloutContributionCreateButtonProps>;
  calloutRestrictions?: CalloutRestrictions;
  onClickOnContribution: (contribution: AnyContribution) => void;
}

const CONTRIBUTIONS_PER_ROW = 5;

const ContributionsCardsExpandable = ({
  callout,
  contributionType,
  contributionCardComponent: Card,
  createContributionButtonComponent: CreateContributionButton,
  onClickOnContribution,
  calloutRestrictions,
  loading: loadingCallout,
  expanded: calloutExpanded,
  onCalloutUpdate,
}: ContributionsCardsExpandableProps) => {
  const { t } = useTranslation();
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const pageSize = CONTRIBUTIONS_PER_ROW * 2; // 2 rows maximum

  const {
    inViewRef,
    contributions: { items: contributions, hasMore, setFetchAll, total: totalContributions },
    loading: loadingContributions,
    canCreateContribution,
    onCalloutContributionsUpdate,
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
    if (isSmallScreen) return 3;
    if (isMediumSmallScreen) return 9;
    if (calloutExpanded) return 15;
    return 15;
  })();

  return (
    <>
      <PageContentBlockHeader title={t('callout.contributions.contributions', { count: totalContributions ?? 0 })}>
        {!loadingCallout && CreateContributionButton && (
          <CreateContributionButton
            callout={callout}
            canCreateContribution={canCreateContribution}
            onContributionCreated={onCalloutContributionsUpdate}
            calloutRestrictions={calloutRestrictions}
          />
        )}
      </PageContentBlockHeader>
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
                columns={3}
                contribution={contribution}
                onClick={() => onClickOnContribution(contribution)}
              />
            ))}
            {loadingContributions &&
              times(pageSize, index => <ContributeCardSkeleton key={index} columns={calloutExpanded ? 2 : 3} />)}
          </Gutters>
        </GridProvider>
      </AutomaticOverflowGradient>
    </>
  );
};

export default ContributionsCardsExpandable;
