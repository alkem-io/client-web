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
import { MAX_INNOVATIONFLOW_STATES } from '@/domain/templates/models/CollaborationTemplate';
import { EditOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, DialogContent, IconButton, IconButtonProps } from '@mui/material';
import { useState } from 'react';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowStateForm from './InnovationFlowStateForm';
import InnovationFlowStateMenu from './InnovationFlowStateMenu';

const STATES_DROPPABLE_ID = '__states';

export interface InnovationFlowDragNDropEditorProps {
  onUnhandledDragEnd?: OnDragEndResponder;
  children?: (state: InnovationFlowState) => React.ReactNode;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentState?: string | undefined;
  croppedDescriptions?: boolean;
  onUpdateFlowStateOrder: (flowState: string, sortOrder: number) => Promise<unknown> | void;
  onUpdateCurrentState?: (state: string) => void;
  onCreateFlowState: (
    newState: InnovationFlowState,
    options: { after: string; last: false } | { after?: never; last: true }
  ) => Promise<unknown> | void;
  onEditFlowState: (oldState: InnovationFlowState, newState: InnovationFlowState) => Promise<unknown> | void;
  onDeleteFlowState: (state: string) => Promise<unknown> | void;
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
  innovationFlowStates,
  children,
  currentState,
  croppedDescriptions,
  onUnhandledDragEnd,
  onUpdateFlowStateOrder,
  onUpdateCurrentState,
  onCreateFlowState,
  onEditFlowState,
  onDeleteFlowState,
}: InnovationFlowDragNDropEditorProps) => {
  const { t } = useTranslation();

  // Dialogs for Flow States management:

  // Stores the previous flow state to create a new state after it. If undefined it will create the state at the end of the flow
  const [createFlowState, setCreateFlowState] = useState<
    { after: string; last: false } | { after?: never; last: true } | undefined
  >(undefined);
  const [editFlowState, setEditFlowState] = useState<InnovationFlowState | undefined>();
  const [deleteFlowState, setDeleteFlowState] = useState<string | undefined>();

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

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={STATES_DROPPABLE_ID} type="droppableItem" direction="horizontal">
          {parentDroppableProvided => (
            <Box ref={parentDroppableProvided.innerRef} sx={{ userSelect: 'none' }}>
              <Box display="flex" flexDirection="row" gap={gutters()} alignItems="stretch">
                {innovationFlowStates?.map((state, index) => (
                  <Draggable key={state.displayName} draggableId={state.displayName} index={index}>
                    {parentProvider => {
                      const isCurrentState = currentState === state.displayName;
                      return (
                        <PageContentBlock
                          key={state.displayName}
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
                            actions={
                              <InnovationFlowStateMenu
                                state={state.displayName}
                                isCurrentState={isCurrentState}
                                onUpdateCurrentState={onUpdateCurrentState}
                                onAddStateAfter={stateBefore => setCreateFlowState({ after: stateBefore, last: false })}
                                onEdit={() => setEditFlowState(state)}
                                onDelete={() => setDeleteFlowState(state.displayName)}
                              />
                            }
                          />
                          {state.description?.trim() &&
                            (croppedDescriptions ? (
                              <CroppedMarkdown backgroundColor="paper" maxHeightGutters={3}>
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
                <AddButton
                  onClick={() => setCreateFlowState({ last: true })}
                  disabled={(innovationFlowStates ?? [])?.length >= MAX_INNOVATIONFLOW_STATES}
                />
              </Box>
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialogs for Flow States management */}
      <DialogWithGrid open={Boolean(createFlowState)}>
        <DialogHeader
          icon={<EditOutlined />}
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
      <DialogWithGrid open={Boolean(editFlowState)}>
        <DialogHeader
          icon={<EditOutlined />}
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
              await onEditFlowState(editFlowState!, newState);
              setEditFlowState(undefined);
            }}
            onCancel={() => setEditFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            onDeleteFlowState(deleteFlowState!);
            setDeleteFlowState(undefined);
          },
          onCancel: () => setDeleteFlowState(undefined),
        }}
        options={{
          show: Boolean(deleteFlowState),
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
