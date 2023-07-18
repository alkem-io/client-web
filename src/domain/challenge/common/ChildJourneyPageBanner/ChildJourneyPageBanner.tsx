import Gutters from '../../../../core/ui/grid/Gutters';
import JourneyPageBannerCard, {
  JourneyPageBannerCardProps,
} from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import { gutters } from '../../../../core/ui/grid/utils';
import { MAX_CONTENT_WIDTH_GUTTERS } from '../../../../core/ui/grid/constants';
import ImageBlurredSides from '../../../../core/ui/image/ImageBlurredSides';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Visual } from '../../../common/visual/Visual';
import { Skeleton } from '@mui/material';

interface ChildJourneyPageBannerProps extends JourneyPageBannerCardProps {
  banner: Visual | undefined;
}

const ChildJourneyPageBanner = ({ banner, ...cardProps }: ChildJourneyPageBannerProps) => {
  const { t } = useTranslation();

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  return (
    <Gutters>
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      <ImageBlurredSides
        src={banner?.uri}
        alt={t('visuals-alt-text.banner.page.text', { altText: banner?.alternativeText })}
        onLoad={() => setImageLoading(false)}
        onError={imageLoadError}
        blurRadius={2}
        height={theme => theme.spacing(18)}
        width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
        maxWidth="100%"
      />
      <JourneyPageBannerCard {...cardProps} />
    </Gutters>
  );
};

export default ChildJourneyPageBanner;
