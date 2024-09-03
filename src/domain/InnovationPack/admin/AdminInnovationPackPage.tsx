import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchAdminInnovationPackQuery,
  useAdminInnovationPackQuery,
  useAllTemplatesInTemplatesSetQuery,
  useInnovationPackResolveIdQuery,
  useOrganizationsListQuery,
  useUpdateInnovationPackMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useNotification } from '../../../core/ui/notifications/useNotification';
import useBackToParentPage from '../../../core/routing/deprecated/useBackToParentPage';
import AdminPostTemplatesSection from '../../templates/admin/PostTemplates/AdminPostTemplatesSection';
import AdminWhiteboardTemplatesSection from '../../templates/admin/WhiteboardTemplates/AdminWhiteboardTemplatesSection';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';
import InnovationPackProfileLayout from '../InnovationPackProfilePage/InnovationPackProfileLayout';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentBlockSeamless from '../../../core/ui/content/PageContentBlockSeamless';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import AdminCommunityGuidelinesTemplatesSection from '../../templates/admin/CommunityGuidelines/AdminCommunityGuidelinesTemplatesSection';
import InnovationPackForm, { InnovationPackFormValues } from '../../platform/admin/InnovationPacks/InnovationPackForm';
import AdminCalloutTemplatesSection from '../../templates/admin/CalloutTemplates/AdminCalloutTemplatesSection';
import AdminInnovationTemplatesSection from '../../templates/admin/InnovationTemplates/AdminInnovationTemplatesSection';
import TemplatesAdmin from '../../templates/_new/components/TemplatesAdmin/TemplatesAdmin';
import Loading from '../../../core/ui/loading/Loading';

export enum RoutePaths {
  postTemplatesRoutePath = 'post-templates',
  whiteboardTemplatesRoutePath = 'whiteboard-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
  calloutTemplatesRoutePath = 'callout-templates',
  communityGuidelinesTemplatesRoutePath = 'community-guidelines-templates',
}

interface AdminInnovationPackPageProps {
}

