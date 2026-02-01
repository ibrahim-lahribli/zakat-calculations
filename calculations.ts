import {
  ZakatCategory,
  ZakatCalculationInput,
  ZakatCalculationResult,
} from "./types";

export const OPTION_LABELS: Record<string, string> = {
  // Irrigation methods
  rain: "مطر طبيعي (10%)",
  artificial: "ري صناعي (5%)",
  
  // Purpose types
  personal: "استهلاك شخصي",
  trade: "تجارة وبيع",
  
  // Livestock types
  camels: "إبل",
  cows: "بقر",
  sheep: "غنم/ماعز",
  
  // Payment methods
  inkind: "عيناً (من الماشية نفسها)",
  cash: "نقداً (بسعر السوق)",
  
  // Family status
  single: "فرد (خصم الكفاية: 3,266 درهم شهرياً)",
  family: "عائلة (خصم الكفاية: 3,266 درهم شهرياً)",
  
  // Debt types
  receivable: "دين لي على الغير (أنا الدائن)",
  payable: "دين علي للغير (أنا المدين)",
  
  // Debt status
  expected: "مرجو السداد قريباً",
  doubtful: "مشكوك في تحصيله",
  hopeless: "ميؤوس منه",
};

// Configuration constants based on Moroccan Fatwa (Oct 2025)
export const CONFIG_VALUES = {
  // SMIG (Minimum wage) from Fatwa: 3,266 Dirhams per month
  SMIG_MONTHLY: 3266,
  SMIG_ANNUAL: 3266 * 12, // 39,192 Dirhams per year
  
  // Nisab values (can be updated from market prices)
  NISAB_GRAINS_KG: 653, // 5 wasq in kg
  
  // Zakat rates
  RATE_LUNAR: 0.025, // 2.5%
  RATE_SOLAR: 0.02432, // 2.432%
  RATE_RAIN_IRRIGATION: 0.1, // 10%
  RATE_ARTIFICIAL_IRRIGATION: 0.05, // 5%
};

// Livestock zakat tables (Maliki school)
export const CAMEL_ZAKAT_TABLE = [
  { min: 5, max: 9, zakat: 1, type: "شاة" },
  { min: 10, max: 14, zakat: 2, type: "شياه" },
  { min: 15, max: 19, zakat: 3, type: "شياه" },
  { min: 20, max: 24, zakat: 4, type: "شياه" },
  { min: 25, max: 35, zakat: 1, type: "بنت مخاض" },
  { min: 36, max: 45, zakat: 1, type: "بنت لبون" },
  { min: 46, max: 60, zakat: 1, type: "حقة" },
  { min: 61, max: 75, zakat: 1, type: "جذعة" },
  { min: 76, max: 90, zakat: 2, type: "بنتا لبون" },
  { min: 91, max: 120, zakat: 2, type: "حقتان" },
];

export function getCamelZakat(count: number): string | null {
  if (count < 5) return null;
  if (count <= 120) {
    const row = CAMEL_ZAKAT_TABLE.find((r) => count >= r.min && count <= r.max);
    return row ? `${row.zakat} ${row.type}` : null;
  }
  if (count >= 121 && count <= 129) {
    return "حقتان أو ثلاث بنات لبون";
  }
  // Above 130: In every 40 a Bint Laboun, in every 50 a Hiqqa
  let bestHiqqa = 0;
  let bestBintLaboun = 0;
  let maxCovered = 0;
  for (let h = 0; h <= Math.floor(count / 50); h++) {
    const bl = Math.floor((count - h * 50) / 40);
    const covered = h * 50 + bl * 40;
    if (covered > maxCovered) {
      maxCovered = covered;
      bestHiqqa = h;
      bestBintLaboun = bl;
    }
  }
  const results = [];
  if (bestHiqqa > 0) results.push(`${bestHiqqa} حقة`);
  if (bestBintLaboun > 0) results.push(`${bestBintLaboun} بنت لبون`);
  return results.join(" + ");
}

