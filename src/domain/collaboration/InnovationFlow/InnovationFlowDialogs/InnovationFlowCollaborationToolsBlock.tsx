import { Box, BoxProps, SvgIconProps } from '@mui/material';
import { groupBy } from 'lodash';
import { ComponentType, FC, forwardRef } from 'react';
import { Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import calloutIcons from '../../callout/utils/calloutIcons';
import InnovationFlowDragNDropEditor, {
  InnovationFlowDragNDropEditorProps,
} from '../InnovationFlowDragNDropEditor/InnovationFlowDragNDropEditor';

interface InnovationFlowCollaborationToolsBlockProps extends Omit<InnovationFlowDragNDropEditorProps, 'children'> {
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
  onUpdateCalloutFlowState: (calloutId: string, newState: string, index: number) => Promise<unknown> | void;
}

interface ListItemProps extends BoxProps {
  displayName: string;
  icon?: ComponentType<SvgIconProps>;
  activity?: number;
}

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
  onUpdateCalloutFlowState,
  onUnhandledDragEnd,
  ...statesActions
}) => {
  const groupedCallouts = groupBy(callouts, callout => callout.flowState?.currentState);

  const handleDragEnd: OnDragEndResponder = (result, provided) => {
    const { draggableId, destination } = result;
    if (onUpdateCalloutFlowState && destination) {
      return onUpdateCalloutFlowState(draggableId, destination.droppableId, destination.index);
    }
    onUnhandledDragEnd?.(result, provided);
  };

  return (
    <InnovationFlowDragNDropEditor
      onUnhandledDragEnd={handleDragEnd}
      currentState={currentState}
      innovationFlowStates={innovationFlowStates}
      {...statesActions}
    >
      {state => (
        <Droppable droppableId={state.displayName}>
          {provided => (
            <Gutters
              ref={provided.innerRef}
              disablePadding
              flexGrow={1}
              minHeight={gutters(1)}
              {...provided.droppableProps}
            >
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
      )}
    </InnovationFlowDragNDropEditor>
  );
};

export default InnovationFlowCollaborationToolsBlock;
