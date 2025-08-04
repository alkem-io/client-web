import { StatelessBaseMessage } from './stateless.base.message';

export interface StatelessReadOnlyStateMessage extends StatelessBaseMessage {
  event: 'read-only-state';
  readOnly: boolean;
}

export const isStatelessReadOnlyStateMessage = (
  data: StatelessBaseMessage
): data is StatelessReadOnlyStateMessage => {
  return data.event === 'read-only-state';
};
