import { describe, it, expect } from 'vitest';

describe('registry-schema', () => {
  it('exports version', async () => {
    const mod = await import('../src/index.js');
    expect(mod.VERSION).toBe('0.0.0');
  });
});
