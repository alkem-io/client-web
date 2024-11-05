import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

interface HostProps {
  hostProfile?: {
    avatar?: {
      uri: string;
    };
    displayName: string;
    location?: {
      city?: string;
      country?: string;
    };
    url?: string;
    tagsets?: { tags: string[] }[];
  };
}

const DEFAULT_PROFILE = {
  avatar: {
    uri: 'https://alkem.io/api/private/rest/storage/document/e58662b2-50f1-4c33-a8b4-40d601000afd',
  },
  displayName: 'Alkemio Foundation',
  location: {
    city: 'Hague',
    country: 'NL',
  },
};

const HostCard: FC<HostProps> = ({ hostProfile }) => {
  const { t } = useTranslation();

  const profile = hostProfile || DEFAULT_PROFILE;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.virtualContributorProfile.host')} />
      <ContributorCardHorizontal profile={profile} seamless />
    </PageContentBlock>
  );
};

export default HostCard;
