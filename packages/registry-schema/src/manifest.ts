import { z } from 'zod';
import { kebabCaseString, semverString, sha256Hex, relativePosixPath } from './strings.js';

const MAX_MANIFEST_ITEMS = 200;

const installedFileSchema = z.object({
  path: relativePosixPath,
  sha256: sha256Hex,
});

export const InstalledItemSchema = z.object({
  registry: kebabCaseString,
  name: kebabCaseString,
  version: semverString,
  installedAt: z.string().datetime(),
  files: z.array(installedFileSchema).min(1),
});

export type InstalledItem = z.infer<typeof InstalledItemSchema>;

export const ManifestSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(InstalledItemSchema).max(MAX_MANIFEST_ITEMS).default([]),
});

export type Manifest = z.infer<typeof ManifestSchema>;
