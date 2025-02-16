import React, { forwardRef, useCallback } from 'react';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescription from '@/core/ui/card/CardDescription';
import CardFooter from '@/core/ui/card/CardFooter';
import EventCardHeader, { EventCardHeaderProps } from './EventCardHeader';
import { gutters } from '@/core/ui/grid/utils';
import { CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';

export interface CalendarEventCardProps {
  event: NonNullable<EventCardHeaderProps['event']> & {
    profile: NonNullable<EventCardHeaderProps['event']>['profile'] & {
      url: string;
      description?: string;
    };
    subspace?: {
      about: {
        profile: {
          displayName: string;
        };
      };
    };
  };
  highlighted?: boolean;
  onClick: (event: { profile: { url: string } }) => void;
}

const CalendarEventCard = forwardRef<HTMLDivElement, CalendarEventCardProps>(({ event, highlighted, onClick }, ref) => {
  const handleClick = useCallback(() => event && onClick(event), [onClick, event]);
  const { t } = useTranslation();

  return (
    <ContributeCard onClick={handleClick} columns={0} ref={ref} highlighted={highlighted}>
      <EventCardHeader event={event} />
      <CardDetails transparent>
        <CardDescription marginLeft={gutters(2.5)} paddingY={0} overflow="hidden" overflowGradientColor="paper">
          {event.profile.description ?? ''}
        </CardDescription>
      </CardDetails>
      <CardFooter flexDirection="row-reverse">
        <CaptionSmall>{t('buttons.readMore')}</CaptionSmall>
      </CardFooter>
    </ContributeCard>
  );
});

export default CalendarEventCard;
