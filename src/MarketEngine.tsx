import { useMemo, useState } from 'react';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { useMarketFeed } from './marketFeed';

const pairs = ['EUR/USD', 'GBP/USD', 'AUD/USD'];

function calculateRsi(values: number[]) {
  if (values.length < 15) return 50;
  const changes = values.slice(1).map((value, index) => value - values[index]);
  const recent = changes.slice(-14);
  const gains = recent.filter((value) => value > 0).reduce((sum, value) => sum + value, 0) / 14;
  const losses = Math.abs(recent.filter((value) => value < 0).reduce((sum, value) => sum + value, 0)) / 14;
  if (losses === 0) return 100;
  return 100 - 100 / (1 + gains / losses);
}

export default function MarketEngine() {
  const [pair, setPair] = useState('EUR/USD');
  const { prices, candles } = useMarketFeed();
  const data = candles[pair] || [];
  const price = prices[pair] || 0;
  const previous = data[data.length - 2]?.close || price;
  const rising = price >= previous;
  const values = data.map((candle) => candle.close);
  const rsi = calculateRsi(values);
  const movingAverage = useMemo(
    () => values.map((_, index) => {
      const sample = values.slice(Math.max(0, index - 8), index + 1);
      return sample.reduce((sum, value) => sum + value, 0) / sample.length;
    }),
    [values.join('|')],
  );
  const min = Math.min(...data.map((candle) => candle.low));
  const max = Math.max(...data.map((candle) => candle.high));
  const range = max - min || 0.0001;
  const y = (value: number) => 250 - ((value - min) / range) * 215;
  const x = (index: number) => 18 + index * (764 / Math.max(1, data.length - 1));
  const maPath = movingAverage.map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`).join(' ');

  return (
    <section className="market-engine">
      <div className="market-engine-head">
        <div>
          <span className="eyebrow">PIPSMART SIMULATED MARKET ENGINE</span>
          <h2>Watch the market move.</h2>
          <p>Practice prices update automatically and are shared with the demo terminal.</p>
        </div>
        <span className="sim-live-label"><span /> SIMULATED LIVE</span>
      </div>
      <div className="market-engine-controls">
        <div className="market-pair-tabs">
          {pairs.map((symbol) => (
            <button key={symbol} className={pair === symbol ? 'active' : ''} onClick={() => setPair(symbol)}>{symbol}</button>
          ))}
        </div>
        <div className={rising ? 'market-current-price up' : 'market-current-price down'}>
          <strong>{price.toFixed(5)}</strong>
          <span>{rising ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{rising ? 'Moving up' : 'Moving down'}</span>
        </div>
      </div>
      <div className="market-chart-shell">
        <div className="market-chart-legend"><span><i className="legend-candle" /> Candlesticks</span><span><i className="legend-ma" /> Moving average (9)</span><small>Each candle is generated practice data</small></div>
        <svg className="market-candle-chart" viewBox="0 0 800 285" role="img" aria-label={`Simulated candlestick chart for ${pair}`}>
          {[35, 88, 141, 194, 247].map((line) => <line key={line} x1="12" x2="788" y1={line} y2={line} className="chart-grid-line" />)}
          {data.map((candle, index) => {
            const bullish = candle.close >= candle.open;
            const bodyTop = y(Math.max(candle.open, candle.close));
            const bodyBottom = y(Math.min(candle.open, candle.close));
            const width = Math.max(5, 650 / data.length);
            return <g key={index}>
              <line x1={x(index)} x2={x(index)} y1={y(candle.high)} y2={y(candle.low)} className={bullish ? 'candle-wick bullish' : 'candle-wick bearish'} />
              <rect x={x(index) - width / 2} y={bodyTop} width={width} height={Math.max(2, bodyBottom - bodyTop)} rx="1" className={bullish ? 'candle-body bullish' : 'candle-body bearish'} />
            </g>;
          })}
          <path d={maPath} className="moving-average-line" />
        </svg>
        <div className="market-chart-footer"><span>Earlier</span><span>Latest practice candle →</span></div>
      </div>
      <div className="market-indicator-row">
        <div className="market-indicator-card"><div><Activity size={15} /><span>RSI (14)</span></div><strong>{rsi.toFixed(1)}</strong><small>{rsi >= 70 ? 'High momentum zone' : rsi <= 30 ? 'Low momentum zone' : 'Middle range'}</small><div className="rsi-track"><span style={{ left: `${rsi}%` }} /></div></div>
        <div className="market-indicator-card"><div><span className="legend-ma" /><span>Moving Average (9)</span></div><strong>{(movingAverage[movingAverage.length - 1] || price).toFixed(5)}</strong><small>Average of recent practice closes</small></div>
      </div>
      <p className="market-engine-note">Important: These are randomly simulated prices, not actual Forex quotes or trading signals. The chart is for learning how candles and indicators work. The demo terminal uses the same simulated price stream.</p>
    </section>
  );
}
