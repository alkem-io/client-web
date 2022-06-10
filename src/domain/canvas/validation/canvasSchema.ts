import { object } from 'yup';
import { displayNameValidator } from '../../../utils/validator';

const canvasSchema = object({
  name: displayNameValidator,
});

export default canvasSchema;
