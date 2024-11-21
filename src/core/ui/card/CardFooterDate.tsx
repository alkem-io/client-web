import { Caption } from '../typography';

const CardFooterDate = ({ date }: { date: string | Date }) => {
  const localeDateString = new Date(date).toLocaleDateString();

  return <Caption paddingX={0.5}>{localeDateString}</Caption>;
};

export default CardFooterDate;
