import React, { forwardRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayout';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { CalloutState, WhiteboardDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import WhiteboardCard from './WhiteboardCard';
import { buildWhiteboardUrl } from '../../../../main/routing/urlBuilders';
import { WhiteboardCardWhiteboard } from './types';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { compact } from 'lodash';

interface WhiteboardCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  whiteboards: WhiteboardDetailsFragment[];
  createNewWhiteboard: () => Promise<{ nameID: string } | undefined>;
}

const WhiteboardCollectionCallout = forwardRef<Element, WhiteboardCollectionCalloutProps>(
  (
    {
      callout,
      whiteboards,
      spaceNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      canCreate = false,
      contributionsCount,
      createNewWhiteboard,
      ...calloutLayoutProps
    },
    ref
  ) => {
    const navigate = useNavigate();

    const handleCreate = async () => {
      const result = await createNewWhiteboard();
      if (result?.nameID) {
        navigate(
          buildWhiteboardUrl(callout.nameID, result?.nameID, { spaceNameId, challengeNameId, opportunityNameId })
        );
      }
    };

    const createButton = canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={handleCreate} />
    );

    const navigateToWhiteboard = (whiteboard: WhiteboardCardWhiteboard) => {
      navigate(
        buildWhiteboardUrl(whiteboard.calloutNameId, whiteboard.nameID, {
          spaceNameId: spaceNameId!,
          challengeNameId,
          opportunityNameId,
        })
      );
    };

    const calloutWhiteboards = compact(
      whiteboards.map(whiteboard => (whiteboard ? { ...whiteboard, calloutNameId: callout.nameID } : undefined))
    );

    const showCards = useMemo(
      () => (!loading && calloutWhiteboards.length > 0) || callout.contributionPolicy.state !== CalloutState.Closed,
      [loading, calloutWhiteboards.length, callout.contributionPolicy.state]
    );

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    return (
      <CalloutLayout
        contentRef={ref}
        callout={callout}
        contributionsCount={contributionsCount}
        {...calloutLayoutProps}
        disableMarginal
      >
        {showCards && (
          <ScrollableCardsLayout
            items={loading ? [undefined, undefined] : calloutWhiteboards}
            deps={[spaceNameId, challengeNameId, opportunityNameId]}
            createButton={!isMobile && createButton}
            maxHeight={gutters(22)}
          >
            {whiteboard =>
              whiteboard ? (
                <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} onClick={navigateToWhiteboard} />
              ) : (
                <Skeleton />
              )
            }
          </ScrollableCardsLayout>
        )}
        {isMobile && canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
          <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={handleCreate} />
        )}
      </CalloutLayout>
    );
  }
);

export default WhiteboardCollectionCallout;