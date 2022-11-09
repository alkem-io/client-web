export type ContainerChildProps<TEntities = {}, TActions = {}, TState = {}> = {
  children: (entities: TEntities, state: TState, actions: TActions) => React.ReactNode;
};

export type ContainerHook<Props extends {}, TEntities = {}, TActions = {}, TState = {}> = (props: Props) => {
  entities: TEntities;
  state: TState;
  actions: TActions;
};
