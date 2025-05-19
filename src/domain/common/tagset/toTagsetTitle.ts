import { TagsetModel } from "./TagsetModel";

export const toTagsetTitle = (tagset: TagsetModel, title?: string): string =>
  title ?? `${tagset.name.slice(0, 1).toUpperCase()}${tagset.name.slice(1)}`;
