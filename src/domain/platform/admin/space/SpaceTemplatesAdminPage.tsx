import { FC } from 'react';
import {
  useSpaceTemplatesAdminQuery
} from '../../../../core/apollo/generated/apollo-hooks';
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
  editTemplateMode?: boolean;
}

const SpaceTemplatesAdminPage: FC<SpaceTemplatesAdminPageProps> = ({
  spaceId,
  routePrefix,
  editTemplateMode
}) => {

  const {
    postNameId,
    whiteboardNameId,
    innovationTemplateId,
    calloutTemplateId,
    communityGuidelinesNameId,
  } = useUrlParams();
  const templateSelected = communityGuidelinesNameId || calloutTemplateId || innovationTemplateId || postNameId || whiteboardNameId;

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
          editTemplates={editTemplateMode}
          canDeleteTemplates
          canCreateTemplates
        />
      )}
    </SpaceSettingsLayout>
  );
};

export default SpaceTemplatesAdminPage;
