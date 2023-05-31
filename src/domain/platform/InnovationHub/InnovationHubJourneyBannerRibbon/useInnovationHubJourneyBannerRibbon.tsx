import { useBannerInnovationHubQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
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
  const { data: innovationHubData } = useBannerInnovationHubQuery();

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
