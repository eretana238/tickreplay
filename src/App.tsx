import { useEffect, useState } from 'react';
import './App.css'
import type { OHLCV } from './models/OHLCV';
import CandlestickChartWidget from './components/TradingviewChart';

function App() {
  const [data, setData] = useState<OHLCV[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // List of all data files in the folder, sorted by name
      const files = [
        'glbx-mdp3-20241212-20241214.ohlcv-1m.json',
        'glbx-mdp3-20241215-20241221.ohlcv-1m.json',
        'glbx-mdp3-20241222-20241228.ohlcv-1m.json',
        'glbx-mdp3-20241229-20250104.ohlcv-1m.json',
        'glbx-mdp3-20250105-20250111.ohlcv-1m.json',
        'glbx-mdp3-20250112-20250118.ohlcv-1m.json',
        'glbx-mdp3-20250119-20250125.ohlcv-1m.json',
        'glbx-mdp3-20250126-20250201.ohlcv-1m.json',
        'glbx-mdp3-20250202-20250208.ohlcv-1m.json',
        'glbx-mdp3-20250209-20250215.ohlcv-1m.json',
        'glbx-mdp3-20250216-20250222.ohlcv-1m.json',
        'glbx-mdp3-20250223-20250301.ohlcv-1m.json',
        'glbx-mdp3-20250302-20250308.ohlcv-1m.json',
        'glbx-mdp3-20250309-20250315.ohlcv-1m.json',
        'glbx-mdp3-20250316-20250322.ohlcv-1m.json',
        'glbx-mdp3-20250323-20250329.ohlcv-1m.json',
        'glbx-mdp3-20250330-20250405.ohlcv-1m.json',
        'glbx-mdp3-20250406-20250412.ohlcv-1m.json',
        'glbx-mdp3-20250413-20250419.ohlcv-1m.json',
        'glbx-mdp3-20250420-20250426.ohlcv-1m.json',
        'glbx-mdp3-20250427-20250503.ohlcv-1m.json',
        'glbx-mdp3-20250504-20250510.ohlcv-1m.json',
        'glbx-mdp3-20250511-20250517.ohlcv-1m.json',
        'glbx-mdp3-20250518-20250524.ohlcv-1m.json',
        'glbx-mdp3-20250525-20250531.ohlcv-1m.json',
        'glbx-mdp3-20250601-20250607.ohlcv-1m.json',
        'glbx-mdp3-20250608-20250611.ohlcv-1m.json',
      ];
      files.sort();
      const ohlcvMap = new Map<string, OHLCV>();
      for (const file of files) {
        const response = await fetch(`./data/${file}`);
        if (!response.ok) {
          console.error('Failed to fetch OHLCV data:', file, response.statusText);
          continue;
        }
        const text = await response.text();
        if (!text) continue;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        let changed = false;
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            const ohlcv: OHLCV = obj;
            const key = ohlcv.hd.ts_event;
            if (ohlcv.symbol == "ESZ4") {
              if (!ohlcvMap.has(key)) {
                ohlcvMap.set(key, ohlcv);
                changed = true;
              }
            }
          } catch {
            // Ignore malformed lines
            console.warn('Malformed line in OHLCV data:', line);
            continue;
          }
        }
        if (changed) {
          setData(Array.from(ohlcvMap.values()));
        }
      }
      console.log(`Parsed ${ohlcvMap.size} OHLCV records`);
    };
    fetchData();
  }, []);
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <header className="h-12 flex items-center px-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-lg font-bold">Backtest Trading App</h1>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CandlestickChartWidget data={data} candleWidth={10} />
          </div>
          {/* Trade History Section */}
          <div className="h-40 bg-gray-800 border-t border-gray-700 overflow-y-auto p-4">
            <h2 className="text-md font-semibold mb-2">Trade History</h2>
            <div className="text-gray-400">No trades yet.</div>
          </div>
        </div>
        {/* Right Side Buy/Sell Buttons */}
        <div className="w-32 flex flex-col items-center justify-center bg-gray-800 border-l border-gray-700 p-4">
          <button className="w-full mb-4 py-2 rounded bg-green-600 hover:bg-green-700 font-bold">Buy</button>
          <button className="w-full py-2 rounded bg-red-600 hover:bg-red-700 font-bold">Sell</button>
        </div>
      </div>
    </div>
  );
}

export default App
