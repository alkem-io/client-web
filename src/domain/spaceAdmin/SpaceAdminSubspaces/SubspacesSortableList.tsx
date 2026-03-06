import { type FC, type ReactNode } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, FormControl, InputLabel, OutlinedInput, Button } from '@mui/material';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import { type SearchableListItem } from '@/domain/platformAdmin/components/SearchableList';
import SubspacesSortableItem from './SubspacesSortableItem';
import LoadingListItem from '@/domain/shared/components/SearchableList/LoadingListItem';

type SubspaceWithPinData = SearchableListItem & {
  pinned: boolean;
  sortOrder: number;
};

type SubspacesSortableListProps = {
  subspaces: SubspaceWithPinData[];
  sortMode: SpaceSortMode;
  loading?: boolean;
  getActions: (item: SearchableListItem) => ReactNode;
  getIndicator: (item: SearchableListItem) => ReactNode | undefined;
  onReorder: (subspaceIds: string[]) => void;
  onPin: (subspaceId: string) => void;
};

const MAX_ITEMS_LIMIT = 1000;

const SubspacesSortableList: FC<SubspacesSortableListProps> = ({
  subspaces,
  sortMode,
  loading,
  getActions,
  getIndicator,
  onReorder,
  onPin,
}) => {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [limit, setLimit] = useState(10);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredSubspaces = useMemo(
    () =>
      subspaces.filter(item =>
        filterBy ? item.profile.displayName.toLowerCase().includes(filterBy.toLowerCase()) : true
      ),
    [filterBy, subspaces]
  );

  const slicedSubspaces = useMemo(() => filteredSubspaces.slice(0, limit), [filteredSubspaces, limit]);

  const itemIds = useMemo(() => slicedSubspaces.map(s => s.id), [slicedSubspaces]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = slicedSubspaces.findIndex(s => s.id === active.id);
    const newIndex = slicedSubspaces.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const draggedItem = slicedSubspaces[oldIndex];
    const targetItem = slicedSubspaces[newIndex];

    // In Alphabetical mode: if dragging a non-pinned item into the pinned section, auto-pin it
    if (sortMode === SpaceSortMode.Alphabetical && !draggedItem.pinned && targetItem.pinned) {
      onPin(draggedItem.id);
    }

    // Compute the new order from all subspaces (not just sliced)
    const reordered = [...subspaces];
    const fullOldIndex = reordered.findIndex(s => s.id === active.id);
    const fullNewIndex = reordered.findIndex(s => s.id === over.id);
    if (fullOldIndex !== -1 && fullNewIndex !== -1) {
      const [moved] = reordered.splice(fullOldIndex, 1);
      reordered.splice(fullNewIndex, 0, moved);
      onReorder(reordered.map(s => s.id));
    }
  };

  const isDragDisabled = (item: SubspaceWithPinData) => {
    if (sortMode === SpaceSortMode.Custom) {
      return false; // All items draggable in Custom mode
    }
    // Alphabetical mode: only pinned items can be dragged
    return !item.pinned;
  };

  return (
    <>
      <FormControl fullWidth size="small">
        <OutlinedInput
          placeholder={t('components.searchableList.placeholder')}
          onChange={e => setFilterBy(e.target.value)}
          sx={{ background: theme => theme.palette.primary.contrastText }}
        />
      </FormControl>
      <InputLabel>
        {t('components.searchableList.info', { count: slicedSubspaces.length, total: subspaces.length })}
      </InputLabel>
      {loading ? (
        <>
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
        </>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <Box display="flex" flexDirection="column" gap={1} paddingY={1}>
              {slicedSubspaces.map(item => (
                <SubspacesSortableItem
                  key={item.id}
                  item={item}
                  disabled={isDragDisabled(item)}
                  actions={getActions(item)}
                  indicator={getIndicator(item)}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      )}
      {filteredSubspaces.length > limit && limit < MAX_ITEMS_LIMIT && (
        <Button
          onClick={() => setLimit(x => (x >= MAX_ITEMS_LIMIT ? x : x + 10))}
          variant="outlined"
          sx={{ alignSelf: 'start' }}
        >
          {t('components.searchableList.load-more')}
        </Button>
      )}
    </>
  );
};

export default SubspacesSortableList;
