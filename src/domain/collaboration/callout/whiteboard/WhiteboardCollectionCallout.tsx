import React, { forwardRef, useMemo } from 'react';
import useNavigate from '../../../../core/routing/useNavigate';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayout';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import WhiteboardCard, { WhiteboardCardWhiteboard } from './WhiteboardCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { normalizeLink } from '../../../../core/utils/links';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';

interface WhiteboardCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  whiteboards: (Identifiable & WhiteboardCardWhiteboard)[];
  createNewWhiteboard: () => Promise<{ profile: { url: string } } | undefined>;
}

const WhiteboardCollectionCallout = forwardRef<Element, WhiteboardCollectionCalloutProps>(
  (
    {
      callout,
      whiteboards,
      loading,
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
      if (result) {
        navigate(normalizeLink(result.profile.url), {
          state: {
            [LocationStateKeyCachedCallout]: callout,
            keepScroll: true,
          },
        });
      }
    };

    const createButton = canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={handleCreate} />
    );

    const showCards = useMemo(
      () => (!loading && whiteboards.length > 0) || callout.contributionPolicy.state !== CalloutState.Closed,
      [loading, whiteboards.length, callout.contributionPolicy.state]
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
            items={loading ? [undefined, undefined] : whiteboards}
            createButton={!isMobile && createButton}
            maxHeight={gutters(22)}
          >
            {whiteboard =>
              whiteboard ? (
                <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} callout={callout} />
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
