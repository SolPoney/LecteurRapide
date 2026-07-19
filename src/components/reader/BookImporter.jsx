import { useRef, useCallback } from 'react'
import { Upload, Sun, Moon } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import { parseEpub } from '@/engine/epubParser'
import { saveBook, loadBook } from '@/utils/storage'
import styles from './BookImporter.module.css'

export function BookImporter() {
  const { state, dispatch } = useApp()
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      dispatch({ type: ACTION.SET_ERROR, payload: 'Veuillez sélectionner un fichier .epub valide.' })
      return
    }

    dispatch({ type: ACTION.SET_LOADING, payload: true })

    try {
      const book = await parseEpub(file)
      saveBook(book)
      dispatch({ type: ACTION.LOAD_BOOK, payload: book })
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

  const handleDragOver = (e) => e.preventDefault()

  const handleRestore = useCallback(() => {
    const saved = loadBook()
    if (saved) dispatch({ type: ACTION.LOAD_BOOK, payload: saved })
  }, [dispatch])

  const toggleTheme = () =>
    dispatch({ type: ACTION.SET_THEME, payload: state.theme === 'dark' ? 'light' : 'dark' })

  const hasSavedBook = !!loadBook()

  return (
    <main className={styles.container}>

      {/* ── Theme toggle — top-right ─────────────────────── */}
      <button
        className={styles.themeBtn}
        onClick={toggleTheme}
        aria-label={state.theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        title={state.theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
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

      {/* ── Drop zone ────────────────────────────────────── */}
      <div
        className={`${styles.dropZone} ${state.isLoading ? styles.loading : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt de fichier EPUB"
        onClick={() => !state.isLoading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".epub"
          className={styles.hiddenInput}
          onChange={handleInputChange}
          aria-label="Charger un fichier EPUB"
        />

        {state.isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Analyse du fichier EPUB…</p>
          </div>
        ) : (
          <>
            <Upload className={styles.uploadIcon} size={48} strokeWidth={1.5} aria-hidden="true" />
            <p className={styles.dropLabel}>
              Déposez votre fichier <strong>.epub</strong> ici
            </p>
            <p className={styles.dropSub}>ou cliquez pour parcourir</p>
          </>
        )}
      </div>

      {state.error && (
        <p className={styles.error} role="alert">{state.error}</p>
      )}

      {hasSavedBook && !state.isLoading && (
        <button className={styles.restoreBtn} onClick={handleRestore}>
          Reprendre la dernière lecture
        </button>
      )}

      {/* ── Shortcuts reminder ───────────────────────────── */}
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
