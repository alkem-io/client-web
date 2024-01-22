import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { Button, DialogContent, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockTitle } from '../../../../core/ui/typography';
import PostDashboardView from '../../../collaboration/post/views/PostDashboardView';
import CalendarEventDetailContainer from '../CalendarEventDetailContainer';
import EventCardHeader from './EventCardHeader';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import { buildEventUrl } from '../../../../main/routing/urlBuilders';

interface CalendarEventDetailProps {
  spaceNameId: string;
  eventId: string | undefined;
  onClose: DialogHeaderProps['onClose'];
  canEdit?: boolean;
  onEdit?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  actions?: ReactNode;
}

const CalendarEventDetail = ({
  spaceNameId,
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
    <CalendarEventDetailContainer spaceNameId={spaceNameId} eventId={eventId}>
      {({ event, messages, createdDate, ...rest }) => {
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
                  {event && (
                    <ShareButton
                      url={buildEventUrl(event.nameID, {
                        spaceNameId: spaceNameId,
                      })}
                      entityTypeName="event"
                    />
                  )}
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
                messages={messages}
                postUrl=""
                bannerOverlayOverride={<EventCardHeader event={event} />}
                {...rest}
              />
              <Actions justifyContent="space-between" marginTop={gutters()}>
                {actions}
                {canDelete && (
                  <Button startIcon={<DeleteIcon />} onClick={onDelete}>
                    {t('buttons.delete')}
                  </Button>
                )}
              </Actions>
            </DialogContent>
          </>
        );
      }}
    </CalendarEventDetailContainer>
  );
};

export default CalendarEventDetail;
