import * as fs from 'fs';
import * as crypto from 'crypto';
import type { RegistryItem } from '@snipl/registry-schema';
import { resolveOutputPath, isPathSafe, PathSafetyError } from '../paths/index.js';

export interface WritePlanEntry {
  type: 'create' | 'overwrite';
  targetPath: string;
  content: string;
  expectedSha256: string;
}

export interface WritePlan {
  projectRoot: string;
  itemName: string;
  itemVersion: string;
  registry: string;
  outputDir: string;
  entries: WritePlanEntry[];
  collisions: string[];
}

export function buildWritePlan(
  item: RegistryItem,
  projectRoot: string,
  outputDir: string,
  opts?: { overwrite?: boolean },
): WritePlan {
  const entries: WritePlanEntry[] = [];
  const collisions: string[] = [];

  for (const file of item.files) {
    if (!isPathSafe(file.path)) {
      throw new PathSafetyError(`Item "${item.name}" has unsafe path "${file.path}"`);
    }

    const fileSha256 = crypto.createHash('sha256').update(file.content, 'utf-8').digest('hex');
    if (fileSha256 !== file.sha256) {
      throw new PathSafetyError(
        `Content hash mismatch for "${file.path}": expected ${file.sha256}, computed ${fileSha256}`,
      );
    }

    const targetPath = resolveOutputPath(projectRoot, outputDir, file.path);
    const exists = fs.existsSync(targetPath);

    if (exists) {
      if (!opts?.overwrite) {
        collisions.push(targetPath);
        continue;
      }
      entries.push({
        type: 'overwrite',
        targetPath,
        content: file.content,
        expectedSha256: fileSha256,
      });
    } else {
      entries.push({
        type: 'create',
        targetPath,
        content: file.content,
        expectedSha256: fileSha256,
      });
    }
  }

  return {
    projectRoot,
    itemName: item.name,
    itemVersion: item.version,
    registry: 'official',
    outputDir,
    entries,
    collisions,
  };
}
