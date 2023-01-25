import React, { FC } from 'react';
import { Box, Tooltip } from '@mui/material';
import { Reference } from '../../../common/profile/Profile';
import { BlockSectionTitle, CaptionBold, CardText } from '../../../../core/ui/typography';
import RoundedIcon, { RoundedIconProps } from '../../../../core/ui/icon/RoundedIcon';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import RouterLink from '../../../../core/ui/link/RouterLink';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import { CalendarEvent } from '../../../../core/apollo/generated/graphql-schema';

interface CalendarEventViewProps extends Pick<CalendarEvent, 'nameID' | 'startDate' | 'displayName' | 'profile'>  {
}

const EVENT_DESCRIPTION_MAX_LENGTH = 80; // characters

// TODO: format dates in a better way.
// support en-us format mm/dd??
const formatDate = (date: Date | undefined, defaultValue: string = '') => {
  console.log(date);
  if (!date) { return defaultValue }
  return new Date(date).toLocaleDateString("en-GB", {day:'2-digit', month: '2-digit'});
}

interface DateIconProps {
  children: string | undefined;
}

const DateIcon: FC<DateIconProps> = ({ children }) => {
  if (!children) {
    return null;
  }
  return <Box>{children}</Box>
}


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

const CalendarEventView: FC<CalendarEventViewProps> = (event) => {
  const url = '/';
  return (
    <BadgeCardView visual={<RoundedBadge size="medium"><CaptionBold>{formatDate(event.startDate)}</CaptionBold></RoundedBadge>}>
      <BlockSectionTitle component={RouterLink} to={url} loose>
        {event.displayName}
      </BlockSectionTitle>
      <EventDescription>{event.profile?.description}</EventDescription>
    </BadgeCardView>
  );
};

export default CalendarEventView;
