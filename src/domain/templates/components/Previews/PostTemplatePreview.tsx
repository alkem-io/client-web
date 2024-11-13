import { FC } from 'react';
import { BlockSectionTitle } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import { Skeleton } from '@mui/material';

interface PostTemplatePreviewProps {
  loading?: boolean;
  template?: {
    postDefaultDescription?: string;
  };
}

const PostTemplatePreview: FC<PostTemplatePreviewProps> = ({ template, loading }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockSectionTitle>
        {t('components.callout-creation.template-step.post-template-default-description')}
      </BlockSectionTitle>
      {loading && <Skeleton />}
      {!loading && <WrapperMarkdown>{template?.postDefaultDescription ?? ''}</WrapperMarkdown>}
    </PageContentBlock>
  );
};

export default PostTemplatePreview;
