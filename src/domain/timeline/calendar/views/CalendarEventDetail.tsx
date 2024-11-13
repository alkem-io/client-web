import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { Button, DialogContent, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '@core/ui/dialog/DialogHeader';
import { gutters } from '@core/ui/grid/utils';
import { BlockTitle } from '@core/ui/typography';
import PostDashboardView from '../../../collaboration/post/views/PostDashboardView';
import CalendarEventDetailContainer from '../CalendarEventDetailContainer';
import EventCardHeader from './EventCardHeader';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';

interface CalendarEventDetailProps {
  eventId: string | undefined;
  onClose: DialogHeaderProps['onClose'];
  canEdit?: boolean;
  onEdit?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  actions?: ReactNode;
}

const CalendarEventDetail = ({
  eventId,
  onClose,
  canEdit = false,
  onEdit,
  canDelete = false,
  onDelete,
  actions,
}: CalendarEventDetailProps) => {
  const { t } = useTranslation();

  return (
    <CalendarEventDetailContainer eventId={eventId}>
      {({ event, messages, vcInteractions, createdDate, ...rest }) => {
        // createdDate is read here to remove it from the rest object and not show it
        // Also displayName is passed as a space because we are already showing the event
        //   title in the bannerOverlays
        // TODO: Instead of reusing Post views as is, put something in common - Redesign this view
        return (
          <>
            <DialogHeader
              onClose={onClose}
              actions={
                <>
                  {canEdit && (
                    <IconButton onClick={onEdit} aria-label={t('common.settings')}>
                      <SettingsIcon />
                    </IconButton>
                  )}
                  {event && <ShareButton url={event.profile.url} entityTypeName="event" />}
                </>
              }
            >
              <BlockTitle>{t('common.events')}</BlockTitle>
            </DialogHeader>
            <DialogContent>
              <PostDashboardView
                mode="messages"
                displayName="&nbsp;"
                description={event?.profile.description}
                type={event?.type}
                tags={event?.profile.tagset?.tags}
                references={event?.profile.references}
                location={event?.profile.location}
                postUrl=""
                bannerOverlayOverride={<EventCardHeader event={event} />}
                messages={messages}
                vcInteractions={vcInteractions}
                vcEnabled={false}
                {...rest}
              />
            </DialogContent>
            <Actions justifyContent="space-between" padding={gutters()}>
              {actions}
              {canDelete && (
                <Button startIcon={<DeleteIcon />} onClick={onDelete}>
                  {t('buttons.delete')}
                </Button>
              )}
            </Actions>
          </>
        );
      }}
    </CalendarEventDetailContainer>
  );
};

export default CalendarEventDetail;
