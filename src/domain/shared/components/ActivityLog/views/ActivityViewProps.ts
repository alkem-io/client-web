import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'author' | 'loading'> {
  createdDate: Date | string;
  journeyUrl: string;
  journeyTypeName?: JourneyTypeName;
  journeyDisplayName: string | undefined;
}
