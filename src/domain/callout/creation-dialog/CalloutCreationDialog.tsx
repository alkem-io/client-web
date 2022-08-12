import React, { FC } from 'react';
import { CalloutType } from '../../../models/graphql-schema';
import Dialog from '@mui/material/Dialog/Dialog';

export type CalloutCreationType = {
  description: string;
  displayName: string;
  type: CalloutType;
}

interface CalloutCreationOutput {}

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (aspect: CalloutCreationOutput) => Promise<{} | undefined>;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
    </Dialog>
  );
};
export default CalloutCreationDialog;
