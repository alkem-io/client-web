import React, { FC, useMemo } from 'react';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';

interface Reference {
  id?: string;
  name: string;
  uri: string;
  description?: string;
}

interface FormikReferenceSegmentProps extends Omit<ReferenceSegmentProps, 'references'> {}

export const FormikReferenceSegment: FC<FormikReferenceSegmentProps> = ({ fieldName = 'references', ...rest }) => {
  const { t } = useTranslation();

  const [{ value: references = [] }] = useField<Reference[]>(fieldName);

  const referencesWithId = useMemo(
    () =>
      references.map(ref => ({
        ...ref,
        id: ref.id ?? '',
      })),
    [references]
  );

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
