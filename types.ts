// Types for zakat calculation logic
export type ZakatCategory =
  | "grains" // الحبوب والثمار
  | "livestock" // الماشية
  | "agriculture" // منتجات فلاحية أخرى + غابات + صيد
  | "commerce" // التجارة والصناعة
  | "services" // الخدمات والأجور
  | "cash" // النقود والذهب والفضة
  | "debts"; // الديون

export interface ZakatCalculationInput {
  category: ZakatCategory;
  wizardData: Record<string, number | string>;
  isSolarYear: boolean;
  nisabGold: number;
  nisabSilver: number;
  showNisabGold?: boolean;
}

export interface ZakatCalculationResult {
  zakatAmount: number;
  breakdown: { label: string; value: number | string }[];
  meetsNisab: boolean;
  zakatInKind: string;
}
