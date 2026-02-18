# Zakat Engine

A framework-agnostic Zakat calculation engine for modern economic sectors according to Maliki fiqh rules. This pure TypeScript library provides comprehensive Zakat calculations for various wealth categories while maintaining strict offline capability.

> **Note on Currency:** The engine is currency-agnostic. All input values (monetary assets, expenses, metal prices) must use the same currency. While default fallback prices are in Moroccan Dirham (MAD), you can use any currency (USD, EUR, SAR, etc.) by providing your own market prices.

## Features

- 🕌 **Maliki Fiqh Compliant**: Implements Zakat rules according to Maliki school of thought
- 🔧 **Framework Agnostic**: Works with React Native, web apps, Node.js, and APIs
- 📱 **Offline First**: No external dependencies or network requests
- 🎯 **TypeScript First**: Full type safety with comprehensive interfaces
- 🧪 **Well Tested**: Comprehensive test suite with high coverage
- 📦 **Zero Dependencies**: Pure business logic with no runtime dependencies

## Installation

```bash
npm install zakat-engine
# or
yarn add zakat-engine
# or
pnpm add zakat-engine
```

## Quick Start

```typescript
import { calculateTotalZakat } from 'zakat-engine';

// Basic salary calculation
const result = calculateTotalZakat({
  salary: {
    monthlyIncome: 5000
  }
});

console.log(result);
// {
//   nisab: 7140,
//   breakdown: { salary: { zakatAmount: 205.2, isApplicable: true, netWealth: 20208 } },
//   totalZakat: 205.2,
//   totalWealth: 20208,
//   hasZakatDue: true
// }
```

## API Reference

### Main Function

#### `calculateTotalZakat(input: ZakatInput): ZakatCalculationResult`

Calculates total Zakat across all provided categories.

### Input Types

#### `ZakatInput`

```typescript
interface ZakatInput {
  nisabMethod?: "silver" | "gold";           // Default: "silver"
  silverPricePerGram?: number;               // Optional, uses fallback if not provided
  goldPricePerGram?: number;                 // Optional, uses fallback if not provided
  nisabOverride?: number;                    // Manual nisab override

  salary?: SalaryInput;                      // Salary and service income
  trade?: TradeInput;                        // Trade and business
  industry?: IndustryInput;                  // Industry and manufacturing
  crops?: CropsInput;                        // Agricultural crops
  livestock?: LivestockInput;                // Livestock animals
  agricultureProducts?: AgricultureProductsInput; // Non-crop agriculture
  minerals?: MineralsInput;                  // Minerals and natural resources
}
```

#### Category Inputs

**Salary/Services:**
```typescript
interface SalaryInput {
  monthlyIncome: number;
  // Note: expenses are NOT provided by the user.
  // The engine always deducts the fixed SMIG (3,266 MAD/month) per the fatwa.
}
```

**Trade/Business:**
```typescript
interface TradeInput {
  inventoryValue: number;
  cash: number;
  receivables: number;
  liabilities: number;
  expensesDue: number;
}
```

**Industry/Manufacturing:**
```typescript
interface IndustryInput {
  inventoryValue: number;
  cash: number;
  receivables: number;
  liabilities: number;
  productionCosts: number;
  salariesDue: number;
  rentDue: number;
  taxesDue: number;
}
```

**Agricultural Crops:**
```typescript
interface CropsInput {
  harvestKg: number;
  irrigationMethod: "rain" | "artificial";
  soldCommercially?: boolean;
  marketValuePerKg?: number;
}
```

**Livestock:**
```typescript
interface LivestockInput {
  sheep?: number;
  goats?: number;
  cattle?: number;
  camels?: number;
  marketPricePerSheep?: number;
  marketPricePerGoat?: number;
  marketPricePerCattle?: number;
  marketPricePerCamel?: number;
  marketPricePerCalf?: number;  // Required for cattle cash calculation
}
```

**Agriculture Products:**
```typescript
interface AgricultureProductsInput {
  revenue: number;
  costs: number;
}
```

**Minerals / Natural Resources:**
```typescript
interface MineralsInput {
  extractedValue: number;   // Total market value of extracted minerals
  extractionCosts: number;  // Extraction and processing costs to deduct
}
```

### Output Type

#### `ZakatCalculationResult`

