import { useEffect } from 'react';
import { useFormikContext } from 'formik';
import useDeepCompareEffect from 'use-deep-compare-effect';

export interface FormikEffectProps<T> {
  onChange?: (values: T) => void;
  onStatusChange?: (valid: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  canSave?: (isDirtyAndValid: boolean) => void;
}

const FormikEffectFactory = <T,>() => {
  const Instance = ({ onChange, onStatusChange, onDirtyChange, canSave }: FormikEffectProps<T>) => {
    const formik = useFormikContext<T>();

    if (!formik) {
      throw new Error('FormikEffect needs a Formik parent to operate');
    }

    const { values, isValid, dirty } = formik;

    useDeepCompareEffect(() => {
      if (onChange) {
        // Not the cleanest, but without this setTimeout the page crashes sometimes
        // See client-web#9262
        window.setTimeout(() => {
          onChange(values);
        }, 10);
      }
    }, [values]);
    useEffect(() => onStatusChange && onStatusChange(isValid), [isValid, onStatusChange]);
    useEffect(() => onDirtyChange && onDirtyChange(dirty), [dirty, onDirtyChange]);
    useEffect(() => canSave && canSave(isValid && dirty), [isValid, dirty, canSave]);

    return <></>;
  };

  return Instance;
};

export default FormikEffectFactory;
