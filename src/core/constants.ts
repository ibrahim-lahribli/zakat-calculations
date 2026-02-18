/**
 * Default metal prices per gram (fallback values when external prices not provided)
 * These are conservative estimates based on fatwa recommendations
 * Prices are in Moroccan Dirham (MAD) - the currency referenced in the source fatwa
 */
export const DEFAULT_SILVER_PRICE = 12; // MAD per gram
export const DEFAULT_GOLD_PRICE = 800; // MAD per gram

/**
 * Nisab thresholds in grams according to Maliki fiqh
 */
export const SILVER_NISAB_GRAMS = 595;
export const GOLD_NISAB_GRAMS = 85;

/**
 * Standard Zakat rates
 */
export const STANDARD_ZAKAT_RATE = 0.025; // 2.5%
export const RAIN_FED_CROPS_RATE = 0.1; // 10%
export const IRRIGATED_CROPS_RATE = 0.05; // 5%

/**
 * Minimum harvest threshold for crops Zakat (in kg)
 */
export const CROPS_MINIMUM_THRESHOLD_KG = 653;

/**
 * Minimum living expense deduction (SMIG) per Moroccan High Scientific Council Fatwa
 */
export const MINIMUM_LIVING_EXPENSE_MAD = 3266;

/**
 * Livestock thresholds for Zakat
 */
export const LIVESTOCK_THRESHOLDS = {
  sheep: {
    nisab: 40,
    ranges: [
      { min: 40, max: 120, zakat: 1, label: "One Sheep" },
      { min: 121, max: 200, zakat: 2, label: "Two Sheep" },
      { min: 201, max: 399, zakat: 3, label: "Three Sheep" },
    ],
    ratePer100: 1,
  },
  goats: {
    nisab: 40,
    ranges: [
      { min: 40, max: 120, zakat: 1, label: "One Goat" },
      { min: 121, max: 200, zakat: 2, label: "Two Goats" },
      { min: 201, max: 399, zakat: 3, label: "Three Goats" },
    ],
    ratePer100: 1,
  },
  cattle: {
    nisab: 30,
    ranges: [
      {
        min: 30,
        max: 39,
        zakat: { calves: 1, cows: 0 },
        label: "One Tabi'a (calf - 1 year old)",
      },
      {
        min: 40,
        max: 59,
        zakat: { calves: 0, cows: 1 },
        label: "One Musinnah (cow - 2 years old)",
      },
    ],
    per30: { calves: 1, cows: 0 },
    per40: { calves: 0, cows: 1 },
  },
  camels: {
    nisab: 5,
    ranges: [
      { min: 5, max: 9, zakat: { sheep: 1 }, label: "One Sheep" },
      { min: 10, max: 14, zakat: { sheep: 2 }, label: "Two Sheep" },
      { min: 15, max: 19, zakat: { sheep: 3 }, label: "Three Sheep" },
      { min: 20, max: 24, zakat: { sheep: 4 }, label: "Four Sheep" },
      {
        min: 25,
        max: 35,
        zakat: { bintMakhad: 1 },
        label: "One Bint Makhad (1 year old)",
      },
      {
        min: 36,
        max: 45,
        zakat: { bintLabun: 1 },
        label: "One Bint Labun (2 years old)",
      },
      {
        min: 46,
        max: 60,
        zakat: { hiqqah: 1 },
        label: "One Hiqqah (3 years old)",
      },
      {
        min: 61,
        max: 75,
        zakat: { jadhaah: 1 },
        label: "One Jadhaah (4 years old)",
      },
      { min: 76, max: 90, zakat: { bintLabun: 2 }, label: "Two Bint Labun" },
      { min: 91, max: 120, zakat: { hiqqah: 2 }, label: "Two Hiqqah" },
      {
        min: 121,
        max: 129,
        zakat: { hiqqah: 2 },
        label: "Two Hiqqah (or three Bint Labun)",
      },
    ],
    per40: { bintLabun: 1 },
    per50: { hiqqah: 1 },
  },
} as const;
