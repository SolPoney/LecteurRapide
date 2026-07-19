import { tokenise } from './rsvp'

const WORDS_PER_CHAPTER = 600

/**
 * Parse a plain text string into the book format.
 * Splits into chapters of ~WORDS_PER_CHAPTER words each.
 *
 * @param {string} text
 * @param {string} title
 * @returns {{ title: string, author: string, chapters: { title: string, words: string[] }[] }}
 */
export function parseText(text, title = 'Texte sans titre') {
  const words = tokenise(text)

  if (words.length === 0) {
    throw new Error('Aucun mot trouvé dans le texte.')
  }

  const chapters = []
  for (let i = 0; i < words.length; i += WORDS_PER_CHAPTER) {
    const chunk = words.slice(i, i + WORDS_PER_CHAPTER)
    chapters.push({
      title: `Partie ${chapters.length + 1}`,
      words: chunk,
    })
  }

  return { title, author: '', chapters }
}

/**
 * Parse a .txt File object.
 *
 * @param {File} file
 */
export async function parseTxt(file) {
  const text = await file.text()
  const title = file.name.replace(/\.txt$/i, '')
  return parseText(text, title)
}
