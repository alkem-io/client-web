import { PropsWithChildren } from 'react';
import { DialogContent } from '@mui/material';
import PostTabs from './PostTabs';
import { PostDialogSection } from './PostDialogSection';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

export interface PostLayoutProps {
  currentSection: PostDialogSection;
  onClose: () => void;
}

export const PostLayout = ({ currentSection, onClose, children }: PropsWithChildren<PostLayoutProps>) => (
  <DialogWithGrid
    open={!!currentSection}
    columns={12}
    onClose={onClose}
    disableScrollLock
    aria-labelledby="post-dialog-title"
  >
    <DialogHeader id="post-dialog-header" onClose={onClose} actions={<PostTabs currentTab={currentSection} />} />
    <DialogContent>{children}</DialogContent>
  </DialogWithGrid>
);
