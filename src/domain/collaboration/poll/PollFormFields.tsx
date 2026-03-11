import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FieldArray, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';
import PollFormSettingsSection from '@/domain/collaboration/poll/PollFormSettingsSection';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import Gutters from '@/core/ui/grid/Gutters';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';

const FIELD_PREFIX = 'framing.poll';
export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

interface SortableOptionRowProps {
  id: string;
  index: number;
  formPrefix: string;
  canRemove: boolean;
  onRemove: () => void;
}

const SortableOptionRow = ({ id, index, formPrefix, canRemove, onRemove }: SortableOptionRowProps) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'flex-start',
        width: '100%',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 'auto',
      }}
    >
      <IconButton
        size="small"
        {...listeners}
        {...attributes}
        aria-label={t('poll.options.reorder')}
        sx={{ mt: 1, cursor: 'grab', touchAction: 'none' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <FormikInputField
        title=""
        name={`${formPrefix}.options.${index}.text`}
        required
        maxLength={512}
        containerProps={{ sx: { flex: 1 } }}
      />
      {canRemove && (
        <IconButton onClick={onRemove} size="small" aria-label={t('poll.options.remove')} sx={{ mt: 1 }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

interface PollFormFieldsProps {
  formPrefix?: string;
  readOnly?: boolean;
}

const PollFormFields = ({ formPrefix = FIELD_PREFIX, readOnly = false }: PollFormFieldsProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CalloutFormSubmittedValues>();

  const options = values.framing.poll?.options ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Use stable IDs for sortable: existing options use their id, new ones use index-based keys
  const itemIds = options.map((option, index) => option.id ?? `new-${index}`);

  return (
    <Box>
      <FormikInputField name={`${formPrefix}.title`} title={t('poll.create.title')} required maxLength={512} />

      <Caption>{t('poll.create.options')}</Caption>

      <FieldArray
        name={`${formPrefix}.options`}
        render={arrayHelpers => {
          const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const oldIndex = itemIds.indexOf(String(active.id));
            const newIndex = itemIds.indexOf(String(over.id));
            if (oldIndex === -1 || newIndex === -1) return;
            arrayHelpers.move(oldIndex, newIndex);
          };

          return (
            <Gutters disablePadding gap={2}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  {options.map((_option, index) => (
                    <Gutters row disablePadding key={itemIds[index]} width="100%">
                      <Caption mt={1.5}>{index + 1}</Caption>
                      <SortableOptionRow
                        key={itemIds[index]}
                        id={itemIds[index]}
                        index={index}
                        formPrefix={formPrefix}
                        canRemove={options.length > MIN_POLL_OPTIONS}
                        onRemove={() => arrayHelpers.remove(index)}
                      />
                    </Gutters>
                  ))}
                </SortableContext>
              </DndContext>
              <Gutters row disablePadding justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <IconButton
                    aria-label={t('components.referenceSegment.addReference')}
                    onClick={() => arrayHelpers.push({ text: '' })}
                    color="primary"
                    disabled={options.length >= MAX_POLL_OPTIONS}
                  >
                    <AddIcon />
                  </IconButton>
                  <BlockSectionTitle>{t('poll.options.add')}</BlockSectionTitle>
                </Box>
                <PollFormSettingsSection fieldPrefix={formPrefix} readOnly={readOnly} />
              </Gutters>
            </Gutters>
          );
        }}
      />
    </Box>
  );
};

export default PollFormFields;
