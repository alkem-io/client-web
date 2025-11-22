import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Box, IconButton, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import { gutters } from '@/core/ui/grid/utils';

const CalloutFramingMediaGalleryField = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CalloutFormSubmittedValues>();
  const mediaItems = values.framing.mediaGallery?.items || [];

  return (
    <PageContentBlockSeamless disablePadding>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Media Gallery
      </Typography>

      <FieldArray
        name="framing.mediaGallery.items"
        render={arrayHelpers => (
          <Box display="flex" flexDirection="column" gap={gutters()}>
            {mediaItems.map((item, index) => (
              <Box key={index} display="flex" gap={gutters()} alignItems="flex-start">
                <FormikInputField
                  name={`framing.mediaGallery.items.${index}.url`}
                  title={t('common.url')}
                  placeholder="https://example.com/image.jpg"
                  containerProps={{ sx: { flex: 1 } }}
                  required
                />
                <FormikInputField
                  name={`framing.mediaGallery.items.${index}.title`}
                  title={t('common.title')}
                  placeholder="Image Title"
                  containerProps={{ sx: { flex: 1 } }}
                />
                <IconButton onClick={() => arrayHelpers.remove(index)} sx={{ mt: 3 }} aria-label="remove media item">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => arrayHelpers.push({ url: '', title: '' })}
              variant="outlined"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('common.add')}
            </Button>
          </Box>
        )}
      />
    </PageContentBlockSeamless>
  );
};

export default CalloutFramingMediaGalleryField;
