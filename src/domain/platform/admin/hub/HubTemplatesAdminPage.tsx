import React, { FC, useCallback, useMemo } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import {
  refetchAdminHubTemplatesQuery,
  useAdminHubTemplatesQuery,
  useHubCanvasesLazyQuery,
  useInnovationPacksLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useParams } from 'react-router-dom';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import AdminAspectTemplatesSection from '../templates/AspectTemplates/AdminAspectTemplatesSection';
import AdminCanvasTemplatesSection from '../templates/CanvasTemplates/AdminCanvasTemplatesSection';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import AdminInnovationTemplatesSection from '../templates/InnovationTemplates/AdminInnovationTemplatesSection';
import { getAllCanvasesOnCallouts } from '../../../collaboration/canvas/containers/getCanvasCallout';
import { AuthorizationPrivilege, CalloutType } from '../../../../core/apollo/generated/graphql-schema';

interface HubTemplatesAdminPageProps extends SettingsPageProps {
  hubId: string;
  routePrefix: string;
  aspectTemplatesRoutePath: string;
  canvasTemplatesRoutePath: string;
  innovationTemplatesRoutePath: string;
  edit?: boolean;
}

const HubTemplatesAdminPage: FC<HubTemplatesAdminPageProps> = ({
  hubId,
  routePrefix,
  aspectTemplatesRoutePath,
  canvasTemplatesRoutePath,
  innovationTemplatesRoutePath,
  edit = false,
}) => {
  const { aspectTemplateId, canvasTemplateId, innovationTemplateId } = useParams();

  const [backFromTemplateDialog, buildLink] = useBackToParentPage(routePrefix);

  const { data: hubTemplatesData } = useAdminHubTemplatesQuery({
    variables: { hubId },
    skip: !hubId, // hub id can be an empty string due to some `|| ''` happening above in the tree
  });

  const [loadCanvases, { data: hubCanvasesData }] = useHubCanvasesLazyQuery({
    variables: { hubId },
  });

  const [loadInnovationPacks, { data: innovationPacks, loading: loadingInnovationPacks }] =
    useInnovationPacksLazyQuery();

  const {
    aspectTemplates,
    canvasTemplates,
    lifecycleTemplates,
    id: templatesSetID,
    authorization: templateSetAuth,
  } = hubTemplatesData?.hub.templates ?? {};
  const canImportTemplates = templateSetAuth?.myPrivileges?.includes(AuthorizationPrivilege.Create) ?? false;

  // assuming we'll provide templates for the canvases only from hub callout canvases
  const canvases = getAllCanvasesOnCallouts(hubCanvasesData?.hub.collaboration?.callouts);
  const findParentCalloutId = useCallback(
    (canvasId: string | undefined): string | undefined => {
      const parentCallout = hubCanvasesData?.hub.collaboration?.callouts?.find(
        x => x.type === CalloutType.Canvas && x.canvases?.some(x => x.id === canvasId)
      );
      return parentCallout?.id;
    },
    [hubCanvasesData?.hub.collaboration?.callouts]
  );

  const aspectInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.aspectTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.aspectTemplates || [],
      }));
  }, [innovationPacks]);

  const canvasInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.canvasTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.canvasTemplates || [],
      }));
  }, [innovationPacks]);

  const lifecycleInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.lifecycleTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.lifecycleTemplates || [],
      }));
  }, [innovationPacks]);

  return (
    <HubSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      <AdminAspectTemplatesSection
        templateId={aspectTemplateId}
        templatesSetId={templatesSetID}
        templates={aspectTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchAdminHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${aspectTemplatesRoutePath}/${id}`)}
        edit={edit}
        loadInnovationPacks={loadInnovationPacks}
        loadingInnovationPacks={loadingInnovationPacks}
        innovationPacks={aspectInnovationPacks}
        canImportTemplates={canImportTemplates}
      />
      <SectionSpacer />
      <AdminCanvasTemplatesSection
        templateId={canvasTemplateId}
        templatesSetId={templatesSetID}
        templates={canvasTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchAdminHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${canvasTemplatesRoutePath}/${id}`)}
        edit={edit}
        loadCanvases={loadCanvases}
        canvases={canvases}
        getParentCalloutId={findParentCalloutId}
        loadInnovationPacks={loadInnovationPacks}
        loadingInnovationPacks={loadingInnovationPacks}
        innovationPacks={canvasInnovationPacks}
        canImportTemplates={canImportTemplates}
      />
      <SectionSpacer />
      <AdminInnovationTemplatesSection
        templateId={innovationTemplateId}
        templatesSetId={templatesSetID}
        templates={lifecycleTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchAdminHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${innovationTemplatesRoutePath}/${id}`)}
        edit={edit}
        loadInnovationPacks={loadInnovationPacks}
        loadingInnovationPacks={loadingInnovationPacks}
        innovationPacks={lifecycleInnovationPacks}
        canImportTemplates={canImportTemplates}
      />
    </HubSettingsLayout>
  );
};

export default HubTemplatesAdminPage;
