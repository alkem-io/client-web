import React, { ReactNode, useMemo } from 'react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent, Theme, useMediaQuery } from '@mui/material';
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
import GridItem from '../../../../core/ui/grid/GridItem';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { CalendarEventDetailData } from '../CalendarEventDetailContainer';
import FormikDurationMinutes from '../../../../core/ui/forms/DatePicker/FormikDurationMinutes';
import { LoadingButton } from '@mui/lab';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

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
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const handleSubmit = (formValues: Partial<CalendarEventFormData>) => {
    onSubmit(formValues as CalendarEventFormData);
  };

  // TODO: Remove startDate from here
  const initialStartDate = useMemo(() => event?.startDate ?? new Date(), [event]);

  const initialValues = useMemo<Partial<CalendarEventFormData>>(() => {
    const startDate = initialStartDate;

    return {
      startDate,
      durationMinutes: event?.durationMinutes ?? 30,
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

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH)
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min })),
    type: yup.string().required(t('common.field-required')),
    durationMinutes: yup.number().positive(t('calendar.validation.durationMinutes.positive')),
  });

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{dialogTitle}</BlockTitle>
      </DialogHeader>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
        {({ isValid, handleSubmit }) => (
          <>
            <DialogContent>
              <Form>
                <Gutters disablePadding>
                  <Box display="flex" gap={gutters()}>
                    <GridItem columns={4}>
                      <Box>
                        <FormikDatePicker name="startDate" label={t('common.date')} minDate={new Date()} />
                      </Box>
                    </GridItem>
                    <Box flexGrow={1}>
                      <FormikInputField name="displayName" title={t('fields.displayName')} />
                    </Box>
                  </Box>
                  <Box display="flex" gap={gutters()} flexWrap="wrap">
                    <GridItem columns={isMobile ? undefined : 4}>
                      <Box display="flex" gap={gutters()}>
                        <FormikTimePicker
                          name="startDate"
                          label={t('fields.startTime')}
                          containerProps={{ flexGrow: 1 }}
                        />
                        <FormikDurationMinutes
                          name="durationMinutes"
                          startTimeFieldName="startDate"
                          label={t('fields.endTime')}
                          containerProps={{ flexGrow: 1 }}
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
                    maxLength={MARKDOWN_TEXT_LENGTH}
                    sx={{ marginBottom: gutters(-1) }}
                  />
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
