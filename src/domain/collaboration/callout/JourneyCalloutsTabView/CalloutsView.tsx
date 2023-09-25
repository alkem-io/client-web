import React, { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useScrollToElement from '../../../shared/utils/scroll/useScrollToElement';
import { useCalloutEdit } from '../edit/useCalloutEdit/useCalloutEdit';
import { OrderUpdate, TypedCallout } from '../useCallouts/useCallouts';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { CalloutSortEvents, CalloutSortProps } from '../CalloutViewTypes';
import CalloutView, { CalloutViewProps } from '../CalloutView/CalloutView';
import { useNavigate } from 'react-router-dom';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import { CardHeader, Skeleton } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardFooter from '../../../../core/ui/card/CardFooter';
import { gutters } from '../../../../core/ui/grid/utils';
import { without } from 'lodash';

const CalloutsViewSkeleton = () => (
  <PageContentBlock>
    <Skeleton />
    <ContributeCard>
      <CardHeader title={<Skeleton />} />
      <Skeleton sx={{ height: gutters(8), marginX: gutters() }} />
      <CardFooter>
        <Skeleton width="100%" />
      </CardFooter>
    </ContributeCard>
  </PageContentBlock>
);

export interface CalloutsViewProps {
  callouts: TypedCallout[] | undefined;
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
  onSortOrderUpdate?: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  onCalloutUpdate?: (calloutId: string) => void;
  loading?: boolean;
  calloutNames: string[];
  blockProps?:
    | CalloutViewProps['blockProps']
    | ((callout: TypedCallout, index: number) => CalloutViewProps['blockProps']);
  disableMarginal?: boolean;
}

const CalloutsView = ({
  callouts,
  journeyTypeName,
  calloutNames,
  scrollToCallout = false,
  loading = false,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  disableMarginal,
}: CalloutsViewProps) => {
  const { spaceNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  // Scroll to Callout handler:
  const { scrollable } = useScrollToElement(calloutNameId, { enabled: scrollToCallout });

  const sortedCallouts = useMemo(() => callouts?.sort((a, b) => a.sortOrder - b.sortOrder), [callouts]);

  const sortEvents: CalloutSortEvents | undefined = onSortOrderUpdate && {
    onMoveToTop: movedCalloutId => {
      onSortOrderUpdate(movedCalloutId)(relatedCalloutIds => {
        const next = without(relatedCalloutIds, movedCalloutId);
        next.unshift(movedCalloutId);
        return next;
      });
    },
    onMoveToBottom: movedCalloutId => {
      onSortOrderUpdate(movedCalloutId)(relatedCalloutIds => {
        const next = without(relatedCalloutIds, movedCalloutId);
        next.push(movedCalloutId);
        return next;
      });
    },
    onMoveUp: movedCalloutId => {
      onSortOrderUpdate(movedCalloutId)(relatedCalloutIds => {
        const index = relatedCalloutIds.indexOf(movedCalloutId);
        if (index > 0) {
          const next = without(relatedCalloutIds, movedCalloutId);
          next.splice(index - 1, 0, movedCalloutId);
          return next;
        }
        return relatedCalloutIds;
      });
    },
    onMoveDown: movedCalloutId => {
      onSortOrderUpdate(movedCalloutId)(relatedCalloutIds => {
        const index = relatedCalloutIds.indexOf(movedCalloutId);
        if (index < relatedCalloutIds.length) {
          const next = without(relatedCalloutIds, movedCalloutId);
          next.splice(index + 1, 0, movedCalloutId);
          return next;
        }
        return relatedCalloutIds;
      });
    },
  };

  const navigate = useNavigate();

  const handleExpand = (callout: TypedCallout) => {
    const uri = buildCalloutUrl(callout.nameID, {
      spaceNameId,
      challengeNameId,
      opportunityNameId,
    });
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
    };
    return navigate(uri, { state });
  };

  return (
    <>
      {loading && <CalloutsViewSkeleton />}
      {!loading &&
        sortedCallouts?.map((callout, index) => {
          const sortProps: CalloutSortProps = {
            topCallout: index === 0,
            bottomCallout: index === sortedCallouts.length - 1,
          };

          const calloutUri = buildCalloutUrl(callout.nameID, {
            spaceNameId,
            challengeNameId,
            opportunityNameId,
          });

          return (
            <CalloutView
              key={callout.id}
              ref={scrollable(callout.nameID)}
              callout={callout}
              calloutNames={calloutNames}
              contributionsCount={callout.activity}
              spaceNameId={spaceNameId}
              challengeNameId={challengeNameId}
              opportunityNameId={opportunityNameId}
              journeyTypeName={journeyTypeName}
              onCalloutEdit={handleEdit}
              onCalloutUpdate={() => onCalloutUpdate?.(callout.id)}
              onVisibilityChange={handleVisibilityChange}
              onCalloutDelete={handleDelete}
              calloutUri={calloutUri}
              onExpand={() => handleExpand(callout)}
              blockProps={typeof blockProps === 'function' ? blockProps(callout, index) : blockProps}
              disableMarginal={disableMarginal}
              {...sortEvents}
              {...sortProps}
            />
          );
        })}
    </>
  );
};

export default CalloutsView;
