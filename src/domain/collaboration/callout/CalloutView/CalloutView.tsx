import React, { forwardRef } from 'react';
import { AuthorizationPrivilege, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import AspectCallout from '../aspect/AspectCallout';
import CanvasCallout from '../canvas/CanvasCallout';
import CommentsCallout from '../comments/CommentsCallout';
import { TypedCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';

export interface CalloutsViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCallout;
  isSubscribedToComments: boolean;
}

const CalloutView = forwardRef<HTMLDivElement, CalloutsViewProps>(
  ({ callout, isSubscribedToComments, ...props }, ref) => {
    const canCreate = (privilege: AuthorizationPrivilege) => callout.authorization?.myPrivileges?.includes(privilege);

    switch (callout.type) {
      case CalloutType.Card:
        return (
          <AspectCallout
            ref={ref}
            callout={callout}
            canCreate={canCreate(AuthorizationPrivilege.CreateAspect)}
            {...props}
          />
        );
      case CalloutType.Canvas:
        return (
          <CanvasCallout
            ref={ref}
            callout={callout}
            canCreate={canCreate(AuthorizationPrivilege.CreateCanvas)}
            {...props}
          />
        );
      case CalloutType.Comments:
        return (
          <CommentsCallout ref={ref} callout={callout} isSubscribedToComments={isSubscribedToComments} {...props} />
        );
      default:
        throw new Error(`Unexpected Callout type "${callout['type']}"`);
    }
  }
);

export default CalloutView;
