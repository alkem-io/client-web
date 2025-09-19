import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import References from '@/domain/shared/components/References/References';
import SocialLinks from '@/domain/shared/components/SocialLinks/SocialLinks';
import {
  SocialNetworkEnum,
  isSocialNetworkSupported,
} from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { GridLegacy, styled } from '@mui/material';
import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserModel } from '../../user/models/UserModel';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';

export interface UserProfileViewProps {
  userModel: UserModel;
}

const TagsWithOffset = styled(TagsComponent)({ marginTop: 5 });

const SOCIAL_LINK_GROUP = 'social';
const OTHER_LINK_GROUP = 'other';

export const UserProfileView = ({ userModel }: UserProfileViewProps) => {
  const { t } = useTranslation();
  const keywords =
    userModel.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase())?.tags ??
    [];
  const skills =
    userModel.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Skills.toLowerCase())?.tags ?? [];
  const references = userModel.profile.references;
  const bio = userModel.profile.description;
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
      <GridLegacy item>
        <ProfileDetail title={t('components.profile.fields.bio.title')} value={bio} aria-label="bio" />
      </GridLegacy>

      {keywords.length > 0 && (
        <GridLegacy item>
          <BlockSectionTitle>{t('components.profile.fields.keywords.title')}</BlockSectionTitle>
          <TagsWithOffset tags={keywords} />
        </GridLegacy>
      )}

      {skills.length > 0 && (
        <GridLegacy item>
          <BlockSectionTitle>{t('components.profile.fields.skills.title')}</BlockSectionTitle>
          <TagsWithOffset tags={skills} />
        </GridLegacy>
      )}

      {Number(links[OTHER_LINK_GROUP]?.length) > 0 && (
        <GridLegacy item container direction="column">
          <BlockSectionTitle mb={gutters()}>{t('components.profile.fields.links.title')}</BlockSectionTitle>
          <References
            references={links[OTHER_LINK_GROUP]}
            noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
            containerProps={{ maxWidth: '100%' }}
          />
        </GridLegacy>
      )}

      {socialLinks.length > 0 && (
        <GridLegacy item display="flex" flexGrow={1} justifyContent="start">
          <SocialLinks items={socialLinks} />
        </GridLegacy>
      )}
    </PageContentBlock>
  );
};

export default UserProfileView;
