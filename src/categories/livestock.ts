import { LivestockInput, CategoryZakatResult } from "../core/types";
import { LIVESTOCK_THRESHOLDS } from "../core/constants";

/**
 * Calculates Zakat for livestock (sheep, goats, cattle, camels)
 * 
 * Implementation based on Moroccan High Scientific Council Fatwa:
 * - Sheep/Goats: Nisab = 40, specific progression
 * - Cattle: Nisab = 30, with calf/cow differentiation
 * - Camels: Nisab = 5, with specific progression including sheep and camel ages
 * 
 * @param input - Livestock calculation input
 * @param _nisab - Nisab threshold amount (not used for livestock - animal count based)
 * @returns Zakat calculation result for livestock
 */
export function calculateLivestockZakat(input: LivestockInput, _nisab: number): CategoryZakatResult {
  validateLivestockInput(input);

  const {
    sheep = 0,
    goats = 0,
    cattle = 0,
    camels = 0,
    marketPricePerSheep = 0,
    marketPricePerGoat = 0,
    marketPricePerCattle = 0,
    marketPricePerCamel = 0,
    marketPricePerCalf = 0
  } = input;

  let totalZakatCash = 0;
  let netWealth = 0;
  const zakatAnimals: any = {
    sheep: 0,
    goats: 0,
    cattle: { calves: 0, cows: 0 },
    camels: { sheep: 0, bintMakhad: 0, bintLabun: 0, hiqqah: 0, jadhaah: 0 }
  };

  // 1. Sheep Zakat
  zakatAnimals.sheep = calculateSheepZakat(sheep);
  if (zakatAnimals.sheep > 0 && marketPricePerSheep > 0) {
    totalZakatCash += zakatAnimals.sheep * marketPricePerSheep;
  }

  // 2. Goats Zakat
  zakatAnimals.goats = calculateGoatsZakat(goats);
  if (zakatAnimals.goats > 0 && marketPricePerGoat > 0) {
    totalZakatCash += zakatAnimals.goats * marketPricePerGoat;
  }

  // 3. Cattle Zakat
  const cattleDue = calculateCattleZakat(cattle);
  zakatAnimals.cattle = cattleDue;
  if (cattleDue.calves > 0 && marketPricePerCalf > 0) {
    totalZakatCash += cattleDue.calves * marketPricePerCalf;
  }
  if (cattleDue.cows > 0 && marketPricePerCattle > 0) {
    totalZakatCash += cattleDue.cows * marketPricePerCattle;
  }

  // 4. Camels Zakat
  const camelsDue = calculateCamelsZakat(camels);
  zakatAnimals.camels = camelsDue;
  if (camelsDue.sheep > 0 && marketPricePerSheep > 0) {
    totalZakatCash += camelsDue.sheep * marketPricePerSheep;
  }
  // Simplified camel value for cash zakt if specific prices for ages not provided
  const camelZakatCount = camelsDue.bintMakhad + camelsDue.bintLabun + camelsDue.hiqqah + camelsDue.jadhaah;
  if (camelZakatCount > 0 && marketPricePerCamel > 0) {
    totalZakatCash += camelZakatCount * marketPricePerCamel;
  }

  // Calculate total net wealth
  netWealth =
    (sheep * marketPricePerSheep) +
    (goats * marketPricePerGoat) +
    (cattle * marketPricePerCattle) +
    (camels * marketPricePerCamel);

  const hasZakat = zakatAnimals.sheep > 0 || zakatAnimals.goats > 0 ||
    zakatAnimals.cattle.calves > 0 || zakatAnimals.cattle.cows > 0 ||
    camelsDue.sheep > 0 || camelZakatCount > 0;

  return {
    zakatAmount: totalZakatCash,
    isApplicable: hasZakat,
    netWealth
  };
}

function calculateSheepZakat(count: number): number {
  const config = LIVESTOCK_THRESHOLDS.sheep;
  if (count < config.nisab) return 0;

  if (count >= 400) {
    return Math.floor(count / 100);
  }

  for (const range of config.ranges) {
    if (count >= range.min && count <= range.max) {
      return range.zakat;
    }
  }
  return 0;
}

function calculateGoatsZakat(count: number): number {
  const config = LIVESTOCK_THRESHOLDS.goats;
  if (count < config.nisab) return 0;

  if (count >= 400) {
    return Math.floor(count / 100);
  }

  for (const range of config.ranges) {
    if (count >= range.min && count <= range.max) {
      return range.zakat;
    }
  }
  return 0;
}

function calculateCattleZakat(count: number): { calves: number; cows: number } {
  const config = LIVESTOCK_THRESHOLDS.cattle;
  if (count < config.nisab) return { calves: 0, cows: 0 };

  // For ranges 30-59
  for (const range of config.ranges) {
    if (count >= range.min && count <= range.max) {
      return { ...range.zakat };
    }
  }

  // For 60+: "In every 30 a calf, and in every 40 a cow"
  // We need to find x, y such that 30x + 40y <= count and N - (30x + 40y) is minimized
  // In fiqh, if multiple solutions exist, usually choose the one that benefits the poor
  let bestX = 0;
  let bestY = 0;
  let minRemainder = count;

  for (let y = 0; y * 40 <= count; y++) {
    const remaining = count - (y * 40);
    const x = Math.floor(remaining / 30);
    const remainder = count - (x * 30 + y * 40);

    if (remainder < minRemainder) {
      minRemainder = remainder;
      bestX = x;
      bestY = y;
    } else if (remainder === minRemainder) {
      // If remainder is same, prefer more cows (y) as they are more valuable
      if (y > bestY) {
        bestX = x;
        bestY = y;
      }
    }
  }

  return { calves: bestX, cows: bestY };
}

function calculateCamelsZakat(count: number): any {
  const config = LIVESTOCK_THRESHOLDS.camels;
  const result = { sheep: 0, bintMakhad: 0, bintLabun: 0, hiqqah: 0, jadhaah: 0 };

  if (count < config.nisab) return result;

  // Handling fixed ranges 5-129
  for (const range of config.ranges) {
    if (count >= range.min && count <= range.max) {
      Object.assign(result, range.zakat);
      return result;
    }
  }

  // For 130+: "For every 40 a Bint Labun, for every 50 a Hiqqah"
  let bestX = 0; // Bint Labun (40)
  let bestY = 0; // Hiqqah (50)
  let minRemainder = count;

  for (let y = 0; y * 50 <= count; y++) {
    const remaining = count - (y * 50);
    const x = Math.floor(remaining / 40);
    const remainder = count - (x * 40 + y * 50);

    if (remainder < minRemainder) {
      minRemainder = remainder;
      bestX = x;
      bestY = y;
    } else if (remainder === minRemainder) {
      // Prefer more Hiqqahs (older) if remainder is same
      if (y > bestY) {
        bestX = x;
        bestY = y;
      }
    }
  }

  result.bintLabun = bestX;
  result.hiqqah = bestY;
  return result;
}

export function validateLivestockInput(input: LivestockInput): void {
  const fields = ['sheep', 'goats', 'cattle', 'camels', 'marketPricePerSheep', 'marketPricePerGoat', 'marketPricePerCattle', 'marketPricePerCamel', 'marketPricePerCalf'];
  for (const field of fields) {
    const val = (input as any)[field];
    if (val !== undefined && (typeof val !== 'number' || !isFinite(val) || val < 0)) {
      throw new Error(`${field} must be a non-negative finite number`);
    }
  }
}

