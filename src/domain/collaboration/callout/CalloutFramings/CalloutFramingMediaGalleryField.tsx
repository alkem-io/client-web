import React, { useMemo, useRef, useState } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import {
  Box,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import { gutters } from '@/core/ui/grid/utils';
import { getMediaGalleryVisualType } from '../../mediaGallery/mediaGalleryVisualType';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import AddIcon from '@mui/icons-material/Add';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useDefaultVisualTypeConstraintsQuery } from '@/core/apollo/generated/apollo-hooks';
import ImagePlaceholder from '@/core/ui/image/ImagePlaceholder';

type VisualInMediaGallerySubmittedValue = NonNullable<
  CalloutFormSubmittedValues['framing']['mediaGallery']
>['visuals'][number];

interface ValidationError {
  fileName: string;
  errors: string[];
}

const CalloutFramingMediaGalleryField = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { values } = useFormikContext<CalloutFormSubmittedValues>();
  const mediaVisuals = values.framing.mediaGallery?.visuals || [];
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data: constraintsData, loading } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.MediaGalleryImage },
  });
  const imageConstraints = constraintsData?.platform.configuration.defaultVisualTypeConstraints;

  const revokePreviewUrl = (url?: string) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };

  const validateFile = (file: File): Promise<string[]> => {
    const errors: string[] = [];

    if (!imageConstraints) {
      errors.push(t('components.callout-creation.framing.mediaGallery.errors.missingConstraints'));
      return Promise.resolve(errors);
    }

    // Check file type
    if (imageConstraints.allowedTypes && imageConstraints.allowedTypes.length > 0) {
      if (!imageConstraints.allowedTypes.includes(file.type)) {
        errors.push(
          t('components.callout-creation.framing.mediaGallery.errors.invalidFileType', {
            fileType: file.type,
            allowedTypes: imageConstraints.allowedTypes.join(', '),
          })
        );
        return Promise.resolve(errors);
      }
    }

    // After the allowedTypes check, before the new Image() block:
    const HEIC_TYPES = ['image/heic', 'image/heif'];
    if (HEIC_TYPES.includes(file.type)) {
      // Browsers can't decode HEIC — skip dimension validation.
      // The server converts HEIC to JPEG before storing.
      return Promise.resolve([]);
    }

    return new Promise(resolve => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => {
        img.onload = () => {
          const errors: string[] = [];
          const checks = [
            { key: 'minWidth', value: 'width', op: (img, constraint) => img < constraint },
            { key: 'minHeight', value: 'height', op: (img, constraint) => img < constraint },
            { key: 'maxWidth', value: 'width', op: (img, constraint) => img > constraint },
            { key: 'maxHeight', value: 'height', op: (img, constraint) => img > constraint },
          ] as const;

          for (const check of checks) {
            if (imageConstraints[check.key] && check.op(img[check.value], imageConstraints[check.key])) {
              errors.push(
                t(`components.callout-creation.framing.mediaGallery.errors.imageDimensions.${check.key}`, {
                  imagePx: img[check.value],
                  constraintPx: imageConstraints[check.key],
                })
              );
            }
          }
          resolve(errors);
        };

        img.onerror = () => {
          resolve([t('components.callout-creation.framing.mediaGallery.errors.invalidImage')]);
        };

        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };

      reader.onerror = () => {
        resolve([t('components.callout-creation.framing.mediaGallery.errors.failedToReadFile')]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (files: FileList, push: (obj: VisualInMediaGallerySubmittedValue) => void) => {
    if (!imageConstraints) {
      return;
    }

    const newErrors: ValidationError[] = [];
    const validFiles: Array<{ file: File; previewUrl: string }> = [];

    for (const file of files) {
      const fileValidationErrors = await validateFile(file);

      if (fileValidationErrors.length > 0) {
        newErrors.push({
          fileName: file.name,
          errors: fileValidationErrors,
        });
        continue;
      }

      // File is valid
      const HEIC_TYPES = ['image/heic', 'image/heif'];
      const isHeic = HEIC_TYPES.includes(file.type);

      validFiles.push({
        file,
        previewUrl: isHeic ? '' : URL.createObjectURL(file),
      });
    }

    // Show error dialog if there are any validation errors
    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
      setErrorDialogOpen(true);
    }

    const minSortOrder = Math.max(0, ...mediaVisuals.map(v => v.sortOrder ?? 0)) + 1;
    // Add valid files to the gallery
    for (let i = 0; i < validFiles.length; i++) {
      const validFile = validFiles[i];
      push({
        uri: '',
        file: validFile.file,
        previewUrl: validFile.previewUrl,
        alternativeText: '',
        visualType: getMediaGalleryVisualType(validFile.file),
        sortOrder: minSortOrder + i,
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
        gap: gutters(),
        alignItems: 'stretch',
      },
    }),
    []
  );

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('components.callout-creation.framing.mediaGallery.name')} />

      <FieldArray
        name="framing.mediaGallery.visuals"
        render={arrayHelpers => (
          <Stack gap={gutters()}>
            <Box sx={columns.container}>
              {mediaVisuals.map((visual, index) => (
                <Box
                  key={`${visual.id ?? 'visual'}-${index}`}
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    backgroundColor: theme => theme.palette.grey[100],
                    '& .only-on-hover': {
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    },
                    '&:hover .only-on-hover, &:focus-within .only-on-hover': {
                      opacity: 1,
                    },
                  }}
                >
                  {(visual.previewUrl && visual.previewUrl !== '') || (visual.uri && visual.uri !== '') ? (
                    <Box
                      component="img"
                      src={visual.previewUrl || visual.uri}
                      alt={visual.alternativeText || visual.name || t('common.image')}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 0.5,
                      }}
                    />
                  ) : (
                    <ImagePlaceholder
                      text={
                        visual.file
                          ? t('components.callout-creation.framing.mediaGallery.previewNotAvailable')
                          : t('components.callout-creation.framing.mediaGallery.imageNotAvailable')
                      }
                    />
                  )}
                  <Tooltip title={t('callout.create.framingSettings.mediaGallery.deleteItem')} arrow>
                    <IconButton
                      className="only-on-hover"
                      onClick={() => {
                        revokePreviewUrl(visual.previewUrl);
                        arrayHelpers.remove(index);
                      }}
                      aria-label={t('callout.create.framingSettings.mediaGallery.deleteItem')}
                      sx={{
                        position: 'absolute',
                        bottom: gutters(0.5),
                        right: gutters(0.5),
                        backgroundColor: 'background.default',
                        border: 1,
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'background.paper',
                        },
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
              <Box display="flex" alignItems="end" justifyContent="flex-start">
                {mediaVisuals.length === 0 && (
                  <Button
                    variant="contained"
                    onClick={handleUploadClick}
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                    loading={loading}
                  >
                    {t('buttons.uploadMedia')}
                  </Button>
                )}
                {mediaVisuals.length > 0 && (
                  <Tooltip title={t('buttons.uploadMedia')} arrow>
                    <IconButton aria-label={t('buttons.uploadMedia')} size="small" onClick={handleUploadClick}>
                      <RoundedIcon component={AddIcon} size="medium" iconSize="small" color="primary.main" />
                    </IconButton>
                  </Tooltip>
                )}
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
            </Box>
          </Stack>
        )}
      />

      {/* Validation Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>{t('components.callout-creation.framing.mediaGallery.errors.title')}</DialogTitle>
        <DialogContent>
          <List sx={{ pt: 0 }}>
            {validationErrors.map((error, index) => (
              <Box key={`${error.fileName}-${index}`}>
                <ListItem disableGutters>
                  <ListItemText
                    primary={error.fileName}
                    secondary={
                      <Stack component="ul" sx={{ pl: 2, m: 0 }}>
                        {error.errors.map((err, errIndex) => (
                          <Box component="li" key={errIndex} sx={{ fontSize: '0.875rem' }}>
                            {err}
                          </Box>
                        ))}
                      </Stack>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} variant="contained">
            {t('buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContentBlock>
  );
};

export default CalloutFramingMediaGalleryField;