export function getCowZakat(count: number): string | null {
  if (count < 30) return null;
  if (count <= 39) return "عجل تبيع";
  if (count <= 59) return "مسنة";
  // For 60 and above: combination of 30s (tabi3) and 40s (musinna)
  let bestTabi3 = 0;
  let bestMusinna = 0;
  let maxCovered = 0;
  for (let m = 0; m <= Math.floor(count / 40); m++) {
    const t = Math.floor((count - m * 40) / 30);
    const covered = m * 40 + t * 30;
    if (covered > maxCovered) {
      maxCovered = covered;
      bestTabi3 = t;
      bestMusinna = m;
    }
  }
  const results = [];
  if (bestTabi3 > 0) results.push(`${bestTabi3} تبيع`);
  if (bestMusinna > 0) results.push(`${bestMusinna} مسنة`);
  return results.join(" + ");
}

export function getSheepZakat(count: number): string | null {
  if (count < 40) return null;
  if (count <= 120) return "1 شاة";
  if (count <= 200) return "2 شياه";
  if (count <= 399) return "3 شياه";
  return `${Math.floor(count / 100)} شياه`;
}

export function calculateZakat(
  input: ZakatCalculationInput,
): ZakatCalculationResult {
  const {
    category: selectedCategory,
    wizardData,
    nisabSilver,
    nisabGold,
    isSolarYear,
    showNisabGold = false,
  } = input;
  // Use the appropriate nisab based on showNisabGold flag
  const activeNisab = showNisabGold ? nisabGold : nisabSilver;
  let zakatAmount = 0;
  const breakdown: { label: string; value: number | string }[] = [];
  let meetsNisab = true;
  let zakatInKind = "";

  // Zakat rates according to Oct 2025 Fatwa
  const ZAKAT_RATE_LUNAR = 0.025; // 2.5%
  const ZAKAT_RATE_SOLAR = 0.02432; // 2.432%
  const activeRate = isSolarYear ? ZAKAT_RATE_SOLAR : ZAKAT_RATE_LUNAR;

  switch (selectedCategory) {
    case "grains": {
      const quantity = Number(wizardData.quantity) || 0;
      const irrigation = wizardData.irrigation as string;
      const purpose = wizardData.purpose as string;
      const marketValue = Number(wizardData.marketValue) || 0;
      if (quantity < 653) {
        meetsNisab = false;
        breakdown.push({ label: "الكمية", value: `${quantity} كجم` });
        breakdown.push({ label: "النصاب المطلوب", value: "653 كجم (5 أوسق)" });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      breakdown.push({
        label: "الكمية",
        value: `${quantity.toLocaleString("ar-MA")} كجم`,
      });
      breakdown.push({
        label: "الغرض من المحصول",
        value: OPTION_LABELS[purpose],
      });
      
      // Validation: marketValue is required when purpose is 'trade'
      if (purpose === "trade" && marketValue <= 0) {
        breakdown.push({
          label: "خطأ",
          value: "القيمة السوقية مطلوبة عند الغرض التجاري",
        });
        return {
          zakatAmount: 0,
          meetsNisab: false,
          zakatInKind: "",
          breakdown,
        };
      }
      if (purpose === "trade" && marketValue > 0) {
        zakatAmount = marketValue * activeRate;
        breakdown.push({
          label: "القيمة السوقية",
          value: `${marketValue.toLocaleString("ar-MA")} درهم`,
        });
        breakdown.push({
          label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
          value: `${(activeRate * 100).toFixed(1)}%`,
        });
      } else {
        const rate = irrigation === "rain" ? 0.1 : 0.05;
        zakatAmount = quantity * rate;
        zakatInKind = `${zakatAmount.toLocaleString("ar-MA")} كجم`;
        breakdown.push({
          label: "طريقة الري",
          value: OPTION_LABELS[irrigation],
        });
        breakdown.push({ label: "نسبة الزكاة", value: `${rate * 100}%` });
      }
      break;
    }
    case "livestock": {
      const livestockType = wizardData.livestockType as string;
      const count = Number(wizardData.count) || 0;
      const paymentMethod = wizardData.paymentMethod as string;
      const pricePerHead = Number(wizardData.pricePerHead) || 0;
      breakdown.push({
        label: "نوع الماشية",
        value: OPTION_LABELS[livestockType],
      });
      breakdown.push({ label: "العدد", value: `${count} رأس` });
      breakdown.push({
        label: "طريقة الدفع",
        value: OPTION_LABELS[paymentMethod],
      });
      let zakatResult: string | null = null;
      let nisabCount = 0;
      if (livestockType === "camels") {
        nisabCount = 5;
        zakatResult = getCamelZakat(count);
      } else if (livestockType === "cows") {
        nisabCount = 30;
        zakatResult = getCowZakat(count);
      } else {
        nisabCount = 40;
        zakatResult = getSheepZakat(count);
      }
      if (!zakatResult) {
        meetsNisab = false;
        breakdown.push({ label: "النصاب المطلوب", value: `${nisabCount} رأس` });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      zakatInKind = zakatResult;
      breakdown.push({ label: "الزكاة الواجبة", value: zakatResult });
      if (paymentMethod === "cash" && pricePerHead > 0) {
        const headCount = Number.parseInt(zakatResult) || 1;
        zakatAmount = headCount * pricePerHead;
        breakdown.push({
          label: "سعر الرأس",
          value: `${pricePerHead.toLocaleString("ar-MA")} درهم`,
        });
      }
      break;
    }
    case "agriculture": {
      const marketValue = Number(wizardData.marketValue) || 0;
      const costs = Number(wizardData.costs) || 0;
      const netValue = marketValue - costs;
      breakdown.push({
        label: "القيمة السوقية",
        value: `${marketValue.toLocaleString("ar-MA")} درهم`,
      });
      if (costs > 0) {
        breakdown.push({
          label: "التكاليف المخصومة",
          value: `${costs.toLocaleString("ar-MA")} درهم`,
        });
      }
      breakdown.push({
        label: "صافي القيمة",
        value: `${netValue.toLocaleString("ar-MA")} درهم`,
      });
      if (netValue < nisabSilver) {
        meetsNisab = false;
        breakdown.push({
          label: "النصاب المطلوب",
          value: `${nisabSilver.toLocaleString("ar-MA")} درهم`,
        });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      zakatAmount = netValue * activeRate;
      breakdown.push({
        label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
        value: `${(activeRate * 100).toFixed(1)}%`,
      });
      break;
    }
    case "commerce": {
      const inventory = Number(wizardData.inventory) || 0;
      const receivables = Number(wizardData.receivables) || 0;
      const liabilities = Number(wizardData.liabilities) || 0;
      const totalAssets = inventory + receivables;
      const netValue = totalAssets - liabilities;
      breakdown.push({
        label: "قيمة المخزون",
        value: `${inventory.toLocaleString("ar-MA")} درهم`,
      });
      if (receivables > 0) {
        breakdown.push({
          label: "المستحقات لك",
          value: `${receivables.toLocaleString("ar-MA")} درهم`,
        });
      }
      if (liabilities > 0) {
        breakdown.push({
          label: "الالتزامات عليك",
          value: `- ${liabilities.toLocaleString("ar-MA")} درهم`,
        });
      }
      breakdown.push({
        label: "صافي القيمة",
        value: `${netValue.toLocaleString("ar-MA")} درهم`,
      });
      if (netValue < nisabSilver) {
        meetsNisab = false;
        breakdown.push({
          label: "النصاب المطلوب",
          value: `${nisabSilver.toLocaleString("ar-MA")} درهم`,
        });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      zakatAmount = netValue * activeRate;
      breakdown.push({
        label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
        value: `${(activeRate * 100).toFixed(1)}%`,
      });
      break;
    }
    case "services": {
      const annualIncome = Number(wizardData.annualIncome) || 0;
      const customExpenses = Number(wizardData.customExpenses) || 0;
      const defaultExpenses = CONFIG_VALUES.SMIG_ANNUAL;
      const livingExpenses =
        customExpenses > 0 ? customExpenses : defaultExpenses;
      const surplus = annualIncome - livingExpenses;
      breakdown.push({
        label: "الدخل السنوي",
        value: `${annualIncome.toLocaleString("ar-MA")} درهم`,
      });
      breakdown.push({
        label: "خصم الكفاية (المعيشة الدنيا)",
        value: `- ${livingExpenses.toLocaleString("ar-MA")} درهم`,
      });
      breakdown.push({
        label: "الفائض",
        value: `${surplus.toLocaleString("ar-MA")} درهم`,
      });
      if (surplus < nisabSilver) {
        meetsNisab = false;
        breakdown.push({
          label: "النصاب المطلوب",
          value: `${nisabSilver.toLocaleString("ar-MA")} درهم`,
        });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      zakatAmount = surplus * activeRate;
      breakdown.push({
        label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
        value: `${(activeRate * 100).toFixed(1)}%`,
      });
      break;
    }
    case "cash": {
      const cashAmount = Number(wizardData.cashAmount) || 0;
      const goldGrams = Number(wizardData.goldGrams) || 0;
      const silverGrams = Number(wizardData.silverGrams) || 0;
      const immediateDebts = Number(wizardData.immediateDebts) || 0;
      const goldValue = goldGrams * (Number(wizardData.priceGold) || 800);
      const silverValue = silverGrams * (Number(wizardData.priceSilver) || 12);
      const totalAssets = cashAmount + goldValue + silverValue;
      const netValue = totalAssets - immediateDebts;
      breakdown.push({
        label: "النقود",
        value: `${cashAmount.toLocaleString("ar-MA")} درهم`,
      });
      if (goldGrams > 0) {
        breakdown.push({
          label: `الذهب (${goldGrams} غرام)`,
          value: `${goldValue.toLocaleString("ar-MA")} درهم`,
        });
      }
      if (silverGrams > 0) {
        breakdown.push({
          label: `الفضة (${silverGrams} غرام)`,
          value: `${silverValue.toLocaleString("ar-MA")} درهم`,
        });
      }
      if (immediateDebts > 0) {
        breakdown.push({
          label: "الديون الفورية",
          value: `- ${immediateDebts.toLocaleString("ar-MA")} درهم`,
        });
      }
      breakdown.push({
        label: "صافي القيمة",
        value: `${netValue.toLocaleString("ar-MA")} درهم`,
      });
      if (netValue < nisabSilver) {
        meetsNisab = false;
        breakdown.push({
          label: "النصاب المطلوب",
          value: `${nisabSilver.toLocaleString("ar-MA")} درهم`,
        });
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      zakatAmount = netValue * activeRate;
      breakdown.push({
        label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
        value: `${(activeRate * 100).toFixed(1)}%`,
      });
      break;
    }
    case "debts": {
      const debtType = wizardData.debtType as string;
      const debtAmount = Number(wizardData.debtAmount) || 0;
      const debtStatus = wizardData.debtStatus as string;
      breakdown.push({ label: "نوع الدين", value: OPTION_LABELS[debtType] });
      breakdown.push({
        label: "المبلغ",
        value: `${debtAmount.toLocaleString("ar-MA")} درهم`,
      });
      breakdown.push({ label: "الحالة", value: OPTION_LABELS[debtStatus] });
      if (debtType === "payable") {
        breakdown.push({
          label: "ملاحظة",
          value: "يُخصم من إجمالي ثروتك قبل حساب الزكاة",
        });
        zakatAmount = 0;
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      if (debtStatus === "hopeless") {
        breakdown.push({
          label: "ملاحظة",
          value: "دين ميؤوس منه لا زكاة عليه حتى يُسترجع",
        });
        zakatAmount = 0;
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      if (debtStatus === "expected" || debtStatus === "doubtful") {
        breakdown.push({ label: "ملاحظة", value: "يُزكى عند استرجاعه فقط" });
        zakatAmount = 0;
        return {
          zakatAmount,
          meetsNisab,
          zakatInKind,
          breakdown,
        };
      }
      // Receivable and expected to be paid
      zakatAmount = debtAmount * activeRate;
      breakdown.push({
        label: `نسبة الزكاة (${isSolarYear ? "ميلادي" : "هجري"})`,
        value: `${(activeRate * 100).toFixed(1)}%`,
      });
      break;
    }
    default:
      meetsNisab = false;
      return {
        zakatAmount,
        meetsNisab,
        zakatInKind,
        breakdown,
      };
  }
  return {
    zakatAmount,
    meetsNisab,
    zakatInKind,
    breakdown,
  };
}
