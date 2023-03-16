import React, { FC } from 'react';
import { Tooltip } from '@mui/material';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { CalendarEvent } from '../../../../core/apollo/generated/graphql-schema';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import OneLineMarkdown from '../../../../core/ui/markdown/OneLineMarkdown';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import CalendarEventBadge from './CalendarEventBadge';

interface CalendarEventViewProps extends Pick<CalendarEvent, 'nameID' | 'startDate' | 'displayName' | 'profile'> {}

const EVENT_DESCRIPTION_MAX_LENGTH = 80; // characters

interface EventDescriptionProps {
  children: string | undefined;
}

const EventDescription: FC<EventDescriptionProps> = ({ children }) => {
  if (!children) {
    return null;
  }

  const isCut = children.length > EVENT_DESCRIPTION_MAX_LENGTH;

  const descriptionText = isCut ? `${children.slice(0, EVENT_DESCRIPTION_MAX_LENGTH)}…` : children;

  const formattedDescription = (
    <CardText>
      <OneLineMarkdown>{descriptionText}</OneLineMarkdown>
    </CardText>
  );

  if (isCut) {
    return (
      <Tooltip title={<WrapperMarkdown>{children}</WrapperMarkdown>} placement="top-start" disableInteractive>
        {formattedDescription}
      </Tooltip>
    );
  }

  return formattedDescription;
};

const CalendarEventView: FC<CalendarEventViewProps> = event => {
  const url = `${EntityPageSection.Dashboard}/calendar/${event.nameID}`;

  return (
    <BadgeCardView visual={<CalendarEventBadge eventStartDate={event.startDate} />}>
      <BlockSectionTitle component={RouterLink} to={url}>
        {event.displayName}
      </BlockSectionTitle>
      <EventDescription>{event.profile?.description}</EventDescription>
    </BadgeCardView>
  );
};

export default CalendarEventView;
