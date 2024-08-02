import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Loading from '../../../../core/ui/loading/Loading';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import CancelDialog from './CancelDialog';

type LoadingStateProps = {
  onClose: () => void;
};

const LoadingState = ({ onClose }: LoadingStateProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onCancel = () => {
    setDialogOpen(true);
  };

  const onConfirmCancel = () => {
    // TODO: deletion doesn't work if the VC and/or space are not yet created
    onClose();
  };

  return (
    <>
      <DialogHeader onClose={onCancel} />
      <Loading text="" />
      <Gutters padding={gutters(2)} sx={{ textAlign: 'center' }}>
        <Caption>{t('createVirtualContributorWizard.createVC.loading')}</Caption>
      </Gutters>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onConfirmCancel} />
    </>
  );
};

export default LoadingState;
