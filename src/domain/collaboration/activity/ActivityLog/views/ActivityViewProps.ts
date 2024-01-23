import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps
  extends Pick<ActivityBaseViewProps, 'createdDate' | 'author' | 'loading' | 'footerComponent'> {
  journeyUrl: string;
  journeyDisplayName: string | undefined;
}
