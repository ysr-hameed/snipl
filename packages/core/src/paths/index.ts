import * as path from 'path';

export class PathSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathSafetyError';
  }
}

export function resolveOutputPath(
  projectRoot: string,
  outputDir: string,
  filePath: string,
): string {
  const resolved = path.resolve(projectRoot, outputDir, filePath);
  const root = path.resolve(projectRoot);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new PathSafetyError(`Path "${filePath}" escapes project root "${root}"`);
  }
  return resolved;
}

export function containsTraversal(filePath: string): boolean {
  const normalized = filePath.split(path.sep).join('/');
  const parts = normalized.split('/');
  let depth = 0;
  for (const part of parts) {
    if (part === '..') depth--;
    else if (part !== '.' && part !== '') depth++;
    if (depth < 0) return true;
  }
  return false;
}

export function isPathSafe(filePath: string): boolean {
  if (filePath.includes('\0')) return false;
  if (path.isAbsolute(filePath)) return false;
  if (containsTraversal(filePath)) return false;
  return true;
}
