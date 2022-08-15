import React, { FC } from 'react';
import { Box, DialogContent } from '@mui/material';
import AspectTabs from './AspectTabs';
import { AspectDialogSection } from './AspectDialogSection';
import DialogWhiteBg from '../../shared/components/DialogWhiteBg';

export interface AspectLayoutProps {
  currentSection: AspectDialogSection;
  onClose: () => void;
}

const AspectLayout: FC<AspectLayoutProps> = ({ currentSection, onClose, children }) => {
  return (
    <DialogWhiteBg open={!!currentSection} fullWidth maxWidth={false}>
      <AspectTabs currentTab={currentSection} onClose={onClose} />
      <DialogContent>
        <Box paddingTop={3} />
        {children}
      </DialogContent>
    </DialogWhiteBg>
  );
};

export default AspectLayout;
