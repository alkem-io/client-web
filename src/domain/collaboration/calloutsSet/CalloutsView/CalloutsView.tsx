import { Box } from '@mui/material';
import { times, without } from 'lodash-es';
import useNavigate from '@/core/routing/useNavigate';
import PageContentBlock, { type PageContentBlockProps } from '@/core/ui/content/PageContentBlock';
import {
  type LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import type { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import CalloutView, { CalloutViewSkeleton } from '../../callout/CalloutView/CalloutView';
import type { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import type { CalloutModelLightExtended } from '../../callout/models/CalloutModelLight';
import { useCalloutManager } from '../../callout/utils/useCalloutManager';
import type { OrderUpdate } from '../useCalloutsSet/useCalloutsSet';
import type { CalloutSortEvents, CalloutSortProps } from './CalloutSortModels';
import useCalloutInView from './useCalloutInView';

const CalloutsViewSkeleton = () => times(3).map(i => <CalloutViewSkeleton key={i} />);

export interface CalloutsViewProps {
  callouts: CalloutModelLightExtended[] | undefined;
  calloutsSetId: string | undefined;
  onSortOrderUpdate?: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  // biome-ignore lint/suspicious/noConfusingVoidType: callers return void from non-async callbacks
  onCalloutUpdate?: (calloutId: string) => Promise<unknown> | void;
  loading?: boolean;
  blockProps?:
    | Partial<PageContentBlockProps>
    | ((callout: CalloutModelLightExtended, index: number) => Partial<PageContentBlockProps> | undefined);
  calloutRestrictions?: CalloutRestrictions;
  disableClassification?: boolean;
}

const CalloutsView = ({
  callouts,
  calloutsSetId,
  loading = false,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  calloutRestrictions,
  disableClassification,
}: CalloutsViewProps) => {
  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();

  const sortedCallouts = callouts?.sort((a, b) => a.sortOrder - b.sortOrder);

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
            <PageContentBlock key={callout.id} disablePadding={true} disableGap={true} {...computedBlockProps}>
              <CalloutInViewItem
                calloutId={callout.id}
                calloutsSetId={calloutsSetId}
                withClassification={!disableClassification}
                activity={callout.activity}
                onCalloutUpdate={onCalloutUpdate ? () => onCalloutUpdate(callout.id) : undefined}
                onVisibilityChange={changeCalloutVisibility}
                onCalloutDelete={deleteCallout}
                onExpand={handleExpand}
                calloutRestrictions={calloutRestrictions}
                sortEvents={sortEvents}
                sortProps={sortProps}
              />
            </PageContentBlock>
          );
        })}
    </>
  );
};

const CalloutInViewItem = ({
  calloutId,
  calloutsSetId,
  withClassification,
  activity,
  onCalloutUpdate,
  onVisibilityChange,
  onCalloutDelete,
  onExpand,
  calloutRestrictions,
  sortEvents,
  sortProps,
}: {
  calloutId: string;
  calloutsSetId: string | undefined;
  withClassification: boolean;
  activity: number | undefined;
  // biome-ignore lint/suspicious/noConfusingVoidType: callers return void from non-async callbacks
  onCalloutUpdate: (() => Promise<unknown> | void) | undefined;
  onVisibilityChange: ReturnType<typeof useCalloutManager>['changeCalloutVisibility'];
  onCalloutDelete: ReturnType<typeof useCalloutManager>['deleteCallout'];
  onExpand: (callout: CalloutDetailsModelExtended) => void;
  calloutRestrictions: CalloutRestrictions | undefined;
  sortEvents: CalloutSortEvents | undefined;
  sortProps: CalloutSortProps;
}) => {
  const { ref, inView, callout, loading, refetch } = useCalloutInView({
    calloutId,
    calloutsSetId,
    withClassification,
  });

  return (
    <Box ref={ref}>
      {inView && callout ? (
        <CalloutView
          callout={callout}
          loading={loading}
          contributionsCount={activity}
          onCalloutUpdate={async () => {
            await onCalloutUpdate?.();
            await refetch();
          }}
          onVisibilityChange={onVisibilityChange}
          onCalloutDelete={onCalloutDelete}
          onExpand={onExpand}
          calloutRestrictions={calloutRestrictions}
          {...sortEvents}
          {...sortProps}
        />
      ) : (
        <CalloutViewSkeleton />
      )}
    </Box>
  );
};

export default CalloutsView;
