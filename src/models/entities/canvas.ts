import { Canvas } from '../graphql-schema';

// TODO review usages and remove; there's no need for a global type, specify what's needed per view.
export type CanvasWithoutValue = Omit<Canvas, 'value'>;
