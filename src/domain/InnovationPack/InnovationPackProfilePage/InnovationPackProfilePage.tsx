import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useInnovationPackProfilePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Text } from '@/core/ui/typography';
import ReferencesListSmallItem from '@/domain/common/reference/ReferencesListSmallItem';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import TemplatesAdmin from '@/domain/templates/components/TemplatesAdmin/TemplatesAdmin';
import InnovationPackProfileLayout from './InnovationPackProfileLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useScreenSize } from '@/core/ui/grid/constants';
import InnovationPackTemplateMenu from './InnovationPackTemplateMenu';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import React from 'react';

const InnovationPackProfilePage = () => {
  const { t } = useTranslation();
  const { templateId, innovationPackId, loading: resolving } = useUrlResolver();
  const { isMediumSmallScreen } = useScreenSize();

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

  const loading = resolving || loadingInnovationPack;

  return (
    <>
      <InnovationPackProfileLayout innovationPack={innovationPack} showSettings={canUpdate} loading={loading}>
        <PageContent>
          <PageContentColumn columns={isMediumSmallScreen ? 12 : 3}>
            <PageContentBlock sx={{ flexDirection: 'row' }}>
              <Gutters disablePadding width={'100%'}>
                <PageContentBlockHeader title={displayName} />
                <WrapperMarkdown disableParagraphPadding>{description ?? ''}</WrapperMarkdown>
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
                {references && !references.length && <Text>{t('components.referenceSegment.missing-references')}</Text>}
              </Gutters>
            </PageContentBlock>
            <PageContentBlock sx={{ flexDirection: 'column' }}>
              <PageContentBlockHeader title={t('common.templateTypes')} />
              <InnovationPackTemplateMenu templatesSetId={templatesSetId} />
            </PageContentBlock>
            <PageContentBlock>
              <PageContentBlockHeader title={t('community.host')} />
              <ContributorCardHorizontal profile={innovationPack?.provider?.profile} seamless />
            </PageContentBlock>
          </PageContentColumn>
          <PageContentColumn columns={isMediumSmallScreen ? 12 : 9}>
            {loading && <Loading />}
            {!loading && templatesSetId && (
              <TemplatesAdmin
                templatesSetId={templatesSetId}
                templateId={templateId}
                baseUrl={baseUrl}
                showCounts={false}
              />
            )}
          </PageContentColumn>
        </PageContent>
      </InnovationPackProfileLayout>
    </>
  );
};

export default InnovationPackProfilePage;
