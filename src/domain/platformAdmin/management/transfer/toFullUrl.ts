const toFullUrl = (input: string): string => {
  try {
    new URL(input);
    return input;
  } catch {
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${globalThis.location.origin}${path}`;
  }
};

export default toFullUrl;
