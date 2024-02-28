import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps
  extends Pick<ActivityBaseViewProps, 'createdDate' | 'displayName' | 'avatarUrl' | 'loading' | 'footerComponent'> {
  journeyUrl: string;
  journeyDisplayName: string | undefined;
}
