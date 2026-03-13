import type { StatelessReadOnlyStateMessage } from './stateless.read.only.state.message';
import type { StatelessSaveMessage } from './stateless.save.message';

export type StatelessMessage = StatelessSaveMessage | StatelessReadOnlyStateMessage; // to be filled up with other message types as we go
