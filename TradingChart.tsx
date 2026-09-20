import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../../types';
import { BarChart2, LineChart } from 'lucide-react';

interface TradingChartProps {
  asset: MarketAsset;
}

export const TradingChart: React.FC<TradingChartProps> = ({ asset }) => {
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [showIndicators, setShowIndicators] = useState<{ ma: boolean; rsi: boolean; macd: boolean; volume: boolean }>({
    ma: true,
    rsi: false,
    macd: true,
    volume: true
  });

  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [hoverData, setHoverData] = useState<{ time: string; open: number; high: number; low: number; close: number; volume: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 360 });

  // Handle dynamic canvas resizing via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const w = Math.max(Math.floor(entry.contentRect.width), 280);
          const h = Math.max(Math.floor(entry.contentRect.height), 260);
          setCanvasDimensions({ width: w, height: h });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate candle dataset based on asset price & timeframe
  const generateCandleData = () => {
    const candlesCount = 50;
    const basePrice = asset.price;
    const volatility = basePrice * 0.003;
    const data = [];

    let current = basePrice * (1 - (asset.change24h / 100) * 0.5);

    for (let i = 0; i < candlesCount; i++) {
      const open = current;
      const change = (Math.random() - 0.48) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.6;
      const low = Math.min(open, close) - Math.random() * volatility * 0.6;
      const volume = Math.floor(Math.random() * 50000) + 10000;

      const timeDate = new Date(Date.now() - (candlesCount - i) * 5 * 60 * 1000);
      const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      data.push({ time: timeStr, open, high, low, close, volume });
      current = close;
    }

    // Ensure last candle close matches live asset price
    if (data.length > 0) {
      const last = data[data.length - 1];
      last.close = asset.price;
      last.high = Math.max(last.high, asset.price);
      last.low = Math.min(last.low, asset.price);
    }

    return data;
  };

  const [candles, setCandles] = useState(generateCandleData());

  useEffect(() => {
    setCandles(generateCandleData());
  }, [asset.id, timeframe]);

  // Update last candle close when live price fluctuates
  useEffect(() => {
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      const last = { ...copy[lastIdx] };
      last.close = asset.price;
      last.high = Math.max(last.high, asset.price);
      last.low = Math.min(last.low, asset.price);
      copy[lastIdx] = last;
      return copy;
    });
  }, [asset.price]);

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvasDimensions.width;
    const height = canvasDimensions.height;

    // Set internal resolution
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Determine min and max prices
    let minPrice = Math.min(...candles.map(c => c.low));
    let maxPrice = Math.max(...candles.map(c => c.high));
    const padding = (maxPrice - minPrice) * 0.1 || 1;
    minPrice -= padding;
    maxPrice += padding;

    const priceToY = (price: number) => {
      return height - 40 - ((price - minPrice) / (maxPrice - minPrice)) * (height - 70);
    };

    // Draw background grid lines
    ctx.strokeStyle = '#1e2638';
    ctx.lineWidth = 1;

    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = 25 + (i * (height - 65)) / gridRows;
      const priceVal = maxPrice - (i * (maxPrice - minPrice)) / gridRows;

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(35, y);
      ctx.lineTo(width - 55, y);
      ctx.stroke();

      // Price labels on right
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(asset.price < 10 ? 4 : 2), width - 50, y + 3);
    }

    ctx.setLineDash([]);

    const leftMargin = 35;
    const rightMargin = 55;
    const plotWidth = Math.max(width - leftMargin - rightMargin, 50);
    const candleWidth = plotWidth / candles.length;
    const startX = leftMargin;

    // Draw Volume Bars if enabled
    if (showIndicators.volume) {
      const maxVol = Math.max(...candles.map(c => c.volume));
      candles.forEach((c, idx) => {
        const x = startX + idx * candleWidth + candleWidth / 2;
        const volHeight = (c.volume / maxVol) * 35;
        const y = height - 15 - volHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x - candleWidth * 0.35, y, candleWidth * 0.7, volHeight);
      });
    }

    // Draw Candlesticks or Line Chart
    if (chartType === 'candlestick') {
      candles.forEach((c, idx) => {
        const x = startX + idx * candleWidth + candleWidth / 2;
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);
        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);
        const isUp = c.close >= c.open;

        const color = isUp ? '#10b981' : '#ef4444';

        // High / Low Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(openY - closeY), 2);

        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth * 0.35, bodyY, candleWidth * 0.7, bodyHeight);
      });
    } else {
      // Line Chart with Gradient Fill
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(234, 179, 8, 0.35)');
      gradient.addColorStop(1, 'rgba(234, 179, 8, 0.0)');

      candles.forEach((c, idx) => {
        const x = startX + idx * candleWidth + candleWidth / 2;
        const y = priceToY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Close path for area fill
      const lastX = startX + (candles.length - 1) * candleWidth + candleWidth / 2;
      const firstX = startX + candleWidth / 2;
      ctx.lineTo(lastX, height - 15);
      ctx.lineTo(firstX, height - 15);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Moving Average Indicator
    if (showIndicators.ma) {
      const maPeriod = 10;
      ctx.beginPath();
      let maStarted = false;
      for (let i = maPeriod - 1; i < candles.length; i++) {
        const slice = candles.slice(i - maPeriod + 1, i + 1);
        const maVal = slice.reduce((acc, curr) => acc + curr.close, 0) / maPeriod;
        const x = startX + i * candleWidth + candleWidth / 2;
        const y = priceToY(maVal);

        if (!maStarted) {
          ctx.moveTo(x, y);
          maStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = '#3b82f6'; // Blue MA line
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Crosshair on mouse move
    if (mousePos.active && mousePos.x >= leftMargin && mousePos.x <= width - rightMargin) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 15);
      ctx.lineTo(mousePos.x, height - 15);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(leftMargin, mousePos.y);
      ctx.lineTo(width - rightMargin, mousePos.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Index of hovered candle
      const hoveredIdx = Math.floor((mousePos.x - startX) / candleWidth);
      if (hoveredIdx >= 0 && hoveredIdx < candles.length) {
        setHoverData(candles[hoveredIdx]);
      }
    } else {
      setHoverData(candles[candles.length - 1] || null);
    }

  }, [candles, chartType, showIndicators, mousePos, canvasDimensions, asset.price]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y, active: true });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    setMousePos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, active: false });
  };

  const isUp = asset.change24h >= 0;

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-xl w-full max-w-full min-w-0 box-border overflow-hidden">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2638] pb-3 w-full max-w-full min-w-0">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg font-bold text-white break-words">{asset.symbol}</span>
              <span className="text-[10px] sm:text-xs bg-[#1a2333] text-slate-300 px-2 py-0.5 rounded border border-[#2b374e] shrink-0">
                {asset.category}
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 truncate">{asset.name}</div>
          </div>

          <div className="h-8 w-px bg-[#1e2638] hidden sm:block shrink-0"></div>

          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-lg sm:text-xl font-mono font-bold text-white whitespace-nowrap">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 10 ? 4 : 2 })}
            </span>
            <span className={`text-[11px] sm:text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
              {isUp ? '+' : ''}{asset.change24h}%
            </span>
          </div>
        </div>

        {/* Timeframe & Chart Type Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full min-w-0">
          <div className="flex bg-[#0a0d14] p-0.5 sm:p-1 rounded-lg border border-[#1e2638] overflow-x-auto scrollbar-none max-w-full">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded transition-all whitespace-nowrap ${timeframe === tf ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex bg-[#0a0d14] p-0.5 sm:p-1 rounded-lg border border-[#1e2638] shrink-0">
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-1 sm:p-1.5 rounded transition-all ${chartType === 'candlestick' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1 sm:p-1.5 rounded transition-all ${chartType === 'line' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              title="Line Chart"
            >
              <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowIndicators(prev => ({ ...prev, ma: !prev.ma }))}
            className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded border transition-all shrink-0 whitespace-nowrap ${showIndicators.ma ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-[#0a0d14] text-slate-400 border-[#1e2638]'}`}
          >
            MA (10)
          </button>
          <button
            onClick={() => setShowIndicators(prev => ({ ...prev, volume: !prev.volume }))}
            className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded border transition-all shrink-0 whitespace-nowrap ${showIndicators.volume ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-[#0a0d14] text-slate-400 border-[#1e2638]'}`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* OHLC Bar Display on Hover */}
      {hoverData && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono bg-[#0a0d14] px-2.5 sm:px-3 py-1.5 rounded-md border border-[#1e2638] text-slate-300 w-full max-w-full min-w-0 overflow-x-auto scrollbar-none">
          <span className="whitespace-nowrap">TIME: <strong className="text-white">{hoverData.time}</strong></span>
          <span className="whitespace-nowrap">O: <strong className="text-white">${hoverData.open.toFixed(asset.price < 10 ? 4 : 2)}</strong></span>
          <span className="whitespace-nowrap">H: <strong className="text-emerald-400">${hoverData.high.toFixed(asset.price < 10 ? 4 : 2)}</strong></span>
          <span className="whitespace-nowrap">L: <strong className="text-rose-400">${hoverData.low.toFixed(asset.price < 10 ? 4 : 2)}</strong></span>
          <span className="whitespace-nowrap">C: <strong className="text-amber-400">${hoverData.close.toFixed(asset.price < 10 ? 4 : 2)}</strong></span>
          <span className="whitespace-nowrap">VOL: <strong className="text-slate-400">{hoverData.volume.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[280px] sm:h-[360px] bg-[#0a0d14] rounded-xl overflow-hidden border border-[#1e2638] max-w-full min-w-0 box-border">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleMouseLeave}
          className="w-full h-full cursor-crosshair block touch-none"
        />
      </div>
    </div>
  );
};
