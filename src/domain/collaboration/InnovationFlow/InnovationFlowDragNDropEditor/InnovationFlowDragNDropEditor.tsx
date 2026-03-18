import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { EditOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, DialogContent, IconButton, type IconButtonProps, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import i18n from '@/core/i18n/config';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { gutters } from '@/core/ui/grid/utils';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import SetDefaultTemplateDialog from '../InnovationFlowDialogs/SetDefaultTemplateDialog';
import type { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';
import InnovationFlowStateForm, { type InnovationFlowStateFormValues } from './InnovationFlowStateForm';
import InnovationFlowStateMenu from './InnovationFlowStateMenu';

const StyledDragAndDropBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: gutters(1)(theme),
  alignItems: 'stretch',
}));

export interface InnovationFlowDragNDropEditorProps {
  onUnhandledDragEnd?: (event: DragEndEvent) => void;
  children?: (
    state: Identifiable & InnovationFlowStateModel,
    dropIndicator: { activeId: string | null; overId: string | null }
  ) => React.ReactNode;
  renderDragOverlay?: (activeId: string) => React.ReactNode;
  innovationFlow:
    | {
        currentState?: Identifiable;
        states: (Identifiable & InnovationFlowStateModel)[];
        settings: {
          maximumNumberOfStates: number;
          minimumNumberOfStates: number;
        };
      }
    | undefined;

  croppedDescriptions?: boolean;
  onUpdateFlowStateOrder: (flowState: string, sortOrder: number) => Promise<unknown>;
  onUpdateCurrentState?: (stateId: string) => void;
  onCreateFlowState: (
    newState: InnovationFlowStateFormValues,
    options: { after: string; last: false } | { after?: never; last: true }
  ) => Promise<unknown>;
  onEditFlowState: (stateId: string, newState: InnovationFlowStateFormValues) => Promise<unknown>;
  onDeleteFlowState: (stateId: string) => Promise<unknown>;
  onSetDefaultTemplate: (stateId: string, templateId: string | null) => Promise<unknown>;
  /**
   * Prevents the user from changing the number of states, adding or removing
   */
  disableStateNumberChange?: boolean;
}

const AddButton = (props: IconButtonProps) => {
  const { t } = useTranslation();
  return (
    <Box>
      <IconButton aria-label={t('common.add')} size="small" {...props}>
        <RoundedIcon
          component={AddIcon}
          size="medium"
          iconSize="small"
          color={props.disabled ? 'muted.main' : 'primary.main'}
        />
      </IconButton>
    </Box>
  );
};

const SortableFlowState = ({
  state,
  disabled,
  currentStateId,
  croppedDescriptions,
  children,
  getStateName,
  onUpdateCurrentState,
  onEdit,
  onAddStateAfter,
  onDelete,
  onSetDefaultTemplate,
  disableStateNumberChange,
  canAddState,
}: {
  state: Identifiable & InnovationFlowStateModel;
  disabled: boolean;
  currentStateId: string | undefined;
  croppedDescriptions: boolean | undefined;
  children: React.ReactNode | undefined;
  getStateName: (name: string) => string;
  onUpdateCurrentState: ((stateId: string) => void) | undefined;
  onEdit: () => void;
  onAddStateAfter: (stateBefore: string) => void;
  onDelete: () => void;
  onSetDefaultTemplate: () => void;
  disableStateNumberChange: boolean;
  canAddState: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: state.id,
    disabled,
  });

  const isCurrentState = currentStateId === state.id;

  return (
    <PageContentBlock
      columns={3}
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      sx={{ borderColor: isCurrentState ? 'primary.main' : undefined, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
    >
      <PageContentBlockHeader
        title={
          <Caption
            noWrap={true}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: disabled ? undefined : 'grab',
              touchAction: 'none',
            }}
            {...listeners}
          >
            {getStateName(state.displayName)}
          </Caption>
        }
        sx={{ userSelect: 'none' }}
        actions={
          <InnovationFlowStateMenu
            stateId={state.id}
            isCurrentState={isCurrentState}
            onUpdateCurrentState={onUpdateCurrentState}
            onAddStateAfter={onAddStateAfter}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefaultTemplate={onSetDefaultTemplate}
            disableStateNumberChange={disableStateNumberChange}
            disableAddStateAfter={!canAddState}
            disableRemoveState={disableStateNumberChange}
          />
        }
      />
      {state.description?.trim() &&
        (croppedDescriptions ? (
          <CroppedMarkdown
            automaticOverflowDetector={true}
            backgroundColor="paper"
            maxHeightGutters={3}
            minHeightGutters={1}
          >
            {state.description}
          </CroppedMarkdown>
        ) : (
          <WrapperMarkdown card={true}>{state.description}</WrapperMarkdown>
        ))}
      {children}
    </PageContentBlock>
  );
};

