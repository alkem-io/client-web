import { Button, ButtonProps } from '@mui/material';
import { useFormikContext } from 'formik';
import { FormikProps } from 'formik/dist/types';

export interface FormikSubmitButtonProps<Values extends unknown> extends ButtonProps {
  formik: FormikProps<Values>;
}

export const FormikSubmitButtonPure = <Values extends unknown>({
  formik,
  ...props
}: FormikSubmitButtonProps<Values>) => {
  const { isValid, isValidating, isSubmitting, dirty } = formik;

  const isDisabled = !isValid || !dirty;
  const isLoading = isValidating || isSubmitting;

  return <Button disabled={isDisabled} loading={isLoading} type="submit" {...props} />;
};

const FormikSubmitButton = (props: ButtonProps) => {
  const formik = useFormikContext();

  return <FormikSubmitButtonPure formik={formik} type="submit" {...props} />;
};

export default FormikSubmitButton;
