import { useEffect } from 'react';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { Form, useFormikContext } from 'formik';
import { Box, DialogContent, FormControlLabel, Switch } from '@mui/material';

import Gutters from '../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../core/ui/actions/Actions';
import FormikTimePicker from '../../../../core/ui/forms/DatePicker/FormikTimePicker';
import FormikDatePicker from '../../../../core/ui/forms/DatePicker/FormikDatePicker';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikDurationMinutes from '../../../../core/ui/forms/DatePicker/FormikDurationMinutes';
import FormikAutocomplete, { FormikSelectValue } from '../../../../core/ui/forms/FormikAutocomplete';

import { gutters } from '../../../../core/ui/grid/utils';
import { isSameDay } from '../../../../core/utils/time/utils';
import { type CalendarEventFormData } from '../CalendarEventsContainer';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';

const EventForm = ({ actions, typeOptions, isSubmitting, temporaryLocation }: EventFormProps) => {
  const { t } = useTranslation();

  const {
    isValid,
    values: { wholeDay, startDate, endDate },
    handleSubmit,
    setFieldValue,
  } = useFormikContext<Partial<CalendarEventFormData>>();

  useEffect(() => {
    if (endDate && startDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      setFieldValue('endDate', startDate);
    }
  }, [endDate, startDate, setFieldValue]);

  return (
    <>
      <DialogContent>
        <Form>
          <Gutters disablePadding>
            <Gutters disablePadding sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <FormikInputField name="displayName" title={t('fields.displayName')} />
              </Box>

              <FormikAutocomplete name="type" label={t('calendar.event.type')} values={typeOptions} sx={{ flex: 1 }} />
            </Gutters>

            <Gutters disablePadding sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
              <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                <FormikDatePicker name="startDate" label={t('common.date')} minDate={new Date()} />

                <FormikTimePicker
                  name="startDate"
                  disabled={wholeDay}
                  label={t('fields.startTime')}
                  containerProps={{ flexGrow: 1 }}
                />

                <FormControlLabel
                  sx={{ flexShrink: 0 }}
                  label={t('calendar.event.whole-day')}
                  control={
                    <Switch
                      name="wholeDay"
                      checked={wholeDay}
                      onChange={() => {
                        setFieldValue('wholeDay', !wholeDay);
                      }}
                    />
                  }
                />
              </Gutters>

              <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                <FormikDatePicker name="endDate" label={t('common.date')} minDate={startDate} disabled={wholeDay} />

                {isSameDay(startDate, endDate) ? (
                  <FormikDurationMinutes
                    disabled={wholeDay}
                    name="durationMinutes"
                    label={t('fields.endTime')}
                    startTimeFieldName="startDate"
                    containerProps={{ flexGrow: 1 }}
                  />
                ) : (
                  <FormikTimePicker
                    name="endDate"
                    label={'End Time'}
                    disabled={wholeDay}
                    containerProps={{ flexGrow: 1 }}
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
              temporaryLocation={temporaryLocation}
            />

            <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
              <FormikInputField fullWidth placeholder=" " title={'Location'} name="location.city" />

              <TagsetField name="tags" title={t('common.tags')} />
            </Gutters>
          </Gutters>
        </Form>
      </DialogContent>

      <Actions justifyContent="space-between" padding={gutters()}>
        {actions}

        <LoadingButton variant="contained" disabled={!isValid} loading={isSubmitting} onClick={() => handleSubmit()}>
          {t('buttons.save')}
        </LoadingButton>
      </Actions>
    </>
  );
};

export default EventForm;

type DateType = Date | undefined;

function getMinTime(startDate: DateType, endDate: number | DateType) {
  if (!startDate || isSameDay(startDate, endDate)) {
    return undefined;
  }

  return dayjs(startDate);
}

type EventFormProps = {
  isSubmitting: boolean;
  actions: React.ReactNode;
  typeOptions: FormikSelectValue[];

  temporaryLocation?: boolean;
};
