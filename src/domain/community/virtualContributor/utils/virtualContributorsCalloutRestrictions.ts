import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';

export const virtualContributorsCalloutRestrictions: CalloutRestrictions = {
  // disableRichMedia: true,  //!! I think this is not needed anymore
  disableWhiteboards: true,
  disableMemos: true,
  disableComments: true,
  disableCommentsToContributions: true,
};
