import { Loader2 } from 'lucide-react';

const Loading = ({ text = 'Loading' }: { text?: string }) => {
  return (
    <div className="flex grow items-center justify-center gap-4 h-full text-primary">
      <Loader2 className="size-10 animate-spin" aria-hidden="true" />
      <span className="text-xs font-medium uppercase leading-none">{text}</span>
    </div>
  );
};

export default Loading;
