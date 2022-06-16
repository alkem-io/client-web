import { Identifiable } from '../types/Identifiable';

const findById = <Item extends Identifiable>(items: Item[] | undefined, id: string) =>
  items?.find(item => item.id === id);

export default findById;
