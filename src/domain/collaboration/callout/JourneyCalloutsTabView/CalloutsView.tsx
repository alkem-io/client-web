import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useScrollToElement from '../../../shared/utils/scroll/useScrollToElement';
import { useCalloutEdit } from '../edit/useCalloutEdit/useCalloutEdit';
import { TypedCallout } from '../useCallouts/useCallouts';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Caption } from '../../../../core/ui/typography';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { compact } from 'lodash';
import { CalloutSortEvents, CalloutSortProps } from '../CalloutViewTypes';
import UpdateOrder, { OrderUpdate } from '../../../../core/utils/UpdateOrder';
import CalloutView, { CalloutViewProps } from '../CalloutView/CalloutView';
import { useNavigate } from 'react-router-dom';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import { CardHeader, Skeleton } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardFooter from '../../../../core/ui/card/CardFooter';
import { gutters } from '../../../../core/ui/grid/utils';

interface CalloutWithDisplayLocation {
  id: string;
  profile: {
    displayLocationTagset?: {
      tags?: string[];
    };
  };
}
/**
 * Find the callout that we are moving in the list of all callouts loaded.
 * Then see its position between the callouts in the same group.
 * Find the previous or next callout in that group and return its Id
 */
const findTargetItem = (
  position: 'prev' | 'next',
  allCallouts: CalloutWithDisplayLocation[] | undefined,
  id: string
) => {
  const group = allCallouts?.find(callout => callout.id === id)?.profile.displayLocationTagset?.tags?.[0];
  const calloutsInGroup = allCallouts?.filter(c => c.profile.displayLocationTagset?.tags?.[0] === group);
  const indexInGroup = calloutsInGroup?.findIndex(c => c.id === id) ?? -1;
  if (!calloutsInGroup || indexInGroup === -1) {
    throw new Error(`Can't find ${position} item`);
  }
  if (position === 'prev') {
    return calloutsInGroup[indexInGroup - 1].id;
  } else if (position === 'next') {
    return calloutsInGroup[indexInGroup + 1].id;
  }
  throw new Error(`Can't find ${position} item`);
};

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
  sortOrder: string[];
  onSortOrderUpdate?: (update: OrderUpdate) => void;
  onCalloutUpdate?: (calloutId: string) => void;
  loading?: boolean;
  calloutNames: string[];
  blockProps?: CalloutViewProps['blockProps'];
  disableMarginal?: boolean;
}

const CalloutsView = ({
  callouts,
  journeyTypeName,
  calloutNames,
  scrollToCallout = false,
  loading = false,
  sortOrder,
  onSortOrderUpdate,
  onCalloutUpdate,
  blockProps,
  disableMarginal,
}: CalloutsViewProps) => {
  const { spaceNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { t } = useTranslation();

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  // Scroll to Callout handler:
  const { scrollable } = useScrollToElement(calloutNameId, { enabled: scrollToCallout });

  const sortedCallouts = useMemo(
    () => compact(sortOrder.map(id => callouts?.find(c => c.id === id))),
    [sortOrder, callouts]
  );

  const updateOrder = onSortOrderUpdate && UpdateOrder(onSortOrderUpdate);

  const sortEvents: CalloutSortEvents | undefined = updateOrder && {
    onMoveToTop: updateOrder((ids, id) => ids.unshift(id)),
    onMoveToBottom: updateOrder((ids, id) => ids.push(id)),
    // We can't rely on just shifting callout ids "up" and "down" cause a callout just above
    // the moved one can be from another group. Such "moving" would not result in anything visible,
    // therefore on move up we must find the closest callout above that is from the same group.
    onMoveUp: updateOrder((nextIds, id) => {
      const prevCalloutId = findTargetItem('prev', callouts, id);
      const targetIndex = nextIds.findIndex(id => id === prevCalloutId); // no +1 to put it just before the previous callout
      return nextIds.splice(targetIndex, 0, id);
    }),
    onMoveDown: updateOrder((nextIds, id) => {
      const nextCalloutId = findTargetItem('next', callouts, id);
      const targetIndex = nextIds.findIndex(id => id === nextCalloutId) + 1; // +1 to put it under the next callout
      return nextIds.splice(targetIndex, 0, id);
    }),
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
      {!loading && callouts?.length === 0 && (
        <PageContentBlockSeamless textAlign="center">
          <Caption>
            {t('pages.generic.sections.subentities.empty', {
              entities: t('common.callouts'),
              parentEntity: t(`common.${journeyTypeName}` as const),
            })}
          </Caption>
        </PageContentBlockSeamless>
      )}
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
              blockProps={blockProps}
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
