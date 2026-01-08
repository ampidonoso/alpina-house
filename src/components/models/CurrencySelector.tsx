import { Currency, CURRENCY_LABELS, getAvailableCurrencies } from "@/lib/priceUtils";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  priceRange: string | null;
}

const CurrencySelector = ({ value, onChange, priceRange }: CurrencySelectorProps) => {
  const available = getAvailableCurrencies(priceRange);
  const currencies: Currency[] = ['usd', 'clp', 'uf'];
  
  return (
    <div className="flex items-center gap-1 bg-stone-800/50 backdrop-blur-sm rounded-lg p-1">
      {currencies.map((currency) => (
        <button
          key={currency}
          onClick={() => onChange(currency)}
          disabled={!available.includes(currency) && available.length > 0}
          className={`
            px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-all
            ${value === currency 
              ? 'bg-primary text-primary-foreground' 
              : 'text-stone-400 hover:text-white'
            }
            ${!available.includes(currency) && available.length > 0 ? 'opacity-30 cursor-not-allowed' : ''}
          `}
        >
          {CURRENCY_LABELS[currency]}
        </button>
      ))}
    </div>
  );
};

export default CurrencySelector;
