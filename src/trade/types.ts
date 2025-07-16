import type { UTCTimestamp } from "lightweight-charts";

export interface RawOHLCV {
  hd: {
    ts_event: string;
    rtype: number;
    publisher_id: number;
    instrument_id: number;
  };
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  symbol: string;
}

export interface OHLCV {
  timestamp: UTCTimestamp;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  symbol: string;
}

export interface Order {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    price: number;
    quantity: number;
    timestamp: string; // ISO 8601 format
    status: 'open' | 'closed' | 'cancelled';
}

export interface Position {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    price: number;
    quantity: number;
    unrealizedPnL: number;
    entryTimestamp: string; // ISO 8601 format
    exitTimestamp?: string; // ISO 8601 format, optional if still open
    status: 'open' | 'closed';
}

export type PnLReport = {
    realized: number;
    unrealized: number;
    total: number;
    positions: Position[];
}