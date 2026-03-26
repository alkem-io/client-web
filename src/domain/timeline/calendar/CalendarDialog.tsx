import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { type FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { type CalendarEventDetailsFragment, TagsetType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useQueryParams } from '@/core/routing/useQueryParams';
import BackButton from '@/core/ui/actions/BackButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import EditButton from '@/core/ui/actions/EditButton';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { BlockAnchorProvider } from '@/core/ui/keyboardNavigation/NextBlockAnchor';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { dateRounded } from '@/core/utils/time/utils';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import type { CalendarEventDetailData } from './useCalendarEventDetail';
import useCalendarEventDetail from './useCalendarEventDetail';
import type { CalendarEventFormData } from './useCalendarEvents';
import useCalendarEvents from './useCalendarEvents';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';

// If url params contains `highlight=YYYY-MM-DD` events in that date will be highlighted
export const HIGHLIGHT_PARAM_NAME = 'highlight';
export const INIT_CREATING_EVENT_PARAM = 'new';
export const CALENDAR_PATH = '/calendar/';

export interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  temporaryLocation?: boolean;
}

// Sub-component for the editing form that needs to call useCalendarEventDetail
const EditingEventForm: FC<{
  eventId: string;
  onSubmit: (calendarEvent: CalendarEventFormData) => void | Promise<void>;
  onClose: () => void;
  updatingCalendarEvent: boolean;
  canDeleteEvents: boolean;
  onDelete: () => void;
  onBack: () => void;
  isSubspace: boolean;
}> = ({ eventId, onSubmit, onClose, updatingCalendarEvent, canDeleteEvents, onDelete, onBack, isSubspace }) => {
  const { t } = useTranslation();
  const { event: eventDetail } = useCalendarEventDetail({ eventId });

  return (
    <CalendarEventForm
      dialogTitle={t('calendar.edit-event')}
      dialogTitleId="calendar-events-dialog-title"
      event={eventDetail}
      onSubmit={onSubmit}
      onClose={onClose}
      isSubmitting={updatingCalendarEvent}
      actions={
        <>
          {canDeleteEvents && <DeleteButton onClick={onDelete} />}
          <BackButton onClick={onBack} />
        </>
      }
      isSubspace={isSubspace}
    />
  );
};

// Inner component that uses hooks (must be a separate component so hooks are always called)
const CalendarDialogInner: FC<{
  onClose: () => void;
  temporaryLocation: boolean;
}> = ({ onClose, temporaryLocation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId, parentSpaceId, calendarEventId } = useUrlResolver();
  const ensurePresence = useEnsurePresence();

  const ref = useRef(null);

  const { pathname } = useLocation();
  const params = useQueryParams();
  const isCreatingEventInit = params.get(INIT_CREATING_EVENT_PARAM);
  const highlightedDayParam: string | null = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay =
    highlightedDayParam && dayjs(highlightedDayParam).isValid()
      ? dayjs(highlightedDayParam).startOf('day').toDate()
      : null;
  const isSubspace = Boolean(parentSpaceId);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEventDetailsFragment, 'id' | 'profile'>>();

  const {
    entities: { events, privileges },
    actions: { createEvent, updateEvent, deleteEvent },
    state: { creatingCalendarEvent, updatingCalendarEvent },
  } = useCalendarEvents({ spaceId, parentSpaceId });

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

  const emptyCalendarEvent: Partial<CalendarEventDetailData> = {
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
  };

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
        actions={isCreatingEventInit ? <div>&nbsp;</div> : <BackButton onClick={() => setIsCreatingEvent(false)} />}
        temporaryLocation={temporaryLocation}
        isSubspace={isSubspace}
      />
    );

    // Editing an event:
  } else if (editingEventId) {
    const event = events.find(event => event.id === editingEventId);
    if (!event || !event.profile.tagset) {
      setEditingEventId(undefined);
      return null;
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
      <EditingEventForm
        eventId={event.id}
        onSubmit={(calendarEvent: CalendarEventFormData) =>
          handleEditEventSubmit(event.id, calendarEvent, event.profile.tagset)
        }
        onClose={handleClose}
        updatingCalendarEvent={updatingCalendarEvent}
        canDeleteEvents={privileges.canDeleteEvents}
        onDelete={() => setDeletingEvent(event)}
        onBack={() => setEditingEventId(undefined)}
        isSubspace={isSubspace}
      />
    );
  } else {
    // Events List:
    if (!calendarEventId) {
      return (
        <BlockAnchorProvider blockRef={ref}>
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
        </BlockAnchorProvider>
      );
    } else {
      // Event Details:
      return (
        <CalendarEventDetail
          eventId={calendarEventId}
          onClose={onClose}
          actions={
            <>
              {privileges.canEditEvents && <EditButton onClick={() => setEditingEventId(calendarEventId)} />}
              <BackButton onClick={navigateBack} variant="contained" />
            </>
          }
          dialogTitleId="calendar-events-dialog-title"
        />
      );
    }
  }
};

const CalendarDialog: FC<CalendarDialogProps> = ({ open, onClose, temporaryLocation = false }) => {
  const { spaceId } = useUrlResolver();

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      aria-labelledby="calendar-events-dialog-title"
      slotProps={{
        paper: {
          sx: {
            padding: 0,
            flexDirection: 'column',
          },
        },
      }}
      onClose={onClose}
    >
      <StorageConfigContextProvider spaceId={spaceId} locationType="space">
        <CalendarDialogInner onClose={onClose} temporaryLocation={temporaryLocation} />
      </StorageConfigContextProvider>
    </DialogWithGrid>
  );
};

export default CalendarDialog;
