import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNumber } from 'lodash';
import { Box, DialogContent, Paper } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Caption } from '@/core/ui/typography';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';

export interface CalloutContributionsSortItem {
  name: string;
  id: string;
  commentsCount?: number;
}

interface SortDialogProps {
  open: boolean;
  onClose: () => void;
  calloutId: string;
  contributions: CalloutContributionsSortItem[];
  onUpdateContributionsOrder: (contributions: CalloutContributionsSortItem[]) => void;
}

const SortDialog = ({ open, onClose, calloutId, contributions, onUpdateContributionsOrder }: SortDialogProps) => {
  const { t } = useTranslation();
  const [items, setItems] = useState(contributions);
  useEffect(() => {
    setItems(contributions);
  }, [contributions]);

  const handleDragEnd: OnDragEndResponder = result => {
    if (result.destination && items) {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);
      setItems(newItems);
      onUpdateContributionsOrder(newItems);
    }
  };

  return (
    <DialogWithGrid open={open} columns={4} aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
      <DialogHeader title={t('callout.sortContributions')} onClose={onClose} />
      <DialogContent>
        <Paper variant="outlined">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={calloutId}>
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

export default SortDialog;
