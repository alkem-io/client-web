export const mapChallenges = (challenge: { textID: string; name: string }) => ({
  id: challenge.textID,
  value: challenge.name,
});
