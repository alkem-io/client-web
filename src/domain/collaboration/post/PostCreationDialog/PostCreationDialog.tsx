import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import { CalloutIcon } from '../../callout/icon/CalloutIcon';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import PostForm, { PostFormOutput } from '../PostForm/PostForm';
import { CreatePostOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { CalloutPostTemplate } from '../../callout/creation-dialog/CalloutCreationDialog';

export type PostCreationType = Partial<CreatePostOnCalloutInput>;
export type PostCreationOutput = Omit<CreatePostOnCalloutInput, 'calloutID'>;

export type PostCreationDialogProps = {
  open: boolean;
  postNames: string[];
  onClose: () => void;
  onCreate: (post: PostCreationOutput) => Promise<{ nameID: string } | undefined>;
  calloutDisplayName: string;
  calloutId: string;
  postTemplate: CalloutPostTemplate | undefined;
  isCreating: boolean;
} & CoreEntityIdTypes;

const PostCreationDialog: FC<PostCreationDialogProps> = ({
  open,
  postNames,
  onClose,
  onCreate,
  calloutDisplayName,
  postTemplate,
  isCreating,
}) => {
  const { t } = useTranslation();
  const [post, setPost] = useState<PostCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const handleClose = () => {
    setPost({});
    onClose();
  };

  const handleCreate = async () => {
    await onCreate({
      profileData: {
        displayName: post?.profileData?.displayName ?? '',
        description: post?.profileData?.description ?? '',
      },
      type: postTemplate?.type ?? '',
      visualUri: postTemplate?.profile?.visual?.uri,
      tags: post.tags,
    });
    handleClose();
  };

  const handleFormChange = (newPost: PostFormOutput) =>
    setPost({
      ...post,
      profileData: {
        displayName: newPost.displayName,
        description: newPost.description,
      },
      ...newPost,
    });
  const handleFormStatusChange = (isValid: boolean) => setIsFormValid(isValid);

  const renderButtons = () => {
    return (
      <>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!isFormValid || isCreating}>
          {t('buttons.create')}
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="post-creation-title">
      <DialogTitle id="post-creation-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          <CalloutIcon sx={{ marginRight: 1 }} />
          {t('components.post-creation.title', { calloutDisplayName: calloutDisplayName })}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2} marginTop={2}>
          <PostForm
            post={post}
            postNames={postNames}
            onChange={handleFormChange}
            onStatusChanged={handleFormStatusChange}
            descriptionTemplate={postTemplate?.defaultDescription}
            tags={[]}
          />
        </Box>
      </DialogContent>
      <DialogActions>{renderButtons()}</DialogActions>
    </Dialog>
  );
};

export default PostCreationDialog;
