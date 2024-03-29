/**
 * @deprecated
 * use SimpleContainerProps or ComponentOrChildrenFn instead
 */
export type ContainerChildProps<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities: TEntities, state: TState, actions: TActions) => React.ReactNode;
};
