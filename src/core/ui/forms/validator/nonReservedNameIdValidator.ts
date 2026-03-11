import { reservedTopLevelRoutePaths } from '@/main/routing/TopLevelRoutePath';
import { nameIdValidator } from './nameIdValidator';

const nonReservedNameIdValidator = nameIdValidator.test({
  name: 'nonReservedNameIdValidator',
  message: 'forms.validations.reservedTopLevelRoute',
  test: value => !reservedTopLevelRoutePaths.includes(value),
});

export default nonReservedNameIdValidator;
