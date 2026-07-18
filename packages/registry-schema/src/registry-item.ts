import { z } from 'zod';
import {
  kebabCaseString,
  semverString,
  sha256Hex,
  relativePosixPath,
  nonEmptyString,
} from './strings.js';
import { SPDX_ALLOW_LIST } from './spdx.js';

const MAX_TAGS = 20;
const MAX_FILES = 50;
const MAX_TESTS = 20;
const MAX_CAVEATS = 20;
const MAX_EXPORTS = 30;
const MAX_CONTENT_BYTES = 100_000;

const exportSchema = z.object({
  name: z.string().min(1).max(100),
  kind: z.enum(['function', 'type', 'class']),
});

const fileSchema = z.object({
  path: relativePosixPath,
  content: nonEmptyString.max(MAX_CONTENT_BYTES, 'Content exceeds size limit'),
  sha256: sha256Hex,
});

const licenseSchema = z.object({
  spdx: z.enum(SPDX_ALLOW_LIST),
  source: z.enum(['original', 'derived']),
  attribution: z.string().min(1).max(500).optional(),
});

const testFileSchema = z.object({
  path: relativePosixPath,
  content: nonEmptyString.max(MAX_CONTENT_BYTES),
});

const docsSchema = z.object({
  usage: nonEmptyString.max(10_000),
  caveats: z.array(nonEmptyString.max(2000)).max(MAX_CAVEATS),
});

export const RegistryItemSchema = z
  .object({
    schemaVersion: z.literal(1),
    name: kebabCaseString,
    version: semverString,
    summary: nonEmptyString.max(200),
    tags: z.array(z.string().min(1).max(50)).max(MAX_TAGS),
    language: z.enum(['ts', 'js']),
    environments: z.array(z.enum(['browser', 'node', 'universal'])).min(1),
    exports: z.array(exportSchema).max(MAX_EXPORTS),
    files: z.array(fileSchema).min(1).max(MAX_FILES),
    dependencies: z.tuple([]).describe('MVP invariant: no dependencies allowed'),
    templateVariables: z.tuple([]).describe('MVP invariant: no template variables'),
    license: licenseSchema,
    tests: z.array(testFileSchema).max(MAX_TESTS),
    docs: docsSchema,
  })
  .superRefine((data, ctx) => {
    const seenPaths = new Set<string>();
    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i];
      if (file && seenPaths.has(file.path)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate file path: ${file.path}`,
          path: ['files', i, 'path'],
          params: { code: 'DUPLICATE_FILE_PATH' },
        });
      }
      seenPaths.add(file!.path);
    }
  })
  .superRefine((data, ctx) => {
    if (data.license.source === 'derived' && !data.license.attribution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Attribution is required when license source is "derived"',
        path: ['license', 'attribution'],
        params: { code: 'ATTRIBUTION_REQUIRED' },
      });
    }
  });

export type RegistryItem = z.infer<typeof RegistryItemSchema>;
