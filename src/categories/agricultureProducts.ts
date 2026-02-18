import { AgricultureProductsInput, CategoryZakatResult } from "../core/types";
import { STANDARD_ZAKAT_RATE } from "../core/constants";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for agriculture products (flowers, honey, fish, wood, etc.)
 * 
 * Formula:
 * netValue = revenue - costs
 * If netValue >= nisab: Zakat = netValue * 2.5%
 * 
 * @param input - Agriculture products calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for agriculture products
 */
export function calculateAgricultureProductsZakat(input: AgricultureProductsInput, nisab: number): CategoryZakatResult {
  const { revenue, costs } = input;

  // Validate input
  if (revenue < 0 || costs < 0) {
    throw new Error("Revenue and costs must be non-negative");
  }

  // Calculate net value
  const netValue = Math.max(0, revenue - costs);

  // Calculate Zakat if net value meets nisab
  const zakatAmount = meetsNisab(netValue, nisab) ? netValue * STANDARD_ZAKAT_RATE : 0;

  return {
    zakatAmount,
    isApplicable: zakatAmount > 0,
    netWealth: netValue
  };
}

/**
 * Validates agriculture products input parameters
 * 
 * @param input - Agriculture products input to validate
 * @returns True if input is valid, false otherwise
 */
export function validateAgricultureProductsInput(input: AgricultureProductsInput): boolean {
  const { revenue, costs } = input;
  
  return [revenue, costs].every(
    value => typeof value === 'number' && value >= 0 && isFinite(value)
  );
}
