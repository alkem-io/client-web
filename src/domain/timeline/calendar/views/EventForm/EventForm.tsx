import { useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent, FormControlLabel, Switch } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikDurationMinutes from '@/core/ui/forms/DatePicker/FormikDurationMinutes';
import { isSameDay } from '@/core/utils/time/utils';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import FormikDatePicker from '@/core/ui/forms/DatePicker/FormikDatePicker';
import FormikTimePicker from '@/core/ui/forms/DatePicker/FormikTimePicker';
import dayjs from 'dayjs';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { CalendarEventFormData } from '@/domain/timeline/calendar/CalendarEventsContainer';
import { Actions } from '@/core/ui/actions/Actions';
import { EventFormProps } from './EventForm.model';
import SaveButton from '@/core/ui/actions/SaveButton';

type DateType = Date | undefined;

const getMinTime = (startDate: DateType, endDate: number | DateType) => {
  if (!startDate) {
    return undefined;
  }

  return isSameDay(startDate, endDate) ? undefined : dayjs(startDate);
};

const EventForm = ({
  typeOptions,
  isSubmitting,
  actions,
  temporaryLocation = false,
  isSubspace = false,
}: EventFormProps) => {
  const { t } = useTranslation();
  const {
    isValid,
    handleSubmit,
    values: { wholeDay, startDate, endDate, visibleOnParentCalendar },
    setFieldValue,
  } = useFormikContext<Partial<CalendarEventFormData>>();

  useEffect(() => {
    if (endDate && startDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      setFieldValue('endDate', startDate);
    }
  }, [startDate, endDate, setFieldValue]);

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
                <FormikDatePicker name="endDate" label={t('common.date')} minDate={startDate} disabled={wholeDay} />
                {isSameDay(startDate, endDate) ? (
                  <FormikDurationMinutes
                    name="durationMinutes"
                    startTimeFieldName="startDate"
                    label={t('fields.endTime')}
                    containerProps={{ flexGrow: 1 }}
                    disabled={!!wholeDay}
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
              temporaryLocation={temporaryLocation}
            />
            <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
              <FormikInputField name="location.city" title={'Location'} placeholder={' '} fullWidth />
              <TagsetField name="tags" title={t('common.tags')} />
            </Gutters>
            {isSubspace && (
              <Gutters disablePadding sx={{ flexDirection: 'row', flexGrow: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={visibleOnParentCalendar}
                      name="visibleOnParentCalendar"
                      onChange={() => {
                        setFieldValue('visibleOnParentCalendar', !visibleOnParentCalendar);
                      }}
                    />
                  }
                  label={t('calendar.event.visibleOnParentCalendar')}
                  sx={{ flexShrink: 0 }}
                />
              </Gutters>
            )}
          </Gutters>
        </Form>
      </DialogContent>
      <Actions padding={gutters()}>
        {actions}
        <SaveButton variant="contained" disabled={!isValid} loading={isSubmitting} onClick={handleSubmit} />
      </Actions>
    </>
  );
};

export default EventForm;
