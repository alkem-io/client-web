import { Card, CardContent, Grid, Typography as MUITypography } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileDetail from '../../common/components/composite/common/ProfileDetail/ProfileDetail';
import TagsComponent from '../../domain/shared/components/TagsComponent/TagsComponent';
import Typography from '../../common/components/core/Typography';
import References from '../../common/components/composite/common/References/References';
import { styled } from '@mui/styles';
import { UserMetadata } from '../../domain/user/hooks/useUserMetadataWrapper';
import { isSocialNetworkSupported } from '../../domain/shared/components/SocialLinks/models/SocialNetworks';

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
  const references = user.profile?.references;
  const bio = user.profile?.description;
  const { phone } = user;

  const nonSocialReferences = useMemo(() => {
    return references?.filter(x => !isSocialNetworkSupported(x.name));
  }, [references]);

  return (
    <Card square elevation={0} variant="outlined">
      <CardContent>
        <Grid container spacing={2} direction="column">
          <Grid item>
            <ProfileDetail title={t('components.profile.fields.bio.title')} value={bio} aria-label="bio" />
          </Grid>
          <Grid item>
            <ProfileDetail title={t('components.profile.fields.telephone.title')} value={phone} aria-label="phone" />
          </Grid>

          <Grid item>
            <Typography color="primary" weight="boldLight" aria-label="keywords">
              {t('components.profile.fields.keywords.title')}
            </Typography>
            <TagsWithOffset tags={keywords} />
          </Grid>

          <Grid item>
            <Typography color="primary" weight="boldLight" aria-label="skills">
              {t('components.profile.fields.skills.title')}
            </Typography>
            <TagsWithOffset tags={skills} />
          </Grid>

          <Grid item container direction="column">
            <Typography color="primary" weight="boldLight" aria-label="links">
              {t('components.profile.fields.links.title')}
            </Typography>
            {!!nonSocialReferences && nonSocialReferences.length > 0 && (
              <References
                references={nonSocialReferences}
                noItemsView={
                  <MUITypography color="neutral.main" variant="subtitle2">
                    {t('common.no-references')}
                  </MUITypography>
                }
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default UserProfileView;
