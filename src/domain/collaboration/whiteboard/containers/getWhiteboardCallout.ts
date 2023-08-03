import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
// temp function used in the transition period for switching to collaboration; for choosing the correct callout by type
export const getWhiteboardCallout = <T extends { type: CalloutType; nameID: string }>(
  callouts: T[] | undefined,
  calloutNameId: string
) =>
  callouts?.find(
    x =>
      (x.type === CalloutType.WhiteboardCollection || x.type === CalloutType.Whiteboard) && x.nameID === calloutNameId
  );
