import { FC } from 'react';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import TemplatesAdmin from '@/domain/templates/components/TemplatesAdmin/TemplatesAdmin';
import { SettingsSection } from '../layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from './SpaceSettingsLayout';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';

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
    TemplateType.Post,
    TemplateType.Whiteboard,
  ],
  delete: [
    TemplateType.Callout,
    TemplateType.Collaboration,
    TemplateType.CommunityGuidelines,
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
  const { templateId, loading: resolvingTemplate } = useUrlResolver();
  const { space } = useSpace();
  const about = space.about;
  const spaceUrl = about.profile.url;

  const { data, loading: loadingSpace } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const templatesSetId = data?.lookup.space?.templatesManager?.templatesSet?.id;
  const baseUrl = `${buildSettingsUrl(spaceUrl)}/templates`;

  const loading = loadingSpace || resolvingTemplate;
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      {loading && <Loading />}
      {spaceId && !loading && templatesSetId && (
        <TemplatesAdmin
          templatesSetId={templatesSetId}
          templateId={templateId}
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
