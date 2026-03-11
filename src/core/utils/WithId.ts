import type { Identifiable } from './Identifiable';

export type WithId<Record extends {}> = Record & Identifiable;
