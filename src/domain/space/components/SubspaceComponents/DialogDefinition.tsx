import { SubspaceDialog } from './SubspaceDialog';
import { ReactElement, ReactNode } from 'react';
import { SvgIconComponent } from '@mui/icons-material';

export interface DialogDefinitionProps {
  dialogType: SubspaceDialog;
  label: string;
  icon: SvgIconComponent;
  url?: string;
}

export const DialogDef = (_props: DialogDefinitionProps) => {
  return null;
};

export const isDialogDef = (node: ReactNode): node is ReactElement<DialogDefinitionProps> =>
  node ? node['type'] === DialogDef : false;
