// Email validation utilities

export interface EmailValidationResult {
  isValid: boolean;
  isGmail: boolean;
  errorMessage?: string;
}

/**
 * Validates if an email is a valid Gmail address
 * @param email - The email address to validate
 * @returns EmailValidationResult with validation details
 */
export function validateGmail(email: string): EmailValidationResult {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!trimmedEmail) {
    return {
      isValid: false,
      isGmail: false,
      errorMessage: 'Email address is required'
    };
  }
  
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      isGmail: false,
      errorMessage: 'Please enter a valid email address'
    };
  }
  
  // Check if it's a Gmail address
  const isGmail = trimmedEmail.endsWith('@gmail.com');
  
  if (!isGmail) {
    return {
      isValid: false,
      isGmail: false,
      errorMessage: 'Please use a Gmail account (@gmail.com) to sign up'
    };
  }
  
  // Additional Gmail-specific validations
  const localPart = trimmedEmail.split('@')[0];
  
  // Gmail doesn't allow consecutive dots
  if (localPart.includes('..')) {
    return {
      isValid: false,
      isGmail: true,
      errorMessage: 'Gmail addresses cannot contain consecutive dots'
    };
  }
  
  // Gmail doesn't allow starting or ending with dots
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      isGmail: true,
      errorMessage: 'Gmail addresses cannot start or end with a dot'
    };
  }
  
  // Gmail local part length validation (1-64 characters)
  if (localPart.length < 1 || localPart.length > 64) {
    return {
      isValid: false,
      isGmail: true,
      errorMessage: 'Gmail username must be between 1 and 64 characters'
    };
  }
  
  return {
    isValid: true,
    isGmail: true
  };
}

/**
 * Validates any email address (not just Gmail)
 * @param email - The email address to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmedEmail);
}


