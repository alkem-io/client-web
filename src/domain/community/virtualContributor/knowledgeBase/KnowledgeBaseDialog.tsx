import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import KnowledgeBase from './KnowledgeBase';
import Gutters from '@/core/ui/grid/Gutters';

type KnowledgeBaseDialogProps = {
  onClose: () => void;
  title: string;
  id: string;
};

const KnowledgeBaseDialog = ({ onClose, title, id }: KnowledgeBaseDialogProps) => {
  return (
    <DialogWithGrid open columns={10}>
      <DialogHeader onClose={onClose}>{title}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding>
          <KnowledgeBase id={id} />
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default KnowledgeBaseDialog;
