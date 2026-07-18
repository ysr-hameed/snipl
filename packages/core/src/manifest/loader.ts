import * as fs from 'fs';
import * as path from 'path';
import { ManifestSchema } from '@snipl/registry-schema';
import type { Manifest, InstalledItem } from '@snipl/registry-schema';

const MANIFEST_DIR = '.snipl';
const MANIFEST_FILENAME = 'manifest.json';

export function manifestPath(projectRoot: string): string {
  return path.join(projectRoot, MANIFEST_DIR, MANIFEST_FILENAME);
}

export function manifestExists(projectRoot: string): boolean {
  return fs.existsSync(manifestPath(projectRoot));
}

export function loadManifest(projectRoot: string): Manifest {
  const filePath = manifestPath(projectRoot);
  if (!fs.existsSync(filePath)) {
    return { schemaVersion: 1, items: [] };
  }
  const raw: unknown = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const result = ManifestSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid manifest: ${result.error.message}`);
  }
  return result.data;
}

export function writeManifest(projectRoot: string, manifest: Manifest): void {
  const dir = path.join(projectRoot, MANIFEST_DIR);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, MANIFEST_FILENAME);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.renameSync(tmpPath, filePath);
}

export function getInstalledItem(
  projectRoot: string,
  name: string,
  registry: string,
): InstalledItem | null {
  const manifest = loadManifest(projectRoot);
  return manifest.items.find((i) => i.name === name && i.registry === registry) ?? null;
}
