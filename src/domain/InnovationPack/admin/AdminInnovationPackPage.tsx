import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminInnovationPackQuery,
  useInnovationPackResolveIdQuery,
  useTemplateUrlResolverQuery,
  useUpdateInnovationPackMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import Loading from '../../../core/ui/loading/Loading';
import { useNotification } from '../../../core/ui/notifications/useNotification';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';
import TemplatesAdmin from '../../templates/components/TemplatesAdmin/TemplatesAdmin';
import InnovationPackProfileLayout from '../InnovationPackProfilePage/InnovationPackProfileLayout';
import { buildInnovationPackSettingsUrl } from '../../../main/routing/urlBuilders';

interface AdminInnovationPackPageProps {}

const AdminInnovationPackPage: FC<AdminInnovationPackPageProps> = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { innovationPackNameId, templateNameId } = useUrlParams();

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

  const { data, loading: loadingInnovationPack } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackId! },
    skip: !innovationPackId,
  });

  const innovationPack = data?.lookup.innovationPack;
  const templatesSetId = innovationPack?.templatesSet?.id;

  const { data: templateResolverData, loading: resolvingTemplate } = useTemplateUrlResolverQuery({
    variables: { templatesSetId: templatesSetId!, templateNameId: templateNameId! },
    skip: !templatesSetId || !templateNameId,
  });
  const selectedTemplateId = templateResolverData?.lookupByName.template?.id;

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

  const loading = resolvingInnovationPack || resolvingTemplate || loadingInnovationPack;

  return (
    <InnovationPackProfileLayout innovationPack={innovationPack} loading={loading} showSettings settings>
      {loading && <Loading />}
      {innovationPackId && !loading && templatesSetId && (
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
                  templatesSetId={templatesSetId}
                  templateId={selectedTemplateId}
                  baseUrl={buildInnovationPackSettingsUrl(innovationPack.profile.url)}
                  alwaysEditTemplate // When editing an Innovation pack, we don't want to see template preview, just go to Edit mode always
                  canDeleteTemplates
                  canCreateTemplates
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
