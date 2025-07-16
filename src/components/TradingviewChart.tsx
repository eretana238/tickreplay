import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { ISeriesApi, IChartApi, UTCTimestamp } from 'lightweight-charts';
import type { OHLCV } from '../trade/types';

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

    

    const chartData = data
      .map((item) => ({
        time: item.timestamp as UTCTimestamp,
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
