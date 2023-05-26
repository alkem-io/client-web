import { useBannerInnovationHubQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { detectSubdomain } from '../Subdomain';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import PageContentRibbon from '../../../../core/ui/content/PageContentRibbon';

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

  const isForeignJourney = innovationHub ? !innovationHub.hubListFilter?.some(({ id }) => id === hubId) : false;

  const { t } = useTranslation();

  if (!isForeignJourney) {
    return undefined;
  }

  return (
    <PageContentRibbon>
      <Trans
        t={t}
        i18nKey="innovationHub.foreignJourney"
        values={{
          journey: journeyTypeName,
          hub: innovationHub?.profile?.displayName,
        }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubJourneyBannerRibbon;
