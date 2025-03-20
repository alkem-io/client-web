import { useMemo } from 'react';
import { useCalloutEdit } from '../../callout/edit/useCalloutEdit/useCalloutEdit';
import { OrderUpdate, TypedCallout, TypedCalloutDetails } from '../useCalloutsSet/useCalloutsSet';
import { CalloutSortEvents, CalloutSortProps } from '../../callout/CalloutViewTypes';
import CalloutView from '../../callout/CalloutView/CalloutView';
import useNavigate from '@/core/routing/useNavigate';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import { Box, CardHeader, Skeleton } from '@mui/material';
import PageContentBlock, { PageContentBlockProps } from '@/core/ui/content/PageContentBlock';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardFooter from '@/core/ui/card/CardFooter';
import { gutters } from '@/core/ui/grid/utils';
import { without } from 'lodash';
import CalloutDetailsContainer from '../../callout/CalloutDetailsContainer';

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
  onSortOrderUpdate?: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  onCalloutUpdate?: (calloutId: string) => void;
  loading?: boolean;
  blockProps?:
    | Partial<PageContentBlockProps>
    | ((callout: TypedCallout, index: number) => Partial<PageContentBlockProps> | undefined);
  disableMarginal?: boolean;
  disableRichMedia?: boolean;
  disablePostResponses?: boolean;
}

const CalloutsView = ({
  callouts,
  loading = false,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  disableMarginal,
  disableRichMedia,
  disablePostResponses,
}: CalloutsViewProps) => {
  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

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

  const handleExpand = (callout: TypedCalloutDetails) => {
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
              <CalloutDetailsContainer callout={callout}>
                {({ ref, callout: calloutDetails, loading }) => (
                  <Box ref={ref}>
                    {(loading || !calloutDetails) && <CalloutsViewSkeleton />}
                    {!loading && calloutDetails && (
                      <CalloutView
                        callout={calloutDetails}
                        contributionsCount={callout.activity}
                        onCalloutEdit={handleEdit}
                        onCalloutUpdate={() => onCalloutUpdate?.(callout.id)}
                        onVisibilityChange={handleVisibilityChange}
                        onCalloutDelete={handleDelete}
                        onExpand={() => handleExpand(calloutDetails)}
                        disableMarginal={disableMarginal}
                        disableRichMedia={disableRichMedia}
                        disablePostResponses={disablePostResponses}
                        {...sortEvents}
                        {...sortProps}
                      />
                    )}
                  </Box>
                )}
              </CalloutDetailsContainer>
            </PageContentBlock>
          );
        })}
    </>
  );
};

export default CalloutsView;
