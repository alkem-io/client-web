const VC_CREATION_CACHE_KEY = 'TRYVC';

export const addVCCreationCache = (name: string) => {
  localStorage.setItem(VC_CREATION_CACHE_KEY, name);
};

export const getVCCreationCache = () => {
  return localStorage.getItem(VC_CREATION_CACHE_KEY);
};

export const removeVCCreationCache = () => {
  localStorage.removeItem(VC_CREATION_CACHE_KEY);
};
