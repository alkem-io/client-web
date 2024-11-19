type Tagset = {
  id?: string;
  name?: string;
  tags?: string[];
};

export const findDefaultTagset = <T extends Tagset>(tagsets: T[] | undefined): T | undefined => {
  if (!tagsets) return undefined;
  const defaultTagset: T | undefined = tagsets.find(tagset => tagset.name === 'default');
  if (defaultTagset) {
    return defaultTagset;
  } else if (tagsets.length > 0 && !tagsets[0].name) {
    return tagsets[0];
  }
};
