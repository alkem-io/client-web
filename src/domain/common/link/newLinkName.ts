export const newLinkName = (count: number) => {
  return count === 0 ? 'New link' : `New link (${count + 1})`;
};
