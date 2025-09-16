import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { CalendarEventDetailsFragment, TagsetType } from '@/core/apollo/generated/graphql-schema';
import { useQueryParams } from '@/core/routing/useQueryParams';
import BackButton from '@/core/ui/actions/BackButton';
import { dateRounded } from '@/core/utils/time/utils';
import CalendarEventDetailContainer, { CalendarEventDetailData } from './CalendarEventDetailContainer';
import { CalendarEventFormData, CalendarEventsContainer } from './CalendarEventsContainer';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';
import dayjs from 'dayjs';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import EditButton from '@/core/ui/actions/EditButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { useLocation } from 'react-router-dom';
import { BlockAnchorProvider } from '@/core/ui/keyboardNavigation/NextBlockAnchor';
import useEnsurePresence from '@/core/utils/ensurePresence';

// If url params contains `highlight=YYYY-MM-DD` events in that date will be highlighted
export const HIGHLIGHT_PARAM_NAME = 'highlight';
export const INIT_CREATING_EVENT_PARAM = 'new';
export const CALENDAR_PATH = '/calendar';

export interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  temporaryLocation?: boolean;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, onClose, temporaryLocation = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId, parentSpaceId, calendarEventId } = useUrlResolver();
  const ensurePresence = useEnsurePresence();

  const ref = useRef(null);

  const { pathname } = useLocation();
  const params = useQueryParams();
  const isCreatingEventInit = params.get(INIT_CREATING_EVENT_PARAM);
  const highlightedDayParam: string | null = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay = useMemo(
    () =>
      highlightedDayParam && dayjs(highlightedDayParam).isValid()
        ? dayjs(highlightedDayParam).startOf('day').toDate()
        : null,
    [highlightedDayParam]
  );
  const isSubspace = Boolean(parentSpaceId);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEventDetailsFragment, 'id' | 'profile'>>();

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEventId(undefined);
    setDeletingEvent(undefined);
    onClose();
  };

  const navigateBack = () => {
    const calendarIndex = pathname.lastIndexOf(CALENDAR_PATH);
    if (calendarIndex !== -1) {
      const basePath = pathname.substring(0, calendarIndex + CALENDAR_PATH.length);

      return navigate(basePath);
    }

    return navigate('/');
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
      slotProps={{
        paper: {
          sx: {
            padding: 0,
            display: `${deletingEvent ? 'none' : 'flex'}`,
            flexDirection: 'column',
          },
        },
      }}
      onClose={handleClose}
    >
      <BlockAnchorProvider blockRef={ref}>
        <CalendarEventsContainer spaceId={spaceId} parentSpaceId={parentSpaceId}>
          {(
            { events, privileges },
            { createEvent, updateEvent, deleteEvent },
            { creatingCalendarEvent, updatingCalendarEvent }
          ) => {
            // Deleting an event:
            if (deletingEvent) {
              const handleDeleteEvent = async (eventId: string) => {
                await deleteEvent(eventId);
                setDeletingEvent(undefined);
                navigateBack();
              };
              return (
                <ConfirmationDialog
                  actions={{
                    onCancel: () => setDeletingEvent(undefined),
                    onConfirm: async () => {
                      if (deletingEvent.id) {
                        await handleDeleteEvent(deletingEvent.id);
                      }
                      setDeletingEvent(undefined);
                    },
                  }}
                  entities={{
                    confirmButtonTextId: 'buttons.delete',
                    content: t('calendar.delete-confirmation', {
                      title: deletingEvent.profile.displayName,
                      entity: t(`common.${parentSpaceId ? 'subspace' : 'space'}`),
                    }),
                    titleId: 'calendar.delete-event',
                  }}
                  options={{
                    show: Boolean(deletingEvent),
                  }}
                />
              );

              // Creating a new event:
            } else if (isCreatingEvent || isCreatingEventInit) {
              const handleNewEventSubmit = async (calendarEvent: CalendarEventFormData) => {
                const eventUrl = await createEvent(calendarEvent);
                setIsCreatingEvent(false);
                eventUrl ? navigate(eventUrl) : navigateBack();
              };

              return (
                <CalendarEventForm
                  dialogTitle={t('calendar.add-event')}
                  dialogTitleId="calendar-events-dialog-title"
                  event={emptyCalendarEvent}
                  onSubmit={handleNewEventSubmit}
                  onClose={handleClose}
                  isSubmitting={creatingCalendarEvent}
                  actions={
                    isCreatingEventInit ? <div>&nbsp;</div> : <BackButton onClick={() => setIsCreatingEvent(false)} />
                  }
                  temporaryLocation={temporaryLocation}
                  isSubspace={isSubspace}
                />
              );

              // Editing an event:
            } else if (editingEventId) {
              const event = events.find(event => event.id === editingEventId);
              if (!event || !event.profile.tagset) {
                setEditingEventId(undefined);
                return;
              }

              const handleEditEventSubmit = async (
                eventId: string,
                calendarEvent: CalendarEventFormData,
                tagset?: TagsetModel
              ) => {
                const tags = ensurePresence(tagset, 'tags');
                await updateEvent(eventId, calendarEvent, tags);
                setEditingEventId(undefined);
              };

              return (
                <CalendarEventDetailContainer eventId={event.id}>
                  {({ event: eventDetail }) => (
                    <CalendarEventForm
                      dialogTitle={t('calendar.edit-event')}
                      dialogTitleId="calendar-events-dialog-title"
                      event={eventDetail}
                      onSubmit={(calendarEvent: CalendarEventFormData) =>
                        handleEditEventSubmit(event.id, calendarEvent, event.profile.tagset)
                      }
                      onClose={handleClose}
                      isSubmitting={updatingCalendarEvent}
                      actions={
                        <>
                          {privileges.canDeleteEvents && <DeleteButton onClick={() => setDeletingEvent(event)} />}
                          <BackButton onClick={() => setEditingEventId(undefined)} />
                        </>
                      }
                      isSubspace={isSubspace}
                    />
                  )}
                </CalendarEventDetailContainer>
              );
            } else {
              // Events List:
              if (!calendarEventId) {
                return (
                  <CalendarEventsList
                    dialogTitleId="calendar-events-dialog-title"
                    events={events}
                    onClose={handleClose}
                    highlightedDay={highlightedDay}
                    actions={
                      privileges.canCreateEvents && (
                        <IconButton
                          onClick={() => setIsCreatingEvent(true)}
                          aria-label={t('calendar.add-event')}
                          size="large"
                          sx={{
                            padding: 0,
                            backgroundColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: theme => theme.palette.highlight.main,
                              svg: {
                                color: theme => theme.palette.highlight.contrastText,
                              },
                            },
                          }}
                        >
                          <RoundedIcon component={Add} size="medium" iconSize="small" color="unset" />
                        </IconButton>
                      )
                    }
                    ref={ref}
                  />
                );
              } else {
                // Event Details:
                const event = events.find(event => event.id === calendarEventId);
                return (
                  <CalendarEventDetail
                    eventId={event?.id}
                    onClose={onClose}
                    actions={
                      <>
                        {privileges.canEditEvents && <EditButton onClick={() => setEditingEventId(event?.id)} />}
                        <BackButton onClick={navigateBack} variant="contained" />
                      </>
                    }
                    dialogTitleId="calendar-events-dialog-title"
                  />
                );
              }
            }
          }}
        </CalendarEventsContainer>
      </BlockAnchorProvider>
    </DialogWithGrid>
  );
};

export default CalendarDialog;
