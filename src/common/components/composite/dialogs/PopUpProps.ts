import { HubNameFragment } from '../../../../models/graphql-schema';

interface PopUpProps<T> {
  entity: T;
  onHide?: () => void;
  hub?: HubNameFragment;
}
export default PopUpProps;
