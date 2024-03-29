import React, { FC, useMemo } from 'react';
import SpaceEditForm, { SpaceEditFormValuesType } from '../../spaceEditForm/SpaceEditForm';
import {
  useOrganizationsListQuery,
  useSpaceHostQuery,
  useUpdateSpaceMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../SpaceContext/useSpace';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import EditVisualsView from '../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import { sortBy } from 'lodash';
import { buildOrganizationUrl } from '../../../../../main/routing/urlBuilders';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

export const SpaceProfile: FC = () => {
  const { spaceNameId, ...space } = useSpace();
  const { data: organizationList } = useOrganizationsListQuery();
  const { data: hostOrganization } = useSpaceHostQuery({ variables: { spaceId: spaceNameId }, skip: !spaceNameId });
  const notify = useNotification();
  const { t } = useTranslation();

  const [updateSpace, { loading }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
    [organizationList]
  );

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: SpaceEditFormValuesType) => {
    const { name: displayName, tagline, tagsets, references } = values;
    updateSpace({
      variables: {
        input: {
          profileData: {
            displayName,
            tagline,
            location: formatDatabaseLocation(values.location),
            references: references?.map(reference => ({
              ID: reference.id ?? '',
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
            tagsets: tagsets.map(tagset => ({ ID: tagset.id, name: tagset.name, tags: tagset.tags })),
          },
          ID: spaceNameId,
        },
      },
    });
  };

  const organizationsSorted = useMemo(() => sortBy(organizations, org => org.name), [organizations]);

  const host = useMemo(() => {
    const host = hostOrganization?.space.host;
    if (!host) {
      return undefined;
    }
    const url = buildOrganizationUrl(host.nameID);
    return {
      ...host,
      url,
    };
  }, [hostOrganization]);

  const visuals = space.profile.visuals ?? [];

  return (
    <PageContentColumn columns={12}>
      <SpaceEditForm
        edit
        name={space.profile.displayName}
        nameID={spaceNameId}
        hostID={hostOrganization?.space.host?.id}
        tagset={space.profile.tagset}
        context={space.context}
        profile={space.profile}
        organizations={organizationsSorted}
        visibility={space.license.visibility}
        host={host}
        onSubmit={onSubmit}
        loading={loading}
      />
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.visuals')} />
        <EditVisualsView visuals={visuals} />
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceProfile;
