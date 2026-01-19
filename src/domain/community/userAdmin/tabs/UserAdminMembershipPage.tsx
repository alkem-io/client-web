import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { ActionableContributionsView } from '@/domain/community/profile/views';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import {
  useUserContributionsQuery,
  useUserPendingMembershipsQuery,
  useUserSettingsQuery,
  useUpdateUserSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

const UserAdminMembershipPage = () => {
  const { t } = useTranslation();
  const { userId } = useUrlResolver();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, loading, refetch } = useUserContributionsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  // Fetch user settings for home space
  const { data: settingsData, loading: loadingSettings } = useUserSettingsQuery({
    variables: { userID: userId! },
    skip: !userId,
  });

  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const currentHomeSpaceId = settingsData?.lookup.user?.settings?.homeSpace?.spaceID;
  const currentAutoRedirect = settingsData?.lookup.user?.settings?.homeSpace?.autoRedirect ?? false;

  // Get L0 spaces for the dropdown
  const l0Spaces = useMemo(() => {
    if (!data?.rolesUser.spaces) {
      return [];
    }
    return data.rolesUser.spaces.map(space => ({
      id: space.id,
      displayName: space.displayName,
    }));
  }, [data]);

  const memberships = useMemo(() => {
    if (!data?.rolesUser.spaces) {
      return [];
    }

    return data.rolesUser.spaces.reduce((acc, space) => {
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: SpaceLevel.L0,
        contributorId: userId!,
        contributorType: RoleSetContributorType.User,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: userId!,
        contributorType: RoleSetContributorType.User,
        parentSpaceId: space.id,
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  // TODO: I think this is wrong, we are seeing the memberships of certain user, not ours.
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery();
  const applications = useMemo<SpaceHostedItem[] | undefined>(() => {
    if (!pendingMembershipsData || !userId) {
      return undefined;
    } else {
      return pendingMembershipsData.me.communityApplications.map(application => ({
        id: application.id,
        spaceID: application.spacePendingMembershipInfo.id,
        spaceLevel: application.spacePendingMembershipInfo.level,
        contributorId: userId,
        contributorType: RoleSetContributorType.User,
      }));
    }
  }, [userId, pendingMembershipsData]);

  const handleHomeSpaceChange = async (event: SelectChangeEvent<string>) => {
    const newSpaceId = event.target.value || undefined;
    setIsUpdating(true);

    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId!,
            settings: {
              homeSpace: {
                spaceID: newSpaceId,
                // If clearing the space, auto-disable redirect
                autoRedirect: newSpaceId ? currentAutoRedirect : false,
              },
            },
          },
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAutoRedirectChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsUpdating(true);

    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId!,
            settings: {
              homeSpace: {
                autoRedirect: newValue,
              },
            },
          },
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasNoMemberships = l0Spaces.length === 0;
  const canEnableAutoRedirect = Boolean(currentHomeSpaceId);

  return (
    <UserAdminLayout currentTab={SettingsSection.Membership}>
      <Gutters>
        <PageContentBlock>
          <BlockTitle>{t('pages.admin.user.homeSpace.title')}</BlockTitle>
          <Caption marginBottom={gutters(1)}>{t('pages.admin.user.homeSpace.description')}</Caption>

          <Gutters disablePadding>
            <FormControl fullWidth disabled={hasNoMemberships || isUpdating || loadingSettings}>
              <InputLabel id="home-space-select-label">{t('pages.admin.user.homeSpace.selectLabel')}</InputLabel>
              <Select
                labelId="home-space-select-label"
                id="home-space-select"
                value={currentHomeSpaceId || ''}
                label={t('pages.admin.user.homeSpace.selectLabel')}
                onChange={handleHomeSpaceChange}
              >
                <MenuItem value="">
                  <em>{t('pages.admin.user.homeSpace.noSelection')}</em>
                </MenuItem>
                {l0Spaces.map(space => (
                  <MenuItem key={space.id} value={space.id}>
                    {space.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box marginTop={gutters(1)}>
              <FormControlLabel
                control={
                  isUpdating ? (
                    <Box position="relative" marginRight={1} display="flex" alignItems="center">
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <Checkbox
                      checked={currentAutoRedirect}
                      onChange={handleAutoRedirectChange}
                      disabled={!canEnableAutoRedirect || isUpdating || loadingSettings}
                    />
                  )
                }
                label={<Trans i18nKey="pages.admin.user.homeSpace.autoRedirect" components={{ b: <strong /> }} />}
                disabled={!canEnableAutoRedirect}
              />
              {!canEnableAutoRedirect && (
                <Caption color="text.secondary" display="block">
                  {t('pages.admin.user.homeSpace.autoRedirectDisabledHint')}
                </Caption>
              )}
            </Box>
          </Gutters>
        </PageContentBlock>

        <ActionableContributionsView
          title={t('common.my-memberships')}
          contributions={memberships}
          loading={loading}
          enableLeave
          onLeave={refetch}
        />
        <ActionableContributionsView
          title={t('pages.user-profile.pending-applications.title')}
          contributions={applications}
          loading={loading}
        />
      </Gutters>
    </UserAdminLayout>
  );
};

export default UserAdminMembershipPage;
