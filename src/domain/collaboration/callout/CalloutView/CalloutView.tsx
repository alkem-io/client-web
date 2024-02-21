import React from 'react';
import { AuthorizationPrivilege, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import PostCallout from '../post/PostCallout';
import WhiteboardCollectionCallout from '../whiteboard/WhiteboardCollectionCallout';
import CommentsCallout from '../comments/CommentsCallout';
import { TypedCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import LinkCollectionCallout from '../links/LinkCollectionCallout';
import SingleWhiteboardCallout from '../SingleWhiteboard/SingleWhiteboardCallout';
import PostCalloutContainer from '../post/PostCalloutContainer';

export interface CalloutViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCallout;
}

const CalloutView = ({ callout, ...props }: CalloutViewProps) => {
  const canCreate = (privilege: AuthorizationPrivilege) => callout.authorization?.myPrivileges?.includes(privilege);

  switch (callout.type) {
    case CalloutType.PostCollection:
      return (
        <PostCalloutContainer calloutId={callout.id}>
          {containerProps => (
            <PostCallout
              callout={callout}
              canCreate={canCreate(AuthorizationPrivilege.CreatePost)}
              {...containerProps}
              {...props}
            />
          )}
        </PostCalloutContainer>
      );
    case CalloutType.WhiteboardCollection:
      return (
        <WhiteboardCollectionCallout
          callout={callout}
          canCreate={canCreate(AuthorizationPrivilege.CreateWhiteboard)}
          {...props}
        />
      );
    case CalloutType.Post:
      return <CommentsCallout callout={callout} {...props} />;
    case CalloutType.LinkCollection:
      return <LinkCollectionCallout callout={callout} {...props} />;
    case CalloutType.Whiteboard:
      return <SingleWhiteboardCallout callout={callout} {...props} />;
    default:
      throw new Error(`Unexpected Callout type "${callout['type']}"`);
  }
};

export default CalloutView;
