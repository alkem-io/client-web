import type { UserSettingsQuery } from '@/core/apollo/generated/graphql-schema';

export type UserSettingsMappedData = {
  allowOtherUsersToSendMessages: boolean;
};

export const mapUserSettings = (data: UserSettingsQuery | undefined): UserSettingsMappedData => {
  const settings = data?.lookup.user?.settings;
  return {
    allowOtherUsersToSendMessages: settings?.communication?.allowOtherUsersToSendMessages ?? false,
  };
};
