import React, { FC } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import getLocationString from '../../../../core/ui/location/getLocationString';
import { useTranslation } from 'react-i18next';
import { LocationIcon } from '../../../timeline/calendar/icons/LocationIcon';
import { theme } from '../../../../core/ui/themes/default/Theme';

interface HostProps {
  hostProfile?: {
    avatar?: {
      uri: string;
    };
    displayName: string;
    location?: {
      city: string;
      country: string;
    };
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
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.virtual-contributor-profile.host')} />
        <BadgeCardView
          visual={
            <Avatar src={profile.avatar?.uri} alt={t('common.avatar-of', { user: profile.displayName })}>
              {profile.displayName[0]}
            </Avatar>
          }
        >
          <BlockSectionTitle>{profile.displayName}</BlockSectionTitle>
          {profile.location && (
            <BlockSectionTitle display={'flex'} alignItems={'center'}>
              <LocationIcon sx={{ fill: theme.palette.primary.main, width: 14, height: 14 }} />
              {getLocationString(profile.location)}
            </BlockSectionTitle>
          )}
        </BadgeCardView>
      </PageContentBlock>
    </>
  );
};

export default HostCard;
