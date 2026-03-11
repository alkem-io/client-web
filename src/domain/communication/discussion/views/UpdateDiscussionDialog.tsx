import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { refetchPlatformDiscussionsQuery, useUpdateDiscussionMutation } from '@/core/apollo/generated/apollo-hooks';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useScreenSize } from '@/core/ui/grid/constants';
import DiscussionForm, { type DiscussionFormValues } from '../forms/DiscussionForm';
import type { Discussion } from '../models/Discussion';

export interface UpdateDiscussionDialogProps {
  open: boolean;
  onClose: () => void;
  discussion: Discussion;
}

const UpdateDiscussionDialog = ({ open, onClose, discussion }: UpdateDiscussionDialogProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  const [updateDiscussion] = useUpdateDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const handleSubmit = async (values: DiscussionFormValues) => {
    await updateDiscussion({
      variables: {
        input: {
          ID: discussion.id,
          profileData: {
            description: values.description,
            displayName: values.title,
          },
          category: values.category!,
        },
      },
    });
    onClose();
  };

  return (
    <DialogWithGrid
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={isSmallScreen}
      aria-labelledby="update-discussion-dialog"
    >
      <DialogHeader id="update-discussion-dialog" onClose={onClose}>
        {t('pages.forum.new-title')}
      </DialogHeader>
      <DialogContent>
        <DiscussionForm
          onSubmit={handleSubmit}
          discussion={discussion}
          categories={[discussion.category]}
          editMode={true}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default UpdateDiscussionDialog;
