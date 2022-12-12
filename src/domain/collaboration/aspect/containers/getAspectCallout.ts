import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';

export const getCardCallout = <A extends { nameID: string }, T extends { type: CalloutType; aspects?: A[] }>(
  callouts: T[] | undefined,
  aspectNameID: string
) => callouts?.find(x => x.type === CalloutType.Card && x.aspects?.some(x => x.nameID === aspectNameID));

export const getCardCallouts = <T extends { type: CalloutType }>(callouts: T[] | undefined) =>
  callouts?.filter(x => x.type === CalloutType.Card);
