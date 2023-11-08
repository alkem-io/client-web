export interface Identifiable {
  id: string;
}

export type Identifiables<T extends {}> = (T & Identifiable)[];
