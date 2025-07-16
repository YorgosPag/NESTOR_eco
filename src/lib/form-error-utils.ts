
'use client';

type FormState = {
  message?: string | null;
  errors?: Record<string, string[] | undefined> | null;
  success: boolean;
};

interface ParseErrorsOptions {
  state: FormState | null;
  prefix?: string;
}

/**
 * Parses the form state to create a structured error object.
 * This helps distinguish between field-specific validation errors and global server errors.
 * @param {ParseErrorsOptions} options - The state from useActionState and an optional prefix.
 * @returns {Record<string, string[]>} A structured error object.
 */
export function parseFormErrors({ state, prefix = "" }: ParseErrorsOptions): Record<string, string[]> {
  if (!state || state.success) return {};
  
  const out: Record<string, string[]> = {};

  if (state.errors) {
    for (const [key, arr] of Object.entries(state.errors)) {
      if (arr) {
        out[key] = arr.map(msg => (prefix ? `${prefix}: ${msg}` : msg));
      }
    }
  }

  // Catch a generic server-side message only if there are no specific field errors.
  if (state.message && !Object.keys(out).length) {
    out["_global"] = [prefix ? `${prefix}: ${state.message}` : state.message];
  }
  
  return out;
}
