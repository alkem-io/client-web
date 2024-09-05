interface Tagset {
  id?: string;
  name: string;
  tags?: string[];
}

export const findDefaultTagset = <T extends Tagset[]>(tagsets: T | undefined) => {
  if (!tagsets) return undefined;
  const defaultTagset = tagsets.find(tagset => tagset.name === 'default');
  if (defaultTagset) {
    return defaultTagset;
  } else if (tagsets.length > 0) {
    return tagsets[0];
  }
};
