// src/components/auth/authUtils.ts
export const formatFullName = (value: string): string => {
    const sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    return sanitizedValue
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };