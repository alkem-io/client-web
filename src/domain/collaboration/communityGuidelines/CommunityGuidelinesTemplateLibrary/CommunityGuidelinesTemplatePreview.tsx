import { FC } from 'react';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
// import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';
// import { Reference } from '../../../common/profile/Profile';

interface CommunityGuidelinesTemplatePreviewProps {
  template?: {
    guidelines: {
      profile: {
        displayName: string;
        description: string;
        // references: Reference[];
      };
    };
  };
}

const CommunityGuidelinesTemplatePreview: FC<CommunityGuidelinesTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockSectionTitle>{t('community.communityGuidelines.templateTitle')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines.profile.displayName ?? ''}</WrapperMarkdown>
      <BlockSectionTitle>{t('community.communityGuidelines.templateDescription')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines.profile.description ?? ''}</WrapperMarkdown>
      {/* TODO: server not ready */}
      {/* <ProfileReferenceSegment references={template?.guidelines.profile?.references} profileId={"template?.guidelines?.profile?.id"} /> */}
    </PageContentBlock>
  );
};

export default CommunityGuidelinesTemplatePreview;
