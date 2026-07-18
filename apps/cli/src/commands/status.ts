import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { loadManifest, configExists } from '@snipl/core';
import { ExitCode } from '../exit-codes.js';
import { printJson, printJsonError } from '../renderers/json.js';

export interface StatusOptions {
  cwd: string;
  json: boolean;
}

export interface FileStatus {
  filePath: string;
  status: 'unchanged' | 'modified' | 'missing' | 'untracked';
  expectedSha256?: string;
}

export interface ItemStatus {
  name: string;
  version: string;
  registry: string;
  files: FileStatus[];
}

export function statusCommand(opts: StatusOptions): number {
  if (!configExists(opts.cwd)) {
    const msg = `No snippets.json found in ${opts.cwd}. Run \`snipl init\` first.`;
    if (opts.json) {
      printJsonError('NO_CONFIG', msg);
    } else {
      process.stderr.write(`  ${msg}\n`);
    }
    return ExitCode.UNEXPECTED_ERROR;
  }

  const manifest = loadManifest(opts.cwd);

  if (manifest.items.length === 0) {
    if (opts.json) {
      printJson({ items: [] });
    } else {
      process.stdout.write('  No items installed. Use `snipl add <name>` to install.\n');
    }
    return ExitCode.SUCCESS;
  }

  const itemStatuses: ItemStatus[] = [];

  for (const item of manifest.items) {
    const fileStatuses: FileStatus[] = [];

    for (const file of item.files) {
      const fullPath = path.resolve(opts.cwd, file.path);

      if (!fs.existsSync(fullPath)) {
        fileStatuses.push({ filePath: file.path, status: 'missing', expectedSha256: file.sha256 });
        continue;
      }

      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) {
        fileStatuses.push({ filePath: file.path, status: 'modified', expectedSha256: file.sha256 });
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const actualSha256 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');

      if (actualSha256 === file.sha256) {
        fileStatuses.push({
          filePath: file.path,
          status: 'unchanged',
          expectedSha256: file.sha256,
        });
      } else {
        fileStatuses.push({ filePath: file.path, status: 'modified', expectedSha256: file.sha256 });
      }
    }

    itemStatuses.push({
      name: item.name,
      version: item.version,
      registry: item.registry,
      files: fileStatuses,
    });
  }

  if (opts.json) {
    printJson({ items: itemStatuses });
    return ExitCode.SUCCESS;
  }

  let anyProblem = false;
  for (const itemStatus of itemStatuses) {
    process.stdout.write(`\n  ${itemStatus.name}@${itemStatus.version} (${itemStatus.registry})\n`);
    for (const file of itemStatus.files) {
      const icon = file.status === 'unchanged' ? '✓' : file.status === 'modified' ? '⚠' : '✗';
      process.stdout.write(`    ${icon} ${file.filePath} [${file.status}]\n`);
      if (file.status !== 'unchanged') anyProblem = true;
    }
  }

  if (!anyProblem) {
    process.stdout.write('\n  All installed items are unchanged.\n');
  }

  process.stdout.write('\n');
  return ExitCode.SUCCESS;
}
