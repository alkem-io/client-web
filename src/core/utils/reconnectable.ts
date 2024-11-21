import { useEffect, useRef, useState } from 'react';

type ReconnectableProps = {
  isOnline: boolean;
  skip: boolean;
  reconnect: () => void;
};

const AUTO_RECONNECT_DEFAULT_INTERVAL = 5000;

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21] as const;

const computeReconnectionTimeout = (baseInterval: number, tryNumber: number) => {
  const fibonacciIndex = Math.max(0, Math.min(tryNumber - 1, FIBONACCI_SEQUENCE.length - 1));

  return baseInterval * FIBONACCI_SEQUENCE[fibonacciIndex];
};

interface ReconnectableStrategy {
  baseInterval: number;
  computeReconnectionTimeout: (baseInterval: number, tryNumber: number) => number;
}

interface ReconnectableProvided {
  autoReconnectTime: number | null;
  setupReconnectTimeout: () => void;
}

const DEFAULT_RECONNECTABLE_STRATEGY: ReconnectableStrategy = {
  baseInterval: AUTO_RECONNECT_DEFAULT_INTERVAL,
  computeReconnectionTimeout,
} as const;

const Reconnectable = ({ baseInterval, computeReconnectionTimeout } = DEFAULT_RECONNECTABLE_STRATEGY) => {
  const useReconnectable = ({ isOnline, skip, reconnect }: ReconnectableProps): ReconnectableProvided => {
    const autoReconnectIntervalMultiplierRef = useRef<number>(1);

    const [autoReconnectTime, setAutoReconnectTime] = useState<number | null>(null);

    const reconnectTimeoutId = useRef<number | null>(null);

    useEffect(() => {
      if (autoReconnectTime !== null) {
        const timeRemaining = autoReconnectTime - Date.now();

        reconnectTimeoutId.current = window.setTimeout(() => {
          setAutoReconnectTime(null);
          handleReconnect();
        }, Math.max(timeRemaining, 0));
      }
      return () => {
        if (reconnectTimeoutId.current !== null) {
          window.clearTimeout(reconnectTimeoutId.current);
        }
        reconnectTimeoutId.current = null;
      };
    }, [autoReconnectTime]);

    const setupReconnectTimeout = () => {
      setAutoReconnectTime(
        Date.now() + computeReconnectionTimeout(baseInterval, autoReconnectIntervalMultiplierRef.current)
      );
    };

    useEffect(() => {
      if (isOnline && !autoReconnectTime && !skip) {
        setupReconnectTimeout();
      }
    }, [isOnline]);

    useEffect(() => {
      if (!isOnline) {
        setAutoReconnectTime(null);
      }
    }, [isOnline]);

    useEffect(() => {
      if (skip) {
        autoReconnectIntervalMultiplierRef.current = 1;
      }
    }, [skip]);

    const handleReconnect = () => {
      autoReconnectIntervalMultiplierRef.current++;
      reconnect();
    };

    useEffect(() => {
      if (skip) {
        setAutoReconnectTime(null);
      }
    }, [skip]);

    return {
      autoReconnectTime,
      setupReconnectTimeout,
    };
  };

  return useReconnectable;
};

export default Reconnectable;
