// Currency Conversion and Exchange Rate Engine for Promaster FX
// Handles standardized USD base conversions, signup bonus calculations, and multi-currency formatting

export const SIGNUP_BONUS_USD = 10.00;

export interface CurrencyDetails {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // 1 USD = X Target Currency
}

// Comprehensive exchange rates against 1 USD
export const EXCHANGE_RATES: Record<string, { symbol: string; name: string; rate: number }> = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1.0 },
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1500.0 }, // 1 USD = 1,500 NGN
  EUR: { symbol: '€', name: 'Euro', rate: 0.85 }, // 1 USD = 0.85 EUR
  GBP: { symbol: '£', name: 'British Pound', rate: 0.75 }, // 1 USD = 0.75 GBP
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 159.10 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', rate: 0.88 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 83.50 },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 18.25 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', rate: 5.45 },
  AED: { symbol: 'AED', name: 'UAE Dirham', rate: 3.67 },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal', rate: 3.75 },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', rate: 15.50 },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 130.0 },
  TRY: { symbol: '₺', name: 'Turkish Lira', rate: 34.20 },
  MXN: { symbol: 'Mex$', name: 'Mexican Peso', rate: 19.30 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 1.32 },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.64 },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.78 },
  KRW: { symbol: '₩', name: 'South Korean Won', rate: 1380.0 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', rate: 10.40 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', rate: 10.65 },
  DKK: { symbol: 'kr', name: 'Danish Krone', rate: 6.85 },
  PLN: { symbol: 'zł', name: 'Polish Zloty', rate: 3.95 },
  THB: { symbol: '฿', name: 'Thai Baht', rate: 33.50 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15600.0 },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.35 },
  PHP: { symbol: '₱', name: 'Philippine Peso', rate: 57.0 },
  VND: { symbol: '₫', name: 'Vietnamese Dong', rate: 24800.0 },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', rate: 48.50 },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', rate: 278.0 },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', rate: 119.50 },
  COP: { symbol: 'COL$', name: 'Colombian Peso', rate: 4180.0 },
  CLP: { symbol: 'CLP$', name: 'Chilean Peso', rate: 935.0 },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', rate: 3.75 },
  ARS: { symbol: 'AR$', name: 'Argentine Peso', rate: 980.0 },
  QAR: { symbol: 'QR', name: 'Qatari Riyal', rate: 3.64 },
  KWD: { symbol: 'KD', name: 'Kuwaiti Dinar', rate: 0.31 },
  BHD: { symbol: 'BD', name: 'Bahraini Dinar', rate: 0.38 },
  OMR: { symbol: 'OMR', name: 'Omani Rial', rate: 0.385 },
  JOD: { symbol: 'JD', name: 'Jordanian Dinar', rate: 0.71 },
  ILS: { symbol: '₪', name: 'Israeli New Shekel', rate: 3.72 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', rate: 23.20 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', rate: 365.0 },
  RON: { symbol: 'lei', name: 'Romanian Leu', rate: 4.55 },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', rate: 1.78 },
  HRK: { symbol: 'kn', name: 'Croatian Kuna', rate: 7.0 },
  RSD: { symbol: 'дин', name: 'Serbian Dinar', rate: 108.0 },
  UAH: { symbol: '₴', name: 'Ukrainian Hryvnia', rate: 41.20 },
  KZT: { symbol: '₸', name: 'Kazakhstani Tenge', rate: 485.0 },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2720.0 },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', rate: 3680.0 },
  RWF: { symbol: 'RWF', name: 'Rwandan Franc', rate: 1350.0 },
  XOF: { symbol: 'CFA', name: 'West African CFA Franc', rate: 600.0 },
  XAF: { symbol: 'FCFA', name: 'Central African CFA Franc', rate: 600.0 },
  MAD: { symbol: 'DH', name: 'Moroccan Dirham', rate: 9.80 },
  DZD: { symbol: 'DA', name: 'Algerian Dinar', rate: 133.50 },
  TND: { symbol: 'DT', name: 'Tunisian Dinar', rate: 3.08 }
};

