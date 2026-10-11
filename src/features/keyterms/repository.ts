import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { keyterms } from '../../db/schema';
import { MAX_TERMS, TOO_MANY_TERMS, validateTerm } from './validate';

export type SaveResult = { ok: true } | { ok: false; error: string };

// All reads and writes of the keyterms table go through here.

export function listKeytermsQuery() {
  return db.select().from(keyterms).orderBy(asc(keyterms.term));
}

// True if another row already has this term, ignoring case ("kubernetes" = "Kubernetes").
async function isDuplicate(term: string, exceptId?: number) {
  const sameTerm = eq(sql`lower(${keyterms.term})`, term.toLowerCase());
  const rows = await db
    .select({ id: keyterms.id })
    .from(keyterms)
    .where(exceptId === undefined ? sameTerm : and(sameTerm, ne(keyterms.id, exceptId)))
    .limit(1);
  return rows.length > 0;
}

export async function addKeyterm(input: string): Promise<SaveResult> {
  const result = validateTerm(input);
  if (!result.ok) return result;
  if ((await db.$count(keyterms)) >= MAX_TERMS) return { ok: false, error: TOO_MANY_TERMS };
  if (await isDuplicate(result.term))
    return { ok: false, error: 'That word is already in the list.' };

  await db.insert(keyterms).values({ term: result.term });
  return { ok: true };
}

export async function renameKeyterm(id: number, input: string): Promise<SaveResult> {
  const result = validateTerm(input);
  if (!result.ok) return result;
  if (await isDuplicate(result.term, id)) {
    return { ok: false, error: 'That word is already in the list.' };
  }

  await db.update(keyterms).set({ term: result.term }).where(eq(keyterms.id, id));
  return { ok: true };
}

export async function removeKeyterm(id: number) {
  await db.delete(keyterms).where(eq(keyterms.id, id));
}
