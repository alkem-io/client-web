import { useTranslation } from 'react-i18next';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import Loading from '@core/ui/loading/Loading';
import { Caption } from '@core/ui/typography';
import Gutters from '@core/ui/grid/Gutters';
import { gutters } from '@core/ui/grid/utils';

const SetupVCInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <DialogHeader />
      <Loading text="" />
      <Gutters padding={gutters(2)} sx={{ textAlign: 'center' }}>
        <Caption>{t('createVirtualContributorWizard.loadingInfo.vcCreation')}</Caption>
      </Gutters>
    </>
  );
};

export default SetupVCInfo;
