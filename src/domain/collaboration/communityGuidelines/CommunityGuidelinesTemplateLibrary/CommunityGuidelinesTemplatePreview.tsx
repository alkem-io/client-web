import { FC } from 'react';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import References from '../../../shared/components/References/References';
import { CommunityGuidelinesInfo } from '../../../community/community/CommunityGuidelines/CommunityGuidelinesInfoDialog';

interface CommunityGuidelinesTemplatePreviewProps {
  template?: {
    guidelines?: {
      profile: CommunityGuidelinesInfo;
    };
  };
}

const CommunityGuidelinesTemplatePreview: FC<CommunityGuidelinesTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockSectionTitle>{t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines?.profile.displayName ?? ''}</WrapperMarkdown>
      <BlockSectionTitle>{t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}</BlockSectionTitle>
      <WrapperMarkdown>{template?.guidelines?.profile.description ?? ''}</WrapperMarkdown>
      <References
        references={template?.guidelines?.profile?.references ?? []}
        noItemsView={<Caption>{t('common.no-references')}</Caption>}
      />
    </PageContentBlock>
  );
};

export default CommunityGuidelinesTemplatePreview;
