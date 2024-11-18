import { useEffect } from 'react';
import { useFormikContext } from 'formik';
import useDeepCompareEffect from 'use-deep-compare-effect';

export interface FormikEffectProps<T> {
  onChange?: (values: T) => void;
  onStatusChange?: (valid: boolean) => void;
}

const FormikEffectFactory = <T,>() => {
  const Instance = ({ onChange, onStatusChange }: FormikEffectProps<T>) => {
    const formik = useFormikContext<T>();

    if (!formik) {
      throw new Error('FormikEffect needs a Formik parent to operate');
    }

    const { values, isValid } = formik;

    useDeepCompareEffect(() => onChange && onChange(values), [values]);
    useEffect(() => onStatusChange && onStatusChange(isValid), [isValid, onStatusChange]);

    return <></>;
  };

  return Instance;
};

export default FormikEffectFactory;
