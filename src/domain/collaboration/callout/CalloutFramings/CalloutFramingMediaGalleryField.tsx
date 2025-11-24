import React, { useMemo, useRef } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Box, IconButton, Typography, Button, Stack, Card, CardMedia, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import { gutters } from '@/core/ui/grid/utils';
import { getMediaGalleryVisualType } from './mediaGalleryVisualType';

const CalloutFramingMediaGalleryField = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { values } = useFormikContext<CalloutFormSubmittedValues>();
  const mediaVisuals = values.framing.mediaGallery?.visuals || [];

  const revokePreviewUrl = (url?: string) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };

  const handleFilesSelected = (files: FileList, push: (obj: unknown) => void) => {
    for (const file of files) {
      push({
        uri: '',
        file,
        previewUrl: URL.createObjectURL(file),
        altText: '',
        visualType: getMediaGalleryVisualType(file),
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const columns = useMemo(
    () => ({
      container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: gutters(2),
        alignItems: 'stretch',
      },
    }),
    []
  );

  return (
    <PageContentBlockSeamless disablePadding>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Media Gallery
      </Typography>

      <FieldArray
        name="framing.mediaGallery.visuals"
        render={arrayHelpers => (
          <Stack gap={gutters()}>
            <Box display="flex" gap={gutters()} flexWrap="wrap">
              <Button
                startIcon={<AddIcon />}
                onClick={() => arrayHelpers.push({ uri: '', altText: '', visualType: getMediaGalleryVisualType() })}
                variant="outlined"
                size="small"
              >
                {t('common.add')}
              </Button>
              <Button variant="contained" size="small" onClick={handleUploadClick} startIcon={<PermMediaIcon />}>
                {t('buttons.upload')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={event => {
                  const files = event.target.files;
                  if (files) {
                    handleFilesSelected(files, arrayHelpers.push);
                  }
                }}
              />
            </Box>

            <Box sx={columns.container}>
              {mediaVisuals.map((visual, index) => {
                let uriHelperText: string | undefined;

                if (visual.file) {
                  uriHelperText = t('components.mediaGallery.fileSelected', 'Local file selected');
                } else if (visual.id) {
                  uriHelperText = t('components.mediaGallery.uriLocked', 'Saved visuals use a fixed URL');
                }

                return (
                  <Card
                    key={`${visual.id ?? 'visual'}-${index}`}
                    variant="outlined"
                    sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    <CardMedia>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '56.25%',
                          backgroundColor: theme => theme.palette.grey[100],
                        }}
                      >
                        {(visual.previewUrl || visual.uri) && (
                          <Box
                            component="img"
                            src={visual.previewUrl || visual.uri}
                            alt={visual.altText || visual.name || 'Image'}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </Box>
                    </CardMedia>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: gutters() }}>
                      <FormikInputField
                        name={`framing.mediaGallery.visuals.${index}.uri`}
                        title={t('common.url')}
                        placeholder="https://example.com/image.jpg"
                        containerProps={{ sx: { flex: 1 } }}
                        helperText={uriHelperText}
                        disabled={Boolean(visual.file)}
                        readOnly={Boolean(visual.id)}
                        required={!visual.file}
                      />
                      <FormikInputField
                        name={`framing.mediaGallery.visuals.${index}.altText`}
                        title={t('common.description')}
                        placeholder={t('components.mediaGallery.altTextPlaceholder', 'Describe this media item')}
                        containerProps={{ sx: { flex: 1 } }}
                      />
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton
                          onClick={() => {
                            revokePreviewUrl(visual.previewUrl);
                            arrayHelpers.remove(index);
                          }}
                          aria-label="remove media item"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Stack>
        )}
      />
    </PageContentBlockSeamless>
  );
};

export default CalloutFramingMediaGalleryField;
