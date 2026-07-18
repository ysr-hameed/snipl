import * as fs from 'fs';
import * as path from 'path';
import type { WritePlan } from './plan.js';
import { writeManifest } from '../manifest/loader.js';
import type { Manifest, InstalledItem } from '@snipl/registry-schema';

export interface WriteResult {
  success: boolean;
  written: string[];
  failed: string[];
  restored: string[];
}

interface JournalEntry {
  originalPath: string;
  backupPath: string | null;
  originalExists: boolean;
}

export function executeWritePlan(plan: WritePlan, existingManifest: Manifest): WriteResult {
  const journal: JournalEntry[] = [];
  const written: string[] = [];
  const failed: string[] = [];
  const restored: string[] = [];

  if (plan.collisions.length > 0) {
    return {
      success: false,
      written: [],
      failed: plan.collisions.map((c) => `Collision: ${c}`),
      restored: [],
    };
  }

  const tempDir = path.join(plan.projectRoot, '.snipl', '.tmp-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    for (const entry of plan.entries) {
      const journalEntry: JournalEntry = {
        originalPath: entry.targetPath,
        backupPath: null,
        originalExists: fs.existsSync(entry.targetPath),
      };

      if (journalEntry.originalExists) {
        const backupPath = path.join(tempDir, path.basename(entry.targetPath) + '.bak');
        fs.copyFileSync(entry.targetPath, backupPath);
        journalEntry.backupPath = backupPath;
      }

      journal.push(journalEntry);
    }

    for (const entry of plan.entries) {
      try {
        fs.mkdirSync(path.dirname(entry.targetPath), { recursive: true });
        const tmpPath = entry.targetPath + '.snipl-tmp';
        fs.writeFileSync(tmpPath, entry.content, 'utf-8');
        fs.renameSync(tmpPath, entry.targetPath);
        written.push(entry.targetPath);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        failed.push(`${entry.targetPath}: ${msg}`);
      }
    }

    if (failed.length > 0) {
      for (const jEntry of journal) {
        if (written.includes(jEntry.originalPath)) continue;
        if (jEntry.originalExists && jEntry.backupPath && fs.existsSync(jEntry.backupPath)) {
          try {
            fs.copyFileSync(jEntry.backupPath, jEntry.originalPath);
            restored.push(jEntry.originalPath);
          } catch {
            // best-effort restore
          }
        }
      }

      cleanupTempDir(tempDir);
      return { success: false, written, failed, restored };
    }

    const installedItem: InstalledItem = {
      registry: plan.registry,
      name: plan.itemName,
      version: plan.itemVersion,
      installedAt: new Date().toISOString(),
      files: plan.entries.map((e) => ({
        path: path.relative(plan.projectRoot, e.targetPath),
        sha256: e.expectedSha256,
      })),
    };

    const updatedManifest: Manifest = {
      schemaVersion: 1,
      items: [
        ...existingManifest.items.filter(
          (i) => !(i.name === plan.itemName && i.registry === plan.registry),
        ),
        installedItem,
      ],
    };

    writeManifest(plan.projectRoot, updatedManifest);
    cleanupTempDir(tempDir);
    return { success: true, written, failed: [], restored: [] };
  } catch (err) {
    cleanupTempDir(tempDir);
    return {
      success: false,
      written,
      failed: [err instanceof Error ? err.message : String(err)],
      restored,
    };
  }
}

function cleanupTempDir(dir: string): void {
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      fs.rmSync(path.join(dir, entry), { force: true });
    }
    fs.rmdirSync(dir);
  } catch {
    // best-effort cleanup
  }
}
