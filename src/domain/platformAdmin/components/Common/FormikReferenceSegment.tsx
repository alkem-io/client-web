import { useField } from 'formik';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import ReferenceSegment, { type ReferenceSegmentProps } from './ReferenceSegment';

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

  const referencesWithId = references.map(ref => ({
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
