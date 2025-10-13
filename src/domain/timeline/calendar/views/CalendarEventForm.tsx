import { ReactNode, useMemo } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import { CalendarEventFormData } from '../CalendarEventsContainer';
import { CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { CalendarEventDetailData } from '../CalendarEventDetailContainer';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import dayjs from 'dayjs';
import { isSameDay } from '@/core/utils/time/utils';
import EventForm from './EventForm/EventForm';
import { FormikSelectValue } from '@/core/ui/forms/FormikSelect';
import GridProvider from '@/core/ui/grid/GridProvider';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

const DEFAULT_DURATION_MINUTES = 30;

export interface CalendarEventFormProps {
  event: Partial<CalendarEventDetailData> | undefined;
  dialogTitle: string;
  dialogTitleId?: string;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (eventValues: CalendarEventFormData) => void;
  isSubmitting: boolean;
  actions?: ReactNode;
  temporaryLocation?: boolean;
  isSubspace?: boolean;
}

const typeOptions: FormikSelectValue[] = Object.values(CalendarEventType).map(type => ({
  id: type,
  name: type,
}));

const CalendarEventForm = ({
  event,
  dialogTitle,
  dialogTitleId,
  onSubmit,
  onClose,
  isSubmitting,
  actions,
  temporaryLocation = false,
  isSubspace = false,
}: CalendarEventFormProps) => {
  const handleSubmit = (formValues: Partial<CalendarEventFormData>) => {
    onSubmit(formValues as CalendarEventFormData);
  };

  const dateNow = new Date();

  const initialStartDate = useMemo(() => (event?.startDate ? new Date(event.startDate) : dateNow), [event]);
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
      startDate,
      endDate,
      durationMinutes: event?.durationMinutes ?? DEFAULT_DURATION_MINUTES,
      displayName: event?.profile?.displayName ?? '',
      description: event?.profile?.description ?? '',
      type: event?.type,
      multipleDays: event?.multipleDays ?? false,
      wholeDay: event?.wholeDay ?? false,
      durationDays: event?.durationDays,
      tags: event?.profile?.tagset?.tags ?? [],
      references: event?.profile?.references ?? [],
      location: event?.profile?.location,
      visibleOnParentCalendar: event?.visibleOnParentCalendar ?? false,
    };
  }, [event, initialStartDate]);

  // the following validation applies ensuring that the event is either:
  // 1. wholeDay;
  // 2. if it's the same day it should be with positive durationMinutes
  // 3. outherwise the endDate should be greater than startDate
  // (not the case in #2 where we're using durationMinutes instead of endDate)
  const validateDuration = value => {
    const { durationMinutes, startDate, endDate, wholeDay } = value || {};

    if (wholeDay) {
      return true;
    }
    if (isSameDay(startDate, endDate) && (durationMinutes ?? 0) > 0) {
      return true;
    }
    if (endDate && startDate && dayjs(endDate).isAfter(dayjs(startDate))) {
      return true;
    }

    return false;
  };

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator.required(),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    type: textLengthValidator({ required: true }),
    visibleOnParentCalendar: yup.boolean().required(),
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

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose} title={dialogTitle} id={dialogTitleId} />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        <EventForm
          typeOptions={typeOptions}
          isSubmitting={isSubmitting}
          actions={actions}
          temporaryLocation={temporaryLocation}
          isSubspace={isSubspace}
        />
      </Formik>
    </GridProvider>
  );
};

export default CalendarEventForm;
