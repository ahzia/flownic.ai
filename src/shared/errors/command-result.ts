export type CommandResult<T> =
  | { ok: true; data: T; requestId: string }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable: boolean;
        fieldErrors?: Record<string, string[]>;
      };
      requestId: string;
    };

export function ok<T>(data: T, requestId: string): CommandResult<T> {
  return { ok: true, data, requestId };
}

export function fail<T = never>(
  requestId: string,
  code: string,
  message: string,
  options?: { retryable?: boolean; fieldErrors?: Record<string, string[]> },
): CommandResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: options?.retryable ?? false,
      fieldErrors: options?.fieldErrors,
    },
    requestId,
  };
}

export function newRequestId(): string {
  return crypto.randomUUID();
}
