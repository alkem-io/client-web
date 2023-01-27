import { IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '../../../../core/ui/actions/Actions';
import CardHeaderDetail from '../../../../core/ui/card/CardHeaderDetail';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import AspectDashboardView from '../../../collaboration/aspect/views/AspectDashboardView';
import { formatLongDate, formatTimeAndDuration } from '../../utils';
import CalendarEventDetailContainer from '../CalendarEventDetailContainer';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';

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

const CalendarEventDetail = ({ hubNameId, eventId, onClose, canEdit = false, onEdit, canDelete = false, onDelete, actions }: CalendarEventDetailProps) => {
  const { t } = useTranslation();

  return (
    <CalendarEventDetailContainer hubNameId={hubNameId} eventId={eventId}>
      {({ event, messages, commentsId, createdDate, ...rest }) => {

        const header = (
          <>
            <CardHeaderDetail iconComponent={CalendarIcon}>{formatLongDate(event?.startDate)}</CardHeaderDetail>
            {event && <CardHeaderDetail iconComponent={ClockIcon}>{formatTimeAndDuration(event, t)}</CardHeaderDetail>}
          </>
        );

        // createdDate is read here to remove it from the rest object and not show it
        // TODO: Instead of reusing Aspect views as is, put something in common
        return (
          <>
            <DialogHeader onClose={onClose} actions={canEdit && <IconButton onClick={onEdit}><SettingsIcon /></IconButton>}>
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
              bannerOverlayOverride={header}
              {...rest}
            />
            <Actions justifyContent="space-between">
              {actions}
            </Actions>
          </>
        );
      }}
    </CalendarEventDetailContainer>
  );
};

export default CalendarEventDetail;
