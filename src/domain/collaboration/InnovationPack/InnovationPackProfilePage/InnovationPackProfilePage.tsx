import { Box } from '@mui/material';
import { ComponentType, useState } from 'react';
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
import { PostTemplate, postTemplateMapper } from '../../post/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import { whiteboardTemplateMapper } from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { innovationFlowTemplateMapper } from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplate';
import InnovationFlowTemplateCard from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import TemplatePreviewDialog, { TemplatePreview } from '../TemplatePreviewDialog/TemplatePreviewDialog';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import TemplatesBlock from './TemplatesBlock';

export enum TemplateType {
  WhiteboardTemplate = 'WhiteboardTemplate',
  PostTemplate = 'PostTemplate',
  InnovationFlowTemplate = 'InnovationFlowTemplate',
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

  const { profile: providerProfile } = data?.platform.library.innovationPack?.provider ?? {};

  const { innovationPack } = data?.platform.library ?? {};

  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | undefined>();

  const { t } = useTranslation();

  const { data: whiteboardTemplateContentData, loading: loadingWhiteboardTemplateContent } =
    useWhiteboardTemplateContentQuery({
      variables: {
        whiteboardTemplateId: selectedTemplate?.template.id!,
      },
      skip: !selectedTemplate || selectedTemplate.templateType !== TemplateType.WhiteboardTemplate,
    });

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
              mapper={whiteboardTemplateMapper}
              cardComponent={WhiteboardTemplateCard}
              templateType={TemplateType.WhiteboardTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.whiteboardTemplatesEmpty')}
              providerProfile={providerProfile}
              innovationPack={innovationPack}
            />
            <TemplatesBlock
              title={t('common.enums.templateTypes.PostTemplate')}
              templates={postTemplates}
              mapper={postTemplateMapper}
              cardComponent={PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>}
              templateType={TemplateType.PostTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.postTemplatesEmpty')}
              providerProfile={providerProfile}
              innovationPack={innovationPack}
            />
            <TemplatesBlock
              title={t('common.enums.templateTypes.InnovationFlowTemplate')}
              templates={innovationFlowTemplates}
              mapper={innovationFlowTemplateMapper}
              cardComponent={InnovationFlowTemplateCard}
              templateType={TemplateType.InnovationFlowTemplate}
              onClickCard={setSelectedTemplate}
              emptyLabel={t('pages.innovationPack.innovationFlowTemplatesEmpty')}
              providerProfile={providerProfile}
              innovationPack={innovationPack}
            />
          </PageContentColumn>
        </PageContent>
      </InnovationPackProfileLayout>
      <TemplatePreviewDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(undefined)}
        template={selectedTemplate}
        templateWithContent={whiteboardTemplateContentData?.lookup.whiteboardTemplate}
        loadingTemplateContent={loadingWhiteboardTemplateContent}
      />
    </>
  );
};

export default InnovationPackProfilePage;
