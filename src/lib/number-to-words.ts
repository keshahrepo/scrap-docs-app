import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "en-US",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Dollar",
      plural: "Dollars",
      symbol: "$",
      fractionalUnit: {
        name: "Cent",
        plural: "Cents",
        symbol: "",
      },
    },
  },
});

export function amountInWords(amount: number): string {
  return toWords.convert(amount, { currency: true }).toUpperCase();
}
