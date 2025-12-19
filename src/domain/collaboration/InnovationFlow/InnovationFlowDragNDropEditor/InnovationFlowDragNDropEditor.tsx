import i18n from '@/core/i18n/config';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import { EditOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, DialogContent, IconButton, IconButtonProps, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { gutters } from '@/core/ui/grid/utils';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';
import InnovationFlowStateForm from './InnovationFlowStateForm';
import InnovationFlowStateMenu from './InnovationFlowStateMenu';
import { Identifiable } from '@/core/utils/Identifiable';

const STATES_DROPPABLE_ID = '__states';

const StyledDragAndDropBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: gutters(1)(theme),
  alignItems: 'stretch',
  '& div[data-rbd-drop-indicator]': {
    background: theme.palette.primary.main,
  },
}));

export interface InnovationFlowDragNDropEditorProps {
  onUnhandledDragEnd?: OnDragEndResponder;
  children?: (state: Identifiable & InnovationFlowStateModel) => React.ReactNode;
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
    newState: InnovationFlowStateModel,
    options: { after: string; last: false } | { after?: never; last: true }
  ) => Promise<unknown>;
  onEditFlowState: (stateId: string, newState: InnovationFlowStateModel) => Promise<unknown>;
  onDeleteFlowState: (stateId: string) => Promise<unknown>;
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

const InnovationFlowDragNDropEditor = ({
  innovationFlow,
  children,
  croppedDescriptions,
  onUnhandledDragEnd,
  onUpdateFlowStateOrder,
  onUpdateCurrentState,
  onCreateFlowState,
  onEditFlowState,
  onDeleteFlowState,
  disableStateNumberChange = false,
}: InnovationFlowDragNDropEditorProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const innovationFlowStates = innovationFlow?.states;
  const currentStateId = innovationFlow?.currentState?.id;

  // Stores the previous flow state to create a new state after it. If undefined it will create the state at the end of the flow
  const [createFlowState, setCreateFlowState] = useState<
    { after: string; last: false } | { after?: never; last: true } | undefined
  >(undefined);
  const [editFlowState, setEditFlowState] = useState<(Identifiable & InnovationFlowStateModel) | undefined>();
  const [deleteFlowStateId, setDeleteFlowStateId] = useState<string | undefined>();

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

  const handleDragEnd: OnDragEndResponder = (result, provided) => {
    const { draggableId, destination } = result;
    if (destination?.droppableId === STATES_DROPPABLE_ID) {
      if (onUpdateFlowStateOrder && destination) {
        onUpdateFlowStateOrder(draggableId, destination.index);
      }
      return;
    }
    // Maybe some children drag&drop happened, handle it outside here
    onUnhandledDragEnd?.(result, provided);
  };

  const getStateName = (state: string) =>
    i18n.exists(`common.enums.innovationFlowState.${state}`)
      ? t(`common.enums.innovationFlowState.${state}` as TranslationKey)
      : state;

  const canAddState =
    !disableStateNumberChange &&
    (innovationFlowStates ?? []).length < (innovationFlow?.settings.maximumNumberOfStates ?? 0);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={STATES_DROPPABLE_ID} type="droppableItem" direction="horizontal">
          {parentDroppableProvided => (
            <Box ref={parentDroppableProvided.innerRef}>
              <StyledDragAndDropBlock>
                {innovationFlowStates?.map((state, index) => (
                  <Draggable
                    key={state.id}
                    draggableId={state.id}
                    index={index}
                    isDragDisabled={disableStateNumberChange}
                  >
                    {parentProvider => {
                      const isCurrentState = currentStateId === state.id;
                      return (
                        <PageContentBlock
                          key={state.id}
                          columns={3}
                          ref={parentProvider.innerRef}
                          sx={{ borderColor: isCurrentState ? 'primary.main' : undefined }}
                          {...parentProvider.draggableProps}
                        >
                          <PageContentBlockHeader
                            title={
                              <Caption {...parentProvider.dragHandleProps}>
                                <>{getStateName(state.displayName)}</>
                              </Caption>
                            }
                            sx={{ userSelect: 'none' }}
                            actions={
                              <InnovationFlowStateMenu
                                stateId={state.id}
                                isCurrentState={isCurrentState}
                                onUpdateCurrentState={onUpdateCurrentState}
                                onAddStateAfter={stateBefore => setCreateFlowState({ after: stateBefore, last: false })}
                                onEdit={() => setEditFlowState(state)}
                                onDelete={() => setDeleteFlowStateId(state.id)}
                                disableStateNumberChange={disableStateNumberChange}
                                disableAddStateAfter={!canAddState}
                                disableRemoveState={disableStateNumberChange}
                              />
                            }
                          />
                          {state.description?.trim() &&
                            (croppedDescriptions ? (
                              <CroppedMarkdown backgroundColor="paper" maxHeightGutters={3} minHeightGutters={1}>
                                {state.description}
                              </CroppedMarkdown>
                            ) : (
                              <WrapperMarkdown card>{state.description}</WrapperMarkdown>
                            ))}
                          {children?.(state)}
                        </PageContentBlock>
                      );
                    }}
                  </Draggable>
                ))}
                {parentDroppableProvided.placeholder}
                {!disableStateNumberChange && (
                  <AddButton onClick={() => setCreateFlowState({ last: true })} disabled={!canAddState} />
                )}
              </StyledDragAndDropBlock>
            </Box>
          )}
        </Droppable>
      </DragDropContext>
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
            forbiddenFlowStateNames={innovationFlowStates?.map(state => state.displayName)}
            onSubmit={async newState => {
              await onCreateFlowState(newState, createFlowState!);
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
              ?.filter(state => state.displayName !== editFlowState?.displayName)
              .map(state => state.displayName)}
            onSubmit={async newState => {
              await onEditFlowState(editFlowState!.id, newState);
              setEditFlowState(undefined);
            }}
            onCancel={() => setEditFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            onDeleteFlowState(deleteFlowStateId!);
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
    </>
  );
};

export default InnovationFlowDragNDropEditor;
