import { Identifiable } from './Identifiable';

export type WithId<Record extends {}> = Record & Identifiable;
