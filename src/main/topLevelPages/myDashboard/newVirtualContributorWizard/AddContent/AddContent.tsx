import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { AddContentForm } from './AddContentForm';
import { AddContentProps } from './AddContentProps';
import CancelDialog from '../CancelDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

const AddContent = ({ onClose, onCreateVC, spaceId }: AddContentProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onCancel = () => {
    setDialogOpen(true);
  };

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <DialogHeader onClose={onCancel}>{t('createVirtualContributorWizard.addContent.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding paddingBottom={gutters(2)}>
          <Caption>{t('createVirtualContributorWizard.addContent.description')}</Caption>
          <Caption fontWeight="bold">{t('createVirtualContributorWizard.addContent.descriptionBold')}</Caption>
          <AddContentForm onSubmit={onCreateVC} onCancel={onCancel} />
        </Gutters>
      </DialogContent>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onClose} />
    </StorageConfigContextProvider>
  );
};

export default AddContent;
