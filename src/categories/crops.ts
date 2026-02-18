import { CropsInput, CategoryZakatResult } from "../core/types";
import {
  CROPS_MINIMUM_THRESHOLD_KG,
  RAIN_FED_CROPS_RATE,
  IRRIGATED_CROPS_RATE,
  STANDARD_ZAKAT_RATE,
} from "../core/constants";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for agricultural crops
 *
 * Rules per the fatwa:
 * - If harvest < 653 kg: No Zakat
 * - If harvest >= 653 kg:
 *   - Rain-fed irrigation: 10% of harvest
 *   - Artificial irrigation: 5% of harvest
 * - If sold commercially: Treated as trade goods at 2.5% of market value
 *
 * Unit handling:
 * - When marketValuePerKg is provided: zakatAmount is monetary (MAD), safe to sum with other categories
 * - When marketValuePerKg is NOT provided: zakatAmount = 0, zakatAmountKg holds the physical
 *   crop amount due in kind. This prevents mixing KG units with MAD in the monetary total.
 *
 * @param input - Crops calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for crops
 */
export function calculateCropsZakat(
  input: CropsInput,
  nisab: number,
): CategoryZakatResult {
  // Validate input first
  validateCropsInput(input);

  const {
    harvestKg,
    irrigationMethod,
    soldCommercially = false,
    marketValuePerKg = 0,
  } = input;

  // Check minimum threshold (653 kg = 5 awsuq / 300 sa')
  if (harvestKg < CROPS_MINIMUM_THRESHOLD_KG) {
    return {
      zakatAmount: 0,
      isApplicable: false,
      netWealth: 0,
    };
  }

  if (soldCommercially) {
    // Commercially traded crops → treated as trade goods (عروض)
    // Rate: 2.5% on market value, only if value meets nisab
    const netWealth = harvestKg * marketValuePerKg;
    const zakatAmount = meetsNisab(netWealth, nisab)
      ? netWealth * STANDARD_ZAKAT_RATE
      : 0;
    return {
      zakatAmount,
      isApplicable: zakatAmount > 0,
      netWealth,
    };
  }

  // Non-commercial subsistence crops: rate is 10% (rain) or 5% (irrigated)
  const rate =
    irrigationMethod === "rain" ? RAIN_FED_CROPS_RATE : IRRIGATED_CROPS_RATE;
  const zakatKg = harvestKg * rate;

  if (marketValuePerKg > 0) {
    // Market price available → convert to monetary zakat so it can be summed with other categories
    const netWealth = harvestKg * marketValuePerKg;
    const zakatAmount = zakatKg * marketValuePerKg;
    return {
      zakatAmount,
      isApplicable: true,
      netWealth,
    };
  }

  // No market price → return physical zakat in kind.
  // zakatAmount stays 0 (monetary) so it does NOT corrupt the MAD total.
  // zakatAmountKg carries the physical obligation.
  return {
    zakatAmount: 0,
    isApplicable: true,
    netWealth: harvestKg,
    zakatAmountKg: zakatKg,
  };
}

/**
 * Validates crops input parameters
 *
 * @param input - Crops input to validate
 * @throws Error if input is invalid
 */
export function validateCropsInput(input: CropsInput): void {
  const { harvestKg, irrigationMethod, soldCommercially, marketValuePerKg } =
    input;

  if (typeof harvestKg !== "number" || !isFinite(harvestKg) || harvestKg < 0) {
    throw new Error("Harvest amount must be a non-negative finite number");
  }

  if (irrigationMethod !== "rain" && irrigationMethod !== "artificial") {
    throw new Error("Irrigation method must be either 'rain' or 'artificial'");
  }

  if (
    soldCommercially &&
    (typeof marketValuePerKg !== "number" ||
      !isFinite(marketValuePerKg) ||
      marketValuePerKg <= 0)
  ) {
    throw new Error(
      "Market value per kg must be a positive finite number when sold commercially",
    );
  }
}
