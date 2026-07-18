# slugify

Convert a string to a URL-friendly slug.

```ts
slugify(str: string, options?: SlugifyOptions): string
```

## API

```ts
interface SlugifyOptions {
  separator?: string; // default: '-'
  lower?: boolean; // default: true
  strict?: boolean; // default: true
}
```

## Examples

```ts
import { slugify } from './snippets/slugify.js';

slugify('Hello World'); // "hello-world"
slugify('Hello World', { lower: false }); // "Hello-World"
slugify('héllo wörld'); // "hello-world" (NFKD normalized)
slugify('Hello   World'); // "hello-world" (collapsed whitespace)
```

With `strict: false`, only non-alphanumeric characters are removed (spaces and `-` are kept):

```ts
slugify('Hello World!', { strict: false }); // "hello-world"
```

## Caveats

- NFKD normalization decomposes accented characters (é → e).
- Character removal is aggressive in strict mode — many Unicode characters are dropped.
- The separator character is escaped for RegExp safety, but unusual separators may produce unexpected results.
