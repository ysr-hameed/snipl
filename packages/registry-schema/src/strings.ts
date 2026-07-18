import { z } from 'zod';

const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const sha256HexRegex = /^[a-f0-9]{64}$/;
const relativePosixPathRegex = /^(?!\/)(?!.*\/\/)(?!.*\.\.)(?!.*\\)[^\0]+$/;

export const kebabCaseString = z
  .string()
  .min(1)
  .max(100)
  .regex(kebabCaseRegex, 'Must be lowercase kebab-case');

export const semverString = z.string().regex(semverRegex, 'Must be a valid SemVer string');

export const sha256Hex = z.string().regex(sha256HexRegex, 'Must be a lowercase SHA-256 hex string');

export const relativePosixPath = z
  .string()
  .min(1)
  .max(500)
  .regex(relativePosixPathRegex, 'Must be a relative POSIX path without traversal or null bytes');

export const nonEmptyString = z.string().min(1, 'Must not be empty');
