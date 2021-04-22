import { ApolloError } from '@apollo/client';
import { Severity } from '@sentry/react';
import clsx from 'clsx';
import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUploadAvatarMutation } from '../generated/graphql';
import { createStyles } from '../hooks/useTheme';
import { pushNotification } from '../reducers/notifincations/actions';
import Avatar, { AvatarProps, useAvatarStyles } from './core/Avatar';
import { Spinner } from './core/Spinner';
import UploadButton from './core/UploadButton';

const useEditableAvatarStyles = createStyles(() => ({
  outerEditableAvatarWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  upload: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
}));

interface EditableAvatarProps extends AvatarProps {
  profileId?: string;
}

const EditableAvatar: FC<EditableAvatarProps> = ({ profileId, ...props }) => {
  const avatarStyles = useAvatarStyles();
  const styles = useEditableAvatarStyles();
  const [uploadAvatar, { loading }] = useUploadAvatarMutation();
  const dispatch = useDispatch();

  const handleError = (error: ApolloError) => {
    dispatch(pushNotification(error.message, Severity.Error));
  };

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
        }).catch(err => handleError(err));
      }
    },
    [profileId]
  );

  return (
    <div className={clsx(styles.outerEditableAvatarWrapper)}>
      {loading ? (
        <div className={clsx(avatarStyles.noAvatar, avatarStyles[props.theme || 'light'], props.size, props.className)}>
          <Spinner />
        </div>
      ) : (
        <Avatar {...props} />
      )}

      {profileId && (
        <div className={clsx(styles.upload)}>
          <UploadButton
            disabled={loading}
            accept={'image/*'}
            onChange={e => {
              const file = e && e.target && e.target.files && e.target.files[0];
              if (file) handleAvatarChange(file);
            }}
            small
          >
            Edit
          </UploadButton>
        </div>
      )}
    </div>
  );
};

export default EditableAvatar;
