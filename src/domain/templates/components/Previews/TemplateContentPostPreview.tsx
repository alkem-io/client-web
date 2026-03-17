import { Skeleton } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle } from '@/core/ui/typography';

interface TemplateContentPostPreviewProps {
  loading?: boolean;
  template?: {
    postDefaultDescription?: string;
  };
}

const TemplateContentPostPreview: FC<TemplateContentPostPreviewProps> = ({ template, loading }) => {
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

export default TemplateContentPostPreview;
