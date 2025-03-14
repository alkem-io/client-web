import { useMemo } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';
import { UserCardProps } from '@/domain/community/user/userCard/UserCard';

type UserCardData = {
  id: string;
  profile: {
    displayName: string;
    avatar?: { uri: string };
    location?: { city?: string; country?: string };
    url?: string;
    tagsets?: { tags: string[] }[];
  };
  isContactable: boolean;
};

const useUserCardProps = (data: UserCardData[] | undefined): (Identifiable & UserCardProps)[] | undefined => {
  return useMemo(() => {
    if (!data) {
      return;
    }

    return data.map(user => ({
      id: user.id,
      tags: user.profile.tagsets?.flatMap(x => x.tags),
      displayName: user.profile.displayName,
      avatarSrc: user.profile.avatar?.uri,
      city: user.profile.location?.city,
      country: user.profile.location?.country,
      url: user.profile.url,
      isContactable: user.isContactable,
    }));
  }, [data]);
};

export default useUserCardProps;
