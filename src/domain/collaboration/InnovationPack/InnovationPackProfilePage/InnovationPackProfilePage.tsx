import React, { useState } from 'react';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { BlockSectionTitle, BlockTitle, CaptionSmall, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useInnovationPackProfilePageQuery,
  usePlatformWhiteboardTemplateValueQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import WhiteboardTemplateCard from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplateCard';
import { WhiteboardTemplate, whiteboardTemplateMapper } from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplate';
import { PostTemplate, postTemplateMapper } from '../../aspect/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../aspect/PostTemplateCard/PostTemplateCard';
import InnovationTemplateCard from '../../../platform/admin/templates/InnovationTemplates/InnovationTemplateCard';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import CollaborationTemplatesLibraryPreview from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import WhiteboardTemplatePreview from '../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import PostTemplatePreview from '../../aspect/PostTemplatesLibrary/PostTemplatePreview';
import {
  AdminInnovationFlowTemplateFragment,
  AuthorizationPrivilege,
} from '../../../../core/apollo/generated/graphql-schema';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import ReferencesListSmallItem from '../../../profile/Reference/ReferencesListSmallItem/ReferencesListSmallItem';

enum TemplateType {
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
      template: AdminInnovationFlowTemplateFragment;
      templateType: TemplateType.InnovationFlowTemplate;
    };

const Noop = () => null;

const InnovationFlowPreview = ({ template }: { template: AdminInnovationFlowTemplateFragment }) => {
  return <SafeInnovationFlowVisualizer definition={template.definition} />;
};

const getTemplatePreviewProps = (
  selectedTemplate: SelectedTemplate | undefined,
  templateWithValue?: { value: string }
) => {
  if (!selectedTemplate) {
    return {
      template: undefined,
      templateCardComponent: Noop,
      templatePreviewComponent: Noop,
    };
  }
  switch (selectedTemplate.templateType) {
    case TemplateType.WhiteboardTemplate: {
      const template = {
        ...templateWithValue,
        ...selectedTemplate.template,
      };
      return {
        template,
        templateCardComponent: WhiteboardTemplateCard,
        templatePreviewComponent: WhiteboardTemplatePreview,
      };
    }
    case TemplateType.PostTemplate: {
      return {
        template: selectedTemplate.template,
        templateCardComponent: PostTemplateCard,
        templatePreviewComponent: PostTemplatePreview,
      };
    }
    case TemplateType.InnovationFlowTemplate: {
      return {
        template: selectedTemplate.template,
        templateCardComponent: InnovationTemplateCard,
        templatePreviewComponent: InnovationFlowPreview,
      };
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
            <PageContentBlock>
              <PageContentBlockHeader
                title={
                  <EllipsableWithCount count={whiteboardTemplates?.length}>
                    {t('common.whiteboardTemplates')}
                  </EllipsableWithCount>
                }
              />
              <ScrollableCardsLayoutContainer>
                {whiteboardTemplates
                  ?.map(template => whiteboardTemplateMapper(template, providerProfile, innovationPack))
                  .map(template => (
                    <WhiteboardTemplateCard
                      key={template.id}
                      template={template}
                      onClick={() =>
                        setSelectedTemplate({
                          template,
                          templateType: TemplateType.WhiteboardTemplate,
                        })
                      }
                    />
                  ))}
                {whiteboardTemplates?.length === 0 && (
                  <CaptionSmall>{t('pages.innovationPack.whiteboardTemplatesEmpty')}</CaptionSmall>
                )}
              </ScrollableCardsLayoutContainer>
            </PageContentBlock>
            <PageContentBlock>
              <PageContentBlockHeader
                title={
                  <EllipsableWithCount count={postTemplates?.length}>{t('common.postTemplates')}</EllipsableWithCount>
                }
              />
              <ScrollableCardsLayoutContainer>
                {postTemplates
                  ?.map(template => postTemplateMapper(template, providerProfile, innovationPack))
                  .map(template => (
                    <PostTemplateCard
                      key={template.id}
                      template={template}
                      onClick={() =>
                        setSelectedTemplate({
                          template,
                          templateType: TemplateType.PostTemplate,
                        })
                      }
                    />
                  ))}
                {postTemplates?.length === 0 && (
                  <CaptionSmall>{t('pages.innovationPack.postTemplatesEmpty')}</CaptionSmall>
                )}
              </ScrollableCardsLayoutContainer>
            </PageContentBlock>
            <PageContentBlock>
              <PageContentBlockHeader
                title={
                  <EllipsableWithCount count={innovationFlowTemplates?.length}>
                    {t('common.innovationTemplates')}
                  </EllipsableWithCount>
                }
              />
              <ScrollableCardsLayoutContainer>
                {innovationFlowTemplates?.map(template => (
                  <Box
                    onClick={event => {
                      event.preventDefault();
                      setSelectedTemplate({
                        template,
                        templateType: TemplateType.InnovationFlowTemplate,
                      });
                    }}
                  >
                    <InnovationTemplateCard
                      key={template.id}
                      title={template.profile.displayName}
                      imageUrl={template.profile.visual?.uri}
                      to=""
                    />
                  </Box>
                ))}
                {innovationFlowTemplates?.length === 0 && (
                  <CaptionSmall>{t('pages.innovationPack.innovationFlowTemplatesEmpty')}</CaptionSmall>
                )}
              </ScrollableCardsLayoutContainer>
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
      </InnovationPackProfileLayout>
      <DialogWithGrid open={!!selectedTemplate} columns={12} onClose={() => setSelectedTemplate(undefined)}>
        <DialogHeader onClose={() => setSelectedTemplate(undefined)}>
          <BlockTitle>{t('common.preview')}</BlockTitle>
        </DialogHeader>
        <Gutters>
          <CollaborationTemplatesLibraryPreview
            {
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              ...(getTemplatePreviewProps(
                selectedTemplate,
                whiteboardTemplateValueData?.platform.library.innovationPack?.templates?.whiteboardTemplate
              ) as any)
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
