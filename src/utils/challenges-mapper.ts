export const challengesMapper = (url: string) => (challenge: { textID: string; name: string }) => ({
  id: challenge.textID,
  value: challenge.name,
  url: `${url}/${challenge.textID}`,
});
