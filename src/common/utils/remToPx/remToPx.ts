const remToPx = (rootPx: number | number, rem: string | number) => {
  const rootPxNum = parseInt(String(rootPx));
  const remNum = parseFloat(String(rem));

  if (isNaN(rootPxNum)) {
    throw new Error('Unable to parse: rootPx not provided in parsable px units');
  }

  if (isNaN(remNum)) {
    throw new Error('Unable to parse: rem not provided in parsable rem units');
  }

  return rootPxNum * remNum;
};
export default remToPx;
