import { ZakatInput } from "./types";
import { 
  DEFAULT_SILVER_PRICE, 
  DEFAULT_GOLD_PRICE, 
  SILVER_NISAB_GRAMS, 
  GOLD_NISAB_GRAMS 
} from "./constants";

/**
 * Calculates the Nisab threshold amount based on the provided input
 * 
 * Priority order:
 * 1. Manual nisab override (if provided)
 * 2. Gold method (if selected)
 * 3. Silver method (default)
 * 
 * @param input - Zakat calculation input containing price information
 * @returns The calculated Nisab amount in monetary value
 */
export function calculateNisab(input: ZakatInput): number {
  // Priority 1: Manual override
  if (input.nisabOverride !== undefined && input.nisabOverride > 0) {
    return input.nisabOverride;
  }

  // Priority 2: Gold method
  if (input.nisabMethod === "gold") {
    const goldPrice = input.goldPricePerGram ?? DEFAULT_GOLD_PRICE;
    return goldPrice * GOLD_NISAB_GRAMS;
  }

  // Priority 3: Silver method (default)
  const silverPrice = input.silverPricePerGram ?? DEFAULT_SILVER_PRICE;
  return silverPrice * SILVER_NISAB_GRAMS;
}

/**
 * Determines if a given wealth amount meets or exceeds the Nisab threshold
 * 
 * @param wealth - The wealth amount to check
 * @param nisab - The Nisab threshold
 * @returns True if wealth >= nisab, false otherwise
 */
export function meetsNisab(wealth: number, nisab: number): boolean {
  return wealth >= nisab;
}

/**
 * Validates that the provided prices are reasonable
 * 
 * @param silverPricePerGram - Silver price per gram
 * @param goldPricePerGram - Gold price per gram
 * @returns True if prices appear reasonable, false otherwise
 */
export function validatePrices(silverPricePerGram?: number, goldPricePerGram?: number): boolean {
  if (silverPricePerGram !== undefined && (silverPricePerGram <= 0 || silverPricePerGram > 1000)) {
    return false;
  }
  
  if (goldPricePerGram !== undefined && (goldPricePerGram <= 0 || goldPricePerGram > 10000)) {
    return false;
  }
  
  return true;
}
