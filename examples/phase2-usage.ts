/**
 * Example usage of Phase 2 Zakat Calculations Architecture
 * 
 * This file demonstrates how to use the new configuration-driven system
 * for dynamic form generation and real-time validation.
 */

import { 
  grainsCalculator, 
  formValidator, 
  GRAINS_CONFIG,
  getCategoryConfig,
  getAvailableCategories
} from '../index';

// Example 1: Basic Form Configuration Usage
function example1_BasicConfiguration() {
  console.log('=== Example 1: Basic Configuration ===');
  
  // Get grains category configuration
  const grainsConfig = getCategoryConfig('grains');
  console.log('Category:', grainsConfig.title);
  console.log('Description:', grainsConfig.description);
  console.log('Number of fields:', grainsConfig.fields.length);
  
  // Get all available categories
  const categories = getAvailableCategories();
  console.log('Available categories:', categories.map(c => c.label));
}

// Example 2: Real-time Validation
function example2_RealTimeValidation() {
  console.log('\n=== Example 2: Real-time Validation ===');
  
  // Initial form data
  let formData = {
    quantity: 1000,
    irrigation: 'rain',
    purpose: 'personal',
    marketValue: 0
  };
  
  // Validate entire form
  const initialValidation = grainsCalculator.validate(formData);
  console.log('Initial validation:', initialValidation.isValid);
  
  // Change purpose to trade (should make marketValue required)
  formData.purpose = 'trade';
  const updatedValidation = grainsCalculator.validate(formData);
  console.log('After changing purpose to trade:', updatedValidation.isValid);
  console.log('Validation errors:', updatedValidation.errors);
  
  // Check field visibility
  const isMarketValueVisible = grainsCalculator.isFieldVisible('marketValue', formData);
  console.log('Market value field visible:', isMarketValueVisible);
  
  // Get visible fields
  const visibleFields = grainsCalculator.getVisibleFields(formData);
  console.log('Visible fields:', visibleFields.map(f => f.name));
}

// Example 3: Field-level Validation
function example3_FieldValidation() {
  console.log('\n=== Example 3: Field-level Validation ===');
  
  const formData = {
    quantity: -5, // Invalid: negative value
    irrigation: 'rain',
    purpose: 'personal'
  };
  
  // Validate specific field
  const quantityValidation = grainsCalculator.validateField('quantity', -5, formData);
  console.log('Quantity field valid:', quantityValidation.isValid);
  console.log('Quantity errors:', quantityValidation.errors);
  
  // Get field error message
  const quantityError = grainsCalculator.getFieldError('quantity', formData);
  console.log('Quantity error message:', quantityError);
  
  // Validate with correct value
  const validQuantityValidation = grainsCalculator.validateField('quantity', 1000, formData);
  console.log('Valid quantity validation:', validQuantityValidation.isValid);
}

// Example 4: Complete Calculation Flow
function example4_CompleteCalculation() {
  console.log('\n=== Example 4: Complete Calculation Flow ===');
  
  const context = {
    isSolarYear: false,
    nisabGold: 3000,
    nisabSilver: 1500,
    showNisabGold: false
  };
  
  // Test case 1: Personal consumption with rain irrigation
  const formData1 = {
    quantity: 1000,
    irrigation: 'rain',
    purpose: 'personal',
    marketValue: 0
  };
  
  const result1 = grainsCalculator.calculate(formData1, context);
  console.log('Personal consumption - Rain irrigation:');
  console.log('  Zakat amount:', result1.zakatAmount);
  console.log('  Zakat in kind:', result1.zakatInKind);
  console.log('  Meets nisab:', result1.meetsNisab);
  console.log('  Breakdown:', result1.breakdown);
  
  // Test case 2: Trade purpose
  const formData2 = {
    quantity: 1000,
    irrigation: 'rain',
    purpose: 'trade',
    marketValue: 5000
  };
  
  const result2 = grainsCalculator.calculate(formData2, context);
  console.log('\nTrade purpose:');
  console.log('  Zakat amount:', result2.zakatAmount);
  console.log('  Zakat in kind:', result2.zakatInKind);
  console.log('  Meets nisab:', result2.meetsNisab);
  console.log('  Calculation time:', result2.metadata.calculationTime, 'ms');
  console.log('  Config version:', result2.metadata.configVersion);
}

// Example 5: Advanced Features
function example5_AdvancedFeatures() {
  console.log('\n=== Example 5: Advanced Features ===');
  
  const formData = {
    quantity: 1000,
    irrigation: 'artificial',
    purpose: 'trade',
    marketValue: 8000
  };
  
  const context = {
    isSolarYear: true, // Solar year
    nisabGold: 3000,
    nisabSilver: 1500,
    showNisabGold: false
  };
  
  // Get zakat rate explanation
  const rateExplanation = grainsCalculator.getZakatRateExplanation(
    'artificial', 
    'trade', 
    context
  );
  console.log('Rate explanation:', rateExplanation);
  
  // Get nisab explanation
  const nisabExplanation = grainsCalculator.getNisabExplanation();
  console.log('Nisab explanation:', nisabExplanation);
  
  // Get calculation scenarios
  const scenarios = grainsCalculator.getCalculationScenarios(formData, context);
  console.log('\nCalculation scenarios:');
  scenarios.forEach((scenario, index) => {
    console.log(`  ${index + 1}. ${scenario.scenario}`);
    console.log(`     Description: ${scenario.description}`);
    console.log(`     Zakat amount: ${scenario.zakatAmount}`);
    console.log(`     Zakat in kind: ${scenario.zakatInKind}`);
  });
  
  // Validate field combinations
  const combinationValidation = grainsCalculator.validateFieldCombination(
    'quantity', 
    500, 
    formData
  );
  console.log('\nField combination validation:');
  console.log('  Valid:', combinationValidation.isValid);
  console.log('  Message:', combinationValidation.message);
}

// Example 6: Validation Engine Direct Usage
function example6_ValidationEngine() {
  console.log('\n=== Example 6: Validation Engine Direct Usage ===');
  
  const fields = GRAINS_CONFIG.fields;
  let formData = {
    quantity: 1000,
    irrigation: 'rain',
    purpose: 'personal'
  };
  
  // Validate visible fields only
  const visibleValidation = formValidator.validateVisibleFields(fields, formData);
  console.log('Visible fields validation:', visibleValidation.isValid);
  
  // Simulate field change
  formData.purpose = 'trade';
  const changeResult = formValidator.validateOnChange(fields, formData, 'purpose');
  console.log('Field change validation:');
  console.log('  Field valid:', changeResult.fieldValidation.isValid);
  console.log('  Form valid:', changeResult.formValidation.isValid);
  console.log('  Affected fields:', changeResult.affectedFields);
  
  // Check specific field error
  const marketValueField = fields.find(f => f.name === 'marketValue');
  if (marketValueField) {
    const marketValueError = formValidator.getFieldError(marketValueField, formData);
    console.log('Market value error:', marketValueError);
  }
}

// Run all examples
function runAllExamples() {
  console.log('🚀 Phase 2 Zakat Calculations - Usage Examples\n');
  
  try {
    example1_BasicConfiguration();
    example2_RealTimeValidation();
    example3_FieldValidation();
    example4_CompleteCalculation();
    example5_AdvancedFeatures();
    example6_ValidationEngine();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export examples for individual testing
export {
  example1_BasicConfiguration,
  example2_RealTimeValidation,
  example3_FieldValidation,
  example4_CompleteCalculation,
  example5_AdvancedFeatures,
  example6_ValidationEngine,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
