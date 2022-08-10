import { CalloutType } from '../../models/graphql-schema';

export const getAspectCallout = <T extends { type: CalloutType }>(callouts: T[] | undefined) =>
  callouts && callouts.find(x => x.type === CalloutType.Card);
