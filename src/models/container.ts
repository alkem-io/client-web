export type Container<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities: TEntities, state: TState, actions: TActions) => React.ReactNode;
};

export type View<TEntities = {}, TActions = {}, TState = {}, TOptions = {}> = {
  entities: TEntities;
  state: TState;
  actions: TActions;
  options: TOptions;
};

export type ContainerHook<TEntities = {}, TActions = {}, TState = {}> = () => {
  entities: TEntities;
  state: TState;
  actions: TActions;
};
