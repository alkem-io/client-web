import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { sortBy } from 'lodash';
import { Box, DialogContent, Paper } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Caption } from '@/core/ui/typography';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import {
  refetchSubspacesInSpaceQuery,
  useSubspacesInSpaceQuery,
  useUpdateSubspacesSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';

interface SubspacesSortItem {
  id: string;
  name: string;
  sortOrder: number;
}

interface SubspacesSortDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
}

const SubspacesSortDialog = ({ open, onClose, spaceId }: SubspacesSortDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId },
    skip: !open || !spaceId,
  });

  const items = useMemo(() => {
    return sortBy(
      data?.lookup.space?.subspaces?.map<SubspacesSortItem>(subspace => ({
        id: subspace.id,
        name: subspace.about.profile.displayName,
        sortOrder: subspace.sortOrder,
      })),
      'sortOrder'
    );
  }, [data]);

  const [updateSubspacesSortOrder] = useUpdateSubspacesSortOrderMutation();

  const handleSortSubspaces = async (subspaces: SubspacesSortItem[]) => {
    return updateSubspacesSortOrder({
      variables: {
        spaceID: spaceId,
        subspaceIds: subspaces.map(subspace => subspace.id),
      },
      refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    });
  };

  const handleDragEnd: OnDragEndResponder = result => {
    if (result.destination && items) {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);
      handleSortSubspaces(newItems);
    }
  };

  return (
    <DialogWithGrid open={open} columns={4} aria-labelledby="subspaces-sort-dialog-title" onClose={onClose}>
      <DialogHeader
        title={t('pages.admin.space.sections.subspaces.reorderSubspaces')}
        onClose={onClose}
        id="subspaces-sort-dialog-title"
      />
      <DialogContent>
        {loading && <Loading />}
        <Paper variant="outlined">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`subspaces_${spaceId}`}>
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
                          <Caption>{item.name}</Caption>
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

export default SubspacesSortDialog;
