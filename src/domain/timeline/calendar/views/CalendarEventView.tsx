import React, { FC } from 'react'
import { CalendarEvent } from '../../../../core/apollo/generated/graphql-schema'

interface CalendarEventViewProps extends CalendarEvent {

}

const CalendarEventView: FC<CalendarEventViewProps> = ({ displayName }) => {
  return (
    <div>{displayName}</div>
  )
}

export default CalendarEventView;