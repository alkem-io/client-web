import { SubspaceDialog } from './SubspaceDialog';
import { ReactNode } from 'react';
import { SvgIconComponent } from '@mui/icons-material';

export interface DialogDefinitionProps {
  dialogType: SubspaceDialog;
  label: ReactNode;
  icon: SvgIconComponent;
  fullMenu?: boolean;
}

export const DialogDef = (_props: DialogDefinitionProps) => {
  return null;
};
