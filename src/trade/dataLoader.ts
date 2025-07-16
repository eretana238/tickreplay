import type { UTCTimestamp } from 'lightweight-charts';
import type { OHLCV, RawOHLCV } from './types';

function UTCTime(ts: string): UTCTimestamp {
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

export async function loadOHLCVData(): Promise<OHLCV[]> {
    // List of all data files in the folder, sorted by name
    const data: OHLCV[] = [];
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
                const ohlcv: RawOHLCV = obj;
                const key = UTCTime(ohlcv.hd.ts_event);
                
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
            data.push(...Array.from(ohlcvMap.values()));
        }
    }
    console.log(`Parsed ${ohlcvMap.size} OHLCV records`);
    return data;
};
