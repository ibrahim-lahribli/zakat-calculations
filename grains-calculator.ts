import { ZakatCalculator } from "./calculator";
import { FormData, FormContext, ZakatCalculationResult } from "./types";
import { OPTION_LABELS } from "./config";

export class GrainsCalculator extends ZakatCalculator {
  constructor() {
    super('grains');
  }

  /**
   * Performs the actual grains zakat calculation
   */
  protected performCalculation(formData: FormData, context: FormContext): ZakatCalculationResult {
    const quantity = Number(formData.quantity) || 0;
    const irrigation = formData.irrigation as string;
    const purpose = formData.purpose as string;
    const marketValue = Number(formData.marketValue) || 0;

    // Check nisab requirement (653 kg)
    const quantityFormatted = this.formatWeight(quantity);
    const { meetsNisab, breakdown: nisabBreakdown } = this.validateNisabBreakdown(
      quantity, 
      quantityFormatted, 
      context
    );

    if (!meetsNisab) {
      return {
        zakatAmount: 0,
        meetsNisab: false,
        zakatInKind: "",
        breakdown: nisabBreakdown
      };
    }

    const breakdown = [...nisabBreakdown];
    breakdown.push(this.createBreakdownItem("الغرض من المحصول", OPTION_LABELS[purpose]));

    // Validate market value for trade purpose
    if (purpose === "trade" && marketValue <= 0) {
      breakdown.push(this.createBreakdownItem("خطأ", "القيمة السوقية مطلوبة عند الغرض التجاري"));
      return {
        zakatAmount: 0,
        meetsNisab: false,
        zakatInKind: "",
        breakdown
      };
    }

    let zakatAmount = 0;
    let zakatInKind = "";

    if (purpose === "trade" && marketValue > 0) {
      // Value-based calculation for trade
      const rate = this.getZakatRate(context);
      zakatAmount = marketValue * rate;
      
      breakdown.push(this.createBreakdownItem("القيمة السوقية", this.formatCurrency(marketValue)));
      breakdown.push(this.createBreakdownItem(
        `نسبة الزكاة (${context.isSolarYear ? "ميلادي" : "هجري"})`, 
        this.formatPercentage(rate)
      ));
    } else {
      // Weight-based calculation for personal consumption
      const rate = this.getZakatRate(context, irrigation);
      zakatAmount = quantity * rate;
      zakatInKind = this.formatWeight(zakatAmount);
      
      breakdown.push(this.createBreakdownItem("طريقة الري", OPTION_LABELS[irrigation]));
      breakdown.push(this.createBreakdownItem("نسبة الزكاة", this.formatPercentage(rate)));
    }

    return {
      zakatAmount,
      meetsNisab: true,
      zakatInKind,
      breakdown
    };
  }

  /**
   * Custom validation for grains-specific logic
   */
  validate(formData: FormData) {
    const baseValidation = super.validate(formData);
    
    // Add custom validation for market value when purpose is trade
    if (formData.purpose === "trade" && (!formData.marketValue || Number(formData.marketValue) <= 0)) {
      baseValidation.errors.push("القيمة السوقية مطلوبة عند الغرض التجاري");
      baseValidation.isValid = false;
    }

    return baseValidation;
  }

  /**
   * Gets zakat rate explanation for grains
   */
  getZakatRateExplanation(irrigation: string, purpose: string, context: FormContext): string {
    if (purpose === "trade") {
      const rate = this.getZakatRate(context);
      const yearType = context.isSolarYear ? "السنة الميلادية" : "السنة الهجرية";
      return `الزكاة على القيمة التجارية: ${this.formatPercentage(rate)} (${yearType})`;
    } else {
      const rate = this.getZakatRate(context, irrigation);
      const irrigationType = irrigation === "rain" ? "الري الطبيعي" : "الري الصناعي";
      return `الزكاة العينية: ${this.formatPercentage(rate)} (${irrigationType})`;
    }
  }

  /**
   * Gets nisab explanation for grains
   */
  getNisabExplanation(): string {
    return `النصاب الشرعي للحبوب: ${this.formatWeight(653)} (5 أوسق) حسب وزن النبي صلى الله عليه وسلم`;
  }

  /**
   * Calculates zakat breakdown for different scenarios
   */
  getCalculationScenarios(formData: FormData, context: FormContext): Array<{
    scenario: string;
    description: string;
    zakatAmount: number;
    zakatInKind: string;
  }> {
    const quantity = Number(formData.quantity) || 0;
    const marketValue = Number(formData.marketValue) || 0;
    const scenarios = [];

    // Personal consumption scenarios
    if (quantity >= 653) {
      const rainZakat = quantity * 0.1;
      const artificialZakat = quantity * 0.05;
      
      scenarios.push({
        scenario: "استهلاك شخصي - ري طبيعي",
        description: "الزكاة على المحصول للاستهلاك الشخصي مع الري الطبيعي",
        zakatAmount: rainZakat,
        zakatInKind: this.formatWeight(rainZakat)
      });

      scenarios.push({
        scenario: "استهلاك شخصي - ري صناعي",
        description: "الزكاة على المحصول للاستهلاك الشخصي مع الري الصناعي",
        zakatAmount: artificialZakat,
        zakatInKind: this.formatWeight(artificialZakat)
      });
    }

    // Trade scenarios
    if (marketValue > 0) {
      const lunarRate = this.getZakatRate({ ...context, isSolarYear: false });
      const solarRate = this.getZakatRate({ ...context, isSolarYear: true });
      
      scenarios.push({
        scenario: "تجارة - سنة هجرية",
        description: "الزكاة على القيمة التجارية بحسب السنة الهجرية",
        zakatAmount: marketValue * lunarRate,
        zakatInKind: ""
      });

      scenarios.push({
        scenario: "تجارة - سنة ميلادية",
        description: "الزكاة على القيمة التجارية بحسب السنة الميلادية",
        zakatAmount: marketValue * solarRate,
        zakatInKind: ""
      });
    }

    return scenarios;
  }

  /**
   * Validates specific field combinations
   */
  validateFieldCombination(fieldName: string, value: any, formData: FormData): {
    isValid: boolean;
    message?: string;
  } {
    switch (fieldName) {
      case "quantity":
        const quantity = Number(value);
        if (quantity < 0) {
          return { isValid: false, message: "الكمية يجب أن تكون موجبة" };
        }
        if (quantity > 0 && quantity < 653) {
          return { 
            isValid: true, 
            message: "الكمية أقل من النصاب الشرعي (653 كجم)، لا زكاة عليها" 
          };
        }
        break;

      case "marketValue":
        if (formData.purpose === "trade" && (!value || Number(value) <= 0)) {
          return { 
            isValid: false, 
            message: "القيمة السوقية مطلوبة عند الغرض التجاري" 
          };
        }
        break;

      case "purpose":
        if (value === "trade" && (!formData.marketValue || Number(formData.marketValue) <= 0)) {
          return { 
            isValid: false, 
            message: "يجب إدخال القيمة السوقية عند اختيار الغرض التجاري" 
          };
        }
        break;
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const grainsCalculator = new GrainsCalculator();
