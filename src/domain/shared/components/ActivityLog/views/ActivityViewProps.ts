import { ActivityBaseViewProps } from './ActivityBaseView';

export interface ActivityViewProps extends Pick<ActivityBaseViewProps, 'createdDate' | 'description' | 'url'> {}
