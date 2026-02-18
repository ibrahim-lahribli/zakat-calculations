# Zakat Engine Usage Examples

This guide provides practical usage examples for the `zakat-engine` package based on the rulings of the Moroccan High Scientific Council Fatwa.

The engine is currency-agnostic. All values must be provided in the same currency. The examples below use Moroccan Dirham (MAD) for realism, but any currency can be used.

## 1. Global Setup & Nisab
The engine uses Silver as the default reference for Nisab (595g). You should provide current market prices.

```typescript
import { calculateTotalZakat } from 'zakat-engine';

const baseInput = {
  silverPricePerGram: 12.5, // Current market price
  nisabMethod: 'silver'     // Default
};
```

## 2. Salary & Services (Sector 8)
**Scenario:** An employee with a monthly salary of 12,000 MAD and 5,000 MAD in personal expenses.
*Note: The engine automatically deducts the SMIG (3266 MAD) if reported expenses are lower.*

```typescript
const salaryResult = calculateTotalZakat({
  ...baseInput,
  salary: {
    monthlyIncome: 12000,
    monthlyExpenses: 5000 // Total deduction will be 5,000 as it's > SMIG
  }
});

// Result breakdown:
// Annual savings: (12000 - 5000) * 12 = 84,000
// Zakat: 84,000 * 2.5% = 2,100 MAD
```

## 3. Trade & Business (Sector 6)
**Scenario:** A shop owner with inventory, cash, and receivables.

```typescript
const tradeResult = calculateTotalZakat({
  ...baseInput,
  trade: {
    inventoryValue: 50000,
    cash: 15000,
    receivables: 5000,    // Money owed to the shop (collectible)
    liabilities: 10000,   // Debts owed to suppliers
    expensesDue: 2000     // Rent/Salaries due
  }
});
```

## 4. Livestock (Mashiyah)
The engine implements the specific tables for Maliki Fiqh. Animal zakat is returned as monetary value when market prices are provided.

### A. Sheep & Goats (Nisab: 40)
```typescript
const livestockSheep = calculateTotalZakat({
  ...baseInput,
  livestock: {
    sheep: 150, // Due: 2 Sheep
    marketPricePerSheep: 2000 
  }
});
```

### B. Cattle (Nisab: 30)
```typescript
const livestockCattle = calculateTotalZakat({
  ...baseInput,
  livestock: {
    cattle: 70, // Combination: 1 Cow (Musinnah) + 1 Calf (Tari)
    marketPricePerCattle: 8000,
    marketPricePerCalf: 4000
  }
});
```

### C. Camels (Nisab: 5)
```typescript
const livestockCamels = calculateTotalZakat({
  ...baseInput,
  livestock: {
    camels: 130, // Optimized combination based on Maliki tables
    marketPricePerCamel: 15000
  }
});
```

## 5. Multiple Categories (Real World Scenario)
**Scenario:** A person with a salary, a small side business, and some sheep.

```typescript
const personWealth = calculateTotalZakat({
  ...baseInput,
  salary: {
    monthlyIncome: 15000,
    monthlyExpenses: 8000
  },
  trade: {
    inventoryValue: 20000,
    cash: 5000,
    receivables: 2000,
    liabilities: 3000,
    expensesDue: 1000
  },
  livestock: {
    sheep: 45,
    marketPricePerSheep: 2000
  }
});

console.log(personWealth.totalZakat); // Sum of all due zakat in MAD
```

## 6. Understanding the Output
The `calculateTotalZakat` function returns a complete object describing the state of wealth.

```typescript
const result = calculateTotalZakat(input);

console.log(result);
/*
{
  nisab: 7437.5,           // The calculated threshold used
  totalZakat: 2500,        // Total amount to pay
  totalWealth: 100000,     // Total net wealth across all sectors
  hasZakatDue: true,       // Convenience flag
  breakdown: {             // Sector-by-sector details
    salary: { zakatAmount: 1200, isApplicable: true, netWealth: 48000 },
    trade: { ... },
    ...
  }
}
*/
```
