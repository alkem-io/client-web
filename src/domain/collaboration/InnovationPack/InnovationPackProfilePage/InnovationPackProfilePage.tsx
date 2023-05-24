import React, { ComponentType, useState } from 'react';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { BlockSectionTitle, BlockTitle, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useInnovationPackProfilePageQuery,
  usePlatformWhiteboardTemplateValueQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import WhiteboardTemplateCard from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplateCard';
import { WhiteboardTemplate, whiteboardTemplateMapper } from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplate';
import { PostTemplate, postTemplateMapper } from '../../aspect/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../aspect/PostTemplateCard/PostTemplateCard';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import CollaborationTemplatesLibraryPreview, {
  CollaborationTemplatesLibraryPreviewProps,
} from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import WhiteboardTemplatePreview from '../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import PostTemplatePreview from '../../aspect/PostTemplatesLibrary/PostTemplatePreview';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import ReferencesListSmallItem from '../../../profile/Reference/ReferencesListSmallItem/ReferencesListSmallItem';
import InnovationFlowTemplateCard from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import {
  InnovationFlowTemplate,
  innovationFlowTemplateMapper,
} from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplate';
import TemplatesBlock from './TemplatesBlock';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export enum TemplateType {
  WhiteboardTemplate,
  PostTemplate,
  InnovationFlowTemplate,
}

type SelectedTemplate =
  | {
      template: WhiteboardTemplate;
      templateType: TemplateType.WhiteboardTemplate;
    }
  | {
      template: PostTemplate;
      templateType: TemplateType.PostTemplate;
    }
  | {
      template: InnovationFlowTemplate;
      templateType: TemplateType.InnovationFlowTemplate;
    };

const Noop = () => null;

const InnovationFlowPreview = ({ template }: { template?: InnovationFlowTemplate }) => {
  if (!template) {
    return null;
  }
  return <>{template.definition ? <SafeInnovationFlowVisualizer definition={template.definition} /> : undefined}</>;
};

interface TemplatePreviewProps
  extends Omit<
    CollaborationTemplatesLibraryPreviewProps<
      SelectedTemplate['template'],
      SelectedTemplate['template'] & { value: string }
    >,
    'template' | 'templateCardComponent' | 'templatePreviewComponent'
  > {
  selectedTemplate: SelectedTemplate | undefined;
  templateWithValue?: { value: string };
}

const TemplatePreview = ({ selectedTemplate, templateWithValue, ...props }: TemplatePreviewProps) => {
  if (!selectedTemplate) {
    return (
      <CollaborationTemplatesLibraryPreview
        {...{
          template: undefined,
          templateCardComponent: Noop,
          templatePreviewComponent: Noop,
        }}
        {...props}
      />
    );
  }
  switch (selectedTemplate.templateType) {
    case TemplateType.WhiteboardTemplate: {
      if (!templateWithValue) {
        return null;
      }
      const template = {
        ...templateWithValue,
        ...selectedTemplate.template,
      };
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template,
            templateCardComponent: WhiteboardTemplateCard,
            templatePreviewComponent: WhiteboardTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.PostTemplate: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: selectedTemplate.template,
            templateCardComponent: PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>,
            templatePreviewComponent: PostTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.InnovationFlowTemplate: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: selectedTemplate.template,
            templateCardComponent: InnovationFlowTemplateCard,
            templatePreviewComponent: InnovationFlowPreview,
          }}
          {...props}
        />
      );
    }
  }
};

const InnovationPackProfilePage = () => {
  const { innovationPackNameId } = useUrlParams();

  if (!innovationPackNameId) {
    throw new Error('Must be within InnovationPack');
  }

  const { data } = useInnovationPackProfilePageQuery({
    variables: {
      innovationPackId: innovationPackNameId,
    },
  });

  const { displayName, description, tagline, tagset, references } =
    data?.platform.library.innovationPack?.profile ?? {};

  const { whiteboardTemplates, postTemplates, innovationFlowTemplates } =
    data?.platform.library.innovationPack?.templates ?? {};

  const { nameID: providerNameId, profile: providerProfile } = data?.platform.library.innovationPack?.provider ?? {};

  const { innovationPack } = data?.platform.library ?? {};

  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | undefined>();

  const { t } = useTranslation();

  const providerUri = providerNameId && buildOrganizationUrl(providerNameId);

  const { data: whiteboardTemplateValueData, loading: loadingWhiteboardTemplateValue } =
    usePlatformWhiteboardTemplateValueQuery({
      variables: {
        innovationPackId: innovationPackNameId,
        whiteboardTemplateId: selectedTemplate?.template.id!,
      },
      skip: !selectedTemplate || selectedTemplate.templateType !== TemplateType.WhiteboardTemplate,
    });

  const canUpdate = innovationPack?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return (
    <>
      <InnovationPackProfileLayout
        displayName={displayName}
        tagline={tagline}
        providerDisplayName={providerProfile?.displayName ?? ''}
        providerUri={providerUri ?? ''}
        currentSection={EntityPageSection.Profile}
        showSettings={canUpdate}
      >
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
              title={t('common.whiteboardTemplates')}
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
              title={t('common.postTemplates')}
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
              title={t('common.innovationTemplates')}
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
      <DialogWithGrid open={!!selectedTemplate} columns={12} onClose={() => setSelectedTemplate(undefined)}>
        <DialogHeader onClose={() => setSelectedTemplate(undefined)}>
          <BlockTitle>{t('common.preview')}</BlockTitle>
        </DialogHeader>
        <Gutters>
          <TemplatePreview
            selectedTemplate={selectedTemplate}
            templateWithValue={
              whiteboardTemplateValueData?.platform.library.innovationPack?.templates?.whiteboardTemplate
            }
            loading={loadingWhiteboardTemplateValue}
            onClose={() => setSelectedTemplate(undefined)}
          />
        </Gutters>
      </DialogWithGrid>
    </>
  );
};

export default InnovationPackProfilePage;
