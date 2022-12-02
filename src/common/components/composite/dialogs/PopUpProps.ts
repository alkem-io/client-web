import { HubNameFragment } from '../../../../core/apollo/generated/graphql-schema';

interface PopUpProps<T> {
  entity: T;
  onHide?: () => void;
  hub?: HubNameFragment;
}
export default PopUpProps;
