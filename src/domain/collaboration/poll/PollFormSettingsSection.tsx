import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { PollResultsDetail, PollResultsVisibility } from '@/core/apollo/generated/graphql-schema';
import { useFormikContext } from 'formik';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';
import { Caption } from '@/core/ui/typography';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

type PollFormSettingsSectionProps = {
  fieldPrefix: string;
  readOnly?: boolean;
};

const PollFormSettingsSection = ({ fieldPrefix, readOnly = false }: PollFormSettingsSectionProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values } = useFormikContext<CalloutFormSubmittedValues>();
  const [open, setOpen] = useState(false);

  const settingsPath = `${fieldPrefix}.settings`;
  const settings = values.framing.poll?.settings;

  const isSingleResponse = settings?.minResponses === 1 && settings?.maxResponses === 1;
  const isMultipleResponse = settings?.minResponses === 1 && settings?.maxResponses === 0;
  const isCustomResponse = !isSingleResponse && !isMultipleResponse;
  const responseType = isSingleResponse ? 'single' : isMultipleResponse ? 'multiple' : 'custom';

  const handleResponseTypeChange = (value: string) => {
    if (readOnly) return;
    if (value === 'single') {
      setFieldValue(`${settingsPath}.minResponses`, 1);
      setFieldValue(`${settingsPath}.maxResponses`, 1);
    } else {
      setFieldValue(`${settingsPath}.minResponses`, 1);
      setFieldValue(`${settingsPath}.maxResponses`, 0);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<SettingsOutlinedIcon />}
        onClick={() => setOpen(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('poll.create.settings')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader title={t('poll.create.settings')} onClose={() => setOpen(false)} />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl disabled={readOnly}>
            <FormLabel>
              <Caption>{t('poll.create.responseType')}</Caption>
            </FormLabel>
            <RadioGroup value={responseType} onChange={(_e, value) => handleResponseTypeChange(value)} row>
              <FormControlLabel value="single" control={<Radio />} label={t('poll.create.singleResponse')} />
              <FormControlLabel value="multiple" control={<Radio />} label={t('poll.create.multipleResponses')} />
              {isCustomResponse && (
                <FormControlLabel
                  value="custom"
                  control={<Radio />}
                  label={t('poll.create.customResponses')}
                  disabled
                />
              )}
            </RadioGroup>
          </FormControl>

          {isCustomResponse && (
            <>
              <FormikInputField
                name={`${settingsPath}.minResponses`}
                title={t('poll.create.minResponses')}
                type="number"
                disabled={readOnly}
              />
              <FormikInputField
                name={`${settingsPath}.maxResponses`}
                title={t('poll.create.maxResponses')}
                type="number"
                disabled={readOnly}
              />
            </>
          )}

          <FormikInputField
            name={`${settingsPath}.resultsVisibility`}
            title={t('poll.create.resultsVisibility.title')}
            select
            value={settings?.resultsVisibility ?? PollResultsVisibility.Visible}
            onChange={e => !readOnly && setFieldValue(`${settingsPath}.resultsVisibility`, e.target.value)}
            disabled={readOnly}
          >
            <MenuItem value={PollResultsVisibility.Visible}>{t('poll.create.resultsVisibility.VISIBLE')}</MenuItem>
            <MenuItem value={PollResultsVisibility.Hidden}>{t('poll.create.resultsVisibility.HIDDEN')}</MenuItem>
            <MenuItem value={PollResultsVisibility.TotalOnly}>{t('poll.create.resultsVisibility.TOTAL_ONLY')}</MenuItem>
          </FormikInputField>

          <FormikInputField
            name={`${settingsPath}.resultsDetail`}
            title={t('poll.create.resultsDetail.title')}
            select
            value={settings?.resultsDetail ?? PollResultsDetail.Full}
            onChange={e => !readOnly && setFieldValue(`${settingsPath}.resultsDetail`, e.target.value)}
            disabled={readOnly}
          >
            <MenuItem value={PollResultsDetail.Full}>{t('poll.create.resultsDetail.FULL')}</MenuItem>
            <MenuItem value={PollResultsDetail.Count}>{t('poll.create.resultsDetail.COUNT')}</MenuItem>
            <MenuItem value={PollResultsDetail.Percentage}>{t('poll.create.resultsDetail.PERCENTAGE')}</MenuItem>
          </FormikInputField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained">
            {t('buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PollFormSettingsSection;
