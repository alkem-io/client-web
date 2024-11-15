import React, { FC } from 'react';
import { Box, DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Reference } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '../../../shared/components/References/References';

export interface CommunityGuidelinesInfo {
  displayName?: string;
  description?: string;
  references?: Reference[];
}

export interface CommunityGuidelinesInfoDialogProps {
  open: boolean;
  onClose: () => void;
  guidelines: CommunityGuidelinesInfo | undefined;
}

const CommunityGuidelinesInfoDialog: FC<CommunityGuidelinesInfoDialogProps> = ({ open, onClose, guidelines }) => {
  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader onClose={onClose} title={guidelines?.displayName} />
      <DialogContent>
        <Gutters disablePadding>
          <Box sx={{ wordWrap: 'break-word' }}>
            <WrapperMarkdown disableParagraphPadding>{guidelines?.description ?? ''}</WrapperMarkdown>
          </Box>
          <References compact references={guidelines?.references} />
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CommunityGuidelinesInfoDialog;
