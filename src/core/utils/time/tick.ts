import { useEffect, useRef, useState } from 'react';

const Tick = (precision = 1000) => {
  const getTimeWithPrecision = () => Math.round(Date.now() / precision) * precision;

  const useTick = ({ skip = false }: { skip?: boolean } = {}) => {
    const tickTimeoutRef = useRef<number | null>(null);

    const [, setTime] = useState(getTimeWithPrecision());

    useEffect(() => {
      if (!skip) {
        const tick = () => {
          setTime(getTimeWithPrecision());
          tickTimeoutRef.current = requestAnimationFrame(tick);
        };

        tick();

        return () => {
          if (tickTimeoutRef.current !== null) {
            cancelAnimationFrame(tickTimeoutRef.current);
          }
          tickTimeoutRef.current = null;
        };
      }
    }, [skip]);

    return Date.now();
  };

  return useTick;
};

export const useTick = Tick();
