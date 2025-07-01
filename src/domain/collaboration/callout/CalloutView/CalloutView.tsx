import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import CommentsCallout from './CommentsCallout';
import { TypedCalloutDetails } from '../../new-callout/models/TypedCallout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';

export interface CalloutViewProps extends Omit<BaseCalloutViewProps, 'canCreate'> {
  callout: TypedCalloutDetails;
  calloutActions?: boolean;
}

const CalloutView = ({ callout, ...props }: CalloutViewProps) => {
  switch (callout.calloutTypeDeprecated) {
    case CalloutType.PostCollection:
    case CalloutType.WhiteboardCollection:
    case CalloutType.LinkCollection:
    case CalloutType.Post:
    case CalloutType.Whiteboard:
      return <CommentsCallout callout={callout} {...props} />;
    default:
      throw new Error(`Unexpected Callout type "${callout['type']}"`);
  }
};

export default CalloutView;
