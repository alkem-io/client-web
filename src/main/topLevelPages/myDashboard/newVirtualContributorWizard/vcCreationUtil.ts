const VC_CREATION_CACHE_KEY = 'TRYVC';

export const addVCCreationCache = (nameId: string) => {
  localStorage.setItem(VC_CREATION_CACHE_KEY, nameId);
};

export const getVCCreationCache = () => {
  return localStorage.getItem(VC_CREATION_CACHE_KEY);
};

export const removeVCCreationCache = () => {
  localStorage.removeItem(VC_CREATION_CACHE_KEY);
};
