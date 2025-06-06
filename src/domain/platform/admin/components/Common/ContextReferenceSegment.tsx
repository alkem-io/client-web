import React, { FC } from 'react';
import { PushFunc, RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

interface ContextReferenceSegmentProps extends ReferenceSegmentProps {
  fieldName?: string;
  profileId?: string;
}

/**
 * @deprecated Use ProfileReferenceSegment instead. This component is kept for backward compatibility and will be removed in a future release.
 */
export const ContextReferenceSegment: FC<ContextReferenceSegmentProps> = ({
  fieldName,
  profileId,
  readOnly,
  ...rest
}) => {
  const { t } = useTranslation();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  const handleAdd = async (push: PushFunc) => {
    setPush(push);
    if (profileId) {
      addReference({
        profileId,
        name: newReferenceName(t, rest.references.length),
        description: '',
        uri: '',
      });
    }
  };

  const handleRemove = async (ref: ReferenceModel, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return (
    <ReferenceSegment
      fieldName={fieldName}
      onAdd={handleAdd}
      onRemove={handleRemove}
      readOnly={!profileId || readOnly}
      {...rest}
    />
  );
};

export default ContextReferenceSegment;
