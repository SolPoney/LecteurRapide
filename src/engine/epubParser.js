import ePub from 'epubjs'
import { tokenise } from './rsvp'

/**
 * Parses an EPUB file (File object from <input type="file">).
 *
 * Returns:
 * { title, author, chapters: [{ title, words: string[] }] }
 *
 * @param {File} file
 * @returns {Promise<{ title: string, author: string, chapters: { title: string, words: string[] }[] }>}
 */
export async function parseEpub(file) {
  const arrayBuffer = await file.arrayBuffer()
  const book = ePub(arrayBuffer)

  // Wait for full initialization — spine must be loaded
  await book.ready
  await book.loaded.spine

  const metadata = await book.loaded.metadata
  const title  = metadata?.title  || file.name.replace(/\.epub$/i, '')
  const author = metadata?.creator || 'Auteur inconnu'

  const chapters = []
  const spine = book.spine

  // spine.get(i) returns Section instances reliably (with .load method)
  // spine.length is set by unpack()
  for (let i = 0; i < spine.length; i++) {
    const section = spine.get(i)
    if (!section) continue

    try {
      // Use book.load(href) directly — avoids section.load() loader binding issues
      // book.load() reads from the internal JSZip archive and returns a Document
      const doc = await book.load(section.href)
      if (!doc) continue

      const text = extractText(doc)
      const words = tokenise(text)
      if (words.length === 0) continue

      chapters.push({
        title: section.label || `Chapitre ${chapters.length + 1}`,
        words,
      })
    } catch (err) {
      console.warn(`[EPUB] Section ${i} (${section.href}) ignorée :`, err.message)
    }
  }

  if (chapters.length === 0) {
    // Fallback — try spineItems directly if spine.get() failed
    return parseViaSpineItems(book, file, title, author)
  }

  return { title, author, chapters }
}

/**
 * Fallback parser using spine.spineItems and section.load().
 */
async function parseViaSpineItems(book, file, title, author) {
  const chapters = []
  const sections = book.spine.spineItems ?? []

  for (const section of sections) {
    try {
      const doc = await section.load(book.load.bind(book))
      const text = extractText(doc)
      section.unload()

      const words = tokenise(text)
      if (words.length === 0) continue

      chapters.push({
        title: section.label || `Chapitre ${chapters.length + 1}`,
        words,
      })
    } catch (err) {
      console.warn(`[EPUB-FB] Section (${section.href}) ignorée :`, err.message)
    }
  }

  if (chapters.length === 0) {
    throw new Error(
      'Aucun contenu textuel trouvé. Vérifiez que le fichier est un EPUB valide et non DRM-protégé.'
    )
  }

  return { title, author, chapters }
}

/**
 * Extracts readable plain text from a parsed Document.
 * Uses cloneNode to avoid mutating the original.
 *
 * @param {Document} doc
 * @returns {string}
 */
/**
 * Extracts readable plain text from a parsed Document.
 * Strips navigation, scripts, styles, and link-heavy sections.
 *
 * @param {Document} doc
 * @returns {string}
 */
function extractText(doc) {
  if (!doc) return ''

  const root = doc.body ?? doc.documentElement
  if (!root) return ''

  try {
    const clone = root.cloneNode(true)

    // Remove all non-reading elements
    clone.querySelectorAll([
      'script',
      'style',
      'nav',
      'head',
      'a[href^="http"]',    // external links (often navigation/metadata)
      '[epub\\:type="toc"]',
      '[epub\\:type="nav"]',
      '[epub\\:type="landmarks"]',
      '[role="doc-toc"]',
      '.toc',
      '#toc',
    ].join(', ')).forEach(el => el.remove())

    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
  } catch {
    return (root.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
}
