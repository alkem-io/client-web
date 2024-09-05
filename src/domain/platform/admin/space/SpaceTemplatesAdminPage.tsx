import { FC } from 'react';
import { useSpaceTemplatesAdminQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import Loading from '../../../../core/ui/loading/Loading';
import { buildSettingsUrl } from '../../../../main/routing/urlBuilders';
import TemplatesAdmin from '../../../templates/_new/components/TemplatesAdmin/TemplatesAdmin';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from './SpaceSettingsLayout';

interface SpaceTemplatesAdminPageProps extends SettingsPageProps {
  spaceId: string;
  routePrefix: string;
}

const SpaceTemplatesAdminPage: FC<SpaceTemplatesAdminPageProps> = ({ spaceId, routePrefix }) => {
  const { postNameId, whiteboardNameId, innovationTemplateId, calloutTemplateId, communityGuidelinesNameId } =
    useUrlParams();
  const templateSelected =
    communityGuidelinesNameId || calloutTemplateId || innovationTemplateId || postNameId || whiteboardNameId;

  const { data, loading } = useSpaceTemplatesAdminQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const templatesSetId = data?.lookup.space?.library?.id;
  const baseUrl = `${buildSettingsUrl(data?.lookup.space?.profile.url ?? '')}/templates`;

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Templates} tabRoutePrefix={`${routePrefix}/../`}>
      {loading && <Loading />}
      {spaceId && !loading && templatesSetId && (
        <TemplatesAdmin
          templatesSetId={templatesSetId}
          templateId={templateSelected}
          baseUrl={baseUrl}
          indexUrl={baseUrl}
          canDeleteTemplates
          canCreateTemplates
          canEditTemplates
          canImportTemplates
          importTemplateOptions={{
            // Indicated here for clarity, but these parameters are not really needed
            // Do not import from any templateSet, just allow importing from the platform library
            templatesSetId: undefined,
            allowBrowsePlatformTemplates: true,
          }}
        />
      )}
    </SpaceSettingsLayout>
  );
};

export default SpaceTemplatesAdminPage;
