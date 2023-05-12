import React from 'react';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Box } from '@mui/material';
import { BlockSectionTitle, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useInnovationPackProfilePageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import WhiteboardTemplateCard from '../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplateCard';
import { whiteboardTemplateMapper } from '../../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplate';
import { postTemplateMapper } from '../../aspect/PostTemplatesLibrary/PostTemplate';
import PostTemplateCard from '../../aspect/PostTemplatesLibrary/PostTemplateCard';
import InnovationTemplateCard from '../../../platform/admin/templates/InnovationTemplates/InnovationTemplateCard';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';

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

  const { t } = useTranslation();

  const providerUri = providerNameId && buildOrganizationUrl(providerNameId);

  return (
    <InnovationPackProfileLayout
      displayName={displayName}
      tagline={tagline}
      providerDisplayName={providerProfile?.displayName ?? ''}
      providerUri={providerUri ?? ''}
      currentSection={EntityPageSection.Profile}
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
                  <Text component={RouterLink} to={reference.uri} key={reference.id}>
                    {reference.description}
                  </Text>
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
                ?.map(template => whiteboardTemplateMapper(template))
                .map(template => (
                  <WhiteboardTemplateCard key={template.id} template={template} />
                ))}
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
                ?.map(template => postTemplateMapper(template))
                .map(template => (
                  <PostTemplateCard key={template.id} template={template} />
                ))}
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
                <InnovationTemplateCard
                  key={template.id}
                  title={template.profile.displayName}
                  imageUrl={template.profile.visual?.uri}
                  to={''}
                />
              ))}
            </ScrollableCardsLayoutContainer>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </InnovationPackProfileLayout>
  );
};

export default InnovationPackProfilePage;
