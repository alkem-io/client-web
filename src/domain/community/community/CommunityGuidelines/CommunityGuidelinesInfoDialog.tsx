import { Box, DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

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
      <Gutters disablePadding>
        <Box sx={{ wordWrap: 'break-word' }}>
          <WrapperMarkdown disableParagraphPadding>{guidelines?.description ?? ''}</WrapperMarkdown>
        </Box>
        <References compact references={guidelines?.references} />
      </Gutters>
    </DialogContent>
  </DialogWithGrid>
);

export default CommunityGuidelinesInfoDialog;
