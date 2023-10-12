import Gutters from '../../../core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle } from '../../../core/ui/typography';
import { ReactComponent as LogoImage } from '../logo/logoPreview.svg';
import { gutters } from '../../../core/ui/grid/utils';

const PoweredBy = () => {
  const { t } = useTranslation();

  return (
    <Gutters row disablePadding alignItems="center" height={gutters(3)} sx={{ svg: { width: gutters(7) } }}>
      <BlockSectionTitle flexShrink={0} textTransform="uppercase">
        {t('components.poweredBy.label')}
      </BlockSectionTitle>
      <LogoImage />
    </Gutters>
  );
};

export default PoweredBy;
