export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getOptionalEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

export function ensureRequiredEnv(names: string[]) {
  for (const name of names) {
    getRequiredEnv(name);
  }
}
