import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';

interface TryVcInfoProps {
  vcName: string;
  url: string | undefined;
  onClose: () => void;
  titleId?: string;
}

const TryVcInfo = ({ vcName, url, onClose, titleId }: TryVcInfoProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogHeader id={titleId} title={t('createVirtualContributorWizard.tryInfoSection.title')} onClose={onClose} />
      <DialogContent>
        <Caption alignSelf="center">
          {t('createVirtualContributorWizard.tryInfoSection.description', { vcName })}
        </Caption>
      </DialogContent>
      <DialogActions>
        {url && (
          <Button component={RouterLink} to={url}>
            {t('createVirtualContributorWizard.tryInfoSection.goToProfile', { vcName })}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default TryVcInfo;
