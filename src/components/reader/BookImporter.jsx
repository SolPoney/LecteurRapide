import { useRef, useCallback, useState } from 'react'
import { Upload, Sun, Moon, ClipboardPaste, FileText } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import { parseEpub } from '@/engine/epubParser'
import { parseTxt, parseText } from '@/engine/textParser'
import { parsePdf } from '@/engine/pdfParser'
import { saveBook, loadBook } from '@/utils/storage'
import styles from './BookImporter.module.css'

const TABS = [
  { id: 'file',  label: 'Fichier',       icon: FileText      },
  { id: 'paste', label: 'Coller du texte', icon: ClipboardPaste },
]

export function BookImporter() {
  const { state, dispatch } = useApp()
  const inputRef  = useRef(null)
  const [tab, setTab]       = useState('file')
  const [pasteText, setPasteText] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')

  const loadBook_ = (book) => {
    saveBook(book)
    dispatch({ type: ACTION.LOAD_BOOK, payload: book })
  }

  const handleFile = useCallback(async (file) => {
    if (!file) return
    const name = file.name.toLowerCase()

    dispatch({ type: ACTION.SET_LOADING, payload: true })
    dispatch({ type: ACTION.SET_ERROR,   payload: null  })

    try {
      let book
      if (name.endsWith('.epub')) {
        book = await parseEpub(file)
      } else if (name.endsWith('.txt')) {
        book = await parseTxt(file)
      } else if (name.endsWith('.pdf')) {
        book = await parsePdf(file)
      } else {
        dispatch({ type: ACTION.SET_LOADING, payload: false })
        dispatch({ type: ACTION.SET_ERROR, payload: 'Format non supporté. Utilisez un fichier .epub, .pdf ou .txt.' })
        return
      }
      loadBook_(book)
    } catch (err) {
      dispatch({ type: ACTION.SET_ERROR, payload: `Erreur : ${err.message}` })
    }
  }, [dispatch])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return
    dispatch({ type: ACTION.SET_ERROR, payload: null })
    try {
      const book = parseText(pasteText, pasteTitle.trim() || 'Texte collé')
      loadBook_(book)
    } catch (err) {
      dispatch({ type: ACTION.SET_ERROR, payload: `Erreur : ${err.message}` })
    }
  }

  const handleRestore = useCallback(() => {
    const saved = loadBook()
    if (saved) dispatch({ type: ACTION.LOAD_BOOK, payload: saved })
  }, [dispatch])

  const toggleTheme = () =>
    dispatch({ type: ACTION.SET_THEME, payload: state.theme === 'dark' ? 'light' : 'dark' })

  const hasSavedBook = !!loadBook()

  return (
    <main className={styles.container}>

      {/* ── Theme toggle ─────────────────────────────────── */}
      <button
        className={styles.themeBtn}
        onClick={toggleTheme}
        aria-label={state.theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {state.theme === 'dark'
          ? <Sun size={20} aria-hidden="true" />
          : <Moon size={20} aria-hidden="true" />
        }
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>LecteurRapide</h1>
        <p className={styles.subtitle}>Lecture RSVP — un mot à la fois</p>
      </header>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => { setTab(t.id); dispatch({ type: ACTION.SET_ERROR, payload: null }) }}
            >
              <Icon size={15} aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── File tab ─────────────────────────────────────── */}
      {tab === 'file' && (
        <div
          className={`${styles.dropZone} ${state.isLoading ? styles.loading : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          role="button"
          tabIndex={0}
          aria-label="Zone de dépôt de fichier"
          onClick={() => !state.isLoading && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".epub,.pdf,.txt"
            className={styles.hiddenInput}
            onChange={handleInputChange}
          />

          {state.isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} aria-hidden="true" />
              <p>Analyse en cours…</p>
            </div>
          ) : (
            <>
              <Upload className={styles.uploadIcon} size={44} strokeWidth={1.5} aria-hidden="true" />
              <p className={styles.dropLabel}>
                Déposez un fichier ici
              </p>
              <p className={styles.dropSub}>.epub · .pdf · .txt · cliquez pour parcourir</p>
            </>
          )}
        </div>
      )}

      {/* ── Paste tab ────────────────────────────────────── */}
      {tab === 'paste' && (
        <div className={styles.pasteZone}>
          <input
            type="text"
            className={styles.pasteTitle}
            placeholder="Titre (optionnel)"
            value={pasteTitle}
            onChange={(e) => setPasteTitle(e.target.value)}
            maxLength={100}
          />
          <textarea
            className={styles.pasteArea}
            placeholder="Collez votre texte ici…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            aria-label="Zone de texte à lire"
          />
          <button
            className={styles.pasteSubmit}
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
          >
            Lire ce texte
          </button>
        </div>
      )}

      {state.error && (
        <p className={styles.error} role="alert">{state.error}</p>
      )}

      {hasSavedBook && !state.isLoading && (
        <button className={styles.restoreBtn} onClick={handleRestore}>
          Reprendre la dernière lecture
        </button>
      )}

      <footer className={styles.shortcuts}>
        <p>
          <kbd>Espace</kbd> Play/Pause &nbsp;·&nbsp;
          <kbd>←</kbd><kbd>→</kbd> ±5 mots &nbsp;·&nbsp;
          <kbd>↑</kbd><kbd>↓</kbd> WPM
        </p>
      </footer>
    </main>
  )
}
