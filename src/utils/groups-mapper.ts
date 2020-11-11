export const groupsMapper = (url: string) => (group: { id: string; name: string }) => ({
  id: group.id,
  value: group.name,
  url: `${url}/${group.id}`,
});
