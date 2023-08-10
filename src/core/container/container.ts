/**
 * @deprecated
 * use SimpleContainerProps
 */
export type ContainerChildProps<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities: TEntities, state: TState, actions: TActions) => React.ReactNode;
};
