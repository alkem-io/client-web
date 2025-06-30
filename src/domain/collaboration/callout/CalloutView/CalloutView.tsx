import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import PostCallout from '../CalloutContributions/post/PostCallout';
import WhiteboardCollectionCallout from '../CalloutContributions/whiteboard/WhiteboardCollectionCallout';
import CommentsCallout from './CommentsCallout';
import { TypedCalloutDetails } from '../../new-callout/models/TypedCallout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import PostCalloutContainer from '../CalloutContributions/post/PostCalloutContainer';
import WhiteboardCollectionCalloutContainer from '../CalloutContributions/whiteboard/WhiteboardCollectionCalloutContainer';

export interface CalloutViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCalloutDetails;
  calloutActions?: boolean;
}

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
    case CalloutType.LinkCollection:
    case CalloutType.Post:
    case CalloutType.Whiteboard:
      return <CommentsCallout callout={callout} {...props} />;
    default:
      throw new Error(`Unexpected Callout type "${callout['type']}"`);
  }
};

export default CalloutView;
