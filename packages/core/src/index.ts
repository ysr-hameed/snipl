export {
  loadConfig,
  writeConfig,
  configExists,
  findConfigPath,
  ConfigNotFoundError,
  ConfigValidationError,
  CONFIG_FILENAME,
} from './config/loader.js';
export type { ConfigLoader } from './config/loader.js';

export { BuiltinRegistryResolver } from './registry/resolver.js';
export type { RegistryResolver } from './registry/resolver.js';

export { buildWritePlan } from './install/plan.js';
export { executeWritePlan } from './install/writer.js';
export type { WritePlan, WritePlanEntry } from './install/plan.js';
export type { WriteResult } from './install/writer.js';

export {
  loadManifest,
  writeManifest,
  manifestExists,
  getInstalledItem,
  manifestPath,
} from './manifest/loader.js';

export {
  isPathSafe,
  containsTraversal,
  resolveOutputPath,
  PathSafetyError,
} from './paths/index.js';
