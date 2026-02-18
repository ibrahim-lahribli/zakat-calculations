/**
 * Calculates net assets by subtracting liabilities from gross assets
 * 
 * @param assets - Total assets amount
 * @param liabilities - Total liabilities and debts
 * @returns Net assets amount (assets - liabilities)
 */
export function calculateNetAssets(assets: number, liabilities: number): number {
  if (assets < 0 || liabilities < 0) {
    throw new Error("Assets and liabilities must be non-negative numbers");
  }
  
  return Math.max(0, assets - liabilities);
}

/**
 * Validates that asset and liability amounts are reasonable
 * 
 * @param assets - Assets amount to validate
 * @param liabilities - Liabilities amount to validate
 * @returns True if values are reasonable, false otherwise
 */
export function validateAssetLiability(assets: number, liabilities: number): boolean {
  return !isNaN(assets) && !isNaN(liabilities) && 
         assets >= 0 && liabilities >= 0 &&
         isFinite(assets) && isFinite(liabilities);
}
