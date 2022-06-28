import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useFormikContext } from 'formik';

export interface FormikSubmitButtonProps extends LoadingButtonProps {}

const FormikSubmitButton = (props: FormikSubmitButtonProps) => {
  const { isValid, isValidating, isSubmitting, dirty } = useFormikContext();

  const isDisabled = !isValid || !dirty;
  const isLoading = isValidating || isSubmitting;

  return <LoadingButton disabled={isDisabled} loading={isLoading} type="submit" {...props} />;
};

export default FormikSubmitButton;
