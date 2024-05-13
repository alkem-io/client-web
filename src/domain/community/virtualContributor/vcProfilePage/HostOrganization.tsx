import React from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import getLocationString from '../../../../core/ui/location/getLocationString';
import { useTranslation } from 'react-i18next';
import { LocationIcon } from '../../../timeline/calendar/icons/LocationIcon';
import { theme } from '../../../../core/ui/themes/default/Theme';

// TODO: Replace with real data
const profile = {
  avatar: {
    uri: 'https://alkem.io/api/private/rest/storage/document/e58662b2-50f1-4c33-a8b4-40d601000afd',
  },
  displayName: 'Alkemio Foundation',
  location: {
    city: 'Hague',
    country: 'NL',
  },
};

const HostOrganization = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title="Host Organization" />
        <BadgeCardView
          visual={
            <Avatar
              src={profile.avatar?.uri}
              aria-label="User avatar"
              alt={t('common.avatar-of', { user: profile.displayName })}
            >
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

export default HostOrganization;
