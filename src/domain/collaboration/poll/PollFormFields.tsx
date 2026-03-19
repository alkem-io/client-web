import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdatePollStatusMutation } from '@/core/apollo/generated/apollo-hooks';
import { PollStatus } from '@/core/apollo/generated/graphql-schema';
import AddButton from '@/core/ui/button/AddButton';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Caption } from '@/core/ui/typography';
import type { PollFormOptionValue } from '@/domain/collaboration/poll/models/PollModels';
import PollFormSettingsSection from '@/domain/collaboration/poll/PollFormSettingsSection';
import type { CalloutFormSubmittedValues } from '../callout/CalloutForm/CalloutFormModel';

const FIELD_PREFIX = 'framing.poll';
export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

interface SortableOptionRowProps {
  id: string;
  index: number;
  formPrefix: string;
  canRemove: boolean;
  onRemove: () => void;
  disabled?: boolean;
}

const SortableOptionRow = ({
  id,
  index,
  formPrefix,
  canRemove,
  onRemove,
  disabled = false,
}: SortableOptionRowProps) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

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
        disabled={disabled}
        aria-label={t('poll.options.reorder')}
        sx={{ mt: 1, cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <FormikInputField
        title=""
        name={`${formPrefix}.options.${index}.text`}
        required={true}
        maxLength={512}
        disabled={disabled}
        containerProps={{ sx: { flex: 1 } }}
      />
      {canRemove && (
        <IconButton
          onClick={onRemove}
          size="small"
          disabled={disabled}
          aria-label={t('poll.options.remove')}
          sx={{ mt: 1 }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

interface PollFormFieldsProps {
  formPrefix?: string;
  readOnlySettings?: boolean;
  pollId?: string;
  pollStatus?: PollStatus;
}

const PollFormFields = ({
  formPrefix = FIELD_PREFIX,
  readOnlySettings = false,
  pollId,
  pollStatus,
}: PollFormFieldsProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CalloutFormSubmittedValues>();
  const notify = useNotification();

  const options: PollFormOptionValue[] = getIn(values, `${formPrefix}.options`) ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Use stable IDs for sortable: existing options use their id, new ones use index-based keys
  const itemIds = options.map((option, index) => option.id ?? `new-${index}`);

  const isEditing = Boolean(pollId); // Editing an existing poll or creating a new one
  // New polls are always open by default
  const isOpen = !isEditing || pollStatus === PollStatus.Open;

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [updatePollStatus, { loading: updatingStatus }] = useUpdatePollStatusMutation();

  const handleStatusChange = async () => {
    if (!pollId) return;
    const newStatus = isOpen ? PollStatus.Closed : PollStatus.Open;
    try {
      await updatePollStatus({
        variables: {
          statusData: {
            pollID: pollId,
            status: newStatus,
          },
        },
      });
      notify(isOpen ? t('poll.manage.closePollSuccess') : t('poll.manage.reopenPollSuccess'), 'success');
    } catch {
      notify(t('poll.manage.statusChangeFailed'), 'error');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <Box>
      <FormikInputField name={`${formPrefix}.title`} title={t('poll.create.title')} maxLength={512} />

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
            <Gutters disablePadding={true} gap={0.5}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  {options.map((_option, index) => (
                    <Gutters row={true} disablePadding={true} key={itemIds[index]} width="100%">
                      <Caption mt={1.5}>{index + 1}</Caption>
                      <SortableOptionRow
                        key={itemIds[index]}
                        id={itemIds[index]}
                        index={index}
                        formPrefix={formPrefix}
                        canRemove={options.length > MIN_POLL_OPTIONS}
                        onRemove={() => arrayHelpers.remove(index)}
                        disabled={!isOpen}
                      />
                    </Gutters>
                  ))}
                </SortableContext>
              </DndContext>
              <Gutters row={true} disablePadding={true} justifyContent="space-between">
                {isOpen && (
                  <AddButton
                    onClick={() => arrayHelpers.push({ text: '' })}
                    disabled={options.length >= MAX_POLL_OPTIONS}
                    caption={t('poll.options.add')}
                  />
                )}
                {!isOpen && <Caption>{t('poll.status.closed')}</Caption>}
                <Gutters disablePadding={true} row={true} gap={1} alignItems="center">
                  {isEditing && (
                    <Tooltip title={isOpen ? t('poll.status.open') : t('poll.status.closed')} arrow={true}>
                      <Button
                        variant="text"
                        loading={updatingStatus}
                        disabled={updatingStatus}
                        onClick={() => setConfirmDialogOpen(true)}
                        startIcon={isOpen ? <LockOpenIcon /> : <LockOutlineIcon />}
                      >
                        {isOpen ? t('poll.manage.closePoll') : t('poll.manage.reopenPoll')}
                      </Button>
                    </Tooltip>
                  )}
                  <PollFormSettingsSection fieldPrefix={formPrefix} readOnly={readOnlySettings} />
                </Gutters>
              </Gutters>
            </Gutters>
          );
        }}
      />

      <ConfirmationDialog
        entities={{
          title: isOpen ? t('poll.manage.closePollConfirm.title') : t('poll.manage.reopenPollConfirm.title'),
          content: isOpen ? t('poll.manage.closePollConfirm.content') : t('poll.manage.reopenPollConfirm.content'),
          confirmButtonText: isOpen ? t('poll.manage.closePoll') : t('poll.manage.reopenPoll'),
        }}
        actions={{
          onCancel: () => setConfirmDialogOpen(false),
          onConfirm: handleStatusChange,
        }}
        options={{
          show: confirmDialogOpen,
        }}
        state={{
          isLoading: updatingStatus,
        }}
      />
    </Box>
  );
};

export default PollFormFields;
