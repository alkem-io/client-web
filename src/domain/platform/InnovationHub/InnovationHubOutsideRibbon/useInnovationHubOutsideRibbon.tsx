import { useBannerInnovationHubQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { detectSubdomain } from '../Subdomain';
import TranslationKey from '../../../../types/TranslationKey';
import PageContentRibbon from '../../../../core/ui/content/PageContentRibbon';

interface UseInnovationHubOutsideRibbonOptions {
  label: TranslationKey;
}

const useInnovationHubOutsideRibbon = ({ label }: UseInnovationHubOutsideRibbonOptions) => {
  const subdomain = detectSubdomain();

  const { t } = useTranslation();

  const { data: innovationHubData } = useBannerInnovationHubQuery({
    variables: {
      subdomain,
    },
    skip: !subdomain,
  });

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
        values={{ hub: innovationHub?.profile?.displayName }}
        components={{ strong: <strong /> }}
      />
    </PageContentRibbon>
  );
};

export default useInnovationHubOutsideRibbon;
