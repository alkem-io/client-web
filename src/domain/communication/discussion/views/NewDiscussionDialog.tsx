import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { refetchPlatformDiscussionsQuery, useCreateDiscussionMutation } from '@/core/apollo/generated/apollo-hooks';
import type { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useScreenSize } from '@/core/ui/grid/constants';
import DiscussionForm, { type DiscussionFormValues } from '../forms/DiscussionForm';

export interface NewDiscussionDialogProps {
  open: boolean;
  onClose: () => void;
  forumId: string;
  categories: ForumDiscussionCategory[];
}

const NewDiscussionDialog = ({ open, onClose, forumId, categories }: NewDiscussionDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSmallScreen } = useScreenSize();

  const [createDiscussion] = useCreateDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const handleSubmit = async (values: DiscussionFormValues) => {
    const { data } = await createDiscussion({
      variables: {
        input: {
          forumID: forumId,
          profile: {
            description: values.description,
            displayName: values.title,
          },
          category: values.category!,
        },
      },
    });
    onClose();
    if (data?.createDiscussion) {
      navigate(data.createDiscussion.profile.url, { replace: false });
    }
  };

  return (
    <DialogWithGrid
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={isSmallScreen}
      aria-labelledby="new-discussion-dialog"
    >
      <DialogHeader id="new-discussion-dialog" onClose={onClose}>
        {t('pages.forum.new-title')}
      </DialogHeader>
      <DialogContent>
        <DiscussionForm onSubmit={handleSubmit} categories={categories} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default NewDiscussionDialog;
