import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Remove } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { without } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle, BlockTitle } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';
import AddSpaceByUrlDialog from './AddSpaceByUrlDialog';

export interface Space extends Identifiable {
  id: string;
  visibility: SpaceVisibility;
  about: SpaceAboutMinimalUrlModel;
}

interface InnovationHubSpacesFieldProps {
  spaces: Space[] | undefined;
  onChange?: (spaces: string[]) => Promise<void>;
}

const SortableSpaceRow = ({ space, onRemove }: { space: Space; onRemove: (id: string) => void }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: space.id });

  return (
    <TableRow
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      sx={{
        display: isDragging ? 'table' : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <TableCell>{space.about.profile.displayName}</TableCell>
      <TableCell>{space.visibility}</TableCell>
      <TableCell>{space.about.provider?.profile?.displayName}</TableCell>
      <TableCell>
        <IconButton color="warning" onClick={() => onRemove(space.id)} aria-label={t('buttons.delete')}>
          <Remove />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const InnovationHubSpacesField = ({ spaces, onChange }: InnovationHubSpacesFieldProps) => {
  const { t } = useTranslation();

  const itemIds = spaces?.map(({ id }) => id) ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!itemIds || !over || active.id === over.id) {
      return;
    }
    const nextItemIds = without(itemIds, active.id as string);
    const overIndex = itemIds.indexOf(over.id as string);
    nextItemIds.splice(overIndex, 0, active.id as string);
    void onChange?.(nextItemIds).catch(() => {});
  };

  const handleRemove = (itemId: string) => {
    const nextItemIds = without(itemIds, itemId);
    void onChange?.(nextItemIds).catch(() => {});
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAdd = async (spaceId: string) => {
    await onChange?.([...itemIds, spaceId]);
  };

  return (
    <>
      <PageContentBlockHeader
        title={
          <>
            <BlockTitle>{t('pages.admin.innovationHub.spaceListFilter.header.title')}</BlockTitle>
            <BlockSectionTitle>{t('pages.admin.innovationHub.spaceListFilter.header.subtitle')}</BlockSectionTitle>
          </>
        }
        actions={
          <Button variant="contained" onClick={() => setIsAddDialogOpen(true)}>
            {t('common.add')}
          </Button>
        }
      />
      <AddSpaceByUrlDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAdd}
        existingSpaceIds={itemIds}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('pages.admin.space.settings.visibility.title')}</TableCell>
                  <TableCell>{t('pages.admin.innovationHubs.fields.host')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {spaces?.map(space => (
                  <SortableSpaceRow key={space.id} space={space} onRemove={handleRemove} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default InnovationHubSpacesField;
