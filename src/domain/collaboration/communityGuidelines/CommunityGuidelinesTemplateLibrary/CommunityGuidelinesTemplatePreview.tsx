import { FC } from 'react';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
// import ProfileReferenceSegment from '../../../platform/admin/components/Common/ProfileReferenceSegment';

interface CommunityGuidelinesTemplatePreviewProps {
  template?: {
    guidelines: {
      profile: {
        displayName: string;
        description: string;
      };
    };
  };
}

const CommunityGuidelinesTemplatePreview: FC<CommunityGuidelinesTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockSectionTitle>{t('community.communityGuidelines.templateTitle')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines.profile.displayName}</WrapperMarkdown>
      <BlockSectionTitle>{t('community.communityGuidelines.templateDescription')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines.profile.description}</WrapperMarkdown>
      {/* <ProfileReferenceSegment references={mockValues.references} profileId={"data?.profile?.id"} /> */}
    </PageContentBlock>
  );
};

export default CommunityGuidelinesTemplatePreview;