```typescript
interface ZakatCalculationResult {
  nisab: number;                           // Calculated nisab threshold
  breakdown: {                             // Per-category breakdown
    salary?: CategoryZakatResult;
    trade?: CategoryZakatResult;
    industry?: CategoryZakatResult;
    crops?: CategoryZakatResult;
    livestock?: CategoryZakatResult;
    agricultureProducts?: CategoryZakatResult;
    minerals?: CategoryZakatResult;
  };
  totalZakat: number;                      // Total Zakat due
  totalWealth: number;                     // Total wealth across categories
  hasZakatDue: boolean;                    // Whether any Zakat is payable
}
```

## Examples

### Example 1: Salary Only

```typescript
const result = calculateTotalZakat({
  salary: {
    monthlyIncome: 5000
  }
});

// Fixed SMIG deduction: 3,266 MAD/month × 12 = 39,192 MAD/year
// Annual savings: 5,000 × 12 − 39,192 = 20,808 MAD
// Zakat: 20,808 × 2.5% = 520.2 MAD
```

### Example 2: Business Owner

```typescript
const result = calculateTotalZakat({
  trade: {
    inventoryValue: 50000,
    cash: 20000,
    receivables: 15000,
    liabilities: 10000,
    expensesDue: 5000
  },
  salary: {
    monthlyIncome: 8000
  }
});

// Trade: (50,000 + 20,000 + 15,000) − (10,000 + 5,000) = 70,000 MAD
// Salary: 8,000 × 12 − 39,192 = 56,808 MAD
// Total Zakat: (70,000 + 56,808) × 2.5% = 3,170.2 MAD
```

### Example 3: Farmer with Crops and Livestock

```typescript
const result = calculateTotalZakat({
  crops: {
    harvestKg: 1000,
    irrigationMethod: 'rain'
  },
  livestock: {
    sheep: 50,
    marketPricePerSheep: 150
  }
});

// Crops: 1,000 kg harvested, rain-fed irrigation
// Physical Zakat due: 100 kg of produce (10% of harvest)
// (Provide marketValuePerKg to get a monetary amount instead)
// Livestock: 40–120 sheep range → 1 sheep due
// Monetary value: 1 × 150 = 150 MAD
```

### Example 4: Custom Metal Prices

```typescript
const result = calculateTotalZakat({
  nisabMethod: 'gold',
  goldPricePerGram: 950,  // Current market price in MAD
  trade: {
    inventoryValue: 100000,
    cash: 50000,
    receivables: 30000,
    liabilities: 20000,
    expensesDue: 10000
  }
});

// Nisab: 950 MAD × 85 g = 80,750 MAD
// Net assets: 150,000 MAD
// Zakat: 150,000 × 2.5% = 3,750 MAD
```

### Example 5: Minerals / Natural Resources

```typescript
const result = calculateTotalZakat({
  minerals: {
    extractedValue: 100000,  // Market value of extracted minerals
    extractionCosts: 40000   // Costs of extraction and processing
  }
});

// Net value: 100,000 − 40,000 = 60,000 MAD
// Zakat due upon extraction (no hawl required per fatwa)
// Zakat: 60,000 × 2.5% = 1,500 MAD
```

## Nisab Calculation

The engine follows this priority order for Nisab calculation:

1. **Manual Override**: If `nisabOverride` is provided, use it directly
2. **Gold Method**: If `nisabMethod` is "gold", use `goldPricePerGram * 85g`
3. **Silver Method** (Default): Use `silverPricePerGram * 595g`

### Default Fallback Prices

If no metal prices are provided:

- **Silver**: 12 MAD per gram
- **Gold**: 800 MAD per gram

These are conservative estimates based on fatwa recommendations and are expressed in Moroccan Dirham (MAD), the currency referenced in the source religious ruling.

## Zakat Rates

| Category | Rate | Conditions |
|----------|------|------------|
| Standard Wealth | 2.5% | When wealth ≥ nisab |
| Rain-fed Crops | 10% | Harvest ≥ 653 kg |
| Irrigated Crops | 5% | Harvest ≥ 653 kg |
| Minerals | 2.5% | Net value ≥ nisab, due upon extraction |

## Minimum Living Expense Rule (SMIG)

Based on the Moroccan High Scientific Council Fatwa, when calculating Zakat on salaries and services, the engine always deducts the fixed SMIG standard before assessing Zakat.

- **Rule:** The engine **always** deducts the official minimum wage (SMIG = **3,266 MAD/month**, i.e. **39,192 MAD/year**) from annual income, regardless of the individual's actual spending.
- **Purpose:** The council deliberately chose a fixed amount to prevent subjective personal expense claims:
  > *"ترك النفقات بدون تحديد... من شأنه ترك المجال للتقديرات الشخصية"*
  > ("Leaving expenses without a defined limit… opens the door to personal estimates.")
