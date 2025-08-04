import { StatelessBaseMessage } from './stateless.base.message';

export type StatelessSaveMessage = StatelessSaveSuccessMessage | StatelessSaveErrorMessage;

export interface StatelessSaveSuccessMessage extends StatelessBaseMessage {
  event: 'saved';
}

export interface StatelessSaveErrorMessage extends StatelessBaseMessage {
  event: 'save-error';
  error: string;
}

export const isStatelessSaveMessage = (
  data: StatelessBaseMessage
): data is StatelessSaveMessage => {
  return data.event === 'saved' || data.event === 'save-error';
};

export const isStatelessSaveErrorMessage = (
  data: StatelessBaseMessage
): data is StatelessSaveMessage => {
  return data.event === 'save-error';
};
