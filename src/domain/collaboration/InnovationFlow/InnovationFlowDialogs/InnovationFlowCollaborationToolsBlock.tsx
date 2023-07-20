import React, { ComponentType, FC, forwardRef } from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import { Box, BoxProps, SvgIconProps } from '@mui/material';
import { GrouppedCallout } from './useInnovationFlowSettings';
import { groupBy } from 'lodash';
import calloutIcons from '../../callout/utils/calloutIcons';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';
import Gutters from '../../../../core/ui/grid/Gutters';

interface InnovationFlowCollaborationToolsBlockProps {
  callouts: GrouppedCallout[];
  flowStateAllowedValues: string[];
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
          {Icon && <Icon />}
          {displayName} ({activity})
        </Caption>
      </Box>
    );
  }
);

const InnovationFlowCollaborationToolsBlock: FC<InnovationFlowCollaborationToolsBlockProps> = ({
  callouts,
  flowStateAllowedValues,
}) => {
  const { t } = useTranslation();
  const groupedCallouts = groupBy(callouts, callout => callout.flowState);

  const handleDragEnd: OnDragEndResponder = () => {};

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <PageContentBlock>
        <BlockTitle>{t('common.collaborationTools')}</BlockTitle>
        <ScrollableCardsLayoutContainer orientation="horizontal" alignItems="stretch">
          {flowStateAllowedValues.map(state => (
            <PageContentBlock key={state} columns={3}>
              <Caption>{state}</Caption>
              <Droppable droppableId={state}>
                {provided => (
                  <Gutters ref={provided.innerRef} disablePadding flexGrow={1} {...provided.droppableProps}>
                    {groupedCallouts[state]?.map((callout, index) => (
                      <Draggable key={callout.id} draggableId={callout.id} index={index}>
                        {provided => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            displayName={callout.profile.displayName}
                            icon={calloutIcons[callout.type]}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Gutters>
                )}
              </Droppable>
            </PageContentBlock>
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlock>
    </DragDropContext>
  );
};

export default InnovationFlowCollaborationToolsBlock;
