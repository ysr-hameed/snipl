import * as fs from 'fs';
import * as path from 'path';
import { SnippetConfigSchema, safeParse, ValidationError } from '@snipl/registry-schema';
import type { SnippetConfig } from '@snipl/registry-schema';

const CONFIG_FILENAME = 'snippets.json';

export interface ConfigLoader {
  findConfigPath(projectRoot: string): string;
  loadConfig(projectRoot: string): SnippetConfig;
  writeConfig(projectRoot: string, config: SnippetConfig): void;
  configExists(projectRoot: string): boolean;
}

export function findConfigPath(projectRoot: string): string {
  return path.join(projectRoot, CONFIG_FILENAME);
}

export function loadConfig(projectRoot: string): SnippetConfig {
  const configPath = findConfigPath(projectRoot);
  if (!fs.existsSync(configPath)) {
    throw new ConfigNotFoundError(projectRoot);
  }
  const raw: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const result = safeParse(SnippetConfigSchema, raw);
  if (!result.success) {
    throw new ConfigValidationError(result.errors);
  }
  return result.data as SnippetConfig;
}

export function writeConfig(projectRoot: string, config: SnippetConfig): void {
  const configPath = findConfigPath(projectRoot);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

export function configExists(projectRoot: string): boolean {
  return fs.existsSync(findConfigPath(projectRoot));
}

export class ConfigNotFoundError extends Error {
  public readonly projectRoot: string;
  constructor(projectRoot: string) {
    super(`snippets.json not found in ${projectRoot}. Run \`snipl init\` first.`);
    this.name = 'ConfigNotFoundError';
    this.projectRoot = projectRoot;
  }
}

export class ConfigValidationError extends Error {
  public readonly errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    const messages = errors.map((e) => `[${e.code}] ${e.path}: ${e.message}`).join('; ');
    super(`Invalid snippets.json: ${messages}`);
    this.name = 'ConfigValidationError';
    this.errors = errors;
  }
}

export { CONFIG_FILENAME };
