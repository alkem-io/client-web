import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Skeleton } from '@mui/material';
import { useApolloErrorHandler, useNotification } from '../../../../hooks';
import { useUploadVisualMutation } from '../../../../hooks/generated/graphql';
import UploadButton from '../../../core/UploadButton';
import { Visual } from '../../../../models/graphql-schema';
import { CropDialog } from './CropDialog';

const AVATAR_SIZE = 150;

interface VisualUploadProps {
  visual?: Visual;
}

const VisualUpload: FC<VisualUploadProps> = ({ visual }) => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();
  const notify = useNotification();

  const [uploadAvatar, { loading }] = useUploadVisualMutation({
    onError: handleError,
    onCompleted: () => notify(t('components.visual-upload.success'), 'success'),
  });
  const [dialogOpened, setDialogOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleVisualUpload = useCallback(
    async (file: File) => {
      if (visual) {
        uploadAvatar({
          variables: {
            file,
            uploadData: {
              visualID: visual.id,
            },
          },
        });
      }
    },
    [visual]
  );

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Box marginBottom={2}>
        {loading ? (
          <Skeleton variant="rectangular">
            <Avatar sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
          </Skeleton>
        ) : (
          <Avatar sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} src={visual?.uri} />
        )}
      </Box>
      {visual && (
        <Box display="flex" justifyContent="center" width="100%">
          <UploadButton
            disabled={loading}
            accept={visual.allowedTypes.join(',')}
            onChange={e => {
              const file = e && e.target && e.target.files && e.target.files[0];
              if (file) {
                setSelectedFile(file);
                setDialogOpened(true);
              }
            }}
            text={t('buttons.edit')}
          />
        </Box>
      )}
      {dialogOpened && visual && (
        <CropDialog
          open={dialogOpened}
          file={selectedFile}
          onClose={() => setDialogOpened(false)}
          onSave={handleVisualUpload}
          config={{
            aspectRatio: visual.aspectRatio,
            minWidth: visual.minWidth,
            maxWidth: visual.maxWidth,
            minHeight: visual.minHeight,
            maxHeight: visual.maxHeight,
          }}
        />
      )}
    </Box>
  );
};

export default VisualUpload;
