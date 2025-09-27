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
import useCalloutDetails, { useCalloutDetailsProvided } from '../../callout/useCalloutDetails/useCalloutDetails';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Box } from '@mui/material';
import { useInView } from 'react-intersection-observer';

const CalloutsViewSkeleton = () => times(3).map(i => <CalloutViewSkeleton key={i} />);

export interface CalloutsViewProps {
  callouts: CalloutModelLightExtended[] | undefined;
  calloutsSetId: string | undefined;
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
  calloutsSetId,
  loading = false,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  calloutRestrictions,
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

          return (
            <PageContentBlock key={callout.id} disablePadding disableGap {...computedBlockProps}>
              <CalloutInViewWrapper calloutId={callout.id} calloutsSetId={calloutsSetId}>
                {({ callout: calloutDetails, loading, refetch }) => (
                  <CalloutView
                    callout={calloutDetails}
                    loading={loading}
                    contributionsCount={callout.activity}
                    onCalloutUpdate={async () => {
                      await onCalloutUpdate?.(callout.id);
                      await refetch();
                    }}
                    onVisibilityChange={changeCalloutVisibility}
                    onCalloutDelete={deleteCallout}
                    onExpand={handleExpand}
                    calloutRestrictions={calloutRestrictions}
                    {...sortEvents}
                    {...sortProps}
                  />
                )}
              </CalloutInViewWrapper>
            </PageContentBlock>
          );
        })}
    </>
  );
};

export default CalloutsView;

/**
 * Prints the <CalloutViewSkeleton if CalloutVIew is not in the view of the browser scrolled up, to avoid loading all the callouts at once,
 * skips the loading of the calloutDetails until de callout is inView
 */
interface CalloutDetailsContainerProvided {
  callout: useCalloutDetailsProvided['callout'];
  loading: boolean;
  refetch: () => Promise<unknown>;
}

interface CalloutInViewWrapperProps extends SimpleContainerProps<CalloutDetailsContainerProvided> {
  calloutId: string;
  calloutsSetId: string | undefined;
}

const CalloutInViewWrapper = ({ children, calloutId, calloutsSetId }: CalloutInViewWrapperProps) => {
  const { ref, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { callout, loading, refetch } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: true,
    skip: !inView,
  });

  return (
    <Box ref={ref}>
      {inView && children({ callout, loading, refetch })}
      {!inView && <CalloutViewSkeleton />}
    </Box>
  );
};
