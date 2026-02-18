import { calculateTotalZakat } from "../src/calculateTotalZakat";
import {
  DEFAULT_SILVER_PRICE,
  SILVER_NISAB_GRAMS,
} from "../src/core/constants";

describe("Integration Tests", () => {
  const nisab = DEFAULT_SILVER_PRICE * SILVER_NISAB_GRAMS; // 7140

  // ---------------------------------------------------------------------------
  // Salary / Services
  // ---------------------------------------------------------------------------
  describe("Salary Zakat", () => {
    it("should calculate zakat for salary (fatwa example: 10,000 MAD/month)", () => {
      // Fatwa explicit example: 10,000 MAD/month → net 80,808 → zakat 2,020.2
      const result = calculateTotalZakat({
        salary: { monthlyIncome: 10000 },
      });

      expect(result.nisab).toBe(nisab);
      expect(result.breakdown.salary?.netWealth).toBe(80808);
      expect(result.breakdown.salary?.zakatAmount).toBeCloseTo(2020.2);
      expect(result.totalZakat).toBeCloseTo(2020.2);
      expect(result.hasZakatDue).toBe(true);
    });

    it("should calculate zakat for typical salary above SMIG", () => {
      // net = (6000 - 3266) * 12 = 32,808 → zakat = 820.2
      const result = calculateTotalZakat({
        salary: { monthlyIncome: 6000 },
      });

      expect(result.breakdown.salary?.zakatAmount).toBeCloseTo(820.2);
      expect(result.totalZakat).toBeCloseTo(820.2);
      expect(result.hasZakatDue).toBe(true);
    });

    it("should handle no zakat due when income is at or below SMIG", () => {
      // net = max(0, (1000 - 3266) * 12) = 0 → no zakat
      const result = calculateTotalZakat({
        salary: { monthlyIncome: 1000 },
      });

      expect(result.breakdown.salary?.zakatAmount).toBe(0);
      expect(result.totalZakat).toBe(0);
      expect(result.hasZakatDue).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Multiple categories combined
  // ---------------------------------------------------------------------------
  describe("Multiple Categories", () => {
    it("should calculate combined salary + trade zakat correctly", () => {
      const result = calculateTotalZakat({
        salary: { monthlyIncome: 6000 },
        trade: {
          inventoryValue: 10000,
          cash: 5000,
          receivables: 3000,
          liabilities: 2000,
          expensesDue: 1000,
        },
      });

      // Salary: (6000 - 3266) * 12 = 32,808 → zakat 820.2
      // Trade: (10000 + 5000 + 3000) - (2000 + 1000) = 15,000 → zakat 375
      expect(result.breakdown.salary?.zakatAmount).toBeCloseTo(820.2);
      expect(result.breakdown.trade?.zakatAmount).toBeCloseTo(375);
      expect(result.totalZakat).toBeCloseTo(1195.2);
      expect(result.hasZakatDue).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Nisab method / override
  // ---------------------------------------------------------------------------
  describe("Nisab Options", () => {
    it("should handle gold nisab method", () => {
      const result = calculateTotalZakat({
        nisabMethod: "gold",
        goldPricePerGram: 900,
        salary: { monthlyIncome: 6000 },
      });

      // Gold nisab: 900 * 85 = 76,500
      // Annual net: 32,808 < 76,500 → no zakat
      expect(result.nisab).toBe(76500);
      expect(result.breakdown.salary?.zakatAmount).toBe(0);
    });

    it("should handle nisab override", () => {
      const result = calculateTotalZakat({
        nisabOverride: 5000,
        salary: { monthlyIncome: 6000 },
      });

      expect(result.nisab).toBe(5000);
      expect(result.breakdown.salary?.zakatAmount).toBeCloseTo(820.2);
    });
  });

  // ---------------------------------------------------------------------------
  // Crops — with and without market value
  // ---------------------------------------------------------------------------
  describe("Crops Integration", () => {
    it("should return physical zakat in kg (zakatAmountKg) when no market price provided (rain-fed)", () => {
      // No market value → zakat returned in kind, NOT as MAD
      const result = calculateTotalZakat({
        crops: { harvestKg: 1000, irrigationMethod: "rain" },
      });

      const cropsResult = result.breakdown.crops!;
      // Physical obligation: 1000 * 10% = 100 kg
      expect(cropsResult.zakatAmountKg).toBe(100);
      // zakatAmount (monetary) must be 0 so it doesn't corrupt MAD totals
      expect(cropsResult.zakatAmount).toBe(0);
      expect(cropsResult.isApplicable).toBe(true);
      // totalZakat should NOT include the physical kg value
      expect(result.totalZakat).toBe(0);
    });

    it("should return physical zakat in kg for artificially irrigated crops (no market price)", () => {
      const result = calculateTotalZakat({
        crops: { harvestKg: 1000, irrigationMethod: "artificial" },
      });

      const cropsResult = result.breakdown.crops!;
      expect(cropsResult.zakatAmountKg).toBe(50); // 1000 * 5%
      expect(cropsResult.zakatAmount).toBe(0);
      expect(cropsResult.isApplicable).toBe(true);
    });

    it("should return monetary zakat when market price is provided (rain-fed)", () => {
      // With market value: zakat amount in MAD, can be summed with other categories
      const result = calculateTotalZakat({
        crops: {
          harvestKg: 1000,
          irrigationMethod: "rain",
          marketValuePerKg: 5,
        },
      });

      const cropsResult = result.breakdown.crops!;
      // zakat = 1000 * 10% * 5 MAD/kg = 500 MAD
      expect(cropsResult.zakatAmount).toBe(500);
      expect(cropsResult.zakatAmountKg).toBeUndefined();
      expect(cropsResult.isApplicable).toBe(true);
      expect(result.totalZakat).toBe(500);
    });

    it("should treat commercially sold crops as trade goods (2.5% on market value)", () => {
      const result = calculateTotalZakat({
        crops: {
          harvestKg: 2000,
          irrigationMethod: "rain",
          soldCommercially: true,
          marketValuePerKg: 10,
        },
      });

      // Market value = 2000 * 10 = 20,000 MAD → 20,000 * 2.5% = 500 MAD
      expect(result.breakdown.crops?.zakatAmount).toBe(500);
      expect(result.breakdown.crops?.isApplicable).toBe(true);
    });

    it("should not calculate zakat for crops below 653 kg threshold", () => {
      const result = calculateTotalZakat({
        crops: { harvestKg: 500, irrigationMethod: "rain" },
      });

      expect(result.breakdown.crops?.zakatAmount).toBe(0);
      expect(result.breakdown.crops?.zakatAmountKg).toBeUndefined();
      expect(result.breakdown.crops?.isApplicable).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Livestock
  // ---------------------------------------------------------------------------
  describe("Livestock Integration", () => {
    it("should calculate zakat for sheep (40-120 range: 1 sheep due)", () => {
      const result = calculateTotalZakat({
        livestock: { sheep: 50, marketPricePerSheep: 100 },
      });

      expect(result.breakdown.livestock?.zakatAmount).toBe(100); // 1 * 100
      expect(result.breakdown.livestock?.isApplicable).toBe(true);
    });

    it("should not calculate zakat for sheep below nisab (< 40)", () => {
      const result = calculateTotalZakat({
        livestock: { sheep: 30, marketPricePerSheep: 100 },
      });

      expect(result.breakdown.livestock?.zakatAmount).toBe(0);
      expect(result.breakdown.livestock?.isApplicable).toBe(false);
    });

    it("should calculate zakat for cattle (nisab = 30)", () => {
      // 30-39 cattle: 1 tabi'a (calf, 1 year old)
      const result = calculateTotalZakat({
        livestock: { cattle: 35, marketPricePerCalf: 500 },
      });

      expect(result.breakdown.livestock?.zakatAmount).toBe(500); // 1 calf * 500
      expect(result.breakdown.livestock?.isApplicable).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Minerals — new category per fatwa
  // ---------------------------------------------------------------------------
  describe("Minerals Integration", () => {
    it("should calculate 2.5% zakat on net mineral value above nisab", () => {
      // extracted: 100,000 MAD, costs: 40,000 MAD → net: 60,000 MAD > nisab (7,140)
      // zakat = 60,000 * 2.5% = 1,500 MAD
      const result = calculateTotalZakat({
        minerals: { extractedValue: 100000, extractionCosts: 40000 },
      });

      expect(result.breakdown.minerals?.netWealth).toBe(60000);
      expect(result.breakdown.minerals?.zakatAmount).toBe(1500);
      expect(result.breakdown.minerals?.isApplicable).toBe(true);
      expect(result.totalZakat).toBe(1500);
    });

    it("should not apply zakat when net mineral value is below nisab", () => {
      // net = 5,000 < nisab (7,140)
      const result = calculateTotalZakat({
        minerals: { extractedValue: 8000, extractionCosts: 3000 },
      });

      expect(result.breakdown.minerals?.netWealth).toBe(5000);
      expect(result.breakdown.minerals?.zakatAmount).toBe(0);
      expect(result.breakdown.minerals?.isApplicable).toBe(false);
    });

    it("should handle extraction costs exceeding extracted value (net = 0)", () => {
      const result = calculateTotalZakat({
        minerals: { extractedValue: 5000, extractionCosts: 8000 },
      });

      expect(result.breakdown.minerals?.netWealth).toBe(0);
      expect(result.breakdown.minerals?.zakatAmount).toBe(0);
    });

    it("should combine minerals with salary in total", () => {
      const result = calculateTotalZakat({
        salary: { monthlyIncome: 10000 },
        minerals: { extractedValue: 50000, extractionCosts: 10000 },
      });

      // Salary zakat: 2,020.2; Minerals zakat: 40,000 * 2.5% = 1,000
      expect(result.breakdown.salary?.zakatAmount).toBeCloseTo(2020.2);
      expect(result.breakdown.minerals?.zakatAmount).toBe(1000);
      expect(result.totalZakat).toBeCloseTo(3020.2);
    });
  });
});
