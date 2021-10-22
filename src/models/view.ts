export type View<TEntities = {}, TActions = {}, TState = {}, TOptions = {}> = {
  entities: TEntities;
  state: TState;
  actions: TActions;
  options: TOptions;
};
