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

interface SpaceTemplatesAdminPageProps extends SettingsPageProps {
  spaceId: string;
  routePrefix: string;
}

const SpaceTemplatesAdminPage: FC<SpaceTemplatesAdminPageProps> = ({ spaceId, routePrefix }) => {
  const { templateNameId } = useUrlParams();

  const { data, loading: loadingSpace } = useSpaceTemplatesAdminQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const templatesSetId = data?.lookup.space?.library?.id;
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
          canDeleteTemplates
          canCreateTemplates
          canEditTemplates
          canImportTemplates
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
