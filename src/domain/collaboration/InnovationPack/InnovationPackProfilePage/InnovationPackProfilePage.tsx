import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInnovationPackProfilePageQuery,
  useWhiteboardTemplateContentQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Text } from '../../../../core/ui/typography';
import ReferencesListSmallItem from '../../../profile/Reference/ReferencesListSmallItem/ReferencesListSmallItem';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import InnovationFlowTemplateCard from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import TemplatePreviewDialog, { TemplatePreview } from '../../../template/templatePreviewDialog/TemplatePreviewDialog';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import TemplatesBlock from './TemplatesBlock';

export enum TemplateType {
  WhiteboardTemplate = 'WhiteboardTemplate',
  PostTemplate = 'PostTemplate',
  InnovationFlowTemplate = 'InnovationFlowTemplate',
  CalloutTemplate = 'CalloutTemplate',
}

const InnovationPackProfilePage = () => {
  const { innovationPackNameId } = useUrlParams();

  if (!innovationPackNameId) {
    throw new Error('Must be within InnovationPack');
  }

  const { data, loading } = useInnovationPackProfilePageQuery({
    variables: {
      innovationPackId: innovationPackNameId,
    },
  });

  const { displayName, description, tagset, references } = data?.platform.library.innovationPack?.profile ?? {};

  const { whiteboardTemplates, postTemplates, innovationFlowTemplates } =
    data?.platform.library.innovationPack?.templates ?? {};

  const { innovationPack } = data?.platform.library ?? {};

  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | undefined>();

  const { t } = useTranslation();

  const { data: whiteboardTemplateContentData, loading: loadingWhiteboardTemplateContent } =
    useWhiteboardTemplateContentQuery({
      variables: {
        whiteboardTemplateId: selectedTemplate?.template['id']!,
      },
      skip: !selectedTemplate || selectedTemplate.templateType !== TemplateType.WhiteboardTemplate,
    });

  const previewedTemplate = useMemo<TemplatePreview | undefined>(() => {
    if (!selectedTemplate || selectedTemplate.templateType !== TemplateType.WhiteboardTemplate) {
      return selectedTemplate;
    }
    return {
      ...selectedTemplate,
      template: {
        ...selectedTemplate.template,
        ...whiteboardTemplateContentData?.lookup.whiteboardTemplate,
      },
    };
  }, [selectedTemplate, whiteboardTemplateContentData]);

  const canUpdate = innovationPack?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return (
    <>
      <InnovationPackProfileLayout innovationPack={innovationPack} showSettings={canUpdate} loading={loading}>
        <PageContent>
          <PageContentColumn columns={12}>
            <PageContentBlock sx={{ flexDirection: 'row' }}>
              <GridItem columns={6}>
                <Gutters disablePadding>
                  <PageContentBlockHeader title={displayName} />
                  <WrapperMarkdown disableParagraphPadding>{description ?? ''}</WrapperMarkdown>
                </Gutters>
              </GridItem>
              <GridItem columns={6}>
                <Box>
                  <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
                  <Box height={gutters(2)} display="flex" alignItems="center">
                    <TagsComponent
                      tags={tagset?.tags ?? []}
                      variant="filled"
                      size="medium"
                      color="primary"
                      height={gutters(2)}
                    />
                  </Box>
                  <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
                  {references?.map(reference => (
                    <ReferencesListSmallItem key={reference.id} uri={reference.uri}>
                      {reference.name}
                    </ReferencesListSmallItem>
                  ))}
                  {references && !references.length && (
                    <Text>{t('components.referenceSegment.missing-refereneces')}</Text>
                  )}
                </Box>
              </GridItem>
            </PageContentBlock>
            <TemplatesBlock
              title={t('common.enums.templateTypes.WhiteboardTemplate')}
              templates={whiteboardTemplates}
              cardComponent={WhiteboardTemplateCard}
              templateType={TemplateType.WhiteboardTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.whiteboardTemplatesEmpty')}
              innovationPack={innovationPack}
            />
            <TemplatesBlock
              title={t('common.enums.templateTypes.PostTemplate')}
              templates={postTemplates}
              cardComponent={PostTemplateCard}
              templateType={TemplateType.PostTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.postTemplatesEmpty')}
              innovationPack={innovationPack}
            />
            <TemplatesBlock
              title={t('common.enums.templateTypes.InnovationFlowTemplate')}
              templates={innovationFlowTemplates}
              cardComponent={InnovationFlowTemplateCard}
              templateType={TemplateType.InnovationFlowTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.innovationFlowTemplatesEmpty')}
              innovationPack={innovationPack}
            />
          </PageContentColumn>
        </PageContent>
      </InnovationPackProfileLayout>
      <TemplatePreviewDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(undefined)}
        templatePreview={previewedTemplate}
        innovationPack={innovationPack}
        loadingTemplateContent={loadingWhiteboardTemplateContent}
      />
    </>
  );
};

export default InnovationPackProfilePage;