const InnovationFlowDragNDropEditor = ({
  innovationFlow,
  children,
  renderDragOverlay,
  croppedDescriptions,
  onUnhandledDragEnd,
  onUpdateFlowStateOrder,
  onUpdateCurrentState,
  onCreateFlowState,
  onEditFlowState,
  onDeleteFlowState,
  onSetDefaultTemplate,
  disableStateNumberChange = false,
}: InnovationFlowDragNDropEditorProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const innovationFlowStates = innovationFlow?.states ?? [];
  const currentStateId = innovationFlow?.currentState?.id;

  // Stores the previous flow state to create a new state after it. If undefined it will create the state at the end of the flow
  const [createFlowState, setCreateFlowState] = useState<
    { after: string; last: false } | { after?: never; last: true } | undefined
  >(undefined);
  const [editFlowState, setEditFlowState] = useState<(Identifiable & InnovationFlowStateModel) | undefined>();
  const [deleteFlowStateId, setDeleteFlowStateId] = useState<string | undefined>();
  const [setDefaultTemplateStateId, setSetDefaultTemplateStateId] = useState<string | undefined>();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);

  // Track if we've already processed the editTab param to avoid re-triggering
  const editTabProcessedRef = useRef<string | null>(null);

  // Auto-open edit dialog if editTab URL param is present
  useEffect(() => {
    const editTabParam = searchParams.get('editTab');
    // Only process if: param exists, states are loaded, and we haven't processed this exact param value yet
    if (editTabParam !== null && innovationFlowStates && editTabProcessedRef.current !== editTabParam) {
      editTabProcessedRef.current = editTabParam;
      const tabIndex = Number.parseInt(editTabParam, 10);
      if (!Number.isNaN(tabIndex) && tabIndex >= 0 && tabIndex < innovationFlowStates.length) {
        setEditFlowState(innovationFlowStates[tabIndex]);
      }
      // Clear the URL param after processing - use a new URLSearchParams to avoid mutation issues
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('editTab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, innovationFlowStates, setSearchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const stateIds = innovationFlowStates.map(s => s.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverDragId(event.over ? (event.over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setOverDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      onUnhandledDragEnd?.(event);
      return;
    }
    // Check if this is a state reorder (active item is a flow state)
    const isStateItem = stateIds.includes(active.id as string);
    if (isStateItem) {
      const newIndex = stateIds.indexOf(over.id as string);
      if (newIndex !== -1) {
        onUpdateFlowStateOrder(active.id as string, newIndex);
      }
      return;
    }
    // Not a state drag — delegate to external handler
    onUnhandledDragEnd?.(event);
  };

  const getStateName = (state: string) =>
    i18n.exists(`common.enums.innovationFlowState.${state}`)
      ? t(`common.enums.innovationFlowState.${state}` as TranslationKey)
      : state;

  const canAddState =
    !disableStateNumberChange && innovationFlowStates.length < (innovationFlow?.settings.maximumNumberOfStates ?? 0);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stateIds} strategy={horizontalListSortingStrategy}>
          <StyledDragAndDropBlock>
            {innovationFlowStates.map(state => (
              <SortableFlowState
                key={state.id}
                state={state}
                disabled={disableStateNumberChange}
                currentStateId={currentStateId}
                croppedDescriptions={croppedDescriptions}
                getStateName={getStateName}
                onUpdateCurrentState={onUpdateCurrentState}
                onEdit={() => setEditFlowState(state)}
                onAddStateAfter={stateBefore => setCreateFlowState({ after: stateBefore, last: false })}
                onDelete={() => setDeleteFlowStateId(state.id)}
                onSetDefaultTemplate={() => setSetDefaultTemplateStateId(state.id)}
                disableStateNumberChange={disableStateNumberChange}
                canAddState={canAddState}
              >
                {children?.(state, { activeId: activeDragId, overId: overDragId })}
              </SortableFlowState>
            ))}
            {!disableStateNumberChange && (
              <AddButton onClick={() => setCreateFlowState({ last: true })} disabled={!canAddState} />
            )}
          </StyledDragAndDropBlock>
        </SortableContext>
        <DragOverlay dropAnimation={null}>{activeDragId && renderDragOverlay?.(activeDragId)}</DragOverlay>
      </DndContext>
      {/* Dialogs for Flow States management */}

      <DialogWithGrid
        open={Boolean(createFlowState)}
        aria-labelledby="create-flow-state-dialog-title"
        onClose={() => setCreateFlowState(undefined)}
      >
        <DialogHeader
          icon={<EditOutlined />}
          id="create-flow-state-dialog-title"
          title={t('components.innovationFlowSettings.stateEditor.createDialog.title')}
          onClose={() => setCreateFlowState(undefined)}
        />
        <DialogContent>
          <InnovationFlowStateForm
            forbiddenFlowStateNames={innovationFlowStates.map(state => state.displayName)}
            onSubmit={async newState => {
              if (createFlowState) {
                await onCreateFlowState(newState, createFlowState);
              }
              setCreateFlowState(undefined);
            }}
            onCancel={() => setCreateFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid
        open={Boolean(editFlowState)}
        aria-labelledby="edit-flow-state-dialog-title"
        onClose={() => setEditFlowState(undefined)}
      >
        <DialogHeader
          icon={<EditOutlined />}
          id="edit-flow-state-dialog-title"
          title={t('components.innovationFlowSettings.stateEditor.editDialog.title')}
          onClose={() => setEditFlowState(undefined)}
        />
        <DialogContent>
          <InnovationFlowStateForm
            state={editFlowState}
            forbiddenFlowStateNames={innovationFlowStates
              .filter(state => !editFlowState || state.displayName !== editFlowState.displayName)
              .map(state => state.displayName)}
            onSubmit={async newState => {
              if (editFlowState) {
                await onEditFlowState(editFlowState.id, newState);
              }
              setEditFlowState(undefined);
            }}
            onCancel={() => setEditFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            if (deleteFlowStateId) {
              onDeleteFlowState(deleteFlowStateId);
            }
            setDeleteFlowStateId(undefined);
          },
          onCancel: () => setDeleteFlowStateId(undefined),
        }}
        options={{
          show: Boolean(deleteFlowStateId),
        }}
        entities={{
          titleId: 'components.innovationFlowSettings.stateEditor.deleteDialog.title',
          contentId: 'components.innovationFlowSettings.stateEditor.deleteDialog.text',
          confirmButtonTextId: 'buttons.delete',
        }}
      />
      <SetDefaultTemplateDialog
        open={Boolean(setDefaultTemplateStateId)}
        onClose={() => setSetDefaultTemplateStateId(undefined)}
        onSelectTemplate={templateId => {
          if (setDefaultTemplateStateId) {
            return onSetDefaultTemplate(setDefaultTemplateStateId, templateId);
          }
          return Promise.resolve();
        }}
        currentTemplate={innovationFlowStates?.find(s => s.id === setDefaultTemplateStateId)?.defaultCalloutTemplate}
      />
    </>
  );
};

export default InnovationFlowDragNDropEditor;
