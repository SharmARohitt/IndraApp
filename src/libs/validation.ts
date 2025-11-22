// Simple validation library (Zod-like but lightweight for Expo)
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'ValidationError';
  }
}

export abstract class Schema<T> {
  abstract validate(data: unknown): ValidationResult<T>;
  
  parse(data: unknown): T {
    const result = this.validate(data);
    if (!result.success) {
      throw new ValidationError(result.errors || ['Validation failed']);
    }
    return result.data!;
  }

  safeParse(data: unknown): ValidationResult<T> {
    return this.validate(data);
  }
}

export class StringSchema extends Schema<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private isEmail = false;
  private isRequired = true;

  min(length: number): StringSchema {
    this.minLength = length;
    return this;
  }

  max(length: number): StringSchema {
    this.maxLength = length;
    return this;
  }

  regex(pattern: RegExp): StringSchema {
    this.pattern = pattern;
    return this;
  }

  email(): StringSchema {
    this.isEmail = true;
    return this;
  }

  optional(): StringSchema {
    this.isRequired = false;
    return this;
  }

  validate(data: unknown): ValidationResult<string> {
    const errors: string[] = [];

    if (data === undefined || data === null || data === '') {
      if (this.isRequired) {
        errors.push('Field is required');
      }
      return { success: errors.length === 0, data: data as string, errors };
    }

    if (typeof data !== 'string') {
      errors.push('Must be a string');
      return { success: false, errors };
    }

    if (this.minLength !== undefined && data.length < this.minLength) {
      errors.push(`Must be at least ${this.minLength} characters`);
    }

    if (this.maxLength !== undefined && data.length > this.maxLength) {
      errors.push(`Must be at most ${this.maxLength} characters`);
    }

    if (this.pattern && !this.pattern.test(data)) {
      errors.push('Invalid format');
    }

    if (this.isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data)) {
        errors.push('Invalid email format');
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? data : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export class NumberSchema extends Schema<number> {
  private minValue?: number;
  private maxValue?: number;
  private isInteger = false;
  private isRequired = true;

  min(value: number): NumberSchema {
    this.minValue = value;
    return this;
  }

  max(value: number): NumberSchema {
    this.maxValue = value;
    return this;
  }

  int(): NumberSchema {
    this.isInteger = true;
    return this;
  }

  optional(): NumberSchema {
    this.isRequired = false;
    return this;
  }

  validate(data: unknown): ValidationResult<number> {
    const errors: string[] = [];

    if (data === undefined || data === null) {
      if (this.isRequired) {
        errors.push('Field is required');
      }
      return { success: errors.length === 0, data: undefined, errors };
    }

    const num = Number(data);
    if (isNaN(num)) {
      errors.push('Must be a number');
      return { success: false, errors };
    }

    if (this.isInteger && !Number.isInteger(num)) {
      errors.push('Must be an integer');
    }

    if (this.minValue !== undefined && num < this.minValue) {
      errors.push(`Must be at least ${this.minValue}`);
    }

    if (this.maxValue !== undefined && num > this.maxValue) {
      errors.push(`Must be at most ${this.maxValue}`);
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? num : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export class ObjectSchema<T extends Record<string, any>> extends Schema<T> {
  constructor(private shape: { [K in keyof T]: Schema<T[K]> }) {
    super();
  }

  validate(data: unknown): ValidationResult<T> {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push('Must be an object');
      return { success: false, errors };
    }

    const result = {} as T;
    const obj = data as Record<string, unknown>;

    for (const [key, schema] of Object.entries(this.shape)) {
      const fieldResult = schema.validate(obj[key]);
      if (!fieldResult.success) {
        errors.push(...(fieldResult.errors?.map(err => `${key}: ${err}`) || []));
      } else {
        result[key as keyof T] = fieldResult.data;
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? result : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export class ArraySchema<T> extends Schema<T[]> {
  private minItems?: number;
  private maxItems?: number;

  constructor(private itemSchema: Schema<T>) {
    super();
  }

  min(items: number): ArraySchema<T> {
    this.minItems = items;
    return this;
  }

  max(items: number): ArraySchema<T> {
    this.maxItems = items;
    return this;
  }

  validate(data: unknown): ValidationResult<T[]> {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Must be an array');
      return { success: false, errors };
    }

    if (this.minItems !== undefined && data.length < this.minItems) {
      errors.push(`Must have at least ${this.minItems} items`);
    }

    if (this.maxItems !== undefined && data.length > this.maxItems) {
      errors.push(`Must have at most ${this.maxItems} items`);
    }

    const result: T[] = [];
    for (let i = 0; i < data.length; i++) {
      const itemResult = this.itemSchema.validate(data[i]);
      if (!itemResult.success) {
        errors.push(...(itemResult.errors?.map(err => `[${i}]: ${err}`) || []));
      } else {
        result.push(itemResult.data!);
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? result : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// Factory functions
export const string = () => new StringSchema();
export const number = () => new NumberSchema();
export const object = <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }) => 
  new ObjectSchema(shape);
export const array = <T>(itemSchema: Schema<T>) => new ArraySchema(itemSchema);

// Common schemas
export const loginSchema = object({
  email: string().email(),
  password: string().min(6),
});

export const taskReportSchema = object({
  taskId: string(),
  notes: string().optional(),
  severity: string(),
  checklistData: array(object({
    id: string(),
    label: string(),
    checked: string(), // Will be converted to boolean
    required: string(), // Will be converted to boolean
  })),
});

export const userSchema = object({
  id: string(),
  name: string().min(1),
  email: string().email(),
  role: string(),
});

// Validation helpers
export const validateForm = <T>(schema: Schema<T>, data: unknown): { isValid: boolean; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.errors?.forEach((error: string) => {
    const [field, message] = error.split(': ');
    errors[field] = message || error;
  });

  return { isValid: false, errors };
};