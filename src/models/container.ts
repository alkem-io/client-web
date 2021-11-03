export type ContainerProps<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities: TEntities, state: TState, actions: TActions) => React.ReactNode;
};

export type ContainerHook<TEntities = {}, TActions = {}, TState = {}> = () => {
  entities: TEntities;
  state: TState;
  actions: TActions;
};
