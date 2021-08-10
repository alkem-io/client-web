import clsx from 'clsx';
import React, { FC, useCallback } from 'react';
import { useUploadAvatarMutation } from '../hooks/generated/graphql';
import { useApolloErrorHandler } from '../hooks';
import { createStyles } from '../hooks/useTheme';
import Avatar, { AvatarProps, useAvatarStyles } from './core/Avatar';
import { Spinner } from './core/Spinner';
import UploadButton from './core/UploadButton';
import { useTranslation } from 'react-i18next';

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

const EditableAvatar: FC<EditableAvatarProps> = ({ profileId, classes = {}, ...props }) => {
  const { t } = useTranslation();
  const avatarStyles = useAvatarStyles(classes);
  const styles = useEditableAvatarStyles();
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
            text={t('buttons.edit')}
          />
        </div>
      )}
    </div>
  );
};

export default EditableAvatar;
