import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { PollResultsDetail, PollResultsVisibility } from '@/core/apollo/generated/graphql-schema';
import { useFormikContext } from 'formik';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';

type PollFormSettingsSectionProps = {
  fieldPrefix: string;
};

const PollFormSettingsSection = ({ fieldPrefix }: PollFormSettingsSectionProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values } = useFormikContext<CalloutFormSubmittedValues>();

  const settingsPath = `${fieldPrefix}.settings`;
  const settings = values.framing.poll?.settings;

  return (
    <Accordion disableGutters elevation={0} sx={{ '&::before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2">{t('poll.create.settings')}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormikInputField
          name={`${settingsPath}.minResponses`}
          title={t('poll.create.minResponses')}
          type="number"
          value={String(settings?.minResponses ?? 1)}
          onChange={e => setFieldValue(`${settingsPath}.minResponses`, Math.max(1, Number(e.target.value)))}
        />
        <FormikInputField
          name={`${settingsPath}.maxResponses`}
          title={t('poll.create.maxResponses')}
          type="number"
          value={String(settings?.maxResponses ?? 1)}
          onChange={e => setFieldValue(`${settingsPath}.maxResponses`, Math.max(0, Number(e.target.value)))}
          helpIconText={t('poll.create.maxResponsesUnlimited')}
        />
        <FormikInputField
          name={`${settingsPath}.resultsVisibility`}
          title={t('poll.create.resultsVisibility.title')}
          select
          value={settings?.resultsVisibility ?? PollResultsVisibility.Visible}
          onChange={e => setFieldValue(`${settingsPath}.resultsVisibility`, e.target.value)}
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
          onChange={e => setFieldValue(`${settingsPath}.resultsDetail`, e.target.value)}
        >
          <MenuItem value={PollResultsDetail.Full}>{t('poll.create.resultsDetail.FULL')}</MenuItem>
          <MenuItem value={PollResultsDetail.Count}>{t('poll.create.resultsDetail.COUNT')}</MenuItem>
          <MenuItem value={PollResultsDetail.Percentage}>{t('poll.create.resultsDetail.PERCENTAGE')}</MenuItem>
        </FormikInputField>
      </AccordionDetails>
    </Accordion>
  );
};

export default PollFormSettingsSection;
