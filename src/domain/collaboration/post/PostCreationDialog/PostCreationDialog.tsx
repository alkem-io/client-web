import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import PostForm, { PostFormOutput } from '../PostForm/PostForm';
import { CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { CalloutReactIcon } from '@/domain/collaboration/callout/icon/CalloutReactIcon';

export type PostCreationType = Partial<CreatePostInput>;
export type PostCreationOutput = CreatePostInput;

export type PostCreationDialogProps = {
  open: boolean;
  postNames: string[];
  onClose: () => void;
  onCreate: (post: PostCreationOutput) => Promise<{ nameID: string } | undefined>;
  calloutDisplayName: string;
  calloutId: string;
  defaultDescription?: string;
  creating: boolean;
  disableRichMedia?: boolean;
};

const PostCreationDialog = ({
  open,
  postNames,
  onClose,
  onCreate,
  calloutDisplayName,
  defaultDescription,
  creating,
  disableRichMedia,
}: PostCreationDialogProps) => {
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
        displayName: post.profileData?.displayName ?? '',
        description: post.profileData?.description ?? '',
      },
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
        <Button onClick={handleCreate} variant="contained" disabled={!isFormValid || creating}>
          {t('buttons.create')}
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="post-creation-title">
      <DialogHeader onClose={handleClose}>
        <Box display="flex" alignItems="center">
          <CalloutReactIcon fill="primary" sx={{ marginRight: 1 }} />
          {t('components.post-creation.title', { calloutDisplayName: calloutDisplayName })}
        </Box>
      </DialogHeader>
      <DialogContent>
        <Box marginBottom={2} marginTop={2}>
          <PostForm
            post={post}
            postNames={postNames}
            onChange={handleFormChange}
            onStatusChanged={handleFormStatusChange}
            descriptionTemplate={defaultDescription}
            tags={[]}
            disableRichMedia={disableRichMedia}
          />
        </Box>
      </DialogContent>
      <DialogActions>{renderButtons()}</DialogActions>
    </Dialog>
  );
};

export default PostCreationDialog;
