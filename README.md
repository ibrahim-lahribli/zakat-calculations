# Zakat Calculations Package

A reusable, TypeScript-based library for calculating Islamic zakat (alms) across multiple categories according to the Maliki school of Islamic jurisprudence. Designed for seamless integration into both web and mobile applications.

## Features

- **7 Zakat Categories**: Grains, Livestock, Agriculture, Commerce, Services, Cash, and Debts
- **Accurate Calculations**: Based on authentic Islamic rulings (Maliki school)
- **Flexible Year Tracking**: Support for both Lunar (Hijri) and Solar (Gregorian) calendar years
- **Comprehensive Breakdown**: Detailed calculation breakdown for transparency
- **TypeScript Support**: Full type definitions for type safety
- **Well-Tested**: Extensive unit tests covering all calculation branches and edge cases
- **Zero Dependencies**: Pure TypeScript with no runtime dependencies

## Installation

```bash
npm install zakat-calculations
# or
pnpm add zakat-calculations
# or
yarn add zakat-calculations
```

## Quick Start

```typescript
import { calculateZakat, ZakatCalculationInput } from 'zakat-calculations';

const input: ZakatCalculationInput = {
  category: 'cash',
  wizardData: {
    cashAmount: 2000,
    goldGrams: 0,
    silverGrams: 0,
    immediateDebts: 0,
  },
  isSolarYear: false,
  nisabGold: 3000,  // Current gold nisab in local currency
  nisabSilver: 1500, // Current silver nisab in local currency
};

const result = calculateZakat(input);
console.log(`Zakat Amount: ${result.zakatAmount}`);
console.log(`Meets Nisab: ${result.meetsNisab}`);
console.log('Breakdown:', result.breakdown);
```

## API Documentation

### Types

#### `ZakatCategory`

Available zakat categories:
- `grains` - Agricultural grains and dates
- `livestock` - Camels, cows, sheep/goats
- `agriculture` - Other agricultural products, forests, hunting
- `commerce` - Trade and industry goods
- `services` - Services and wages income
- `cash` - Cash, gold, and silver
- `debts` - Receivable and payable debts

#### `ZakatCalculationInput`

Configuration object for zakat calculations:

```typescript
interface ZakatCalculationInput {
  category: ZakatCategory;           // The zakat category
  wizardData: Record<string, any>;    // Category-specific data
  isSolarYear: boolean;              // Use solar year rate (2.432%) vs lunar (2.5%)
  nisabGold: number;                 // Gold nisab value in local currency
  nisabSilver: number;               // Silver nisab value in local currency
  showNisabGold?: boolean;           // Use gold nisab instead of silver (default: false)
}
```

#### `ZakatCalculationResult`

Result object from zakat calculation:

```typescript
interface ZakatCalculationResult {
  zakatAmount: number;               // Calculated zakat amount
  breakdown: {                        // Detailed calculation breakdown
    label: string;
    value: number | string;
  }[];
  meetsNisab: boolean;               // Whether zakat is obligatory
  zakatInKind: string;               // Description of zakat in kind (e.g., "1 شاة")
}
```

### Functions

#### `calculateZakat(input: ZakatCalculationInput): ZakatCalculationResult`

Main function that calculates zakat based on the provided input.

```typescript
const result = calculateZakat(input);
```

#### `getCamelZakat(count: number): string | null`

Returns the zakat obligation for a specific number of camels.

```typescript
const zakat = getCamelZakat(25);  // Returns "1 بنت مخاض"
```

#### `getCowZakat(count: number): string | null`

Returns the zakat obligation for a specific number of cows.

```typescript
const zakat = getCowZakat(40);  // Returns "مسنة"
```

#### `getSheepZakat(count: number): string | null`

Returns the zakat obligation for a specific number of sheep/goats.

```typescript
const zakat = getSheepZakat(100);  // Returns "1 شاة"
```

## Usage Examples

### Cash Category

Calculate zakat on liquid assets including gold and silver:

```typescript
const input: ZakatCalculationInput = {
  category: 'cash',
  wizardData: {
    cashAmount: 5000,      // MAD or local currency
    goldGrams: 10,         // Grams of gold
    silverGrams: 200,      // Grams of silver
    immediateDebts: 1000,  // Debts to deduct
    priceGold: 800,        // Price per gram
    priceSilver: 12,       // Price per gram
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// Total assets: 5000 + (10 * 800) + (200 * 12) = 9400
// Net after debts: 9400 - 1000 = 8400
// Zakat (2.5%): 8400 * 0.025 = 210
```

### Livestock Category

Calculate zakat on livestock:

```typescript
const input: ZakatCalculationInput = {
  category: 'livestock',
  wizardData: {
    livestockType: 'sheep',    // 'camels', 'cows', or 'sheep'
    count: 150,
    paymentMethod: 'inkind',   // 'inkind' or 'cash'
    pricePerHead: 500,         // Only needed for cash payment
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// For 150 sheep: 2 شياه (2 sheep)
```

### Grains Category

Calculate zakat on agricultural grains:

```typescript
const input: ZakatCalculationInput = {
  category: 'grains',
  wizardData: {
    quantity: 1000,              // In kg
    irrigation: 'rain',          // 'rain' (10%) or 'artificial' (5%)
    purpose: 'personal',         // 'personal' or 'trade'
    marketValue: 5000,           // Required if purpose is 'trade'
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// Rain-irrigated: 1000 * 10% = 100 kg zakat in kind
// Market value-based: 5000 * 2.5% = 125 MAD
```

