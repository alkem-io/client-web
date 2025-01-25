import { useBannerInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
import PageContentRibbon from '@/core/ui/content/PageContentRibbon';

type UseInnovationHubJourneyBannerRibbonOptions = {
  spaceId: string | undefined;
};

const useInnovationHubJourneyBannerRibbon = ({ spaceId }: UseInnovationHubJourneyBannerRibbonOptions) => {
  const { data: innovationHubData } = useBannerInnovationHubQuery();

  const { innovationHub } = innovationHubData?.platform ?? {};

  const isForeignJourney = innovationHub ? !innovationHub.spaceListFilter?.some(({ id }) => id === spaceId) : false;

  const { t } = useTranslation();

  if (!isForeignJourney) {
    return undefined;
  }

  // TODO: remove
  const journeyTypeName = 'space';

  return (
    <PageContentRibbon>
      <Trans
        t={t}
        i18nKey="innovationHub.foreignJourney"
        values={{
          journey: t(`common.${journeyTypeName}` as const),
          space: innovationHub?.profile?.displayName,
        }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubJourneyBannerRibbon;
