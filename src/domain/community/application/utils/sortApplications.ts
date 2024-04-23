import { ApplicationWithType } from './getApplicationWithType';
import { APPLICATION_STATE_NEW } from '../constants/ApplicationState';

const sortApplications = (a: ApplicationWithType, b: ApplicationWithType) => {
  if ((a.type === 'space' && b.type !== 'space') || (a.type === 'challenge' && b.type === 'opportunity')) {
    return -1;
  }

  if ((b.type === 'space' && a.type !== 'space') || (b.type === 'challenge' && a.type === 'opportunity')) {
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
