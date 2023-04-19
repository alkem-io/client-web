import { FC } from 'react';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { PostTemplateWithValue } from './PostTemplate';
import { BlockSectionTitle, BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

interface PostTemplatePreviewProps extends TemplatePreviewBaseProps<PostTemplateWithValue> {}

const PostTemplatePreview: FC<PostTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <>
      <BlockTitle>{t('components.callout-creation.template-step.card-template-default-description')}</BlockTitle>
      <BlockSectionTitle>{template?.defaultDescription}</BlockSectionTitle>
      {/*
        <BlockTitle>{t('components.callout-creation.template-step.type')}</BlockTitle>
        <BlockSectionTitle>{template?.type}</BlockSectionTitle>
      */}
    </>
  );
};

export default PostTemplatePreview;
