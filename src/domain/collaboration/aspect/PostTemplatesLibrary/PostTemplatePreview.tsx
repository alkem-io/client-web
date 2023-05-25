import { FC } from 'react';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { PostTemplateWithValue } from '../PostTemplateCard/PostTemplate';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

interface PostTemplatePreviewProps extends TemplatePreviewBaseProps<PostTemplateWithValue> {}

const PostTemplatePreview: FC<PostTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <>
      <BlockTitle>{t('components.callout-creation.template-step.card-template-default-description')}</BlockTitle>
      <WrapperMarkdown>{template?.defaultDescription ?? ''}</WrapperMarkdown>

      {/*
        // Type is not visible in the design, but it's a property from the Cards that we may want to enable in the future,
        // the rest of the code is ready to handle it, it's just hidden:

        <BlockTitle>{t('components.callout-creation.template-step.type')}</BlockTitle>
        <BlockSectionTitle>{template?.type}</BlockSectionTitle>
      */}
    </>
  );
};

export default PostTemplatePreview;
