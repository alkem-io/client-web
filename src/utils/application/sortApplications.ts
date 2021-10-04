import { ApplicationWithType } from './getApplicationWithType';
import ApplicationTypeEnum from '../../models/application-type';
import { APPLICATION_STATE_NEW } from '../../models/constants';

const sortApplications = (a: ApplicationWithType, b: ApplicationWithType) => {
  if (
    (a.type === ApplicationTypeEnum.HUB && b.type !== ApplicationTypeEnum.HUB) ||
    (a.type === ApplicationTypeEnum.CHALLENGE && b.type === ApplicationTypeEnum.OPPORTUNITY)
  ) {
    return -1;
  }

  if (
    (b.type === ApplicationTypeEnum.HUB && a.type !== ApplicationTypeEnum.HUB) ||
    (b.type === ApplicationTypeEnum.CHALLENGE && a.type === ApplicationTypeEnum.OPPORTUNITY)
  ) {
    return 1;
  }

  if (a.state === APPLICATION_STATE_NEW && b.state !== APPLICATION_STATE_NEW) {
    return -1;
  }

  if (b.state === APPLICATION_STATE_NEW && a.state !== APPLICATION_STATE_NEW) {
    return 1;
  }

  return 0;
};
export default sortApplications;
