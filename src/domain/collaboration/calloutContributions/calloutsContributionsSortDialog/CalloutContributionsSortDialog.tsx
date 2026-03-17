import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, DialogContent, Paper } from '@mui/material';
import { isNumber, sortBy } from 'lodash-es';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutContributionsSortOrderQuery,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';

export interface CalloutContributionsSortItem {
  name: string;
  id: string;
  commentsCount?: number;
  sortOrder: number;
}

interface CalloutContributionsSortDialogProps {
  open: boolean;
  onClose: () => void;
  callout: Identifiable;
}

const SortableContributionItem = ({ item }: { item: CalloutContributionsSortItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      display="flex"
      sx={{
        padding: gutters(0.5),
        alignItems: 'center',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <DragIndicatorIcon />
      <Caption>
        {item.name}
        {isNumber(item.commentsCount) && item.commentsCount > 0 ? ` (${item.commentsCount})` : ''}
      </Caption>
    </Box>
  );
};

const CalloutContributionsSortDialog = ({ open, onClose, callout }: CalloutContributionsSortDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useCalloutContributionsSortOrderQuery({
    variables: {
      calloutId: callout.id,
    },
    skip: !open || !callout.id,
  });

  const items = useMemo(() => {
    return sortBy(
      data?.lookup.callout?.contributions
        .filter(
          contribution =>
            // TODO: #8441
            // Due to a bug we have deleted contributions in the database that don't have any of these: post, link, whiteboard, or memo
            // Filter them here for now
            contribution.post || contribution.link || contribution.whiteboard || contribution.memo
        )
        .map<CalloutContributionsSortItem>(contribution => ({
          id: contribution.id,
          name:
            contribution.post?.profile.displayName ??
            contribution.link?.profile.displayName ??
            contribution.whiteboard?.profile.displayName ??
            contribution.memo?.profile.displayName ??
            '',
          commentsCount: contribution.post?.comments?.messagesCount,
          sortOrder: contribution.sortOrder,
        })),
      'sortOrder'
    );
  }, [data]);

  const [updateContributionsSortOrder] = useUpdateContributionsSortOrderMutation();
  const handleSortContributions = async (contributions: CalloutContributionsSortItem[]) => {
    return updateContributionsSortOrder({
      variables: {
        calloutID: callout.id,
        contributionIds: contributions.map(contribution => contribution.id),
      },
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemIds = useMemo(() => items?.map(item => item.id) ?? [], [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !items) {
      return;
    }
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, reorderedItem);
      handleSortContributions(newItems);
    }
  };

  return (
    <DialogWithGrid open={open} columns={4} aria-labelledby="callout-sort-contributions-dialog-title" onClose={onClose}>
      <DialogHeader
        title={t('callout.sortContributions')}
        onClose={onClose}
        id="callout-sort-contributions-dialog-title"
      />
      <DialogContent>
        {loading && <Loading />}
        <Paper variant="outlined">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <Gutters disableGap={true} disablePadding={true}>
                {items?.map(item => (
                  <SortableContributionItem key={item.id} item={item} />
                ))}
              </Gutters>
            </SortableContext>
          </DndContext>
        </Paper>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CalloutContributionsSortDialog;
