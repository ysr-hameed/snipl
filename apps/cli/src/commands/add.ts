import type { RegistryResolver } from '@snipl/core';
import {
  loadConfig,
  buildWritePlan,
  executeWritePlan,
  loadManifest,
  configExists,
} from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson, printJsonError } from '../renderers/json.js';
import { printWritePlan, printWriteResult } from '../renderers/human.js';

export interface AddOptions {
  cwd: string;
  json: boolean;
  yes: boolean;
  dryRun: boolean;
  overwrite: boolean;
}

export async function addCommand(
  resolver: RegistryResolver,
  name: string,
  opts: AddOptions,
): Promise<number> {
  const item = resolver.getByName(name);

  if (!item) {
    const msg = `Item "${name}" not found.`;
    if (opts.json) {
      printJsonError('ITEM_NOT_FOUND', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.INVALID_INPUT;
  }

  if (!configExists(opts.cwd)) {
    const msg = `No snippets.json found in ${opts.cwd}. Run \`snipl init\` first.`;
    if (opts.json) {
      printJsonError('NO_CONFIG', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.UNEXPECTED_ERROR;
  }

  const config = loadConfig(opts.cwd);
  const outputDir = config.output;

  const manifest = loadManifest(opts.cwd);
  const existing = manifest.items.find((i) => i.name === item.name);
  if (existing) {
    const msg = `"${item.name}" is already installed. Run \`snipl status\` to check its state.`;
    if (opts.json) {
      printJsonError('ALREADY_INSTALLED', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.INVALID_INPUT;
  }

  let plan;
  try {
    plan = buildWritePlan(item, opts.cwd, outputDir, { overwrite: opts.overwrite });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.json) {
      printJsonError('PLAN_ERROR', message);
    } else {
      process.stderr.write(`  Error: ${message}\n`);
    }
    return ExitCode.INTEGRITY_FAILURE;
  }

  if (plan.collisions.length > 0 && !opts.overwrite) {
    const msg =
      'The following files already exist. Use --overwrite to replace them:\n' +
      plan.collisions.join('\n');
    if (opts.json) {
      printJsonError('COLLISION', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.INVALID_INPUT;
  }

  if (opts.json) {
    if (opts.dryRun) {
      printJson({ plan: plan.entries.map((e) => ({ type: e.type, targetPath: e.targetPath })) });
      return ExitCode.SUCCESS;
    }
    const result = executeWritePlan(plan, manifest);
    if (result.success) {
      printJson({ installed: item.name, files: result.written });
    } else {
      printJsonError(
        'INSTALL_FAILED',
        `Written: ${result.written.length}, Failed: ${result.failed.length}`,
      );
    }
    return result.success ? ExitCode.SUCCESS : ExitCode.UNEXPECTED_ERROR;
  }

  printWritePlan(plan, item);

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

  const result = executeWritePlan(plan, manifest);
  printWriteResult(result, item.name);

  return result.success ? ExitCode.SUCCESS : ExitCode.UNEXPECTED_ERROR;
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
