import type { DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, Paper, Skeleton, styled } from '@mui/material';
import { groupBy } from 'lodash-es';
import type { FC } from 'react';
import { type CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { CalloutIcon } from '@/domain/collaboration/callout/icons/calloutIcons';
import InnovationFlowDragNDropEditor, {
  type InnovationFlowDragNDropEditorProps,
} from '../InnovationFlowDragNDropEditor/InnovationFlowDragNDropEditor';

const SKELETON_COUNT = 3;

const StyledDragAndDropList = styled(Box)({
  position: 'relative',
  height: '100%',
  userSelect: 'none',
});

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
  onUpdateCalloutFlowState: (calloutId: string, newState: string, index: number) => Promise<unknown> | undefined;
}

const CalloutItemContent = ({
  callout,
}: {
  callout: InnovationFlowCollaborationToolsBlockProps['callouts'][number];
}) => (
  <Box display="flex" flexDirection="row" alignItems="center" gap={gutters(0.5)}>
    <DragIndicatorIcon fontSize="small" sx={{ color: 'action.active', flexShrink: 0 }} />
    <CalloutIcon
      framingType={callout.framing?.type || CalloutFramingType.None}
      allowedTypes={callout.settings?.contribution?.allowedTypes}
      tooltip={true}
      iconProps={{ fontSize: 'small' }}
    />
    <Caption noWrap={true}>
      {callout.profile.displayName} {callout.activity > 0 && `(${callout.activity})`}
    </Caption>
  </Box>
);

const DropIndicatorLine = () => (
  <Box
    sx={{
      height: '2px',
      backgroundColor: 'primary.main',
      borderRadius: '1px',
      marginY: '-1px',
      position: 'relative',
      zIndex: 1,
      '&::before': {
        content: '""',
        position: 'absolute',
        left: -3,
        top: -3,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'primary.main',
      },
    }}
  />
);

const SortableCalloutItem = ({
  callout,
  showIndicator,
}: {
  callout: InnovationFlowCollaborationToolsBlockProps['callouts'][number];
  showIndicator: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: callout.id });

  return (
    <>
      {showIndicator && <DropIndicatorLine />}
      <Box
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          transition,
        }}
        sx={{
          opacity: isDragging ? 0 : 1,
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <CalloutItemContent callout={callout} />
      </Box>
    </>
  );
};

const DroppableStateColumn = ({
  stateName,
  callouts,
  activeId,
  overId,
}: {
  stateName: string;
  callouts: InnovationFlowCollaborationToolsBlockProps['callouts'];
  activeId: string | null;
  overId: string | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: stateName });
  const calloutIds = callouts.map(c => c.id);
  const isDragging = activeId !== null;
  // Show indicator at bottom when hovering over the empty column droppable itself (not over a specific item)
  const showBottomIndicator = isDragging && (overId === stateName || (isOver && !calloutIds.includes(overId ?? '')));

  return (
    <StyledDragAndDropList>
      <SortableContext items={calloutIds} strategy={verticalListSortingStrategy}>
        <Gutters ref={setNodeRef} disablePadding={true} flexGrow={1} minHeight={gutters(1)} height="100%">
          {callouts.map(callout => (
            <SortableCalloutItem
              key={callout.id}
              callout={callout}
              showIndicator={isDragging && overId === callout.id && activeId !== callout.id}
            />
          ))}
          {showBottomIndicator && <DropIndicatorLine />}
        </Gutters>
      </SortableContext>
    </StyledDragAndDropList>
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (onUpdateCalloutFlowState && over) {
      const overIsState = innovationFlow?.states.some(s => s.displayName === over.id);
      const targetState = overIsState
        ? (over.id as string)
        : callouts.find(c => c.id === over.id)?.flowState?.currentState;

      if (targetState) {
        const stateCallouts = groupedCallouts[targetState] ?? [];
        const overIndex = stateCallouts.findIndex(c => c.id === over.id);
        const index = overIndex !== -1 ? overIndex : stateCallouts.length;
        return onUpdateCalloutFlowState(active.id as string, targetState, index);
      }
    }
    onUnhandledDragEnd?.(event);
  };

  const renderDragOverlay = (activeId: string) => {
    const callout = callouts.find(c => c.id === activeId);
    if (callout) {
      return (
        <Paper elevation={3} sx={{ padding: gutters(0.5), cursor: 'grabbing' }}>
          <CalloutItemContent callout={callout} />
        </Paper>
      );
    }
    return null;
  };

  if (loading && !callouts.length) {
    return (
      <Gutters disablePadding={true} height={gutters(5)} flexDirection="row">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PageContentBlock key={`skeleton-${index}`} columns={3} fullHeight={true}>
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
      croppedDescriptions={true}
      renderDragOverlay={renderDragOverlay}
      {...statesActions}
    >
      {(state, dropIndicator) => (
        <DroppableStateColumn
          stateName={state.displayName}
          callouts={groupedCallouts[state.displayName] ?? []}
          activeId={dropIndicator.activeId}
          overId={dropIndicator.overId}
        />
      )}
    </InnovationFlowDragNDropEditor>
  );
};

export default InnovationFlowCollaborationToolsBlock;
