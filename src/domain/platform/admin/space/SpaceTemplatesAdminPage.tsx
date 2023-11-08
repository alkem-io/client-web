import React, { FC, useMemo } from 'react';
import SpaceSettingsLayout from './SpaceSettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import {
  refetchAdminSpaceTemplatesQuery,
  useAdminSpaceTemplatesQuery,
  useInnovationPacksLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useParams } from 'react-router-dom';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import AdminPostTemplatesSection from '../templates/PostTemplates/AdminPostTemplatesSection';
import Gutters from '../../../../core/ui/grid/Gutters';
import AdminInnovationTemplatesSection from '../templates/InnovationTemplates/AdminInnovationTemplatesSection';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import AdminWhiteboardTemplatesSection from '../templates/WhiteboardTemplates/AdminWhiteboardTemplatesSection';

interface SpaceTemplatesAdminPageProps extends SettingsPageProps {
  spaceId: string;
  routePrefix: string;
  postTemplatesRoutePath: string;
  whiteboardTemplatesRoutePath: string;
  innovationTemplatesRoutePath: string;
  edit?: boolean;
}

const SpaceTemplatesAdminPage: FC<SpaceTemplatesAdminPageProps> = ({
  spaceId,
  routePrefix,
  postTemplatesRoutePath,
  whiteboardTemplatesRoutePath,
  innovationTemplatesRoutePath,
  edit = false,
}) => {
  const { postTemplateId, whiteboardTemplateId, innovationTemplateId } = useParams();

  const [backFromTemplateDialog, buildLink] = useBackToParentPage(routePrefix);

  const { data: spaceTemplatesData } = useAdminSpaceTemplatesQuery({
    variables: { spaceId },
    skip: !spaceId, // space id can be an empty string due to some `|| ''` happening above in the tree
  });

  const [loadInnovationPacks, { data: innovationPacks, loading: loadingInnovationPacks }] =
    useInnovationPacksLazyQuery();

  const {
    postTemplates,
    whiteboardTemplates,
    innovationFlowTemplates,
    id: templatesSetID,
    authorization: templateSetAuth,
  } = spaceTemplatesData?.space.templates ?? {};
  const canImportTemplates = templateSetAuth?.myPrivileges?.includes(AuthorizationPrivilege.Create) ?? false;

  const postInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.postTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.postTemplates || [],
      }));
  }, [innovationPacks]);

  const whiteboardInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.whiteboardTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.whiteboardTemplates || [],
      }));
  }, [innovationPacks]);

  const lifecycleInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.innovationFlowTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.innovationFlowTemplates || [],
      }));
  }, [innovationPacks]);

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      <Gutters>
        <AdminPostTemplatesSection
          templateId={postTemplateId}
          templatesSetId={templatesSetID}
          templates={postTemplates}
          onCloseTemplateDialog={backFromTemplateDialog}
          refetchQueries={[refetchAdminSpaceTemplatesQuery({ spaceId })]}
          buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${postTemplatesRoutePath}/${id}`)}
          edit={edit}
          loadInnovationPacks={loadInnovationPacks}
          loadingInnovationPacks={loadingInnovationPacks}
          innovationPacks={postInnovationPacks}
          canImportTemplates={canImportTemplates}
        />
        <AdminWhiteboardTemplatesSection
          templateId={whiteboardTemplateId}
          templatesSetId={templatesSetID}
          templates={whiteboardTemplates}
          onCloseTemplateDialog={backFromTemplateDialog}
          refetchQueries={[refetchAdminSpaceTemplatesQuery({ spaceId })]}
          buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${whiteboardTemplatesRoutePath}/${id}`)}
          edit={edit}
          loadInnovationPacks={loadInnovationPacks}
          loadingInnovationPacks={loadingInnovationPacks}
          innovationPacks={whiteboardInnovationPacks}
          canImportTemplates={canImportTemplates}
        />
        <AdminInnovationTemplatesSection
          templateId={innovationTemplateId}
          templatesSetId={templatesSetID}
          templates={innovationFlowTemplates}
          onCloseTemplateDialog={backFromTemplateDialog}
          refetchQueries={[refetchAdminSpaceTemplatesQuery({ spaceId })]}
          buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${innovationTemplatesRoutePath}/${id}`)}
          edit={edit}
          loadInnovationPacks={loadInnovationPacks}
          loadingInnovationPacks={loadingInnovationPacks}
          innovationPacks={lifecycleInnovationPacks}
          canImportTemplates={canImportTemplates}
        />
      </Gutters>
    </SpaceSettingsLayout>
  );
};

export default SpaceTemplatesAdminPage;
