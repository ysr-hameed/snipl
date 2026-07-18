import { z } from 'zod';
import { ValidationError, ErrorCode } from './errors.js';

export type ParseResult<T> =
  { success: true; data: T } | { success: false; errors: ValidationError[] };

function mapZodIssue(issue: z.ZodIssue): ValidationError {
  const path = issue.path.join('.');
  const code = inferErrorCode(issue);
  return new ValidationError(code, issue.message, path || '$');
}

function inferErrorCode(issue: z.ZodIssue): (typeof ErrorCode)[keyof typeof ErrorCode] {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_literal:
      return ErrorCode.INVALID_SCHEMA_VERSION;
    case z.ZodIssueCode.invalid_enum_value:
      if (issue.path.includes('spdx')) return ErrorCode.INVALID_SPDX;
      if (issue.path.includes('source')) return ErrorCode.INVALID_LICENSE_SOURCE;
      if (issue.path.includes('kind')) return ErrorCode.INVALID_EXPORT_KIND;
      if (issue.path.includes('environment')) return ErrorCode.INVALID_ENVIRONMENT;
      if (issue.path.includes('language')) return ErrorCode.INVALID_LANGUAGE;
      return ErrorCode.INVALID_LICENSE;
    case z.ZodIssueCode.too_small:
      if (issue.path.includes('content') && issue.minimum === 1)
        return ErrorCode.INVALID_CONTENT_EMPTY;
      if (issue.path.includes('usage') && issue.minimum === 1)
        return ErrorCode.MISSING_REQUIRED_FIELD;
      return ErrorCode.MISSING_REQUIRED_FIELD;
    case z.ZodIssueCode.invalid_type:
      if (issue.path.includes('dependencies') || issue.path.includes('templateVariables')) {
        if (issue.received === 'array') return ErrorCode.INVALID_LICENSE;
        return ErrorCode.INVALID_LICENSE;
      }
      return ErrorCode.MISSING_REQUIRED_FIELD;
    case z.ZodIssueCode.custom:
      if (issue.params?.code)
        return issue.params.code as (typeof ErrorCode)[keyof typeof ErrorCode];
      return ErrorCode.MALFORMED_JSON;
    default:
      return ErrorCode.MALFORMED_JSON;
  }
}

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): ParseResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map(mapZodIssue),
  };
}
