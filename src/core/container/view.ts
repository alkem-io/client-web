// todo: overload so that actions and options are optional - <e, s, a?, o?>
export type ViewProps<TEntities = {}, TActions = {}, TState = {}, TOptions = {}> = {
  entities: TEntities;
  state: TState;
  actions: TActions;
  options: TOptions;
};
