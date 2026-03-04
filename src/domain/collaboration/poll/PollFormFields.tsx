import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { FieldArray, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';
import PollFormSettingsSection from '@/domain/collaboration/poll/PollFormSettingsSection';

const FIELD_PREFIX = 'framing.poll';
const MIN_OPTIONS = 2;

const PollFormFields = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CalloutFormSubmittedValues>();

  const options = values.framing.poll?.options ?? [];

  return (
    <Stack gap={2}>
      <FormikInputField name={`${FIELD_PREFIX}.title`} title={t('poll.create.title')} required maxLength={512} />

      <Typography variant="body2" fontWeight={600}>
        {t('poll.create.options')}
      </Typography>

      <FieldArray
        name={`${FIELD_PREFIX}.options`}
        render={arrayHelpers => (
          <Stack gap={1}>
            {options.map((_option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormikInputField
                  name={`${FIELD_PREFIX}.options.${index}`}
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
            <Button size="small" onClick={() => arrayHelpers.push('')} sx={{ alignSelf: 'flex-start' }}>
              {t('poll.options.add')}
            </Button>
          </Stack>
        )}
      />

      <PollFormSettingsSection fieldPrefix={FIELD_PREFIX} />
    </Stack>
  );
};

export default PollFormFields;
