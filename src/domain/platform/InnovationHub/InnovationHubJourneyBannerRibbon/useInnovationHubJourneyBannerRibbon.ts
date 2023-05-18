import { useBannerInnovationHubQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { detectSubdomain } from '../Subdomain';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

interface UseInnovationHubJourneyBannerRibbonOptions {
  hubId: string;
  journeyTypeName: JourneyTypeName;
}

const useInnovationHubJourneyBannerRibbon = ({
  hubId,
  journeyTypeName,
}: UseInnovationHubJourneyBannerRibbonOptions) => {
  const subdomain = detectSubdomain();

  const { data: innovationHubData } = useBannerInnovationHubQuery({
    variables: {
      subdomain,
    },
    skip: !subdomain,
  });

  const { innovationHub } = innovationHubData?.platform ?? {};

  const isForeignJourney = !innovationHub?.hubListFilter?.some(({ id }) => id === hubId);

  const { t } = useTranslation();

  const ribbon = isForeignJourney
    ? t('pages.innovationHub.foreignJourney', {
        journey: journeyTypeName,
        hub: innovationHub?.profile?.displayName,
      })
    : undefined;

  return ribbon;
};

export default useInnovationHubJourneyBannerRibbon;
