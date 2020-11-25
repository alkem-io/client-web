export const shuffleCollection = arr => arr?.slice().sort(() => 0.5 - Math.random());

export default shuffleCollection;
