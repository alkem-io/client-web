import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminInnovationPackQuery,
  useInnovationPackResolveIdQuery,
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

export enum RoutePaths {
  postTemplatesRoutePath = 'post-templates',
  whiteboardTemplatesRoutePath = 'whiteboard-templates',
  innovationTemplatesRoutePath = 'innovation-templates',
  calloutTemplatesRoutePath = 'callout-templates',
  communityGuidelinesTemplatesRoutePath = 'community-guidelines-templates',
  collaborationTemplatesRoutePath = 'collaboration-templates',
}

interface AdminInnovationPackPageProps {}

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
    collaborationTemplateId,
  } = useUrlParams();
  const templateSelected =
    communityGuidelinesNameId || calloutTemplateId || innovationTemplateId || postNameId || whiteboardNameId || collaborationTemplateId;

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
