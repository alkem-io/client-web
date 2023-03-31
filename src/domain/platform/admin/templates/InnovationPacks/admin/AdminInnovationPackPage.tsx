import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { sortBy } from 'lodash';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  refetchAdminInnovationPackQuery,
  useAdminInnovationPackQuery,
  useCreateInnovationPackMutation,
  useOrganizationsListQuery,
  useUpdateInnovationPackMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import Gutters from '../../../../../../core/ui/grid/Gutters';
import RouterLink from '../../../../../../core/ui/link/RouterLink';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import useBackToParentPage from '../../../../../shared/utils/useBackToParentPage';
import AdminLayout from '../../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../../layout/toplevel/constants';
import AdminInnovationTemplatesSection from '../../InnovationTemplates/AdminInnovationTemplatesSection';
import AdminPostTemplatesSection from '../../PostTemplates/AdminPostTemplatesSection';
import AdminWhiteboardTemplatesSection from '../../WhiteboardTemplates/AdminWhiteboardTemplatesSection';
import { RoutePaths } from './AdminInnovationPackRoutes';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm';

interface AdminInnovationPackPageProps {
  isNew?: boolean;
  edit?: boolean;
}

const AdminInnovationPackPage: FC<AdminInnovationPackPageProps> = ({ isNew = false, edit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const {
    innovationPackNameId = '',
    aspectNameId = '',
    whiteboardNameId = '',
    innovationTemplateId = '',
  } = useUrlParams();

  const routePrefix = `/admin/innovation-packs/${innovationPackNameId}`; //!!

  const [backFromTemplateDialog, buildLink] = useBackToParentPage(routePrefix);

  const { data, loading } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackNameId },
    errorPolicy: 'ignore',
    skip: !innovationPackNameId || isNew,
  });

  const {
    postTemplates,
    whiteboardTemplates,
    innovationFlowTemplates,
    id: templatesSetID,
  } = data?.platform.library.innovationPack?.templates ?? {};

  const { data: organizationsList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const organizations = useMemo(
    () =>
      sortBy(
        organizationsList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
        org => org.name
      ),
    [organizationsList]
  );

  const [createInnovationPack, { loading: creating }] = useCreateInnovationPackMutation();
  const [updateInnovationPack, { loading: updating }] = useUpdateInnovationPackMutation();

  const handleSubmit = async (formData: InnovationPackFormValues) => {
    console.log('formData', formData);

    if (isNew) {
      const { data } = await createInnovationPack({
        variables: {
          packData: {
            nameID: formData.nameID,
            providerID: formData.providerId,
            profileData: {
              displayName: formData.profile.displayName,
              description: formData.profile.description,
            },
          },
        },
      });
      if (data?.createInnovationPackOnLibrary.nameID) {
        navigate(`../${data?.createInnovationPackOnLibrary.nameID}`);
      }
    } else {
      const { data } = await updateInnovationPack({
        variables: {
          packData: {
            ID: innovationPackNameId,
            providerOrgID: formData.providerId,
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
    }
  };

  const innovationPack = data?.platform.library.innovationPack;

  const isLoading = loading || loadingOrganizations || creating || updating;
  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <Button component={RouterLink} to="../" startIcon={<ArrowBackIcon />}>
        {t('pages.admin.innovation-packs.back-button')}
      </Button>
      <InnovationPackForm
        isNew={isNew}
        nameID={innovationPack?.nameID}
        profile={innovationPack?.profile}
        providerId={innovationPack?.provider?.id}
        organizations={organizations}
        onSubmit={handleSubmit}
        loading={isLoading}
      />
      {!isNew && (
        <Gutters>
          <AdminPostTemplatesSection
            templateId={aspectNameId}
            templatesSetId={templatesSetID}
            templates={postTemplates}
            onCloseTemplateDialog={backFromTemplateDialog}
            refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId: innovationPackNameId })]}
            buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${RoutePaths.aspectTemplatesRoutePath}/${id}`)}
            edit={edit}
            loadInnovationPacks={() => {}}
            loadingInnovationPacks={isLoading}
            innovationPacks={[]}
            canImportTemplates={false}
          />
          <AdminWhiteboardTemplatesSection
            templateId={whiteboardNameId}
            templatesSetId={templatesSetID}
            templates={whiteboardTemplates}
            onCloseTemplateDialog={backFromTemplateDialog}
            refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId: innovationPackNameId })]}
            buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${RoutePaths.whiteboardTemplatesRoutePath}/${id}`)}
            edit={edit}
            loadCanvases={() => {}}
            canvases={[]}
            getParentCalloutId={() => undefined}
            loadInnovationPacks={() => {}}
            loadingInnovationPacks={isLoading}
            innovationPacks={[]}
            canImportTemplates={false}
          />
          <AdminInnovationTemplatesSection
            templateId={innovationTemplateId}
            templatesSetId={templatesSetID}
            templates={innovationFlowTemplates}
            onCloseTemplateDialog={backFromTemplateDialog}
            refetchQueries={[refetchAdminInnovationPackQuery({ innovationPackId: innovationPackNameId })]}
            buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${RoutePaths.innovationTemplatesRoutePath}/${id}`)}
            edit={edit}
            loadInnovationPacks={() => {}}
            loadingInnovationPacks={isLoading}
            innovationPacks={[]}
            canImportTemplates={false}
          />
        </Gutters>
      )}
    </AdminLayout>
  );
};

export default AdminInnovationPackPage;
