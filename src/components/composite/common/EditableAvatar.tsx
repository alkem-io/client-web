import { Box } from '@mui/material';
import clsx from 'clsx';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler } from '../../../hooks';
import { useUploadAvatarMutation } from '../../../hooks/generated/graphql';
import Avatar, { AvatarProps, useAvatarStyles } from '../../core/Avatar';
import { Spinner } from '../../core/Spinner';
import UploadButton from '../../core/UploadButton';

interface EditableAvatarProps extends AvatarProps {
  profileId?: string;
}

const EditableAvatar: FC<EditableAvatarProps> = ({ profileId, classes = {}, ...props }) => {
  const { t } = useTranslation();
  const avatarStyles = useAvatarStyles(classes);
  const [uploadAvatar, { loading }] = useUploadAvatarMutation();

  const handleError = useApolloErrorHandler();

  const handleAvatarChange = useCallback(
    (file: File) => {
      if (profileId) {
        uploadAvatar({
          variables: {
            file,
            input: {
              file: '',
              profileID: profileId,
            },
          },
        }).catch(handleError);
      }
    },
    [profileId]
  );

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Box marginY={1}>
        {loading ? (
          <div
            className={clsx(avatarStyles.noAvatar, avatarStyles[props.theme || 'light'], props.size, props.className)}
          >
            <Spinner />
          </div>
        ) : (
          <Avatar {...props} />
        )}
      </Box>
      {profileId && (
        <Box display="flex" justifyContent="center" width="100%">
          <UploadButton
            disabled={loading}
            accept={'image/*'}
            onChange={e => {
              const file = e && e.target && e.target.files && e.target.files[0];
              if (file) handleAvatarChange(file);
            }}
            small
            text={t('buttons.edit-photo')}
          />
        </Box>
      )}
    </Box>
  );
};

export default EditableAvatar;
