export interface JsonEnvelope<T = unknown> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export function printJson<T>(data: T): void {
  const envelope: JsonEnvelope<T> = { ok: true, data };
  process.stdout.write(JSON.stringify(envelope) + '\n');
}

export function printJsonError(code: string, message: string): void {
  const envelope: JsonEnvelope = { ok: false, error: { code, message } };
  process.stdout.write(JSON.stringify(envelope) + '\n');
}
