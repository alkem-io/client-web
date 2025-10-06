import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isNumber, sortBy } from 'lodash';
import { Box, DialogContent, Paper } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Caption } from '@/core/ui/typography';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import {
  useCalloutContributionsSortOrderQuery,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Loading from '@/core/ui/loading/Loading';

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
  onUpdateCallout: () => void;
}

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
            // Due to a bug we have deleted contributions in the database that don't have any of thes: post, link, or whiteboard
            // Filter them here for now
            contribution.post || contribution.link || contribution.whiteboard
        )
        .map<CalloutContributionsSortItem>(contribution => ({
          id: contribution.id,
          name:
            contribution.post?.profile.displayName ??
            contribution.link?.profile.displayName ??
            contribution.whiteboard?.profile.displayName ??
            '',
          commentsCount: contribution.post?.comments?.messagesCount,
          sortOrder: contribution.sortOrder,
        })),
      'sortOrder'
    );
  }, [data]);

  const [updateContributionsSortOrder] = useUpdateContributionsSortOrderMutation();
  const handleSortContributions = async contributions => {
    return updateContributionsSortOrder({
      variables: {
        calloutID: callout.id,
        contributionIds: contributions.map(contribution => contribution.id),
      },
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    });
  };

  const handleDragEnd: OnDragEndResponder = result => {
    if (result.destination && items) {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`contributions_${callout.id}`}>
              {provided => (
                <Gutters ref={provided.innerRef} disableGap disablePadding {...provided.droppableProps}>
                  {items?.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {provided => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          display="flex"
                          sx={{ padding: gutters(0.5), alignItems: 'center' }}
                        >
                          <DragIndicatorIcon />
                          <Caption>
                            {item.name}
                            {isNumber(item.commentsCount) && item.commentsCount > 0 ? ` (${item.commentsCount})` : ''}
                          </Caption>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Gutters>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CalloutContributionsSortDialog;
