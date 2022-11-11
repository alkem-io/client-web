import { JourneyLocation } from '../../../../../common/utils/urlBuilders';
import { Author } from '../../AuthorAvatar/models/author';
import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'createdDate' | 'url'> {
  journeyLocation: JourneyLocation;
  author: Author;
  description: string;
}
