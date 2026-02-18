import { SalaryInput, CategoryZakatResult } from "../core/types";
import {
  STANDARD_ZAKAT_RATE,
  MINIMUM_LIVING_EXPENSE_MAD,
} from "../core/constants";
import { meetsNisab } from "../core/nisab";

/**
 * Calculates Zakat for salary and service income
 *
 * Per the Moroccan High Scientific Council Fatwa, the expense deduction is the
 * fixed SMIG standard (MINIMUM_LIVING_EXPENSE_MAD = 3,266 MAD/month), regardless
 * of the individual's actual spending. The council deliberately set this fixed amount
 * to prevent subjective personal estimates:
 *   "ترك النفقات بدون تحديد... من شأنه ترك المجال للتقديرات الشخصية"
 *
 * Formula:
 *   yearlyIncome   = monthlyIncome × 12
 *   yearlyExpenses = MINIMUM_LIVING_EXPENSE_MAD × 12  (fixed SMIG, always)
 *   netSavings     = yearlyIncome - yearlyExpenses
 *   If netSavings >= nisab: Zakat = netSavings × 2.5%
 *
 * Fatwa example: 10,000 MAD/month → 120,000 − 39,192 = 80,808 → zakat = 2,020.2 MAD
 *
 * @param input - Salary calculation input
 * @param nisab - Nisab threshold amount
 * @returns Zakat calculation result for salary/services
 */
export function calculateSalaryZakat(
  input: SalaryInput,
  nisab: number,
): CategoryZakatResult {
  // Validate input first
  validateSalaryInput(input);

  const { monthlyIncome } = input;

  // Per the fatwa: always deduct the fixed SMIG amount (3,266 MAD/month)
  // This is a deliberate standard set by the council, not the individual's actual expenses
  const yearlyIncome = monthlyIncome * 12;
  const yearlyExpenses = MINIMUM_LIVING_EXPENSE_MAD * 12; // Always 3,266 × 12 = 39,192

  // Calculate net savings
  const netSavings = Math.max(0, yearlyIncome - yearlyExpenses);

  // Calculate Zakat if net savings meet nisab
  const zakatAmount = meetsNisab(netSavings, nisab)
    ? netSavings * STANDARD_ZAKAT_RATE
    : 0;

  return {
    zakatAmount,
    isApplicable: zakatAmount > 0,
    netWealth: netSavings,
  };
}

/**
 * Validates salary input parameters
 *
 * @param input - Salary input to validate
 * @throws Error if input is invalid
 */
export function validateSalaryInput(input: SalaryInput): void {
  const { monthlyIncome } = input;

  if (
    typeof monthlyIncome !== "number" ||
    !isFinite(monthlyIncome) ||
    monthlyIncome < 0
  ) {
    throw new Error("Monthly income must be a non-negative finite number");
  }
}
