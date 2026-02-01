import { CategoryConfig, ZakatCategory } from "./types";

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

// Option labels for form fields
export const OPTION_LABELS: Record<string, string> = {
  // Irrigation methods
  rain: "مطر أو نهر (بدون تكلفة) - الزكاة 10%",
  artificial: "ري صناعي (بتكلفة) - الزكاة 5%",
  
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

// Grains Category Configuration - Phase 2 Example
export const GRAINS_CONFIG: CategoryConfig = {
  category: "grains",
  title: "زكاة الحبوب والثمار",
  description: "حساب زكاة الحبوب والثمار حسب طريقة الري والغرض من المحصول",
  fields: [
    {
      name: "quantity",
      label: "كمية المحصول",
      type: "number",
      required: true,
      unit: "كجم",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل كمية المحصول بالكيلوجرام. النصاب الشرعي هو 653 كجم (5 أوسق)",
      placeholder: "مثال: 1000"
    },
    {
      name: "irrigation",
      label: "طريقة الري",
      type: "radio",
      required: true,
      options: [
        { value: "rain", label: OPTION_LABELS.rain },
        { value: "artificial", label: OPTION_LABELS.artificial }
      ],
      validation: [{ type: "required" }],
      helpText: "تحديد طريقة الري يحدد نسبة الزكاة: 10% للري الطبيعي، 5% للري الصناعي"
    },
    {
      name: "purpose",
      label: "الغرض من المحصول",
      type: "radio",
      required: true,
      options: [
        { value: "personal", label: OPTION_LABELS.personal },
        { value: "trade", label: OPTION_LABELS.trade }
      ],
      validation: [{ type: "required" }],
      helpText: "إذا كان الغرض تجارياً، سيتم حساب الزكاة على القيمة السوقية"
    },
    {
      name: "marketValue",
      label: "القيمة السوقية (للتجارة) (اختياري)",
      type: "number",
      required: false,
      unit: "درهم",
      dependsOn: { field: "purpose", value: "trade" },
      validation: [
        { 
          type: "conditional", 
          condition: { field: "purpose", operator: "equals", value: "trade" },
          rule: { type: "required" }
        },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل القيمة السوقية الإجمالية للمحصول إذا كان الغرض تجارياً",
      placeholder: "مثال: 5000"
    }
  ],
  nisabRules: {
    type: "weight",
    threshold: CONFIG_VALUES.NISAB_GRAINS_KG,
    unit: "كجم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR,
    special: {
      rain: CONFIG_VALUES.RATE_RAIN_IRRIGATION,
      artificial: CONFIG_VALUES.RATE_ARTIFICIAL_IRRIGATION
    }
  }
};

// Livestock Category Configuration
export const LIVESTOCK_CONFIG: CategoryConfig = {
  category: "livestock",
  title: "زكاة الماشية",
  description: "حساب زكاة الإبل والبقر والغنم حسب العدد ونوع الماشية",
  fields: [
    {
      name: "livestockType",
      label: "نوع الماشية",
      type: "select",
      required: true,
      options: [
        { value: "camels", label: OPTION_LABELS.camels },
        { value: "cows", label: OPTION_LABELS.cows },
        { value: "sheep", label: OPTION_LABELS.sheep }
      ],
      validation: [{ type: "required" }],
      helpText: "اختر نوع الماشية لحساب الزكاة الشرعية"
    },
    {
      name: "count",
      label: "العدد",
      type: "number",
      required: true,
      unit: "رأس",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل عدد رؤوس الماشية",
      placeholder: "مثال: 25"
    },
    {
      name: "paymentMethod",
      label: "طريقة الدفع",
      type: "radio",
      required: true,
      options: [
        { value: "inkind", label: OPTION_LABELS.inkind },
        { value: "cash", label: OPTION_LABELS.cash }
      ],
      validation: [{ type: "required" }],
      helpText: "اختر طريقة إخراج الزكاة"
    },
    {
      name: "pricePerHead",
      label: "سعر الرأس الواحد",
      type: "number",
      required: false,
      unit: "درهم",
      dependsOn: { field: "paymentMethod", value: "cash" },
      validation: [
        { 
          type: "conditional", 
          condition: { field: "paymentMethod", operator: "equals", value: "cash" },
          rule: { type: "required" }
        },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل سعر الرأس الواحد بالدرهم عند اختيار الدفع نقداً",
      placeholder: "مثال: 3000"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Varies by livestock type
    unit: "رأس"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Cash Category Configuration
export const CASH_CONFIG: CategoryConfig = {
  category: "cash",
  title: "زكاة النقود والذهب والفضة",
  description: "حساب زكاة النقود والمعادن النفيسة بعد خصم الديون الفورية",
  fields: [
    {
      name: "cashAmount",
      label: "النقود",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل المبلغ النقدي الذي تملكه",
      placeholder: "مثال: 10000"
    },
    {
      name: "goldGrams",
      label: "الذهب",
      type: "number",
      required: false,
      unit: "غرام",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل كمية الذهب بالغرام",
      placeholder: "مثال: 50"
    },
    {
      name: "silverGrams",
      label: "الفضة",
      type: "number",
      required: false,
      unit: "غرام",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل كمية الفضة بالغرام",
      placeholder: "مثال: 100"
    },
    {
      name: "priceGold",
      label: "سعر الذهب بالغرام",
      type: "number",
      required: false,
      unit: "درهم",
      defaultValue: 800,
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل سعر غرام الذهب الحالي بالدرهم",
      placeholder: "مثال: 800"
    },
    {
      name: "priceSilver",
      label: "سعر الفضة بالغرام",
      type: "number",
      required: false,
      unit: "درهم",
      defaultValue: 12,
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل سعر غرام الفضة الحالي بالدرهم",
      placeholder: "مثال: 12"
    },
    {
      name: "immediateDebts",
      label: "الديون الفورية",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل الديون التي يجب سدادها فوراً",
      placeholder: "مثال: 2000"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Will be set dynamically based on gold/silver prices
    unit: "درهم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Commerce Category Configuration
export const COMMERCE_CONFIG: CategoryConfig = {
  category: "commerce",
  title: "زكاة التجارة والصناعة",
  description: "حساب زكاة السلع التجارية والمنتجات الصناعية",
  fields: [
    {
      name: "inventory",
      label: "قيمة المخزون",
      type: "number",
      required: true,
      unit: "درهم",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل القيمة السوقية الحالية للمخزون",
      placeholder: "مثال: 50000"
    },
    {
      name: "receivables",
      label: "المستحقات لك",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل قيمة الديون المستحقة لك",
      placeholder: "مثال: 10000"
    },
    {
      name: "liabilities",
      label: "الالتزامات عليك",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل قيمة الالتزامات والديون التي عليك",
      placeholder: "مثال: 5000"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Will be set dynamically
    unit: "درهم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Services Category Configuration
export const SERVICES_CONFIG: CategoryConfig = {
  category: "services",
  title: "زكاة الخدمات والأجور",
  description: "حساب زكاة الدخل من الخدمات والأجور بعد خصم نفقات الكفاية",
  fields: [
    {
      name: "annualIncome",
      label: "الدخل السنوي",
      type: "number",
      required: true,
      unit: "درهم",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل إجمالي الدخل السنوي",
      placeholder: "مثال: 60000"
    },
    {
      name: "customExpenses",
      label: "نفقات المعيشة الفعلية (اختياري)",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "إذا كانت نفقاتك تختلف عن الكفاية الشرعية، أدخل المبلغ الفعلي سنوياً",
      placeholder: "مثال: 40000"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Will be set dynamically
    unit: "درهم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Agriculture Category Configuration
export const AGRICULTURE_CONFIG: CategoryConfig = {
  category: "agriculture",
  title: "زكاة المنتجات الفلاحية الأخرى",
  description: "حساب زكاة المنتجات الفلاحية والغابات والصيد بعد خصم التكاليف",
  fields: [
    {
      name: "marketValue",
      label: "القيمة السوقية",
      type: "number",
      required: true,
      unit: "درهم",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل القيمة السوقية الإجمالية للمنتجات",
      placeholder: "مثال: 20000"
    },
    {
      name: "costs",
      label: "التكاليف المخصومة",
      type: "number",
      required: false,
      unit: "درهم",
      validation: [{ type: "min", value: 0 }],
      helpText: "أدخل التكاليف التي يمكن خصمها من القيمة",
      placeholder: "مثال: 5000"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Will be set dynamically
    unit: "درهم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Debts Category Configuration
export const DEBTS_CONFIG: CategoryConfig = {
  category: "debts",
  title: "زكاة الديون",
  description: "حساب زكاة الديون حسب النوع والحالة",
  fields: [
    {
      name: "debtType",
      label: "نوع الدين",
      type: "radio",
      required: true,
      options: [
        { value: "receivable", label: OPTION_LABELS.receivable },
        { value: "payable", label: OPTION_LABELS.payable }
      ],
      validation: [{ type: "required" }],
      helpText: "اختر نوع الدين"
    },
    {
      name: "debtAmount",
      label: "المبلغ",
      type: "number",
      required: true,
      unit: "درهم",
      validation: [
        { type: "required" },
        { type: "min", value: 0 }
      ],
      helpText: "أدخل قيمة الدين",
      placeholder: "مثال: 5000"
    },
    {
      name: "debtStatus",
      label: "حالة الدين",
      type: "radio",
      required: true,
      options: [
        { value: "expected", label: OPTION_LABELS.expected },
        { value: "doubtful", label: OPTION_LABELS.doubtful },
        { value: "hopeless", label: OPTION_LABELS.hopeless }
      ],
      validation: [{ type: "required" }],
      helpText: "اختر حالة الدين لتحديد حكم الزكاة"
    }
  ],
  nisabRules: {
    type: "value",
    threshold: 0, // Will be set dynamically
    unit: "درهم"
  },
  zakatRates: {
    lunar: CONFIG_VALUES.RATE_LUNAR,
    solar: CONFIG_VALUES.RATE_SOLAR
  }
};

// Export all category configurations
export const CATEGORY_CONFIGS: Record<ZakatCategory, CategoryConfig> = {
  grains: GRAINS_CONFIG,
  livestock: LIVESTOCK_CONFIG,
  cash: CASH_CONFIG,
  commerce: COMMERCE_CONFIG,
  services: SERVICES_CONFIG,
  agriculture: AGRICULTURE_CONFIG,
  debts: DEBTS_CONFIG
};

// Helper function to get configuration by category
export function getCategoryConfig(category: ZakatCategory): CategoryConfig {
  return CATEGORY_CONFIGS[category];
}

// Helper function to get all available categories
export function getAvailableCategories(): Array<{ value: ZakatCategory; label: string }> {
  return Object.entries(CATEGORY_CONFIGS).map(([value, config]) => ({
    value: value as ZakatCategory,
    label: config.title
  }));
}
