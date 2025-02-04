import { useUserSelectorUserDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';

type UserChipProps = {
  userId: string;
  removable: boolean;
  onRemove: () => void;
};

export const UserChip = ({ userId, ...props }: UserChipProps) => {
  const { data, loading } = useUserSelectorUserDetailsQuery({ variables: { id: userId } });

  const user = data?.lookup.user;

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
