import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '../../ProfileDetail/ProfileDetail';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import References from '../../../../shared/components/References/References';
import { styled } from '@mui/styles';
import { UserMetadata } from '../../../user/hooks/useUserMetadataWrapper';
import {
  SocialNetworkEnum,
  isSocialNetworkSupported,
} from '../../../../shared/components/SocialLinks/models/SocialNetworks';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import { BlockSectionTitle, CardText } from '@core/ui/typography';
import SocialLinks from '../../../../shared/components/SocialLinks/SocialLinks';
import { groupBy } from 'lodash';

export interface UserProfileViewProps {
  entities: {
    userMetadata: UserMetadata;
    verified: boolean;
  };
}

const TagsWithOffset = styled(TagsComponent)({
  marginTop: 5,
});

const SOCIAL_LINK_GROUP = 'social';
const OTHER_LINK_GROUP = 'other';

export const UserProfileView: FC<UserProfileViewProps> = ({ entities: { userMetadata } }) => {
  const { t } = useTranslation();
  const { user, keywords, skills } = userMetadata;
  const references = user.profile.references;
  const bio = user.profile.description;
  const links = useMemo(() => {
    return groupBy(references, reference =>
      isSocialNetworkSupported(reference.name) ? SOCIAL_LINK_GROUP : OTHER_LINK_GROUP
    );
  }, [references]);

  const socialLinks = links[SOCIAL_LINK_GROUP].map(s => ({
    type: s.name as SocialNetworkEnum,
    url: s.uri,
  }));

  return (
    <PageContentBlock>
      <Grid item>
        <ProfileDetail title={t('components.profile.fields.bio.title')} value={bio} aria-label="bio" />
      </Grid>

      <Grid item>
        <BlockSectionTitle>{t('components.profile.fields.keywords.title')}</BlockSectionTitle>
        <TagsWithOffset tags={keywords} />
      </Grid>

      <Grid item>
        <BlockSectionTitle>{t('components.profile.fields.skills.title')}</BlockSectionTitle>
        <TagsWithOffset tags={skills} />
      </Grid>

      <Grid item container direction="column">
        <BlockSectionTitle>{t('components.profile.fields.links.title')}</BlockSectionTitle>
        <References
          references={links[OTHER_LINK_GROUP]}
          noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
        />
      </Grid>
      <Grid item display="flex" flexGrow={1} justifyContent="end">
        <SocialLinks items={socialLinks} />
      </Grid>
    </PageContentBlock>
  );
};

export default UserProfileView;
