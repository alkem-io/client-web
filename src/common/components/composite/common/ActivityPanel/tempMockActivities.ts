const activitiesMock: Array<{
  name: string;
  count: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}> = [
  {
    name: 'challenges',
    count: 21,
    color: 'neutral',
  },
  {
    name: 'opportunities',
    count: 94,
    color: 'primary',
  },
  {
    name: 'Projects',
    count: 118,
    color: 'positive',
  },
  {
    name: 'challenges',
    count: 6171,
    color: 'neutralMedium',
  },
];

export default activitiesMock;
