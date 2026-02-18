// Main exports
export { calculateTotalZakat, validateZakatInput } from "./calculateTotalZakat";

// Core functionality
export { calculateNisab, meetsNisab, validatePrices } from "./core/nisab";
export { calculateNetAssets, validateAssetLiability } from "./core/debts";

// Category calculators
export {
  calculateSalaryZakat,
  validateSalaryInput,
} from "./categories/services";
export { calculateTradeZakat, validateTradeInput } from "./categories/trade";
export {
  calculateIndustryZakat,
  validateIndustryInput,
} from "./categories/industry";
export { calculateCropsZakat, validateCropsInput } from "./categories/crops";
export {
  calculateLivestockZakat,
  validateLivestockInput,
} from "./categories/livestock";
export {
  calculateAgricultureProductsZakat,
  validateAgricultureProductsInput,
} from "./categories/agricultureProducts";
export {
  calculateMineralsZakat,
  validateMineralsInput,
} from "./categories/minerals";

// Types and interfaces
export type {
  NisabMethod,
  IrrigationMethod,
  ZakatInput,
  SalaryInput,
  TradeInput,
  IndustryInput,
  CropsInput,
  LivestockInput,
  AgricultureProductsInput,
  MineralsInput,
  CategoryZakatResult,
  ZakatCalculationResult,
} from "./core/types";

// Constants
export {
  DEFAULT_SILVER_PRICE,
  DEFAULT_GOLD_PRICE,
  SILVER_NISAB_GRAMS,
  GOLD_NISAB_GRAMS,
  STANDARD_ZAKAT_RATE,
  RAIN_FED_CROPS_RATE,
  IRRIGATED_CROPS_RATE,
  CROPS_MINIMUM_THRESHOLD_KG,
  LIVESTOCK_THRESHOLDS,
} from "./core/constants";
