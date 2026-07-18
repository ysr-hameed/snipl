import { z } from 'zod';

const registrySourceSchema = z.object({
  name: z.string().min(1).max(50),
  source: z.enum(['builtin']),
});

export const SnippetConfigSchema = z.object({
  $schema: z.string().url().optional(),
  output: z.string().min(1).max(500).default('src/snippets'),
  language: z.enum(['ts', 'js']).default('ts'),
  registries: z
    .array(registrySourceSchema)
    .min(1)
    .default([{ name: 'official', source: 'builtin' }]),
});

export type SnippetConfig = z.infer<typeof SnippetConfigSchema>;
