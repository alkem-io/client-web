import { DialogContent } from '@mui/material';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Actions } from '../../../../core/ui/actions/Actions';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../../core/ui/card/ContributeCard';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockTitle } from '../../../../core/ui/typography';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import CalendarEventCard, { CalendarEventCardData } from './CalendarEventCard';

interface CalendarEventsListProps {
  events: CalendarEventCardData[];
  onClose?: DialogHeaderProps['onClose'];
  actions?: ReactNode;
}

const CalendarEventsList = ({ events, actions, onClose }: CalendarEventsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleClickOnEvent = (nameId: string) => {
    navigate(`${EntityPageSection.Dashboard}/calendar/${nameId}`);
  };

  return (
    <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('dashboard-calendar-section.dialog-title')}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <CardsLayout items={events} disablePadding cards={false}>
          {event => <CalendarEventCard key={event.id} event={event} onClick={() => handleClickOnEvent(event.nameID)} />}
        </CardsLayout>
        <Actions justifyContent="space-between" sx={{ position: 'absolute', bottom: gutters(), right: gutters() }}>
          {actions}
        </Actions>
      </DialogContent>
    </GridProvider>
  );
};

export default CalendarEventsList;
