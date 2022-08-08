import FormRows from '../../shared/components/FormRows';
import { BoxProps } from '@mui/material';

const TemplateFormRows = (props: BoxProps) => {
  return <FormRows flexBasis={theme => theme.spacing(58)} {...props}></FormRows>;
};

export default TemplateFormRows;