/**
 * Parses raw currency string (e.g. "NGN (₦) — Nigerian Naira" or "EUR") into clean details.
 */
export function getCurrencyDetails(currencyInput?: string): CurrencyDetails {
  if (!currencyInput || typeof currencyInput !== 'string') {
    return {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      rateAgainstUSD: 1.0
    };
  }

  const trimmed = currencyInput.trim();

  // Try extracting standard 3-letter code from beginning: e.g. "NGN (₦) — Nigerian Naira" -> "NGN"
  const matchCode = trimmed.match(/^([A-Z]{3})\b/);
  const code = matchCode ? matchCode[1] : trimmed.substring(0, 3).toUpperCase();

  // Extract symbol in parentheses if available: e.g. "(₦)" -> "₦"
  const matchSymbol = trimmed.match(/\(([^)]+)\)/);
  let symbol = matchSymbol ? matchSymbol[1] : '$';

  // Extract name after dash if available: e.g. "— Nigerian Naira" -> "Nigerian Naira"
  const matchName = trimmed.split('—')[1];
  let name = matchName ? matchName.trim() : (trimmed.split('-')[1]?.trim() || code);

  // If in our curated map, use known rate and override defaults
  const known = EXCHANGE_RATES[code];
  if (known) {
    if (!matchSymbol) symbol = known.symbol;
    if (!matchName) name = known.name;
    return {
      code,
      symbol,
      name,
      rateAgainstUSD: known.rate
    };
  }

  return {
    code: code || 'USD',
    symbol: symbol || '$',
    name: name || 'Currency',
    rateAgainstUSD: 1.0 // Default 1:1 if rate unknown
  };
}

/**
 * Converts a USD value to the specified target currency.
 */
export function convertUSDToCurrency(amountUSD: number, currencyInput?: string): number {
  if (typeof amountUSD !== 'number' || isNaN(amountUSD)) return 0;
  const details = getCurrencyDetails(currencyInput);
  const raw = amountUSD * details.rateAgainstUSD;
  // Round to 2 decimal places (or integer for high rate currencies like JPY, NGN, IDR)
  if (details.rateAgainstUSD >= 100) {
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

/**
 * Converts a target currency value back to USD.
 */
export function convertCurrencyToUSD(amountInTargetCurrency: number, currencyInput?: string): number {
  if (typeof amountInTargetCurrency !== 'number' || isNaN(amountInTargetCurrency)) return 0;
  const details = getCurrencyDetails(currencyInput);
  if (details.rateAgainstUSD <= 0) return amountInTargetCurrency;
  const raw = amountInTargetCurrency / details.rateAgainstUSD;
  return Math.round(raw * 100) / 100;
}

/**
 * Calculates the standard Signup Bonus for a given currency.
 * Fixed standard signup bonus is $10.00 USD.
 * E.g. USD -> 10, NGN -> 15000, EUR -> 8.50, GBP -> 7.50
 */
export function calculateSignupBonus(currencyInput?: string): {
  usdAmount: number;
  convertedAmount: number;
  formattedAmount: string;
  currencyCode: string;
  currencySymbol: string;
} {
  const details = getCurrencyDetails(currencyInput);
  const converted = convertUSDToCurrency(SIGNUP_BONUS_USD, currencyInput);
  const formatted = formatCurrencyAmount(converted, currencyInput);

  return {
    usdAmount: SIGNUP_BONUS_USD,
    convertedAmount: converted,
    formattedAmount: formatted,
    currencyCode: details.code,
    currencySymbol: details.symbol
  };
}

/**
 * Formats an amount in the given currency with proper symbol and separators.
 */
export function formatCurrencyAmount(
  amount: number,
  currencyInput?: string,
  options?: { showCode?: boolean; decimals?: number }
): string {
  if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
  const details = getCurrencyDetails(currencyInput);
  
  const decimals = options?.decimals !== undefined 
    ? options.decimals 
    : (details.rateAgainstUSD >= 100 && Number.isInteger(amount) ? 0 : 2);

  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (options?.showCode) {
    return `${details.symbol}${formattedNumber} ${details.code}`;
  }

  return `${details.symbol}${formattedNumber}`;
}
