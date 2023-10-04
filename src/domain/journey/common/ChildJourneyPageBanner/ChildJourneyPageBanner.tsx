import Gutters from '../../../../core/ui/grid/Gutters';
import JourneyPageBannerCard, {
  JourneyPageBannerCardProps,
} from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import { gutters } from '../../../../core/ui/grid/utils';
import { MAX_CONTENT_WIDTH_GUTTERS, useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import ImageBlurredSides from '../../../../core/ui/image/ImageBlurredSides';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';
import { Visual } from '../../../common/visual/Visual';
import { Box, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DEFAULT_BANNER_URL } from '../../../shared/components/PageHeader/JourneyPageBanner';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import { useColumns } from '../../../../core/ui/grid/GridContext';

interface ChildJourneyPageBannerProps extends JourneyPageBannerCardProps {
  banner: Visual | undefined;
  ribbon?: ReactNode;
}

const CardContainer = (props: JourneyPageBannerCardProps) => {
  const columns = useColumns();

  const cardStickSide = columns > 8 ? 'left' : undefined;

  return (
    <Gutters
      width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
      maxWidth="100%"
      marginX="auto"
      alignItems={cardStickSide === 'left' ? 'start' : 'stretch'}
      position="relative"
      paddingTop={gutters(3)}
    >
      <GridItem columns={8}>{({ width }) => <JourneyPageBannerCard maxWidth={width} {...props} />}</GridItem>
    </Gutters>
  );
};

const ChildJourneyPageBanner = ({ banner, ribbon, ...cardProps }: ChildJourneyPageBannerProps) => {
  const { t } = useTranslation();

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  const globalGridColumns = useGlobalGridColumns();

  return (
    <GridProvider columns={globalGridColumns}>
      <Box position="relative">
        {ribbon}
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          overflow="hidden"
          sx={{
            '&:after': theme => ({
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
            }),
          }}
        >
          <ImageBlurredSides
            src={banner?.uri || DEFAULT_BANNER_URL}
            alt={t('visuals-alt-text.banner.page.text', { altText: banner?.alternativeText })}
            onLoad={() => setImageLoading(false)}
            onError={imageLoadError}
            blurRadius={2}
            width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
            maxWidth="100%"
            containerProps={{
              height: '100%',
              visibility: imageLoading ? 'hidden' : undefined,
            }}
          />
        </Box>
        {imageLoading && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
        <CardContainer {...cardProps} />
      </Box>
    </GridProvider>
  );
};

export default ChildJourneyPageBanner;
