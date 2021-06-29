import React, { FC } from 'react';
import { PushFunc, RemoveFunc, useEditReference } from '../../../hooks/useEditReference';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../utils/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';

interface ContextReferenceSegmentProps extends ReferenceSegmentProps {
  contextId?: string;
}

export const ContextReferenceSegment: FC<ContextReferenceSegmentProps> = ({ contextId, readOnly, ...rest }) => {
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  const handleAdd = async (push: PushFunc) => {
    setPush(push);
    if (contextId) {
      addReference({
        contextId,
        name: newReferenceName(rest.references.length),
        description: '',
        uri: '',
      });
    }
  };

  const handleRemove = async (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} readOnly={!contextId || readOnly} {...rest} />;
};
export default ContextReferenceSegment;
