import { useMemo } from 'react';
import { useCalloutManager } from '../../callout/utils/useCalloutManager';
import { OrderUpdate } from '../useCalloutsSet/useCalloutsSet';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import { CalloutSortEvents, CalloutSortProps } from './CalloutSortModels';
import CalloutView, { CalloutViewSkeleton } from '../../callout/CalloutView/CalloutView';
import useNavigate from '@/core/routing/useNavigate';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import PageContentBlock, { PageContentBlockProps } from '@/core/ui/content/PageContentBlock';
import { times, without } from 'lodash';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { CalloutModelLightExtended } from '../../callout/models/CalloutModelLight';
import InViewDetector from '@/core/ui/utils/InViewDetector';
import CalloutDetailsContainer from '../../callout/useCalloutDetails/CalloutDetailsContainer';

const CalloutsViewSkeleton = () => times(3).map(i => <CalloutViewSkeleton key={i} />);

export interface CalloutsViewProps {
  callouts: CalloutModelLightExtended[] | undefined;
  onSortOrderUpdate?: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  onCalloutUpdate?: (calloutId: string) => Promise<unknown> | void;
  loading?: boolean;
  blockProps?:
    | Partial<PageContentBlockProps>
    | ((callout: CalloutModelLightExtended, index: number) => Partial<PageContentBlockProps> | undefined);
  calloutRestrictions?: CalloutRestrictions;
}

const CalloutsView = ({
  callouts,
  loading = false,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  calloutRestrictions: calloutRestrictions,
}: CalloutsViewProps) => {
  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();

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

  const handleExpand = (callout: CalloutDetailsModelExtended) => {
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
    return navigate(callout.framing.profile.url, { state });
  };

  const isLoading = loading && !sortedCallouts;

  return (
    <>
      {isLoading && <CalloutsViewSkeleton />}
      {!isLoading &&
        sortedCallouts?.map((callout, index) => {
          const sortProps: CalloutSortProps = {
            topCallout: index === 0,
            bottomCallout: index === sortedCallouts.length - 1,
          };

          const computedBlockProps = typeof blockProps === 'function' ? blockProps(callout, index) : blockProps;
          /*
          <CalloutDetailsContainer callout={callout}>
                          {({ ref, callout: calloutDetails, loading }) => (
                            <Box ref={ref}>
                              {(loading || !calloutDetails) && <CalloutViewSkeleton />}
                              {!loading && calloutDetails && (
                              ...
                              )}
                            </Box>
                          )}
                        </CalloutDetailsContainer>
                              */
          return (
            <PageContentBlock key={callout.id} disablePadding disableGap {...computedBlockProps}>
              <InViewDetector>
                {({ inView }) => (
                  <CalloutDetailsContainer calloutId={callout.id} withClassification skip={!inView}>
                    {({ callout: calloutDetails }) => (
                      <CalloutView
                        callout={calloutDetails}
                        contributionsCount={callout.activity}
                        onCalloutUpdate={() => onCalloutUpdate?.(callout.id)}
                        onVisibilityChange={changeCalloutVisibility}
                        onCalloutDelete={deleteCallout}
                        onExpand={handleExpand}
                        calloutRestrictions={calloutRestrictions}
                        {...sortEvents}
                        {...sortProps}
                      />
                    )}
                  </CalloutDetailsContainer>
                )}
              </InViewDetector>
            </PageContentBlock>
          );
        })}
    </>
  );
};

export default CalloutsView;
