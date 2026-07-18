import { describe, it, expect } from 'vitest';
import {
  SnippetConfigSchema,
  RegistryItemSchema,
  ManifestSchema,
  ErrorCode,
} from '../src/index.js';

describe('registry-schema exports', () => {
  it('exports schema validators', () => {
    expect(SnippetConfigSchema).toBeDefined();
    expect(RegistryItemSchema).toBeDefined();
    expect(ManifestSchema).toBeDefined();
    expect(ErrorCode).toBeDefined();
  });
});
