# clamp

Clamp a number within a specified range.

```ts
clamp(value: number, min: number, max: number): number
```

## Examples

```ts
import { clamp } from './snippets/clamp.js';

clamp(5, 0, 10); // 5
clamp(-1, 0, 10); // 0
clamp(15, 0, 10); // 10
clamp(NaN, 0, 10); // NaN
```

## Edge cases

| Input          | Result                 |
| -------------- | ---------------------- |
| `value < min`  | `min`                  |
| `value > max`  | `max`                  |
| `min > max`    | `max` — no auto-swap   |
| `NaN` any arg  | `NaN`                  |
| `Infinity`     | clamped to `min`/`max` |
| non-number arg | throws `TypeError`     |
