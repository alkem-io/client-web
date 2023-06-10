import React, { forwardRef } from 'react';
import { AuthorizationPrivilege, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import PostCallout from '../post/PostCallout';
import WhiteboardCallout from '../whiteboard/WhiteboardCallout';
import CommentsCallout from '../comments/CommentsCallout';
import { TypedCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import LinkCollectionCallout from '../links/LinkCollectionCallout';
import SingleWhiteboardCallout from '../SingleWhiteboard/SingleWhiteboardCallout';

export interface CalloutViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCallout;
}

const CalloutView = forwardRef<HTMLDivElement, CalloutViewProps>(({ callout, ...props }, ref) => {
  const canCreate = (privilege: AuthorizationPrivilege) => callout.authorization?.myPrivileges?.includes(privilege);

  switch (callout.type) {
    case CalloutType.Post:
      return (
        <PostCallout ref={ref} callout={callout} canCreate={canCreate(AuthorizationPrivilege.CreatePost)} {...props} />
      );
    case CalloutType.Whiteboard:
      return (
        <WhiteboardCallout
          ref={ref}
          callout={callout}
          canCreate={canCreate(AuthorizationPrivilege.CreateWhiteboard)}
          {...props}
        />
      );
    case CalloutType.Comments:
      return <CommentsCallout ref={ref} callout={callout} {...props} />;
    case CalloutType.LinkCollection:
      return <LinkCollectionCallout ref={ref} callout={callout} {...props} />;
    case CalloutType.SingleWhiteboard:
      return <SingleWhiteboardCallout ref={ref} callout={callout} {...props} />;
    default:
      throw new Error(`Unexpected Callout type "${callout['type']}"`);
  }
});

export default CalloutView;
