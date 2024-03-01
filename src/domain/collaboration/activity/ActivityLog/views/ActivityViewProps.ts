import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'createdDate' | 'avatarUrl' | 'loading'> {
  journeyUrl: string;
  journeyDisplayName: string | undefined;
}
