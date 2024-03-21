import { Add } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../core/routing/useNavigate';
import { DialogContent } from '../../../core/ui/dialog/deprecated';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import { CalendarEventDetailsFragment, TagsetType } from '../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import { Actions } from '../../../core/ui/actions/Actions';
import BackButton from '../../../core/ui/actions/BackButton';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { gutters } from '../../../core/ui/grid/utils';
import { BlockTitle } from '../../../core/ui/typography';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { dateRounded } from '../../../core/utils/time/utils';
import CalendarEventDetailContainer, { CalendarEventDetailData } from './CalendarEventDetailContainer';
import { CalendarEventFormData, CalendarEventsContainer } from './CalendarEventsContainer';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';
import dayjs from 'dayjs';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { JourneyTypeName } from '../../journey/JourneyTypeName';

// If url params contains `highlight=YYYY-MM-DD` events in that date will be highlighted
export const HIGHLIGHT_PARAM_NAME = 'highlight';

export interface CalendarDialogProps {
  open: boolean;
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
  onClose: () => void;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, journeyId, journeyTypeName, onClose }) => {
  const { t } = useTranslation();
  const { calendarEventNameId } = useUrlParams();
  const navigate = useNavigate();

  const params = useQueryParams();
  const highlightedDayParam: string | null = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay = useMemo(
    () =>
      highlightedDayParam && dayjs(highlightedDayParam).isValid()
        ? dayjs(highlightedDayParam).startOf('day').toDate()
        : null,
    [highlightedDayParam]
  );

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEventDetailsFragment, 'id' | 'nameID' | 'profile'>>();

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEventId(undefined);
    setDeletingEvent(undefined);
    onClose();
  };

  const emptyCalendarEvent: Partial<CalendarEventDetailData> = useMemo(
    () => ({
      startDate: dateRounded(),
      durationMinutes: 30,
      profile: {
        id: '',
        url: '',
        displayName: '',
        description: t('calendar.defaultEventDescription'),
        references: [],
        tagset: { id: '', name: '', tags: [], allowedValues: [], type: TagsetType.Freeform },
      },
      multipleDays: false,
      durationDays: 0,
      wholeDay: false,
      type: undefined,
    }),
    [t]
  );

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      aria-labelledby="calendar-events-dialog-title"
      PaperProps={{ sx: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      <CalendarEventsContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
        {(
          { events, privileges },
          { createEvent, updateEvent, deleteEvent },
          { creatingCalendarEvent, updatingCalendarEvent, deletingCalendarEvent }
        ) => {
          // Deleting an event:
          if (deletingEvent) {
            const handleDeleteEvent = async (eventId: string) => {
              await deleteEvent(eventId);
              setDeletingEvent(undefined);
              navigate(`${EntityPageSection.Dashboard}/calendar`);
            };
            return (
              <>
                <DialogHeader onClose={() => setDeletingEvent(undefined)}>{t('calendar.delete-event')}</DialogHeader>
                <DialogContent>
                  <BlockTitle>
                    {t('calendar.delete-confirmation', { title: deletingEvent.profile.displayName })}
                  </BlockTitle>
                  <Actions justifyContent="space-around" marginTop={gutters()}>
                    <Button
                      color="error"
                      onClick={() => handleDeleteEvent(deletingEvent.id)}
                      disabled={deletingCalendarEvent}
                    >
                      {t('buttons.delete')}
                    </Button>
                    <Button onClick={() => setDeletingEvent(undefined)} variant="contained">
                      {t('buttons.cancel')}
                    </Button>
                  </Actions>
                </DialogContent>
              </>
            );

            // Creating a new event:
          } else if (isCreatingEvent) {
            const handleNewEventSubmit = async (calendarEvent: CalendarEventFormData) => {
              await createEvent(calendarEvent);
              setIsCreatingEvent(false);
            };

            return (
              <CalendarEventForm
                dialogTitle={t('calendar.add-event')}
                event={emptyCalendarEvent}
                onSubmit={handleNewEventSubmit}
                onClose={handleClose}
                isSubmitting={creatingCalendarEvent}
                actions={<BackButton onClick={() => setIsCreatingEvent(false)} />}
              />
            );

            // Editing an event:
          } else if (editingEventId) {
            const event = events.find(event => event.nameID === editingEventId || event.id === editingEventId);
            if (!event) {
              setEditingEventId(undefined);
              return;
            }

            const handleEditEventSubmit = async (
              eventId: string,
              tagsetId: string | undefined,
              calendarEvent: CalendarEventFormData
            ) => {
              await updateEvent(eventId, tagsetId, calendarEvent);
              setEditingEventId(undefined);
            };

            return (
              <CalendarEventDetailContainer eventId={event.id}>
                {({ event: eventDetail }) => (
                  <CalendarEventForm
                    dialogTitle={t('calendar.edit-event')}
                    event={eventDetail}
                    onSubmit={(calendarEvent: CalendarEventFormData) =>
                      handleEditEventSubmit(event.id, event.profile.tagset?.id, calendarEvent)
                    }
                    onClose={handleClose}
                    isSubmitting={updatingCalendarEvent}
                    actions={<BackButton onClick={() => setEditingEventId(undefined)} />}
                  />
                )}
              </CalendarEventDetailContainer>
            );
          } else {
            // Events List:
            if (!calendarEventNameId) {
              return (
                <CalendarEventsList
                  events={events}
                  onClose={handleClose}
                  highlightedDay={highlightedDay}
                  actions={
                    privileges.canCreateEvents && (
                      <IconButton onClick={() => setIsCreatingEvent(true)} size="large" sx={{ padding: 0 }}>
                        <RoundedIcon component={Add} size="medium" iconSize="small" />
                      </IconButton>
                    )
                  }
                />
              );
            } else {
              // Event Details:
              const event = events.find(event => event.nameID === calendarEventNameId);
              return (
                <CalendarEventDetail
                  eventId={event?.id}
                  onClose={onClose}
                  canEdit={privileges.canEditEvents}
                  onEdit={() => setEditingEventId(event?.nameID)}
                  canDelete={privileges.canDeleteEvents}
                  onDelete={() => setDeletingEvent(event)}
                  actions={<BackButton onClick={() => navigate(`${EntityPageSection.Dashboard}/calendar`)} />}
                />
              );
            }
          }
        }}
      </CalendarEventsContainer>
    </DialogWithGrid>
  );
};

export default CalendarDialog;
