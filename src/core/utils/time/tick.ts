import { useEffect, useRef, useState } from 'react';

const Tick = (tickInterval = 1000) => {
  const useTick = ({ skip = false }: { skip?: boolean } = {}) => {
    const tickTimeoutRef = useRef<number | null>(null);

    const [time, setTime] = useState(Date.now());

    useEffect(() => {
      if (!skip) {
        const tick = () => {
          setTime(Date.now());
          tickTimeoutRef.current = window.setTimeout(tick, tickInterval * 0.5);
        };

        tick();

        return () => {
          if (tickTimeoutRef.current !== null) {
            window.clearTimeout(tickTimeoutRef.current);
          }
          tickTimeoutRef.current = null;
        };
      }
    }, [skip]);

    return time;
  };

  return useTick;
};

export const useTick = Tick();

export default Tick;
