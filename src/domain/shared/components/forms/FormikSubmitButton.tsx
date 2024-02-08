import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useFormikContext } from 'formik';
import { FormikProps } from 'formik/dist/types';

export interface FormikSubmitButtonProps<Values extends unknown> extends LoadingButtonProps {
  formik: FormikProps<Values>;
}

export const FormikSubmitButtonPure = <Values extends unknown>({
  formik,
  ...props
}: FormikSubmitButtonProps<Values>) => {
  const { isValid, isValidating, isSubmitting, dirty } = formik;

  const isDisabled = !isValid || !dirty;
  const isLoading = isValidating || isSubmitting;

  return <LoadingButton disabled={isDisabled} loading={isLoading} type="submit" {...props} />;
};

const FormikSubmitButton = (props: LoadingButtonProps) => {
  const formik = useFormikContext();

  return <FormikSubmitButtonPure formik={formik} type="submit" {...props} />;
};

export default FormikSubmitButton;
