/**
 * Input sanitization utilities
 * Provides functions to sanitize and normalize user inputs
 */

/**
 * Normalize email address for consistent storage and lookup
 * - Converts to lowercase
 * - Trims whitespace
 * @param email - Raw email input
 * @returns Normalized email string
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        return ''
    }
    
    return email
        .toLowerCase()
        .trim()
}

/**
 * Sanitize username for consistent storage
 * - Trims whitespace
 * - Limits length
 * @param username - Raw username input
 * @param maxLength - Maximum allowed length (default: 50)
 * @returns Sanitized username string
 */
export function sanitizeUsername(username: string, maxLength: number = 50): string {
    if (!username || typeof username !== 'string') {
        return ''
    }
    
    return username
        .trim()
        .slice(0, maxLength)
}
