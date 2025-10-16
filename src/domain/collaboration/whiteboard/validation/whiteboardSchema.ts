import { object } from 'yup';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';

const whiteboardSchema = object({ displayName: displayNameValidator({ required: true }) });

export default whiteboardSchema;
