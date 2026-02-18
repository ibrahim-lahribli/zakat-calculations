import { TradeInput, CategoryZakatResult } from "../core/types";
import { STANDARD_ZAKAT_RATE } from "../core/constants";
import { calculateNetAssets } from "../core/debts";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for trade and business activities
 * 
 * Formula:
 * netAssets = inventoryValue + cash + receivables - liabilities - expensesDue
 * If netAssets >= nisab: Zakat = netAssets * 2.5%
 * 
 * @param input - Trade calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for trade
 */
export function calculateTradeZakat(input: TradeInput, nisab: number): CategoryZakatResult {
  // Validate input first
  validateTradeInput(input);

  const { inventoryValue, cash, receivables, liabilities, expensesDue } = input;

  // Calculate total assets (only include expected receivables, not doubtful ones)
  const totalAssets = inventoryValue + cash + receivables;

  // Calculate total liabilities and expenses
  const totalLiabilities = liabilities + expensesDue;

  // Calculate net assets
  const netAssets = calculateNetAssets(totalAssets, totalLiabilities);

  // Calculate Zakat if net assets meet nisab
  const zakatAmount = meetsNisab(netAssets, nisab) ? netAssets * STANDARD_ZAKAT_RATE : 0;

  return {
    zakatAmount,
    isApplicable: zakatAmount > 0,
    netWealth: netAssets
  };
}

/**
 * Validates trade input parameters
 * 
 * @param input - Trade input to validate
 * @throws Error if input is invalid
 */
export function validateTradeInput(input: TradeInput): void {
  const { inventoryValue, cash, receivables, liabilities, expensesDue } = input;

  const values = [inventoryValue, cash, receivables, liabilities, expensesDue];
  const names = ['inventoryValue', 'cash', 'receivables', 'liabilities', 'expensesDue'];

  values.forEach((value, index) => {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) {
      throw new Error(`${names[index]} must be a non-negative finite number`);
    }
  });
}
