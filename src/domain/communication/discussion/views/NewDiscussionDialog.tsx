import React, { FC } from 'react';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { refetchPlatformDiscussionsQuery, useCreateDiscussionMutation } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import DiscussionForm, { DiscussionFormValues } from '../forms/DiscussionForm';

export interface NewDiscussionDialogProps {
  open: boolean;
  onClose: () => void;
  forumId: string;
  categories: ForumDiscussionCategory[];
}

const NewDiscussionDialog: FC<NewDiscussionDialogProps> = ({ open, onClose, forumId, categories }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      navigate(data.createDiscussion.profile.url, { replace: true });
    }
  };

  return (
    <DialogWithGrid open={open} onClose={onClose} fullScreen>
      <DialogHeader onClose={onClose}>{t('pages.forum.new-title')}</DialogHeader>
      <DialogContent>
        <DiscussionForm onSubmit={handleSubmit} categories={categories} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default NewDiscussionDialog;
