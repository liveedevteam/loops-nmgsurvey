/**
 * Coupon Code Generator
 * 
 * Generates unique alphanumeric coupon codes with a timestamp prefix
 * to ensure uniqueness and easy identification.
 */

/**
 * Character set for coupon code generation
 * Using uppercase letters and numbers for readability
 * Excluding similar-looking characters (0, O, 1, I, L)
 */
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generates a random string of specified length
 */
function generateRandomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    result += CHARSET[randomIndex];
  }
  return result;
}

/**
 * Generates a unique coupon code
 * Format: YYMMDD + 6 random characters = 12 characters total
 * Example: 241216ABCD12
 * 
 * @returns A unique coupon code string
 */
export function generateCouponCode(): string {
  const now = new Date();
  
  // Create date prefix (YYMMDD)
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Generate random suffix (6 characters)
  const randomSuffix = generateRandomString(6);
  
  return `${datePrefix}${randomSuffix}`;
}

/**
 * Validates a coupon code format
 * 
 * @param code - The coupon code to validate
 * @returns True if the code matches the expected format
 */
export function isValidCouponCode(code: string): boolean {
  // Should be exactly 12 characters
  if (code.length !== 12) return false;
  
  // First 6 characters should be digits (date)
  const datePrefix = code.slice(0, 6);
  if (!/^\d{6}$/.test(datePrefix)) return false;
  
  // Last 6 characters should be alphanumeric
  const suffix = code.slice(6);
  if (!/^[A-Z0-9]{6}$/.test(suffix)) return false;
  
  return true;
}

export default generateCouponCode;

