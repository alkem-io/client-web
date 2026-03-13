import { Box, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import References from '@/domain/shared/components/References/References';

export interface CommunityGuidelinesInfo {
  displayName?: string;
  description?: string;
  references?: ReferenceModel[];
}

export interface CommunityGuidelinesInfoDialogProps {
  open: boolean;
  onClose: () => void;
  guidelines: CommunityGuidelinesInfo | undefined;
}

const CommunityGuidelinesInfoDialog = ({ open, onClose, guidelines }: CommunityGuidelinesInfoDialogProps) => (
  <DialogWithGrid open={open} onClose={onClose} columns={8} aria-labelledby="community-guidelines-info-dialog">
    <DialogHeader id="community-guidelines-info-dialog" onClose={onClose} title={guidelines?.displayName} />
    <DialogContent>
      <Gutters disablePadding={true}>
        <Box sx={{ wordWrap: 'break-word' }}>
          <WrapperMarkdown disableParagraphPadding={true}>{guidelines?.description ?? ''}</WrapperMarkdown>
        </Box>
        <References compact={true} references={guidelines?.references} />
      </Gutters>
    </DialogContent>
  </DialogWithGrid>
);

export default CommunityGuidelinesInfoDialog;
