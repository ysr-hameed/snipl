import type { RegistryResolver } from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson, printJsonError } from '../renderers/json.js';
import { printItemList } from '../renderers/human.js';

export interface SearchOptions {
  query: string;
  json: boolean;
}

export function searchCommand(resolver: RegistryResolver, opts: SearchOptions): number {
  if (!opts.query || opts.query.trim() === '') {
    if (opts.json) {
      printJsonError('EMPTY_QUERY', 'Search query cannot be empty.');
    } else {
      process.stderr.write('  Please provide a search query.\n');
    }
    return ExitCode.INVALID_INPUT;
  }

  const results = resolver.search(opts.query.trim());

  if (opts.json) {
    printJson(results);
    return ExitCode.SUCCESS;
  }

  if (results.length === 0) {
    process.stdout.write(`  No items found for "${opts.query}".\n`);
    return ExitCode.SUCCESS;
  }

  process.stdout.write(`\n  ${results.length} result(s) for "${opts.query}":\n\n`);
  printItemList(results);
  return ExitCode.SUCCESS;
}
