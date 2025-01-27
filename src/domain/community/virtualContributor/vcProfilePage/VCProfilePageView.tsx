import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { type VCProfilePageViewProps } from './model';
import VCProfileContentView from './VCProfileContentView';

export const VCProfilePageView = ({ virtualContributor, ...pageProps }: VCProfilePageViewProps) => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock disableGap>
          <ProfileDetail
            title={t('components.profile.fields.description.title')}
            value={virtualContributor?.profile?.description ?? ''}
            aria-label="description"
          />
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
