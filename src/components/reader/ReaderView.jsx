import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useRsvpPlayer } from '@/hooks/useRsvpPlayer'
import { WordDisplay } from './WordDisplay'
import { ControlsBar } from '@/components/controls/ControlsBar'
import { Sun, Moon } from 'lucide-react'
import styles from './ReaderView.module.css'

export function ReaderView() {
  const { state, dispatch } = useApp()
  const { currentWord } = useRsvpPlayer()

  useKeyboard()

  const chapter = state.book?.chapters[state.chapterIndex]
  const toggleTheme = () =>
    dispatch({ type: ACTION.SET_THEME, payload: state.theme === 'dark' ? 'light' : 'dark' })

  return (
    <main className={styles.view}>
      {/* ── Fixed top header ──────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerMeta}>
            <p className={styles.bookTitle}>{state.book?.title}</p>
            <p className={styles.chapterTitle}>
              {chapter?.title ?? `Chapitre ${state.chapterIndex + 1}`}
            </p>
          </div>
          <button
            className={styles.headerBtn}
            onClick={toggleTheme}
            aria-label={state.theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={state.theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {state.theme === 'dark'
              ? <Sun size={18} aria-hidden="true" />
              : <Moon size={18} aria-hidden="true" />
            }
          </button>
        </div>
      </header>

      {/* ── RSVP word display ─────────────────────────────── */}
      <div className={styles.wordZone}>
        <WordDisplay word={currentWord} wordSize={state.wordSize} />
      </div>

      {/* ── Controls bar — fixed at bottom ────────────────── */}
      <ControlsBar />
    </main>
  )
}
