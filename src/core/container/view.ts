/**
 * @deprecated
 * use SimpleContainerProps or ComponentOrChildrenFn instead
 */
export type ViewProps<TEntities = {}, TActions = {}, TState = {}, TOptions = {}> = {
  entities: TEntities;
  state: TState;
  actions: TActions;
  options: TOptions;
};
