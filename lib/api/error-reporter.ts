type ErrorReporter = (error: unknown) => void;

let reporter: ErrorReporter | null = null;

export function setGlobalErrorReporter(nextReporter: ErrorReporter | null) {
  reporter = nextReporter;
}

export function reportGlobalError(error: unknown) {
  reporter?.(error);
}
