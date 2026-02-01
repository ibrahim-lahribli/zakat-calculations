import { 
  CategoryConfig, 
  FormData, 
  FormContext, 
  EnhancedCalculationResult, 
  ValidationResult,
  ZakatCalculationResult 
} from "./types";
import { formValidator } from "./validation";
import { getCategoryConfig } from "./config";

export abstract class ZakatCalculator {
  protected config: CategoryConfig;
  protected configVersion: string = "2.0";

  constructor(category: string) {
    this.config = getCategoryConfig(category as any);
  }

  /**
   * Main calculation method - validates and calculates
   */
  calculate(formData: FormData, context: FormContext): EnhancedCalculationResult {
    const startTime = Date.now();

    // 1. Validate form data
    const validation = this.validate(formData);
    
    if (!validation.isValid) {
      return this.createErrorResult(validation, startTime);
    }

    // 2. Perform calculation
    const calculationResult = this.performCalculation(formData, context);

    // 3. Create enhanced result
    return this.createEnhancedResult(calculationResult, validation, startTime, context);
  }

  /**
   * Validates form data against configuration
   */
  validate(formData: FormData): ValidationResult {
    return formValidator.validateVisibleFields(this.config.fields, formData);
  }

  /**
   * Validates a single field
   */
  validateField(fieldName: string, value: any, formData: FormData): ValidationResult {
    const field = this.config.fields.find(f => f.name === fieldName);
    if (!field) {
      return { isValid: true, errors: [] };
    }
    return formValidator.validateField(field, value, formData);
  }

  /**
   * Gets validation error for a specific field
   */
  getFieldError(fieldName: string, formData: FormData): string | null {
    const field = this.config.fields.find(f => f.name === fieldName);
    if (!field) {
      return null;
    }
    return formValidator.getFieldError(field, formData);
  }

  /**
   * Checks if a field should be visible
   */
  isFieldVisible(fieldName: string, formData: FormData): boolean {
    const field = this.config.fields.find(f => f.name === fieldName);
    if (!field) {
      return false;
    }
    return formValidator.isFieldVisible(field, formData);
  }

  /**
   * Gets visible fields based on current form data
   */
  getVisibleFields(formData: FormData) {
    return formValidator.getVisibleFields(this.config.fields, formData);
  }

  /**
   * Abstract method for specific calculation logic
   */
  protected abstract performCalculation(
    formData: FormData, 
    context: FormContext
  ): ZakatCalculationResult;

  /**
   * Checks if data meets nisab requirements
   */
  protected checkNisab(value: number, context: FormContext): boolean {
    const activeNisab = context.showNisabGold ? context.nisabGold : context.nisabSilver;
    
    if (this.config.nisabRules.type === "value") {
      return value >= activeNisab;
    } else {
      return value >= this.config.nisabRules.threshold;
    }
  }

  /**
   * Gets appropriate zakat rate
   */
  protected getZakatRate(context: FormContext, specialRateKey?: string): number {
    if (specialRateKey && this.config.zakatRates.special?.[specialRateKey]) {
      return this.config.zakatRates.special[specialRateKey];
    }
    return context.isSolarYear ? this.config.zakatRates.solar : this.config.zakatRates.lunar;
  }

  /**
   * Creates enhanced result with metadata
   */
  private createEnhancedResult(
    calculationResult: ZakatCalculationResult,
    validation: ValidationResult,
    startTime: number,
    context: FormContext
  ): EnhancedCalculationResult {
    return {
      ...calculationResult,
      validation,
      metadata: {
        calculationTime: Date.now() - startTime,
        configVersion: this.configVersion,
        fatwaCompliance: true,
        category: this.config.category,
        isSolarYear: context.isSolarYear,
        nisabUsed: context.showNisabGold ? context.nisabGold : context.nisabSilver
      }
    };
  }

  /**
   * Creates error result when validation fails
   */
  private createErrorResult(validation: ValidationResult, startTime: number): EnhancedCalculationResult {
    return {
      zakatAmount: 0,
      meetsNisab: false,
      zakatInKind: "",
      breakdown: [
        { label: "خطأ في التحقق", value: validation.errors.join(", ") }
      ],
      validation,
      metadata: {
        calculationTime: Date.now() - startTime,
        configVersion: this.configVersion,
        fatwaCompliance: false,
        category: this.config.category
      }
    };
  }

  /**
   * Gets field configuration
   */
  getFieldConfig(fieldName: string) {
    return this.config.fields.find(f => f.name === fieldName);
  }

  /**
   * Gets all field configurations
   */
  getAllFields() {
    return this.config.fields;
  }

  /**
   * Gets category configuration
   */
  getCategoryConfig() {
    return this.config;
  }

  /**
   * Formats currency values for display
   */
  protected formatCurrency(amount: number): string {
    return amount.toLocaleString("ar-MA") + " درهم";
  }

  /**
   * Formats weight values for display
   */
  protected formatWeight(amount: number, unit: string = "كجم"): string {
    return amount.toLocaleString("ar-MA") + " " + unit;
  }

  /**
   * Formats percentage for display
   */
  protected formatPercentage(rate: number): string {
    return (rate * 100).toFixed(1) + "%";
  }

  /**
   * Creates breakdown item
   */
  protected createBreakdownItem(label: string, value: number | string) {
    return { label, value };
  }

  /**
   * Validates nisab requirement and creates appropriate breakdown
   */
  protected validateNisabBreakdown(
    actualValue: number,
    actualValueFormatted: string,
    context: FormContext
  ): { meetsNisab: boolean; breakdown: any[] } {
    const breakdown = [this.createBreakdownItem("القيمة", actualValueFormatted)];
    
    if (!this.checkNisab(actualValue, context)) {
      const threshold = this.config.nisabRules.type === "value" 
        ? (context.showNisabGold ? context.nisabGold : context.nisabSilver)
        : this.config.nisabRules.threshold;
      
      const thresholdFormatted = this.config.nisabRules.type === "value"
        ? this.formatCurrency(threshold)
        : this.formatWeight(threshold, this.config.nisabRules.unit || "كجم");
      
      breakdown.push(this.createBreakdownItem("النصاب المطلوب", thresholdFormatted));
      
      return { meetsNisab: false, breakdown };
    }

    return { meetsNisab: true, breakdown };
  }
}

// Export base calculator class
export { ZakatCalculator as BaseZakatCalculator };
