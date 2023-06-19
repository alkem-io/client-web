import React, { FC } from 'react';
import { Box, DialogContent } from '@mui/material';
import PostTabs from './PostTabs';
import { PostDialogSection } from './PostDialogSection';
import DialogWhiteBg from '../../../shared/components/DialogWhiteBg';

export interface PostLayoutProps {
  currentSection: PostDialogSection;
  onClose: () => void;
}

const PostLayout: FC<PostLayoutProps> = ({ currentSection, onClose, children }) => {
  return (
    <DialogWhiteBg open={!!currentSection} fullWidth maxWidth={false}>
      <PostTabs currentTab={currentSection} onClose={onClose} />
      <DialogContent>
        <Box paddingTop={3} />
        {children}
      </DialogContent>
    </DialogWhiteBg>
  );
};

export default PostLayout;
