import { MineralsInput, CategoryZakatResult } from "../core/types";
import { STANDARD_ZAKAT_RATE } from "../core/constants";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for minerals and natural resources (الثروة المعدنية)
 *
 * Per the Moroccan High Scientific Council Fatwa:
 *   "الثروة المعدنية: تجب فيها الزكاة بمجرد استخراجها،
 *    ويمكن تأخيرها على ألا يتعدى التأخير عاما"
 *   (Mineral wealth: Zakat is due upon extraction;
 *    it may be deferred but not beyond one year.)
 *
 * Rate: 2.5% on net value (same as trade goods / عروض), after deducting
 * extraction and processing costs, provided the net value meets nisab.
 *
 * This covers: mining, quarrying, oil/gas extraction, salt, precious stones,
 * and any other natural resource extracted from the earth.
 *
 * @param input - Minerals calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for minerals
 */
export function calculateMineralsZakat(
  input: MineralsInput,
  nisab: number,
): CategoryZakatResult {
  validateMineralsInput(input);

  const { extractedValue, extractionCosts } = input;

  // Net value after deducting extraction and processing costs
  const netValue = Math.max(0, extractedValue - extractionCosts);

  // Zakat = 2.5% if net value meets nisab threshold
  const zakatAmount = meetsNisab(netValue, nisab)
    ? netValue * STANDARD_ZAKAT_RATE
    : 0;

  return {
    zakatAmount,
    isApplicable: zakatAmount > 0,
    netWealth: netValue,
  };
}

/**
 * Validates minerals input parameters
 *
 * @param input - Minerals input to validate
 * @throws Error if input is invalid
 */
export function validateMineralsInput(input: MineralsInput): void {
  const { extractedValue, extractionCosts } = input;

  if (
    typeof extractedValue !== "number" ||
    !isFinite(extractedValue) ||
    extractedValue < 0
  ) {
    throw new Error("Extracted value must be a non-negative finite number");
  }

  if (
    typeof extractionCosts !== "number" ||
    !isFinite(extractionCosts) ||
    extractionCosts < 0
  ) {
    throw new Error("Extraction costs must be a non-negative finite number");
  }
}
