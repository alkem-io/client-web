import React, { FC } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { refetchHubTemplatesQuery, useHubTemplatesQuery } from '../../../hooks/generated/graphql';
import { useParams } from 'react-router-dom';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import AdminAspectTemplatesSection from '../templates/AspectTemplates/AdminAspectTemplatesSection';

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
  edit = false,
}) => {
  const { aspectTemplateId } = useParams();

  useAppendBreadcrumb(paths, { name: 'templates' });

  const [backFromAspectTemplateDialog, buildLink] = useBackToParentPage(PAGE_KEY_TEMPLATES, routePrefix);

  const { data } = useHubTemplatesQuery({
    variables: { hubId },
    skip: !hubId, // hub id can be an empty string due to some `|| ''` happening above in the tree
  });

  const { aspectTemplates, id: templatesSetID } = data?.hub.templates ?? {};

  return (
    <HubSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      <AdminAspectTemplatesSection
        aspectTemplateId={aspectTemplateId}
        templatesSetId={templatesSetID}
        aspectTemplates={aspectTemplates}
        onCloseAspectTemplateDialog={backFromAspectTemplateDialog}
        refetchQueries={[refetchHubTemplatesQuery({ hubId })]}
        buildAspectTemplateLink={({ id }) => buildLink(`${routePrefix}/${aspectTemplatesRoutePath}/${id}`)}
        edit={edit}
      />
    </HubSettingsLayout>
  );
};

export default HubTemplatesAdminPage;
