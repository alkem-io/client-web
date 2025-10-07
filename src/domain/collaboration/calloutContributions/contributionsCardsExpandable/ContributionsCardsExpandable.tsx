import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import useCalloutContributions from '../useCalloutContributions/useCalloutContributions';
import { Trans, useTranslation } from 'react-i18next';
import { ComponentType, useEffect, useState } from 'react';
import GridProvider from '@/core/ui/grid/GridProvider';
import { useScreenSize } from '@/core/ui/grid/constants';
import React from 'react';
import { Box } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Gutters from '@/core/ui/grid/Gutters';
import { AnyContribution } from '../interfaces/AnyContributionType';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import useNavigate from '@/core/routing/useNavigate';
import { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';
import { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { times } from 'lodash';

interface ContributionsCardsExpandableProps extends BaseCalloutViewProps {
  contributionType: CalloutContributionType;
  contributionCardComponent: ComponentType<CalloutContributionCardComponentProps>;
  createContributionButtonComponent: ComponentType<CalloutContributionCreateButtonProps>;
  getContributionUrl: (contribution: AnyContribution) => string | undefined;
}

const NON_EXPANDED_PAGE_SIZE = 4;
const EXPANDED_PAGE_SIZE = 5;

const ContributionsCardsExpandable = ({
  callout,
  contributionType,
  contributionCardComponent: Card,
  createContributionButtonComponent: CreateContributionButton,
  getContributionUrl,
  loading: loadingCallout,
  expanded: calloutExpanded,
  onCalloutUpdate,
}: ContributionsCardsExpandableProps) => {
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const pageSize = calloutExpanded ? EXPANDED_PAGE_SIZE : NON_EXPANDED_PAGE_SIZE;

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

  const gridColumns = isSmallScreen ? 3 : isMediumSmallScreen ? 6 : calloutExpanded ? 10 : 12;
  return (
    <>
      <GridProvider columns={gridColumns} force>
        <Gutters ref={inViewRef} disablePadding row flexWrap="wrap">
          {contributions.map(contribution => (
            <Card
              key={contribution.id}
              callout={callout}
              columns={calloutExpanded ? 2 : 3}
              contribution={contribution}
              onClick={() => handleClickOnContribution(contribution)}
            />
          ))}
          {loadingContributions &&
            times(pageSize, index => <ContributeCardSkeleton key={index} columns={calloutExpanded ? 2 : 3} />)}
        </Gutters>
      </GridProvider>
      <Gutters display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <PaginationExpander
          onClick={() => setIsCollapsed(!isCollapsed)}
          totalContributions={totalContributions}
          pageSize={pageSize}
          isCollapsed={isCollapsed}
          hasMore={hasMore}
        />
        {loadingCallout && <Loading />}
        {!loadingCallout && (
          <CreateContributionButton
            callout={callout}
            canCreateContribution={canCreateContribution}
            onContributionCreated={onCalloutContributionsUpdate}
          />
        )}
      </Gutters>
    </>
  );
};

export default ContributionsCardsExpandable;

interface PaginationExpanderProps {
  onClick: () => void;
  totalContributions: number;
  pageSize: number;
  isCollapsed: boolean;
  hasMore: boolean;
}
const PaginationExpander = ({
  onClick,
  totalContributions,
  pageSize,
  isCollapsed,
  hasMore,
}: PaginationExpanderProps) => {
  const { t } = useTranslation();
  if (totalContributions === 0) {
    return (
      <Box>
        <Caption>{t('callout.contributions.noContributions')}</Caption>
      </Box>
    );
  }

  if (!isCollapsed) {
    return (
      <Box display="flex" flexDirection="row" alignContent="end" sx={{ cursor: 'pointer' }} onClick={onClick}>
        <ExpandLessIcon />
        <Caption>
          <Trans
            i18nKey="callout.contributions.contributionsCollapse"
            components={{
              click: <strong />,
            }}
            values={{ count: totalContributions }}
          />
        </Caption>
      </Box>
    );
  } else {
    if (!hasMore && totalContributions <= pageSize) {
      return <Caption>{t('callout.contributions.contributionsCount', { count: totalContributions })}</Caption>;
    } else {
      return (
        <Box display="flex" flexDirection="row" alignContent="end" sx={{ cursor: 'pointer' }} onClick={onClick}>
          <ExpandMoreIcon />
          <Caption>
            <Trans
              i18nKey="callout.contributions.contributionsItemsCountExpand"
              components={{
                click: <strong />,
              }}
              values={{ count: totalContributions }}
            />
          </Caption>
        </Box>
      );
    }
  }
};
