import React, { ReactNode, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box, Button, DialogContent } from '@mui/material';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import FormikDatePicker from '../../../../core/ui/forms/DatePicker/FormikDatePicker';
import { CalendarEventFormData } from '../CalendarEventsContainer';
import { CalendarEventType } from '../../../../core/apollo/generated/graphql-schema';
import Gutters from '../../../../core/ui/grid/Gutters';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { gutters } from '../../../../core/ui/grid/utils';
import FormikTimePicker from '../../../../core/ui/forms/DatePicker/FormikTimePicker';
import FormikAutocomplete, {
  FormikSelectValue,
} from '../../../../common/components/composite/forms/FormikAutocomplete';
import { Actions } from '../../../../core/ui/actions/Actions';
import FormikMarkdownField from '../../../../common/components/composite/forms/FormikMarkdownField';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import GridItem from '../../../../core/ui/grid/GridItem';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { displayNameValidator } from '../../../../common/utils/validator';
import { addMinutes } from '../../utils';
import { CalendarEventDetailData } from '../CalendarEventDetailContainer';

interface CalendarEventFormProps {
  event: Partial<CalendarEventDetailData> | undefined;
  dialogTitle: string;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (eventValues: CalendarEventFormData) => void;
  actions?: ReactNode;
}

interface CalendarEventFormValues extends Omit<CalendarEventFormData, 'durationMinutes'> {
  endDate: Date;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const MILLISECONDS_IN_HALF_HOUR = 30 * MILLISECONDS_IN_MINUTE;

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

const CalendarEventForm = ({ event, dialogTitle, onSubmit, onClose, actions }: CalendarEventFormProps) => {
  const { t } = useTranslation();

  const handleSubmit = (formValues: Partial<CalendarEventFormValues>) => {
    const { endDate, ...values } = formValues as CalendarEventFormValues;

    const durationMinutes = (endDate.valueOf() - values.startDate!.valueOf()) / MILLISECONDS_IN_MINUTE;

    onSubmit({
      ...values,
      durationMinutes,
    });
  };

  const initialStartDate = useMemo(() => event?.startDate ?? new Date(), [event]);

  const initialValues = useMemo<Partial<CalendarEventFormValues>>(() => {
    const startDate = initialStartDate;
    const endDate =
      event && event?.startDate && typeof event?.durationMinutes !== 'undefined'
        ? addMinutes(startDate, event?.durationMinutes)
        : new Date(startDate.valueOf() + MILLISECONDS_IN_HALF_HOUR);

    return {
      startDate,
      endDate,
      displayName: event?.displayName ?? '',
      description: event?.profile?.description ?? '',
      type: event?.type,
      multipleDays: event?.multipleDays ?? false,
      wholeDay: event?.wholeDay ?? false,
      durationDays: event?.durationDays,
      tags: event?.profile?.tagset?.tags ?? [],
      references: event?.profile?.references ?? [],
    };
  }, [event, initialStartDate]);

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: yup
      .string()
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min }))
      .max(500, ({ max }) => t('common.field-max-length', { max })),
    type: yup.string().required(t('common.field-required')),
  });
  const [isOpenStartTime, setIsOpenStartTime] = useState(false);
  const [isOpenEndTime, setIsOpenEndTime] = useState(false);

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{dialogTitle}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
          {({ isValid }) => (
            <Form>
              <Gutters paddingTop={0}>
                <Box display="flex" gap={gutters()}>
                  <GridItem columns={4}>
                    <Box>
                      <FormikDatePicker name="startDate" label={t('common.date')} />
                    </Box>
                  </GridItem>
                  <Box flexGrow={1}>
                    <FormikInputField name="displayName" title={t('fields.displayName')} />
                  </Box>
                </Box>
                <Box display="flex" gap={gutters()}>
                  <GridItem columns={4}>
                    <Box display="flex" gap={gutters()}>
                      <FormikTimePicker
                        name="startDate"
                        label={t('fields.startTime')}
                        open={isOpenStartTime}
                        onOpen={() => setIsOpenStartTime(true)}
                        onClose={() => setIsOpenStartTime(false)}
                      />
                      <FormikTimePicker
                        name="endDate"
                        label={t('fields.endTime')}
                        open={isOpenEndTime}
                        onOpen={() => setIsOpenEndTime(true)}
                        onClose={() => setIsOpenEndTime(false)}
                      />
                    </Box>
                  </GridItem>
                  <FormikAutocomplete
                    name="type"
                    label={t('calendar.event.type')}
                    values={typeOptions}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
                <FormikMarkdownField
                  name="description"
                  title={t('common.description')}
                  withCounter
                  sx={{ marginBottom: gutters(-1) }}
                />
                <TagsetField name="tags" title={t('common.tags')} />
                <Actions justifyContent="space-between">
                  {actions}
                  <Button type="submit" variant="contained" disabled={!isValid}>
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </Gutters>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </GridProvider>
  );
};

export default CalendarEventForm;
