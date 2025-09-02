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

const AddContent = ({ onClose, onCreateVC, titleId }: AddContentProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onCancel = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DialogHeader onClose={onCancel} title={t('createVirtualContributorWizard.addContent.title')} id={titleId} />
      <DialogContent>
        <Gutters disablePadding paddingBottom={gutters(2)}>
          <Caption>
            {`${t('createVirtualContributorWizard.addContent.description')}
            ${t('createVirtualContributorWizard.addContent.descriptionBold')}`}
          </Caption>
          <AddContentForm onSubmit={onCreateVC} onCancel={onCancel} />
        </Gutters>
      </DialogContent>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onClose} />
    </>
  );
};

export default AddContent;
