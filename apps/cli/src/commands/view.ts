import type { RegistryResolver } from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson, printJsonError } from '../renderers/json.js';
import { printItemDetail } from '../renderers/human.js';

export interface ViewOptions {
  name: string;
  json: boolean;
}

export function viewCommand(resolver: RegistryResolver, opts: ViewOptions): number {
  const item = resolver.getByName(opts.name);

  if (!item) {
    const msg = `Item "${opts.name}" not found.`;
    if (opts.json) {
      printJsonError('ITEM_NOT_FOUND', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.INVALID_INPUT;
  }

  if (opts.json) {
    printJson(item);
    return ExitCode.SUCCESS;
  }

  printItemDetail(item);
  return ExitCode.SUCCESS;
}
