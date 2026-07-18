export interface SlugifyOptions {
  separator?: string;
  lower?: boolean;
  strict?: boolean;
}

export function slugify(str: string, options?: SlugifyOptions): string {
  const { separator = '-', lower = true, strict = true } = options ?? {};
  let result = str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  if (lower) result = result.toLowerCase();
  if (strict) {
    result = result.replace(/[^a-z0-9\s-]/g, '');
    result = result.replace(/[^a-z0-9]/g, separator);
  } else {
    result = result.replace(/[^a-z0-9\s-]/g, '');
  }
  result = result.trim().replace(/\s+/g, separator);
  const escaped = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const multiSep = new RegExp(`${escaped}+`, 'g');
  const edgeSep = new RegExp(`^${escaped}|${escaped}$`, 'g');
  result = result.replace(multiSep, separator).replace(edgeSep, '');
  return result;
}
