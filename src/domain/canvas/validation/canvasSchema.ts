import { object } from 'yup';
import { displayNameValidator } from '../../../utils/validator';

const canvasSchema = object({
  displayName: displayNameValidator,
});

export default canvasSchema;
