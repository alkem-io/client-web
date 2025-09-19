import { useAllTemplatesInTemplatesSetQuery } from '@/core/apollo/generated/apollo-hooks';
import LinksList from '@/domain/shared/components/List/LinksList';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface InnovationPackTemplateMenuProps {
  templatesSetId?: string;
}

const InnovationPackTemplateMenu = ({ templatesSetId }: InnovationPackTemplateMenuProps) => {
  const { t } = useTranslation();

  // Read Templates
  const { data: dataAllTemplates, loading: loadingTemplates } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId ?? '' },
    skip: !templatesSetId,
  });

  const { calloutTemplates, spaceTemplates, communityGuidelinesTemplates, postTemplates, whiteboardTemplates } =
    dataAllTemplates?.lookup.templatesSet ?? {};

  return (
    <LinksList
      links={[
        {
          id: 'spaceTemplates',
          title: t(`common.enums.templateType.${TemplateType.Space}_plural`),
          url: spaceTemplates && spaceTemplates.length > 0 ? `#${TemplateType.Space.toLowerCase()}` : undefined,
          count: spaceTemplates?.length ?? 0,
        },
        {
          id: 'calloutTemplates',
          title: t(`common.enums.templateType.${TemplateType.Callout}_plural`),
          url: calloutTemplates && calloutTemplates.length > 0 ? `#${TemplateType.Callout.toLowerCase()}` : undefined,
          count: calloutTemplates?.length ?? 0,
        },
        {
          id: 'whiteboardTemplates',
          title: t(`common.enums.templateType.${TemplateType.Whiteboard}_plural`),
          url:
            whiteboardTemplates && whiteboardTemplates.length > 0
              ? `#${TemplateType.Whiteboard.toLowerCase()}`
              : undefined,
          count: whiteboardTemplates?.length ?? 0,
        },
        {
          id: 'postTemplates',
          title: t(`common.enums.templateType.${TemplateType.Post}_plural`),
          url: postTemplates && postTemplates.length > 0 ? `#${TemplateType.Post.toLowerCase()}` : undefined,
          count: postTemplates?.length ?? 0,
        },
        {
          id: 'communityGuidelinesTemplates',
          title: t(`common.enums.templateType.${TemplateType.CommunityGuidelines}_plural`),
          url:
            communityGuidelinesTemplates && communityGuidelinesTemplates.length > 0
              ? `#${TemplateType.CommunityGuidelines.toLowerCase()}`
              : undefined,
          count: communityGuidelinesTemplates?.length ?? 0,
        },
      ]}
      emptyListCaption={t('common.noneTemplates')}
      loading={loadingTemplates}
    />
  );
};

export default InnovationPackTemplateMenu;
