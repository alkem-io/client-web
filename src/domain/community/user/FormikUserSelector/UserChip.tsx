import { FC } from 'react';
import { useUserSelectorUserDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ProfileChip } from '../../contributor/ProfileChip/ProfileChip';

interface UserChipProps {
  userId: string;
  removable: boolean;
  onRemove: () => void;
}

export const UserChip: FC<UserChipProps> = ({ userId, ...props }) => {
  const { data, loading } = useUserSelectorUserDetailsQuery({
    variables: { id: userId },
  });

  const user = data?.user;

  return (
    <ProfileChip
      displayName={user?.profile.displayName}
      avatarUrl={user?.profile.visual?.uri}
      city={user?.profile.location?.city}
      country={user?.profile.location?.country}
      loading={loading || !user}
      {...props}
    />
  );
};
