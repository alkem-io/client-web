import React, { FC } from 'react';
import { PushFunc, RemoveFunc, useEditReference } from '../../../../common/reference/useEditReference';
import { newReferenceName } from '../../../../common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';
import References from '../../../../shared/components/References/References';

interface Reference {
  name: string;
  uri: string;
  description?: string;
}

interface ProfileReferenceSegmentProps extends ReferenceSegmentProps {
  setFieldValue: (field: string, value: Reference[], shouldValidate?: boolean | undefined) => void
}

export const ProfileReferenceSegment: FC<ProfileReferenceSegmentProps> = ({
  fieldName = 'references',
  references,
  setFieldValue,
  ...rest
}) => {
  const { t } = useTranslation();

  const handleAdd = (pushFn) => {
    const newRef = { name: newReferenceName(t, references.length), uri: '' };
    setFieldValue(fieldName, [...(references ?? []), newRef])
    pushFn(newRef);
  };
  const handleRemove = () => { };


  return (
    <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} references={references} {...rest} />
  );

};

export default ProfileReferenceSegment;
