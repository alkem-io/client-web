import { useMemo } from 'react';
import { UserCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { Identifiable } from '../../../shared/types/Identifiable';
import { UserCardProps } from '../../../../common/components/composite/common/cards';

const useUserCardProps = (data: UserCardFragment[] | undefined): (Identifiable & UserCardProps)[] | undefined => {
  return useMemo(() => {
    if (!data) {
      return;
    }

    return data.map(user => ({
      id: user.id,
      tags: user.profile.tagsets?.flatMap(x => x.tags),
      displayName: user.profile.displayName,
      avatarSrc: user.profile.visual?.uri,
      city: user.profile.location?.city,
      country: user.profile.location?.country,
      url: buildUserProfileUrl(user.nameID),
      isContactable: user.isContactable,
    }));
  }, [data]);
};

export default useUserCardProps;
