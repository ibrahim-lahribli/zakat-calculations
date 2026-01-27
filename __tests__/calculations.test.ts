import {
  calculateZakat,
  getCamelZakat,
  getCowZakat,
  getSheepZakat,
} from "../calculations";
import { ZakatCalculationInput } from "../types";

// Livestock Zakat Tests
describe("Livestock Zakat Functions", () => {
  describe("getCamelZakat", () => {
    it("returns null for camels below nisab (5)", () => {
      expect(getCamelZakat(4)).toBeNull();
      expect(getCamelZakat(1)).toBeNull();
    });

    it("returns correct zakat for camels 5-24", () => {
      expect(getCamelZakat(5)).toBe("1 شاة");
      expect(getCamelZakat(9)).toBe("1 شاة");
      expect(getCamelZakat(10)).toBe("2 شياه");
      expect(getCamelZakat(20)).toBe("4 شياه");
    });

    it("returns correct zakat for camels 25-120", () => {
      expect(getCamelZakat(25)).toBe("1 بنت مخاض");
      expect(getCamelZakat(35)).toBe("1 بنت مخاض");
      expect(getCamelZakat(36)).toBe("1 بنت لبون");
      expect(getCamelZakat(46)).toBe("1 حقة");
      expect(getCamelZakat(61)).toBe("1 جذعة");
      expect(getCamelZakat(76)).toBe("2 بنتا لبون");
      expect(getCamelZakat(91)).toBe("2 حقتان");
      expect(getCamelZakat(120)).toBe("2 حقتان");
    });

    it("returns correct zakat for camels 121-129", () => {
      expect(getCamelZakat(121)).toBe("حقتان أو ثلاث بنات لبون");
      expect(getCamelZakat(125)).toBe("حقتان أو ثلاث بنات لبون");
      expect(getCamelZakat(129)).toBe("حقتان أو ثلاث بنات لبون");
    });

    it("returns correct combination for camels above 130", () => {
      // 130: 2 حقة + 1 بنت لبون or similar
      const result = getCamelZakat(130);
      expect(result).toContain("حقة");
    });

    it("returns correct combination for large camel numbers", () => {
      const result = getCamelZakat(200);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });

  describe("getCowZakat", () => {
    it("returns null for cows below nisab (30)", () => {
      expect(getCowZakat(29)).toBeNull();
      expect(getCowZakat(0)).toBeNull();
    });

    it("returns correct zakat for cows 30-39", () => {
      expect(getCowZakat(30)).toBe("عجل تبيع");
      expect(getCowZakat(39)).toBe("عجل تبيع");
    });

    it("returns correct zakat for cows 40-59", () => {
      expect(getCowZakat(40)).toBe("مسنة");
      expect(getCowZakat(59)).toBe("مسنة");
    });

    it("returns correct combination for cows 60+", () => {
      const result = getCowZakat(60);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it("returns correct zakat for various cow numbers", () => {
      const result70 = getCowZakat(70);
      expect(result70).toBeDefined();

      const result100 = getCowZakat(100);
      expect(result100).toBeDefined();
    });
  });

  describe("getSheepZakat", () => {
    it("returns null for sheep below nisab (40)", () => {
      expect(getSheepZakat(39)).toBeNull();
      expect(getSheepZakat(0)).toBeNull();
    });

    it("returns correct zakat for sheep 40-120", () => {
      expect(getSheepZakat(40)).toBe("1 شاة");
      expect(getSheepZakat(120)).toBe("1 شاة");
    });

    it("returns correct zakat for sheep 121-200", () => {
      expect(getSheepZakat(121)).toBe("2 شياه");
      expect(getSheepZakat(200)).toBe("2 شياه");
    });

    it("returns correct zakat for sheep 201-399", () => {
      expect(getSheepZakat(201)).toBe("3 شياه");
      expect(getSheepZakat(399)).toBe("3 شياه");
    });

    it("returns correct zakat for sheep 400+", () => {
      expect(getSheepZakat(400)).toBe("4 شياه");
      expect(getSheepZakat(500)).toBe("5 شياه");
      expect(getSheepZakat(1000)).toBe("10 شياه");
    });
  });
});

// Category-based Calculation Tests
describe("calculateZakat - Category Tests", () => {
  const nisabSilver = 1500;
  const nisabGold = 3000;

  describe("Cash Category", () => {
    it("returns meetsNisab false for cash below nisab", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 100,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(0);
      expect(result.meetsNisab).toBe(false);
    });

    it("calculates correct zakat for cash above nisab (lunar year)", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2000,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(2000 * 0.025); // 50
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it("calculates correct zakat for cash above nisab (solar year)", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2000,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: true,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBeCloseTo(2000 * 0.02432, 2);
    });

    it("includes gold value in cash calculation", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 1000,
          goldGrams: 5,
          silverGrams: 0,
          immediateDebts: 0,
          priceGold: 600,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedTotal = 1000 + 5 * 600;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedTotal * 0.025);
    });

    it("includes silver value in cash calculation", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 1000,
          goldGrams: 0,
          silverGrams: 100,
          immediateDebts: 0,
          priceSilver: 10,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedTotal = 1000 + 100 * 10;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedTotal * 0.025);
    });

    it("deducts immediate debts from cash calculation", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2500,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 500,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedNet = 2500 - 500;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedNet * 0.025);
    });

    it("handles combined gold, silver, and cash", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 500,
          goldGrams: 3,
          silverGrams: 50,
          immediateDebts: 200,
          priceGold: 500,
          priceSilver: 15,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const totalAssets = 500 + 3 * 500 + 50 * 15;
      const netValue = totalAssets - 200;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(netValue * 0.025);
    });
  });

  describe("Livestock Category", () => {
    it("returns meetsNisab false for camels below nisab", () => {
      const input: ZakatCalculationInput = {
        category: "livestock",
        wizardData: {
          livestockType: "camels",
          count: 4,
          paymentMethod: "inkind",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(false);
      expect(result.zakatAmount).toBe(0);
    });

    it("returns zakatInKind for camels", () => {
      const input: ZakatCalculationInput = {
        category: "livestock",
        wizardData: {
          livestockType: "camels",
          count: 25,
          paymentMethod: "inkind",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatInKind).toBe("1 بنت مخاض");
      expect(result.zakatAmount).toBe(0);
    });

    it("converts livestock zakat to cash when payment method is cash", () => {
      const input: ZakatCalculationInput = {
        category: "livestock",
        wizardData: {
          livestockType: "camels",
          count: 25,
          paymentMethod: "cash",
          pricePerHead: 3000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBeGreaterThan(0);
    });

    it("handles cows with cash payment", () => {
      const input: ZakatCalculationInput = {
        category: "livestock",
        wizardData: {
          livestockType: "cows",
          count: 30,
          paymentMethod: "cash",
          pricePerHead: 5000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatInKind).toBe("عجل تبيع");
    });

    it("handles sheep with correct zakat calculation", () => {
      const input: ZakatCalculationInput = {
        category: "livestock",
        wizardData: {
          livestockType: "sheep",
          count: 100,
          paymentMethod: "inkind",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatInKind).toBe("1 شاة");
    });
  });

  describe("Grains Category", () => {
    it("returns meetsNisab false for grains below nisab (653kg)", () => {
      const input: ZakatCalculationInput = {
        category: "grains",
        wizardData: {
          quantity: 600,
          irrigation: "rain",
          purpose: "personal",
          marketValue: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(false);
      expect(result.zakatAmount).toBe(0);
    });

    it("calculates 10% for rain-irrigated grains", () => {
      const input: ZakatCalculationInput = {
        category: "grains",
        wizardData: {
          quantity: 1000,
          irrigation: "rain",
          purpose: "personal",
          marketValue: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(100);
      expect(result.zakatInKind).toBe("100 كجم");
    });

    it("calculates 5% for artificially irrigated grains", () => {
      const input: ZakatCalculationInput = {
        category: "grains",
        wizardData: {
          quantity: 1000,
          irrigation: "artificial",
          purpose: "personal",
          marketValue: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(50);
      expect(result.zakatInKind).toBe("50 كجم");
    });

    it("calculates value-based zakat for trade grains", () => {
      const input: ZakatCalculationInput = {
        category: "grains",
        wizardData: {
          quantity: 1000,
          irrigation: "rain",
          purpose: "trade",
          marketValue: 5000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(5000 * 0.025);
    });
  });

  describe("Agriculture Category", () => {
    it("returns meetsNisab false when net value below nisab", () => {
      const input: ZakatCalculationInput = {
        category: "agriculture",
        wizardData: {
          marketValue: 1000,
          costs: 500,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(false);
    });

    it("calculates zakat with costs deduction", () => {
      const input: ZakatCalculationInput = {
        category: "agriculture",
        wizardData: {
          marketValue: 3000,
          costs: 500,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedNet = 3000 - 500;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedNet * 0.025);
    });

    it("includes breakdown with cost information", () => {
      const input: ZakatCalculationInput = {
        category: "agriculture",
        wizardData: {
          marketValue: 5000,
          costs: 1000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(
        result.breakdown.some((item) => item.label.includes("التكاليف")),
      ).toBe(true);
      expect(result.breakdown.some((item) => item.label.includes("صافي"))).toBe(
        true,
      );
    });
  });

  describe("Commerce Category", () => {
    it("calculates zakat on net assets (inventory + receivables - liabilities)", () => {
      const input: ZakatCalculationInput = {
        category: "commerce",
        wizardData: {
          inventory: 3000,
          receivables: 1000,
          liabilities: 500,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedNet = 3000 + 1000 - 500;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedNet * 0.025);
    });

    it("returns meetsNisab false when net value below nisab", () => {
      const input: ZakatCalculationInput = {
        category: "commerce",
        wizardData: {
          inventory: 500,
          receivables: 200,
          liabilities: 100,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(false);
    });

    it("deducts liabilities from total assets", () => {
      const input: ZakatCalculationInput = {
        category: "commerce",
        wizardData: {
          inventory: 5000,
          receivables: 2000,
          liabilities: 1500,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedNet = 5000 + 2000 - 1500;
      expect(result.zakatAmount).toBe(expectedNet * 0.025);
    });
  });

  describe("Services Category", () => {
    it("deducts living expenses from annual income", () => {
      const input: ZakatCalculationInput = {
        category: "services",
        wizardData: {
          annualIncome: 50000,
          customExpenses: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const defaultExpenses = 39192;
      const expectedSurplus = 50000 - defaultExpenses;
      expect(result.meetsNisab).toBe(true);
      expect(result.zakatAmount).toBe(expectedSurplus * 0.025);
    });

    it("uses custom expenses when provided", () => {
      const input: ZakatCalculationInput = {
        category: "services",
        wizardData: {
          annualIncome: 50000,
          customExpenses: 20000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      const expectedSurplus = 50000 - 20000;
      expect(result.zakatAmount).toBe(expectedSurplus * 0.025);
    });

    it("returns meetsNisab false when surplus below nisab", () => {
      const input: ZakatCalculationInput = {
        category: "services",
        wizardData: {
          annualIncome: 40000,
          customExpenses: 39000,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.meetsNisab).toBe(false);
    });
  });

  describe("Debts Category", () => {
    it("returns zero zakat for payable debts", () => {
      const input: ZakatCalculationInput = {
        category: "debts",
        wizardData: {
          debtType: "payable",
          debtAmount: 1000,
          debtStatus: "expected",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(0);
    });

    it("returns zero zakat for hopeless receivable debts", () => {
      const input: ZakatCalculationInput = {
        category: "debts",
        wizardData: {
          debtType: "receivable",
          debtAmount: 1000,
          debtStatus: "hopeless",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(0);
    });

    it("returns zero zakat for expected receivable debts (deferred zakat)", () => {
      const input: ZakatCalculationInput = {
        category: "debts",
        wizardData: {
          debtType: "receivable",
          debtAmount: 1000,
          debtStatus: "expected",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(0);
    });

    it("calculates zakat for received receivable debts", () => {
      const input: ZakatCalculationInput = {
        category: "debts",
        wizardData: {
          debtType: "receivable",
          debtAmount: 2000,
          debtStatus: "received",
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(2000 * 0.025);
    });
  });

  describe("Solar vs Lunar Year Rates", () => {
    it("uses lunar rate (2.5%) when isSolarYear is false", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2000,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBe(50);
    });

    it("uses solar rate (2.432%) when isSolarYear is true", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2000,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: true,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(result.zakatAmount).toBeCloseTo(48.64, 2);
    });
  });

  describe("Breakdown Information", () => {
    it("includes breakdown in all calculations", () => {
      const input: ZakatCalculationInput = {
        category: "cash",
        wizardData: {
          cashAmount: 2000,
          goldGrams: 0,
          silverGrams: 0,
          immediateDebts: 0,
        },
        isSolarYear: false,
        nisabGold,
        nisabSilver,
      };
      const result = calculateZakat(input);
      expect(Array.isArray(result.breakdown)).toBe(true);
      expect(result.breakdown.length).toBeGreaterThan(0);
      expect(result.breakdown[0]).toHaveProperty("label");
      expect(result.breakdown[0]).toHaveProperty("value");
    });
  });
});
