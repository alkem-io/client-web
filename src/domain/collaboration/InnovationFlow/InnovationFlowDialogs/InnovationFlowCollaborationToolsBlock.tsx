import AddIcon from '@mui/icons-material/Add';
import { Box, BoxProps, IconButton, IconButtonProps, SvgIconProps } from '@mui/material';
import { groupBy } from 'lodash';
import { ComponentType, FC, forwardRef } from 'react';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import i18n from '../../../../core/i18n/config';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CroppedMarkdown from '../../../../core/ui/markdown/CroppedMarkdown';
import { Caption } from '../../../../core/ui/typography';
import calloutIcons from '../../callout/utils/calloutIcons';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowStateMenu from './InnovationFlowStateMenu';

const STATES_DROPPABLE_ID = '__states';
export const LAST_STATE = Symbol('__LAST_STATE'); // See implementation of innovationFlowSettings handleCreateState, if the state __LAST is not found it will put the new state at the end of the list.

interface InnovationFlowCollaborationToolsBlockProps {
  callouts: {
    id: string;
    nameID: string;
    type: CalloutType;
    activity: number;
    profile: {
      displayName: string;
    };
    flowState:
      | {
          tagsetId: string;
          currentState: string | undefined;
          allowedValues: string[];
        }
      | undefined;
  }[];
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentState: string | undefined;
  onUpdateFlowStateOrder: (flowState: string, sortOrder: number) => Promise<unknown> | void;
  onUpdateCalloutFlowState: (calloutId: string, newState: string, index: number) => Promise<unknown> | void;
  onUpdateCurrentState: (state: string) => void;
  onCreateStateAfter: (stateBefore?: string | typeof LAST_STATE) => void;
  onEditState: (state: string) => void;
  onDeleteState: (state: string) => void;
}

interface ListItemProps extends BoxProps {
  displayName: string;
  icon?: ComponentType<SvgIconProps>;
  activity?: number;
}

const AddButton = ({ onClick }: IconButtonProps) => {
  const { t } = useTranslation();
  return (
    <Box>
      <IconButton aria-label={t('common.add')} size="small" onClick={onClick}>
        <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
      </IconButton>
    </Box>
  );
};

const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({ displayName, icon: Icon, activity = 0, ...boxProps }, ref) => {
    return (
      <Box ref={ref} {...boxProps}>
        <Caption>
          {Icon && <Icon sx={{ verticalAlign: 'bottom', marginRight: gutters(0.5) }} />}
          {displayName} ({activity})
        </Caption>
      </Box>
    );
  }
);

const InnovationFlowCollaborationToolsBlock: FC<InnovationFlowCollaborationToolsBlockProps> = ({
  callouts,
  innovationFlowStates,
  currentState,
  onUpdateFlowStateOrder,
  onUpdateCalloutFlowState,
  onUpdateCurrentState,
  onCreateStateAfter,
  onEditState,
  onDeleteState,
}) => {
  const { t } = useTranslation();
  const groupedCallouts = groupBy(callouts, callout => callout.flowState?.currentState);

  const handleDragEnd: OnDragEndResponder = ({ draggableId, destination }) => {
    if (destination?.droppableId === STATES_DROPPABLE_ID) {
      if (onUpdateFlowStateOrder && destination) {
        onUpdateFlowStateOrder(draggableId, destination.index);
      }
    } else {
      if (onUpdateCalloutFlowState && destination) {
        onUpdateCalloutFlowState(draggableId, destination.droppableId, destination.index);
      }
    }
  };

  const getStateName = (state: string) =>
    i18n.exists(`common.enums.innovationFlowState.${state}`)
      ? t(`common.enums.innovationFlowState.${state}` as TranslationKey)
      : state;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={STATES_DROPPABLE_ID} type="droppableItem" direction="horizontal">
        {parentDroppableProvided => (
          <Box ref={parentDroppableProvided.innerRef} sx={{ userSelect: 'none' }}>
            <ScrollableCardsLayoutContainer orientation="horizontal" alignItems="stretch">
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
                            <Caption {...parentProvider.dragHandleProps}>{getStateName(state.displayName)}</Caption>
                          }
                        >
                          <InnovationFlowStateMenu
                            state={state.displayName}
                            isCurrentState={isCurrentState}
                            onUpdateCurrentState={onUpdateCurrentState}
                            onAddState={onCreateStateAfter}
                            onEdit={onEditState}
                            onDelete={onDeleteState}
                          />
                        </PageContentBlockHeader>
                        <CroppedMarkdown backgroundColor="paper" heightGutters={3}>
                          {state.description}
                        </CroppedMarkdown>
                        <Droppable droppableId={state.displayName}>
                          {provided => (
                            <Gutters ref={provided.innerRef} disablePadding flexGrow={1} {...provided.droppableProps}>
                              {groupedCallouts[state.displayName]?.map((callout, index) => (
                                <Draggable key={callout.id} draggableId={callout.id} index={index}>
                                  {provider => (
                                    <ListItem
                                      ref={provider.innerRef}
                                      {...provider.draggableProps}
                                      {...provider.dragHandleProps}
                                      displayName={callout.profile.displayName}
                                      icon={calloutIcons[callout.type]}
                                      activity={callout.activity}
                                    />
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Gutters>
                          )}
                        </Droppable>
                      </PageContentBlock>
                    );
                  }}
                </Draggable>
              ))}
              {parentDroppableProvided.placeholder}
              <AddButton onClick={() => onCreateStateAfter(LAST_STATE)} />
            </ScrollableCardsLayoutContainer>
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default InnovationFlowCollaborationToolsBlock;
