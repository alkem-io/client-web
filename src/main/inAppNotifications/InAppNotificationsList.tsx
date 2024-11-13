import { useInAppNotifications } from './useInAppNotifications';
import { InAppNotificationItem } from './InAppNotificationItem';

export const InAppNotificationsList = () => {
  const { items } = useInAppNotifications();

  return (
    <>
      {items.map((item, idx) => (
        <InAppNotificationItem key={item.type + idx} {...item} />
      ))}
    </>
  );
};
