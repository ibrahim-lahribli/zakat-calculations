import { calculateNisab, meetsNisab, validatePrices } from "../src/core/nisab";
import {
  DEFAULT_SILVER_PRICE,
  DEFAULT_GOLD_PRICE,
  SILVER_NISAB_GRAMS,
  GOLD_NISAB_GRAMS,
} from "../src/core/constants";

describe("Nisab Calculation", () => {
  describe("calculateNisab", () => {
    it("should use nisab override when provided", () => {
      const input = {
        nisabOverride: 10000,
      };

      expect(calculateNisab(input)).toBe(10000);
    });

    it("should calculate using gold method with custom price", () => {
      const input = {
        nisabMethod: "gold" as const,
        goldPricePerGram: 900,
      };

      expect(calculateNisab(input)).toBe(900 * GOLD_NISAB_GRAMS);
    });

    it("should calculate using gold method with default price", () => {
      const input = {
        nisabMethod: "gold" as const,
      };

      expect(calculateNisab(input)).toBe(DEFAULT_GOLD_PRICE * GOLD_NISAB_GRAMS);
    });

    it("should calculate using silver method with custom price", () => {
      const input = {
        nisabMethod: "silver" as const,
        silverPricePerGram: 15,
      };

      expect(calculateNisab(input)).toBe(15 * SILVER_NISAB_GRAMS);
    });

    it("should use silver method as default", () => {
      const input = {};

      expect(calculateNisab(input)).toBe(
        DEFAULT_SILVER_PRICE * SILVER_NISAB_GRAMS,
      );
    });
  });

  describe("meetsNisab", () => {
    it("should return true when wealth equals nisab", () => {
      expect(meetsNisab(1000, 1000)).toBe(true);
    });

    it("should return true when wealth exceeds nisab", () => {
      expect(meetsNisab(1500, 1000)).toBe(true);
    });

    it("should return false when wealth is below nisab", () => {
      expect(meetsNisab(500, 1000)).toBe(false);
    });
  });

  describe("validatePrices", () => {
    it("should validate reasonable prices", () => {
      expect(validatePrices(20, 500)).toBe(true);
    });

    it("should reject negative prices", () => {
      expect(validatePrices(-10, 500)).toBe(false);
      expect(validatePrices(20, -100)).toBe(false);
    });

    it("should reject excessively high prices", () => {
      expect(validatePrices(2000, 500)).toBe(false);
      expect(validatePrices(20, 20000)).toBe(false);
    });

    it("should accept undefined prices", () => {
      expect(validatePrices()).toBe(true);
      expect(validatePrices(20)).toBe(true);
      expect(validatePrices(undefined, 500)).toBe(true);
    });
  });
});
