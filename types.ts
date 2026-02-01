// Types for zakat calculation logic
export type ZakatCategory =
  | "grains" // الحبوب والثمار
  | "livestock" // الماشية
  | "agriculture" // منتجات فلاحية أخرى + غابات + صيد
  | "commerce" // التجارة والصناعة
  | "services" // الخدمات والأجور
  | "cash" // النقود والذهب والفضة
  | "debts"; // الديون

export interface ZakatCalculationInput {
  category: ZakatCategory;
  wizardData: Record<string, number | string>;
  isSolarYear: boolean;
  nisabGold: number;
  nisabSilver: number;
  showNisabGold?: boolean;
}

export interface ZakatCalculationResult {
  zakatAmount: number;
  breakdown: { label: string; value: number | string }[];
  meetsNisab: boolean;
  zakatInKind: string;
}

// Phase 2: Enhanced Configuration-Driven Form Types

export type FieldType = 
  | "number" 
  | "select" 
  | "radio" 
  | "text" 
  | "textarea";

export type ValidationRule = 
  | { type: "required" }
  | { type: "min"; value: number }
  | { type: "max"; value: number }
  | { type: "conditional"; condition: FieldCondition; rule: ValidationRule };

export interface FieldCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than";
  value: any;
}

export interface FieldDependency {
  field: string;
  value: any;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  dependsOn?: FieldDependency;
  helpText?: string;
  placeholder?: string;
  defaultValue?: any;
}

export interface CategoryConfig {
  category: ZakatCategory;
  title: string;
  description: string;
  fields: FormField[];
  nisabRules: {
    type: "weight" | "value";
    threshold: number;
    unit?: string;
  };
  zakatRates: {
    lunar: number;
    solar: number;
    special?: Record<string, number>;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface EnhancedCalculationResult extends ZakatCalculationResult {
  validation: ValidationResult;
  metadata: {
    calculationTime: number;
    configVersion: string;
    fatwaCompliance: boolean;
    [key: string]: any;
  };
}

export interface FormData {
  [fieldName: string]: any;
}

export interface FormContext {
  isSolarYear: boolean;
  nisabGold: number;
  nisabSilver: number;
  showNisabGold?: boolean;
}
