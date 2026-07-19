/**
 * LecteurRapide — RSVP Engine
 *
 * Pure functions with no side effects.
 * All testable in isolation with Vitest.
 */

// ── ORP (Optimal Recognition Point) ─────────────────────────────────────────

/**
 * Returns the 0-based index of the pivot letter for a given word.
 * Based on the Spritz method: ~30% from the start, biased toward
 * the left half of the word for rapid visual recognition.
 *
 * @param {string} word - The word to analyse (punctuation may be attached)
 * @returns {number} 0-based pivot letter index
 */
export function getOrpIndex(word) {
  // Strip non-alpha chars for length computation only
  const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  const len = clean.length || word.length

  if (len <= 2) return 0   // 1–2  chars → pivot 0
  if (len <= 6) return 1   // 3–6  chars → pivot 1
  if (len <= 8) return 2   // 7–8  chars → pivot 2
  if (len <= 12) return 3  // 9–12 chars → pivot 3
  return 4                 // 13+  chars → pivot 4
}

/**
 * Splits a word into [before, pivot, after] around the ORP index.
 *
 * @param {string} word
 * @returns {{ before: string, pivot: string, after: string }}
 */
export function splitWordAtOrp(word) {
  const idx = getOrpIndex(word)
  return {
    before: word.slice(0, idx),
    pivot:  word.slice(idx, idx + 1),
    after:  word.slice(idx + 1),
  }
}

// ── WPM ↔ delay conversion ───────────────────────────────────────────────────

const STRONG_PUNCTUATION = /[.,!?;:]$/
const WEAK_PUNCTUATION   = /[-–—]$/

/**
 * Converts WPM to the base interval in milliseconds between words.
 *
 * @param {number} wpm - Words per minute (100–2000)
 * @returns {number} milliseconds
 */
export function wpmToMs(wpm) {
  if (wpm <= 0) throw new RangeError('WPM must be > 0')
  return Math.round(60_000 / wpm)
}

/**
 * Returns the display delay in ms for a word, applying punctuation multipliers.
 *
 * @param {string} word
 * @param {number} wpm
 * @returns {number} milliseconds to display this word
 */
export function getWordDelay(word, wpm) {
  const base = wpmToMs(wpm)

  if (STRONG_PUNCTUATION.test(word)) {
    return Math.round(base * 1.8) // pause after sentence / clause boundary
  }
  if (WEAK_PUNCTUATION.test(word)) {
    return Math.round(base * 1.2) // slight pause for soft breaks
  }
  return base
}

// ── Word array helpers ───────────────────────────────────────────────────────

/**
 * Tokenises a raw text string into individual word tokens.
 * Preserves punctuation attached to words.
 *
 * @param {string} text
 * @returns {string[]}
 */
// Patterns to skip during tokenisation
const URL_PATTERN     = /^https?:\/\/|^www\./i
const ONLY_PUNCT      = /^[^\p{L}\p{N}]+$/u   // only punctuation / symbols, no letter/digit
const SINGLE_SPECIAL  = /^[_\-–—·•◆▸►\|\/\\@#%^*+=<>~`]+$/

export function tokenise(text) {
  return text
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => {
      if (!w) return false
      if (URL_PATTERN.test(w)) return false      // skip URLs
      if (ONLY_PUNCT.test(w)) return false       // skip punctuation-only tokens
      if (SINGLE_SPECIAL.test(w)) return false   // skip special-char sequences
      if (w.length > 40) return false            // skip pathologically long tokens
      return true
    })
}

// ── Navigation index helpers ─────────────────────────────────────────────────

/**
 * Clamps a word index within valid bounds.
 *
 * @param {number} index
 * @param {number} maxIndex - inclusive maximum (words.length - 1)
 * @returns {number}
 */
export function clampIndex(index, maxIndex) {
  return Math.min(maxIndex, Math.max(0, index))
}

/**
 * Advances the word index, returning updated chapterIndex and wordIndex.
 * Handles chapter boundaries.
 *
 * @param {{ chapterIndex: number, wordIndex: number }} position
 * @param {{ words: string[] }[]} chapters
 * @param {number} delta - number of words to advance (negative = rewind)
 * @returns {{ chapterIndex: number, wordIndex: number }}
 */
export function advancePosition({ chapterIndex, wordIndex }, chapters, delta) {
  let chapter = chapterIndex
  let word    = wordIndex + delta

  // Forward: move to next chapters
  while (word >= chapters[chapter]?.words.length && chapter < chapters.length - 1) {
    word -= chapters[chapter].words.length
    chapter++
  }

  // Backward: move to previous chapters
  while (word < 0 && chapter > 0) {
    chapter--
    word += chapters[chapter].words.length
  }

  const maxWord = (chapters[chapter]?.words.length ?? 1) - 1
  return {
    chapterIndex: Math.min(chapters.length - 1, Math.max(0, chapter)),
    wordIndex:    Math.min(maxWord, Math.max(0, word)),
  }
}
