/**
 * @fileOverview Text utility functions for search normalization.
 */

const singleCharMap: {[key: string]: string} = {
  a: 'α',
  v: 'β',
  g: 'γ',
  d: 'δ',
  e: 'ε',
  z: 'ζ',
  h: 'η',
  i: 'ι',
  k: 'κ',
  l: 'λ',
  m: 'μ',
  n: 'ν',
  x: 'ξ',
  o: 'ο',
  p: 'π',
  r: 'ρ',
  s: 'σ',
  t: 'τ',
  y: 'υ',
  u: 'υ',
  f: 'φ',
  w: 'ω',
};

/**
 * Converts a string from Greeklish (Greek written with Latin characters) to Greek.
 * This is a simplified transliteration optimized for search functionality.
 * @param text The Greeklish text.
 * @returns The converted Greek text.
 */
function greeklishToGreek(text: string): string {
  let result = text.toLowerCase();

  // Replace digraphs first to avoid conflicts (e.g., 'th' before 't' and 'h')
  result = result.replace(/th/g, 'θ');
  result = result.replace(/ch|kh/g, 'χ');
  result = result.replace(/ps/g, 'ψ');
  result = result.replace(/ks/g, 'ξ'); // handle ks before k and s
  result = result.replace(/ph/g, 'φ');

  let finalResult = '';
  for (const char of result) {
    finalResult += singleCharMap[char] || char;
  }

  return finalResult;
}

/**
 * Normalizes a Greek string for searching. It converts to lowercase, removes diacritics (accents),
 * and replaces final sigma (ς) with a regular one (σ).
 * @param text The text to normalize.
 * @returns The normalized text.
 */
function normalizeGreek(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ς/g, 'σ');
}

/**
 * Prepares a string for smart searching by handling Greek, Greeklish, and diacritics.
 * It transforms the input into a consistent, accent-free, Greek character format.
 * @param str The string to process.
 * @returns A fully normalized string ready for comparison.
 */
export function normalizeForSearch(str: string): string {
  if (!str) return '';
  // First, assume it could be Greeklish and convert it.
  // Then, normalize the result to handle any actual Greek characters that were already there
  // or were just converted.
  const greeklishAttempt = greeklishToGreek(str);
  return normalizeGreek(greeklishAttempt);
}
