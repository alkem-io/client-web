import React, { FC, PropsWithChildren } from 'react';
import { DialogContent } from '@mui/material';
import PostTabs from './PostTabs';
import { PostDialogSection } from './PostDialogSection';
import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';
import DialogHeader from '@core/ui/dialog/DialogHeader';

export interface PostLayoutProps {
  currentSection: PostDialogSection;
  onClose: () => void;
}

const PostLayout: FC<PostLayoutProps> = ({ currentSection, onClose, children }: PropsWithChildren<PostLayoutProps>) => {
  return (
    <DialogWithGrid open={!!currentSection} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose} actions={<PostTabs currentTab={currentSection} />} />
      <DialogContent>{children}</DialogContent>
    </DialogWithGrid>
  );
};

export default PostLayout;
