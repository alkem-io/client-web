import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FieldArray, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';
import PollFormSettingsSection from '@/domain/collaboration/poll/PollFormSettingsSection';

const FIELD_PREFIX = 'framing.poll';
const MIN_OPTIONS = 2;
interface PollFormFieldsProps {
  formPrefix?: string;
}
const PollFormFields = ({ formPrefix = FIELD_PREFIX }: PollFormFieldsProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CalloutFormSubmittedValues>();

  const options = values.framing.poll?.options ?? [];

  return (
    <Stack gap={2}>
      <FormikInputField name={`${formPrefix}.title`} title={t('poll.create.title')} required maxLength={512} />

      <Typography variant="body2" fontWeight={600}>
        {t('poll.create.options')}
      </Typography>

      <FieldArray
        name={`${formPrefix}.options`}
        render={arrayHelpers => (
          <Stack gap={1}>
            {options.map((_option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => arrayHelpers.swap(index, index - 1)}
                    disabled={index === 0}
                    aria-label={t('poll.options.reorder')}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => arrayHelpers.swap(index, index + 1)}
                    disabled={index === options.length - 1}
                    aria-label={t('poll.options.reorder')}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Box>
                <FormikInputField
                  name={`${formPrefix}.options.${index}.text`}
                  title={`${t('poll.create.options')} ${index + 1}`}
                  required
                  maxLength={512}
                  containerProps={{ sx: { flex: 1 } }}
                />
                {options.length > MIN_OPTIONS && (
                  <IconButton
                    onClick={() => arrayHelpers.remove(index)}
                    size="small"
                    aria-label={t('poll.options.remove')}
                    sx={{ mt: 3 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button size="small" onClick={() => arrayHelpers.push({ text: '' })} sx={{ alignSelf: 'flex-start' }}>
              {t('poll.options.add')}
            </Button>
          </Stack>
        )}
      />

      <PollFormSettingsSection fieldPrefix={formPrefix} />
    </Stack>
  );
};

export default PollFormFields;
