function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function messageFrom(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((part) => typeof part === "string")
  ) {
    return value.join(", ");
  }
  return undefined;
}

export function getErrorMessage(
  error: unknown,
  fallback = "The request could not be completed.",
): string {
  if (error instanceof Error && error.message) return error.message;

  const errorRecord = record(error);
  const dataRecord = record(errorRecord?.data);
  const responseError = record(dataRecord?.error);
  const candidates = [
    responseError?.message,
    dataRecord?.message,
    errorRecord?.message,
    errorRecord?.error,
  ];

  for (const candidate of candidates) {
    const message = messageFrom(candidate);
    if (message) return message;
  }

  return fallback;
}
