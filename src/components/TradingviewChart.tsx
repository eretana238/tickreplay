import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { ISeriesApi, IChartApi, UTCTimestamp } from 'lightweight-charts';
import type { OHLCV } from '../models/OHLCV';

interface TradingviewChartProps {
  data: OHLCV[];
  candleWidth?: number;
}

const TradingviewChart: React.FC<TradingviewChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#181818' },
        textColor: '#DDD',
      },
      crosshair: {
        mode: 0, // 1 for normal mode, 2 for magnet mode
      },
      grid: {
        vertLines: { color: '#222' },
        horzLines: { color: '#222' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4FFF00',
      downColor: '#FF4976',
      borderUpColor: '#4FFF00',
      borderDownColor: '#FF4976',
      wickUpColor: '#4FFF00',
      wickDownColor: '#FF4976',
    });
    seriesRef.current = candleSeries;

    // Filter out invalid timestamps and sort by time ascending
    const UTCTime = (ts: string): UTCTimestamp => {
      // Convert UTC timestamp to America/Chicago time (Central)
      const date = new Date(ts);
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') {
          acc[part.type] = part.value;
        }
        return acc;
      }, {});
      const year = parts.year!;
      const month = parts.month!;
      const day = parts.day!;
      const hour = parts.hour!;
      const minute = parts.minute!;
      const second = parts.second!;
      // Build an ISO string for the central time and parse as UTC
      const centralDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      return (centralDate.getTime() / 1000) as UTCTimestamp;
    };

    const chartData = data
      .map((item) => ({
        time: UTCTime(item.hd.ts_event),
        open:  Number(item.open),
        high:  Number(item.high),
        low:   Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume),
      }))
      .filter(d => !isNaN(Number(d.time)))
      .sort((a, b) => a.time - b.time);
    candleSeries.setData(chartData);

    // Add volume series using HistogramSeries as in TradingView docs
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });

    const volumeData = chartData.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close > d.open ? '#4FFF00' : '#FF4976',
    }));

    volumeSeries.setData(volumeData);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default TradingviewChart;
