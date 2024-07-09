import { nameIdValidator } from '../../core/ui/forms/validator';
import reservedTopLevelRoutePaths from './reservedTopLevelRoutePaths';

const nonReservedNameIdValidator = nameIdValidator.test({
  name: 'nonReservedNameIdValidator',
  message: 'forms.validations.reservedTopLevelRoute',
  test: value => !reservedTopLevelRoutePaths.includes(value),
});

export default nonReservedNameIdValidator;
