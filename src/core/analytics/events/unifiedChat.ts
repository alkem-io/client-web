import { info, TagCategoryValues } from '@/core/logging/sentry/log';

const EVENT_NAMESPACE = 'unifiedChat';

export type ChatOpenSource = 'floatingButton' | 'headerIcon';

export const trackChatOpen = (source: ChatOpenSource) => {
  info(`${EVENT_NAMESPACE}.open`, {
    category: TagCategoryValues.CHAT,
    label: source,
  });
};
