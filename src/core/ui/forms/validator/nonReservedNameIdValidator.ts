import { nameIdValidator } from './nameIdValidator';
import { reservedTopLevelRoutePaths } from '@/main/routing/TopLevelRoutePath';

const nonReservedNameIdValidator = nameIdValidator.test({
  name: 'nonReservedNameIdValidator',
  message: 'forms.validations.reservedTopLevelRoute',
  test: value => !reservedTopLevelRoutePaths.includes(value),
});

export default nonReservedNameIdValidator;
