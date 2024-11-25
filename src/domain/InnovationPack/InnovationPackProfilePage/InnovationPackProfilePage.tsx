import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useInnovationPackProfilePageQuery,
  useInnovationPackResolveIdQuery,
  useTemplateUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useUrlParams } from '@/core/routing/useUrlParams';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import GridItem from '@/core/ui/grid/GridItem';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Text } from '@/core/ui/typography';
import ReferencesListSmallItem from '@/domain/profile/Reference/ReferencesListSmallItem/ReferencesListSmallItem';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import {} from '@/domain/templates/components/Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import TemplatesAdmin from '@/domain/templates/components/TemplatesAdmin/TemplatesAdmin';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';

const InnovationPackProfilePage = () => {
  const { t } = useTranslation();
  const { templateNameId, innovationPackNameId } = useUrlParams();

  if (!innovationPackNameId) {
    throw new Error('Must be within Innovation Pack');
  }

  const { data: innovationPackResolverData, loading: resolvingInnovationPack } = useInnovationPackResolveIdQuery({
    variables: { innovationPackNameId },
    skip: !innovationPackNameId,
  });

  const innovationPackId = innovationPackResolverData?.lookupByName.innovationPack?.id;
  if (innovationPackNameId && !resolvingInnovationPack && !innovationPackId) {
    throw new Error('Innovation pack not found.');
  }

  const { data, loading: loadingInnovationPack } = useInnovationPackProfilePageQuery({
    variables: {
      innovationPackId: innovationPackId!,
    },
    skip: !innovationPackId,
  });

  const innovationPack = data?.lookup.innovationPack;
  const { displayName, description, tagset, references, url: baseUrl } = innovationPack?.profile ?? {};
  const canUpdate = innovationPack?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const templatesSetId = innovationPack?.templatesSet?.id;

  const { data: templateResolverData, loading: resolvingTemplate } = useTemplateUrlResolverQuery({
    variables: { templatesSetId: templatesSetId!, templateNameId: templateNameId! },
    skip: !templatesSetId || !templateNameId,
  });
  const selectedTemplateId = templateResolverData?.lookupByName.template?.id;

  const loading = resolvingInnovationPack || resolvingTemplate || loadingInnovationPack;

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
            {loading && <Loading />}
            {!loading && templatesSetId && (
              <TemplatesAdmin templatesSetId={templatesSetId} templateId={selectedTemplateId} baseUrl={baseUrl} />
            )}
          </PageContentColumn>
        </PageContent>
      </InnovationPackProfileLayout>
    </>
  );
};

export default InnovationPackProfilePage;
