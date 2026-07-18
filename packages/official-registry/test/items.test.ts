import { describe, it, expect } from 'vitest';
import { buildRegistryItems } from '../src/registry.js';

describe('registry items', () => {
  const items = buildRegistryItems();

  it('builds all 8 items', () => {
    expect(items).toHaveLength(8);
    const names = items.map((i: { name: string }) => i.name);
    expect(names).toContain('sleep');
    expect(names).toContain('retry');
    expect(names).toContain('debounce');
    expect(names).toContain('throttle');
    expect(names).toContain('memoize');
    expect(names).toContain('deep-clone');
    expect(names).toContain('clamp');
    expect(names).toContain('slugify');
  });

  it('each item has valid content and matching SHA-256', async () => {
    for (const item of items) {
      for (const file of item.files) {
        const { createHash } = await import('crypto');
        const actualHash = createHash('sha256').update(file.content, 'utf-8').digest('hex');
        expect(actualHash).toBe(file.sha256);
      }
    }
  });

  it('each item exports match its source', () => {
    for (const item of items) {
      for (const file of item.files) {
        for (const exp of item.exports) {
          expect(file.content).toContain(
            exp.kind === 'type' ? `interface ${exp.name}` : `function ${exp.name}`,
          );
        }
      }
    }
  });

  it('has no dependencies or template variables', () => {
    for (const item of items) {
      expect(item.dependencies).toEqual([]);
      expect(item.templateVariables).toEqual([]);
    }
  });

  it('each item has MIT original license', () => {
    for (const item of items) {
      expect(item.license.spdx).toBe('MIT');
      expect(item.license.source).toBe('original');
    }
  });
});
