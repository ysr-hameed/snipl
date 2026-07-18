import type { RegistryResolver } from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson } from '../renderers/json.js';
import { printItemList } from '../renderers/human.js';

export interface ListOptions {
  json: boolean;
}

export function listCommand(resolver: RegistryResolver, opts: ListOptions): number {
  const items = resolver.getAll();

  if (opts.json) {
    printJson(items);
    return ExitCode.SUCCESS;
  }

  if (items.length === 0) {
    process.stdout.write('  No items available.\n');
    return ExitCode.SUCCESS;
  }

  printItemList(items);
  return ExitCode.SUCCESS;
}