- **Fatwa example:** 10,000 MAD/month → 120,000 − 39,192 = **80,808 MAD** → Zakat = **2,020.2 MAD**

This value is defined as `MINIMUM_LIVING_EXPENSE_MAD` in the constants.

## Debt Handling

### Critical Fiqh Principle

According to Maliki fiqh and the source fatwa, **debts owed BY the user must be deducted from zakatable wealth**. This is a fundamental principle that significantly impacts Zakat calculations:

> "Deduct all debts and liabilities that you owe to others from your total wealth before calculating Zakat."

### How Debts Are Handled

The engine automatically deducts debts in the following categories:

#### **Trade/Business**
```typescript
interface TradeInput {
  // ... assets
  liabilities: number;        // All business debts owed
  expensesDue: number;        // Immediate payable expenses
}
```

#### **Industry/Manufacturing**
```typescript
interface IndustryInput {
  // ... assets
  liabilities: number;        // General business debts
  productionCosts: number;   // Costs owed for production
  salariesDue: number;        // Employee salaries owed
  rentDue: number;           // Rent owed for premises
  taxesDue: number;          // Taxes owed to government
}
```

#### **Net Assets Calculation**
The engine uses this formula for debt deduction:

```typescript
netAssets = totalAssets - totalLiabilities - immediateExpenses
```

Only if `netAssets ≥ nisab` is Zakat calculated (2.5% of netAssets).

### Examples

#### **Example 1: Business with Debts**
```typescript
const result = calculateTotalZakat({
  trade: {
    inventoryValue: 100000,  // Assets
    cash: 30000,
    receivables: 20000,
    liabilities: 40000,      // Debts owed
    expensesDue: 10000       // Immediate expenses
  }
});

// Total assets: 150,000 MAD
// Total deductions: 50,000 MAD
// Net assets: 100,000 MAD
// Zakat: 100,000 * 2.5% = 2,500 MAD
```

#### **Example 2: No Zakat Due After Debts**
```typescript
const result = calculateTotalZakat({
  trade: {
    inventoryValue: 20000,
    cash: 5000,
    receivables: 3000,
    liabilities: 18000,      // High debt burden
    expensesDue: 8000
  }
});

// Total assets: 28,000 MAD
// Total deductions: 26,000 MAD
// Net assets: 2,000 MAD (below nisab)
// Zakat: 0 MAD
```

### Important Notes

1. **All Debts Count**: Include personal loans, business loans, credit card debts, and any money you owe
2. **Immediate Expenses**: Rent due, utilities, salaries payable are also deducted
3. **Long-term vs Short-term**: Both types of debts are deducted before Zakat calculation
4. **Documentation**: Keep proper records of all debts for accurate calculation

This debt-first approach ensures Zakat is calculated only on genuinely available wealth, aligning with the principle of paying Zakat from surplus wealth after meeting all obligations.

## Validation

The library includes built-in validation:

```typescript
import { validateZakatInput } from 'zakat-engine';

try {
  validateZakatInput(input);
  // Input is valid
} catch (error) {
  // Handle validation error
  console.error(error.message);
}
```

## Individual Category Calculators

You can also calculate Zakat for individual categories:

```typescript
import { 
  calculateSalaryZakat,
  calculateTradeZakat,
  calculateCropsZakat,
  calculateNisab
} from 'zakat-engine';

const nisab = calculateNisab({ nisabMethod: 'silver' });
const salaryZakat = calculateSalaryZakat(
  { monthlyIncome: 5000 },
  nisab
);
```

## Constants

Access built-in constants:

```typescript
import {
  DEFAULT_SILVER_PRICE,
  DEFAULT_GOLD_PRICE,
  SILVER_NISAB_GRAMS,
  GOLD_NISAB_GRAMS,
  STANDARD_ZAKAT_RATE,
  MINIMUM_LIVING_EXPENSE_MAD
} from 'zakat-engine';
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint
```

## Religious Disclaimer

This library implements Zakat calculation rules according to the Maliki school of Islamic jurisprudence. The calculations provided are for informational purposes only and should not be considered as religious advice (fatwa). Users should consult with qualified Islamic scholars for personal Zakat guidance, especially for complex financial situations.

The library authors make no guarantees about the accuracy or completeness of the calculations and are not responsible for any decisions made based on the results.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure:

1. All code follows TypeScript strict mode
2. New features include comprehensive tests
3. Documentation is updated
4. Changes align with Maliki fiqh principles

## Support

For issues, questions, or contributions, please visit the GitHub repository.
