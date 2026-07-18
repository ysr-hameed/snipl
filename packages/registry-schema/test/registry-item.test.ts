import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  RegistryItemSchema,
  SnippetConfigSchema,
  ManifestSchema,
  safeParse,
  ErrorCode,
} from '../src/index.js';

const FIXTURES_VALID_DIR = path.join(import.meta.dirname, 'fixtures', 'valid');
const FIXTURES_INVALID_DIR = path.join(import.meta.dirname, 'fixtures', 'invalid');

function loadJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('RegistryItemSchema — valid fixtures', () => {
  const validFiles = fs.readdirSync(FIXTURES_VALID_DIR).filter((f) => f.endsWith('.json'));

  for (const file of validFiles) {
    it(`accepts ${file}`, () => {
      const data = loadJson(path.join(FIXTURES_VALID_DIR, file));
      const result = safeParse(RegistryItemSchema, data);
      if (!result.success) {
        const messages = result.errors.map((e) => `[${e.code}] ${e.path}: ${e.message}`).join('; ');
        expect.fail(`Expected ${file} to be valid, but got errors: ${messages}`);
      } else {
        expect(result.data.schemaVersion).toBe(1);
      }
    });
  }
});

describe('RegistryItemSchema — invalid fixtures', () => {
  const invalidFiles = fs.readdirSync(FIXTURES_INVALID_DIR).filter((f) => f.endsWith('.json'));

  for (const file of invalidFiles) {
    it(`rejects ${file}`, () => {
      const data = loadJson(path.join(FIXTURES_INVALID_DIR, file));
      const result = safeParse(RegistryItemSchema, data);
      expect(result.success).toBe(false);
    });
  }

  it('rejects traversal path', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'traversal-path.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects absolute path', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'absolute-path.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects Windows backslash separator', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'windows-separator.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid SHA-256 hash', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'invalid-hash.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects duplicate file paths', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'duplicate-paths.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.code === ErrorCode.DUPLICATE_FILE_PATH)).toBe(true);
    }
  });

  it('rejects unknown schema version', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'unknown-schema-version.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects non-empty dependencies', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'has-dependency.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects non-empty templateVariables', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'has-template-variables.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects empty docs usage', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'missing-docs.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects derived license without attribution', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'attribution-missing.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.code === ErrorCode.ATTRIBUTION_REQUIRED)).toBe(true);
    }
  });

  it('rejects empty file content', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'empty-content.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid SPDX identifier', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'invalid-spdx.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
  });
});

describe('SnippetConfigSchema', () => {
  it('parses minimal config with defaults', () => {
    const result = SnippetConfigSchema.parse({});
    expect(result.output).toBe('src/snippets');
    expect(result.language).toBe('ts');
    expect(result.registries).toHaveLength(1);
    expect(result.registries?.[0]?.name).toBe('official');
  });

  it('parses explicit config', () => {
    const result = SnippetConfigSchema.parse({
      output: 'lib/helpers',
      language: 'js',
      registries: [{ name: 'official', source: 'builtin' }],
    });
    expect(result.output).toBe('lib/helpers');
    expect(result.language).toBe('js');
  });

  it('rejects invalid language', () => {
    expect(() => SnippetConfigSchema.parse({ language: 'py' })).toThrow();
  });
});

describe('ManifestSchema', () => {
  it('parses empty manifest defaults', () => {
    const result = ManifestSchema.parse({ schemaVersion: 1 });
    expect(result.items).toEqual([]);
  });

  it('parses manifest with items', () => {
    const result = ManifestSchema.parse({
      schemaVersion: 1,
      items: [
        {
          registry: 'official',
          name: 'sleep',
          version: '1.0.0',
          installedAt: '2026-07-18T00:00:00.000Z',
          files: [
            {
              path: 'src/snippets/sleep.ts',
              sha256: 'aa9f16b8968ff0c12a5da7d9ca68561026565a9e4d5da955ab5a3a02422cabb1',
            },
          ],
        },
      ],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('sleep');
  });

  it('rejects invalid schema version', () => {
    expect(() => ManifestSchema.parse({ schemaVersion: 2 })).toThrow();
  });
});

describe('ValidationError', () => {
  it('produces structured error output', () => {
    const data = loadJson(path.join(FIXTURES_INVALID_DIR, 'invalid-spdx.json'));
    const result = safeParse(RegistryItemSchema, data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.errors[0]!;
      expect(error.code).toBe(ErrorCode.INVALID_SPDX);
      expect(error.toJSON()).toHaveProperty('code');
      expect(error.toJSON()).toHaveProperty('message');
      expect(error.toJSON()).toHaveProperty('path');
    }
  });
});

describe('Round-trip', () => {
  it('serializes and deserializes without data loss', () => {
    const original = {
      schemaVersion: 1 as const,
      name: 'sleep',
      version: '1.0.0',
      summary: 'test',
      tags: [],
      language: 'ts' as const,
      environments: ['node' as const],
      exports: [],
      files: [
        {
          path: 'sleep.ts',
          content: 'export const a = 1;',
          sha256: '683314ed22112e8dea8095c8c6173afa2c61279f5fe07968ebe0e21fff16871d',
        },
      ],
      dependencies: [],
      templateVariables: [],
      license: { spdx: 'MIT' as const, source: 'original' as const },
      tests: [],
      docs: { usage: 'test', caveats: [] },
    };
    const json: unknown = JSON.parse(JSON.stringify(original));
    const result = RegistryItemSchema.parse(json);
    expect(result.name).toBe('sleep');
    expect(result.files).toHaveLength(1);
  });
});
