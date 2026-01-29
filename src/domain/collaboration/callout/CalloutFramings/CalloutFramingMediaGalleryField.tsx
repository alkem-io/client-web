import React, { useMemo, useRef } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Box, IconButton, Button, Stack, Tooltip } from '@mui/material';
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

type VisualInMediaGallerySubmittedValue = NonNullable<
  CalloutFormSubmittedValues['framing']['mediaGallery']
>['visuals'][number];

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

  const handleFilesSelected = (files: FileList, push: (obj: VisualInMediaGallerySubmittedValue) => void) => {
    for (const file of files) {
      push({
        uri: '',
        file,
        previewUrl: URL.createObjectURL(file),
        alternativeText: '',
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
                    '&:hover .only-on-hover': {
                      opacity: 1,
                    },
                  }}
                >
                  {(visual.previewUrl || visual.uri) && (
                    <Box
                      component="img"
                      src={visual.previewUrl || visual.uri}
                      alt={visual.alternativeText || visual.name || 'Image'}
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
                  )}
                  <IconButton
                    className="only-on-hover"
                    onClick={() => {
                      revokePreviewUrl(visual.previewUrl);
                      arrayHelpers.remove(index);
                    }}
                    aria-label="remove media item"
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
                </Box>
              ))}
              <Box display="flex" alignItems="end" justifyContent="flex-start">
                {mediaVisuals.length === 0 && (
                  <Button variant="contained" onClick={handleUploadClick} startIcon={<AddPhotoAlternateOutlinedIcon />}>
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
    </PageContentBlock>
  );
};

export default CalloutFramingMediaGalleryField;
