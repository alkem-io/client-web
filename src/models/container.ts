export type Container<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities?: TEntities, state?: TState, actions?: TActions) => React.ReactNode;
};
