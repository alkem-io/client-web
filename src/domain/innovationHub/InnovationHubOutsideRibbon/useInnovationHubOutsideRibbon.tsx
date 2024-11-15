import { useBannerInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import PageContentRibbon from '@/core/ui/content/PageContentRibbon';

interface UseInnovationHubOutsideRibbonOptions {
  label: TranslationKey;
}

const useInnovationHubOutsideRibbon = ({ label }: UseInnovationHubOutsideRibbonOptions) => {
  const { t } = useTranslation();

  const { data: innovationHubData } = useBannerInnovationHubQuery();

  const { innovationHub } = innovationHubData?.platform ?? {};

  if (!innovationHub) {
    return undefined;
  }

  return (
    <PageContentRibbon>
      <Trans
        t={t}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={label as any}
        values={{ space: innovationHub?.profile?.displayName }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubOutsideRibbon;
