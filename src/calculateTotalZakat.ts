import { ZakatInput, ZakatCalculationResult } from "./core/types";
import { calculateNisab } from "./core/nisab";
import { calculateSalaryZakat } from "./categories/services";
import { calculateTradeZakat } from "./categories/trade";
import { calculateIndustryZakat } from "./categories/industry";
import { calculateCropsZakat } from "./categories/crops";
import { calculateLivestockZakat } from "./categories/livestock";
import { calculateAgricultureProductsZakat } from "./categories/agricultureProducts";
import { calculateMineralsZakat } from "./categories/minerals";

/**
 * Main aggregation engine that calculates total Zakat across all categories
 *
 * Steps:
 * 1. Calculate nisab based on input parameters
 * 2. Call all applicable category modules
 * 3. Sum totals and provide comprehensive breakdown
 *
 * @param input - Complete Zakat calculation input
 * @returns Complete Zakat calculation result with breakdown
 */
export function calculateTotalZakat(input: ZakatInput): ZakatCalculationResult {
  // Step 0: Validate input
  validateZakatInput(input);

  // Step 1: Calculate nisab
  const nisab = calculateNisab(input);

  // Step 2: Initialize breakdown object
  const breakdown: ZakatCalculationResult["breakdown"] = {};

  // Step 3: Calculate Zakat for each applicable category
  let totalZakat = 0;
  let totalWealth = 0;

  // Salary/Services
  if (input.salary) {
    breakdown.salary = calculateSalaryZakat(input.salary, nisab);
    totalZakat += breakdown.salary.zakatAmount;
    totalWealth += breakdown.salary.netWealth;
  }

  // Trade/Business
  if (input.trade) {
    breakdown.trade = calculateTradeZakat(input.trade, nisab);
    totalZakat += breakdown.trade.zakatAmount;
    totalWealth += breakdown.trade.netWealth;
  }

  // Industry/Manufacturing
  if (input.industry) {
    breakdown.industry = calculateIndustryZakat(input.industry, nisab);
    totalZakat += breakdown.industry.zakatAmount;
    totalWealth += breakdown.industry.netWealth;
  }

  // Agricultural Crops
  if (input.crops) {
    breakdown.crops = calculateCropsZakat(input.crops, nisab);
    totalZakat += breakdown.crops.zakatAmount;
    totalWealth += breakdown.crops.netWealth;
  }

  // Livestock
  if (input.livestock) {
    breakdown.livestock = calculateLivestockZakat(input.livestock, nisab);
    totalZakat += breakdown.livestock.zakatAmount;
    totalWealth += breakdown.livestock.netWealth;
  }

  // Agriculture Products (flowers, honey, fish, wood, etc.)
  if (input.agricultureProducts) {
    breakdown.agricultureProducts = calculateAgricultureProductsZakat(
      input.agricultureProducts,
      nisab,
    );
    totalZakat += breakdown.agricultureProducts.zakatAmount;
    totalWealth += breakdown.agricultureProducts.netWealth;
  }

  // Minerals / Natural Resources (الثروة المعدنية)
  // Zakat is due upon extraction (not after a full year), rate 2.5%
  if (input.minerals) {
    breakdown.minerals = calculateMineralsZakat(input.minerals, nisab);
    totalZakat += breakdown.minerals.zakatAmount;
    totalWealth += breakdown.minerals.netWealth;
  }

  // Step 4: Return comprehensive result
  return {
    nisab,
    breakdown,
    totalZakat,
    totalWealth,
    hasZakatDue: totalZakat > 0,
  };
}

/**
 * Validates the complete Zakat input
 *
 * @param input - Zakat input to validate
 * @returns True if input is valid, throws error if invalid
 */
export function validateZakatInput(input: ZakatInput): boolean {
  // Validate nisab override if provided
  if (input.nisabOverride !== undefined && input.nisabOverride <= 0) {
    throw new Error("Nisab override must be positive");
  }

  // Validate metal prices if provided
  if (input.silverPricePerGram !== undefined && input.silverPricePerGram <= 0) {
    throw new Error("Silver price per gram must be positive");
  }

  if (input.goldPricePerGram !== undefined && input.goldPricePerGram <= 0) {
    throw new Error("Gold price per gram must be positive");
  }

  // At least one category should be provided
  const hasAnyCategory = !!(
    input.salary ||
    input.trade ||
    input.industry ||
    input.crops ||
    input.livestock ||
    input.agricultureProducts ||
    input.minerals
  );

  if (!hasAnyCategory) {
    throw new Error("At least one Zakat category must be provided");
  }

  return true;
}
