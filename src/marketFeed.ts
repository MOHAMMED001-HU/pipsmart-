import { useEffect, useState } from 'react';

export type Candle = { open: number; high: number; low: number; close: number };

type FeedState = {
  prices: Record<string, number>;
  candles: Record<string, Candle[]>;
};

const symbols = ['EUR/USD', 'GBP/USD', 'AUD/USD'];
const initialPrices: Record<string, number> = {
  'EUR/USD': 1.085,
  'GBP/USD': 1.265,
  'AUD/USD': 0.655,
};

function createInitialState(): FeedState {
  const prices = { ...initialPrices };
  const candles: Record<string, Candle[]> = {};
  symbols.forEach((symbol) => {
    const base = initialPrices[symbol];
    const values: Candle[] = [];
    let previous = base;
    for (let i = 0; i < 48; i += 1) {
      const change = (Math.sin(i * 1.73) + Math.cos(i * 0.61)) * base * 0.00018;
      const close = previous + change;
      values.push({
        open: previous,
        close,
        high: Math.max(previous, close) + base * (0.00008 + (i % 3) * 0.000025),
        low: Math.min(previous, close) - base * (0.00007 + (i % 4) * 0.00002),
      });
      previous = close;
    }
    prices[symbol] = previous;
    candles[symbol] = values;
  });
  return { prices, candles };
}

const state = createInitialState();
const listeners = new Set<(next: FeedState) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function publish() {
  listeners.forEach((listener) => listener(state));
}

function startFeed() {
  if (timer) return;
  timer = setInterval(() => {
    symbols.forEach((symbol) => {
      const previous = state.prices[symbol];
      const base = initialPrices[symbol];
      const change = (Math.random() - 0.49) * base * 0.00022;
      const next = Math.max(base * 0.97, previous + change);
      state.prices[symbol] = next;
      const candles = state.candles[symbol];
      const current = candles[candles.length - 1];
      if (current && Math.random() > 0.48) {
        current.close = next;
        current.high = Math.max(current.high, next);
        current.low = Math.min(current.low, next);
      } else {
        candles.push({ open: previous, high: Math.max(previous, next), low: Math.min(previous, next), close: next });
        if (candles.length > 48) candles.shift();
      }
    });
    publish();
  }, 2500);
}

export function useMarketFeed() {
  const [snapshot, setSnapshot] = useState<FeedState>(() => ({
    prices: { ...state.prices },
    candles: Object.fromEntries(
      Object.entries(state.candles).map(([symbol, values]) => [symbol, values.map((candle) => ({ ...candle }))]),
    ),
  }));

  useEffect(() => {
    const update = (next: FeedState) => {
      setSnapshot({
        prices: { ...next.prices },
        candles: Object.fromEntries(
          Object.entries(next.candles).map(([symbol, values]) => [symbol, values.map((candle) => ({ ...candle }))]),
        ),
      });
    };
    listeners.add(update);
    startFeed();
    update(state);
    return () => {
      listeners.delete(update);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return snapshot;
}