### Commerce Category

Calculate zakat on commercial inventory:

```typescript
const input: ZakatCalculationInput = {
  category: 'commerce',
  wizardData: {
    inventory: 10000,       // Stock value
    receivables: 3000,      // Money owed to you
    liabilities: 2000,      // Debts and obligations
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// Net assets: 10000 + 3000 - 2000 = 11000
// Zakat (2.5%): 11000 * 0.025 = 275 MAD
```

### Services Category

Calculate zakat on employment income:

```typescript
const input: ZakatCalculationInput = {
  category: 'services',
  wizardData: {
    annualIncome: 60000,         // Annual salary/income
    customExpenses: 0,           // Leave 0 for default calculation
    // Default living expenses: 39,192 MAD
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// Surplus: 60000 - 39192 = 20808
// Zakat (2.5%): 20808 * 0.025 = 520.20 MAD
```

### Debts Category

Calculate zakat on receivable and payable debts:

```typescript
const input: ZakatCalculationInput = {
  category: 'debts',
  wizardData: {
    debtType: 'receivable',      // 'receivable' or 'payable'
    debtAmount: 2000,
    debtStatus: 'received',      // For receivable: 'expected', 'doubtful', 'hopeless', 'received'
  },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500,
};

const result = calculateZakat(input);
// For received debts: 2000 * 2.5% = 50 MAD
// For hopeless debts: 0 (no zakat until recovered)
```

## Nisab Values

The nisab is the minimum wealth threshold above which zakat becomes obligatory. It's based on the current market value of gold or silver.

**Common Nisab Calculations:**
- **Gold Nisab**: ~4.25 grams × current gold price
- **Silver Nisab**: ~150 grams × current silver price

**Example (Current Rates):**
- Gold: 4.25 grams @ 800 MAD/gram = 3,400 MAD
- Silver: 150 grams @ 12 MAD/gram = 1,800 MAD

The package allows switching between gold and silver nisab via the `showNisabGold` parameter.

## Year Types

### Lunar (Hijri) Year
- **Rate**: 2.5% (1/40)
- **Usage**: Traditional Islamic calendar year
- **Set**: `isSolarYear: false`

### Solar (Gregorian) Year
- **Rate**: 2.432% (adjusted for 365-day year)
- **Usage**: Calendar/financial year
- **Set**: `isSolarYear: true`

## Development

### Scripts

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Running Tests

The package includes comprehensive unit tests covering:
- All calculation categories
- Edge cases and boundary conditions
- Solar vs lunar year rate calculations
- Nisab thresholds
- Complex scenarios with multiple asset types

```bash
npm test
```

## Project Structure

```
zakat-calculations/
├── calculations.ts          # Core calculation logic
├── types.ts                # TypeScript type definitions
├── index.ts                # Public API exports
├── __tests__/
│   └── calculations.test.ts # Comprehensive test suite
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest testing configuration
├── package.json            # Package metadata
└── README.md               # This file
```

## Publishing to NPM

### Prerequisites

1. Create an NPM account at [npmjs.com](https://npmjs.com)
2. Verify your email
3. Enable two-factor authentication (recommended)

### Setup

```bash
# Login to NPM
npm login

# Verify login
npm whoami
```

### Publishing

```bash
# Ensure everything is built and tested
npm run build
npm test

# Bump version (patch, minor, or major)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Publish
npm publish
```

### Automated Publishing with CI/CD

For GitHub Actions or similar CI/CD systems:

```yaml
- name: Publish to NPM
  run: |
    npm ci
    npm run build
    npm test
    npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Steps:**
1. Generate NPM token in account settings
2. Add token as `NPM_TOKEN` secret in repository
3. Configure workflow to publish on version tag/release

### Publishing Configuration

Current `package.json` settings:
- **Main**: `dist/index.js` - CJS entry point
- **Types**: `dist/index.d.ts` - TypeScript definitions
- **Files**: `["dist"]` - Only distribute built files

## Common Issues & Troubleshooting

### "Zakat amount is 0 but meetsNisab is true"
This occurs when zakat is calculated in-kind (livestock, grains). Check `zakatInKind` property for the result.

### Incorrect nisab values
Ensure `nisabGold` and `nisabSilver` are updated with current market prices. These should reflect the local currency equivalent of gold/silver prices.

### Solar year rate differences
Solar year rate (2.432%) is slightly lower than lunar (2.5%) due to the 365-day year. Results will differ by ~2.7% between the two.

## Islamic References

- **School**: Maliki school of Islamic jurisprudence
- **Nisab**: Based on gold and silver standards
- **Rates**: 
  - Lunar year (Hijri): 2.5% (1/40)
  - Solar year (Gregorian): 2.432%
- **Categories**: Following contemporary Islamic finance practices

## License

MIT

## Support

For issues, questions, or contributions, please visit the [project repository](https://github.com/yourusername/zakat-calculations).

## Changelog

### v0.1.0 (Initial Release)
- Core zakat calculation logic
- Support for 7 zakat categories
- Full TypeScript support
- Comprehensive test coverage
- Development scripts (build, watch, test)
- Documentation and examples
