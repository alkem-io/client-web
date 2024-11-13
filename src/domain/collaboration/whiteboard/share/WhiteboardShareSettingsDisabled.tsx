import { BlockTitle, Caption } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@core/ui/grid/Gutters';

const WhiteboardShareSettingsDisabled = () => {
  const { t } = useTranslation();

  return (
    <Gutters paddingX={0}>
      <BlockTitle>{t('common.settings')}</BlockTitle>
      <Caption>{t('components.shareSettings.disabled')}</Caption>
    </Gutters>
  );
};

export default WhiteboardShareSettingsDisabled;
