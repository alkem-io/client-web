import { object } from 'yup';
import { displayNameValidator } from '../../../../common/utils/validator';

const whiteboardSchema = object({
  displayName: displayNameValidator,
});

export default whiteboardSchema;
