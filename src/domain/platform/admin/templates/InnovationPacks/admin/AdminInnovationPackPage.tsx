import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchAdminInnovationPackQuery,
  useAdminInnovationPackQuery,
  useInnovationPackResolveIdQuery,
  useOrganizationsListQuery,
  useUpdateInnovationPackMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import useBackToParentPage from '../../../../../../core/routing/deprecated/useBackToParentPage';
import AdminInnovationTemplatesSection from '../../InnovationTemplates/AdminInnovationTemplatesSection';
import AdminPostTemplatesSection from '../../PostTemplates/AdminPostTemplatesSection';
import AdminWhiteboardTemplatesSection from '../../WhiteboardTemplates/AdminWhiteboardTemplatesSection';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm';
import { StorageConfigContextProvider } from '../../../../../storage/StorageBucket/StorageConfigContext';
import InnovationPackProfileLayout from '../../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfileLayout';
import PageContentColumn from '../../../../../../core/ui/content/PageContentColumn';
import PageContent from '../../../../../../core/ui/content/PageContent';
import PageContentBlockSeamless from '../../../../../../core/ui/content/PageContentBlockSeamless';
import PageContentBlock from '../../../../../../core/ui/content/PageContentBlock';
import AdminCalloutTemplatesSection from '../../CalloutTemplates/AdminCalloutTemplatesSection';
import AdminCommunityGuidelinesTemplatesSection from '../../CommunityGuidelines/AdminCommunityGuidelinesTemplatesSection';

export enum RoutePaths {
  postTemplatesRoutePath = 'post-templates',
  whiteboardTemplatesRoutePath = 'whiteboard-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
  calloutTemplatesRoutePath = 'callout-templates',
  communityGuidelinesTemplatesRoutePath = 'community-guidelines-templates',
}

interface AdminInnovationPackPageProps {
  editTemplates?: boolean;
}

const AdminInnovationPackPage: FC<AdminInnovationPackPageProps> = ({ editTemplates }) => {
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

  const innovationPackRoute = data?.lookup.innovationPack?.profile.url ?? '';
  const [backFromTemplateDialog, buildLink] = useBackToParentPage(innovationPackRoute);

  const {
    postTemplates,
    whiteboardTemplates,
    innovationFlowTemplates,
    calloutTemplates,
    communityGuidelinesTemplates,
    id: templatesSetID,
  } = data?.lookup.innovationPack?.templates ?? {};

  const { data: organizationsList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const organizations = useMemo(
    () =>
      sortBy(
        organizationsList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
        org => org.name
      ),
    [organizationsList]
  );

  const [updateInnovationPack, { loading: updating }] = useUpdateInnovationPackMutation();

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

  const innovationPack = data?.lookup.innovationPack;

  const isLoading = resolving || loadingInnovationPack || loadingOrganizations || updating;

  return (
    <InnovationPackProfileLayout
      innovationPack={innovationPack}
      loading={resolving || loadingInnovationPack}
      showSettings
      settings
    >
      {innovationPackId && (
        <>
          <StorageConfigContextProvider locationType="innovationPack" innovationPackId={innovationPackId}>
            <PageContent>
              <PageContentColumn columns={12}>
                <PageContentBlock>
                  <InnovationPackForm
                    nameID={innovationPack?.nameID}
                    profile={innovationPack?.profile}
                    providerId={innovationPack?.provider?.id}
                    organizations={organizations}
                    onSubmit={handleSubmit}
                    loading={isLoading}
                    listedInStore={innovationPack?.listedInStore}
                    searchVisibility={innovationPack?.searchVisibility}
                  />
                </PageContentBlock>
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
                <PageContentBlockSeamless disablePadding>
                  <AdminPostTemplatesSection
                    templateId={postNameId}
                    templatesSetId={templatesSetID}
                    templates={postTemplates}
                    onCloseTemplateDialog={backFromTemplateDialog}
                    refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId })]}
                    buildTemplateLink={({ id }) =>
                      buildLink(`${innovationPackRoute}/${RoutePaths.postTemplatesRoutePath}/${id}`)
                    }
                    edit={editTemplates}
                    loadInnovationPacks={() => {}}
                    loadingInnovationPacks={isLoading}
                    innovationPacks={[]}
                    canImportTemplates={false}
                  />
                </PageContentBlockSeamless>
              </PageContentColumn>
            </PageContent>
          </StorageConfigContextProvider>
        </>
      )}
    </InnovationPackProfileLayout>
  );
};

export default AdminInnovationPackPage;