const AdminInnovationPackPage: FC<AdminInnovationPackPageProps> = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const {
    innovationPackNameId,
    postNameId,
    whiteboardNameId,
    innovationTemplateId,
    calloutTemplateId,
    communityGuidelinesNameId,
  } = useUrlParams();
  const templateSelected = communityGuidelinesNameId || calloutTemplateId || innovationTemplateId || postNameId || whiteboardNameId;

  if (!innovationPackNameId) {
    throw new Error('Must be within Innovation Pack');
  }

  const { data: innovationPackResolverData, loading: resolving } = useInnovationPackResolveIdQuery({
    variables: { innovationPackNameId },
    skip: !innovationPackNameId,
  });

  const innovationPackId = innovationPackResolverData?.lookupByName.innovationPack?.id;
  if (innovationPackNameId && !resolving && !innovationPackId) {
    throw new Error('Innovation pack not found.');
  }

  const { data, loading: loadingInnovationPack } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackId! },
    skip: !innovationPackId,
  });

  const innovationPack = data?.lookup.innovationPack;

  const [updateInnovationPack, { loading: updatingProfile }] = useUpdateInnovationPackMutation();

  const handleSubmit = async (formData: InnovationPackFormValues) => {
    const { data } = await updateInnovationPack({
      variables: {
        packData: {
          ID: innovationPackId!,
          listedInStore: formData.listedInStore,
          searchVisibility: formData.searchVisibility,
          profileData: {
            displayName: formData.profile.displayName,
            description: formData.profile.description,
            tagsets: formData.profile.tagsets.map(tagset => ({
              ID: tagset.id,
              name: tagset.name,
              tags: tagset.tags,
            })),
            references: formData.profile.references.map(r => ({
              ID: r.id,
              name: r.name,
              description: r.description,
              uri: r.uri,
            })),
          },
        },
      },
    });
    if (data?.updateInnovationPack.nameID) {
      notify(t('pages.admin.innovation-packs.saved-successfully'), 'success');
    }
  };

  const isLoading = resolving || loadingInnovationPack;

  return (
    <InnovationPackProfileLayout
      innovationPack={innovationPack}
      loading={resolving || loadingInnovationPack}
      showSettings
      settings
    >
      {isLoading && <Loading />}
      {innovationPackId && !isLoading && innovationPack?.templates?.id && (
        <>
          <StorageConfigContextProvider locationType="innovationPack" innovationPackId={innovationPackId}>
            <PageContent>
              <PageContentColumn columns={12}>
                <PageContentBlock>
                  <InnovationPackForm
                    nameID={innovationPack.nameID}
                    profile={innovationPack.profile}
                    provider={innovationPack.provider}
                    onSubmit={handleSubmit}
                    loading={updatingProfile}
                    listedInStore={innovationPack.listedInStore}
                    searchVisibility={innovationPack.searchVisibility}
                  />
                </PageContentBlock>
                <TemplatesAdmin
                  templatesSetId={innovationPack.templates.id}
                  templateId={templateSelected}
                  baseUrl={innovationPack.profile.url}
                  canDeleteTemplates
                  canCreateTemplates
                />

                {/*
                <AdminPostTemplatesSection
                   - templateId={postNameId}
                   - templatesSetId={templatesSetID}
                   - templates={postTemplates}
                   - onCloseTemplateDialog={backFromTemplateDialog}
                   - refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                   - buildTemplateLink={({ id }) =>
                   -   buildLink(`${innovationPackRoute}/${RoutePaths.postTemplatesRoutePath}/${id}`)
                   - }
                   - edit={editTemplates}
                   - loadInnovationPacks={() => {}}
                   - loadingInnovationPacks={isLoading}
                   - innovationPacks={[]}
                   - canImportTemplates={false}
                  />


                <PageContentBlockSeamless disablePadding>
                  <AdminWhiteboardTemplatesSection
                    templateId={whiteboardNameId}
                    templatesSetId={templatesSetID}
                    templates={whiteboardTemplates}
                    onCloseTemplateDialog={backFromTemplateDialog}
                    refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                    buildTemplateLink={({ id }) =>
                      buildLink(`${innovationPackRoute}/${RoutePaths.whiteboardTemplatesRoutePath}/${id}`)
                    }
                    edit={editTemplates}
                    loadInnovationPacks={() => {}}
                    loadingInnovationPacks={isLoading}
                    innovationPacks={[]}
                    canImportTemplates={false}
                  />
                </PageContentBlockSeamless>
                <PageContentBlockSeamless disablePadding>
                  <AdminCalloutTemplatesSection
                    templateId={calloutTemplateId}
                    templatesSetId={templatesSetID}
                    templates={calloutTemplates}
                    onCloseTemplateDialog={backFromTemplateDialog}
                    refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                    buildTemplateLink={({ id }) =>
                      buildLink(`${innovationPackRoute}/${RoutePaths.calloutTemplatesRoutePath}/${id}`)
                    }
                    edit={editTemplates}
                    loadInnovationPacks={() => {}}
                    loadingInnovationPacks={isLoading}
                    innovationPacks={[]}
                    canImportTemplates={false}
                  />
                </PageContentBlockSeamless>
                <PageContentBlockSeamless disablePadding>
                  <AdminInnovationTemplatesSection
                    templateId={innovationTemplateId}
                    templatesSetId={templatesSetID}
                    templates={innovationFlowTemplates}
                    onCloseTemplateDialog={backFromTemplateDialog}
                    refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                    buildTemplateLink={({ id }) =>
                      buildLink(`${innovationPackRoute}/${RoutePaths.innovationTemplatesRoutePath}/${id}`)
                    }
                    edit={editTemplates}
                    loadInnovationPacks={() => {}}
                    loadingInnovationPacks={isLoading}
                    innovationPacks={[]}
                    canImportTemplates={false}
                  />
                </PageContentBlockSeamless>
                <PageContentBlockSeamless disablePadding>
                  <AdminCommunityGuidelinesTemplatesSection
                    templateId={communityGuidelinesNameId}
                    templatesSetId={templatesSetID}
                    templates={communityGuidelinesTemplates}
                    onCloseTemplateDialog={backFromTemplateDialog}
                    refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                    buildTemplateLink={({ id }) =>
                      buildLink(`${innovationPackRoute}/${RoutePaths.communityGuidelinesTemplatesRoutePath}/${id}`)
                    }
                    edit={editTemplates}
                    loadInnovationPacks={() => {}}
                    loadingInnovationPacks={isLoading}
                    innovationPacks={[]}
                    canImportTemplates={false}
                  />
                </PageContentBlockSeamless>
                */}
              </PageContentColumn>
            </PageContent>
          </StorageConfigContextProvider>
        </>
      )}
    </InnovationPackProfileLayout>
  );
};

export default AdminInnovationPackPage;
