
interface Tagset {
  id?: string;
  name: string;
  tags?: string[];
}

export const findDefaultTagset = <T extends Tagset[]>(tagsets: T | undefined) => {
  if (!tagsets) return undefined;
  return tagsets.find(tagset => tagset.name === 'default');
}