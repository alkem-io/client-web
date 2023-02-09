import { FC } from 'react';
import { useMessagingUserDetailsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { ProfileChip } from '../../common/ProfileChip/ProfileChip';

interface UserChipProps {
  userId: string;
  removable: boolean;
  onRemove: () => void;
}

export const UserChip: FC<UserChipProps> = ({ userId, ...props }) => {
  const { data, loading } = useMessagingUserDetailsQuery({
    variables: { id: userId },
  });

  const user = data?.user;

  return (
    <ProfileChip
      displayName={user?.displayName}
      avatarUrl={user?.profile?.avatar?.uri}
      city={user?.profile?.location?.city}
      country={user?.profile?.location?.country}
      loading={loading || !user}
      {...props}
    />
  );
};
