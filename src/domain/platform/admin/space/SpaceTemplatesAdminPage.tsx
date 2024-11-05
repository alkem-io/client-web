import { FC } from 'react';
import {
  useSpaceTemplatesAdminQuery,
  useTemplateUrlResolverQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import Loading from '../../../../core/ui/loading/Loading';
import { buildSettingsUrl } from '../../../../main/routing/urlBuilders';
import TemplatesAdmin from '../../../templates/components/TemplatesAdmin/TemplatesAdmin';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from './SpaceSettingsLayout';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';

interface SpaceTemplatesAdminPageProps extends SettingsPageProps {
  spaceId: string;
  routePrefix: string;
}

const TemplateTypePermissions = {
  create: [
    TemplateType.Callout,
    TemplateType.Collaboration,
    TemplateType.CommunityGuidelines,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  edit: [
    TemplateType.Callout,
    TemplateType.Collaboration,
    TemplateType.CommunityGuidelines,
    TemplateType.InnovationFlow,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  delete: [
    TemplateType.Callout,
    TemplateType.Collaboration,
    TemplateType.CommunityGuidelines,
    TemplateType.InnovationFlow,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  import: [
    TemplateType.Callout,
    TemplateType.Collaboration,
    TemplateType.CommunityGuidelines,
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
};

const SpaceTemplatesAdminPage: FC<SpaceTemplatesAdminPageProps> = ({ spaceId, routePrefix }) => {
  const { templateNameId } = useUrlParams();

  const { data, loading: loadingSpace } = useSpaceTemplatesAdminQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const templatesSetId = data?.lookup.space?.templatesManager?.templatesSet?.id;
  const baseUrl = `${buildSettingsUrl(data?.lookup.space?.profile.url ?? '')}/templates`;

  const { data: templateResolverData, loading: resolvingTemplate } = useTemplateUrlResolverQuery({
    variables: { templatesSetId: templatesSetId!, templateNameId: templateNameId! },
    skip: !templatesSetId || !templateNameId,
  });
  const selectedTemplateId = templateResolverData?.lookupByName.template?.id;

  const loading = loadingSpace || resolvingTemplate;
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      {loading && <Loading />}
      {spaceId && !loading && templatesSetId && (
        <TemplatesAdmin
          templatesSetId={templatesSetId}
          templateId={selectedTemplateId}
          baseUrl={baseUrl}
          canCreateTemplates={templateType => TemplateTypePermissions.create.includes(templateType)}
          canEditTemplates={templateType => TemplateTypePermissions.edit.includes(templateType)}
          canDeleteTemplates={templateType => TemplateTypePermissions.delete.includes(templateType)}
          canImportTemplates={templateType => TemplateTypePermissions.import.includes(templateType)}
          importTemplateOptions={{
            enablePlatformTemplates: true,
            disableSpaceTemplates: true,
          }}
        />
      )}
    </SpaceSettingsLayout>
  );
};

export default SpaceTemplatesAdminPage;
