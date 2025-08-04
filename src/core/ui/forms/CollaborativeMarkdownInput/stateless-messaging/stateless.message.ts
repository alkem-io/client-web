import { StatelessSaveMessage } from './stateless.save.message';
import { StatelessReadOnlyStateMessage } from './stateless.read.only.state.message';

export type StatelessMessage = StatelessSaveMessage | StatelessReadOnlyStateMessage; // to be filled up with other message types as we go
