import { SpaceNameFragment } from '../../../../core/apollo/generated/graphql-schema';

interface PopUpProps<T> {
  entity: T;
  onHide?: () => void;
  space?: SpaceNameFragment;
}
export default PopUpProps;
