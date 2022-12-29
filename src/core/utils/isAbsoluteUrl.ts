export const isAbsoluteUrl = (link: string) => link.startsWith('//') || /https?:/.test(link);

export const isExternalUrl = (link: string) => !link.startsWith(window.origin);
