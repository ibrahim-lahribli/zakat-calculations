import { FormField, FormData, ValidationResult, ValidationRule, FieldCondition } from "./types";

export class FormValidator {
  /**
   * Validates a single field against its configuration
   */
  validateField(field: FormField, value: any, formData: FormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if field should be validated (depends on other fields)
    if (!this.shouldValidateField(field, formData)) {
      return { isValid: true, errors: [], warnings: [] };
    }

    // Run validation rules
    if (field.validation) {
      for (const rule of field.validation) {
        const ruleResult = this.validateRule(rule, field, value, formData);
        errors.push(...ruleResult.errors);
        warnings.push(...ruleResult.warnings || []);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates entire form data against field configurations
   */
  validateForm(fields: FormField[], formData: FormData): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const field of fields) {
      const value = formData[field.name];
      const fieldResult = this.validateField(field, value, formData);
      allErrors.push(...fieldResult.errors);
      allWarnings.push(...fieldResult.warnings || []);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Checks if a field should be validated based on dependencies
   */
  private shouldValidateField(field: FormField, formData: FormData): boolean {
    if (!field.dependsOn) {
      return true; // No dependencies, always validate
    }

    const dependencyValue = formData[field.dependsOn.field];
    return dependencyValue === field.dependsOn.value;
  }

  /**
   * Validates a single validation rule
   */
  private validateRule(rule: ValidationRule, field: FormField, value: any, formData: FormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (rule.type) {
      case "required":
        if (this.isEmpty(value)) {
          errors.push(`يرجى إدخال قيمة صحيحة لـ ${field.label}`);
        }
        break;

      case "min":
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < rule.value) {
          const unit = field.unit ? ` ${field.unit}` : '';
          errors.push(`يجب أن تكون قيمة ${field.label} على الأقل ${rule.value}${unit}`);
        }
        break;

      case "max":
        const maxNumValue = Number(value);
        if (!isNaN(maxNumValue) && maxNumValue > rule.value) {
          const unit = field.unit ? ` ${field.unit}` : '';
          errors.push(`يجب أن لا تتجاوز قيمة ${field.label} ${rule.value}${unit}`);
        }
        break;

      case "conditional":
        if (this.evaluateCondition(rule.condition, formData)) {
          const conditionalResult = this.validateRule(rule.rule, field, value, formData);
          errors.push(...conditionalResult.errors);
          warnings.push(...conditionalResult.warnings || []);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Evaluates a field condition
   */
  private evaluateCondition(condition: FieldCondition, formData: FormData): boolean {
    const fieldValue = formData[condition.field];
    
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "not_equals":
        return fieldValue !== condition.value;
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Checks if a value is considered empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === "string") {
      return value.trim() === "";
    }
    if (typeof value === "number") {
      return isNaN(value) || value === 0;
    }
    return false;
  }

  /**
   * Gets validation error message for a specific field
   */
  getFieldError(field: FormField, formData: FormData): string | null {
    const value = formData[field.name];
    const result = this.validateField(field, value, formData);
    return result.errors.length > 0 ? result.errors[0] : null;
  }

  /**
   * Checks if a field is visible based on dependencies
   */
  isFieldVisible(field: FormField, formData: FormData): boolean {
    if (!field.dependsOn) {
      return true;
    }
    return formData[field.dependsOn.field] === field.dependsOn.value;
  }

  /**
   * Gets all visible fields for current form data
   */
  getVisibleFields(fields: FormField[], formData: FormData): FormField[] {
    return fields.filter(field => this.isFieldVisible(field, formData));
  }

  /**
   * Validates only visible fields
   */
  validateVisibleFields(fields: FormField[], formData: FormData): ValidationResult {
    const visibleFields = this.getVisibleFields(fields, formData);
    return this.validateForm(visibleFields, formData);
  }

  /**
   * Real-time validation for form changes
   */
  validateOnChange(
    fields: FormField[], 
    formData: FormData, 
    changedField: string
  ): { 
    fieldValidation: ValidationResult; 
    formValidation: ValidationResult;
    affectedFields: string[];
  } {
    const changedFieldConfig = fields.find(f => f.name === changedField);
    const fieldValidation = changedFieldConfig 
      ? this.validateField(changedFieldConfig, formData[changedField], formData)
      : { isValid: true, errors: [], warnings: [] };

    // Find fields that depend on the changed field
    const affectedFields = fields
      .filter(field => field.dependsOn?.field === changedField)
      .map(field => field.name);

    // Validate entire form
    const formValidation = this.validateVisibleFields(fields, formData);

    return {
      fieldValidation,
      formValidation,
      affectedFields
    };
  }
}

// Export singleton instance
export const formValidator = new FormValidator();

// Helper functions for common validation scenarios
export const ValidationHelpers = {
  /**
   * Validates numeric input with optional min/max
   */
  validateNumber(value: any, min?: number, max?: number): ValidationResult {
    const errors: string[] = [];
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push("يرجى إدخال قيمة رقمية صحيحة");
      return { isValid: false, errors };
    }

    if (min !== undefined && numValue < min) {
      errors.push(`يجب أن تكون القيمة على الأقل ${min}`);
    }

    if (max !== undefined && numValue > max) {
      errors.push(`يجب أن لا تتجاوز القيمة ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates required field
   */
  validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === "") {
      errors.push(`يرجى إدخال ${fieldName}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates conditional requirement
   */
  validateConditional(
    condition: boolean, 
    value: any, 
    fieldName: string
  ): ValidationResult {
    if (!condition) {
      return { isValid: true, errors: [] };
    }
    return ValidationHelpers.validateRequired(value, fieldName);
  }
};
