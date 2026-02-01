// Entry point for zakat calculation logic and types

// Phase 1: Legacy exports (maintained for backward compatibility)
export {
  ZakatCategory,
  ZakatCalculationInput,
  ZakatCalculationResult,
} from "./types";
export {
  OPTION_LABELS,
  CAMEL_ZAKAT_TABLE,
  getCamelZakat,
  getCowZakat,
  getSheepZakat,
  calculateZakat,
} from "./calculations";

// Phase 2: Enhanced configuration-driven system
export {
  // Enhanced types
  FieldType,
  ValidationRule,
  FieldCondition,
  FieldDependency,
  FormField,
  CategoryConfig,
  ValidationResult,
  EnhancedCalculationResult,
  FormData,
  FormContext,
} from "./types";

// Configuration system
export {
  CONFIG_VALUES,
  OPTION_LABELS as PHASE2_OPTION_LABELS,
  GRAINS_CONFIG,
  LIVESTOCK_CONFIG,
  CASH_CONFIG,
  COMMERCE_CONFIG,
  SERVICES_CONFIG,
  AGRICULTURE_CONFIG,
  DEBTS_CONFIG,
  CATEGORY_CONFIGS,
  getCategoryConfig,
  getAvailableCategories,
} from "./config";

// Validation engine
export {
  FormValidator,
  formValidator,
  ValidationHelpers,
} from "./validation";

// Enhanced calculator system
export {
  ZakatCalculator,
  BaseZakatCalculator,
} from "./calculator";

// Example calculator implementations
export {
  GrainsCalculator,
  grainsCalculator,
} from "./grains-calculator";
