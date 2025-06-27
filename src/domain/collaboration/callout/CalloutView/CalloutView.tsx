import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import PostCallout from '../post/PostCallout';
import WhiteboardCollectionCallout from '../whiteboard/WhiteboardCollectionCallout';
import CommentsCallout from '../comments/CommentsCallout';
import { TypedCalloutDetails, TypedCalloutDetailsWithContributions } from '../../new-callout/models/TypedCallout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import LinkCollectionCallout from '../links/LinkCollectionCallout';
import SingleWhiteboardCallout from '../SingleWhiteboard/SingleWhiteboardCallout';
import PostCalloutContainer from '../post/PostCalloutContainer';
import WhiteboardCollectionCalloutContainer from '../whiteboard/WhiteboardCollectionCalloutContainer';

export interface CalloutViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCalloutDetails;
  calloutActions?: boolean;
}
/**
 *
 * @param param0 //!! unify all of these
 * @returns
 */
const CalloutView = ({ callout, ...props }: CalloutViewProps) => {
  switch (callout.calloutTypeDeprecated) {
    case CalloutType.PostCollection:
      return (
        <PostCalloutContainer callout={callout}>
          {containerProps => <PostCallout callout={callout} {...containerProps} {...props} />}
        </PostCalloutContainer>
      );
    case CalloutType.WhiteboardCollection:
      return (
        <WhiteboardCollectionCalloutContainer callout={callout}>
          {containerProps => <WhiteboardCollectionCallout callout={callout} {...containerProps} {...props} />}
        </WhiteboardCollectionCalloutContainer>
      );
    case CalloutType.Post:
      return <CommentsCallout callout={callout} {...props} />;
    case CalloutType.LinkCollection:
      return <LinkCollectionCallout callout={callout as TypedCalloutDetailsWithContributions} {...props} />; //!! WRONG, needs another container?
    case CalloutType.Whiteboard:
      return <SingleWhiteboardCallout callout={callout} {...props} />;
    default:
      throw new Error(`Unexpected Callout type "${callout['type']}"`);
  }
};

export default CalloutView;
