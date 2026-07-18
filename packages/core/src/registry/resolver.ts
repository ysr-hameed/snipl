import type { RegistryItem } from '@snipl/registry-schema';
import { buildRegistryItems } from '@snipl/official-registry';

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
    this.items = buildRegistryItems();
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
}
