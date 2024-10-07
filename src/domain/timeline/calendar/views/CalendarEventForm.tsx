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

const DEFAULT_DURATION_MINUTES = 30;

type DateType = number | Date | undefined;

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

  // TODO: Remove startDate from here
  const initialStartDate = useMemo(() => event?.startDate ?? new Date(), [event]);
  const initialEndDate = useMemo(() => {
    if (!event?.startDate) {
      return new Date();
    }

    if (event.durationMinutes) {
      return new Date(new Date(event.startDate).getTime() + event.durationMinutes * 60000);
    }

    return new Date();
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

  // todo:b validation for end time same day
  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH)
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min })),
    type: yup.string().required(t('common.field-required')),
  });

  const getMinTime = (startDate: DateType, endDate: DateType) => {
    if (!startDate) {
      return undefined;
    }

    return startDate === endDate ? undefined : dayjs(startDate);
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
                        label={'All Day'}
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
                      <FormikTimePicker
                        name="endDate"
                        label={'End Time'}
                        containerProps={{ flexGrow: 1 }}
                        disabled={wholeDay}
                        minTime={getMinTime(startDate, endDate)}
                      />
                    </Gutters>
                  </Gutters>
                  <FormikMarkdownField
                    name="description"
                    title={t('common.description')}
                    maxLength={MARKDOWN_TEXT_LENGTH}
                    sx={{ marginBottom: gutters(-1) }}
                  />
                  <FormikInputField name="location.city" title={'Location'} placeholder={' '} />
                  <TagsetField name="tags" title={t('common.tags')} />
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
