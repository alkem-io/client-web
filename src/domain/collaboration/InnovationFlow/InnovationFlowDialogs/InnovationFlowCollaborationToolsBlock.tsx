import { Box, BoxProps, Skeleton, styled } from '@mui/material';
import { groupBy } from 'lodash';
import { FC, ReactNode } from 'react';
import { Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { CalloutIcon } from '@/domain/collaboration/callout/icons/calloutIcons';
import InnovationFlowDragNDropEditor, {
  InnovationFlowDragNDropEditorProps,
} from '../InnovationFlowDragNDropEditor/InnovationFlowDragNDropEditor';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { GUTTER_PX } from '@/core/ui/grid/constants';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';

const SKELETON_COUNT = 3;

const StyledDragAndDropList = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  userSelect: 'none',
  '& div[data-rbd-drop-indicator]': {
    background: theme.palette.primary.main,
    marginTop: `${-(GUTTER_PX / 2 + 1)}px`,
    marginBottom: `${-(GUTTER_PX / 2 + 1)}px`,
  },
}));

interface InnovationFlowCollaborationToolsBlockProps extends Omit<InnovationFlowDragNDropEditorProps, 'children'> {
  callouts: {
    id: string;
    activity: number;
    profile: {
      displayName: string;
    };
    framing?: {
      type?: CalloutFramingType;
    };
    settings?: {
      contribution?: {
        allowedTypes?: CalloutContributionType[];
      };
    };
    flowState:
      | {
          tagsetId: string;
          currentState: string | undefined;
          allowedValues: string[];
        }
      | undefined;
  }[];
  loading?: boolean;
  onUpdateCalloutFlowState: (calloutId: string, newState: string, index: number) => Promise<unknown> | void;
}

interface ListItemProps extends BoxProps {
  displayName: string;
  Icon: ReactNode;
  activity?: number;
}

const ListItem = ({
  ref,
  displayName,
  Icon,
  activity = 0,
  ...boxProps
}: ListItemProps & {
  ref: React.Ref<HTMLDivElement>;
}) => {
  return (
    <Box ref={ref} {...boxProps} sx={{ gap: gutters(0.5) }}>
      {Icon}
      <Caption>
        {displayName} {activity > 0 && `(${activity})`}
      </Caption>
    </Box>
  );
};

const InnovationFlowCollaborationToolsBlock: FC<InnovationFlowCollaborationToolsBlockProps> = ({
  callouts,
  loading,
  innovationFlow,
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

  if (loading && !callouts.length) {
    return (
      <Gutters disablePadding height={gutters(5)} flexDirection="row">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PageContentBlock key={index} columns={3} fullHeight>
            <Skeleton aria-busy="true" />
          </PageContentBlock>
        ))}
      </Gutters>
    );
  }

  return (
    <InnovationFlowDragNDropEditor
      onUnhandledDragEnd={handleDragEnd}
      innovationFlow={innovationFlow}
      croppedDescriptions
      {...statesActions}
    >
      {state => (
        <StyledDragAndDropList>
          <Droppable droppableId={state.displayName}>
            {provided => (
              <Gutters
                ref={provided.innerRef}
                disablePadding
                flexGrow={1}
                minHeight={gutters(1)}
                height="100%"
                {...provided.droppableProps}
              >
                {groupedCallouts[state.displayName]?.map((callout, index) => (
                  <Draggable key={callout.id} draggableId={callout.id} index={index}>
                    {provider => (
                      <ListItem
                        ref={provider.innerRef}
                        {...provider.draggableProps}
                        {...provider.dragHandleProps}
                        {...{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: gutters(0.5) }}
                        displayName={callout.profile.displayName}
                        Icon={
                          <CalloutIcon
                            framingType={callout.framing?.type || CalloutFramingType.None}
                            allowedTypes={callout.settings?.contribution?.allowedTypes}
                            tooltip
                            iconProps={{ fontSize: 'small' }}
                          />
                        }
                        activity={callout.activity}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Gutters>
            )}
          </Droppable>
        </StyledDragAndDropList>
      )}
    </InnovationFlowDragNDropEditor>
  );
};

export default InnovationFlowCollaborationToolsBlock;
