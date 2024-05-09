import { FC } from 'react';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

interface MemberGuidelinesTemplatePreviewProps {
  template?: {
    defaultDescription?: string;
  };
}

const MemberGuidelinesTemplatePreview: FC<MemberGuidelinesTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockSectionTitle>
        {t('components.callout-creation.template-step.post-template-default-description')}
      </BlockSectionTitle>
      <WrapperMarkdown>{template?.defaultDescription ?? ''}</WrapperMarkdown>
    </PageContentBlock>
  );
};

export default MemberGuidelinesTemplatePreview;
