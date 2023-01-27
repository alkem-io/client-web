import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { Button, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import AspectDashboardView from '../../../collaboration/aspect/views/AspectDashboardView';
import CalendarEventDetailContainer from '../CalendarEventDetailContainer';
import EventCardHeader from './EventCardHeader';

interface CalendarEventDetailProps {
  hubNameId: string;
  eventId: string | undefined;
  onClose: DialogHeaderProps['onClose'];
  canEdit?: boolean;
  onEdit?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  actions?: ReactNode;
}

const CalendarEventDetail = ({
  hubNameId,
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
    <CalendarEventDetailContainer hubNameId={hubNameId} eventId={eventId}>
      {({ event, messages, commentsId, createdDate, ...rest }) => {
        // createdDate is read here to remove it from the rest object and not show it
        // TODO: Instead of reusing Aspect views as is, put something in common
        return (
          <>
            <DialogHeader
              onClose={onClose}
              actions={
                canEdit && (
                  <IconButton onClick={onEdit}>
                    <SettingsIcon />
                  </IconButton>
                )
              }
            >
              <BlockTitle>{t('dashboard-calendar-section.dialog-title')}</BlockTitle>
            </DialogHeader>
            <AspectDashboardView
              mode="messages"
              displayName={event?.displayName}
              description={event?.profile?.description}
              type={event?.type}
              tags={event?.profile?.tagset?.tags}
              references={event?.profile?.references}
              messages={messages}
              commentId={event?.comments?.id}
              aspectUrl=""
              bannerOverlayOverride={<EventCardHeader event={event} />}
              {...rest}
            />
            <Actions justifyContent="space-between">
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
