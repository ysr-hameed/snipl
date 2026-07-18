#!/usr/bin/env node

import { cac } from 'cac';
import * as fs from 'fs';
import * as path from 'path';
import { BuiltinRegistryResolver } from '@snipl/core';
import { initCommand } from './commands/init.js';
import type { InitOptions } from './commands/init.js';
import { listCommand } from './commands/list.js';
import type { ListOptions } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import type { SearchOptions } from './commands/search.js';
import { viewCommand } from './commands/view.js';
import type { ViewOptions } from './commands/view.js';
import { addCommand } from './commands/add.js';
import type { AddOptions } from './commands/add.js';
import { statusCommand } from './commands/status.js';
import type { StatusOptions } from './commands/status.js';
import { ExitCode } from './exit-codes.js';

interface GlobalOptions {
  cwd?: string;
  json?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  overwrite?: boolean;
  output?: string;
  language?: string;
  [key: string]: unknown;
}

const cli = cac('snipl');

cli.option('--cwd <path>', 'Working directory', { default: '.' });
cli.option('--json', 'Output as JSON');
cli.option('--yes, -y', 'Skip confirmation prompts');
cli.option('--dry-run', 'Preview without writing');
cli.option('--verbose', 'Verbose output');
cli.option('--overwrite', 'Allow overwriting existing files');
cli.option('--output <path>', 'Output directory for snippets');
cli.option('--language <lang>', 'Language (ts or js)');

function resolveCwd(cwd: string): string {
  const resolved = path.resolve(cwd);
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`Error: --cwd path "${cwd}" does not exist.\n`);
    process.exit(ExitCode.INVALID_INPUT);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    process.stderr.write(`Error: --cwd path "${cwd}" is not a directory.\n`);
    process.exit(ExitCode.INVALID_INPUT);
  }
  return resolved;
}

function parseGlobalOptions(raw: GlobalOptions): GlobalOptions {
  return {
    cwd: typeof raw.cwd === 'string' ? raw.cwd : '.',
    json: raw.json === true,
    yes: raw.yes === true,
    dryRun: raw.dryRun === true,
    verbose: raw.verbose === true,
    overwrite: raw.overwrite === true,
    output: typeof raw.output === 'string' ? raw.output : undefined,
    language: typeof raw.language === 'string' ? raw.language : undefined,
  };
}

cli
  .command('init', 'Initialize snippets.json in the project')
  .action(async (options: GlobalOptions) => {
    const opts = parseGlobalOptions(options);
    const cwd = resolveCwd(opts.cwd ?? '.');
    const exitCode = await initCommand({
      cwd,
      output: opts.output,
      language: opts.language as 'ts' | 'js' | undefined,
      yes: opts.yes ?? false,
      dryRun: opts.dryRun ?? false,
      json: opts.json ?? false,
      overwrite: opts.overwrite ?? false,
    } satisfies InitOptions);
    process.exit(exitCode);
  });

function withCwd<T>(options: GlobalOptions, fn: (cwd: string) => T): T {
  const opts = parseGlobalOptions(options);
  const cwd = resolveCwd(opts.cwd ?? '.');
  return fn(cwd);
}

cli.command('list', 'List all available items').action((options: GlobalOptions) => {
  withCwd(options, () => {
    const opts = parseGlobalOptions(options);
    const resolver = new BuiltinRegistryResolver();
    try {
      const exitCode = listCommand(resolver, { json: opts.json ?? false } satisfies ListOptions);
      process.exit(exitCode);
    } catch (err) {
      handleError(err, opts.json ?? false);
    }
  });
});

cli
  .command('search <query>', 'Search for items')
  .action((query: string, options: GlobalOptions) => {
    withCwd(options, () => {
      const opts = parseGlobalOptions(options);
      const resolver = new BuiltinRegistryResolver();
      try {
        const exitCode = searchCommand(resolver, {
          query,
          json: opts.json ?? false,
        } satisfies SearchOptions);
        process.exit(exitCode);
      } catch (err) {
        handleError(err, opts.json ?? false);
      }
    });
  });

cli.command('view <name>', 'View item details').action((name: string, options: GlobalOptions) => {
  withCwd(options, () => {
    const opts = parseGlobalOptions(options);
    const resolver = new BuiltinRegistryResolver();
    try {
      const exitCode = viewCommand(resolver, {
        name,
        json: opts.json ?? false,
      } satisfies ViewOptions);
      process.exit(exitCode);
    } catch (err) {
      handleError(err, opts.json ?? false);
    }
  });
});

cli
  .command('add <name>', 'Install an item')
  .option('--path <path>', 'Explicit destination root')
  .action(async (name: string, options: GlobalOptions) => {
    const opts = parseGlobalOptions(options);
    const cwd = resolveCwd(opts.cwd ?? '.');
    try {
      const resolver = new BuiltinRegistryResolver();
      const exitCode = await addCommand(resolver, name, {
        cwd,
        json: opts.json ?? false,
        yes: opts.yes ?? false,
        dryRun: opts.dryRun ?? false,
        overwrite: opts.overwrite ?? false,
      } satisfies AddOptions);
      process.exit(exitCode);
    } catch (err) {
      handleError(err, opts.json ?? false);
    }
  });

cli.command('status', 'Check installed items').action((options: GlobalOptions) => {
  withCwd(options, () => {
    const opts = parseGlobalOptions(options);
    try {
      const exitCode = statusCommand({
        cwd: opts.cwd ?? '.',
        json: opts.json ?? false,
      } satisfies StatusOptions);
      process.exit(exitCode);
    } catch (err) {
      handleError(err, opts.json ?? false);
    }
  });
});

cli.help();
cli.version('0.0.0');

function handleError(err: unknown, json: boolean): void {
  const message = err instanceof Error ? err.message : String(err);
  if (json) {
    process.stdout.write(
      JSON.stringify({ ok: false, error: { code: 'UNEXPECTED_ERROR', message } }) + '\n',
    );
  } else {
    process.stderr.write(`Error: ${message}\n`);
  }
  process.exit(ExitCode.UNEXPECTED_ERROR);
}

try {
  cli.parse();
} catch (err) {
  handleError(err, false);
}
