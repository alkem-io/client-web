import { object } from 'yup';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';

const whiteboardSchema = object({ displayName: displayNameValidator });

export default whiteboardSchema;
