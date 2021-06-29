export const newReferenceName = (count: number) => {
  return count === 0 ? 'New reference' : `New reference (${count + 1})`;
};
