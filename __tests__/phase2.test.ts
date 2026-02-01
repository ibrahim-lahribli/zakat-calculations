import { formValidator } from "../validation";
import { grainsCalculator } from "../grains-calculator";
import { GRAINS_CONFIG, getCategoryConfig } from "../config";
import { FormField, FormData } from "../types";

describe("Phase 2 Architecture Tests", () => {
  describe("Form Validation Engine", () => {
    describe("Field Validation", () => {
      it("validates required field correctly", () => {
        const field: FormField = {
          name: "quantity",
          label: "كمية المحصول",
          type: "number",
          required: true,
          validation: [{ type: "required" }]
        };

        const result1 = formValidator.validateField(field, "", {});
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain("يرجى إدخال قيمة صحيحة لـ كمية المحصول");

        const result2 = formValidator.validateField(field, "100", {});
        expect(result2.isValid).toBe(true);
      });

      it("validates minimum value correctly", () => {
        const field: FormField = {
          name: "quantity",
          label: "كمية المحصول",
          type: "number",
          required: true,
          unit: "كجم",
          validation: [
            { type: "required" },
            { type: "min", value: 0 }
          ]
        };

        const result1 = formValidator.validateField(field, -5, {});
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain("يجب أن تكون قيمة كمية المحصول على الأقل 0 كجم");

        const result2 = formValidator.validateField(field, 100, {});
        expect(result2.isValid).toBe(true);
      });

      it("validates conditional fields correctly", () => {
        const field: FormField = {
          name: "marketValue",
          label: "القيمة السوقية",
          type: "number",
          required: false,
          validation: [
            { 
              type: "conditional", 
              condition: { field: "purpose", operator: "equals", value: "trade" },
              rule: { type: "required" }
            }
          ]
        };

        // Should be valid when purpose is not trade
        const formData1 = { purpose: "personal" };
        const result1 = formValidator.validateField(field, "", formData1);
        expect(result1.isValid).toBe(true);

        // Should be invalid when purpose is trade but no value
        const formData2 = { purpose: "trade" };
        const result2 = formValidator.validateField(field, "", formData2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain("يرجى إدخال قيمة صحيحة لـ القيمة السوقية");

        // Should be valid when purpose is trade with value
        const formData3 = { purpose: "trade" };
        const result3 = formValidator.validateField(field, "5000", formData3);
        expect(result3.isValid).toBe(true);
      });
    });

    describe("Field Visibility", () => {
      it("shows/hides fields based on dependencies", () => {
        const field: FormField = {
          name: "marketValue",
          label: "القيمة السوقية",
          type: "number",
          required: false,
          dependsOn: { field: "purpose", value: "trade" }
        };

        // Hidden when purpose is not trade
        const formData1 = { purpose: "personal" };
        expect(formValidator.isFieldVisible(field, formData1)).toBe(false);

        // Visible when purpose is trade
        const formData2 = { purpose: "trade" };
        expect(formValidator.isFieldVisible(field, formData2)).toBe(true);
      });

      it("gets only visible fields", () => {
        const fields: FormField[] = [
          { name: "quantity", label: "الكمية", type: "number", required: true },
          { name: "purpose", label: "الغرض", type: "radio", required: true },
          { 
            name: "marketValue", 
            label: "القيمة السوقية", 
            type: "number", 
            required: false,
            dependsOn: { field: "purpose", value: "trade" }
          }
        ];

        const formData1 = { purpose: "personal" };
        const visible1 = formValidator.getVisibleFields(fields, formData1);
        expect(visible1).toHaveLength(2); // quantity and purpose only

        const formData2 = { purpose: "trade" };
        const visible2 = formValidator.getVisibleFields(fields, formData2);
        expect(visible2).toHaveLength(3); // all fields
      });
    });

    describe("Real-time Validation", () => {
      it("validates on field change and identifies affected fields", () => {
        const fields: FormField[] = [
          { name: "purpose", label: "الغرض", type: "radio", required: true },
          { 
            name: "marketValue", 
            label: "القيمة السوقية", 
            type: "number", 
            required: false,
            dependsOn: { field: "purpose", value: "trade" },
            validation: [
              { 
                type: "conditional", 
                condition: { field: "purpose", operator: "equals", value: "trade" },
                rule: { type: "required" }
              }
            ]
          }
        ];

        const formData = { purpose: "personal", marketValue: "" };
        
        // Change purpose to trade
        const result = formValidator.validateOnChange(fields, formData, "purpose");
        
        expect(result.affectedFields).toContain("marketValue");
        expect(result.fieldValidation.isValid).toBe(true); // purpose field is valid
      });
    });
  });

  describe("Configuration System", () => {
    it("exports grains configuration with correct structure", () => {
      expect(GRAINS_CONFIG.category).toBe("grains");
      expect(GRAINS_CONFIG.title).toBe("زكاة الحبوب والثمار");
      expect(GRAINS_CONFIG.fields).toHaveLength(4);
      
      const quantityField = GRAINS_CONFIG.fields.find(f => f.name === "quantity");
      expect(quantityField).toBeDefined();
      expect(quantityField?.required).toBe(true);
      expect(quantityField?.unit).toBe("كجم");
      
      const marketValueField = GRAINS_CONFIG.fields.find(f => f.name === "marketValue");
      expect(marketValueField).toBeDefined();
      expect(marketValueField?.dependsOn).toEqual({ field: "purpose", value: "trade" });
    });

    it("gets configuration by category", () => {
      const grainsConfig = getCategoryConfig("grains");
      expect(grainsConfig.category).toBe("grains");
      expect(grainsConfig.fields).toHaveLength(4);
    });

    it("has correct nisab rules for grains", () => {
      expect(GRAINS_CONFIG.nisabRules.type).toBe("weight");
      expect(GRAINS_CONFIG.nisabRules.threshold).toBe(653);
      expect(GRAINS_CONFIG.nisabRules.unit).toBe("كجم");
    });

    it("has correct zakat rates for grains", () => {
      expect(GRAINS_CONFIG.zakatRates.lunar).toBe(0.025);
      expect(GRAINS_CONFIG.zakatRates.solar).toBe(0.02432);
      expect(GRAINS_CONFIG.zakatRates.special?.rain).toBe(0.1);
      expect(GRAINS_CONFIG.zakatRates.special?.artificial).toBe(0.05);
    });
  });

  describe("Grains Calculator", () => {
    const context = {
      isSolarYear: false,
      nisabGold: 3000,
      nisabSilver: 1500,
      showNisabGold: false
    };

    describe("Validation", () => {
      it("validates form data correctly", () => {
        const validFormData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "personal",
          marketValue: 0
        };

        const result = grainsCalculator.validate(validFormData);
        expect(result.isValid).toBe(true);
      });

      it("requires market value for trade purpose", () => {
        const invalidFormData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "trade",
          marketValue: 0
        };

        const result = grainsCalculator.validate(invalidFormData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("القيمة السوقية مطلوبة عند الغرض التجاري");
      });

      it("validates individual fields", () => {
        const formData = { quantity: 1000, irrigation: "rain", purpose: "personal" };
        
        const validResult = grainsCalculator.validateField("quantity", 1000, formData);
        expect(validResult.isValid).toBe(true);

        const invalidResult = grainsCalculator.validateField("quantity", "", formData);
        expect(invalidResult.isValid).toBe(false);
      });
    });

    describe("Field Visibility", () => {
      it("shows market value only for trade purpose", () => {
        const personalFormData = { purpose: "personal" };
        expect(grainsCalculator.isFieldVisible("marketValue", personalFormData)).toBe(false);

        const tradeFormData = { purpose: "trade" };
        expect(grainsCalculator.isFieldVisible("marketValue", tradeFormData)).toBe(true);
      });
    });

    describe("Calculation", () => {
      it("calculates zakat for personal consumption with rain irrigation", () => {
        const formData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "personal",
          marketValue: 0
        };

        const result = grainsCalculator.calculate(formData, context);
        
        expect(result.meetsNisab).toBe(true);
        expect(result.zakatAmount).toBe(100); // 1000 * 0.1
        expect(result.zakatInKind).toBe("100 كجم");
        expect(result.validation.isValid).toBe(true);
        expect(result.metadata.configVersion).toBe("2.0");
        expect(result.metadata.fatwaCompliance).toBe(true);
      });

      it("calculates zakat for personal consumption with artificial irrigation", () => {
        const formData = {
          quantity: 1000,
          irrigation: "artificial",
          purpose: "personal",
          marketValue: 0
        };

        const result = grainsCalculator.calculate(formData, context);
        
        expect(result.meetsNisab).toBe(true);
        expect(result.zakatAmount).toBe(50); // 1000 * 0.05
        expect(result.zakatInKind).toBe("50 كجم");
      });

      it("calculates zakat for trade purpose", () => {
        const formData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "trade",
          marketValue: 5000
        };

        const result = grainsCalculator.calculate(formData, context);
        
        expect(result.meetsNisab).toBe(true);
        expect(result.zakatAmount).toBe(125); // 5000 * 0.025
        expect(result.zakatInKind).toBe("");
      });

      it("returns below nisab for small quantities", () => {
        const formData = {
          quantity: 500,
          irrigation: "rain",
          purpose: "personal",
          marketValue: 0
        };

        const result = grainsCalculator.calculate(formData, context);
        
        expect(result.meetsNisab).toBe(false);
        expect(result.zakatAmount).toBe(0);
        expect(result.zakatInKind).toBe("");
      });

      it("handles validation errors in calculation", () => {
        const formData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "trade",
          marketValue: 0 // Invalid for trade purpose
        };

        const result = grainsCalculator.calculate(formData, context);
        
        expect(result.meetsNisab).toBe(false);
        expect(result.zakatAmount).toBe(0);
        expect(result.validation.isValid).toBe(false);
        expect(result.validation.errors).toContain("القيمة السوقية مطلوبة عند الغرض التجاري");
      });
    });

    describe("Helper Methods", () => {
      it("gets zakat rate explanation", () => {
        const explanation1 = grainsCalculator.getZakatRateExplanation("rain", "personal", context);
        expect(explanation1).toContain("الزكاة العينية: 10.0% (الري الطبيعي)");

        const explanation2 = grainsCalculator.getZakatRateExplanation("rain", "trade", context);
        expect(explanation2).toContain("الزكاة على القيمة التجارية: 2.5% (السنة الهجرية)");
      });

      it("gets nisab explanation", () => {
        const explanation = grainsCalculator.getNisabExplanation();
        expect(explanation).toContain("653 كجم");
        expect(explanation).toContain("5 أوسق");
      });

      it("calculates scenarios", () => {
        const formData = {
          quantity: 1000,
          irrigation: "rain",
          purpose: "trade",
          marketValue: 5000
        };

        const scenarios = grainsCalculator.getCalculationScenarios(formData, context);
        expect(scenarios).toHaveLength(4); // 2 personal + 2 trade scenarios
        
        const personalRain = scenarios.find(s => s.scenario.includes("ري طبيعي"));
        expect(personalRain?.zakatAmount).toBe(100);
        expect(personalRain?.zakatInKind).toBe("100 كجم");
      });

      it("validates field combinations", () => {
        // Valid quantity
        const result1 = grainsCalculator.validateFieldCombination("quantity", 1000, {});
        expect(result1.isValid).toBe(true);

        // Below nisab with warning
        const result2 = grainsCalculator.validateFieldCombination("quantity", 500, {});
        expect(result2.isValid).toBe(true);
        expect(result2.message).toContain("أقل من النصاب الشرعي");

        // Invalid market value for trade
        const formData = { purpose: "trade" };
        const result3 = grainsCalculator.validateFieldCombination("marketValue", 0, formData);
        expect(result3.isValid).toBe(false);
        expect(result3.message).toContain("القيمة السوقية مطلوبة");
      });
    });
  });

  describe("Integration Tests", () => {
    it("works end-to-end with configuration-driven validation", () => {
      const formData = {
        quantity: 1000,
        irrigation: "artificial",
        purpose: "trade",
        marketValue: 8000
      };

      const context = {
        isSolarYear: true,
        nisabGold: 3000,
        nisabSilver: 1500,
        showNisabGold: false
      };

      // Validate form
      const validation = formValidator.validateForm(GRAINS_CONFIG.fields, formData);
      expect(validation.isValid).toBe(true);

      // Calculate zakat
      const result = grainsCalculator.calculate(formData, context);
      
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBeCloseTo(8000 * 0.02432, 2); // Solar rate
      expect(result.validation.isValid).toBe(true);
      expect(result.metadata.category).toBe("grains");
      expect(result.metadata.isSolarYear).toBe(true);
    });
  });
});
