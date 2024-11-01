import { ReactNode, useMemo } from 'react';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import EventForm from './EventForm';
import { BlockTitle } from '../../../../core/ui/typography';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';

import { isSameDay } from '../../../../core/utils/time/utils';
import { CalendarEventFormData } from '../CalendarEventsContainer';
import { CalendarEventDetailData } from '../CalendarEventDetailContainer';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { FormikSelectValue } from '../../../../core/ui/forms/FormikSelect';
import { CalendarEventType } from '../../../../core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

const DEFAULT_DURATION_MINUTES = 30;
const typeOptions: FormikSelectValue[] = [
  { id: CalendarEventType.Event, name: CalendarEventType.Event },
  { id: CalendarEventType.Training, name: CalendarEventType.Training },
  { id: CalendarEventType.Milestone, name: CalendarEventType.Milestone },
  { id: CalendarEventType.Other, name: CalendarEventType.Other },
];

const CalendarEventForm = ({
  event,
  actions,
  dialogTitle,
  isSubmitting,
  temporaryLocation = false,
  onClose,
  onSubmit,
}: CalendarEventFormProps) => {
  const { t } = useTranslation();

  const dateNow = new Date();
  const initialStartDate = useMemo(() => event?.startDate ?? dateNow, [event]);

  const initialEndDate = useMemo(() => {
    if (!event?.startDate) {
      return dateNow;
    }

    if (event.durationMinutes) {
      return new Date(new Date(event.startDate).getTime() + event.durationMinutes * 60000);
    }

    return dateNow;
  }, [event]);

  const initialValues = useMemo<Partial<CalendarEventFormData>>(() => {
    const startDate = initialStartDate;
    const endDate = initialEndDate;

    return {
      endDate,
      startDate,
      type: event?.type,
      durationDays: event?.durationDays,
      wholeDay: event?.wholeDay ?? false,
      location: event?.profile?.location,
      tags: event?.profile?.tagset?.tags ?? [],
      multipleDays: event?.multipleDays ?? false,
      references: event?.profile?.references ?? [],
      displayName: event?.profile?.displayName ?? '',
      description: event?.profile?.description ?? '',
      durationMinutes: event?.durationMinutes ?? DEFAULT_DURATION_MINUTES,
    };
  }, [event, initialStartDate]);

  /**
   * the following validation applies ensuring that the event is either:
   * 1. wholeDay;
   * 2. if it's the same day it should be with positive durationMinutes
   * 3. otherwise the endDate should be greater than startDate
   * (not the case in #2 where we're using durationMinutes instead of endDate)
   */
  const validateDuration = value => {
    const { durationMinutes, startDate, endDate, wholeDay } = value || {};

    return (
      wholeDay ||
      (isSameDay(startDate, endDate) && (durationMinutes ?? 0) > 0) ||
      (endDate && startDate && dayjs(endDate).isAfter(dayjs(startDate)))
    );
  };

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    type: yup.string().required(t('common.field-required')),
    durationMinutes: yup
      .number()
      .positive()
      .nullable()
      .test('valid-duration', 'Invalid duration', function (value) {
        return validateDuration({ ...this.parent, durationMinutes: value });
      }),
    startDate: yup
      .date()
      .nullable()
      .test('valid-startDate', 'Invalid start date', function (value) {
        return validateDuration({ ...this.parent, startDate: value });
      }),
    endDate: yup
      .date()
      .nullable()
      .test('valid-endDate', 'Invalid end date', function (value) {
        return validateDuration({ ...this.parent, endDate: value });
      }),
    wholeDay: yup.boolean().test('valid-wholeDay', 'Invalid whole day', function (value) {
      return validateDuration({ ...this.parent, wholeDay: value });
    }),
  });

  const handleSubmit = (formValues: Partial<CalendarEventFormData>) => {
    onSubmit(formValues as CalendarEventFormData);
  };

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{dialogTitle}</BlockTitle>
      </DialogHeader>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <EventForm
          actions={actions}
          typeOptions={typeOptions}
          isSubmitting={isSubmitting}
          temporaryLocation={temporaryLocation}
        />
      </Formik>
    </GridProvider>
  );
};

export default CalendarEventForm;

export interface CalendarEventFormProps {
  dialogTitle: string;
  isSubmitting: boolean;
  event: Partial<CalendarEventDetailData> | undefined;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (eventValues: CalendarEventFormData) => void;

  actions?: ReactNode;
  temporaryLocation?: boolean;
}
