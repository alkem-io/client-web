import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';

export const getCardCallout = <A extends { nameID: string }, T extends { type: CalloutType; posts?: A[] }>(
  callouts: T[] | undefined,
  postNameID: string
) => callouts?.find(x => x.type === CalloutType.PostCollection && x.posts?.some(x => x.nameID === postNameID));
