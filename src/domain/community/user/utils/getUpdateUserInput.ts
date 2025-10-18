import { UserModel } from '../models/UserModel';
import { Maybe, UpdateProfileInput, UpdateUserInput } from '@/core/apollo/generated/graphql-schema';

type HavingId<Entity extends { id?: unknown }> = Entity & { id: Exclude<Entity['id'], undefined> };
const doesHaveId = <Entity extends { id?: unknown }>(entity: Entity): entity is HavingId<Entity> => !!entity.id;
const convertIdAttrToUppercase = <Id extends string, Entity extends { id: Id }>({ id, ...attrs }: Entity) => {
  return {
    ID: id,
    ...attrs,
  };
};

export const getUpdateProfileInput = (profile?: Partial<UserModel['profile']>): Maybe<UpdateProfileInput> => {
  return (
    profile && {
      displayName: profile.displayName,
      description: profile.description,
      tagline: profile.tagline,
      references: profile.references?.filter(doesHaveId).map(convertIdAttrToUppercase),
      tagsets:
        profile.tagsets?.filter(doesHaveId).map(({ id, ...tagset }) => ({
          ID: id,
          tags: tagset.tags ?? [],
        })) ?? [],
      location: {
        city: profile.location?.city,
        country: profile.location?.country,
      },
    }
  );
};

export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, isContactable, ...rest } = user;

  const profileData = getUpdateProfileInput(user.profile);

  return {
    ...rest,
    ID: userID,
    profileData,
  };
};
