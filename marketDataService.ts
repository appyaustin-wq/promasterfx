import { MarketAsset, PreIPOShare, StockShare } from '../types';

export const INITIAL_MARKETS: MarketAsset[] = [
  {
    id: 'EURUSD',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    price: 1.16315,
    change24h: 0.06,
    high24h: 1.16520,
    low24h: 1.16110,
    volume24h: '$4.2B',
    active: true,
    assetClass: 'Forex',
    sparkline: [1.1610, 1.1622, 1.1618, 1.1629, 1.1635, 1.16315]
  },
  {
    id: 'GBPUSD',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'Forex',
    price: 1.33793,
    change24h: -0.29,
    high24h: 1.34120,
    low24h: 1.33550,
    volume24h: '$2.8B',
    active: true,
    assetClass: 'Forex',
    sparkline: [1.3410, 1.3395, 1.3382, 1.3388, 1.3370, 1.33793]
  },
  {
    id: 'USDJPY',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'Forex',
    price: 159.109,
    change24h: 0.10,
    high24h: 159.450,
    low24h: 158.800,
    volume24h: '$3.1B',
    active: true,
    assetClass: 'Forex',
    sparkline: [158.90, 159.05, 158.85, 159.20, 159.15, 159.109]
  },
  {
    id: 'BTCUSD',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'Crypto',
    price: 79498.00,
    change24h: 1.34,
    high24h: 80250.00,
    low24h: 78100.00,
    volume24h: '$28.4B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [78200, 78600, 79100, 78800, 79600, 79498]
  },
  {
    id: 'ETHUSD',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    category: 'Crypto',
    price: 2511.90,
    change24h: 1.09,
    high24h: 2560.00,
    low24h: 2470.00,
    volume24h: '$14.2B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [2480, 2495, 2520, 2505, 2530, 2511.90]
  },
  {
    id: 'SOLUSD',
    symbol: 'SOL/USD',
    name: 'Solana',
    category: 'Crypto',
    price: 85.42,
    change24h: 11.00,
    high24h: 88.20,
    low24h: 76.50,
    volume24h: '$5.1B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [77.0, 79.5, 82.1, 80.8, 86.0, 85.42]
  },
  {
    id: 'XRPUSD',
    symbol: 'XRP/USD',
    name: 'XRP',
    category: 'Crypto',
    price: 1.10,
    change24h: 10.30,
    high24h: 1.15,
    low24h: 0.98,
    volume24h: '$3.9B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [0.99, 1.02, 1.05, 1.08, 1.12, 1.10]
  },
  {
    id: 'BNBUSD',
    symbol: 'BNB/USD',
    name: 'BNB',
    category: 'Crypto',
    price: 626.37,
    change24h: 4.20,
    high24h: 635.00,
    low24h: 598.00,
    volume24h: '$1.8B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [600, 610, 618, 615, 629, 626.37]
  },
  {
    id: 'GOLD',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'Commodities',
    price: 2685.50,
    change24h: 0.45,
    high24h: 2698.00,
    low24h: 2671.20,
    volume24h: '$18.5B',
    active: true,
    assetClass: 'Commodities',
    sparkline: [2672, 2678, 2682, 2680, 2688, 2685.50]
  },
  {
    id: 'SILVER',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    category: 'Commodities',
    price: 31.85,
    change24h: 0.82,
    high24h: 32.10,
    low24h: 31.40,
    volume24h: '$4.1B',
    active: true,
    assetClass: 'Commodities',
    sparkline: [31.45, 31.60, 31.75, 31.68, 31.92, 31.85]
  },
  {
    id: 'OIL',
    symbol: 'USOIL',
    name: 'Crude Oil WTI',
    category: 'Commodities',
    price: 72.40,
    change24h: -1.15,
    high24h: 73.80,
    low24h: 71.90,
    volume24h: '$8.9B',
    active: true,
    assetClass: 'Commodities',
    sparkline: [73.5, 73.2, 72.8, 72.9, 72.2, 72.40]
  },
  {
    id: 'US30',
    symbol: 'US30',
    name: 'Dow Jones Industrial',
    category: 'Indices',
    price: 43250.00,
    change24h: 0.22,
    high24h: 43400.00,
    low24h: 43100.00,
    volume24h: '$12.1B',
    active: true,
    assetClass: 'Indices',
    sparkline: [43120, 43180, 43220, 43200, 43280, 43250]
  },
  {
    id: 'NAS100',
    symbol: 'NAS100',
    name: 'US Tech 100 CFD',
    category: 'Indices',
    price: 20450.00,
    change24h: 0.85,
    high24h: 20580.00,
    low24h: 20290.00,
    volume24h: '$22.5B',
    active: true,
    assetClass: 'Indices',
    sparkline: [20300, 20380, 20420, 20400, 20480, 20450]
  },
  {
    id: 'SPX500',
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'Indices',
    price: 5890.20,
    change24h: 0.38,
    high24h: 5915.00,
    low24h: 5860.00,
    volume24h: '$34.0B',
    active: true,
    assetClass: 'Indices',
    sparkline: [5865, 5875, 5885, 5880, 5895, 5890.20]
  },
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
    price: 260.81,
    change24h: -0.01,
    high24h: 262.50,
    low24h: 259.10,
    volume24h: '$9.8B',
    active: true,
    assetClass: 'Stocks',
    sparkline: [261.2, 260.5, 261.0, 259.8, 260.9, 260.81]
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Stocks',
    price: 878.35,
    change24h: 3.42,
    high24h: 890.00,
    low24h: 852.00,
    volume24h: '$32.1B',
    active: true,
    assetClass: 'Stocks',
    sparkline: [855, 862, 870, 868, 882, 878.35]
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'Stocks',
    price: 404.88,
    change24h: -0.22,
    high24h: 408.00,
    low24h: 402.50,
    volume24h: '$8.2B',
    active: true,
    assetClass: 'Stocks',
    sparkline: [406, 405, 404, 403.5, 405.5, 404.88]
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'Stocks',
    price: 308.70,
    change24h: 0.54,
    high24h: 312.00,
    low24h: 306.00,
    volume24h: '$6.1B',
    active: true,
    assetClass: 'Stocks',
    sparkline: [306, 307.5, 308, 307.8, 309, 308.70]
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'Stocks',
    price: 175.34,
    change24h: -2.15,
    high24h: 181.00,
    low24h: 173.20,
    volume24h: '$11.4B',
    active: true,
    assetClass: 'Stocks',
    sparkline: [179, 177, 176, 174.5, 176, 175.34]
  },
  {
    id: 'SPCX',
    symbol: 'SPCX',
    name: 'Space Exploration Technologies (Dinari Stock)',
    category: 'Crypto',
    price: 139.98,
    change24h: 2.60,
    high24h: 142.50,
    low24h: 135.00,
    volume24h: '$1.2B',
    active: true,
    assetClass: 'Crypto',
    sparkline: [136, 137, 138.5, 137.9, 140.2, 139.98]
  }
];

