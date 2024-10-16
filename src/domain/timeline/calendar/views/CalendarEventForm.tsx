import React, { ReactNode, useMemo } from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent, FormControlLabel, Switch } from '@mui/material';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import FormikDatePicker from '../../../../core/ui/forms/DatePicker/FormikDatePicker';
import { CalendarEventFormData } from '../CalendarEventsContainer';
import { CalendarEventType } from '../../../../core/apollo/generated/graphql-schema';
import Gutters from '../../../../core/ui/grid/Gutters';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { gutters } from '../../../../core/ui/grid/utils';
import FormikTimePicker from '../../../../core/ui/forms/DatePicker/FormikTimePicker';
import FormikAutocomplete, { FormikSelectValue } from '../../../../core/ui/forms/FormikAutocomplete';
import { Actions } from '../../../../core/ui/actions/Actions';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { CalendarEventDetailData } from '../CalendarEventDetailContainer';
import { LoadingButton } from '@mui/lab';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import dayjs from 'dayjs';
import FormikDurationMinutes from '../../../../core/ui/forms/DatePicker/FormikDurationMinutes';
import { isSameDay } from '../../../../core/utils/time/utils';

const DEFAULT_DURATION_MINUTES = 30;

type DateType = Date | undefined;

interface CalendarEventFormProps {
  event: Partial<CalendarEventDetailData> | undefined;
  dialogTitle: string;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (eventValues: CalendarEventFormData) => void;
  isSubmitting: boolean;
  actions?: ReactNode;
}

const typeOptions: FormikSelectValue[] = [
  {
    id: CalendarEventType.Event,
    name: CalendarEventType.Event,
  },
  {
    id: CalendarEventType.Training,
    name: CalendarEventType.Training,
  },
  {
    id: CalendarEventType.Milestone,
    name: CalendarEventType.Milestone,
  },
  {
    id: CalendarEventType.Other,
    name: CalendarEventType.Other,
  },
];

const CalendarEventForm = ({
  event,
  dialogTitle,
  onSubmit,
  onClose,
  isSubmitting,
  actions,
}: CalendarEventFormProps) => {
  const { t } = useTranslation();

  const handleSubmit = (formValues: Partial<CalendarEventFormData>) => {
    onSubmit(formValues as CalendarEventFormData);
  };

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

  const getMinTime = (startDate: DateType, endDate: number | DateType) => {
    if (!startDate) {
      return undefined;
    }

    return isSameDay(startDate, endDate) ? undefined : dayjs(startDate);
  };

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{dialogTitle}</BlockTitle>
      </DialogHeader>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        {({ isValid, handleSubmit, values: { wholeDay, startDate, endDate }, setFieldValue }) => (
          <>
            <DialogContent>
              <Form>
                <Gutters disablePadding>
                  <Gutters disablePadding sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ flex: 1 }}>
                      {isValid.toString()}
                      <FormikInputField name="displayName" title={t('fields.displayName')} />
                    </Box>
                    <FormikAutocomplete
                      name="type"
                      label={t('calendar.event.type')}
                      values={typeOptions}
                      sx={{ flex: 1 }}
                    />
                  </Gutters>
                  <Gutters disablePadding sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                      <FormikDatePicker name="startDate" label={t('common.date')} minDate={new Date()} />
                      <FormikTimePicker
                        name="startDate"
                        label={t('fields.startTime')}
                        containerProps={{ flexGrow: 1 }}
                        disabled={wholeDay}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={wholeDay}
                            name="wholeDay"
                            onChange={() => {
                              setFieldValue('wholeDay', !wholeDay);
                            }}
                          />
                        }
                        label={t('calendar.event.whole-day')}
                        sx={{ flexShrink: 0 }}
                      />
                    </Gutters>
                    <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                      <FormikDatePicker
                        name="endDate"
                        label={t('common.date')}
                        minDate={startDate}
                        disabled={wholeDay}
                      />
                      {isSameDay(startDate, endDate) ? (
                        <FormikDurationMinutes
                          name="durationMinutes"
                          startTimeFieldName="startDate"
                          label={t('fields.endTime')}
                          containerProps={{ flexGrow: 1 }}
                          disabled={wholeDay}
                        />
                      ) : (
                        <FormikTimePicker
                          name="endDate"
                          label={'End Time'}
                          containerProps={{ flexGrow: 1 }}
                          disabled={wholeDay}
                          minTime={getMinTime(startDate, endDate)}
                        />
                      )}
                    </Gutters>
                  </Gutters>
                  <FormikMarkdownField
                    name="description"
                    title={t('common.description')}
                    maxLength={MARKDOWN_TEXT_LENGTH}
                    sx={{ marginBottom: gutters(-1) }}
                  />
                  <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                    <FormikInputField name="location.city" title={'Location'} placeholder={' '} fullWidth />
                    <TagsetField name="tags" title={t('common.tags')} />
                  </Gutters>
                </Gutters>
              </Form>
            </DialogContent>
            <Actions justifyContent="space-between" padding={gutters()}>
              {actions}
              <LoadingButton
                variant="contained"
                disabled={!isValid}
                loading={isSubmitting}
                onClick={() => handleSubmit()}
              >
                {t('buttons.save')}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </GridProvider>
  );
};

export default CalendarEventForm;
