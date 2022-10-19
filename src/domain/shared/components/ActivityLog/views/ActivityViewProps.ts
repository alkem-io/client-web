import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps
  extends Pick<ActivityBaseViewProps, 'author' | 'createdDate' | 'description' | 'url'> {}
