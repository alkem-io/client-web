import { CalloutType } from '../../models/graphql-schema';
// temp function used in the transition period for switching to collaboration; for choosing the correct callout by type
export const getCanvasCallout = <T extends { type: CalloutType }>(callouts: T[] | undefined) =>
  callouts && callouts.find(x => x.type === CalloutType.Canvas);
