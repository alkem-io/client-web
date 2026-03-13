import { Trans, useTranslation } from 'react-i18next';
import { useBannerInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import PageContentRibbon from '@/core/ui/content/PageContentRibbon';

const useInnovationHubOutsideRibbon = ({ label }: { label: TranslationKey }) => {
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
        i18nKey={label as any}
        values={{ space: innovationHub?.profile?.displayName }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubOutsideRibbon;
