import { useTranslation } from 'react-i18next';
import { useAdminInnovationPackQuery, useUpdateInnovationPackMutation } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import TemplatesAdmin from '@/domain/templates/components/TemplatesAdmin/TemplatesAdmin';
import InnovationPackProfileLayout from '../InnovationPackProfilePage/InnovationPackProfileLayout';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';

const TemplateTypePermissions = {
  create: [
    TemplateType.Callout,
    TemplateType.Space,
    TemplateType.CommunityGuidelines,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  edit: [
    TemplateType.Callout,
    TemplateType.Space,
    TemplateType.CommunityGuidelines,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  delete: [
    TemplateType.Callout,
    TemplateType.Space,
    TemplateType.CommunityGuidelines,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
};

const AdminInnovationPackPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { innovationPackId, templateId, loading: resolvingUrl } = useUrlResolver();

  const { data, loading: loadingInnovationPack } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackId! },
    skip: !innovationPackId,
  });
  const innovationPack = data?.lookup.innovationPack;
  const templatesSetId = innovationPack?.templatesSet?.id;

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
      refetchQueries: ['AdminInnovationPack'],
    });
    if (data?.updateInnovationPack.id) {
      notify(t('pages.admin.innovation-packs.saved-successfully'), 'success');
    }
  };

  const loading = resolvingUrl || loadingInnovationPack;

  return (
    <InnovationPackProfileLayout innovationPack={innovationPack} loading={loading} showSettings settings>
      {loading && <Loading />}
      {innovationPack && !loading && templatesSetId && (
        <>
          <StorageConfigContextProvider locationType="innovationPack" innovationPackId={innovationPackId}>
            <PageContent>
              <PageContentColumn columns={12}>
                <PageContentBlock>
                  <InnovationPackForm
                    profile={innovationPack.profile}
                    avatar={innovationPack.profile.avatar}
                    provider={innovationPack.provider}
                    onSubmit={handleSubmit}
                    loading={updatingProfile}
                    listedInStore={innovationPack.listedInStore}
                    searchVisibility={innovationPack.searchVisibility}
                  />
                </PageContentBlock>
                <TemplatesAdmin
                  templatesSetId={templatesSetId}
                  templateId={templateId}
                  baseUrl={buildInnovationPackSettingsUrl(innovationPack.profile.url)}
                  alwaysEditTemplate // When editing an Template pack, we don't want to see template preview, just go to Edit mode always
                  canCreateTemplates={templateType => TemplateTypePermissions.create.includes(templateType)}
                  canEditTemplates={templateType => TemplateTypePermissions.edit.includes(templateType)}
                  canDeleteTemplates={templateType => TemplateTypePermissions.delete.includes(templateType)}
                />
              </PageContentColumn>
            </PageContent>
          </StorageConfigContextProvider>
        </>
      )}
    </InnovationPackProfileLayout>
  );
};

export default AdminInnovationPackPage;
