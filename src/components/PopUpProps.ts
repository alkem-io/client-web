import { EcoverseNameFragment } from '../models/graphql-schema';

interface PopUpProps<T> {
  entity: T;
  onHide?: () => void;
  ecoverse?: EcoverseNameFragment;
}
export default PopUpProps;
