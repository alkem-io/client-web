export const shuffleCollection = <T>(arr: Array<T>): Array<T> => arr?.slice().sort(() => 0.5 - Math.random());

export default shuffleCollection;
