import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Actions } from '@/core/ui/actions/Actions';
import { Caption } from '@/core/ui/typography';

interface CampaignBlockCreateVCProps {
  startWizard: () => void;
}

const CampaignBlockCreateVC = ({ startWizard }: CampaignBlockCreateVCProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Gutters disablePadding disableGap>
        <Gutters disablePadding disableGap alignItems={'center'}>
          <Caption color="primary" fontSize="small">
            {t('pages.home.sections.campaignBlock.vcCampaign.welcome')}
          </Caption>
          <Caption paddingTop={gutters(0.5)} textAlign={'center'} color="primary" fontSize="small">
            {t('pages.home.sections.campaignBlock.vcCampaign.clickHere')}
          </Caption>
          <Actions paddingTop={gutters(0.5)}>
            <Button
              aria-label={t('pages.home.sections.campaignBlock.createYourVCButton')}
              variant="contained"
              sx={{ textTransform: 'none', paddingTop: gutters(0.25), paddingBottom: gutters(0.25) }}
              onClick={startWizard}
            >
              {t('pages.home.sections.campaignBlock.createYourVCButton')}
            </Button>
          </Actions>
        </Gutters>
      </Gutters>
    </>
  );
};

export default CampaignBlockCreateVC;
