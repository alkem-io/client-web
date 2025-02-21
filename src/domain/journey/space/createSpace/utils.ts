const SPACE_CREATION_CACHE_KEY = 'SP_WELCOME';

export const addSpaceWelcomeCache = (id: string) => {
  localStorage.setItem(SPACE_CREATION_CACHE_KEY, id);
};

export const getSpaceWelcomeCache = () => {
  return localStorage.getItem(SPACE_CREATION_CACHE_KEY);
};

export const removeSpaceWelcomeCache = () => {
  localStorage.removeItem(SPACE_CREATION_CACHE_KEY);
};
