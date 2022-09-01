export default function hexToRGBA(inputHex: string, opacity: number) {
  let hex = inputHex.replace('#', '');
  if (inputHex.indexOf('#') > -1 && (hex.length === 3 || hex.length === 6)) {
    if (hex.length === 3) {
      const [r, g, b] = hex;
      hex = r + r + g + g + b + b;
    }

    const [r, g, b] = _hexToRGBA(hex);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return inputHex;
}

const _hexToRGBA = (hex: string) => {
  if (hex.length === 6) {
    const number = parseInt(hex, 16);

    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }
  return [];
};
