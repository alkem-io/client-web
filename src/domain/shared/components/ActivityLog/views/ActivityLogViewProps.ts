import { ActivityLogBaseViewProps } from './ActivityLogBaseView';

export interface ActivityLogViewProps
  extends Pick<ActivityLogBaseViewProps, 'author' | 'createdDate' | 'description' | 'url'> {}
