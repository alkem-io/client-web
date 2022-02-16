import { EcoverseNameFragment } from '../../../models/graphql-schema';

interface PopUpProps<T> {
  entity: T;
  onHide?: () => void;
  hub?: EcoverseNameFragment;
}
export default PopUpProps;
