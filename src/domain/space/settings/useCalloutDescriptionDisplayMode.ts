import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';
import { defaultSpaceSettings } from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';

export const useCalloutDescriptionDisplayMode = (spaceId: string): boolean => {
  const { data } = useSpaceSettingsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const displayMode =
    data?.lookup?.space?.settings?.layout?.calloutDescriptionDisplayMode ??
    defaultSpaceSettings.layout.calloutDescriptionDisplayMode;

  return displayMode === CalloutDescriptionDisplayMode.Collapsed;
};
