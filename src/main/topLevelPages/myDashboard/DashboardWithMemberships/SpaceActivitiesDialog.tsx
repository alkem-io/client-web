import { PropsWithChildren } from 'react';

import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';

type SpaceActivitiesDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
};

export const SpaceActivitiesDialog = ({
  children,
  open,
  title,
  onClose,
}: PropsWithChildren<SpaceActivitiesDialogProps>) => (
  <DialogWithGrid open={open} columns={5} onClose={onClose}>
    <DialogHeader title={title} onClose={onClose} />

    <Gutters>{children}</Gutters>
  </DialogWithGrid>
);
