import { useMemo } from 'react';

import { groupBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { type VCProfilePageViewProps } from './model';
import VCProfileContentView from './VCProfileContentView';
import Gutters from '@/core/ui/grid/Gutters';
import { CardText, BlockSectionTitle } from '@/core/ui/typography';
import References from '@/domain/shared/components/References/References';
import { isSocialNetworkSupported } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { gutters } from '@/core/ui/grid/utils';

const OTHER_LINK_GROUP = 'other';
const SOCIAL_LINK_GROUP = 'social';

export const VCProfilePageView = ({ virtualContributor, ...pageProps }: VCProfilePageViewProps) => {
  const { t } = useTranslation();

  const references = virtualContributor?.profile?.references;

  const links = useMemo(() => {
    return groupBy(references, reference =>
      isSocialNetworkSupported(reference.name) ? SOCIAL_LINK_GROUP : OTHER_LINK_GROUP
    );
  }, [references]);

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock disableGap>
          <ProfileDetail
            title={t('components.profile.fields.description.title')}
            value={virtualContributor?.profile?.description ?? ''}
            aria-label="description"
          />

          <Gutters disableGap disablePadding sx={{ marginTop: gutters(1) }}>
            <BlockSectionTitle>{t('components.profile.fields.links.title')}</BlockSectionTitle>

            <References
              references={links[OTHER_LINK_GROUP]}
              noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
            />
          </Gutters>
        </PageContentBlock>

        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.virtualContributorProfile.host')} />
          <ContributorCardHorizontal profile={virtualContributor?.provider?.profile} seamless />
        </PageContentBlock>
      </PageContentColumn>

      <PageContentColumn columns={8}>
        <VCProfileContentView virtualContributor={virtualContributor} {...pageProps} />
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
