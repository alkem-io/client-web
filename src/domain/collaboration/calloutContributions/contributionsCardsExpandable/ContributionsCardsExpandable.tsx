import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
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

interface ContributionsCardsExpandableProps extends BaseCalloutViewProps {
  callout: CalloutDetailsModelExtended; //!! move this to BaseCalloutViewProps?
  contributionType: CalloutContributionType;
  contributionCardComponent: ComponentType<CalloutContributionCardComponentProps>;
  createContributionButtonComponent: ComponentType<CalloutContributionCreateButtonProps>;
  getContributionUrl: (contribution: AnyContribution) => string | undefined;
}

const NON_EXPANDED_PAGE_SIZE = 4;

const ContributionsCardsExpandable = ({
  callout,
  contributionType,
  contributionCardComponent: Card,
  createContributionButtonComponent: CreateContributionButton,
  getContributionUrl,
  loading,
  expanded: calloutExpanded,
  onCalloutUpdate,
}: ContributionsCardsExpandableProps) => {
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const {
    inViewRef,
    contributions: { items: contributions, hasMore, setFetchAll, total: totalContributions },
    canCreateContribution,
  } = useCalloutContributions({
    callout,
    contributionType,
    onCalloutUpdate,
    pageSize: NON_EXPANDED_PAGE_SIZE,
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

  return (
    <>
      <GridProvider columns={isSmallScreen ? 3 : isMediumSmallScreen ? 6 : 12} force>
        <Gutters ref={inViewRef} disablePadding row flexWrap="wrap">
          {contributions.map(contribution => (
            <Card
              key={contribution.id}
              callout={callout}
              contribution={contribution}
              onClick={() => handleClickOnContribution(contribution)}
            />
          ))}
        </Gutters>
      </GridProvider>
      <Gutters display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <PaginationExpander
          onClick={() => setIsCollapsed(!isCollapsed)}
          totalContributions={totalContributions}
          isCollapsed={isCollapsed}
          hasMore={hasMore}
        />
        {loading && <Loading />}
        {!loading && (
          <CreateContributionButton
            callout={callout}
            canCreateContribution={canCreateContribution}
            onContributionCreated={onCalloutUpdate}
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
  isCollapsed: boolean;
  hasMore: boolean;
}
const PaginationExpander = ({ onClick, totalContributions, isCollapsed, hasMore }: PaginationExpanderProps) => {
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
    if (!hasMore && totalContributions <= NON_EXPANDED_PAGE_SIZE) {
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
