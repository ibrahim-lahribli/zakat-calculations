import { IndustryInput, CategoryZakatResult } from "../core/types";
import { STANDARD_ZAKAT_RATE } from "../core/constants";
import { calculateNetAssets } from "../core/debts";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for industry and manufacturing activities
 * 
 * Formula:
 * netAssets = inventoryValue + cash + receivables - liabilities - productionCosts - salariesDue - rentDue - taxesDue
 * If netAssets >= nisab: Zakat = netAssets * 2.5%
 * 
 * @param input - Industry calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for industry
 */
export function calculateIndustryZakat(input: IndustryInput, nisab: number): CategoryZakatResult {
  // Validate input first
  validateIndustryInput(input);

  const {
    inventoryValue,
    cash,
    receivables,
    liabilities,
    productionCosts,
    salariesDue,
    rentDue,
    taxesDue
  } = input;

  // Calculate total assets (only include expected receivables, not doubtful ones)
  const totalAssets = inventoryValue + cash + receivables;

  // Calculate total deductions (liabilities + industry-specific costs)
  const totalDeductions = liabilities + productionCosts + salariesDue + rentDue + taxesDue;

  // Calculate net assets
  const netAssets = calculateNetAssets(totalAssets, totalDeductions);

  // Calculate Zakat if net assets meet nisab
  const zakatAmount = meetsNisab(netAssets, nisab) ? netAssets * STANDARD_ZAKAT_RATE : 0;

  return {
    zakatAmount,
    isApplicable: zakatAmount > 0,
    netWealth: netAssets
  };
}

/**
 * Validates industry input parameters
 * 
 * @param input - Industry input to validate
 * @throws Error if input is invalid
 */
export function validateIndustryInput(input: IndustryInput): void {
  const {
    inventoryValue,
    cash,
    receivables,
    liabilities,
    productionCosts,
    salariesDue,
    rentDue,
    taxesDue
  } = input;

  const values = [inventoryValue, cash, receivables, liabilities, productionCosts, salariesDue, rentDue, taxesDue];
  const names = ['inventoryValue', 'cash', 'receivables', 'liabilities', 'productionCosts', 'salariesDue', 'rentDue', 'taxesDue'];

  values.forEach((value, index) => {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) {
      throw new Error(`${names[index]} must be a non-negative finite number`);
    }
  });
}
