import { PropsWithChildren } from 'react';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import References from '@/domain/shared/components/References/References';
import { Skeleton } from '@mui/material';
import { ReferenceModelWithOptionalAuthorization } from '@/domain/common/reference/ReferenceModel';

interface TemplateContentCommunityGuidelinesPreviewProps {
  loading?: boolean;
  template?: {
    communityGuidelines?: {
      profile: {
        displayName: string;
        description?: string;
        references?: ReferenceModelWithOptionalAuthorization[];
      };
    };
  };
}

const TemplateContentCommunityGuidelinesPreview = ({
  template,
  loading,
}: PropsWithChildren<TemplateContentCommunityGuidelinesPreviewProps>) => {
  const { t } = useTranslation();
  const communityGuidelines = template?.communityGuidelines;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}</BlockSectionTitle>
      <WrapperMarkdown>{communityGuidelines?.profile.displayName ?? ''}</WrapperMarkdown>
      {loading && <Skeleton />}
      <BlockSectionTitle>{t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}</BlockSectionTitle>
      <WrapperMarkdown>{communityGuidelines?.profile.description ?? ''}</WrapperMarkdown>
      {loading && <Skeleton />}
      <References
        references={communityGuidelines?.profile?.references ?? []}
        noItemsView={<Caption>{t('common.no-references')}</Caption>}
      />
      {loading && <Skeleton />}
    </PageContentBlock>
  );
};

export default TemplateContentCommunityGuidelinesPreview;
