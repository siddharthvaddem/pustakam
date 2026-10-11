export const MAX_TERM_LENGTH = 64;
// Moonshine has no hard limit, but it caps lists it builds itself at 200: a long
// list costs accuracy on all the words you didn't add.
export const MAX_TERMS = 200;
export const TOO_MANY_TERMS = `You can add up to ${MAX_TERMS} words. Remove one first.`;

export type ValidationResult = { ok: true; term: string } | { ok: false; error: string };

// Cleans up a term the user typed and checks it's something Moonshine can use.
// Duplicates are checked separately against the database (see repository.ts).
export function validateTerm(input: string): ValidationResult {
  const term = input.trim().replace(/\s+/g, ' ');

  if (!term) return { ok: false, error: 'Type a word first.' };
  // Moonshine uses commas to separate terms internally.
  if (term.includes(','))
    return { ok: false, error: 'Commas aren’t allowed. Add each word on its own.' };
  if (term.length > MAX_TERM_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_TERM_LENGTH} characters.` };
  }
  return { ok: true, term };
}
