import { JourneyLocation } from '../../../../../main/routing/urlBuilders';
import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'author' | 'loading'> {
  createdDate: Date | string;
  // TODO use profile.url from inside the activity content
  journeyTypeName: JourneyTypeName | undefined;
  journeyLocation: JourneyLocation;
  journeyDisplayName: string | undefined;
}
