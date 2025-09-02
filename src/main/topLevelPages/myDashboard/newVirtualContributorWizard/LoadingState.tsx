import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import CancelDialog from './CancelDialog';

type LoadingStateProps = {
  onClose: () => void;
  titleId?: string;
};

const LoadingState = ({ onClose, titleId }: LoadingStateProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const onCancel = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DialogHeader onClose={onCancel} id={titleId} />
      <Loading text="" />
      <Gutters padding={gutters(2)} textAlign="center">
        <Caption>{t('createVirtualContributorWizard.loadingInfo.vcSpaceCreation')}</Caption>
      </Gutters>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onClose} />
    </>
  );
};

export default LoadingState;
