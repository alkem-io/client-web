import { ActivityBaseViewProps } from './ActivityBaseView';

/**
 * Base props for all ActivityLog views.
 * Don't confuse with ActivityBaseViewProps, which are props for the ActivityBaseView component.
 */
export interface ActivityViewProps
  extends Pick<ActivityBaseViewProps, 'createdDate' | 'avatarUrl' | 'avatarAlt' | 'loading'> {
  spaceDisplayName: string | undefined;
}
