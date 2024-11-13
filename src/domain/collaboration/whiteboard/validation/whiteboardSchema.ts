import { object } from 'yup';
import { displayNameValidator } from '@core/ui/forms/validator';

const whiteboardSchema = object({
  displayName: displayNameValidator,
});

export default whiteboardSchema;
