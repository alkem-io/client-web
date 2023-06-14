const ensurePresence = <Value>(value: Value | undefined | null, label = 'Value'): Value => {
  if (!value) {
    throw new Error(`${label} is not present.`);
  }
  return value;
};

export default ensurePresence;
