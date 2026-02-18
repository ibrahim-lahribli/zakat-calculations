import { calculateSalaryZakat } from "../src/categories/services";
import {
  DEFAULT_SILVER_PRICE,
  SILVER_NISAB_GRAMS,
  MINIMUM_LIVING_EXPENSE_MAD,
} from "../src/core/constants";

describe("Salary Zakat Calculation", () => {
  const nisab = DEFAULT_SILVER_PRICE * SILVER_NISAB_GRAMS; // 7140

  it("should reproduce the exact fatwa example: 10,000 MAD/month → 2,020.2 MAD zakat", () => {
    // The fatwa states:
    //   "الشخص الذي أجره الشهري عشرة آلاف درهم (10000 درهم)"
    //   Annual income: 120,000 MAD
    //   Annual SMIG deduction: 3,266 × 12 = 39,192 MAD
    //   Net: 120,000 − 39,192 = 80,808 MAD
    //   Zakat: 80,808 × 2.5% = 2,020.2 MAD
    const result = calculateSalaryZakat({ monthlyIncome: 10000 }, nisab);

    expect(result.netWealth).toBe(80808);
    expect(result.zakatAmount).toBeCloseTo(2020.2);
    expect(result.isApplicable).toBe(true);
  });

  it("should always deduct the fixed SMIG regardless of income level", () => {
    // Fixed deduction = MINIMUM_LIVING_EXPENSE_MAD * 12 = 39,192
    const result = calculateSalaryZakat({ monthlyIncome: 6000 }, nisab);

    const expectedNet = (6000 - MINIMUM_LIVING_EXPENSE_MAD) * 12; // 32,808
    expect(result.netWealth).toBe(expectedNet);
    expect(result.zakatAmount).toBeCloseTo(expectedNet * 0.025);
    expect(result.isApplicable).toBe(true);
  });

  it("should return zero zakat when income is at or below SMIG", () => {
    // monthlyIncome = 3,266 → net = (3266 - 3266) * 12 = 0
    const result = calculateSalaryZakat(
      { monthlyIncome: MINIMUM_LIVING_EXPENSE_MAD },
      nisab,
    );
    expect(result.netWealth).toBe(0);
    expect(result.zakatAmount).toBe(0);
    expect(result.isApplicable).toBe(false);
  });

  it("should return zero zakat when income is below SMIG", () => {
    const result = calculateSalaryZakat({ monthlyIncome: 1000 }, nisab);

    // net = max(0, (1000 - 3266) * 12) = 0
    expect(result.zakatAmount).toBe(0);
    expect(result.isApplicable).toBe(false);
    expect(result.netWealth).toBe(0);
  });

  it("should return zero zakat when annual net savings are below nisab", () => {
    // monthlyIncome: 3,800 → net = (3800 - 3266) * 12 = 6,408 < nisab (7,140)
    const result = calculateSalaryZakat({ monthlyIncome: 3800 }, nisab);

    expect(result.netWealth).toBe(6408);
    expect(result.zakatAmount).toBe(0);
    expect(result.isApplicable).toBe(false);
  });

  it("should calculate correct zakat when net savings exceed nisab", () => {
    // monthlyIncome: 4,000 → net = (4000 - 3266) * 12 = 8,808 > nisab (7,140)
    // zakat = 8,808 * 0.025 = 220.2
    const result = calculateSalaryZakat({ monthlyIncome: 4000 }, nisab);

    expect(result.netWealth).toBe(8808);
    expect(result.zakatAmount).toBeCloseTo(220.2);
    expect(result.isApplicable).toBe(true);
  });

  it("should throw error for negative income", () => {
    expect(() => calculateSalaryZakat({ monthlyIncome: -1000 }, nisab)).toThrow(
      "Monthly income must be a non-negative finite number",
    );
  });

  it("should throw error for non-finite income", () => {
    expect(() =>
      calculateSalaryZakat({ monthlyIncome: Infinity }, nisab),
    ).toThrow("Monthly income must be a non-negative finite number");
  });
});
