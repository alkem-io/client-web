import React, { FC } from 'react';
import { Tooltip } from '@mui/material';
import { BlockSectionTitle, CaptionBold, CardText } from '../../../../core/ui/typography';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import RouterLink from '../../../../core/ui/link/RouterLink';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import { CalendarEvent } from '../../../../core/apollo/generated/graphql-schema';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface CalendarEventViewProps extends Pick<CalendarEvent, 'nameID' | 'startDate' | 'displayName' | 'profile'> {}

const EVENT_DESCRIPTION_MAX_LENGTH = 80; // characters

// TODO: format dates in a better way.
// support en-us format mm/dd??
const formatDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
};

const formatLongDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface EventDescriptionProps {
  children: string | undefined;
}

const EventDescription: FC<EventDescriptionProps> = ({ children }) => {
  if (!children) {
    return null;
  }

  const isCut = children.length > EVENT_DESCRIPTION_MAX_LENGTH;

  const descriptionText = isCut ? `${children.slice(0, EVENT_DESCRIPTION_MAX_LENGTH)}…` : children;

  const formattedDescription = <CardText>{descriptionText}</CardText>;

  if (isCut) {
    return (
      <Tooltip title={children} placement="top-start" disableInteractive>
        {formattedDescription}
      </Tooltip>
    );
  }

  return formattedDescription;
};

const CalendarEventView: FC<CalendarEventViewProps> = event => {
  const url = `${EntityPageSection.Dashboard}/calendar/${event.nameID}`;
  return (
    <BadgeCardView
      visual={
        <RoundedBadge size="medium">
          <Tooltip title={formatLongDate(event.startDate)}>
            <CaptionBold>{formatDate(event.startDate)}</CaptionBold>
          </Tooltip>
        </RoundedBadge>
      }
    >
      <BlockSectionTitle component={RouterLink} to={url} loose>
        {event.displayName}
      </BlockSectionTitle>
      <EventDescription>{event.profile?.description}</EventDescription>
    </BadgeCardView>
  );
};

export default CalendarEventView;
