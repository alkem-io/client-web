import React, { FC } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import {
  refetchHubTemplatesQuery,
  useHubCanvasesLazyQuery,
  useHubTemplatesQuery,
} from '../../../hooks/generated/graphql';
import { useParams } from 'react-router-dom';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import AdminAspectTemplatesSection from '../templates/AspectTemplates/AdminAspectTemplatesSection';
import AdminCanvasTemplatesSection from '../templates/CanvasTemplates/AdminCanvasTemplatesSection';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import AdminInnovationTemplatesSection from '../templates/InnovationTemplates/AdminInnovationTemplatesSection';
import { getCanvasCallout } from '../../../containers/canvas/get-canvas-callout';

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
  paths,
  routePrefix,
  aspectTemplatesRoutePath,
  canvasTemplatesRoutePath,
  innovationTemplatesRoutePath,
  edit = false,
}) => {
  const { aspectTemplateId, canvasTemplateId, innovationTemplateId } = useParams();

  useAppendBreadcrumb(paths, { name: 'templates' });

  const [backFromTemplateDialog, buildLink] = useBackToParentPage(routePrefix);

  const { data: hubTemplatesData } = useHubTemplatesQuery({
    variables: { hubId },
    skip: !hubId, // hub id can be an empty string due to some `|| ''` happening above in the tree
  });

  const [loadCanvases, { data: hubCanvasesData }] = useHubCanvasesLazyQuery({
    variables: { hubId },
  });

  const {
    aspectTemplates,
    canvasTemplates,
    lifecycleTemplates,
    id: templatesSetID,
  } = hubTemplatesData?.hub.templates ?? {};
  const canvases = getCanvasCallout(hubCanvasesData?.hub.collaboration?.callouts)?.canvases;

  return (
    <HubSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      <AdminAspectTemplatesSection
        templateId={aspectTemplateId}
        templatesSetId={templatesSetID}
        templates={aspectTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${aspectTemplatesRoutePath}/${id}`)}
        edit={edit}
      />
      <SectionSpacer />
      <AdminCanvasTemplatesSection
        templateId={canvasTemplateId}
        templatesSetId={templatesSetID}
        templates={canvasTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${canvasTemplatesRoutePath}/${id}`)}
        edit={edit}
        loadCanvases={loadCanvases}
        canvases={canvases}
      />
      <SectionSpacer />
      <AdminInnovationTemplatesSection
        templateId={innovationTemplateId}
        templatesSetId={templatesSetID}
        templates={lifecycleTemplates}
        onCloseTemplateDialog={backFromTemplateDialog}
        refetchQueries={[refetchHubTemplatesQuery({ hubId })]}
        buildTemplateLink={({ id }) => buildLink(`${routePrefix}/${innovationTemplatesRoutePath}/${id}`)}
        edit={edit}
      />
    </HubSettingsLayout>
  );
};

export default HubTemplatesAdminPage;
