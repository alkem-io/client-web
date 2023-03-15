import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '../../ProfileDetail/ProfileDetail';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import References from '../../../../shared/components/References/References';
import { styled } from '@mui/styles';
import { UserMetadata } from '../../../contributor/user/hooks/useUserMetadataWrapper';
import { isSocialNetworkSupported } from '../../../../shared/components/SocialLinks/models/SocialNetworks';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { BlockSectionTitle, CardText } from '../../../../../core/ui/typography';

export interface UserProfileViewProps {
  entities: {
    userMetadata: UserMetadata;
    verified: boolean;
  };
}

const TagsWithOffset = styled(TagsComponent)({
  marginTop: 5,
});

export const UserProfileView: FC<UserProfileViewProps> = ({ entities: { userMetadata } }) => {
  const { t } = useTranslation();
  const { user, keywords, skills } = userMetadata;
  const references = user.profile.references;
  const bio = user.profile.description;

  const nonSocialReferences = useMemo(() => {
    return references?.filter(x => !isSocialNetworkSupported(x.name));
  }, [references]);

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
          references={nonSocialReferences}
          noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
        />
      </Grid>
    </PageContentBlock>
  );
};

export default UserProfileView;