export const PRE_IPO_SHARES: PreIPOShare[] = [
  {
    id: 'spacex',
    name: 'SpaceX',
    symbol: 'SPACEX',
    sharePrice: 185.00,
    priceChange: 0,
    availableShares: 49999,
    totalShares: 50000,
    featured: true,
    status: 'Open'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    symbol: 'STRIPE',
    sharePrice: 72.50,
    priceChange: 0,
    availableShares: 100000,
    totalShares: 100000,
    featured: true,
    status: 'Open'
  },
  {
    id: 'canva',
    name: 'Canva',
    symbol: 'CANVA',
    sharePrice: 38.25,
    priceChange: 0,
    availableShares: 120000,
    totalShares: 120000,
    featured: true,
    status: 'Open'
  },
  {
    id: 'databricks',
    name: 'Databricks',
    symbol: 'DATABR',
    sharePrice: 54.00,
    priceChange: 0,
    availableShares: 75000,
    totalShares: 75000,
    featured: false,
    status: 'Upcoming'
  }
];

export const STOCK_SHARES: StockShare[] = [
  { id: 'googl', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 308.70, change24h: 0.54, icon: 'G' },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 212.65, change24h: -0.78, icon: 'A' },
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', price: 260.81, change24h: -0.01, icon: '🍎' },
  { id: 'ba', symbol: 'BA', name: 'Boeing Company', price: 223.11, change24h: -0.82, icon: '✈️' },
  { id: 'intc', symbol: 'INTC', name: 'Intel Corporation', price: 42.31, change24h: -0.56, icon: '💻' },
  { id: 'jpm', symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 335.47, change24h: 1.47, icon: '🏛️' },
  { id: 'meta', symbol: 'META', name: 'Meta Platforms Inc.', price: 502.18, change24h: 1.58, icon: '♾️' },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', price: 404.88, change24h: -0.22, icon: '🪟' },
  { id: 'nflx', symbol: 'NFLX', name: 'Netflix Inc.', price: 628.73, change24h: 0.45, icon: '🍿' },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 878.35, change24h: 3.42, icon: '🟢' },
  { id: 'pypl', symbol: 'PYPL', name: 'PayPal Holdings', price: 63.28, change24h: 0.72, icon: '🅿️' },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', price: 175.34, change24h: -2.15, icon: '⚡' }
];

// Helper to simulate slight price fluctuations
export function generatePriceFluctuation(currentPrice: number): number {
  const deltaPercent = (Math.random() - 0.49) * 0.002; // Small random walk ~0.1%
  const newPrice = currentPrice * (1 + deltaPercent);
  // Precision check
  if (currentPrice < 10) {
    return Math.round(newPrice * 10000) / 10000;
  } else if (currentPrice < 1000) {
    return Math.round(newPrice * 100) / 100;
  }
  return Math.round(newPrice * 10) / 10;
}
