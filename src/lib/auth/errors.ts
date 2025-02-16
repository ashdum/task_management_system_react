// Custom error classes for better error handling
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('No user found with this email address');
  }
}

export class InvalidPasswordError extends AuthError {
  constructor() {
    super('Incorrect password');
  }
}

export class UserExistsError extends AuthError {
  constructor(type: 'email' | 'username') {
    super(type === 'email' 
      ? 'User with this email already exists' 
      : 'Username is already taken');
  }
}

export class TokenError extends AuthError {
  constructor(message: string = 'Token validation failed') {
    super(message);
    this.name = 'TokenError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}