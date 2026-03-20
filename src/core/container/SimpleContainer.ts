import type { ReactNode } from 'react';

export interface SimpleContainerProps<ChildProps extends {}> {
  children: (props: ChildProps) => ReactNode;
}
