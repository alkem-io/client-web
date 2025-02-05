import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import { UserMetadata } from '@/domain/community/user/hooks/useUserMetadataWrapper';
import References from '@/domain/shared/components/References/References';
import SocialLinks from '@/domain/shared/components/SocialLinks/SocialLinks';
import {
  SocialNetworkEnum,
  isSocialNetworkSupported,
} from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { Grid, styled } from '@mui/material';
import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface UserProfileViewProps {
  entities: {
    userMetadata: UserMetadata;
  };
}

const TagsWithOffset = styled(TagsComponent)({ marginTop: 5 });

const SOCIAL_LINK_GROUP = 'social';
const OTHER_LINK_GROUP = 'other';

export const UserProfileView = ({ entities: { userMetadata } }: UserProfileViewProps) => {
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
