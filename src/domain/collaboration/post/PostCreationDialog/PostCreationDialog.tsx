import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import PostForm, { PostFormOutput } from '../PostForm/PostForm';
import { CalloutType, CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';

export type PostCreationType = Partial<CreatePostInput>;
export type PostCreationOutput = CreatePostInput;

export type PostCreationDialogProps = {
  open: boolean;
  postNames: string[];
  onClose: () => void;
  onCreate: (post: PostCreationOutput) => Promise<unknown>;
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
  const CalloutIcon = calloutIcons[CalloutType.PostCollection];
  const [closeConfirmDialogOpen, setCloseConfirmDialogOpen] = useState(false);

  const handleClose = () => {
    setPost({});
    onClose();
  };

  const onCloseClick = useCallback(() => {
    setCloseConfirmDialogOpen(true);
  }, []);

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
        <Button onClick={onCloseClick}>{t('buttons.cancel')}</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!isFormValid || creating}>
          {t('buttons.create')}
        </Button>
      </>
    );
  };

  return (
    <DialogWithGrid open={open} columns={8} aria-labelledby="post-creation-title">
      <DialogHeader
        icon={<CalloutIcon sx={{ marginRight: 1 }} />}
        title={t('components.post-creation.title', { calloutDisplayName: calloutDisplayName })}
        onClose={onCloseClick}
      />
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
        <ConfirmationDialog
          actions={{
            onConfirm: () => {
              setCloseConfirmDialogOpen(false);
              handleClose();
            },
            onCancel: () => setCloseConfirmDialogOpen(false),
          }}
          options={{
            show: closeConfirmDialogOpen,
          }}
          entities={{
            titleId: 'post-edit.closeConfirm.title',
            contentId: 'post-edit.closeConfirm.description',
            confirmButtonTextId: 'buttons.yes-close',
          }}
        />
      </DialogContent>
      <DialogActions>{renderButtons()}</DialogActions>
    </DialogWithGrid>
  );
};

export default PostCreationDialog;
