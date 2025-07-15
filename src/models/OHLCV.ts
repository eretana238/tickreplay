export interface OHLCV {
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