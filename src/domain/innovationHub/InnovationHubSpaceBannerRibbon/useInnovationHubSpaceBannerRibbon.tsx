import { useBannerInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
import PageContentRibbon from '@/core/ui/content/PageContentRibbon';

type UseInnovationHubBannerRibbonOptions = {
  spaceId: string | undefined;
};

const useInnovationHubBannerRibbon = ({ spaceId }: UseInnovationHubBannerRibbonOptions) => {
  const { data: innovationHubData } = useBannerInnovationHubQuery();

  const { innovationHub } = innovationHubData?.platform ?? {};

  const isForeignSpace = innovationHub ? !innovationHub.spaceListFilter?.some(({ id }) => id === spaceId) : false;

  const { t } = useTranslation();

  if (!isForeignSpace) {
    return undefined;
  }

  return (
    <PageContentRibbon>
      <Trans
        t={t}
        i18nKey="innovationHub.foreignSpace"
        values={{
          spaceDisplayName: innovationHub?.profile?.displayName,
        }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubBannerRibbon;
