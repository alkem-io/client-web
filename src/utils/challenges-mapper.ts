export const challengesMapper = (url: string) => (challenge: { nameID: string; name: string }) => ({
  id: challenge.nameID,
  value: challenge.name,
  url: `${url}/${challenge.nameID}`,
});
