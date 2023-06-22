import { ApplicationWithType } from './getApplicationWithType';
import { ApplicationTypeEnum } from '../../../domain/community/application/constants/ApplicationType';
import { APPLICATION_STATE_NEW } from '../../../domain/community/application/constants/ApplicationState';

const sortApplications = (a: ApplicationWithType, b: ApplicationWithType) => {
  if (
    (a.type === ApplicationTypeEnum.space && b.type !== ApplicationTypeEnum.space) ||
    (a.type === ApplicationTypeEnum.challenge && b.type === ApplicationTypeEnum.opportunity)
  ) {
    return -1;
  }

  if (
    (b.type === ApplicationTypeEnum.space && a.type !== ApplicationTypeEnum.space) ||
    (b.type === ApplicationTypeEnum.challenge && a.type === ApplicationTypeEnum.opportunity)
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
