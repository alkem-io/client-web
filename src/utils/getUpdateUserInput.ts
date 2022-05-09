import { UserModel } from '../models/User';
import { Maybe, UpdateProfileInput, UpdateUserInput } from '../models/graphql-schema';

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
      ID: profile.id || '',
      description: profile.description,
      references: profile.references?.filter(doesHaveId).map(convertIdAttrToUppercase),
      tagsets: profile.tagsets?.filter(doesHaveId).map(convertIdAttrToUppercase),
      location: {
        city: profile.location?.city,
        country: profile.location?.country,
      },
    }
  );
};

export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, agent, ...rest } = user;

  const profileData = getUpdateProfileInput(user.profile);

  return {
    ...rest,
    ID: userID,
    profileData,
  };
};
