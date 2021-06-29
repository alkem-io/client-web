import React, { FC } from 'react';
import { useCreateReferenceOnContextMutation, useDeleteReferenceMutation } from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../utils/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';

interface ContextReferenceSegmentProps extends ReferenceSegmentProps {
  contextId?: string;
}

export const ContextReferenceSegment: FC<ContextReferenceSegmentProps> = ({ contextId, readOnly, ...rest }) => {
  const handleError = useApolloErrorHandler();
  const [addReference] = useCreateReferenceOnContextMutation({
    onError: handleError,
  });

  const [deleteReference] = useDeleteReferenceMutation({
    onError: handleError,
  });

  const handleAdd = async (push: (obj?: any) => void) => {
    if (contextId) {
      try {
        const result = await addReference({
          variables: {
            input: {
              contextID: contextId,
              name: newReferenceName(rest.references.length),
              description: '',
              uri: '',
            },
          },
        });
        push({
          id: result.data?.createReferenceOnContext.id,
          name: result.data?.createReferenceOnContext.name,
          uri: result.data?.createReferenceOnContext.uri,
        });
      } catch {
        push();
      }
    }
  };
  const handleRemove = async (ref: Reference, remove: (success: boolean) => void) => {
    if (ref.id) {
      try {
        const result = await deleteReference({
          variables: {
            input: {
              ID: ref.id,
            },
          },
        });
        remove(!!result);
      } catch {
        remove(false);
      }
    }
  };

  return <ReferenceSegment {...rest} onAdd={handleAdd} onRemove={handleRemove} readOnly={!contextId || readOnly} />;
};
export default ContextReferenceSegment;
