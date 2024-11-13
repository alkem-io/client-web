import React, { FC } from 'react';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import { refetchPlatformDiscussionsQuery, useUpdateDiscussionMutation } from '@core/apollo/generated/apollo-hooks';
import { Discussion } from '../models/Discussion';
import DiscussionForm, { DiscussionFormValues } from '../forms/DiscussionForm';

export interface UpdateDiscussionDialogProps {
  open: boolean;
  onClose: () => void;
  discussion: Discussion;
}

const UpdateDiscussionDialog: FC<UpdateDiscussionDialogProps> = ({ open, onClose, discussion }) => {
  const { t } = useTranslation();

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
    <DialogWithGrid open={open} onClose={onClose} fullScreen>
      <DialogHeader onClose={onClose}>{t('pages.forum.new-title')}</DialogHeader>
      <DialogContent>
        <DiscussionForm onSubmit={handleSubmit} discussion={discussion} categories={[discussion.category]} editMode />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default UpdateDiscussionDialog;
