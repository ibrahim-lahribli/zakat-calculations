/**
 * Method for calculating Nisab
 */
export type NisabMethod = "silver" | "gold";

/**
 * Irrigation method for crops
 */
export type IrrigationMethod = "rain" | "artificial";

/**
 * Main input interface for Zakat calculation
 */
export interface ZakatInput {
  /** Method to use for Nisab calculation (default: silver) */
  nisabMethod?: NisabMethod;
  /** Silver price per gram (optional, uses fallback if not provided) */
  silverPricePerGram?: number;
  /** Gold price per gram (optional, uses fallback if not provided) */
  goldPricePerGram?: number;
  /** Manual override for Nisab amount */
  nisabOverride?: number;
  /** Salary and income information */
  salary?: SalaryInput;
  /** Trade and business information */
  trade?: TradeInput;
  /** Industry and manufacturing information */
  industry?: IndustryInput;
  /** Agricultural crops information */
  crops?: CropsInput;
  /** Livestock information */
  livestock?: LivestockInput;
  /** Agriculture products (non-crops) information */
  agricultureProducts?: AgricultureProductsInput;
  /** Minerals and natural resources (الثروة المعدنية) */
  minerals?: MineralsInput;
}

/**
 * Salary and service income input
 *
 * Per the fatwa, the expense deduction is the fixed SMIG standard (3,266 MAD/month).
 * The council mandated this fixed amount to prevent subjective personal expense claims.
 * Only monthlyIncome is required; expenses are handled internally using the fixed SMIG.
 */
export interface SalaryInput {
  /** Monthly income amount */
  monthlyIncome: number;
}

/**
 * Trade and business input
 */
export interface TradeInput {
  /** Value of inventory and goods */
  inventoryValue: number;
  /** Cash on hand and in bank */
  cash: number;
  /** Receivables (money owed to you by someone who will pay) */
  receivables: number;
  /** Doubtful receivables (money you might not receive - excluded from current Zakat) */
  doubtfulReceivables?: number;
  /** Liabilities and debts owed */
  liabilities: number;
  /** Expenses due and payable */
  expensesDue: number;
}

/**
 * Industry and manufacturing input
 */
export interface IndustryInput {
  /** Value of inventory and finished goods */
  inventoryValue: number;
  /** Cash on hand and in bank */
  cash: number;
  /** Receivables (money owed to you by someone who will pay) */
  receivables: number;
  /** Doubtful receivables (money you might not receive - excluded from current Zakat) */
  doubtfulReceivables?: number;
  /** Liabilities and debts owed */
  liabilities: number;
  /** Production costs */
  productionCosts: number;
  /** Salaries due to employees */
  salariesDue: number;
  /** Rent due for premises */
  rentDue: number;
  /** Taxes due to government */
  taxesDue: number;
}

/**
 * Agricultural crops input
 */
export interface CropsInput {
  /** Harvest amount in kilograms */
  harvestKg: number;
  /** Irrigation method used */
  irrigationMethod: IrrigationMethod;
  /** Whether crops are sold commercially (treated as trade if true) */
  soldCommercially?: boolean;
  /** Market value per kg if sold commercially */
  marketValuePerKg?: number;
}

/**
 * Livestock input
 */
export interface LivestockInput {
  /** Number of sheep */
  sheep?: number;
  /** Number of goats */
  goats?: number;
  /** Number of cattle */
  cattle?: number;
  /** Number of camels */
  camels?: number;
  /** Optional market price per animal for monetary conversion */
  marketPricePerSheep?: number;
  marketPricePerGoat?: number;
  marketPricePerCattle?: number;
  marketPricePerCamel?: number;
  marketPricePerCalf?: number;
}

/**
 * Agriculture products (non-crops) input
 */
export interface AgricultureProductsInput {
  /** Total revenue from products */
  revenue: number;
  /** Total costs incurred */
  costs: number;
}

/**
 * Minerals and natural resources input (الثروة المعدنية)
 *
 * Per the fatwa: "تجب فيها الزكاة بمجرد استخراجها، ويمكن تأخيرها على ألا يتعدى التأخير عاما"
 * (Zakat is due upon extraction; can be deferred but not beyond one year.)
 * Rate: 2.5% on net value (extracted value minus extraction costs), same as trade goods.
 */
export interface MineralsInput {
  /** Total market value of extracted minerals */
  extractedValue: number;
  /** Extraction and processing costs to deduct */
  extractionCosts: number;
}

/**
 * Zakat calculation result for a single category
 */
export interface CategoryZakatResult {
  /** Monetary amount of Zakat payable for this category (in MAD or applicable currency) */
  zakatAmount: number;
  /** Whether Zakat is applicable (wealth >= nisab) */
  isApplicable: boolean;
  /** Net wealth amount used for calculation */
  netWealth: number;
  /**
   * Physical zakat amount in kg — only set for non-commercial crops zakat paid in kind.
   * When this is present and zakatAmount is 0, zakat is due in physical crop units,
   * not monetary form. Provide marketValuePerKg to get a monetary zakatAmount instead.
   */
  zakatAmountKg?: number;
}

/**
 * Complete Zakat calculation breakdown
 */
export interface ZakatCalculationResult {
  /** Calculated Nisab amount */
  nisab: number;
  /** Zakat breakdown per category */
  breakdown: {
    salary?: CategoryZakatResult;
    trade?: CategoryZakatResult;
    industry?: CategoryZakatResult;
    crops?: CategoryZakatResult;
    livestock?: CategoryZakatResult;
    agricultureProducts?: CategoryZakatResult;
    minerals?: CategoryZakatResult;
  };
  /** Total monetary Zakat amount across all categories */
  totalZakat: number;
  /** Total wealth across all categories */
  totalWealth: number;
  /** Whether any Zakat is payable */
  hasZakatDue: boolean;
}
