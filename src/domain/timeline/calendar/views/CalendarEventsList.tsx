import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Actions } from '../../../../core/ui/actions/Actions';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockTitle } from '../../../../core/ui/typography';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import CalendarEventCard, { CalendarEventCardData } from './CalendarEventCard';
import Gutters from '../../../../core/ui/grid/Gutters';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';

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
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('dashboard-calendar-section.dialog-title')}</BlockTitle>
      </DialogHeader>
      <Gutters minHeight={0} flexGrow={1}>
        <ScrollerWithGradient orientation="vertical" minHeight={0} flexGrow={1}>
          <CardsLayout items={events} cards={false} paddingBottom={gutters(4)}>
            {event => (
              <CalendarEventCard key={event.id} event={event} onClick={() => handleClickOnEvent(event.nameID)} />
            )}
          </CardsLayout>
        </ScrollerWithGradient>
        <Actions justifyContent="space-between" sx={{ position: 'absolute', bottom: gutters(), right: gutters() }}>
          {actions}
        </Actions>
      </Gutters>
    </GridProvider>
  );
};

export default CalendarEventsList;
