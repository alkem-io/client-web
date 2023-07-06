import { JourneyLocation } from '../../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'author' | 'loading'> {
  createdDate: Date | string;
  journeyTypeName: JourneyTypeName | undefined;
  journeyLocation: JourneyLocation;
  parentDisplayName: string | undefined;
}
