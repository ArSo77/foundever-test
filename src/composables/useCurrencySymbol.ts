export default function useCurrencySymbol(currencyActive: string) {
  switch (currencyActive) {
    case "btc":
      return "฿";
    case "eur":
      return "€";
    case "usd":
      return "$";
    default:
      return currencyActive;
  }
}
