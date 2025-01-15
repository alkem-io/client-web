import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';

interface TryVcInfoProps {
  vcNameId: string;
  vcName: string;
  onClose: () => void;
}

const TryVcInfo = ({ vcNameId, vcName, onClose }: TryVcInfoProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogHeader title={t('createVirtualContributorWizard.tryInfoSection.title')} onClose={onClose} />
      <DialogContent>
        <Caption alignSelf="center">
          {t('createVirtualContributorWizard.tryInfoSection.description', { vcName })}
        </Caption>
      </DialogContent>
      <DialogActions>
        <Button component={RouterLink} to={`/vc/${vcNameId}`}>
          {t('createVirtualContributorWizard.tryInfoSection.goToProfile', { vcName })}
        </Button>
      </DialogActions>
    </>
  );
};

export default TryVcInfo;
