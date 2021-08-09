export default function hexToRGBA(inputHex: string, opacity: number) {
  const hex = inputHex.replace('#', '');
  if (inputHex.indexOf('#') > -1 && (hex.length === 3 || hex.length === 6)) {
    const multiplier = hex.length === 3 ? 1 : 2;
    // TODO [ATS] Handle correctly the FFF => 255, 255, 255, opacity
    // currently FFF transform to 15, 15, 15, opacity
    const r = parseInt(hex.substring(0, 1 * multiplier), 16);
    const g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
    const b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

    const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    return result;
  }

  return inputHex;
}
