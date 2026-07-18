import * as fs from 'fs';
import * as path from 'path';
import type { SnippetConfig } from '@snipl/registry-schema';
import { writeConfig, configExists, findConfigPath, CONFIG_FILENAME } from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson, printJsonError } from '../renderers/json.js';

export interface InitOptions {
  cwd: string;
  output?: string;
  language?: 'ts' | 'js';
  yes: boolean;
  dryRun: boolean;
  json: boolean;
  overwrite: boolean;
}

function detectDefaultOutput(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'src'))) return 'src/snippets';
  return 'snippets';
}

export async function initCommand(opts: InitOptions): Promise<number> {
  const configPath = findConfigPath(opts.cwd);
  const exists = configExists(opts.cwd);

  if (exists && !opts.overwrite) {
    const msg = `${CONFIG_FILENAME} already exists. Use --overwrite to replace it.`;
    if (opts.json) {
      printJsonError('CONFIG_EXISTS', msg);
    } else {
      process.stderr.write(msg + '\n');
    }
    return ExitCode.INVALID_INPUT;
  }

  const defaultOutput = detectDefaultOutput(opts.cwd);
  const config: SnippetConfig = {
    output: opts.output ?? defaultOutput,
    language: opts.language ?? 'ts',
    registries: [{ name: 'official', source: 'builtin' }],
  };

  if (opts.json) {
    printJson(config);
    if (opts.dryRun) return ExitCode.SUCCESS;
    try {
      writeConfig(opts.cwd, config);
    } catch (err) {
      printJsonError('WRITE_ERROR', err instanceof Error ? err.message : String(err));
      return ExitCode.UNEXPECTED_ERROR;
    }
    return ExitCode.SUCCESS;
  }

  if (!opts.yes) {
    process.stdout.write(`\n  The following ${CONFIG_FILENAME} will be created:\n\n`);
    process.stdout.write(`  ${JSON.stringify(config, null, 4).split('\n').join('\n  ')}\n\n`);
  }

  if (opts.dryRun) {
    process.stdout.write('  (dry run — no files written)\n');
    return ExitCode.SUCCESS;
  }

  if (!opts.yes) {
    process.stdout.write('  Continue? [Y/n] ');
    const answer = await readYesNo();
    if (answer === false) {
      process.stdout.write('  Cancelled.\n');
      return ExitCode.USER_CANCELLATION;
    }
  }

  try {
    writeConfig(opts.cwd, config);
    process.stdout.write(`  ✓ Created ${configPath}\n`);
    return ExitCode.SUCCESS;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`  ✗ Failed to create config: ${message}\n`);
    return ExitCode.UNEXPECTED_ERROR;
  }
}

function readYesNo(): Promise<boolean> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setEncoding('utf-8');
    stdin.once('data', (data: string) => {
      const trimmed = data.trim().toLowerCase();
      if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
