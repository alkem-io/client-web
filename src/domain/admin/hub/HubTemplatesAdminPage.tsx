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

interface HubTemplatesAdminPageProps extends SettingsPageProps {
  hubId: string;
  routePrefix: string;
  aspectTemplatesRoutePath: string;
  canvasTemplatesRoutePath: string;
  edit?: boolean;
}

const PAGE_KEY_TEMPLATES = 'HubTemplatesAdmin';

const HubTemplatesAdminPage: FC<HubTemplatesAdminPageProps> = ({
  hubId,
  paths,
  routePrefix,
  aspectTemplatesRoutePath,
  canvasTemplatesRoutePath,
  edit = false,
}) => {
  const { aspectTemplateId, canvasTemplateId } = useParams();

  useAppendBreadcrumb(paths, { name: 'templates' });

  const [backFromTemplateDialog, buildLink] = useBackToParentPage(PAGE_KEY_TEMPLATES, routePrefix);

  const { data: hubTemplatesData } = useHubTemplatesQuery({
    variables: { hubId },
    skip: !hubId, // hub id can be an empty string due to some `|| ''` happening above in the tree
  });

  const [loadCanvases, { data: hubCanvasesData }] = useHubCanvasesLazyQuery({
    variables: { hubId },
  });

  const { aspectTemplates, canvasTemplates, id: templatesSetID } = hubTemplatesData?.hub.templates ?? {};
  const canvases = hubCanvasesData?.hub.context?.canvases;

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
    </HubSettingsLayout>
  );
};

export default HubTemplatesAdminPage;
