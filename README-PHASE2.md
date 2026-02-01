# Zakat Calculations v2.0 - Phase 2 Architecture

## Overview

Version 2.0 introduces a **configuration-driven, real-time validation system** that enables dynamic form generation and enhanced user experience for zakat calculations. This architecture maintains backward compatibility with Phase 1 while providing powerful new features for modern web and mobile applications.

## 🚀 Key Features

### 🎯 Configuration-Driven Forms
- **Dynamic field generation** from JSON configuration
- **Conditional field visibility** based on user selections
- **Real-time validation** with contextual error messages
- **Multi-language support** with Arabic-first design

### ✅ Smart Validation Engine
- **Field-level validation** with custom rules
- **Conditional validation** logic
- **Real-time feedback** as users type
- **Dependency-aware** validation

### 🔄 Flexible Architecture
- **Extensible calculator classes** for each zakat category
- **Pluggable validation rules**
- **Metadata-rich results** with calculation context
- **Backward compatibility** with existing Phase 1 code

## 📋 Architecture Components

### 1. Enhanced Types (`types.ts`)

```typescript
// Form field configuration
interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  dependsOn?: FieldDependency;
  helpText?: string;
}

// Validation rules
type ValidationRule = 
  | { type: "required" }
  | { type: "min"; value: number }
  | { type: "max"; value: number }
  | { type: "conditional"; condition: FieldCondition; rule: ValidationRule };

// Enhanced calculation results
interface EnhancedCalculationResult extends ZakatCalculationResult {
  validation: ValidationResult;
  metadata: {
    calculationTime: number;
    configVersion: string;
    fatwaCompliance: boolean;
    [key: string]: any;
  };
}
```

### 2. Configuration System (`config.ts`)

```typescript
// Example: Grains configuration
export const GRAINS_CONFIG: CategoryConfig = {
  category: "grains",
  title: "زكاة الحبوب والثمار",
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
      ]
    },
    {
      name: "purpose",
      label: "الغرض من المحصول",
      type: "radio",
      required: true,
      options: [
        { value: "personal", label: "استهلاك شخصي" },
        { value: "trade", label: "تجارة وبيع" }
      ]
    },
    {
      name: "marketValue",
      label: "القيمة السوقية (للتجارة)",
      type: "number",
      required: false,
      dependsOn: { field: "purpose", value: "trade" },
      validation: [
        { 
          type: "conditional", 
          condition: { field: "purpose", operator: "equals", value: "trade" },
          rule: { type: "required" }
        }
      ]
    }
  ]
};
```

### 3. Validation Engine (`validation.ts`)

```typescript
// Real-time validation
const validator = new FormValidator();

// Validate single field
const fieldResult = validator.validateField(field, value, formData);

// Validate entire form
const formResult = validator.validateForm(fields, formData);

// Real-time change validation
const changeResult = validator.validateOnChange(fields, formData, changedField);
```

### 4. Enhanced Calculator Base (`calculator.ts`)

```typescript
export abstract class ZakatCalculator {
  // Main calculation with validation
  calculate(formData: FormData, context: FormContext): EnhancedCalculationResult;
  
  // Validation methods
  validate(formData: FormData): ValidationResult;
  validateField(fieldName: string, value: any, formData: FormData): ValidationResult;
  
  // Field visibility
  isFieldVisible(fieldName: string, formData: FormData): boolean;
  getVisibleFields(formData: FormData): FormField[];
  
  // Abstract calculation logic
  protected abstract performCalculation(formData: FormData, context: FormContext): ZakatCalculationResult;
}
```

## 🎨 UI Implementation Example

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { grainsCalculator, formValidator } from 'zakat-calculations';
import { GRAINS_CONFIG } from 'zakat-calculations/config';

function ZakatGrainsForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  // Get visible fields based on current form data
  const visibleFields = formValidator.getVisibleFields(GRAINS_CONFIG.fields, formData);

  // Handle field changes with real-time validation
  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    // Real-time validation
    const fieldError = grainsCalculator.getFieldError(fieldName, newFormData);
    setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
  };

  // Calculate zakat
  const handleCalculate = () => {
    const context = {
      isSolarYear: false,
      nisabGold: 3000,
      nisabSilver: 1500,
      showNisabGold: false
    };
    
    const calculationResult = grainsCalculator.calculate(newFormData, context);
    setResult(calculationResult);
  };

  return (
    <div>
      <h2>{GRAINS_CONFIG.title}</h2>
      <p>{GRAINS_CONFIG.description}</p>
      
      {visibleFields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {field.type === 'number' && (
            <input
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
          {field.type === 'radio' && (
            <div>
              {field.options.map(option => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={formData[field.name] === option.value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
          {errors[field.name] && (
            <span className="error">{errors[field.name]}</span>
          )}
          {field.helpText && (
            <span className="help">❓ {field.helpText}</span>
          )}
        </div>
      ))}
      
      <button onClick={handleCalculate}>احسب الزكاة</button>
      
      {result && (
        <div className="result">
          <h3>نتيجة الحساب</h3>
          {result.validation.isValid ? (
            <div>
              <p>مبلغ الزكاة: {result.zakatAmount.toLocaleString('ar-MA')} درهم</p>
              {result.zakatInKind && <p>الزكاة عيناً: {result.zakatInKind}</p>}
              <div className="breakdown">
                {result.breakdown.map((item, index) => (
                  <div key={index}>
                    <span>{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="errors">
              {result.validation.errors.map((error, index) => (
                <p key={index} className="error">{error}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## 🔧 Usage Examples

### Basic Usage

```typescript
import { grainsCalculator, GRAINS_CONFIG } from 'zakat-calculations';

// Get form configuration
const config = GRAINS_CONFIG;

// Validate form data
const formData = {
  quantity: 1000,
  irrigation: 'rain',
  purpose: 'personal',
  marketValue: 0
};

const validation = grainsCalculator.validate(formData);
if (validation.isValid) {
  // Calculate zakat
  const context = {
    isSolarYear: false,
    nisabGold: 3000,
    nisabSilver: 1500
  };
  
  const result = grainsCalculator.calculate(formData, context);
  console.log('Zakat amount:', result.zakatAmount);
}
```

### Real-time Validation

```typescript
import { formValidator } from 'zakat-calculations';

// Handle field changes
function onFieldChange(fieldName, value, formData) {
  const newFormData = { ...formData, [fieldName]: value };
  
  // Validate changed field
  const fieldValidation = formValidator.validateOnChange(
    GRAINS_CONFIG.fields, 
    newFormData, 
    fieldName
  );
  
  // Update UI with validation results
  showErrors(fieldValidation.formValidation.errors);
  updateVisibleFields(fieldValidation.affectedFields);
}
```

### Custom Calculator Implementation

```typescript
import { ZakatCalculator } from 'zakat-calculations';

class CustomLivestockCalculator extends ZakatCalculator {
  constructor() {
    super('livestock');
  }

  protected performCalculation(formData: FormData, context: FormContext) {
    // Custom calculation logic
    const count = Number(formData.count) || 0;
    const livestockType = formData.livestockType;
    
    // Implementation specific to livestock
    // ...
    
    return {
      zakatAmount: calculatedAmount,
      meetsNisab: meetsNisab,
      zakatInKind: zakatInKind,
      breakdown: breakdownItems
    };
  }
}
```

## 📊 Benefits

### For Developers
- **Faster development** with configuration-driven forms
- **Consistent validation** across all zakat categories
- **Type safety** with comprehensive TypeScript definitions
- **Easy testing** with modular architecture
- **Backward compatibility** with existing code

### For Users
- **Real-time feedback** on form inputs
- **Contextual help** and guidance
- **Dynamic forms** that adapt to selections
- **Clear error messages** in Arabic
- **Responsive design** support

### For Organizations
- **Maintainable codebase** with separation of concerns
- **Scalable architecture** for new zakat categories
- **Consistent user experience** across platforms
- **Compliance tracking** with metadata
- **Easy localization** support

## 🔄 Migration from Phase 1

### Backward Compatibility

Phase 2 maintains full backward compatibility. Existing Phase 1 code continues to work:

```typescript
// Phase 1 code still works
import { calculateZakat, ZakatCalculationInput } from 'zakat-calculations';

const input: ZakatCalculationInput = {
  category: 'grains',
  wizardData: { quantity: 1000, irrigation: 'rain', purpose: 'personal' },
  isSolarYear: false,
  nisabGold: 3000,
  nisabSilver: 1500
};

const result = calculateZakat(input);
```

### Gradual Migration

You can gradually migrate to Phase 2 features:

```typescript
// Mix Phase 1 and Phase 2
import { calculateZakat } from 'zakat-calculations'; // Phase 1
import { grainsCalculator } from 'zakat-calculations'; // Phase 2

// Use Phase 2 for new features
const formData = { quantity: 1000, irrigation: 'rain' };
const validation = grainsCalculator.validate(formData);

// Fall back to Phase 1 for legacy calculations
const legacyResult = calculateZakat(legacyInput);
```

## 🧪 Testing

The Phase 2 architecture includes comprehensive tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage
- ✅ Form validation engine
- ✅ Configuration system
- ✅ Calculator implementations
- ✅ Real-time validation
- ✅ Field visibility logic
- ✅ Integration tests

## 📚 API Reference

### Core Classes

#### `FormValidator`
- `validateField(field, value, formData)` - Validate single field
- `validateForm(fields, formData)` - Validate entire form
- `validateOnChange(fields, formData, changedField)` - Real-time validation
- `isFieldVisible(field, formData)` - Check field visibility

#### `ZakatCalculator` (Abstract)
- `calculate(formData, context)` - Main calculation method
- `validate(formData)` - Validate form data
- `validateField(fieldName, value, formData)` - Validate specific field
- `isFieldVisible(fieldName, formData)` - Check field visibility

### Configuration Objects

#### `CategoryConfig`
- `category` - Zakat category identifier
- `title` - Display title (Arabic)
- `description` - Category description
- `fields` - Array of form field configurations
- `nisabRules` - Nisab threshold configuration
- `zakatRates` - Zakat rate configuration

#### `FormField`
- `name` - Field identifier
- `label` - Display label (Arabic)
- `type` - Field type (number, radio, select, etc.)
- `required` - Whether field is required
- `validation` - Array of validation rules
- `dependsOn` - Conditional field dependency
- `helpText` - Help text for users

## 🌍 Roadmap

### Phase 2.1 (Planned)
- [ ] Additional calculator implementations
- [ ] Advanced validation rules
- [ ] Form field themes
- [ ] Accessibility improvements

### Phase 2.2 (Future)
- [ ] Multi-language support beyond Arabic
- [ ] Custom validation rule builders
- [ ] Form analytics and tracking
- [ ] Performance optimizations

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Adding new zakat categories
- Implementing custom validation rules
- Improving documentation
- Reporting issues

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Special thanks to the Moroccan Fatwa committee (October 2025) for providing the authoritative zakat calculation rules that form the foundation of this library.
