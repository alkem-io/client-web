import React, { FC } from 'react';
import { newReferenceName } from '../../../../common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';

interface Reference {
  id?: string;
  name: string;
  uri: string;
  description?: string;
}

interface FormikReferenceSegmentProps extends Omit<ReferenceSegmentProps, 'references'> {
  references: Reference[];
  setFieldValue: (field: string, value: Reference[], shouldValidate?: boolean | undefined) => void;
}

export const FormikReferenceSegment: FC<FormikReferenceSegmentProps> = ({
  fieldName = 'references',
  references,
  setFieldValue,
  ...rest
}) => {
  const { t } = useTranslation();

  const referencesWithId = (references ?? []).map(ref => ({
    ...ref,
    id: ref.id ?? '',
  }));

  const handleAdd = pushFn => {
    const newRef = {
      name: newReferenceName(t, references.length),
      uri: '',
      description: '',
    };
    pushFn?.(newRef);
  };

  const handleRemove = (reference, removeFn) => {
    removeFn?.(reference);
  };

  return (
    <ReferenceSegment
      fieldName={fieldName}
      onAdd={handleAdd}
      onRemove={handleRemove}
      references={referencesWithId}
      {...rest}
    />
  );
};

export default FormikReferenceSegment;
