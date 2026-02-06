export function logCron(event: string, data: Record<string, unknown> = {}): void {
  const ts = new Date().toISOString();
  console.log(JSON.stringify({ ts, event, ...data }));
}

export function logCronError(event: string, err: unknown, data: Record<string, unknown> = {}): void {
  const ts = new Date().toISOString();
  const message = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ ts, event, level: "error", message, ...data }));
}
