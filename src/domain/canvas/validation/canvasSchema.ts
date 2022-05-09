import { object } from 'yup';
import { displayNameValidator } from '../../../common/utils/validator';

const canvasSchema = object({
  displayName: displayNameValidator,
});

export default canvasSchema;
