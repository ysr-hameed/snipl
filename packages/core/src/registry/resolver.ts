import * as crypto from 'crypto';
import { RegistryItemSchema, safeParse } from '@snipl/registry-schema';
import type { RegistryItem } from '@snipl/registry-schema';

export interface RegistryResolver {
  name: string;
  getAll(): RegistryItem[];
  getByName(name: string): RegistryItem | undefined;
  search(query: string): RegistryItem[];
}

export class BuiltinRegistryResolver implements RegistryResolver {
  readonly name = 'official';
  private items: RegistryItem[] = [];

  constructor() {
    this.loadBuiltins();
  }

  getAll(): RegistryItem[] {
    return [...this.items];
  }

  getByName(name: string): RegistryItem | undefined {
    return this.items.find((item) => item.name === name);
  }

  search(query: string): RegistryItem[] {
    const lowerQuery = query.toLowerCase();
    const scored = this.items.map((item) => {
      let score = 0;
      if (item.name === lowerQuery) score += 100;
      else if (item.name.startsWith(lowerQuery)) score += 50;
      if (item.summary.toLowerCase().includes(lowerQuery)) score += 10;
      if (item.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))) score += 5;
      return { item, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
      .map((s) => s.item);
  }

  private loadBuiltins(): void {
    this.items = [
      createBuiltinItem('sleep', {
        summary: 'Delay execution for a given duration',
        tags: ['async', 'timer', 'utility'],
        environments: ['node', 'browser'],
        exports: [{ name: 'sleep', kind: 'function' }],
      }),
      createBuiltinItem('retry', {
        summary: 'Retry an async operation with configurable backoff',
        tags: ['async', 'retry', 'resilience'],
        environments: ['node', 'browser', 'universal'],
        exports: [
          { name: 'retry', kind: 'function' },
          { name: 'RetryOptions', kind: 'type' },
        ],
      }),
      createBuiltinItem('debounce', {
        summary: 'Create a debounced function that delays invocation',
        tags: ['async', 'timer', 'performance'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'debounce', kind: 'function' }],
      }),
      createBuiltinItem('throttle', {
        summary: 'Create a throttled function that limits invocation rate',
        tags: ['async', 'timer', 'performance'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'throttle', kind: 'function' }],
      }),
      createBuiltinItem('memoize', {
        summary: 'Memoize a function with configurable cache key',
        tags: ['cache', 'performance', 'utility'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'memoize', kind: 'function' }],
      }),
      createBuiltinItem('deep-clone', {
        summary: 'Deep clone a value with circular reference handling',
        tags: ['clone', 'object', 'utility'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'deepClone', kind: 'function' }],
      }),
      createBuiltinItem('clamp', {
        summary: 'Clamp a number within a specified range',
        tags: ['math', 'utility'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'clamp', kind: 'function' }],
      }),
      createBuiltinItem('slugify', {
        summary: 'Convert a string to a URL-friendly slug',
        tags: ['string', 'url', 'utility'],
        environments: ['node', 'browser', 'universal'],
        exports: [{ name: 'slugify', kind: 'function' }],
      }),
    ];
  }
}

function createBuiltinItem(name: string, overrides: Partial<RegistryItem>): RegistryItem {
  const content = `// ${name} — placeholder for official implementation\n`;
  const sha256 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  const item: RegistryItem = {
    schemaVersion: 1,
    name,
    version: '0.1.0',
    summary: overrides.summary ?? '',
    tags: overrides.tags ?? [],
    language: 'ts',
    environments: overrides.environments ?? ['universal'],
    exports: overrides.exports ?? [],
    files: [
      {
        path: `${name}.ts`,
        content,
        sha256,
      },
    ],
    dependencies: [],
    templateVariables: [],
    license: { spdx: 'MIT', source: 'original' },
    tests: [],
    docs: {
      usage: `// TODO: add usage example for ${name}`,
      caveats: [],
    },
  };
  const result = safeParse(RegistryItemSchema, item);
  if (!result.success) {
    throw new Error(
      `Builtin item "${name}" failed schema validation: ${JSON.stringify(result.errors)}`,
    );
  }
  return result.data;
}
