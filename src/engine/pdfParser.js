import * as pdfjsLib from 'pdfjs-dist'
import { tokenise } from './rsvp'

// Worker en module ESM — Vite le bundle automatiquement
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const WORDS_PER_CHAPTER = 600

/**
 * Parse un fichier PDF (File object) en format livre RSVP.
 * Chaque page est lue, le texte extrait et découpé en chapitres.
 *
 * @param {File} file
 * @returns {Promise<{ title, author, chapters }>}
 */
export async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  // Extraire le texte de toutes les pages
  const pageTexts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text    = content.items.map(item => item.str).join(' ')
    pageTexts.push(text)
  }

  const fullText = pageTexts.join(' ')
  const words    = tokenise(fullText)

  if (words.length === 0) {
    throw new Error('Aucun texte extractible dans ce PDF. Il est peut-être scanné (image).')
  }

  // Découper en chapitres de WORDS_PER_CHAPTER mots
  const chapters = []
  for (let i = 0; i < words.length; i += WORDS_PER_CHAPTER) {
    chapters.push({
      title: `Partie ${chapters.length + 1}`,
      words: words.slice(i, i + WORDS_PER_CHAPTER),
    })
  }

  // Titre depuis les métadonnées ou le nom du fichier
  let title = file.name.replace(/\.pdf$/i, '')
  try {
    const meta = await pdf.getMetadata()
    if (meta?.info?.Title) title = meta.info.Title
  } catch (_) {}

  return { title, author: '', chapters }
}
